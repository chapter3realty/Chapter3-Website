/* /buyers/relocating/which-town/ - which Grand Strand town fits a mover: thirteen places from Loris to
 * Pawleys Island, each with what a house sold for, what it costs a year to keep, the drive to the beach
 * and the airport, the land, the flood share and the rules that change at the city line.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-04. The page was built from data/relocating/pages/which-town.js
 * with data/relocating/assemble-page.js; this spec replaces it (BRIEF: "move them to a spec").
 * Facts: Blog-Brain batches/2026-11-a/buyers-relocating-which-town/facts.md, VERIFIED and CORRECTED rows at
 * their corrected wording (VERIFY.md), and the verified rows of the town pages' ledgers that facts.md row 29
 * points to (Little River 12 and 18, Conway 28 and 46, Garden City 32 and 44, Myrtle Beach 42, 45 and 46,
 * Pawleys Island 1, 6 and 9). Data, never typed: data/2026-11-a/buyers-relocating-which-town/ (chart-towns.json,
 * findings.json, drives-houses.json, areas.geojson, photos.json; see its README).
 * Kept from the live page: the headline the owner liked, the city-or-county idea (now with the tax per
 * $100,000 and the services), the fair-housing stance (one FAQ answer), the two client stories (Longs land
 * and a new house; the New York boat owners in North Myrtle Beach), every town link. Cut: the "working
 * ranges" price table, the made-up 10-mile drive table, the staff section, the four generic cards.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data", "2026-11-a", "buyers-relocating-which-town");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const ROWS = read("chart-towns.json").rows, F = read("findings.json"), GEO = read("areas.geojson"), DR = read("drives-houses.json");
const must = (ok, msg) => { if (!ok) throw new Error(`which-town: ${msg}`); };

/* Four reused records name their 1200w file as "file" (the town pages' own lookup); the shared lookup strips
   "-1200w" from the name asked for, so here those four are looked up under the name without it. The images
   shown are the records' variants either way. */
const PHOTOS = read("photos.json").photos.map((r) => (/-1200w\.webp$/.test(r.file) ? Object.assign({}, r, { file: r.file.replace(/-1200w\.webp$/, ".webp") }) : r));
const kit = PK.create({ h, theme: "glass", photos: PHOTOS,
  mapDir: path.join(ROOT, "chapter3realty", "images", "maps"), mapSrc: "/images/maps" });
const ph = kit.photoSet({ aerialWidth: "720px" });

const SELF = "/buyers/relocating/which-town/";
const CONTACT = "/contact/";

/* ---------- the thirteen places, numbered north to south as in chart-towns.json ---------- */
const ORDER = ["loris", "aynor", "longs", "little-river", "conway", "north-myrtle-beach", "carolina-forest", "myrtle-beach",
  "socastee", "surfside-beach", "garden-city", "murrells-inlet", "pawleys-litchfield"];
must(ROWS.map((r) => r.slug).join() === ORDER.join(), "chart-towns.json is no longer the 13 places in this order");
const A = {};
ORDER.forEach((slug, i) => {
  const r = ROWS[i], f = F.areas.find((x) => x.slug === slug), d = DR.areas[slug];
  must(f && d, `no findings or drives for ${slug}`);
  A[slug] = Object.assign({ n: i + 1, slug, f, d }, r);
});
const SHORT = { "pawleys-litchfield": "Pawleys Island" };
const nm = (s) => (s === "pawleys-litchfield" ? "Pawleys Island and Litchfield" : A[s].name);
const short = (s) => SHORT[s] || A[s].name;
const TOWN_PAGE = { "little-river": "/submarkets/little-river/", conway: "/submarkets/conway/", "north-myrtle-beach": "/submarkets/north-myrtle-beach/",
  "carolina-forest": "/submarkets/carolina-forest/", "myrtle-beach": "/submarkets/myrtle-beach/", "surfside-beach": "/submarkets/surfside-beach/",
  "garden-city": "/submarkets/garden-city/", "murrells-inlet": "/submarkets/murrells-inlet/", "pawleys-litchfield": "/submarkets/pawleys-island/" };

/* ---------- how numbers are said ---------- */
const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
/* Aynor's middle price rests on 49 resales: said to the nearest $10,000 everywhere (ledger row 1). */
const price = (s) => (s === "aynor" ? usd(Math.round(A[s].median_sale / 10000) * 10000) : usd(Math.round(A[s].median_sale / 1000) * 1000));
const yearly = (s) => usd(Math.round(A[s].yearly_besides_mortgage / 100) * 100);
/* Drive minutes (ledger row 17, corrected): under 15 to the minute, longer to the nearest 5. */
const mins = (v) => (v < 15 ? Math.round(v) : Math.round(v / 5) * 5);
const beach = (s) => mins(A[s].minutes_beach), airport = (s) => mins(A[s].minutes_airport), hosp = (s) => mins(A[s].minutes_hospital);
const pct = (v) => `${Math.round(v)} percent`;
const share = (a, b) => a / b;

/* ---------- the claims in words, checked against the data (ledger rows in brackets) ---------- */
const by = (k) => [...ORDER].sort((x, y) => A[x][k] - A[y][k]);
must(by("median_sale")[0] === "conway" && by("median_sale").at(-1) === "surfside-beach", "[1] Conway is no longer the lowest or Surfside the highest");
must(by("yearly_besides_mortgage")[0] === "loris" && by("yearly_besides_mortgage").at(-1) === "murrells-inlet", "[15] Loris is no longer the lowest yearly cost or Murrells Inlet the highest");
must(price("conway") === "$271,000" && yearly("loris") === "$6,400" && yearly("murrells-inlet") === "$9,700", "[1, 15] the short answer's figures moved");
must(by("minutes_beach")[0] === "surfside-beach" && by("minutes_beach").at(-1) === "aynor", "[17] the nearest and farthest from the beach changed");
must(by("minutes_hospital")[0] === "murrells-inlet", "[17] Murrells Inlet is no longer the closest to a hospital");
must(["myrtle-beach", "socastee"].every((s) => airport(s) <= 14 && A[s].minutes_mall < 12), "[17] Myrtle Beach and Socastee are no longer the shortest drives");
must(by("median_lot_acres").at(-1) === "aynor" && by("median_lot_acres").at(-2) === "loris", "[7] Aynor and Loris no longer have the biggest lots");
must(A.aynor.pct_lot_acre_plus > 50 && A.loris.pct_lot_acre_plus > 40 && A.loris.pct_lot_acre_plus < 50, "[7] 'more than half' and 'more than 4 in 10' no longer hold");
must(["north-myrtle-beach", "surfside-beach"].every((s) => A[s].median_lot_acres < 0.2), "[7] the beach lots are no longer about a sixth of an acre");
must(by("median_year_built_all_homes").at(-1) === "carolina-forest", "[8] Carolina Forest no longer has the newest homes");
must(A["carolina-forest"].pct_high_risk_flood < 1 && A.aynor.pct_high_risk_flood < 1 && ORDER.filter((s) => A[s].pct_high_risk_flood < 1).length === 2, "[5] Carolina Forest and Aynor are no longer the two under 1 percent");
must(by("pct_legal_residence")[0] === "surfside-beach" && by("pct_legal_residence")[1] === "north-myrtle-beach", "[4] Surfside and North Myrtle Beach no longer have the lowest legal-residence shares");
const YEAR_ROUND = ORDER.filter((s) => A[s].pct_legal_residence >= 74);
must(YEAR_ROUND.length === 9 && YEAR_ROUND.every((s) => A[s].pct_legal_residence <= 82), "[4] '9 of the 13 places, about 3 in 4 or more' no longer holds");
must(A.loris.d.nearest_hospital_counts["McLeod Health Loris"] === 59, "[27] McLeod Health Loris is no longer nearest for 59 of 60");
const fs_ = (s, k) => share(A[s][k], A[s].for_sale);
must(fs_("north-myrtle-beach", "for_sale_beach_1mi") > 0.72 && fs_("north-myrtle-beach", "for_sale_beach_1mi") < 0.78, "[18] 'about 3 in 4' near the beach in North Myrtle Beach");
must(fs_("north-myrtle-beach", "for_sale_no_hoa") > 0.38 && fs_("north-myrtle-beach", "for_sale_no_hoa") < 0.45, "[18] 'about 4 in 10' with no HOA fee in North Myrtle Beach");
must(A["surfside-beach"].for_sale_beach_1mi === A["surfside-beach"].for_sale, "[18] not every Surfside house for sale is within a mile of the beach");
must(A["carolina-forest"].for_sale_no_hoa === 0, "[18] a Carolina Forest house for sale now lists no HOA fee");
must(fs_("loris", "for_sale_no_hoa") > 0.58 && fs_("loris", "for_sale_no_hoa") < 0.63, "[18] '6 in 10' with no HOA fee around Loris");
must(fs_("longs", "for_sale_new") > 0.45 && fs_("longs", "for_sale_new") < 0.52, "[18] 'about half' new in Longs");
must(A.aynor.builder_share_pct === 50 && A.longs.builder_share_pct > 44 && A.longs.builder_share_pct < 48, "[2] 'about half' builders' sales in Aynor and Longs");
must(A.loris.builder_share_pct > 36 && A.loris.builder_share_pct < 42, "[2] 'about 4 in 10' builders' sales around Loris");
must(A["surfside-beach"].f.builder_sales_horry === 1 && A["little-river"].builder_share_pct < 7, "[2] Surfside's one builder sale, Little River's 6 percent");
must(A.socastee.pct_high_risk_flood === Math.max(...["loris", "aynor", "longs", "conway", "carolina-forest", "socastee", "little-river"].map((s) => A[s].pct_high_risk_flood)), "[5] Socastee is no longer the highest flood share away from the ocean");

/* The yearly cost, part by part (row 15). Insurance and upkeep are one figure for every place (rows 12, 13). */
const INS = F.insurance_yearly_middle, UPKEEP = F.upkeep_yearly;
must(INS === 2000 && UPKEEP === 3273, "[12, 13] insurance or upkeep changed");
for (const s of ORDER) { const y = A[s].f.yearly_besides_mortgage; must(Math.round(y.tax + y.fee + y.insurance + y.hoa + y.upkeep) === y.total && y.total === A[s].yearly_besides_mortgage, `[15] ${s} parts do not add up`); }

