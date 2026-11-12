/* /hoa/ - Myrtle Beach HOA fees, and what each one covers: the typical monthly fee by kind of home,
 * what each fee includes, why an oceanfront condo fee is high, what a fee buys in a neighborhood of
 * houses, what 55+ communities charge and where the money goes, where fees are lowest, HOA complaints
 * in Horry County and how we check an association, and the rest of the HOA guide in one list.
 *
 * Batch 2026-11-b, Lane U. Version 1, 2026-11-09. The live page was hand-made (no spec); this is its
 * first spec, and it is the HOA hub. Plan: Blog-Brain batches/2026-11-b/hoa/PLAN.md. Demand:
 * must-answer.md. Facts: facts.md, VERIFIED rows and CORRECTED rows at the verifier's wording only
 * (VERIFY.md; struck wording in batches/2026-11-b/facts/hoa-struck.json).
 * Data: data/2026-11-b/hoa/ (findings.json, chart-fee-by-kind.json, table-covers.json, budgets.json).
 * Every fee, share, count and budget figure is read from those files here and checked against its
 * ledger row. Corrected rows are printed at the verifier's wording, with the row number beside each.
 * Kept from the live page: the H1 and the searched title words (data/headlines.json), the SC Consumer
 * Affairs complaint figures, "How we check an association before you offer" (four steps, plain words),
 * the end band word for word, the FAQ "Can I refuse to join an HOA?", the label "Have us review an HOA",
 * the breadcrumb and the hub role.
 * Cut from the live page (PLAN 1): "half the question", the claim about newer agents, the unsourced
 * "likely driver", the 15 "Read more" lines (now one grouped list), the FAQs that sibling pages own
 * (low fees, documents, state agency), "Verified July 2026".
 * No homes strip in the body: the edge's feed for /hoa/ (idx-lib/feeds.js HOA_COVERS) is dropped on a
 * page that has its own strips unless the feed is marked withStrips, so the page keeps the feed under
 * its opening and carries no G.homes slot (BUILD.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "hoa");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), CH = read("chart-fee-by-kind.json"), COV = read("table-covers.json"), BU = read("budgets.json");
const must = (ok, msg) => { if (!ok) throw new Error(`hoa.js: ${msg}`); };
const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r10 = (v) => Math.round(v / 10) * 10;
const NB = " ";

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const K = F.fees_by_kind;
const CONDO = K.condo, TOWN = K.townhouse, HOUSE = K.house, TOWER = K.condo_oceanfront_highrise, OFF = K.condo_off_ocean;
/* Row 1 (VERIFIED). The page prints the condo as "about $650" (PLAN 7: $645 is a figure nobody says
   aloud, and /hoa/tax-deductible/ and /buyers/cost-to-own/ already print $650). */
must(CONDO.median === 645 && TOWN.median === 290 && HOUSE.median === 95, "row 1 medians changed");
must(HOUSE.p25 === 70 && HOUSE.p75 === 135 && TOWN.p25 === 190 && TOWN.p75 === 425, "row 1 middle halves changed");
const CONDO_SAY = 650;
must(Math.abs(CONDO_SAY - CONDO.median) <= 5, "the condo figure the page prints is more than $5 from row 1");
/* The yearly condo figure is twelve times the monthly figure the page prints ($650), so the two agree on the
   page (review 1). Row 1's own year is 645 x 12 = $7,740; the printed $7,800 must stay within $100 of it. */
