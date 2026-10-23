/* /buyers/affordable-places-to-live/ - the most affordable places to buy a home near Myrtle Beach.
 *
 * Batch 2026-10-b, page 5.
 * Version 14, 2026-10-15: round 14, a rebuild (review/ROUND-14.md; the owner's third read in voice/VERDICTS.md:
 *   "talk more about benefits of each area other than price ... heres affordable homes here's all the amazing
 *   things about the location and property call us to book a showing ... the graph could be a bit sleeker ...
 *   the benefits could also be listed in the graph at the beginning").
 *   Who searches, and what they would pay to know: the ledger's "Round 14" section. A first-time or budget
 *   buyer who fears this price means giving up a good life. So each place now sells what living there gives
 *   you, with new research (rows 197 to 212): the Air Force base course and The Market Common by Parkview,
 *   the hospital and college drives from the Fairways and Amber Bluff, Lewis Ocean Bay's flytraps near
 *   Sawgrass East, the Lennar features and warranty, the Nicklaus course near Longs, the Golf and Yacht
 *   Club's lost course and its HOA, the North Myrtle Beach park and wake park near Villas at Sandridge, the MarshWalk
 *   and Huntington Beach by Wynbrooke.
 *   Shape (CRAFT 3, "No preamble"): the short answer, one offer band, then the selection guide (the glass
 *   price chart, each place's best feature beside its price; it is the only list of names before the
 *   entries), then the twelve entries. No hero tiles, no contents list (the chart links every entry), no
 *   map before the entries. Each entry: the best thing a buyer would not guess, daily life, one trade-off,
 *   the price and the yearly fee and tax in a sentence, and its own offer (glass.js offer pill). The facts
 *   strips are gone. After the entries: other places to look, one figure with the map and the drives and
 *   schools table, the tax and the down-payment help, short.
 *   Design: the liquid glass theme (tools/glass.js: G.page, G.bars, G.offer).
 * Version 14c, 2026-10-15: owner's eye 14 (review/OWNER-EYE-14-affordable-places-to-live.md, grade 7) and
 *   review/SIBLING-OWNERS.md. The Golf and Yacht Club's landing, Heron Point, watch desk and Sandpiper Place go
 *   to the gated page, the flytrap preserve to The Farm, the Avocet course to best neighborhoods. Fairways, Sawgrass
 *   East, Forestbrook Village and Amber Bluff lead with something a buyer could not guess; drives come later.
 *   The house itself in each resale place (rows 215 to 221, listings). The price and fee in one sentence in each
 *   place's offer box; the fee and tax a year in the one table after the entries, with the water and sewer note.
 *   Five aerials of bare land cut (on the photo partner's list). One map, no key, no "Where else" list. The chart
 *   is compact (glass.js bars o.compact), the gray Myrtle Beach bar first. Row 222 holds the wording changes.
 * Version 14e, 2026-10-15: owner's eye 14d (grade 8) and verifier v6 (row 225). No sample voice: homes from county
 *   parcels and builder plans, one listing detail said once in three entries (row 226). Fairways, Sawgrass East, Golf
 *   and Yacht Club and Indigo Grove lead with a fact of their own; each entry has a normal day. v6 D16 to D20 applied;
 *   every price box says "usually sold for". Wynbrooke aerial cut; town names on the map; one Parkview FAQ cut.
 * Version 14e-2, 2026-10-15: verifier v7 (row 227) D21 to D26 applied; the Conway Main Street photo (Pubdog, public
 *   domain, review/PHOTOS-FREE.md) placed in Amber Bluff's downtown Conway paragraph.
 * Version 14g, 2026-10-15: owner's eye 14f (grade 8), a fresh writer (lesson B49). The home is back in Parkview, Sawgrass
 *   East, Golf and Yacht Club, Wynbrooke and Polo Farms, from rows 129 to 139, 151, 189, 192 and 215 to 220, with listing
 *   details as "many" or "some". Sawgrass East leads with the home and what the fee covers; Golf and Yacht Club with its
 *   older one-story houses (gated owns the RV storage, Enterprise Landing and Heron Point). One grocery line (the Fairways'
 *   Aldi). No rank as a lead. Chart labels as benefits. A shorter dek, top offer title and chart note. Row 228.
 * Version 14h, 2026-10-15: owner's eye 14g (grade 8, no high). Location sold in Indigo Grove (where it is, schools, the
 *   beach), Polo Farms (yards and pools, Danny Knight Landing), Forestbrook Village (Arrowhead) and Birchwood (Longs);
 *   drive minutes in six entries; Golf and Yacht Club headlined by its gated one-story houses, with the pool hours;
 *   a 9-word dek; trade-offs for Sawgrass East and Indigo Grove; FAQ repeats cut. Row 229.
 * Versions 1 to 12, 2026-10-13 and 14: git history. Version 8 found the twelve by joining the county deed
 *   index to the parcels (rows 116 and 155); later rounds added the aerials, the drives and the flood checks.
 *
 * One price measure in every comparison: the middle recorded sale price over the past year (county deed
 * index, October 2025 to September 2026), condo units left out. Every price is rounded to the nearest $5,000;
 * every drive under 15 minutes to the nearest minute and longer ones to the nearest 5, the same on every surface.
 *
 * Facts: batches/2026-10-b/facts/affordable-facts.md.
 *   Sales by place:    rows 117 to 128, 155 to 163.     Homes and fees:  rows 129 to 140, 162, 163, 187.
 *   Drives:            rows 164, 178, 183 to 186; new drives rows 198 to 211.
 *   Living there:      rows 142 to 152, 179, 188, 189, 193; round 14 rows 197 to 211; the chart labels row 212.
 *   Fee and tax a year: row 169.  Tax: rows 153, 167, 107.  Down payment: rows 92 to 97.  Insurance: row 109.
 */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

