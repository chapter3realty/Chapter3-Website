/* /sell/net-proceeds/ - what it costs to sell a house in South Carolina, and what the seller keeps: the answer
 * on the county's middle $350,000 home, the worked net sheet, the calculator, who pays what on the state contract,
 * the attorney, deed stamps at four county prices, HOA charges, the payoff, the property tax credit, the tax on the
 * gain, and how sellers here keep more of the price.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this spec replaces it. Started from batch 2026-11-a's
 * unshipped version 1 (batches/2026-11-a/sell-net-proceeds/web.patch), rebuilt to batch 2026-11-b's PLAN.md.
 * Facts: Blog-Brain batches/2026-11-b/sell-net-proceeds/facts.md, VERIFIED rows, and CORRECTED rows (4, 5, 13, 15,
 * 24, 28, 29, 30) only in the verifier's wording (VERIFY.md). Rows 14 and 18 are struck: no attorney fee and no HOA
 * fee range anywhere. Struck wording: batches/2026-11-b/facts/sell-net-proceeds-struck.json.
 * Data, never typed (website working copy):
 *   data/2026-11-b/sell-net-proceeds/findings.json   tiers (rows 2 to 6), the tax split (rows 26, 27), the listing
 *                                                    counts (rows 30, 31), tax bills mailed out of state (row 39)
 *   data/2026-11-a/buyers-cost-to-own/hoa-horry.json  houses and condos for sale with no HOA fee (row 22)
 * Design, as /sell/fsbo/ and /submarkets/garden-city/ (owner-approved 2026-11-08): the italic line at about half
 * the H1's size, one card style for the chart, the calculator and the offers, plain tables and lists under thin
 * rules, one block width of 720 px, an offer after about every second section, each tied to that section.
 * Kept from the live page: the calculator idea near the top, the lead form with its consent text word for word
 * (source "net-proceeds"), the phone number, the free net sheet, the deed stamp rule, the FAQ questions people search,
 * the links to capital gains, home value, FSBO and closing costs, and the title's searched words.
 * Corrected from the live page: the owner's title policy is the buyer's (row 8); the out-of-state hold-back is the
 * buyer's duty, on the gain only with the affidavit (row 35); the attorney rule (row 11); "the same day" is out (Q6).
 * Owner questions open (facts.md): Q1 the seller's attorney fee (no number; the calculator box starts empty), Q2 the
 * example commission (5 percent, "an example" every time), Q3 local HOA fees (no figure), Q5 when sellers are paid.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/sell/net-proceeds/";
const DATA = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("2026-11-b/sell-net-proceeds/findings.json");
const HOA = read("2026-11-a/buyers-cost-to-own/hoa-horry.json").horry;
const must = (ok, msg) => { if (!ok) throw new Error(`net-proceeds.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r100 = (v) => money(Math.round(v / 100) * 100);

/* ---- Rows 1 to 6: the four county prices and their fees in state law. ---- */
const T = Object.fromEntries(F.tiers.map((t) => [t.key, t]));
const MID = T.middle_house, PRICE = MID.price, ONE = MID.per_1pct_commission;
must(PRICE === 350000 && MID.deed_fee === 1295 && MID.deed_record === 15 && MID.satisfaction === 10 && MID.fixed_by_law === 1320 && ONE === 3500, "rows 2 to 4: the middle home's fees moved");
must(T.quarter_house.price === 266000 && T.upper_house.price === 500000 && T.middle_condo.price === 215000, "row 1: the four prices moved");
must(T.quarter_house.fixed_by_law === 1009.2 && T.upper_house.fixed_by_law === 1875 && T.middle_condo.fixed_by_law === 820.5, "row 6: the fees at the other prices moved");
must(F.tiers.every((t) => t.fixed_pct < 0.5 && Math.round(t.fixed_pct * 100) === 38), "row 5: the fees are no longer about 0.38 percent at all four prices");

/* ---- Rows 25 to 27: the tax credit on the middle home. The calculator's tax constants must reproduce them. ---- */
const PR = F.proration_middle_house, HOME = PR.legal_residence, SECOND = PR.second_home_or_rental;
must(PR.year_legal === 1287 && PR.year_second === 4221, "row 26: the yearly tax moved");
must(HOME.end_of_march === 317 && HOME.end_of_june === 638 && HOME.end_of_september === 962, "row 27: the credit on your home moved");
must(SECOND.end_of_march === 1041 && SECOND.end_of_june === 2093 && SECOND.end_of_september === 3157, "row 27: the credit on a second home moved");
const MILLS_ALL = 201.0, MILLS_SCHOOL = 109.1; // row 26: Horry County 2026 levy for most homes outside city limits
must(Math.round(PRICE * 0.04 * (MILLS_ALL - MILLS_SCHOOL) / 1000) === PR.year_legal && Math.round(PRICE * 0.06 * MILLS_ALL / 1000) === PR.year_second, "row 26: the levy no longer gives the yearly tax");

/* ---- The worked example (PLAN.md section 3). The payoff and the 5 percent are example inputs, labelled. ---- */
const PAYOFF = 175000, PCT = 5, COMM = PRICE * PCT / 100;

/* ---- The calculator's arithmetic: one function, run here against three cases worked by hand (PLAYBOOK A29b)
   and in the browser. Months stop at September: a closing from October to January 15 is worked from the bill.
   No field id or label says rate, APR, interest or down (claims.json inputDefaults). ---- */
const NET = "function npNet(o){var p=o.price,comm=p*o.pct/100,deed=p>0?Math.ceil(p/500)*1.85:0,rec=(p>0?15:0)+(o.payoff>0?10:0);"
  + `var days=[31,59,90,120,151,181,212,243,273][o.month-1]||181;var year=p*(o.kind==="home"?0.04*${(MILLS_ALL - MILLS_SCHOOL).toFixed(1)}:0.06*${MILLS_ALL.toFixed(1)})/1000;`
  + "var tax=year*days/365,other=o.atty+o.hoa+o.credit;return{comm:comm,deed:deed,rec:rec,tax:tax,other:other,keep:p-comm-deed-rec-tax-other-o.payoff};}";
