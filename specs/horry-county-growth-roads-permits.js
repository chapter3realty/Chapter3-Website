/* /invest/horry-county-growth-roads-permits/ - what the 2026 election means for building in Horry County:
 * how many single-family homes the county permits each year, who won the offices that control fees,
 * zoning, roads and federal money, what RIDE IV is and what its I-73 money depends on, why I-73 has no
 * start date, what each new leader said about roads and growth, the impact fee on a typical home, the
 * flood height rule for new homes, and a short- and long-run range from Horry County's own past data.
 *
 * Batch 2026-11-e (the election pages), page 7. Lane N. Version 1, built 2026-11-04.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at the corrected
 * values (VERIFY.md). Struck wording: batches/2026-11-e/facts/election-2026-struck.json. In particular:
 * never "I-73 has no funding" (write that funding for most of the $1.6 billion is not identified); the
 * RIDE IV terms come from the ballot text (25 years or $6.35 billion; the I-73 local match of up to half
 * and its condition); the $450 million is WIS's figure; the 2021 freeboard ordinance was advanced on
 * second reading, and its final vote is not confirmed.
 * Data: data/2026-11-e/horry-county-growth-roads-permits/data.json (Census county permit files, the FHFA
 * metro index, the RIDE IV ballot terms, the fee, the election rows) and photos.json. The chart, the
 * tables and every computed figure are read from that file here, never typed.
 * Past examples (predictions.md section 7, VERIFY.md list): Horry's own permit history and the FHFA index
 * only. No verified example ties a road plan, a fee or an election to permit counts, so the page makes no
 * estimate for any leader's plan, and says so for each one alike.
 * Co-authored (owner, 2026-11-04): author "devin+abdulla". No name in the copy. Tim Nash reviews.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const PHOTOS = require(path.join(BB, "tools", "photos.js"));

const DATA = path.join(__dirname, "..", "data", "2026-11-e", "horry-county-growth-roads-permits");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const D = read("data.json");
const PH = PK.create({ h, photos: read("photos.json").photos }).photoSet({ aerialWidth: "760px" });

const must = (ok, what) => { if (!ok) throw new Error(`horry-county-growth-roads-permits.js: ${what}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");

/* ---------- the numbers the copy rests on, each checked against the ledger row ---------- */
const SF = D.permits.single_family, MF = D.permits.five_plus;
const YEARS = Object.keys(SF).map(Number).sort((a, b) => a - b);
must(YEARS.length === 21 && YEARS[0] === 2005 && YEARS[20] === 2025, "F196: 21 years, 2005 to 2025");
const MAXY = YEARS.reduce((a, y) => (SF[y] > SF[a] ? y : a), YEARS[0]);
must(MAXY === 2024 && SF[2024] === 7269 && SF[2025] === 6418, "F196: 2024 is the most, 7,269; 2025 is 6,418");
const LOW = YEARS.filter((y) => y >= 2006 && y <= 2012).reduce((a, y) => (SF[y] < SF[a] ? y : a), 2006);
must(LOW === 2010 && SF[2006] === 6484 && SF[2010] === 1388, "F196: 6,484 in 2006 to 1,388 in 2010");
const FALL = Math.round((1 - SF[2010] / SF[2006]) * 100);                 // 79
must(FALL === 79, "F196: the fall 2006 to 2010 is 79 percent, about four in five");
const BACK = YEARS.find((y) => y > 2010 && SF[y] > 6000);                  // 2021
must(BACK === 2021, "F196: first year back above 6,000 is 2021");
const R5 = YEARS.filter((y) => y >= 2021), R5LO = Math.min(...R5.map((y) => SF[y])), R5HI = Math.max(...R5.map((y) => SF[y]));
must(R5LO === 6356 && R5HI === 7269, "F196: 6,356 to 7,269 a year, 2021 to 2025");
must(MF[2005] === 5132 && MF[2025] === 77, "F197: 5,132 units in buildings of five or more in 2005, 77 in 2025");

const Q = D.fhfa.q;
const chg = (a, b) => (Q[b] / Q[a] - 1) * 100;
const ELEC = [2016, 2018, 2020, 2022, 2024].map((y) => chg(`${y}Q4`, `${y + 1}Q4`));
must(ELEC.map((v) => Math.round(v * 10) / 10).join() === "5.6,5,21.6,8.5,3", "F198: +5.6, +5.0, +21.6, +8.5, +3.0");
const ELO = Math.round(Math.min(...ELEC)), EHI = Math.round(Math.max(...ELEC));     // 3, 22
const DROP = Math.round(-chg("2008Q4", "2012Q4"));                                   // 26
const TIMES = Math.round(Q["2026Q2"] / Q["2012Q4"] * 10) / 10;                      // 2.4
must(DROP === 26 && TIMES === 2.4, "F199, F200: 26 percent fall 2008 Q4 to 2012 Q4; 2.4 times by 2026 Q2");

