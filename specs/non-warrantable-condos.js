/* /invest/non-warrantable-condos/ - warrantable vs non-warrantable condos in Myrtle Beach: what the word means, Fannie
 * Mae's published reasons, why so many oceanfront buildings here carry it (our count of county tax records, deeds and
 * listings for 43 oceanfront buildings), three buildings with the most owners' homes and their homes strips, every
 * building's public signs in one table, the loans that still close, whether to buy one, and how we check a building.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/invest-non-warrantable-condos/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and
 * CORRECTED rows only in the verifier's wording (VERIFY.md). Struck wording:
 * batches/2026-11-b/facts/invest-non-warrantable-condos-struck.json.
 * Data, never typed: data/2026-11-b/invest-non-warrantable-condos/ (findings.json, chart-owner-homes.json,
 * table-buildings.json, program.json), rebuilt 2026-11-10 on the CB verifier's fixed regime names (regimes-fixed.json;
 * identical to the verifier's raw/verify/findings-cb-fixes.json). Building sizes, bedrooms and listing flags for the
 * three named buildings: data/2026-11-b/invest-condo-buildings/building-fees.json (CB ledger row 4).
 * Rows used in the verifier's wording: 1 (the two companies), 2 (current on the day each loan closes), 3 (no list for
 * buyers to search), 5 (the hotel test with the name carve-out), 8 (minor suits), 9 (the repair carve-out), 11 (the
 * reserve line, Freddie Mac's words), 12 (most condo loans), 13 (the lender checks the insurance), 15 (one program, with
 * conditions), 16 and 17 (43 buildings), 19 (timeshare deeds; the other three owners unnamed), 22 (not used), 23, 24,
 * 25 (at least 6 VA), 26 (FHA and condo hotels), 27 (about 780 sales), 29 (the down payment, gated).
 * Fix round 1 (2026-11-10): rows 33 to 35, VERIFIED-BY-FIXER (wow.json from wow_lines.py): Maisons Sur-Mer's height,
 * floors and distance to the Dunes Club's course; Ocean Forest Plaza's floors and distance to Pine Lakes.
 * Never on this page: an interest rate or a payment; a down-payment number outside a sentence about a rental the buyer
 * will not use more than 14 days a year (PLAYBOOK A17); "warrantable" said of any named building; an owner's name;
 * the live page's two stories (not in the story bank); "licensed mortgage" anything; the wind pool counts (row 14:
 * no sourced meaning for a buyer); the self-employed line (no row; owner question in BUILD.md).
 * Design, as /invest/condotel-financing/ and /submarkets/garden-city/ (owner-approved 2026-11-08): the italic line at
 * about half the H1's size, one card style for the chart and the offers, plain tables and lists under thin rules, one
 * block width of 720 px, an offer after about every second section, each tied to that section.
 * Owner, 2026-11-10: every building sold on the page leads with a true, sourced wow; strip titles are bold and personal;
 * every request button links to /contact/ and the site opens the short pop-up.
 * Homes: three building strips in "Which Myrtle Beach condo buildings are non-warrantable?" (margate-tower exists in
 * batches/2026-10-b/data/idx-places.json; maisons-sur-mer and ocean-forest-plaza are new). The places, this URL in their
 * pages, and this URL's new feed with withStrips: true are for the lead (BUILD.md); until then each strip shows its pill.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/non-warrantable-condos/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-non-warrantable-condos");
const CBD = path.join(__dirname, "..", "data", "2026-11-b", "invest-condo-buildings");
const read = (dir, f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const F = read(DATA, "findings.json"), CH = read(DATA, "chart-owner-homes.json"), TB = read(DATA, "table-buildings.json");
const PG = read(DATA, "program.json").buildings, FEES = read(CBD, "building-fees.json").buildings;
const CITIES = new Set(read(CBD, "buildings.json").buildings.filter((b) => b.slug in read(DATA, "owners.json").buildings).map((b) => b.city));
const must = (ok, msg) => { if (!ok) throw new Error(`non-warrantable-condos.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const NB = " ";
const WORD = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

/* ---- Rows 16 and 17 (CORRECTED: 43 buildings, 11,471 units, 528 at 4.6 percent; 42 of 43). ---- */
const NBLD = F.buildings;
must(NBLD === 43 && F.units === 11471 && F.units_taxed_as_home === 528 && F.share_taxed_as_home === 4.6, "rows 16: findings.json is not on the fixed regime names");
must(F.building_share_taxed_as_home.median === 3.3 && F.buildings_75pct_or_more_not_home === 42, "rows 16, 17 moved");
must(F.buildings_under_75pct_not_home.join() === "maisons-sur-mer", "row 17: Maisons Sur-Mer is no longer the only building under 75 percent");
const OVER = F.buildings_75pct_or_more_not_home;
must([...CITIES].sort().join() === "Myrtle Beach,North Myrtle Beach", "the directory's buildings are no longer in Myrtle Beach and North Myrtle Beach only");
/* ---- Row 18: the inland control. ---- */
const SEA = F.control_seagate_village;
must(SEA.share === 49.2 && SEA.units === 716, "row 18 moved");
/* ---- Row 19 (VERIFIED as a floor): six buildings over 20 percent in a regime. Three are timeshare sellers or trustees
   (deed index); the other three stay unnamed. ---- */