const HOUSE_YEAR = HOUSE.median_year, CONDO_YEAR = CONDO_SAY * 12;
must(HOUSE_YEAR === 1140 && Math.abs(CONDO_YEAR - CONDO.median_year) <= 100, "row 1 yearly figures changed");
/* Row 2 (VERIFIED). */
must(TOWER.median === 940 && TOWER.p25 === 750 && TOWER.p75 === 1185 && OFF.median === 515 && OFF.p25 === 410 && OFF.p75 === 685, "row 2 changed");
/* Row 6 (VERIFIED): about ten times. */
must(F.tower_vs_house_times >= 9.5 && F.tower_vs_house_times < 10.5, "row 6: retitle chart 1 if the ratio is not about ten");
/* Row 3 (VERIFIED). Gated golf: "about $200" only, no middle half (verifier). */
const HN = K.house_no_amenities, HP = K.house_pool_or_clubhouse, HG = K.house_gated, HGG = K.house_gated_golf;
must(HN.median === 70 && HP.median === 110 && HG.median === 160 && HGG.median === 200, "row 3 changed");
/* Row 4 (VERIFIED): what the fee includes. */
const cov = (seg, flag) => seg.covers_pct[flag];
must(cov(TOWER, "hoa_includes_electric") === 64 && cov(TOWER, "hoa_includes_insurance") === 82 && cov(OFF, "hoa_includes_electric") === 7, "row 4 tower and off-ocean cells changed");
must(cov(HOUSE, "hoa_includes_trash") === 46 && cov(HOUSE, "hoa_includes_insurance") === 4 && cov(TOWN, "lawn_care_included") === 84 && cov(TOWN, "hoa_includes_insurance") === 37, "row 4 house and townhouse cells changed");
must(cov(HGG, "security_service") === 90, "row 4: gated golf security 90 in 100");
/* The short answer: "most condo fees include insurance, water and sewer, trash and internet" (all condos, row 4's file). */
["hoa_includes_insurance", "hoa_includes_water_sewer", "hoa_includes_trash", "hoa_includes_internet"].forEach((f) => must(cov(CONDO, f) > 50, `short answer: ${f} is not most condos`));
const towerPower = Math.round(cov(TOWER, "hoa_includes_electric") / 10);
must(towerPower === 6, "row 4: about 6 in 10 tower fees include electricity");
/* Row 5 (VERIFIED): about 3 in 10 houses list no fee. */
const noFee = HOUSE.no_fee_or_blank / HOUSE.homes_for_sale;
must(Math.round(noFee * 10) === 3, "row 5 changed");
/* Rows 7 and 8 (row 7 CORRECTED: outside the Loris area, the house figure only; row 8 VERIFIED). */
const CO = F.census_owners;
must(CO.horry_house.median === 90 && Math.round(CO.horry_share_paying * 10) === 6 && Math.round(CO.rest_sc_share_paying * 3) === 1, "rows 7 and 8 changed");
/* Row 9 (VERIFIED). */
const FL = F.flood_policy_per_unit_year;
must(FL.all.per_unit_median === 405 && F.flood_policy_per_unit_month_median === 34 && r10(FL.zone_V.per_unit_median) === 550, "row 9 changed");
/* Row 10 (CORRECTED): shares of the main budget; no dollar total (it would need its year); "power, water, gas,
   phone and internet", never "in shared buildings". */
const DW = BU.del_webb_grande_dunes_2025.groups;
const dw = (k) => { must(DW[k], `row 10: no group ${k}`); return Math.round(DW[k].share_pct); };
const DWB = [
  ["Lawns and landscaping", dw("Lawns and landscaping")],
  ["The Grande Dunes Ocean Club", dw("Grande Dunes Ocean Club (beach club)")],
  ["The Grande Dunes master association", dw("Grande Dunes master association")],
  ["Staff", dw("Staff (wages, taxes, benefits)")],
  ["Power, water, gas, phone and internet", dw("Power, water, gas, phone and internet for shared buildings")],
  ["Savings for future repairs", dw("Savings for future repairs (reserves)")],
  ["Insurance", dw("Insurance")],
  ["Everything else", dw("Everything else (cleaning, pool, ponds, management, upkeep)")],
];
must(DWB.map((r) => r[1]).join() === "31,20,16,10,6,5,4,8", "row 10 shares changed");
must(DWB.reduce((t, r) => t + r[1], 0) === 100, "row 10 shares do not add to 100");
/* Row 12 (VERIFIED): about $400 a month for a house. Row 15 (CORRECTED): $315, the builder's list. Row 16: about $340. */
/* Rows 13 and 14 (VERIFIED): Myrtle Trace, $95, and where each $100 of income goes. Taxes (0.3) left out; the rest add to 100. */
const MT = BU.myrtle_trace_2026;
must(MT.dues_per_home_month === 95 && MT.homes === 518, "row 13 changed");
const mt = MT.groups_of_each_100_income;
const MTB = [
  ["Grounds and buildings", Math.round(mt["Grounds and buildings"])],
  ["Office and administration", Math.round(mt["Office, management and administration"])],
  ["Utilities, and the clubhouse's phone and internet", Math.round(mt["Utilities"])],
  ["The pool and the lakes", Math.round(mt["Pool and lakes"])],
  ["The clubhouse", Math.round(mt["Clubhouse"])],
  ["Left over after expenses", Math.round(mt["Left over after expenses"])],
];
must(MTB.map((r) => r[1]).join() === "54,12,8,6,2,18" && MTB.reduce((t, r) => t + r[1], 0) === 100, "row 14 shares changed");
/* Row 20 (CORRECTED): condo fees by area; houses by area counting a no-fee house; 29582 and 29575 more than half with none. */
const A = F.by_area_2026_11_02;
const AREA_CONDO = [
  ["Myrtle Beach, north end (29572)", A["29572"].condo_median],
  ["Myrtle Beach, central and south (29577)", A["29577"].condo_median],
  ["North Myrtle Beach", A["29582"].condo_median],
  ["Little River", A["29566"].condo_median],
  ["Murrells Inlet and Garden City", A["29576"].condo_median],
  ["Surfside Beach", A["29575"].condo_median],
  ["Carolina Forest", A["29579"].condo_median],
  ["Socastee", A["29588"].condo_median],
];
must(AREA_CONDO.map((r) => r[1]).join() === "875,775,700,525,525,525,425,375", "row 20 condo values changed");
must(A["29579"].house_median === 125 && ["29588", "29577", "29576", "29566", "29568"].every((z) => A[z].house_median === 100) && A["29526"].house_median === 75 && A["29527"].house_median === 75, "row 20 house values changed");
must(A["29582"].house_no_hoa / A["29582"].house_n > 0.5 && A["29575"].house_no_hoa / A["29575"].house_n > 0.5, "row 20: more than half list no fee in 29582 and 29575");

