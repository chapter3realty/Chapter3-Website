/* /invest/condo-buildings/sea-mist-resort/ - Sea Mist Resort, 1205 and 1207 S Ocean Blvd, Myrtle Beach: what owning a
 * studio there means, the HOA fee and what it pays, whether it is open, what 64 units sold for (Tides against
 * Driftwood), renting by the night, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Built from the Palace pilot (specs/palace-resort.js).
 * Facts: Blog-Brain batches/2026-11-e/sea-mist-resort/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md). Row 10 is the verifier's: the middle fee is $609, not the $625 bracket edge; row 12 and 14
 * are rebuilt from the $609 fee ($7,300 a year; $8,100 to $8,400 with tax). Rows 24 (the suit), 25 (2023 release) and
 * 33 (2023 and 2024 prices) stay off the page.
 * Data: data/2026-11-e/sea-mist-resort/ (listings.json, county.json, flood.json, tax.json, strips.json, photos.json).
 * Every count, fee, price, share and chart value is read from those files and checked against its ledger row with
 * must(); a changed file stops the build until a person reads the row again.
 * Picture: one USDA NAIP aerial (public domain), labelled from coordinates (images/label.py), until the photo partner's
 * shots arrive. Strips: three live strips (G.homesQ), no "send me" offer. Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/sea-mist-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "sea-mist-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), T = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`sea-mist-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/* The listings' read time (row 1). Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
/* Rows 2, 10, 15: 32 condos for sale at the lot, all studios, fee $609 to $649, asking $44,900 to $99,000. */
const FOR_SALE = L.at_sea_mist;
must(FOR_SALE === 32 && L.api_total === 34 && L.beds["0"] === 32, "row 2 or 10 counts changed");
const FX = L.fee_exact["0"];
must(FX.n === 32 && FX.lowest === 609 && FX.highest === 649, "row 10 fee changed");
const A = L.asking["0"];
must(A.n === 32 && A.median === 68950 && A.min === 44900 && A.max === 99000 && A.sqft_range.join() === "335,450", "row 15 changed");
/* Row 10 (CORRECTED): 23 of the 32 list $609 (the verifier read the cards). The 23 is typed; the file holds the lowest and the highest. */
const AT_LOWEST = 23;
/* Row 6: built 1977, all 32. */
must(L.year_built["1977"] === 32, "row 6 changed");
const BUILT = 1977, AGE = ry - BUILT;
must(AGE === 49, "row 6 age changed");
/* Row 3: one regime, 271 units, two towers. */
const TW = C.towers;
must(C.units === 271 && TW["2"].units === 99 && TW["2"].floors_highest === 11 && TW["5"].units === 169 && TW["5"].floors_lowest === 4 && TW["5"].floors_highest === 16 && C.other_units.length === 3, "row 3 changed");
/* Row 11: what the fee pays, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_insurance === 31 && FG.hoa_includes_water_sewer === 31 && FG.hoa_includes_trash === 31 && FG.hoa_includes_pest === 31 && FG.hoa_includes_internet === 29 && FG.hoa_includes_electric === 24, "row 11 changed");
/* Row 16: what the listings say about the units. */
must(FG.furnished === 32 && FG.ocean_view === 31 && FG.balcony === 27 && FG.pets_allowed === 2, "row 16 changed");
/* Row 17: recorded deeds, the directory's window. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30", "row 17 window changed");
must(SW.all.n === 64 && SW.all.median === 53000 && Math.round(SW.all.p25 / 1000) * 1000 === 46000 && SW.all.p75 === 59000 && C.sales.hub_window.units_sold_twice_or_more === 2, "row 17 changed");
const DISTINCT = SW.all.n - SW.units_sold_twice_or_more;
must(DISTINCT / C.units > 0.2 && DISTINCT / C.units < 0.25, "row 17 share changed");
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 18: Tides against Driftwood. */
const TS = SW.tower_2, DS = SW.tower_5;
must(TS.n === 27 && TS.median === 56000 && TS.p25 === 54000 && TS.p75 === 67500 && DS.n === 37 && DS.median === 47500 && DS.p25 === 43250 && DS.p75 === 54000, "row 18 changed");
const GAP = TS.median - DS.median;
/* Rows 12 to 14 (CORRECTED to the $609 fee): a year of fees, tax at the rental rate, the line. */
const FEE_YEAR = FX.lowest * 12;
must(r100(FEE_YEAR) === "$7,300", "row 12 changed");
must(Math.round(FEE_YEAR / SW.all.median * 100) === 14, "row 12 share changed");
const MILLS = 254.6;
const TAX_LOW = SW.all.median * 0.06 * MILLS / 1000;
must(T.units_at_6pct === 252 && T.implied_tax_city_millage.median === 1108 && Math.round(TAX_LOW) === 810, "row 13 changed");
const TAX_HIGH = T.implied_tax_city_millage.median;
must(r100(TAX_LOW) === "$800" && r100(TAX_HIGH) === "$1,100", "row 13 rounding");
const YEAR_LOW = FEE_YEAR + TAX_LOW, YEAR_HIGH = FEE_YEAR + TAX_HIGH;
must(r100(YEAR_LOW) === "$8,100" && r100(YEAR_HIGH) === "$8,400", "row 14 changed");
/* Row 14a: taxed as the owner's home. */
must(C.taxed_as_home_4pct === 19 && Math.round(C.units / C.taxed_as_home_4pct) === 14, "row 14a changed");
/* Row 22: flood zones under the lot. */
const share = (fn) => FL.zones_touching.filter(fn).reduce((s, z) => s + z.share_of_footprint, 0);
const VE = share((z) => z.attributes.FLD_ZONE === "VE"), AE = share((z) => z.attributes.FLD_ZONE === "AE"), SHADED = share((z) => /0\.2 PCT/.test(z.attributes.FLD_ZONE)), NONE = FL.share_in_no_zone;
const pc = (v) => Math.round(v * 100);
must(pc(VE) === 13 && pc(AE) === 13 && pc(SHADED) === 34 && pc(NONE) === 40 && pc(VE) + pc(AE) + pc(SHADED) + pc(NONE) === 100 && pc(VE + AE) === 26, "row 22 changed");
/* Row 29: every studio under 500 square feet. */
must(A.sqft_range[1] < 500, "row 29 changed");
/* Row 23: rentals, by the listings' flags. */
must(FG.str_allowed === 28 && FG.vacation_rental_program === 23, "row 23 changed");
/* Row 31: the strips' searches and counts, as read on the run day (strips.json holds the first read; the three below were re-run). */
const NEAR = `near=${FL.footprint_center[0]},${FL.footprint_center[1]}`;
must(FL.footprint_center.join() === "33.67498,-78.898459", "row 7 center changed");

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
/* The picture: one labelled NAIP aerial (public domain), under its sentence.     */

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/sea-mist-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* Two charts, each with one message.                                             */

