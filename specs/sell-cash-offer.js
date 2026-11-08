/* /sell/cash-offer/ - a cash offer or a listing for a Myrtle Beach house: who makes cash offers here, what companies
 * that bought and resold Horry County houses paid against what they resold for, what a seller keeps three ways on a
 * $260,000 house, when a cash offer is the better choice and how long a listing takes, selling as is, and how we check
 * a cash buyer and the contract (the deposit, the inspection period, "and/or assigns", South Carolina's wholesaling law).
 *
 * Batch 2026-11-n, Lane N (a new page). Version 2, 2026-11-08, review round 1 (REVIEW-1.md in the batch folder says
 * what changed and why). Design: the approved pilots of batch 2026-11-a (sell-fsbo, submarkets-pawleys-island,
 * hoa-liens-and-foreclosure, invest-condos): a two-line headline with the italic sub line at about half the H1 size,
 * the answer first, one card style used once (the three ways to sell, the one place the reader chooses), plain lists
 * under thin rules elsewhere, one block width of 720 px, and on wide screens the bought-and-resold chart and the photo
 * beside the paragraphs that explain them. DESIGN.md in the batch folder says why.
 * Round 1 took away: the company-share chart by price, the company-name counts, the towns, the quick resales, the
 * neighbors' measure, the 70 percent rule and the after-repair-value term (owner: "too many numbers"; a seller does
 * not need them to decide). Each fact is said once: wholesaling is defined in its own section only, the disclosure
 * exemption is in the FAQ only, the 13-day sale is told once, near the end.
 * Facts: Blog-Brain batches/2026-11-n/sell-cash-offer/facts.md, VERIFIED rows, CORRECTED rows only in the verifier's
 * safe wording (VERIFY.md), and the fixer's rows 29 to 32 (VERIFIED-BY-FIXER: carried from sell-best-time-to-sell rows
 * 8 and 12, the story bank, and arithmetic). Struck wording: sell-cash-offer-struck.json.
 * Data, never typed (website working copy):
 *   data/2026-11-n/sell-cash-offer/findings.json   bought and resold (row 5), no mortgage recorded (row 8),
 *                   cash-only listings (row 9), the worked example and deed fees (rows 18, 19)
 *   data/2026-11-n/sell-best-time-to-sell/zillow-months.json   days to a contract and to closing (rows 29, 30)
 *   data/2026-11-n/sell-cash-offer/photos.json     the one photo: floodwater on a street of houses in the Conway area
 *                   after Hurricane Florence, SC National Guard, public domain (VERIFY.md P1)
 * Typed and checked: the law and guidance (rows 10 to 17, 20 to 26), the story (rows 27 and 31, story bank
 * tenant-occupied-sale-13-days), the attorney rule (row 28).
 * Owner questions built on their proposed answers (OWNER-QUESTIONS.md): Q1 a free look at a cash offer and the contract
 * (the top bar and the last offer box), Q3 we do not buy houses (the "what you keep" section), Q4 listing as is to our
 * list of cash buyers (the second offer box). Q2, Q5, Q6, Q7: nothing on the page depends on them.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/sell/cash-offer/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "sell-cash-offer");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json");
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const CTA = "/contact/";

/* ---- Row 5: bought and resold (the 67 houses bought from owners; never the 69 percent of all 82). ---- */
const BR = F.chart_bought_vs_resold.held_31_365_houses_from_people;
if (BR.n !== 67 || BR.median_buy_as_pct_of_sell !== 68.3 || BR.median_buy !== 170000 || BR.median_sell !== 260000 || BR.median_days !== 119) throw new Error("row 5 moved");
const PAID = Math.round(BR.median_buy_as_pct_of_sell);
/* "about a third less": 100 - 68.3 = 31.7 percent. */
if (Math.abs((100 - BR.median_buy_as_pct_of_sell) / 100 - 1 / 3) > 0.03) throw new Error("row 5: 'about a third less' no longer holds");