const SE = F.single_entity_over_20pct;
must(SE.count_buildings === 6 && SE.buildings.join() === "anderson-ocean-club,avista,prince,sands-ocean,seawatch,towers-on-the-grove", "row 19 moved");
const TIMESHARE = ["anderson-ocean-club", "seawatch", "towers-on-the-grove"];
const OTHER_SE = SE.buildings.filter((b) => !TIMESHARE.includes(b));
must(OTHER_SE.length === 3 && SE.regimes.filter((r) => OTHER_SE.includes(r.building)).every((r) => r.kind === "company" && r.share > 20), "row 19: the three unnamed owners are no longer companies over 1 in 5");
/* ---- Row 20: rental-program flag on condos for sale. ---- */
const RP = F.rental_program_for_sale;
must(RP.for_sale === 965 && RP.in_program === 795 && Math.round(RP.in_program / RP.for_sale * 10) === 8, "row 20 moved");
const PULLED = new Date(read(DATA, "program.json").read);
must(!isNaN(PULLED), "program.json read is not a date");
const PULL_DAY = PULLED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
/* ---- Row 23 (CORRECTED: Maisons 27.8). ---- */
const HL = Object.fromEntries(F.home_like.map((x) => [x.building, x]));
must(HL["maisons-sur-mer"].taxed_as_home_pct === 27.8 && HL["ocean-forest-plaza"].taxed_as_home_pct === 23.8 && HL.margate.taxed_as_home_pct === 18.3, "row 23 moved");
must(HL["maisons-sur-mer"].in_program === 3 && HL["maisons-sur-mer"].for_sale === 14 && HL["ocean-forest-plaza"].in_program === 5 && HL["ocean-forest-plaza"].for_sale === 14 && HL.margate.in_program === 4 && HL.margate.for_sale === 8, "row 23 listing counts moved");
/* ---- Row 24: HUD's FHA list for Horry County. ---- */
must(F.hud.records === 117 && F.hud.by_status.Approved === 9, "row 24 moved");
/* ---- Rows 25 and 27, CORRECTED; findings.json does not hold them: typed at the verifier's values. ---- */
const VA_OK = 6;                                                        // row 25, CORRECTED: at least 6 of the 47
const DIR = 47;                                                         // the directory's buildings (rows 21, 25)
const SALES = 780;                                                      // row 27, CORRECTED: about 780 in the 43
/* ---- CB row 4 (CORRECTED; the listing flags are what the listing agent ticks). ---- */
const MS = FEES["maisons-sur-mer"], OFP = FEES["ocean-forest-plaza"], MG = FEES.margate;
must(MS.total === 14 && MS.beds["2"] === 14 && Math.round(MS.sqft_median / 100) * 100 === 1400, "CB row 4: Maisons Sur-Mer is no longer all two-bedrooms of about 1,400 sq ft");
must(OFP.total === 14 && OFP.flags.pets_allowed === 14 && OFP.flags.indoor_pool === 14 && OFP.flags.hoa_includes_electric === 12, "CB row 4: Ocean Forest Plaza's flags moved");
must(OFP.beds["1"] * 2 > OFP.total && Math.round(OFP.sqft_median / 100) * 100 === 600, "CB row 4: Ocean Forest Plaza is no longer mostly one-bedrooms of about 600 sq ft");
must(MG.total === 8 && (MG.beds["3"] || 0) + (MG.beds["4"] || 0) === 8, "CB row 4: Margate's units for sale are no longer all three and four bedrooms");
const FEES_DAY = new Date(read(CBD, "building-fees.json").pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
/* ---- Rows 33 to 35 (VERIFIED-BY-FIXER, fix round 1): the wow lines for Maisons Sur-Mer and Ocean Forest Plaza.
   wow.json is made by wow_lines.py from the county parcel layer, the FAA obstacle file and CB's listing points. ---- */
const WOW = read(DATA, "wow.json");
const DUNES = WOW.dunes_club.find((x) => x.from === "maisons-sur-mer"), PINE = WOW.pine_lakes.find((x) => x.from === "ocean-forest-plaza");
must(WOW.dunes_club.find((x) => x.from === "sands-ocean").miles_to_edge.toFixed(2) === "0.20", "row 33: the method no longer gives CB row 79's 0.20 mile for Sands Ocean Club");
must(DUNES.miles_to_edge < 0.5 && /DUNES GOLF/.test(DUNES.owner), "row 33: Maisons Sur-Mer is no longer under half a mile from the Dunes Club's parcel");
must(WOW["maisons-sur-mer"].floors.top_floor === 24 && WOW["maisons-sur-mer"].dof.some((d) => d.oas === "45-000344" && d.agl_ft === 300), "row 34: Maisons Sur-Mer's floors or FAA height moved");
must(PINE.miles_to_edge < 0.5 && /PINE LAKES/.test(PINE.legal) && WOW["ocean-forest-plaza"].floors.top_floor === 23, "row 35: Ocean Forest Plaza's Pine Lakes distance or top floor moved");

/* ---- The photo (record in data/2026-11-b/invest-non-warrantable-condos/photos.json: the USGS 2011 oblique aerial that
   /invest/condos/ shows, public domain, looked at full size again for this page). It shows oceanfront condo towers with
   their pools behind the dunes, beside the sentence that most oceanfront buildings are run for renting. Its caption names
   no building and no year. It is also the page's share image. ---- */
const PHOTOS = read(DATA, "photos.json").photos;
const TOWERS = PH.findPhoto(PHOTOS, "myrtle-beach-condo-towers-2011");
const TOWERS_PHOTO = PH.heroPhoto(TOWERS, { alt: TOWERS.alt, caption: TOWERS.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
const CREDITS = PH.creditsList([{ photo: TOWERS, caption: "Oceanfront condo towers in Myrtle Beach" }]);

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const FNMA_FR = "https://selling-guide.fanniemae.com/sel/b4-2.2-01/full-review-process";
const FNMA_INS = "https://selling-guide.fanniemae.com/sel/b7-3-03/master-property-insurance-requirements-project-developments";
const FRE = "https://guide.freddiemac.com/app/guide/section/5701.3";
const FRE_BULL = "https://guide.freddiemac.com/app/guide/bulletin/2026-C";
const FHFA = "https://www.fhfa.gov/about/fannie-mae-freddie-mac";
const NEWREZ = "https://www.newrezwholesale.com/media/b0hbzabm/smart-product-project-checklist-3-2026.pdf";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const HUDLIST = "https://entp.hud.gov/idapp/html/condlook.cfm";
const VA = "https://lgy.va.gov/lgyhub/condo-report";
const ASK = "/contact/";
const PHONE = "854.333.2135";

/* ---- V1: one chart (rows 16, 18, 23). One message in the title; the inland community is the comparison bar. ---- */
const pct = (v) => `${Math.round(v)}%`;
must(CH.bars.find((b) => b.label === "Maisons Sur-Mer").value === 27.8 && CH.bars.find((b) => /^All 43/.test(b.label)).value === 4.6, "chart-owner-homes.json moved");
const OWNER_CHART = G.bars([
  { name: "Maisons Sur-Mer, the most of any", value: HL["maisons-sur-mer"].taxed_as_home_pct, valueText: pct(HL["maisons-sur-mer"].taxed_as_home_pct) },
  { name: "Ocean Forest Plaza", value: HL["ocean-forest-plaza"].taxed_as_home_pct, valueText: pct(HL["ocean-forest-plaza"].taxed_as_home_pct) },
  { name: "Margate Tower", value: HL.margate.taxed_as_home_pct, valueText: pct(HL.margate.taxed_as_home_pct) },
  { name: `All ${NBLD} oceanfront buildings`, value: F.share_taxed_as_home, valueText: pct(F.share_taxed_as_home) },
  { name: "Seagate Village, inland, on FHA's list", value: SEA.share, valueText: pct(SEA.share), reference: true },
], {
  caption: "At the beach, few condos are the owner's home. Inland, about half are.",
  nameLabel: "Condo building", valueLabel: "Units taxed as the owner's home", max: 50, compact: true,
  format: (v) => pct(v),
  note: `Share of condo units taxed at South Carolina's 4 percent rate for an owner's main home, from Horry County's parcel records. An owner who lives in the unit but never applied is counted as not.`,
});

/* ---- V2: the building table (rows 16, 20, 23), every building with a county count, by name. ---- */
const homeCell = (v) => (v === 0 ? "None" : v < 1 ? "Under 1%" : pct(v));
/* One form throughout, "10 of 11", so the column reads at a glance (review 1). */
const progCell = (slug) => { const p = PG[slug]; if (!p || !p.for_sale) return "None for sale"; return `${p.in_program} of ${p.for_sale}`; };
must(TB.rows.length === NBLD && TB.rows.every((r) => PG[r.slug] !== undefined), "table-buildings.json and program.json disagree");
const NAMED = { margate: "margate-tower", "maisons-sur-mer": "maisons-sur-mer", "ocean-forest-plaza": "ocean-forest-plaza" };
const TABLE = `<div class="nw-tw" id="every-building"><table class="nw-tab"><caption>The ${NBLD} oceanfront buildings with a county count: units taxed as the owner's home, and condos for sale in a rental program on ${PULL_DAY}</caption>`
  + `<thead><tr><th scope="col">Building</th><th scope="col">Owner's home</th><th scope="col">Rental program</th></tr></thead><tbody>`
  + TB.rows.map((r) => `<tr><th scope="row">${NAMED[r.slug] ? h.a(`#${NAMED[r.slug]}`, r.name) : r.name}</th><td>${homeCell(r.taxed_as_home_pct)}</td><td>${progCell(r.slug)}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* ---- V3: the two-column comparison (rows 4, 7, 8, 10, 15). Newrez is named only in the sources. ---- */
const COMPARE = [
  ["One owner's share of the units, in a building of 21 or more", "Up to 20 percent", "Up to 49 percent, with conditions"],
  ["Units 60 days or more behind on dues", "Up to 15 percent", "Up to 25 percent"],
  ["Space used for business", "Up to 35 percent", "Up to 50 percent"],
  ["A lawsuit", "A suit naming the HOA, unless it is minor", "Case by case, never one about the structure"],
  ["Rules the building can miss", "None", "Up to 2"],
];
const COMPARE_TABLE = `<div class="nw-tw"><table class="nw-tab nw-cmp"><caption>Where one non-warrantable loan program says yes</caption>`
  + `<thead><tr><th scope="col">The test</th><th scope="col">Fannie Mae</th><th scope="col">One published program</th></tr></thead><tbody>`
  + COMPARE.map(([t, a, b]) => `<tr><th scope="row">${t}</th><td><span class="l">Fannie Mae</span>${a}</td><td class="yes"><span class="l">One published program</span>${b}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* ---- The three buildings with the most owners' homes (row 23). Each leads with what a buyer would want there, then
   the county record, then its homes strip under its own bold, true title. ---- */
const entry = (n, id, name, head, paras, strip) => `<div class="nw-b" id="${id}"><h3 class="nw-bh"><span class="nw-n">${n}</span><span>${head}</span></h3>${paras.map((p) => h.p(p)).join("")}</div>`
  + G.homes(id, name, G.offer(name, { label: `Send me condos at ${name}` }), strip);
const BUILDINGS = [
  /* CB rows 60 (CORRECTED wording) and 61; the height is CB's fact, said here once. Row 23 for the rest. */
  entry(1, "margate-tower", "Margate Tower", "Margate Tower: the tallest building in Myrtle Beach", [
    `Margate Tower rises about 330 feet, the tallest building in Myrtle Beach, with units up to the 29th floor. It stands in Kingston Plantation, on the oceanfront.`,
    `About 1 in 5 of its units are taxed as the owner's home, among the highest of any oceanfront building. ${WORD[HL.margate.in_program][0].toUpperCase() + WORD[HL.margate.in_program].slice(1)} of the ${WORD[HL.margate.for_sale]} units for sale say they are in a rental program.`,
  ], "Margate Tower condos, high up in Myrtle Beach's tallest building"),
  /* Rows 33 and 34 (VERIFIED-BY-FIXER); CB row 79 for the club. The club is private: never say an owner can play it. */
  entry(2, "maisons-sur-mer", "Maisons Sur-Mer", `Maisons Sur-Mer: ${WOW["maisons-sur-mer"].floors.top_floor} floors up, near a course the PGA Tour played`, [
    `Maisons Sur-Mer rises about 300 feet on Shore Drive, with homes up to the ${WOW["maisons-sur-mer"].floors.top_floor}th floor. It is under half a mile from the course of the Dunes Golf and Beach Club, which hosted the PGA Tour's 2026 Myrtle Beach Classic.`,
    `More than 1 in 4 of its units are taxed as the owner's home, the most of any oceanfront building in the county records. By the tax records, it is the only oceanfront building under the 75 percent investor share that makes a lender look harder.`,
    `Only ${WORD[HL["maisons-sur-mer"].in_program]} of the ${HL["maisons-sur-mer"].for_sale} units for sale say they are in a rental program. Every one is a two-bedroom of about ${n0(Math.round(MS.sqft_median / 100) * 100)} square feet.`,
  ], "Make Maisons Sur-Mer your two-bedroom beach home"),
  /* Row 35 (VERIFIED-BY-FIXER): Pine Lakes, from its own site and the county parcel layer. CB row 4 for the listing flags. */
  entry(3, "ocean-forest-plaza", "Ocean Forest Plaza", "Ocean Forest Plaza: an indoor pool, near Myrtle Beach's first golf course", [
    `Ocean Forest Plaza rises on the oceanfront with condos up to the ${WOW["ocean-forest-plaza"].floors.top_floor}rd floor. It is under half a mile from Pine Lakes, which opened in 1927 as Myrtle Beach's first golf course and is known as "The Granddaddy."`,
    `For January, there is the indoor pool. All ${OFP.total} condos for sale on ${FEES_DAY} listed one and allowed pets, and ${OFP.flags.hoa_includes_electric} said the HOA fee pays the power bill.`,
    `About 1 in 4 units are taxed as the owner's home. Only ${WORD[HL["ocean-forest-plaza"].in_program]} of those for sale list a rental program, and most are one-bedrooms of about ${n0(Math.round(OFP.sqft_median / 100) * 100)} square feet.`,
  ], "Bring the dog: oceanfront condos at Ocean Forest Plaza"),
].join("");

/* ---- The page's own styles. One card style (the glass surface of the chart and the offers); tables and lists sit on
   the page under thin rules. As /invest/condotel-financing/. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  + `${S} .c3-gchart,${S} .nw-tw,${S} .nw-plain,${S} .nw-b,${S} .c3-offer,${S} .nw-after{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}${S} .c3-gchart .v{font-weight:600}`
  /* tables: plain, under thin rules */
  + `${S} .nw-tw{margin:1.3rem 0 1.4rem}`
  + `${S} .nw-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .nw-tw caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem}`
  + `${S} .nw-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom;line-height:1.3}`
  + `${S} .nw-tw tbody th{text-align:left;font-weight:600;padding:.6rem .9rem .6rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top}`
  + `${S} .nw-tw td{padding:.6rem .8rem .6rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.4;font-variant-numeric:tabular-nums}`
  + `${S} .nw-tab:not(.nw-cmp) td{white-space:nowrap;width:24%}${S} .nw-tab:not(.nw-cmp) tbody th{font-weight:500}`
  + `${S} .nw-cmp tbody th{width:38%}${S} .nw-cmp td.yes{font-weight:600;color:${INK}}${S} .nw-tw td .l{display:none}`
  /* the comparison folds on a phone: the test, then each side under a small label */
  + `@media (max-width:599px){${S} .nw-cmp,${S} .nw-cmp tbody,${S} .nw-cmp caption{display:block;width:100%}`
  + `${S} .nw-cmp thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .nw-cmp tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:1rem;padding:.75rem 0;border-bottom:${RULE}}`
  + `${S} .nw-cmp th,${S} .nw-cmp td{display:block;border:0!important;padding:0!important;width:auto!important}`
  + `${S} .nw-cmp tbody th{grid-column:1/-1;padding-bottom:.35rem!important}${S} .nw-cmp td .l{display:block;font-size:.875rem;font-weight:400;color:var(--muted)}`
  /* the building table on a phone: smaller head words so three columns fit */
  + `${S} .nw-tab:not(.nw-cmp) thead th{font-size:.9rem}}`
  + `@media (max-width:599px){${S} .nw-tab:not(.nw-cmp){font-size:1rem}${S} .nw-tab:not(.nw-cmp) td{width:1%;padding-right:.7rem}${S} .nw-tab:not(.nw-cmp) td:last-child{padding-right:0}}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .nw-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .nw-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .nw-plain li:last-child{border-bottom:${RULE}}${S} .nw-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  + `${S} .nw-sub{font-family:var(--sans);font-size:.95rem;letter-spacing:.08em;text-transform:uppercase;color:${INK};font-weight:700;margin:1.6rem 0 .2rem}`
  /* the buildings: a numbered headline, two short paragraphs, then the strip or its pill */
  + `${S} .nw-b{margin:2.2rem 0 0;padding-top:1.4rem;border-top:${RULE}}`
  + `${S} .nw-bh{display:flex;align-items:baseline;gap:.65rem;font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:0 0 .7rem;line-height:1.3}`
  + `${S} .nw-n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:50%;background:rgba(196,120,58,.16);color:${INK};font-family:var(--sans);font-weight:700;font-size:.95rem;position:relative;top:-.12rem}`
  + `${S} .nw-b+.hx-strip:not(:empty){margin-top:1.1rem}${S} .nw-b+.hx-strip+.hx-fallback .c3-offer{margin:.4rem 0 .6rem}`
  + `${S} .nw-after{margin-top:2rem;padding-top:1.3rem;border-top:${RULE}}`
  + `${S} .nw-disc{font-family:var(--sans);font-size:.95rem;line-height:1.6;color:var(--muted);max-width:640px;margin:.4rem 0 1.2rem;padding:.75rem 1rem;border-left:3px solid var(--brass);background:rgba(255,255,255,.45);border-radius:0 12px 12px 0}`
  /* Work-arounds copied from /invest/condotel-financing/: the feed's search row at 320 px, the header phone at 1000 to
     1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="nw-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const sub = (t) => `<p class="nw-sub">${t}</p>`;
/* Row 30: the approved wording and the disclosure, word for word from the live page. */
const BRICKWOOD = "Chapter3 Realty Corp has a business relationship with BrickWood Mortgage (NMLS #189497). Because of this relationship, this referral may provide Chapter3 Realty a financial or other benefit. You are never required to use BrickWood. You are free to shop any lender.";
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage, not a lender. Loan rules change, and the lender confirms the building and the unit.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "What is the difference between a warrantable and a non-warrantable condo?", a: "A warrantable condo is in a building that meets Fannie Mae's project rules, so a conventional loan there can be sold to Fannie Mae or Freddie Mac. A non-warrantable condo is in a building that fails one of those rules." },
  { q: "Is there a list of non-warrantable condos in Myrtle Beach?", a: `Fannie Mae publishes no list for buyers to search. A lender reviews each building from its papers. Our table shows the public signs for ${NBLD} oceanfront buildings.` },
  { q: "Can I use an FHA or VA loan on a non-warrantable condo?", a: `Only in a building on that agency's own list. Of the oceanfront buildings in our directory, only Sea Mark Tower at the Caravelle is FHA-approved, and at least ${VA_OK} have an accepted VA record.` },
  { q: "How much do you need down for a non-warrantable condo?", a: "For a rental you will not stay in more than 14 days a year, about 25 percent down, against about 20 percent in a warrantable building. Figures from BrickWood Mortgage. For a home you will use, plan on a larger down payment." },
  { q: "Can a non-warrantable condo become warrantable?", a: "Yes. When the building fixes the reason, such as a new master policy or a lawsuit that ends, a lender can review it again." },
  { q: "Can I buy a non-warrantable condo as a second home?", a: "Yes, with cash or a loan made outside Fannie Mae's rules. Plan on a larger down payment than for a conventional loan." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Warrantable vs Non-Warrantable Condos: 43 Myrtle Beach Towers",
  description: `Warrantable vs non-warrantable condos in Myrtle Beach: Fannie Mae's rules, why ${OVER} of ${NBLD} oceanfront buildings raise its investor flag, and loans that still work.`,
  ogTitle: `Warrantable vs non-warrantable condos in Myrtle Beach: the rules, ${NBLD} oceanfront buildings checked, and the loans that still work`,
  crumb: "Non-Warrantable Condos",
  eyebrow: "Condo loans",
  h1: "Warrantable vs non-warrantable condos in Myrtle Beach",
  h1em: "Why so many oceanfront buildings carry the word, which loans still work, and how we check a building before you offer.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: `Fannie Mae's condo rules, checked against county records for ${NBLD} Myrtle Beach oceanfront buildings, and the loans that still close.`,
  heroMedia: CSS + G.homesCss(),
  heroCta: { title: "Send us the building. We read its papers before you make an offer.", label: "Ask about a building", href: ASK },
  author: "devin",
  shortAnswer: [
    `A non-warrantable condo is in a building that fails one of Fannie Mae's project rules, so the usual conventional loan will not work there. You can still buy it, with cash or with a loan made outside those rules.`,
    `On the Myrtle Beach oceanfront, the common sign is a building run for renting. In ${OVER} of the ${NBLD} oceanfront buildings we checked, at least 3 in 4 units are not taxed as the owner's home. Fannie Mae tells lenders to look harder at that.`,
  ],
  sections: [
    { h2: "What is a non-warrantable condo?", toc: "What it means", id: "what-it-means", html: () =>
      h.p(`A warrantable condo is in a building that meets Fannie Mae's project rules. A non-warrantable condo is in a building that fails one of them. Fannie Mae and Freddie Mac, ${h.ext(FHFA, "the two companies Congress created to buy mortgages from lenders")}, will not buy a loan in a building that fails their project rules.`) +
      h.p(`The rule is about the building, so a strong credit score does not change it.`) +
      plain([
        ["You can still buy it", "Pay cash, or use a loan the lender keeps or sells outside Fannie Mae and Freddie Mac. Each of those lenders makes its own building rules."],
        ["There is no list to look up", "Fannie Mae publishes no list for buyers to search. A lender checks each building in Fannie Mae's own system, from the papers the HOA (homeowners association) gives it."],
        ["The answer can change", "A building that fixes its problem can be reviewed again. A building's approval, or the lender's own certification of it, must be current on the day each loan closes."],
      ]) +
      h.p(`Every condotel, a condo building run like a hotel, is non-warrantable. Many non-warrantable buildings are not condotels. ${h.a("/invest/condotel-financing/", "Our condotel financing guide")} covers the hotel-run buildings.`) },

    { h2: "What makes a condo non-warrantable?", toc: "What makes one", id: "reasons", html: (bg) =>
      h.p(`One failed rule is enough. These are among the reasons ${h.ext(FNMA, "Fannie Mae lists")}, grouped by what you would see in the building. The first group is the one most oceanfront buildings here meet. It is about who owns the units and how they use them.`) +
      sub("The building is run for renting") +
      plain([
        ["Mostly investors and second homes", "When 75 percent or more of the units are owned as investments or second homes, the lender must look harder at whether the building runs as a hotel. That alone does not turn the building down."],
        ["Run like a hotel", "Any one of these counts: an HOA licensed as a hotel or resort, or papers that limit when owners may stay. Papers that require a rental pool or that owners share rental profits count too."],
        ["Hotel signs", `Hotel-type services, resort marketing and a hotel rating count too. A name with hotel, motel or resort in it counts, unless the word only refers to the building's past use.`],
        ["One owner with too many units", "In a building of 21 or more units, no one owner may hold more than 20 percent. Rented units count. A developer's vacant units that are for sale do not."],
        ["Timeshare weeks", `Fannie Mae and ${h.ext(FRE, "Freddie Mac")} will not take a timeshare building, where owners buy weeks.`],
      ]) +
      sub("The building's money") +
      plain([
        ["Dues not paid", `In Fannie Mae's ${h.ext(FNMA_FR, "full review")} of a condo building, no more than 15 percent of units may be 60 days or more behind on dues.`],
        ["Thin savings for repairs", `The budget must put at least 10 percent of dues income into reserves. ${h.ext(FRE_BULL, "Freddie Mac raises the test to 15 percent")} for applications from January 4, 2027. It says it made the change with its regulator and in alignment with Fannie Mae. Our ${h.a("/hoa/reserves/", "guide to HOA reserves")} has the details.`],
        ["Short master insurance", `The building's ${h.ext(FNMA_INS, "master policy")} must insure the full cost to rebuild. Its deductible can be at most 5 percent of that amount, a wind or storm deductible included, and at most $50,000 a unit.`],
        ["Too much business", "More than 35 percent of the space is commercial. Or the HOA earns more than 10 percent of its income from a business that serves the public, such as a restaurant or a spa."],
      ]) +
      sub("Hard stops") +
      plain([
        ["Critical repairs", `Problems that could cause a failure within a year count. Unfunded repairs over $10,000 a unit due within 12 months count too, unless an owner makes them or a special assessment pays for them. Sea walls, elevators, waterproofing and balconies are among the examples.`],
        ["A lawsuit", `A pending suit that names the HOA stops the loan. A suit that names the developer over safety or structure stops it too. Some minor suits are allowed when the lender finds no effect on the building's safety, structure, use or livability. Our ${h.a("/buyers/condo-in-litigation/", "guide to buying a condo in litigation")} covers suits.`],
      ]) +
      h.p(`For most condo loans, the building's budget and reserves are now checked in a full review.`) +
      h.cta("Heard \"non-warrantable\" from a lender?", "Tell us which building. We find which rule it fails and what that means for the loans you can use.", "Find the reason", ASK, bg) },

    { h2: "Why are so many Myrtle Beach oceanfront condos non-warrantable?", toc: "Why so many here", id: "why-so-many", html: () =>
      h.p(`Most of them are run for renting. Our directory has ${NBLD} oceanfront buildings with a county count, in Myrtle Beach and North Myrtle Beach. By the county's tax records, at least three of four units in ${OVER} of them are not the owner's home. That is one of the signs Fannie Mae tells a lender to look harder at.`) +
      TOWERS_PHOTO +
      h.p(`An inland condo community on FHA's approved list makes the difference plain. At Seagate Village, about half the units are taxed as the owner's home.`) +
      OWNER_CHART +
      h.p(`A lender asks whether a building full of rentals is run like a hotel. To a buyer who wants a rental, it is a good sign: the building is run for exactly that, even when the loan costs more.`) +
      h.p(`The listings say the same. About ${Math.round(RP.in_program / RP.for_sale * 10)} in 10 condos for sale in these buildings say the unit is in a rental program.`) +
      h.h3("Timeshare weeks and big owners") +
      h.p(`Timeshare weeks are sold by recorded deed in Anderson Ocean Club, Towers on the Grove and SeaWatch's towers. Fannie Mae and Freddie Mac both list timeshare buildings among the ones they will not take.`) +
      h.p(`In ${WORD[OTHER_SE.length]} other buildings, one company holds more than 1 in 5 of the units in at least one part of the building. That is over Fannie Mae's 20 percent limit, unless they are a developer's vacant units for sale.`) +
      h.h3("The master insurance rule") +
      h.p(`Take a building that would cost $20 million to rebuild. Its master policy's deductible can be at most $1 million, which is 5 percent. A larger wind deductible fails the rule, and the lender checks the policy.`) +
      h.p(`What your own condo owner's policy pays when the building's deductible comes due is in ${h.a("/hoa/master-insurance-ho6/", "our guide to the master policy and your own condo policy")}.`) },

    { h2: "Which Myrtle Beach condo buildings are non-warrantable?", toc: "Which buildings", id: "which-buildings", html: (bg) =>
      h.p(`Fannie Mae publishes no list for buyers to search. A lender decides for each building from its papers. What we can show you is the public signs a lender's review looks for, building by building.`) +
      h.p(`Three oceanfront buildings have the most units taxed as the owner's home. If you hope to use a regular loan, start with these. A lender's review of the papers still decides, and we read them before you offer.`) +
      BUILDINGS +
      `<div class="nw-after">` +
      TABLE +
      h.p(`Each building's fee, amenities and recent sales are in ${h.a("/invest/condo-buildings/", "our oceanfront condo building directory")}.`) + `</div>` +
      h.cta("Picked a building? Send it to us.", "We pull its budget, its master policy and its meeting minutes, and tell you what a lender will see, before you offer.", "Have us check my building", ASK, bg) },

    { h2: "Can you get a loan on a non-warrantable condo?", toc: "The loans that work", id: "loans", html: () =>
      h.p(`Yes. Cash works, and so do loans a lender keeps or sells outside Fannie Mae and Freddie Mac. Each of those lenders writes its own building rules. One published program shows how far apart the rules can be.`) +
      COMPARE_TABLE +
      plain([
        ["A loan made outside Fannie Mae's rules", "The lender keeps the loan or sells it to other investors. These loans often cost more than a conventional loan."],
        ["A DSCR loan", `It qualifies on the unit's rent instead of your income. Our ${h.a("/invest/strategies/dscr-loans/", "DSCR loan guide")} covers it.`],
        ["Cash", "No lender reviews the building."],
        ["FHA", `FHA works only in a building on ${h.ext(HUDLIST, "HUD's approved list")}. Of its ${F.hud.records} Horry County records, ${F.hud.by_status.Approved} are approved. In our directory of oceanfront buildings, the only approved one is Sea Mark Tower, one of the Caravelle's nine buildings. FHA will not insure a loan on a condotel, and it will not approve a condo building that is a condo hotel or has a required rental pool.`],
        ["VA", `A VA loan is for a home you will live in. At least ${VA_OK} of the ${DIR} buildings in our full oceanfront directory have an accepted record on ${h.ext(VA, "the VA's condo list")}. Our ${h.a("/buyers/va-loans/", "VA loan guide")} and ${h.a("/buyers/programs/", "buyer programs guide")} have more.`],
      ]) +
      h.h3("How much do you need down?") +
      h.p(`For a rental you will not stay in more than 14 days a year, plan on about 25 percent down in a non-warrantable building. In a warrantable one, plan on about 20 percent. Figures from BrickWood Mortgage.`) +
      h.p(`For a home or a second home you will use yourself, plan on a larger down payment than a conventional loan asks.`) +
      h.h3("Who makes these loans") + h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, arranges these loans through wholesale lenders that accept non-warrantable buildings.`) +
      `<p class="nw-disc">${BRICKWOOD}</p>` },

    { h2: "Should you buy a non-warrantable condo?", toc: "Should you buy one", id: "should-you-buy", html: (bg) =>
      h.p(`Yes, when the building's reason is one you can live with and the loan fits your plan. What you gain, and what it costs you:`) +
      sub("What you gain") +
      plain([
        ["A building run for renting", "A building full of investors is run for what a rental owner wants."],
        ["Units that sell", `About ${n0(SALES)} units sold one at a time by recorded deed in a year, in the ${NBLD} directory buildings with a county count.`],
        ["A reason that can be fixed", "A new master policy, a lawsuit that ends or dues collected can bring a building back. A lender then reviews it again."],
      ]) +
      sub("What it costs you") +
      plain([
        ["More cash at closing", "Plan on a larger down payment than a conventional loan, and often a higher cost."],
        ["Fewer lenders, now and when you sell", "Fewer lenders make these loans, and each has its own limits. Your next buyer needs one too, unless they pay cash."],
        ["Some reasons stop every loan", "A critical repair or a suit over the structure stops Fannie Mae loans. One published non-warrantable program will not take a suit over the structure either."],
      ]) +
      h.p(`Whether a beach condo makes a good rental at all is in ${h.a("/invest/condos/", "our guide to Myrtle Beach condos as investments")}.`) +
      h.cta("Weighing one building as a rental or a beach home?", "Tell us the building and how you will use it. We tell you its reason, the loans that fit and what we would watch, before you offer.", "Help me weigh a building", ASK, bg) },

    { h2: "How do you find out if a condo is warrantable before you make an offer?", toc: "How we check", id: "how-we-check", html: () =>
      h.p(`We find out for you, before you make an offer. Our agents read the same papers a lender's review reads:`) +
      plain([
        ["The lender questionnaire", "The HOA's answers to the questions a lender asks about the building."],
        ["The budget and reserves", "What goes into savings for repairs, against the 10 percent test."],
        ["The master policy", "What it insures and how big its deductible is, wind included."],
        ["The minutes and any special assessment", "Repairs the board has talked about, and what owners have been asked to pay."],
        ["Any lawsuit", "Who is suing whom, and over what."],
        ["The county's records", "Whether one owner holds a block of units, and whether timeshare weeks are sold in the building."],
      ]) +
      h.p(`A loan officer at our preferred lender then tells us how a lender will read it. You know before you pay for an appraisal or an inspection. The papers themselves are in ${h.a("/hoa/documents/", "our guide to HOA documents")}.`) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([TOWERS]) + LEGAL,
  pageImages: () => PH.pageImages(TOWERS),
  faqTitle: "Non-warrantable condo FAQ",
  faq: FAQ,
  sources: [
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
    { name: "Fannie Mae B4-2.2-01", href: FNMA_FR },
    { name: "Fannie Mae B7-3-03", href: FNMA_INS },
    { name: "Freddie Mac 5701.3", href: FRE },
    { name: "Freddie Mac 2026-C", href: FRE_BULL },
    { name: "FHFA", href: FHFA },
    { name: "Newrez checklist", href: NEWREZ },
    { name: "County parcels", href: PARCELS },
    { name: "County deeds", href: DEEDS },
    { name: "HUD condo list", href: HUDLIST },
    { name: "VA condo report", href: VA },
    { name: "FAA obstacle file", href: "https://aeronav.faa.gov/Obst_Data/DAILY_DOF_DAT.ZIP" },
    { name: "Pine Lakes", href: "https://pinelakes.com/" },
  ],
  sourcesNote: `Our counts: county parcels for ${NBLD} buildings, the deed index and our listing feed on ${PULL_DAY}, in total only. A unit taxed at 4 percent counts as a home, so the share is a floor.`,
  bottomCta: { h2: "Love an oceanfront condo but not sure a loan will work?", p: `Call ${PHONE}, or tell us which one. We tell you why it is non-warrantable, if it is, and which loans fit, before you make an offer.`, label: "Send us the building", href: ASK },
  keywords: "non-warrantable condo Myrtle Beach, warrantable vs non-warrantable condo, what makes a condo non-warrantable, non-warrantable condo list, non-warrantable condo loan, non-warrantable condo down payment, Fannie Mae condo requirements, Fannie Mae single entity ownership, condo master policy deductible Fannie Mae",
  about: "Non-warrantable condos: Fannie Mae's condo project rules and the oceanfront condo buildings of Myrtle Beach and Horry County, South Carolina",
});
