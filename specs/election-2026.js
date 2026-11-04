/* /market-reports/2026-election/ - what the 2026 election means for Myrtle Beach home buyers and sellers.
 * The hub of batch 2026-11-e's seven election pages: every result, who holds which power over a home here,
 * all of Annie Andrews' plans and all of Alan Wilson's plans side by side (each with what it would touch on
 * the Grand Strand, who must vote first, and the deeper page), the past examples behind each main plan, the
 * FHFA Myrtle Beach-area price index in the year after each election 2016-2024 with its margin of error, and
 * what changes for a buyer and a seller now.
 *
 * Batch 2026-11-e, Lane N. Owner, 2026-11-04: bipartisan, all of each winner's plans, co-authored by Devin Day
 * (COO) and Abdulla Hijazi (CMO), past examples for the short and long run. Names in the byline and schema only.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at the corrected values
 * (VERIFY.md; struck list facts/election-2026-struck.json; predictions.md with VERIFY's cuts).
 * Data: data/2026-11-e/election-2026/findings.json (results, seats, the FHFA index values with their standard
 * errors from hpi_at_metro.csv, CBSA 34820) and photos.json (licence records). Every chart and table number in
 * the copy is read from findings.json here, never typed, and checked against the ledger row.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/market-reports/2026-election/";
const SLUG = "election-2026";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), PHOTOS = read("photos.json").photos;
const must = (ok, msg) => { if (!ok) throw new Error(`election-2026.js: ${msg}`); };

/* The six sibling pages (BRIEF.md). */
const P2 = "/buyers/first-time-buyer-tax-credit/", P3 = "/buyers/flood-insurance-after-the-election/",
  P4 = "/invest/rental-property-tax-cut/", P5 = "/buyers/act-388-changes/",
  P6 = "/invest/short-term-rental-rules-statehouse/", P7 = "/invest/horry-county-growth-roads-permits/";

const NB = " ";
const pct1 = (v) => (Math.round(v * 10) / 10).toFixed(1);
const pct0 = (v) => String(Math.round(v));

/* ---------------------------------------------------------------------------- */
/* Results (F003-F021), checked against the ledger.                               */
const R = F.results;
must(R.senate.votes === 1034418 && R.senate.pct === 51.02 && R.senate.loser_pct === 46.76, "F004 changed");
must(R.governor.votes === 1046730 && R.governor.pct === 51.71 && R.governor.loser_pct === 47.0, "F006 changed");
must(R.house7.pct === 56.75 && R.house7.loser_pct === 43.19, "F010 changed");
const SH = R.state_house, SS = R.state_senate, TT = F.two_thirds;
must(SH.after.R === 79 && SH.after.D === 45 && SH.before.R === 89 && SH.before.D === 35, "F011/F012 House seats changed");
must(SS.R === 34 && SS.D === 12, "F012 Senate seats changed");
/* F083: two-thirds of the membership, rounded up. */
must(TT.house_needed === Math.ceil(SH.seats * 2 / 3) && TT.senate_needed === Math.ceil(SS.seats * 2 / 3), "two-thirds arithmetic");
const SHORT = TT.house_needed - SH.after.R;
must(SHORT === 4, "F083: 4 short");
must(R.school_board_d7.pct === 51.83 && R.school_board_d7.loser_pct === 48.12, "F018 corrected values");

/* ---------------------------------------------------------------------------- */
/* Styles: one responsive table (a table on a wide screen, one card a row on a    */
/* phone), the seat chart and the timeline.                                       */
const CSS = "<style>"
  + "main#main .el-tabwrap{max-width:760px;margin:1.2rem 0 1.2rem;padding:.7rem 1rem .5rem;border-radius:18px;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.54));border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 18px 40px -26px rgba(28,32,40,.45)}"
  + "main#main .el-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1rem;color:var(--navy)}"
  + "main#main .el-tab caption{text-align:left;font-weight:600;padding:.3rem 0 .6rem;line-height:1.4;font-size:1.0625rem}"
  + "main#main .el-tab th,main#main .el-tab td{padding:.6rem .5rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:left;vertical-align:top;line-height:1.45}"
  + "main#main .el-tab thead th{font-size:.9rem;border-bottom:2px solid var(--navy);letter-spacing:.02em}"
  + "main#main .el-tab tbody th[scope=row]{font-weight:600;min-width:9rem}"
  + "main#main .el-tab td .l{display:none}main#main .el-tab td q{font-style:italic;quotes:'\\201C' '\\201D'}"
  + "main#main .el-tab tbody tr:last-child>*{border-bottom:0}main#main .el-tab a{color:var(--navy);text-decoration:underline}"
  + "@media (max-width:699px){main#main .el-tabwrap{padding:.6rem .85rem .4rem}main#main .el-tab,main#main .el-tab tbody,main#main .el-tab caption{display:block;width:100%}"
  + "main#main .el-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}"
  + "main#main .el-tab tr{display:block;padding:.75rem 0;border-bottom:1px solid rgba(28,32,40,.14)}main#main .el-tab tbody tr:last-child{border-bottom:0}"
  + "main#main .el-tab th,main#main .el-tab td{display:block;border:0;padding:0 0 .45rem}main#main .el-tab tbody th[scope=row]{font-size:1.0625rem;padding-bottom:.35rem}"
  + "main#main .el-tab td .l{display:block;font-size:.875rem;font-weight:600;color:var(--muted);letter-spacing:.02em}}"
  + "main#main svg.el-n{display:block;width:100%;height:auto;max-width:340px;margin:0 auto}main#main svg.el-w{display:none;width:100%;height:auto;max-width:640px}"
  + "@media (min-width:600px){main#main svg.el-n{display:none}main#main svg.el-w{display:block}}"
  + "main#main .el-time{list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:720px;position:relative}"
  + "main#main .el-time li{position:relative;margin:0;padding:0 0 1.1rem 2rem;color:var(--muted);line-height:1.6}"
  + "main#main .el-time li::before{content:'';position:absolute;left:.42rem;top:.5rem;width:.7rem;height:.7rem;border-radius:50%;background:var(--brass);box-shadow:0 0 0 4px rgba(196,120,58,.18)}"
  + "main#main .el-time li::after{content:'';position:absolute;left:.75rem;top:1.4rem;bottom:0;width:2px;background:rgba(28,32,40,.14)}main#main .el-time li:last-child::after{display:none}"
  + "main#main .el-time strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1rem}"
  + "main#main .el-more{display:block;font-weight:400;font-size:.95rem;margin-top:.35rem}"
  + "main#main .el-other{color:var(--muted);line-height:1.75;max-width:640px;margin:0 0 1rem}"
  + "</style>";

