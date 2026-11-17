/* /invest/condo-buildings/margate-tower/ - Margate Tower at Kingston Plantation, 8500 Margate Circle, Myrtle Beach.
 * Batch 2026-11-f, Lane N. Built the way palace-resort.js and bay-view-resort.js were.
 * Facts: Blog-Brain batches/2026-11-f/margate-tower/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md: row 5 chart is Margate against the next two exact heights; row 10 sizes as the resort's cards say).
 * Data: data/2026-11-f/margate-tower/ (listings.json, county.json, flood.json, photos.json, images/).
 * Every count, fee, price and share is read from those files and checked against its ledger row with must().
 * Homes: four live strips (G.homesQ). Picture: one USDA NAIP aerial (public domain), labelled from coordinates. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/margate-tower/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "margate-tower");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10k = (v) => money(Math.round(v / 10000) * 10000);
const must = (ok, msg) => { if (!ok) throw new Error(`margate-tower.js: ${msg}`); };

/* Rows 1, 3, 4: the building. */
must(L.api_total === 7 && L.at_8500 === 7 && L.subdivision_field["Kingston Plantation - Margate Tower"] === 7, "row 1 changed");
must(L.year_built["2004"] === 6 && L.year_built["2006"] === 1, "row 3 changed");
must(C.units === 252 && C.parcels === 253 && C.floors.top === 29 && C.floors.missing_between.join() === "13", "row 4 changed");
/* Row 6: for sale, by size. */
const A = L.asking;
must(L.beds["3"] === 4 && L.beds["4"] === 3 && A.all.min === 640000 && A.all.max === 1690000 && A.all.median === 1000000, "row 6 changed");
must(A["3"].min === 799900 && A["3"].max === 1400000 && A["3"].sqft_range.join() === "1819,2426", "row 6 three-bedrooms changed");
must(A["4"].min === 640000 && A["4"].max === 1690000 && A["4"].sqft_range.join() === "2638,2787", "row 6 four-bedrooms changed");
/* Row 7: the fee brackets. */
const F = L.fee;
must(F.all.lowest_at_or_under === 1500 && F.all.highest_at_or_under === 2100 && F["3"].lowest_at_or_under === 1500 && F["3"].highest_at_or_under === 1850 && F["4"].lowest_at_or_under === 2000 && F["4"].highest_at_or_under === 2100, "row 7 changed");
/* Row 8 and 9: what listings say. */
const FG = L.flags;
must(FG.hoa_includes_trash === 7 && FG.hoa_includes_insurance === 7 && FG.hoa_includes_pest === 7 && FG.hoa_includes_cable === 7 && FG.hoa_includes_water_sewer === 6 && FG.hoa_includes_internet === 6 && FG.hoa_includes_utilities === 6 && FG.hoa_includes_electric === 0 && FG.security_service === 7, "row 8 fee flags changed");
must(FG.parking_garage === 7 && FG.covered_parking === 7 && FG.elevator_building === 7, "row 8 parking changed");
must(FG.long_term_rental_allowed === 7 && FG.str_allowed === 4 && FG.vacation_rental_program === 3 && FG.pets_allowed === 7 && FG.oceanfront_unit === 4, "row 9 changed");
/* Row 11: recorded sales. */
const SW = C.sales.window_2, SP = C.sales.window_1;
must(SW.window === "2025-11-01 to 2026-10-31" && SW.all.n === 15 && SW.all.median === 990000 && SW.all.p25 === 875000 && SW.all.p75 === 1355000 && SW.all.min === 650000 && SW.all.max === 1633125, "row 11 changed");
must(SP.all.n === 14 && Math.round(SP.all.median) === 950632, "row 11 earlier window changed");
/* Row 12: a year of fees at the middle bracket against the middle sale price. */
const PCT = Math.round(F.all.median_at_or_under * 12 / SW.all.median * 100);
must(PCT === 2, "row 12 changed");
/* Row 13: tax. */
must(C.taxed_as_home_4pct === 46, "row 13 changed");
/* Row 14: flood footprint. */
const sh = (z, bfe) => FL.zones_touching.find((x) => x.attributes.FLD_ZONE === z && (bfe == null || x.attributes.STATIC_BFE === bfe)).share_of_footprint;
const AE = sh("AE", 12) + sh("AE", 11), VE = sh("VE"), MOD = sh("0.2 PCT ANNUAL CHANCE FLOOD HAZARD");
must(Math.round(AE * 1000) === 165 && Math.round(VE * 1000) === 84 && Math.round(MOD * 1000) === 271 && FL.share_in_no_zone === 0.48 && FL.center_point_zones.length === 0, "row 14 changed");
const AE_PCT = Math.round(AE * 100), VE_PCT = Math.round(VE * 100), MOD_PCT = Math.round(MOD * 100), NONE_PCT = Math.round(FL.share_in_no_zone * 100);
must(AE_PCT + VE_PCT + MOD_PCT === 52, "row 14 shares no longer add to 52");
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.765263 && LNG === -78.781335, "footprint center changed");
/* The read time, printed beside every count of homes for sale. */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`, RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`;
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;

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



