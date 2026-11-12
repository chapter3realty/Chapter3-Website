/* /invest/run-the-numbers/ - is this Grand Strand rental a good deal? A calculator with the tax a rental
 * pays here, HUD rents by ZIP code and condo dues; the numbers sheet we send, filled in for three real
 * local cases; our own counts of how many homes for sale pass the 1 percent rule, and how far the tax
 * jumps after a sale; then every cost, what a calculator cannot see, and the form.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-02. Replaces the 2026-09-05 lead-form page.
 * Facts: Blog-Brain batches/2026-11-a/invest-run-the-numbers/facts.md, VERIFIED and CORRECTED rows only,
 * at the corrected wording (VERIFY.md). Struck: Aynor's millage (row 3), the "3.6 times with the
 * exemption" figure (row 9), "every rental", "largest line" without Loris (struck list).
 * Every number on the page is computed here from data/2026-11-a/invest-run-the-numbers/ (findings.json,
 * safmr-fy2027.json, photos.json), never typed. Sources: HUD FY2027 Small Area FMRs;
 * Horry County 2026 tax levy; SC Code 12-43-220, 12-37-220, 12-37-3135, 12-37-3140; Horry County deeds
 * and parcel values (2026 resales); the site's listings feed (CCMLS), counted in aggregate, asking prices
 * only; IRS Publication 527; Insurance Information Institute; stories.json ids tenant-occupied-sale-13-days,
 * little-river-townhouses, hoa-rental-bans-filtered, insurance-quote-before-offer, property-tax-rental,
 * investor-common-question, dscr-lender-figures, landlord-insurance-premium.
 * Kept from the live page: the headline's promise (send one address, numbers back the same day, free),
 * the form, its TCPA string and c3SendForm, "What should you send?", two FAQ answers.
 * Cut: "Why get the numbers from a local agent?" (reassurance; the stories do that job with facts).
 * No interest rate, loan payment or down payment anywhere: the payment and cash boxes start empty.
 * Calculator checked against rows 17, 18 and 19 by hand (PLAYBOOK A29b): see the header of CALC.
 * Photo: NOAA aerial of houses in The Parks of Carolina Forest (public domain), our own crop, until the
 * photo partner's shots arrive (batches/2026-11-a/invest-run-the-numbers/shot-list.md).
 * Fix round 1 (2026-11-02, three reviewers; Blog-Brain batches/2026-11-a/invest-run-the-numbers/REVIEW-1.md):
 * calculator moved right under the short answer, homes strip under it (no top offer band, no contents box);
 * insurance left to the reader's quote (rows 30 and 31 struck by the lead's check); result meanings behind a "?"; tax led by its cost per
 * $100,000; cap rate target (row 32) answered on the page; no "Send the address" label; the aerial photo
 * is out of the body (it stays the share image).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/run-the-numbers/";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", "invest-run-the-numbers");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), HUD = read("safmr-fy2027.json").zips, PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => "$" + n(Math.round(v / 100) * 100);
const pct = (a, b) => Math.round(a / b * 100);

/* The three sheets (rows 17 to 19) and the two millages (row 3). */
const SH = F.sheet_house, SL = F.sheet_house_longs, SC = F.sheet_condo;
const MILLS = F.millage;
for (const s of [SH, SL, SC]) {
  const left = s.rent_year - s.tax_year - s.dues_year - s.management_year - s.repairs_and_empty_months_year;
  if (Math.abs(left - s.left_before_insurance_and_loan_year) > 1) throw new Error(`${s.label}: the lines do not add up`);
}
/* Lead check 2026-11-02 (FIXER-VERIFY.md): rows 30 and 31 are struck. The only source was an insurance agency's
   2024 estimate, built from its own homeowner averages. No primary source gives a landlord premium here, so the
   page prints none: the cap rate is before insurance and any loan, and the calculator asks for the reader's quote. */
const insOf = () => 0;
const leftAfter = (s) => s.left_before_insurance_and_loan_year - insOf(s);
const capOf = (s) => leftAfter(s) / s.price * 100;
const costShare = (s) => Math.round((s.rent_year - leftAfter(s)) / s.rent_year * 100);
const CAP_TARGET = 6, COV_TARGET = 1.25, APP_TARGET = 3; /* row 32 and row 22: the owner's dealbreakers */
/* Row 34: the metro's mid-tier Zillow home value index, the same series /invest/rental-returns/ states
   (read from the shared extract so the two pages say the same thing). */
const ZM = require(path.join(__dirname, "..", "research", "invest-next", "data", "submarkets.json")).meta.metro_zhvi.find(x => x.label === "Myrtle Beach, SC");
const annual = (now, then, yrs) => (Math.pow(now / then, 1 / yrs) - 1) * 100;
const APP5 = annual(ZM.latest, ZM.v60, 5).toFixed(1), APP10 = annual(ZM.latest, ZM.v120, 10).toFixed(1), FALL3 = Math.abs((ZM.latest / ZM.v36 - 1) * 100).toFixed(1);
if (APP5 !== "4.8" || APP10 !== "6.1" || FALL3 !== "1.7") throw new Error("metro value index moved: re-verify row 34 and match /invest/rental-returns/");
/* Row 34 (lead check): the figures hold through the extract's last month, so the page names that month, from the data. */
const ZM_TO = new Date(ZM.latestDate + "T12:00:00Z").toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
const APP_LINE = `Prices in the metro rose about ${APP5} percent a year in the five years to ${ZM_TO}, above our ${APP_TARGET} percent target. Over ten years they rose ${APP10} percent a year. In the three years to then they fell ${FALL3} percent in total.`;
/* The day the 1 percent count ran: from the listings pull in findings.json, never typed (owner, 2026-11-03). */
const RAN_ON = new Date(F.pulled.listings).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Owner, 2026-11-03: a hard call to action. We run the count again on the day you ask and send every house that passes. */
const ONE_PCT_OFFER = `<div class="rn-hard"><p class="rn-hard-h">Get this week's houses that pass the 1 percent rule</p>`
  + `<p>Homes come on and off the market every day, so this count is already old. Call or text us and we run it again that day, then send you every house that passes, with its numbers.</p>`
  + `<div class="rn-hard-b"><a class="btn btn-brass" href="/contact/">Have us run the count for you</a><a class="rn-hard-tel" href="tel:+18543332135">Call or text 854.333.2135</a></div></div>`;
const PER100K = (m) => 100000 * 0.06 * m / 1000; /* a rental's bill for each $100,000 of value (rows 1, 3) */
const H1 = F.houses_1pct, C1 = F.condos_1pct, TR = F.tax_reset, MULT = TR.unincorporated_investor_bill_multiple, DUES = F.condo_dues_all;
const OVER600 = DUES.listings - DUES.at_or_under["600"];

/* Links */
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const HC_RPT = "https://www.horrycountysc.gov/tax-payer-services/real-property-tax/";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const HUD_FMR = "https://www.huduser.gov/portal/datasets/fmr.html";
const IRS527 = "https://www.irs.gov/publications/p527";
const RETURNS = "/invest/rental-returns/";

/* ---------------------------------------------------------------------------- */
/* The page's own styles: calculator, sheet, rent bars, tax bars, cards.         */

