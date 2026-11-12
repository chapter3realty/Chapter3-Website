/* /hoa/south-carolina-hoa-laws/ - South Carolina's HOA laws: the three state laws and what each one says, the
 * rules an HOA cannot enforce, what the law says on fines, foreclosure, dues, rentals and turnover (one answer and a
 * link each; the sibling pages own the detail), records and meetings, who enforces the law, how to file a
 * complaint and how Horry County's 416 complaints ended, and the bills before the legislature.
 *
 * Batch 2026-11-b, Lane U. Version 1, 2026-11-10. The live page was hand-made (no spec); this is its first spec.
 * Plan: Blog-Brain batches/2026-11-b/hoa-south-carolina-hoa-laws/PLAN.md. Demand: must-answer.md.
 * Facts: facts.md, VERIFIED rows and CORRECTED rows at the verifier's wording only (VERIFY.md; struck wording in
 * batches/2026-11-b/facts/hoa-south-carolina-hoa-laws-struck.json). Each block names its ledger rows.
 * Data: data/2026-11-b/hoa-south-carolina-hoa-laws/chart-complaint-outcomes.json and chart-what-owners-want.json
 * (SC Consumer Affairs' workbooks, our count; build_charts.py, whose title and "dropped" label were fixed to the
 * verifier's rows 20 and 21 and re-run). Every chart and count in the copy is read from those files.
 * Kept from the live page: the search words "South Carolina HOA laws", the Act's provisions (now rows of the
 * question table), "no agency will overturn your HOA's decision" in its spirit (section 6, at row 14's words), the voluntary
 * mediation quote, the statewide outcomes, what complainants recommend, the FAQ on the Act, who regulates HOAs,
 * complaining to the state, recording and seller disclosure, "Ask us about a community", the end band's line,
 * the legal notice (shorter, no date).
 * Cut: "Verified July 2026", "the honest answer matters", "Which is precisely why", the FAQ on budget notice
 * (one row and a link to /hoa/dues-increases/, which owns it).
 * Sibling owners (must-answer.md): fines (violations-and-fines), foreclosure and the bills' detail
 * (liens-and-foreclosure), dues (dues-increases), reserves, special assessments, rentals (rental-restrictions),
 * turnover (developer-control-turnover), the buyer's papers and the 2019 chart (documents), HOA vs POA, the fee and
 * "can I refuse to join" (/hoa/). This page owns the law itself, who enforces it and the complaint process.
 * No homes strip in the body: the site's edge already puts its no-HOA feed for this URL under the opening
 * (idx-lib/feeds.js NO_HOA). A second no-HOA strip would repeat it. BUILD.md asks the lead for a bolder title.
 * Photo: the State House in Columbia, under the sentence on the bills (photos.json). The Government and Justice
 * Center in Conway stays on /hoa/liens-and-foreclosure/, which owns it. The share image is this page's own card.
 * Fix round 1 (REVIEW-1.md): the "Can an HOA fine you ..." section repeated five table rows. It is gone; its two
 * facts the table lacked are in the fines and foreclosure rows, and the three-state comparison is its own H2.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/south-carolina-hoa-laws/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "hoa-south-carolina-hoa-laws");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const OUT = read("chart-complaint-outcomes.json"), WANT = read("chart-what-owners-want.json");
const must = (ok, msg) => { if (!ok) throw new Error(`south-carolina-hoa-laws.js: ${msg}`); };
const n = (v) => Math.round(v).toLocaleString("en-US");

/* ---------------------------------------------------------------------------- */
/* The facts, read from the data and checked against the ledger.                  */

/* Row 20 (CORRECTED): how the state closed 416 Horry County complaints, 2022 to 2025. */
must(OUT.n === 416, "row 20: 416 complaints");
const ROWS = OUT.rows.map((r) => r.count);
must(ROWS.join() === [269, 101, 19, 15, 10, 2].join(), `row 20 counts changed: ${ROWS.join()}`);
must(OUT.median_days_to_close === 33 && OUT.n_with_days === 402, "row 20: 33 days, 402 with both dates");
must(!OUT.rows.some((r) => /dropped/i.test(r.label)), "chart-complaint-outcomes.json still says 'dropped' (row 20)");
const SATISFIED = OUT.rows[4].count;
/* Row 21 (CORRECTED): what the 416 complaints said should change in the papers, and who should enforce them. */
must(WANT.n === 416 && !/asked the state/i.test(WANT.title), "chart-what-owners-want.json still says 'asked the state' (row 21)");
const CH = WANT.change_the_rules, EN = WANT.who_should_enforce;
must(CH.map((r) => r.count).join() === "171,124,84,77", "row 21 change counts changed");
must(EN[0].count === 210 && EN[1].count === 183, "row 21 enforce counts changed");

/* ---------------------------------------------------------------------------- */
/* The pictures and lists.                                                        */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";

/* Table 1, the page's main visual: each question an owner or buyer asks, what South Carolina law says, and the
   page that answers it in full. Plain words; one section number a row at most. */
