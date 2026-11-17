/* /submarkets/myrtle-beach/golf-and-yacht-club/ - Myrtle Beach Golf and Yacht Club: 468 small houses outside any city,
 * what is for sale now, what 31 houses sold for in a year, the HOA question, the flood zone, and what the name does
 * not promise.
 *
 * Batch 2026-11-f, Lane N (new page), in the Plantation Point and Wild Wing shape (specs/plantation-point.js).
 * Facts: Blog-Brain batches/2026-11-f/myrtle-beach-golf-and-yacht-club/facts.md, VERIFIED rows, and CORRECTED rows at
 * the verifier's wording only (VERIFY.md). Row 8 is STRUCK (the "no golf course" claim: Racoon Run is a golf property
 * about 0.75 mile away), so the wow factor is the plan's fallback: rows 9, 10 and 11. Nothing says there is no course,
 * and nothing says there is a club, a marina or a yacht facility. Not used: row 12 (a competitor's volume), row 13's
 * drive times and "near SC 544", "Socastee" (row 13 verified the zip only), "waterfront", "alligator".
 * Row 10 wording: "recorded sales at a stated price", 31 deeds over $10,000 on 31 house parcels; 35 more deeds on
 * these parcels state $0 and are left out.
 * Data: data/2026-11-f/myrtle-beach-golf-and-yacht-club/ (findings.json, parcels.json, listings.json, flood.json).
 * Pictures: one USDA NAIP aerial (public domain) and one map we drew from the county's parcels.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/golf-and-yacht-club/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "myrtle-beach-golf-and-yacht-club");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), PAR = read("parcels.json"), FL = read("flood.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const usd = (v) => "$" + n(v);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);   // body prose is rounded (P1); the table keeps exact figures
const k = (v) => "$" + Math.round(v / 1000) + "K";   // hero tile only, so it fits 320 px
const must = (ok, msg) => { if (!ok) throw new Error(`myrtle-beach-golf-and-yacht-club.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 1 and 4 (VERIFIED): the nine houses for sale. */
const ROWS = L["Myrtle Beach Golf & Yacht"].rows;
const prices = ROWS.map((r) => r.listPrice).sort((a, b) => a - b);
must(ROWS.length === 9 && ROWS.every((r) => r.type === "Detached" && r.zip === "29588"), "row 1 changed");
must(prices[0] === 120000 && prices[8] === 279900 && prices[4] === 235000, "row 4 prices changed");
must(Math.min(...ROWS.map((r) => r.beds)) === 2 && Math.max(...ROWS.map((r) => r.beds)) === 3, "row 4 beds changed");
must(Math.min(...ROWS.map((r) => r.sqft)) === 828 && Math.max(...ROWS.map((r) => r.sqft)) === 1519, "row 4 sqft changed");
must(Math.min(...ROWS.map((r) => r.yearBuilt)) === 1985 && Math.max(...ROWS.map((r) => r.yearBuilt)) === 2003, "row 4 years changed");
/* Row 3 (VERIFIED): the second MLS name, two newer houses, HOA $85, 4 bedrooms, built 2026. */
const SP = L["Sandpiper Place - MB Golf & Yacht"].rows;
must(SP.length === 2 && SP.every((r) => r.hoaMonthly === 85 && r.beds === 4 && r.yearBuilt === 2026), "row 3 changed");
/* Row 6 (VERIFIED as a listing field): $95 on 8, $90 on 1. */
must(ROWS.filter((r) => r.hoaMonthly === 95).length === 8 && ROWS.filter((r) => r.hoaMonthly === 90).length === 1, "row 6 changed");
/* Row 5 (VERIFIED): lots about 0.13 acre; the nine listings say 0.12 to 0.18. */
must(Math.min(...ROWS.map((r) => r.lotAcres)) === 0.12 && Math.max(...ROWS.map((r) => r.lotAcres)) === 0.18, "row 5 listings changed");
/* Row 7 (VERIFIED): 468 houses. */
must(F.houses === 468 && F.parcels === 472, "row 7 changed");
/* Row 10 (CORRECTED wording): 31 recorded sales at a stated price, $160,000 to $308,000, middle $229,900. */
const SA = F.house_sales;
must(SA.count === 31 && SA.prices.median === 229900 && SA.prices.min === 160000 && SA.prices.max === 308000 && SA.prices.q1 === 205000 && SA.prices.q3 === 270000, "row 10 changed");
must(Object.values(SA.by_month).reduce((a, b) => a + b, 0) === 31 && SA.by_month["2026/04"] === 6, "row 10 months changed");
/* Row 11 (VERIFIED): the asking middle is $5,100 above the recorded middle. */
must(235000 - SA.prices.median === 5100, "row 11 changed");
/* Row 5: the county outlines. */
const areas = PAR.parcels.filter((p) => ["110", "101"].includes(p.luc) && p.imprv > 0).map((p) => p.area_ft2).sort((a, b) => a - b);
must(areas.length === 468 && Math.round(areas[234] / 100) * 100 === 5600 || Math.round((areas[233] + areas[234]) / 2) === 5647, "row 5 outline median changed");
/* Row 9 (VERIFIED): 468 of 468 house centers in the minimal-hazard zone. */
must(FL.houses_tested === 468 && FL.zones["outside mapped zones (zone X)"] === 468, "row 9 changed");
const COUNT_DAY = new Date(L["Myrtle Beach Golf & Yacht"].refreshedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the shared look of the neighborhood pages).    */

