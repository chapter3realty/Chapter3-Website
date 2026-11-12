/* /submarkets/pawleys-island/ - Pawleys Island, SC: the island town and the mainland that shares its
 * name, what living in each part is like and what a house costs there, the old houses, how rarely an
 * island house sells, the yearly cost of a second home, what island rentals take in, flooding and
 * hurricanes, and what can be rebuilt on the ocean.
 *
 * Batch 2026-11-a, Lane U. Version 2, 2026-11-02 (review round 1). The live page was hand-made (an
 * investor report built from a template); this is its first spec, a place guide that leads with the
 * place and its four parts, then the costs and the risks (owner: "we always lead with the good then bad").
 * Facts: Blog-Brain batches/2026-11-a/submarkets-pawleys-island/facts.md (VERIFIED rows, CORRECTED rows at
 * the verifier's corrected values and wording only, and rows 52 to 58 VERIFIED-BY-FIXER in round 1 for
 * the lead to re-check; VERIFY.md; struck wording in submarkets-pawleys-island-struck.json). Demand:
 * must-answer.md. Plan: PLAN.md. Round 1 changes: REVIEW-1.md.
 * Data: data/2026-11-a/submarkets-pawleys-island/ (findings.json, chart-zones.json, chart-hurricanes.json,
 * hurricanes.json, nfip-findings.json, listings-findings.json, map-layers.geojson, raw/drives.json,
 * raw/fix1-places.json, images/setback-inset.json, images/images.json, photos.json). Every count, share,
 * price, policy cost, chart value and drive time is read from those files here and checked against its row.
 * Corrected rows 12 and 18 (the mainland behind the island without DeBordieu's sections), 19, 21, 22 and
 * 33 are typed at the verifier's values, with the row number beside each, because the data files hold the
 * researcher's first figures. Struck rows 14 (DeBordieu figures), 37 (AirROI), 45 and 46 are not used.
 * Kept from the live page: the H1 (data/headlines.json, the owner liked it), Georgetown County, the 4 and
 * 6 percent rule with its "about 3 times" (in dollars), the flood insurance link, the rental links, the HOA
 * papers point (one sentence), the "arrogantly shabby" nickname (once).
 * The homes row: the page carries no homes slot of its own, so the edge places this page's own feed
 * (idx-lib/feeds.js "/submarkets/pawleys-island/": "Top homes in Pawleys Island") under the title area
 * (edge.js placeFeedTop). A page with its own strip gets no feed, and this page's strip slug was not
 * registered for it (NEEDS.md item 7), so the strip was empty and the feed was off.
 * Pictures: our map of the island and the mainland parts on a USDA NAIP aerial (public domain; inline SVG
 * from map-layers.geojson), a labelled NAIP close-up at the North Causeway, our setback map of the south end,
 * glass charts, and Commons photos (CC BY-SA, CC0; records in photos.json and data/photos.json) until the
 * photo partner's shots arrive (shot-list.md). Image files: images/2026-11-a/submarkets-pawleys-island/,
 * made by data/2026-11-a/submarkets-pawleys-island/images/ (naip.py, prep.py, records.py, commons.py).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/pawleys-island/";
const SLUG = "submarkets-pawleys-island";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const IMG_SRC = `/images/2026-11-a/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), Z = read("chart-zones.json"), HC = read("chart-hurricanes.json"), HU = read("hurricanes.json");
const NF = read("nfip-findings.json"), L = read("listings-findings.json"), LAYERS = read("map-layers.geojson");
const DRIVES = read("raw/drives.json"), INSET = read("images/setback-inset.json"), IMGS = read("images/images.json");
const MY_PHOTOS = read("photos.json").photos;
const SITE_PHOTOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "photos.json"), "utf8")).photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const must = (ok, msg) => { if (!ok) throw new Error(`pawleys-island.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const GR = F.groups, I = GR["island/house"];
/* Row 6: about 480 houses on the island. */
must(I.homes === 480 && I.oceanfront === 217, "row 6 changed");
/* Row 7: buildings in the town, 2017 and 2024 surveys. */
must(F.buildings_in_town["2024_status"].new === 12 && F.buildings_in_town["2024_status"].demolished === 7, "row 7 changed");
/* Row 8: taxed as someone's legal residence. Behind the island is 73.3 percent without DeBordieu's sections (row 8 note). */
must(I.legal_residence === 99 && I.pct_legal_residence === 20.6 && GR["west17/house"].pct_legal_residence === 85.7 && GR["litchfield/house"].pct_legal_residence === 41.4, "row 8 changed");
const BEHIND_LEGAL = 73.3;                                                          // row 8, verifier
/* Row 9: market sales. */
must(I.sales_window === 10 && I.market_sale_last5y === 44 && I.pct_market_sale_last5y === 9.2, "row 9 island changed");
must(GR["litchfield/house"].pct_market_sale_last5y === 18.5 && GR["west17/house"].pct_market_sale_last5y === 19.6, "row 9 comparison changed");
/* Row 10: island prices. */
must(I.median_3y === 2450000 && I.sales_3y === 28 && I.p25_3y === 1875000 && I.p75_3y === 2650000 && I.median_window === 2450000, "row 10 changed");
must(GR["island/oceanfront/house"].median_3y === 2615000 && GR["island/oceanfront/house"].sales_3y === 13, "row 10 oceanfront changed");
must(GR["island/marsh/house"].median_3y === 2037500 && GR["island/marsh/house"].sales_3y === 6, "row 10 creek side changed");
/* Row 11: Litchfield's ocean side. */
const LI = GR["litchfield/house"], LO = GR["litchfield/oceanfront/house"];
must(LI.homes === 1214 && LI.sales_window === 50 && LI.median_window === 1250000 && LO.homes === 155 && LO.sales_3y === 15 && LO.median_3y === 3600000, "row 11 changed");
/* Row 12 CORRECTED: the mainland behind the island, north of the island's south tip. */
const BEHIND = { houses: 1168, sales: 53, median: 675000 };                        // row 12, CORRECTED
/* Row 13: west of US 17. */
const WE = GR["west17/house"], WC = GR["west17/condo"];
must(WE.homes === 4849 && WE.sales_window === 220 && WE.median_window === 580000 && WC.sales_window === 34 && WC.median_window === 320000, "row 13 changed");
/* Rows 15 to 17: flood zones. */
must(I.flood.VE === 228 && I.flood.AE === 251 && I.flood["X shaded"] === 1, "row 15 changed");
must(GR["island/south/house"].flood.VE === 190 && GR["island/south/house"].homes === 204 && GR["island/north/house"].flood.VE === 17 && GR["island/north/house"].homes === 218, "row 16 changed");
const BFE = F.island_house_bfe.filter((r) => r[0] !== "X shaded").map((r) => r[1]);
must(Math.min(...BFE) === 12 && Math.max(...BFE) === 16, "row 17 changed");
/* Row 18: flood share by part; behind the island CORRECTED to about a third. */
must(GR["litchfield/house"].pct_special_flood_hazard === 96.6 && GR["west17/house"].pct_special_flood_hazard === 5.5, "row 18 changed");
/* Row 19: federal flood policies, ZIP 29585. */
const NG = NF.groups;
must(NG["town/11/any/any"].policies === 276 && NG["town/11/any/any"].median_cost === 4038.5, "row 19 town changed");
must(NG["town/11/any/not_primary"].median_cost === 4769 && NG["town/11/any/primary"].median_cost === 1682 && NG["county/11/any/any"].median_cost === 1051, "row 19 changed");
must(NG["town/11/any/any"].median_building_coverage === 250000, "row 19 coverage changed");
/* Row 22 CORRECTED: houses past the setback line (at least 20 square metres). */
const PAST = { island: 99, of: 217, south: 78, southOf: 138, litch: 86, litchOf: 155 }; // row 22, CORRECTED
must(INSET.count.oceanfront_houses >= 30 && INSET.houses.length === INSET.count.oceanfront_houses, "the inset lost its houses");
/* Row 26 CORRECTED: storms within 50 miles. */
must(HU.storms === 44 && HU.hurricane_strength_at_closest === 7, "row 26 changed");
must(HC.decades.reduce((a, d) => a + d.storms, 0) === 44 && HC.decades.reduce((a, d) => a + d.hurricanes, 0) === 7, "row 26 chart changed");
must(HC.hurricanes.map((x) => `${x.name} ${x.year}`).join() === "Hazel 1954,Helene 1958,Charley 2004,Matthew 2016,Dorian 2019,Isaias 2020,Ian 2022", "row 26 names changed");
/* Rows 30 to 32: the tax, worked from the county's current estimate. */
const MILLS = { legal: 0.1140, other: 0.2371 }, FEE = { island: 44, district4: 96 }; // row 31, CORRECTED (fee names)
const tax = (price, legal, fee) => price * (legal ? 0.04 * MILLS.legal : 0.06 * MILLS.other) + fee;
must(Math.round(tax(900000, true, 44)) === 4148 && Math.round(tax(900000, false, 44)) === 12847, "row 32 $900,000 changed");
must(Math.round(tax(2450000, true, 44)) === 11216 && Math.round(tax(2450000, false, 44)) === 34898, "row 32 island changed");
must(Math.round(tax(580000, true, 96)) === 2741 && Math.round(tax(580000, false, 96)) === 8347, "row 32 west of US 17 changed");
const ISLAND_SECOND_TAX = tax(2450000, false, 44), ISLAND_FLOOD_NOT_MAIN = NG["town/11/any/not_primary"].median_cost;
const YEARLY = ISLAND_SECOND_TAX + ISLAND_FLOOD_NOT_MAIN;
must(r100(YEARLY) === "$39,700", "the yearly cost line changed");
must(ISLAND_FLOOD_NOT_MAIN / NG["county/11/any/any"].median_cost > 4 && ISLAND_FLOOD_NOT_MAIN / NG["county/11/any/any"].median_cost < 5, "the flood ratio changed");
/* Row 34: listings counted in aggregate. */
const LG = L.groups;
must(LG["all/all"].n === 279 && LG["island/all"].n === 4 && LG["island/house"].n === 2 && LG["island/house"].min === 2980000 && LG["island/house"].max === 3450000, "row 34 changed");
must(LG["all/house"].median_price === 814450 && LG["all/condo_townhouse"].median_price === 315000, "row 34 medians changed");
/* Row 39: where the tax bills go. */
const CITIES = I.bill_sc_city_top.slice(0, 7);
must(I.top_states[0][1] === 337 && I.bill_outside_sc === 143 && CITIES.map((c) => c.join(" ")).join() === "PAWLEYS ISLAND 127,COLUMBIA 33,GREENVILLE 27,CHARLESTON 20,GEORGETOWN 13,MT PLEASANT 12,FLORENCE 10", "row 39 changed");
must(I.top_states.slice(1, 5).map((s) => s.join(" ")).join() === "NC 38,GA 26,TN 15,VA 14", "row 39 states changed");
/* Row 40 (wording CORRECTED) and row 41. */
must(I.last_deed_nominal === 295 && I.pct_last_deed_nominal === 61.5 && GR["west17/house"].pct_last_deed_nominal === 32.9, "row 40 changed");
must(I.last_deed_before_2000 === 47, "row 41 changed");
/* Row 50: drives from Town Hall, free flow. Under 15 minutes to the minute, longer to the nearest 5. */
const mins = (k) => { const m = DRIVES[k].minutes; return m < 15 ? Math.round(m) : Math.round(m / 5) * 5; };
const D = { hospital: mins("tidelands_waccamaw_hospital"), hbsp: mins("huntington_beach_sp"), brookgreen: mins("brookgreen_gardens"),
  georgetown: mins("georgetown_front_street"), airport: mins("airport_terminal"), broadway: mins("broadway_at_the_beach") };
