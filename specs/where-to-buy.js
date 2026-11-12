/* /invest/where-to-buy/ - where to buy a rental near Myrtle Beach: eleven Grand Strand areas, each with
 * its nightly-rental rule, what a nightly rental took in at the beach, what a year's rent is next to the
 * price inland, the tax at the rental rate, the flood share and how many homes are no one's residence.
 *
 * Batch 2026-11-a, Lane U. Version 3, review round 1 (2026-11-03); version 2 (2026-11-02) was the first
 * rewrite; version 1 (2026-09-06) was a nine-row rules table.
 * Facts: Blog-Brain batches/2026-11-a/invest-where-to-buy/facts.md, VERIFIED and CORRECTED rows at their
 * corrected wording (VERIFY.md), and the round-1 fixer rows marked VERIFIED-BY-FIXER (26F, 29F, 35, 36):
 * the nightly take from data/str-market.json (the site's one source, as /invest/second-home/ uses it,
 * owner 2026-10-26), the flood policy cost from FEMA's NFIP policies, and the Myrtle Beach rental zones
 * from /submarkets/myrtle-beach/'s map file. Row 4 (the overlay rule) and row 27 (month figures) stay out.
 * Data, never typed: data/2026-11-a/invest-where-to-buy/ (findings.json, chart-scorecard.json,
 * areas.geojson, nfip-houses.json, photos.json; see its README), data/str-market.json, and
 * data/2026-11-a/submarkets-myrtle-beach/map-str-zones.geojson.
 * Round 1 changes (REVIEW-1.md): one list of places (the map and its key), one comparison (the rent chart),
 * no field-list cards, two or three numbers a place, plain words for every code name, a photo in every
 * entry (six new: five USDA aerials and one public-domain Conway photo), the nightly side of the worked
 * example back, the townhouse story moved near the end, and the two sideways-scroll work-arounds.
 * Round 2 changes (REVIEW-2.md): the map moved into the hero with a short key and legend (entry 1 is two
 * and a half phone screens down, not 3.8), two to four numbers a place, the 6 percent tax class and the
 * per-entry tax and builder figures cut from the entries, two phrase sentences made literal, and one
 * switch (NIGHTLY) that takes every nightly dollar figure off the page if the lead strikes rows 26F/29F.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const { regionMap, loadGeo2 } = require(path.join(BB, "tools", "area-map.js"));

const ROOT = path.join(__dirname, "..");
const DATA = path.join(ROOT, "data", "2026-11-a", "invest-where-to-buy");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), SC = read("chart-scorecard.json").rows, GEO = read("areas.geojson"), NFIP = read("nfip-houses.json");
const STR = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "str-market.json"), "utf8"));
const MBZ = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "2026-11-a", "submarkets-myrtle-beach", "map-str-zones.geojson"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`where-to-buy: ${msg}`); };

const kit = PK.create({ h, theme: "glass", photos: read("photos.json").photos,
  mapDir: path.join(ROOT, "chapter3realty", "images", "maps"), mapSrc: "/images/maps" });
const ph = kit.photoSet({ aerialWidth: "760px" });

const SELF = "/invest/where-to-buy/";
const CONTACT = "/contact/";
const RTN = "/invest/run-the-numbers/";
const k1 = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const k100 = (v) => "$" + (Math.round(v / 100) * 100).toLocaleString("en-US");
const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
const pc = (v) => `${Math.round(v)} percent`;

/* The eleven areas, in the page's order: the six beach areas (nightly) first, then the five inland (yearly). */
const ORDER = ["north-myrtle-beach", "surfside-beach", "garden-city", "murrells-inlet", "pawleys-litchfield", "myrtle-beach",
  "longs", "socastee", "conway", "little-river", "carolina-forest"];
const BEACH6 = ORDER.slice(0, 6), INLAND = ORDER.slice(6);
const A = {};
ORDER.forEach((slug, i) => {
  const f = F.areas.find((x) => x.slug === slug), s = SC.find((x) => x.slug === slug);
  must(f && s, `no data for ${slug}`);
  A[slug] = Object.assign({ n: i + 1, slug, id: slug, f, s }, s);
});
const NAME = { "murrells-inlet": "Murrells Inlet, Georgetown County side", "pawleys-litchfield": "Pawleys Island and Litchfield" };
const nm = (slug) => NAME[slug] || A[slug].name;
const short = (slug) => (slug === "murrells-inlet" ? "Murrells Inlet" : slug === "pawleys-litchfield" ? "Pawleys Island and Litchfield" : A[slug].name);
/* The verifier's labels (finding A): every Murrells Inlet figure is the Georgetown side, every Garden City figure is Horry. */
must(A["murrells-inlet"].f.house.horry_homes === 0 && A["garden-city"].f.house.georgetown_homes === 0, "Murrells Inlet or Garden City now spans both counties: relabel");

/* ---------- what the page says in words, checked against the data (ledger rows in brackets) ---------- */
const RENT = (slug) => A[slug].rent_year_pct_of_house;
const P1 = (slug) => RENT(slug).toFixed(1);
const LOW5 = ["north-myrtle-beach", "myrtle-beach", "surfside-beach", "murrells-inlet", "pawleys-litchfield"];
const ALL = (fn) => ORDER.map(fn);
must(RENT("longs") === Math.max(...ALL(RENT)) && RENT("surfside-beach") === Math.min(...ALL(RENT)), "[20] Longs is no longer the highest or Surfside the lowest");
must(LOW5.every((s) => RENT(s) >= 3 && RENT(s) < 4.5) && ["longs", "socastee", "conway"].every((s) => RENT(s) >= 7 && RENT(s) < 9.5), "[20] the 7 to 9 and 3 to 4 percent ranges changed");
must(A.conway.house_median_sale === Math.min(...ALL((s) => A[s].house_median_sale)), "[16] Conway is no longer the lowest house price");
must(A["surfside-beach"].house_median_sale === Math.max(...ALL((s) => A[s].house_median_sale)), "[16] Surfside is no longer the highest house price");
must(BEACH6.filter((s) => s !== "garden-city").every((s) => A[s].house_median_sale > A["garden-city"].house_median_sale), "[16] Garden City houses no longer cost less than in the other five beach areas");
must(A["little-river"].condo_median_sale === Math.min(...ALL((s) => A[s].condo_median_sale)), "[17] Little River condos are no longer the lowest");
const shareStr = (s) => A[s].house_listings_str / A[s].house_listings;
must(ORDER.every((s) => shareStr("garden-city") >= shareStr(s)) && shareStr("garden-city") > 0.5, "[14] Garden City: more than half, and the highest share");
must(A["carolina-forest"].house_listings_str === 0, "[14] Carolina Forest now has a house that says nightly is allowed");
must(A["north-myrtle-beach"].condo_listings_str / A["north-myrtle-beach"].condo_listings > 0.76 && A["north-myrtle-beach"].condo_listings_str / A["north-myrtle-beach"].condo_listings < 0.84, "[14] 'four in five condos' no longer holds");
must(shareStr("little-river") > 0.13 && shareStr("little-river") < 0.155, "[14] '1 in 7' no longer holds");
must(INLAND.every((s) => A.socastee.pct_high_risk_flood >= A[s].pct_high_risk_flood), "[25] Socastee is no longer the highest flood share inland");
must(INLAND.every((s) => A["little-river"].pct_homes_6pct >= A[s].pct_homes_6pct), "[23] Little River is no longer the highest inland share at 6 percent");
must(A["north-myrtle-beach"].pct_homes_6pct === Math.max(...ALL((s) => A[s].pct_homes_6pct)), "[23] North Myrtle Beach is no longer the highest share");
must(A["pawleys-litchfield"].f.all.pct_ve === Math.max(...ALL((s) => A[s].f.all.pct_ve)), "[25] Pawleys no longer has the largest V-zone share");
must(A["garden-city"].pct_high_risk_flood === Math.max(...ALL((s) => A[s].pct_high_risk_flood)), "[25] Garden City is no longer the highest flood share");
must(A["carolina-forest"].pct_high_risk_flood < 1 && A["carolina-forest"].pct_high_risk_flood === Math.min(...ALL((s) => A[s].pct_high_risk_flood)), "[25] Carolina Forest: under 1 percent, the lowest");
must(A.conway.mills_6pct === Math.max(...ALL((s) => A[s].mills_6pct)), "[21] Conway is no longer the highest tax per dollar");
must(A["murrells-inlet"].pct_homes_6pct > 22 && A["murrells-inlet"].pct_homes_6pct < 28 && A["murrells-inlet"].pct_bill_out_of_state < 10, "[23, 24] Murrells Inlet: three in four main homes, under one bill in ten out of state");
must(A["north-myrtle-beach"].pct_bill_out_of_state > 48 && A["north-myrtle-beach"].pct_bill_out_of_state < 55, "[24] 'about half' out of state");
const NMBf = A["north-myrtle-beach"].f;
must(NMBf.condo.homes > NMBf.all.homes / 2, "[30] most North Myrtle Beach homes are no longer condos");

