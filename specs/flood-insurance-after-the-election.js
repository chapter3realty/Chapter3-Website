/* /buyers/flood-insurance-after-the-election/ - will Annie Andrews' win change flood insurance in Myrtle Beach?
 * The Dec.\u00a011 expiry of the National Flood Insurance Program (before she is sworn in), what a lapse does,
 * the past lapses and the 36 short extensions, Horry County's 20,388 policies, the 18% and 25% yearly
 * limits, what one senator can and cannot do, what Andrews and Wilson said about insurance (same tests for
 * each), private flood insurance, and the short- and long-run range from the past record.
 *
 * Batch 2026-11-e, page 3, Lane N. Version 1, 2026-11-04. Owner's brief: Blog-Brain batches/2026-11-e/BRIEF.md.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at their corrected values
 * (VERIFY.md). Rows used: F001, F003, F004 (percentages), F006, F007, F010, F020, F046, F047, F063, F093,
 * F094, F114, F120 to F130. Predictions: predictions.md section 4, with VERIFY.md's notes 9 and 10.
 * Demand: must-answer.md, page 3. Struck wording: facts/election-2026-struck.json.
 * Data: data/2026-11-e/flood-insurance-after-the-election/nfip.json. Every number on the page is read from
 * it and checked against its row (must()), never typed.
 * Never on the page: a premium amount, a rate or a payment; a single-number forecast; "AP called" for the
 * governor; Tim Scott (no ledger row); the Byrd Rule (not read); a private-market share (no row).
 * Photo: the U.S. Capitol (public domain, Architect of the Capitol), under the vote tiles; its caption says
 * where each chamber meets (Commons image notes). It is also the share image.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/buyers/flood-insurance-after-the-election/";
const SLUG = "flood-insurance-after-the-election";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", SLUG);
const D = JSON.parse(fs.readFileSync(path.join(DATA, "nfip.json"), "utf8"));
const must = (ok, what) => { if (!ok) throw new Error(`flood-insurance-after-the-election: ${what} differs from its ledger row`); };
const n = (v) => Math.round(v).toLocaleString("en-US");
const CONTACT = "/contact/";
const CLOTURE = "https://www.senate.gov/about/powers-procedures/filibusters-cloture.htm";
const ELECTION = "/market-reports/2026-election/";
const COASTAL = "/buyers/coastal-insurance/";

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                             */

must(D.expiry.date === "2026-12-11" && D.expiry.signed === "2026-09-02", "F120");
must(D.newTerm.date === "2027-01-03", "F001 (term ends Jan.\u00a03)");
must(D.lapseEffects.borrowNow === 30.425 && D.lapseEffects.borrowLapse === 1, "F121");
must(D.extensions.count === 36, "F122");
const CO = D.counties, HO = CO.Horry, GE = CO.Georgetown, CH = CO.Charleston;
must(HO.contracts === 20388 && HO.sfha === 5861 && HO.structures === 139337 && HO.rate === 0.1463, "F126");
must(Math.abs(HO.contracts / HO.structures - HO.rate) < 0.0001, "F126 (share recomputed)");
must(GE.contracts === 5655 && GE.rate === 0.2065 && CH.contracts === 46856 && CH.rate === 0.3166, "F127");
must(D.caps.most === 0.18 && D.caps.subsidizedNonPrimary === 0.25, "F128, F129");
must(D.senate.cloture === 60 && D.senate.before.R === 53 && D.senate.before.D === 47, "F114, F020");
must(D.closings2010.perDay === 1400, "F124 (closings)");
const ONE_IN = Math.round(HO.structures / HO.contracts);                       // about 1 in 7
must(ONE_IN === 7, "F126 (1 in 7)");

