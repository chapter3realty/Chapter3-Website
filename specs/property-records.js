/* /buyers/property-records/ - the hub for Horry County property records, and the free property lookup:
 * type an address and one card shows the parcel number, the land, the town, the flood zone and the
 * hurricane evacuation zone from Horry County's and FEMA's public maps, with the deed record and the tax
 * bill one tap away. Then: a Myrtle Beach mailing address is usually outside the City of Myrtle Beach
 * (our count); where each county record is kept; the county's name searches; what county records do not
 * show; and Georgetown County for Pawleys Island and Litchfield.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1, 2026-11-13. Plan: Blog-Brain
 * batches/2026-11-d/property-records/PLAN.md. Tool brief: batches/2026-11-d/LOOKUP-TOOL.md. Demand:
 * must-answer.md. Facts: facts.md, VERIFIED rows, and CORRECTED rows at the verifier's wording only
 * (VERIFY.md; struck wording in batches/2026-11-d/facts/buyers-property-records-struck.json). Row
 * numbers are given as R<n>.
 * Not used: "rooftop" (R1), "free" for the county's sign-in (R35), "no punctuation" and an index start
 * year (R32), "cannot be filled in by a link" (R15), any share in R17 to R22 as a share of homes, the
 * evacuation zone populations (R11), the parcel type meanings (R31), the condo building's address (R4,
 * R6), qPublic (R46: open it in a browser first), any insurance dollar figure (R40).
 * The tool: data/2026-11-d/property-records/lookup-core.js (reads each source's answer; pure functions)
 * and lookup-ui.js (the box and the card), written into the page as they are. lookup-test.js runs the
 * same core on the answers saved in raw/api/ and prints "all controls pass"; with --live it asks the
 * county again. Nothing is stored; no owner name, value or price is asked of any source.
 * Data: data/2026-11-d/property-records/ (address-points-by-place.json, chart-mailing-city-vs-town-limits.csv).
 * Every count and share is read from those files and checked against its ledger row.
 * Homes: the site's edge places this page's feed under the opening; each card has a link to homes for
 * sale within a mile of the address; one strip, Pawleys Island and Litchfield, in the Georgetown section.
 * No photo: no place on the page is its subject.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/property-records/";
const SLUG = "property-records";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const AP = read("address-points-by-place.json");
const ALL = AP.address_points_with_location, OUT = AP.by_town_limits.UNINCORPORATED;
must(ALL === 246621 && OUT === 178313, "R17: 178,313 of 246,621 outside every town");
const OUT_IN10 = Math.round(OUT / ALL * 10);
must(OUT_IN10 === 7, "R17: about 7 in 10");
const MB = AP.mailing_city_vs_town_limits["MYRTLE BEACH"];
const MB_ALL = Object.values(MB).reduce((s, v) => s + v, 0);
must(MB_ALL === 86615 && MB["MYRTLE BEACH"] === 22801, "R18: 22,801 of 86,615 inside Myrtle Beach");
const MB_OUT_IN4 = Math.round((MB_ALL - MB["MYRTLE BEACH"]) / MB_ALL * 4);
must(MB_OUT_IN4 === 3, "R18: about 3 in 4 outside");
const EV = AP.by_evac_zone, EV_IN = EV.A + EV.B + EV.C;
must(EV_IN === 86620 && Math.round(EV_IN / ALL * 3) === 1, "R22: about 1 in 3 in a zone");

/* V1: the chart rows (R18, R19), from the CSV. */
const CSV = fs.readFileSync(path.join(DATA, "chart-mailing-city-vs-town-limits.csv"), "utf8").trim().split(/\r?\n/).slice(1)
  .map((l) => l.split(",")).map(([city, all, inside, outside, pct]) => ({ city, all: +all, inside: +inside, outside: +outside, pct: +pct }));