/* Builder first sales (row 18, a floor: our list of builder sellers). Horry only. */
const builder = (s) => { const x = A[s].f.house; return { b: x.builder_sales_horry, all: x.builder_sales_horry + x.horry_resales, pct: x.builder_sales_horry / (x.builder_sales_horry + x.horry_resales) * 100 }; };
must(builder("longs").b === 280 && builder("longs").all === 607, "[18] the Longs builder count changed; re-read the ledger");
must(builder("socastee").pct >= 25 && builder("socastee").pct < 30, "[18] Socastee: 'at least a quarter'");
must(builder("surfside-beach").b === 1, "[18] Surfside: one builder sale");

/* Census tenants' rent (row 31): Conway the lowest of the three named, Carolina Forest above Conway, Socastee and Myrtle Beach. */
const acs = (s) => A[s].f.acs_2024_5yr;
const r10 = (v) => usd(Math.round(v / 10) * 10);
must(["socastee", "myrtle-beach", "carolina-forest"].every((s) => acs(s).median_gross_rent > acs("conway").median_gross_rent), "[31] Conway tenants no longer pay less");
must(["conway", "socastee", "myrtle-beach"].every((s) => acs(s).median_gross_rent < acs("carolina-forest").median_gross_rent), "[31] Carolina Forest tenants no longer pay more");
must(acs("socastee").pct_renter > 30 && acs("socastee").pct_renter < 37, "[31] Socastee: about a third rented");
must(acs("carolina-forest").pct_renter > 27 && acs("carolina-forest").pct_renter < 33, "[31] Carolina Forest: about 3 in 10 rented");

/* What a nightly rental took in (row 26F): data/str-market.json, the site's one source. AirROI's market areas, not our outlines.
   NIGHTLY: the lead's ruling on rows 26F and 29F (VERIFIED-BY-FIXER; the verifier struck row 26 as vendor data; the owner's
   rule of 2026-10-26 names this file). Set it to false and every nightly dollar figure leaves the page: the range in the
   short answer, each beach entry's "took in" sentence, the condo card of the worked example, the FAQ line and the AirROI source. */
const NIGHTLY = true;
const nx = (t) => (NIGHTLY ? t : "");
const STRSLUG = { "north-myrtle-beach": "north-myrtle-beach", "surfside-beach": "surfside-beach", "garden-city": "garden-city",
  "murrells-inlet": "murrells-inlet", "pawleys-litchfield": "pawleys-island", "myrtle-beach": "myrtle-beach" };
const take = (slug) => { const m = STR.markets.find((x) => x.slug === STRSLUG[slug]); must(m && m.revenue > 0, `[26F] no nightly figure for ${slug}`); return m.revenue; };
const TAKES = BEACH6.map(take);
must(take("murrells-inlet") === Math.max(...TAKES) && take("myrtle-beach") === Math.min(...TAKES), "[26F] Murrells Inlet is no longer the most or Myrtle Beach the least");
const kTake = (slug) => k1(take(slug));
must(take("north-myrtle-beach") > take("myrtle-beach"), "[26F] the FAQ says North Myrtle Beach took in more");
const TAKE_LO = "$" + (Math.floor(Math.min(...TAKES) / 1000) * 1000).toLocaleString("en-US"), TAKE_HI = "$" + (Math.round(Math.max(...TAKES) / 1000) * 1000).toLocaleString("en-US");

/* Flood policies on houses (row 35): FEMA NFIP, policies effective in the year to August 2026. */
const fl = (k) => { must(NFIP[k] && NFIP[k].n > 300, `[35] too few policies for ${k}`); return "$" + (Math.round(NFIP[k].median / 100) * 100).toLocaleString("en-US"); };
must(NFIP.beach_v.median > NFIP.beach_a.median && NFIP.beach_a.median > NFIP.inland_a.median && NFIP.inland_a.median > NFIP.beach_x.median, "[35] the order of the flood policy costs changed");
must(Math.abs(NFIP.beach_x.median - NFIP.inland_x.median) < 60, "[35] 'about the same at the beach and inland' outside the zones");

/* Tax at 6 percent (row 21): price x 0.06 x mills. Per $100,000 = 6 x mills. Georgetown mills are the county's current estimate. */
const per100k = (mills) => Math.round(mills * 6);
must(["myrtle-beach", "north-myrtle-beach", "surfside-beach", "conway"].every((t) => A[t].mills_6pct > 201.0), "[21] a town is no longer higher than outside the towns");
must(per100k(201.0) === 1206 && per100k(272.5) === 1635, "[21] arithmetic");

/* ---------- the map ---------- */
/* The tallest the map may be, height over width (area-map.js maxRatio): shorter on a phone (owner's eye, round 2). */
const MAP_RATIO = 0.85;
const ruleClass = { "north-myrtle-beach": "open", "garden-city": "open", "longs": "open", "socastee": "open", "little-river": "open", "carolina-forest": "open",
  "myrtle-beach": "some", "surfside-beach": "some", "conway": "some", "murrells-inlet": "some", "pawleys-litchfield": "some" };
