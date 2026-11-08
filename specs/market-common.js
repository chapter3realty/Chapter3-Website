/* /submarkets/myrtle-beach/market-common/ - The Market Common, Myrtle Beach: the town center on the old
 * Myrtle Beach Air Force Base and the neighborhoods around it. What it is, the kinds of homes and what each
 * costs, the HOA fee by kind, the yearly cost, flood zones, the airport noise line, what is in walking
 * distance, and how it compares with Carolina Forest and Surfside Beach.
 *
 * Batch 2026-11-n, Lane N (new page). Built like the approved town guide /submarkets/pawleys-island/ and
 * the sub-area page /submarkets/carolina-forest/the-farm/ (design: Blog-Brain batches/2026-11-a/
 * submarkets-pawleys-island/DESIGN.md and sell-fsbo/DESIGN.md): a two-line headline with the italic sub
 * line at about half the H1 size, the hero photo beside the headline on a wide screen, the answer first,
 * one block width of 720 px, cards only for the one choice (the kind of home), plain lists under thin
 * rules elsewhere, photos beside their paragraphs on screens 1,100 px and wider.
 * Facts: Blog-Brain batches/2026-11-n/submarkets-market-common/facts.md (VERIFIED rows, and CORRECTED rows
 * at the verifier's wording only; VERIFY.md; struck wording in submarkets-market-common-struck.json).
 * Demand: must-answer.md. Plan: PLAN.md. Not used: the A-10 decade (row 2), "bought" (row 3), "only" the
 * town center a short walk (row 24), the farmers market hours (row 22), the Food Lion street number
 * (row 25), Cresswind's age rule (not verified 3: the page says only Kolter's own words, row 39), Whole Foods (not verified 4).
 * Review round 1 (REVIEW-1.md): life at the town center first, the neighborhoods described one by one (rows 37 to 43,
 * VERIFIED-BY-FIXER), the history cut to two sentences and moved last, the price table folded into the neighborhood list.
 * Data: data/2026-11-n/submarkets-market-common/ (findings.json, listings-findings.json, noise-findings.json,
 * compare-flood.json, map-layers.geojson, map-noise.geojson, raw/routes.json, photos.json, images/images.json).
 * Every count, price, fee, distance and minute is read from those files and checked against its row.
 * Prices from Horry County deeds (resales, past year) and the CRM's active listings counted in aggregate
 * (CCMLS); no MLS sold data, no value for any address.
 * Pictures: our two maps on the USDA NAIP 2023 aerial (public domain; inline SVG from map-layers.geojson and
 * map-noise.geojson; images/naip.py, images/prep.py), Commons photos (CC BY-SA; images/records.py), the lake
 * photo already on the site (data/photos.json), until the photo partner's shots arrive (shot-list.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/market-common/";
const SLUG = "submarkets-market-common";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", SLUG);
const IMG_SRC = `/images/2026-11-n/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings-findings.json"), NZ = read("noise-findings.json"), CF = read("compare-flood.json");
const LAYERS = read("map-layers.geojson"), NOISE = read("map-noise.geojson"), ROUTES = read("raw/routes.json"), IMGS = read("images/images.json");
const MY_PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r100 = (v) => money(Math.round(v / 100) * 100);
const must = (ok, msg) => { if (!ok) throw new Error(`market-common.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const ST = F.stock, ALL = ST.all, SA = F.sales.all, TC = F.sales.town_center, BH = F.sales_by_hood;
/* Row 7 (CORRECTED wording): about 3,000 homes; about 570 in the town center district, about 500 on its own streets. */
must(ALL.homes === 2999 && ALL.by_kind.house === 2478 && ALL.by_kind.townhouse === 465 && ALL.by_kind.condo === 37 && ST.town_center.homes === 568, "row 7 changed");
const SB = F.stock_by_hood, TCS = "Town center streets (Market Common parcels R1 to R13)";
/* Row 8: the neighborhoods. */
must(SB[TCS].homes === 502 && SB[TCS].by_kind.townhouse === 237 && SB["Emmens Preserve"].homes === 732 && SB["Belle Harbor"].homes === 483 && SB["Cresswind"].homes === 400, "row 8 changed");
/* Row 9: 37 condos, all in High Market. */
must(SB["High Market (condos)"].homes === 37, "row 9 changed");
/* Row 10 (CORRECTED wording): taxed as a main home. */
must(ALL.pct_main_home === 80.8 && ST["kind/house"].pct_main_home === 85.8 && ST["kind/townhouse"].pct_main_home === 60.0 && ALL.pct_tax_bill_outside_sc === 11.8 && ST.town_center.pct_main_home === 63.7, "row 10 changed");
/* Row 11: resale prices, past year. */
const HOUSE = SA["house/resale"], TOWN = SA["townhouse/resale"], CONDO = SA["condo/resale"];
must(HOUSE.n === 124 && HOUSE.median === 525000 && HOUSE.p25 === 474900 && HOUSE.p75 === 567200 && TOWN.n === 39 && TOWN.median === 375000 && CONDO.median === 309900, "row 11 changed");
/* Row 12 (CORRECTED wording): 9 builder townhome sales in the town center, about $580,000; about $180,000 over a resale there. */
must(TC["townhouse/builder"].n === 9 && TC["townhouse/builder"].median === 580000 && TC["townhouse/resale"].median === 399900, "row 12 changed");
must(Math.round((TC["townhouse/builder"].median - TC["townhouse/resale"].median) / 10000) * 10000 === 180000, "row 12 gap changed");
/* Row 13: listings, in aggregate. */
const LG = L.groups;
must(LG["all/all"].n === 66 && LG["all/house"].n === 43 && LG["all/house"].median_ask === 529900 && Math.round(LG["all/house"].median_sqft) === 2188 && LG["all/townhouse"].n === 20 && LG["all/townhouse"].median_ask === 419950, "row 13 changed");
/* Row 14 (CORRECTED): HOA brackets. Houses: 35 of 43 at $150 or less. Town center townhomes: all over $300. */
const HB = LG["all/house"].fee_bracket_top, TB = LG["town_center/townhouse"].fee_bracket_top;
must(HB["100"] === 23 && HB["150"] === 12 && LG["all/house"].n === 43, "row 14 houses changed");
must(Object.keys(TB).every((k) => +k > 300) && Object.values(TB).reduce((a, b) => a + b, 0) === 16 && TB["450"] + TB["500"] + TB["600"] === 11, "row 14 townhomes changed");
/* Row 15: flood zones. */
must(ALL.fema_zones.AE === 62 && ALL.fema_zones["0.2 PCT ANNUAL CHANCE FLOOD HAZARD"] === 30 && SB["Cresswind"].fema_zones.AE === 38 && SB["Balmoral"].fema_zones.AE === 14 && SB[TCS].fema_zones.AE === 10, "row 15 changed");
/* Rows 17 and 19: the noise line and the runway. */
must(NZ.homes === 2999 && NZ.nearest_home_to_65db_line_m === 441 && NZ.by_part.center_pointe.nearest_m === 1472 && NZ.by_part.clemson_tract.nearest_m === 2846, "row 17 changed");
must(NZ.runway_centerline.nearest_home_m === 881 && NZ.runway_centerline.homes_within_one_mile === 568 && NZ.runway_centerline.homes_within_half_mile === 0, "row 19 changed");
const MI = (m) => m / 1609.344;
must(MI(441) > 0.25 && MI(441) < 0.3 && Math.round(MI(1472) * 10) / 10 === 0.9 && Math.round(MI(2846) * 10) / 10 === 1.8, "row 17 miles changed");
/* Row 24 (CORRECTED wording): walks to Valor Park from each neighborhood's middle. */
const WALK = ROUTES.walk_from_hood_to_valor;
must(WALK[TCS].minutes === 7.5 && WALK["Sweetgrass Square"].minutes === 13.0 && WALK["The Reserve at Market Common"].minutes === 20.1 && WALK["Emmens Preserve"].minutes === 34.7 && WALK["Belle Harbor"].minutes === 50.9, "row 24 changed");
/* Row 25: walks from Valor Park. */
const WV = ROUTES.walk_from_valor;
must(WV["Savannah's Playground"].minutes === 7.8 && WV["Crabtree Gymnasium"].minutes === 10.9 && WV["Horry-Georgetown Technical College, Grand Strand campus"].minutes === 17.7 && WV["Food Lion, 3800 South Kings Highway"].minutes === 24.5, "row 25 changed");
/* Rows 26 and 28: drives from Valor Park, no traffic. Under 15 minutes to the minute, longer to the nearest 5. */
const DV = ROUTES.drive_from_valor;
const mins = (k) => { const m = DV[k].minutes; return m < 15 ? Math.round(m) : Math.round(m / 5) * 5; };
const BEACH = "Beach access at 29th Avenue South (ocean end)";
must(mins(BEACH) === 5 && mins("Food Lion, 3800 South Kings Highway") === 5 && mins("Walmart Neighborhood Market, 3650 Walton Drive") === 6 && mins("Publix, 955 Wood Duck Drive") === 6
  && mins("South Strand Medical Center") === 7 && mins("Myrtle Beach International Airport terminal") === 9 && mins("Coastal Grand Mall") === 11
  && mins("Broadway at the Beach") === 15 && mins("Grand Strand Regional Medical Center") === 20 && Math.round(WV[BEACH].minutes / 5) * 5 === 45, "row 26 drives changed");
