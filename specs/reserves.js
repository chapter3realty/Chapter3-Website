/* /hoa/reserves/ - condo and HOA reserve funds on the Grand Strand: what a reserve fund is, that South Carolina
 * law requires none, how much is enough (percent funded and its bands), a worked example of a weak building,
 * the lender's 10 and 15 percent test, why it matters more here, what other states require, what a reserve
 * study holds, and what we read before a buyer offers.
 *
 * Batch 2026-10-d, Lane U. The page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-d/hoa-reserves/facts.md (verified rows, and corrected rows only in the
 * verifier's wording, VERIFY.md). Struck wording: hoa-reserves-struck.json (20-year study, "special assessments
 * are rare", "Fannie Mae raises ... 15", "$25,000" for Florida, "before the offer").
 * Charts, tables and the tool are built here from data/2026-10-d/hoa-reserves/ (website working copy), never typed:
 *   worked-example.json  the labelled 80-unit example (rows 29 to 31)
 *   condo-ages.json      condos for sale by year built, elevator and oceanfront buildings, listed fees (rows 24, 25, 27;
 *                        the CRM's active listings, counted only)
 *   photos.json          the one photo: a USGS oblique aerial, public domain, with the writer's subject check
 * Kept from the live page: the headline ("Can this association pay for its own roof?"), the two-accounts idea
 * (row 2), the five things we look at (now "What we read", rows 4 to 14), the lender point with the study route
 * it left out, the offer "Have us read the financials" and its sentence (row 32), the FAQ questions, the links
 * to special assessments and non-warrantable condos.
 * Cut: the "%s" document box, the typed dates, "financial x-ray", "Higher is safer", "Yes, and increasingly so",
 * "This is the part buyers rarely connect", the four repeated calls, the South Carolina answer only in the FAQ.
 * Sibling owners: /hoa/special-assessments/ (assessment size, who pays at closing, the minutes list, the HUD ruler,
 * the by-decade chart), /invest/non-warrantable-condos/ (loan detail), /hoa/dues-increases/ (budget notice).
 * This page owns reserve studies, percent funded, the lender's reserve test and other states' reserve laws.
 * Review round 1 (critic, reader, owner's eye): each fact said once; the method strips (how percent funded is
 * worked out, what a study holds) and the "No" cards cut; the parts table becomes a drawing of the building with
 * each part's life used, no dollar column; the gap box keeps one gap figure and the per-unit split; the lender
 * cards say what a pass and a fail mean; Florida's detail cut to one sentence; new: a building with no study,
 * when a buyer sees the papers and can still back out, the salt-water point, a storm link. Ledger rows 33 to 36
 * (VERIFIED-BY-FIXER) carry the new facts. See REVIEW-1.md.
 * Review round 2: the bands said once (gauge); the lender's 10 percent line said only in the lender section and the
 * calculator, with which line applies from January 4, 2027 (rows 12, 16); the Florida salt-water sentence and row 36
 * cut; the due diligence card cut to what Rosen Hagood says (row 33, as on the flooding page), fee clause gone;
 * FAQ cut to four answers the body does not give; the state table to two columns; numbers rounded; the "our
 * page on" links folded into sentences. Page-scoped work-arounds for the shared feed at 320 px and the header at
 * 1024 px (as on the flooding page), the glance tile type and the contents box. See REVIEW-2.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/reserves/";
const DIR = path.join(__dirname, "..", "data", "2026-10-d", "hoa-reserves");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const WX = read("worked-example.json"), AGES = read("condo-ages.json");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const pct = (a, b) => Math.round(a / b * 100);
const to10 = (v) => Math.round(v / 10) * 10;
const YEAR = new Date().getFullYear();

/* ---- Rows 29 to 31: the worked example, checked against the ledger. ---- */
const W = WX.weak, S = WX.strong, B = WX.budget;
if (WX.units !== 80 || WX.dues_month !== 600 || WX.cost_total !== 2030000 || WX.fully_funded_balance !== 1515600 || W.balance !== 400000 || W.gap !== 380000
  || W.gap_per_unit_80 !== 4750 || W.gap_per_unit_40 !== 9500 || W.gap_per_unit_200 !== 1900 || S.balance !== 1140000 || S.gap !== 0
  || B.assessment_income_year !== 576000 || B.reserve_line !== 60000 || B.needed_at_15pct !== 86400 || B.extra_per_unit_month_for_15pct !== 28)
  throw new Error("worked-example.json no longer gives the ledger's rows 29 to 31");
if (WX.components.reduce((t, c) => t + c.cost * c.age_years / c.life_years, 0) !== WX.fully_funded_balance) throw new Error("the example's parts do not add to its fully funded balance");
const PF_WEAK = Math.round(W.balance / WX.fully_funded_balance * 100), PF_STRONG = Math.round(S.balance / WX.fully_funded_balance * 100);
const SHARE = Math.round(B.reserve_line / B.assessment_income_year * 1000) / 10;
if (PF_WEAK !== 26 || PF_STRONG !== 75 || SHARE !== 10.4) throw new Error("the example's percentages are not the ledger's");
const ROOF = WX.components.find((c) => /roof/i.test(c.part)), BALC = WX.components.find((c) => /balcon/i.test(c.part));
const PART_NAME = { "Elevator machinery (two elevators)": "Elevator machinery", "Exterior paint and coatings": "Exterior paint", "Pool pumps and equipment": "Pool equipment" };

/* ---- Rows 24, 25, 27: condos for sale by year built. "30 years or older" is built 1996 or earlier; the age
   is computed from the build year, so the words stay true as the years pass. ---- */
const band = (b) => AGES.rows.find((r) => r.band === b);
const ALL = band("all"), OLD = band("built 1986 or earlier"), MID = band("built 1987 to 1996");
if (ALL.condos !== 2867 || OLD.condos !== 1094 || MID.condos !== 499 || ALL.elevator_building !== 1490 || ALL.oceanfront_building !== 1107
  || OLD.elevator_building + MID.elevator_building !== 862 || OLD.oceanfront_building + MID.oceanfront_building !== 720)
  throw new Error("condo-ages.json no longer gives the ledger's rows 24 and 25");