const LAW = [
  /* rows 7, 8 */ ["Do the HOA's papers have to be recorded?", "Yes. The papers count only once they are recorded at the county. A new rule must be recorded by January 10 of the next year.", "27-30-130", [["#unenforceable", "Unenforceable rules"], ["/hoa/documents/", "HOA documents"]]],
  /* row 9 */ ["Does the HOA have to give notice before raising the budget?", "48 hours' notice of the vote, unless the HOA is a nonprofit. A nonprofit HOA follows its bylaws.", "27-30-140", [["/hoa/dues-increases/", "Dues increases"]]],
  /* rows 10, 11 */ ["Can owners see the HOA's records?", "Yes. The budget and owner list, and more if the HOA is a nonprofit. In a condo, the account book too.", "27-30-150", [["#records", "Records and meetings"]]],
  /* rows 31, 32 */ ["Must board meetings be open to owners?", "No state law requires it. A nonprofit HOA must hold an owners' meeting once a year.", "33-31-701", [["#records", "Records and meetings"]]],
  /* rows 24, 25 */ ["Is there a cap on HOA fines?", "No. Neither the HOA Act nor the condo law caps fines or says a hearing must come before one. Whether a fine can become a lien depends on the papers.", "", [["/hoa/violations-and-fines/", "Violations and fines"]]],
  /* rows 26, 27 */ ["Can the HOA foreclose?", "Yes, through the court. A condo's lien is in the condo law. A neighborhood's is in its recorded papers.", "27-31-210", [["/hoa/liens-and-foreclosure/", "Liens and foreclosure"]]],
  /* rows 24, 33, 34 */ ["Is there a cap on dues or special assessments?", "No. State law also requires no reserve fund.", "", [["/hoa/special-assessments/", "Special assessments"], ["/hoa/reserves/", "Reserves"]]],
  /* rows 35, 36 */ ["Can the HOA ban rentals?", "Yes, if its recorded papers say so. State law has no limit on rental rules, and no rule that exempts earlier buyers.", "27-31-100", [["/hoa/rental-restrictions/", "Rental restrictions"]]],
  /* row 40 */ ["When must the developer hand the HOA to the owners?", "There is no deadline in state law.", "", [["/hoa/developer-control-turnover/", "Developer turnover"]]],
  /* row 39 */ ["Can the HOA ban the U.S. flag?", "Not one portable, removable U.S. flag, shown in a respectful manner.", "27-1-60", [["#unenforceable", "Unenforceable rules"]]],
  /* row 13 */ ["Who takes complaints about an HOA?", "Consumer Affairs records them and sends each one to the HOA. The law bars it from acting as a referee.", "27-30-340", [["#complaint", "Complaints"]]],
  /* row 12 */ ["Where can a money dispute go?", "Magistrate court, for $7,500 or less.", "27-30-160", [["#who-enforces", "Who enforces"]]],
];
const LAW_TABLE = `<div class="c3-sl-tab c3-sl-law"><table><caption>South Carolina HOA law, question by question</caption>`
  + `<thead><tr><th scope="col">Question</th><th scope="col">What South Carolina law says</th><th scope="col">Read more</th></tr></thead><tbody>`
  + LAW.map(([q, a, sec, links]) => `<tr><th scope="row">${q}</th><td>${a}${sec ? ` <span class="sec">SC Code ${sec}</span>` : ""}</td>`
    + `<td class="more"><span class="l">Read more</span>${links.map(([u, t]) => h.a(u, t)).join("")}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* Table 2 (rows 24, 43, 44): fines in three states, for buyers who move here from North Carolina and Florida. */
const STATES = [
  ["South Carolina", "None in the HOA Act or the condo law", "Not required by either law"],
  ["North Carolina", "Up to $100 for the violation, and up to $100 for each day it goes on more than five days after the decision", "Yes, unless the declaration has its own process. If a panel made the decision, the owner may appeal to the full board within 15 days."],
  ["Florida", "$100 a violation, and $1,000 in all for one that goes on, unless the papers say otherwise. A fine under $1,000 cannot become a lien.", "Yes, with 14 days' written notice. The hearing is before a committee of at least three members who are not officers, directors or employees of the association, or their close relatives."],
];
const STATES_TABLE = `<div class="c3-sl-tab c3-sl-states"><table><caption>HOA fines in three states</caption>`
  + `<thead><tr><th scope="col">State</th><th scope="col">Cap on a fine</th><th scope="col">Hearing before a fine</th></tr></thead><tbody>`
  + STATES.map(([s, c, hr]) => `<tr><th scope="row">${s}</th><td><span class="l">Cap on a fine</span>${c}</td><td><span class="l">Hearing before a fine</span>${hr}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* Bold lines under thin rules. */
const rules = (items, one = true) => `<ul class="c3-sl-rules${one ? " c3-sl-one" : ""}">` + items.map(([b, t]) => `<li><strong>${b}</strong><span>${t}</span></li>`).join("") + `</ul>`;
const steps = (items) => `<ol class="c3-sl-steps">` + items.map(([b, t]) => `<li><strong>${b}</strong><span>${t}</span></li>`).join("") + `</ol>`;

/* Chart 1 (row 20, CORRECTED): how the state closed Horry County's 416 complaints. */
const OUT_NAMES = ["The HOA answered every point", "Facts in dispute, left undecided", "The HOA never answered", "Still open when the report was made", "The owner was satisfied", "The owner did not send what the state asked for"];
must(OUT_NAMES.length === OUT.rows.length, "one name per outcome");
/* Drawn twice, at the width it shows at, so its words stay 14 to 16 px (as master-insurance-ho6.js): a phone one
   (viewBox 360, up to 599 px; each label above its bar) and a wide one (viewBox 640, from 600 px; the label left of
   its bar). One message: the owner-satisfied bar is brass, the rest are gray. */
const outSvg = (W, cls) => {
  const narrow = W < 400, fs = 15, max = Math.max(...ROWS);
  const lw = narrow ? 0 : 372, vw = 46, bw = W - lw - vw - 8, rh = narrow ? 52 : 34, top = 4;
  const H = top + OUT.rows.length * rh + 2;
  const o = OUT.rows.map((r, i) => {
    const y = top + i * rh, sat = i === 4, len = Math.max(4, r.count / max * bw);
    const by = narrow ? y + 24 : y + 8, bh = 16;
    const lab = `<text x="0" y="${narrow ? y + 15 : y + 21}" font-size="${fs}" fill="#1c2028"${sat ? ' font-weight="700"' : ""}>${OUT_NAMES[i]}</text>`;
    return lab + `<rect x="${lw}" y="${by}" width="${len.toFixed(1)}" height="${bh}" rx="8" fill="${sat ? "#c4783a" : "#a7b0ba"}"/>`
      + `<text x="${(lw + len + 8).toFixed(1)}" y="${by + 13}" font-size="${fs}" font-weight="700" fill="${sat ? "#8a5226" : "#1c2028"}">${n(r.count)}</text>`;
  }).join("");
  const label = `Bar chart of how SC Consumer Affairs closed ${n(OUT.n)} Horry County HOA complaints. ` + OUT.rows.map((r, i) => `${OUT_NAMES[i]}: ${n(r.count)}`).join(". ") + ".";
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" style="font-family:var(--sans),system-ui,sans-serif">${o}</svg>`;
};
const OUT_CHART = `<figure class="c3-sl-fig"><p class="cap">Only ${SATISFIED} of ${n(OUT.n)} Horry County HOA complaints ended with the owner satisfied</p>${outSvg(360, "kn")}${outSvg(640, "kw")}`
  + `<figcaption>Our count of SC Consumer Affairs' complaint files for Horry County, 2022 to 2025. "The HOA answered every point" is the state's "adequate business response". It means the HOA answered every point and named a policy that backs it, whether or not the owner was satisfied. The middle complaint took ${OUT.median_days_to_close} days to close.</figcaption></figure>`;

/* Chart 2 (row 21, CORRECTED): what the 416 complaints said should change in the HOA's papers. Each bar links the
   page that covers the topic; open meetings links to this page's records and meetings section. */
const WANT_NAMES = { "Open meetings and notice": ["Open meetings and notice", "#records"], "Rules for viewing and copying records": ["Rules for seeing and copying records", "/hoa/documents/"],
  "Forbid liens and foreclosure": ["A ban on HOA liens and foreclosure", "/hoa/liens-and-foreclosure/"], "Set or change developer turnover": ["Rules for developer turnover", "/hoa/developer-control-turnover/"] };
const WANT_CHART = G.bars(CH.map((r) => { const w = WANT_NAMES[r.label]; must(w, `no name for ${r.label}`); return { name: w[0], href: w[1], value: r.count, valueText: `${n(r.count)} of ${n(WANT.n)}` }; }), {
  caption: "The change Horry County HOA complaints named most: open meetings",
  nameLabel: "Change to the HOA's papers", valueLabel: "Complaints", compact: true,
  note: `Our count of ${n(WANT.n)} Horry County complaints to SC Consumer Affairs, 2022 to 2025. A complaint could name more than one change. Each topic links to the page that covers it.`,
});

/* ---------------------------------------------------------------------------- */
/* Design: the approved 2026-11-08 treatment (garden-city.js, hoa.js, master-insurance-ho6.js): the italic line   */
/* at about half the H1's size, key facts as short rows under rules on a phone, one card style for charts and    */
/* offers, plain tables and lists under thin rules, one block width of 720 px.                                    */

const DESIGN_CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:minmax(0,1fr)!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}${S} .c3-glance li>span:last-child{display:flex;flex-direction:column;gap:.05rem;flex:1;min-width:0}${S} .c3-glance strong{font-size:1rem!important}}`
  + `${S} h2{text-wrap:balance}`
  /* The plain tables: thin rules, no card. On a phone each row is its question, then its cells with small labels. */
  + `${S} .c3-sl-tab{max-width:720px;margin:1.2rem 0 1.4rem}${S} .c3-sl-tab table{width:100%;border-collapse:collapse;font-family:var(--sans);color:var(--navy);font-size:1rem}`
  + `${S} .c3-sl-tab caption{text-align:left;font-weight:650;font-size:1.0625rem;line-height:1.4;padding:0 0 .6rem;color:var(--navy)}`
  + `${S} .c3-sl-tab th,${S} .c3-sl-tab td{text-align:left;vertical-align:top;padding:.65rem .9rem .65rem 0;border-bottom:${RULE};line-height:1.45}`
  + `${S} .c3-sl-tab thead th{font-size:.95rem;font-weight:600;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .c3-sl-tab tbody th{font-weight:600}${S} .c3-sl-tab td{color:var(--navy)}${S} .c3-sl-tab td .l{display:none}`
  + `${S} .c3-sl-tab tbody tr:last-child>*{border-bottom:0}`
  + `${S} .c3-sl-law tbody th{width:30%}${S} .c3-sl-law td.more{width:21%;font-size:.95rem}${S} .c3-sl-law td.more a{display:block;margin-bottom:.45rem}${S} .c3-sl-law .sec{display:block;margin-top:.2rem;font-size:.875rem;color:var(--muted)}`
  + `${S} .c3-sl-states tbody th{width:20%}`
  + `@media (max-width:599px){${S} .c3-sl-tab table,${S} .c3-sl-tab tbody,${S} .c3-sl-tab caption{display:block;width:100%}${S} .c3-sl-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .c3-sl-tab tr{display:grid;grid-template-columns:minmax(0,1fr);row-gap:.35rem;padding:.75rem 0;border-bottom:${RULE}}${S} .c3-sl-tab tbody tr:last-child{border-bottom:0}`
  + `${S} .c3-sl-tab th,${S} .c3-sl-tab td{border:0;padding:0;width:auto!important}`
  + `${S} .c3-sl-tab td .l{display:block;font-size:.875rem;color:var(--muted);margin-bottom:.05rem}${S} .c3-sl-law td.more .l{display:inline;margin-right:.4rem}${S} .c3-sl-law td.more a{display:inline-block;margin:0 1rem 0 0}}`
  /* The outcomes chart: the drawing in the chart card (the same card as the glass bars). */
  + `${S} figure.c3-sl-fig{max-width:720px;margin:1.4rem 0 1.4rem;padding:1.05rem 1.15rem .95rem;border-radius:18px;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 18px 40px -26px rgba(28,32,40,.45)}`
  + `${S} figure.c3-sl-fig .cap{font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.0625rem;line-height:1.4;margin:0 0 .8rem}`
  + `${S} figure.c3-sl-fig svg{display:block;width:100%;height:auto}${S} figure.c3-sl-fig svg.kn{max-width:400px}${S} figure.c3-sl-fig svg.kw{display:none;max-width:640px}`
  + `@media (min-width:600px){${S} figure.c3-sl-fig svg.kn{display:none}${S} figure.c3-sl-fig svg.kw{display:block}}`
  + `@media (max-width:599px){${S} figure.c3-sl-fig{padding:.9rem .8rem .8rem}}`
  + `${S} figure.c3-sl-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.7rem}`
  /* Bold lines under thin rules; on a wide screen the label sits left of its text. */
  + `${S} .c3-sl-rules,${S} .c3-sl-steps{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px}`
  + `${S} .c3-sl-rules li,${S} .c3-sl-steps li{margin:0;padding:.7rem 0 .75rem;border-top:${RULE};color:var(--muted);line-height:1.6}${S} .c3-sl-rules li:last-child,${S} .c3-sl-steps li:last-child{border-bottom:${RULE}}`
  + `${S} .c3-sl-rules strong,${S} .c3-sl-steps strong{display:block;color:var(--navy);font-weight:650}`
  + `@media (min-width:760px){${S} .c3-sl-one li{display:grid;grid-template-columns:13rem 1fr;column-gap:1.4rem}}`
  /* The numbered steps: the number in a small brass circle beside each step. */
  + `${S} .c3-sl-steps{counter-reset:slstep}${S} .c3-sl-steps li{counter-increment:slstep;display:grid;grid-template-columns:2.1rem 1fr;column-gap:.8rem}`
  + `${S} .c3-sl-steps li::before{content:counter(slstep);grid-row:1/span 2;width:1.8rem;height:1.8rem;border-radius:50%;border:1.5px solid var(--brass);color:var(--g-ink,#8a5226);font-family:var(--sans);font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center;margin-top:.05rem}`
  + `${S} .c3-sl-steps strong,${S} .c3-sl-steps span{grid-column:2}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The end band (the same fix as garden-city.js and hoa.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  /* "On this page": no card, in columns between two thin rules (as hoa.js). */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* One block width. */
  + `${S} .c3-gchart,${S} .c3-sl-fig,${S} .c3-sl-tab,${S} .c3-sl-rules,${S} .c3-sl-steps{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const T33_31 = "https://www.scstatehouse.gov/code/t33c031.php";
const T27_1 = "https://www.scstatehouse.gov/code/t27c001.php";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const T22_3 = "https://www.scstatehouse.gov/code/t22c003.php";
const HOAED = "https://consumer.sc.gov/hoa-ed";
const COMPLAIN = "https://consumer.sc.gov/consumer-resources/consumer-complaints";
const REPORT = "https://consumer.sc.gov/sites/consumer/files/Documents/HOA/2026_HOA_Complaint_Report.pdf";
const REPORTS = "https://www.consumer.sc.gov/HOA-reports";
const SOS = "https://businessfilings.sc.gov/BusinessFiling/Entity/Search";
const BILL = (b) => `https://www.scstatehouse.gov/sess126_2025-2026/bills/${b}`;
const NC = "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_47F/GS_47F-3-107.1.html";
const FL = "https://www.flsenate.gov/Laws/Statutes/2026/720.305";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const OP5525 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/5525.pdf";
const OP5312 = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/5312.pdf";
const SCBAR = "https://www.scbar.org/for-the-public/quicklinks/get-legal-help/";
const IRS = "https://www.irs.gov/statistics/soi-tax-stats-migration-data";

/* The photo (rules/images.md): the State House in Columbia, CC BY-SA 4.0 from Wikimedia Commons, with its license
   record in this page's photos.json. It sits under the sentence on the bills before the General Assembly, and its
   caption says only where the General Assembly meets. No crops: the source is under 1,200 px on its short side, so
   the share image stays this page's own card (tools/ogcard.js). */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("south-carolina-state-house-columbia", PHOTOS[0].caption);
const GENERIC_CREDIT = "Chapter3 Realty resized these photos and cropped some of them.";

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, and nothing on this page is legal advice. For advice on your own dispute, talk to a South Carolina attorney.</p>`;

/* ---------------------------------------------------------------------------- */
/* The offers. Each is tied to the question its section answered; no two share words. Every button goes to   */
/* /contact/, where the site opens its short pop-up and sends the button's words with the lead. Never an offer */
/* to settle a dispute or act for an owner against an HOA: Chapter3 is a brokerage.                            */

const TOP = { title: "Ask us about a community", label: "Ask us about a community", href: "/contact/" };
const END = {
  h2: "Buying into an association?",
  p: "We read the documents against how you plan to live, before you are committed.",
  label: "Have us read a community's papers", href: "/contact/",
};

/* ---------------------------------------------------------------------------- */
/* The FAQ: only questions the page answers above.                                */

const FAQ = [
  { q: "What is the South Carolina Homeowners Association Act?", a: "The HOA Act is a 2018 state law, SC Code Title 27, Chapter 30. It requires an HOA's papers to be recorded at the county to be enforced, and gives owners the budget and owner list. It lets magistrate court hear money disputes under the Act, and requires Consumer Affairs to record complaints. It has been changed once, in 2019." },
  { q: "Who regulates HOAs in South Carolina?", a: "No state agency enforces South Carolina's HOA Act. Consumer Affairs records complaints and sends each one to the HOA, and the law bars it from acting as a referee. An HOA that is a nonprofit files its papers with the Secretary of State. The rest is in each community's recorded papers." },
  { q: "Can I complain about my HOA to the state?", a: `Yes. File with SC Consumer Affairs online or by mail, with the HOA Supplemental Questionnaire. The agency sends the complaint to the HOA, but its process is voluntary mediation. Of ${n(OUT.n)} Horry County complaints from 2022 to 2025, ${SATISFIED} ended with the owner satisfied.` },
  { q: "Do HOA documents have to be recorded in South Carolina?", a: "Yes. Under the HOA Act, an HOA's governing papers must be recorded at the county's register of deeds to be enforceable. A new rule stays enforceable only if it is recorded by January 10 of the year after it was adopted." },
  { q: "Does a seller have to disclose an HOA in South Carolina?", a: "Yes, unless the sale is exempt. The seller fills in the state's disclosure form before the contract is signed. If the home is in an association, the form includes a one-page HOA addendum." },
  { q: "Can I sue my HOA in South Carolina?", a: "A money dispute under the HOA Act of $7,500 or less can go to magistrate court. For anything larger, or any other dispute, talk to a South Carolina attorney. The SC Bar's lawyer referral service is at 800-868-2284." },
  { q: "Is condo law different from HOA law in South Carolina?", a: "Yes. A condo follows the HOA Act and also the Horizontal Property Act, the state's condo law. The condo law puts a lien on a unit for unpaid assessments and opens the condo's account book to owners. It also requires a condo's founding papers to state any limits on leasing." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "South Carolina HOA Laws: What They Say and Who Enforces Them",
  description: "South Carolina HOA laws in one table: what the HOA Act, condo law and nonprofit law require, what they leave out, and how 416 Horry County complaints ended.",
  ogTitle: "South Carolina HOA laws: what the state requires, and what your HOA's papers say",
  crumb: "South Carolina HOA Law",
  eyebrow: "The HOA guide",
  h1: "South Carolina HOA laws:",
  h1em: "what the state requires, and what your HOA's papers say.",
  sub: "The three state laws, the rules they leave to each community's recorded papers, and how Horry County's 416 HOA complaints to the state ended.",
  heroMedia: glance([
    /* row 24 */ { icon: "dollar", label: "No cap on fines", text: "in the HOA Act or the condo law" },
    /* row 47 */ { icon: "calendar", label: "About 700", text: "association papers recorded in Horry County in the past 12 months" },
    /* row 20 */ { icon: "home", label: `${SATISFIED} of ${n(OUT.n)}`, text: "Horry County complaints ended with the owner satisfied" },
  ]),
  heroCta: TOP,
  topOfferLine: "Buying into an HOA? We read its recorded papers before you offer.",
  author: "devin",
  shortAnswer: [
    /* rows 1, 7, 12 */ `South Carolina has no one complete law on how an HOA must run. Under the 2018 HOA Act, an HOA's papers must be recorded at the county to be enforced, and money disputes up to $7,500 can go to magistrate court.`,
    /* rows 24, 35, 40, 13 */ `Fines, dues limits, rental rules and developer turnover are not in South Carolina HOA laws. Your community's recorded papers have those rules. Consumer Affairs records complaints, but the law bars it from acting as a referee.`,
  ],
  sections: [
    { h2: "What are South Carolina's HOA laws?", toc: "The laws", id: "laws", html: () =>
      DESIGN_CSS + ph.css() +
      /* row 2 */ h.p(`South Carolina's HOA laws are three state laws, plus the papers each community records at the county. Consumer Affairs lists the three: the HOA Act, the Nonprofit Corporation Act and the condo law.`) +
      h.p(`Each common question has its answer in one of them, or in your HOA's own papers:`) +
      LAW_TABLE },

    { h2: "Which South Carolina law applies to my HOA or condo?", toc: "Which applies", id: "which-law", html: () =>
      h.p(`The HOA Act applies to every HOA and condo whose owners must pay assessments. A nonprofit HOA also follows the Nonprofit Corporation Act, and a condo also follows the condo law.`) +
      rules([
        /* rows 5, 4 */ ["The HOA Act", `Every neighborhood or condo where recorded papers make owners pay assessments, except a timeshare. The HOA Act dates from 2018. It has been changed once, in 2019, when its definition of an HOA was edited where it leaves out timeshares.`],
        /* rows 2, 3 */ ["The Nonprofit Corporation Act", `An HOA that filed nonprofit papers with the Secretary of State also follows this law on meetings, notice, the board and records. Whether an HOA did shows in the ${h.ext(SOS, "Secretary of State's business name search")}.`],
        /* rows 2, 53 */ ["The condo law", `The Horizontal Property Act, from 1962, applies to condos. It says what a condo's founding papers and bylaws must include, how records are kept and how shared costs are split.`],
      ]) +
      /* row 6 */ h.p(`The HOA Act itself is short. It deals with five things: recording the papers, notice before a budget increase, the budget and owner list, magistrate court for money disputes, and complaints to Consumer Affairs.`) +
      h.p(`The HOA Act has no rule on late fees, fines, liens or foreclosure.`) +
      /* rows 5, 50 */ h.p(`A property owners association is an HOA under the Act if it meets the same test; our page on ${h.a("/hoa/hoa-vs-poa/", "HOA vs POA")} explains the names. An owner cannot opt out, because the recorded papers require each owner to pay. Our ${h.a("/hoa/", "HOA guide")} shows what the fees pay for.`) },

    { h2: "How do South Carolina's HOA laws compare with North Carolina and Florida?", toc: "Other states", id: "other-states", html: (bg) =>
      /* row 45 */ h.p(`Households moving to Horry County come most often from other South Carolina counties, then North Carolina, New York, New Jersey, Pennsylvania, Florida and Maryland. North Carolina and Florida both limit HOA fines in law:`) +
      /* rows 24, 43, 44 */ STATES_TABLE +
      h.p(`Florida's limits cover HOAs, not condos. North Carolina's cover planned communities.`) +
      /* row 55 */ h.cta("Moving here from another state? Have us read the papers against how you live", "The biggest mistake New York buyers make is not checking that the community's rules fit how they live: HOA rules on boats, golf carts, rentals and pools. We read them against your plans before you offer.", "Have us read the papers", "/contact/", bg) },

    { h2: "What HOA rules are unenforceable in South Carolina?", toc: "Unenforceable rules", id: "unenforceable", html: (bg) =>
      /* row 8 */ h.p(`An HOA rule is unenforceable in South Carolina if it was not recorded at the county by January 10 of the year after it was adopted or changed.`) +
      rules([
        /* row 8 */ ["A rule not recorded in time", "A rule takes effect when it is adopted. It stays enforceable only if it is recorded by January 10 of the next year. The HOA must give you a copy on request, unless it is posted in a common area or on its website."],
        /* row 7 */ ["Papers never recorded", "An HOA's governing papers must be recorded in the county where the property is to be enforceable."],
        /* row 38 */ ["An amendment without the vote", `A South Carolina appeals court ${h.ext(OP5312, "threw out an amendment")} to a subdivision's restrictions because it did not have the vote the restrictions required.`],
        /* row 39 */ ["A ban on the U.S. flag", "Whatever the papers say, an owner or tenant may display one portable, removable U.S. flag in a respectful manner, on the property they are entitled to use."],
        /* row 37 */ ["An unclear rule", `It can be read against the HOA. In a ${h.ext(OP5525, "Hilton Head rental case")}, the court took the reading that "least restricts the use of the property", and both sides agreed short-term renting was allowed. Our page on ${h.a("/hoa/rental-restrictions/", "HOA rental restrictions")} tells the story.`],
      ]) +
      /* row 48 */ h.p(`Horry County's ${h.ext(DEEDS, "index of recorded papers")} is online, and copies come from the Register of Deeds in Conway. Our page on ${h.a("/hoa/documents/", "HOA documents before you buy")} shows which papers to get.`) +
      h.cta("Have us pull a community's recorded rules before you offer", "Send us the community's name. We ask the seller for the papers and check the county's index for each rule's recording, so you know which rules count.", "Have us pull the recorded rules", "/contact/", bg) },

    { h2: "Can I see my HOA's records and go to its meetings?", toc: "Records and meetings", id: "records", html: () =>
      h.p(`Yes to the records. A nonprofit HOA must also hold an owners' meeting each year, but owners have no right under state law to attend board meetings.`) +
      h.h3("The records you can see") +
      rules([
        /* row 10 */ ["An HOA that is not a nonprofit", "Its yearly budget and owner list."],
        /* row 10 */ ["A nonprofit HOA", "Its articles, bylaws, minutes of owners' meetings and three years of financial statements. You can inspect and copy them with written notice five business days ahead, paying only for copies."],
        /* row 11 */ ["A condo", "The board must keep a dated book of every receipt and expense. It is open to all owners at set hours on working days."],
      ]) +
      h.h3("The meetings you can go to") +
      rules([
        /* row 31 */ ["A yearly owners' meeting", "A nonprofit HOA must hold one each year. Notice 10 to 60 days ahead is fair under the law, or 30 to 60 days if it is not sent first class or registered."],
        /* row 31 */ ["A special meeting", "Owners with at least 5 percent of the votes can demand one."],
        /* rows 31, 32 */ ["Board meetings", "The Nonprofit Corporation Act's notice rules for board meetings are about notice to directors. Owners have no right under it to notice of a board meeting, and no right under any of the three laws to attend one. Bylaws can give both."],
        /* row 30 */ ["A condo owners' vote", "Decisions need a majority of at least 51 percent, counted by the units' value percentages. Changing the system of running the building takes owners with two-thirds of the value."],
      ]) +
      /* row 41 */ h.p(`When you buy, the seller must tell you about the HOA. Unless the sale is exempt, the seller fills in the state's disclosure form before the contract is signed. If the home is in an association, that includes a one-page HOA addendum.`) +
      h.p(`Our page on ${h.a("/hoa/documents/", "what to check in HOA documents")} lists the papers we get from the seller.`) },

    { h2: "Who enforces South Carolina HOA law?", toc: "Who enforces", id: "who-enforces", html: () =>
      /* rows 13, 14 */ h.p(`No state agency enforces South Carolina's HOA Act. In its own words, Consumer Affairs "does not administer or enforce" the Act. It records each complaint and sends it to the HOA.`) +
      h.p(`The law bars Consumer Affairs from issuing rules on how an HOA is run, and from acting as a referee in a dispute. Its complaint process is voluntary mediation. It cannot make an HOA or an owner take part, require an outcome or arbitrate.`) +
      h.h3("Where an owner can take a dispute") +
      rules([
        /* row 12 */ ["Magistrate court", "A money dispute under the HOA Act of $7,500 or less can go to magistrate court."],
        /* row 29 */ ["The condo law", "In a condo, the board, or an owner who is harmed, can sue an owner who breaks the bylaws or the recorded restrictions, for damages or a court order."],
        /* row 51 */ ["A lawyer", `The ${h.ext(SCBAR, "SC Bar")} runs a lawyer referral service, at 800-868-2284.`],
      ]) },

    { h2: "How do I file an HOA complaint in South Carolina?", toc: "Complaints", id: "complaint", html: (bg) =>
      h.p(`File an HOA complaint with the SC Department of Consumer Affairs, online or by mail, and send the HOA Supplemental Questionnaire with it.`) +
      steps([
        /* row 52 */ ["Raise it with the board first", "Talk with the board, and check your HOA's papers for a dispute process. That is Consumer Affairs' first advice. 98 percent of those who filed in 2025 said they had raised the issue with the HOA or its management company first."],
        /* row 15 */ ["File online or by mail", `Use Consumer Affairs' ${h.ext(COMPLAIN, "online complaint portal")}, or mail the paper form to PO Box 5757, Columbia, SC 29250. The online form times out after 30 minutes.`],
        /* rows 15, 16 */ ["Send the HOA Supplemental Questionnaire", "Consumer Affairs requires it. In the same year, 78 complaints were closed and left out of its report because the owner did not send it. Questions go to hoahelp@scconsumer.gov or (800) 922-1594, toll free in South Carolina."],
        /* rows 13, 14 */ ["Consumer Affairs sends it to the HOA", "The HOA may answer. The agency cannot make it take part."],
        /* row 17 */ ["The complaint is closed", "Consumer Affairs closes it and counts it in its yearly report. It says the data helps lawmakers decide if the law needs to change."],
      ]) +
      /* row 19 */ h.p(`Horry County leads the state. In 2025, 140 of the 452 HOA complaints in the state's yearly report, 31 percent, were about associations in Horry County. That is the most of any county.`) +
      /* row 20 */ h.p(`We counted how the state closed Horry County's ${n(OUT.n)} complaints over four years, 2022 to 2025:`) +
      OUT_CHART +
      h.cta("Done with HOA boards? We find homes with no HOA", "Tell us the area and your price. We send you homes for sale with no HOA fee.", "Send me homes with no HOA", "/contact/", bg) +
      h.p(`Our page on ${h.a("/buyers/no-hoa-homes/", "homes with no HOA near Myrtle Beach")} shows the areas where they are.`) },

    { h2: "Is South Carolina changing its HOA laws?", toc: "Changes", id: "changes", html: () =>
      /* row 42 */ h.p(`Not yet. None of the five HOA bills below, from the 2025-2026 session, has become law.`) +
      PHOTO +
      h.h3("Five HOA bills from the 2025-2026 session") +
      /* row 42 */ rules([
        [h.ext(BILL(3447), "H. 3447"), "A court hearing before an HOA foreclosure sale. Passed the House 110 to 2; now in the Senate Judiciary Committee."],
        [h.ext(BILL(903), "S. 903"), "Would count rules as governing documents, hold them all to the January 10 recording rule, and from 2027 require them to be witnessed and acknowledged to be recorded. Passed the Senate 39 to 0; now in a House committee."],
        [h.ext(BILL(366), "S. 366"), "Would void foreclosure clauses in HOA papers. In the Senate Judiciary Committee."],
        [h.ext(BILL(3350), "H. 3350"), "Would require a dispute process inside every HOA, and let magistrate court hear all matters between an owner and an HOA. In the House."],
        [h.ext(BILL(5204), "H. 5204"), "Would require a seller packet, and a minimum debt, notice and mediation before foreclosure. In a House committee."],
      ]) +
      h.p(`Our page on ${h.a("/hoa/liens-and-foreclosure/", "HOA foreclosure in South Carolina")} has more on the foreclosure bills.`) +
      h.h3("What Horry County complaints would change") +
      /* row 21 */ h.p(`When they file, owners must say what they would change in their HOA's papers and how the papers should be enforced. Of ${n(WANT.n)} Horry County complaints, ${n(CH[0].count)} named open meetings and notice rules.`) +
      WANT_CHART +
      /* rows 21, 22 */ h.p(`On enforcement, ${n(EN[0].count)} of the ${n(WANT.n)} named state agency oversight, and ${n(EN[1].count)} named a dispute process inside the HOA.`) +
      h.p(`Statewide, in the state's latest report, state agency oversight was also the top choice for enforcing the papers, at 31 percent of all recommendations.`) },
  ],
  faqTitle: "South Carolina HOA law FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-30", href: T27_30 },
    { name: "27-31", href: T27_31 },
    { name: "33-31", href: T33_31 },
    { name: "27-1-60", href: T27_1 },
    { name: "27-50", href: T27_50 },
    { name: "22-3", href: T22_3 },
    { name: "SCDCA HOA page", href: HOAED },
    { name: "SCDCA complaints", href: COMPLAIN },
    { name: "SCDCA report", href: REPORT },
    { name: "SCDCA workbooks", href: REPORTS },
    { name: "SC business filings", href: SOS },
    { name: "Op. 5525", href: OP5525 },
    { name: "Op. 5312", href: OP5312 },
    { name: "H. 3447", href: BILL(3447) },
    { name: "S. 903", href: BILL(903) },
    { name: "S. 366", href: BILL(366) },
    { name: "H. 3350", href: BILL(3350) },
    { name: "H. 5204", href: BILL(5204) },
    { name: "NC 47F-3-107.1", href: NC },
    { name: "Fla. 720.305", href: FL },
    { name: "Horry deeds", href: DEEDS },
    { name: "SC Bar", href: SCBAR },
    { name: "IRS migration", href: IRS },
  ],
  sourcesNote: "Our counts: Horry County complaints in the SCDCA workbooks, 2022 to 2025, and the county's index of association papers.",
  afterSources: () => LEGAL + ph.credits().replace(GENERIC_CREDIT, ""),
  bottomCta: END,
  keywords: "South Carolina HOA laws, SC Homeowners Association Act, who regulates HOAs in South Carolina, SC HOA complaint, unenforceable HOA rules South Carolina, South Carolina condo law, Horizontal Property Act, can I sue my HOA in South Carolina, HOA records and meetings South Carolina, Horry County HOA complaints",
  about: "South Carolina homeowners association law: the Homeowners Association Act, the Nonprofit Corporation Act and the Horizontal Property Act",
});