const SALES_BARS = G.bars([
  { name: `Tides, ${TS.n} sales`, value: TS.median, valueText: money(TS.median) },
  { name: `Driftwood, ${DS.n} sales`, value: DS.median, valueText: money(DS.median) },
], {
  caption: "Tides units sold for more than Driftwood units",
  nameLabel: "Tower", valueLabel: "Middle sale price", compact: true, max: 70000,
  note: `Each bar is the middle sale price. The middle half of sales ran ${money(TS.p25)} to ${money(TS.p75)} in Tides and ${money(DS.p25)} to ${money(DS.p75)} in Driftwood. Deeds of $10,000 or more, recorded in the ${PERIOD}. The next year's sales agree.`,
});
const FLOOD_BARS = G.bars([
  { name: "Coastal high-hazard zone (VE)", value: pc(VE), valueText: `${pc(VE)}%` },
  { name: "Other high-risk zone (AE)", value: pc(AE), valueText: `${pc(AE)}%` },
  { name: "Shaded moderate-risk zone", value: pc(SHADED), valueText: `${pc(SHADED)}%` },
  { name: "Not in a high-risk or shaded zone", value: pc(NONE), valueText: `${pc(NONE)}%`, reference: true },
], {
  caption: "About 1 in 4 of the Sea Mist lot is in FEMA's high-risk zones",
  nameLabel: "FEMA zone", valueLabel: "Share of the lot", compact: true, max: 100, format: (v) => `${v}%`,
  note: "Share of the lot's area on the county's drawing of FEMA's flood map. It does not place each tower inside the lot.",
});

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const MGR1 = "https://www.vacasa.com/unit/1026197";
const MGR2 = "https://casagomyrtlebeach.com/449621/";

/* The lot as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Sea Mist Resort", alternateName: ["Sea Mist", "Sea Mist Oceanfront Resort"],
  description: `A condo resort with two towers, Tides and Driftwood, and ${C.units} condos on South Ocean Boulevard in Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "1207 S Ocean Blvd", addressLocality: "Myrtle Beach", addressRegion: "SC", postalCode: "29577", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* ---------------------------------------------------------------------------- */
