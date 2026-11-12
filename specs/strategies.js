/* /invest/strategies/ - the hub for the eight ways to invest in Grand Strand real estate: which one fits the reader's
 * money, time and goal; one local number, who it fits and the hard part for each; what each way in costs here at the
 * middle (the one chart); the pairs people search; how Chapter3 finds deals; and a short FAQ.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/invest-strategies/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and CORRECTED rows
 * only in the verifier's wording (VERIFY.md). Struck wording: batches/2026-11-b/facts/invest-strategies-struck.json.
 * Never on this page: "all of these strategies" (row 1 says six), "a house" for the non-condo resale group (row 8),
 * "half the rent" without HUD's figure (row 9), Conway, Socastee or Carolina Forest as BRRRR areas (row 14), "344" without
 * "at least" (row 16), "flipper" (row 17), "58 buildings sold" (row 19), "on Carolina Forest Boulevard" (row 30), the
 * DST ruling without its limits (row 41), any down payment share, rate or payment (PLAYBOOK A17; this hub is not on
 * DOWN_PAYMENT_OK_PAGES).
 * Data, never typed: data/2026-11-b/invest-strategies/findings.json and chart-entry-prices.json (build_findings.py reads
 * the files other pages already pulled and verified: county deeds and parcels, SEC Form D, Zillow and HUD rents, AirROI,
 * the DSCR page's cases).
 * Design, as /sell/home-value/, /submarkets/garden-city/ and /invest/strategies/1031-exchange/: the italic line at about
 * half the H1's size, one card style for the chart and the offers, plain lists under thin rules, one block width of
 * 720 px, an offer after about every second section, each tied to what that section answered.
 * Homes: the site's edge feed under the opening (MIX, idx-lib/feeds.js), and two strips in the entries: Garden City
 * Beach condos after the short-term rental (the owner's own title, 2026-11-10) and 2 to 4 unit buildings after small
 * multifamily. Adding /invest/strategies/ to both places' pages, and withStrips: true on this URL's feed, is in Blog-Brain
 * batches/2026-11-b/invest-strategies/BUILD.md for the lead (idx-lib is outside this page's folder). Until it lands, each
 * strip stays empty and takes no space.
 * Kept from the live page: the URL, the strategy words it ranks for, a "watch out for" line on each strategy, the
 * strategy mix (row 1), the quiet sale in its vague form (row 2), "a new company can outspend us on ads" (row 3), the four
 * FAQ topics, the closing promise and the phone number.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/strategies/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-strategies");
const F = JSON.parse(fs.readFileSync(path.join(DATA, "findings.json"), "utf8"));
const CH = JSON.parse(fs.readFileSync(path.join(DATA, "chart-entry-prices.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`strategies.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/* "2026-09-30" -> "September 2026"; the month before an "as of" day -> its last full month. */
const monthOf = (iso) => { const [y, m] = iso.split("-").map(Number); return `${MONTHS[m - 1]} ${y}`; };
const monthBefore = (iso) => { const [y, m] = iso.split("-").map(Number); return m === 1 ? `December ${y - 1}` : `${MONTHS[m - 2]} ${y}`; };

/* ---- Row 6: long-term rent (Zillow's index, its Myrtle Beach metro). ---- */
const LTR = F.ltr;
must(LTR.house_asking_rent === 2070 && LTR.house_asking_rent_exact === 2074, "row 6: the asking rent moved");

/* ---- Rows 31 and 33: AirROI, 12 months (data/str-market.json's update). ---- */
const STR = F.str;
must(STR.myrtle_beach_avg_gross === 25807 && STR.murrells_inlet_avg_gross === 47603, "rows 31, 33: the Airbnb figures moved");
must(STR.top_market === "Murrells Inlet" && STR.markets === 8, "row 33: Murrells Inlet is no longer the highest of the eight markets");
const STR_PERIOD = `12 months to ${monthBefore(STR.dataAsOf)}`;