const EXPECT = { "Myrtle Beach": 26.3, "Conway": 26.6, "Surfside Beach": 34.1, "North Myrtle Beach": 96.1 };
/* The chart shows the share OUTSIDE (its title's word): 74, 73, 66 and 4 percent. */
const BARS = Object.keys(EXPECT).map((c) => {
  const r = CSV.find((x) => x.city === c);
  must(r && r.pct === EXPECT[c] && Math.abs(r.inside / r.all * 100 - r.pct) < 0.06 && r.inside + r.outside === r.all, `R19: ${c} ${EXPECT[c]}%`);
  return { city: c, out: r.outside / r.all * 100 };
});
must(BARS.map((b) => Math.round(b.out)).join() === "74,73,66,4", "R18, R19: 74, 73, 66 and 4 percent outside");

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const LEAD = "/contact/";
const SITE_ROOT = path.join(__dirname, "..", "chapter3realty");
/* Sibling pages of this batch may not be built yet. A link to one is written only when its page exists in
   this working copy, else its words stay plain text; rebuild this spec once they are built (BUILD.md). */
const live = (u) => fs.existsSync(path.join(SITE_ROOT, ...u.split("/").filter(Boolean), "index.html"));
const sib = (u, text) => (live(u) ? h.a(u, text) : text);
const DEEDS = "/buyers/property-records/deeds/", GISP = "/buyers/property-records/gis-map/", TAXP = "/buyers/property-records/tax-bill/";
const FLOODP = "/buyers/flood-zone-check/";

const LOCATOR = "https://gisportal.horrycounty.org/server/rest/services/Locators/County_Locator/GeocodeServer";
const OPENDATA = "https://gisportal.horrycounty.org/server/rest/services/OpenData";
const NFHL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer";
const CFR64 = "https://www.ecfr.gov/current/title-44/section-64.3";
const USC4012A = "https://www.law.cornell.edu/uscode/text/42/4012a";
const FLOODNEWS = "https://www.horrycountysc.gov/media/kw5fxufi/flood-news-flyer-with-ppa-feb-2026.pdf";
const GT_MAP = "https://experience.arcgis.com/experience/fa729743d97047579f348d68f9643ba1";
const GT_DEEDS = "https://www.georgetowndeeds.com/";
const GT_TAX = "https://georgetowncountysctax.com/";

/* ---------------------------------------------------------------------------- */
/* The tool: the box in the hero, the card under it.                             */