/* ---- Row 8: no mortgage recorded (a floor). ---- */
const NM = F.no_mortgage, NMK = NM.by_buyer_kind_floor;
if (NM.resales.cash_pct_floor !== 34.6 || NMK.person !== 2922 || NMK.person + NMK.company + NMK.trust !== 3819) throw new Error("row 8 moved");

/* ---- Row 9: cash-only listings, the day the feed was read (from the data file). ---- */
const CO = F.cash_only_listings, BT = CO.by_type;
if (BT.house.cash_only !== 22 || BT.condo.cash_only !== 105 || BT.manufactured.cash_only !== 55) throw new Error("row 9 moved");
const DAY = new Date(CO.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/* ---- Rows 18, 19, 32: the worked example. ---- */
const W = F.worked;
if (W.fixed_up_price !== 260000 || W.cash_offer !== 178000 || W.gap !== 82000 || W.per_1pct_fees_fixed !== 2600) throw new Error("row 18 moved");
const deed = (p) => Math.ceil(p / 500) * 1.85;
if (Math.abs(deed(W.cash_offer) - W.deed_fee_cash) > 0.001 || deed(W.fixed_up_price) !== W.deed_fee_fixed) throw new Error("row 19: the deed fee moved");
if (Math.round(W.fixed_up_price * W.company_paid_share / 1000) * 1000 !== W.cash_offer) throw new Error("row 18: the offer does not follow from the share");
const ONE_CASH = W.cash_offer / 100;   /* row 32: each 1 percent of $178,000 */
if (ONE_CASH !== 1780) throw new Error("row 32 moved");

/* ---- Rows 29, 30: how long a listing takes (carried from sell-best-time-to-sell rows 12 and 8). ---- */
const ZM = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-n", "sell-best-time-to-sell", "zillow-months.json"), "utf8"));
const DOZ = ZM.med_doz_pending.latest, DTC = Object.values(ZM.mean_days_to_close.avg_by_month);
if (DOZ[0] !== "2026-09-30" || DOZ[1] !== 53) throw new Error("row 29 moved");
if (Math.round(Math.min(...DTC)) !== 36 || Math.round(Math.max(...DTC)) !== 42) throw new Error("row 30 moved: 'about five weeks' no longer holds");
const DOZ_DAYS = DOZ[1];

/* ---- Links ---- */
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const T40_57 = "https://www.scstatehouse.gov/code/statmast.php?title=40&chapter=57";
const T27_50 = "https://www.scstatehouse.gov/code/statmast.php?title=27&chapter=50";
const T12_24 = "https://www.scstatehouse.gov/code/statmast.php?title=12&chapter=24";
const LLR_WH = "https://www.llr.sc.gov/re/News/Wholesaling-Assignment-of-Contracts-Guidance.pdf";
const LLR_EXP = "https://llr.sc.gov/re/RECPDF/Limited%20Market%20Exposure%20Guidance%20Document.pdf";
const DOE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const CFPB = "https://www.consumerfinance.gov/archive/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/";
const NAR = "https://www.nar.realtor/sites/default/files/2025-02/consumer-guide-escrow-and-earnest-money-2025-02-12.pdf";
const FMAC = "https://myhome.freddiemac.com/blog/homeownership/20210624-understanding-contingencies";
const FNMA_C = "https://selling-guide.fanniemae.com/sel/b4-1.3-06/property-condition-and-quality-construction-improvements";
const FNMA_I = "https://selling-guide.fanniemae.com/sel/b7-3-02/property-insurance-requirements-one-four-unit-properties";
const SOS = "https://businessfilings.sc.gov/BusinessFiling/Entity/Search";
const ZRES = "https://www.zillow.com/research/data/";

/* ---- Chart (row 5): what companies paid against what they resold for. ---- */
const PAID_CHART = G.bars([
  { name: "What the company paid", value: BR.median_buy },
  { name: "What it resold for", value: BR.median_sell, reference: true },
], { caption: "Houses companies bought from owners and resold within a year", nameLabel: "Sale", valueLabel: "middle price",
  note: `Middle prices of ${BR.n} resales in Horry County, 12 months to September 2026. The two are separate middles, not one house.` });

/* ---- Row 9: cash-only listings, three large numbers. ---- */
const CASH_ONLY = `<div class="co-stat co-3"><p class="k">Listed as cash only on ${DAY}</p><ul>`
  + `<li><strong>${BT.house.cash_only}</strong><span>houses</span></li>`
  + `<li><strong>${BT.condo.cash_only}</strong><span>condos</span></li>`
  + `<li><strong>${BT.manufactured.cash_only}</strong><span>manufactured homes</span></li></ul>`
  + `<p class="src">Listings on CCMLS, the local agents' listing service, counted on our site.</p></div>`;

/* ---- Rows 18, 32: the three ways to sell, worked on the $260,000 house. The one place the reader chooses.
   Every row of a column is the same kind of value. ---- */
const WAYS = compareCards([
  { name: "Take the cash offer", icon: "dollar", cells: { price: `About ${money(W.cash_offer)}`, repairs: "None", fees: "None" } },
  { name: "List it as is", icon: "home", cells: { price: "Its as-is price (we work it out)", repairs: "None", fees: `${money(ONE_CASH)} for each 1% at ${money(W.cash_offer)}` } },
  { name: "Fix it, then list it", icon: "key", cells: { price: `Up to about ${money(W.fixed_up_price)}`, repairs: "Yours to pay, and the months they take", fees: `${money(W.per_1pct_fees_fixed)} for each 1%` } },
], [
  { key: "price", label: "What it sells for" },
  { key: "repairs", label: "Repairs you pay for" },
  { key: "fees", label: "Listing fees" },
], { caption: `Three ways to sell a house that would bring ${money(W.fixed_up_price)} fixed up`, nameLabel: "How you sell" });

/* ---- Rows 22, 23: the decision table, plain rows under thin rules. ---- */
const dec = (when, then) => `<tr><th scope="row">${when}</th><td>${then}</td></tr>`;
const DECIDE = `<table class="co-dec"><caption>When a cash offer is the better choice</caption><thead><tr><th scope="col">If this is your house</th><th scope="col">The better choice</th></tr></thead><tbody>`
  + dec("It has damage to its safety or structure", `A cash buyer, or a listing marked cash only. Until the damage is repaired, a buyer cannot get a home loan on it that ${h.ext(FNMA_C, "Fannie Mae will buy")} from the lender. Fannie Mae is the company that buys many home loans from the lenders that make them, so lenders follow its rules.`)
  + dec("No insurer will cover it for wind", `A cash buyer. A home loan backed by Fannie Mae ${h.ext(FNMA_I, "needs insurance that covers wind")}, hurricanes included. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")} covers wind policies here.`)
  + dec("It must be sold by a date: a move, an estate or a divorce", `Set a firm cash closing date beside a listing priced to sell. Our pages on an ${h.a("/sell/inherited-house/", "inherited house")} and on ${h.a("/sell/divorce/", "selling in a divorce")} cover the rest.`)
  + dec("A tenant has months left on the lease", `List it in front of investors who buy rented houses. Our ${h.a("/sell/rental-property/", "rental property page")} covers selling with a tenant.`)
  + dec("It is in fair shape, and you have time to sell", "List it, as it is or fixed up.")
  + `</tbody></table>`;

/* ---- The checklist (rows 10, 11, 14 to 17, 21): what our agents check, a numbered list under thin rules.
   Each fact once: the deposit refund is in item 3 only; wholesaling is defined in its own section. ---- */
const chk = (title, text) => `<li><b>${title}</b>${text}</li>`;
const CHECK = `<ol class="co-check" aria-label="What we check before you sign a cash contract">`
  + chk("Proof of the money", "A recent bank statement or a letter from the buyer's bank that shows the cash. We ask for it before you sign.")
  + chk("The deposit", `The buyer's good-faith deposit is called earnest money. A third party, such as an attorney, holds it until closing. If the buyer walks away for a reason the contract does not allow, the seller may keep it. ${h.ext(NAR, "Across the US")}, no law requires a deposit, and deposits typically run 1 to 10 percent of the price.`)
  + chk("The inspection period", `If the contract ${h.ext(FMAC, "makes the sale depend on an inspection")}, the buyer can back out of the sale. A buyer who walks away because a condition of the contract was not met gets the deposit back. A long inspection period with a small deposit means the buyer can back out late at little cost while the house is under contract.`)
  + chk("Any right to hand the contract on", `The words "and/or assigns" after the buyer's name let the buyer pass its place in your contract to someone else. That is not wholesaling by itself. It becomes ${h.a("#wholesaling", "wholesaling")} when the buyer also markets your house before owning it.`)
  + chk("Who the buyer is", `We look the company up by name in the ${h.ext(SOS, "Secretary of State's business records")}, where every South Carolina LLC and corporation is filed.`)
  + chk("The closing", `Every South Carolina home closing, cash or loan, ${h.ext(DOE, "must be supervised")} by a South Carolina attorney.`)
  + `</ol>`
  + `<p class="co-warn"><b>Wire fraud.</b> Never follow wiring instructions in an email. Confirm them in person or by phone with the attorney's office, at a number you agreed on in advance.</p>`;

/* ---- The glance row under the H1 (rows 5, 8). Two short tiles, so the short answer starts sooner on a phone. ---- */
const GLANCE = PK.glance([
  { icon: "dollar", label: `About ${PAID}%`, text: "what flippers here paid, of the price they resold for" },
  { icon: "key", label: "At least 1 in 3", text: "home resales here had no home loan recorded" },
]);

/* ---- The photo (VERIFY.md, Photos, P1: public domain; the caption states row 22's fact). ---- */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("conway-florence-floodwater-street", "Floodwater on a street of houses in the Conway area after Hurricane Florence. Damage to a house's structure has to be repaired before a buyer can close on many home loans.");
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, and nothing on this page is legal or tax advice. For advice on a contract or your own sale, talk to a South Carolina attorney.</p>`;
const AFTER = () => { const c = ph.credits(); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* ---- The page's own styles (the pilots' treatment, prefix co-). ---- */
const INK = "#8a5226", RULE = "rgba(28,32,40,.16)";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line. */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  /* One block width (720 px, as the contents box and the offers). */
  + `${S} .c3-gchart,${S} .c3-cc{max-width:720px!important;box-sizing:border-box}`
  /* the three ways: the first column wide enough that "Take the cash offer" stays on one or two lines */
  + `@media (min-width:700px){${S} .c3-cc th[scope=row]{min-width:12.5rem}}`
  /* the three kinds of buyer: a plain list under thin rules */
  + `${S} .co-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:1.1rem 2rem;max-width:720px}`
  + `${S} .co-plain li{margin:0;padding:.85rem 0 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .co-plain b,${S} .co-check b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.3rem}`
  /* large numbers under a thin rule, no box */
  + `${S} .co-stat{max-width:720px;margin:1.2rem 0 1.5rem}`
  + `${S} .co-stat .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .co-stat ul{list-style:none;margin:0;padding:0;display:grid;gap:1rem 2rem;grid-template-columns:repeat(auto-fit,minmax(7.5rem,1fr))}`
  + `${S} .co-stat li{margin:0;padding:.75rem 0 0;border-top:1px solid ${RULE}}${S} .co-stat strong{display:block;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:clamp(1.6rem,5.5vw,2rem);line-height:1.1;margin-bottom:.3rem}`
  + `${S} .co-stat span{display:block;color:var(--muted);line-height:1.5;font-size:1rem}`
  + `${S} .co-stat .src{margin:.9rem 0 0;color:var(--muted);font-size:.95rem;line-height:1.55}`
  /* the decision table: plain rows under thin rules; on a phone each row is a block */
  + `${S} .co-dec{width:100%;max-width:720px;border-collapse:collapse;margin:1.2rem 0 1.5rem;font-size:1rem}`
  + `${S} .co-dec caption{caption-side:top;text-align:left;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1.0625rem;margin-bottom:.6rem}`
  + `${S} .co-dec thead th{padding:.5rem .8rem .5rem 0;border-bottom:2px solid var(--navy);color:var(--navy);text-align:left;font-family:var(--sans);font-size:.8rem;letter-spacing:.06em;text-transform:uppercase}`
  + `${S} .co-dec tbody th,${S} .co-dec td{padding:.8rem .8rem .8rem 0;border-bottom:1px solid ${RULE};vertical-align:top;text-align:left;line-height:1.55}`
  + `${S} .co-dec tbody th{width:38%;color:var(--navy);font-family:var(--sans);font-weight:600}${S} .co-dec td{color:var(--muted)}`
  + `@media (max-width:699px){${S} .co-dec thead{display:none}${S} .co-dec,${S} .co-dec tbody,${S} .co-dec tr,${S} .co-dec tbody th,${S} .co-dec td{display:block;width:auto}`
  + `${S} .co-dec tr{padding:.8rem 0;border-bottom:1px solid ${RULE}}${S} .co-dec tbody th,${S} .co-dec td{padding:0;border:0}${S} .co-dec tbody th{margin-bottom:.3rem}${S} .co-dec caption{display:block;width:auto}}`
  /* the checklist: numbers, thin rules, no card around each item */
  + `${S} .co-check{list-style:none;counter-reset:c;margin:1.1rem 0 1.5rem;padding:0;max-width:720px}`
  + `${S} .co-check li{counter-increment:c;position:relative;margin:0;padding:.9rem 0 .9rem 3rem;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .co-check li:last-child{border-bottom:1px solid ${RULE}}`
  + `${S} .co-check li::before{content:counter(c);position:absolute;left:0;top:.95rem;display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}`
  /* the wire-fraud line: one short line that stands out, no box */
  + `${S} .co-warn{max-width:720px;margin:0 0 1.6rem;padding-left:.9rem;border-left:3px solid ${INK};color:var(--ink,#1c2028);line-height:1.6;font-size:1.0625rem}${S} .co-warn b{color:var(--navy)}`
  /* A wide screen: the chart beside the paragraphs that explain it (rows), and the photo beside the text and the
     table of its section (two columns, so no row stretches and leaves a gap). */
  + `@media (min-width:1100px){${S} .co-side{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:auto auto 1fr;column-gap:2.5rem;max-width:1000px;align-items:start}`
  + `${S} .co-side>*{grid-column:1}${S} .co-side>.c3-gchart{grid-column:2;grid-row:1/4;margin:.3rem 0 1.2rem!important;max-width:none!important}`
  + `${S} .co-side .c3-gchart [role=row]{grid-template-columns:minmax(0,1fr)!important}`
  + `${S} .co-two{display:grid;grid-template-columns:minmax(0,1fr) 380px;column-gap:2.5rem;max-width:1000px;align-items:start}`
  + `${S} .co-two>.c3-aerial{margin:.3rem 0 1.2rem!important;max-width:none!important}${S} .co-two>.c3-aerial figure{margin:0!important}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px}`
  + `${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.92rem}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .co-plain b,${S} .co-check b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* a phone: the hero tiles as short rows, not squeezed columns */
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

/* The FAQ holds only questions the body does not answer (owner: "say a fact once"; the liens pilot). */
const FAQ = [
  { q: "Does Chapter3 buy houses for cash?", a: "No. Chapter3 Realty is a licensed real estate brokerage. We do not buy houses ourselves; we list and sell them for their owners." },
  { q: "Do you pay closing costs in a cash sale?", a: `Yes, at least the state and county deed fee. The seller owes it by law in a cash sale or a listed one: $1.85 for each $500 of the price, about ${money(W.deed_fee_cash)} on ${money(W.cash_offer)}. A contract can shift who pays it. Our net proceeds calculator adds the other costs.` },
  { q: "Can a cash buyer skip the seller disclosure form?", a: "Only if buyer and seller both agree in writing not to complete it. Neither side has to agree. Without that, the state form is required in a cash sale too." },
  { q: "Are \"we buy houses\" companies legitimate?", a: "We judge no company by name. We check any cash buyer and its contract the same way, in the six steps on this page, before you sign." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "Myrtle Beach Cash Offers: Flippers Paid 68% of Resale Price",
  description: "What companies paid for Horry County houses against what they resold for, how long a listing takes, when a cash offer makes sense, and how to check one.",
  ogTitle: "A cash offer for your Myrtle Beach house, or list it? House flippers here paid about 68 percent of the price they resold for",
  crumb: "Cash Offer or List",
  eyebrow: "Selling a home",
  h1: "A cash offer for your Myrtle Beach house, or list it?",
  h1em: `House flippers here paid about ${PAID} percent of the price they resold for.`,
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: "What cash buyers in Horry County paid against what they resold for, when cash is the better choice, and how to check the buyer and the contract.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Got a cash offer? Send it to us before you answer. We will set it beside what listing would leave you.", label: "Send us the offer you got", href: CTA },
  author: "devin",
  shortAnswer: [
    "List it, unless the house needs heavy repairs, cannot get a loan or insurance, or must be sold by a fixed date. Then a cash offer can be the better choice.",
    `Companies that bought Horry County houses from their owners and resold them within a year paid about ${PAID} cents for each dollar of the resale price. That is the middle sale: half paid more, half paid less. On a house worth ${money(W.fixed_up_price)} fixed up, that is an offer of about ${money(W.cash_offer)}.`,
    `A cash sale skips the wait for a loan. In September 2026, the middle listed home in the Myrtle Beach area took ${DOZ_DAYS} days to get a signed contract, then about five weeks to close.`,
  ],
  sections: [
    { h2: "Who makes cash offers on houses in Myrtle Beach?", toc: "Who the cash buyers are", id: "who-buys", html: () =>
      ph.css() +
      h.p("Three kinds of buyer make cash offers on houses here:") +
      `<ul class="co-plain" aria-label="Three kinds of cash buyer">`
      + `<li><b>Online instant-offer buyers</b>A company that makes an offer online from the address, also called an iBuyer.</li>`
      + `<li><b>Local investors</b>People and companies who buy a house to fix up and resell, or to rent out.</li>`
      + `<li><b>"We buy houses" buyers</b>Buyers who send letters, call, or put up roadside signs offering cash for houses. ${h.a("#check", "We check them")} the same way as any other buyer.</li>`
      + `</ul>` +
      h.p(`Many more buyers here pay without a home loan. We matched the county's ${h.ext(DEEDS, "deed and mortgage records")} for a full year of home resales. At least 1 in 3 had no new home loan recorded in the buyer's name, and about 3 in 4 of those buyers were people, not companies. A house listed for sale reaches those buyers too.`) },

    { h2: "How much less is a cash offer, and how do cash buyers set the price?", toc: "How much less", id: "how-much-less", html: (bg) =>
      h.p(`In the middle sale, a company paid about a third less than it later resold the house for.`) +
      `<div class="co-side">` +
      h.p(`The chart shows the middle prices. Companies paid ${money(BR.median_buy)} for houses they bought from the owners, and resold them for ${money(BR.median_sell)}, about four months later.`) +
      PAID_CHART +
      h.p("A company that buys to resell has to pay for repairs, months of holding the house, two closings and the costs of selling. It pays for all of them, and its profit, out of the difference between the two prices. Offers vary from house to house.") + `</div>` +
      h.cta("What is your house worth as it is, and fixed up?", "Send us the address. We price it both ways from recorded sales near it, so you can judge any cash offer against them.", "Have us price your house two ways", CTA, bg) },

    { h2: "Cash offer or listing: which leaves you more money?", toc: "What you keep", id: "what-you-keep", html: () =>
      h.p(`Listing leaves you more when repairs, fees and time cost less than the cash buyer's discount. Take a house that would sell for ${money(W.fixed_up_price)} once fixed up, the middle resale price in our count. A cash offer at the middle share companies paid would be about ${money(W.cash_offer)}.`) +
      WAYS +
      h.p(`Listing fees are a percent you agree with your agent. When each way beats the cash offer:`) +
      `<ul class="co-plain" aria-label="When listing beats the cash offer">`
      + `<li><b>List it as is</b>It leaves you more when its price, less the listing fees, is above the offer. Our count of the county's deeds cannot tell a house sold as it is from one that was fixed up, so it gives no as-is price. We work that price out for your house from the recorded sales near it.</li>`
      + `<li><b>Fix it, then list it</b>It leaves you more when the repairs and the listing fees come to less than about ${money(W.gap)}.</li></ul>` +
      h.p("This is an example on the county's middle figures, not an offer on any house.") +
      h.p(`Our ${h.a("/sell/net-proceeds/", "net proceeds calculator")} works out what you keep after the loan payoff and every cost. Our page on ${h.a("/sell/repairs-before-selling/", "repairs before selling")} shows which repairs pay back, and our ${h.a("/sell/capital-gains/", "capital gains page")} covers tax on the sale.`) +
      h.p("Looking at a cash offer with you is free. We are paid only if you list the house with us and it sells.") },

    { h2: "When is a cash offer the better choice?", toc: "When cash is better", id: "when-cash", html: (bg) =>
      h.p("A cash offer is the better choice when a buyer with a loan cannot buy the house, or when you need a sure closing date.") +
      `<div class="co-two"><div>` +
      h.p(`A cash sale has no lender, so there is no loan approval or lender's appraisal to wait for. A South Carolina attorney still supervises the title search, the closing and the recording of the deed. Our page on the ${h.a("/sell/best-time-to-sell/", "best time to sell")} shows how the wait for a contract changes by month.`) +
      DECIDE + `</div>` + PHOTO + `</div>` +
      h.cta("Want cash buyers without giving up the open market?", "We list the house as it is, where every agent's buyers can see it, and send it to the investors on our list.", "Have us list it as is in front of cash buyers", CTA, bg) },

    { h2: "Can you sell a house as is in South Carolina?", toc: "Selling as is", id: "as-is", html: () =>
      h.p(`Yes. "As is" means you sell without making repairs. The ${h.ext(T27_50, "state's disclosure form")} is still required, and a cash sale is not exempt for being cash. Our page on the ${h.a("/sell/seller-disclosure/", "seller disclosure form")} goes through it question by question.`) +
      h.h3("Sellers already list houses as cash only") +
      h.p("A seller can list the house as it is and ask for cash buyers only. The local listing feed had these:") +
      CASH_ONLY + G.homesCss() + G.homes("cash-only-houses", "houses listed cash only", "", "Houses listed now for cash buyers only") +
      h.p(`A cash offer made before the house is listed is one buyer's offer. A listing puts the house in front of every buyer at once, with a loan or without. The state Real Estate Commission ${h.ext(LLR_EXP, "warns")} that keeping a home off the open market can mean less competition and a lower price, worse terms or a longer sale.`) +
      h.h3("One sale to a cash buyer") +
      h.p(`One of our agents sold a rented house this way. The owner was moving to New York to be with his sister, and the lease still had eight months left. The next investor would make only about half his monthly cash flow, the rent left after costs, because of higher taxes and a bigger loan.`) +
      h.p(`The agent marketed the house to our list of investors who accept a modest cash flow on a home rising in value. A cash buyer closed within 13 days of the day it was listed. That was his sale and his figures, not a promise. Our ${h.a("/sell/rental-property/", "rental property page")} tells the rest.`) },

    { h2: "How do you check a cash buyer and the contract?", toc: "Checking the buyer", id: "check", html: (bg) =>
      h.p("Before you sign a cash buyer's contract, our agents check six things:") +
      CHECK +
      `<h3 id="wholesaling" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">Is wholesaling legal in South Carolina?</h3>` +
      h.p(`No, as the state Real Estate Commission reads the law. Since May 2024, South Carolina's ${h.ext(T40_57, "license law")} has defined wholesaling. It means having a contract to buy a home from its owner, then marketing it to a different buyer before owning it.`) +
      `<ul class="co-plain" aria-label="South Carolina's rules on wholesaling">`
      + `<li><b>Marketing takes a license</b>Marketing a home someone else owns, for pay, takes a real estate license. In ${h.ext(LLR_WH, "its advisory opinion")}, the Commission reads that as a ban on wholesaling.</li>`
      + `<li><b>What counts as marketing</b>The MLS, social media, email groups and word of mouth. Naming the address, a photo or the neighborhood counts too.</li>`
      + `<li><b>Brokerages</b>A licensed brokerage such as Chapter3 may not take part in wholesaling or help anyone do it.</li></ul>` +
      h.p("The Commission's opinion is guidance, not a court ruling. If a buyer markets your house before closing, a South Carolina attorney can tell you what it means for your contract.") +
      h.cta("Got a contract from a cash buyer?", "Send it to us before you sign. Our agents read the deposit, the inspection period and any right to hand it on, and tell you what each means for you.", "Send us the contract before you sign", CTA, bg) },
  ],
  pageImages: () => ph.pageImages(),
  afterSources: () => AFTER(),
  faqTitle: "Cash offer FAQ",
  faq: FAQ,
  sources: [
    { name: "Horry County deeds and mortgages", href: DEEDS },
    { name: "Zillow Research", href: ZRES },
    { name: "SC Code 40-57", href: T40_57 },
    { name: "SC Commission on wholesaling", href: LLR_WH },
    { name: "SC Commission on market exposure", href: LLR_EXP },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC Code 12-24", href: T12_24 },
    { name: "Doe v. McMaster", href: DOE },
    { name: "NAR earnest money guide", href: NAR },
    { name: "Freddie Mac contingencies", href: FMAC },
    { name: "Fannie Mae B4-1.3-06", href: FNMA_C },
    { name: "Fannie Mae B7-3-02", href: FNMA_I },
    { name: "SC business records", href: SOS },
    { name: "CFPB", href: CFPB },
  ],
  sourcesNote: "Our reading of Horry County's deed and mortgage records, October 2025 to September 2026. Timing: Zillow's median days to pending and mean days to close, Myrtle Beach area.",
  bottomCta: { h2: "Cash offer or listing: which is right for your house?", p: "Tell us what the house needs and when you must move. We will work out what you would keep each way, and say which we would choose.", label: "Have us compare both", href: CTA },
  keywords: "cash offer for my house, cash offer vs listing, sell my house fast Myrtle Beach, we buy houses Myrtle Beach, sell house as is South Carolina, how much less is a cash offer, how fast is a cash sale, is wholesaling legal in SC, and or assigns, earnest money cash offer, proof of funds",
  about: "Cash offers on houses and selling as is in Myrtle Beach and Horry County, South Carolina",
});