/* The worked example: Longs and North Myrtle Beach (rows 1, 10, 14, 15, 16). */
const L = A.longs, N = A["north-myrtle-beach"];
const GAP = N.yearly_besides_mortgage - L.yearly_besides_mortgage;
must(GAP > 100 && GAP < 180 && N.median_sale / L.median_sale > 1.8 && N.median_sale / L.median_sale < 1.95, "[16] 'nearly twice the price, about $140 more a year' no longer holds");
const GAP_TXT = usd(Math.round(GAP / 10) * 10);
/* Row 16: the price ratio and the yearly ratio. */
const R = (s) => [A[s].median_sale / A.loris.median_sale, A[s].yearly_besides_mortgage / A.loris.yearly_besides_mortgage];
must(R("pawleys-litchfield")[0].toFixed(1) === "2.3" && R("pawleys-litchfield")[1].toFixed(1) === "1.5", "[16] Pawleys 2.3 and 1.5");
must(R("surfside-beach")[0].toFixed(1) === "2.5" && R("surfside-beach")[1].toFixed(1) === "1.3", "[16] Surfside 2.5 and 1.3");

/* Tax a year on $100,000 of value, as your home (row 10, the verifier's arithmetic: $100,000 x 4 percent x the
   levy less the 109.1-mill school operating levy; Myrtle Beach less 53.4 percent of its 83.4 city mills; Georgetown
   from the county's calculator). Each rate is checked against the tax the data file puts on the place's middle house. */
const RATE = { "longs": 367.6, "garden-city": 392.8, "myrtle-beach": 403.8, "surfside-beach": 420.4, "north-myrtle-beach": 448.4,
  "pawleys-litchfield": 456.0, "murrells-inlet": 515.6, conway: 653.6 };
const per100k = (s) => RATE[s];
for (const [k, v] of Object.entries(RATE)) must(Math.abs(A[k].f.tax_legal_residence_median_house / A[k].median_sale * 100000 - v) < 1, `[10] ${k}'s rate no longer matches its middle-house tax`);
const LORIS_CITY = 100000 * 0.04 * (282.2 - 109.1) / 1000;
must(Math.abs(LORIS_CITY - 692.4) < 0.1, "[10] the City of Loris rate");
const LORIS_CITY_TAX = usd(Math.round(A.loris.median_sale * 0.04 * 0.1731 / 10) * 10);
must(LORIS_CITY_TAX === "$1,940", "[11] the City of Loris tax on the middle house");

/* ---------- the numbered map (areas.geojson) and the selection guide ---------- */
/* 2026-11-08, the owner on the map and list at the top: "very very cluttered and unorganized". One map that reads
   at a glance: the 13 outlines in one colour, big numbers that match the list, and no
   roads, route shields, north arrow, city-or-county colours or county line (the city-or-county section covers that).
   The map is framed taller, as the places lie, so it stands as tall as the list beside it on a desktop. The badges
   on the crowded coast go out over the ocean in a short column, each with a thin line to its place. */
const MAP = (() => {
  const ring = (g) => {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    let best = null, ba = 0;
    for (const p of polys) { const r = p[0]; let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); if (Math.abs(a) > ba) { ba = Math.abs(a); best = r; } }
    let s = best; while (s.length > 300) s = s.filter((_, i) => i % 2 === 0);
    return s;
  };
  const feat = (slug) => GEO.features.find((x) => x.properties.slug === slug);
  const areas = ORDER.map((slug) => ({ name: short(slug), polygon: ring(feat(slug).geometry), mark: String(A[slug].n) }));
  const m = regionMap({ name: "Thirteen places near Myrtle Beach", areas, areaLabels: "numbers", maxRatio: 1.2 }, { glass: true, inlineMax: 70000 });
  /* inlineMax: the taller frame draws more roads before they are cut below; the map that ships is about 38 KB. */
  let svg = m.svg;
  const cut = (re, what, n) => { const k = (svg.match(re) || []).length; must(n === undefined ? k > 0 : k === n, `the map's ${what}: found ${k}`); svg = svg.replace(re, ""); };
  cut(/<g fill="none" stroke-linecap="round" stroke-linejoin="round">[\s\S]*?<\/g>/, "roads", 1);
  cut(/<g transform="translate\([^)]*\)"><g class="k">(?:(?!<\/g>)[\s\S])*?<text class="r"[^>]*>[^<]*<\/text><\/g><\/g>/g, "route shields");
  cut(/<g transform="translate\([^)]*\)"><g class="k"><path d="M0-12 5 2 0-1-5 2z"[^>]*\/><text[^>]*>N<\/text><\/g><\/g>/, "north arrow", 1);
  cut(/<circle cx="[\d.]+" cy="[\d.]+" r="15.5"[^>]*\/>/, "north arrow's disc", 1);
  /* The ocean's name moves to the open water at the lower right, clear of the badges. */
  const o = svg.match(/<g transform="translate\(([\d.]+) ([\d.]+)\)"><g class="k"><text class="o"/);
  must(o && m.width === 360 && m.height === 432, "the ocean label or the map's frame changed");
  svg = svg.replace(o[0], o[0].replace(`translate(${o[1]} ${o[2]})`, "translate(290 420)"));
  /* One colour for every place; data-s lets the filter fade the places it leaves out. */
  const g = svg.match(/<g class="ar"[^>]*>([\s\S]*?)<\/g>/);
  must(g, "the map's area group is missing");
  const paths = g[1].match(/<path [^>]*\/>/g);
  must(paths && paths.length === ORDER.length, "the map has a different number of outlines");
  svg = svg.replace(g[0], `<g class="ar" fill="#c4783a" fill-opacity=".26" stroke="#91592b" stroke-width="1.5" stroke-linejoin="round">` + paths.map((p, i) => p.replace("<path ", `<path data-s="${ORDER[i]}" `)).join("") + `</g>`);
  /* The numbers: dark discs like the list's (not links: on a phone they sit too close together to tap; the list's
     names are the links). [dx, dy, line]: where a badge moves, in map
     units, and whether a thin line leads back to its place (checked at 358 and 470 px wide, 2026-11-08). */
  const MOVE = { 4: [12, 10, 1], 6: [16, 16, 1], 8: [24, 14, 1], 10: [40, -6, 1], 11: [40, 18, 1], 12: [42, 42, 1], 13: [16, 46, 0] };
  const B = [...svg.matchAll(/<g transform="translate\(([\d.]+) ([\d.]+)\)"><g class="k"><circle[^>]*\/><text class="ab"[^>]*>(\d+)<\/text><\/g><\/g>/g)];
  must(B.length === ORDER.length, `the map has ${B.length} numbers`);
  let lines = "", marks = "";
  for (const b of B) {
    const n = +b[3], x = +b[1], y = +b[2], [dx, dy, ln] = MOVE[n] || [0, 0, 0], s = ORDER[n - 1], X = (x + dx).toFixed(1), Y = (y + dy).toFixed(1);
    if (ln) lines += `<g data-s="${s}"><path d="M${x.toFixed(1)} ${y.toFixed(1)}L${X} ${Y}" stroke="#1c2028" stroke-width="1.3"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.2" fill="#1c2028"/></g>`;
    marks += `<g data-s="${s}"><g transform="translate(${X} ${Y})"><circle r="12.5" fill="#1c2028" stroke="#fff" stroke-width="2"/><text y="4.8" text-anchor="middle" style="font:700 13.5px 'DM Sans',system-ui,sans-serif;fill:#fff;stroke:none">${n}</text></g></g>`;
    svg = svg.replace(b[0], "");
  }
  svg = svg.replace(/<\/svg>$/, `<g class="ld">${lines}</g><g class="bd">${marks}</g></svg>`);
  must(svg.length < 70000, `the map is ${svg.length} bytes`);
  const alt = "Map of the Grand Strand and the inland towns behind it, with thirteen places outlined and numbered as in the list: Loris, Aynor, Longs and Conway inland, Little River and North Myrtle Beach at the north end of the coast, Carolina Forest, Myrtle Beach and Socastee in the middle, and Surfside Beach, Garden City, Murrells Inlet and Pawleys Island to the south.";
  const html = svg.replace(/aria-label="[^"]*"/, `aria-label="${alt}"`).replace("<svg ", '<svg style="display:block;width:100%;height:auto" ');
  must(html.includes(alt), "the map's label was not replaced");
  return h.figure(html, `The numbers match the list. ${m.credit}`);
})();

/* What each place does best, by what it has (fair housing: never by who lives there). Each line is also its entry's headline. */
const BEST = {
  loris: "the most land for the money",
  aynor: "an acre is the usual lot",
  longs: "where builders are selling",
  "little-river": "old gardens on the waterway, and boat slips",
  conway: "a river city with its own services",
  "north-myrtle-beach": "most houses for sale near the sand",
  "carolina-forest": "the newest homes, almost no flood zone",
  "myrtle-beach": "the shortest drive to everything",
  socastee: "a historic village on the waterway",
  "surfside-beach": "the sand at the end of the street",
  "garden-city": "between the ocean and the marsh",
  "murrells-inlet": "the creek and the closest hospital",
  "pawleys-litchfield": "an island town where houses rarely sell",
};
must(beach("socastee") < beach("longs") - 5 && airport("socastee") < airport("longs") - 20, "[17] Socastee is no longer much closer to the beach and the airport than Longs");

/* The filter's tags: property facts only (ledger rows 1, 2, 5, 7, 17, 18). 2026-11-08: the chips sit in two labelled
   rows, price and what the place has, and "Lowest yearly cost" is gone: the yearly cost runs only from about $6,400
   to $9,700 (the yearly-cost section says the spread is small), so it sorted little that the price chips do not. */
const TAGS = {
  b1: (s) => A[s].median_sale <= 300000,
  b2: (s) => A[s].median_sale > 300000 && A[s].median_sale <= 450000,
  b3: (s) => A[s].median_sale > 450000,
  sand: (s) => beach(s) <= 10,
  land: (s) => A[s].pct_lot_acre_plus >= 40,
  new: (s) => (A[s].builder_share_pct || 0) >= 25,
  dry: (s) => A[s].pct_high_risk_flood < 5,
  nohoa: (s) => fs_(s, "for_sale_no_hoa") > 0.5,
};
const CHIP_ROWS = [
  ["Price", [["b1", "Up to $300,000"], ["b2", "$300,000 to $450,000"], ["b3", "Over $450,000"]]],
  ["Must have", [["sand", "Beach in 10 minutes"], ["land", "Acre lots common"], ["new", "Builders selling now"], ["dry", "Few in a flood zone"], ["nohoa", "Mostly no HOA fee"]]],
];
const chip = ([k, t]) => `<button type="button" class="c3t-chip" data-k="${k}" aria-pressed="false">${t}</button>`;
const GUIDE = `<div class="c3t-pick" id="find">`
  + `<div class="c3t-chips" hidden>` + CHIP_ROWS.map(([lab, cs], i) => `<div class="c3t-row" role="group" aria-labelledby="c3t-lab${i}"><span class="c3t-lab" id="c3t-lab${i}">${lab}</span><div class="c3t-set">${cs.map(chip).join("")}</div></div>`).join("") + `</div>`
  + `<div class="c3t-map">${MAP}</div>`
  + `<div class="c3t-side"><p class="c3t-count" aria-live="polite" hidden></p>`
  + `<ol class="c3t-list" role="list">` + ORDER.map((s) => `<li data-s="${s}" data-tags="${Object.keys(TAGS).filter((k) => TAGS[k](s)).join(" ")}"><b aria-hidden="true" data-n="${A[s].n}"></b><span class="t"><a class="nm" href="#${s}">${short(s)}</a><span class="bf">${BEST[s][0].toUpperCase() + BEST[s].slice(1)}</span></span></li>`).join("") + `</ol>`
  + `<p class="c3t-none" hidden>No place has all of these. Remove one choice to see the closest.</p></div>`
  + `</div>`
  + `<nav class="c3t-jump" aria-label="Further down"><a href="#compare">Compare</a> &middot; <a href="#yearly-cost">Yearly cost</a> &middot; <a href="#city-or-county">City or county</a> &middot; <a href="#questions-about-the-towns">Questions about the towns</a></nav>`;
