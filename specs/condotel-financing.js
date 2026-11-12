/* /invest/condotel-financing/ - condotel financing in Myrtle Beach: which loans work on a unit in a building run like
 * a hotel, what makes a building a condotel, four hotel-run oceanfront buildings with what their resort desk gives an
 * owner, the unit test one published condotel program asks, whether the harder loan is worth it, and who arranges it.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/invest-condotel-financing/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and CORRECTED
 * rows (3, 5, 6, 8, 12, 16, 17, 23, 26) only in the verifier's wording (VERIFY.md). Struck wording:
 * batches/2026-11-b/facts/invest-condotel-financing-struck.json. Never on this page: a down-payment or loan-to-value
 * percentage (rows 27, 28; PLAYBOOK A17 names this page), an interest rate or a payment, "an FHA borrower signs" (row 6),
 * the listing loan-box counts (row 15), the live page's "same lender fees" lines and its story (not in the story bank).
 * Data, never typed: data/2026-11-b/invest-condotel-financing/ (counts.json, findings.json, raw/verify/beds-sqft.json)
 * and, for the four buildings' sizes, the condo-buildings data (data/2026-11-b/invest-condo-buildings/building-fees.json;
 * rows 14 and 32). Corrected rows whose data files still hold the researcher's first figures
 * (16, 17, 8) are typed at the verifier's values, with the row number beside each and a check that fails if the file moves.
 * Design, as /invest/strategies/1031-exchange/ and /submarkets/garden-city/ (owner-approved 2026-11-08): the italic line
 * at about half the H1's size, one card style for the chart and the offers, plain tables and lists under thin rules,
 * one block width of 720 px, an offer after about every second section, each tied to that section.
 * Owner, 2026-11-10: every building sold on the page leads with a true, sourced wow; strip titles are bold and personal;
 * every request button links to /contact/ and the site opens the short pop-up.
 * Not the directory's lines (fix round 1): /invest/condo-buildings/ owns each building's wow. Here each building leads
 * with its hotel side (the resort's desk, its booking, what it tells owners), in the resort's own words.
 * Homes: four building strips in "Which buildings run like hotels" (places landmark-resort, ocean-creek-resort,
 * compass-cove, seawatch-resort, from batches/2026-10-b/data/idx-places.json). Each place needs this URL in its pages,
 * and this URL's feed needs withStrips: true (idx-lib/edge.js drops the feed on a page with slots otherwise). Both are
 * for the lead (BUILD.md); until then each strip shows its offer pill.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condotel-financing/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-condotel-financing");
const CBD = path.join(__dirname, "..", "data", "2026-11-b", "invest-condo-buildings");
const read = (dir, f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
const C = read(DATA, "counts.json"), F = read(DATA, "findings.json"), BS = read(DATA, "raw/verify/beds-sqft.json");
const FEES = read(CBD, "building-fees.json").buildings;
const must = (ok, msg) => { if (!ok) throw new Error(`condotel-financing.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n0(Math.round(v / 1000) * 1000);
const NB = " ";

/* ---- Row 11: oceanfront condos for sale, and those whose listing says the unit is in a rental program. ---- */
const OF = C.groups.oceanfront_building, IP = C.groups.in_program;
must(OF.listings === 1093 && IP.listings === 885 && F.in_program_share_of_oceanfront === 81, "row 11 moved");
const IN_TEN = Math.round(IP.listings / OF.listings * 10);
must(IN_TEN === 8, "row 11: no longer about 8 in 10");
const PULLED = new Date(C.pulled);
must(!isNaN(PULLED), "counts.json pulled is not a date");
const PULL_DAY = PULLED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/* ---- Rows 12 and 13 (12 CORRECTED: "more than 3 in 4", with the bedroom line). ---- */
must(BS.n === IP.listings && BS.ge500_and_1bed === 678 && BS.ge500_studio === 8 && BS.lt500_1bed === 28 && BS.lt500_studio === 171, "row 12 verifier pass moved");
must(BS.ge500_and_1bed / BS.n > 0.75 && BS.ge500_and_1bed / BS.n < 0.8, "row 12: no longer more than 3 in 4");
must(IP.studios === 179 && BS.studios === 179 && BS.ge500_studio + BS.lt500_studio === IP.studios, "row 13 moved");

