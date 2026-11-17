/* /submarkets/myrtle-beach/condos-for-sale/ - Myrtle Beach, SC condos for sale: a listing-first page.
 * The condos are the page: live strips by price, bedrooms, oceanfront, what the building has, building and
 * neighborhood; short answers between them (the fee by size, what condos sold for, what a year costs to own,
 * the flood share, one offer); the town guide at the end.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/myrtle-beach-condos-for-sale/facts.md, VERIFIED rows, and the
 * CORRECTED rows at the verifier's values and wording (VERIFY.md): the price is level only for one-bedrooms (row 11);
 * the inland fee is flat from two bedrooms (row 12); no "mostly townhome-style" (row 12); the 4 percent tax figures
 * stay off the page until the city credit is sourced (rows 14, 15); Bluewater Villas and Sand Dunes oceanfront tower
 * struck from the sold table (row 9); no 14-day count printed (row 18); no demand figures (row 22).
 * Data: data/2026-11-f/myrtle-beach-condos-for-sale/. Numbers are read from the JSON files and checked below.
 * Listing counts move daily, so the page prints none for a strip; each strip is live.
 * Pictures: charts only; no photo on the page (owner, 2026-11-17). The aerial stays as the share image. The photo partner's shot list is in the batch BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, placesMap } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/myrtle-beach/condos-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "myrtle-beach-condos-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const F = read("findings.json"), OF = read("oceanfront.json"), TX = read("tax.json").tax, FL = read("flood.json");
const must = (ok, msg) => { if (!ok) throw new Error(`myrtle-beach-condos-for-sale.js: ${msg}`); };
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");

must(AIR.license === "Public domain", "the aerial photo record is missing");
/* Row 4: asking middle $194,900; middle half $145,000 to about $278,000. */
must(F.price.median === 194900 && Math.round(F.price.p25 / 1000) === 145 && Math.round(F.price.p75 / 1000) === 277, "row 4 changed");
/* Row 7: middle year built 1988; 27 built 2022 or later. */
must(F.year_built.median === 1988 && F.year_built.since_2022 === 27, "row 7 changed");
/* Row 8: 1,125 deeds inside the city, middle $170,000, quartiles $105,000 and $265,000; bands; Horry $215,000. */
const SB = F.sales_city_bands, SC = F.sales.city_limits;
must(SC.n === 1125 && SC.median === 170000 && SC.p25 === 105000 && SC.p75 === 265000 && F.sales.horry.median === 215000 && F.sales.horry_condo_deeds === 4479, "row 8 changed");
must(SB.under_100k === 243 && SB["100_200k"] === 420 && SB["200_300k"] === 246 && SB["300_500k"] === 169 && SB["500k_plus"] === 47, "row 8 bands changed");
/* Row 9: sold by building (legal names). */
const SBR = Object.fromEntries(F.sales_by_regime_top.map((r) => [r[0], r]));
must(SBR["LANDMARK"][1] === 49 && SBR["LANDMARK"][2] === 97000 && SBR["CORAL BEACH"][1] === 39 && SBR["CORAL BEACH"][2] === 85000 && SBR["MAGNOLIA PLACE"][1] === 44 && SBR["MAGNOLIA PLACE"][2] === 199500
  && SBR["PALACE"][1] === 22 && SBR["PALACE"][2] === 146000 && SBR["CARAVELLE RESORT"][1] === 21 && SBR["CARAVELLE RESORT"][2] === 145000 && SBR["CAROLINIAN RESORT"][1] === 17 && SBR["CAROLINIAN RESORT"][2] === 225000, "row 9 changed");