const CSS = `<style>
main#main .rnc{background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6);border-radius:22px;padding:1.3rem 1.2rem 1.4rem;margin:1.4rem 0 1.2rem;max-width:960px;color:#f4efe8}
main#main .rnc-ex{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin:0 0 1.1rem}
main#main .rnc-ex>span{font-family:var(--sans);font-size:1rem;color:rgba(244,239,232,.8);margin-right:.2rem}
main#main .rnc-ex button{font:inherit;font-family:var(--sans);font-size:.95rem;line-height:1.2;color:#f4efe8;background:rgba(244,239,232,.1);border:1px solid rgba(244,239,232,.32);border-radius:999px;padding:.55rem .95rem;cursor:pointer;min-height:44px}
main#main .rnc-ex button[aria-pressed=true]{background:#d4894a;border-color:#d4894a;color:#1c2028;font-weight:600}
main#main .rnc-grid{display:grid;gap:1.3rem}
@media (min-width:860px){main#main .rnc-grid{grid-template-columns:1.15fr 1fr;align-items:start}}
main#main .rnc fieldset{border:0;margin:0 0 1rem;padding:0;min-width:0}
main#main .rnc legend{font-family:var(--sans);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:#e6a46c;font-weight:600;margin:0 0 .55rem;padding:0}
main#main .rnc-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(8.4rem,1fr));gap:.75rem .7rem}
main#main .rnc-f.w{grid-column:1/-1}
main#main .rnc-f{display:flex;flex-direction:column;gap:.3rem;min-width:0;font-family:var(--sans);font-size:1rem;line-height:1.3;color:rgba(244,239,232,.92)}
main#main .rnc-box{display:flex;align-items:center;background:rgba(244,239,232,.1);border:1px solid rgba(244,239,232,.34);border-radius:10px;padding:0 .6rem;min-width:0}
main#main .rnc-box:focus-within{border-color:#e6a46c;box-shadow:0 0 0 2px rgba(230,164,108,.35)}
main#main .rnc-box span{color:rgba(244,239,232,.7);font-size:1rem;flex:none}
main#main .rnc-box input,main#main .rnc-f select{flex:1 1 auto;width:100%;min-width:0;background:transparent;border:0;color:#f4efe8;font-family:var(--sans);font-size:1.05rem;padding:.6rem .3rem;outline:none;text-align:right;font-variant-numeric:tabular-nums}
main#main .rnc-f select{background:rgba(244,239,232,.1);border:1px solid rgba(244,239,232,.34);border-radius:10px;text-align:left;padding:.62rem .6rem;color:#f4efe8}
main#main .rnc-f select option{color:#1c2028;background:#fff}
main#main .rnc-hint{font-family:var(--sans);font-size:.95rem;line-height:1.45;color:rgba(244,239,232,.75);margin:.35rem 0 0}
main#main .rnc-out{background:rgba(244,239,232,.07);border:1px solid rgba(244,239,232,.18);border-radius:16px;padding:1.1rem 1.1rem 1rem}
main#main .rnc-big{font-family:var(--sans);font-size:1rem;color:rgba(244,239,232,.85);margin:0}
main#main .rnc-big strong{display:block;font-family:var(--serif);font-size:2.4rem;line-height:1.1;color:#e6a46c;font-weight:500;margin:.25rem 0 .2rem;font-variant-numeric:tabular-nums}
main#main .rnc-cap{font-family:var(--sans);font-size:1rem;color:#f4efe8;margin:0 0 .9rem}
main#main .rnc-lines{margin:0 0 1rem;padding:0;border-top:1px solid rgba(244,239,232,.18)}
main#main .rnc-lines div{display:flex;justify-content:space-between;gap:1rem;padding:.42rem 0;border-bottom:1px solid rgba(244,239,232,.12);font-family:var(--sans);font-size:1rem}
main#main .rnc-lines dt{color:rgba(244,239,232,.85);margin:0}
main#main .rnc-lines dd{margin:0;color:#f4efe8;font-variant-numeric:tabular-nums;text-align:right}
main#main .rnc-tests{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:.6rem}
main#main .rnc-t{background:rgba(244,239,232,.08);border-radius:12px;padding:.7rem .8rem;font-family:var(--sans);min-width:0}
main#main .rnc-t b{display:block;font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;color:#e6a46c;font-weight:600}
main#main .rnc-t strong{display:block;font-size:1.35rem;color:#f4efe8;font-weight:600;margin:.15rem 0;font-variant-numeric:tabular-nums}
main#main .rnc-t span{display:block;font-size:.95rem;line-height:1.4;color:rgba(244,239,232,.8)}
main#main .rn-note{color:var(--muted);font-size:1rem;line-height:1.65;max-width:720px;margin:0 0 1rem}
main#main .rn-sheet{max-width:760px;margin:1.4rem 0 1.6rem;background:linear-gradient(180deg,rgba(255,255,255,.92),rgba(255,255,255,.8));border:1px solid rgba(255,255,255,.9);box-shadow:0 18px 40px -24px rgba(28,32,40,.35),inset 0 1px 0 #fff;border-radius:20px;padding:1.2rem 1.2rem 1rem}
main#main .rn-sheet-h{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.3rem 1rem;align-items:baseline;border-bottom:2px solid var(--navy);padding-bottom:.6rem;margin-bottom:.2rem}
main#main .rn-sheet-h p{margin:0;font-family:var(--sans);color:var(--navy);font-weight:600;font-size:1.1rem}
main#main .rn-sheet-h span{font-family:var(--sans);color:var(--muted);font-size:.95rem}
main#main .rn-line{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.1rem 1rem;padding:.65rem 0;border-bottom:1px solid var(--rule)}
main#main .rn-line b{grid-column:1;grid-row:1;font-family:var(--sans);color:var(--navy);font-weight:600;font-size:1.02rem}
main#main .rn-line em{grid-column:2;grid-row:1;font-style:normal;font-family:var(--sans);color:var(--navy);font-size:1.05rem;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
main#main .rn-line small{grid-column:1/-1;font-family:var(--sans);color:var(--muted);font-size:.95rem;line-height:1.45}
main#main .rn-line.minus em{color:#8a5226}
main#main .rn-total{padding:.85rem 0 .4rem}
main#main .rn-total b{display:block;font-family:var(--sans);color:var(--navy);font-size:1.05rem}
main#main .rn-total strong{display:block;font-family:var(--serif);font-size:2.1rem;line-height:1.2;color:#8a5226;font-weight:500;font-variant-numeric:tabular-nums;margin:.15rem 0}
main#main .rn-total small{display:block;font-family:var(--sans);color:var(--navy);font-size:1rem}
main#main .rn-chips{display:flex;flex-wrap:wrap;gap:.5rem;margin:.6rem 0 0;padding:0;list-style:none}
main#main .rn-chips li{font-family:var(--sans);font-size:1rem;line-height:1.5;color:var(--navy);background:var(--ivory-2);border-radius:10px;padding:.45rem .7rem;margin:0}
main#main .rn-rent{max-width:760px;margin:1.2rem 0 1.6rem;padding:1.1rem 1.1rem .9rem;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.85);box-shadow:0 18px 40px -26px rgba(28,32,40,.35)}
main#main .rn-rent .cap{display:block;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1.05rem;margin:0 0 .6rem}
main#main .rn-key{display:flex;flex-wrap:wrap;gap:.35rem .9rem;margin:0 0 1rem;padding:0;list-style:none}
main#main .rn-key li{display:flex;align-items:center;gap:.4rem;font-family:var(--sans);font-size:.95rem;color:var(--navy);margin:0}
main#main .rn-key i{display:inline-block;width:.9rem;height:.9rem;border-radius:4px}
main#main .rn-home{margin:0 0 1.1rem}
main#main .rn-hl{margin:0 0 .35rem;font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.4}
main#main .rn-hl.rn-sub{color:var(--muted);margin:.4rem 0 0}
main#main .rn-bar{display:flex;height:2.1rem;border-radius:10px;overflow:hidden;background:var(--ivory-2)}
main#main .rn-bar span{display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-size:.9rem;font-weight:600;min-width:0;white-space:nowrap}
main#main .rn-rent figcaption,main#main .rn-tax figcaption{font-family:var(--sans);color:var(--muted);font-size:.9rem;line-height:1.55;margin-top:.5rem}
main#main .rn-tax{max-width:760px;margin:1.2rem 0 1.6rem;padding:1.1rem 1.1rem .9rem;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.85);box-shadow:0 18px 40px -26px rgba(28,32,40,.35)}
main#main .rn-tax .cap{display:block;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1.05rem;margin:0 0 .8rem}
main#main .rn-tg{margin:0 0 1.1rem}
main#main .rn-tg>p{font-family:var(--sans);color:var(--navy);font-weight:600;font-size:1rem;margin:0 0 .45rem;line-height:1.4}
main#main .rn-tr{display:grid;grid-template-columns:minmax(0,1fr);gap:.2rem;margin:0 0 .5rem}
main#main .rn-tr span.l{font-family:var(--sans);font-size:1rem;color:var(--muted)}
main#main .rn-tr span.l b{color:var(--navy);font-weight:600}
main#main .rn-tr svg.b{display:block;height:.85rem;border-radius:6px;color:#9aa4ad;width:calc(var(--f)*100%)}
main#main .rn-tr.you svg.b{color:#c4783a}
main#main .rn-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(15.5rem,1fr));gap:.8rem;max-width:960px;margin:1.2rem 0 1.4rem}
main#main .rn-card{padding:1rem 1.05rem .3rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.85);box-shadow:0 14px 34px -24px rgba(28,32,40,.35)}
main#main .rn-card h3{display:flex;align-items:center;gap:.55rem;font-family:var(--sans)!important;font-size:1.08rem!important;font-weight:650;color:var(--navy);margin:0 0 .5rem!important;line-height:1.3}
main#main .rn-card h3 .i{display:inline-flex;flex:none;width:2.1rem;height:2.1rem;border-radius:50%;align-items:center;justify-content:center;background:var(--ivory-2);color:#8a5226}
main#main .rn-card p{color:var(--muted);font-size:1rem;line-height:1.65;margin:0 0 .8rem}
main#main .rn-card p.f{font-family:var(--sans);color:var(--navy);font-size:1rem;background:var(--ivory-2);border-radius:10px;padding:.45rem .65rem}
@media (max-width:640px){main#main .rn-costs thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}main#main .rn-costs table,main#main .rn-costs tbody,main#main .rn-costs tr,main#main .rn-costs td{display:block;width:auto}main#main .rn-costs tr{padding:.55rem 0;border-bottom:1px solid var(--rule)}main#main .rn-costs td{border:0!important;padding:.1rem .2rem!important}main#main .rn-costs td:first-child{color:var(--navy)}}
@media (max-width:520px){main#main .rnc{padding:1.05rem .85rem 1.15rem;border-radius:18px}main#main .rnc-big strong{font-size:2.1rem}main#main .rn-sheet,main#main .rn-rent,main#main .rn-tax{padding-left:.9rem;padding-right:.9rem}}
@media (min-width:860px){main#main .rnc-fields{grid-template-columns:1fr 1fr}}
@media (prefers-reduced-transparency:reduce){main#main .rn-sheet,main#main .rn-rent,main#main .rn-tax,main#main .rn-card{background:#fbf8f3}}
main#main .rnc-t b{display:flex;align-items:center;gap:.35rem}
main#main .rnc-t em{display:block;font-style:normal;font-size:.95rem;color:rgba(244,239,232,.8)}
main#main .rnc-t em.ok{color:#9fd3a6}
main#main .rnc-t em.no{color:#f0b38a}
main#main .rnc-q{position:relative;display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;min-width:1.5rem;border-radius:50%;border:1px solid rgba(244,239,232,.4);background:rgba(244,239,232,.12);color:#f4efe8;font:inherit;font-family:var(--sans);font-size:.8rem;font-weight:700;letter-spacing:0;cursor:help;padding:0;flex:none}
main#main .rnc-q::before{content:"";position:absolute;inset:-.6rem}
main#main .rnc-q:hover,main#main .rnc-q:focus-visible,main#main .rnc-t.on .rnc-q{background:#e6a46c;color:#1c2028;outline:none}
main#main .rnc-t span.rnc-tip{display:none;margin:.5rem 0 .1rem;padding:.55rem .65rem;border-radius:9px;background:#f4efe8;color:#1c2028;font-size:.92rem;line-height:1.45}
main#main .rnc-t.on span.rnc-tip,main#main .rnc-t:has(.rnc-q:hover) span.rnc-tip,main#main .rnc-t:has(.rnc-q:focus-visible) span.rnc-tip{display:block}
main#main .rnc-tests{grid-template-columns:repeat(auto-fit,minmax(9.5rem,1fr))}
main#main .rn-embed{max-width:1000px;margin:1.2rem 0 1rem}
main#main .rn-hard{max-width:760px;margin:1.6rem 0 .6rem;padding:1.3rem 1.3rem 1.4rem;border-radius:20px;background:linear-gradient(160deg,#2a3040,#1c2028);color:#f4efe8;box-shadow:0 22px 50px -28px rgba(28,32,40,.7)}
main#main .rn-hard-h{font-family:var(--serif);font-size:1.45rem;line-height:1.2;margin:0 0 .5rem;color:#f4efe8}
main#main .rn-hard p{color:rgba(244,239,232,.86);line-height:1.6;margin:0 0 1rem}
main#main .rn-hard-b{display:flex;flex-wrap:wrap;gap:.8rem 1.2rem;align-items:center}
main#main .rn-hard-tel{color:#e6a46c;font-family:var(--sans);font-weight:600;font-size:1.05rem}
main#main .hx-fb-ai{max-width:100%;box-sizing:border-box;flex-wrap:wrap;min-width:0}
main#main .hx-fb-ai>.hx-ai-badge{flex-wrap:wrap;white-space:normal;max-width:100%;min-width:0}
main#main .hx-fb-ai>.hx-fb-q{flex:1 1 100%;max-width:100%;min-width:0;flex-wrap:wrap;box-sizing:border-box}
main#main .hx-fb-q textarea{min-width:7.5rem}
main#main .hx-fb-go{max-width:100%}
main#main>section[style^="background:var(--navy)"]>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;display:block!important;text-align:center!important}
@media (max-width:360px){main#main .rn-line b{font-size:.98rem}main#main .rn-line em{font-size:1rem}}
</style>`;