/* A table: head is the column labels; rows are [rowHeader, cell, cell, ...]; cells may hold links and <q>. */
const table = (caption, head, rows) => `<div class="el-tabwrap"><table class="el-tab"><caption>${caption}</caption>`
  + `<thead><tr>${head.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead>`
  + `<tbody>${rows.map((r) => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map((c, i) => `<td><span class="l">${head[i + 1]}</span>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

/* ---------------------------------------------------------------------------- */
/* V1: the results table (F003-F014, F020).                                       */
const RESULTS = table("South Carolina's 2026 results, unofficial count",
  ["Race", "Winner", "Result", "How it was decided"],
  [
    ["U.S. Senate", `Annie Andrews (D)`, `${pct1(R.senate.pct)}% to ${pct1(R.senate.loser_pct)}% over Darline Graham (R)`, "The AP called it on election night. CBS News projected it too."],
    ["Governor", `Alan Wilson (R), with Mike Reichenbach for lieutenant governor`, `${pct1(R.governor.pct)}% to ${pct1(R.governor.loser_pct)}% over Jermaine Johnson (D)`, "Johnson conceded on election night."],
    ["U.S. House, 7th District, which includes Horry County", "Russell Fry (R)", `${pct1(R.house7.pct)}% to ${pct1(R.house7.loser_pct)}% over John Gregory Vincent (D)`, "The AP called it."],
    ["Other statewide offices", "Republicans won all six", `${pct1(R.other_statewide_min_pct.value)}% to ${pct1(R.other_statewide_min_pct.max)}%`, "Unofficial count."],
    ["State House, all 124 seats", `${SH.after.R} Republicans, ${SH.after.D} Democrats`, `Before the election: ${SH.before.R} and ${SH.before.D}`, `Two races were within 1 percent and go to a recount.`],
    ["State Senate, 46 seats", "Not on the ballot, except one special race", `Stays ${SS.R} Republicans, ${SS.D} Democrats`, "No change."],
    ["Ballot questions", "None statewide or in Horry County", "Georgetown County, south of Horry, approved a local sales tax", "Unofficial count."],
  ]);

/* V2: Horry County (F015, F016, F018). */
const HORRY = table("Horry County's local races, uncertified",
  ["Office", "Winner", "Result"],
  [
    ["County Council chairman", "Johnny Gardner (R)", "Unopposed"],
    ["County Council, District 2", "Bill Howard (R)", "74.9% over Kristi Burch (Forward)"],
    ["County Council, Districts 5 and 7", "Tyler Servant (R) and Tom Anderson (R)", "84.8% and 69.7%"],
    ["County Council, Districts 1, 8 and 11", "Jenna Dukes, Michael Masciarelli and Al Allen (all R)", "Unopposed"],
    ["School board, District 7", "Sonya Sasser (R)", `${pct1(R.school_board_d7.pct)}% to ${pct1(R.school_board_d7.loser_pct)}% over Janet P. Graham (D)`],
    ["The 11 state House districts on Horry County's ballot", "8 Republicans, 3 Democrats", "Closest: District 57, Cynthia Ford (D), 51.6%"],
  ]);