/* Blog-Brain tools: the upload package's copy in tools/blog-brain-2026-10-b/, then $BLOG_BRAIN, then the repo. */
const BB = [path.join(__dirname, "..", "tools", "blog-brain-2026-10-b"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "glass.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/glass.js)");
const PK = require(path.join(BB, "tools", "page-kit.js"));
const AM = require(path.join(BB, "tools", "area-map.js"));
const G = PK.glass;

/* This batch's files: the website's data/2026-10-b/ (where the upload package puts them), else the
   batch folder in Blog-Brain. Photo records: batch 2026-10-a's (the website's data/photos.json), then this batch's. */
const DATA = [path.join(__dirname, "..", "data", "2026-10-b"), path.join(BB, "batches", "2026-10-b", "data"),
  "/home/user/Blog-Brain/batches/2026-10-b/data"].find((d) => fs.existsSync(path.join(d, "photos.json")));
if (!DATA) throw new Error("batch 2026-10-b photos.json not found");
const PHOTO_FILES = [path.join(__dirname, "..", "data", "photos.json"), path.join(DATA, "photos.json")].filter((f) => fs.existsSync(f));
const kit = PK.create({ h, theme: "glass", photos: PHOTO_FILES.flatMap((f) => JSON.parse(fs.readFileSync(f, "utf8")).photos),
  mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" });
const { story, placesMap, photoSet } = kit;

const SELF = "/buyers/affordable-places-to-live/";
const CONTACT = "/contact/";
const OFFER = "Book a showing";

/* Primary sources linked in the body. */
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const SCH = "https://schousing.sc.gov/homebuyers/programs-homebuyers";
const OSRM = "https://project-osrm.org/";
const WPINES = "https://www.cityofmyrtlebeach.com/i_want_to/find/whispering_pines_golf_course.php";
const BASE = "https://cityofmyrtlebeach.com/news_detail_T6_R729.php";
const RAMBI = "https://www.myhorrynews.com/visit/race-to-myrtle-beach-speedway-for-the-nascar-experience/article_494efd18-8ab0-11e8-825d-ef4e52fa72ee.html";
const SPEEDWAY = "https://www.wmbfnews.com/2024/07/10/old-myrtle-beach-speedway-being-transformed-into-townhome-community";
const REV3 = "https://www.myhorrynews.com/news/for-rent-townhome-community-breaks-ground-in-carolina-forest/article_bc89fa83-1610-4e28-ad33-58e653b0135c.html";
const POLO_FLOOD = "https://www.wmbfnews.com/2018/11/29/wmbf-investigates-did-poor-planning-lead-flooding-longs-community/";
const OVERLOOK = "https://www.lennar.com/new-homes/south-carolina/myrtle-beach/longs/the-overlook";
const LENNAR_WARRANTY = "https://www.lennar.com/warranty";
const CFRC = "https://horrycountysc.gov/departments/parksandrecreation/recreation-centers/";
const LOB = "https://www.dnr.sc.gov/news/2025/Jun/jun10-lewisoceanbay.php";
const HERON = "https://www.wmbfnews.com/story/26752147/another-golf-course-announces-its-closing/";
const MBGYC = "https://www.mbgyc.com/";
const NMBPARK = "https://www.sctrails.net/trails/trail/north-myrtle-beach-park-and-sports-complex";
const NMBEXP = "https://nmb.us/802/North-Myrtle-Beach-Park-Sports-Complex-E";
const MARSHWALK = "https://www.marshwalk.com/";
const HBSP = "https://southcarolinaparks.com/huntington-beach";
const WILDWING = "https://www.wildwing.com/";
const ARROWHEAD = "https://www.arrowheadcc.com/";
const DRH = "https://www.drhorton.com/south-carolina/myrtle-beach/conway/the-townes-at-amber-bluff";

/* ---------------------------------------------------------------------------- */
/* Values, rounded once, used everywhere.                                         */

const money = (v) => "$" + (Math.round(v / 5000) * 5000).toLocaleString("en-US");
/* Drives under 15 minutes to the nearest minute, longer ones to the nearest 5 (CRAFT 2). */
const mins = (m) => `${m < 15 ? Math.max(1, Math.round(m)) : Math.round(m / 5) * 5}`;

/* The twelve places, lowest middle sale price first (rows 117 to 128, 155 to 163). lat and lon: the middle
   of each place's sales (row 164). mb: minutes to Coastal Grand Mall; beach: to the nearest public beach
   access by car (rows 164, 185). year: the HOA fee and tax a year (row 169). feature: the chart's label
   (row 212). */
const P = [
  { id: "parkview", name: "Parkview", map: "Parkview", lat: 33.686431, lon: -78.910360, price: 190000, mb: 6.1, beach: 4.0, year: 4700,
    feature: "4 min to the beach", schools: "Myrtle Beach Elementary, Middle and High" },
  { id: "fairways-at-wild-wing", name: "The Fairways at Wild Wing", map: "Fairways at Wild Wing", lat: 33.787649, lon: -78.986234, price: 215000, mb: 16.5, beach: 17.8, year: 6100,
    feature: "golf, lawn care", schools: "Carolina Forest Elementary, Ten Oaks Middle, Carolina Forest High" },
  { id: "sawgrass-east", name: "Sawgrass East", map: "Sawgrass East", lat: 33.756167, lon: -78.929975, price: 222500, mb: 16.7, beach: 17.9, year: 6000,
    feature: "garage, lawn care", schools: "Ten Oaks Elementary, Ten Oaks Middle, Carolina Forest High" },
  { id: "birchwood", name: "Birchwood", map: "Birchwood", lat: 33.925885, lon: -78.754012, price: 223825, mb: 41.6, beach: 20.2, year: 2400,
    feature: "paddle the Waccamaw", schools: "Daisy Elementary, Loris Middle, Loris High" },
  { id: "golf-and-yacht-club", name: "Myrtle Beach Golf and Yacht Club", map: "Golf and Yacht Club", lat: 33.649402, lon: -79.05007, price: 225000, mb: 22.9, beach: 15.0, year: 2100,
    feature: "gated, one story", schools: "St. James Elementary, Intermediate, Middle and High" },
  { id: "forestbrook-village", name: "Forestbrook Village", map: "Forestbrook Village", lat: 33.714649, lon: -78.966818, price: 232310, mb: 11.3, beach: 12.6, year: 3000,
    feature: "up to 2,400 sq ft", schools: "Forestbrook Elementary, Forestbrook Middle, Socastee High" },
  { id: "victory-point", name: "Victory Point", map: "Victory Point", lat: 33.7454, lon: -78.951801, price: 235630, mb: 12.7, beach: 13.9, year: 3800,
    feature: "new townhomes", schools: "Pine Island Elementary, Ten Oaks Middle, Carolina Forest High" },
  { id: "amber-bluff", name: "The Townes at Amber Bluff", map: "Amber Bluff", lat: 33.810207, lon: -79.021249, price: 237500, mb: 19.3, beach: 20.6, year: 2200,
    feature: "smart homes, CCU 6 min", schools: "Waccamaw Elementary, Black Water Middle, Carolina Forest High" },
  { id: "villas-at-sandridge", name: "Villas at Sandridge", map: "Villas at Sandridge", lat: 33.852846, lon: -78.696635, price: 245000, mb: 29.3, beach: 7.46, year: 4600,
    feature: "5 min to a wake park", schools: "Waterway Elementary, North Myrtle Beach Middle and High" },
  { id: "indigo-grove", name: "Indigo Grove", map: "Indigo Grove", lat: 33.862931, lon: -78.749665, price: 245000, mb: 35.0, beach: 13.2, year: 2000,
    feature: "22 acres open space", schools: "Riverside Elementary, North Myrtle Beach Middle and High" },
  { id: "wynbrooke", name: "Wynbrooke", map: "Wynbrooke", lat: 33.584176, lon: -79.048446, price: 249500, mb: 19.8, beach: 8.9, year: 6500,
    feature: "MarshWalk 5 min away", schools: "St. James Elementary, Intermediate, Middle and High" },
  { id: "polo-farms", name: "Polo Farms", map: "Polo Farms", lat: 33.917844, lon: -78.812061, price: 255000, mb: 36.0, beach: 22.0, year: 1300,
    feature: "fenced yards, $20 fee", schools: "Daisy Elementary, Loris Middle, Loris High" },
];
const N = Object.fromEntries(P.map((p, i) => [p.id, Object.assign(p, { n: i + 1 })]));
const A = (id) => "#" + id;
/* A house in the city of Myrtle Beach (verified row 24: the non-condo middle, $421,250). */
const MB_HOUSE = 421250;
const yr = (id) => "$" + N[id].year.toLocaleString("en-US");
const pr = (id) => money(N[id].price);

/* The selection guide: the glass price chart, each place's best feature beside its price (row 212, 222). The
   gray Myrtle Beach bar comes first, so the point is clear before the list: these cost about half. Compact rows
   (glass.js bars o.compact), so the first place starts sooner on a phone (owner's eye 14, H1). */
const GUIDE = G.bars([{ name: "A Myrtle Beach home", value: MB_HOUSE, valueText: money(MB_HOUSE), reference: true }]
  .concat(P.map((p) => ({ name: `${p.n}. ${p.chart || p.map}`, value: p.price, valueText: money(p.price), feature: p.feature, href: A(p.id) }))), {
  caption: "About half the price of a Myrtle Beach home",
  note: "Tap a name to read about it.",
  max: MB_HOUSE, featureLabel: "best feature", valueLabel: "Usually sold for", compact: true, phoneList: true,
});

/* One map after the entries, the twelve numbered as on the page, with no key: the table under it names them. */
const placeOf = (p) => ({ name: p.map, lat: p.lat, lon: p.lon, href: A(p.id) });
/* Town names as a small label layer (owner's eye 14d, M3): the map tool's town leaders, with no place leaders. */
const MAP = placesMap("Affordable neighborhoods near Myrtle Beach", P.map(placeOf), {
  caption: "Map of the twelve neighborhoods, numbered as on this page, with the nearest towns.",
  leaders: { places: false, towns: ["North Myrtle Beach", "Myrtle Beach", "Conway", "Little River"] },
});
/* Numbers only, the same for every dot (owner's eye 14c, L3: three dots had no name and nine did): the tool's
   name pills and their leader lines come off, and the table under the map names each number. */
MAP.html = MAP.html.replace(/(<g class="k">)(?:<rect [^>]*\/>)+(<circle [^>]*\/><text class="nm"[^>]*>\d+<\/text>)<text class="l"[\s\S]*?<\/text>(<\/g>)/g, "$1$2$3")
  .replace(/<path d="M[\d.]+ [\d.]+L[\d.]+ [\d.]+" stroke="#1c2028" stroke-width="1\.1"\/><circle cx="[\d.]+" cy="[\d.]+" r="2\.4" fill="#1c2028"\/>/g, "");
MAP.html = MAP.html.replace(/<ol[\s\S]*?<\/ol>/g, "");

/* After the entries, one figure: the map, then the table a comparer uses: the HOA fee and tax a year (row 169),
   the drive to a beach (rows 164, 185) and the zoned schools (row 165). The water and sewer note is said here
   once (rows 129 to 131, 136), not in each entry. */
const FEE = { "parkview": 325, "fairways-at-wild-wing": 390, "sawgrass-east": 425, "birchwood": 120, "golf-and-yacht-club": 95,
  "forestbrook-village": 170, "victory-point": 235, "amber-bluff": 100, "villas-at-sandridge": 300, "indigo-grove": 80, "wynbrooke": 450, "polo-farms": 20 };
const COMPARE_CSS = "<style>.c3-cmp{margin:1.2rem 0 1.6rem;max-width:900px}.c3-cmp .t{overflow-x:auto}.c3-cmp table{width:100%;border-collapse:collapse;font-size:.98rem;line-height:1.4}"
  + ".c3-cmp caption{caption-side:top;text-align:left;color:var(--navy);font-weight:600;padding:0 0 .6rem}"
  + ".c3-cmp th,.c3-cmp td{text-align:left;padding:.45rem .8rem .45rem 0;border-top:1px solid var(--line,#e3ddd0);vertical-align:top}"
  + ".c3-cmp thead th{border-top:0;color:var(--navy)}.c3-cmp td{color:var(--muted)}.c3-cmp tbody th{color:var(--navy);font-weight:500}"
  + ".c3-cmp th a{color:var(--navy)}@media (max-width:599px){.c3-cmp table{font-size:.92rem}}</style>";
const COMPARE = COMPARE_CSS + `<figure class="c3-cmp">` + MAP.html
  + `<div class="t"><table><caption>The HOA fee and tax a year, the drive to a beach, and the zoned schools</caption>`
  + `<thead><tr><th scope="col">Place</th><th scope="col">Fee and tax a year</th><th scope="col">To a beach</th><th scope="col">Schools (district zones)</th></tr></thead><tbody>`
  + P.map((p) => `<tr><th scope="row"><a href="${A(p.id)}">${p.n}. ${p.map}</a></th><td>About ${yr(p.id)}</td><td>About ${mins(p.beach)} min</td><td>${p.schools}</td></tr>`).join("")
  + "</tbody></table></div><figcaption>The fee and tax are for a year, besides the mortgage and insurance, for a home you live in. The HOA fee includes water and sewer at Parkview, and usually at Sawgrass East and Wynbrooke. At the Fairways, only some homes list them in the fee. Drives have no traffic; in our experience, rush hour adds 5 to 10 minutes.</figcaption></figure>";

/* Labelled aerials (USDA NAIP 2023, public domain; Chapter3's labels), one per place. */
const ph = photoSet({ aerialWidth: "720px" });
const PHOTO_CSS = ph.css();
const PH = {
  "parkview": ph.aerial("parkview-and-whispering-pines-from-above", "Parkview, beside 17th Avenue South, with Whispering Pines Golf Course, from above.", { closeUp: true }),
  "victory-point": ph.aerial("old-speedway-and-victory-point-labelled-from-above", "The old Myrtle Beach Speedway beside US 501, before Victory Point was built on part of its land."),
  "amber-bluff": ph.aerial("conway-main-street-downtown", "Main Street in downtown Conway, the downtown closest to Amber Bluff.", { closeUp: true }),
  "polo-farms": ph.aerial("polo-farms-and-simpson-creek-from-above", "Polo Farms off SC 905, with Simpson Creek along its southwest side.", { closeUp: true }),
};
ph.share("old-speedway-and-victory-point-labelled-from-above");

/* One numbered entry. It ends with the place's own offer box (CRAFT 3, "Every place gets its own offer"): the
   price and the HOA fee in one plain sentence, then the pill, "Book a showing in X". The sentence sits in the
   offer box (div.c3-place-cta), as on the gated and best-neighborhoods pages: it is the reader's next fact
   before they act, and repeat-check reads it as the offer. The yearly fee and tax are in the table. */
const PLACE_CSS = "<style>main#main .c3-place-cta{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem 1.2rem;max-width:760px;margin:1.6rem 0 .4rem;padding:1rem 1.2rem;border-radius:20px;"
  + "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,none),var(--g-sh,none)}"
  + "main#main .c3-place-cta>p:first-child{flex:1 1 18rem;margin:0;color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.55}"
  + "main#main .c3-place-cta .c3-offer{margin:0;flex:0 1 auto}"
  + "@media (prefers-reduced-transparency:reduce){main#main .c3-place-cta{background:#fbf8f3}}main#main .detail-hero .detail-sub{display:none}</style>";
/* The price sentence for each place, written by hand so twelve offers do not read as one template. */
const PRICE = {
  "parkview": `Townhomes here usually sold for about ${pr("parkview")} last year, with an HOA fee of about $325 a month.`,
  "fairways-at-wild-wing": `Fairways townhomes usually sold for about ${pr("fairways-at-wild-wing")} last year, and the HOA fee is about $390 a month.`,
  "sawgrass-east": `Sawgrass East townhomes usually sold for about ${pr("sawgrass-east")} last year, and the HOA fee is about $425 a month.`,
  "birchwood": `New houses in Birchwood usually sold for about ${pr("birchwood")} last year; the HOA fee is about $120 a month.`,
  "golf-and-yacht-club": `Houses in the older part usually sold for about ${pr("golf-and-yacht-club")} last year, and the HOA fee is about $95 a month.`,
  "forestbrook-village": `Lennar's townhomes here usually sold for about ${pr("forestbrook-village")} last year, with an HOA fee of about $170 a month.`,
  "victory-point": `Townhomes in Victory Point usually sold for about ${pr("victory-point")} last year, and the HOA fee is about $235 a month.`,
  "amber-bluff": `These townhomes usually sold for about ${pr("amber-bluff")} last year, with an HOA fee of about $100 a month.`,
  "villas-at-sandridge": `These townhomes usually sold for about ${pr("villas-at-sandridge")} last year, and the dues are about $300 a month.`,
  "indigo-grove": `New houses here usually sold for about ${pr("indigo-grove")} last year, with an HOA fee of about $80 a month.`,
  "wynbrooke": `Townhomes in Wynbrooke usually sold for about ${pr("wynbrooke")} last year, with an HOA fee of about $450 a month.`,
  "polo-farms": `Houses in Polo Farms usually sold for about ${pr("polo-farms")} last year, and the HOA fee is about $20 a month.`,
};
const placeCta = (id) => `<p class="c3-place-price">${PRICE[id]}</p>`; /* round 15: the price line; the homes strip is the offer */
const entry = (id, short, html) => ({ h2: `${N[id].n}. ${N[id].name}: ${short}`, toc: N[id].map, id,
  html: (bg) => withStrip(id, html(bg)) + placeCta(id) });
/* The homes strip takes the place of the photo (owner, 2026-10-21): where the entry has a photo, the
   strip goes there and the photo is its placeholder; otherwise the strip follows the first paragraph. */
function withStrip(id, out) {
  if (PH[id] && out.includes(PH[id])) return out.replace(PH[id], () => G.homes(id, N[id].name, PH[id]));
  return out.replace("</p>", () => "</p>" + G.homes(id, N[id].name));
}

/* ItemList JSON-LD for the twelve numbered entries. */
const ITEMLIST = () => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList",
  name: "The most affordable neighborhoods near Myrtle Beach", numberOfItems: P.length,
  itemListElement: P.map((p) => ({ "@type": "ListItem", position: p.n, name: p.name, url: `https://chapter3realty.com${SELF}#${p.id}` })) })}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "Most Affordable Places to Buy Near Myrtle Beach | Chapter3",
  description: "The twelve lowest-priced neighborhoods within about 20 minutes of the beach near Myrtle Beach, and what each gives you: garages, golf, parks, new homes.",
  ogTitle: "The most affordable neighborhoods near Myrtle Beach, and the best thing about each",
  crumb: "Affordable places",
  eyebrow: "Buying on a budget",
  h1: "Where are the most affordable places to buy a home near Myrtle Beach?",
  h1em: "Twelve neighborhoods, and the best thing about each.",
  sub: "Affordable places near Myrtle Beach, with what the price buys in each: the house, the land and the drive.",
  toc: false,
  heroCta: false, /* round 15 (owner, 2026-10-21): the homes strips are the offer */
  author: "devin",
  shortAnswer: [
    `Within about 20 minutes of a beach, these twelve neighborhoods near Myrtle Beach had the lowest prices last year. Homes in them usually sold for about ${pr("parkview")} to ${pr("polo-farms")}, against about ${money(MB_HOUSE)} for a Myrtle Beach home that is not a condo. Four of the twelve are neighborhoods of houses; the rest are townhomes.`,
  ],
  sections: [
    { h2: "What does each neighborhood do best?", toc: "The twelve at a glance", id: "compare", html: () =>
      PHOTO_CSS + PLACE_CSS + G.homesCss() + GUIDE },

    entry("parkview", "townhomes by the city's golf course, near the beach", () =>
      h.p("Parkview is a four-minute drive from the beach. Its townhomes are off 17th Avenue South, inside the city of Myrtle Beach, around ponds and a pool for owners.") +
      h.p("Built in the mid-2000s, the townhomes have about 1,050 to 1,350 square feet and two or three bedrooms. Many have vaulted ceilings and a front porch, and some have a screened porch.") +
      PH["parkview"] +
      h.p(`Whispering Pines, the ${h.ext(WPINES, "city's own 18-hole golf course")}, is less than a quarter mile from Parkview. It was originally part of the Myrtle Beach Air Force Base, and its tee markers feature the squadron emblems. Residents of Horry, Georgetown and Brunswick counties play a round there for $45 plus tax, with a cart.`) +
      h.p("There are about 200 townhomes here, and the HOA fee includes water, sewer, grounds care and the pool. For dinner and a movie, The Market Common has shops, restaurants and a theater.") +
      h.p("Few of these townhomes come up for sale in a year, so one of our agents watches for each new listing.")),

    entry("fairways-at-wild-wing", "townhomes in a golf community", () =>
      h.p("Fairways townhomes usually have two stories and three or four bedrooms. Most have their own garage, some with room for two cars, and some put the main bedroom downstairs.") +
      h.p("They are inside Wild Wing Plantation, a golf club, and some are near the course. The HOA fee usually includes the lawn care, the pool and the internet, so a Saturday can go to golf instead of yard work.") +
      h.p("The Fairways is inside Conway's city limits, where the yearly tax is higher than outside a town.")),

    entry("sawgrass-east", "townhomes where the fee covers the insurance and the lawn", () =>
      h.p(`At Sawgrass East, the HOA fee usually pays the insurance on the buildings, the lawn care, and the water, sewer and trash. In most townhomes here, an owner has no water or trash bill of their own, and the HOA cares for the lawns.`) +
      h.p("Many of the townhomes have three bedrooms, often with a one-car garage and the main bedroom downstairs.") +
      h.p("There are about 255 of them, built in the mid-2000s, around three small lakes that the HOA owns, with a pool and a clubhouse for owners. The county's Carolina Forest library and recreation center are on the boulevard that leads in.") +
      h.p("The beach is about ten miles away by road, so a beach day means a drive.")),

    entry("birchwood", "a new house on a quarter acre", () =>
      h.p("Birchwood is small: 77 lots, with new Lennar houses on lots of about a quarter acre and about 12 acres of open space. A quarter acre gives a new house a real backyard at this price.") +
      h.p("Chris Anderson Landing, a county boat ramp on the Waccamaw River, is about 7 minutes from Birchwood by car. From there you can paddle the state's Waccamaw River trail downriver through bald cypress woods, about 20 miles to Red Bluff Landing.") +
      h.p("FEMA maps every lot in Birchwood as an area of minimal flood hazard. High-speed internet is included in the monthly dues.") +
      h.p("A new house here sells for about what a 1980s house does in the Golf and Yacht Club, closer to Myrtle Beach. Birchwood is off SC 905, southwest of Longs, and North Myrtle Beach and its beaches are about 20 minutes by car.") +
      h.p(`The long drive is to Myrtle Beach: Coastal Grand Mall is about a forty-minute drive, by the Carolina Bays Parkway.`)),

    entry("golf-and-yacht-club", "one-story houses behind a gate", () =>
      h.p("The older part of Myrtle Beach Golf and Yacht Club has about 470 houses inside a gate, most of them one story. For a boat, Osprey Marina has wet slips and dry boat storage on the Intracoastal Waterway, about four miles away by road.") +
      h.p("Most houses there were built in the 1980s, with two or three bedrooms and two baths. They typically have about 1,200 square feet, on about an eighth of an acre, and many have a porch or a patio.") +
      h.p("Owners share a pool and hot tub, tennis courts and a community center.") +
      h.p("Age matters here. Insurers may require an older home to have an updated roof, wiring, plumbing and heating, so we have the home inspector look at each before you buy.")),

    entry("forestbrook-village", "new townhome plans up to 2,400 square feet", () =>
      h.p("At Forestbrook Village, Lennar has four townhome plans, from about 1,450 up to 2,400 square feet. Lennar is still building here, so some of these townhomes are brand new.") +
      h.p("The townhomes are off Forestbrook Road, south of US 501, beside the older Forestbrook neighborhood. Owners have a pool and a playground, and internet and grounds care are included.") +
      h.p(`Near Forestbrook Village, ${h.ext(ARROWHEAD, "Arrowhead Country Club")} has 27 holes of golf along the Intracoastal Waterway. Water comes into play on 24 of them.`) +
      h.p("Some lots here are in a high-risk flood zone, where a lender usually requires flood insurance, so the lot can matter as much as the plan.")),

    entry("victory-point", "new townhomes on part of the old speedway", () =>
      h.p(`Victory Point is built on part of the old Myrtle Beach Speedway. The track ${h.ext(RAMBI, "opened in 1958")} as RAMBI Raceway, and cars ran their ${h.ext(SPEEDWAY, "last laps there in 2020")}. Several streets have racing names: Speedway Street, Talladega Drive and Pit Crew Drive.`) +
      PH["victory-point"] +
      h.p("The townhomes are new, three-bedroom and about 1,450 square feet. Lennar built them off US 501, by Tanger Outlets, with a pool, a playground, a picnic area and a pond.") +
      h.p("Lennar lists Victory Point as sold out for now, so we watch for resales.") +
      h.p(`Expect more building. Another owner plans ${h.ext(REV3, "194 townhomes for rent")} on about 20 acres of the old speedway land beside it.`)),

    entry("amber-bluff", "smart-home townhomes about 6 minutes from the football stadium", () =>
      h.p("Every townhome at Amber Bluff came with a smart-home package: you can control the front door lock, the thermostat and the video doorbell from your phone.") +
      h.p(`Off Savannah Bluff Road, ${h.ext(DRH, "D.R. Horton builds one plan")}, the Pearson. It has two stories and a one-car garage, in about 1,420 square feet.`) +
      h.p("On game days, Brooks Stadium, where the Chanticleers play football, is about a six-minute drive. Coastal Carolina University and Horry-Georgetown Technical College are about as close, for a class or a job.") +
      h.p("Downtown Conway, with its shops on Main Street and its riverwalk on the Waccamaw River, is about a seven-minute drive.") +
      PH["amber-bluff"] +
      h.p("Each owner will also pay a yearly insurance assessment that is not yet set. We find out what it will be for any home you like.")),

    entry("villas-at-sandridge", "townhomes five minutes from a cable wake park", () =>
      h.p(`At Shark Wake Park, a five-minute drive from Villas at Sandridge, a cable pulls wakeboard riders across the water. It is inside the ${h.ext(NMBPARK, "North Myrtle Beach Park and Sports Complex")}, which also has walking trails, two dog parks and an accessible playground.`) +
      h.p("Villas at Sandridge is a small community of 79 townhomes off SC 90 near Little River, with about 8 acres of shared open space. Dream Finders Homes built them with two stories and a one-car garage, and some plans have the main bedroom on the first floor.") +
      h.p(`The city's ${h.ext(NMBEXP, "new section of the park")} has added soccer and baseball fields, ponds, trails and two more playgrounds. The nearest beach is a seven-minute trip by car.`) +
      h.p("Expect higher dues here than at the other new communities on this list.")),

    entry("indigo-grove", "new houses on open land, 13 minutes from the beach", () =>
      h.p("Most of Indigo Grove's new houses back onto about 22 acres of open space that the HOA owns. The beach is about 13 minutes away by car.") +
      h.p("The open land holds three new ponds, one with a small island of trees, and strips of woods along a creek. The neighborhood is off SC 90, and its homes are zoned for Riverside Elementary and North Myrtle Beach Middle and High.") +
      h.p(`Most of the houses are Lennar's, which sells them as The Overlook. ${h.ext(OVERLOOK, "Lennar lists nine floor plans")} with three to five bedrooms, some of them one story, on lots of about a fifth of an acre.`) +
      h.p("Every lot is outside the high-risk flood zone, so a lender usually will not require flood insurance on a home here.")),

    entry("wynbrooke", "townhomes five minutes from the Murrells Inlet MarshWalk", () =>
      h.p(`At the ${h.ext(MARSHWALK, "Murrells Inlet MarshWalk")}, five minutes from Wynbrooke, the restaurants on the marsh have live music every night, and there is never a cover charge.`) +
      h.p(`${h.ext(HBSP, "Huntington Beach State Park")}, with three miles of beach, is 10 minutes away.`) +
      h.p("The townhomes, built in the early 2000s, are off SC 707, around ponds, and some back onto the water. Many have a screened porch and a loft.") +
      h.p("Wynbrooke's HOA fee is the highest of the twelve, though it usually pays for the insurance on the buildings and for the grounds care.")),

    entry("polo-farms", "one-story houses with fenced yards", () =>
      h.p("Many backyards in Polo Farms are fenced, and several have their own pool. That is room for a dog to run and a swim at home, in a house of your own for about the price of a townhome in Wynbrooke.") +
      h.p("Most of the houses are one story, with three bedrooms, on lots of about a fifth of an acre. They are off SC 905, west of Longs, and were built in three phases, from the mid-2000s on.") +
      PH["polo-farms"] +
      h.p(`Flood is a concern here. After Hurricane Florence in 2018, the Waccamaw River rose to historic heights; ${h.ext(POLO_FLOOD, "floodwater filled the streets")} and gutted homes across the neighborhood. More than four in ten of its lots are in a high-risk flood zone. Before you make an offer, we look up the lot on FEMA's flood map.`)),

    { h2: "How do the twelve compare on yearly cost, the beach and schools?", toc: "Cost, beach and schools", id: "schools", html: () =>
      h.p(`The map shows where each place is, and the table gives the HOA fee and tax a year, the drive to a beach and the zoned schools. To choose by what you want nearby, read our guide to the ${h.a("/buyers/best-neighborhoods/", "best neighborhoods near Myrtle Beach")}. For no HOA fee at all, see our guide to ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")}.`) +
      COMPARE },

    { h2: "How much property tax will you pay?", toc: "Property tax", id: "property-tax", html: () =>
      h.p(`Take a $240,000 home that is your main home. ${h.ext(LEVY, "Its yearly tax")} depends on where it is:`) +
      h.ul(["Outside a town, or in Myrtle Beach: about $970.", "In Polo Farms: about $980. In Wynbrooke: about $1,030.", `Inside ${h.a("/submarkets/conway/", "Conway")}: about $1,570.`]) +
      h.p(`When you buy, the county values the home at about what it is worth that year, and the new value shows up on the next year's bill. These figures use the county's lower rate for a home you live in, which our ${h.a("/buyers/property-taxes/", "property tax guide")} explains.`) },

    { h2: "What help can you get with a down payment?", toc: "Down payment help", id: "down-payment", html: (bg) =>
      h.p(`SC Housing, the state's housing agency, gives buyers in Horry and Georgetown counties $10,000 toward the down payment and closing costs. It is forgivable: you do not pay it back if you stay in the home long enough. The program is called the ${h.ext(SCH, "Homebuyer Program")}.`) +
      h.p("You do not have to be a first-time buyer. The program has these limits:") +
      h.ul(["You must not own a home when you close.", "Household income must be under about $115,000 for one or two people, and under about $134,000 for three or more.", "The home price can be up to $450,000."]) +
      h.p(`You apply through a lender that works with SC Housing. Our page on ${h.a("/buyers/programs/", "down-payment help programs")} explains the Homebuyer Program step by step, including the credit score it needs.`) +
      story([
        "<strong>Example:</strong> Dana rents an apartment in Myrtle Beach and wants a house of her own in Conway. She thinks she must save for years before she can buy.",
        "Her Chapter3 agent shows her SC Housing's Homebuyer Program, which helps buyers here pay the down payment. The agent puts her in touch with a lender that works with the program.",
        "Dana takes the homebuyer class and starts looking at houses, instead of saving for years first.",
      ], "", bg) },
  ],
  faqTitle: "Affordable places near Myrtle Beach: FAQ",
  faq: [
    { q: "What is the cheapest neighborhood to buy a home near Myrtle Beach?", a: `Of the neighborhoods within about 20 minutes of the beach where at least 10 homes sold in the past year, Parkview had the lowest prices. Its older townhomes usually sold for about ${pr("parkview")}.` },
    { q: "Where can you buy a new house near Myrtle Beach for less?", a: `In Birchwood, off SC 905 near Longs, new Lennar houses usually sold for about ${pr("birchwood")} in the past year. In Indigo Grove, off SC 90, they usually sold for about ${pr("indigo-grove")}.` },
    { q: "Is it cheaper to buy in Conway than in Myrtle Beach?", a: `Yes. A home that resold in Conway in the past year usually went for about ${money(264250)}. In the city of Myrtle Beach, a home usually went for about ${money(MB_HOUSE)}.` },
    { q: "Do you have to be a first-time buyer to get down-payment help?", a: `No, not in Horry or Georgetown County. Palmetto Home Advantage, an SC Housing down-payment program, is open to repeat buyers too. Our page on down-payment help programs covers it and the Homebuyer Program.` },
  ],
  sources: [
    { name: "county deeds", href: DEEDS },
    { name: "county parcels", href: PARCELS },
    { name: "county tax rates", href: LEVY },
    { name: "OpenStreetMap drive times", href: OSRM },
    { name: "SC Housing", href: SCH },
    { name: "City of Myrtle Beach", href: WPINES },
    { name: "Lennar", href: OVERLOOK },
  ],
  sourcesNote: "Not legal, tax or loan advice. The list: 10 or more sales and a beach access within about 20 minutes. Prices: the middle recorded sale, October 2025 to September 2026, without condos or manufactured homes. Drives from the middle of each place, no traffic. Homes from listings and builders; schools from zones. Tax for a home you live in, before the break at 65.",
  afterSources: () => ph.credits() + ITEMLIST(),
  bottomCta: { h2: "Book a showing in the neighborhood you liked.", p: "Tell us your price range and the places you like. One of our agents will send you the homes for sale there, set up the showings, and find the down-payment programs that fit.", label: OFFER, href: CONTACT },
  keywords: "most affordable places to live near Myrtle Beach, cheapest neighborhoods Myrtle Beach, affordable townhomes Myrtle Beach, cheap homes near Myrtle Beach, new homes under 250000 Myrtle Beach, Parkview Myrtle Beach, Wild Wing Plantation townhomes, Victory Point Myrtle Beach, Forestbrook Village, Villas at Sandridge, Birchwood Longs SC, Indigo Grove Longs",
  about: "The most affordable neighborhoods to buy a home near Myrtle Beach, South Carolina, by recorded sale price: Parkview, the Fairways at Wild Wing Plantation, Sawgrass East, Birchwood, Myrtle Beach Golf and Yacht Club, Forestbrook Village, Victory Point, the Townes at Amber Bluff, Villas at Sandridge, Indigo Grove, Wynbrooke and Polo Farms",
});
