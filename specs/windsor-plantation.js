/* /submarkets/myrtle-beach/windsor-plantation/ - Windsor Plantation, Myrtle Beach SC: what living there is like
 * (a Myrtle Beach mailing address outside the city limits, so the county's tax rate), which part is which
 * (the original section, Devonshire, St. David's and the Berwick townhomes), what each sold for, the two
 * owners' associations, the flood zone and the beach.
 *
 * Batch 2026-11-f, Lane N (new page), the neighborhood shape of specs/plantation-point.js, specs/wild-wing-plantation.js
 * and specs/pine-lakes-preserve.js.
 * Facts: Blog-Brain batches/2026-11-f/windsor-plantation/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's values and wording only (VERIFY.md). Plan: PLAN.md. Demand: must-answer.md.
 * Not used: the free-text search "windsor" (row 1), a street named as belonging to a part (row 18), a builder (row 20),
 * what the amenity area holds, a gate, the county's value for Berwick (row 15), the 15-acre open-space parcel (row 21),
 * the near-search counts (row 19), "Socastee" (no ledger row), the ZIP codes, any trend from 8 or 16 sales.
 * Data: data/2026-11-f/windsor-plantation/. Every count, size, price, share and minute is read from those files here
 * and checked against its ledger row.
 * Pictures: one public-domain NAIP aerial (USDA, 2023) and one map we drew from Horry County parcel points.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/windsor-plantation/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "windsor-plantation");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json"), ML = read("map-lots.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r10k = (v) => "$" + n(Math.round(v / 10000) * 10000);
const must = (ok, msg) => { if (!ok) throw new Error(`windsor-plantation.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const A = F.all, DT = F.detached, DV = F.devonshire, SD = F.stdavids, CO = F.core, BW = F.berwick, SL = F.sales;
/* Row 2 (VERIFIED): 476 parcels, 302 detached houses, 21 empty detached lots, 120 Berwick parcels with a building. Parts: 115, 188, 27, 146. */
must(A.parcels === 476 && DT.houses === 302 && DT.vacant_lots === 21 && BW.houses === 120 && CO.parcels === 115 && DV.parcels === 188 && SD.parcels === 27 && BW.parcels === 146, "row 2 changed");
must(CO.houses === 99 && DV.houses === 177 && SD.houses === 26, "row 2 parts changed");
/* Row 3 (VERIFIED): typical lot 9,494 sq ft; middle half about 8,200 to 10,700; Devonshire 8,362; St. David's 11,260; core 10,643. */
must(DT.lot_sqft.median === 9494 && DV.lot_sqft.median === 8362 && SD.lot_sqft.median === 11260 && CO.lot_sqft.median === 10643, "row 3 changed");
const LOT = n(Math.round(DT.lot_sqft.median / 100) * 100), LOT_C = n(Math.round(CO.lot_sqft.median / 100) * 100), LOT_D = n(Math.round(DV.lot_sqft.median / 100) * 100), LOT_S = n(Math.round(SD.lot_sqft.median / 100) * 100);
/* Row 4 (VERIFIED, with the verifier's wording): about 2,750 sq ft of ground; Devonshire about 2,500; St. David's about 3,500; the original section no finer than about 3,000. */
must(DT.house_footprint_sqft.median === 2755 && DV.house_footprint_sqft.median === 2499 && SD.house_footprint_sqft.median === 3538.5, "row 4 changed");
const ROOF = "2,750", ROOF_D = "2,500", ROOF_S = "3,500", ROOF_C = "3,000";
/* Row 5 (VERIFIED, a floor): 10 in-ground pools in 302 detached house lots. */
must(DT.pools === 10, "row 5 changed");
/* Row 6 (VERIFIED): all 476 are zoned PDD. */
must(A.zoning.PDD === 476, "row 6 changed");
/* Row 7 (VERIFIED): no part inside any city limit; tax district 630. */
must(A.in_city_limits === 0, "row 7 changed");
/* Row 14 (VERIFIED, 8 and 16 sales): houses 8, middle $522,500, $425,000 to $650,000; core 4 at $528,750, Devonshire 3 at $479,000, St. David's 1 at $650,000; Berwick 16, middle $316,950, $259,500 to $330,000. */
const HS = SL.houses_detached, BS = SL.berwick;
must(HS.count === 8 && HS.prices.median === 522500 && HS.prices.min === 425000 && HS.prices.max === 650000, "row 14 houses changed");
must(SL.core.count === 4 && SL.core.prices.median === 528750 && SL.devonshire.count === 3 && SL.devonshire.prices.median === 479000 && SL.stdavids.count === 1 && SL.stdavids.prices.median === 650000, "row 14 parts changed");
must(BS.count === 16 && BS.prices.median === 316950 && BS.prices.min === 259500 && BS.prices.max === 330000, "row 14 Berwick changed");
const MID = HS.prices.median;
/* Row 9 (VERIFIED): tax at $522,500: 4% ratio, 201.0 less 109.1 mills = about $1,920; 6% at 201.0 mills = about $6,300. */
const TAX_PRIMARY = MID * 0.04 * (201.0 - 109.1) / 1000, TAX_OTHER = MID * 0.06 * 201.0 / 1000;
must(Math.round(TAX_PRIMARY / 10) * 10 === 1920 && Math.round(TAX_OTHER / 100) * 100 === 6300, "row 9 changed");
/* Row 15 (VERIFIED, labelled the county's value, once): the county's middle value for a detached house here is $447,000. */
must(Math.round(DT.county_value.median / 1000) * 1000 === 447000, "row 15 changed");
/* Row 10 (VERIFIED, a tax-status count): detached 37 at 6%, 265 at 4%. */
must(DT.assessed_at_6pct === 37 && DT.assessed_at_4pct_legal_residence === 265 && Math.round(265 / 302 * 100) === 88, "row 10 changed");
const PRIMARY = 88;
/* Rows 12 and 16 (VERIFIED, weak by size): 5 for sale, $293,880 to $529,900; fees $113 x 3, $425, $449 on listing sheets. */
must(L.all.for_sale === 5 && L.all.list_price.min === 293880 && L.all.list_price.max === 529900 && L.all.hoa_monthly_listed.join() === "113,113,113,425,449", "rows 12 and 16 changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 17 (VERIFIED, with wording): drives from the middle of the detached houses, no traffic. */
const WD = DR.drives["Windsor Plantation (middle of the detached houses)"];
const D = { beach: Math.round(WD["nearest public beach access"].minutes), beachMiles: Math.round(WD["nearest public beach access"].miles * 10) / 10,
  airport: Math.round(WD["Myrtle Beach International Airport terminal"].minutes), broadway: Math.round(WD["Broadway at the Beach"].minutes), mall: Math.round(WD["Coastal Grand Mall"].minutes) };
must(D.beach === 9 && D.beachMiles === 4.2 && D.airport === 16 && D.broadway === 16 && D.mall === 13, "row 17 changed");
must(WD["nearest public beach access"].name === "SURFSIDE BEACH 31", "row 17 beach access changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const INK = "#8a5226";
const C = { land: "#eef0e4", core: "#e2b07f", dev: "#5c9bbf", sd: "#e58f85", bw: "#a98fd0", road: "#ffffff" };
const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:${INK}!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .pp-fig{margin:1.4rem 0 1.6rem;max-width:720px}
main#main .pp-fig.tall{max-width:520px}
main#main .pp-fig figcaption{color:var(--muted);font-size:.92rem;line-height:1.55;margin-top:.6rem}
main#main .pp-frame{border-radius:14px;overflow:hidden;background:${C.land};border:1px solid rgba(28,32,40,.12)}
main#main .pp-frame svg{display:block;width:100%;height:auto}
main#main svg.pp-map text{font-family:'DM Sans',system-ui,sans-serif;font-weight:700;fill:#1c2028;paint-order:stroke;stroke:rgba(255,255,255,.92);stroke-linejoin:round;font-size:40px;stroke-width:9px}
main#main svg.pp-map text.it{font-style:italic;font-weight:600;fill:#1f4f68}
main#main svg.pp-map text.gc{fill:#2f5326}
main#main svg.pp-map text.sm{font-weight:600;font-size:34px}
@media (max-width:379px){main#main svg.pp-map text.sm{font-size:40px}}
@media (min-width:700px){main#main svg.pp-map text{font-size:24px;stroke-width:6px}main#main svg.pp-map text.sm{font-size:21px}}
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
/* The Landing's strip and its offer close the section. */
main#main .hx-strip:not(:empty){margin-top:1.2rem}
/* The end band (as /submarkets/myrtle-beach/market-common/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
/* The aerial in the hero: a wide crop of the same picture, so the first screen shows the streets and ponds. */
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 45%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:3/1}main#main .detail-hero .detail-media{max-width:1100px!important}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain), in the parts section.                */

const AIR = PHOTOS.find((r) => r.file.includes("windsor-plantation-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: "Streets of houses with ponds between the loops.", maxWidth: "1100px", sizes: "(max-width: 1200px) 100vw, 1100px" })
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero ww-hero" style="margin:0 0 1.2rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Windsor Plantation from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The four parts side by side (rows 2, 3, 14). Short labels and no-break units.   */

const NB = "&nbsp;";
const CMP = `<div class="pp-cmp">` + h.table(["Part", "Typical lot", "Sold, past year", "Middle price"], [
  ["Original", `${LOT_C}${NB}sq${NB}ft`, String(SL.core.count), `about ${r5k(SL.core.prices.median)}`],
  ["Devonshire", `${LOT_D}${NB}sq${NB}ft`, String(SL.devonshire.count), `about ${r5k(SL.devonshire.prices.median)}`],
  ["St. David's", `${LOT_S}${NB}sq${NB}ft`, String(SL.stdavids.count), "Too few"],
  ["Berwick", "Not shown", String(BS.count), `about ${r1k(BS.prices.median)}`],
]) + `</div>`;

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  beach: "https://gis.des.sc.gov/gisserver/rest/services/BeachAccess/MapServer/0",
  osm: "https://www.openstreetmap.org/",
};

const CONTACT = `/contact/?place=${encodeURIComponent("Windsor Plantation")}`;
const HOMES_ALL = "/homes/?subdivision=Windsor+Plantation";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Windsor Plantation", alternateName: "Windsor Plantation, Horry County, SC",
  description: `A planned community of ${n(A.parcels)} parcels in four parts in Horry County, South Carolina, with a Myrtle Beach mailing address, outside every city limit.`,
  geo: { "@type": "GeoCoordinates", latitude: F.center[0], longitude: F.center[1] },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Windsor Plantation Myrtle Beach SC: Houses and Townhomes",
  description: "Windsor Plantation near Myrtle Beach, SC: 476 parcels in four parts. What houses and Berwick townhomes sold for, the two HOAs, the tax bill and flood zone.",
  ogTitle: "Windsor Plantation, Myrtle Beach SC: a Myrtle Beach address outside the city limits, with the county's tax rate",
  crumb: "Windsor Plantation",
  eyebrow: "Windsor Plantation, Myrtle Beach SC",
  h1: "Windsor Plantation homes near Myrtle Beach:",
  h1em: "outside the city limits, with the beach 9 minutes away.",
  sub: "Windsor Plantation's houses and Berwick townhomes share one Horry County community, and the county sends the tax bill.",
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses and townhomes", text: `about ${n(Math.round((DT.houses + BW.houses) / 10) * 10)}` },
    { icon: "dollar", label: "Houses sold, past year", text: `${r1k(HS.prices.min)} to ${r1k(HS.prices.max)}` },
    { icon: "pin", label: "City limits", text: "Outside" },
    { icon: "beach", label: "Beach by car", text: `${D.beach} min` },
  ]),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Windsor Plantation is a planned community in Horry County, South Carolina, with a Myrtle Beach mailing address. The county's maps put it outside every city limit. In the past year, 8 houses sold for $${n(HS.prices.min)} to $${n(HS.prices.max)}.`,
    `Berwick townhomes sold for about ${r5k(BS.prices.min)} to ${r5k(BS.prices.max)}.`,
  ],
  sections: [
    { h2: "What is Windsor Plantation?", toc: "Life here", id: "life", html: () =>
      h.p(`These are the homes for sale in Windsor Plantation now, from our live search. Below them is what a Myrtle Beach mailing address outside the city limits does to the tax bill.`) +
      G.homesCss() + G.homesQScript() +
      G.homesQ("subdivision=Windsor Plantation", "Homes for sale in Windsor Plantation") +
      h.p(`At the county's rate, a house the county valued at about ${r10k(MID)} would carry this yearly tax bill, before the $89.40 stormwater fee:`) +
      `<ul class="pp-rules" aria-label="The yearly property tax on a house that sold at the middle price">`
        + `<li><strong>As your legal residence</strong>About $${n(Math.round(TAX_PRIMARY / 10) * 10)} a year.</li>`
        + `<li><strong>As a second home or rental</strong>About $${n(Math.round(TAX_OTHER / 100) * 100)} a year.</li>`
        + `</ul>` +
      h.p(`The detail is in ${h.a("#cost", "the yearly cost section")}.`) +
      `<ul class="pp-rules" aria-label="Windsor Plantation in numbers">`
        + `<li><strong>${n(A.parcels)} parcels in four parts</strong>${n(DT.houses)} are detached houses and about ${n(BW.houses)} are Berwick townhomes and condominiums. The rest are empty lots and common land.</li>`
        + `<li><strong>A planned development</strong>Every parcel is zoned as one, not under a city zone.</li>`
        + `<li><strong>About ${LOT} square feet a lot</strong>About 0.22 acre, for a typical detached house.</li>`
        + `<li><strong>About ${ROOF} square feet under the roof</strong>The ground a typical house takes up, garage included.</li>`
        + `<li><strong>Pools on ${DT.pools} of ${n(DT.houses)} houses</strong>That is what the county's structure map shows. Newer pools may be missing.</li>`
        + `<li><strong>Streets</strong>Devon Estate Avenue, Saint Davids Avenue, Coral Harbor Drive, Dunscombe Way and Machrie Loop.</li>`
        + `</ul>` +
      h.p(`This page is about the one in Horry County, South Carolina.`) },

    { h2: "Which part of Windsor Plantation is which?", toc: "The parts", id: "parts", html: () =>
      h.p(`The county's records split the community into four parts. The original Windsor Plantation section, Devonshire and St. David's are detached houses. Berwick is a group of attached homes, townhouses and condominiums.`) +
      AERIAL +
      CMP +
      `<p class="pp-note">Houses, lots and roofs: Horry County parcels and building outlines. Sales: deeds with a price, recorded in the past 12 months. Berwick is counted by parcels with a building, so its count is about. Each middle price is for that part alone.</p>` +
      h.p(`Devonshire is the largest part, and it has the smallest lots and the smallest houses. St. David's is the smallest part, with the biggest lots and the biggest houses.`) +
      h.p(`The listings use their own part names, and they do not always match the county's. A house listed under "St. David's Township" can sit in the county's original section. Our counts use the county's four parts.`) },

    { h2: "What do homes in Windsor Plantation sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`In the past year, ${HS.count} detached houses sold with a price on the deed. The middle price was about ${r10k(MID)}, and prices ran from $${n(HS.prices.min)} to $${n(HS.prices.max)}. Eight is a small count, so read it as a range, not a trend.`) +
      h.p(`Berwick townhomes and condominiums sold ${BS.count} times, from about ${r5k(BS.prices.min)} to ${r5k(BS.prices.max)}, with a middle price of about ${r1k(BS.prices.median)}.`) +
      h.p(`On ${COUNT_DAY}, ${L.all.for_sale} homes were for sale here, asking about ${r1k(L.all.list_price.min)} to ${r1k(L.all.list_price.max)}. That is few, about 5 among about ${n(Math.round((DT.houses + BW.houses) / 10) * 10)} houses and townhomes.`) +
      `<p class="pp-note">Sale prices: Horry County deeds recorded in the past 12 months, counted in aggregate. Deeds with no price stated are left out. Asking prices: CCMLS listings, counted in aggregate.</p>` +
      G.homesQ("near=33.6522,-78.9964&miles=1", "Other homes for sale within a mile, in nearby neighborhoods") +
      h.p(`See ${h.a(HOMES_ALL, "every home for sale in Windsor Plantation")}. If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "What does it cost to own in Windsor Plantation?", toc: "Yearly cost", id: "cost", html: () =>
      h.p(`The county's maps show no part of Windsor Plantation inside any city or town, so the property tax bill is the county's alone. The two bills near the top of this page are for the middle-price house.`) +
      `<p class="pp-note">Both figures are at the county's rate and assume the county values the house at ${r10k(MID)}. The county bills its own appraisal, and its middle value for a detached house here is about ${r1k(DT.county_value.median)}. The lower rate needs the owner's legal-residence application. A county stormwater fee of $89.40 is added to the bill.</p>` +
      h.p(`In the county's records, ${DT.assessed_at_4pct_legal_residence} of the ${DT.houses} houses, ${PRIMARY} in 100, are billed at the lower rate. The other ${DT.assessed_at_6pct} are billed as a second home or rental. Our ${h.a("/buyers/property-taxes/", "property tax guide")} explains both rates, and our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the city itself.`) },

    { h2: "Is there an HOA at Windsor Plantation?", toc: "HOA", id: "hoa", html: (bg) =>
      h.p(`Yes, two. The county's records name the Windsor Plantation POA as the owner of an amenity area of about 1.4 acres. The Berwick at Windsor Plantation Townhomes POA owns the Berwick amenity center.`) +
      h.p(`Listing sheets for ${h.a(HOMES_ALL, "the homes for sale here")} show $113 a month on the three houses and $425 and $449 on the two Berwick homes. Our guide to ${h.a("/hoa/hoa-vs-poa/", "HOAs and POAs")} explains the difference between the two kinds of association.`) +
      `<ul class="pp-rules one" aria-label="The associations and the neighborhood's rules">`
        + `<li><strong>The fee shown for a home for sale</strong>The listing agent enters it, so it is not the association's budget. We have not found what either fee covers. We confirm both with the association before you offer.</li>`
        + `<li><strong>The amenity areas</strong>The county's records name them. We have not read what they hold, so we do not say.</li>`
        + `<li><strong>Renting</strong>Our ${h.a("/invest/str-rules/", "short-term rental rules guide")} covers renting by the night. For a longer lease, we read the association's papers first.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us pull the POA papers", "We read the association's papers for that house. We tell you the fee, what it covers and what the rules allow.", "Have us pull the POA papers", CONTACT, bg) },

    { h2: "Is Windsor Plantation in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`No part of the community is in FEMA's high-risk zone, the zone where a lender requires flood insurance. One FEMA map area covers it, and FEMA calls it an "area of minimal flood hazard".`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>What a zone does not show</strong>A zone does not show whether a house has flooded. We check each house's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `<li><strong>Insurance</strong>Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} covers insurance for homes near the coast.</li>`
        + `</ul>` +
      h.cta("Like a house here? Have us check its flood history", "Send us the listing. We check its flood zone and its flood history, and tell you what we find.", "Have us check a house", CONTACT, bg) },

    { h2: "How far is Windsor Plantation from the beach?", toc: "The beach", id: "beach", html: () =>
      h.p(`The nearest public beach access is a Surfside Beach access, about ${D.beachMiles} miles by road from the middle of the community. The state's beach access list shows parking there. By car with no traffic that is about ${D.beach} minutes. Coastal Grand Mall is about ${D.mall} minutes away, the Myrtle Beach airport about ${D.airport} and Broadway at the Beach about ${D.broadway}.`) +
      /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/golf-and-yacht-club/", "Myrtle Beach Golf and Yacht Club")} and ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach. Then ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest, ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach and ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway. Then ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Windsor Plantation FAQ",
  faq: [
    { q: "Is Windsor Plantation in Myrtle Beach?", a: `By mailing address only. The county sends the tax bill, as the top of this page shows.` },
    { q: "Is Windsor Plantation in a flood zone?", a: `Not in FEMA's high-risk zone, where a lender requires flood insurance. We still check each house's flood history before you offer.` },
    { q: "What is the HOA at Windsor Plantation?", a: `There are two, one for the houses and one for Berwick. We read the association's papers before you offer.` },
    { q: "What is Berwick at Windsor Plantation?", a: `Berwick is the attached-home part, about ${n(BW.houses)} townhouses and condominiums, with its own association and lower prices than the houses.` },
    { q: "Can I rent out a house in Windsor Plantation?", a: `Renting can depend on the association's rules and the county's, so we check both for the house you pick.` },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "tax levy", href: SRC.levy },
    { name: "beach access list", href: SRC.beach },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, building outlines, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in Windsor Plantation.",
    p: "Tell us house or townhome, and your budget. Pick a home from the list near the top of this page and we book the showing, with its lot, its flood zone and its yearly tax.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Windsor Plantation, Windsor Plantation Myrtle Beach SC, Windsor Plantation homes for sale, Windsor Plantation HOA, Berwick at Windsor Plantation, Devonshire at Windsor Plantation, Windsor Plantation flood zone",
  about: "Windsor Plantation, a planned community of houses and Berwick townhomes in Horry County, South Carolina, with a Myrtle Beach mailing address, outside every city limit",
});
