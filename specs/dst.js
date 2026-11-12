/* /invest/strategies/dst/ - the Delaware statutory trust (DST) for a Grand Strand landlord: what it is,
 * what it costs to get into, who can buy one, what you give up, and how you get out.
 *
 * Batch 2026-10-d, Lane U. Version 2, fix round 1 (Blog-Brain batches/2026-10-d/invest-strategies-dst/
 * REVIEW-1.md). The live page was hand-made, a guest post by an out-of-state financial planner with his
 * phone number and his firm's disclosure (audit item 10). This spec replaces it with Chapter3's own page,
 * on the answer proposed in OWNER-QUESTIONS.md question 1; the guest's paragraph, contact block and
 * disclosure are gone.
 * Facts: Blog-Brain batches/2026-10-d/invest-strategies-dst/facts.md, VERIFIED and CORRECTED rows only,
 * at the verifier's wording (VERIFY.md), plus rows 28 to 33 marked VERIFIED-BY-FIXER for the lead to
 * re-check. Struck wording: invest-strategies-dst-struck.json.
 * Charts, the map and the worked example are built from data/2026-10-d/invest-strategies-dst/
 * (formd_dst_summary.json: our count of SEC Form D filings, 2025 Q4 to 2026 Q3; dst_parcel_points.json:
 * Horry County parcels owned by DSTs; worked_example.json: the same constructed sale as
 * /sell/capital-gains/), never typed.
 * Round 1 changes: plain words in place of securities-law terms; three limits a seller feels in place of
 * seven; what a DST pays and how you can lose money; one Form D chart; the out-of-state owner counts and
 * the oceanfront photo cut; our own map of the DST-owned parcels; the agent's work in each step; the
 * story next to "What we do" with its tension; no errands for the reader.
 * Round 2 changes (REVIEW-2.md): the fit test said once; no "typical" sale; the Form D count without
 * "every"; the ruling's mechanics, the REIT difference and the loan point moved out of the body (the REIT
 * and loan points are FAQs now); the pros and cons recap and four FAQs that repeated the body cut; the
 * stand-in condo photo replaced by a U.S. government aerial of a DST-owned apartment community, with the
 * trust's parcel outlined from county data; the offering document (PPM) named, with what to look for in
 * it; the steps in one column at every width; hero tiles across the full width.
 * Round 3 changes (REVIEW-3.md): the photo caption says "near"; the 3.8 percent tax is in the example and
 * the commission is "about half the tax or more"; the master lease explains how an apartment DST signs
 * residents (new row 34); Revenue Ruling 2004-86, Rule 506(c), Regulation D, Form D, the SEC and FINRA named
 * in full once; what the sponsor checks to confirm you pass (new row 35); what the filings do not show
 * (payout, hold) said plainly, with how to compare a projected payout with your rental; the DST broker
 * defined before first use; figurative words, clefts and repeats cut; the FINRA fee warning and the PPM
 * guidance sentence cut as technical; the story's bridge sentence cut and its figures labelled as his.
 * Not on the page until the owner answers question 2: a sentence that Chapter3 takes no fee from any
 * DST seller (see NEEDS.md in the batch folder).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const DATA = path.join(__dirname, "..", "data", "2026-10-d", "invest-strategies-dst");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const FD = read("formd_dst_summary.json"), EX = read("worked_example.json"), PTS = read("dst_parcel_points.json");
const PH = PK.create({ h, photos: read("photos.json").photos }).photoSet({ aerialWidth: "720px" });

/* Checks: the page's sentences rest on these values (ledger rows 13 to 16, 24, 25, 30). */
const must = (ok, what) => { if (!ok) throw new Error(`dst.js: ${what}`); };
must(FD.filings === 160 && FD.has_nonaccredited.false === 159, "row 13/14: 160 filings, 159 with no non-accredited investor");
must(FD.exemption["06c"] + FD.exemption["06c, 3C, 3C.5"] === 98 && 98 * 2 > FD.filings, "row 14: 98 under 506(c), most of 160");
must(FD.min_inv.n === 156 && FD.extra.min_ge_100k === 93 && FD.extra.min_eq_1000 === 21, "row 15: minimums");
must(FD.extra.min_buckets["under $25,000"] === FD.extra.min_eq_1000, "row 15: every minimum under $25,000 was $1,000");
must(FD.commission_plus_finders_share.n === 144 && Math.round(FD.commission_plus_finders_share.median * 1000) === 60, "row 16: median commission 6 percent of 144");
must(EX.gain === 186000 && EX.federal_total === 33900 && EX.selling_costs === 24000, "row 24: the example matches /sell/capital-gains/");
must(PTS.owners === 10 && PTS.parcels === 11 && Math.round(PTS.market_total / 1e6) === 202 && PTS.bought_since_2024_11 === 6, "row 25: 10 trusts, 11 parcels, about $200 million, 6 since November 2024");
must(PTS.home_parcels === 0, "row 30: none of the parcels is a house, condo or townhouse lot");
must(FD.filings - FD.min_inv.n === 4, "row 15: four filings named no minimum");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const about100 = (v) => "about $" + (Math.round(v / 100) * 100).toLocaleString("en-US");
const pct = (v) => `${Math.round(v * 1000) / 10}`.replace(/\.0$/, "");

