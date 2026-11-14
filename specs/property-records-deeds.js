/* /buyers/property-records/deeds/ - Horry County land records: how to search the Register of Deeds
 * index by name, by book and page and by document type; that the index is free and online but the
 * documents are not; how to get a copy; how to go from an address to a deed; how to find a mortgage,
 * a lien, a plat or an easement, and what the index does not hold; how to read an index entry (our
 * count: more than 1 in 3 deeds show no price); how far back it goes; the free fraud alert; Georgetown
 * County's search for Pawleys Island and Litchfield; the office, its fees and the deed fee.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1, 2026-11-13. Plan: Blog-Brain
 * batches/2026-11-d/property-records-deeds/PLAN.md. Demand: must-answer.md. Facts: facts.md, VERIFIED
 * rows, and CORRECTED rows at the verifier's wording only (VERIFY.md; struck wording in
 * batches/2026-11-d/facts/buyers-property-records-deeds-struck.json). Row numbers are given as R<n>.
 * Not used: online image purchase or escrow viewing (R11 struck); "no punctuation" (R4 corrected);
 * "the index starts in 1984" and "about 1980" (R5, R6); "116 a weekday" (R20); any private lot,
 * name, price or parcel (R21); "$0 because" (R27); "every deed" has an affidavit (R28).
 * Data: data/2026-11-d/property-records-deeds/deed-index-stats.json (the deed count, R20) and
 * page-facts.json (fees, office, document types, the index entry's fields, the Horry and Georgetown
 * rows, each with its ledger row). Every table and card below is read from those files.
 * Pictures: drawings (the Name search, an index entry, the office card), one stat tile, and one
 * photo of the building that holds the public viewing area (reused; photos.json).
 * Fix round 1: facts.md rows 44 and 45 (kinds of deed, VERIFIED-BY-FIXER, SC Code 27-7-10, 12-51-130).
 * Homes: the site's edge places this page's feed under the opening (lead item in BUILD.md). No strip
 * here: this page names no place to live, and a second strip would crowd a tool page.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const IC = require(path.join(BB, "tools", "icons.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/buyers/property-records/deeds/";
const SLUG = "property-records-deeds";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const ST = read("deed-index-stats.json");
must(ST.deeds === 30339 && ST.consideration_zero_or_blank === 11075, "R20: 30,339 deeds, 11,075 with no price");
must(ST.consideration_zero_pct === 36.5, "R20: 36.5%");
must(ST.with_parcel_pct === 99.1, "R20: 99.1% carry a parcel number");
must(ST.with_memo_pct === 99.9, "R20: 99.9% carry a short legal description");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [ly, lm] = ST.last_record_date.split("-").map(Number);
const PERIOD = `the 12 months to ${MONTHS[lm - 1]} ${ly}`;
const PER_MONTH = Math.round(ST.deeds / 12 / 100) * 100;
must(PER_MONTH === 2500, "R20 (verifier): about 2,500 a month");
const NOPRICE_PCT = ST.consideration_zero_pct;
const DOTS = Math.round(ST.consideration_zero_or_blank / ST.deeds * 100);
must(DOTS === 37 && ST.consideration_zero_or_blank * 3 > ST.deeds, "R20: more than 1 in 3");

const PF = read("page-facts.json");
must(PF.mail.deedFirst4 === 8 && PF.mail.perPageAfter === 1, "R13: $8 for 4 pages, $1 after");
must(PF.recording.find((r) => r.what === "Deed").fee === 15, "R25: a deed is $15 to record");
must(PF.deedFee.per500 === 1.85 && PF.deedFee.per1000 === 3.7, "R26: $1.85 per $500, $3.70 per $1,000");
must(PF.office.phone === "(843) 915-5430", "R14: the phone");
must(PF.types.length === 11 && PF.entryFields.length === 10 && PF.compare.length === 5, "page-facts.json rows");

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const AW = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const AW_NAME = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeName";
const AW_BOOK = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeBookPage";
const AW_MEMO = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeComments";
const AW_JUMP = "https://acclaimweb.horrycounty.org/AcclaimWeb/details/JumpToBookPage/1/";
const RNS = "https://acclaimweb.horrycounty.org/PublicRecordsNotificationWeb/Subscribe";
const RNS_PAGE = "https://www.horrycountysc.gov/departments/register-of-deeds/recording-notification-service/";
const RNS_GUIDE = "https://www.horrycountysc.gov/media/0twpbohq/rnsinstructions.pdf";
const ROD = "https://www.horrycountysc.gov/departments/register-of-deeds/";
const FORM = "https://www.horrycountysc.gov/media/t3wpam13/customer-service-request-form.pdf";
const PRICES = "https://www.horrycountysc.gov/media/uevkqtt4/price.pdf";
const PUBIDX = "https://publicindex.sccourts.org/horry/publicindex/";
const MAPS = "https://www.google.com/maps/search/?api=1&query=1301+Second+Avenue+Conway+SC+29526";
const T12_24 = "https://www.scstatehouse.gov/code/t12c024.php";
const T15_35 = "https://www.scstatehouse.gov/code/t15c035.php";
const T30_2 = "https://www.scstatehouse.gov/code/t30c002.php";
const T27_7 = "https://www.scstatehouse.gov/code/t27c007.php";
const T12_51 = "https://www.scstatehouse.gov/code/t12c051.php";
const GT_DEEDS = "https://www.georgetowndeeds.com/";
const GT_ROD = "https://gtcountysc.gov/178/Register-of-Deeds";
const GT_FAQ = "https://gtcountysc.gov/Faq.aspx?QID=107";
const GT_ALERT = "https://fraudalert.bislandrecords.com/index.php?county=georgetown&state=sc";
const LEAD = "/contact/";

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main. One card style for the drawings, the tool, the stat tile, the    */
/* office and the offers; lists and tables plain under thin rules; one block width of 720 px.        */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const CARD = "border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 14px 34px -24px rgba(28,32,40,.45)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  /* The headline: the italic line at about half the H1's size. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.25rem,2.4vw,2.1rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  /* The site header ran a few pixels past a 1024 px window (critic); the same fix as /submarkets/garden-city/. */
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The county buttons: navy, so they do not look like our request buttons. */
  + `${S} .dd-go{display:inline-flex;align-items:center;gap:.55rem;min-height:52px;padding:.8rem 1.4rem;border-radius:999px;background:var(--navy);color:#fff!important;font-family:var(--sans);font-weight:600;font-size:1.05rem;line-height:1.3;text-decoration:none!important;box-shadow:0 10px 24px -14px rgba(28,32,40,.7);border:0;cursor:pointer}`
  + `${S} .dd-go:hover{background:#2a3040}${S} .dd-go svg{flex:none}`
  + `${S} .dd-go-note{font-size:.95rem;color:var(--muted);margin:.55rem 0 1.4rem;line-height:1.5;max-width:720px}`
  /* Numbered rows under thin rules: the three steps, the four fields, the fraud alert steps. */
  + `${S} ol.dd-steps{list-style:none;margin:.4rem 0 1.2rem;padding:0;max-width:720px;counter-reset:dd}`
  + `${S} ol.dd-steps>li{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:.9rem;align-items:start;padding:.95rem 0;border-top:${RULE};margin:0;counter-increment:dd}`
  + `${S} ol.dd-steps>li:last-child{border-bottom:${RULE}}`
  + `${S} ol.dd-steps .ic{display:inline-flex;color:var(--brass);margin-top:.1rem}`
  + `${S} ol.dd-steps .nb{display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;margin-top:.05rem}`
  + `${S} ol.dd-steps h3{margin:0 0 .25rem!important;font-family:var(--sans);font-size:1.1rem!important;font-weight:650;color:var(--navy);line-height:1.35}`
  + `${S} ol.dd-steps.c h3::before{content:counter(dd) ". "}`
  + `${S} ol.dd-steps p{margin:0!important;color:var(--muted);line-height:1.65;font-size:var(--read,1.0625rem)}`
  /* The quiet line of links and the contents list. */
  + `${S} .dd-quiet{font-size:1rem;color:var(--muted);line-height:1.65;max-width:720px;margin:1rem 0 0}`
  + `${S} nav.dd-toc{max-width:720px;margin:1.6rem 0 .4rem;padding-top:1rem;border-top:${RULE}}`
  + `${S} nav.dd-toc p{font-family:var(--sans);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;color:var(--g-ink,#8a5226);font-weight:600;margin:0 0 .4rem}`
  + `${S} nav.dd-toc ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.4rem}`
  + `@media (min-width:700px){${S} nav.dd-toc ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} nav.dd-toc li{margin:0}${S} nav.dd-toc a{display:block;padding:.5rem 0;color:var(--navy);text-decoration:underline;text-underline-offset:.18em;line-height:1.35;font-size:1rem}`
  /* Cards. */
  + `${S} .dd-fig{margin:1.4rem 0 1.6rem;max-width:720px}`
  + `${S} figure.dd-fig{${FLAT};padding:0!important}${S} figure.dd-fig>figcaption{padding:0!important}`
  + `${S} .dd-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}`
  + `${S} p.dd-btn{margin:1rem 0 1.2rem}`
  /* Two-column tables (copies, fees): two columns at every width, plain under thin rules. */
  + `${S} table.dd-t2{width:100%;max-width:720px;border-collapse:collapse;margin:1.1rem 0 1.3rem;font-family:var(--sans);font-size:1rem;color:var(--navy)}`
  + `${S} table.dd-t2 th,${S} table.dd-t2 td{text-align:left;vertical-align:top;padding:.6rem .8rem .6rem 0;border-bottom:${RULE};line-height:1.45}`
  + `${S} table.dd-t2 thead th{font-size:.95rem;color:var(--muted);font-weight:600;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} table.dd-t2 tbody th{font-weight:600;width:52%}${S} table.dd-t2 td{color:var(--muted);padding-right:0}`
  + `${S} .dd-card{${CARD};padding:1rem 1.15rem 1.05rem;box-sizing:border-box;max-width:720px}`
  + `${S} .dd-card .hd{display:flex;align-items:center;gap:.5rem;font-family:var(--sans);font-weight:700;font-size:1rem;color:var(--navy);padding-bottom:.6rem;border-bottom:2px solid var(--navy);margin-bottom:.15rem}`
  /* V2: the Name search, drawn. */
  + `${S} .dd-form .f{display:grid;grid-template-columns:auto minmax(0,9.5rem) minmax(0,1fr);column-gap:.7rem;align-items:center;padding:.6rem 0;border-bottom:1px solid rgba(28,32,40,.1)}`
  + `${S} .dd-form .f .nb{display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--brass);color:#fff;font-family:var(--sans);font-weight:700;font-size:.9rem}`
  + `${S} .dd-form .f .l{font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;line-height:1.3}`
  + `${S} .dd-form .box{display:inline-block;padding:.35rem .6rem;border:1px solid rgba(28,32,40,.32);border-radius:8px;background:#fff;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:1rem;color:var(--navy);line-height:1.3}`
  + `${S} .dd-form .opt{display:flex;flex-wrap:wrap;gap:.35rem .9rem;font-family:var(--sans);font-size:1rem;color:var(--navy)}`
  + `${S} .dd-form .opt span::before{content:"";display:inline-block;width:.8rem;height:.8rem;border-radius:50%;border:2px solid var(--navy);margin-right:.35rem;vertical-align:-.08rem;box-sizing:border-box}`
  + `${S} .dd-form .opt span.on::before{background:var(--navy);box-shadow:inset 0 0 0 2px #fff}`
  + `${S} .dd-form .go{display:flex;justify-content:flex-end;padding-top:.75rem}${S} .dd-form .go span{display:inline-block;padding:.45rem 1.1rem;border-radius:8px;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:600}`
  + `@media (max-width:520px){${S} .dd-form .f{grid-template-columns:auto minmax(0,1fr);row-gap:.35rem}${S} .dd-form .f>:nth-child(3){grid-column:2}}`
  /* V5 and V8: cards of labelled rows. */
  + `${S} .dd-card dl{margin:0;display:grid;grid-template-columns:1fr}`
  + `${S} .dd-card .r{display:grid;grid-template-columns:minmax(0,11rem) minmax(0,1fr);column-gap:1rem;padding:.55rem 0;border-bottom:1px solid rgba(28,32,40,.1)}`
  + `${S} .dd-card .r:last-child{border-bottom:0}`
  + `${S} .dd-card dt{font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;line-height:1.4}`
  + `${S} .dd-card dd{margin:0;color:var(--muted);font-size:1rem;line-height:1.45}${S} .dd-card dd a{color:var(--navy)}`
  + `@media (max-width:520px){${S} .dd-card .r{grid-template-columns:1fr;row-gap:.1rem}}`
  /* The book and page tool. */
  + `${S} .dd-tool{${CARD};padding:1.05rem 1.15rem 1.1rem;box-sizing:border-box;max-width:720px;margin:1.3rem 0 1.4rem}`
  + `${S} .dd-tool .row{display:grid;grid-template-columns:1fr 1fr;gap:.75rem;margin-bottom:.85rem}`
  + `${S} .dd-tool label{display:block;font-family:var(--sans);font-size:1rem;font-weight:600;color:var(--navy)}`
  + `${S} .dd-tool input{display:block;width:100%;margin-top:.35rem;min-height:48px;padding:.55rem .7rem;font-family:var(--sans);font-size:1.0625rem;color:var(--navy);background:#fff;border:1px solid rgba(28,32,40,.28);border-radius:10px;box-sizing:border-box}`
  + `${S} .dd-tool .dd-go{width:100%;justify-content:center}`
  + `${S} .dd-tool .msg{font-size:.95rem;color:var(--muted);line-height:1.5;margin:.6rem 0 0}`
  /* V7: the stat tile with its 10 by 10 dots. */
  + `${S} .dd-stat{${CARD};padding:1.1rem 1.2rem;box-sizing:border-box;max-width:720px;display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:1.4rem;align-items:center}`
  + `${S} .dd-stat .big{display:block;font-family:var(--serif);font-size:2.6rem;line-height:1.05;color:var(--navy)}`
  + `${S} .dd-stat .lbl{display:block;color:var(--navy);font-size:1.05rem;line-height:1.45;margin-top:.35rem;font-weight:500}`
  + `${S} .dd-stat svg{display:block;width:150px;height:150px}`
  + `@media (max-width:440px){${S} .dd-stat{grid-template-columns:1fr;row-gap:.9rem}${S} .dd-stat svg{width:100%;max-width:240px;height:auto}}`
  /* Lists and tables plain, under thin rules. */
  + `${S} ul.dd-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.dd-list>li{margin:0;padding:.75rem 0;border-top:${RULE};color:var(--muted);line-height:1.6}`
  + `${S} ul.dd-list>li:last-child{border-bottom:${RULE}}${S} ul.dd-list strong{color:var(--navy)}`
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.65rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.1rem 0!important}${TBL} td:first-child{font-weight:650;color:var(--navy)}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}}`
  + "</style>";

/* A table that turns into rows of labelled cells on a phone. */
const table = (head, rows) => h.table(head, rows).replace(/<tbody>([\s\S]*)<\/tbody>/, (m, body) => "<tbody>" + body.replace(/<tr>([\s\S]*?)<\/tr>/g, (r, cells) => {
  let i = 0;
  return "<tr>" + cells.replace(/<td ([^>]*)>/g, (t, attrs) => { const l = head[i++]; return i === 1 ? t : `<td ${attrs} data-l="${l}">`; }) + "</tr>";
}) + "</tbody>");

const ic = (name) => `<span class="ic">${IC.icon(name, { size: 30 })}</span>`;
const step = (icon, title, text) => `<li>${ic(icon)}<div><h3>${title}</h3><p>${text}</p></div></li>`;
const nstep = (n, title, text) => `<li><span class="nb" aria-hidden="true">${n}</span><div><h3>${title}</h3><p>${text}</p></div></li>`;
const arrowOut = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
const go = (href, label) => `<p class="dd-btn"><a class="dd-go" href="${href}" target="_blank" rel="noopener">${label}${arrowOut}</a></p>`;

/* ---------------------------------------------------------------------------- */
/* V2: the Name search, drawn (R4, R5, R7; field names from raw/aw_name_form.html). */

const FORM_FIG = `<figure class="dd-fig"><div class="dd-card dd-form" role="img" aria-label="A drawing of the Horry County Register of Deeds Name search. Field 1, Name, holds SMITH JOHN. Field 2, Show Names, is set to All, with Grantor and Grantee as the other choices. Field 3 holds the From Record Date, 1/1/1984, and the To Record Date. Field 4 is Document Type. A Search button sits at the bottom.">`
  + `<div class="hd">${IC.icon("pin", { size: 22 })}<span>Name search</span></div>`
  + `<div class="f"><span class="nb">1</span><span class="l">Name</span><span><span class="box">SMITH JOHN</span></span></div>`
  + `<div class="f"><span class="nb">2</span><span class="l">Show Names</span><span class="opt"><span class="on">All</span><span>Grantor</span><span>Grantee</span></span></div>`
  + `<div class="f"><span class="nb">3</span><span class="l">From and To Record Date</span><span><span class="box">1/1/1984</span> to <span class="box">today</span></span></div>`
  + `<div class="f"><span class="nb">4</span><span class="l">Document Type</span><span><span class="box">DEEDS, MTG, LIENS, PLATS</span></span></div>`
  + `<div class="go"><span>Search</span></div>`
  + `</div><figcaption>A drawing of the county's Name search, simplified. The real page has a few more boxes.</figcaption></figure>`;

