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
import { PREVIEW_COOKIE, clearCookie, crm, idxOn, sameOrigin, setCookie, visitorToken } from "../../idx-lib/crm.js";
import { PLACES } from "../../idx-lib/places.js";
import { NO_HOA_NOTE, placeParams } from "../../idx-lib/edge.js";
import { SMS_CONSENT_TEXT, TERMS_PARAGRAPHS, TERMS_TITLE, TERMS_VERSION, termsText } from "../../idx-lib/terms.js";
import {
  ICONS, STRIP_STYLE, STYLE, SCRIPT, addressLine, dayLong, disclaimer, esc, factsLine, grid, headlinePrice, heartButton,
  listingPath, listingToast, money, safeUrl, signupDialog, spaced, statusWord, stripCard, tourButton, tourDialog,
} from "../../idx-lib/render.js";

const SITE = "https://chapter3realty.com";
const PHONE = "(854) 333-2135";
const TYPES = [["", "Any type"], ["house", "House"], ["condo", "Condo"], ["townhouse", "Townhouse"], ["manufactured", "Manufactured"], ["multi", "2 to 4 units"], ["land", "Land"]];
const CITIES = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Pawleys Island", "Little River", "Conway", "Longs", "Loris", "Aynor", "Calabash"];
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
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405);
    if (!sameOrigin(request)) return json({ ok: false, error: "forbidden" }, 403);
    if (name === "signout") return new Response(null, { status: 303, headers: { Location: "/homes/", "Set-Cookie": clearCookie(), "Cache-Control": "no-store" } });
    if (!(request.headers.get("content-type") || "").includes("application/json")) return json({ ok: false, error: "invalid_body" }, 400);
    if (name === "register") return register(context);
    if (name === "views") return views(context);
    if (name === "hearts") return hearts(context);
    return json({ ok: false, error: "not_found" }, 404);
  }
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });

  try {
    return await route(context, url, path, gate);
  } catch {
    return trouble(context, gate, null, "Grand Strand homes for sale");
  }
}

