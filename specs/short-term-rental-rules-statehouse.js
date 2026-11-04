/* /invest/short-term-rental-rules-statehouse/ - who decides short-term rental rules on the Grand Strand,
 * what the 2026 election changed, and what a state law taking that power from cities would do.
 *
 * Batch 2026-11-e, page 6 (Blog-Brain batches/2026-11-e/BRIEF.md). Co-authored (author "devin+abdulla");
 * names in the byline and schema only.
 * Facts: Blog-Brain batches/2026-11-e/facts.md, VERIFIED and CORRECTED rows only, at the verifier's
 * wording (VERIFY.md): F011-F017, F087-F089, F170-F180. The quorum, three-reading, tie and veto rules
 * are NEW-1 and NEW-2 in batches/2026-11-e/short-term-rental-rules-statehouse/NEW-ROWS.md, read by the
 * writer from the SC Constitution and House Rules; they need the independent check (NEEDS.md).
 * Not on the page, by the ledger: Horry County's unincorporated rules and Surfside Beach's zones (both
 * "Not verified"), and any price study of Arizona or Florida (none verified).
 * The seat chart and every vote count come from data/2026-11-e/short-term-rental-rules-statehouse/votes.json.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const DATA = path.join(__dirname, "..", "data", "2026-11-e", "short-term-rental-rules-statehouse");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const V = read("votes.json");
const PH = PK.create({ h, photos: read("photos.json").photos }).photoSet({ aerialWidth: "760px" });

/* ---------------------------------------------------------------------------- */
/* The vote math, from the seat counts (F011, F012, F014, F083).                  */
const must = (ok, what) => { if (!ok) throw new Error(`short-term-rental-rules-statehouse.js: ${what}`); };
const HS = V.house.seats, SS = V.senate.seats;
const MAJ = Math.floor(HS / 2) + 1;            // 63: more yes than no if all 124 vote (a tie fails)
const TWO3 = Math.ceil(HS * 2 / 3);            // 83
const STWO3 = Math.ceil(SS * 2 / 3);           // 31
const B = V.house.before, A = V.house.after;
must(B.R + B.D === HS && A.R + A.D === HS, "seat totals are 124");
must(MAJ === 63 && TWO3 === 83 && STWO3 === 31, "63, 83 and 31");
must(B.R >= TWO3 && A.R < TWO3 && A.R >= MAJ && V.senate.R >= STWO3, "the change at 83");
const HORRY = V.horry_house.districts;
const HR = HORRY.filter((d) => d.party === "R").length, HD = HORRY.filter((d) => d.party === "D").length;
must(HORRY.length === 11 && HR === 8 && HD === 3, "Horry: 11 districts, 8 R, 3 D");
const BAILEY = HORRY.find((d) => d.h3861_sponsor);
must(BAILEY && BAILEY.d === 104 && BAILEY.pct === 66.88, "Bailey, District 104");
/* The two recounts (F014): District 27 (R leads) and District 89 (D leads). If either result flips, the
   Republican count moves by one seat, so it ends between 78 and 80. */
const LOW = A.R - 1, HIGH = A.R + 1;
must(LOW === 78 && HIGH === 80 && LOW >= MAJ && HIGH < TWO3, "78 to 80 stays between 63 and 83");

const SELF = "/invest/short-term-rental-rules-statehouse/";
const H3861 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/3861.htm";
const MB = "https://cityofmyrtlebeach.com/news_detail_T6_R1468.php";
const NMB = "https://nmb.us/833/Short-term-Rentals";
const ZONING = "https://www.scstatehouse.gov/code/t06c029.php";
const ATAX = "https://www.scstatehouse.gov/code/t12c036.php";
const LTAX = "https://www.scstatehouse.gov/code/t06c001.php";
const ART3 = "https://www.scstatehouse.gov/scconstitution/A03.pdf";
const ART4 = "https://www.scstatehouse.gov/scconstitution/A04.pdf";
const HRULES = "https://www.scstatehouse.gov/man26/35_Rules-House.pdf";
const RESULTS = "https://scvotes.gov/2026-general-election-results/";
const AZ16 = "https://www.azleg.gov/legtext/52leg/2R/laws/0208.htm";
const AZNOW = "https://www.azleg.gov/ars/9/00500-39.htm";
const FL = "http://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0500-0599/0509/Sections/0509.032.html";
const FLVETO = "https://flgov.com/eog/news/press/2024/governor-ron-desantis-vetoes-one-bill-0";
const LA = "https://ideas.repec.org/a/eee/juecon/v124y2021ics0094119021000383.html";
const OVERLAY = "https://www.wmbfnews.com/2024/12/10/myrtle-beach-city-leaders-move-forward-with-short-term-rental-overlay-with-modifications";