const INK = "#8a5226";
const C = { land: "#eef0e4", water: "#a9cfe3", waterEdge: "#7fb3cf", course: "#d3e6c4", courseEdge: "#b3d19c", lot: "#ffffff", lotEdge: "#b9b2a5", road: "#ffffff", roadEdge: "#9c9486", dot: "#7d8a98", common: "#c4783a", frame: "#1c2028" };
const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .pp-fig{margin:1.4rem 0 1.6rem;max-width:720px}
main#main .pp-fig figcaption{color:var(--muted);font-size:.92rem;line-height:1.55;margin-top:.6rem}
main#main .pp-frame{border-radius:14px;overflow:hidden;background:${C.land};border:1px solid rgba(28,32,40,.12)}
main#main .pp-frame svg{display:block;width:100%;height:auto}
main#main .pp-legend{list-style:none;margin:.8rem 0 0;padding:0;display:grid;gap:.4rem;font-size:1rem;color:var(--muted);line-height:1.4}
@media (min-width:700px){main#main .pp-legend{grid-template-columns:1fr 1fr;column-gap:1.5rem}}
main#main .pp-legend li{display:flex;gap:.6rem;align-items:center;margin:0}
main#main .pp-legend i{flex:none;display:inline-block;width:1.5rem;height:1rem;border-radius:3px;border:1px solid rgba(28,32,40,.25)}
/* Short facts: a plain list under thin rules, not cards. */
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
@media (min-width:700px){main#main .pp-rules:not(.one){grid-template-columns:1fr 1fr}}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
/* One block width: tables, the map, lists and offers are 720 px. */
main#main .c3-gchart,main#main div[style^="overflow-x:auto;margin:1.2rem 0"],main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-cmp th:not(:first-child),main#main .pp-cmp td:not(:first-child){white-space:nowrap}
@media (max-width:480px){main#main .pp-cmp th,main#main .pp-cmp td{padding:.5rem .4rem!important;font-size:.95rem}main#main .pp-cmp th:not(:first-child),main#main .pp-cmp td:not(:first-child){white-space:normal}}
@media (max-width:399px){main#main .pp-cmp>div{padding-left:8px!important;padding-right:8px!important}main#main .pp-cmp th,main#main .pp-cmp td{padding:.45rem .25rem!important;font-size:.9rem}main#main .pp-cmp th{text-transform:none!important;letter-spacing:0!important}}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
main#main .pp-quote{max-width:665px;margin:1.2rem 0 1.4rem;padding:.2rem 0 .2rem 1.1rem;border-left:3px solid var(--brass);color:var(--navy);font-family:var(--serif);font-size:1.2rem;line-height:1.5}
main#main .pp-quote span{display:block;font-family:var(--sans);font-size:.92rem;color:var(--muted);margin-top:.4rem}
/* The contents list: no card, plain columns between two thin rules. */
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
/* The hero's facts: a plain list under thin rules on a phone (as /submarkets/myrtle-beach/market-common/). */
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
@media (max-width:360px){main#main .detail-hero .c3-glance span.t{white-space:normal!important;text-align:right;min-width:0}main#main .detail-hero .c3-glance li>span:not(.i){min-width:0}main#main .detail-hero .c3-glance li{padding-right:0!important}}
/* The Landing's strip and its offer close the section. */
main#main .hx-strip:not(:empty){margin-top:1.2rem}
/* The end band (as /submarkets/myrtle-beach/market-common/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
main#main svg.pp-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:38px;stroke-width:9px}
main#main svg.pp-map text.sm{font-weight:600;font-size:32px}
@media (min-width:700px){main#main svg.pp-map text{font-size:23px;stroke-width:6px}main#main svg.pp-map text.sm{font-size:20px}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain).                              */

const AIR = PHOTOS.find((r) => r.file.includes("mbgyc-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Part of Myrtle Beach Golf and Yacht Club from the air" }]);

/* ---------------------------------------------------------------------------- */
/* Sales by month (row 10) and asking against sold (rows 4, 10, 11).               */

const MONTHS = [["2025/11", "November 2025"], ["2025/12", "December 2025"], ["2026/01", "January 2026"], ["2026/02", "February 2026"],
  ["2026/03", "March 2026"], ["2026/04", "April 2026"], ["2026/05", "May 2026"], ["2026/06", "June 2026"], ["2026/07", "July 2026"],
  ["2026/08", "August 2026"], ["2026/09", "September 2026"], ["2026/10", "October 2026"]];
const NB = "&nbsp;";
const CMP = `<div class="pp-cmp">` + h.table(["", "For sale now", "Recorded sales, past year"], [
  ["Houses", "9", "31"],
  ["Lowest", usd(prices[0]), usd(SA.prices.min)],
  ["Middle", usd(prices[4]), usd(SA.prices.median)],
  ["Highest", usd(prices[8]), usd(SA.prices.max)],
]) + `</div>`;

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer",
  naip: "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer",
};
const CONTACT = `/contact/?place=${encodeURIComponent("Myrtle Beach Golf and Yacht Club")}`;
const SEARCH = "subdivision=Myrtle+Beach+Golf+%26+Yacht&max=300000";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Myrtle Beach Golf and Yacht Club", alternateName: "Myrtle Beach Golf & Yacht",
  description: `A neighborhood of ${F.houses} houses in zip code 29588, in unincorporated Horry County with Myrtle Beach mailing addresses.`,
  geo: { "@type": "GeoCoordinates", latitude: 33.648, longitude: -79.049 },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29588", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Myrtle Beach Golf and Yacht Club Homes for Sale and Prices",
  description: "Myrtle Beach Golf and Yacht Club: the houses for sale now, what 31 houses sold for, the listed HOA fee and the flood zone, from county records.",
  ogTitle: "Myrtle Beach Golf and Yacht Club homes: 468 small houses, none in a high-risk flood zone",
  crumb: "Golf and Yacht Club",
  eyebrow: "Myrtle Beach Golf and Yacht Club",
  h1: "Myrtle Beach Golf and Yacht Club homes:",
  h1em: "468 houses, none in a high-risk flood zone.",
  sub: `The name says golf and a yacht club, but the county's records list two common-land parcels, A and B. No house here is in a FEMA high-risk flood zone.`,
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses", text: n(F.houses) },
    { icon: "dollar", label: "For sale now", text: `${k(prices[0])} to ${k(prices[8])}` },
    { icon: "calendar", label: "Recorded sales, past year", text: `${SA.count}, middle about ${r5k(SA.prices.median)}` },
    { icon: "flood", label: "FEMA high-risk zone", text: "None" },
  ]) + G.homesCss() + G.homesQScript() + G.homesQ(SEARCH, "Houses for sale in Myrtle Beach Golf and Yacht Club"),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Myrtle Beach Golf and Yacht Club is ${F.houses} houses on small lots in zip code 29588, in the Socastee area of Horry County, outside any city limits.`,
    `On ${COUNT_DAY}, nine houses were for sale, asking ${usd(prices[0])} to ${r5k(prices[8])}, and ${SA.count} houses had a recorded sale in the past year.`,
  ],
  sections: [
    { h2: "What is it like to live in Myrtle Beach Golf and Yacht Club?", toc: "Life here", id: "life", html: () =>
      h.p(`Houses here sit on small lots. The county's outlines give a typical lot of about 5,650 square feet, which is 0.13 acre. The aerial photo shows what that looks like: houses close together along curving streets.`) +
      AERIAL +
      h.p(`The nine houses for sale have 2 or 3 bedrooms and 828 to 1,519 square feet, with a middle of 1,300. They were built from 1985 to 2003. Our ${h.a("/buyers/affordable-places-to-live/", "affordable places to live guide")} compares other neighborhoods at these prices.`) +
      h.h3("Does it have a golf course or a yacht club?") +
      h.p(`The name says so, but it is a subdivision's name. We checked the county's records: they list the community's own common land as two parcels, A and B. `) +
      h.p(`Any golf course nearby is a separate property from the community. If a course, a club membership or a boat slip matters to you, tell us before you offer. We find out what the house you like comes with.`) },

    { h2: "How much do homes in Myrtle Beach Golf and Yacht Club cost?", toc: "Prices", id: "prices", html: (bg) =>
      h.p(`Nine houses are for sale now. They ask ${usd(prices[0])} to ${r5k(prices[8])}, and the middle asking price is ${usd(prices[4])}.`) +
      h.p(`In the past year ${SA.count} houses here had a recorded sale price. They sold for ${usd(SA.prices.min)} to ${r5k(SA.prices.max)}. The middle was about ${r5k(SA.prices.median)}, and half sold between ${usd(SA.prices.q1)} and ${usd(SA.prices.q3)}.`) +
      CMP +
      `<p class="pp-note">The middle asking price is ${usd(235000 - SA.prices.median)} above the middle sold price. The two columns count different groups: nine asking prices and ${SA.count} recorded sales. Asking prices: CCMLS listings, in aggregate. Sale prices: Horry County deeds recorded in the past 12 months, houses only. About 1 house in 15 had a priced deed. Deeds that state $0, such as transfers, are left out.</p>` +
      h.h3("When do houses sell here?") +
      h.p(`Sales came in every month but two. April was the busiest, with 6.`) +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) +
      h.cta("Own here? Ask what nearby houses sold for", "We pull the recorded sales near your house and write you a comparison. A person does it, not an automated value.", "Ask for a sold list", CONTACT, bg) },

    { h2: "What is the HOA fee in Myrtle Beach Golf and Yacht Club?", toc: "HOA", id: "hoa", html: () =>
      h.p(`Eight of the nine houses for sale list an HOA fee of $95 a month, and the ninth lists $90. The listing agent enters that fee, so we confirm it with the association before you offer.`) +
      `<ul class="pp-rules one" aria-label="What to ask for about the HOA">`
        + `<li><strong>The dues letter</strong>The association writes what the house owes and whether anything is unpaid. Our ${h.a("/hoa/estoppel-and-transfer-fees/", "HOA letter and transfer fees guide")} explains it.</li>`
        + `<li><strong>The recorded rules</strong>We read the recorded rules for the house you like, including any limit on renting.</li>`
        + `<li><strong>Special assessments</strong>We ask whether a one-time charge is planned. Our ${h.a("/hoa/special-assessments/", "special assessments guide")} covers it.</li>`
        + `</ul>` +
      h.p(`We have not read the association's documents, so this page does not say what the fee covers.`) },

    { h2: "Is Myrtle Beach Golf and Yacht Club in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`No house here is in a FEMA high-risk flood zone. We checked the center of every house lot against FEMA's map. All ${n(F.houses)} fall in the zone FEMA calls an "area of minimal flood hazard." FEMA's own map has the same zone at five points across the community.`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>Insurance</strong>A lender requires flood insurance in the high-risk zones. For a house outside them, the lender decides. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} covers what to ask.</li>`
        + `<li><strong>Flood history</strong>A zone does not show whether a house has flooded. We check each house's history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `</ul>` },

    { h2: "Is Myrtle Beach Golf and Yacht Club in the city of Myrtle Beach?", toc: "City limits", id: "city", html: () =>
      h.p(`No. The houses have a Myrtle Beach mailing address, but no city limits include them. The land is in Horry County, and every lot is in county tax district 630.`) +
      h.p(`Our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city's own neighborhoods and what changes inside its limits.`) },

    { h2: "What is Sandpiper Place?", toc: "Sandpiper Place", id: "sandpiper", html: () =>
      h.p(`Two newer houses are listed under a second name, Sandpiper Place, as part of Myrtle Beach Golf and Yacht Club. They have 4 bedrooms, were built in 2026 and list an HOA fee of $85 a month. They are not like the older houses above, so we count them apart.`) +
      /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/windsor-plantation/", "Windsor Plantation")} near Myrtle Beach, ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach. Then ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest, ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway and ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach. Then ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island and ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach.`) /* end sibling-links */ },
  ],
  faqTitle: "Myrtle Beach Golf and Yacht Club FAQ",
  faq: [
    { q: "Is there a golf course at Myrtle Beach Golf and Yacht Club?", a: "The name is a subdivision's name, and the county lists only common land. We cover it above, under \"Does it have a golf course or a yacht club?\"." },
    { q: "Is Myrtle Beach Golf and Yacht Club in the city of Myrtle Beach?", a: "No. It has a Myrtle Beach mailing address but sits in Horry County, outside any city limits." },
    { q: "How much is the HOA fee?", a: "Eight houses list $95 a month and one lists $90. We confirm the fee with the association." },
    { q: "Do I need flood insurance in Myrtle Beach Golf and Yacht Club?", a: "No house here is in a FEMA high-risk zone, so the lender decides, and the flood section above has the rest." },
    { q: "What do houses in Myrtle Beach Golf and Yacht Club sell for?", a: `${SA.count} houses had a recorded sale in the past year, with a middle of about ${r5k(SA.prices.median)}.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "NAIP aerial photos", href: SRC.naip },
  ],
  sourcesNote: "Our counts: county parcels, FEMA flood zones and the deed index. Listings: CCMLS, in aggregate.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in Myrtle Beach Golf and Yacht Club.",
    p: "Pick a house from the strip above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: "/contact/",
  },
  keywords: "Myrtle Beach Golf and Yacht Club, Myrtle Beach Golf and Yacht Club homes for sale, Myrtle Beach Golf and Yacht Club HOA, Myrtle Beach Golf & Yacht, Myrtle Beach Golf and Yacht Club flood zone, Sandpiper Place Myrtle Beach",
  about: "Myrtle Beach Golf and Yacht Club, a neighborhood of small houses in zip code 29588 in Horry County, South Carolina",
});