const npNet = new Function(NET + "return npNet;")();
const BASE = { atty: 0, hoa: 0, credit: 0 };
const EX = npNet({ ...BASE, price: PRICE, payoff: PAYOFF, pct: PCT, month: 6, kind: "home" });
{
  const eq = (x, y, what) => must(Math.abs(x - y) < 0.5, `calculator: ${what} is ${x}, worked by hand ${y}`);
  eq(EX.comm, 17500, "case a commission"); eq(EX.deed, 1295, "case a deed stamps"); eq(EX.rec, 25, "case a recording");
  eq(EX.tax, HOME.end_of_june, "case a tax"); eq(EX.keep, 155542, "case a keep");
  const b = npNet({ ...BASE, price: 266000, payoff: 0, pct: 6, month: 9, kind: "second" });
  eq(b.comm, 15960, "case b commission"); eq(b.deed, 984.2, "case b deed stamps"); eq(b.rec, 15, "case b recording"); eq(b.tax, 2399.35, "case b tax"); eq(b.keep, 246641.45, "case b keep");
  const c = npNet({ ...BASE, price: 215000, payoff: 0, pct: 5, month: 3, kind: "home" });
  eq(c.comm, 10750, "case c commission"); eq(c.deed, 795.5, "case c deed stamps"); eq(c.tax, 194.88, "case c tax"); eq(c.keep, 203244.62, "case c keep");
}
const KEEP = EX.keep;
must(r100(KEEP) === "$155,500", "the example's keep moved; the short answer says about $155,500");

/* ---- Rows 30, 31: homes for sale now, our count (listings, in total only). ---- */
const LH = F.listings.house, LC = F.listings.condo;
must(LH.resale === 2188 && LH.price_cut_resale === 1260 && LC.resale === 2652 && LC.price_cut_resale === 1372, "row 30: the price-cut counts moved");
const BANDS = LH.bands;
must(BANDS[0].band === "0-300000" && BANDS[0].resale === 491 && BANDS[0].price_cut === 307 && BANDS.slice(1).every((b) => Math.round(b.pct_price_cut) === 56), "row 30: the price bands moved");
must(LH.warranty === 956 && LH.warranty_new === 894 && LH.warranty_resale === 62, "row 31: the warranty counts moved");
must(LH.warranty_new / LH.warranty > 0.9, "row 31: new homes are no longer nearly all the warranties offered");
const PULLED = new Date(F.listings.pulled);
must(!isNaN(PULLED), "findings.json listings.pulled is not a date");
const PULL_DAY = PULLED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }); // the ledger's date (rows 30, 31)

/* ---- Row 22 (CTO's values): HOA fees on homes for sale. Row 39: tax bills mailed out of state. ---- */
must(HOA.house.listings === 3060 && HOA.house.no_hoa === 833 && HOA.condo.listings === 2686 && HOA.condo.no_hoa === 1, "row 22: the HOA counts moved");
must(HOA.house.no_hoa / HOA.house.listings > 0.25, "row 22: no longer more than 1 in 4");
const OUT = F.owners_outside_sc;
must(Math.round(OUT.condo.pct / 10) === 6, "row 39: no longer about 6 in 10 condos");

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const F310 = "https://screaltors.org/wp-content/uploads/2026/02/310.pdf";
const CODE = (t, c) => `https://www.scstatehouse.gov/code/statmast.php?title=${t}&amp;chapter=${c}`;
const T12_24 = CODE(12, 24), T8_21 = CODE(8, 21), T12_45 = CODE(12, 45), T12_43 = CODE(12, 43);
const T27_1 = CODE(27, 1), T27_31 = CODE(27, 31), T12_8 = CODE(12, 8), T37_10 = CODE(37, 10);
const DOE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const EAO = "https://www.scbar.org/media/grihef1j/11-06.pdf";
const CFPB_PAY = "https://www.consumerfinance.gov/ask-cfpb/what-is-a-payoff-amount-and-is-it-the-same-as-my-current-balance-en-205/";
const REGZ = "https://www.consumerfinance.gov/rules-policy/regulations/1026/36/";
const CFPB_WIRE = "https://www.consumerfinance.gov/archive/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const IRS523 = "https://www.irs.gov/publications/p523";
const IRS701 = "https://www.irs.gov/taxtopics/tc701";
const IRS1099S = "https://www.irs.gov/instructions/i1099s";
const HUD = "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf";
const VA = "https://www.va.gov/housing-assistance/home-loans/funding-fee-and-closing-costs/";
const NAR_SET = "https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers";
const DOR = "https://dor.sc.gov/news/information-about-h-4216";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const LEAD = "#lead-form";

/* ---- The glance row under the H1 (rows 4, 8). ---- */
const GLANCE = PK.glance([
  { icon: "tax", label: money(MID.fixed_by_law), text: `of fees in state law on a ${money(PRICE)} sale with a mortgage` },
  { icon: "dollar", label: money(ONE), text: "for each 1 percent of commission" },
  { icon: "key", label: "The buyer", text: "pays for both title insurance policies" },
]);

/* ---- V2: the worked net sheet (rows 2 to 4, 7, 10, 14, 27; the payoff and the 5 percent are example inputs). ---- */
const sheetRow = (name, who, amt, cls) => `<tr${cls ? ` class="${cls}"` : ""}><th scope="row">${name}<span class="w">${who}</span></th><td>${amt}</td></tr>`;
const MINUS = "&minus;";
const SHEET = `<div class="np-tw"><table class="np-sheet"><caption>Example: a ${money(PRICE)} home with ${money(PAYOFF)} left on the mortgage, closing at the end of June</caption>`
  + `<thead><tr><th scope="col">Line, and who decides it</th><th scope="col">Amount</th></tr></thead><tbody>`
  + sheetRow("Sale price", "You and the buyer agree on it", money(PRICE), "plus")
  + sheetRow(`Commission, ${PCT} percent in this example`, "You and your agent agree on it", MINUS + money(COMM))
  + sheetRow("Deed stamps", "State law: $1.85 for each $500 of the price", MINUS + money(MID.deed_fee))
  + sheetRow("Recording the deed and your mortgage release", `County fees: ${money(MID.deed_record)} and ${money(MID.satisfaction)}`, MINUS + money(MID.deed_record + MID.satisfaction))
  + sheetRow("Your share of this year's property tax", "Credited to the buyer: half the year, as your own home", MINUS + "about " + r10(HOME.end_of_june))
  + sheetRow("Mortgage payoff", "Your lender's payoff statement", MINUS + money(PAYOFF))
  + sheetRow("Your attorney's fee", "It differs from one attorney's office to the next", "Not in this example", "na")
  + sheetRow("HOA charges on the sale, if any", "The box ticked on the contract", "Not in this example", "na")
  + `</tbody><tfoot>${sheetRow("You keep", "Before your attorney's fee and any HOA charges", "about " + r100(KEEP), "total")}</tfoot></table></div>`;

