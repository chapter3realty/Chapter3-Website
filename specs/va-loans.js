/* /buyers/va-loans/ - using a VA loan on the Grand Strand: which homes and condos qualify, which
 * sellers take VA, the beach second home question, South Carolina's disabled-veteran property tax
 * exemption, the appraisal, the funding fee and closing costs, the VA clinic, and who qualifies.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02. The live page was hand-made; this is its first spec.
 * Facts: Blog-Brain batches/2026-11-a/buyers-va-loans/facts.md (VERIFIED rows, and CORRECTED rows in
 * the verifier's safe wording only; VERIFY.md; the struck wording is in buyers-va-loans-struck.json).
 * Demand: must-answer.md (Google suggestions of 2026-11-01). Plan: PLAN.md.
 * Data: data/2026-11-a/buyers-va-loans/ (findings.json and the chart-*.json rows, built by
 * build-findings.py from the raw pulls; raw/drives.json and origins.json for the clinic map). Every
 * count, share and drive time on the page is computed here from those files, never typed. Rules and
 * limits are typed from their ledger rows (row numbers beside each).
 * Kept from the live page: line 1 of the H1, the condo approval rule, "We check VA condo approval
 * status on every building", the funding fee waiver, reuse, Palmetto
 * Heroes closed for 2026, the links to closing costs, relocating and the buyers hub, the homes feed
 * (idx-lib/feeds.js VA_FEED, placed at the edge).
 * Not kept (judge; VERIFY.md): "Coming soon" search box, the FAQ and "Mistakes" above the article,
 * "competitive interest rates", the rate-impact mistake, "seller concessions up to 4% of the loan
 * amount" (it is of reasonable value), "Many Grand Strand buildings already hold approval", "uses
 * them heavily", "significant and growing military retiree population", "VA medical facilities at
 * SC bases are close", "apply through the Horry County Auditor's office" (wrong: SCDOR grants it,
 * row 24), "entitlement is restored" and "Most VA borrowers pay" (struck), "We word the contract".
 * BrickWood is not named in the body (no inline AfBA block needed; the footer carries it).
 * Photos (data/2026-11-a/buyers-va-loans/photos.json): USGS oceanfront towers (public domain, the
 * record of /hoa/reserves/) and Warbird Park (Carol M. Highsmith, public domain, Library of
 * Congress; files in images/2026-11-a/buyers-va-loans/), until the photo partner's shots arrive
 * (shot-list.md).
 * Fix round 1 (2026-11-02, REVIEW-1.md): the VA-listed condo communities with condos for sale are named
 * (communities-checked.json, rows F1 to F3), the oceanfront towers photo and the veteran head count are
 * cut, Palmetto Heroes is cut, each fact is said once, the terms are explained, the true story of a low
 * appraisal is told (stories.json low-appraisal-reconsideration, wording of 2026-10-d row 38).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon, iconInner } = require(path.join(BB, "tools", "icons.js"));
const { regionMap, mapLinksHtml } = require(path.join(BB, "tools", "area-map.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/va-loans/";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", "buyers-va-loans");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json");
const KINDS = read("chart-va-by-kind.json"), TOWNS = read("chart-houses-by-town.json"), PRICES = read("chart-houses-by-price.json");
const DRIVES = read("raw/drives.json"), ORIGINS = read("origins.json"), PHOTOS = read("photos.json").photos;
const COMM = read("communities-checked.json").rows.filter((r) => r.kept), MULTI = read("raw/multi-counts.json").totals;
const NB = " ";
const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const pct = (a, b) => Math.round(a / b * 100);
const L = F.listings, VC = F.va_condos;

/* Shares said in words are checked against the data here (owner, 2026-10-07: few exact numbers). */
const inWords = (a, b) => {
  const r = a / b;
  if (r >= .62 && r < .685) return "about 2 in 3";
  if (r >= .47 && r <= .53) return "about half";
  if (r >= .26 && r <= .33) return "about 3 in 10";
  if (r >= .22 && r < .26) return "about 1 in 4";
  if (r >= .685 && r <= .73) return "about 7 in 10";
  throw new Error(`no word for ${a} of ${b}`);
};
const K = Object.fromEntries(KINDS.map((r) => [r.kind, r])), T = Object.fromEntries(TOWNS.map((r) => [r.town, r]));
if (KINDS.length !== 5 || TOWNS.length !== 9 || PRICES.length !== 8) throw new Error("chart rows changed shape");

/* Rows 2, 3: about 175 condo communities (176 names, about 173 normalised) against HUD's 9. */
const VA_NAMES = VC.horry_unique_names_approved, FHA = VC.hud_fha_horry_approved;
if (VA_NAMES < 170 || VA_NAMES > 180 || FHA !== 9) throw new Error("condo list counts moved: " + VA_NAMES + " / " + FHA);
const TIMES = Math.round(VA_NAMES / FHA / 5) * 5;
if (TIMES !== 20) throw new Error("the VA list is no longer about 20 times HUD's");
/* Row 4: reviews in the 12 months to the pull. */
const REV = VC.horry_reviews_completed_last_12_months, REVS = VC.horry_reviews_completed_last_12_months_by_status;
const REV_OK = (REVS["Accepted Without Conditions"] || 0) + (REVS["Accepted With Conditions"] || 0), REV_NO = REVS.Rejected || 0;
if (REV !== 27 || REV_OK !== 22 || REV_NO !== 5) throw new Error("review counts differ from ledger row 4");
/* Row 5 (corrected): 2 of 29 directory towers have an accepted record. */
const DIR = F.directory_match.directory_size, DIR_OK = F.directory_match.approved_project_on_file.length;
if (DIR !== 29 || DIR_OK !== 2) throw new Error("directory match differs from ledger row 5");
/* Row 8 to 11. */
const HOUSE = L.house, NEW = L.house_new_construction, FLOOD = L.house_flood_zone;
const OCEAN = L.condo_oceanfront_building;
/* Rows F1 to F3 (fix round 1): the 15 communities checked one by one, and 2 to 4 unit homes. */
if (COMM.length !== 15) throw new Error("the checked community list changed: " + COMM.length);
if (MULTI.multi < 50 || MULTI.multi > 75 || MULTI["multi+va"] > 6) throw new Error("2 to 4 unit counts moved: " + JSON.stringify(MULTI));
if (L.manufactured.pct !== 15) throw new Error("manufactured share differs from ledger row 8");
if (L.assumable_all !== 18) throw new Error("assumable count differs from ledger row 11");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to .c3-va. Glass cards, the decision rows, the steps.     */

