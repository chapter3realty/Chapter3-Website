/**
 * chapter3realty.com/homes/* : the listing search (CRM contract v1, 21 Oct 2026).
 *
 *   /homes/                      search (indexed when unfiltered)
 *   /homes/<MLS#>                301 to the listing's own URL (the CRM's emails use this form)
 *   /homes/<MLS#>-<street>/      one listing (noindex unless IDX_INDEX_LISTINGS=1)
 *   /homes/near/<place>/         homes in a community on our guide pages (idx-lib/places.js)
 *   /homes/terms/                the listing search terms of use
 *   POST /homes/api/register     sign-up; sets the c3_idx cookie
 *   POST /homes/api/views        seconds on a listing page (sendBeacon)
 *   POST /homes/api/hearts       save or unsave a home
 *   POST /homes/api/signout      clears the cookie (a form button, same origin only)
 *
 * Off until IDX_LIVE=1 (idx-lib/crm.js). Pages are drawn into the stitched shell
 * /homes-shell/, which carries the site's own header, footer and assets.
 */
import { COOKIE as COOKIE_NAME, PREVIEW_COOKIE, clearCookie, crm, idxOn, sameOrigin, setCookie, visitorToken } from "../../idx-lib/crm.js";
import { PLACES } from "../../idx-lib/places.js";
import { NO_HOA_NOTE, placeParams } from "../../idx-lib/edge.js";
import { CITIES, readQuery } from "../../idx-lib/query.js";
import { featureLabel, featureList, catalogLoaded, isDistance } from "../../idx-lib/features.js";
import { filterCatalog, panelGroups } from "../../idx-lib/catalog.js";
import { filterBar, labels as filterLabels } from "../../idx-lib/filters.js";
import { postFilter, rankHomes } from "../../idx-lib/feeds.js";
import { photo, photoUrl, warm } from "../../idx-lib/photo.js";
import { DEALS_SCRIPT, FLIP_DEFAULTS, findFlips, flipSettings } from "../../idx-lib/deals.js";
import { MAP_SCRIPT, MAP_STYLE, geocode, mapsKey, nearOf, pinOf, withPoints } from "../../idx-lib/map.js";
import { SMS_CONSENT_TEXT, TERMS_PARAGRAPHS, TERMS_TITLE, TERMS_VERSION, termsText } from "../../idx-lib/terms.js";
import {
  ICONS, PHOTO_HINT, STRIP_STYLE, STYLE, SCRIPT, addressLine, card, dayLong, disclaimer, esc, factsLine, grid, headlinePrice, heartButton,
  listingPath, money, safeUrl, signupDialog, welcomeDialog, spaced, statusWord, stripCard, tourButton, tourDialog,
} from "../../idx-lib/render.js";

const SITE = "https://chapter3realty.com";
const PHONE = "(854) 333-2135";
const TYPES = [["", "Any type"], ["house", "House"], ["condo", "Condo"], ["townhouse", "Townhouse"], ["manufactured", "Manufactured"], ["multi", "2 to 4 units"], ["land", "Land"]];
// CITIES comes from idx-lib/query.js, so the search box and the town filter agree.
const PRICES = [100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000, 600000, 750000, 1000000, 1500000, 2000000];
const DETAIL_LABELS = [
  ["PropertyCondition", "Condition"], ["NewConstructionYN", "New construction"], ["StoriesTotal", "Stories"], ["Levels", "Levels"],
  ["BathroomsFull", "Full baths"], ["BathroomsHalf", "Half baths"], ["LotSizeDimensions", "Lot dimensions"], ["LotFeatures", "Lot"],
  ["WaterfrontFeatures", "Waterfront type"], ["View", "View"], ["InteriorFeatures", "Interior"], ["Appliances", "Appliances"],
  ["Flooring", "Flooring"], ["FireplaceYN", "Fireplace"], ["Heating", "Heating"], ["Cooling", "Cooling"], ["ExteriorFeatures", "Exterior"],
  ["PatioAndPorchFeatures", "Patio and porch"], ["PoolPrivateYN", "Private pool"], ["PoolFeatures", "Pool"], ["ParkingFeatures", "Parking"],
  ["GarageSpaces", "Garage spaces"], ["ConstructionMaterials", "Construction"], ["Roof", "Roof"], ["FoundationDetails", "Foundation"],
  ["WaterSource", "Water"], ["Sewer", "Sewer"], ["Utilities", "Utilities"], ["CommunityFeatures", "Community"], ["AssociationYN", "HOA"],
  ["AssociationFee", "HOA fee"], ["AssociationFeeFrequency", "HOA fee frequency"], ["AssociationFeeIncludes", "HOA fee includes"],
  ["AssociationAmenities", "HOA amenities"], ["SeniorCommunityYN", "55+ community"], ["FloodZone", "Flood zone"],
  ["TaxAnnualAmount", "Annual property tax"], ["TaxYear", "Tax year"], ["ElementarySchool", "Elementary school"],
  ["MiddleOrJuniorSchool", "Middle school"], ["HighSchool", "High school"], ["SchoolDistrict", "School district"],
];