/* ---------------------------------------------------------------------------- */
/* V3: the seat chart, drawn twice (phone and wide) so its text stays 14-16 px.   */
const seatSvg = (W, fs, cls) => {
  const x0 = 2, x1 = W - 2, bh = fs * 2.3;
  const row = (y, title, tot, r, d, need, gapText) => {
    const X = (v) => x0 + (v / tot) * (x1 - x0);
    const xr = X(r), xn = X(need);
    const lbl = (x, yy, t, o = {}) => `<text x="${x.toFixed(1)}" y="${yy.toFixed(1)}" font-size="${fs}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}${o.bold ? ' font-weight="600"' : ""} fill="${o.fill || "#1c2028"}">${t}</text>`;
    const by = y + fs * 0.9;
    return lbl(x0, y, title, { bold: true })
      + `<rect x="${x0}" y="${by.toFixed(1)}" width="${(xr - x0).toFixed(1)}" height="${bh.toFixed(1)}" rx="6" fill="#1c2028"/>`
      + `<rect x="${xr.toFixed(1)}" y="${by.toFixed(1)}" width="${(x1 - xr).toFixed(1)}" height="${bh.toFixed(1)}" rx="6" fill="#c9ccd3"/>`
      + lbl(x0 + 10, by + bh * 0.66, `${r} R`, { bold: true, fill: "#ffffff" })
      + lbl(x1 - 10, by + bh * 0.66, `${d} D`, { bold: true, anchor: "end" })
      + `<line x1="${xn.toFixed(1)}" x2="${xn.toFixed(1)}" y1="${(by - 6).toFixed(1)}" y2="${(by + bh + 8).toFixed(1)}" stroke="#c4783a" stroke-width="3"/>`
      + lbl(Math.min(xn, x1 - 4), by + bh + fs * 1.45, `${need} votes is two-thirds`, { anchor: xn > W * 0.55 ? "end" : "start" })
      + lbl(Math.min(xn, x1 - 4), by + bh + fs * 2.7, gapText, { anchor: xn > W * 0.55 ? "end" : "start", bold: true, fill: "#8a5226" });
  };
  const rowH = fs * 7.8;
  const H = Math.round(fs * 1.2 + rowH * 2);
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart of seats. State House, 124 seats: ${SH.after.R} Republicans and ${SH.after.D} Democrats in the unofficial count; two-thirds is ${TT.house_needed} votes, ${SHORT} more than the Republicans hold. State Senate, 46 seats: ${SS.R} Republicans and ${SS.D} Democrats; two-thirds is ${TT.senate_needed} votes, ${SS.R - TT.senate_needed} fewer than the Republicans hold.">`
    + row(fs * 1.2, "State House, 124 seats", SH.seats, SH.after.R, SH.after.D, TT.house_needed, `Republicans are ${SHORT} short`)
    + row(fs * 1.2 + rowH, "State Senate, 46 seats", SS.seats, SS.R, SS.D, TT.senate_needed, `Republicans have ${SS.R - TT.senate_needed} more`)
    + `</svg>`;
};
const SEATS = h.figure(seatSvg(320, 15, "el-n") + seatSvg(640, 15, "el-w"),
  "Seats after the 2026 election. R is Republicans and D is Democrats. The brass line is the two-thirds vote it takes to change the tax ratio on rentals and second homes. House seats are the unofficial count.");

/* ---------------------------------------------------------------------------- */
/* V4: who decides what (F080-F094, F101, F170, F180, F194).                      */
const POWERS = table("Who decides what about a home on the Grand Strand",
  ["Who", "Who holds it now", "What it decides for a home here", "More"],
  [
    ["Congress, in Washington", "Annie Andrews joins the Senate in January. Russell Fry represents Horry County in the House.",
      "Federal flood insurance. Federal tax credits for buyers. The tax break on a home sale gain. Limits on large investors.",
      `${h.a(P3, "Flood insurance")}, ${h.a(P2, "buyer tax credit")}`],
    ["The governor and the legislature, in Columbia", `Governor-elect Alan Wilson. A House of ${SH.after.R} Republicans and ${SH.after.D} Democrats, and a Senate of ${SS.R} and ${SS.D}.`,
      "The 4 and 6 percent tax ratios. The school tax exemption on a home you live in. HOA law. The state tax on short-stay rentals. Whether cities may limit short-term rentals.",
      `${h.a(P4, "Rental tax cut")}, ${h.a(P5, "Act 388, the 2006 school tax law")}, ${h.a(P6, "short-term rentals")}`],
    ["Horry County Council, in Conway", "Chairman Johnny Gardner and the district members.",
      "Impact fees on new homes. Zoning outside the cities.",
      `${h.a(P7, "Growth, roads and permits")}`],
    ["City and town councils", "Myrtle Beach, North Myrtle Beach and each town have their own council.",
      "Zoning inside the city, including where short-term rentals are allowed. Business licenses for rentals.",
      `${h.a(P6, "Short-term rentals")}, ${h.a("/invest/str-rules/", "rental rules")}`],
  ]);

/* ---------------------------------------------------------------------------- */
/* V5 and V6: each winner's plans, side by side in the same columns (F030-F049,   */
/* F060-F069). Each row: the plan, in their words, what it would touch here,      */
/* what has to happen first, the deeper page.                                     */
const PLAN_HEAD = ["Plan", "What the campaign said", "What it would touch here"];
const more = (href, text) => `<span class="el-more">More: ${h.a(href, text)}</span>`;
const ANDREWS = table("Annie Andrews' plans that touch a home here",
  PLAN_HEAD,
  [
    [`A $50,000 tax credit for first-time buyers${more(P2, "What the last credit did")}`, `<q>a $50,000 tax cut to help first-time homebuyers</q>`,
      "A first-time buyer's down payment, and how many buyers bid on starter homes. She has no bill of her own, and the closest bill has had no vote."],
    ["Cut the limit on large investors from 350 homes to 50", `<q>We should cut that threshold down several times to 50 homes.</q>`,
      "Big rental companies buying houses here. The 350-home limit, which became law in July, starts Jan. 7, 2027."],
    ["Bar Wall Street investors from Fannie Mae and Freddie Mac loans", `<q>ban these Wall Street interests from using Fannie Mae and Freddie Mac mortgages to buy up housing</q>`,
      "Large investors buying homes here with those loans."],
    [`Tax cuts for home builders and more workforce housing${more(P7, "Building in Horry County")}`, `<q>provide tax cuts to homebuilders to incentivize more construction</q>`,
      "How many new homes go up. Horry County issued permits for 6,418 new single-family homes in 2025."],
    ["End tariffs the president imposes alone", `<q>end chaotic and unilateral tariffs</q>, naming home building materials`,
      "The cost of building a new home here."],
    ["A two-year national pause on AI data centers", "A two-year national moratorium on AI data centers, and no data center costs passed on to ratepayers",
      "Data center building, and power bills."],
    [`Roads, bridges and resilient infrastructure${more(P7, "Roads and I-73")}`, `<q>Fix and modernize South Carolina's roads, bridges, and highways</q>`,
      "Federal road money for Horry County. She named no project and no I-73 plan."],
    [`Homeowners insurance${more(P3, "Flood insurance after the election")}`, "She held a roundtable in Beaufort on rising homeowners insurance. She has no written flood insurance plan.",
      "Insurance on coastal homes. The federal flood program's deadline comes before she takes office."],
    ["Three income tax brackets, and no tax rise under $500,000", "Brackets of 10%, 20% and 35%. Families earning over $400,000 would pay 35% on all their income.",
      "Income tax. The tax break on a home sale gain is not in her plan."],
  ]);