const GL = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 40px -28px rgba(28,32,40,.45);border-radius:20px";
const CSS = "<style>"
  + ".c3-va-ic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;color:var(--brass);background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.45)}"
  /* The decision cards: the home, the answer, what decides it. */
  + ".c3-va-pick{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.75rem;max-width:960px}"
  + "@media (min-width:760px){.c3-va-pick{grid-template-columns:1fr 1fr}}"
  + `.c3-va-pick>li{${GL};margin:0;padding:.9rem 1.05rem;display:grid;grid-template-columns:40px 1fr auto;gap:.15rem .75rem;align-items:center}`
  + ".c3-va-pick .k{grid-column:2;align-self:center;font-family:var(--sans);font-size:1.02rem;font-weight:600;color:var(--navy);line-height:1.3}"
  + ".c3-va-pick .v{grid-column:3;grid-row:1;display:flex;align-items:center;font-family:var(--sans);font-weight:700;font-size:1.05rem;color:var(--navy)}"
  + ".c3-va-pick .v i{font-style:normal;display:inline-block;padding:.15rem .7rem;border-radius:999px;font-size:.95rem;white-space:nowrap}"
  + ".c3-va-pick .v i.yes{background:#e3efe4;color:#1f5130}.c3-va-pick .v i.maybe{background:#f6e9d6;color:#7a4a1e}.c3-va-pick .v i.no{background:#f3dfdc;color:#7d2a22}"
  + ".c3-va-pick .d{grid-column:1 / -1;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5;margin-top:.35rem}"
  /* On a phone the badge goes under the title, so the title has the card's full width (critic, round 1). */
  + "@media (max-width:520px){.c3-va-pick>li{grid-template-columns:40px 1fr;align-items:start}.c3-va-pick .k{grid-row:1}.c3-va-pick .v{grid-column:2;grid-row:2;margin-top:.3rem}}"
  + "main#main h2,main#main h3{text-wrap:balance}main#main .btn{white-space:nowrap}.c3-va-nw{white-space:nowrap}"
  /* Cards and the community table end where the charts end (critic, round 1: right edges at 1440). */
  + "@media (min-width:760px){.c3-va-pick,.c3-va-cards,main#main .c3-cc{max-width:820px}}"
  /* Numbered steps */
  + ".c3-va-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.7rem;max-width:760px}"
  + `.c3-va-steps>li{${GL};counter-increment:s;margin:0;padding:.95rem 1.1rem .95rem 4rem;position:relative;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}`
  + ".c3-va-steps>li::before{content:counter(s);position:absolute;left:1rem;top:.9rem;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--navy);color:#f4efe8;font-family:var(--sans);font-weight:700;display:flex;align-items:center;justify-content:center}"
  + ".c3-va-steps strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem;margin-bottom:.1rem}"
  + "@media (max-width:520px){.c3-va-steps>li{padding:.9rem 1rem .95rem 3.3rem}.c3-va-steps>li::before{left:.8rem;width:1.85rem;height:1.85rem}}"
  /* Small fact cards (who pays no funding fee; who qualifies) */
  + ".c3-va-cards{list-style:none;margin:1rem 0 1.5rem;padding:0;display:grid;gap:.7rem;max-width:960px}"
  + "@media (min-width:760px){.c3-va-cards{grid-template-columns:1fr 1fr}}"
  + `.c3-va-cards>li{${GL};margin:0;padding:.9rem 1.05rem;display:flex;gap:.8rem;align-items:flex-start;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5}`
  + ".c3-va-cards strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1.02rem;margin-bottom:.1rem}"
  /* The tax table */
  + `.c3-va-tbl{width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;font-family:var(--sans);font-size:1rem;color:var(--navy)}`
  + ".c3-va-tbl caption{caption-side:top;text-align:left;font-weight:600;font-size:1rem;color:var(--navy);padding:0 .2rem .6rem;line-height:1.35}"
  + ".c3-va-tbl th,.c3-va-tbl td{padding:.6rem .9rem;text-align:left;border-bottom:1px solid rgba(28,32,40,.08);line-height:1.35;vertical-align:top}"
  + ".c3-va-tbl thead th{font-size:.9rem;color:var(--muted);font-weight:600}"
  + ".c3-va-tbl tbody th{font-weight:600}.c3-va-tbl tbody th small{display:block;font-weight:400;color:var(--muted);font-size:.95rem;margin-top:.1rem}"
  + ".c3-va-tbl td{color:#8a5226;font-weight:700;white-space:nowrap;text-align:right}.c3-va-tbl thead th:last-child{text-align:right}"
  + ".c3-va-tbl tbody tr:last-child th,.c3-va-tbl tbody tr:last-child td{border-bottom:0}"
  /* The clinic map */
  + ".c3-va-map svg{display:block;width:100%;height:auto}"
  /* The end band, the feed's search box and the header, as on /buyers/programs/ (its NEEDS.md 8 to 10):
     at the edge the feed's disclaimer follows the end band, so the theme drew it as the slim top bar. */
  + `main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;display:block!important;text-align:center!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;width:calc(100% - 32px)!important;max-width:720px!important;margin:0 auto!important;box-sizing:border-box}`
  + `@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{background:#2a3040!important}}`
  + ".hx-fb,.hx-fb-ai,.hx-fb-q{max-width:100%;min-width:0;box-sizing:border-box}.hx-fb-q textarea{min-width:0}.hx-fb-pills{flex-wrap:wrap;max-width:100%}"
  + "@media (min-width:1000px) and (max-width:1100px){header .header-inner{gap:2rem}}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Section 1: the decision cards (rows 1, 12 to 14). No counts here: the chart   */