export async function onRequest(context) {
  // Never Cloudflare's error page: anything unexpected is our own "try again" page.
  try { return await handle(context); } catch (e) {
    console.error("homes:", e && e.stack ? e.stack : e);
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Homes for sale | Chapter3 Realty</title></head><body style="font-family:system-ui,sans-serif;max-width:34rem;margin:4rem auto;padding:0 1rem;line-height:1.5"><h1>This page did not load</h1><p>Please try again in a minute. <a href="/homes/">Search homes for sale</a>, or call ${PHONE}.</p></body></html>`, { status: 503, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "retry-after": "60" } });
  }
}

async function handle(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (env.IDX_PREVIEW_WORD && url.searchParams.get("idxpreview") === env.IDX_PREVIEW_WORD) {
    url.searchParams.delete("idxpreview");
    return new Response(null, { status: 302, headers: { Location: url.pathname + url.search, "Set-Cookie": `${PREVIEW_COOKIE}=${encodeURIComponent(env.IDX_PREVIEW_WORD)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax` } });
  }
  const gate = idxOn(env, request);
  if (!gate.on) return notFound(context);

  // Listing photos, sized and kept 30 days (idx-lib/photo.js).
  if (path === "/homes/p/card" || path === "/homes/p/big") return photo(context, url, path.slice(9));
  if (path.startsWith("/homes/api/")) {
    const name = path.replace(/^\/homes\/api\/|\/$/g, "");
    if (name === "map" && (request.method === "GET" || request.method === "HEAD")) return mapData(context, url);
    if (name === "deals" && request.method === "GET") return dealsApi(context, url);
    // The photo warmer's call (idx-lib/photo.js): a page of homes for sale, 24 at a time, from the CRM.
    if (name === "warm" && request.method === "GET") return warm(context, url, async (pg) => {
      const r = await crm(env, request, `/api/idx/listings?status=active&size=24&page=${pg}`, { anonymous: true });
      return r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.listings) ? { total: typeof r.json.total === "number" ? r.json.total : r.json.listings.length, listings: r.json.listings } : null;
    });
    if (name === "lookup" && request.method === "GET") return lookup(context, url);
    if (name === "similar" && request.method === "GET") return similar(context, url);
    if (name === "strip" && request.method === "GET") return stripApi(context, url);
    if (name === "filters" && request.method === "GET") return filtersApi(context);
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
    if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
    if (name === "signout") return new Response(null, { status: 303, headers: { Location: "/homes/", "Set-Cookie": clearCookie(), "Cache-Control": "no-store" } });
    if (!(request.headers.get("content-type") || "").includes("application/json")) return json({ ok: false, error: "invalid_body" }, 400);
    if (name === "register") return register(context);
    if (name === "claim") return claimApi(context);
    if (name === "returning") return returning(context);
    if (name === "views") return views(context);
    if (name === "hearts") return hearts(context);
    return json({ ok: false, error: "not_found" }, 404);
  }
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });

  try {
    if (url.searchParams.has("k")) return await withClaim(context, url, path, gate);
    return await route(context, url, path, gate);
  } catch {
    return trouble(context, gate, null, "Grand Strand homes for sale");
  }
}

// ── returning clients (contract §7g) ────────────────────────────────────────

const K = /^[A-Za-z0-9]{12}$/;

/** POST the CRM's claim. Returns the CRM's answer, or null on any trouble. */
async function postClaim(context, body) {
  const r = await crm(context.env, context.request, "/api/idx/claim", { method: "POST", anonymous: true, userAgent: true, body });
  return r;
}

/**
 * A /homes page whose address carries our emails' sign-in code. A visitor with a valid
 * cookie is left alone. Otherwise the code asks the CRM for a token: with one, the page is
 * drawn signed in and the cookie set; when the CRM needs the terms first, the page opens a
 * "Welcome back" box. Whatever the answer, the page takes k out of the address bar before
 * analytics loads, and nothing about it is cached.
 */
async function withClaim(context, url, path, gate) {
  const k = url.searchParams.get("k") || "";
  // A redirect keeps k for the page it leads to; only that page claims. A listing's address
  // may 301 (a bare MLS number, an old slug) or may not (a withheld address has no slug), so
  // a listing is drawn first and claims only when it is the page itself.
  const claimable = path.endsWith("/") && K.test(k) && !visitorToken(context.request);
  const listing = /^\/homes\/[A-Za-z0-9]{3,20}(-[a-z0-9-]{1,120})?\/$/.test(path) && !/^\/homes\/(terms|near|api|map)\/$/i.test(path);
  let res = claimable && listing ? await route(context, url, path, gate) : null;
  let cookie = null, welcome = null;
  if (claimable && !(res && res.status >= 300 && res.status < 400)) {
    const r = await postClaim(context, { k, page: path });
    if (r.status === 200 && r.json && r.json.ok && typeof r.json.token === "string") {
      cookie = setCookie(r.json.token);
      const h = new Headers(context.request.headers);
      h.set("Cookie", `${h.get("Cookie") ? `${h.get("Cookie")}; ` : ""}${COOKIE_NAME}=${encodeURIComponent(r.json.token)}`);
      res = await route({ ...context, request: new Request(context.request.url, { method: "GET", headers: h }) }, url, path, gate);
    } else if (r.status === 200 && r.json && r.json.ok && r.json.needsTerms) {
      welcome = { k, firstName: typeof r.json.firstName === "string" ? r.json.firstName.slice(0, 40) : null };
    }
  }
  if (!res) res = await route(context, url, path, gate);
  const headers = new Headers(res.headers);
  headers.set("cache-control", "private, no-store");
  if (cookie) headers.append("set-cookie", cookie);
  if (!(headers.get("content-type") || "").includes("text/html")) return new Response(res.body, { status: res.status, headers });
  let html = await res.text();
  html = html.replace(/<head([^>]*)>/, (m) => `${m}${STRIP_K}`);
  // At the top of <body>: the page script runs as soon as it is read and looks for the box then.
  if (welcome) html = html.replace(/<body([^>]*)>/, (m) => `${m}${welcomeDialog(welcome)}`);
  headers.delete("content-length");
  return new Response(html, { status: res.status, headers });
}

/* First thing in <head>, before any analytics tag: the code leaves the address bar. */
const STRIP_K = `<script>try{var u=new URL(location.href);if(u.searchParams.has("k")){u.searchParams.delete("k");history.replaceState(history.state,"",u.pathname+u.search+u.hash)}}catch(e){}</script>`;

async function claimApi(context) {
  const { request } = context;
  // Bodies up to 48 KB, as the sign-up (contract §10).
  const { body: b, tooLarge } = await readBody(request, 48 * 1024);
  if (tooLarge) return json({ ok: false, error: "too_large" }, 413);
  if (!b || typeof b !== "object" || !K.test(String(b.k || ""))) return json({ ok: false, error: "link_expired" });
  if (visitorToken(request)) return json({ ok: true, already: true });
  if (b.termsAccepted !== true) return json({ ok: false, field: "termsAccepted", message: FIELD_WORDS.termsAccepted }, 400);
  const page = typeof b.page === "string" && b.page.startsWith("/homes") ? b.page.slice(0, 200) : "/homes/";
  const r = await postClaim(context, { k: b.k, termsAccepted: true, termsVersion: TERMS_VERSION, termsText: termsText(), page });
  if (r.status === 200 && r.json && r.json.ok && typeof r.json.token === "string") return json({ ok: true }, 200, { "set-cookie": setCookie(r.json.token) });
  if (r.status === 400 && r.json && r.json.error === "invalid") return json({ ok: false, field: r.json.field, message: fieldWord(context.env, r.json.field) }, 400);
  return json({ ok: false, error: "link_expired" });
}

async function returning(context) {
  const { request } = context;
  const { body: b, tooLarge } = await readBody(request, 48 * 1024);
  if (tooLarge) return json({ ok: false, error: "too_large" }, 413);
  if (!b || typeof b !== "object") return json({ ok: false, error: "invalid_body" }, 400);
  if (visitorToken(request)) return json({ ok: true, already: true });
  const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  const r = await crm(context.env, request, "/api/idx/returning", {
    method: "POST", anonymous: true, userAgent: true,
    body: { phone: str(b.phone, 40), firstName: str(b.firstName, 80), termsAccepted: b.termsAccepted === true, termsVersion: TERMS_VERSION, termsText: termsText(), turnstileToken: str(b.turnstileToken, 4096), page: typeof b.page === "string" && b.page.startsWith("/homes") ? b.page.slice(0, 200) : "/homes/" },
  });
  if (r.status === 200 && r.json && r.json.ok && typeof r.json.token === "string") return json({ ok: true }, 200, { "set-cookie": setCookie(r.json.token) });
  if (r.status === 200 && r.json && r.json.error === "not_found") return json({ ok: false, notFound: true });
  if (r.status === 400 && r.json && r.json.error === "invalid") return json({ ok: false, field: r.json.field, message: fieldWord(context.env, r.json.field) }, 400);
  if (r.status === 429) return json({ ok: false, message: "Too many tries, please wait a minute." }, 429);
  return json({ ok: false, message: `Sign-in is unavailable right now. Please call ${PHONE}.` }, 503);
}

async function route(context, url, path, gate) {
  // /homes/<MLS#> as the CRM's emails write it: find the listing's own URL.
  // "terms", "near" and "api" are our own pages, never MLS numbers.
  const bare = /^\/homes\/([A-Za-z0-9]{3,20})\/?$/.exec(path);
  if (bare && !["terms", "near", "api", "map", "deals"].includes(bare[1].toLowerCase())) return bareListing(context, bare[1], gate);
  if (!path.endsWith("/")) return Response.redirect(`${SITE}${path}/${url.search}`, 301);

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 1) return searchPage(context, url, gate);
  if (parts[1] === "map" && parts.length === 2) return mapPage(context, url, gate);
  if (parts[1] === "terms" && parts.length === 2) return termsPage(context, gate);
  if (parts[1] === "deals" && parts.length === 2) return dealsPage(context, gate);
  if (parts[1] === "near" && parts.length === 3) return placePage(context, parts[2], gate);
  const m = /^([A-Za-z0-9]{3,20})-[a-z0-9-]{1,120}$/.exec(parts[1] || "");
  if (m && parts.length === 2) return listingPage(context, m[1], parts[1], gate);
  return notFound(context);
}

// ── helpers ─────────────────────────────────────────────────────────────────

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store", ...extra } });

async function notFound(context) {
  const res = await context.env.ASSETS.fetch(new Request(new URL("/404.html", context.request.url)));
  return new Response(res.body, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
}

async function readBody(request, limit) {
  if (Number(request.headers.get("content-length") || 0) > limit) return { tooLarge: true };
  const t = await request.text();
  if (t.length > limit) return { tooLarge: true };
  try { return { body: JSON.parse(t) }; } catch { return { body: null }; }
}

const crumbs = (items) => `<nav class="hx-crumbs" aria-label="Breadcrumb">${items.map(([h, l]) => (h ? `<a href="${h}">${esc(l)}</a>` : `<span>${esc(l)}</span>`)).join(" / ")}</nav>`;
const signupPrompt = (what) => `<div class="hx-signup-cta"><p><strong>${esc(what)}</strong></p><p class="hx-small">Free with your name, email and phone: every photo, the description, HOA fees, taxes, days on market and recent sales, and a heart to save homes.</p><button type="button" class="btn btn-brass" data-hx-signup>See full details</button></div>`;
const signedBar = (tier) => (tier === "registered" ? `<div class="hx-small">You are signed up and see full listing details. <form method="post" action="/homes/api/signout" class="hx-signout"><button type="submit">Sign out</button></form></div>` : "");

/** The shell with the page drawn in. */
async function page(context, gate, o) {
  const { env, request } = context;
  const shell = await (await env.ASSETS.fetch(new Request(new URL("/homes-shell/", request.url)))).text();
  const full = `${o.title} | Chapter3 Realty`;
  const robots = gate.preview ? "noindex, nofollow" : o.robots;
  const signed = !context.signedOut && Boolean(visitorToken(request));
  const ld = o.ld ? `<script type="application/ld+json">${JSON.stringify(o.ld).replace(/</g, "\\u003c")}</script>` : "";
  const html = shell
    .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(full)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(o.description)}">`)
    .replace(/<meta name="robots" content="[^"]*">/, () => `<meta name="robots" content="${robots}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, () => `<link rel="canonical" href="${esc(o.canonical)}">`)
    .replace(/(<meta property="og:title" content=")[^"]*/, (_, a) => a + esc(full))
    .replace(/(<meta property="og:description" content=")[^"]*/, (_, a) => a + esc(o.description))
    .replace(/(<meta property="og:url" content=")[^"]*/, (_, a) => a + esc(o.canonical))
    .replace("</head>", () => `${PHOTO_HINT}${STYLE}${o.extraHead || ""}${ld}</head>`)
    .replace(/<body([^>]*)>/, (mm, a) => `<body${a} data-hx-signed="${signed ? "1" : "0"}">`)
    .replace(/<div class="wrap hx-wrap" id="hx-root">[\s\S]*?<\/div>/, () => `<div class="wrap hx-wrap" id="hx-root"${o.rootAttrs || ""}>${o.body}</div>`)
    .replace("</body>", () => `${o.extraBody || ""}${signupDialog(env.TURNSTILE_SITE_KEY)}${tourDialog()}${SCRIPT}</body>`);
  const headers = new Headers({ "content-type": "text/html; charset=utf-8", "x-robots-tag": robots });
  headers.set("cache-control", signed || gate.preview || o.private ? "private, no-store" : "public, max-age=300");
  return new Response(html, { status: o.status || 200, headers });
}

/** The CRM said no: say why in plain words, and show no listings (contract §3, CCMLS 16.7). */
function trouble(context, gate, r, title) {
  const e = (r && r.json && r.json.error) || "unavailable";
  const msg = e === "stale" ? "The listing search is being refreshed. Please try again in a few minutes."
    : e === "rate_limited" || (r && r.status === 429) ? "Too many tries, please wait a minute."
    : `The listing search is back soon. Call ${PHONE} and an agent will run the search for you.`;
  return page(context, gate, { title, description: "Grand Strand homes for sale from the Coastal Carolinas MLS, with Chapter3 Realty.", canonical: `${SITE}/homes/`, robots: "noindex, follow", status: r && r.status === 429 ? 429 : 503, private: true, body: `<h1>${esc(title)}</h1><p class="hx-lead">${esc(msg)}</p>` });
}

/** The CRM refused the visitor's token (contract §6): forget it and show the public view. */
const badToken = (r) => r.status === 401 || Boolean(r.json && r.json.visitor === "invalid");

async function publicView(context, render) {
  const res = await render({ ...context, signedOut: true });
  const h = new Headers(res.headers);
  h.append("set-cookie", clearCookie());
  h.set("cache-control", "private, no-store");
  return new Response(res.body, { status: res.status, headers: h });
}

async function heartsOf(context) {
  if (!visitorToken(context.request)) return [];
  const r = await crm(context.env, context.request, "/api/idx/hearts");
  return r.status === 200 && r.json && r.json.ok ? r.json.hearts || [] : [];
}

// ── search ──────────────────────────────────────────────────────────────────

