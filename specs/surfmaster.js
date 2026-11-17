/* /invest/condo-buildings/surfmaster/ - Surfmaster by the Sea, 1690 and 1620 N Waccamaw Dr, Garden City Beach:
 * two towers on N Waccamaw Dr, 145 condos on about two acres, what is for sale, the HOA fee, nightly rentals,
 * what units sold for, flood, and what we check before an offer.
 *
 * Batch 2026-11-f, Lane N. Version 1, 2026-11-17. Built the way bay-view-resort.js was.
 * Facts: Blog-Brain batches/2026-11-f/surfmaster/facts.md, VERIFIED rows, and CORRECTED rows at the verifier's
 * wording only (VERIFY.md). The verifier found two units the pull scripts missed (145 homes, not 143):
 * data/2026-11-f/surfmaster/corrections.json holds that fix and the spec applies it with must().
 * Data: data/2026-11-f/surfmaster/ (listings.json, county.json, extra.json, corrections.json, photos.json, images/).
 * Every count, fee, price, share and chart value is read from those files here and checked against its ledger row.
 * Homes: two live strips (G.homesQ). Picture: one USDA NAIP aerial (public domain), labelled from coordinates. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/surfmaster/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "surfmaster");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), X = read("extra.json"), FIX = read("corrections.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10k = (v) => money(Math.round(v / 10000) * 10000);
const must = (ok, msg) => { if (!ok) throw new Error(`surfmaster.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const RI = C.regimes.I, RII = C.regimes.II;
/* Rows 4 and 5 (CORRECTED): 73 + 72 = 145 homes. The files hold 72 + 71; the verifier added one unit to each tower. */
must(RI.units === 72 && RII.units === 71 && C.units_total === 143, "row 4 pulled counts changed");
const UNITS_I = FIX.units.I, UNITS_II = FIX.units.II, UNITS = UNITS_I + UNITS_II;
must(UNITS_I === RI.units + 1 && UNITS_II === RII.units + 1 && UNITS === 145, "row 4 corrected counts");
const fl = (R, fix) => { const o = { ...R.floors.units_per_floor }; for (const k in fix) o[k] = fix[k]; return o; };
const FI = fl(RI, FIX.floor_fix.I), FII = fl(RII, FIX.floor_fix.II);
const FLOORS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
must(RI.floors.top === 12 && RII.floors.top === 12 && RI.floors.numbers.join() === FLOORS.join(), "row 5 floors changed");
must(FLOORS.map((f) => FI[f]).join() === "6,7,7,7,7,7,6,6,5,4,3,2" && FLOORS.map((f) => FII[f]).join() === "7,7,7,7,7,7,6,4,5,4,3,2", "row 5 corrected homes per floor");
const PENT = 12;
must(RI.floors.top === 12 && RI.unparsed_unit_numbers === 6 && RII.unparsed_unit_numbers === 6, "row 6 penthouses changed");
const NUM_SUM = FLOORS.reduce((a, f) => a + FI[f] + FII[f], 0);
must(NUM_SUM === FIX.numbered_units.I + FIX.numbered_units.II && NUM_SUM + PENT === UNITS, "row 5 floors do not add to the homes");
/* Row 7 (CORRECTED): 1.13 + 0.96 = 2.09 acres of common-area parcels; 145 / 2.09 is about 69 homes an acre. */
must(RI.acreage_common_area[0] === 1.13 && RII.acreage_common_area[0] === 0.96, "row 7 acreage changed");
const ACRES = RI.acreage_common_area[0] + RII.acreage_common_area[0];
const PER_ACRE = Math.round(UNITS / ACRES);
must(PER_ACRE === 69, "row 7 homes an acre changed");
/* Rows 1, 8, 12, 13, 14: for sale now. */
const A = L.asking, FG = L.flags;
must(L.api_total === 3 && L.pins === 3 && L.subdivision_field["SURFMASTER I"] === 2 && L.subdivision_field["SURFMASTER II"] === 1, "row 1 changed");
must(L.beds["1"] === 2 && L.beds["3"] === 1 && A.min === 299900 && A.max === 749999 && L.sqft.join() === "890,1420", "row 12 changed");
must(L.hoa_monthly_range.join() === "640,896", "row 13 fee range changed");
must(FG.hoa_includes_trash === 3 && FG.hoa_includes_water_sewer === 3 && FG.hoa_includes_cable === 3 && FG.hoa_includes_internet === 2 && FG.hoa_includes_insurance === 1, "row 13 flags changed");
must(FG.str_allowed === 3 && FG.rentals_allowed === 3 && FG.vacation_rental_program === 1, "row 14 changed");
must(L.year_built["1984"] === 2 && L.year_built["1994"] === 1, "row 8 changed");
const FEE_LO = L.hoa_monthly_range[0], FEE_HI = L.hoa_monthly_range[1];
const RATIO = Math.round(A.max / A.min * 2) / 2;
must(RATIO === 2.5, "asking ratio changed");
/* Row 15: recorded deeds in the year to September 2026. */
const SI = RI["sales_window_1_2025-10-01_to_2026-09-30"], SII = RII["sales_window_1_2025-10-01_to_2026-09-30"], SA = X["combined_sales_2025-10-01_to_2026-09-30"];
must(SI.n === 6 && SI.median === 616250 && SI.min === 515000 && SI.max === 670000, "row 15 tower I changed");
must(SII.n === 7 && SII.median === 535000 && SII.min === 310000 && SII.max === 740000, "row 15 tower II changed");
must(SA.n === 13 && SA.median === 602500 && SA.under_400k === 2 && SA.over_500k === 10, "row 15 together changed");
const ONE_IN = Math.round(UNITS / SA.n);
must(ONE_IN === 11, "row 15 share changed");
const PERIOD = "12 months to September 2026";
/* Row 20: flood shares under each common-area lot. */
const zsum = (R, z) => R.flood.zones_touching.filter((x) => x.attributes.FLD_ZONE === z).reduce((a, x) => a + x.share_of_footprint, 0);
const VE_I = Math.round(zsum(RI, "VE") * 100), VE_II = Math.round(zsum(RII, "VE") * 100);
const AE_I = 100 - VE_I, AE_II = 100 - VE_II;
must(Math.abs(RI.flood.share_in_no_zone) < 0.005 && Math.abs(RII.flood.share_in_no_zone) < 0.005 && VE_I === 14 && VE_II === 17, "row 20 changed");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`, RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;
const LAT = 33.589073, LNG = -78.987089;
must(RI.flood.footprint_center[0] === LAT && RI.flood.footprint_center[1] === LNG, "row 2 center changed");

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
  + `${S} .c3-pr-list{list-style:none;padding:0;margin:1rem 0 1.4rem;max-width:720px}`
  + `${S} .c3-pr-list li{margin:0;padding:.8rem 0 .85rem;border-top:${RULE};color:var(--muted);line-height:1.65}`
  + `${S} .c3-pr-list li:last-child{border-bottom:${RULE}}${S} .c3-pr-list strong{color:var(--navy);display:block;margin-bottom:.15rem}`
  + `${S} .c3-pr-up{margin:1.4rem 0 0;max-width:720px;color:var(--muted);line-height:1.7}`
  + `${S} .c3-gchart,${S} .c3-cc,${TBL}{max-width:720px!important;box-sizing:border-box}`
  /* Plain tables under thin rules, no card (garden-city.js design pass). */
  + `${TBL}{${FLAT};padding:0!important}${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  /* The homes strip under the short answer, with room before the first heading. */
  + `${S} .detail-sub:empty{display:none}`
  /* The end band: the bar pages' rounded card (garden-city.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  + `@media (max-width:359px){${S} .hx-feed .hx-fb-ai,${S} label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}}`
  + "</style>";

/* ---------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------- */
/* The picture: one labelled NAIP aerial (public domain), under its sentence.     */

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/surfmaster-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The charts and tables.                                                         */

/* Visual 1 (the wow): homes per floor, both towers together, top of the building first. */
const both = (f) => FI[f] + FII[f];
const FLOOR_ROWS = [{ name: "Penthouses", value: PENT, valueText: `${PENT} homes` }]
  .concat(FLOORS.slice().reverse().map((f) => ({ name: `Floor ${f}`, value: both(f), valueText: `${both(f)} homes` })));
const FLOOR_CHART = G.bars(FLOOR_ROWS, {
  caption: `Surfmaster gets narrower as it rises: across both towers, ${both(2)} homes a floor low down and ${both(12)} on floor 12`,
  nameLabel: "Floor", valueLabel: "Homes on the floor, both towers", compact: true, max: 16, format: (v) => `${v} homes`,
  note: "Homes by the floor in the unit number, from Horry County parcel records, both towers added together. Six penthouses sit on top of each tower. The county lists 4 homes on floor 8 of Surfmaster II and 6 on floor 7.",
});
must(both(2) === 14 && both(12) === 4 && both(1) === 13, "chart title no longer matches its values");

const TOWERS = compareCards([
  { name: "Surfmaster I", bestFor: "1690 N Waccamaw Dr",
    cells: { homes: `${UNITS_I}`, built: "1984", sale: `${L.subdivision_field["SURFMASTER I"]} one-bedrooms` } },
  { name: "Surfmaster II", bestFor: "1620 N Waccamaw Dr",
    cells: { homes: `${UNITS_II}`, built: "1994", sale: `${L.subdivision_field["SURFMASTER II"]} three-bedroom` } },
], [
  { key: "homes", label: "Homes", num: true },
  { key: "built", label: "Year built, per the MLS" },
  { key: "sale", label: `For sale ${RUN_SHORT}` },
], { caption: "The two towers side by side", nameLabel: "Tower", bestForLabel: "Address" });

const SALES = G.bars([
  { name: `Surfmaster I (${SI.n} sales)`, value: SI.median, valueText: `About ${r1k(SI.median)}` },
  { name: `Surfmaster II (${SII.n} sales)`, value: SII.median, valueText: `About ${r1k(SII.median)}` },
], {
  caption: `Surfmaster I units sold for about ${r1k(SI.median)} in the middle; Surfmaster II units for about ${r1k(SII.median)}`,
  nameLabel: "Tower", valueLabel: "Middle sale price", compact: true, max: Math.round(SI.median * 1.3),
  note: `Recorded deeds, ${PERIOD}. Surfmaster I sold from ${r5k(SI.min)} to ${r5k(SI.max)}; Surfmaster II from ${r5k(SII.min)} to ${r5k(SII.max)}. The deeds do not record bedrooms, so each middle price mixes unit sizes.`,
});
must(r1k(SI.median) === "$616,000" || r1k(SI.median) === "$616,000", "sales title");

const FLOOD = compareCards([
  { name: "Surfmaster I", bestFor: "Common-area lot",
    cells: { ae: `${AE_I} percent`, ve: `${VE_I} percent` } },
  { name: "Surfmaster II", bestFor: "Common-area lot",
    cells: { ae: `${AE_II} percent`, ve: `${VE_II} percent` } },
], [
  { key: "ae", label: "In the main flood plain" },
  { key: "ve", label: "In the wave strip" },
], { caption: "All of both lots sit in a FEMA high-risk zone", nameLabel: "Tower", bestForLabel: "Land" });

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const GCR = "https://www.gardencityrealty.com/surfmaster-by-the-sea-information";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const NFHL = "https://msc.fema.gov/portal/home";

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Surfmaster", alternateName: ["Surfmaster by the Sea", "Surfmaster I", "Surfmaster II"],
  description: `Two condo towers on N Waccamaw Dr in Garden City Beach, South Carolina, with ${UNITS} condos on about two acres.`,
  address: { "@type": "PostalAddress", streetAddress: "1690 N Waccamaw Dr", addressLocality: "Murrells Inlet", addressRegion: "SC", postalCode: "29576", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: LAT, longitude: LNG },
  containedInPlace: { "@type": "Place", name: "Garden City Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips, checked 2026-11-17 against /homes/api/strip: 3 and 32 homes. The MLS spells the buildings "SURFMASTER I" and "SURFMASTER II". */
const SUB = "subdivision=Surfmaster&type=condo";
const STRIP_JS = G.homesCss() + G.homesQScript();
const STRIP = G.homesQ(SUB, "Condos for sale at Surfmaster by the Sea");
const STRIP_NEAR = G.homesQ(`near=${33.5887},${-78.9873}&miles=1&type=condo&waterfront=1`, "Oceanfront condos within a mile of Surfmaster");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: "Surfmaster by the Sea Condos for Sale, Garden City SC",
  description: `Surfmaster by the Sea, Garden City Beach SC: two towers, ${UNITS} condos, the HOA fees, flood zones, rentals, and what ${SA.n} units sold for, with condos for sale now.`,
  ogTitle: "Surfmaster by the Sea, Garden City Beach: condos for sale in two towers",
  crumb: "Surfmaster",
  eyebrow: "Surfmaster by the Sea, Garden City Beach",
  h1: "Surfmaster by the Sea, Garden City Beach: condos for sale in two towers.",
  h1em: "A mile north of the Garden City Pier.",
  /* The homes strip sits right under the author line, ahead of the short answer: the sub paragraph closes, the strip, then the guest line. */
  sub: `Surfmaster has ${UNITS} condos in two towers on N Waccamaw Dr in Garden City Beach.</p>${STRIP}<p class="detail-sub">To book a stay instead, ask a rental manager such as ${h.ext(GCR, "Garden City Realty")}.`,
  heroMedia: STRIP_JS + glance([
    { icon: "key", label: "Homes", text: `${UNITS} homes` },
    { icon: "home", label: "Built", text: "1984 and 1994, per the MLS" },
    { icon: "beach", label: "Setting", text: "On N Waccamaw Dr" },
    { icon: "pin", label: "Where", text: "A mile north of the pier" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Surfmaster is two towers on N Waccamaw Dr in Garden City Beach, with ${UNITS} homes in all. ${L.api_total} are for sale on ${RUN_MD}, asking from about ${r10k(A.min)} for a one-bedroom to about ${r10k(A.max)} for a three-bedroom.`,
    `${SA.n} units sold in the past year, for about ${r10k(SA.median)} in the middle. Every part of both lots is in a FEMA flood zone, so we ask about flood and insurance before the view.`,
  ],
  sections: [
    { html: () => CSS + `<p class="c3-pr-up">To weigh Surfmaster against other buildings, see our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}. The mailing town is Murrells Inlet; the beach is Garden City, which our ${h.a("/submarkets/garden-city/", "Garden City page")} covers.</p>` },

    { h2: "What is Surfmaster by the Sea?", toc: "The towers", id: "towers", html: () =>
      h.p(`The two towers sit on about two acres, which is about ${PER_ACRE} homes an acre. Surfmaster I is at 1690 N Waccamaw Dr and Surfmaster II is at 1620, a short walk apart. The county has them as two separate condo records.`) +
      h.p(`Units are numbered by floor, up to floor 12, and each tower has six penthouses on top. The towers are widest low down and narrowest at the top: across both towers, ${both(2)} homes a floor low down and ${both(12)} on floor 12.`) +
      h.p(`The rental manager's pages list two oceanfront pools with hot tubs, elevators in both towers and some covered parking. The aerial photo below shows a pool beside each tower. The MLS lists 1984 as the year built for Surfmaster I and 1994 for Surfmaster II.`) +
      PHOTO },

    { h2: "Which tower, and what sizes?", toc: "Sizes", id: "sizes", html: () =>
      TOWERS +
      h.p(`The rental manager gives about 890 square feet for a one-bedroom, about 1,250 for a two-bedroom and about 1,570 for a three-bedroom. Penthouses run over 2,300. The MLS lists the one-bedrooms for sale at 890 and the three-bedroom at ${n(L.sqft[1])}.`) +
      h.p(`The one three-bedroom asks about ${RATIO === 2.5 ? "two and a half" : RATIO} times the lowest one-bedroom.`) },

    { h2: "What are the HOA fees at Surfmaster?", toc: "HOA fees", id: "hoa-fees", html: () =>
      h.p(`The HOA fee on the ${L.api_total} condos for sale is from ${money(FEE_LO)} to ${money(FEE_HI)} a month. The two towers do not list the same fee: Surfmaster I carries the lower one and Surfmaster II the higher one.`) +
      h.p(`The listing agents say the fee may include trash, water and sewer and cable on all ${L.api_total}, internet on ${FG.hoa_includes_internet} and the building's insurance on ${FG.hoa_includes_insurance}. We ask for the budget that shows it.`) +
      h.p(`Our pages on ${h.a("/hoa/special-assessments/", "special assessments")} and ${h.a("/hoa/reserves/", "reserves")} explain what else the fee has to cover.`) },

    { h2: "Can you rent a condo at Surfmaster?", toc: "Renting it", id: "renting", html: () =>
      h.p(`All ${L.api_total} condos for sale on ${RUN_MD} say short-term rentals are allowed, and ${FG.vacation_rental_program} says it is in a vacation rental program. The listing agent ticks that box. The rule itself is in the building's declaration, so we read it with you.`) +
      h.p(`Garden City Realty ran a rental office inside the building until the owners' association closed it in 2022, and it still rents units there. We do not book stays.`) +
      h.p(`The license and taxes for renting by the night are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.`) },

    { h2: "What have Surfmaster condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SA.n} units sold in the ${PERIOD}, by Horry County's deed records. That is about 1 in ${ONE_IN} homes in the two towers.`) +
      h.p(`The middle sale at Surfmaster I was about ${r1k(SI.median)}, and at Surfmaster II about ${r1k(SII.median)}. The deeds do not record bedrooms, so each middle mixes unit sizes.`) +
      h.p(`${SA.over_500k} of the ${SA.n} sold above $500,000 and ${SA.under_400k} sold below $400,000. A deed price can come from a family or business transfer, so we read each sale before we use it.`) +
      h.p(`Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home here.`) },

    { h2: "Is Surfmaster in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`Yes. FEMA's map puts all of both lots in a high-risk flood zone. Most of the land is in the main flood plain. The rest is in the coastal strip where waves reach.`) +
      h.p(`The map shows the county's lot drawing, not a single unit. Before you offer, get the flood certificate and a flood insurance quote for that unit. Our ${h.a("/buyers/flood-zone-check/", "flood zone check")} shows how.`) },

    { h2: "What to ask before you buy at Surfmaster", toc: "Our checks", id: "checks", html: (bg) =>
      `<ul class="c3-pr-list">`
        + `<li><strong>One association or two</strong>The county has two condo records. Ask whether the towers share one budget and one reserve.</li>`
        + `<li><strong>The reserve study</strong>Ask for the latest study and the last two budgets. Ask what roof, elevator and pool deck work has been paid for and what is planned.</li>`
        + `<li><strong>Special assessments</strong>Ask for the minutes for any planned or recent assessment. Our page on ${h.a("/hoa/special-assessments/", "special assessments")} shows what one can cost.</li>`
        + `<li><strong>The building's policy</strong>Ask for the master policy and its wind and flood deductible. Our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own")} explains the split.</li>`
        + `<li><strong>The rental rule</strong>Ask for the declaration and read what it says about nightly stays.</li>`
        + `<li><strong>Loans</strong>Many standard loans will not cover a unit if the association's finances or rentals fall outside their limits. Our page on ${h.a("/invest/non-warrantable-condos/", "non-warrantable condos")} has the details.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Surfmaster unit.`) +
      h.cta("Have us check a Surfmaster unit before you offer", "We ask the association for each document above for the unit you like, and our affiliated lender, BrickWood Mortgage, a separate company, looks at the unit.", "Have us check a Surfmaster unit", "/contact/", bg) +
      STRIP_NEAR +
      h.p(`To weigh Surfmaster against other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. Whether a condo suits you at all is on our ${h.a("/invest/condos/", "Myrtle Beach condos page")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/regency-towers/", "Regency Towers")} (about 7 miles) and ${h.a("/invest/condo-buildings/holiday-sands-south/", "Holiday Sands South")} (about 7 miles). Farther north: ${h.a("/invest/condo-buildings/paradise-resort/", "Paradise Resort")} (about 7 miles) and ${h.a("/invest/condo-buildings/grand-atlantic/", "Grand Atlantic")} (about 7 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/atalaya-towers/", "Atalaya Towers")} (about half a mile).`) /* end sibling-links */ },
  ],
  faqTitle: "Surfmaster by the Sea FAQ",
  faq: [
    { q: "Where is Surfmaster by the Sea?", a: "Surfmaster is on N Waccamaw Dr in Garden City Beach, about a mile north of the Garden City Pier. The towers are at 1690 and 1620 N Waccamaw Dr." },
    { q: "How many condos does Surfmaster have?", a: `The county records ${UNITS} homes: ${UNITS_I} in Surfmaster I and ${UNITS_II} in Surfmaster II.` },
    { q: "Is Surfmaster oceanfront?", a: "The rental managers list two oceanfront pools and call the 1690 tower Ocean Front. We check each unit's exact position before an offer." },
    { q: "Is Surfmaster in Garden City or Murrells Inlet?", a: "The beach is Garden City Beach. The mail goes to Murrells Inlet, ZIP 29576, so listings may show either name. Our Garden City page covers the beach town." },
    { q: "When was Surfmaster built?", a: "The MLS lists 1984 as the year built for Surfmaster I and 1994 for Surfmaster II. We have not read the county's own year-built field, so treat the years as the listing agents' entries." },
    { q: "Can you rent a Surfmaster condo by the night?", a: `All ${L.api_total} condos for sale say short-term rentals are allowed. The building's declaration has the rule, so we read it before you offer.` },
    { q: "Is there parking at Surfmaster?", a: "The rental manager lists ample parking, some of it covered, and assigns one parking pass to a one-bedroom guest and two to a larger unit. An owner's own parking rights are in the declaration." },
    { q: "What does Surfmaster I and II mean?", a: "Surfmaster I and Surfmaster II are the two towers. Surfmaster I is at 1690 N Waccamaw Dr and Surfmaster II is at 1620. The county and the MLS list them separately." },
  ],
  sources: [
    { name: "Garden City Realty, Surfmaster", href: GCR },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "FEMA flood map", href: NFHL },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Selling a unit at Surfmaster?",
    p: `Ask for the recent sales behind the ${SA.n}. We read the recorded deeds for your tower and size, and we do not use an automated value.`,
    label: "Ask about selling at Surfmaster", href: "/contact/",
  },
  keywords: "surfmaster, surfmaster by the sea, surfmaster garden city, surfmaster condos for sale, surfmaster by the sea rentals, 1690 n waccamaw dr, surfmaster by the sea hoa fees",
  about: "Surfmaster by the Sea, two condo towers at 1690 and 1620 N Waccamaw Dr, Garden City Beach, South Carolina",
});