/* under them carries the numbers, so each fact is said once.                    */

/* ---------------------------------------------------------------------------- */
/* Section 1: the decision cards (rows 1, 5, 12 to 14). The oceanfront count is  */
/* said here only; the chart under them carries the shares (round 1: once).      */

const PICK = [
  { ic: "home", k: "A house you will live in", v: ["yes", "Yes"], d: "No list to check. The seller and the VA appraisal decide." },
  { ic: "town", k: "A townhouse", v: ["yes", "Yes"], d: "If the community was set up as a condo, it must also be on the VA's condo list." },
  { ic: "golf", k: "A condo in a villa, golf or townhome community", v: ["maybe", "If listed"], d: `Only in a community on the VA's list. ${h.a("#va-approved-condos", "The listed communities with condos for sale")} are named below.` },
  { ic: "beach", k: "A condo in an oceanfront resort tower", v: ["no", "Rarely"], d: `Only ${DIR_OK} of the ${DIR} big oceanfront resort buildings we track are on the VA's list.` },
  { ic: "key", k: "A beach second home or a rental", v: ["no", "No"], d: "A VA loan is only for the home you live in." },
  { ic: "family", k: "A house with 2 to 4 units", v: ["yes", "Yes"], d: "You must live in one of the units. You can rent the others." },
];
const PICK_HTML = `<ul class="c3-va-pick" role="list" aria-label="Can you use a VA loan on the home you want">`
  + PICK.map((p) => `<li><span class="c3-va-ic" aria-hidden="true">${icon(p.ic, { size: 22 })}</span><span class="k">${p.k}</span><span class="v"><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Can you use VA: </span><i class="${p.v[0]}">${p.v[1]}</i></span><span class="d">${p.d}</span></li>`).join("") + "</ul>";

/* Rows 6 and 8: share of homes for sale marked as taking VA, by kind. One count a row (owner, round 1). */
const KIND_CHART = G.bars(KINDS.map((r) => ({ name: r.kind, value: r.pct, valueText: `${r.pct} in 100` })),
  { caption: "Homes for sale marked as taking a VA loan, out of every 100", nameLabel: "Kind of home", valueLabel: "marked VA", max: 100, compact: true,
    note: "Chapter3's count of homes for sale on the Coastal Carolinas MLS, in aggregate, from the financing the listing says the seller will consider. A condo in a building with a rental program, or in an oceanfront building, is also counted in all condos." });

/* ---------------------------------------------------------------------------- */
/* Section 2: the condo communities (rows 2 to 5, F1 to F3).                      */

/* Prices to the nearest $10,000; bedrooms as a range. Areas: the Census place where the listings'
   middle point falls in one a reader knows (Carolina Forest), else the mailing town. */
const r10k = (v) => Math.round(v / 10000) * 10000;
const AREA = {
  "Magnolia Pointe": "Myrtle Beach, inland", "Magnolia North": "Myrtle Beach, inland", "Windsor Green": "Carolina Forest",
  "The Village at Queens Harbour": "Myrtle Beach, inland", "Shorewood": "Myrtle Beach, inland", "Seagate Village": "Myrtle Beach",
  "Monterey Bay Suites": "Myrtle Beach, oceanfront", "The Havens at Barefoot": "North Myrtle Beach", "Edgewater": "North Myrtle Beach",
  "Carolina Keyes": "North Myrtle Beach", "Carolina Yacht Landing": "Little River", "Southbridge": "Surfside Beach",
  "Park West": "Murrells Inlet", "Myrtle Greens": "Conway", "Tullamore Lakes": "Longs",
};
if (COMM.find((r) => r.name === "Windsor Green").census_place[0] !== "Carolina Forest CDP") throw new Error("Windsor Green is no longer in Carolina Forest");
for (const r of COMM) if (!AREA[r.name]) throw new Error("no area for " + r.name);
const ORDER = ["Carolina Forest", "Myrtle Beach, inland", "Myrtle Beach", "Myrtle Beach, oceanfront", "Surfside Beach", "Murrells Inlet", "Conway", "North Myrtle Beach", "Little River", "Longs"];
const beds = (r) => (r.beds_min === r.beds_max ? `${r.beds_min}` : `${r.beds_min} to ${r.beds_max}`);
const price = (r) => (r10k(r.price_min) === r10k(r.price_max) ? `about ${money(r10k(r.price_min))}` : `${money(r10k(r.price_min))} to ${money(r10k(r.price_max))}`);
const COMM_TABLE = compareCards(COMM.slice().sort((a, b) => ORDER.indexOf(AREA[a.name]) - ORDER.indexOf(AREA[b.name]) || b.for_sale - a.for_sale)
  .map((r) => ({ name: r.name, cells: { area: AREA[r.name], n: String(r.for_sale), price: price(r), beds: beds(r) } })),
  [{ key: "area", label: "Where" }, { key: "n", label: "Condos for sale", num: true }, { key: "price", label: "Asking prices" }, { key: "beds", label: "Bedrooms" }],
  { caption: "Condo communities on the VA's list with condos for sale now", nameLabel: "Community" });