const AGE30 = YEAR - MID.yearMax;
const old30 = (k) => OLD[k] + MID[k];
const AGE_CHART = G.bars([
  { name: "All condos for sale", value: pct(old30("condos"), ALL.condos), valueText: `${pct(old30("condos"), ALL.condos)}%`, reference: true },
  { name: "In elevator buildings", value: pct(old30("elevator_building"), ALL.elevator_building), valueText: `${pct(old30("elevator_building"), ALL.elevator_building)}%` },
  { name: "In oceanfront buildings", value: pct(old30("oceanfront_building"), ALL.oceanfront_building), valueText: `${pct(old30("oceanfront_building"), ALL.oceanfront_building)}%` },
], { caption: `Share of Grand Strand condos for sale in buildings ${AGE30} years or older`, nameLabel: "Condos for sale", valueLabel: "share", format: (v) => `${v}%`, max: 100, compact: true,
  note: "Our count of the condos for sale in the local MLS, by the year built each listing gives. Elevator and oceanfront buildings are the listings' own features." });
const FEE = (r) => to10(r.median_fee_month_within_5);
/* Round 2 (owner's eye): one rounded figure for the two older bands, not a range. Both must sit within $25 of it. */
const FEE_OLD = Math.round((FEE(OLD) + FEE(MID)) / 2 / 50) * 50;
if (Math.abs(FEE(OLD) - FEE_OLD) > 25 || Math.abs(FEE(MID) - FEE_OLD) > 25) throw new Error("the two older fee bands no longer round to one figure");

/* ---- Row 11: saving ahead against a bill or a loan (one firm's example; an association's cost, not a payment). ---- */
const ROOF_CHART = `<div class="rs-roof">` + G.bars([
  { name: "Saved for ahead", value: 231823, valueText: "$230,000", feature: "less than the price: savings earn interest" },
  { name: "A special assessment", value: 250000, valueText: "$250,000", feature: "the full price, all at once", reference: true },
  { name: "A bank loan", value: 320071, valueText: "$320,000", feature: "plus the interest on the loan" },
], { caption: "What a $250,000 roof costs the owners, three ways", nameLabel: "How it is paid", featureLabel: "why", valueLabel: "cost to owners", compact: true,
  note: "The same reserve-study firm's example, rounded to the nearest $10,000." }) + `</div>`;

/* ---- Row 10: the bands, as a gauge with the example's two markers, and as cards. ---- */
const GAUGE = (() => {
  const W0 = 320, x0 = 6, x1 = 314, y = 62, hgt = 30, X = (p) => x0 + (x1 - x0) * p / 100;
  const seg = (a, b, fill) => `<rect x="${X(a).toFixed(1)}" y="${y}" width="${(X(b) - X(a)).toFixed(1)}" height="${hgt}" fill="${fill}"/>`;
  const mark = (p, label, up) => {
    const x = X(p).toFixed(1), anchor = p < 35 ? "start" : p > 65 ? "end" : "middle", tx = p < 35 ? X(p) - 6 : p > 65 ? X(p) + 6 : X(p);
    return `<line x1="${x}" x2="${x}" y1="${up ? y - 16 : y}" y2="${up ? y + hgt : y + hgt + 16}" stroke="#1c2028" stroke-width="2.5"/>`
      + `<circle cx="${x}" cy="${up ? y - 16 : y + hgt + 16}" r="4" fill="#1c2028"/>`
      + `<text x="${tx.toFixed(1)}" y="${up ? y - 26 : y + hgt + 36}" text-anchor="${anchor}" font-size="17" font-weight="700" fill="#1c2028">${label}</text>`;
  };
  const tick = (p) => `<text x="${X(p).toFixed(1)}" y="${y + hgt + 62}" text-anchor="${p === 0 ? "start" : p === 100 ? "end" : "middle"}" font-size="15" fill="#5c6b78">${p}%</text>`;
  const zone = (a, b, word) => `<text x="${((X(a) + X(b)) / 2).toFixed(1)}" y="${y + 20}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">${word}</text>`;
  const aria = `Gauge of percent funded from 0 to 100 percent: weak under 30, fair from 30 to 70, strong from 70 up. The example building is at ${PF_WEAK} percent, in the weak band. The same building with more saved is at ${PF_STRONG} percent, in the strong band.`;
  const svg = `<svg role="img" aria-label="${aria}" viewBox="0 0 ${W0} 166" width="100%" style="display:block;max-width:500px;height:auto;margin:0 auto;font-family:var(--sans)">`
    + `<clipPath id="rsBar"><rect x="${x0}" y="${y}" width="${x1 - x0}" height="${hgt}" rx="15"/></clipPath>`
    + `<g clip-path="url(#rsBar)">${seg(0, 30, "#a8482f")}${seg(30, 70, "#8f6131")}${seg(70, 100, "#3f7461")}</g>`
    + zone(0, 30, "Weak") + zone(30, 70, "Fair") + zone(70, 100, "Strong")
    + mark(PF_WEAK, `Example: ${PF_WEAK}%`, true) + mark(PF_STRONG, `Same building, ${PF_STRONG}%`, false)
    + [0, 30, 70, 100].map(tick).join("") + `</svg>`;
  return `<figure class="rs-fig"><p class="cap">Percent funded: what the fund holds, against what it should hold</p>${svg}`
    + `<figcaption>Association Reserves, a national reserve-study firm, set these bands from its clients' studies. The two marks are the example building below, with less and with more saved.</figcaption></figure>`;
})();
/* ---- Rows 19, 21 to 23: other states. Every cell from a verified or corrected row; no guesses. Round 2 (owner's
   eye): only what a buyer from that state needs, whether a study is required and how often; the inspection column,
   the asset floor and the occupancy rule are cut. ---- */
const STATE_ROWS = [
  ["South Carolina", "No", "Never required"],
  ["Florida", "Yes, for condo buildings 3 stories or taller", "At least every 10 years"],
  ["New Jersey", "Yes", "At least every 5 years for concrete, masonry or steel condo buildings"],
  ["Maryland", "Yes", "At least every 5 years"],
  ["Virginia", "Yes, unless the condo's own papers say otherwise", "At least every 5 years"],
];
const STATE_COLS = ["Reserve study required", "How often"];
const STATES = `<div class="rs-st"><p class="cap">What the law requires of condo associations, by state</p><table><thead><tr><th scope="col">State</th>${STATE_COLS.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>`
  + STATE_ROWS.map(([st, ...cells]) => `<tr${st === "South Carolina" ? ' class="sc"' : ""}><th scope="row">${st}</th>${cells.map((c, i) => `<td data-l="${STATE_COLS[i]}">${c}</td>`).join("")}</tr>`).join("")
  + `</tbody></table></div>`;