/* ---------------------------------------------------------------------------- */
/* The pictures.                                                                  */

/* Chart 1 (rows 1, 2, 6): four kinds of home, low to high, the middle half beside each. */
const half = (s) => `the middle half pay ${money(s.p25)} to ${money(s.p75)}`;
const FEE_CHART = G.bars([
  { name: "A house", value: HOUSE.median, valueText: money(HOUSE.median), feature: half(HOUSE) },
  { name: "A townhouse", value: TOWN.median, valueText: money(TOWN.median), feature: half(TOWN) },
  { name: "A condo off the ocean", value: OFF.median, valueText: money(OFF.median), feature: half(OFF) },
  { name: "A condo in an oceanfront tower", value: TOWER.median, valueText: money(TOWER.median), feature: half(TOWER) },
], { caption: "A condo in an oceanfront tower pays about ten times a house's fee", nameLabel: "Kind of home", featureLabel: "middle half", valueLabel: "Typical fee a month", compact: true, max: Math.round(TOWER.median * 1.15),
  note: `The middle monthly fee of homes for sale that list one, from our listings feed. Across all condos, it is about ${money(CONDO_SAY)}.` });
/* The chart's rows must be the data file's (chart-fee-by-kind.json is the researcher's chart file). */
must(CH.rows.find((r) => r.kind === "Condo in an oceanfront tower").median === TOWER.median && CH.rows.find((r) => r.kind === "Townhouse").median === TOWN.median, "chart-fee-by-kind.json disagrees with findings.json");

/* Chart 2 (row 3): houses, by what the neighborhood has. */
const HOUSE_CHART = G.bars([
  { name: "No shared amenities listed", value: HN.median, valueText: money(HN.median) },
  { name: "A pool or a clubhouse", value: HP.median, valueText: money(HP.median) },
  { name: "A gate", value: HG.median, valueText: money(HG.median) },
  { name: "A gate and golf", value: HGG.median, valueText: money(HGG.median) },
], { caption: "A house's fee goes up with what its neighborhood has", nameLabel: "What the neighborhood has", valueLabel: "Typical fee a month", compact: true, max: Math.round(HGG.median * 1.2),
  note: "The middle monthly fee of houses for sale that list one, by what the listing says the neighborhood has." });

/* Table 2 (row 4): what the fee includes, by kind of home. A pie whose fill is the share, then the number in 10. */
must(COV.columns.join("|") === "Condo in an oceanfront tower|Condo off the ocean|Townhouse|House (all with a fee)", "table-covers.json columns changed");
const ITEM = { "Insurance": "Insurance", "Water and sewer": "Water and sewer", "Trash": "Trash pickup", "Internet": "Internet", "Cable TV": "Cable TV", "Electricity": "Electricity", "Lawn care": "Lawn care", "Pest control": "Pest control" };
const pie = (pct) => {
  const r = 5, c = 2 * Math.PI * r, f = Math.max(0, Math.min(100, pct)) / 100;
  return `<svg class="pie" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="9" fill="#efe7da" stroke="#c4783a" stroke-opacity=".55" stroke-width="1"/>`
    + (f > 0 ? `<circle cx="10" cy="10" r="${r}" fill="none" stroke="#c4783a" stroke-width="${2 * r}" stroke-dasharray="${(f * c).toFixed(2)} ${c.toFixed(2)}" transform="rotate(-90 10 10)"/>` : "")
    + `</svg>`;
};
/* One label at every width (review 1). Soft hyphens let the two long words break on a narrow phone. */
const COLS = ["Ocean\u00adfront tower", "Condo off the ocean", "Town\u00adhouse", "House"];
const COVERS = (() => {
  const head = `<thead><tr><th scope="col" class="it">The fee includes</th>${COLS.map((l) => `<th scope="col">${l}</th>`).join("")}</tr></thead>`;
  const body = COV.rows.map((r) => {
    must(ITEM[r.item], `table-covers.json: no name for ${r.item}`);
    return `<tr><th scope="row" class="it">${ITEM[r.item]}</th>${r.pct.map((p) => `<td>${pie(p)}<span class="v">${Math.round(p / 10)}</span></td>`).join("")}</tr>`;
  }).join("");
  return `<figure class="c3-gchart c3-hoa-cov"><span class="cap">About how many of every 10 listings say the fee includes each item</span>`
    + `<table><caption class="sr">About how many of every 10 homes for sale with a fee say the fee includes each item, by kind of home</caption>${head}<tbody>${body}</tbody></table>`
    + `<figcaption>Homes for sale that list a fee, from our listings feed. A filled circle is all 10.</figcaption></figure>`;
})();
must(COV.rows.find((r) => r.item === "Electricity").pct[0] === cov(TOWER, "hoa_includes_electric"), "table-covers.json disagrees with findings.json");

