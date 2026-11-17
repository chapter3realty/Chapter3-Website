/* /invest/condo-buildings/margaritaville-vacation-residences/ - Margaritaville Vacation Residences, 235 Fins Up
 * Circle, Myrtle Beach (Arcadian Shores): a condo community being built. What it is and when it is due, the HOA fee
 * by unit size and what it pays, renting, what to check before you sign for a unit that is not built.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. The shape of bay-view-resort.js and palace-resort.js.
 * Facts: Blog-Brain batches/2026-11-f/margaritaville-vacation-residences/facts.md, VERIFIED rows, and CORRECTED rows
 * at the verifier's wording (VERIFY.md: row 14 says zone X, not "outside every mapped zone"; row 15's deed window ends
 * 2026-10-31; row 6 and 7 limits). Struck, never printed: rows 22 (keyword data) and 24 (HOA credit), the hotel line
 * in row 20, our own distance measure in row 10, any plan size (row 17), the tax district.
 * Data: data/2026-11-f/margaritaville-vacation-residences/ (listings.json, flood.json, photos.json, images/).
 * Every count, fee, price and share is read from those files and checked against its ledger row with must().
 * Homes: four live strips (G.homesQ), no "send me" offer. Picture: one USDA NAIP 2023 aerial (public domain),
 * outlined from the county tract polygon and labelled from coordinates. Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/margaritaville-vacation-residences/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "margaritaville-vacation-residences");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`margaritaville-vacation-residences.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Rows 1 to 3: 9 for sale under the MLS name; 2, 4 and 3 by bedrooms; asking by size. */
const B = L.by_size, A = L.asking_all;
must(L.api_total === 9 && L.at_235_fins_up === 9 && L.beds["1"] === 2 && L.beds["2"] === 4 && L.beds["3"] === 3, "rows 1 and 2 counts changed");
must(L.subdivision_field["Margaritaville Vacation Residences Myrtle Beach"] === 9, "row 1 name changed");
must(A.min === 389900 && A.max === 763900, "row 3 asking changed");
must(B["1"].asking_min === 389900 && B["2"].asking_min === 499900 && B["2"].asking_max === 639900 && B["3"].asking_min === 725900 && B["3"].asking_max === 763900, "row 3 by size changed");
must(r1k(B["1"].asking_min) === "$390,000" && r1k(B["2"].asking_min) === "$500,000" && r1k(B["2"].asking_max) === "$640,000" && r1k(B["3"].asking_min) === "$726,000" && r1k(B["3"].asking_max) === "$764,000", "row 3 rounding");
/* Row 4: the feed's year built. */
must(L.year_built["2026"] === 8 && L.year_built["2027"] === 1 && L.waterfront_field["False"] === 9, "row 4 changed");
/* Row 5: the fee by size. Print by band, never one unit's size beside its fee. */
must(B["1"].fee_range.join() === "413,452" && B["2"].fee_range.join() === "580,580" && B["3"].fee_range.join() === "580,847" && L.fee_all.range.join() === "413,847", "row 5 fees changed");
must(B["1"].sqft_range.join() === "779,811" && B["2"].sqft_range.join() === "1042,1042" && B["3"].sqft_range.join() === "1381,1516", "row 5 sizes changed");
const FEE_LO = L.fee_all.range[0], FEE_HI = L.fee_all.range[1];
/* Row 12 and 13: what the listings tick. */
const FG = L.flags;
must(FG.hoa_includes_insurance === 9 && FG.hoa_includes_internet === 9 && FG.hoa_includes_cable === 9 && FG.hoa_includes_trash === 9, "row 12 changed");
must(FG.hoa_includes_electric === 0 && FG.hoa_includes_water_sewer === 0, "row 12 not-in-fee changed");
must(FG.str_allowed === 9 && FG.rentals_allowed === 9 && FG.furnished === 9 && FG.balcony === 9, "row 13 changed");
/* Row 14 (CORRECTED): flood shares of the tract, as the county draws them. */
const zMod = FL.zones_touching.find((x) => x.attributes.FLD_ZONE === "0.2 PCT ANNUAL CHANCE FLOOD HAZARD");
const zAE = FL.zones_touching.find((x) => x.attributes.FLD_ZONE === "AE");
must(FL.zones_touching.length === 2 && zMod.share_of_footprint === 0.038 && zAE.share_of_footprint === 0.004 && FL.share_in_no_zone === 0.958 && zAE.attributes.STATIC_BFE === 11, "row 14 changed");
const NONE_PCT = Math.round(FL.share_in_no_zone * 100), MOD_PCT = Math.round(zMod.share_of_footprint * 100);
/* Row 6: the tract, 11.19 acres. Center for the schema. */
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.766191 && LNG === -78.790031, "row 6 center changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (same design pass as palace-resort.js).       */

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
  /* The labelled aerial keeps its own 4:3 frame; the hero default crops it to 16:9 from 700 px and cut the ocean label. */
  + `${S} figure.c3ph-hero img{aspect-ratio:4/3!important}`
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