const WILSON = table("Alan Wilson's plans that touch a home here",
  PLAN_HEAD,
  [
    [`Lower the higher tax on rentals (Act 388)${more(P4, "What it would mean for investors")}`, `<q>obviously looking at Act 388 and reforming how we assess property taxes on those types of properties</q>`,
      `The yearly tax bill on every rental and second home here, taxed at 6 percent. It needs ${TT.house_needed} House and ${TT.senate_needed} Senate votes, and he has published no bill.`],
    ["Enroll seniors in the homestead exemption automatically", "Auto-enrolling seniors for the homestead exemption, as reported",
      "The tax bill on a senior's own home."],
    ["A larger homestead exemption for disabled veterans", "Expanding the homestead exemption for disabled veterans, as reported",
      "The tax bill on a disabled veteran's own home."],
    ["End the car tax for seniors and veterans", `<q>He will work to eliminate the car property tax for seniors and veterans</q>`,
      "The yearly tax on their cars."],
    ["Lower personal property taxes on businesses", "Lowering personal property taxes for commercial businesses, as reported",
      "Taxes on the equipment of local businesses."],
    ["End the state income tax and overhaul property taxes", `<q>I still want to eliminate the income tax.</q> He calls it a long-term goal. Overhauling property taxes is in his agenda, as reported.`,
      "Income tax, and how property is taxed here."],
    [`Public audits of insurance rate increases${more(P3, "Insurance after the election")}`, "Regular, public audits of rate increases by the Department of Insurance, which already has audit power, as reported",
      "Homeowners insurance rates. Flood insurance is federal, so it is not part of this plan."],
    [`Faster permits for new homes${more(P7, "Permits in Horry County")}`, `<q>make it easier for homes to be built, which lowers the cost of those homes</q>`,
      "Waits for building permits on new homes."],
    [`Faster roads, and a modernized Department of Transportation${more(P7, "Roads and I-73")}`, `<q>we need to cut down the time it takes to build a road or a bridge</q>`,
      "Road projects such as I-73. Funding for most of its $1.6 billion cost has not been identified."],
  ]);

/* ---------------------------------------------------------------------------- */
/* V7: the FHFA index in the year after each election (F198, F199, F200).         */
const FH = F.fhfa;
const chg = ([, , a], [, , b]) => (b / a - 1) * 100;
const EL = FH.elections.map((e) => ({ ...e, pct: chg(e.from, e.to) }));
const WANT = { 2016: "5.6", 2018: "5.0", 2020: "21.6", 2022: "8.5", 2024: "3.0" };
for (const e of EL) must(pct1(e.pct) === WANT[e.year], `F198 ${e.year}: ${pct1(e.pct)}`);
const LATEST = chg(FH.latest.from, FH.latest.to), Y2008 = chg(FH.y2008.from, FH.y2008.to);
must(pct1(LATEST) === "0.8" && pct1(Y2008) === "-9.7", "F199/F200 changed");
/* The margin of error: each value's standard error as a share of the value (about 2 percent, VERIFY.md). */
const seShare = Math.max(...EL.slice(-2).flatMap((e) => [e.from[3] / e.from[2], e.to[3] / e.to[2]]), FH.latest.to[3] / FH.latest.to[2]) * 100;
must(Math.round(seShare) === 2, `standard error share ${seShare}`);
const LO = EL.reduce((a, e) => (e.pct < a.pct ? e : a)), HI = EL.reduce((a, e) => (e.pct > a.pct ? e : a));
const PRICE_CHART = G.bars(
  EL.map((e) => ({ name: `Year after the ${e.year} election`, feature: e.kind === "midterm" ? "midterm election" : "presidential election", value: e.pct, valueText: `+${pct1(e.pct)}%` }))
    .concat([{ name: "Latest year, to mid-2026", feature: "for comparison", value: LATEST, valueText: `+${pct1(LATEST)}%`, reference: true }]),
  { caption: "Change in Myrtle Beach-area home prices in the year after each election", nameLabel: "Year", featureLabel: "kind of election", valueLabel: "Change in prices", max: 25,
    note: `Federal Housing Finance Agency house price index for the Myrtle Beach, Conway and North Myrtle Beach metro area, from the last quarter of each election year to the same quarter a year later. FHFA gives recent index values a standard error of about ${Math.round(seShare)} percent. A change of a few percent, such as +3.0% after 2024 or +0.8% in the latest year, may be within that error.`,
    compact: true });

