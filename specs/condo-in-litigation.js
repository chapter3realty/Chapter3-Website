/* /buyers/condo-in-litigation/ - can you buy a condo in litigation in Myrtle Beach: what Fannie Mae, Freddie Mac and
 * FHA allow, the minor suits that do not count, the ways to pay that still work, how a suit is found, when a building
 * in a suit is a chance and when it is a warning, and how long the Grand Strand's condo suits in the court record ran.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made in July; this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/buyers-condo-in-litigation/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and
 * CORRECTED rows only in the verifier's wording (VERIFY.md). Struck wording:
 * batches/2026-11-b/facts/buyers-condo-in-litigation-struck.json.
 * Data, never typed: data/2026-11-b/buyers-condo-in-litigation/ (findings.json, chart-timeline.json), made by the
 * scripts in that folder from the Horry County parcel layer and the Chapter3 map API (counts only).
 * Rows used: 1 (CORRECTED), 2, 3 (CORRECTED), 4, 7, 8, 9 (verifier's limit), 10, 11, 12 (unquoted), 13, 14 (the safe
 * wording), 15, 16, 18 (federal suits are listed elsewhere), 20 (CORRECTED), 21 (CORRECTED), 22, 23 to 28, 29
 * (CORRECTED), 31, 32 (attributed), 33 (CORRECTED: no denominators), 35, 37.
 * Not on this page: the owner's July deal (row 36: not in stories/stories.json; owner question in BUILD.md), the
 * Renaissance Tower case's end (row 34, news only), court images (row 19), any rate, payment or down payment figure,
 * any person's name from a caption, any unit, address or value, and any view of a named building's loan status today.
 * Design, as /invest/non-warrantable-condos/, /invest/condotel-financing/ and /submarkets/garden-city/ (owner-approved
 * 2026-11-08): the italic line at about half the H1's size, one card style for the chart, the table frame and the
 * offers, plain lists under thin rules, one block width of 720 px, an offer after about every second section.
 * Owner, 2026-11-10: strip titles bold and personal and true; every request button links to /contact/ and the site
 * opens the short pop-up.
 * Homes: one strip in "When is a condo in litigation a good deal?" for a new place, myrtle-beach-condos (for the lead,
 * BUILD.md); until it exists the strip shows its pill.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/condo-in-litigation/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "buyers-condo-in-litigation");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), TL = read("chart-timeline.json");
const must = (ok, msg) => { if (!ok) throw new Error(`condo-in-litigation.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const day = (iso) => { const d = new Date(iso); must(!isNaN(d), `not a date: ${iso}`); return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }); };

/* ---- Row 21 (CORRECTED): condos for sale in the local MLS by year built. "Local MLS", never "Grand Strand". ---- */
must(F.condos_for_sale === 2860 && F.inside_8_years_built_2018_or_later === 73, "row 21 moved: re-read the verifier's counts");
const LIST_DAY = day(F.pulled_listings);
/* ---- Row 33 (CORRECTED): units whose last recorded deed is within the past year. No denominators on the page. ---- */
const CB = F.case_buildings;
const SOLD = {
  rt: CB["Renaissance Tower"].changed_hands_last_365_days,
  mn: CB["Magnolia North"].changed_hands_last_365_days,
  rw: CB["Riverwalk at Arrowhead Country Club"].changed_hands_last_365_days,
  wg: CB["Wedgewood (name match only, see README)"].changed_hands_last_365_days,
};
must(SOLD.rt === 51 && SOLD.mn === 37 && SOLD.rw === 23 && SOLD.wg === 8, "row 33 moved");
must(day(F.pulled_parcels) === LIST_DAY, "the parcel pull and the listing pull are no longer the same day: the sources line says \"that day\"");

