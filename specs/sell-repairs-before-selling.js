/* /sell/repairs-before-selling/ - what to fix before selling a house in Myrtle Beach and Horry County, and what to leave:
 * the items a buyer's FHA appraiser, insurer (the four-point inspection) and termite inspector (South Carolina's wood
 * infestation report, the CL-100) look at; how old homes here are and what that means for roofs and systems; what other
 * sellers here already advertise; the cheap fixes agents recommend; what big projects get back; a pre-listing
 * inspection; and fix, credit or sell as is.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 1, 2026-11-08. Design: the approved pilots of batch 2026-11-a
 * (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line headline with the italic
 * sub line at about half the H1 size, the answer first, one card style used once (fix, credit or sell as is, the one
 * place the reader chooses), plain lists and a plain table under thin rules elsewhere, one block width of 720 px, and on
 * wide screens the age chart and the two photos beside the paragraphs that explain them. DESIGN.md in the batch folder.
 * Facts: Blog-Brain batches/2026-11-n/sell-repairs-before-selling/facts.md, VERIFIED rows, and CORRECTED rows only in
 * the verifier's wording (VERIFY.md). Struck wording: sell-repairs-before-selling-struck.json (no "younger than most",
 * no "largest of any decade", no "55 times", no "standard quality", no "twice as hard", no "(the CL-100)" as a form
 * number, no "cannot be financed", no "most used form" or "state-run insurer", no "last service", no roof permit rule,
 * no "anywhere", no "even damage that was repaired", no "does not require anyone to fix", no blanket "South Carolina
 * law does not make a seller fix", no "were cheap", no "fewer than 1 in 100", no "sit on a slab"). Row 26 (price cuts)
 * is not on the page. No dollar figure for any repair: none was verified.
 * Data, never typed (website working copy, data/2026-11-n/sell-repairs-before-selling/):
 *   findings.json   homes by decade built and the middle year (rows 1 to 3), the HUD life table and the age clock
 *                   (rows 4, 5), NOAA cooling degree days (row 6), our listing count by year built (rows 24, 25), NAR's
 *                   staging and remodeling shares (rows 21, 22)
 *   photos.json     two photos, CC BY-SA 3.0, Wikimedia Commons: worn asphalt shingles (DMahalko) and termite damage
 *                   at the bottom of wood siding (Alton) (VERIFY.md, Photos 1 and 2)
 * Typed and checked: the FHA, Fannie Mae, four-point, county, regulation, statute and IRS rows (7 to 19, 23).
 * Owner questions (OWNER-QUESTIONS.md) still open: a real seller story (Q1; the page has none), insurers' roof ages
 * (Q2; the page names none), a seller's insurance quote (Q3; not offered), what our agents do before listing (Q4; the
 * offers are requests the reader makes), the CL-100 in our deals (Q5; no "who pays"), repair requests (Q6).
 * Version 2, 2026-11-08 (review round 1, REVIEW-1.md): the roof section leads with what to do about an old roof that
 * does not leak; the county decade chart, the state and US years and the cooling degree days are cut; FHA is the
 * example, not every answer; the Florida age rule is cut; the pre-listing section links the liability points to the
 * sibling disclosure page; the tax section moved to the FAQ; the FAQ answers who pays for the CL-100 (row 27,
 * VERIFIED-BY-FIXER) and roof age for insurance (row 28, VERIFIED-BY-FIXER).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/sell/repairs-before-selling/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "sell-repairs-before-selling");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const CTA = "/contact/";

/* ---- Rows 1 to 3: how old homes are. ---- */
const HO = F.geos.horry;
if (HO.median_year_built !== 2003 || F.geos.sc.median_year_built !== 1994 || F.geos.us.median_year_built !== 1982 || F.geos.georgetown.median_year_built !== 1995) throw new Error("row 1 moved");
const DEC = HO.by_decade;
const d = (b) => DEC.find((x) => x.built === b);
if (d("2000 to 2009").pct !== 20.5 || d("2010 to 2019").units !== 46153 || HO.housing_units !== 237850) throw new Error("row 2 moved");
if (HO.built_1960_to_1979.units !== 22383) throw new Error("row 3 moved");
const MED_AGE = F.age_year - HO.median_year_built;
const OLDER = ["1960 to 1969", "1950 to 1959", "1940 to 1949", "1939 or earlier"].map(d);
const OLDER_UNITS = OLDER.reduce((s, x) => s + x.units, 0);

/* ---- Rows 4, 5: HUD's table and the age clock for a house built in the middle year. ---- */
const CLOCK = F.age_clock;
const eul = (item) => CLOCK.find((c) => c.item === item);
const ROOF = eul("Asphalt shingle roof"), OUT = eul("Heat pump or AC outdoor unit"), AH = eul("Air handler (indoor unit)"),
  WH = eul("Water heater, gas or electric"), PANEL = eul("Electrical service panel"), METAL = eul("Metal roof");