/* ---- The lender's test as a tool (row 31 prefilled). No address, no loan figures; it stores nothing. ---- */
const IN = (id, label, v, pre) => `<label>${label}<span class="u">${pre ? "$" : ""}<input id="${id}" type="text" value="${n0(v)}" inputmode="numeric" autocomplete="off" oninput="c3Rs()" onchange="c3RsF(this)" aria-label="${label}"></span></label>`;
const CALC = `<div class="rs-calc"><p class="k">Does this budget pass the lender's test?</p><div class="g">`
  + IN("rsUnits", "Units in the building", WX.units, false)
  + IN("rsDues", "Dues per unit, a month", WX.dues_month, true)
  + IN("rsRes", "Reserve line in the yearly budget", B.reserve_line, true)
  + `</div><div class="out"><span>Share of dues going to reserves</span><strong id="rsShare">${SHARE}%</strong></div>`
  + `<p class="note" id="rsNote">Passes 10 percent. Short of Freddie Mac's 15 percent by about $${B.extra_per_unit_month_for_15pct} per unit a month in dues.</p>`
  + `<p class="k k2">If the building has a reserve study</p><div class="g">`
  + IN("rsBal", "Cash in the reserve fund", W.balance, true)
  + IN("rsFfb", "What the study says it should hold", WX.fully_funded_balance, true)
  + `</div><div class="out"><span>Percent funded</span><strong id="rsPf">${PF_WEAK}%</strong></div><p class="note" id="rsBand">Weak.</p></div>`
  /* Numbers may be typed with commas or a dollar sign. An empty fund (0) is a real case and reads 0 percent. */
  + `<script>function c3RsN(id){var e=document.getElementById(id);if(!e)return NaN;var t=String(e.value).replace(/[$,\\s]/g,"");if(t==="")return NaN;var v=parseFloat(t);return isFinite(v)&&v>=0?v:NaN}`
  + `function c3RsF(e){var t=String(e.value).replace(/[$,\\s]/g,""),v=parseFloat(t);if(t!==""&&isFinite(v)&&v>=0)e.value=Math.round(v).toLocaleString("en-US")}`
  + `function c3Rs(){var g=function(id){var v=c3RsN(id);return isFinite(v)?v:0};`
  + `var s=document.getElementById("rsShare"),n=document.getElementById("rsNote"),p=document.getElementById("rsPf"),b=document.getElementById("rsBand");if(!s||!n||!p||!b)return;`
  + `var inc=g("rsUnits")*g("rsDues")*12,res=g("rsRes");if(!inc){s.textContent="--";n.textContent="Enter the units and the dues.";}else{var sh=res/inc*100;s.textContent=(Math.round(sh*10)/10)+"%";`
  + `var need=Math.max(0,(0.15*inc-res)/g("rsUnits")/12);n.textContent=sh>=15?"Passes both the 10 and the 15 percent line.":sh>=10?"Passes 10 percent. Short of Freddie Mac\'s 15 percent by about $"+Math.ceil(need)+" per unit a month in dues.":"Fails the 10 percent test. To reach it: about $"+Math.ceil(Math.max(0,(0.1*inc-res)/g("rsUnits")/12))+" more per unit a month in dues.";}`
  + `var ffb=c3RsN("rsFfb"),bal=c3RsN("rsBal");if(!(ffb>0)){p.textContent="--";b.textContent="Enter what the study says the fund should hold.";return}if(!isFinite(bal))bal=0;var pf=Math.round(bal/ffb*100);p.textContent=pf+"%";`
  + `b.textContent=pf<30?"Weak.":pf<70?"Fair.":"Strong.";}`
  + `document.addEventListener("DOMContentLoaded",c3Rs);</script>`;

