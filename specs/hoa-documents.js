/* /hoa/documents/ - what to look for in HOA documents before buying in South Carolina: the red flags a buyer in
 * any HOA pays for, the condo building's loan review, the papers to ask for and what each one tells you, what South
 * Carolina law does and does not hand a buyer (against Virginia, Maryland, Florida and North Carolina), what the
 * county keeps, how often association rules are filed here, when the papers arrive, and what happened to Horry
 * County owners who complained to the state.
 *
 * Batch 2026-11-a, Lane U. Version 2, 2026-11-04 (review round 1; REVIEW-1.md has each change). The live page was
 * hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-11-a/hoa-documents/facts.md, verified rows only, corrected rows only in the
 * verifier's wording (VERIFY.md), and rows 38 to 47 (carried from sibling ledgers in their verifiers' wording, or
 * VERIFIED-BY-FIXER, for the lead to re-check). Struck wording: hoa-documents-struck.json (no "the seller's one
 * duty", no rules "given to a member who asks" without the carve-out, no "for a conventional loan", no 15 percent
 * for Fannie Mae, no Maryland $250, no 716, 362 or 778, no "never received", no "the packet within 15 days").
 * Data, never typed (website working copy, data/2026-11-a/hoa-documents/, its README.md):
 *   chart-recorded.json    association papers filed as restrictions by year, January 2019, the last 12 months (rows 29, 30)
 *   chart-scdca.json       Horry County complainants to SC Consumer Affairs, 2022 to 2025 (rows 31 to 33)
 *   chart-states.json      the state comparison (rows 24 to 27); its Maryland "$250" is struck (row 25), so the
 *                          cards below carry the verifier's wording and the file is checked, not printed
 *   listings-counts.json   homes for sale with an association fee, counted in aggregate (row 1)
 *   photos.json            the one photo: houses and towers on one Myrtle Beach beach, USGS, public domain (the same files
 *                          as /buyers/common-mistakes/, copied to this page's image folder)
 * Round 1 cuts (owner's eye): the master deed drawing, the county card (1984, $64, hours), the courthouse photo, the
 * owner-rights cards, the year-by-year rules chart, the second hero subtitle. The courthouse photo is replaced by
 * one that makes the page's point: houses and towers on one beach (the condo building review, row 38).
 * Sibling owners: /hoa/reserves/ owns the reserve tests, /hoa/special-assessments/ the assessment, /hoa/estoppel-
 * and-transfer-fees/ the statement of amounts due, /hoa/liens-and-foreclosure/ the Winrose case and the lien.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/documents/";
const DIR = path.join(__dirname, "..", "data", "2026-11-a", "hoa-documents");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const REC = read("chart-recorded.json"), DCA = read("chart-scdca.json"), STATES = read("chart-states.json"), LIST = read("listings-counts.json").counts;

/* ---- Links ---- */
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const T33_31 = "https://www.scstatehouse.gov/code/t33c031.php";
const FORM = "https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf";
const ROD = "https://www.horrycountysc.gov/departments/register-of-deeds/";
const ROD_FORM = "https://www.horrycountysc.gov/media/t3wpam13/customer-service-request-form.pdf";
const INDEX = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const FNMA_PROJ = "https://selling-guide.fanniemae.com/sel/b4-2.1-01/general-information-project-standards";
const FNMA_REVIEW = "https://selling-guide.fanniemae.com/sel/b4-2.2-02/full-review-process";
const FNMA_INELIG = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const FREDDIE = "https://guide.freddiemac.com/app/guide/bulletin/2026-C";
const VA = "https://law.lis.virginia.gov/vacode/title55.1/chapter23.1/section55.1-2312/";
const MD = "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=11B-106";
const FL = "https://www.flsenate.gov/Laws/Statutes/2026/720.401";
const NC = "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_47C/GS_47C-4-109.html";
const SCDCA = "https://www.consumer.sc.gov/HOA-reports";
const H5204 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/5204.htm";
const WINROSE = "https://cases.justia.com/south-carolina/supreme-court/2019-27934.pdf";
const AR = "https://www.reservestudy.com/wp-content/uploads/2026/05/2026-04-29-100000-Industry-Insights-Report-FINAL.pdf";


/* ---- Row 1: homes for sale with an association fee (one pull; fractions, never counts). ---- */
const withFee = (t) => LIST[t].all - LIST[t].no_fee;
const ALL_N = ["condo", "townhouse", "house"].reduce((t, k) => t + LIST[k].all, 0);
const FEE_N = ["condo", "townhouse", "house"].reduce((t, k) => t + withFee(k), 0);
const share = (t) => withFee(t) / LIST[t].all;
if (Math.abs(FEE_N / ALL_N - 5 / 6) > 0.02) throw new Error("row 1: homes with a fee are no longer about 5 of 6");
if (share("condo") < 0.99 || Math.abs(share("townhouse") - 0.9) > 0.04 || Math.abs(share("house") - 0.7) > 0.03) throw new Error("row 1: the condo, townhouse or house share moved; rewrite the sentence");