const TAX = about100(EX.tax_before_niit);          // about $39,300
const COMM = about100(EX.dst_commission_on_realized); // about $22,600
const TAXR = "about $" + (Math.round(EX.tax_before_niit / 1000) * 1000).toLocaleString("en-US"); // about $39,000, in prose
const COMMR = "about $" + (Math.round(EX.dst_commission_on_realized / 1000) * 1000).toLocaleString("en-US"); // about $23,000, in prose
const IN = money(EX.amount_realized);              // $376,000
must(EX.commission_as_share_of_tax_before_niit > 0.5 && EX.dst_commission_on_realized / EX.tax_with_niit > 0.45 && EX.dst_commission_on_realized / EX.tax_with_niit < 0.5, "row 24: commission is about half the tax or more, with or without the 3.8 percent tax");
must(Math.round(EX.niit_if_over_threshold / 100) * 100 === 7100 && EX.bought === 250000 && EX.depreciation === 60000, "row 24: the example's inputs and the 3.8 percent tax as stated");
const NIIT = about100(EX.niit_if_over_threshold); // about $7,100
const MID = pct(FD.commission_plus_finders_share.median);

const SELF = "/invest/strategies/dst/";
const RR = "https://www.irs.gov/irb/2004-33_IRB";
const S1031 = "https://www.law.cornell.edu/uscode/text/26/1031";
const S856 = "https://www.law.cornell.edu/uscode/text/26/856";
const S1014 = "https://www.law.cornell.edu/uscode/text/26/1014";
const I8824 = "https://www.irs.gov/instructions/i8824";
const ACCR = "https://www.sec.gov/resources-small-businesses/capital-raising-building-blocks/accredited-investors";
const R506C = "https://www.sec.gov/resources-small-businesses/exempt-offerings/general-solicitation-rule-506c";
const R144 = "https://www.sec.gov/reports/rule-144-selling-restricted-control-securities";
const FORMD = "https://www.sec.gov/data-research/sec-markets-data/form-d-data-sets";
const BROKER = "https://www.finra.org/investors/protect-your-money/check-registration";
const T409 = "https://www.irs.gov/taxtopics/tc409";
const T559 = "https://www.irs.gov/taxtopics/tc559";
const SC1150 = "https://www.scstatehouse.gov/code/t12c006.php";
const CFR506 = "https://www.law.cornell.edu/cfr/text/17/230.506";
const TENK = "https://www.sec.gov/Archives/edgar/data/1314152/000131415226000030/jllipt-20251231.htm";
const HCGIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";

/* ---------------------------------------------------------------------------- */
/* The page's own blocks. Design pass 2026-11 (redo2/invest-strategies-dst/DESIGN.md), as /invest/condos/ and
   /hoa/liens-and-foreclosure/: a two-line headline, a contents list with no card, one card style kept for the two
   charts, the map and the offers; the table, the lists, the steps and the story open, under thin rules; every block
   of the page's own 720 px wide, the width of the offers; the aerial photo beside its paragraphs on a wide screen. */
const RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = `<style>
main#main .c3d-steps{list-style:none;margin:1.4rem 0 1.6rem;padding:0;max-width:720px;counter-reset:s}
main#main .c3d-steps li{position:relative;margin:0;padding:0 0 1.4rem 3.3rem;line-height:1.55;color:var(--muted);font-size:var(--read,1.0625rem)}
main#main .c3d-steps li:last-child{padding-bottom:0}
main#main .c3d-steps li::before{counter-increment:s;content:counter(s);position:absolute;left:0;top:0;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--brass);color:#fff;font:600 .95rem/2.1rem var(--sans);text-align:center}
main#main .c3d-steps li:not(:last-child)::after{content:"";position:absolute;left:1rem;top:2.6rem;bottom:.45rem;width:2px;border-radius:2px;background:rgba(28,32,40,.14)}
main#main .c3d-steps strong{display:block;color:var(--navy);font-family:var(--sans);font-weight:650;font-size:1.08rem;line-height:1.35;padding-top:.3rem;margin-bottom:.2rem}
main#main .c3d-steps .we{display:block;margin-top:.35rem;color:var(--navy)}
@media (max-width:699px){main#main .c3d-steps li{padding-left:2.9rem}main#main .c3d-steps li::before{width:1.9rem;height:1.9rem;line-height:1.9rem}main#main .c3d-steps li:not(:last-child)::after{left:.9rem;top:2.4rem}}
/* No heading ends on one word alone (critic, round 2). */
main#main h1,main#main h2,main#main h3{text-wrap:balance}
/* "Who can buy" and the four ways out: open items under a top rule, two side by side on a wide screen. */
main#main .c3d-grid{display:grid;gap:1.1rem;margin:1.2rem 0 1.5rem;max-width:720px}
@media (min-width:760px){main#main .c3d-grid{grid-template-columns:repeat(2,minmax(0,1fr));column-gap:2rem}}
main#main .c3d-card{padding:.85rem 0 0;border-top:2px solid rgba(28,32,40,.14);color:var(--muted);line-height:1.6;font-size:var(--read,1.0625rem)}
main#main .c3d-card h3{font-family:var(--sans)!important;font-size:1.08rem!important;font-weight:650;color:var(--navy);margin:0 0 .3rem!important;line-height:1.35}
main#main .c3d-card p{margin:0}
main#main .c3d-big{display:block;font-family:var(--serif);font-size:1.6rem;line-height:1.15;color:var(--navy);margin-bottom:.3rem}
main#main .c3d-limits{counter-reset:l;list-style:none;margin:1rem 0 1.4rem;padding:0;max-width:720px}
main#main .c3d-limits li{position:relative;padding:.7rem 0 .75rem 2.9rem;border-bottom:1px solid rgba(28,32,40,.1);color:var(--muted);line-height:1.6;font-size:var(--read,1.0625rem)}
main#main .c3d-limits li::before{counter-increment:l;content:counter(l);position:absolute;left:0;top:.7rem;width:1.9rem;height:1.9rem;border-radius:50%;background:rgba(196,120,58,.14);color:var(--brass-ink);font:650 1rem/1.9rem var(--sans);text-align:center}
main#main .c3d-limits strong{color:var(--navy);font-weight:600}
main#main .c3d-limits .m{display:block;margin-top:.1rem}
main#main .c3d-ask{margin:.6rem 0 1.2rem;padding-left:1.3rem;max-width:720px;color:var(--muted);line-height:1.6;font-size:var(--read,1.0625rem)}
main#main .c3d-ask li{margin:.25rem 0}
/* The story: the brass rule, no box. */
main#main .c3d-callout{border-left:3px solid var(--brass);padding:.2rem 0 .2rem 1.2rem;margin:1.2rem 0 1.4rem;max-width:720px;box-sizing:border-box;color:var(--muted);line-height:1.7;font-size:var(--read,1.0625rem)}
main#main .c3d-callout p{margin:0 0 .6rem}main#main .c3d-callout p:last-child{margin:0}
/* "Which one fits": one list split by rules. */
main#main .c3d-fits{list-style:none;margin:1rem 0 1.4rem;padding:0;max-width:720px}
main#main .c3d-fits li{margin:0;padding:.8rem 0 .85rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:var(--read,1.0625rem)}
main#main .c3d-fits li:last-child{border-bottom:${RULE}}
main#main .c3d-fits strong{color:var(--navy)}
/* The county counts: three flat figures between two rules. */
main#main .c3d-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.4rem 1.2rem;max-width:720px;margin:1rem 0 1.2rem;padding:.8rem 0 .85rem;border-top:${RULE};border-bottom:${RULE}}
main#main .c3d-stats div{color:var(--muted);font-size:.95rem;line-height:1.35}
main#main .c3d-stats b{display:block;font-family:var(--serif);font-weight:600;font-size:clamp(1.15rem,4.6vw,1.6rem);line-height:1.15;color:var(--navy);margin-bottom:.15rem}
/* The headline: the italic line at about half the H1's size, on its own line. */
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
/* Hero tiles across the hero's full width from 700 px, so each value fits on one or two lines (critic, round 2). */
.c3-glance li{min-width:0}
@media (min-width:700px){.c3-glance{max-width:none!important}.detail-hero .detail-media:has(.c3-glance){max-width:none!important}}
.c3-glance li,.c3-glance span.t,.c3-glance strong{line-height:1.4!important}
/* On a phone the tiles are flat rows under hairlines: icon, label, value. */
@media (max-width:699px){main#main .c3-glance{grid-template-columns:1fr!important;gap:0!important}main#main .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.4rem 0!important}main#main .c3-glance li:last-child{border-bottom:${RULE}!important}}
/* The contents list: no card, plain columns between two thin rules. */
main#main nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(max-content,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
/* The three-choices table: no card, plain rows under rules; on a phone, rows split by a rule, not cards. */
main#main .c3-cc{${FLAT};padding:0!important;max-width:720px!important}
main#main .c3-cc thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}
main#main .c3-cc th:first-child,main#main .c3-cc td:first-child{padding-left:0}
@media (max-width:39.999em){main#main .c3-cc tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important;padding:.7rem 0 .75rem!important}main#main .c3-cc tbody tr:last-child{border-bottom:${RULE}!important}main#main .c3-cc th,main#main .c3-cc td{padding-left:0!important;padding-right:0!important}}
/* One block width: the charts keep their card, at the offers' width. */
main#main .c3-gchart{max-width:720px!important}
/* The photo: no frame. On a wide screen it sits beside the two paragraphs that describe the properties. */
main#main .c3ph-hero{${FLAT};padding:0!important}main#main .c3ph-hero figcaption{padding:.5rem 0 0!important}
@media (min-width:1100px){main#main .c3d-side{display:grid;grid-template-columns:minmax(0,665px) minmax(0,1fr);grid-template-rows:auto 1fr;column-gap:2.5rem;align-items:start}
main#main .c3d-side>*{grid-column:1}main#main .c3d-side>.c3-aerial{grid-column:2;grid-row:1/-1;margin-top:.3rem}main#main .c3d-side .c3ph-hero{margin:0!important;max-width:none!important}}
/* Shared chrome, worked around on this page until the lead fixes the shared CSS (NEEDS.md items 7 and 8):
   the listing search box is 341 px wide in a 320 px window, and the header is 1029 px wide at 1024. */
@media (max-width:379px){.hx-fb-ai,.hx-fb-ai .hx-ai-badge,.hx-fb-ai .hx-fb-q{max-width:100%!important;min-width:0!important;box-sizing:border-box}.hx-fb-ai .hx-fb-q textarea{flex:1 1 0!important;width:auto!important;min-width:0!important}}
@media (min-width:1000px) and (max-width:1100px){.header-inner>.primary{gap:2.2rem!important}.header-inner{gap:1.6rem!important}}
/* The closing offer band: the website's edge adds the listing disclaimer after it, so it is no longer the
   last child of main, and glass.js draws it as the light top bar with ivory text on it (NEEDS.md). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{background:#2a3040!important;display:block!important;text-align:center!important;padding:2.2rem 1.6rem!important;margin-left:max(24px,calc((100% - 1132px) / 2))!important;margin-right:0!important;width:min(720px,calc(100% - 48px));max-width:none!important;box-sizing:border-box}
/* The band's left edge lines up with the blocks above it (x 154 at 1440), not centered (critic, round 3). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap>p{color:rgba(244,239,232,.82)!important}
</style>`;
const steps = (items) => `<ol class="c3d-steps" aria-label="The sale and the exchange, step by step">${items.map(([t, d, we]) => `<li><strong>${t}</strong> ${d}${we ? ` <span class="we">${we}</span>` : ""}</li>`).join("")}</ol>`;
const cards = (items) => `<div class="c3d-grid">${items.map(([t, d]) => `<div class="c3d-card"><h3>${t}</h3><p>${d}</p></div>`).join("")}</div>`;

