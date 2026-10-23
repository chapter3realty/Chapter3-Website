/* /buyers/no-hoa-homes/ - the areas in and around Myrtle Beach where all or most homes have no HOA fee,
 * what each area gives a buyer who wants the freedom of no HOA, one line on its price, and an offer for each.
 *
 * Batch 2026-10-b, page 3.
 * Version 15, 2026-10-15: round 14f, a fresh writer (lesson B49, after three reviews at 7: OWNER-EYE-14e).
 *   The owner's words: "get as many areas in and around the city circle them say all of the houses in this
 *   area have no HOA or most of them don't and then speak extensively on all of the benefits of that
 *   location and why people like it one line about the average price of the house and do that for as many
 *   areas as possible." So, per the coordinator's decisions for 14f:
 *   - Plantation Point is cut: an HOA owns its common areas and no source settles what owners pay (rows 148
 *     and 171). Murrells Inlet's north end is added (rows 175 and 176, pending verification, round 14f).
 *     Still 16 areas.
 *   - Each entry in the owner's order: the share chip under the heading only; the lead (why people choose
 *     the place, the best thing a buyer could not guess); a normal day; one honest trade-off; then the
 *     price as one line inside the offer box (div.c3-place-cta, as gated and best do); then the offer.
 *   - The top: one subtitle (the h1em; the dek is hidden), one short, wide map with every area circled or
 *     outlined and named where the name fits (the coast's names by leader lines), and a guide that lists
 *     every area by its number.
 *   - "We check" three times at most on the page: under the rule cards, in the FAQ, and the top offer.
 *   - The rule cards name each icon on a phone (Boat, Work truck, Short-term rental, Shed or fence).
 *   Facts: rows 115 to 134 (verified, round 14), 137 to 148 (v7), 149 to 174 (round 14d, under the v8
 *   check) and 175 to 178 (round 14f, pending verification), as cited beside each sentence below.
 * Earlier versions (1 to 14, 2026-10-13 to 15): see git history.
 */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