/* ---- Row 29: the yearly counts the ledger verified. ---- */
const LEDGER29 = { 2012: 29, 2013: 45, 2014: 46, 2015: 46, 2016: 49, 2017: 57, 2018: 340, 2019: 861 };
const YEARS = REC.rows.filter((r) => r.year <= 2019);
for (const r of YEARS) if (r.all !== LEDGER29[r.year]) throw new Error(`chart-recorded.json ${r.year}: ${r.all}, the ledger says ${LEDGER29[r.year]}`);
const JAN19 = REC.rows.find((r) => r.year === 2019).january;
if (JAN19 !== 554) throw new Error("row 29: January 2019 is no longer 554");
const Y2017 = REC.rows.find((r) => r.year === 2017).all;
/* Row 30, the verifier's rounding: "about 700" papers, "about 400" rules and policies; 60 fine and 43 collection policies by title. */
const L12 = REC.last_12_months;
if (Math.abs(L12.all - 700) > 30 || Math.abs(L12["rules and policies"] - 400) > 15) throw new Error("row 30: no longer about 700 and about 400");

/* Three bars, one point: almost nothing before the 2018 law, a flood at its deadline, and a steady stream now. */
const RECORDED = G.bars([
  { name: "2017", value: Y2017, valueText: String(Y2017), feature: "the year before the HOA law" },
  { name: "January 2019", value: JAN19, valueText: String(JAN19), feature: "the month of the first deadline" },
  { name: "The last 12 months", value: 700, valueText: "about 700", feature: "about 400 of them rules", reference: true },
], { caption: "Association papers filed at the Horry County Register of Deeds", nameLabel: "When", featureLabel: "what it was", valueLabel: "papers filed",
  format: (v) => String(v), compact: true,
  note: `Our count of the county's index, papers filed as restrictions. The last 12 months run to October 2026.` });

/* ---- Rows 31, 32: Horry complainants, as two 100 percent bars. ---- */
const pct = (a, t) => Math.round(100 * a / t);
const GOT = DCA.got_documents, TOLD = DCA.told_of_association;
const GOT_T = GOT["Before purchase"] + GOT["After purchase"], TOLD_T = TOLD["Before Closing"] + TOLD["At Closing"] + TOLD["After Closing"];
if (GOT["After purchase"] !== 235 || GOT_T !== 359 || TOLD_T !== 372 || DCA.denied_access.Yes !== 55 || DCA.denied_access.Yes + DCA.denied_access.No !== 413) throw new Error("chart-scdca.json no longer matches rows 31 to 33");
const FILL = { a: "#5c6b78", b: "#8a5226", c: "#a8482f" };
/* One 100 percent bar: the shapes in an SVG (role img, with a label), the percent labels as text over each part. */
const stack = (label, parts) => { let x = 0; const t = parts.reduce((a, p) => a + p[1], 0), rects = [], tags = [];
  for (const [cls, n] of parts) { const w = 100 * n / t; rects.push(`<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="10" fill="${FILL[cls]}"/>`);
    tags.push(`<span aria-hidden="true" style="left:${x.toFixed(2)}%;width:${w.toFixed(2)}%">${pct(n, t)}%</span>`); x += w; }
  return `<div class="hd-stack"><svg role="img" aria-label="${label}" viewBox="0 0 100 10" preserveAspectRatio="none"><title>${label}</title>${rects.join("")}</svg>${tags.join("")}</div>`; };
const key = (cls, n, label) => `<li><i class="${cls}" aria-hidden="true"></i><span><b>${n}</b> ${label}</span></li>`;
const DCA_CHART = `<figure class="hd-fig"><p class="cap">Horry County owners who complained to the state about an HOA</p>`
  + `<p class="hd-q">When did they get the HOA papers?</p>`
  + stack(`Of ${GOT_T} who answered, ${GOT["Before purchase"]} got the papers before buying and ${GOT["After purchase"]} after buying`, [["a", GOT["Before purchase"]], ["c", GOT["After purchase"]]])
  + `<ul class="hd-key">${key("a", GOT["Before purchase"], "before they bought")}${key("c", GOT["After purchase"], "after they bought")}</ul>`
  + `<p class="hd-q">When were they told the home was in an HOA?</p>`
  + stack(`Of ${TOLD_T} who answered, ${TOLD["Before Closing"]} were told before closing, ${TOLD["At Closing"]} at closing and ${TOLD["After Closing"]} after closing`, [["a", TOLD["Before Closing"]], ["b", TOLD["At Closing"]], ["c", TOLD["After Closing"]]])
  + `<ul class="hd-key">${key("a", TOLD["Before Closing"], "before closing")}${key("b", TOLD["At Closing"], "at closing")}${key("c", TOLD["After Closing"], "after closing")}</ul>`
  + `<figcaption>Complaints to SC Consumer Affairs from 2022 through 2025. Each bar counts only the owners who answered that question. These are owners who complained, not all owners.</figcaption></figure>`;

