/* /submarkets/ - the town guides hub: how the nine Grand Strand places with a Chapter3 guide differ.
 * Which are real towns, how many people live in each, what water each sits on, how long the coast is,
 * which ones go quiet in winter, then a short portrait of each place with its live homes strip.
 *
 * Batch 2026-11-b, Lane U. Version 2, 2026-11-12 (the owner: "Could we just talk about the differences of
 * the cities ... its a pretty thin page as is ... legit value ... but not cannabalizing anything").
 * Plan: Blog-Brain batches/2026-11-b/submarkets/PLAN.md (round 2). Facts: facts.md in that folder, VERIFIED
 * rows and CORRECTED rows at the verifier's wording only (VERIFY.md, round 2 and round 1). Struck wording:
 * batches/2026-11-b/facts/submarkets-struck.json. Demand: must-answer.md (round 2).
 * Data: data/2026-11-b/submarkets/
 *   glance.json   build_glance.py: 2020 Census people, homes and vacation homes, Gazetteer kind (D3, D4, D6, D13)
 *   towns.json    build_towns.py: each guide's own price, wow line and nightly-rental words (H1 to H29)
 *   map-points.json, homes-places.json (round 1, unchanged)
 * What the hub does not take from its siblings: which-town owns the price comparison, the city-line table,
 * drives, flood shares and the 13 portraits for living; each guide owns its own town's questions; waterfront
 * owns tides, docks and the sunrise; str-rules owns the rental rules. The hub prints one fact per town from
 * those rows only where the portrait needs it, and links the owner.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "submarkets");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const TOWNS = read("towns.json").towns, GL = read("glance.json");
const must = (ok, msg) => { if (!ok) throw new Error(`submarkets.js: ${msg}`); };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const n = (v) => Math.round(v).toLocaleString("en-US");

/* A price as a person says it: "$357,000", "$1 million", "$2.45 million". */
const price = (v) => v >= 1e6 ? `$${String(Math.round(v / 1e4) / 100).replace(/\.0+$/, "")} million` : "$" + Math.round(v).toLocaleString("en-US");

/* ---------------------------------------------------------------------------- */
/* The nine places, north to south along the coast, then the two inland.        */

const T = Object.fromEntries(TOWNS.map((t) => [t.slug, t]));
const C = Object.fromEntries(GL.towns.map((t) => [t.slug, t]));
const ORDER = ["little-river", "north-myrtle-beach", "myrtle-beach", "surfside-beach", "garden-city", "murrells-inlet", "pawleys-island", "carolina-forest", "conway"];
must(TOWNS.map((t) => t.slug).join() === ORDER.join() && GL.towns.map((t) => t.slug).join() === ORDER.join(), "towns.json or glance.json order changed");
const INLAND = new Set(["carolina-forest", "conway"]);

/* Prices, rows H1 to H11: the guide's own figure, in the guide's own group (towns.json; build_towns.py checks the guides). */
const PRICES = {
  "little-river": [357000, 511, "a resold house"],                                        // H1
  "north-myrtle-beach": [565000, 560, "a resold house"],                                  // H2
  "myrtle-beach": [540000, 459, "a resold house in the city"],                            // H3
  "surfside-beach": [1000000, 39, "a house near the ocean"],                              // H4
  "garden-city": [320000, 89, "a condo on the ocean side by the pier, on the Horry part"], // H6 CORRECTED
  "murrells-inlet": [450000, 396, "a house on the Horry side"],                           // H7
  "pawleys-island": [580000, 220, "a house west of US 17"],                               // H8
  "carolina-forest": [440000, 405, "a resold house"],                                     // H10
  "conway": [265000, 334, "a resold house or townhouse in the city"],                     // H11 CORRECTED
};
for (const [slug, [shown, k, group]] of Object.entries(PRICES)) {
  const t = T[slug];
  must(t.shown === shown && t.sales === k && t.group === group, `${slug} price row changed: ${t.shown}, ${t.sales}, ${t.group}`);
  must(Math.abs(t.median - shown) <= 5000, `${slug} median ${t.median} no longer rounds to ${shown}`);
}
const P = (s) => price(T[s].shown);
const SB2 = T["surfside-beach"].also, PI2 = T["pawleys-island"].also;
must(SB2 && SB2.low === 485000 && SB2.high === 540000, "H5 Surfside inland range changed");
must(PI2 && PI2.median === 2450000 && PI2.data_median === 2450000, "H9 Pawleys island price changed");

/* Wow lines (H13 to H22) and rental words (H24 to H29), at the verifier's wording. A struck phrase stops the build. */
const STRUCK = [/half[- ]mile/i, /beach music/i, /old river steamboat/i, /\bjust south\b/i, /the HOA decides/i, /(?<!names )\bno rental permit\b/i,
  /master-planned|26,000|30,000-acre|wind-pool/i, /never adopted|lowest entry/i];
for (const t of TOWNS) for (const k of ["wow", "rule", "group"]) {
  must(typeof t[k] === "string" && t[k].trim(), `${t.slug} has no ${k}`);
  for (const re of STRUCK) must(!re.test(t[k]), `${t.slug} ${k} carries struck wording ${re}: ${t[k]}`);
}
must(/home of the shag, DJs play every night from 7\./.test(T["north-myrtle-beach"].wow) && /built like a steamboat, the F\.G\. Burroughs, beside a riverwalk of about 1\.5 miles/.test(T.conway.wow), "H13 or H21 changed");
must(/Bike and Run Park/.test(T["carolina-forest"].wow) && /7 miles/.test(T["carolina-forest"].wow) && /70 acres/.test(T["carolina-forest"].wow), "H22 changed");
must(/814 feet/.test(T["surfside-beach"].wow) && /about 1\.3 miles long/.test(T["myrtle-beach"].wow), "a wow figure changed");
must(T.conway.rule === "We check the city's zoning for each address.", "H30 is struck: Conway gets no rule");
must(/HOA or the deed can still bar/.test(T["north-myrtle-beach"].rule), "H25 needs the HOA or deed sentence");
must(T["surfside-beach"].rule === "Only in the two zones by the ocean." && /Allowed on the island/.test(T["pawleys-island"].rule), "H26 or H29 changed");
for (const s of ["little-river", "garden-city", "murrells-inlet", "carolina-forest"]) must(/the county asks for a business license and tax filings\./i.test(T[s].rule), `${s} rule cell changed`);
for (const s of ["garden-city", "murrells-inlet"]) must(/Georgetown (end|side): the county requires no business license\./.test(T[s].rule), `${s} H28 changed`);

