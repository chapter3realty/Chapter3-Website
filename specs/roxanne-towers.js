/* /invest/condo-buildings/roxanne-towers/ - Roxanne Towers, 1604 N Ocean Blvd, Myrtle Beach: what owning a condo
 * there is like, the HOA fee and what the two listings say it pays, renting by the night, how few units sell,
 * and what we check before an offer.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. A small building (2 condos for sale), so the Palace Resort and
 * Bay View shape, shortened: no strip of the building itself (under 3), strips of the oceanfront condos around it.
 * Facts: Blog-Brain batches/2026-11-f/roxanne-towers/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md: rows 9, 16, 19 corrected; no cable, no insurance, no 1964, no floor count).
 * Data: data/2026-11-f/roxanne-towers/ (listings.json, county.json, flood.json, tax.json, photos.json, images/).
 * Every count, fee, price and share is read from those files and checked against its ledger row with must().
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/roxanne-towers/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "roxanne-towers");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), TX = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const must = (ok, msg) => { if (!ok) throw new Error(`roxanne-towers.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 2: 72 condos (land use 107): 66 on floors 2 to 12, six a floor, plus PH 1 to PH 6 (the 72 includes them). */
must(C.parcels === 76 && C.floors.top === 12 && C.floors.numbers[0] === 2 && C.floors.units_per_floor["5"] === 6, "row 2 changed");
const UNITS = 72;
/* Row 4: built about 2004; 8 units last sold in 2004. 1964 is never printed. */
must(L.year_built["2004"] === 1 && C.last_sale_year["2004"] === 8, "row 4 changed");
const NOT_SOLD = C.last_sale_year["2004"];
/* Rows 6, 7, 8: for sale now. */
const A = L.asking["1"], FX = L.fee_exact["1"], FG = L.flags;
must(L.api_total === 2 && L.at_504 === 2 && L.beds["1"] === 2, "row 6 count changed");
must(A.min === 195000 && A.max === 219900 && A.median === 207450 && A.sqft_range.join() === "633,683", "rows 6 and 7 changed");
must(FX.n === 2 && FX.lowest === 795 && FX.highest === 795, "row 8 fee changed");
const FEE = FX.lowest, YEAR = FEE * 12;
must(YEAR === 9540, "row 8 year changed");
/* Row 9 (CORRECTED): the fee pays water and sewer, trash, electric, internet, pest control. Not cable; not insurance. */
must(FG.hoa_includes_water_sewer === 2 && FG.hoa_includes_trash === 2 && FG.hoa_includes_electric === 2 && FG.hoa_includes_internet === 2 && FG.hoa_includes_pest === 2, "row 9 changed");
/* Row 10 and 12: nightly rentals; features. */
must(FG.str_allowed === 2 && FG.vacation_rental_program === 2 && FG.furnished === 2 && FG.indoor_pool === 2, "rows 10 and 12 changed");
/* Row 14 and 15: sales (later window, one window only). */
const SW = C.sales.later_window;
must(SW.window === "2025-11-01 to 2026-10-31" && SW.all.n === 3 && SW.all.min === 185000 && SW.all.max === 215000, "rows 14 and 15 changed");
const SOLD = SW.all.n;
/* Row 16 (CORRECTED): 1 of 72 taxed as the owner's home. */
must(C.taxed_as_home_4pct === 1, "row 16 changed");
/* Row 17: tax at the asking middle, city rate, before any exemption. */
const MILLS = 254.6;
const TAX = A.median * 0.06 * MILLS / 1000;
must(Math.round(TAX) === 3169 && r100(TAX) === "$3,200", "row 17 tax changed");
must(TX.units_at_6pct === 71 && Math.round(TX.taxable_below_market_share * 100) === 78, "row 17 share changed");
const TOTAL = YEAR + TAX;
must(r100(TOTAL) === "$12,700", "row 17 total changed");
/* Row 18: flood. */
const zone = FL.zones_touching.find((x) => x.attributes.FLD_ZONE === "0.2 PCT ANNUAL CHANCE FLOOD HAZARD");
must(FL.zones_touching.length === 1 && zone && zone.share_of_footprint === 0.246 && FL.share_in_no_zone === 0.754 && FL.center_point_zones.length === 0, "row 18 changed");
const MOD_PCT = Math.round(zone.share_of_footprint * 100), NONE_PCT = Math.round(FL.share_in_no_zone * 100);
/* Row 19: size rule. */
must(A.sqft_range[0] > 500, "row 19 changed");
/* Row 3: the place. */
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.697251 && LNG === -78.873753, "row 3 center changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (same design pass as bay-view-resort.js).     */

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