const FIELDS = `<ol class="dd-steps">`
  + nstep(1, "Name: the last name first, then the first name.", `Search every spelling too, with and without a middle initial.`)
  + nstep(2, "Show Names: leave it on All.", `All finds the name on either side of a paper. On a deed, the grantor is the seller and the grantee is the buyer.`)
  + nstep(3, "From and To Record Date: narrow a long list.", `The form fills in a From date of January 1, 1984, but names reach back to late 1979. For an older deed, set the From date earlier. A shorter range cuts a common name down to a few rows.`)
  + nstep(4, "Document Type: pick one kind of paper.", `The four groups are deeds, mortgages, liens and plats. The ${h.a("#liens", "table below")} names the exact types to pick.`)
  + `</ol>`;

/* ---------------------------------------------------------------------------- */
/* The book and page tool (R19: a deed book and page opens by link, with no terms screen). */

const TOOL = `<div class="dd-tool" role="group" aria-label="Open a Horry County deed by its book and page">`
  + `<div class="row"><label for="ddBook">Deed book<input id="ddBook" inputmode="numeric" autocomplete="off" placeholder="Book"></label>`
  + `<label for="ddPage">Page<input id="ddPage" inputmode="numeric" autocomplete="off" placeholder="Page"></label></div>`
  + `<button type="button" class="dd-go" id="ddGo">Open the deed at the county${arrowOut}</button>`
  + `<p class="msg" id="ddMsg" aria-live="polite">Opens the county's page for that deed book and page in a new tab, with no terms screen.</p></div>`
  + `<script>(function(){function go(){var b=(document.getElementById("ddBook").value||"").replace(/[^0-9]/g,""),p=(document.getElementById("ddPage").value||"").replace(/[^0-9]/g,""),m=document.getElementById("ddMsg");`
  + `if(!b||!p){m.textContent="Type both numbers: the deed book and the page.";return}`
  + `window.open("${AW_JUMP}"+b+"/"+p,"_blank","noopener")}`
  + `document.addEventListener("DOMContentLoaded",function(){var g=document.getElementById("ddGo");if(g)g.addEventListener("click",go);`
  + `["ddBook","ddPage"].forEach(function(id){var e=document.getElementById(id);if(e)e.addEventListener("keydown",function(ev){if(ev.key==="Enter")go()})})})})();</script>`;

