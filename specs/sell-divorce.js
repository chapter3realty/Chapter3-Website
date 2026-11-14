/* /sell/divorce/ - selling a house during a divorce in South Carolina: who gets the house (marital property, the 15
 * factors, no 50/50 rule), the three choices (sell and split, one buys the other out, one keeps it for a time) worked
 * on the county's middle home with a small calculator, how a buyout and the mortgage work, what happens when the two
 * owners do not agree (the court's power to order a sale, the notice of the case, how we run a listing for two
 * spouses), the tax rules for divorcing owners with our chart of the gain on a typical house, and the steps in order.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 1, 2026-11-08. Design: the approved pilots of batch 2026-11-a
 * (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line headline with the italic
 * sub line at about half the H1 size, the answer first, one card style used once (the three choices, the one place the
 * reader chooses), plain lists under thin rules elsewhere, one block width of 720 px, and on wide screens the
 * calculator, the chart and the photo beside the paragraphs that explain them. DESIGN.md in the batch folder says why.
 * A sensitive page: no story, no example family, no judgement, no prediction of what a court will do. Nothing red.
 * Facts: Blog-Brain batches/2026-11-n/sell-divorce/facts.md, VERIFIED rows, and CORRECTED rows only in the verifier's
 * wording (VERIFY.md). Struck wording: sell-divorce-struck.json (no "is marital property" without "usually", no
 * "stays theirs", no "once it is filed, it does", no three-month wait for every ground, no "contested issues go to
 * mediation", no "both sign the listing" as law, no "agree in writing", no "qualify alone", no "often paid with a new
 * loan", no lender rule without the occupancy limit, no "buyout deed saves", no "time away counts against", no
 * "since 1996", no Clerk of Court "is at 1301" without "main").
 * Not used: what share courts usually give (Not verified 1), mixing an inherited house (Not verified 2, sent to an
 * attorney), taking selling costs off a buyout (3), who pays the mortgage while the case is open (4, sent to an
 * attorney), whether a spouse off the deed must sign (5), divorce counts (6), court-officer deed counts (7), the venue
 * sentence of row 34 (cut, as the verifier allowed).
 * Data, never typed (website working copy, data/2026-11-n/sell-divorce/):
 *   findings.json   the middle home (row 15, reused from data/2026-10-d/sell-home-value/), the worked sale and buyout
 *                   (rows 19, 20, 29 to 31), the gain by year bought from the FHFA index (rows 32, 33)
 *   photos.json     not used since fix round 1 (the reused courthouse photo is out; the owner: "the photos should be
 *                   of the topic"). The photo partner's shot list (batch shot-list.md) is the way back to a photo.
 * Owner questions: no line rests on Q1, Q3 or Q4 since fix round 1. The offers rest on the free price from recorded
 * county sales, the practice the owner approved on /sell/fsbo/ (Q2's proposed answer, without the appraisal wording).
 * Fix round 1 (2026-11-08, REVIEW-1.md): the practice lines that rest on unanswered Q1 and Q4 are out; the offers rest
 * only on the free price from recorded county sales (approved on /sell/fsbo/). The worked table, the photo, the Fannie
 * Mae and Garn-St Germain detail and the repeats are cut; the two half-answered H2s open with the plain answer.
 * New rows 36 to 38 (VERIFIED-BY-FIXER): the short sale (CFPB), temporary support and debts (20-3-130), both names on
 * the deed.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/sell/divorce/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "sell-divorce");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json");
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const r50 = (v) => "$" + (Math.round(v / 50) * 50).toLocaleString("en-US");
const CTA = "/contact/";

/* ---- Row 15: the middle home (carried from /sell/home-value/ and /sell/fsbo/: one fact, one value). ---- */
if (F.price.median_resale_house !== 350000 || F.price.n !== 6866) throw new Error("row 15 moved");

/* ---- Rows 19, 20, 29 to 31: the worked sale and buyout. ---- */
const WS = F.worked_sale, WB = F.worked_buyout;
const PRICE = WS.price, OWED = WS.loan_balance_example, EQ = WS.equity_before_costs;
const DEED = Math.ceil(PRICE / 500) * 1.85;
if (PRICE !== 350000 || OWED !== 200000 || EQ !== 150000 || DEED !== 1295 || WS.deed_fee !== DEED) throw new Error("rows 19, 29: the worked sale moved");
if (WS.agent_fee_per_1_percent !== 3500 || WS.each_half_after_deed_fee_before_agent_fees !== 74352.5 || WS.each_half_agent_fee_per_1_percent !== 1750) throw new Error("row 29 moved");
if (WB.agreed_value !== PRICE || WB.payment_to_leaving_spouse_if_equal !== 75000 || WB.new_loan_at_least !== 275000 || WB.deed_fee_spouse_to_spouse !== 0 || WB.agent_fee !== 0) throw new Error("row 30 moved");
const HALF = WS.each_half_after_deed_fee_before_agent_fees;