must(DV["Surfside Beach Pier"].minutes === 12.9 && DV["Carolina Forest Public Library"].minutes === 25.0, "row 28 changed");
/* Row 29: the comparison. Surfside houses: that page's own verified figure (Surfside ledger row 8: 106 at about $745,000). */
const CS = F.compare_sales, SURF_HOUSE = 745000;                                   // row 29, Surfside page's figure
must(CS.carolina_forest["house/resale"].median === 439750 && CS.carolina_forest["townhouse/resale"].median === 230000 && CS.surfside_beach["townhouse/resale"].median === 249750, "row 29 changed");
/* Row 36: houses in the high-risk flood zone. Surfside 30.7 percent (its findings). */
must(CF.pct_high_risk.house === 0.2 && CF.in_fema_high_risk.house === 13 && ST["kind/house"].in_fema_high_risk === 62 && ST["kind/house"].homes === 2478, "row 36 changed");
const SURF_FLOOD = 31;                                                              // row 36, Surfside findings 30.7
/* Rows 30 and 31 (CORRECTED wording): tax in the city, about $404 a year per $100,000 as a main home; $1,528 otherwise. */
const TAX_MAIN = 404, TAX_OTHER = 1527.6;
const houseTax = 525000 / 100000 * TAX_MAIN, townTax = 400000 / 100000 * TAX_MAIN;
must(Math.round(houseTax) === 2121 && Math.round(townTax) === 1616 && Math.round(TAX_OTHER / TAX_MAIN * 10) / 10 === 3.8, "rows 30 and 31 changed");
const HOUSE_YEAR_MAX = houseTax + 150 * 12, TOWN_YEAR = [townTax + 400 * 12, townTax + 500 * 12];
must(r100(HOUSE_YEAR_MAX) === "$3,900" && r100(TOWN_YEAR[0]) === "$6,400" && r100(TOWN_YEAR[1]) === "$7,600", "row 31 totals changed");
/* Fix round 1 rows (VERIFIED-BY-FIXER). Row 41: each neighborhood's typical house lot (hood-details.json, hood_details.py). */
const HD = read("hood-details.json"), LOT = HD.lot_acres_house_median;
const ac = (h) => (Math.round(LOT[h] * 100) / 100).toFixed(2);
must(ac("Emmens Preserve") === "0.15" && ac("Balmoral") === "0.21" && ac("Withers Preserve") === "0.19" && ac(TCS) === "0.08" && ac("The Reserve at Market Common") === "0.15"
  && ac("Cresswind") === "0.16" && ac("West Lake") === "0.15" && ac("Park Place") === "0.15" && ac("Belle Harbor") === "0.17", "row 41 changed");
/* Row 40: the amenity parcels read on the aerial. */
must(HD.amenity_parcels.length === 7 && Object.keys(HD.aerial_reading).join() === "Cresswind,Emmens Preserve,Belle Harbor,Balmoral,Park Place,The Reserve at Market Common", "row 40 changed");
/* Row 42: bedrooms and size of the homes for sale (same pull as row 13). */
const HBEDS = LG["all/house"].beds, TBEDS = LG["all/townhouse"].beds;
must(HBEDS["3"] + HBEDS["4"] === 36 && TBEDS["2"] + TBEDS["3"] === 20 && Math.round(LG["all/townhouse"].median_sqft) === 1713 && LG["all/condo"].n === 2 && LG["all/land"].n === 1, "row 42 changed");
/* Row 13: the day the listings were counted, from the data file (never typed). */
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Rows 35 and 8: neighborhood prices and counts used in the neighborhood list. */
must(BH["Emmens Preserve"]["house/resale"].median === 440000 && BH["Belle Harbor"]["house/resale"].n === 18 && BH.Cresswind["house/resale"].median === 537500 && BH["Withers Preserve"]["house/resale"].median === 521500
  && BH["Park Place"]["house/resale"].median === 525000 && BH["The Reserve at Market Common"]["house/resale"].median === 521000 && BH["West Lake"]["house/resale"].n === 6 && TC["house/resale"].median === 571500 && r5k(TC["house/resale"].median) === "$570,000", "row 35 neighborhood prices changed");
must(SB["Emmens Preserve"].by_kind.house === 608 && SB["Emmens Preserve"].by_kind.townhouse === 122 && SB["Belle Harbor"].by_kind.townhouse === 106 && SB["Belle Harbor"].by_kind.code100 === 13
  && SB[TCS].by_kind.house === 265 && SB["Sweetgrass Square"].homes === 66, "row 8 kinds changed");