/* ---------------------------------------------------------------------------- */
/* The picture: one labelled NAIP aerial (public domain).                         */

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/roxanne-towers-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The one table (row 8, 17): a year of owning a one-bedroom here, before any loan. */

const YEAR_TABLE = h.table(["What you pay", "A year", "How we got it"], [
  ["HOA fee", money(YEAR), `${money(FEE)} a month, the fee both one-bedrooms for sale list, times 12`],
  ["City property tax", `About ${r100(TAX)}`, `At the asking middle of ${money(A.median)}, the city rate, before any exemption`],
  ["Total", `About ${r100(TOTAL)}`, "Before insurance, the loan, utilities and management"],
]);

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const ZONING = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const RENT_A = "https://www.condolux.net/roxanne-towers-myrtle-beach";
const RENT_B = "https://www.myrtlebeachluxuryrentals.com/myrtle-beach-condos/roxanne.php";
const RENT_C = "https://www.elliottbeachrentals.com/vacation-condos/roxanne-towers/";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Roxanne Towers", alternateName: ["Roxanne Towers Myrtle Beach"],
  description: `An oceanfront condo tower on N Ocean Blvd in Myrtle Beach, South Carolina, built about 2004, with ${UNITS} condos.`,
  address: { "@type": "PostalAddress", streetAddress: "1604 N Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips. Checked 2026-11-17 against /homes/api/strip: 59, 38 and 9 homes. The building itself has 2: no strip. */
const NEAR = `near=${LAT},${LNG}&miles=0.5&type=condo&has=water_ocean`;
const STRIP_1 = G.homesQScript() + G.homesQ(NEAR, "Oceanfront condos within half a mile of Roxanne Towers");
const STRIP_2 = G.homesQ(`${NEAR}&max=200000`, "Condos under $200,000 near Roxanne Towers, including the tower");
const STRIP_3 = G.homesQ(`${NEAR}&beds=2`, "Oceanfront condos with two bedrooms or more, within half a mile");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Roxanne Towers Myrtle Beach Condos for Sale: Fee ${money(FEE)}`,
  description: `Roxanne Towers, 1604 N Ocean Blvd, Myrtle Beach: the HOA fee, what it pays, nightly rentals, what condos sold for, and oceanfront condos for sale now.`,
  ogTitle: "Roxanne Towers, Myrtle Beach: condos for sale, HOA fee, rentals and sales",
  crumb: "Roxanne Towers",
  eyebrow: "Roxanne Towers, Myrtle Beach",
  h1: "Roxanne Towers, Myrtle Beach: oceanfront condos for sale.",
  h1em: "A small oceanfront tower where few condos come up for sale.",
  sub: `Roxanne Towers has ${UNITS} condos at 1604 N Ocean Blvd. Stays are booked through the rental company that runs the unit. This page is about owning one.`,
  heroMedia: glance([
    { icon: "beach", label: "Location", text: "Oceanfront" },
    { icon: "home", label: "Condos", text: `${UNITS}` },
    { icon: "calendar", label: "Built", text: "About 2004" },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Two one-bedrooms are for sale at Roxanne Towers, and both list a ${money(FEE)} monthly HOA fee, about ${money(YEAR)} a year before any loan. Only ${SOLD} condos sold in the past year.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open"><p class="c3-pr-up" style="margin:0 0 .8rem">Two one-bedrooms at Roxanne Towers ask ${r5k(A.min)} to ${r5k(A.max)}, and ${h.a("/homes/?subdivision=Roxanne Towers", "our search shows both")}. These oceanfront condos are within half a mile.</p>${STRIP_1}</div>`
      + `<p class="c3-pr-up">Roxanne Towers is one of the oceanfront buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at Roxanne Towers?", toc: "Owning here", id: "owning", html: () =>
      h.p(`Both condos for sale at Roxanne Towers list the same ${money(FEE)} fee, and both say it pays the electric bill, internet, water and sewer, trash and pest control. `) +
      h.p(`Those are the listing agents' entries, not the building's rule, so we read the budget before you offer.`) +
      h.p(`Three rental companies list units here, and they describe one- and two-bedroom condos with a balcony, a washer and dryer and a full kitchen. The same companies list an oceanfront pool, an indoor heated pool, a lazy river and a hot tub. Both condos for sale also list an elevator, a parking garage and covered parking.`) +
      PHOTO +
      h.p(`The tower stands about 0.2 mile north of Pier 14 and about 0.3 mile north of the SkyWheel, in a straight line. It is in Myrtle Beach, not North Myrtle Beach.`) },

    { h2: "What is the HOA fee at Roxanne Towers?", toc: "HOA fee", id: "hoa-fee", html: (bg) =>
      h.p(`Both one-bedrooms for sale list ${money(FEE)} a month, about ${money(YEAR)} a year. Both are small, ${A.sqft_range[0]} and ${A.sqft_range[1]} square feet, so a larger unit may pay a different fee. None was for sale to check.`) +
      h.p(`Add the city's property tax and a year of owning one costs about ${r100(TOTAL)}.`) +
      YEAR_TABLE +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value. About ${Math.round(TX.taxable_below_market_share * 100)} percent of the units here are taxed below the county's market value, and a sale resets the value to about the price. The seller's bill can be lower than yours will be. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in.`) +
      h.p(`The building's own insurance covers the structure, not the inside of your unit. You still need a policy for that, and our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split. Some listings in the building say the fee covers the building's insurance, so we confirm it in the budget.`) +
      STRIP_2 +
      h.cta("Know Roxanne Towers' budget before you offer", "We ask for the association's budget, its reserve study and the rental terms, and add them up for the unit you like.", "Have us get the budget, reserve study and rental terms", "/contact/", bg) },

    { h2: "Can you Airbnb a condo at Roxanne Towers?", toc: "Renting it", id: "renting", html: () =>
      h.p(`Both condos for sale say short-term rentals are allowed, and both say the unit is in a rental program. The City of Myrtle Beach zoning at the building is MUH, a district the city's map shades for nightly rentals.`) +
      h.p(`Three rental companies already list units here, so owners do rent. The building's own rules and the split with a rental company are not published, so we get the terms for any unit you consider.`) +
      h.p(`The license and the taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}. Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows the money both ways, and ${h.a("/invest/airbnb-income/", "the Airbnb income page")} covers what one- and two-bedrooms earn across Myrtle Beach. No public source gives income for this building alone.`) },

    { h2: "How many condos sell at Roxanne Towers, and for how much?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SOLD} condos sold in the ${PERIOD}, by Horry County's deed records, for ${money(SW.all.min)} to ${money(SW.all.max)}. That is about 1 in ${Math.round(UNITS / SOLD)} condos in the building.`) +
      h.p(`${NOT_SOLD} condos have not sold since 2004, the earliest year in the county's records for the building. Three sales are too few to call a trend.`) +
      h.p(`The two asking prices, about $195,000 and $220,000, sit at or just above the three recorded sales. Asking and selling are different numbers, and ${h.a("/sell/home-value/", "our home value page")} explains how we price a home here.`) },

    { h2: "What to check before you buy at Roxanne Towers", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>FEMA's map puts no high-risk zone on the lot. About ${MOD_PCT} percent of the lot is in the 0.2 percent annual-chance zone, and about ${NONE_PCT} percent is outside the mapped zones. The map shows the county's lot drawing, not the walls, so we check the flood certificate. Our ${h.a("/buyers/flood-zone-check/", "flood zone check page")} shows how.</li>`
        + `<li><strong>The building's age</strong>At about 20 years, we read the reserve study, the last two budgets and the minutes for any planned assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>Who uses the units</strong>${C.taxed_as_home_4pct} of ${UNITS} condos is taxed as the owner's home. The building is run for renters and second homes.</li>`
        + `<li><strong>If you will use a loan</strong>A building with a rental program can be treated as a condotel, so we ask the lender early. Both one-bedrooms for sale are over 500 square feet (${A.sqft_range[0]} and ${A.sqft_range[1]}), the size one published condotel program asks for. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.</li>`
        + `</ul>` +
      h.cta("Have us check a Roxanne Towers unit before you offer", "We go through each check above for the unit you like, and our affiliated lender, BrickWood Mortgage, a separate company, looks at the unit.", "Have our affiliated lender, BrickWood Mortgage, a separate company, look at the unit", "/contact/", bg) +
      STRIP_3 +
      h.p(`To weigh Roxanne Towers against other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/palms-resort/", "The Palms Resort")} (about half a mile) and ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (about half a mile). Farther north: ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 1 mile) and ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 3 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 1 mile) and ${h.a("/invest/condo-buildings/sea-mist-resort/", "Sea Mist Resort")} (about 2 miles). Farther south: ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (about 2 miles) and ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (about 2 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Roxanne Towers Myrtle Beach FAQ",
  faq: [
    { q: "What is the address of Roxanne Towers?", a: "Roxanne Towers is at 1604 N Ocean Blvd, Myrtle Beach, SC 29577. It stands on the oceanfront, close to Pier 14 and the SkyWheel." },
    { q: "How many condos does Roxanne Towers have?", a: `Horry County records ${UNITS} condos in the building. Three rental companies list units here, and each lists only its own.` },
    { q: "Is Roxanne Towers a hotel?", a: "No. The condos are owned one by one. Guests book a stay through the rental company that runs a unit, and we have no phone number for the building." },
    { q: "When was Roxanne Towers built?", a: "Roxanne Towers was built about 2004. We found no permit or county year, so we say about, and the condos for sale list their own year." },
    { q: "Is Roxanne Towers in North Myrtle Beach?", a: "No. Roxanne Towers is in Myrtle Beach, at 1604 N Ocean Blvd. One rental company's page calls it North Myrtle Beach, and that is wrong." },
    { q: "How far is Roxanne Towers from Pier 14?", a: "About 0.2 mile in a straight line, not a walking route. The SkyWheel is about 0.3 mile away, also in a straight line." },
    { q: "How many Roxanne Towers condos are for sale?", a: `Two one-bedrooms are for sale as of this page's update, asking about ${r5k(A.min)} to ${r5k(A.max)}. Our search shows the current ones.` },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "city zoning", href: ZONING },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "rental company listing, Condolux", href: RENT_A },
    { name: "rental company listing, Myrtle Beach Luxury Rentals", href: RENT_B },
    { name: "rental company listing, Elliott Beach Rentals", href: RENT_C },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing. The amenities are the rental companies' words.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "See the Roxanne Towers condos for sale.",
    p: "Pick a condo from the strips above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: "/contact/",
  },
  keywords: "roxanne towers myrtle beach, roxanne towers, roxanne towers myrtle beach condos for sale, roxanne towers hoa fee, 1604 n ocean blvd myrtle beach",
  about: "Roxanne Towers, a 72-condo oceanfront tower at 1604 N Ocean Blvd, Myrtle Beach, South Carolina",
});