/* ---------------------------------------------------------------------------- */
/* V5: one index entry, drawn (R21 corrected field list; R20 for the parcel number). */

const ENTRY = `<figure class="dd-fig"><div class="dd-card" role="img" aria-label="A drawing of one deed's entry in the Horry County index, with a plain meaning beside each field: record date, book and page, instrument number, map number, number of pages, document type, grantor, grantee, consideration, and the memo or legal description.">`
  + `<div class="hd">${IC.icon("home", { size: 22 })}<span>One deed's entry in the index</span></div><dl>`
  + PF.entryFields.map(([k, v]) => `<div class="r"><dt>${k}</dt><dd>${k === "Map #" ? `${v} ${Math.round(ST.with_parcel_pct)} in 100 deeds carry one.` : v}</dd></div>`).join("")
  + `</dl></div><figcaption>A drawing of the fields, not a real deed. Click any row in the county's list to see them.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* V7: the stat tile (R20), from deed-index-stats.json.                           */

const dotGrid = (() => {
  let s = "";
  for (let i = 0; i < 100; i++) {
    const x = 7.5 + (i % 10) * 15, y = 7.5 + Math.floor(i / 10) * 15;
    s += `<circle cx="${x}" cy="${y}" r="5.4" fill="${i < DOTS ? "#c4783a" : "#1c2028"}" fill-opacity="${i < DOTS ? "1" : ".14"}"/>`;
  }
  return `<svg viewBox="0 0 150 150" role="img" aria-label="A grid of 100 dots, ${DOTS} of them shaded: about ${DOTS} in every 100 deeds show $0 or no price.">${s}</svg>`;
})();
const STAT = `<figure class="dd-fig"><div class="dd-stat"><div><span class="big">${NOPRICE_PCT}%</span>`
  + `<span class="lbl">of Horry County deeds show $0 or no price. That is more than 1 in 3.</span></div>${dotGrid}</div>`
  + `<figcaption>Each dot is 1 in 100 deeds recorded in Horry County.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* V8: the office card (R14, R15).                                                */

const O = PF.office;
const OFFICE = `<figure class="dd-fig"><div class="dd-card" role="img" aria-label="The Horry County Register of Deeds office: phone ${O.phone}; open ${O.hours}; ${O.street}; mail to ${O.mail}.">`
  + `<div class="hd">${IC.icon("town", { size: 22 })}<span>Horry County Register of Deeds</span></div><dl>`
  + `<div class="r"><dt>Phone</dt><dd><a href="tel:${O.tel}">${O.phone}</a></dd></div>`
  + `<div class="r"><dt>Hours</dt><dd>${O.hours}</dd></div>`
  + `<div class="r"><dt>Office</dt><dd>${h.ext(MAPS, O.street)}</dd></div>`
  + `<div class="r"><dt>Mail</dt><dd>${O.mail}</dd></div>`
  + `<div class="r"><dt>Website</dt><dd>${h.ext(ROD, "Register of Deeds")}</dd></div>`
  + `</dl></div></figure>`;

/* ---------------------------------------------------------------------------- */
/* The one photo: the building that holds the public viewing area (R10, R14). Reused from
   /hoa/liens-and-foreclosure/ (its ledger row 39, place checked by its fixer); photos.json here. */

const ph = PK.create({ h, photos: read("photos.json").photos, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("horry-government-justice-center", "The Horry County Government and Justice Center at 1301 Second Avenue in Conway. The Register of Deeds' public viewing area, where the documents are read and printed, is in this building.");
ph.share("horry-government-justice-center");
/* photos.js adds a general "resized these photos" line; the photo's own credit already says it. */
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const CREDITS = () => { const c = ph.credits(); if (!GENERIC_CREDIT.test(c)) throw new Error("photos.js changed its general credit line; recheck"); return c.replace(GENERIC_CREDIT, ""); };

/* ---------------------------------------------------------------------------- */
/* Tables (page-facts.json).                                                       */

const t2 = (cap, head, rows) => `<table class="dd-t2"><caption style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">${cap}</caption><thead><tr><th scope="col">${head[0]}</th><th scope="col">${head[1]}</th></tr></thead><tbody>${rows.map(([a, b]) => `<tr><th scope="row">${a}</th><td>${b}</td></tr>`).join("")}</tbody></table>`;
const COPIES = t2("What a copy costs at the Horry County Register of Deeds", ["Copy", "Cost"], PF.copies.map((c) => [c.what, c.cost]));
const TYPES = table(["You want", "Pick this document type"], PF.types.map((t) => [t.link ? h.a(t.link, t.want) : t.want, t.type]));
const FEES = t2("Horry County recording fees", ["To record", "Fee"], PF.recording.map((r) => [r.what, `$${r.fee}`]));
const COMPARE = table(["", "Horry County", "Georgetown County"], PF.compare);

