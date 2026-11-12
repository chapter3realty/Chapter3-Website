/* /sell/ - selling a house in Myrtle Beach: list it, or sell it as is for cash. What listed houses sold for and how long
 * they waited, by area; what a company that buys to resell pays; the months buyers sign the most contracts; the costs
 * in one line each; how a sale with our agent works; and every selling guide in one list.
 *
 * Batch 2026-11-b, Lane U. The live hub was hand-made HTML (no spec); this is its first spec, and it stays the seller
 * hub (URL kept). Plan: Blog-Brain batches/2026-11-b/sell/PLAN.md. Demand: must-answer.md.
 * Facts: facts.md, VERIFIED rows, and CORRECTED rows (7, 9, 12, 16, 17, 18, 21, 22, 23, 24, 26, 27) only in the
 * verifier's wording (VERIFY.md). Row 31 is struck: none of the live page's unsourced claims is printed. Struck wording:
 * batches/2026-11-b/facts/sell-struck.json.
 * Data, never typed (website working copy): data/2026-11-b/sell/findings.json (CCAR September 2026, by month and by
 * area; the Horry County deed counts; the $350,000 example; the costs and the price-cut count read from net-proceeds).
 * The spec throws if a ledger value moves. Row 17 is CORRECTED (builders buying land left out): its two figures are
 * typed at the verifier's values, with the row number beside them, because findings.json holds the first figures.
 * Design, as /sell/net-proceeds/, /sell/fsbo/ and /submarkets/garden-city/ (owner-approved 2026-11-08): the italic
 * line at about half the H1's size, one card style for the chart, the example and the offers, plain tables and lists
 * under thin rules, one block width of 720 px, an offer after about every second section, each tied to that section.
 * Kept from the live page: the title's searched words, the two ways to sell with both numbers shown first ("Nobody
 * here pushes you either way"), the seven steps (with no counts), commission is negotiable, the attorney at closing,
 * the hold-back for owners in another state, the phone button, the consent text word for word, links to every guide.
 * Cut (PLAN.md): the hero form and buttons, the visitor and feeder-state tiles, the stale market tiles, the pricing
 * penalty ladder, "Four things other listings do not get", the condotel box, the duplicate FAQ, every row-31 claim.
 * Homes: the site's edge puts "Your competition: homes for sale now" (idx-lib/feeds.js "/sell/") under the opening.
 * The hub names no single place, so it carries no glass.js homes() strip.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/sell/";
const DATA = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("2026-11-b/sell/findings.json");
const must = (ok, msg) => { if (!ok) throw new Error(`sell.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);

/* ---- Rows 3, 4, 5: the market for sellers, CCAR, January to September 2026. ---- */
const SF = F.market.single_family, CO = F.market.condo;
must(F.meta.ccar_month === "2026-09", "the CCAR month moved; every 'January to September 2026' needs a new period");
must(SF.dom_ytd === 122 && CO.dom_ytd === 131, "row 3: days to an accepted offer moved");
must(SF.pct_list_ytd === 97.3 && CO.pct_list_ytd === 96.0, "row 4: share of the last list price moved");
must(SF.months_supply_sep === 4.2 && CO.months_supply_sep === 7.5, "row 5: months of supply moved");
const PERIOD = "January to September 2026";
const MONTHS4 = Math.round(SF.dom_ytd / 30.4);
must(MONTHS4 === 4, "row 3: no longer about four months");
const pct1 = (v) => v.toFixed(1);

/* ---- Rows 8 and 9: contracts signed by month, and days to an offer by month. ---- */
const PM = F.pending_by_month;
must(PM.length === 12 && PM.every((m) => m.total === m.single_family + m.condo), "row 8: the monthly table changed shape");
const MON = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" };
const monthName = (k) => { const [m, y] = k.split("-"); must(MON[m], `unknown month ${k}`); return `${MON[m]} ${y}`; };
const monthOnly = (k) => monthName(k).split(" ")[0];
const TOP3 = [...PM].sort((a, b) => b.total - a.total).slice(0, 3).map((m) => m.month);
const LOW = [...PM].sort((a, b) => a.total - b.total)[0].month;
must(TOP3.join() === F.pending_top3.join() && TOP3.join() === "Apr-2026,Mar-2026,May-2026" && LOW === "Dec-2025" && LOW === F.pending_low, "row 8: the busiest and quietest months moved");
const DM = F.dom_by_month;
const dLo = DM.reduce((a, b) => (b.single_family < a.single_family ? b : a)), dHi = DM.reduce((a, b) => (b.single_family > a.single_family ? b : a));
must(dLo.single_family === 112 && dLo.month === "Aug-2026" && dHi.single_family === 134 && dHi.month === "Feb-2026", "row 9: the house range by month moved");
const FIRST = monthName(PM[0].month), LAST = monthName(PM[PM.length - 1].month);
must(FIRST === "October 2025" && LAST === "September 2026", "row 8: the chart's 12 months moved");