/* ---- The page's own blocks. ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const CSS = "<style>"
  + `main#main .rs-pots{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;gap:.7rem;max-width:760px}`
  + `@media (min-width:760px){main#main .rs-pots{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `main#main .rs-pots li{margin:0;padding:1rem 1.1rem;border-radius:18px;${CARD}}`
  + `main#main .rs-pots li.hot{border:2px solid var(--brass);background:#fff}`
  + `main#main .rs-pots .k{display:block;font-family:var(--sans);font-size:.75rem;letter-spacing:.12em;text-transform:uppercase;color:#8a5226;font-weight:700;margin-bottom:.3rem}`
  + `main#main .rs-pots b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.3;margin-bottom:.25rem}`
  + `main#main .rs-pots span.t{display:block;color:var(--muted);line-height:1.55}`
  + `main#main .rs-fig{max-width:760px;margin:1.4rem 0 1.4rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;${CARD}}`
  + `main#main .rs-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .4rem}`
  + `main#main .rs-fig figcaption{color:var(--muted);font-size:1rem;line-height:1.55;margin-top:.4rem}`
  + `main#main .rs-tbl{max-width:760px;margin:1.2rem 0 1rem;border-radius:20px;overflow:hidden;${CARD}}`
  + `main#main .rs-tbl .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0;padding:1rem 1.1rem .5rem}`
  + `main#main .rs-tbl table{width:100%;border-collapse:collapse;font-family:var(--sans)}`
  + `main#main .rs-tbl th{text-align:left;vertical-align:bottom;font-size:.85rem;color:var(--navy);font-weight:700;padding:.5rem .7rem;border-bottom:2px solid rgba(28,32,40,.18);line-height:1.3}`
  + `main#main .rs-tbl td{padding:.6rem .7rem;border-bottom:1px solid rgba(28,32,40,.08);color:var(--muted);font-size:1rem;line-height:1.4;vertical-align:top}`
  + `main#main .rs-tbl td b{color:var(--navy);font-weight:600}main#main .rs-tbl td small{display:block;font-size:.9rem;color:var(--muted)}`
  + `main#main .rs-tbl .num{text-align:right}main#main .rs-tbl th.num{max-width:9rem}main#main .rs-tbl td.num b{white-space:nowrap}main#main .rs-tbl tr.tot td{border-bottom:0;background:rgba(28,32,40,.04);color:var(--navy);font-weight:700}`
  + `@media (max-width:420px){main#main .rs-tbl th,main#main .rs-tbl td{padding-left:.5rem;padding-right:.5rem}main#main .rs-tbl td{font-size:.95rem}}`
  + `main#main .rs-gap{max-width:760px;margin:1.2rem 0 1.4rem;padding:1.2rem 1.3rem;border-radius:20px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));color:var(--ivory);box-shadow:0 26px 60px -30px rgba(28,32,40,.6)}`
  + `main#main .rs-gap .k{font-family:var(--sans);font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);font-weight:600;margin:0 0 .8rem}`
  + `main#main .rs-gap .big{display:flex;flex-wrap:wrap;align-items:baseline;gap:.2rem .7rem;margin:0 0 .6rem}`
  + `main#main .rs-gap .big strong{color:var(--brass-2);font-family:var(--serif);font-size:clamp(2rem,8vw,2.6rem);line-height:1}`
  + `main#main .rs-gap .big span{color:#fff;font-family:var(--sans);font-size:1.1rem;font-weight:600}`
  + `main#main .rs-gap p.t{margin:0 0 .8rem;color:rgba(244,239,232,.9);line-height:1.55}`
  + `main#main .rs-gap .per{border-top:1px solid rgba(244,239,232,.2);padding-top:.8rem;color:rgba(244,239,232,.9);line-height:1.5;margin:0}`
  + `main#main .rs-gap .per strong{color:#fff;font-family:var(--serif);font-size:1.3rem;margin-right:.2rem}`
  + `main#main .rs-parts{max-width:760px;margin:1.2rem 0 1.2rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;${CARD}}`
  + `main#main .rs-parts .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .8rem}`
  + `main#main .rs-parts .in{display:grid;gap:1rem;align-items:center}`
  + `@media (min-width:640px){main#main .rs-parts .in{grid-template-columns:210px minmax(0,1fr);gap:1.4rem}}`
  + `main#main .rs-parts svg{display:block;width:100%;max-width:210px;height:auto;margin:0 auto}`
  + `main#main .rs-parts ol{list-style:none;margin:0;padding:0;display:grid;gap:.55rem}`
  + `main#main .rs-parts li{margin:0;display:grid;grid-template-columns:1.7rem minmax(0,1fr);column-gap:.6rem;align-items:start}`
  + `main#main .rs-parts li .no{grid-row:span 2;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.85rem;margin-top:.1rem}`
  + `main#main .rs-parts li.due .no{background:#a8482f}`
  + `main#main .rs-parts li .nm{display:flex;flex-wrap:wrap;justify-content:space-between;gap:0 .6rem;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1rem;line-height:1.35}`
  + `main#main .rs-parts li .nm small{color:var(--muted);font-weight:400;font-size:.95rem}`
  + `main#main .rs-parts li .bar{display:block;height:.5rem;border-radius:999px;background:rgba(28,32,40,.1);overflow:hidden;margin-top:.3rem}`
  + `main#main .rs-parts li .bar i{display:block;height:100%;width:calc(var(--f)*100%);background:#8f6131;border-radius:999px}`
  + `main#main .rs-parts li.due .bar i{background:#a8482f}`
  + `main#main .rs-parts .key{color:var(--muted);font-family:var(--sans);font-size:.95rem;line-height:1.45;margin:.8rem 0 0}`
  + `main#main .rs-parts .key b{display:inline-block;width:.8rem;height:.8rem;border-radius:50%;background:#a8482f;vertical-align:-.05rem;margin-right:.3rem}`
  + `main#main .rs-flow{list-style:none;counter-reset:rf;margin:1rem 0 1.3rem;padding:0;display:grid;gap:.55rem;max-width:760px}`
  + `@media (min-width:760px){main#main .rs-flow{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `main#main .rs-flow li{counter-increment:rf;position:relative;margin:0;padding:.85rem 1rem .9rem 3.1rem;border-radius:16px;${CARD};color:var(--muted);line-height:1.5}`
  + `main#main .rs-flow li::before{content:counter(rf);position:absolute;left:.9rem;top:.85rem;display:inline-flex;align-items:center;justify-content:center;width:1.6rem;height:1.6rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.85rem}`
  + `main#main .rs-flow li.last{border:2px solid #a8482f;background:#fff}main#main .rs-flow li.last::before{background:#a8482f}`
  + `main#main .rs-flow b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem;line-height:1.35;margin-bottom:.15rem}`
  + `main#main .rs-roof div[role=rowgroup]:not(.sr)>[role=row]:first-child .b{background:#3f7461}`
  + `main#main .rs-ways{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.6rem;max-width:760px}`
  + `@media (min-width:760px){main#main .rs-ways{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `main#main .rs-ways li{margin:0;padding:1rem 1.1rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  + `main#main .rs-ways li.no{border:2px solid #a8482f;background:#fff}`
  + `main#main .rs-ways b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.25rem}`
  + `main#main .rs-calc{background:var(--navy);border-radius:16px;padding:1.3rem 1.3rem 1.2rem;margin:1.2rem 0 1.4rem;max-width:600px}`
  + `main#main .rs-calc .k{font-family:var(--sans);font-size:.75rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);margin:0 0 .9rem;font-weight:600}`
  + `main#main .rs-calc .k2{margin-top:1.4rem;padding-top:1.1rem;border-top:1px solid rgba(244,239,232,.22)}`
  + `main#main .rs-calc .g{display:grid;gap:.8rem}`
  + `main#main .rs-calc label{display:flex;justify-content:space-between;align-items:center;gap:.8rem;color:rgba(244,239,232,.92);font-family:var(--sans);font-size:1rem;line-height:1.35}`
  + `main#main .rs-calc .u{white-space:nowrap;color:rgba(244,239,232,.6);display:flex;align-items:center;gap:.3rem}`
  + `main#main .rs-calc input{width:8.6rem;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.4);border-radius:8px;color:#fff;font:inherit;font-size:1rem;padding:.45rem .55rem;text-align:right}`
  + `main#main .rs-calc .out{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;margin-top:1rem;padding-top:.9rem;border-top:1px solid rgba(244,239,232,.22);color:rgba(244,239,232,.92);font-family:var(--sans)}`
  + `main#main .rs-calc .out strong{color:var(--brass-2);font-family:var(--serif);font-size:1.8rem;line-height:1}`
  + `main#main .rs-calc .note{color:rgba(244,239,232,.8);font-family:var(--sans);font-size:.98rem;line-height:1.55;margin:.55rem 0 0}`
  + `@media (max-width:420px){main#main .rs-calc label{flex-direction:column;align-items:flex-start;gap:.3rem}main#main .rs-calc input{width:100%}main#main .rs-calc .u{width:100%}}`
  + `main#main .rs-st{max-width:860px;margin:1.2rem 0 1.4rem;border-radius:20px;overflow:hidden;${CARD}}`
  + `main#main .rs-st .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0;padding:1rem 1.1rem .5rem}`
  + `main#main .rs-st table{width:100%;border-collapse:collapse;font-family:var(--sans)}`
  + `main#main .rs-st th,main#main .rs-st td{text-align:left;vertical-align:top;padding:.65rem .75rem;border-bottom:1px solid rgba(28,32,40,.08);line-height:1.45;font-size:1rem}`
  + `main#main .rs-st thead th{font-size:.85rem;color:var(--navy);font-weight:700;border-bottom:2px solid rgba(28,32,40,.18)}`
  + `main#main .rs-st tbody th{color:var(--navy);font-weight:700;white-space:nowrap}main#main .rs-st td{color:var(--muted)}`
  + `main#main .rs-st tr.sc th,main#main .rs-st tr.sc td{background:rgba(168,72,47,.07)}`
  + `@media (max-width:699px){main#main .rs-st thead{display:none}main#main .rs-st tbody,main#main .rs-st tr,main#main .rs-st th,main#main .rs-st td{display:block}`
  + `main#main .rs-st tr{padding:.75rem 1.05rem .8rem;border-top:1px solid rgba(28,32,40,.1)}main#main .rs-st tbody th{padding:0 0 .3rem;border:0;font-size:1.08rem}`
  + `main#main .rs-st td{padding:.15rem 0;border:0}main#main .rs-st td::before{content:attr(data-l) ": ";color:var(--navy);font-weight:600}`
  + `main#main .rs-st tr.sc th,main#main .rs-st tr.sc td{background:none}main#main .rs-st tr.sc{background:rgba(168,72,47,.07)}}`
  /* Round 2 work-arounds, page-scoped (NEEDS 10, 11; same as /buyers/undisclosed-flooding/): the shared feed's search
     row at 320 px, the header phone at 1000 to 1100 px, the glance tile type (figure larger than its line, 1.4 line
     height) and the contents box in two columns from 700 px. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main .c3-glance li{line-height:1.4}main#main .c3-glance strong{font-size:1.2rem!important;font-weight:700;line-height:1.25}main#main .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}"
  + "@media (min-width:700px){main#main nav[aria-label=\"On this page\"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}"
  /* Workaround (sibling's NEEDS.md 5): when the site adds a block after the closing band, glass.js treats that band
     as the top offer bar and puts its ivory heading on a light panel. Keep the closing band dark. */
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const POTS = `<ul class="rs-pots" aria-label="Where a condo association's money goes">`
  + `<li><span class="k">Account 1</span><b>The operating budget</b><span class="t">Pays this year's bills, from this year's dues.</span></li>`
  + `<li><span class="k">Account 2</span><b>The reserve fund</b><span class="t">Saves for the big repairs ahead: the roof, the elevators, the paving.</span></li>`
  + `<li class="hot"><span class="k">When the reserve is short</span><b>The owners</b><span class="t">Pay the rest, often as a ${h.a("/hoa/special-assessments/", "special assessment")}.</span></li></ul>`;