/* ---------------------------------------------------------------------------- */
/* Contents (short labels; each equals its section's data-toc, score H14).        */

const SECTIONS_TOC = [
  ["search", "How to search"], ["free", "Is it free?"], ["copy", "Get a copy"], ["by-name", "By name"],
  ["by-address", "By address"], ["book-page", "Book and page"], ["liens", "Liens and plats"], ["read", "Read a deed"],
  ["how-far-back", "How far back"], ["fraud-alert", "Fraud alert"], ["georgetown", "Georgetown County"], ["office", "Office and fees"],
];
const FAQ_TITLE = "Deed search FAQ";
const TOC = `<nav class="dd-toc" aria-label="On this page"><p>On this page</p><ul>`
  + SECTIONS_TOC.map(([id, l]) => `<li><a href="#${id}">${l}</a></li>`).join("")
  + `<li><a href="#deed-search-faq">${FAQ_TITLE}</a></li></ul></nav>`;
const T = Object.fromEntries(SECTIONS_TOC.map(([id, l]) => [id, l]));

/* ---------------------------------------------------------------------------- */
/* Offers. Every request button goes to /contact/; the site opens the short pop-up. Four, each worded */
/* for the question its section answered.                                                             */

const TOP_OFFER = (bg) => h.cta("The deed itself is not online.", "Send us the address. We pull the deed, the plat, any liens and the HOA papers for you, free.", "Send us the address", LEAD, bg);
const END = {
  h2: "Buying or selling in Horry or Georgetown County? Send one address.",
  p: "We pull the recorded papers on it and tell you what each one is. Free.",
  label: "Send an address", href: LEAD,
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Property records", url: "/buyers/property-records/" },
  title: "Horry County Land Records: Free Deed Search by Name",
  description: "How to search Horry County land records at the Register of Deeds: deeds, mortgages, liens and plats by name, free, and how to get a copy of the deed itself.",
  ogTitle: "Horry County land records: search deeds, liens and plats free by name, and get a copy of the deed",
  crumb: "Deeds",
  eyebrow: "Horry County property records",
  h1: "Horry County land records: how to search deeds, liens and plats",
  h1em: "Deeds, mortgages and liens back to late 1979, free to search by name.",
  sub: "The Horry County land records search is free, needs no account and takes three steps. Reading the deed itself takes a trip to Conway or a copy.",
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Horry County land records are free to search online at the Register of Deeds' search, with no account. Choose Name and type the last name first, like SMITH JOHN. The list shows the deeds, mortgages, liens and plats recorded under that name.`,
    `The list is online, but the papers are not. You read them in Conway, order a copy by mail from $8, or send us the address and we pull them free.`,
  ],
  sections: [
    { h2: "How do I search Horry County land records?", toc: T.search, id: "search", html: (bg) =>
      CSS + ph.css()
      + go(AW_NAME, "Open the Horry County deed search")
      + `<p class="dd-go-note">The search belongs to the Horry County Register of Deeds. Chapter3 is a real estate brokerage, not the county.</p>`
      + `<ol class="dd-steps c">`
      + step("key", "Open the search and accept the county's terms.", `Click "I accept the conditions above." You then search as a guest, with no account and no fee.`)
      + step("pin", "Choose Name, and type the last name first.", `Type SMITH JOHN for John Smith. Use at least 3 letters, and click Search.`)
      + step("calendar", "Read the list, then click a row.", `Each row is one paper under that name. Click it for the date, the kind of paper, both names, the book and page, and the price. It also gives a short description of the land.`)
      + `</ol>`
      + TOP_OFFER(bg)
      + `<p class="dd-quiet">Looking for lot lines on a map? See our ${h.a("/buyers/property-records/gis-map/", "Horry County GIS map guide")}. Pawleys Island or Litchfield? Use ${h.a("#georgetown", "Georgetown County's deed search")}. Every county record in one place: ${h.a("/buyers/property-records/", "Horry County property records")}.</p>`
      + TOC },

    { h2: "Are Horry County land records free?", toc: T.free, id: "free", html: () =>
      h.p(`Yes. Searching the Horry County deed index costs nothing and needs no account. The county charges only for copies and for recording a paper.`)
      + h.p(`The index is online, but the documents are not. Horry County does not show images of recorded documents on the internet. You view and print them at the public viewing area at 1301 Second Avenue in Conway.`)
      + PHOTO
      + h.p(`The free search still tells you a lot. It shows that a paper exists, when it was recorded, who signed it, where it is filed and what land it covers.`)
      + h.p(`The county also has an app called "Land Records". It is a parcel map, not the deed search, and it asks you to sign in with a county account. Our ${h.a("/buyers/property-records/gis-map/", "GIS map guide")} shows how to use it.`) },

    { h2: "How do I get a copy of my deed in Horry County?", toc: T.copy, id: "copy", html: (bg) =>
      h.p(`You can get a copy of a Horry County deed three ways: at the ${h.a("#office", "office in Conway")}, by mail, or through us.`)
      + `<ul class="dd-list">`
      + `<li><strong>At the office.</strong> View and print the deed in the public viewing area.</li>`
      + `<li><strong>By mail.</strong> Send the county's ${h.ext(FORM, "copy request form")} with a ${PF.mail.pay} to the ${PF.mail.to}. A deed is $${PF.mail.deedFirst4} for the first 4 pages.</li>`
      + `<li><strong>Through us.</strong> Free, by email, from the address alone.</li>`
      + `</ul>`
      + COPIES
      + h.p(`The index shows the number of pages for each paper, so you know the cost before you mail the form.`) },

    { h2: "How do I search Horry County deeds by name?", toc: T["by-name"], id: "by-name", html: () =>
      h.p(`Choose Name in the Horry County deed search, type the last name first, then the first name, and click Search. These are the four boxes that matter.`)
      + FORM_FIG
      + FIELDS
      + h.p(`A company is searched the same way, by the name on the paper. The index also searches by ${h.a("#book-page", "book and page")}, by price range, by recording date and by the ${h.ext(AW_MEMO, "legal description or memo")}.`) },

    { h2: "Can I search Horry County deeds by address?", toc: T["by-address"], id: "by-address", html: () =>
      h.p(`Go from the address to the owner's name or the deed's book and page first. A deed's index entry describes the land by its lot and subdivision, so two steps are quicker.`)
      + `<ol class="dd-steps">`
      + nstep(1, "Find the lot on the county's parcel map.", `On the ${h.a("/buyers/property-records/gis-map/", "Horry County GIS map")}, search the address and click the lot. Its card shows the owner and the Deed Book and Deed Page. The map asks you to sign in with a county account.`)
      + nstep(2, "Open the deed.", `Type the book and page into the ${h.a("#book-page", "box below")}, or search the owner's name in the deed search.`)
      + `</ol>`
      + h.p(`To see every lot in a subdivision, use the ${h.ext(AW_MEMO, "Legal Description/Memo search")} and type the subdivision's name. Almost every deed, ${Math.round(ST.with_memo_pct * 10)} in 1,000, carries that short description of its lot.`) },

    { h2: "How do I look up a deed by book and page in Horry County?", toc: T["book-page"], id: "book-page", html: () =>
      h.p(`Type the deed book and page below, and the county's page for that deed opens. A book and page is printed on the county map's parcel card and in the index entry of every paper.`)
      + TOOL
      + h.p(`For a plat, mortgage or lien book, use the county's ${h.ext(AW_BOOK, "Book/Page search")}. Pick the book type there: D for deeds, MTG for mortgages, LN for liens and P for plats.`) },

    { h2: "How do I find a mortgage, a lien, a plat or an easement in Horry County?", toc: T.liens, id: "liens", html: (bg) =>
      h.p(`Search the owner's name, then pick the document type. The Horry County index has more than 140 types. These are the ones a buyer or an owner needs.`)
      + TYPES
      + h.p(`A paid-off mortgage shows as its own entry under the owner's name. A lis pendens notice says a lawsuit affects the title to the property.`)
      + h.h3("What the deed index does not hold")
      + `<ul class="dd-list">`
      + `<li><strong>Court judgments.</strong> The Clerk of Court keeps them. A judgment entered there is a lien on the debtor's land in the county for ten years. The courts' ${h.ext(PUBIDX, "Public Index")} searches Horry County's cases.</li>`
      + `<li><strong>Property tax.</strong> Whether a home's tax is paid shows on its ${h.a("/buyers/property-records/tax-bill/", "county tax bill")}. Our ${h.a("/buyers/property-taxes/", "Horry County property tax guide")} explains the rates.</li>`
      + `<li><strong>HOA dues owed.</strong> An association's claim shows only once it is recorded as a lien. Our ${h.a("/hoa/liens-and-foreclosure/", "HOA liens guide")} explains what follows.</li>`
      + `</ul>`
      + h.cta("Have us check a house for liens before you offer.", "We search the recorded loans, liens and lawsuit notices on the house and tell you what we find, free.", "Ask us to check for liens", LEAD, bg) },

    { h2: "How do I read a Horry County deed?", toc: T.read, id: "read", html: () =>
      h.p(`Start with the deed's entry in the index. It holds the facts most readers need, and you can see it free, without a trip to Conway.`)
      + ENTRY
      + h.h3("Deeds that show $0")
      + STAT
      + h.p(`We read every one of the ${n0(ST.deeds)} deeds Horry County recorded in ${PERIOD}. ${n0(ST.consideration_zero_or_blank)} of them show $0 or no price.`)
      + h.p(`You cannot tell from a blank price what was paid, and the index does not say why it is blank. State law exempts some deeds from the deed fee, such as an estate's deed of distribution. The full list is under ${h.a("#fees", "recording fees")}.`)
      + h.p(`For what homes sold for, see ${h.a("/sell/home-value/", "what homes sold for by area")}, worked out from the county's deeds that show a price.`)
      + h.h3("What the deed itself adds")
      + `<ul class="dd-list">`
      + `<li><strong>The kind of deed.</strong> In a warranty deed, the seller promises to defend the title against anyone's lawful claim. A tax deed goes to the buyer at a sale for unpaid property tax, once the owner's time to redeem it runs out.</li>`
      + `<li><strong>The owner and the previous owners.</strong></li>`
      + `<li><strong>A full description of the land.</strong></li>`
      + `<li><strong>The affidavit filed with it.</strong> A deed is normally filed with a sworn affidavit. It gives the tax map number and either the value the fee is figured on or the reason the deed is exempt.</li>`
      + `</ul>`
      + h.p(`Inherited a home? Our guide to ${h.a("/sell/inherited-house/", "selling an inherited house")} explains the estate's deed and the steps after it.`) },

    { h2: "How far back do Horry County land records go online?", toc: T["how-far-back"], id: "how-far-back", html: () =>
      h.p(`The Horry County index lists names and dates from late 1979, starting at Deed Book 660. Older deed books, back to Book 1, show in the index only by book and page, marked non-indexed.`)
      + h.p(`We checked the oldest books in the index. Book 1 still opens by its book and page, with no names to search.`)
      + h.p(`For a deed from before late 1979, call the office before you drive to Conway.`)
      + h.p(`The online list runs a few days behind the recording desk. A paper recorded this week may not show yet. About ${n0(PER_MONTH)} deeds are recorded in Horry County each month, besides the mortgages, liens and plats.`) },

    { h2: "Does Horry County have a property fraud alert?", toc: T["fraud-alert"], id: "fraud-alert", html: (bg) =>
      h.p(`Yes. Horry County's Recording Notification Service is free for property owners. It sends you an email when a paper is recorded under a name you list.`)
      + `<ol class="dd-steps">`
      + nstep(1, "Open the county's sign-up page.", `It is part of the Register of Deeds' search site, and the county's ${h.ext(RNS_PAGE, "service page")} describes it.`)
      + nstep(2, "List every version of your name.", `The name must match the recorded name exactly. DOE JOHN, DOE JOHN J and DOE JOHN JR are three different names, so add each one.`)
      + nstep(3, "Click the link in the county's email.", `The alert starts once you activate it.`)
      + `</ol>`
      + go(RNS, "Sign up for the Horry County alert")
      + h.p(`An alert comes after a paper is recorded. It cannot stop the recording, but it lets you act quickly if a paper is filed that you did not sign.`) },

    { h2: "How do I search Georgetown County deeds for Pawleys Island and Litchfield?", toc: T.georgetown, id: "georgetown", html: () =>
      h.p(`${h.a("/submarkets/pawleys-island/", "Pawleys Island")} and Litchfield Beach are in Georgetown County, so their deeds are in Georgetown County's own search, not Horry's. Unlike Horry, Georgetown shows a deed on its website when the image is available.`)
      + go(GT_DEEDS, "Open the Georgetown County deed search")
      + `<ul class="dd-list">`
      + `<li><strong>The name:</strong> last name, then first name, or a company name. The search ignores spaces and punctuation, and it can search both sides at once.</li>`
      + `<li><strong>New book codes:</strong> papers recorded after May 14, 2021 use RB for Record Book, PLS for Plat Slide and MLB for Miscellaneous Book.</li>`
      + `<li><strong>Old records:</strong> Georgetown County's property transfers and mortgages go back to the late 1860s.</li>`
      + `</ul>`
      + COMPARE
      + h.p(`Georgetown's fraud alert also sends texts. ${h.ext(GT_ALERT, "Sign up for Georgetown's alert")} on its own page.`)
      + h.p(`An online image can show a personal number. You can ask the Register of Deeds in writing to remove your own Social Security, driver's license or bank account number from it. Under South Carolina law, there is no fee.`) },

    { h2: "Horry County Register of Deeds: phone, hours and address", toc: T.office, id: "office", html: () =>
      h.p(`The Horry County Register of Deeds records and keeps the county's deeds, mortgages, plats and other land papers. Its office and public viewing area are in Conway.`)
      + OFFICE
      + `<h3 id="fees" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:2rem 0 .6rem;line-height:1.3">Horry County recording fees</h3>`
      + h.p(`Most papers cost one flat fee to record, whatever their length.`)
      + FEES
      + h.p(`The deed fee, often called deed stamps, is separate. It is $${PF.deedFee.per500.toFixed(2)} for each $500 of value, or part of $500, which is $${PF.deedFee.per1000.toFixed(2)} per $1,000.`)
      + h.p(`By law the seller owes the deed fee, except on a master-in-equity or government deed, where the buyer owes it. Our ${h.a("/sell/net-proceeds/", "seller's net proceeds calculator")} and ${h.a("/buyers/closing-costs/", "closing costs guide")} show it at your price.`)
      + h.p(`State law exempts some deeds from the deed fee:`)
      + `<ul class="dd-list">`
      + `<li>A deed of distribution from an estate.</li>`
      + `<li>A deed to a government.</li>`
      + `<li>A transfer into a company or a trust in return only for an interest in it.</li>`
      + `<li>A corrective or quitclaim deed that only confirms title the grantee already holds.</li>`
      + `<li>A deed in lieu of foreclosure.</li>`
      + `</ul>`
      + h.p(`Selling without an agent? Our ${h.a("/sell/fsbo/", "for sale by owner guide")} covers the deed fee and the other costs of a sale.`) },
  ],
  faqTitle: FAQ_TITLE,
  faq: [
    { q: "Are Horry County deed records public?", a: "Yes. Anyone can search the Register of Deeds index online as a guest, free, after accepting the county's terms." },
    { q: "Can I see my deed online in Horry County?", a: "No. Horry County puts the index online, not the documents. You view them in Conway, order a copy by mail, or have us pull it for you." },
    { q: "How much does a copy of a deed cost in Horry County?", a: "By mail, $8 for the first 4 pages and $1 for each page after. At the office, 50 cents a page on the copy machine. A certified copy is $2 more." },
    { q: "What is a plat, and how do I find one in Horry County?", a: "A plat is a scale drawing of lots, usually made by a surveyor. It shows each lot's size and boundaries. Search the name on the plat and pick a plat type, or open it by book and page with book type P." },
  ],
  sources: [
    { name: "Horry County deed index", href: AW },
    { name: "Register of Deeds", href: ROD },
    { name: "price list", href: PRICES },
    { name: "copy request form", href: FORM },
    { name: "alert guide", href: RNS_GUIDE },
    { name: "SC Code 12-24", href: T12_24 },
    { name: "SC Code 15-35", href: T15_35 },
    { name: "SC Code 30-2", href: T30_2 },
    { name: "SC Code 27-7", href: T27_7 },
    { name: "SC Code 12-51", href: T12_51 },
    { name: "Georgetown Register of Deeds", href: GT_ROD },
    { name: "Georgetown FAQ", href: GT_FAQ },
  ],
  sourcesNote: `Our count: every deed (type 001) in Horry County's index for ${PERIOD}. Not legal advice.`,
  pageImages: () => ph.pageImages(),
  afterSources: () => CREDITS(),
  bottomCta: END,
  keywords: "horry county land records, horry county register of deeds, horry county deed search, horry county deed search by name, horry county deeds, horry county deed book search, horry county plat search, horry county lien search, horry county property fraud alert, horry county register of deeds recording fees, copy of deed horry county, georgetown county deed search",
  about: "Land records at the Horry County Register of Deeds, Horry County, South Carolina",
});