/* ---------------------------------------------------------------------------- */
/* The picture: one labelled NAIP aerial (public domain), under its sentence.     */

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/margaritaville-vacation-residences-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: "The Margaritaville Vacation Residences site from above" }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 3, 5): by size. */

const FEE_TABLE = compareCards([
  { name: "One-bedroom", bestFor: "About 780 to 810 sq ft as listed",
    cells: { fee: `${money(B["1"].fee_range[0])} to ${money(B["1"].fee_range[1])}`, ask: `From about ${r1k(B["1"].asking_min)}`, sale: `${L.beds["1"]}` } },
  { name: "Two-bedroom", bestFor: "About 1,040 sq ft as listed",
    cells: { fee: `${money(B["2"].fee_range[0])}`, ask: `${r1k(B["2"].asking_min)} to ${r1k(B["2"].asking_max)}`, sale: `${L.beds["2"]}` } },
  { name: "Three-bedroom", bestFor: "1,381 to 1,516 sq ft as listed",
    cells: { fee: `${money(B["3"].fee_range[0])} to ${money(B["3"].fee_range[1])}`, ask: `${r1k(B["3"].asking_min)} to ${r1k(B["3"].asking_max)}`, sale: `${L.beds["3"]}` } },
], [
  { key: "fee", label: "HOA fee a month" },
  { key: "ask", label: "Asking price" },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At Margaritaville, the fee goes by the size of the condo", nameLabel: "Condo", bestForLabel: "Size" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const OWNER = "https://ownmargaritavillevacationresidencesmyrtlebeach.com/";
const FAQPAGE = "https://ownmargaritavillevacationresidencesmyrtlebeach.com/have-questions/";
const AMEN = "https://ownmargaritavillevacationresidencesmyrtlebeach.com/amenities/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";

/* The community as a place, for search (never Hotel or LodgingBusiness: we are not the developer). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Margaritaville Vacation Residences Myrtle Beach", alternateName: ["Margaritaville Vacation Residences", "Margaritaville Myrtle Beach condos"],
  description: "A condominium community under construction in Arcadian Shores, Myrtle Beach, South Carolina, with 271 homes planned by the developer's June 2026 count.",
  address: { "@type": "PostalAddress", streetAddress: "235 Fins Up Circle", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29572", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "AdministrativeArea", name: "Horry County, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips. Checked 2026-11-17 against /homes/api/strip: 9, 3, 3 and 47 homes. The MLS spells the place
 * "Margaritaville Vacation Residences Myrtle Beach"; the word "Margaritaville" alone falls back to the whole feed. */
const SUB = "subdivision=Margaritaville Vacation Residences Myrtle Beach";
const STRIP = G.homesQScript() + G.homesQ(`${SUB}&type=condo`, "Condos for sale at Margaritaville Vacation Residences, Myrtle Beach");
const STRIP_THREE = G.homesQ(`${SUB}&beds=3`, "Margaritaville condos with three bedrooms");
const STRIP_UNDER = G.homesQ(`${SUB}&max=500000`, "Margaritaville condos under $500,000");
const STRIP_NEAR = G.homesQ(`near=${LAT.toFixed(4)},${LNG.toFixed(4)}&miles=2&type=condo&waterfront=1`, "Oceanfront condos within 2 miles, already built");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Margaritaville Vacation Residences Myrtle Beach: HOA From ${money(FEE_LO)}`,
  description: "Margaritaville Vacation Residences Myrtle Beach: condos for sale, HOA fees by size, what the fee pays, rental rules, flood map and what to ask before signing.",
  ogTitle: "Margaritaville Vacation Residences, Myrtle Beach: condos for sale before they are built",
  crumb: "Margaritaville Vacation Residences",
  eyebrow: "Margaritaville Vacation Residences, Myrtle Beach",
  h1: "Margaritaville Vacation Residences, Myrtle Beach: condos for sale before they are built.",
  h1em: `The listed HOA fee is ${money(FEE_LO)} to ${money(FEE_HI)} a month by condo size, and the developer's list says it includes insurance, internet, cable and trash.`,
  sub: `Margaritaville Vacation Residences has ${L.api_total} condos for sale in Arcadian Shores, asking ${r1k(A.min)} to ${r1k(A.max)} on ${RUN_MD}.`,
  heroMedia: glance([
    { icon: "town", label: "Where", text: "Arcadian Shores" },
    { icon: "home", label: "For sale", text: `${L.api_total} condos` },
    { icon: "calendar", label: "First buildings", text: "Late 2027, per the developer" },
    { icon: "key", label: "Rentals", text: "Allowed" },
  ]) + CSS + G.homesCss() + `<div class="c3-pr-open" style="margin-top:1.2rem">${STRIP}</div>`,
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Margaritaville Vacation Residences is a condo community being built in Arcadian Shores, about 0.3 miles from the beach by the developer's count. On ${RUN_MD}, ${L.api_total} condos were for sale, from about ${r1k(A.min)} to ${r1k(A.max)}. The developer's list and all ${L.api_total} listings agree on what the fee includes. See how it compares in our ${h.a("/invest/condo-buildings/", "Myrtle Beach condo directory")}.`,
  ],
  sections: [
    { h2: "What is Margaritaville Vacation Residences in Myrtle Beach?", toc: "What it is", id: "what-it-is", html: () =>
      h.p(`Margaritaville Vacation Residences is a community of deeded condominiums at 235 Fins Up Circle, in the Arcadian Shores part of Myrtle Beach. The plan is 271 homes. Ground was broken on June 6, 2026, and the developer's count then was 25 percent sold.`) +
      h.p(`There are seven floor plans, from one to three bedrooms. They come fully furnished, with a balcony and a laundry. The mailing address says Myrtle Beach, but the county's map draws no town limits at the tract.`) +
      h.p(`The plans include a resort pool with a hot tub and a splash pad, plus cabanas and a tiki bar. There is also the Palmetto Bar &amp; Grill, a lobby bar, a fitness center, fire pits and a seasonal shuttle to the beach. All of it is planned. We read the contract and the condominium documents with you before you sign.`) +
      STRIP_THREE },

    { h2: "When will Margaritaville Vacation Residences be finished?", toc: "When it is due", id: "when", html: () =>
      `<ul class="c3-pr-list">`
        + `<li><strong>July 2025</strong>Building 1 and the amenities were expected by fall 2026, in the developer's blog. It counted 295 homes.</li>`
        + `<li><strong>Groundbreaking, June 6, 2026</strong>The developer's count was 25 percent sold and 271 homes. The first two buildings and the amenities were due by late 2027.</li>`
        + `</ul>` +
      h.p(`The date moved once in the developer's own statements, and the home count moved from 295 to 271. New buildings slip often, so the contract is what protects you. Ask for a completion date, what happens if it passes, and where the deposit is held. Our ${h.a("/buyers/new-construction/", "new construction page")} explains the contract.`) +
      h.p(`Eight listings have a year built of 2026 and one has 2027, though no building is finished. Go by the developer's date in the contract, not the listing's year.`) },

    { h2: "What are the HOA fees at Margaritaville Vacation Residences?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      FEE_TABLE +
      h.p(`On the developer's list, the fee also covers recycling, exterior maintenance, grounds, the amenities, outside pest control, management and reserves. No listing includes electric or water, so the owner pays those.`) +
      h.p(`You still need a policy for the inside of the unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.p(`The fee may be an estimate while the developer still runs the association. Ask for the budget and read our page on ${h.a("/hoa/developer-control-turnover/", "what happens when the developer hands over the association")}.`) +
      STRIP_UNDER },

    { h2: "Can you rent a Margaritaville condo in Myrtle Beach?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Yes. The condominium documents allow short-term and long-term rentals, and all ${L.api_total} listings say short-term rentals are allowed.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the on-site program</strong>An optional program runs through Luxury Residential Resorts. It is separate from the HOA fee.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit yourself. The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.</li>`
        + `</ul>` +
      h.p(`No one guarantees rental income, not the developer, its sales team or the manager. The recorded condominium documents set the real rules, and we read them for any unit you consider. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways, and our ${h.a("/invest/airbnb-income/", "Airbnb income page")} covers what rentals earn across Myrtle Beach.`) },

    { h2: "What have Margaritaville condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`No unit has sold on record yet. The county shows one tract, not units, and the past year's deed index holds no deed for a unit. The asking prices above are all a buyer can compare. A chart of sold prices has to wait for the first closings.`) },

    { h2: "What to check before you sign for an unbuilt condo", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>The schedule</strong>We ask for the completion date in the contract and what you can do if it passes.</li>`
        + `<li><strong>The size</strong>The developer's plan sizes and the listings' sizes do not match. Ask for the measured area of the plan you buy.</li>`
        + `<li><strong>Flood</strong>In the county's copy of the FEMA map, about ${NONE_PCT} percent of the tract has no flood zone drawn on it, which FEMA calls minimal hazard. About ${MOD_PCT} percent is the moderate zone, and a sliver under half a percent is in a high-risk zone. The map shows the tract, not the building, so we check the flood certificate for the unit.</li>`
        + `<li><strong>Taxes</strong>Our ${h.a("/buyers/property-taxes/", "property tax page")} shows the two rates and what a sale does to the value. Ask which tax district the unit will sit in, since the county map shows no town limits at the tract.</li>`
        + `<li><strong>The loan</strong>The developer names a preferred lender, but you may use any lender. Many standard loans will not cover a new condo in a building with a rental program. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} and ${h.a("/invest/non-warrantable-condos/", "non-warrantable condos page")} explain why.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a unit like this one.`) +
      h.cta("Have us check a unit before you sign", "We ask for the HOA budget, the condominium documents and the rental terms, then go through each check above for the unit you like. Our affiliated lender, BrickWood Mortgage, a separate company, looks at the unit.", "Have us check a unit before you sign", "/contact/", bg) +
      h.p(`If you would rather buy what is already built, these oceanfront condos are within 2 miles.`) +
      STRIP_NEAR + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/beach-cove-resort/", "Beach Cove Resort")} (about 4 miles) and ${h.a("/invest/condo-buildings/bay-watch-resort/", "Bay Watch Resort")} (about 5 miles). Farther north: ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 7 miles) and ${h.a("/invest/condo-buildings/towers-on-the-grove/", "Towers on the Grove")} (about 9 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about half a mile) and ${h.a("/invest/condo-buildings/margate-tower/", "Margate Tower")} (about half a mile). Farther south: ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 2 miles) and ${h.a("/invest/condo-buildings/caravelle-resort/", "Caravelle Resort")} (about 3 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Margaritaville Vacation Residences Myrtle Beach FAQ",
  faq: [
    { q: "Where is Margaritaville Vacation Residences?", a: "Margaritaville Vacation Residences is at 235 Fins Up Circle, Myrtle Beach, SC 29572, in the Arcadian Shores part of Myrtle Beach." },
    { q: "How many condos will Margaritaville Vacation Residences have?", a: "The plan is 271 homes by the developer's latest count. Ask which number is current, since the count has changed." },
    { q: "Is it the same as the Margaritaville restaurant?", a: "No. The Margaritaville restaurant is at Broadway at the Beach in Myrtle Beach, a different place from this condo community." },
    { q: "Is Margaritaville Vacation Residences oceanfront?", a: "No. None of the condos for sale is listed as waterfront." },
    { q: "Is it a hotel or condos?", a: "Deeded condominiums, sold fully furnished. An optional rental program is run by a separate company." },
    { q: "How many floor plans are there?", a: "There are seven plans, from one to three bedrooms. Ask for the measured area of the plan you buy, since sizes differ between sources." },
    { q: "Is there parking?", a: "Parking is around each building and first come, first served (the developer's FAQ). Ask where an owner's space is." },
    { q: `How many Margaritaville condos are for sale?`, a: `On ${RUN}, ${L.api_total} were for sale: ${L.beds["1"]} one-bedrooms, ${L.beds["2"]} two-bedrooms and ${L.beds["3"]} three-bedrooms.` },
  ],
  sources: [
    { name: "developer's owner site", href: OWNER },
    { name: "developer's FAQ", href: FAQPAGE },
    { name: "amenities", href: AMEN },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; the county's tract record and deed index; the flood map on the county's copy. Schedule and plan statements are the developer's.`,
  afterSources: () => PLACE_LD,
  bottomCta: {
    h2: "Book a showing, or a call about the nine condos for sale.",
    p: "Pick a condo from the strips above. We go through the contract and the condominium documents with you before you sign.",
    label: "Book a showing at Margaritaville", href: "/contact/",
  },
  keywords: "margaritaville vacation residences myrtle beach, margaritaville vacation residences myrtle beach prices, margaritaville myrtle beach condos for sale, margaritaville vacation residences hoa fees, 235 fins up circle myrtle beach",
  about: "Margaritaville Vacation Residences, a condominium community under construction at 235 Fins Up Circle in Arcadian Shores, Myrtle Beach, South Carolina",
});