/* ---------------------------------------------------------------------------- */
/* Charts and the map, from the data files.                                         */

/* Chart 1: the worked example (row 24). Never add the commission and the tax. Three figures only (owner's-eye review, round 2). */
const EXAMPLE_CHART = G.bars([
  { name: "Tax the exchange puts off", value: EX.tax_before_niit, valueText: "$" + TAXR.slice(7), feature: "federal and South Carolina, before the 3.8% tax" },
  { name: "DST sales commissions on the money you put in", value: EX.dst_commission_on_realized, valueText: "$" + COMMR.slice(7), feature: `about ${MID}% of ${IN}` },
], { caption: "Our $400,000 example sale: the tax put off, and the DST's sales commissions", nameLabel: "What", featureLabel: "detail", valueLabel: "Dollars",
  note: `After selling costs, ${IN} is left, and it goes into the DST. The DST's commissions come on top of those selling costs.` });

/* Chart 2: minimums (row 15), from extra.min_buckets. The lowest bucket is all $1,000 (checked above). */
const MB = FD.extra.min_buckets;
const MIN_NAME = { "under $25,000": "$1,000" };
const MIN_FEATURE = { "under $25,000": "20 from one sponsor; must pass the wealth test", "$100,000": "the most common minimum" };
const MIN_CHART = G.bars(Object.entries(MB).map(([k, v]) => ({ name: MIN_NAME[k] || k[0].toUpperCase() + k.slice(1), value: v, valueText: `${v} offerings`, ...(MIN_FEATURE[k] ? { feature: MIN_FEATURE[k] } : {}) })),
  { caption: `The minimum investment in ${FD.min_inv.n} DST offerings`, nameLabel: "Minimum", featureLabel: "note", valueLabel: "Offerings", compact: true,
    note: `Of the ${FD.filings} DST offerings we checked, ${FD.min_inv.n} named a minimum.` });

/* The map: every Horry County parcel a DST owns (rows 25 and 30), at the parcel's center. Row 25's verifier:
   Market Village is "a rental-home community", so its label says so (reader, round 2). */
