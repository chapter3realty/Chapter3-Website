/* /buyers/first-time-buyer-tax-credit/ - the first-time buyer tax credit Annie Andrews backs: her exact
 * words (her plan names no bill), H.R.\u00a03475 as the closest match and its status, the 2008, 2009 and 2010
 * credits and their repayment, the Journal of Finance results, what Myrtle Beach prices did from 2008 to
 * 2012, the D.C. credit, President Biden's unpassed proposal and the Merkley savings match, what it would
 * take to pass a new credit, the short- and long-run range from past examples, and her other housing plans.
 *
 * Batch 2026-11-e (the 2026 election), page 2 of 7. Version 1, 2026-11-04. Lane N.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at the verifier's
 * values (VERIFY.md). Row ids beside each fact below. Struck wording: facts/election-2026-struck.json.
 * Past examples: predictions.md section 1, with VERIFY.md's three changes (no "ZIP code's"; H.R.\u00a03475 is
 * our inference, "most likely"; nothing scaled up to $50,000).
 * Data: data/2026-11-e/first-time-buyer-tax-credit/fhfa-myrtle-beach-2006-2014.json, read from FHFA's
 * hpi_at_metro.csv (CBSA 34820). Its fourth-quarter values are ledger row F199 and are checked here; the
 * other quarters, used only to draw the line, are from the same file (NEEDS.md 1).
 * Photo: the U.S. Capitol, public domain (Architect of the Capitol), photos.json in the same data folder.
 * Authors: Devin Day and Abdulla Hijazi (byline and schema only), reviewed by Tim Nash (owner, 2026-11-04).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, story } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/first-time-buyer-tax-credit/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "first-time-buyer-tax-credit");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const NB = " ";
const CONTACT = "/contact/";

/* The sibling election pages (BRIEF.md). */
const ELECTION = "/market-reports/2026-election/";
const RENTAL_TAX = "/invest/rental-property-tax-cut/";

/* ---------------------------------------------------------------------------- */
/* The FHFA index (F199, F200). Every figure in the copy is computed here.       */