/* The period of the deeds, from the data file (never typed). */
const per = T["little-river"].window.match(/(\d{4})-(\d{2})-\d{2} to (\d{4})-(\d{2})-\d{2}/);
must(per && TOWNS.filter((t) => t.slug !== "pawleys-island").every((t) => t.window === T["little-river"].window), "deed windows differ");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const PERIOD = `${MONTHS[+per[2] - 1]} ${per[1]} to ${MONTHS[+per[4] - 1]} ${per[3]}`;

/* Census rows. D4: people. D6: kind (Gazetteer LSAD). D3: vacation homes. D13: homes per 100 residents. */
const PEOPLE = { "little-river": 11711, "north-myrtle-beach": 18790, "myrtle-beach": 35682, "surfside-beach": 4155, "garden-city": 10235,
  "murrells-inlet": 9740, "pawleys-island": 130, "carolina-forest": 23342, "conway": 24849 };
const SHARE = { "little-river": 19.1, "north-myrtle-beach": 48.4, "myrtle-beach": 16.2, "surfside-beach": 41.6, "garden-city": 39.5,
  "murrells-inlet": 13.6, "pawleys-island": 68.7, "carolina-forest": 4.6, "conway": 1.7 };
for (const s of ORDER) {
  must(C[s].people_2020 === PEOPLE[s], `D4 people for ${s} moved: ${C[s].people_2020}`);
  must(C[s].seasonal_pct === SHARE[s], `D3 share for ${s} moved: ${C[s].seasonal_pct}`);
}
const CITY = new Set(["north-myrtle-beach", "myrtle-beach", "conway"]), TOWN = new Set(["surfside-beach", "pawleys-island"]);
for (const s of ORDER) must(CITY.has(s) ? C[s].kind === "city" : TOWN.has(s) ? C[s].kind === "town" : /^Census designated place/.test(C[s].kind), `D6 kind for ${s}`);
must(C["north-myrtle-beach"].homes_per_100_people === 138 && C["pawleys-island"].homes_per_100_people === 412, "D13 changed");
must(["north-myrtle-beach", "surfside-beach", "pawleys-island"].every((s) => C[s].homes_2020 > C[s].people_2020)
  && ORDER.filter((s) => C[s].homes_2020 > C[s].people_2020).length === 3, "D4: the three places with more homes than residents changed");
must(C["carolina-forest"].people_2020 > C["north-myrtle-beach"].people_2020, "D4: Carolina Forest no longer has more residents than North Myrtle Beach");
must(Math.max(...ORDER.map((s) => C[s].people_2020)) === C["myrtle-beach"].people_2020 && Math.min(...ORDER.map((s) => C[s].people_2020)) === 130, "D4: the largest or smallest changed");
const BYPEOPLE = ORDER.slice().sort((a, b) => C[b].people_2020 - C[a].people_2020);
must(BYPEOPLE.slice(0, 3).join() === "myrtle-beach,conway,carolina-forest", "D4: the order of the three largest changed");
must(Math.min(...ORDER.map((s) => C[s].seasonal_pct)) === C.conway.seasonal_pct, "D3: Conway no longer has the fewest");
/* "In 10" as a person says it. Under 5 percent is "fewer than 1 in 10". */
const in10 = (s) => C[s].seasonal_in_10 === 0 ? "fewer than 1 in 10" : `about ${C[s].seasonal_in_10} in 10`;
must(in10("pawleys-island") === "about 7 in 10" && in10("north-myrtle-beach") === "about 5 in 10" && in10("conway") === "fewer than 1 in 10" && in10("murrells-inlet") === "about 1 in 10", "D3 rounding");

/* D1 and D9: our measures, in the verifier's words. The data files still give the figures. */
must(Math.round(GL.coast.nc_line_to_pawleys_south_end_miles) === 49 && GL.coast.nc_line_to_pawleys_south_end_miles < 49, "D1: 48.6 miles moved");
must(Math.round(GL.coast.nc_line_to_near_winyah_bay_miles) === 63, "D1: 63 miles moved");
must(Math.round(C["myrtle-beach"].ocean_beach_miles) === 10 && Math.round(C["pawleys-island"].ocean_beach_miles * 2) / 2 === 3.5 && Math.round(C["surfside-beach"].ocean_beach_miles) === 2, "D9 moved");
/* D9 CORRECTED: North Myrtle Beach "a little over 8" (8.2 to 8.3 on the full lines); outside every place "more than a third" (16.9 to 18.0 of 48.6). */
must(16.9 / 48.6 > 1 / 3, "D9: a third");

/* ---------------------------------------------------------------------------- */
/* The table: what kind of place, how many residents, what water.               */

/* Kind: D6 (city, town, or a Census place the county runs); two counties: R9, R10. Pawleys: R11.
   Water: R1 to R5, R9 to R11, H22, D12 (no ocean beach in the Little River and Murrells Inlet Census places). */