const KIND = { apt_cf: "Apartments near Carolina Forest Blvd", apt_cp: "Apartments in the Clear Pond area", res_17: "Rental-home community near the US 17 Bypass", other: "Commercial or industrial site" };
const SHORT = { apt_cf: "Apartments, Carolina Forest", apt_cp: "Apartments, Clear Pond", res_17: "Rental homes, US 17 Bypass", other: "Commercial" };
const MAP = (() => {
  const order = ["apt_cf", "apt_cp", "res_17", "other"];
  const places = PTS.points.filter((p) => p.kind !== "other").sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind))
    .map((p) => ({ name: KIND[p.kind], short: SHORT[p.kind], lat: p.lat, lon: p.lon }));
  const m = regionMap({ name: "Where DSTs own homes for rent in Horry County", places, maxRatio: 0.8 },
    { dir: path.join(__dirname, "..", "chapter3realty", "images", "2026-10-d", "invest-strategies-dst"), src: "/images/2026-10-d/invest-strategies-dst", glass: true });
  return h.figure(m.html, `The three rental communities DSTs own in Horry County, each at its parcel's center in the county's parcel file. Their other ${PTS.parcels - places.length} parcels, commercial and industrial sites and a pump station, are not shown. ${m.credit}`) + (m.unlabelled && m.unlabelled.length ? m.key : "");
})().replace('<figure style="margin:1.8rem 0;max-width:760px">', '<figure style="margin:1.8rem 0;max-width:720px">');

/* The photo is of the topic (owner's-eye review, round 2): a DST-owned apartment community from above, USDA
   NAIP 2023, public domain, with the trust's parcel outlined from the county file (ledger row 31). It stays
   until the photo partner's ground shots arrive (shot-list.md items 1 and 2; NEEDS.md 12). */
const PHOTO = PH.aerial("dst-apartments-carolina-forest-from-above", "An apartment community a DST owns near Carolina Forest Boulevard, from above. The orange line is the trust's parcel.", { closeUp: true });
/* photos.js adds a general line that Chapter3 resized the photos after each photo's own note says so; one photo needs one note (NEEDS.md 9). */
const CREDITS = () => PH.credits().replace(/<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/, "");

/* The story (stories.json tenant-occupied-sale-13-days), told as on /sell/rental-property/. His numbers, not a promise. */
const STORY = `<div class="c3d-callout"><p>An agent at Chapter3 sold a tenant-occupied house for a man who had owned it for 15 years. He was moving to New York to be with his sister. He did not want to manage a rental from that distance, or have anyone else manage it. The lease had eight months left.</p><p>These are his numbers, not a promise. His cash flow was over $1,200 a month. The next owner's would be about half, because the buyer would pay higher taxes and carry a larger loan.</p><p>If no investor came, the plan was to offer the tenant a buyout, so buyers who would live in the house could bid too. The agent marketed the house to our list of investors who accept modest cash flow in an appreciating area. A cash buyer closed 13 days after the listing date.</p></div>`;

