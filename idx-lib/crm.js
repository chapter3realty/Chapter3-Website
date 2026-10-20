/**
 * The website's only door to the CRM's listing API (CRM Ticket 404).
 *
 * Settings (Cloudflare Pages -> Settings -> Variables and Secrets):
 *   IDX_LIVE           "1" turns the listing pages on. Anything else: /homes/*
 *                      is a 404 and no "Homes near" blocks appear. The switch.
 *   IDX_API_SECRET     the same value as IDX_API_SECRET in the CRM (Railway).
 *   CRM_URL            optional, default https://app.chapter3realty.com
 *   IDX_PREVIEW_WORD   optional: visit /homes/?idxpreview=<word> once to see
 *                      the pages while IDX_LIVE is off (they stay noindex).
 *   IDX_INDEX_LISTINGS optional, "1" lets search engines index single-listing
 *                      pages. Off by default: every IDX site carries the same
 *                      listings, so they are thin, duplicate pages. The search
 *                      page and the "homes near" place pages are indexed.
 *
 * Public answers are cached at the edge for 10 minutes under a key on our own
 * domain, so crawlers and busy pages never reach the CRM's small database.
 * A registered visitor's answers are never cached.
 */

export const COOKIE = "c3_idx";
export const PREVIEW_COOKIE = "c3_idx_preview";
const CACHE_SECONDS = 600;

export function crmBase(env) {
  return (env.CRM_URL || "https://app.chapter3realty.com").replace(/\/+$/, "");
}

export function readCookie(request, name) {
  const all = request.headers.get("Cookie") || "";
  for (const part of all.split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
  }
  return null;
}

export function visitorToken(request) {
  const t = readCookie(request, COOKIE);
  return t && /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(t) && t.length < 1000 ? t : null;
}

/** Is the search on for this request: live, or the owner's preview cookie? */
export function idxOn(env, request) {
  if (env.IDX_LIVE === "1") return { on: true, preview: false };
  const word = env.IDX_PREVIEW_WORD;
  if (word && readCookie(request, PREVIEW_COOKIE) === word) return { on: true, preview: true };
  return { on: false, preview: false };
}

/**
 * GET or POST the CRM. Returns { status, json }. A network failure or a non-JSON
 * answer reads as { status: 502, json: null }; the page then says the search
 * is unavailable rather than showing anything stale.
 */
export async function crm(env, request, path, opts = {}) {
  if (!env.IDX_API_SECRET) return { status: 503, json: null };
  const token = opts.anonymous ? null : visitorToken(request);
  const cacheable = !token && (opts.method || "GET") === "GET";
  const cacheKey = new Request(`https://chapter3realty.com/__idx-cache${path}`);
  const cache = typeof caches !== "undefined" ? caches.default : null;
  if (cacheable && cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return { status: hit.status, json: await hit.json() };
  }
  const headers = {
    "x-idx-key": env.IDX_API_SECRET,
    "x-idx-client-ip": request.headers.get("cf-connecting-ip") || "",
    "x-idx-user-agent": (request.headers.get("user-agent") || "").slice(0, 400),
    accept: "application/json",
  };
  if (token) headers.authorization = `Bearer ${token}`;
  if (opts.body) headers["content-type"] = "application/json";
  let res;
  try {
    res = await fetch(`${crmBase(env)}${path}`, {
      method: opts.method || "GET",
      headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    });
  } catch {
    return { status: 502, json: null };
  }
  let json = null;
  try {
    json = await res.json();
  } catch {
    return { status: 502, json: null };
  }
  // Cache only public, successful (or not-found) answers.
  if (cacheable && cache && (res.status === 200 || res.status === 404) && (!json || json.tier !== "registered")) {
    const copy = new Response(JSON.stringify(json), {
      status: res.status,
      headers: { "content-type": "application/json", "cache-control": `public, max-age=${CACHE_SECONDS}` },
    });
    await cache.put(cacheKey, copy);
  }
  return { status: res.status, json };
}