/* Design pass, 2026-11-08 (Blog-Brain redo3/invest-run-the-numbers/DESIGN.md): a two-line headline and the hero facts
   as one plain line, one card style (the analyzer, the sheet, the charts and the two big offers), plain lists and a
   plain table under thin rules, the three small offers as lines under a brass rule, the photo beside the 1% chart on
   a wide screen without a frame, and one block width of 720 px. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const CSS2 = "<style>"
  /* 1. The headline: the italic line at about half the H1's size, on its own line; the facts as one plain line. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:#8a5226!important}}`
  + `${S} .detail-media{max-width:720px!important}${S} .c3-glance{max-width:720px;gap:0 1.4rem!important;border-top:${RULE};border-bottom:${RULE}}`
  + `${S} .c3-glance li{${FLAT};padding:.7rem 0!important;line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;border-bottom:0}${S} .c3-glance li{border-bottom:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance .i{width:2rem!important;height:2rem!important}}`
  /* 2. One block width of 720 px, and one card style for the tool, the sheet and the charts. */
  + `${S} .rn-embed,${S} .rn-sheet,${S} .rn-rent,${S} .rn-tax,${S} .c3-gchart,${S} .rn-hard,${S} #rnWrap,${S} #rnOk{max-width:720px!important;box-sizing:border-box}`
  + `${S} .rn-sheet,${S} .rn-rent,${S} .rn-tax,${S} .c3-gchart{${CARD};border-radius:20px!important}`
  + `${S} .rn-sheet,${S} .rn-rent,${S} .rn-tax{padding:1.1rem 1.3rem 1rem!important}@media (max-width:520px){${S} .rn-sheet,${S} .rn-rent,${S} .rn-tax{padding:1rem .95rem .9rem!important}}`
  + `${S} .rn-rent figcaption,${S} .rn-tax figcaption{${FLAT};padding:0!important;margin-top:.8rem!important}`
  + `${S} .rn-chips li{background:none;border-left:2px solid #c4783a;border-radius:0;padding:.1rem 0 .1rem .7rem}`
  /* 3. The costs table: a plain table under thin rules, not a card. */
  + `${S} .rn-costs>div{${FLAT};padding:0!important;max-width:720px!important}`
  + `${S} .rn-costs table{width:100%;border-collapse:collapse}${S} .rn-costs th,${S} .rn-costs td{border-bottom:${RULE}!important}${S} .rn-costs td:first-child,${S} .rn-costs th:first-child{padding-left:0!important}`
  /* the three things a calculator cannot see: three plain columns under a rule */
  + `${S} .rn-plain{max-width:720px;gap:0 1.6rem;margin:1.1rem 0 1.4rem}${S} .rn-plain .rn-card{${FLAT};padding:.9rem 0 .2rem!important;border-top:${RULE}!important}`
  + `@media (min-width:760px){${S} .rn-plain{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .rn-plain .rn-card h3{align-items:flex-start;font-size:1.06rem!important}${S} .rn-plain .rn-card h3 .i{display:none}${S} .rn-plain .rn-card p{margin:0 0 .7rem}`
  /* 4. The three small offers: a line under a brass rule, not a card; the two big offers keep theirs. */
  + `${S} div[style^="border-left:3px solid var(--brass)"]{${FLAT};border-top:2px solid #c4783a!important;padding:1rem 0 .2rem!important;margin:1.8rem 0 .6rem!important;max-width:720px}`
  + `${S} div[style^="border-left:3px solid var(--brass)"]>p:first-child{font-family:var(--sans);font-size:1.08rem}`
  /* 5. The photo: no frame; on a wide screen it sits beside the 1% chart and stays in view. */
  + `${S} .rn-onerow .c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} .rn-onerow .c3ph-hero figcaption{padding:0!important;margin-top:.55rem}`
  + `@media (min-width:1180px){${S} .rn-onerow{display:grid;grid-template-columns:720px minmax(0,1fr);column-gap:2.6rem;align-items:start;margin:1.2rem 0 1.4rem}`
  + `${S} .rn-onerow>.c3-gchart{grid-column:1;grid-row:1;margin:0!important}${S} .rn-onerow>.c3ph-hero{grid-column:2;grid-row:1;margin:0!important;position:sticky;top:9.5rem}}`
  /* the header phone at 1000 to 1100 px, copied from the approved pages (hoa-documents) */
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + `${S} h2,${S} h3,${S} .rn-rent .cap,${S} .rn-tax .cap,${S} .c3-gchart .cap{text-wrap:balance}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Section 1: the calculator.                                                     */
/* Hand-worked cases (PLAYBOOK A29b), from rows 17 to 19, before insurance and any loan:
     Carolina Forest house: 390,000 x .06 x 201.0 / 1000 = 4,703 tax; 26,760 - 4,703 - 1,200 - 2,676 - 2,676 = 15,505; 4.0%; costs 42%; 1% price 223,000.
     Longs house: 320,000 x .06 x 201.0 / 1000 = 3,859; 27,240 - 3,859 - 1,200 - 2,724 - 2,724 = 16,733; 5.2%; 39%; 227,000.
     Myrtle Beach condo: 240,000 x .06 x 254.6 / 1000 = 3,666; 17,040 - 3,666 - 6,600 - 1,704 - 1,704 = 3,366; 1.4%; 80%; 142,000.
   Driven in the browser by the checking script in the batch scratch folder (verify-calc.mjs). */

const ZIPS = [["29579", "Carolina Forest"], ["29568", "Longs"], ["29577", "Myrtle Beach"], ["29572", "Myrtle Beach, north end"],
  ["29582", "North Myrtle Beach"], ["29588", "Socastee"], ["29566", "Little River"], ["29576", "Murrells Inlet and Garden City"],
  ["29575", "Surfside Beach"], ["29526", "Conway"], ["29527", "Conway"], ["29569", "Loris"], ["29511", "Aynor"]];
const RENTS = Object.fromEntries(ZIPS.map(([z]) => {
  if (!HUD[z]) throw new Error(`no HUD rent for ${z}`);
  return [z, { 2: HUD[z]["2"], 3: HUD[z]["3"], 4: HUD[z]["4"] }];
}));
/* Row 3, as corrected: Aynor is left out until its fire millage is confirmed. */
const TAX_AREAS = [["201.0", "Outside city limits"], ["207.3", "Murrells Inlet or Garden City, outside city limits"], ["214.2", "Inside Surfside Beach"],
  ["221.2", "Inside North Myrtle Beach"], ["254.6", "Inside the City of Myrtle Beach"], ["272.5", "Inside Conway"], ["282.2", "Inside Loris"]];
if (TAX_AREAS[0][0] !== MILLS.unincorporated.toFixed(1) || TAX_AREAS[4][0] !== MILLS.myrtle_beach_city.toFixed(1)) throw new Error("millage list and findings.json disagree");
/* The town rate the calculator picks for each ZIP code, by the town in its label; everything else starts
   outside city limits. A ZIP code crosses city limits, so the hint under the box says to check. */
const ZIP_TOWN = { "29577": "254.6", "29572": "254.6", "29582": "221.2", "29575": "214.2", "29576": "207.3", "29526": "272.5", "29527": "272.5", "29569": "282.2" };
for (const v of Object.values(ZIP_TOWN)) if (!TAX_AREAS.some(([m]) => m === v)) throw new Error(`ZIP_TOWN: no tax area ${v}`);
const dues = (s) => Math.round(s.dues_year / 12);
const EXAMPLES = [
  { label: "Carolina Forest house", zip: "29579", beds: 3, s: SH, mills: "201.0" },
  { label: "Longs house", zip: "29568", beds: 3, s: SL, mills: "201.0" },
  { label: "Myrtle Beach condo", zip: "29577", beds: 2, s: SC, mills: "254.6" },
];
for (const e of EXAMPLES) if (RENTS[e.zip][e.beds] !== e.s.rent_month) throw new Error(`${e.label}: HUD rent and the sheet disagree`);
for (const e of EXAMPLES) if ((ZIP_TOWN[e.zip] || "201.0") !== e.mills) throw new Error(`${e.label}: the ZIP's town rate and the sheet disagree`);
const EXJS = EXAMPLES.map((e) => ({ zip: e.zip, beds: String(e.beds), price: e.s.price, rent: e.s.rent_month, mills: e.mills, dues: dues(e.s), ins: insOf(e.s) }));
const D0 = EXJS[0];