const R4 = D.ride4, I73 = D.i73, FEE = D.impact_fee, FB = D.freeboard, E = D.election;
must(R4.yes_pct === 56.78 && R4.max_years === 25 && R4.max_total === 6.35e9, "F190, F191: RIDE IV terms");
must(I73.cost === 1.6e9 && I73.row_i95_us501_pct === 99 && I73.row_us501_littlepeedee_pct === 95, "F192, F193: I-73");
must(FEE.total_fee === 1615 && FEE.home_sqft === 1500 && FEE.ordinance === "30-2026" && FEE.since === 2021, "F194: fee");
must(FB.from_ft === 1 && FB.to_ft === 3, "F195: one foot to three feet");
const UNOPP = E.council.filter((c) => c[2] === "unopposed").length;
must(E.council.length === 7 && UNOPP === 4, "F016: seven council races, four unopposed");

/* ---------- links ---------- */
const SELF = "/invest/horry-county-growth-roads-permits/";
const P1 = "/market-reports/2026-election/";
const P3 = "/buyers/flood-insurance-after-the-election/";
const BUILT = "/invest/what-is-being-built/";
const NEWC = "/buyers/new-construction/";
const COAST = "/buyers/coastal-insurance/";
const CENSUS = "https://www2.census.gov/econ/bps/County/co2025a.txt";
const FHFA = "https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_at_metro.csv";
const WIS73 = "https://www.wistv.com/2026/08/26/i-73-project-gains-renewed-attention-after-trump-pledge/";
const ROW = "https://www.wmbfnews.com/2026/02/10/scdot-makes-progress-right-of-way-acquisition-proposed-i-73/";
const FEES = "https://www.wmbfnews.com/2026/07/21/impact-fee-schedule-change-now-effect-concerns-raised-over-homeownership/";
const FLOOD21 = "https://www.wmbfnews.com/2021/06/17/horry-county-council-passes-new-flood-regulations-some-neighbors-say-its-not-enough";
const DIFA = "https://www.scstatehouse.gov/code/t06c001.php";
const ZONING = "https://www.scstatehouse.gov/code/t06c029.php";
const AND_INF = "https://drannieandrews.com/issue/transportation-infrastructure-that-works/";
const AND_PLAN = "https://drannieandrews.com/wp-content/uploads/2026/08/Web-file.pdf";
const WIL_WIS = "https://www.wistv.com/2026/10/28/full-interview-alan-wilson-shares-priorities-governor-ahead-election-day/";
const WIL_WMBF = "https://www.wmbfnews.com/2026/09/30/sc-governor-candidates-split-taxes-infrastructure-ahead-registration-deadlines/";
const WIL_PRI = "https://wilsonforsc.com/priorities/";
const RESULTS = "https://scvotes.gov/2026-general-election-results/";
const LOCAL = "https://www.wmbfnews.com/2026/11/04/election-results-whos-winning-grand-strand-pee-dee/";