const CLR = { open: { fill: "#c4783a", line: "#91592b" }, some: { fill: "#3d6f93", line: "#2a4f6a" }, zone: { fill: "#1f4766", line: "#16344c" } };
const MAP = (() => {
  const ring = (g) => {
    const polys = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    let best = null, ba = 0;
    for (const p of polys) { const r = p[0]; let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); if (Math.abs(a) > ba) { ba = Math.abs(a); best = r; } }
    let s = best; while (s.length > 390) s = s.filter((_, i) => i % 2 === 0);
    return s;
  };
  const feat = (slug) => GEO.features.find((x) => x.properties.slug === slug);
  const areas = ORDER.map((slug) => ({ name: A[slug].name, polygon: ring(feat(slug).geometry), mark: String(A[slug].n) }));
  const m = regionMap({ name: "Eleven Grand Strand areas", areas, areaLabels: "numbers", maxRatio: MAP_RATIO }, { glass: true });
  let svg = m.svg;
  const W = m.width, H = m.height, fr = m.frame;
  const P = (lon, lat) => [(lon - fr.west) / (fr.east - fr.west) * W, (fr.north - lat) / (fr.north - fr.south) * H];
  const g = svg.match(/<g class="ar"[^>]*>([\s\S]*?)<\/g>/);
  must(g, "the map's area group is missing");
  const paths = g[1].match(/<path [^>]*\/>/g);
  must(paths && paths.length === ORDER.length, "the map has a different number of outlines");
  const recol = `<g class="ar" stroke-width="1.6" stroke-linejoin="round">` + paths.map((p, i) => { const c = CLR[ruleClass[ORDER[i]]]; return p.replace("<path ", `<path fill="${c.fill}" fill-opacity=".34" stroke="${c.line}" `); }).join("") + "</g>";
  /* Myrtle Beach's nightly-rental zones (row 36): the "str" class of /submarkets/myrtle-beach/'s map file, darker blue. */
  const z = MBZ.features.find((x) => x.properties.class === "str");
  must(z && z.geometry.type === "MultiPolygon", "[36] the Myrtle Beach zone layer is missing");
  const zd = z.geometry.coordinates.map((poly) => poly[0]).map((r) => r.map(([lo, la]) => P(lo, la)))
    .filter((r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(a) / 2 > 0.6; })
    .map((r) => "M" + r.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z").join("");
  const zones = `<path d="${zd}" fill="${CLR.zone.fill}" fill-opacity=".85" stroke="${CLR.zone.line}" stroke-width=".5"/>`;
  /* The county line, from areas.geojson, cut where it meets the coastline (critic round 1: it ran into the ocean). */
  const cl = feat("county-line").geometry.coordinates, coast = loadGeo2().coast;
  const hit = (a, b, c, d) => { const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]); if (!den) return null;
    const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den, u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
    return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])] : null; };
  let cut = null;
  for (let i = 1; i < cl.length && !cut; i++) for (let j = 1; j < coast.length; j++) { const x = hit(cl[i - 1], cl[i], coast[j - 1], coast[j]); if (x) { cut = { i, x }; break; } }
  must(cut, "the county line no longer meets the coastline");
  const land = [cut.x, ...cl.slice(cut.i)];
  const line = land.map(([lo, la]) => P(lo, la).map((v) => v.toFixed(1)).join(" "));
  const county = `<path d="M${line.join("L")}" fill="none" stroke="#1c2028" stroke-width="2.2" stroke-dasharray="7 4" stroke-linecap="round"/>`;
  svg = svg.replace(g[0], recol + zones + county);
  /* Surfside Beach (2) and Garden City (3) are too small to hold two badges: 2 moves onto the ocean, with a thin line to its area. */
  const sf = feat("surfside-beach").geometry.coordinates[0];
  const [cx, cy] = P(sf.reduce((t, q) => t + q[0], 0) / sf.length, sf.reduce((t, q) => t + q[1], 0) / sf.length);
  const re = /<g transform="translate\(([\d.]+) ([\d.]+)\)">(<g class="k"><circle[^>]*\/><text class="ab"[^>]*>2<\/text><\/g>)<\/g>/;
  const b2 = svg.match(re);
  must(b2, "badge 2 not found on the map");
  const bx = cx + 22, by = cy + 30; /* below the ocean label at the round-2 frame */
  svg = svg.replace(b2[0], `<path d="M${cx.toFixed(1)} ${cy.toFixed(1)}L${(bx - 6).toFixed(1)} ${(by - 8).toFixed(1)}" stroke="#1c2028" stroke-width="1.2"/><g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})">${b2[3]}</g>`);
  must(svg.length < 70000, `the map is ${svg.length} bytes`);
  const sw = (c, dash) => (dash
    ? `<svg width="30" height="12" aria-hidden="true" style="flex:0 0 auto"><path d="M1 6H29" stroke="#1c2028" stroke-width="2.4" stroke-dasharray="7 4"/></svg>`
    : `<span aria-hidden="true" style="flex:0 0 auto;width:22px;height:16px;border-radius:4px;background:${c.fill};opacity:${c === CLR.zone ? ".9" : ".75"};border:2px solid ${c.line}"></span>`);
  const item = (s, t) => `<li>${s}<span>${t}</span></li>`;
  /* Round 2 (owner's eye: long preamble): short labels in one wrapping row; the key is one short line of
     numbered names, not a two-column list. The map is the hero picture, so it is the first thing on a phone. */
  const legend = `<ul class="c3w-legend" role="list" aria-label="Map legend">`
    + item(sw(CLR.open), "Nightly rentals: no zoning limit")
    + item(sw(CLR.some), "Some zones only")
    + item(sw(CLR.zone), "Myrtle Beach's rental zones")
    + item(sw(null, true), "County line") + `</ul>`;
  const key = `<ol class="c3w-key" role="list" aria-label="Map key">` + ORDER.map((s) => `<li><b>${A[s].n}</b>${short(s)}</li>`).join("") + `</ol>`;
  const alt = "Map of the Grand Strand from Little River to Pawleys Island with the eleven areas numbered as on this page, shaded orange where zoning puts no limit on nightly rentals and blue where they are allowed only in some zones or districts, with Myrtle Beach's nightly-rental zones in dark blue along the ocean and a dashed county line south of Garden City.";
  const html = svg.replace(/aria-label="[^"]*"/, `aria-label="${alt}"`).replace("<svg ", '<svg style="display:block;width:100%;height:auto" ');
  return `<div class="c3w-map">` + legend + h.figure(html, `Where zoning allows nightly rentals. A subdivision's recorded rules can still bar them. Myrtle Beach's zones: the city's map. ${m.credit}`) + key + `</div>`;
})();