const box = (id, label, o = {}) => `<label class="rnc-f${o.wide ? " w" : ""}" for="${id}">${label}<span class="rnc-box">${o.pre ? `<span aria-hidden="true">${o.pre}</span>` : ""}<input id="${id}" type="number" inputmode="decimal" min="0" step="${o.step || 1}"${o.value !== undefined ? ` value="${o.value}"` : ""} oninput="rncCalc()">${o.post ? `<span aria-hidden="true">${o.post}</span>` : ""}</span></label>`;
const sel = (id, label, opts, val, fn, wide) => `<label class="rnc-f${wide ? " w" : ""}" for="${id}">${label}<select id="${id}" onchange="${fn}()">${opts.map(([v, t]) => `<option value="${v}"${v === val ? " selected" : ""}>${t}</option>`).join("")}</select></label>`;
const line = (dt, id) => `<div><dt>${dt}</dt><dd id="${id}"></dd></div>`;
/* Each result: a name with a "?" (hover, tap or tab shows the meaning), the number, and a short verdict. */
const test = (title, id, tip) => `<div class="rnc-t"><b>${title}<button type="button" class="rnc-q" aria-label="What ${title.toLowerCase()} means" aria-expanded="false" aria-controls="${id}Q" onclick="rncTip(this)">?</button></b><span class="rnc-tip" id="${id}Q" role="note">${tip}</span><strong id="${id}">--</strong><em id="${id}T"></em></div>`;
const TIPS = {
  cap: `What is left in a year after every cost, before insurance and any loan, divided by the price. Our target is ${CAP_TARGET} percent or more.`,
  one: "The highest price at which a month's rent is 1 percent of the price.",
  half: "The share of the rent that goes to costs before any loan. By investors' 50 percent rule, costs take about half.",
  cov: `The rent divided by the monthly loan payment, tax, insurance and dues. Our target is ${COV_TARGET}. A DSCR loan is judged on this ratio. A loan officer at our preferred lender starts writing DSCR loans at 0.75.`,
  coc: "What is left after the loan payments in a year, divided by the cash you put in. If you pay cash, it is the same as the cap rate.",
};

/* The analyzer frame (owner, 2026-11-03). Same origin, so it can tell this page its height. */
const ANALYZER = `<div class="rn-embed"><iframe src="/invest/long-term-rental/?embed=1" title="Chapter3 rental analyzer" loading="eager" style="display:block;width:100%;height:1100px;border:0;border-radius:20px;background:transparent"></iframe></div>`
  + `<script>addEventListener("message",function(e){if(e.origin!==location.origin||!e.data||e.data.c3embed!=="ltr")return;var f=document.querySelector(".rn-embed iframe");if(f)f.style.height=Math.max(640,Math.min(9000,+e.data.h||0))+"px"})</script>`;
/* The page's own calculator, kept for reference; the page now frames the analyzer instead. */
const CALC = `<div class="rnc" id="rnc">`
  + `<div class="rnc-ex" role="group" aria-label="Load one of the three example homes"><span>Load an example:</span>${EXAMPLES.map((e, i) => `<button type="button" onclick="rncEx(${i})" aria-pressed="${i === 0}">${e.label}</button>`).join("")}</div>`
  + `<div class="rnc-grid"><div>`
  + `<fieldset><legend>The home</legend><div class="rnc-fields">`
  + sel("rncZip", "Area and ZIP code", ZIPS.map(([z, nm]) => [z, `${nm} (${z})`]), D0.zip, "rncZip", true)
  + sel("rncBeds", "Bedrooms", [["2", "2"], ["3", "3"], ["4", "4 or more"]], D0.beds, "rncZip")
  + box("rncRent", "Rent a month", { pre: "$", step: 10, value: D0.rent })
  + box("rncPrice", "Asking price", { pre: "$", step: 1000, value: D0.price, wide: true })
  + `</div><p class="rnc-hint" id="rncRentNote"></p></fieldset>`
  + `<fieldset><legend>The costs</legend><div class="rnc-fields">`
  + sel("rncTax", "Where it is taxed", TAX_AREAS, D0.mills, "rncCalc", true)
  + box("rncDues", "HOA dues a month", { pre: "$", step: 5, value: D0.dues })
  + box("rncIns", "Insurance a year", { pre: "$", step: 50, value: D0.ins })
  + box("rncMgmt", "Management, share of rent", { post: "%", step: 1, value: 10 })
  + box("rncRep", "Repairs and empty months", { post: "%", step: 1, value: 10 })
  + `</div><p class="rnc-hint">The town rate is set from the ZIP code. A ZIP code can cross city limits, so pick the home's own town. Type your insurance quote.</p></fieldset>`
  + `<fieldset><legend>Your loan, if you use one</legend><div class="rnc-fields">`
  + box("rncPay", "Loan payment a month, from your lender", { pre: "$", step: 10 })
  + box("rncCash", "Cash you put in, all in", { pre: "$", step: 1000 })
  + `</div><p class="rnc-hint">Leave these empty if you pay cash.</p></fieldset></div>`
  + `<div class="rnc-out" aria-live="polite"><p class="rnc-big"><span>Left a year, before insurance and any loan</span><strong id="rncLeft">--</strong></p>`
  + `<dl class="rnc-lines">${line("Rent a year", "rncRentY")}${line("Property tax", "rncTaxY")}${line("HOA dues", "rncDuesY")}${line("Insurance", "rncInsY")}${line("Management", "rncMgmtY")}${line("Repairs and empty months", "rncRepY")}</dl>`
  + `<div class="rnc-tests">${test("Cap rate", "rncCapR", TIPS.cap)}${test("1% rule price", "rncOne", TIPS.one)}${test("Costs, of the rent", "rncHalf", TIPS.half)}${test("Coverage", "rncCov", TIPS.cov)}${test("Cash-on-cash", "rncCoc", TIPS.coc)}</div>`
  + `</div></div></div>`
  + `<script>var RNC_HUD=${JSON.stringify(RENTS)};var RNC_EX=${JSON.stringify(EXJS)};var RNC_TOWN=${JSON.stringify(ZIP_TOWN)};`
  + `function rncV(id){var e=document.getElementById(id);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0}`
  + `function rncM(x){return (x<0?"-$":"$")+Math.round(Math.abs(x)).toLocaleString("en-US")}`
  + `function rncS(id,t,c){var e=document.getElementById(id);if(e){e.textContent=t;if(c!==undefined)e.className=c}}`
  + `function rncTip(b){var c=b.parentNode.parentNode,on=!c.classList.contains("on");c.classList.toggle("on",on);b.setAttribute("aria-expanded",on?"true":"false")}`
  + `function rncNote(){var z=document.getElementById("rncZip").value,b=document.getElementById("rncBeds").value,r=RNC_HUD[z]&&RNC_HUD[z][b];rncS("rncRentNote",r?"HUD's fair market rent for "+b+" bedrooms in "+z+" is "+rncM(r)+" a month, with utilities. Type your own rent if you know it.":"")}`
  + `function rncZip(){var z=document.getElementById("rncZip").value,b=document.getElementById("rncBeds").value,r=RNC_HUD[z]&&RNC_HUD[z][b];if(r)document.getElementById("rncRent").value=r;document.getElementById("rncTax").value=RNC_TOWN[z]||"201.0";rncPress(-1);rncNote();rncCalc()}`
  + `function rncPress(i){var bs=document.querySelectorAll(".rnc-ex button");for(var k=0;k<bs.length;k++)bs[k].setAttribute("aria-pressed",k===i?"true":"false")}`
  + `function rncEx(i){var x=RNC_EX[i];if(!x)return;document.getElementById("rncZip").value=x.zip;document.getElementById("rncBeds").value=x.beds;document.getElementById("rncPrice").value=x.price;document.getElementById("rncRent").value=x.rent;document.getElementById("rncTax").value=x.mills;document.getElementById("rncDues").value=x.dues;document.getElementById("rncIns").value=x.ins;document.getElementById("rncMgmt").value=10;document.getElementById("rncRep").value=10;rncPress(i);rncNote();rncCalc()}`
  + `function rncCalc(){var price=rncV("rncPrice"),rent=rncV("rncRent")*12,mills=parseFloat(document.getElementById("rncTax").value)||0,dues=rncV("rncDues")*12,ins=rncV("rncIns"),mg=rncV("rncMgmt")/100,rp=rncV("rncRep")/100,pay=rncV("rncPay"),cash=rncV("rncCash");`
  + `var tax=price*0.06*mills/1000,m=rent*mg,r=rent*rp,costs=tax+dues+ins+m+r,left=rent-costs,ok=price&&rent;`
  + `rncS("rncRentY",rncM(rent));rncS("rncTaxY",rncM(tax));rncS("rncDuesY",rncM(dues));rncS("rncInsY",ins?rncM(ins):"$0: add a quote");rncS("rncMgmtY",rncM(m));rncS("rncRepY",rncM(r));rncS("rncLeft",rent?rncM(left):"--");`
  + `if(!ok){["rncCapR","rncOne","rncHalf","rncCov","rncCoc"].forEach(function(k){rncS(k,"--");rncS(k+"T","Enter a price and a rent.","")});return}`
  + `var cap=left/price*100;rncS("rncCapR",cap.toFixed(1)+"%");rncS("rncCapRT",!ins?"Insurance is still $0":cap>=${CAP_TARGET}?"At or above our ${CAP_TARGET}% target":"Under our ${CAP_TARGET}% target",!ins?"":cap>=${CAP_TARGET}?"ok":"no");`
  + `var need=rent/12*100;rncS("rncOne",rncM(need));rncS("rncOneT",price<=need?"This price passes":"This price is "+rncM(price-need)+" over",price<=need?"ok":"no");`
  + `var sh=Math.round(costs/rent*100);rncS("rncHalf",sh+"%");rncS("rncHalfT",sh<=45?"Under half":sh<=55?"About half":"Well over half",sh<=55?"ok":"no");`
  + `if(pay){var cov=(rent/12)/(pay+tax/12+ins/12+dues/12);rncS("rncCov",cov.toFixed(2));rncS("rncCovT",(cov>=${COV_TARGET}?"At or above":"Under")+" our ${COV_TARGET} target",cov>=${COV_TARGET}?"ok":"no")}else{rncS("rncCov","No loan");rncS("rncCovT","Type a loan payment","")}`
  + `if(pay){if(cash){var cf=left-pay*12;rncS("rncCoc",(cf/cash*100).toFixed(1)+"%");rncS("rncCocT",rncM(cf)+" a year after the loan",cf>=0?"ok":"no")}else{rncS("rncCoc","--");rncS("rncCocT","Type the cash you put in","")}}else{rncS("rncCoc",cap.toFixed(1)+"%");rncS("rncCocT","If you pay cash","")}}`
  + `document.addEventListener("DOMContentLoaded",function(){rncNote();rncCalc()});</script>`;

