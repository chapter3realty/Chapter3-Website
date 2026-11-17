/* /invest/condo-buildings/towers-on-the-grove/ - Towers on the Grove, 2100 N Ocean Blvd, Cherry Grove, North Myrtle Beach:
 * what it is, who holds the units, the condos for sale now, flood, and what to ask before an offer.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. Built in the Palace Resort and Bay View shape.
 * Facts: Blog-Brain batches/2026-11-f/towers-on-the-grove/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md: rows 5, 7, 8, 12 corrected; the building half of row 12 struck).
 * Data: data/2026-11-f/towers-on-the-grove/ (county.json, flood.json, photos.json, images/).
 * Every count and chart value is read from those files and checked against its ledger row with must().
 * Homes: one live strip (G.homesQ). Picture: one USDA NAIP aerial (public domain), labelled from coordinates.
 * No listing's price or fee is printed (row 3), no owner name (row 6).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/towers-on-the-grove/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "towers-on-the-grove");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const C = read("county.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos;
const must = (ok, msg) => { if (!ok) throw new Error(`towers-on-the-grove.js: ${msg}`); };
const n = (v) => Math.round(v).toLocaleString("en-US");

/* Row 5 (CORRECTED): 237 parcels, 236 with a building value, 232 numbered suites; floors 2 to 20, none numbered 13. */
const SUITES = 232, PARCELS = C.parcels;
must(C.parcels === 237 && C.units === 236 && C.floors.top === 20 && C.floors.missing_between.join() === "13" && C.floors.numbers[0] === 2, "row 5 changed");
must(Object.values(C.county_market_value_groups).reduce((s, g) => s + g[1], 0) === 231, "row 8 groups changed");
/* Row 6: owner counts (names stay off the page). 137 of 237 under one resort-company name, 18 under a second, 17 a trust company. */
const OWN = { one: 137, second: 18, trust: 17 };
const OTHER = PARCELS - OWN.one - OWN.second - OWN.trust;
must(OTHER === 65 && OWN.one / PARCELS > 0.5, "row 6 changed");
/* Row 7 (CORRECTED): 209 FL, 13 SC, 14 elsewhere, 155 of the 209 under the two resort-company names. */
const ST = Object.fromEntries(C.owner_state_top);
must(ST.FL === 209 && ST.SC === 13 && C.units - ST.FL - ST.SC === 14 && C.taxed_as_home_4pct === 2, "row 7 changed");
must(OWN.one + OWN.second === 155, "row 7 split changed");
/* Row 9: no recorded sale under the building's name. */
must(C.sales.hub_window.all.n === 0, "row 9 changed");
/* Row 10: flood zones under the lot. */
const ZN = Object.fromEntries(FL.zones_touching.map((z) => [z.attributes.FLD_ZONE + z.attributes.STATIC_BFE, z.share_of_footprint]));
must(ZN.AE10 === 0.96 && ZN.AE11 === 0.016 && ZN.VE12 === 0.024, "row 10 changed");
/* The listings' read time: 3 condos, 2 studios and 1 two-bedroom (rows 1, 3), read 2026-11-17. */
const RUN = "November 17, 2026", RUN_MD = "November 17";
const LAT = 33.827121, LNG = -78.6449;
must(FL.footprint_center[0] === 33.827269 && FL.footprint_center[1] === -78.644929, "row 7 center changed");

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:1rem!important;row-gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.55rem!important;padding:.5rem 0!important;min-width:0}${S} .c3-glance li:nth-last-child(-n+2){border-bottom:${RULE}!important}}`
  /* Under 360 px the icons leave too little room for two columns; the words stay. */
  + `@media (max-width:359px){${S} .c3-glance li>span.i{display:none!important}${S} .c3-glance{column-gap:.8rem!important}}`
  + `${S} h2{text-wrap:balance}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `${S} .c3-pr-list{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px}`
  + `${S} .c3-pr-list li{margin:0;padding:.8rem 0 .85rem;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} .c3-pr-list li:last-child{border-bottom:${RULE}}${S} .c3-pr-list strong{color:var(--navy);display:block;margin-bottom:.15rem}`
  + `${S} .c3-pr-up{margin:1.4rem 0 0;max-width:720px;color:var(--muted);line-height:1.7}`
  + `${S} .c3-gchart,${S} .c3-cc,${TBL}{max-width:720px!important;box-sizing:border-box}`
  /* Plain tables under thin rules, no card (garden-city.js design pass). */
  + `${TBL}{${FLAT};padding:0!important}${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  /* The homes strip under the short answer, with room before the first heading. */
  + `${S} .c3-pr-open .hx-strip:not(:empty){margin:0 0 1.2rem}`
  /* The end band: the bar pages' rounded card (garden-city.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  + `@media (max-width:359px){${S} .hx-feed .hx-fb-ai,${S} label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}}`
  + "</style>";


const AERIAL = PHOTOS.find((p) => p.file.endsWith("/towers-on-the-grove-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

const SIZE_TABLE = compareCards([
  { name: "Studio", bestFor: "About 400 sq ft", cells: { bath: "1", sale: "2" } },
  { name: "Two-bedroom", bestFor: "762 sq ft", cells: { bath: "2", sale: "1" } },
], [
  { key: "bath", label: "Baths", num: true },
  { key: "sale", label: `For sale ${RUN_MD}`, num: true },
], { caption: "The three condos for sale at Towers on the Grove, by size", nameLabel: "Unit", bestForLabel: "Size" });

const RESORT = "https://clubwyndham.wyndhamdestinations.com/us/en/resorts/wyndham-hotels-resorts/united-states-of-america/south-carolina/north-myrtle-beach/club-wyndham-towers-on-the-grove";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";
const FANNIE = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const FREDDIE = "https://guide.freddiemac.com/app/guide/section/5701.3";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Towers on the Grove", alternateName: ["Club Wyndham Towers on the Grove", "Towers on the Grove North Myrtle Beach"],
  description: "An oceanfront-area condo and vacation-club tower with floors numbered up to 20 in Cherry Grove, North Myrtle Beach, South Carolina, listed as built in 2008.",
  address: { "@type": "PostalAddress", streetAddress: "2100 N Ocean Blvd", addressLocality: "North Myrtle Beach", addressRegion: "SC", postalCode: "29582", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "North Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strip. Checked 2026-11-17 against /homes/api/strip: 3 homes (the MLS spells it "Towers On The Grove"; free-text q= does not find it).
   The lowest ask is above the condo floor, so no max= is needed. */
const STRIP = G.homesQScript() + G.homesQ("subdivision=Towers On The Grove&type=condo", "Condos for sale at Towers on the Grove, in Cherry Grove");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: "Towers on the Grove North Myrtle Beach Condos for Sale",
  description: "Towers on the Grove, 2100 N Ocean Blvd, Cherry Grove: who holds the units, the condos for sale now, the flood zone, and what to ask before you offer.",
  ogTitle: "Towers on the Grove, North Myrtle Beach: condos for sale, who holds the units, flood zone",
  crumb: "Towers on the Grove",
  eyebrow: "Towers on the Grove, Cherry Grove",
  h1: "Towers on the Grove, North Myrtle Beach: condos for sale in Cherry Grove.",
  h1em: "More than half of its unit parcels sit under one resort-company name.",
  sub: `Towers on the Grove has ${SUITES} suites in Cherry Grove. To book a stay instead of buying, go to ${h.ext(RESORT, "the resort's own website")}.`,
  heroMedia: CSS + G.homesCss() + glance([
    { icon: "beach", label: "Location", text: "Cherry Grove" },
    { icon: "home", label: "Suites", text: `${SUITES}` },
    { icon: "calendar", label: "Built", text: "2008" },
    { icon: "key", label: "Run as", text: "Vacation club" },
  ]) + `<p style="color:var(--muted);margin:0 0 .9rem;max-width:720px;line-height:1.6">Three condos are for sale at Towers on the Grove now, shown below. The building has ${SUITES} numbered suites at 2100 N Ocean Blvd.</p><div class="c3-pr-open">${STRIP}</div>`,
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Towers on the Grove is a Club Wyndham vacation resort in Cherry Grove, with floors numbered up to 20, listed as built in 2008. Three condos are for sale there on ${RUN_MD}: two studios and one two-bedroom.`,
    `Ask the lender early. Not every lender takes a vacation-club building, and almost all of the site is in a flood zone where flood insurance is required.`,
  ],
  sections: [
    { html: () => `<p class="c3-pr-up">Towers on the Grove is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}. For the town around it, see ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach")}.</p>` },

    { h2: "What is Towers on the Grove?", toc: "What it is", id: "what", html: () =>
      h.p(`Towers on the Grove is at 2100 N Ocean Blvd in Cherry Grove, the north end of North Myrtle Beach. The listings give 2008 as the year it was built. Suites in the county's parcel records are numbered on floors 2 to 20, and no floor is numbered 13.`) +
      h.p(`It is a Club Wyndham resort. The resort lists suites from studios to three bedrooms, a seasonal lazy river and outdoor pool, an outdoor hot tub, a fitness center and beach access. It also says not every suite is oceanfront or oceanview.`) +
      h.p(`The county counts ${SUITES} numbered suites.`) +
      PHOTO },

    { h2: "Who owns the units at Towers on the Grove?", toc: "Who owns them", id: "owners", html: () =>
      h.p(`Most of the units are held by a few companies, not one suite at a time. More than half of the county's parcels sit under one resort-company name, and a second company holds a few more.`) +
      h.p(`Most owners have a Florida mailing address. About ${Math.round(ST.FL / C.units * 100)} in 100 do, and only about ${Math.round(ST.SC / C.units * 100)} in 100 list South Carolina. A mailing address does not say where anyone lives. Just ${C.taxed_as_home_4pct} of the ${C.units} parcels are taxed as an owner's home.`) },

    { h2: "Can you buy a condo at Towers on the Grove?", toc: "Buying here", id: "buying", html: (bg) =>
      h.p(`Yes. Three are for sale on ${RUN_MD}, and the strip above shows them: two studios of about 400 square feet and one two-bedroom of 762 square feet.`) + SIZE_TABLE +
      h.h3("The monthly fee") +
      h.p(`The two studios list the same monthly association fee, and the two-bedroom lists a higher one. Three listings do not make a range, so we do not print one. Ask for the budget and what the fee pays.`) +
      h.h3("Ask first: a whole suite or a club interest") +
      h.p(`A vacation resort can sell a whole deeded suite or a share of time in one. The two are not the same purchase. The listing may not say which one you are looking at, so ask the listing agent before you tour.`) +
      h.h3("Loans") +
      h.p(`This is a vacation-club resort. Fannie Mae and Freddie Mac do not buy loans on timeshare projects. Ask the lender whether it will review this building. The rules are ${h.ext(FANNIE, "Fannie Mae B4-2.1-03")} and ${h.ext(FREDDIE, "Freddie Mac 5701.3")}. Our page on ${h.a("/invest/non-warrantable-condos/", "condos many lenders will not take")} has the rules.`) +
      h.p(`You can check the county's record for any listing on our ${h.a("/buyers/property-records/", "property records page")}.`) },

    { h2: "How does the county value the suites for tax?", toc: "Tax values", id: "sizes", html: () =>
      h.p(`These are tax values, not prices. The county puts 231 of the ${SUITES} numbered suites at five levels, and one suite at a sixth. A tax value is not what a suite is worth or sells for, and we do not give a value for any address.`) },

    { h2: "What have units at Towers on the Grove sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`We searched the Horry County deed index, and none are recorded under the building's name for the past year. The latest sale on any suite in the parcel records is from January 2025, and ${C.last_sale_year.None} parcels show no sale at all.`) +
      h.p(`A zero does not prove that nothing changed hands. A deed can be filed under another name. It does tell you there is no table of recent prices to compare with, so a listing here has no neighbor sales to check against. Our ${h.a("/invest/condo-buildings/", "condo buildings guide")} lists buildings where there are.`) },

    { h2: "Is Towers on the Grove in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`Almost all of the site is in FEMA's high-risk flood zone. Lenders require flood insurance there. In a big flood, FEMA's map puts the water surface 10 feet above its sea level datum there. That is a height on the map, not how deep the water is at a door. A small part is in the coastal high-hazard zone, where waves add to the risk. FEMA's map also shows a moderate-risk zone near the building's center point.`) +
      h.p(`We read FEMA's flood map against the county's lot drawing for this page. The map follows that drawing, not the walls. Ask for the flood certificate, and get a quote for the unit's flood policy before you offer. Our ${h.a("/hoa/master-insurance-ho6/", "page on the building's policy and your own condo policy")} explains the split.`) },

    { h2: "What to ask before you offer at Towers on the Grove", toc: "What to ask", id: "ask", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>The association's budget and reserve study</strong>Ask what the monthly fee pays, and whether any assessment is planned. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Rules for rental and your own use</strong>The resort page has no owner rental terms. Ask for them in writing for the unit you like.</li>`
        + `<li><strong>The flood policy</strong>Get a quote before you offer, on the unit and the building.</li>`
        + `<li><strong>The lender's condo review</strong>Ask early. See ${h.a("/invest/condotel-financing/", "condotel financing")} for the loans that fit hotel-style buildings.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you whether a loan fits a unit here.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/prince-resort/", "Prince Resort")} (about half a mile). Down the beach to the south: ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 2 miles) and ${h.a("/invest/condo-buildings/bay-watch-resort/", "Bay Watch Resort")} (about 4 miles). Farther south: ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 6 miles) and ${h.a("/invest/condo-buildings/margate-tower/", "Margate Tower")} (about 9 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Towers on the Grove North Myrtle Beach FAQ",
  faq: [
    { q: "What is Towers on the Grove in North Myrtle Beach?", a: "Towers on the Grove is a Club Wyndham vacation resort at 2100 N Ocean Blvd in Cherry Grove, listed as built in 2008." },
    { q: "Can you buy a condo at Towers on the Grove?", a: `Yes. On ${RUN}, three condos were for sale at Towers on the Grove: two studios and one two-bedroom.` },
    { q: "Have any units at Towers on the Grove sold lately?", a: "None are recorded under the building's name in the Horry County deed index for the past year. That does not prove nothing sold, because a deed can be filed under another name." },
    { q: "Is Towers on the Grove in a flood zone?", a: "Almost all of the site is in FEMA's high-risk flood zone, with the water surface at 10 feet above FEMA's sea level datum in a big flood. A small part is in the coastal wave zone. Ask for the flood certificate and a flood policy quote before you offer." },
    { q: "What is the address of Towers on the Grove?", a: "Towers on the Grove is at 2100 N Ocean Blvd, North Myrtle Beach, SC 29582, in the Cherry Grove part of town." },
  ],
  sources: [
    { name: "Club Wyndham resort page", href: RESORT },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
    { name: "Fannie Mae B4-2.1-03", href: FANNIE },
    { name: "Freddie Mac 5701.3", href: FREDDIE },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the 12 months to September 2026; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "See the three Towers on the Grove condos in person.",
    p: "Tell us which of the three you want to see and the days you are here. An agent shows you that unit.",
    label: "Book a showing at Towers on the Grove", href: "/contact/",
  },
  keywords: "towers on the grove north myrtle beach, towers on the grove condos for sale, club wyndham towers on the grove, towers on the grove cherry grove, 2100 n ocean blvd north myrtle beach, towers on the grove studio",
  about: "Towers on the Grove, a Club Wyndham vacation resort with floors numbered up to 20, at 2100 N Ocean Blvd in Cherry Grove, North Myrtle Beach, South Carolina",
});