/* Row 15: all 62 high-risk homes are houses; the comparison uses houses. */
must(ST["kind/house"].in_fema_high_risk === ALL.fema_zones.AE && CF.homes_with_address_point.house === 7920 && CF.in_fema_high_risk.house === 13, "row 15 and 36 houses changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const INK = "#8a5226";
const CSS = `<style>
main#main h2{text-wrap:balance}
/* The headline: the italic sub line at about half the H1's size, on its own line. */
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
main#main .mc-fig{margin:1.4rem 0 1.6rem;max-width:720px}
main#main .mc-fig.narrow{max-width:560px}
@media (min-width:760px){main#main .mc-fig.narrow{margin-left:80px}}
/* The header phone number at 980 to 1099 px (as /submarkets/pawleys-island/). */
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .mc-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}
main#main .mc-frame{border-radius:14px;overflow:hidden;background:#3b5a3c}
main#main .mc-frame svg{display:block;width:100%;height:auto}
main#main svg.mc-map .lb{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#fff;paint-order:stroke;stroke:rgba(20,28,34,.88);stroke-linejoin:round}
main#main svg.mc-map .lb.it{font-style:italic;font-weight:600}
main#main svg.mc-map .lb.hl{fill:#ffe7c2}
main#main svg.mc-area-m .lb{font-size:50px;stroke-width:10px}main#main svg.mc-area-m .lb.big{font-size:58px}
main#main svg.mc-area-d .lb{font-size:36px;stroke-width:8px}main#main svg.mc-area-d .lb.big{font-size:44px}
main#main svg.mc-area-d{display:none}
@media (min-width:700px){main#main svg.mc-area-m{display:none}main#main svg.mc-area-d{display:block}}
main#main svg.mc-noise .lb{font-size:60px;stroke-width:12px}
@media (min-width:700px){main#main svg.mc-noise .lb{font-size:40px;stroke-width:8px}}
main#main .mc-legend{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.35rem;font-size:.98rem;color:var(--muted);line-height:1.4}
main#main .mc-legend li{display:flex;gap:.6rem;align-items:center;margin:0}
main#main .mc-legend i{flex:none;display:inline-block;width:1.6rem;height:.9rem;border-radius:3px}
/* Short facts: a plain list under thin rules, not cards. */
main#main .mc-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
@media (min-width:700px){main#main .mc-rules:not(.one){grid-template-columns:1fr 1fr}}
main#main .mc-rules.one{max-width:665px}
main#main .mc-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .mc-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
/* Cards, only for the one choice on the page: the kind of home. */
main#main .mc-cards{list-style:none;margin:1.2rem 0 1.5rem;padding:0;display:grid;gap:.75rem;max-width:720px}
main#main .mc-cards>li{text-align:left!important;align-items:flex-start!important}
@media (min-width:760px){main#main .mc-cards>li{padding:1rem 1.3rem .3rem!important}}
main#main .mc-cards>li{margin:0;padding:1rem 1.1rem .4rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55;display:flex;flex-direction:column}
main#main .mc-cards .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin-bottom:.3rem}
main#main .mc-cards b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.4rem}
main#main .mc-cards p{margin:0 0 .5rem;font-size:1rem}
main#main .mc-cards .c3-offer{margin-top:auto!important}
/* One block width: charts, tables, maps, lists and offers are 720 px. */
main#main .c3-gchart,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .mc-cost tr:last-child td{font-weight:700;color:var(--navy)}
@media (max-width:480px){main#main .mc-cost th,main#main .mc-cost td{padding:.5rem .4rem!important}}
main#main .mc-cmp-m{display:none}
@media (max-width:699px){main#main .mc-cmp{display:none}main#main .mc-cmp-m{display:grid}}
main#main .mc-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
/* The contents list: no card, plain columns between two thin rules. */
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
/* Photos and maps sit on the page: no card around the picture, the caption under it. */
main#main figure:not(.c3-gchart){background:none!important;border:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:0!important;border-radius:0!important}
main#main figure:not(.c3-gchart)>figcaption,main#main figure.c3ph-hero figcaption{padding:.6rem 0 0!important;margin-top:0!important;color:var(--muted);font-size:.92rem;line-height:1.5}
main#main figure .c3ph-f{border-radius:14px!important;box-shadow:none!important}
/* A wide screen: the photos inside the text sit beside their paragraphs. */
@media (min-width:1100px){
main#main>section>.wrap:has(.mc-side){display:flow-root}
main#main figure.mc-side{float:right;clear:right;width:380px;max-width:380px!important;margin:.35rem 0 1.6rem 2rem!important}
}
/* The hero: the town center photo beside the tiles, byline and sub on a wide screen; after the sub on a narrower one. */
main#main .detail-hero .detail-media{display:contents}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
main#main .detail-hero figure.mc-hero{margin:.4rem 0 0!important;max-width:640px}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
@media (max-width:1099px){main#main .detail-hero .wrap{display:flex;flex-direction:column}main#main .detail-hero figure.mc-hero{order:9}}
@media (min-width:700px) and (max-width:1099px){main#main .detail-hero figure.mc-hero{max-width:440px}}
@media (min-width:1100px){
main#main .detail-hero .wrap{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:repeat(6,auto) 1fr;column-gap:3rem}
main#main .detail-hero .wrap>*,main#main .detail-hero .c3-glance{grid-column:1}
main#main .detail-hero .breadcrumb,main#main .detail-hero .eyebrow,main#main .detail-hero .detail-h1{grid-column:1/-1}
main#main .detail-hero figure.mc-hero{grid-column:2;grid-row:4/8;align-self:start;margin:0!important;width:380px}
}
/* The end band (as /submarkets/pawleys-island/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* Web Mercator placement, shared by the two maps.                                */

const RM = 6378137, mx = (lo) => RM * lo * Math.PI / 180, my = (la) => RM * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
const f1 = (v) => Math.round(v * 10) / 10;
const placer = (bbox, W, H) => (lo, la) => [(mx(lo) - mx(bbox[0])) / (mx(bbox[2]) - mx(bbox[0])) * W, (my(bbox[3]) - my(la)) / (my(bbox[3]) - my(bbox[1])) * H];
const rings = (g) => g.type === "Polygon" ? [g.coordinates[0]] : g.type === "MultiPolygon" ? g.coordinates.map((p) => p[0]) : [];
const feat = (layer, name) => LAYERS.features.filter((f) => f.properties.layer === layer && (!name || f.properties.name === name));
const RUNWAY = [[-78.931514, 33.692522], [-78.925131, 33.666958]];                    // layout plan runway ends 18 and 36 (row 17)
const VALOR = ROUTES.valor_park, BEACH_PT = WV[BEACH].url.split(";")[1].split("?")[0].split(",").map(Number);

/* ---------------------------------------------------------------------------- */
/* Map 1: the neighborhoods, on the USDA NAIP aerial (public domain). Named on the map; no key.     */
/* A phone gets the same map cut to the neighborhoods, with bigger names and fewer of them.         */

const AREA_MAP = (() => {
  const A = IMGS.area, [W, H] = A.frame_px, P = placer(A.bbox_wgs84, W, H);
  const d = (coords) => "M" + coords.map((c) => P(c[0], c[1]).map(f1).join(" ")).join("L") + "Z";
  /* High Market's outline in map-layers.geojson sits west of the ball fields, but its 37 condo parcels are south of Valor Park
     (county layer 24, legal "HIGH MARKET HPR", near 78.9399 W, 33.662 N; ledger row 9 note): it is left off (NEEDS.md). */
  const hoods = feat("hood").filter((f) => f.properties.name !== "High Market (condos)").map((f) => rings(f.geometry).map(d).join("")).join("");
  const tc = feat("district", "town_center").map((f) => rings(f.geometry).map(d).join("")).join("");
  const [vx, vy] = P(...VALOR), [bx, by] = P(...BEACH_PT);
  const lab = (text, x, y, o = {}) => `<text class="lb${o.cls ? " " + o.cls : ""}" x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${text}</text>`;
  const two = (a, b, x, y, lh, o) => lab(a, x, y, o) + lab(b, x, y + lh, o);
  const svg = (phone) => {
    const vb = phone ? [280, 330, 1240, 760] : [0, 0, W, H];
    const lh = phone ? 52 : 38;
    const names = phone
      ? lab("Cresswind", 765, 410) + two("Emmens", "Preserve", 560, 640, lh) + lab("Balmoral", 790, 712) + two("Withers", "Preserve", 690, 830, lh)
        + lab("Park Place", 880, 975) + lab("West Lake", 610, 1012) + lab("Belle Harbor", 322, 1050, { anchor: "start" }) + lab("The Reserve", 900, 530)
        + two("Sweetgrass", "Square", 1170, 950, lh)
      : lab("Cresswind", 765, 405) + two("Emmens", "Preserve", 560, 645, lh) + lab("Balmoral", 790, 712) + two("Withers", "Preserve", 690, 830, lh)
        + lab("Park Place", 870, 930) + lab("West Lake", 690, 972) + lab("Belle Harbor", 330, 905) + lab("The Reserve", 900, 525)
        + two("Sweetgrass", "Square", 1214, 950, lh)
        + lab("US 17 Bypass", 268, 700, { rot: -63 }) + lab("Atlantic Ocean", 1840, 1215, { cls: "it", rot: -42 });
    return `<svg class="mc-map ${phone ? "mc-area-m" : "mc-area-d"}" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(" ")}" role="img" aria-labelledby="mc-area-t-${phone ? "m" : "d"}">`
      + `<title id="mc-area-t-${phone ? "m" : "d"}">Aerial map of The Market Common in Myrtle Beach. The town center, with its lake, Valor Park and rows of townhomes, sits just west of the airport's runway. The larger neighborhoods spread to the west and north-west: Cresswind, The Reserve, Emmens Preserve, Balmoral, Withers Preserve, Park Place, West Lake and Belle Harbor, out to the US 17 Bypass. The beach is to the east, past US 17 Business.</title>`
      + `<image href="${IMG_SRC}/${A.file}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`
      + `<path d="${hoods}" fill="#fff" fill-opacity=".12" stroke="#fff" stroke-width="${phone ? 5 : 4}" stroke-linejoin="round"/>`
      + `<path d="${tc}" fill="#ffe7c2" fill-opacity=".22" stroke="#1c2028" stroke-opacity=".6" stroke-width="${phone ? 13 : 11}"/><path d="${tc}" fill="none" stroke="#ffe7c2" stroke-width="${phone ? 7 : 6}" stroke-dasharray="22 11"/>`
      + `<circle cx="${f1(vx)}" cy="${f1(vy)}" r="${phone ? 14 : 11}" fill="#c4783a" stroke="#fff" stroke-width="5"/>`
      + names
      + lab("Town center", 1165, 640, { cls: "hl big" })
      + lab("Valor Park", vx + 26, vy + 14, { anchor: "start", cls: "hl" })
      + lab("Airport runway", 1415, phone ? 440 : 300, { anchor: "end" })
      + (phone
        ? `<path d="M1420 1040 L1500 1040" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M1478 1016 L1508 1040 L1478 1064" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>` + lab("Beach", 1408, 1056, { anchor: "end" })
        : `<circle cx="${f1(bx)}" cy="${f1(by)}" r="11" fill="#fff" stroke="#1c2028" stroke-width="5"/>` + lab("Beach access", bx - 22, by - 22, { anchor: "end" }))
      + `</svg>`;
  };
  return `<figure class="mc-fig"><div class="mc-frame">${svg(true)}${svg(false)}</div><figcaption>The white outlines are the neighborhoods, and the dashed line is the town center district. The dot is Valor Park, where the walk and drive times on this page start. Aerial: USDA NAIP via The National Map (USGS), public domain. Outlines: Horry County parcels and City of Myrtle Beach zoning. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Map 2: the airport's 65-decibel line beside the town center (rows 17 to 20).   */

const NOISE_MAP = (() => {
  const A = IMGS.noise, [W, H] = A.frame_px, P = placer(A.bbox_wgs84, W, H);
  const d = (coords) => "M" + coords.map((c) => P(c[0], c[1]).map(f1).join(" ")).join("L") + "Z";
  const band = NOISE.features.map((f) => rings(f.geometry).map(d).join("")).join("");
  const tc = feat("district", "town_center").map((f) => rings(f.geometry).map(d).join("")).join("");
  const hoods = feat("hood").map((f) => rings(f.geometry).map(d).join("")).join("");
  /* The gap: from the nearest home (row 17 verifier note: 33.66524 N, 78.93442 W) to the nearest point on the band's edge. */
  const [hx, hy] = P(-78.93442, 33.66524);
  let best = [Infinity, 0, 0];
  for (const f of NOISE.features) for (const r of rings(f.geometry)) {
    const pts = r.map((c) => P(c[0], c[1]));
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], dx = bx - ax, dy = by - ay;
      const t = Math.max(0, Math.min(1, ((hx - ax) * dx + (hy - ay) * dy) / (dx * dx + dy * dy)));
      const x = ax + t * dx, y = ay + t * dy, dd = Math.hypot(x - hx, y - hy);
      if (dd < best[0]) best = [dd, x, y];
    }
  }
  /* Ground metres per frame pixel at this latitude, to check the drawn gap against the measured 441 m. */
  const mpp = (mx(A.bbox_wgs84[2]) - mx(A.bbox_wgs84[0])) / W * Math.cos(33.665 * Math.PI / 180);
  must(Math.abs(best[0] * mpp - NZ.nearest_home_to_65db_line_m) < 60, `the drawn gap (${Math.round(best[0] * mpp)} m) does not match row 17`);
  const [, ex, ey] = best;
  const [r1x, r1y] = P(...RUNWAY[0]), [r2x, r2y] = P(...RUNWAY[1]);
  const lab = (text, x, y, o = {}) => `<text class="lb${o.cls ? " " + o.cls : ""}" x="${f1(x)}" y="${f1(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x)} ${f1(y)})"` : ""}>${text}</text>`;
  const svg = `<svg class="mc-map mc-noise" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="mc-noise-t">`
    + `<title id="mc-noise-t">Aerial map of the town center of The Market Common and the airport next to it. A shaded band marks where the airport's yearly average airplane noise reaches 65 decibels or more. It runs along the runway and out past its south end toward the beach. The town center's homes sit to the south-west of the band, about a quarter mile from it at the closest point.</title>`
    + `<image href="${IMG_SRC}/${A.file}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`
    + `<path d="${hoods}" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="3"/>`
    + `<path d="${tc}" fill="#ffe7c2" fill-opacity=".2" stroke="#1c2028" stroke-opacity=".6" stroke-width="10"/><path d="${tc}" fill="none" stroke="#ffe7c2" stroke-width="5" stroke-dasharray="20 10"/>`
    + `<path d="${band}" fill="#e8782a" fill-opacity=".34" stroke="#1c2028" stroke-opacity=".55" stroke-width="10"/><path d="${band}" fill="none" stroke="#ffb35c" stroke-width="5"/>`
    + `<path d="M${f1(hx)} ${f1(hy)}L${f1(ex)} ${f1(ey)}" stroke="#1c2028" stroke-opacity=".6" stroke-width="12" stroke-linecap="round"/><path d="M${f1(hx)} ${f1(hy)}L${f1(ex)} ${f1(ey)}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`
    + lab("About ¼ mile", (hx + ex) / 2 + 10, (hy + ey) / 2 + 80, { anchor: "middle" })
    + lab("Town center", 470, 590, { cls: "hl" })
    + lab("Runway", r2x - 60, r2y - 330, { anchor: "end" })
    + lab("Atlantic Ocean", 1250, 1360, { cls: "it", rot: -42 })
    + `</svg>`;
  const legend = `<ul class="mc-legend"><li><i style="background:rgba(232,120,42,.55);border:2px solid #ffb35c"></i>Where planes are too loud for homes on the airport's map: a yearly average of 65 decibels or more</li>`
    + `<li><i style="background:rgba(255,231,194,.5);border:2px dashed #b9863f"></i>The town center district</li></ul>`;
  return `<figure class="mc-fig narrow"><div class="mc-frame">${svg}</div>${legend}<figcaption>The shaded area covers both the airport's map for today and its forecast for 2038. We traced it from the airport's drawing, so its edge is close but not exact. Aerial: USDA NAIP via The National Map (USGS), public domain. Noise lines: Myrtle Beach International Airport layout plan, sheet 14. Map: Chapter3 Realty.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Photos.                                                                        */

const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const side = (r, caption, alt) => lazy(PH.heroPhoto(r, { alt: alt || r.alt, caption: caption || r.caption, maxWidth: "720px", sizes: "(max-width: 700px) 100vw, (max-width: 1099px) 720px, 380px" })).replace('<figure class="c3ph-hero"', '<figure class="c3ph-hero mc-side"');
const mine = (fn) => MY_PHOTOS.find((x) => x.file.includes(`/${fn}-1200w`));
const HERO = mine("market-common-town-center-homes-over-shops"), WARBIRD = mine("market-common-warbird-park");
/* The lake: our own copy of the Commons file. The site's older record (data/photos.json, market-common-lake) points to files that are not in the site (NEEDS.md). */
const LAKE = mine("market-common-grand-park-lake");
must(HERO, "the hero photo record is missing");
const LAKE_CAPTION = "The lake in Grand Park, beside the town center's shops. It has a 1.1-mile path around it.";
const LAKE_ALT = "The lake and lawn at Grand Park in The Market Common in the evening";
/* Review round 1: the record's caption said the apartments in the photo are not for sale, on a page about homes to buy. The hero caption now says what the photo shows. */
const HERO_CAPTION = "A corner of the town center, with shops on the ground floor.";
const HERO_PHOTO = PH.heroPhoto(HERO, { alt: HERO.alt, caption: HERO_CAPTION, sizes: "(max-width: 1099px) 100vw, 380px" }).replace('<figure class="c3ph-hero"', '<figure class="c3ph-hero mc-hero"');
const SHOWN = [HERO, WARBIRD, LAKE].filter(Boolean);
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: p === LAKE ? "The lake in Grand Park" : p === HERO ? "A corner of the town center" : "Warbird Park" })));

/* ---------------------------------------------------------------------------- */
/* The kinds of home: the page's one set of cards (the reader chooses a kind).    */

const card = (k, title, text, offer) => `<li><span class="k">${k}</span><b>${title}</b><p>${text}</p>${offer}</li>`;
const KINDS = `<ul class="mc-cards" aria-label="The kinds of home in The Market Common">`
  + card("Most of the homes", "A house",
    `About 2,480 houses. A typical one for sale has 3 or 4 bedrooms and about ${n(Math.round(LG["all/house"].median_sqft / 10) * 10)} square feet. A house here resold for about ${r5k(HOUSE.median)}, the middle price, and most list an HOA fee of $150 a month or less.`,
    G.offer("Market Common", { label: "Have us find Market Common houses" }))
  + card("About 1 in 6 homes", "A townhome",
    `About 465. A townhome shares its side walls with the next one, and a typical one for sale has 2 or 3 bedrooms. About half are on the town center's own streets, where one resold for about ${r5k(TC["townhouse/resale"].median)} and each one for sale lists an HOA fee over $300 a month.`,
    G.offer("Market Common", { label: "Have us find Market Common townhomes" }))
  + card("Rare here", "A condo",
    `Only 37 in the whole area, all in one group called High Market, south of Valor Park. A condo there resold for about ${r5k(CONDO.median)}. The apartments above the shops are rented by the year, not sold.`,
    G.offer("Market Common", { label: "Ask about Market Common condos" }))
  + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* The neighborhoods (rows 8, 35, 39 to 41): a plain list under thin rules.       */

