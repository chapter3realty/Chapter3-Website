/* /hoa/master-insurance-ho6/ - the condo master policy and the HO-6 on the Grand Strand: what each one insures,
 * whether the building's policy reaches inside the unit (bare walls, single entity, all in), how much HO-6 a
 * lender wants (Fannie Mae), what a storm deductible could cost one owner, flood (the building's policy and a
 * unit policy), and what we read before you buy.
 *
 * Batch 2026-11-b, Lane U. Version 1, 2026-11-10. The live page was hand-made (no spec); this is its first spec.
 * Plan: Blog-Brain batches/2026-11-b/hoa-master-insurance-ho6/PLAN.md. Demand: must-answer.md.
 * Facts: facts.md, VERIFIED rows and CORRECTED rows at the verifier's wording only (VERIFY.md; struck wording in
 * batches/2026-11-b/facts/hoa-master-insurance-ho6-struck.json). Row 8 (the $1,000 loss assessment figure) is
 * STRUCK: the page prints no dollar figure for it, only the verifier's sentence.
 * Data: data/2026-11-b/hoa-master-insurance-ho6/findings.json and chart-deductible-share.json (OpenFEMA policies
 * and claims; build_findings.py). Row 19's fix: pull_nfip_claims.py now pulls the RCBAP codes H and L too, and
 * build_findings.py counts them with A, so the storm table matches the verifier's figures (checked below).
 * Reused: data/2026-11-b/hoa/rcbap.json (row 11), fees-by-kind.json (row 25), and
 * data/2026-11-a/buyers-cost-to-own/pums-2024-1yr.json (row 10).
 * Kept from the live page: the opening idea (two policies, the recorded papers say which kind), the list of what
 * a buyer pictures inside a unit, "it pays your share, up to its limit, and nothing above it", "get the papers
 * first, then have the policy written once, at the right size", the papers we read, the FAQ on loss assessment.
 * Cut: the deductible split and lien detail (/hoa/who-pays-for-damage/ owns them; one sentence and a link),
 * "where the line falls", "the gap", "meet in the middle", "that is a big number to carry".
 * Sibling owners: who-pays-for-damage (who pays after damage), special-assessments (what an assessment is),
 * /hoa/ (the fee), coastal-insurance (houses, the wind pool), landlord-insurance (rentals).
 * No homes strip in the body: the site's edge puts its feed for this URL under the opening (BUILD.md asks the
 * lead for a bolder title for it).
 * Fix round 1 (REVIEW-1.md): the flood section opens with whether an HO-6 covers flood (row 29, FEMA FloodSmart)
 * and when to add a unit policy (rows 14, 30, 16, 18); the kinds chart is cut (it restated the bullets); the
 * papers list keeps each row's text and link in one span.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/master-insurance-ho6/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "hoa-master-insurance-ho6");
const read = (f, dir = DATA) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const F = read("findings.json"), CH = read("chart-deductible-share.json");
const CLAIMS = read("raw/nfip-claims-horry-condo.json");
const HUB = path.join(__dirname, "..", "data", "2026-11-b", "hoa");
const RC = read("rcbap.json", HUB), FEES = read("fees-by-kind.json", HUB);
const PUMS = read("pums-2024-1yr.json", path.join(__dirname, "..", "data", "2026-11-a", "buyers-cost-to-own"));

const must = (ok, msg) => { if (!ok) throw new Error(`master-insurance-ho6.js: ${msg}`); };
const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const near = (v, step) => money(Math.round(v / step) * step);
const mil = (v) => `$${(Math.round(v / 1e5) / 10).toFixed(1)} million`;
const inTen = (s) => Math.round(s * 10);

/* ---------------------------------------------------------------------------- */
/* The facts, read from the data and checked against the ledger.                  */