/* ---- Rows 32, 33: the gain on the middle home by year bought (FHFA index, CBSA 34820). ---- */
const GAIN = F.chart_gain_by_year_bought.filter((r) => r.year_bought >= 1995 && r.year_bought <= 2025);
const by = (y) => GAIN.find((r) => r.year_bought === y);
if (F.meta.fhfa_latest !== "2026Q2" || F.meta.fhfa_latest_index !== 378.71) throw new Error("row 32 moved");
if (by(2016).implied_price_paid !== 167000 || by(2016).gain !== 183000 || by(2006).implied_price_paid !== 199000 || by(2006).gain !== 151000
  || by(2021).implied_price_paid !== 230000 || by(2021).gain !== 120000) throw new Error("row 33 moved");
/* Row 33 (verifier): 1998 or later is under the limit even at the edge of the index's error; mid-1990s "close to the limit". */
if (!GAIN.filter((r) => r.year_bought >= 1998).every((r) => r.gain < 250000) || by(1995).gain <= 250000 || by(1996).gain > 250000) throw new Error("row 33: the 1998 line moved");

/* ---- Links ---- */
const ST = (t, c) => `https://www.scstatehouse.gov/code/statmast.php?title=${t}&amp;chapter=${c}`;
const T20_3 = ST(20, 3), T63_3 = ST(63, 3), T27_7 = ST(27, 7), T15_11 = ST(15, 11), T12_24 = ST(12, 24), T40_57 = ST(40, 57);
const SCADR = "https://www.sccourts.org/resources/judicial-community/court-rules/adr/rule-3/";
const RPC = "https://www.sccourts.org/resources/judicial-community/court-rules/appellate/rule-407/rule-115/";
const GARN = "https://www.law.cornell.edu/uscode/text/12/1701j-3";
const CFR = "https://www.ecfr.gov/current/title-12/chapter-I/part-191/section-191.5";
const P523 = "https://www.irs.gov/publications/p523";
const P504 = "https://www.irs.gov/publications/p504";
const FHFA = "https://www.fhfa.gov/data/hpi";
const CLERK = "https://www.horrycountysc.gov/departments/clerk-of-court/";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const CFPB = "https://www.consumerfinance.gov/ask-cfpb/what-is-a-short-sale-en-290/";

/* ---- Rows 1, 4: what the court divides and what it does not, a plain two-column list under thin rules. ---- */
const DIVIDED = `<div class="dv-two" role="group" aria-label="What South Carolina divides in a divorce, and what it does not">`
  + `<div><p class="k">Usually divided</p><ul>`
  + `<li>A house either of you bought during the marriage</li>`
  + `<li>Anything else either of you bought during the marriage and still owns on the day the case is filed</li>`
  + `<li>A rise in the value of one spouse's house that came from the other spouse's efforts</li></ul></div>`
  + `<div><p class="k">Not divided</p><ul>`
  + `<li>What one spouse inherited, or was given by someone other than the other spouse</li>`
  + `<li>What one spouse owned before the marriage, and what was bought with either of those</li>`
  + `<li>What a written agreement, such as a prenuptial agreement, leaves out</li>`
  + `<li>What is bought after a temporary court order or a signed property agreement</li></ul></div></div>`;

/* ---- Rows 3, 16 to 20, 31: the three choices, the one place the reader chooses (cards). ---- */
const card = (k, title, text) => `<li><span class="k">${k}</span><b>${title}</b>${text}</li>`;
const CHOICES = `<ul class="dv-cards" aria-label="Three choices for the house in a divorce">`
  + card("Choice 1", "Sell and split", "The house is sold, the loan is paid off at closing, and the two of you divide what is left. The sale pays the deed fee and agent fees. Neither of you owes the old loan after.")
  + card("Choice 2", "One buys the other out", `One of you keeps the house and pays the other for their share. The deed between you pays no deed fee, and there is no agent fee. The money can come from a ${h.a("#buyout", "new loan")}.`)
  + card("Choice 3", "One keeps it for a time", "One of you stays in the house for a time, and it is sold or bought out later. Both of you still owe the loan, unless the lender releases one of you.")
  + `</ul>`;