if (ROOF.eul_years !== 20 || OUT.eul_years !== 15 || AH.eul_years !== 20 || WH.eul_years !== 12 || PANEL.eul_years !== 50 || METAL.eul_years !== 50) throw new Error("row 4 moved");
if (MED_AGE !== 23 || !ROOF.median_home_past_eul || !OUT.median_home_past_eul || !WH.median_home_past_eul || PANEL.median_home_past_eul) throw new Error("row 5 moved");

/* ---- Row 6: cooling degree days. ---- */
if (F.climate_ratio_cooling_nmb_vs_columbus !== 1.88 || F.climate_ratio_cooling_nmb_vs_nyc !== 1.64) throw new Error("row 6 moved");

/* ---- Rows 24, 25: our count of houses for sale (resales), by year built. ---- */
const L = F.listings, LR = L.rows.filter((r) => /^built /.test(r.band || ""));
if (LR.length !== 5) throw new Error("row 24: the year bands moved");
const OLD = F.listings.built_2005_or_earlier;
if (OLD.houses !== 762 || OLD.new_roof !== 120 || OLD.new_hvac !== 94) throw new Error("row 24 moved");
const NEW16 = LR.find((r) => r.band === "built 2016 or later");
if (NEW16.houses !== 852 || NEW16.new_roof !== 8 || NEW16.new_hvac !== 10) throw new Error("row 24: 2016 or later moved");
const B85 = LR.find((r) => r.band === "built 1985 or earlier"), B06 = LR.find((r) => r.band === "built 2006 to 2015");
if (B85.crawlspace !== 121 || B85.houses !== 298 || B06.crawlspace !== 11 || B06.houses !== 388 || B06.slab_foundation !== 290 || NEW16.slab_foundation !== 737) throw new Error("row 25 moved");
const DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/* ---- Rows 21, 22: NAR. ---- */
const STAGE = F.nar_staging_recommend_pct, RIR = F.nar_cost_recovered_pct, REC = F.nar_recommend_before_selling_pct;
const sv = (arr, name) => (arr.find((x) => x[0] === name) || [])[1];
if (sv(STAGE, "Declutter home") !== 91 || sv(STAGE, "Paint touch ups") !== 67 || sv(RIR, "Complete kitchen renovation") !== 60 || sv(RIR, "Bathroom renovation") !== 50
  || sv(REC, "Paint the entire home") !== 50 || sv(REC, "New roofing") !== 37 || sv(REC, "Kitchen upgrade") !== 30) throw new Error("rows 21, 22 moved");

/* ---- Links ---- */
const ACS = "https://data.census.gov/table/ACSDT1Y2025.B25034?g=050XX00US45051";
const HUD_EUL = "https://www.hud.gov/sites/documents/eul_for_cna_e_tool.pdf";
const HUD_HB = "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf";
const NOAA = "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-1.3-06/property-condition-and-quality-construction-improvements";
const CIT = "https://www.citizensfla.com/inspections";
const ROOF_LETTER = "https://www.horrycountysc.gov/media/ky2jhqzz/roof-covering-letter.pdf";
const CPSC = "https://www.cpsc.gov/s3fs-public/516.pdf";
const R1085 = "https://www.law.cornell.edu/regulations/south-carolina/R-27-1085";
const T27_50 = "https://www.scstatehouse.gov/code/statmast.php?title=27&chapter=50";
const SC_FORM = "https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf";
const NAR_STAGE = "https://www.nar.realtor/sites/default/files/2025-05/2025-profile-of-home-staging-05-06-2025.pdf";
const RIR_PDF = "https://remodelingdoneright.nari.org/media/jjjaoome/2025remodelingimpactreport.pdf";
const IRS523 = "https://www.irs.gov/publications/p523";
const MAP_ROOF = "/homes/map/?type=house&amp;has=new_roof";

/* ---- The worked list: what each checker looks at (rows 7 to 9, 12, 14 to 16). A plain table, the page's main
   visual; on a phone each row is a block with its labels. ---- */
const NO = `<span class="no">Not checked</span>`;
const COLS = ["FHA loan appraiser", "Insurer's four-point inspection", "CL‑100 termite report"];
const row = (item, cells) => `<tr><th scope="row">${item}</th>${cells.map((c, i) => `<td data-l="${COLS[i]}">${c}</td>`).join("")}</tr>`;
const WHO = `<div class="rp-tw"><table class="rp-tab"><caption>What a buyer's lender, insurer and termite inspector look at</caption>`
  + `<thead><tr><th scope="col">Part of the house</th>${COLS.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`
  + row("Roof", ["At least 2 years of life left, and no leaks. If not, a roofer must inspect it.", "Its age, its years of life left and the date of the last roofing permit", NO])
  + row("Heating and air", ["Heat that keeps the house at 50 degrees or more. Air conditioning, if the house has it, must work.", "The system's age and the year it was last updated, with a photo of its dated label", NO])
  + row("Water heater and pipes", ["A pressure-relief valve and its pipe on the water heater", "The water heater's age, its relief valve and any leak; the type of pipe, including polybutylene, a plastic pipe", NO])
  + row("Wiring", ["No frayed or bare wires", "The panel's brand, model and age, and any older kind of wiring: aluminum, cloth-covered or knob-and-tube", NO])
  + row("Termites", ["Any sign of termites, or of a past treatment, means a pest inspection", NO, "Termites and other wood-destroying insects, and their damage"])
  + row("Wood under the house", [NO, NO, "Wood moisture of 20 percent or more, and rot below the main floor and at the bottoms of outside doors, steps and porch posts"])
  + `</tbody></table></div>`;