/* ---------------------------------------------------------------------------- */
/* Section 2: the sheet (row 17) and where the rent goes on all three (rows 17 to 21). */

const sheetLine = (name, amount, src, minus) => `<div class="rn-line${minus ? " minus" : ""}"><b>${name}</b><em>${amount}</em><small>${src}</small></div>`;
const SHEET = `<div class="rn-sheet" role="group" aria-label="The numbers sheet for the middle 3-bedroom house for sale in Carolina Forest">`
  + `<div class="rn-sheet-h"><p>Numbers sheet: 3-bedroom house, Carolina Forest</p><span>Asking ${money(SH.price)}</span></div>`
  + sheetLine("Rent", `${money(SH.rent_year)}`, `${money(SH.rent_month)} a month: HUD's fair market rent for 3 bedrooms in ZIP code 29579.`)
  + sheetLine("Property tax", `−${r100(SH.tax_year)}`, `About ${money(PER100K(MILLS.unincorporated))} for each $100,000 of the price, the rate a rental pays outside city limits, once the county resets the value after the sale.`, true)
  + sheetLine("HOA dues", `−${money(SH.dues_year)}`, `${money(dues(SH))} a month: the middle HOA fee of 3-bedroom houses for sale in 29579.`, true)
  + sheetLine("Insurance", "your quote", "Priced house by house: add your quote. Flood is a separate policy.", true)
  + sheetLine("Management", `−${money(SH.management_year)}`, "Our allowance: 10 percent of the rent.", true)
  + sheetLine("Repairs and empty months", `−${money(SH.repairs_and_empty_months_year)}`, "Our allowance: 10 percent of the rent.", true)
  + `<div class="rn-total"><b>Left a year, before insurance and any loan</b><strong>about ${r100(leftAfter(SH))}</strong><small>${capOf(SH).toFixed(1)} percent of the price: the cap rate. Our target is ${CAP_TARGET} percent.</small></div>`
  + `<ul class="rn-chips"><li>The 1 percent rule would need a price of ${money(SH.one_pct_rule_price)}</li><li>Rent before any cost: ${SH.gross_yield_pct.toFixed(1)} percent of the price a year</li></ul>`
  + `</div>`;

/* Where each year's rent goes, for the three homes. Colors: navy, slate, two greys, brass (what is left). */
const SEG = [["tax_year", "Property tax", "#1c2028", "#fff"], ["dues_year", "HOA dues", "#5c6b78", "#fff"], ["ins", "Insurance", "#7d8a96", "#fff"], ["management_year", "Management", "#9aa4ad", "#1c2028"],
  ["repairs_and_empty_months_year", "Repairs and empty months", "#c9ced3", "#1c2028"], ["left", "Left before a loan", "#c4783a", "#1c2028"]];
const segVal = (s, k) => (k === "ins" ? insOf(s) : k === "left" ? leftAfter(s) : s[k]);
const HOMES3 = [
  { name: "3-bedroom house, Carolina Forest", s: SH },
  { name: "3-bedroom house, Longs", s: SL },
  { name: "2-bedroom condo, inside the City of Myrtle Beach", s: SC },
];
/* Design pass 2026-11-08: a segment that is zero on every home (insurance, left to the reader's quote) is not drawn
   and not in the key, and the title says the finding. */
const SEG_SHOWN = SEG.filter(([k]) => HOMES3.some((x) => segVal(x.s, k) > 0));
const keepPct = (s) => pct(leftAfter(s), s.rent_year);
const rentBars = () => {
  const SEG = SEG_SHOWN;
  const label = HOMES3.map((x) => `${x.name}: ${SEG.map(([k, t]) => `${t} ${pct(segVal(x.s, k), x.s.rent_year)} percent`).join(", ")}`).join(". ");
  return `<figure class="rn-rent"><span class="cap">What is left of a year's rent: ${keepPct(SH)} and ${keepPct(SL)} percent on the houses, ${keepPct(SC)} percent on the condo</span>`
    + `<ul class="rn-key" aria-hidden="true">${SEG.map(([, t, c]) => `<li><i style="background:${c}"></i>${t}</li>`).join("")}</ul>`
    + `<div role="img" aria-label="${label}.">`
    + HOMES3.map((x) => `<div class="rn-home"><div class="rn-hl"><strong>${x.name}</strong>, asking ${money(x.s.price)}, rent ${money(x.s.rent_month)} a month</div>`
      + `<div class="rn-bar">${SEG.map(([k, t, c, ink]) => { const p = segVal(x.s, k) / x.s.rent_year * 100; return `<span style="width:${p.toFixed(2)}%;background:${c};color:${ink}">${p >= 13 ? Math.round(p) + "%" : ""}</span>`; }).join("")}</div>`
      + `<div class="rn-hl rn-sub">Cap rate: ${capOf(x.s).toFixed(1)} percent of the price a year, before insurance and any loan</div></div>`).join("")
    + `</div><figcaption>The middle asking price and dues for each kind of home in its ZIP code, HUD's rent, the tax a rental pays there, and our 10 percent allowances. Not a value for any one home.</figcaption></figure>`;
};

