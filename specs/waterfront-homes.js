/* /buyers/waterfront-homes/ - waterfront homes on the Grand Strand: what a house on each kind of water sold for, what
 * each water is like to live on (the wow first), the dock permit, flood by kind of water, the boat route to the ocean,
 * and what "waterfront" means in a listing.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made (no spec); this is its first spec. URL kept.
 * Plan: Blog-Brain batches/2026-11-b/buyers-waterfront-homes/PLAN.md. Must-answer list: must-answer.md there.
 * Facts: facts.md there, VERIFIED rows, and CORRECTED rows at the verifier's values and wording only (VERIFY.md).
 * Struck and not used: row 7 (no deed price for a lake or pond), row 12's dock price per square foot, row 17 (lake flood
 * share), the waterway asking price (row 11), and "the sun rises over the ocean every morning" north of central Myrtle Beach.
 * Reused rows keep their own ledger's wording: WF (batches/2026-11-a/buyers-waterfront-homes/facts.md) rows 1 to 22 and
 * 27, NMB rows 13, 14, 30, GC row 13, MI row 9, PI row 10, CM row 28, LR rows 12 to 14.
 * Data: data/2026-11-b/buyers-waterfront-homes/ (deeds-findings.json, listings-findings.json, photos.json,
 * from-2026-11-a/findings.json, bridges.json, chart-tides.json) and the NMB findings for Cherry Grove. The verifier's
 * corrected values are typed below with their row, each checked against the value it replaces, so a re-run of the data
 * stops the build until the correction is checked again.
 * Homes strips: wf-* places are new; BUILD.md lists their searches for the lead (idx-places.json is not edited here).
 * Until a strip fills, its entry's offer pill shows.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/waterfront-homes/";
const SLUG = "buyers-waterfront-homes";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const D = read("deeds-findings.json"), L = read("listings-findings.json"), PHOTOS = read("photos.json").photos;
const WF = read("from-2026-11-a/findings.json"), BRIDGES = read("from-2026-11-a/bridges.json"), TIDES = read("from-2026-11-a/chart-tides.json");
const NMB = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-a", "submarkets-north-myrtle-beach", "findings.json"), "utf8"));

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`waterfront-homes.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 1, CORRECTED: the verifier's run gives 512 first-row houses and 29 resales at $2,175,000. The data file still holds
   the researcher's 411 and 20 at $2,157,500; print "more than 400", "at least 20" and "about $2.2 million". */
const OK1 = D.kinds.ocean.resale;
must(OK1.n === 20 && OK1.median === 2157500 && D.stock_flood.ocean.houses === 411, "row 1 data changed: recheck the verifier's correction");
must(D.kinds.ocean.nearby_off_water_resale.median === 615000, "row 1 nearby changed");
const OCEAN = { houses: "More than 400", resold: "at least 20", median: "about $2.2 million", nearby: "about $615,000" };
/* Row 2, CORRECTED: without the set-back locations, more than 600 resales at about $200,000; Myrtle Beach about $150,000,
   North Myrtle Beach about $500,000. */
must(D.kinds.ocean_condo.resale.n === 669 && D.kinds.ocean_condo.resale.median === 213900, "row 2 data changed: recheck the verifier's correction");
const CONDO = { sold: "More than 600", median: 200000, mb: "about $150,000", nmb: "about $500,000" };
/* Row 3 (WF rows 20 to 22): the waterway and the Waccamaw. */
const GW = WF.sales.groups;
must(GW["Intracoastal Waterway"].on_water.n === 56 && GW["Intracoastal Waterway"].on_water.median === 1325000, "row 3 waterway changed");
must(GW["Intracoastal Waterway"].within_1km_not_on_water.median === 527000, "row 3 waterway nearby changed");
must(GW["Waccamaw River"].on_water.n === 14 && GW["Waccamaw River"].on_water.median === 537000 && Math.round(GW["Waccamaw River"].within_1km_not_on_water.median / 1000) === 330, "row 3 Waccamaw changed");
const ICW_HOUSES = 55;                                                                 // WF row 20: 56 sales, 55 houses
/* Row 4 (NMB row 14): the Cherry Grove channels. */
const CG = NMB.sales.house_resale_channel, CGOFF = NMB.sales.house_resale_cg_not_channel;
must(CG.n === 38 && CG.median === 715000, "row 4 changed");
must(CGOFF && CGOFF.n === 65 && CGOFF.median === 665000, "row 4 off-channel changed");
/* Row 5 (GC row 13, corrected there): Garden City's marsh. Typed at the verifier's values. */
const GCMARSH = { houses: 260, sales: 13, median: 1240000 };
/* Row 8, CORRECTED: the reference bar is the county's middle house resale, about $375,000 (5,836 resales). */
const COUNTY_HOUSE = 375000;
/* Rows 9 to 11: listings, counted in aggregate on the day of the pull. */
const OW = L.on_the_water, K = L.kinds;
must(OW.ocean_house.n === 28 && OW.ocean_house.median_ask === 3387500, "row 9 changed");
must(K.ocean_condo_building.n === 1105 && K.ocean_condo_building.median_ask === 215000 && K.ocean_condo_building.under_300k === 721, "row 10 building changed");
must(K.ocean_condo_unit_faces_ocean.n === 717 && K.ocean_condo_unit_faces_ocean.median_ask === 220000, "row 10 faces the ocean changed");
must(OW.waterfront_houses.n === 506 && OW.lake_or_pond_house.n === 429 && OW.lake_or_pond_house.median_ask === 449900, "row 11 lake changed");
must(OW.waterfront_under_300k_on_lake_or_pond_only === 73 && OW.waterfront_houses.under_300k === 73, "row 11 under $300,000 changed");
/* Row 12 (count only; the price comparison is struck). */
must(OW.waterfront_houses_with_dock.n === 52 && OW.tidal_or_river_with_dock.n === 37 && OW.tidal_or_river_with_dock.n + OW.tidal_or_river_no_dock.n === 64, "row 12 counts changed");
/* Row 16, CORRECTED where it moves with row 1: the ocean as "about 6 in 10" (310 of 512 in the corrected run). */
const SF = D.stock_flood;
must(SF.icw.houses === 985 && SF.icw.lot_wholly_outside_high_risk_pct === 30.2 && SF.icw.middle_outside_high_risk_pct === 58.2, "row 16 waterway changed");
must(SF.river.houses === 456 && SF.river.lot_reaches_high_risk === 452, "row 16 river changed");
must(SF.ocean.lot_reaches_VE_pct > 55 && SF.ocean.lot_reaches_VE_pct < 65, "row 16 ocean changed");
/* Review 1: the flood table gives one measure in every row, the share of lots that reach any A or V zone (row 16).
   Ocean, row 35 (VERIFIED-BY-FIXER): 406 of 411 here, 501 of 512 in the verifier's corrected run; both are about 98 in 100.
   Channels: NMB row 13, 679 of 682. River: 452 of 456. Waterway: 688 of 985 (297 wholly outside). */
