/* /submarkets/north-myrtle-beach/cherry-grove/ - Cherry Grove, North Myrtle Beach: the homes for sale now,
 * what houses and condos sold for, the channel houses, the flood zone, the yearly cost, and what is there.
 *
 * Batch 2026-11-f, Lane N (new page), the neighborhood shape (specs/plantation-point.js, wild-wing-plantation.js).
 * Facts: Blog-Brain batches/2026-11-f/cherry-grove/facts.md, VERIFIED rows, and the CORRECTED rows at the
 * verifier's wording only (VERIFY.md). Plan: PLAN.md. Demand: must-answer.md.
 * Not used: "sunrise deck", "a mile and a half" or "empty" for the Waties kayak line, any year for the pier's
 * shark or rebuild, "every July 4", the $55,000 low sale, any fixed count of homes for sale, the 33-in-100 flood
 * share as "the rest of the city" (23 is the rest of the city), the 1,544 houses divided by the 676 channel houses.
 * Data: data/2026-11-f/cherry-grove/ (county.json, listings.json, drives.json, photos.json, strips.json) and
 * the North Myrtle Beach page's findings.json (data/2026-11-a/submarkets-north-myrtle-beach/).
 * Every count, price and minute is read from those files and checked against its ledger row with must().
 * Pictures: one NAIP aerial of the channels (public domain, labels by Chapter3) and the pier from the ocean (public domain).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/north-myrtle-beach/cherry-grove/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "cherry-grove");
const NMB = path.join(__dirname, "..", "data", "2026-11-a", "submarkets-north-myrtle-beach");
const read = (f, d = DATA) => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
const CO = read("county.json"), L = read("listings.json"), DR = read("drives.json"), PHOTOS = read("photos.json").photos;
const FN = read("findings.json", NMB);

const n = (v) => Math.round(v).toLocaleString("en-US");
const r5k = (v) => "$" + n(Math.round(v / 5000) * 5000);
const r10k = (v) => "$" + n(Math.round(v / 10000) * 10000);
const mil = (v) => "$" + (Math.round(v / 100000) / 10).toString() + " million";
const must = (ok, msg) => { if (!ok) throw new Error(`cherry-grove.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

/* Row 4 (VERIFIED): 1,544 houses on the old plats. */
must(CO.parcels === 2033 && CO.by_kind.house === 1544, "row 4 changed");
/* Row 6 (VERIFIED, wording corrected): 341 houses taxed at the legal-residence rate; 765 with an owner mailing address outside SC. */
must(CO.houses_taxed_4pct_legal_residence === 341 && CO.houses_owner_mail_out_of_sc === 765, "row 6 changed");
must(Math.round(341 / 1544 * 100) === 22 && Math.round(765 / 1544 * 100) === 50, "row 6 shares changed");
/* Row 7 (VERIFIED): county market value, middle $636,248. */
must(Math.round(CO.house_county_value.median) === 636248, "row 7 changed");
/* Row 8 (VERIFIED): 80 house sales, middle $695,000, half between $562,500 and $860,000. The $55,000 low is not printed. */
const HS = CO.sales.house;
must(HS.n === 80 && HS.median === 695000 && HS.p25 === 562500 && HS.p75 === 860000, "row 8 changed");
/* Row 9 (VERIFIED in sibling): condos in the wider Cherry Grove part, 156 sold, middle $309,750, half between $194,900 and $450,000. */
const CS = FN.sales_by_area.cg.condo;
must(CS.n === 156 && CS.median === 309750 && CS.p25 === 194900 && CS.p75 === 450000, "row 9 changed");
/* Row 5 (VERIFIED in sibling): about 2,860 condos in the wider part. */
must(FN.homes_by_area.cg.by_kind.condo === 2860, "row 5 changed");
/* Row 10 (VERIFIED in sibling): 676 channel houses in Cherry Grove, 682 with the neck; 679 of 682 in the high-risk zone; middle lot 0.19 acre. */
must(FN.channel_houses.n === 682 && FN.channel_houses.by_area.cg === 676 && FN.channel_houses.median_acres === 0.19, "row 10 changed");
/* Row 11 (VERIFIED in sibling): channel house resales 38 at $715,000; Cherry Grove off the channels 65 at $665,000. */
const RC = FN.sales.house_resale_channel, RN = FN.sales.house_resale_cg_not_channel;
must(RC.n === 38 && RC.median === 715000 && RN.n === 65 && RN.median === 665000, "row 11 changed");
/* Row 14 (VERIFIED in sibling): 95 in 100 houses (1,820 of 1,920) and 84 in 100 condos (2,402 of 2,860) in the high-risk zone; 81 in the wave zone; 88 in 100 of all homes.
   CORRECTION 1: the rest of the city is 23 in 100, not 33 (33 is the whole city, Cherry Grove included). */