const CORE = fs.readFileSync(path.join(DATA, "lookup-core.js"), "utf8");
const UI = fs.readFileSync(path.join(DATA, "lookup-ui.js"), "utf8");
must(!/<\/script|<!--/i.test(CORE + UI), "the lookup's code must not close the script tag");
/* In the page: the same code without its comments and indentation (the test runs the commented file). */
const slim = (js) => js.replace(/\/\*[\s\S]*?\*\//g, "").split("\n").map((l) => l.trim()).filter(Boolean).join("\n");
const CFG = {
  lead: LEAD,
  deedLayer: true, /* PLAN open question 1 (owner to approve): PIN, DeedBook, DeedPage and Acreage only. false opens the deed search instead. */
  floodGuide: live(FLOODP) ? FLOODP : "",
  flooded: "/buyers/undisclosed-flooding/",
  zoningGuide: live(GISP) ? GISP + "#zoning" : "",
  /* The example address is the courthouse, which is tax-exempt, so its Tax bill button finds no bill (VERIFY 15).
     The card says so, so the demo does not look broken. */
  noBill: { "36800000016": "The courthouse is tax-exempt, so the tax search finds no bill for it." },
};
const TRY = "1301 Second Ave, Conway";

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const CARD = "border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(255,255,255,.64));border:1px solid rgba(255,255,255,.85);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 14px 34px -24px rgba(28,32,40,.45)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  /* The hero: H1, byline, sub, then the tool. The italic line at about half the H1's size. */
  + `${S} .detail-hero .wrap{display:flex;flex-direction:column}${S} .detail-hero .detail-media{order:9;width:100%;max-width:720px!important;margin:.4rem 0 0!important}`
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.25rem,2.4vw,2.1rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .detail-h1{text-wrap:pretty}${S} h2{text-wrap:balance}${S} .btn{text-wrap:balance}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The tool card. */
  + `${S} .pr-tool{${CARD};padding:1.1rem 1.1rem 1.15rem;box-sizing:border-box;font-family:var(--sans)}`
  + `${S} .pr-form{display:grid;grid-template-columns:1fr;gap:.6rem;margin:0}`
  + `@media (min-width:600px){${S} .pr-form{grid-template-columns:minmax(0,1fr) auto}}`
  + `${S} .pr-box{position:relative;min-width:0}`
  + `${S} .pr-lbl{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  + `${S} #prQ{display:block;width:100%;box-sizing:border-box;min-height:56px;margin:0;padding:.8rem 1rem;font-family:var(--sans);font-size:1.125rem;color:var(--navy);background:#fff;border:1px solid rgba(28,32,40,.3);border-radius:12px;-webkit-appearance:none;appearance:none}`
  + `${S} #prQ:focus{outline:3px solid rgba(196,120,58,.45);outline-offset:1px;border-color:var(--brass)}`
  + `${S} #prQ::placeholder{color:#6b7080}`
  + `${S} .pr-form .btn{min-height:56px;width:100%;justify-content:center;margin:0;font-size:1.0625rem}`
  + `@media (min-width:600px){${S} .pr-form .btn{width:auto;padding-left:1.6rem;padding-right:1.6rem}}`
  + `${S} #prSug{position:absolute;left:0;right:0;top:100%;z-index:30;margin:.3rem 0 0;padding:.3rem 0;list-style:none;background:#fff;border:1px solid rgba(28,32,40,.18);border-radius:12px;box-shadow:0 18px 40px -20px rgba(28,32,40,.5)}`
  + `${S} #prSug[hidden]{display:none}`
  + `${S} .pr-opt{margin:0;padding:.75rem 1rem;cursor:pointer;font-size:1.0625rem;line-height:1.35;color:var(--navy)}`
  + `${S} .pr-opt[aria-selected=true],${S} .pr-opt:hover{background:rgba(196,120,58,.12)}`
  + `${S} .pr-info,${S} .pr-note{font-size:1rem;color:var(--muted);line-height:1.5;margin:.75rem 0 0}`
  + `${S} .pr-try{background:none;border:0;padding:0;margin:0;font:inherit;color:var(--navy);text-decoration:underline;text-underline-offset:.18em;cursor:pointer}`
  + `${S} #prOut{margin-top:1rem;border-top:2px solid var(--navy)}${S} #prOut[hidden]{display:none}`
  + `${S} .pr-dl{margin:0}`
  + `${S} .pr-r{display:grid;grid-template-columns:6.4rem minmax(0,1fr);column-gap:.9rem;padding:.8rem 0;border-bottom:1px solid rgba(28,32,40,.1)}`
  + `${S} .pr-r dt{font-size:.8rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:.3rem}`
  + `${S} .pr-r dd{margin:0;min-width:0;font-size:1.125rem;line-height:1.5;color:var(--navy)}`
  + `${S} .pr-v{display:block}${S} .pr-more{display:block;font-size:1rem;color:var(--muted);margin-top:.3rem;line-height:1.5}`
  + `${S} .pr-r dd a{color:var(--navy);text-decoration:underline;text-underline-offset:.18em}`
  + `@media (max-width:420px){${S} .pr-r{grid-template-columns:1fr;row-gap:.15rem}${S} .pr-r dt{padding-top:0}}`
  + `${S} .pr-load{display:block;height:4px;width:60%;margin:.7rem 0 .5rem;border-radius:2px;background:linear-gradient(90deg,rgba(196,120,58,.12),rgba(196,120,58,.55),rgba(196,120,58,.12));background-size:200% 100%;animation:prl 1.2s linear infinite}`
  + `@keyframes prl{from{background-position:200% 0}to{background-position:0 0}}@media (prefers-reduced-motion:reduce){${S} .pr-load{animation:none}}`
  + `${S} .pr-btns{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.1rem}`
  + `${S} .pr-r dd a.pr-b{text-decoration:none!important;display:inline-flex;align-items:center;min-height:44px;padding:.45rem 1rem;box-sizing:border-box;border-radius:999px;border:1px solid rgba(28,32,40,.28);background:#fff;font-weight:600;font-size:1rem;text-decoration:none;line-height:1.3}`
  + `${S} .pr-r dd a.pr-b:hover{border-color:var(--navy)}`
  + `${S} .pr-copy{margin-left:.4rem;min-height:36px;padding:.2rem .8rem;border-radius:999px;border:1px solid rgba(28,32,40,.28);background:#fff;color:var(--navy);font:600 .9rem var(--sans);cursor:pointer;vertical-align:.1rem}`
  + `${S} .pr-offer{margin-top:1rem;padding:1rem 1.05rem;border-radius:14px;background:rgba(196,120,58,.1)}`
  + `${S} .pr-offer p{margin:0 0 .75rem;color:var(--navy);font-weight:600;font-size:1.0625rem;line-height:1.45}${S} .pr-offer .btn{min-height:48px}`
  /* Lists and the table plain, under thin rules; one block width. */
  + `${S} ul.pr-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.pr-list>li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.65;font-size:var(--read,1.0625rem)}`
  + `${S} ul.pr-list>li:last-child{border-bottom:${RULE}}${S} ul.pr-list strong{color:var(--navy)}`
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}${TBL} td{vertical-align:top;line-height:1.5}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.7rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.15rem 0!important}${TBL} td:first-child{font-weight:650;color:var(--navy)}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}}`
  + `${S} figure.pr-chart{${CARD};max-width:720px;margin:1.4rem 0 1.5rem;padding:1.1rem 1.15rem 1rem;box-sizing:border-box}`
  + `${S} .pr-chart-t{margin:0 0 .8rem;font-family:var(--sans);font-weight:700;font-size:1.0625rem;color:var(--navy);line-height:1.35}`
  + `${S} .pr-bars{font-family:var(--sans)}${S} .pr-bar{margin:0 0 .95rem}${S} .pr-bar:last-child{margin-bottom:.2rem}`
  + `${S} .pr-bar-h{display:flex;justify-content:space-between;align-items:baseline;gap:.8rem;font-size:1rem;line-height:1.35;color:var(--navy)}${S} .pr-bar-c{font-weight:650}${S} .pr-bar-h span:last-child{white-space:nowrap}@media (max-width:380px){${S} .pr-bar-h{font-size:.9375rem}}`
  + `${S} .pr-track{display:block;height:12px;margin-top:.35rem;border-radius:6px;background:rgba(28,32,40,.09);overflow:hidden}${S} .pr-track>i{display:block;height:100%;border-radius:6px;background:#c4783a}`
  + `${S} .pr-chart figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.8rem;padding:0!important}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important;margin:1.4rem 0 1.4rem!important}${S} figure.c3ph-hero>figcaption{padding:0!important;color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}${S} figure.c3ph-hero img{border-radius:16px}`
  + `${S} .pr-quiet{font-size:1rem;color:var(--muted);line-height:1.6;max-width:720px;margin:.2rem 0 1.2rem}`
  + "</style>";

const TOOL = `<div class="pr-tool" id="lookup">`
  + `<form class="pr-form" id="prForm" role="search" action="https://www.horrycountysc.gov/gis/parcels" autocomplete="off">`
  + `<div class="pr-box"><label class="pr-lbl" for="prQ">Address in Horry County</label>`
  + `<input id="prQ" name="q" type="text" inputmode="search" enterkeyhint="search" spellcheck="false" placeholder="Type an address" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="prSug">`
  + `<ul id="prSug" role="listbox" aria-label="Matching addresses" hidden></ul></div>`
  + `<button type="submit" class="btn btn-brass">Look it up</button></form>`
  + `<div id="prOut" aria-live="polite" hidden></div>`
  + `<div class="pr-foot"><p class="pr-info">Public records from Horry County and FEMA, read live for each address. Chapter3 is not the county. <button type="button" class="pr-try" id="prTry" data-q="${TRY}">Try ${TRY}</button>, the county courthouse.</p></div>`
  + `<noscript><p class="pr-note">The lookup needs JavaScript. The county's own map is at horrycountysc.gov/gis/parcels.</p></noscript>`
  + `</div>`
  + `<script>(function(){window.PR_CFG=${JSON.stringify(CFG)};\n${slim(CORE)}\n${slim(UI)}\n})();</script>`;

/* ---------------------------------------------------------------------------- */
/* V1: the chart (R18, R19). One message in the title, and the bars measure the title's word, "outside".
   The labels are HTML text at 16 px, so they read the same at 320 px as at 1440 (fix round 1: the phone
   SVG drew them at about 11 px at 320). Each bar sits on a full-width track, so 100% is the whole line. */
const pc = (v) => `${Math.round(v)}%`;
const CHART_TITLE = "Most Myrtle Beach mailing addresses are outside the city";
const CHART_ROWS = BARS.map((r) => `<div class="pr-bar"><div class="pr-bar-h"><span class="pr-bar-c">${r.city}</span><span>${pc(r.out)} outside</span></div>`
  + `<span class="pr-track"><i style="width:${Math.max(1.5, r.out).toFixed(1)}%"></i></span></div>`).join("");
const CHART = `<figure class="pr-chart"><p class="pr-chart-t">${CHART_TITLE}</p>`
  + `<div class="pr-bars" role="img" aria-label="Bar chart. Share of street addresses with each mailing city that are outside that town's limits: ${BARS.map((r) => `${r.city} ${pc(r.out)}`).join(", ")}.">${CHART_ROWS}</div>`
  + `<figcaption>Share of street addresses with each mailing city that are outside that town's limits, from Horry County's address map.</figcaption></figure>`;

/* A table that turns into rows of labelled cells on a phone. */
const table = (head, rows) => h.table(head, rows).replace(/<tbody>([\s\S]*)<\/tbody>/, (m, body) => "<tbody>" + body.replace(/<tr>([\s\S]*?)<\/tr>/g, (r, cells) => {
  let i = 0;
  return "<tr>" + cells.replace(/<td ([^>]*)>/g, (t, attrs) => { const l = head[i++]; return i === 1 ? t : `<td ${attrs} data-l="${l}">`; }) + "</tr>";
}) + "</tbody>");

/* ---------------------------------------------------------------------------- */
/* The one photo: the county's government center in Conway, the lookup's example address (R1), where the     */
/* Register of Deeds' public viewing area is. The record is the deeds page's (CC BY-SA 3.0), reused unchanged. */

const DEED_PHOTOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-d", "property-records-deeds", "photos.json"), "utf8")).photos;
const JC_REC = DEED_PHOTOS.find((r) => /horry-government-justice-center\.webp$/.test(r.file));
must(JC_REC && /^CC BY-SA/.test(JC_REC.license), "the Justice Center photo record (deeds photos.json)");
const JC_CAP = "The Horry County Government and Justice Center at 1301 Second Avenue in Conway, where the Register of Deeds' public viewing area is";
const JC_PHOTO = PH.heroPhoto(JC_REC, { alt: JC_REC.alt, caption: JC_CAP + ".", maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
/* The deeds record's own note of changes repeats the credits list's closing line, so it is left out here. */
const CREDITS = PH.creditsList([{ photo: { ...JC_REC, changes: "" }, caption: JC_CAP }]);

/* ---------------------------------------------------------------------------- */
/* Offers. Every request button goes to /contact/; the site opens the short pop-up. */

/* Four offers, four promises (fix round 1): the card's (that address's papers in one email), a shortlist's
   records, the checks before an offer, and a showing. No two open with the same words. */
const END = {
  h2: "Found a home you like? See it with a local agent.",
  p: "We set up the showing, walk the lot with you and answer what its records cannot.",
  label: "Set up a showing", href: LEAD,
};
const PAWLEYS_STRIP = G.homesQ("city=Pawleys Island&type=house", "Houses for sale in Pawleys Island");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "Horry County Property Records Search: Free Address Lookup",
  description: "Free Horry County property search by address: parcel number, lot, town limits, flood zone and evacuation zone, with links to the deed, tax bill and parcel map.",
  ogTitle: "Horry County property records: look up any address for its parcel number, town, flood zone and evacuation zone, free",
  crumb: "Property Records",
  eyebrow: "Horry County property records",
  h1: "Horry County property records: look up any address",
  h1em: "The parcel, the flood zone, the deed and the tax bill, in one box.",
  sub: "Type an address. The card shows Horry County's and FEMA's public records for it, line by line, with no sign-in.",
  heroCta: false,
  heroMedia: CSS + G.homesCss() + G.homesQScript() + TOOL,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Horry County keeps property records in three places: deeds at the Register of Deeds, tax bills at the Treasurer, and lot lines on the county's online map (GIS).`,
    `Our free lookup reads the county's and FEMA's public maps for one address. Its card opens that parcel's deed record and tax bill.`,
  ],
  sections: [
    { h2: "Your mail says Myrtle Beach. The city line may not.", id: "city-line", html: () =>
      h.p(`About ${MB_OUT_IN4} in 4 street addresses that say "Myrtle Beach" are outside the City of Myrtle Beach. The city in a mailing address comes from the post office, not from the town line. Across Horry County, about ${OUT_IN10} in 10 street addresses are outside every city and town. We checked all ${n0(ALL)} points on the county's address map against the town limits.`)
      + CHART
      + h.p(`The line matters when you buy. Inside a town, the town's zoning applies. Outside, the county's does${live(GISP) ? `: see ${h.a(GISP + "#zoning", "what the county's zoning codes mean")}` : ""}.`)
      + `<p class="pr-quiet">Not sure which side an address is on? ${h.a("#lookup", "Look it up")}: the card's Town line says.</p>` },

    { h2: "Where are Horry County property records kept?", toc: "Where records are", id: "where", html: (bg) =>
      h.p(`Each county office keeps its own records, and each has its own search.`)
      + table(["What you want", "Where Horry County keeps it", "Our guide"], [
        ["The deed, a mortgage, a lien or a plat (a surveyor's drawing of the lots)", "The Register of Deeds. Its index is online; the documents are not.", sib(DEEDS, "Horry County land records")],
        ["The lot lines, zoning code and aerial photos", "The county's online map, after you sign in with a county account", sib(GISP, "Horry County GIS map")],
        ["The tax bill, or paying it", "The Treasurer's tax search, with no sign-in", sib(TAXP, "Horry County tax bills")],
        ["The flood zone and what it means", "FEMA's flood map. Our lookup reads it for any Horry County address.", live(FLOODP) ? h.a(FLOODP, "Flood zone check") : h.a("/buyers/undisclosed-flooding/", "Did this house flood?")],
        ["What the home would sell for", "Not a county record", h.a("/sell/home-value/", "What homes sold for, by area")],
      ])
      + JC_PHOTO
      + h.p(`Looking for the property appraiser? Horry County calls that office the Assessor. The Assessor values property, the Auditor bills the tax and the Treasurer collects it.`)
      + h.cta("Skip the three county websites.", "Comparing a few homes? An agent gathers the county records for each one and tells you what stands out, free.", "Let us make it simple", LEAD, bg) },

    { h2: "Can you search Horry County property records by name?", toc: "Search by name", id: "by-name", html: () =>
      h.p(`Yes, in two county searches. Both ask for the last name first.`)
      + `<ul class="pr-list">`
      + `<li><strong>The deed index at the Register of Deeds.</strong> It is free and needs no account. Our ${sib(DEEDS, "deed search guide")} shows the steps.</li>`
      + `<li><strong>The Treasurer's tax search.</strong> It also finds a bill by parcel number or notice number. Our ${sib(TAXP, "tax bill guide")} shows the steps.</li>`
      + `</ul>`
      + h.p(`The county's map searches by owner too, after you sign in with a county account. Our lookup works by address only and shows no names.`) },

    { h2: "What do Horry County property records not show?", toc: "What records leave out", id: "not-shown", html: (bg) =>
      h.p(`Four things a buyer needs to know are not in the deed index, the tax bill or the county map.`)
      + `<ul class="pr-list">`
      + `<li><strong>Unpaid HOA charges.</strong> A condo buyer and the seller can both owe the seller's unpaid HOA charges, up to the amount in the statement the association must give on request. Our agents check the balance before closing, and an unpaid fee is usually paid from the seller's proceeds. See ${h.a("/hoa/estoppel-and-transfer-fees/", "HOA statements and transfer fees")}.</li>`
      + `<li><strong>Rental rules.</strong> Whether a home can be rented by the night depends on the town and the HOA, not on the deed or the tax bill. See ${h.a("/invest/str-rules/", "the Myrtle Beach short-term rental rules")} and ${h.a("/hoa/rental-restrictions/", "HOA rental restrictions")}.</li>`
      + `<li><strong>The cost of insurance.</strong> It is not a county record. See ${h.a("/buyers/coastal-insurance/", "what coastal home insurance costs")}.</li>`
      + `<li><strong>Your own tax bill.</strong> Last year's bill can be the seller's, figured at the 4% ratio. Yours is figured at 4% if it is your legal residence, which you apply for, and at 6% if not. See ${h.a("/buyers/property-taxes/", "Horry County property taxes")}.</li>`
      + `</ul>`
      + h.cta("Have us check what the records leave out.", "Before you make an offer, we check the HOA balance, the rental rules and the tax for that home, free.", "Have us check the home", LEAD, bg) },

    { h2: "Pawleys Island and Litchfield: Georgetown County records", toc: "Georgetown County", id: "georgetown", html: () =>
      h.p(`Pawleys Island and Litchfield Beach are in Georgetown County, so their records are Georgetown's. Our lookup reads Horry County's maps only.`)
      + `<ul class="pr-list">`
      + `<li><strong>The map:</strong> Georgetown's ${h.ext(GT_MAP, "online map")} opens with no sign-in. It searches by tax map number, address or road, not by owner.</li>`
      + `<li><strong>Deeds:</strong> ${h.ext(GT_DEEDS, "georgetowndeeds.com")} shows document images online when it has them.</li>`
      + `<li><strong>Tax bills:</strong> ${h.ext(GT_TAX, "georgetowncountysctax.com")}.</li>`
      + `</ul>`
      /* The place's one wow line, beside its homes (Pawleys ledger, batch 2026-11-a, rows 2 and 3, the town's own words). */
      + h.p(`${h.a("/submarkets/pawleys-island/", "Pawleys Island")} itself is less than 4 miles long and mostly one house wide, with a salt marsh between it and the mainland. The island and most of the land around it share ZIP code 29585, so a Pawleys Island address does not always mean a house on the island.`)
      + PAWLEYS_STRIP },
  ],
  faqTitle: "Horry County property records questions",
  faq: [
    { q: "How do I find the owner of a property in Horry County?", a: "Look up the address, then tap Deed record on the card. The county's deed record names the parties to that deed. The Treasurer's tax search, behind the Tax bill button, also shows the owner's name." },
    { q: "Why can't the lookup find my address?", a: "Type the house number and the street, then pick a suggestion. Without a house number, the county's address finder can match only the street, so the card cannot name a parcel." },
    { q: "Why does a condo building show many parcel numbers?", a: "Each unit in the building has its own parcel number, drawn on the building's outline. Send us the unit number and we find the right one." },
    { q: "What is my hurricane evacuation zone?", a: `Type the address in the lookup. The card's Hurricane line gives zone A, B or C, or none. About 1 in 3 street addresses in Horry County is in a zone.` },
    { q: "Who answers flood map questions in Horry County?", a: "Horry County Code Enforcement has 12 certified floodplain managers on staff. To reach one, call its flood office at (843) 915-5090." },
  ],
  sources: [
    { name: "Horry County address finder", href: LOCATOR },
    { name: "Horry County open data", href: OPENDATA },
    { name: "FEMA flood hazard layer", href: NFHL },
    { name: "44 CFR 64.3", href: CFR64 },
    { name: "42 U.S.C. 4012a", href: USC4012A },
    { name: "Horry County Flood News", href: FLOODNEWS },
    { name: "Georgetown County map", href: GT_MAP },
  ],
  sourcesNote: `Our counts: all ${n0(ALL)} points on Horry County's address map, placed inside or outside each town's limits and evacuation zone. One point is one street address; a condo building can be one point. Not legal advice.`,
  afterSources: () => CREDITS + PH.imageSchema([JC_REC]),
  bottomCta: END,
  keywords: "horry county property records, horry county property lookup, horry county property search, horry county property records search, horry county property search by address, horry county property records by address, horry county property search by name, horry county property information, myrtle beach property records, horry county public records property search, pawleys island property records",
  about: "Property records for Horry County, South Carolina, and a free lookup by address",
});