/* Two budgets, side by side on a wide screen (rows 10, 13, 14). Plain lists under thin rules. */
const budget = (title, sub, rows) => `<div class="c3-hoa-bud"><p class="t">${title}</p><p class="s">${sub}</p><ul>`
  + rows.map(([k, v]) => `<li><b>${money(v)}</b><span>${k}</span></li>`).join("") + `</ul></div>`;
const BUDGETS = `<div class="c3-hoa-buds">`
  + budget("Myrtle Trace", "Of each $100 the association plans to take in", MTB)
  + budget("Del Webb at Grande Dunes", "Of each $100 in the association's main budget", DWB)
  + `</div>`;

/* The four steps (kept from the live page, in plain words). */
const STEPS = `<ol class="c3-hoa-steps">`
  + [
    ["Whether lenders will lend in the building.", `If most will not, your loan choices change before anything else. Our page on ${h.a("/invest/non-warrantable-condos/", "condos most lenders will not lend on")} explains why.`],
    ["The budget and the savings for repairs.", `We read the budget, the balance sheet and the ${h.a("/hoa/reserves/", "reserves")}, to judge whether the association can pay for the repairs ahead.`],
    ["The rules, against how you plan to live.", "Pets, parking, renting, a home business, what you may keep on the porch. We compare the rules with what you told us you want to do."],
    ["What we found, good and bad.", "We tell you all of it, including anything that argues against buying."],
  ].map(([b, t]) => `<li><strong>${b}</strong> ${t}</li>`).join("") + `</ol>`;

/* The rest of the HOA guide: every child page once, grouped; the link text is the question it answers. */
const GUIDE = [
  ["Money", [
    ["/hoa/dues-increases/", "How much can an HOA raise dues?"],
    ["/hoa/special-assessments/", "Who pays a special assessment when a condo sells?"],
    ["/hoa/reserves/", "How much should a condo have in reserves?"],
    ["/hoa/estoppel-and-transfer-fees/", "What HOA fees are due at closing?"],
    ["/hoa/tax-deductible/", "Are HOA fees tax deductible?"],
    ["/hoa/benefits/", "Are HOA fees worth it?"],
  ]],
  ["Rules and the law", [
    ["/hoa/south-carolina-hoa-laws/", "South Carolina HOA laws"],
    ["/hoa/violations-and-fines/", "Can an HOA fine you?"],
    ["/hoa/rental-restrictions/", "Can an HOA ban rentals?"],
    ["/hoa/liens-and-foreclosure/", "Can an HOA foreclose on your home?"],
    ["/hoa/developer-control-turnover/", "When does the builder hand over the HOA?"],
    ["/hoa/hoa-vs-poa/", "HOA vs POA, and what a regime fee is"],
  ]],
  ["Condo insurance and damage", [
    ["/hoa/master-insurance-ho6/", "Which insurance pays in a condo: the building's or yours?"],
    ["/hoa/who-pays-for-damage/", "Who pays for water damage in a condo?"],
  ]],
  ["Before you buy", [
    ["/hoa/documents/", "What to check in the HOA documents"],
  ]],
];
must(GUIDE.flatMap((g) => g[1]).length === 15, "the guide lists all 15 child pages");
GUIDE.flatMap((g) => g[1]).forEach(([u]) => must(fs.existsSync(path.join(__dirname, "..", "chapter3realty", ...u.split("/").filter(Boolean), "index.html")), `no page at ${u}`));
const GUIDE_HTML = `<div class="c3-hoa-guide">` + GUIDE.map(([g, items]) => `<div class="g"><p class="t">${g}</p><ul>${items.map(([u, t]) => `<li>${h.a(u, t)}</li>`).join("")}</ul></div>`).join("") + `</div>`;