/* The picture: one labelled NAIP aerial (public domain). */
const AERIAL = PHOTOS.find((p) => p.file.endsWith("/margate-tower-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* Visual 1 (row 5, corrected): the tower against the next two exact heights in the Post and Courier table. */
const HEIGHTS = G.bars([
  { name: "Margate Tower (29 floors)", value: 329, valueText: "329 ft" },
  { name: "Ocean 22 by Hilton Grand Vacations Club (24 floors)", value: 257, valueText: "257 ft" },
  { name: "Royale Palms Condominiums (24 floors)", value: 256, valueText: "256 ft" },
], {
  caption: "Margate Tower is 72 feet taller than the next building in Myrtle Beach",
  nameLabel: "Building", valueLabel: "Height", compact: true, max: 360,
  note: "Post and Courier, \"Tallest buildings in Myrtle Beach,\" June 29, 2021. The FAA's obstacle file lists a building at the tower at 335 feet, good to within 50 feet, so we write about 330.",
});

/* Visual 2 (rows 6, 7): size sets the price and the fee. */
const SIZE_TABLE = compareCards([
  { name: "Three bedrooms", bestFor: `${n(A["3"].sqft_range[0])} to ${n(A["3"].sqft_range[1])} sq ft`,
    cells: { sale: `${L.beds["3"]}`, ask: `${money(A["3"].min)} to ${money(A["3"].max)}`, fee: `About ${money(F["3"].lowest_at_or_under)} to ${money(F["3"].highest_at_or_under)}` } },
  { name: "Four bedrooms", bestFor: `${n(A["4"].sqft_range[0])} to ${n(A["4"].sqft_range[1])} sq ft`,
    cells: { sale: `${L.beds["4"]}`, ask: `${money(A["4"].min)} to ${money(A["4"].max)}`, fee: `About ${money(F["4"].lowest_at_or_under)} to ${money(F["4"].highest_at_or_under)}` } },
], [
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
  { key: "ask", label: "Asking price" },
  { key: "fee", label: "HOA fee a month" },
], { caption: `Seven condos for sale on ${RUN_SHORT}, by bedroom count`, nameLabel: "Unit", bestForLabel: "Size" });

const RESORT = "https://www.kingstonresorts.com/accommodations/kingston-condos-villas-2/kingston-condos-villas/";
const PCPOST = "https://www.postandcourier.com/tallest-buildings-in-myrtle-beach/table_2a835b54-d85f-11eb-8c90-5f0e102e8b9f.html";
const FAA = "https://aeronav.faa.gov/Obst_Data/DAILY_DOF_DAT.ZIP";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Margate Tower", alternateName: ["Margate Towers", "Margate Tower at Kingston Plantation", "Kingston Plantation - Margate Tower"],
  description: "A 29-floor oceanfront condo tower at Kingston Plantation in Myrtle Beach, South Carolina, built in 2004, with about 250 condos.",
  address: { "@type": "PostalAddress", streetAddress: "8500 Margate Circle", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29572", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "Place", name: "Kingston Plantation, Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips, checked 2026-11-17 against /homes/api/strip: 7, 4, 3 and 40 homes. The MLS spells the building "Kingston Plantation - Margate Tower". */
const SUB = "subdivision=Kingston+Plantation+-+Margate+Tower";
const STRIP = G.homesQScript() + G.homesQ(SUB, "Margate Tower condos for sale now");
const STRIP_OCEAN = G.homesQ(`${SUB}&has=oceanfront_unit`, "Margate Tower condos on the ocean");
const STRIP_UNDER = G.homesQ("subdivision=Kingston+Plantation&max=500000", "Kingston Plantation condos at $500,000 or less");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Margate Tower Myrtle Beach Condos for Sale: Fees From ${money(F.all.lowest_at_or_under)}`,
  description: `Margate Tower, 8500 Margate Circle, Myrtle Beach: the tallest building in town, HOA fees by size, renting, flood map and ${SW.all.n} recent sales, with condos for sale.`,
  ogTitle: "Margate Tower, Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "Margate Tower",
  eyebrow: "Margate Tower at Kingston Plantation",
  h1: "Margate Tower condos for sale in Myrtle Beach's tallest building.",
  sub: "About 250 condos at 8500 Margate Circle in Kingston Plantation. Seven are for sale now, shown below.",
  h1em: "29 floors, about 330 feet, and 72 feet above the next tower.",
  heroMedia: glance([
    { icon: "town", label: "Floors", text: "29 floors" },
    { icon: "calendar", label: "Built", text: "Built in 2004" },
    { icon: "home", label: "For sale", text: `${L.api_total} for sale now` },
    { icon: "key", label: "HOA fee", text: `Fees from about ${money(F.all.lowest_at_or_under)}` },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Margate Tower is a 29-floor oceanfront tower built in 2004. Condos are asking ${money(A.all.min)} to ${r10k(A.all.max)}, with a monthly HOA fee of about ${money(F.all.lowest_at_or_under)} to ${money(F.all.highest_at_or_under)} by size.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + h.p(`${h.a("/homes/?subdivision=Kingston+Plantation+-+Margate+Tower", "See all " + L.api_total + " in our search")}. Booking a stay instead? ${h.ext(RESORT, "Kingston Resorts")} takes reservations on its own site.`)
      + `<p class="c3-pr-up">Margate is one of the buildings in ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")}, and one of the oceanfront buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is Margate Tower at Kingston Plantation?", toc: "The tower", id: "tower", html: () =>
      h.p(`The Post and Courier's 2021 table puts it at 329 feet. The next one, Ocean 22 by Hilton Grand Vacations Club, is 257 feet.`) +
      HEIGHTS +
      h.p(`The county counts ${C.units} condos in the tower, so we write "about 250." Unit numbers skip floor 13.`) +
      h.p(`The tower was built in 2004 and the units are big. The condos for sale run from ${n(A["3"].sqft_range[0])} to ${n(A["4"].sqft_range[1])} square feet. Every listing says it has covered parking, a garage, an elevator and a security service.`) +
      PHOTO +
      h.p(`Kingston Plantation's gate, beach and amenities are on the ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation page")}. Margate Towers in New Jersey is a different place.`) },

    { h2: "What does a condo at Margate Tower cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`On ${RUN_MD}, condos here were listed in two sizes. Four are three-bedrooms and three are four-bedrooms.`) +
      SIZE_TABLE +
      h.p(`The ranges overlap: the lowest ask is a four-bedroom, below every three-bedroom. Four of the seven are tagged oceanfront. Those four are in the strip below.`) +
      STRIP_OCEAN },

    { h2: "What are the HOA fees at Margate Tower?", toc: "HOA fees", id: "hoa-fees", html: () =>
      h.p(`The fee goes by size: about ${money(F["3"].lowest_at_or_under)} to ${money(F["3"].highest_at_or_under)} a month for a three-bedroom and about ${money(F["4"].lowest_at_or_under)} to ${money(F["4"].highest_at_or_under)} for a four. These are the listings' fee brackets, not a bill.`) +
      h.p(`The listings say what the fee covers. Agents fill in those fields, so we read the budget, the reserve study and the rules before you offer.`) +
      `<ul class="c3-pr-list"><li><strong>Covered in every listing</strong>Trash, insurance, pest control and cable.</li><li><strong>Covered in most</strong>Water and sewer, internet and utilities.</li><li><strong>Covered in none</strong>Electric.</li></ul>` +
      h.p(`A year of fees is about ${PCT} percent of what a unit sold for. You still need your own policy for the inside of the unit, and ${h.a("/hoa/master-insurance-ho6/", "our page on the building's policy and yours")} explains the split.`) +
      h.p(`For the fee against other buildings, see the ${h.a("/invest/condo-buildings/", "oceanfront condo buildings guide")}. Kingston Plantation's community fees are on its own page.`) },

    { h2: "Can you rent a condo at Margate Tower?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Every listing allows long-term rentals and pets. Four allow nightly rentals, and three say the unit is in the resort's rental program.`) +
      h.p(`${h.ext(RESORT, "Kingston Resorts")} rents Margate condos by the night as two-, three- and four-bedrooms. Whether a given unit may rent by the night depends on the building's rules, so we ask for them.`) +
      h.p(`The terms of the resort's program are on the ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation page")}. The money both ways is on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")}, and the license and taxes are on ${h.a("/invest/str-rules/", "short-term rental rules")}.`) },

    { h2: "What did Margate Tower condos sell for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} units sold at a stated price in the ${PERIOD}, by Horry County's deed records. The middle was ${r5k(SW.all.median)}. The middle half sold from ${r5k(SW.all.p25)} to ${r5k(SW.all.p75)}, and the range ran from ${money(SW.all.min)} to ${money(SW.all.max)}.`) +
      h.p(`In the 12 months to ${MONTHS[+SP.window.match(/to \d{4}-(\d{2})/)[1] - 1]} ${SP.window.match(/to (\d{4})/)[1]}, ${SP.all.n} sold at a middle of about ${r5k(SP.all.median)}. A recorded price is not always an arm's-length sale, and the deeds do not record bedrooms or floors.`) +
      h.p(`Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) },

    { h2: "What could go wrong with a Margate Tower condo?", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>The flood map crosses the footprint.</strong>About half of the area the county maps for the tower is in a FEMA zone, and half is in none. The zones are AE, VE and the moderate zone. The middle point of the tower is in none. A lender and an insurer ask about the unit and the building, so we check before you offer.</li>`
        + `<li><strong>The loan.</strong>A condo at this price may need a jumbo loan, and some buildings raise a non-warrantable question. ${h.a("/invest/non-warrantable-condos/", "Our non-warrantable condos page")} lists Margate Tower. Our affiliated lender, BrickWood Mortgage, a separate company, can answer which loans fit a unit here.</li>`
        + `<li><strong>The tax.</strong>${C.taxed_as_home_4pct} of the ${C.units} units are taxed as the owner's full-time home, and the rest at the rate for other homes. Our ${h.a("/buyers/property-taxes/", "property tax page")} shows how the two rates work.</li>`
        + `</ul>` +
      `<aside>` + h.cta("Have us pull Margate Tower's association papers", "We get the budget, the reserve study, the rental rules and any special assessments for the building before you offer.", "Have us pull the papers", "/contact/", bg) + `</aside>` +
      `<aside>` + h.cta("Have us check this condo's flood history", "We look at the unit, the building's elevation and the insurance question, and our affiliated lender, BrickWood Mortgage, a separate company, looks at the loan.", "Have us check a condo", "/contact/", bg) + `</aside>` },

    { h2: "What if Margate Tower is more than you want?", toc: "Other Kingston towers", id: "other", html: () =>
      h.p(`Margate is one of Kingston Plantation's 11 buildings, and not the only choice there. The ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation page")} compares them in one table. We tour any of them with you and read the association's papers first.`) +
      STRIP_UNDER + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/margaritaville-vacation-residences/", "Margaritaville Vacation Residences")} (about half a mile) and ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 3 miles). Farther north: ${h.a("/invest/condo-buildings/bay-watch-resort/", "Bay Watch Resort")} (about 5 miles) and ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 7 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about half a mile) and ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 2 miles). Farther south: ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 3 miles) and ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 4 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Margate Tower Myrtle Beach FAQ",
  faq: [
    { q: "How tall is Margate Tower?", a: "About 330 feet. The Post and Courier's 2021 table lists 329 feet, and the FAA's obstacle file agrees within its margin. The next tallest building in Myrtle Beach is 72 feet shorter." },
    { q: "How many floors does Margate Tower have?", a: "Margate Tower has 29 floors. Unit numbers skip floor 13, so the top unit is on floor 29." },
    { q: "Can you rent a Margate Tower condo by the night?", a: `Some units can. Four of the seven condos for sale on ${RUN_MD} allow nightly rentals. Whether a given unit can depends on the building's rules, so we ask for them.` },
    { q: "What are the HOA fees at Margate Tower?", a: "It goes by unit size. The brackets are in the HOA fees section of this page." },
    { q: "What did Margate Tower condos sell for?", a: `${SW.all.n} units sold in the ${PERIOD} at a middle of ${money(SW.all.median)}, from ${money(SW.all.min)} to ${money(SW.all.max)}.` },
  ],
  sources: [
    { name: "Post and Courier tallest buildings table", href: PCPOST },
    { name: "FAA obstacle file", href: FAA },
    { name: "Kingston Resorts rooms", href: RESORT },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Margate Tower.",
    p: "Pick a condo from the strip above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing at Margate Tower", href: "/contact/",
  },
  keywords: "margate tower, margate towers myrtle beach, margate tower myrtle beach for sale, margate tower kingston plantation, margate tower hoa, margate tower rentals, 8500 margate circle",
  about: "Margate Tower, a 29-floor oceanfront condo tower at 8500 Margate Circle in Kingston Plantation, Myrtle Beach, South Carolina",
});