/* Row 10 (VERIFIED, reused): owners' own insurance, condo buildings of 3 or more homes. */
const OWN = PUMS.groups.apartment_building_3plus.INSP.median;
must(OWN === 800, "row 10 says $800");
/* Row 11 (VERIFIED, reused): the building's flood policy, a unit a year. */
const RCB_UNIT = RC.all.per_unit_median;
must(RCB_UNIT === 405, "row 11 says $405");
/* Row 25 (VERIFIED, reused): oceanfront condos for sale whose fee lists insurance. */
const OCEAN_INS = inTen(FEES.segments.condo_oceanfront.covers.hoa_includes_insurance.share_of_with_fee);
must(OCEAN_INS === 8, "row 25 says 8 in 10");
/* Rows 12, 13, 14 (OpenFEMA, the association's building flood policies). */
const R = F.rcbap;
must(R.policies === 1172 && R.deductible_counts["1250"] === 832 && R.deductible_counts["25000"] === 105, "row 12 counts changed");
must(R.with_replacement_cost === 702 && R.meets_80pct_or_max === 701 && R.at_250k_per_unit_cap === 276, "row 13 counts changed");
must(R.with_contents_coverage === 151, "row 14 count changed");
/* Row 18: flood policies on one unit. */
const U = F.unit_policies;
must(U.policies === 1078 && U.cost_median === 494 && U.cost_p25 === 369 && U.cost_p75 === 642 && U.zone.X === 807, "row 18 counts changed");
const X_SHARE = Math.round(U.zone.X / U.policies * 4);
must(X_SHARE === 3, "row 18: three in four outside the high-risk zones");
/* Row 20 (CORRECTED): the worked example, without the struck $1,000 bar. */
const EX = F.example;
must(EX.replacement_cost_per_unit === 130775 && EX.share_1pct === 1310 && EX.share_2pct === 2615 && EX.share_5pct === 6540, "row 20 example changed");
must(CH.bars.length === 3 && !CH.bars.some((b) => /loss assessment/i.test(b.label)), "chart-deductible-share.json still has the struck bar (row 8)");
must(CH.bars.map((b) => b.value).join() === [EX.share_1pct, EX.share_2pct, EX.share_5pct].join(), "the chart file and findings.json disagree");
/* Row 19 (CORRECTED): association building claims are codes A, H and L. The verifier's figures. */
const EV = F.claims_by_event;
const STORMS = [["Hurricane Hugo", 232, 17131447], ["Hurricane Matthew", 113, 7654476], ["Hurricane Florence", 39, 8380786], ["Hurricane Ian", 101, 8211380]];
for (const [k, c, p] of STORMS) must(EV[k] && EV[k].A_claims === c && EV[k].A_paid === p, `row 19: ${k} should be ${c} claims and $${p}`);
must(EV["Hurricane Ian"].U_claims === 6, "row 19: Ian unit claims 6");
/* The year of each storm, from its claims' dates of loss (the most common year). */
const yearOf = (ev) => {
  const c = {};
  for (const r of CLAIMS.rows) if (r.floodEvent === ev) c[r.yearOfLoss] = (c[r.yearOfLoss] || 0) + 1;
  return +Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
};

/* ---------------------------------------------------------------------------- */
/* The pictures.                                                                  */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";

/* Table 1 (rows 1, 9, 28): who insures what. Plain words in every cell. */
const WHO = [
  ["The roof, the outside walls, the halls, the elevators and the pool", "Yes", "No"],
  ["Cabinets, floors and fixtures inside your unit, as built", "Depends on the building", "When the building's policy leaves them out"],
  ["Upgrades you or an earlier owner made", "Only in an all-in policy", "Yes"],
  ["Your furniture, clothes and other belongings", "No", "Yes"],
];
const WHO_TABLE = `<div class="c3-ins-tab"><table><caption class="sr">Who insures what in a condo: the building's master policy and your HO-6</caption>`
  + `<thead><tr><th scope="col">What</th><th scope="col">Building's master policy</th><th scope="col">Your HO-6</th></tr></thead><tbody>`
  + WHO.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td><span class="l">Building's policy</span>${b}</td><td><span class="l">Your HO-6</span>${c}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* Table 2 (the kinds chart) was cut in fix round 1: it restated the three bullets in section 2 cell for cell. */