/* ---- The calculator: the reader's own value, balance, agent fee and share. Never a rate or a loan payment. ---- */
const CALC = `<div class="dv-calc" role="group" aria-labelledby="dvCalcT">`
  + `<p class="k" id="dvCalcT">Try your own numbers</p>`
  + `<div class="dv-in"><label for="dvP">Value of the house</label><span class="u">$ <input id="dvP" type="number" min="0" step="1000" value="${PRICE}" oninput="dvCalc()"></span></div>`
  + `<div class="dv-in"><label for="dvO">Still owed on it</label><span class="u">$ <input id="dvO" type="number" min="0" step="1000" value="${OWED}" oninput="dvCalc()"></span></div>`
  + `<div class="dv-in"><label for="dvF">A fee you were quoted, in percent</label><span class="u"><input id="dvF" class="sm" type="number" min="0" max="10" step="0.25" value="1" oninput="dvCalc()"> %</span></div>`
  + `<div class="dv-in"><label for="dvS">Your share, the split you agree or the court orders</label><span class="u"><input id="dvS" class="sm" type="number" min="0" max="100" step="1" value="50" oninput="dvCalc()"> %</span></div>`
  + `<dl class="dv-out"><div><dt>If you sell, you get about</dt><dd id="dvR1">${money((EQ - DEED - WS.agent_fee_per_1_percent) / 2)}</dd></div>`
  + `<div><dt>If your spouse keeps it, you are paid</dt><dd id="dvR2">${money(EQ / 2)}</dd></div>`
  + `<div><dt>If you keep it, you pay your spouse</dt><dd id="dvR3">${money(EQ / 2)}</dd></div>`
  + `<div><dt>and your new loan is at least</dt><dd id="dvR4">${money(OWED + EQ / 2)}</dd></div></dl>`
  + `<p class="n" id="dvUw" hidden>You owe more than the house is worth. The money from a sale would not pay off the loan. The lender may agree to a short sale.</p>`
  + `<p class="n">The box starts at 1 percent. Type the fee an agent quoted you.</p></div>`
  + `<script>function dvCalc(){var g=function(i){var v=parseFloat(document.getElementById(i).value);return isFinite(v)&&v>0?v:0};`
  + `var m=function(n){return "$"+Math.round(Math.max(0,n)).toLocaleString("en-US")};var p=g("dvP"),o=g("dvO"),f=g("dvF"),s=Math.min(g("dvS"),100)/100;`
  + `var e=p-o,d=Math.ceil(p/500)*1.85;document.getElementById("dvR1").textContent=m((e-d-p*f/100)*s);`
  + `document.getElementById("dvR2").textContent=m(e*s);document.getElementById("dvR3").textContent=m(e*(1-s));document.getElementById("dvR4").textContent=m(o+e*(1-s));document.getElementById("dvUw").hidden=!(o>p)}</script>`;

/* ---- Rows 11, 16, 18, 20, 30: how a buyout works, a numbered list under thin rules. ---- */
const stp = (title, text) => `<li><b>${title}</b>${text}</li>`;
const BUYOUT = `<ol class="dv-num" aria-label="How a buyout works, in order">`
  + stp("Agree on the value", "Use an appraisal, or a real estate agent's written price estimate. If you do not agree, the judge decides the value from the evidence and may appoint an expert, such as an appraiser.")
  + stp("Write the terms down", "The agreement says who keeps the house, what the other is paid and by when.")
  + stp("The new loan", `The spouse who keeps the house must qualify for a new loan. It has to pay off the old loan and pay the other spouse. On the example above, that is at least ${money(WB.new_loan_at_least)}.`)
  + stp("The deed", `A deed from one spouse to the other as part of the divorce is ${h.ext(T12_24, "exempt from the deed fee")}. The exception is a spouse who gets it and is neither a US citizen nor a US resident. A sale of the same house pays ${money(DEED)}. To find a house's deed, use our ${h.a("/buyers/property-records/deeds/", "Horry County deed search guide")}.`)
  + stp("The old loan is paid off", "The new loan pays off the old one. That ends the debt of the spouse who left.")
  + `</ol>`;

/* ---- Rows 32, 33: the chart. A line of the estimated gain by year bought, with the $250,000 limit. Text sits in
   HTML at reading size; the SVG holds only the lines, so it stretches to any width without shrinking a label. ---- */