/* ---------- the page's own blocks, in the glass look ---------- */
const CSS = `<style>
main#main h1,main#main h2,main#main h3{text-wrap:balance}
main#main .g7-steps{list-style:none;margin:1.4rem 0 1.6rem;padding:0;display:grid;gap:.6rem;max-width:820px;counter-reset:s}
main#main .g7-steps li{position:relative;margin:0;padding:.8rem 1rem .85rem 3.3rem;border-radius:16px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.08);line-height:1.5;color:var(--muted);font-size:var(--read,1.0625rem)}
main#main .g7-steps li::before{counter-increment:s;content:counter(s);position:absolute;left:1rem;top:.8rem;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--brass);color:#fff;font:600 .95rem/1.7rem var(--sans);text-align:center}
main#main .g7-steps li.next::before{background:#fff;color:var(--navy);border:2px dashed var(--brass);line-height:1.5rem;box-sizing:border-box}
main#main .g7-steps strong{display:block;color:var(--navy);font-family:var(--sans);font-weight:650;margin-bottom:.15rem}
main#main .g7-grid{display:grid;gap:.7rem;margin:1.2rem 0 1.4rem;max-width:960px}
@media (min-width:760px){main#main .g7-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
main#main .g7-card{padding:1rem 1.1rem 1.05rem;border-radius:16px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.08);color:var(--muted);line-height:1.6;font-size:var(--read,1.0625rem)}
main#main .g7-card h3{font-family:var(--sans)!important;font-size:1.1rem!important;font-weight:650;color:var(--navy);margin:0 0 .5rem!important;line-height:1.35}
main#main .g7-card dl{margin:0}
main#main .g7-card dt{font-family:var(--sans);font-size:.875rem;font-weight:650;letter-spacing:.04em;text-transform:uppercase;color:var(--g-ink,#8a5226);margin-top:.7rem}
main#main .g7-card dd{margin:.15rem 0 0}
main#main .g7-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem;max-width:760px;margin:1rem 0 1.2rem}
@media (max-width:479px){main#main .g7-stats{grid-template-columns:1fr}}
main#main .g7-stats.g7-one{grid-template-columns:1fr;max-width:380px}
main#main .nw{white-space:nowrap}
@media (max-width:379px){main#main .btn-lg{padding-left:1rem!important;padding-right:1rem!important;white-space:nowrap}}
main#main .g7-stats div{padding:.75rem .7rem;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);text-align:center;color:var(--muted);font-size:1rem;line-height:1.4}
main#main .g7-stats b{display:block;font-family:var(--serif);font-weight:600;font-size:1.5rem;line-height:1.15;color:var(--navy);margin-bottom:.2rem}
main#main .g7-tab{max-width:820px;margin:1.2rem 0 1.4rem;padding:.6rem 1rem .4rem;border-radius:18px;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.75)}
main#main .g7-tab table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:var(--read,1.0625rem);color:var(--navy)}
main#main .g7-tab caption{text-align:left;font-weight:600;padding:.4rem 0 .6rem;line-height:1.4}
main#main .g7-tab th,main#main .g7-tab td{padding:.6rem .5rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:left;vertical-align:top;line-height:1.45}
main#main .g7-tab thead th{font-size:.95rem;border-bottom:2px solid var(--navy)}
main#main .g7-tab tbody th{font-weight:600}
main#main .g7-tab td{color:var(--muted)}
main#main .g7-tab tbody tr:last-child>*{border-bottom:0}
@media (max-width:639px){main#main .g7-tab table,main#main .g7-tab tbody,main#main .g7-tab caption{display:block;width:100%}
main#main .g7-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
main#main .g7-tab tr{display:block;padding:.65rem 0;border-bottom:1px solid rgba(28,32,40,.12)}
main#main .g7-tab tbody tr:last-child{border-bottom:0}
main#main .g7-tab th,main#main .g7-tab td{display:block;border:0;padding:0}
main#main .g7-tab td{margin-top:.3rem}
main#main .g7-tab td .l{display:block;font-size:.875rem;font-weight:600;color:var(--navy)}}
@media (min-width:640px){main#main .g7-tab td .l{display:none}}
main#main .g7-fig{margin:1.4rem 0 1.6rem;max-width:760px;padding:1rem 1rem .9rem;border-radius:18px;box-sizing:border-box;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 18px 40px -26px rgba(28,32,40,.45)}
main#main .g7-fig .cap{display:block;color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.05rem;line-height:1.4;margin:0 0 .6rem}
main#main .g7-fig figcaption{color:var(--muted);font-size:1rem;line-height:1.6;margin-top:.6rem}
main#main svg.g7-n{display:block;width:100%;height:auto;max-width:360px;margin:0 auto}
main#main svg.g7-w{display:none;width:100%;height:auto;max-width:700px}
@media (min-width:600px){main#main svg.g7-n{display:none}main#main svg.g7-w{display:block}}
main#main .g7-story{border-left:3px solid var(--brass);padding:1rem 1.2rem;margin:1.4rem 0;max-width:720px;border-radius:0 16px 16px 0;background:rgba(255,255,255,.55);color:var(--muted);line-height:1.7;font-size:var(--read,1.0625rem)}
main#main .g7-story p{margin:0}
/* Shared chrome, worked around as on /invest/strategies/dst/ until the lead fixes the shared CSS. */
@media (max-width:379px){.hx-fb-ai,.hx-fb-ai .hx-ai-badge,.hx-fb-ai .hx-fb-q{max-width:100%!important;min-width:0!important;box-sizing:border-box}.hx-fb-ai .hx-fb-q textarea{flex:1 1 0!important;width:auto!important;min-width:0!important}}
@media (min-width:1000px) and (max-width:1100px){.header-inner>.primary{gap:2.2rem!important}.header-inner{gap:1.6rem!important}}
@media (min-width:760px){main#main nav[aria-label="On this page"]{max-width:960px!important}main#main nav[aria-label="On this page"] ul{columns:2;column-gap:2.4rem}main#main nav[aria-label="On this page"] li{break-inside:avoid}}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{background:#2a3040!important;display:block!important;text-align:center!important;padding:2.2rem 1.6rem!important;margin-left:max(24px,calc((100% - 1132px) / 2))!important;margin-right:0!important;width:min(760px,calc(100% - 48px));max-width:none!important;box-sizing:border-box}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap>p{color:rgba(244,239,232,.82)!important}
@media (prefers-reduced-transparency:reduce){main#main .g7-steps li,main#main .g7-stats div,main#main .g7-card,main#main .g7-story,main#main .g7-tab,main#main .g7-fig{background:#fbf8f3}}
</style>`;