/* Chart (row 20, CORRECTED): one owner's even share of a storm deductible, from chart-deductible-share.json. */
const DED_CHART = G.bars(CH.bars.map((b, i) => ({
  name: ["A 1 percent storm deductible", "A 2 percent storm deductible", "A 5 percent storm deductible"][i],
  feature: i === 2 ? "the most Fannie Mae allows" : undefined,
  value: b.value, valueText: `About ${near(b.value, 100)}`,
})), {
  caption: "A 5 percent storm deductible could bill each owner about $6,500",
  nameLabel: "Storm deductible", featureLabel: "note", valueLabel: "One owner's share",
  compact: true, max: Math.round(EX.share_5pct * 1.12),
  note: `Example: a building insured for about ${near(EX.replacement_cost_per_unit, 1000)} a unit, the middle rebuild cost for Horry condo buildings of 10 or more units, with the bill split evenly.`,
});
must(near(EX.share_5pct, 100) === "$6,500" && near(EX.share_2pct, 100) === "$2,600" && near(EX.share_1pct, 100) === "$1,300", "the example rounds to $6,500, $2,600 and $1,300");

/* Table 3 (row 19, CORRECTED): flood claims on Horry condo buildings in four storms. */
const STORM_TABLE = `<div class="c3-ins-tab c3-ins-num"><table><caption class="sr">Flood claims on Horry County condo buildings' own flood policies, by storm</caption>`
  + `<thead><tr><th scope="col">Storm</th><th scope="col">Building claims</th><th scope="col">Paid</th></tr></thead><tbody>`
  + STORMS.map(([k, c, p]) => `<tr><th scope="row">${k}, ${yearOf(k)}</th><td><span class="l">Building claims</span>${n(c)}</td><td><span class="l">Paid</span>About ${mil(p)}</td></tr>`).join("")
  + `</tbody></table></div>`;
must(mil(8211380) === "$8.2 million" && mil(7654476) === "$7.7 million" && mil(8380786) === "$8.4 million", "row 19 rounding");

/* Fannie Mae's rules for the HO-6 (row 7), as plain bold lines under thin rules. */
const RULES_LIST = `<ul class="c3-ins-rules">`
  + [
    ["When you need one", "When the building's policy leaves out any part of the inside of your unit, or charges a deductible to each unit."],
    ["How much it must insure", "At least the larger of two amounts: what it costs to restore what the building's policy leaves out, or the building's per-unit deductible."],
    ["How it pays", "At replacement cost, the cost to restore your unit as it was."],
    ["Its own deductible", "At most 5 percent of its coverage or $2,500, whichever is more."],
    ["Wind", "If the building's per-unit deductible is for one peril, such as wind, your HO-6 must cover that peril."],
  ].map(([b, t]) => `<li><strong>${b}</strong><span>${t}</span></li>`).join("") + `</ul>`;

/* What we read before you buy (old page's list, tightened). */
const PAPERS = `<ul class="c3-ins-rules c3-ins-one">`
  + [
    ["The insurance section of the condo's founding papers", "It says which kind of master policy the building has."],
    ["The declarations page of the building's policy", "It shows the amount insured and every deductible, with any separate one for wind."],
    ["The per-unit deductible, if there is one", "Your lender sizes your HO-6 against it."],
    ["The building's flood policy and its deductible", "Most are $1,250; some are $25,000."],
    ["The loss assessment limit on your HO-6 quote", "It should be enough to pay your share of the storm deductible."],
    ["The budget and the reserves", `Money the building has saved for repairs. Our page on ${h.a("/hoa/reserves/", "condo reserves")} explains how much is enough.`],
    ["The statement of what the seller owes", `The association's letter on unpaid dues, explained on our page on ${h.a("/hoa/estoppel-and-transfer-fees/", "what the seller still owes the HOA")}.`],
  ].map(([b, t]) => `<li><strong>${b}</strong><span>${t}</span></li>`).join("") + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* Design: the approved 2026-11-08 treatment (garden-city.js, hoa.js): the italic line at about half the     */
/* H1's size, key facts as short rows under rules on a phone, one card style for charts and offers, plain    */
/* tables and lists under thin rules, one block width of 720 px.                                              */