const FCG = FN.flood.by_area.cg, FALL = FN.flood.all;
must(FCG.houses.n === 1920 && FCG.houses.in_sfha === 1820 && FCG.condos.n === 2860 && FCG.condos.in_sfha === 2402 && FCG.all.ve === 81 && FCG.all.pct_sfha === 88.1, "row 14 changed");
must(FALL.n === 31135 && FALL.in_sfha === 10332 && FCG.all.n === 4848 && FCG.all.in_sfha === 4270, "row 14 city totals changed");
const REST = Math.round((FALL.in_sfha - FCG.all.in_sfha) / (FALL.n - FCG.all.n) * 100);
must(REST === 23 && Math.round(FALL.pct_sfha) === 33, "row 14 correction 1 changed");
/* Row 15 (VERIFIED in sibling): federal flood policies in ZIP 29582, single-family: $603, $1,463, $2,151. */
const NF = FN.nfip_policies_29582;
must(NF.x.median === 603 && NF.a.median === 1463 && NF.v.median === 2151, "row 15 changed");
/* Row 16 (VERIFIED): tax on the county's middle Cherry Grove house value. */
const TAXV = Math.round(CO.house_county_value.median);
const TAX_HOME = TAXV * 0.04 * 112.1 / 1000, TAX_OTHER = TAXV * 0.06 * 221.2 / 1000;
must(FN.tax_example.mills === 221.2 && FN.tax_example.mills_at_4pct === 112.1, "row 16 mills changed");
must(Math.round(TAX_HOME / 50) * 50 === 2850 && Math.round(TAX_OTHER / 50) * 50 === 8450, "row 16 arithmetic changed");
/* Row 25 (VERIFIED): drive minutes from the pier, rounded. */
const mn = (k) => Math.round(DR[k].minutes);
must(mn("main_street_ocean_drive") === 7 && mn("mcleod_seacoast") === 9 && mn("barefoot_landing") === 18 && mn("grand_strand_medical") === 28 && mn("skywheel_myrtle_beach") === 38 && mn("airport_terminal") === 43, "row 25 changed");
/* Rows 26 to 28 (VERIFIED, drift): live. The page prints what the listings file holds on the day it was read.
   The most they can drift is checked here, so a stale build fails loudly. */