/* The lapses (F123, F124): length in days, from the dates. */
const MON = ["Jan.", "Feb.", "March", "April", "May", "June", "July", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];
const LAPSES = D.lapses.map((l) => {
  const s = new Date(l.start + "T00:00:00Z");
  const days = l.hours ? l.hours / 24 : (new Date(l.end + "T00:00:00Z") - s) / 864e5;
  const y = s.getUTCFullYear(), m = MON[s.getUTCMonth()];
  const len = l.hours ? `${l.about ? "about " : ""}${l.hours} hours`
    : days >= 40 ? "about 6 weeks" : days >= 28 ? "about a month" : days >= 14 ? "about 2½ weeks" : `${days} day${days === 1 ? "" : "s"}`;
  return { name: `${m} ${s.getUTCDate()}, ${y}`, value: Math.max(days, 0.25), valueText: len, days, y };
});
must(LAPSES.length === 9 && LAPSES.filter((l) => l.y <= 2011).length === 4 && LAPSES.filter((l) => l.y >= 2018).length === 5, "F123, F124 (count)");
const LONGEST = LAPSES.reduce((a, b) => (b.days > a.days ? b : a));
must(LONGEST.name === "Oct. 1, 2025" && LONGEST.days === 42, "F123 (longest: Oct. 1 to Nov. 12, 2025)");
const SHORTEST = LAPSES.reduce((a, b) => (b.days < a.days ? b : a));
must(SHORTEST.valueText === "8 hours", "F123 (shortest: 8 hours)");
const YEARS_OF_EXT = 2026 - 2017;                                               // short extensions since late 2017
must(YEARS_OF_EXT === 9, "F122 (nine years)");

/* The yearly limits (F128, F129): how far a premium can grow, our arithmetic. */
const grow = (r, y) => Math.pow(1 + r, y);
const X = (v) => `+${Math.round((v - 1) * 100)}%`;
const CAP_ROWS = [1, 2, 3, 5].map((y) => [String(y), X(grow(D.caps.most, y)), X(grow(D.caps.subsidizedNonPrimary, y))]);
must(grow(0.18, 5) > 2 && grow(0.18, 5) < 2.5 && Math.round(grow(0.25, 5)) === 3, "the five-year growth sentences");

/* ---------------------------------------------------------------------------- */
/* Page styles. Scoped to .c3-fi.                                                 */