const steps = (items, label) => `<ol class="g7-steps" aria-label="${label}">${items.map(([t, d, next]) => `<li${next ? ' class="next"' : ""}><strong>${t}</strong> ${d}</li>`).join("")}</ol>`;
/* A table that becomes one block a row on a phone; each cell carries its column name for the phone. */
const table = (caption, head, rows) => `<div class="g7-tab"><table><caption>${caption}</caption><thead><tr>${head.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr><th scope="row">${r[0]}</th>${r.slice(1).map((c, i) => `<td><span class="l">${head[i + 1]}</span>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

/* ---------- chart: single-family permits by year, from data.json (F196) ---------- */
const permitSvg = (W, fs, cls) => {
  const H = Math.round(W * 0.66), x0 = Math.round(fs * 3.4), x1 = W - Math.round(fs * 1.4), y0 = fs * 2.2, y1 = H - fs * 2;
  const top = 8000, n = YEARS.length, step = (x1 - x0) / n, bw = step * 0.68;
  const Y = (v) => y1 - (v / top) * (y1 - y0);
  const grid = [0, 2000, 4000, 6000, 8000].map((g) => `<line x1="${x0}" x2="${x1}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="#1c2028" stroke-opacity="${g ? ".1" : ".35"}"/><text x="${x0 - 5}" y="${(Y(g) + fs * 0.35).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="#4a4f5c">${n0(g)}</text>`).join("");
  const mark = new Set([2006, 2010, 2024]);
  const bars = YEARS.map((y, i) => {
    const x = x0 + i * step + (step - bw) / 2, yy = Y(SF[y]);
    const hi = mark.has(y) || y === 2025;
    return `<rect x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${bw.toFixed(1)}" height="${(y1 - yy).toFixed(1)}" rx="${Math.min(3, bw / 3).toFixed(1)}" fill="${hi ? "#c4783a" : "#5c6b78"}" fill-opacity="${hi ? "1" : ".45"}"/>`
      + (mark.has(y) ? `<text x="${(x + bw / 2).toFixed(1)}" y="${(yy - fs * 0.45).toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="#1c2028">${n0(SF[y])}</text>` : "");
  }).join("");
  const xl = [2005, 2010, 2015, 2020, 2025].map((y) => `<text x="${(x0 + (y - 2005) * step + step / 2).toFixed(1)}" y="${(H - fs * 0.4).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="#4a4f5c">${y}</text>`).join("");
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" aria-label="Column chart of single-family homes permitted in Horry County each year from 2005 to 2025. ${n0(SF[2006])} in 2006, down to ${n0(SF[2010])} in 2010, then up most years to ${n0(SF[2024])} in 2024, the most of any year shown, and ${n0(SF[2025])} in 2025.">${grid}${bars}${xl}</svg>`;
};
const PERMIT_CHART = `<figure class="g7-fig"><span class="cap">Single-family homes permitted in Horry County, by year</span>${permitSvg(340, 13, "g7-n")}${permitSvg(700, 14, "g7-w")}<figcaption>From ${n0(SF[2006])} in 2006 to ${n0(SF[2010])} in 2010, then up in most years to the most of any year shown, ${n0(SF[2024])} in 2024. Census county permit counts.</figcaption></figure>`;

/* ---------- the freeboard drawing (F195): one foot and three feet above the flood level ---------- */
const freeboardSvg = (() => {
  const W = 340, H = 200, base = 150, ft = 26;
  const house = (cx, feet, label) => {
    const floor = base - feet * ft, w = 96, x = cx - w / 2;
    const posts = [x + 8, x + w - 14].map((px) => `<rect x="${px}" y="${floor}" width="6" height="${178 - floor}" fill="#5c6b78" fill-opacity=".7"/>`).join("");
    return posts + `<rect x="${x}" y="${floor - 46}" width="${w}" height="46" rx="3" fill="#fff" stroke="#1c2028" stroke-opacity=".6"/>`
      + `<path d="M${x - 6} ${floor - 46}L${cx} ${floor - 76}L${x + w + 6} ${floor - 46}Z" fill="#c4783a"/>`
      + `<line x1="${x}" x2="${x + w}" y1="${floor}" y2="${floor}" stroke="#1c2028" stroke-width="2"/>`
      + `<text x="${cx}" y="${floor - 18}" text-anchor="middle" font-size="13" font-weight="600" fill="#1c2028">${label}</text>`;
  };
  return `<svg class="g7-fb" viewBox="0 0 ${W} ${H}" role="img" font-family="system-ui,-apple-system,Segoe UI,Roboto,sans-serif" style="display:block;width:100%;height:auto;max-width:420px;margin:0 auto" aria-label="Drawing of two houses on posts in a flood zone. The left house's floor is ${FB.from_ft} foot above the flood level. The right house's floor is ${FB.to_ft} feet above it, the height in the 2021 ordinance.">`
    + `<rect x="0" y="${base}" width="${W}" height="${H - base}" fill="#5c8fb0" fill-opacity=".28"/>`
    + `<line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="#2c5d80" stroke-width="2" stroke-dasharray="6 4"/>`
    + `<text x="${W / 2}" y="${base + 20}" text-anchor="middle" font-size="13" fill="#1c2028">Flood level</text>`
    + house(90, FB.from_ft, `${FB.from_ft} foot`) + house(250, FB.to_ft, `${FB.to_ft} feet`) + `</svg>`;
})();
const FREEBOARD_FIG = `<figure class="g7-fig"><span class="cap">Floor height above the flood level for a new home in a flood zone</span>${freeboardSvg}<figcaption>Left, the old rule of ${FB.from_ft} foot. Right, the ${FB.to_ft} feet in the ordinance the council advanced in 2021. Our drawing.</figcaption></figure>`;