/* The example building, drawn (our own illustration): its six parts numbered, in the order of
   worked-example.json. Red marks the three parts due within five years (row 30). No dollar column (owner's
   eye, round 1: "too many numbers"); the dollars stay in worked-example.json and the two totals below. */
const DUE_SET = new Set(WX.due_parts);
if (WX.components.length !== 6) throw new Error("the drawing numbers six parts");
const PART_LABEL = { "Elevator machinery (two elevators)": "Elevator machinery, two elevators", "Exterior paint and coatings": "Exterior paint", "Pool pumps and equipment": "Pool equipment" };
const TOWER = (() => {
  const isDue = WX.components.map((c) => DUE_SET.has(c.part));
  const mk = (k, x, y) => `<circle cx="${x}" cy="${y}" r="10" fill="${isDue[k - 1] ? "#a8482f" : "#1c2028"}" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${k}</text>`;
  let floors = "";
  for (let k = 0; k < 8; k++) {
    const y = 74 + k * 21;
    floors += `<rect x="70" y="${y}" width="80" height="12" fill="#9fc6ce"/><rect x="65" y="${y + 13}" width="90" height="3.5" fill="#5c6b78"/>`;
  }
  const aria = "Drawing of the example building with its six big parts numbered: 1 the flat roof, 2 the elevator machinery in the box on the roof, 3 the exterior paint, 4 the concrete balconies, 5 the parking lot, 6 the pool equipment. Parts 1, 2 and 3 are due within five years.";
  return `<svg role="img" aria-label="${aria}" viewBox="0 0 210 300" style="font-family:var(--sans)">`
    + `<rect x="0" y="0" width="210" height="300" rx="14" fill="#e2ebe9"/><rect x="0" y="262" width="210" height="38" fill="#e2c69b"/>`
    + `<rect x="6" y="267" width="72" height="26" rx="3" fill="#8b9097"/>` + [22, 38, 54, 70].map((x) => `<line x1="${x}" y1="269" x2="${x}" y2="281" stroke="#fff" stroke-width="1.5"/>`).join("")
    + `<rect x="62" y="62" width="96" height="200" fill="#ede5d8" stroke="#1c2028" stroke-width="2"/>` + floors
    + `<rect x="100" y="244" width="20" height="18" fill="#2a3040"/>`
    + `<rect x="57" y="55" width="106" height="8" fill="#2a3040"/><rect x="112" y="34" width="34" height="21" fill="#c9bfae" stroke="#1c2028" stroke-width="2"/>`
    + `<rect x="164" y="272" width="40" height="14" rx="3" fill="#80b1bc"/><rect x="166" y="252" width="15" height="12" fill="#c9bfae" stroke="#1c2028" stroke-width="1.5"/>`
    + mk(1, 42, 59) + mk(2, 168, 44) + mk(3, 46, 150) + mk(4, 174, 118) + mk(5, 42, 280) + mk(6, 195, 246)
    + `</svg>`;
})();
const PARTS = `<figure class="rs-parts"><p class="cap">The example building's six big parts, and how much of each one's life is used</p><div class="in">${TOWER}<ol aria-label="The six parts and the share of each one's life used">`
  + WX.components.map((c, k) => `<li${DUE_SET.has(c.part) ? ' class="due"' : ""}><span class="no" aria-hidden="true">${k + 1}</span><span class="nm">${PART_LABEL[c.part] || c.part}<small>${c.age_years} of ${c.life_years} years used</small></span><span class="bar" aria-hidden="true"><i style="--f:${(c.age_years / c.life_years).toFixed(3)}"></i></span></li>`).join("")
  + `</ol></div><figcaption class="key"><b aria-hidden="true"></b>Red: due within the next ${WX.due_within_years} years. Each part's life is the planning life used by the U.S. Department of Housing and Urban Development (HUD).</figcaption></figure>`;