must(D.hospital === 20 && D.hbsp === 15 && D.brookgreen === 20 && D.georgetown === 20 && D.airport === 40 && D.broadway === 40, "row 50 drives changed");
must(Math.round(DRIVES.charleston_marion_square.minutes) === 104, "row 50 Charleston changed");

/* Rows 52 to 58 (round 1, VERIFIED-BY-FIXER): places, drives and the lodging tax. */
const FX = read("raw/fix1-places.json"), FP = FX.places, LT = FX.lodging_tax;
const partOf = (k) => FP[k].part;
must(partOf("Hammock Shops Village") === "behind" && Math.round(FX.drives["Hammock Shops Village"].minutes) <= 3, "row 53 Hammock Shops changed");
must(FX.drives["Publix, 10225 Ocean Highway"].minutes < 5 && partOf("Publix, 10225 Ocean Highway") === "west17", "row 54 nearest grocery changed");
must(["Food Lion, 9380 Ocean Highway", "Lowes Foods, 9160 Ocean Highway"].every((k) => partOf(k) === "behind"), "row 54 groceries behind the island changed");
const GOLF = Object.keys(FP).filter((k) => FP[k].kind === "golf_course");
must(GOLF.filter((k) => FP[k].part === "west17").length === 9 && partOf("Pawleys Plantation (course on Pawleys Plantation Way)") === "behind", "row 55 golf changed");
must(LT.state_atax_2024_total === 532417.16 && LT.local_atax_2024_actual === 828307, "row 52 lodging tax changed");
const RENT = Math.round(LT.rent_from_state_2pct / 1e6);                            // about $27 million (row 52)
must(RENT === 27 && LT.rent_ceiling_from_local_3pct / 1e6 > 27 && LT.rent_ceiling_from_local_3pct / 1e6 < 28, "row 52 rent changed");
const NOT_MAIN = I.homes - I.legal_residence;                                       // 381 houses (row 8)
const PER_HOUSE = Math.round(LT.rent_from_state_2pct / NOT_MAIN / 5000) * 5000;    // about $70,000 (row 52)
must(NOT_MAIN === 381 && PER_HOUSE === 70000, "row 52 per-house average changed");
const Q = LT.state_atax_2024_quarters.map((v) => v / LT.state_atax_2024_total);
must(Q[0] < 0.025 && Q[2] > 0.55 && Q[2] < 0.6, "row 52 quarters changed");