const GL = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 40px -28px rgba(28,32,40,.45);border-radius:20px";
const CSS = "<style>"
  /* What a lapse does: three glass cards with an icon. */
  + ".c3-fi-three{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.8rem;max-width:960px}"
  + "@media (min-width:860px){.c3-fi-three{grid-template-columns:repeat(3,minmax(0,1fr))}}"
  + `.c3-fi-three>li{${GL};margin:0;padding:1rem 1.1rem .95rem}`
  + ".c3-fi-three .hd{display:flex;align-items:center;gap:.65rem;margin:0 0 .5rem;font-family:var(--sans);font-weight:650;font-size:1.08rem;color:var(--navy);line-height:1.3}"
  + ".c3-fi-ic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;color:var(--brass);background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.45)}"
  + ".c3-fi-three p{margin:0;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.6}"
  /* The timeline: a dated list with a line down the left. */
  + `.c3-fi-time{${GL};list-style:none;margin:1.4rem 0 1.6rem;padding:1.1rem 1.15rem .6rem;max-width:760px}`
  + ".c3-fi-time .cap{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;line-height:1.35;margin:0 0 .9rem}"
  + ".c3-fi-time ol{list-style:none;margin:0;padding:0}"
  + ".c3-fi-time li{position:relative;margin:0;padding:0 0 1rem 1.6rem;border-left:2px solid rgba(196,120,58,.45);margin-left:.45rem}"
  + ".c3-fi-time li:last-child{border-left-color:transparent;padding-bottom:.4rem}"
  + ".c3-fi-time li::before{content:'';position:absolute;left:-.5rem;top:.2rem;width:.85rem;height:.85rem;border-radius:50%;background:#fff;border:2px solid var(--brass)}"
  + ".c3-fi-time li.key::before{background:var(--brass)}"
  + ".c3-fi-time b{display:block;font-family:var(--sans);font-weight:700;color:var(--navy);font-size:1rem;line-height:1.3;margin-bottom:.15rem}"
  + ".c3-fi-time span{display:block;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}"
  /* The vote tiles. */
  + ".c3-fi-tiles{list-style:none;margin:1.2rem 0 1.5rem;padding:0;display:grid;gap:.65rem;max-width:760px}"
  + "@media (min-width:760px){.c3-fi-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}}"
  + `.c3-fi-tiles>li{${GL};margin:0;padding:.9rem 1rem}`
  + ".c3-fi-tiles b{display:block;font-family:var(--serif);font-weight:400;font-size:1.9rem;line-height:1.1;color:#8a5226;margin-bottom:.3rem}"
  + ".c3-fi-tiles span{display:block;color:var(--muted);font-size:1rem;line-height:1.5}"
  /* The two winners, side by side, the same questions for each. */
  + ".c3-fi-two{display:grid;gap:.9rem;max-width:960px;margin:1.2rem 0 1.6rem}"
  + "@media (min-width:820px){.c3-fi-two{grid-template-columns:1fr 1fr}}"
  + `.c3-fi-two>section{${GL};padding:1.05rem 1.15rem .6rem}`
  + ".c3-fi-two h3{font-family:var(--sans)!important;font-size:1.15rem!important;font-weight:650;color:var(--navy);margin:0 0 .15rem!important;line-height:1.3}"
  + ".c3-fi-two .who{color:var(--muted);font-size:1rem;margin:0 0 .7rem;line-height:1.4}"
  + ".c3-fi-two dl{margin:0}.c3-fi-two dt{font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1rem;line-height:1.35;margin:.2rem 0 .2rem}"
  + ".c3-fi-two dd{margin:0 0 .75rem;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55;border-bottom:1px solid rgba(28,32,40,.1);padding-bottom:.65rem}"
  + ".c3-fi-two dd:last-child{border-bottom:0}"
  /* The short and long run: one glass card per time span. */
  + ".c3-fi-runs{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.9rem;max-width:960px}"
  + "@media (min-width:860px){.c3-fi-runs{grid-template-columns:repeat(3,minmax(0,1fr))}}"
  + `.c3-fi-runs>li{${GL};margin:0;padding:1rem 1.1rem .7rem}`
  + ".c3-fi-runs .hd{display:flex;align-items:center;gap:.65rem;margin:0 0 .6rem;font-family:var(--sans);font-weight:650;font-size:1.1rem;color:var(--navy);line-height:1.3}"
  + ".c3-fi-runs p{margin:0 0 .6rem;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}"
  + ".c3-fi-runs p b{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:.98rem;margin-bottom:.1rem}"
  + `main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6);display:block;text-align:center!important;border-radius:28px;padding:2.2rem 1.6rem;margin:0 auto!important}`
  + `@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem;border-radius:24px}}`
  + "</style>";

/* The photo (public domain, Architect of the Capitol; record in this page's photos.json). It sits under
   the sentence on who votes, and its caption says where each chamber meets. */
const PHOTOS = JSON.parse(fs.readFileSync(path.join(DATA, "photos.json"), "utf8")).photos;
const ph = PK.create({ h, photos: PHOTOS }).photoSet({ aerialWidth: "760px" });
const PHOTO = ph.aerial("us-capitol-west-front", "The United States Capitol from the west. The Senate meets in the wing on the left, and the House in the wing on the right.");

/* The NASA rainfall map of Florence (public domain; record in photos.json). Under the Horry numbers, it
   shows why flood insurance matters on this coast. Its caption says only what NASA's text says, plus where
   Horry County is. */
const NASA_MAP = ph.aerial("florence-rain-carolinas", "Rain from Hurricane Florence, Sept.\u00a013 to 16, 2018, estimated by NASA satellites. Red marks the most rain. Horry County is the South Carolina coast just south of the state line. The dotted line is the storm's track.");

/* ---------------------------------------------------------------------------- */
/* Blocks                                                                         */

const LAPSE_CARDS = `<ul class="c3-fi-three" role="list" aria-label="What happens during a lapse of federal flood insurance">`
  + `<li><span class="hd"><span class="c3-fi-ic" aria-hidden="true">${icon("home", { size: 22 })}</span>No new policies</span>`
  + `<p>FEMA cannot sell a new federal flood policy until Congress acts.</p></li>`
  + `<li><span class="hd"><span class="c3-fi-ic" aria-hidden="true">${icon("key", { size: 22 })}</span>Current policies stay in force</span>`
  + `<p>A policy you already have covers you to the end of its one-year term.</p></li>`
  + `<li><span class="hd"><span class="c3-fi-ic" aria-hidden="true">${icon("dollar", { size: 22 })}</span>Claims are still paid</span>`
  + `<p>FEMA pays claims from the premiums it collects. Its borrowing limit drops from about $${Math.round(D.lapseEffects.borrowNow)}\u00a0billion to $${D.lapseEffects.borrowLapse}\u00a0billion.</p></li>`
  + `</ul>`;