const FFB_M = (WX.fully_funded_balance / 1e6).toFixed(1);

/* Row 30: one gap figure and the even split across this building's 80 units. "About two thirds" is the
   $700,000 of savings against the $1,080,000 coming due, checked here. */
const DUE = WX.components.filter((c) => DUE_SET.has(c.part)).map((c) => (PART_NAME[c.part] || c.part).toLowerCase());
if (Math.abs(W.cash_in_5_years / W.due_in_5_years - 2 / 3) > 0.03) throw new Error("the gap box says about two thirds");
const GAP = `<div class="rs-gap"><p class="k">The example building, the next ${WX.due_within_years} years</p>`
  + `<p class="big"><strong>${money(W.gap)}</strong><span>short</span></p>`
  + `<p class="t">The ${DUE[0]}, the ${DUE[1]} and the ${DUE[2]} come due. By then the fund will hold about two thirds of what they cost.</p>`
  + `<p class="per">Split evenly: about <strong>${money(W.gap_per_unit_80)}</strong> for each of the ${WX.units} owners.</p></div>`;

/* Rows 12 to 14: what a pass and a fail mean for a buyer (owner's eye, round 1). */
const WAYS = `<ul class="rs-ways" aria-label="What the lender's reserve test means for a buyer">`
  + `<li><b>How a building passes</b>At least 10 percent of its dues goes into reserves. Or it saves what a current reserve study says it should.</li>`
  + `<li class="no"><b>When it fails</b>A buyer there cannot get a conventional loan that follows these rules, though ${h.a("/invest/non-warrantable-condos/", "some other loans")} still work. When you ${h.a("/sell/sell-my-condo/", "sell a condo")} there, your buyer's lender runs the same test.</li></ul>`;

/* The one photo (rules/images.md): a USGS oblique aerial, public domain; record and subject check in this page's
   data folder. It shows roofs and balconies on oceanfront towers; the caption names no building and does not
   say the towers are condos. Some roofs in the frame are orange, so the caption says "roofs", not "flat roofs".
   The photo's year is in the credits only. */
const ph = PK.create({ h, photos: read("photos.json").photos, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "760px" });
const PHOTO = ph.aerial("myrtle-beach-oceanfront-towers-2011", "Oceanfront towers in Myrtle Beach, seen from a plane over the ocean. Their roofs, rooftop boxes and stacked balconies are the kind of parts a reserve fund saves for.");
ph.share("myrtle-beach-oceanfront-towers-2011");
/* photos.js adds a general "resized these photos and cropped some of them" line; this page's one photo already
   says "Chapter3 Realty cropped and resized the photo" (critic, round 1). Cut the general line here; NEEDS 9. */
const GENERIC_CREDIT = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.</div>';
const CREDITS = () => { const c = ph.credits(); if (!c.includes(GENERIC_CREDIT)) throw new Error("photos.js changed its general credit line; recheck NEEDS 9"); return c.replace(GENERIC_CREDIT, ""); };

/* The glance row under the H1 (rows 24, 28). Round 2 (owner's eye): two facts a reader could not guess; the
   "Big repairs" tile and the 10 percent tile are cut (the lender's line is said in the lender section). */
const ELEV = 20; /* row 28: HUD's planning life for elevator machinery */
const GLANCE = PK.glance([
  { icon: "town", label: `${pct(old30("condos"), ALL.condos)}% of condos`, text: `for sale are in buildings ${AGE30}+ years old` },
  { icon: "home", label: `${ELEV} years`, text: "the federal planning life of elevator machinery" },
]);
/* Row 28 again, for the newer-building FAQ: a building finished in 2015 has not reached HUD's 15-year life for an
   elastomeric flat roof or the 20-year life for elevator machinery. Throws the year that stops being true. */
const NEW_AGE = YEAR - 2015;
if (NEW_AGE >= 15) throw new Error("a 2015 building has now reached HUD's 15-year roof life; rewrite the newer-building FAQ");

/* Row 3 (corrected wording) as a three-step order: after damage, insurance, then the reserve, then the owners. */
const ORDER = `<ol class="rs-flow" aria-label="Who pays for a repair after damage, in order">`
  + `<li><b>Insurance</b>Pays first, for what the ${h.a("/hoa/master-insurance-ho6/", "master policy")} covers.</li>`
  + `<li><b>The reserve fund</b>Pays next, from what the board has saved.</li>`
  + `<li class="last"><b>The owners</b>Share the rest, by each unit's percentage in the founding papers.</li></ol>`;

/* Rows 33 and 34: when a buyer sees the papers and can still back out. Round 2 (critic): row 33 has had no
   independent check and its sources disagree on the fee, so the card says only what the flooding page says,
   from Rosen Hagood: a due diligence period, and ending the contract by written notice to the seller. */