must(ORDER.filter(TAGS.b1).join() === "loris,longs,conway,socastee" && ORDER.filter(TAGS.sand).length === 6 && ORDER.filter(TAGS.land).join() === "loris,aynor", "the filter's groups changed");
/* The filter: the list keeps only the places that fit, and the map fades the others. */
const GUIDE_JS = `<script>(function(){var f=document.getElementById("find");if(!f)return;var cs=f.querySelector(".c3t-chips"),ct=f.querySelector(".c3t-count"),no=f.querySelector(".c3t-none"),li=f.querySelectorAll(".c3t-list li"),mp=f.querySelectorAll(".c3t-map [data-s]");cs.hidden=false;var B=["b1","b2","b3"];`
  + `function run(){var on=[].slice.call(cs.querySelectorAll('[aria-pressed="true"]')).map(function(b){return b.getAttribute("data-k")}),n=0,ok={};`
  + `[].forEach.call(li,function(l){var t=" "+l.getAttribute("data-tags")+" ",y=on.every(function(k){return t.indexOf(" "+k+" ")>=0});l.hidden=!y;if(y){n++;ok[l.getAttribute("data-s")]=1}});`
  + `[].forEach.call(mp,function(e){var x=on.length&&!ok[e.getAttribute("data-s")];if(e.classList)e.classList.toggle("off",!!x)});`
  + `no.hidden=n>0;ct.hidden=!on.length;ct.textContent=on.length?(n+(n===1?" place fits":" places fit")+" what you picked."):"";}`
  + `cs.addEventListener("click",function(e){var b=e.target.closest(".c3t-chip");if(!b)return;var k=b.getAttribute("data-k"),p=b.getAttribute("aria-pressed")!=="true";`
  + `if(p&&B.indexOf(k)>=0)B.forEach(function(x){var o=cs.querySelector('[data-k="'+x+'"]');if(o)o.setAttribute("aria-pressed","false")});b.setAttribute("aria-pressed",p?"true":"false");run()});})();</script>`;

/* ---------- photos (photos.json): one in every entry ---------- */
const PH = {
  loris: ph.aerial("loris-houses-on-big-lots-from-above", "Outside Loris: houses on wide lots along two country roads, with sheds, gardens and farm fields across the road."),
  aynor: ph.aerial("aynor-town-and-fields-from-above", "Aynor from above: houses on big lots along the town's grid of streets, and farm fields and woods across the highway."),
  longs: ph.aerial("longs-new-subdivision-from-above", "A new subdivision going up beside farm fields in Longs: streets and ponds dug, some houses built or framed, and most lots still empty."),
  "little-river": ph.aerial("little-river-harbours-from-above", "Two of Little River's marinas share one basin off the Intracoastal Waterway, with slips sold with their own deed."),
  conway: ph.aerial("conway-older-house-and-oak", "An older house under a live oak, a few blocks from Main Street in Conway."),
  "north-myrtle-beach": ph.aerial("cherry-grove-channels-from-above", "Houses on the dug channels at Cherry Grove, at the north end of North Myrtle Beach, from above."),
  "carolina-forest": ph.aerial("carolina-forest-houses-and-woods-from-above", "Houses on streets that end in cul-de-sacs in Carolina Forest, with woods around them and land being cleared for more on the right."),
  "myrtle-beach": ph.aerial("market-common-valor-park", "The Market Common from the air: its homes, outlined, Valor Park and Grand Park beside the shops."),
  socastee: ph.aerial("socastee-swing-bridge-from-above", "The old Socastee swing bridge, the blue steel span, on the Intracoastal Waterway, with the newer highway bridge at the lower left."),
  "surfside-beach": ph.aerial("surfside-beach-pier-from-above-2026", "The Surfside Beach pier from the air, with the beach parking lots and the streets of beach houses behind it."),
  "garden-city": ph.aerial("garden-city-beach-and-marsh-from-the-ocean-2011", "Beach houses at Garden City, seen from over the ocean, with the salt marsh and its creeks behind them."),
  "murrells-inlet": ph.aerial("murrells-inlet-creek-front-docks-from-above", "Houses on the creek side of Business 17 in Murrells Inlet, with docks reaching out over the marsh edge to the creek."),
  "pawleys-litchfield": ph.aerial("pawleys-island-north-end", "The north end of Pawleys Island at low tide: houses along the dune line, and the inlet at right."),
};
ph.share("socastee-swing-bridge-from-above");

/* ---------- one numbered entry ---------- */
/* Fix round 1 (2026-11-04, owner's reviewer): each entry sells the place on what it has, with two or three figures.
   Price is one short line per entry; the yearly cost, the drives and the flood shares live in the chart and the table. */
const offer = (s, label) => G.offer(short(s), { label: label || `Send me houses in ${short(s)}`, href: `/contact/?place=${encodeURIComponent(short(s))}` });
/* 2026-11-08 (owner: "I would recommend an IDX feed for each town"): each entry's live homes strip, after the
   price line and before the offer. Places town-<slug> in idx-lib/places.js (Blog-Brain batches/2026-10-b/data/
   idx-places.json), each a "near" search with "index": false, so its /homes/near/ page stays out of search. */
/* The "Send me houses" pill is the strip's fallback (owner, 2026-11-08: "a Send me homes button is the fallback for when
   the strip is empty, not the main offer"): it shows only when the edge leaves the strip empty. */
const money = (s, text) => `<div class="c3t-money"><p>${text}</p>${G.homes(`town-${s}`, nm(s), offer(s))}</div>`;
const facts = (s, items) => `<ul class="c3t-facts" role="list">` + items.map(([ic, t]) => `<li><span class="i">${icon(ic, { size: 20 })}</span><span>${t}</span></li>`).join("") + `</ul>`;
must(A.socastee.yearly_besides_mortgage === A.longs.yearly_besides_mortgage, "[15] Socastee and Longs no longer cost the same a year");
const townLink = (s, text) => (TOWN_PAGE[s] ? h.a(TOWN_PAGE[s], text || `our ${short(s)} guide`) : "");
/* Redesign 2026-11-07 (owner: "its too ugly"): on a desktop the photo sits beside the text. The paragraphs before
   the photo stay right under the heading (the section's lead); the photo and the rest are wrapped, and the section's
   .wrap becomes a two-column grid (PAGE_CSS, one row per lead paragraph). On a phone the order is unchanged. Words unchanged. */
const LEADS = {};
const entry = (s, body, after) => {
  const at = body.indexOf(PH[s]);
  must(at > 0, `${s}: the photo is not inside the entry`);
  const lead = body.slice(0, at), k = (lead.match(/<p\b/g) || []).length;
  must(k >= 1 && lead.replace(/<p\b[^>]*>[\s\S]*?<\/p>/g, "") === "", `${s}: the text before the photo is not plain paragraphs`);
  LEADS[s] = k;
  const html = lead + `<div class="c3t-pic" style="grid-row:2/span ${k + 1}">${PH[s]}</div><div class="c3t-rest">${body.slice(at + PH[s].length)}</div>`;
  return { h2: `${A[s].n}. ${nm(s)}: ${BEST[s]}`, toc: short(s), id: s, html: (bg) => html + (after ? after(bg) : "") };
};

/* Checks behind the new entry lines (rows 1, 5, 17, 18). */
must(by("for_sale_rv_boat").at(-1) === "loris", "[18] Loris no longer has the most houses for sale with RV or boat parking");
must(by("minutes_hospital").at(-1) === "aynor" && by("minutes_beach").at(-1) === "aynor", "[17] Aynor is no longer the farthest from the beach and a hospital");
must(["myrtle-beach", "socastee"].every((s) => A[s].minutes_beach < 15.5 && A[s].minutes_airport < 15.5 && A[s].minutes_mall < 15.5), "[17] Myrtle Beach or Socastee: the beach, the airport and the mall are no longer each 15 minutes or less");
must(A.socastee.pct_high_risk_flood > 2 * Math.max(A.conway.pct_high_risk_flood, A["myrtle-beach"].pct_high_risk_flood), "[5] Socastee's flood share is no longer more than twice Conway's and Myrtle Beach's");
must(Math.abs(A.socastee.pct_high_risk_flood - 100 / 9) < 1, "[5] Socastee is no longer about 1 in 9");
must(fs_("north-myrtle-beach", "for_sale_no_hoa") > 0.38 && fs_("north-myrtle-beach", "for_sale_no_hoa") < 0.55, "[14, 18] 'about half' with no HOA fee in North Myrtle Beach");
must(A["surfside-beach"].median_sale === Math.max(...ORDER.map((s) => A[s].median_sale)) && A.conway.median_sale === Math.min(...ORDER.map((s) => A[s].median_sale)), "[1] Surfside or Conway is no longer the top or the bottom");
must(A["murrells-inlet"].yearly_besides_mortgage === Math.max(...ORDER.map((s) => A[s].yearly_besides_mortgage)), "[15] Murrells Inlet no longer costs the most a year");
must(Math.abs(A["surfside-beach"].pct_high_risk_flood - 30) < 2 && Math.abs(A["pawleys-litchfield"].pct_high_risk_flood - 32) < 2, "[5] 'about 3 in 10' and 'about a third' no longer hold");
const GC_GAP = usd(Math.round((A["surfside-beach"].median_sale - A["garden-city"].median_sale) / 10000) * 10000);
must(GC_GAP === "$300,000", "[1] Garden City is no longer about $300,000 below Surfside Beach");

