/* /submarkets/little-river/condos-for-sale/ - Little River, SC condos for sale: a listing-first page.
 * The condos are the page: live strips by price, bedrooms, water, what the building has and building; short
 * answers between them (the fee by building, what condos sold for, what a year costs to own, flood, one offer);
 * the town guide at the end.
 *
 * Batch 2026-11-f. Facts: Blog-Brain batches/2026-11-f/little-river-condos-for-sale/facts.md, VERIFIED rows, and the
 * CORRECTED rows at the verifier's values and wording (VERIFY.md): 3 in 5 are two-bedrooms (row 5); Spinnaker 20 sales
 * and ten buildings 210 sales (row 15); no Baytree parcel count or size ranking (row 17); "the fee depends on the
 * building", not "sets" (row 11); flood "at the listing's map point", never "safe" (row 19); no marina at Carolina
 * Yacht Landing (row 22); tax "about $89" fee (row 18).
 * Data: data/2026-11-f/little-river-condos-for-sale/. Numbers are read from the JSON files and checked below.
 * Listing counts move daily, so the page prints none for a strip; each strip is live.
 * Pictures: a USDA NAIP aerial (public domain), charts and a map. The photo partner's shot list is in the batch BUILD.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, placesMap } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/little-river/condos-for-sale/";
const DATA = path.join(__dirname, "..", "data", "2026-11-f", "little-river-condos-for-sale");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const AIR = read("photos.json").photos[0];
const L = read("findings-listings.json"), TB = read("two-bed-by-building.json"), DD = read("findings-deeds.json");
const FL = read("flood.json"), TX = read("tax.json").tax, BP = read("building-points.json");
const must = (ok, msg) => { if (!ok) throw new Error(`little-river-condos-for-sale.js: ${msg}`); };
must(AIR.license === "Public domain", "the aerial photo record is missing");
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const up = (v, step) => Math.round(v / step) * step;

/* Row 11 (VERIFIED): two-bedroom middle fee by building. */
const TWO = [["Little River Inn Resort", 262, 162499], ["Baytree", 348, 133909], ["Cypress Bay", 507, 169900], ["Lightkeepers Village", 582, 274900], ["Mariner's Pointe", 694, 304950]];
const TBK = { "Little River Inn Resort": "Little River Inn Resort", Baytree: "Baytree", "Cypress Bay": "Cypress Bay", "Lightkeepers Village": "Lightkeepers Village", "Mariner's Pointe": "Mariner's Pointe" };
for (const [nm, fee, ask] of TWO) {
  const r = TB[`${TBK[nm]} | 2 bed`];
  must(r && r.n >= 3 && Math.round(r.fee_median) === fee && Math.round(r.price_median) === ask, `row 11 changed for ${nm}`);
}
/* Row 3: asking middle $192,000; middle half about $160,000 to $258,000. Row 10: fee middle $507. */
must(L.n === 184 && L.price.median === 192000 && L.fee.median === 507 && L.fee.p25 === 406 && L.fee.p75 === 582 && L.year.median === 1997 && L.built_before_2000 === 123, "rows 3, 10 or 13 changed");
/* Row 15 (CORRECTED): ten buildings 210 sales, middle $180,000 (raw file still says 213 and Spinnaker 23). */
const SOLD = DD.buildings;
must(SOLD["Cypress Bay"].count === 42 && SOLD["Cypress Bay"].median === 141250 && SOLD.Baytree.count === 56 && SOLD.Baytree.median === 134750
  && SOLD["Carolina Yacht Landing"].count === 27 && SOLD["Carolina Yacht Landing"].median === 255000 && SOLD["Lightkeepers Village"].count === 22
  && SOLD["Mariner's Pointe"].count === 13 && SOLD["Mariner's Pointe"].median === 328000 && SOLD["Intercoastal Village"].count === 7
  && SOLD["Intercoastal Village"].median === 126000 && SOLD["Village at the Glens"].count === 11 && SOLD["Village at the Glens"].median === 196000, "row 15 changed");