/* ---------------------------------------------------------------------------- */
/* The page's own blocks (glass look, tokens from tools/glass.js).               */
const CSS = `<style>
main#main h1,main#main h2,main#main h3{text-wrap:balance}
main#main .c3s-whowrap{margin:1.2rem 0 1.4rem;max-width:860px;padding:.6rem 1rem;border-radius:18px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.08)}main#main .c3s-who{width:100%;border-collapse:collapse;font-size:var(--read,1.0625rem);line-height:1.5}main#main .c3s-who caption{text-align:left;font-family:var(--sans);font-weight:650;color:var(--navy);padding:.5rem 0 .6rem}main#main .c3s-who thead th{font-family:var(--sans);font-size:.85rem;letter-spacing:.04em;text-transform:uppercase;color:var(--navy);text-align:left;padding:.5rem .7rem;border-bottom:2px solid var(--navy)}main#main .c3s-who tbody th{text-align:left;color:var(--navy);font-weight:600;padding:.65rem .7rem;border-bottom:1px solid rgba(28,32,40,.1);vertical-align:top}main#main .c3s-who td{color:var(--muted);padding:.65rem .7rem;border-bottom:1px solid rgba(28,32,40,.1);vertical-align:top}@media (max-width:699px){main#main .c3s-who thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}main#main .c3s-who,main#main .c3s-who caption,main#main .c3s-who tbody,main#main .c3s-who tr,main#main .c3s-who th,main#main .c3s-who td{display:block;width:auto}main#main .c3s-who tr{padding:.7rem 0;border-bottom:1px solid rgba(28,32,40,.12)}main#main .c3s-who tr:last-child{border-bottom:0}main#main .c3s-who tbody th,main#main .c3s-who td{padding:.1rem 0;border:0}main#main .c3s-who td::before{content:attr(data-label) ": ";color:var(--navy);font-weight:600}}
main#main .c3s-seats{margin:1.6rem 0;max-width:760px;padding:1.1rem 1.2rem 1rem;border-radius:18px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.08)}
main#main .c3s-seats .cap{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);margin-bottom:.9rem;line-height:1.35}
main#main .c3s-row{margin:0 0 1.1rem}
main#main .c3s-row .lbl{display:flex;flex-wrap:wrap;justify-content:space-between;gap:.2rem 1rem;color:var(--navy);line-height:1.35;margin-bottom:.35rem}
main#main .c3s-row .lbl span{color:var(--muted)}
main#main .c3s-track{position:relative;height:2.1rem;border-radius:10px;overflow:visible;display:flex}
main#main .c3s-track .r{background:#2a3040;border-radius:10px 0 0 10px}
main#main .c3s-track .d{background:#d4b48f;border-radius:0 10px 10px 0}
main#main .c3s-mark{position:absolute;top:-.35rem;bottom:-.35rem;width:3px;margin-left:-1.5px;background:#c4783a}
main#main .c3s-ticks{position:relative;height:1.6rem;margin-bottom:.2rem}
main#main .c3s-ticks span{position:absolute;transform:translateX(-50%);font:650 1rem/1.6rem var(--sans);color:#8a5226;white-space:nowrap}
main#main .c3s-key{list-style:none;margin:.4rem 0 0;padding:0;color:var(--muted);line-height:1.55;font-size:var(--read,1.0625rem)}
main#main .c3s-key li{margin:.2rem 0;padding-left:1.4rem;position:relative}
main#main .c3s-key li::before{content:"";position:absolute;left:0;top:.45rem;width:.85rem;height:.85rem;border-radius:3px;background:var(--c)}
main#main .c3s-time{list-style:none;margin:1.2rem 0 1.6rem;padding:0;max-width:760px;position:relative}
main#main .c3s-time::before{content:"";position:absolute;left:2.05rem;top:.4rem;bottom:.4rem;width:2px;background:rgba(196,120,58,.35)}
main#main .c3s-time li{position:relative;margin:0 0 .8rem;padding:.7rem 1rem .75rem 5rem;border-radius:16px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.06);color:var(--muted);line-height:1.55;font-size:var(--read,1.0625rem)}
main#main .c3s-time b.y{position:absolute;left:.6rem;top:.7rem;width:3rem;padding:.15rem 0;border-radius:999px;background:#8a5226;color:#fff;font:650 .95rem/1.4 var(--sans);text-align:center}
main#main .c3s-time strong{display:block;color:var(--navy);font-family:var(--sans);font-weight:650;margin-bottom:.1rem}
main#main .c3s-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem;max-width:760px;margin:1rem 0 1.2rem}
@media (min-width:700px){main#main .c3s-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
main#main .c3s-stats div{padding:.8rem .6rem;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);text-align:center;color:var(--muted);font-size:1rem;line-height:1.35}
main#main .c3s-stats b{display:block;font-family:var(--serif);font-weight:600;font-size:1.5rem;line-height:1.15;color:var(--navy);margin-bottom:.2rem}
main#main .c3s-cards{display:grid;gap:.8rem;margin:1.2rem 0 1.4rem;max-width:960px}
@media (min-width:900px){main#main .c3s-cards{grid-template-columns:repeat(3,minmax(0,1fr))}}
main#main .c3s-card{padding:1rem 1.1rem 1.05rem;border-radius:16px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.08);color:var(--muted);line-height:1.6;font-size:var(--read,1.0625rem)}
main#main .c3s-card h3{font-family:var(--sans)!important;font-size:1.1rem!important;font-weight:650;color:var(--navy);margin:0 0 .5rem!important;line-height:1.35}
main#main .c3s-card p{margin:0 0 .6rem}main#main .c3s-card p:last-child{margin:0}
main#main .c3s-card b{color:var(--navy);font-weight:650}
main#main .c3s-callout{border-left:3px solid var(--brass);padding:1rem 1.2rem;margin:1.4rem 0;max-width:720px;border-radius:0 16px 16px 0;background:rgba(255,255,255,.55);color:var(--muted);line-height:1.7;font-size:var(--read,1.0625rem)}
main#main .c3s-callout p{margin:0 0 .6rem}main#main .c3s-callout p:last-child{margin:0}
@media (max-width:479px){.c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.4rem!important}.c3-glance li{min-width:0;padding:.45rem .35rem!important}.c3-glance span.t{overflow-wrap:break-word}}
.c3-glance li{min-width:0}
@media (min-width:700px){.c3-glance{max-width:none!important}.detail-hero .detail-media:has(.c3-glance){max-width:none!important}}
.c3-glance li,.c3-glance span.t,.c3-glance strong{line-height:1.4!important}
@media (max-width:379px){.hx-fb-ai,.hx-fb-ai .hx-ai-badge,.hx-fb-ai .hx-fb-q{max-width:100%!important;min-width:0!important;box-sizing:border-box}.hx-fb-ai .hx-fb-q textarea{flex:1 1 0!important;width:auto!important;min-width:0!important}}
@media (min-width:1000px) and (max-width:1100px){.header-inner>.primary{gap:2.2rem!important}.header-inner{gap:1.6rem!important}}
@media (min-width:760px){main#main nav[aria-label="On this page"]{max-width:960px!important}main#main nav[aria-label="On this page"] ul{columns:2;column-gap:2.4rem}main#main nav[aria-label="On this page"] li{break-inside:avoid}}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{background:#2a3040!important;display:block!important;text-align:center!important;padding:2.2rem 1.6rem!important;margin-left:max(24px,calc((100% - 1132px) / 2))!important;margin-right:0!important;width:min(760px,calc(100% - 48px));max-width:none!important;box-sizing:border-box}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap>p{color:rgba(244,239,232,.82)!important}
main#main .c3ph-cr{background:rgba(28,32,40,.85)!important;font-size:.8rem!important;line-height:1.3!important;padding:.3rem .65rem!important;border-radius:10px 0 0 0;letter-spacing:0!important}
@media (prefers-reduced-transparency:reduce){main#main .c3s-seats,main#main .c3s-time li,main#main .c3s-stats div,main#main .c3s-card,main#main .c3s-callout{background:#fbf8f3}}
</style>`;