/* ---- Rows 24 to 27, 29, 35: the case years, from chart-timeline.json. ---- */
const ROW = Object.fromEntries(TL.rows.map((r) => [r.building, r]));
const RW = ROW["Riverwalk at Arrowhead Country Club"], MN = ROW["Magnolia North"], WG = ROW.Wedgewood, RT = ROW["Renaissance Tower"];
const last = (r) => Math.max(...[r.appeal_decided, r.insurance_ruling].filter(Number.isFinite));
must(RW.suit_filed === 2003 && MN.suit_filed === 2003 && last(RW) === 2017 && last(MN) === 2017, "rows 26, 27 moved");
must(WG.suit_filed === 2018 && last(WG) === 2025 && WG.built.join() === "2000,2001", "row 29 moved");
must(RT.suit_filed === 2022 && RT.years_filing_to_last_ruling === null, "row 31: the Renaissance Tower case now has an end in the data file; row 34 is still not printable");
const SPAN = TL.rows.filter((r) => r.years_filing_to_last_ruling).map((r) => r.years_filing_to_last_ruling);
const MINY = Math.min(...SPAN), MAXY = Math.max(...SPAN);
must(MINY === 7 && MAXY === 14, "row 35 moved");
must(RW.trial === 2009 && MN.trial === 2009 && RW.appeal_decided === 2011 && MN.appeal_decided === 2012, "rows 24, 26 moved");

/* ---- The photo (record in data/2026-11-b/buyers-condo-in-litigation/photos.json: the USGS 2011 oblique aerial that
   /invest/condos/ and /invest/non-warrantable-condos/ show, public domain, looked at full size again for this page). It shows
   oceanfront condo towers with their pools behind the dunes, the kind of building this page's reader is buying into. None
   of the buildings in it is one the page names for a lawsuit. Its caption names no building and no year. ---- */