const ENTRIES = [
  entry("loris",
    h.p(`Around Loris, a big yard is normal. More than 4 in 10 house lots are an acre or more, and the usual lot is about ${A.loris.median_lot_acres} acre. Near the beach, lots are closer to a sixth of an acre.`) +
    h.p(`Loris began in 1887 as a railroad depot, and the tracks still run through the middle of downtown. On the third Saturday in October, downtown holds the Bog-Off, with a chicken bog cooking contest, an antique car show and live performances. West of town, Cartwheel Bay Heritage Preserve has a 3.5-mile trail on old roads through longleaf pine, and wild Venus flytraps, pitcher plants and orchids grow along it. It is open dawn to dusk, with no fee.`) +
    PH.loris +
    h.p(`More houses for sale here list parking for an RV or a boat than in any other place on this page. Most list no HOA fee. McLeod Health Loris is the nearest hospital for almost every house.`) +
    money("loris", `Houses around Loris sold for about ${price("loris")}, half for more and half for less. A house here also costs the least of any place on this page to keep each year. Our list of the ${h.a("/buyers/affordable-places-to-live/", "most affordable places near Myrtle Beach")} goes street by street.`)),

  entry("aynor",
    h.p(`Around Aynor, the usual house has about an acre of land, and more than half of house lots are an acre or more. Farm fields start at the edge of the town's grid of streets.`) +
    PH.aynor +
    h.p(`State law names the third Saturday in September "Aynor Harvest Hoe-Down Festival Weekend". The Pilot Club of Aynor started the festival in 1979.`) +
    facts("aynor", [["beach", `The trade-off is distance. Aynor is the farthest of these places from the beach, and from a hospital.`]]) +
    h.p(`Since the 1870s, candidates for county, state and national office have come to Galivants Ferry, just west of Aynor on the Little Pee Dee River, to speak at the Stump. These days they speak from the porch of the Holliday family store, and the crowd eats chicken bog and barbecue, with country and gospel music and clogging.`) +
    h.p(`The river itself runs tea-colored past cypress swamps and sandbars, with a public landing on each side of the US 501 bridge, where people fish for bluegill, redbreast, bass and catfish. In October, Southern Palmetto Farms on Garner Road opens a pumpkin patch and a 6-acre corn maze, with wagon rides.`) +
    money("aynor", `Expect about ${price("aynor")} for a house around Aynor, the middle of the past year's sales.`)),

  entry("longs",
    h.p(`Longs is where builders are selling at the north end. About half the houses sold here in the past year were new, and about half the houses for sale now are new too.`) +
    h.p(`The Waccamaw River runs past Longs through dark water and cypress, and it is the only river that starts in a Carolina bay. At Chris Anderson Landing on SC 9, a sign marks the Waccamaw River Blue Trail.`) +
    h.p(`From Longs you can paddle the Waccamaw River Heritage Preserve, a state preserve along 28 miles of the river where otters and black bears live, and camp on the riverbank on preserve land. Long Bay Club in Longs is one of two Myrtle Beach area golf courses designed by Jack Nicklaus.`) +
    PH.longs +
    h.p(`For houses for sale with a Longs address, a new house asks about the same price per square foot as one built three to ten years ago.`) +
    h.p(`A Longs mailing address can be inside North Myrtle Beach. Two of the county's ten busiest new communities, Grande Dunes North and Waterside, have Longs addresses but sit inside the city. This page's Longs is the part outside the city.`) +
    h.p(`Our clients from North Carolina bought land in Longs and had a new house built on it.`) +
    money("longs", `In Longs, about ${price("longs")} bought a typical house in the past year. The usual HOA fee is about $100 a month.`)),

  entry("little-river",
    h.p(`${townLink("little-river", "Little River")} has a county park on the Intracoastal Waterway: Vereen Memorial Historical Gardens, more than 115 acres of forest and marsh with trails and boardwalks. A piece of the original Kings Highway, the colonial road between Boston and Charleston, is still at the front of the park. George Washington rode that road into South Carolina on April 27, 1791, and stopped to eat at the Cochran house in Little River.`) +
    h.p(`Each October, Little River ShrimpFest fills the old waterfront with more than 200 vendors and two music stages; 2026 was its 20th year. Just off the coast is Waties Island, one of the last undeveloped barrier islands in South Carolina. Loggerhead turtles nest on its beach, and a few months later the hatchlings come out of the sand together and run for the water.`) +
    PH["little-river"] +
    h.p(`Boats are the other draw. About 2 in 3 of the county's boat slips sold with their own deed and tax bill are here. Glen Dornoch Waterway Golf Links, in Little River, is set among live oaks, with views over the marsh and the Intracoastal Waterway.`) +
    h.p(`Little River is not a town, so the county makes the rules. There is no city tax, and trash goes to a private hauler or a county drop-off center.`) +
    money("little-river", `Half the houses here sold for more than ${price("little-river")}, and half for less. Nearly every sale was a resale, not a new house.`)),

  entry("conway",
    h.p(`${townLink("conway", "Conway")} was laid out in 1732, as Kingston. Its older streets of houses under live oaks run down to the Waccamaw River. Locals call those oaks the city's "oldest citizens": from the city's founding, crews built roads around the trees instead of cutting them down, and the town's unofficial slogan is "The trees have the right of way."`) +
    PH.conway +
    h.p(`The Riverwalk is a path along the river with benches and a kayak launch. Riverfront Park beside it has a public boat landing with floating docks. Conway is a city, so it picks up trash at the curb.`) +
    h.p(`Conway has held Riverfest since 1980, on the Saturday before the Fourth of July weekend. In 2026 it brought live music and vendors to Elm Street and the marina, free, and ended with fireworks over the river. Every October, Conway turns into Halloween, SC, a month of decorations and events across the city. Santee Cooper transferred nearly 800 acres, including Lake Busbee, to Conway in 2025, and the city plans new trails, an inland beach and a revitalized Riverwalk there.`) +
    facts("conway", [["tax", `The city tax is high: about ${usd(Math.round(per100k("conway")))} a year on each $100,000 of value, against about ${usd(Math.round(per100k("longs")))} outside the towns.`],
      ["flood", `The river reached major flood stage 6 times from 2015 through 2025. The first streets to flood are low ones near Crabtree Swamp, such as Long Avenue and Sherwood Drive. About 95 in 100 homes in the city are outside both FEMA's high-risk zone and the land Florence's water reached.`]]) +
    money("conway", `At about ${price("conway")}, a typical house in Conway sold for the least of any place here.`),
    (bg) => h.cta("Want land, a newer house or a lower tax bill?", "Tell us which matters most. We plan a day of showings in two of these inland towns, so you see both before you choose.", "Have us plan a showing day", CONTACT, bg)),

  entry("north-myrtle-beach",
    h.p(`About 3 in 4 houses for sale in ${townLink("north-myrtle-beach", "North Myrtle Beach")} are within a mile of the beach. Ocean Drive has Main Street, McLean Park with its lake, and the Ingram Dunes Nature Preserve, which the city calls its last maritime forest.`) +
    h.p(`From June through September, the city holds free Music on Main concerts every Thursday evening at the Horseshoe on Main Street. At Fat Harold's Beach Club, a DJ plays beach music every night from 7, and couples take shag lessons on Monday nights. Three times a year, for the Society of Stranders, thousands of shag dancers fill the clubs on Main Street.`) +
    h.p(`The state Senate calls North Myrtle Beach the home of the shag, South Carolina's state dance. At Cherry Grove, at the north end, about 680 houses sit on dug channels and the marsh edge. The city's boat ramp there reaches the ocean through Hog Inlet.`) +
    PH["north-myrtle-beach"] +
    h.p(`From the city's boat ramp on 53rd Avenue North, you can paddle a kayak about a mile and a half through Hog Inlet, past pelicans and ospreys, to the empty beach on Waties Island. There you can walk the shore looking for shells and fossil shark teeth.`) +
    h.p(`Our clients from New York bought beachfront here near the waterway, so they could finally use their boat.`) +
    h.p(`On the county's tax rolls, about half the houses here are someone's main home. The rest are taxed as second homes or rentals.`) +
    money("north-myrtle-beach", `Count on about ${price("north-myrtle-beach")} for a typical house. About half the houses for sale list no HOA fee.`)),

  entry("carolina-forest",
    h.p(`Half the homes in ${townLink("carolina-forest", "Carolina Forest")} were built in 2007 or later, the newest of any place here. Under 1 percent of its houses are in FEMA's high-risk flood zone.`) +
    h.p(`Just north of Carolina Forest, the state's Lewis Ocean Bay Heritage Preserve holds the largest group of Carolina bays in South Carolina, and it is open to the public. Wild Venus flytraps grow there and bloom in early June, and Horry is the only county in South Carolina where they still grow naturally. The preserve also has black bears, bald eagles, red-cockaded woodpeckers and pitcher plants.`) +
    PH["carolina-forest"] +
    h.p(`It is a large planned area of neighborhoods outside the city limits, with a Myrtle Beach address. McLeod Health cut the ribbon on a new hospital here in August 2026. Off River Oaks Drive, the county's Bike and Run Park, which riders call "The Hulk", has 7 miles of mountain bike and running trails on about 70 acres.`) +
    h.p(`Nearly every house for sale in the Carolina Forest ZIP code lists an HOA fee, about $125 a month in a typical listing. Almost none of the houses for sale here are listed as open to nightly rentals.`) +
    money("carolina-forest", `The middle sale here in the past year was about ${price("carolina-forest")}.`)),

  entry("myrtle-beach",
    h.p(`From a typical house in ${townLink("myrtle-beach", "Myrtle Beach")}, the beach, the airport and Coastal Grand Mall are each about 15 minutes or less by car. Pine Lakes Country Club, which opened in 1927, was the city's first golf course.`) +
    PH["myrtle-beach"] +
    h.p(`The Market Common is a town center with shops, restaurants and a movie theater, and apartments above the stores. Grand Park and Valor Park are next to the shops, with a lake and a path around it, sports fields and a playground. Our ${h.a("/submarkets/myrtle-beach/market-common/", "Market Common guide")} has each neighborhood's homes, prices and HOA fees.`) +
    h.p(`Myrtle Beach State Park, the first state park in South Carolina to open, in 1936, keeps a mile of undeveloped beach with a forest of live oaks and magnolias behind the dunes.`) +
    h.p(`On summer Wednesdays, people bring lawn chairs to Plyler Park on Ocean Boulevard for free live music from 6 to 8, then stay for fireworks at 9. After the summer season, from September to May 1, you can ${h.a("/buyers/relocating/beaches/", "walk a leashed dog or ride a bike on the beach")} and the boardwalk at any hour.`) +
    facts("myrtle-beach", [["town", `A city resident's parking decal costs nothing, and it covers parking at the city's meters and pay stations.`],
      ["key", `Nearly every house in the city is outside the zones that allow rentals under 90 days.`]]) +
    money("myrtle-beach", `Half the houses in the city sold for more than ${price("myrtle-beach")}, and half for less.`),
    (bg) => h.cta("Is the house you like inside the city?", "Send us the address. We tell you which side of the city line it is on, and what that changes: the tax, the trash pickup, the parking decal and the rental rule.", "Ask us about an address", CONTACT, bg)),

  entry("socastee",
    h.p(`Socastee began in the late 1800s as a lumber and turpentine camp. Its old swing bridge, built in the mid-1930s, carries Dick Pond Road over the Intracoastal Waterway. The bridge, two houses, a store and a pecan grove make up a historic district on the National Register.`) +
    h.p(`The bridge still turns on its pier to let tall boats pass, and the Netflix show Outer Banks booked it on four different days to film a scene. Each April, Socastee holds its Heritage Festival at the Sarvis House on Peachtree Road, next to the bridge, with a classic car show, live music on two stages and food trucks.`) +
    h.p(`South of Socastee, Freewoods Farm is a 40-acre working farm museum run with mules, not tractors, and each November its cane is pressed into syrup in a mule-powered mill.`) +
    PH.socastee +
    h.p(`A house here costs about what it does in Longs, but Socastee is much closer to the beach and the airport. The beach, the airport and Coastal Grand Mall are each about 15 minutes or less from a typical house.`) +
    facts("socastee", [["flood", `About 1 in 9 houses here are in FEMA's high-risk flood zone, more than twice the share in Conway or Myrtle Beach. We check the zone for each house.`]]) +
    money("socastee", `That is about ${price("socastee")} for a typical house in Socastee.`)),

  entry("surfside-beach",
    h.p(`In ${townLink("surfside-beach", "Surfside Beach")}, a typical house is about ${beach("surfside-beach")} minutes by car from the sand, the closest of any place here. Every home in the town is less than a mile from Ocean Boulevard, the beach road.`) +
    PH["surfside-beach"] +
    h.p(`The town's new concrete pier opened in 2024. Walking on it is free, and it has two restaurants, an ice cream shop and a bait shop.`) +
    h.p(`On summer Monday nights, you carry a beach chair down to the sand by the pier and watch fire dancers spin flaming knives, in a free show the town puts on. On one December night, the town runs free trolleys around Surfside Beach to see the Christmas lights, with hot cocoa while you wait in Memorial Park.`) +
    h.p(`The town runs a farmers market in Memorial Park every Tuesday from April to mid-December, 10 a.m. to 3 p.m., with local produce, eggs and honey. From mid-September to mid-May, you can surf anywhere on the town's beach from sunup to sundown, except within 300 feet of the pier.`) +
    h.p(`Fewer than half the houses here are taxed as someone's main home. Along the ocean, only about 1 in 8 homes is. On many inland streets, about 7 in 10 are.`) +
    facts("surfside-beach", [["flood", `About 3 in 10 houses here are inside FEMA's high-risk flood zone, so we check each one.`]]) +
    money("surfside-beach", `At about ${price("surfside-beach")}, a typical house here sold for the most of any place on this page.`),
    (bg) => h.cta("Found a house near the beach?", "Send us the house. We check its flood zone and what a flood policy costs there before you make an offer.", "Have us check the flood zone", CONTACT, bg)),

  entry("garden-city",
    h.p(`${townLink("garden-city", "Garden City")} is a strip of beach houses between the ocean and the salt marsh. Its pier is 668 feet long, and in summer bands play every night at both ends, weather permitting. A pier pass covers fishing, with no state fishing license needed on the pier.`) +
    PH["garden-city"] +
    h.p(`From November through February, the county lets golf carts drive on its beach here, with a state permit and a licensed driver.`) +
    h.p(`From a dock on the marsh, you can tie a chicken neck to a string and pull up blue crabs for dinner, and with three or fewer drop nets, fold-up traps or hand lines you need no license.`) +
    h.p(`Every Fourth of July afternoon, decorated golf carts drive the "wet" parade while people along the route soak them with water guns. At the inlet end of Waccamaw Drive, people go up to the rooftop deck of Gulfstream Cafe to watch the sun set over the water. Parking is free all year at every oceanfront beach access Horry County runs in Garden City.`) +
    money("garden-city", `Houses in Garden City sold for about ${price("garden-city")} at the middle, about ${GC_GAP} less than in Surfside Beach, the next place north.`)),

  entry("murrells-inlet",
    h.p(`The ${townLink("murrells-inlet", "Murrells Inlet")} on this page is the part in Georgetown County, south of the county line. Houses on the creek side of Business 17 have docks over the marsh.`) +
    PH["murrells-inlet"] +
    h.p(`The MarshWalk is a half-mile wooden boardwalk along the marsh, with restaurants and free live music. A hospital is about ${hosp("murrells-inlet")} minutes from a typical house, the closest of any place here.`) +
    h.p(`The inlet's name for good cooking is older than the MarshWalk: in the 1800s, summer people came by river steamboat, and many of the steamboat cooks stayed. From the day after Thanksgiving to New Year's Eve, every restaurant along the MarshWalk is outlined in lights that play in time to Christmas music, on the hour and the half hour from 5 to 11 p.m.`) +
    h.p(`Since 1983, decorated boats have paraded on July 4 from the south end of Garden City Beach up the creek in front of the MarshWalk. On the creek side stands the Hermitage, where the inlet's well-known ghost story is set. The story goes that Alice Flagg is still seen at the front door in a white dress, looking for the engagement ring her brother threw into the marsh.`) +
    facts("murrells-inlet", [["tax", `Sales tax here is 7 percent, against 8 percent in Horry County.`]]) +
    money("murrells-inlet", `The middle sale here was about ${price("murrells-inlet")}. A house here also costs the most of any place on this page to keep each year.`)),

  entry("pawleys-litchfield",
    h.p(`The Town of ${townLink("pawleys-litchfield", "Pawleys Island")} is the island itself, a town of its own since 1985. The mainland around it with a Pawleys Island address is county land, and so is Litchfield.`) +
    h.p(`The town says people who come back year after year feel "their blood pressure goes down when they cross the causeway." In 2012, the island house called Liberty Lodge marked 100 years in one family. Islanders tell of the Gray Man, a figure in a long gray coat said to walk the beach before a big hurricane to warn people to leave.`) +
    h.p(`A sea turtle group formed for Pawleys in 1990 walks the beach at dawn every day from May until the last nest hatches. At the town's Fourth of July parade, prizes go to floats, golf carts, decorated houses and docks.`) +
    PH["pawleys-litchfield"] +
    h.p(`Near Litchfield, the road into Huntington Beach State Park crosses a causeway between the marsh and a freshwater lake, and more than 300 kinds of birds have been seen in the park.`) +
    h.p(`The island has about 480 houses, and they rarely sell: only 10 changed hands at a market price in the past year. Every island house but one is in FEMA's high-risk flood zone. Across the whole area, about a third of houses are, the highest share on this page.`) +
    money("pawleys-litchfield", `Across the island, the mainland and Litchfield, the middle sale was about ${price("pawleys-litchfield")}, and nearly all of those sales were off the island. On the island itself, the middle sale over the last three years was about $2.45 million.`)),
];
must(A["pawleys-litchfield"].pct_high_risk_flood === Math.max(...ORDER.map((s) => A[s].pct_high_risk_flood)), "[5] Pawleys no longer has the highest flood share");