/* ---- Row 14: buildings in the directory whose middle unit for sale is under 500 sq ft (10 or more for sale). ---- */
const SMALL = F.directory.median_unit_under_500_sqft_10plus_for_sale;
const SHORT = { "Sea Mist Resort": "Sea Mist", "Sands Ocean Club": "Sands Ocean Club", "Landmark Resort": "Landmark", "Ocean Reef Resort": "Ocean Reef", "Bluewater Resort": "Bluewater" };
must(SMALL.length === 5 && SMALL.every((b) => SHORT[b.name] && b.sqft_median < 500 && b.for_sale >= 10), "row 14 moved");
const SMALL_NAMES = SMALL.map((b) => SHORT[b.name]);
const SMALL_LIST = SMALL_NAMES.slice(0, -1).join(", ") + " and " + SMALL_NAMES[SMALL_NAMES.length - 1];

/* ---- Rows 7, 8 (CORRECTED: at least 6 of the 47), 16 (CORRECTED: 23 of 47), 17 (CORRECTED: 784 sales, 43
   buildings, 11,471 units). findings.json still holds the first figures (22; 804 and 11,822): typed here. ---- */
const DIR = F.directory.buildings;
must(DIR === 47, "the directory is no longer 47 buildings");
const VA_OK = 6;                                                                       // row 8, CORRECTED
const RESORT_NAMES = 23;                                                               // row 16, CORRECTED
must(F.directory.resort_or_hotel_common_name === 22, "row 16: findings.json moved; re-read the verifier's count");
const SALES = { n: 784, buildings: 43, units: 11471 };                                 // row 17, CORRECTED
must(F.directory.sales_year === 804 && F.directory.units === 11822, "row 17: findings.json moved; re-read the corrected sums");
const SALES_IN = Math.round(SALES.units / SALES.n);
must(SALES_IN === 15 && Math.round(SALES.n / 10) * 10 === 780, "row 17: no longer about 780, about 1 in 15");

/* ---- The four buildings: row 14's sizes (the condo-buildings data); row 32 for SeaWatch (only a few for sale). ---- */
const B = (slug) => { const b = FEES[slug]; must(b && b.total >= 10 && b.sqft_median, `no size data for ${slug}`); return b; };
const LM = B("landmark"), OC = B("ocean-creek"), CC = B("compass-cove");
must(LM.sqft_median === 431 && OC.sqft_median === 827 && CC.sqft_median === 550, "row 14 building sizes moved");
const SW = FEES["seawatch"];                                                           // row 32: 5 for sale, so no B()
must(SW && SW.sqft_median > 500 && SW.sqft_median < 550 && (SW.beds["0"] || 0) * 2 < SW.total, "row 32: SeaWatch no longer just over 500 sq ft, mostly with a bedroom");
/* Under 500 sq ft to the nearest 5, as the ledger gives them (385, 430); larger to the nearest 10 (550, 830). */
const sq = (b) => n0(b.sqft_median < 500 ? Math.round(b.sqft_median / 5) * 5 : Math.round(b.sqft_median / 10) * 10);
const studios = (b) => b.beds["0"] || 0;
must(studios(LM) * 2 > LM.total, "row 14: Landmark no longer mostly studios");
const ocOneTwo = (OC.beds["1"] || 0) + (OC.beds["2"] || 0);
must(ocOneTwo * 10 >= OC.total * 8, "row 14: Ocean Creek no longer mostly one and two bedrooms");
const ccStudio = Math.round(studios(CC) / CC.total * 10);
must(ccStudio === 4, "row 14: Compass Cove no longer about 4 in 10 studios");