/* ---- V3: the calculator. It opens on the example, so the answer shows before the reader types. ---- */
const inp = (id, label, v, o = {}) => `<div class="np-in"><label for="${id}">${label}</label><span class="u">${o.pct ? "" : "$"}<input id="${id}" type="number" min="0" ${o.pct ? 'max="10" step="0.25"' : 'step="1000"'} inputmode="decimal"${v === "" ? "" : ` value="${v}"`} oninput="npCalc()">${o.pct ? "%" : ""}</span></div>`;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September"];
const outRow = (id, label, v) => `<div><dt>${label}</dt><dd id="${id}">${v}</dd></div>`;
const CALC = `<div class="np-calc" role="group" aria-labelledby="npT">`
  + `<p class="k" id="npT">Your own net sheet</p>`
  + `<div class="np-res" aria-live="polite"><span class="l">You keep about</span><span class="big" id="npoKeep">${r100(KEEP)}</span><span class="s" id="npoNote">before your attorney's fee and any HOA charges</span></div>`
  + `<div class="np-grid">`
  + inp("npPrice", "Sale price", PRICE)
  + inp("npPayoff", "What you still owe on the mortgage", PAYOFF)
  + inp("npComm", "Commission in percent (an example; type yours)", PCT, { pct: true })
  + `<div class="np-in"><label for="npMonth">Closing at the end of</label><span class="u"><select id="npMonth" onchange="npCalc()">${MONTHS.map((m, i) => `<option value="${i + 1}"${i === 5 ? " selected" : ""}>${m}</option>`).join("")}</select></span></div>`
  + `<fieldset class="np-radio"><legend>The home is</legend><label><input type="radio" name="npKind" value="home" checked onchange="npCalc()"> My own home</label><label><input type="radio" name="npKind" value="second" onchange="npCalc()"> A second home or a rental</label></fieldset>`
  + inp("npHoa", "HOA charges on the sale, if any", "")
  + inp("npCredit", "Credit to the buyer toward their costs, if any", "")
  + inp("npAtty", "Your attorney's fee, if you know it", "")
  + `</div>`
  + `<dl class="np-out">`
  + outRow("npoComm", "Commission", money(EX.comm))
  + outRow("npoDeed", "Deed stamps", money(EX.deed))
  + outRow("npoRec", "Recording fees", money(EX.rec))
  + outRow("npoTax", "Your share of this year's property tax", money(EX.tax))
  + outRow("npoOther", "HOA charges, credit to the buyer and attorney", money(0))
  + outRow("npoPayoff", "Mortgage payoff", money(PAYOFF))
  + `</dl>`
  + `<p class="n">An estimate for planning. The tax line uses Horry County's 2026 rates for most homes outside city limits.</p></div>`
  + `<script>${NET}function npCalc(){var g=function(i){var e=document.getElementById(i);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0};`
  + `var m=function(n){return (n<0?"-":"")+"$"+Math.round(Math.abs(n)).toLocaleString("en-US")};var k=document.querySelector('input[name="npKind"]:checked');`
  + `var o={price:g("npPrice"),payoff:g("npPayoff"),pct:g("npComm"),atty:g("npAtty"),hoa:g("npHoa"),credit:g("npCredit"),month:parseInt(document.getElementById("npMonth").value,10)||6,kind:k?k.value:"home"};`
  + `var r=npNet(o),s=function(i,t){document.getElementById(i).textContent=t};`
  + `s("npoKeep",(r.keep<0?"-":"")+"$"+(Math.round(Math.abs(r.keep)/100)*100).toLocaleString("en-US"));s("npoComm",m(r.comm));s("npoDeed",m(r.deed));s("npoRec",m(r.rec));s("npoTax",m(r.tax));s("npoOther",m(r.other));s("npoPayoff",m(o.payoff));`
  + `s("npoNote",o.atty>0?(o.hoa>0?"after every line below":"after every line below, before any HOA charges"):(o.hoa>0?"before your attorney's fee":"before your attorney's fee and any HOA charges"));}</script>`;

/* ---- V4: who pays what on the state contract (rows 7, 8, 10). ---- */
const whoCol = (title, items, sub) => `<div class="np-col"><p class="t">${title}${sub ? `<span>${sub}</span>` : ""}</p><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul></div>`;
const WHO = `<div class="np-who" role="group" aria-label="Who pays which closing cost on South Carolina's standard home contract">`
  + whoCol("You pay", ["The deed preparation", "The deed stamps and the deed recording", "Your mortgage payoff, and recording its release", "Property tax for the months you owned the home", "The fee you agreed with your own agent", "Your own attorney"])
  + whoCol("The buyer pays", ["Both title insurance policies, the owner's and the lender's", "The title exam", "Inspections, the appraisal and any survey", "The buyer's attorney"])
  + whoCol("The side the contract ticks pays", ["The association's fees for its papers", "The association's letter of what is owed", "Transfer fees", "A capital or working-capital payment to the association"], "You pay if no box is ticked")
  + `</div>`;

/* ---- V5: the four county prices (rows 1, 4 to 6). A real table that folds on a phone. ---- */
const tierRow = (t, where) => `<tr><th scope="row">${money(t.price)}<span class="w">${where}</span></th>`
  + `<td><span class="l">Deed stamps</span>${money(t.deed_fee)}</td><td><span class="l">Fees in state law</span>${money(t.fixed_by_law)}</td><td><span class="l">Each 1% of commission</span>${money(t.per_1pct_commission)}</td></tr>`;
const TIERS = `<div class="np-tw"><table class="np-tab"><caption>The fees in state law at four Horry County prices, with a mortgage to release</caption>`
  + `<thead><tr><th scope="col">Sale price</th><th scope="col">Deed stamps</th><th scope="col">Fees in state law</th><th scope="col">Each 1% of commission</th></tr></thead><tbody>`
  + tierRow(T.quarter_house, "1 in 4 resale homes sold for less")
  + tierRow(MID, "The middle resale home")
  + tierRow(T.upper_house, "1 in 4 resale homes sold for more")
  + tierRow(T.middle_condo, "The middle resale condo")
  + `</tbody></table></div>`;

/* ---- Chart A (row 27): the tax credit by closing month. One SVG drawn twice, at the width it shows at (a phone one
   to 599 px, a wide one from 600 px), so its words stay 14 to 16 px, as /sell/home-value/ does. Your home in brass, a
   second home or rental in slate, the amount at the end of each bar. ---- */