const LA = Object.fromEntries(["house", "condo", "dock_houses", "new_2026_houses", "waterfront_houses", "houses_no_hoa"].map((k) => [k, L[k].asking]));
const READ = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "America/New_York" });
const READ_FULL = new Date(L.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
must(LA.house.n >= 20 && LA.condo.n >= 20 && LA.dock_houses.n >= 3 && LA.new_2026_houses.n >= 3, "listings file is too thin to print");
const HM = LA.house.median, CM = LA.condo.median;
const feeBetween = L.hoa_cumulative_condo["900"] - L.hoa_cumulative_condo["550"];
const FEE_LISTED = L.hoa_cumulative_condo["2000"];
must(Math.abs(feeBetween / FEE_LISTED - 0.5) < 0.08, "the middle half of condo fees is not 550 to 900 any more");
const NO_HOA = LA.houses_no_hoa.n;
must(NO_HOA > LA.house.n / 2, "most houses for sale no longer list no association fee");
must(LA.dock_houses.max < 1000000 && LA.dock_houses.max >= 950000, "the top dock-house ask is not just under $1 million any more");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = `<style>
${S} h2{text-wrap:balance}
${S} .detail-h1{text-wrap:balance}
${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){${S} .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:760px!important}
${S} figure.c3ph-hero figcaption{padding:0!important}
${S} figure.c3ph-hero img[src*="channels"]{aspect-ratio:1200/857!important}
${S} .cg-photo{margin:1.4rem 0 1.6rem;max-width:760px}
${S} .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
@media (min-width:700px){${S} .pp-rules:not(.one){grid-template-columns:1fr 1fr}}
${S} .pp-rules li{margin:0;padding:.7rem 0 0;border-top:${RULE};color:var(--muted);line-height:1.55;font-size:1rem}
${S} .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
${S} .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.6rem 0 1.4rem}
${S} .c3-gchart,${S} div[style^="overflow-x:auto;margin:1.2rem 0"],${S} div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}
${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
${S} .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){${S} .detail-hero .c3-glance{display:none!important}${S} figure.c3ph-hero figcaption{display:none}
${S} .detail-hero .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
${S} .detail-hero .c3-glance li:last-child{border-bottom:${RULE}!important}
${S} .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
${S} .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}${S} .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
${S} .hx-strip:not(:empty){margin-top:1.2rem}
${S} .detail-media .hx-strip{max-width:none}
${S} .cg-crop figure.c3ph-hero img[src*="channels"]{aspect-ratio:16/7!important;object-fit:cover;object-position:50% 45%}
${S} .cg-wow{margin:.9rem 0 0;max-width:720px;color:var(--navy);line-height:1.55}
${S} .detail-hero .c3-glance strong{line-height:1.4}
@media (max-width:699px){${S} nav[aria-label="On this page"]{display:none!important}}
${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (max-width:359px){${S} .hx-feed .hx-fb-ai,${S} label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}}
</style>`;

/* ---------------------------------------------------------------------------- */
/* The pictures (public domain), each next to the sentence about what it shows.   */

const AIR = PHOTOS.find((r) => r.file.includes("cherry-grove-channels-from-above-1200w"));
const PIER = PHOTOS.find((r) => r.file.includes("cherry-grove-pier-from-the-ocean-1200w"));
must(AIR && AIR.license === "Public domain" && PIER && PIER.license === "Public domain", "the photo records are missing");
const AERIAL = PH.heroPhoto(AIR, { alt: AIR.alt, caption: "Cherry Grove from above: each strip of water between the rows of houses is a channel dug in the marsh.", maxWidth: "760px", sizes: "(max-width: 800px) 100vw, 760px" });
const PIERPH = PH.heroPhoto(PIER, { alt: PIER.alt, caption: PIER.caption, maxWidth: "760px", sizes: "(max-width: 800px) 100vw, 760px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')
  .replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const CREDITS = PH.creditsList([
  { photo: AIR, caption: "The Cherry Grove channels from above" },
  { photo: PIER, caption: "Cherry Grove Pier from the ocean" },
]);

/* ---------------------------------------------------------------------------- */
/* Charts: one message each, plain titles.                                        */

const dol = (v) => r5k(v);
const pct = (a, b) => Math.round(a / b * 100);
const mi = (k) => (Math.round(DR[k].miles * 10) / 10).toString();
const DRIVES_TABLE = h.table(["From Cherry Grove Pier", "By car", "Miles"], [
  ["Main Street, Ocean Drive", `${mn("main_street_ocean_drive")} min`, mi("main_street_ocean_drive")],
  ["McLeod Seacoast hospital", `${mn("mcleod_seacoast")} min`, mi("mcleod_seacoast")],
  ["Barefoot Landing", `${mn("barefoot_landing")} min`, mi("barefoot_landing")],
  ["Grand Strand Medical Center", `${mn("grand_strand_medical")} min`, mi("grand_strand_medical")],
  ["The SkyWheel, Myrtle Beach", `${mn("skywheel_myrtle_beach")} min`, mi("skywheel_myrtle_beach")],
  ["Myrtle Beach International Airport", `${mn("airport_terminal")} min`, mi("airport_terminal")],
]);

/* ---------------------------------------------------------------------------- */
/* Live strips. Searches checked 2026-11-17 against /homes/api/strip (ok, 3 or more homes):
   A 78, B 7, C 15, D 7, E 33, F 6, G 13. The strip API drops condos under $120,000 and houses
   under $150,000 unless the search has a max price, so B and C carry max=. */
const C = "near=33.83434,-78.62798&miles=0.8";
const STRIP_A = G.homesCss() + G.homesQScript() + G.homesQ(C, "Cherry Grove homes for sale right now");
const STRIP_B = G.homesQ(`${C}&type=house&max=600000`, "Cherry Grove houses under $600,000");
const STRIP_C = G.homesQ(`${C}&type=condo&max=250000`, "Cherry Grove condos under $250,000");
const STRIP_D = G.homesQ(`${C}&type=house&has=private_dock`, "Cherry Grove houses with their own dock");
const STRIP_E = G.homesQ(`${C}&type=condo&has=ocean_view`, "Cherry Grove condos with an ocean view");
const STRIP_F = G.homesQ(`${C}&type=house&yearMin=2026`, "New houses in Cherry Grove, built in 2026");

const SRC = {
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  fema: "https://msc.fema.gov/portal/home",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  pier: "https://cherrygrovepier.com/the-pier/",
  pierHome: "https://cherrygrovepier.com/",
  parks: "https://www.parks.nmb.us/473/Parks",
  heritage: "https://www.parks.nmb.us/491/Heritage-Shores-Nature-Preserve",
  cart: "https://www.parks.nmb.us/600/Golf-Cart-Laws",
  fireworks: "https://www.nmb.us/m/newsflash/Home/Detail/1555",
  kayak: "https://www.myhorrynews.com/news/getting-off-the-beaten-path-at-inlet-plantation-stables-and-waties-island/article_d1d46858-b162-4b95-9f7b-10f8081e6159.html",
  turtle: "https://nmbturtle.blogspot.com/p/faqs.html",
  osm: "https://www.openstreetmap.org/",
  openfema: "https://www.fema.gov/openfema-data-page/nfip-redacted-policies-v2",
};
const CONTACT = `/contact/?place=${encodeURIComponent("Cherry Grove")}`;

const PLACE_LD = `<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org", "@type": "Place", "@id": `https://chapter3realty.com${SELF}#place`,
  name: "Cherry Grove", alternateName: ["Cherry Grove, North Myrtle Beach", "Cherry Grove Beach"],
  description: "The old beach town at the northeast end of North Myrtle Beach, South Carolina, with a fishing pier, channels dug in the marsh and houses on them.",
  geo: { "@type": "GeoCoordinates", latitude: 33.83434, longitude: -78.62798 },
  address: { "@type": "PostalAddress", addressLocality: "North Myrtle Beach", addressRegion: "SC", postalCode: "29582", addressCountry: "US" },
  containedInPlace: { "@type": "City", name: "North Myrtle Beach, South Carolina" },
}).replace(/</g, "\\u003c")}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "North Myrtle Beach", url: "/submarkets/north-myrtle-beach/" },
  title: "Cherry Grove SC Homes for Sale: Prices, Channels, Flood",
  description: "Cherry Grove SC homes and condos for sale now: what houses sold for, the channel houses with docks, flood zone, tax and drive times.",
  ogTitle: "Cherry Grove, North Myrtle Beach: homes for sale, channel houses and what they cost",
  crumb: "Cherry Grove",
  eyebrow: "Cherry Grove, North Myrtle Beach",
  h1: "Cherry Grove, North Myrtle Beach: homes for sale,",
  h1em: "and about 680 houses back onto channels dug in the marsh.",
  sub: "Cherry Grove homes for sale at the northeast end of North Myrtle Beach, by a 985-foot fishing pier and a boat ramp to the ocean.",
  heroMedia: CSS + glance([
    { icon: "home", label: "Houses sold, middle", text: `About ${r5k(HS.median)}` },
    { icon: "key", label: "Condos sold, middle", text: `About ${r10k(CS.median)}` },
    { icon: "dock", label: "Houses on channels", text: "About 680" },
    { icon: "flood", label: "Houses in the flood zone", text: `${Math.round(FCG.houses.in_sfha / FCG.houses.n * 100)} in 100` },
  ]) + `<p style="color:var(--muted);margin:0 0 .9rem;max-width:720px;line-height:1.6">The homes for sale now in old Cherry Grove, around the Cherry Grove Pier, are shown below. Scroll the strip for more.</p>` + STRIP_A + `<p class="cg-wow">From the city boat ramp, a guided kayak trip goes through Hog Inlet to Waties Island, a three-mile round trip.</p>`,
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `Cherry Grove is the old beach town at the northeast end of North Myrtle Beach. The homes for sale today are in the strip above, and the tiles give what houses and condos sold for.`,
    `Many of the houses back onto channels with a boat route to the ocean. Almost every home here is in FEMA's high-risk flood zone, so a lender will ask for flood insurance. Ask for the flood insurance cost on any house before you offer; the flood zone section shows the federal policy middles.`,
  ],
  sections: [
    { h2: "What is Cherry Grove?", toc: "What it is", id: "what", html: () =>
      h.p(`Cherry Grove is one of four beach towns that joined in 1968 to form North Myrtle Beach. It sits at the northeast end of the city, around the Cherry Grove Pier.`) +
      h.p(`The county's records for old Cherry Grove list ${n(CO.by_kind.house)} houses. For about half of them, the tax bill goes to an address outside South Carolina.`) +
      h.p(`Our Cherry Grove search covers every home within eight-tenths of a mile of the middle of the old town, and every strip on this page uses it. The MLS has a subdivision also named Cherry Grove, but it reaches west to 13th Avenue North, so we do not use it. Condo towers are listed under their own names.`) +
      h.p(`For the whole city, see our ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach guide")}. This page covers what the guide does not: what Cherry Grove homes sold for, the channel houses, the flood zone, the yearly cost and the condos.`) },

    { h2: "What do homes in Cherry Grove sell for?", toc: "Prices", id: "prices", html: () =>
      h.p(`We read the county's deed index for these sales. In the past year, ${HS.n} houses in old Cherry Grove sold, and the middle price was about ${r5k(HS.median)}. Condos in Cherry Grove and the blocks around it sold for about ${r10k(CS.median)} at the middle.`) +
      h.p(`The houses for sale on ${READ} ask from about ${r5k(LA.house.min)} to ${mil(LA.house.max)}. The condos ask from ${r5k(LA.condo.min)} to about ${r5k(LA.condo.max)}.`) +
      STRIP_B +
      STRIP_C },

    { h2: "What is a channel house, and what does a dock add?", toc: "Channel houses", id: "channels", html: (bg) =>
      h.p(`People dug channels into the Cherry Grove marsh in the 1970s. In the photo below, each strip of water between two rows of houses is one of them. We counted about 680 houses on the county's parcel map that back onto the channels and the marsh behind them. A typical lot is about a fifth of an acre.`) +
      `<div class="cg-crop">${AERIAL.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"')}</div>` +
      `<h3 style="margin:1.4rem 0 .5rem">The boat ramp and the way to the ocean</h3>` +
      h.p(`The city's boat ramp on the marsh gives boat access to the ocean through Hog Inlet. Heritage Shores, a nature preserve on an island in the marsh, is reached from 53rd Avenue North.`) +
      `<h3 style="margin:1.4rem 0 .5rem">What channel houses sold for</h3>` +
      h.p(`In the past year, ${RC.n} channel houses resold for about ${r5k(RC.median)} at the middle. ${RN.n} other Cherry Grove houses sold for about ${r5k(RN.median)}. The gap is small, and the two groups differ in more than water, so the sales do not give a price for a dock.`) +
      h.p(`${LA.dock_houses.n} houses for sale list a private dock, asking from about ${r5k(LA.dock_houses.min)} to just under $1 million. The listing agent chooses the dock tag. A dock is worth more to someone who owns a boat and will use it.`) +
      STRIP_D +
      h.cta("Like a channel house? Have us check the flood zone and the dock", "We pull the FEMA zone and ask the seller for a survey of the floor height. We also read what the listing says about the dock and the lift.", "Have us check a channel house", CONTACT, bg) },

    { h2: "Are there condos in Cherry Grove, and what are the fees?", toc: "Condos", id: "condos", html: (bg) =>
      h.p(`Yes. About ${n(Math.round(FN.homes_by_area.cg.by_kind.condo / 10) * 10)} condos stand in Cherry Grove and the streets around it. ${LA.condo.n} are for sale on ${READ}, asking from ${r5k(LA.condo.min)} to about ${r5k(LA.condo.max)}.`) +
      h.p(`The towers have their own pages: ${h.a("/invest/condo-buildings/prince-resort/", "Prince Resort")}, ${h.a("/invest/condo-buildings/mar-vista-grande/", "Mar Vista Grande")} and ${h.a("/invest/condo-buildings/towers-on-the-grove/", "Towers on the Grove")}.`) +
      h.p(`${FEE_LISTED} of the ${LA.condo.n} condos list a monthly association fee. Half of those list between about $550 and $900 a month, and one lists $300 or less. A listing agent types that fee, so it is not the association's budget.`) +
      h.p(`Most houses for sale here list no association fee, so the fee question is mostly a condo question.`) +
      STRIP_E +
      h.cta("Know a condo's fees before you offer", "We ask the association for the unit's dues, its transfer fee and any dues held at closing, and add them up for you.", "Have us get a condo's fees", CONTACT, bg) },

    { h2: "Are there new houses in Cherry Grove?", toc: "New houses", id: "new", html: () =>
      h.p(`${LA.new_2026_houses.n} houses for sale on ${READ} are listed as built in 2026. They ask from about ${r5k(LA.new_2026_houses.min)} to about ${r5k(LA.new_2026_houses.max)}.`) +
      STRIP_F },

    { h2: "Is Cherry Grove in a flood zone?", toc: "Flood zone", id: "flood", html: () =>
      h.p(`Almost all of it. We checked FEMA's map for the middle of Cherry Grove. It is in a high-risk flood zone, where FEMA's map puts the water surface 12 feet above its sea level datum. That is a height on the map, not a depth at a door. A lender requires flood insurance on a loan for a house in that zone.`) +
      h.p(`${Math.round(FCG.houses.in_sfha / FCG.houses.n * 100)} in 100 houses and ${Math.round(FCG.condos.in_sfha / FCG.condos.n * 100)} in 100 condos here are in the high-risk zone. ${FCG.all.ve} homes are in its wave zone, the part where waves add to the risk.`) +
      h.p(`A federal flood policy on a house in ZIP 29582 cost about $${n(Math.round(NF.x.median / 10) * 10)} a year outside the high-risk zone. It cost about $${n(Math.round(NF.a.median / 10) * 10)} inside it and about $${n(Math.round(NF.v.median / 10) * 10)} in the wave zone. Those are the middle of what owners bought in the past year, not a quote. Our ${h.a("/buyers/flood-zone-check/", "flood zone check")} shows how we look up a house, and ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")} covers the history a map leaves out.`) +
      h.p(`Our affiliated lender, BrickWood Mortgage, a separate company, can tell you what a lender requires on a house you like.`) },

    { h2: "What does it cost to own a house in Cherry Grove each year?", toc: "Yearly cost", id: "cost", html: () =>
      h.p(`Property tax depends on whether it is the home you live in. On about ${r10k(TAXV)}, the county's middle value for a Cherry Grove house, tax is about $${n(Math.round(TAX_HOME / 50) * 50)} a year as your own home. As a second home or rental it is about $${n(Math.round(TAX_OTHER / 50) * 50)} a year. The lower rate needs an application that shows it is your main home.`) +
      h.p(`Only ${pct(CO.houses_taxed_4pct_legal_residence, CO.by_kind.house)} in 100 houses in old Cherry Grove get the lower rate today. The flood policy comes on top of the tax. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is figured.`) },

    { h2: "Can you rent a Cherry Grove house or condo by the night?", toc: "Nightly rentals", id: "rent", html: () =>
      h.p(`Yes, with a city business license, which the owner renews each year. Collecting guests' lodging taxes is the owner's job. The license asks how many parking spaces the property has on its own land, and that number is the most cars guests may park. Our ${h.a("/invest/str-rules/", "short-term rental rules")} and ${h.a("/invest/airbnb-income/", "Airbnb income guide")} cover the rest.`) },

    { h2: "What is there to do in Cherry Grove?", toc: "Things to do", id: "do", html: () =>
      h.p(`The pier is the landmark. Behind the town, the marsh has its own boat ramp and nature preserve.`) + PIERPH +
      `<ul class="pp-rules" aria-label="What is in Cherry Grove">`
        + `<li><strong>The pier</strong>It reaches 985 feet into the ocean, with a two-story observation deck at the end, a tackle shop and the Driftwood restaurant and bar. It is open daily, usually 7 a.m. to 11 p.m. The pier lists a 1,780-pound tiger shark as a world record.</li>`
        + `<li><strong>Fireworks</strong>In 2026 the city held a free show at the pier on July 4.</li>`
        + `<li><strong>The boat ramp and Waties Island</strong>A guided kayak trip from the city's boat ramp goes through Hog Inlet to the beach on Waties Island. It is a three-mile round trip.</li>`
        + `<li><strong>Heritage Shores</strong>Walking paths on an island in the marsh. You reach it from 53rd Avenue North.</li>`
        + `<li><strong>Parks</strong>Hill Street Park is a neighborhood park. Cherry Grove Oceanfront Park has beach access, restrooms and picnic areas.</li>`
        + `<li><strong>Turtles</strong>From about May to mid-August, loggerhead turtles nest on the beach, and volunteers watch the nests.</li>`
        + `<li><strong>Golf carts</strong>With a state permit sticker and a licensed driver, you may drive one on city streets posted 35 mph or less, from sunrise to sunset. You may cross Ocean Boulevard but not drive along it.</li>`
        + `</ul>` },

    { h2: "How far is Cherry Grove from the airport and the hospital?", toc: "Drive times", id: "drives", html: () =>
      h.p(`The closest hospital on our list is about ${mn("mcleod_seacoast")} minutes away by car, and the Myrtle Beach airport about ${mn("airport_terminal")} minutes.`) +
      DRIVES_TABLE + `<p class="pp-note">By car from Cherry Grove Pier, with no traffic, rounded. Routes on OpenStreetMap roads.</p>` },

    { h2: "Where to go next", toc: "Next", id: "next", html: () =>
      `<ul class="pp-rules one" aria-label="Pages that go further">`
        + `<li><strong>${h.a("/homes/near/cherry-grove/", "All Cherry Grove homes for sale")}</strong>The full search, with the map and every filter.</li>`
        + `<li><strong>${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach")}</strong>The whole city, and the other three old beach towns.</li>`
        + `<li><strong>${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}</strong>What associations charge across the coast.</li>`
        + `<li><strong>${h.a("/buyers/property-taxes/", "Property taxes")}</strong>How the bill is figured, with both rates.</li>`
        + `</ul>` + /* sibling-links */ h.p(`Other neighborhoods we cover, nearest first: ${h.a("/submarkets/north-myrtle-beach/briarcliffe-acres/", "the town of Briarcliffe Acres")}, ${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} in Myrtle Beach and ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")} in Myrtle Beach. Then ${h.a("/submarkets/myrtle-beach/pine-lakes-preserve/", "The Preserve at Pine Lakes")} in Myrtle Beach, ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point")} in Myrtle Beach and ${h.a("/submarkets/conway/shaftesbury-glen/", "Shaftesbury Glen")} near Conway. Then ${h.a("/submarkets/carolina-forest/river-oaks/", "River Oaks")} in Carolina Forest and ${h.a("/submarkets/conway/wild-wing-plantation/", "Wild Wing Plantation")} in Conway. Farther south: ${h.a("/submarkets/pawleys-island/willbrook-plantation/", "Willbrook Plantation")} in Pawleys Island.`) /* end sibling-links */ + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}. Also ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Cherry Grove FAQ",
  faq: [
    { q: "Where is Cherry Grove, SC?", a: "Cherry Grove is the northeast end of North Myrtle Beach. It was one of four beach towns that joined in 1968 to form the city." },
    { q: "What do homes in Cherry Grove cost?", a: `Houses and condos sell at different prices. The prices section gives the middle sold and asking price for each, and the live strips show the homes for sale.` },
    { q: "Is Cherry Grove in a flood zone?", a: "Almost all of it. FEMA's map puts the middle of Cherry Grove in a high-risk flood zone, and a lender requires flood insurance there. The flood zone section has the shares and the policy costs." },
    { q: "What is a channel house in Cherry Grove?", a: "A house on one of the channels dug in the marsh in the 1970s. The channel houses section has the count, the resale prices and the dock listings." },
    { q: "How long is the Cherry Grove Pier?", a: "The pier is 985 feet long, with a two-story observation deck at the end. It is open daily, usually 7 a.m. to 11 p.m." },
  ],
  sources: [
    { name: "county GIS", href: SRC.gis },
    { name: "county deed index", href: SRC.deeds },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "tax levy", href: SRC.levy },
    { name: "federal flood policies", href: SRC.openfema },
    { name: "Cherry Grove Pier", href: SRC.pier },
    { name: "city parks", href: SRC.parks },
    { name: "Heritage Shores", href: SRC.heritage },
    { name: "golf cart rules", href: SRC.cart },
    { name: "July 4 fireworks", href: SRC.fireworks },
    { name: "kayak trip, MyHorryNews", href: SRC.kayak },
    { name: "Sea Turtle Patrol", href: SRC.turtle },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: `Our counts: county parcels, flood zones and the deed index. Listings: CCMLS on ${READ_FULL}, in aggregate. Drives: OpenStreetMap roads, no traffic. The pier's world-record claim is the pier's own.`,
  afterSources: () => CREDITS + PH.imageSchema([AIR, PIER]) + PLACE_LD,
  bottomCta: {
    h2: "See every Cherry Grove home for sale.",
    p: "When you find a house you like, we check its flood zone and its yearly tax before you offer.",
    label: "Book a showing", href: "/contact/",
  },
  keywords: "Cherry Grove SC homes for sale, Cherry Grove North Myrtle Beach, Cherry Grove condos for sale, Cherry Grove channel houses, Cherry Grove pier, Cherry Grove flood zone, Cherry Grove real estate",
  about: "Cherry Grove, the old beach town at the northeast end of North Myrtle Beach, South Carolina, with its fishing pier, its channel houses and its condo towers",
});