/* The seat chart: the House before and after the election, with marks at 63 and 83 (votes.json). */
const pos = (n) => `${Math.round(n / HS * 10000) / 100}%`;
const seatRow = (label, r, d) => `<div class="c3s-row"><div class="lbl"><b>${label}</b><span>${r} Republicans, ${d} Democrats</span></div>`
  + `<div class="c3s-track" aria-hidden="true"><span class="r" style="width:${pos(r)}"></span><span class="d" style="width:${pos(d)}"></span>`
  + `<span class="c3s-mark" style="left:${pos(MAJ)}"></span><span class="c3s-mark" style="left:${pos(TWO3)}"></span></div></div>`;
const SEATS = `<figure class="c3s-seats"><div role="img" aria-label="South Carolina House seats by party. Before the election: ${B.R} Republicans and ${B.D} Democrats. After, in the unofficial count: ${A.R} Republicans and ${A.D} Democrats. A bill needs ${MAJ} votes and a veto override ${TWO3} if all ${HS} members vote.">`
  + `<span class="cap">South Carolina House, ${HS} seats</span>`
  + `<div class="c3s-ticks" aria-hidden="true"><span style="left:${pos(MAJ)}">${MAJ}</span><span style="left:${pos(TWO3)}">${TWO3}</span></div>`
  + seatRow("Before the election", B.R, B.D) + seatRow("After, unofficial count", A.R, A.D)
  + `</div><ul class="c3s-key"><li style="--c:#2a3040">Republican seats</li><li style="--c:#d4b48f">Democratic seats</li>`
  + `<li style="--c:#c4783a">${MAJ}: the yes votes a bill needs if all ${HS} members vote. ${TWO3}: the votes to override a veto.</li></ul></figure>`;