const about10 = (v) => n(Math.round(v / 10) * 10);
const hoodItem = (name, text) => `<li><strong>${name}</strong>${text}</li>`;
const HOODS = `<ul class="mc-rules one" aria-label="The neighborhoods of The Market Common">`
  + hoodItem("The town center's own streets", `About ${about10(SB[TCS].homes)} homes, about half townhomes and half houses, on small lots: a house lot is about ${ac(TCS)} acre. The shops and the lake are about an 8-minute walk. A house resold for about ${r5k(TC["house/resale"].median)} and a townhome for about ${r5k(TC["townhouse/resale"].median)}. The builder sold 9 new townhomes here in the past year.`)
  + hoodItem("Emmens Preserve", `The largest, with about ${about10(SB["Emmens Preserve"].homes)} homes: about ${about10(SB["Emmens Preserve"].by_kind.house)} houses and ${about10(SB["Emmens Preserve"].by_kind.townhouse)} townhomes. A house lot is about ${ac("Emmens Preserve")} acre. Its pool and pool house sit beside a lake, and it has a park with a pavilion. A house resold for about ${r5k(BH["Emmens Preserve"]["house/resale"].median)}, the lowest of the neighborhoods, and a townhome for about ${r5k(BH["Emmens Preserve"]["townhouse/resale"].median)}.`)
  + hoodItem("Belle Harbor", `About ${about10(SB["Belle Harbor"].homes)} homes at the west end, by the US 17 Bypass, most of them houses, on house lots of about ${ac("Belle Harbor")} acre. Its amenity area has a pool, a small clubhouse and a sports court. A house resold for about ${r5k(BH["Belle Harbor"]["house/resale"].median)}.`)
  + hoodItem("Cresswind", `400 houses on lots of about ${ac("Cresswind")} acre. Kolter Homes started it in late 2012 as what it called an active adult community, aimed at older buyers. Kolter's plans gave its clubhouse a fitness center, and the clubhouse has a pool, tennis and pickleball courts and a lake path beside it. A house resold for about ${r5k(BH.Cresswind["house/resale"].median)}.`)
  + hoodItem("Withers Preserve", `About ${about10(SB["Withers Preserve"].homes)} houses in three sections, Highlands, Estates and Sanctuary, on lots of about ${ac("Withers Preserve")} acre. A house there resold for about ${r5k(BH["Withers Preserve"]["house/resale"].median)}.`)
  + hoodItem("Park Place", `About ${about10(SB["Park Place"].homes)} houses on lots of about ${ac("Park Place")} acre, with a pool and pool house. A house resold for about ${r5k(BH["Park Place"]["house/resale"].median)}.`)
  + hoodItem("West Lake", `About ${about10(SB["West Lake"].homes)} houses on lots of about ${ac("West Lake")} acre. Only ${BH["West Lake"]["house/resale"].n} resold in the past year, too few for a fair middle price.`)
  + hoodItem("Balmoral", `About ${about10(SB.Balmoral.homes)} houses on the largest lots here, about ${ac("Balmoral")} acre, with a pool and pool house. A house resold for about ${r5k(BH.Balmoral["house/resale"].median)}, the highest of the neighborhoods.`)
  + hoodItem("The Reserve", `About ${about10(SB["The Reserve at Market Common"].homes)} houses on lots of about ${ac("The Reserve at Market Common")} acre, with a pool and pool house. A house resold for about ${r5k(BH["The Reserve at Market Common"]["house/resale"].median)}.`)
  + hoodItem("Sweetgrass Square", `${SB["Sweetgrass Square"].homes} houses inside the town center district, about a ${Math.round(WALK["Sweetgrass Square"].minutes)}-minute walk from Valor Park.`)
  + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* The walk chart (row 24, CORRECTED wording): minutes on foot to Valor Park.     */