/* ---- The photo (record in data/2026-11-b/invest-condotel-financing/photos.json: the USGS 2011 oblique aerial that
   /hoa/reserves/ and /buyers/va-loans/ show, public domain, looked at full size again for this page). It shows oceanfront
   towers with their pools and umbrellas behind the dunes, beside the sentence about hotel-run oceanfront buildings. Its
   caption says only what it shows and names no building. It is also the page's share image. ---- */
const PHOTOS = read(DATA, "photos.json").photos;
const TOWERS = PH.findPhoto(PHOTOS, "myrtle-beach-oceanfront-towers-2011");
const TOWERS_CAP = "Oceanfront towers in Myrtle Beach, with pools and rows of beach umbrellas behind the dunes, seen from a plane over the ocean.";
const TOWERS_PHOTO = PH.heroPhoto(TOWERS, { alt: TOWERS.alt, caption: TOWERS_CAP, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
/* One photo: drop the kit's plural note ("resized these photos"); the record's own line already says what was changed. */
const CREDITS = PH.creditsList([{ photo: TOWERS, caption: "Oceanfront towers in Myrtle Beach" }])
  .replace(/<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.<\/div>/, "");
must(!/resized these photos/.test(CREDITS) && /resized the photo/.test(CREDITS), "photo credits: the one-photo line changed");

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const FRE = "https://guide.freddiemac.com/app/guide/section/5701.3";
const FHFA = "https://www.fhfa.gov/about/fannie-mae-freddie-mac";
const HUD4000 = "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18-Redline.pdf";
const HUDLIST = "https://entp.hud.gov/idapp/html/condlook.cfm";
const VA = "https://lgy.va.gov/lgyhub/condo-report";
const NEWREZ = "https://www.newrezwholesale.com/media/b0hbzabm/smart-product-project-checklist-3-2026.pdf";
const LANDMARK = "https://www.landmarkresort.com/";
const OCEANCREEK = "https://www.oceancreek.com/";
const COMPASS = "https://www.compasscove.com/";
const SEAWATCH = "https://www.seawatchresort.com/";
const SANDS = "https://www.sandsresorts.com/";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ASK = "/contact/";
const PHONE = "854.333.2135";

/* ---- V1: the loan table (rows 1, 5, 6, 7, 8, 9, 10). A real table; on a phone each row folds to the loan, then the
   answer, then the reason. ---- */
const LOANS = [
  ["Conventional loans (Fannie Mae and Freddie Mac)", "No", `Fannie Mae will not take a building run as a hotel, or one with a rental pool. A resort company that manages the building and rents units for owners rules it out too. ${h.ext(FRE, "Freddie Mac")} will not take a condo hotel.`],
  ["FHA", "No", `FHA ${h.ext(HUD4000, "will not insure a loan on a condotel")}, or approve a building with a required rental pool. None of the ${DIR} oceanfront buildings in our directory is on ${h.ext(HUDLIST, "HUD's approved condo list")}.`],
  ["VA", "Only a home you live in", `A VA buyer certifies that they will live in the home. At least ${VA_OK} of the ${DIR} buildings in our directory have an accepted record on ${h.ext(VA, "the VA's condo list")}.`],
  ["Condotel loans", "Yes, if the unit qualifies", "These loans are made outside the Fannie Mae, Freddie Mac and FHA rules. Each lender makes its own rules for the unit and the building."],
];
const LOAN_TABLE = `<div class="cf-tw"><table class="cf-tab"><caption>Which loans work on a unit in a Myrtle Beach building run like a hotel</caption>`
  + `<thead><tr><th scope="col">Loan</th><th scope="col">Works?</th><th scope="col">Why</th></tr></thead><tbody>`
  + LOANS.map(([l, a, w]) => `<tr><th scope="row">${l}</th><td class="ans"><span class="l">Works?</span>${a}</td><td class="why"><span class="l">Why</span>${w}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* ---- V2: the size chart (row 12 CORRECTED, row 13). One message in the title. ---- */
const SIZE_CHART = G.bars([
  { name: `500${NB}sq${NB}ft or more, with a bedroom`, value: BS.ge500_and_1bed, valueText: `${n0(BS.ge500_and_1bed)} condos` },
  { name: `Under 500${NB}sq${NB}ft, with a bedroom`, value: BS.lt500_1bed, valueText: `${n0(BS.lt500_1bed)} condos` },
  { name: "Studios, any size", value: IP.studios, valueText: `${n0(IP.studios)} condos` },
], {
  caption: "More than 3 in 4 rental-program condos for sale have 500 square feet and a bedroom",
  nameLabel: "Size and bedrooms", valueLabel: "Condos for sale",
  format: (v) => n0(v),
  note: `Oceanfront condos for sale in Horry County whose listing says the unit is in a rental program, ${n0(IP.listings)} in all, our count on ${PULL_DAY}. Sizes as the listing gives them. The lines are one published condotel program's.`,
});

/* ---- The four buildings. Each leads with its hotel side, a true thing from the resort's own site (rows 18, 20, 21,
   31, 32), never the line /invest/condo-buildings/ opens the same building with. Then what the unit's size means for
   the loan, then its homes strip. Sea Mist is out (fix round 1): its one wow, the water park, is struck (CB row 50),
   and its price and place are the directory's lines. ---- */
const entry = (n, id, head, body, slug, place, strip) => `<div class="cf-b" id="${id}"><h3 class="cf-bh"><span class="cf-n">${n}</span><span>${head}</span></h3>${body}</div>`
  + G.homes(slug, place, G.offer(place, { label: `Send me units at ${place}` }), strip);
const BUILDINGS = [
  entry(1, "landmark-resort", "Landmark Resort: three 40-foot slides for the resort's own guests",
    h.p(`Landmark's ${h.ext(LANDMARK, "H2Oasis water park")} has three 40-foot slides, and it is open only to guests who book through the resort's on-site rental program. The desk that sells those stays also fills an owner's calendar. Units run from hotel rooms to three-bedroom penthouses.`)
    + h.p(`The typical unit for sale is about ${sq(LM)} square feet, and more than half are studios. Here the one unit decides the loan.`),
    "landmark-resort", "Landmark Resort", "Own at Landmark, where the resort's guests get three 40-foot slides"),
  entry(2, "ocean-creek-resort", "Ocean Creek Resort: 13 water features and its own booking desk",
    h.p(`${h.ext(OCEANCREEK, "Ocean Creek")} has 13 water features, from the oceanfront pool at the Beach Club to an indoor pool and whirlpool. The resort books its guests on its own site, and says TripAdvisor gave it a Traveler's Choice award.`)
    + h.p(`The typical unit for sale is about ${sq(OC)} square feet, and most have one or two bedrooms. Most units here clear the size line with room to spare.`),
    "ocean-creek-resort", "Ocean Creek Resort", "Ocean Creek condos, with 13 water features and its own booking desk"),
  entry(3, "compass-cove", "Compass Cove: a resort that calls its owners partners",
    h.p(`${h.ext(COMPASS, "Compass Cove")} tells owners, "you are our partner and we treat your property as if we own it." Its desk takes guests' reservations, and it says its aim is to earn owners the most rent. Guests have six indoor and outdoor pools and seven hot tubs.`)
    + h.p(`The typical unit for sale is about ${sq(CC)} square feet, and about ${ccStudio} in 10 are studios. The size and the bedroom decide each unit's loan.`),
    "compass-cove", "Compass Cove", "Compass Cove condos, at a resort that calls its owners partners"),
  entry(4, "seawatch-resort", "SeaWatch Resort: a concierge for your guests",
    h.p(`${h.ext(SEAWATCH, "SeaWatch")} calls itself one of the best hotels in South Carolina. Its site lists a concierge, a business center and a golf and entertainment desk for guests. It books stays on its own site.`)
    + h.p(`Most units for sale have a bedroom, and the typical one is just over 500 square feet, right at the size line. We check the one unit before you offer.`),
    "seawatch-resort", "SeaWatch Resort", "Own at SeaWatch, a resort that calls itself one of S.C.'s best hotels"),
].join("");

/* ---- The page's own styles. One card style (the glass surface of the chart and the offers); tables and lists sit on
   the page under thin rules. As /invest/strategies/1031-exchange/. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  /* the contents list: no card, in columns between two thin rules */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* the headline: the italic line at about half the H1's size; the hero sub is said by the short answer */
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  /* one block width */
  + `${S} .c3-gchart,${S} .cf-tw,${S} .cf-plain,${S} .cf-b,${S} .c3-offer{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-gchart .v{font-weight:600}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  /* the loan table: plain, under thin rules; on a phone each row folds */
  + `${S} .cf-tw{margin:1.3rem 0 1.4rem}`
  + `${S} .cf-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .cf-tw caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem}`
  + `${S} .cf-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .cf-tw tbody th{text-align:left;font-weight:600;padding:.75rem .9rem .75rem 0;border-bottom:${RULE};line-height:1.4;vertical-align:top;width:27%}`
  + `${S} .cf-tw td{padding:.75rem .8rem .75rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.5}`
  + `${S} .cf-tw td.ans{font-weight:700;width:19%}${S} .cf-tw td.why{color:var(--muted);font-size:1rem}`
  + `${S} .cf-tw td .l{display:none}`
  + `@media (max-width:599px){${S} .cf-tab,${S} .cf-tab tbody,${S} .cf-tab caption{display:block;width:100%}`
  + `${S} .cf-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .cf-tab tr{display:block;padding:.8rem 0;border-bottom:${RULE}}`
  + `${S} .cf-tab th,${S} .cf-tab td{display:block;border:0!important;padding:0!important;width:auto!important}`
  + `${S} .cf-tab tbody th{padding-bottom:.3rem!important}${S} .cf-tab td.ans{color:${INK};padding-bottom:.25rem!important}}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .cf-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .cf-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .cf-plain li:last-child{border-bottom:${RULE}}${S} .cf-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  + `${S} .cf-sub{font-family:var(--sans);font-size:.95rem;letter-spacing:.08em;text-transform:uppercase;color:${INK};font-weight:700;margin:1.6rem 0 .2rem}`
  /* the buildings: a numbered headline, two short paragraphs, then the strip or its pill, with room before the next */
  + `${S} .cf-b{margin:2.2rem 0 0;padding-top:1.4rem;border-top:${RULE}}`
  + `${S} .cf-bh{display:flex;align-items:baseline;gap:.65rem;font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:0 0 .7rem;line-height:1.3}`
  + `${S} .cf-n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:50%;background:rgba(196,120,58,.16);color:${INK};font-family:var(--sans);font-weight:700;font-size:.95rem;position:relative;top:-.12rem}`
  + `${S} .cf-b+.hx-strip:not(:empty){margin-top:1.1rem}${S} .cf-b+.hx-strip+.hx-fallback .c3-offer{margin:.4rem 0 .6rem}`
  + `${S} .cf-after{margin-top:1.8rem;padding-top:1.3rem;border-top:${RULE};max-width:720px}`
  + `${S} .cf-disc{font-family:var(--sans);font-size:.95rem;line-height:1.6;color:var(--muted);max-width:640px;margin:.4rem 0 1.2rem;padding:.75rem 1rem;border-left:3px solid var(--brass);background:rgba(255,255,255,.45);border-radius:0 12px 12px 0}`
  /* Work-arounds copied from /invest/strategies/1031-exchange/: the feed's search row at 320 px, the header phone at
     1000 to 1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="cf-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
/* Row 29: the approved wording and the disclosure, word for word from the live non-warrantable page. */
const BRICKWOOD = "Chapter3 Realty Corp has a business relationship with BrickWood Mortgage (NMLS #189497). Because of this relationship, this referral may provide Chapter3 Realty a financial or other benefit. You are never required to use BrickWood. You are free to shop any lender.";
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage, not a lender. Loan rules change, and the lender confirms the building and the unit.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "What is a condotel in Myrtle Beach?", a: "A condo building run like a hotel. Each unit has its own owner, and the resort or the HOA rents units to vacationers by the night, with guest registration and cleaning." },
  { q: "Can I use an FHA loan on a Myrtle Beach condotel?", a: `No. FHA will not insure a loan on a condotel or approve a building with a required rental pool. None of the ${DIR} oceanfront buildings in our directory is on HUD's approved condo list.` },
  { q: "Can I use a VA loan on a condotel?", a: `Only for a home you will live in, because a VA buyer certifies that they will move in. At least ${VA_OK} of the ${DIR} oceanfront buildings in our directory have an accepted VA record.` },
  { q: "What is the difference between a condotel and a non-warrantable condo?", a: "Every condotel is non-warrantable, but not every non-warrantable building is a condotel. A building can fail the lender rules for other reasons, and our non-warrantable condo guide covers them." },
  { q: "Do condotel loans need a bigger down payment?", a: "Yes. A DSCR loan on a condotel usually takes more down than a DSCR loan on other homes. The lenders' own figures are in our non-warrantable condo guide." },
  { q: "Can I stay in my own condotel unit?", a: "Each building has its own rules on owner stays, and they matter for the loan. Fannie Mae counts limits on owner stays as a sign of a hotel, and one condotel program will not take a building with them. We read the rules before you offer." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Condotel Financing in Myrtle Beach: Which Units Qualify",
  description: "Condotel financing in Myrtle Beach: which loans work on a hotel-run unit, the 500-square-foot unit test, and the oceanfront buildings run like hotels.",
  /* The aerial's 1x1, 4x3 and 16x9 crops: Article.image and the share image. */
  pageImages: () => PH.pageImages(TOWERS),
  ogTitle: "Condotel financing in Myrtle Beach: which loans work, which units qualify, and which oceanfront buildings run like hotels",
  crumb: "Condotel Financing",
  eyebrow: "Condo loans",
  h1: "Condotel financing in Myrtle Beach: which loans work, and which units qualify",
  h1em: "A bank says no because of the building, not your credit. The size of the unit decides what works instead.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: "Which loans close on a Myrtle Beach condotel unit, which units qualify, and which oceanfront buildings run like hotels.",
  heroMedia: CSS + G.homesCss(),
  heroCta: { title: "Send us the building and the unit. We tell you which loan fits it.", label: "Ask which loan fits", href: ASK },
  author: "devin",
  shortAnswer: [
    `Fannie Mae, Freddie Mac and FHA loans do not work in a Myrtle Beach building run like a hotel. About ${IN_TEN} in 10 oceanfront condos for sale here say the unit is in a rental program.`,
    `Condotel loans do work when the unit itself is big enough. One published condotel program asks for 500 square feet, a separate bedroom and a full kitchen. More than 3 in 4 rental-program condos for sale have the size and the bedroom.`,
  ],
  sections: [
    { h2: "Can you get a mortgage on a condotel in Myrtle Beach?", toc: "Which loans work", id: "which-loans", html: () =>
      h.p(`Yes, but not with the loans most buyers know. Fannie Mae and Freddie Mac, ${h.ext(FHFA, "the two companies Congress created to buy mortgages from lenders")}, will not buy a loan in a condo hotel. FHA will not insure one. The rule is about the building, so a strong credit score does not change it.`) +
      LOAN_TABLE +
      h.p(`One kind of condotel loan, ${h.a("/invest/strategies/dscr-loans/", "a DSCR loan")}, qualifies on the unit's rent instead of your income. A cash buyer needs no lender to approve the building.`) },

    { h2: "What makes a Myrtle Beach condo a condotel?", toc: "What a condotel is", id: "what-is-a-condotel", html: (bg) =>
      h.p(`A condotel is a condo building run like a hotel. Each unit has its own owner, but the building is managed and operated as a hotel. These are the signs ${h.ext(FNMA, "Fannie Mae lists")}, put as what you see on a visit:`) +
      plain([
        ["Guest registration and short stays", "Guests register with the building, and the HOA or its manager rents units by the day or for short stays."],
        ["Hotel services", "Daily cleaning, a central phone line and a central key system."],
        ["A rental pool", "Owners pool their units with the HOA or the manager and share the rent, whether the papers require it or not."],
        ["A resort company in charge", "A hotel or resort company manages the building and also rents units for owners."],
        ["Limits on owners", "Rules on when owners may stay or how they decorate, or an HOA licensed as a hotel or resort."],
        ["A resort name", "Fannie Mae will not take a building whose name contains hotel, motel or resort, unless the word only refers to the building's past use. Hotel marketing and a hotel rating on booking sites count too."],
      ]) +
      h.p(`${RESORT_NAMES} of the ${DIR} oceanfront buildings in our directory go by a name with Resort or a hotel brand in it. Freddie Mac has its own tests, and it reads the building's papers and services to decide what is a condo hotel.`) +
      h.p(`Every condotel is non-warrantable. Not every non-warrantable building is a condotel. ${h.a("/invest/non-warrantable-condos/", "Our non-warrantable condo guide")} covers the other reasons a building fails the lender rules.`) +
      h.cta("Not sure your building counts as a condotel?", "Send us its name. We read its rental program papers and tell you which loan fits.", "Send us the building", ASK, bg) },

    { h2: "Which Myrtle Beach oceanfront buildings run like hotels?", toc: "Hotel-run buildings", id: "buildings", html: () =>
      h.p(`Most of them do. That is the ${IN_TEN} in 10 oceanfront listings in Horry County that name a rental program. Buildings like these are usually non-warrantable because so many owners are investors. We see that as a good sign too: the building is run for renting, which is what you want.`) +
      TOWERS_PHOTO +
      h.p("These four Grand Strand resorts show what a resort's desk does for an owner, and what the unit's size means for the loan.") +
      BUILDINGS +
      `<div class="cf-after">` + h.p(`Resorts market themselves as hotels, and lenders read it. Every oceanfront building, with its fee and what it offers, is in ${h.a("/invest/condo-buildings/", "our oceanfront condo building directory")}.`) + `</div>` },

    { h2: "Condotel loan requirements: what does the unit need?", toc: "What the unit needs", id: "requirements", html: (bg) =>
      h.p(`${h.ext(NEWREZ, "One published condotel program")} asks for at least 500 square feet, a separate bedroom and a full kitchen. The kitchen means a sink, a refrigerator, a range or cooktop, and an oven.`) +
      h.p("Fannie Mae's own warning line is lower. A unit under 400 square feet, or one with no full-size kitchen appliances, makes a lender look harder.") +
      SIZE_CHART +
      h.p(`${["", "One", "Two", "Three", "Four", "Five", "Six"][SMALL.length]} buildings in our directory have a typical unit for sale under 500 square feet: ${SMALL_LIST}. There the one unit decides the loan, so we check its size, its bedroom and its kitchen before you offer.`) +
      h.p("The building has rules too. The program above looks for three things, and makes exceptions case by case:") +
      plain([
        ["No rental pool", "It will not take a building whose rental desk pools the units, by choice or by rule."],
        ["Owners free to stay", "Owners may use the unit all year, with no blackout dates."],
        ["The money in order", "Reserves set aside for repairs, and few owners behind on their dues."],
      ]) +
      h.p(`These loans take more cash at closing. A DSCR loan on a condotel usually takes more down than a DSCR loan on other homes. The lenders' own figures are in ${h.a("/invest/non-warrantable-condos/", "our non-warrantable condo guide")}.`) +
      h.cta("Have us check a unit before you offer.", "We confirm the size, the bedroom, the kitchen and the building's rental rules, before you pay for an offer or an inspection.", "Have us check my unit", ASK, bg) },

    { h2: "Is a condotel worth the harder loan?", toc: "Worth it?", id: "worth-it", html: () =>
      h.p("A condotel is worth the harder loan for a buyer who wants the resort to do the renting. What you gain, and what it costs you:") +
      `<p class="cf-sub">What you gain</p>` +
      plain([
        ["The resort does the hotel work", `Its desk takes the bookings and its staff cleans between guests. At ${h.ext(SANDS, "Sands Resorts")}, the company says only its rental program's guests get all of the resort's amenities.`],
        ["Units that sell", `About ${n0(Math.round(SALES.n / 10) * 10)} units sold in a year in ${SALES.buildings} of the directory's oceanfront buildings, about 1 in ${SALES_IN} of their units. In a resort of 300 units, that is about ${Math.round(300 / SALES_IN)} sales a year.`],
      ]) +
      `<p class="cf-sub">What it costs you</p>` +
      plain([
        ["Fewer lenders, now and when you sell", "Fewer lenders make condotel loans, and your next buyer needs one too, unless they pay cash."],
        ["Fees to buy in", `Expect an HOA transfer fee and a few months of dues held in escrow at closing, as in most HOAs. ${h.a("/hoa/estoppel-and-transfer-fees/", "Our guide to transfer fees")} has the details.`],
      ]) +
      h.p(`Whether a beach condo makes a good rental is in ${h.a("/invest/condos/", "our guide to Myrtle Beach condos as investments")}. What a resort's program keeps from the rent is in ${h.a("/invest/rental-program-vs-airbnb/", "rental program vs Airbnb")}.`) },

    { h2: "Who makes condotel loans for Myrtle Beach buildings?", toc: "Who lends", id: "lenders", html: () =>
      h.p("Our affiliated lender, BrickWood Mortgage, a separate company, arranges condotel and non-warrantable loans through wholesale lenders that accept these buildings.") +
      `<p class="cf-disc">${BRICKWOOD}</p>` +
      h.p(`Before you offer, our agents read the building's rental program papers and confirm the unit's size and kitchen. It is part of the building review we run on every condo purchase: the bylaws, the budget, the reserves, ${h.a("/buyers/condo-in-litigation/", "any lawsuit")} and the rental history.`) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([TOWERS]) + LEGAL,
  faqTitle: "Condotel financing FAQ",
  faq: FAQ,
  sources: [
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
    { name: "Freddie Mac 5701.3", href: FRE },
    { name: "FHFA", href: FHFA },
    { name: "HUD Handbook 4000.1", href: HUD4000 },
    { name: "HUD condo list", href: HUDLIST },
    { name: "VA condo report", href: VA },
    { name: "Newrez Smart checklist", href: NEWREZ },
    { name: "Landmark Resort", href: LANDMARK },
    { name: "Ocean Creek", href: OCEANCREEK },
    { name: "Compass Cove", href: COMPASS },
    { name: "SeaWatch", href: SEAWATCH },
    { name: "Sands Resorts", href: SANDS },
    { name: "County deeds", href: DEEDS },
  ],
  sourcesNote: `Condos for sale: our count of the listing feed on ${PULL_DAY}, in total only. Sales: our count of county deeds, one unit at a time, over a year. The directory is the ${DIR} oceanfront buildings on our building directory.`,
  bottomCta: { h2: "Found a resort condo you love?", p: `Call ${PHONE}, or send us the building and the unit. We tell you which loan fits before you pay for an offer or an inspection.`, label: "Send us the unit", href: ASK },
  keywords: "condotel financing Myrtle Beach, condotel loans, condo hotel financing, condotel mortgage, condotel lenders, condo hotel Myrtle Beach, condotel FHA, what is a condotel, condotel loan requirements",
  about: "Loans for condo hotel units (condotels) in Myrtle Beach and Horry County, South Carolina",
});
