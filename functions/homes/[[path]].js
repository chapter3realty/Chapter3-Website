/**
 * chapter3realty.com/homes/* : the listing search, listing pages and "homes
 * near" place pages (CRM Ticket 404). Rendered here at the edge from the
 * CRM's listing API (idx-lib/crm.js), into the static shell
 * /homes-shell/index.html, which build.js stitches and audits like any page.
 *
 *   /homes/                     search (indexed; filtered views are noindex)
 *   /homes/<mls#>-<street>/     one listing (noindex unless IDX_INDEX_LISTINGS=1)
 *   /homes/near/                every place
 *   /homes/near/<slug>/         homes at a building / near a place (indexed when it has homes)
 *   /homes/terms/               the listing search terms of use
 *   POST /homes/api/register    sign-up, sets the visitor cookie
 *   GET  /homes/api/signout     clears it
 *
 * OFF until IDX_LIVE=1 in Cloudflare Pages settings (idx-lib/crm.js). Before
 * that: CCMLS 16.3 notice to CCAR, the CRM checklist in docs/idx-website.md.
 */
import {
  STYLE,
  SCRIPT,
  addressLine,
  dayLong,
  disclaimer,
  esc,
  factsLine,
  grid,
  money,
  safeUrl,
  signupDialog,
  signupPrompt,
} from "../../idx-lib/render.js";
import { COOKIE, PREVIEW_COOKIE, crm, idxOn } from "../../idx-lib/crm.js";
import { SMS_CONSENT_TEXT, TERMS_PARAGRAPHS, TERMS_TITLE, TERMS_VERSION, termsText } from "../../idx-lib/terms.js";

const SITE = "https://chapter3realty.com";
const TERMS = { title: TERMS_TITLE, paragraphs: TERMS_PARAGRAPHS, smsConsentText: SMS_CONSENT_TEXT };