const TOWERS = PH.findPhoto(read("photos.json").photos, "myrtle-beach-condo-towers-2011");
const TOWERS_PHOTO = PH.heroPhoto(TOWERS, { alt: TOWERS.alt, caption: TOWERS.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
const CREDITS = PH.creditsList([{ photo: TOWERS, caption: "Oceanfront condo towers in Myrtle Beach" }]);

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const FRE = "https://guide.freddiemac.com/app/guide/section/5701.3";
const HUD = "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf";
const NEWREZ = "https://www.newrezwholesale.com/media/b0hbzabm/smart-product-project-checklist-3-2026.pdf";
const Q1076 = "https://www.usalliance.org/hubfs/assets/documents/forms/usalliance-condo-questionnaire.pdf";
const SCREC = "https://www.llr.sc.gov/re/recpdf/Updated_Property_Disclosure_Form.pdf";
const T15 = "https://www.scstatehouse.gov/code/t15c003.php";
const CLERK = "https://www.horrycountysc.gov/departments/clerk-of-court/";
const OP4888 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/4888.htm";
const OP4943 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/4943.htm";
const OP27698 = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/27698.pdf";
const OP6124 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/6124.pdf";
const RTC = "https://www.classaction.org/media/liberty-property-holdings-sc-llc-et-al-v-richardson-et-al.pdf";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const ASK = "/contact/";
const PHONE = "854.333.2135";

/* ---- V1: which ways to pay are allowed, by kind of lawsuit (rows 1, 3, 4, 9, 10, 14). Cells in words, no symbols.
   Every "Yes" assumes the lender finds the suit minor and not about safety or structure; the note under it says so.
   The FHA cell for a builder suit is "Usually not": HUD has no repairs-done exception, and a defect suit relates to the
   building's structure (row 10). ---- */
const LOANS = [
  ["The association sues an owner for unpaid dues", "Yes", "Yes", "Yes"],
  ["The insurer defends the suit, and insurance covers it", "Yes", "Yes", "Yes"],
  ["The association sues the builder over repairs already made", "Yes, if the lender finds it minor", "Usually not", "Yes"],
  ["A suit about the building's safety or structure", "No", "No", "Yes"],
];
const COLS = ["Conventional loan", "FHA loan", "Cash"];
const LOAN_TABLE = `<figure class="cl-card cl-tw"><table class="cl-tab"><caption>Which loans work, by kind of lawsuit</caption>`
  + `<thead><tr><th scope="col">Kind of lawsuit</th>${COLS.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`
  + LOANS.map(([k, ...cells]) => `<tr><th scope="row">${k}</th>${cells.map((c, i) => `<td class="${/^No|^Usually/.test(c) ? "no" : "yes"}"><span class="l">${COLS[i]}</span>${c}</td>`).join("")}</tr>`).join("")
  + `</tbody></table><figcaption>A conventional loan here means one sold to Fannie Mae or Freddie Mac. A "Yes" for a loan means the lender finds the suit minor and not about the building's safety or structure. Cash has no loan for these rules to govern; the risk of a large bill stays with you.</figcaption></figure>`;

/* ---- V2: the case timeline (rows 24 to 27, 29, 35), 2000 to 2026. One bar a case, from the year it was filed to the
   last ruling we read. Renaissance Tower is not drawn: its end is not printable (row 34). ---- */
const Y0 = 2000, Y1 = 2026, pos = (y) => Math.round((y - Y0) / (Y1 - Y0) * 1000) / 10;
const CASES = [
  { name: "Riverwalk at Arrowhead", r: RW, sub: `Sued ${RW.suit_filed}, jury verdict ${RW.trial}, last ruling ${last(RW)}` },
  { name: "Magnolia North", r: MN, sub: `Sued ${MN.suit_filed}, jury verdict ${MN.trial}, last ruling ${last(MN)}` },
  { name: "Wedgewood", r: WG, sub: `Sued ${WG.suit_filed}, last ruling ${last(WG)}` },
];
const TL_CAP = `Grand Strand condo lawsuits ran ${MINY} to ${MAXY} years`;
const TIMELINE = `<figure class="c3-gchart cl-tl"><div role="table" aria-label="${TL_CAP}"><span class="cap" aria-hidden="true">${TL_CAP}</span>`
  + `<div role="rowgroup" class="sr"><div role="row"><span role="columnheader">Condo complex and its years in court</span><span role="columnheader">Years from filing to the last ruling</span></div></div>`
  + `<div role="rowgroup">`
  + CASES.map((c) => `<div role="row"><span role="rowheader"><span class="n">${c.name}</span><span class="f">${c.sub}</span></span>`
    + `<span role="cell"><svg class="tk" role="img" aria-label="${c.name}: ${c.sub}, ${c.r.years_filing_to_last_ruling} years" viewBox="0 0 1000 14" preserveAspectRatio="none" focusable="false">`
    + `<rect x="0" y="0" width="1000" height="14" fill="rgba(28,32,40,.07)"/><rect x="${pos(c.r.suit_filed) * 10}" y="0" width="${(pos(last(c.r)) - pos(c.r.suit_filed)) * 10}" height="14" fill="#c4783a"/></svg>`
    + `<span class="v">${c.r.years_filing_to_last_ruling} years</span></span></div>`).join("")
  + `<div class="ax" aria-hidden="true"><span></span><span class="axt">${[2000, 2010, 2020].map((y) => `<i style="left:${pos(y)}%">${y}</i>`).join("")}</span></div>`
  + `</div></div><figcaption>Each bar runs from the year the association sued to the last court ruling we read. For Riverwalk and Magnolia North, the last ruling decided what the builder's insurer had to pay.</figcaption></figure>`;

/* ---- The page's own styles, as /invest/non-warrantable-condos/: one card style (the glass surface of the chart and the
   offers), lists on the page under thin rules. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 18px 40px -26px rgba(28,32,40,.45);border-radius:22px";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  + `${S} .c3-gchart,${S} .cl-card,${S} .cl-plain,${S} .c3-offer{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}${S} .c3-gchart .v{font-weight:600}`
  /* the loan table: the chart's card, plain rows under thin rules inside it */
  + `${S} .cl-card{${CARD};margin:1.5rem 0 1.8rem!important;padding:1.15rem 1.35rem 1.05rem!important}`
  + `${S} .cl-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .cl-tw caption{text-align:left;font-weight:600;font-size:1.1em;line-height:1.35;padding:0 0 .8rem}`
  + `${S} .cl-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom;line-height:1.3}`
  + `${S} .cl-tw tbody th{text-align:left;font-weight:500;padding:.65rem .9rem .65rem 0;border-bottom:${RULE};line-height:1.4;vertical-align:top;width:40%}`
  + `${S} .cl-tw td{padding:.65rem .8rem .65rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.4;font-weight:600}`
  + `${S} .cl-tw td.yes{color:#2f5d46}${S} .cl-tw td.no{color:${INK}}${S} .cl-tw td .l{display:none}`
  + `${S} .cl-tw tbody tr:last-child th,${S} .cl-tw tbody tr:last-child td{border-bottom:0}`
  + `${S} .cl-card figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.9rem 0 0!important;padding:0!important}`
  + `@media (min-width:600px){${S} .cl-tw td{width:20%}}`
  /* on a phone each row folds: the kind of suit, then the three answers under small labels */
  + `@media (max-width:599px){${S} .cl-card{padding:1rem 1rem .95rem!important}${S} .cl-tab,${S} .cl-tab tbody,${S} .cl-tab caption{display:block;width:100%}`
  + `${S} .cl-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .cl-tab tr{display:block;padding:.75rem 0;border-bottom:${RULE}}`
  + `${S} .cl-tab tbody tr:last-child{border-bottom:0}`
  + `${S} .cl-tab th,${S} .cl-tab td{display:block;border:0!important;padding:0!important;width:auto!important}`
  + `${S} .cl-tab tbody th{padding-bottom:.35rem!important;font-weight:600}`
  + `${S} .cl-tab td{display:grid!important;grid-template-columns:8.5rem minmax(0,1fr);column-gap:.6rem;padding:.12rem 0!important}`
  + `${S} .cl-tab td .l{display:block;font-size:.95rem;font-weight:400;color:var(--muted)}}`
  /* below 420 px the label column leaves too little room: each answer is one line of text, the label first */
  + `@media (max-width:419px){${S} .cl-tab td{display:block!important;padding:.15rem 0!important}${S} .cl-tab td .l{display:inline;font-size:1rem}${S} .cl-tab td .l::after{content:": "}}`
  /* the timeline: a track per case, a brass bar from the filing to the last ruling, the years at the end */
  + `${S} .cl-tl [role=rowheader] .f{display:block;font-size:.95rem;color:var(--muted);margin-top:.1rem}`
  + `${S} .cl-tl .tk{display:block;flex:1 1 auto;min-width:0;width:100%;height:.85rem;border-radius:999px;overflow:hidden}`
  + `${S} .cl-tl .v{flex:none;width:4.6rem;text-align:right}`
  + `${S} .cl-tl .ax{display:grid;grid-template-columns:minmax(0,1fr)}${S} .cl-tl .ax>span:first-child{display:none}`
  + `@media (min-width:700px){${S} .cl-tl [role=row],${S} .cl-tl .ax{grid-template-columns:minmax(0,15.5rem) minmax(0,1fr);column-gap:1.4rem}${S} .cl-tl .ax>span:first-child{display:block}}`
  + `${S} .cl-tl .axt{position:relative;display:block;height:1.2rem;margin-right:5.2rem;font-size:.875rem;color:var(--muted);font-style:normal}`
  + `${S} .cl-tl .axt i{position:absolute;top:0;transform:translateX(-50%);font-style:normal}${S} .cl-tl .axt i:first-child{transform:none}`
  + `@media (max-width:479px){${S} .cl-tl .axt i:nth-child(2){display:none}}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .cl-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .cl-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .cl-plain li:last-child{border-bottom:${RULE}}${S} .cl-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  + `${S} .cl-stat{display:flex;align-items:center;gap:1.1rem;padding:1rem 1.25rem}${S} .cl-stat .big{flex:none;font-family:var(--serif);font-size:3rem;line-height:1;color:${INK}}`
  + `${S} .cl-stat p{margin:0;color:var(--navy);font-family:var(--sans);font-size:1.0625rem;line-height:1.5;font-weight:500}`
  + `${S} .cl-disc{font-family:var(--sans);font-size:.95rem;line-height:1.6;color:var(--muted);max-width:640px;margin:.4rem 0 1.2rem;padding:.75rem 1rem;border-left:3px solid var(--brass);background:rgba(255,255,255,.45);border-radius:0 12px 12px 0}`
  + `${S} .hx-strip+.hx-fallback .c3-offer{margin:.6rem 0 1.6rem}`
  /* Work-arounds copied from /invest/non-warrantable-condos/: the feed's search row at 320 px, the header phone at
     1000 to 1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="cl-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
/* The approved wording and the disclosure, word for word as on /invest/condotel-financing/. */
const BRICKWOOD = "Chapter3 Realty Corp has a business relationship with BrickWood Mortgage (NMLS #189497). Because of this relationship, this referral may provide Chapter3 Realty a financial or other benefit. You are never required to use BrickWood. You are free to shop any lender.";
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage, not a lender or a law firm. Loan rules change, and the lender confirms the building and the unit. For advice on a lawsuit itself, ask an attorney.</p>`;

/* The homes strip (new place for the lead: myrtle-beach-condos). Its title is bold, personal and true: our building
   review on every condo purchase covers any lawsuit (row 37), and we do it before the offer (section 3). */
const STRIP = G.homes("myrtle-beach-condos", "Myrtle Beach", G.offer("Myrtle Beach", { label: "Get the condos for sale in Myrtle Beach" }),
  "Your Myrtle Beach condo, its building checked for lawsuits first");

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "Can you get an FHA loan on a condo in litigation?", a: "Not when the suit is about the building's safety, structure, livability or use, or carries a risk its insurance does not cover. For an FHA loan on one unit, such a suit still counts for 12 months after it ends." },
  { q: "Does a lawsuit against an owner for unpaid dues stop a condo loan?", a: "No. Fannie Mae and FHA do not count a suit the association brings to collect past-due dues or to foreclose on a unit." },
  { q: "Does the seller have to tell you the building is in a lawsuit?", a: "The state's disclosure form asks about common-area problems and special assessments, not about a lawsuit. We ask the association instead." },
  { q: "How long does condo litigation last?", a: `From ${MINY} to ${MAXY} years. In three Grand Strand condo cases we read in the court record, that was the time from the association's suit to the last ruling.` },
  { q: "Can you sell a condo that is in litigation?", a: "Yes. Your buyer will need cash or a loan made outside Fannie Mae's and FHA's rules, unless the suit is a minor kind. Units changed hands in the past year in every building on this page." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "Buying a Condo in Litigation in Myrtle Beach: When It's a Deal",
  description: "Can you buy or finance a Myrtle Beach condo in litigation? What Fannie Mae and FHA allow, which suits are minor, real Grand Strand cases, and when it is a deal.",
  ogTitle: "Buying a condo in litigation in Myrtle Beach: what Fannie Mae and FHA allow, real Grand Strand cases, and when it is a deal",
  crumb: "Condo in Litigation",
  eyebrow: "Condo lawsuits",
  h1: "Can you buy a condo in litigation in Myrtle Beach?",
  h1em: "Yes. A building that has already made its repairs can be the best deal in Myrtle Beach.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: "You can still buy a Myrtle Beach condo in a building with a lawsuit, with cash or a loan made outside Fannie Mae's rules.",
  heroMedia: CSS + G.homesCss(),
  heroCta: { title: "Heard the building is in a lawsuit? We find out what it is about before you offer.", label: "Ask about a building", href: ASK },
  author: "devin",
  shortAnswer: [
    `Yes, you can buy a condo in a building that is in a lawsuit. Cash works, because the building rules of Fannie Mae, Freddie Mac and FHA apply to the loans they buy or insure. Most of those loans cannot be used while the suit runs, unless it is a minor kind.`,
    `A building that has already made the repairs it sued over can be a real chance. FHA loans usually cannot be used there, and a conventional loan works only after the lender finds the suit minor. That leaves fewer buyers to compete for each unit. A suit over a structural problem not yet repaired can mean a large bill for every owner.`,
  ],
  sections: [
    { h2: "Can you get a mortgage on a condo in litigation?", toc: "Getting a loan", id: "mortgage", html: (bg) =>
      h.p(`Usually you cannot use a conventional or FHA loan, unless the suit is minor. ${h.ext(FNMA, "Fannie Mae")} will not buy a loan on a unit in a building whose association is named in a pending lawsuit. The same goes when the developer is in a suit about the building's safety, structure, livability or use.`) +
      h.p(`The exception is a suit the lender finds minor, in one of the ways Fannie Mae's guide lists. ${h.ext(FRE, "Freddie Mac's rule")} is close to Fannie Mae's. Arbitration or mediation that is expected to become a lawsuit counts the same as a suit.`) +
      h.h3("Which lawsuits count as minor?") +
      h.p(`If the lender finds the suit touches none of the four things named above, these suits can be minor:`) +
      plain([
        ["The association sues an owner for unpaid dues", `Or it forecloses on a unit for them. Our ${h.a("/hoa/liens-and-foreclosure/", "guide to HOA liens and foreclosure")} covers those suits.`],
        ["The insurer defends it and pays", "The association's insurer has agreed to defend the suit, and the association's insurance covers the amount."],
        ["Small next to the savings", "The expected damages and legal costs are no more than 10 percent of the building's funded reserves, the money it has saved for repairs."],
        ["Repairs already made", "The association is suing to recover money for repairs already made, and losing would not hurt it."],
        ["Damage to one unit", "The suit is about damage to a single unit."],
        ["No money at stake", "A dispute between neighbors, for example, where no one is asking for money."],
      ]) +
      h.p(`A suit the association brings against the builder over defects is not minor while the repairs are still to be made.`) +
      h.h3("What does FHA allow?") +
      h.p(`${h.ext(HUD, "FHA")} turns down a building in a suit about the same four things as Fannie Mae's rule, or one with a risk the association's insurance does not cover. For an FHA loan on one unit, such a suit still counts for 12 months after it ends.`) +
      LOAN_TABLE +
      h.p(`A building can fail ${h.a("/invest/non-warrantable-condos/", "Fannie Mae's rules for a building")} for other reasons too, such as how many units are rentals.`) +
      h.cta("Told the building is in a lawsuit?", "We find out what the suit is about and tell you which loans can still be used, before you offer.", "Find out what the suit is about", ASK, bg) },

    { h2: "Which loans still work on a condo in litigation?", toc: "What still works", id: "what-works", html: () =>
      plain([
        ["Cash", "The building rules of Fannie Mae, Freddie Mac and FHA apply to the loans they buy or insure. A cash purchase has no such loan."],
        ["A loan kept outside Fannie Mae and Freddie Mac", "Some lenders keep a loan or sell it to other investors. Each writes its own building rules. One published program reviews lawsuits case by case, and will not consider one about the building's structure."],
      ]) +
      h.p(`For a suit about the structure, cash may be the only way to buy. Cash does not remove the risk. A large repair bill still comes to you as an owner, and your next buyer needs a loan too, unless they pay cash.`) +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit the building. How those loans work is in our ${h.a("/invest/condotel-financing/", "guide to condo loans outside Fannie Mae's rules")}.`) +
      `<p class="cl-disc">${BRICKWOOD}</p>` },

    { h2: "How do you find out if a condo is in litigation?", toc: "How we find out", id: "find-out", html: (bg) =>
      h.p(`We find out for you, before you make an offer. Our building review on every condo purchase covers any lawsuit. These papers show whether a building is in a suit, and why:`) +
      plain([
        ["The questionnaire lenders send", `It asks the association whether it is in a lawsuit, and asks for papers from its attorney. More on that form is in our ${h.a("/hoa/documents/", "guide to HOA documents")}.`],
        ["The attorney's letter", "For a suit the lender finds minor but whose cost is unknown, Freddie Mac asks for the complaint and a letter from the association's attorney. If the letter says insurance will likely not pay, the building fails Freddie Mac's rule."],
        ["What FHA asks", "To approve a building with a suit, FHA wants a signed explanation. It gives the reason, the risk, when the suit may end, whether insurance can pay, and what it does to the association's money."],
        ["The court record", `Horry County's court cases are listed in the state's public index, linked from the ${h.ext(CLERK, "Clerk of Court's page")}. A suit in federal court, like Renaissance Tower's, is listed elsewhere.`],
      ]) +
      h.p(`The seller's state form asks about common-area problems and special assessments, not about a lawsuit, so we ask the association.`) +
      h.cta("Send us the building's name.", "We find out whether its association is in a lawsuit, what the suit is about, and what it could cost you, before you offer.", "Ask about a building's lawsuits", ASK, bg) },

    { h2: "When is a condo in litigation a good deal?", toc: "When it is a deal", id: "good-deal", html: () =>
      h.p(`A building in a suit can be a good deal when its association is suing the builder for repairs it has already made. The building has been fixed, and the owners are trying to get back money they already spent. With most FHA buyers out while the suit runs, there is less competition for each unit.`) +
      TOWERS_PHOTO +
      plain([
        ["A chance: the builder is sued, and the repairs are done", "Before you offer, have a lender review the suit. If it finds the suit minor, a conventional loan can work there."],
        ["A warning: a structural problem not yet repaired", `A large repair bill may come to every owner as a special assessment. Our guide explains ${h.a("/hoa/special-assessments/", "how a special assessment is set")}.`],
        ["A warning: owners suing their own board", "In the Renaissance Tower case, owners sued the board members and the management company over repairs and the savings for them."],
      ]) +
      h.h3("Can a builder still be sued over an older building?") +
      h.p(`Yes, in some cases. A defect suit must be brought within three years of when the problem was or should have been found. For a building finished after mid-2005, the limit is eight years after completion; older buildings had 13.`) +
      h.p(`Neither limit protects a builder guilty of fraud, gross negligence or recklessness. A suit claiming gross negligence can come years later, as Wedgewood's did.`) +
      `<div class="cl-card cl-stat"><span class="big">${F.inside_8_years_built_2018_or_later}</span><p>condos in buildings built in 2018 or later were for sale in the local MLS on ${LIST_DAY}, out of ${n0(F.condos_for_sale)} in all.</p></div>` +
      h.p(`Most condos for sale here are in buildings past the usual time limit for a builder suit. A new builder suit is less likely there, but we still check the record for one before you offer.`) +
      STRIP },

    { h2: "How long does condo litigation last on the Grand Strand?", toc: "How long suits last", id: "how-long", html: (bg) =>
      h.p(`In the Grand Strand condo cases we read in the court record, ${MINY} to ${MAXY} years passed from the first filing to the last ruling. A suit just filed can run for years. A suit near its end can be worth waiting out.`) +
      TIMELINE +
      h.h3("Riverwalk at Arrowhead Country Club and Magnolia North") +
      h.p(`These two condo complexes in Myrtle Beach were built from 1997 to 2002. Both associations sued the builder in 2003. Juries found for both in 2009, and the Court of Appeals affirmed in 2011 and 2012.`) +
      h.p(`At trial, the associations' experts put Magnolia North's repairs at about $9.2 million, and the defense's experts at about $2.4 million. While a suit runs, no one knows the size of the bill.`) +
      h.p(`The builder had gone out of business in 2003. Whether its insurer had to pay the verdicts was decided by the state Supreme Court in 2017.`) +
      h.h3("Wedgewood") +
      h.p(`Wedgewood is a nine-building condo complex in Horry County, built from ${WG.built[0]} to ${WG.built[1]}. The association sued in ${WG.suit_filed}, about 17 years after it was built. A jury found gross negligence, which lifts the time limit, and the Court of Appeals affirmed in ${last(WG)}.`) +
      h.h3("Renaissance Tower") +
      h.p(`Renaissance Tower is a 21-story oceanfront condo building in Myrtle Beach. In October 2022, an engineer found it not structurally sound and ordered it evacuated. Owners sued in federal court that month.`) +
      h.p(`The owners' lawsuit says some owners could not sell, and some buyers backed out of contracts. It says owners faced an assessment of more than $2 million for the steel repairs, and the association had less than $1.3 million in ${h.a("/hoa/reserves/", "reserves")} in 2022.`) +
      `<div class="cl-card cl-stat"><span class="big">${SOLD.rt}</span><p>Renaissance Tower units changed hands in the past year, after the evacuation and the owners' suit.</p></div>` +
      h.p(`Units changed hands at the other three complexes too: ${SOLD.mn} at Magnolia North, ${SOLD.rw} at Riverwalk and ${SOLD.wg} at Wedgewood. A building with a suit in its past still sells.`) +
      h.cta("Want a building's court record before you offer?", "Tell us the building. We find out whether a suit is just starting or near its end, and what that means for your loan and your bill.", "Ask about one building", ASK, bg) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([TOWERS]) + LEGAL,
  /* The share card: tools/ogcard.js from the page's eyebrow and H1, moved into this page's images folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/buyers-condo-in-litigation/share.jpg",
  ogImageAlt: "Can you buy a condo in litigation in Myrtle Beach? Yes. A building that has already made its repairs can be the best deal in Myrtle Beach.",
  faqTitle: "Condo in litigation FAQ",
  faq: FAQ,
  sources: [
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
    { name: "Freddie Mac 5701.3", href: FRE },
    { name: "HUD 4000.1", href: HUD },
    { name: "Newrez checklist", href: NEWREZ },
    { name: "Questionnaire", href: Q1076 },
    { name: "SC disclosure", href: SCREC },
    { name: "SC Code 15-3", href: T15 },
    { name: "Clerk of Court", href: CLERK },
    { name: "Op. 4888", href: OP4888 },
    { name: "Op. 4943", href: OP4943 },
    { name: "Op. 27698", href: OP27698 },
    { name: "Op. 6124", href: OP6124 },
    { name: "Renaissance complaint", href: RTC },
    { name: "County parcels", href: PARCELS },
  ],
  sourcesNote: `Our counts: condos for sale in our listing feed on ${LIST_DAY}, by year built, in total. Units whose last deed came in the year before that day, from county parcels. Renaissance Tower figures are the owners' claims.`,
  bottomCta: { h2: "Found a condo in a building with a lawsuit?", p: `Call ${PHONE}, or send us the building. We tell you everything we find about a building before you risk a dollar.`, label: "Send us the building", href: ASK },
  keywords: "condo in litigation, buying a condo in litigation, condo litigation Myrtle Beach, Fannie Mae condo litigation, FHA condo litigation, Freddie Mac condo litigation, HOA in litigation, condo pending litigation, how long does condo litigation last",
  about: "Buying a condo in a building whose association is in a lawsuit: Fannie Mae, Freddie Mac and FHA rules, and condo lawsuits in Horry County, South Carolina",
});
