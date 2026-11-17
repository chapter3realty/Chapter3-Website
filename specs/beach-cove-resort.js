/* /invest/condo-buildings/beach-cove-resort/ - Beach Cove Resort, 4800 S Ocean Blvd, North Myrtle Beach: what owning
 * a condo there gives you (a 350-foot lazy river), the HOA fee by unit size and what it pays, renting by the night
 * (the resort's own program), what units sold for, and what we check before an offer.
 *
 * Batch 2026-11-e, Lane N. Version 1, 2026-11-14. Built the way palace-resort.js was.
 * Facts: Blog-Brain batches/2026-11-e/beach-cove-resort/facts.md, VERIFIED rows, and CORRECTED rows at the
 * verifier's wording only (VERIFY.md: rows 12, 15, 16, 19 corrected; struck wording in
 * batches/2026-11-e/facts/beach-cove-resort-struck.json). Demand: must-answer.md. Plan: PLAN.md.
 * Data: data/2026-11-e/beach-cove-resort/ (listings.json, county.json, flood.json, tax.json, photos.json, images/).
 * Every count, fee, price, share and chart value is read from those files here and checked against its
 * ledger row with must(); a changed file stops the build until a person reads the row again.
 * Picture: one USDA NAIP aerial (public domain), cropped and labelled from coordinates
 * (data/2026-11-e/beach-cove-resort/images/label.py; record in photos.json), until the photo partner's shots arrive.
 * Homes: two live strips (G.homesQ), checked 2026-11-14 against /homes/api/strip: 28 and 64 homes.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/beach-cove-resort/";
const DATA = path.join(__dirname, "..", "data", "2026-11-e", "beach-cove-resort");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const L = read("listings.json"), C = read("county.json"), FL = read("flood.json"), T = read("tax.json"), PHOTOS = read("photos.json").photos;

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5 = (v) => money(Math.round(v / 5) * 5);
const r50 = (v) => money(Math.round(v / 50) * 50);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const must = (ok, msg) => { if (!ok) throw new Error(`beach-cove-resort.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 1: 28 condos for sale, all at 4800 S Ocean Blvd. */
must(L.api_total === 28 && L.at_4800 === 28, "row 1 changed");
/* Row 3: 225 units, 221 of them condos. */
must(C.units === 225 && C.landuse_first_digit["1xx"] === 221 && C.landuse_first_digit["3xx"] === 4, "row 3 changed");
const UNITS = C.units, CONDOS = C.landuse_first_digit["1xx"];
/* Rows 4 and 5: built 1985 (21 one-bedrooms) and 1996 (7 two-bedrooms). */
must(L.year_built["1985"] === 21 && L.year_built["1996"] === 7 && L.beds["1"] === 21 && L.beds["2"] === 7, "row 4 changed");
/* Row 12 (CORRECTED): the fee by size, to the dollar. One-bedroom lowest $781, so "about $780". */
const FX = L.fee_exact;
must(FX["1"].n === 21 && FX["1"].lowest === 781 && FX["1"].highest === 1057, "row 12 one-bedroom fee changed");
must(FX["2"].n === 7 && FX["2"].lowest === 1100 && FX["2"].highest === 1104, "row 12 two-bedroom fee changed");
const FEE = [FX["1"].lowest, (FX["2"].lowest + FX["2"].highest) / 2];
must(r5(FEE[0]) === "$780" && r5(FEE[1]) === "$1,100", "row 12 rounding");
const FEE_YEAR = FEE.map((f) => f * 12);
/* Row 13: what the fee pays, by the listings' own flags. */
const FG = L.flags;
must(FG.hoa_includes_trash === 27 && FG.hoa_includes_water_sewer === 27 && FG.hoa_includes_internet === 21 && FG.hoa_includes_electric === 20 && FG.hoa_includes_pest === 19, "row 13 changed");
/* Row 17: asking prices now. */
const A = L.asking;
must(A["1"].median === 214900 && A["1"].min === 170000 && A["2"].median === 369900 && A["2"].min === 348000 && A["2"].max === 375500, "row 17 changed");
must(A["1"].sqft_range.join() === "637,637" && A["2"].sqft_range.join() === "897,897", "row 5 sizes changed");
/* Rows 14 and 15 (CORRECTED): tax at the rental rate, 6 percent of value at 221.2 mills, on the asking middle. */
must(T.units_at_6pct === 219, "row 14 changed");
const MILLS = 221.2;
const TAX = [A["1"].median, A["2"].median].map((p) => p * 0.06 * MILLS / 1000);
must(Math.round(TAX[0]) === 2852, "row 15 tax changed");
const HOLD = [FEE_YEAR[0] + TAX[0], FEE_YEAR[1] + TAX[1]];
/* Parts and totals are rounded to $50 so each column adds up. Verifier: about $12,200 for a one-bedroom. */
const P50 = (v) => Math.round(v / 50) * 50;
const PF = FEE_YEAR.map(P50), PT = TAX.map(P50), PH_TOT = PF.map((f, i) => f + PT[i]);
must(PF[0] === 9350 && PT[0] === 2850 && PH_TOT[0] === 12200, "row 15 one-bedroom year changed");
must(Math.abs(PH_TOT[1] - HOLD[1]) <= 100, "row 15 two-bedroom total drifted");
/* Row 18: recorded deeds, the directory's window. Row 19 (CORRECTED): by the county's value for the unit. */
const SW = C.sales.hub_window;
must(SW.window === "2025-10-01 to 2026-09-30" && SW.all.n === 24 && SW.all.median === 171000, "row 18 changed");
const SV = C.sales_by_value.window_1;
must(SV.window === SW.window && SV.under_250k.n === 18 && SV.under_250k.median === 164500 && SV["300k_up"].n === 6 && SV["300k_up"].median === 392500, "row 19 changed");
must(SV.under_250k.n + SV["300k_up"].n === SW.all.n, "row 19 groups no longer add to the 24 sales");
must(SV["300k_up"].median > 2 * SV.under_250k.median, "row 19: the chart title says more than twice");
must(A["1"].median > SV.under_250k.median, "row 17 vs 19: asking one-bedrooms are no longer above recent sales; rewrite the sentence");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const [, wy, wm] = SW.window.match(/to (\d{4})-(\d{2})-\d{2}$/);
const PERIOD = `12 months to ${MONTHS[+wm - 1]} ${wy}`;
/* Row 20: owners who get the tax bill outside South Carolina. */
must(C.owner_out_of_sc === 174 && Math.round(C.owner_out_of_sc / UNITS * 4) === 3, "row 20 changed");
/* Row 22: rentals, by the listings' flags. */
must(FG.str_allowed === 25 && FG.vacation_rental_program === 28, "row 22 changed");
/* Row 24: flood zones under the lot (the county's flood map). */
const zs = FL.zones_touching;
const VE = zs.find((z) => z.attributes.FLD_ZONE === "VE"), AEs = zs.filter((z) => z.attributes.FLD_ZONE === "AE");
must(VE.share_of_footprint === 0.185 && AEs.length === 2 && Math.round((AEs[0].share_of_footprint + AEs[1].share_of_footprint) * 100) === 81 && FL.share_in_no_zone === 0.001, "row 24 changed");
/* Row 6, 8: counts from the listings' flags. */
must(FG.oceanfront_unit === 27 && FG.indoor_pool === 24, "rows 6, 8 changed");
/* Row 16: pets, FAQ only. */
must(FG.pets_allowed === 16, "row 16 changed");
/* The listings' read time. Every count of condos for sale prints the day it ran (owner, 2026-11-03). */
must(/^2026-11-1\d/.test(L.refreshedAt), "listings.json is not this week's read; rerun the pulls");
const [ry, rm, rd] = L.refreshedAt.slice(0, 10).split("-").map(Number);
const RUN = `${MONTHS[rm - 1]} ${rd}, ${ry}`;
const RUN_SHORT = `${MONTHS[rm - 1].slice(0, 3)}. ${rd}`, RUN_MD = `${MONTHS[rm - 1]} ${rd}`;

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main (the Palace page's design).                   */

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

const AERIAL = PHOTOS.find((p) => p.file.endsWith("/beach-cove-resort-from-above-1200w.webp"));
must(AERIAL, "no photo record for the aerial");
const PHOTO = PH.heroPhoto(AERIAL, { alt: AERIAL.alt, caption: AERIAL.caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 640px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([{ photo: AERIAL, caption: AERIAL.caption.replace(/\.$/, "") }])
  .replace("Chapter3 Realty resized these photos and cropped some of them.", "Chapter3 Realty resized and cropped this photo.");
must(CREDITS.includes("resized and cropped this photo."), "credits note wording changed in photos.js");

/* ---------------------------------------------------------------------------- */
/* The fee table (rows 5, 12, 17) and the sales chart (row 19).                   */

const SIZES = [
  { name: "One-bedroom", k: "1", built: "1985", sleeps: 6 },
  { name: "Two-bedroom", k: "2", built: "1996", sleeps: 8 },
];
const FEE_TABLE = compareCards(SIZES.map((s, i) => ({
  name: s.name,
  bestFor: `${A[s.k].sqft_range[0]} sq ft, built ${s.built}`,
  cells: { fee: `About ${r5(FEE[i])}`, ask: `About ${r1k(A[s.k].median)}`, sale: `${L.beds[s.k]}` },
})), [
  { key: "fee", label: "HOA fee a month", num: true },
  { key: "ask", label: "Middle asking price", num: true },
  { key: "sale", label: `For sale ${RUN_SHORT}`, num: true },
], { caption: "At Beach Cove, the fee goes by the tower and the size", nameLabel: "Unit", bestForLabel: "Size" });

const SALES = G.bars([
  { name: `Under $250,000 on the county's books (${SV.under_250k.n} sales)`, value: SV.under_250k.median, valueText: `About ${r1k(SV.under_250k.median)}` },
  { name: `$300,000 or more on the county's books (${SV["300k_up"].n} sales)`, value: SV["300k_up"].median, valueText: `About ${r1k(SV["300k_up"].median)}` },
], {
  caption: "A Beach Cove two-bedroom sells for more than twice what a one-bedroom does",
  nameLabel: "Units", valueLabel: "Middle sale price", compact: true, max: Math.round(SV["300k_up"].median * 1.4),
  note: `Recorded deeds, ${PERIOD}. Sales ran from ${r100(SV.under_250k.min)} to ${r100(SV.under_250k.max)} in the first group and from ${r100(SV["300k_up"].min)} to ${r100(SV["300k_up"].max)} in the second. The deeds do not record bedrooms, so the county's value for the unit stands in for its size: the first group is one-bedroom size, the second two-bedroom size.`,
});

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const RESORT = "https://www.beachcove.com/";
const AMENITIES = "https://www.beachcove.com/amenities/";
const PROGRAM = "https://www.beachcove.com/rental-management/";
const ROOMS = "https://www.beachcove.com/accommodations/";
const CONTACT = "https://www.beachcove.com/contact/";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";

/* The building as a place, for search (never Hotel or LodgingBusiness: we are not the resort). */
const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Beach Cove Resort", alternateName: ["Beach Cove", "Beach Cove Resort North Myrtle Beach"],
  description: `An oceanfront condo resort with ${CONDOS} condos and a 350-foot lazy river in North Myrtle Beach, South Carolina.`,
  address: { "@type": "PostalAddress", streetAddress: "4800 S Ocean Blvd", addressLocality: "North Myrtle Beach", addressRegion: "SC", postalCode: "29582", addressCountry: "US" },
  geo: { "@type": "GeoCoordinates", latitude: FL.footprint_center[0], longitude: FL.footprint_center[1] },
  containedInPlace: { "@type": "City", name: "North Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

/* Live strips (owner, 2026-11-14), each search checked on 2026-11-14 against /homes/api/strip: 28, 20, 7 and 64 homes.
   Strip 3: beds is a minimum; the 7 are all the building's two-bedrooms, all built 1996 (yearMin=1990 returns the same 7). */
const CTR = `${FL.footprint_center[0].toFixed(4)},${FL.footprint_center[1].toFixed(4)}`;
const STRIP = G.homesQScript() + G.homesQ("type=condo&subdivision=Beach Cove", "Own a condo at Beach Cove Resort, on the ocean in North Myrtle Beach");
const STRIP_NEAR = G.homesQ(`near=${CTR}&miles=1&type=condo&has=oceanfront_unit`, "Oceanfront condos within a mile of Beach Cove");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Condo Buildings", url: "/invest/condo-buildings/" },
  pageImages: () => PH.pageImages(AERIAL),
  title: `Beach Cove Resort Condos, North Myrtle Beach: Fees From ${r5(FEE[0])}`,
  description: `Beach Cove Resort, 4800 S Ocean Blvd, North Myrtle Beach: HOA fees by unit size, what they pay, nightly rentals and ${SW.all.n} recent sales. Condos from ${r5(A["1"].min)}.`,
  ogTitle: "Beach Cove Resort, North Myrtle Beach: condos for sale, HOA fees by size, rentals and sales",
  crumb: "Beach Cove",
  eyebrow: "Beach Cove Resort, North Myrtle Beach",
  h1: "Beach Cove Resort, North Myrtle Beach: owning a condo with a lazy river on the ocean.",
  h1em: `${L.api_total} condos for sale at 4800 S Ocean Blvd, with the fee by unit size.`,
  sub: `A 350-foot lazy river on the pool deck, three whirlpools on the ocean side, and the resort's own rental desk.`,
  heroMedia: glance([
    { icon: "pool", label: "Oceanfront whirlpools", text: "3, open all year" },
    { icon: "beach", label: "On the pool deck", text: "350-foot lazy river" },
    { icon: "calendar", label: "Built", text: "1985 and 1996" },
    { icon: "key", label: "Nightly rentals", text: "Allowed" },
  ]),
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Beach Cove Resort is a condo resort on the ocean at 4800 S Ocean Blvd in North Myrtle Beach, with a 350-foot lazy river on its pool deck. One-bedrooms were built in 1985 and two-bedrooms in 1996. The middle sale price over the past year was about ${money(SW.all.median)}.`,
    `The monthly HOA fee goes by the size: about ${r5(FEE[0])} for a one-bedroom and about ${r5(FEE[1])} for a two-bedroom. Units rent by the night, and the resort runs its own rental program.`,
    `Booking a stay instead? The resort takes reservations on ${h.ext(RESORT, "its own website")}.`,
  ],
  sections: [
    { html: () => CSS + G.homesCss() + PHOTO.replace("margin:1.4rem 0 1.6rem;","margin:0 0 1.4rem;").replace(' loading="lazy"',' fetchpriority="high"') + `<div class="c3-pr-open">${STRIP}</div>`
      + `<p class="c3-pr-up">Beach Cove is one of the buildings in our ${h.a("/invest/condo-buildings/", "guide to Myrtle Beach oceanfront condo buildings")}.</p>` },

    { h2: "What is it like to own a condo at Beach Cove?", toc: "Owning here", id: "owning", html: () =>
      h.p(`The pool deck is Beach Cove's draw, and for an owner who rents, it is a reason a guest books your unit. The resort says a 350-foot lazy river runs along the oceanfront deck, beside three outdoor pools and a kiddie pool. Three oceanfront whirlpools are open year-round, and an indoor heated pool and whirlpool sit by the lobby.`) +
      h.p(`The outdoor pools are heated by season, and the lazy river does not run all year. We get the resort's days for the lazy river before you offer.`) +
      h.h3("The Town Center and the rest of the resort") +
      h.p(`The resort keeps its 6,500-square-foot oceanfront Town Center for guests of its own rental desk, and for owners who join the rental program. The resort lists an arcade, a grill and coffee bar, a beach bar and a fitness room there. An owner who rents elsewhere may not get in, so we confirm that for the unit you like.`) +
      h.p(`The resort also lists covered parking, an on-site laundry and free Wi-Fi. Barefoot Landing is under a mile away in a straight line.`) +
      h.p(`${FG.oceanfront_unit} of the ${L.api_total} condos for sale on ${RUN_MD} were listed as oceanfront units.`) +
      STRIP_NEAR },

    { h2: "What are the HOA fees at Beach Cove Resort?", toc: "HOA fees", id: "hoa-fees", html: (bg) =>
      h.p(`At Beach Cove, a one-bedroom pays about ${r5(FEE[0])} a month, though a few listed one-bedrooms run up to about ${r50(FX["1"].highest)}. A two-bedroom pays about ${r5(FEE[1])}.`) +
      FEE_TABLE +
      h.p(`Most listings say the fee includes trash, water and sewer, and internet. ${FG.hoa_includes_electric} of ${L.api_total} say it includes electric too, which is unusual for a tower here. Agents tick these boxes by hand, so we confirm what is in the fee for the unit you like. The fee can change each January.`) +
      h.h3("What a year costs before any loan") +
      h.p(`A one-bedroom at the middle asking price costs about ${money(PH_TOT[0])} a year to hold. That is before any power bill the fee does not cover, and before your unit's own insurance.`) +
      h.table(["Each year, at the middle asking price", "One-bedroom", "Two-bedroom"], [
        ["HOA fees", money(PF[0]), money(PF[1])],
        ["Property tax as a rental, before any exemption", money(PT[0]), money(PT[1])],
        ["<strong>About</strong>", `<strong>${money(PH_TOT[0])}</strong>`, `<strong>${money(PH_TOT[1])}</strong>`],
      ]) +
      h.p(`South Carolina taxes a rental or second home on 6 percent of its value, and a sale resets the value to about the price. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the lower rate for a home you live in. You also need your own policy inside the unit: ${h.a("/hoa/master-insurance-ho6/", "the building's policy and your own condo policy")} explains the split.`) +
      h.cta("Know Beach Cove's fees before you offer", "We ask for the budget, the reserve study and any planned assessment, and add up what the unit costs.", "Have us get Beach Cove's budget", "/contact/", bg) },

    { h2: "Can you rent a Beach Cove condo by the night?", toc: "Renting it", id: "renting", html: (bg) =>
      h.p(`Yes. ${FG.str_allowed} of the ${L.api_total} condos for sale on ${RUN_MD} say nightly rentals are allowed, and all ${FG.vacation_rental_program} say a rental program is available. North Myrtle Beach allows nightly rentals with an annual business license, and the city is weighing a new rule. Our ${h.a("/invest/str-rules/", "short-term rental rules page")} has the current state.`) +
      `<ul class="c3-pr-list">`
        + `<li><strong>Through the resort's own program</strong>The resort says its on-site program is part of the Vacation Myrtle Beach group. It says it collects and pays the lodging taxes, sends monthly and year-end statements, and holds your unit's rent in escrow, a separate account, until it pays you. Its guests get the Town Center.</li>`
        + `<li><strong>On your own</strong>You can hire a licensed manager or list the unit on Airbnb yourself. The license and the taxes are on the rules page above.</li>`
        + `</ul>` +
      h.h3("What the program does not say") +
      `<ul class="c3-pr-list">`
        + `<li><strong>The program's share</strong>It does not publish its share of the rent, so we get its terms for any unit you consider.</li>`
        + `<li><strong>The money both ways</strong>Our page on ${h.a("/invest/rental-program-vs-airbnb/", "a rental program versus Airbnb")} shows it, and our ${h.a("/invest/airbnb-income/", "Airbnb income page")} shows what Myrtle Beach units earn.</li>`
        + `<li><strong>Beach Cove's own income</strong>No public source gives income for Beach Cove alone.</li>`
        + `</ul>` +
      h.p(`The resort's rules for guests: check-in at 4 PM, a minimum age of 21, and no pets. An owner's own rules are in the condo's founding documents, and we read them before you offer.`) +
      h.cta("Know the rental terms before you offer", "We get the rental program's terms and a unit's booking history, so you see the rent before the price.", "Have us get the rental terms", "/contact/", bg) },

    { h2: "What have Beach Cove Resort condos sold for?", toc: "Sales", id: "sales", html: () =>
      h.p(`${SW.all.n} Beach Cove condos sold in the past year by Horry County's deed records, at a middle price of about ${money(SW.all.median)}. The price depends on the size.`) +
      SALES +
      h.p(`Asking prices for one-bedrooms ran above what units of that size sold for: the middle ask is ${r1k(A["1"].median)}, against about ${r1k(SV.under_250k.median)} in sales. We price an offer from the recorded sales.`) +
      h.p(`Thinking of selling here? Our ${h.a("/sell/home-value/", "home value page")} explains how we price a home, and an agent can ${h.a("/contact/", "price your unit from these sales")}.`) },

    { h2: "What we check before you buy at Beach Cove", toc: "Our checks", id: "checks", html: () =>
      `<ul class="c3-pr-list">`
        + `<li><strong>Flood zones</strong>On the county's flood map, nearly all of the lot is in a high-risk zone. About ${Math.round(VE.share_of_footprint * 1000) / 10} percent is in the coastal VE zone and about 81 percent in AE. We check the building's own flood cover and your policy. Our pages on ${h.a("/hoa/master-insurance-ho6/", "the building's policy")} and ${h.a("/buyers/coastal-insurance/", "coastal insurance")} explain the split.</li>`
        + `<li><strong>The buildings' age</strong>Built in 1985 and 1996. We read the reserve study, the last two budgets and the minutes for any planned assessment.</li>`
        + `<li><strong>Who owns the units</strong>About 3 in 4 of the ${UNITS} units get their tax bill outside South Carolina. The building is run for visitors, so we find out how many units are in the rental program.</li>`
        + `<li><strong>If you will use a loan</strong>A resort with a rental program often needs a condotel-type loan. One published condotel program asks for at least 500 square feet, and both sizes here are over it. Ask a lender first.</li>`
        + `</ul>` +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit a Beach Cove unit. Our ${h.a("/invest/condotel-financing/", "condotel financing page")} has more.`) +
      h.p(`To weigh Beach Cove against other buildings, ${h.a("/invest/condo-buildings/", "compare the oceanfront condo buildings")}. For the town around it, see ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach")}.`) + /* sibling-links */ h.p(`Up the beach to the north: ${h.a("/invest/condo-buildings/bay-watch-resort/", "Bay Watch Resort")} (about 2 miles) and ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} (about 4 miles). Farther north: ${h.a("/invest/condo-buildings/towers-on-the-grove/", "Towers on the Grove")} (about 6 miles) and ${h.a("/invest/condo-buildings/prince-resort/", "Prince Resort")} (about 6 miles). Down the beach to the south: ${h.a("/invest/condo-buildings/margate-tower/", "Margate Tower")} (about 3 miles) and ${h.a("/invest/condo-buildings/maisons-sur-mer/", "Maisons Sur Mer")} (about 4 miles). Farther south: ${h.a("/invest/condo-buildings/margaritaville-vacation-residences/", "Margaritaville Vacation Residences")} (about 4 miles) and ${h.a("/invest/condo-buildings/grande-shores/", "Grande Shores")} (about 6 miles).`) /* end sibling-links */ },
  ],
  faqTitle: "Beach Cove Resort FAQ",
  faq: [
    { q: "When was Beach Cove Resort built?", a: `Condos for sale are in two buildings: ${L.year_built["1985"]} listings were built in 1985 and ${L.year_built["1996"]} in 1996. The 1996 units are all two-bedrooms.` },
    { q: "Is Beach Cove a hotel or condos?", a: `Both. Its ${CONDOS} condos are owned one by one, and the resort's front desk rents many of them to guests by the night.` },
    { q: "Is Beach Cove Resort pet friendly?", a: `Guests may not bring pets. For owners, ${FG.pets_allowed} of ${L.api_total} listings say pets are allowed, so we read the condo's founding rules before you offer.` },
    { q: "Is there parking at Beach Cove Resort?", a: "The resort lists a covered parking garage. All 28 listings say the unit has covered parking, and we confirm the space that goes with the unit you like." },
    { q: "Is the lazy river open all year?", a: "The resort heats its outdoor pools by season, and its three oceanfront whirlpools are open year-round. We get the resort's days for the lazy river for you." },
    { q: "What is the address of Beach Cove Resort?", a: "Beach Cove Resort is at 4800 S Ocean Blvd, North Myrtle Beach, SC 29582. Barefoot Landing is under a mile away in a straight line." },
    { q: "How many Beach Cove condos are for sale?", a: `On ${RUN}, ${L.api_total} Beach Cove condos were for sale: ${L.beds["1"]} one-bedrooms and ${L.beds["2"]} two-bedrooms.` },
  ],
  sources: [
    { name: "Beach Cove Resort", href: RESORT },
    { name: "amenities", href: AMENITIES },
    { name: "rental program", href: PROGRAM },
    { name: "rooms", href: ROOMS },
    { name: "contact page", href: CONTACT },
    { name: "Horry County parcel and flood map", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "2026 tax levy", href: LEVY },
  ],
  sourcesNote: `Our counts: CCMLS listings on ${RUN}, in aggregate; county parcels and the deeds recorded in the ${PERIOD}; the flood map on the county's parcel drawing.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL]) + PLACE_LD,
  bottomCta: {
    h2: "Get Beach Cove's numbers before you offer.",
    p: "Tell us the size you want. We get the budget, the reserve study and the rental program's terms, and add up what that unit costs a year.",
    label: "Have us get Beach Cove's numbers", href: "/contact/",
  },
  keywords: "Beach Cove Resort Myrtle Beach, Beach Cove Resort North Myrtle Beach, Beach Cove Resort condos for sale, Beach Cove Resort HOA fees, Beach Cove Resort Airbnb, 4800 S Ocean Blvd North Myrtle Beach, Beach Cove lazy river",
  about: "Beach Cove Resort, an oceanfront condo resort at 4800 S Ocean Blvd, North Myrtle Beach, South Carolina",
});