/* ---------------------------------------------------------------------------- */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Myrtle Beach DST 1031 Exchange: Fees, Limits, Exits | Chapter3",
  description: "A DST (Delaware statutory trust) lets you sell a rental, put off the tax and stop managing. What it costs, who can buy one and what you give up.",
  ogTitle: "What a DST costs a Grand Strand landlord, who can buy one, and what you give up",
  crumb: "DST",
  eyebrow: "Strategy",
  h1: "DST: the hands-off 1031 for a Grand Strand rental",
  h1em: "Swap a Grand Strand rental for a share of a large property: no tenants, tax put off, about 6% to sales commissions.",
  sub: "A Delaware statutory trust (DST) owns real estate and sells shares in it. A share can replace your rental in a 1031 exchange, a trade that puts off the tax.",
  heroMedia: glance([
    { icon: "home", label: "What you get", text: "No tenants, tax later" },
    { icon: "key", label: "Who can buy", text: "$1M+ net worth or $200K+ income" },
    { icon: "dollar", label: "Usual minimum", text: "$100,000" },
    { icon: "tax", label: "Sales commission", text: `About ${MID}% of your money` },
  ]),
  heroCta: { title: "We time the sale of your Grand Strand rental to your exchange deadlines.", label: "Plan my rental sale", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    `In a DST, a sponsor, the real estate company that forms the trust, buys the property and runs it. You get a share of the cash it has left over. In return, you usually get your money back only when the trust sells, the payout can fall, and sales commissions come out of your money first.`,
    `It fits only if you are done managing, pass the Securities and Exchange Commission (SEC) wealth test, and will not need the money for years.`,
  ],
  sections: [
    { h2: "Should you sell your Grand Strand rental into a DST, another rental, or pay the tax?", toc: "Three choices", id: "three-choices", html: (bg) =>
      CSS + PH.css() +
      h.p(`On a $400,000 rental sale on the Grand Strand, the Myrtle Beach area, you choose between paying the tax now, keeping the work of a rental, or giving up control of the money. The numbers are our example, worked through below.`) +
      compareCards([
        { name: "Tax this year", cells: { tax: TAXR + ", or more at higher incomes", rental: "None yet", dst: "None yet" } },
        { name: "Income", cells: { tax: "None from this rental", rental: "The rent, less your costs", dst: "A share of leftover cash, not fixed" } },
        { name: "Work each month", cells: { tax: "None", rental: "Yours, or a manager's", dst: "None" } },
        { name: "When you get the money", cells: { tax: "At closing", rental: "When you sell that rental", dst: "When the trust sells" } },
      ], [{ key: "tax", label: "Sell and pay the tax" }, { key: "rental", label: "1031 into another rental" }, { key: "dst", label: "1031 into a DST" }],
      { caption: "Three choices for our $400,000 example sale", nameLabel: "What changes" }) +
      h.h3("Which one fits") +
      `<ul class="c3d-fits">` + [
        `<strong>A DST,</strong> if you would rather own a share of a large property someone else runs than a rental of your own.`,
        `<strong>Another rental here,</strong> if you want to pick the property, set the rent and decide when to sell. Our ${h.a("/invest/strategies/1031-exchange/", "1031 exchange guide")} covers the deadlines and how we find a replacement on the Grand Strand.`,
        `<strong>Paying the tax,</strong> if you want the cash now, or the tax is small next to what a DST would cost you to enter.`,
        `<strong>Keeping the rental,</strong> if the work is the only problem. A ${h.a("/invest/property-management/", "property manager")} takes the calls, and our page on ${h.a("/invest/how-long-to-hold/", "how long to hold a rental")} shows what waiting has meant here.`,
      ].map((t) => `<li>${t}</li>`).join("") + `</ul>` +
      h.cta("What would your rental sell for?", "Send us the address, and we price it, so you weigh the three choices with your own sale price.", "Have us price my rental", "/contact/", bg) },

    { h2: "Why does the IRS allow a DST in a 1031 exchange, and who sells one?", toc: "How a DST works", id: "what-a-dst-is", html: () =>
      h.p(`The IRS, in ${h.ext(RR, "Revenue Ruling 2004-86")}, has ruled that you may trade a rental for a share of a Delaware statutory trust with no tax on the gain yet. The trust must follow the ruling's limits, and the other 1031 rules must be met.`) +
      h.p(`You buy the share through a securities firm or broker, called the DST broker on this page. Anyone who sells you a DST share must be registered with the Financial Industry Regulatory Authority (FINRA), the SEC or the state before they can sell you anything. ${h.ext(BROKER, "FINRA's BrokerCheck")} lists each securities firm and broker, with their licenses and record.`) },

    { h2: "What do you give up in a DST, and can you lose money?", toc: "What you give up", id: "what-you-give-up", html: (bg) =>
      h.p(`The ruling requires these limits on the trust:`) +
      `<ol class="c3d-limits">` + [
        ["The trust cannot take in new money from anyone.", "A large repair has to be paid from the trust's own cash. That cash is not paid out to you."],
        ["It cannot refinance its loan or sign a new lease.", `In the ruling, the trust may sign a new lease only if its tenant goes bankrupt or insolvent. A DST with many tenants, such as an apartment community, can lease the whole property to one master tenant. In ${h.ext(TENK, "one large sponsor's program")}, the master tenant is a company the sponsor owns. It signs the tenants, pays the costs of running the property and pays the trust its rent. Either way, the trust depends on one tenant's rent.`],
        ["You have no say in when the property sells.", "The trust's manager decides."],
      ].map(([t, m]) => `<li><strong>${t}</strong><span class="m">${m}</span></li>`).join("") + `</ol>` +
      h.h3("What does a DST pay you?") +
      h.p(`The trust pays out the cash the property has left, less reserves, on a set schedule. In the IRS ruling, that is every quarter. The amount moves with the rent and with the cash held back for repairs.`) +
      h.p(`The SEC filings we checked have no payout figure. If the sponsor projects a payout, the projection is in its offering document, often called a private placement memorandum (PPM).`) +
      h.p(`To compare a DST with your rental, set the PPM's projected payout for a year on your share next to what your rental leaves you in a year: the rent, less every cost you pay, the mortgage included. Ask the DST broker for the PPM before you name a DST in your exchange, and look for four things in it:`) +
      `<ul class="c3d-ask">` + [
        "Every fee, with its amount.",
        "The projected payout, and what it rests on.",
        "How long the sponsor plans to hold the property.",
        "Who the tenants are, and how long their leases run.",
      ].map((t) => `<li>${t}</li>`).join("") + `</ul>` +
      h.h3("Can you get back less than you put in?") +
      h.p(`Yes. You get back your share of what is left of the sale price after the trust's loan is paid off. The sales commissions and the sponsor's fees were paid out of the money first, so the property has to gain value before your share is worth what you paid. If it sells for less than the trust paid, you get back less still.`) +
      h.cta("Want to pick your own property instead?", "We find and show you Grand Strand rentals you could buy in your exchange instead of a DST share.", "Have us find a rental to buy", "/contact/", bg) },

    { h2: "Who can buy a DST?", toc: "Who can buy", id: "who-can-buy", html: () =>
      h.p(`Most DSTs are sold only to buyers who pass the SEC's wealth test, called ${h.ext(ACCR, "accredited investors")}. For a person, you pass with either of these:`) +
      cards([
        ["Net worth", `<span class="c3d-big">Over $1 million</span>Alone or with a spouse or partner, not counting your home.`],
        ["Income", `<span class="c3d-big">Over $200,000</span>Or $300,000 with a spouse or partner, in each of the last two years, with the same expected this year.`],
      ]) +
      h.p(`Holders of certain securities licenses also pass. Plan on needing to pass. Of the ${FD.filings} DST real estate offerings we checked in the last year's SEC Form D filings, ${FD.has_nonaccredited.false} had sold only to buyers who pass, as of the filing.`) +
      h.p(`Most of them were filed under ${h.ext(R506C, "SEC Rule 506(c)")}, part of the SEC's Regulation D. Under it, the sponsor must check that you pass. ${h.ext(CFR506, "The rule")} lists ways to check:`) +
      h.ul([
        `<strong>Income:</strong> your IRS forms for the last two years, such as W-2s, 1099s, K-1s or your Form 1040.`,
        `<strong>Net worth:</strong> bank and brokerage statements from the last three months, and a credit report.`,
        `<strong>A letter</strong> from your CPA, your lawyer, a registered broker-dealer or an SEC-registered investment adviser that says they checked.`,
      ]) },

    { h2: "What does a DST cost, and what is the minimum investment?", toc: "Cost and minimum", id: "minimums-and-fees", html: (bg) =>
      h.p(`The usual minimum is $100,000. Sales commissions are about ${MID} percent of the money, and the sponsor's other fees come on top. The Form D filings show only the sales commissions. The other fees are in the PPM.`) +
      MIN_CHART +
      h.h3("What the commission means on a $400,000 sale") +
      h.p(`Our example is the same as on our ${h.a("/sell/capital-gains/", "capital gains page")}: a Grand Strand rental bought for $250,000 and sold for $400,000, with $60,000 of depreciation taken, a gain of $186,000. A 1031 exchange into a rental or a DST puts off all of the tax. A higher-income seller owes up to ${NIIT} more than the chart shows, the 3.8 percent ${h.ext(T559, "net investment income tax")}.`) +
      EXAMPLE_CHART +
      h.p(`The sales commissions alone come to about half the tax the exchange puts off, or more, before the sponsor's other fees. You do not get the commissions back. The tax is still owed later, unless you exchange again or still own the share at your death.`) +
      h.cta("How much would you have left to put into the exchange?", "From the rental's address, we work out your selling costs and what is left after them.", "Have us work out what I keep", "/contact/", bg) },

    { h2: "How do you get your money out of a DST?", toc: "Getting out", id: "getting-out", html: () =>
      h.p(`Mostly when the trust sells its property. The sponsor's planned hold is in the PPM. The SEC filings we checked do not show it. The trust in Revenue Ruling 2004-86 was set up to end after 10 years or when its building sold, whichever came first. A DST can end for you in four ways:`) +
      cards([
        ["You want out early", `Plan to stay in until the trust sells. DST shares cannot be resold on a public market unless the conditions of ${h.ext(R144, "SEC Rule 144")} are met. A private buyer, if you find one, decides what to pay.`],
        ["The trust sells the property", `You get your share of the money. Put it into a new 1031 exchange, with new deadlines, or pay the tax.`],
        ["A REIT buys back your shares", `Some DSTs are sold by large real estate companies called REITs (real estate investment trusts). After two years, the REIT may take back your shares, for cash or for units that cannot go into a later 1031 exchange, at the REIT's choice. If you get the units, your exchanges stop there. At least 13 REITs described this kind of buy-back in their latest annual reports.`],
        ["You still own it at your death", `Your heirs generally take it at its value on the date of death, so the gain you put off is not taxed to them. A rental you keep until death gets the same ${h.ext(S1014, "rule, 26 U.S.C. 1014")}.`],
      ]) },

    { h2: "Can a DST rescue a 1031 exchange that is going wrong?", toc: "As a 1031 backup", id: "backup", html: (bg) =>
      h.p(`Only if the DST is on the list you name by day 45. A ${h.ext(S1031, "1031 exchange")} trades real property only for other real property. Every replacement, a DST share included, must be named in writing within 45 days of the sale. A DST named as a backup can still be bought if the rental you wanted falls through.`) +
      h.p(`The exchange covers less of the tax if you keep cash or the sale pays off a mortgage:`) +
      h.ul([
        `<strong>Cash you keep.</strong> You can put part of the money into the exchange and keep the rest. The cash you keep is taxed, up to the amount of your gain.`,
        `<strong>A mortgage the sale paid off.</strong> It counts as cash you received and is taxed the same way, unless the replacement carries as much debt or you add cash. A DST can help: your share of ${h.ext(I8824, "its loan can count")} toward that debt. If your rental has a mortgage, raise it with your intermediary and tax adviser before you choose a DST. We give them the closing figures.`,
      ]) +
      h.cta("Name a backup by day 45", "Tell us your price range, and we send Grand Strand rentals you could list next to the DST before day 45.", "Send me backup rentals", "/contact/", bg) },

    { h2: "Do DSTs own property on the Grand Strand?", toc: "DSTs here", id: "grand-strand", html: () =>
      h.p(`Yes. We checked ${h.ext(HCGIS, "Horry County's parcel file")} for owners with DST in the name:`) +
      `<div class="c3d-stats" role="list" aria-label="DSTs in Horry County's parcel file"><div role="listitem"><b>${PTS.owners}</b>DSTs as owners</div><div role="listitem"><b>${PTS.parcels}</b>parcels they own</div><div role="listitem"><b>$200 million</b>county value for tax, all ${PTS.parcels}</div></div>` +
      MAP +
      `<div class="c3d-side">` +
      h.p(`They include two large apartment communities, one near Carolina Forest Boulevard and one in the Clear Pond area, a community of rental homes near the US 17 Bypass, and commercial and industrial sites. ${PTS.bought_since_2024_11 === 6 ? "Six" : PTS.bought_since_2024_11} of the ${PTS.owners} trusts bought in the last two years.`) +
      PHOTO +
      h.p(`A DST share would be a share of a property like these. If you own an apartment community or a commercial or industrial building, DST sponsors are among the buyers here.`) + `</div>` },

    { h2: "What does Chapter3 do when you sell a Grand Strand rental for a DST?", toc: "What we do", id: "what-we-do", html: () =>
      h.p(`Chapter3 sells the rental. DST shares are securities, and Chapter3 does not sell them or advise on them. The DST broker sells the share. Each step of the sale and the exchange, with what our agent does:`) +
      steps([
        ["Before you list", "You choose a qualified intermediary, the company that will hold the money during the exchange, and start talking to a DST broker. After closing you have only 45 days to name the DST.", "We price the rental and set the listing date so the closing falls where your plan needs it. If a tenant is in the house, the time left on the lease changes which buyers can take it."],
        ["The sale closes", "The money goes to your intermediary, not to you. Your 45 and 180 days start that day.", "We choose a buyer who can close on the date, and give your intermediary and closing attorney the closing figures."],
        ["By day 45", "You name the DST in writing, and any backups.", "If you want a rental here as a backup, we find and show you choices before day 45."],
        ["By day 180", "Your share of the trust is bought. If your tax return for the year of the sale is due before day 180, that due date comes first; an extension on the return moves it later.", "If the backup rental here is the one you buy, we handle the purchase so it closes in time."],
        ["The trust sells", "You exchange again, or pay the tax.", "If the next exchange is a rental on the Grand Strand, we find it."],
      ]) +
      h.h3("An owner who was done managing from far away") +
      STORY +
      h.p(`Our ${h.a("/sell/net-proceeds/", "net proceeds calculator")} shows what the sale leaves you before the exchange.`) },
  ],
  faqTitle: "DST questions",
  faq: [
    { q: "Is a DST the same as a 1031 exchange?", a: "No. A 1031 exchange is the tax rule. A DST share is one kind of property you can buy with it." },
    { q: "Is a DST a REIT?", a: "No. A REIT is a company, and its owners hold shares in it. A DST share counts, for federal income tax, as owning part of the trust's real estate itself. Because of that, it can go into a 1031 exchange." },
    { q: "How is income from a DST taxed?", a: "For federal income tax, you are treated as owning part of the trust's real estate. Your share of the rent goes on your own return, and you deduct your share of the depreciation." },
    { q: "Are you personally liable for a DST's loan?", a: "Not in the trust the IRS ruling describes. The trust took over the property's loan, and neither the trust nor any owner is personally liable on it." },
  ],
  sources: [
    { name: "IRS Rev. Rul. 2004-86", href: RR },
    { name: "26 U.S.C. 1031", href: S1031 },
    { name: "26 U.S.C. 856", href: S856 },
    { name: "26 U.S.C. 1014", href: S1014 },
    { name: "IRS Form 8824 help", href: I8824 },
    { name: "IRS Topic 409", href: T409 },
    { name: "IRS Topic 559", href: T559 },
    { name: "S.C. Code 12-6-1150", href: SC1150 },
    { name: "SEC accredited investors", href: ACCR },
    { name: "SEC Rule 506(c)", href: R506C },
    { name: "17 CFR 230.506", href: CFR506 },
    { name: "SEC Rule 144", href: R144 },
    { name: "REIT Form 10-K, 2025", href: TENK },
    { name: "FINRA BrokerCheck", href: BROKER },
    { name: "SEC Form D data", href: FORMD },
  ],
  sourcesNote: "Our counts: original Form D filings, October 2025 to September 2026, and Horry County parcels. Not legal, tax or investment advice.",
  afterSources: CREDITS,
  bottomCta: { h2: "Selling a Grand Strand rental?", p: "Send us the address. We price the rental, time the closing to your 45 and 180 days, and give your intermediary and closing attorney the figures.", label: "Plan my rental sale", href: "/contact/" },
  keywords: "DST 1031 exchange, Delaware statutory trust, DST pros and cons, DST fees, DST minimum investment, DST accredited investor, DST exit, DST vs 1031, DST vs REIT, private placement memorandum, sell rental property Myrtle Beach 1031",
  about: "Delaware statutory trusts (DSTs) as 1031 exchange replacement property for a rental sold in Myrtle Beach and Horry County, South Carolina",
});