/* ---------- the photo (F016): the county's government complex, for the council section ---------- */
const PHOTO = PH.aerial("horry-county-government-complex-conway", "The Horry County courthouse and county office complex in Conway, the county seat.", { closeUp: true, alt: "The Horry County courthouse and county office complex in Conway, two red brick buildings joined by a white entrance" });
const CREDITS = () => PH.credits().replace(/<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/, "");

/* ---------- the council winners (F016), from data.json ---------- */
const councilList = E.council.filter(([seat]) => seat !== "Chair").map(([seat, name]) => `${seat.replace("District ", "")} ${name}`).join(", ");

/* Road names do not break at the hyphen on a phone (review nit 8): text outside tags only. */
const NOBREAK = (html) => String(html).split(/(<[^>]+>)/).map((t) => (t.startsWith("<") ? t : t.replace(/\b(I-73|I-95|US 501|SC 22)\b/g, '<span class="nw">$1</span>'))).join("");
const SPEC = {
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Horry County Growth, Roads, I-73 and Permits After the Vote",
  description: "Horry County growth after the 2026 election: homes permitted each year, the RIDE IV road tax, I-73, impact fees and flood rules for new homes.",
  ogTitle: "Growth, roads and permits: what the new leaders mean for building in Horry County",
  crumb: "Growth, roads and permits",
  eyebrow: "2026 election",
  h1: "Growth, Roads and Permits: What the New Leaders Mean for Building in Horry County",
  h1em: "",
  sub: `The 2026 election changed no rule for building in Horry County. The road tax, the impact fees and the flood rules are the same as before the vote.`,
  heroCta: { title: "Want to buy a new construction home in Horry County?", label: "Talk to a specialized agent", href: "/contact/" },
  author: "devin+abdulla",
  pageImages: () => PHOTOS.pageImages(PH.rec("horry-county-government-complex-conway")),
  shortAnswer: [
    `Voters approved the road money, the RIDE IV sales tax, in 2024. The county council approved the current impact fee schedule before the election, and no road or growth question was on the Horry ballot.`,
    `Interstate 73 has no start date, because funding for most of its $1.6 billion cost has not been identified. The leaders who won have road plans, and none of those plans is a law yet.`,
  ],
  sections: [
    { h2: "How many new homes is Horry County permitting each year?", toc: "Homes permitted", id: "permits", html: () =>
      CSS + PH.css() +
      h.p(`Horry County's 2025 count was ${n0(SF[2025])} single-family homes permitted, down from ${n0(SF[2024])} in 2024. The 2024 count is the most of any year from 2005 to 2025. Since 2021 the county has permitted between ${n0(R5LO)} and ${n0(R5HI)} a year.`) +
      PERMIT_CHART +
      h.p(`In the last housing slowdown, permits dropped by about four in five from 2006 to 2010, and the county did not pass 6,000 again until ${BACK}.`) +
      h.p(`Almost all of today's building is single-family homes. Units in buildings of five or more, such as apartments and condos, were ${n0(MF[2005])} in 2005 and ${n0(MF[2025])} in the latest year. For the monthly count and the communities being built now, see ${h.a(BUILT, "what is being built on the Grand Strand")}.`) },

    { h2: "What did the 2026 election change for building in Horry County?", toc: "Who won", id: "who-won", html: () =>
      h.p(`Every county council seat on the ballot went to a Republican, ${UNOPP} of the ${E.council.length} without an opponent.`) +
      table("Who won in the unofficial count, and what each office can change for building here",
        ["Office", "Who won", "What it can change"], [
          ["Horry County Council", `Chair Johnny Gardner, re-elected unopposed. District seats, all Republican: ${councilList}. County results are uncertified.`, `Impact fees, zoning and the county's flood building rules. State law ${h.ext(ZONING, "allows counties and cities to zone")}.`],
          ["Governor", `Alan Wilson (R), ${E.governor.pct}%. Jermaine Johnson (D) conceded.`, `Proposes the state's executive budget, where money for I-73 could be asked for.`],
          ["S.C. House, 124 seats", "Republicans 79, Democrats 45, down from 89 Republicans and 35 Democrats. State Senate seats were not on the ballot, except one special race in District 15.", "State law, including the law that allows impact fees."],
          ["U.S. Senate", `Annie Andrews (D), ${E.senate.pct}%. The AP called the race.`, "Federal law and spending, with the House."],
          ["U.S. House, 7th District", `Russell Fry (R), ${E.house7.pct}%, re-elected. The AP called the race.`, "Federal law and spending, for the district that includes Horry County."],
        ]) +
      PHOTO +
      h.p(`CBS News projects that Democrats will control the U.S. Senate in January. Statewide results stay unofficial until the state certifies them. Every race is on ${h.a(P1, "our page on what the 2026 election means for Myrtle Beach buyers and sellers")}.`) },

    { h2: "What is RIDE IV, the Horry County road tax?", toc: "RIDE IV", id: "ride-iv", html: () =>
      h.p(`RIDE IV is a 1% sales tax for road projects in Horry County, approved by voters in November 2024.`) +
      `<div class="g7-stats" role="list" aria-label="RIDE IV in three numbers"><div role="listitem"><b>${R4.yes_pct}%</b>of Horry voters said yes in 2024</div><div role="listitem"><b>${R4.max_years} years</b>or $6.35 billion, whichever comes first</div><div role="listitem"><b>$450 million</b>for I-73, as WIS reported the list</div></div>` +
      h.p(`One item is a local match for I-73: up to half the cost of building it from SC 22 to the Horry County line. That money can be spent only after SCDOT, the state Department of Transportation, has signed contracts to finish I-73 from Horry County to I-95. The ${h.ext(WIS73, "WIS report")} on I-73 gives the $450 million figure.`) },

    { h2: "When will I-73 be built in South Carolina?", toc: "I-73", id: "i-73", html: () =>
      h.p(`No start date has been announced. Work cannot begin until SCDOT identifies where the money comes from. The South Carolina section is estimated at $1.6 billion, and funding for most of that cost has not been identified.`) +
      table("I-73 in South Carolina: what has happened", ["When", "What happened"], [
        ["November 2024", "Horry voters approved RIDE IV. Its I-73 match can be spent only once SCDOT has signed contracts to finish the road to I-95."],
        ["2024 to 2026", "Gov. Henry McMaster left I-73 out of his executive budget in each of the three years."],
        ["February 2026", `SCDOT reported the ${h.ext(ROW, "right of way")} ${I73.row_i95_us501_pct}% bought between I-95 and US 501, and ${I73.row_us501_littlepeedee_pct}% between US 501 and the Little Pee Dee River.`],
        ["August 2026", `President Trump said "they're going to have the funding that's necessary." He named no source for the money.`],
      ]) +
      h.h3("What has to happen before building starts") +
      steps([
        ["The money", "Funding for the rest of the $1.6 billion has to be identified.", true],
        ["The contracts", "SCDOT signs the contracts to finish I-73 to I-95. After that, the RIDE IV match can be spent.", true],
      ], "I-73, what has to happen next") +
      h.p(`Governor-elect Wilson will propose the next executive budgets. Neither leader's plan names a road project.`) },

    { h2: "What do the new leaders say about roads, growth and federal money?", toc: "Leaders' plans", id: "plans", html: () =>
      h.p(`Each plan below is in the leader's own words, from a campaign page or an interview. Each one needs other officials to act before anything changes in Horry County.`) +
      `<div class="g7-grid">` +
      `<div class="g7-card"><h3>Annie Andrews (D), U.S. Senate</h3><dl>`
        + `<dt>Roads</dt><dd>"Fix and modernize South Carolina's roads, bridges, and highways," and "make sure federal dollars actually reach our communities," from her ${h.ext(AND_INF, "infrastructure page")}.</dd>`
        + `<dt>Building</dt><dd>She would "provide tax cuts to homebuilders to incentivize more construction" and end "chaotic and unilateral tariffs." Her ${h.ext(AND_PLAN, "plan")} names home building materials among the goods tariffs make costlier.</dd>`
        + `<dt>Permits</dt><dd>She backs cutting "red tape that makes it harder to build new energy infrastructure."</dd>`
        + `<dt>Growth</dt><dd>A two-year national moratorium on building AI data centers.</dd>`
        + `<dt>Who must act</dt><dd>Both houses of Congress pass a bill, and the president signs it.</dd></dl></div>` +
      `<div class="g7-card"><h3>Alan Wilson (R), governor</h3><dl>`
        + `<dt>Roads</dt><dd>"We need to cut down the time it takes to build a road or a bridge in South Carolina." His ${h.ext(WIL_PRI, "priorities")} say he will "modernize the Department of Transportation" and "streamline project timelines."</dd>`
        + `<dt>Building</dt><dd>"Make it easier for homes to be built, which lowers the cost of those homes." He tied home costs to ${h.ext(WIL_WIS, "waiting on permits")}.</dd>`
        + `<dt>Growth</dt><dd>Independent performance audits of state agencies, overseen by the lieutenant governor-elect, Mike Reichenbach.</dd>`
        + `<dt>Who must act</dt><dd>The governor's office for the audits. A change in state law needs the General Assembly. Home permits are issued by counties and cities.</dd></dl></div>` +
      `</div>` +
      h.p(`Rep. Russell Fry (R) was re-elected in the 7th District, which includes Horry County. Any federal road money for I-73 would need votes in both the House and the Senate.`) },

    { h2: "What are Horry County impact fees on a new home?", toc: "Impact fees", id: "impact-fees", html: () =>
      h.p(`A single-family home of about 1,500 square feet pays $${n0(FEE.total_fee)} in total in Horry County impact fees. The fee depends on the kind of building and its size. The county council approved this schedule unanimously in July 2026, as Ordinance 30-2026. Horry County has charged impact fees since ${FEE.since}.`) +
      `<div class="g7-stats g7-one" role="list" aria-label="Horry County impact fee for a typical home"><div role="listitem"><b>$${n0(FEE.total_fee)}</b>for a single-family home of about 1,500 square feet</div></div>` +
      h.p(`Impact fees are a county power under the state's ${h.ext(DIFA, "Development Impact Fee Act")}. Before charging them on homes, a county must estimate the effect on affordable housing, and the ordinance needs a positive majority of the council. Any change to the fee is a vote of the county council, including the members elected this year.`) +
      h.p(`On a new home, we ask the builder whether the fee is already in the price, so you compare homes on the same terms. Our ${h.a(NEWC, "guide to buying new construction")} covers the rest of the process.`) },

    { h2: "What are the flood building rules for a new home in Horry County?", toc: "Flood rules", id: "flood-rules", html: () =>
      h.p(`In a flood zone, the lowest floor of a new home must be built above the expected flood level. The extra height is called freeboard. In June 2021 the county council advanced an ordinance raising the freeboard for new homes in flood zones from ${FB.from_ft} foot to ${FB.to_ft} feet. Its final vote was scheduled for July 13, 2021.`) +
      FREEBOARD_FIG +
      h.p(`We confirm the current height rule with the county for any lot in a flood zone before you buy, because it changes the cost of the build. What a flood zone means for insurance is on ${h.a(P3, "our page on flood insurance after the election")} and ${h.a(COAST, "our coastal insurance guide")}.`) },

    { h2: "What could happen to new home and land prices in Horry County, short and long term?", toc: "Short and long term", id: "outlook", html: (bg) =>
      h.p(`In the next year or two, we expect the pattern of the last five years to continue unless the national market turns. Over five years or more, Horry prices have fallen about ${DROP}% (2008 to 2012) and risen to about ${TIMES} times the low (2012 to 2026).`) +
      table("What happened in Horry County before",
        ["Period", "What happened", "Source"], [
          ["2006 to 2010", `Single-family permits fell from ${n0(SF[2006])} to ${n0(SF[2010])}, about four in five fewer.`, h.ext(CENSUS, "Census permits")],
          ["2008 to 2012", `Prices fell about ${DROP}%, end of year to end of year.`, h.ext(FHFA, "FHFA index")],
          ["2012 to mid-2026", `Prices rose to about ${TIMES} times the 2012 low.`, h.ext(FHFA, "FHFA index")],
          ["The year after each election, 2016 to 2024", `Prices rose every time, by ${ELO}% to ${EHI}%.`, h.ext(FHFA, "FHFA index")],
          ["2021 to 2025", `Permits stayed between ${n0(R5LO)} and ${n0(R5HI)} a year.`, h.ext(CENSUS, "Census permits")],
        ]) +
      h.h3("The next one to two years") +
      h.p(`Local prices rose in the year after each of the last five elections, whichever party won. The latest yearly change, ${Math.round(chg('2025Q2', '2026Q2') * 10) / 10}%, is inside the index's error of about 2%, so it reads as flat. If the national market holds, we expect permits to stay in the 2021 to 2025 range in the table. If it turns as it did from 2006 to 2010, plan for that slowdown, the first row of the table.`) +
      h.h3("Five years and longer") +
      h.p(`We have no verified past example of what a new interstate did to Horry land prices, so we make no estimate for I-73.`) +
      table("Each leader's plan, under the same test", ["Plan", "Who must act", "Past Horry example"], [
        ["Faster road building (Wilson)", "The governor's office and the General Assembly", "None in our data"],
        ["Faster home permits (Wilson)", "The General Assembly, and county and city councils", "None in our data"],
        ["Homebuilder tax cuts and a tariff change (Andrews)", "Both houses of Congress and the president", "None in our data"],
        ["Less red tape for energy projects (Andrews)", "Both houses of Congress and the president", "None in our data"],
        ["A pause on AI data centers (Andrews)", "Both houses of Congress and the president", "None in our data"],
      ]) +
      h.p(`With no past Horry example for any of these plans, we make no estimate for any of them.`) +
      h.cta("Want to buy a new construction home?", "See new homes across Horry County with an agent who knows the road plans.", "Talk to a specialized agent", "/contact/", bg) },

    { h2: "What does Chapter3 check before you buy land or a new home in Horry County?", toc: "What we check", id: "what-we-check", html: () =>
      h.p(`Our agents check four things for the lot you want, from the county's own records and the road plans:`) +
      steps([
        ["Permits around the lot", "We pull the building permits near it, so you see what is being built around it before you buy."],
        ["The flood height", "We confirm the county's current floor-height rule for the lot's flood zone, and what it means for the build."],
        ["Road plans", "We check the RIDE IV project list and the I-73 route for work near the lot."],
        ["The fees", "We ask the builder whether the impact fee is in the price."],
      ], "What we check for a lot or a new home") +
      `<div class="g7-story"><p>Chapter3's clients from North Carolina bought land in Longs and built a new house there with a builder. They also expanded their cleaning business here.</p></div>` },
  ],
  faqTitle: "Horry County growth and roads questions",
  faq: [
    { q: "When will I-73 be complete in South Carolina?", a: "No date has been announced. SCDOT has not identified the money for most of the estimated 1.6 billion dollar cost, and work cannot begin until it does." },
    { q: "How much are Horry County impact fees?", a: `A single-family home of about 1,500 square feet pays ${n0(FEE.total_fee)} dollars in total under the county's current schedule. A larger home or another type of building pays a different amount.` },
    { q: "Was a road tax on the Horry County ballot in 2026?", a: `No. The 2026 Horry County ballot had no ballot question. Voters approved the RIDE IV sales tax in 2024, with ${R4.yes_pct} percent voting yes.` },
    { q: "Who can change impact fees in Horry County?", a: "The county council, by ordinance with a positive majority, after a report on the effect on affordable housing. The state Development Impact Fee Act allows the fees." },
    { q: "Is Horry County still building as many homes?", a: `Yes. The county's 2025 count was ${n0(SF[2025])} single-family homes, after ${n0(SF[2024])} in 2024, the most of any year from 2005 to 2025.` },
  ],
  sources: [
    { name: "Census permits", href: CENSUS },
    { name: "FHFA index", href: FHFA },
    { name: "SC election results", href: RESULTS },
    { name: "WMBF, Horry results", href: LOCAL },
    { name: "WIS, I-73", href: WIS73 },
    { name: "WMBF, right of way", href: ROW },
    { name: "WMBF, impact fees", href: FEES },
    { name: "WMBF, flood rules", href: FLOOD21 },
    { name: "S.C. Code 6-1-930", href: DIFA },
    { name: "S.C. Code 6-29-720", href: ZONING },
    { name: "Andrews, infrastructure", href: AND_INF },
    { name: "Andrews, plan", href: AND_PLAN },
    { name: "Wilson, WIS interview", href: WIL_WIS },
    { name: "Wilson, WMBF", href: WIL_WMBF },
  ],
  sourcesNote: "Election results are unofficial. RIDE IV terms are from the ballot text. Not legal or investment advice.",
  afterSources: CREDITS,
  bottomCta: { h2: "Buying land or a new home in Horry County?", p: "Tell us where you want to build or buy. An agent helps you choose the lot or the home and buy it.", label: "Talk to a specialized agent", href: "/contact/" },
  keywords: "Horry County growth, Horry County permits by year, RIDE IV, Horry County road tax, when will I-73 be complete, I-73 funding, Horry County impact fees, Horry County flood rules, freeboard, 2026 election Horry County, new construction Myrtle Beach",
  about: "Building, roads and permits in Horry County, South Carolina, after the 2026 election: single-family permits, the RIDE IV sales tax, Interstate 73, impact fees and flood building rules",
};
SPEC.sections = SPEC.sections.map((x) => ({ ...x, html: (bg) => NOBREAK(typeof x.html === "function" ? x.html(bg) : x.html) }));
module.exports = G.page(SPEC);

