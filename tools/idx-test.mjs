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
import { postFilter, rankHomes } from "../idx-lib/feeds.js";
import { filterBar } from "../idx-lib/filters.js";
import { featureList } from "../idx-lib/features.js";
import { SCRIPT, STYLE } from "../idx-lib/render.js";
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
  if ((init.headers || {})["x-idx-key"] !== "devkey") return J({ ok: false, error: "forbidden" }, 403);
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
  if (HANG) return new Promise((_, no) => init.signal && init.signal.addEventListener("abort", () => no(new Error("aborted"))));
  if (INVALID && auth) return J({ ok: false, error: "unauthorized", visitor: "invalid" }, 401);
  if (u.pathname === "/api/idx/listings") {
    const sub = u.searchParams.get("subdivision"), near = u.searchParams.get("near");
    const n = BIG ? 4041 : sub === "Tidewater" ? 2 : sub || near ? 14 : 30;
    const ls = Array.from({ length: Math.min(n, 48) }, (_, i) => mk(i + 48 * ((+u.searchParams.get("page") || 1) - 1), near ? { miles: 0.4 } : {}));
    return J({ ok: true, tier, visitor: auth ? "valid" : "none", meta: META, ...(APPLIED ? { applied: ["has"].filter((x) => u.searchParams.has(x)) } : {}), listings: ls.slice(0, +u.searchParams.get("size") || 24), total: n, page: 1, pageSize: 24 });
  }
  const one = /^\/api\/idx\/listings\/(\w+)$/.exec(u.pathname);
  if (one) {
    if (one[1] === "404404") return J({ ok: false, error: "not_found" }, 404);
    const l = mk(1, { mlsNumber: one[1], ...(one[1] === "2611111" ? { address: null } : {}), ...(one[1] === "2622222" ? { address: "1 $' $` $& Way" } : {}) });
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
check("strips: at most 10 cards a row, spread across price", (t.split('data-place="cherry-grove"')[1].split("hx-s-all")[0].match(/<article class="hx-c">/g) || []).length === 10);
check("strips: the owner's card template on every card (price, facts, address, MLS line)", (t.match(/<article class="hx-c">/g) || []).length > 0 && (t.match(/<article class="hx-c">/g) || []).length === (t.match(/class="hx-c-price">\$[0-9,]+</g) || []).length && (t.match(/<article class="hx-c">/g) || []).length === (t.match(/Listing provided by CCMLS\./g) || []).length);
check("strips: one notice, the dialogs and the script", (t.match(/class="hx-disclaimer"/g) || []).length === 1 && t.includes('id="hx-signup"'));
check("header: Search Listings opens /homes/", t.includes("location.href='/homes/'") && !t.includes('onclick="openIdx()"'));
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
t = await (await run(homes, req("/homes/map/?city=Conway"))).text();
check("map page: the list of homes, the note, the disclaimer, noindex", t.includes("data-hx-map") && (t.match(/<article class="hx-c">/g) || []).length === 30 && t.includes("Map pins arrive when the MLS feed") && t.includes('class="hx-disclaimer"') && t.includes("noindex"));
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
t = await (await run(homes, req("/homes/map/?city=Conway"))).text();
check("map page: pins in the page as data, with < escaped", /<script type="application\/json" id="hx-pins">\[\{/.test(t) && !/id="hx-pins">[^<]*<(?!\/script)/.test(t));
MAPPOINTS = false;
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
check("feed: the filter bar on the strip, opened on the feed's own filters, refreshing the strip in place", t.includes('data-hx-strip-fb') && /name="waterfront" value="1" checked/.test(t) && t.includes('data-hx-row'));
check("feed: See all opens the same search, with no count from other searches", t.includes('href="/homes/?waterfront=1">See all</a>'));
t = await (await run(mw, req("/buyers/55-plus-communities/"))).text();
check("feed: a page about several communities searches each of them", ["Del+Webb", "Myrtle+Trace", "Seasons+at+Prince+Creek"].every((w) => calls.slice(-6).some((c) => c.url.includes("subdivision=" + w))) && t.includes("Homes for sale in 55+ communities"));
t = await (await run(mw, req("/buyers/new-construction/"))).text();
check("feed: a topic falls back to the newest homes when too few match", t.includes("The newest listings on the Grand Strand") || t.includes("Brand-new homes"));
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
t = await (await run(homes, req("/homes/map/?city=Conway&focus=2699999"))).text();
check("map page: the home a listing page sent us from is among the pins sent to the browser", t.includes('"mls":"2699999"'));
BIG = true;
const beforeBig = calls.length, censusBig = CENSUS_CALLS;
r = await run(homes, req("/homes/map/?city=Myrtle+Beach"));
t = await r.text();
check("map page: 4,041 homes, 144 placed in one geocoder call, under Cloudflare's 50 outside calls", r.status === 200 && CENSUS_CALLS - censusBig === 1 && calls.length - beforeBig <= 8 && (t.match(/"lat":33.71/g) || []).length === 144);
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
  check("homepage: Search listings is a button like the I am buttons, above them, and no search bar", /<ul class="cine-paths" role="list">\s*<li class="cine-main"><a class="cine-path" href="\/homes\/">[^]*?Search listings/.test(home) && !home.includes('class="hero-search"'));
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
  check("analyzer script: the AI's answer is cleaned (numbers, known flag colours) and its text escaped before it goes in as HTML", js.includes("ltrSanitize(extractJSON(analysisRaw))") && js.includes("${c3Esc(f.text)}") && js.includes("${c3Esc(d.inferredPropertyType)}") && !/\$\{f\.text\}/.test(js));
  check("analyzer script: a new address forgets the old home's facts; one run at a time; the cash-or-loan box closes on any end", js.includes("function ltrForgetHome()") && js.includes("if (_ltrRunning) return;") && js.includes("dlg.onclose = function () { finish({ cash: true }); };"));
  check("analyzer script: an address from a link is limited to address characters", js.includes("replace(/[^A-Za-z0-9 #.,'\\/-]/g, '')"));
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
check("search: the filter bar (price, beds and baths, type, town, more), no MLS features while the CRM does not apply them", t.includes('class="hx-fb"') && ["price", "beds", "type", "town", "more"].every((k2) => t.includes(`data-k="${k2}"`)) && !t.includes('name="has" value="pool"') && t.includes('name="hoa" value="0"'));
APPLIED = true;
r = await run(homes, req("/homes/?has=pool&has=garage&has=evil&yearMin=2010&status=active"));
t = await r.text();
{
  const sentF = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("search: MLS features and ranges reach the CRM, an unknown key drops alone, and the panel offers every feature once the CRM applies them", sentF.includes("has=pool%2Cgarage&") && sentF.includes("yearMin=2010") && sentF.includes("status=active") && t.includes('name="has" value="pool"'));
}
r = await run(homes, req("/homes/?has=pool&has=garage"));
t = await r.text();
{
  const sentF = calls.filter((c) => c.url.includes("/api/idx/listings?")).pop().url;
  check("search: features reach the CRM as one list, with a removable chip each", sentF.includes("has=pool%2Cgarage") && t.includes(">Private pool<span") && t.includes(">Garage<span"));
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
APPLIED = false;

console.log(fails ? `${fails} control(s) fail` : "all controls pass");
process.exit(fails ? 1 : 0);