/* ---- Rows 24 to 27, 39: the other states. chart-states.json is checked for its rows; the words are the verifier's. ---- */
if (STATES.rows.map((r) => r.state).join("|") !== "South Carolina|Virginia|Maryland|Florida (HOA)|North Carolina (condo)") throw new Error("chart-states.json rows changed");
const state = (name, gets, out) => `<li><b>${name}</b><span class="k">What the buyer gets by law</span>${gets}<span class="k">The way out</span>${out}</li>`;
const STATE_CARDS = `<ul class="hd-states" aria-label="What a buyer of a home in an association gets by law in four other states">`
  + state("Virginia", "The association's resale certificate. Unless the sale is exempt, the seller must get it for the buyer.", "If the contract names no period, 3 days after the buyer gets it. Any time before settlement if it never comes.")
  + state("Maryland", "The HOA disclosures, within 20 calendar days of the contract. The law caps the association's fee for them.", "5 calendar days to cancel if they come late.")
  + state("Florida, in an HOA", "A disclosure summary before the buyer signs.", "If it came late: void the contract within 3 days of getting it or before closing, whichever comes first.")
  + state("North Carolina, in a condo", "In most condo resales, a statement of the monthly dues and other fees, before closing.", "None. This law has no days to cancel.")
  + `</ul>`;

/* ---- The red flags a buyer in any HOA pays for (rows 12, 30, 36; 40 to 45). ---- */
const flag = (cls, where, title, test, means) => `<li${cls ? ` class="${cls}"` : ""}><span class="k">${where}</span><b>${title}</b>${test}<span class="w">${means}</span></li>`;
const FLAGS = `<ul class="hd-flags" aria-label="Red flags in HOA documents, where each shows up">`
  + flag("hot", "In the declaration and the rules", "A rule that blocks your plan", "A limit on renting, pets, parking, boats or golf carts that rules out how you will use the home. A condo's founding papers must state any limit on renting a unit.", `More on ${h.a("/hoa/rental-restrictions/", "rental rules")}`)
  + flag("", "In the board's minutes", "A special assessment on the way", "A special assessment is a one-time bill on top of the dues, for a cost the budget and the savings do not cover. South Carolina's condo and HOA laws set no cap on one. We read the minutes for one being planned.", `What a ${h.a("/hoa/special-assessments/", "special assessment")} can cost`)
  + flag("", "In the budget and the reserve study", "Thin savings for big repairs", `South Carolina does not require an HOA or a condo to save for big repairs. A reserve study shows what the savings should hold today. One ${h.ext(AR, "national study firm")} calls under 30 percent of that weak, with a high chance of special assessments, and 70 percent or more strong.`, `How we read ${h.a("/hoa/reserves/", "HOA reserves")}`)
  + flag("", "In the rules and the declaration", "Strict fine and collection rules", `In the past 12 months, Horry County associations filed 60 fine policies and 43 collection policies for unpaid dues. In one ${h.ext(WINROSE, "South Carolina case")}, the court judgment came to more than 11 times the unpaid dues, after interest, court costs and lawyer's fees.`, `How an ${h.a("/hoa/liens-and-foreclosure/", "HOA lien")} works`)
  + flag("", "In the association's statement", "Dues the seller still owes", "Unpaid dues are usually a lien paid from the seller's money at closing. If the sale leaves nothing to pay them, the association may go after the new owner, or waive them. In a condo, the buyer owes no more than the association's statement says.", `What the ${h.a("/hoa/estoppel-and-transfer-fees/", "closing statement")} shows`)
  + `</ul>`;

/* ---- Rows 18 to 23, 38: the condo building's loan review, one plain list. ---- */
const test = (t, d) => `<li><b>${t}</b>${d}</li>`;
const CONDO = `<ul class="hd-tests" aria-label="The lender's tests for a condo building">`
  + test("Savings", "In Fannie Mae's full review of a condo building, the budget must put at least 10 percent of dues income into savings. Freddie Mac, which also buys home loans, raises its test to 15 percent for loan applications from January 4, 2027.")
  + test("Owners behind on dues", "No more than 15 percent of units can be 60 days or more behind. In a 100-unit building, that is 15 units.")
  + test("Repairs put off", "A building that needs critical repairs, or has major upkeep put off, does not pass.")
  + test("Lawsuits", "A suit naming the association can block a normal loan. A suit against the builder about safety, structure, use or whether units can be lived in can too.")
  + test("Who owns the space", "Shops and offices can fill no more than 35 percent of the building. In a building of 21 or more units, one owner can hold no more than 20 percent of them.")
  + `</ul>`;