/* ---------- photos (photos.json): one in every entry ---------- */
const PH = {
  "north-myrtle-beach": ph.aerial("north-myrtle-beach-towers-and-houses-2011", "Condo towers and beach houses on the same oceanfront block in North Myrtle Beach."),
  "surfside-beach": ph.aerial("surfside-beach-pier-and-houses-2011", "The pier and rows of raised beach houses in Surfside Beach."),
  "garden-city": ph.aerial("garden-city-pier-and-beach-road-2011", "Condo buildings and houses on the strip between the ocean and the marsh at Garden City."),
  "murrells-inlet": ph.aerial("murrells-inlet-georgetown-side-from-above", "A subdivision on the Georgetown County side of Murrells Inlet, with older houses on larger wooded lots below it."),
  "pawleys-litchfield": ph.aerial("litchfield-beach-houses-and-condos-2011", "Beach houses and low condo buildings at Litchfield Beach, with docks across the marsh."),
  "myrtle-beach": ph.aerial("myrtle-beach-oceanfront-towers-2011", "Oceanfront towers in Myrtle Beach."),
  "longs": ph.aerial("longs-new-subdivision-from-above", "A new subdivision going up beside farm fields in Longs: streets and ponds dug, some houses built or framed, and most lots still empty."),
  "socastee": ph.aerial("socastee-subdivision-from-above", "A subdivision of similar houses around a pond in Socastee, with older houses on wooded lots across the road and a highway bridge on the right."),
  "conway": ph.aerial("conway-riverwalk-and-warehouses", "The riverwalk boardwalk past old wooden warehouses in downtown Conway."),
  "little-river": ph.aerial("little-river-houses-and-ponds-from-above", "Houses on curving streets around ponds in Little River, with larger buildings and their parking lots at the lower left."),
  "carolina-forest": ph.aerial("carolina-forest-houses-and-woods-from-above", "Houses on streets that end in cul-de-sacs in Carolina Forest, with woods around them and land being cleared for more on the right."),
};
ph.share("north-myrtle-beach-towers-and-houses-2011");

/* ---------- styles ---------- */
/* Light fix, triage 2026-11-08: the italic line at about half the H1's size, on its own line (the approved look,
   Blog-Brain batches/2026-11-a/hoa-documents/DESIGN.md). */
const PAGE_CSS = "<style>main#main .detail-hero .detail-sub{display:none}"
  + "@media (min-width:700px){main#main .detail-h1{text-wrap:balance}}main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}"
  + "@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}"
  /* The hero tiles: the number stands out from its label (critic round 1). */
  + "main#main .c3-glance span.t{font-size:1.3rem;font-weight:650;color:var(--navy);line-height:1.15;margin-top:.15rem}main#main .c3-glance strong{line-height:1.4}main#main .c3-glance li{line-height:1.4}"
  + "main#main .c3w-lead{max-width:620px;margin:.2rem 0 .7rem;color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.5}"
  + "main#main .c3w-map{max-width:620px;margin:.2rem 0 .4rem}main#main .c3w-map figure{margin:.4rem 0 .5rem}"
  + "main#main .c3w-key{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.15rem .9rem;color:var(--navy);font-size:.95rem;line-height:1.45}"
  + "main#main .c3w-key li{margin:0;padding:0;white-space:nowrap}main#main .c3w-key b{font-weight:700;color:#91592b;margin-right:.3rem}"
  + "main#main .c3w-legend{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:.3rem 1rem;color:var(--navy);font-size:.95rem;line-height:1.35}"
  + "main#main .c3w-legend li{display:flex;align-items:center;gap:.45rem;margin:0}"
  /* Wide screens: the map on the left, the legend and the key beside it, so the hero stays one screen tall. */
  + "@media (min-width:900px){main#main .c3w-map{display:grid;grid-template-columns:minmax(0,540px) minmax(0,300px);grid-template-areas:'f l' 'f k';grid-template-rows:auto 1fr;gap:.8rem 2rem;max-width:880px;align-items:start}"
  + "main#main .c3w-map figure{grid-area:f;margin:0}main#main .c3w-legend{grid-area:l;flex-direction:column;margin-top:.4rem}main#main .c3w-key{grid-area:k;flex-direction:column;gap:.2rem}}"
  + "main#main .c3w-money{max-width:760px;margin:1.2rem 0 .3rem;padding:.9rem 1.1rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,none),var(--g-sh,none);color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.55}"
  + "main#main .c3w-money p{margin:0}main#main .c3w-money .c3-offer{margin:.7rem 0 0}"
  + "main#main .c3w-ex{display:grid;gap:1rem;max-width:900px;margin:1.2rem 0 1rem}@media (min-width:760px){main#main .c3w-ex{grid-template-columns:1fr 1fr}}"
  + "main#main .c3w-ex>div{padding:1.1rem 1.2rem 1rem;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,none),var(--g-sh,none)}"
  + "main#main .c3w-ex h3{font-family:var(--sans);font-size:1.1rem!important;font-weight:650;color:var(--navy);margin:0 0 .2rem!important}main#main .c3w-ex .s{color:var(--muted);margin:0 0 .7rem;font-size:1rem}"
  + "main#main .c3w-ex dl{margin:0;display:grid;grid-template-columns:1fr auto;gap:.35rem 1rem;font-size:var(--read,1.0625rem);color:var(--navy)}main#main .c3w-ex dt{color:var(--muted)}main#main .c3w-ex dd{margin:0;text-align:right;font-variant-numeric:tabular-nums}"
  + "main#main .c3w-ex dt.t,main#main .c3w-ex dd.t{border-top:1px solid rgba(28,32,40,.18);padding-top:.45rem;font-weight:650;color:var(--navy)}"
  + "main#main .c3w-month{max-width:760px;margin:.4rem 0 1.1rem;padding-left:1.2rem;color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.55}main#main .c3w-month li{margin:0 0 .35rem}"
  + "main#main .c3w-check{list-style:none;margin:1rem 0 1.2rem;padding:0;display:grid;gap:.6rem;max-width:760px}"
  + "main#main .c3w-check li{display:flex;gap:.8rem;align-items:flex-start;padding:.75rem .9rem;border-radius:16px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.75);box-shadow:0 6px 18px rgba(28,32,40,.07);color:var(--navy);font-size:var(--read,1.0625rem);line-height:1.5}"
  + "main#main .c3w-check .i{flex:0 0 auto;display:inline-flex;color:var(--brass);margin-top:.1rem}"
  + "@media (prefers-reduced-transparency:reduce){main#main .c3w-money,main#main .c3w-ex>div,main#main .c3w-check li{background:#fbf8f3}}"
  /* Sideways scroll from shared parts (NEEDS 9), the work-arounds other pages of this batch use:
     the homes strip's search row at 320 px, and the header's phone number from 1000 to 1120 px. */
  + "@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}"
  + "@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}"
  /* The end offer band stays a dark panel when the live site's listing notice (idx-lib/edge.js) follows it:
     glass.js styles every band that is not the last child of <main> as the slim light top bar, and the
     end band's ivory heading then vanishes on white (NEEDS.md item 8). */
  + "main#main>section[style^=\"background:var(--navy)\"][style]:not(:has(~section)){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"][style]:not(:has(~section))>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;width:calc(100% - 32px);box-sizing:border-box;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"][style]:not(:has(~section))>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}</style>";

/* One numbered entry: the rule, the photo, two or three numbers that decide it, then the price and its offer. */
const offer = (slug) => G.offer(short(slug), { label: `Get rentals for sale in ${short(slug)}`, href: `/contact/?place=${encodeURIComponent(short(slug))}` });
/* The sale price, worded one way in every entry (owner's eye, round 1). Light fix, triage 2026-11-08: each price
   names the area it counts (ledger, "Areas"), so a town-limits figure is not read against a ZIP code figure elsewhere. */