/* ---- Rows 19, 20, 22: small multifamily (county parcels and deeds). ---- */
const SMF = F.small_multifamily;
must(SMF.sold_n === 58 && SMF.sold_median === 520000, "row 19: the sales moved");
must(SMF.within_1_mile === 910 && SMF.placed === 1240 && SMF.within_1_mile_pct > 70 && SMF.within_1_mile_pct < 75, "row 20: no longer nearly 3 in 4");

/* ---- Rows 9 and 10: DSCR, the DSCR page's cases. ---- */
const D = F.dscr, CASE = (n) => { const c = D.cases.find((x) => x.name === n); must(c, `no DSCR case ${n}`); return c; };
const LONGS = CASE("Longs, 3-bedroom house"), CF = CASE("Carolina Forest, 3-bedroom house");
const OCEAN = CASE("Myrtle Beach oceanfront, 2-bedroom condo, nightly (75 percent counted)");
must(D.target_ratio === 1.25, "row 9: the target ratio moved");
const LO = Math.round(Math.min(LONGS.pct_left_for_loan_at_1_25, CF.pct_left_for_loan_at_1_25));
const HI = Math.round(Math.max(LONGS.pct_left_for_loan_at_1_25, CF.pct_left_for_loan_at_1_25));
must(LO === 46 && HI === 49, "row 9: no longer 46 to 49 percent");
must(OCEAN.pct_tax_ins_dues > 100, "row 10: the oceanfront condo's costs no longer pass the counted income");
/* Row 42 (fixer, carried from DSCR rows 16 and 17): tax, insurance and dues take about a third of HUD's rent figure.
   The page says the plain result; the ratio arithmetic stays on the DSCR guide (review 1). */
must([LONGS, CF].every((c) => c.pct_tax_ins_dues > 28 && c.pct_tax_ins_dues < 37), "row 42: no longer about a third");

/* ---- Rows 16 to 18: quick resales (county deeds). ---- */
const FL = F.flip;
must(FL.quick_resales === 344 && FL.company_resales === 143 && FL.company_gain_median === 75000 && FL.losses === 66, "rows 16, 18: the resale counts moved");
must(FL.house_buy_median === 265000 && FL.houses === 221, "row 17: the first price moved");

/* ---- Rows 8, 25, 38: county resale prices and buyers. ---- */
const PR = F.prices;
must(PR.resale_house_median === 350000 && PR.resale_condo_median === 215000, "rows 8, 38: the resale medians moved");
must(Math.round(PR.buyers_outside_sc_pct / 10) === 3, "row 25: no longer about 3 in 10");

/* ---- Rows 27, 28, 30: DSTs (SEC Form D; county parcels). ---- */
const DST = F.dst;
must(DST.min_median === 100000 && DST.commission_median_pct === 6.0, "rows 27, 28: the DST figures moved");
must(DST.horry_parcels === 11 && DST.horry_trusts === 10 && Math.round(DST.horry_market_value / 1e8) === 2, "row 30: the county's DST parcels moved");
const DST_MIN = money(DST.min_median), DST_VALUE = `$${Math.round(DST.horry_market_value / 1e8) * 100} million`;
const NUM = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
const Cap = (s) => s[0].toUpperCase() + s.slice(1);

/* ---- The one chart (row 37): what each way in costs here, at the middle. Labels from build_findings.py, in the
   verifier's wording; the DST bar is a minimum, drawn neutral. ---- */
