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
import { MAP_SCRIPT, MAP_STYLE, geocode, mapsKey, nearOf, pinOf, withPoints } from "../../idx-lib/map.js";
import { SMS_CONSENT_TEXT, TERMS_PARAGRAPHS, TERMS_TITLE, TERMS_VERSION, termsText } from "../../idx-lib/terms.js";
import {
  ICONS, STRIP_STYLE, STYLE, SCRIPT, addressLine, card, dayLong, disclaimer, esc, factsLine, grid, headlinePrice, heartButton,
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

  if (path.startsWith("/homes/api/")) {
    const name = path.replace(/^\/homes\/api\/|\/$/g, "");
    if (name === "map" && (request.method === "GET" || request.method === "HEAD")) return mapData(context, url);
    if (name === "lookup" && request.method === "GET") return lookup(context, url);
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
  const { body: b, tooLarge } = await readBody(request, 4 * 1024);
  if (tooLarge) return json({ ok: false, error: "too_large" }, 413);
  if (!b || typeof b !== "object" || !K.test(String(b.k || ""))) return json({ ok: false, error: "link_expired" });
  if (visitorToken(request)) return json({ ok: true, already: true });
  if (b.termsAccepted !== true) return json({ ok: false, field: "termsAccepted", message: FIELD_WORDS.termsAccepted }, 400);
  const page = typeof b.page === "string" && b.page.startsWith("/homes") ? b.page.slice(0, 200) : "/homes/";
  const r = await postClaim(context, { k: b.k, termsAccepted: true, termsVersion: TERMS_VERSION, termsText: termsText(), page });
  if (r.status === 200 && r.json && r.json.ok && typeof r.json.token === "string") return json({ ok: true }, 200, { "set-cookie": setCookie(r.json.token) });
  if (r.status === 400 && r.json && r.json.error === "invalid") return json({ ok: false, field: r.json.field, message: FIELD_WORDS[r.json.field] || "Please check the form." }, 400);
  return json({ ok: false, error: "link_expired" });
}

async function returning(context) {
  const { request } = context;
  const { body: b, tooLarge } = await readBody(request, 8 * 1024);
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
  if (r.status === 400 && r.json && r.json.error === "invalid") return json({ ok: false, field: r.json.field, message: FIELD_WORDS[r.json.field] || "Please check the form." }, 400);
  if (r.status === 429) return json({ ok: false, message: "Too many tries, please wait a minute." }, 429);
  return json({ ok: false, message: `Sign-in is unavailable right now. Please call ${PHONE}.` }, 503);
}

async function route(context, url, path, gate) {
  // /homes/<MLS#> as the CRM's emails write it: find the listing's own URL.
  // "terms", "near" and "api" are our own pages, never MLS numbers.
  const bare = /^\/homes\/([A-Za-z0-9]{3,20})\/?$/.exec(path);
  if (bare && !["terms", "near", "api", "map"].includes(bare[1].toLowerCase())) return bareListing(context, bare[1], gate);
  if (!path.endsWith("/")) return Response.redirect(`${SITE}${path}/${url.search}`, 301);

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 1) return searchPage(context, url, gate);
  if (parts[1] === "map" && parts.length === 2) return mapPage(context, url, gate);
  if (parts[1] === "terms" && parts.length === 2) return termsPage(context, gate);
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
    .replace("</head>", () => `${STYLE}${o.extraHead || ""}${ld}</head>`)
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
  const sub = (q.get("subdivision") || "").trim();
  if (/^[A-Za-z0-9 .,'&()\/-]{2,80}$/.test(sub)) p.set("subdivision", sub);
  if (signed && q.get("sold") === "1") p.set("sold", "1");
  const sort = q.get("sort");
  if (sort && ["newest", "price_asc", "price_desc"].includes(sort)) p.set("sort", sort);
  const pg = q.get("page");
  if (pg && /^\d{1,3}$/.test(pg)) p.set("page", String(Math.min(100, Math.max(1, +pg))));
  return p;
}

const TYPE_WORD = Object.fromEntries(TYPES.filter(([v]) => v));
const title = (v) => String(v).toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
/** The filters in force, each a chip that removes itself. */
function appliedChips(p) {
  const label = { city: (v) => v, zip: (v) => v, type: (v) => TYPE_WORD[v], min: (v) => `From ${money(+v)}`, max: (v) => `Up to ${money(+v)}`,
    beds: (v) => `${v}+ beds`, baths: (v) => `${v}+ baths`, sqft: (v) => `${(+v).toLocaleString("en-US")}+ sq ft`, waterfront: () => "Waterfront", subdivision: (v) => title(v), sold: () => "Sold" };
  const chips = [...p.keys()].filter((k) => label[k]).map((k) => {
    const x = new URLSearchParams(p); x.delete(k); x.delete("page"); x.delete("size");
    return `<a class="hx-applied-chip" href="${esc(`/homes/${x.toString() ? `?${x.toString()}` : ""}`)}" aria-label="Remove ${esc(label[k](p.get(k)))}">${esc(label[k](p.get(k)))}<span aria-hidden="true">&times;</span></a>`;
  });
  return chips.length ? `<div class="hx-applied">${chips.join("")}<a class="hx-clear" href="/homes/">Clear all</a></div>` : "";
}

async function searchPage(context, url, gate, anonymous = false) {
  const q = url.searchParams;
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
  const [r, hearts] = await Promise.all([crm(context.env, context.request, `/api/idx/listings?${p.toString()}`, { anonymous }), anonymous ? [] : heartsOf(context)]);
  if (!anonymous && badToken(r)) return publicView(context, (c) => searchPage(c, url, gate, true));
  if (r.status !== 200 || !r.json || !r.json.ok) return trouble(context, gate, r, "Grand Strand homes for sale");
  const j = r.json;
  const priceOpts = (lead) => [["", lead], ...PRICES.map((v) => [String(v), money(v)])];
  const hidden = ["zip", "sqft", "subdivision"].filter((k) => p.get(k)).map((k) => `<input type="hidden" name="${k}" value="${esc(p.get(k))}">`).join("");
  const form = `<form class="hx-search" method="get" action="/homes/" role="search">
<div class="hx-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input name="q" type="search" enterkeyhint="search" autocomplete="off" maxlength="200" aria-label="Search homes" placeholder="Try &quot;3 bed in Conway under $400k&quot;"><button type="submit">Search</button></div>
</form>
<form class="hx-chips" method="get" action="/homes/" data-hx-instant>${hidden}
${select("city", "Town", [["", "Any town"], ...CITIES.map((c) => [c, c])], p.get("city"))}
${select("type", "Type", TYPES, p.get("type"))}
${select("min", "Min price", priceOpts("Min price"), p.get("min"))}
${select("max", "Max price", priceOpts("Max price"), p.get("max"))}
${select("beds", "Beds", [["", "Beds"], ["1", "1+ beds"], ["2", "2+ beds"], ["3", "3+ beds"], ["4", "4+ beds"], ["5", "5+ beds"]], p.get("beds"))}
${select("baths", "Baths", [["", "Baths"], ["1", "1+ baths"], ["2", "2+ baths"], ["3", "3+ baths"]], p.get("baths"))}
${select("waterfront", "Water", [["", "Any water"], ["1", "Waterfront"]], p.get("waterfront"))}
${j.tier === "registered" ? select("sold", "Show", [["", "For sale"], ["1", "Sold, last 24 months"]], p.get("sold")) : ""}
<noscript><button class="hx-chip" type="submit">Apply</button></noscript></form>`;
  const pageNo = Number.isInteger(j.page) && j.page > 0 ? j.page : 1;
  const pages = Math.min(100, Math.max(1, Math.ceil((j.total || 0) / (j.pageSize || 24))));
  const link = (n) => { const x = new URLSearchParams(p); x.delete("size"); x.set("page", String(n)); return `/homes/?${x.toString()}`; };
  const pager = pages > 1 ? `<nav class="hx-pager" aria-label="Pages">${pageNo > 1 ? `<a href="${esc(link(pageNo - 1))}">Previous</a>` : ""}<span>Page ${pageNo} of ${pages}</span>${pageNo < pages ? `<a href="${esc(link(pageNo + 1))}">Next</a>` : ""}</nav>` : "";
  const sortLink = (v, t) => { const x = new URLSearchParams(p); x.delete("size"); x.delete("page"); if (v) x.set("sort", v); else x.delete("sort"); return `<option value="${esc(`/homes/?${x.toString()}`)}"${(p.get("sort") || "") === v ? " selected" : ""}>${esc(t)}</option>`; };
  const where = p.get("city") ? ` in ${p.get("city")}` : p.get("subdivision") ? ` in ${title(p.get("subdivision"))}` : "";
  const body = `${crumbs([["/", "Home"], [null, "Homes for sale"]])}
<h1>${esc(`${p.get("sold") ? "Sold homes" : "Homes for sale"}${where || " on the Grand Strand"}`)}</h1>
${signedBar(j.tier)}${form}${appliedChips(p)}
<div class="hx-count"><p><b>${esc((j.total || 0).toLocaleString("en-US"))}</b> ${j.total === 1 ? "home" : "homes"}</p><span class="hx-count-r"><a class="hx-maplink" href="${esc(`/homes/map/${(() => { const x = new URLSearchParams(p); x.delete("size"); x.delete("page"); return x.toString() ? `?${x.toString()}` : ""; })()}`)}">Map</a><label class="hx-sort">Sort<select data-hx-go aria-label="Sort">${sortLink("", "Newest")}${sortLink("price_asc", "Price, low to high")}${sortLink("price_desc", "Price, high to low")}</select></label></span></div>
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
  let p = searchParams(q, false);
  if (q.get("q")) {
    const read = readQuery(q.get("q"));
    p = searchParams(read.params, false);
    if (read.place && PLACES[read.place]) for (const [k, v] of placeParams(PLACES[read.place].q) || []) p.set(k, v);
  }
  const n = nearOf(q.get("near"), q.get("miles"));
  if (n) { p.delete("city"); p.delete("zip"); p.set("near", n.near); p.set("miles", n.miles); }
  p.delete("page"); p.set("size", "48");
  const get = (pg) => { const x = new URLSearchParams(p); if (pg > 1) x.set("page", String(pg)); return crm(context.env, context.request, `/api/idx/listings?${x.toString()}`, { anonymous: true }); };
  const first = await get(1);
  if (first.status !== 200 || !first.json || !first.json.ok) return { r: first, p, listings: [], pins: [], total: 0 };
  let listings = Array.isArray(first.json.listings) ? first.json.listings : [];
  const total = typeof first.json.total === "number" ? first.json.total : listings.length;
  if (total > 48) {
    const more = await Promise.all([2, 3].filter((pg) => (pg - 1) * 48 < total).map(get));
    for (const m of more) if (m.status === 200 && m.json && m.json.ok && Array.isArray(m.json.listings)) listings = listings.concat(m.json.listings);
  }
  await withPoints(listings);
  return { r: first, p, listings, pins: listings.map(pinOf).filter(Boolean), total };
}

async function mapData(context, url) {
  const s = await mapSearch(context, url.searchParams);
  if (!s.r.json || !s.r.json.ok) return json({ ok: false, error: s.r.json && s.r.json.error === "stale" ? "stale" : "unavailable" }, s.r.status === 429 ? 429 : 503);
  return json({ ok: true, total: s.total, pins: s.pins, meta: s.r.json.meta || null }, 200, { "cache-control": "public, max-age=300" });
}

async function mapPage(context, url, gate) {
  const s = await mapSearch(context, url.searchParams);
  if (!s.r.json || !s.r.json.ok) return trouble(context, gate, s.r, "Map of homes for sale");
  const keep = new URLSearchParams(s.p); keep.delete("size");
  const where = s.p.get("city") ? ` in ${s.p.get("city")}` : "";
  const cards = s.listings.slice(0, 48).map((l) => `<div data-mls="${esc(l.mlsNumber)}">${card(l)}</div>`).join("");
  const view = url.searchParams.get("view") === "3d" ? "3d" : "2d";
  const focus = /^[A-Za-z0-9]{3,20}$/.test(url.searchParams.get("focus") || "") ? url.searchParams.get("focus") : "";
  // The home a listing page sent us here from is always on the map, even if it is not among the newest.
  if (focus && !s.pins.some((p) => p.mls === focus)) {
    const one = await crm(context.env, context.request, `/api/idx/listings/${encodeURIComponent(focus)}?track=0`, { anonymous: true });
    const l = one.status === 200 && one.json && one.json.ok ? one.json.listing : null;
    if (l && l.address) { if (!l.point) l.point = await geocode(l); const pin = pinOf(l); if (pin) s.pins.unshift(pin); }
  }
  const pinsJson = JSON.stringify(s.pins).replace(/</g, "\\u003c");
  const body = `<div data-hx-map data-key="${esc(mapsKey(context.env))}" data-params="${esc(keep.toString())}" data-view="${view}"${focus ? ` data-focus="${esc(focus)}"` : ""}>
<div class="hx-map-top">${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, "Map"]])}<h1>${esc(`Map of homes for sale${where}`)}</h1>
<form class="hx-search" method="get" action="/homes/map/" role="search"><div class="hx-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input name="q" type="search" enterkeyhint="search" autocomplete="off" maxlength="200" aria-label="Search homes on the map" placeholder="Try &quot;waterfront condo in North Myrtle Beach&quot;"><button type="submit">Search</button></div></form>
${appliedChips(s.p).replace(/href="\/homes\//g, 'href="/homes/map/')}<p class="hx-small"><a class="hx-maplist" href="${esc(`/homes/${keep.toString() ? `?${keep.toString()}` : ""}`)}">See these homes as a list</a></p></div>
<div class="hx-map-body"><div id="hx-map" class="hx-map" role="region" aria-label="Map of the homes"><button type="button" id="hx-area" class="hx-area" hidden>Search this area</button>
<div class="hx-mode" role="group" aria-label="Map view"><button type="button" data-mode="2d" aria-pressed="${view === "2d" ? "true" : "false"}">2D</button><button type="button" data-mode="3d" aria-pressed="${view === "3d" ? "true" : "false"}">3D</button></div>
<p id="hx-map-note" class="hx-map-note"${s.pins.length ? " hidden" : ""}>${s.pins.length ? "" : "Map pins arrive when the MLS feed adds each home's location. Every home is in the list."}</p></div>
<aside class="hx-map-list" aria-label="The homes"><p class="hx-map-count" id="hx-map-count"><b>${esc(s.total.toLocaleString("en-US"))}</b> homes${s.total > s.listings.length ? `, the newest ${esc(s.listings.length)} here` : ""}</p><div id="hx-map-cards" class="hx-map-cards">${cards}</div></aside>
<button type="button" class="hx-map-toggle">List</button></div>
<script type="application/json" id="hx-pins">${pinsJson}</script>
<div class="hx-wrap">${disclaimer(s.r.json.meta)}</div></div>`;
  return page(context, gate, {
    title: `Map of homes for sale${where}`,
    description: "Grand Strand homes for sale on a map, from the Coastal Carolinas MLS, with Chapter3 Realty.",
    canonical: `${SITE}/homes/map/`,
    robots: "noindex, follow",
    body,
    rootAttrs: ' data-wide="1"',
    extraHead: MAP_STYLE,
    extraBody: MAP_SCRIPT,
  });
}

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
  };
  return json({ ok: true, found: true, facts, meta: r.json.meta || null }, 200, { "cache-control": "private, no-store" });
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
  const img = (u, alt, eager) => `<img src="${esc(u)}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async" referrerpolicy="no-referrer">`;
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
  const more = registered
    ? `${l.remarks ? `<h2>About this home</h2><p class="hx-remarks">${esc(l.remarks)}</p>` : ""}
${details ? `<h2>Details</h2><table class="hx-table"><tbody>${details}</tbody></table>` : ""}${open}
${photos.length > 1 ? `<h2 id="hx-photos">All ${esc(photos.length)} photos</h2><div class="hx-gallery">${photos.map((p, i) => img(p.url, p.caption || `Photo ${i + 1} of ${addressLine(l)}`, i < 2)).join("")}</div>` : ""}
${safeUrl(l.virtualTour) ? `<p><a href="${esc(l.virtualTour)}" rel="nofollow noopener" target="_blank">Virtual tour</a></p>` : ""}
${l.listingAgent ? `<p class="hx-firm-line">Listing agent: ${esc(l.listingAgent)}, ${esc(l.listingFirm || "")}</p>` : ""}
<p class="hx-small">School names come from the listing. Being near a school does not mean a home is zoned for it; confirm the zone with Horry County Schools.</p>`
    : `<section class="hx-teaser hx-glass"><h2>Free: everything else about this home</h2><p class="hx-small">Sign up once with your name, email and phone.</p><ul>`
      + `${teaser("camera", count > 1 ? `All ${count} photos` : "Every photo")}${teaser("home", "The description")}${teaser("lock", "The HOA fee and what it covers")}`
      + `${teaser("year", "Property taxes")}${teaser("area", "Days on market and the price history")}${teaser("lot", "Recent sales nearby")}</ul>`
      + `<button type="button" class="btn btn-brass" data-hx-signup>See full details</button></section>`;

  const side = `<aside class="hx-side hx-glass" aria-label="Tour or ask about this home"><p class="hx-l-price">${esc(headlinePrice(l))}</p><p class="hx-small">${esc(addressLine(l))}</p>`
    + `${tourButton(l, "Tour this home", "tour", "hx-primary")}${tourButton(l, "Ask a question", "question")}</aside>`;

  const [nearby, where] = await Promise.all([homesNearby(context, l), l.address ? (pinOf(l) ? { lat: pinOf(l).lat, lng: pinOf(l).lng } : geocode(l)) : null]);
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
<p class="hx-small"><a class="hx-maplist" href="/invest/long-term-rental/?mls=${esc(encodeURIComponent(l.mlsNumber))}">Run the rental numbers on this home</a></p>
${signedBar(r.json.tier)}</div><div class="hx-l-rest">${facts}${located}${more}</div>
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

/** "More homes in <subdivision>": a strip of up to 10 other homes there, closest in price. Empty on any trouble. */
async function homesNearby(context, l) {
  try {
    const sub = typeof l.subdivision === "string" ? l.subdivision.trim() : "";
    if (!/^[A-Za-z0-9 .,'&()\/-]{2,80}$/.test(sub)) return "";
    const p = new URLSearchParams({ subdivision: sub, size: "24" });
    const r = await crm(context.env, context.request, `/api/idx/listings?${p.toString()}`, { anonymous: true, timeoutMs: 2500 });
    const ls = r.status === 200 && r.json && r.json.ok && Array.isArray(r.json.listings) ? r.json.listings.filter((x) => x && x.mlsNumber !== l.mlsNumber) : [];
    if (ls.length < 3) return "";
    const price = typeof l.listPrice === "number" ? l.listPrice : 0;
    const pick = ls.slice().sort((a, b) => Math.abs((a.listPrice || 0) - price) - Math.abs((b.listPrice || 0) - price)).slice(0, 10).sort((a, b) => (a.listPrice || 0) - (b.listPrice || 0));
    const name = sub.toLowerCase().replace(/\b([a-z])/g, (c) => c.toUpperCase());
    // The page sits inside the shell's <main id="main">, so the guide pages' strip style applies.
    return `<div class="hx-strip" data-place="nearby" data-name="${esc(name)}"><p class="hx-s-head"><b>More homes for sale in ${esc(name)}</b></p>`
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
  const [r, hearts] = await Promise.all([crm(context.env, context.request, `/api/idx/listings?${p.toString()}`, { anonymous }), anonymous ? [] : heartsOf(context)]);
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
  if (r.status === 400 && r.json && r.json.error === "invalid") return json({ ok: false, field: r.json.field, message: FIELD_WORDS[r.json.field] || "Please check the form." }, 400);
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