const WHERE = {
  "myrtle-beach": "within the city limits", "north-myrtle-beach": "within the city limits", "conway": "within the city limits",
  "surfside-beach": "within the town limits",
  "garden-city": "in the Census area of Garden City", "murrells-inlet": "in the Census area of Murrells Inlet",
  "carolina-forest": "in the Census area of Carolina Forest", "socastee": "in the Census area of Socastee",
  "little-river": "in the Census area of Little River",
  "longs": "in ZIP code 29568, outside North Myrtle Beach,", "pawleys-litchfield": "in ZIP code 29585",
};
const price = (slug, o = {}) => {
  const x = A[slug], parts = [], where = WHERE[slug];
  if (!where) throw new Error(`price(): no area named for ${slug}`);
  if (o.house !== false) parts.push(`the middle house ${where} sold for about ${k1(x.house_median_sale)}`);
  if (o.condo) parts.push(`the middle condo${o.house === false ? ` ${where} sold` : ""} for about ${o.condo5 ? "$" + (Math.round(x.condo_median_sale / 5000) * 5000).toLocaleString("en-US") : k1(x.condo_median_sale)}`);
  const t = parts.join(" and ");
  return `${t[0].toUpperCase()}${t.slice(1)}${o.tail || ""}.`;
};
const money = (slug, text) => `<div class="c3w-money"><p class="c3-place-price">${text}</p>${offer(slug)}</div>`;
const entry = (slug, headline, html) => ({ h2: `${A[slug].n}. ${nm(slug)}: ${headline}`, toc: `${A[slug].n}. ${short(slug)}`, id: slug, html: () => html });
const guide = (slug, url) => h.a(url, short(slug));

/* ---------- the one comparison: a year's rent next to the price ---------- */
const RENT_CHART = G.bars([...ORDER].sort((x, y) => RENT(y) - RENT(x)).map((slug) => ({
  name: `${A[slug].n}. ${short(slug)}`, value: RENT(slug), valueText: `${P1(slug)}%`, reference: BEACH6.includes(slug),
  feature: `houses about ${k1(A[slug].house_median_sale)}` })),
  { caption: "A year of rent, as a share of the middle house price", nameLabel: "Area", featureLabel: "middle house price", valueLabel: "a year's rent, share of price",
    format: (v) => `${v.toFixed(1)}%`, compact: true,
    note: "Grey bars: the six beach areas, numbered 1 to 6. The rent is HUD's rent for a standard 3-bedroom in the area's main ZIP code, which counts the utilities a tenant pays. The price is the middle house sale in the year to September 2026: resales in Horry County, every recorded sale in Georgetown County." });

/* ---------- tax (rows 21, 22) ---------- */
const TAX_ROWS = [
  ["Most homes outside the towns in Horry County: Longs, Socastee, Carolina Forest, Little River", 201.0],
  ["Garden City", A["garden-city"].mills_6pct],
  ["Surfside Beach", A["surfside-beach"].mills_6pct],
  ["North Myrtle Beach", A["north-myrtle-beach"].mills_6pct],
  ["Pawleys Island and Litchfield (Georgetown County's current estimate)", A["pawleys-litchfield"].mills_6pct],
  ["Murrells Inlet, Georgetown County side (current estimate)", A["murrells-inlet"].mills_6pct],
  ["Myrtle Beach", A["myrtle-beach"].mills_6pct],
  ["Conway", A.conway.mills_6pct],
];
must(["longs", "socastee", "carolina-forest", "little-river"].every((s) => A[s].mills_6pct === 201.0), "[21] an inland area left 201.0 mills");
must(TAX_ROWS.every((r, i) => i === 0 || r[1] >= TAX_ROWS[i - 1][1]), "[21] the tax rows are no longer in order");
const TAX_TABLE = h.table(["Where the home is", "Tax a year on each $100,000 of price"], TAX_ROWS.map(([w, m]) => [w, usd(per100k(m))]));

/* ---------- the worked example: the same $300,000 two ways (rows 16, 17, 19, 21, 26F, 28, 29F) ---------- */
const L = A.longs, NMB = A["north-myrtle-beach"];
const exL = { price: L.house_median_sale, gross: L.hud_3br * 12, tax: L.house_median_sale * 0.06 * (L.mills_6pct / 1000), fee: 100 * 12 };
exL.left = exL.gross - exL.tax - exL.fee;
const exN = { round: true, price: NMB.condo_median_sale, gross: take("north-myrtle-beach"), tax: NMB.condo_median_sale * 0.06 * (NMB.mills_6pct / 1000), fee: 700 * 12 };
exN.left = exN.gross - exN.tax - exN.fee;
/* Longs is fixed by rows 16, 19, 21 and 28; the condo side moves with data/str-market.json (refresh due 2026-11-13, NEEDS 1). */
must(Math.round(exL.left) === 22423, `[29] Longs arithmetic: ${exL.left}`);
must(Math.abs(exL.price - 300000) < 1000 && exN.price === 300000, "[29F] both homes are no longer about $300,000");
must(exL.left / exL.price > exN.left / exN.price, "[29F] the Longs house no longer keeps the larger share");
const exCard = (title, sub, x, grossLabel, feeLabel) => `<div><h3>${title}</h3><p class="s">${sub}</p><dl>`
  + `<dt>${grossLabel}</dt><dd>${x.round ? "about " + k100(x.gross) : usd(x.gross)}</dd><dt>Tax at the rental rate</dt><dd>minus ${k100(x.tax)}</dd>`
  + `<dt>${feeLabel}</dt><dd>minus ${usd(x.fee)}</dd><dt class="t">Left each year</dt><dd class="t">about ${k100(x.left)}</dd>`
  + `<dt>Share of the price</dt><dd>about ${(x.left / x.price * 100).toFixed(1)}%</dd></dl></div>`;
const EXAMPLE = `<div class="c3w-ex">`
  + exCard("A house in Longs, leased by the year", "At the middle house price", exL, "A year of HUD's 3-bedroom rent", "HOA fee, about $100 a month")
  + nx(exCard("A condo in North Myrtle Beach, rented by the night", "At the middle condo price", exN, "What the average nightly rental took in, rental data for North Myrtle Beach", "Condo fee, about $700 a month"))
  + `</div>`;

/* ---------- what we check (rows 1, 8, 10, 13, 21, 25) ---------- */
const { icon } = require(path.join(BB, "tools", "icons.js"));
const CHECK = `<ul class="c3w-check" role="list">` + [
  ["key", "<strong>The nightly rule for the address:</strong> the town's zone or district, or in Georgetown County the zoning district."],
  ["home", "<strong>The HOA's recorded rules and papers:</strong> many communities here ban renting a house out at all. We filter those out, and we read the papers for any rule that would block your plan."],
  ["pool", "<strong>The building's own rental rules,</strong> for a condo."],
  ["flood", "<strong>The flood zone for the address,</strong> and what the flood insurance costs there."],
  ["tax", "<strong>The tax at the rental rate on your price,</strong> in the tax district the home is in."],
].map(([ic, t]) => `<li><span class="i">${icon(ic, { size: 22 })}</span><span>${t}</span></li>`).join("") + `</ul>`;