const MB_SUITES = COMM.find((r) => r.name === "Monterey Bay Suites");
if (MB_SUITES.beds_max !== 1) throw new Error("Monterey Bay Suites now lists more than one-bedroom suites");

/* ---------------------------------------------------------------------------- */
/* Section 3: houses by town and price (rows 9, 10, 10b, 11).                    */

const TOWN_CHART = G.bars(TOWNS.slice().sort((a, b) => b.pct - a.pct || b.all - a.all).map((r) => ({ name: r.town, value: r.pct, valueText: `${r.pct}%` })),
  { caption: "Houses for sale marked as taking a VA loan, by town", nameLabel: "Town", valueLabel: "share marked VA", max: 100, compact: true,
    note: "Towns are mailing addresses, so Myrtle Beach includes Carolina Forest and Socastee, and Conway includes country land outside the city." });
const PEAK = PRICES.reduce((a, b) => (b.pct > a.pct ? b : a)), TOP = PRICES.at(-1);
if (PEAK.band !== "$250K to $300K" || TOP.band !== "$1M and up") throw new Error("the price bands moved");
/* "Most common in the middle of the market" (owner, round 2: one comparison, no figures): the peak band must stay mid-range and above the top band. */
if (PEAK.pct <= TOP.pct * 2) throw new Error("the middle band no longer clearly leads");

/* ---------------------------------------------------------------------------- */
/* Section 5: the exemption by town (row 27), rounded to $10.                    */

const EX = F.exemption_example, r10 = (v) => Math.round(v / 10) * 10;
const PLACE_NAME = { "Unincorporated Horry (Carolina Forest, Socastee, Little River)": "Outside the cities", "Murrells Inlet or Garden City": "Murrells Inlet or Garden City", "City of Myrtle Beach": "City of Myrtle Beach" };
const PLACE_NOTE = { "Unincorporated Horry (Carolina Forest, Socastee, Little River)": "Carolina Forest, Socastee, Little River", "Murrells Inlet or Garden City": "Horry County side" };
const EX_ROWS = EX.rows.slice().sort((a, b) => b.yearly_tax_saved - a.yearly_tax_saved);
const EX_LO = r10(EX_ROWS.at(-1).yearly_tax_saved), EX_HI = r10(EX_ROWS[0].yearly_tax_saved);
if (EX.value !== 400000 || EX_LO !== 1470 || EX_HI !== 2610) throw new Error("exemption example differs from ledger row 27");
if (!/Conway/.test(EX_ROWS[0].place)) throw new Error("Conway is no longer the biggest saving");
/* A real table (score A6): six rows a reader compares, with the areas each covers. */
const TAX_CHART = `<figure style="margin:1.2rem 0 1rem;max-width:620px"><table class="c3-va-tbl"><caption>Tax a fully exempt veteran saves each year, on a home the county values at $400,000</caption>`
  + `<thead><tr><th scope="col">Where the home is</th><th scope="col">Tax saved a year</th></tr></thead><tbody>`
  + EX_ROWS.map((r) => `<tr><th scope="row">${PLACE_NAME[r.place] || r.place}${PLACE_NOTE[r.place] ? `<small>${PLACE_NOTE[r.place]}</small>` : ""}</th><td>${money(r10(r.yearly_tax_saved))}</td></tr>`).join("")
  + `</tbody></table><figcaption style="color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem">Chapter3's figures from the county's tax rates for a home you live in, worked out the same way as our property tax calculator. The county taxes its own value of the home, not the price you paid. Small special district taxes and the county's stormwater fee are left out.</figcaption></figure>`;

const STEPS = `<ol class="c3-va-steps">`
  + `<li><strong>Get the 4 percent rate on your home.</strong>After closing, you apply to the Horry County Assessor for the 4 percent rate, the lower tax rate for the home you live in. The SC Department of Revenue will not grant the exemption until the county has.</li>`
  + `<li><strong>Get the disability certificate.</strong>It comes from the VA or from the county's veterans affairs office. A VA rating letter alone is not enough. ${h.ext("https://www.horrycountysc.gov/departments/veterans-affairs/", "Horry County Veterans Affairs")} is at 1949 Industrial Park Road in Conway, and its phone is <a class="c3-va-nw" href="tel:+18439155480">(843) 915-5480</a>.</li>`
  + `<li><strong>Apply to the SC Department of Revenue.</strong>Apply online in ${h.ext("https://mydorway.dor.sc.gov/?link=PT401I", "MyDORWAY")}, or on Form PT-401-I. Send the recorded deed, the county's 4 percent approval and the certificate.</li>`
  + `<li><strong>Claim the whole year.</strong>A newly rated veteran can claim the exemption for the whole year the disability began, if they owned the home that year; if they bought it later, from the year they bought it. A late filer can go back up to two prior tax years if the taxes were paid on time.</li>`
  + `</ol>`;