/* ---- Rows 10 and 11: by CCAR area, January to September 2026; cells under 50 sales are left out. ---- */
const NAMES = {
  "Aynor": { name: "Aynor" },
  "Carolina Forest": { name: "Carolina Forest", href: "/submarkets/carolina-forest/" },
  "Conway": { name: "Conway", href: "/submarkets/conway/" },
  "Garden City / Murrells Inlet": { name: "Garden City and Murrells Inlet" },
  "Georgetown": { name: "Georgetown" },
  "Little River": { name: "Little River", href: "/submarkets/little-river/" },
  "Loris / Longs": { name: "Loris and Longs" },
  "Myrtle Beach": { name: "Myrtle Beach", href: "/submarkets/myrtle-beach/" },
  "North Myrtle Beach": { name: "North Myrtle Beach", href: "/submarkets/north-myrtle-beach/" },
  "Pawleys Island / Litchfield": { name: "Pawleys Island and Litchfield", href: "/submarkets/pawleys-island/" },
  "Socastee": { name: "Socastee" },
  "Surfside Beach": { name: "Surfside Beach", href: "/submarkets/surfside-beach/" },
};
for (const a of F.areas_ytd) for (const k of ["single_family", "condo"]) if (a[k]) must(a[k].closed_ytd >= 50, `row 10: ${a.area} ${k} has under 50 sales`);
const AREAS = F.areas_ytd.filter((a) => a.single_family).map((a) => {
  must(NAMES[a.area], `findings.json areas_ytd: no display name for "${a.area}"`);
  return Object.assign({ zips: /^\d/.test(a.zips) ? a.zips.replace(" and ", ", ") : "" }, NAMES[a.area], { house: a.single_family, condo: a.condo });
}).sort((x, y) => x.house.dom_ytd - y.house.dom_ytd);
must(AREAS.length === 12 && !F.areas_ytd.find((a) => a.area === "Andrews").single_family, "row 10: twelve areas, Andrews left out");
must(AREAS[0].name === "Garden City and Murrells Inlet" && AREAS[0].house.dom_ytd === 111 && AREAS[11].name === "Aynor" && AREAS[11].house.dom_ytd === 136, "row 10: the fastest and slowest areas moved");
const AMB = F.areas_ytd.find((a) => a.area === "Myrtle Beach");
must(AMB.zips === "29572 and 29577" && AMB.condo.closed_ytd === 1252 && AMB.single_family.closed_ytd === 480 && AMB.condo.dom_ytd === 142 && AMB.condo.pct_list_ytd === 94.8 && AMB.single_family.dom_ytd === 131, "row 11: the Myrtle Beach area moved");
const lowestShare = Math.min(...F.areas_ytd.flatMap((a) => [a.single_family, a.condo].filter(Boolean).map((c) => c.pct_list_ytd)));
must(lowestShare === AMB.condo.pct_list_ytd, "row 11: the Myrtle Beach condo is no longer the lowest share of any area");
must(AMB.condo.closed_ytd > 2 * AMB.single_family.closed_ytd, "row 11: Myrtle Beach-area condos no longer more than twice the houses");

/* ---- Row 14: our count of resale homes for sale that cut their price (the day it ran, from the data file). ---- */
const PC = F.price_cuts_now;
must(PC.house_resale === 2188 && PC.house_resale_cut === 1260 && PC.house_resale_cut / PC.house_resale > 0.5, "row 14: no longer more than half of houses");
const PULLED = new Date(PC.pulled);
must(!isNaN(PULLED), "findings.json price_cuts_now.pulled is not a date");
const PULL_DAY = PULLED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/* ---- Rows 15, 17, 19, 22: Horry County deeds, October 2025 to September 2026. ---- */
const INV = F.investor;
must(INV.pairs_houses === 82 && INV.share_paid_of_resale === 0.691, "row 19: the 82 quick resales moved");
const CENTS = Math.round(INV.share_paid_of_resale * 100 / 10) * 10;  // "about 70 cents on the dollar" (row 19, verifier: fair)
must(CENTS === 70, "row 19: no longer about 70 cents");
/* Row 17, CORRECTED (builder buyers left out): companies about 94 percent, people about 101. findings.json holds 0.934. */
const CO_RATIO = 94, PERSON_RATIO = Math.round(INV.person_house_ratio * 100);  // row 17
must(PERSON_RATIO === 101 && INV.company_house_ratio < 0.95, "row 17: people's share moved");
const EX = F.example_350k;
must(EX.price_fixed_up === 350000 && EX.investor_price_at_median_share === 242000, "row 22: the example moved");
must(Math.round(EX.price_fixed_up * INV.share_paid_of_resale / 1000) * 1000 === EX.investor_price_at_median_share, "row 22: the example no longer follows row 19");

/* ---- Rows 23, 24, 26: the costs, one line each (net-proceeds owns them). ---- */
const CM = F.costs_middle_house;
must(CM.price === 350000 && CM.fixed_by_law === 1320 && CM.per_1pct_commission === 3500, "row 23: the costs moved");