/* ---------- sources ---------- */
const S = {
  sc1236: "https://www.scstatehouse.gov/code/t12c036.php",
  sc1243: "https://www.scstatehouse.gov/code/t12c043.php",
  mb: "https://www.cityofmyrtlebeach.com/news_detail_T6_R1468.php",
  nmb: "https://www.nmb.us/833/Short-term-Rentals",
  surf: "https://library.municode.com/sc/surfside_beach",
  conway: "https://www.conwaysc.gov/Current%20UDO%20(7.20.26).pdf",
  horryZ: "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf",
  horrySTR: "https://www.horrycountysc.gov/media/monjnvh0/sales-tax-chart-short-term-rentals.pdf",
  gtZ: "https://www.gtcountysc.gov/DocumentCenter/View/261",
  gtFaq: "https://www.gtcountysc.gov/Faq.aspx?QID=116",
  pawleys: "https://www.townofpawleysisland.com/beach-renourishment-faqs/",
  h3861: "https://www.scstatehouse.gov/sess126_2025-2026/bills/3861.htm",
  s442: "https://www.scstatehouse.gov/sess126_2025-2026/bills/442.htm",
  levy: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf",
  gtTax: "https://www.gtcountysc.gov/385/Property-Tax-Calculator",
  hud: "https://www.huduser.gov/portal/datasets/fmr/smallarea/index.html",
  acs: "https://data.census.gov/table/ACSDT5Y2024.B25064",
  deeds: "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType",
  parcels: "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer",
  gtGis: "https://gis1.georgetowncountysc.org/portal/home/",
  fema: "https://msc.fema.gov/portal/home",
  nfip: "https://www.fema.gov/openfema-data-page/nfip-redacted-policies-v3",
  airroi: "https://www.airroi.com/airbnb-data/united-states/south-carolina/north-myrtle-beach",
};

/* ItemList JSON-LD for the eleven numbered entries. */
const ITEMLIST = () => `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "ItemList",
  name: "Where to buy a rental near Myrtle Beach: eleven Grand Strand areas", numberOfItems: ORDER.length,
  itemListElement: ORDER.map((slug) => ({ "@type": "ListItem", position: A[slug].n, name: nm(slug), url: `https://chapter3realty.com${SELF}#${slug}` })) })}</script>`;