function select(name, label, options, current) {
  const on = current !== null && current !== undefined && current !== "";
  return `<label class="hx-chip${on ? " hx-on" : ""}"><span class="hx-vh">${esc(label)}</span><select name="${name}" aria-label="${esc(label)}">${options.map(([v, t]) => `<option value="${esc(v)}"${String(current ?? "") === String(v) ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
}

/** The visitor's filters, validated; anything else is dropped (contract §3: never pass a query through). */
/**
 * The search as the CRM reads it: homes for sale only unless the reader asked for those under contract
 * too (owner, 2026-10-26: "we want homes for sale to be shown"), never with a sold search, and without
 * the site's own "all". The page's links keep the reader's words; only the call adds status.
 */
function forCrm(p) {
  const x = new URLSearchParams(p);
  if (x.get("all") !== "1" && x.get("sold") !== "1") x.set("status", "active");
  x.delete("all");
  return x;
}

function searchParams(q, signed) {
  const p = new URLSearchParams();
  const city = q.get("city");
  if (city && CITIES.includes(city)) p.set("city", city);
  const zip = q.get("zip");
  if (zip && /^\d{5}$/.test(zip)) p.set("zip", zip);
  const type = q.get("type");
  if (type && TYPES.some(([v]) => v && v === type)) p.set("type", type);
  for (const k of ["min", "max", "sqft"]) { const v = q.get(k); if (v && /^\d{1,9}$/.test(v)) p.set(k, v); }
  const beds = q.get("beds");
  if (beds && /^\d{1,2}$/.test(beds) && +beds <= 20) p.set("beds", beds);
  const baths = q.get("baths");
  if (baths && /^\d{1,2}(\.5)?$/.test(baths)) p.set("baths", baths);
  if (q.get("waterfront") === "1") p.set("waterfront", "1");
  // No HOA (contract §5, CRM ticket 415) and homes near a point, as the article feeds link them.
  if (q.get("hoa") === "0") p.set("hoa", "0");
  // The filter bar's HOA select, when the form is sent with no script: 0 is no HOA, else a cap.
  const pick = q.get("hoaPick");
  if (pick === "0") p.set("hoa", "0");
  else if (pick && /^\d{1,6}$/.test(pick) && !q.get("hoaMax")) p.set("hoaMax", pick);
  const n = nearOf(q.get("near"), q.get("miles"));
  if (n) { p.set("near", n.near); p.set("miles", n.miles); }
  const sub = (q.get("subdivision") || "").trim();
  if (/^[A-Za-z0-9 .,'&()\/-]{2,80}$/.test(sub)) p.set("subdivision", sub);
  // The MLS features and ranges (CRM branch website/idx-filters; an older CRM ignores them).
  // At most 2 distance features in one search, has and not together (contract §5).
  const hasKeys = featureList(q.getAll("has"));
  const notKeys = featureList(q.getAll("not"), hasKeys.filter(isDistance).length);
  if (hasKeys.length) p.set("has", hasKeys.join(","));
  if (notKeys.length) p.set("not", notKeys.join(","));
  for (const [name, lo, hi] of [["yearMin", 1800, 2100], ["yearMax", 1800, 2100], ["hoaMax", 0, 100000], ["garage", 1, 10], ["domMax", 0, 10000]]) {
    const v = q.get(name); if (v && /^\d{1,6}$/.test(v) && +v >= lo && +v <= hi) p.set(name, v);
  }
  const lot = q.get("lotMin"); if (lot && /^\d{1,4}(\.\d{1,3})?$/.test(lot)) p.set("lotMin", lot);
  // "Also show homes under contract" (all=1). Without it every search is homes for sale only (forCrm).
  if (q.get("all") === "1") p.set("all", "1");
  if (signed && q.get("sold") === "1") p.set("sold", "1");
  const sort = q.get("sort");
  if (sort && (["newest", "price_asc", "price_desc"].includes(sort) || (sort === "nearest" && n))) p.set("sort", sort);
  const pg = q.get("page");
  if (pg && /^\d{1,3}$/.test(pg)) p.set("page", String(Math.min(100, Math.max(1, +pg))));
  return p;
}

const TYPE_WORD = Object.fromEntries(TYPES.filter(([v]) => v));
const title = (v) => String(v).toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
/** The filters in force, each with the search that is left when it is removed: [{ t, x }]. */
function chipList(p) {
  const label = { all: () => "With homes under contract", city: (v) => v, zip: (v) => v, type: (v) => TYPE_WORD[v], min: (v) => `From ${money(+v)}`, max: (v) => `Up to ${money(+v)}`,
    beds: (v) => `${v}+ beds`, baths: (v) => `${v}+ baths`, sqft: (v) => `${(+v).toLocaleString("en-US")}+ sq ft`, waterfront: () => "Waterfront", subdivision: (v) => title(v), sold: () => "Sold",
    hoa: () => "No HOA", near: () => `Within ${p.get("miles")} miles`,
    yearMin: (v) => `Built ${v}+`, yearMax: (v) => `Built by ${v}`, lotMin: (v) => `${v}+ acres`, hoaMax: (v) => `HOA up to ${money(+v)}`, garage: (v) => `${v}+ car garage`,
    domMax: (v) => `Listed in the last ${v} days`, status: () => "For sale only" };
  const out = [...p.keys()].filter((k) => label[k]).map((k) => {
    const x = new URLSearchParams(p); x.delete(k); x.delete("page"); x.delete("size"); if (k === "near") { x.delete("miles"); if (x.get("sort") === "nearest") x.delete("sort"); }
    return { t: label[k](p.get(k)), x: x.toString() };
  });
  for (const name of ["has", "not"]) for (const key of (p.get(name) || "").split(",").filter(Boolean)) {
    const x = new URLSearchParams(p); x.delete("page"); x.delete("size");
    const rest = (p.get(name) || "").split(",").filter((y) => y && y !== key);
    if (rest.length) x.set(name, rest.join(",")); else x.delete(name);
    out.push({ t: `${name === "not" ? "No " : ""}${featureLabel(key)}`, x: x.toString() });
  }
  return out;
}

/** The filters in force, each a chip that removes itself. */
function appliedChips(p, base = "/homes/") {
  const chips = chipList(p).map((c) => `<a class="hx-applied-chip" href="${esc(`${base}${c.x ? `?${c.x}` : ""}`)}" aria-label="Remove ${esc(c.t)}">${esc(c.t)}<span aria-hidden="true">&times;</span></a>`);
  return chips.length ? `<div class="hx-applied">${chips.join("")}<a class="hx-clear" href="${base}">Clear all</a></div>` : "";
}

/** What each pill of the bar says for this search (the map page redraws them after a search). */
function pillLabels(p) {
  const L = filterLabels(p);
  return { sale: p.get("all") === "1" ? "With under contract" : "", price: L.price, beds: L.bb, type: L.type, more: L.more };
}

async function searchPage(context, url, gate, anonymous = false) {
  const q = url.searchParams;
  await filterCatalog(context.env, context.request);
  // Plain words in the box: read them into filters, then show the clean address of that search.
  if (q.has("q")) {
    const read = readQuery(q.get("q"));
    if (read.place) return Response.redirect(`${SITE}/homes/near/${read.place}/`, 302);
    const keep = searchParams(q, true);
    for (const [k, v] of read.params) keep.set(k, v);
    keep.delete("page");
    return Response.redirect(`${SITE}/homes/${keep.toString() ? `?${keep.toString()}` : ""}`, 302);
  }
  const p = searchParams(q, !anonymous && Boolean(visitorToken(context.request)));
  const filtered = [...p.keys()].some((k) => k !== "sort" && k !== "page");
  p.set("size", "24");
  const [r, hearts] = await Promise.all([crm(context.env, context.request, `/api/idx/listings?${forCrm(p).toString()}`, { anonymous }), anonymous ? [] : heartsOf(context)]);
  if (!anonymous && badToken(r)) return publicView(context, (c) => searchPage(c, url, gate, true));
  if (r.status !== 200 || !r.json || !r.json.ok) return trouble(context, gate, r, "Grand Strand homes for sale");
  const j = r.json;
  // The filter bar (idx-lib/filters.js); the MLS features only when this CRM applies them.
  const form = filterBar({ action: "/homes/", params: p, features: catalogLoaded() || Array.isArray(j.applied) });
  const pageNo = Number.isInteger(j.page) && j.page > 0 ? j.page : 1;
  const pages = Math.min(100, Math.max(1, Math.ceil((j.total || 0) / (j.pageSize || 24))));
  const link = (n) => { const x = new URLSearchParams(p); x.delete("size"); x.set("page", String(n)); return `/homes/?${x.toString()}`; };
  const pager = pages > 1 ? `<nav class="hx-pager" aria-label="Pages">${pageNo > 1 ? `<a href="${esc(link(pageNo - 1))}">Previous</a>` : ""}<span>Page ${pageNo} of ${pages}</span>${pageNo < pages ? `<a href="${esc(link(pageNo + 1))}">Next</a>` : ""}</nav>` : "";
  const sortLink = (v, t) => { const x = new URLSearchParams(p); x.delete("size"); x.delete("page"); if (v) x.set("sort", v); else x.delete("sort"); return `<option value="${esc(`/homes/?${x.toString()}`)}"${(p.get("sort") || "") === v ? " selected" : ""}>${esc(t)}</option>`; };
  const where = p.get("city") ? ` in ${p.get("city")}` : p.get("subdivision") ? ` in ${title(p.get("subdivision"))}` : "";
  const body = `${crumbs([["/", "Home"], [null, "Homes for sale"]])}
<h1>${esc(`${p.get("sold") ? "Sold homes" : "Homes for sale"}${where || " on the Grand Strand"}`)}</h1>
${signedBar(j.tier)}${form}${appliedChips(p)}
<div class="hx-count"><p><b>${esc((j.total || 0).toLocaleString("en-US"))}</b> ${j.total === 1 ? "home" : "homes"}</p><span class="hx-count-r"><a class="hx-maplink" href="${esc(`/homes/map/${(() => { const x = new URLSearchParams(p); x.delete("size"); x.delete("page"); return x.toString() ? `?${x.toString()}` : ""; })()}`)}">Map</a><label class="hx-sort">Sort<select data-hx-go aria-label="Sort">${sortLink("", "Newest")}${sortLink("price_asc", "Price, low to high")}${sortLink("price_desc", "Price, high to low")}</select></label></span></div>${p.get("hoa") === "0" ? `<p class="hx-s-note">${NO_HOA_NOTE}</p>` : ""}
${grid(Array.isArray(j.listings) ? j.listings : [], hearts)}${pager}
${j.tier === "public" ? signupPrompt("Want every photo, the HOA fee and the taxes?") : ""}
${disclaimer(j.meta)}`;
  return page(context, gate, {
    title: `${p.get("sold") ? "Sold homes" : "Homes for sale"}${where || " on the Grand Strand"}`,
    description: "Search Grand Strand homes for sale from the Coastal Carolinas MLS: Myrtle Beach, North Myrtle Beach, Surfside, Murrells Inlet, Pawleys Island and Conway.",
    canonical: `${SITE}/homes/`,
    robots: filtered ? "noindex, follow" : "index, follow",
    body,
  });
}

// ── the map ─────────────────────────────────────────────────────────────────

/** The map's search: the validated filters, plain words in "q", or a point and radius. Up to 144 homes. */
async function mapSearch(context, q) {
  await filterCatalog(context.env, context.request);
  let p = searchParams(q, false), left = "", placed = false;
  // A sentence ("describe your home") adds to the filters in force; it is read once, then gone.
  const words = String(q.get("q") || "").trim().slice(0, 200);
  if (words) {
    const read = readQuery(words);
    const add = searchParams(read.params, false);
    for (const [k, v] of add) if (k !== "has") p.set(k, v);
    // A place named in the sentence replaces the page's own place (a guide's strip opens near its own).
    const addHas = (add.get("has") || "").split(",").filter(Boolean), newPlace = addHas.some(isDistance);
    const has = featureList([...(p.get("has") || "").split(",").filter((k) => !(newPlace && isDistance(k))), ...addHas].filter(Boolean));
    if (has.length) p.set("has", has.join(","));
    if (read.place && PLACES[read.place]) for (const [k, v] of placeParams(PLACES[read.place].q) || []) p.set(k, v);
    if (add.has("city") || add.has("zip") || add.has("subdivision") || read.place) { p.delete("near"); p.delete("miles"); placed = true; }
    left = read.left || "";
  }
  const n = placed ? null : nearOf(q.get("near"), q.get("miles"));
  if (n) { p.delete("city"); p.delete("zip"); p.set("near", n.near); p.set("miles", n.miles); }
  p.delete("page"); p.set("size", "48");
  const get = (pg) => { const x = forCrm(p); if (pg > 1) x.set("page", String(pg)); return crm(context.env, context.request, `/api/idx/listings?${x.toString()}`, { anonymous: true }); };
  const first = await get(1);
  if (first.status !== 200 || !first.json || !first.json.ok) return { r: first, p, listings: [], pins: [], total: 0, left, words };
  let listings = Array.isArray(first.json.listings) ? first.json.listings : [];
  const total = typeof first.json.total === "number" ? first.json.total : listings.length;
  if (total > 48) {
    const more = await Promise.all([2, 3].filter((pg) => (pg - 1) * 48 < total).map(get));
    for (const m of more) if (m.status === 200 && m.json && m.json.ok && Array.isArray(m.json.listings)) listings = listings.concat(m.json.listings);
  }
  await withPoints(listings);
  return { r: first, p, listings, pins: listings.map(pinOf).filter(Boolean), total, left, words };
}

async function mapData(context, url) {
  const s = await mapSearch(context, url.searchParams);
  if (!s.r.json || !s.r.json.ok) return json({ ok: false, error: s.r.json && s.r.json.error === "stale" ? "stale" : "unavailable" }, s.r.status === 429 ? 429 : 503);
  const keep = new URLSearchParams(s.p); keep.delete("size"); keep.delete("page");
  return json({ ok: true, total: s.total, pins: s.pins, meta: s.r.json.meta || null, params: keep.toString(), chips: chipList(keep), labels: pillLabels(keep),
    left: s.left, q: s.words }, 200, { "cache-control": s.words ? "private, no-store" : "public, max-age=300" });
}

async function mapPage(context, url, gate) {
  const signed = Boolean(visitorToken(context.request));
  const [s, hearts] = await Promise.all([mapSearch(context, url.searchParams), signed ? heartsOf(context) : []]);
  if (!s.r.json || !s.r.json.ok) return trouble(context, gate, s.r, "Map of homes for sale");
  const keep = new URLSearchParams(s.p); keep.delete("size"); keep.delete("page");
  const where = s.p.get("city") ? ` in ${s.p.get("city")}` : s.p.get("subdivision") ? ` in ${title(s.p.get("subdivision"))}` : " on the Grand Strand";
  const h = new Set(hearts);
  // The homes with a dot; before the feed carries map points, every home, so the list is never empty.
  const cards = (s.pins.length ? s.listings.filter((l) => s.pins.some((p) => p.mls === String(l.mlsNumber))) : s.listings).slice(0, 60)
    .map((l) => card(l, { hearted: h.has(l.mlsNumber) })).join("");
  const view = url.searchParams.get("view") === "3d" ? "3d" : "2d";
  const focus = /^[A-Za-z0-9]{3,20}$/.test(url.searchParams.get("focus") || "") ? url.searchParams.get("focus") : "";
  // The home a listing page sent us here from is always on the map, even if it is not among the newest.
  if (focus && !s.pins.some((p) => p.mls === focus)) {
    const one = await crm(context.env, context.request, `/api/idx/listings/${encodeURIComponent(focus)}?track=0`, { anonymous: true });
    const l = one.status === 200 && one.json && one.json.ok ? one.json.listing : null;
    if (l && l.address) { if (!l.point) l.point = await geocode(l); const pin = pinOf(l); if (pin) s.pins.unshift(pin); }
  }
  const pinsJson = JSON.stringify(s.pins).replace(/</g, "\\u003c");
  const chips = chipList(keep).map((c) => `<a class="hx-applied-chip" href="${esc(`/homes/map/${c.x ? `?${c.x}` : ""}`)}" data-x="${esc(c.x)}">${esc(c.t)}<span aria-hidden="true">&times;</span></a>`).join("");
  /* Search listings is this page (owner, 2026-10-28): Zillow's layout without its left menu. The map and
     two columns of homes fill the screen below our header; nothing to scroll past, and the MLS notice
     sits once at the end of the list. On a phone: the list, and a Map button, as in Zillow's app. */
  const body = `<div class="hx-mapapp" data-hx-map data-key="${esc(mapsKey(context.env))}" data-params="${esc(keep.toString())}" data-view="${view}" data-total="${esc(s.total)}" data-hearts="${esc(JSON.stringify([...h]))}"${focus ? ` data-focus="${esc(focus)}"` : ""}${s.left ? ` data-left="${esc(s.left)}" data-q="${esc(s.words)}"` : ""}>
<div class="hx-mtop">${filterBar({ action: "/homes/map/", params: keep, features: catalogLoaded(), map: true })}<div class="hx-applied hx-mchips" id="hx-chips"${chips ? "" : " hidden"}>${chips}<a class="hx-clear" href="/homes/map/" data-x="">Clear all</a></div><p class="hx-ai-note" id="hx-ai-note" hidden></p></div>
<div class="hx-map-body hx-show-list">
<div class="hx-mapbox" id="hx-mapbox"><div id="hx-map" class="hx-map" role="region" aria-label="Map of the homes"></div>
<button type="button" class="hx-full-b" id="hx-full-b" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>Full map</button>
<div class="hx-mode" role="group" aria-label="Map view"><button type="button" data-mode="2d" aria-pressed="${view === "2d" ? "true" : "false"}">2D</button><button type="button" data-mode="3d" aria-pressed="${view === "3d" ? "true" : "false"}">3D</button></div>
<p id="hx-map-note" class="hx-map-note"${s.pins.length ? " hidden" : ""}>${s.pins.length ? "" : "No homes with a map location match this search. Change a filter or move the map."}</p></div>
<aside class="hx-map-list" id="hx-map-list" aria-label="The homes"><div class="hx-list-h"><h1>${esc(`Homes for sale${where}`)}</h1><p class="hx-map-count" id="hx-map-count"><b>${esc(s.total.toLocaleString("en-US"))}</b> ${s.total === 1 ? "home" : "homes"}</p></div>
<div id="hx-map-cards" class="hx-map-cards">${cards}</div><p class="hx-list-more" id="hx-list-more"${s.total > s.pins.length ? "" : " hidden"}>Zoom in or move the map to see more of the ${esc(s.total.toLocaleString("en-US"))} homes.</p>
<div class="hx-list-foot">${disclaimer(s.r.json.meta)}</div></aside>
<button type="button" class="hx-map-toggle" id="hx-map-toggle" aria-controls="hx-map">Map</button></div>
<script type="application/json" id="hx-pins">${pinsJson}</script></div>`;
  return page(context, gate, {
    title: `Homes for sale${where}, on the map`,
    description: "Grand Strand homes for sale on a map, from the Coastal Carolinas MLS, with Chapter3 Realty.",
    canonical: `${SITE}/homes/map/`,
    robots: "noindex, follow",
    body,
    rootAttrs: ' data-wide="1"',
    extraHead: MAP_STYLE,
    extraBody: MAP_SCRIPT,
    private: signed,
  });
}

// ── the deal finder (idx-lib/deals.js), for agents ──────────────────────────

const dealsKeyOk = (env, request) => { const want = String(env.DEALS_KEY || "").trim(); return want.length >= 12 && (request.headers.get("x-deals-key") || "").trim() === want; };

/** GET /homes/api/deals?kind=flip&<settings>: the first pass, with the agent's own signed-up account. */
async function dealsApi(context, url) {
  const { env, request } = context;
  if (!dealsKeyOk(env, request)) return json({ ok: false, error: "not_found" }, 404);
  if (!visitorToken(request)) return json({ ok: false, error: "sign_in" }, 200, { "cache-control": "private, no-store" });
  await filterCatalog(env, request);
  const search = async (p) => {
    const r = await crm(env, request, `/api/idx/listings?${new URLSearchParams(p).toString()}`);
    return r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.listings) ? r.json.listings : [];
  };
  const out = await findFlips(search, (ls) => withPoints(ls), flipSettings(url.searchParams));
  return json({ ok: true, ...out }, 200, { "cache-control": "private, no-store" });
}

/** /homes/deals/: three buttons; fix and flip first. Not in search, not in the sitemap. */
function dealsPage(context, gate) {
  const f = FLIP_DEFAULTS;
  const box = (k, label, unit) => `<label class="dl-in"><span>${esc(label)}</span><span class="dl-in-b">${unit === "$" ? "<i>$</i>" : ""}<input id="dl-${k}" type="number" inputmode="decimal" value="${f[k]}">${unit && unit !== "$" ? `<i>${esc(unit)}</i>` : ""}</span></label>`;
  const body = `<div id="dl-app" class="dl">
<h1>Deal finder</h1>
<p class="hx-lead">For our agents. One press looks through every home for sale for a reason to be cheap, and ranks them by how far their asking price a square foot sits under what houses like them sold for nearby. You type the after-repair value; the page does the math. It is a list to work, not advice.</p>
<p id="dl-signin" class="dl-warn" hidden>Sign in to your account on this site first: the nearby sales are for signed-up accounts only. <button type="button" class="btn btn-outline" data-hx-signup>Sign in</button></p>
<label class="dl-in dl-key"><span>Deal finder password</span><span class="dl-in-b"><input id="dl-key" type="password" autocomplete="off"></span></label>
<div class="dl-btns">
<button type="button" id="dl-flip" class="dl-btn dl-on"><b>Fix and flip</b><span>Cheap for a reason, under its nearby sales</span></button>
<button type="button" class="dl-btn" disabled><b>Long-term rentals</b><span>Coming next</span></button>
<button type="button" class="dl-btn" disabled><b>Short-term rentals</b><span>Coming next</span></button>
</div>
<details class="dl-set"><summary>Your figures (saved on this computer)</summary><div class="dl-set-g">
${box("maxPrice", "Highest asking price", "$")}${box("minPrice", "Lowest asking price", "$")}
${box("light", "Light repairs, a sq ft", "$")}${box("medium", "Medium repairs, a sq ft", "$")}${box("heavy", "Heavy repairs, a sq ft", "$")}
${box("buyPct", "Buying costs", "%")}${box("sellPct", "Selling costs (commission and closing)", "%")}${box("holdMonths", "Months held", "months")}${box("holdPerMonth", "Holding cost a month (tax, insurance, utilities, loan)", "$")}
</div><p class="dl-small">The nearby sales are houses within 30 percent of its size that sold within a mile (two if too few) in the last 12 months. The page never puts a value on a house: an automated value is a separate MLS licence we do not have. Repairs start from your figures by the house's age and distress; the AI then looks at the photos of the first 12 and replaces them with its own estimate.</p></details>
<p id="dl-status" class="dl-status" role="status"></p>
<div id="dl-list" class="dl-list"></div>
${disclaimer(null)}
</div>`;
  return page(context, gate, {
    title: "Deal finder", description: "For Chapter3 agents.", canonical: `${SITE}/homes/deals/`, robots: "noindex, nofollow", body, private: true,
    extraHead: DEALS_STYLE, extraBody: DEALS_SCRIPT,
  });
}

const DEALS_STYLE = `<style>
.dl h1{margin-bottom:.3rem}.dl-warn{padding:.8rem 1rem;border-radius:12px;background:#fdf0ee;display:flex;gap:1rem;align-items:center;flex-wrap:wrap}.dl-warn[hidden]{display:none}
.dl-in{display:flex;flex-direction:column;gap:.3rem;font-size:.8rem;font-weight:600;color:var(--slate,#5c6b78)}
.dl-in-b{display:flex;align-items:center;gap:.3rem;min-height:2.8rem;padding:0 .8rem;border:1.5px solid rgba(28,32,40,.2);border-radius:12px;background:#faf8f4}
.dl-in-b input{flex:1;min-width:0;border:0;outline:none;background:none;font:inherit;font-size:1rem;font-weight:600;color:var(--ink,#1c2028)}.dl-in-b i{font-style:normal;color:var(--slate,#5c6b78)}
.dl-key{max-width:22rem;margin:1rem 0}
.dl-btns{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.8rem;margin:1rem 0}
.dl-btn{display:flex;flex-direction:column;align-items:flex-start;gap:.2rem;padding:1.1rem 1.2rem;border-radius:16px;border:1.5px solid rgba(28,32,40,.15);background:#fff;font:inherit;text-align:left;cursor:pointer}
.dl-btn b{font-size:1.15rem;color:var(--ink,#1c2028)}.dl-btn span{font-size:.85rem;color:var(--slate,#5c6b78)}
.dl-btn.dl-on{background:#151a22;border-color:#151a22}.dl-btn.dl-on b{color:#fff}.dl-btn.dl-on span{color:rgba(244,239,232,.75)}
.dl-btn:disabled{opacity:.55;cursor:default}.dl-btn.dl-on:disabled{opacity:.7;cursor:progress}
.dl-set{margin:.5rem 0 1rem;padding:.8rem 1rem;border-radius:14px;background:#fff;border:1px solid rgba(28,32,40,.1)}.dl-set summary{cursor:pointer;font-weight:700}
.dl-set-g{display:grid;grid-template-columns:repeat(auto-fill,minmax(14rem,1fr));gap:.7rem;margin:.8rem 0}
.dl-small{font-size:.85rem;color:var(--slate,#5c6b78)}.dl-status{font-weight:600;min-height:1.5rem}
.dl-list{display:grid;gap:1rem;margin:1rem 0 2rem}.dl-none{padding:1rem;background:#fff;border-radius:12px}
.dl-c{padding:1rem;border-radius:18px;background:#fff;border:1px solid rgba(28,32,40,.1)}
.dl-top{display:grid;grid-template-columns:12rem minmax(0,1fr);gap:1rem}.dl-photo{display:block;aspect-ratio:4/3;border-radius:12px;overflow:hidden;background:#ece6dc}.dl-photo img{width:100%;height:100%;object-fit:cover}
.dl-rank{margin:0;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:var(--brass-ink,#91592b);font-weight:700}
.dl-addr{display:block;font-family:var(--serif,Georgia,serif);font-size:1.3rem;color:var(--ink,#1c2028);margin:.2rem 0}.dl-facts{margin:0;color:var(--slate,#5c6b78);font-size:.9rem}
.dl-profit{margin:.4rem 0 0;font-size:1.25rem;font-weight:800;color:#2d7a4f}
.dl-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;margin:.9rem 0 .5rem}
.dl-r{padding:.55rem .7rem;border-radius:10px;background:#faf8f4}.dl-r span{display:block;font-size:.75rem;color:var(--slate,#5c6b78)}.dl-r b{font-size:1rem}.dl-r-s{background:#eef6f0}
.dl-check{font-size:.9rem;margin:.4rem 0;padding:.5rem .7rem;border-radius:10px;background:#fef3cd}.dl-note{font-size:.9rem;margin:.4rem 0}.dl-comps{margin:.4rem 0}.dl-comps summary{cursor:pointer;font-size:.9rem;font-weight:600}.dl-comps table{width:100%;font-size:.85rem;border-collapse:collapse;margin-top:.4rem}.dl-comps td{padding:.3rem .4rem;border-bottom:1px solid rgba(28,32,40,.08)}
.dl-arv{max-width:22rem;margin:.6rem 0 0}.dl-flipbox .dl-small{grid-column:1/-1;margin:0}
.dl-go{display:inline-block;margin-top:.5rem;font-weight:700;color:var(--brass-ink,#91592b)}.dl-firm{font-size:.75rem;color:var(--slate,#5c6b78);margin:.4rem 0 0}
@media (max-width:760px){.dl-btns{grid-template-columns:1fr}.dl-top{grid-template-columns:1fr}.dl-grid{grid-template-columns:1fr 1fr}}
</style>`;

// ── the rental analyzer's MLS lookup ────────────────────────────────────────

/** The house number and the first word of the street name, for matching an address. */
function streetKey(a) {
  const m = /^\s*(\d+[a-z]?)\s+(?:(?:n|s|e|w|north|south|east|west)\.?\s+)?([a-z0-9]+)/i.exec(String(a || ""));
  return m ? `${m[1].toLowerCase()} ${m[2].toLowerCase()}` : "";
}

/**
 * GET /homes/api/lookup?mls=<MLS#>, or ?street=<address>&lat=&lng=: the listing's facts for
 * /invest/long-term-rental/, so a visitor never types the beds or baths. A home for sale
 * only (the public search has no sold homes). The visitor's own tier decides what comes
 * back: the public card for everyone; the HOA fee, taxes, flood zone, stories and the
 * description only for a signed-up visitor (the same rule as the listing page).
 */
async function lookup(context, url) {
  const q = url.searchParams;
  let mls = /^[A-Za-z0-9]{3,20}$/.test(q.get("mls") || "") ? q.get("mls") : null;
  if (!mls) {
    const key = streetKey(q.get("street"));
    const n = nearOf(`${q.get("lat")},${q.get("lng")}`, 0.2);
    if (!key || !n) return json({ ok: true, found: false });
    const r = await crm(context.env, context.request, `/api/idx/listings?near=${encodeURIComponent(n.near)}&miles=0.2&size=48`, { anonymous: true });
    const ls = r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.listings) ? r.json.listings : [];
    let hit = ls.find((l) => l.address && streetKey(l.address) === key);
    // Not for sale: a signed-up visitor can study a home that sold in the last 24 months
    // (sold records are for signed-up visitors only, contract §5).
    const signed = Boolean(visitorToken(context.request));
    if (!hit && signed) {
      const s = await crm(context.env, context.request, `/api/idx/listings?near=${encodeURIComponent(n.near)}&miles=0.2&sold=1&size=48`);
      const sl = s.status === 200 && s.json && s.json.ok && Array.isArray(s.json.listings) ? s.json.listings : [];
      hit = sl.find((l) => l.address && streetKey(l.address) === key);
    }
    if (!hit) return json({ ok: true, found: false, soldNeedsSignup: !signed }, 200, { "cache-control": "private, no-store" });
    mls = hit.mlsNumber;
  }
  const r = await crm(context.env, context.request, `/api/idx/listings/${encodeURIComponent(mls)}?track=0`);
  if (badToken(r)) return json({ ok: true, found: false }, 200, { "set-cookie": clearCookie() });
  if (r.status !== 200 || !r.json || !r.json.ok || !r.json.listing) return json({ ok: true, found: false });
  const l = r.json.listing;
  const d = r.json.tier === "registered" && l.details ? l.details : {};
  const n = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  const fee = n(d.AssociationFee), freq = String(d.AssociationFeeFrequency || "").toLowerCase();
  const hoaMonthly = fee === null ? null : /annual|year/.test(freq) ? Math.round(fee / 12) : /quarter/.test(freq) ? Math.round(fee / 3) : fee;
  const facts = {
    mlsNumber: l.mlsNumber, url: listingPath(l), status: statusWord(l.status), listPrice: n(l.listPrice),
    beds: n(l.beds), baths: n(l.baths), sqft: n(l.sqft), lotAcres: n(l.lotAcres), yearBuilt: n(l.yearBuilt),
    type: spaced(l.propertySubType || l.propertyType || ""), subdivision: l.subdivision || null, waterfront: l.waterfront === true,
    address: l.address || null, city: l.city || null, zip: l.postalCode || null, listingFirm: l.listingFirm || null,
    tier: r.json.tier === "registered" ? "registered" : "public",
    hoaMonthly, taxAnnual: n(d.TaxAnnualAmount), floodZone: typeof d.FloodZone === "string" ? d.FloodZone : null,
    stories: n(d.StoriesTotal), newConstruction: d.NewConstructionYN === true,
    remarks: r.json.tier === "registered" && typeof l.remarks === "string" ? l.remarks.slice(0, 900) : null,
    soldPrice: r.json.tier === "registered" ? n(l.soldPrice) : null, soldOn: r.json.tier === "registered" && /^\d{4}-\d{2}-\d{2}$/.test(l.soldOn || "") ? l.soldOn : null,
    daysOnMarket: r.json.tier === "registered" ? n(l.daysOnMarket) : null, originalListPrice: r.json.tier === "registered" ? n(l.originalListPrice) : null,
    // For the analyzer's repair check: the links only, never saved (contract: photos are hotlinked).
    // Every photo for a signed-up visitor, as the listing page shows; the first one otherwise.
    photos: (r.json.tier === "registered" && Array.isArray(l.photos) ? l.photos.map((p) => p && p.url) : [l.photo]).filter((u) => safeUrl(u)).slice(0, 40),
  };
  return json({ ok: true, found: true, facts, meta: r.json.meta || null }, 200, { "cache-control": "private, no-store" });
}

/**
 * GET /homes/api/similar?near=<lat,lng>&beds=&min=&max=&not=<MLS#>: homes like the one the
 * rental analyzer just ran, for sale now near it, as the listing search's own strip (cards,
 * the source and the disclaimer). Validated parameters only; nearer and wider when too few.
 */
async function similar(context, url) {
  const q = url.searchParams;
  const n = nearOf(q.get("near"), q.get("miles") || 3);
  if (!n) return json({ ok: false });
  const p = new URLSearchParams({ near: n.near, miles: n.miles, size: "24", status: "active" });
  for (const k of ["beds", "min", "max"]) if (/^\d{1,9}$/.test(q.get(k) || "")) p.set(k, q.get(k));
  const not = /^[A-Za-z0-9]{3,20}$/.test(q.get("not") || "") ? q.get("not") : null;
  const get = async (params) => {
    const r = await crm(context.env, context.request, `/api/idx/listings?${params.toString()}`, { anonymous: true });
    return r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.listings) ? { ls: r.json.listings.filter((l) => forSale(l) && l.mlsNumber !== not), meta: r.json.meta } : { ls: [], meta: null };
  };
  let got = await get(p);
  if (got.ls.length < 3) got = await get(new URLSearchParams({ near: n.near, miles: "5", size: "24", status: "active" }));
  if (got.ls.length < 3) return json({ ok: true, html: "" }, 200, { "cache-control": "public, max-age=300" });
  const all = `/homes/?${new URLSearchParams({ near: n.near, miles: "3" }).toString()}`;
  const cards = got.ls.slice(0, 10).map((l) => stripCard(l, false).replace(/<button type="button" class="hx-heart[\s\S]*?<\/button>/, "")).join("");
  const html = `${STYLE}${STRIP_STYLE}<div class="hx-strip"><p class="hx-s-head"><b>Homes like it for sale nearby</b><a href="${esc(all)}">See all</a></p>`
    + `<div class="hx-s-row">${cards}<a class="hx-s-all" href="${esc(all)}" draggable="false">See all homes nearby</a></div>${disclaimer(got.meta)}</div>`;
  return json({ ok: true, html }, 200, { "cache-control": "public, max-age=300" });
}

/**
 * GET /homes/api/strip?<filters>: an article strip's homes after its filter bar changed
 * (idx-lib/filters.js), without leaving the article. The same validated filters as /homes/,
 * the same quality bar and order as the feeds (no land or mobile homes unless asked for,
 * never the cheapest first). Cards only, the strip's own notice is already on the page.
 */
async function stripApi(context, url) {
  await filterCatalog(context.env, context.request);
  const p = searchParams(url.searchParams, false);
  p.delete("page"); p.set("size", "48");
  const r = await crm(context.env, context.request, `/api/idx/listings?${forCrm(p).toString()}`, { anonymous: true });
  if (r.status !== 200 || !r.json || !r.json.ok || !Array.isArray(r.json.listings)) return json({ ok: false }, r.status === 429 ? 429 : 503);
  const asked = p.get("type");
  const allow = ["land", "manufactured", "multi"].includes(asked);
  // What the reader picked wins over the feeds' bar: land, mobile homes or a low max keep only status and photos.
  const low = +p.get("max") > 0 && +p.get("max") <= 150000;
  const homes = rankHomes(postFilter(r.json.listings, { yearMin: p.get("yearMin") ? +p.get("yearMin") : 1950, minPhotos: 6, floors: !(allow || low) }, { allowTypes: allow }), "appeal")
    .filter((l) => safeUrl(l.photo)).slice(0, 10);
  const keep = new URLSearchParams(p); keep.delete("size");
  const link = `/homes/${keep.toString() ? `?${keep.toString()}` : ""}`;
  const total = typeof r.json.total === "number" ? r.json.total : homes.length;
  const html = homes.length
    // No heart buttons: this answer is cached for everyone, and the page bound its hearts at load (as similar()).
    ? `${homes.map((l) => stripCard(l, false).replace(/<button type="button" class="hx-heart[\s\S]*?<\/button>/, "")).join("")}<a class="hx-s-all" href="${esc(link)}" draggable="false">See all ${esc(total.toLocaleString("en-US"))} homes</a>`
    : `<p class="hx-s-empty">No homes match those filters right now. <a href="${esc(link)}">Open the full search</a> to widen them.</p>`;
  const L = filterLabels(p);
  return json({ ok: true, html, total, link, labels: { price: L.price, beds: L.bb, type: L.type, town: L.town, more: L.more }, note: p.get("hoa") === "0" ? NO_HOA_NOTE : "" }, 200, { "cache-control": "public, max-age=120" });
}

/**
 * GET /homes/api/filters: the MLS features for the filter panel, grouped, most homes first, each with
 * how many homes for sale have it (the CRM's list, contract §5). Short keys keep it small: k key,
 * l label, n homes for sale, d a distance (at most 2 in a search).
 */
async function filtersApi(context) {
  const list = await filterCatalog(context.env, context.request);
  if (!list) return json({ ok: false }, 503);
  const groups = panelGroups(list).map((g) => ({ name: g.name, items: g.items.map((f) => ({ k: f.key, l: f.label, n: f.forSale, ...(f.distance ? { d: 1 } : {}) })) }));
  return json({ ok: true, countedAt: list.countedAt, groups }, 200, { "cache-control": "public, max-age=3600" });
}

// ── one listing ─────────────────────────────────────────────────────────────

async function bareListing(context, mls, gate) {
  const r = await crm(context.env, context.request, `/api/idx/listings/${encodeURIComponent(mls)}?track=0`, { anonymous: true });
  if (r.status === 404) return notFound(context);
  if (r.status !== 200 || !r.json || !r.json.ok || !r.json.listing || typeof r.json.listing !== "object") return trouble(context, gate, r, "Home for sale");
  const to = listingPath(r.json.listing);
  if (to === `/homes/${mls}/`) return listingPage(context, mls, null, gate);
  // The query string goes along: our emails' sign-in code (k, contract §7g) must survive the 301.
  return Response.redirect(`${SITE}${to}${new URL(context.request.url).search}`, 301);
}

const row = (label, value) => (value === null || value === undefined || value === "" ? "" : `<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`);
function detailValue(v) {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (Array.isArray(v)) return v.map(spaced).join(", ");
  if (typeof v === "number") return v.toLocaleString("en-US");
  return spaced(v);
}

async function listingPage(context, mls, slugPart, gate) {
  const { request, env } = context;
  const [r, hearts] = await Promise.all([crm(env, request, `/api/idx/listings/${encodeURIComponent(mls)}`), heartsOf(context)]);
  if (badToken(r)) return publicView(context, async (c) => listingPageWith(c, mls, slugPart, gate, await crm(env, request, `/api/idx/listings/${encodeURIComponent(mls)}`, { anonymous: true }), []));
  return listingPageWith(context, mls, slugPart, gate, r, hearts);
}

async function listingPageWith(context, mls, slugPart, gate, r, hearts) {
  if (r.status === 404) {
    return page(context, gate, { title: "This home is no longer available", description: "This listing is no longer on the market. Search Grand Strand homes for sale from the Coastal Carolinas MLS.", canonical: `${SITE}/homes/`, robots: "noindex, follow", status: 404, body: `<h1>This home is no longer available</h1><p class="hx-lead">It may have sold or left the market. <a href="/homes/">Search homes for sale</a>.</p>` });
  }
  if (r.status !== 200 || !r.json || !r.json.ok || !r.json.listing) return trouble(context, gate, r, "Home for sale");
  const l = r.json.listing;
  const own = listingPath(l);
  if (slugPart !== null && `/homes/${slugPart}/` !== own) return Response.redirect(`${SITE}${own}${new URL(context.request.url).search}`, 301);
  const registered = r.json.tier === "registered";
  const canonical = `${SITE}${own}`;
  const photo = safeUrl(l.photo);
  const photos = registered && Array.isArray(l.photos) ? l.photos.filter((p) => p && safeUrl(p.url)) : [];
  const hearted = (hearts || []).includes(l.mlsNumber);
  const status = statusWord(l.status);
  const count = typeof l.photoCount === "number" && l.photoCount > 0 ? l.photoCount : photos.length;
  const img = (u, alt, eager) => `<img src="${esc(photoUrl(u, "big"))}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async" referrerpolicy="no-referrer">`;
  const chip = status ? `<span class="hx-l-chip">${esc(status)}</span>` : "";

  // The photos: one large, two beside it on a wide screen. Not signed up: the same photo,
  // blurred, says how many more there are, and the second tile asks for a tour.
  let media;
  if (registered && photos.length) {
    const alt = (p, i) => p.caption || `Photo ${i + 1} of ${addressLine(l)}`;
    media = `<div class="hx-l-media${photos.length < 3 ? " hx-one" : ""}"><div class="hx-l-hero">${img(photos[0].url, alt(photos[0], 0), true)}${chip}${heartButton(l, hearted)}`
      + `${photos.length > 1 ? `<a class="hx-l-count" href="#hx-photos">${ICONS.camera}All ${esc(photos.length)} photos</a>` : ""}</div>`
      + (photos.length >= 3 ? photos.slice(1, 3).map((p, i) => `<a class="hx-l-tile" href="#hx-photos">${img(p.url, alt(p, i + 1))}</a>`).join("") : "")
      + `</div>`;
  } else if (photo) {
    const more = count > 1 ? `<button type="button" class="hx-l-count" data-hx-signup>${ICONS.camera}1 of ${esc(count)} photos</button>` : "";
    media = `<div class="hx-l-media"><div class="hx-l-hero">${img(photo, addressLine(l), true)}${chip}${heartButton(l, hearted)}${more}</div>`
      + `<div class="hx-l-tile hx-blur hx-tall">${img(photo, "")}<button type="button" class="hx-l-tilebtn" data-hx-signup>${ICONS.lock}<span>${count > 1 ? `See all ${esc(count)} photos` : "See full details"}</span><small>Free sign-up</small></button></div></div>`;
  } else {
    media = `<div class="hx-l-media hx-one"><div class="hx-l-hero"><div class="hx-nophoto">No photo yet</div>${chip}${heartButton(l, hearted)}</div></div>`;
  }

  const pill = (icon, text) => (text ? `<li class="hx-pill">${ICONS[icon]}${esc(text)}</li>` : "");
  const pills = `<ul class="hx-pills">${pill("bed", typeof l.beds === "number" ? `${l.beds} bed${l.beds === 1 ? "" : "s"}` : "")}${pill("bath", typeof l.baths === "number" ? `${l.baths} bath${l.baths === 1 ? "" : "s"}` : "")}`
    + `${pill("area", typeof l.sqft === "number" ? `${l.sqft.toLocaleString("en-US")} sq ft` : "")}${pill("lot", typeof l.lotAcres === "number" ? `${l.lotAcres} acres` : "")}${pill("year", l.yearBuilt ? `Built ${l.yearBuilt}` : "")}</ul>`;
  // The MLS often writes names in capitals; show them in title case (format only, never different words).
  const title = (v) => (typeof v === "string" && v === v.toUpperCase() ? v.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase()) : v);
  const fact = (label, value) => (value === null || value === undefined || value === "" ? "" : `<div class="hx-fact hx-glass"><span>${esc(label)}</span><b>${esc(value)}</b></div>`);
  const facts = `<div class="hx-facts-grid">${fact("Status", status)}${fact("Type", spaced(l.propertySubType || l.propertyType))}${fact("Subdivision", title(l.subdivision))}`
    + `${fact("Waterfront", l.waterfront ? "Yes" : "")}${fact("Year built", l.yearBuilt)}${fact("MLS number", l.mlsNumber)}`
    + (registered ? `${fact("Listed on", dayLong(l.listedOn))}${fact("Days on market", l.daysOnMarket)}${fact("Original list price", money(l.originalListPrice))}${fact("Sold on", dayLong(l.soldOn))}${fact("Sold price", money(l.soldPrice))}` : "")
    + `</div>`;

  const details = registered && l.details ? DETAIL_LABELS.filter(([k]) => l.details[k] !== undefined && l.details[k] !== null && l.details[k] !== "").map(([k, label]) => row(label, detailValue(l.details[k]))).join("") : "";
  const openList = registered && Array.isArray(l.openHouses) ? l.openHouses.filter((o) => o && !isNaN(Date.parse(o.startsAt))) : [];
  const open = openList.length ? `<h2>Open houses</h2><ul>${openList.map((o) => `<li>${esc(new Date(o.startsAt).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" }))}${o.endsAt && !isNaN(Date.parse(o.endsAt)) ? ` to ${esc(new Date(o.endsAt).toLocaleString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }))}` : ""}</li>`).join("")}</ul>` : "";
  const teaser = (icon, text) => `<li>${ICONS[icon]}<span>${esc(text)}</span><em aria-hidden="true"></em></li>`;
  /* What a signed-up visitor came for, first (owner, 2026-10-28; NAR 2025 Profile of Home Buyers and Sellers:
     photos 81 percent "very useful", detailed property information 77, floor plans 57). Under the price: what
     the home costs to own and how the listing is moving, then the description and every photo, then the rest. */
  const d = registered && l.details ? l.details : {};
  const numOf = (v) => (typeof v === "number" && isFinite(v) ? v : null);
  const fee = numOf(d.AssociationFee), freq = String(d.AssociationFeeFrequency || "").toLowerCase();
  const feeMonth = fee === null ? null : /annual|year/.test(freq) ? Math.round(fee / 12) : /quarter/.test(freq) ? Math.round(fee / 3) : fee;
  const noHoa = d.AssociationYN === false || feeMonth === 0;
  const covers = Array.isArray(d.AssociationFeeIncludes) ? d.AssociationFeeIncludes.join(", ") : typeof d.AssociationFeeIncludes === "string" ? d.AssociationFeeIncludes : "";
  const cut = numOf(l.originalListPrice) && numOf(l.listPrice) && l.originalListPrice > l.listPrice ? l.originalListPrice - l.listPrice : 0;
  const key = (label, value, note) => (value ? `<div class="hx-key"><span>${esc(label)}</span><b>${esc(value)}</b>${note ? `<small>${esc(note)}</small>` : ""}</div>` : "");
  const keys = registered ? `<div class="hx-keys">`
    + (noHoa ? key("HOA fee", "No HOA", NO_HOA_NOTE) : key("HOA fee", feeMonth !== null ? `${money(feeMonth)} a month` : "", covers ? `Covers ${covers.slice(0, 120)}` : ""))
    + key("Property tax", numOf(d.TaxAnnualAmount) ? `${money(d.TaxAnnualAmount)} a year` : "", d.TaxYear ? `As listed for ${d.TaxYear}; it can change after a sale` : "As listed; it can change after a sale")
    + key("Flood zone", typeof d.FloodZone === "string" ? d.FloodZone : "", "From the listing; confirm with your insurance agent")
    + key("On the market", numOf(l.daysOnMarket) !== null ? `${l.daysOnMarket} day${l.daysOnMarket === 1 ? "" : "s"}` : "", cut ? `Price cut ${money(cut)} from ${money(l.originalListPrice)}` : "")
    + (openList.length ? key("Next open house", new Date(openList[0].startsAt).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }), "") : "")
    + `</div>` : "";
  const more = registered
    ? `${keys}${l.remarks ? `<h2>About this home</h2><p class="hx-remarks">${esc(l.remarks)}</p>` : ""}
${photos.length > 1 ? `<h2 id="hx-photos">All ${esc(photos.length)} photos</h2><div class="hx-gallery">${photos.map((p, i) => img(p.url, p.caption || `Photo ${i + 1} of ${addressLine(l)}`, false)).join("")}</div>` : ""}
${details ? `<h2>Details</h2><table class="hx-table"><tbody>${details}</tbody></table>` : ""}${open}
${safeUrl(l.virtualTour) ? `<p><a href="${esc(l.virtualTour)}" rel="nofollow noopener" target="_blank">Virtual tour</a></p>` : ""}
${l.listingAgent ? `<p class="hx-firm-line">Listing agent: ${esc(l.listingAgent)}, ${esc(l.listingFirm || "")}</p>` : ""}
<p class="hx-small">School names come from the listing. Being near a school does not mean a home is zoned for it; confirm the zone with Horry County Schools.</p>`
    : `<section class="hx-teaser hx-glass"><h2>Free: everything else about this home</h2><p class="hx-small">Sign up once with your name, email and phone.</p><ul>`
      + `${teaser("camera", count > 1 ? `All ${count} photos` : "Every photo")}${teaser("home", "The description")}${teaser("lock", "The HOA fee and what it covers")}`
      + `${teaser("year", "Property taxes")}${teaser("area", "Days on market and the price history")}${teaser("lot", "Recent sales nearby")}</ul>`
      + `<button type="button" class="btn btn-brass" data-hx-signup>See full details</button></section>`;

  const side = `<aside class="hx-side hx-glass" aria-label="Tour or ask about this home"><p class="hx-l-price">${esc(headlinePrice(l))}</p><p class="hx-small">${esc(addressLine(l))}</p>`
    + `${tourButton(l, "Tour this home", "tour", "hx-primary")}${tourButton(l, "Ask a question", "question")}`
    // For investors: the rental analyzer, filled in with this home and started at once (owner, 2026-10-26).
    + (!l.address ? "" : `<a class="hx-analyze" href="/invest/long-term-rental/?mls=${esc(encodeURIComponent(l.mlsNumber))}&amp;go=1"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6"/></svg>Analyze it as a rental</a>`) + `</aside>`;

  const where = l.address ? (pinOf(l) ? { lat: pinOf(l).lat, lng: pinOf(l).lng } : await geocode(l)) : null;
  // Homes like this one (owner, 2026-10-26: "the idx inside of that should be similar homes").
  const nearby = await homesLike(context, l, where);
  // Where the home is: a map with its pin. A click opens every home for sale in its town on
  // the full map, this one lit (owner, 2026-10-25). Never for a withheld address (16.5).
  const mapHref = `/homes/map/?${new URLSearchParams({ ...(l.city && CITIES.includes(l.city) ? { city: l.city } : {}), focus: l.mlsNumber }).toString()}`;
  const located = where ? `<section class="hx-loc"><h2>Where it is</h2><a class="hx-loc-map" href="${esc(mapHref)}">`
    + `<img src="${esc(`https://maps.googleapis.com/maps/api/staticmap?center=${where.lat},${where.lng}&zoom=15&size=640x280&scale=2&markers=color:0x1a73e8%7C${where.lat},${where.lng}&key=${mapsKey(context.env)}`)}" alt="${esc(`Map of ${addressLine(l)}`)}" width="640" height="280" loading="lazy" referrerpolicy="strict-origin-when-cross-origin">`
    + `<span class="hx-loc-cta">${esc(l.city ? `See every home for sale in ${l.city} on the map` : "See the homes around it on the map")}</span></a></section>` : "";
  const body = `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, l.city || "Listing"]])}
${media}
<div class="hx-l-grid"><div class="hx-l-info"><div class="hx-l-top">
<p class="hx-l-price">${esc(headlinePrice(l))}</p>
<h1 class="hx-l-addr">${esc(addressLine(l))}</h1>
${pills}
<p class="hx-firm-line">Listed by ${esc(l.listingFirm || "the listing brokerage")}</p>
${signedBar(r.json.tier)}</div><div class="hx-l-rest">${registered ? `${more}${facts}${located}` : `${facts}${located}${more}`}</div>
</div>${side}</div>
${nearby}
${disclaimer(r.json.meta)}`;
  const ld = { "@context": "https://schema.org", "@type": "RealEstateListing", name: addressLine(l), url: canonical, ...(photo ? { image: photo } : {}), offers: typeof l.listPrice === "number" && l.status !== "Closed" ? { "@type": "Offer", price: l.listPrice, priceCurrency: "USD" } : undefined };
  return page(context, gate, {
    title: l.address ? `${l.address}, ${l.city || ""}` : `Home for sale in ${l.city || "the Grand Strand"}`,
    description: `${headlinePrice(l)}. ${factsLine(l)}. ${addressLine(l)}. Listed by ${l.listingFirm || "the listing brokerage"}.`.slice(0, 160),
    canonical,
    robots: context.env.IDX_INDEX_LISTINGS === "1" ? "index, follow" : "noindex, follow",
    body,
    ld,
    rootAttrs: ` data-hx-mls="${esc(l.mlsNumber)}"${r.json.viewId ? ` data-view-id="${esc(r.json.viewId)}"` : ""}`,
    private: registered,
    extraHead: nearby ? STRIP_STYLE : "",
  });
}

/** True when a listing is for sale now (owner, 2026-10-26: no pending homes in a strip of homes for sale). */
const forSale = (x) => x && (!x.status || x.status === "Active");
const condoLike = (x) => /condo|apartment|townho/i.test(`${x.propertySubType || ""} ${x.propertyType || ""}`);

/**
 * "Homes like this one for sale": up to 10 other homes for sale now, of the same kind (a condo
 * for a condo, a house for a house), within about a quarter of its price and a bedroom of its
 * size, nearest first: around its pin when we have one, else in its subdivision, else its town.
 * Empty on any trouble.
 */
async function homesLike(context, l, where) {
  try {
    const price = typeof l.listPrice === "number" && l.listPrice > 0 ? l.listPrice : 0;
    const p = new URLSearchParams({ size: "48", status: "active" });
    const sub = typeof l.subdivision === "string" ? l.subdivision.trim() : "";
    if (where) { p.set("near", `${where.lat.toFixed(5)},${where.lng.toFixed(5)}`); p.set("miles", "3"); p.set("sort", "nearest"); }
    else if (/^[A-Za-z0-9 .,'&()\/-]{2,80}$/.test(sub)) p.set("subdivision", sub);
    else if (l.city && CITIES.includes(l.city)) p.set("city", l.city);
    else return "";
    if (price) { p.set("min", String(Math.round(price * 0.75 / 1000) * 1000)); p.set("max", String(Math.round(price * 1.25 / 1000) * 1000)); }
    if (typeof l.beds === "number" && l.beds > 1) p.set("beds", String(l.beds - 1));
    const r = await crm(context.env, context.request, `/api/idx/listings?${p.toString()}`, { anonymous: true, timeoutMs: 2500 });
    const all = r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.listings) ? r.json.listings : [];
    let ls = all.filter((x) => forSale(x) && x.mlsNumber !== l.mlsNumber && safeUrl(x.photo));
    const same = ls.filter((x) => condoLike(x) === condoLike(l));
    if (same.length >= 3) ls = same;
    if (ls.length < 3) return "";
    const pick = ls.slice(0, 10);
    const link = new URLSearchParams(p); link.delete("size"); link.delete("sort");
    return `<div class="hx-strip" data-place="nearby" data-name="homes like it"><p class="hx-s-head"><b>Homes like this one for sale</b><a href="/homes/?${esc(link.toString())}">See all</a></p>`
      + `<div class="hx-s-row">${pick.map((x) => stripCard(x, false)).join("")}</div></div>`;
  } catch {
    return "";
  }
}

// ── a community from our guide pages ────────────────────────────────────────

async function placePage(context, slug, gate, anonymous = false) {
  const place = /^[a-z0-9-]{1,80}$/.test(slug) ? PLACES[slug] : null;
  if (!place) return notFound(context);
  const p = placeParams(place.q);
  if (!p) return notFound(context);
  p.set("size", "48");
  const [r, hearts] = await Promise.all([crm(context.env, context.request, `/api/idx/listings?${forCrm(p).toString()}`, { anonymous }), anonymous ? [] : heartsOf(context)]);
  if (!anonymous && badToken(r)) return publicView(context, (c) => placePage(c, slug, gate, true));
  if (r.status !== 200 || !r.json || !r.json.ok) return trouble(context, gate, r, `Homes for sale in ${place.name}`);
  const j = r.json;
  const ls = Array.isArray(j.listings) ? j.listings : [];
  const guides = (place.pages || []).map((u) => `<a href="${esc(u)}">${esc(u.split("/").filter(Boolean).pop().replace(/-/g, " "))}</a>`).join(" · ");
  const body = `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, place.name]])}
<h1>Homes for sale in ${esc(place.name)}</h1>
<p class="hx-lead">${esc(String(j.total ?? ls.length))} ${j.total === 1 ? "home" : "homes"} for sale now, from the Coastal Carolinas MLS. Each card names its listing firm.${place.q.near ? " Distances are straight-line miles." : ""}${place.q.hoa !== undefined ? ` ${NO_HOA_NOTE}` : ""}</p>
${signedBar(j.tier)}${grid(ls, hearts)}
${j.tier === "public" && ls.length ? signupPrompt(`See every photo and the HOA fee for homes in ${place.name}.`) : ""}
${guides ? `<p class="hx-small">Read about ${esc(place.name)}: ${guides}</p>` : ""}
${disclaimer(j.meta)}`;
  return page(context, gate, {
    title: `Homes for sale in ${place.name}`,
    description: `Homes for sale in ${place.name}, from the Coastal Carolinas MLS and refreshed every few minutes, with Chapter3 Realty.`.slice(0, 160),
    canonical: `${SITE}/homes/near/${slug}/`,
    robots: ls.length ? "index, follow" : "noindex, follow",
    body,
  });
}

// ── terms ───────────────────────────────────────────────────────────────────

function termsPage(context, gate) {
  return page(context, gate, {
    title: TERMS_TITLE,
    description: "The terms of use for Chapter3 Realty's listing search: where the data comes from, what we record, and texts only with your separate consent.",
    canonical: `${SITE}/homes/terms/`,
    robots: "noindex, follow",
    body: `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, "Terms"]])}<h1>${esc(TERMS_TITLE)}</h1><p class="hx-small">Version ${esc(TERMS_VERSION)}</p>${TERMS_PARAGRAPHS.map((t) => `<p class="hx-lead">${esc(t)}</p>`).join("")}`,
  });
}

// ── data back to the CRM (contract §7) ──────────────────────────────────────

const FIELD_WORDS = { phone: "Please check your phone number.", termsText: "Please reload the page and try again.", name: "Please enter your first and last name.", email: "Please check your email.", phone: "Please check your phone number.", termsAccepted: "Please tick the box to accept the terms.", turnstileToken: "Please complete the check above the button." };
/* The CRM refuses a live sign-up without a Turnstile token. With no widget on the page (no
   TURNSTILE_SITE_KEY yet), "complete the check" points at nothing: say what is true instead. */
const fieldWord = (env, field) => (field === "turnstileToken" && !env.TURNSTILE_SITE_KEY ? `Sign-up is not switched on yet. Please call ${PHONE} and we will get you in.` : FIELD_WORDS[field] || "Please check the form.");

async function register(context) {
  const { request, env } = context;
  const { body: b, tooLarge } = await readBody(request, 48 * 1024);
  if (tooLarge) return json({ ok: false, error: "too_large" }, 413);
  if (!b || typeof b !== "object") return json({ ok: false, error: "invalid_body" }, 400);
  const str = (v, n) => (typeof v === "string" ? v.trim().slice(0, n) : "");
  const prior = Array.isArray(b.priorViews) ? b.priorViews.slice(0, 20).filter((x) => x && typeof x.mlsNumber === "string" && /^[A-Za-z0-9]{3,20}$/.test(x.mlsNumber) && Number.isInteger(x.seconds) && x.seconds >= 0 && x.seconds <= 3600 && !isNaN(Date.parse(x.viewedAt)))
    .map((x) => ({ mlsNumber: x.mlsNumber, seconds: x.seconds, viewedAt: new Date(x.viewedAt).toISOString() })) : [];
  const sms = b.smsConsent === true;
  const r = await crm(env, request, "/api/idx/register", {
    method: "POST", anonymous: true, userAgent: true,
    body: {
      firstName: str(b.firstName, 80), lastName: str(b.lastName, 80), email: str(b.email, 200), phone: str(b.phone, 40),
      termsAccepted: b.termsAccepted === true, termsVersion: TERMS_VERSION, termsText: termsText(),
      smsConsent: sms, ...(sms ? { smsConsentText: SMS_CONSENT_TEXT } : {}),
      page: str(b.page, 200) || null, priorViews: prior, turnstileToken: str(b.turnstileToken, 4096), website: typeof b.website === "string" ? b.website.slice(0, 200) : "",
    },
  });
  if (r.status === 200 && r.json && r.json.ok) {
    return json({ ok: true }, 200, r.json.token ? { "set-cookie": setCookie(r.json.token) } : {});
  }
  if (r.status === 400 && r.json && r.json.error === "invalid") return json({ ok: false, field: r.json.field, message: fieldWord(context.env, r.json.field) }, 400);
  if (r.status === 429) return json({ ok: false, message: "Too many tries, please wait a minute." }, 429);
  return json({ ok: false, message: `Sign-up is unavailable right now. Please call ${PHONE}.` }, 503);
}

async function views(context) {
  const { request, env } = context;
  const token = visitorToken(request);
  if (!token) return json({ ok: false }, 200, { "set-cookie": clearCookie() });
  const { body: b, tooLarge } = await readBody(request, 4 * 1024);
  if (tooLarge || !b) return json({ ok: false }, 400);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.viewId || "") || !Number.isInteger(b.seconds) || b.seconds < 0 || b.seconds > 3600) return json({ ok: false }, 400);
  const r = await crm(env, request, "/api/idx/views", { method: "POST", token, body: { views: [{ viewId: b.viewId, seconds: b.seconds }] } });
  if (r.status === 401) return json({ ok: false }, 401, { "set-cookie": clearCookie() });
  return json({ ok: true });
}

async function hearts(context) {
  const { request, env } = context;
  const token = visitorToken(request);
  if (!token) return json({ ok: false, error: "not_signed_in" }, 401, { "set-cookie": clearCookie() });
  const { body: b, tooLarge } = await readBody(request, 1024);
  if (tooLarge || !b || !/^[A-Za-z0-9]{3,20}$/.test(b.mlsNumber || "") || typeof b.loved !== "boolean") return json({ ok: false, error: "invalid" }, 400);
  const r = await crm(env, request, "/api/idx/hearts", { method: "POST", token, body: { mlsNumber: b.mlsNumber, loved: b.loved } });
  if (r.status === 401) return json({ ok: false, error: "not_signed_in" }, 401, { "set-cookie": clearCookie() });
  if (r.status === 200 && r.json && r.json.ok) return json({ ok: true, loved: r.json.loved });
  return json({ ok: false, error: r.status === 404 ? "not_found" : "unavailable" }, r.status === 404 ? 404 : 503);
}