/* The "who decides" table: a table on a wide screen, one card a rule on a phone (critic, 390 px: the third
   column was 40 px wide). */
const WHO_HEAD = ["Rule", "Who decides", "What it says now"];
const whoTable = (rows) => `<div class="c3s-whowrap"><table class="c3s-who"><caption>Who decides each short-term rental rule</caption><thead><tr>${WHO_HEAD.map((c) => `<th scope="col">${c}</th>`).join("")}</tr></thead><tbody>${rows.map(([a, b, c]) => `<tr><th scope="row">${a}</th><td data-label="${WHO_HEAD[1]}">${b}</td><td data-label="${WHO_HEAD[2]}">${c}</td></tr>`).join("")}</tbody></table></div>`;
const timeline = (items) => `<ol class="c3s-time" aria-label="What other states did, and what South Carolina did">${items.map(([y, t, d]) => `<li><b class="y">${y}</b><strong>${t}</strong>${d}</li>`).join("")}</ol>`;
const cards = (items) => `<div class="c3s-cards">${items.map(([t, body]) => `<div class="c3s-card"><h3>${t}</h3>${body}</div>`).join("")}</div>`;

const PHOTO = PH.aerial("myrtle-beach-oceanfront-towers", "Hotel and condo towers on the oceanfront in Myrtle Beach.", { closeUp: true });