must(CH.rows.length === 5 && CH.rows[0].strategy === "dst" && CH.rows[0].reference === true, "chart: the DST bar must lead and be marked as a minimum");
const LOW = CH.rows[0], TOPROW = CH.rows[CH.rows.length - 1];
must(LOW.value === DST.min_median && TOPROW.value === SMF.sold_median, "chart: its ends no longer match rows 27 and 19");
must(CH.rows.every((r, i) => i === 0 || r.value >= CH.rows[i - 1].value), "chart: the bars are no longer in order");
const firstDeed = CH.flip_period.match(/(\d{4})-(\d{2})-\d{2}$/);
must(firstDeed, "chart: the flip bar's period note has no first-deed date");
/* Review 1: the quick-resale bar (a first price paid before a resale) needed study and is not a way in a reader buys,
   so the chart shows four bars. The data file keeps it for the flip page's wording. */
const BARS = CH.rows.filter((r) => r.strategy !== "flip");
must(BARS.length === 4, "chart: expected four bars without the quick-resale bar");
const PRICE_CHART = G.bars(BARS.map((r) => ({ name: r.name, feature: r.note, value: r.value, valueText: r1k(r.value), reference: !!r.reference })), {
  caption: `The ways in start far apart: from a ${r1k(LOW.value)} DST share to a ${r1k(TOPROW.value)} duplex or fourplex`,
  nameLabel: "Way in", featureLabel: "what the figure is", valueLabel: "Middle price",
  note: `Homes: the middle sale recorded in Horry County in the 12 months to ${monthOf(FL.resale_last)}. DST: the most common minimum in SEC filings over the same 12 months.`,
});

/* ---- Links (each opened by the researcher or the verifier). ---- */
const ZORI = "https://www.zillow.com/research/data/";
const SC43 = "https://www.scstatehouse.gov/code/t12c043.php";
const AIRROI = "https://www.airroi.com/airbnb-data/united-states/south-carolina/myrtle-beach";
const MBSTR = "https://www.cityofmyrtlebeach.com/news_detail_T6_R1468.php";
const HUD4000 = "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf";
const F92561 = "https://www.hud.gov/sites/dfiles/OCHCO/documents/92561.pdf";
const VAPUR = "https://www.va.gov/housing-assistance/home-loans/loan-types/purchase-loan/";
const HUDFMR = "https://www.huduser.gov/portal/datasets/fmr.html";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const USC1031 = "https://www.law.cornell.edu/uscode/text/26/1031";
const RR0486 = "https://www.irs.gov/irb/2004-33_IRB";
const FORMD = "https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets";
const ACCR = "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/accredited-investors";
const ASK = "/contact/";

/* ---- The homes strips (owner, 2026-11-08 and 2026-11-10: bold, personal, true). Existing places; the lead adds this
   URL to their pages (BUILD.md). The Garden City Beach title is the owner's own example. ---- */
/* The photo (record in data/2026-11-b/invest-strategies/photos.json, copied from /invest/strategies/dscr-loans/, which
   copied it from /invest/condos/: a public domain USGS oblique aerial, 2011). It shows the condos the Garden City Beach
   strip searches, so it is the strip's fallback: it shows until the strip has homes. Its caption says only what it shows. */