must(SOLD["Spinnaker Cove"].count === 23 && SOLD["Spinnaker Cove"].median === 200000, "row 15 raw Spinnaker changed (the page prints the corrected 20)");
const BANDS = [["Under $100,000", 13], ["$100,000 to $149,999", 65], ["$150,000 to $199,999", 47], ["$200,000 to $249,999", 33], ["$250,000 to $299,999", 26], ["$300,000 and up", 26]];
must(BANDS.reduce((a, b) => a + b[1], 0) === 210, "the sold bands do not add to 210");
/* Row 18 (VERIFIED): yearly tax, 4 and 6 percent, includes the county fee of about $89. */
must(Math.round(TX["150000"].four) === 641 && Math.round(TX["190000"].six) === 2381 && Math.round(TX["250000"].four) === 1008 && Math.round(TX["250000"].six) === 3104, "row 18 changed");
/* Row 19 (VERIFIED): 14 of 184 in a high-risk zone at the listing's map point. */
must(FL.pins === 184 && FL.all["AE:SFHA"] === 14, "row 19 changed");
/* Row 23: building points. */
must(BP["Cypress Bay"].lat > 33 && BP["Lightkeepers Village"].lng < -78, "row 23 changed");

const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .detail-h1{text-wrap:balance}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
main#main .hx-strip:not(:empty){margin-top:1.2rem}
main#main .detail-hero .detail-media{max-width:1100px!important}
main#main .ww-hero{max-width:none!important;width:100%}
main#main .ww-hero img{width:100%;height:auto;aspect-ratio:5/2;object-fit:cover;object-position:50% 55%}
@media (max-width:699px){main#main .detail-hero .eyebrow{display:none}main#main .ww-hero img{aspect-ratio:3/1}main#main .ww-hero figcaption{display:none}main#main .ww-hero{margin-bottom:.9rem!important}}
@media (min-width:900px){main#main .ww-hero img{aspect-ratio:3/1}}
main#main .c3-gchart,main#main div[style^="border-left:3px solid var(--brass)"]{max-width:720px!important;box-sizing:border-box;clear:both}
main#main .pp-note{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:720px;margin:-.4rem 0 1.4rem}
main#main .pp-rules{list-style:none;padding:0;margin:1.1rem 0 1.5rem;display:grid;gap:.9rem 2rem;max-width:720px}
main#main .pp-rules li{margin:0;padding:.7rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .pp-rules strong{color:var(--navy);display:block;margin-bottom:.1rem}
main#main nav[aria-label="On this page"]{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;border-bottom:1px solid rgba(28,32,40,.16)!important;padding:.8rem 0 .5rem!important}
@media (max-width:699px){main#main nav[aria-label="On this page"]>ul{display:flex!important;flex-wrap:nowrap;overflow-x:auto;gap:.5rem;padding-bottom:.4rem!important}main#main nav[aria-label="On this page"] li{flex:0 0 auto}main#main nav[aria-label="On this page"] li a{border:1px solid rgba(28,32,40,.2);border-radius:999px;padding:.35rem .8rem!important;white-space:nowrap;text-decoration:none!important;font-size:.9rem}}
main#main nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}
@media (min-width:700px){main#main nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}main#main nav[aria-label="On this page"] li a{padding:.45rem 0!important}}
main#main .c3-glance{margin-bottom:1.2rem}
@media (max-width:699px){main#main .c3-glance{grid-template-columns:1fr!important;gap:0!important}
main#main .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;align-items:center!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.45rem 0!important}
main#main .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}
main#main .c3-glance li>span:not(.i){flex:1;display:flex;justify-content:space-between;align-items:baseline;gap:1rem}
main#main .c3-glance strong{font-size:1rem;font-weight:400}main#main .c3-glance span.t{color:var(--navy);font-weight:600;white-space:nowrap}
}
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
</style>`;

const CONTACT = `/contact/?place=${encodeURIComponent("Little River")}`;
const C = "city=Little River&type=condo";
const S = (q, head) => G.homesQ(q, head);
const NOTE = (t) => `<p class="pp-note">${t}</p>`;
const HOMES = (extra) => `/homes/?city=Little+River&type=condo${extra || ""}`;

/* Chart 1 (the wow): two-bedroom middle fee by building. */
const FEE_CHART = G.bars(TWO.map(([name, fee, ask]) => ({ name, value: fee, valueText: `${money(fee)} a month`, feature: `asks about ${money(up(ask, 100))}` })), {
  caption: "Two-bedroom condos: the middle monthly fee, by building",
  nameLabel: "Building", valueLabel: "Middle monthly fee", featureLabel: "middle asking price", compact: true, phoneList: true,
  note: "Fees are the listing agents' entries. Only buildings with 3 or more two-bedrooms for sale are shown.",
});

/* Chart 2: condos sold by price band, ten buildings (row 15, corrected). */
const SOLD_BANDS = (() => {
  const MAXV = Math.max(...BANDS.map((b) => b[1])), W = 640, H = 310, bw = 76, gap = 24, x0 = 20, base = 235, top = 40;
  const cols = BANDS.map(([lab, v], i) => {
    const x = x0 + i * (bw + gap), hh = Math.round((base - top) * v / MAXV), y = base - hh;
    const words = lab.replace("Under ", "Under|").replace(" to ", "|to|").replace(" and up", "|and up").split("|");
    return `<rect x="${x}" y="${y}" width="${bw}" height="${hh}" rx="8" fill="#b8863b"/>`
      + `<text x="${x + bw / 2}" y="${y - 8}" text-anchor="middle" font-weight="700" font-size="20" fill="#1c2028">${v}</text>`
      + words.map((w, k) => `<text x="${x + bw / 2}" y="${base + 24 + k * 19}" text-anchor="middle" font-size="15" fill="#4a5060">${w}</text>`).join("");
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Condos sold in ten Little River buildings in the past year by sale price: ${BANDS.map(([l, v]) => `${v} ${l.toLowerCase().replace("under", "under")}`).join(", ")}." style="display:block;width:100%;height:auto;font-family:'DM Sans',system-ui,sans-serif"><title>Condos sold in ten Little River buildings by sale price</title>${cols}<line x1="10" y1="${base}" x2="${W - 10}" y2="${base}" stroke="#9c9486" stroke-width="1.5"/></svg>`;
  return `<figure class="c3-gchart" style="margin:1.4rem 0 1.6rem;max-width:720px"><p class="cap" style="color:var(--navy);font-weight:600;font-size:1.1em;margin:0 0 .8rem">Most of these condos sold for under $200,000</p>${svg}<figcaption>210 condos sold in ten buildings, the eight on this page plus Coquina Harbour and Moorings at Eastport, in the past 12 months, counted by the price on the deed.</figcaption></figure>`;
})();

/* The page's own map: one point per building, from the middle of its condo parcels (row 23). */
const MAP = placesMap("Buildings with condos for sale in Little River", [
  ["Cypress Bay", "Cypress Bay"], ["Baytree", "Baytree"], ["Carolina Yacht Landing", "Carolina Yacht Landing"], ["Spinnaker Cove", "Spinnaker Cove"],
  ["Lightkeepers Village", "Lightkeepers Village"], ["Mariner's Pointe", "Mariner's Pointe"], ["Village at the Glens", "Village at the Glens"],
].map(([k, name]) => ({ name, lat: BP[k].lat, lon: BP[k].lng })), { caption: "Map of seven buildings. One point per building, from the middle of its condo parcels, not per listing." });

const SRC = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  gis: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  fema: "https://hazards.fema.gov/gis/nfhl/rest/services/public/NFHL/MapServer/28",
  code: "https://www.scstatehouse.gov/code/t12c043.php",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  osm: "https://www.openstreetmap.org/",
};

/* One strip per building, each with one line from rows 14 and 15. The strip's search is the MLS name. */
const BLD = (sub, name, line) => S(`subdivision=${sub}&${C}`, `${name} condos for sale`) + h.p(line);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  pageImages: () => PH.pageImages(AIR),
  hub: { name: "Little River", url: "/submarkets/little-river/" },
  title: "Little River SC Condos for Sale, Live | Chapter3",
  description: "Condos for sale in Little River, SC, live: by price, bedrooms, water and building. What the fee runs, what they sold for, and what a year costs.",
  ogTitle: "Little River, SC condos for sale: see them, then the monthly fee",
  crumb: "Condos for sale",
  eyebrow: "Little River, SC condos for sale",
  h1: "Little River, SC condos for sale:",
  h1em: "the fee depends on the building.",
  sub: "Condos with a Little River address, live from the MLS, by price, water and building, with the monthly fee for each.",
  heroMedia: CSS + `<p style="font-size:1.1rem;line-height:1.5;color:var(--navy);margin:0 0 .4rem;max-width:720px">About 180 condos are for sale in Little River, asking a middle of about $192,000. The newest are below.</p>` + G.homesCss() + G.homesQScript() + S(`${C}&domMax=14`, "Little River condos listed in the last 14 days"),
  heroCta: false,
  author: "devin",
  shortAnswer: [
    `The monthly fee on a Little River condo depends on the building, so each building has its own strip.`,
    `We tour them with you, and we check the HOA papers and the flood file before you offer.`,
  ],
  sections: [
    { h2: "What does the Little River condo market look like?", toc: "At a glance", id: "newest", html: () =>
      glance([
        { icon: "dollar", label: "Asking, middle", text: "About $192,000" },
        { icon: "cards", label: "Monthly fee, middle", text: "About $507" },
        { icon: "calendar", label: "Built, middle year", text: "1997" },
        { icon: "flood", label: "High-risk flood zone", text: "About 8 in 100" },
      ]) +
      h.p(`The strip at the top shows the newest first. ${h.a(HOMES(), "See all Little River condos")}. Each strip below is its own search. Looking for a house or a townhouse? See ${h.a("/submarkets/little-river/homes-for-sale/", "Little River homes for sale")}.`) },

    { h2: "What do condos in Little River cost?", toc: "Prices", id: "prices", html: () =>
      h.p(`Half of the condos ask less than about $192,000.`) +
      S(`${C}&max=149999`, "Little River condos under $150,000") +
      S(`${C}&min=150000&max=249999`, "Little River condos from $150,000 to $249,999") +
      S(`${C}&min=250000`, "Little River condos at $250,000 and up") +
      h.p(`The three strips add up to every condo for sale, with no overlap. These are asking prices. What condos sold for is in a section below.`) },

    { h2: "How many bedrooms do the condos have?", toc: "Bedrooms", id: "beds", html: () =>
      h.p(`Three in 5 of the condos for sale have two bedrooms. A two-bedroom is about 1,030 square feet and asks about $180,000. A three-bedroom is about 1,360 square feet and asks about $253,000.`) +
      S(`${C}&beds=2&max=199999`, "Condos with 2 or more bedrooms, $200,000 and under") +
      S(`${C}&beds=3`, "Condos with 3 or more bedrooms") +
      NOTE(`Sizes and prices are middles. A strip shows the bedroom count or more. Sizes are the listing agent's numbers.`) },

    { h2: "Which Little River condos are on the water?", toc: "On the water", id: "water", html: () =>
      S(`${C}&waterfront=1`, "Little River condos on the water") +
      S(`${C}&has=water_icw`, "Condos the listing agent tagged Intracoastal") +
      S(`${C}&has=private_dock`, "Condos with a private dock") +
      S(`${C}&has=water_view`, "Condos with a water view") +
      h.p(`The tags are the listing agent's entries, and they can disagree: fewer condos are tagged waterfront than Intracoastal. Confirm the water and the dock before you offer.`) +
      h.p(`About 2 of every 3 deeded boat slips in Horry County are in Little River, at three marinas: Mariner's Pointe, Coquina Harbour and Lightkeepers Village. The ${h.a("/submarkets/little-river/", "Little River town guide")} covers the marinas and the old village.`) },

    { h2: "What is the monthly fee, and why does it differ?", toc: "Monthly fee", id: "fee", html: () =>
      h.p(`The middle fee on the listings is about $507 a month. Half pay between about $406 and $582.`) +
      h.p(`The fee depends on the building more than on the size. A two-bedroom pays a middle of about $260 a month at Little River Inn Resort and about $690 at Mariner's Pointe. That is about $430 a month apart, or about $5,200 a year, for the same number of bedrooms.`) +
      FEE_CHART +
      h.p(`Water does not show up as a higher fee on the listing sheets. Two-bedrooms tagged waterfront show a middle fee of about $410, and the others about $505. Only 7 are tagged waterfront, so that is a small group.`) +
      S(`${C}&hoaMax=400`, "Condos with a fee of $400 a month or less") +
      S(`${C}&hoaMax=300`, "Condos with a fee of $300 a month or less") +
      NOTE(`Sellers' agents enter the fee, so ask the association for the real figure and what it covers before you offer. More in ${h.a("/hoa/fees-by-neighborhood/", "HOA fees by neighborhood")}.`) },

    { h2: "Are there newer condos in Little River?", toc: "Newer", id: "newer", html: () =>
      h.p(`Two in 3 of the condos for sale were built before 2000. The middle year built is 1997.`) +
      S(`${C}&yearMin=2010`, "Condos built in 2010 or later") },

    { h2: "Which condos have golf, tennis, an elevator or a gate?", toc: "What it has", id: "has", html: () =>
      S(`${C}&has=golf_community`, "Condos in a golf community") +
      S(`${C}&has=tennis`, "Condos with tennis courts") +
      S(`${C}&has=elevator_building`, "Condos in an elevator building") +
      S(`${C}&has=top_floor`, "Top-floor condos") +
      S(`${C}&has=gated`, "Condos in gated communities") +
      S(`${C}&has=furnished`, "Furnished condos") +
      NOTE(`Each is the listing agent's tag for the building or the unit.`) },

    { h2: "Which buildings have condos for sale?", toc: "By building", id: "buildings", html: () =>
      h.p(`Each strip is one building, as the MLS names it. Each line gives the middle fee of the condos for sale, then what condos in the building sold for in the past year.`) +
      BLD("Cypress Bay", "Cypress Bay", `Pays about $507 a month. 42 sold, at about $141,000. The strip also holds the Gardens at Cypress Bay and the golf and tennis sections.`) +
      BLD("Baytree", "Baytree", `Pays about $306 a month. 56 sold, at about $135,000. The name covers every Baytree section, the golf colony included.`) +
      BLD("Carolina Yacht Landing", "Carolina Yacht Landing", `Pays about $570 a month. Most have three bedrooms. 27 sold, at about $255,000.`) +
      BLD("Lightkeepers", "Lightkeepers Village", `Pays about $582 a month. 22 sold, at about $258,000. It has a marina.`) +
      BLD("Spinnaker", "Spinnaker Cove and Spinnaker Bay", `Pays about $449 a month. 20 sold, at about $200,000.`) +
      BLD("Little River Inn Resort", "Little River Inn Resort", `Pays about $252 a month, the lowest of the buildings on this page.`) +
      BLD("Mariners Point", "Mariner's Pointe", `Pays about $706 a month, the highest of the buildings on this page. 13 sold, at about $328,000. It has a marina. The MLS spells the name Mariners Point.`) +
      BLD("Intercoastal Village", "Intercoastal Village", `Pays about $622 a month. 7 sold, at about $126,000.`) +
      h.p(`Smaller buildings, each with a search: ${[["Whispering Wood", "Whispering+Wood"], ["Merritt Park", "Merritt+Park"], ["Seabreeze Crossing", "Seabreeze+Crossing"], ["Coquina Harbour", "Coquina+Harbour"]].map(([n, q]) => h.a(HOMES(`&subdivision=${q}`), n)).join(", ")}.`) },

    { h2: "What have Little River condos sold for?", toc: "Sold prices", id: "sold", html: () =>
      h.p(`We read the county's deed index to count them. In the Little River ZIP, a condo usually sold for about $189,000 in the past year, from about 340 sales. A condo on the waterway sold for about $263,000, and one away from it for about $180,000.`) +
      h.p(`In ten buildings, the eight below plus Coquina Harbour and Moorings at Eastport, 210 condos sold at a middle price of about $180,000.`) +
      SOLD_BANDS +
      h.p(`Building by building, the middles differ as the fees do. Baytree had the most sales, 56, at about $135,000. Each building's sales are in its line above. With only a few sales, a middle is a weak guide.`) +
      NOTE(`Sales: Horry County deeds recorded in the past 12 months, with a price over $10,000. A condo sale is a deed that names a unit, matched to a building by the name on the deed and the parcel's place. Baytree includes 6 deeds filed as townhouses. A deed with no price is left out.`) },

    { h2: "What does a year cost to own a condo in Little River?", toc: "Cost to own", id: "cost", html: (bg) =>
      h.p(`Assume the county values the condo at its price. South Carolina taxes a home you live in on 4 percent of its value, and a second home or rental on 6 percent. The 4 percent rate applies to the home you live in, and you apply for it.`) +
      h.table(["Condo price", "Lived in (4%)", "Second home or rental (6%)"], [150000, 190000, 250000].map((p) => [money(p), `About ${money(up(TX[p].four, 10))}`, `About ${money(up(TX[p].six, 10))}`])) +
      h.p(`The HOA fee comes on top. At the middle fee of about $507 a month, that is about $6,100 a year, as listed.`) +
      NOTE(`Yearly tax outside the city of North Myrtle Beach, from the 2026 county levy, with a county fee of about $89. Some condos with a Little River address are inside North Myrtle Beach and pay its city tax too: ask us for the bill. Our ${h.a("/buyers/property-taxes/", "property tax guide")} shows how a bill is built.`) +
      h.cta("Want the HOA papers and flood file before you offer?", "Pick a condo. We read its HOA papers and its flood file, then tell you what we found.", "Have us check the file", CONTACT, bg) },

    { h2: "Is the condo in a flood zone?", toc: "Flood", id: "flood", html: () =>
      h.p(`About 8 in 100 of the condos for sale have their map point in a FEMA high-risk zone. A lender requires flood insurance there. The point is the building's, so the whole building is in or out of that zone.`) +
      h.p(`The rest are not in a high-risk zone at that point, but some sit in a moderate one, so we do not call them safe. In some buildings the association's policy is part of the fee: ask. Start with our ${h.a("/buyers/flood-zone-check/", "flood zone check")}, then read about ${h.a("/buyers/coastal-insurance/", "coastal insurance")}.`) },

    { h2: "Want to see a building?", toc: "Tour", id: "tour", html: (bg) =>
      h.cta("Tour three buildings with us in one day", "Pick them from the strips above. We book the showings and read each building's HOA papers and flood file first.", "Book a showing", CONTACT, bg) +
      h.p(`Two checks come before an offer on any condo. One is the building's rules on ${h.a("/invest/str-rules/", "short-term rentals")}. The other is whether a lender will accept the building, which our page on ${h.a("/invest/non-warrantable-condos/", "condos many lenders will not lend on")} explains.`) +
      h.p(`For the town itself, read the ${h.a("/submarkets/little-river/", "Little River town guide")}. For houses and townhouses, see ${h.a("/submarkets/little-river/homes-for-sale/", "Little River homes for sale")}.`) + /* forsale-links */ h.p(`Homes for sale in other places we cover: ${h.a("/submarkets/conway/homes-for-sale/", "Conway")}, ${h.a("/submarkets/myrtle-beach/homes-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/carolina-forest/homes-for-sale/", "Carolina Forest")}, ${h.a("/submarkets/little-river/homes-for-sale/", "Little River")} and ${h.a("/submarkets/north-myrtle-beach/cherry-grove/", "Cherry Grove")}. Also ${h.a("/submarkets/garden-city/homes-for-sale/", "Garden City")}, ${h.a("/submarkets/longs/", "Longs")}, ${h.a("/submarkets/loris/", "Loris")} and ${h.a("/submarkets/homes-for-sale/", "all of Horry County")}. Condos for sale: ${h.a("/submarkets/myrtle-beach/condos-for-sale/", "Myrtle Beach")}, ${h.a("/submarkets/north-myrtle-beach/condos-for-sale/", "North Myrtle Beach")}, ${h.a("/submarkets/surfside-beach/condos-for-sale/", "Surfside Beach")} and ${h.a("/submarkets/murrells-inlet/condos-for-sale/", "Murrells Inlet")}. Houses on an acre or more are on our ${h.a("/buyers/farms-and-acreage/", "farms and acreage")} page.`) /* end forsale-links */ },
  ],
  faqTitle: "Rentals, lenders and boat slips",
  faq: [
    { q: "Can I rent a Little River condo by the night?", a: `About 4 in 10 of the listings say nightly rentals are allowed. That is the listing agent's entry, so confirm it with the association. See our short-term rental rules page.` },
    { q: "Will a lender loan on a Little River condo?", a: `Some buildings fail a lender's condo review. Our page on condos many lenders will not lend on explains it. We are not a lender. Our affiliated lender, BrickWood Mortgage, a separate company, can tell you which loans fit.` },
    { q: "Does the boat slip come with the condo?", a: `Not always. A slip is often its own deed in Little River. Ask whether it is part of the sale before you offer.` },
  ],
  sources: [
    { name: "deed index", href: SRC.deeds },
    { name: "county GIS", href: SRC.gis },
    { name: "FEMA flood map", href: SRC.fema },
    { name: "SC Code 12-43-220", href: SRC.code },
    { name: "tax levy", href: SRC.levy },
    { name: "OpenStreetMap", href: SRC.osm },
  ],
  sourcesNote: "Our counts: Horry County deeds and parcels, and the FEMA flood map. Listings: CCMLS, live, in aggregate. Map points: the middle of each building's county parcels.",
    bottomCta: {
    h2: "Book a showing in Little River.",
    p: "Pick a condo from the strips above. We tour it with you and read its HOA papers and flood file before you offer.",
    label: "Book a showing", href: CONTACT,
  },
  keywords: "little river sc condo for sale, little river sc condos for sale, condos for sale in little river sc, little river south carolina condos for sale",
  about: "Condos for sale in Little River, South Carolina, live from the MLS, with the monthly fee by building, what condos sold for and what a year costs to own",
});
