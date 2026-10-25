/**
 * The listing search's controls, against a mock CRM that answers as contract v1 says.
 * No network, no key. Run: node tools/idx-test.mjs   (prints "all controls pass")
 */
import fs from "node:fs";
import path from "node:path";
import { onRequest as homes } from "../functions/homes/[[path]].js";
import { onRequest as mw } from "../functions/_middleware.js";
import { onRequest as sitemap } from "../functions/sitemap-homes.xml.js";
import { placeParams } from "../idx-lib/edge.js";
import { SCRIPT } from "../idx-lib/render.js";
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
let MAPPOINTS = false;
let sent2 = "";
let HANG = false;
let INVALID = false;
globalThis.fetch = async (input, init = {}) => {
  const u = new URL(typeof input === "string" ? input : input.url);
  calls.push({ url: u.toString(), init });
  const auth = (init.headers || {}).authorization;
  const tier = auth ? "registered" : "public";
  const J = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "content-type": "application/json" } });
  if ((init.headers || {})["x-idx-key"] !== "devkey") return J({ ok: false, error: "forbidden" }, 403);
  if (STALE) return J({ ok: false, error: "stale" }, 503);
  if (HANG) return new Promise((_, no) => init.signal && init.signal.addEventListener("abort", () => no(new Error("aborted"))));
  if (INVALID && auth) return J({ ok: false, error: "unauthorized", visitor: "invalid" }, 401);
  if (u.pathname === "/api/idx/listings") {
    const sub = u.searchParams.get("subdivision"), near = u.searchParams.get("near");
    const n = sub === "Tidewater" ? 2 : sub || near ? 14 : 30;
    const ls = Array.from({ length: n }, (_, i) => mk(i, near ? { miles: 0.4 } : {}));
    return J({ ok: true, tier, visitor: auth ? "valid" : "none", meta: META, listings: ls.slice(0, +u.searchParams.get("size") || 24), total: n, page: 1, pageSize: 24 });
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
check("listing: more homes in the subdivision, closest in price, never this one", t.includes("More homes for sale in Test") && !t.split("More homes for sale in Test")[1].split("hx-disclaimer")[0].includes("/homes/2600005-") && (t.split("More homes for sale in Test")[1].match(/<article class="hx-c">/g) || []).length === 10);
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

check("page script: it parses (a syntax error would break every button)", (() => { try { new Function(SCRIPT.replace(/^<script>|<\/script>$/g, "")); return true; } catch (e) { console.log(e.message); return false; } })());

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
check("listing page: a link to run the rental numbers on this home", t.includes('href="/invest/long-term-rental/?mls=2600005"'));

// Sitemap and the shell.
r = await run(sitemap, req("/sitemap-homes.xml"), { ...ENV, IDX_INDEX_LISTINGS: "1" });
t = await r.text();
check("sitemap: search, places and listings with lastmod", t.includes("/homes/near/cherry-grove/") && t.includes("2600001-1-a-st-myrtle-beach/</loc><lastmod>2026-10-20") && t.includes("/homes/2600002/"));
check("shell: /homes-shell/ is never served", (await run(mw, req("/homes-shell/"))).status === 404);

console.log(fails ? `${fails} control(s) fail` : "all controls pass");
process.exit(fails ? 1 : 0);