const wmin = (m) => (m < 30 ? Math.round(m) : Math.round(m / 5) * 5);
const WALK_NAME = { [TCS]: "The town center's own streets", "The Reserve at Market Common": "The Reserve", "High Market (condos)": "High Market (condos)" };
const WALK_CHART = G.bars(Object.entries(WALK).sort((a, b) => a[1].minutes - b[1].minutes)
  .map(([k, v]) => ({ name: WALK_NAME[k] || k, value: v.minutes, valueText: `${wmin(v.minutes)} min` })),
  { caption: "Minutes on foot to Valor Park, from the middle of each neighborhood", nameLabel: "Neighborhood", valueLabel: "On foot", compact: true, max: 55,
    note: "Walking routes on OpenStreetMap streets and paths. The homes nearest the town center in each neighborhood are closer than its middle." });

/* ---------------------------------------------------------------------------- */
/* The comparison (rows 28, 29, 36): a table on a wide screen, three plain blocks on a phone.        */

const MC_FLOOD = Math.round(ST["kind/house"].in_fema_high_risk / ST["kind/house"].homes * 1000) / 10;
must(MC_FLOOD === 2.5, "row 36 Market Common share changed");
const CMP = [
  { name: "The Market Common", house: r5k(HOUSE.median), town: r5k(TOWN.median), flood: `${ST["kind/house"].in_fema_high_risk} of about ${n(Math.round(ST["kind/house"].homes / 10) * 10)} (${MC_FLOOD}%)`, drive: "Starting point" },
  { name: "Carolina Forest", house: r5k(CS.carolina_forest["house/resale"].median), town: r5k(CS.carolina_forest["townhouse/resale"].median), flood: `${CF.in_fema_high_risk.house} of about ${n(CF.homes_with_address_point.house)} (${CF.pct_high_risk.house}%)`, drive: `About ${mins("Carolina Forest Public Library")} min, to its public library` },
  { name: "Surfside Beach", house: r5k(SURF_HOUSE), town: r5k(CS.surfside_beach["townhouse/resale"].median), flood: `About ${SURF_FLOOD}%`, drive: "About 13 to 14 min, to its pier" },
];
const COMPARE = `<div class="mc-cmp">` + h.table(["", ...CMP.map((c) => c.name)], [
    ["A house, the middle price", ...CMP.map((c) => c.house)],
    ["A townhome, the middle price", ...CMP.map((c) => c.town)],
    ["Houses in a high-risk flood zone", ...CMP.map((c) => c.flood)],
    ["By car from Valor Park, no traffic", ...CMP.map((c) => c.drive)],
  ]) + `</div>`
  + `<ul class="mc-rules one mc-cmp-m" aria-label="The three areas compared">` + CMP.map((c) => `<li><strong>${c.name}</strong>A house about ${c.house}. A townhome about ${c.town}. Houses in a high-risk flood zone: ${c.flood.replace("About ", "about ")}.${c.drive !== "Starting point" ? ` By car from Valor Park: ${c.drive.replace("About ", "about ")}.` : ""}</li>`).join("") + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const CITY = "https://cityofmyrtlebeach.com";
