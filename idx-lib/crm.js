/**
 * The website's only door to the CRM's listing API (contract v1, 21 Oct 2026:
 * docs/website-listing-api.md in the CRM repo). Server side only: the browser
 * never calls the CRM's /api/idx.
 *
 * Settings (Cloudflare Pages -> Settings -> Variables and Secrets):
 *   IDX_LIVE            "1" turns the listing search on. Anything else: /homes/*
 *                       is a 404, the homes strips stay empty, the header keeps
 *                       its old search pop-up.
 *   IDX_API_SECRET      the production key (encrypted, Production env only).
 *   IDX_DEV_KEY         the development key, in .dev.vars on Devin's machine only.
 *                       Never in the Pages Preview env (preview URLs are public).
 *   CRM_URL             optional, default https://app.chapter3realty.com
 *   TURNSTILE_SITE_KEY  the public Turnstile site key for the sign-up form.
 *   IDX_PREVIEW_WORD    optional: /homes/?idxpreview=<word> once shows the pages
 *                       while IDX_LIVE is off (noindex).
 *   IDX_INDEX_LISTINGS  optional, "1" lets search engines index single listings.
 *
 * Caching (contract §4): only answers to calls made WITHOUT a token, only a 200
 * with ok: true, keyed by the exact CRM URL, at most 10 minutes (the sitemap an
 * hour). A call with a token is never cached.
 */
import { TERMS_VERSION } from "./terms.js";

export const COOKIE = "c3_idx";
export const PREVIEW_COOKIE = "c3_idx_preview";
export const ORIGINS = ["https://chapter3realty.com", "https://www.chapter3realty.com"];

export function crmBase(env) {
  // Only an https host: a wrong setting must never send the key elsewhere or in the clear.
  const u = (env.CRM_URL || "").replace(/\/+$/, "");
  return /^https:\/\/[a-z0-9.-]+$/i.test(u) ? u : "https://app.chapter3realty.com";
}

function key(env) {
  return env.IDX_API_SECRET || env.IDX_DEV_KEY || "";
}

export function readCookie(request, name) {
  const all = request.headers.get("Cookie") || "";
  for (const part of all.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) {
      try { return decodeURIComponent(part.slice(i + 1)); } catch { return null; }
    }
  }
  return null;
}

/** The payload of a token (not secret; the CRM checks the signature). */
export function tokenPayload(token) {
  try {
    const b64 = token.split(".")[0].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(b64 + "===".slice((b64.length + 3) % 4)));
  } catch {
    return null;
  }
}

/**
 * The visitor's token, or null. Signed out when the cookie is missing, malformed,
 * past expiresAt, or for terms other than the current ones (new terms need no CRM
 * change: bump TERMS_VERSION and everyone accepts again).
 */
export function visitorToken(request) {
  const t = readCookie(request, COOKIE);
  if (!t || t.length > 1500 || !/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t)) return null;
  const p = tokenPayload(t);
  if (!p || typeof p.expiresAt !== "number" || p.expiresAt * 1000 <= Date.now()) return null;
  if (p.termsVersion !== TERMS_VERSION) return null;
  return t;
}

export const clearCookie = () => `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
/* A year (contract §7a, since 25 Oct 2026; it was 90 days). */
export const setCookie = (token) => `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Lax`;

/** Is the search on for this request: live, or the owner's preview cookie? */
export function idxOn(env, request) {
  if (env.IDX_LIVE === "1") return { on: true, preview: false };
  const word = env.IDX_PREVIEW_WORD;
  if (word && readCookie(request, PREVIEW_COOKIE) === word) return { on: true, preview: true };
  return { on: false, preview: false };
}

/** Only our own origins may post to /homes/api/* (contract §10). */
export function sameOrigin(request) {
  const o = request.headers.get("origin");
  if (!o) return false;
  if (ORIGINS.includes(o)) return true;
  // Local development (wrangler pages dev) only: the request's own origin on localhost.
  const own = new URL(request.url).origin;
  return o === own && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(own);
}

/**
 * GET or POST the CRM. path is built by the caller from parameters it validated.
 * opts: { method, body, token (string|null|undefined = read the cookie), anonymous,
 *         cacheSeconds, timeoutMs (default 8000) }. Returns { status, json, retryAfter }.
 * A network failure or a timeout reads as { status: 502, json: null }; a non-JSON
 * answer keeps its status with json: null.
 */
export async function crm(env, request, path, opts = {}) {
  if (!key(env)) return { status: 503, json: { ok: false, error: "switched_off" } };
  const method = opts.method || "GET";
  const token = opts.anonymous ? null : opts.token !== undefined ? opts.token : visitorToken(request);
  const url = `${crmBase(env)}${path}`;
  const cacheable = !token && method === "GET";
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const cacheKey = cacheable && cache ? new Request(`https://chapter3realty.com/__idx-cache/${encodeURIComponent(url)}`) : null;
  if (cacheKey) {
    const hit = await cache.match(cacheKey);
    if (hit) return { status: 200, json: await hit.json() };
  }
  const headers = {
    "x-idx-key": key(env),
    "x-idx-client-ip": request.headers.get("cf-connecting-ip") || "",
    accept: "application/json",
  };
  if (token) headers.authorization = `Bearer ${token}`;
  if (opts.userAgent) headers["x-idx-user-agent"] = (request.headers.get("user-agent") || "").slice(0, 400);
  if (opts.body) headers["content-type"] = "application/json";
  /* A GET that fails at the network or with a 502, 503 or 504 is tried once more (2026-10-29: a listing
     page showed "back soon" during a short CRM hiccup). opts.retry: false turns it off for bulk callers. */
  let res;
  const once = () => fetch(url, { method, headers, body: opts.body ? JSON.stringify(opts.body) : undefined, signal: AbortSignal.timeout(opts.timeoutMs || 8000) });
  const retry = method === "GET" && opts.retry !== false;
  try {
    res = await once();
    if (retry && [502, 503, 504].includes(res.status)) { await new Promise((r) => setTimeout(r, 300)); res = await once(); }
  } catch {
    if (!retry) return { status: 502, json: null };
    try { res = await once(); } catch { return { status: 502, json: null }; }
  }
  let json = null;
  try {
    json = await res.json();
  } catch {
    return { status: res.status === 200 ? 502 : res.status, json: null, retryAfter: res.headers.get("retry-after") };
  }
  if (cacheKey && res.status === 200 && json && json.ok === true) {
    const seconds = Math.min(opts.cacheSeconds || 600, 3600);
    await cache.put(cacheKey, new Response(JSON.stringify(json), { headers: { "content-type": "application/json", "cache-control": `public, max-age=${seconds}` } }));
  }
  return { status: res.status, json, retryAfter: res.headers.get("retry-after") };
}