must(SF.ocean.lot_reaches_high_risk === 406 && SF.icw.lot_reaches_high_risk === 688 && SF.icw.houses - 297 === 688, "row 16 or 35 reach counts changed");
const IN100 = (a, b) => Math.round(100 * a / b);
must(IN100(406, 411) === 99 && IN100(501, 512) === 98 && IN100(679, 682) === 100 && IN100(452, 456) === 99 && IN100(688, 985) === 70, "flood shares moved");
/* Row 21 (WF row 17): the tide, grouped to four bars. */
const TR = Object.fromEntries(TIDES.rows.map((r) => [r.station, r.mean_range_ft]));
must(TR["Springmaid Pier, Myrtle Beach (ocean)"] === 4.8 && TR["Cherry Grove (inside)"] === 4.47 && TR["Little River (town)"] === 4.25 && TR["Captain Alex's Marina, Parsonage Creek"] === 4.14, "row 21 ocean side changed");
must(TR["North Myrtle Beach, ICWW"] === 1.69 && TR["Myrtle Beach, Combination Bridge"] === 1.62 && TR["Socastee Bridge"] === 1.98 && TR["Conway, RR. bridge"] === 1.13, "row 21 waterway and river changed");
/* Row 19 (WF row 11): 13 crossings from the state line to Socastee, every fixed one 65 feet. */
const CROSS = BRIDGES.rows.filter((r) => r.kind !== "line");
must(CROSS.length === 13 && CROSS.filter((r) => r.kind === "fixed").every((r) => r.clear_ft === 65) && CROSS.filter((r) => r.kind === "fixed").length === 8, "row 19 bridges changed");
/* Row 30: waterfront houses with no HOA fee. Row 34: what a listing names against what it marks. */
const NV = L.names_vs_marked_waterfront;
must(NV.water_icw.name_it === 117 && NV.water_icw.marked_waterfront === 22 && NV.water_creek.name_it === 42 && NV.water_creek.marked_waterfront === 13, "row 34 changed");
must(NV.water_lake.name_it === NV.water_lake.marked_waterfront && NV.water_canal.name_it === NV.water_canal.marked_waterfront, "row 34 lake and canal changed");
const NO_HOA = 86;                                                                     // row 30, api_totals in the pull
/* The day the listings were counted, from the data file (owner, 2026-11-03: a count of homes for sale says the day it ran). */
const PULLED = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main: the design pass of the bar pages (garden-city.js), one card style for charts and offers, */
/* plain lists and tables under thin rules, the italic line at about half the H1's size, one block width of 720 px.        */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  /* Photos without a card frame; on a wide screen each entry's photo sits beside its text. */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `${S} figure.c3ph-hero img{aspect-ratio:4/3!important}`
  + `@media (min-width:1100px){${S} .c3-wf-entry{display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:var(--wf-rows);column-gap:2.5rem;align-items:start}`
  + `${S} .c3-wf-entry>*{grid-column:1}${S} .c3-wf-entry>figure.c3ph-hero{grid-column:2;grid-row:1/-1;margin:2.4rem 0 0!important;max-width:none!important}}`
  /* Tables without cards, under thin rules. */
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}`
  /* The selection guide: a plain list under thin rules. */
  + `${S} .c3-wf-pick{list-style:none;margin:1rem 0 1.6rem;padding:0;max-width:720px;border-bottom:${RULE}}`
  + `${S} .c3-wf-pick li{margin:0;padding:.7rem 0 .75rem;border-top:${RULE};display:grid;grid-template-columns:1.9rem minmax(0,1fr);gap:.2rem .6rem;align-items:baseline;line-height:1.45}`
  + `${S} .c3-wf-pick .w{color:var(--muted)}${S} .c3-wf-pick a{color:var(--navy);font-weight:600}`
  + `${S} .c3-wf-num{display:inline-flex;align-items:center;justify-content:center;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--brass,#c4783a);color:#fff;font-weight:700;font-size:.95rem;font-family:var(--sans);flex:none}`
  + `${S} .c3-wf-num::before{content:attr(data-n)}`
  + `${S} .c3-wf-h3{display:flex;align-items:baseline;gap:.6rem;font-family:var(--serif);font-size:1.35rem;color:var(--navy);margin:2.4rem 0 .7rem;line-height:1.3}`
  + `${S} .c3-wf-h3 .c3-wf-num{position:relative;top:-.1rem}`
  /* A plain list of rules under thin rules (the dock section). */
  + `${S} .c3-wf-rules{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px;border-bottom:${RULE}}`
  + `${S} .c3-wf-rules li{margin:0;padding:.7rem 0 .75rem;border-top:${RULE};color:var(--muted);line-height:1.55}${S} .c3-wf-rules strong{color:var(--navy)}`
  + `${S} .c3-wf-story{max-width:720px;margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.2rem;border-left:4px solid var(--brass);color:var(--muted);line-height:1.7}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  /* Each entry's homes strip (or its pill) closes the entry, with room before the next. */
  + `${S} .c3-wf-entry+.hx-strip,${S} .c3-wf-entry+.hx-strip+.hx-fallback{margin-bottom:2.2rem}${S} .c3-wf-entry+.hx-strip:not(:empty){margin-top:1.4rem}`
  + `@media (min-width:1100px){${S} .c3-wf-entry+.hx-strip{max-width:none!important}}`
  /* The end band (the same fix as garden-city.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  + `@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* The seven kinds of water.                                                      */

const KINDS = [
  { id: "oceanfront-houses", want: "The sun coming up out of the ocean, from your own porch", name: "Oceanfront houses" },
  { id: "oceanfront-buildings", want: "The same sunrise from a balcony, for far less", name: "A condo in an oceanfront building" },
  { id: "intracoastal-waterway", want: "A boat at your own dock that can travel north or south behind the coast", name: "The Intracoastal Waterway" },
  { id: "salt-marsh", want: "Crabbing off your own dock on the tide", name: "The salt marsh and tidal creeks" },
  { id: "cherry-grove-channels", want: "A boat out back, with a city boat ramp and an inlet to the ocean", name: "The Cherry Grove channels" },
  { id: "waccamaw-river", want: "Cypress, dark river water and a wildlife refuge", name: "The Waccamaw River" },
  { id: "lakes", want: "A pontoon boat on a lake, for less", name: "A lake or pond" },
].map((k, i) => Object.assign(k, { num: i + 1 }));
/* The number is drawn by CSS (data-n), so a reader sees it and the prose count does not take it for a figure. */
const num = (k) => `<span class="c3-wf-num" data-n="${k.num}" aria-hidden="true"></span>`;
const kindH3 = (k, text) => `<h3 id="${k.id}" data-toc="${k.name}" class="c3-wf-h3">${num(k)}<span>${text}</span></h3>`;
const PICK = `<ol class="c3-wf-pick" aria-label="The seven kinds of waterfront">` + KINDS.map((k) =>
  `<li>${num(k)}<span><span class="w">${k.want}:</span> <a href="#${k.id}">${k.name}</a></span></li>`).join("") + `</ol>`;

/* ---------------------------------------------------------------------------- */
/* Photos: records copied from the pages that licensed and checked them (photos.json, reused_from).                   */

const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}`)); must(r, `no photo record for ${name}`); return r; };
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const photo = (r) => lazy(PH.heroPhoto(r, { alt: r.alt, caption: r.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
const P_OCEAN = rec("oceanfront-houses-from-the-ocean"), P_TOWERS = rec("myrtle-beach-oceanfront-towers-from-the-beach");
const P_ICW = rec("little-river-waterfront-from-above"), P_MARSH = rec("garden-city-marsh-from-above");
const P_CG = rec("cherry-grove-channels-from-above"), P_RIVER = rec("murrells-inlet-wacca-wache-landing-from-above");
const P_BRIDGE = rec("socastee-swing-bridge-from-above"), P_LAKE = rec("plantation-lakes-docks");
const SHOWN = [P_OCEAN, P_TOWERS, P_ICW, P_MARSH, P_CG, P_RIVER, P_LAKE, P_BRIDGE];
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: p.caption.replace(/\.$/, "") })));

/* An entry's text and its photo in one block, so the photo can sit beside the text on a wide screen. */
const entry = (...kids) => { kids = kids.filter(Boolean); const k = kids.filter((x) => !x.includes('class="c3ph-hero"')).length;
  return `<div class="c3-wf-entry" style="--wf-rows:${"auto ".repeat(Math.max(k - 1, 0))}1fr">` + kids.join("") + `</div>`; };

/* ---------------------------------------------------------------------------- */
/* Charts.                                                                        */

/* What a house on each kind of water sold for (rows 1 to 5, 8, 2). No lake bar: row 7 is struck. */
const PRICE_CHART = G.bars([
  { name: "A house on the beach", value: 2175000, valueText: "$2.2 million" },
  { name: "A house on the Intracoastal Waterway", value: GW["Intracoastal Waterway"].on_water.median, valueText: "$1.3 million" },
  { name: "A house on the salt marsh, Garden City", value: GCMARSH.median, valueText: "$1.24 million" },
  { name: "A house on the Cherry Grove channels", value: CG.median, valueText: r1k(CG.median) },
  { name: "A house on the Waccamaw River", value: GW["Waccamaw River"].on_water.median, valueText: r1k(GW["Waccamaw River"].on_water.median) },
  { name: "Any house in Horry County", value: COUNTY_HOUSE, valueText: money(COUNTY_HOUSE), reference: true },
  { name: "A condo in an oceanfront building", value: CONDO.median, valueText: money(CONDO.median) },
], { caption: "On the beach, a house sold for the most and a condo for the least", nameLabel: "Kind of home and water", valueLabel: "Middle sale price", compact: true,
  note: "The middle sale price in the past year, from Horry County deed records. The gray bar is every house in the county, for comparison." });

/* How far the water drops at a dock (row 21), grouped to four bars. */
const TIDE_CHART = G.bars([
  { name: "The ocean, at Springmaid Pier", value: 4.8, valueText: "about 4.8 feet" },
  { name: "Cherry Grove, Little River and Murrells Inlet creeks", value: 4.47, valueText: "4 to 4.5 feet" },
  { name: "The middle of the waterway", value: 1.98, valueText: "1.6 to 2 feet" },
  { name: "The Waccamaw River at Conway", value: 1.13, valueText: "about 1 foot" },
], { caption: "At an ocean-side dock the water drops 4 feet or more, on the waterway about 2", nameLabel: "Where the dock is", valueLabel: "High tide to low", compact: true, max: 7, format: (v) => `${v} feet`,
  note: "The average change in water level from high tide to low, in NOAA's tide predictions. It happens about twice a day." });

/* Every crossing from the state line to Socastee (row 19, WF row 11). Names as WF's verifier allowed them. */
const NAME = { "US 17 bridge, Little River": "US 17 bridge, Little River", "Little River swing bridge (Sea Mountain Highway)": "Little River swing bridge",
  "Robert Edge Parkway bridge": "Robert Edge Parkway bridge", "Barefoot Landing swing bridge (Barefoot Resort Bridge Road)": "Barefoot Landing swing bridge",
  "SC 22 bridge": "SC 22 bridge", "Overhead cable car": "Cable car, about a mile south of SC 22", "Grande Dunes Boulevard bridge": "Grande Dunes Boulevard bridge",
  "Fixed highway bridge, Mile 360.5": "Grissom Parkway bridge", "Railroad bridge (bascule, opens)": "Railroad bridge, next to US 501", "US 501 bridge": "US 501 bridge",
  "Fantasy Harbour bridge (George Bishop Parkway)": "Fantasy Harbour bridge", "Socastee swing bridge": "Socastee swing bridge", "Fixed bridge at Socastee": "Highway bridge at Socastee" };
const HEIGHT = (r) => r.kind === "fixed" ? "65 feet, as reported" : r.kind === "cable car" ? "67 feet" : `${r.clear_ft} feet closed; it opens`;
must(CROSS.every((r) => NAME[r.name]), "a crossing has no short name");
/* Review 1: the cable car is Coast Pilot Mile 356.4, 0.9 waterway miles below the SC 22 bridge (355.5). The 360.5 bridge
   carries Robert M. Grissom Parkway (county road line S26-1315 crosses the county's waterway outline there; row 36). */
must(CROSS.find((r) => r.kind === "cable car").mile === 356.4 && CROSS.find((r) => r.name === "SC 22 bridge").mile === 355.5, "row 19 cable car moved");
const BRIDGE_TABLE = h.table(["Crossing, north to south", "Room under it"], CROSS.map((r) => [NAME[r.name], HEIGHT(r)]));

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const CP4 = "https://nauticalcharts.noaa.gov/publications/coast-pilot/files/cp4/CPB4_C12_WEB.pdf";
const TIDESRC = "https://tidesandcurrents.noaa.gov/";
const SOLAR = "https://gml.noaa.gov/grad/solcalc/solareqns.PDF";
const SCDES = "https://des.sc.gov/programs/bureau-coastal-management";
const R3012 = "https://www.scstatehouse.gov/coderegs/Chapter%2030.pdf";
const CFR = "https://www.ecfr.gov/current/title-33/chapter-I/subchapter-J/part-117/subpart-B/section-117.911";
const DNR = "https://www.dnr.sc.gov/fish/swfaqs.html";
const FWS = "https://www.fws.gov/refuge/waccamaw/about-us";
const NMBPARKS = "https://www.parks.nmb.us/473/Parks";

/* ---------------------------------------------------------------------------- */
/* The offers. Every button goes to /contact/; the site opens the short pop-up and sends the button's words.            */

const TOP = { title: "Tell us the boat and the budget. We send the homes on the water that fit.", label: "Send me waterfront homes that fit", href: "/contact/" };
const END = {
  h2: "Tell us the water you want.",
  p: "We line up the homes on it, and we check the dock, the depth at low tide and the flood zone before you tour.",
  label: "Set up a waterfront tour", href: "/contact/",
};
/* An entry's strip (a new wf-* place, BUILD.md) and its pill, shown while the strip is empty. */
const strip = (slug, name, head, place, label) => G.homes(slug, name, G.offer(place, { label }), head);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => PH.pageImages(P_ICW),
  title: "Waterfront Homes in Myrtle Beach: Prices From Ocean to Lake",
  description: "Waterfront homes in Myrtle Beach: what a home on the ocean, the Intracoastal, the marsh, a channel, a river or a lake costs, docks, flood, homes for sale.",
  ogTitle: "Waterfront homes in Myrtle Beach: what a house on each kind of water costs",
  crumb: "Waterfront homes",
  eyebrow: "Waterfront homes",
  h1: "Waterfront homes in Myrtle Beach:",
  h1em: "from the ocean to the lake, what each one costs.",
  sub: "From the sun coming up out of the ocean to a boat at your own dock, seven kinds of water, each with its own price.",
  heroCta: TOP,
  topOfferLine: TOP.title,
  author: "devin",
  shortAnswer: [
    `In the past year, a house on the beach sold for about $2.2 million at the middle, and one on the Intracoastal Waterway for about $1.3 million.`,
    `A condo in an oceanfront building sold for about $200,000, and every waterfront house for sale under $300,000 is on a lake or pond.`,
  ],
  sections: [
    { h2: "What does a waterfront home cost in Myrtle Beach?", toc: "Prices", id: "prices", html: () =>
      CSS + G.homesCss() +
      h.p(`The kind of water makes the biggest difference to the price. A house on the beach sold for about six times the middle house in Horry County. A house on the Waccamaw River sold for less than half of what one on the waterway did.`) +
      PRICE_CHART +
      h.p(`Lake houses have no bar, because the deeds do not show reliably which houses sit on a lake. On the day we counted, the ${OW.lake_or_pond_house.n} lake and pond houses for sale asked about $450,000 at the middle.`) },

    { h2: "Which kind of waterfront home fits you?", toc: "Seven kinds of water", id: "which", html: (bg) =>
      h.p(`Waterfront here means seven different purchases. Pick what you want from the water, and go to its entry.`) +
      PICK +

      /* 1. Oceanfront houses: rows 23 (corrected), 1 (corrected), 9, 16, 32. */
      entry(
        kindH3(KINDS[0], "Oceanfront houses: the sun comes up out of the ocean"),
        h.p(`From central Myrtle Beach south to Garden City, the beach faces the southeast. The sun rises over open sea there on every morning of the year.`),
        h.p(`Farther north the shore curves. From Windy Hill to Cherry Grove, the sun comes up over the North Myrtle Beach shore on about 100 to 125 mornings around June.`),
        photo(P_OCEAN),
        h.p(`An oceanfront house has no other house between its lot and the beach. ${OCEAN.houses} houses in Horry County stand in the first row like this.`),
        h.p(`In the past year, ${OCEAN.resold} of them resold, and the middle price was ${OCEAN.median}. Other houses within about two-thirds of a mile, off the water, resold for ${OCEAN.nearby}. Want the sand a walk away instead? Our guide to ${h.a("/buyers/homes-near-the-beach/", "houses near the beach")} counts them by distance, and our guide to ${h.a("/buyers/pool-homes/", "homes with a pool")} shows where the pools are.`),
        h.p(`On the day we counted, the houses for sale listed as on the ocean asked about $3.4 million at the middle. About 6 in 10 first-row lots reach FEMA's VE zone, where waves are expected.`)) +
      strip("wf-oceanfront-houses", "oceanfront houses", "Wake up on the beach: oceanfront houses for sale", "the oceanfront", "Book a showing on the oceanfront") +

      /* 2. A condo in an oceanfront building: rows 2 (corrected), 10 (corrected), 23. Condo prices and fees belong to
         /invest/condo-buildings/ and /invest/condos/: one entry and links. */
      entry(
        kindH3(KINDS[1], "A condo in an oceanfront building: the same sunrise for less"),
        h.p(`A condo in a building on the beach gives you the same sunrise from a balcony, with the sand right below. It costs far less than a house on the beach.`),
        photo(P_TOWERS),
        h.p(`${CONDO.sold} condos in oceanfront buildings resold in the past year, for about ${money(CONDO.median)} at the middle.`),
        h.p(`On the day we counted, about 1,100 condos were for sale in oceanfront buildings, and about 2 in 3 asked under $300,000.`),
        h.p(`Not every unit in an oceanfront building faces the ocean. Of those condos for sale, about 700 list a unit that faces it.`),
        h.p(`Each building has its own monthly fee and its own rules on renting. We compare ${h.a("/invest/condo-buildings/", "the HOA fees of the oceanfront buildings")} for you, and if you plan to rent, ${h.a("/invest/condos/", "the numbers on an oceanfront condo")}.`)) +
      strip("wf-oceanfront-condos", "condos that face the ocean", "The ocean from your balcony: condos facing the ocean", "condos that face the ocean", "Get the condos that face the ocean") +

      /* 3. The Intracoastal Waterway: rows 24, 20, 16, 33, 3. */
      entry(
        kindH3(KINDS[2], "Intracoastal Waterway homes: your boat at your own dock"),
        h.p(`From a dock on the Intracoastal Waterway here, your boat can head north to Norfolk, Virginia, or south to Florida without going out on the ocean.`),
        h.p(`The waterway runs behind the Atlantic coast. When you want the ocean, the way out is Little River Inlet, at the North Carolina line.`),
        `<p class="c3-wf-story">Our clients from New York bought beachfront in North Myrtle Beach near the waterway, so they could use their boat.</p>`,
        photo(P_ICW),
        h.p(`Flooding is lighter here than on the beach, the channels or the river. About 3 in 10 waterway house lots are wholly outside FEMA's high-risk flood zone.`),
        h.p(`About ${n(SF.icw.houses)} houses in Horry County have a lot that touches the waterway. In the past year, ${ICW_HOUSES} houses on it sold for about $1.3 million at the middle, about twice the houses nearby, in every stretch.`)) +
      strip("wf-waterway", "the Intracoastal Waterway", "Your boat out back: homes on the Intracoastal Waterway", "the waterway", "Book a showing on the waterway") +

      /* 4. The salt marsh: rows 25, 21, 14, 5, 6. Garden City owns its own marsh dock; this is the state rule. */
      entry(
        kindH3(KINDS[3], "Marsh front homes: crabs off your own dock"),
        h.p(`On salt water in South Carolina, you need no fishing license to go crabbing with three or fewer drop nets, fold-up traps or hand lines with bait. People call it chicken necking, and a dock on the marsh is a place to do it.`),
        h.p(`The marsh fills and drains with the tide twice a day. In Murrells Inlet's creeks, the water at a dock drops about 4 feet from high tide to low.`),
        h.p(`At low tide, a dock on a small creek may sit on mud. The width of the creek also limits the size of the dock the state allows. We check the depth at the dock at low tide, not at the showing.`),
        photo(P_MARSH),
        h.p(`In ${h.a("/submarkets/garden-city/", "Garden City")}, about ${GCMARSH.houses} houses are on the salt marsh or a tidal creek. The ${GCMARSH.sales} that sold in the past year went for about $1.24 million at the middle, about twice the other houses on that side of the beach road.`),
        h.p(`In ${h.a("/submarkets/murrells-inlet/", "Murrells Inlet")}, about 220 houses are on the salt marsh, almost all on the creek side of US 17 Business. Over three years, 21 of them sold for about $930,000 at the middle.`)) +
      strip("wf-marsh", "the salt marsh", "Crabbing water out back: homes on the salt marsh", "a marsh dock", "Have us check the depth at a marsh dock") +

      h.cta("Not sure which water fits your boat?", "Tell us its height and how deep it sits in the water. We name the waters, the docks and the bridges that work for it.", "Have us match the water to your boat", "/contact/", bg) +

      /* 5. The Cherry Grove channels: rows 26 (corrected), 21, 16 (NMB 13), 4. NMB owns the ramp and Cherry Grove itself. */
      entry(
        kindH3(KINDS[4], "Cherry Grove channel homes: a boat out the back door"),
        h.p(`In Cherry Grove, in ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach")}, rows of houses line channels dug through the marsh behind the beach. Many have a dock behind the house.`),
        h.p(`Cherry Grove has the city's boat ramp on the marsh, with boat access to the marsh and the ocean through Hog Inlet. Inside Cherry Grove, the water moves about 4.5 feet between high and low tide.`),
        photo(P_CG),
        h.p(`The trade-off is flooding. Of about 680 houses on the channels and the marsh edge, all but 3 are in FEMA's high-risk flood zone.`),
        h.p(`A house on the channels resold for about ${money(CG.median)} at the middle in the past year. A Cherry Grove house off the channels sold for about ${money(CGOFF.median)}, a group that includes oceanfront houses.`)) +
      strip("wf-cherry-grove-channels", "the Cherry Grove channels", "A boat out the back door: Cherry Grove channel homes", "Cherry Grove", "Get the Cherry Grove channel homes for sale") +

      /* 6. The Waccamaw River: rows 27 (corrected), 28, 16, 3. Conway owns the town and the riverwalk. */
      entry(
        kindH3(KINDS[5], "Waccamaw River homes: dark water, cypress and a wildlife refuge"),
        h.p(`The Waccamaw National Wildlife Refuge, set up in 1997, protects tidal freshwater wetlands and old rice fields along the Waccamaw and Great Pee Dee rivers.`),
        h.p(`The Fish and Wildlife Service calls them some of the most diverse freshwater wetlands in North America. Visitors paddle a blackwater swamp, walk among cypress trees and look for swallow-tailed kites and more than 200 other bird species.`),
        photo(P_RIVER),
        h.p(`Even at ${h.a("/submarkets/conway/", "Conway")}, the tide still raises and lowers the river about a foot. Nearly every river lot reaches the high-risk flood zone: all but 4 of about 460.`),
        h.p(`In the past year, ${GW["Waccamaw River"].on_water.n} houses on the river sold for about ${r1k(GW["Waccamaw River"].on_water.median)} at the middle, against about $330,000 for houses nearby that are not on the water.`)) +
      strip("wf-river", "the river", "Wake up on the river: riverfront homes for sale", "the Waccamaw River", "Get the homes on the Waccamaw River") +

      /* 7. A lake or pond: rows 37 (NB rows 218, 239, 251), 29, 11 (corrected), 13. No deed price and no flood share
         (rows 7 and 17 struck). /buyers/best-neighborhoods/ owns Plantation Lakes: one wow here, and the link. */
      entry(
        kindH3(KINDS[6], "Lakefront homes: a pontoon boat out back"),
        h.p(`In ${h.a("/buyers/best-neighborhoods/#plantation-lakes", "Plantation Lakes")} in Carolina Forest, owners take pontoon boats out on a lake with about 15 miles of shoreline. Many homes back onto the lake.`),
        h.p(`The owners' amenity area has day and overnight docks and a boat ramp. Boats on the lake are limited to 19 feet, with small motors.`),
        photo(P_LAKE),
        h.p(`On the day we counted, 9 houses on the lake there were for sale, asking about $780,000 to $1.3 million.`),
        h.p(`Most lake and pond houses for sale ask far less. Every waterfront house for sale under $300,000 was on a lake or pond.`),
        h.p(`The state's coastal dock permit covers salt water and the marsh, not a lake. On a lake, we read the community's rules on docks and boats before you offer.`)) +
      strip("wf-lakes-under-500k", "lakefront homes", "Lake living under $500,000", "lakefront homes", "Get the lakefront homes under $500,000") },

    { h2: "Can you build a dock on your waterfront lot?", toc: "Docks", id: "docks", html: (bg) =>
      h.p(`On salt water, you can if the lot and the creek are wide enough and the state issues a permit. Only ${OW.waterfront_houses_with_dock.n} of the ${OW.waterfront_houses.n} waterfront houses for sale list a dock. On canals, creeks, the marsh, rivers and the waterway, more than half do.`) +
      h.p(`A dock over the tidal marsh or a saltwater creek needs a permit from the state's coastal permit office, SCDES, before it is built. That office used to be part of DHEC.`) +
      h.p(`The permit covers tidal salt water, the marsh and other land the average high tide covers, and the beach. Docks on lakes and fresh water fall under other rules.`) +
      h.h3("Is the lot wide enough?") +
      h.p(`On a lot created after May 23, 1993, a private dock needs at least 75 feet of frontage at the marsh edge. On such a lot, under 50 feet means no dock of its own. Two neighbors with at least 50 feet each can share one.`) +
      h.p(`A waterfront subdivision may have a dock master plan, recorded with its map of lots, that shows which lots may get a dock and where. A plan is a guide, not a promise of a permit.`) +
      h.h3("How big can the dock be?") +
      h.p(`Under the state rule in force now, a dock on a tidal creek is sized by the creek's width, from marsh grass to marsh grass.`) +
      h.table(["Creek width", "Dock the state usually allows"], [
        ["Under 10 feet", "No dock"],
        ["10 to 19 feet", "No dock, except 50 square feet with no boat lift on a lot with over 500 feet of frontage, or where no dock is possible from the other side"],
        ["20 to 50 feet", "120 square feet"],
        ["51 to 150 feet", "160 square feet"],
        ["Over 150 feet", "600 square feet"],
      ]) +
      h.p(`Walkways, ramps and mooring piles do not count, and neither does a lift 8 by 20 feet or smaller. The table is not for docks on the waterway itself. The state has proposed new widths and sizes, and they need the legislature's approval.`) +
      h.h3("What about the fee, the wait, repairs and selling?") +
      `<ul class="c3-wf-rules">`
        + `<li><strong>The fee.</strong> The state charges $150 to apply for a private dock with a walkway 100 feet or shorter, and $250 for a longer one.</li>`
        + `<li><strong>The wait.</strong> Once the file is complete, the state posts a 15-day public notice. By law, the state has 30 days from the complete file to decide.</li>`
        + `<li><strong>Repairs.</strong> Normal repair of a standing dock, kept to its old size, needs only a request and a letter back from the state.</li>`
        + `<li><strong>Storms.</strong> A dock a storm destroys can be rebuilt to its old layout if the work is done within five years.</li>`
        + `<li><strong>Selling.</strong> An active permit can be transferred to the buyer for $25. Both owners sign.</li>`
        + `<li><strong>Other approvals.</strong> The owner may also need the Army Corps of Engineers, the city or county, and the HOA to approve.</li>`
        + `</ul>` +
      h.p(`If you would rather not ask an HOA about a dock or a boat, ${NO_HOA} waterfront houses for sale listed ${h.a("/buyers/no-hoa-homes/", "no HOA fee")} on the day we counted.`) +
      h.cta("Buying a house for its dock?", "We find the dock's permit, make sure it is active and can transfer to you, and read the subdivision's dock master plan before you offer.", "Have us look up the dock's permit before you offer", "/contact/", bg) },

    { h2: "Do you need flood insurance on a waterfront home?", toc: "Flood", id: "flood", html: () =>
      h.p(`A federally regulated lender requires ${h.a("/buyers/coastal-insurance/", "flood insurance")} on a waterfront home in FEMA's high-risk zone. How many lots are in that zone depends on the water.`) +
      h.table(["Water", "Lots that reach the high-risk flood zone"], [
        ["Cherry Grove channels", "Over 99%"],
        ["Waccamaw River", "About 99%"],
        ["Oceanfront houses", "About 98%"],
        ["Oceanfront houses, in the zone where waves are expected (VE)", "About 60%"],
        ["Intracoastal Waterway", "About 70%"],
      ]) +
      h.p(`For one-family houses with a FEMA policy in Horry County, the middle yearly cost was:`) +
      h.table(["Where the house is", "Middle cost a year"], [
        ["Outside the high-risk zone, a home you live in", "About $550"],
        ["Zone A or AE, a home you live in", "About $1,070"],
        ["Zone A or AE, a home you do not live in", "About $1,370"],
        ["Zone V, where waves are expected", "About $3,200"],
      ]) +
      h.p(`The zone of the lot is not always the zone of the house. FEMA and the lender go by where the house stands and by a survey of how high its floor is. We get both for the house you like.`) +
      h.p(`We also look for past flooding at the house, in the records listed in ${h.a("/buyers/undisclosed-flooding/", "how to find out if a house flooded")}. Wind and homeowners insurance are in ${h.a("/buyers/coastal-insurance/", "coastal home insurance")}.`) },

    { h2: "Can you get from your dock to the ocean by boat?", toc: "By boat", id: "by-boat", html: (bg) =>
      h.p(`Yes, from the waterway, the channels and the ocean-side creeks. From the waterway between Little River and Socastee, a marked channel about 2 miles long leads to the jetties of Little River Inlet.`) +
      h.p(`The sandbar at the inlet's mouth shifts, and its buoys are moved often. Murrells Inlet opens straight to the ocean between its own jetties, and boaters new to it are advised to enter with local knowledge.`) +
      h.h3("Which bridges does your boat pass under?") +
      h.p(`Thirteen crossings span the waterway in about 30 waterway miles from the state line to Socastee. Every fixed bridge has a reported clearance of 65 feet, so a boat under 65 feet tall passes each one.`) +
      h.p(`A boat taller than a swing bridge or the railroad bridge when it is closed waits for it to open.`) +
      BRIDGE_TABLE +
      h.p(`Under the federal rule, the Little River swing bridge opens on signal, except from 7 to 9 a.m. and 4 to 6 p.m. on weekdays that are not federal holidays. Then it opens only on the hour and the half hour.`) +
      h.p(`The Barefoot Landing and Socastee swing bridges have no special schedule in the federal rules, so they open when a boat signals.`) +
      photo(P_BRIDGE) +
      h.p(`The federal channel is designed for at least 12 feet of depth. The federal chart guide still warns of rock ledges along its edges from about Little River to US 501.`) +
      h.h3("How much does the water drop at the dock?") +
      TIDE_CHART +
      h.p(`On the ocean side, a lot that floats a boat at high tide may sit on mud at low tide.`) +
      h.h3("Can you keep a boat without a dock?") +
      h.p(`Yes. A deeded boat slip is another way to keep a boat on the water. Horry County has 322 slips sold as real estate, 223 of them in ${h.a("/submarkets/little-river/", "Little River")}.`) +
      h.p(`In the past year, slips at Mariner's Pointe there sold for about $16,500 at the middle.`) +
      h.cta("Will your boat make it to the ocean from this house?", "Tell us the boat's height and the house. We list every bridge between the dock and the inlet, and check the depth at the dock at low tide.", "Ask us which bridges stand between a house and the inlet", "/contact/", bg) },

    { h2: "Oceanfront or ocean view: what does waterfront mean in a listing?", toc: "Listing words", id: "listing-words", html: () =>
      h.p(`Oceanfront means the first row, with no house between the lot and the beach. A house with an ocean view can be across the street or a few rows back.`) +
      h.p(`A listing that names a water is often near it, not on it. Of ${NV.water_icw.name_it} houses for sale whose listing names the Intracoastal Waterway, only ${NV.water_icw.marked_waterfront} are marked as waterfront.`) +
      h.p(`Every house that names a lake or a canal is marked as waterfront. Before you pay for water, we check the lot line, the deed and the flood map.`) },
  ],
  faqTitle: "Waterfront home FAQ",
  faq: [
    { q: "Does the sun rise over the ocean in Myrtle Beach?", a: "Yes. From central Myrtle Beach south to Garden City, the sun rises over open sea every morning of the year. Farther north, from Windy Hill to Cherry Grove, it comes up over the shore on many mornings around June." },
    { q: "What is the cheapest waterfront in Myrtle Beach?", a: "A condo in an oceanfront building, which sold for about $200,000 at the middle. For a house, it is a lake or pond: every waterfront house for sale under $300,000 was on one." },
    { q: "How much more does a waterfront home cost?", a: "On the beach, a house resold for about $2.2 million at the middle, against about $615,000 for houses nearby off the water. On the Intracoastal Waterway, a house sold for about twice the houses nearby. On Garden City's salt marsh, a house sold for about twice the other houses on that side of the beach road." },
    { q: "Can I build a dock on my waterfront lot?", a: "On salt water, yes, if the lot and the creek are wide enough and the state issues a permit. Lots created since 1993 need 75 feet of frontage at the marsh edge." },
    { q: "Can I keep a boat without a dock?", a: "Yes. A deeded boat slip is another way, and most of the slips sold as real estate in Horry County are in Little River." },
    { q: "Do I need flood insurance on a waterfront home?", a: "A federally regulated lender requires it in FEMA's high-risk zone. Nearly every lot on the beach, the Cherry Grove channels and the Waccamaw River reaches that zone. On the Intracoastal Waterway, about 3 in 10 lots are wholly outside it." },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "OpenFEMA policies", href: NFIP },
    { name: "NOAA Coast Pilot 4", href: CP4 },
    { name: "NOAA tides", href: TIDESRC },
    { name: "NOAA solar equations", href: SOLAR },
    { name: "SCDES coastal permits", href: SCDES },
    { name: "SC Reg. 30-12", href: R3012 },
    { name: "33 CFR 117.911", href: CFR },
    { name: "SCDNR", href: DNR },
    { name: "Fish and Wildlife Service", href: FWS },
    { name: "North Myrtle Beach parks", href: NMBPARKS },
  ],
  sourcesNote: `Our counts: county parcels, flood maps and the past year's deeds; CCMLS listings in aggregate, counted ${PULLED}.`,
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "waterfront homes Myrtle Beach, oceanfront homes Myrtle Beach, oceanfront houses for sale Myrtle Beach, Intracoastal Waterway homes for sale Myrtle Beach, homes with boat dock Myrtle Beach, marsh front homes SC, Cherry Grove channel homes, Waccamaw River homes, lakefront homes Myrtle Beach, dock permit South Carolina, does the sun rise over the ocean in Myrtle Beach",
  about: "Waterfront homes on the Grand Strand, South Carolina: the ocean, the Intracoastal Waterway, the salt marsh, the Cherry Grove channels, the Waccamaw River and lakes",
});