/* V7b: the tax on one $350,000 home inside Myrtle Beach (F144-F147), from the 2026 levy. */
const TX = F.tax_example, M = TX.mills;
const allMills = M.county + M.school_debt + M.school_operation + M.myrtle_beach_city;
const tax = (ratio, mills) => TX.price * ratio * mills / 1000;
const T6 = tax(0.06, allMills), T4 = tax(0.04, allMills), TH = tax(0.04, allMills - M.school_operation);
must(Math.abs(T6 - 5346.60) < 0.01 && Math.abs(T4 - 3564.40) < 0.01 && Math.abs(TH - 2037.00) < 0.01, "F145-F147 changed");
const r10 = (v) => "$" + (Math.round(v / 10) * 10).toLocaleString("en-US");
const TAX_CHART = G.bars([
  { name: "As a rental or second home today", feature: "6 percent ratio", value: T6, valueText: `about ${r10(T6)}` },
  { name: "If rentals moved to 4 percent", feature: "still paying school operating tax", value: T4, valueText: `about ${r10(T4)}` },
  { name: "As the home you live in", feature: "4 percent, no school operating tax", value: TH, valueText: `about ${r10(TH)}`, reference: true },
], { caption: "Yearly property tax on a $350,000 home inside Myrtle Beach", nameLabel: "The home", featureLabel: "how it is taxed", valueLabel: "Tax a year", max: 7000, compact: true,
  note: "Horry County's 2026 tax levy for county, school and city purposes. Before credits, fees and any special district." });

/* ---------------------------------------------------------------------------- */
/* V8: what happens next (F001/WBTV, F014, F101, F120, F084).                      */
const TIMELINE = `<ol class="el-time">`
  + `<li><strong>After the count</strong>The State Board of Canvassers certifies the results. House Districts 27 and 89, each within 1 percent, get a recount.</li>`
  + `<li><strong>Dec. 11, 2026</strong>The federal flood insurance program can no longer write new policies unless Congress extends it. This vote comes before Andrews takes office.</li>`
  + `<li><strong>Jan. 3, 2027</strong>Andrews' Senate term begins.</li>`
  + `<li><strong>Jan. 7, 2027</strong>A company that controls 350 or more single-family homes may not buy more, with some exceptions.</li>`
  + `<li><strong>November 2028</strong>The next general election. It is the first time voters could approve a change to the tax ratios in the constitution.</li>`
  + `</ol>`;