/* ---- Rows 4, 5: the age clock on a house built in the middle year. ---- */
const clk = (name, item, past) => `<li><b>${name}</b><span>HUD's life: ${item.eul_years} years</span><span class="${past ? "past" : "ok"}">${past ? `Past it at ${MED_AGE}` : `Not yet at ${MED_AGE}`}</span></li>`;
const CLOCK_LIST = `<ul class="rp-clock" aria-label="A house built in ${HO.median_year_built}, if its parts are the ones it was built with">`
  + clk("Asphalt shingle roof", ROOF, true) + clk("Heat pump or air conditioner, the outdoor unit", OUT, true)
  + clk("Water heater", WH, true) + clk("Main electrical panel", PANEL, false) + `</ul>`;

/* ---- Chart C (row 24): houses for sale that advertise a new roof, by year built. ---- */
const BAND_NAME = { "built 1985 or earlier": "Built 1985 or earlier", "built 1986 to 1995": "Built 1986 to 1995", "built 1996 to 2005": "Built 1996 to 2005",
  "built 2006 to 2015": "Built 2006 to 2015", "built 2016 or later": "Built 2016 or later" };
const ROOF_CHART = G.bars(LR.map((r) => ({ name: BAND_NAME[r.band], value: r.pct_new_roof, valueText: `${Math.round(r.pct_new_roof)}%` })),
  { caption: "Houses for sale in Horry County that advertise a new roof", nameLabel: "When built", valueLabel: "advertise a new roof", max: 20,
    note: `Our count of the houses for sale on our site on ${DAY}, not counting builders' new homes. A house counts only if its listing says so, so the true share can be higher.` });

/* ---- Chart D (row 22): what big projects get back at sale. ---- */
const RIR_NAMES = { "New steel front door": "New steel front door", "Complete kitchen renovation": "Complete kitchen remodel", "Minor kitchen upgrade": "Minor kitchen upgrade",
  "Add new bathroom": "Add a bathroom", "New primary suite": "New primary bedroom suite", "Bathroom renovation": "Bathroom remodel" };
const RIR_CHART = G.bars(RIR.map(([n, v]) => ({ name: RIR_NAMES[n], value: v, valueText: `${v}%`, reference: n === "New steel front door" })),
  { caption: "Share of a project's cost that comes back when the house sells", nameLabel: "Project", valueLabel: "cost recovered", max: 100,
    note: "NAR and the National Association of the Remodeling Industry, 2025 Remodeling Impact Report. National figures for a 2,300 square foot house in good condition." });

/* ---- Row 21: the cheap fixes agents recommend, a plain list under thin rules. ---- */
const STAGE_NAMES = { "Declutter home": "Declutter", "Entire home cleaning": "Clean the whole house", "Improve curb appeal": "Tidy the front of the house (curb appeal)",
  "Professional photos": "Professional photos", "Minor repairs": "Minor repairs", "Carpet cleaning": "Clean the carpets",
  "Depersonalize home": "Put away family photos and personal things", "Paint touch ups": "Touch up the paint" };
const CHEAP = `<ul class="rp-pct" aria-label="Fixes agents recommend most, share of agents">`
  + STAGE.slice(0, 8).map(([n, v]) => `<li><strong>${v}%</strong><span>${STAGE_NAMES[n]}</span></li>`).join("") + `</ul>`;

/* ---- The pre-listing inspection: two plain columns (rows 17 to 19). ---- */
const PRE = `<div class="rp-two"><div><p class="k">For</p><ul>`
  + `<li>You learn what a buyer's inspector will find before you set the price, not in the last weeks of the sale.</li>`
  + `<li>You choose who does the repairs, and when.</li>`
  + `<li>You can price the house with the problems in mind.</li></ul></div>`
  + `<div><p class="k">Against</p><ul>`
  + `<li>The disclosure form asks what you know. Once you read the report, you know what it found.</li>`
  + `<li>The buyer can still order their own inspection. Under state law, the buyer still has the duty to inspect.</li>`
  + `<li>It costs money before you have a buyer.</li></ul></div></div>`;