const TAX_ROWS = [["End of March", "end_of_march"], ["End of June", "end_of_june"], ["End of September", "end_of_september"]];
const TMAX = SECOND.end_of_september;
const taxSvg = (W, fs, cls) => {
  const lab = Math.round(fs * 7.2), bh = Math.round(fs * 1.05), gap = Math.round(fs * 0.45), grp = Math.round(fs * 1.5) + 2 * bh + gap + Math.round(fs * 1.3);
  const two = W < 400, kx = two ? 0 : Math.round(fs * 9.6), ky = two ? Math.round(fs * 1.6) : 0;
  const top = Math.round(fs * 2.4) + ky, H = top + TAX_ROWS.length * grp;
  const x0 = 0, x1 = W - lab, X = (v) => Math.max(4, (v / TMAX) * (x1 - x0));
  const key = `<rect x="0" y="${Math.round(fs * 0.2)}" width="${fs}" height="${fs}" rx="3" fill="#c4783a"/><text x="${Math.round(fs * 1.4)}" y="${Math.round(fs * 1.05)}" font-size="${fs}" fill="#1c2028">Your own home</text>`
    + `<rect x="${kx}" y="${Math.round(fs * 0.2) + ky}" width="${fs}" height="${fs}" rx="3" fill="#5c6b78"/><text x="${kx + Math.round(fs * 1.4)}" y="${Math.round(fs * 1.05) + ky}" font-size="${fs}" fill="#1c2028">Second home or rental</text>`;
  const rows = TAX_ROWS.map(([m, k], i) => {
    const y = top + i * grp, yb1 = y + Math.round(fs * 0.55), yb2 = yb1 + bh + gap;
    const bar = (yy, v, c) => `<rect x="${x0}" y="${yy}" width="${X(v).toFixed(1)}" height="${bh}" rx="${Math.round(bh / 2)}" fill="${c}"/><text x="${(X(v) + fs * 0.5).toFixed(1)}" y="${yy + Math.round(bh * 0.82)}" font-size="${fs}" font-weight="600" fill="#1c2028">about ${r10(v)}</text>`;
    return `<text x="0" y="${y}" font-size="${fs}" font-weight="600" fill="#1c2028">${m}</text>` + bar(yb1, HOME[k], "#c4783a") + bar(yb2, SECOND[k], "#5c6b78");
  }).join("");
  const label = `Bar chart: the credit to the buyer for your share of the year's property tax on a ${money(PRICE)} home. ` + TAX_ROWS.map(([m, k]) => `${m}: about ${r10(HOME[k])} for your own home, about ${r10(SECOND[k])} for a second home or rental`).join("; ") + ".";
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" font-family="DM Sans, system-ui, sans-serif">${key}<g transform="translate(0 ${Math.round(fs * 1.3)})">${rows}</g></svg>`;
};
const TAX_CHART = `<figure class="np-chart"><p class="cap">The later you close, the bigger the tax credit to the buyer</p>`
  + taxSvg(330, 17, "np-n") + taxSvg(640, 15, "np-w")
  + `<figcaption>On a ${money(PRICE)} home outside city limits, at Horry County's 2026 tax rates. </figcaption></figure>`;

/* ---- The photo (record in data/2026-11-b/sell-net-proceeds/photos.json: the NOAA aerial of Carolina Forest houses
   that /buyers/cost-to-own/ shows, public domain, looked at full size by that page's fixer). Fix round 1 swapped it
   in for the 2006 courthouse photo, which only decorated the deed stamps (owner 2026-10-11: photos of the topic).
   It shows the thing being sold: houses, outside city limits, as the tax figures assume. Its caption says only
   what it shows. The photo partner's shot list (batches/2026-11-a/sell-net-proceeds/shot-list.md) can replace it. ---- */