/* Where the Blog-Brain tools are (tools/page-kit.js "Finding Blog-Brain"). */
const BB = [path.join(__dirname, "..", "tools", "blog-brain-2026-10-b"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "page-kit.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/page-kit.js)");
const PK = require(path.join(BB, "tools", "page-kit.js"));
const GL = PK.glass;

/* This batch's files: the website's data/2026-10-b/ (where the upload package puts them), else the
   batch folder in Blog-Brain. */
const BATCH_DATA = [path.join(__dirname, "..", "data", "2026-10-b"), path.join(BB, "batches", "2026-10-b", "data"),
  "/home/user/Blog-Brain/batches/2026-10-b/data"].find((d) => fs.existsSync(path.join(d, "no-hoa-areas.json")));
if (!BATCH_DATA) throw new Error("batch 2026-10-b no-hoa-areas.json not found");
const read = (name) => JSON.parse(fs.readFileSync(path.join(BATCH_DATA, name), "utf8"));
const DATA = read("no-hoa.json");
const AREAS = read("no-hoa-areas.json");
const BANDS = read("no-hoa-bands.json").bands;
const PHOTO_FILES = [path.join(__dirname, "..", "data", "photos.json"), path.join(BATCH_DATA, "photos.json")].filter((f) => fs.existsSync(f));
const PHOTOS = [];
for (const f of PHOTO_FILES) for (const r of JSON.parse(fs.readFileSync(f, "utf8")).photos) {
  const k = JSON.stringify(r.variants || r.file);
  if (!PHOTOS.some((x) => JSON.stringify(x.variants || x.file) === k)) PHOTOS.push(r);
}
const MAP_DIR = path.join(__dirname, "..", "chapter3realty", "images", "maps");
const kit = PK.create({ h, theme: "glass", photos: PHOTOS, mapDir: MAP_DIR, mapSrc: "/images/maps" });
const { story } = kit;
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const ph = kit.photoSet({ aerialWidth: "760px" });
/* One picture per area where we have a lawful one of the place itself (photos.json records; the photo
   partner's ground photos will replace them). Made at load time: mkpage reads pageImages first.
   Round 14f: the Pine Lakes clubhouse is cut (it did not show the lots, OWNER-EYE-14e M7); the Surfside
   photo is the crop of the houses (record surfside-beach-houses-row) when its files exist, else none;
   Little River gets its labelled aerial of the old waterfront streets. No house number in any caption. */
const PHOTO = {
  "mb-downtown": ph.aerial("downtown-myrtle-beach-pleasant-inn", "The Pleasant Inn, a wood guest house from about 1927, under the live oaks on Broadway Street, in the old town by Withers Swash.", { closeUp: true }),
  "mb-myrtle-heights": ph.aerial("myrtle-heights-older-house-on-ocean-boulevard", "An older two-story house with columns on North Ocean Boulevard, in the Myrtle Heights-Oak Park Historic District.", { closeUp: true }),
  "crescent-beach": ph.aerial("crescent-beach-streets-from-the-ocean-2011", "Crescent Beach from over the ocean in 2011: streets of beach houses behind the oceanfront."),
  "cherry-grove": ph.aerial("cherry-grove-canals-from-the-ocean-2011", "Cherry Grove from over the ocean in 2011: houses on the canals, many with their own docks, and the marsh behind."),
  "little-river": ph.aerial("little-river-waterway-from-above", "The old Little River waterfront from the air: streets of houses beside the salt marsh and the Intracoastal Waterway.", { closeUp: true }),
  "garden-city": ph.aerial("garden-city-beach-and-marsh-from-the-ocean-2011", "Garden City Beach from over the ocean in 2011: rows of houses between the beach and the marsh, with docks on the creeks behind."),
  "conway": ph.aerial("conway-riverwalk-boardwalk", "The Riverwalk in downtown Conway, on the Waccamaw River.", { closeUp: true }),
  "loris": ph.aerial("loris-downtown", "Main Street in downtown Loris.", { closeUp: true }),
  "aynor": ph.aerial("aynor-country-lot", "Houses on lots of about an acre along a country road outside Aynor, from the air. The orange line is one lot.", { closeUp: true }),
};
if (PHOTOS.some((r) => /surfside-beach-houses-row/.test(JSON.stringify(r.variants || r.file))))
  PHOTO["surfside"] = ph.aerial("surfside-beach-houses-row", "Beach houses behind the low dunes on the ocean side of Surfside Beach.", { closeUp: true });
/* A second photo, after an entry's third paragraph (Conway: the older houses the paragraph describes). */
const PHOTO_LATE = {
  "conway": ph.aerial("conway-older-house-and-oak", "An older house behind a big oak in Conway's residential historic district.", { closeUp: true }),
};
ph.share("aynor-country-lot");

const SELF = "/buyers/no-hoa-homes/";

/* ---------------------------------------------------------------------------- */
/* The numbers, from data/no-hoa-areas.json, checked against the ledger rows       */

/* Plantation Point stays in the data file for the record but is off the page (round 14f, decision 1). */
const CUT = new Set(["mb-plantation-point"]);
const A = Object.fromEntries(AREAS.areas.map((a) => [a.key, a]));
/* [key, homes with no fee, homes, median no-fee house price] as in rows 116 to 129 and 175. A data file
   that no longer gives them stops the build, so the page never shows a number the ledger does not hold. */
const WANT = [
  ["mb-downtown", 17, 20, 435000], ["mb-myrtle-heights", 4, 4, 1632500], ["mb-pine-lakes", 6, 6, 929950],
  ["windy-hill", 24, 40, 746450], ["crescent-beach", 34, 39, 754900],
  ["ocean-drive", 23, 41, 664450], ["cherry-grove", 52, 89, 847700], ["little-river", 8, 8, 419250], ["socastee", 11, 14, 249900],
  ["surfside", 36, 42, 939450], ["garden-city", 41, 55, 1442000], ["murrells-inlet", 12, 13, 822000],
  ["conway", 20, 23, 287000], ["loris", 15, 16, 319000], ["loris-country", 74, 82, 414100], ["aynor", 30, 45, 372000],
];
for (const [k, n, t, p] of WANT) {
  const a = A[k];
  if (!a || a.noFee !== n || a.total !== t || a.medianNoFeeHousePrice !== p) throw new Error(`${k}: the data file no longer gives the ledger's ${n} of ${t} at ${p}`);
}
const G = AREAS.guide;
if (JSON.stringify([G.builtBefore1990, G.built1990OrLater, G.notInNamedSubdivision]) !== JSON.stringify([[278, 360], [410, 2254], [446, 460]])) throw new Error("the guide counts are not the ledger's (row 130)");
/* Every comparison the copy makes, recomputed. */
const ON = AREAS.areas.filter((a) => !CUT.has(a.key));
const byPrice = ON.slice().sort((x, y) => x.medianNoFeeHousePrice - y.medianNoFeeHousePrice);
if (byPrice[0].key !== "socastee" || byPrice.at(-1).key !== "mb-myrtle-heights") throw new Error("the lowest and highest prices on the list have changed");
if (!(A["mb-pine-lakes"].lotAcresMedian > 2 * A["mb-downtown"].lotAcresMedian)) throw new Error("the Pine Lakes lots are no longer twice a downtown lot");
if (!(A["mb-pine-lakes"].medianNoFeeHousePrice > 2 * A["mb-downtown"].medianNoFeeHousePrice)) throw new Error("Pine Lakes is no longer listed at more than twice the downtown price");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const to5k = (v) => money(Math.round(v / 5000) * 5000);
const to10k = (v) => money(Math.round(v / 10000) * 10000);
const priceOf = (k) => to5k(A[k].medianNoFeeHousePrice);
const millions = (v) => "$" + (Math.round(v / 100000) / 10).toFixed(1) + " million";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const COUNTED = (([y, m, d]) => `${MONTHS[m - 1]} ${d}, ${y}`)(DATA.asOf.split("-").map(Number));

/* ---------------------------------------------------------------------------- */
/* The areas, in the map's order                                                    */

const ORDER = ON.map((a) => a.key);
const ENTRY = {
  "mb-downtown": { name: "Downtown Myrtle Beach", id: "downtown-myrtle-beach", place: "downtown Myrtle Beach", short: "Downtown" },
  "mb-myrtle-heights": { name: "Myrtle Heights", id: "myrtle-heights", place: "Myrtle Heights" },
  "mb-pine-lakes": { name: "Pine Lakes' older streets", id: "pine-lakes", place: "Pine Lakes", short: "Pine Lakes", guide: "Pine Lakes' older streets" },
  "windy-hill": { name: "Windy Hill", id: "windy-hill", place: "Windy Hill" },
  "crescent-beach": { name: "Crescent Beach", id: "crescent-beach", place: "Crescent Beach" },
  "ocean-drive": { name: "Ocean Drive", id: "ocean-drive", place: "Ocean Drive" },
  "cherry-grove": { name: "Cherry Grove", id: "cherry-grove", place: "Cherry Grove" },
  "little-river": { name: "Little River", id: "little-river", place: "Little River" },
  "socastee": { name: "Socastee", id: "socastee", place: "Socastee" },
  "surfside": { name: "Surfside Beach", id: "surfside-beach", place: "Surfside Beach" },
  "garden-city": { name: "Garden City Beach", id: "garden-city-beach", place: "Garden City Beach", short: "Garden City" },
  "murrells-inlet": { name: "Murrells Inlet's north end", id: "murrells-inlet", place: "Murrells Inlet", short: "Murrells Inlet" },
  "conway": { name: "Conway", id: "conway", place: "Conway" },
  "loris": { name: "Loris", id: "loris", place: "Loris" },
  "loris-country": { name: "The country around Loris", id: "country-around-loris", place: "the country around Loris", short: "Around Loris", offerName: "Loris", label: "Get the homes for sale in the country around Loris" },
  "aynor": { name: "Aynor", id: "aynor", place: "Aynor" },
};
if (ORDER.length !== 16 || ORDER.some((k) => !ENTRY[k])) throw new Error("the entries do not match the data file's areas");
const num = (k) => ORDER.indexOf(k) + 1;
const shortName = (k) => ENTRY[k].short || ENTRY[k].name;

/* ---------------------------------------------------------------------------- */
/* The one map (owner: "circle them"; OWNER-EYE-14e H2 and M4)                      */
/* One panel, short and wide: about 0.4 of a phone screen. Every area is drawn as its circle or outline
   (row 115, mapShapes). The 12 areas on the coast are numbered places (1 to 12, the entry numbers), and
   their outlines carry no badge of their own (area-map.js a.label false); a beach area's name goes over
   the ocean with a leader line when it has room there (places[i].sea), the others beside the marker.
   The four inland areas (13 to 16) are named in their own pills. A name with no room keeps its number,
   and the guide under the map lists every area by its number. */
const COAST = ORDER.slice(0, 12), INLAND = ORDER.slice(12);
if (COAST.some((k) => ["conway", "loris", "loris-country", "aynor"].includes(k)) || INLAND.length !== 4) throw new Error("the first 12 entries are the coast, the last 4 inland");
const SEA = new Set(["cherry-grove", "murrells-inlet"]);
const middle = (s) => (s.polygon ? { lat: s.polygon.reduce((t, q) => t + q[1], 0) / s.polygon.length, lon: s.polygon.reduce((t, q) => t + q[0], 0) / s.polygon.length } : { lat: s.lat, lon: s.lon });
const shape = (k, o) => { const s = A[k].mapShapes[0]; if (s.polygon) o.polygon = s.polygon; else Object.assign(o, { lat: s.lat, lon: s.lon, radius: s.radius }); return o; };
const MAP = (() => {
  const places = COAST.map((k) => Object.assign({ name: shortName(k) }, middle(A[k].mapShapes[0])));
  const areas = COAST.map((k) => shape(k, { name: shortName(k), label: false }))
    .concat(INLAND.map((k) => shape(k, Object.assign({ name: shortName(k), label: false, mark: String(num(k)) },
      /* The country around Loris holds the Loris circle; its badge goes in its west part, off the town's. */
      k === "loris-country" ? { markAt: { lat: 34.03, lon: -78.98 } } : k === "loris" ? { nested: true } : {}))));
  const m = regionMap({ name: "Homes with no HOA around Myrtle Beach", places, areas, tidyLeaders: true, placeNames: false, maxRatio: 0.75 },
    /* 440 units wide (round 14g): room for 15 of the 16 names; on a phone the names show at about 12 px. */
    { dir: MAP_DIR, src: "/images/maps", glass: true, width: 440 });
  const mk = m.boxes.filter((b) => (b.kind === "marker" || b.kind === "label") && !/CAROLINA/.test(b.owner || ""));
  for (let i = 0; i < mk.length; i++) for (let j = i + 1; j < mk.length; j++) { const a = mk[i], b = mk[j];
    if (!(a.x1 + 1 < b.x0 || b.x1 + 1 < a.x0 || a.y1 + 1 < b.y0 || b.y1 + 1 < a.y0)) throw new Error(`no-hoa map: two area names or numbers touch: ${a.owner} ${b.owner}`); }
  const css = "<style>.c3-nh-map img,.c3-nh-map svg{display:block;width:100%;height:auto}.c3-areamap figure{max-width:760px!important;margin:1rem 0 1.1rem!important}.c3-areamap figcaption{line-height:1.4!important;margin-top:.4rem!important}</style>";
  return css + `<div class="c3-areamap">` + PK.mapFigure(h, `<div class="c3-nh-map">${m.html}</div>`,
    "Map: numbers as in the list below.", m.credit, "no-hoa map") + `</div>`;
})();

/* The guide under the map: every area once, by what it does best (by feature only), with its number in a
   badge drawn from data-n (CSS), so the number matches the map without adding a figure to the prose. */
const GUIDE_CSS = "<style>.c3-nh-guide{margin:.1rem 0 0}.c3-nh-guide p{margin:0 0 .35rem!important;line-height:1.45}"
  + ".c3-nh-guide a{white-space:nowrap}"
  + ".c3-nh-n::before{content:attr(data-n);display:inline-flex;align-items:center;justify-content:center;min-width:1.45em;height:1.45em;margin:0 .3em 0 .05em;border-radius:999px;font-size:.78em;font-weight:700;line-height:1;color:var(--navy);background:rgba(255,255,255,.85);border:1.5px solid var(--brass-ink,#8a5a2b);vertical-align:.12em}</style>";
const go = (k) => h.a(`#${ENTRY[k].id}`, `<span class="c3-nh-n" data-n="${num(k)}" aria-hidden="true"></span>${ENTRY[k].guide || (shortName(k) === "Downtown" ? "Downtown Myrtle Beach" : shortName(k))}`);
const list = (ks) => ks.length === 1 ? go(ks[0]) : ks.slice(0, -1).map(go).join(", ") + " and " + go(ks.at(-1));
const GUIDE = [
  ["A boat at home, or a ramp within 10 minutes", ["cherry-grove", "little-river", "socastee", "surfside", "murrells-inlet"]],
  ["Most houses within half a mile of the sand", ["mb-downtown", "mb-myrtle-heights", "windy-hill", "crescent-beach", "ocean-drive", "garden-city"]],
  ["Room to spread out", ["mb-pine-lakes", "loris-country", "aynor"]],
  ["A small town with old streets", ["conway", "loris"]],
];
const GUIDE_ICON = { "A boat at home, or a ramp within 10 minutes": "dock", "Most houses within half a mile of the sand": "beach", "Room to spread out": "lawn", "A small town with old streets": "town" };
if (GUIDE.flatMap((g) => g[1]).sort().join() !== ORDER.slice().sort().join()) throw new Error("the guide names every area exactly once");

/* ---------------------------------------------------------------------------- */
/* One numbered area: the share chip, the sell, the day, the trade-off, then the price line and the offer */

/* The share of homes for sale with no HOA fee, in a chip under each heading (rows 116 to 130 and 175;
   thresholds as row 148). The country around Loris says "most": its map outline holds more fee houses
   than its MLS areas (row 129). */
const shareWords = (k) => { const a = A[k], p = a.noFee / a.total;
  if (k === "loris-country") return "most homes for sale";
  if (Math.round(p * 100) === 60) return "6 in 10 homes for sale";
  return p === 1 ? "every home for sale" : p >= 0.9 ? "almost all homes for sale" : p >= 0.85 ? "nearly 9 in 10 homes for sale"
    : p >= 0.6 ? "most homes for sale" : "more than half the homes for sale"; };
const CHIP_CSS = "<style>.c3-nh-chips{display:flex;flex-wrap:wrap;gap:.45rem;margin:-.2rem 0 1rem}.c3-nh-chip{display:inline-block;padding:.3rem .8rem;border-radius:999px;font-family:var(--sans);font-size:.95rem;font-weight:600;color:var(--navy);background:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.9);box-shadow:0 6px 18px -10px rgba(28,32,40,.35)}"
  /* The price line and the offer, together in one glass box at the end of each entry (as best neighborhoods). */
  + ".c3-place-cta{display:flex;flex-wrap:wrap;align-items:center;gap:.7rem 1.2rem;max-width:760px;margin:1.4rem 0 .4rem;padding:1rem 1.2rem;border-radius:20px;"
  + "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,none),var(--g-sh,none);"
  + "-webkit-backdrop-filter:var(--g-blur,none);backdrop-filter:var(--g-blur,none)}"
  + ".c3-place-cta>p:first-child{flex:1 1 18rem;margin:0;color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.55}"
  + "main#main .c3-place-cta .c3-offer{margin:0;flex:0 1 auto}"
  /* One subtitle at the top (OWNER-EYE-14e H2): the italic line under the H1 stays; the dek is not shown. */
  + "main#main .detail-hero .detail-sub{display:none}</style>";
const chip = (k) => `<div class="c3-nh-chips"><span class="c3-nh-chip">Listed with no HOA fee: ${shareWords(k)}${k === "mb-pine-lakes" ? " on the older streets" : ""}</span></div>`;
/* One line on price, last, in the owner's order ("one line about the average price"): the typical list
   price of the houses for sale with no fee (data/no-hoa-areas.json), as the sources line says. */
const priceLine = (k) => `Houses with no HOA fee here are listed at about ${A[k].medianNoFeeHousePrice >= 1e6 ? millions(A[k].medianNoFeeHousePrice) : (k === "murrells-inlet" ? to10k(A[k].medianNoFeeHousePrice) : priceOf(k))}${k === byPrice[0].key ? ", the lowest on this page" : ""}.`;
/* The offer at the end of each area (CRAFT 3, "Every place gets its own offer"): the glass theme's pill,
   linked to the contact form with the area named, in the box with the price line. */
const offer = (k) => `<p class="c3-place-price">${priceLine(k)}</p>`; /* round 15: the price line; the homes strip is the offer */
function entry(k, headline, paras) {
  const n = num(k);
  return { h2: `${n}. ${ENTRY[k].name}: ${headline}`, toc: `${n}. ${shortName(k)}`, id: ENTRY[k].id,
    html: () => chip(k) + h.p(paras[0]) + GL.homes(`nohoa-${ENTRY[k].id}`, ENTRY[k].name, PHOTO[k] || "") + paras.slice(1).map((t, i) => h.p(t) + (i === 1 && PHOTO_LATE[k] ? PHOTO_LATE[k] : "")).join("") + offer(k) };
}

/* Sources. */
/* Round 14d sources (rows 149 to 165, pending verification). */
const MB_NRMPS = "https://npgallery.nps.gov/NRHP/GetAsset/NRHP/64500568_text";
const MB_BOARDWALK2 = "https://www.myrtlebeachboardwalk.com/";
const MB_SUMMER = "https://www.cityofmyrtlebeach.com/news_detail_T6_R2620.php";
const MB_LIBRARY = "https://www.cityofmyrtlebeach.com/i_want_to/find/chapin_memorial_library.php";
const MB_BEACHLAW = "https://cityofmyrtlebeach.com/i_want_to/learn_about/beach_conditions.php";
const MB_BOARDS = "https://cityofmyrtlebeach.com/government/boards_and_committees/";
const PL_CLUB = "https://www.pinelakes.com/";
const MB_PARK_OF = "https://www.myrtlebeachprst.com/_T4_R41.php";
const PP_ANNANDALE = "https://schpr.sc.gov/index.php/Detail/objects/S108042003700007";
const MB_DECAL = "https://cityofmyrtlebeach.com/i_want_to/apply_for/resident_parking_decal.php";
const NMB_SURF = "https://www.nmb.us/219/Surfing-Rules-Regulations";
const NMB_41ST = "https://www.nmb.us/474/41st-Avenue-South-Pocket-Park";
const BF_DOCKS = "https://www.bflanding.com/plan-your-visit/day-docking/";
const NMB_18TH = "https://www.nmb.us/782/18th-Edge-Pocket-Park";
const NMB_CENTRAL = "https://www.nmb.us/475/Central-Park";
const NMB_PARKREG = "https://www.nmb.us/545/Parking-Registration-Information";
const FAT_HAROLDS = "https://www.fatharolds.com";
const HOSKINS = "https://www.hoskinsrestaurant.com";
const NMB_MUSEUM = "https://www.northmyrtlebeachmuseum.com/";
const NMB_MCLEAN = "https://www.nmb.us/493/McLean-Park";
const NMB_BURGESS = "https://www.nmb.us/495/Russell-Burgess-Coastal-Preserve";
const NMB_TURBINE = "https://www.nmb.us/489/Cherry-Grove-Oceanfront-Park";
const JUELS = "https://www.hurricanejuels.com/";
const SHRIMPFEST = "https://littlerivershrimpfest.org/";
const REGATTA = "https://www.christmasregatta.com/";
const DNR_REEFS = "https://www.dnr.sc.gov/marine/pub/seascience/reefloc.html";
const SOCASTEE_NR = "https://npgallery.nps.gov/GetAsset/474cf1ff-3f32-413f-be71-37eea026b32a";
const SSB_BEACHES = "https://www.surfsidebeach.org/200/Beaches";
const SSB_PARADE = "https://www.surfsidebeach.org/367/4th-of-July-Golf-Cart-Parade";
const SSB_MARKET = "https://www.surfsidebeach.org/325/Surfside-Beach-Farmers-Market";
const GC_PIER = "https://www.gardencitypier.com/";
const GC_SURVEY = "https://scdah.sc.gov/sites/scdah/files/Documents/Historic%20Preservation%20(SHPO)/Research/HC26001.pdf";
const BLUE_TRAIL = "https://www.conwaysc.gov/Waccamaw-River-Blue-Trail-Waterproof-Booklet-2020-Digital.pdf";
const CONWAY_RHD = "https://schpr.sc.gov/index.php/Detail/objects/S10817726031";
const HC_MUSEUM = "https://www.horrycountymuseum.org/";
const RIVERFEST = "https://www.conwayriverfest.com/";
const LORIS_HISTORY = "https://www.lorischamber.com/history-of-loris";
const LORIS_LIBRARY = "https://www.horrycountysc.gov/news/articles/rooted-in-community-loris-library-celebrates-50-years-on-main-street/";
const HC_CULTURAL = "https://www.horrycountysc.gov/media/4ujjy1oh/cultural-resources-element-2015.pdf";
const AYNOR_TOWN = "https://www.townofaynor.gov/community";
const AYNOR_APPEAL = "https://www.townofaynor.gov/appeal";
const GALIVANTS_NR = "https://npgallery.nps.gov/GetAsset/aa6c6bf6-8036-4d76-84bb-d1eb0e3431fd";
const MB_STATE_PARK = "https://southcarolinaparks.com/myrtle-beach";
const HC_PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const PELICANS = "https://www.milb.com/myrtle-beach/ballpark/pelicans-ballpark-a-z";
const USGS_LPD = "https://waterdata.usgs.gov/monitoring-location/02135000/";
const NPS_MH = "https://npgallery.nps.gov/AssetDetail/NRIS/96001217";
const MB_SWASH = "https://www.cityofmyrtlebeach.com/i_want_to/find/photos_of_the_week/pow040618.php";
const MB_DEPOT = "https://www.cityofmyrtlebeach.com/i_want_to/find/myrtle_beach_train_depot.php";
const PL_SHPO = "https://schpr.sc.gov/index.php/Detail/objects/S10817726017";
const NMB_ACCESS = "https://parks.nmb.us/339/Beach-Accesses-Amenities";
const NMB_YOW = "https://nmb.us/496/Yow-Park";
const SALT_LANDINGS = "https://www.saltwaterfishing.sc.gov/boatlandings.html";
const HC_BEACH = "https://horrycountysc.gov/departments/parksandrecreation/beach-accesses/";
const HB_PARK = "https://southcarolinaparks.com/huntington-beach";
const WACCAMAW_PRESERVE = "https://sctrails.net/trails/trail/waccamaw-river-heritage-preserve-canoe";
const PINE_LAKES = "https://pinelakes.com/about-pine-lakes-country-club/";
const NMB_RAMP = "https://nmb.us/490/Cherry-Grove-Park-and-Boat-Ramp";
const INGRAM = "https://nmb.us/783/Ingram-Dunes-Nature-Preserve";
const CANALS = "https://www.myhorrynews.com/news/local/north_myrtle_beach/residents-still-paying-for-cherry-grove-dredge/article_1eb5bb32-3b9a-11e9-93e7-9f8ad503b643.html";
const SHAG_LAW = "https://www.scstatehouse.gov/code/t01c001.php";
const LR_FISHING = "https://www.saltwaterfishing.sc.gov/pdf/littleriverpart1.pdf";
const BLUE_CRAB = "https://www.bluecrabfestival.org/";
const LANDINGS = "https://www.horrycountysc.gov/departments/parksandrecreation/boat-landings/";
const HC_PARKS = "https://www.horrycountysc.gov/departments/parksandrecreation/parks/";
const SWING = "https://projectportal.scdot.gov/sc-historic-bridges/s-616-bridge-over-intercoastal-waterway-horry-county";
const SCE = "https://www.scencyclopedia.org/sce/entries/";
const CONWAY_OAKS = "http://www.conwaysc.gov/news_detail_T6_R144.php";
const CITY_HALL = "https://schpr.sc.gov/index.php/Detail/objects/S10817726018";
const LORIS_CITY = "https://cityoflorissc.com/about-us";
const HOEDOWN_LAW = "https://www.scstatehouse.gov/code/t53c003.php";
const HORRY_927 = "https://library.municode.com/sc/horry_county/codes/code_of_ordinances?nodeId=COOR_APXBZO_ARTIXCOUS_S927HOOC";
const HORRY_CODE = "https://library.municode.com/sc/horry_county/codes/code_of_ordinances?nodeId=COOR_CH13OFMIPR_ARTIINGE_S13-12PRPA";
const CLOSING = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const SWA = "https://www.solidwasteauthority.org/residential.html";
const CONDO_LAW = "https://www.scstatehouse.gov/code/t27c031.php";
const MUNI = "https://library.municode.com/sc/";
/* The town and county codes behind "What you can do at home, by town" (rows 137 to 144). */
const MB_STR = MUNI + "myrtle_beach/codes/code_of_ordinances?nodeId=COOR_APXAZO_ART14ZODI_S1407TAUS";
const SSB_STR = MUNI + "surfside_beach/codes/code_of_ordinances?nodeId=VOII_CH17ZO_ARTIIIDIUSRE_DIV11USRE_S17-396.10TRRELOTERE";
const NMB_RENTAL = "https://www.nmb.us/DocumentCenter/View/6133/Rental-Property-Quick-Reference";

/* Round 14f sources (rows 175 to 178). */
const MI_LANDING = "https://www.horrycountysc.gov/departments/parksandrecreation/boat-landings/";
const MARSHWALK = "https://www.marshwalk.com/";
const BROOKGREEN = "https://www.scencyclopedia.org/sce/entries/brookgreen-gardens/";
const VEREEN = "https://www.horrycountysc.gov/departments/parksandrecreation/parks/";

/* What you can do at home, by town (owner's eye 14, decision 1; 14d, high 3; 14e, M3 and M5): one glass
   card per place with four plain answers, each by its icon and, on a phone, its word. The cards give the
   rule only; what we check is said once, under them. No zone codes: the codes are in ledger rows 137 to
   144. The boat and truck answers are rows 58 to 64. */
const { icon: ICON } = require(path.join(BB, "tools", "icons.js"));
const svg = (d) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${d}</svg>`;
const RULE_ICON = {
  boat: ICON("dock", { size: 22 }),
  truck: svg('<path d="M2 6h11v10H2zM13 9h4.5L21 12.5V16h-8"/><circle cx="6" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  rent: ICON("key", { size: 22 }),
  shed: svg('<path d="M3 11l9-6 9 6M5 10v10h14V10M10 20v-5h4v5"/>'),
};
const RULE_WORDS = { boat: "Boat", truck: "Work truck", rent: "Short-term rental", shed: "Shed or fence" };
const RULES = [
  { name: "Outside the towns", note: "Horry County", rules: {
    boat: "County zoning names no limit on where you park a boat, but outdoor storage may not be in front of the house.",
    truck: "A business run from home may keep two service vehicles per acre, and three per home on small farm-zoned lots.",
    rent: "Only in some zones. County zoning does not list short stays, so the zoning office decides where one fits, and short stays pay county taxes.",
    shed: "One small shed can sit 5 feet from the line. Fences can be 8 feet tall; over 7 feet needs a permit." } },
  { name: "Myrtle Beach", href: "/submarkets/myrtle-beach/", rules: {
    boat: "A boat over 16 feet, or a camper of any size, stays out of the front yard.",
    truck: "Yes, one, and no vehicle over one ton.",
    rent: "Only in some zones: the resort and business zones and one residential zone, not the single-family zones.",
    shed: "Yes, with a permit. Fences are 4 feet in front and up to 8 in back, but 4 feet all around on an oceanfront lot." } },
  { name: "North Myrtle Beach", href: "/submarkets/north-myrtle-beach/", rules: {
    boat: "Yes, behind the front of the house or under a carport.",
    truck: "Yes, up to 18,500 pounds.",
    rent: "Yes: zoning does not generally limit it. You need a business license, and it does not pass to you when the home sells.",
    shed: "One shed up to 150 square feet, behind the house, in most home zones. East of Ocean Boulevard, side-yard fences are not allowed, except low rail fences, pool fences and glass-topped fences." } },
  { name: "Surfside Beach", href: "/submarkets/surfside-beach/", rules: {
    boat: "Yes, up to two boats or trailers, but a licensed trailer over 21 feet counts as one per home. An unlicensed boat goes in a garage or under a cover.",
    truck: "Yes, one van or pickup up to 21 feet long and 7 feet 11 inches high.",
    rent: "Only in some zones: stays under 30 days are allowed in two zones. Rentals of a year or more are allowed wherever homes are.",
    shed: "Yes, in the back yard, with a permit. Fences are 4 feet in front and 6 in back." } },
  { name: "Conway", href: "/submarkets/conway/", rules: {
    boat: "Yes, in the side or back yard, or under a carport.",
    truck: "Yes, but a big work truck may not park on a city street.",
    rent: "Only in some zones: downtown and the business areas, not on home streets.",
    shed: "Yes, with a permit, in the back yard. Fences are 4 feet in front and up to 8 in back." } },
  { name: "Loris", rules: {
    boat: "A boat over 17 feet stays out of the front and side setbacks and 5 feet from the back line.",
    truck: "Yes, one, up to 2 tons.",
    rent: "Not a listed use in city zoning, and a use not listed is not permitted. We ask the city about the address.",
    shed: "Up to two buildings, a garage or carport included, in the side or back yard." } },
  { name: "Aynor", rules: {
    boat: "The town's zoning does not limit it.",
    truck: "No limit in the town's zoning.",
    rent: "Only with approval: the town's zoning does not list short stays, and the zoning appeals board may approve a use of the same general character as a listed one.",
    shed: "Yes, in the back yard, 5 feet from the line." } },
];
/* A real table (STANDARD A6), drawn as one glass card per place on a phone: four plain lines, each by its
   icon and its word (OWNER-EYE-14e M5: "a key and a house" were guesses). */
const RULES_CSS = "<style>.c3-nh-rules{width:100%;max-width:1100px;border-collapse:separate;border-spacing:0 .7rem;margin:1rem 0 1.2rem}"
  + ".c3-nh-rules caption{text-align:left;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;margin-bottom:.2rem}"
  + ".c3-nh-rules th,.c3-nh-rules td{vertical-align:top;text-align:left;font-size:1rem;line-height:1.45;padding:.75rem .8rem;background:rgba(255,255,255,.62);border-top:1px solid rgba(255,255,255,.95);border-bottom:1px solid rgba(255,255,255,.95)}"
  + ".c3-nh-rules thead th{background:none;border:0;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:.95rem;padding:.2rem .8rem}"
  + ".c3-nh-rules thead th .ic{margin-right:.45rem;vertical-align:middle}"
  + ".c3-nh-rules tbody th{font-family:var(--serif);font-size:1.15rem;color:var(--navy);border-left:1px solid rgba(255,255,255,.95);border-radius:18px 0 0 18px;white-space:nowrap}"
  + ".c3-nh-rules tbody td:last-child{border-right:1px solid rgba(255,255,255,.95);border-radius:0 18px 18px 0}"
  + ".c3-nh-rules tbody th small{display:block;font-family:var(--sans);font-size:.85rem;font-weight:500;color:var(--muted)}"
  + ".c3-nh-rules td .ic,.c3-nh-rules td .c3-nh-k{display:none}"
  + ".c3-nh-rules .ic{display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:11px;color:var(--brass);background:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.4)}"
  + ".c3-nh-sr{position:absolute!important;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}"
  + "@media (max-width:899px){.c3-nh-rules,.c3-nh-rules tbody,.c3-nh-rules tr,.c3-nh-rules th,.c3-nh-rules td{display:block;width:auto}.c3-nh-rules thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.c3-nh-rules caption{display:block;width:auto;margin-bottom:.7rem}"
  + ".c3-nh-rules tbody tr{margin:0 0 .9rem;border-radius:22px;padding:.9rem 1rem .5rem;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 1px 0 rgba(255,255,255,.8),0 18px 40px -28px rgba(28,32,40,.45)}"
  + ".c3-nh-rules tbody th,.c3-nh-rules tbody td{background:none;border:0!important;border-radius:0!important;padding:0;white-space:normal}.c3-nh-rules tbody th{margin:0 0 .55rem}"
  + ".c3-nh-rules tbody td{display:grid;grid-template-columns:32px 1fr;gap:.6rem;align-items:start;margin:0 0 .65rem}.c3-nh-rules td .ic{display:inline-flex}"
  + ".c3-nh-rules td .c3-nh-k{display:block;font-family:var(--sans);font-size:.85rem;font-weight:700;letter-spacing:.01em;color:var(--brass-ink,#8a5a2b);margin:0 0 .1rem}}</style>";
const KEYS = ["boat", "truck", "rent", "shed"];
const homeRules = () => RULES_CSS + `<table class="c3-nh-rules"><caption>What you can do at home, by town</caption><thead><tr><th scope="col"><span class="c3-nh-sr">Where the home is</span></th>`
  + KEYS.map((k) => `<th scope="col"><span class="ic" aria-hidden="true">${RULE_ICON[k]}</span>${RULE_WORDS[k]}</th>`).join("") + "</tr></thead><tbody>"
  + RULES.map((t) => `<tr><th scope="row">${t.href ? h.a(t.href, t.name) : t.name}${t.note ? `<small>${t.note}</small>` : ""}</th>`
    + KEYS.map((k) => `<td><span class="ic" aria-hidden="true">${RULE_ICON[k]}</span><span><span class="c3-nh-k" aria-hidden="true">${RULE_WORDS[k]}</span>${t.rules[k]}</span></td>`).join("") + "</tr>").join("")
  + "</tbody></table>";

/* The price bands, for the reader who starts from a budget (rows 82 to 85, verified), as plain lines
   (owner's eye 14, low 5). */
const BAND = Object.fromEntries(BANDS.map((b) => [b.band, b]));
const about10 = (b) => Math.round(BAND[b].houses / 10) * 10;
const bandList = () => h.ul([
  `About ${about10("under 250k")} houses for sale under $250,000, most of them built before 1990 and about half in and around Conway.`,
  `About ${about10("500k-750k")} from $500,000 to $750,000, a third of them within half a mile of the beach.`,
  `About ${about10("750k+")} at $750,000 and up, about 2 in 3 of them within half a mile of the beach.`,
]);

/* The example (rows 59, 64 and 68; the services Chapter3 records: stories.json "hoa-rental-bans-filtered"). */
const STORY = [
  "<strong>Example:</strong> Teresa wants a home with no HOA and room for her 20-foot boat. She likes a house on a small lot with a Myrtle Beach address.",
  "Her Chapter3 agent finds the house on the county map, inside the city of Myrtle Beach. The city's front-yard rule applies to her boat, and that lot has no other room for it.",
  "The agent shows her houses outside the city limits, under the county's rules. Teresa makes an offer on one with a wide side yard.",
];

/* ItemList JSON-LD for the 16 areas. */
const ITEMLIST = () => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList",
  name: "Areas around Myrtle Beach where all or most homes for sale have no HOA fee", numberOfItems: ORDER.length,
  itemListElement: ORDER.map((k, i) => ({ "@type": "ListItem", position: i + 1, name: ENTRY[k].name, url: `https://chapter3realty.com${SELF}#${ENTRY[k].id}` })) })}</script>`;

const LABEL = "Get the list";

/* ---------------------------------------------------------------------------- */

module.exports = GL.page({
  theme: "glass",
  /* No "On this page" list: the guide under the map does that job (coordinator, round 14). */
  toc: false,
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  /* The Aynor lot aerial's 1x1, 4x3 and 16x9 crops: Article.image and the share image. */
  pageImages: () => ph.pageImages(),
  title: "Homes With No HOA Near Myrtle Beach: 16 Areas, Boats, Prices",
  description: "The 16 areas around Myrtle Beach where all or most homes have no HOA fee, what each is like, the town rules for a boat or work truck, and what homes cost.",
  ogTitle: "Homes with no HOA around Myrtle Beach: 16 areas where most homes have no fee",
  crumb: "Homes With No HOA",
  eyebrow: "Buying a home",
  h1: "Where can you buy a home with no HOA near Myrtle Beach?",
  h1em: "16 areas where most homes have no fee.",
  /* Required by mkpage; hidden on the page (CHIP_CSS), so the top has one subtitle (OWNER-EYE-14e H2). */
  sub: "Room for a boat, a truck and a shed, from Little River to Aynor.",
  heroCta: false, /* round 15 (owner, 2026-10-21): the homes strips are the offer */
  author: "devin",
  shortAnswer: [
    "Almost every house for sale outside a named subdivision is listed with no homeowners association (HOA) fee, and so are about three in four built before 1990. Most are in the areas below, from beach streets and river towns to country land.",
  ],

  sections: [
    { h2: "Where are they?", toc: "The map and the guide", id: "where", html: () =>
      ph.css() + GL.homesCss() + CHIP_CSS + GUIDE_CSS +
      `<div class="c3-guide c3-guide-map">` + GL.guideCards(GUIDE.map(([label, ks]) => ({ icon: GUIDE_ICON[label], label, items: ks.map(go) }))) + `</div>` },

    entry("mb-downtown", "the boardwalk on foot", [
      `From the older streets downtown, you can walk to the oceanfront ${h.ext(MB_BOARDWALK2, "boardwalk")}. From Collins Street it is about a quarter hour on foot. From the day after Labor Day through April, you can ride a bike or walk a dog on it at any hour.`,
      "Most of these houses are within half a mile of the beach. All of them are outside the high-risk flood zones, where the federal rule makes a lender require flood insurance.",
      `Plyler Park on the oceanfront has free live music and a ${h.ext(MB_SUMMER, "fireworks show")} on Wednesdays in summer. The older houses are on Collins, Chester and Dunbar Streets, and Spivey Park and the New Town Bark Park are on Collins Street too.`,
      `A trail with a wooden boardwalk is beside Withers Swash, one of the city's ${h.ext(MB_SWASH, "oldest waterways")}, from Third Avenue South to Broadway and Collins Street.`,
      "Lots are modest, about 9,000 square feet in a typical case. Inside the city, a camper may not be kept in the front yard, so it has to fit beside or behind the house.",
    ]),

    entry("mb-myrtle-heights", "a beach path at the end of each avenue", [
      `In Myrtle Heights, the plan of the mid-1930s carried the avenues through to the beach, and those ends now give public access to the sand. From every house for sale here, a beach access is less than 5 minutes away on foot.`,
      `The same plan set a minimum setback of 75 feet for oceanfront houses. The district is on the ${h.ext(NPS_MH, "National Register of Historic Places")}, which calls the Myrtle Heights-Oak Park district the largest intact group of historic properties in Myrtle Beach.`,
      "The houses, built from about 1925 to 1945, are mostly two-story frame homes, many with a garage or a garage apartment. You will see porches and wood awnings painted solid or striped to look like canvas. A few houses keep old walls of coquina rock or brick.",
      "Back yards along Ocean Boulevard often have native wax myrtles, the plant the city is named for, along with red cedars, palmettos and windswept oaks.",
      "Sea Captain's House, a restaurant in a 1930 beach cottage, is about a 9-minute walk from the middle of Myrtle Heights.",
      `On an oceanfront house, a change to the outside, including its color, needs the city's ${h.ext(MB_BOARDS, "Community Appearance Board")}. Ordinary repair does not.`,
    ]),

    entry("mb-pine-lakes", "almost half an acre in the middle of the city", [
      "The older Pine Lakes streets have big lots in the middle of the city: typically almost half an acre, more than twice a downtown lot. There is room for a workshop or a boat beside the house.",
      `The streets are around the golf course, which is ${h.ext(PL_CLUB, "less than half a mile from the ocean")}, on rolling land. The beach is about 0.6 mile on foot, at the Seaside Place street end, one of the city's fully accessible beach paths.`,
      `${h.ext(MB_PARK_OF, "Ocean Forest Memorial Park")}, with a walking path, is at the Haskell Circle beach access, about half a mile on foot. North Ocean Boulevard has bike lanes.`,
      `A resident whose car is registered and taxed in the city gets a free parking decal. With it, you park free at city meters, at beach street ends and at ${h.ext(PELICANS, "Pelicans baseball games")}.`,
      "The city picks up trash, recycling and yard waste at the curb each week, for about $34 a month.",
      "The Preserve at Pine Lakes, the newer section, has an HOA fee and is not counted here.",
      "You pay for the room: houses here are listed at more than twice the downtown price, for more than twice the land.",
    ]),

    entry("windy-hill", "free day docks at Barefoot Landing", [
      `Windy Hill is 3 minutes by car from Barefoot Landing on the Intracoastal Waterway. Come by boat, and you can ${h.ext(BF_DOCKS, "use the finger docks")} free for the day while you shop or eat.`,
      "The Alabama Theatre and House of Blues are on the same grounds. Barefoot Landing welcomes leashed pets all year, and many of its shops let them inside.",
      "Most houses for sale here are within a 10-minute walk of a public beach access. Inside North Myrtle Beach, a work truck up to 18,500 pounds may park at home.",
      `On 41st Avenue South, a ${h.ext(NMB_41ST, "pocket park")} with garden plantings, two pergolas and a walking path is on the site of the old water tower. Conway investors developed Windy Hill after World War II, and in 1968 it joined Cherry Grove, Ocean Drive and Crescent Beach to form North Myrtle Beach.`,
      "Flood is the cost here. About half of these houses are in a high-risk flood zone, and with a mortgage your lender will almost always require flood insurance.",
    ]),

    entry("crescent-beach", "half a mile on foot to a beach access", [
      `Most houses for sale in Crescent Beach are less than half a mile on foot from a public beach access. From 6th to 27th Avenue South, the beach is one of the city's three ${h.ext(NMB_SURF, "surf zones")}. From mid-May to mid-September, boards are banned from 9 to 4 on the rest of the beach, but you can surf here.`,
      `${h.ext(INGRAM, "Ingram Dunes Nature Preserve")}, on Hillside Drive, is the city's last remaining maritime forest. It has native dunes 30 feet tall and an interpretive half-mile nature trail.`,
      "Most are older beach houses, on streets such as Hillside Drive, Holly Drive, Perrin Drive and Strand Avenue. Few of them need flood insurance for a mortgage. In Cherry Grove, almost every home does.",
      `In the middle of Crescent Beach, the ${h.ext(NMB_18TH, "18th and Edge pocket park")} has benches and a fountain. ${h.ext(NMB_CENTRAL, "Central Park")}, 20 acres with lighted tennis courts, pickleball courts and a paved walking path, is about 0.7 mile away.`,
      `City beach lots charge for parking from March through October. ${h.ext(NMB_PARKREG, "Residents register their plates")} each year for free passes.`,
      "Lots are small, about 7,600 square feet. Under the city's rule, a trailer or camper goes behind the front of the house or under a carport. That takes a carport, or room beside or behind the house."
    ]),

    entry("ocean-drive", "Main Street and the shag", [
      `On Main Street in Ocean Drive, you can learn the shag free on Tuesday nights. ${h.ext(FAT_HAROLDS, "Fat Harold's Beach Club")} calls itself the Home of the Shag and teaches the dance.`,
      `In the Ocean Drive and Crescent Beach area, a pavilion and amusement park drew crowds who danced the shag.`,
      `A Saturday here can start with breakfast at ${h.ext(HOSKINS, "Hoskins Restaurant")} on Main Street, which opened in 1948.`,
      `The ${h.ext(NMB_MUSEUM, "North Myrtle Beach Area Historical Museum")} is free, and its exhibits include beach music artists and shag dancing. ${h.ext(NMB_MCLEAN, "McLean Park")}, a quarter mile from Hoskins on foot, has a two-acre lake and a half-mile paved walking path.`,
      "Each summer, the city holds free Music on Main concerts on Thursdays at the Horseshoe. Each December, a nighttime Christmas parade comes up Main Street. Few of the houses for sale here with no fee need flood insurance for a mortgage.",
      "Crowds come with it: on concert nights Main Street closes to cars in the afternoon, and the St. Patrick's festival draws about 40,000 people.",
    ]),

    entry("cherry-grove", "a boat on the canals", [
      `Cherry Grove's canals were created as early as the 1950s. The city ${h.ext(CANALS, "has dredged canals there twice since 2016")}, to give owners boat access to House Creek and the Intracoastal Waterway at high and low tide.`,
      `The city's ${h.ext(NMB_RAMP, "boat ramp at 53rd Avenue North")} reaches both the marsh and the open ocean through Hog Inlet. It has a two-lane boat launch, a kayak launch, a fishing pier, a floating boat dock and a fish cleaning station.`,
      "North Myrtle Beach residents park free at the ramp when they register with the city. It is also the way in to Heritage Shores Nature Preserve, an island in the marsh reached on elevated boardwalks.",
      "Many of the canal houses have their own docks, so the boat stays behind the house. Across Hog Inlet, Waties Island has almost three miles of undeveloped beach.",
      "Each July 4, the city's free fireworks go up at the Cherry Grove Pier. The homes here with an HOA fee are all in named subdivisions.",
      "Two costs come with the canals: flood insurance and a dredging fee. Almost every home here is in a high-risk flood zone. Owners of about 415 properties in the canal district pay the city about $1,700 a year for the dredging, on the county tax bill.",
    ]),

    entry("little-river", "the old fishing village on the waterway", [
      `The houses on Little River's old waterfront streets are less than a mile from the docks on Mineola Avenue, on the Intracoastal Waterway. Local boatmen began ${h.ext(LR_FISHING, "taking visitors fishing for a fee")} there, probably in the early 1920s. They ran the first organized offshore fishing trips for visitors in South Carolina.`,
      `${h.ext(JUELS, "Hurricane Juel's")}, with a view of the waterway, has been family owned since 1945.`,
      `The waterfront holds the ${h.ext(BLUE_CRAB, "Blue Crab Festival")} each May, on the weekend after Mother's Day; a TV station reported more than 30,000 people there in 2026. ${h.ext(SHRIMPFEST, "ShrimpFest")} follows each October. On the Saturday after Thanksgiving, a ${h.ext(REGATTA, "lighted boat parade")} leaves Little River Inlet and heads down the waterway.`,
      `The county's ${h.ext(LANDINGS, "T. Craig Campbell boat landing")} is on the waterway in town. After the inlet's jetties were finished in 1983, boats could cross the bar at any time of day. The state keeps an ${h.ext(DNR_REEFS, "artificial fishing reef")} off the inlet.`,
      `${h.ext(VEREEN, "Vereen Memorial Historical Gardens")}, a county park on the waterway, has about 3 miles of trails and boardwalks through its gardens and along the water. Some of the houses for sale are new, on Mineola and Ellis Avenues; others are on McCorsley Avenue and Bayshore Drive.`,
      "The beach takes a drive: none of these houses is within a mile of the ocean.",
    ]),

    entry("socastee", "a county boat ramp 2 minutes away", [
      `${h.ext(LANDINGS, "Rosewood Landing")}, a county boat ramp on the Intracoastal Waterway, is 2 minutes by car from these streets. Socastee Landing and Park has a second ramp and a new accessible playground. The swing bridge at Socastee, finished in 1935, marked the completion of the Intracoastal Waterway in South Carolina. The waterway's opening celebration was held in Socastee in April 1936.`,
      "These streets are outside any town, so the county's rules apply. County zoning names no limit on where you park a boat. Outdoor storage may not be in front of the house, and a small shed can go 5 feet from the line.",
      "Most are 1980s houses in Rosewood Estates and Cimerron Plantation.",
      `${h.ext(HC_PARKS, "Socastee Recreation Park")} has fields, picnic areas, disc golf, trails and a playground. Market Common and Coastal Grand Mall are each about 10 minutes away, and the beach at Surfside is about 15 minutes by car.`,
      "Flood insurance is the extra cost to plan for: about a third of these houses need it if you buy with a mortgage.",
    ]),

    entry("surfside", "two boats at home and golf carts on the streets", [
      `In Surfside Beach, the town allows up to two boats or trailers at a home, and only one over 21 feet. A permitted golf cart may be driven in daylight within four miles of home, on streets posted at 35 miles an hour or less.`,
      `The town has ${h.ext(SCE + "surfside-beach/", "live oaks well over a century old")} and ${h.ext(SSB_BEACHES, "36 public beach accesses")}. In 2016 Surfside Beach became the first town certified autism-friendly through the Champion Autism Network.`,
      `The town holds a ${h.ext(SSB_MARKET, "farmers market")} on Tuesdays from spring into December in Memorial Park, and free Sunday afternoon concerts there from late May through August. Each July 4, a ${h.ext(SSB_PARADE, "golf cart parade")} goes down Ocean Boulevard.`,
      "Each October, the fall festival has more than 100 craft vendors. Fireworks may be set off on the sand from sunset on July 4 and on New Year's Eve, but not within 500 feet of the pier.",
      "The town picks up trash at the curb, and it has more than nine miles of sidewalk.",
      "One cost to know on the ocean side: about 1 in 4 homes there needs flood insurance if you buy with a mortgage.",
    ]),

    entry("garden-city", "a free pier walk and free beach parking", [
      `${h.ext(GC_PIER, "The Pier at Garden City")} is always free to walk, and every oceanfront beach access in Garden City has ${h.ext(HC_BEACH, "free parking all year")}. On summer nights, live bands play at both ends of the pier.`,
      "A pier pass covers fishing, so you need no state license. Its Hugo burger is named for the 1989 hurricane that destroyed the pier.",
      "Most of the houses for sale here are within half a mile of the shore. The county's Stanley Drive landing is a 5-minute drive.",
      "Each July 4, decorated boats start at the point of Garden City Beach and parade through Murrells Inlet.",
      "Budget for flood insurance: with a mortgage, a lender will almost always require it on most of these houses.",
    ]),

    entry("murrells-inlet", "by the creeks and the county boat ramp", [
      `At the north end of Murrells Inlet, some of the houses for sale are on the creeks of the inlet, and the rest are a few streets back. The county's ${h.ext(MI_LANDING, "boat landing on Stanley Drive")} is a 4-minute drive, and several houses on the market lately have their own floating dock.`,
      `People first came to the inlet for oyster roasts and fried shore dinners, and seafood restaurants followed. The ${h.ext(MARSHWALK, "MarshWalk")}, a half-mile wooden boardwalk along the salt marsh with a row of restaurants, is about 6 minutes away by car. The writer Mickey Spillane made Murrells Inlet his home for decades.`,
      `The free pier walk and free beach parking at Garden City Beach are a 6-minute drive across the marsh. ${h.ext(BROOKGREEN, "Brookgreen Gardens")}, with its sculpture gardens on four former rice plantations, is about 15 minutes away by car.`,
      "Murrells Inlet is not a town, so the county's rules apply on most of these streets. The south part is in Georgetown County. There, a vehicle or travel trailer without current plates has to be kept in a closed building.",
      "Flood is the honest cost: more than half of these houses are in a high-risk flood zone.",
    ]),

    entry("conway", "live oaks and the Waccamaw River", [
      `Conway's older streets ${h.ext(CONWAY_OAKS, "were designed around its live oaks")}, on a bluff of the Waccamaw River. The Riverwalk follows the river downtown, and the Waccamaw is a federal ${h.ext(BLUE_TRAIL, "National Water Trail")}.`,
      "In town, lots are about 15,000 square feet. Inside the city, a camper or a trailer can go in the side or back yard or under a carport. A shed goes in back, with a permit.",
      `The oldest streets form a ${h.ext(CONWAY_RHD, "National Register district")}. Its houses range from Greek Revival and Carpenter Gothic through Queen Anne to 1920s bungalows, one of them with a porch around three sides. City Hall is the old Horry County courthouse, finished in 1825 to a design credited to Robert Mills. Its courtroom still holds city court every week.`,
      `The ${h.ext(HC_MUSEUM, "Horry County Museum")} is in the restored 1905 Burroughs School, about a quarter hour on foot from downtown. ${h.ext(RIVERFEST, "Riverfest")} brings music and fireworks to the river on the Saturday before the Fourth of July weekend, and the Celebration of Lights opens each December.`,
      `${h.ext(LANDINGS, "Billy Witherspoon Landing")}, a county ramp on the Waccamaw, is a 6-minute drive. Conway Medical Center is a 12-minute drive.`,
      "The beach is a 25-minute drive.",
    ]),

    entry("loris", "a small town with its own hospital", [
      "Loris is a small town with its own hospital: McLeod Loris, with an emergency room, is in town. The older houses were built from the 1940s to the 1970s, on lots of about 0.4 acre. By 1914 Loris was known as the Gate City, because it was the first town on the railroad south of the North Carolina line.",
      "City zoning allows up to two buildings beside the house, a garage or carport included, so there is room for a workshop. A work truck up to 2 tons may park at home.",
      `The Main Street ${h.ext(LORIS_LIBRARY, "library")} lends cake pans, state park passes and Wi-Fi hotspots.`,
      `On the third Saturday in October, the city holds the ${h.ext(LORIS_CITY, "Loris Bog-Off")} downtown, with vendors, a car show and live music. The festival's dish is chicken bog: chicken, rice and sausage.`,
      "You drive more from here: the beach is about 35 minutes by car.",
    ]),

    entry("loris-country", "new houses on large lots", [
      "Around Loris, most houses for sale are new, built in 2024 or later, outside any town limits. Many of the new houses are on lots of about 0.7 acre, with room for a camper, a trailer and a shop under the county's rules.",
      `The ${h.ext(WACCAMAW_PRESERVE, "Waccamaw River Heritage Preserve")} protects 28 miles of the Waccamaw River, with riverside camping on its land.`,
      "For a work truck, the county lets a business run from home keep three service vehicles on a farm-zoned lot under an acre and a half. McLeod Loris hospital is about 9 minutes away by car.",
      "Outside the towns, a small shed can go 5 feet from the line, and fences can be 8 feet tall. The Solid Waste Authority provides no curbside trash pickup there, so you hire a hauler or use a county drop-off center.",
    ]),

    entry("aynor", "an acre and a river landing", [
      `Around Aynor, lots are typically about an acre, with room beside the house for a boat or a camper. More than half of the houses for sale here are new.`,
      `Galivants Ferry Landing, a county ramp on the ${h.ext(USGS_LPD, "Little Pee Dee River")}, is about 6 minutes from the center of town. The Little Pee Dee is ${h.ext(AYNOR_APPEAL, "popular with canoes, kayaks and small powerboats")}.`,
      `At ${h.ext(GALIVANTS_NR, "Galivants Ferry")}, the old farm houses have full-width front porches on brick piers. Some were built from wood cut on the farm itself, and the district has log tobacco barns. Galivants Ferry has also held a political speaking, the Stump, since 1880.`,
      `Each September, ${h.ext(AYNOR_TOWN, "almost 25,000 people")} come to the Aynor Harvest Hoe-Down, a festival the Pilot Club of Aynor started. In the town of Aynor, zoning does not limit a camper or a work truck at home. Most of these houses are outside the town, under county rules.`,
      "You will drive more: about 45 minutes to the beach, and about 30 to the nearest hospital, Conway Medical Center.",
    ]),

    { h2: "What can you do at home with no HOA?", toc: "What you can do at home", id: "boats-and-work-trucks", html: (bg) =>
      h.p(`With no HOA, the limits on parking, rentals and buildings on your lot are the town's, or the county's outside the towns, along with any deed restriction. Most of the homes with no HOA fee around Conway, Loris and Aynor are outside the town limits, under the county's rules.`) +
      homeRules() +
      h.p(`Before you make an offer, we check the town or county rules for that lot, the deed for restrictions and the county records for an HOA.`) +
      h.p(`In ${h.ext(MB_STR, "Myrtle Beach")}, ${h.ext(NMB_RENTAL, "North Myrtle Beach")} and ${h.ext(SSB_STR, "Surfside Beach")}, renting out a home needs a business license. In the towns, you can leave a boat in the driveway for a day to load and unload. On county roads, the county ${h.ext(HORRY_CODE, "bans parking")} only where it posts a sign.`) +
      story(STORY, "", bg) },

    { h2: "What does a house with no HOA fee cost?", toc: "Prices", id: "prices", html: (bg) =>
      h.p(`The largest group, about ${about10("250k-500k")} houses, is listed from $250,000 to $500,000, most of them around Conway, Loris and Aynor. The rest:`) +
      bandList() +
      h.p(`Our guide to the ${h.a("/buyers/affordable-places-to-live/", "most affordable places to buy near Myrtle Beach")} compares the towns.`) +
      h.cta("Get the homes with no HOA fee in your price range.", "Tell us your range and the areas you like. One of our agents sends the homes for sale in it.", LABEL, "/contact/", bg) },

    { h2: "What do you give up with no HOA?", toc: "What you give up", html: () =>
      h.p("No HOA means no shared pool, clubhouse or gate, and no HOA rules for your neighbors' houses either. A home with no HOA can still have deed restrictions on what you build or keep there.") +
      h.p(`If you want a pool, a clubhouse or a gate, you pay an HOA fee for them. Our guides to the ${h.a("/buyers/best-neighborhoods/", "best neighborhoods for what you want nearby")} and to ${h.a("/buyers/gated-communities/", "gated communities around Myrtle Beach")} show where to look. Our guide to ${h.a("/submarkets/carolina-forest/the-farm/", "The Farm at Carolina Forest")} shows one Carolina Forest neighborhood, and our guide to ${h.a("/hoa/", "what HOA fees cover")} explains each part of a fee.`) },
  ],
  faqTitle: "Homes with no HOA FAQ",
  faq: [
    { q: "Can I park a boat at my house in Myrtle Beach?", a: "Yes, on your own lot, within the rule of the town it is in; the table under What can you do at home gives each one." },
    { q: "Which areas near Myrtle Beach almost always have an HOA?", a: "Carolina Forest, the Grande Dunes, the Market Common and Burgess: almost every home for sale there has an HOA fee. Almost all homes for sale in Little River's named subdivisions have an HOA fee too. Longs and the country around Conway look rural, but most homes for sale there have an HOA fee too." },
    { q: "Are there homes with no HOA in Murrells Inlet?", a: "Yes, but only a little more than 1 in 4 homes for sale with a Murrells Inlet address is listed with no HOA fee. At the north end of the inlet, by the creeks and the Stanley Drive landing, almost every house for sale has none." },
    { q: "Are there homes with no HOA in North Myrtle Beach?", a: "Yes. More than half of the homes for sale with a North Myrtle Beach address are listed with no HOA fee. Almost all of them are in Cherry Grove, Crescent Beach, Windy Hill and Ocean Drive." },
    { q: "What is a typical HOA fee in Myrtle Beach?", a: `About $${DATA.allNineAreas.detachedHouses.medianMonthlyHoaFee} a month on a house. A condo fee is much higher because it includes the building's insurance, water and sewer, trash and a pool.` },
    { q: "Can you buy a condo with no HOA fee in Myrtle Beach?", a: `Almost never. Of about 2,700 condos for sale around Myrtle Beach, only one was listed with no HOA fee. South Carolina law makes condo owners share the cost of the building.` },
    { q: "Does a listing with no HOA fee mean the home has no HOA?", a: "Not always. A blank fee means no fee was listed. We check the deed and the county records for an HOA before you make an offer." },
    { q: "Is a campground home with no HOA fee a no-HOA home?", a: "No. A campground home has no HOA fee, but it sits on leased land, and you pay a yearly lease for the land under it." },
  ],
  sources: [
    { name: "town and county codes", href: `${MUNI}horry_county/codes/code_of_ordinances` },
    { name: "county boat landings", href: LANDINGS },
    { name: "county home business rule", href: HORRY_927 },
    { name: "S.C. condominium law", href: CONDO_LAW },
    { name: "trash service", href: SWA },
    { name: "S.C. Encyclopedia", href: SCE + "north-myrtle-beach/" },
  ],
  sourcesNote: `Homes for sale in the local MLS, on ${COUNTED}; list prices; homes on leased land left out. Areas are MLS areas or a distance from a town center or a boat landing; flood zones and lots from county and federal maps. Drive times without traffic. Not legal advice.`,
  afterSources: () => ph.credits() + ITEMLIST(),
  bottomCta: { h2: "Get the homes with no HOA fee in the areas you like.", p: "Tell us the areas and your price range. One of our agents will send you the homes for sale with no HOA fee.", label: LABEL, href: "/contact/" },
  keywords: "Myrtle Beach homes no HOA, no HOA neighborhoods Myrtle Beach, houses for sale no HOA Myrtle Beach, no HOA homes North Myrtle Beach, no HOA homes Conway SC, no HOA homes Loris SC, Myrtle Beach homes with land, park boat at house Myrtle Beach, no HOA homes Surfside Beach, no HOA homes Murrells Inlet",
  about: "Homes for sale with no homeowners association fee around Myrtle Beach, South Carolina",
});