const FH = read("fhfa-myrtle-beach-2006-2014.json").series;
const idx = (y, q) => { const r = FH.find(([a, b]) => a === y && b === q); if (!r) throw new Error(`FHFA ${y} Q${q} missing`); return r[2]; };
/* Ledger row F199: the fourth-quarter values. */
const F199 = { 2008: 211.91, 2009: 191.40, 2010: 181.92, 2011: 164.86, 2012: 156.16, 2013: 158.79 };
for (const [y, v] of Object.entries(F199)) if (idx(+y, 4) !== v) throw new Error(`FHFA ${y} Q4 is ${idx(+y, 4)}, ledger F199 says ${v}`);
const chg = (a, b) => (b / a - 1) * 100;
const fall0812 = Math.round(-chg(F199[2008], F199[2012]));
if (fall0812 !== 26) throw new Error("2008 to 2012 fall is no longer about 26%: " + fall0812);
const lowQ = FH.filter(([y]) => y >= 2007 && y <= 2013).reduce((m, r) => (r[2] < m[2] ? r : m));
if (lowQ[0] !== 2012 || lowQ[1] !== 4) throw new Error("the low is no longer 2012 Q4");
const YEARS = [2009, 2010, 2011, 2012, 2013].map((y) => ({ y, v: F199[y], c: chg(F199[y - 1], F199[y]) }));
const sg = (v) => (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%";
/* The worked example: a $200,000 home at the 2009 pace (arithmetic on F199, not a forecast). */
const HOME = 200000, CREDIT_MAX_2009 = 8000;
const drop09 = HOME * -chg(F199[2008], F199[2009]) / 100;
const drop09r = Math.round(drop09 / 1000) * 1000;
if (drop09r !== 19000) throw new Error("the 2009 drop on $200,000 is no longer about $19,000: " + drop09r);
const breakEven = Math.round(CREDIT_MAX_2009 / (-chg(F199[2008], F199[2009]) / 100) / 1000) * 1000;
if (breakEven !== 83000) throw new Error("break-even price is no longer about $83,000: " + breakEven);
/* F200: the latest reading, 2026 Q2, +0.83% from a year earlier (inside FHFA's error of about 2%). */
const LATEST_YOY = 0.8;

/* ---------------------------------------------------------------------------- */
/* Page styles. Scoped class names start with c3-tc.                              */

const GL = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 40px -28px rgba(28,32,40,.45);border-radius:20px";
const CSS = "<style>"
  /* Her words */
  + `.c3-tc-quote{${GL};margin:1.2rem 0 1.4rem;padding:1.15rem 1.3rem 1rem;max-width:720px;border-left:4px solid var(--brass)}`
  + ".c3-tc-quote p{font-family:var(--serif);font-size:1.2rem;line-height:1.5;color:var(--navy);margin:0 0 .6rem}"
  + ".c3-tc-quote cite{display:block;font-style:normal;font-family:var(--sans);font-size:1rem;color:var(--muted)}"
  /* Glass tables */
  + `.c3-tc-tbl{${GL};width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;font-family:var(--sans);font-size:1rem;color:var(--navy)}`
  + ".c3-tc-tbl caption{caption-side:top;text-align:left;font-weight:600;font-size:1rem;color:var(--navy);padding:.2rem .9rem .6rem;line-height:1.35}"
  + ".c3-tc-tbl th,.c3-tc-tbl td{padding:.65rem .9rem;text-align:left;vertical-align:top;border-bottom:1px solid rgba(28,32,40,.08);line-height:1.45}"
  + ".c3-tc-tbl thead th{font-size:.9rem;color:var(--muted);font-weight:600}"
  + ".c3-tc-tbl tbody th{font-weight:600;width:34%}.c3-tc-tbl td{color:var(--muted)}"
  + ".c3-tc-tbl td.n{color:#8a5226;font-weight:600;white-space:nowrap}"
  + ".c3-tc-tbl tbody tr:last-child th,.c3-tc-tbl tbody tr:last-child td{border-bottom:0}"
  + "@media (max-width:520px){.c3-tc-tbl td.n{white-space:normal}.c3-tc-tbl caption{padding:0 .9rem .6rem}.c3-tc-tbl.stack thead{display:none}.c3-tc-tbl.stack tr{display:block;padding:.4rem 0;border-bottom:1px solid rgba(28,32,40,.08)}.c3-tc-tbl.stack tbody tr:last-child{border-bottom:0}.c3-tc-tbl.stack th,.c3-tc-tbl.stack td{display:block;width:auto;border:0;padding:.3rem .9rem}.c3-tc-tbl.stack td[data-k]::before{content:attr(data-k);display:block;font-size:.85rem;font-weight:600;color:var(--navy);text-transform:uppercase;letter-spacing:.04em}}"
  /* The timeline */
  + `.c3-tc-time{${GL};margin:1.4rem 0 1.6rem;padding:1.2rem 1.2rem .6rem;max-width:760px}`
  + ".c3-tc-time .cap{display:block;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;margin:0 0 1rem}"
  + ".c3-tc-time .ev{position:relative;padding:0 0 1rem 1.9rem}"
  + ".c3-tc-time .ev::before{content:'';position:absolute;left:.42rem;top:.35rem;bottom:-.35rem;width:2px;background:rgba(196,120,58,.45)}"
  + ".c3-tc-time .ev:last-child::before{display:none}"
  + ".c3-tc-time .ev::after{content:'';position:absolute;left:0;top:.2rem;width:.95rem;height:.95rem;border-radius:50%;background:var(--brass);box-shadow:0 0 0 3px #fff}"
  + ".c3-tc-time .ev.end::after{background:var(--navy)}"
  + ".c3-tc-time .when{display:block;font-family:var(--sans);font-weight:700;color:var(--navy);font-size:1rem}"
  + ".c3-tc-time .what{display:block;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5;margin-top:.1rem}"
  /* The study's three results */
  + ".c3-tc-tiles{display:grid;gap:.8rem;margin:1.2rem 0 1.4rem;max-width:760px}"
  + "main#main figure.c3-tc-tiles{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}"
  + "@media (min-width:640px){.c3-tc-tiles{grid-template-columns:repeat(3,1fr)}}"
  + `.c3-tc-tiles>div{${GL};padding:1rem 1.1rem}`
  + ".c3-tc-tiles b{display:block;font-family:var(--serif);font-weight:400;font-size:2.1rem;line-height:1.1;color:#8a5226}"
  + ".c3-tc-tiles span{display:block;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5;margin-top:.25rem}"
  /* Credit cards, one per credit */
  + ".c3-tc-cards{display:grid;gap:.8rem;margin:1.2rem 0 1.6rem;max-width:960px}"
  + "@media (min-width:760px){.c3-tc-cards{grid-template-columns:1fr 1fr}}"
  + `.c3-tc-cards>div{${GL};padding:1rem 1.15rem .8rem}`
  + ".c3-tc-cards .t{display:flex;gap:.7rem;align-items:center;font-family:var(--sans);font-weight:700;color:var(--navy);font-size:1.05rem;line-height:1.3;margin-bottom:.55rem}"
  + ".c3-tc-cards .st{display:inline-block;margin-left:auto;padding:.15rem .6rem;border-radius:999px;font-size:.85rem;font-weight:600;white-space:nowrap}"
  + ".c3-tc-cards .st.law{background:rgba(28,32,40,.08);color:var(--navy)}.c3-tc-cards .st.no{background:rgba(196,120,58,.16);color:#8a5226}"
  + ".c3-tc-cards dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:.3rem .8rem;font-size:var(--read,1.0625rem);line-height:1.45}"
  + ".c3-tc-cards dt{color:var(--navy);font-family:var(--sans);font-weight:600;font-size:.95rem;padding-top:.08rem}"
  + ".c3-tc-cards dd{margin:0;color:var(--muted)}"
  + "@media (max-width:420px){.c3-tc-cards dl{grid-template-columns:1fr;gap:.05rem}.c3-tc-cards dd{margin-bottom:.4rem}}"
  + `.c3-tc-ic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:12px;color:var(--brass);background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.45)}`
  /* Numbered steps */
  /* Her other plans: one card each, an icon and the words */
  + ".c3-tc-plans{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.7rem;max-width:760px}"
  + `.c3-tc-plans>li{${GL};margin:0;padding:1rem 1.1rem;display:flex;gap:.85rem;align-items:flex-start;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}`
  + ".c3-tc-plans strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem;margin-bottom:.15rem}"
  + ".c3-tc-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.7rem;max-width:760px}"
  + `.c3-tc-steps>li{${GL};counter-increment:s;margin:0;padding:.95rem 1.1rem .95rem 4rem;position:relative;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}`
  + ".c3-tc-steps>li::before{content:counter(s);position:absolute;left:1rem;top:.9rem;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--navy);color:#f4efe8;font-family:var(--sans);font-weight:700;display:flex;align-items:center;justify-content:center}"
  + ".c3-tc-steps strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem;margin-bottom:.1rem}"
  /* The price chart, drawn twice (phone and wide), so its text stays 13 to 16 px at every width */
  + `.c3-tc-chart{${GL};margin:1.4rem 0 1.6rem;padding:1.1rem 1rem .9rem;max-width:760px}`
  + ".c3-tc-chart .cap{display:block;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;margin:0 .2rem .7rem}"
  + ".c3-tc-chart svg.n{display:block;width:100%;height:auto;max-width:360px;margin:0 auto}.c3-tc-chart svg.w{display:none;width:100%;height:auto}"
  + "@media (min-width:600px){.c3-tc-chart svg.n{display:none}.c3-tc-chart svg.w{display:block}}"
  + ".c3-tc-chart figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.7rem .2rem 0}"
  + ".c3-tc-key{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;margin:.6rem .2rem 0;font-family:var(--sans);font-size:1rem;color:var(--navy)}"
  + ".c3-tc-key span{display:inline-flex;align-items:center;gap:.45rem}.c3-tc-key i{display:inline-block;width:1.3rem;height:.9rem;border-radius:3px}"
  /* The photo */
  + ".c3ph-hero img{border-radius:16px}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Section 1: her words (F031), as printed on page 13 of her affordability plan. */

const PLAN_PDF = "https://drannieandrews.com/wp-content/uploads/2026/08/Web-file.pdf";
const QUOTE = `<blockquote class="c3-tc-quote"><p>&ldquo;Members of Congress from both parties have proposed a $50,000 tax cut to help first-time homebuyers offset the cost of their down payment. This is a great idea, and I&rsquo;m excited to work with both Republicans and Democrats to get this one done.&rdquo;</p>`
  + `<cite>Annie Andrews, ${h.ext(PLAN_PDF, "her affordability plan")}, page 13</cite></blockquote>`;

/* ---------------------------------------------------------------------------- */
/* Section 2: H.R.\u00a03475 (F102 corrected, F103, F104).                            */

const HR3475 = "https://www.congress.gov/bill/119th-congress/house-bill/3475";
const BILL_TABLE = `<figure style="margin:1.2rem 0 1.4rem;max-width:760px"><table class="c3-tc-tbl stack"><caption>H.R.\u00a03475, the Bipartisan American Homeownership Opportunity Act of 2025</caption><tbody>`
  + `<tr><th scope="row">How much</th><td>A federal tax credit equal to the buyer's down payment, up to $50,000.</td></tr>`
  + `<tr><th scope="row">Who</th><td>First-time home buyers.</td></tr>`
  + `<tr><th scope="row">Income</th><td>The credit starts to shrink above $150,000 of income for a single filer, $225,000 for a head of household and $300,000 for a married couple filing jointly. The limits rise with inflation after 2025.</td></tr>`
  + `<tr><th scope="row">Within five years</th><td>The five years start at the purchase. If in that time the home is sold, rented out or stops being the buyer's main home, the credit is added back to taxable income. Some exceptions apply.</td></tr>`
  + `<tr><th scope="row">Builders</th><td>A builder credit of up to 15% of construction costs, for a home of 1,200 square feet or less. The home must sell at or below 80% of the area's median home price. The credit is 30% when the buyer is a first-time buyer. State housing agencies hand out the builder credits.</td></tr>`
  + `<tr><th scope="row">Where it stands</th><td>Rep. Brian Fitzpatrick, a Pennsylvania Republican, introduced it on May 17, 2025. Its five cosponsors are Democrats. It was sent to the House Ways and Means Committee and has had no vote.</td></tr>`
  + `</tbody></table></figure>`;

/* ---------------------------------------------------------------------------- */
/* Section 3: the 2008 to 2010 credits (F106 to F109).                           */

const IRS_QA = "https://www.irs.gov/newsroom/first-time-homebuyer-credit-questions-and-answers-basic-information";
const IRS_5405 = "https://www.irs.gov/forms-pubs/form-5405-will-no-longer-be-revised";
const EVENTS = [
  ["After April 8, 2008", "The credit opens: 10% of the price, up to $7,500. For 2008 buyers it is an interest-free loan, paid back over 15 years."],
  ["Homes bought in 2009", "Up to $8,000, and the buyer keeps it. It is paid back only if the home stops being the buyer's main home within 36 months."],
  ["From Nov. 7, 2009", "Owners who had lived in the same main home for years can get up to $6,500 on their next home. The income limits rise."],
  ["Before May 1, 2010", "The deadline to sign a contract."],
  /* F201: Public Law 111-198 moved the closing deadline from July 1 to Oct. 1, 2010 (reviewer, round 1). */
  ["Before Oct. 1, 2010", "The deadline to close. Congress moved it from July 1 in July 2010, for buyers already under contract. The credit ends."],
  ["2010 to 2024 tax returns", "2008 buyers pay their credit back, a share on each return, over 15 years. The IRS retired the repayment form after 2024."],
];
const TIMELINE = `<figure class="c3-tc-time" role="img" aria-label="Timeline of the federal first-time buyer credit. After April 8, 2008: the credit opens at 10 percent of the price, up to $7,500, an interest-free loan paid back over 15 years. Homes bought in 2009: up to $8,000, kept unless the home stops being the main home within 36 months. From November 7, 2009: long-time owners can get up to $6,500 and the income limits rise. Contracts had to be signed before May 1, 2010, and closed before October 1, 2010, after Congress moved the closing deadline from July 1 in July 2010. 2008 buyers paid it back on their 2010 to 2024 tax returns.">`
  + `<span class="cap" aria-hidden="true">The federal first-time buyer credit, start to finish</span>`
  + EVENTS.map(([w, t], i) => `<div class="ev${i === EVENTS.length - 1 ? " end" : ""}" aria-hidden="true"><span class="when">${w}</span><span class="what">${t}</span></div>`).join("")
  + `</figure>`;

const INCOME_TABLE = `<figure style="margin:1.2rem 0 1.4rem;max-width:620px"><table class="c3-tc-tbl stack"><caption>Income where the 2008 to 2010 credit shrank to nothing</caption>`
  + `<thead><tr><th scope="col">Home bought</th><th scope="col">Single</th><th scope="col">Married, joint</th></tr></thead><tbody>`
  + `<tr><th scope="row">Through Nov. 6, 2009</th><td class="n" data-k="Single">$75,000 to $95,000</td><td class="n" data-k="Married, joint">$150,000 to $170,000</td></tr>`
  + `<tr><th scope="row">After Nov. 6, 2009</th><td class="n" data-k="Single">$125,000 to $145,000</td><td class="n" data-k="Married, joint">$225,000 to $245,000</td></tr>`
  + `</tbody></table></figure>`;

/* ---------------------------------------------------------------------------- */
/* Section 4: the study (F110).                                                   */

const JOF = "https://econpapers.repec.org/RePEc:bla:jfinan:v:75:y:2020:i:1:p:277-321";
const TILES = `<figure class="c3-tc-tiles" role="list" aria-label="What the 2008 to 2010 credit did across the country">`
  + `<div role="listitem"><b>490,000</b><span>more home sales across the country, a rise of 9.8%.</span></div>`
  + `<div role="listitem"><b>$2,400</b><span>higher median prices (1.1%) in places where first-time buyers were a larger share of the people, for each typical step up in that share.</span></div>`
  + `<div role="listitem"><b>53%</b><span>higher rate of people moving into owning a home.</span></div></figure>`;

/* ---------------------------------------------------------------------------- */
/* Section 5: the Myrtle Beach index, 2007 to 2013 (F199), drawn from the file.  */

const SER = FH.filter(([y]) => y >= 2007 && y <= 2013);
const BASE = F199[2008];
const chartSvg = (W, fs, cls) => {
  const H = Math.round(W * (W < 400 ? 0.82 : 0.56)), x0 = Math.round(fs * 3.4), x1 = W - 12, y0 = fs * 2.4, y1 = H - fs * 2.2, lo = -30, hi = 10;
  const t = (y, q) => y + (q - 0.5) / 4, T0 = 2007, T1 = 2014;
  const X = (v) => x0 + ((v - T0) / (T1 - T0)) * (x1 - x0), Y = (v) => y1 - ((v - lo) / (hi - lo)) * (y1 - y0);
  const P = (v) => chg(BASE, v);
  const pts = SER.map(([y, q, v]) => [X(t(y, q)), Y(P(v))]);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
  /* The credit's window: homes bought after April 8, 2008 (F107), closed before Oct. 1, 2010 (F201). */
  const a = X(2008 + 98 / 366), b = X(2010.75);
  const band = `<rect x="${a.toFixed(1)}" y="${y0 - fs * 1.6}" width="${(b - a).toFixed(1)}" height="${(y1 - y0 + fs * 1.6).toFixed(1)}" fill="#c4783a" fill-opacity=".14"/>`
    + `<text x="${((a + b) / 2).toFixed(1)}" y="${(y0 - fs * 0.45).toFixed(1)}" text-anchor="middle" font-size="${fs}" font-weight="600" fill="#8a5226">Credit open</text>`;
  const grid = [-30, -20, -10, 0, 10].map((g) => `<line x1="${x0}" x2="${x1}" y1="${Y(g).toFixed(1)}" y2="${Y(g).toFixed(1)}" stroke="#1c2028" stroke-opacity="${g === 0 ? ".35" : ".1"}"/><text x="${x0 - 6}" y="${(Y(g) + fs * 0.35).toFixed(1)}" text-anchor="end" font-size="${fs}" fill="#4a4f5c">${g > 0 ? "+" : g < 0 ? "−" : ""}${Math.abs(g)}%</text>`).join("");
  const yrs = W < 400 ? [2007, 2009, 2011, 2013] : [2007, 2008, 2009, 2010, 2011, 2012, 2013];
  const xl = yrs.map((y) => `<text x="${X(y + 0.5).toFixed(1)}" y="${(H - fs * 0.5).toFixed(1)}" text-anchor="middle" font-size="${fs}" fill="#4a4f5c">${y}</text>`).join("");
  const s = [X(t(2008, 4)), Y(0)], l = [X(t(2012, 4)), Y(P(F199[2012]))];
  const halo = 'stroke="#fbf8f3" stroke-width="4" stroke-linejoin="round" paint-order="stroke"';
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Line chart of the Myrtle Beach area house price index from 2007 to 2013, as the change since the end of 2008. Prices were about 8 percent higher in 2007. They fell for most of the time the credit was open, from April 2008 to September 2010, rose a little in late 2010, then fell to a low at the end of 2012, about ${fall0812} percent below the end of 2008. They rose a little in 2013.">`
    + band + grid + xl
    + `<path d="${line}" fill="none" stroke="#1c2028" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`
    + `<circle cx="${s[0].toFixed(1)}" cy="${s[1].toFixed(1)}" r="4.5" fill="#c4783a" stroke="#1c2028" stroke-width="1.5"/><text x="${(s[0] + 8).toFixed(1)}" y="${(s[1] - fs * 0.6).toFixed(1)}" font-size="${fs}" font-weight="600" fill="#1c2028" ${halo}>End of 2008</text>`
    + `<circle cx="${l[0].toFixed(1)}" cy="${l[1].toFixed(1)}" r="4.5" fill="#c4783a" stroke="#1c2028" stroke-width="1.5"/><text x="${(l[0] - 4).toFixed(1)}" y="${(l[1] + fs * 1.5).toFixed(1)}" text-anchor="end" font-size="${fs}" font-weight="600" fill="#1c2028" ${halo}>Low: −${fall0812}%</text>`
    + `</svg>`;
};
const FHFA_PAGE = "https://www.fhfa.gov/data/hpi";
const PRICE_CHART = `<figure class="c3-tc-chart"><span class="cap" aria-hidden="true">Myrtle Beach area home prices, change since the end of 2008</span>`
  /* Reviewer round 1: at 320 px the phone chart's labels showed at about 9 px; a narrower viewBox and a larger
     font step keep them near 13 px there. */
  + chartSvg(300, 17, "n") + chartSvg(700, 15, "w")
  + `<div class="c3-tc-key" aria-hidden="true"><span><i style="background:rgba(196,120,58,.28)"></i>While the federal credit was open</span><span><i style="background:#1c2028;height:.25rem"></i>Price index, by quarter</span></div>`
  + `<figcaption>Prices in the Myrtle Beach-Conway-North Myrtle Beach area fell for most of the time the credit was open, rose a little in late 2010, then kept falling to a low at the end of 2012, about two years after the last closings. Federal Housing Finance Agency all-transactions house price index, by quarter.</figcaption></figure>`;

const YEAR_TABLE = `<figure style="margin:1.2rem 0 1.4rem;max-width:520px"><table class="c3-tc-tbl"><caption>Myrtle Beach area price index at the end of each year</caption>`
  + `<thead><tr><th scope="col">End of</th><th scope="col">Index</th><th scope="col">Change in the year</th></tr></thead><tbody>`
  + `<tr><th scope="row">2008</th><td>${F199[2008].toFixed(2)}</td><td></td></tr>`
  + YEARS.map((r) => `<tr><th scope="row">${r.y}</th><td>${r.v.toFixed(2)}</td><td class="n">${sg(r.c)}</td></tr>`).join("")
  + `</tbody></table></figure>`;

const DROP_BARS = G.bars([
  { name: "The largest 2009 credit", value: CREDIT_MAX_2009, valueText: "$8,000" },
  { name: "Lost by a $200,000 home in 2009", value: drop09, valueText: `about $${(drop09r / 1000).toFixed(0)},000`, reference: true },
], { caption: "The 2009 credit beside one year of falling Myrtle Beach prices", nameLabel: "What", valueLabel: "Dollars", compact: true, max: drop09 * 1.45,
  note: `The loss is the Myrtle Beach area index's 2009 change (${sg(YEARS[0].c)}) applied to a home worth $200,000 at the end of 2008. It is an average pace; each house moved on its own.` });

/* ---------------------------------------------------------------------------- */
/* Section 6: the other credits, one card each (F106 to F112, F102, F104, F105). */

const CARDS = [
  { ic: "calendar", t: "Federal credit, 2008", st: ["Ended", "law"], rows: [["Most", "$7,500, or 10% of the price"], ["Income", "Shrinks from $75,000 single, $150,000 joint"], ["Paid back", "Yes, over 15 years"]] },
  { ic: "calendar", t: "Federal credit, 2009 and 2010", st: ["Ended", "law"], rows: [["Most", "$8,000; $6,500 for long-time owners from Nov. 7, 2009"], ["Income", "Shrinks from $75,000 single, $150,000 joint; from Nov. 7, 2009, $125,000 and $225,000"], ["Paid back", "Only if it stops being the main home within 36 months"]] },
  { ic: "town", t: "Washington, D.C. credit", st: ["Ended", "law"], rows: [["Most", "$5,000"], ["Income", "Shrinks from $70,000, or $110,000 joint"], ["Ended", "For homes bought after 2011"]] },
  { ic: "tax", t: "President Biden's budget for fiscal 2025", st: ["Never law", "no"], rows: [["Most", "$10,000, or 10% of the price, half in the year of purchase and half the next"], ["Income", "Shrinks from $100,000 to $200,000"], ["Cost", "Treasury's estimate: $31.0 billion over 10 years"]] },
  { ic: "dollar", t: "H.R.\u00a03475, the $50,000 credit", st: ["No vote", "no"], rows: [["Most", "The down payment, up to $50,000"], ["Income", "Shrinks from $150,000 single, $225,000 head of household, $300,000 joint"], ["Within five years", "Added back to taxable income if the home is sold, rented or no longer the main home"]] },
  { ic: "key", t: "Merkley savings match", st: ["In committee", "no"], rows: [["Most", "$5 for each $1 saved, up to $50,000; a match, not a tax credit"], ["Income", "No income limit"], ["Rules", "Homes at or below the local median price; a counseling course approved by HUD"]] },
];
const CARDS_HTML = `<div class="c3-tc-cards" role="list" aria-label="First-time buyer credits tried or proposed">`
  + CARDS.map((c) => `<div role="listitem"><span class="t"><span class="c3-tc-ic" aria-hidden="true">${icon(c.ic, { size: 20 })}</span>${c.t}<span class="st ${c.st[1]}">${c.st[0]}</span></span><dl>${c.rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl></div>`).join("")
  + `</div>`;

/* ---------------------------------------------------------------------------- */
/* Section 7: what it takes to pass (F114, F020, F001, F104).                     */

const SENATE_CLOTURE = "https://www.senate.gov/about/powers-procedures/filibusters-cloture.htm";
const STEPS = `<ol class="c3-tc-steps">`
  + `<li><strong>A bill in the new Congress.</strong>H.R.\u00a03475 is in the House Ways and Means Committee, which writes tax law. A committee vote comes first.</li>`
  + `<li><strong>A House vote.</strong>A simple majority of the House passes it.</li>`
  + `<li><strong>A Senate vote.</strong>A regular bill needs 60 senators to end debate before the final vote, under the ${h.ext(SENATE_CLOTURE, "Senate's cloture rule")}. A budget reconciliation bill has a time limit on debate, so a simple majority passes it.</li>`
  + `<li><strong>The president signs it.</strong>The credit then applies on the dates the law names.</li>`
  + `</ol>`;

const CAPITOL = PH.findPhoto(read("photos.json").photos, "us-capitol-west-front");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const CAPITOL_PHOTO = lazy(PH.heroPhoto(CAPITOL, { alt: "The west front of the U.S. Capitol in Washington, with its white dome and lawn", caption: "The U.S. Capitol, where the House and the Senate would each have to pass a new credit.", maxWidth: "760px", sizes: "(max-width: 800px) 100vw, 760px" }));
const CREDITS = PH.creditsList([{ photo: CAPITOL, caption: "The U.S. Capitol" }]);

/* ---------------------------------------------------------------------------- */
/* Section 8: the short and long run, from past examples only (F110, F199, F200). */

const RANGE_TABLE = `<figure style="margin:1.2rem 0 1.4rem;max-width:860px"><table class="c3-tc-tbl stack"><caption>What past credits did, and what the same pattern points to on the Grand Strand</caption>`
  + `<thead><tr><th scope="col">When</th><th scope="col">Where it was tried before</th><th scope="col">If a credit passes here</th></tr></thead><tbody>`
  + `<tr><th scope="row">First 1 to 2 years: sales</th><td data-k="Where it was tried before">Home sales rose by about 490,000 across the country, or 9.8%, and more people became owners.</td><td data-k="If a credit passes here">More first-time buyers shopping for the homes they buy, while the credit is open.</td></tr>`
  + `<tr><th scope="row">First 1 to 2 years: prices</th><td data-k="Where it was tried before">Median prices rose about 1.1% more in places where first-time buyers were a larger share of the people. In the Myrtle Beach area, prices fell 9.7% in 2009 anyway.</td><td data-k="If a credit passes here">From no rise at all, when the wider market is falling, to a small rise in places with many first-time buyers.</td></tr>`
  + `<tr><th scope="row">5 years and more</th><td data-k="Where it was tried before">The added buyers came from several years in the future, and the effect did not reverse at once. Local prices hit their low about two years after the credit ended.</td><td data-k="If a credit passes here">Fewer first-time buyers than usual for some years after it ends, spread out, not all at once. In 2009 the wider market moved local prices more than the credit did.</td></tr>`
  + `<tr><th scope="row">Size</th><td data-k="Where it was tried before">The old credit was at most $8,000.</td><td data-k="If a credit passes here">$50,000 is about six times as large. No study measures a credit that size, so the old results are a direction, not a number.</td></tr>`
  + `</tbody></table></figure>`;

const EXAMPLE = story([
  "<strong>Example:</strong> Maria rents in Conway and wants to buy her first home this spring.",
  "She reads about a large federal buyer credit and thinks about waiting for it.",
  "An agent at Chapter3 shows her that the bill has had no vote in Congress.",
  "Her Chapter3 agent also finds state down payment help that Maria can use now.",
  "Maria starts her home search with the state help.",
  "What this means for you: plan with the help that exists today.",
], "", "ivory");

/* ---------------------------------------------------------------------------- */
/* Section 9: her other housing plans (F032, F033, F034, F100, F101).             */

const ROAD_LAW = "https://www.govinfo.gov/app/details/PLAW-119publ101";
const PLAN_IC = (n) => `<span class="c3-tc-ic" aria-hidden="true">${icon(n, { size: 20 })}</span>`;
const OTHER = `<ul class="c3-tc-plans" role="list">`
  + `<li>${PLAN_IC("key")}<span><strong>A lower cap on large investors.</strong>The ROAD to Housing Act bars an investor that controls 350 or more single-family homes from buying more, starting in January 2027. Her plan: &ldquo;We should cut that threshold down several times to 50 homes.&rdquo;</span></li>`
  + `<li>${PLAN_IC("dollar")}<span><strong>No Fannie Mae or Freddie Mac loans for Wall Street buyers.</strong>Her words: &ldquo;I&rsquo;ll work to ban these Wall Street interests from using Fannie Mae and Freddie Mac mortgages to buy up housing.&rdquo;</span></li>`
  + `<li>${PLAN_IC("home")}<span><strong>More homes built.</strong>Her plan: &ldquo;We should provide tax cuts to homebuilders to incentivize more construction,&rdquo; with more workforce housing and housing near the places where jobs are.</span></li>`
  + `</ul>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "Andrews' First-Time Buyer Tax Credit: Myrtle Beach | Chapter3",
  description: "Annie Andrews backs a $50,000 first-time buyer tax credit. The bill, its status, the 2008 to 2010 credit and its repayment, and what Myrtle Beach prices did.",
  ogTitle: "Annie Andrews Wants a First-Time Buyer Tax Credit. What the Last One Did to Home Prices",
  crumb: "First-Time Buyer Tax Credit",
  eyebrow: "The 2026 election",
  /* Reviewer round 1, item 4: the answer is not causal. mkpage needs a Grand Strand place in the H1 itself,
     so "Myrtle Beach" stays in the first line as well as the answer. */
  h1: "Annie Andrews wants a first-time buyer tax credit. What the last one did to home prices, nationally and in Myrtle Beach:",
  h1em: "a small rise nationally, while Myrtle Beach prices kept falling until 2012.",
  sub: "The $50,000 credit she backs has not passed. The last federal credit, up to $8,000, was open while Myrtle Beach prices fell.",
  heroCta: { title: "Buying your first home? Use the help that exists today", label: "Ask which help fits", href: CONTACT },
  author: "devin+abdulla",
  shortAnswer: [
    "Annie Andrews backs a $50,000 federal tax cut to help first-time buyers pay their down payment. Her plan names no bill. The closest match, H.R.\u00a03475, a credit equal to the down payment up to $50,000, has had no vote.",
    "The last federal credit, up to $8,000, ended in 2010. It lifted sales and prices a little nationally. Myrtle Beach prices fell through it and until late 2012.",
    "If a new credit passes, past examples point to more sales and slightly higher prices at first, then fewer first-time buyers for some years. No study measures a credit of $50,000.",
  ],
  sections: [
    { h2: "Is there a first-time home buyer tax credit in 2026?", toc: "Is there one now", id: "is-there-one", html: () =>
      CSS +
      h.p("No federal one. The last federal first-time buyer credit ended in 2010, and the credits proposed since then have not become law.") +
      h.p("The U.S. Treasury wrote in 2024 that &ldquo;there is currently no tax credit to support home purchases by first-time homebuyers.&rdquo; State help is different. South Carolina's housing agency, SC Housing, offers down payment help that buyers here can use now. Our " + h.a("/buyers/programs/", "guide to SC Housing's down payment help") + " explains who qualifies. Our agents check which program fits a buyer before the offer goes in.") +
      h.h3("What exactly did Annie Andrews say?") +
      h.p("Andrews, whom the AP called the winner of South Carolina's U.S. Senate race on election night, wrote this in her affordability plan:") +
      QUOTE +
      h.p("Her plan names no bill. The bill that best matches her words is most likely H.R.\u00a03475, which a Republican introduced and five Democrats cosponsored. That match is our reading of her plan; her campaign did not name the bill.") },

    { h2: "What is the $50,000 tax credit in H.R.\u00a03475?", toc: "The proposed credit", id: "the-50000-credit", html: () =>
      h.p(`H.R.\u00a03475 is a House bill for a federal tax credit equal to a first-time buyer's down payment, up to $50,000. Its full terms, from the ${h.ext(HR3475, "bill's summary on congress.gov")}, are below.`) +
      BILL_TABLE +
      h.p("The credit is a federal income tax credit, so it would apply the same way in Myrtle Beach as in any other state.") +
      h.h3("Is it the same as the Merkley $50,000 plan?") +
      h.p("No. Sen. Jeff Merkley's Homeownership Promise Act is a savings match, not a tax credit. The federal government would add five dollars for each dollar a buyer saves, up to the same $50,000 total. It is in the Senate Banking Committee.") },

    { h2: "How did the 2008, 2009 and 2010 first-time buyer credits work?", toc: "The last federal credit", id: "how-the-last-one-worked", html: () =>
      h.p(`The federal credit was 10% of the home's price, with a cap that changed with the year. A first-time buyer was anyone who had not owned a main home in the three years before. The ${h.ext(IRS_QA, "IRS questions and answers")} list the basic rules.`) +
      TIMELINE +
      INCOME_TABLE +
      h.h3("Did buyers have to pay the first-time buyer credit back?") +
      h.p("Buyers from 2008 did. Their credit was an interest-free loan, paid back in small shares over fifteen years of tax returns. The " + h.ext(IRS_5405, "IRS retired the repayment form") + " after the last of those returns, for 2024.") +
      h.p("Buyers from 2009 and 2010 kept the credit, unless the home stopped being their main home within three years.") },

    { h2: "Did the last first-time buyer credit raise home prices?", toc: "Did it raise prices", id: "did-it-raise-prices", html: () =>
      h.p(`Yes, a little, and it moved sales earlier. A peer-reviewed ${h.ext(JOF, "study in the Journal of Finance")} measured the last credit across the whole country.`) +
      TILES +
      h.p("The added buyers came &ldquo;from several years in the future&rdquo;: many would have bought later and bought sooner instead. They were about three years younger than typical first-time buyers.") +
      h.p("The authors conclude that steadying a falling market likely did more good than the added sales themselves. We found no other peer-reviewed measure of the credit's effect on prices to set beside theirs.") },

    { h2: "What did Myrtle Beach home prices do from 2008 to 2012?", toc: "Myrtle Beach prices then", id: "myrtle-beach-prices", html: () =>
      h.p(`Myrtle Beach area home prices fell every year. The federal price index for the Myrtle Beach-Conway-North Myrtle Beach area dropped about ${fall0812}% from the end of 2008 to the end of 2012, its low.`) +
      PRICE_CHART +
      YEAR_TABLE +
      h.h3("What did the $8,000 credit mean next to that fall?") +
      h.p("Less than one year of falling prices. At the index's 2009 pace, a home worth $200,000 at the end of 2008 lost about $19,000 of value in a year, more than twice the credit.") +
      DROP_BARS +
      h.p("The credit did not stop the local fall. The study covers the whole country, so it does not measure how much deeper the fall here would have been without the credit. Prices here turned up only after 2012, and nothing ties that turn to the credit.") +
      h.p(`Our ${h.a("/sell/home-value/", "home value guide")} shows what homes sell for here now.`) },

    { h2: "What other first-time buyer credits have been tried?", toc: "Other credits", id: "other-credits", html: () =>
      h.p("Washington, D.C. had its own federal credit. President Biden proposed a credit that never passed, and Sen. Jeff Merkley proposed a savings match that is in committee. Here they are beside the federal credits.") +
      CARDS_HTML +
      h.p("President Biden's credit was a budget proposal that no law enacted. Treasury's cost estimate shows the scale of a $10,000 credit, not what it would do to prices.") },

    { h2: "What would it take for Congress to pass a new first-time buyer credit?", toc: "What it takes to pass", id: "what-it-takes", html: () =>
      h.p("Both the House and the Senate would have to pass the same bill, and the president would have to sign it. The four steps are below.") +
      STEPS +
      h.p("CBS News projects that Democrats will control the Senate in the new Congress, with fewer than 60 seats. A regular bill would then need senators from both parties.") +
      h.p("H.R.\u00a03475 already has both parties on it: a Republican sponsor and Democratic cosponsors. Andrews joins the Senate in January.") +
      CAPITOL_PHOTO },

    { h2: "What could a new credit mean for Grand Strand buyers and sellers?", toc: "Short and long run", id: "short-and-long-run", html: (bg) =>
      h.p("Past examples give a direction, not a number. Where a credit was tried before, sales rose while it was open, and part of that rise came from buyers who would have bought years later. If one passes here, the same pattern points the same way.") +
      RANGE_TABLE +
      h.p(`The Myrtle Beach index is up ${LATEST_YOY}% from a year earlier in its latest quarter, about flat.`) +
      h.h3("If you are buying your first home") +
      h.p("A bill can change before it passes, so its amount, income limits and start date are not final. The down payment help from SC Housing is open now.") +
      EXAMPLE +
      h.h3("If you are selling a home first-time buyers buy") +
      h.p("A credit would bring more first-time buyers while it lasts. The last one shows its limit: it did not keep local prices from falling.") +
      h.cta("Buying your first home before any credit passes?", "Tell us your price range and the towns you like. We send the homes for sale there and tell you which SC Housing program fits.", "Ask which help fits", CONTACT, bg) },

    { h2: "What else does Annie Andrews plan for housing?", toc: "Her other housing plans", id: "other-housing-plans", html: () =>
      h.p("Three more plans in her affordability plan touch housing: a lower cap on large investors, limits on Wall Street buyers, and tax cuts for homebuilders.") +
      OTHER +
      h.p(`The ${h.ext(ROAD_LAW, "ROAD to Housing Act")} became law in July without the president's signature. Its investor ban ends 15 years after it starts. Our ${h.a(ELECTION, "guide to what the election means for Myrtle Beach buyers and sellers")} covers both winners' full plans.`) +
      h.p(`State property taxes on rentals are changed by the legislature in Columbia, not by Congress. Our page on ${h.a(RENTAL_TAX, "Alan Wilson's plan to cut the tax on rentals")} covers that. For the rest of a first purchase here, our ${h.a("/buyers/first-time-home-buyer-myrtle-beach/", "first-time home buyer guide")} goes step by step.`) },
  ],
  faqTitle: "First-time buyer tax credit questions",
  faq: [
    { q: "Is there a first-time home buyer tax credit in 2026?", a: "No federal one. The last federal credit ended in 2010. The $50,000 credit Annie Andrews backs is most likely H.R.\u00a03475, a bill that has had no vote. South Carolina buyers can still use down payment help from SC Housing, the state housing agency." },
    { q: "Do you have to pay back the first-time homebuyer tax credit?", a: "Only buyers from 2008 had to, in small shares over fifteen years of tax returns, ending with the 2024 return. Later buyers owed it back only if they sold the home or stopped living in it within three years." },
    { q: "When was the first-time homebuyer tax credit?", a: "The federal credit covered homes bought from April 2008 to September 2010. The last buyers had to sign a contract by the end of April 2010 and close by the end of September. Washington, D.C. had a separate credit that ended for homes bought after 2011." },
    { q: "Is the Merkley $50,000 plan the same as H.R.\u00a03475?", a: "No. H.R.\u00a03475 is a tax credit equal to the down payment, up to $50,000. Sen. Jeff Merkley's plan is a savings match, not a tax credit. The government adds five dollars for each dollar a buyer saves, up to the same total. It is for homes at or below the local median price." },
    { q: "Did the first-time buyer credit stop Myrtle Beach prices from falling?", a: "No. The Myrtle Beach area price index fell about 26% from the end of 2008 to the end of 2012, through the credit and after it ended." },
  ],
  sources: [
    { name: "Andrews' plan", href: PLAN_PDF },
    { name: "H.R.\u00a03475", href: HR3475 },
    { name: "IRS credit rules", href: IRS_QA },
    { name: "IRS Form 5405", href: IRS_5405 },
    { name: "Journal of Finance", href: JOF },
    { name: "FHFA price index", href: FHFA_PAGE },
    { name: "Treasury FY2025", href: "https://home.treasury.gov/system/files/131/General-Explanations-FY2025.pdf" },
    { name: "IRS Form 8859", href: "https://www.irs.gov/pub/irs-prior/f8859--2012.pdf" },
    { name: "Public Law 119-101", href: ROAD_LAW },
    { name: "Senate cloture", href: SENATE_CLOTURE },
  ],
  sourcesNote: "Election results are unofficial until the state certifies them. Educational only, not tax advice.",
  afterSources: () => CREDITS + PH.imageSchema([CAPITOL]),
  pageImages: () => PH.pageImages(CAPITOL),
  bottomCta: { h2: "Plan your first home with the help that exists today", p: "Tell us your price range and the towns you like. We send the homes for sale there and tell you which SC Housing program fits.", label: "Ask which help fits", href: CONTACT },
  keywords: "first time home buyer tax credit 2026, Annie Andrews first-time buyer tax credit, $50,000 first time home buyer tax credit, H.R.\u00a03475, first time home buyer tax credit repayment, when was the first time homebuyer tax credit, 2008 first time homebuyer credit, Myrtle Beach home prices 2008 to 2012",
  about: "The first-time home buyer tax credit Annie Andrews backs, and the 2008 to 2010 federal credit's effect on Myrtle Beach home prices",
});