/* Rows 59 to 62 (round 2, VERIFIED-BY-FIXER): eating out, the hammock, Brookgreen, winter. */
const F2 = read("raw/fix2-places.json");
must(F2.restaurants.count === 20 && F2.restaurants.within_200m_of_us17 === 19, "row 59 restaurants changed");
must(F2.hammock_shops_restaurants.names.join() === "Local | Eat, Drink, Celebrate,BisQit", "row 59 Hammock Shops restaurants changed");
must(F2.hammock_history.quote.includes("in 1889") && F2.hammock_history.quote.includes("cotton ropes"), "row 60 hammock changed");
const JAN = F2.normals.rows.find((r) => r.DATE === "01");
const JAN_HI = Math.round(+JAN["MLY-TMAX-NORMAL"]), JAN_LO = Math.round(+JAN["MLY-TMIN-NORMAL"]);
must(JAN_HI === 57 && JAN_LO === 37 && Math.round(F2.normals.miles_from_town_hall) === 6, "row 62 normals changed");
must(F2.dogs.quote.includes("May 1 through September 30") && F2.hurricane_season.quote.includes("June 1 to November 30"), "row 62 dogs or season changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const CSS = `<style>
main#main .c3-pi-fig{margin:1.4rem 0 1.6rem;max-width:720px}
/* The two maps are tall: kept narrower, so each fits on one desktop screen. */
main#main .c3-pi-fig:not(.c3-gchart){max-width:560px!important}
main#main .c3-pi-fig.narrow{max-width:520px!important}
main#main .c3-pi-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}
main#main .c3-pi-frame{border-radius:14px;overflow:hidden;background:#2b5f63}
main#main .c3-pi-frame svg{display:block;width:100%;height:auto}
main#main svg.c3-pi-map .lb{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:74px;fill:#fff;paint-order:stroke;stroke:rgba(20,28,34,.88);stroke-width:15px;stroke-linejoin:round}
main#main svg.c3-pi-map .lb.it{font-style:italic;font-weight:600}
main#main svg.c3-pi-map .lb.hl{fill:#ffe7c2}
main#main svg.c3-pi-map .lb.sm{font-size:56px}
@media (min-width:700px){main#main svg.c3-pi-map .lb{font-size:40px;stroke-width:9px}main#main svg.c3-pi-map .lb.sm{font-size:32px}}
main#main svg.c3-pi-inset .lb{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:56px;fill:#fff;paint-order:stroke;stroke:rgba(20,28,34,.88);stroke-width:12px;stroke-linejoin:round;letter-spacing:.02em}
main#main svg.c3-pi-inset .lb.sb{fill:#ffd27a}
@media (min-width:700px){main#main svg.c3-pi-inset .lb{font-size:32px;stroke-width:7px}}
main#main .c3-pi-legend{list-style:none;margin:.7rem 0 0;padding:0;display:grid;gap:.35rem;font-size:.98rem;color:var(--muted);line-height:1.4}
main#main .c3-pi-legend li{display:flex;gap:.6rem;align-items:center;margin:0}
main#main .c3-pi-legend i{flex:none;display:inline-block;width:1.6rem;height:.9rem;border-radius:3px}
/* Short facts: a plain list under thin rules, not cards. */
main#main .c3-pi-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
@media (min-width:700px){main#main .c3-pi-rules:not(.one){grid-template-columns:1fr 1fr}}
main#main .c3-pi-rules.one{max-width:665px}
main#main .c3-pi-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .c3-pi-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main .c3-pi-note{margin:1.3rem 0 1.5rem;padding:.2rem 0 .2rem 1.1rem;max-width:665px;border-left:3px solid var(--brass,#c4783a);color:var(--ink,#1c2028);line-height:1.6}
main#main .c3-pi-note strong{display:block;color:var(--navy);margin-bottom:.2rem}
/* Each of the four parts starts under a rule, with a heading that can be found while scrolling. */
main#main .c3-pi-place{clear:both;margin:3rem 0 .9rem;padding-top:1.6rem;border-top:1px solid rgba(28,32,40,.16);font-family:var(--serif);font-size:1.7rem;font-weight:500;color:var(--navy);line-height:1.2;max-width:720px}
main#main .c3-pi-place span{display:block;font-family:var(--sans);font-size:1rem;font-weight:600;color:var(--brass-ink,#8a5a2b);letter-spacing:.01em;margin-top:.35rem}
main#main h2{text-wrap:balance}
main#main figure.c3ph-hero img{aspect-ratio:4/3!important}
main#main svg.c3-pi-cols text{font-family:var(--sans),system-ui,sans-serif;font-size:21px;fill:#4a5763}
main#main svg.c3-pi-cols text.v{font-weight:700;fill:#91592b}
@media (min-width:700px){main#main svg.c3-pi-cols text{font-size:12px}}
main#main .c3-pi-names{list-style:none;margin:.6rem 0 0;padding:0;display:flex;flex-wrap:wrap;gap:.4rem}
main#main .c3-pi-names li{margin:0;padding:.25rem .65rem;border-radius:999px;background:rgba(196,120,58,.13);color:#7a4a22;font-size:.95rem;line-height:1.4}
main#main .c3-pi-tax td{white-space:nowrap}
@media (max-width:480px){main#main .c3-pi-tax th,main#main .c3-pi-tax td{padding:.5rem .4rem!important}main#main .c3-pi-tax>div{padding-left:.6rem!important;padding-right:.6rem!important}}
main#main .c3-pi-stats{list-style:none;padding:0;margin:1.2rem 0 1.4rem;display:grid;grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr));gap:.9rem 2rem;max-width:720px}
main#main .c3-pi-stats li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16)}
main#main .c3-pi-stats b{display:block;font-family:var(--serif);font-size:1.45rem;color:var(--navy);line-height:1.15}
main#main .c3-pi-stats span{display:block;color:var(--muted);font-size:.95rem;line-height:1.35;margin-top:.2rem}
/* The contents list: no card, plain columns between two thin rules (as /invest/condos/). */
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
/* One block width: charts, tables, maps, lists and offers are 720 px, like the contents and the top offer. */
main#main .c3-gchart,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box}
main#main .c3-gchart,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{clear:both}
/* Photos and maps sit on the page: no card around the picture, the caption under it. */
main#main figure:not(.c3-gchart){background:none!important;border:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:0!important;border-radius:0!important}
main#main figure:not(.c3-gchart)>figcaption,main#main figure.c3ph-hero figcaption{padding:.6rem 0 0!important;margin-top:0!important;color:var(--muted);font-size:.92rem;line-height:1.5}
main#main figure .c3ph-f{border-radius:14px!important;box-shadow:none!important}
main#main .c3-pi-legend{margin-top:.8rem}
/* A wide screen: the photos inside the text sit beside their paragraphs, in the space right of the text. */
@media (min-width:1100px){
main#main>section>.wrap:has(.c3-pi-side){display:flow-root}
main#main figure.c3-pi-side{float:right;clear:right;width:380px;max-width:380px!important;margin:.35rem 0 1.6rem 2rem!important}
/* The island part: the close-up sits after the second paragraph on a phone, beside the first on a wide screen. */
main#main .c3-pi-pair{display:grid;grid-template-columns:minmax(0,665px) 380px;justify-content:space-between;align-items:start}
main#main .c3-pi-pair>*{grid-column:1}
main#main .c3-pi-pair>figure.c3-pi-side{grid-column:2;grid-row:1/span 5;float:none;margin:.35rem 0 0!important}
}
/* The hero: the walkway photo beside the tiles, byline and sub on a wide screen; after the sub on a narrower one. */
main#main .detail-hero .detail-media{display:contents}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
main#main .detail-hero figure.c3-pi-hero{margin:.4rem 0 0!important;max-width:640px}
main#main .detail-h1 em{display:block;text-wrap:balance}
/* A phone: each tile is one short row (icon, label, number) under a hairline, with no box. */
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
@media (max-width:1099px){main#main .detail-hero .wrap{display:flex;flex-direction:column}main#main .detail-hero figure.c3-pi-hero{order:9}}
@media (min-width:700px) and (max-width:1099px){main#main .detail-hero figure.c3-pi-hero{max-width:440px}}
@media (min-width:1100px){
main#main .detail-hero .wrap{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:repeat(6,auto) 1fr;column-gap:3rem}
main#main .detail-hero .wrap>*,main#main .detail-hero .c3-glance{grid-column:1}
main#main .detail-hero .breadcrumb,main#main .detail-hero .eyebrow,main#main .detail-hero .detail-h1{grid-column:1/-1}
main#main .detail-hero figure.c3-pi-hero{grid-column:2;grid-row:4/8;align-self:start;margin:0!important;width:380px}
/* The headline in two lines across the full width: at full size the italic line is a few pixels too long in the fallback font. */
main#main .detail-h1 em{font-size:min(.95em,70px)}
}
/* The end band (the same fix as /submarkets/garden-city/; NEEDS.md there). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* Web Mercator placement, shared by the two maps.                                */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const f1 = (v) => Math.round(v * 10) / 10;
const placer = (bbox, W, H) => (lo, la) => [(mx(lo) - mx(bbox[0])) / (mx(bbox[2]) - mx(bbox[0])) * W, (my(bbox[3]) - my(la)) / (my(bbox[3]) - my(bbox[1])) * H];

/* ---------------------------------------------------------------------------- */
/* Map 1: the island and the mainland, on the USDA NAIP aerial (public domain).   */
/* The four parts are named on the map itself; there is no separate key (owner, 2026-10-14: no list
   repeated before the first place). */

const AREA_MAP = (() => {
  const OV = IMGS.overview, [W, H] = OV.frame_px, P = placer(OV.bbox_wgs84, W, H);
  const feat = (layer) => LAYERS.features.filter((f) => f.properties.layer === layer);
  const lines = (fs) => fs.flatMap((f) => f.geometry.type === "Polygon" ? [f.geometry.coordinates[0]] : f.geometry.type === "MultiPolygon" ? f.geometry.coordinates.map((p) => p[0]) : f.geometry.coordinates);
  const d = (coords) => "M" + coords.map((c) => P(c[0], c[1]).map(f1).join(" ")).join("L");
  const town = lines(feat("town_limits")).map((c) => d(c) + "Z").join("");
  const us17 = lines(feat("us17")).map(d).join("");
  const causeways = lines(feat("causeway")).map(d).join("");
  const lab = (text, lo, la, o = {}) => { const [x0, y0] = P(lo, la), x = f1(x0 + (o.dx || 0)), y = f1(y0 + (o.dy || 0));
    return `<text class="lb${o.cls ? " " + o.cls : ""}" x="${x}" y="${y}" text-anchor="${o.anchor || "start"}"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ""}>${text}</text>`; };
  const svg = `<svg class="c3-pi-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="c3-pi-map-t">`
    + `<title id="c3-pi-map-t">Aerial map of Pawleys Island, South Carolina, and the mainland around it. The island is a thin strip along the ocean with salt marsh behind it; the town limits are shaded and outlined. Two causeways cross the marsh to the mainland. US 17 runs inland, parallel to the coast. Litchfield is north of the island on the ocean side of US 17; the mainland behind the island lies between US 17 and the marsh; about 4,800 houses are west of US 17.</title>`
    + `<image href="${IMG_SRC}/${OV.file}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`
    + `<path d="${town}" fill="#ffe7c2" fill-opacity=".34" stroke="#1c2028" stroke-opacity=".7" stroke-width="15"/><path d="${town}" fill="none" stroke="#fff3df" stroke-width="7" stroke-dasharray="26 12"/>`
    + `<path d="${us17}" fill="none" stroke="#fff" stroke-opacity=".95" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${causeways}" fill="none" stroke="#f2b25c" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    + lab("Atlantic Ocean", -79.1000, 33.4000, { cls: "it sm", anchor: "middle" })
    + lab("US 17", -79.1180, 33.4530, { cls: "sm", rot: -57, anchor: "middle", dx: -40 })
    + lab("Pawleys Island", -79.1160, 33.4200, { cls: "hl", anchor: "start", rot: -52 })
    + lab("Litchfield", -79.0930, 33.4700, { anchor: "end" })
    + lab("Behind the island", -79.1700, 33.4120, { anchor: "start" })
    + lab("West of US 17", -79.1700, 33.4560, { anchor: "start" })
    + `</svg>`;
  return `<figure class="c3-pi-fig"><div class="c3-pi-frame">${svg}</div><figcaption>The shaded strip inside the dashed line is the Town of Pawleys Island: the island and the marsh behind it. The orange lines are the two causeways. Aerial: USDA NAIP via The National Map (USGS), public domain. Lines: Georgetown County GIS. Labels: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Map 2: the setback line at the south end, on the NAIP aerial.                  */

const SETBACK_MAP = (() => {
  const S = IMGS.south, [W, H] = S.frame_px, [cx0, cy0, cx1, cy1] = S.crop_px, P = placer(S.bbox_wgs84, W, H);
  const d = (coords) => "M" + coords.map((c) => P(c[0], c[1]).map(f1).join(" ")).join("L");
  const houses = INSET.houses.map((hs) => `<path d="${d(hs.ring)}Z" fill="${hs.past ? "rgba(196,120,58,.5)" : "rgba(255,255,255,.15)"}" stroke="${hs.past ? "#ffb35c" : "#fff"}" stroke-width="${hs.past ? 4 : 3}"/>`).join("");
  const sb = INSET.setback.map(d).join(""), bl = INSET.baseline.map(d).join("");
  /* Label anchors: a point on each line in the upper part of the frame; the text sits over the beach and the sea. */
  const at = (ls, lat) => { const pts = ls.flat(); return pts.reduce((b, c) => Math.abs(c[1] - lat) < Math.abs(b[1] - lat) ? c : b); };
  const [sx, sy] = P(...at(INSET.setback, 33.4030)), [bx, by] = P(...at(INSET.baseline, 33.4025));
  must(sy > cy0 && sy < cy1 && by > cy0 && by < cy1 && sy - 160 > cy0 && sx + 88 + 280 < cx1 && bx + 98 + 380 < cx1 && by + 200 < cy1, "an inset label is off the frame");
  const leader = (x, y, tx, ty) => `<path d="M${f1(x)} ${f1(y)}L${f1(tx)} ${f1(ty)}" stroke="#fff" stroke-width="4"/><circle cx="${f1(x)}" cy="${f1(y)}" r="8" fill="#fff" stroke="#1c2028" stroke-width="4"/>`;
  const svg = `<svg class="c3-pi-inset" xmlns="http://www.w3.org/2000/svg" viewBox="${cx0} ${cy0} ${cx1 - cx0} ${cy1 - cy0}" role="img" aria-labelledby="c3-pi-inset-t">`
    + `<title id="c3-pi-inset-t">Aerial map of the south end of Pawleys Island: one row of oceanfront houses between the creek and the beach. The state's baseline along the top of the front dune and its setback line 20 feet behind it run through the row of houses. A shaded house has part of it on the ocean side of the setback line.</title>`
    + `<image href="${IMG_SRC}/${S.file}" x="${cx0}" y="${cy0}" width="${cx1 - cx0}" height="${cy1 - cy0}" preserveAspectRatio="none"/>`
    + houses
    + `<path d="${sb}" fill="none" stroke="#1c2028" stroke-opacity=".55" stroke-width="9"/><path d="${sb}" fill="none" stroke="#ffd27a" stroke-width="5" stroke-dasharray="16 10"/>`
    + `<path d="${bl}" fill="none" stroke="#1c2028" stroke-opacity=".55" stroke-width="9"/><path d="${bl}" fill="none" stroke="#fff" stroke-width="5"/>`
    + leader(sx, sy, sx + 80, sy - 55) + `<text class="lb sb" x="${f1(sx + 88)}" y="${f1(sy - 110)}">Setback</text><text class="lb sb" x="${f1(sx + 88)}" y="${f1(sy - 52)}">line</text>`
    + leader(bx, by, bx + 90, by + 20) + `<text class="lb" x="${f1(bx + 98)}" y="${f1(by + 40)}">Top of</text>`
    + `<text class="lb" x="${f1(bx + 98)}" y="${f1(by + 96)}">the dune</text><text class="lb" x="${f1(bx + 98)}" y="${f1(by + 152)}">(baseline)</text>`
    + `</svg>`;
  const legend = `<ul class="c3-pi-legend"><li><i style="background:rgba(196,120,58,.75);border:2px solid #ffb35c"></i>Part of the house, about 200 square feet or more, is past the setback line</li>`
    + `<li><i style="background:rgba(255,255,255,.6);border:2px solid #8a96a3"></i>The house is behind it</li></ul>`;
  return `<figure class="c3-pi-fig narrow"><div class="c3-pi-frame">${svg}</div>${legend}<figcaption>A stretch of the south end of the island, north of the south-end parking lot. Lines: the state's current baseline and setback line. Outlines: Georgetown County's 2024 building footprints. Aerial: USDA NAIP via The National Map (USGS), public domain. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Photos.                                                                        */

const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const photo = (r, caption) => lazy(PH.heroPhoto(r, { alt: r.alt, caption: caption || r.caption, maxWidth: "720px", sizes: "(max-width: 700px) 100vw, 720px" }));
/* A photo beside its paragraph on a wide screen (CSS above); full width in the column below 1,100 px. */
const side = (r, caption) => lazy(PH.heroPhoto(r, { alt: r.alt, caption: caption || r.caption, maxWidth: "720px", sizes: "(max-width: 700px) 100vw, (max-width: 1099px) 720px, 380px" })).replace('<figure class="c3ph-hero"', '<figure class="c3ph-hero c3-pi-side"');
const mine = (fn) => MY_PHOTOS.find((x) => x.file.includes(`/${fn}-1200w`));
const CAUSEWAY = mine("pawleys-island-at-the-north-causeway");
const WALKWAY = SITE_PHOTOS.find((x) => x.file.endsWith("/pawleys-island-beach-walkway.webp"));
const MARSH = mine("pawleys-island-marsh-walkway"), OLD_HOUSE = mine("pawleys-island-old-house-still-standing"), NORTH_END = mine("pawleys-island-north-end");
must(CAUSEWAY && WALKWAY && MARSH, "a photo record is missing");
/* The walkway file shows a walkway over the dunes; the "from a house" in its old caption claimed more than the file shows. */
const WALK_CAPTION = "A wooden walkway over the dunes to the beach on Pawleys Island.";
const SHOWN = [CAUSEWAY, MARSH, OLD_HOUSE, WALKWAY, NORTH_END].filter(Boolean);
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: p === WALKWAY ? "A walkway over the dunes on Pawleys Island" : p.title })));
const maybe = (p) => (p ? photo(p) : "");
const maybeSide = (p) => (p ? side(p) : "");
/* The walkway over the dunes opens the page: beside the tiles on a wide screen, after the sub line on a phone. Loads first. */
const HERO_PHOTO = PH.heroPhoto(WALKWAY, { alt: WALKWAY.alt, caption: WALK_CAPTION, sizes: "(max-width: 1099px) 100vw, 380px" }).replace('<figure class="c3ph-hero"', '<figure class="c3ph-hero c3-pi-hero"');

/* ---------------------------------------------------------------------------- */
/* Charts.                                                                        */

/* How often a house sells at a market price (row 9). */
const TURNOVER_CHART = G.bars([
  { name: "Pawleys Island, the town", value: I.pct_market_sale_last5y, valueText: "About 1 in 11" },
  { name: "Litchfield, ocean side of US 17", value: LI.pct_market_sale_last5y, valueText: "About 1 in 5" },
  { name: "West of US 17", value: WE.pct_market_sale_last5y, valueText: "About 1 in 5" },
], { caption: "Houses bought at a market price in the past five years", nameLabel: "Part", valueLabel: "Share of houses", compact: true, max: 25,
  note: "At least: the county keeps only the last deed on each house, so a house sold and later deeded to a trust counts as not sold. That is true in every part. Georgetown County records; a market sale is a deed of $10,000 or more." });

/* The last transfer was not a sale (row 40, wording CORRECTED). */
const FAMILY_CHART = G.bars([
  { name: "Pawleys Island, the town", value: I.pct_last_deed_nominal, valueText: "About 6 in 10" },
  { name: "Litchfield, ocean side of US 17", value: LI.pct_last_deed_nominal, valueText: "About 4 in 10" },
  { name: "West of US 17", value: WE.pct_last_deed_nominal, valueText: "About 1 in 3" },
], { caption: "Houses whose last recorded transfer was not a sale", nameLabel: "Part", valueLabel: "Share of houses", compact: true, max: 100,
  note: "The last deed on the house shows under $1,000. Georgetown County records." });
must(LI.pct_last_deed_nominal === 40.5, "row 40 Litchfield changed");

/* Flood policy cost (row 19). */
const FLOOD_CHART = G.bars([
  { name: "Island house, not the owner's main home", value: ISLAND_FLOOD_NOT_MAIN, valueText: r10(ISLAND_FLOOD_NOT_MAIN) },
  { name: "Island house, the owner's main home", value: NG["town/11/any/primary"].median_cost, valueText: r10(NG["town/11/any/primary"].median_cost) },
  { name: "Mainland house, same ZIP code", value: NG["county/11/any/any"].median_cost, valueText: r10(NG["county/11/any/any"].median_cost), reference: true },
], { caption: "What a federal flood policy on a house cost a year, at the middle", nameLabel: "House", valueLabel: "A year", compact: true,
  note: "FEMA's flood insurance policies on single-family houses that began in the 12 months to May 2026, ZIP 29585. Island: the Town of Pawleys Island's policies. Mainland: the Georgetown County policies in the same ZIP code. The cost includes FEMA's fees." });

/* Storms within 50 miles by decade (row 26). Bigger type on a phone: the chart is 360 units wide. */
const STORM_CHART = (() => {
  const rows = HC.decades, Wd = 360, Ht = 240, L0 = 34, R0 = 352, T0 = 26, B0 = 196, MAX = 10, bw = (R0 - L0) / rows.length;
  const Y = (v) => B0 - v / MAX * (B0 - T0);
  const grid = [0, 5, 10].map((v) => `<line x1="${L0}" x2="${R0}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity="${v ? ".12" : ".35"}"/><text x="${L0 - 6}" y="${f1(Y(v) + 6)}" text-anchor="end">${v}</text>`).join("");
  const cols = rows.map((r, i) => { const x = L0 + i * bw + bw * 0.14, w = bw * 0.72;
    return `<rect x="${f1(x)}" y="${f1(Y(r.storms))}" width="${f1(w)}" height="${f1(B0 - Y(r.storms))}" rx="3" fill="#d9b48f"/>`
      + (r.hurricanes ? `<rect x="${f1(x)}" y="${f1(Y(r.hurricanes))}" width="${f1(w)}" height="${f1(B0 - Y(r.hurricanes))}" rx="3" fill="#c4783a"/>` : "")
      + `<text class="v" x="${f1(x + w / 2)}" y="${f1(Y(r.storms) - 6)}" text-anchor="middle">${r.storms}</text>`
      + `<text x="${f1(x + w / 2)}" y="${B0 + 26}" text-anchor="middle">’${r.decade.slice(2, 4)}</text>`; }).join("");
  const svg = `<svg class="c3-pi-cols" viewBox="0 0 ${Wd} ${Ht}" width="100%" role="img" aria-label="Column chart of storms whose center passed within 50 miles of Pawleys Island, by decade: ${rows.map((r) => `${r.decade} ${r.storms} storms, ${r.hurricanes} hurricanes`).join("; ")}.">${grid}${cols}</svg>`;
  const names = `<ul class="c3-pi-names" aria-label="The seven hurricanes">` + HC.hurricanes.map((x) => `<li>${x.name}, ${x.year}</li>`).join("") + `</ul>`;
  return `<figure class="c3-gchart c3-pi-fig"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem">Storms that passed within 50 miles of the island, by decade</span>${svg}${names}<figcaption>Each column is a decade, from the 1950s (’50) to the 2020s (’20). Darker: storms that were hurricanes at their closest point. NOAA National Hurricane Center storm tracks (HURDAT2), 1950 to 2025, measured from the middle of the island.</figcaption></figure>`;
})();

/* Who is here year round: houses taxed as someone's legal residence (row 8). */
const LEGAL_CHART = G.bars([
  { name: "Pawleys Island, the town", value: I.pct_legal_residence, valueText: "About 1 in 5" },
  { name: "Litchfield, ocean side of US 17", value: LI.pct_legal_residence, valueText: "About 4 in 10" },
  { name: "Mainland behind the island", value: BEHIND_LEGAL, valueText: "About 3 in 4" },
  { name: "West of US 17", value: WE.pct_legal_residence, valueText: "About 6 in 7" },
], { caption: "Houses that are their owner's main home, by part", nameLabel: "Part", valueLabel: "Share of houses", compact: true, max: 100,
  note: "Houses taxed at the main-home rate in Georgetown County's 2026 tax records. The rest are second homes and rentals." });

/* Where the island's tax bills go (row 39). */
const title = (s) => s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace("Mt ", "Mount ");
const BILL_CHART = G.bars([
  ...CITIES.map(([c, k]) => ({ name: title(c), value: k, valueText: `${k} houses` })),
  { name: "Out of state", value: I.bill_outside_sc, valueText: `${I.bill_outside_sc} houses`, reference: true },
], { caption: "Where the tax bills for island houses go", nameLabel: "City", valueLabel: "Houses", compact: true, phoneList: true,
  note: "The mailing city on each island house's tax bill, Georgetown County records. A mailing city is where the bill goes, not always where the owner lives. Out of state, North Carolina, Georgia, Tennessee and Virginia lead." });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://gis1.georgetowncountysc.org/portal/rest/services";
const GTCALC = "https://www.gtcountysc.gov/385/Property-Tax-Calculator";
const CENSUS = "https://data.census.gov/profile/Pawleys_Island_town,_South_Carolina?g=160XX00US4555015";
const NFIP = "https://www.fema.gov/api/open/v3/NfipPolicies";
const HURDAT = "https://www.nhc.noaa.gov/data/#hurdat";
const SC48 = "https://www.scstatehouse.gov/code/t48c039.php";
const SC12 = "https://www.scstatehouse.gov/code/t12c043.php";
const SC1236 = "https://www.scstatehouse.gov/code/t12c036.php";
const ST575 = "https://dor.sc.gov/sites/dor/files/forms/ST575.pdf";
const NRHP = "https://npgallery.nps.gov/AssetDetail/NRIS/72001211";
const TOWN = "https://www.townofpawleysisland.com";
const T = (p) => `${TOWN}/${p}/`;
const BUDGET = `${TOWN}/wp-content/uploads/2025/12/2026-Annual-Budget-FINAL.pdf`;
const ATAX = `${TOWN}/wp-content/uploads/2026/02/Pawleys-Island-Atax-Agenda_Packet-Nov-2025-1.pdf`;
const HBSP = "https://southcarolinaparks.com/huntington-beach";
const OSM = "https://www.openstreetmap.org/";

/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const TOP = { title: "Want a house on the island? Tell us what you want.", label: "Ask us to watch the island", href: `/contact/?place=${encodeURIComponent("Pawleys Island")}` };
const END = {
  h2: "Island or mainland, we check four things before you offer.",
  p: "The flood zone and how high the floor sits. Where the setback line falls on an oceanfront lot. Whether the town lists the house as historic. The tax bill as your main home or a second home.",
  label: "Talk to a Pawleys Island agent", href: `/contact/?place=${encodeURIComponent("Pawleys Island")}`,
};
const ask = (place, label) => G.offer(place, { label });
const place = (id, name, line) => `<h3 id="${id}" class="c3-pi-place">${name}<span>${line}</span></h3>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(CAUSEWAY),
  title: "Pawleys Island Real Estate: Island vs Mainland, Prices, Flood",
  description: "Pawleys Island, SC: life on the island and the mainland that shares its name, how rarely an island house sells, prices, flood zones, taxes and rentals.",
  ogTitle: "Pawleys Island: about 480 island houses, what they cost, and the mainland that shares the name",
  crumb: "Pawleys Island",
  eyebrow: "Pawleys Island, SC",
  h1: "Pawleys Island real estate:",
  h1em: "the upscale south end of the Strand.",
  sub: "Pawleys Island is the south end of the Grand Strand: old beach houses on an island, with most homes that share its name on the mainland.",
  heroMedia: CSS + glance([
    { icon: "home", label: "Island houses", text: "About 480" },
    { icon: "beach", label: "Beach parking", text: "Free" },
    { icon: "tax", label: "Town property tax", text: "None" },
    { icon: "key", label: "Sold last year", text: `${I.sales_window} houses` },
  ]) + HERO_PHOTO,
  heroCta: TOP,
  topOfferLine: "Island houses rarely list. We watch the island and call you.",
  author: "devin",
  shortAnswer: [
    `Pawleys Island is a quiet beach town of about 480 houses on a barrier island, a narrow strip of land just off the coast. The ocean is in front, and a tidal creek and salt marsh are behind. The middle of the island is a historic district of old wooden summer houses, and beach parking is free.`,
    `Island houses rarely come up for sale: ${I.sales_window} sold at a market price in the past year, and over three years one sold for about $2.45 million at the middle. Most homes with a Pawleys Island address are on the mainland, where a house sold for about $580,000 to $675,000. Every island house but one is in a high-risk flood zone.`,
  ],
  sections: [
    { h2: "Is Pawleys Island an island, and what are its four parts like?", toc: "The four parts", id: "places", html: () =>
      h.p(`Yes. Pawleys Island is a barrier island, less than 4 miles long and mostly one house wide, with salt marsh between it and the mainland. Two short causeways, the North Causeway and the South Causeway, cross the marsh.`) +
      h.p(`The Town of Pawleys Island is the island itself. The mainland around it has no town government; it is run by Georgetown County. Much of it shares the island's name and its ZIP code, 29585, so a Pawleys Island address can be a house on the mainland. This page covers four parts, from the beach inland.`) +
      AREA_MAP +
      place("the-island", "Pawleys Island, the town", "The beach in front, the creek behind") +
      `<div class="c3-pi-pair">` +
      h.p(`The island is one long strip of houses between the ocean and the creek. About 220 houses face the beach. The rest look onto the marsh and the creek, or stand on the streets between. In the middle of the island are the old wooden summer houses of the historic district.`) +
      h.p(`The water is close on both sides. People fish in the surf and crab from the two marsh bridges, and the island has three boat ramps. Beach parking is free: the south-end lot is the largest free beach lot in Georgetown County, and 8 other public accesses add about 141 spaces. Dogs are allowed on the beach all year, on a leash on summer days.`) +
      side(CAUSEWAY) +
      h.p(`The pace is slow. The speed limit is 25 mph, and golf carts are allowed on island roads. There are no lifeguards and no fireworks. The town still calls itself by its old nickname, "arrogantly shabby".`) +
      h.p(`Over three years an island house sold for about $2.45 million at the middle, more on the ocean and less on the creek side. At our last count, only ${LG["island/house"].n} island houses were for sale, each asking about $3 million or more.`) +
      ask("Pawleys Island", "Send me the Pawleys Island houses for sale now") +
      `</div>` +

      place("litchfield", "Litchfield", "The beach north of the island, and more houses for sale") +
      h.p(`North of the island, Litchfield runs along the beach on the ocean side of the highway. It has about 1,200 houses, and more of them are lived in all year: about 4 in 10 are their owner's main home, twice the island's share.`) +
      `<ul class="c3-pi-rules" aria-label="Near Litchfield">`
        + `<li><strong>A bike path</strong>The Waccamaw Neck Bikeway runs along US 17 through Litchfield and north to Murrells Inlet.</li>`
        + `<li><strong>Huntington Beach State Park</strong>Farther north: 3 miles of beach, and Atalaya, the old winter home of Archer and Anna Hyatt Huntington.</li>`
        + `<li><strong>Brookgreen Gardens</strong>Opposite the park. The Huntingtons set it up as a nature preserve to show her sculpture and the work of other sculptors.</li>`
        + `<li><strong>A landmark</strong>Atalaya and Brookgreen Gardens together are a National Historic Landmark.</li>`
        + `</ul>` +
      h.p(`More houses sell here: ${LI.sales_window} in the past year, at about $1.25 million at the middle. Its oceanfront houses sell for more than the island's: about $3.6 million at the middle over three years. Almost all of Litchfield's ocean side is in a high-risk flood zone too.`) +
      ask("Litchfield", "Get the homes for sale in Litchfield") +

      place("behind-the-island", "The mainland behind the island", "Shops, groceries and golf near the causeways") +
      h.p(`Between US 17 and the marsh, south of Litchfield, are about 1,200 houses, and most are their owner's main home. This is where the island shops, a few minutes by car from Town Hall.`) +
      `<ul class="c3-pi-rules" aria-label="Behind the island">`
        + `<li><strong>The Hammock Shops</strong>On the highway near the North Causeway: more than 20 shops and two restaurants, Local and BisQit.</li>`
        + `<li><strong>Groceries</strong>Two grocery stores on the highway.</li>`
        + `<li><strong>Golf</strong>Pawleys Plantation has its own course.</li>`
        + `<li><strong>A bike path</strong>The Waccamaw Neck Bikeway runs north from here.</li>`
        + `</ul>` +
      `<aside class="c3-pi-note"><strong>The Pawleys Island hammock</strong>The Hammock Shops take their name from the Original Hammock Shop, which has made them since 1938. They say a riverboat captain who carried rice between Georgetown and Waverly Mills made the first one in 1889, to sleep cooler on summer nights. It was woven of cotton rope, with no thick knots where he lay. The shops still sell handmade hammocks.</aside>` +
      h.p(`A house in a community with a homeowners association comes with the association's rules on rentals and changes, and we read its papers for you.`) +
      h.p(`A house here sold for about $675,000 at the middle in the past year. About a third of the houses are in a high-risk flood zone.`) +
      ask("Pawleys Island", "Get the homes for sale behind Pawleys Island") +

      place("west-of-17", "West of US 17", "Most of the homes, most of the golf, the lowest prices") +
      h.p(`West of US 17 are most of the homes with a Pawleys Island address: about 4,800 houses, and most are their owner's main home. Most of ${h.a("/buyers/golf-communities/", "the area's golf courses")} are here. We count nine on the map, among them Caledonia, True Blue, Heritage and Litchfield Country Club.`) +
      h.p(`The grocery store nearest the island is on this side of the highway, less than 5 minutes by car from Town Hall. Only about 1 in 20 houses here is in a high-risk flood zone.`) +
      h.p(`A house here sold for about $580,000 at the middle in the past year, and a condo for about $320,000.`) +
      ask("Pawleys Island", "Get the homes for sale west of US 17 in Pawleys Island") },

    { h2: "What is it like to live on Pawleys Island all year?", toc: "Living there all year", id: "living", html: () =>
      side(MARSH) +
      h.p(`Winter on the island is quiet. On Census Day, in April, most of the island's homes were seasonal or vacation homes. The town's lodging tax shows when guests come: in 2024, almost 6 in 10 of its dollars came in from July to September, and about 2 in 100 from January to March.`) +
      h.p(`Winter days are mild.`) +
      `<ul class="c3-pi-stats" aria-label="A January day"><li><b>About ${JAN_HI}°</b><span>January's normal high</span></li><li><b>About ${JAN_LO}°</b><span>January's normal low</span></li></ul>` +
      h.p(`Those are NOAA's normals at its weather station at Brookgreen Gardens, about 6 miles north. From October through April, dogs may run on the beach off the leash, if the owner carries one and the dog comes when called. Winter is also outside hurricane season, which runs from June 1 to November 30.`) +
      h.p(`That makes winter the easiest time for work on a house: rentals are fewest and the storm season is over.`) +
      h.p(`Behind the island and west of the highway, about 3 in 4 houses or more are their owner's main home. On the island about 1 in 5 is.`) +
      LEGAL_CHART +
      h.h3("A South Carolina beach") +
      h.p(`The tax bills for most island houses go to South Carolina addresses: about a quarter to Pawleys Island itself, and many to Columbia, Greenville and Charleston. About 3 in 10 go out of state.`) +
      BILL_CHART +
      h.h3("How far is everything?") +
      h.p(`Drive times by car from Town Hall on the island, without traffic. Summer traffic on US 17 adds time.`) +
      h.table(["From Town Hall to", "By car, about"], [
        ["The nearest grocery store, on US 17", "Under 5 min"],
        ["The Hammock Shops, on US 17", "3 min"],
        ["Huntington Beach State Park", `${D.hbsp} min`],
        ["Tidelands Waccamaw Community Hospital", `${D.hospital} min`],
        ["Brookgreen Gardens", `${D.brookgreen} min`],
        ["Downtown Georgetown", `${D.georgetown} min`],
        ["Myrtle Beach International Airport", `${D.airport} min`],
        ["Broadway at the Beach, Myrtle Beach", `${D.broadway} min`],
        ["Downtown Charleston", "1 hr 45 min"],
      ]) +
      h.p(`Schools are assigned by address in the Georgetown County School District, and we look up the assigned schools for any house you like. The town has its own police department.`) +
      h.h3("Where to eat") +
      h.p(`The town says island night life is dining out, long talks on screened porches, a mainland shop and a walk on the beach. On the map we count 20 restaurants from Litchfield south past the causeways, and 19 of them are within about 650 feet of US 17. Among them are the Pawleys Island Tavern, Frank's and Frank's Outback, and Local at the Hammock Shops.`) },

    { h2: "How often does a house on Pawleys Island come up for sale?", toc: "How often one sells", id: "how-often", html: (bg) =>
      h.p(`Rarely. In the past five years at least ${I.market_sale_last5y} of the island's 480 houses were bought at a market price, about 1 in 11. In Litchfield and west of the highway, houses were bought about twice as often.`) +
      TURNOVER_CHART +
      h.p(`Island houses tend to stay in families. On most of them, the last recorded transfer was not a sale. The deed shows under $1,000: the kind of deed used to pass a house to heirs or a trust, or to move it into a company.`) +
      FAMILY_CHART +
      h.p(`The town says many houses in its historic district belong to the third, fourth or fifth generation of one family. About 1 in 10 island houses has not changed hands at all since before 2000. The island is also built out: in seven years, only about a dozen new buildings went up.`) +
      h.p(`What it means for you: the house you want can come up once in years.`) +
      h.cta("Want a house on the island?", "Tell us the part of the island, the size and your budget. We watch the island and call you when a house like it comes up.", "Ask us to watch for a house on Pawleys Island", "/contact/", bg) },

    { h2: "Why do the old Pawleys Island houses look the way they do?", toc: "The old houses", id: "history", html: () =>
      h.p(`The old Pawleys Island houses were built as summer houses for rice planters' families, who came from May to November to escape the malaria of the rice fields. Enslaved people carried the households to the island each May, and enslaved workers built the older of the two causeways under a rice planter who became governor.`) +
      h.p(`Cypress was the building material used most often. It was hewn on the mainland, and each timber was cut with Roman numerals so the house could be put together on the island. Most of the old houses stand on high brick foundations, which keep them above ordinary storm tides and let air move under the floor.`) +
      maybe(OLD_HOUSE) +
      h.p(`The middle of the island is on the National Register of Historic Places as the Pawleys Island Historic District.`) +
      h.h3("The town's historic rules") +
      h.p(`In 2026 the whole island became a local historic district. A house built in 1954 or earlier can be put on the town's list of historic houses. The owner can nominate it, and so can a member of the town council or of the town's board, so a house can be nominated without its owner asking. The council decides.`) +
      h.p(`A listed house needs the board's approval for changes to its outside and to be torn down, and the board can delay a demolition for up to 180 days. The listing stays with the house when it sells. No building permit is issued while a nomination is pending. A house not on the list has none of these rules. We check whether a house you like is listed or nominated.`) },

    { h2: "What does a Pawleys Island house cost to own each year?", toc: "Yearly costs", id: "taxes", html: (bg) =>
      h.p(`The biggest yearly costs are property tax and insurance. Both depend most on whether the house is your main home.`) +
      h.h3("Property tax") +
      h.p(`As a second home or rental, a house pays about 3 times the property tax it pays as the home you live in. South Carolina taxes the home you live in on 4 percent of its value and any other house on 6 percent, and the tax rate on a second home is also about twice as high.`) +
      `<div class="c3-pi-tax">` + h.table(["Price", "Main home", "Second home"], [
        ["$580,000", r10(tax(580000, true, 96)), r10(tax(580000, false, 96))],
        ["$900,000", r10(tax(900000, true, 44)), r10(tax(900000, false, 44))],
        ["$2,450,000", r10(tax(2450000, true, 44)), r10(tax(2450000, false, 44))],
      ]) + `</div>` +
      h.p(`The tax a year, from Georgetown County's own estimate. $580,000 is the middle sale west of US 17, and $2,450,000 the island's. A second home here includes a rental.`) +
      h.p(`The estimate includes the fees on the bill. The fees are $44 a year on the island. West of the highway they are $96, for storm water and household fees together. The county taxes its own appraised value, which can differ from the price. The Town of Pawleys Island levies no property tax of its own, so an island house pays the same rates as the mainland around it.`) +
      h.h3("Flood insurance") +
      h.p(`A federal flood policy on an island house that is not its owner's main home cost more than 4 times what one on a mainland house in the same ZIP code cost. As a main home, the gap is much smaller. The town's flood work earns island owners a 25 percent discount on these policies, and the prices below already include it.`) +
      FLOOD_CHART +
      h.p(`Most island policies cover the building for $250,000, the most the federal program pays on a home. A house worth more needs private flood coverage on top. Wind and homeowners insurance come on top of that. Their prices depend on the house's height, age and roof, so we get quotes on the house before you offer.`) +
      h.h3("Worked example: the island's middle house as a second home") +
      h.p(`Take an island house at the middle price that you keep as a second home or rent out. Before the mortgage, and before wind and homeowners insurance, it costs about ${r100(YEARLY)} a year.`) +
      h.table(["Each year", "About"], [
        ["Property tax as a second home, with the $44 in fees", r100(ISLAND_SECOND_TAX)],
        ["A federal flood policy, the middle for an island house that is not a main home", r10(ISLAND_FLOOD_NOT_MAIN)],
        ["Together", r100(YEARLY)],
      ]) +
      h.cta("Get the yearly cost of the Pawleys house you like", "Send us the address. We work out its tax as a main home and a second home, and get its insurance quotes before you offer.", "Have us work out a house's yearly cost", "/contact/", bg) },

    { h2: "Can you rent out a house on Pawleys Island, and what do rentals take in?", toc: "Renting it out", id: "renting", html: () =>
      h.p(`Yes. Short-term rentals are allowed on Pawleys Island. Guests pay about 11 percent in lodging taxes on stays under 90 days. The town's share is filed with the town each month.`) +
      h.p(`The town's lodging tax receipts show what island rentals take in. In 2024, guests paid about $${RENT} million to stay on the island. Spread across the roughly ${Math.round(NOT_MAIN / 10) * 10} island houses that are not an owner's main home, that is about ${money(PER_HOUSE)} a house for the year, before the rental company's fee and other costs.`) +
      `<ul class="c3-pi-stats" aria-label="Island rentals in a year"><li><b>About $${RENT} million</b><span>Rent guests paid on the island in a year</span></li><li><b>About ${money(PER_HOUSE)}</b><span>A year, on average, per house that is not a main home</span></li></ul>` +
      h.p(`That is an average. Some houses are never rented, and some of the rent is paid on the island's condos and other rooms.`) +
      h.p(`On the mainland, a homeowners association can limit rentals in its own papers, and we read them for you. The rules town by town are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}. For a yearly tenant instead, see our ${h.a("/invest/long-term-rental/", "long-term rental guide")}. If you are selling a rental elsewhere to buy here, a ${h.a("/invest/strategies/1031-exchange/", "1031 exchange")} can put off the tax on the sale.`) },

    { h2: "Does Pawleys Island flood, and how often do hurricanes come?", toc: "Flooding and storms", id: "flooding", html: (bg) =>
      h.p(`Every island house but one is in one of FEMA's high-risk flood zones. A lender making a mortgage on any of them will require flood insurance. The island's houses are split about evenly between two zones:`) +
      `<ul class="c3-pi-rules"><li><strong>About half: water and waves</strong>Rising water and storm waves are both expected here. FEMA calls it the VE zone.</li><li><strong>The other half: water</strong>Water rises in a big flood, but big waves are not expected. FEMA calls it the AE zone.</li></ul>` +
      h.p(`The south end is the most exposed. South of the South Causeway, more than 9 in 10 houses are in the VE zone. North of the North Causeway, fewer than 1 in 10 are.`) +
      h.p(`FEMA's flood height for island houses is 12 to 16 feet. It is measured from a fixed survey level, not from the ground, so it is not the depth of water at a house. The town requires the floor of a new house to sit 3 feet above that.`) +
      h.p(`On ordinary days, the town's flood problem is water on the roads at the highest tides of the year, the king tides. The town has adopted a drainage plan for the whole island to deal with it.`) +
      h.h3("Hurricanes") +
      h.p(`In the past 75 years, 44 storms have passed within 50 miles of the middle of the island, and 7 of them were hurricanes at their closest point. Ian passed about 5 miles away, and Matthew and Charley came closer still.`) +
      STORM_CHART +
      h.p(`Hurricane Hazel, in 1954, washed away most of the houses built on the south end after World War II. The older houses came through it, as they had come through many storms before.`) +
      h.cta("Get the flood zone and floor height of one Pawleys house", "Send us the address. We look up its flood zone, VE or AE, and how high its floor is above the flood height on FEMA's map.", "Have us check a house's flood zone", "/contact/", bg) },

    { h2: "Can you rebuild an oceanfront house on Pawleys Island?", toc: "Building on the ocean", id: "rebuild", html: () =>
      h.p(`Yes, within limits that matter most at the south end. The state draws two lines along the beach. The baseline follows the top of the front dune. The setback line runs 20 feet behind it, on the land side.`) +
      h.p(`On about 100 of the island's roughly 220 oceanfront houses, part of the house stands on the ocean side of the setback line. Most of them are at the south end. On Litchfield's oceanfront it is more than half of the houses.`) +
      SETBACK_MAP +
      h.p(`For a house past the setback line, state law allows:`) +
      `<ul class="c3-pi-rules one">`
        + `<li><strong>Repair</strong>A house damaged by a storm, but not destroyed, can be repaired.</li>`
        + `<li><strong>Rebuild</strong>A house a storm destroys can be rebuilt no larger past the setback line, no wider along the beach and no farther toward the ocean than before. It moves back from the ocean where possible, and never past the baseline.</li>`
        + `<li><strong>New house</strong>A new house built partly past the setback line can have at most 5,000 square feet of heated space.</li>`
        + `<li><strong>The town's own line</strong>The town draws its own line too, the Shore Protection Line, and it is usually stricter than the state's.</li>`
        + `</ul>` +
      h.p(`Before you offer on an oceanfront house, we get the survey and see where all three lines fall on the lot.`) +
      h.h3("What the town lets you build") +
      `<ul class="c3-pi-rules">`
        + `<li><strong>Height</strong>Up to 35 feet above the town's flood height for the lot, which is 3 feet above FEMA's.</li>`
        + `<li><strong>Size</strong>Heated floor area between 2,000 and 4,000 square feet, and no more than 40 percent of the lot.</li>`
        + `<li><strong>Paving</strong>Roofs and paved areas together no more than 40 percent of the lot. Driveways are gravel, shell or crushed stone, never paved.</li>`
        + `<li><strong>Approval</strong>A new house needs the town's Architectural Review Board. Taking down a protected tree needs a town permit.</li>`
        + `</ul>` +
      maybeSide(NORTH_END) +
      h.h3("The beach in front") +
      h.p(`The town rebuilt its beach with about 1.1 million cubic yards of new sand. The plan paid for it from three sources: the town's beach fund, which is its 3 percent lodging tax on rentals, a state grant and a bank loan.`) +
      h.p(`The south tip will change. Under a settlement with the Prince George community across the inlet, a new inlet is to be cut about 800 feet south of the south-end parking lot and kept inside a set zone. The town gets a right to sand for future beach work.`) },
  ],
  faqTitle: "Pawleys Island FAQ",
  faq: [
    { q: "What county is Pawleys Island in?", a: "Georgetown County, both the island and the mainland that shares its name. Its property taxes and its public schools are Georgetown County's." },
    { q: "Is Pawleys Island part of Myrtle Beach?", a: `No. The island is its own town, and the mainland around it is run by Georgetown County. Broadway at the Beach, in Myrtle Beach, is about 26 miles north by road.` },
    { q: "What is the ZIP code for Pawleys Island?", a: "29585. It covers the island and most of the mainland around it, from the beach to well west of US 17." },
    { q: "How many people live on Pawleys Island?", a: "The Census counted 130 people living in the town in 2020. Most island houses are second homes or rentals, so far more people stay in the summer." },
    { q: "Is Pawleys Island expensive?", a: "On the island, yes: over three years a house sold for about $2.45 million at the middle. On the mainland, a house sold for about $580,000 to $675,000 at the middle in the past year." },
    { q: "Can you drive a golf cart on Pawleys Island?", a: "Yes, on island roads. The cart needs a state registration and a town sticker, and the address on its registration must be within 2 miles of the town limits. The driver must be 16 or older with a license. No driving at night or in the rain." },
  ],
  sources: [
    { name: "Georgetown County GIS", href: GIS },
    { name: "county tax calculator", href: GTCALC },
    { name: "Census", href: CENSUS },
    { name: "OpenFEMA", href: NFIP },
    { name: "NOAA storm tracks", href: HURDAT },
    { name: "SC beachfront law", href: SC48 },
    { name: "SC property tax law", href: SC12 },
    { name: "SC lodging tax", href: SC1236 },
    { name: "SCDOR tax rates", href: ST575 },
    { name: "National Register", href: NRHP },
    { name: "the town", href: T("about-pawleys-island") },
    { name: "town budget", href: BUDGET },
    { name: "lodging tax", href: ATAX },
    { name: "passed ordinances", href: T("passed-ordinances") },
    { name: "inlet settlement", href: T("2025-legal-settlement-faqs") },
    { name: "state park", href: HBSP },
    { name: "Hammock Shops", href: "https://hammockshops.com/pages/history" },
    { name: "NOAA normals", href: "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals" },
    { name: "NHC", href: "https://www.nhc.noaa.gov/climo/" },
    { name: "dog rules", href: T("dogs-on-the-beach") },
    { name: "Brookgreen", href: "https://npgallery.nps.gov/AssetDetail/NRIS/84002045" },
    { name: "OpenStreetMap", href: OSM },
  ],
  sourcesNote: "Our counts: county parcels, footprints, flood zones and deeds; CCMLS listings in aggregate; places from OpenStreetMap. Drives without traffic.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "Pawleys Island real estate, Pawleys Island homes for sale, Pawleys Island beach houses, is Pawleys Island an island, Pawleys Island town limits, Litchfield Beach homes, Pawleys Island flood zone, Pawleys Island property tax, Pawleys Island short term rental, Pawleys Island setback line, Pawleys Island hurricane history, Pawleys Island historic district",
  about: "Pawleys Island, a town on a barrier island in Georgetown County, South Carolina, and the mainland area that shares its name",
});