/* ---- The one chooser: fix, credit or sell as is (rows 7, 10, 11, 19). ---- */
const card = (k, title, text) => `<li><span class="k">${k}</span><b>${title}</b>${text}</li>`;
const CHOOSE = `<ul class="rp-cards" aria-label="Fix it, give a credit, or sell as is">`
  + card("The buyer's loan requires it", "Fix it", "The lender can require a repair before closing. It can be a roof the lender will not accept, or damage to the structure.")
  + card("Help with costs", "Give a credit", "You pay toward the buyer's costs, and the buyer makes the repair after closing. The buyer's loan limits how much a seller can pay toward those costs.")
  + card("You will not fix it", "Sell as is", `Under South Carolina's disclosure law, buyer and seller can agree to an as-is sale. You still fill in the disclosure form. Our ${h.a("/sell/cash-offer/", "cash offer page")} covers selling as is to an investor.`)
  + `</ul>`;

/* ---- The glance row under the H1 (rows 1, 7, 24). ---- */
const GLANCE = PK.glance([
  { icon: "home", label: `${ROOF.eul_years} years`, text: "the average life HUD gives a shingle roof" },
  { icon: "cards", label: "About 1 in 6", text: `houses for sale here built ${2005} or earlier advertise a new roof` },
  { icon: "key", label: `About ${sv(RIR, "Complete kitchen renovation")}%`, text: "of a kitchen remodel's cost comes back at sale, in a national survey" },
]);