const DD_LAW = "https://rosenhagood.com/sc-residential-property-agreements-transitions-to-due-diligence-only-model/";
const WHEN = `<ol class="rs-flow rs-when" aria-label="When a buyer sees the papers, and when the buyer can still back out">`
  + `<li><b>Before you sign</b>In most resales, the seller fills in a disclosure form. It asks whether the association has levied any special assessments.</li>`
  + `<li><b>After you sign</b>The standard South Carolina sales contract has a due diligence period. In it, you ${h.ext(DD_LAW, "can end the contract")} with a written notice to the seller.</li>`
  + `<li class="last"><b>Inside that period</b>Read the reserve study, the budget, the balance sheet and the minutes.</li></ol>`;

const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.2-02/full-review-process";
const FREDDIE = "https://guide.freddiemac.com/app/guide/bulletin/2026-C";
const CAI = "https://www.caionline.org/getmedia/7b5f1422-d10b-4cad-87b7-d1339c0f0ee8/explanation-of-reserve-study-standards-2025-final.pdf";
const AR = "https://www.reservestudy.com/wp-content/uploads/2026/05/2026-04-29-100000-Industry-Insights-Report-FINAL.pdf";
const HUD = "https://www.hud.gov/sites/documents/eul_for_cna_e_tool.pdf";
const FL718 = "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0700-0799/0718/Sections/0718.112.html";
const NJ = "https://pub.njleg.state.nj.us/Bills/2022/PL23/214_.HTM";
const MD = "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=grp&section=11-109.4&enactments=false";
const VA = "https://law.lis.virginia.gov/vacode/title55.1/chapter19/section55.1-1965/";

/* FAQ (owner's eye, rounds 1 and 2): only answers the body does not give. The HOA records answer is row 7 (corrected
   wording); the body gives only the condo rule. Cut in round 2, each said in a section
   above: no study, Fannie Mae's line, backing out, buying with low reserves. "Who pays" now lives only here. */