/* ---- Row 15 (OSB 2): buyers whose tax bill goes outside South Carolina. ---- */
const OUT_SHARE = "3 in 10";  // 3,603 of 12,125 = 29.7% (OSB 2, verified 2026-11-09)

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const CCAR = "https://www.ccarsc.org/pages/marketstats/";
const CCAR_MLS = "https://www.ccarsc.org/pages/mls-faqs/";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const CODE = (t, c) => `https://www.scstatehouse.gov/code/statmast.php?title=${t}&amp;chapter=${c}`;
const T40_57 = CODE(40, 57), T27_50 = CODE(27, 50), T12_8 = CODE(12, 8);
const F310 = "https://screaltors.org/wp-content/uploads/2026/02/310.pdf";
const NAR_SET = "https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers";
const DOE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const DOR = "https://dor.sc.gov/news/information-about-h-4216";
const LEAD = "#lead-form";
const TEL = "tel:+18543332135";

/* ---- The photo: houses and condo towers on one beach (USGS, public domain; record from /submarkets/myrtle-beach/). ---- */
const PHOTOS = read("2026-11-a/submarkets-myrtle-beach/photos.json").photos;
const BEACH = PHOTOS.find((r) => r.file.endsWith("/houses-and-towers-from-the-ocean-1200w.webp"));
must(BEACH, "no photo record for houses-and-towers-from-the-ocean");
const BEACH_CAP = `Houses and condo towers side by side on the beach in Myrtle Beach.`;
const BEACH_PHOTO = PH.heroPhoto(BEACH, { alt: BEACH.alt, caption: BEACH_CAP, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.5rem;');
const CREDITS_NOTE = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.</div>';
const CREDITS_RAW = PH.creditsList([{ photo: BEACH, caption: "Houses and condo towers side by side on the beach in Myrtle Beach" }]);
must(CREDITS_RAW.includes(CREDITS_NOTE) && /resized the photo/.test(CREDITS_RAW), "photo credits: the note of changes moved");
/* One public-domain photo, whose own line already says what was changed: the generic second line is left out. */
const CREDITS = CREDITS_RAW.replace(CREDITS_NOTE, "");

/* ---- The glance row under the H1 (rows 3, 4, 8). ---- */
const GLANCE = PK.glance([
  { icon: "dollar", label: `${pct1(SF.pct_list_ytd)}%`, text: "of the last asking price, for houses" },
  { icon: "calendar", label: `About ${MONTHS4} months`, text: "from listing to an accepted offer" },
  { icon: "key", label: "March to May", text: "the months buyers sign the most" },
]);

/* ---- V1: list it or sell it as is (rows 3, 4, 19, 30). A plain table; on a phone each row is a short card. ---- */
const CMP = [
  ["What it brings", `${pct1(SF.pct_list_ytd)} percent of the last asking price, on average`, `About ${CENTS} cents on the dollar of what a company later resells it for`],
  ["How long it takes", `About ${MONTHS4} months to an accepted offer, then the closing`, "You and the buyer pick the closing date"],
  ["Repairs and showings", "You fix what an inspector would flag, and buyers tour the house", "No repairs. The buyer takes the house as it is"],
  ["The buyer's money", "Often a loan, and the contract can depend on getting it", "Cash. A cash offer does not depend on a loan"],
  ["Best for", "A house that is ready, and an owner who can wait", "Speed, a house that needs work, or an estate"],
];
const COMPARE = `<div class="sl-tw"><table class="sl-tab sl-cmp"><caption>List it, or sell it as is for cash</caption>`
  + `<thead><tr><th scope="col"><span class="sr">Question</span></th><th scope="col">List it</th><th scope="col">Sell it as is for cash</th></tr></thead><tbody>`
  + CMP.map(([q, a, b]) => `<tr><th scope="row">${q}</th><td><span class="l">List it</span>${a}</td><td><span class="l">Sell it as is</span>${b}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* The labelled example (row 22, verifier's wording; no arithmetic, STORY-3). */
const EXAMPLE = `<aside class="sl-ex" aria-label="Example"><p class="k">Example</p>`
  + `<p>A house would sell for about ${money(EX.price_fixed_up)} once it is fixed up. A company that buys it to resell would pay about ${money(EX.investor_price_at_median_share)}, at the middle share of those ${INV.pairs_houses} quick resales.</p>`
  + `<p>The difference pays for the repairs, the months the company owns the house, and its profit. The deeds do not show how it splits.</p></aside>`;

/* ---- V2: days to an offer and share of asking, by area (rows 10, 11). ---- */
const cellTxt = (c) => (c ? `${n0(c.dom_ytd)} days<span class="s">${pct1(c.pct_list_ytd)}% of asking</span>` : `<span class="na">Too few sales</span>`);
const areaName = (a) => (a.href ? h.a(a.href, a.name) : a.name) + (a.zips ? `<span class="z">ZIP ${a.zips}</span>` : "");
const HMIN = AREAS[0].house.dom_ytd, HMAX = AREAS[AREAS.length - 1].house.dom_ytd;
const AREA_TABLE = `<div class="sl-tw"><table class="sl-tab sl-area"><caption>In every area, houses waited ${HMIN} to ${HMAX} days for an offer</caption>`
  + `<thead><tr><th scope="col">Area</th><th scope="col">Houses</th><th scope="col">Condos</th></tr></thead><tbody>`
  + AREAS.map((a) => `<tr><th scope="row">${areaName(a)}</th><td><span class="l">Houses</span>${cellTxt(a.house)}</td><td><span class="l">Condos</span>${cellTxt(a.condo)}</td></tr>`).join("")
  + `</tbody></table><p class="nt">Days from listing to an accepted offer, and the share of the last asking price it sold for, this year to September. Sorted by the wait for houses, shortest first.</p></div>`;

/* ---- V3: contracts signed each month (row 8). The three busiest months in brass, the rest gray. ---- */
const MONTH_CHART = G.bars(PM.map((m) => ({ name: monthOnly(m.month), value: m.total, valueText: n0(m.total), reference: !TOP3.includes(m.month) })),
  { caption: "Buyers signed the most contracts in March, April and May", nameLabel: "Month", valueLabel: "Contracts signed, houses and condos", compact: true,
    note: `Contracts signed on houses and condos each month, ${FIRST} to ${LAST}. The three busiest months are in brass.` });
/* Body copy says the period once, in the short answer (score P3); the chart's note and the sources line carry the rest. */

/* ---- The lead form: the live page's consent text word for word, source "Sell page" (the live end form's). ---- */
const CONSENT = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
const LEAD_FORM = `<div id="ldWrap" class="sl-form">`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldCtx" placeholder="Property address" aria-label="Property address" autocomplete="street-address"></div>`
  + `<div class="idx-lead"><input class="idx-input" id="ldName" placeholder="Your name" aria-label="Your name" autocomplete="name"><input class="idx-input" id="ldPhone" placeholder="Phone" aria-label="Phone" type="tel" autocomplete="tel"></div>`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldEmail" placeholder="Email" aria-label="Email" type="email" autocomplete="email"></div>`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><textarea class="idx-input" id="ldNote" rows="3" placeholder="Your timing, or anything we should know (optional)" aria-label="Your timing, or anything we should know (optional)"></textarea></div>`
  + `<label class="sl-consent"><input type="checkbox" id="ldConsent"><span>${CONSENT}</span></label>`
  + `<p id="ldErr" class="sl-err" role="alert"></p>`
  + `<button type="button" class="btn btn-brass btn-lg" onclick="ldSubmit()">Send it to a listing agent</button>`
  + `<p class="sl-tel">Free, and you do not have to list with us. Prefer to talk now?</p><a class="btn btn-outline sl-call" href="${TEL}">Call 854.333.2135</a></div>`
  + `<div id="ldOk" class="sl-ok">Thanks. A licensed agent will call you about your home.</div>`
  + `<script>function ldSubmit(){`
  + `var cx=document.getElementById('ldCtx').value.trim(),n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),em=document.getElementById('ldEmail').value.trim(),nt=document.getElementById('ldNote').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');`
  + `function fail(m){err.textContent=m;err.style.display='block';}err.style.display='none';`
  + `if(!cx||!n){fail('Add the property address and your name.');return;}`
  + `if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}`
  + `if(!c){fail('Check the consent box to send the request.');return;}`
  + `c3SendForm({property_address:cx,name:n,phone:ph,email:em,message:'Seller enquiry. '+nt,consent:c?'yes':'no'},'Sell page');`
  + `document.getElementById('ldWrap').style.display='none';document.getElementById('ldOk').style.display='block';}</script>`;

/* ---- The page's own styles: one card style (the glass surface) for the chart, the example and the offers; tables
   and lists on the page under thin rules; one block width of 720 px. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226", BRASS = "#c4783a";
const SURF = "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,inset 0 1px 0 rgba(255,255,255,.9)),var(--g-sh,0 10px 26px -18px rgba(28,32,40,.35))";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  /* the contents list: no card, in columns between two thin rules */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* the headline: the italic line at about half the H1's size; the hero sub is said by the short answer */
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  /* the hero tiles: glass tiles on a wide screen, short rows under rules on a phone */
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* one block width */
  + `${S} .c3-gchart,${S} .sl-tw,${S} .sl-ex,${S} .sl-plain,${S} .sl-form,${S} .sl-guides{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  /* tables: plain, under thin rules */
  + `${S} .sl-tw{margin:1.3rem 0 1.5rem}`
  + `${S} .sl-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .sl-tab caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem;font-size:1.08rem}`
  + `${S} .sl-tab thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .sl-tab tbody th{text-align:left;font-weight:600;padding:.7rem .9rem .7rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top}`
  + `${S} .sl-tab td{padding:.7rem .8rem .7rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.45;color:var(--muted)}`
  + `${S} .sl-tab td .l{display:none}${S} .sl-tab .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .sl-cmp tbody th{width:24%}${S} .sl-cmp td{width:38%}`
  + `${S} .sl-area td{font-variant-numeric:tabular-nums;color:var(--navy);font-weight:600;white-space:nowrap}`
  + `${S} .sl-area td .s{display:block;font-weight:400;color:var(--muted);font-size:.95rem}${S} .sl-area td .na{font-weight:400;color:var(--muted)}`
  + `${S} .sl-area .z{display:block;font-weight:400;color:var(--muted);font-size:.9rem;margin-top:.1rem}`
  + `${S} .sl-tw .nt{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.7rem 0 0}`
  + `@media (max-width:599px){${S} .sl-tab,${S} .sl-tab tbody,${S} .sl-tab caption{display:block;width:100%}`
  + `${S} .sl-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .sl-tab tr{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1rem;row-gap:.35rem;padding:.75rem 0;border-bottom:${RULE}}`
  + `${S} .sl-tab th,${S} .sl-tab td{border:0!important;padding:0;width:auto!important}${S} .sl-tab tbody th{grid-column:1/-1;padding-bottom:.15rem}`
  + `${S} .sl-tab td .l{display:block;font-size:.875rem;color:var(--muted);font-weight:400;white-space:normal;line-height:1.3;margin-bottom:.1rem}`
  + `${S} .sl-cmp td{color:var(--navy);font-size:1rem}${S} .sl-cmp td .l{font-weight:600;color:${INK}}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  /* the example: the glass card of the chart and the offers */
  + `${S} .sl-ex{margin:1.3rem 0 1.5rem;padding:1.1rem 1.3rem .4rem;border-radius:20px;${SURF};font-family:var(--sans)}`
  + `${S} .sl-ex .k{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .5rem}`
  + `${S} .sl-ex p:not(.k){color:var(--navy);line-height:1.7;margin:0 0 .8rem;font-size:1.0625rem}`
  /* the steps: a plain numbered list under thin rules, a bold lead-in on each */
  + `${S} .sl-steps{list-style:none;counter-reset:st;margin:1.1rem 0 1.4rem;padding:0;max-width:720px}`
  + `${S} .sl-steps li{counter-increment:st;position:relative;margin:0;padding:.8rem 0 .8rem 2.6rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .sl-steps li:last-child{border-bottom:${RULE}}`
  + `${S} .sl-steps li::before{content:counter(st);position:absolute;left:0;top:.85rem;width:1.8rem;height:1.8rem;border-radius:50%;background:${BRASS};color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center}`
  + `${S} .sl-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.15rem}`
  /* the month chart: month names are short, so the bars get the rest of the row at every width */
  + `${S} .sl-months .c3-gchart [role=row]{grid-template-columns:6.6rem minmax(0,1fr)!important;column-gap:.8rem!important;align-items:center}`
  + `${S} .sl-months .c3-gchart .b{width:calc((100% - 4.2rem) * var(--f))!important}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .sl-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .sl-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .sl-plain li:last-child{border-bottom:${RULE}}${S} .sl-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* the guides: a plain list under thin rules, two columns on a wide screen */
  + `${S} .sl-guides{list-style:none;margin:1rem 0 1.4rem;padding:0;}`
  + `${S} .sl-guides li{margin:0;padding:.75rem 0;border-top:${RULE};line-height:1.45;font-size:1.0625rem;color:var(--muted)}`
  + `${S} .sl-guides li:last-child{border-bottom:${RULE}}`
  + `${S} .sl-guides a{display:block;font-weight:600;font-family:var(--sans)}`
  /* the lead form */
  + `${S} .sl-form{margin:1.4rem 0 1rem;padding:1.4rem 1.3rem;border-radius:20px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14)}`
  + `${S} .sl-form .idx-lead{margin-bottom:.7rem}${S} .sl-form .idx-input{min-height:48px;font-size:1.0625rem;box-sizing:border-box;width:100%}${S} .sl-form textarea.idx-input{font-family:var(--sans);resize:vertical}`
  + `${S} .sl-consent{display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.875rem;color:rgba(244,239,232,.86);line-height:1.5;margin:.3rem 0 1rem;cursor:pointer}`
  + `${S} .sl-consent input{margin-top:.2rem;accent-color:${BRASS};flex-shrink:0;width:20px;height:20px}`
  + `${S} .sl-form .btn{width:100%;justify-content:center;min-height:50px;box-sizing:border-box}`
  + `${S} .sl-err{display:none;color:#ffb4a8;font-family:var(--sans);font-size:1rem;margin:0 0 .8rem}`
  + `${S} .sl-tel{color:rgba(244,239,232,.86);font-family:var(--sans);font-size:1rem;margin:.9rem 0 0}`
  + `${S} .sl-form a.sl-call{display:flex;align-items:center;margin-top:.6rem;color:var(--ivory);border:1px solid rgba(244,239,232,.55);background:transparent}`
  + `${S} .sl-ok{display:none;max-width:720px;margin:1.4rem 0 1rem;padding:1.3rem;border-radius:20px;background:var(--navy);color:var(--ivory);font-family:var(--sans);font-size:1.0625rem;line-height:1.6}`
  /* Work-arounds copied from /sell/net-proceeds/: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  /* the slim offer bar under the short answer starts where the text starts, at 700 to 1263 px too */
  + "@media (min-width:700px){main#main>section[style^=\"background:var(--navy)\"]:not(:last-child)>.wrap{margin-left:max(2rem,calc((100% - 1200px) / 2 + 2rem))!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys or tax advisers, and nothing on this page is legal or tax advice.</p>`;

/* The selling guides: one calm list, the link on the words that say what each answers. */
const GUIDES = [
  ["/sell/home-value/", "What is my home worth in Myrtle Beach?"],
  ["/sell/net-proceeds/", "What will I keep after selling?"],
  ["/sell/sell-my-condo/", "Selling a condo in Myrtle Beach"],
  ["/sell/rental-property/", "Selling a rental with tenants or bookings"],
  ["/sell/inherited-house/", "Selling an inherited house"],
  ["/sell/out-of-state-buyers/", "Selling a Myrtle Beach home from another state"],
  ["/sell/capital-gains/", "The tax on the gain when you sell"],
  ["/sell/fsbo/", "Selling your house by owner"],
  ["/sell/cash-offer/", "A cash offer or a listing: which pays more?"],
  ["/sell/repairs-before-selling/", "What to fix before you sell, and what to leave"],
  ["/sell/seller-disclosure/", "What South Carolina makes you disclose"],
  ["/sell/best-time-to-sell/", "The best month to list"],
  ["/sell/sell-or-buy-first/", "Sell first or buy first?"],
  ["/sell/divorce/", "Selling a house during a divorce in South Carolina"],
  ["/invest/strategies/1031-exchange/", "Selling a rental to buy another one"],
];
const plain = (items) => `<ul class="sl-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const GUIDE_LIST = `<ul class="sl-guides">${GUIDES.map(([u, t]) => `<li>${h.a(u, t)}</li>`).join("")}</ul>`;

/* The FAQ repeats only questions the page answers, said short and in other words. */
const FAQ = [
  { q: "How long does it take to sell a house in Myrtle Beach?", a: `Houses waited ${SF.dom_ytd} days on average for an accepted offer this year, and condos ${CO.dom_ytd}. You and the buyer then agree on the closing date in the contract.` },
  { q: "Can I sell my house as is in South Carolina?", a: `Yes. You make no repairs, and a company that buys to resell pays less than it later sells the house for. You still give the buyer the state's disclosure form.` },
  { q: "Do I need an attorney to sell my house in South Carolina?", a: "Yes. A South Carolina attorney must supervise every home closing in the state. Our agent keeps that attorney, the buyer's side and your lender on the same dates." },
  { q: "Can I sell my house and buy another at the same time?", a: "Yes. Your offer on the next home can depend on selling the one you own now. You and your buyer can also agree that you stay on after closing." },
  { q: "What changes if I live in another state?", a: "The buyer must hold back part of the price for South Carolina income tax, unless the sale is exempt. If you sign the state's form, the buyer holds back a share of your profit only." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  /* As the HOA hub (specs/hoa.js): the breadcrumb is Home / Sell / the page's own crumb. */
  hub: { name: "Sell", url: "/sell/" },
  pageImages: () => PH.pageImages(BEACH),
  title: "Sell My House in Myrtle Beach: List It or Sell for Cash?",
  description: `Myrtle Beach-area houses sold for ${pct1(SF.pct_list_ytd)}% of last asking price, Jan. to Sept. ${PERIOD.slice(-4)}, about ${MONTHS4} months to an offer. What cash buyers pay, the best month, the costs.`,
  ogTitle: "Selling your house in Myrtle Beach: list it or sell it for cash, how long it takes, and the best month to list",
  crumb: "Sell My House",
  eyebrow: "Selling a home",
  h1: "Selling your house in Myrtle Beach: list it, or sell it for cash?",
  h1em: "How long houses wait here, how close to asking they sell, and what a cash buyer pays.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: `Houses here sold for about ${Math.round(SF.pct_list_ytd)} percent of their last asking price. A cash sale is faster, and it pays less.`,
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Get both numbers for your home: listed, and sold as is.", label: "Have us price it both ways", href: LEAD },
  author: "devin",
  shortAnswer: [
    `Listed houses in Horry and Georgetown Counties sold for ${pct1(SF.pct_list_ytd)} percent of their last asking price from ${PERIOD}. They took about ${MONTHS4} months from listing to an accepted offer.`,
    `A company that bought a house to fix up and resell paid about ${CENTS} cents for each dollar it later sold the house for. A cash sale as is trades a large part of the price for speed and no repairs.`,
  ],
  sections: [
    { h2: "Should I list my house or sell it for cash?", toc: "List or cash", id: "list-or-cash", html: (bg) =>
      h.p(`List it if the house is ready and you can wait for an offer. Sell it as is for cash if speed or repairs matter more than price. Our ${h.a("/sell/cash-offer/", "cash offer or listing")} guide compares what each one leaves you.`) +
      COMPARE +
      h.h3("What does a cash buyer pay here?") +
      h.p(`We read the past year of Horry County's deeds. We found ${INV.pairs_houses} houses that a company bought from an owner and sold again within that time.`) +
      h.p(`On those houses, the company had paid about ${CENTS} cents for each dollar it later sold the house for.`) +
      EXAMPLE +
      h.p(`Companies pay less across the market too. For the houses they bought from owners, companies paid a median of about ${CO_RATIO} percent of the county's value, the market value on the tax record. People paid about ${PERSON_RATIO} percent.`) +
      h.p(`The difference is in homes the county values under about $400,000.`) +
      h.h3("How do we find you a cash buyer?") +
      h.p(`We bring you both numbers before you choose: the price range for a listing, and what a cash buyer would pay. Nobody here pushes you either way.`) +
      h.p(`One of our agents sold a ${h.a("/sell/rental-property/", "rented house")} for an owner who was moving to New York. The agent offered it to our list of investors, and a cash buyer closed within 13 days of the day he listed. One sale, not a promise.`) +
      h.p(`The cash buyer we bring you buys your house and owns it. South Carolina law calls it ${h.ext(T40_57, "wholesaling")} when someone signs a contract to buy a house, then offers the house to other buyers before owning it.`) +
      h.p(`A brokerage may not do that or help anyone do it. Selling the contract itself to someone else is not wholesaling under that law. Before you sign with any cash buyer, ask whether they will own the house.`) +
      h.h3("Does an as-is sale still need the disclosure form?") +
      h.p(`Yes. Selling as is does not by itself remove ${h.a("/sell/fsbo/#paperwork", "the state's disclosure form")}. A seller of a home with one to four units fills it in, signs it and gives it to the buyer. What goes on it is in our guide to ${h.a("/sell/seller-disclosure/", "what South Carolina makes you disclose")}.`) +
      h.p(`The form is due before both sides sign the contract, unless the contract names another time or the sale is exempt.`) +
      h.cta("See the listed number and the cash number side by side", "Send us the address. We put a listing price range and a cash price side by side, and you choose.", "Show me the listed and cash prices", LEAD, bg) },

    { h2: "How long does it take to sell a house in Myrtle Beach?", toc: "How long", id: "how-long", html: () =>
      h.p(`Houses took an average of ${SF.dom_ytd} days from listing to an accepted offer this year, and condos ${CO.dom_ytd}.`) +
      h.p(`The closing comes after the accepted offer, on the date the contract names.`) +
      AREA_TABLE +
      h.p(`In the Myrtle Beach area, condos sold more than twice as often as houses. Those condos waited ${AMB.condo.dom_ytd} days and sold for ${pct1(AMB.condo.pct_list_ytd)} percent of asking, the lowest share of any area.`) +
      BEACH_PHOTO +
      h.p(`Selling a condo? Our guide to ${h.a("/sell/sell-my-condo/", "selling a condo in Myrtle Beach")} goes through it. Our ${h.a("/market-reports/july-2026/", "July 2026 market report")} gives June's median prices by Grand Strand area, and our ${h.a("/market-reports/", "latest market report")} has the newest month.`) },

    { h2: "How close to the asking price do homes sell in Myrtle Beach?", toc: "Share of asking", id: "share-of-asking", html: (bg) =>
      h.p(`Condos sold for ${pct1(CO.pct_list_ytd)} percent of their last asking price on average this year, a little under houses. Both shares are of the last asking price, after any price cuts.`) +
      h.p(`On ${PULL_DAY} we counted the resale homes for sale in Horry County. More than half of the houses and townhouses had already cut their price.`) +
      h.p(`Is it a buyer's market? See our guide to ${h.a("/buyers/buying-in-myrtle-beach/", "buying in Myrtle Beach")}.`) +
      h.cta("Price it against the homes buyers are touring now", "We pull the homes for sale near yours, including the ones that cut their price, and send you the list with our price range.", "Have us pull my competition", LEAD, bg) },

    { h2: "When is the best time to sell a house in Myrtle Beach?", toc: "Best month", id: "best-month", html: () =>
      h.p(`Buyers signed the most contracts in March, April and May, and the fewest in December, over the past year.`) +
      `<div class="sl-months">${MONTH_CHART}</div>` +
      h.p(`The wait for an offer barely changed by month: from ${dLo.single_family} days for houses in ${monthOnly(dLo.month)} to ${dHi.single_family} in ${monthOnly(dHi.month)}. The season changes how many buyers sign, more than how long a house waits.`) +
      h.p(`Sellers list the most homes in March too, so a house has the most competition then. To be in front of the spring buyers, have the house photographed and listed by late winter. Our guide to ${h.a("/sell/best-time-to-sell/", "the best time to sell a house in Myrtle Beach")} goes month by month.`) },

    { h2: "What does it cost to sell, and what is my home worth?", toc: "Cost and value", id: "cost-and-value", html: (bg) =>
      h.p(`These are the main selling costs on the middle ${money(CM.price)} home in Horry County.`) +
      plain([
        [`Fees in state law: ${money(CM.fixed_by_law)}`, `Most of it is the state's fee on the deed. The rest is the county's charge to record the deed and the release of your paid-off mortgage. On the state's standard contract, the seller pays these.`],
        [`Commission: ${money(CM.per_1pct_commission)} for each 1 percent`, `Agents' fees are ${h.ext(NAR_SET, "fully negotiable")}, and no law fixes them.`],
        [`A hold-back, if you live in another state: ${h.ext(DOR, "5.21 percent")}`, `If your permanent home is outside South Carolina, the buyer must ${h.ext(T12_8, "hold back")} that share for state income tax on a 2026 sale. If it was your main home and its profit is tax-free under federal law, nothing is held back. If you sign the state's form, the hold-back is 5.21 percent of your profit only, not of the whole price.`],
      ]) +
      h.p(`Our ${h.a("/sell/net-proceeds/", "cost to sell a house in South Carolina")} page lists every line, with a calculator. Our ${h.a("/sell/capital-gains/", "capital gains page")} works out the tax on your profit and names the form.`) +
      h.h3("What is my home worth?") +
      h.p(`Start with ${h.a("/sell/home-value/", "what homes sold for in your area")}, from the county's deeds. An agent then prices your home from the sales most like it, free.`) +
      h.cta("Know what you keep before you list", "Send us the address and what you still owe. We send back a net sheet with every cost at your price.", "Have us work out what I keep", LEAD, bg) },

    { h2: "How do I sell my house in Myrtle Beach with an agent?", toc: "Listing with us", id: "listing-with-us", html: () =>
      h.p(`Selling with one of our agents takes these seven steps.`) +
      `<ol class="sl-steps">`
      + `<li><b>A first call</b>We learn your plans, your timing and the house. Owners in another state do this by phone or video.</li>`
      + `<li><b>A price range, with its reasons</b>We compare your home with recent sales on the local MLS, the homes for sale now and the listings that did not sell. We go through the state disclosure form with you.</li>`
      + `<li><b>A short prep list</b>We walk the house with you, in person or by video. The list holds only what an inspector would flag or an appraiser would count.</li>`
      + `<li><b>Photos and the launch</b>We book professional photos. The listing then goes live on the MLS and the home search sites it feeds.</li>`
      + `<li><b>Showings and feedback</b>We pass on what buyers and their agents say. We tell you when the price needs a second look.</li>`
      + `<li><b>Offers</b>We compare each offer on price, the buyer's loan, the inspection terms, the closing date and any credits asked for.</li>`
      + `<li><b>The closing</b>Every South Carolina home closing must be supervised by a ${h.ext(DOE, "South Carolina attorney")}. We keep the attorney, the buyer's side and your lender on the same dates.</li>`
      + `</ol>` +
      h.p(`Your buyer may live far away. About ${OUT_SHARE} homes sold in Horry County in the past year went to a buyer whose tax bill goes to another state or country.`) +
      h.p(`Live away yourself? Read ${h.a("/sell/out-of-state-buyers/", "selling a Myrtle Beach home from out of state")}.`) +
      h.h3("Can I sell my house and buy another at the same time?") +
      h.p(`Yes. Your offer on the next home can say that it goes ahead only if your current home sells and closes. The state's ${h.ext(F310, "standard contract")} has a box for that.`) +
      h.p(`The contract also has a page you and your buyer can add if you need to stay in your home after closing. We plan both sales around your move. The three ways to time the two sales are on ${h.a("/sell/sell-or-buy-first/", "sell first or buy first")}.`) },

    { h2: "Which selling guide fits your sale?", toc: "Selling guides", id: "guides", html: () =>
      h.p(`Each guide answers one question for one kind of sale.`) +
      GUIDE_LIST +
      h.p(`Buying next, or investing? ${h.a("/guides/", "Every guide on our site")} is in one list.`) },

    { h2: "Talk to a listing agent about your home", toc: "Contact us", id: "lead-form", html: () =>
      h.p(`Send the address. A licensed agent calls you to talk through your home and your timing.`) +
      LEAD_FORM },
  ],
  faqTitle: "Selling your home: questions",
  faq: FAQ,
  sources: [
    { name: "CCAR market reports", href: CCAR },
    { name: "CCAR MLS", href: CCAR_MLS },
    { name: "Horry County deeds", href: DEEDS },
    { name: "SC Code 40-57", href: T40_57 },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC Code 12-8", href: T12_8 },
    { name: "SC DOR", href: DOR },
    { name: "SCR Form 310", href: F310 },
    { name: "NAR", href: NAR_SET },
    { name: "Doe v. McMaster", href: DOE },
  ],
  sourcesNote: `Market: CCAR's MLS sales in Horry and Georgetown Counties, January to September; areas are ZIP codes. Companies: our count of a year of Horry County deeds, builders left out. Price cuts: our count of the listing feed. Forms: SCR 504 (purchase depends on sale), SCR 375 (stay after closing), DOR I-295 (hold-back).`,
  afterSources: () => CREDITS + PH.imageSchema([BEACH]) + LEGAL,
  bottomCta: { h2: "Thinking of selling in the next few months?", p: "A call is free, and listing with us is your choice.", label: "Book a call with an agent", href: "/contact/" },
  keywords: "sell my house for cash or list it Myrtle Beach, sell my house Myrtle Beach, sell my home Myrtle Beach SC, sell my house Horry County, sell my house as is Myrtle Beach, how long does it take to sell a house in Myrtle Beach, sell my house and buy another",
  about: "Selling a house in Myrtle Beach and Horry County, South Carolina",
});