/* ---- The photos (VERIFY.md, Photos 1 and 2: CC BY-SA 3.0; never said to be local). ---- */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const ROOF_PHOTO = ph.aerial("worn-asphalt-shingles", PHOTOS[0].caption);
const TERMITE_PHOTO = ph.aerial("termite-damage-siding", PHOTOS[1].caption);
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, inspectors or tax advisers, and nothing on this page is legal or tax advice. For advice on your own sale, talk to a South Carolina attorney or a tax professional.</p>`;
const AFTER = () => { const c = ph.credits(); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* ---- The page's own styles (the pilots' treatment, prefix rp-). ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const INK = "#8a5226", RED = "#a8482f", RULE = "rgba(28,32,40,.16)";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line. */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance;max-width:720px}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  /* One block width (720 px, as the contents box and the offers). */
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  /* the worked table: plain rows under thin rules; on a phone each row is a block with labels */
  + `${S} .rp-tw{max-width:720px;margin:1.2rem 0 1.4rem}`
  + `${S} .rp-tab{width:100%;border-collapse:collapse;font-size:.98rem}`
  + `${S} .rp-tab caption{caption-side:top;text-align:left;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1.0625rem;margin-bottom:.6rem}`
  + `${S} .rp-tab thead th{padding:.5rem .7rem .5rem 0;border-bottom:2px solid var(--navy);color:var(--navy);text-align:left;vertical-align:bottom;font-family:var(--sans);font-size:.78rem;letter-spacing:.05em;text-transform:uppercase;line-height:1.3}`
  + `${S} .rp-tab tbody th,${S} .rp-tab td{padding:.75rem .7rem .75rem 0;border-bottom:1px solid ${RULE};vertical-align:top;text-align:left;line-height:1.5}`
  + `${S} .rp-tab tbody th{width:19%;color:var(--navy);font-family:var(--sans);font-weight:700}${S} .rp-tab td{color:var(--muted);width:27%}`
  + `${S} .rp-tab .no{color:#5f6066;font-family:var(--sans);font-size:.9rem;font-style:italic}`
  + `@media (max-width:699px){${S} .rp-tab thead{display:none}${S} .rp-tab,${S} .rp-tab tbody,${S} .rp-tab tr,${S} .rp-tab tbody th,${S} .rp-tab td{display:block;width:auto}`
  + `${S} .rp-tab tr{padding:.8rem 0;border-bottom:1px solid ${RULE}}${S} .rp-tab tbody th,${S} .rp-tab td{padding:0;border:0}${S} .rp-tab tbody th{font-size:1.1rem;margin-bottom:.35rem}`
  + `${S} .rp-tab td{margin:.35rem 0 0}${S} .rp-tab td::before{content:attr(data-l);display:block;color:${INK};font-family:var(--sans);font-size:.78rem;letter-spacing:.08em;text-transform:uppercase;font-weight:700}`
  + `${S} .rp-tab td:has(.no){display:none}${S} .rp-tab caption{display:block;width:auto}}`
  /* the age clock: plain rows under thin rules */
  + `${S} .rp-clock{list-style:none;margin:1rem 0 1.4rem;padding:0;max-width:720px}`
  + `${S} .rp-clock li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:.2rem 1.2rem;align-items:baseline;margin:0;padding:.7rem 0;border-top:1px solid ${RULE};font-family:var(--sans)}`
  + `${S} .rp-clock li:last-child{border-bottom:1px solid ${RULE}}${S} .rp-clock b{color:var(--navy);font-weight:600;line-height:1.35}${S} .rp-clock span{color:var(--muted);font-size:.98rem;white-space:nowrap}`
  + `${S} .rp-clock .past{color:${RED};font-weight:700}${S} .rp-clock .ok{color:#2f6b4a;font-weight:700}`
  + `@media (max-width:599px){${S} .rp-clock li{grid-template-columns:minmax(0,1fr) auto}${S} .rp-clock b{grid-column:1/-1}}`
  /* the systems list and the cheap fixes: plain items under thin rules */
  + `${S} .rp-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:1.1rem 2rem;max-width:720px}`
  + `${S} .rp-plain li{margin:0;padding:.85rem 0 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .rp-plain b,${S} .rp-cards b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.3rem}`
  + `${S} .rp-pct{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:0 2rem;max-width:720px}@media (min-width:700px){${S} .rp-pct{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .rp-pct li{display:flex;gap:1rem;align-items:baseline;margin:0;padding:.65rem 0;border-top:1px solid ${RULE};font-family:var(--sans)}`
  + `${S} .rp-pct strong{flex:none;width:3.2rem;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:1.45rem;line-height:1.1}${S} .rp-pct span{color:var(--navy);line-height:1.4}`
  /* for and against: two plain columns */
  + `${S} .rp-two{display:grid;gap:1rem 2rem;max-width:720px;margin:1.1rem 0 1.4rem}@media (min-width:700px){${S} .rp-two{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .rp-two .k,${S} .rp-cards .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .3rem}`
  + `${S} .rp-two ul{list-style:none;margin:0;padding:0}${S} .rp-two li{margin:0;padding:.7rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.55}`
  /* cards, only for the one chooser */
  + `${S} .rp-cards{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.75rem;max-width:720px}@media (min-width:760px){${S} .rp-cards{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .rp-cards li{margin:0;padding:1rem 1.1rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  /* A note with a left rule, at the text's size */
  + `${S} .rp-note{max-width:665px;margin:1.3rem 0 1.4rem;padding:.15rem 0 .15rem 1.1rem;border-left:3px solid #c4783a;color:var(--muted);line-height:1.6}`
  /* A wide screen: the chart or the photo beside the paragraphs that explain it. */
  + `@media (min-width:1100px){${S} .rp-side{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:auto auto 1fr;column-gap:2.5rem;max-width:1000px;align-items:start}`
  + `${S} .rp-side>*{grid-column:1}${S} .rp-side>.c3-gchart,${S} .rp-side>.c3-aerial{grid-column:2;grid-row:1/4;margin:.3rem 0 1.2rem!important;max-width:none!important}`
  + `${S} .rp-side>.c3-aerial figure{margin:0!important}${S} .rp-side .c3-gchart [role=row]{grid-template-columns:minmax(0,1fr)!important}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px}`
  + `${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.92rem}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .rp-plain b,${S} .rp-cards b,${S} a.btn,${S} div[style^="border-left:3px solid var(--brass)"]>p:first-child{text-wrap:balance}`
  /* the roof steps: a numbered plain list under thin rules */
  + `${S} .rp-steps{list-style:none;counter-reset:st;margin:1.1rem 0 1.4rem;padding:0;max-width:720px}`
  + `${S} .rp-steps li{counter-increment:st;position:relative;margin:0;padding:.85rem 0 .85rem 2.4rem;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6}`
  + `${S} .rp-steps li:last-child{border-bottom:1px solid ${RULE}}${S} .rp-steps li::before{content:counter(st);position:absolute;left:0;top:.75rem;font-family:var(--serif);font-size:1.45rem;line-height:1.1;color:${INK}}`
  + `${S} .rp-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.3rem}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* a phone: the three hero tiles as short rows, not squeezed columns */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid ${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid ${RULE}!important}}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from the pilots: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* The FAQ answers the searched questions the body does not repeat word for word: who pays for the CL-100 (row 27),
   roof age for insurance (row 28), how long a CL-100 is good for (row 16), repairs after the inspection (row 19) and
   tax (row 23). */
const FAQ = [
  { q: "Who pays for the CL-100 in South Carolina, the buyer or the seller?", a: "The state regulation for the report does not say who orders it or who pays for it. The buyer and seller agree on that in the sale contract. A buyer's lender can also ask for one before it lends." },
  { q: "How old can a roof be for insurance in South Carolina?", a: "We found no roof age limit in South Carolina's insurance laws. Insurers can still ask about the roof. The sample four-point form from Citizens, a Florida insurer, asks for the roof's age and its years of life left." },
  { q: "How long is a CL-100 good for?", a: "A CL-100 has no expiry date in the state regulation. A buyer's lender or the sale contract can ask for a report done within a set number of days." },
  { q: "Do I have to fix what the buyer's inspector finds?", a: "Not under South Carolina's disclosure law. You fix what you agree to fix in the sale contract, and a buyer's loan can still require some repairs before it closes." },
  { q: "Are repairs before selling tax deductible?", a: "The IRS treats painting and fixing leaks as repairs. Repairs do not go into your home's basis, what you paid plus improvements, unless they are part of a larger remodeling job. A new roof is an improvement and does. A tax professional can tell you how this applies to your sale." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "Repairs Before Selling in Myrtle Beach: Is the Roof Over 20?",
  description: "Repairs before selling a Horry County house: what to do about a roof near 20, what a buyer's lender, insurer and termite report check, and what to skip.",
  ogTitle: "Repairs before selling in Myrtle Beach: is the roof over 20 years old?",
  crumb: "Repairs Before Selling",
  eyebrow: "Selling a home",
  h1: "Repairs before selling in Myrtle Beach: is the roof over 20?",
  h1em: "Start with an old roof, the heating and air, and termites. Big remodels can wait.",
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: "What a buyer's lender, insurer and termite inspector check on a Horry County house, the cheap fixes that help, and the projects to skip.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Selling soon? Have us walk your house and name what a buyer's inspector will flag.", label: "Have us walk your house", href: CTA },
  author: "devin",
  shortAnswer: [
    "Fix what can stop a buyer's loan or insurance. That means a worn or leaking roof, heating or air that does not work, bare wiring, and termites or wet wood under the house.",
    `Then do the cheap things agents recommend most, such as decluttering, cleaning and tidying the front. Skip big remodels: in a national survey, a complete kitchen remodel got back about ${sv(RIR, "Complete kitchen renovation")} percent of its cost at sale.`,
    "South Carolina's disclosure law does not require a seller to make repairs. A buyer's lender, insurer or contract can.",
  ],
  sections: [
    { h2: "Which repairs can stop a house sale in Myrtle Beach?", toc: "What can stop a sale", id: "stop-a-sale", html: () =>
      ph.css() +
      h.p("The repairs that matter most are the ones a buyer's lender or insurer will not accept. Three inspections look for them: the appraisal for the buyer's loan, the insurer's four-point inspection and the termite report. Each one looks at different parts of the house:") +
      WHO +
      h.p(`The lender column uses the rules for an FHA loan, a home loan insured by the Federal Housing Administration. Its ${h.ext(HUD_HB, "appraiser's checklist")} is written down in detail, so this page uses it as the example. The appraiser runs the heat, the air conditioning and the plumbing. The lender decides which repairs are required.`) +
      h.p(`A buyer may use a regular loan instead. ${h.ext(FNMA, "Fannie Mae")} is a company that buys home loans from lenders. It does not buy one on a house with damage that affects its safety, soundness or structure until the damage is fixed. A cash buyer has no lender to satisfy.`) +
      h.h3("What a buyer's insurer asks") +
      h.p(`Some insurers ask for a four-point inspection before they insure an older house. The insurer column lists the questions on ${h.ext(CIT, "a sample four-point form from Citizens Property Insurance")}, an insurer in Florida. An insurer here can use its own form. A wind mitigation report is a different inspection, and our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")} covers it.`) },

    { h2: "Should you replace an old roof before selling?", toc: "An old roof", id: "how-old", html: (bg) =>
      h.p(`Not always. If it does not leak and a roofer finds at least two years of life left, an FHA loan's appraiser can accept it. A buyer's insurer may still ask how old it is. A roof that leaks, or has less life left, is the one to replace or to price into the sale.`) +
      h.p(`HUD, the federal housing department, gives an asphalt shingle roof an average life of ${ROOF.eul_years} years in its table of building parts. The table was made for repair budgets on apartment buildings. It is an average. A roof can last longer or fail sooner.`) +
      h.h3(`Example: a house built in ${HO.median_year_built}`) +
      h.p(`About half of Horry County's homes were built in ${HO.median_year_built} or earlier. A house built that year is ${MED_AGE} years old in 2026. If its parts are the ones it was built with, this is where each one stands on HUD's table:`) +
      CLOCK_LIST +
      h.p(`A metal roof is in the same table at ${METAL.eul_years} years. If a part was replaced after the house was built, the age that matters is the part's age, not the house's.`) +
      `<div class="rp-side">` +
      h.h3("What to do about an old roof that does not leak") +
      `<ol class="rp-steps" aria-label="An old roof before you list">`
      + `<li><b>Find out how old it is</b>Look for the roofer's invoice and the job's permit number. Horry County's ${h.ext(ROOF_LETTER, "roof letter")}, a form the owner or roofer signs in front of a notary for a roof job, also lists the permit number. The four-point form asks for the date of the last roofing permit.</li>`
      + `<li><b>Have a roofer look at it before you list</b>Ask for the years of life left, in writing. The four-point form asks for that number.</li>`
      + `<li><b>Decide once you have the roofer's letter</b>Two years or more: keep the letter with the house papers. Less than two: replace the roof, or price the house for a buyer who will.</li>`
      + `</ol>` +
      ROOF_PHOTO + `</div>` +
      h.cta("Not sure how old your roof is?", "Send us what you know about it: the year, the roofer, any papers. We tell you how a buyer's inspector and insurer will see it before you list.", "Have us check your roof's age", CTA, bg) },

    { h2: "Should you replace the heating and air, the water heater or the wiring before selling?", toc: "Heating, air and wiring", id: "systems", html: () =>
      h.p(`Replace one before selling if it does not work, or if it is missing what the buyer's appraiser checks. Air conditioners here run more than in a northern city such as Columbus, Ohio, by ${h.ext(NOAA, "NOAA's climate records")}.`) +
      `<ul class="rp-plain" aria-label="What a buyer's appraiser and insurer look at, part by part">`
      + `<li><b>Heat pump or air conditioner</b>HUD's table gives the outdoor unit ${OUT.eul_years} years and the indoor unit ${AH.eul_years}. The appraiser's checklist asks that the heat keep the house at 50 degrees or more. Central air is not required, but if the house has it, it must work, or the appraiser reports the cost to fix it. The four-point form wants a photo of the unit's dated label.</li>`
      + `<li><b>Water heater</b>HUD's table gives a home water heater ${WH.eul_years} years. The appraiser's checklist asks for its pressure-relief valve and the pipe from it. The valve lets escaping steam or hot water out safely through the pipe.</li>`
      + `<li><b>Wiring and the electrical panel</b>The main panel is the metal box of breakers. HUD's table gives it ${PANEL.eul_years} years, so on most houses here age is not the question. The four-point form asks the panel's brand, model and age. It also asks whether the house has any of three older kinds of wiring: aluminum, cloth-covered or knob-and-tube.</li>`
      + `<li><b>Aluminum wiring</b>Homes wired from 1965 to the mid-1970s ${h.ext(CPSC, "may have aluminum wiring")} in the circuits to outlets and lights. About ${n0(Math.round(HO.built_1960_to_1979.units / 1000) * 1000)} Horry County homes were built from 1960 to 1979. A house from those years is the one to have an electrician look at before a buyer's inspector does.</li>`
      + `</ul>` +
      h.p("A new heat pump or water heater that works is easy for a buyer to see and easy for an insurer to date. Keep the installer's invoice with the house papers.") },

    { h2: "What is a CL‑100, and what does it check?", toc: "The CL-100", id: "cl-100", html: (bg) =>
      h.p(`The CL-100 is South Carolina's termite and moisture report for a home sale or loan. It is written on the state's form, the Official South Carolina Wood Infestation Report. A buyer's FHA lender must confirm the house is free of termites, and the loan file must hold this report or a national one.`) +
      `<div class="rp-side">` +
      h.p(`Under ${h.ext(R1085, "state regulation 27-1085")}, a licensed pest control inspector writes it on the state's form and signs it with their own and the company's license numbers. The inspector looks at every part of the house they can reach, including the crawlspace and the attic. They probe any damage they see and take wood moisture readings across the crawlspace.`) +
      TERMITE_PHOTO +
      h.p("The report covers termites and other wood-destroying insects in every part the inspector can see and reach. It also covers rot below the main floor, plus rot in the bottoms of outside doors, door frames, steps and porch columns.") + `</div>` +
      `<ul class="rp-plain" aria-label="What the CL-100 reports">`
      + `<li><b>Wet wood under the house</b>The report flags "excessive moisture" when wood under the house reads 20 percent moisture or more, or water stands in the crawlspace. The usual fix is a plastic vapor barrier over the crawlspace soil, or more foundation vents.</li>`
      + `<li><b>Old damage</b>The report must list all damage, even damage left in places that were repaired before. Keep the papers from any past treatment or repair.</li>`
      + `<li><b>What it is not</b>It is not a warranty against termites, and it does not oblige the pest company to fix what it finds.</li>`
      + `</ul>` +
      h.p(`Older houses here are more likely to have a crawlspace. About 4 in 10 houses for sale built in 1985 or earlier list a crawlspace, against about 1 in 35 built 2006 to 2015. Most newer houses for sale here list a slab foundation, a concrete floor poured on the ground, with no crawlspace to get wet.`) +
      h.cta("Got a CL-100 or an inspection report you do not understand?", "Send it to us. Our agents read it with you and mark what a buyer will ask you to fix.", "Send us the report", CTA, bg) },

    { h2: "What are other sellers in Horry County fixing before they list?", toc: "What other sellers fix", id: "other-sellers", html: () =>
      h.p(`Older houses for sale here advertise new roofs and new heating and air. Of the houses for sale in Horry County built in 2005 or earlier, about 1 in 6 advertise a new roof. About 1 in 8 advertise new heating and air.`) +
      ROOF_CHART +
      h.p(`We read the listing of every house for sale in Horry County on our site and counted the ones that say so. These houses compete with yours. A buyer who sees "new roof" on the house next door will ask about yours. Here are some of them:`) +
      G.homesCss() + G.homes("new-roof-houses", "houses with a new roof", "", "Houses for sale now that list a new roof") },

    { h2: "Which cheap fixes help a house sell?", toc: "Cheap fixes that help", id: "cheap-fixes", html: () =>
      h.p(`Clearing out, cleaning and tidying the front of the house help most, in ${h.ext(NAR_STAGE, "NAR's 2025 national survey of agents")}. These were the fixes agents most often recommended to sellers. NAR is the National Association of Realtors, and curb appeal is how the house looks from the street.`) +
      CHEAP +
      h.p("Each number is the share of agents who recommended that fix to sellers.") },

    { h2: "Is a kitchen or bathroom remodel worth it before selling?", toc: "What not to spend on", id: "remodel", html: (bg) =>
      h.p(`Usually not. In ${h.ext(RIR_PDF, "NAR's 2025 national remodeling report")}, a complete kitchen remodel got back about ${sv(RIR, "Complete kitchen renovation")} percent of its cost when the house sold. A bathroom remodel got back about ${sv(RIR, "Bathroom renovation")} percent.`) +
      RIR_CHART +
      h.p("The report's list of top projects has no row for a new roof or new heating and air, so the chart cannot show one. Agents in the same report told sellers to paint the whole house or put on a new roof more often than to upgrade the kitchen.") +
      h.cta("Which fixes are worth it on your house?", "Send us the address. We price your house as it is and fixed up, from recorded sales near it, so you can see which fixes a buyer will pay for.", "Have us price it as is and fixed", CTA, bg) },

    { h2: "Should you get a pre-listing inspection before selling?", toc: "A pre-listing inspection", id: "pre-listing", html: () =>
      h.p("A pre-listing inspection is a home inspection you order before the house goes on the market. It is most useful on an older house, where the roof, the heating and air or the wiring may be near the end of its life. There are reasons for and against one:") +
      PRE +
      h.p(`Our page on the ${h.a("/sell/seller-disclosure/", "seller disclosure form")} covers what happens when you attach a report to the form, and goes through the form question by question. A South Carolina real estate attorney can tell you how the disclosure law treats a report you paid for.`) },

    { h2: "Fix it, give a credit, or sell as is?", toc: "Fix, credit or as is", id: "fix-or-credit", html: () =>
      h.p("Before you list, and again after the buyer's inspection, you have three choices on each problem:") +
      CHOOSE +
      h.p("To choose between a fix and a credit, get a written price for the fix and compare it with what the buyer asks for. This page gives no repair prices. They change with the house and the company, and we found no public source for prices here.") +
      h.p("If something changes after you hand over the disclosure form, such as a new leak, state law says you correct the form or make reasonable repairs before closing.") +
      h.p(`Our ${h.a("/sell/net-proceeds/", "net proceeds calculator")} shows what a credit or a lower price leaves you.`) },
  ],
  pageImages: () => {
    const P = require(path.join(BB, "tools", "photos.js"));
    const m = P.metaFor(PHOTOS[0], { adapted: true });
    const rights = { creator: { "@type": m.creatorType, name: m.creator }, creditText: m.credit, copyrightNotice: m.copyright, license: m.license, acquireLicensePage: m.acquire, isBasedOn: PHOTOS[0].source };
    const im = (file, w, hh) => Object.assign({ "@type": "ImageObject", url: `https://chapter3realty.com/${file}`, contentUrl: `https://chapter3realty.com/${file}`, width: w, height: hh, encodingFormat: "image/webp", description: PHOTOS[0].alt }, rights);
    return [im(PHOTOS[0].crops["1x1"].path, 1200, 1200), im(PHOTOS[0].file, PHOTOS[0].width, PHOTOS[0].height), im(PHOTOS[0].crops["16x9"].path, 1200, 675)];
  },
  afterSources: () => AFTER(),
  faqTitle: "Repairs before selling FAQ",
  faq: FAQ,
  sources: [
    { name: "HUD Handbook 4000.1", href: HUD_HB },
    { name: "HUD useful life table", href: HUD_EUL },
    { name: "Fannie Mae B4-1.3-06", href: FNMA },
    { name: "Citizens inspections", href: CIT },
    { name: "Horry County roof letter", href: ROOF_LETTER },
    { name: "SC Reg. 27-1085", href: R1085 },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC disclosure form", href: SC_FORM },
    { name: "Census ACS 2025", href: ACS },
    { name: "NOAA climate normals", href: NOAA },
    { name: "CPSC Pub. 516", href: CPSC },
    { name: "NAR 2025 staging", href: NAR_STAGE },
    { name: "NAR and NARI 2025", href: RIR_PDF },
    { name: "IRS Pub. 523", href: IRS523 },
  ],
  sourcesNote: `Houses for sale counted from the listings on our site, Horry County, ${DAY}, in aggregate. Home ages: Census ACS 2025 1-year, all homes.`,
  bottomCta: { h2: "Get your house ready for a buyer's inspector", p: "Send us the address. Our agents tell you what to fix first, what to leave, and what a buyer's lender and insurer will ask for.", label: "Have us make your fix list", href: CTA },
  keywords: "what to fix before selling a house, repairs before selling house Myrtle Beach, should I replace roof before selling, four point inspection SC, CL-100 termite letter, wood infestation report South Carolina, pre-listing inspection pros and cons, what not to fix when selling a house, seller credit for repairs, termite letter SC",
  about: "Repairs before selling a house in Myrtle Beach and Horry County, South Carolina",
});