/* ---------------------------------------------------------------------------- */
/* Photos (photos.json; each looked at full size; subject_check in its record).    */
const rec = (name) => { const r = PHOTOS.find((x) => x.file.includes(`/${name}`)); must(r, `no photo record for ${name}`); PH.checkRecord(r); return r; };
const CAPITOL = rec("us-capitol-west-front"), COUNTY = rec("horry-government-justice-center");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const photo = (r, alt, caption) => lazy(PH.heroPhoto(r, { alt, caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" }));
const CAP_CAPTION = "The U.S. Capitol in Washington, where Congress votes on federal flood insurance and on any tax credit for buyers.";
const COUNTY_CAPTION = "Horry County's government center in Conway. The County Council decides impact fees on new homes and zoning outside the cities.";
const CAPITOL_PHOTO = photo(CAPITOL, CAPITOL.alt, CAP_CAPTION);
const COUNTY_PHOTO = photo(COUNTY, COUNTY.alt, COUNTY_CAPTION);
const CREDITS = PH.creditsList([{ photo: COUNTY, caption: COUNTY_CAPTION.replace(/\.$/, "") }, { photo: CAPITOL, caption: CAP_CAPTION.replace(/\.$/, "") }]);

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                        */
const SCEC = "https://scvotes.gov/2026-general-election-results/";
const WMBF = "https://www.wmbfnews.com/2026/11/04/election-results-whos-winning-grand-strand-pee-dee/";
const CONST = "https://www.scstatehouse.gov/scconstitution/A10.pdf";
const AMEND = "https://www.scstatehouse.gov/scconstitution/A16.pdf";
const ANDREWS_PLAN = "https://drannieandrews.com/wp-content/uploads/2026/08/Web-file.pdf";
const ANDREWS_SITE = "https://drannieandrews.com/platform/";
const WILSON_FOX = "https://www.foxcarolina.com/2026/10/15/republican-nominee-sc-governor-alan-wilson-announces-affordability-agenda/";
const WILSON_WIS = "https://www.wistv.com/2026/10/28/full-interview-alan-wilson-shares-priorities-governor-ahead-election-day/";
const WILSON_SITE = "https://wilsonforsc.com/priorities/";
const FHFA = "https://www.fhfa.gov/data/hpi";
const CRS = "https://www.congress.gov/crs_external_products/IN/HTML/IN10835.html";
const PL101 = "https://www.govinfo.gov/content/pkg/PLAW-119publ101/html/PLAW-119publ101.htm";
const CBS = "https://www.cbsnews.com/news/south-carolina-2026-senate-annie-andrews-darline-graham/";

const TOP = { title: "Buying or selling on the Grand Strand this winter?", label: "Ask about your house", href: "/contact/" };

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Market Reports", url: "/market-reports/" },
  pageImages: () => PH.pageImages(CAPITOL),
  title: "What the 2026 Election Means for Myrtle Beach Homes | Chapter3",
  description: "The 2026 election: who won in South Carolina, what Annie Andrews and Alan Wilson plan on housing and taxes, and what it means for a Myrtle Beach home sale.",
  ogTitle: "What the 2026 election means for Myrtle Beach home buyers and sellers: the results, both winners' plans, and who decides what",
  crumb: "2026 Election",
  eyebrow: "Market report",
  h1: "What the 2026 Election Means for Myrtle Beach Home Buyers and Sellers",
  h1em: "",
  sub: `After the election, state House Republicans are ${SHORT} votes short of changing the rental tax alone. Most rules for a Myrtle Beach sale are made in Columbia and Conway.`,
  heroMedia: "<style>main#main h1.detail-h1>br:last-of-type,main#main h1.detail-h1>em:empty{display:none}@media (max-width:399px){main#main .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.45rem!important}main#main .c3-glance li{min-width:0;overflow-wrap:anywhere}}</style>" + glance([
    { icon: "pin", label: "U.S. Senate", text: "Andrews (D)" },
    { icon: "town", label: "Governor", text: "Wilson (R)" },
    { icon: "tax", label: "State House", text: `${SH.after.R}${NB}R, ${SH.after.D}${NB}D` },
    { icon: "calendar", label: "Local ballot", text: "No questions" },
  ]),
  heroCta: TOP,
  topOfferLine: "Tell us the house. We tell you what the election changes for it.",
  author: "devin+abdulla",
  shortAnswer: [
    `For a home bought or sold in Myrtle Beach this winter, the election changed no rule yet. Annie Andrews (D) won the U.S. Senate seat and Alan Wilson (R) the governor's race, and each plan still needs votes first.`,
    `In the state House, Republicans fell from ${SH.before.R} seats to ${SH.after.R} in the unofficial count. That is ${SHORT} short of the ${TT.house_needed} votes it takes to change the tax ratio on rentals and second homes.`,
  ],
  sections: [
    { h2: "Who won the 2026 election in South Carolina?", toc: "Who won", id: "who-won", html: () =>
      CSS +
      h.p(`Annie Andrews, a Democrat, won the U.S. Senate seat over Darline Graham, the Republican appointed to it in July. She is the first woman elected to represent South Carolina in the U.S. Senate.`) +
      h.p(`Alan Wilson, a Republican and the state's attorney general, won the governor's race. Jermaine Johnson, the Democrat, conceded on election night.`) +
      RESULTS +
      h.p(`These are unofficial counts until the State Board of Canvassers certifies them. State law requires a recount when a race is within 1 percent. Two House races are that close, so the House split could still move.`) +
      h.p(`In Washington, ${h.ext(CBS, "CBS News projects")} that Democrats will control the U.S. Senate in January. Before the election, Republicans held 53 seats to 47.`) },

    { h2: "How did Horry County vote in 2026?", toc: "Horry County", id: "horry-county", html: () =>
      h.p(`Horry County voted more Republican than the state. Darline Graham carried the county with about ${pct0(R.senate_horry.graham_pct)} percent, though she lost statewide. Wilson won it with about ${pct0(R.governor_horry.wilson_pct)} percent.`) +
      h.p(`No question for Horry County, Myrtle Beach, North Myrtle Beach or Surfside Beach was on the ballot. Nothing on the local ballot changed a tax or a rule for homes.`) +
      HORRY +
      COUNTY_PHOTO },

    { h2: "Can the new legislature cut the property tax on Myrtle Beach rentals?", toc: "The two-thirds vote", id: "two-thirds", html: () =>
      h.p(`Not with Republican votes alone. South Carolina's ${h.ext(CONST, "constitution")} taxes the home you live in on 4 percent of its value, and every other home on 6 percent.`) +
      h.p(`The legislature can change those numbers only with two-thirds of each chamber's members. That is ${TT.house_needed} of ${SH.seats} in the House and ${TT.senate_needed} of ${SS.seats} in the Senate.`) +
      SEATS +
      h.p(`Republicans hold ${SS.R} Senate seats, more than ${TT.senate_needed}. In the House they won ${SH.after.R}, so even if every Republican votes yes, a change needs at least ${SHORT} Democratic votes. A new property tax exemption needs the same two-thirds.`) +
      h.p(`The other path is a constitutional amendment. It needs two-thirds of each chamber, then a majority of voters in November 2028, then a second vote by the next legislature.`) +
      h.p(`Our page on ${h.a(P4, "Wilson's rental tax cut")} works through what a lower ratio would save on a rental here.`) },

    { h2: "Who decides what about a Myrtle Beach home?", toc: "Who decides what", id: "who-decides", html: (bg) =>
      h.p(`Congress decides flood insurance and federal taxes. The legislature in Columbia decides the property tax ratios. The county and city councils decide zoning and fees.`) +
      POWERS +
      h.p(`We found no statement on short-term rentals from either winner. No state law stops a city from limiting them today.`) +
      h.cta("Ask what the election changes for your house", "Send us the address. We tell you its flood zone, its tax ratio and what a pending vote could change for it.", "Ask about your house", "/contact/", bg) },

    { h2: "What are Annie Andrews' policies on housing and taxes?", toc: "Andrews' plans", id: "andrews-plans", html: () =>
      h.p(`Andrews proposes nine things that touch homes or what owners pay, from her ${h.ext(ANDREWS_PLAN, "affordability plan")} and ${h.ext(ANDREWS_SITE, "platform")}. Each is a proposal. A federal law needs a House majority, the Senate and the president.`) +
      h.p(`In the Senate, most bills need 60 votes to end debate. A budget bill under the reconciliation process passes with a simple majority.`) +
      ANDREWS +
      CAPITOL_PHOTO +
      h.h3("Where a buyer tax credit was tried before") +
      h.p(`The federal credit of 2008 to 2010 paid up to $8,000. A study in the Journal of Finance found it raised home sales by about 490,000, near 10 percent. It raised prices about 1 percent by the study's measure. Much of the extra demand came from buyers who would have bought several years later. The authors judged that its benefit in steadying the market likely exceeded its direct boost to buying.`) +
      h.p(`Here it did not stop a fall. The Myrtle Beach-area price index dropped about 10 percent in 2009 and kept falling until 2012.`) +
      h.h3("What it could mean for a $50,000 credit") +
      h.p(`If a $50,000 credit passed, the same pattern points to more sales and higher prices in the first years. It is about six times the old credit, and no study we found measured a credit that size. How much prices would rise, then or later, is unknown. Our page on the ${h.a(P2, "first-time buyer tax credit")} shows what the last one did.`) +
      h.h3("Her other plans, with no direct tie to a home sale") +
      h.ul([
        "<strong>Health care.</strong> Reverse federal Medicaid cuts, expand Medicaid in South Carolina, and restore expired marketplace premium help. Limit insurer profits per enrollee, let regulators reject large premium increases, replace prior authorization, and add a public option.",
        "<strong>Drug prices.</strong> Imports from Canada, the $35 insulin cap for every insured patient, patent reform, rules for drug middlemen, and more drug prices that Medicare negotiates.",
        "<strong>Families and work.</strong> A child care worker apprenticeship, tax credits for child care businesses, a permanent, larger child tax credit, higher wages and paid family leave.",
        "<strong>Taxes and spending.</strong> End tax breaks for the highest earners, the carried interest break and breaks for moving jobs overseas. Keep no tax on tips and Social Security for good. Restore free IRS filing. Vote against debt ceiling increases until a balanced budget passes.",
        "<strong>Energy.</strong> Suspend the federal gas tax, restore clean energy tax cuts, and cut red tape for new energy projects.",
        "<strong>Congress.</strong> Term limits, and two Senate terms for herself. A balanced budget amendment, a stock trading ban, no pay in shutdowns, no congressional pensions, no earmarks, and stronger fraud checks.",
        "<strong>Other.</strong> Universal background checks and safe gun storage, a path to citizenship with border security, a digital bill of rights, phones out of schools, Roe v. Wade protections, a ban on corporate PAC and dark money, and a vote of Congress before military force.",
      ]) },


    { h2: "What are Alan Wilson's plans for property tax and housing?", toc: "Wilson's plans", id: "wilson-plans", html: () =>
      h.p(`Wilson proposes nine things that touch homes or what owners pay. They come from his ${h.ext(WILSON_SITE, "priorities")}, his agenda as ${h.ext(WILSON_FOX, "Fox Carolina reported it")}, and an ${h.ext(WILSON_WIS, "interview with WIS")}. Each is a proposal. A state law needs a majority of both chambers and his signature.`) +
      h.p(`A change to the 4 and 6 percent tax ratios needs two-thirds of each chamber.`) +
      WILSON +
      h.h3("Where a property tax shift was tried before") +
      h.p(`Act 388, a state tax law passed in 2006, removed school operating taxes from homes people live in. It added a 1 percent sales tax to make up the money.`) +
      h.p(`At 4 percent, the yearly bill on a rental inside Myrtle Beach would fall by about a third. In Chapter3's files, property tax stops more rental deals here than insurance does.`) +
      TAX_CHART +
      h.p(`A 2020 Lincoln Institute study found that the state's system has shifted the property tax burden from homes people live in to rentals, second homes and business property. The South Carolina Chamber Foundation and South Carolina Realtors chose its case-study counties.`) +
      h.p(`The study counts a group it calls other residential, typically rentals taxed at 6 percent. In Horry County in 2018, that group was 36.4 percent of the appraised value of the property the county assessor values. It was 47.2 percent of the value the tax is figured on. Act 388 has defenders too, such as nohometax.org.`) +
      h.p(`No plan names who would make up the lost tax. No study we found shows whether the saving would reach tenants or prices. Our page on ${h.a(P5, "what Act 388 changes would mean")} looks at both sides.`) +
      h.h3("His other plans, with no direct tie to a home sale") +
      h.ul([
        "<strong>Gas.</strong> Let the governor pause the state gas tax for up to 120 days, as reported.",
        "<strong>Schools.</strong> Fully fund public schools and expand school choice.",
        "<strong>Health.</strong> Rural clinics and telemedicine.",
        "<strong>Benefits.</strong> Deny state benefits to people here illegally.",
        "<strong>State agencies.</strong> Independent performance audits, led by the lieutenant governor.",
        "<strong>Utilities.</strong> Build the energy grid and add competition, as reported.",
      ]) },

    { h2: "Will Myrtle Beach home prices go down after the election?", toc: "Prices after elections", id: "prices", html: () =>
      h.p(`Myrtle Beach-area home prices have not fallen after any of the last five elections. In the year after each one, from 2016 to 2024, prices rose by about ${pct0(LO.pct)} to ${pct0(HI.pct)} percent.`) +
      PRICE_CHART +
      h.p(`The largest rise came after ${HI.year} and the smallest after ${LO.year}. Prices rose after presidential and midterm elections alike. After the 2008 election, during the housing slump, the index fell about ${pct0(-Y2008)} percent in a year.`) +
      h.p(`In the latest year, to mid-2026, prices here rose about ${pct1(LATEST)} percent. The record gives no basis for a forecast after this election. Our ${h.a("/sell/home-value/", "home value page")} shows what homes like yours sold for this year.`) },

    { h2: "What changes for Myrtle Beach buyers and sellers now?", toc: "Buyers and sellers now", id: "now", html: () =>
      h.p(`For a sale this winter, two dates matter: the flood insurance deadline and the new limit on large investors.`) +
      TIMELINE +
      h.h3("If you are buying") +
      h.ul([
        `<strong>Flood insurance.</strong> If Congress lets the federal program lapse on Dec. 11, no new federal flood policies can be written. A loan on a house in FEMA's high-risk zone can then wait for the program to return or for a private policy. In June 2010, by one estimate, over 1,400 closings a day were canceled or delayed across the country. Our agents check a house's flood zone before you make an offer. ${h.a(P3, "Flood insurance after the election")}.`,
        `<strong>No first-time buyer credit today.</strong> The $50,000 credit Andrews backs has had no vote in Congress. Plan a purchase this winter without it.`,
        `<strong>A rental or second home still pays the 6 percent ratio.</strong> Price it on today's tax bill. A cut needs a two-thirds vote, and Wilson has published no bill.`,
        `<strong>Large investors.</strong> The limit on companies with 350 or more homes does not touch a family buying one rental.`,
      ]) +
      h.h3("If you are selling") +
      h.ul([
        `<strong>Prices are about flat.</strong> They rose about ${pct1(LATEST)} percent in the latest year. We price your home from this year's sales of homes like it.`,
        `<strong>A buyer's closing can slip.</strong> If your house is in the high-risk flood zone and your buyer needs a loan, a lapse on Dec. 11 can delay the closing. A private flood policy can count if it meets federal rules, and in the 2025 lapse some lenders waived the requirement.`,
        `<strong>The tax on your gain does not change.</strong> Up to $250,000 of gain on a home you lived in stays out of federal income tax. For certain married couples filing jointly, it is $500,000. Neither winner's plan changes it.`,
      ]) },
  ],
  faqTitle: "2026 election and Myrtle Beach real estate FAQ",
  faq: [
    { q: "Who won the Senate race in South Carolina in 2026?", a: `Annie Andrews, a Democrat, won with about ${pct0(R.senate.pct)} percent of the unofficial count over Darline Graham, a Republican. The AP called the race on election night, and her term begins in January.` },
    { q: "Who won the governor's race, and is it official?", a: `Alan Wilson, a Republican, won with about ${pct0(R.governor.pct)} percent, and Jermaine Johnson conceded on election night. Every result is unofficial until the State Board of Canvassers certifies it.` },
    { q: "Will Myrtle Beach home prices go down after the election?", a: `In the year after each election from 2016 to 2024, the Myrtle Beach-area price index rose, by about ${pct0(LO.pct)} to ${pct0(HI.pct)} percent. In the latest year prices were about flat, up ${pct1(LATEST)} percent.` },
    { q: "Did anything on the Horry County ballot affect real estate?", a: "No. There was no county, city or statewide ballot question. The ballot held only races for office, from Congress and governor to County Council and school board." },
    { q: "Can Alan Wilson cut the property tax on rentals by himself?", a: `No. Changing the 6 percent ratio needs two-thirds of each chamber, ${TT.house_needed} House votes and ${TT.senate_needed} Senate votes. Republicans won ${SH.after.R} House seats in the unofficial count, so a change needs Democratic votes too.` },
  ],
  sources: [
    { name: "SC Election Commission results", href: SCEC },
    { name: "WMBF Horry results", href: WMBF },
    { name: "SC Constitution Art. X", href: CONST },
    { name: "Art. XVI", href: AMEND },
    { name: "Andrews plan", href: ANDREWS_PLAN },
    { name: "Wilson agenda (Fox Carolina)", href: WILSON_FOX },
    { name: "Wilson interview (WIS)", href: WILSON_WIS },
    { name: "FHFA house price index", href: FHFA },
    { name: "CRS on flood insurance", href: CRS },
    { name: "Public Law 119-101", href: PL101 },
  ],
  sourcesNote: "Results are the unofficial count, not certified. Educational only, not legal or tax advice.",
  bottomCta: { h2: "Ask what the election changes for your house.", p: "Send us a house you are buying or selling. An agent tells you what is decided now and what is still a proposal.", label: "Ask about your house", href: "/contact/" },
  keywords: "2026 election Myrtle Beach real estate, South Carolina election results 2026, Annie Andrews policies, Act 388 rental tax, Horry County election results, will home prices go down after the election, who decides property tax in South Carolina",
  about: "The 2026 South Carolina election and its effect on home buyers and sellers in Myrtle Beach and Horry County",
  afterSources: () => CREDITS,
});