async function route(context, url, path, gate) {
  // /homes/<MLS#> as the CRM's emails write it: find the listing's own URL.
  // "terms", "near" and "api" are our own pages, never MLS numbers.
  const bare = /^\/homes\/([A-Za-z0-9]{3,20})\/?$/.exec(path);
  if (bare && !["terms", "near", "api"].includes(bare[1].toLowerCase())) return bareListing(context, bare[1], gate);
  if (!path.endsWith("/")) return Response.redirect(`${SITE}${path}/${url.search}`, 301);

  const parts = path.split("/").filter(Boolean);
  if (parts.length === 1) return searchPage(context, url, gate);
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
  return `<label>${esc(label)}<select name="${name}">${options.map(([v, t]) => `<option value="${esc(v)}"${String(current ?? "") === String(v) ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
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
  if (signed && q.get("sold") === "1") p.set("sold", "1");
  const sort = q.get("sort");
  if (sort && ["newest", "price_asc", "price_desc"].includes(sort)) p.set("sort", sort);
  const pg = q.get("page");
  if (pg && /^\d{1,3}$/.test(pg)) p.set("page", String(Math.min(100, Math.max(1, +pg))));
  return p;
}

async function searchPage(context, url, gate, anonymous = false) {
  const q = url.searchParams;
  const p = searchParams(q, !anonymous && Boolean(visitorToken(context.request)));
  const filtered = [...p.keys()].length > 0;
  p.set("size", "24");
  const [r, hearts] = await Promise.all([crm(context.env, context.request, `/api/idx/listings?${p.toString()}`, { anonymous }), anonymous ? [] : heartsOf(context)]);
  if (!anonymous && badToken(r)) return publicView(context, (c) => searchPage(c, url, gate, true));
  if (r.status !== 200 || !r.json || !r.json.ok) return trouble(context, gate, r, "Grand Strand homes for sale");
  const j = r.json;
  const priceOpts = [["", "Any"], ...PRICES.map((v) => [String(v), money(v)])];
  const form = `<form class="hx-form" method="get" action="/homes/">
${select("city", "Town", [["", "All Grand Strand"], ...CITIES.map((c) => [c, c])], q.get("city"))}
${select("type", "Type", TYPES, q.get("type"))}
${select("min", "Min price", priceOpts, q.get("min"))}
${select("max", "Max price", priceOpts, q.get("max"))}
${select("beds", "Beds", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"], ["5", "5+"]], q.get("beds"))}
${select("baths", "Baths", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"]], q.get("baths"))}
${select("waterfront", "Water", [["", "Any"], ["1", "Waterfront"]], q.get("waterfront"))}
${select("sort", "Sort", [["newest", "Newest"], ["price_asc", "Price, low to high"], ["price_desc", "Price, high to low"]], q.get("sort"))}
${j.tier === "registered" ? select("sold", "Show", [["", "For sale"], ["1", "Sold, last 24 months"]], q.get("sold")) : ""}
<button class="btn btn-brass" type="submit">Search</button></form>`;
  const pageNo = Number.isInteger(j.page) && j.page > 0 ? j.page : 1;
  const pages = Math.min(100, Math.max(1, Math.ceil((j.total || 0) / (j.pageSize || 24))));
  const link = (n) => { const x = new URLSearchParams(p); x.delete("size"); x.set("page", String(n)); return `/homes/?${x.toString()}`; };
  const pager = pages > 1 ? `<nav class="hx-pager" aria-label="Pages">${pageNo > 1 ? `<a href="${esc(link(pageNo - 1))}">Previous</a>` : ""}<span>Page ${pageNo} of ${pages}</span>${pageNo < pages ? `<a href="${esc(link(pageNo + 1))}">Next</a>` : ""}</nav>` : "";
  const body = `${crumbs([["/", "Home"], [null, "Homes for sale"]])}
<h1>Grand Strand homes for sale</h1>
<p class="hx-lead">Homes for sale from Little River to Pawleys Island, from the Coastal Carolinas MLS, refreshed every few minutes. ${esc(String((j.total || 0).toLocaleString("en-US")))} homes match. Each card names its listing firm.</p>
${signedBar(j.tier)}${form}${grid(Array.isArray(j.listings) ? j.listings : [], hearts)}${pager}
${j.tier === "public" ? signupPrompt("Want every photo, the HOA fee and the taxes?") : ""}
${disclaimer(j.meta)}`;
  return page(context, gate, {
    title: "Grand Strand homes for sale",
    description: "Search Grand Strand homes for sale from the Coastal Carolinas MLS: Myrtle Beach, North Myrtle Beach, Surfside, Murrells Inlet, Pawleys Island and Conway.",
    canonical: `${SITE}/homes/`,
    robots: filtered ? "noindex, follow" : "index, follow",
    body,
  });
}

// ── one listing ─────────────────────────────────────────────────────────────

async function bareListing(context, mls, gate) {
  const r = await crm(context.env, context.request, `/api/idx/listings/${encodeURIComponent(mls)}?track=0`, { anonymous: true });
  if (r.status === 404) return notFound(context);
  if (r.status !== 200 || !r.json || !r.json.ok || !r.json.listing || typeof r.json.listing !== "object") return trouble(context, gate, r, "Home for sale");
  const to = listingPath(r.json.listing);
  if (to === `/homes/${mls}/`) return listingPage(context, mls, null, gate);
  return Response.redirect(`${SITE}${to}`, 301);
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
  if (slugPart !== null && `/homes/${slugPart}/` !== own) return Response.redirect(`${SITE}${own}`, 301);
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
      + `<div class="hx-l-tile hx-blur">${img(photo, "")}<button type="button" class="hx-l-tilebtn" data-hx-signup>${ICONS.lock}<span>${count > 1 ? `See all ${esc(count)} photos` : "See full details"}</span><small>Free sign-up</small></button></div>`
      + `<div class="hx-l-tile hx-soft">${img(photo, "")}<button type="button" class="hx-l-tilebtn hx-l-ask hx-tour" data-mls="${esc(l.mlsNumber)}" data-addr="${esc(addressLine(l))}" data-interest="tour">${ICONS.home}<span>Tour this home</span><small>An agent sets it up</small></button></div></div>`;
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
    + `${tourButton(l, "Tour this home", "tour", "hx-primary")}${tourButton(l, "Ask a question", "question")}`
    + `<div class="hx-side-row">${heartButton(l, hearted)}<span>${registered ? "Save it to your homes" : "Save it with a free sign-up"}</span></div></aside>`;

  const nearby = await homesNearby(context, l);
  const body = `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, l.city || "Listing"]])}
${media}
<div class="hx-l-grid"><div class="hx-l-info">
<p class="hx-l-price">${esc(headlinePrice(l))}</p>
<h1 class="hx-l-addr">${esc(addressLine(l))}</h1>
${pills}
<p class="hx-firm-line">Listed by ${esc(l.listingFirm || "the listing brokerage")}</p>
${signedBar(r.json.tier)}${facts}${more}
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
    extraBody: listingToast(l),
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

const FIELD_WORDS = { name: "Please enter your first and last name.", email: "Please check your email.", phone: "Please check your phone number.", termsAccepted: "Please tick the box to accept the terms.", turnstileToken: "Please complete the check above the button." };

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