must(A.conway.yearly_besides_mortgage - A["little-river"].yearly_besides_mortgage < 50, "[15] Conway's yearly cost is no longer close to Little River's");

/* ---------- side by side: price and the yearly cost (rows 1, 15, 16) ---------- */
const PRICE_CHART = G.bars([...ORDER].sort((x, y) => A[y].median_sale - A[x].median_sale).map((s) => ({
  name: `${A[s].n}. ${short(s)}`, value: A[s].median_sale, valueText: price(s), feature: `about ${yearly(s)} a year` })),
  { caption: "A typical house: what it sold for, and what it costs each year besides the mortgage", nameLabel: "Place", featureLabel: "each year, besides the mortgage", valueLabel: "typical sale price",
    compact: true, phoneList: true,
    note: "Detached houses, not condos or townhouses, sold in the year to September 2026. The cost each year is for a house you live in, outside the flood zone: the tax, the county fee, insurance, the HOA fee and upkeep." });
/* The table adds what the chart does not show (rows 5, 17): the drives, a hospital and the flood share (compareCards
   takes four columns; the lot moved out for the hospital, and the entries carry it).
   Fix round 1: the hospital column for all 13 (the reader's question). Row 17's verifier: name the hospital set; the
   minutes are to the nearest of the five in drives.json, and every place rounds the same with the two he added. */
const acres = (v) => (v >= 0.95 ? "about 1 acre" : `${v.toFixed(2).replace(/0$/, "")} acre`);
must(acres(A.aynor.median_lot_acres) === "about 1 acre" && acres(A.loris.median_lot_acres) === "0.8 acre" && acres(A["surfside-beach"].median_lot_acres) === "0.17 acre", "[7] the lot sizes print differently");
const TABLE = compareCards(ORDER.map((s) => ({ name: `${A[s].n}. ${short(s)}`, cells: {
  beach: `${beach(s)} min`, airport: `${airport(s)} min`, hospital: `${hosp(s)} min`, flood: A[s].pct_high_risk_flood < 1 ? "under 1%" : `${Math.round(A[s].pct_high_risk_flood)}%` } })),
  [{ key: "beach", label: "To the beach", num: true }, { key: "airport", label: "To the airport", num: true }, { key: "hospital", label: "To a hospital", num: true }, { key: "flood", label: "In a flood zone", num: true }],
  { caption: "The 13 places side by side: minutes by car from a typical house, and the share of houses in FEMA's high-risk flood zone", nameLabel: "Place" });
must(hosp("pawleys-litchfield") === 20 && hosp("aynor") === 30 && ORDER.filter((s) => !["pawleys-litchfield", "aynor"].includes(s)).every((s) => A[s].minutes_hospital < 15), "[17] the hospital minutes no longer round as row 17 says");

/* The worked example (rows 9, 10, 14, 15, 16). */
const card = (s, sub) => { const y = A[s].f.yearly_besides_mortgage;
  return `<div><h3>${short(s)}</h3><p class="s">${sub}</p><dl>`
    + `<dt>Tax, as your home</dt><dd>${usd(Math.round(y.tax / 10) * 10)}</dd>`
    + `<dt>County fee</dt><dd>${y.fee ? usd(y.fee) : "none"}</dd>`
    + `<dt>Insurance</dt><dd>${usd(y.insurance)}</dd>`
    + `<dt>HOA fee</dt><dd>${y.hoa ? usd(y.hoa) : "none"}</dd>`
    + `<dt>Upkeep</dt><dd>${usd(Math.round(y.upkeep / 100) * 100)}</dd>`
    + `<dt class="t">Total a year</dt><dd class="t">${yearly(s)}</dd></dl></div>`; };
const EXAMPLE = `<div class="c3t-ex">` + card("longs", `Typical house: about ${price("longs")}`) + card("north-myrtle-beach", `Typical house: about ${price("north-myrtle-beach")}`) + `</div>`;
/* The beach-house example (rows 6, 12, 15): Surfside's total with insurance at the top quarter's $3,000 and a FEMA
   flood policy at the middle for zone A or AE. */