const TIMELINE = `<figure class="c3-fi-time" role="group" aria-label="Timeline: federal flood insurance expires Dec.\u00a011, before the new Senate term starts Jan.\u00a03">`
  + `<span class="cap">The flood insurance deadline comes before the new senator</span><ol>`
  + `<li><b>Sept.\u00a02</b><span>The stopgap spending law is signed. It keeps federal flood insurance running to Dec.\u00a011.</span></li>`
  + `<li><b>Nov. 3</b><span>Election Day. The Associated Press calls the Senate race for Annie Andrews.</span></li>`
  + `<li class="key"><b>Dec.\u00a011</b><span>Federal flood insurance expires unless Congress extends it. The Congress in office now votes.</span></li>`
  + `<li><b>Jan.\u00a03</b><span>The new Senate term starts. Sen. Darline Graham's term ends.</span></li>`
  + `<li><b>After Jan.\u00a03</b><span>Andrews votes on any later extension or long-term flood bill.</span></li>`
  + `</ol></figure>`;

/* The lapse chart: our own SVG, built from the dates above. A narrow viewBox, so the words stay at
   reading size on a phone; one row a lapse, the date on top and the bar under it. */
const LAPSE_CHART = (() => {
  const W = 340, top = 8, rowH = 54, maxW = 210, maxD = LONGEST.days;
  const FT = 'font-family="Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif"';
  const rows = LAPSES.map((l, i) => {
    const y = top + i * rowH, bw = Math.max(4, Math.round(l.days / maxD * maxW));
    return `<text x="0" y="${y + 15}" ${FT} font-size="17" font-weight="600" fill="#1c2028">${l.name}</text>`
      + `<rect x="0" y="${y + 26}" width="${bw}" height="15" rx="7" fill="${l === LONGEST ? "#a8612c" : "#c4783a"}"/>`
      + `<text x="${bw + 8}" y="${y + 39}" ${FT} font-size="16" fill="#3d4450">${l.valueText}</text>`;
  }).join("");
  const H = top + LAPSES.length * rowH;
  const label = "Bar chart of the nine lapses of federal flood insurance since 2010: " + LAPSES.map((l) => `${l.name}, ${l.valueText}`).join("; ") + ".";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${label}" style="display:block;width:100%;height:auto;max-width:400px">${rows}</svg>`;
  return h.figure(svg, "How long each lapse of federal flood insurance lasted, by the day it started. Chart: Chapter3 Realty, from the Congressional Research Service's record of each lapse.");
})();

const pct = (r) => `${(Math.round(Math.round(r * 10000) / 10) / 10).toFixed(1)}%`;
const COUNTY_CHART = G.bars([
  { name: "Charleston County", value: CH.rate * 100, valueText: pct(CH.rate), feature: `${n(CH.contracts)} policies`, reference: true },
  { name: "Georgetown County", value: GE.rate * 100, valueText: pct(GE.rate), feature: `${n(GE.contracts)} policies`, reference: true },
  { name: "Horry County", value: HO.rate * 100, valueText: pct(HO.rate), feature: `${n(HO.contracts)} policies` },
], {
  caption: "Share of homes with a federal flood policy, three coastal counties",
  note: "Federal flood policies on homes, as a share of all residential buildings in each county. FEMA counts policies, and one policy can cover a whole condo building.",
  nameLabel: "County", featureLabel: "policies", valueLabel: "Share of homes", compact: true, max: 40,
});

const CAP_TABLE = h.table(["Years", "Most homes", "Older discounted second home"], CAP_ROWS);