const SRC = {
  r729: `${CITY}/news_detail_T6_R729.php`, r400: `${CITY}/news_detail_T6_R400.php`,
  s1230: "https://www.scstatehouse.gov/sess117_2007-2008/bills/1230.htm",
  afcec: "https://www.afcec.af.mil/News/Article-Display/Article/2041781/brac-team-earns-us-epa-award-for-myrtle-beach-cleanup-redevelopment/",
  mc: "https://marketcommonmb.com/directory/", events: "https://marketcommonmb.com/events/", parks: "https://marketcommonmb.com/parks-playgrounds/",
  kolter: "https://web.archive.org/web/20130321052307/http://www.kolterhomes.com:80/blog/2012/11/kolter-homes-introduces-cresswind-myrtle-beach",
  naip: "https://www.usgs.gov/centers/eros/science/usgs-eros-archive-aerial-photography-national-agriculture-imagery-program-naip",
  pow: `${CITY}/i_want_to/find/photos_of_the_week/pow090420.php`, market: "https://waccamawmarkets.org/",
  access: "https://www.cityofmyrtlebeach.com/services/accessibility_information/",
  alp: "https://aeronautics.sc.gov/sites/default/files/2025-03/14-MYR-LDU-36x48.pdf",
  cfr: "https://www.govinfo.gov/content/pkg/CFR-2024-title14-vol3/pdf/CFR-2024-title14-vol3-part150-appA.pdf",
  usc: "https://www.law.cornell.edu/uscode/text/42/4012a",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  zoning: "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  sc12: "https://www.scstatehouse.gov/code/t12c037.php",
  osm: "https://www.openstreetmap.org/",
};