const PHOTOS = read("2026-11-b/sell-net-proceeds/photos.json").photos;
const HOUSES = PH.findPhoto(PHOTOS, "carolina-forest-house-streets-from-above");
const HOUSES_CAP = "Houses on streets in Carolina Forest, outside city limits, seen from above.";
const HOUSES_PHOTO = PH.heroPhoto(HOUSES, { alt: HOUSES.alt, caption: HOUSES_CAP, maxWidth: "640px", sizes: "(max-width: 680px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
/* This photo was cut from a NOAA map tile and resized, so the credits keep their general line about resizing and cropping. */
const CREDITS = PH.creditsList([{ photo: HOUSES, caption: "Houses on streets in Carolina Forest, outside city limits" }]);

/* ---- Row 30: the stat, big numbers under a thin rule. ---- */
const CUTS = `<div class="np-stat"><p class="k">Resale homes for sale in Horry County, our count</p><ul>`
  + `<li><strong>${n0(LH.price_cut_resale)} of ${n0(LH.resale)}</strong><span>houses and townhouses have cut their asking price</span></li>`
  + `<li><strong>${n0(LC.price_cut_resale)} of ${n0(LC.resale)}</strong><span>condos have cut their asking price</span></li></ul></div>`;

/* ---- The lead form: the live page's fields, consent text word for word, source "net-proceeds". ---- */
const CONSENT = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
const LEAD_FORM = `<div id="ldWrap" class="np-form">`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldCtx" placeholder="Property address" aria-label="Property address" autocomplete="street-address"></div>`
  + `<div class="idx-lead"><input class="idx-input" id="ldName" placeholder="Your name" aria-label="Your name" autocomplete="name"><input class="idx-input" id="ldPhone" placeholder="Phone" aria-label="Phone" type="tel" autocomplete="tel"></div>`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldEmail" placeholder="Email" aria-label="Email" type="email" autocomplete="email"></div>`
  + `<label class="np-consent"><input type="checkbox" id="ldConsent"><span>${CONSENT}</span></label>`
  + `<p id="ldErr" class="np-err" role="alert"></p>`
  + `<button type="button" class="btn btn-brass btn-lg" onclick="ldSubmit()">Send my net sheet request</button>`
  + `<p class="np-tel">Free, and no obligation. Prefer to talk now?</p><a class="btn btn-outline np-call" href="tel:+18543332135">Call 854.333.2135</a></div>`
  + `<div id="ldOk" class="np-ok">Thanks. A licensed team member will reach out with your seller net sheet.</div>`
  + `<script>function ldSubmit(){`
  + `var cx=document.getElementById('ldCtx').value.trim(),n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),em=document.getElementById('ldEmail').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');`
  + `function fail(m){err.textContent=m;err.style.display='block';}err.style.display='none';`
  + `if(!cx||!n){fail('Add the property address and your name.');return;}`
  + `if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}`
  + `if(!c){fail('Check the consent box to send the request.');return;}`
  + `c3SendForm({property_address:cx,name:n,phone:ph,email:em,consent:c?'yes':'no'},'net-proceeds');`
  + `document.getElementById('ldWrap').style.display='none';document.getElementById('ldOk').style.display='block';}</script>`;

/* ---- The page's own styles. One card style (the glass surface of the chart and the offers) for the chart, the
   calculator and the offers; tables, lists and numbers sit on the page under thin rules. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226", BRASS = "#c4783a";
const SURF = "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,inset 0 1px 0 rgba(255,255,255,.9)),var(--g-sh,0 10px 26px -18px rgba(28,32,40,.35))";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  /* The contents list: no card, in columns between two thin rules (the approved look, as /hoa/documents/). */
  + `main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}`
  + `main#main nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){main#main nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* the headline: the italic line at about half the H1's size; the hero sub is said by the short answer */
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  /* the hero tiles: glass tiles on a wide screen, short rows under rules on a phone */
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* one block width */
  + `${S} .c3-gchart,${S} .np-tw,${S} .np-calc,${S} .np-who,${S} .np-plain,${S} .np-stat,${S} .np-form{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* tables: plain, under thin rules */
  + `${S} .np-tw{margin:1.3rem 0 1.4rem}`
  + `${S} .np-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .np-tw caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem}`
  + `${S} .np-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .5rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3)}`
  + `${S} .np-tw tbody th,${S} .np-tw tfoot th{text-align:left;font-weight:600;padding:.65rem .8rem .65rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top}`
  + `${S} .np-tw .w{display:block;font-weight:400;color:var(--muted);font-size:.95rem;margin-top:.15rem}`
  + `${S} .np-tw td{padding:.65rem .5rem .65rem 0;border-bottom:${RULE};vertical-align:top;font-variant-numeric:tabular-nums;white-space:nowrap}`
  + `${S} .np-tw td .l{display:none}`
  + `${S} .np-sheet thead th:last-child,${S} .np-sheet td{text-align:right;padding-right:0;font-weight:600}`
  + `${S} .np-sheet tr.na td{color:var(--muted);font-weight:400;white-space:normal}${S} .np-sheet tr.plus td{color:#2f6b3a}`
  + `${S} .np-sheet tfoot th,${S} .np-sheet tfoot td{border-bottom:0;border-top:2px solid var(--navy);padding-top:.8rem}`
  + `${S} .np-sheet tfoot td{font-family:var(--serif);font-size:1.5rem;color:${INK};font-weight:400}`
  /* 320 to 379 px: the total may wrap after "about", so the amount column fits the window */
  + `@media (max-width:379px){${S} .np-sheet tfoot td{white-space:normal;font-size:1.3rem;line-height:1.2}${S} .np-sheet tbody th,${S} .np-sheet tfoot th{padding-right:.5rem}${S} .np-sheet td{font-size:1rem}}`
  + `@media (max-width:599px){${S} .np-tab,${S} .np-tab tbody,${S} .np-tab caption{display:block;width:100%}`
  + `${S} .np-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .np-tab tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:.8rem;align-items:end;padding:.7rem 0;border-bottom:${RULE}}`
  + `${S} .np-tab th,${S} .np-tab td{border:0;padding:0}${S} .np-tab tbody th{grid-column:1/-1;padding-bottom:.35rem}`
  + `${S} .np-tab td .l{display:block;font-size:.875rem;color:var(--muted);white-space:normal;line-height:1.3}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:640px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  /* the chart: the glass card of the calculator and the offers */
  + `${S} figure.np-chart{max-width:720px;box-sizing:border-box;margin:1.4rem 0 1.5rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;${SURF}}`
  + `${S} figure.np-chart .cap{font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1.0625rem;line-height:1.4;margin:0 0 .8rem}`
  + `${S} figure.np-chart figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.7rem;padding:0}`
  + `${S} svg.np-n{display:block;width:100%;height:auto;max-width:360px}${S} svg.np-w{display:none;width:100%;height:auto;max-width:640px}`
  + `@media (min-width:600px){${S} svg.np-n{display:none}${S} svg.np-w{display:block}}`
  /* the calculator: the same glass card as the chart and the offers */
  + `${S} .np-calc{margin:1.3rem 0 1.5rem;padding:1.2rem 1.3rem 1.1rem;border-radius:20px;${SURF};font-family:var(--sans);color:var(--navy)}`
  + `${S} .np-calc .k{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .np-res{display:block;padding:0 0 .9rem;margin:0 0 1rem;border-bottom:${RULE}}${S} .np-res .l{display:block;font-size:1rem;color:var(--muted)}`
  + `${S} .np-res .big{display:block;font-family:var(--serif);font-size:clamp(2.1rem,7vw,2.6rem);line-height:1.1;color:var(--navy);margin:.1rem 0 .2rem}${S} .np-res .s{display:block;font-size:1rem;color:var(--muted)}`
  + `${S} .np-grid{display:grid;gap:0 1.6rem}@media (min-width:760px){${S} .np-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .np-in{display:flex;justify-content:space-between;align-items:center;gap:.4rem .8rem;margin:0 0 .75rem;flex-wrap:wrap}`
  + `${S} .np-in{flex-wrap:nowrap}${S} .np-in label{font-size:1rem;line-height:1.35;flex:1 1 auto;min-width:0;color:var(--navy)}${S} .np-in .u{white-space:nowrap;color:var(--muted);display:inline-flex;align-items:center;gap:.3rem}`
  + `${S} .np-calc input[type=number],${S} .np-calc select{width:8rem;min-height:44px;box-sizing:border-box;background:#fff;border:1px solid rgba(28,32,40,.28);border-radius:10px;color:var(--navy);font-family:var(--sans);font-size:1.05rem;padding:.4rem .6rem;text-align:right}`
  + `${S} .np-calc select{text-align:left;width:9.4rem}${S} .np-calc #npComm{width:4.6rem}@media (max-width:420px){${S} .np-calc input[type=number]{width:7rem}${S} .np-calc #npComm{width:4.2rem}}`
  + `${S} .np-radio{border:0;margin:0 0 .75rem;padding:0;min-width:0}${S} .np-radio legend{font-size:1rem;margin-bottom:.3rem;padding:0;color:var(--navy)}`
  + `${S} .np-radio label{display:flex;align-items:center;gap:.55rem;min-height:40px;font-size:1rem;cursor:pointer;color:var(--navy)}`
  + `${S} .np-radio input{width:20px;height:20px;accent-color:${BRASS};flex:none;margin:0}`
  + `${S} .np-out{margin:.4rem 0 0;padding:.8rem 0 0;border-top:${RULE};display:grid;gap:.45rem}`
  + `${S} .np-out>div{display:flex;justify-content:space-between;align-items:baseline;gap:1rem}${S} .np-out dt{font-size:1rem;line-height:1.35;color:var(--muted)}`
  + `${S} .np-out dd{margin:0;font-size:1.05rem;white-space:nowrap;font-variant-numeric:tabular-nums;color:var(--navy);font-weight:600}`
  + `${S} .np-calc .n{margin:.8rem 0 0;color:var(--muted);font-size:.95rem;line-height:1.5}`
  /* who pays: three plain lists under thin rules */
  + `${S} .np-who{display:grid;gap:1.1rem 2rem;margin:1.2rem 0 1.3rem}@media (min-width:760px){${S} .np-who{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .np-col{border-top:2px solid var(--navy);padding-top:.7rem}${S} .np-col .t{font-family:var(--sans);font-weight:700;color:var(--navy);font-size:1.05rem;line-height:1.45;margin:0 0 .5rem}`
  + `${S} .np-col .t span{display:block;font-weight:400;color:var(--muted);font-size:.95rem}${S} .np-col ul{list-style:none;margin:0;padding:0}${S} .np-col li{margin:0;padding:.5rem 0;border-bottom:${RULE};color:var(--muted);line-height:1.45;font-size:1.0625rem}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .np-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .np-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .np-plain li:last-child{border-bottom:${RULE}}${S} .np-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* numbers: large figures under a thin rule, no box */
  + `${S} .np-stat{margin:1.2rem 0 1.5rem}${S} .np-stat .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .np-stat ul{list-style:none;margin:0;padding:0;display:grid;gap:1rem 2rem}@media (min-width:600px){${S} .np-stat ul{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .np-stat li{margin:0;padding:.75rem 0 0;border-top:${RULE}}${S} .np-stat strong{display:block;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,6vw,2.1rem);line-height:1.05;margin-bottom:.3rem}`
  + `${S} .np-stat span{display:block;color:var(--muted);line-height:1.5;font-size:1rem}`
  /* the lead form */
  + `${S} .np-form{margin:1.4rem 0 1rem;padding:1.4rem 1.3rem;border-radius:20px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14)}`
  + `${S} .np-form .idx-lead{margin-bottom:.7rem}${S} .np-form .idx-input{min-height:48px;font-size:1.0625rem}`
  + `${S} .np-consent{display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.875rem;color:rgba(244,239,232,.86);line-height:1.5;margin:.3rem 0 1rem;cursor:pointer}`
  + `${S} .np-consent input{margin-top:.2rem;accent-color:${BRASS};flex-shrink:0;width:20px;height:20px}`
  + `${S} .np-form .btn{width:100%;justify-content:center;min-height:50px;box-sizing:border-box}`
  + `${S} .np-err{display:none;color:#ffb4a8;font-family:var(--sans);font-size:1rem;margin:0 0 .8rem}`
  + `${S} .np-tel{color:rgba(244,239,232,.86);font-family:var(--sans);font-size:1rem;margin:.9rem 0 0}`
  + `${S} .np-form a.np-call{display:flex;align-items:center;margin-top:.6rem;color:var(--ivory);border:1px solid rgba(244,239,232,.55);background:transparent}`
  + `${S} .np-ok{display:none;max-width:720px;margin:1.4rem 0 1rem;padding:1.3rem;border-radius:20px;background:var(--navy);color:var(--ivory);font-family:var(--sans);font-size:1.0625rem;line-height:1.6}`
  /* Work-arounds copied from /sell/fsbo/: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="np-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys or tax advisers, and nothing on this page is legal or tax advice.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. */
const FAQ = [
  { q: "What is a seller net sheet?", a: `A list of every line on the seller's side of the closing: the price, less the commission, the fees, the tax credit and the payoff. The ${money(PRICE)} example near the top of this page is one.` },
  { q: "Who pays title insurance in South Carolina?", a: "The buyer pays both policies, the owner's and the lender's, on the state REALTORS' standard contract. Buyer and seller can agree to something else in writing." },
  { q: "Does the seller need an attorney in South Carolina?", a: "Every South Carolina home closing must be supervised by a South Carolina attorney, and a lawyer prepares the seller's deed. When the buyer has a loan for a home they will live in, the buyer picks that attorney, who does not advise you. Your own attorney is your cost." },
  { q: "Can I sell my house before the mortgage is paid off?", a: "Yes. The closing pays off the loan out of the sale money, and you get what is left." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  /* PLAN.md's title has 63 characters; mkpage allows 62. "Net sheet" is a search this page owns. */
  title: "Cost to Sell a House in South Carolina: Net Sheet Calculator",
  description: `Cost to sell a house in South Carolina: ${money(MID.fixed_by_law)} of fees in state law on a ${money(PRICE)} Horry County home, ${money(ONE)} per 1% of commission, who pays what, a calculator.`,
  ogTitle: "What it costs to sell a house in South Carolina, and what you keep: every cost line by line, and a calculator",
  /* Our own share card (tools/ogcard.js, run on a copy of this page), kept in this page's image folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/sell-net-proceeds/share.jpg",
  ogImageAlt: "What it costs to sell a house in South Carolina, and what you keep. Every cost on a Myrtle Beach-area sale, line by line, with a calculator for your own home.",
  crumb: "Net Proceeds",
  eyebrow: "Selling a home",
  h1: "What it costs to sell a house in South Carolina, and what you keep",
  h1em: "Every cost on a Myrtle Beach-area sale, line by line, with a calculator for your own home.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: `On a ${money(PRICE)} Horry County sale with a mortgage to release, the fees in state law come to ${money(MID.fixed_by_law)}. The commission you agree is the big cost.`,
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Have us build a net sheet on your address.", label: "Have us build my net sheet", href: LEAD },
  author: "devin",
  shortAnswer: [
    `On the middle Horry County home, a ${money(PRICE)} sale with a mortgage to release, the fees in state law come to ${money(MID.fixed_by_law)}, under half of 1 percent. The commission you agree with your agent is the biggest selling cost: ${money(ONE)} for each 1 percent.`,
    `Your mortgage payoff comes out of the same check. With a ${PCT} percent commission, as an example, and ${money(PAYOFF)} still owed, you keep about ${r100(KEEP)} before your attorney's fee and any HOA charges.`,
  ],
  sections: [
    { h2: `What will I walk away with on a ${money(PRICE)} home?`, toc: "Net sheet", id: "net-sheet", html: () =>
      h.p(`Take the price, subtract your selling costs and your mortgage payoff, and the rest is yours. The example is the middle Horry County home, with ${money(PAYOFF)} still owed and a closing at the end of June.`) +
      SHEET +
      h.p(`The ${PCT} percent and the ${money(PAYOFF)} are example figures. The two lines without a number depend on your sale. The calculator below takes your own numbers.`) },

    { h2: "Seller net proceeds calculator", toc: "Calculator", id: "calculator", html: () =>
      h.p("The boxes start with the example above. Type your price, what you owe and your commission. Leave a box empty if you do not know the number yet.") +
      CALC +
      h.p(`For a closing from October to the end of the year, we work out your tax share from the actual bill.`) +
      h.p(`Live in another state? About 6 in 10 Horry County condo units have their tax bill mailed outside South Carolina. When your permanent home is outside the state, the buyer must ${h.ext(T12_8, "hold back part of the price")} for state income tax.`) +
      h.p(`For a 2026 sale it is ${h.ext(DOR, "5.21 percent")} of your gain if you sign the state's gain affidavit. Without the affidavit, it is 5.21 percent of the price less your selling costs. A main home whose gain is inside the federal exclusion has no hold-back. Our ${h.a("/sell/capital-gains/", "capital gains page")} works it out.`) },

    { h2: "Who pays what when you sell a house in South Carolina?", toc: "Who pays", id: "who-pays", html: () =>
      h.p(`On ${h.ext(F310, "the state REALTORS' standard contract")}, you pay the deed stamps, your mortgage payoff, the fee you agreed with your agent and your own attorney. The buyer pays both title insurance policies.`) +
      WHO +
      h.p("Each side pays its own costs unless both agree otherwise in writing. The form also tells both sides they are responsible for getting legal advice before they sign.") +
      h.p(`Buying another home here as well? Our ${h.a("/buyers/closing-costs/", "closing costs page")} lists the buyer's side.`) },

    { h2: "What does the closing attorney charge the seller for?", toc: "Attorney", id: "attorney", html: (bg) =>
      h.p(`${h.ext(DOE, "A South Carolina attorney must supervise")} every home closing in the state. If the buyer has a loan for a home they will live in, ${h.ext(T37_10, "the buyer chooses the closing attorney")}.`) +
      h.p("An attorney who represents only the buyer does not advise you. You may refuse to sign a settlement statement you do not agree with. The attorney charges on your side of the closing statement can include three things:") +
      plain([
        ["The deed preparation", "Preparing a deed for someone else is the practice of law, so a lawyer prepares your deed. On the standard contract, that cost is yours."],
        ["A payoff handling fee", `In a standard South Carolina closing, the buyer's attorney typically prepares the settlement statement. Under a ${h.ext(EAO, "South Carolina Bar ethics opinion")}, when that attorney also sends your mortgage payoff, they may add a reasonable payoff handling fee to your side.`],
        ["Your own attorney, if you hire one", "On the standard contract, your own attorney's fee is your cost."],
      ]) +
      h.p("These charges differ from one attorney's office to the next, so this page prints no figure for them.") +
      h.cta("Want the attorney's charges on your net sheet?", "Send us the address and what you owe. We ask the attorney's office for its charges and fill in every other line, free.", "Have us fill in every line", LEAD, bg) },

    { h2: "How much are SC deed stamps at your price?", toc: "Deed stamps", id: "deed-stamps", html: () =>
      h.p(`Deed stamps, the state's fee on a deed that many people call the transfer tax, are ${h.ext(T12_24, "$1.85 for each $500 of the price")}, or part of $500. The seller owes them.`) +
      h.p(`The county also charges ${h.ext(T8_21, "$15 to record the deed")} and $10 to record the release of a paid-off mortgage.`) +
      HOUSES_PHOTO +
      h.p("We read the county's recorded deeds to find four prices. Three are for homes other than condos: the middle sale, and the prices 1 in 4 sold below and above. The last row is the middle condo. Find the price nearest yours.") +
      TIERS +
      h.p("At each of these four prices, the fees in state law come to under half of 1 percent of the price, about 0.38 percent. The commission and the other lines on the net sheet come on top.") },

    { h2: "What HOA fees does a seller pay at closing?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p("The association's charges for the sale go to the side the contract ticks, and to you if no box is ticked. Your regular dues are split as of the closing day instead, like the property tax.") +
      plain([
        ["No cap in state law", `South Carolina has no cap on what an association charges for its resale papers or its letter of what is owed. A transfer fee covenant that makes an owner pay a third party on each sale is ${h.ext(T27_1, "not binding")} if it was recorded after February 1, 2012. A fee paid to the association itself is still allowed.`],
        ["Unpaid dues come out of your money", `Unpaid HOA fees are usually a lien on the home, and they come out of the seller's money at closing. We look for them before closing. On a condo sale, ${h.ext(T27_31, "state law")} requires your unpaid association charges to be paid out of the price, after past-due taxes and recorded mortgages.`],
        ["Special assessments", `For a special assessment approved before closing, the contract has two boxes: you pay all of it, or only the part due in the year of closing. One approved after closing is the buyer's. Our ${h.a("/hoa/special-assessments/", "special assessments page")} goes further.`],
      ]) +
      h.p(`More than 1 in 4 houses for sale here list no HOA fee. Almost every condo for sale lists one. Our ${h.a("/hoa/estoppel-and-transfer-fees/", "guide to HOA fees when a home sells")} covers the letter the association sends for the sale.`) +
      h.cta("Have us find out what your HOA charges when you sell.", "Send us the address and the name of your association. We find out its charges on a sale and put them on your net sheet.", "Ask us about my HOA", LEAD, bg) },

    { h2: "Why is my mortgage payoff more than my balance?", toc: "Payoff", id: "payoff", html: () =>
      h.p(`Your ${h.ext(CFPB_PAY, "payoff")} includes the interest due through the day the loan is paid off, and any fees charged and not yet paid. Some loans also charge a prepayment penalty, a fee for paying the loan off early.`) +
      h.p(`On a home loan made for personal use, the servicer must send ${h.ext(REGZ, "an accurate payoff statement")} within seven business days of a written request. A loan made to buy a rental the owner does not use counts as a business loan, and that rule does not apply to it. A beach place the owner planned to use more than 14 days a year still counts as personal.`) +
      h.h3("Closing day: guard the wire") +
      h.p(`Never follow wiring instructions that arrive in an email. ${h.ext(CFPB_WIRE, "Confirm them by phone")} with the attorney's office, at a number you agreed on in advance.`) },

    { h2: "Who pays the property taxes when you sell in Horry County?", toc: "Property taxes", id: "property-taxes", html: (bg) =>
      h.p(`You pay for the part of the year you owned the home, and the buyer pays for the rest. South Carolina property taxes for a year are ${h.ext(T12_45, "due between September 30 and January 15")} after they are assessed. To look up the bill for your home, use our ${h.a("/buyers/property-records/tax-bill/", "guide to Horry County tax payments")}.`) +
      h.p("For most of the year, the tax for the months you have owned the home has not been billed yet. At closing you credit the buyer your share. The credit is your own tax for those months, not an extra cost.") +
      TAX_CHART +
      h.h3("Why a second home pays about three times as much") +
      h.p(`A home its owner lives in is ${h.ext(T12_43, "assessed at 4 percent")} of its value and pays no school operating tax. A second home or rental is assessed at 6 percent and pays the full ${h.ext(LEVY, "county levy")}.`) +
      h.p("Inside a city or town, such as Myrtle Beach or Conway, the tax and the credit differ from these figures.") +
      h.h3("If the bill turns out different") +
      h.p(`The closing attorney figures the tax split from the tax information they judge reliable. If the bill later turns out different, you and the buyer settle the difference between yourselves.`) +
      h.p(`When a home's last deed is old, its tax bill, and the tax credit at closing, is often smaller than one figured on today's price. Our ${h.a("/buyers/property-taxes/", "property tax page")} explains why.`) +
      h.cta("Have us work out the tax credit from your own tax bill.", "Send us the address. We work out your share of this year's tax from the county's bill for your home.", "Have us check my tax bill", LEAD, bg) },

    { h2: "Is the money you keep from the sale taxed?", toc: "Tax on the gain", id: "tax", html: () =>
      h.p(`Often not, if it was your main home. You can exclude up to $250,000 of gain from your income, or $500,000 for a married couple filing jointly.`) +
      plain([
        ["Who can use the exclusion", `You ${h.ext(IRS701, "owned and lived in the home")} at least 2 of the last 5 years. You also did not use the exclusion on another home in the 2 years before.`],
        ["Your selling costs lower the gain", `The commission, legal fees, and the deed stamps and other fees you pay as the seller ${h.ext(IRS523, "count as selling expenses")}.`],
        ["The sale is reported on Form 1099-S", `The closing attorney's office ${h.ext(IRS1099S, "reports most sales to the IRS")}. A main home that sells for $250,000 or less may be left off if you certify the whole gain is excluded. For a married seller the limit is $500,000.`],
      ]) +
      h.p(`A rental or a second home is taxed differently. Our ${h.a("/sell/capital-gains/", "capital gains guide")} works through it.`) },

    { h2: "How do sellers here keep more of the price?", toc: "Keep more", id: "keep-more", html: (bg) =>
      h.p(`Price it once. On a ${money(PRICE)} home, each 1 percent off the asking price is ${money(ONE)}, the same as 1 percent of commission.`) +
      h.p(`We checked every resale house and townhouse for sale in Horry County for a price cut. More than half have cut their asking price at every price: about ${Math.round(BANDS[0].pct_price_cut)} percent under $300,000, and about 56 percent in each higher band.`) +
      CUTS +
      h.p(`The homes for sale near the top of this page are the kind a seller near the middle competes with. Our ${h.a("/sell/home-value/", "home value page")} shows how we price a home from the recorded sales most like it.`) +
      plain([
        ["The commission is yours to agree", `${h.ext(NAR_SET, "Agents' fees are fully negotiable")}, and no law fixes them. Offers to pay the buyer's agent are no longer made on the MLS, the agents' shared listing service. Offering to pay the buyer's agent is a choice, not a requirement.`],
        ["A credit to the buyer is your money", `The contract caps it at a dollar amount. If the buyer's costs come in lower, or the lender allows less, the rest stays with you. On an ${h.ext(HUD, "FHA loan")}, the seller and others may pay up to 6 percent of the price toward the buyer's closing costs. On a ${h.ext(VA, "VA loan")}, other concessions are capped at 4 percent of the home's reasonable value.`],
        ["A home warranty is rare on a resale here", `Only ${LH.warranty_resale} of ${n0(LH.resale)} resale houses and townhouses for sale advertise one. Nearly all the home warranties offered here come with new homes. The standard contract has no home warranty clause; buyer and seller can add one with a separate addendum.`],
      ]) +
      h.cta("Have us price your home against what is for sale now.", "We compare your home with the recent sales most like it and the homes for sale near it, and send you a price, free.", "Get my home's price", "/sell/home-value/", bg) },

    { h2: "Get a net sheet for your own home", toc: "Your net sheet", id: "lead-form", html: () =>
      h.p("Give us the address and what you owe, and a licensed agent builds your net sheet with every line on this page filled in for your sale.") +
      LEAD_FORM +
      h.p(`Selling it yourself instead? Our ${h.a("/sell/fsbo/", "for sale by owner guide")} covers the costs that stay the same. Selling from far away? Our page on ${h.a("/sell/out-of-state-buyers/", "selling from out of state")} explains the steps. Selling during a divorce? Our guide to ${h.a("/sell/divorce/", "selling a house during a divorce")} has the three choices. Buying your next home too? ${h.a("/sell/sell-or-buy-first/", "Sell first or buy first")} shows what owners here did.`) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([HOUSES]) + LEGAL,
  faqTitle: "Seller costs FAQ",
  faq: FAQ,
  sources: [
    { name: "SC REALTORS Form 310", href: F310 },
    { name: "SC Code 12-24", href: T12_24 },
    { name: "8-21", href: T8_21 },
    { name: "12-45", href: T12_45 },
    { name: "12-43", href: T12_43 },
    { name: "27-1", href: T27_1 },
    { name: "27-31", href: T27_31 },
    { name: "12-8", href: T12_8 },
    { name: "Doe v. McMaster", href: DOE },
    { name: "SC Bar opinion 11-06", href: EAO },
    { name: "Horry County 2026 levy", href: LEVY },
    { name: "CFPB", href: CFPB_PAY },
    { name: "IRS Pub 523", href: IRS523 },
    { name: "HUD 4000.1", href: HUD },
    { name: "VA", href: VA },
    { name: "NAR", href: NAR_SET },
    { name: "County deeds", href: DEEDS },
  ],
  sourcesNote: `Prices: our count of county deeds. Homes for sale: our count of the listing feed on ${PULL_DAY}, in total only. Not legal or tax advice.`,
  bottomCta: { h2: "Selling a second home or a rental?", p: "Our capital gains calculator works out the tax on the gain, and the state's hold-back for a seller who lives in another state.", label: "Work out the tax on my gain", href: "/sell/capital-gains/" },
  keywords: "cost to sell a house in South Carolina, seller closing costs SC, seller net sheet, net proceeds calculator, South Carolina deed stamps, South Carolina transfer tax calculator, who pays title insurance in South Carolina, seller attorney fees SC, Horry County property tax proration",
  about: "What a seller pays and keeps when selling a home in South Carolina and Horry County",
});