/* ---- Rows 2, 4, 5, 8 to 12, 17: the documents, a table that becomes cards on a phone. ---- */
const doc = (name, aka, from, tells) => `<tr><th scope="row">${name}${aka ? `<small>${aka}</small>` : ""}</th><td data-label="Where it comes from">${from}</td><td data-label="What it tells you">${tells}</td></tr>`;
const DOCS = `<figure class="hd-fig hd-docfig"><p class="cap" id="hd-docs-cap">The HOA documents to get, and what each one tells you</p>`
  + `<table class="hd-docs" aria-labelledby="hd-docs-cap"><thead><tr><th scope="col">The document</th><th scope="col">Where it comes from</th><th scope="col">What it tells you</th></tr></thead><tbody>`
  + doc("Declaration", "Also called the CC&amp;Rs, short for covenants, conditions and restrictions. A condo's is called the master deed.", "Recorded at the county", "What you own, what is shared, your share of the costs and any limits on renting")
  + doc("Bylaws", "", "Recorded at the county", "How the board is elected, how votes work and how the rules get changed")
  + doc("Rules and regulations", "", "The association; also filed at the county", "The day-to-day rules: pets, parking, the pool, trash, what you can build")
  + doc("Budget, balance sheet and income statement", "", "The association or its manager", `What comes in, what goes out, and ${h.a("/hoa/dues-increases/", "whether the dues went up this year")}`)
  + doc("Reserve study", "A list of the big shared parts, such as the roof and the paving", "The association or its manager", "When each part needs replacing, what it will cost, and whether the savings cover it")
  + doc("Meeting minutes, 12 to 24 months", "", "The association or its manager", "What the board plans next: repairs, a special assessment, rule changes, a lawsuit")
  + doc("Master insurance certificate", "", "The association or its manager", `What the building's policy covers and what you insure yourself. See ${h.a("/hoa/master-insurance-ho6/", "master and HO-6 insurance")}`)
  + doc("Statement of amounts due", "Also called an estoppel letter", "The association, before closing", "What the seller still owes the association")
  + doc("Condo questionnaire", "A form the lender sends the association", "Your lender", "Owners behind on dues, lawsuits, commercial space: the answers the building review needs")
  + doc("Seller's disclosure statement, with its HOA addendum", "", "The seller, before the contract", "The seller's answers to 11 yes-or-no questions about the association")
  + `</tbody></table></figure>`;

/* ---- Row 5: the form's 11 questions against what only the papers show. ---- */
const FORM_Q = ["Dues and other charges", "Limits on reselling or renting", "Special assessments", "Limits on guests", "Limits on pets", "Assigned parking, lockers or garages", "Keys, fobs or codes for shared areas", "Other memberships that come with the home", "Known problems in shared areas", "Whether the home is under the state's coastal zone law", "A transfer fee"];
if (FORM_Q.length !== 11) throw new Error("row 5: the form asks 11 questions");
const FORM_VS = `<div class="hd-two"><div><p class="k">The seller's form asks ${FORM_Q.length} yes-or-no questions</p><ul>`
  + FORM_Q.map((x) => `<li>${x}</li>`).join("")
  + `</ul></div><div class="only"><p class="k">Only the papers show</p><ul>`
  + ["The exact words of each rule", "How much the association has saved", "What the board plans next", "What the seller still owes", "Whether a lender will approve a condo building"].map((x) => `<li>${x}</li>`).join("")
  + `</ul></div></div>`;

/* ---- Rows 3, 4, 9, 17, 44: the timeline. ---- */
const step = (n, when, title, text, hot) => `<li${hot ? ' class="hot"' : ""}><span class="n" aria-hidden="true">${n}</span><span class="c"><span class="t">${when}</span><b>${title}</b>${text}</span></li>`;
const STEPS = `<ol class="hd-steps" aria-label="When the HOA papers arrive, in order">`
  + step(1, "Before you offer", "The seller's form, and the recorded papers", "The seller's HOA answers come with the disclosure statement. We pull the recorded declaration from the county.")
  + step(2, "When you sign", "Your review time starts", "South Carolina law has no set number of days for the HOA papers. The review time in your contract, often called the due diligence period, is your clock.", true)
  + step(3, "During the review", "The papers the association keeps", "We ask for the rules, budget, minutes, reserve study and insurance certificate at once. Your lender sends the condo questionnaire.")
  + step(4, "Before closing", "What the seller still owes", "The association's statement shows any unpaid dues. We check for them before closing.")
  + step(5, "After you buy", "The rules can change", "The board can adopt new rules. The minutes you read under contract show what it plans next.")
  + `</ol>`;
const FIX = `<ul class="hd-flags hd-fix" aria-label="What to do if the papers show a problem">`
  + `<li><span class="k">A line you cannot read</span><b>The association explains it</b>We ask the manager in writing what the line in the budget or minutes means, and how much any coming bill will be.</li>`
  + `<li><span class="k">A debt or a coming bill</span><b>The seller pays or fixes it</b>We ask the seller to pay what is owed, or to take a coming bill off the price.</li>`
  + `<li class="hot"><span class="k">A rule that blocks your plan</span><b>You walk away</b>No price cut fixes it. We tell you while you can still leave on your contract's terms.</li></ul>`;