/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const CONTACT = `/contact/?place=${encodeURIComponent("The Market Common")}`;
const MAP_SEARCH = (type) => `/homes/map/?subdivision=${encodeURIComponent("Market Common")}${type ? `&amp;type=${type}` : ""}`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(HERO),
  title: "Market Common Homes in Myrtle Beach, on the Old Air Base",
  description: "Market Common homes in Myrtle Beach: the town center's shops and events, each neighborhood's homes and pools, prices, HOA fees, flood zones and airport noise.",
  ogTitle: "Market Common homes in Myrtle Beach: a town center on the old air base",
  crumb: "The Market Common",
  eyebrow: "The Market Common, Myrtle Beach",
  h1: "Market Common homes in Myrtle Beach:",
  h1em: "a town center on the old air base.",
  sub: "The Market Common: shops, a lake and a movie theater on the old air base, with about 3,000 homes in the neighborhoods around them.",
  heroMedia: CSS + glance([
    { icon: "shopping", label: "Places to eat and drink", text: "About 17" },
    { icon: "calendar", label: "Farmers market", text: "Saturdays" },
    { icon: "beach", label: "Beach by car, about", text: `${mins(BEACH)} min` },
    { icon: "flood", label: "High flood risk", text: `${ALL.fema_zones.AE} homes` },
  ]) + HERO_PHOTO,
  heroCta: { title: "Want the homes for sale here, sorted by neighborhood?", label: "Have us send the list", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `The Market Common is a town center on the old Myrtle Beach Air Force Base. It has about 17 places to eat and drink, shops, a movie theater and a lake. About 3,000 homes stand on its streets and in the neighborhoods around it. The beach is about ${mins(BEACH)} minutes away by car.`,
    `In the past year a typical house there resold for about ${r5k(HOUSE.median)}, and a townhome for about ${r5k(TOWN.median)}. Most houses list an HOA fee of $150 a month or less. Just ${ALL.fema_zones.AE} of about 3,000 homes are in FEMA's high-risk flood zone. You will hear planes, but no home is in the area the airport's map marks as too loud for homes.`,
  ],
  sections: [
    { h2: "What is it like to live in The Market Common?", toc: "Life here", id: "life", html: () =>
      h.p(`The town center has shops and restaurants along its streets, with a lake and two parks beside them. Its own directory lists about 17 places to eat and drink, among them P.F. Chang's, Tupelo Honey, Gordon Biersch, CO Sushi, Travinia and Dirty Don's Oyster Bar.`) +
      h.p(`It also has a movie theater, a Barnes & Noble, a bowling and billiards hall, a children's museum, a gym and a yoga studio. Shops include Anthropologie, Pottery Barn, Chico's and J.Jill.`) +
      (LAKE ? side(LAKE, LAKE_CAPTION, LAKE_ALT) : "") +
      h.p(`Grand Park, with its lake and the path around it, and Valor Park sit beside the shops. They have sports fields, picnic areas, fishing spots and Savannah's Playground, built for children of all abilities.`) +
      h.h3("A normal week at the town center") +
      h.p(`The town center's calendar has something on most days. In a normal week it lists:`) +
      `<ul class="mc-rules" aria-label="A normal week at the town center">`
        + `<li><strong>Mondays</strong>A mystery movie night at the theater.</li>`
        + `<li><strong>Tuesdays and Thursdays</strong>Free trivia nights at the bowling hall, and on Tuesdays at a restaurant too.</li>`
        + `<li><strong>Wednesdays and Saturdays</strong>Morning tours on electric bikes from the bike shop.</li>`
        + `<li><strong>Saturdays</strong>A farmers market at Valor Park, from April into December.</li>`
        + `<li><strong>Some evenings</strong>Live music at restaurants, such as jazz at Gio's and a band at Gordon Biersch each second Tuesday.</li>`
        + `<li><strong>Twice a year</strong>Art in the Park is held at Valor Park, in April and in November.</li>`
        + `</ul>` +
      h.h3("Which homes are a walk from the shops?") +
      h.p(`The homes on the town center's own streets are about an ${Math.round(WALK[TCS].minutes)}-minute walk from the shops, measured from the middle of those streets to Valor Park. From the middle of the larger neighborhoods it is a 20- to 35-minute walk, and about 50 minutes from Belle Harbor.`) +
      WALK_CHART +
      `<ul class="mc-rules" aria-label="Also near Valor Park">`
        + `<li><strong>A city gym and a college</strong>From Valor Park, the Crabtree Gymnasium is about ${Math.round(WV["Crabtree Gymnasium"].minutes)} minutes on foot, and Horry-Georgetown Technical College's Grand Strand campus about ${Math.round(WV["Horry-Georgetown Technical College, Grand Strand campus"].minutes)}.</li>`
        + `<li><strong>Groceries</strong>The Food Lion on South Kings Highway is about a ${Math.round(WV["Food Lion, 3800 South Kings Highway"].minutes)}-minute walk, just over a mile, or about ${mins("Food Lion, 3800 South Kings Highway")} minutes by car.</li>`
        + `</ul>` },

    { h2: "What are the neighborhoods in The Market Common like?", toc: "Neighborhoods", id: "homes", html: () =>
      h.p(`About 3,000 homes stand in The Market Common area: about 2,480 houses, 465 townhomes and 37 condos. About 570 are in the town center district, and the rest are in the neighborhoods to its west and north-west.`) +
      KINDS +
      h.p(`Most neighbors live here all year. About 4 in 5 homes are taxed as their owner's main home. On the town center's streets it is about 2 in 3, so more of those homes are second homes or rentals.`) +
      AREA_MAP +
      h.p(`Each neighborhood has its own streets and its own amenities. A lot of 0.15 acre is about 6,500 square feet. Prices are what a house resold for in the past year, the middle price.`) +
      HOODS +
      h.p(`Kolter Homes' word for Cresswind was "age targeted", which is not the same as limited by age. Its rules on who may buy or live there are not published online, so we read them for any Cresswind home you pick. Our ${h.a("/buyers/55-plus-communities/", "55-plus communities guide")} covers the area's age-restricted communities.`) +
      "" },

    { h2: "What do homes cost in The Market Common?", toc: "Prices", id: "prices", html: (bg) =>
      h.p(`In the past year a typical house in The Market Common resold for about ${r5k(HOUSE.median)}: half sold for less and half for more. The middle half sold between about ${r5k(HOUSE.p25)} and ${money(Math.round(HOUSE.p75 / 1000) * 1000)}. A condo resold for about ${r5k(CONDO.median)}.`) +
      h.p(`A townhome resold for about ${r5k(TOWN.median)} across the whole area. In the town center it was about ${r5k(TC["townhouse/resale"].median)}, and in Emmens Preserve about ${r5k(BH["Emmens Preserve"]["townhouse/resale"].median)}. The neighborhood list above gives each one's house price.`) +
      `<p class="mc-note">Resales recorded in Horry County deeds in the past year. A neighborhood's price is given when it had 10 or more sales.</p>` +
      h.p(`New homes cost more. The only builder sales in the past year were 9 townhomes on the town center's streets. They sold for about $580,000, about $180,000 more than a resale townhome on the same streets.`) +
      h.p(`On ${COUNT_DAY}, ${LG["all/all"].n} homes were for sale in the area: ${LG["all/house"].n} houses, ${LG["all/townhouse"].n} townhomes, ${LG["all/condo"].n} condos and ${LG["all/land"].n} lot.`) +
      `<ul class="mc-rules" aria-label="Homes for sale on the day we counted">`
        + `<li><strong>${LG["all/house"].n} houses</strong>Asking about ${r5k(LG["all/house"].median_ask)} at the middle. Most have 3 or 4 bedrooms and about ${n(Math.round(LG["all/house"].median_sqft / 10) * 10)} square feet.</li>`
        + `<li><strong>${LG["all/townhouse"].n} townhomes</strong>Asking about ${r5k(LG["all/townhouse"].median_ask)} at the middle. Each has 2 or 3 bedrooms, about ${n(Math.round(LG["all/townhouse"].median_sqft / 10) * 10)} square feet at the middle.</li>`
        + `</ul>` +
      G.homesCss() + G.homes("market-common-townhomes", "Market Common townhomes", "", "Townhomes for sale in The Market Common") +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) +
      h.cta("Get today's count of homes for sale", "We run this count again on the day you ask, sorted by neighborhood, and send each home with its HOA fee and flood zone.", "Have us run the count again", CONTACT, bg) },

    { h2: "What does a Market Common home cost to own each year?", toc: "Yearly cost", id: "yearly-cost", html: () =>
      h.p(`Besides the mortgage and ${h.a("/buyers/coastal-insurance/", "insurance")}, a typical house here that you live in costs up to about ${r100(HOUSE_YEAR_MAX)} a year in property tax and HOA fee. A town center townhome costs about ${r100(TOWN_YEAR[0])} to ${r100(TOWN_YEAR[1])} a year, mostly because its HOA fee is higher.`) +
      `<div class="mc-cost">` + h.table(["Each year", "House", "Town center townhome"], [
        ["Property tax", `About ${r100(houseTax)}`, `About ${r100(townTax)}`],
        ["HOA fee", "Up to $1,800", "$4,800 to $6,000"],
        ["Together", `Up to ${r100(HOUSE_YEAR_MAX)}`, `${r100(TOWN_YEAR[0])} to ${r100(TOWN_YEAR[1])}`],
      ]) + `</div>` +
      `<p class="mc-note">About, as your main home: a house bought for about ${r5k(HOUSE.median)} and a town center townhome bought for about ${r5k(TC["townhouse/resale"].median)}.</p>` +
      h.p(`The fees are what the homes for sale list: most houses $150 a month or less, and town center townhomes about $400 to $500. Before you offer, we get the HOA's budget for the home you pick, so you know what the fee covers.`) +
      h.p(`Inside the City of Myrtle Beach, a home you live in pays about $${TAX_MAIN} a year in property tax for every $100,000 of the county's value. A second home or rental pays about ${money(TAX_OTHER)}, about 3.8 times as much.`) +
      h.p(`When a home sells, its county value becomes about the price a buyer pays, so your tax starts from your price. The lower rate needs an application to the county. Our ${h.a("/buyers/property-taxes/", "property tax guide")} explains both rates.`) },

    { h2: "Is The Market Common in a flood zone?", toc: "Flood zones", id: "flood", html: (bg) =>
      h.p(`Almost none of it is. Only ${ALL.fema_zones.AE} of about 3,000 homes in The Market Common sit in FEMA's high-risk flood zone, all of them houses:`) +
      `<ul class="mc-rules one" aria-label="Homes in the high-risk flood zone">`
        + `<li><strong>Cresswind</strong>${SB.Cresswind.fema_zones.AE} houses.</li>`
        + `<li><strong>Balmoral</strong>${SB.Balmoral.fema_zones.AE} houses.</li>`
        + `<li><strong>The town center</strong>${SB[TCS].fema_zones.AE} houses, on its own streets.</li>`
        + `</ul>` +
      h.p(`No other neighborhood has a home in the zone. At all ${ALL.fema_zones.AE}, a big flood can bring rising water, but not ocean waves. A mortgage from a federally backed or regulated lender on a home in that zone requires flood insurance.`) +
      h.p(`Another ${ALL.fema_zones["0.2 PCT ANNUAL CHANCE FLOOD HAZARD"]} homes are in the moderate zone, where a lender does not require flood insurance. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how we look into a home's flood history.`) +
      h.cta("Check one home before you offer", "Send us the listing. We check its flood zone, its HOA fee and its tax as a main home, and tell you what we find.", "Have us check a home", CONTACT, bg) },

    { h2: "How loud is the airport next to The Market Common?", toc: "Airport noise", id: "airport-noise", html: () =>
      h.p(`You will hear planes here, because the airport's runway runs along the town center's east side. Even so, no home in The Market Common is inside the area the airport's own map marks as too loud for homes. The FAA treats homes outside that area as suitable next to an airport, with no limits.`) +
      h.p(`We placed every home's lot on the airport's map, for today and for its forecast in 2038. The closest home is about a quarter mile outside the loud area, on the town center's east edge.`) +
      NOISE_MAP +
      h.p(`The loud area runs along the runway and out past both ends, where planes take off and land. A small loud spot also sits around a helicopter pad near US 17 Business, at the runway's south end, used for oceanfront helicopter flights.`) +
      h.p(`The airport's map uses a yearly average. A single takeoff is louder than the average, and planes are heard across the area.`) +
      `<ul class="mc-rules" aria-label="How far the homes are from the loud area">`
        + `<li><strong>The town center</strong>The closest part. Its nearest home is about a quarter mile from the loud area, and a little over half a mile from the runway's center line.</li>`
        + `<li><strong>The neighborhoods to the west</strong>The nearest home in them is about ${Math.round(MI(NZ.by_part.center_pointe.nearest_m) * 10) / 10} mile from the loud area. In Belle Harbor and the Sanctuary section of Withers Preserve, at the west end, the nearest is about ${Math.round(MI(NZ.by_part.clemson_tract.nearest_m) * 10) / 10} miles.</li>`
        + `</ul>` },

    { h2: "How far is The Market Common from the beach?", toc: "Beach and drives", id: "drives", html: (bg) =>
      h.p(`The beach is about ${mins(BEACH)} minutes by car with no traffic, at the city's beach access at 29th Avenue South, which is marked fully accessible. On foot it is about 45 minutes. Summer traffic on US 17 adds time to every drive.`) +
      h.table(["From Valor Park to", "By car, about"], [
        ["The beach access at 29th Avenue South", `${mins(BEACH)} min`],
        ["Walmart Neighborhood Market, Walton Drive", `${mins("Walmart Neighborhood Market, 3650 Walton Drive")} min`],
        ["Publix, Wood Duck Drive", `${mins("Publix, 955 Wood Duck Drive")} min`],
        ["South Strand Medical Center", `${mins("South Strand Medical Center")} min`],
        ["Myrtle Beach International Airport terminal", `${mins("Myrtle Beach International Airport terminal")} min`],
        ["Coastal Grand Mall", `${mins("Coastal Grand Mall")} min`],
        ["Broadway at the Beach", `${mins("Broadway at the Beach")} min`],
        ["Grand Strand Regional Medical Center", `${mins("Grand Strand Regional Medical Center")} min`],
      ]) +
      h.p(`The airport terminal is across the runway, so the drive is longer than the distance looks on the map.`) +
      h.cta("See it on a Saturday", "Tell us which neighborhoods you like. We line up showings, and you walk the town center between them.", "Have us set up showings", CONTACT, bg) },

    { h2: "How does The Market Common compare with Carolina Forest and Surfside Beach?", toc: "Compared", id: "compare", html: () =>
      h.p(`A Market Common house costs more than one in Carolina Forest and less than one in Surfside Beach. Its townhomes cost more than either. Its share of houses in a high-risk flood zone sits between the two.`) +
      COMPARE +
      `<p class="mc-note">Past year. The Market Common and Carolina Forest: resales in Horry County deeds; Carolina Forest is the Census area of that name. Surfside Beach houses: every house sale in the town, its own page's figure.</p>` +
      h.p(`Carolina Forest is a much larger inland area, with more than twice as many homes, about 25 minutes north by car. Our ${h.a("/submarkets/carolina-forest/", "Carolina Forest guide")} covers it in detail.`) +
      h.p(`Surfside Beach is a beach town about 13 to 14 minutes south, where about 3 in 10 houses are in a high-risk flood zone. Our ${h.a("/submarkets/surfside-beach/", "Surfside Beach guide")} covers its two sides of the highway.`) +
      h.p(`The Market Common is one part of Myrtle Beach. Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city's other parts and its rules on nightly rentals.`) },

    { h2: "What was The Market Common before?", toc: "Before", id: "before", html: () =>
      h.p(`The Market Common stands on the old Myrtle Beach Air Force Base, which closed in 1993. The town center opened on part of it in 2008.`) +
      h.p(`The Air Force has closed 229 cleanup sites on the old base since the 1990s. In 2019 it said 15 were still open, among them old landfills and groundwater sites. It said every site is being cleaned up to the standard for homes, and that no limit on the soil or groundwater rules out homes there.`) +
      (WARBIRD ? side(WARBIRD) : "") +
      h.p(`Three Air Force jets still stand in Warbird Park on Farrow Parkway: an F-100 Super Sabre, an A-7D Corsair and an A-10 Warthog. They are on permanent loan to the city from the Air Force.`) },
  ],
  faqTitle: "The Market Common FAQ",
  faq: [
    { q: "Is The Market Common part of Myrtle Beach?", a: "Yes. Every home in it is inside the City of Myrtle Beach, so the city's zoning and tax rate apply. Nearly every home has a Myrtle Beach mailing address in ZIP code 29577." },
    { q: "Can I rent out a Market Common home by the night?", a: "Only in the town center. The city's zones for rentals under 90 days include the town center's zoning district, but not the neighborhoods around it. Each HOA's rules also decide, and we read them for the home you pick." },
    { q: "Is Cresswind a 55-plus community?", a: "Kolter Homes built Cresswind as what it called an active adult community, aimed at older buyers. Its rules on who may buy or live there are not published online. We read them for any Cresswind home you are thinking about." },
    { q: "Can I buy one of the apartments over the shops?", a: "No. The apartments above the town center's shops are rented by the year. The area's 37 condos are in High Market, south of Valor Park." },
    { q: "Do the neighborhoods have pools?", a: "On the 2023 aerial photo, seven of them have one. Cresswind has a clubhouse with a pool and courts. Emmens Preserve, Belle Harbor, Balmoral, Park Place and The Reserve each have a pool with a pool house or small clubhouse. Withers Preserve has a pool with a pool house in its Sanctuary section." },
  ],
  sources: [
    { name: "air base", href: SRC.r729 },
    { name: "SC Senate", href: SRC.s1230 },
    { name: "cleanup", href: SRC.afcec },
    { name: "Warbird Park", href: SRC.r400 },
    { name: "directory", href: SRC.mc },
    { name: "events", href: SRC.events },
    { name: "parks", href: SRC.parks },
    { name: "lake path", href: SRC.pow },
    { name: "farmers market", href: SRC.market },
    { name: "Cresswind", href: SRC.kolter },
    { name: "NAIP aerial", href: SRC.naip },
    { name: "beach access", href: SRC.access },
    { name: "airport plan", href: SRC.alp },
    { name: "FAA rule", href: SRC.cfr },
    { name: "flood law", href: SRC.usc },
    { name: "county GIS", href: SRC.gis },
    { name: "zoning", href: SRC.zoning },
    { name: "tax levy", href: SRC.levy },
    { name: "SC tax law", href: SRC.sc12 },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, flood zones and deeds; amenities read on the 2023 aerial; CCMLS listings in aggregate; the airport's noise lines on county parcels; routes on OpenStreetMap.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: {
    h2: "Ready to look at The Market Common?",
    p: "Tell us the kind of home and your budget. We pick out the houses and townhomes that fit, each with its HOA fee and flood zone.",
    label: "Send us your wish list", href: CONTACT,
  },
  keywords: "Market Common homes for sale, Market Common Myrtle Beach real estate, Market Common townhomes, Market Common neighborhoods, Cresswind Market Common, Emmens Preserve, Market Common HOA fees, things to do at Market Common, is Market Common in a flood zone, Market Common airport noise",
  about: "The Market Common, a town center and its neighborhoods on the former Myrtle Beach Air Force Base, in Myrtle Beach, South Carolina",
});
