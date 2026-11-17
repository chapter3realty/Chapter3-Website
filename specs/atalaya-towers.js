/* /invest/condo-buildings/atalaya-towers/ - Atalaya Towers, 912 N Waccamaw Dr, Garden City Beach: what it is, what units
 * sold for, flood, who owns, nightly rental, and what to ask the association.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. Palace Resort and Bay View shape, with one change: one condo is for
 * sale in the building, so the page is built on county and flood records and carries no strip of its own (the strip rule
 * needs 3). Its strip shows oceanfront condos near it instead.
 * Facts: Blog-Brain batches/2026-11-f/atalaya-towers/facts.md, VERIFIED rows, and CORRECTED rows at VERIFY.md's wording
 * (rows 7, 10, 12 corrected; row 15 struck; rows 2, 6, 8, 13, 14 carry wording limits). Data: data/2026-11-f/atalaya-towers/.
 * Every number is read from those files and checked against its ledger row with must().
 * Picture: one USDA NAIP aerial (public domain), labelled from coordinates, until the photo partner's shots arrive.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/atalaya-towers/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "atalaya-towers");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const C = read("county.json"), FL = read("flood.json"), PHOTOS = read("photos.json").photos, MAP = read("raw/map.json");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const must = (ok, msg) => { if (!ok) throw new Error(`atalaya-towers.js: ${msg}`); };

/* Row 7 (CORRECTED): 79 units in the county's records; unit numbers run to the 17th floor and skip the 13th. */
const FLR = C.floors;
must(C.units === 79 && FLR.top === 17 && FLR.missing_between.join() === "13", "row 7 changed");
const UNITS = C.units;
/* Row 8: 70 of 79 carry one county value, $450,000. */
must(C.county_market_value_groups.length === 1 && C.county_market_value_groups[0][0] === 450000 && C.county_market_value_groups[0][1] === 70, "row 8 changed");
const SAME = C.county_market_value_groups[0][1], SAME_VALUE = C.county_market_value_groups[0][0];
/* Rows 9 and 10 (CORRECTED): nine recorded sales in the year; the eight on floors 1 to 10. */
const SW = C.sales.later_window, SW1 = C.sales.hub_window;
must(SW.all.n === 9 && SW1.all.n === 9 && SW.all.median === 400000 && SW.all.min === 260000 && SW.all.max === 475000 && SW.all.p25 === 382550 && SW.all.p75 === 465000, "row 9 changed");
must(SW.floors_1_to_10.n === 8 && SW.floors_1_to_10.median === 407500 && SW.floors_1_to_10.min === 375100 && SW.floors_1_to_10.max === 475000, "row 10 changed");
must(SW1.buyer_tax_bill_out_of_sc === 6 && SW1.buyer_tax_bill_in_sc === 3, "row 9 buyers changed");
/* Row 12 (CORRECTED): owners' mailing states; 10 of 79 taxed as a legal residence (never "4 percent"). */
must(C.owner_out_of_sc === 34 && C.owner_state_top[0][0] === "SC" && C.owner_state_top[0][1] === 45 && C.taxed_as_home_4pct === 10, "row 12 changed");
const SHARE_HOME = Math.round(C.taxed_as_home_4pct / UNITS * 100);
must(SHARE_HOME === 13, "row 12 share changed");
/* Row 11: the whole footprint is in zone AE. */
must(FL.zones_touching.length === 1 && FL.zones_touching[0].attributes.FLD_ZONE === "AE" && FL.zones_touching[0].share_of_footprint === 1 && FL.share_in_no_zone === 0, "row 11 changed");
/* Rows 1 and 3: the one listing; the map's read time (the day printed on the page). */
must(MAP.total === 1, "row 3: the number for sale changed; read the plan again");
const RUN = (MAP.foot.line.match(/^Updated (\w+ \d{1,2}, \d{4})/) || [])[1];
must(RUN, "the map's read time is missing");
const LAT = FL.footprint_center[0], LNG = FL.footprint_center[1];
must(LAT === 33.583265 && LNG === -78.992294, "row 1 center changed");