/* ---------------------------------------------------------------------------- */
/* Design: the approved 2026-11-08 treatment (garden-city.js DESIGN_CSS): the italic line at about half the */
/* H1's size, key facts as short rows under rules on a phone, one card style for charts, the table and     */
/* offers, plain lists under thin rules, one block width of 720 px.                                         */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = "<style>"
  /* The contents list: no card, in columns between two thin rules (the approved look, as /hoa/documents/). */
  + `main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}`
  + `main#main nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){main#main nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:minmax(0,1fr)!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}${S} .c3-glance li>span:last-child{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.1rem .8rem;flex:1;min-width:0}${S} .c3-glance strong{font-size:1rem!important;flex:1 1 auto;min-width:0}${S} .c3-glance span.t{white-space:nowrap;flex:0 0 auto}}`
  /* The table of what the fee includes: in the chart card, thin rules, a pie and a number per cell. */
  + `${S} .c3-hoa-cov table{width:100%;border-collapse:collapse;font-family:var(--sans);color:var(--navy);font-size:1rem}`
  + `${S} .c3-hoa-cov .sr,${S} .c3-hoa-area .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  + `${S} .c3-hoa-cov th,${S} .c3-hoa-cov td{padding:.5rem .35rem;border-bottom:${RULE};text-align:center;vertical-align:middle;line-height:1.3}`
  + `${S} .c3-hoa-cov thead th{font-size:.9rem;font-weight:600;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .c3-hoa-cov th.it{text-align:left;font-weight:500;padding-left:0}${S} .c3-hoa-cov thead th.it{font-weight:600}`
  + `${S} .c3-hoa-cov tbody tr:last-child>*{border-bottom:0}`
  + `${S} .c3-hoa-cov td{white-space:nowrap;font-variant-numeric:tabular-nums}${S} .c3-hoa-cov td .pie{vertical-align:-3px;margin-right:.35rem}${S} .c3-hoa-cov td .v{font-weight:600}`
  /* A phone: the pie over its number, tight cells, and a slimmer card edge under 400 px, so all five columns
     stay inside the card at 320 px (review 1: the House column spilled 15 px). */
  + `@media (max-width:599px){${S} .c3-hoa-cov thead th{font-size:.875rem}`
  + `${S} .c3-hoa-cov th,${S} .c3-hoa-cov td{padding:.5rem .15rem}${S} .c3-hoa-cov td .pie{display:block;margin:0 auto .15rem}${S} .c3-hoa-cov th.it{font-size:.95rem;hyphens:auto}}`
  + `@media (max-width:399px){${S} .c3-gchart.c3-hoa-cov{padding-left:.6rem!important;padding-right:.6rem!important}${S} .c3-hoa-cov table{table-layout:fixed}`
  + `${S} .c3-hoa-cov th.it{width:27%;font-size:.875rem}${S} .c3-hoa-cov thead th{font-size:.8125rem;padding:.4rem 0}${S} .c3-hoa-cov th,${S} .c3-hoa-cov td{padding-left:.05rem;padding-right:.05rem}}`
  + `@media (max-width:359px){${S} .c3-hoa-cov th.it{width:26%;font-size:.8125rem}${S} .c3-hoa-cov thead th{font-size:.75rem}}`
  /* The two budgets: plain lists under thin rules, side by side from 900 px. */
  + `${S} .c3-hoa-buds{display:grid;grid-template-columns:1fr;gap:1.6rem;max-width:720px;margin:1.4rem 0 1.2rem}@media (min-width:900px){${S} .c3-hoa-buds{grid-template-columns:1fr 1fr;gap:2.2rem}}`
  + `${S} .c3-hoa-bud .t{font-family:var(--sans);font-weight:650;color:var(--navy);margin:0 0 .15rem;font-size:1.0625rem;line-height:1.35}${S} .c3-hoa-bud .s{color:var(--muted);margin:0 0 .5rem;font-size:1rem;line-height:1.4}`
  + `${S} .c3-hoa-bud ul{list-style:none;margin:0;padding:0;border-bottom:${RULE}}${S} .c3-hoa-bud li{display:grid;grid-template-columns:3.4rem 1fr;gap:.6rem;align-items:baseline;margin:0;padding:.5rem 0;border-top:${RULE};color:var(--navy);line-height:1.4}`
  + `${S} .c3-hoa-bud li b{font-variant-numeric:tabular-nums;font-weight:650}`
  /* The area table: plain, under thin rules (mkpage's h.table, flattened). */
  + `${S} .c3-hoa-area{max-width:720px;margin:1.2rem 0}${S} .c3-hoa-area table{width:100%;border-collapse:collapse;font-family:var(--sans);color:var(--navy);font-size:1rem}`
  + `${S} .c3-hoa-area th,${S} .c3-hoa-area td{text-align:left;padding:.5rem 0;border-bottom:${RULE};line-height:1.35}${S} .c3-hoa-area thead th{font-size:.95rem;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .c3-hoa-area td:last-child,${S} .c3-hoa-area th:last-child{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums;padding-left:1rem}${S} .c3-hoa-area tbody tr:last-child>*{border-bottom:0}`
  /* The four steps and the guide. */
  + `${S} .c3-hoa-steps{max-width:720px;margin:.6rem 0 1.2rem 1.4rem;padding:0;color:var(--muted);line-height:1.7}${S} .c3-hoa-steps li{margin:0 0 .7rem;padding-left:.2rem}${S} .c3-hoa-steps strong{color:var(--navy)}`
  + `${S} .c3-hoa-guide{display:grid;grid-template-columns:1fr;gap:1.2rem 2.4rem;max-width:720px;margin:1rem 0 .6rem}@media (min-width:760px){${S} .c3-hoa-guide{grid-template-columns:1fr 1fr}}`
  + `${S} .c3-hoa-guide .t{font-family:var(--sans);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;font-weight:650;color:var(--g-ink,#8a5226);margin:0 0 .3rem}`
  + `${S} .c3-hoa-guide ul{list-style:none;margin:0;padding:0}${S} .c3-hoa-guide li{margin:0;padding:.5rem 0;border-top:${RULE};line-height:1.4}${S} .c3-hoa-guide li:last-child{border-bottom:${RULE}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The end band: the edge writes the listings notice after it, so glass.js would draw it as the light top bar
     with ivory text (the same fix as garden-city.js and conway.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  /* "On this page": three short columns on a wide screen, so the list is not a tall card. */
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:1.6rem}}`
  /* One block width. */
  + `${S} .c3-gchart,${S} .c3-hoa-area,${S} .c3-hoa-buds,${S} .c3-hoa-guide{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

const areaTable = `<div class="c3-hoa-area"><table><caption class="sr">Middle monthly HOA fee of condos for sale, by area</caption><thead><tr><th scope="col">Area</th><th scope="col">Fee a month</th></tr></thead><tbody>`
  + AREA_CONDO.map(([a, v]) => `<tr><td>${a}</td><td>${money(v)}</td></tr>`).join("") + `</tbody></table></div>`;

/* The photo (this page's photos.json: USGS, public domain, copied from /hoa/documents/; looked at full size
   2026-11-09). It sits under the tower paragraph: houses and towers on one beach, the two ends of chart 1. */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("houses-and-towers-from-the-ocean", PHOTOS[0].caption);
ph.share("houses-and-towers-from-the-ocean");

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const LISTINGS = "https://chapter3realty.com/homes/map/";
const PUMS = "https://www2.census.gov/programs-surveys/acs/data/pums/2024/1-Year/";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const DWGD = "https://www.delwebbatgrandedunes.com/ResourceCenter/Download/48372~3384081";
const MTRACE = "https://myrtletracesc.org/wp-content/uploads/AnnualMeetingCommitteeReports/2026/2026AAnnualMeetingDocuments.pdf";
const SCDCA = "https://consumer.sc.gov/sites/consumer/files/Documents/HOA/2026_HOA_Complaint_Report.pdf";
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";

/* ---------------------------------------------------------------------------- */
/* The offers. Each one is tied to the question its section answered; no two share words. */

const TOP = { title: "Have us check what a home's fee covers", label: "Have us check what a fee covers", href: "/contact/" };
const END = {
  h2: "Looking at a place with an association?",
  p: "Send the community name. We read the documents and the financials and tell you what we found, before you are committed.",
  label: "Have us review an HOA", href: "/contact/",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => ph.pageImages(),
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "Myrtle Beach HOA Fees: About $95 a House, $650 a Condo",
  description: "Typical Myrtle Beach HOA fees by kind of home, from homes for sale: about $95 a month for a house, $650 for a condo, $940 on the ocean, and what each covers.",
  ogTitle: "Myrtle Beach HOA fees by kind of home, and what each one covers",
  crumb: "HOA Fees",
  eyebrow: "The HOA guide",
  /* The owner's headline (data/headlines.json), the second line as the italic line. */
  h1: "Myrtle Beach HOA fees,",
  h1em: "and what each one covers.",
  /* Row 8, said once, here. Its scope (outside the Loris area) is in the sources line (review 1). */
  sub: "About 6 in 10 homeowners in Horry County pay an HOA or condo fee. In the rest of South Carolina, about 1 in 3 do.",
  heroMedia: glance([
    { icon: "home", label: "A house", text: `About ${money(HOUSE.median)} a month` },
    { icon: "key", label: "A condo", text: `About ${money(CONDO_SAY)} a month` },
    { icon: "beach", label: "Oceanfront tower", text: `About ${money(TOWER.median)} a month` },
  ]),
  heroCta: TOP,
  topOfferLine: "Name the home. We tell you what its fee includes.",
  author: "devin",
  shortAnswer: [
    `The typical homeowners association (HOA) fee on the Grand Strand is about ${money(HOUSE.median)} a month for a house, ${money(TOWN.median)} for a townhouse and ${money(CONDO_SAY)} for a condo. In an oceanfront tower, a condo's fee is about ${money(TOWER.median)}.`,
    `A condo fee is higher because the owners share the building's bills. Most condo fees include insurance, water and sewer, trash and internet, and about ${towerPower} in 10 oceanfront tower fees include the power bill.`,
  ],
  sections: [
    { h2: "How much are HOA fees in Myrtle Beach?", toc: "Typical fees", id: "typical-fees", html: () =>
      DESIGN_CSS + ph.css() +
      h.p(`Myrtle Beach HOA fees depend most on the kind of home, and on whether a condo is on the ocean.`) +
      FEE_CHART +
      h.p(`Listings here give the fee by the month. Over a year, that is about ${money(HOUSE_YEAR)} for a typical house and about ${money(CONDO_YEAR)} for a typical condo.`) },

    { h2: "What do HOA fees cover in Myrtle Beach?", toc: "What fees cover", id: "what-fees-cover", html: () =>
      h.p(`A house fee rarely includes anything inside the house. A condo fee includes far more.`) +
      COVERS +
      /* Row 21 (CORRECTED), at "may also pay". The group (outside the Loris area) is in the sources line. */
      h.p(`The owner of a house buys its insurance apart from the fee. Owners of a one-family house here pay a middle of about $2,000 a year for it. A condo owner's own policy costs about $800 a year, and the condo fee may also pay the insurance on the shared building.`) +
      h.p(`For the fee, the tax and the insurance added up, see ${h.a("/buyers/cost-to-own/", "the yearly cost to own a home here")}.`) },

    { h2: "Why are HOA fees so high in Myrtle Beach?", toc: "Why condo fees are high", id: "why-so-high", html: (bg) =>
      h.p(`Myrtle Beach's highest HOA fees are in the oceanfront towers. Most of a ${money(TOWER.median)} tower fee goes to the building's insurance, its utilities and its upkeep.`) +
      h.p(`The building's federal flood policy is a small part of the fee. For condo buildings in Horry County with one, the middle cost was about ${money(FL.all.per_unit_median)} a unit a year, or about ${money(F.flood_policy_per_unit_month_median)} a month.`) +
      PHOTO +
      h.p(`Our ${h.a("/invest/condo-buildings/", "oceanfront condo building directory")} gives the fees building by building. Where the building's insurance stops and yours starts is on our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")}.`) +
      h.cta("Know what an oceanfront fee includes before you offer", "Send us the building's name. We get its budget and its savings for repairs, and tell you what the fee includes.", "Have us read the building's budget", "/contact/", bg) },

    { h2: "What does an HOA fee buy in a neighborhood of houses?", toc: "Neighborhoods of houses", id: "houses", html: () =>
      h.p(`A house's fee goes to what the neighborhood shares.`) +
      HOUSE_CHART +
      h.p(`In a gated golf community, about 9 in 10 houses for sale list a security service. In Prestwick, with a main gate off Highway 544, homes for sale list a monthly fee of $185 to $197. In Barefoot Resort's Leatherleaf, the fee is $385 to $398.`) +
      h.p(`Most homes for sale in Waterbridge, a neighborhood of houses with a pool complex and a clubhouse, list a monthly fee of about $150.`) +
      h.p(`Our pages on ${h.a("/buyers/gated-communities/", "gated communities")} and ${h.a("/buyers/golf-communities/", "golf communities")} compare the fees community by community.`) },

    { h2: "What are HOA fees in Myrtle Beach's 55+ communities?", toc: "55+ communities", id: "55-plus", html: (bg) =>
      h.p(`The 55+ communities we have checked charge from ${money(MT.dues_per_home_month)} a month in Myrtle Trace to about $400 for a house in Del Webb at Grande Dunes.`) +
      h.p(`In between, most listings in Del Webb North Myrtle Beach show $315 a month. The builder lists lawn care and a 175-channel TV package in the fee, and most listings name internet. In Seasons at Prince Creek West, the fee is about $340.`) +
      h.p(`Their public budgets show where each $100 goes at the two ends of that range. Myrtle Trace is a 55+ community of houses in Conway.`) +
      /* Rows 10 and 11 (CORRECTED): the Ocean Club charge is collected from owners and paid on. The page never
         says the listing fee includes it (struck list hoa 11). */
      BUDGETS +
      h.p(`In Del Webb at Grande Dunes, the second biggest share, about $20 of every $100 in the main budget, is the Grande Dunes Ocean Club charge. The association collects it from the owners and passes it on.`) +
      h.p(`Our ${h.a("/buyers/55-plus-communities/", "55+ communities guide")} compares the fees and what each community has.`) +
      h.cta("Some communities charge two fees", "A community inside a bigger one can charge its own fee and a master association fee. Name the home, and we find each fee and what each one includes.", "Have us add up every fee", "/contact/", bg) },

    { h2: "Where are HOA fees lowest in Myrtle Beach?", toc: "Lowest fees", id: "lowest", html: () =>
      h.p(`Condo fees are lowest inland, away from the ocean. Among condos for sale, the middle fee is about $375 a month in Socastee, against about $875 at the north end of Myrtle Beach.`) +
      areaTable +
      /* Rows 5, 20 (CORRECTED) and 28. The house medians by area are left out (review 1: they count a no-fee
         house and read against the $95); the areas where most houses have none stay. */
      h.p(`For a house, the lowest fee is often none. About 3 in 10 houses for sale list no HOA fee. In North Myrtle Beach and Surfside Beach, more than half of houses for sale list none.`) +
      h.p(`Older houses rarely have a fee. Of houses built before 1980, about 4 in 100 list one. Of houses built in 2010 or later, about 8 in 10 do. Our page on ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")} shows where they are.`) },

    { h2: "Are HOA complaints common in Horry County?", toc: "Complaints", id: "complaints", html: () =>
      h.p(`Yes. Of the HOA complaints in South Carolina's latest yearly report, 31 percent were about associations in Horry County, more than any other county. Horry also had the most complaints per person, and Georgetown County was second.`) +
      h.p(`The most common complaint here was that the HOA did not follow or enforce its own rules. Next came maintenance and repairs.`) +
      h.p(`What the state's HOA law requires of an association is on our page on ${h.a("/hoa/south-carolina-hoa-laws/", "South Carolina HOA laws")}. How far an association may raise its fee is on our page on ${h.a("/hoa/dues-increases/", "how much an HOA can raise dues")}.`) +
      h.h3("How we check an association before you offer") +
      h.p(`We check four things, in this order, every time.`) +
      STEPS },

    { h2: "What else should you know about HOAs in South Carolina?", toc: "The HOA guide", id: "guide", html: () =>
      h.p(`Each of these questions has its own page in our HOA guide.`) +
      GUIDE_HTML },
  ],
  faqTitle: "Myrtle Beach HOA fees FAQ",
  faq: [
    { q: "What is a regime fee?", a: "A regime fee is the condo fee. South Carolina's condo law calls a condo a regime, so its association fee is also called a regime fee." },
    { q: "Can I refuse to join an HOA?", a: "No, not when the home is in one. Under South Carolina law, the recorded declaration requires each owner to pay the association's assessments." },
    { q: "Can HOA fees go up?", a: "Yes. South Carolina's HOA law and condo law set no cap on dues, on a special assessment or on a fine. The limits are in the association's own recorded rules." },
  ],
  sources: [
    { name: "our listings feed", href: LISTINGS },
    { name: "Census PUMS 2024", href: PUMS },
    { name: "OpenFEMA", href: NFIP },
    { name: "Del Webb at Grande Dunes 2025 budget", href: DWGD },
    { name: "Myrtle Trace 2026 budget", href: MTRACE },
    { name: "SC Consumer Affairs", href: SCDCA },
    { name: "SC Code 27-30", href: T27_30 },
    { name: "SC Code 27-31", href: T27_31 },
  ],
  /* The method and the scope notes, moved out of the copy (review 1; CRAFT 5, "a verifier gives the fact"). */
  sourcesNote: `Fees: homes for sale in the Coastal Carolinas MLS feed, counted in aggregate. Census figures are for owners living in their home in Horry County outside the Loris area. `
    + `There, owners of a one-family house who pay an HOA fee report a middle of about ${money(CO.horry_house.median)} a month. Not legal advice.`,
  bottomCta: END,
  afterSources: () => { const c = ph.credits(); const GEN = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/; must(GEN.test(c), "photos.js changed its general credit line; recheck"); return c.replace(GEN, ""); },
  keywords: "Myrtle Beach HOA fees, average HOA fees Myrtle Beach, what do HOA fees cover, HOA fees per month, are HOA fees monthly or yearly, 55+ HOA fees Myrtle Beach, gated community HOA fees, Horry County HOA",
  about: "Homeowners association fees on the Grand Strand, South Carolina",
});
