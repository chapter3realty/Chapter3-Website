/* /submarkets/myrtle-beach/grande-dunes/ - Grande Dunes, Myrtle Beach: the private Ocean Club, the public marina and the
 * two golf courses, which of the 20 neighborhoods is in which city, what homes sell for and what the tax is, the HOA fee
 * by neighborhood, and the flood zone.
 *
 * Batch 2026-11-e, fix round 1 for the "Grande Dunes Ocean Club" slot. The reviewer found no page: the slot had been
 * stopped because the Ocean Club is a private beach club, not a building, and no home is filed under its name. This
 * page is the option the stop note gave the owner first: the neighborhood page, with the club as a section and the strip
 * on subdivision=Grande Dunes. Built in the shape of /submarkets/myrtle-beach/plantation-point/ (specs/plantation-point.js).
 * Facts: Blog-Brain batches/2026-11-e/grande-dunes-ocean-club/facts.md, rows marked VERIFIED, VERIFIED-BY-FIXER or CORRECTED.
 * Data: data/2026-11-e/grande-dunes-ocean-club/ (findings.json, listings.json, drives.json, map-layers.json, photos.json).
 * Every count, price, share and minute is read from those files here and checked with must().
 * Not used: the club's fee (not published on its public pages), any claim that all Grande Dunes homes include membership
 * (the association says "homeowner"; dues differ by neighborhood), builder prices, "gated" for the whole community.
 * Built by tools/mkpage.js (with the preload that points the website's older glass.js at Blog-Brain's). */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/grande-dunes/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "grande-dunes-ocean-club");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), L = read("listings.json"), DR = read("drives.json");
const PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + n(Math.round(v / 1000) * 1000);
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r100 = (v) => "$" + n(Math.round(v / 100) * 100);
const mil = (v) => "$" + (Math.round(v / 10000) / 100).toString() + " million";
const must = (ok, msg) => { if (!ok) throw new Error(`grande-dunes.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row (facts.md).                   */

/* Rows 20 and 21: the county's parcels that name Grande Dunes: 633 homes, 246 inside Myrtle Beach and 387 inside North Myrtle Beach. */
must(F.homes === 633 && F.town["MYRTLE BEACH"] === 246 && F.town["NORTH MYRTLE BEACH"] === 387, "rows 20 and 21 changed");
/* Row 22: 392 of the 633 taxed as a primary residence. */
must(F.assessed_at_4pct_legal_residence === 392 && F.assessed_at_6pct === 241, "row 22 changed");
const PRIMARY = Math.round(F.assessed_at_4pct_legal_residence / F.homes * 100);
must(PRIMARY === 62, "row 22 share changed");
/* Row 23: sales in the past 12 months. */
const SA = F.sales, SMB = SA.by_town["MYRTLE BEACH"], SNM = SA.by_town["NORTH MYRTLE BEACH"];
must(SA.all.n === 127 && SMB.n === 48 && SMB.median === 678500 && SMB.min === 530000 && SMB.max === 1845000, "row 23 (Myrtle Beach part) changed");
must(SNM.n === 79 && SNM.median === 365000 && SNM.min === 299990 && SNM.max === 714090, "row 23 (North Myrtle Beach part) changed");
/* Row 24: flood. */
must(F.flood_zone_at_inside_point.X === 633 && F.homes_touching_high_risk === 39, "row 24 changed");
/* Row 25: listings (CCMLS, aggregate). */
must(L.all.built_2024_or_later === 52 && L.all.n === 119 && L.all.price.median === 720000 && L.all.price.min === 219900 && L.all.price.max === 6700000, "row 25 changed");
const T = L.types;
must(T.Detached.n === 82 && T.Townhouse.n === 13 && T["Semi Detached"].n === 7 && T.Condominium.n === 17, "row 25 types changed");
must(T.Detached.price.median === 877450 && T.Townhouse.price.median === 649990 && T["Semi Detached"].price.median === 459900 && T.Condominium.price.median === 415000, "row 25 type prices changed");
/* Row 26: listed monthly fees. */
must(L.all.hoa.median === 370 && T.Detached.hoa.median === 344 && T.Townhouse.hoa.median === 325 && T["Semi Detached"].hoa.median === 438 && T.Condominium.hoa.median === 1600 && T.Condominium.hoa.min === 980 && T.Condominium.hoa.max === 3447, "row 26 changed");
/* Row 27: the North Village listings. */
const SUBS = L.subdivisions;
const NV = SUBS["Grande Dunes - North Village"];
must(NV.n === 9 && L.cities_zips.some(([k, v]) => k[0] === "Longs" && v === 9), "row 27 changed");
const COUNT_DAY = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
/* Row 28: tax. 2026 levy: county 52.1 + school 119.1 + city (Myrtle Beach 83.4, North Myrtle Beach 50.0), school operations 109.1 off for a legal residence,
   Myrtle Beach less 53.4 percent of its city mills (the site's tax model, specs/relocating-which-town.js row 10); a second home pays 6 percent of the full stack. */
const RATE_MB = 403.8, RATE_NM = 448.4;                                                       // per $100,000, as your home (row 10 there)
must(Math.abs(0.04 * (52.1 + 119.1 - 109.1 + 83.4 * (1 - 0.534)) * 100000 / 1000 - RATE_MB) < 0.5 && Math.abs(0.04 * (52.1 + 119.1 + 50.0 - 109.1) * 100 - RATE_NM) < 0.5, "row 28 rates changed");
const OTH_MB = 0.06 * (52.1 + 119.1 + 83.4) / 1000, OTH_NM = 0.06 * (52.1 + 119.1 + 50.0) / 1000;
const TAX = { mbP: SMB.median * RATE_MB / 100000, mbO: SMB.median * OTH_MB, nmP: SNM.median * RATE_NM / 100000, nmO: SNM.median * OTH_NM };
must(Math.round(TAX.mbP / 100) * 100 === 2700 && Math.round(TAX.mbO / 100) * 100 === 10400 && Math.round(TAX.nmP / 100) * 100 === 1600 && Math.round(TAX.nmO / 100) * 100 === 4800, "row 28 dollars changed");
/* Rows 29 and 30: drives, no traffic. Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const mins = (m) => (m < 15 ? Math.round(m) : Math.round(m / 5) * 5);
const MB = DR.drives["Grande Dunes, Myrtle Beach part (middle)"], NM = DR.drives["Grande Dunes North, North Myrtle Beach part (middle)"];
const D = {
  marina: mins(MB["Grande Dunes Marina"].minutes), club: mins(MB["Grande Dunes Ocean Club (101 Grande Dunes Blvd)"].minutes),
  hosp: mins(MB["Grand Strand Medical Center"].minutes), beach: mins(MB["nearest public beach access"].minutes), beachMiles: Math.round(MB["nearest public beach access"].miles * 10) / 10,
  walk: Math.round(MB["walk to that access"].minutes / 5) * 5, broadway: mins(MB["Broadway at the Beach"].minutes), mall: mins(MB["Coastal Grand Mall"].minutes),
  airport: mins(MB["Myrtle Beach International Airport terminal"].minutes), nClub: mins(NM["Grande Dunes Ocean Club (101 Grande Dunes Blvd)"].minutes), nMarina: mins(NM["Grande Dunes Marina"].minutes),
};
must(D.marina === 2 && D.club === 5 && D.hosp === 4 && D.beach === 4 && D.beachMiles === 1.8 && D.walk === 35 && D.broadway === 10 && D.mall === 14 && D.airport === 20 && D.nClub === 15 && D.nMarina === 15, "rows 29 and 30 changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const INK = "#8a5226";
const C = { land: "#eef0e4", water: "#a9cfe3", waterEdge: "#7fb3cf", ocean: "#cfe5ef", mb: "#2f6f8f", nmb: "#e2b07f", road: "#ffffff", roadEdge: "#9c9486" };
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
</style>`;

/* ---------------------------------------------------------------------------- */
/* The map (tools/area-map.js, Census TIGER roads and coast): the Ocean Club on the beach, the marina on the
   waterway, and North Village in the north. Points: row 13 (the club's address geocoded by OpenStreetMap, the county's marina parcel),
   and the middle of the 387 homes the county names Grande Dunes North (map-points.json). */
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const RMAP = regionMap({ name: "Grande Dunes", places: [
  { name: "Ocean Club", lat: 33.7492748, lon: -78.8058885 },
  { name: "Marina", lat: 33.7635764, lon: -78.817664 },
  { name: "North Village", lat: 33.78934, lon: -78.79446 },
] }, {});
must(RMAP.unlabelled.length === 0, "the map dropped a name");
const MAP = `<figure class="pp-fig"><div class="pp-frame">${RMAP.html}</div><figcaption>Where the Ocean Club (1), the marina (2) and North Village (3) are. The points are the club, the marina and the middle of the North Village homes. This is not the community's boundary. Roads and coast: U.S. Census Bureau TIGER/Line. Map: Chapter3 Realty.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* The aerial photo (USDA NAIP 2023, public domain): the marina on the waterway, rows 8 and 13. */

const AIR = PHOTOS.find((r) => r.file.includes("grande-dunes-marina-from-above-1200w"));
must(AIR && AIR.license === "Public domain", "the aerial photo record is missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: AIR.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AIR, caption: "Grande Dunes Marina from the air" }]);

/* ---------------------------------------------------------------------------- */
/* The drives (rows 29 and 30): one chart, minutes by car with no traffic.          */

const DRIVES = G.bars([
  { name: "Grande Dunes Marina", value: D.marina },
  { name: "The beach", value: D.beach },
  { name: "Grand Strand Medical Center", value: D.hosp },
  { name: "The Ocean Club", value: D.club },
  { name: "Broadway at the Beach", value: D.broadway },
  { name: "Coastal Grand Mall", value: D.mall },
  { name: "Myrtle Beach International Airport", value: D.airport },
].map((r) => Object.assign(r, { valueText: `${r.value} min` })), {
  caption: "Minutes by car from the middle of Grande Dunes in Myrtle Beach",
  nameLabel: "Place", valueLabel: "By car, about", compact: true,
  note: `With no traffic. The middle is the middle of the ${F.town["MYRTLE BEACH"]} homes inside the City of Myrtle Beach. The beach is the nearest public beach access, about ${D.beachMiles} miles away, about ${D.walk} minutes on foot. Routes on OpenStreetMap roads.`,
});

/* ---------------------------------------------------------------------------- */
/* The neighborhoods with 3 or more homes for sale (row 25): each name opens our search for it. */

const NAME = (k) => k.replace(/^Grande Dunes\s+[-–]\s+/, "");
const ROWS = Object.entries(SUBS).filter(([k, v]) => v.n >= 3 && k.startsWith("Grande Dunes")).sort((a, b) => b[1].n - a[1].n || a[0].localeCompare(b[0]));
must(ROWS.length === 14 && ROWS[0][0] === "Grande Dunes - Del Webb" && ROWS[0][1].n === 26, "row 25 neighborhoods changed");
const NBHD = h.table(["Neighborhood", "For sale", "Middle asking", "Monthly fee listed"], ROWS.map(([k, v]) => [
  h.a(`/homes/?subdivision=${encodeURIComponent(k)}`, NAME(k)), String(v.n), r5k(v.price.median), `$${n(v.hoa.median)}`,
]));

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osm: "https://www.openstreetmap.org/",
  gdma: "https://grandedunescommunities.sites.townsq.io/1",
  gdmaAmen: "https://grandedunescommunities.sites.townsq.io/2",
  club: "https://www.grandedunesoceanclub.com/ocean-club",
  comm: "https://grandedunes.com/community/",
  census: "https://geocoding.geo.census.gov/geocoder/",
  dw: "https://www.delwebbatgrandedunes.com/ResourceCenter/Download/48372~3083079",
};

/* ---------------------------------------------------------------------------- */
/* The offers.                                                                    */

const CONTACT = `/contact/?place=${encodeURIComponent("Grande Dunes")}`;

/* The place, for search engines: a Place with its point and the town it is in. */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Grande Dunes", alternateName: "Grande Dunes, Myrtle Beach",
  description: `A community of more than 2,900 acres in Myrtle Beach and North Myrtle Beach, South Carolina, with a private beach club, a public marina on the Intracoastal Waterway and two golf courses. Grande Dunes North is inside the City of North Myrtle Beach.`,
  geo: { "@type": "GeoCoordinates", latitude: 33.76635, longitude: -78.81478 },
  address: { "@type": "PostalAddress", addressLocality: "Myrtle Beach", addressRegion: "SC", addressCountry: "US" },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
})}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  pageImages: () => PH.pageImages(AIR),
  title: "Grande Dunes Myrtle Beach Homes: Ocean Club, Marina, Golf",
  description: "Grande Dunes homes in Myrtle Beach: the private Ocean Club, a 126-slip marina, two golf courses. Prices, tax, HOA fees by neighborhood, flood zone.",
  ogTitle: "Grande Dunes homes in Myrtle Beach: a private ocean club, a public marina and two golf courses",
  crumb: "Grande Dunes",
  eyebrow: "Grande Dunes, Myrtle Beach",
  h1: "Grande Dunes homes in Myrtle Beach:",
  h1em: "a private ocean club, a public marina and two golf courses.",
  sub: "Owners of a Grande Dunes home get a household membership in the Ocean Club, a private beach club on the ocean, its master association says.",
  heroMedia: CSS + glance([
    { icon: "home", label: "Homes for sale", text: n(L.all.n) },
    { icon: "beach", label: "Private beach club", text: "Ocean Club" },
    { icon: "dock", label: "Marina slips", text: "126" },
    { icon: "golf", label: "Golf courses", text: "2" },
  ]),
  /* The live homes strip is the first call to action; a button to /homes/ fails the audit. */
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Grande Dunes is a community of more than 2,900 acres, from the Atlantic Ocean to Highway 31, says its master association. The association lists 20 neighborhoods, from beachfront condos to dockside cottages.`,
    `On ${COUNT_DAY}, ${L.all.n} homes were for sale, with a middle asking price of ${r5k(L.all.price.median)}. Dues differ by neighborhood, and we find out what a home's dues cover before you offer.`,
  ],
  sections: [
    { h2: "What is the Grande Dunes Ocean Club?", toc: "Ocean Club", id: "ocean-club", html: (bg) =>
      G.homesCss() + G.homesQScript() + G.homesQ("subdivision=Grande Dunes", "Grande Dunes homes for sale now") +
      h.p(`The Ocean Club is the private beach club of Grande Dunes, at 101 Grande Dunes Boulevard. It is a club, not a building with homes in it.`) +
      `<ul class="pp-rules" aria-label="What the Ocean Club offers">`
        + `<li><strong>The beach</strong>Private oceanfront access, with cabanas and towel service for members.</li>`
        + `<li><strong>The pool</strong>A large outdoor pool and whirlpool, with towel and bar service.</li>`
        + `<li><strong>Food and drink</strong>A dining room, and a seasonal menu of light fare for casual outdoor dining.</li>`
        + `<li><strong>Classes and events</strong>Classes, clubs and entertainment, and a place to host a private function.</li>`
        + `</ul>` +
      h.p(`The master association says a Grande Dunes homeowner receives a household membership in the Ocean Club. The club's own site lists a property owner membership agreement.`) +
      h.p(`Dues differ by neighborhood. The recorded rules of Del Webb at Grande Dunes, for example, name a mandatory fee that every owner there pays for the \"Beach Club\" in Grande Dunes. Our ${h.a("/buyers/55-plus-communities/del-webb-grande-dunes/", "Del Webb at Grande Dunes page")} has the details.`) +
      h.p(`Guests of members fill in a pre-registration form and a waiver of liability before they arrive. The club's site says each adult guest completes their own waiver, not the member.`) +
      G.homesQ("subdivision=Grande Dunes&has=beach_cart_path", "Grande Dunes homes listed as a golf-cart ride to the beach") +
      h.cta("Want the Ocean Club's cost for a home you like?", "We ask the association what the membership costs for that home, and tell you before you offer.", "Have us find out", CONTACT, bg) },

    { h2: "What is it like to live in Grande Dunes?", toc: "Life here", id: "life", html: () =>
      h.p(`The ${h.a("/buyers/waterfront-homes/", "Intracoastal Waterway")}, the channel boats use along the coast, runs through Grande Dunes.`) +
      h.p(`The Grande Dunes Marina is on the waterway. It has 126 wet slips and floating docks for boats up to 120 feet, with fuel, a store and showers. It is open to the public.`) +
      AERIAL +
      h.p(`The Resort Course is a public 18-hole course, and five of its holes play along the waterway. The National Golf Course Owners Association named it its National Golf Course of the Year in 2009, the community's site says. Its clubhouse has a public restaurant, Terrazza 19.`) +
      G.homesQ("subdivision=Grande Dunes&has=on_golf_course", "Grande Dunes homes on the golf course") +
      h.p(`The Members Club course is private, with 18 holes and a par of 71. The community's site says it is open for limited outside play. Our ${h.a("/buyers/golf-communities/", "golf communities guide")} compares the area's golf neighborhoods.`) +
      h.p(`The Grande Dunes Tennis Club has ten lighted clay courts and a pro store. A two-mile waterway trail is open to the public from sunrise to sunset. Only some sections of Grande Dunes are gated. Our ${h.a("/buyers/gated-communities/", "gated communities guide")} shows which.`) +
      G.homesQ("subdivision=Grande Dunes&has=icw_view", "Grande Dunes homes with a view of the Intracoastal Waterway") +
      h.h3("What the homes are like") +
      h.p(`The ${L.all.n} homes for sale are a mix: ${T.Detached.n} detached houses, ${T.Townhouse.n} townhouses, ${T["Semi Detached"].n} semi-detached homes and ${T.Condominium.n} condos. A semi-detached home shares one wall with its neighbor. The listed year built runs from ${L.all.year_built[0]} to ${L.all.year_built[1]}, and ${L.all.built_2024_or_later} of the ${L.all.n} are 2024 or newer.`) +
      h.p(`The county taxes about ${PRIMARY} in 100 of the homes its records name Grande Dunes as the owner's primary residence.`) +
      h.h3("How far is the drive to the beach, the hospital and the shops?") +
      DRIVES },

    { h2: "Is Grande Dunes in the City of Myrtle Beach?", toc: "Which city", id: "city", html: () =>
      h.p(`Not all of it. Every Grande Dunes home for sale, except those in one neighborhood, is inside the City of Myrtle Beach. Grande Dunes North Village, in the north, is inside the City of North Myrtle Beach. The listing service gives its homes a Longs mailing address.`) +
      MAP +
      `<ul class="pp-rules one" aria-label="What the city changes">`
        + `<li><strong>Property tax</strong>The 2026 city levy is $83.40 for every $1,000 of assessed value in Myrtle Beach and $50.00 in North Myrtle Beach. Assessed value is 4 percent of the county's value for your primary residence and 6 percent for a second home.</li>`
        + `<li><strong>Distance to the club</strong>The Ocean Club is about ${D.club} minutes by car from the middle of the Myrtle Beach homes. From the middle of the North Village homes it is about ${D.nClub} minutes.</li>`
        + `</ul>` +
      G.homesQ("subdivision=Grande Dunes - North Village", "Grande Dunes North Village homes for sale") +
      h.p(`Our ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach guide")} covers that city, and our ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach guide")} covers the other.`) },

    { h2: "What do homes in Grande Dunes sell for?", toc: "Prices and tax", id: "prices", html: () =>
      h.p(`In the past year ${SA.all.n} homes sold that the county's records name Grande Dunes. Inside Myrtle Beach, ${SMB.n} sold at a middle price of about ${r5k(SMB.median)}, from about ${r5k(SMB.min)} to ${mil(SMB.max)}. Inside North Myrtle Beach, ${SNM.n} sold at about ${r5k(SNM.median)}, from about ${r5k(SNM.min)} to ${r5k(SNM.max)}.`) +
      `<p class="pp-note">Sale prices: Horry County deeds recorded in the past 12 months, one home to a deed. Neighborhoods the county records under their own names, such as Calais and Living Dunes, are not in these counts.</p>` +
      h.p(`The ${L.all.n} homes for sale asked ${r1k(L.all.price.min)} to ${mil(L.all.price.max)}.`) +
      h.table(["Kind of home", "For sale", "Middle asking"], [
        ["Detached houses", String(T.Detached.n), r5k(T.Detached.price.median)],
        ["Townhouses", String(T.Townhouse.n), r5k(T.Townhouse.price.median)],
        ["Semi-detached", String(T["Semi Detached"].n), r5k(T["Semi Detached"].price.median)],
        ["Condos", String(T.Condominium.n), r5k(T.Condominium.price.median)],
      ]) +
      G.homesQ("subdivision=Grande Dunes&max=500000", "Grande Dunes homes under $500,000") +
      G.homesQ("subdivision=Grande Dunes&min=1500000", "Grande Dunes homes over $1.5 million") +
      h.h3("What the property tax is") +
      h.p(`Besides the mortgage and ${h.a("/buyers/coastal-insurance/", "insurance")}, property tax on a typical home sold inside Myrtle Beach (about ${r5k(SMB.median)}) is about ${r100(TAX.mbP).replace(/\.00$/, "")} a year as your ${h.a("/buyers/property-taxes/", "primary residence")}. As a second home or rental it is about ${r100(TAX.mbO)} a year.`) +
      h.p(`On a typical North Myrtle Beach sale (about ${r5k(SNM.median)}), it is about ${r100(TAX.nmP)} a year as your primary residence and about ${r100(TAX.nmO)} as a second home. Most bills also include a flat county fee of about $90.`) +
      h.p(`If you own here and want to sell, our ${h.a("/sell/home-value/", "home value page")} explains how we price a home from recorded sales.`) },

    { h2: "What is the HOA fee in Grande Dunes?", toc: "HOA fees", id: "hoa", html: () =>
      h.p(`A Grande Dunes owner belongs to two associations: the master association for the whole community, and the association of the owner's own neighborhood. Fees differ a lot by neighborhood, and by kind of home.`) +
      h.p(`The monthly fee on the ${L.all.n} listings has a middle of $${n(L.all.hoa.median)}. Detached houses list about $${n(T.Detached.hoa.median)}, townhouses $${n(T.Townhouse.hoa.median)}, semi-detached homes $${n(T["Semi Detached"].hoa.median)}, and condos about $${n(T.Condominium.hoa.median)}, from $${n(T.Condominium.hoa.min)} to $${n(T.Condominium.hoa.max)}.`) +
      `<p class="pp-note">The listing agent enters each fee, so we confirm it with the association. Each neighborhood name opens our search for it.</p>` +
      `<div class="pp-cmp">${NBHD}</div>` +
      `<p class="pp-note">Neighborhoods with 3 or more homes for sale. Middle asking price and middle listed monthly fee, CCMLS listings counted in aggregate.</p>` +
      h.p(`Our ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")} page compares other Myrtle Beach areas.`) },

    { h2: "Is Grande Dunes in a flood zone?", toc: "Flood zone", id: "flood", html: (bg) =>
      h.p(`No home the county names Grande Dunes has the middle of its lot in FEMA's high-risk zone, the zone where a lender requires flood insurance. We checked all ${n(F.homes)} against FEMA's map, and the zone touches the edge of ${F.homes_touching_high_risk} lots.`) +
      `<ul class="pp-rules one" aria-label="What the flood map shows here">`
        + `<li><strong>Homes near the water</strong>Grande Dunes runs from the ocean past the waterway, and homes near either can be in a different zone. We check each home's own zone.</li>`
        + `<li><strong>Flood history</strong>A zone does not show whether a home has flooded. We check each home's flood history before you offer. Our page on ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} explains how.</li>`
        + `</ul>` +
      h.cta("Like a home near the water? Have us check its flood history", "Send us the listing. We check its flood zone and its flood history, and tell you what we find.", "Have us check a home", CONTACT, bg) +
      G.homesQ("subdivision=Grande Dunes", "Every home for sale in Grande Dunes") + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach and ${h.a("/submarkets/north-myrtle-beach/briarcliffe-acres/", "the town of Briarcliffe Acres")}. Then ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach, ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest and ${h.a("/submarkets/myrtle-beach/riverwalk/", "Riverwalk")} in Myrtle Beach. Then ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway and ${h.a("/submarkets/myrtle-beach/oak-forest/", "Oak Forest")} in Myrtle Beach. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ },
  ],
  faqTitle: "Grande Dunes FAQ",
  faq: [
    { q: "Is Grande Dunes a gated community?", a: "Only in part. Gates belong to individual sections, not to the whole community. Our gated communities guide shows which sections list a gate." },
    { q: "Is there a 55+ community in Grande Dunes?", a: `Yes. Del Webb at Grande Dunes is a 55+ neighborhood, and ${SUBS["Grande Dunes - Del Webb"].n} of its homes were for sale at the last count. Our Del Webb at Grande Dunes page covers its fees and rules.` },
    { q: "Can anyone play golf at Grande Dunes?", a: "The Resort Course is public, and you can book a tee time. The Members Club course is private, though the community's site says it is open for limited outside play." },
    { q: "How much does the Ocean Club cost?", a: "The club's public pages do not list a price. The master association says a homeowner receives a household membership, and dues differ by neighborhood. We find out what a home's dues cover before you offer." },
    { q: "Can you walk to the beach from Grande Dunes?", a: `Not easily. From the middle of the Myrtle Beach homes, the nearest public beach access is about ${D.beachMiles} miles away, about ${D.walk} minutes on foot or ${D.beach} minutes by car. The Ocean Club is the private beach access for members.` },
    { q: "How far is the Grande Dunes Marina?", a: `About ${D.marina} minutes by car from the middle of the Myrtle Beach homes, and about ${D.nMarina} minutes from Grande Dunes North Village.` },
  ],
  sources: [
    { name: "master association", href: SRC.gdma },
    { name: "association amenities", href: SRC.gdmaAmen },
    { name: "Ocean Club", href: SRC.club },
    { name: "community site", href: SRC.comm },
    { name: "Del Webb rules", href: SRC.dw },
    { name: "county GIS", href: SRC.gis },
    { name: "deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "tax levy", href: SRC.levy },
    { name: "Census geocoder", href: SRC.census },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: county parcels, municipalities, flood zones and the deed index. Listings: CCMLS, in aggregate. Drives: OpenStreetMap roads, no traffic. Amenities: the master association's and the clubs' own sites.",
  afterSources: () => CREDITS + PH.imageSchema([AIR]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing in Grande Dunes.",
    p: "Tell us the neighborhood and your budget. We line up the homes that fit, each with its yearly tax and what its dues cover.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "Grande Dunes Myrtle Beach, Grande Dunes homes for sale, Grande Dunes Ocean Club, Grande Dunes Marina, Grande Dunes North Village, Grande Dunes golf, Grande Dunes Myrtle Beach SC",
  about: "Grande Dunes, a community in Myrtle Beach and North Myrtle Beach, South Carolina, with a private beach club, a public marina on the Intracoastal Waterway and two golf courses",
});