const PHOTOS = JSON.parse(fs.readFileSync(path.join(DATA, "photos.json"), "utf8")).photos;
const GC_PH = PH.findPhoto(PHOTOS, "garden-city-condos-2011");
const GC_PHOTO = PH.heroPhoto(GC_PH, { alt: GC_PH.alt, caption: "Condo buildings on the beach at Garden City Beach, with the salt marsh behind them.", maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
const CREDITS = PH.creditsList([{ photo: GC_PH, caption: "Condo buildings at Garden City Beach" }]);
const STR_STRIP = G.homes("str-garden-city-beach-condos", "Garden City Beach", GC_PHOTO, "Best Airbnb opportunities in Garden City Beach");
const MULTI_STRIP = G.homes("duplexes-around-myrtle-beach", "the Myrtle Beach area", "", "Two to four rents from one building, for sale now");

/* ---- The page's own styles. One card style (the glass surface of the chart and the offers); the guide, the pairs and
   the entries sit on the page under thin rules. As /invest/strategies/1031-exchange/. ---- */
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
  + `${S} .c3-gchart,${S} .st-plain,${S} .st-tw,${S} .st-entry,${S} .st-group{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-gchart .v{font-weight:600}${S} .c3-gchart [role=rowheader] a{color:var(--navy)}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .st-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .st-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .st-plain li:last-child{border-bottom:${RULE}}${S} .st-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  + `${S} .st-plain a{color:var(--navy)}`
  /* the guide: a plain table under thin rules, two columns at every width */
  + `${S} .st-tw{max-width:720px;margin:1.1rem 0 1.4rem}${S} .st-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .st-tab caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem}`
  + `${S} .st-tab thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .st-tab td{padding:.7rem .8rem .7rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.45;color:var(--muted)}`
  + `${S} .st-tab td:last-child{white-space:nowrap;font-weight:600}${S} .st-tab td a{color:var(--navy)}`
  + `@media (max-width:420px){${S} .st-tab td:last-child{white-space:normal}}`
  /* the group label over each set of entries */
  + `${S} .st-group{margin:2.4rem 0 0;padding-top:.9rem;border-top:${RULE};font-family:var(--sans);font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:${INK};font-weight:700}`
  + `${S} .st-group:first-of-type{margin-top:1.2rem}`
  /* an entry: its number in brass beside the headline */
  + `${S} .st-entry{margin:1.4rem 0 .3rem}${S} h3.st-h{display:flex;align-items:baseline;gap:.6rem;font-family:var(--serif);font-size:1.4rem;line-height:1.3;color:var(--navy);margin:0 0 .6rem;scroll-margin-top:6rem}`
  + `${S} h3.st-h::before{content:attr(data-no);flex:0 0 auto;display:inline-block;min-width:1.8rem;height:1.8rem;border-radius:50%;background:rgba(196,120,58,.14);color:${INK};font-family:var(--sans);font-weight:700;font-size:1rem;line-height:1.8rem;text-align:center;transform:translateY(-.15rem)}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  + `${S} .st-entry p.hard{border-left:2px solid rgba(196,120,58,.55);padding-left:.9rem}`
  /* Work-arounds copied from /invest/strategies/1031-exchange/: the feed's search row at 320 px, the header phone at
     1000 to 1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const P = 'style="color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1rem"';
const plain = (items) => `<ul class="st-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const group = (label) => `<p class="st-group">${label}</p>`;
/* An entry: its number, its plain name as the headline, then short paragraphs; the last one, the hard part, is marked. */
const entry = (no, id, name, paras, hard) => `<div class="st-entry"><h3 class="st-h" id="${id}" data-no="${no}">${name}</h3>`
  + paras.map((t) => `<p ${P}>${t}</p>`).join("") + (hard ? `<p class="hard" ${P}>${hard}</p>` : "") + `</div>`;
/* The selection guide: a real table of two columns, what the reader wants and the strategy, under thin rules. Each
   strategy links its entry below, in the entry's own words, so the reader stays on the page. */
const WANTS = [
  ["Monthly rent, with the least work", [["long-term-rental", "Long-term rental"], ["dscr-loan", "DSCR loan"]]],
  ["The most a home can earn, and you accept the work", [["short-term-rental", "Short-term rental"]]],
  ["Several rents from one building, or you live in one unit", [["small-multifamily", "Small multifamily"]]],
  ["One sum of cash, used on house after house", [["brrrr", "BRRRR"]]],
  ["A project you finish and sell", [["fix-and-flip", "Fix and flip"]]],
  ["You are selling a rental with a big gain", [["1031-exchange", "1031 exchange"]]],
  ["The same, and you are done being a landlord", [["dst", "DST"]]],
];
const GUIDE = `<div class="st-tw"><table class="st-tab"><caption>Start from what you want the money to do</caption>`
  + `<thead><tr><th scope="col">You want</th><th scope="col">The strategy</th></tr></thead><tbody>`
  + WANTS.map(([want, ls]) => `<tr><td>${want}</td><td>${ls.map(([id, t]) => h.a("#" + id, t)).join(", with a ")}</td></tr>`).join("")
  + `</tbody></table></div>`;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We do not lend, manage property or give tax, legal or investment advice. Past results are not a promise of future results.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "What is the best real estate investment strategy for beginners?", a: `For most beginners here, a house rented by the year. Its numbers are the simplest to check, and a DSCR loan qualifies on the rent. With a big gain from a sale to move, a 1031 exchange comes first.` },
  { q: "Can you invest in real estate without being a landlord?", a: `Yes. A DST share is the one way with no landlord work at all, and the usual minimum is ${DST_MIN}. Most DSTs sell only to accredited investors. A rental with a local property manager also takes the day-to-day calls off your hands.` },
  { q: "Can Chapter3 help with the loan?", a: "Chapter3 finds and checks the property. Our affiliated lender, BrickWood Mortgage, a separate company, can quote the loan, or you can use your own lender." },
  { q: "Which strategy suits an investor who lives out of state?", a: "A long-term rental with a local manager asks the least of your time among the rentals. A DST asks none." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Real Estate Investment Strategies in Myrtle Beach: 8 Compared",
  description: `Eight real estate investment strategies on the Grand Strand, from a ${r1k(LOW.value)} DST share to a ${r1k(TOPROW.value)} duplex: a local number for each, and who it fits.`,
  /* Our own share card (tools/ogcard.js, run on a copy of this page), kept in this page's image folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/invest-strategies/share.jpg",
  ogImageAlt: "Eight real estate investment strategies on the Grand Strand, compared. A local number for each, and who it fits.",
  ogTitle: "Eight real estate investment strategies on the Grand Strand, compared: a local number for each, who it fits and what goes wrong",
  crumb: "Strategies",
  eyebrow: "Investment strategies",
  h1: "Eight real estate investment strategies on the Grand Strand, compared",
  h1em: "A local number for each, and who it fits.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: "Eight real estate investment strategies, from long-term and nightly rentals to BRRRR, 1031 exchanges and DSTs, each with a Grand Strand number.",
  heroMedia: CSS + G.homesCss(),
  heroCta: { title: "Tell us your cash and your goal. We send properties that fit, with the numbers run.", label: "Send me properties that fit", href: ASK },
  author: "devin",
  shortAnswer: [
    `For steady income, the simplest investment strategy here is a house rented by the year, bought with a DSCR loan, which qualifies on the rent. A house listed for rent in the Myrtle Beach area asks about ${money(LTR.house_asking_rent)}&nbsp;a&nbsp;month.`,
    "Selling a rental with a big gain? A 1031 exchange or a DST puts off the tax. With cash and time for a project, a flip or BRRRR starts with a worn house.",
  ],
  sections: [
    { h2: "Which real estate investment strategy fits you?", toc: "Which fits you", id: "which-fits", html: () =>
      h.p("DSCR purchases and 1031 trades are the most common we see here, and BRRRR is the rarest, because the right property is rare.") +
      GUIDE },

    { h2: "What are the main real estate investment strategies here?", toc: "The eight strategies", id: "strategies", html: (bg) =>
      group("Buy a home and hold it") +
      entry(1, "long-term-rental", "Long-term rental", [
        "A long-term rental is a home leased by the year. Its rent comes in every month, in winter as in summer. It fits an investor who wants monthly income with the least to manage.",
        `${h.a("/invest/rent-prices/", "Our rent prices guide")} has rents by town and size, and ${h.a("/invest/long-term-rental/", "the rental analyzer")} works out one address. A local manager can take the calls; ${h.a("/invest/property-management/", "our property management guide")} covers what to expect.`,
        "Many communities here ban renting a house at all, and we filter them out of a search. We also read the homeowners association (HOA) documents for rules that would block your rental plan.",
      ], `The hard part is the tax. A rental or a second home is ${h.ext(SC43, "taxed on 6 percent of its value")}. The 4 percent rate is only for the home you live in, once the county approves it. The rate is lost if that home is rented out more than 72 days in a calendar year.`) +
      entry(2, "short-term-rental", "Short-term rental", [
        `A short-term rental is a home rented by the night, often through Airbnb. The average Airbnb in the Myrtle Beach area took in about ${r1k(STR.myrtle_beach_avg_gross)} from guests over a year, before costs.`,
        `Murrells Inlet's average Airbnb took in about ${r1k(STR.murrells_inlet_avg_gross)}, the most of the ${NUM[STR.markets]} Grand Strand towns we track. Nightly rentals fit an owner who wants the most a home can earn and accepts the work, or pays a manager.`,
        `${h.a("/invest/airbnb-income/", "Our Airbnb income guide")} has the figures by town and by size.`,
      ], `The hard part is the rules. In the City of Myrtle Beach, a rental under 90 days is short-term, and ${h.ext(MBSTR, "most of the city's traditional neighborhoods are not zoned for it")}. Check the zoning before you buy. ${h.a("/invest/str-rules/", "Our short-term rental rules guide")} covers each town.`) +
      STR_STRIP +
      entry(3, "small-multifamily", "Small multifamily", [
        `Small multifamily is one building with two to four homes: a duplex, triplex or fourplex. Here, many of them stand near the ocean. Nearly 3 in 4 of the county's buildings of 2 to 4 homes on one parcel are within a mile of it, in a straight line.`,
        `Horry County recorded ${SMF.sold_n} sales of buildings with 2 to 4 homes in the past year, a few buildings twice, at a middle price of about ${r1k(SMF.sold_median)}.`,
        `It fits an investor who wants several rents from one building. If you live in one unit, ${h.ext(HUD4000, "an FHA")} or ${h.ext(VAPUR, "VA loan")} can buy a building of up to four units. ${h.a("/invest/strategies/small-multifamily/", "Our small multifamily guide")} has prices by town and rents by unit.`,
      ], `The hard part on an FHA loan: ${h.ext(F92561, "it bars renting any unit")} for under 30 days.`) +
      MULTI_STRIP +
      h.cta("Have us run the numbers on any address.", "Send us a house, a condo or a duplex you like. We work out the rent, the tax and the HOA rules on it before you offer.", "Have us run an address", ASK, bg) +

      group("Pay for it") +
      entry(4, "dscr-loan", "DSCR loan", [
        `A DSCR loan is not a property. It is the loan many investors here use for a rental and for the BRRRR refinance. The lender qualifies the loan on the rent, not on your income.`,
        `A house rented by the year fits it well. Take a middle-priced 3-bedroom house in Longs or Carolina Forest, outside city limits. Its tax, insurance and HOA dues take about a third of ${h.ext(HUDFMR, "HUD's rent figure")} for its ZIP, which leaves room for the loan.`,
        `${h.a("/invest/strategies/dscr-loans/", "Our DSCR loan guide")} works out the ratio on six typical homes here, from a Longs house to an oceanfront condo.`,
      ], "Nightly rentals are harder. Take a typical oceanfront two-bedroom condo in Myrtle Beach, booked as often as the average listing. Its dues, tax and insurance alone come to more than the income a lender counts, before any loan payment.") +

      group("Add value") +
      entry(5, "brrrr", "BRRRR", [
        "BRRRR stands for buy, rehab, rent, refinance, repeat. You buy a worn house, fix it and rent it. A refinance then takes your cash back out for the next one.",
        "Most good BRRRR candidates here are lower-value homes inland toward Longs or Little River, or condo units in a stable building with a distressed owner.",
        `On one house here, about $90,000 of work took its value from about $180,000 to about $384,000 in about three months. It is now a short-term rental. Those are that investor's numbers, not a promise. ${h.a("/invest/strategies/brrrr/", "Our BRRRR guide")} and ${h.a("/invest/foreclosures/", "our foreclosures guide")} cover where the worn houses come from.`,
      ], "BRRRR is rare because the worn house must also sit where rents are high, since the strategy relies on high rents. If the house appraises low at the refinance, part of your cash stays in it.") +
      entry(6, "fix-and-flip", "Fix and flip", [
        `A fix and flip is a worn house you buy, repair and sell. Horry County recorded at least ${FL.quick_resales} quick resales, a home resold within 12 months of its last sale, in the past year.`,
        `When a company resold, the middle gain between the two deed prices was about ${r1k(FL.company_gain_median)}, before costs. By ZIP area, houses gained most in the Conway, Carolina Forest and Little River areas.`,
        `It fits an investor with cash, a contractor and a few months. ${h.a("/invest/strategies/fix-and-flip/", "Our fix and flip guide")} has the gains by area.`,
      ], `Not every quick resale gains. Of those resales, ${FL.losses} sold for less than the earlier deed price, most of them by people rather than companies.`) +
      h.cta("Want the worn houses before they are fixed?", "We send worn houses priced under their fixed-up value, in the areas where rent is strong, with our numbers on each.", "Get the worn-house list", ASK, bg) +

      group("Trade without the tax now") +
      entry(7, "1031-exchange", "1031 exchange", [
        `A 1031 exchange lets you sell one rental, buy another and ${h.ext(USC1031, "put off the tax")} on the gain. Name the replacement within 45 days of the sale, and own it within 180 days or by your tax return's due date with extensions, if that comes first.`,
        `One of Tim Nash's longtime clients, an investor based in New York, owns more than 200 properties, mostly condos. When a condo stops giving him depreciation, the yearly tax deduction for a building's wear, he sells it and trades up through a 1031 exchange.`,
        `About 3 in 10 homes sold in Horry County in the past year went to buyers whose tax bill goes to another state or country. ${h.a("/invest/strategies/1031-exchange/", "Our 1031 exchange guide")} has the steps and the state's rules for a seller from another state.`,
      ], "The hard part is the dates. Miss day 45 or day 180, and the tax comes due.") +
      entry(8, "dst", "DST", [
        `A Delaware statutory trust, or DST, sells shares in large properties that a sponsor manages. A share can be the replacement in a 1031 exchange if the trust stays inside ${h.ext(RR0486, "the IRS ruling's limits")} and the other 1031 rules are met.`,
        `DSTs already own part of the Grand Strand. ${Cap(NUM[DST.horry_trusts])} trusts own ${DST.horry_parcels} parcels in Horry County that the county values at about ${DST_VALUE}. They include two large apartment communities, one near Carolina Forest Boulevard and one in the Clear Pond area.`,
        `The usual minimum share is ${DST_MIN}, and most DSTs sell only to ${h.ext(ACCR, "accredited investors")}.`,
        `A DST fits an investor who is done being a landlord. ${h.a("/invest/strategies/dst/", "Our DST guide")} has the fees, the minimums and the ways out.`,
      ], `The hard part is the cost and the wait. In the middle DST offering, sales commissions and finder's fees came to about ${Math.round(DST.commission_median_pct)} percent of the money raised. Plan to stay in until the trust sells the property.`) +
      h.cta("Selling a rental to buy the next one?", "We time your sale and the next purchase to the 45 and 180 days, and line up the property before you list.", "Plan my sale and next buy", ASK, bg) },

    { h2: "What does each way in cost here?", toc: "What each costs", id: "how-much", html: () =>
      h.p(`A DST share starts lowest, and a duplex to fourplex costs the most. The cash you need to start depends on the loan. ${h.a("/invest/strategies/dscr-loans/", "Our DSCR loan guide")} has our affiliated lender's down payment figures for a rental.`) +
      PRICE_CHART },

    { h2: "BRRRR or flip, long-term or nightly, 1031 or DST: how do they differ?", toc: "The pairs", id: "pairs", html: () =>
      h.p("Each pair starts the same way and ends differently.") +
      plain([
        ["BRRRR or fix and flip", `Both start with a worn house. A flip sells it. BRRRR keeps it, rents it and refinances. ${h.a("/invest/strategies/brrrr/", "The BRRRR guide")} compares the two.`],
        ["Fix and flip or rent", `A flip pays once, when it sells. A rental pays every month, and you keep the house. ${h.a("/invest/strategies/fix-and-flip/", "The fix and flip guide")} has the costs.`],
        ["Long-term or nightly", `${h.a("/invest/str-vs-ltr/", "Our side-by-side")} works out the same home both ways, rented by the year and by the night.`],
        ["1031 exchange or DST", `Both put off the tax. A 1031 buys a rental you manage. A DST buys a share a sponsor manages. ${h.a("/invest/strategies/dst/", "The DST guide")} compares them.`],
      ]) },

    { h2: "How does Chapter3 find investment deals here?", toc: "How we find deals", id: "how-we-help", html: (bg) =>
      h.p("A new company can outspend us on ads. It cannot buy friendships that last years, and friends of ours tell us about properties here before they list.") +
      h.p("Nothing beats a cash offer. When you need a loan, we can still find properties here through friends before they list, and negotiate terms a seller will take with financing.") +
      h.h3("A sale that never listed") +
      h.p("An agent at Chapter3 met a man at a networking event, and the two became friends. When he fell behind on a condo here, he asked that agent to sell it quietly. It went to an investor on the buyer list without being listed, at about 20 percent under market. That investor now collects the rent.") +
      h.cta("Get on the buyer list.", "Investors ask us most for properties with the numbers that prove them. Tell us what you want, and we send those, including ones that have not listed.", "Send me properties with the numbers run", ASK, bg) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([GC_PH]) + LEGAL,
  faqTitle: "Investment strategies FAQ",
  faq: FAQ,
  sources: [
    { name: "Zillow rent index", href: ZORI },
    { name: "HUD rents", href: HUDFMR },
    { name: "SC Code 12-43", href: SC43 },
    { name: "AirROI", href: AIRROI },
    { name: "City of Myrtle Beach", href: MBSTR },
    { name: "HUD 4000.1", href: HUD4000 },
    { name: "HUD-92561", href: F92561 },
    { name: "VA", href: VAPUR },
    { name: "County deeds", href: DEEDS },
    { name: "County parcels", href: PARCELS },
    { name: "26 USC 1031", href: USC1031 },
    { name: "Rev. Rul. 2004-86", href: RR0486 },
    { name: "SEC Form D", href: FORMD },
    { name: "SEC", href: ACCR },
  ],
  sourcesNote: `Rent: Zillow's Myrtle Beach metro, which includes Brunswick County, NC, ${monthOf(LTR.zillow_month)}. Sales: our count of county deeds recorded in the 12 months to ${monthOf(FL.resale_last)}. Airbnb: AirROI, ${STR_PERIOD}. DST minimums and commissions: our count of SEC filings.`,
  bottomCta: { h2: "Send us an address, or tell us your cash and your goal.", p: "We will run the rent, the expenses and the association documents before you write an offer, at no cost. Or call 854.333.2135.", label: "Send me investment properties with the numbers", href: ASK },
  keywords: "real estate investment strategies Myrtle Beach, Grand Strand real estate investing, types of real estate investing, best real estate investment strategy for beginners, how much money do you need to start investing in real estate, invest in real estate without being a landlord, BRRRR vs fix and flip, 1031 exchange vs DST",
  about: "Real estate investment strategies on the Grand Strand: long-term and short-term rentals, small multifamily, DSCR loans, BRRRR, fix and flip, 1031 exchanges and DSTs",
});