/* ---- The page's own styles. ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const RED = "#a8482f", BRASS = "#c4783a", SLATE = "#5c6b78", GREY = "#c9c2b6";
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TOP = `${S}>section[style^="background:var(--navy)"]:not(:last-child)>.wrap`;
const CSS = "<style>"
  /* one subtitle at the top: the italic line under the H1 stays, the dek is not shown (owner, 2026-10-27) */
  + `${S} .detail-hero .detail-sub{display:none}`
  /* the top offer bar's left edge on the text column (glass.js puts it at 16 px under 1264 px; NEEDS.md 6) */
  + `@media (min-width:700px) and (max-width:1263px){${TOP}{margin-left:2rem!important;width:calc(100% - 4rem)!important}}`
  + `@media (max-width:699px){${TOP}{margin-left:var(--hd-gut,1.5rem)!important;width:calc(100% - 2 * var(--hd-gut,1.5rem))!important}}`
  /* Design pass, 2026-11-08 (redo2/hoa-documents/DESIGN.md): a two-line headline, the contents between rules, one card
     style (the chart and the offers), plain lists and tables under thin rules, no outlines, the photo beside the condo tests. */
  /* 1. The headline: the italic line at about half the H1's size; on a phone the facts are flat rows under rules. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:#8a5226!important}}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* 2. The contents list: no card, in columns between two rules. */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}`
  /* 3. One card style, for the chart (the offers keep theirs). One block width of 720 px. */
  + `${S} .hd-fig{max-width:720px;margin:1.3rem 0 1.5rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;box-sizing:border-box;${CARD}}`
  + `${S} .hd-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .8rem}`
  + `${S} .hd-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.8rem}`
  /* the red flags and the three answers: plain lists under rules; the urgent one keeps a red top rule and label */
  + `${S} .hd-flags{list-style:none;margin:1.1rem 0 1.4rem;padding:0;max-width:720px;border-bottom:${RULE}}`
  + `${S} .hd-flags li{margin:0;padding:.95rem 0 1rem;border-top:${RULE};color:var(--muted);line-height:1.55}`
  + `${S} .hd-flags li.hot{border-top:2px solid ${RED}}${S} .hd-flags li.hot .k{color:${RED}}`
  + `@media (min-width:760px){${S} .hd-fix{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:1.6rem;border-bottom:0}${S} .hd-fix li{padding-bottom:.2rem}}`
  + `${S} .hd-flags .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:#8a5226;font-weight:700;margin-bottom:.3rem}`
  + `${S} .hd-flags b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.25rem}`
  + `${S} .hd-flags .w{display:block;margin-top:.45rem;color:var(--navy);font-family:var(--sans);font-size:.95rem;font-weight:600}`
  /* the condo building's tests: one plain list under rules; on a wide screen the photo sits beside it */
  + `${S} .hd-tests{list-style:none;margin:1rem 0 1.3rem;padding:0;max-width:720px;box-sizing:border-box;border-top:${RULE};border-bottom:${RULE}}`
  + `${S} .hd-tests li{margin:0;padding:.75rem 0;border-bottom:${RULE};color:var(--muted);line-height:1.55}${S} .hd-tests li:last-child{border-bottom:0}`
  + `${S} .hd-tests b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.04rem;margin-bottom:.15rem}`
  + `${S} .hd-condorow .c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} .hd-condorow .c3ph-hero figcaption{padding:0!important;margin-top:.55rem}`
  + `@media (min-width:1180px){${S} .hd-condorow{display:grid;grid-template-columns:720px minmax(0,1fr);column-gap:2.6rem;align-items:start;margin:1rem 0 1.3rem}`
  + `${S} .hd-condorow>.hd-tests{grid-column:1;grid-row:1;margin:0}${S} .hd-condorow>.c3-aerial{grid-column:2;grid-row:1;position:sticky;top:9.5rem}${S} .hd-condorow .c3ph-hero{margin:0}}`
  /* the documents table: a plain table under rules; on a phone, plain rows split by a rule */
  + `${S} .hd-docfig{${FLAT};padding:0!important}`
  + `${S} .hd-docs{width:100%;border-collapse:collapse;font-family:var(--sans)}`
  + `${S} .hd-docs th,${S} .hd-docs td{text-align:left;vertical-align:top;padding:.7rem .5rem;border-bottom:${RULE};font-size:1rem;line-height:1.45;color:var(--muted)}${S} .hd-docs th:first-child{padding-left:0}`
  + `${S} .hd-docs thead th{font-size:.85rem;color:var(--navy);font-weight:700;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .hd-docs tbody th{color:var(--navy);font-weight:650;width:30%;text-wrap:balance}${S} .hd-docs small{display:block;font-weight:400;color:var(--muted);font-size:.9rem;margin-top:.2rem;text-wrap:pretty}`
  + `${S} .hd-docs td:nth-child(2){width:24%}`
  + `@media (max-width:699px){${S} .hd-docs thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .hd-docs,${S} .hd-docs tbody,${S} .hd-docs tr,${S} .hd-docs th,${S} .hd-docs td{display:block;width:auto!important}`
  + `${S} .hd-docs tr{border-top:${RULE};padding:.75rem 0 .8rem;margin:0}${S} .hd-docs tr:last-child{border-bottom:${RULE}}`
  + `${S} .hd-docs th,${S} .hd-docs td{border:0;padding:0}${S} .hd-docs tbody th{font-size:1.06rem;margin-bottom:.35rem}`
  + `${S} .hd-docs td{margin-top:.35rem}${S} .hd-docs td::before{content:attr(data-label);display:block;font-size:.75rem;letter-spacing:.08em;text-transform:uppercase;color:#8a5226;font-weight:700}}`
  /* the states: two columns under rules on a wide screen */
  + `${S} .hd-states{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;column-gap:1.6rem;max-width:720px}@media (min-width:760px){${S} .hd-states{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .hd-states li{margin:0;padding:.85rem 0 1rem;border-top:${RULE};color:var(--muted);line-height:1.5}`
  + `${S} .hd-states b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.12rem;margin-bottom:.35rem}`
  + `${S} .hd-states .k{display:block;font-family:var(--sans);font-size:.75rem;letter-spacing:.1em;text-transform:uppercase;color:#8a5226;font-weight:700;margin:.45rem 0 .1rem}`
  /* the seller's form against the papers: two plain columns; "only the papers show" keeps a brass top rule */
  + `${S} .hd-two{display:grid;column-gap:1.6rem;max-width:720px;margin:1.1rem 0 1.4rem}@media (min-width:700px){${S} .hd-two{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .hd-two>div{padding:.9rem 0 .6rem;border-top:${RULE}}${S} .hd-two>div.only{border-top:2px solid ${BRASS}}`
  + `${S} .hd-two .k{font-family:var(--sans);font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:#8a5226;font-weight:700;margin:0 0 .5rem}`
  + `${S} .hd-two ul{margin:0;padding:0 0 0 1.1rem;color:var(--navy);line-height:1.55}${S} .hd-two li{margin:0 0 .25rem}`
  /* the stacked bars */
  + `${S} .hd-q{color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1rem;margin:.9rem 0 .45rem}`
  + `${S} .hd-stack{position:relative;height:2.4rem;border-radius:999px;overflow:hidden;background:${GREY}}${S} .hd-stack svg{display:block;width:100%;height:100%}`
  + `${S} .hd-stack span{position:absolute;top:0;bottom:0;display:flex;align-items:center;justify-content:center;color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}`
  + `${S} .hd-key{list-style:none;margin:.55rem 0 0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;font-family:var(--sans);font-size:1rem;color:var(--navy)}`
  + `${S} .hd-key li{margin:0;display:flex;align-items:center;gap:.45rem}${S} .hd-key i{width:.95rem;height:.95rem;border-radius:4px;flex:none}`
  + `${S} .hd-key i.a{background:${SLATE}}${S} .hd-key i.b{background:#8a5226}${S} .hd-key i.c{background:${RED}}`
  /* the timeline: no cards, the time as small brass text, the urgent step keeps its red dot */
  + `${S} .hd-steps{list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:720px;position:relative}`
  + `${S} .hd-steps::before{content:"";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.16)}`
  + `${S} .hd-steps>li{position:relative;margin:0 0 1.15rem;padding:0 0 0 3.6rem}${S} .hd-steps>li:last-child{margin-bottom:0}`
  + `${S} .hd-steps .n{position:absolute;left:0;top:0;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}`
  + `${S} .hd-steps li.hot .n{background:${RED}}`
  + `${S} .hd-steps .c{display:block;color:var(--muted);line-height:1.6}`
  + `${S} .hd-steps .t{display:block;margin:0 0 .15rem;color:#8a5226;font-family:var(--sans);font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;line-height:1.3;padding-top:.1rem}`
  + `${S} .hd-steps li.hot .t{color:${RED}}`
  + `${S} .hd-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .hd-flags b,${S} .hd-steps b,${S} a.btn{text-wrap:balance}${S} .hd-flags .w{text-wrap:pretty}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.2rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* Work-arounds copied from /hoa/liens-and-foreclosure/ (from /hoa/reserves/ NEEDS 10, 11): the feed's search row
     at 320 px, the header phone at 1000 to 1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, and nothing on this page is legal advice. For advice on your own contract, talk to a South Carolina attorney.</p>`;