const SURF_TOP = usd(Math.round((A["surfside-beach"].yearly_besides_mortgage + (3000 - INS) + 1070) / 100) * 100);
must(SURF_TOP === "$10,400", "[6, 12, 15] the Surfside beach-house example moved");
/* The homestead exemption (retirees rows 19 and 23): the tax on the first $50,000 of value, half of each $100,000 rate. */
const HOMESTEAD = (s) => usd(Math.round(per100k(s) / 2 / 10) * 10);
must(HOMESTEAD("longs") === "$180" && HOMESTEAD("conway") === "$330", "[retirees 19, 23] the homestead saving moved");

/* Tax a year on each $100,000 of value, as your home (row 10). */
const TAX_ROWS = [
  ["Outside the towns, Horry County", per100k("longs"), "plus a fee of about $89 on most bills"],
  ["Garden City", per100k("garden-city"), "plus a fee of about $89 on most bills"],
  ["Myrtle Beach", per100k("myrtle-beach"), "no county fee"],
  ["Surfside Beach", per100k("surfside-beach"), "plus an $82 fee"],
  ["North Myrtle Beach", per100k("north-myrtle-beach"), "no county fee"],
  ["Pawleys Island and Litchfield", per100k("pawleys-litchfield"), "plus a $96 or $44 fee"],
  ["Murrells Inlet", per100k("murrells-inlet"), "plus a $96 fee"],
  ["Conway", per100k("conway"), "no county fee"],
  ["City of Loris", LORIS_CITY, "no county fee"],
];
must(TAX_ROWS.every((r, i) => i === 0 || r[1] >= TAX_ROWS[i - 1][1]), "[10] the tax rows are no longer in order");
must(A["surfside-beach"].f.fee_on_bill === 82 && A["myrtle-beach"].f.fee_on_bill === 0 && A["north-myrtle-beach"].f.fee_on_bill === 0 && A.conway.f.fee_on_bill === 0, "[10] a fee changed");
const TAX_CHART = G.bars(TAX_ROWS.map(([n, v, fee]) => ({ name: n, value: v, valueText: usd(Math.round(v)), feature: fee, reference: n.startsWith("Outside") })),
  { caption: "Property tax a year on each $100,000 of value, on a home you live in", nameLabel: "Where the house is", featureLabel: "fee on the bill", valueLabel: "tax a year",
    compact: true, phoneList: true,
    note: "Horry County's tax rates and bills for 2026. Pawleys Island, Litchfield and Murrells Inlet: Georgetown County's current estimate. Before the tax break at 65, below the chart." });

/* City or county (rows 19, 20, 22, 23). */
const CITY_TABLE = compareCards([
  { name: "Trash and recycling", cells: { in: "The town's service, where it has one", out: "Horry: a hauler or drop-off center" } },
  { name: "Sales tax", cells: { in: "9% Myrtle Beach; 8% Horry; 7% Pawleys", out: "8% in Horry, 7% in Georgetown" } },
  { name: "Renting by the night", cells: { in: "Each town's own rule, below", out: "Horry: no limit. Georgetown: one zone" } },
  { name: "Golf cart hours and streets", cells: { in: "Each town can set its own", out: "The county's rules, or the state's" } },
], [{ key: "in", label: "Inside a city or town" }, { key: "out", label: "Outside, in the county" }],
  { caption: "What changes at the city line", nameLabel: "What changes" });
/* The rental rule, place by place (row 23 at the verifier's wording; WTB rows 2, 5, 7, 8, 10; Surfside row 1). */
const RENT_RULES = `<ul class="c3t-facts" role="list">` + [
  ["Myrtle Beach", "most neighborhoods of houses are not zoned for rentals under 90 days."],
  ["North Myrtle Beach", "no special zoning or permit, beyond a yearly business license and the lodging taxes."],
  ["Surfside Beach", "stays under 30 days only in the zoning districts along the ocean."],
  ["Conway", "the code allows them in three downtown districts."],
  ["Outside the towns in Horry County", "zoning puts no limit on how long a home is rented."],
  ["Outside the towns in Georgetown County", "a tourist home only in the resort residential district, as a conditional use."],
].map(([w, t]) => `<li><span class="i">${icon("key", { size: 20 })}</span><span><b>${w}:</b> ${t}</span></li>`).join("") + `</ul>`;

/* ---------- styles ---------- */
const PAGE_CSS = "<style>"
  /* The picker (2026-11-08): the chips in two labelled rows across the top, then the map and the list side by side
     on a desktop; on a phone the map, the chips, then the list. */
  + "main#main .c3t-pick{display:grid;gap:1rem;max-width:1060px;margin:.8rem 0 .6rem;grid-template-areas:'map' 'chips' 'side'}"
  + "main#main .c3t-chips{grid-area:chips;display:grid;gap:.55rem}main#main .c3t-map{grid-area:map}main#main .c3t-side{grid-area:side;min-width:0}"
  + "main#main .c3t-chips[hidden],main#main .c3t-count[hidden],main#main .c3t-none[hidden],main#main .c3t-list li[hidden]{display:none}"
  + "main#main .c3t-row{display:grid;gap:.35rem .8rem;align-items:center}"
  + "main#main .c3t-lab{font-family:var(--sans);font-size:.82rem;font-weight:650;letter-spacing:.06em;text-transform:uppercase;color:#5c6670}"
  + "main#main .c3t-set{display:flex;flex-wrap:wrap;gap:.4rem}"
  + "main#main .c3t-chip{font-family:var(--sans);font-size:.95rem;line-height:1.2;color:var(--navy);padding:.4rem .8rem;min-height:44px;border-radius:999px;border:1px solid rgba(28,32,40,.2);background:rgba(255,255,255,.75);cursor:pointer}"
  + "main#main .c3t-chip[aria-pressed=true]{background:var(--navy);color:#fff;border-color:var(--navy)}"
  + "main#main .c3t-chip:focus-visible{outline:3px solid #c4783a;outline-offset:2px}"
  + "main#main .c3t-count,main#main .c3t-none{font-size:var(--read,1.0625rem);color:var(--navy);margin:0 0 .5rem;font-weight:600}"
  + "main#main .c3t-map figure{margin:0!important}main#main .c3t-map svg{border-radius:12px}"
  + "main#main .c3t-map [data-s]{transition:opacity .2s}main#main .c3t-map .off{opacity:.14}"
  + "main#main .c3t-list{list-style:none;margin:0;padding:0;display:grid;border-top:1px solid rgba(28,32,40,.12)}"
  + "main#main .c3t-list li{display:flex;gap:.75rem;align-items:center;margin:0;padding:.5rem .1rem;border-bottom:1px solid rgba(28,32,40,.12);color:var(--navy)}"
  + "main#main .c3t-list b{flex:0 0 auto;display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:50%;background:#1c2028;color:#fff;font-family:var(--sans);font-size:.9rem;font-weight:700}"
  + "main#main .c3t-list b::before{content:attr(data-n)}"
  + "main#main .c3t-list .t{display:flex;flex-direction:column;gap:.05rem;min-width:0}"
  + "main#main .c3t-list a.nm{color:var(--navy);font-weight:700;font-size:1.05rem;line-height:1.3;text-decoration:underline;text-decoration-color:rgba(28,32,40,.3);text-underline-offset:.18em}"
  + "main#main .c3t-list .bf{font-size:.97rem;line-height:1.35;color:#4a5560}"
  + "main#main .c3t-jump{font-size:1rem;line-height:1.6;color:var(--navy);margin:.9rem 0 0}main#main .c3t-jump a{color:var(--navy)}"
  + "main#main .c3t-note{font-size:.95rem;color:#4a5560;line-height:1.5;margin:.7rem 0 0;max-width:720px}"
  + "@media (min-width:600px){main#main .c3t-row{grid-template-columns:6.2rem minmax(0,1fr)}}"
  + "@media (max-width:599px){main#main .c3t-chip{font-size:.9rem;padding:.4rem .68rem}}"
  + "@media (min-width:900px){main#main .c3t-pick{grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);grid-template-areas:'chips chips' 'map side';gap:1.3rem 2.2rem;align-items:start}main#main .c3t-map{position:sticky;top:6rem}}"
  + "main#main .c3t-facts{list-style:none;margin:.4rem 0 1rem;padding:0;display:grid;gap:.5rem;max-width:720px}"
  + "main#main .c3t-facts li{display:flex;gap:.7rem;align-items:flex-start;padding:.65rem .85rem;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.06);color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.5;margin:0}"
  + "main#main .c3t-facts .i{flex:0 0 auto;display:inline-flex;color:var(--brass);margin-top:.15rem}"
  + "main#main .c3t-money{max-width:720px;margin:1rem 0 .3rem;padding:.9rem 1.1rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,none),var(--g-sh,none);color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.55}"
  + "main#main .c3t-money p{margin:0}main#main .c3t-money .c3-offer{margin:.7rem 0 0}"
  + "main#main .c3t-ex{display:grid;gap:1rem;max-width:900px;margin:1.2rem 0 1rem}@media (min-width:760px){main#main .c3t-ex{grid-template-columns:1fr 1fr}}"
  + "main#main .c3t-ex>div{padding:1.1rem 1.2rem 1rem;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,none),var(--g-sh,none)}"
  + "main#main .c3t-ex h3{font-family:var(--sans);font-size:1.15rem!important;font-weight:650;color:var(--navy);margin:0 0 .2rem!important}main#main .c3t-ex .s{color:#4a5560;margin:0 0 .7rem;font-size:1rem}"
  + "main#main .c3t-ex dl{margin:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:.35rem 1rem;font-size:var(--read,1.0625rem);color:var(--navy)}main#main .c3t-ex dt{color:#4a5560}main#main .c3t-ex dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}"
  + "main#main .c3t-ex dt.t,main#main .c3t-ex dd.t{border-top:1px solid rgba(28,32,40,.18);padding-top:.45rem;font-weight:650;color:var(--navy)}"
  + "@media (prefers-reduced-transparency:reduce){main#main .c3t-money,main#main .c3t-ex>div,main#main .c3t-facts li{background:#fbf8f3}}"
  /* The end offer band stays a dark panel when the live site's listing notice follows it (as /invest/where-to-buy/, its NEEDS 8). */
  + "main#main>section[style^=\"background:var(--navy)\"][style]:not(:has(~section)){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"][style]:not(:has(~section))>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;width:calc(100% - 32px);box-sizing:border-box;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"][style]:not(:has(~section))>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}"
  + "h1.detail-h1,main#main h2,main#main h3,main#main .btn,main#main .c3-offer a.c3-offer-pill{text-wrap:balance}"
  /* Redesign 2026-11-07. 1: the photo beside the text on a desktop. 2: no card frame around a photo.
     3: fact lines and the price line without boxes; the offer cards are the only cards left in an entry.
     (The place list and the chips: the picker rules above, 2026-11-08.) */
  + "main#main .c3t-pic .c3-aerial figure.c3ph-hero{background:none;border:0;box-shadow:none;padding:0;border-radius:0;max-width:720px;margin:1.3rem 0 1.6rem}"
  + "main#main .c3t-pic .c3ph-f{border-radius:10px;overflow:hidden}"
  + "main#main .c3t-pic figcaption{margin-top:.5rem;padding:0}"
  + "@media (min-width:1080px){" + ORDER.map((s) => `main#main section#${s}>.wrap`).join(",") + "{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,min(440px,38%));column-gap:3rem;align-items:start}"
  + ORDER.map((s) => `main#main section#${s}>.wrap>*{grid-column:1}main#main section#${s}>.wrap>h2{grid-column:1/-1}`).join("")
  + ORDER.map((s) => `main#main section#${s}>.wrap{grid-template-rows:auto${" auto".repeat(LEADS[s])} 1fr}`).join("")
  + "main#main .c3t-pic{grid-column:2!important}main#main .c3t-pic .c3-aerial figure.c3ph-hero{margin:.4rem 0 0}main#main .c3t-rest>:last-child{margin-bottom:0}}"
  + "main#main .c3t-facts{gap:.75rem;margin:.6rem 0 1.1rem}"
  + "main#main .c3t-facts li{background:none;border:0;box-shadow:none;border-radius:0;padding:0}"
  + "main#main .c3t-money{background:none;border:0;border-top:1px solid rgba(28,32,40,.16);border-radius:0;box-shadow:none;padding:1.1rem 0 0;margin:1.4rem 0 0}"
  /* 2026-11-08: the homes strip in each entry sits quietly: smaller cards than the edge's default (about three in
     view beside the photo on a desktop, one and a half on a phone), and smaller type. The edge's look otherwise. */
  + "main#main .c3t-money .hx-strip{margin:1rem 0 .1rem}main#main .c3t-money .hx-s-head{font-size:.9rem;margin-bottom:.45rem}"
  + "main#main .c3t-money .hx-s-row>.hx-c{flex-basis:min(62%,13rem)}main#main .c3t-money .hx-c-body{padding:.5rem .7rem .6rem}"
  + "main#main .c3t-money .hx-c-price{font-size:1.08rem}main#main .c3t-money .hx-c-facts{font-size:.84rem}main#main .c3t-money .hx-c-addr{font-size:.8rem}"
  + "main#main .c3t-money .hx-c-firm{font-size:.66rem;margin-top:.3rem}main#main .c3t-money .hx-c .hx-heart{width:2.2rem;height:2.2rem}main#main .c3t-money .hx-c .hx-heart svg{width:22px;height:22px}"
  + "main#main .c3t-money .hx-c-tag,main#main .c3t-money .hx-c-miles{font-size:.7rem}"
  + "</style>";