/* Rows 11 and 12: asking and fee middles by unit size, oceanfront building against not. */
const OB = OF.oceanfront_building.by_beds, NB = OF.not_oceanfront_building.by_beds;
must(OB["2"].price.median === 329000 && Math.round(NB["2"].price.median / 1000) === 217 && OB["2"].hoa.median === 1082 && NB["2"].hoa.median === 481, "row 11 two-bedroom changed");
must(Math.round(OB["1"].price.median / 1000) === 160 && NB["1"].price.median === 155000 && OB["1"].hoa.median === 902 && NB["1"].hoa.median === 535, "row 11 one-bedroom changed");
must(OB["3"].hoa.median === 1600 && Math.round(NB["3"].hoa.median) === 487 && OB["0"].hoa.median === 672 && NB["0"].hoa.median === 609, "row 12 changed");
/* Row 10: fee middle about $725; middle half $480 to $974. */
must(OF.all.hoa.median === 724 && OF.all.hoa.p25 === 480 && OF.all.hoa.p75 === 974, "row 10 changed");
/* Row 15: yearly tax at 6 percent (no 4 percent figure: pending the city credit). */
must(Math.round(TX["150000"].six) === 2291 && Math.round(TX["200000"].six) === 3055 && Math.round(TX["330000"].six) === 5041, "row 15 changed");
/* Row 16: flood. */
must(FL.in_high_risk.all === 492 && FL.pins === 1712 && FL.in_high_risk.waterfront === 238 && FL.in_high_risk.not_waterfront === 254, "row 16 changed");

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 55%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:4/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .ww-hero{margin-bottom:.9rem!important}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:6/1}main#main .ww-hero figcaption{display:none}main#main .detail-hero .detail-media{max-width:1100px!important}}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
main#main nav[aria-label="On this page"]{margin:1.2rem 0 0;max-width:720px}
main#main nav[aria-label="On this page"] p{font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:#7a4a22;margin:0 0 .3rem;font-weight:600}
main#main nav[aria-label="On this page"]>ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.2rem 1.1rem}
main#main nav[aria-label="On this page"] li a{display:block;padding:.35rem 0;color:var(--navy);text-decoration:underline;text-underline-offset:.18em;font-size:.95rem}
main#main .detail-hero .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .detail-hero .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .detail-hero .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .detail-hero .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .detail-hero .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .detail-hero .c3-glance strong{font-size:1rem;font-weight:400}main#main .detail-hero .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

const CONTACT = `/contact/?place=${encodeURIComponent("Myrtle Beach")}`;
const C = "type=condo&city=Myrtle Beach";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;
const A = "/invest/condo-buildings";
const up = (v, step) => Math.round(v / step) * step;

/* Charts 1 and 2: the fee and the asking price by unit size (rows 11 and 12). */
const SIZES = [["0", "Studio"], ["1", "1 bedroom"], ["2", "2 bedrooms"], ["3", "3 bedrooms"]];
const rowsFor = (pick) => SIZES.flatMap(([k, lab]) => [
  { name: `${lab}, oceanfront building`, value: pick(OB[k]) },
  { name: `${lab}, not oceanfront`, value: pick(NB[k]) },
]);
const FEE_CHART = G.bars(rowsFor((b) => up(b.hoa.median, 10)).map((r) => Object.assign(r, { valueText: money(r.value) })), {
  caption: "Monthly fee: a two-bedroom in an oceanfront building pays more than twice as much",
  nameLabel: "Unit and building", valueLabel: "Middle monthly fee, dollars a month", compact: true, phoneList: true,
  note: "Middle of the monthly HOA fee on the listings for sale, rounded to $10. It is the listing's number, not the association's own bill.",
});