const FAQ = [
  { q: "Does South Carolina require a reserve study?", a: "No, and it requires no reserve fund either. A board can still choose to get one, and a lender can accept a current study in place of its budget test." },
  { q: "Who pays a special assessment voted before closing?", a: "The purchase contract decides, so it belongs in the offer. A bill the seller already owes is paid at closing, and a buyer can be held to it only up to the association's written statement of it." },
  { q: "Can I see an HOA's reserve records before I buy?", a: "Members can. An HOA member can inspect and copy the budget and the accounting records after giving written notice five business days ahead. A buyer is not yet a member, so we ask the seller for them." },
  { q: "Does a newer condo building need strong reserves?", a: `A newer building needs less saved by now. A building finished in 2015 is ${NEW_AGE} years old, short of HUD's planning life for its elevator machinery and its flat roof, so less of each has worn out. Percent funded still applies: what the fund holds against that smaller amount.` },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "How Much Should a Myrtle Beach Condo Have in Reserves?",
  description: "South Carolina requires no condo reserves. How we judge a building's reserve study, percent funded and the lender's 10 and 15 percent test, with an example.",
  ogTitle: "HOA reserves in Myrtle Beach: how much is enough, and what the lender checks",
  crumb: "Reserves",
  eyebrow: "HOA Guide",
  h1: "Can a Myrtle Beach condo association pay for its own roof?",
  h1em: "Its reserve fund tells you. South Carolina law does not require one.",
  sub: "A Myrtle Beach condo's roof and elevators wear out on a schedule. If its reserves cover the worn part, it can pay. If not, the owners do.",
  heroMedia: GLANCE,
  heroCta: { title: "Send us the building. We read its reserve study, budget and balance sheet.", label: "Have us read the financials", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "Only if it has saved enough. To tell, compare the cash in its reserve fund with what its reserve study says the fund should hold by now. That share is called percent funded. The higher it is, the lower the chance the owners get a special assessment.",
  ],
  sections: [
    { h2: "What is an HOA reserve fund?", toc: "What reserves are", id: "what-reserves-are", html: () => CSS + ph.css() +
      h.p("A reserve fund is money a homeowners association (HOA) or condo association saves each year for big repairs it knows are coming. The roof, the elevators and the paving are the usual ones.") +
      POTS +
      h.p("Saving ahead spreads the cost of a roof across every owner who uses it. Without savings, the whole bill falls on whoever owns a unit the year the roof fails.") +
      h.p("A reserve study is a report on the building's big shared parts: what each one costs, how long it lasts, and how much the fund should hold by now.") },

    { h2: "Does South Carolina require HOA reserves or a reserve study?", toc: "The South Carolina rule", id: "south-carolina-rule", html: () =>
      h.p(`No. ${h.a("/hoa/south-carolina-hoa-laws/", "South Carolina law")} does not require a condo or an HOA to keep a reserve fund, to put any amount into one, or to have a reserve study. How much a building saves is up to its board and its own documents.`) +
      h.p("In a South Carolina condo, every owner shares the cost of keeping up and repairing the shared parts. Each unit's share is the percentage set for it in the condo's founding papers, the recorded documents that created it. After damage, the bill is paid in this order:") +
      ORDER +
      h.p("A condo board must keep a book of every receipt and expense, with repair costs shown, open to every owner. A buyer is not yet an owner, so we get the papers through the seller.") },

    { h2: "How much should a Myrtle Beach condo association have in reserves?", toc: "How much is enough", id: "how-much", html: () =>
      h.p("Enough to cover the part of each big repair that has already worn out. A roof halfway through its life should have about half its cost saved.") +
      GAUGE +
      h.p("In the weak band, repairs are often put off. In the strong band, the risk of a special assessment is low, and a fund does not need to be full to get there.") +
      h.p("Among the firm's own clients, about a third were weak and a quarter strong. Those are associations that pay for a study, and the firm says they may be more careful with money than most.") +
      h.p("Percent funded is a snapshot of today. It does not grade the plan, so we read the plan as well.") },

    { h2: "What does an underfunded condo building look like?", toc: "An example", id: "example", html: () =>
      h.p(`Here is one building with round numbers. It has ${WX.units} units, is 30 years old and has ${money(W.balance)} saved.`) +
      PARTS +
      h.p(`Together, these parts should have about $${FFB_M} million saved by now. The fund is ${PF_WEAK} percent funded: weak.`) +
      GAP +
      h.p(`The same building at ${PF_STRONG} percent funded has no gap. The ${BALC.part.toLowerCase()} come next, ${BALC.life_years - BALC.age_years} years out.`) +
      h.p("The example leaves out inflation and interest. A real condo splits a gap by each unit's percentage in its founding papers, not evenly.") +
      h.h3("Saving ahead costs owners less") +
      h.p("Saved money earns interest. A special assessment pays the full price, and a bank loan adds its interest.") +
      ROOF_CHART },

    { h2: "What do lenders require for condo reserves?", toc: "What lenders require", id: "lenders", html: () =>
      h.p("For most conventional condo loans, the lender tests the building's budget. Fannie Mae and Freddie Mac buy these loans from lenders, and the test is theirs.") +
      WAYS +
      h.h3("10 percent or 15 percent?") +
      h.p("Freddie Mac raises its line to 15 percent for loan applications received on or after January 4, 2027. It says it made the change with its regulator and in alignment with Fannie Mae. Fannie Mae's own guide still says 10 percent.") +
      h.p("From that date, a building that puts 12 percent into reserves fails Freddie Mac's test and passes Fannie Mae's guide as it reads now. Which one applies depends on which company buys your loan. Your loan officer can tell you before you apply.") +
      h.p("Freddie Mac made the change after buildings with underfunded reserves turned out to be the same ones needing critical repairs. It says owners in those buildings can face special assessments or higher dues.") +
      h.h3("A building can pass and still be weak") +
      h.p(`The test reads one line of this year's budget, not the cash in the bank. Our example building puts ${SHARE} percent of its dues into reserves, so it passes while ${PF_WEAK} percent funded. Try your own building's numbers:`) +
      CALC },

    { h2: "Why do reserves matter more on the Grand Strand?", toc: "Why it matters here", id: "why-here", html: () =>
      h.p(`Most condos for sale here are in buildings ${AGE30} years or older, and the elevator and oceanfront buildings are older still.`) +
      AGE_CHART +
      h.p(`HUD plans on elevator machinery lasting ${ELEV} years and a flat roof 15 to 20. A ${AGE30}-year-old tower has passed one planning life of each.`) +
      PHOTO +
      h.p(`The HOA fee will not tell you which ${h.a("/invest/condo-buildings/", "condo buildings")} have saved. In buildings ${AGE30} years or older, the middle listed fee is about ${money(FEE_OLD)} a month, close to the ${money(FEE(ALL))} for all condos for sale. We read the study instead.`) },

    { h2: "What do other states require for condo reserves?", toc: "Other states", id: "other-states", html: () =>
      h.p(`${h.a("/buyers/relocating/from-florida/", "Florida")}, ${h.a("/buyers/relocating/from-new-jersey/", "New Jersey")}, ${h.a("/buyers/relocating/from-maryland/", "Maryland")} and Virginia make condo boards study their reserves on a schedule. A buyer from one of them should not expect the same here.`) +
      STATES },

    { h2: "What if a building has no reserve study, or an old one?", toc: "No study, or an old one", id: "reserve-study", html: () =>
      h.p("No law here requires a reserve study, so a building can have none, or one that is years old. A missing study is a reason to look harder, not proof of a problem.") +
      h.p("Without one, we judge the building from its budget, its balance sheet, its board minutes and the age of its big parts.") +
      h.p("When there is a study, a lender accepts it, or an update, only if it is no more than three years old. Among the same reserve-study firm's clients, associations that update at least every three years were told to charge a new special assessment about half as often as those that update every five.") },

    { h2: "What should a buyer check in a condo's reserves?", toc: "What we read", id: "what-we-read", html: (bg) =>
      h.p("Our agents read the HOA documents for a buyer. For reserves, these five tell us whether the building can pay for its own roof:") +
      h.ol([
        "<strong>The reserve study.</strong> Its date, the percent funded and its plan. A plan that only keeps the fund above zero is a warning.",
        "<strong>The budget's reserve line.</strong> The share of the dues it puts into reserves.",
        "<strong>The balance sheet.</strong> The cash in reserves, against what the study says should be there.",
        "<strong>The age of the big parts.</strong> The roof, the elevators, the paint and the balconies, against HUD's lives and the year the building was built.",
        `<strong>The board's minutes.</strong> Repairs put off, or a special assessment under discussion. ${h.a("/hoa/documents/", "The HOA documents a buyer receives")} are only part of what we ask for.`,
      ]) +
      h.cta("What you get when we read a building", "Its percent funded, its cash against the study, whether its budget passes a lender's test, and the big parts coming due.", "Send us the building's name", "/contact/", bg) +
      h.h3("When you see the papers, and when you can still back out") +
      WHEN +
      h.p("If they are weak, you can ask for a lower price or a credit at closing, or walk away.") },
  ],
  pageImages: () => ph.pageImages(),
  afterSources: () => CREDITS(),
  faqTitle: "Reserve questions",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-31", href: T27_31 },
    { name: "SC Code 27-30", href: T27_30 },
    { name: "Fannie Mae B4-2.2-01", href: FNMA },
    { name: "Freddie Mac Bulletin 2026-C", href: FREDDIE },
    { name: "Community Associations Institute reserve study standards", href: CAI },
    { name: "Association Reserves 2026 report", href: AR },
    { name: "HUD useful lives", href: HUD },
    { name: "Fla. Stat. 718.112", href: FL718 },
    { name: "N.J. P.L.2023 c.214", href: NJ },
    { name: "Md. Real Prop. 11-109.4", href: MD },
    { name: "Va. Code 55.1-1965", href: VA },
    { name: "Rosen Hagood: SC due diligence contract", href: DD_LAW },
  ],
  sourcesNote: "Condos for sale: our count of active MLS listings, by year built. The example uses round numbers. Not legal advice.",
  bottomCta: { h2: "Not sure whether a building has saved enough?", p: "Send the name. We read the study, the budget and the balance sheet and give you a straight answer.", label: "Ask about a building", href: "/contact/" },
  keywords: "HOA reserves Myrtle Beach, condo reserve fund South Carolina, how much should an HOA have in reserves, percent funded reserves, reserve study South Carolina, South Carolina HOA reserve requirements, Fannie Mae condo reserve requirement 10 percent, 15 percent reserve requirement 2027, underfunded HOA reserves, reserve study requirements by state",
  about: "Condo and HOA reserve funds and reserve studies in Myrtle Beach and South Carolina",
});