const VOTE_TILES = `<ul class="c3-fi-tiles" role="list" aria-label="What one senator's vote means">`
  + `<li><b>1 of ${D.senate.seats}</b><span>is Andrews' share of the Senate's votes.</span></li>`
  + `<li><b>${D.senate.cloture} votes</b><span>are needed to ${h.ext(CLOTURE, "end debate")} on a regular bill in the Senate.</span></li>`
  + `<li><b>Banking</b><span>is the Senate committee that gets FEMA's flood insurance cost recommendations.</span></li>`
  + `</ul>`;

const WTOC = "https://www.wtoc.com/2026/10/14/democratic-senate-nominee-holds-insurance-roundtable-beaufort/";
const FOX = "https://www.foxcarolina.com/2026/10/15/republican-nominee-sc-governor-alan-wilson-announces-affordability-agenda/";
const AA_INFRA = "https://drannieandrews.com/issue/transportation-infrastructure-that-works/";
const TWO = `<div class="c3-fi-two">`
  + `<section aria-label="Annie Andrews on insurance"><h3>Annie Andrews</h3><p class="who">Democrat. Won the U.S. Senate race; the Associated Press called it on election night.</p><dl>`
  + `<dt>What she said about insurance</dt><dd>She held a ${h.ext(WTOC, "homeowners insurance roundtable in Beaufort")} with Sen. Sheldon Whitehouse. Her campaign said homeowners insurance in Beaufort and Jasper counties is projected to rise more than 200% in 10 years. The campaign did not say where that projection came from.</dd>`
  + `<dt>A written flood insurance plan?</dt><dd>None that we found. Her ${h.ext(AA_INFRA, "infrastructure page")} backs "resilient infrastructure" and names no flood project.</dd>`
  + `<dt>Can her office change federal flood insurance?</dt><dd>Only with Congress. She has one Senate vote and, once assigned, committee seats.</dd>`
  + `<dt>Does it change the Dec.\u00a011 deadline?</dt><dd>No. She takes office after it.</dd></dl></section>`
  + `<section aria-label="Alan Wilson on insurance"><h3>Alan Wilson</h3><p class="who">Republican. Won the governor's race; Jermaine Johnson conceded on election night.</p><dl>`
  + `<dt>What he said about insurance</dt><dd>His ${h.ext(FOX, "affordability agenda")}, as reported, calls for regular, public audits of rate increases. The state Department of Insurance would use the audit power it already has. The governor would get quarterly updates, and major carriers would publish yearly reports.</dd>`
  + `<dt>A written flood insurance plan?</dt><dd>No flood item is in his agenda as reported. The audit item names rate increases and does not mention flood insurance. His agenda also calls for ${h.a("/invest/rental-property-tax-cut/", "removing the higher property tax on rentals")}.</dd>`
  + `<dt>Can his office change federal flood insurance?</dt><dd>No. Congress writes the law for federal flood insurance.</dd>`
  + `<dt>Does it change the Dec.\u00a011 deadline?</dt><dd>No. A governor has no vote in Congress.</dd></dl></section>`
  + `</div>`;

const RUNS = `<ul class="c3-fi-runs" role="list" aria-label="What the past record points to, in the short and long run">`
  + `<li><span class="hd"><span class="c3-fi-ic" aria-hidden="true">${icon("calendar", { size: 22 })}</span>Short run: the next year or two</span>`
  + `<p><b>What happened before</b>A short extension at most deadlines since late 2017, and ${LAPSES.filter((l) => l.y >= 2018).length === 5 ? "five" : LAPSES.filter((l) => l.y >= 2018).length} short lapses. Every lapse so far ended with an extension.</p>`
  + `<p><b>What it points to here</b>Another short extension near Dec.\u00a011, or a lapse of hours to weeks, as before.</p>`
  + `<p><b>What has to happen first</b>Both chambers of the Congress in office now pass an extension, and the president signs it.</p></li>`
  + `<li><span class="hd"><span class="c3-fi-ic" aria-hidden="true">${icon("dollar", { size: 22 })}</span>Premiums, every year</span>`
  + `<p><b>What the law says now</b>A premium can rise each year up to the limits in the table above.</p>`
  + `<p><b>What it points to here</b>The same limits, with or without a new senator.</p>`
  + `<p><b>What has to happen first</b>Only a new law from Congress changes the limits.</p></li>`
  + `<li><span class="hd"><span class="c3-fi-ic" aria-hidden="true">${icon("storm", { size: 22 })}</span>Long run: five years and more</span>`
  + `<p><b>What happened before</b>${YEARS_OF_EXT === 9 ? "Nine" : YEARS_OF_EXT} years of short extensions, with no long-term renewal.</p>`
  + `<p><b>What it points to here</b>More short extensions, unless a long-term bill passes. We found no study of what the short extensions did to home prices.</p>`
  + `<p><b>What has to happen first</b>A bill through the Senate Banking Committee and ${D.senate.cloture} Senate votes to end debate. Then a House majority and the president's signature.</p></li>`
  + `</ul>`;

