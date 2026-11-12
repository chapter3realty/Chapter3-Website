/**
 * The listing search's controls, against a mock CRM that answers as contract v1 says.
 * No network, no key. Run: node tools/idx-test.mjs   (prints "all controls pass")
 */
import fs from "node:fs";
import path from "node:path";
import { onRequest as homes } from "../functions/homes/[[path]].js";
import { onRequest as mw } from "../functions/_middleware.js";
import { onRequest as sitemap } from "../functions/sitemap-homes.xml.js";
import { placeFeed, placeParams } from "../idx-lib/edge.js";
import { FEEDS, postFilter, rankHomes } from "../idx-lib/feeds.js";
import { filterBar } from "../idx-lib/filters.js";
import { featureList } from "../idx-lib/features.js";
import { readQuery } from "../idx-lib/query.js";
import { nearbySales, flipMath, FLIP_DEFAULTS, repairTier } from "../idx-lib/deals.js";
import { photo, photoUrl, warm, ourPhoto } from "../idx-lib/photo.js";
import { resetCatalog } from "../idx-lib/catalog.js";
import { SCRIPT, STYLE, PHOTO_FIX, PHOTO_HINT, hasPhoto, stripCards, NO_PHOTO } from "../idx-lib/render.js";
const STYLE_OK = () => STYLE.includes(".hx-dialog form[hidden]{display:none}");
import { MAP_SCRIPT } from "../idx-lib/map.js";

const ROOT = path.resolve("chapter3realty");
let fails = 0;
const check = (name, ok) => { console.log(`${ok ? "ok  " : "FAIL"} ${name}`); if (!ok) fails++; };

const META = { source: "Coastal Carolinas Association of REALTORS® Multiple Listing Service (CCMLS)", disclaimer: "Listing information is provided by the MLS.", refreshedAt: "2026-10-21T01:50:53.606Z", fresh: true };
const mk = (i, extra = {}) => ({ mlsNumber: String(2600000 + i), status: "Active", listPrice: 200000 + i * 25000, beds: 3, baths: 2, sqft: 1500, lotAcres: null, yearBuilt: 2005,
  propertyType: "Residential", propertySubType: "SingleFamilyResidence", address: `${100 + i} Test St`, city: "Myrtle Beach", state: "SC", postalCode: "29577",
  subdivision: "TEST", waterfront: null, photo: `https://photos.example.com/${i}.jpg`, photoCount: 20, listingFirm: `Firm ${i}`, ...(MAPPOINTS && i % 3 ? { point: { lat: 33.7 + i / 1000, lng: -78.9 } } : {}), ...extra });
const DEV_TOKEN = "eyJ2aXNpdG9ySWQiOiJ2MSIsInRlcm1zVmVyc2lvbiI6InYxLWRyYWZ0LTEiLCJleHBpcmVzQXQiOjk5OTk5OTk5OTl9.c2ln";
const calls = [];
let STALE = false;
let CENSUS = false, CENSUS_CALLS = 0;
let MAPPOINTS = false;
let BIG = false;
let sent2 = "";
let HANG = false;
let INVALID = false;
let INVALID_TS = false;
let APPLIED = false;
let REMARKS_API = false; // CRM Ticket 557: /api/idx/remarks, any visitor
let CATALOG = false;
let FLAKY = 0, SIGNED_DOWN = false;
let NOPHOTO = false; // every third home has no photo (photo null, photoCount 0)
globalThis.fetch = async (input, init = {}) => {
  const u = new URL(typeof input === "string" ? input : input.url);
  calls.push({ url: u.toString(), init });
  const auth = (init.headers || {}).authorization;
  const tier = auth ? "registered" : "public";
  const J = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
  if (u.hostname === "geocoding.geo.census.gov" && u.pathname.endsWith("/addressbatch")) {
    CENSUS_CALLS++;
    const rows = (await init.body.get("addressFile").text()).split("\n");
    return new Response(rows.map((r) => { const id = /^"(\d+)"/.exec(r)[1]; return CENSUS ? `"${id}","x","Match","Exact","X","-78.9,33.71","1","L"` : `"${id}","x","No_Match"`; }).join("\n"));
  }
  if (u.hostname === "geocoding.geo.census.gov") {
    CENSUS_CALLS++;
    return CENSUS ? J({ result: { addressMatches: [{ coordinates: { x: -78.9, y: 33.71 } }] } }) : J({ result: { addressMatches: [] } });
  }
  if (u.hostname === "api-proxy.chapter3realty.workers.dev") {
    // The AI: every home it was given fits, with a reason from its description.
    const prompt = JSON.parse(init.body).messages[0].content;
    const ms = [...prompt.matchAll(/"(?:mls|m)":"(\w+)"/g)].map((x) => x[1]).filter((m) => m !== "MLS");
    return J({ content: [{ type: "text", text: JSON.stringify({ r: ms.map((m) => ({ m, fit: m.endsWith("2") ? "no" : "yes", why: "private dock on a canal" })) }) }] });
  }
  if ((init.headers || {})["x-idx-key"] !== "devkey") return J({ ok: false, error: "forbidden" }, 403);
  if (u.pathname === "/api/idx/filters") {
    if (!CATALOG) return J({ ok: false, error: "unavailable" }, 503);
    const f = (key, label, group, n) => ({ key, label, group, params: ["has", "not"], forSale: n });
    return J({ ok: true, meta: META, countedAt: "2026-10-27T10:00:00Z", forSale: 9000, filters: [f("pool", "Private pool", "outside", 900), f("walk_to_beach", "Walk to the beach", "place", 700),
      f("marshwalk_1mi", "Within 1 mi of the MarshWalk", "place", 80), f("private_dock", "Private dock", "water", 300), f("golf_cart_ok", "Golf carts allowed", "community", 120),
      f("never_listed", "Nothing", "inside", 0), { key: "price", label: "Price", group: "price", params: ["min", "max"], forSale: null }] });
  }
  if (u.pathname === "/api/idx/claim") {
    const b = JSON.parse(init.body);
    if (b.k === "Good12345678") return J({ ok: true, token: DEV_TOKEN, firstName: "Sam", dryRun: true });
    if (b.k === "Terms1234567") return b.termsAccepted ? J({ ok: true, token: DEV_TOKEN, firstName: "Sam" }) : J({ ok: true, needsTerms: true, firstName: "Sam" });
    return J({ ok: false, error: "link_expired" });
  }
  if (u.pathname === "/api/idx/returning") {
    const b = JSON.parse(init.body);
    return b.phone === "8435550199" && b.firstName === "Sam" ? J({ ok: true, token: DEV_TOKEN, dryRun: true }) : J({ ok: false, error: "not_found" });
  }
  if (STALE) return J({ ok: false, error: "stale" }, 503);
  if (FLAKY > 0) { FLAKY--; return new Response("bad gateway", { status: 502 }); }
  if (SIGNED_DOWN && auth && /^\/api\/idx\/listings\/\w+$/.test(u.pathname)) return new Response("bad gateway", { status: 502 });
  if (HANG) return new Promise((_, no) => init.signal && init.signal.addEventListener("abort", () => no(new Error("aborted"))));
  if (INVALID && auth) return J({ ok: false, error: "unauthorized", visitor: "invalid" }, 401);
  if (REMARKS_API && u.pathname === "/api/idx/remarks") {
    return J({ ok: true, meta: META, rows: (u.searchParams.get("mls") || "").split(",").map((m) => ({ mls: m, remarks: `A home with a private dock, ${m}.`, details: { WaterfrontFeatures: ["Boat Dock"], ElementarySchool: "X" }, type: "Single Family Residence", status: "Active" })) });
  }
  if (u.pathname === "/api/idx/listings") {
    if ((u.searchParams.get("has") || "").includes("walk_to_beach") && u.searchParams.get("city") === "Loris") return J({ ok: true, tier, visitor: "none", meta: META, listings: [], total: 0 });
    const sub = u.searchParams.get("subdivision"), near = u.searchParams.get("near");
    const n = BIG ? 4041 : sub === "Tidewater" ? 2 : sub || near ? 14 : 30;
    const ls = Array.from({ length: Math.min(n, 48) }, (_, i) => mk(i + 48 * ((+u.searchParams.get("page") || 1) - 1), near ? { miles: 0.4 } : {}))
      .map((l, i) => (NOPHOTO && i % 3 === 0 ? { ...l, photo: null, photoCount: 0 } : l));
    return J({ ok: true, tier, visitor: auth ? "valid" : "none", meta: META, ...(APPLIED ? { applied: ["has"].filter((x) => u.searchParams.has(x)) } : {}), listings: ls.slice(0, +u.searchParams.get("size") || 24), total: n, page: 1, pageSize: 24 });
  }
  const one = /^\/api\/idx\/listings\/(\w+)$/.exec(u.pathname);
  if (one) {
    if (one[1] === "404404") return J({ ok: false, error: "not_found" }, 404);
    const l = mk(1, { mlsNumber: one[1], ...(one[1] === "2611111" ? { address: null } : {}), ...(one[1] === "2622222" ? { address: "1 $' $` $& Way" } : {}), ...(NOPHOTO ? { photo: null, photoCount: 0 } : {}) });
    const full = auth ? { ...l, photos: [{ url: "https://photos.example.com/a.jpg", caption: "Front <b>" }], remarks: "Line one\n<script>x</script>", details: { Appliances: ["Dishwasher", "Range"], PoolPrivateYN: false, AssociationFee: 614 }, openHouses: [], listingAgent: "Pat Agent", point: null, virtualTour: "javascript:alert(1)" } : l;
    return J({ ok: true, tier, visitor: auth ? "valid" : "none", meta: META, listing: full, viewId: auth && u.searchParams.get("track") !== "0" ? "4f6c0f0e-6a53-4f3a-9a8e-0b9b5b9d2c11" : null });
  }
  if (u.pathname === "/api/idx/hearts" && (init.method || "GET") === "GET") return J({ ok: true, visitor: "valid", hearts: ["2600001"] });
  if (u.pathname === "/api/idx/register") {
    if (INVALID_TS) return J({ ok: false, error: "invalid", field: "turnstileToken", message: "x" }, 400);
    const b = JSON.parse(init.body);
    if (!b.termsAccepted) return J({ ok: false, error: "invalid", field: "termsAccepted", message: "x" }, 400);
    return J({ ok: true, token: DEV_TOKEN, dryRun: true });
  }
  if (u.pathname === "/api/idx/views") return J({ ok: true, updated: 0 });
  if (u.pathname === "/api/idx/hearts") return J({ ok: true, loved: JSON.parse(init.body).loved, saved: false });
  if (u.pathname === "/api/idx/sitemap") return J({ ok: true, meta: META, total: 2, listings: [{ mlsNumber: "2600001", address: "1 A St", city: "Myrtle Beach", state: "SC", updatedOn: "2026-10-20" }, { mlsNumber: "2600002", address: null, city: "Conway", state: "SC", updatedOn: "2026-10-19" }] });
  return J({ ok: false, error: "not_found" }, 404);
};
const ASSETS = { fetch: async (req) => {
  const p = new URL(req.url).pathname;
  const f = p.endsWith("/") ? path.join(ROOT, p, "index.html") : path.join(ROOT, p);
  return fs.existsSync(f) ? new Response(fs.readFileSync(f), { headers: { "content-type": f.endsWith(".html") ? "text/html; charset=utf-8" : "application/octet-stream" } }) : new Response("nf", { status: 404 });
} };
const ENV = { IDX_LIVE: "1", IDX_DEV_KEY: "devkey", TURNSTILE_SITE_KEY: "0xSITE", ASSETS };
const req = (p, o = {}) => new Request(`https://chapter3realty.com${p}`, o);
const run = (fn, r, env = ENV) => fn({ request: r, env, next: async () => ASSETS.fetch(r) });

// Off by default.
check("off: /homes/ is a 404 without IDX_LIVE", (await run(homes, req("/homes/"), { ...ENV, IDX_LIVE: "" })).status === 404);
check("off: a guide page is untouched", !(await (await run(mw, req("/buyers/best-neighborhoods/"), { ...ENV, IDX_LIVE: "" })).text()).includes('<article class="hx-c">'));