const YMAX = 300000, X0 = 1995, X1 = 2025;
const xp = (y) => (y - X0) / (X1 - X0) * 100, yp = (v) => (1 - v / YMAX) * 100;
const pts = GAIN.map((r) => `${(xp(r.year_bought) * 6).toFixed(1)},${(yp(r.gain) * 2.4).toFixed(1)}`).join(" ");
const CHART_LABEL = `Estimated gain on the whole of a typical Horry County house that sells for about ${money(PRICE)} today, by the year it was bought: close to the $250,000 limit for a house bought in the mid-1990s, about ${r1k(by(2006).gain)} for 2006, ${r1k(by(2016).gain)} for 2016 and ${r1k(by(2021).gain)} for 2021, falling toward zero for a house bought recently.`;
const CHART = `<figure class="dv-chart">`
  + `<p class="cap" id="dvChartT">Estimated gain on the whole house, for a typical Horry County house that sells for about ${money(PRICE)} today, by the year it was bought</p>`
  + `<div class="dv-plot" id="dvPlot">`
  + [0, 100000, 200000].map((v) => `<span class="dv-yl" style="top:${yp(v)}%">${v ? "$" + v / 1000 + "k" : "$0"}</span>`).join("")
  + `<svg viewBox="0 0 600 240" preserveAspectRatio="none" role="img" aria-label="${CHART_LABEL}">`
  + [0, 100000, 200000].map((v) => `<line x1="0" x2="600" y1="${yp(v) * 2.4}" y2="${yp(v) * 2.4}" class="g" vector-effect="non-scaling-stroke"/>`).join("")
  + `<polygon points="0,240 ${pts} 600,240" class="a"/>`
  + `<polyline points="${pts}" class="l" vector-effect="non-scaling-stroke"/>`
  + `<line x1="0" x2="600" y1="${yp(250000) * 2.4}" y2="${yp(250000) * 2.4}" class="lim" vector-effect="non-scaling-stroke"/></svg>`
  + `<span class="dv-lim" style="top:${yp(250000)}%"><span class="w">One owner's limit, </span>$250,000</span>`
  + `<span class="dv-dot" id="dvDot" aria-hidden="true"></span><span class="dv-tip" id="dvTip" aria-hidden="true"></span></div>`
  + `<div class="dv-xa" aria-hidden="true">${[1995, 2005, 2015, 2025].map((y) => `<span style="left:${xp(y)}%">${y}</span>`).join("")}</div>`
  + `<p class="dv-xt" aria-hidden="true">Year the house was bought</p>`
  + `<table class="sr"><caption>Estimated gain by year bought</caption><thead><tr><th scope="col">Year bought</th><th scope="col">Estimated gain</th></tr></thead><tbody>`
  + GAIN.map((r) => `<tr><td>${r.year_bought}</td><td>${r1k(r.gain)}</td></tr>`).join("") + `</tbody></table>`
  + `<figcaption>Improvements and selling costs, not counted here, lower the gain.</figcaption>`
  + `<script>(function(){var d=${JSON.stringify(GAIN.map((r) => [r.year_bought, r.gain]))},p=document.getElementById("dvPlot"),t=document.getElementById("dvTip"),o=document.getElementById("dvDot");`
  + `function show(e){var b=p.getBoundingClientRect(),x=Math.min(Math.max((e.clientX-b.left)/b.width,0),1),i=Math.round(x*(d.length-1)),r=d[i],l=i/(d.length-1)*100,y=(1-r[1]/${YMAX})*100;`
  + `o.style.left=l+"%";o.style.top=y+"%";o.style.display="block";t.textContent="Bought in "+r[0]+": gain about $"+(Math.round(r[1]/1000)*1000).toLocaleString("en-US");`
  + `t.style.left=Math.min(Math.max(l,18),82)+"%";t.style.top=Math.max(y-4,0)+"%";t.style.display="block"}`
  + `p.addEventListener("pointermove",show);p.addEventListener("pointerdown",show);p.addEventListener("pointerleave",function(){t.style.display="none";o.style.display="none"})})()</script>`
  + `</figure>`;

/* ---- Rows 2, 7, 9, 10, 14, 34: the steps in order, a numbered line, no card around each step. Each step says only
   what the sections above do not, or points to them. ---- */