const PHOTO_REC = PH.findPhoto(PHOTOS, "carolina-forest-houses-from-above");
/* Round 1: the aerial moved from the sheet to the 1% rule section, captioned with what it shows about the
   numbers (the owner: a photo that shows nothing about the numbers). critic.mjs blocks a blog with no real
   photo, so it stays until the photo partner's shots arrive (shot-list.md). */
const PHOTO_CAP = () => `Houses in The Parks of Carolina Forest, ZIP code 29579, from above. ${BYZIP.find((z) => z.zip === "29579").pass_1pct} of the ${H1.pass12} houses for sale that pass the 1 percent rule are in this ZIP code.`;
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const PHOTO = () => lazy(PH.heroPhoto(PHOTO_REC, { alt: PHOTO_REC.alt, caption: PHOTO_CAP(), maxWidth: "620px", sizes: "(max-width: 660px) 100vw, 620px" }));
const CREDITS = PH.creditsList([{ photo: PHOTO_REC, caption: "Houses in Carolina Forest from above" }]);

/* ---------------------------------------------------------------------------- */
/* Section 3: the 1 percent rule by area (row 12). Areas with 50 houses for sale or more. */

/* findings.json by_zip, all 15 ZIP codes (the chart file leaves out Nichols). */
const BYZIP = F.houses_1pct.by_zip.map((z) => ({ name: z.name, zip: z.zip, houses: z.houses_3plus, pass_1pct: z.pass_1pct, pass_8pct: z.pass_8pct_gross }));
/* Areas with 50 houses for sale or more, and any smaller area that has a house passing the 1% rule (Aynor). */
const SHOWN = BYZIP.filter((z) => z.houses >= 50 || z.pass_1pct > 0);
const LEFT_OUT = BYZIP.filter((z) => !SHOWN.includes(z));
if (SHOWN.reduce((t, z) => t + z.pass_1pct, 0) !== H1.pass12) throw new Error("the 1% chart leaves out a passing house");
const zipName = (z) => /^Conway/.test(z.name) ? `Conway (${z.zip})` : z.name.replace(" (north end)", ", north end");
if (BYZIP.reduce((t, z) => t + z.houses, 0) !== H1.n || BYZIP.reduce((t, z) => t + z.pass_1pct, 0) !== H1.pass12 || BYZIP.reduce((t, z) => t + z.pass_8pct, 0) !== H1.pass8) throw new Error("chart file and findings.json disagree");
const LONGS = BYZIP.find((z) => z.zip === "29568");
/* The chart's title names the area at the top of the sorted bars (design pass 2026-11-08). */
const ONE_TOP = [...SHOWN].sort((a, b) => b.pass_8pct / b.houses - a.pass_8pct / a.houses)[0].name;
if (ONE_TOP !== "Longs") throw new Error("the 1% chart's top area changed: reword its title");
const ONE_CHART = G.bars(SHOWN.map((z) => ({ name: zipName(z), value: z.pass_8pct / z.houses * 100, valueText: `${z.pass_8pct} of ${z.houses}`,
  ...(z.pass_1pct ? { feature: `${z.pass_1pct} pass the 1% rule` } : {}) })).sort((a, b) => b.value - a.value),
  { caption: `${ONE_TOP} comes closest: houses for sale whose yearly rent is at least 8 percent of the price`, nameLabel: "Area", featureLabel: "houses that pass the 1% rule", valueLabel: "houses at 8 percent or more", max: 100, compact: true,
    note: `Houses with 3 or more bedrooms for sale, each against HUD's fair market rent for its ZIP code and bedrooms. The 1 percent rule asks for 12 percent a year. The bar uses a lower test, 8 percent, to show where the rent comes closest. Not shown: ${LEFT_OUT.map((z) => `${z.name}, ${z.houses} houses, none passing`).join("; ")}.` });

/* Section 4: the tax after a sale (rows 6 to 9). */
const M4 = MULT.seller_on_4pct, M6 = MULT.seller_on_6pct_no_ati_exemption, M6X = MULT.seller_on_6pct_with_ati_exemption;
const per1000 = (m) => r100(m * 1000);
/* Each bar is a small labelled SVG (role="img"); the visible label above it is the same words. */
const plainLabel = (t) => t.replace(/<[^>]+>/g, "");
const taxRow = (cls, label, f) => `<div class="rn-tr${cls}"><span class="l" aria-hidden="true">${label}</span><svg class="b" role="img" aria-label="${plainLabel(label)}" viewBox="0 0 100 10" preserveAspectRatio="none" style="--f:${f.toFixed(3)}"><rect width="100" height="10" fill="currentColor"/></svg></div>`;
const TMAX = 4;
const TAX_FIG = `<figure class="rn-tax"><span class="cap">Your next tax bill outside city limits: about ${M4.median.toFixed(1)} times the seller's on an owner's home, ${M6.median.toFixed(1)} times on a rental</span>`
  + `<div>`
  + `<div class="rn-tg"><p>Buying a home taxed at 4 percent, as an owner's home</p>${taxRow("", "The seller's bill: <b>$1,000</b>", 1 / TMAX)}${taxRow(" you", `Your next bill: <b>about ${per1000(M4.median)}</b>`, M4.median / TMAX)}</div>`
  + `<div class="rn-tg"><p>Buying a home already taxed at 6 percent, such as a rental</p>${taxRow("", "The seller's bill: <b>$1,000</b>", 1 / TMAX)}${taxRow(" you", `Your next bill: <b>about ${per1000(M6.median)}</b>`, M6.median / TMAX)}</div>`
  + `</div><figcaption>The middle resale outside city limits, January to September 2026, by the rate on the seller's tax record. Your bill is figured on the sale price, before any exemption. A seller's Homestead exemption would make the jump larger.</figcaption></figure>`;

/* Section 5: condo dues against the rent, by area (rows 15, 16). */
const CONDOS = F.gross_yield_by_zip.filter((r) => /^condo/.test(r.type));
const DUES_MIN = Math.min(...CONDOS.map((r) => r.dues_share_of_rent_pct)), DUES_MAX = Math.max(...CONDOS.map((r) => r.dues_share_of_rent_pct));
const DUES_CHART = G.bars(CONDOS.map((r) => ({ name: r.name.replace(" (north end)", ", north end"), value: r.dues_share_of_rent_pct, valueText: `${r.dues_share_of_rent_pct}% of the rent`,
  feature: `${money(r.median_dues)} of ${money(r.rent)}` })).sort((a, b) => a.value - b.value),
  { caption: `HOA dues take ${DUES_MIN} to ${DUES_MAX} percent of HUD's rent on the middle 2-bedroom condo`, nameLabel: "Area", featureLabel: "dues of the rent, a month", valueLabel: "dues, share of the rent", max: 100, compact: true,
    note: "The middle monthly dues of 2-bedroom condos for sale in each ZIP code, against HUD's fair market rent for 2 bedrooms there." });
const CF_CONDO = CONDOS.find((r) => r.zip === "29579"), NE_CONDO = CONDOS.find((r) => r.zip === "29572");

/* Cards */
const card = (ic, title, body, foot) => `<div class="rn-card"><h3><span class="i" aria-hidden="true">${icon(ic, { size: 18 })}</span>${title}</h3>${body.map((t) => `<p>${t}</p>`).join("")}${foot ? `<p class="f">${foot}</p>` : ""}</div>`;

/* ---------------------------------------------------------------------------- */
/* The form, kept from the live page: the TCPA string and c3SendForm exactly.    */

const TCPA = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";

const FORM = `<div id="rnWrap" style="max-width:680px;background:var(--ivory);border:1px solid var(--rule);border-radius:14px;padding:1.6rem;text-align:left;margin:1.4rem 0">
<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="rnAddr" placeholder="Property address or MLS number" aria-label="Property address or MLS number"></div>
<div class="idx-lead" style="grid-template-columns:1fr"><select class="idx-input" id="rnPlan" aria-label="Your plan for the property"><option value="">Your plan for the property</option><option>Long-term rental</option><option>Short-term rental</option><option>Mid-term rental</option><option>Fix and flip</option><option>Not sure yet</option></select></div>
<div class="idx-lead" style="grid-template-columns:1fr"><textarea class="idx-input" id="rnNotes" rows="3" aria-label="Anything you already know" placeholder="Anything you already know: rent history, dues, cash or loan, whether you will stay in it yourself"></textarea></div>
<div class="idx-lead"><input class="idx-input" id="rnName" placeholder="Your name" aria-label="Your name"><input class="idx-input" id="rnPhone" placeholder="Phone" type="tel" aria-label="Phone"></div>
<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="rnEmail" placeholder="Email" type="email" aria-label="Email"></div>
<label class="form-consent" style="display:flex;gap:.5rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:var(--muted);line-height:1.45;margin:0 0 .85rem;cursor:pointer"><input type="checkbox" id="rnConsent" style="margin-top:.15rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>${TCPA}</span></label>
<p id="rnErr" style="display:none;color:#a03333;font-family:var(--sans);font-size:.8rem;margin:0 0 .7rem"></p>
<button class="btn btn-brass" style="width:100%" onclick="rnSubmit()">Have us run the numbers</button>
<p style="font-family:var(--sans);font-size:.75rem;color:var(--muted);margin:.7rem 0 0;line-height:1.5">Free, no obligation. A licensed team member replies the same day, evenings included.</p>
<p style="font-family:var(--sans);font-size:.75rem;color:var(--muted);margin:.5rem 0 0;line-height:1.5;display:flex;flex-wrap:wrap;align-items:center;gap:.4rem .6rem"><span style="white-space:nowrap">Prefer to talk now?</span> <a href="tel:+18543332135" class="btn btn-outline" style="padding:.35rem .8rem;font-size:.8rem">Call 854.333.2135</a></p>
</div>
<div id="rnOk" style="display:none;max-width:680px;background:var(--ivory);border:1px solid var(--brass);border-radius:14px;padding:1.4rem;color:var(--navy);line-height:1.6;margin:1.4rem 0">Thanks. A licensed team member will send the numbers for that address the same day, evenings included.</div>
<script>
function rnSubmit(){
 var a=document.getElementById('rnAddr').value.trim(),pl=document.getElementById('rnPlan').value,nt=document.getElementById('rnNotes').value.trim(),n=document.getElementById('rnName').value.trim(),ph=document.getElementById('rnPhone').value.trim(),em=document.getElementById('rnEmail').value.trim(),c=document.getElementById('rnConsent').checked,err=document.getElementById('rnErr');
 function fail(m){err.textContent=m;err.style.display='block';}
 err.style.display='none';
 if(!a||!n){fail('Add the property address and your name.');return;}
 if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}
 if(!c){fail('Check the consent box to send the request.');return;}
 var interest=(pl==='Short-term rental')?'STR / Vacation rental':'Investment property';
 var msg='Plan: '+(pl||'not stated')+(nt?'. '+nt:'');
 c3SendForm({property_address:a,name:n,phone:ph,email:em,interest:interest,message:msg,consent:'yes'},'run-the-numbers');
 document.getElementById('rnWrap').style.display='none';
 document.getElementById('rnOk').style.display='block';
}
</script>`;