const KIND = {
  "little-river": "Run by the county", "north-myrtle-beach": "A city", "myrtle-beach": "A city", "surfside-beach": "A town",
  "garden-city": "Run by two counties", "murrells-inlet": "Run by two counties", "pawleys-island": "A town: the island only",
  "carolina-forest": "Run by the county", "conway": "A city",
};
const WATER = {
  "little-river": "The Intracoastal Waterway and Little River Inlet",
  "north-myrtle-beach": "The ocean beach, and the Cherry Grove channels behind it",
  "myrtle-beach": "The ocean beach",
  "surfside-beach": "The ocean beach",
  "garden-city": "The ocean beach, and the salt marsh behind it",
  "murrells-inlet": "The salt marsh and its creeks, open to the sea at the inlet",
  "pawleys-island": "The ocean beach, and a marsh creek behind it",
  "carolina-forest": "The Intracoastal Waterway, at its edge",
  "conway": "The Waccamaw River",
};
const arrow = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const nameWords = (nm) => { const w = esc(nm).split(" "), last = w.pop(); return (w.length ? w.join(" ") + " " : "") + `<span class="nw">${last}<span class="ar">${arrow}</span></span>`; };
const row = (t) => `<tr>`
  + `<th scope="row"><a class="c3-tg-name" href="#${t.slug}">${nameWords(t.name)}</a></th>`
  + `<td class="c3-tg-kind"><span class="l">Kind of place</span>${esc(KIND[t.slug])}</td>`
  + `<td class="c3-tg-ppl">${n(C[t.slug].people_2020)}<span class="u"> people</span></td>`
  + `<td class="c3-tg-water"><span class="l">The water</span>${esc(WATER[t.slug])}</td>`
  + `</tr>`;
const group = (label) => `<tr class="c3-tg-grp"><th scope="rowgroup" colspan="4">${label}</th></tr>`;
const TABLE = `<div class="c3-tg"><table>`
  + `<caption>The nine places with a Chapter3 guide: what kind of place each is, how many people lived there in 2020, and its water</caption>`
  + `<thead><tr><th scope="col">Place</th><th scope="col">Kind of place</th><th scope="col">People, 2020</th><th scope="col">The water</th></tr></thead>`
  + `<tbody>${group("On the coast, north to south")}${TOWNS.filter((t) => !INLAND.has(t.slug)).map(row).join("")}`
  + `${group("Inland")}${TOWNS.filter((t) => INLAND.has(t.slug)).map(row).join("")}</tbody></table></div>`;

/* ---------------------------------------------------------------------------- */
/* The map (round 1, unchanged): the nine places at their Census label points.  */

const PTS = read("map-points.json").points;
must(PTS.length === 9 && TOWNS.every((t) => PTS.some((p) => p.name === t.name)), "map-points.json does not match the nine towns");
const MAP = (() => {
  const places = TOWNS.map((t) => { const p = PTS.find((x) => x.name === t.name); return { name: t.name, lat: p.lat, lon: p.lon, href: t.guide }; });
  const m = regionMap({ name: "The nine places on the Grand Strand with a Chapter3 guide", places, maxRatio: 1.1 },
    { dir: path.join(__dirname, "..", "chapter3realty", "images", "2026-11-b", "submarkets"), src: "/images/2026-11-b/submarkets", glass: true });
  return h.figure(m.html, `The nine places, from Little River at the North Carolina line to Pawleys Island. Each name opens its guide. ${m.credit}`).replace("<figure ", '<figure class="c3-tg-map" ') + (m.unlabelled && m.unlabelled.length ? m.key : "");
})();

/* ---------------------------------------------------------------------------- */
/* The chart: out of every 10 homes, how many are kept for vacations (D3).      */

const CHART = G.bars(ORDER.slice().sort((a, b) => C[b].seasonal_pct - C[a].seasonal_pct).map((s) => ({
  name: T[s].name + (INLAND.has(s) ? " (inland)" : ""), value: C[s].seasonal_pct, valueText: in10(s), reference: INLAND.has(s),
})), { caption: "Out of every 10 homes, how many are kept for vacations?", nameLabel: "Place", valueLabel: "Homes kept for vacations", max: 100, compact: true,
  note: "Homes no one lived in at the 2020 Census, held for vacations or part-time use. The group also takes in timeshares and vacation rentals. Inland places are in gray. Source: U.S. Census Bureau." });

/* ---------------------------------------------------------------------------- */
/* Photos: four of the places, each already licensed on its own guide.          */

