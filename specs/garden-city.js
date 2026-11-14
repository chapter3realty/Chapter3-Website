/* /submarkets/garden-city/ - Garden City, SC: where it is and which county, the five parts of it
 * (the ocean side, the marsh, the older streets, west of Business 17 and the Georgetown end), what
 * homes cost, whether you can rent nightly, how quiet it is in winter, the beach rules, flooding, and
 * the yearly cost of owning.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02. The live page was hand-made (an investor report);
 * this is its first spec, and it is now a place guide for a buyer first, with one section for renting.
 * Facts: Blog-Brain batches/2026-11-a/submarkets-garden-city/facts.md (VERIFIED rows, and CORRECTED
 * rows at the verifier's corrected values and wording only; VERIFY.md; struck wording in
 * submarkets-garden-city-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-a/submarkets-garden-city/ (findings.json, listings-findings.json,
 * nfip-findings.json, census-noaa.json, chart-str-months.json, chart-high-tide-days.json,
 * airroi.json, map-layers.geojson, strip.json, raw/drives.json). Every count, share, price, policy
 * cost, chart value and drive time is read from those files here and checked against its ledger row.
 * Corrected rows 2, 13, 14, 16, 18 and 26 are typed at the verifier's values, with the row number
 * beside each, because the data files hold the researcher's first figures.
 * Kept from the live page: the H1 (data/headlines.json, the owner liked it), the AirROI numbers (now
 * AirROI's fresh read, row 23; NEEDS.md 2), the "Compare all nine submarkets" link, the two sides of
 * the peninsula, the pier, the 4 and 6 percent rule, the county rules, and the internal links.
 * Not kept (judge 2026-10-31; PLAN.md): the invented "illustrative" occupancy chart, "days on market
 * near 162", "$238,825", "about 9,357", the financing section, the school stats, the template
 * sections, "Investor Hub", "southern tip in Georgetown".
 * Pictures: our map of the five parts on a USGS aerial (public domain; drawn here as inline SVG over
 * the photo, from map-layers.geojson), five labelled USDA NAIP aerial close-ups (public domain; records
 * in data/2026-11-a/submarkets-garden-city/photos.json; labels placed from coordinates by
 * data/2026-11-a/submarkets-garden-city/images/label_naip.py; map base by base.py there) until the photo partner's shots arrive (shot-list.md), and glass charts.
 * Fix round 1 (2026-11-02, REVIEW-1.md): each part opens with what it is like to live there and names
 * its buildings, neighborhoods and streets (fix1-names.json, county parcel legal descriptions and
 * address points); a "things to do" section (the pier's own site, the MarshWalk's site, SC State Parks)
 * and grocery drives (fix1-findings.json); each fact said once; the worked example ends on what is
 * left; the nearby-towns section is a table (2020 Census, fix1-findings.json); no price in the hero;
 * fewer numbers (owner rule PLAIN-2). New facts are rows 39 to 46 in facts.md, VERIFIED-BY-FIXER.
 * Round 4 (owner, 2026-11-08: "we need to be better salesmen way less complicated graphs ... using IDX to its fullest"):
 * each part has one verified scene (facts.md rows 49 to 53) and a homes strip (gc-<part>) with its old pill as the fallback;
 * the price chart is five rows with a title that states its point; the flood-policy chart is gone; the tide chart is shorter.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/garden-city/";
const SLUG = "submarkets-garden-city";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const IMG_SRC = `/images/2026-11-a/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings-findings.json"), NF = read("nfip-findings.json"), CN = read("census-noaa.json");
const MONTHS = read("chart-str-months.json"), AIR = read("airroi.json"), LAYERS = read("map-layers.geojson"), STRIP = read("strip.json");
const DRIVES = read("raw/drives.json"), PHOTOS = read("photos.json").photos;
const FIX = read("fix1-findings.json"), NAMES = read("fix1-names.json");
const HOA = read("hoa-findings.json");

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10 = (v) => money(Math.round(v / 10) * 10);
const near = (v, step) => n(Math.round(v / step) * step);
const must = (ok, msg) => { if (!ok) throw new Error(`garden-city.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const ST = F.stock, SA = F.sales;
/* Rows 2 and 3: the county line and the beach road. Row 2 is corrected: about a third of a mile along the beach (0.31). */
must(STRIP.waccamaw_dr_miles_horry === 1.8 && STRIP.waccamaw_dr_miles_georgetown === 3.2, "row 3 changed");
const LINE_FROM_PIER = "about a third of a mile";                                   // row 2, CORRECTED
/* Row 5: people. */
must(CN.cdp_2020.people === 10235 && CN.cdp_2020.housing_units === 10110, "row 5 changed");
/* Row 6: homes on county parcels by part. */
must(ST["beach/all"].homes === 1376 && ST["beach/condo"].homes === 1241 && ST["beach/house"].homes === 48, "row 6 ocean side changed");
must(ST["middle/all"].homes === 2957 && ST["middle/house"].homes === 1476 && ST["inland/all"].homes === 3142, "row 6 changed");
/* Row 7 (numbers verified; wording corrected: "taxed as its owner's main home"). */
must(ST["beach/all"].pct_owner_occupied === 8.7 && ST["middle/all"].pct_owner_occupied === 37.1 && ST["inland/all"].pct_owner_occupied === 53.5, "row 7 changed");
must(ST["middle/house"].pct_owner_occupied === 52.9 && ST["inland/house"].pct_owner_occupied === 77.6, "row 7 houses changed");
/* Row 8: tax bills out of state. */
const OUT = ST["beach/all"];
must(OUT.pct_tax_bill_outside_sc === 57.2 && OUT.top_states.slice(1, 5).map((s) => s[0]).join() === "NC,NY,PA,OH", "row 8 changed");
must(ST["middle/all"].pct_tax_bill_outside_sc === 30.5 && ST["inland/all"].pct_tax_bill_outside_sc === 26.9, "row 8 other parts changed");
/* Row 9: Census Day along Waccamaw Drive. */
const SB = CN.strip_blocks;
must(SB.both.housing_units === 3379 && SB.both.occupied === 684 && SB.both.seasonal === 2168 && SB.georgetown.occupied === 132 && SB.georgetown.housing_units === 795, "row 9 changed");
/* Row 10: seasonal homes in the Census place and the county. */
must(CN.cdp_2020.pct_seasonal === 39.5 && CN.horry_2020.pct_seasonal === 17.6, "row 10 changed");
/* Rows 11, 12, 14 (condos), 15: deed sales. */
const OC = SA["beach/condo"];
must(OC.sales === 89 && OC.median === 319900 && OC.p25 === 265500 && OC.p75 === 438250, "row 11 changed");
must(SA["beach/house"].sales === 3 && SA["beach/house"].min === 1325000 && SA["beach/house"].max === 2350000, "row 12 changed");
must(SA["middle/condo"].sales === 37 && SA["middle/condo"].median === 225000, "row 14 condos changed");
must(SA["inland/house"].sales === 57 && SA["inland/house"].median === 340000 && SA["inland/condo"].sales === 121 && SA["inland/condo"].median === 172500, "row 15 changed");
/* Rows 13 and 14 (houses) CORRECTED by the verifier (marsh and tidal creek only): typed here. */
const MARSH = { houses: 258, sales: 13, median: 1237000 };                            // row 13
const OTHER_HOUSES = { sales: 57, median: 575000, p25: 395000, p75: 697500 };          // row 14
/* Row 16 CORRECTED: ocean-side condo buyers whose tax bill goes out of state, 55 of 86. */
const OC_BUYERS_OUT = { n: 55, of: 86 };
must(Math.round(OC_BUYERS_OUT.n / OC_BUYERS_OUT.of * 100) === 64, "row 16 share");
/* Row 18 (CORRECTED: "listings") and row 19: the CRM's Garden City area, counted in aggregate. */
const LG = L.groups;
must(LG.all.n === 195 && L.api_totals.condo === 73 && L.api_totals.house === 49 && L.api_totals.manufactured === 67, "row 18 totals changed");
must(LG["horry/beach/condo"].n === 36 && LG["horry/beach/condo"].median_price === 377450 && LG["horry/beach/condo"].median_ppsf === 406, "row 18 ocean-side condos changed");
must(LG["georgetown/all"].n === 24 && LG["georgetown/all"].median_price === 1450000 && LG["georgetown/beach/house"].n === 8 && LG["georgetown/beach/house"].median_price === 2912500, "row 18 Georgetown changed");
must(L.feature_counts.private_dock === 7, "row 18 docks changed");
must(LG["middle/manufactured"].n === 42 && LG["middle/manufactured"].median_price === 257000 && LG["middle/manufactured"].min === 80000, "row 19 changed");
must(LG["inland/manufactured"].n === 25 && LG["inland/manufactured"].median_price === 139900, "row 19 inland changed");
/* Row 23 and 24: AirROI (vendor). */
const AH = AIR.headline;
must(AH.revenue === "$41,223" && AH.occupancy === "39.6%" && AH.adr === "$371" && AH.listings === "374" && AH.median_month === "$3,470" && AH.permit_share === "0%", "row 23 changed");
const MROWS = MONTHS.rows;
must(MROWS.length === 12 && MROWS[6].month === "July" && MROWS[6].revenue === 10200 && MROWS[0].revenue === 2090, "row 24 changed");
const OCC = Object.fromEntries(MONTHS.occupancy_by_month_last_12.map((r) => [r.month, r.occupancy]));
must(OCC["Jan 2026"] === 25.3 && OCC["Jul 2026"] === 64.9, "row 24 occupancy changed");
const TYPICAL_YEAR = 3470 * 12;                                                       // row 23: the typical listing's month, times 12
/* Rows 25 to 27: tax. */
const TX = CN.tax_example;
must(TX.price === 319900 && TX.mills === 207.3 && TX.rental_or_second_home_6pct === 3979 && TX.legal_residence_4pct === 1257, "row 27 changed");
/* Row 28: FEMA high-risk zone by part. */
must(ST["beach/all"].pct_high_risk === 96.4 && ST["middle/all"].pct_high_risk === 54.3 && ST["inland/all"].fema.none === 3142, "row 28 changed");
/* Row 29: NFIP policy cost, ZIP 29576. */
const NG = NF.groups;
must(NG["strip/11/any"].median_cost === 3259 && NG["strip/11/any"].policies === 533 && NG["rest_29576/11/any"].median_cost === 620, "row 29 houses changed");
must(NG["strip/15/any"].median_cost === 17240 && NG["strip/15/any"].policies === 61 && NG["strip/16/any"].median_cost === 1561, "row 29 condos changed");
/* Rows 35, 36: the tide gauge. */
const HT = CN.high_tide_flood_days;
must(HT.by_decade.map((d) => d.avg_minor_days).join() === "1.7,1.6,3.2,8.4" && HT.outlook_latest.lowConf === 8 && HT.outlook_latest.highConf === 12, "row 36 changed");
must(CN.sea_level.inches_per_decade === 1.32 && CN.sea_level.inches_over_record === 9, "row 35 changed");
/* Row 33: drives from the foot of the pier, free flow. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const mins = (k) => { const m = DRIVES[k].minutes; return m < 15 ? Math.round(m) : Math.round(m / 5) * 5; };
const D = { surfside: mins("surfside_pier"), marshwalk: mins("marshwalk"), hospital: mins("tidelands_waccamaw_hospital"), market: mins("market_common"),
  airport: mins("airport_terminal"), mall: mins("coastal_grand"), broadway: mins("broadway_at_the_beach"), gsmc: mins("grand_strand_medical") };
must(D.surfside === 6 && D.marshwalk === 8 && D.hospital === 8 && D.market === 20 && D.airport === 20 && D.mall === 20 && D.broadway === 25 && D.gsmc === 30, "row 33 drives changed");
must(DRIVES.huntington_beach_sp.minutes > 15 && DRIVES.huntington_beach_sp.minutes < 20, "row 33 park changed");
/* Rows 39 to 46 (fix round 1, VERIFIED-BY-FIXER): grocery drives, names by part, nearby places in the 2020 Census. */
const GD = { kroger: Math.round(FIX.kroger_business_17.minutes), walmart: Math.round(FIX.walmart_supercenter_garden_city_connector.minutes), publix: Math.round(FIX.publix_highway_707.minutes) };
must(GD.kroger === 4 && GD.walmart === 5 && GD.publix === 10, "row 42 grocery drives changed");
const CP = FIX.census_2020_places;
must(CP["Surfside Beach town"].pct_seasonal === 41.6 && CP["Murrells Inlet CDP"].pct_seasonal === 13.6 && CP["Garden City CDP"].pct_seasonal === 39.5, "row 45 Census places changed");
const hasName = (part, name) => NAMES.neighborhoods[part].some(([n]) => n === name);
must(["ROYAL GARDEN RESORT", "WATERS EDGE RESORT", "SURFMASTER", "ATALAYA TOWERS"].every((n) => hasName("beach/condo", n)), "row 39 ocean-side buildings changed");
must(["SALTERS COVE", "MT GILEAD", "MYRTLE DUNES", "WOODLAND TERRACE"].every((n) => hasName("middle/house", n)), "row 40 neighborhoods changed");
must(["WOODLAKE VILLAGE", "HARBOUR VILLAGE", "MALLARD LANDING VILLAGE", "JAMESTOWNE COLONY"].every((n) => hasName("inland/house", n)) && ["SWEETWATER INDIAN WELLS", "SOUTH BAY LAKES", "SOUTHBRIDGE", "TUPELO BAY GOLF VILLAS"].every((n) => hasName("inland/condo", n)), "row 40 west of 17 changed");
must(["RUM GULLY RD", "S DOGWOOD DR", "S CREEKSIDE DR"].every((st) => NAMES.streets["middle/water"].some(([n]) => n === st)), "row 41 marsh streets changed");
must(LG["georgetown/all"].docks === 5, "row 46 Georgetown docks changed");
/* Row 48 (fix round 2, VERIFIED-BY-FIXER): monthly condo dues of the ocean-side listings, bracketed to $10 by the map API's hoaMax filter. */
const DUES = HOA.groups["horry/beach"];
must(DUES.n === 35 && DUES.with_fee === 35 && DUES.median_upper === 790 && DUES.q1_upper === 610 && DUES.q3_upper === 910, "row 48 dues changed");
const DUES_YEAR = DUES.median_upper * 12;
/* Rows 29, 27 and 48: the worked example's figures. */
const LEFT = 41223 - TX.rental_or_second_home_6pct - 89.40 - NG["strip/16/any"].median_cost - DUES_YEAR;
must(Math.round(LEFT / 100) * 100 === 26100, "worked example total changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const PART_COLOR = ["#c4783a", "#2f6f8f", "#5f8a4e", "#8a5a9e", "#b3261e"];
const CSS = `<style>
main#main .c3-gc-fig{margin:1.4rem 0 1.6rem;max-width:640px}
main#main .c3-gc-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}
main#main .c3-gc-frame{border-radius:18px;overflow:hidden;background:#2b5f63;border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.1)}
main#main .c3-gc-frame svg{display:block;width:100%;height:auto}
main#main .c3-gc-key{list-style:none;margin:.9rem 0 0;padding:0;display:grid;gap:.45rem}
main#main .c3-gc-key li{display:flex;align-items:flex-start;gap:.65rem;font-size:1.02rem;line-height:1.4;margin:0;color:var(--muted)}
main#main .c3-gc-key a{color:var(--navy);font-weight:600}
main#main .c3-gc-num{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.7rem;height:1.7rem;border-radius:50%;color:#fff;font-weight:700;font-size:.95rem;font-family:var(--sans)}
${PART_COLOR.map((c, i) => `main#main .c3-gc-num.p${i + 1}{background:${c}}`).join("")}
main#main .c3-gc-h3{display:flex;align-items:baseline;gap:.6rem;font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:2.2rem 0 .7rem;line-height:1.3}
main#main .c3-gc-h3 .c3-gc-num{position:relative;top:-.12rem}
main#main svg.c3-gc-map .lb{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:66px;fill:#fff;paint-order:stroke;stroke:rgba(20,28,34,.85);stroke-width:14px;stroke-linejoin:round}
main#main svg.c3-gc-map .lb.it{font-style:italic;font-weight:600}
main#main svg.c3-gc-map .lb.cty{font-size:60px;fill:#ffe7c2}
main#main svg.c3-gc-map .pn{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;font-size:72px;fill:#fff}
@media (min-width:700px){main#main svg.c3-gc-map .lb{font-size:42px;stroke-width:10px}main#main svg.c3-gc-map .lb.cty{font-size:38px}main#main svg.c3-gc-map .pn{font-size:48px}}
main#main .c3-gc-stats{list-style:none;padding:0;margin:1.2rem 0 1.4rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;max-width:640px}
@media (min-width:700px){main#main .c3-gc-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
main#main .c3-gc-stats li{margin:0;padding:.75rem .85rem;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);box-shadow:0 6px 18px rgba(28,32,40,.07)}
main#main .c3-gc-stats b{display:block;font-family:var(--serif);font-size:1.45rem;color:var(--navy);line-height:1.15}
main#main .c3-gc-stats span{display:block;color:var(--muted);font-size:.95rem;line-height:1.35;margin-top:.2rem}
main#main .c3-gc-rules{list-style:none;padding:0;margin:1rem 0 1.4rem;display:grid;gap:.55rem;max-width:680px}
@media (min-width:700px){main#main .c3-gc-rules{grid-template-columns:1fr 1fr}}
main#main .c3-gc-rules li{margin:0;padding:.7rem .9rem;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .c3-gc-rules strong{color:var(--navy);display:block}
main#main .c3-gc-story{max-width:640px;margin:1.2rem 0 1.4rem;padding:1rem 1.2rem;border-radius:16px;background:rgba(255,255,255,.55);border-left:4px solid var(--brass);color:var(--muted);line-height:1.7}
main#main .c3-gc-story b{color:var(--navy)}
main#main h2{text-wrap:balance}
/* Round 4: each part's homes strip (or its fallback pill) closes the part, with room before the next. */
main#main .c3-gc-part+.hx-strip,main#main .c3-gc-part+.hx-strip+.hx-fallback{margin-bottom:2.4rem}
main#main .c3-gc-part+.hx-strip:not(:empty){margin-top:1.4rem}
/* On a wide screen the part's text and photo span the full width, so its strip does too (the site's strip stops at 760 px). */
@media (min-width:1100px){main#main .c3-gc-part+.hx-strip{max-width:none!important}}
/* The aerials carry labels near their edges: show the whole 4:3 frame at every width. */
main#main figure.c3ph-hero img{aspect-ratio:4/3!important}
main#main svg.c3-gc-cols text{font-family:var(--sans),system-ui,sans-serif;font-size:17px;fill:#4a5763}
main#main svg.c3-gc-cols text.v{font-weight:700;fill:#91592b}
@media (min-width:700px){main#main svg.c3-gc-cols text{font-size:10px}}
/* The end band (the same fix as /submarkets/conway/, glass.js compact rule; NEEDS.md). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
/* Fix round 1: under 360 px the four hero tiles wrap 2 by 2, so no word spills out of its tile. */
@media (max-width:359px){.c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.4rem!important}}
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}
</style>`;

/* Design pass, 2026-11-08 (redo2/submarkets-garden-city/DESIGN.md): a two-line headline, each part's photo beside
   its text on a wide screen, one card style (charts and offers), plain tables and lists, and one block width of 720 px. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const DESIGN_CSS = "<style>"
  /* 1. The headline: the italic line at about half the H1's size; on a phone the tiles are short rows under rules, with no box. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* 2. Photos without a card frame; on a wide screen each part's photo sits beside its text. */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `@media (min-width:1100px){${S} .c3-gc-part{display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:var(--gc-rows);column-gap:2.5rem;align-items:start}`
  + `${S} .c3-gc-part>*{grid-column:1}${S} .c3-gc-part>figure.c3ph-hero{grid-column:2;grid-row:1/-1;margin:2.4rem 0 0!important;max-width:none!important}}`
  /* 3. Tables and lists without cards; the map keeps its own frame and loses the outer card. */
  + `${TBL}{${FLAT};padding:0!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${S} figure.c3-gc-fig:not(.c3-gchart){${FLAT};padding:0!important}${S} figure.c3-gc-fig:not(.c3-gchart)>figcaption{padding:0!important}`
  + `${S} .c3-gc-stats{gap:0!important;border-top:${RULE};border-bottom:${RULE}}${S} .c3-gc-stats li{${FLAT};padding:.8rem 1rem .85rem 0!important}`
  + `@media (max-width:699px){${S} .c3-gc-stats li:nth-child(n+3){border-top:${RULE}!important}}`
  + `${S} .c3-gc-rules{gap:0 2rem!important}${S} .c3-gc-rules li{${FLAT};border-top:${RULE}!important;padding:.75rem 0 .8rem!important}`
  + `${S} .c3-gc-rules li:last-child{border-bottom:${RULE}!important}@media (min-width:700px){${S} .c3-gc-rules li:nth-last-child(2){border-bottom:${RULE}!important}}`
  + `${S} .c3-gc-story{background:none!important;border-radius:0!important;padding:.2rem 0 .2rem 1.2rem!important}`
  /* 4. One block width. */
  + `${S} .c3-gchart,${TBL},${S} .c3-gc-stats,${S} .c3-gc-rules,${S} .c3-gc-story{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* The five parts.                                                                */

const PARTS = [
  { id: "ocean-side", name: "The ocean side of Waccamaw Drive", key: "the beach and the pier", lon: -78.9916, lat: 33.5842 },
  { id: "on-the-marsh", name: "On the marsh", key: "docks and tidal creeks", lon: -79.0010, lat: 33.5822 },
  { id: "older-streets", name: "Between the marsh and Business 17", key: "the most kinds of homes", lon: -79.0075, lat: 33.5850 },
  { id: "west-of-17", name: "West of Business 17", key: "subdivisions lived in all year", lon: -79.0100, lat: 33.6000 },
  { id: "georgetown-end", name: "The Georgetown end", key: "canals, docks and the quietest beach", lon: -79.0205, lat: 33.5500 },
].map((p, i) => Object.assign(p, { num: i + 1 }));
const numDot = (p) => `<span class="c3-gc-num p${p.num}" aria-hidden="true">${p.num}</span>`;
const partH3 = (p, tail) => `<h3 id="${p.id}" data-toc="${p.name}" class="c3-gc-h3">${numDot(p)}<span>${p.name}: ${tail}</span></h3>`;

/* ---------------------------------------------------------------------------- */
/* The map: the USGS aerial (public domain) with our layers, drawn as inline SVG.  */
/* The aerial is the USGS Imagery Only export of bbox -79.036,33.531,-78.977,33.606 */
/* (Web Mercator, 1400 x 2141); its no-imagery corner over the sea is filled with   */
/* the sea's own colour (base.py). Lines and labels are placed from coordinates.     */

const MAP = (() => {
  const R = 6378137, mx = (lo) => R * lo * Math.PI / 180, my = (la) => R * Math.log(Math.tan(Math.PI / 4 + la * Math.PI / 360));
  const BX = [-79.036, 33.531, -78.977, 33.606], W = 1400, H = 2141;
  const P = (lo, la) => [(mx(lo) - mx(BX[0])) / (mx(BX[2]) - mx(BX[0])) * W, (my(BX[3]) - my(la)) / (my(BX[3]) - my(BX[1])) * H];
  const f1 = (v) => Math.round(v * 10) / 10;
  const line = (coords) => "M" + coords.map((c) => P(c[0], c[1]).map(f1).join(" ")).join("L");
  const feat = (test) => LAYERS.features.filter(test);
  const roadD = (name) => feat((f) => f.properties.name === name).flatMap((f) => f.geometry.coordinates).map(line).join("");
  const county = feat((f) => f.properties.layer === "county_line").flatMap((f) => f.geometry.coordinates).map(line).join("");
  const pier = feat((f) => f.properties.name === "Garden City Pier")[0].geometry.coordinates;
  must(Math.abs(pier[1] - 33.57608) < 1e-4, "the pier point moved");
  const [px, py] = P(pier[0], pier[1]);
  const lab = (text, lo, la, o = {}) => { const [x, y] = P(lo, la); return `<text class="lb${o.cls ? " " + o.cls : ""}" x="${f1(x + (o.dx || 0))}" y="${f1(y + (o.dy || 0))}" text-anchor="${o.anchor || "start"}"${o.rot ? ` transform="rotate(${o.rot} ${f1(x + (o.dx || 0))} ${f1(y + (o.dy || 0))})"` : ""}>${text}</text>`; };
  /* The county line meets the shore at 33.5727 N (row 2); the labels sit either side of it, over the sea. */
  const [, lineY] = P(-78.99, 33.5727);
  const along = (text, a, b, off) => { const [x1, y1] = P(a[0], a[1]), [x2, y2] = P(b[0], b[1]); let ang = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI; if (ang > 90) ang -= 180; if (ang < -90) ang += 180;
    const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2, r = ang * Math.PI / 180, ox = f1(cx - Math.sin(r) * off), oy = f1(cy + Math.cos(r) * off);
    return `<text class="lb" x="${ox}" y="${oy}" text-anchor="middle" transform="rotate(${f1(ang)} ${ox} ${oy})">${text}</text>`; };
  const pins = PARTS.map((p, i) => { const [x, y] = P(p.lon, p.lat); return `<g transform="translate(${f1(x)} ${f1(y)})"><circle r="50" fill="${PART_COLOR[i]}" stroke="#fff" stroke-width="8"/><text class="pn" y="25" text-anchor="middle">${p.num}</text></g>`; }).join("");
  const svg = `<svg class="c3-gc-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="c3-gc-map-t">`
    + `<title id="c3-gc-map-t">Aerial map of Garden City, South Carolina: the beach road, Waccamaw Drive, lies along the ocean with salt marsh behind it. The Horry and Georgetown county line crosses the beach a little south of the pier, and most of the beach road lies south of it, in Georgetown County, down to Garden City Point at the inlet. Business 17 is inland. Numbers 1 to 5 mark the five parts described below.</title>`
    + `<image href="${IMG_SRC}/garden-city-aerial-1000.webp" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none"/>`
    + `<path d="${roadD("Business 17")}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${roadD("Waccamaw Drive")}" fill="none" stroke="#f2b25c" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${county}" fill="none" stroke="#1c2028" stroke-opacity=".55" stroke-width="13"/><path d="${county}" fill="none" stroke="#ffe7c2" stroke-width="6" stroke-dasharray="26 16"/>`
    + `<circle cx="${f1(px)}" cy="${f1(py)}" r="16" fill="#fff" stroke="#1c2028" stroke-width="5"/>`
    + lab("Pier", pier[0], pier[1], { dx: 30, dy: 18 })
    + lab("Horry County", -78.9775, 33.5727, { cls: "cty", anchor: "end", dy: -22 })
    + lab("Georgetown County", -78.9775, 33.5727, { cls: "cty", anchor: "end", dy: 56 })
    + lab("Atlantic Ocean", -78.9930, 33.5440, { cls: "it", anchor: "middle" })
    + lab("Waccamaw Drive", -79.0170, 33.5480, { rot: -57, dx: 40 })
    /* Fix round 1: Business 17's label sits on its own line (two vertices of the "Business 17" layer, rotated
       to match). Round 4: the US 17 Bypass label is gone (it is not the edge of any part), and the labels are larger. */
    + along("Business 17", [-78.99870, 33.59618], [-78.99528, 33.59892], -22)
    + lab("Salt marsh", -79.0120, 33.5680, { cls: "it", anchor: "middle" })
    + lab("Garden City Point", -79.0290, 33.5345, { dx: 34 })
    + lab("Surfside Beach", -78.9790, 33.6040, { anchor: "end", dy: 40 })
    + pins + `</svg>`;
  must(lineY > 0 && lineY < H, "the county line is off the map");
  /* The key names each part in words (no in-page links, so it is not read as a contents list, H14). */
  const key = `<ol class="c3-gc-key" aria-label="The five parts of Garden City">` + PARTS.map((p) => `<li>${numDot(p)}<span><b style="color:var(--navy)">${p.name}</b>: ${p.key}</span></li>`).join("") + `</ol>`;
  return `<figure class="c3-gc-fig"><div class="c3-gc-frame">${svg}</div><figcaption>The dashed line is the county line. Aerial photo: USGS, public domain. Roads and the county line: U.S. Census Bureau, Horry County and OpenStreetMap contributors.</figcaption>${key}</figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Photos: USDA NAIP aerial close-ups (public domain), labelled from coordinates.  */

const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}-1200w`)); must(r, `no photo record for ${name}`); return r; };
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const photo = (r) => lazy(PH.heroPhoto(r, { alt: r.alt, caption: r.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
const PIER = rec("garden-city-pier-from-above"), STREETS = rec("garden-city-streets-from-above"), POINT = rec("garden-city-point-from-above");
/* Fix round 1: the USGS oblique photo from over the ocean (beach houses, the marsh behind them), already on the site. */
const OBLIQUE = PHOTOS.find((x) => x.file.endsWith("/garden-city-beach-and-marsh-from-the-ocean-2011.webp"));
must(OBLIQUE, "no record for the USGS oblique photo");
const INLAND = PHOTOS.some((x) => x.file.includes("/garden-city-west-of-17-from-above-1200w")) ? rec("garden-city-west-of-17-from-above") : null;
const SHOWN = [PIER, OBLIQUE, STREETS, INLAND, POINT].filter(Boolean);
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: p.caption.replace(/\.$/, "") })));

/* ---------------------------------------------------------------------------- */
/* Charts.                                                                        */

/* What each part sold for (rows 11, 13, 14, 15). Round 4 (owner, 2026-11-08: "way less complicated graphs"): five rows,
   houses then condos, a title that states the point (part 4 says it too), and no "how many sold" column. */
const PRICE_CHART = G.bars([
  { name: "A house on the marsh", value: MARSH.median, valueText: "$1,240,000" },
  { name: "A house between the marsh and 17", value: OTHER_HOUSES.median, valueText: r5k(OTHER_HOUSES.median) },
  { name: "A house west of Business 17", value: SA["inland/house"].median, valueText: r5k(SA["inland/house"].median) },
  { name: "A condo on the ocean side", value: OC.median, valueText: r5k(OC.median) },
  { name: "A condo west of Business 17", value: SA["inland/condo"].median, valueText: r1k(SA["inland/condo"].median) },
], { caption: "The lowest prices are west of Business 17", nameLabel: "Part and kind of home", valueLabel: "Middle price", compact: true,
  note: "Middle sale price in the past year, from Horry County's deed records, so the Georgetown end is not in it." });
must(r5k(OC.median) === "$320,000" && r1k(SA["inland/condo"].median) === "$173,000" && r5k(OTHER_HOUSES.median) === "$575,000", "price rounding");

/* Fix round 1: the chart of tax shares by part is gone (one measure, said once, in part 4 and the winter section). */
const MAIN_HOME_HOUSES_W = ST["inland/house"].pct_owner_occupied;  // 77.6: about 3 in 4 houses west of Business 17 (row 7)
must(MAIN_HOME_HOUSES_W > 70 && MAIN_HOME_HOUSES_W < 80 && ST["beach/all"].pct_owner_occupied < 10, "row 7 shares changed");

/* Airbnb revenue by month (row 24). */
const MONTH_CHART = (() => {
  const W = 360, H = 236, L0 = 76, R0 = 352, T0 = 26, B0 = 200, MAX = 11000, bw = (R0 - L0) / 12;
  const Y = (v) => B0 - v / MAX * (B0 - T0), f1 = (v) => Math.round(v * 10) / 10;
  const grid = [0, 5000, 10000].map((v) => `<line x1="${L0}" x2="${R0}" y1="${f1(Y(v))}" y2="${f1(Y(v))}" stroke="#1c2028" stroke-opacity="${v ? ".12" : ".35"}"/><text x="${L0 - 6}" y="${f1(Y(v) + 5)}" text-anchor="end">${v ? money(v) : "$0"}</text>`).join("");
  const cols = MROWS.map((r, i) => { const x = L0 + i * bw + bw * 0.14, w = bw * 0.72, hi = r.month === "July";
    return `<rect x="${f1(x)}" y="${f1(Y(r.revenue))}" width="${f1(w)}" height="${f1(B0 - Y(r.revenue))}" rx="3" fill="${r.season === "High" ? "#c4783a" : "#d9b48f"}"/>`
      + `<text x="${f1(x + w / 2)}" y="${B0 + 22}" text-anchor="middle">${r.month[0]}</text>`
      + (hi || r.month === "January" ? `<text class="v" x="${f1(x + w / 2)}" y="${f1(Y(r.month === "January" ? Math.max(r.revenue, MROWS[1].revenue) : r.revenue) - 8)}" text-anchor="middle">${money(r.revenue)}</text>` : ""); }).join("");
  const svg = `<svg class="c3-gc-cols" viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Column chart of what a Garden City Beach Airbnb earns in an average month: ${MROWS.map((r) => `${r.month} ${money(r.revenue)}`).join(", ")}.">${grid}${cols}</svg>`;
  return `<figure class="c3-gchart c3-gc-fig"><span class="cap" style="display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .5rem">Summer pays: a July earns about 5 times a January</span>${svg}<figcaption>What one Airbnb listing here earned in an average month, from AirROI, before cleaning, fees and management. Darker columns are May to August.</figcaption></figure>`;
})();

/* Flood policy cost (row 29): round 4 removed its two-bar chart, which repeated the sentence above it; the sentence stays. */
must(r10(NG["strip/11/any"].median_cost) === "$3,260" && r10(NG["rest_29576/11/any"].median_cost) === "$620", "row 29 sentence figures");

/* High-tide flood days at Springmaid Pier (rows 35, 36). */
const about = (v) => `about ${Math.round(v)} day${Math.round(v) === 1 ? "" : "s"}`;
const TIDE_CHART = G.bars([
  ...HT.by_decade.slice(1).map((d) => ({ name: d.years.replace("-", " to "), value: d.avg_minor_days, valueText: about(d.avg_minor_days) })),
  { name: "NOAA's outlook for the coming year", value: HT.outlook_latest.highConf, valueText: `${HT.outlook_latest.lowConf} to ${HT.outlook_latest.highConf} days`, reference: true },
], { caption: "High tides reach flood level about 8 days a year now, up from 2", nameLabel: "Years", valueLabel: "Days a year", compact: true,
  note: "Days a year, the average for each ten years, at NOAA's tide gauge at Springmaid Pier in Myrtle Beach, about 7 miles north." });

/* AirROI's year (row 23), as tiles. */
const STATS = `<ul class="c3-gc-stats" aria-label="Airbnb numbers for Garden City Beach, past 12 months">`
  + [[`$41,200`, "the average listing's income in a year"], [`40%`, "of nights booked"], [AH.adr, "average nightly rate"], [AH.listings, "active listings"]]
    .map(([b, s]) => `<li><b>${b}</b><span>${s}</span></li>`).join("") + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const CENSUS = "https://data.census.gov/table?g=160XX00US4528455";
const MARSHWALK = "https://marshwalk.com/";
const HBSP = "https://southcarolinaparks.com/huntington-beach";
const HCPD = "https://www.horrycountysc.gov/departments/police/";
const GCSO = "https://www.gcsheriff.org/enforcement-division/patrol/";
const STRCHART = "https://www.horrycountysc.gov/media/monjnvh0/sales-tax-chart-short-term-rentals.pdf";
const SCDOR = "https://dor.sc.gov/tax/accommodations";
const GTTAX = "https://www.gtcountysc.gov/351/Hospitality-Accommodations-Tax";
const AIRROI = "https://www.airroi.com/airbnb-data/united-states/south-carolina/garden-city-beach";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const HUGO = "https://www.weather.gov/ilm/hurricanehugo";
const IAN = "https://www.weather.gov/ilm/hurricaneian";
const NOAA = "https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070";
const BEACHES = "https://horrycountysc.gov/about-our-beaches";
const PIERSITE = "https://www.gardencitypier.com/";
/* Round 4 (owner, 2026-11-08: "sell the place the way a great local agent would"): the selling sentences' sources,
   facts.md rows 49 to 53, VERIFIED (independent verifier, 2026-11-08). */
const PIERSTORY = "https://www.pieratgardencity.com/story";
const DNRCRAB = "https://www.dnr.sc.gov/fish/swfaqs.html";
const JULY4 = "https://www.myrtlebeachareacvb.com/news/myrtle-beach-lights-up-july-4th-with-fireworks-festivals-and-family-fun";
const GULFSTREAM = "https://gulfstreamcafe.com/";


/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const TOP = { title: "Get the Garden City homes that fit your plan", label: "Send me Garden City homes", href: "/contact/" };
const END = {
  h2: "Before you offer on a Garden City home, we check four things.",
  p: "Which county it is in, what its HOA or condo papers say about renting, its flood zone and the building's flood policy, and its tax bill as a rental or as your main home.",
  label: "Ask about a Garden City home", href: `/contact/?place=${encodeURIComponent("Garden City")}`,
};
const ask = (place, label) => G.offer(place, { label });
/* Round 4: a homes strip per part (owner, 2026-11-08: "horizontal idx listings is the strongest tool we have ... we only
   ever did that because we couldnt use IDX"). The places are gc-<part> in Blog-Brain batches/2026-10-b/data/idx-places.json:
   a short "near" search that stays inside the part, index false. The old pill is the fallback, shown only while the strip is empty. */
const strip = (slug, name, head, place, label) => G.homes(slug, name, ask(place, label), head);
/* Design pass: a part's text and its photo in one block, so the photo can sit beside the text on a wide screen
   (the photo's grid rows span every text row; the last row takes what is left). Below 1,100 px the order is unchanged. */
const side = (...kids) => { kids = kids.filter(Boolean); const n = kids.filter((k) => !k.includes('class="c3ph-hero"')).length;
  return `<div class="c3-gc-part" style="--gc-rows:${"auto ".repeat(Math.max(n - 1, 0))}1fr">` + kids.join("") + `</div>`; };
const [P1, P2, P3, P4, P5] = PARTS;
const r100 = (v) => money(Math.round(v / 100) * 100);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(PIER),
  title: "Garden City, SC Real Estate: Beach Homes, Rentals, Flood Facts",
  description: "Garden City, SC: which county it is in, the five parts and what homes sell for in each, nightly rental rules and taxes, flood zones, and the yearly cost to own.",
  ogTitle: "Garden City, SC: the five parts, the pier and the marsh, nightly rentals and flooding",
  crumb: "Garden City",
  eyebrow: "Garden City, SC",
  h1: "Garden City, SC: beach rentals with no city ordinance.",
  h1em: "One beach road between the ocean and the salt marsh.",
  sub: "South of Myrtle Beach, people line dance at the end of the Garden City Pier, out over the ocean, and pull up blue crabs from docks on the marsh.",
  /* Fix round 1: no price and no "town government" tile (owner, PLAIN-7); short words so no tile spills at 320 px. */
  heroMedia: glance([
    { icon: "beach", label: "Beach road", text: "About 5 miles" },
    { icon: "pond", label: "Fishing pier", text: "668 feet" },
    { icon: "trail", label: "MarshWalk", text: `${D.marshwalk} min drive` },
    { icon: "airport", label: "Airport", text: `${D.airport} min drive` },
  ]),
  heroCta: TOP,
  topOfferLine: "Tell us how you will use it. We send the Garden City homes that fit.",
  author: "devin",
  /* No contents list (as on the bar pages): it was most of a phone screen before the first section. */
  toc: false,
  shortAnswer: [
    `Garden City, South Carolina is a beach community between Surfside Beach and Murrells Inlet. It is not a town: the county runs it, and most of its beach road is in Georgetown County, not Horry.`,
    `For a condo on the sand, look at the ocean side by the pier. For a house with a dock, look at the marsh and the Georgetown end. For a house lived in all year, out of the high-risk flood zone, look west of Business 17.`,
  ],
  sections: [
    { h2: "Where is Garden City, SC, and which county is it in?", toc: "Where it is", id: "where", html: () =>
      CSS + DESIGN_CSS + G.homesCss() +
      h.p(`Garden City sits on a strip of land between the Atlantic Ocean and a salt marsh, just south of Surfside Beach. Its beach road, Waccamaw Drive, runs down the strip to Garden City Point at the inlet. Business 17 runs inland of the marsh.`) +
      h.p(`The Horry and Georgetown county line crosses the beach ${LINE_FROM_PIER} south of the Garden City Pier. Most of Waccamaw Drive is south of the line, in Georgetown County. The county decides your property tax, your rental license and the beach rules.`) +
      h.p(`Most addresses use Murrells Inlet and its ZIP code, 29576. A band at the north edge uses Surfside Beach.`) +
      MAP },

    { h2: "Where to buy in Garden City, SC", toc: "Five parts", id: "parts", html: () =>
      h.p(`Garden City has five parts, and each is a different way to live at the beach. The numbers match the map above.`) +

      side(
        partH3(P1, "the beach and the pier"),
        h.p(`Here you walk out of your building onto the sand. Condo buildings and a few beach houses stand between Waccamaw Drive and the ocean, from the Surfside Beach line south past the pier. The largest buildings include Royal Garden Resort, Waters Edge Resort, Surfmaster and Atalaya Towers.`),
        h.p(`The pier is the center of this side. At the far end of the Garden City Pier, rebuilt after Hurricane Hugo took the old pier in 1989, the rain shelter holds a bandstand and a dance floor bar, and people learn line dances out over the ocean.`),
        photo(PIER),
        h.p(`Its café serves breakfast. In summer, its deck bar has karaoke in the afternoons, and bands play every night at both ends of the pier, weather permitting. The arcade is there for a rainy day. A pier pass covers fishing, so no state fishing license is needed, and in summer you can fish around the clock.`),
        h.p(`Almost every home on this side is a condo. Condos here sold for about $320,000 at the middle in the past year.`)) +
      strip("gc-ocean-side", "Garden City by the pier", "Condos for sale by the Garden City Pier now", "Garden City's ocean side", "Get the condos for sale on Garden City's ocean side") +

      side(
        partH3(P2, "docks and tidal creeks"),
        h.p(`Behind the beach strip is salt marsh, cut by tidal creeks that reach the inlet at Garden City Point. The houses along its edges look out over the marsh, and many have ${h.a("/buyers/waterfront-homes/", "a long private dock")}. On the beach strip they line Dogwood Drive. On the mainland side they are on streets like Creekside Drive and Rum Gully Road.`),
        h.p(`From a dock on the marsh, you can tie a chicken neck to a string and pull up blue crabs for dinner. In South Carolina you need no license to crab with three or fewer drop nets, fold-up traps or hand lines.`),
        photo(OBLIQUE),
        h.p(`These are the most costly houses east of Business 17. The ones that sold in the past year went for about $1.24 million at the middle, about twice the other houses east of Business 17. Few come up for sale.`)) +
      strip("gc-on-the-marsh", "Garden City on the marsh", "Houses for sale around the Garden City marsh now", "Garden City", "Get the marsh-front homes for sale in Garden City") +

      side(
        partH3(P3, "the most kinds of homes"),
        h.p(`The rest of the land between the marsh and Business 17 is streets of houses, small condo buildings and manufactured homes. Its neighborhoods include Salters Cove, Mount Gilead, Myrtle Dunes and Woodland Terrace. It also takes in the streets north of where Waccamaw Drive ends, up to the Surfside Beach line.`),
        h.p(`Every Fourth of July afternoon, Garden City holds a "wet" golf cart parade: decorated carts drive the route while people on the side soak them with water guns. It raises money for local first responders.`),
        photo(STREETS),
        h.p(`This part has the widest range of prices. Away from the marsh, a house sold for about $575,000 at the middle in the past year. Condos and manufactured homes cost less. Where a home is on rented land, the lot rent is not in the price, and we find it out for each home.`)) +
      strip("gc-older-streets", "Garden City between the marsh and Business 17", "Homes for sale between the marsh and Business 17 now", "Garden City east of Business 17", "Get the homes for sale in Garden City east of Business 17") +

      side(
        partH3(P4, "subdivisions lived in all year"),
        h.p(`West of Business 17 are Garden City's subdivisions, with houses on curving streets around ponds. The largest are Woodlake Village, Mallard Landing, Harbour Village and Jamestowne. Condo communities include Sweetwater at Indian Wells, South Bay Lakes, Southbridge and Tupelo Bay Golf Villas.`),
        h.p(`On the Fourth of July, decorated boats parade along the inlet in the afternoon while the crowd watches from the MarshWalk, and fireworks go up at night. In 2025 the boat parade was at 2 p.m. and the fireworks at 10 p.m. From the subdivisions west of Business 17, it is a short drive.`),
        (INLAND ? photo(INLAND) : ""),
        h.p(`More people live here all year: about 3 in 4 houses are taxed as the owner's main home, the most of any part. A house sold for about $340,000 at the middle in the past year and a condo for about $173,000, the lowest prices in Garden City.`)) +
      strip("gc-west-of-17", "Garden City west of Business 17", "Homes for sale west of Business 17 now", "Garden City west of Business 17", "Get the homes for sale in Garden City west of Business 17") +

      side(
        partH3(P5, "canals, docks and the quietest beach"),
        h.p(`South of the county line, Waccamaw Drive runs on to Garden City Point, where the marsh meets the inlet. Houses line the beach, and behind them many sit on canals with private docks.`),
        h.p(`At the inlet end of Waccamaw Drive, Gulfstream Cafe has looked over Murrells Inlet for nearly 40 years. People go up to its rooftop deck to watch the sun set over the water, and come back for its oyster roasts in season.`),
        photo(POINT),
        h.p(`This is the quietest stretch of the beach road. Georgetown County's rules apply here. It requires no business license for a rental, and its lodging tax is lower.`),
        h.p(`Prices here are the highest in Garden City. The listings here asked about $1.45 million at the middle, more than any other part.`)) +
      strip("gc-georgetown-end", "the Georgetown end of Garden City", "Homes for sale at the Georgetown end now", "Garden City's Georgetown end", "Get the homes for sale at Garden City's Georgetown end") },

    { h2: "What do homes in Garden City cost?", toc: "Home prices", id: "prices", html: (bg) =>
      h.p(`The chart gives the middle sale price in each part over the past year, from Horry County's deed records. Houses cost the most on the marsh and the least west of Business 17.`) +
      PRICE_CHART +
      h.p(`Asking prices are usually higher than sale prices.`) +
      h.cta("Know what the Garden City home you like is worth", "Send us the address. We pull the recent sales in its building or on its street, and tell you what those sales say it is worth.", "Have us pull the sales for one home", "/contact/", bg) },

    { h2: "Can you Airbnb in Garden City, SC?", toc: "Renting it out", id: "airbnb", html: (bg) =>
      h.p(`Yes, unless the building's own rules say no. There is no town, so no town rental ordinance applies. Horry County's list of what a nightly-rental owner must file names a business license and three tax accounts, and no rental permit. We go over the filings with you before you close.`) +
      h.p(`A condo association or an HOA (homeowners association) can forbid or limit rentals in its own papers. We read the building's documents and rules before you offer. Our page on ${h.a("/hoa/rental-restrictions/", "HOA rental restrictions")} explains how those rules work.`) +
      h.p(`Guests pay lodging taxes on top of the rent: about 12 percent on the Horry side and about 11 percent on the Georgetown end. You collect that money and send it on, so it is not part of your income.`) +
      h.h3("What a Garden City Airbnb earns") +
      h.p(`AirROI, a rental data company, tracks the Airbnb listings here under the name Garden City Beach. Over the past 12 months:`) +
      STATS +
      h.p(`Each figure is an average across all the listings, so the nights booked times the nightly rate does not come out to the income.`) +
      h.p(`Most of the money comes in summer. A listing earns about 5 times as much in an average July as in January.`) +
      MONTH_CHART +
      h.h3("Worked example: an ocean-side condo, rented by the night") +
      h.p(`Take the middle ocean-side condo from part 1, and say it earns what the average listing here earns. No loan is in this example.`) +
      h.table(["One year of nightly renting", "About"], [
        ["Airbnb income, the average listing's year, before fees", "$41,200"],
        ["Less the property tax as a rental, with the county fees on the bill", r10(TX.rental_or_second_home_6pct + 89.40)],
        ["Less your own flood policy on the unit", r10(NG["strip/16/any"].median_cost)],
        [`Less condo dues, at the middle of ${DUES.n} ocean-side listings (about ${money(DUES.median_upper)} a month)`, money(DUES_YEAR)],
        ["Left for cleaning, management, utilities and the unit's other insurance", r100(LEFT)],
      ]) +
      h.p(`The dues are what the listing agents report. For the middle half of these condos they run from about ${money(DUES.q1_upper)} to ${money(DUES.q3_upper)} a month. The building's own flood policy is paid out of them.`) +
      h.p(`Not in the table:`) +
      h.ul([
        `Cleaning and management, which depend on who you hire.`,
        `Utilities, and the unit's insurance other than flood.`,
        `A special assessment, if the building charges one on top of the dues.`,
      ]) +
      h.p(`We get the unit's own dues, the building's budget and an insurance quote for the unit before you offer, so you see the whole year before you buy.`) +
      h.cta("Thinking of renting a Garden City condo by the night?", "Send us the building or the address. We read its condo papers on renting, and we price the dues, the tax and the flood policy for that unit.", "Ask about a Garden City condo", "/contact/", bg) +
      h.p(`AirROI's figures cover every kind of home here, condos and houses together. To see what a nightly rental earns in other towns, ${h.a("/invest/airbnb-income/", "compare eight towns")}. The rules by town are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.`) },

    { h2: "What is there to do in Garden City, SC?", toc: "Things to do", id: "things-to-do", html: () =>
      h.p(`A summer day here starts on the beach and ends on the pier. For dinner, the ${h.ext(MARSHWALK, "MarshWalk")} in Murrells Inlet is about ${D.marshwalk} minutes away by car. The ${h.a("/submarkets/murrells-inlet/", "Murrells Inlet guide")} has its restaurants and the boat landing at its south end.`) +
      h.p(`For a day out, ${h.ext(HBSP, "Huntington Beach State Park")} is 15 to 20 minutes south. It has 3 miles of beach, a freshwater lake where you are almost sure to see alligators, and what the state calls some of the top bird-watching on the East Coast. The ${h.a("/submarkets/pawleys-island/", "Pawleys Island guide")} has the park's history and Brookgreen Gardens across the road.`) +
      h.p(`For groceries, Kroger on Business 17 is about ${GD.kroger} minutes from the pier by car, and the Walmart Supercenter on the Garden City Connector about ${GD.walmart}.`) +
      h.h3("The beach rules") +
      h.p(`Horry County manages the beach from the Surfside Beach town line to the Georgetown County line. Its rules:`) +
      `<ul class="c3-gc-rules">`
        + `<li><strong>Dogs</strong>Off the beach from 10 a.m. to 5 p.m., May 1 through Labor Day. Otherwise on a hand-held leash.</li>`
        + `<li><strong>Shade</strong>Round umbrellas up to 7 feet 6 inches across, and small pop-up cabanas for infants. No tents or canopies, all year.</li>`
        + `<li><strong>Overnight</strong>Nothing may be left on the beach overnight.</li>`
        + `<li><strong>Alcohol</strong>None on the beach or the beach accesses.</li>`
        + `</ul>` +
      h.h3("How far is everything?") +
      h.p(`Drive times by car from the foot of the pier, without traffic. Summer traffic on Business 17 and US 17 adds time.`) +
      h.table(["From the Garden City Pier to", "By car, about"], [
        ["Surfside Beach pier", `${D.surfside} min`],
        ["Tidelands Waccamaw Community Hospital", `${D.hospital} min`],
        ["Market Common", `${D.market} min`],
        ["Myrtle Beach International Airport", `${D.airport} min`],
        ["Coastal Grand Mall", `${D.mall} min`],
        ["Broadway at the Beach", `${D.broadway} min`],
        ["Grand Strand Medical Center", `${D.gsmc} min`],
      ]) },

    { h2: "Is Garden City, SC busy in winter?", toc: "Winter", id: "winter", html: () =>
      h.p(`Summer is busy and winter is quiet, most of all on the beach road.`) +
      h.ul([
        `On the ocean side, more than 9 in 10 homes are second homes or rentals. The county mails most of their tax bills to another state, North Carolina, New York, Pennsylvania and Ohio most often.`,
        `At the last Census, taken in April, about 4 in 5 homes along Waccamaw Drive had no one living in them.`,
        `The pier stays open in winter, with shorter hours for fishing and the deck bar.`,
        `From November 1 to February 28, you may drive a golf cart onto the Horry County beach, with a state permit and a licensed driver.`,
      ]) +
      `<div class="c3-gc-story"><b>Example.</b> In the winter cart season, a golf cart with a cooler and buckets drives down onto the sand at Garden City. The beach is empty. There is time for sandcastles, lunch and an hour of watching the waves.</div>` },

    { h2: "Does Garden City flood?", toc: "Flooding", id: "flooding", html: (bg) =>
      h.p(`East of Business 17, much of Garden City is in FEMA's high-risk flood zone. In that zone a lender requires flood insurance:`) +
      h.table(["Part of Garden City, Horry side", "Homes in FEMA's high-risk flood zone"], [
        ["The ocean side of Waccamaw Drive", "Nearly all"],
        ["Between the marsh and Business 17", "About half"],
        ["West of Business 17", "None"],
      ]) +
      h.p(`Flood insurance costs about five times as much on the beach strip. Along Waccamaw Drive, the middle federal flood policy on a house cost about $3,260 a year. Elsewhere in Garden City's ZIP code it was about $620. To check one address, use our ${h.a("/buyers/flood-zone-check/", "Horry County flood zone check")}.`) +
      h.p(`A condo building's own flood policy on the strip cost about $17,000 a year at the middle, shared by the owners through their dues.`) +
      h.h3("What the big storms did") +
      h.p(`In September 1989, Hurricane Hugo's storm surge wiped out up to 90 percent of Garden City's homes. The pier was destroyed, and sand covered roads three blocks inland.`) +
      h.p(`In 2022, Hurricane Ian's surge broke through the dunes in Garden City Beach and flooded parking lots and streets. It left up to three feet of sand on South Waccamaw Drive.`) +
      h.h3("High tides are rising") +
      h.p(`High tides that reach flood level come more often than they used to. At the nearest working tide gauge, in Myrtle Beach, they came about 8 days a year in the last ten years, against 1 or 2 days a year twenty years before.`) +
      TIDE_CHART +
      h.p(`Our pages on ${h.a("/buyers/undisclosed-flooding/", "finding out whether a house has flooded")} and ${h.a("/buyers/coastal-insurance/", "coastal insurance")} show what we look at.`) +
      h.cta("Get the flood zone and flood history of one Garden City home", "Send us the address. We pull its flood zone, look for past flooding and, for a condo, get the building's flood policy.", "Have us check a home for flooding", "/contact/", bg) },

    { h2: "What does it cost to own a home in Garden City each year?", toc: "Yearly cost", id: "yearly-cost", html: (bg) =>
      h.p(`South Carolina figures property tax on a share of a home's value: 4 percent of it for the home you live in, and 6 percent for a second home or rental. The home you live in also skips the school operating tax. As a rental, the same condo pays about 3 times the tax it pays as your main home.`) +
      h.p(`For the middle ocean-side condo:`) +
      h.table(["Each year", "Your main home", "Second home or rental"], [
        ["Property tax", r10(TX.legal_residence_4pct), r10(TX.rental_or_second_home_6pct)],
        ["County fees on the tax bill", "$89.40", "$89.40"],
        ["Your own flood policy on the unit, if you buy one", r10(NG["strip/16/any"].median_cost), r10(NG["strip/16/any"].median_cost)],
        ["Condo dues, at the middle of the listings", money(DUES_YEAR), money(DUES_YEAR)],
      ]) +
      h.ul([
        `The flood policy line is the middle federal policy that condo owners along Waccamaw Drive bought for their own unit. The building's own policy is in the condo dues.`,
        `On the Georgetown end, Georgetown County decides the tax rate. The same state rule applies.`,
        `Our ${h.a("/buyers/property-taxes/", "property tax calculator")} has the rate for every part of the county.`,
      ]) +
      h.cta("Get the yearly cost of one Garden City address", "Send us the address. We work out its tax at the 4 percent rate for a home you live in and at the 6 percent rate for a rental. We show you how to apply for the lower one.", "Have us work out the tax on an address", "/contact/", bg) },

    { h2: "Garden City, Surfside Beach or Murrells Inlet?", toc: "Nearby towns", id: "nearby", html: () =>
      h.p(`The three places sit side by side, and each suits a different buyer.`) +
      h.table(["Place", "Who makes the local rules", "Vacation homes, whole Census place"], [
        ["Garden City", "The county", "About 4 in 10"],
        [h.a("/submarkets/surfside-beach/", "Surfside Beach"), "Its own town council", "About 4 in 10"],
        [h.a("/submarkets/murrells-inlet/", "Murrells Inlet"), "The county", "About 1 in 7"],
      ]) +
      h.p(`Vacation-use shares are from the 2020 Census. Garden City's share counts the subdivisions west of Business 17 too, so it is lower than along the beach road. Surfside Beach's pier is about ${D.surfside} minutes north of the Garden City Pier by car, and the MarshWalk about ${D.marshwalk} minutes south.`) +
      h.p(`Surfside Beach is a town, so its own rules on renting apply on top of the county's. Murrells Inlet is lived in all year far more than the two beach places, and the MarshWalk's restaurants are there. Garden City has the pier, the marsh and the Georgetown end's canals.`) },
  ],
  faqTitle: "Garden City, SC FAQ",
  faq: [
    { q: "Is Garden City, SC in Horry County or Georgetown County?", a: "Both. The pier is in Horry County, and most of the beach road is in Georgetown County." },
    { q: "Is Garden City part of Myrtle Beach?", a: "No. Garden City is not part of any city. Most addresses use Murrells Inlet, ZIP code 29576." },
    { q: "Can you drive a golf cart on Garden City Beach?", a: "On the Horry County beach, from November 1 to February 28, with a state permit and a licensed driver." },
    { q: "Are dogs allowed on Garden City Beach?", a: "Not from 10 a.m. to 5 p.m., May 1 through Labor Day, on the Horry County beach. At other times, on a hand-held leash no longer than 7 feet." },
    { q: "Is Garden City, SC safe?", a: "We do not rate any place as safe or unsafe. On the Horry side, the Horry County Police Department, the county's main law enforcement agency, answers calls. On the Georgetown end, the Georgetown County Sheriff's Office does." },
    { q: "What schools serve Garden City, SC?", a: "Schools are assigned by address. Homes on the Horry side are in Horry County Schools, and homes on the Georgetown end are in the Georgetown County School District. We look up the assigned schools for any home you like." },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "Census 2020", href: CENSUS },
    { name: "county STR filings", href: STRCHART },
    { name: "SCDOR", href: SCDOR },
    { name: "Georgetown County", href: GTTAX },
    { name: "AirROI", href: AIRROI },
    { name: "2026 tax levy", href: LEVY },
    { name: "OpenFEMA policies", href: NFIP },
    { name: "NWS Hugo", href: HUGO },
    { name: "NWS Ian", href: IAN },
    { name: "NOAA Springmaid Pier", href: NOAA },
    { name: "county beach rules", href: BEACHES },
    { name: "the pier", href: PIERSITE },
    { name: "pier history", href: PIERSTORY },
    { name: "SCDNR", href: DNRCRAB },
    { name: "July 4th", href: JULY4 },
    { name: "Gulfstream Cafe", href: GULFSTREAM },
    { name: "the MarshWalk", href: MARSHWALK },
    { name: "SC State Parks", href: HBSP },
    { name: "Horry County Police", href: HCPD },
    { name: "Georgetown Sheriff", href: GCSO },
  ],
  sourcesNote: "Our counts: county parcels, flood maps, the past year's deeds; CCMLS listings in aggregate; drives from the pier.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "Garden City SC real estate, Garden City SC homes for sale, Garden City Beach condos, Garden City SC short term rental, Airbnb Garden City SC, is Garden City SC in Horry County, Garden City SC flood zone, Garden City Beach golf cart rules, Garden City SC property tax, Garden City vs Surfside Beach",
  about: "Garden City, an unincorporated beach community in Horry and Georgetown counties, South Carolina",
});