const STORY = (bg) => PK.story([
  "<strong>Example:</strong> A buyer is under contract on a house near the Waccamaw River, in a high-risk flood zone. The closing is in mid-December, after the flood insurance deadline.",
  "Her lender requires flood insurance to close. Congress has not voted yet.",
  "A Chapter3 agent asks an insurance agent for a federal quote and a private quote weeks before the deadline. The lender accepts the private policy, and the closing stays on its date.",
], "Asking for both quotes early gives a buyer a second choice if Congress misses the deadline.", bg);

/* ---------------------------------------------------------------------------- */

const CRS = "https://www.congress.gov/crs_external_products/IN/HTML/IN10835.html";
const PL = "https://www.govinfo.gov/content/pkg/PLAW-119publ103/html/PLAW-119publ103.htm";
const USC4015 = "https://www.law.cornell.edu/uscode/text/42/4015";
const USC4014 = "https://www.law.cornell.edu/uscode/text/42/4014";
const FEMA_PEN = "https://www.fema.gov/api/open/v1/NfipResidentialPenetrationRates?$filter=fipsCode%20eq%20'45051'";
const WBTV = "https://www.wbtv.com/2026/11/04/democrat-annie-andrews-wins-us-senate-seat-south-carolina-ap-projects/";
const CNBC = "https://www.cnbc.com/2026/07/13/trump-lindsey-graham-darline-south-carolina-senator.html";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "Myrtle Beach Flood Insurance After the Election | Chapter3",
  description: "Will Annie Andrews' win change flood insurance in Myrtle Beach? The NFIP expires Dec.\u00a011, before she takes office. What a lapse does to a closing.",
  ogTitle: "Will Annie Andrews' win change flood insurance in Myrtle Beach?",
  crumb: "Flood Insurance After the Election",
  eyebrow: "Flood insurance",
  h1: "Will Annie Andrews' win change flood insurance in Myrtle Beach?",
  h1em: "Not before the Dec.\u00a011 deadline.",
  sub: "Federal flood insurance expires Dec.\u00a011, before South Carolina's new senator is sworn in. In a lapse, Grand Strand buyers cannot get a new federal flood policy.",
  heroMedia: "<style>main#main .c3-glance li{line-height:1.4}</style>" + PK.glance([
    { icon: "calendar", label: "Dec.\u00a011", text: "federal flood insurance expires" },
    { icon: "flood", label: n(HO.contracts), text: "federal flood policies on Horry County homes" },
    { icon: "storm", label: String(D.extensions.count), text: "short extensions since 2017" },
  ]),
  heroCta: { title: "Buying in a flood zone? We help get flood insurance quotes.", label: "Talk to a specialized agent", href: CONTACT },
  author: "devin+abdulla",
  toc: true,
  shortAnswer: [
    `No, not by itself, and not before Dec.\u00a011. Federal flood insurance expires that day, and Annie Andrews takes her U.S. Senate seat in January.`,
    `Congress has kept the program running with ${D.extensions.count} short extensions since late 2017, and every lapse so far has ended. Under current law, most flood premiums can rise up to 18% a year, whoever holds the seat. A lasting change needs Congress as a whole, with ${D.senate.cloture} Senate votes to end debate on a regular bill.`,
  ],
  sections: [
    { h2: "What happens to flood insurance in Myrtle Beach on Dec.\u00a011?", toc: "The Dec.\u00a011 deadline", id: "dec-11", html: () =>
      CSS + ph.css() +
      h.p(`Federal flood insurance expires on Dec.\u00a011 unless Congress extends it. FEMA runs it as the National Flood Insurance Program, or NFIP.`) +
      LAPSE_CARDS +
      TIMELINE +
      h.h3("Who votes on the Dec.\u00a011 deadline?") +
      h.p(`The Congress in office now. Sen. Darline Graham, ${h.ext(CNBC, "appointed in July")} after her brother, Sen. Lindsey Graham, died, holds the seat until her term ends on Jan.\u00a03. Russell Fry, who represents Horry County in the U.S. House, won re-election and votes before and after January.`) +
      h.p(`Our guide to ${h.a(ELECTION, "what the election means for Myrtle Beach buyers and sellers")} covers every race and what each office controls.`) },

    { h2: "Has flood insurance lapsed before, and did closings stop?", toc: "Past lapses and closings", id: "past-lapses", html: () =>
      h.p(`Yes. Congress has let federal flood insurance lapse ${LAPSES.length === 9 ? "nine" : LAPSES.length} times since 2010. Each lapse ended when Congress passed an extension.`) +
      LAPSE_CHART +
      h.h3("What did a lapse do to home closings?") +
      h.p(`In the month-long lapse of June 2010, an estimated ${n(D.closings2010.perDay)} home closings a day were canceled or delayed across the country. During the six-week lapse of October and November 2025, some lenders suspended the flood insurance requirement for buyers.`) +
      h.p(`A lapse matters most to a buyer with a loan on a home in a high-risk flood zone. The lender must require flood insurance there before closing. Most buyers meet that rule with a federal policy.`) },

    { h2: "How many Horry County homes have federal flood insurance?", toc: "Horry County's flood policies", id: "horry", html: () =>
      h.p(`About 1 in ${ONE_IN} residential buildings in Horry County has a federal flood policy, ${n(HO.contracts)} policies in all. Of those, ${n(HO.sfha)} are on homes in the high-risk flood zone, where a lender requires one. A home outside that zone can still flood, and our agents check a house's flood zone and ${h.a("/buyers/undisclosed-flooding/", "flood history")} before you offer.`) +
      COUNTY_CHART +
      NASA_MAP },

    { h2: "How much can flood insurance go up each year in Myrtle Beach?", toc: "Yearly increase limits", id: "yearly-limits", html: () =>
      h.p(`Under federal law, most flood premiums can rise no more than 18% a year. A ${h.a("/buyers/second-home/", "second home")} still on an older discounted rate is different. Its premium must rise 25% a year until it reaches the full-risk price.`) +
      CAP_TABLE +
      h.p(`At the lower limit, a premium can grow to more than twice its starting amount in five years. At the higher one, it can reach three times.`) +
      h.p(`These limits stay the same whoever holds the Senate seat. Only a new law from Congress changes them. Our ${h.a(COASTAL, "guide to coastal insurance in Myrtle Beach")} gives what flood, wind and homeowners policies cost here.`) },

    { h2: "What can one U.S. senator change about flood insurance?", toc: "What one senator can do", id: "one-senator", html: () =>
      h.p(`A U.S. senator can vote, sponsor bills and serve on committees. One senator cannot change flood insurance alone.`) +
      VOTE_TILES +
      PHOTO +
      h.p(`Federal flood law sends FEMA's recommendations on flood insurance costs to the ${h.ext(USC4015, "Senate Committee on Banking, Housing, and Urban Affairs")}. Committee seats for the new Congress are not assigned yet, so Andrews' committees are not known.`) +
      h.p(`A long-term flood bill needs those Senate votes, a majority in the House and the president's signature. Her ${h.a("/buyers/first-time-buyer-tax-credit/", "first-time buyer tax credit idea")} needs the same votes, unless it goes in a budget bill, which needs only a simple majority in the Senate.`) +
      h.p(`CBS News projects that Democrats will control the Senate in January. Before the election, Republicans held ${D.senate.before.R} seats to ${D.senate.before.D}.`) },

    { h2: "What have Andrews and Wilson said about insurance?", toc: "What the winners said", id: "what-they-said", html: () =>
      h.p(`Neither winner has a written flood insurance plan that we found. Andrews held a roundtable on homeowners insurance. Wilson's agenda, as reported, calls for state audits of rate increases.`) +
      TWO +
      h.p(`For the rest of each winner's plans, see ${h.a(ELECTION, "what the 2026 election means for Myrtle Beach")}.`) },

    { h2: "Can I use private flood insurance instead of FEMA in Myrtle Beach?", toc: "Private flood insurance", id: "private", html: (bg) =>
      h.p(`Yes. A private flood policy can meet a lender's flood insurance rule when it meets the federal standards for one. Most loans still use a federal policy.`) +
      h.p(`A lapse does not stop the sale of private flood policies. Our agents have a network of insurance agents for federal and private flood quotes.`) +
      h.cta("Closing on a home in a flood zone?", "We help get a federal and a private flood insurance quote on the home, so you can compare them before Dec.\u00a011. There is no cost to you.", "Talk to a specialized agent", CONTACT, bg) },

    { h2: "What will happen to flood insurance on the Grand Strand next?", toc: "Short and long run", id: "next", html: (bg) =>
      h.p(`The past record points to another short extension or a short lapse in the next year or two. Over five years and more, it points to more short extensions.`) +
      RUNS +
      h.h3("What does a lapse look like for one buyer?") +
      STORY(bg) },
  ],
  faqTitle: "Flood insurance and the election: questions",
  faq: [
    { q: "What is the latest NFIP reauthorization update?", a: "Federal flood insurance runs until Dec.\u00a011 under the stopgap spending law signed on Sept.\u00a02. Congress must extend it by then, or FEMA cannot sell new flood policies until it does." },
    { q: "What happens to my flood insurance if the program lapses on Dec.\u00a011?", a: "Your current policy stays in force to the end of its one-year term, and FEMA keeps paying claims. FEMA cannot sell new policies until Congress acts. A buyer who needs a new policy waits or uses private flood insurance." },
    { q: "Will Annie Andrews vote on the Dec.\u00a011 flood insurance deadline?", a: "No. The new Senate term starts Jan.\u00a03, after the deadline. Sen. Darline Graham holds the seat until then. Andrews votes on any extension or flood bill after she takes office." },
    { q: "Can a home closing happen during a flood insurance lapse?", a: "Yes, with a private flood policy the lender accepts. Some lenders also waived the requirement in the lapse that ran from October to November 2025. In the June 2010 lapse, an estimated 1,400 closings a day were canceled or delayed nationwide." },
    { q: "Can the governor of South Carolina change flood insurance?", a: "No. Only Congress can change federal flood insurance. Alan Wilson's insurance item, as reported, is about state audits of rate increases, with yearly public reports from major carriers." },
  ],
  sources: [
    { name: "CRS: NFIP reauthorization", href: CRS },
    { name: "Public Law 119-103", href: PL },
    { name: "42 U.S.C. 4015", href: USC4015 },
    { name: "42 U.S.C. 4014", href: USC4014 },
    { name: "FEMA: Horry County flood policies", href: FEMA_PEN },
    { name: "Senate: cloture", href: CLOTURE },
    { name: "WBTV: AP call", href: WBTV },
    { name: "WTOC: Andrews roundtable", href: WTOC },
    { name: "Fox Carolina: Wilson agenda", href: FOX },
  ],
  sourcesNote: "Lapse lengths and premium growth: Chapter3's arithmetic from these sources. Election results are unofficial until certified.",
  afterSources: () => ph.credits(),
  pageImages: () => ph.pageImages(),
  bottomCta: { h2: "Buying a home in a Grand Strand flood\u00a0zone?", p: "We check the flood zone before you offer. We help get federal and private flood insurance quotes, so you know your choices before a deadline. It is free, with no obligation.", label: "Talk to a specialized agent", href: CONTACT },
  keywords: "flood insurance Myrtle Beach, NFIP reauthorization 2026, NFIP lapse December 11, Annie Andrews flood insurance, NFIP lapse home closing, private flood insurance South Carolina, flood insurance premium increase limit 18 percent, Alan Wilson insurance",
  about: "The National Flood Insurance Program deadline and the 2026 election, for home buyers and owners in Myrtle Beach and Horry County, South Carolina",
});