/* Chart 3: deed sales by price band (row 8). */
const SOLD_BANDS = (() => {
  const rows = [["Under $100,000", SB.under_100k], ["$100,000 to $199,999", SB["100_200k"]], ["$200,000 to $299,999", SB["200_300k"]], ["$300,000 to $499,999", SB["300_500k"]], ["$500,000 and up", SB["500k_plus"]]];
  const MAXV = Math.max(...rows.map((r) => r[1])), W = 640, H = 300, bw = 82, gap = 28, x0 = 20, base = 235, top = 40;
  const cols = rows.map(([lab, v], i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = lab.replace(" to ", " to|").replace("Under ", "Under|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${v.toLocaleString("en-US")}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Condos sold inside Myrtle Beach in the past year by sale price: ${SB.under_100k} under $100,000, ${SB["100_200k"]} from $100,000 to $199,999, ${SB["200_300k"]} from $200,000 to $299,999, ${SB["300_500k"]} from $300,000 to $499,999 and ${SB["500k_plus"]} at $500,000 and up." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Condos sold in Myrtle Beach by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Most Myrtle Beach condos sold for under $300,000</p>${svg}<figcaption>1,125 condos sold inside the city limits in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();

const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osm: "https://www.openstreetmap.org/",
};

/* Buildings with a strip. page: our building page, when one exists. Ours first, then by how many are for sale. */
const TOC_ITEMS = [["newest", "Newest"], ["prices", "Prices"], ["beds", "Bedrooms"], ["ocean", "Oceanfront"], ["fee", "Monthly fee"], ["newer", "Newer"], ["has", "What it has"], ["buildings", "By building"], ["hoods", "Neighborhoods"], ["sold", "Sold prices"], ["cost", "Cost to own"], ["flood", "Flood"], ["tour", "Tour a condo"], ["myrtle-beach-condos-for-sale-faq", "Myrtle Beach condos for sale FAQ"]];
const TOC_ROW = `<nav aria-label="On this page"><p>On this page</p><ul>${TOC_ITEMS.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join("")}</ul></nav>`;
const BUILDINGS = [
  ["Landmark Resort", "Landmark Resort", "landmark-resort"],
  ["Caravelle Resort", "Caravelle Resort", "caravelle-resort"],
  ["Sea Mist Resort", "Sea Mist Resort", "sea-mist-resort"],
  ["PALACE, THE", "The Palace", "palace-resort"],
  ["OCEAN FOREST VILLAS", "Ocean Forest Villas", "ocean-forest-villas"],
  ["Holiday Sands", "Holiday Sands", "holiday-sands-south"],
  ["Maisons Sur-Mer", "Maisons Sur-Mer", "maisons-sur-mer"],
  ["Carolinian Beach Resort", "Carolinian Beach Resort", "carolinian-beach-resort"],
  ["Paradise Resort", "Paradise Resort", "paradise-resort"],
  ["Grande Shores", "Grande Shores", "grande-shores"],
  ["Bay View Resort", "Bay View Resort", "bay-view-resort"],
  ["Grand Atlantic", "Grand Atlantic", "grand-atlantic"],
  ["Patricia Grand I", "Patricia Grand", "patricia-grand"],
  ["Palms, The", "The Palms Resort", "palms-resort"],
  ["Kingston Plantation - Margate Tower", "Margate Tower", "margate-tower"],
  ["Regency Towers", "Regency Towers", "regency-towers"],
  ["Margaritaville Vacation Residences Myrtle Beach", "Margaritaville Vacation Residences", "margaritaville-vacation-residences"],
  ["Coral Beach", "Coral Beach"],
  ["Magnolia Place", "Magnolia Place"],
  ["Monterey Bay Suites Resort", "Monterey Bay Suites Resort"],
  ["SAND DUNES PHII", "Sand Dunes Phase II"],
  ["Bluewater Resort - Hi rise", "Bluewater Resort"],
  ["RIVER OAKS CONDOS", "River Oaks"],
  ["Compass Cove Pinnacle Oceanfront Tower", "Compass Cove"],
  ["Beach Colony", "Beach Colony"],
  ["Grande Cayman Resort (formerly Long Bay Resort)", "Grande Cayman Resort"],
  ["Dunes Village Resort", "Dunes Village Resort"],
];
const PAGE_LINE = [(a) => `Our page on ${a}.`, (a) => `More about ${a}.`, (a) => `${a}: the building in detail.`];
const BUILDING_STRIPS = BUILDINGS.map(([sub, name, page], i) =>
  S(`subdivision=${sub}&${C}`, `${name} condos for sale`) +
  (page ? h.p(PAGE_LINE[i % 3](h.a(`${A}/${page}/`, name))) : "")).join("");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Myrtle Beach", url: "/submarkets/myrtle-beach/" },
  title: "Myrtle Beach Condos for Sale: Live Oceanfront Listings",
  description: "Condos for sale in Myrtle Beach, SC, live: by price, size, building and oceanfront. What the fees run, what condos sold for, and what a year costs to own.",
  ogTitle: "Myrtle Beach, SC condos for sale: see them, then the monthly fee",
  crumb: "Condos for sale",
  eyebrow: "Myrtle Beach, SC condos for sale",
  h1: "Myrtle Beach, SC condos for sale:",
  h1em: "the fee depends on the building.",
  sub: "Condos with a Myrtle Beach address, live from the MLS.",
  heroMedia: CSS,
  heroCta: false,
  toc: false,
  author: "devin",
  shortAnswer: [
    `About 1,700 condos are for sale in Myrtle Beach, asking a middle of about $195,000. A two-bedroom in an oceanfront building asks about $329,000 and pays about $1,080 a month in fees. An inland two-bedroom asks about $217,000 and pays about $480.`,
    `We tour them with you, and we check the HOA and flood file before you offer.`,
  ],
  sections: [
    { h2: "What are the newest condos for sale in Myrtle Beach?", toc: "Newest", id: "newest", html: () =>
      G.homesCss() + G.homesQScript() +
      S(`${C}&domMax=14`, "Myrtle Beach condos listed in the last 14 days") + TOC_ROW +
      h.p(`The newest condos are in the strip above. ${h.a("/homes/?type=condo&city=Myrtle+Beach", "See all Myrtle Beach condos")}, or open any strip below to search it. Looking for a house? See ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach homes for sale")}.`) },

    { h2: "What do condos in Myrtle Beach cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`Half of the condos ask less than about $195,000. The middle half asks from about $145,000 to about $278,000. Each strip below is a live search for one price band, from the lowest up. Open See all to search it.`) +
      S(`${C}&max=75000`, "Condos under $75,000") +
      S(`${C}&max=150000`, "Condos under $150,000") +
      S(`${C}&min=150000&max=300000`, "Condos from $150,000 to $300,000") +
      S(`${C}&min=300000`, "Condos at $300,000 and up") +
      S(`${C}&min=500000`, "Condos at $500,000 and up") },

    { h2: "How many bedrooms do the condos have?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`A studio is about 390 square feet and asks about $117,000. A one-bedroom is about 580 square feet and asks about $160,000. A two-bedroom is about 1,000 square feet and asks about $231,000. A three-bedroom is about 1,370 square feet and asks about $306,000. Sizes are the listing agent's numbers. A strip shows the bedroom count or more.`) +
      S(`${C}&beds=2`, "Condos with 2 or more bedrooms") +
      S(`${C}&beds=3`, "Condos with 3 or more bedrooms") +
      S(`${C}&beds=4`, "Condos with 4 or more bedrooms") },

    { h2: "Which Myrtle Beach condos are oceanfront?", toc: "Oceanfront", id: "ocean", html: () =>
      h.p(`Two things get called oceanfront. The building is on the sand, or the unit itself faces the ocean. A unit in an oceanfront building can face the street or the pool, so the strips use the unit's own tag.`) +
      S(`${C}&has=oceanfront_unit`, "Oceanfront condo units") +
      S(`${C}&has=oceanfront_unit&max=200000`, "Oceanfront units under $200,000") +
      S(`${C}&has=oceanfront_unit&beds=3`, "Oceanfront units with 3 or more bedrooms") +
      S(`${C}&has=oceanview_unit`, "Ocean-view condo units") +
      S(`near=33.6938507,-78.8773549&miles=1&${C}`, "Condos within a mile of the SkyWheel") +
      NOTE(`The SkyWheel strip counts a straight line on the map, not a walk. Fees for each building are in our ${h.a("/invest/condo-buildings/", "oceanfront condo buildings compared")}.`) },

    { h2: "What is the monthly fee, and why does oceanfront cost more?", toc: "Monthly fee", id: "fee", html: () =>
      h.p(`The middle fee on the listings is about $725 a month. Half pay between $480 and $974.`) +
      h.p(`For a two-bedroom, the ocean costs about $112,000 more to buy and about $7,200 more a year in fees.`) +
      FEE_CHART +
      S(`${C}&has=oceanfront_building&beds=2`, "Two-bedroom condos in oceanfront buildings") +
      S(`${C}&not=oceanfront_building&beds=2`, "Two-bedroom condos in buildings off the ocean") +
      h.p(`Inland, the fee falls from a studio to a two-bedroom and then stays flat at about $480. In an oceanfront building it rises with each bedroom, to about $1,600 for three.`) +
      S(`${C}&hoaMax=500`, "Condos with a fee under $500 a month") +
      S(`${C}&hoaMax=400`, "Condos with a fee under $400 a month") +
      NOTE(`Sellers' agents enter the fee, so ask the association for the real figure before you offer. More in ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) },

    { h2: "Are there newer condos in Myrtle Beach?", toc: "Newer", id: "newer", html: () =>
      h.p(`The middle year built is 1988, and 7 in 10 of the condos for sale were built before 2000. Few are new.`) +
      S(`${C}&yearMin=2022`, "Condos built in 2022 or later") +
      S(`${C}&has=new_construction`, "New-construction condos") },

    { h2: "Which condos have a lazy river, an indoor pool or golf?", toc: "What it has", id: "has", html: () =>
      h.p(`The strips below show condos with a lazy river, an indoor pool or a golf course. Others show condos that allow pets or nightly rentals, and gated communities. Each listing says so, but the building's own rules decide.`) +
      S(`${C}&has=lazy_river`, "Condos in buildings with a lazy river") +
      S(`${C}&has=indoor_pool`, "Condos with an indoor pool") +
      S(`${C}&has=indoor_pool&max=150000`, "Condos with an indoor pool under $150,000") +
      S(`${C}&has=pets_allowed`, "Condos where pets are allowed") +
      S(`${C}&has=gated`, "Condos in gated communities") +
      S(`${C}&has=on_golf_course`, "Condos on a golf course") +
      S(`${C}&has=str_allowed`, "Condos where nightly rentals are allowed") +
      NOTE(`See our ${h.a("/invest/str-rules/", "short-term rental rules")}.`) },

    { h2: "Which buildings have condos for sale?", toc: "By building", id: "buildings", html: () =>
      h.p(`Our building pages come first, then the rest by how many condos are for sale. The strip title is the building's name in the MLS, and a name can cover more than one tower.`) +
      BUILDING_STRIPS +
      h.p(`Fees for 45 oceanfront buildings are side by side on our ${h.a("/invest/condo-buildings/", "oceanfront condo buildings page")}.`) },

    { h2: "Which neighborhoods have condos for sale?", toc: "Neighborhoods", id: "hoods", html: () =>
      h.p(`Some Myrtle Beach neighborhoods mix condos with houses. Each has its own page.`) +
      S(`subdivision=Kingston Plantation&${C}`, "Kingston Plantation condos for sale") +
      h.p(`${h.a("/submarkets/myrtle-beach/kingston-plantation/", "Kingston Plantation")} has its own page. It lies outside the city limits, so its tax rate is different.`) +
      S(`subdivision=Grande Dunes&${C}`, "Grande Dunes condos for sale") +
      h.p(`Our page on ${h.a("/submarkets/myrtle-beach/grande-dunes/", "Grande Dunes")}.`) +
      S(`subdivision=Market Common&${C}`, "Market Common condos for sale") +
      h.p(`More about ${h.a("/submarkets/myrtle-beach/market-common/", "Market Common")}.`) },

    { h2: "What have Myrtle Beach condos sold for?", toc: "Sold prices", id: "sold", html: () =>
      h.p(`In the past year, 1,125 condos sold inside the Myrtle Beach city limits. The middle price was $170,000, and half of them sold for $105,000 to $265,000. We read the county's deed index to count them.`) +
      SOLD_BANDS +
      h.p(`In all of Horry County, 4,479 condos sold at a middle price of about $215,000. In North Myrtle Beach, 1,088 sold at about $306,000. See ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach condos for sale")}.`) +
      h.p(`Among single buildings, Landmark Resort had the most sales, 49, at a middle price of about $97,000. Coral Beach had 39 at about $85,000, and Magnolia Place 44 at about $199,500. With only a few sales, a building's middle is a weak guide.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000, on condo parcels in the city's tax districts. A deed with no price is left out. Buildings are counted by the legal name on the deed, which can differ from the MLS name. Kingston Plantation lies outside the city, so it is not in these counts.`) },

    { h2: "What does a year cost to own a condo in Myrtle Beach?", toc: "Cost to own", id: "cost", html: (bg) =>
      h.p(`Assume the county values the condo at its price. South Carolina taxes a second home or rental on 6 percent of that value. Inside the city, the 2026 rate is about $255 per $1,000 of the value taxed.`) +
      h.table(["Condo price", "Second home or rental (6%)"], [
        ["$150,000", `About ${money(up(TX["150000"].six, 10))}`],
        ["$200,000", `About ${money(up(TX["200000"].six, 10))}`],
        ["$330,000", `About ${money(up(TX["330000"].six, 10))}`],
      ]) +
      h.p(`A home you live in is taxed on 4 percent of its value, and the school operations levy does not apply to it. You apply for that rate, and it counts only for the home you live in. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how the bill is built.`) +
      NOTE(`Yearly tax only, with no county fee or special district. A condo outside the city, such as in Kingston Plantation, pays a different rate. The HOA fee is separate and depends on the building.`) +
      h.cta("Want the HOA and flood file before you offer?", "Pick a condo. We read its HOA papers and its flood file, then tell you what we found.", "Have us check the file", CONTACT, bg) },

    { h2: "Is the condo in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`About 29 in 100 of the condos for sale sit in a FEMA high-risk zone. A lender requires flood insurance there. Among condos tagged waterfront, about 41 in 100 do. Among the others, about 22 in 100 do.`) +
      h.p(`We placed each listing's map point on the FEMA map. A building can touch a zone its point misses, so we check the building itself. Start with our ${h.a("/buyers/flood-zone-check/", "flood zone check")}, then read about ${h.a("/buyers/coastal-insurance/", "coastal insurance")} and ${h.a("/buyers/undisclosed-flooding/", "flooding a seller may not mention")}.`) },

    { h2: "Want to see one?", toc: "Tour a condo", id: "tour", html: (bg) =>
      h.cta("Tour three buildings with us in one day", "Pick them from the strips above. We book the showings and read each building's HOA and flood file first.", "Book a showing", CONTACT, bg) +
      h.p(`For the town itself, read the ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach town guide")}. Also see ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach condos for sale")}. For condos as an investment, see our ${h.a("/invest/condos/", "condo investing page")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/little-river/condos-for-sale/", "Little River")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Myrtle Beach condos for sale FAQ",
  faq: [
    { q: "Why is the oceanfront fee higher?", a: `On the listings, an oceanfront two-bedroom pays about $1,080 a month and an inland one about $480. The listings do not say why. The association's budget does, so ask for it before you offer.` },
    { q: "How much is property tax on a Myrtle Beach condo?", a: `At $200,000 inside the city, about $3,060 a year if it is a second home or rental. A home you live in is taxed on 4 percent instead of 6. HOA fees come on top.` },
    { q: "Can I rent a condo by the night?", a: `About 1,300 of the listings say nightly rentals are allowed. The building's own rules decide, and the city has rules too. See our short-term rental rules page.` },
    { q: "Will a lender loan on a condo?", a: `Some buildings fail a lender's condo review, and that limits who can buy there. Our page on condos many lenders will not lend on explains it. Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit.` },
    { q: "Which building fits me?", a: `Decide the monthly fee you can carry and the price you want, then use the strips above. We tour the buildings you pick.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: Horry County deeds and parcels, and the FEMA flood map. Listings: CCMLS, live, in aggregate. Map points: OpenStreetMap and the listings' own points.",
    bottomCta: {
    h2: "Book a showing in Myrtle Beach.",
    p: "Pick a condo from the strips above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "condo myrtle beach for sale, condo in myrtle beach for sale, condo myrtle beach sc, condos for sale myrtle beach, condo myrtle beach oceanfront",
  about: "Condos for sale in Myrtle Beach, South Carolina, live from the MLS, with the monthly fee by building type, what condos sold for and what a year costs to own",
});