/* ---------------------------------------------------------------------------- */

const TAX_OUT = money(PER100K(MILLS.unincorporated)), TAX_MB = money(PER100K(MILLS.myrtle_beach_city));
const ONE_IN = Math.floor(H1.n / H1.pass12 / 100) * 100; /* 2,975 / 14 = 212: "fewer than 1 in 200" */
const C_PRICE_ONE_IN = Math.round(C1.n / C1.price_only); /* 1,785 / 214 = 8 */
const C_DUES_PER100 = Math.ceil(C1.after_dues_ceiling / C1.n * 100); /* 46 / 1,785 = 2.6: "fewer than 3 in 100" */
if (ONE_IN !== 200 || C_PRICE_ONE_IN !== 8 || C_DUES_PER100 !== 3) throw new Error("the rounded shares no longer match the counts: reword them");
const capRound = (s) => Math.round(capOf(s));

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "How to Analyze a Myrtle Beach Rental: 1% Rule, Tax, Dues",
  description: `${H1.pass12} of ${n(H1.n)} houses for sale here pass the 1 percent rule. Try our free rental analyzer, with Chapter3 AI, on any Grand Strand address.`,
  ogTitle: "Is this Myrtle Beach rental a good deal? Run the numbers here",
  crumb: "Run the numbers",
  eyebrow: "Free calculator",
  h1: "Is this Myrtle Beach rental a good deal?",
  h1em: "Run the numbers here, or have us run them.",
  sub: "A rental analyzer you can run on any Grand Strand address, the tax a rental pays in each town, and what condo dues do to the numbers.",
  heroMedia: (() => { const { glance } = require("./_kit.js"); return glance([
    { icon: "home", label: `${H1.pass12} of ${n(H1.n)}`, text: "houses for sale pass the 1% rule" },
    { icon: "tax", label: `About ${r100(PER100K(MILLS.unincorporated))}`, text: "tax a year per $100,000 on a rental" },
    { icon: "dollar", label: `${Math.min(...CONDOS.map((r) => r.dues_share_of_rent_pct))} to ${Math.max(...CONDOS.map((r) => r.dues_share_of_rent_pct))}%`, text: "of a 2-bedroom condo's rent goes to dues" },
  ]); })(),
  heroCta: false, /* round 1: the calculator comes right after the short answer, and the homes strip under it */
  toc: false,
  author: "devin",
  shortAnswer: [
    `Usually not, if you want cash flow: the rent left after costs. Take out tax, HOA dues, management and repairs. The middle house for sale in Carolina Forest or Longs keeps about ${capRound(SH)} to ${capRound(SL)} percent of its price, before insurance and any loan. A condo keeps about ${capOf(SC).toFixed(1)} percent. Our target is ${CAP_TARGET} percent. The rest is the rise in price, which beat our ${APP_TARGET} percent target over five and ten years.`,
    `The tax is higher than the listing shows. A rental pays about ${r100(PER100K(MILLS.unincorporated))} a year for each $100,000 of value outside city limits, about 3 times what an owner living there pays. The year after you buy, the county resets the value to about what you paid.`,
  ],
  sections: [
    /* Owner, 2026-11-03: "an interactable copy of the rental analyzer with the working AI in the blog page".
       The real analyzer (/invest/long-term-rental/) in embed mode, framed here; it reports its height. */
    { h2: "How do you run the numbers on a Myrtle Beach rental?", toc: "Analyzer", id: "calculator", html: () =>
      CSS + CSS2 +
      h.p("Use our rental analyzer. Enter an address and the price, and say whether you pay cash or take a loan. It fills in the rent and the costs, and Chapter3 AI sums up what the numbers mean. Change any number and the results change with it.") +
      ANALYZER +
      h.raw(`<p class="rn-note">The analyzer's rent and costs are estimates for a first look. For one address we check the rent against nearby rentals and the dues against the association's papers: ${h.a("#run-form", "send it to us")}. For a nightly rental, read the ${h.a("/invest/str-rules/", "rules by city")} first. Run any address through our ${h.a("/invest/long-term-rental/", "free long-term rental analyzer")}.</p>`) },

    { h2: "What does the numbers sheet look like?", toc: "The sheet", id: "sheet", html: () =>
      h.p(`One page with every cost and where each number comes from. Here it is for the middle 3-bedroom house for sale in Carolina Forest, asking ${money(SH.price)}.`) +
      SHEET +
      h.p("For an address you send, the rent comes from nearby rentals, and the dues and rules from the association's papers. We can get you an insurance quote for the house before you make an offer.") +
      h.h3("The same sheet on three homes") +
      h.p("The condo keeps the least, because its dues take more than a third of the rent.") +
      rentBars() },

    { h2: "Does the 1 percent rule work in Myrtle Beach?", toc: "The 1% rule", id: "one-percent-rule", html: () =>
      h.p(`Almost never for a house. The rule asks for a month's rent of at least 1 percent of the price. Of ${n(H1.n)} houses with 3 or more bedrooms for sale in Horry County, ${H1.pass12} pass. Longs has ${LONGS.pass_1pct} of them. We ran this count on ${RAN_ON}.`) +
      `<div class="rn-onerow">` + ONE_CHART + PHOTO() + `</div>` +
      h.p(`Condos often pass on price alone, then fail once the dues are counted. In the ZIP codes we tested, about 1 in ${C_PRICE_ONE_IN} condos for sale passes on price. Count the dues against the rent, and fewer than ${C_DUES_PER100} in 100 still pass.`) +
      ONE_PCT_OFFER },

    { h2: "Why is the tax on the listing not the tax you will pay?", toc: "The tax", id: "tax", html: (bg) =>
      h.p("Because the listing shows the seller's bill. After you buy, the county resets the value to about what you paid. A rental also pays a higher rate than a home its owner lives in.") +
      h.p(`A rental pays about ${TAX_OUT} a year for each $100,000 of value outside city limits, and about ${TAX_MB} in the City of Myrtle Beach. Outside city limits, that is about 3 times what an owner who lives there pays.`) +
      h.p(`A home its owner does not live in, such as a house rented out year-round or a second home, is taxed on ${h.ext(T12_43, "6 percent of its value")}. More on the 4 and 6 percent rates: ${h.a("/buyers/property-taxes/", "Horry County property tax rates")}.`) +
      h.p(`We read the county's deeds for this year's resales and the value each seller was taxed on. The middle home sold for about ${TR.all.median_price_over_taxable.toFixed(1)} times that value.`) +
      TAX_FIG +
      h.p(`Buy a home taxed at 4 percent and rent it out, outside city limits, and your next bill is about ${M4.median.toFixed(1)} times the seller's. Buy a home already taxed at 6 percent, such as a rental from another landlord, and it is about ${M6.median.toFixed(1)} times. In our experience, taxes stop more rental deals than insurance does.`) +
      h.h3("When the new bill starts") +
      h.p(`If you buy between January and September, your first October bill still uses the seller's value, and the next one uses the new value. Buy in October or later, and your first bill already uses the new value. ${h.ext(HC_RPT, "Bills are mailed October 1")} and are due by January 15.`) +
      h.p(`A rental bought from another landlord can get a break. The 25 percent exemption applies only when the home was taxed at 6 percent before the sale and stays at 6 percent after it. Then a quarter of its new value is exempt, but the taxed value cannot fall below the county's current market value.`) +
      h.p("The owner or the owner's agent must notify the county assessor before January 31 of the first tax year it applies. We remind you before the deadline.") +
      h.p(`Every town's rate is in our ${h.a("/buyers/property-taxes/", "property tax calculator")}.`) +
      h.cta("Want the tax for one address?", "We work out the bill you would pay as a landlord, from the county's record for that home and the rate in its town.", "Have us work out a rental's tax", "#run-form", bg) },

    { h2: "What does a condo's HOA fee do to the numbers?", toc: "Condo dues", id: "condo-dues", html: (bg) =>
      h.p("It takes a large share of the rent. More than half of condos for sale on the Grand Strand list dues over $600 a month.") +
      h.p(`For a 2-bedroom condo, the middle dues take from about a quarter of HUD's rent in ${CF_CONDO.name} to about half at the ${NE_CONDO.name.includes("north end") ? "north end of Myrtle Beach" : NE_CONDO.name}.`) +
      DUES_CHART +
      h.p(`The dues are why the condo in the sheet above keeps so little. Our ${h.a("/invest/condo-buildings/", "condo buildings page")} lists dues building by building. A condo rented by the night has different numbers: our ${h.a("/invest/airbnb-income/", "Airbnb income page")} has them by area, and ${h.a("/invest/condos/", "our condo guide")} covers the building rules.`) +
      h.cta("One condo's dues, set against its rent", "Send us a condo you like. We get its dues and rental rules from the association's papers and show you what is left of the rent.", "Have us look at a condo's dues", "#run-form", bg) },

    { h2: "What cap rate, cash-on-cash return and coverage should you aim for here?", toc: "The ratios", id: "ratios", html: () =>
      h.p(`Our targets are a cap rate of ${CAP_TARGET} percent or more, coverage of ${COV_TARGET} or more, and prices that rise ${APP_TARGET} percent a year or more. Cap rates by area are on our ${h.a(RETURNS, "rental returns page")}.`) },

    { h2: "What are the expenses on a rental property here?", toc: "Every cost", id: "costs", html: (bg) =>
      h.p("Six come out of the rent on every long-term rental: the property tax, insurance, HOA dues, management, repairs and empty months. A nightly rental adds its own taxes and licenses.") +
      `<div class="rn-costs">` + h.table(["Cost", "What it is here"], [
        ["<strong>Property tax</strong>", `About ${TAX_OUT} a year for each $100,000 of value outside city limits, and ${TAX_MB} in the City of Myrtle Beach, on a value reset to about the price after you buy. ${h.a("#tax", "Why the listing's tax is not yours")}.`],
        ["<strong>Insurance</strong>", `Priced house by house. Flood is a separate policy. ${h.a("/invest/landlord-insurance/", "Flood and wind on a rental")}.`],
        ["<strong>HOA dues</strong>", `The middle 3-bedroom house for sale pays ${money(Math.min(...F.gross_yield_by_zip.filter((r) => /^house/.test(r.type)).map((r) => r.median_dues)))} to ${money(Math.max(...F.gross_yield_by_zip.filter((r) => /^house/.test(r.type)).map((r) => r.median_dues)))} a month, by area. Condo dues are in ${h.a("#condo-dues", "the section above")}.`],
        ["<strong>Management</strong>", "We allow 10 percent of the rent."],
        ["<strong>Repairs and empty months</strong>", "We allow 10 percent of the rent."],
        ["<strong>Nightly rental taxes and licenses</strong>", `Only on a short-term rental. ${h.a("/invest/accommodations-tax/", "The accommodations tax")}, by town.`],
        ["<strong>Depreciation, a tax saving</strong>", `The building, not the land, is depreciated over ${h.ext(IRS527, "27.5 years")} for federal tax. ${h.a("/invest/rental-depreciation/", "How it works")}.`],
      ]) + `</div>` +
      h.cta("An insurance quote before you offer", "Insurance is priced house by house. Pick a home, and we get you a quote on it before you make an offer.", "Have us get an insurance quote", "/contact/", bg) },

    { h2: "What can a calculator not see?", toc: "What we check", id: "what-we-check", html: () =>
      h.p("The community's rules, how rents keep up with prices, and the seller's own numbers. These are three things we check for you before you offer.") +
      `<div class="rn-cards rn-plain">`
      + card("gate", "A rental ban", ["Some communities here ban renting the house at all. We filter those out when we search for you, and we read the HOA papers for rules that would block your plan."])
      + card("calendar", "Prices rose, the rent did not", ["An agent now on our team helped buyers purchase about eight nearly identical townhouses in a new Little River community. Each rented for a little over $2,000.", "Prices rose from $230,000 to $292,000 over about 18 months. The rents stayed flat, and the cash flow went away for later buyers."])
      + card("dollar", "The seller's cash flow is not yours", ["An agent at Chapter3 sold a rented house for an owner of 15 years. His cash flow was over $1,200 a month. The next investor would make about $600, because of higher taxes and a bigger loan.", "The agent marketed it to investors who accept a modest cash flow in an area where prices are rising. A cash buyer closed 13 days after it was listed."])
      + `</div>` },

    { h2: "What should you send us?", toc: "Send an address", id: "run-form", html: () =>
      h.p(`The address is enough. What investors ask us most is "send me properties with analytics to prove it", so that is what you get back.`) +
      h.p("You get the sheet above for that home. It has the rent from nearby rentals, the tax at the rate you will pay, and the dues and the building's rules. The sheet is free, and most come back the same day, evenings included.") +
      h.ul([
        "The address, or the MLS number. Any home on the Grand Strand, listed with any brokerage, or one not for sale yet.",
        "Your plan: long-term rental, short-term rental, mid-term rental or fix and flip. Not sure is fine.",
        `How you plan to pay, cash or a loan. We do not need your finances to run the home.`,
        `Whether you will stay in it yourself. ${h.a("/invest/14-day-rule/", "How your own stays change the tax")}.`,
      ]) + FORM +
      h.p("A condo can take longer when the dues or the rental rules are only in the association's papers, because we request them first. If the numbers work, we can set up a showing or walk the home on video for you. If they do not, we say so, and you keep the sheet.") },
  ],
  faqTitle: "Rental numbers FAQ",
  faq: [
    { q: "Is there a free rental property calculator for Myrtle Beach?", a: "Yes, the rental analyzer on this page, for a year-round rental. Enter an address and the price, and say whether you pay cash or take a loan. It fills in the rent and the costs, and Chapter3 AI sums up what the numbers mean." },
    { q: "Is Myrtle Beach a good place to buy a rental property?", a: `For cash flow alone, usually not. The middle house for sale in Carolina Forest or Longs keeps about ${capRound(SH)} to ${capRound(SL)} percent of its price a year before insurance and a loan. Our target is ${CAP_TARGET} percent. Over five and ten years, prices in the metro rose faster than our ${APP_TARGET} percent target, though they dipped over the last three. Our agents keep a list of investors who buy for a modest cash flow plus that rise.` },
    { q: "Is a Myrtle Beach condo a good investment?", a: "Only if the rent still covers the dues, and on most condos here it does not. The middle 2-bedroom condo's dues take about a quarter to half of HUD's rent, depending on the area. A condo rented by the night has different numbers." },
    { q: "What is the property tax on a rental in Horry County?", a: `About ${TAX_OUT} a year for each $100,000 of value outside city limits, and about ${TAX_MB} in the City of Myrtle Beach. A rental is taxed on 6 percent of its value, not 4, and pays the school operating tax.` },
    { q: "How much is landlord insurance on a Myrtle Beach rental?", a: "It is priced house by house, so we get you a quote on the exact home before you make an offer. Flood is a separate policy." },
    { q: "Can you run numbers on a property listed with another brokerage?", a: "Yes. Any home on the Grand Strand, listed with any brokerage. We use the listing, the county record, nearby rentals and the association's papers." },
    { q: "Is running the numbers free?", a: "Yes. There is no fee and no obligation. You can send one address or several." },
  ],
  sources: [
    { name: "HUD Fair Market Rents", href: HUD_FMR },
    { name: "Horry County 2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "SC Code 12-37", href: T12_37 },
    { name: "Horry County real property tax", href: HC_RPT },
    { name: "Horry County parcels", href: PARCELS },
    { name: "IRS Publication 527", href: IRS527 },
    { name: "Zillow home values", href: "https://www.zillow.com/research/data/" },
  ],
  sourcesNote: "Homes for sale: asking prices, counted in aggregate from the Coastal Carolinas Association of REALTORS® MLS (CCMLS). Resales: county deeds and parcel values, read by Chapter3. Estimates for a buying decision, not an appraisal or a loan quote.",
  pageImages: () => PH.pageImages(PHOTO_REC),
  afterSources: () => CREDITS + PH.imageSchema([PHOTO_REC]),
  bottomCta: { h2: "Want the numbers on one home?", p: "Give us the address. We send back the sheet for that home the same day: the rent, the tax at the rate you will pay, the dues, and what is left.", label: "Have us run the numbers on a home", href: "#run-form" },
  keywords: "is this rental property a good investment, how to analyze a rental property deal, 1 percent rule Myrtle Beach, Horry County rental property tax, cash on cash return, rental property expenses list, Myrtle Beach condo investment HOA dues",
  about: "Rental property analysis for Myrtle Beach and Horry County, South Carolina: cash flow, cap rate, the 1 percent rule and the property tax on a rental",
});