/* ---------------------------------------------------------------------------- */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Grand Strand Short-Term Rental Rules After the 2026 Election",
  description: "Myrtle Beach and North Myrtle Beach decide where short-term rentals go. What a state law like H. 3861 would change, and what the new House split means.",
  ogTitle: "Short-term rentals on the Grand Strand: which rules can a new Statehouse change?",
  crumb: "Short-term rental rules and the Statehouse",
  eyebrow: "Short-term rentals",
  h1: "Short-Term Rentals on the Grand Strand:",
  h1em: "Which Rules Can a New Statehouse Change?",
  sub: "Myrtle Beach and North Myrtle Beach write their own short-term rental rules. Only a new state law could take that power away, and none has passed.",
  heroMedia: glance([
    { icon: "town", label: "Who decides today", text: "Each city and the county" },
    { icon: "key", label: "State ban on local bans", text: "None in law" },
    { icon: "calendar", label: "H. 3861", text: "Died in committee" },
    { icon: "pin", label: "Candidate positions", text: "None found" },
  ]),
  heroCta: { title: "We check a rental's zone and license before you make an offer.", label: "Have us find you your next investment", href: "/contact/" },
  author: "devin+abdulla",
  shortAnswer: [
    `In South Carolina, each city and county decides where short-term rentals may operate. No state law says a city may not ban them. The new Statehouse could change that only by passing a bill like H. 3861, which died in a House committee, and no winner of the 2026 election has said they would.`,
    `Nothing changed for a Myrtle Beach rental on election day. Stays of under 90 days are still barred in the city's zones that begin with R, except RMV. The state's part is the tax: 7% of the rent, plus up to 3% in local tax.`,
  ],
  sections: [
    { h2: "Who decides the short-term rental rules on the Grand Strand today?", toc: "Who decides today", id: "who-decides", html: () =>
      CSS + PH.css() +
      h.p(`Cities and counties decide where a short-term rental may go, through zoning. Under state law, a county or city with a comprehensive plan can adopt a ${h.ext(ZONING, "zoning ordinance")}. It governs "the use of buildings, structures, and land." The legislature decides the taxes.`) +
      whoTable([
        ["Where a short-term rental may operate", "Each city, and the county outside the cities", "Myrtle Beach bars them in most residential zones. North Myrtle Beach asks only for a license."],
        ["A ban on local bans", "The legislature", "None. H. 3861 would have made one."],
        ["State tax on the rent", "The legislature", "7% of the rent, with three exceptions"],
        ["Local accommodations tax", "City and county councils", "Up to 3%"],
        ["Business license", "Each city and the county", "Every rental in Myrtle Beach and North Myrtle Beach needs one"],
      ]) +
      h.p(`We checked the state code's chapters on local government, zoning and property and sales tax for a limit on local bans under another name, and found none. The one rule on rental websites asks them to post a notice about local licensing.`) +
      h.p(`Election day changed none of these local rules. Horry County, Myrtle Beach, North Myrtle Beach and Surfside Beach had no question on the Nov. 3 ballot.`) },

    { h2: "What are Myrtle Beach's short-term rental rules?", toc: "Myrtle Beach", id: "myrtle-beach", html: () =>
      h.p(`Myrtle Beach keeps short-term rentals out of most of its residential neighborhoods. In the city, a short-term rental is a stay of under 90 days.`) +
      h.ul([
        `<strong>Residential zones.</strong> ${h.ext(MB, "No zone that begins with R")} allows them, except RMV (Residential Multifamily Visitor). Most traditional neighborhoods are in R zones.`,
        `<strong>Grandfathered houses.</strong> Fewer than 30 houses in those zones, citywide, can keep renting short-term under the old rules.`,
        `<strong>License and fines.</strong> Every rental needs a city business license. A violation can bring a fine of up to $500, 30 days in jail, or both, on conviction.`,
      ]) +
      PHOTO +
      h.p(`The city added one more rule in December 2024. City council voted unanimously for a ${h.ext(OVERLAY, "conversion overlay")} on commercial districts east of Kings Highway, on the ocean side. Under it, short-term rentals there may not convert to long-term rentals. It took effect at once, and a temporary moratorium was set to expire.`) +
      h.p(`Two kinds of units are exempt from the overlay. One is a unit that already has a long-term rental license. The other is a former primary residence or second home that was never rented.`) },

    { h2: "What are the rules in North Myrtle Beach, Surfside Beach and the rest of Horry County?", toc: "North Myrtle Beach and the rest", id: "north-myrtle-beach", html: (bg) =>
      h.p(`North Myrtle Beach allows short-term rentals with a ${h.ext(NMB, "city business license")}, renewed every year. The city requires no special zoning or permit beyond the license. Each rental collects accommodations tax for the city, the county and the state.`) +
      h.p(`Surfside Beach and Horry County, outside the cities, each decide their own rules too. Our agents check the zone of any Surfside Beach or county address with the town or county before you make an offer. Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} lists the rules town by town on the Grand Strand.`) +
      h.cta("Want to buy a rental?", "We show you rentals in the zones where short stays are allowed, in Myrtle Beach, North Myrtle Beach and Surfside Beach.", "Have us find you your next investment", "/contact/", bg) },

    { h2: "How much tax does a Grand Strand short-term rental collect, and who decides it?", toc: "Accommodations tax", id: "accommodations-tax", html: () =>
      h.p(`The state charges ${h.ext(ATAX, "7% of the rent")} on rooms and homes rented to short-stay guests. A city or county can add a ${h.ext(LTAX, "local accommodations tax")} of up to 3%. A county may not charge more than 1.5% inside a city unless the city agrees.`) +
      h.p(`Three kinds of rentals owe no state accommodations tax:`) +
      h.ul([
        `Renting fewer than six rooms in the home you live in.`,
        `A home rented out for 14 days or fewer in a year, the ${h.a("/invest/14-day-rule/", "14-day rule")} in federal tax law.`,
        `A stay of 90 days or more in a row by the same guest.`,
      ]) +
      h.p(`Both rates are in state law, so the legislature can change them with an ordinary bill. Our ${h.a("/invest/accommodations-tax/", "accommodations tax guide")} gives the full rate for each Grand Strand city and county.`) },

    { h2: "What would H. 3861 have done to Myrtle Beach's rules?", toc: "What H. 3861 would have done", id: "h-3861", html: () =>
      h.p(`${h.ext(H3861, "H. 3861")} said no city or county may make or enforce a rule that bans renting a home to short-term guests. Myrtle Beach could no longer have kept stays of fewer than 29 days out of its R zones.`) +
      h.ul([
        `<strong>What counts as short-term.</strong> The bill applies to stays of fewer than 29 days in a row. Myrtle Beach's rule applies to stays under 90 days. A stay of 29 to 89 days would still have been the city's to rule on.`,
        `<strong>The penalty.</strong> A city or county that kept a ban could not collect tax at the 6% ratio on "qualifying property," in the bill's words. The State Treasurer would also hold back its state aid until it repealed the ban.`,
        `<strong>Who filed it.</strong> Reps. Hewitt, Bailey, Brewer, Murphy and Bannister. Rep. William Bailey represents Horry County's District ${BAILEY.d}.`,
        `<strong>What happened to it.</strong> It was introduced in January 2025 and sent to the House Medical, Military, Public and Municipal Affairs Committee. We checked the bill's record: the committee never voted on it.`,
      ]) +
      h.p(`A rental is taxed on 6% of its value, and a home you live in on 4%. Our page on the ${h.a("/invest/rental-property-tax-cut/", "proposed rental property tax cut")} shows what it costs on a Myrtle Beach rental.`) },

    { h2: "Could the new South Carolina House pass a bill like H. 3861?", toc: "The votes it would need", id: "the-votes", html: () =>
      h.p(`Yes. If all ${HS} members vote, it would take ${MAJ} House votes, the same as in the old House. A bill like H. 3861 is an ordinary bill. It does not need two-thirds. Each house must ${h.ext(ART3, "read it three times")}, on three separate days, and pass it. In the House, a tie fails.`) +
      SEATS +
      h.ul([
        `<strong>The House.</strong> In the unofficial count, Republicans led in ${A.R} races and Democrats in ${A.D}. Before the election it had ${B.R} Republicans and ${B.D} Democrats.`,
        `<strong>The Senate.</strong> It was not on the ballot except for one special race. It still has ${V.senate.R} Republicans and ${V.senate.D} Democrats.`,
        `<strong>The recounts.</strong> Two House races were within 1 point and qualify for an automatic recount. If one recount changed the result, Republicans would hold ${LOW} or ${HIGH} seats. If both did, they would hold ${A.R}. Each is more than ${MAJ} and fewer than ${TWO3}.`,
      ]) +
      h.h3("What changed: the votes to override a veto") +
      h.p(`After a governor's ${h.ext(ART4, "veto")}, two-thirds of each house must vote again to pass the bill. If all members vote, that is ${TWO3} in the House and ${STWO3} in the Senate.`) +
      h.p(`Republicans held ${B.R} House seats before, enough to override alone. With ${A.R}, a House override would need some Democratic votes.`) +
      h.h3("What did the candidates say about short-term rentals?") +
      h.p(`Nothing we found. Alan Wilson won the governor's race after Jermaine Johnson conceded. We checked Wilson's priorities page and found no short-term rental item, and we found no statement from Johnson. Annie Andrews, the AP's winner of the U.S. Senate race, has none on her issue pages, and state zoning is not a federal vote.`) +
      h.p(`Of the ${HORRY.length} House districts on Horry County's ballot, Republicans led in ${HR} and Democrats in ${HD}. Rep. Bailey, a sponsor of H. 3861, won District ${BAILEY.d} with ${BAILEY.pct}% in the unofficial count. Our ${h.a("/market-reports/2026-election/", "2026 election guide")} has every result that matters for a home here.`) },

    { h2: "What happened when Arizona's and Florida's legislatures took this power from cities?", toc: "Arizona and Florida", id: "other-states", html: () =>
      h.p(`Both legislatures took away the power to ban. Arizona later changed its law. Florida's legislature passed a change in 2024, and the governor vetoed it. In order:`) +
      timeline([
        ["2016", "Arizona bars local bans", `${h.ext(AZ16, "SB 1350")}: "A city or town may not prohibit vacation rentals or short-term rentals."`],
        ["2022", "Arizona gives cities some rules back", `${h.ext(AZNOW, "SB 1168")} kept the ban on bans. Cities can now require a permit, with a fee of no more than $250 or the cost, whichever is less. They can also require an emergency contact, notice to neighbors, and liability coverage of $500,000, which the booking platform's coverage can meet. They can suspend a permit for repeat violations.`],
        ["2024", "Florida's governor vetoes a vacation rental bill", `The ${h.ext(FLVETO, "bill, CS/SB 280")}, would have made platforms collect and pay the taxes and moved licensing to the state.`],
        ["2025", "South Carolina's H. 3861 is introduced", `It never left committee.`],
        ["Now", "Florida keeps its older local rules", `${h.ext(FL, "Florida law today")} says local governments may not ban vacation rentals or limit how long or how often they are rented. Local rules adopted on or before June 1, 2011 still stand.`],
      ]) +
      h.p(`In Arizona, cities lost the power to ban in 2016. Six years later the legislature let them require permits, contacts and insurance. In Florida, local rules from before the cutoff still stand. We found no study that measured what either change did to home prices or rents.`) },

    { h2: "Do short-term rental limits change home prices and rents?", toc: "Prices and rents", id: "prices", html: () =>
      h.p(`In the one peer-reviewed study we found, by a small amount. In Los Angeles County, 18 of 88 cities adopted home-sharing rules. ${h.ext(LA, "The study")}, in the Journal of Urban Economics in 2021, measured what followed in those cities:`) +
      `<div class="c3s-stats" role="list" aria-label="What local limits did in Los Angeles County"><div role="listitem"><b>18 of 88</b>cities adopted limits</div><div role="listitem"><b>50% fewer</b>short-term listings</div><div role="listitem"><b>About 2%</b>lower home prices</div><div role="listitem"><b>About 2%</b>lower rents</div></div>` +
      h.p(`Myrtle Beach is a different market, and a state law like H. 3861 would work in the other direction, opening zones instead of closing them. The study shows how large the effect was there. It is not a forecast for the Grand Strand.`) },

    { h2: "What could happen to Grand Strand short-term rentals in the next two years, and after five?", toc: "Short run and long run", id: "what-could-happen", html: () =>
      h.p(`Three paths, each from a past example. None is a forecast of what the new legislature will pass.`) +
      cards([
        ["No new state law", `<p><b>Where it happened:</b> H. 3861 got no committee vote in 2025 and 2026.</p><p><b>Next two years:</b> Myrtle Beach's R-zone rule, its overlay and North Myrtle Beach's license rule stay as they are.</p><p><b>After five:</b> any change comes from a city or county council vote.</p>`],
        ["A ban on local bans", `<p><b>Where it happened:</b> Arizona in 2016, and the H. 3861 text.</p><p><b>Next two years:</b> Myrtle Beach could not enforce its R-zone rule on stays under 29 days. Reading the Los Angeles study in reverse, prices and rents in those zones could rise by up to about 2%, or not at all. That is our inference, not a forecast.</p><p><b>After five:</b> in Arizona, six years later, the legislature let cities require permits, emergency contacts and insurance.</p>`],
        ["A law that keeps older local rules", `<p><b>Where it happened:</b> Florida. Its law keeps local rules adopted on or before June 1, 2011.</p><p><b>Next two years:</b> a cutoff like Florida's keeps the local rules adopted before it. Myrtle Beach's R-zone rule could stay if it came before the cutoff, and new local bans would be barred.</p><p><b>After five:</b> in Florida, the legislature passed a bill moving licensing to the state in 2024, and the governor vetoed it.</p>`],
      ]) +
      h.p(`Any new law needs the same steps first. A bill is filed and usually passes a committee. It wins ${MAJ} House votes if all ${HS} members vote, then a Senate majority. Then the governor signs it or lets it become law without a signature.`) +
      h.p(`If all members vote, a veto would then need ${TWO3} House votes and ${STWO3} Senate votes to override.`) },

    { h2: "What does Chapter3 do for a short-term rental buyer while the rules stay local?", toc: "What we do", id: "what-we-do", html: (bg) =>
      h.p(`We check the rules for the one address before you make an offer. In Myrtle Beach that means the zone and whether the house is one of the fewer than 30 grandfathered houses. For a condo, it also means whether the building is in the overlay. In North Myrtle Beach and Surfside Beach it means the license and the zone.`) +
      h.p(`We price a rental on the rules in force on the day you buy.`) +
      h.cta("Looking at a short-term rental here?", "Tell us the address or the area. We check its zone and license and show you rentals where short stays are allowed.", "Talk to a specialized agent", "/contact/", bg) },
  ],
  faqTitle: "Short-term rental rule questions",
  faq: [
    { q: "Can Myrtle Beach ban short-term rentals?", a: "Yes. No South Carolina law stops a city from barring them through zoning. Myrtle Beach bars stays of under 90 days in every zone that begins with R, except RMV. Fewer than 30 houses citywide are grandfathered." },
    { q: "Did the 2026 election change short-term rental rules on the Grand Strand?", a: "No. Horry County, Myrtle Beach, North Myrtle Beach and Surfside Beach had no local ballot question. No state law on the subject passed. The rules change only by a council vote or a new state law." },
    { q: "What was H. 3861?", a: "A 2025 South Carolina House bill that would have barred cities and counties from banning short-term rentals of fewer than 29 days. A government that kept a ban would have lost its state aid. It never got a committee vote." },
    { q: "How much tax does a short-term rental pay in South Carolina?", a: "The state charges 7% of the rent. A city or county may add up to 3%. Rentals of 90 days or more to the same guest owe no accommodations tax." },
    { q: "What did Alan Wilson say about short-term rentals?", a: "Nothing we found. His priorities page has no short-term rental item. As governor he could sign or veto a bill on the subject." },
  ],
  sources: [
    { name: "H. 3861", href: H3861 },
    { name: "Myrtle Beach rules", href: MB },
    { name: "North Myrtle Beach rules", href: NMB },
    { name: "WMBF on the overlay", href: OVERLAY },
    { name: "S.C. Code 6-29-720", href: ZONING },
    { name: "12-36-920", href: ATAX },
    { name: "6-1-520", href: LTAX },
    { name: "SC Constitution Art. III", href: ART3 },
    { name: "Art. IV", href: ART4 },
    { name: "House Rules", href: HRULES },
    { name: "SC election results", href: RESULTS },
    { name: "Arizona SB 1350", href: AZ16 },
    { name: "A.R.S. 9-500.39", href: AZNOW },
    { name: "Fla. Stat. 509.032", href: FL },
    { name: "Florida veto", href: FLVETO },
    { name: "Koster et al. 2021", href: LA },
  ],
  sourcesNote: "Election results are the unofficial count until certified. Not legal or tax advice.",
  afterSources: () => PH.credits().replace(/Chapter3 Realty resized these photos and cropped some of them\.[^<]*/, "Chapter3 Realty cropped and resized this photo."),
  bottomCta: { h2: "Buying a short-term rental on the Grand Strand?", p: "We check the zone, the license and the grandfathered status of the rental you want. We also find rentals where short stays are allowed.", label: "Have us find you your next investment", href: "/contact/" },
  keywords: "Myrtle Beach short term rental laws, Horry County short term rental laws, North Myrtle Beach short term rentals, H. 3861 South Carolina, short-term rental preemption, South Carolina accommodations tax, 2026 election short-term rentals",
  about: "Who decides short-term rental rules in Myrtle Beach, North Myrtle Beach and Horry County, South Carolina, and whether the state legislature elected in 2026 could change them",
});