/* ---------------------------------------------------------------------------- */
/* Section 6: homes built before 1980 (row 20).                                  */

const YB = F.year_built_acs2024;
const per100 = (p) => Math.round(p);
if (per100(YB.Horry.pct_before_1980) !== 14 || per100(YB["United States"].pct_before_1980) !== 48) throw new Error("year built differs from ledger row 20");
const AGE_CHART = G.bars([
  { name: "Horry County", value: YB.Horry.pct_before_1980, valueText: `${per100(YB.Horry.pct_before_1980)} in 100` },
  { name: "South Carolina", value: YB["South Carolina"].pct_before_1980, valueText: `${per100(YB["South Carolina"].pct_before_1980)} in 100`, reference: true },
  { name: "United States", value: YB["United States"].pct_before_1980, valueText: `${per100(YB["United States"].pct_before_1980)} in 100`, reference: true },
], { caption: "Homes built before 1980, out of every 100", nameLabel: "Where", valueLabel: "built before 1980", max: 100, compact: true,
  note: "U.S. Census Bureau, American Community Survey, all homes. The Census counts homes by the decade they were built, so 1980 is the closest line to 1978." });

/* ---------------------------------------------------------------------------- */
/* Section 7: who pays no funding fee (row 15), in plain words (round 1).        */

const NOFEE = [
  { ic: "dollar", k: "You get VA disability pay", d: "Or you are eligible for it but get retirement or active-duty pay instead." },
  { ic: "calendar", k: "You are still serving and already rated", d: "Before your closing date, the VA rated you eligible for disability pay on a claim made before discharge." },
  { ic: "home", k: "You are a surviving spouse with VA survivor pay", d: "Dependency and Indemnity Compensation (DIC), as the surviving spouse of a veteran." },
  { ic: "key", k: "You are on active duty with a Purple Heart", d: "You show the lender proof of it on or before the closing date." },
];
const NOFEE_HTML = `<ul class="c3-va-cards" role="list" aria-label="Who pays no VA funding fee">`
  + NOFEE.map((p) => `<li><span class="c3-va-ic" aria-hidden="true">${icon(p.ic, { size: 22 })}</span><span><strong>${p.k}</strong>${p.d}</span></li>`).join("") + "</ul>";

/* ---------------------------------------------------------------------------- */
/* Section 8: the clinic map (rows 30, 31). Drive minutes from raw/drives.json,  */
/* rounded by CRAFT 2: under 15 to the minute, else to the nearest 5.            */

const CLINIC = DRIVES.dest["Myrtle Beach VA Clinic"];
const rnd = (m) => (m < 15 ? Math.round(m) : Math.round(m / 5) * 5);
const short = (s) => s.replace(/ (?:CDP|city|town)$/, "");
const TO_CLINIC = DRIVES.drives.filter((d) => d.to === "Myrtle Beach VA Clinic").map((d) => ({ name: short(d.from), min: rnd(d.minutes), lat: ORIGINS[d.from].lat, lon: ORIGINS[d.from].lon }));
const MIN = Object.fromEntries(TO_CLINIC.map((d) => [d.name, d.min]));
if (MIN.Socastee !== 10 || MIN["Myrtle Beach"] !== 12 || MIN["Carolina Forest"] !== 20 || MIN.Loris !== 55) throw new Error("drive minutes differ from ledger row 31");
const CHS = DRIVES.drives.find((d) => d.to === "Ralph H. Johnson VA Medical Center");
const CHS_MIN = Math.round(CHS.minutes / 5) * 5, CHS_MI = Math.round(CHS.miles / 5) * 5;
if (CHS_MIN !== 130 || CHS_MI !== 95) throw new Error("Charleston drive differs from ledger row 32");
const CLINIC_MAP = (() => {
  const m = regionMap({ home: { name: "Myrtle Beach VA Clinic", label: "VA Clinic", lat: CLINIC.lat, lon: CLINIC.lon },
    landmarks: TO_CLINIC.map((d) => ({ name: d.name, kind: "pin", lat: d.lat, lon: d.lon, minutes: d.min })),
    alt: `Map of the Grand Strand with the Myrtle Beach VA Clinic and the drive to it from each town: ${TO_CLINIC.slice().sort((a, b) => a.min - b.min).map((d) => `${d.name} about ${d.min} minutes`).join(", ")}.` },
  { glass: true, dir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), src: "/images/maps" });
  /* The clinic's pin shows the hospital drawing, not the house the map draws for a community. */
  const html = m.html.split(iconInner("home")).join(iconInner("hospital"));
  return `<figure style="margin:1.4rem 0 .4rem;max-width:560px"><div class="c3-va-map">${html}</div><figcaption style="color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem">The drive to the Myrtle Beach VA Clinic from the middle of each town, without traffic. Summer traffic takes longer. ${m.credit}</figcaption></figure>`;
})();
if (!CLINIC_MAP.includes("about 55 min") && !CLINIC_MAP.includes("55 min")) throw new Error("the clinic map lost its drive times");