const DESIGN_CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:minmax(0,1fr)!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}${S} .c3-glance li>span:last-child{display:flex;flex-direction:column;align-items:flex-start;gap:.1rem;flex:1;min-width:0}${S} .c3-glance strong{font-size:1rem!important;flex:1 1 auto;min-width:0}${S} .c3-glance span.t{white-space:nowrap;flex:0 0 auto}}`
  + `${S} h2{text-wrap:balance}`
  + `${S} .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  /* The plain tables: thin rules, no card. On a phone each row is its label, then the cells with small labels. */
  + `${S} .c3-ins-tab{max-width:720px;margin:1.2rem 0 1.4rem}${S} .c3-ins-tab table{width:100%;border-collapse:collapse;font-family:var(--sans);color:var(--navy);font-size:1rem}`
  + `${S} .c3-ins-tab th,${S} .c3-ins-tab td{text-align:left;vertical-align:top;padding:.6rem .8rem .6rem 0;border-bottom:${RULE};line-height:1.4}`
  + `${S} .c3-ins-tab thead th{font-size:.95rem;font-weight:600;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .c3-ins-tab tbody th{font-weight:500;width:46%}${S} .c3-ins-tab td{color:var(--muted)}${S} .c3-ins-tab td .l{display:none}`
  + `${S} .c3-ins-tab tbody tr:last-child>*{border-bottom:0}`
  + `${S} .c3-ins-num td{white-space:nowrap;font-variant-numeric:tabular-nums}`
  + `@media (max-width:599px){${S} .c3-ins-tab table,${S} .c3-ins-tab tbody{display:block;width:100%}${S} .c3-ins-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .c3-ins-tab tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:1rem;padding:.65rem 0;border-bottom:${RULE}}${S} .c3-ins-tab tbody tr:last-child{border-bottom:0}`
  + `${S} .c3-ins-tab th,${S} .c3-ins-tab td{border:0;padding:0}${S} .c3-ins-tab tbody th{grid-column:1/-1;width:auto;font-weight:600;padding-bottom:.3rem}`
  + `${S} .c3-ins-tab td .l{display:block;font-size:.875rem;color:var(--muted);margin-bottom:.1rem}${S} .c3-ins-tab td{color:var(--navy)}}`
  /* The flood decision line. */
  + `${S} p.c3-ins-do{max-width:680px;margin:1rem 0 1.3rem;padding:.75rem 0 .75rem 1.1rem;border-left:3px solid var(--brass);color:var(--navy);font-size:1.05rem;line-height:1.6}${S} p.c3-ins-do strong{font-weight:650}`
  /* The capital-letter warning, quoted as it is printed. */
  + `${S} .c3-ins-quote{max-width:680px;margin:.4rem 0 1.3rem;padding:.2rem 0 .2rem 1.1rem;border-left:3px solid var(--brass);font-family:var(--sans);font-size:.98rem;line-height:1.6;letter-spacing:.01em;color:var(--navy);font-weight:600}`
  /* Bold lines under thin rules. */
  + `${S} .c3-ins-rules{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px;display:grid;gap:0 2rem}`
  + `@media (min-width:760px){${S} .c3-ins-rules:not(.c3-ins-one){grid-template-columns:1fr 1fr}${S} .c3-ins-rules:not(.c3-ins-one) li:nth-last-child(2):nth-child(odd){border-bottom:${RULE}}}`
  + `${S} .c3-ins-rules li{margin:0;padding:.7rem 0 .75rem;border-top:${RULE};color:var(--muted);line-height:1.55}${S} .c3-ins-rules li:last-child{border-bottom:${RULE}}`
  + `${S} .c3-ins-rules strong{display:block;color:var(--navy);font-weight:650}`
  + `@media (min-width:760px){${S} .c3-ins-one li{display:grid;grid-template-columns:17rem 1fr;column-gap:1.4rem}${S} .c3-ins-one strong{display:inline}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The end band (the same fix as garden-city.js and hoa.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  /* "On this page": no card, in columns between two thin rules (as hoa.js). */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] a{text-wrap:balance}${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* One block width. */
  + `${S} .c3-gchart,${S} .c3-ins-tab,${S} .c3-ins-rules{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* The photo (rules/images.md): a USGS oblique aerial, public domain, reused from /hoa/special-assessments/; the
   record is in this page's photos.json, with the writer's subject check. It sits under the sentence on what the
   building's policy insures, and its caption says that. It is also the share image. */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("north-myrtle-beach-oceanfront-roofs-and-balconies-2011", PHOTOS[0].caption);
ph.share("north-myrtle-beach-oceanfront-roofs-and-balconies-2011");

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const T27 = "https://www.scstatehouse.gov/code/t27c031.php";
const T38 = "https://www.scstatehouse.gov/code/t38c075.php";
const REG = "https://www.scstatehouse.gov/coderegs/Chapter%2069.pdf";
const SCDOI = "https://doi.sc.gov/1023/Understanding-the-Types-of-Homeowner-Ins";
const FNMA3 = "https://selling-guide.fanniemae.com/sel/b7-3-03/master-property-insurance-requirements-project-developments";
const FNMA4 = "https://selling-guide.fanniemae.com/sel/b7-3-04/individual-property-insurance-requirements-unit-project-development";
const FLOODSMART = "https://www.floodsmart.gov/";
const CFR = "https://www.ecfr.gov/current/title-44/chapter-I/subchapter-B/part-61";
const NFIPP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const NFIPC = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2";
const IRMI = "https://www.irmi.com/term/insurance-definitions/bare-walls-coverage";
const CENSUS = "https://www2.census.gov/programs-surveys/acs/data/pums/2024/1-Year/";

/* ---------------------------------------------------------------------------- */
/* The offers. Each is tied to the question its section answered; no two share words. Every button goes to   */
/* /contact/, where the site opens its short pop-up and sends the button's words with the lead.               */

const TOP = { title: "Send us the building and we read its insurance papers with you", label: "Have us read the papers", href: "/contact/" };
const END = {
  h2: "Buying a condo? Get an insurance quote before you offer.",
  p: "If you buy with us, we get you an insurance quote for the address before you make an offer, and we read the building's insurance papers with you.",
  label: "Ask for an insurance quote", href: "/contact/",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  pageImages: () => ph.pageImages(),
  title: "Condo Master Policy vs HO-6 in Myrtle Beach: What to Buy",
  description: "What a Myrtle Beach condo's master policy covers, how much HO-6 your lender wants, what a storm deductible could cost you, and when to add flood cover.",
  ogTitle: "Condo master policy vs HO-6 in Myrtle Beach: what each covers, and how much to buy",
  crumb: "Master Policy and HO-6",
  eyebrow: "The HOA guide",
  h1: "Condo master policy vs HO-6 in Myrtle Beach:",
  h1em: "what each covers, and how much to buy.",
  sub: "The building's policy, your own HO-6, the storm deductible and flood, with Fannie Mae's rules and FEMA's numbers for Horry County condos.",
  heroMedia: glance([
    { icon: "home", label: "Your own HO-6", text: `About ${money(OWN)} a year` },
    { icon: "flood", label: "Your unit flood policy", text: `About ${near(U.cost_median, 5)} a year` },
    { icon: "storm", label: "Example share, 5% storm deductible", text: `About ${near(EX.share_5pct, 100)}` },
  ]),
  heroCta: TOP,
  topOfferLine: "Name the building. We read its insurance papers with you.",
  author: "devin",
  shortAnswer: [
    `The condo building's master policy, paid through your condo fee, insures the structure and the shared areas. Your HO-6 insures your belongings, your liability, and whatever the master policy leaves out inside your unit.`,
    `On this coast, ask first for the building's storm deductible. For a typical Horry condo building of 10 or more units, a 5 percent storm deductible split evenly would come to about ${near(EX.share_5pct, 100)} for each owner. A basic condo policy pays only a small set amount toward that bill, unless you buy a higher limit.`,
  ],
  sections: [
    { h2: "What is the difference between a condo master policy and an HO-6?", toc: "The two policies", id: "difference", html: () =>
      DESIGN_CSS + ph.css() +
      h.p(`A condo master policy is the insurance the condo association buys for the whole building. You pay your share of it through the condo fee. An HO-6 is the policy you buy for your own unit.`) +
      PHOTO +
      h.p(`South Carolina's condo law requires the association to insure the property. It also gives each owner the right to insure their own unit. An HO-6 insures your belongings, the improvements made to your unit, and your liability.`) +
      WHO_TABLE +
      h.p(`About ${OCEAN_INS} in 10 oceanfront condos for sale list insurance among what the condo fee includes. Our page on ${h.a("/hoa/", "what HOA fees cover")} breaks the fee down.`) +
      h.p(`Owners who live in their condo here pay about ${money(OWN)} a year for their own policy.`) },

    { h2: "Does the condo master policy cover the inside of my unit?", toc: "Inside your unit", id: "inside", html: (bg) =>
      h.p(`There are three kinds of master policy. Two of them cover some of the inside of your unit. The building's recorded papers usually say which kind applies:`) +
      h.ul([
        `<strong>Bare walls.</strong> The association insures the structure and the shared areas. You insure the building parts inside your unit, such as sinks, built-in cabinets, appliances, flooring and wall coverings, and any upgrades.`,
        `<strong>Single entity.</strong> The association also insures the fixtures in each unit as built. You insure your belongings and your own upgrades.`,
        `<strong>All in.</strong> The association also insures the upgrades owners made. You insure your belongings.`,
      ]) +
      h.p(`Some agents say "walls in" for single entity, and some use it for the owner's own policy. We go by the building's papers, not the label.`) +
      h.h3("How do I find out which kind my building has?") +
      h.p(`South Carolina's condo law does not say where the association's policy stops inside a unit. The building's own papers do: the insurance section of its recorded founding papers, and its policy's declarations page.`) +
      h.p(`With bare walls, a new kitchen or a tiled floor is yours to insure.`) +
      h.cta("Know what the building's policy leaves to you", "Send us the building's name. We get its recorded papers and its policy's declarations page, and tell you what your HO-6 must insure.", "Have us read the building's insurance section", "/contact/", bg) },

    { h2: "How much HO-6 coverage do I need for my mortgage?", toc: "HO-6 for a mortgage", id: "mortgage", html: () =>
      h.p(`For most conventional loans, your HO-6 must insure at least what the building's policy leaves out inside your unit, or the building's per-unit deductible, whichever is more. Fannie Mae's rules for the HO-6, in full:`) +
      RULES_LIST +
      h.p(`Fannie Mae's rules are not a law. An FHA or VA loan, a loan the lender keeps, or a cash purchase can have other rules.`) +
      h.p(`Fannie Mae has rules for the building's policy too. Its deductible can be at most 5 percent of what it insures.`) +
      h.p(`A deductible charged to each unit can be at most $50,000. Our page on ${h.a("/invest/non-warrantable-condos/", "condos most lenders will not lend on")} explains what a building that misses these rules means for a loan.`) +
      h.h3("Does an HO-6 cover wind and hail?") +
      h.p(`Near the ocean, it may not. East of U.S. 17 or Bypass 17, whichever is farther west, an insurer may leave wind out of a policy. You can then buy wind cover on its own, for example from the state's wind and hail pool.`) +
      h.p(`When we get you an insurance quote, we ask that it include wind. Our page on ${h.a("/buyers/coastal-insurance/", "coastal insurance in Myrtle Beach")} explains the state's wind and hail pool.`) },

    { h2: "Does an HO-6 cover the master policy deductible?", toc: "The storm deductible", id: "deductible", html: (bg) =>
      h.p(`Sometimes. The part of an HO-6 that can pay your share of the building's deductible is its loss assessment coverage. It pays your share, up to its limit, and nothing above it.`) +
      h.p(`On this coast, the deductible to ask about is the one for storms. A building's policy can have a separate wind or named storm deductible. For a loan Fannie Mae buys, it must meet the same 5 percent limit.`) +
      DED_CHART +
      h.p(`A basic condo policy pays only a small set amount toward your share of an association's assessment, unless you buy a higher limit.`) +
      h.p(`Before you close, we put the building's storm deductible, in dollars, next to the loss assessment limit on your HO-6 quote. If the limit is smaller, we ask for a quote with a higher one.`) +
      h.p(`We also ask the insurance agent, in writing, whether the policy pays an assessment that comes from the association's storm deductible. The answer depends on the policy.`) +
      h.p(`How a deductible is split among owners, and who pays after a leak or a fire, is on our page on ${h.a("/hoa/who-pays-for-damage/", "who pays for condo damage")}. When the association bills every owner for it, that bill is a ${h.a("/hoa/special-assessments/", "special assessment")}.`) +
      h.h3("How to spot a storm deductible on the policy") +
      h.p(`South Carolina requires any home or building policy with a separate hurricane, named storm or wind deductible to say so in capital letters, on its front and on its declarations page. The rule applies to the association's policy too.`) +
      h.p(`The sentence starts:`) +
      `<blockquote class="c3-ins-quote">THIS POLICY CONTAINS A SEPARATE DEDUCTIBLE FOR HURRICANE, NAMED STORM OR WIND/HAIL LOSSES, WHICH MAY RESULT IN HIGH OUT-OF-POCKET EXPENSES TO YOU.</blockquote>` +
      h.p(`A named storm is a hurricane, tropical storm or tropical depression named by the National Weather Service or the National Hurricane Center. If your HO-6 has a separate storm deductible, the insurer must show you, when you buy it and at each renewal, how it works on a $100,000 policy.`) +
      h.cta("Know your share of a storm bill before you close", "Send us the building. We get its storm deductible and tell you the loss assessment limit that pays your share.", "Have us compare the deductible to your quote", "/contact/", bg) },

    { h2: "How does flood insurance work on a Myrtle Beach condo?", toc: "Flood", id: "flood", html: () =>
      /* Rows 29 (FEMA FloodSmart), 14, 30 and 16, then 18: the answer and the decision come before the counts. */
      h.p(`Your HO-6 most likely does not cover flood. Most homeowners insurance does not cover flood damage. Flood cover is its own policy.`) +
      h.p(`The building's flood policy does not insure your furniture or belongings either. A flood policy on your own unit can, if you buy contents cover. It can also pay your share of a flood assessment from the association.`) +
      `<p class="c3-ins-do"><strong>When to add your own flood policy:</strong> if a flood would leave you replacing what is in the unit. A unit flood policy here cost a middle of about ${near(U.cost_median, 5)} a year.</p>` +
      h.h3("The building's flood policy") +
      h.p(`The federal flood program sells two flood policies for a condo. One goes to the association for the building, called an RCBAP. The other goes to an owner for a unit.`) +
      h.p(`The building's policies on Horry condos, in FEMA's latest full year:`) +
      `<ul class="c3-ins-rules c3-ins-one">` + [
        ["Insured close to full value", `Of the ${n(R.with_replacement_cost)} that report a rebuild cost, ${n(R.meets_80pct_or_max)} meet the program's 80 percent rule. A building insured for less than that gets a smaller payment after a flood.`],
        ["Often at the top limit", `${n(R.at_250k_per_unit_cap)} of ${n(R.policies)} buy $250,000 a unit, the program's top limit.`],
        ["A small deductible", `${n(R.deductible_counts["1250"])} of ${n(R.policies)} carry a $1,250 deductible. Another ${n(R.deductible_counts["25000"])} carry $25,000.`],
        ["Your share of the cost", `A middle of about ${money(RCB_UNIT)} a unit a year, paid through the condo fee. Our page on ${h.a("/hoa/", "HOA fees")} shows the rest of the fee.`],
        ["Contents", `Only property the owners share or the association owns. ${n(R.with_contents_coverage)} of ${n(R.policies)} buy any.`],
      ].map(([b, x]) => `<li><strong>${b}</strong><span>${x}</span></li>`).join("") + `</ul>` +
      h.h3("Your own flood policy on a unit") +
      h.p(`You can buy your own federal flood policy on your unit, even when the building has one. Half the unit policies here cost between about ${near(U.cost_p25, 10)} and ${near(U.cost_p75, 10)} a year.`) +
      h.p(`About ${X_SHARE} in 4 of these unit policies were outside FEMA's high-risk flood zones. The two policies together pay at most $250,000 for one unit, and pay for the same damage only once.`) +
      h.p(`A unit flood policy pays your share of a flood assessment from the association, up to its building limit. It does not pay an assessment that comes from the association's own flood deductible.`) +
      h.p(`That deductible is usually small, as the list above shows.`) +
      h.h3("Flood claims on Horry condo buildings") +
      h.p(`Four storms brought the largest flood payments on these buildings' own flood policies:`) +
      STORM_TABLE +
      h.p(`After Hurricane Ian, unit flood policies made ${n(EV["Hurricane Ian"].U_claims)} claims. Our page on ${h.a("/buyers/undisclosed-flooding/", "finding out whether a home has flooded")} shows what we look up for one building.`) },

    { h2: "What should I ask for before I buy a condo, and when?", toc: "Before you buy", id: "before-you-buy", html: () =>
      h.p(`Get the building's papers first, then have your HO-6 written once, at the right size. Your lender checks that your policy is big enough. The right size comes from what the building's policy leaves out.`) +
      h.p(`Buying a policy before you know means paying to redo it, and that can hold up your closing. We read these papers, in this order:`) +
      PAPERS +
      h.p(`If you buy with us, we get you an insurance quote for the address before you make an offer. Insurance is a commodity: we recommend the cheapest policy that satisfies you and your lender.`) +
      h.p(`If you will rent the unit out, our page on ${h.a("/invest/landlord-insurance/", "landlord insurance on a Myrtle Beach rental")} covers the policy for a rental.`) },
  ],
  faqTitle: "Master policy and HO-6 FAQ",
  faq: [
    { q: "Do I need an HO-6 if the HOA has a master policy?", a: "For most conventional loans, yes, when the master policy leaves out any part of the inside of your unit or charges a deductible to each unit. Your belongings are yours to insure under every kind of master policy." },
    { q: "Is HO-6 insurance required in South Carolina?", a: "Not by state law. South Carolina's condo law requires the association to insure the building and lets each owner insure their own unit. A lender usually requires an HO-6." },
    { q: "How much is HO-6 insurance in Myrtle Beach?", a: "Owners in Horry County pay about $800 a year for their own condo policy. A flood policy on the unit, if you buy one, cost a middle of about $495 a year." },
    { q: "How much loss assessment coverage should I have?", a: "Enough to pay your share of the building's storm deductible. There is no legal minimum, so the number printed on your policy is the number you have. In a typical Horry building of 10 or more units, each owner's even share of a 5 percent storm deductible is about $6,500." },
    { q: "Does my HO-6 cover flood?", a: "Most likely not. Most homeowners insurance does not cover flood damage, and the building's flood policy does not insure your belongings. A flood policy on your unit can, and here it cost a middle of about $495 a year." },
    { q: "What is an RCBAP?", a: "The Residential Condominium Building Association Policy, the federal flood policy a condo association buys on its building. It does not insure owners' furniture or belongings." },
  ],
  sources: [
    { name: "SC Code 27-31", href: T27 },
    { name: "SC Code 38-75", href: T38 },
    { name: "SC Reg. 69-56", href: REG },
    { name: "SC Department of Insurance", href: SCDOI },
    { name: "Fannie Mae B7-3-03", href: FNMA3 },
    { name: "Fannie Mae B7-3-04", href: FNMA4 },
    { name: "FEMA FloodSmart", href: FLOODSMART },
    { name: "44 CFR Part 61", href: CFR },
    { name: "OpenFEMA policies", href: NFIPP },
    { name: "OpenFEMA claims", href: NFIPC },
    { name: "IRMI", href: IRMI },
    { name: "Census PUMS 2024", href: CENSUS },
  ],
  sourcesNote: "Our counts: federal flood policies on Horry condos in FEMA's latest full year, and every Horry condo flood claim. Owners' policy cost: owners living in their condo, Horry County outside the Loris area. Not legal advice.",
  bottomCta: END,
  /* As special-assessments.js: creditsList adds a general "resized these photos" line that repeats the photo's own line. */
  afterSources: () => { const c = ph.credits(), x = "Chapter3 Realty resized these photos and cropped some of them."; return c.includes(x) ? c.replace(x, "") : c; },
  keywords: "condo master policy vs HO-6, HO-6 insurance Myrtle Beach, bare walls vs single entity vs all in, does the master policy cover the inside of my unit, how much HO-6 coverage do I need for my mortgage, loss assessment coverage, condo storm deductible South Carolina, RCBAP, condo flood insurance Horry County",
  about: "Condominium insurance on the Grand Strand, South Carolina: the association's master policy and the owner's HO-6",
});