const GC = A["garden-city"], MI = A["murrells-inlet"], PI = A["pawleys-litchfield"], SF = A["surfside-beach"], MB = A["myrtle-beach"];
const SO = A.socastee, CW = A.conway, LR = A["little-river"], CF = A["carolina-forest"];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  datePublished: "2026-09-06",
  hub: { name: "Invest", url: "/invest/" },
  pageImages: () => ph.pageImages(),
  title: "Where to Buy a Rental Near Myrtle Beach: 11 Areas | Chapter3",
  description: `Where to buy rental property near Myrtle Beach: a year's rent is ${P1("longs")}% of a house's price in Longs, ${P1("surfside-beach")}% in Surfside. 11 areas, nightly income, rules.`,
  ogTitle: "Where to buy a rental near Myrtle Beach: eleven areas, with the price, the rent and the rules",
  crumb: "Where to buy",
  eyebrow: "11 areas, from county records",
  h1: "Where should you buy a rental near Myrtle Beach?",
  h1em: "Rent by the night at the beach, and by the year inland.",
  sub: "Eleven Grand Strand areas compared for a rental investor.",
  /* Round 2: the map is the hero picture (owner's eye: long preamble). The three tiles repeated the short answer. */
  heroMedia: PAGE_CSS + ph.css()
    + `<p class="c3w-lead">For a nightly rental, buy at the beach, where the zoning on this map allows it. For a yearly lease, buy inland.</p>`
    + MAP,
  heroCta: false, /* round 1: the offer is in every entry and at the end; the top stays short */
  toc: false,
  author: "devin",
  shortAnswer: [
    `For a nightly rental, buy in one of the beach areas, where the rules for the address allow it.${nx(` A rental-data company estimates that the average nightly rental there took in about ${TAKE_LO} to ${TAKE_HI} in a year, before costs.`)} The license, the tax and every town's rules are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}.`,
    `For a yearly lease, buy inland. In Longs, Socastee and Conway, a year's rent is about 7 to 9 percent of a house's price. In North Myrtle Beach, Myrtle Beach, Surfside Beach, Murrells Inlet and Pawleys Island, it is 3 to 4 percent. A higher share means more rent for each dollar of the price.`,
  ],
  sections: [
    entry("north-myrtle-beach", "nightly rentals with a business license",
      h.p(`${guide("north-myrtle-beach", "/submarkets/north-myrtle-beach/")} has no special zoning or permit for nightly rentals. It asks for a business license renewed each year and the lodging taxes. It also has rules on trash, parking, noise and how many guests may stay.`) +
      PH["north-myrtle-beach"] +
      h.p(`Most homes here are condos, and four in five condos for sale are listed as open to nightly guests.${nx(` In the rental data's North Myrtle Beach area, the average nightly rental took in about ${kTake("north-myrtle-beach")} a year, before costs.`)}`) +
      money("north-myrtle-beach", price("north-myrtle-beach", { condo: true }))),

    entry("surfside-beach", "nightly rentals in two districts",
      h.p(`${guide("surfside-beach", "/submarkets/surfside-beach/")} allows stays of less than 30 days in only two of its zoning districts. A lease of a year or more is allowed wherever homes are. The town's code does not define a lease of one month to a year. For a monthly rental, we get the town's reading before you make an offer.`) +
      PH["surfside-beach"] +
      h.p(`Houses cost more here than in any of the other ten areas, and almost no new ones are built.${nx(` In the rental data's Surfside Beach area, the average nightly rental brought in about ${kTake("surfside-beach")} a year, before costs.`)}`) +
      money("surfside-beach", price("surfside-beach", { condo: true }))),

    entry("garden-city", "the most houses for sale that say nightly is allowed",
      h.p(`${guide("garden-city", "/submarkets/garden-city/")} is outside the towns, in Horry County. A nightly rental here needs a county business license, a state sales tax number and a county hospitality and accommodations tax account.`) +
      h.p(`More than half the houses for sale here say nightly stays are allowed, the highest share of the eleven areas.${nx(` In the rental data's Garden City Beach area, the average nightly rental took in about ${kTake("garden-city")} a year, before costs.`)}`) +
      PH["garden-city"] +
      h.p(`Houses here cost less than in the other five beach areas. FEMA puts ${pc(GC.pct_high_risk_flood)} of homes here in its high-risk flood zone, the highest share of the eleven areas, so we price the flood insurance for each house.`) +
      money("garden-city", price("garden-city", { condo: true }))),

    entry("murrells-inlet", "no county business license, and a 30-day limit",
      h.p(`${h.a("/submarkets/murrells-inlet/", "Murrells Inlet")} sits on both sides of the county line. On this page, Murrells Inlet is the Census area of that name, which lies on the Georgetown County side. Georgetown County requires no business license. Its zoning allows a house to be rented for stays of up to 30 days in the county's resort zone. The lot may hold only that house, with a parking space for each bedroom. We look up the zoning of each address.`) +
      PH["murrells-inlet"] +
      h.p(`About three in four homes here are their owner's main home.${nx(` In the rental data's Murrells Inlet area, the average nightly rental made about ${kTake("murrells-inlet")} a year, the most of the six beach areas.`)}`) +
      money("murrells-inlet", price("murrells-inlet", { tail: ", counting every recorded sale" }))),

    entry("pawleys-litchfield", "nightly rentals on the island, with its own tax",
      h.p(`Nightly rentals are allowed on ${h.a("/submarkets/pawleys-island/", "Pawleys Island")}, and the town collects its own accommodations tax for its Beach Fund. Off the island, the county's resort zone allows stays of up to 30 days, and a community's HOA can limit rentals.`) +
      PH["pawleys-litchfield"] +
      h.p(`About ${pc(PI.f.all.pct_ve)} of homes here are on the oceanfront, in the part of FEMA's high-risk zone where the flood map expects waves. That is the largest share of the eleven areas, and flood insurance costs the most there.${nx(` Around Pawleys Island, a nightly rental brought in about ${kTake("pawleys-litchfield")} a year, before costs.`)}`) +
      money("pawleys-litchfield", price("pawleys-litchfield", { condo: true, tail: ", counting every recorded sale" }))),

    entry("myrtle-beach", "condos in the zones marked for nightly rentals",
      h.p(`${guide("myrtle-beach", "/submarkets/myrtle-beach/")} is a condo market: condos outnumber houses. About three in four condos sit in a zone the city marks for nightly rentals, the dark blue on the map. Most houses do not.`) +
      PH["myrtle-beach"] +
      h.p(`In the city, any stay of less than 90 days counts as short-term, and most neighborhoods of houses are zoned against it. Some houses for sale are still listed as open to nightly stays. What a listing says is not enough, so we check the zone and the HOA's rules for each house.${nx(` In the rental data's Myrtle Beach area, the average nightly rental took in about ${kTake("myrtle-beach")} a year, the least of the six beach areas.`)}`) +
      money("myrtle-beach", price("myrtle-beach", { house: false, condo: true, condo5: true }))),

    entry("longs", "the highest rent next to the price",
      h.p(`The federal housing agency, HUD, publishes a rent for a standard 3-bedroom in each ZIP code, counting the utilities a tenant pays. In Longs it is ${usd(L.hud_3br)} a month. A year of that rent comes to about ${P1("longs")} percent of the middle house price, the highest of the eleven areas.`) +
      PH["longs"] +
      h.p(`Builders are still selling here: at least ${pc(builder("longs").pct)} of house sales in the past year were a builder's first sale. Each new street adds houses for rent near yours, and rents do not always rise with prices. ${h.a("#townhouses", "Eight townhouses in Little River")} show how.`) +
      money("longs", price("longs"))),

    entry("socastee", "houses priced like Longs, with tenants all year",
      h.p(`Socastee is outside the towns, in Horry County, so zoning puts no limit on nightly rentals. `) +
      h.p(`Socastee houses cost about what Longs houses do. About a third of homes here are rented, so the tenants a yearly lease needs already live here.`) +
      PH["socastee"] +
      h.p(`Socastee has the most homes in the high-risk flood zone of the five inland areas, about ${pc(SO.pct_high_risk_flood)}. We check the zone for the address and price the insurance.`) +
      money("socastee", price("socastee"))),

    entry("conway", "the lowest house prices, and nightly rentals downtown",
      h.p(`A house costs less in ${guide("conway", "/submarkets/conway/")} than in any of the other ten areas. Census figures put what tenants here pay at about ${r10(acs("conway").median_gross_rent)} a month at the middle, for rentals of every size. That is less than in Socastee, Myrtle Beach or Carolina Forest, and we price each house against Conway rents, not beach rents.`) +
      PH["conway"] +
      h.p(`Conway allows a nightly rental only in three of its business districts, including downtown and the riverfront. A stay may last up to 90 days, with a city business license. A bed and breakfast, where the host lives on site, is a separate use. Conway's tax on a rental is the highest per dollar of the eleven areas.`) +
      money("conway", price("conway"))),

    entry("little-river", "the lowest condo prices",
      h.p(`${guide("little-river", "/submarkets/little-river/")} has the lowest middle condo price of the eleven areas, and a house's rent for a year is ${P1("little-river")} percent of its sale price.`) +
      PH["little-river"] +
      h.p(`Nightly stays here depend on the subdivision's recorded rules. About 1 in 7 houses for sale say they are allowed.`) +
      h.p(`New communities here keep adding rentals. ${h.a("#townhouses", "Eight townhouses in one of them")} show why we run today's rent against your price.`) +
      money("little-river", price("little-river", { condo: true }))),

    entry("carolina-forest", "a yearly-lease area with almost no flood zone",
      h.p(`Under 1 percent of ${guide("carolina-forest", "/submarkets/carolina-forest/")} homes sit in FEMA's high-risk flood zone, the lowest share of the eleven areas. Census figures put what tenants pay at about ${r10(acs("carolina-forest").median_gross_rent)} a month at the middle, more than in Conway, Socastee or Myrtle Beach.`) +
      PH["carolina-forest"] +
      h.p(`Carolina Forest is outside the towns, so zoning puts no limit on nightly rentals. Even so, this is a yearly-lease market: none of the houses for sale here is listed for nightly stays. A subdivision's recorded rules can bar them, so we read those rules for each house.`) +
      money("carolina-forest", price("carolina-forest"))),

    { h2: "How do the eleven areas compare?", toc: "Side by side", id: "side-by-side", html: (bg) =>
      h.p(`Inland, a year's rent is a bigger share of a house's price. In the six beach areas, houses cost more for the same rent, so a yearly lease earns less there. That is where nightly rentals are allowed.`) +
      RENT_CHART +
      h.cta("Picked one area to buy in?", "Tell us the area you picked and your budget. We send homes for sale in that area only.", "Have us send homes there", CONTACT, bg) },

    { h2: NIGHTLY ? "What does a rental leave, by the year inland and by the night at the beach?" : "What does a yearly rental leave inland?", toc: "Worked example", id: "worked-example", html: () =>
      h.p(NIGHTLY ? `Take two homes at the same price, about ${k1(exN.price)}. After the tax and the HOA fee, the Longs house leased by the year keeps more of its price than the condo rented by the night.`
        : `Take a house in Longs at the middle price, about ${k1(exL.price)}, leased by the year. Here is what is left after the tax and the HOA fee.`) +
      EXAMPLE +
      h.p(NIGHTLY ? `Both are before insurance, repairs and any loan. The condo also pays for cleaning, management, utilities and furniture. Its income is a rental-data company's estimate of the average Airbnb listing in its North Myrtle Beach area, houses and condos of every size, not this condo's. HUD's rent counts the utilities a tenant pays, so the rent you collect on the house is lower.`
        : `This is before insurance, repairs and any loan. HUD's rent counts the utilities a tenant pays, so the rent you collect is lower.`) +
      h.p(`Flood insurance is one of those costs. In the past year, a federal flood policy on a house cost about ${fl("beach_v")} a year at the middle on the oceanfront, where the flood map expects waves. In the rest of the high-risk zone at the beach, it cost about ${fl("beach_a")}. Inland, it was about ${fl("inland_a")} in the high-risk zone. Outside it, a policy cost about ${fl("beach_x")}, at the beach and inland alike.`) },

    { h2: "Why do we run the rent against your price?", toc: "The townhouses", id: "townhouses", html: (bg) =>
      h.p(`We price a rental against the rent it will get now, not against what earlier buyers paid. An agent now on our team learned why in Little River. He helped buyers purchase about eight nearly identical townhouses in a new community there. Each rented for a little over $2,000 a month.`) +
      h.p(`The sale price rose from about $230,000 for the first to about $292,000 for the last, over about a year and a half. The rent stayed the same, so the later buyers lost the cash flow. Before you offer, we put today's rent against your price. The rest of the story, and the rules on renting a new house, are on ${h.a("/invest/new-construction-rentals/", "our page on new construction as a rental")}.`) +
      h.cta("Is today's rent enough for the price you offer?", "Send us the home and your price. We compare your price with what homes like it rent for now.", "Have us test the rent", CONTACT, bg) },

    { h2: "What does the tax on a rental cost in each area?", toc: "The tax", id: "the-tax", html: () =>
      h.p(`South Carolina taxes the home you live in on 4 percent of its value, and a rental or second home on 6 percent. Only the home you live in skips the school operating tax. Outside city limits, a rental's tax bill is about 3.3 times a resident's on the same house; in the towns it differs.`) +
      TAX_TABLE +
      h.p(`These figures are before fees, and they tax the full price. A buyer who claims South Carolina's 25 percent exemption on a sale's new value pays less. ${h.a(RTN, "We run the numbers")} for the address you pick.`) },

    { h2: "Will the rules change?", toc: "Rule changes", id: "rule-changes", html: (bg) =>
      h.p(`Two bills in the state legislature would set a state rule. One would bar cities and counties from banning short-term rentals, and the other would expressly allow them to. Neither has left committee.`) +
      h.p(`North Myrtle Beach's council has held workshops and public sessions on new rules. The city's page lists no new rule.`) +
      h.p(`For a rental of one to three months, each area has its own rule:`) +
      `<ul class="c3w-month">` + ["Myrtle Beach counts any stay under 90 days as short-term, so it needs a marked zone.", "In Conway, the same rule as for a nightly rental: one of three business districts.", "Surfside Beach's code leaves it open, so we ask the town first.", "In Georgetown County's resort zone, a stay may last up to 30 days.", "Outside the towns in Horry County, zoning puts no limit."].map((t) => `<li>${t}</li>`).join("") + `</ul>` +
      h.p(`South Carolina's lodging tax applies to stays of less than 90 days in a row, unless the home is rented fewer than 15 days in a year. No state law bans nightly rentals.`) +
      h.cta("Can the home you like be rented the way you plan?", "Give us the address. We check the town or county rule and the HOA's recorded rules, and tell you if your plan is allowed.", "Ask us about its rental rules", CONTACT, bg) },

    { h2: "What do we check before you offer?", toc: "What we check", id: "what-we-check", html: (bg) =>
      h.p("A house works for your plan only if five things line up. We check each one for the address:") +
      CHECK +
      h.cta("Want these five checks on a home you like?", "Send us the address, and we check each one before you make an offer.", "Have us check a home", CONTACT, bg) },
  ],
  faqTitle: "Where to buy a rental: questions",
  faq: [
    { q: "Where are Airbnbs legal in Myrtle Beach?", a: "In the City of Myrtle Beach, only in the zones the city marks for them. Most neighborhoods of houses are zoned against any stay of less than 90 days. About three in four condos in the city are in a marked zone. North Myrtle Beach has no special zoning step for them, and Surfside Beach allows them in two districts." },
    { q: "Is Myrtle Beach a good place to buy a rental property?", a: `For a yearly lease, the inland areas earn more rent for the price. A year's rent is about ${P1("longs")} percent of a house's price in Longs, against about ${P1("myrtle-beach")} percent in Myrtle Beach. For a nightly rental, buy at the beach, where the rules for the address allow it.` },
    { q: "North Myrtle Beach or Myrtle Beach for a rental?", a: `For a nightly rental, North Myrtle Beach asks only for a license, the lodging taxes and its everyday rules. Myrtle Beach allows it only in marked zones, where most of its condos are.${nx(" Nightly rentals took in more a year on average in North Myrtle Beach.")} The middle condo sold for about ${k1(NMB.condo_median_sale)} in North Myrtle Beach and about $${(Math.round(MB.condo_median_sale / 5000) * 5000).toLocaleString("en-US")} in Myrtle Beach.` },
    { q: "Is Murrells Inlet in Horry or Georgetown County?", a: "Both. The county line runs through Murrells Inlet. The Census area of that name, which this page counts, lies in Georgetown County. Georgetown County requires no business license, and its resort district allows a house to be rented for stays of up to 30 days." },
    { q: "What is the property tax on a rental in Horry County?", a: `Outside the towns, most homes pay about ${usd(per100k(201.0))} a year on each $100,000 of price at the rental rate, before fees. Inside the towns it is higher, and highest in Conway.` },
    { q: "Where is the cheapest place to buy a rental near Myrtle Beach?", a: `Conway for a house, at about ${k1(CW.house_median_sale)} at the middle in the past year's recorded sales, and Little River for a condo, at about ${k1(LR.condo_median_sale)}.` },
  ],
  sources: [
    { name: "SC Code 12-36", href: S.sc1236 },
    { name: "SC Code 12-43", href: S.sc1243 },
    { name: "Myrtle Beach", href: S.mb },
    { name: "North Myrtle Beach", href: S.nmb },
    { name: "Surfside code", href: S.surf },
    { name: "Conway UDO", href: S.conway },
    { name: "Horry zoning", href: S.horryZ },
    { name: "Horry rental tax", href: S.horrySTR },
    { name: "Georgetown zoning", href: S.gtZ },
    { name: "Georgetown license", href: S.gtFaq },
    { name: "Pawleys Island", href: S.pawleys },
    { name: "H.3861", href: S.h3861 },
    { name: "S.442", href: S.s442 },
    { name: "Horry levy", href: S.levy },
    { name: "Georgetown tax", href: S.gtTax },
    { name: "HUD rents", href: S.hud },
    { name: "Census ACS", href: S.acs },
    { name: "Horry deeds", href: S.deeds },
    { name: "Horry parcels", href: S.parcels },
    { name: "Georgetown parcels", href: S.gtGis },
    { name: "FEMA maps", href: S.fema },
    { name: "FEMA policies", href: S.nfip },
  ].concat(NIGHTLY ? [{ name: "AirROI", href: S.airroi }] : []),
  sourcesNote: "Not legal advice. Prices are recorded sales, not values. Listing counts: our feed." + nx(" Nightly income: AirROI's average per listing."),
  afterSources: () => ph.credits() + ITEMLIST(),
  bottomCta: { h2: "Send your budget and your plan.", p: "The request we hear most from investors is for homes with the numbers to back them up. Tell us your budget and how you will rent. We send back homes for sale in the areas that fit, with the rent, the rental-rate tax, the HOA fee and the nightly rule checked.", label: "Send my budget", href: CONTACT },
  keywords: "where to buy rental property in Myrtle Beach, best area to buy Airbnb Myrtle Beach, North Myrtle Beach vs Myrtle Beach investment, Murrells Inlet Georgetown County rental rules, Longs SC rental property",
  about: "Buying a rental property near Myrtle Beach, South Carolina: eleven Grand Strand areas compared by rules, prices, rents, nightly income, tax and flood",
});