/* ---------------------------------------------------------------------------- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:1rem!important;row-gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.55rem!important;padding:.5rem 0!important;min-width:0}${S} .c3-glance li:nth-last-child(-n+2){border-bottom:${RULE}!important}}`
  + `@media (max-width:359px){${S} .c3-glance li>span.i{display:none!important}${S} .c3-glance{column-gap:.8rem!important}}`
  + `${S} h2{text-wrap:balance}`
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `${S} .c3-pr-list{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px}`
  + `${S} .c3-pr-list li{margin:0;padding:.8rem 0 .85rem;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} .c3-pr-list li:last-child{border-bottom:${RULE}}${S} .c3-pr-list strong{color:var(--navy);display:block;margin-bottom:.15rem}`
  + `${S} .c3-pr-up{margin:1.4rem 0 0;max-width:720px;color:var(--muted);line-height:1.7}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  + `${S} .c3-pr-open .hx-strip:not(:empty){margin:0 0 1.2rem}`
  + `${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  + `@media (max-width:359px){${S} .hx-feed .hx-fb-ai,${S} label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}}`
  + "</style>";

/* The picture: one labelled NAIP aerial (public domain). */
const AERIAL = PHOTOS.find((p) => p.file.endsWith("/atalaya-towers-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

const GCR = "https://www.gardencityrealty.com/resort/5-atalaya-towers";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";
const MLSLINK = "/homes/?subdivision=atalaya+towers";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Atalaya Towers", alternateName: ["Atalaya Tower", "Atalaya Towers Garden City Beach"],
  description: `An oceanfront condo tower in Garden City Beach, South Carolina, with ${UNITS} condos in the county's records.`,
  address: { "@type": "PostalAddress", streetAddress: "912 N Waccamaw Dr", addressLocality: "Garden City Beach", addressRegion: "SC", postalCode: "29576", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "City", name: "Garden City Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Strips. No strip of the building (1 home). Checked 2026-11-17 against /homes/api/strip: 14 and 6 homes. */
const STRIP = G.homesQScript() + G.homesQ(`near=${LAT},${LNG}&miles=1&type=condo&waterfront=1`, "Oceanfront condos within a mile of Atalaya Towers");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: "Atalaya Towers Garden City Beach: Condos for Sale",
  description: `Atalaya Towers, 912 N Waccamaw Dr, Garden City Beach: what ${SW.all.n} condos sold for in a year, the flood zone, who owns, nightly rentals, and what to ask.`,
  ogTitle: "Atalaya Towers, Garden City Beach: what condos sold for, flood zone and what to ask",
  crumb: "Atalaya Towers",
  eyebrow: "Atalaya Towers, Garden City Beach",
  h1: "Atalaya Towers, Garden City Beach: buying a condo.",
  h1em: `The county gives ${SAME} of ${UNITS} units one value, ${money(SAME_VALUE)}. Nine units sold last year for $260,000 to $475,000.`,
  sub: `Atalaya Towers has ${UNITS} condos in Garden City Beach. To book a stay instead, see ${h.ext(GCR, "a rental manager's page")}.`,
  heroMedia: glance([
    { icon: "beach", label: "Location", text: "Oceanfront" },
    { icon: "home", label: "Condos", text: `${UNITS}` },
    { icon: "calendar", label: "Built", text: "1985 (MLS)" },
    { icon: "flood", label: "Flood zone", text: "All in high-risk zone" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Atalaya Towers is an oceanfront tower at 912 N Waccamaw Dr in Garden City Beach, with ${UNITS} condos in the county's records. ${SW.all.n} sold in the past year, for about ${r5k(SW.all.median)} in the middle.`,
    `FEMA puts the whole site in its high-risk flood zone, so a lender needs flood insurance. Flood cover, the association's fee and its reserves come before the view.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Atalaya Towers is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}. For the town, see ${h.a("/submarkets/garden-city/", "Garden City Beach")}.</p>` },

    { h2: "What is Atalaya Towers?", toc: "The building", id: "building", html: () =>
      h.p(`Atalaya Towers is an oceanfront condo tower on N Waccamaw Dr, about half a mile north of the Garden City Pier. A local rental manager describes its units as three-bedroom, two-bath condos. The MLS lists the one condo for sale as 1,025 square feet.`) +
      h.p(`The MLS lists the building as built in 1985. That is one MLS record, not a building permit, so we check the year before an offer.`) +
      PHOTO +
      h.h3("Floors and amenities") +
      h.p(`The county has ${UNITS} condos on the site. Unit numbers run up to the 17th floor and skip the 13th. The building has an indoor pool, an outdoor pool, a hot tub and elevators, by the rental manager's page.`) +
      h.p(`Looking for a stay, a review or one unit's rental? The rental manager's page is the place. This page is for the person weighing a purchase.`) },

    { h2: "How much do Atalaya Towers condos sell for?", toc: "Sales", id: "sales", html: () =>
      h.p(`Nine condos sold in the past year, by Horry County's deed records. The middle sale was about ${r5k(SW.all.median)}. Prices ran from about ${r5k(SW.all.min)} to ${r5k(SW.all.max)}.`) +
      h.table(["Atalaya Towers condos, past year", "Price"], [
        ["Lowest sale", `About ${r5k(SW.all.min)}`],
        ["Middle sale", `About ${r5k(SW.all.median)}`],
        ["Highest sale", `About ${r5k(SW.all.max)}`],
      ]) +
      h.p(`Eight of the nine sales were on floors 1 to 10. They ran from about ${r5k(SW.floors_1_to_10.min)} to ${r5k(SW.floors_1_to_10.max)}, with a middle of about $410,000. The ninth, on a higher floor, was about $260,000. One sale does not show a pattern, so we do not read one into it.`) +
      h.h3("The county's number does not tell units apart") +
      h.p(`The county gives ${SAME} of the ${UNITS} units one value, ${money(SAME_VALUE)}. The nine units that sold went for $260,000 to $475,000. The county's figure is a type value, so it does not say what a unit is worth.`) +
      "" },

    { h2: "Are there condos for sale at Atalaya Towers right now?", toc: "For sale now", id: "for-sale", html: () =>
      h.p(`On ${RUN}, one condo was for sale in the building, a three-bedroom. With one, there is no range of prices or fees to give you. The oceanfront condos near the building are at the top of this page. ${h.a(MLSLINK, "See Atalaya Towers in our search")}.`) },

    { h2: "Is Atalaya Towers in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`Yes. FEMA's map, in the county's copy, puts all ${UNITS} parcels in its high-risk flood zone. In a big flood, FEMA's map puts the water level here at 13 feet above sea level (NAVD88). Water depth at a unit depends on its floor height.`) +
      h.p(`The map shows the county's lot drawing, not the walls or the floors. It does not say what a unit's insurance costs or whether the building has flooded.`) +
      h.p(`A lender usually asks for flood insurance on a home in a high-risk flood zone. The building's own policy has a say too. Our ${h.a("/buyers/flood-zone-check/", "flood zone check")} shows how we read it, and our ${h.a("/hoa/master-insurance-ho6/", "page on the building's policy and your own condo policy")} explains the split.`) },

    { h2: "Who owns condos at Atalaya Towers?", toc: "Owners", id: "owners", html: () =>
      h.p(`Most owners have a South Carolina mailing address. About ${Math.round(C.owner_out_of_sc / UNITS * 100)} in 100 have one outside the state, and Pennsylvania is the most common of those.`) +
      h.p(`A mailing address does not show where someone lives. About ${SHARE_HOME} in 100 condos are taxed as the owner's home. Of the nine buyers last year, ${SW1.buyer_tax_bill_out_of_sc} had a tax bill outside South Carolina and ${SW1.buyer_tax_bill_in_sc} had one inside it.`) },

    { h2: "Can you rent an Atalaya Towers condo by the night?", toc: "Renting it", id: "renting", html: () =>
      h.p(`A local manager lists units here for nightly rental. Its guest rules include no pets, no smoking, no golf carts and two parking passes a unit. Those are the manager's rules for guests, not the association's rules for owners.`) +
      h.p(`The association's own rules are not public. Ask whether owners can use another manager, whether short stays are allowed and whether there is a minimum stay. Our ${h.a("/invest/str-rules/", "short-term rental rules page")} covers the license and the taxes.`) +
      h.p(`Our ${h.a("/invest/rental-program-vs-airbnb/", "page on a rental program versus Airbnb")} shows the money both ways.`) },

    { h2: "What should you ask the association before you buy?", toc: "Our checks", id: "checks", html: (bg) =>
      h.p(`The monthly fee for the one condo for sale is not a range, so we do not print it. When we check a unit for a buyer, we ask the association for these:`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>The fee for the unit's size</strong>What it pays for, and the last two budgets.</li>`
        + `<li><strong>The reserve study</strong>For a tower listed as built in 1985, how the reserves compare with the work due.</li>`
        + `<li><strong>Special assessments</strong>Any planned or recent. Our ${h.a("/hoa/special-assessments/", "special assessments page")} shows what one can cost.</li>`
        + `<li><strong>Flood and wind cover</strong>What the building's policy covers, and what is left for your own policy.</li>`
        + `<li><strong>Rental rules</strong>Whether nightly rental is allowed, who may manage a unit and any minimum stay.</li>`
        + `<li><strong>Parking and transfer fees</strong>How many parking passes a unit has, and what the association charges at a sale.</li>`
        + `</ul>` +
      h.h3("Loans") +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.p(`To weigh it against other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/surfmaster/", "Surfmaster by the Sea")} (about half a mile) and ${h.a("/invest/condo-buildings/regency-towers/", "Regency Towers")} (about 7 miles). Farther north: ${h.a("/invest/condo-buildings/holiday-sands-south/", "Holiday Sands South")} (about 7 miles) and ${h.a("/invest/condo-buildings/paradise-resort/", "Paradise Resort")} (about 8 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Atalaya Towers Garden City Beach FAQ",
  faq: [
    { q: "Where is Atalaya Towers?", a: "Atalaya Towers is at 912 N Waccamaw Dr, Garden City Beach, SC 29576. It is on the oceanfront, about half a mile north of the Garden City Pier." },
    { q: "How many condos does Atalaya Towers have?", a: `The county records ${UNITS} condos. Unit numbers run up to the 17th floor and skip the 13th.` },
    { q: "When was Atalaya Towers built?", a: "The MLS lists it as built in 1985. That is one MLS record, so we check the year before an offer." },
    { q: "Is Atalaya Towers in a flood zone?", a: "Yes. FEMA's map puts all of the site in its high-risk flood zone. In a big flood it puts the water level at 13 feet above sea level (NAVD88). Water depth at a unit depends on its floor height. A lender usually asks for flood insurance on a home in a high-risk flood zone." },
    { q: "What do Atalaya Towers condos sell for?", a: `Nine sold in the past year, from about ${r5k(SW.all.min)} to ${r5k(SW.all.max)}, with a middle of about ${r5k(SW.all.median)}.` },
    { q: "Can you rent a unit at Atalaya Towers by the night?", a: "A local manager lists units for nightly rental. Ask the association whether owners may use another manager and whether there is a minimum stay." },
    { q: "How many Atalaya Towers condos are for sale?", a: `On ${RUN}, one condo was for sale in the building, a three-bedroom. The search link on this page shows the current count.` },
  ],
  sources: [
    { name: "rental manager's page", href: GCR },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the past year; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "See the Atalaya Towers condos for sale.",
    p: "Pick a condo from the strip above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: "/contact/",
  },
  keywords: "atalaya towers, atalaya towers garden city beach, atalaya towers condos for sale, atalaya towers garden city sc, atalaya towers hoa, 912 n waccamaw dr garden city beach",
  about: "Atalaya Towers, an oceanfront condo tower at 912 N Waccamaw Dr in Garden City Beach, South Carolina, with 79 condos in the county's records",
});