/* ---------- sources ---------- */
const S = {
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType",
  parcels: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  gtGis: "https://gis1.georgetowncountysc.org/portal/home/",
  fema: "https://msc.fema.gov/portal/home",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  gtTax: "https://www.gtcountysc.gov/385/Property-Tax-Calculator",
  acs: "https://data.census.gov/table/ACSDT5Y2024.B25035",
  st500: "https://dor.sc.gov/sites/dor/files/forms/ST500.pdf",
  swa: "https://www.solidwasteauthority.org/recyclingcenters.html",
  sc56: "https://www.scstatehouse.gov/code/t56c002.php",
  decal: "https://cityofmyrtlebeach.com/services/parking_meters/index.php",
  bridge: "https://projectportal.scdot.org/sc-historic-bridges/s-616-bridge-over-intercoastal-waterway-horry-county",
  parks: "https://www.horrycountysc.gov/departments/parksandrecreation/parks",
  nfip: "https://www.fema.gov/openfema-data-page/nfip-redacted-policies-v3",
};

/* 2026-11-08: the sources of each entry's selling lines (facts.md "Town selling lines" and "round 2"). They sit under
   the sources line, in the same small print, because mkpage caps the sources line at 90 words. A div, so the score's
   FAQ reader does not count it in the last answer. */
const TOWN_SOURCES = [
  ["Loris", [["history", "https://www.myhorrynews.com/news/as-loris-prepares-to-turn-120-longtime-residents-plan-birthday-party/article_09e1e394-05d0-11ed-9015-8f05c118a25b.html"], ["Bog-Off", "https://cityoflorissc.com/about-us"], ["Cartwheel Bay", "https://www.sctrails.net/trails/trail/cartwheel-bay-heritage-preserve"], ["where it is", "https://www.myhorrynews.com/news/cartwheel-bay-heritage-preserve-could-get-big-expansion/article_5db6c066-806f-11ec-bc7a-33a0794f9a5f.html"]]],
  ["Aynor", [["the Stump", "https://scencyclopedia.org/sce/entries/galivants-ferry-stump-meeting/"], ["AP", "https://newschannel9.com/news/nation-world/biden-other-hopefuls-set-for-down-home-southern-politics"], ["Little Pee Dee", "https://dnr.sc.gov/water/river/scenic/littlepeedee.html"], ["river trail", "https://www.sctrails.net/trails/trail/little-pee-dee"], ["Southern Palmetto Farms", "https://southernpalmettofarms.com/"]]],
  ["Longs", [["the Waccamaw", "https://www.myhorrynews.com/news/winding-waterway-how-the-waccamaw-river-is-cared-for-in-horry-county/article_ee3c64c0-7739-11ee-b1ab-a3f946580104.html"], ["Blue Trail", "https://www.postandcourier.com/myrtle-beach/news/scdnr-looks-to-purchase-350-acres-near-longs-to-add-to-existing-nature-preserve/article_ce4a62fa-23e5-11ed-a611-3bdca546f6ce.html"], ["the preserve", "https://sctrails.net/trails/trail/waccamaw-river-heritage-preserve-canoe"], ["Long Bay Club", "https://www.longbaygolfclub.com/"]]],
  ["Little River", [["Washington", "https://www.myhorrynews.com/opinion/yes-president-george-washington-did-sleep-in-horry-county/article_2f0b6f46-1e58-11ed-97e3-9fb8590a30fd.html"], ["ShrimpFest", "https://littlerivershrimpfest.org/"], ["Waties Island", "https://www.postandcourier.com/myrtle-beach/news/waties-island-state-park-myrtle-beach-sc/article_dabee2b9-aede-4253-84b1-fdec1edc667d.html"], ["Glen Dornoch", "https://www.glendornoch.com/"]]],
  ["Conway", [["the oaks", "https://scliving.coop/sc-life/sc-life-features/10-reasons-to/"], ["Riverfest", "https://www.conwayriverfest.com/"], ["Riverfest 2026", "https://www.wmbfnews.com/2026/06/26/conway-riverfest-returns-46th-year-with-250th-celebration-twist/"], ["Halloween, SC", "https://www.conwaysc.gov/news_detail_T6_R746.php"], ["Lake Busbee", "https://www.conwaysc.gov/news_detail_T6_R665.php"]]],
  ["North Myrtle Beach", [["Music on Main", "https://parks.nmb.us/385/Music-on-Main-Concert-Series"], ["Fat Harold's", "https://www.fatharolds.com/"], ["SOS", "https://www.fatharolds.com/sos-2/"], ["Waties Island by kayak", "https://www.myhorrynews.com/news/getting-off-the-beaten-path-at-inlet-plantation-stables-and-waties-island/article_d1d46858-b162-4b95-9f7b-10f8081e6159.html"]]],
  ["Carolina Forest", [["Lewis Ocean Bay", "https://www.dnr.sc.gov/news/2025/Jun/jun10-lewisoceanbay.php"], ["flytraps", "https://www.myhorrynews.com/news/horry-county-is-home-to-the-states-only-natural-habitat-of-the-famous-venus-flytrap/article_ddab09ed-befb-4fa7-8ce2-18f89401bd09.html"], ["the preserve", "https://www.postandcourier.com/myrtle-beach/news/lewis-ocean-bay-heritage-preserve-expands-sc/article_4f28e15a-6347-4595-b367-537941f62599.html"], ["Bike and Run Park", "https://www.sctrails.net/trails/trail/horry-county-bike-run-park-the-hulk"]]],
  ["Myrtle Beach", [["state park", "https://southcarolinaparks.com/myrtle-beach/unique-features"], ["Hot Summer Nights", "https://www.cityofmyrtlebeach.com/news_detail_T6_R2620.php"], ["off-season beach rules", "https://www.cityofmyrtlebeach.com/news_detail_T6_R2685.php"]]],
  ["Socastee", [["Outer Banks", "https://www.myhorrynews.com/entertainment/outer-banks-will-try-again-to-film-at-socastee-swing-bridge/article_bbb94f8b-f19c-45e8-99b0-5b5c990dc12c.html"], ["Heritage Festival", "https://www.wfxb.com/?p=4220266"], ["Freewoods Farm", "https://discoversouthcarolina.com/articles/living-history-at-freewoods-farm"]]],
  ["Surfside Beach", [["fire dancers", "https://www.surfsidebeach.org/322/Surfside-Beach-Hula-Fire-Dancer-Show"], ["trolleys", "https://www.surfsidebeach.org/345/Trolley-of-Christmas-Lights"], ["farmers market", "https://www.surfsidebeach.org/325/Surfside-Beach-Farmers-Market"], ["surfing rules", "https://www.surfsidebeach.org/204/Swimming-Surfing-Safety"]]],
  ["Garden City", [["crabbing", "https://www.dnr.sc.gov/fish/swfaqs.html"], ["golf cart parade", "https://www.myrtlebeachareacvb.com/news/myrtle-beach-lights-up-july-4th-with-fireworks-festivals-and-family-fun"], ["Gulfstream Cafe", "https://gulfstreamcafe.com/"], ["beach accesses", "https://www.horrycountysc.gov/departments/parksandrecreation/beach-accesses/"]]],
  ["Murrells Inlet", [["history", "https://marshwalk.com/history/"], ["lights", "https://marshwalk.com/calendar/wonderland-of-lights-on-the-marshwalk/"], ["boat parade", "https://www.postandcourier.com/georgetown/news/murrells-inlet-annual-july-4-boat-parade/article_37c4a398-34c5-11ef-8dbf-c31e944fd066.html"]]],
  ["Pawleys Island", [["about the island", "https://www.townofpawleysisland.com/about-pawleys-island/"], ["the Gray Man", "https://www.scetv.org/stories/2018/ghosts-and-legends-gray-man-and-hurricanes"], ["SCUTE", "https://www.townofpawleysisland.com/s-c-u-t-e/"], ["parade", "https://www.townofpawleysisland.com/fourth-of-july-parade/"], ["Huntington Beach State Park", "https://southcarolinaparks.com/huntington-beach"]]],
];
const LINK = 'style="color:var(--navy);text-decoration:underline" target="_blank" rel="noopener noreferrer"';
const TOWN_SRC = () => `<div style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:.6rem"><strong style="color:var(--navy)">Sources by town:</strong> `
  + TOWN_SOURCES.map(([t, ls]) => `${t}: ` + ls.map(([n, u]) => `<a href="${u}" ${LINK}>${n}</a>`).join(", ")).join(". ") + `.</div>`;