/* ---- The glance row under the H1 (rows 1, 30, 31). ---- */
const GLANCE = PK.glance([
  { icon: "home", label: "5 of 6", text: "listings in our search show an HOA fee" },
  { icon: "tax", label: "60", text: "fine policies filed by Horry associations in a year" },
  { icon: "calendar", label: "2 in 3", text: "Horry owners who complained got the papers after buying" },
]);

/* ---- The photo (this page's photos.json: USGS, public domain, copied from /buyers/common-mistakes/). It sits under the
   condo review heading: a house and a condo tower on one beach, one reviewed by the lender building-wide, one not. ---- */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "760px" });
const PHOTO_RAW = ph.aerial("houses-and-towers-from-the-ocean", PHOTOS[0].caption);
/* Beside the condo tests on a wide screen it is about 400 px wide, not the 1136 px photos.js assumes. */
if (!PHOTO_RAW.includes('sizes="(max-width: 1200px) 100vw, 1136px"')) throw new Error("photos.js changed the photo's sizes; recheck");
const PHOTO = PHOTO_RAW.split('sizes="(max-width: 1200px) 100vw, 1136px"').join('sizes="(max-width: 759px) 100vw, (max-width: 1179px) 720px, 420px"');
ph.share("houses-and-towers-from-the-ocean");
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const AFTER = () => { const c = ph.credits(); if (!GENERIC_CREDIT.test(c)) throw new Error("photos.js changed its general credit line; recheck"); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* Questions the page answers, said short. */
const FAQ = [
  { q: "Are HOA documents public record in South Carolina?", a: "The recorded ones are: the declaration, the bylaws, their amendments and the rules. In Horry County the index is online; we pull the pages at the county for you. The rest come from the association." },
  { q: "Can I back out of buying a house because of the HOA documents?", a: "Not under a South Carolina law. Your contract's review time is when to act. In Virginia, Maryland and Florida, a buyer has a set number of days by law." },
  { q: "How long does it take to get HOA documents?", a: "South Carolina law has no deadline for them, so it depends on the association. That is why we ask the manager for the papers and a date as soon as you are under contract." },
  { q: "Who pays for HOA documents in South Carolina?", a: "No South Carolina law caps the association's fee for them or names an amount. We find out what the manager charges before the papers are ordered, so the cost is known up front." },
  { q: "Does the seller have to tell me there is an HOA?", a: "Yes, unless the sale is exempt, such as the first sale of a new home. The seller's disclosure form asks, and a yes brings the one-page HOA addendum. A missing form does not undo the contract." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "What to Check in HOA Documents Before Buying in South Carolina",
  description: "What to look for in HOA documents before buying on the Grand Strand: the red flags, the papers that show them, and how SC compares with VA and FL.",
  ogTitle: "What to look for in HOA documents before you buy in South Carolina",
  crumb: "Documents",
  eyebrow: "HOA Guide",
  h1: "What should you look for in HOA documents before you buy in South Carolina?",
  h1em: "The red flags, the papers that show them, and when they arrive.",
  sub: "Five red flags in HOA documents in South Carolina, the papers that show them, and when they arrive.",
  heroMedia: GLANCE,
  heroCta: { title: "Send the address. We read the HOA papers before your review time ends.", label: "Have us read the HOA papers", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "Read the papers of a homeowners association (HOA) for five red flags. They are a rule that blocks your plan, a special assessment on the way, thin savings, strict fine and collection rules, and dues the seller still owes. In a condo, the lender also tests the whole building before it lends.",
    "South Carolina law does not make an HOA hand a buyer these papers. They come only if someone asks, so we ask for them and read them inside your contract's review time.",
  ],
  sections: [
    { h2: "What are the red flags in HOA documents?", toc: "Red flags", id: "red-flags", html: (bg) => CSS + ph.css() +
      h.p("Five things in the papers should stop you, in a house, a townhouse or a condo. A rule that blocks your plan comes first, because a lower price does not fix it. The other four cost you money after you buy.") +
      FLAGS +
      h.h3("In a condo: the lender's building review") +
      h.p(`If the home is a condo, the lender also reviews the whole building. The ${h.ext(FNMA_REVIEW, "tests")} come from Fannie Mae, a company that buys home loans from lenders. A house in an HOA ${h.ext(FNMA_PROJ, "skips this review")}, apart from some basic rules.`) +
      `<div class="hd-condorow">${PHOTO}${CONDO}</div>` +
      h.p(`When a building fails, a loan on a unit there cannot be sold to Fannie Mae. Buyers then need a different loan, often at a higher cost. Buildings with a rental program here usually fail, because so many owners are investors.`) +
      h.p("If you pay cash, no lender reviews the building for you. When you sell, a buyer who needs a loan may face the same review.") +
      h.h3("How our agents read the rules") +
      h.p("Our agents read the rules against how you plan to live: a boat, a golf cart, a rental, a pool. For a buyer who plans to rent, we leave out communities that ban renting before the search starts. Then we read the HOA papers for any rule that would undo the plan.") +
      h.cta("Will a lender approve the building?", "Send the building's name. We read its budget and minutes against the lender's tests, both savings tests included, and tell you which ones it fails.", "Have us test the building", "/contact/", bg) },

    { h2: "Which HOA documents should you get before buying?", toc: "The documents", id: "the-documents", html: (bg) =>
      h.p(`Ten papers, from four places: the county, the association, the seller and your lender. Most buyers here need them. In our listing search, nearly every condo, 9 of 10 townhouses and about 7 of 10 houses for sale list an association fee.`) +
      DOCS +
      h.cta("The recorded papers for one address", "Send the address. We pull the declaration and the bylaws from the county and mark the rules on renting, pets and parking.", "Have us pull the declaration", "/contact/", bg) },

    { h2: "Does an HOA have to give a buyer its documents in South Carolina?", toc: "What SC law requires", id: "sc-law", html: () =>
      h.p(`No. No South Carolina law makes an association give a buyer a resale packet, gives it a deadline, or caps its fee. The state's ${h.ext(T27_30, "HOA law")}, ${h.ext(T27_31, "condo law")} and ${h.ext(T33_31, "nonprofit law")} have no such rule.`) +
      h.p(`The seller's duty is a form. Unless the sale is exempt, the seller fills in the state's ${h.ext(FORM, "disclosure form")} before the contract is signed. If the home is in an association, that includes a one-page HOA addendum.`) +
      FORM_VS +
      h.p(`The seller may answer any question "No Representation", which means no answer at all. The form itself tells buyers to read the documents before signing a contract. If the seller never gives the form, ${h.ext(T27_50, "the law says")} the contract still stands and the closing goes ahead.`) +
      h.p("Some sales skip the form. Examples are the first sale of a home no one has lived in, a foreclosure sale and an auction. A sale is also exempt when both sides agree in writing.") +
      h.h3("What other states give a buyer") +
      h.p("Buyers who move here from Virginia, Maryland or Florida often expect the papers to arrive by law, with days to cancel. Maryland and Florida are among the states that send the most movers to Horry County.") +
      STATE_CARDS +
      h.p(`A bill now in a House committee, ${h.ext(H5204, "H. 5204")}, would require an HOA seller packet on a website at no charge. It would also require the seller certification and governing documents within 15 days of the seller's request. It has not moved out of committee and is not law.`) },

    { h2: "Are HOA documents public record in Horry County?", toc: "Public record", id: "public-record", html: (bg) =>
      h.p(`Yes, the recorded ones. An association's declaration, its bylaws, their amendments and its rules must be filed with the county's ${h.ext(ROD, "Register of Deeds")} to be enforced. The county's ${h.ext(INDEX, "index")} is online, but the pages are not, so we pull them at the county and send you the copies. To look up a property's records yourself, use our ${h.a("/buyers/property-records/", "Horry County property records lookup")}.`) +
      h.h3("The papers the county does not keep") +
      h.p("The budget, the minutes, the reserve study and the insurance certificate come from the association or its manager. The seller, who still owns the home, can ask for them, and we ask the seller and the manager as soon as you are under contract.") +
      h.cta("Need the budget and the minutes?", "We get them from the seller and the manager, then mark what the savings, the dues and the board's plans mean for you.", "Ask us to get the budget and minutes", "/contact/", bg) },

    { h2: "How often do HOA rules change in Horry County?", toc: "Rules change", id: "rules-change", html: () =>
      h.p(`Often. In the 12 months to October 2026, about 700 association papers were recorded in Horry County. More than 300 associations filed them, and about 400 were rules and policies.`) +
      h.p(`Before 2018, almost no rules were on file. Associations that already existed had until January 10, 2019, to record theirs under a 2018 law, and ${JAN19} papers were filed that January alone.`) +
      h.p("The rules you read under contract can change after you buy. A new rule takes effect when the board adopts it. It must reach the county by January 10 of the next year, so until then only the association's copy shows it.") },

    { h2: "When do you get HOA documents, and what if you find a problem?", toc: "When they arrive", id: "when-they-arrive", html: (bg) =>
      h.p("The seller's form comes before the contract. Everything else arrives during your review time, and only if someone asks for it. We ask the day you sign.") +
      STEPS +
      h.h3("If the papers show a problem") +
      FIX +
      h.cta("Under contract already?", "Send the address and the last day of your review time. We get the papers, read them first and call you with what we found.", "Send us your review deadline", "/contact/", bg) },

    { h2: "What happens to buyers who read HOA documents too late?", toc: "Too late", id: "too-late", html: () =>
      h.p(`Many owners who complain to the state got the papers too late. Of Horry County owners who complained about an HOA from 2022 through 2025, about two in three got the papers after they bought.`) +
      DCA_CHART +
      h.p(`Of the ${DCA.denied_access.Yes + DCA.denied_access.No} who answered, ${DCA.denied_access.Yes} said they had been denied access to the governing documents, and 49 said they had not received a copy.`) +
      h.p(`More of the complaints in the ${h.ext(SCDCA, "state's 2026 HOA report")} came from Horry County than from any other county: 31 percent of 452.`) +
      h.p(`Our agents get the papers in front of you while you can still walk away, and read them for you first.`) },
  ],
  pageImages: () => ph.pageImages(),
  afterSources: () => AFTER(),
  faqTitle: "HOA documents FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-30", href: T27_30 },
    { name: "SC Code 27-31", href: T27_31 },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC Code 33-31", href: T33_31 },
    { name: "SC disclosure form", href: FORM },
    { name: "Horry deeds office", href: ROD_FORM },
    { name: "Horry County deed index", href: INDEX },
    { name: "Fannie Mae B4-2.1-01", href: FNMA_PROJ },
    { name: "Fannie Mae B4-2.2-02", href: FNMA_REVIEW },
    { name: "Fannie Mae B4-2.1-03", href: FNMA_INELIG },
    { name: "Freddie Mac 2026-C", href: FREDDIE },
    { name: "Winrose v. Hale", href: WINROSE },
    { name: "Association Reserves 2026", href: AR },
    { name: "Virginia 55.1-2312", href: VA },
    { name: "Maryland 11B-106", href: MD },
    { name: "Florida 720.401", href: FL },
    { name: "NC 47C-4-109", href: NC },
    { name: "SCDCA HOA reports", href: SCDCA },
    { name: "SC H. 5204", href: H5204 },
  ],
  sourcesNote: "Our count of the county's deed index and the state's complaint files; listings in aggregate.",
  bottomCta: { h2: "Get the HOA papers read before you are committed.", p: "Send the community name. We get the papers, read them and tell you what we found.", label: "Have us get and read the papers", href: "/contact/" },
  keywords: "what to look for in HOA documents, HOA documents before buying, HOA red flags, condo red flags, HOA documents South Carolina, are HOA documents public record, who pays for HOA documents, CC&Rs, HOA resale certificate South Carolina, condo questionnaire, HOA documents needed for closing",
  about: "Homeowners association and condo documents a buyer reviews before purchase in South Carolina and Horry County",
});