const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const WARBIRD = PHOTOS.find((r) => r.file.includes("/warbird-park-jets"));
const WARBIRD_CAP = "Jets on display at Warbird Park in Myrtle Beach.";
const WARBIRD_PHOTO = lazy(PH.heroPhoto(WARBIRD, { alt: "Military jets in camouflage paint on display on a round plaza with small plaques, under tall pines at Warbird Park in Myrtle Beach", caption: WARBIRD_CAP, maxWidth: "760px", sizes: "(max-width: 800px) 100vw, 760px" }));
const CREDITS = PH.creditsList([{ photo: WARBIRD, caption: "Warbird Park in Myrtle Beach" }]);
/* photos.js cuts a credit at the first ". " before a capital, so "Carol M. Highsmith" became
   "Carol M" in the ImageObject's creditText (NEEDS.md, round 1). Put the full name back here. */
const fullCredit = (s) => s.split('"creditText":"Carol M"').join('"creditText":"Carol M. Highsmith"');
const fixImg = (o) => (o && o.creditText === "Carol M" ? Object.assign({}, o, { creditText: "Carol M. Highsmith" }) : o);

const CONTACT = "/contact/";
const VA_FEE = "https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/";
const VA_ELIG = "https://www.va.gov/housing-assistance/home-loans/eligibility/";
const VA_CONDO = "https://lgy.va.gov/lgyhub/condo-report";
const VA_LIMITS = "https://www.va.gov/housing-assistance/home-loans/loan-limits/";
const cap1 = (s) => s[0].toUpperCase() + s.slice(1);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "VA Loans in Myrtle Beach: Which Condos Qualify | Chapter3",
  description: "Which Myrtle Beach condo communities take a VA loan, with condos for sale now, the towns where sellers take VA, and SC's disabled-veteran tax exemption.",
  ogTitle: "VA loans in Myrtle Beach: which condos and homes qualify, and what disabled veterans save on property tax",
  crumb: "VA Loans",
  eyebrow: "Military and veterans",
  h1: "VA loans in Myrtle Beach:",
  h1em: "which condos and homes qualify.",
  sub: "Your VA loan can buy most kinds of home here, but a condo must be in one of about 175 Horry County communities on the VA's list.",
  heroCta: { title: "Send us a condo or a house you like. We find out whether a VA loan can buy it before you tour.", label: "Ask about a home", href: CONTACT },
  author: "devin",
  pageImages: () => PH.pageImages(WARBIRD).map(fixImg),
  shortAnswer: [
    `For a house you will live in, yes, if the seller agrees and it passes the VA appraisal. ${cap1(inWords(HOUSE.va, HOUSE.all))} the houses for sale on the Grand Strand are marked as taking a VA loan. A condo needs a community on the VA's list, and few oceanfront resort towers are on it.`,
    `If the VA rates you permanently and totally disabled from your service, you pay no property tax on your home. On a home the county values at $400,000, that saves about ${money(EX_LO)} to ${money(EX_HI)} a year.`,
  ],
  sections: [
    { h2: "Can you use a VA loan on the home you want in Myrtle Beach?", toc: "Which homes qualify", id: "which-homes", html: () =>
      CSS +
      h.p("The answer depends on the kind of home you want.") +
      PICK_HTML +
      KIND_CHART },

    { h2: "Which condos in Myrtle Beach are VA-approved?", toc: "VA-approved condos", id: "va-approved-condos", html: (bg) =>
      h.p(`The ${h.ext(VA_CONDO, "VA's condo list")} holds about 175 condo communities in Horry County, many more than HUD's list for FHA loans.`) +
      h.p("These communities on the list had condos for sale on the day we counted, from Carolina Forest to Longs:") +
      COMM_TABLE +
      h.p(`On the oceanfront the list is short. Monterey Bay Suites, in the table, has one-bedroom suites for sale. Of the big resort buildings, Beach Cove Resort and the Renaissance Tower at Myrtle Beach Resort are on the list. Our ${h.a("/invest/condo-buildings/", "condo building directory")} covers the rest of the oceanfront.`) +
      h.h3("How does a community get on the VA's list?") +
      h.p(`Your lender can ask the VA to review it, with the condo's papers. Over the past year, most of the VA's reviews of condo communities here ended with the community on the list. Our guide to ${h.a("/invest/non-warrantable-condos/", "condos most lenders will not lend on")} covers the other loan rules a condo building can fail.`) +
      h.cta("Is your building on the VA's list?", "Send us the building's name, or the area and price you want. We look it up on the VA's list and send you the condos for sale in listed communities.", "Ask about a building", CONTACT, bg) },

    { h2: "Do sellers in Myrtle Beach accept VA offers?", toc: "Sellers who take VA", id: "sellers", html: (bg) =>
      h.p("Most do inland, fewer at the beach.") +
      TOWN_CHART +
      h.p(`Inland towns give a VA buyer the most choice. Conway also has the highest city tax, so a fully exempt veteran saves the most there. Our guides to ${h.a("/submarkets/conway/", "Conway")} and ${h.a("/submarkets/carolina-forest/", "Carolina Forest")} show what living there is like.`) +
      h.p(`VA is most common in the middle of the market, and ${inWords(NEW.va, NEW.all)} new houses for sale are marked VA. Our ${h.a("/buyers/new-construction/", "new construction guide")} covers buying from a builder.`) +
      h.p("A listing without the VA mark can still take a VA offer. On a house you like that is not marked, we ask the listing agent whether the seller will take VA before you make an offer.") +
      h.h3("Flood zones") +
      h.p(`${cap1(inWords(FLOOD.va, FLOOD.all))} houses for sale listed as in a flood zone are marked VA. In a high-risk flood zone, a VA loan requires flood insurance for the life of the loan. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} gives what it costs.`) +
      h.h3("Taking over a seller's VA loan") +
      h.p(`A buyer can take over a seller's VA loan instead of getting a new one. This is called assuming the loan. Only ${L.assumable_all} homes for sale on the Grand Strand are listed with a loan you can take over, of any kind, so we ask the seller's agent about the loan on each home you like.`) +
      h.cta("Houses for sale that take VA", "Tell us the towns you like and your price range. We send you the houses for sale there that are marked as taking a VA loan, and we show you the ones you pick.", "Get the list", CONTACT, bg) },

    { h2: "Can you buy a beach house or a rental with a VA loan?", toc: "Second homes and rentals", id: "second-homes", html: () =>
      h.p(`Only as the home you live in. You can buy a house with 2 to 4 units, live in one and rent the others, but few sellers of these homes here mark VA: ${MULTI["multi+va"]} of the ${MULTI.multi} for sale.`) +
      h.p("A beach second home or a pure rental does not qualify. You certify that you intend to move in. If you are on active duty and cannot live there because of it, your spouse can meet the rule.") },

    { h2: "Do disabled veterans pay property tax in South Carolina?", toc: "Property tax exemption", id: "property-tax", html: () =>
      h.p("Not on their home, if the VA rates them permanently and totally disabled from their service. The exemption covers the home they own and live in, alone or with a spouse, with up to 5 acres, and up to two cars. A lower rating does not qualify.") +
      TAX_CHART +
      h.p(`A surviving spouse who has not remarried and lives in the home keeps the exemption, and can move it to a later home. Every town's tax rate is in our ${h.a("/buyers/property-taxes/", "property tax calculator")}.`) +
      h.h3("How to apply, in order") +
      h.p("The exemption is not automatic. The SC Department of Revenue grants it, not the county auditor, and the order matters.") +
      STEPS +
      h.h3("Rated below 100 percent?") +
      h.p("At 65, after a year living in South Carolina, the first $50,000 of your home's value is not taxed. It also applies if a state or federal agency has classified you totally and permanently disabled. You apply to the county auditor by July 15.") },

    { h2: "What does the VA appraisal check?", toc: "The VA appraisal", id: "appraisal", html: () =>
      h.p("Two things: what the home is worth, and whether it meets the VA's minimum property requirements, which your lender confirms.") +
      h.h3("If the appraisal comes in low") +
      h.p(`The VA loan cannot be more than the appraised value or the price, whichever is lower. The VA's own example: on a home under contract for $400,000 that appraises at $375,000, the loan is capped at $375,000. You then pay the gap in cash, the seller lowers the price, or the deal ends.`) +
      h.p("In our experience, low appraisals are rare here. When one comes in low, our agents gather comparable sales for a reconsideration of value, a request to look at the value again. Once the value changed and the buyer brought less to closing.") +
      h.h3("Homes built before 1978") +
      h.p("Older homes get one extra look. In a home built before 1978, the VA presumes lead paint, and any peeling or damaged paint must be fixed. Homes that old are far less common here than in the country as a whole.") +
      AGE_CHART },

    { h2: "What does a VA buyer pay at closing?", toc: "Funding fee and closing costs", id: "closing", html: () =>
      h.p("A VA loan can need no down payment, as long as the price is not higher than the appraised value.") +
      h.p(`Unless you are exempt, you pay a one-time ${h.ext(VA_FEE, "VA funding fee")}. It is a share of the loan amount. The share drops if you make a large enough down payment. With little or no down payment, it is higher if you have used a VA loan before. You can add the fee to the loan or pay it at closing. On a purchase it is the only cost you can add to the loan.`) +
      h.h3("Who pays no funding fee") +
      NOFEE_HTML +
      h.p("If the VA later awards you disability pay that starts before your closing date, you can ask for the funding fee back.") +
      h.h3("What the seller can pay") +
      h.p("A seller can pay all of your closing costs, with no VA limit. The VA's 4 percent limit is only for other help from the seller, such as paying your funding fee or paying off a debt. It is 4 percent of the value the VA appraisal gives the home.") +
      h.p(`Who pays the commission, the lender's fee for making the loan, the appraisal fee and title insurance is up to you and the seller. We write what you ask for into your offer. Our ${h.a("/buyers/closing-costs/", "closing cost guide")} lists each cost at closing in South Carolina.`) },

    { h2: "Where is the VA clinic in Myrtle Beach?", toc: "The VA clinic", id: "va-clinic", html: () =>
      h.p(`The Myrtle Beach VA Clinic is at 1800 Airpark Drive. It offers primary care, mental health and specialty care, and replaced two older clinics in town.`) +
      CLINIC_MAP +
      mapLinksHtml({ name: "Myrtle Beach VA Clinic", lat: CLINIC.lat, lon: CLINIC.lon }) +
      h.p(`The clinic is part of the Ralph H. Johnson VA health care system. From the clinic, the nearest VA medical center is the Ralph H. Johnson VA Medical Center in Charleston, about 2 hours 10 minutes away without traffic. From Loris, Little River and North Myrtle Beach, the Fayetteville VA Medical Center in North Carolina is a shorter drive.`) +
      h.h3("Military history here") +
      h.p("Warbird Park in Myrtle Beach keeps the history of the old Myrtle Beach Air Force Base, with a Wall of Service that lists people who served at the base.") +
      WARBIRD_PHOTO +
      h.p(`South Carolina does not tax military retirement pay, and a surviving spouse gets the same deduction. Our ${h.a("/buyers/retirees/", "guide for retirees")} covers the rest of the state's taxes on retirement income. Not every veteran here is retired. One of our clients is a veteran who lives here and works his New York job in alternating weeks.`) },

    { h2: "Who qualifies for a VA loan, and how much can you borrow?", toc: "Who qualifies", id: "who-qualifies", html: () =>
      h.p(`You need a Certificate of Eligibility (COE), the VA's letter that says you can use the benefit. These are the ${h.ext(VA_ELIG, "service minimums")} for service from the Gulf War to today:`) +
      `<ul class="c3-va-cards" role="list" aria-label="VA loan service minimums">`
      + `<li><span class="c3-va-ic" aria-hidden="true">${icon("calendar", { size: 22 })}</span><span><strong>Serving now</strong>90 days of active duty in a row.</span></li>`
      + `<li><span class="c3-va-ic" aria-hidden="true">${icon("key", { size: 22 })}</span><span><strong>A veteran</strong>24 months in a row, or the full period you were called to active duty (at least 90 days), or less if discharged for a disability from your service.</span></li>`
      + `<li><span class="c3-va-ic" aria-hidden="true">${icon("town", { size: 22 })}</span><span><strong>Guard and Reserve</strong>90 days of qualifying active duty, or 6 qualifying years if you still serve, left honorably or retired.</span></li>`
      + `<li><span class="c3-va-ic" aria-hidden="true">${icon("home", { size: 22 })}</span><span><strong>A surviving spouse</strong>If you get, or can get, certain VA survivor pay (DIC), or your spouse on active duty is missing in action or held as a prisoner of war.</span></li></ul>` +
      h.h3("How much you can borrow") +
      h.p(`Your entitlement is the most the VA will pay your lender if you do not repay the loan. Your COE shows your basic entitlement. The rest, for a larger loan, is worked out from the loan amount and is not on the COE. With your full entitlement there is ${h.ext(VA_LIMITS, "no VA loan limit")}: the lender decides how much you can borrow, and the appraisal must support the price.`) +
      h.p(`If you still have a VA loan on another home, part of your entitlement is in use. Your remaining entitlement is worked out from the county's loan limit, which is $832,750 for a one-unit home in Horry and Georgetown counties, minus the entitlement already in use. If what is left does not cover enough of the new loan, the lender may ask for a down payment.`) +
      h.h3("Credit and down payment help") +
      h.p(`The VA requires no minimum credit score, but some lenders have their own. SC Housing's VA loans with no down payment need a score of 640. SC Housing's year-round help works with a VA loan; our ${h.a("/buyers/programs/", "guide to SC Housing's programs")} gives its limits.`) },
  ],
  faqTitle: "VA loan questions",
  faq: [
    { q: "Can I use a VA loan more than once?", a: "Yes. After you sell the home and pay off the VA loan, you can ask the VA to restore your entitlement. With a VA loan still open on another home, you may have enough left for a second one." },
    { q: "Can I buy a manufactured home with a VA loan?", a: `Yes, if you will live in it. A VA loan can buy a manufactured home, or a lot for one. Few sellers here mark VA on them: about ${L.manufactured.pct} in 100 manufactured homes for sale.` },
    { q: "Can I buy a house with a tenant in it using a VA loan?", a: "A house with a tenant is hard to buy with a VA loan while a long lease runs, because you must be able to move in. Most lenders want you in the home within 60 days. We ask about the lease before you make an offer." },
    { q: "What interest rate will I get on a VA loan?", a: "The lender quotes your rate. We do not quote rates. We can introduce you to our preferred lender, or you can use any lender you like." },
  ],
  sources: [
    { name: "VA condo report", href: VA_CONDO },
    { name: "HUD FHA condo list", href: "https://entp.hud.gov/idapp/html/condlook.cfm" },
    { name: "VA purchase loans", href: "https://www.va.gov/housing-assistance/home-loans/loan-types/purchase-loan/" },
    { name: "VA funding fee", href: VA_FEE },
    { name: "VA loan limits", href: VA_LIMITS },
    { name: "VA eligibility", href: VA_ELIG },
    { name: "SC Code 12-37", href: "https://www.scstatehouse.gov/code/t12c037.php" },
    { name: "SCDOR PT-401-I", href: "https://dor.sc.gov/sites/dor/files/forms/PT401I.pdf" },
    { name: "Horry County 2026 tax levy", href: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf" },
    { name: "Myrtle Beach VA Clinic", href: "https://www.va.gov/charleston-health-care/locations/myrtle-beach-va-clinic/" },
    { name: "Census ACS", href: "https://data.census.gov/table/ACSDT1Y2024.B25034?g=050XX00US45051" },
  ],
  sourcesNote: "Homes for sale: Chapter3's count of MLS listings, in aggregate; a community's condos are matched by its name and checked against its street. Drive times: OpenStreetMap routing, no traffic. Not loan or tax advice.",
  afterSources: () => CREDITS + fullCredit(PH.imageSchema([WARBIRD])),
  bottomCta: { h2: "Send us the home you like", p: "For a condo, we look up its community. For a house, we ask whether the seller takes VA. Then we show you the homes you pick.", label: "Ask about a home", href: CONTACT },
  keywords: "VA loan Myrtle Beach, VA approved condos Myrtle Beach, VA loan condo approval list Horry County, VA loan second home, SC disabled veteran property tax exemption, Horry County disabled veteran property tax, VA funding fee exemption, VA clinic Myrtle Beach, VA loan requirements for sellers",
  about: "VA home loans and the disabled-veteran property tax exemption for buyers in Myrtle Beach and Horry County, South Carolina",
});