const ITEMLIST = () => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList",
  name: "Thirteen places to live near Myrtle Beach, compared", numberOfItems: ORDER.length,
  itemListElement: ORDER.map((s) => ({ "@type": "ListItem", position: A[s].n, name: nm(s), url: `https://chapter3realty.com${SELF}#${s}` })) })}</script>`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Relocating", url: "/buyers/relocating/" },
  pageImages: () => ph.pageImages(),
  title: "Where to Live Near Myrtle Beach: 13 Towns Compared | Chapter3",
  description: "13 towns near Myrtle Beach, compared from county records: minutes to the beach, lot size, new houses, flood zones, the yearly cost and the rules.",
  ogTitle: "Which Grand Strand town fits you? Thirteen places near Myrtle Beach: the sand, the land, new houses and the rules",
  crumb: "Which Town",
  eyebrow: "13 places, from county records",
  h1: "Which Grand Strand town fits you?",
  h1em: "13 places near Myrtle Beach, compared.",
  sub: "From Loris to Pawleys Island: where the sand is closest, where an acre is normal, where builders are selling, and what changes at the city line.",
  heroCta: { title: "Want a short list of towns that fit your budget?", label: "Have us build your shortlist", href: CONTACT },
  toc: false,
  author: "devin",
  shortAnswer: [
    `Where to live near Myrtle Beach depends on what you want most. Closest to the sand: Surfside Beach, Garden City and North Myrtle Beach. The most land: Aynor and Loris. The newest houses: Carolina Forest and Longs. The shortest drive to everything: Myrtle Beach and Socastee. The lowest prices: Conway, Loris, Longs and Socastee.`,
    `Pick the one or two things that matter most to you. The list below keeps only the places that have them.`,
  ],
  sections: [
    { h2: "Which town near Myrtle Beach fits what you want?", toc: "Find your town", id: "find-your-town", html: (bg) =>
      PAGE_CSS + ph.css() + G.homesCss() +
      h.p(`Each place here leads on something different: the sand, the land, newer houses or a short drive. Tap what matters to you, and the list keeps only the places that fit. Each name jumps to its entry below.`) +
      h.p(`A typical house, on this page, is the one in the middle. Half the houses sold for more and half for less, or half are closer to the beach and half farther.`) +
      h.p(`If you have children, our page on ${h.a("/buyers/relocating/schools/", "how school zones work here")} shows how to check the school for an address.`) +
      GUIDE + GUIDE_JS },
    ...ENTRIES,
    { h2: "How do the towns compare on price and the cost to keep a house?", toc: "Compare", id: "compare", html: (bg) =>
      h.p(`The chart puts what a typical house sold for beside what it costs each year, besides the mortgage. The next section shows where that yearly cost comes from.`) +
      PRICE_CHART +
      h.p(`The table adds the drives and the flood zone. The lot sizes are in the entries for Loris and Aynor. Drive minutes are with no traffic; summer traffic on US 17 adds time.`) +
      TABLE +
      `<p class="c3t-note">A hospital here is the nearest of Grand Strand Medical Center, Conway Medical Center, McLeod Health Loris, McLeod Health Seacoast and Tidelands Waccamaw Community Hospital.</p>` +
      h.cta("Narrowed it to two or three?", "Tell us which places and your budget. We send houses for sale in those places, with the flood zone, the tax and the HOA fee for each.", "Send us your towns", CONTACT, bg) },
    { h2: "What does a house cost to keep each year besides the mortgage?", toc: "Yearly cost", id: "yearly-cost", html: (bg) =>
      h.p(`For a typical house, about ${yearly("loris")} to ${yearly("murrells-inlet")} a year, as your home and outside the flood zone. That spread is much smaller than the spread in price.`) +
      h.p(`Take two places. A typical house in North Myrtle Beach sold for nearly twice what one in Longs did. Each year it costs only about ${GAP_TXT} more to keep.`) +
      EXAMPLE +
      h.p(`Two things keep the gap small:`) +
      facts("yearly", [["tax", `A home you live in is taxed on 4 percent of its value, not 6 percent, and most of the school tax comes off its bill.`],
        ["home", `North Myrtle Beach has a low city tax rate, and about half its houses for sale have no HOA fee.`]]) +
      h.p(`Two things can widen it, and both matter most near the beach:`) +
      facts("yearly2", [["dollar", `Insurance. The cards use about ${usd(INS)}, the middle that Horry County owners pay for a house; half pay between about $1,300 and $3,000. East of US 17, or of Bypass 17 where it runs farther west, an insurer may leave wind and hail out. You can buy that cover separately.`],
        ["flood", `Flood insurance. Among Horry County owners who carry a FEMA flood policy on the house they live in, the middle policy costs about $1,070 a year in the A zones. Those are FEMA's high-risk zones where big storm waves are not expected. Outside the high-risk zones it is about $550.`]]) +
      h.p(`Near the beach, both can apply. A typical Surfside Beach house in the high-risk flood zone, with a $3,000 insurance bill, costs about ${SURF_TOP} a year to keep instead of ${yearly("surfside-beach")}. If you buy with us, we get you an insurance quote for the address before you make an offer.`) +
      h.p(`Our ${h.a("/buyers/cost-to-own/", "cost to own")} page breaks down every part.`) +
      h.cta("Want the yearly cost of one house?", "Send us a house you like. We work out its tax for that address, its HOA fee, its flood zone and the insurance quotes, so you know the year's cost before you offer.", "Have us price a house's yearly cost", CONTACT, bg) },
    { h2: "What changes when a house is inside city limits?", toc: "City or county", id: "city-or-county", html: (bg) =>
      h.p(`The tax rate, the trash pickup, the sales tax and the rules for rentals and golf carts. Four of the 13 places are a city or town in full. Myrtle Beach, North Myrtle Beach and Conway are cities, and Surfside Beach is a town. The City of Loris, the Town of Aynor and the Town of Pawleys Island sit inside places that are mostly county land.`) +
      TAX_CHART +
      h.p(`At 65, after a year living in South Carolina, the first $50,000 of your home's value is not taxed. Outside the towns in Horry County, that saves about ${HOMESTEAD("longs")} a year; in Conway, about ${HOMESTEAD("conway")}.`) +
      CITY_TABLE +
      h.p(`Trash: Myrtle Beach, North Myrtle Beach and Conway pick it up at the curb, and Loris, Aynor and Surfside Beach offer service too. Renting by the night, place by place:`) +
      RENT_RULES +
      h.p(`Outside the towns, the county's Solid Waste Authority does not collect trash at the curb. Only county residents who live outside the towns may use its 25 drop-off centers. Under state law, a golf cart needs a $5 permit decal and liability insurance, and may use only roads posted 35 mph or less.`) +
      h.p(`A subdivision's recorded rules can bar nightly rentals even where zoning allows them. Our ${h.a("/invest/str-rules/", "rental rules")} page has each town's rule in full.`) +
      h.cta("Want the rules for one address?", "Send us the address. We check whether it is inside a city, and read the town's rules and the HOA's recorded rules for what you plan to do.", "Ask us to check the rules", CONTACT, bg) },
  ],
  faqTitle: "Questions about the towns",
  faq: [
    { q: "Is it better to live in Myrtle Beach or North Myrtle Beach?", a: `A typical house costs about the same in both: ${price("myrtle-beach")} in Myrtle Beach and ${price("north-myrtle-beach")} in North Myrtle Beach. In North Myrtle Beach it is closer to the beach, but more often in the high-risk flood zone. Myrtle Beach is much closer to the airport, and most of its neighborhoods of houses are not zoned for nightly rentals.` },
    { q: "Does a Myrtle Beach address mean the house is in the city?", a: "Not always. Carolina Forest houses, and many in Socastee, have Myrtle Beach mailing addresses but are outside the city limits. They pay no city tax and get no city trash pickup. We check the city line for any address you send us." },
    { q: "Where near Myrtle Beach are most houses someone's home all year?", a: `In most of these places, about 3 in 4 houses or more are the owner's main home, taxed at the 4 percent rate. In North Myrtle Beach about half are, and in Surfside Beach fewer than half. The rest are taxed at the 6 percent rate for second homes and rentals.` },
    { q: "Which town near Myrtle Beach has the least crime?", a: "Chapter3 does not rate any town on crime or describe who lives anywhere. Fair housing law bars agents from steering buyers toward or away from an area. We give you the record of the house itself: its flood zone, its tax and the rules for its address." },
  ],
  sources: [
    { name: "Horry deeds", href: S.deeds },
    { name: "Horry parcels", href: S.parcels },
    { name: "Georgetown parcels", href: S.gtGis },
    { name: "FEMA flood maps", href: S.fema },
    { name: "FEMA policies", href: S.nfip },
    { name: "Horry 2026 levy", href: S.levy },
    { name: "Georgetown tax", href: S.gtTax },
    { name: "Census ACS", href: S.acs },
    { name: "SCDOR ST-500", href: S.st500 },
    { name: "Solid Waste Authority", href: S.swa },
    { name: "SC Code 56-2", href: S.sc56 },
    { name: "Myrtle Beach parking", href: S.decal },
    { name: "SCDOT bridge record", href: S.bridge },
    { name: "Horry parks", href: S.parks },
    { name: "SC Code 12-37", href: "https://www.scstatehouse.gov/code/t12c037.php" },
    { name: "SC Code 38-75", href: "https://www.scstatehouse.gov/code/t38c075.php" },
  ],
  sourcesNote: "Prices are recorded sales of detached houses, not values. Drive minutes: OpenStreetMap roads, from 60 houses drawn at random in each place. Listing shares: our feed, in aggregate.",
  afterSources: () => TOWN_SRC() + ph.credits() + ITEMLIST(),
  bottomCta: { h2: "Tell us your budget and what the house has to do.", p: "We send back a short list of towns and houses that fit, with the flood zone, the tax and the rules checked for each one.", label: "Send my budget", href: CONTACT },
  keywords: "where to live near Myrtle Beach, best towns near Myrtle Beach, Grand Strand towns, Myrtle Beach vs North Myrtle Beach, cheapest place to live near Myrtle Beach, cost of living Horry County, towns in Horry County, Myrtle Beach city limits vs county, which town to live in near Myrtle Beach, Grand Strand towns map",
  about: "Choosing a town to live in near Myrtle Beach, South Carolina: thirteen Grand Strand and inland places compared by house prices, yearly costs, drive times, flood zones and city or county rules",
});