// Search.
let r = await run(homes, req("/homes/"));
let t = await r.text();
check("search: 200 with cards", r.status === 200 && (t.match(/<article class="hx-c">/g) || []).length === 24);
check("search: every card names its listing firm and the source", (t.match(/MLS #\d+, Firm \d+\. Listing provided by CCMLS\./g) || []).length === 24);
check("search: source, disclaimer and Updated", t.includes("CCMLS") && t.includes("Listing information is provided by the MLS.") && t.includes("Updated October"));
check("search: our full firm name linked home", t.includes('<a href="/">Chapter3 Realty, Corp.</a>'));
check("search: indexed when unfiltered", t.includes('<meta name="robots" content="index, follow">'));
check("search: the sign-up and tour dialogs and terms box unticked", t.includes('id="hx-signup"') && t.includes('name="termsAccepted">') && !t.includes('name="termsAccepted" checked'));
check("search: the page script arrives whole ($$ kept)", t.includes("function $$("));
check("search: Turnstile site key in the page, no key anywhere", t.includes('data-sitekey="0xSITE"') && !t.includes("devkey"));
r = await run(homes, req("/homes/?city=Myrtle%20Beach&min=200000&evil=1&near=0,0"));
const sent = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
check("search: only validated filters reach the CRM", sent.includes("city=Myrtle+Beach") && sent.includes("min=200000") && !sent.includes("evil") && !sent.includes("near"));
check("search: filtered view is noindex", (await r.text()).includes("noindex, follow"));
check("search: the CRM key and client IP are sent", calls.at(-1).init.headers["x-idx-key"] === "devkey" && "x-idx-client-ip" in calls.at(-1).init.headers);

// One listing.
r = await run(homes, req("/homes/2600005"));
check("bare /homes/<MLS#> 301s to the listing's own URL", r.status === 301 && r.headers.get("location") === "https://chapter3realty.com/homes/2600005-101-test-st-myrtle-beach/");
check("bare fetch uses track=0", calls.some((c) => c.url.endsWith("/api/idx/listings/2600005?track=0")));
r = await run(homes, req("/homes/2600005-wrong-slug/"));
check("a wrong slug 301s to the right one", r.status === 301);
r = await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/"));
t = await r.text();
check("listing: public page with one photo and the sign-up wall", r.status === 200 && t.includes("1 of 20 photos") && t.includes("hx-locked") && !t.includes('class="hx-remarks"'));
check("listing: firm line on the page", t.includes("Listed by Firm 1"));
check("listing: RealEstateListing schema with the price", t.includes('"@type":"RealEstateListing"') && t.includes('"price":225000'));
check("listing: noindex by default", t.includes("noindex, follow"));
r = await run(homes, req("/homes/2611111"));
t = await r.text();
check("address withheld: town only, no street in the URL", r.status === 200 && t.includes('<h1 class="hx-l-addr">Myrtle Beach, SC</h1>') && !/<title>[^<]*Test St/.test(t) && !t.split('class="hx-strip"')[0].includes("Test St"));
r = await run(homes, req("/homes/404404-gone/"));
check("listing: not found is a 404 page", r.status === 404);

// Signed up.
const cookie = { headers: { Cookie: `c3_idx=${DEV_TOKEN}` } };
r = await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/", cookie));
t = await r.text();
check("signed up: full listing, private, not cached", t.includes("hx-remarks") && r.headers.get("cache-control") === "private, no-store");
check("signed up: remarks and captions escaped", t.includes("&lt;script&gt;x&lt;/script&gt;") && t.includes("Front &lt;b&gt;") && !t.includes("<script>x</script>"));
check("signed up: a non-https link is never used", !t.includes("javascript:alert"));
{
  // Ask Chapter3 AI (owner, 2026-11-03): the listing's facts go into the page for a signed-up visitor only, and never as markup.
  const data = (t.split('id="hx-ask-data">')[1] || "").split("</script>")[0];
  check("signed up: Ask Chapter3 AI reads this listing (its facts, the description, the chip)", t.includes('id="hx-ask"') && t.includes("Chapter3 AI</span>") && data.includes('"description"') && data.includes("\\u003cscript") && !data.includes("<"));
}
check("signed up: details labelled and spaced", t.includes("Appliances") && t.includes("Dishwasher, Range") && t.includes("Private pool"));
check("signed up: viewId on the page for the seconds report", t.includes('data-view-id="4f6c0f0e-6a53-4f3a-9a8e-0b9b5b9d2c11"'));
check("signed up: the token goes as Bearer, never in a URL", calls.some((c) => (c.init.headers || {}).authorization === `Bearer ${DEV_TOKEN}`) && !calls.some((c) => c.url.includes(DEV_TOKEN)));

// Community page and the strips.
r = await run(homes, req("/homes/near/cherry-grove/"));
t = await r.text();
check("place page: homes in Cherry Grove, indexed", r.status === 200 && t.includes("Homes for sale in Cherry Grove") && t.includes("index, follow"));
check("place page: an unknown place is a 404", (await run(homes, req("/homes/near/nowhere/"))).status === 404);
r = await run(mw, req("/buyers/best-neighborhoods/"));
t = await r.text();
const strips = (t.match(/class="hx-s-row"/g) || []).length;
check("strips: filled on a guide page", strips >= 10);
check("strips: Tidewater (2 homes) keeps its empty slot", /data-place="tidewater" data-name="[^"]*"><\/div>/.test(t));
check("strips: at most 10 cards a row, spread across price (the kept spares in a <template> not counted)", (t.split('data-place="cherry-grove"')[1].split("hx-s-all")[0].replace(/<template class="hx-spare">[\s\S]*?<\/template>/g, "").match(/<article class="hx-c">/g) || []).length === 10);
check("strips: the owner's card template on every card (price, facts, address, MLS line)", (t.match(/<article class="hx-c">/g) || []).length > 0 && (t.match(/<article class="hx-c">/g) || []).length === (t.match(/class="hx-c-price">\$[0-9,]+</g) || []).length && (t.match(/<article class="hx-c">/g) || []).length === (t.match(/Listing provided by CCMLS\./g) || []).length);
check("strips: one notice, the dialogs and the script", (t.match(/class="hx-disclaimer"/g) || []).length === 1 && t.includes('id="hx-signup"'));
check("header: Search Listings opens the map page (owner, 2026-10-28)", t.includes("location.href='/homes/map/'") && !t.includes('onclick="openIdx()"'));
STALE = true;
t = await (await run(mw, req("/buyers/best-neighborhoods/"))).text();
check("stale MLS copy: no listings anywhere on the page", !t.includes('<article class="hx-c">'));
r = await run(homes, req("/homes/"));
check("stale MLS copy: the search says it is refreshing", r.status === 503 && (await r.text()).includes("being refreshed"));
STALE = false;

// Data back to the CRM.
const post = (p, body, o = {}) => req(p, { method: "POST", headers: { "content-type": "application/json", origin: "https://chapter3realty.com", ...(o.headers || {}) }, body: JSON.stringify(body) });
r = await run(homes, post("/homes/api/register", { firstName: "A", lastName: "B", email: "a@b.co", phone: "8435550100", termsAccepted: true, smsConsent: false, priorViews: [{ mlsNumber: "2600001", seconds: 30, viewedAt: "2026-10-20T10:00:00Z" }, { mlsNumber: "<x>", seconds: 1, viewedAt: "x" }] }));
const reg = JSON.parse(calls.filter((c) => c.url.endsWith("/api/idx/register")).at(-1).init.body);
check("sign-up: sets the HttpOnly cookie", r.status === 200 && /c3_idx=.+HttpOnly; Secure; SameSite=Lax/.test(r.headers.get("set-cookie") || ""));
check("sign-up: terms text and version come from the server", reg.termsVersion === "v1-draft-1" && reg.termsText.length >= 200 && reg.termsText.length <= 20000);
check("sign-up: no TCPA text without the box", !("smsConsentText" in reg) && reg.smsConsent === false);
check("sign-up: bad prior views are dropped", reg.priorViews.length === 1);
r = await run(homes, post("/homes/api/register", { firstName: "A", termsAccepted: false }));
check("sign-up: a field error comes back by field", r.status === 400 && JSON.parse(await r.text()).field === "termsAccepted");
r = await run(homes, req("/homes/api/register", { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: "{}" }));
check("sign-up: a foreign origin is refused", r.status === 403);
r = await run(homes, post("/homes/api/register", { x: "y".repeat(50000) }));
check("sign-up: a body over 48 KB is refused", r.status === 413);
r = await run(homes, post("/homes/api/hearts", { mlsNumber: "2600001", loved: true }));
check("heart: not signed in is 401", r.status === 401);
r = await run(homes, post("/homes/api/hearts", { mlsNumber: "2600001", loved: true }, cookie));
check("heart: signed in goes through", r.status === 200);
r = await run(homes, post("/homes/api/views", { viewId: "4f6c0f0e-6a53-4f3a-9a8e-0b9b5b9d2c11", seconds: 42 }, cookie));
check("seconds: forwarded as one view", r.status === 200 && JSON.parse(calls.at(-1).init.body).views[0].seconds === 42);
r = await run(homes, post("/homes/api/views", { viewId: "nope", seconds: 42 }, cookie));
check("seconds: a bad viewId is refused", r.status === 400);

// Review fixes (2026-10-22).
r = await run(homes, req("/homes/terms/"));
t = await r.text();
check("terms: /homes/terms/ shows the terms, not a listing lookup", r.status === 200 && t.includes("Listing search terms of use"));
check("near: /homes/near/ is a 404, not a listing lookup", (await run(homes, req("/homes/near/"))).status === 404);
HANG = true;
let t0 = Date.now();
r = await run(mw, req("/buyers/best-neighborhoods/"));
t = await r.text();
check("slow CRM: a guide page comes back unchanged within the budget", Date.now() - t0 < 4000 && r.status === 200 && !t.includes('<article class="hx-c">'));
HANG = false;
check("guide page: no stale ETag or Last-Modified", !r.headers.get("etag") && !r.headers.get("last-modified"));
INVALID = true;
r = await run(homes, req("/homes/", cookie));
t = await r.text();
check("bad token on search: cookie deleted, public view", /c3_idx=;.*Max-Age=0/.test(r.headers.get("set-cookie") || "") && t.includes('data-hx-signed="0"') && t.includes("hx-signup-cta"));
r = await run(homes, req("/homes/near/cherry-grove/", cookie));
check("bad token on a place page: cookie deleted", r.status === 200 && /c3_idx=;.*Max-Age=0/.test(r.headers.get("set-cookie") || ""));
INVALID = false;
check("sign-out: GET is refused", (await run(homes, req("/homes/api/signout"))).status === 405);
r = await run(homes, post("/homes/api/signout", {}));
check("sign-out: same-origin POST clears the cookie", r.status === 303 && /Max-Age=0/.test(r.headers.get("set-cookie") || ""));
check("sign-out: a foreign origin is refused", (await run(homes, post("/homes/api/signout", {}, { headers: { origin: "https://evil.example" } }))).status === 403);
check("crm: a non-https CRM_URL is never used", await (async () => { await run(homes, req("/homes/"), { ...ENV, CRM_URL: "http://evil.example" }); return calls.at(-1).url.startsWith("https://app.chapter3realty.com/"); })());

r = await run(homes, req("/homes/2622222-1-way-myrtle-beach/"));
t = await r.text();
check("listing text with $' never copies the page into the head", (t.match(/<\/head>/g) || []).length === 1 && (t.match(/<body/g) || []).length === 1 && t.includes("$&amp;"));
r = await run(homes, req("/homes/", cookie));
t = await r.text();
check("signed up: Sign out is its own button, not a tour button", t.includes('class="hx-signout"><button type="submit">Sign out') && !/<p[^>]*>[^<]*<form/.test(t));
INVALID = true;
r = await run(homes, req("/homes/", cookie));
check("bad token: the public view is never cached", r.headers.get("cache-control") === "private, no-store");
INVALID = false;

// No HOA (CRM ticket 415).
r = await run(mw, req("/buyers/no-hoa-homes/"));
t = await r.text();
const hoaCalls = calls.filter((c) => c.url.includes("/api/idx/listings?") && c.url.includes("type=house"));
check("no HOA: every no-HOA strip asks the CRM for hoa=0", hoaCalls.length >= 10 && hoaCalls.every((c) => c.url.includes("hoa=0")));
check("no HOA: each filled strip says where the fact comes from", (t.match(/class="hx-s-note">No HOA, as listed by the listing agent\. Confirm before you buy\./g) || []).length === (t.match(/class="hx-s-row"/g) || []).length && t.includes("hx-s-row"));
r = await run(mw, req("/buyers/best-neighborhoods/"));
check("no HOA: other pages carry no such note", !(await r.text()).includes('class="hx-s-note"'));
r = await run(homes, req("/homes/near/nohoa-conway/"));
check("no HOA: the place page says where the fact comes from", (await r.text()).includes("No HOA, as listed by the listing agent. Confirm before you buy."));
check("no HOA: any value but 0 is never sent", placeParams({ near: "33.7,-78.9", hoa: "1" }) === null && placeParams({ near: "33.7,-78.9", hoa: "" }) === null && placeParams({ near: "33.7,-78.9", hoa: 0 }).get("hoa") === "0");

// The listing page (2026-10-23).
r = await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/"));
t = await r.text();
check("listing: the firm stays on the listing page", t.includes('<p class="hx-firm-line">Listed by Firm 1</p>'));
check("listing: one tour and one ask button, no pop-up (owner, 2026-10-25)", (t.match(/data-interest="tour"/g) || []).length === 1 && (t.match(/data-interest="question"/g) || []).length === 1 && !t.includes("hx-toast") && !t.includes(",5000)"));
check("listing: the tour form carries the photo for its header, and day choices", /class="hx-tour hx-primary"[^>]*data-photo="https:/.test(t) && t.includes('name="day" value="This weekend"'));
check("listing: public page offers Ask Chapter3 AI behind the sign-up, with no listing facts for it", t.includes("Sign up to ask") && !t.includes("hx-ask-data"));
check("listing: public page shows no locked data (no HOA fee, taxes, remarks, sold price)", !t.includes("AssociationFee") && !t.includes("614") && !t.includes('<p class="hx-remarks">') && !t.includes("Sold price") && t.includes("Free: everything else about this home"));
{
  const part = t.includes("Homes like this one for sale") ? t.split("Homes like this one for sale")[1].split("hx-disclaimer")[0] : "";
  const ask = calls.filter((c) => c.url.includes("/api/idx/listings?") && c.url.includes("subdivision=")).pop();
  check("listing: homes like this one, for sale, about its price and size, never this one (owner, 2026-10-26)", part && !part.includes("/homes/2600005-") && (part.match(/<article class="hx-c">/g) || []).length >= 3 && ask && ask.url.includes("status=active") && ask.url.includes("min=") && ask.url.includes("max="));
}
check("listing: blurred tile and photo count open the sign-up", /hx-l-tile hx-blur[^]*?data-hx-signup/.test(t) && t.includes("1 of 20 photos"));

// The search box in plain words (2026-10-25).
r = await run(homes, req("/homes/?q=" + encodeURIComponent("3 bed house under 400k in Conway")));
check("search box: plain words become filters, then the clean address", r.status === 302 && r.headers.get("location") === "https://chapter3realty.com/homes/?max=400000&beds=3&city=Conway&type=house");
r = await run(homes, req("/homes/?q=" + encodeURIComponent("Cherry Grove")));
check("search box: an area from our guides opens its page", r.status === 302 && r.headers.get("location") === "https://chapter3realty.com/homes/near/cherry-grove/");
r = await run(homes, req("/homes/?q=" + encodeURIComponent("<script>alert(1)</script> $$$")));
check("search box: unreadable words never reach the CRM", r.status === 302 && !/script|alert|%3C/.test(r.headers.get("location")));
r = await run(homes, req("/homes/?city=Conway&beds=3&subdivision=Market%20Common"));
t = await r.text();
sent2 = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
check("search: subdivision words reach the CRM, validated", sent2.includes("subdivision=Market+Common"));
check("search: the filters in force are chips that remove themselves", t.includes('href="/homes/?beds=3&amp;subdivision=Market+Common"') && t.includes(">Conway<") && t.includes("Clear all"));
check("search: the title names the town", t.includes("<h1>Homes for sale in Conway</h1>"));
check("search: quick filters apply at once, a sort menu, a search box", t.includes("data-hx-instant") && t.includes("data-hx-go") && t.includes('name="q"'));

check("page scripts: each parses (a syntax error would break every button)", (() => { try { for (const m of SCRIPT.matchAll(/<script>([\s\S]*?)<\/script>/g)) new Function(m[1]); return SCRIPT.includes("data-hx-fb"); } catch (e) { console.log(e.message); return false; } })());

// The map (2026-10-25).
r = await run(homes, req("/homes/api/map?city=Conway"));
let mj = JSON.parse(await r.text());
check("map data: no points from the CRM yet, so no pins, and the page says so", r.status === 200 && mj.ok && mj.pins.length === 0 && mj.total === 30);
let beforeMap = calls.filter((c) => c.url.includes("/api/idx/listings")).length;
t = await (await run(homes, req("/homes/map/?city=Conway"))).text();
check("map page: fills the screen, the AI search first (labelled AI; owner, 2026-11-07: fewer words), price the first filter, grey cards where the homes go, the MLS notice once at the end of the list, noindex", t.includes("data-hx-map") && t.includes('class="hx-mapapp"') && t.includes("AI-powered search") && t.includes("Describe the home you want. AI finds it.") && t.indexOf('data-k="price"') > 0 && t.indexOf('data-k="price"') < t.indexOf('data-k="sale"') && (t.match(/class="hx-c hx-skel-c"/g) || []).length === 6 && (t.match(/class="hx-disclaimer"/g) || []).length === 1 && t.indexOf('class="hx-disclaimer"') > t.indexOf('id="hx-map-cards"') && t.includes("noindex"));
check("map page: it comes back at once, without asking the CRM for homes; the browser asks /homes/api/map (data-defer)", calls.filter((c) => c.url.includes("/api/idx/listings")).length === beforeMap && t.includes('data-defer="1"') && t.includes('id="hx-pins">[]') && MAP_SCRIPT.includes("first:true") && MAP_SCRIPT.includes('"&hearts=1"'));
t = await (await run(homes, req("/homes/map/?city=Conway&q=" + encodeURIComponent("3 bed near the beach")))).text();
check("map page: a sentence is kept for the browser's first search, and shown in the AI box", t.includes("q=3+bed+near+the+beach") && t.includes(">3 bed near the beach</textarea>"));
r = await run(homes, req("/homes/api/map?city=Conway&hearts=1", cookie));
mj = JSON.parse(await r.text());
check("map data: the first call brings a signed-up visitor's hearts, privately, and the MLS notice's date and source", mj.hearts && mj.hearts[0] === "2600001" && r.headers.get("cache-control") === "private, no-store" && /Source: /.test(mj.foot.line));
r = await run(homes, req("/homes/api/map?city=Conway&hearts=1"));
mj = JSON.parse(await r.text());
check("map data: no hearts for a visitor who is not signed up, and the answer may be cached", mj.hearts === undefined && r.headers.get("cache-control") === "public, max-age=300");
MAPPOINTS = true;
r = await run(homes, req("/homes/api/map?near=33.7,-78.9&miles=2&beds=3"));
mj = JSON.parse(await r.text());
sent2 = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
check("map data: a pin only for homes with a point and an address", mj.pins.length === 9 && mj.pins.every((x) => typeof x.lat === "number" && x.addr && x.url.startsWith("/homes/")));
check("map data: the area search reaches the CRM validated", sent2.includes("near=33.700000%2C-78.900000") && sent2.includes("miles=2") && sent2.includes("beds=3"));
r = await run(homes, req("/homes/api/map?near=0,0&miles=900"));
sent2 = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
check("map data: a point off the coast is never sent", !sent2.includes("near="));
r = await run(homes, req("/homes/api/map?q=" + encodeURIComponent("3 bed under 400k in Conway")));
sent2 = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
check("map data: plain words work on the map too", sent2.includes("city=Conway") && sent2.includes("beds=3") && sent2.includes("max=400000"));
t = await (await run(homes, req("/homes/api/map?city=Conway"))).text();
check("map data: pins as data, with < escaped", /"pins":\[\{/.test(t) && !/</.test(t));
MAPPOINTS = false;
check("click layout: the footer shows the next page's grey layout (a home, the map, a list, an article) after the page's own handlers, never for a cancelled click, and clears it on the back button; render.js has no second bar", (() => { const f = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "../partials/footer.html"), "utf8"); return f.includes("window.c3Skel") && f.includes("if (!e.defaultPrevented) go(u.href)") && ["home:", "map:", "list:", "page:"].every((k) => f.includes(k)) && f.includes("addEventListener('pageshow', clear)") && f.includes("window.hxGo = go"); })() && !SCRIPT.includes("hx-go-on") && MAP_SCRIPT.includes("window.hxGo(p.url)"));
check("map script: it parses", (() => { try { new Function(MAP_SCRIPT.replace(/^<script>|<\/script>$/g, "")); return true; } catch { return false; } })());

// The rental analyzer's MLS lookup (2026-10-25).
r = await run(homes, req("/homes/api/lookup?mls=2600005"));
let lk = JSON.parse(await r.text());
check("lookup: by MLS number, the public facts and the firm", lk.ok && lk.found && lk.facts.beds === 3 && lk.facts.listingFirm === "Firm 1" && lk.facts.tier === "public" && lk.facts.hoaMonthly === null && lk.facts.remarks === null);
r = await run(homes, req("/homes/api/lookup?mls=2600005", cookie));
lk = JSON.parse(await r.text());
check("lookup: a signed-up visitor's facts add the HOA fee and the description", lk.facts.tier === "registered" && lk.facts.hoaMonthly === 614 && typeof lk.facts.remarks === "string");
r = await run(homes, req("/homes/api/lookup?street=" + encodeURIComponent("103 Test St") + "&lat=33.7&lng=-78.9"));
lk = JSON.parse(await r.text());
check("lookup: by address near a point, the matching home", lk.found && lk.facts.mlsNumber === "2600003");
r = await run(homes, req("/homes/api/lookup?street=" + encodeURIComponent("999 Nowhere Rd") + "&lat=33.7&lng=-78.9"));
check("lookup: no match is not found, never a guess", JSON.parse(await r.text()).found === false);
check("lookup: a point off the coast is refused", JSON.parse(await (await run(homes, req("/homes/api/lookup?street=1%20A%20St&lat=0&lng=0"))).text()).found === false);
t = await (await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/"))).text();
check("listing page: Analyze it as a rental opens the analyzer with this home and starts it", t.includes('<a class="hx-analyze" href="/invest/long-term-rental/?mls=2600005&amp;go=1">'));
check("cards: no \"Built\" tag on a home built years ago (the year is read per request)", !t.includes('class="hx-c-tag">Built 2005'));

// Every article's homes feed (2026-10-25).
t = await (await run(mw, req("/buyers/waterfront-homes/"))).text();
sent2 = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
check("feed: an article gets its own homes, filtered to its topic, one line of title and no subtitle", t.includes('class="hx-feed hx-feed-top"') && t.includes("Waterfront homes for sale<") && sent2.includes("waterfront=1") && !t.includes('class="hx-feed-sub"'));
check("feed: placed as a section of the article, with the notice and the dialogs", t.indexOf('class="hx-feed') < t.indexOf("</main>") && t.includes('class="hx-disclaimer"') && t.includes('id="hx-signup"') && (t.match(/class="hx-feed[ "]/g) || []).length === 1);
{
  const main = t.slice(t.indexOf("<main"));
  check("feed: near the top, right under the part with the H1, before the article's first heading", main.indexOf('class="hx-feed') > main.indexOf("<h1") && main.indexOf('class="hx-feed') < main.indexOf("<h2"));
}
check("feed: the search bar and filters on the strip, opened on the feed's own filters; a search opens the map (owner, 2026-10-28)", t.includes('data-hx-fb-c') && t.includes('action="/homes/map/"') && /name="waterfront" value="1" checked/.test(t) && t.includes('data-hx-row'));
check("feed: See all opens the same search on the map, with no count from other searches", t.includes('href="/homes/map/?waterfront=1">See all</a>'));
t = await (await run(mw, req("/buyers/55-plus-communities/"))).text();
check("feed: a page about several communities searches each of them", ["Del+Webb", "Myrtle+Trace", "Seasons+at+Prince+Creek"].every((w) => calls.slice(-6).some((c) => c.url.includes("subdivision=" + w))) && t.includes("Homes for sale in 55+ communities"));
t = await (await run(mw, req("/buyers/new-construction/"))).text();
check("feed: a feature title the CRM did not apply falls back, never shows over homes that may not have it", t.includes("Just listed on the Grand Strand") || t.includes("Brand-new homes"));
t = await (await run(mw, req("/invest/strategies/dscr-loans/"))).text();
{
  const prices = [...t.slice(t.indexOf('class="hx-feed')).matchAll(/class="hx-c-price">\$([\d,]+)/g)].map((m) => +m[1].replace(/,/g, ""));
  check("feed: DSCR picks, 3+ bed houses and townhouses in the rental areas, lowest price per bedroom first", t.includes("DSCR picks, lowest price per bedroom") && prices.length >= 3 && prices.every((v, i) => !i || v >= prices[i - 1]) && calls.slice(-6).some((c) => c.url.includes("type=townhouse") && c.url.includes("beds=3")) && calls.slice(-6).some((c) => c.url.includes("has=long_term_rental_allowed")));
}
t = await (await run(mw, req("/buyers/relocating/from-maryland/"))).text();
check("feed: a moving-from page: Homes people from Maryland love, on the water, with no subtitle", t.includes("Homes people from Maryland love") && !t.includes("Zillow, July") && calls.slice(-5).some((c) => c.url.includes("waterfront=1") && c.url.includes("has=private_dock")));
t = await (await run(mw, req("/hoa/benefits/"))).text();
check("feed: a no-HOA feed asks the CRM for hoa=0 and says where the fact comes from", t.includes("Homes with no HOA fee") && t.includes("No HOA, as listed by the listing agent. Confirm before you buy.") && calls.slice(-5).some((c) => c.url.includes("hoa=0")));
t = await (await run(mw, req("/invest/run-the-numbers/"))).text();
check("feed: a tool page keeps its feed under the tool", t.includes('<section class="hx-feed">') && !t.includes('class="hx-feed hx-feed-top"'));
t = await (await run(mw, req("/buyers/best-neighborhoods/"))).text();
check("feed: pages with their own strips get no second feed", !t.includes('class="hx-feed"'));
t = await (await run(mw, req("/about/"))).text();
check("feed: pages not on the list get none", !t.includes('class="hx-feed"'));
{
  // Owner, 2026-10-31: no repeated homes titles. Each page's own feed has a title no other page's feed has.
  const seen = new Map(), dup = [];
  for (const [p, f] of Object.entries(FEEDS)) { if (seen.has(f.head)) dup.push(`${f.head} (${seen.get(f.head)}, ${p})`); else seen.set(f.head, p); }
  check("feed: no two pages share a feed title", Object.keys(FEEDS).length > 100 && dup.length === 0 || (console.log(dup), false));
  // Every title a reader can see, fallbacks included: no fair-housing steering words, no promise of money.
  const all = new Set(), walk = (f) => { if (!f || all.has(f)) return; all.add(f); walk(f.fallback); };
  Object.values(FEEDS).forEach(walk);
  const heads = [...all].flatMap((f) => [f.head, f.headToday]).filter(Boolean);
  const bad = heads.filter((h) => /\b(famil(y|ies)|kids?|children|safe|exclusive|retirees?|seniors?|churche?s?|perfect|cash flow|returns?|apprecia\w*|guarantee\w*|payments?|interest|rates?|best)\b/i.test(h));
  check("feed: no title steers a reader or promises money", heads.length > 100 && bad.length === 0 || (console.log(bad), false));
  // Garden City Beach finds no homes as a city (2026-10-31): every feed reads it as the CRM's area.
  check("feed: no feed searches Garden City as a city", [...all].every((f) => (f.q || []).every((q) => q.city !== "Garden City")) && FEEDS["/submarkets/garden-city/"].q[0].has === "area_garden_city" && FEEDS["/submarkets/garden-city/"].needs === "has");
}
check("feed: never placed inside a section that is still open", placeFeed('<main><section class="x"><div class="wrap"><p>E</p><h2>A</h2><p>t</p><h2>B</h2></div></section></main>', "[F]") === '<main>[F]<section class="x"><div class="wrap"><p>E</p><h2>A</h2><p>t</p><h2>B</h2></div></section></main>');
{
  const y = new Date().getUTCFullYear();
  const good = (o) => ({ status: "Active", photo: "https://p/x.jpg", photoCount: 20, listPrice: 380000, sqft: 1800, beds: 3, yearBuilt: 2012, propertySubType: "SingleFamilyResidence", city: "Conway", ...o });
  check("feed: built in the last two years is this year's two years, read per request", (() => { const out = postFilter([good({ yearBuilt: y }), good({ yearBuilt: y - 1 }), good({ yearBuilt: y - 2 })], { builtWithin: 2 }); return out.length === 2 && out[1].yearBuilt === y - 1; })());
  const junk = [good({ listPrice: 49000 }), good({ propertySubType: "ManufacturedHome" }), good({ propertySubType: "UnimprovedLand" }), good({ photoCount: 4 }), good({ status: "ActiveUnderContract" }), good({ yearBuilt: 1962 }), good({ listPrice: 90000, sqft: 1500 })];
  check("feed: the quality bar: no shells under $150,000, mobile homes, land, few photos, under contract, very old or teardown prices", postFilter([good({}), ...junk], {}).length === 1);
  const row = rankHomes([good({ listPrice: 160000, yearBuilt: 1980, sqft: 1000, photoCount: 12 }), good({ listPrice: 420000, yearBuilt: 2018, sqft: 2200, city: "Myrtle Beach" }), good({ listPrice: 395000, yearBuilt: 2016, sqft: 2000 })], "appeal");
  check("feed: never the cheapest first: newer, roomier, better photographed homes lead, and the towns take turns", row[0].listPrice !== 160000 && row[0].city !== row[1].city);
}

// Returning clients (contract §7g).
r = await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/?k=Good12345678"));
t = await r.text();
check("k: a good code signs the visitor in, the cookie a year", /c3_idx=.+Max-Age=31536000; HttpOnly; Secure; SameSite=Lax/.test(r.headers.get("set-cookie") || "") && t.includes('data-hx-signed="1"'));
check("k: never cached, and taken out of the address bar before analytics", r.headers.get("cache-control") === "private, no-store" && /<head[^>]*><script>try\{var u=new URL\(location.href\);if\(u.searchParams.has\("k"\)\)/.test(t));
r = await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/?k=Terms1234567"));
t = await r.text();
check("k: when the terms come first, the Welcome back box", t.includes('id="hx-welcome"') && t.includes("Welcome back, Sam") && !(r.headers.get("set-cookie") || "").includes("Max-Age=31536000"));
check("k: the Welcome back box comes before the page script that opens it", t.indexOf('id="hx-welcome"') > 0 && t.indexOf('id="hx-welcome"') < t.indexOf(SCRIPT.slice(0, 60)));
r = await run(homes, req("/homes/2611111/?k=Good12345678"));
check("k: a home with a withheld address (no slug, no 301) still signs the visitor in", r.status === 200 && /Max-Age=31536000/.test(r.headers.get("set-cookie") || ""));
const beforeSlug = calls.length;
r = await run(homes, req("/homes/2600005-old-slug/?k=Terms1234567"));
check("k: a listing's old slug 301s with k and does not claim", r.status === 301 && r.headers.get("location").endsWith("?k=Terms1234567") && !calls.slice(beforeSlug).some((c) => c.url.endsWith("/api/idx/claim")));
r = await run(homes, post("/homes/api/claim", { k: "Terms1234567", termsAccepted: true, page: "/homes/" }));
check("k: the box's button signs in with the terms", r.status === 200 && /Max-Age=31536000/.test(r.headers.get("set-cookie") || ""));
r = await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/?k=Old123456789"));
t = await r.text();
check("k: an expired code is the normal page, no message", r.status === 200 && !t.includes('id="hx-welcome"') && !(r.headers.get("set-cookie") || "").includes("c3_idx=e"));
const before = calls.length;
r = await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/?k=Good12345678", cookie));
check("k: a visitor with a cookie is never claimed again", !calls.slice(before).some((c) => c.url.endsWith("/api/idx/claim")));
r = await run(homes, req("/homes/2600005?k=Good12345678"));
check("k: /homes/<MLS#> keeps k through its 301", r.status === 301 && r.headers.get("location").endsWith("?k=Good12345678"));
r = await run(homes, post("/homes/api/returning", { phone: "8435550199", firstName: "Sam", termsAccepted: true, turnstileToken: "t", page: "/homes/" }));
check("returning: phone and first name sign a client in", r.status === 200 && /Max-Age=31536000/.test(r.headers.get("set-cookie") || ""));
r = await run(homes, post("/homes/api/returning", { phone: "1", firstName: "X", termsAccepted: true, turnstileToken: "t" }));
check("returning: not found opens the full sign-up", JSON.parse(await r.text()).notFound === true);
check("returning: Turnstile is reset after every answer, before the prefilled sign-up can post", (() => { const i = SCRIPT.indexOf('post("/homes/api/returning"'); const seg = SCRIPT.slice(i, i + 900); return seg.indexOf("turnstile.reset()") > 0 && seg.indexOf("turnstile.reset()") < seg.indexOf("j.notFound"); })());
r = await run(homes, post("/homes/api/claim", { k: "Terms1234567", page: "/homes/", pad: "x".repeat(20000) }));
check("claim: a body up to 48 KB is read (contract §10)", r.status !== 413);
r = await run(homes, post("/homes/api/claim", { k: "Terms1234567", pad: "x".repeat(50000) }));
check("claim: a body over 48 KB is refused", r.status === 413);
r = await run(homes, new Request("https://chapter3realty.com/homes/api/claim", { method: "POST", headers: { "content-type": "application/json", origin: "https://evil.example" }, body: JSON.stringify({ k: "Terms1234567" }) }));
check("claim: a foreign Origin is refused", r.status === 403);
t = await (await run(homes, req("/homes/"))).text();
check("returning: the sign-up offers Already working with us?", t.includes("data-hx-returning") && t.includes('id="hx-returning-form"'));

// The map: dots from the address until the CRM sends points; the home's own map; 2D and 3D.
CENSUS = true;
r = await run(homes, req("/homes/api/map?city=Conway"));
mj = JSON.parse(await r.text());
check("map: homes without a CRM point are placed from their address", mj.pins.length > 0 && mj.pins.every((x) => x.lat === 33.71));
t = await (await run(homes, req("/homes/2600005-101-test-st-myrtle-beach/"))).text();
check("listing: a map of where the home is, opening its town on the full map with it lit", t.includes('class="hx-loc-map"') && t.includes("staticmap?center=33.71,-78.9") && t.includes('href="/homes/map/?city=Myrtle+Beach&amp;focus=2600005"'));
t = await (await run(homes, req("/homes/2611111/"))).text();
check("listing: a withheld address gets no map", !t.includes('class="hx-loc-map"'));
t = await (await run(homes, req("/homes/api/map?city=Conway&focus=2699999"))).text();
check("map page: the home a listing page sent us from is among the pins sent to the browser", t.includes('"mls":"2699999"'));
BIG = true;
const beforeBig = calls.length, censusBig = CENSUS_CALLS;
r = await run(homes, req("/homes/api/map?city=Myrtle+Beach"));
t = await r.text();
check("map data: 4,041 homes, 144 placed in one geocoder call, under Cloudflare's 50 outside calls", r.status === 200 && CENSUS_CALLS - censusBig === 1 && calls.length - beforeBig <= 8 && (t.match(/"lat":33.71/g) || []).length === 144);
BIG = false;
r = await run(homes, req("/homes/map/"), { ...ENV, ASSETS: { fetch: async () => { throw new Error("Too many subrequests."); } } });
t = await r.text();
check("homes: an unexpected error is our own try-again page, never Cloudflare's", r.status === 503 && t.includes("This page did not load") && r.headers.get("cache-control") === "no-store");
CENSUS = false;
t = await (await run(homes, req("/homes/map/?city=Conway&view=3d&focus=2600005"))).text();
check("map page: one page, a 2D and 3D switch, opened in 3D, the home lit", t.includes('data-mode="3d" aria-pressed="true"') && t.includes('data-view="3d"') && t.includes('data-focus="2600005"'));

// Sold homes in the analyzer, for signed-up visitors only.
r = await run(homes, req("/homes/api/lookup?street=" + encodeURIComponent("999 Nowhere Rd") + "&lat=33.7&lng=-78.9"));
check("lookup: not for sale, not signed up: the sign-up is offered", JSON.parse(await r.text()).soldNeedsSignup === true);
r = await run(homes, req("/homes/api/lookup?street=" + encodeURIComponent("999 Nowhere Rd") + "&lat=33.7&lng=-78.9", cookie));
check("lookup: a signed-up visitor's search includes sold homes", calls.some((c) => c.url.includes("sold=1") && c.url.includes("near=")) && JSON.parse(await r.text()).soldNeedsSignup === false);

// Sitemap and the shell.
r = await run(sitemap, req("/sitemap-homes.xml"), { ...ENV, IDX_INDEX_LISTINGS: "1" });
t = await r.text();
check("sitemap: search, places and listings with lastmod", t.includes("/homes/near/cherry-grove/") && t.includes("2600001-1-a-st-myrtle-beach/</loc><lastmod>2026-10-20") && t.includes("/homes/2600002/"));
check("shell: /homes-shell/ is never served", (await run(mw, req("/homes-shell/"))).status === 404);

// Round 21 (2026-10-26).
r = await run(homes, req("/homes/api/similar?near=33.7,-78.9&beds=2&min=200000&max=400000&not=2600003"));
{
  const j = JSON.parse(await r.text());
  check("similar: homes like it near it, as strip cards with the source and disclaimer, no hearts, not the home itself", j.ok && j.html.includes('class="hx-c"') && j.html.includes('class="hx-disclaimer"') && !j.html.includes("hx-heart\"") && !j.html.includes("MLS #2600003,") && calls.some((c) => c.url.includes("near=33.700000%2C-78.900000") && c.url.includes("beds=2")));
}
r = await run(homes, req("/homes/api/similar?near=1,2"));
check("similar: a point off the Carolinas coast is refused", JSON.parse(await r.text()).ok === false);
t = await (await run(homes, req("/homes/"))).text();
check("sign-up: the Already have an account form stays hidden until asked for (display:flex no longer beats hidden)", STYLE_OK());
check("sign-up: one full name box, email, phone, Continue to photos, Already have an account?", t.includes('name="name" autocomplete="name"') && !t.includes('name="lastName"') && t.includes("Continue to photos") && t.includes("Already have an account?") && t.includes('name="termsAccepted"') && t.includes('name="smsConsent"'));
{
  const home = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "../chapter3realty/index.html"), "utf8");
  /* Owner, 2026-11-07: a tester did not see how to search. The hero is the AI search bar on the map; the I am
     paths are their own section under it. */
  check("homepage: the hero is an AI search form that opens the map with the words; the I am paths follow in their own section", /<form class="cine-ai" action="\/homes\/map\/" method="get"[^]*?name="q"/.test(home) && home.indexOf('class="cine-ai"') < home.indexOf('class="home-paths') && /<section class="home-paths[^]*?href="\/sell\/"[^]*?href="\/invest\/"/.test(home) && !home.includes('class="cine-main"'));
  const ltr = fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), "../chapter3realty/invest/long-term-rental/index.html"), "utf8");
  check("analyzer: no box for beds, baths, size or HOA; a cash box; the cash or loan question ready", ["ltr-beds", "ltr-baths", "ltr-sqft", "ltr-hoa"].every((id) => new RegExp(`<input id="${id}" type="hidden"/>`).test(ltr)) && ltr.includes('id="ltr-is-cash"') && ltr.includes('<dialog id="ltr-fin"'));
  check("analyzer: no rate or down payment is typed in for the visitor", !/id="ltr-(rate|down)"[^>]*value=/.test(ltr) && !/name="(rate|down)"[^>]*value=/.test(ltr));
  check("analyzer and homepage: no number box the scroll wheel can change, and the guard for every other page", !/type="number"/.test(ltr) && !/type="number"/.test(home) && home.includes("a.type === 'number' && e.target === a) a.blur()"));
  // The analyzer's own script: the one the analyzer page loads that defines ltrMoney.
  const assetsDir = path.join(path.dirname(new URL(import.meta.url).pathname), "../chapter3realty/assets");
  const ltrAsset = [...ltr.matchAll(/src="\/assets\/(s\.[0-9a-f]+\.js)"/g)].map((m) => m[1]).find((f) => fs.readFileSync(path.join(assetsDir, f), "utf8").includes("function ltrMoney"));
  const js = fs.readFileSync(path.join(assetsDir, ltrAsset), "utf8");
  check("analyzer: the value is the MLS asking price or the estimate, never the county's tax appraisal (owner, 2026-10-26: $400,000 read $118,000)", !/d\.estimatedValue\s*=\s*_ltrParcel\.marketValue/.test(js) && /d\.estimatedValue = _ltrMls\.listPrice/.test(js) && js.includes("d.countyValue = _ltrParcel.marketValue"));
  check("analyzer: every number shown and editable at the top, no drop-downs, similar homes and the one disclosure at the bottom", !ltr.includes('class="ltr-d"') && ltr.indexOf('class="ltr-edit"') < ltr.indexOf('id="ltr-core-metrics"') && ltr.indexOf('class="ltr-cta"') < ltr.indexOf('id="ltr-similar"') && !js.includes("Listing provided by CCMLS"));
  check("analyzer script: no default rate or down payment in the math", !/ltrNum\('adj-rate',\s*[\d.]+\)/.test(js) && !/\|\|\s*7\.5/.test(js) && !/\?\.value\s*\|\|\s*25/.test(js) && !/\?\s*25\s*:/.test(js) && /isNaN\(rawDown\) \|\| rawDown >= 100 \|\| isNaN\(ratePct\)/.test(js));
  check("analyzer script: the AI's answers are cleaned (numbers, known flag colours) and their text escaped, the repair list too, before it goes in as HTML", js.includes("ltrSanitize(extractJSON(analysisRaw))") && js.includes("${c3Esc(f.text)}") && js.includes("${c3Esc(x.item)}") && !js.includes("ltr-inferred-strip") && !/\$\{f\.text\}/.test(js));
  check("analyzer script: a new address forgets the old home's facts; one run at a time; the cash-or-loan box closes on any end", js.includes("function ltrForgetHome()") && js.includes("if (_ltrRunning) return;") && js.includes("dlg.onclose = function () { finish({ cash: true }); };"));
  check("analyzer script: an address from a link is limited to address characters", js.includes("replace(/[^A-Za-z0-9 #.,'\\/-]/g, '')"));
  check("analyzer (owner, 2026-10-28): loan terms in a second row of the same box, a second scenario beside the first, what is good in the town under each ?, the similar row moves and drags, no MLS note on the form", js.includes('id="${p}-loanrow"') && js.includes("function ltrCompare(") && js.includes("const LTR_AREA = ") && js.includes("box.querySelectorAll('.hx-s-row').forEach(ltrRig)") && !js.includes("We filled these in for you") && !ltr.includes("Nothing else to type") && ltr.includes('id="ltr-sc-b"'));
  check("analyzer (owner, 2026-10-28): offices, stores, warehouses and other business property are figured by the square foot and the lease, from the form or the MLS type; the booking popup waits while it works", js.includes("function LTR_COMMERCIAL(") && js.includes("function ltrUseOf(") && js.includes("window.c3Busy = true;") && ltr.includes('id="ltr-use"') && ltr.includes("if (window.c3Busy) return;"));
  check("analyzer: the repair check reads the listing's photos by link and is cached per listing; it shows only when it sees work", js.includes("type: 'image', source: { type: 'url', url: u }") && js.includes("cache_key: ['repair2'") && js.includes("if (!r || !r.needsWork) { box.hidden = true; return; }"));
  check("analyzer script: parses", (() => { try { new Function(js); return true; } catch { return false; } })());
  check("footer: address suggestions on every address box", home.includes("places.googleapis.com/v1/places:autocomplete") && home.includes("#ltr-street,#ldCtx,#rnAddr,#sbh-street"));
}

r = await run(homes, req("/homes/?hoa=0&near=33.7951%2C-79.0112&miles=3&type=house"));
t = await r.text();
{
  const sentH = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("search: no-HOA and near-a-point searches reach the CRM, with the no-HOA source note and chips", sentH.includes("hoa=0") && sentH.includes("near=33.795100%2C-79.011200") && sentH.includes("miles=3") && t.includes("No HOA, as listed by the listing agent. Confirm before you buy.") && t.includes("Within 3 miles"));
}
t = await (await run(mw, req("/invest/strategies/dscr-loans/"))).text();
check("feed: every feed search asks for homes for sale only, and the quality floor reaches the CRM", calls.slice(-5).every((c) => c.url.includes("status=active")) && calls.slice(-5).some((c) => /min=2\d{5}/.test(c.url)));
t = await (await run(homes, req("/homes/2611111/"))).text();
check("listing: no Analyze it as a rental on a home whose address is withheld", !t.includes('class="hx-analyze"'));

check("sign-up: the full name splits on spaces (a template string had eaten the \\s)", !SCRIPT.includes("split(/s+/)") && SCRIPT.includes('split(" ").filter(Boolean)'));
{
  const saved = INVALID_TS; INVALID_TS = true;
  r = await run(homes, post("/homes/api/register", { firstName: "Chapter3", lastName: "Realty", email: "a@b.com", phone: "8543332135", termsAccepted: true, page: "/homes/" }), { ...ENV, TURNSTILE_SITE_KEY: undefined });
  const j1 = JSON.parse(await r.text());
  r = await run(homes, post("/homes/api/register", { firstName: "Chapter3", lastName: "Realty", email: "a@b.com", phone: "8543332135", termsAccepted: true, page: "/homes/" }));
  const j2 = JSON.parse(await r.text());
  INVALID_TS = saved;
  check("sign-up: with no Turnstile widget on the site, the message says sign-up is not on yet, not \"complete the check\"", /not switched on yet/.test(j1.message) && /complete the check/.test(j2.message));
}

// The filter bar (2026-10-26).
t = await (await run(homes, req("/homes/"))).text();
check("search: the filter bar (for sale, price, beds and baths, type, filters), no MLS features while the CRM does not apply them", t.includes('class="hx-fb"') && ["sale", "price", "beds", "type", "more"].every((k2) => t.includes(`data-k="${k2}"`)) && !t.includes('name="has" value="pool"') && t.includes('name="hoa" value="0"'));
APPLIED = true;
r = await run(homes, req("/homes/?has=pool&has=garage&has=evil&yearMin=2010&status=active"));
t = await r.text();
{
  const sentF = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("search: MLS features and ranges reach the CRM, an unknown key drops alone, and the panel offers every feature once the CRM applies them", sentF.includes("has=pool%2Cgarage&") && sentF.includes("yearMin=2010") && sentF.includes("status=active") && t.includes('name="has" value="pool" data-cur checked') && t.includes('data-hx-feats data-has="garage"'));
}
r = await run(homes, req("/homes/?has=pool&has=garage"));
t = await r.text();
{
  const sentF = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("search: features reach the CRM as one list, with a removable chip each", sentF.includes("has=pool%2Cgarage") && t.includes(">Private pool<span") && t.includes(">Garage<span"));
}
r = await run(homes, req("/homes/?has=private_dock&want=pool,private_dock"));
t = await r.text();
{
  // A wish (CRM Ticket 671) is a light filter: it reaches the CRM as want, never repeats a has key, and has its own chip.
  const sentF = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("search: a wish reaches the CRM as want, without a key already in has, with a removable chip", sentF.includes("want=pool&") && !sentF.includes("want=pool%2C") && t.includes(">Private pool<span"));
}
r = await run(homes, req("/homes/api/strip?type=condo&max=500000&city=Conway"));
{
  const j = JSON.parse(await r.text());
  check("strip: the strip's homes after a filter change, cards, the count, the search link and the pills' words", j.ok && j.html.includes('class="hx-c"') && j.link.includes("type=condo") && j.labels.type === "Condo" && j.labels.town === "Conway" && j.labels.price === "Up to $500K");
}
// Review of v1.7 (2026-10-26): what the reader or the feed picked is kept and obeyed.
{
  const fb = filterBar({ params: "min=230000&max=460000&baths=2.5&yearMax=1999&not=flood_zone", features: true, compact: true });
  check("filters: a feed's own price that is not a step is shown and kept, not dropped on the next change", fb.includes('<option value="230000" selected>') && fb.includes('<option value="460000" selected>') && fb.includes('value="2.5" checked'));
  check("filters: what has no control (year built up to, features left out) rides along", fb.includes('name="yearMax" value="1999"') && fb.includes('name="not" value="flood_zone"'));
  check("filters: one unknown feature drops alone; the first 8 known stay", JSON.stringify(featureList(["pool,bogus", "garage"])) === '["pool","garage"]');
  const y0 = { status: "Active", photo: "https://p/x.jpg", photoCount: 20, listPrice: 380000, sqft: 1800, beds: 3, propertySubType: "SingleFamilyResidence", city: "Conway" };
  check("feed: a title that names a year shows no home without one", postFilter([y0], { yearMin: 2010, strictYear: true }).length === 0 && postFilter([y0], { yearMin: 2010 }).length === 1);
  check("feed: land or a low price the reader asked for keeps only status and photos", postFilter([{ ...y0, propertySubType: "UnimprovedLand", listPrice: 40000, sqft: 0 }], { floors: false }, { allowTypes: true }).length === 1);
}
r = await run(homes, req("/homes/api/strip?hoa=0&city=Conway"));
{
  const j = JSON.parse(await r.text());
  check("strip: a no-HOA refresh brings its source note, and no heart buttons in the cached answer", j.ok && j.note === "No HOA, as listed by the listing agent. Confirm before you buy." && !j.html.includes('class="hx-heart'));
}
r = await run(homes, req("/homes/?hoaPick=0&city=Conway"));
await r.text();
check("search: the HOA select sent with no script still means no HOA", calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url.includes("hoa=0"));
r = await run(mw, req("/buyers/second-home/"));
t = await r.text();
check("place strips: filled, and never asked for cheapest first (owner, 2026-10-26)", (t.match(/data-place="second-home-[a-z-]+"/g) || []).length === 5 && t.includes('class="hx-c"') && !calls.slice(-8).some((c) => c.url.includes("sort=price_asc")));
r = await run(homes, req("/homes/api/similar?near=33.70000,-78.90000&beds=2"));
await r.text();
check("similar: asks for homes for sale only, never pending (owner, 2026-10-26)", calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url.includes("status=active"));
check("rows: every homes row scrolls by itself, stops for the reader, never with reduced motion", SCRIPT.includes("prefers-reduced-motion") && SCRIPT.includes("requestAnimationFrame") && SCRIPT.includes("MutationObserver"));
r = await run(homes, req("/homes/?city=Conway")); await r.text();
{ const u1 = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  r = await run(homes, req("/homes/?city=Conway&all=1")); t = await r.text(); const u2 = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("search: homes for sale only unless the reader adds those under contract (owner, 2026-10-26)", u1.includes("status=active") && !u2.includes("status=") && !u2.includes("all=") && t.includes("With homes under contract")); }
// The CRM's live feature list (Ticket 471): the panel draws from it, and searches are checked against it.
CATALOG = true; resetCatalog();
r = await run(homes, req("/homes/api/filters"));
{
  const j = JSON.parse(await r.text());
  const keys = j.ok ? j.groups.flatMap((g) => g.items.map((x) => x.k)) : [];
  check("filters: the panel's list is the CRM's, grouped, most homes first, distances marked, no feature that no home has", j.ok && keys.includes("walk_to_beach") && !keys.includes("never_listed") && j.groups.some((g) => g.items.some((x) => x.k === "marshwalk_1mi" && x.d === 1)) && j.groups[0].items.length >= 1);
}
r = await run(homes, req("/homes/?has=walk_to_beach,golf_cart_ok,bogus&not=marshwalk_1mi"));
t = await r.text();
{
  const sent = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("filters: a search keeps the CRM's keys, drops an unknown one, and the panel loads every feature", sent.includes("has=walk_to_beach%2Cgolf_cart_ok&") && sent.includes("not=marshwalk_1mi") && !sent.includes("bogus") && t.includes("data-hx-feats"));
}
CATALOG = false; resetCatalog();
APPLIED = true;
t = await (await run(mw, req("/buyers/common-mistakes/"))).text();
check("feed: a hook the filters make true: 'Price just cut' asks the CRM for price_reduced", t.includes("Price just cut on these homes") && calls.slice(-6).some((c) => c.url.includes("has=price_reduced")));
t = await (await run(mw, req("/buyers/waterfront-homes/"))).text();
check("feed: 'Homes with their own dock' asks for private_dock", t.includes("Homes with their own dock") && calls.slice(-6).some((c) => c.url.includes("has=private_dock")));
APPLIED = false;

// The search box as a sentence (owner, 2026-10-28): buyer phrases, employers, and what is left for the AI.
{
  const rq = (x) => readQuery(x);
  check("sentence: 'fixer upper in conway under 300k' is a distressed sale in Conway up to $300K", rq("fixer upper in conway under 300k").params.toString() === "max=300000&city=Conway&has=distressed_sale");
  check("sentence: 'rental homes near the beach' and 'single story ranch with no hoa and a 2 car garage'", rq("rental homes near the beach").params.get("has") === "rentals_allowed,near_beach" && rq("single story ranch with no hoa and a 2 car garage").params.toString() === "hoa=0&garage=2&has=one_level");
  check("sentence: a named employer wins over a line of work, within 10 miles (about 20 minutes)", rq("nurse at mcleod").params.get("has") === "mcleod_seacoast_10mi" && rq("nurse").params.get("has") === "grand_strand_medical_center_10mi");
  check("sentence: north myrtle beach is one town, not 'north myrtle' and a stray word", rq("oceanfront condo north myrtle beach").params.get("city") === "North Myrtle Beach" && rq("oceanfront condo north myrtle beach").left === "");
  check("sentence: a description the rules cannot read is left for the AI, never searched as a neighborhood", !rq("quiet cul de sac with mountain views").params.has("subdivision") && rq("quiet cul de sac with mountain views").left === "cul de sac mountain views");
}
r = await run(homes, req("/homes/api/map?q=3+bed+house+in+conway&near=33.7,-78.9&miles=4"));
{
  const j = await r.json();
  check("map api: a sentence adds to the search, a town in it replaces the map area, and the answer carries the chips and the pill labels", j.ok && j.params === "city=Conway&type=house&beds=3" && j.chips.some((c) => c.t === "Conway" && c.x === "type=house&beds=3") && j.labels.beds === "3+ bd" && j.labels.type === "House");
}

// Listing photos from our own address, sized and kept 30 days (owners, 2026-10-28).
{
  const T = "https://api.cotality.com/trestle/Media/Property/PHOTO-jpeg/1193779983/1/MTIxOTIvMTMxMTAvMjA/MjAvMjM1MjIvMTc5MzA0ODQxMw/rk7ui3qA6hhAAwXMPS8mKxo37OMddDRo853Go-1Jz88";
  const other = "https://api.cotality.com/trestle/Media/Property/PHOTO-jpeg/1/1/T1RIRVJGRUVE/x/y";
  check("photos: our feed's photos load from our address, sized for the card or the listing page; any other link is left alone", photoUrl(T) === `/homes/p/card?u=${encodeURIComponent(T)}` && photoUrl(T, "big").startsWith("/homes/p/big?u=") && photoUrl(other) === other && photoUrl("https://photos.test/1.jpg") === "https://photos.test/1.jpg");
  const saved = globalThis.fetch; const asked = [];
  const ctx = (accept) => ({ request: new Request("https://chapter3realty.com/homes/p/card", { headers: { accept } }), waitUntil: () => {} });
  const fs = await import("node:fs");
  const jpg = fs.readFileSync(new URL("./fixtures/listing-photo.jpg", import.meta.url));
  globalThis.fetch = async (u) => { asked.push(String(u)); return new Response(jpg, { status: 200, headers: { "content-type": "image/jpeg" } }); };
  const ok = await photo(ctx("*/*"), new URL(`https://chapter3realty.com/homes/p/card?u=${encodeURIComponent(T)}`), "card");
  const okBytes = (await ok.clone().arrayBuffer()).byteLength;
  const no = await photo(ctx("*/*"), new URL(`https://chapter3realty.com/homes/p/card?u=${encodeURIComponent(other)}`), "card");
  globalThis.fetch = async () => new Response("quota", { status: 429, headers: { "content-type": "text/plain" } });
  const busy = await photo(ctx("*/*"), new URL(`https://chapter3realty.com/homes/p/big?u=${encodeURIComponent(T)}`), "big");
  globalThis.fetch = saved;
  check("photos: our resizer makes a card photo small (a drawn 1600 px test photo comes back smaller, as a JPEG) and it is kept 30 days; a foreign link is refused; when the MLS says no, the browser is sent to the MLS and nothing is kept",
    ok.status === 200 && ok.headers.get("content-type") === "image/jpeg" && okBytes < jpg.length && /max-age=2592000/.test(ok.headers.get("cache-control"))
    && no.status === 404 && busy.status === 302 && busy.headers.get("location") === T && busy.headers.get("cache-control") === "no-store");
}

{
  const { SCRIPT: S } = await import("../idx-lib/render.js");
  const { MAP_SCRIPT: M, MAP_STYLE: MS } = await import("../idx-lib/map.js");
  check("listing photos open full screen and page through (arrows, swipe, keys); the map has a Full map button and its 2D and 3D buttons sit above Google's layers", S.includes('box.className="hx-lb"') && S.includes('e.key==="ArrowRight"') && M.includes('getElementById("hx-full-b")') && MS.includes(".hx-map{position:absolute;inset:0;z-index:0}"));
}

// The photo warmer: every home's first photo kept in the bucket, at most 12 an MLS call each, stopping when the MLS runs low.
{
  const fs = await import("node:fs");
  const jpg = fs.readFileSync(new URL("./fixtures/listing-photo.jpg", import.meta.url));
  const bucket = new Map();
  const R2 = { head: async (k) => (bucket.has(k) ? {} : null), get: async (k) => (bucket.has(k) ? { body: bucket.get(k).body, httpMetadata: bucket.get(k).meta } : null), put: async (k, body, o) => { bucket.set(k, { body, meta: o.httpMetadata }); } };
  const link = (i) => `https://api.cotality.com/trestle/Media/Property/PHOTO-jpeg/${1000 + i}/1/MTIxOTIvMTMxMTAvMjA/x/sig${i}`;
  const homes = Array.from({ length: 24 }, (_, i) => ({ photo: link(i) }));
  const listPage = async () => ({ total: 24, listings: homes });
  const saved = globalThis.fetch; let mlsCalls = 0, left = 200;
  globalThis.fetch = async () => { mlsCalls++; left--; return new Response(jpg, { status: 200, headers: { "content-type": "image/jpeg", "minute-quota-available": String(left), "hour-quota-available": "8000" } }); };
  const call = (key, envX) => warm({ env: envX, request: new Request("https://chapter3realty.com/homes/api/warm?slot=0&slots=1", { headers: key ? { "x-warm-key": key } : {} }), waitUntil() {} }, new URL("https://chapter3realty.com/homes/api/warm?slot=0&slots=1"), listPage);
  const env1 = { WARM_KEY: "k".repeat(32), PHOTOS: R2 };
  const noKey = await call("", env1), wrong = await call("nope", env1);
  const a = await (await call("k".repeat(32), env1)).json();
  const b = await (await call("k".repeat(32), env1)).json();
  const c = await (await call("k".repeat(32), env1)).json();
  const keptCopies = bucket.size; left = 40;
  bucket.clear(); const d = await (await call("k".repeat(32), env1)).json();
  // A visitor's photo now comes from the bucket, not the MLS.
  bucket.clear(); left = 200; await (await call("k".repeat(32), env1)).json();
  const callsBefore = mlsCalls;
  const viaBucket = await photo({ env: env1, request: new Request("https://chapter3realty.com/homes/p/card"), waitUntil() {} }, new URL(`https://chapter3realty.com/homes/p/card?u=${encodeURIComponent(link(0))}`), "card");
  globalThis.fetch = saved;
  check("photo warmer: only with the secret; 12 photos a call, both sizes kept; the next call takes the next 12; then nothing is fetched again; it stops when the MLS has under 40 left this minute; a visitor's photo then comes from the bucket",
    noKey.status === 404 && wrong.status === 404 && a.fetched === 12 && a.stored === 12 && b.fetched === 12 && b.kept === 12 && c.fetched === 0 && c.kept === 24 && keptCopies === 48
    && d.fetched === 1 && d.stop === "mls_limit" && viaBucket.status === 200 && mlsCalls === callsBefore);
}

// The deal finder's fix-and-flip math (owners, 2026-10-29). It never values the house (no AVM licence):
// it reports the nearby sales and how far the asking price a square foot sits under the middle one.
{
  const subj = { mlsNumber: "1", sqft: 1500, yearBuilt: 1975, listPrice: 150000 };
  const comps = [180, 190, 200, 210, 220, 230].map((psf, i) => ({ mlsNumber: "c" + i, sqft: 1500, soldPrice: psf * 1500 }));
  const v = nearbySales(subj, comps), thin = nearbySales(subj, comps.slice(0, 2)), far = nearbySales(subj, comps.map((c) => ({ ...c, sqft: 3000 })));
  const m = flipMath(150000, 300000, 30000, FLIP_DEFAULTS);
  const noValue = !Object.keys(v).some((k) => /arv|value|estimate/i.test(k));
  check("deal finder: nearby sales of about the same size (3 needed): low, high, middle a square foot and how far under the middle; no value field; repairs by age and distress; profit on the agent's value less price, repairs, buying, selling and holding; the 70% rule's offer",
    v.n === 6 && v.low === 180 && v.high === 230 && v.mid === 205 && v.own === 100 && v.under === 51 && noValue && thin.under === null && far.under === null
    && repairTier(subj, new Set(["distressed"])) === "heavy" && repairTier({ yearBuilt: 2010 }, new Set()) === "light"
    && m.profit === 300000 - (150000 + 30000 + 3000 + 24000 + 5400) && m.maxOffer === 180000);
}

// A CRM hiccup (2026-10-29: a listing showed "back soon"). One 502 on a GET is tried again; a signed-in
// listing that still fails shows the public copy; two 502s in a row still read as a failure.
{
  const { crm } = await import("../idx-lib/crm.js");
  FLAKY = 1; const once = await crm(ENV, req("/homes/"), "/api/idx/listings?city=Conway", { anonymous: true, cacheSeconds: 1 });
  FLAKY = 2; const twice = await crm(ENV, req("/homes/"), "/api/idx/listings?city=Loris", { anonymous: true });
  FLAKY = 1; const noRetry = await crm(ENV, req("/homes/"), "/api/idx/listings?city=Aynor", { anonymous: true, retry: false });
  FLAKY = 0; SIGNED_DOWN = true;
  const page = await (await run(homes, req("/homes/2600007-101-test-st-myrtle-beach/", cookie))).text();
  SIGNED_DOWN = false;
  check("CRM hiccup: one 502 is retried; two still fail; retry: false does not retry; a signed-in listing that fails shows the public copy, not 'back soon'",
    once.status === 200 && twice.status === 502 && noRetry.status === 502 && page.includes("101 Test St") && !page.includes("back soon"));
}

// A dock is a search of the descriptions (owner, 2026-11-07; CRM Ticket 556): the rules read it as words=dock, the
// CRM is asked for it, a phrase the CRM would refuse is never sent, and it is kept when nothing matches.
{
  const d = readQuery("homes with a dock in Murrells Inlet");
  const before = calls.length;
  await run(homes, req("/homes/api/map?words=dock,boat%20lift"));
  const sent = calls.slice(before).map((c) => c.url).find((u) => u.includes("/api/idx/listings?")) || "";
  await run(homes, req("/homes/api/map?words=%25,x"));
  const bad = calls.slice(before).map((c) => c.url).filter((u) => u.includes("/api/idx/listings?")).pop() || "";
  check("words: 'homes with a dock' reads as words=dock (no checkbox key); the CRM is asked for words; a wildcard is never sent",
    d.params.get("words") === "dock" && !(d.params.get("has") || "").includes("private_dock") && d.params.get("city") === "Murrells Inlet"
    && sent.includes("words=dock%2Cboat+lift") && !bad.includes("words="));
}
{
  // A CRM from before Ticket 556 (its applied list has no "words") searched every home: a dock becomes the MLS checkbox,
  // and a phrase with no checkbox finds nothing, never every home for sale (no closest homes either).
  const was = APPLIED; APPLIED = true;
  const before = calls.length;
  const dock = JSON.parse(await (await run(homes, req("/homes/api/map?q=homes%20with%20a%20dock"))).text());
  const asked = calls.slice(before).map((c) => c.url).filter((u) => u.includes("/api/idx/listings?"));
  const lift = JSON.parse(await (await run(homes, req("/homes/api/map?words=elevator"))).text());
  APPLIED = was;
  check("words on an older CRM: a dock falls back to private_dock; an elevator finds nothing and no closest homes",
    asked.some((u) => u.includes("words=dock")) && asked.some((u) => u.includes("has=private_dock") && !u.includes("words=")) && dock.ok
    && lift.ok && lift.total === 0 && !lift.closest && lift.pins.length === 0);
}

// Nothing matches (owner, 2026-10-29): the closest homes, with what was left out; the sorry box on the page.
{
  const j = JSON.parse(await (await run(homes, req("/homes/api/map?city=Loris&has=walk_to_beach"))).text());
  const t = await (await run(homes, req("/homes/map/?city=Loris&has=walk_to_beach"))).text();
  const r2 = readQuery("I want land to build a house on");
  check("no match: the closest homes keep the feature asked for and leave out the place (owner, 2026-11-07: a dock search came back as oceanfront condos), the page says sorry with its drawing; land to build a house on is land",
    j.ok && j.total === 0 && j.closest && j.closest.total > 0 && j.pins.length >= 0 && j.closest.dropped.some((d) => /Loris/.test(d)) && !j.closest.dropped.some((d) => /beach/i.test(d))
    && t.includes("I'm sorry, no homes match all of that.") && t.includes("hx-sorry-i") && r2.params.get("type") === "land");
}

// The AI reads descriptions in the background (owner, 2026-10-30): signed-up visitors only, six at most, never a recorded view.
{
  const anon = JSON.parse(await (await run(homes, req("/homes/api/remarks?mls=2600001,2600002"))).text());
  const before = calls.length;
  const signed = JSON.parse(await (await run(homes, req("/homes/api/remarks?mls=2600001,2600002,2600003,2600004,2600005,2600006,2600007", cookie))).text());
  const asked = calls.slice(before).filter((c) => /\/api\/idx\/listings\/\w+/.test(c.url));
  check("description reader: sign_in for a visitor not signed up; six at most for a signed-up one, with the description, and never a recorded view (track=0)",
    anon.ok === false && anon.error === "sign_in" && signed.ok && signed.rows.length === 6 && signed.rows.every((r) => typeof r.remarks === "string" && r.remarks.length > 0)
    && asked.length === 6 && asked.every((c) => c.url.includes("track=0")));
}


// Cost (owner, 2026-11-08: "the search is WILDLY expensive"): the AI reads a sentence once, not on every filter change,
// and reads only the homes on screen it has not read for that sentence, at most 24 at a time.
{
  const { MAP_SCRIPT: M } = await import("../idx-lib/map.js");
  check("search: one AI reading per sentence at high effort (aiQ), every home the search found read once per sentence, 120 at a time and more as the list grows, eight a call; descriptions read for anything beyond the basic filters, best score first",
    /j\.q!==aiQ&&wantsAi/.test(M) && /order=order\.slice\(0,120\)/.test(M) && /readSoon\(\)/.test(M) && /outside basic filters/.test(M) && /order\.slice\(i,i\+8\)/.test(M) && !/slice\(0,96\)/.test(M) && /effort:"high"/.test(M) && /if\(q!==rd\.q\)/.test(M) && /sc\(b\[0\]\)-sc\(a\[0\]\)/.test(M) && /for sale with it/.test(M));
}

// Descriptions for every visitor, read on the server (owner, 2026-11-07 and 08; CRM Ticket 557): the AI gets the whole
// description and the details; the browser gets only which homes fit, and the reason only when signed up.
{
  REMARKS_API = true;
  const post = (c) => req("/homes/api/read", { ...(c || {}), method: "POST", headers: { ...((c && c.headers) || {}), "content-type": "application/json" }, body: JSON.stringify({ q: "homes with a dock", state: "words=dock", homes: [{ mls: "2600001", price: 500000 }, { mls: "2600002" }] }) });
  const before = calls.length;
  const raw = await (await run(homes, post())).text();
  const anon = JSON.parse(raw);
  const ai = calls.slice(before).find((c) => c.url.includes("api-proxy"));
  const signed = JSON.parse(await (await run(homes, post(cookie))).text());
  const plain = JSON.parse(await (await run(homes, req("/homes/api/remarks?mls=2600001"))).text());
  REMARKS_API = false;
  check("AI read on the server: the AI gets the description and details (no schools); every visitor gets fit only, no text and no reason (owner, 2026-11-08); the remarks API stays signed-up only",
    anon.ok && anon.r.length === 2 && anon.r.find((x) => x.m === "2600001").fit === "yes" && anon.r.find((x) => x.m === "2600002").fit === "no" && anon.r.every((x) => !("why" in x))
    && !/private dock/.test(raw) && ai && /A home with a private dock, 2600001/.test(ai.init.body) && /Boat Dock/.test(ai.init.body) && !/ElementarySchool/.test(ai.init.body)
    && (ai.init.headers || {}).Origin === "https://chapter3realty.com"
    && !JSON.parse(ai.init.body).effort && /score from 0 to 10/.test(ai.init.body) && !/Filters in force/.test(ai.init.body)
    && signed.ok && signed.r.every((x) => !("why" in x)) && !/private dock/.test(JSON.stringify(signed)) && plain.ok === false && plain.error === "sign_in");
}

// No "no photo" blocks in a row of homes (owner, 2026-10-31: "I see some 'no photo yet' blocks in the IDX feed").
{
  const h = (o) => ({ ...mk(1), ...o });
  check("photos: a home has a photo only with an https link and not a count of 0 (fires on null, http and 0; quiet on a normal home and on a missing count)",
    !hasPhoto(h({ photo: null })) && !hasPhoto(h({ photo: "http://x.test/1.jpg" })) && !hasPhoto(h({ photoCount: 0 })) && hasPhoto(h({})) && hasPhoto(h({ photoCount: undefined })));
  const many = Array.from({ length: 16 }, (_, i) => mk(i, i % 4 === 0 ? { photo: null } : {}));
  const s = stripCards(many, 10), few = stripCards(many.slice(0, 6), 10);
  const shown = s.split('<template class="hx-spare">')[0];
  check("strip cards: homes without a photo are left out; 10 show and the next ones wait in a template (fires with 16 homes, 4 without a photo); quiet with 6: no template",
    !s.includes("hx-nophoto") && (shown.match(/<article class="hx-c">/g) || []).length === 10 && (s.split('<template class="hx-spare">')[1] || "").split("</template>")[0].includes('<article class="hx-c">')
    && !few.includes("<template") && (few.match(/<article class="hx-c">/g) || []).length === 4);
  NOPHOTO = true;
  const g = await (await run(mw, req("/buyers/best-neighborhoods/"))).text();
  const rows = g.split('class="hx-s-row"').slice(1).map((x) => x.split("hx-s-all")[0]);
  const sr = await (await run(homes, req("/homes/"))).text();
  const sim = JSON.parse(await (await run(homes, req("/homes/api/similar?near=33.7,-78.9&beds=3"))).text());
  const st = JSON.parse(await (await run(homes, req("/homes/api/strip?city=Conway"))).text());
  const one = await (await run(homes, req("/homes/2600003-101-test-st-myrtle-beach/"))).text();
  NOPHOTO = false;
  check("guide page: with every third home lacking a photo, no strip shows a card without one (fires: the results page still lists those homes, with the drawn panel)",
    rows.length > 0 && rows.every((x) => !x.includes("hx-nophoto") && x.includes('<article class="hx-c">')) && sr.includes(`<span class="hx-nophoto">${NO_PHOTO}</span>`) && !sr.includes("No photo yet"));
  check("similar homes and a strip's filter answer: no card without a photo; the analyzer's cards carry their own photo fix (that page has no PHOTO_FIX)",
    sim.ok && !!sim.html && !sim.html.includes('class="hx-nophoto"') && sim.html.includes('<img onerror="if(window.hxPhotoFix)return;') && st.ok && !st.html.includes('class="hx-nophoto"'));
  check("listing with no photo: a short drawn panel, no 'Every photo' promise, never 'No photo yet'",
    !one.includes("No photo yet") && one.includes('class="hx-l-media hx-one hx-none"') && one.includes(`<div class="hx-nophoto">${NO_PHOTO}</div>`) && !one.includes("<span>Every photo</span>") && !one.includes("photos</span>"));
  const ok1 = await (await run(homes, req("/homes/2600001-101-test-st-myrtle-beach/"))).text();
  check("listing with a photo: no panel, the photo (quiet)", !ok1.includes('class="hx-nophoto"') && !ok1.includes('hx-one hx-none"') && ok1.includes('<div class="hx-l-media"><div class="hx-l-hero"><img'));
}

// A photo that fails: our copy, then out of the row (strips) or a drawn panel (results, the map, a listing).
{
  check("photo fix: in the head of every page with listings, before any photo; it parses and has no backslash",
    PHOTO_HINT.includes(PHOTO_FIX) && !PHOTO_FIX.includes(String.fromCharCode(92)) && (() => { try { new Function(PHOTO_FIX.replace(/^<script>|<\/script>$/g, "")); return true; } catch { return false; } })()
    && !SCRIPT.includes('document.addEventListener("error"'));
  // A small stand-in for the page, enough for PHOTO_FIX's two listeners.
  const fakePage = () => {
    const L = {};
    const mkEl = (tag, cls, parent) => {
      const e = { tagName: tag.toUpperCase(), className: cls || "", attrs: {}, children: [], parentNode: null, style: {},
        classList: { contains: (c) => e.className.split(" ").includes(c), add: (c) => { if (!e.classList.contains(c)) e.className = (e.className + " " + c).trim(); }, remove: (c) => { e.className = e.className.split(" ").filter((x) => x !== c).join(" "); } },
        getAttribute: (k) => (k in e.attrs ? e.attrs[k] : null), setAttribute: (k, v) => { e.attrs[k] = String(v); },
        matches: (sel) => sel.split(",").some((s) => { s = s.trim(); const m = /^([a-z]*)((?:\.[\w-]+)*)(\[data-place\])?$/.exec(s); if (!m) return false; if (m[1] && e.tagName !== m[1].toUpperCase()) return false; if (m[3] && !("data-place" in e.attrs)) return false; return (m[2] || "").split(".").filter(Boolean).every((c) => e.classList.contains(c)); }),
        closest: (sel) => { for (let x = e; x; x = x.parentNode) if (x.matches && x.matches(sel)) return x; return null; },
        querySelector: (sel) => { const walk = (x) => { for (const c of x.children) { if (c.matches(sel)) return c; const f = walk(c); if (f) return f; } return null; }; return walk(e); },
        replaceChild: (n, o) => { const i = e.children.indexOf(o); if (n.parentNode) n.parentNode.children.splice(n.parentNode.children.indexOf(n), 1); e.children[i] = n; n.parentNode = e; o.parentNode = null; },
        removeChild: (o) => { e.children.splice(e.children.indexOf(o), 1); o.parentNode = null; },
        get firstChild() { return e.children[0] || null; },
        set src(v) { e.attrs.src = v; }, get src() { return e.attrs.src; } };
      if (parent) { parent.children.push(e); e.parentNode = parent; }
      return e;
    };
    const card = (row, src) => { const a = mkEl("article", "hx-c", row), ph = mkEl("span", "hx-c-photo", a), im = mkEl("img", "", ph); im.attrs.src = src; return { a, ph, im }; };
    const doc = { addEventListener: (k, f) => { L[k] = f; } };
    const win = {};
    new Function("document", "window", "setTimeout", PHOTO_FIX.replace(/^<script>|<\/script>$/g, ""))(doc, win, () => {});
    return { L, mkEl, card, win };
  };
  const P = fakePage();
  const strip = P.mkEl("div", "hx-strip"); strip.attrs["data-place"] = "cherry-grove";
  const row = P.mkEl("div", "hx-s-row", strip);
  const first = P.card(row, "https://app.chapter3realty.com/api/idx/photo/1/a/0/480/x.webp");
  const tpl = P.mkEl("template", "hx-spare", row); tpl.content = P.mkEl("div", "");
  const spare = P.card(tpl.content, "https://app.chapter3realty.com/api/idx/photo/2/b/0/480/y.webp");
  P.L.error({ target: first.im });
  const triedOurs = first.im.attrs.src === `/homes/p/card?u=${encodeURIComponent("https://app.chapter3realty.com/api/idx/photo/1/a/0/480/x.webp")}` && row.children[0] === first.a;
  P.L.error({ target: first.im });
  check("photo fix in a strip: a failed photo is asked for from our copy first, then its card leaves the row and the next kept home takes its place (fires)",
    P.win.hxPhotoFix === 1 && triedOurs && row.children[0] === spare.a && !row.children.includes(first.a));
  const only = P.card(row, "/homes/p/card?u=" + encodeURIComponent("https://api.cotality.com/trestle/Media/x"));
  row.children.splice(0, 1); // only this card is left
  P.L.error({ target: only.im }); const direct = only.im.attrs.src === "https://api.cotality.com/trestle/Media/x";
  P.L.error({ target: only.im });
  check("photo fix: our copy failed, so the MLS link is tried; a guide strip left with no card goes empty and the page shows the place's photo", direct && strip.children.length === 0);
  const grid = P.mkEl("div", "hx-grid"), g1 = P.card(grid, "https://app.chapter3realty.com/api/idx/photo/3/c/0/480/z.webp");
  P.L.error({ target: g1.im }); P.L.error({ target: g1.im });
  const okImg = P.card(grid, "https://app.chapter3realty.com/api/idx/photo/4/d/0/480/w.webp");
  P.L.load({ target: g1.im });
  check("photo fix in search results (quiet): the card stays, with the drawn panel until the photo loads; a photo that loads is left alone",
    grid.children.includes(g1.a) && g1.ph.className.includes("hx-c-photo") && !g1.ph.classList.contains("hx-ph-off") && okImg.im.attrs["data-hx-try"] === undefined && STYLE.includes('.hx-ph-off::before{content:"Photo unavailable right now"'));
  const g2 = P.card(grid, "https://app.chapter3realty.com/api/idx/photo/5/e/0/480/v.webp"); P.L.error({ target: g2.im }); P.L.error({ target: g2.im });
  check("photo fix in search results: after our copy fails too, the drawn panel shows (fires)", g2.ph.classList.contains("hx-ph-off") && grid.children.includes(g2.a));
}

// Strips of homes with a feature (owner, 2026-11-08): a place may be a feature search with a town and a price ceiling,
// never a free-for-all; such a strip is never read as a place name in a sentence; each new page has its feed.
{
  const { placeParams } = await import("../idx-lib/edge.js");
  const { PLACES: PL } = await import("../idx-lib/places.js");
  const { FEEDS: FD } = await import("../idx-lib/feeds.js");
  const { readQuery: rq } = await import("../idx-lib/query.js");
  const pool = placeParams(PL["pool-homes-under-400k"].q);
  check("strips: a feature strip searches its features, type and ceiling; an unknown key, a strange town or no anchor is refused; a strip name is not a place in a sentence; the new pages have feeds",
    pool && pool.get("has") === "pool" && pool.get("type") === "house" && pool.get("max") === "400000"
    && placeParams({ has: "not_a_key" }) === null && placeParams({ has: "pool", city: "Atlanta" }) === null && placeParams({ type: "house" }) === null
    && Object.values(PL).filter((p) => p.listOnly).every((p) => p.title && placeParams(p.q))
    && !rq("pool homes in conway").params.toString().includes("place=") && rq("pool homes in conway").params.get("city") === "Conway"
    && ["/buyers/pool-homes/", "/buyers/homes-near-the-beach/", "/buyers/new-construction/builders/", "/sell/sell-or-buy-first/", "/sell/best-time-to-sell/"].every((u) => FD[u] && FD[u].head));
}

// The CRM's photo links (live since 2026-10): kept in our store too, and its first 503 is asked once more.
{
  const C = "https://app.chapter3realty.com/api/idx/photo/1193398589/ttn5mv0/0/480/6FGpCJWlQzo3f770oaSDnH.webp";
  check("photo store: the CRM's photo links are ours (left as they are on the page); lookalikes are refused",
    ourPhoto(C) && photoUrl(C) === C && !ourPhoto("https://app.chapter3realty.com.evil.test/api/idx/photo/1/x.webp") && !ourPhoto("https://app.chapter3realty.com/api/idx/photo/../../x") && !ourPhoto("https://app.chapter3realty.com/api/idx/listings/1"));
  const saved = globalThis.fetch; let n = 0;
  globalThis.fetch = async () => (++n === 1 ? new Response("", { status: 503 }) : new Response(new Uint8Array([82, 73, 70, 70]), { status: 200, headers: { "content-type": "image/webp" } }));
  const ctx = { request: new Request("https://chapter3realty.com/homes/p/card"), waitUntil: () => {}, env: {} };
  const got = await photo(ctx, new URL(`https://chapter3realty.com/homes/p/card?u=${encodeURIComponent(C)}`), "card");
  const twice = n;
  n = 0; globalThis.fetch = async () => { n++; return new Response("", { status: 503 }); };
  const down = await photo(ctx, new URL(`https://chapter3realty.com/homes/p/card?u=${encodeURIComponent(C)}`), "card");
  globalThis.fetch = saved;
  check("photo store: a CRM photo that says 503 once is asked again and served (fires); still 503: the browser is sent to the link, nothing kept",
    got.status === 200 && got.headers.get("content-type") === "image/webp" && twice === 2 && down.status === 302 && down.headers.get("location") === C && n === 2);
}

// The map: no "No photo yet"; the AI picks row shows homes with a photo; the hint never runs under the 2D and 3D buttons on a phone.
{
  const { MAP_SCRIPT: M, MAP_STYLE: MS, pinOf } = await import("../idx-lib/map.js");
  const pin = (o) => pinOf({ ...mk(1), point: { lat: 33.7, lng: -78.9 }, ...o });
  check("map: a pin without a photo carries none, its card says the drawn panel's words; no AI picks box above the results, signed up or not (owner, 2026-11-07)",
    pin({ photo: null }).photo === null && pin({ photoCount: 0 }).photo === null && !!pin({}).photo && !M.includes("No photo yet") && M.includes('"hx-nophoto","No photos posted yet"') && !M.includes("Sign up free and the AI reads") && !M.includes("picksGrid.appendChild(card("));
}

// Words that ran together on a card (owner, 2026-10-31): each fact whole, no rule left at a line's start; the map's popup and hint on a phone.
{
  const { card: cardHtml } = await import("../idx-lib/render.js");
  const { MAP_SCRIPT: M, MAP_STYLE: MS } = await import("../idx-lib/map.js");
  const facts = (o) => (cardHtml({ ...mk(1), ...o }).match(/<span class="hx-c-facts">([\s\S]*?)<\/span><span class="hx-c-addr">/) || [])[1] || "";
  const big = facts({ beds: 7, baths: 6.5, sqft: 12345, lotAcres: 2.75 });
  const land = facts({ beds: undefined, baths: undefined, sqft: undefined, lotAcres: 12.5, propertySubType: "UnimprovedLand" });
  check("card facts: each fact is one unbreakable piece ('12,345 sqft'), with no divider element to dangle (fires on a home with every fact; land with no beds has only its lot and status)",
    big === "<span><b>7</b> bds</span><span><b>6.5</b> ba</span><span><b>12,345</b> sqft</span><span><b>2.75</b> acres</span><span>For sale</span>"
    && land === "<span><b>13</b> acres</span><span>For sale</span>" && !cardHtml(mk(1)).includes('<i aria-hidden="true"></i>')
    && STYLE.includes("main#main .hx-c-facts>span{white-space:nowrap;") && STYLE.includes("clip-path:inset(0 0 0 calc(.45rem + 1px))"));
  check("a failed photo under the sign-up tile shows no words of its own (the tile's button has its words there); on a card or the main photo it does",
    STYLE.includes('.hx-l-tile.hx-ph-off::before{content:"";') && STYLE.includes('.hx-ph-off::before{content:"Photo unavailable right now"'));
  check("map: its cards build the same whole facts; the popup's photo column narrows on a phone and its price keeps clear of the X; the hint never runs under the 2D and 3D buttons",
    M.includes('var s=el("span");s.appendChild(el("b",null,String(x[0])))') && !M.includes('f.appendChild(el("i"))')
    && MS.includes("grid-template-columns:clamp(6.5rem,34%,8.5rem) minmax(0,1fr)") && MS.includes("main#main .hx-mpop .hx-c-price{padding-right:1.9rem}")
    && MS.includes(".hx-map-hint{top:.8rem;bottom:auto;left:.8rem;font-size:.78rem;max-width:calc(100% - 9rem)") && MS.includes(".hx-mpop.hx-mpop-top{bottom:auto;top:4.4rem}"));
}

console.log(fails ? `${fails} control(s) fail` : "all controls pass");
process.exit(fails ? 1 : 0);