/* Strips (round 2, owner 2026-11-14): live homes, no "send me" offer. Each search checked on the live site the build day.
   The MLS word "Sea Mist Resort" alone returns 34 and an empty strip: the max keeps it filled, the near keeps the
   1207 N Ocean Blvd listing out (facts row 31). The 32 here is the whole building under $100,000; the top ask is $99,000. */
const BASE = `subdivision=Sea Mist Resort&${NEAR}&miles=0.3`;
const STRIP = G.homesQScript() + G.homesQ(`${BASE}&max=100000`, "Own a studio at Sea Mist Resort, on South Ocean Boulevard");
const STRIP_CHEAP = G.homesQ(`${BASE}&max=60000`, "Sea Mist condos for $60,000 or less");
const STRIP_BIG = G.homesQ(`${NEAR}&miles=1&type=condo&has=oceanfront_unit&beds=2`, "Two-bedroom oceanfront condos near Sea Mist");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Sea Mist Myrtle Beach Condos for Sale: Fees From ${money(FX.lowest)}`,
  description: `Sea Mist Resort, 1207 S Ocean Blvd, Myrtle Beach: condos for sale, the HOA fee and what it pays, Tides against Driftwood, and what ${SW.all.n} units sold for.`,
  ogTitle: "Sea Mist Resort, Myrtle Beach: studio condos for sale, HOA fees, sales and what is open",
  crumb: "Sea Mist",
  eyebrow: "Sea Mist Resort, Myrtle Beach",
  h1: "Sea Mist Resort, Myrtle Beach: owning a studio in the Tides or Driftwood tower.",
  h1em: "The lowest-priced condos in our oceanfront directory, and what to check first.",
  sub: `${FOR_SALE} Sea Mist studios for sale, one fee band, what it pays, what ${SW.all.n} units sold for, and what is open.`,
  heroMedia: glance([
    { icon: "key", label: "For sale now", text: "All studios" },
    { icon: "home", label: "Two towers", text: `${C.units} condos` },
    { icon: "calendar", label: "Built", text: `${BUILT}` },
    { icon: "dollar", label: "Typical sale", text: r1k(SW.all.median) },
  ]),
  /* The homes strip under the short answer is the first offer (owner, 2026-11-08). */
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Sea Mist Resort is a ${BUILT} condo resort on South Ocean Boulevard. On ${RUN_MD}, all ${FOR_SALE} condos for sale there were studios, which are one-room units with no separate bedroom. A typical unit sold for about ${r1k(SW.all.median)} in the past year.`,
    `The homeowners association fee, or HOA fee, is ${money(FX.lowest)} to ${money(FX.highest)} a month. In listings we read on ${RUN_MD}, two rental managers say the pools are not open.`,
    `This is not a booking page, and we cannot confirm the resort's current booking site.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Sea Mist is one of 47 buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own at Sea Mist?", toc: "Owning here", id: "owning", html: () =>
      h.p(`A typical Sea Mist unit sold for well under half of what a unit at the ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} did. Of the 47 buildings in our directory, it had the lowest price and the most sales.`) +
      h.p(`Sea Mist is one condo property with two towers. Tides has ${TW["2"].units} condos and Driftwood has ${TW["5"].units}. The county lists three more units: two for utilities and a penthouse.`) +
      PHOTO +
      h.p(`Every condo for sale on ${RUN_MD} was a studio of ${A.sqft_range[0]} to ${A.sqft_range[1]} square feet. All the listings say furnished, nearly all say an ocean view, and most say a balcony. All were built in ${BUILT}.`) +
      h.p(`Family Kingdom's rides are about 0.6 mile north in a straight line. Springmaid Pier is about 1.7 miles south.`) +
      h.p(`A building this old needs a close read of its reserve study, the association's savings plan for big repairs. That is the first thing we check, in the last section.`) },

    { h2: "Is Sea Mist Resort closed?", toc: "Is it open?", id: "open", html: () =>
      h.p(`Parts of it appear to be. In listings we read on ${RUN_MD}, two rental managers say all pools are unavailable for guest use, with no reopening date. One adds that the mini water park across the street and the movie theater are not available to guests. Both listings are undated, so we cannot say since when.`) +
      h.p(`We cannot say for the resort's hotel side. That is the operator's business, and we found no current official website for it.`) +
      h.p(`If you plan to own here, ask the association which amenities are open now. Ask what its budget assumes for them and whether an assessment is planned. An assessment is a one-time extra bill to every owner. Ask a rental manager how the closed pools affect bookings. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.`) },

    { h2: "What are the HOA fees at Sea Mist?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`The HOA fee is what every owner pays each month to the association that runs the building. ${AT_LOWEST} of the ${FOR_SALE} condos for sale list the low end, ${money(FX.lowest)}. Every one is a studio, so there is one fee band and no price list by size.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Building insurance, water and sewer, trash, pest control</strong>Nearly every listing says the fee pays each of these.</li>`
        + `<li><strong>Internet</strong>Most listings say the fee pays it.</li>`
        + `<li><strong>The electric bill</strong>${FG.hoa_includes_electric} of ${FOR_SALE} listings say the fee pays it. Agents fill in these fields, so we ask the association for the written list.</li>`
        + `<li><strong>Not in the fee</strong>The inside of your unit. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.</li>`
        + `</ul>` +
      h.h3("What a year costs before any loan") +
      h.p(`A studio costs about ${r100(YEAR_LOW)} to ${r100(YEAR_HIGH)} a year to hold, before your own insurance and any power bill. A year of fees is about 1 in 7 of what a typical unit sold for.`) +
      h.table(["Each year, per studio", "About"], [
        [`HOA fees at ${money(FX.lowest)} a month`, r100(FEE_YEAR)],
        ["Property tax as a rental, before any exemption", `${r100(TAX_LOW)} to ${r100(TAX_HIGH)}`],
        ["<strong>Total</strong>", `<strong>${r100(YEAR_LOW)} to ${r100(YEAR_HIGH)}</strong>`],
      ]) +
      h.h3("How we figured the tax") +
      `<ul class="c3-pr-list">`
        + `<li><strong>The rate</strong>South Carolina taxes a rental or second home on 6 percent of its value.</li>`
        + `<li><strong>The low figure</strong>The middle sale price, at the City of Myrtle Beach's 2026 rate.</li>`
        + `<li><strong>The high figure</strong>The county's current values, which sit above recent sales. After a sale the county reappraises the unit near its price.</li>`
        + `</ul>` +
      h.p(`The tax bill and the deed of any one unit are free in our ${h.a("/buyers/property-records/", "property records lookup")}. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the rate for a home you live in.`) +
      h.cta("Know Sea Mist's budget before you offer", "We ask the association for its budget, its reserve study and any planned assessment, and send them to you before you offer.", "Have us get Sea Mist's budget", "/contact/", bg) },

    { h2: "What have Sea Mist condos sold for?", toc: "Sales", id: "sales", html: (bg) =>
      h.p(`${SW.all.n} units sold in the ${PERIOD} by Horry County's deed records, at about ${r1k(SW.all.median)} in the middle. That is more than 1 in 5 of the ${C.units} condos in the two towers.`) +
      SALES_BARS +
      h.p(`Tides units sold for about ${money(GAP)} more in the middle than Driftwood units. Each tower had more than 20 sales.`) +
      h.cta("Thinking of selling a Sea Mist unit?", "An agent prices it from these recorded sales and the units for sale now. We never price a home from an automated value.", "Have us price a Sea Mist unit", "/contact/", bg) +
      h.p(`The ${FOR_SALE} for sale on ${RUN_MD} ask about ${r1k(A.median)} in the middle. Asking ran above recent sales, so we price an offer from the sales.`) +
      STRIP_CHEAP },

    { h2: "Can you rent a Sea Mist condo by the night?", toc: "Renting it", id: "renting", html: () =>
      h.h3("What the listings say") +
      h.p(`Most listings say yes. ${FG.str_allowed} of the ${FOR_SALE} say short-term rentals are allowed, and ${FG.vacation_rental_program} say the unit is in a vacation rental program. The city's license and taxes are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.`) +
      h.h3("What it means for a loan") +
      h.p(`In our agents' experience, buildings with a rental program are usually non-warrantable, meaning many standard mortgages will not cover them, which narrows the loans that fit. Buyers pay a transfer fee, a one-time charge when a unit changes hands, and often a few months of dues up front.`) +
      h.h3("What we could not find") +
      h.p(`We could not read who runs the owners' rental program now, so we ask before you offer.`) +
      h.h3("What it earns") +
      h.p(`The money both ways is on our ${h.a("/invest/rental-program-vs-airbnb/", "rental program versus Airbnb page")}. What units earn across Myrtle Beach is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. No public source gives income for Sea Mist alone, so we print no figure.`) +
      h.p(`A studio too small for you? Two-bedroom condos are nearby.`) +
      STRIP_BIG },

    { h2: "What we check before you buy at Sea Mist", toc: "Our checks", id: "checks", html: () =>
      FLOOD_BARS +
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>About 1 in 4 of the lot is in FEMA's high-risk zones, and ${pc(VE)} percent is in the coastal high-hazard zone. We check the flood map for the building itself and the flood cover in the building's policy. Our ${h.a("/buyers/flood-zone-check/", "flood zone page")} shows how.</li>`
        + `<li><strong>The building's age</strong>Built in ${BUILT}. We read the reserve study, which is the savings plan for big repairs, the last two budgets and the minutes for any planned assessment. We also ask whether any other association or resort fee comes on top of the building's fee.</li>`
        + `<li><strong>Who uses the units</strong>About 1 in ${Math.round(C.units / C.taxed_as_home_4pct)} units is taxed as the owner's home. The rest pay the higher rate for second homes and rentals.</li>`
        + `<li><strong>If you will use a loan</strong>Every studio for sale is under 500 square feet. A condotel loan is one for a condo in a building with a rental program. One published program asks for at least 500 square feet and a separate bedroom, so it would not fit a studio here. Ask a lender before you choose a unit.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Sea Mist unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.p(`To weigh Sea Mist against the other 46 buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/bay-view-resort/", "Bay View Resort")} (about 1 mile) and ${h.a("/invest/condo-buildings/carolinian-beach-resort/", "Carolinian Beach Resort")} (about 3 miles). Farther north: ${h.a("/invest/condo-buildings/patricia-grand/", "Patricia Grand")} (about 3 miles) and ${h.a("/invest/condo-buildings/ocean-forest-villas/", "Ocean Forest Villas")} (about 5 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/landmark-resort/", "Landmark Resort")} (under half a mile) and ${h.a("/invest/condo-buildings/palace-resort/", "Palace Resort")} (under half a mile). Farther south: ${h.a("/invest/condo-buildings/grand-atlantic/", "Grand Atlantic")} (about 1 mile) and ${h.a("/invest/condo-buildings/paradise-resort/", "Paradise Resort")} (about 1 mile).`) /* end sibling-links */ },
  ],
  faqTitle: "Sea Mist Resort Myrtle Beach FAQ",
  faq: [
    { q: "When was Sea Mist Resort in Myrtle Beach built?", a: `The listings give ${BUILT} as the year built for all ${FOR_SALE} condos for sale, so the buildings are about ${AGE} years old.` },
    { q: "Which tower is Tides and which is Driftwood?", a: `The county numbers Tides units from floor 1 to ${TW["2"].floors_highest}, and Driftwood units from floor ${TW["5"].floors_lowest} to ${TW["5"].floors_highest}. Listings name units numbered from 20000 Tides and from 50000 Driftwood.` },
    { q: "Is Sea Mist a hotel or condos?", a: `The name covers both. This page is about the ${C.units} condos, which are owned one by one. We cannot confirm the hotel side's status.` },
    { q: "Is the Sea Mist water park open?", a: `A rental manager's listing says the mini water park across the street is not available to guests. Ask the association what is open.` },
    { q: "Is Sea Mist pet friendly?", a: `${FG.pets_allowed} of the ${FOR_SALE} listings say pets are allowed. The association's rules decide, and we read them before you offer.` },
    { q: "What is the address of Sea Mist Resort?", a: "The Sea Mist condos are at 1205 and 1207 S Ocean Blvd, Myrtle Beach, SC 29577, on South Ocean Boulevard in Myrtle Beach." },
    { q: "How many Sea Mist condos are for sale?", a: `On ${RUN}, ${FOR_SALE} Sea Mist condos were for sale, all studios, asking ${r1k(A.min)} to ${money(A.max)}.` },
  ],
  sources: [
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
    { name: "2026 tax levy", href: LEVY },
    { name: "rental manager listing", href: MGR1 },
    { name: "second rental manager listing", href: MGR2 },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Book a showing at Sea Mist.",
    p: "Tell us the days you are here and which tower you like. An agent shows you the Sea Mist units for sale.",
    label: "Book a showing at Sea Mist", href: "/contact/",
  },
  keywords: "Sea Mist Myrtle Beach, Sea Mist Resort Myrtle Beach condos for sale, Sea Mist Resort Driftwood building, Sea Mist Myrtle Beach HOA fees, 1207 S Ocean Blvd Myrtle Beach, Sea Mist Resort Tides building",
  about: "Sea Mist Resort, a 271-condo resort with two towers at 1205 and 1207 S Ocean Blvd, Myrtle Beach, South Carolina",
});