const recs = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", ...f.split("/")), "utf8")).photos;
const find = (list, name) => { const r = list.find((x) => path.basename(x.file, ".webp").replace(/-1200w$/, "") === name); must(r, `no photo record ${name}`); return r; };
const NMB_PH = find(recs("2026-11-a/submarkets-north-myrtle-beach/photos.json"), "ocean-drive-beach-pavilion-postcard-1941");
const SB_PH = find(recs("2026-10-b/photos.json"), "surfside-beach-pier");
const MI_PH = find(recs("2026-11-a/submarkets-murrells-inlet/photos.json"), "murrells-inlet-marshwalk-from-above");
const PI_PH = find(recs("2026-11-a/submarkets-pawleys-island/photos.json"), "pawleys-island-marsh-walkway");
const SHOWN = [NMB_PH, SB_PH, MI_PH, PI_PH];
const photo = (r, caption) => PH.heroPhoto(r, { alt: r.alt, caption, maxWidth: "640px", sizes: "(max-width: 700px) 100vw, 420px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
const CREDITS = PH.creditsList(SHOWN.map((r) => ({ photo: r, caption: r.caption.replace(/\.$/, "") })));

/* ---------------------------------------------------------------------------- */
/* The portraits: one per place, its homes strip, and its guide.                */

/* Each strip is the town-<slug> "near" search which-town already uses (homes-places.json, round 1). The title names
   the place and its best thing, never a feature of each home (owner, 2026-11-10: bold and personal, and true).
   With the search off, or under 3 homes, the strip stays empty and the fallback shows: the map search, then the request. */
const IDX = read("homes-places.json").places;
const PLACE = Object.fromEntries(ORDER.map((s) => {
  const p = IDX.find((x) => x.town === s);
  must(p && p.slug === (s === "pawleys-island" ? "town-pawleys-litchfield" : `town-${s}`) && /^-?\d+\.\d+,-?\d+\.\d+$/.test(p.near) && +p.miles > 0, `no IDX place for ${s}`);
  return [s, p];
}));
const HEADS = {
  "little-river": "Little River, where the boats are: homes for sale now",                   // H12: two of every three deeded slips
  "north-myrtle-beach": "Dance the shag on Main Street: homes in North Myrtle Beach",          // H13 CORRECTED, first sentence
  "myrtle-beach": "The Boardwalk and the airport in town: Myrtle Beach homes",                // H14, H15
  "surfside-beach": "A free pier 814 feet out: homes for sale in Surfside Beach",              // H16
  "garden-city": "Beach in front, marsh behind: Garden City homes for sale",                  // R5, GC guide
  "murrells-inlet": "Dinner on the MarshWalk: Murrells Inlet homes for sale",                 // H18 CORRECTED
  "pawleys-island": "Live near Pawleys Island: homes in Pawleys Island and Litchfield",       // the search takes in Litchfield
  "carolina-forest": "Trails on the waterway: Carolina Forest homes for sale",                // H22
  "conway": "The river city: homes for sale in Conway",                                       // R12
};
const strip = (s) => {
  const p = PLACE[s], t = T[s], near = s === "pawleys-island";
  const map = `/homes/map/?near=${encodeURIComponent(p.near)}&miles=${p.miles}`;
  const fallback = `<p class="c3-tg-ask c3-tg-cta"><a class="c3-tg-map-a" href="${esc(map)}">Homes for sale ${near ? "near" : "around"} ${esc(t.name)} on the map<span class="ar">${arrow}</span></a>`
    + ` <span class="or">or</span> <a class="c3-tg-req" href="/contact/?place=${encodeURIComponent(t.name)}">ask us to send them</a></p>`;
  return `<div class="c3-tg-homes">${G.homes(p.slug, p.name, fallback, HEADS[s])}</div>`;
};
const guide = (s) => `<p class="c3-tg-guide"><a href="${T[s].guide}">Read our ${esc(T[s].name)} guide<span class="ar">${arrow}</span></a></p>`;
/* A portrait: its heading, its paragraphs, a photo beside them on a wide screen, then its homes and its guide. */
const portrait = (s, title, paras, ph) => {
  const head = `<h3 id="${s}" class="c3-tg-h3" data-toc="${esc(T[s].name)}">${esc(T[s].name)}: ${esc(title)}</h3>`;
  const body = paras.map(h.p).join("");
  return `<div class="c3-tg-town${ph ? " has-ph" : ""}">${head}<div class="c3-tg-text">${body}</div>${ph || ""}</div>` + strip(s) + guide(s);
};

const PORTRAITS = [
  portrait("little-river", "on the waterway, by the inlet", [
    // R1 (waterfront 24), R4 (waterfront 20), R2 (waterfront 21: the one tide figure on the page)
    `From a dock on the Intracoastal Waterway at Little River, a boat can head north to Norfolk or south to Florida without going out on the ocean.`,
    `For the ocean, boats go out through Little River Inlet, at the North Carolina line, down a marked channel about 2 miles long. The tide here rises and falls about 4 feet.`,
    `Resold houses in Little River usually sell for about ${P("little-river")}.`,
  ]),
  portrait("north-myrtle-beach", "the shag on Main Street", [
    // H13 CORRECTED (VERIFY: "The shag, the state dance, is still danced on Main Street. At Fat Harold's Beach Club, the home of the shag, DJs play every night from 7"); R7 (NMB 1)
    `The shag, South Carolina's state dance, is still danced on Main Street. At Fat Harold's Beach Club, the home of the shag, DJs play every night from 7.`,
    `The city is four old beach towns in one. In 1968, Cherry Grove, Ocean Drive, Crescent Beach and Windy Hill voted to join.`,
    `A resold house usually sells for about ${P("north-myrtle-beach")}. A nightly-rental owner needs a yearly city business license, with no special zoning or permit beyond it.`,
  ], photo(NMB_PH, "The pavilion at Ocean Drive Beach on a 1941 postcard, with \"Dancing\" painted on its end wall.")),
  portrait("myrtle-beach", "the Boardwalk, and the airport in town", [
    // H14, H15; D7 VERIFIED (cityofmyrtlebeach.com)
    `Downtown, the Boardwalk is about 1.3 miles long, beside the ocean. The airport is inside the city, with nonstop flights to more than 50 destinations.`,
    `Myrtle Beach became a town in 1938. It became a city in 1957, when its permanent population first topped 5,000.`,
    `A resold house in the city usually sells for about ${P("myrtle-beach")}. Nightly rentals are allowed only in some of the city's zones, and most neighborhoods of houses are not zoned for them.`,
  ]),
  portrait("surfside-beach", "a free pier, and a town of under 2 square miles", [
    // H16; R8 (SB 25 CORRECTED), D7 (/339); D8 in the heading
    `The town's concrete pier reaches 814 feet into the ocean, and walking on it is free.`,
    `The beach was Roach's Beach, then Floral Beach, before it took the name Surfside Beach in 1952. Much of the land was once the Ark Plantation, and the town was incorporated in 1964.`,
    `Nightly rentals are allowed only in the two zones by the ocean, where a house sold for about ${P("surfside-beach")} at the middle. On the inland streets, houses sold for about ${price(SB2.low)} to ${price(SB2.high)}.`,
  ], photo(SB_PH, "The Surfside Beach pier from the air, with streets of beach houses behind the sand.")),
  portrait("garden-city", "line dances on the pier", [
    // H17; R5 (GC 13); R9 (GC 2 CORRECTED); H6 CORRECTED
    `At the far end of the Garden City Pier, people learn line dances out over the ocean.`,
    `Behind the beach, about 260 houses between Waccamaw Drive and Business 17 sit on the salt marsh or a tidal creek.`,
    `About a third of a mile south of the pier, the line between Horry and Georgetown counties crosses the beach. The pier is on the Horry side.`,
    `On the Horry part, the middle sale for a condo on the ocean side by the pier was about ${P("garden-city")}.`,
  ]),
  portrait("murrells-inlet", "restaurants and music on the salt marsh", [
    // H18 CORRECTED; R4; R5 CORRECTED (MI 9, "about 100 feet" for 30 m; one sentence, the struck list refuses a split); R10 (MI 49)
    `The MarshWalk is a wooden boardwalk along the salt marsh, lined with restaurants, and its live music is free to hear.`,
    `The inlet opens straight to the ocean between jetties. Outside Garden City, about 220 houses sit within about 100 feet of the inlet's salt marsh, almost all on the creek side of US 17 Business.`,
    `The nearest ocean beaches are Huntington Beach State Park and Garden City Beach, each about 9 minutes from the MarshWalk by car.`,
    `On the Horry side, the middle sale for a house was about ${P("murrells-inlet")}.`,
  ], photo(MI_PH, "The MarshWalk from above: restaurants along the boardwalk at the edge of the inlet, and salt marsh islands in the creek.")),
  portrait("pawleys-island", "old cypress houses by the sea", [
    // H19 CORRECTED; D13 CORRECTED (the one homes-per-resident figure on the page); H8, H9, H29
    `The old island houses were built mostly of cypress, hewn on the mainland. Each timber was chiseled with Roman numerals so the house could be put together on the island.`,
    `The island had about 4 homes for every resident in 2020.`,
    `On the mainland, west of US 17, a house usually sells for about ${P("pawleys-island")}. On the island, the middle sale for a house over three years was about ${price(PI2.median)}, and nightly rentals are allowed.`,
  ], photo(PI_PH, "A walkway and a covered platform over the creek on the marsh side of Pawleys Island.")),
  portrait("carolina-forest", "trails on the waterway", [
    // H22; D4, D6; H23 (no city tax)
    `The county's Bike and Run Park, on the Intracoastal Waterway, has about 7 miles of mountain-bike and hiking trails on 70 acres.`,
    `More people lived in Carolina Forest than in North Myrtle Beach in 2020. It has no city or town government, so there is no city tax.`,
    `In Carolina Forest, a resold house usually goes for about ${P("carolina-forest")}.`,
  ]),
  portrait("conway", "a city on the Waccamaw River", [
    // H21 CORRECTED (VERIFY and FIXER-VERIFY wording); D7 (CW 28); D6, D9
    `Riverfront Park on the Waccamaw has a playground built like a steamboat, the F.G. Burroughs, beside a riverwalk of about 1.5 miles.`,
    `Conway became a town in 1898, the first of the five cities and towns here to do so. It is the one city of the nine away from the ocean.`,
    `A resold house or townhouse in the city usually sells for about ${P("conway")}. For a nightly rental, we check the city's zoning for each address.`,
  ]),
].join("");

/* H36: which-town's own Conway figure (detached houses in its outline), read from its data file, for the note and the FAQ. */
const WT_CONWAY = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-a", "buyers-relocating-which-town", "chart-towns.json"), "utf8")).rows.find((r) => r.slug === "conway");
must(WT_CONWAY && Math.round(WT_CONWAY.median_sale / 1000) * 1000 === 271000, "H36 which-town's Conway figure moved");
const WT_CONWAY_SAID = "$" + (Math.round(WT_CONWAY.median_sale / 1000) * 1000).toLocaleString("en-US");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main: the approved 2026-11-08 treatment (garden-city.js DESIGN_CSS).          */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", TG = `${S} .c3-tg`;
const CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} h2{text-wrap:balance}`
  /* The table. */
  + `${TG}{margin:1.6rem 0 0;max-width:880px}`
  + `${TG} table{width:100%;border-collapse:collapse;table-layout:fixed;color:var(--muted);font-size:1rem;line-height:1.5}`
  + `${TG} caption{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  + `${TG} th,${TG} td{text-align:left;vertical-align:top;padding:.8rem 1.1rem .8rem 0;border-top:${RULE}}`
  + `${TG} thead th{border-top:0;border-bottom:1px solid rgba(28,32,40,.3);padding-top:0;padding-bottom:.55rem;color:var(--navy);font-family:var(--sans);font-size:.8125rem;font-weight:600;letter-spacing:.04em;text-transform:uppercase;line-height:1.35}`
  + `${TG} thead th:nth-child(1){width:25%}${TG} thead th:nth-child(2){width:24%}${TG} thead th:nth-child(3){width:15%}${TG} thead th:nth-child(4){width:36%}`
  + `${TG} tbody tr:last-child>*{border-bottom:${RULE}}`
  + `${TG} tr.c3-tg-grp th{padding:1.4rem 0 .45rem;border-top:0;color:var(--g-ink,#8a5226);font-family:var(--sans);font-size:.8125rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase}`
  + `${TG} tbody tr:first-child th{padding-top:.4rem}`
  + `${TG} tr.c3-tg-grp+tr>*{border-top:1px solid rgba(28,32,40,.3)}`
  + `${TG} a.c3-tg-name{font-family:var(--serif);font-size:1.15rem;line-height:1.3;color:var(--navy);font-weight:600;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:4px;text-decoration-color:rgba(138,82,38,.55)}`
  + `${TG} a.c3-tg-name:hover{text-decoration-color:currentColor}`
  + `${S} .ar{display:inline-block;margin-left:.3rem;vertical-align:-2px;color:var(--g-ink,#8a5226)}${S} .ar svg{display:block}${S} .nw{white-space:nowrap}`
  + `${TG} td.c3-tg-ppl{color:var(--navy);font-family:var(--serif);font-size:1.1rem;font-weight:600;font-variant-numeric:tabular-nums}`
  + `${TG} .l{display:none}${TG} .u{display:none}`
  + `@media (max-width:759px){`
  + `${TG} table,${TG} tbody,${TG} tr,${TG} th,${TG} td{display:block;width:auto}`
  + `${TG} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TG} tbody tr{display:grid;grid-template-columns:minmax(0,1fr) auto;column-gap:1rem;padding:.8rem 0 .85rem;border-top:${RULE}}`
  + `${TG} tbody tr.c3-tg-grp{display:block;padding:1.3rem 0 .4rem;border-top:0}${TG} tbody tr.c3-tg-grp+tr{border-top:1px solid rgba(28,32,40,.3)}`
  + `${TG} tbody tr:last-child{border-bottom:${RULE}}`
  + `${TG} th,${TG} td{border:0!important;padding:0}`
  + `${TG} tbody tr:not(.c3-tg-grp)>th{grid-column:1;grid-row:1}`
  + `${TG} td.c3-tg-ppl{grid-column:2;grid-row:1;text-align:right;font-size:1.05rem}${TG} td.c3-tg-ppl .u{display:inline;font-family:var(--sans);font-size:.875rem;font-weight:400;color:var(--muted)}`
  + `${TG} td.c3-tg-kind{grid-column:1/-1;grid-row:2;margin-top:.2rem;font-size:.9375rem;color:var(--navy)}`
  + `${TG} td.c3-tg-water{grid-column:1/-1;grid-row:3;margin-top:.1rem;font-size:.9375rem}`
  + `${TG} tr.c3-tg-grp th{padding:0}`
  + `}`
  /* The notes under the table and under the portraits: a short list under thin rules. */
  + `${S} .c3-tg-notes{list-style:none;margin:0 0 1.4rem;padding:0;max-width:720px;border-bottom:${RULE}}`
  + `${S} .c3-tg-notes li{margin:0;padding:.7rem 0 .75rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1rem}`
  + `${S} .c3-tg-notes li:first-child{border-top:0;padding-top:1rem}`
  + `${S} ul.c3-tg-links{list-style:none;margin:.4rem 0 1.4rem;padding:0;max-width:720px;border-bottom:${RULE}}`
  + `${S} ul.c3-tg-links li{margin:0;padding:.75rem 0 .8rem;border-top:${RULE};color:var(--muted);line-height:1.55}`
  + `${S} ul.c3-tg-links a{color:var(--navy);font-weight:600}`
  /* The map: one screen at most on a wide screen. */
  + `@media (min-width:700px){${S} figure.c3-tg-map{max-width:620px!important}}`
  /* The chart: the same block width as the text. */
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  /* The portraits: a thin rule above each, the photo beside the text from 1,100 px. */
  + `${S} .c3-tg-town{border-top:${RULE};margin-top:2.4rem;padding-top:.4rem;max-width:1040px}`
  + `${S} .c3-tg-town:first-of-type{margin-top:1.2rem}`
  + `${S} h3.c3-tg-h3{font-family:var(--serif);font-size:1.5rem!important;line-height:1.3;color:var(--navy);margin:1.2rem 0 .7rem!important;text-wrap:balance}`
  + `${S} .c3-tg-town figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;padding:0!important;margin:1rem 0 1.2rem!important}`
  + `${S} .c3-tg-town figure.c3ph-hero figcaption{padding:0!important}`
  + `@media (min-width:1100px){${S} .c3-tg-town.has-ph{display:grid;grid-template-columns:minmax(0,1fr) 380px;column-gap:2.5rem;align-items:start}`
  + `${S} .c3-tg-town.has-ph>h3{grid-column:1/-1}${S} .c3-tg-town.has-ph>.c3-tg-text{grid-column:1}${S} .c3-tg-town.has-ph>figure.c3ph-hero{grid-column:2;grid-row:2;margin:.3rem 0 0!important;max-width:none!important}}`
  /* The homes strip sits quietly under its portrait; the guide link under it. */
  + `${S} .c3-tg-homes{max-width:1040px;margin:.6rem 0 0}`
  + `${S} .c3-tg-homes .hx-strip{margin:0 0 .2rem;max-width:none}${S} .c3-tg-homes .hx-s-head{font-size:.95rem;margin-bottom:.45rem}`
  + `${S} .c3-tg-homes .hx-s-row>.hx-c{flex-basis:min(62%,13rem)}${S} .c3-tg-homes .hx-c-body{padding:.5rem .7rem .6rem}`
  + `${S} .c3-tg-homes .hx-c-price{font-size:1.08rem}${S} .c3-tg-homes .hx-c-facts{font-size:.84rem}${S} .c3-tg-homes .hx-c-addr{font-size:.8rem}`
  + `${S} p.c3-tg-ask{margin:0;max-width:none;line-height:1.5;font-family:var(--sans);font-size:1rem;color:var(--muted)}`
  + `${S} p.c3-tg-ask a{font-weight:600;text-underline-offset:3px}${S} a.c3-tg-map-a{color:var(--g-ink,#8a5226)}${S} a.c3-tg-req{color:var(--navy)}`
  + `${S} p.c3-tg-guide{margin:.9rem 0 0;font-family:var(--sans);font-size:1rem}`
  + `${S} p.c3-tg-guide a{color:var(--navy);font-weight:600;text-decoration:underline;text-underline-offset:4px;text-decoration-color:rgba(138,82,38,.55)}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The end band (the same fix as garden-city.js and hoa.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (max-width:379px){${S} .hx-fb-ai,${S} .hx-fb-q{min-width:0;max-width:100%;flex-wrap:wrap;box-sizing:border-box}${S} .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}${S} .hx-fb-go{flex:1 1 100%}}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const SRC = {
  P1: "https://data.census.gov/table/DECENNIALPL2020.P1?g=040XX00US45$1600000",
  H5: "https://data.census.gov/table/DECENNIALDHC2020.H5?g=040XX00US45$1600000",
  GAZ: "https://www.census.gov/geographies/reference-files/time-series/geo/gazetteer-files.html",
  TIGER: "https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html",
  MBABOUT: "https://cityofmyrtlebeach.com/guests/about_myrtle_beach/",
  MBNAME: "https://cityofmyrtlebeach.com/i_want_to/find/our_honorary_namesakes.php",
  NMB1968: "https://www.scstatehouse.gov/sess117_2007-2008/prever/1325_20080423.htm",
  SBHIST: "https://www.surfsidebeach.org/207/History",
  CONWAY: "https://www.conwaysc.gov/residents_visitors/about_conway/",
  PITOWN: "https://www.townofpawleysisland.com/about-pawleys-island/",
  PILOT: "https://nauticalcharts.noaa.gov/publications/coast-pilot/files/cp4/CPB4_C12_WEB.pdf",
  TIDES: "https://tidesandcurrents.noaa.gov/",
  DEEDS: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  GTGIS: "https://gis.gtcountysc.gov/",
  BOARDWALK: "https://cityofmyrtlebeach.com/news_detail_T6_R986.php",
  AIRPORT: "https://www.flymyrtlebeach.com/",
  SBPIER: "https://www.surfsidebeach.org/212/Surfside-Beach-Fishing-Pier",
  GCPIER: "https://www.pieratgardencity.com/story",
  MARSHWALK: "https://marshwalk.com/",
  NRHP: "https://npgallery.nps.gov/pdfhost/docs/nrhp/text/72001211.PDF",
  PARKS: "https://www.horrycountysc.gov/departments/parksandrecreation/parks",
  MBZONING: "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php",
  NMBSTR: "https://www.parks.nmb.us/833/Short-term-Rentals",
  SBCODE: "https://www.zoneomics.com/code/surfside-beach-SC/chapter_3",
  HCSTR: "https://www.horrycountysc.gov/media/monjnvh0/sales-tax-chart-short-term-rentals.pdf",
  GTFAQ: "https://www.gtcountysc.gov/Faq.aspx?QID=116",
};

/* ---------------------------------------------------------------------------- */
/* The offers: four wordings, each button only a link (the site opens the short pop-up).                     */

const TOP = { title: "Tell us how you will use the home. We send the homes that fit.", label: "Send me homes", href: "/contact/" };
const END = {
  h2: "Tell us your budget and how you will use the home.",
  p: "We send the homes for sale that fit, in the towns that fit.",
  label: "Send me homes that fit", href: "/contact/",
};

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Guides", url: "/guides/" },
  pageImages: () => PH.pageImages(SB_PH),
  title: "Grand Strand Towns: How the 9 Places Differ | Chapter3",
  description: "Grand Strand towns from Little River to Pawleys Island: which are real towns, how many people live in each, the water, the winter, and what homes sell for.",
  ogTitle: "Grand Strand towns: nine places near Myrtle Beach, and how they differ",
  crumb: "Town guides",
  eyebrow: "Grand Strand town guides",
  h1: "Grand Strand towns: nine places near Myrtle Beach, and how they differ.",
  h1em: "The water, the winter, and what a home costs in each.",
  sub: "Among the Grand Strand towns, Pawleys Island counted 130 residents in 2020, and Conway became a town 40 years before Myrtle Beach.",
  heroCta: TOP,
  topOfferLine: TOP.title,
  author: "devin",
  toc: false,
  shortAnswer: [
    `Seven of the nine Grand Strand places in our guides are on or by the coast, from Little River to Pawleys Island. Carolina Forest and Conway are inland.`,
    `Most of the vacation homes are in the seven places on the coast. Inland, in Carolina Forest and Conway, ${in10("conway")} homes were kept for vacations in 2020. Five of the nine are cities or towns, and the county runs the other four.`,
  ],
  sections: [
    { h2: "What towns are on the Grand Strand?", toc: "The towns", id: "towns", html: () =>
      CSS + G.homesCss() +
      h.p(`On the coast, north to south, the Grand Strand places in our guides are Little River, North Myrtle Beach, Myrtle Beach, Surfside Beach, Garden City, Murrells Inlet and Pawleys Island. Inland are Carolina Forest and Conway.`) +
      MAP +
      TABLE +
      `<ul class="c3-tg-notes">`
        + `<li>Each count of people uses the Census Bureau's outline of the place, which can differ a little from our guide's area. Garden City and Murrells Inlet cross the county line, and each count takes in one side only: Garden City's Horry side and Murrells Inlet's Georgetown side.</li>`
        + `<li>Two more towns sit on the beach without a guide here. Atlantic Beach is between Crescent Beach and Windy Hill, and Briarcliffe Acres is between North Myrtle Beach and Myrtle Beach.</li>`
        + `</ul>` +
      h.p(`Inside a city or town, the city adds its own tax, trash pickup and rules. Our 13-town comparison shows ${h.a("/buyers/relocating/which-town/#city-or-county", "what changes at the city line")}.`) },

    { h2: "How long is the Grand Strand?", toc: "How long", id: "how-long", html: () =>
      h.p(`From the North Carolina line to the south end of Pawleys Island, the ocean shore is about 48 miles long. To the mouth of Winyah Bay, it is about 63. The City of Myrtle Beach calls the Grand Strand a 60-mile stretch of the coast.`) +
      h.p(`The two big cities have the longest beaches: about 10 miles inside Myrtle Beach, and a little over 8 inside North Myrtle Beach.`) +
      h.p(`Pawleys Island has about 3 1/2 miles of ocean beach, and Surfside Beach about 2. More than a third of the shore is outside every town: unincorporated land, Myrtle Beach State Park and Huntington Beach State Park.`) },

    { h2: "Which Grand Strand towns are quiet in winter?", toc: "Winter", id: "winter", html: (bg) =>
      h.p(`In the 2020 Census, Pawleys Island and North Myrtle Beach had the most homes kept for vacations: ${in10("pawleys-island")} and ${in10("north-myrtle-beach")}.`) +
      h.p(`A street of vacation homes is full in summer and quiet from fall to spring. A street of homes people live in looks much the same in January as in July. If the vacation home would be yours, our ${h.a("/buyers/second-home/", "second home guide")} covers the tax, the insurance and renting it out.`) +
      CHART +
      h.p(`Our guides answer it for one town: ${h.a("/submarkets/garden-city/#winter", "is Garden City busy in winter")}, and ${h.a("/submarkets/myrtle-beach/#living", "what the off season is like in Myrtle Beach")}.`) +
      h.cta("A busy street all year, or a quiet one in winter?", "Tell us which you want. We pick the towns and streets that fit, and send the homes for sale there.", "Pick my towns", "/contact/", bg) },

    { h2: "What is each Grand Strand town like?", toc: "Each town", id: "each-town", html: (bg) =>
      h.p(`Each place below leads with the thing people love there, then what a home costs. Where a city or town has its own rule on renting by the night, the place says so.`) +
      PORTRAITS +
      `<ul class="c3-tg-notes" style="margin-top:2.4rem">`
        + `<li>Each price is the middle sale from county deed records, for the kind of home that town's guide leads with. Our ${h.a("/buyers/relocating/which-town/", "13-town comparison")} draws its own town lines, so its figures differ a little.</li>`
        + `<li>Outside the cities and towns, Horry County's list of what a nightly-rental owner must file names a business license and three tax accounts. It names no rental permit. Outside its towns, Georgetown County requires no business license.</li>`
        + `<li>An HOA or the deed can bar nightly rentals even where the town allows them. Our ${h.a("/invest/str-rules/", "short-term rental rules page")} has each town's rule in full.</li>`
        + `</ul>` +
      h.cta("Found a home in one of these towns?", "Send us the address. We confirm its town, its zoning and the HOA's rules on renting, before you make an offer.", "Send us the address", "/contact/", bg) },

    { h2: "Buying a home to rent out on the Grand Strand?", toc: "Buying a rental", id: "rentals", html: () =>
      h.p(`Start with what a rental earns and where the town allows it:`) +
      `<ul class="c3-tg-links">`
        + `<li>${h.a("/invest/airbnb-income/", "How much Myrtle Beach Airbnbs make")}, by town and by size.</li>`
        + `<li>${h.a("/invest/where-to-buy/", "Where to buy a rental near Myrtle Beach")}: by the night at the beach, and by the year inland.</li>`
        + `<li>${h.a("/invest/str-rules/", "Where Airbnb is legal")}, city by city.</li>`
        + `</ul>` +
      h.p(`For one home you like, we read the HOA's rental rules and check the zoning before you offer. We also pull the recent sales near it, so you know what it is worth.`) },
  ],
  faqTitle: "Grand Strand towns FAQ",
  faq: [
    { q: "Why is it called the Grand Strand?", a: "The name dates from 1949. It was the title of a newspaper column by Claude Dunnagan, and the name stuck for the whole region." },
    { q: "How many people live in the Grand Strand towns?", a: `In the 2020 Census, Myrtle Beach was the largest of our nine places, with ${n(C["myrtle-beach"].people_2020)} residents, and Pawleys Island the smallest, with ${n(C["pawleys-island"].people_2020)}. Conway and Carolina Forest, inland, came next after Myrtle Beach.` },
    { q: "Is Atlantic Beach part of North Myrtle Beach?", a: "No. Atlantic Beach is a separate town, and it was not part of the 1968 merger that formed North Myrtle Beach." },
    { q: "Why does the 13-town comparison show different prices?", a: `Both come from county deed records, but each counts a different group of homes. In Conway, this page counts houses and townhouses in the city: about ${P("conway")}. The comparison counts houses in its own outline: about ${WT_CONWAY_SAID}.` },
  ],
  sources: [
    { name: "Census P1", href: SRC.P1 },
    { name: "Census H5", href: SRC.H5 },
    { name: "Gazetteer", href: SRC.GAZ },
    { name: "TIGER/Line", href: SRC.TIGER },
    { name: "MB history", href: SRC.MBABOUT },
    { name: "namesakes", href: SRC.MBNAME },
    { name: "S.1325", href: SRC.NMB1968 },
    { name: "SB history", href: SRC.SBHIST },
    { name: "Conway", href: SRC.CONWAY },
    { name: "Pawleys", href: SRC.PITOWN },
    { name: "Coast Pilot", href: SRC.PILOT },
    { name: "tides", href: SRC.TIDES },
    { name: "Horry deeds", href: SRC.DEEDS },
    { name: "Georgetown GIS", href: SRC.GTGIS },
    { name: "Boardwalk", href: SRC.BOARDWALK },
    { name: "airport", href: SRC.AIRPORT },
    { name: "SB pier", href: SRC.SBPIER },
    { name: "GC pier", href: SRC.GCPIER },
    { name: "MarshWalk", href: SRC.MARSHWALK },
    { name: "NRHP 72001211", href: SRC.NRHP },
    { name: "county parks", href: SRC.PARKS },
    { name: "MB zoning", href: SRC.MBZONING },
    { name: "NMB rentals", href: SRC.NMBSTR },
    { name: "SB code", href: SRC.SBCODE },
    { name: "Horry filings", href: SRC.HCSTR },
    { name: "Georgetown FAQ", href: SRC.GTFAQ },
  ],
  sourcesNote: `Miles: our TIGER/Line measure. Prices: each guide's middle sale, deeds recorded ${PERIOD}; Pawleys Island itself, three years.`,
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "Myrtle Beach area towns, towns on the Grand Strand, how long is the Grand Strand, Grand Strand population, why is it called the Grand Strand, Grand Strand town guides, Little River, North Myrtle Beach, Surfside Beach, Garden City, Murrells Inlet, Pawleys Island, Carolina Forest, Conway",
  about: "The towns of the Grand Strand, South Carolina, from Little River to Pawleys Island, and Carolina Forest and Conway inland",
});