const CITIES = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Pawleys Island", "Little River", "Conway", "Longs", "Loris"];
const TYPES = [
  ["", "Any type"],
  ["house", "House"],
  ["condo", "Condo"],
  ["townhouse", "Townhouse"],
  ["manufactured", "Manufactured"],
  ["multi", "2-4 units"],
  ["land", "Land / lot"],
];
const PRICES = [100000, 150000, 200000, 250000, 300000, 350000, 400000, 500000, 600000, 750000, 1000000, 1500000, 2000000];

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, "/") || "/";

  // The owner's preview: /homes/?idxpreview=<word> once sets a cookie.
  if (env.IDX_PREVIEW_WORD && url.searchParams.get("idxpreview") === env.IDX_PREVIEW_WORD) {
    url.searchParams.delete("idxpreview");
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.pathname + url.search,
        "Set-Cookie": `${PREVIEW_COOKIE}=${encodeURIComponent(env.IDX_PREVIEW_WORD)}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }

  const gate = idxOn(env, request);
  if (!gate.on) return notFound(context);

  if (path === "/homes/api/register/" || path === "/homes/api/register") return register(context);
  if (path.startsWith("/homes/api/signout")) {
    return new Response(null, {
      status: 302,
      headers: { Location: "/homes/", "Set-Cookie": `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`, "Cache-Control": "no-store" },
    });
  }
  if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });

  // Canonical URLs end in a slash.
  if (!url.pathname.endsWith("/")) return Response.redirect(`${SITE}${url.pathname}/${url.search}`, 301);

  const parts = path.split("/").filter(Boolean); // ["homes", ...]
  if (parts.length === 1) return searchPage(context, url, gate);
  if (parts[1] === "terms" && parts.length === 2) return termsPage(context, gate);
  if (parts[1] === "near" && parts.length === 2) return placesIndex(context, gate);
  if (parts[1] === "near" && parts.length === 3) return placePage(context, parts[2], gate);
  if (parts.length === 2 && /^[A-Za-z0-9]+(-[a-z0-9-]*)?$/.test(parts[1])) return listingPage(context, parts[1], gate);
  return notFound(context);
}

// ── shell ───────────────────────────────────────────────────────────────────

async function notFound(context) {
  const res = await context.env.ASSETS.fetch(new Request(new URL("/404.html", context.request.url)));
  return new Response(res.body, { status: 404, headers: { "content-type": "text/html; charset=utf-8" } });
}

/**
 * The page: the stitched shell with its head and #hx-root filled in. `robots`
 * is forced to noindex while previewing.
 */
async function page(context, gate, { title, description, canonical, robots, body, status = 200, cache = "public" }) {
  const shell = await context.env.ASSETS.fetch(new Request(new URL("/homes-shell/", context.request.url)));
  const fullTitle = `${title} | Chapter3 Realty`;
  const robotsWord = gate.preview ? "noindex, nofollow" : robots;
  const setAttr = (attr, value) => ({ element: (el) => el.setAttribute(attr, value) });
  const rewritten = new HTMLRewriter()
    .on("title", { element: (el) => el.setInnerContent(fullTitle) })
    .on('meta[name="description"]', setAttr("content", description))
    .on('meta[name="robots"]', setAttr("content", robotsWord))
    .on('link[rel="canonical"]', setAttr("href", canonical))
    .on('meta[property="og:title"]', setAttr("content", fullTitle))
    .on('meta[property="og:description"]', setAttr("content", description))
    .on('meta[property="og:url"]', setAttr("content", canonical))
    .on('meta[name="twitter:title"]', setAttr("content", fullTitle))
    .on('meta[name="twitter:description"]', setAttr("content", description))
    .on('script[type="application/ld+json"]', {
      element: (el) =>
        el.setInnerContent(JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: fullTitle, url: canonical, publisher: { "@type": "RealEstateAgent", name: "Chapter3 Realty" } }), { html: true }),
    })
    .on("#hx-root", { element: (el) => el.setInnerContent(`${STYLE}${body}${signupDialog(TERMS)}${SCRIPT}`, { html: true }) })
    .transform(shell);
  const headers = new Headers(rewritten.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", cache === "public" && !gate.preview ? "public, max-age=300" : "private, no-store");
  headers.set("x-robots-tag", robotsWord);
  return new Response(rewritten.body, { status, headers });
}

function unavailable(context, gate, title) {
  return page(context, gate, {
    title,
    description: "Grand Strand homes for sale from the Coastal Carolinas MLS, updated every few minutes, with Chapter3 Realty in Myrtle Beach.",
    canonical: `${SITE}/homes/`,
    robots: "noindex, follow",
    status: 503,
    cache: "private",
    body: `<h1>${esc(title)}</h1><p class="hx-lead">The listing search is being updated. Please try again in a few minutes, or <a href="/contact/">contact us</a> and an agent will run the search for you.</p>`,
  });
}

function crumbs(items) {
  return `<nav class="hx-crumbs" aria-label="Breadcrumb">${items.map(([href, label]) => (href ? `<a href="${href}">${esc(label)}</a>` : `<span>${esc(label)}</span>`)).join(" / ")}</nav>`;
}

function tierBar(tier) {
  return tier === "registered"
    ? `<p class="hx-small">You are signed up and see full listing details. <a href="/homes/api/signout">Sign out</a></p>`
    : "";
}

// ── search ──────────────────────────────────────────────────────────────────

function select(name, label, options, current) {
  return `<label>${esc(label)}<select name="${name}">${options.map(([v, t]) => `<option value="${esc(v)}"${String(current ?? "") === String(v) ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></label>`;
}

async function searchPage(context, url, gate) {
  const q = url.searchParams;
  const allowed = ["city", "type", "min", "max", "beds", "baths", "sort", "page", "sold"];
  const params = new URLSearchParams();
  for (const k of allowed) {
    const v = q.get(k);
    if (v) params.set(k, v.slice(0, 40));
  }
  params.set("size", "24");
  const r = await crm(context.env, context.request, `/api/idx/listings?${params.toString()}`);
  if (r.status === 503 || !r.json) return unavailable(context, gate, "Grand Strand homes for sale");
  const j = r.json;
  const filtered = [...q.keys()].some((k) => allowed.includes(k));
  const priceOpts = [["", "Any"], ...PRICES.map((p) => [String(p), money(p)])];
  const form = `<form class="hx-form" method="get" action="/homes/">
${select("city", "Town", [["", "All Grand Strand"], ...CITIES.map((c) => [c, c])], q.get("city"))}
${select("type", "Type", TYPES, q.get("type"))}
${select("min", "Min price", priceOpts, q.get("min"))}
${select("max", "Max price", priceOpts, q.get("max"))}
${select("beds", "Beds", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"], ["5", "5+"]], q.get("beds"))}
${select("baths", "Baths", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"]], q.get("baths"))}
${select("sort", "Sort", [["newest", "Newest"], ["price_asc", "Price, low to high"], ["price_desc", "Price, high to low"]], q.get("sort"))}
${j.tier === "registered" ? select("sold", "Show", [["", "For sale"], ["1", "Sold, last 24 months"]], q.get("sold")) : ""}
<button class="btn btn-brass" type="submit">Search</button></form>`;
  const pageNo = j.page || 1;
  const pages = Math.max(1, Math.ceil((j.total || 0) / (j.pageSize || 24)));
  const link = (n) => {
    const p = new URLSearchParams(q);
    p.set("page", String(n));
    return `/homes/?${p.toString()}`;
  };
  const pager =
    pages > 1
      ? `<nav class="hx-pager" aria-label="Pages">${pageNo > 1 ? `<a href="${link(pageNo - 1)}">Previous</a>` : ""}<span>Page ${pageNo} of ${Math.min(pages, 100)}</span>${pageNo < Math.min(pages, 100) ? `<a href="${link(pageNo + 1)}">Next</a>` : ""}</nav>`
      : "";
  const body = `${crumbs([["/", "Home"], [null, "Homes for sale"]])}
<h1>Grand Strand homes for sale</h1>
<p class="hx-lead">Homes for sale from Little River to Pawleys Island, from the Coastal Carolinas MLS, updated every few minutes. ${esc((j.total || 0).toLocaleString("en-US"))} homes match. Most are listed by other brokerage firms; each card names the firm.</p>
${tierBar(j.tier)}${form}${grid(j.listings || [])}${pager}
${j.tier === "public" ? signupPrompt("Want photos, price history and sold prices?") : ""}
<p class="hx-small"><a href="/homes/near/">Homes near condo buildings, hospitals, schools, parks and beaches</a></p>
${disclaimer(j.meta)}`;
  return page(context, gate, {
    title: "Grand Strand homes for sale",
    description: "Search Grand Strand homes for sale from the Coastal Carolinas MLS: Myrtle Beach, North Myrtle Beach, Surfside, Murrells Inlet, Pawleys Island and Conway.",
    canonical: `${SITE}/homes/`,
    robots: filtered ? "noindex, follow" : "index, follow",
    body,
    cache: j.tier === "public" ? "public" : "private",
  });
}

// ── one listing ─────────────────────────────────────────────────────────────

function row(label, value) {
  return value === null || value === undefined || value === "" ? "" : `<tr><th scope="row">${esc(label)}</th><td>${esc(value)}</td></tr>`;
}

async function listingPage(context, slug, gate) {
  const mls = slug.split("-")[0];
  const r = await crm(context.env, context.request, `/api/idx/listings/${encodeURIComponent(mls)}`);
  if (r.status === 503 || (!r.json && r.status !== 404)) return unavailable(context, gate, "Home for sale");
  if (r.status === 404 || !r.json || !r.json.listing) {
    // Sold, withdrawn or never ours to show: the same answer for all.
    return page(context, gate, {
      title: "This home is no longer available",
      description: "This listing is no longer on the market. Search current Grand Strand homes for sale from the Coastal Carolinas MLS with Chapter3 Realty.",
      canonical: `${SITE}/homes/`,
      robots: "noindex, follow",
      status: 404,
      body: `<h1>This home is no longer available</h1><p class="hx-lead">It may have sold or been taken off the market. <a href="/homes/">Search homes for sale</a>.</p>`,
    });
  }
  const l = r.json.listing;
  if (l.slug !== slug) return Response.redirect(`${SITE}/homes/${encodeURIComponent(l.slug)}/`, 301);
  const registered = r.json.tier === "registered";
  const canonical = `${SITE}/homes/${encodeURIComponent(l.slug)}/`;
  const headline = l.status === "Sold" ? (l.soldPrice ? `Sold for ${money(l.soldPrice)}` : "Sold") : money(l.price);
  const photo = safeUrl(l.photo);
  const photos = registered ? (l.photos || []).filter((p) => safeUrl(p.url)) : [];
  const gallery = photos.length
    ? `<div class="hx-gallery">${photos.map((p, i) => `<img src="${esc(p.url)}" alt="${esc(p.caption || `Photo ${i + 1} of ${addressLine(l)}`)}" loading="${i < 3 ? "eager" : "lazy"}" referrerpolicy="no-referrer">`).join("")}</div>`
    : photo
      ? `<div class="hx-hero-photo"><img src="${esc(photo)}" alt="${esc(addressLine(l))}" referrerpolicy="no-referrer"></div>`
      : "";
  const basics = `<table class="hx-table"><tbody>
${row("Status", l.status)}${row("Type", [l.propertyType, l.propertySubType].filter(Boolean).join(", "))}
${row("Bedrooms", l.beds)}${row("Bathrooms", l.baths)}${row("Living area", typeof l.sqft === "number" ? `${l.sqft.toLocaleString("en-US")} sq ft` : "")}
${row("Lot", typeof l.lotAcres === "number" ? `${l.lotAcres} acres` : "")}${row("Year built", l.yearBuilt)}
${row("Subdivision", l.subdivision)}${row("Waterfront", l.waterfront ? "Yes" : "")}${row("MLS number", l.mlsNumber)}
${registered ? row("Listed on", dayLong(l.listedOn)) + row("Days on market", l.daysOnMarket) + row("Original list price", l.originalPrice ? money(l.originalPrice) : "") + row("Sold on", dayLong(l.soldOn)) : ""}
</tbody></table>`;
  const more = registered
    ? `${l.remarks ? `<h2>Description</h2><p class="hx-lead">${esc(l.remarks)}</p>` : ""}
${(l.features || []).length ? `<h2>Details</h2><table class="hx-table"><tbody>${l.features.map((f) => row(f.label, f.value)).join("")}</tbody></table>` : ""}
${(l.openHouses || []).length ? `<h2>Open houses</h2><ul>${l.openHouses.map((o) => `<li>${esc(new Date(o.startsAt).toLocaleString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }))}</li>`).join("")}</ul>` : ""}
${safeUrl(l.virtualTour) ? `<p><a href="${esc(l.virtualTour)}" rel="nofollow noopener" target="_blank">Virtual tour</a></p>` : ""}
${l.listingAgent ? `<p class="hx-small">Listing agent: ${esc(l.listingAgent)}, ${esc(l.listingFirm || "")}</p>` : ""}
<p class="hx-small">School names come from the listing. Confirm a home's school zone with Horry County Schools before you rely on it.</p>`
    : signupPrompt("See every photo, the description, HOA fees, taxes and price history.");
  const body = `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, l.city || "Listing"]])}
<h1>${esc(addressLine(l))}</h1>
<p class="hx-keyfacts"><strong>${esc(headline)}</strong><span>${esc(factsLine(l))}</span></p>
<p class="hx-firm" style="font-size:1rem">Listed by ${esc(l.listingFirm || "the listing brokerage")}. Source: CCMLS.</p>
${tierBar(r.json.tier)}${gallery}${basics}${more}
<p><a class="btn btn-brass" href="/contact/">Ask an agent about this home</a></p>
${disclaimer(r.json.meta)}`;
  const desc = `${headline}. ${factsLine(l)}. ${addressLine(l)}. Listed by ${l.listingFirm || "the listing brokerage"}. Source: CCMLS.`.slice(0, 160);
  return page(context, gate, {
    title: l.address ? `${l.address}, ${l.city || ""}` : `Home for sale in ${l.city || "the Grand Strand"}`,
    description: desc,
    canonical,
    robots: context.env.IDX_INDEX_LISTINGS === "1" ? "index, follow" : "noindex, follow",
    body,
    cache: registered ? "private" : "public",
  });
}

// ── places ──────────────────────────────────────────────────────────────────

const KIND_TITLES = {
  condo_building: "Oceanfront condo buildings",
  district: "Districts",
  hospital: "Hospitals",
  school: "Public high schools",
  park: "Parks",
  beach: "Beaches",
};

async function placesIndex(context, gate) {
  const r = await crm(context.env, context.request, "/api/idx/places", { anonymous: true });
  if (!r.json || !r.json.ok) return unavailable(context, gate, "Homes near Grand Strand places");
  const byKind = {};
  for (const p of r.json.places) (byKind[p.kind] = byKind[p.kind] || []).push(p);
  const sections = Object.keys(KIND_TITLES)
    .filter((k) => byKind[k])
    .map((k) => `<h2>${esc(KIND_TITLES[k])}</h2><ul>${byKind[k].map((p) => `<li><a href="/homes/near/${esc(p.slug)}/">Homes near ${esc(p.name)}</a></li>`).join("")}</ul>`)
    .join("");
  return page(context, gate, {
    title: "Homes near Grand Strand places",
    description: "Grand Strand homes for sale by place: oceanfront condo buildings, hospitals, schools, parks, beaches and Market Common, from the Coastal Carolinas MLS.",
    canonical: `${SITE}/homes/near/`,
    robots: "index, follow",
    body: `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, "By place"]])}<h1>Homes near Grand Strand places</h1><p class="hx-lead">Homes for sale at a building or near a place you know. Distances are straight-line miles.</p>${sections}`,
  });
}

function pageLabel(path) {
  const last = path.split("/").filter(Boolean).pop() || "";
  return last.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

async function placePage(context, slug, gate) {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return notFound(context);
  const r = await crm(context.env, context.request, `/api/idx/places/${slug}`);
  if (r.status === 404) return notFound(context);
  if (r.status === 503 || !r.json || !r.json.ok) return unavailable(context, gate, "Homes near this place");
  const { place, listings, meta, tier } = r.json;
  const isBuilding = place.kind === "condo_building";
  const schoolNote =
    place.kind === "school"
      ? `<p class="hx-small">Being near a school does not mean a home is zoned for it. Check the attendance zone with <a href="https://www.horrycountyschools.net/" rel="noopener">Horry County Schools</a>.</p>`
      : "";
  const related = (place.pages || []).length
    ? `<p class="hx-small">Read more: ${place.pages.map((p) => `<a href="${esc(p)}">${esc(pageLabel(p))}</a>`).join(" · ")}</p>`
    : "";
  const title = isBuilding ? `${place.name} condos for sale` : `Homes for sale near ${place.name}`;
  const body = `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], ["/homes/near/", "By place"], [null, place.name]])}
<h1>${esc(title)}</h1>
<p class="hx-lead">${esc(place.intro)} ${esc(String(listings.length))} ${listings.length === 1 ? "home" : "homes"} for sale now. Most are listed by other brokerage firms; each card names the firm.</p>
${schoolNote}${tierBar(tier)}${grid(listings, (l) => l.miles)}
${tier === "public" && listings.length ? signupPrompt("See photos, HOA fees and price history for these homes.") : ""}
${related}
${disclaimer(meta)}`;
  return page(context, gate, {
    title,
    description: `${title}, from the Coastal Carolinas MLS and updated every few minutes. ${place.intro}`.slice(0, 160),
    canonical: `${SITE}/homes/near/${slug}/`,
    // A place with no homes for sale is a thin page.
    robots: listings.length ? "index, follow" : "noindex, follow",
    body,
    cache: tier === "public" ? "public" : "private",
  });
}

// ── terms ───────────────────────────────────────────────────────────────────

function termsPage(context, gate) {
  return page(context, gate, {
    title: TERMS_TITLE,
    description: "The terms of use for Chapter3 Realty's listing search: personal use only, what we record, texts only with your separate consent, and how to stop.",
    canonical: `${SITE}/homes/terms/`,
    robots: "noindex, follow",
    body: `${crumbs([["/", "Home"], ["/homes/", "Homes for sale"], [null, "Terms"]])}<h1>${esc(TERMS_TITLE)}</h1><p class="hx-small">Version ${esc(TERMS_VERSION)}</p>${TERMS_PARAGRAPHS.map((p) => `<p class="hx-lead">${esc(p)}</p>`).join("")}`,
  });
}

// ── sign-up ─────────────────────────────────────────────────────────────────

async function register(context) {
  const { request, env } = context;
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  // Same-site posts only: another site cannot sign a visitor up.
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  let b;
  try {
    b = await request.json();
  } catch {
    return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  }
  if (typeof b !== "object" || b === null) return Response.json({ ok: false, error: "invalid body" }, { status: 400 });
  // The wording comes from HERE, not the browser: this function rendered it,
  // so it knows exactly what was on screen.
  const sms = b.smsConsent === true;
  const r = await crm(env, request, "/api/idx/register", {
    method: "POST",
    anonymous: true,
    body: {
      firstName: b.firstName,
      lastName: b.lastName,
      email: b.email,
      phone: b.phone,
      website: b.website,
      termsAccepted: b.termsAccepted === true,
      termsVersion: TERMS_VERSION,
      termsText: termsText(),
      smsConsent: sms,
      smsConsentText: sms ? SMS_CONSENT_TEXT : null,
      page: typeof b.page === "string" ? b.page.slice(0, 200) : null,
    },
  });
  if (!r.json) return Response.json({ ok: false, error: "Sign-up is unavailable right now. Please try again shortly." }, { status: 502 });
  if (!r.json.ok) return Response.json({ ok: false, error: r.json.error || "Please check the form." }, { status: r.status || 400 });
  const headers = { "cache-control": "no-store" };
  if (r.json.token) headers["set-cookie"] = `${COOKIE}=${encodeURIComponent(r.json.token)}; Path=/; Max-Age=${90 * 86400}; HttpOnly; Secure; SameSite=Lax`;
  return Response.json({ ok: true }, { headers });
}