const step = (n, when, title, text) => `<li><span class="n" aria-hidden="true">${n}</span><span class="c"><span class="t">${when}</span><b>${title}</b>${text}</span></li>`;
const STEPS = `<ol class="dv-steps" aria-label="The steps to sell or keep a house in a South Carolina divorce, in order">`
  + step(1, "Before the case", "Living apart", `A no-fault divorce is one where neither spouse has to prove the other did wrong. In South Carolina it needs ${h.ext(T20_3, "one year of living apart")}, without living together as a couple.`)
  + step(2, "The case", "The case is filed in Family Court", `In Horry County, it is filed with the ${h.ext(CLERK, "Clerk of Court")}. The clerk has offices in Conway and Myrtle Beach.`)
  + step(3, "If needed", "A notice of the case on the house", `It matters most when the house is in one spouse's name.`)
  + step(4, "Before a judge decides", "Mediation", `Most issues you disagree on, the house included, go to a mediator first.`)
  + step(5, "The decision", "Agreement or order", "A signed agreement or the judge's order says whether the house is sold, bought out or kept.")
  + step(6, "Before or after the divorce", "The sale or the deed", `On most grounds a final divorce cannot be granted until three months after the case is filed. On the one-year-apart ground, it can be granted once the other spouse has answered the case or missed the deadline to answer.`)
  + step(7, "Closing", "The money", `The lawyer who holds the money from a sale, such as the closing attorney, ${h.ext(RPC, "must keep any part the two of you dispute")} separate. It stays separate until you agree, a court decides, or a narrow exception in the rule applies. The part you agree on is paid out promptly.`)
  + `</ol>`;

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys or tax professionals, and nothing on this page is legal or tax advice. For advice on your own divorce, talk to a South Carolina family law attorney; for the tax on your sale, a tax professional.</p>`;

/* ---- The glance row under the H1: what a spouse came to learn first (rows 6, 9, 18, 31). ---- */
const GLANCE = PK.glance([
  { icon: "calendar", label: "Before it is final", text: "you can sell during the case, when the two of you agree" },
  { icon: "key", label: "Off the loan", text: "only by a sale, a new loan or the lender's release" },
  { icon: "home", label: "A spouse who will not sign", text: "can be replaced by the clerk of court, on a judge's order" },
]);

/* ---- The page's own styles (the pilots' treatment, prefix dv-). ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const INK = "#8a5226", BRASS = "#c4783a", RULE = "rgba(28,32,40,.16)";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line. */
  + `${S} .detail-h1 em{display:block;max-width:720px;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  + `${S} .sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}`
  /* divided and not divided: two plain columns under thin rules */
  + `${S} .dv-two{display:grid;gap:1.2rem 2rem;max-width:720px;margin:1.1rem 0 1.5rem}@media (min-width:700px){${S} .dv-two{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .dv-two .k,${S} .dv-cards .k,${S} .dv-calc .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .4rem}`
  + `${S} .dv-two ul{list-style:none;margin:0;padding:0}${S} .dv-two li{margin:0;padding:.7rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.55;font-size:1.0625rem}`
  /* the three choices: the one place with cards */
  + `${S} .dv-cards{list-style:none;margin:1.1rem 0 1.5rem;padding:0;display:grid;gap:.75rem;max-width:720px}@media (min-width:760px){${S} .dv-cards{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .dv-cards li{margin:0;padding:1rem 1.1rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  + `${S} .dv-cards b,${S} .dv-num b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.3rem}`
  /* the numbered buyout list under thin rules */
  + `${S} .dv-num{list-style:none;margin:1.1rem 0 1.5rem;padding:0;max-width:720px;counter-reset:b}`
  + `${S} .dv-num li{margin:0;padding:.9rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .dv-num li{counter-increment:b;position:relative;padding-left:3rem}${S} .dv-num li:last-child{border-bottom:1px solid ${RULE}}`
  + `${S} .dv-num li::before{content:counter(b);position:absolute;left:0;top:.95rem;display:inline-flex;align-items:center;justify-content:center;width:2rem;height:2rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}`
  /* the calculator */
  + `${S} .dv-calc{max-width:600px;margin:1.4rem 0 1.5rem;padding:1.25rem 1.3rem 1.1rem;border-radius:20px;box-sizing:border-box;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14);color:var(--ivory);font-family:var(--sans)}`
  + `${S} .dv-calc .k{color:var(--brass-2);margin-bottom:.9rem}`
  + `${S} .dv-in{display:flex;justify-content:space-between;align-items:center;gap:.4rem .8rem;margin:0 0 .7rem;flex-wrap:wrap}`
  + `${S} .dv-in label{color:rgba(244,239,232,.92);font-size:1rem;line-height:1.35;flex:1 1 10rem}${S} .dv-in .u{white-space:nowrap;color:rgba(244,239,232,.7)}`
  + `${S} .dv-in input{width:9rem;min-height:44px;box-sizing:border-box;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.4);border-radius:8px;color:#f4efe8;font-family:var(--sans);font-size:1.05rem;padding:.4rem .6rem;text-align:right}`
  + `${S} .dv-in input.sm{width:5.5rem}`
  + `${S} .dv-out{margin:1rem 0 0;padding:.9rem 0 0;border-top:1px solid rgba(244,239,232,.22);display:grid;gap:.55rem}`
  + `${S} .dv-out div{display:flex;justify-content:space-between;align-items:baseline;gap:1rem}${S} .dv-out dt{color:rgba(244,239,232,.88);font-size:1rem;line-height:1.35}`
  + `${S} .dv-out dd{margin:0;color:var(--brass-2);font-family:var(--serif);font-size:1.4rem;line-height:1.1;white-space:nowrap}`
  + `${S} .dv-calc .n{margin:.8rem 0 0;color:rgba(244,239,232,.75);font-size:.95rem;line-height:1.5}`
  /* the chart: one card, a line and the limit; labels in HTML at reading size */
  + `${S} .dv-chart{max-width:720px;margin:1.3rem 0 1.5rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;box-sizing:border-box;${CARD}}`
  + `${S} .dv-chart .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 1rem}`
  + `${S} .dv-plot{position:relative;height:220px;margin:1.4rem .4rem 0 3rem;touch-action:pan-y}${S} .dv-plot svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}`
  + `${S} .dv-plot .g{stroke:rgba(28,32,40,.12);stroke-width:1}${S} .dv-plot .a{fill:rgba(28,32,40,.07)}`
  + `${S} .dv-plot .l{fill:none;stroke:var(--navy);stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}`
  + `${S} .dv-plot .lim{stroke:${BRASS};stroke-width:2;stroke-dasharray:6 5}`
  + `${S} .dv-yl{position:absolute;left:-3rem;transform:translateY(-50%);font-family:var(--sans);font-size:.85rem;color:var(--muted)}`
  + `${S} .dv-lim{position:absolute;right:0;transform:translateY(-130%);font-family:var(--sans);font-size:.9rem;font-weight:700;color:${INK};background:rgba(255,255,255,.75);padding:0 .3rem;border-radius:4px;white-space:nowrap}@media (max-width:419px){${S} .dv-lim .w{display:none}}`
  + `${S} .dv-dot{display:none;position:absolute;width:10px;height:10px;margin:-5px 0 0 -5px;border-radius:50%;background:var(--navy);box-shadow:0 0 0 2px #fff}`
  + `${S} .dv-tip{display:none;position:absolute;transform:translate(-50%,-100%);white-space:nowrap;background:var(--navy);color:#fff;font-family:var(--sans);font-size:.85rem;padding:.25rem .5rem;border-radius:6px;pointer-events:none}`
  + `${S} .dv-xa{position:relative;height:1.4rem;margin:.4rem .4rem 0 3rem;font-family:var(--sans);font-size:.85rem;color:var(--muted)}${S} .dv-xa span{position:absolute;transform:translateX(-50%)}${S} .dv-xa span:first-child{transform:none}${S} .dv-xa span:last-child{transform:translateX(-100%)}`
  + `${S} .dv-xt{margin:.1rem 0 0 3rem;font-family:var(--sans);font-size:.85rem;color:var(--muted)}`
  + `${S} .dv-chart figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.8rem}`
  /* the steps: numbers on a line, no card around each step */
  + `${S} .dv-steps{list-style:none;margin:1.3rem 0 1.5rem;padding:0;max-width:720px;position:relative}`
  + `${S} .dv-steps::before{content:"";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.14)}`
  + `${S} .dv-steps>li{position:relative;margin:0 0 1.35rem;padding:0 0 0 3.3rem}${S} .dv-steps>li:last-child{margin-bottom:0}`
  + `${S} .dv-steps .n{position:absolute;left:0;top:0;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;box-shadow:0 0 0 4px #f8f4ee}`
  + `${S} .dv-steps .c{display:block;color:var(--muted);line-height:1.6}`
  + `${S} .dv-steps .t{display:block;margin:0 0 .15rem;color:${INK};font-family:var(--sans);font-size:.78rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;line-height:1.3;padding-top:.1rem}`
  + `${S} .dv-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.12rem;line-height:1.35;margin-bottom:.25rem}`
  /* A wide screen: the calculator and the chart beside the paragraphs that explain them. */
  + `@media (min-width:1100px){${S} .dv-side{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:auto auto auto 1fr;column-gap:2.5rem;max-width:1040px;align-items:start}`
  + `${S} .dv-side>*{grid-column:1}${S} .dv-side>.dv-calc,${S} .dv-side>.dv-chart{grid-column:2;grid-row:1/5;margin:.3rem 0 1.2rem!important;max-width:none}`
  + `${S} .dv-side .dv-in label{flex:1 1 8rem}${S} .dv-side .dv-in input{width:7.5rem}${S} .dv-side .dv-in input.sm{width:5rem}}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .dv-cards b,${S} .dv-steps b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* a phone: the three hero tiles as short rows, not squeezed columns */
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

/* The FAQ: questions the sections do not answer in full, said short (rows 3, 4, 18, 37). */
const FAQ = [
  { q: "Is South Carolina a 50/50 divorce state?", a: "No. The law has no equal-split rule, so the judge's split of the house can be more or less than half." },
  { q: "Who pays the mortgage during the divorce?", a: "Both of you owe the lender while both names are on the loan, so a missed payment is missed for both of you. While the case is open, the Family Court can order temporary support. A support order can make one spouse pay debts for the other, such as the mortgage." },
  { q: "What if we owe more than the house is worth?", a: "Then the money from a sale would not pay off the loan. The lender may agree to a short sale, a sale for less than what is owed. If the lender forgives the rest, get that in writing." },
  { q: "Is a house I inherited marital property in South Carolina?", a: "Usually not. What one spouse inherited is not marital property under the law. Whether it became marital, for example after it was put in both names, is a question for a family law attorney." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "Selling a House During Divorce in South Carolina: 3 Choices",
  description: "Can you sell a house during a divorce in South Carolina? The three choices, how a buyout works, how to get off the loan, and the tax, with a calculator.",
  ogTitle: "Selling a house during a divorce in South Carolina: sell and split, a buyout, or keep it for a time",
  crumb: "Selling in a Divorce",
  eyebrow: "Selling a home",
  h1: "Selling a house during a divorce in South Carolina",
  h1em: "The three choices: sell and split, one buys the other out, or one keeps it for a time.",
  ogImage: "https://chapter3realty.com/images/2026-11-n/sell-divorce/share.jpg",
  ogImageAlt: "Selling a house during a divorce in South Carolina: the three choices.",
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. No we, our or us. */
  sub: "If the two owners cannot agree on the house during a divorce, South Carolina's Family Court decides, and it can order the house sold.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: "A free price for the house from recorded county sales, one number both of you can see.", label: "Have us price the house", href: CTA },
  author: "devin",
  shortAnswer: [
    "Yes. You can sell a house during a divorce in South Carolina, before or after the divorce is final, when the two of you agree. If you do not, the Family Court decides, and it can order the house sold.",
    "A sale pays off the loan, so neither of you owes it after. If one of you keeps the house, the other still owes the old loan until it is paid off or the lender releases them.",
  ],
  sections: [
    { h2: "Who gets the house in a divorce in South Carolina?", toc: "Who gets the house", id: "who-gets-it", html: () =>
      h.p(`The ${h.ext(T63_3, "Family Court")} divides the house as part of the marital property. Lawyers call this equitable distribution, a fair split that is not always half.`) +
      h.p("In South Carolina, a house bought during the marriage is usually marital property, even if only one spouse's name is on the deed. The exceptions include a house bought with one spouse's inherited or premarital money, or one a prenuptial agreement leaves out.") +
      DIVIDED +
      h.p("A house one spouse owned before the marriage is not marital property under the law. Any rise in its value that came from the other spouse's efforts can be divided.") +
      h.h3("Is it split 50/50?") +
      h.p(`No. South Carolina ${h.ext(T20_3, "law")} does not split marital property in half by rule. The judge weighs 15 factors, as much or as little as the judge finds right.`) +
      h.p("The factors include how long the marriage lasted and each spouse's income. They include what each spouse put in, counting work in the home, any debts on the property and the tax effect of the split. One factor is whether the parent with custody of the children gets the family home, or the right to live in it for a reasonable time.") +
      h.p("Once the court divides the property, that part of the order is final. It can be changed only on appeal.") },

    { h2: "Sell, buy out your spouse, or keep the house: what does each leave you?", toc: "The three choices", id: "choices", html: (bg) =>
      h.p("The two of you can choose any of the three by agreement. If you cannot agree, the judge chooses.") +
      CHOICES +
      `<div class="dv-side">` +
      h.p(`The calculator works out the first two choices with your own numbers. It starts at a typical Horry County house, about ${money(PRICE)}, with an example ${money(OWED)} still owed. We read the county's recorded house sales for the 12 months to September 2026; that was the middle price, condos aside.`) +
      h.p("It also starts at an equal split, though a court's split is not always equal.") +
      CALC +
      h.p(`The results leave out the closing attorney's fee, other closing costs and the new loan's own costs. Our ${h.a("/sell/net-proceeds/", "net proceeds calculator")} counts every cost of a sale, and our ${h.a("/sell/home-value/", "home value page")} shows how a house here is priced from recorded sales.`) +
      `</div>` +
      h.h3("When a buyout will not work") +
      h.p("If the one who wants to keep the house cannot get a new loan for the buyout, the buyout cannot be paid that way. Then the choices left are a sale, keeping it for a time, or the judge's decision.") +
      h.p(`If one of you keeps the house for a time, the money question waits until it is sold or bought out. A written agreement or order that lets one spouse live there also matters for the ${h.a("#tax", "tax rule")} later.`) +
      h.cta("What would each choice leave the two of you?", "Send us the address and what is still owed. We price the house from recorded sales near it and set a sale and a buyout side by side.", "Have us work out both choices on your house", CTA, bg) },

    { h2: "How does a buyout work, and how does the other spouse get off the mortgage?", toc: "How a buyout works", id: "buyout", html: () =>
      h.p("The spouse who leaves gets off the loan in one of three ways. The house is sold, a new loan pays off the old one, or the lender releases them. A divorce order that gives the house to one spouse does not do it, and neither does a quitclaim deed.") +
      h.p("The money for a buyout can come from that new loan, which some people call a refinance.") +
      BUYOUT +
      h.h3("If the old loan stays") +
      h.p(`The lender ${h.ext(GARN, "cannot call the whole loan due")} because of the divorce, if the spouse on the loan lived there and the one who keeps it lives there. This does not cover a rental or a second home. The spouse who left still owes that loan unless the lender releases them.`) +
      h.p(`If you plan to buy your next home, our page on ${h.a("/sell/sell-or-buy-first/", "selling or buying first")} covers the order of the two.`) },

    { h2: "Can my spouse sell the house without me, or refuse to sell?", toc: "If you do not agree", id: "agree", html: (bg) =>
      h.p("If both of your names are on the deed, your spouse cannot sell the whole house without you. A sale of the whole house needs both of you to sign the deed, or a judge's order.") +
      h.p(`If your spouse refuses to sell, the judge can order the sale and order your spouse to sign the deed. If your spouse still will not, the judge can ${h.ext(T20_3, "have the county's clerk of court sign it")}, and that signature counts the same.`) +
      `<h3 id="notice" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">If only your spouse's name is on the deed</h3>` +
      h.p(`Then your claim to the house does not bind a buyer or lender until a ${h.ext(T15_11, "notice of the divorce case")} is filed. Either spouse can file it with the clerk of court in the county where the house is. Lawyers call the notice a lis pendens.`) +
      h.p("After it is filed, a buyer or lender who takes an interest later is bound by the case. It does not affect a buyer or lender whose rights came first. A family law attorney can tell you whether to file one.") +
      h.h3("If the deed says joint tenants with rights of survivorship") +
      h.p(`Some deeds name just the two spouses as "joint tenants with rights of survivorship". Then, until the ${h.ext(T27_7, "final divorce order")} is filed, if one of you dies, the other owns the whole house. The final order ends that, unless it says otherwise.`) +
      h.h3("Listing the house while you disagree") +
      h.p(`An agent may not market a house without a ${h.ext(T40_57, "written listing agreement")} with the owner. Every offer reaches the seller in writing. Changes made during negotiations are in writing, initialed and dated by both sides.`) +
      `<h3 id="mediation" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">If you cannot agree on a price or an offer</h3>` +
      h.p(`Most contested issues in a divorce case, the house included, ${h.ext(SCADR, "must go to mediation")}, unless an exception applies. A mediator is a neutral person who helps the two sides talk. The mediator does not decide, and any agreement is voluntary.`) +
      h.p("If the two of you still do not agree, the judge decides the terms.") +
      h.cta("Arguing over what the house is worth?", "Send us the address. We send one written price from recorded county sales near the house, the same number to each of you.", "Have us send one price to both of you", CTA, bg) },

    { h2: "Capital gains tax in a divorce: should you sell before or after it is final?", toc: "Tax and timing", id: "tax", html: () =>
      `<div class="dv-side">` +
      h.p("For most Horry County houses, selling before or after the divorce is final does not change the tax, if each of you meets the 2-year tests. The whole gain on a typical house bought in 1998 or later is under $250,000, one person's limit. For one bought in the mid-1990s it is close to the limit.") +
      CHART +
      h.p(`The chart shows the gain on the whole house. We checked what a house that sells for about ${money(PRICE)} today would have cost in each year, using the ${h.ext(FHFA, "federal house price index")} for the Myrtle Beach area.`) +
      h.p("When a couple sells a house they own together, each reports their own share of the gain. Each single owner has their own $250,000 limit for their share.") +
      h.p(`Timing matters when the whole gain is near or over $250,000 and one of you will own the house alone, for example after a buyout. While you are still married, a joint return can use a $500,000 limit, if both of you meet the tests on our ${h.a("/sell/capital-gains/", "capital gains page")}.`) + `</div>` +
      h.h3("Before or after the divorce is final") +
      h.p(`If you have no final decree of divorce or separate maintenance by the last day of your tax year, you ${h.ext(P504, "count as married")} for that whole year. For most people that day is December 31, and the rule applies even if you live apart. Separate maintenance is a court order for support while a couple lives apart.`) +
      h.h3("If one of you has moved out") +
      h.p("A spouse who moved out can still count the house as their home for the tax rule. That holds if a divorce decree, a written separation agreement or a support order lets the other spouse live there, and the other spouse does. Without one of those papers, the time after you move out does not count as time you lived there.") +
      h.h3("A buyout and tax") +
      h.p(`Generally, moving the house, or your share of it, to your spouse as part of the divorce is ${h.ext(P523, "not a sale for tax purposes")}. There is no gain or loss to report then. This does not hold if the spouse who gets it is neither a US citizen nor a US resident.`) +
      h.p("The spouse who keeps the house takes on the gain from the original purchase. When they sell it later, that whole gain counts.") +
      h.p("If you sell before you meet the 2-year tests, a divorce is one of the listed reasons that can still allow a smaller, partial exclusion. Ask a tax professional before the terms of your agreement are set.") },

    { h2: "What are the steps to sell a house in a divorce in South Carolina?", toc: "The steps", id: "steps", html: () =>
      h.p("Seven steps, from living apart to the money from the sale. The order of steps 5 and 6 depends on when the two of you agree.") +
      h.raw(STEPS) },
  ],
  afterSources: () => LEGAL,
  faqTitle: "Selling a house in a divorce: FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 20-3", href: T20_3 },
    { name: "SC Code 63-3", href: T63_3 },
    { name: "SC Code 15-11", href: T15_11 },
    { name: "SC Code 27-7", href: T27_7 },
    { name: "SC Code 12-24", href: T12_24 },
    { name: "SC Code 40-57", href: T40_57 },
    { name: "SC ADR Rule 3", href: SCADR },
    { name: "SC RPC 1.15", href: RPC },
    { name: "12 USC 1701j-3", href: GARN },
    { name: "12 CFR 191.5", href: CFR },
    { name: "IRS Pub. 523", href: P523 },
    { name: "IRS Pub. 504", href: P504 },
    { name: "CFPB", href: CFPB },
    { name: "FHFA HPI", href: FHFA },
    { name: "Clerk of Court", href: CLERK },
    { name: "County deeds", href: DEEDS },
  ],
  sourcesNote: "Our reading of county deeds: the typical house. The gain chart: our estimate from the FHFA index.",
  bottomCta: { h2: "Selling the house in a divorce?", p: "Start with a free price from recorded county sales. Tell us where things stand, alone or together.", label: "Have us talk with you about the house", href: CTA },
  keywords: "selling house during divorce South Carolina, who gets the house in a divorce in SC, buying out spouse in divorce, is South Carolina a 50/50 divorce state, marital property South Carolina, capital gains on house sale divorce, divorce Myrtle Beach house, Horry County Family Court",
  about: "Selling or keeping a home during a divorce in South Carolina and Horry County",
});
