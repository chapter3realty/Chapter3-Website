#!/usr/bin/env node
/*
 * area-map.js: drawn maps that show a newcomer where a community is and what is inside it,
 * and two buttons that open Google Maps.
 *
 * Why: readers from out of state do not know the roads or the towns (voice/RULES.md
 * PLAIN-1, P4). The owner, after seeing the community pages: "the google maps API didnt work I recomend making the
 * picture of where the community is to be more detailed." The live Google embed is dropped:
 * its keyless URL is refused in a frame (X-Frame-Options SAMEORIGIN).
 *
 * Version 2 (use this):
 *
 *   const { communityMaps, regionMap, closeMap, mapLinksHtml, CREDIT2 } = require("<blog-brain>/tools/area-map.js");
 *   const spec = {
 *     home: { name: "Myrtle Trace", lat: 33.778502, lon: -78.996618, town: "Conway", area: "myrtle-trace" },
 *     landmarks: [   // in order of importance; a landmark with no room is left off
 *       { name: "the beach at the Myrtle Beach Boardwalk", short: "Beach and Boardwalk", kind: "beach", lat: 33.6907, lon: -78.8804, minutes: 15 },
 *       { name: "Walmart Supercenter", short: "Walmart", kind: "grocery", lat: 33.777583, lon: -78.989089, minutes: 3 },
 *       { name: "Conway Medical Center", short: "Hospital", kind: "hospital", lat: 33.785483, lon: -79.001894, minutes: 3 },
 *       { name: "the airport", short: "Airport", kind: "airport", lat: 33.6825, lon: -78.924023, minutes: 20 },
 *     ],
 *   };
 *   const { region, close, links } = communityMaps(spec, { dir: "<site>/chapter3realty/images/maps", src: "/images/maps" });
 *   h.figure(region.html, "Where Myrtle Trace is. " + region.credit)   // "Where it is"
 *   h.figure(close.html, "Myrtle Trace up close. " + close.credit)      // "Inside the neighborhood"
 *   links                                                              // the two Google Maps buttons
 *
 *   regionMap(spec, opts)   the "where it is" map alone: ocean and beach, the waterway, the river,
 *                           large lakes, state parks, the airport, main roads with route markers,
 *                           towns, the community outline and pin, landmarks with "about N min".
 *   closeMap(spec, opts)    the close-up alone: every street (names on the main ones), ponds, golf
 *                           course land, the outline, the clubhouse or amenity center, the main
 *                           entrance, a grocery or hospital that fits the frame, scale bar, north arrow.
 *   mapLinksHtml({ name, lat, lon })   "Open in Google Maps" (btn btn-brass) and "Get directions"
 *                           (btn btn-outline). Plain links; nothing loads from Google until a tap.
 *
 *   Each map returns { html, svg, inline, bytes, width, height, alt, caption, credit, frame,
 *   labels, boxes, dropped }. html is the inline <svg> when it is 60 KB or less; otherwise
 *   the svg is written to opts.dir and html is an <img src width height alt loading="lazy">
 *   (opts.src is the url folder). Over 150 KB is an error. Every caption must carry CREDIT2.
 *
 * Spec fields (version 2):
 *   home        { name, lat, lon, town?, area?, label? }. town is the town the page names; the map
 *               says "in", "just outside" or "near" it from the town's outline. area is the key in
 *               tools/geo/grand-strand-v2.json (found from the point when left out). label is a
 *               shorter name for the map.
 *   landmarks   [{ name, short?, kind, lat, lon, minutes?, map? }]. kind is an icon name from
 *               tools/icons.js. minutes is the drive time from a fact ledger row, never a guess.
 *               map: "region", "close" or "both". By default a grocery or hospital goes on the
 *               close-up when it fits there; communityMaps keeps a grocery off the region map.
 *   amenity     optional: the close-up pin's name as the page says it ("Clubhouse"), or
 *               { label, lat, lon, street? }. The point and street default to the cache; a
 *               new point drops the cached street. Name it as the page does: a reader saw
 *               "Amenity center" on the map and "clubhouse" in the text and could not tell
 *               if they were one place.
 *   entrance    optional { label, lat, lon, on? }, or false for none; default from the cache.
 *   alt, closeAlt, caption, closeCaption, minSpanKm, coast: optional overrides.
 *
 * Command line:
 *
 *   node tools/area-map.js places.json [--dir <dir> --src <url>]   # region map html
 *   node tools/area-map.js places.json --close [--dir ...]          # close-up html
 *   node tools/area-map.js places.json --links                      # the two buttons
 *   python3 -I tools/geo/build-geo.py --work <dir>                  # rebuild the version 2 data
 *
 * Data (tools/geo/grand-strand-v2.json; sources and licenses are in the file): U.S. Census
 * Bureau TIGER/Line 2026 (public domain) for the coast, water, roads, route numbers, parks,
 * airport, towns and streets; Horry County GIS for community outlines (parcels layer 24),
 * streets TIGER lacks (roads layer 18), ponds (basemap hydro) and golf course land. A new
 * community needs an entry in AREAS in tools/geo/build-geo.py and a rebuild.
 *
 * What version 2 keeps to:
 *   - No external request, no script. Text is DM Sans and Fraunces, as on the site.
 *   - Labels never overlap: each one has a box (turned boxes for names that bend with a
 *     street), and a label with no clear spot is dropped, low priority first.
 *   - Phone first, for readers in their sixties (buyer reads v6, batch 2026-10-a): on a 390 px
 *     phone, where a map shows 342 px wide, place names are 13 px or more, drive times 12 px
 *     or more, street names about 12 px (SZ). On wider screens a style block shrinks labels,
 *     markers and road widths, so the map reads the same at 760 px.
 *   - No label is cut at the edge: each label box is a little wider than its text (tw2) and
 *     keeps EDGE units from the frame.
 *   - Less small print: four route markers at most, one a route; a small place ("Carolina
 *     Forest") only when a landmark on the map is in it; six street names at most on the
 *     close-up, the entrance road first. No label sits on the community's outline on the
 *     region map, and a landmark outside it keeps its name outside it on the close-up.
 *   - The airport is "Myrtle Beach airport", not "Airport", when the landmark is at that
 *     airport (or the airport ground shows with no landmark for it).
 *
 * Version 1 (kept so older specs build; do not use for new pages):
 *   areaMap(places), areaMapSvg(places): the first drawn map (OpenStreetMap coast, ODbL,
 *   caption must carry CREDIT). liveMapHtml(...): DEPRECATED, replaced by mapLinksHtml; the
 *   keyless Google embed is refused in a frame. node tools/area-map.js places.json --v1 [--live].
 *   node tools/area-map.js --refresh-geo refetches the version 1 data from OpenStreetMap.
 */
"use strict";
const fs = require("fs"), path = require("path");
const { iconInner, resolveIcon } = require("./icons.js");

const GEO_FILE = path.join(__dirname, "geo", "grand-strand.json");
const CREDIT = "Map data © OpenStreetMap contributors (ODbL).";
const DATA_BBOX = [-79.45, 33.25, -78.35, 34.05]; // west, south, east, north
const MAX_BYTES = 40 * 1024;

/* Site palette (BRAND.md), plus two water tints made from Slate. */
const C = { land: "#fbf8f3", water: "#d3e0e5", river: "#a9c3cd", sand: "#e8c99a", navy: "#1c2028", brass: "#c4783a", brassInk: "#91592b", slate: "#5c6b78", waterInk: "#3f6275", white: "#ffffff", rule: "rgba(28,32,40,.15)" };

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const r1 = (n) => { const v = Math.round(n * 10) / 10; return Object.is(v, -0) ? "0" : String(v); };

let GEO = null;
function loadGeo() {
  if (!GEO) GEO = JSON.parse(fs.readFileSync(GEO_FILE, "utf8"));
  return GEO;
}
const pairs = (flat) => { const out = []; for (let i = 0; i < flat.length; i += 2) out.push([flat[i], flat[i + 1]]); return out; };

/* ---------------- geometry ---------------- */

function simplify(pts, tol) { // Douglas-Peucker, iterative
  if (pts.length < 3) return pts.slice();
  const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]], t2 = tol * tol;
  while (stack.length) {
    const [a, b] = stack.pop(); let best = -1, bi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      let d;
      if (L === 0) d = (px - ax) ** 2 + (py - ay) ** 2;
      else { const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / L)); d = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2; }
      if (d > best) { best = d; bi = i; }
    }
    if (best > t2) { keep[bi] = 1; stack.push([a, bi], [bi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

function clipPolygon(pts, x0, y0, x1, y1) { // Sutherland-Hodgman against a rectangle
  const edges = [
    [(p) => p[0] >= x0, (p, q) => [x0, p[1] + (q[1] - p[1]) * (x0 - p[0]) / (q[0] - p[0])]],
    [(p) => p[0] <= x1, (p, q) => [x1, p[1] + (q[1] - p[1]) * (x1 - p[0]) / (q[0] - p[0])]],
    [(p) => p[1] >= y0, (p, q) => [p[0] + (q[0] - p[0]) * (y0 - p[1]) / (q[1] - p[1]), y0]],
    [(p) => p[1] <= y1, (p, q) => [p[0] + (q[0] - p[0]) * (y1 - p[1]) / (q[1] - p[1]), y1]],
  ];
  let out = pts;
  for (const [inside, cut] of edges) {
    const inp = out; out = [];
    for (let i = 0; i < inp.length; i++) {
      const p = inp[i], q = inp[(i + 1) % inp.length];
      if (inside(q)) { if (!inside(p)) out.push(cut(p, q)); out.push(q); }
      else if (inside(p)) out.push(cut(p, q));
    }
    if (!out.length) return [];
  }
  return out;
}

function clipLine(pts, x0, y0, x1, y1) { // Liang-Barsky per segment; returns visible pieces
  const pieces = []; let cur = null;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], dx = bx - ax, dy = by - ay;
    let t0 = 0, t1 = 1, ok = true;
    for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
      if (p === 0) { if (q < 0) { ok = false; break; } continue; }
      const t = q / p;
      if (p < 0) { if (t > t1) { ok = false; break; } if (t > t0) t0 = t; }
      else { if (t < t0) { ok = false; break; } if (t < t1) t1 = t; }
    }
    if (!ok) { if (cur) { pieces.push(cur); cur = null; } continue; }
    const A = [ax + t0 * dx, ay + t0 * dy], B = [ax + t1 * dx, ay + t1 * dy];
    if (!cur || t0 > 0) { if (cur) pieces.push(cur); cur = [A]; }
    cur.push(B);
    if (t1 < 1) { pieces.push(cur); cur = null; }
  }
  if (cur) pieces.push(cur);
  return pieces.filter((p) => p.length > 1);
}

function inPoly(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}

function distToLine(pt, line) {
  let best = Infinity;
  for (let i = 1; i < line.length; i++) {
    const [ax, ay] = line[i - 1], [bx, by] = line[i], dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((pt[0] - ax) * dx + (pt[1] - ay) * dy) / L)) : 0;
    best = Math.min(best, Math.hypot(pt[0] - ax - t * dx, pt[1] - ay - t * dy));
  }
  return best;
}

const pathD = (pts, close) => "M" + pts.map((p) => r1(p[0]) + " " + r1(p[1])).join("L") + (close ? "Z" : "");

/* ---------------- text measure ---------------- */

/* DM Sans widths in em, rounded up a little so a label never runs past its box. */
function textWidth(s, size, spacing = 0) {
  let w = 0;
  for (const ch of String(s)) {
    if (ch === " ") w += 0.26;
    else if (/[iljtf.,'’:;|!]/.test(ch)) w += 0.29;
    else if (/[rI1]/.test(ch)) w += 0.38;
    else if (/[mwMW]/.test(ch)) w += 0.86;
    else if (/[A-Z]/.test(ch)) w += 0.68;
    else if (/[0-9]/.test(ch)) w += 0.57;
    else w += 0.55;
  }
  return w * size * 1.04 + spacing * size * String(s).length;
}

function wrap(s, max) {
  const words = String(s).split(/\s+/), lines = [];
  let cur = "";
  for (const w of words) {
    if (cur && (cur + " " + w).length > max) { lines.push(cur); cur = w; } else cur = cur ? cur + " " + w : w;
  }
  if (cur) lines.push(cur);
  if (lines.length > 2) return [lines[0], lines.slice(1).join(" ")];
  return lines;
}

/* ---------------- layout ---------------- */

const overlap = (a, b, pad = 0) => a.x0 < b.x1 + pad && b.x0 < a.x1 + pad && a.y0 < b.y1 + pad && b.y0 < a.y1 + pad;
const area = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

class Layout {
  constructor(W, H) { this.W = W; this.H = H; this.boxes = []; }
  inside(b, m = 3) { return b.x0 >= m && b.y0 >= m && b.x1 <= this.W - m && b.y1 <= this.H - m; }
  free(b, pad = 2, ignore) { return this.boxes.every((o) => (ignore && ignore(o)) || !overlap(b, o, pad)); }
  fits(b, pad, ignore) { return this.inside(b) && this.free(b, pad, ignore); }
  cost(b) { let c = this.inside(b) ? 0 : 1e6; for (const o of this.boxes) c += area(b, o) * (o.kind === "marker" ? 3 : 1); return c; }
  add(b, kind, owner) { const o = { ...b, kind, owner }; this.boxes.push(o); return o; }
}

/* Candidate spots for a w x h label beside a point marker of radius r.
   Each returns { anchor, x, y } with x the text anchor x and y the box top, relative to the point. */
function besideCandidates(w, h, r, gaps = [0, 7, 16, 28]) {
  const g = 4, k = r * 0.72, out = [];
  for (const d of gaps) {
    out.push(
      { anchor: "start", x: r + g + d, y: -h / 2 },
      { anchor: "end", x: -(r + g + d), y: -h / 2 },
      { anchor: "middle", x: 0, y: r + g + d },
      { anchor: "middle", x: 0, y: -(r + g + d) - h },
      { anchor: "start", x: k + g + d * 0.7, y: -k - h + 3 - d * 0.7 },
      { anchor: "start", x: k + g + d * 0.7, y: k - 3 + d * 0.7 },
      { anchor: "end", x: -(k + g + d * 0.7), y: -k - h + 3 - d * 0.7 },
      { anchor: "end", x: -(k + g + d * 0.7), y: k - 3 + d * 0.7 },
    );
  }
  return out;
}
const boxOf = (px, py, c, w, h) => {
  const x0 = c.anchor === "start" ? px + c.x : c.anchor === "end" ? px + c.x - w : px + c.x - w / 2;
  return { x0, y0: py + c.y, x1: x0 + w, y1: py + c.y + h };
};

/* ---------------- words ---------------- */

const DIRS = ["east", "northeast", "north", "northwest", "west", "southwest", "south", "southeast"];
function direction(from, to) { // compass word for "to" as seen from "from"
  const dx = (to.lon - from.lon) * Math.cos(from.lat * Math.PI / 180), dy = to.lat - from.lat;
  const a = (Math.atan2(dy, dx) * 180 / Math.PI + 360 + 22.5) % 360;
  return DIRS[Math.floor(a / 45)];
}
function km(a, b) {
  const R = 6371, t = Math.PI / 180, dLat = (b.lat - a.lat) * t, dLon = (b.lon - a.lon) * t;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
const roundMiles = (mi) => (mi < 1.5 ? "about 1 mile" : `about ${mi < 10 ? Math.round(mi) : Math.round(mi / 5) * 5} miles`);
const KIND_WORD = { beach: "the beach", airport: "the airport", hospital: "the hospital", grocery: "a grocery store", shopping: "shopping", golf: "a golf course" };

function nearestCoast(home, geo) {
  const coast = pairs(geo.coast); let best = null, bd = Infinity;
  for (const [lon, lat] of coast) { const d = km(home, { lat, lon }); if (d < bd) { bd = d; best = { lat, lon }; } }
  return { point: best, km: bd };
}

const mins = (n) => `${n} minute${n === 1 ? "" : "s"}`;
function describe(spec, geo) {
  const home = spec.home;
  const towns = geo.towns.filter((t) => t.main);
  let where;
  if (home.town) where = `is in ${home.town}`;
  else { const t = towns.slice().sort((a, b) => km(home, a) - km(home, b))[0]; where = `is near ${t.name}`; }
  const coast = nearestCoast(home, geo);
  const beach = (spec.landmarks || []).find((l) => resolveKind(l.kind) === "beach" && l.minutes);
  let sea;
  if (coast.km < 1.2) sea = "close to the beach";
  else if (beach) sea = `about ${mins(beach.minutes)} ${coast.km > 3 ? "inland " : ""}from the beach by car`;
  else sea = `${roundMiles(coast.km / 1.609)} inland from the ocean`;
  const mb = geo.towns.find((t) => t.name === "Myrtle Beach");
  let rel = "";
  if (mb && km(home, mb) > 5 && !/Myrtle Beach$/.test(home.town || "")) rel = `, ${direction(mb, home)} of Myrtle Beach`;
  let s = `${home.name} ${where}, ${sea}${rel}.`;
  const shown = (spec.landmarks || []).filter((l) => l !== beach).map((l) => l.minutes ? `${l.name}, about ${mins(l.minutes)} away` : l.name);
  if (shown.length) s += ` The map also shows ${shown.length > 1 ? shown.slice(0, -1).join("; ") + "; and " + shown.at(-1) : shown[0]}.`;
  return s;
}

function resolveKind(kind) { try { return resolveIcon(kind || "pin"); } catch { return "pin"; } }

/* ---------------- the map ---------------- */

function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "map"; }

function validate(spec) {
  if (!spec || !spec.home) throw new Error("area-map: places need a home { name, lat, lon }");
  const all = [spec.home, ...(spec.landmarks || [])];
  for (const p of all) {
    if (!p.name || typeof p.lat !== "number" || typeof p.lon !== "number") throw new Error(`area-map: every place needs name, lat, lon: ${JSON.stringify(p)}`);
    const [w, s, e, n] = DATA_BBOX;
    if (p.lon < w || p.lon > e || p.lat < s || p.lat > n) throw new Error(`area-map: ${p.name} (${p.lat}, ${p.lon}) is outside the cached Grand Strand data ${DATA_BBOX.join(", ")}. Widen DATA_BBOX and run --refresh-geo.`);
    if (p.minutes !== undefined && !(Number.isFinite(p.minutes) && p.minutes > 0)) throw new Error(`area-map: minutes for ${p.name} must be a positive number`);
  }
}

function areaMap(spec, opts = {}) {
  validate(spec);
  const geo = loadGeo();
  const W = opts.width || 400;
  const home = spec.home, lms = spec.landmarks || [];
  const lat0 = home.lat, lon0 = home.lon, kx = 111.32 * Math.cos(lat0 * Math.PI / 180), ky = 110.57;
  const toKm = (lon, lat) => [(lon - lon0) * kx, (lat0 - lat) * ky];

  /* Frame: every point, plus the nearest beach, with room for the pin and labels. */
  const framePts = [home, ...lms].map((p) => toKm(p.lon, p.lat));
  const coastNear = nearestCoast(home, geo);
  if (spec.coast !== false && coastNear.km < 30) framePts.push(toKm(coastNear.point.lon, coastNear.point.lat + 0.004));
  const ht = home.town && geo.towns.find((t) => t.name === home.town);
  if (ht && km(home, ht) < 15) framePts.push(toKm(ht.lon, ht.lat));
  let bx0 = Math.min(...framePts.map((p) => p[0])), bx1 = Math.max(...framePts.map((p) => p[0]));
  let by0 = Math.min(...framePts.map((p) => p[1])), by1 = Math.max(...framePts.map((p) => p[1]));
  const padKm = Math.max(0.6, 0.08 * Math.max(bx1 - bx0, by1 - by0));
  bx0 -= padKm; bx1 += padKm; by0 -= padKm; by1 += padKm;
  const M = { l: 40, r: 40, t: 56, b: 34 };
  let spanX = (bx1 - bx0) / (1 - (M.l + M.r) / W);
  let spanY = (by1 - by0) + (M.t + M.b) * spanX / W;
  const minSpan = spec.minSpanKm || 8;
  spanX = Math.max(spanX, minSpan); spanY = Math.max(spanY, minSpan);
  const rMin = 0.75, rMax = 1.12;
  if (spanY / spanX < rMin) spanY = spanX * rMin;
  if (spanY / spanX > rMax) spanX = spanY / rMax;
  const cx = (bx0 + bx1) / 2 + (M.l - M.r) / 2 * spanX / W, cy = (by0 + by1) / 2 - (M.t - M.b) / 2 * spanX / W;
  const fx0 = cx - spanX / 2, fy0 = cy - spanY / 2, s = W / spanX, H = Math.round(spanY * s);
  const P = (lon, lat) => { const [x, y] = toKm(lon, lat); return [(x - fx0) * s, (y - fy0) * s]; };
  const unP = (x, y) => ({ lon: lon0 + (x / s + fx0) / kx, lat: lat0 - (y / s + fy0) / ky });

  const id = opts.id || "c3m-" + slug(home.name);
  const L = new Layout(W, H);
  const out = { defs: [], under: [], marks: [], labels: [] };

  /* Water. Ocean = coastline (land on its left, OSM rule) closed far out at sea. */
  const coast = pairs(geo.coast);
  const sea = [...coast, [-78.0, 33.75], [-78.0, 32.9], [-79.6, 32.9], [-79.6, 33.1]];
  const pad = 12;
  let oceanPx = clipPolygon(sea.map(([lo, la]) => P(lo, la)), -pad, -pad, W + pad, H + pad);
  oceanPx = simplify(oceanPx, 0.6);
  const coastPx = clipLine(coast.map(([lo, la]) => P(lo, la)), -pad, -pad, W + pad, H + pad).map((l) => simplify(l, 0.6));
  const waterPieces = [];
  for (const wtr of geo.water) {
    for (const line of wtr.lines) {
      for (const piece of clipLine(pairs(line).map(([lo, la]) => P(lo, la)), -pad, -pad, W + pad, H + pad)) {
        const sp = simplify(piece, 0.7);
        if (sp.length > 1) waterPieces.push({ name: wtr.name, pts: sp });
      }
    }
  }
  for (const c of coastPx) out.under.push(`<path d="${pathD(c)}" fill="none" stroke="${C.sand}" stroke-width="7" stroke-linejoin="round"/>`);
  for (const wp of waterPieces) out.under.push(`<path d="${pathD(wp.pts)}"/>`);
  if (oceanPx.length > 2) out.under.push(`<path d="${pathD(oceanPx, true)}" fill="${C.water}"/>`);

  /* Fixed furniture: scale bar (bottom left) and north arrow (top right). */
  const pxPerMile = s * 1.609;
  const miles = [0.5, 1, 2, 3, 5, 10, 15, 20].filter((m) => m * pxPerMile <= W * 0.26).pop() || 0.5;
  const bar = miles * pxPerMile, sbY = H - 12;
  L.add({ x0: 6, y0: sbY - 22, x1: 12 + Math.max(bar, 60) + 4, y1: H - 4 }, "furniture");
  L.add({ x0: W - 30, y0: 6, x1: W - 6, y1: 42 }, "furniture");

  /* Home pin. The tip is on the point. */
  const [hx, hy] = P(home.lon, home.lat);
  const pinBox = L.add({ x0: hx - 14, y0: hy - 41, x1: hx + 14, y1: hy + 2 }, "marker", "home");

  /* Landmark markers, nudged off each other and off the pin. */
  const R = 12, used = new Set(["home"]);
  const marks = lms.map((lm, i) => {
    const kind = resolveKind(lm.kind); used.add(kind);
    const [tx, ty] = P(lm.lon, lm.lat);
    let x = tx, y = ty;
    const box = () => ({ x0: x - R - 1, y0: y - R - 1, x1: x + R + 1, y1: y + R + 1 });
    for (let step = 0; step < 80; step++) {
      const hit = L.boxes.find((o) => o.kind !== "furniture" && overlap(box(), o, 2));
      if (!hit) break;
      let vx = x - (hit.x0 + hit.x1) / 2, vy = y - (hit.y0 + hit.y1) / 2;
      if (Math.hypot(vx, vy) < 0.5) { vx = 1; vy = 0.6; }
      const n = Math.hypot(vx, vy); x += 3 * vx / n; y += 3 * vy / n;
      x = Math.max(R + 4, Math.min(W - R - 4, x)); y = Math.max(R + 4, Math.min(H - R - 4, y));
    }
    L.add(box(), "marker", "lm" + i);
    return { lm, kind, tx, ty, x, y, moved: Math.hypot(x - tx, y - ty) > 3 };
  });

  /* Labels. Home first, then the home's town, then landmarks, then the other towns. */
  const homeName = home.label || home.name;
  const hw = textWidth(homeName, 17) + 4, hh = 20;
  const homeCands = [
    { anchor: "start", x: 17, y: -26 - hh / 2 }, { anchor: "end", x: -17, y: -26 - hh / 2 },
    { anchor: "middle", x: 0, y: -44 - hh }, { anchor: "middle", x: 0, y: 6 },
    { anchor: "start", x: 24, y: -26 - hh / 2 }, { anchor: "end", x: -24, y: -26 - hh / 2 },
  ];
  const notHome = (o) => o.owner === "home" && o.kind === "marker";
  let hc = homeCands.find((c) => L.fits(boxOf(hx, hy, c, hw, hh), 2, notHome));
  if (!hc) hc = homeCands.slice().sort((a, b) => L.cost(boxOf(hx, hy, a, hw, hh)) - L.cost(boxOf(hx, hy, b, hw, hh)))[0];
  L.add(boxOf(hx, hy, hc, hw, hh), "label", "home");

  const townSet = geo.towns.filter((t) => spec.towns === "all" || t.main);
  const townLabels = [];
  const placeTown = (t, priority) => {
    if (lms.some((l) => l.name === t.name) || t.name === home.name) return;
    const [x, y] = P(t.lon, t.lat);
    if (x < 0 || x > W || y < 0 || y > H) return;
    const text = t.name.toUpperCase(), w = textWidth(text, 11, 0.1) + 4, h = 14;
    const cands = [{ anchor: "middle", x: 0, y: -h / 2 }, { anchor: "middle", x: 0, y: -h - 4 }, { anchor: "middle", x: 0, y: 4 },
      { anchor: "start", x: 6, y: -h / 2 }, { anchor: "end", x: -6, y: -h / 2 }, { anchor: "middle", x: 0, y: -h - 14 }, { anchor: "middle", x: 0, y: 14 }];
    const c = cands.find((c) => L.fits(boxOf(x, y, c, w, h), 3));
    if (!c) return;
    const b = L.add(boxOf(x, y, c, w, h), "town", t.name);
    townLabels.push({ t, x, y, c, text, box: b, priority });
  };
  const homeTown = home.town && townSet.find((t) => t.name === home.town);
  if (homeTown) placeTown(homeTown, true);

  const lmLabels = marks.map((m, i) => {
    const name = m.lm.short || m.lm.name;
    const lines = wrap(name, 18), mins = m.lm.minutes ? `about ${m.lm.minutes} min` : "";
    const w = Math.max(...lines.map((l) => textWidth(l, 13.5)), mins ? textWidth(mins, 12.5) : 0) + 4;
    const h = lines.length * 16 + (mins ? 15 : 0) + 2;
    const cands = besideCandidates(w, h, R);
    const own = (o) => o.kind === "marker" && o.owner === "lm" + i;
    let c = cands.find((c) => L.fits(boxOf(m.x, m.y, c, w, h), 2, own));
    if (!c) {
      /* Nudge: a landmark label may push out a town label (not the home's town). */
      c = cands.find((c) => L.fits(boxOf(m.x, m.y, c, w, h), 2, (o) => own(o) || (o.kind === "town" && o.owner !== (home.town || ""))));
      if (c) {
        const b = boxOf(m.x, m.y, c, w, h);
        for (const tl of townLabels.filter((tl) => overlap(b, tl.box, 2))) { L.boxes.splice(L.boxes.indexOf(tl.box), 1); townLabels.splice(townLabels.indexOf(tl), 1); }
      }
    }
    if (!c) c = cands.slice().sort((a, b) => L.cost(boxOf(m.x, m.y, a, w, h)) - L.cost(boxOf(m.x, m.y, b, w, h)))[0];
    L.add(boxOf(m.x, m.y, c, w, h), "label", "lm" + i);
    return { m, c, w, h, lines, mins };
  });

  townSet.filter((t) => t !== homeTown).sort((a, b) => km(home, a) - km(home, b)).forEach((t) => placeTown(t, false));

  /* Ocean label: inside the ocean, clear of everything, not hugging the coast. */
  let oceanLabel = null;
  if (oceanPx.length > 2) {
    const text = "Atlantic Ocean", w = textWidth(text, 14, 0.06) + 6, h = 18;
    let best = null;
    for (let y = 10; y < H - 10; y += 8) for (let x = 10; x < W - 10; x += 8) {
      const b = { x0: x - w / 2, y0: y - h / 2, x1: x + w / 2, y1: y + h / 2 };
      if (!L.fits(b, 4)) continue;
      if (![[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1], [x, y]].every((p) => inPoly(p, oceanPx))) continue;
      const d = Math.min(...coastPx.map((c) => distToLine([x, y], c)));
      if (d < 14) continue;
      const score = Math.min(d, 40) - 0.04 * Math.hypot(x - W / 2, y - H / 2);
      if (!best || score > best.score) best = { x, y, b, score };
    }
    if (best) { L.add(best.b, "label", "ocean"); oceanLabel = { x: best.x, y: best.y, text }; }
  }

  /* Water labels along the line, turned to follow it. */
  const waterLabels = [];
  const byName = {};
  for (const wp of waterPieces) (byName[wp.name] = byName[wp.name] || []).push(wp.pts);
  for (const [name, pieces] of Object.entries(byName)) {
    const text = name, w = textWidth(text, 12) + 4, h = 15;
    let best = null;
    for (const pts of pieces) {
      const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
      const total = cum.at(-1); if (total < w + 20) continue;
      const at = (d) => { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1])]; };
      for (let d = w / 2 + 8; d < total - w / 2 - 8; d += 10) {
        const [x, y] = at(d), a1 = at(d - w / 2), a2 = at(d + w / 2);
        let ang = Math.atan2(a2[1] - a1[1], a2[0] - a1[0]) * 180 / Math.PI;
        if (ang >= 90) ang -= 180; if (ang < -90) ang += 180;
        /* Straight enough: the midpoint must sit near the chord. */
        const bend = distToLine([x, y], [a1, a2]);
        if (bend > 10) continue;
        const rad = ang * Math.PI / 180, bw = Math.abs(w * Math.cos(rad)) + Math.abs(h * Math.sin(rad)), bh = Math.abs(w * Math.sin(rad)) + Math.abs(h * Math.cos(rad));
        const b = { x0: x - bw / 2, y0: y - bh / 2, x1: x + bw / 2, y1: y + bh / 2 };
        if (!L.fits(b, 3)) continue;
        const score = -Math.abs(d - total / 2) * 0.5 - Math.abs(ang) * 0.6 - bend * 4 + total * 0.2;
        if (!best || score > best.score) best = { x, y, ang, b, score };
      }
    }
    if (best) { L.add(best.b, "label", name); waterLabels.push({ text, ...best }); }
  }

  /* ---------- write the svg ---------- */
  for (const k of used) out.defs.push(`<symbol id="${id}-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconInner(k)}</symbol>`);
  const sym = (k, x, y, size, color) => `<use href="#${id}-${k}" x="${r1(x)}" y="${r1(y)}" width="${size}" height="${size}" color="${color}"/>`;
  const g = (x, y, inner, cls = "s") => `<g transform="translate(${r1(x)} ${r1(y)})"><g class="${cls}">${inner}</g></g>`;
  const txt = (cls, x, y, anchor, body, extra = "") => `<text class="${cls}" x="${r1(x)}" y="${r1(y)}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}${extra}>${body}</text>`;

  /* leaders for markers that were moved */
  for (const m of marks) if (m.moved) out.marks.push(`<path d="M${r1(m.tx)} ${r1(m.ty)}L${r1(m.x)} ${r1(m.y)}" stroke="${C.navy}" stroke-width="1.2"/><circle cx="${r1(m.tx)}" cy="${r1(m.ty)}" r="2.6" fill="${C.navy}"/>`);

  /* towns */
  for (const tl of townLabels) {
    const tx = tl.c.anchor === "middle" ? tl.c.x : tl.c.x;
    out.labels.push(g(tl.x, tl.y, txt("t", tx, tl.c.y + 10.5, tl.c.anchor, esc(tl.text))));
  }
  /* water and ocean */
  for (const wl of waterLabels) out.labels.push(`<g transform="translate(${r1(wl.x)} ${r1(wl.y)}) rotate(${r1(wl.ang)})"><g class="s">${txt("w", 0, 4, "middle", esc(wl.text))}</g></g>`);
  if (oceanLabel) out.labels.push(g(oceanLabel.x, oceanLabel.y, txt("o", 0, 5, "middle", esc(oceanLabel.text))));

  /* landmarks */
  lmLabels.forEach(({ m, c, lines, mins }) => {
    let inner = `<circle r="${R}" fill="${C.white}" stroke="${C.brassInk}" stroke-width="1.6"/>` + sym(m.kind, -8, -8, 16, C.navy);
    const tAnchor = c.anchor, x = c.x;
    let y = c.y + 13;
    let body = lines.map((l, i) => `<tspan x="${r1(x)}"${i ? ` dy="16"` : ""}>${esc(l)}</tspan>`).join("");
    inner += txt("l", x, y, tAnchor, body);
    if (mins) inner += txt("m", x, y + (lines.length - 1) * 16 + 15, tAnchor, esc(mins));
    out.marks.push(g(m.x, m.y, inner));
  });

  /* home pin and label */
  {
    let inner = `<ellipse cx="0" cy="1" rx="7" ry="2.4" fill="${C.navy}" opacity=".18"/>`
      + `<path d="M0 0C-3-6-13-14-13-26a13 13 0 1 1 26 0c0 12-10 20-13 26z" fill="${C.brass}" stroke="${C.navy}" stroke-width="1.5"/>`
      + sym("home", -8.5, -34.5, 17, C.white)
      + txt("h", hc.x, hc.y + 15, hc.anchor, esc(homeName));
    out.marks.push(g(hx, hy, inner));
  }

  /* scale bar and north arrow */
  const furniture = `<path d="M12 ${r1(sbY - 4)}V${r1(sbY)}H${r1(12 + bar)}V${r1(sbY - 4)}" fill="none" stroke="${C.navy}" stroke-width="1.5"/>`
    + g(12, sbY - 8, txt("t", 0, 0, "start", `${miles} ${miles === 1 ? "MILE" : "MILES"}`))
    + g(W - 18, 22, `<path d="M0-12 5 2 0-1-5 2z" fill="${C.navy}"/>` + txt("t", 0, 15, "middle", "N"));

  const alt = spec.alt || describe(spec, geo);
  const css = `#${id} text{font-family:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif;paint-order:stroke;stroke:${C.land};stroke-width:3.5px;stroke-linejoin:round}`
    + `#${id} .h{font:500 17px 'Fraunces',Georgia,serif;fill:${C.navy}}#${id} .l{font-size:13.5px;font-weight:500;fill:${C.navy}}#${id} .m{font-size:12.5px;fill:${C.brassInk}}`
    + `#${id} .t{font-size:11px;font-weight:500;letter-spacing:.1em;fill:${C.slate}}#${id} .w{font:italic 12px 'Fraunces',Georgia,serif;fill:${C.waterInk}}`
    + `#${id} .o{font:italic 14px 'Fraunces',Georgia,serif;letter-spacing:.06em;fill:${C.waterInk}}`
    + `@media(min-width:600px){#${id} .s{transform:scale(.8)}}@media(min-width:900px){#${id} .s{transform:scale(.66)}}`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(alt)}" style="display:block;width:100%;height:auto;max-width:760px;background:${C.land};border:1px solid ${C.rule}">`
    + `<style>${css}</style><defs>${out.defs.join("")}</defs>`
    + `<g stroke="${C.river}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">${out.under.filter((u) => !/fill="/.test(u)).join("")}</g>`
    + out.under.filter((u) => /fill="/.test(u)).join("")
    + furniture + out.labels.join("")
    + `<g class="ic">${out.marks.join("")}</g>`
    + `</svg>`;

  const bytes = Buffer.byteLength(svg);
  if (bytes > MAX_BYTES && !opts.allowLarge) throw new Error(`area-map: svg is ${bytes} bytes, over the ${MAX_BYTES} cap`);
  const tl = unP(0, 0), br = unP(W, H);
  return {
    svg, alt, width: W, height: H, bytes, credit: CREDIT,
    caption: `${spec.caption ? spec.caption.trim() + " " : ""}${CREDIT}`,
    frame: { west: tl.lon, north: tl.lat, east: br.lon, south: br.lat },
    boxes: L.boxes.map((b) => ({ kind: b.kind, owner: b.owner, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 })),
    labels: { home: !!hc, towns: townLabels.map((t) => t.t.name), water: waterLabels.map((w) => w.text), ocean: !!oceanLabel },
  };
}

const areaMapSvg = (spec, opts) => areaMap(spec, opts).svg;

/* ================================================================
 * Map version 2: a region map ("where it is") and a close-up ("inside the neighborhood").
 * Data: tools/geo/grand-strand-v2.json, built by tools/geo/build-geo.py.
 * ================================================================ */

const GEO2_FILE = path.join(__dirname, "geo", "grand-strand-v2.json");
const CREDIT2 = "Map data: U.S. Census Bureau TIGER/Line; Horry County GIS.";
const INLINE_MAX = 60 * 1024, FILE_MAX = 150 * 1024;

/* Site palette (BRAND.md) plus map tints. Water is the version 1 water, a touch deeper. */
const C2 = {
  land: "#f7f3ec", water: "#c9dde6", waterEdge: "#a3c1cf", waterInk: "#3f6275", sand: "#ead4ae",
  park: "#dce8cf", parkEdge: "#c3d6b3", parkInk: "#4a6640", golf: "#e4ecd8", golfEdge: "#cddbbf",
  airport: "#ebe5da", airportEdge: "#d3c9ba",
  street: "#ffffff", streetCase: "#d8cdbd", major: "#ffffff", majorCase: "#a2927f", fwy: "#f3d6ad", fwyCase: "#b8834f",
  navy: "#1c2028", brass: "#c4783a", brassInk: "#91592b", slate: "#5c6b78", streetInk: "#3e4752", white: "#ffffff",
  rule: "rgba(28,32,40,.15)", state: "#7d8792",
};

/* Label sizes, in svg units. A map is 360 units wide and shows about 342 px wide on a 390 px
   phone (0.95 px a unit), so 14 units is about 13.3 px. The first version 2 sizes (10 to 12.5
   units) were "too much tiny print" for readers in their sixties on a phone (buyer reads v6,
   batch 2026-10-a). Now: place names 14 (13 px or more on that phone), drive times 13 (12 px
   or more), street names 12.5, the home name 17. Wider screens shrink them (css2), so the
   map reads the same at 760 px. */
const SZ = { home: 17, place: 14, mins: 13, town: 14, water: 14, ocean: 15, state: 11.5, shield: 11, suf: 8, furn: 11, street: 12.5, name: 14, amenity: 14.5, sub: 12.5 };

/* A label's room. textWidth fits DM Sans within about 5 percent; a phone that shows a
   fallback font draws digits wider. So each box is a little wider than the DM Sans text, and
   every label keeps EDGE units from the frame, so none is cut at the edge (a reader saw
   "Beach about 15 min" cut on the Myrtle Trace map). */
const tw2 = (s, size, spacing = 0) => textWidth(s, size, spacing) * 1.06 + (String(s).match(/[0-9]/g) || []).length * 0.06 * size;
const EDGE = 6;

const decode = (flat, scale) => { const out = []; let x = 0, y = 0; for (let i = 0; i < flat.length; i += 2) { x += flat[i]; y += flat[i + 1]; out.push([x / scale - 80, y / scale + 33]); } return out; };
const bbOf = (rings) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const r of rings) for (const [x, y] of r) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; } return [a, b, c, d]; };

let GEO2 = null;
function loadGeo2() {
  if (GEO2) return GEO2;
  const raw = JSON.parse(fs.readFileSync(GEO2_FILE, "utf8"));
  const d4 = (f) => decode(f, 1e4), d5 = (f) => decode(f, 1e5), R = raw.region;
  const withBB = (o, rings) => Object.assign(o, { bb: bbOf(rings) });
  GEO2 = {
    raw, sources: raw.sources, credit: raw.credit, bbox: raw.bbox, built: raw.built,
    coast: d4(R.coast),
    water: R.water.map((w) => { const rings = w.r.map(d4); return withBB({ a: w.a, rings }, rings); }),
    waterlines: R.waterlines.map((w) => { const pts = d4(w.p); return withBB({ name: w.n, pts }, [pts]); }),
    roads: R.roads.map((r) => { const pts = d4(r.p); return withBB({ tier: r.t, route: r.r || "", pts }, [pts]); }),
    parks: R.parks.map((p) => { const polys = p.r.map((rings) => rings.map(d4)); return withBB({ name: p.n, kind: p.k, polys }, polys.flat()); }),
    airport: (() => { const rings = R.airport.r.map(d4); return withBB({ name: R.airport.n, rings }, rings); })(),
    towns: R.towns.map((t) => { const [lon, lat] = decode(t.at, 1e4)[0]; return { name: t.n, rank: t.rank, kind: t.kind, lat, lon, outline: t.o.map(d4) }; }),
    stateline: R.stateline.map(d4),
    areas: Object.fromEntries(Object.entries(raw.areas).map(([slugKey, a]) => [slugKey, {
      slug: slugKey, name: a.name, box: a.box, amenity: a.amenity, entrance: a.entrance, note: a.entrance_note || "",
      outline: a.outline.map(d5),
      streets: a.streets.map((s) => { const pts = d5(s.p); return withBB({ name: s.n || "", cls: s.c, pts }, [pts]); }),
      water: a.water.map((w) => { const rings = w.r.map(d5); return withBB({ name: w.n || "", rings }, rings); }),
      golf: a.golf.map((g) => { const rings = g.r.map(d5); return withBB({ rings }, rings); }),
    }])),
  };
  return GEO2;
}

/* ---------------- frame and drawing helpers ---------------- */

/* A frame that holds every point, with margins in svg units for labels, at least minSpanKm
   wide and tall, and an aspect (height / width) between rMin and rMax. */
function frame2(points, o) {
  const lats = points.map((p) => p.lat), lons = points.map((p) => p.lon);
  const lat0 = (Math.min(...lats) + Math.max(...lats)) / 2, lon0 = (Math.min(...lons) + Math.max(...lons)) / 2;
  const kx = 111.32 * Math.cos(lat0 * Math.PI / 180), ky = 110.57;
  const toKm = (lon, lat) => [(lon - lon0) * kx, (lat0 - lat) * ky];
  const pk = points.map((p) => toKm(p.lon, p.lat));
  let bx0 = Math.min(...pk.map((p) => p[0])), bx1 = Math.max(...pk.map((p) => p[0]));
  let by0 = Math.min(...pk.map((p) => p[1])), by1 = Math.max(...pk.map((p) => p[1]));
  const pad = Math.max(o.padKm || 0, (o.padFrac || 0) * Math.max(bx1 - bx0, by1 - by0));
  bx0 -= pad; bx1 += pad; by0 -= pad; by1 += pad;
  const W = o.W, M = o.M;
  let spanX = (bx1 - bx0) / (1 - (M.l + M.r) / W);
  let spanY = (by1 - by0) + (M.t + M.b) * spanX / W;
  spanX = Math.max(spanX, o.minSpanKm); spanY = Math.max(spanY, o.minSpanKm * o.rMin);
  if (spanY / spanX < o.rMin) spanY = spanX * o.rMin;
  if (spanY / spanX > o.rMax) spanX = spanY / o.rMax;
  const cx = (bx0 + bx1) / 2 + (M.l - M.r) / 2 * spanX / W, cy = (by0 + by1) / 2 - (M.t - M.b) / 2 * spanX / W;
  const fx0 = cx - spanX / 2, fy0 = cy - spanY / 2, s = W / spanX, H = Math.round(spanY * s);
  const P = (lon, lat) => { const [x, y] = toKm(lon, lat); return [(x - fx0) * s, (y - fy0) * s]; };
  const unP = (x, y) => ({ lon: lon0 + (x / s + fx0) / kx, lat: lat0 - (y / s + fy0) / ky });
  const tl = unP(0, 0), br = unP(W, H);
  return { W, H, s, P, unP, spanX, spanY, view: [tl.lon, br.lat, br.lon, tl.lat], frame: { west: tl.lon, north: tl.lat, east: br.lon, south: br.lat } };
}
const bbHits = (bb, v, m = 0.01) => !(bb[2] < v[0] - m || bb[0] > v[2] + m || bb[3] < v[1] - m || bb[1] > v[3] + m);

/* Path data with one decimal, relative moves after the first point. */
function pathRel(pts, close) {
  const tok = (v) => String(v / 10).replace(/^(-?)0\./, "$1.");
  let d = "", px = 0, py = 0, n = 0;
  for (const [x, y] of pts) {
    const rx = Math.round(x * 10), ry = Math.round(y * 10);
    if (n === 0) d += "M" + tok(rx) + (ry < 0 ? "" : " ") + tok(ry);
    else {
      const dx = rx - px, dy = ry - py;
      if (!dx && !dy) continue;
      const a = tok(dx), b = tok(dy);
      d += (n === 1 ? "l" : (dx < 0 ? "" : " ")) + a + (dy < 0 ? "" : " ") + b;
    }
    px = rx; py = ry; n++;
  }
  return n > 1 ? d + (close ? "z" : "") : "";
}
const ringArea = (r) => { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return a / 2; };

function polyD(F, rings, tol = 0.45, minArea = 1.5, pad = 8) {
  let d = "";
  for (const ring of rings) {
    let px = clipPolygon(ring.map(([lo, la]) => F.P(lo, la)), -pad, -pad, F.W + pad, F.H + pad);
    if (px.length < 3) continue;
    px = simplify(px.concat([px[0]]), tol); px.pop();
    if (px.length < 3 || Math.abs(ringArea(px)) < minArea) continue;
    d += pathRel(px, true);
  }
  return d;
}
function linePieces(F, pts, tol = 0.35, pad = 8) {
  return clipLine(pts.map(([lo, la]) => F.P(lo, la)), -pad, -pad, F.W + pad, F.H + pad).map((l) => simplify(l, tol)).filter((l) => l.length > 1);
}

/* ---------------- label layout with turned boxes ---------------- */

function rect2(cx, cy, w, h, ang = 0) {
  const c = Math.cos(ang), s = Math.sin(ang), hw = w / 2, hh = h / 2;
  const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { cx, cy, w, h, ang, pts, x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) };
}
const rectXY = (x0, y0, x1, y1) => rect2((x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0, 0);
const inflate = (b, p) => rect2(b.cx, b.cy, b.w + 2 * p, b.h + 2 * p, b.ang);
function satOverlap(a, b) {
  if (a.x1 <= b.x0 || b.x1 <= a.x0 || a.y1 <= b.y0 || b.y1 <= a.y0) return false;
  for (const P of [a.pts, b.pts]) for (let i = 0; i < P.length; i++) {
    const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], nx = y2 - y1, ny = x1 - x2;
    let amin = Infinity, amax = -Infinity, bmin = Infinity, bmax = -Infinity;
    for (const [x, y] of a.pts) { const v = x * nx + y * ny; if (v < amin) amin = v; if (v > amax) amax = v; }
    for (const [x, y] of b.pts) { const v = x * nx + y * ny; if (v < bmin) bmin = v; if (v > bmax) bmax = v; }
    if (amax <= bmin || bmax <= amin) return false;
  }
  return true;
}
class Layout2 {
  constructor(W, H) { this.W = W; this.H = H; this.items = []; }
  inside(b, m = EDGE) { return b.x0 >= m && b.y0 >= m && b.x1 <= this.W - m && b.y1 <= this.H - m; }
  hit(b, pad = 2, ignore) { const bb = pad ? inflate(b, pad) : b; return this.items.find((o) => !(ignore && ignore(o)) && satOverlap(bb, o)); }
  fits(b, pad = 2, ignore, m = EDGE) { return this.inside(b, m) && !this.hit(b, pad, ignore); }
  cost(b) { let c = this.inside(b) ? 0 : 1e6; for (const o of this.items) if (satOverlap(b, o)) c += (Math.min(b.x1, o.x1) - Math.max(b.x0, o.x0)) * (Math.min(b.y1, o.y1) - Math.max(b.y0, o.y0)) * (o.kind === "marker" ? 3 : 1); return c; }
  add(b, kind, owner) { const o = Object.assign({}, b, { kind, owner }); this.items.push(o); return o; }
}

/* The best spot for a label of w x h along a set of pixel lines, turned to follow the line.
   offsets: distances from the line to try (0 = on the line). score(x, y) adds a preference. */
function alongLine(L, pieces, w, h, o = {}) {
  const offsets = o.offsets || [0], pad = o.pad == null ? 2 : o.pad, bendMax = o.bendMax || 2.5;
  let best = null;
  for (const pts of pieces) {
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = cum.at(-1); if (total < w + 8) continue;
    const at = (d) => { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1); return [pts[i - 1][0] + t * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + t * (pts[i][1] - pts[i - 1][1])]; };
    const step = o.step || Math.max(6, Math.min(14, total / 30));
    for (let d = w / 2 + 4; d <= total - w / 2 - 4; d += step) {
      const a1 = at(d - w / 2), a2 = at(d + w / 2), mid = at(d);
      let bend = 0; for (const f of [0.25, 0.5, 0.75]) bend = Math.max(bend, distToLine(at(d - w / 2 + f * w), [a1, a2]));
      if (bend > bendMax) continue;
      let ang = Math.atan2(a2[1] - a1[1], a2[0] - a1[0]);
      if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
      if (o.maxAngle && Math.abs(ang) > o.maxAngle) continue;
      const nx = -Math.sin(ang), ny = Math.cos(ang);
      for (const off of offsets) {
        const cx = mid[0] + nx * off, cy = mid[1] + ny * off, b = rect2(cx, cy, w, h, ang);
        if (!L.fits(b, pad, o.ignore, o.margin)) continue;
        if (o.accept && !o.accept(b, off)) continue;
        const score = -Math.abs(ang) * 8 - bend * 3 - Math.abs(off) * 0.2 + (o.score ? o.score(cx, cy, d, total) : -Math.abs(d - total / 2) * 0.05);
        if (!best || score > best.score) best = { b, x: cx, y: cy, ang, score, off };
      }
    }
  }
  return best;
}

/* Joins lines whose ends meet (within tol units) into longer lines, so a street cut into
   pieces can still carry its name. */
function chainPieces(pcs, tol = 1.5) {
  let lines = pcs.map((l) => l.slice());
  const near = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]) <= tol;
  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < lines.length; i++) for (let j = 0; j < lines.length; j++) {
      if (i === j) continue;
      const a = lines[i], b = lines[j];
      let c = null;
      if (near(a.at(-1), b[0])) c = a.concat(b.slice(1));
      else if (near(a.at(-1), b.at(-1))) c = a.concat(b.slice(0, -1).reverse());
      else if (near(a[0], b[0]) && i < j) c = a.slice().reverse().concat(b.slice(1));
      if (c) { lines[i] = c; lines.splice(j, 1); merged = true; break outer; }
    }
  }
  return lines;
}

/* Points every `step` units along a polyline. */
function resample(pts, step) {
  const out = [pts[0].slice()];
  let carry = 0;
  for (let i = 1; i < pts.length; i++) {
    const [ax, ay] = pts[i - 1], [bx, by] = pts[i], L = Math.hypot(bx - ax, by - ay);
    let d = step - carry;
    while (d <= L) { out.push([ax + (bx - ax) * d / L, ay + (by - ay) * d / L]); d += step; }
    carry = L - (d - step);
  }
  return out;
}
const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; };

/* A label that bends with its street (an svg textPath). The text reads left to right, its
   centre on the line. Its room is a row of small turned boxes along the curve, so a curved
   name never covers another label. Returns { d, boxes, x, y } or null. */
function curvedLabel(L, pieces, text, size, o = {}) {
  const w = tw2(text, size) + 3, h = size + 2.5, step = 2, pad = o.pad == null ? 2.5 : o.pad;
  let best = null;
  for (const raw of pieces) {
    let pts = resample(raw, step);
    if (pts.length * step < w + 10) continue;
    for (let pass = 0; pass < 2; pass++) pts = pts.map((p, i) => { const a = pts[Math.max(0, i - 2)], b = pts[Math.min(pts.length - 1, i + 2)]; return [(a[0] + p[0] * 2 + b[0]) / 4, (a[1] + p[1] * 2 + b[1]) / 4]; });
    const half = Math.ceil(w / 2 / step), ext = Math.ceil(w * 0.12 / step);
    for (let c = half + 1; c < pts.length - half - 1; c += o.stride || 3) {
      let seg = pts.slice(c - half, c + half + 1);
      let turn = 0, sharp = 0;
      for (let i = 4; i < seg.length; i += 2) {
        const a1 = Math.atan2(seg[i - 2][1] - seg[i - 4][1], seg[i - 2][0] - seg[i - 4][0]), a2 = Math.atan2(seg[i][1] - seg[i - 2][1], seg[i][0] - seg[i - 2][0]);
        const d = angDiff(a1, a2); turn += d; sharp = Math.max(sharp, Math.abs(d));
      }
      if (sharp > (o.sharp || 0.26) || Math.abs(turn) > (o.turn || 1)) continue;
      const lo = Math.max(0, c - half - ext), hi = Math.min(pts.length - 1, c + half + ext);
      let full = pts.slice(lo, hi + 1);
      const dir = Math.atan2(seg.at(-1)[1] - seg[0][1], seg.at(-1)[0] - seg[0][0]);
      if (Math.cos(dir) < -0.05 || (Math.abs(Math.cos(dir)) <= 0.05 && Math.sin(dir) > 0)) { seg = seg.slice().reverse(); full = full.slice().reverse(); }
      if (o.offset) {
        const shift = (arr) => arr.map((p, i) => { const a = arr[Math.max(0, i - 1)], b = arr[Math.min(arr.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]); return [p[0] - Math.sin(an) * o.offset, p[1] + Math.cos(an) * o.offset]; });
        seg = shift(seg); full = shift(full);
      }
      const k = Math.max(1, Math.round(w / 11)), boxes = [];
      for (let j = 0; j < k; j++) {
        const a = seg[Math.floor(j * (seg.length - 1) / k)], b = seg[Math.floor((j + 1) * (seg.length - 1) / k)];
        boxes.push(rect2((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.hypot(b[0] - a[0], b[1] - a[1]) + 1.5, h, Math.atan2(b[1] - a[1], b[0] - a[0])));
      }
      if (!boxes.every((b) => L.fits(b, pad, null, EDGE - 2)) || (o.accept && !boxes.every(o.accept))) continue;
      const mid = seg[Math.floor(seg.length / 2)];
      const score = -Math.abs(turn) * 6 - sharp * 10 - Math.abs(Math.sin(dir)) * 1.5 + (o.score ? o.score(mid[0], mid[1]) : 0);
      if (!best || score > best.score) {
        /* The baseline sits a little below the line, so the letters centre on it. */
        const off = size * 0.34, base = full.map((p, i) => {
          const a = full[Math.max(0, i - 1)], b = full[Math.min(full.length - 1, i + 1)], an = Math.atan2(b[1] - a[1], b[0] - a[0]);
          return [p[0] - Math.sin(an) * off, p[1] + Math.cos(an) * off];
        });
        best = { score, boxes, d: pathRel(base), x: mid[0], y: mid[1] };
      }
    }
  }
  return best;
}

/* ---------------- shared marks ---------------- */

const KIND_WORD2 = { beach: "the beach", airport: "the airport", hospital: "the hospital", grocery: "a grocery store", shopping: "shopping", golf: "a golf course" };
const mins2 = (n) => `${n} minute${n === 1 ? "" : "s"}`;
const fmtMiles = (mi) => ({ 0.1: "0.1", 0.25: "¼", 0.5: "½" }[mi] || String(mi));

/* Wrap a name into at most two lines of about max characters. */
function wrap2(s, max) {
  const words = String(s).split(/\s+/);
  if (String(s).length <= max || words.length < 2) return [String(s)];
  let best = null;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" "), b = words.slice(i).join(" "), m = Math.max(a.length, b.length);
    if (!best || m < best.m) best = { m, lines: [a, b] };
  }
  return best.lines;
}

/* Brass pin, tip on (0,0), with a white icon. */
const pinSvg = (icon, k = 1) => `<g transform="scale(${k})"><ellipse cx="0" cy="1" rx="7" ry="2.4" fill="${C2.navy}" opacity=".18"/>`
  + `<path d="M0 0C-3-6-13-14-13-26a13 13 0 1 1 26 0c0 12-10 20-13 26z" fill="${C2.brass}" stroke="${C2.navy}" stroke-width="1.5"/>`
  + icon(-8.5, -34.5, 17, C2.white) + `</g>`;

/* Reserve a small dot at each landmark's true spot, so earlier labels leave it uncovered. */
function reserveDots(L, F, lms, prefix) {
  lms.forEach((lm, i) => {
    const [x, y] = F.P(lm.lon, lm.lat);
    if (x > 0 && y > 0 && x < F.W && y < F.H) L.add(rect2(x, y, 6, 6), "dot", prefix + i);
  });
}

const boxDist = (b, x, y) => Math.hypot(Math.max(b.x0 - x, 0, x - b.x1), Math.max(b.y0 - y, 0, y - b.y1));
const segBox = (a, b) => ({ pts: [a, b], x0: Math.min(a[0], b[0]), y0: Math.min(a[1], b[1]), x1: Math.max(a[0], b[0]), y1: Math.max(a[1], b[1]) });

/* Each landmark as a callout: a round marker with its icon and, beside it, the name and
   "about N min". Marker and label are placed together, nearest the true spot first; a marker
   that had to move gets a thin line to the true spot. A landmark that finds no room is left
   off (the caller lists landmarks in order of importance). Returns { labels, dropped }. */
function placeCallouts(L, F, lms, R, prefix, o = {}) {
  const NS = o.nameSize || SZ.place, MS = o.minSize || SZ.mins, LH = NS + 2.5;
  const labels = [], dropped = [];
  lms.forEach((lm, i) => {
    const kind = resolveKind(lm.kind);
    const [tx, ty] = F.P(lm.lon, lm.lat);
    const lines = wrap2(lm.short || lm.name, o.wrap || 16), mins = lm.minutes ? `about ${lm.minutes} min` : "";
    const w = Math.max(...lines.map((l) => tw2(l, NS)), mins ? tw2(mins, MS) : 0) + 4;
    const h = lines.length * LH + (mins ? MS + 2.5 : 0) + 2;
    const own = (it) => it.owner === prefix + i;
    const x0 = Math.max(R + 4, Math.min(F.W - R - 4, tx)), y0 = Math.max(R + 4, Math.min(F.H - R - 4, ty));
    /* The nearest clear spot for the marker and its label. With o.prefer(labelBox, lm), a spot
       it accepts wins when one is found with the marker on or near its true spot; otherwise
       any clear spot. */
    const search = (radii, prefer) => {
      for (const r of radii) {
        const n = r === 0 ? 1 : Math.max(8, Math.round(2 * Math.PI * r / 8));
        for (let k = 0; k < n; k++) {
          const a = k * 2 * Math.PI / n, x = x0 + r * Math.cos(a), y = y0 + r * Math.sin(a);
          if (x < R + 4 || x > F.W - R - 4 || y < R + 4 || y > F.H - R - 4) continue;
          const mb = rectXY(x - R - 1, y - R - 1, x + R + 1, y + R + 1);
          /* A marker may sit on the community's area; its label may not. */
          if (!L.fits(mb, 2, (it) => own(it) || it.kind === "area")) continue;
          const moved = Math.hypot(x - tx, y - ty) > 3, seg = segBox([tx, ty], [x, y]);
          if (moved && L.items.some((it) => !own(it) && !["dot", "furniture", "area"].includes(it.kind) && satOverlap(seg, it))) continue;
          for (const cand of besideCandidates(w, h, R, [0, 5, 10])) {
            const b = boxOf(x, y, cand, w, h), lb = rectXY(b.x0, b.y0, b.x1, b.y1);
            if (!L.fits(lb, 2, own) || (moved && satOverlap(lb, seg))) continue;
            /* The label must sit nearer its own marker than any other, so it is never read as
               another mark's name. */
            const dOwn = boxDist(lb, x, y);
            if (L.items.some((it) => (it.kind === "marker" || it.kind === "dot") && !own(it) && boxDist(lb, it.cx, it.cy) < dOwn + 6)) continue;
            if (prefer && !prefer(lb, lm)) continue;
            return { x, y, c: cand, lb, mb, moved };
          }
        }
      }
      return null;
    };
    const found = (o.prefer && search([0, 7, 14], o.prefer)) || search([0, 7, 14, 21, 28, 36, 45, 56], null);
    if (!found) { dropped.push(lm); return; }
    L.add(found.mb, "marker", prefix + i); L.add(found.lb, "label", prefix + i);
    labels.push({ m: { lm, kind, tx, ty, x: found.x, y: found.y, moved: found.moved }, c: found.c, w, h, lines, mins, NS, MS, LH });
  });
  return { labels, dropped };
}

function markerSvg(lab, R, sym, g, txt) {
  const { m, c, lines, mins, LH, MS } = lab;
  let inner = `<circle r="${R}" fill="${C2.white}" stroke="${C2.brassInk}" stroke-width="1.6"/>` + sym(m.kind, -R * 0.67, -R * 0.67, R * 1.34, C2.navy);
  const y = c.y + LH - 2.5;
  inner += txt("l", c.x, y, c.anchor, lines.map((l, i) => `<tspan x="${r1(c.x)}"${i ? ` dy="${LH}"` : ""}>${esc(l)}</tspan>`).join(""));
  if (mins) inner += txt("m", c.x, y + (lines.length - 1) * LH + MS + 2.5, c.anchor, esc(mins));
  return g(m.x, m.y, inner);
}

const leaderSvg = (m) => `<path d="M${r1(m.tx)} ${r1(m.ty)}L${r1(m.x)} ${r1(m.y)}" stroke="${C2.navy}" stroke-width="1.1"/><circle cx="${r1(m.tx)}" cy="${r1(m.ty)}" r="2.4" fill="${C2.navy}"/>`;

/* Scale bar (bottom left) and north arrow (top right). Reserves their room in the layout. */
function furniture2(L, F, choices) {
  const pxPerMile = F.s * 1.609;
  const miles = choices.filter((m) => m * pxPerMile <= F.W * 0.28).pop() || choices[0];
  const bar = miles * pxPerMile, y = F.H - 11;
  const label = `${fmtMiles(miles)} ${miles === 1 ? "MILE" : "MILES"}`.replace(/^(¼|½) MILES$/, "$1 MILE");
  const lw = tw2(label, SZ.furn, 0.1);
  L.add(rectXY(5, y - 21, 14 + Math.max(bar, lw) + 2, F.H - 3), "furniture", "scale");
  L.add(rectXY(F.W - 28, 5, F.W - 6, 40), "furniture", "north");
  return `<rect x="5" y="${r1(y - 21)}" width="${r1(Math.max(bar, lw) + 12)}" height="26" rx="3" fill="${C2.land}" fill-opacity=".82"/>`
    + `<circle cx="${F.W - 17}" cy="22.5" r="15.5" fill="${C2.land}" fill-opacity=".82"/>`
    + `<path d="M11 ${r1(y - 4)}V${r1(y)}H${r1(11 + bar)}V${r1(y - 4)}" fill="none" stroke="${C2.navy}" stroke-width="1.4"/>`
    + `<g transform="translate(11 ${r1(y - 8)})"><g class="k"><text class="f">${label}</text></g></g>`
    + `<g transform="translate(${F.W - 17} 21)"><g class="k"><path d="M0-12 5 2 0-1-5 2z" fill="${C2.navy}"/><text class="f" y="15" text-anchor="middle">N</text></g></g>`;
}

function svgShell(id, F, alt, css, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" id="${id}" viewBox="0 0 ${F.W} ${F.H}" width="${F.W}" height="${F.H}" role="img" aria-label="${esc(alt)}" style="display:block;width:100%;height:auto;max-width:760px;background:${C2.land};border:1px solid ${C2.rule}">`
    + `<style>${css}</style>${body}</svg>`;
}

/* Text styles. .k groups shrink around their anchor on wider screens, so labels stay about
   the same size at 360 and 760 px while the map grows. */
function css2(id, extra = "", strokes = {}) {
  const t = `#${id} text`;
  const sw = (k) => Object.entries(strokes).map(([c, w]) => `#${id} .${c}{stroke-width:${r1(w * k * 100) / 100}px}`).join("");
  return `${t}{font-family:'DM Sans',system-ui,-apple-system,'Segoe UI',sans-serif;paint-order:stroke;stroke:${C2.land};stroke-width:3px;stroke-linejoin:round;fill:${C2.navy}}`
    + `#${id} .h{font:500 ${SZ.home}px 'Fraunces',Georgia,serif}#${id} .l{font-size:${SZ.place}px;font-weight:500}#${id} .m{font-size:${SZ.mins}px;font-weight:500;fill:${C2.brassInk}}`
    + `#${id} .t{font-size:${SZ.town}px;font-weight:500;letter-spacing:.1em;fill:${C2.slate}}#${id} .T{font-size:${SZ.town}px;font-weight:500;letter-spacing:.1em;fill:#3b4450}`
    + `#${id} .o{font:italic 400 ${SZ.ocean}px 'Fraunces',Georgia,serif;letter-spacing:.06em;fill:${C2.waterInk};stroke:${C2.water}}`
    + `#${id} .p{font-size:${SZ.place}px;font-weight:500;fill:${C2.parkInk}}#${id} .f{font-size:${SZ.furn}px;font-weight:500;letter-spacing:.1em;fill:${C2.navy}}`
    + `#${id} .r{font-size:${SZ.shield}px;font-weight:500;stroke:none;fill:${C2.navy}}#${id} .q{font-size:${SZ.suf}px;letter-spacing:.04em}`
    + `#${id} .wc{font:italic 400 ${SZ.water}px 'Fraunces',Georgia,serif;fill:${C2.waterInk}}`
    + extra + sw(1)
    + `@media(min-width:600px){#${id} .k{transform:scale(.8)}#${id} .wc{font-size:${r1(SZ.water * 0.8)}px;stroke-width:2.4px}${sw(0.8)}}@media(min-width:900px){#${id} .k{transform:scale(.64)}#${id} .wc{font-size:${r1(SZ.water * 0.64)}px;stroke-width:1.9px}${sw(0.64)}}`;
}

/* An svg that is 60 KB or less is returned inline. A larger one is written to opts.dir and an
   <img> tag is returned. Over 150 KB is an error. */
function emit2(m, opts, kind) {
  const bytes = Buffer.byteLength(m.svg);
  m.bytes = bytes;
  const fileMax = opts.fileMax || FILE_MAX;
  if (bytes > fileMax) throw new Error(`area-map: ${kind} map is ${bytes} bytes, over the ${fileMax} byte cap`);
  const inlineMax = opts.inlineMax == null ? INLINE_MAX : opts.inlineMax;
  if (bytes <= inlineMax) { m.inline = true; m.html = m.svg; return m; }
  if (!opts.dir) throw new Error(`area-map: ${kind} map is ${bytes} bytes, over the ${inlineMax} byte inline cap. Pass opts.dir (and opts.src) to write it as a file.`);
  const file = path.join(opts.dir, opts.file || `${slug(opts.slug || m.name)}-${kind}.svg`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `<?xml version="1.0" encoding="UTF-8"?>\n${m.svg}\n`);
  const src = opts.src ? opts.src.replace(/\/?$/, "/") + path.basename(file) : path.basename(file);
  m.inline = false; m.file = file;
  m.html = `<img src="${esc(src)}" width="${m.width}" height="${m.height}" alt="${esc(m.alt)}" loading="lazy" decoding="async" style="display:block;width:100%;height:auto;max-width:760px;border:1px solid ${C2.rule}">`;
  return m;
}

/* ---------------- words ---------------- */

function distToPolyline(p, pts) { // km, p {lat, lon}
  const kx = 111.32 * Math.cos(p.lat * Math.PI / 180), ky = 110.57;
  const xy = pts.map(([lo, la]) => [(lo - p.lon) * kx, (la - p.lat) * ky]);
  let best = Infinity, bp = null;
  for (let i = 1; i < xy.length; i++) {
    const [ax, ay] = xy[i - 1], [bx, by] = xy[i], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
    const t = L2 ? Math.max(0, Math.min(1, -(ax * dx + ay * dy) / L2)) : 0;
    const d = Math.hypot(ax + t * dx, ay + t * dy);
    if (d < best) { best = d; bp = { lon: p.lon + (ax + t * dx) / kx, lat: p.lat + (ay + t * dy) / ky }; }
  }
  return { km: best, point: bp };
}
const nearestCoast2 = (home, geo) => distToPolyline(home, geo.coast);

/* "in Conway", "just outside Conway" or "near Conway", from the town's outline. */
function townWords(home, geo) {
  const name = home.town;
  const t = name && geo.towns.find((x) => x.name === name);
  if (name && !t) return `in ${name}`;
  const cand = t ? [t] : geo.towns.filter((x) => x.rank === 1);
  let best = null;
  for (const tw of cand) {
    const inside = tw.outline.some((r) => inPoly([home.lon, home.lat], r));
    const d = inside ? 0 : Math.min(...tw.outline.map((r) => distToPolyline(home, r.concat([r[0]])).km));
    if (!best || d < best.d) best = { tw, d, inside };
  }
  if (!best) return "on the Grand Strand";
  if (best.inside) return `in ${best.tw.name}`;
  /* An unincorporated community has no limits a buyer feels; only a city or town has "outside". */
  if (best.tw.kind === "community" && best.d < 3) return `in ${best.tw.name}`;
  if (best.d < 6) return `just outside ${best.tw.name}`;
  return `near ${best.tw.name}`;
}

function describeRegion(spec, geo, shown) {
  const home = spec.home;
  const coast = nearestCoast2(home, geo);
  const beach = (spec.landmarks || []).find((l) => resolveKind(l.kind) === "beach" && l.minutes);
  let sea;
  if (coast.km < 1.2) sea = "close to the beach";
  else if (beach) sea = `about ${mins2(beach.minutes)} ${coast.km > 3 ? "inland " : ""}from the beach`;
  else sea = `${roundMiles(coast.km / 1.609)} inland from the ocean`;
  const mb = geo.towns.find((t) => t.name === "Myrtle Beach");
  let rel = "";
  if (mb && km(home, mb) > 6 && !/^Myrtle Beach$/.test(home.town || "")) rel = `, ${direction(mb, home)} of Myrtle Beach`;
  let s = `${home.name} is ${townWords(home, geo)}, ${sea}${rel}.`;
  const rest = shown.filter((l) => l !== beach).map((l) => l.minutes ? `${l.spoken || l.name}, about ${mins2(l.minutes)} away` : l.spoken || l.name);
  if (rest.length) s += ` The map also shows ${rest.length > 1 ? rest.slice(0, -1).join("; ") + "; and " + rest.at(-1) : rest[0]}.`;
  return s;
}

function findArea(home, geo, required) {
  if (home.area) {
    const a = geo.areas[home.area];
    if (!a && required) throw new Error(`area-map: no close-up data for "${home.area}" in ${path.relative(process.cwd(), GEO2_FILE)}. Add it to AREAS in tools/geo/build-geo.py and rebuild.`);
    return a || null;
  }
  let best = null;
  for (const a of Object.values(geo.areas)) {
    const inside = a.outline.some((r) => inPoly([home.lon, home.lat], r));
    const d = inside ? 0 : Math.min(...a.outline.map((r) => distToPolyline(home, r.concat([r[0]])).km));
    if (d < 0.4 && (!best || d < best.d)) best = { a, d };
  }
  if (!best && required) throw new Error(`area-map: ${home.name} (${home.lat}, ${home.lon}) has no close-up data in ${path.relative(process.cwd(), GEO2_FILE)}. Add the community to AREAS in tools/geo/build-geo.py, rebuild, or pass home.area.`);
  return best ? best.a : null;
}

function validate2(spec) {
  validate(spec);
  const e = spec.entrance;
  if (e && (typeof e.lat !== "number" || typeof e.lon !== "number")) throw new Error("area-map: entrance needs lat and lon");
  const a = spec.amenity;
  if (a != null) {
    const lab = typeof a === "string" ? a : a.label;
    if (typeof a !== "string" && typeof a !== "object") throw new Error("area-map: amenity is a label (\"Clubhouse\") or { label, lat, lon, street }");
    if (lab != null && !(typeof lab === "string" && lab.trim() && lab.trim().length <= 28)) throw new Error("area-map: the amenity label is a short name, 28 letters or fewer, as the page says it");
    if (typeof a === "object" && (typeof a.lat === "number") !== (typeof a.lon === "number")) throw new Error("area-map: amenity needs both lat and lon, or neither (the cached point is used)");
  }
}

/* The close-up pin: the cached point (the HOA's own address or parcel), under the name the page
   uses. A reader saw "Amenity center" on the map and "clubhouse" in the text and could not
   tell if they were one place (buyer read v6). spec.amenity is the label alone ("Clubhouse")
   or { label, lat, lon, street }; a new point drops the cached street. */
function amenityOf(spec, area, home) {
  const cached = area.amenity || { label: "Amenity center", lat: home.lat, lon: home.lon };
  const given = typeof spec.amenity === "string" ? { label: spec.amenity.trim() } : Object.assign({}, spec.amenity || {});
  if (given.label) given.label = given.label.trim();
  const out = Object.assign({}, cached, typeof given.lat === "number" ? { street: given.street } : {}, given);
  if (!out.street) delete out.street;
  if (!out.label) out.label = cached.label || "Amenity center";
  return out;
}

/* "Airport" alone tells a newcomer nothing ("The airport has no name. I assume Myrtle Beach.",
   buyer read v6). An airport landmark at the airport in the data is named for its town. */
const airportWords = (geo) => `${String(geo.airport.name || "").replace(/\s+(?:International\s+)?Airport$/i, "").trim() || "the"} airport`;
function nameAirport(lm, geo) {
  if (resolveKind(lm.kind) !== "airport") return lm;
  const [x0, y0, x1, y1] = geo.airport.bb;
  if (km(lm, { lon: (x0 + x1) / 2, lat: (y0 + y1) / 2 }) > 3) return lm;
  const generic = (t) => /^(?:the )?airport$/i.test(String(t || "").trim());
  const out = Object.assign({}, lm);
  if (generic(lm.short || lm.name)) out.short = airportWords(geo);
  if (generic(lm.name)) out.spoken = `the ${airportWords(geo)}`;
  return out;
}

/* ---------------- region map: where it is ---------------- */

const ROUTE_ORDER = ["US 17", "US 17 BYP", "US 17 BUS", "SC 31", "US 501", "SC 22", "SC 544", "SC 707", "SC 9", "SC 90"];

function shieldParts(route) {
  const [type, num, suf] = route.split(" ");
  const w = Math.max(19, tw2(num, SZ.shield) * 1.05 + (suf ? tw2(suf, SZ.suf, 0.04) + 2.5 : 0) + 8), h = SZ.shield + 5;
  return { type, num, suf: suf || "", w, h };
}
function shieldSvg(sp) {
  const hw = sp.w / 2, hh = sp.h / 2;
  const shape = sp.type === "US"
    ? `<path d="M${r1(-hw)} ${r1(-hh)}H${r1(hw)}V${r1(hh * 0.15)}C${r1(hw)} ${r1(hh * 0.8)} ${r1(hw * 0.45)} ${r1(hh)} 0 ${r1(hh + 1.6)}C${r1(-hw * 0.45)} ${r1(hh)} ${r1(-hw)} ${r1(hh * 0.8)} ${r1(-hw)} ${r1(hh * 0.15)}z" fill="${C2.white}" stroke="${C2.navy}" stroke-width="1.1"/>`
    : `<rect x="${r1(-hw)}" y="${r1(-hh)}" width="${r1(sp.w)}" height="${r1(sp.h)}" rx="3" fill="${C2.white}" stroke="${C2.navy}" stroke-width="1.1"/>`;
  return shape + `<text class="r" y="${r1(SZ.shield * (sp.type === "US" ? 0.28 : 0.36))}" text-anchor="middle">${sp.num}${sp.suf ? `<tspan class="q" dx="2">${sp.suf}</tspan>` : ""}</text>`;
}

function regionMap(spec, opts = {}) {
  validate2(spec);
  const geo = loadGeo2();
  const W = opts.width || 360;
  const home = spec.home;
  const lms = (spec.landmarks || []).filter((l) => l.map !== "close").map((l) => nameAirport(l, geo));
  const area = findArea(home, geo, false);
  const homeTown = home.town && geo.towns.find((t) => t.name === home.town);

  /* Frame: home, every landmark, the nearest beach, the home town (if near), the outline. */
  const pts = [home, ...lms];
  const coastNear = nearestCoast2(home, geo);
  if (spec.coast !== false && coastNear.km < 30) {
    /* The nearest beach, and a point out at sea beyond it, so the ocean reads as ocean. */
    const c = coastNear.point, kx = 111.32 * Math.cos(c.lat * Math.PI / 180), ky = 110.57;
    let dx = (c.lon - home.lon) * kx, dy = (c.lat - home.lat) * ky, n = Math.hypot(dx, dy);
    if (n < 0.5) { dx = 0.8; dy = -0.6; n = 1; }
    const out = Math.max(1.8, Math.min(4, 0.25 * n));
    pts.push(c, { lon: c.lon + dx / n * out / kx, lat: c.lat + dy / n * out / ky });
  }
  if (homeTown && km(home, homeTown) < 15) pts.push(homeTown);
  if (area) { const [a, b, c, d] = bbOf(area.outline); pts.push({ lon: a, lat: b }, { lon: c, lat: d }); }
  const F = frame2(pts, { W, padFrac: 0.07, padKm: 1, minSpanKm: spec.minSpanKm || 12, M: { l: 24, r: 24, t: 46, b: 30 }, rMin: 0.8, rMax: 1.2 });
  const { H, P } = F, view = F.view;
  const id = opts.id || "c3r-" + slug(home.name);
  const L = new Layout2(W, F.H);
  const geom = [];

  /* Parks and the airport. */
  const parksIn = geo.parks.filter((p) => bbHits(p.bb, view));
  const parkD = parksIn.map((p) => p.polys.map((rings) => polyD(F, rings)).join("")).join("");
  if (parkD) geom.push(`<path d="${parkD}" fill="${C2.park}" stroke="${C2.parkEdge}" stroke-width=".6"/>`);
  if (bbHits(geo.airport.bb, view)) { const d = polyD(F, geo.airport.rings); if (d) geom.push(`<path d="${d}" fill="${C2.airport}" stroke="${C2.airportEdge}" stroke-width=".6"/>`); }

  /* Water: lakes, rivers, the waterway and the inlets, widened a little so a river shows. */
  const wD = geo.water.filter((w) => bbHits(w.bb, view)).map((w) => polyD(F, w.rings, 0.4, 1)).join("");
  /* The ocean: the coastline (land on its left) closed out at sea. */
  const sea = [...geo.coast, [-77.9, geo.coast.at(-1)[1]], [-77.9, 32.9], [-79.5, 32.9]];
  const pad = 10;
  let oceanPx = clipPolygon(sea.map(([lo, la]) => P(lo, la)), -pad, -pad, W + pad, H + pad);
  oceanPx = oceanPx.length > 2 ? simplify(oceanPx.concat([oceanPx[0]]), 0.4).slice(0, -1) : [];
  const coastPx = linePieces(F, geo.coast, 0.4, pad);
  const coastD = coastPx.map((l) => pathRel(l)).join("");
  if (coastD) geom.push(`<path d="${coastD}" fill="none" stroke="${C2.sand}" stroke-width="5" stroke-linejoin="round"/>`);
  if (wD) geom.push(`<path d="${wD}" fill="${C2.water}" stroke="${C2.water}" stroke-width="1.1" stroke-linejoin="round"/>`);
  if (oceanPx.length > 2) geom.push(`<path d="${pathRel(oceanPx, true)}" fill="${C2.water}"/>`);
  if (coastD) geom.push(`<path d="${coastD}" fill="none" stroke="${C2.waterEdge}" stroke-width=".6"/>`);

  /* The state line. */
  const slPieces = geo.stateline.flatMap((l) => linePieces(F, l));
  if (slPieces.length) geom.push(`<path d="${slPieces.map((l) => pathRel(l)).join("")}" fill="none" stroke="${C2.state}" stroke-width="1" stroke-dasharray="5 3"/>`);

  /* The community, drawn as its outline. */
  let outlineD = "";
  if (area) { outlineD = polyD(F, area.outline, 0.3, 0.5); if (outlineD) geom.push(`<path class="outline" d="${outlineD}" fill="${C2.brass}" fill-opacity=".3" stroke="${C2.brassInk}" stroke-width="1.3" stroke-linejoin="round"/>`); }

  /* Roads: casings first, then fills, so crossings read as joins. */
  const roadsIn = geo.roads.filter((r) => bbHits(r.bb, view));
  const routePieces = {};
  const tierD = { 1: [], 2: [], 3: [] };
  for (const r of roadsIn) {
    const pcs = linePieces(F, r.pts, 0.35);
    if (!pcs.length) continue;
    tierD[r.tier].push(...pcs.map((l) => pathRel(l)));
    if (r.route) (routePieces[r.route] = routePieces[r.route] || []).push(...pcs);
  }
  const RS = { 3: [C2.streetCase, 2.6, C2.street, 1.3], 2: [C2.majorCase, 4.2, C2.major, 2.6], 1: [C2.fwyCase, 5, C2.fwy, 3.2] };
  const strokes = {};
  const roadG = [];
  for (const t of [3, 2, 1]) if (tierD[t].length) { roadG.push(`<path class="c${t}" d="${tierD[t].join("")}" stroke="${RS[t][0]}"/>`); strokes["c" + t] = RS[t][1]; }
  for (const t of [3, 2, 1]) if (tierD[t].length) { roadG.push(`<path class="f${t}" d="${tierD[t].join("")}" stroke="${RS[t][2]}"/>`); strokes["f" + t] = RS[t][3]; }
  if (roadG.length) geom.push(`<g fill="none" stroke-linecap="round" stroke-linejoin="round">${roadG.join("")}</g>`);

  /* ---------- labels ---------- */
  const furn = furniture2(L, F, [1, 2, 3, 5, 10]);
  /* The pin's tip touches the top of the outline, so the outline stays in view under it. */
  let [hx, hy] = P(home.lon, home.lat);
  if (area) {
    const rings = area.outline.map((r) => r.map(([lo, la]) => P(lo, la)));
    const all = rings.flat(), cx = all.reduce((t, p) => t + p[0], 0) / all.length;
    let top = Infinity;
    for (const r of rings) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [x1, y1] = r[j], [x2, y2] = r[i];
      if ((x1 <= cx && x2 > cx) || (x2 <= cx && x1 > cx)) top = Math.min(top, y1 + (cx - x1) / (x2 - x1) * (y2 - y1));
    }
    if (!Number.isFinite(top)) { const t = all.reduce((a, b) => (b[1] < a[1] ? b : a)); hx = t[0]; top = t[1]; } else hx = cx;
    hy = top + 1;
  }
  const PK = 0.8; // pin scale
  L.add(rect2(hx, hy - 19 * PK, 28 * PK, 42 * PK), "marker", "home");
  const R = 11;
  reserveDots(L, F, lms, "lm");

  /* Home label: the name, beside the pin, one or two lines. */
  const homeLines = wrap2(home.label || home.name, 17), HS = SZ.home, HLH = SZ.home + 2.5;
  const hw = Math.max(...homeLines.map((l) => tw2(l, HS) * 1.04)) + 4, hh = homeLines.length * HLH + 2;
  const homeCands = [
    { anchor: "start", x: 15, y: -24 * PK - hh / 2 }, { anchor: "end", x: -15, y: -24 * PK - hh / 2 },
    { anchor: "middle", x: 0, y: -42 * PK - hh }, { anchor: "middle", x: 0, y: 5 },
    { anchor: "start", x: 15, y: -6 }, { anchor: "end", x: -15, y: -6 },
    { anchor: "start", x: 15, y: -44 * PK }, { anchor: "end", x: -15, y: -44 * PK },
    { anchor: "start", x: 24, y: -24 * PK - hh / 2 }, { anchor: "end", x: -24, y: -24 * PK - hh / 2 },
  ];
  const ownHome = (o) => o.owner === "home";
  const hbox = (c) => { const b = boxOf(hx, hy, c, hw, hh); return rectXY(b.x0, b.y0, b.x1, b.y1); };
  let hc = homeCands.find((c) => L.fits(hbox(c), 2, ownHome));
  if (!hc) hc = homeCands.slice().sort((a, b) => L.cost(hbox(a)) - L.cost(hbox(b)))[0];
  L.add(hbox(hc), "label", "home");
  /* The outline keeps other labels off it: a town name across it reads as the town it is in.
     Marks may sit on it (kind "area", like a landmark's dot). */
  if (area) {
    const op = area.outline.flat().map(([lo, la]) => P(lo, la));
    L.add(rectXY(Math.min(...op.map((p) => p[0])), Math.min(...op.map((p) => p[1])), Math.max(...op.map((p) => p[0])), Math.max(...op.map((p) => p[1]))), "area", "home");
  }

  /* Ocean polygon test for town labels. */
  const onLand = (b) => !(oceanPx.length > 2 && b.pts.concat([[b.cx, b.cy]]).some((p) => inPoly(p, oceanPx)));

  const townLabels = [];
  const homeIn = (t) => t.outline.some((r) => inPoly([home.lon, home.lat], r));
  const placeTown = (t, big) => {
    if (lms.some((l) => l.name === t.name) || townLabels.some((x) => x.t === t)) return;
    /* A small place the home sits in, when the page names another town, would only confuse. */
    if (t.rank > 1 && t !== homeTown && homeIn(t)) return;
    const [x, y] = P(t.lon, t.lat);
    if (x < 0 || x > W || y < 0 || y > H) return;
    const size = SZ.town, text = t.name.toUpperCase();
    for (const lines of text.includes(" ") ? [[text], wrap2(text, 6)] : [[text]]) {
      const w = Math.max(...lines.map((l) => tw2(l, size, 0.1))) + 4, h = lines.length * (size + 2.5) + 1;
      const offs = [[0, 0]];
      /* The home's own town may sit a little further off: its name is the one a reader needs. */
      for (const r of t === homeTown ? [8, 16, 24, 34, 46, 60] : [8, 16, 24, 34]) for (let a = 0; a < 8; a++) offs.push([Math.cos(a * Math.PI / 4) * (w / 2 + r) * 0.8, Math.sin(a * Math.PI / 4) * (h / 2 + r)]);
      for (const [dx, dy] of offs) {
        const b = rect2(x + dx, y + dy, w, h);
        if (L.fits(b, 3) && onLand(b)) { L.add(b, "town", t.name); townLabels.push({ t, b, lines, size, big }); return; }
      }
    }
  };
  if (homeTown) placeTown(homeTown, homeTown.rank === 1);

  /* Landmarks, in the caller's order of importance. */
  const { labels: lmLabels, dropped } = placeCallouts(L, F, lms, R, "lm");
  const marks = lmLabels.map((l) => l.m);

  /* Ocean label: in the ocean, clear of the coast; a size smaller (still a place size) when a
     narrow strip of ocean has no room for the larger one. */
  let oceanLabel = null;
  if (oceanPx.length > 2) for (const size of [SZ.ocean, SZ.place]) {
    const text = "Atlantic Ocean", w = tw2(text, size, 0.06) + 6, h = size + 4;
    let best = null;
    for (let y = 12; y < H - 12; y += 4) for (let x = 12; x < W - 12; x += 4) {
      const b = rect2(x, y, w, h);
      if (!L.fits(b, 4) || !b.pts.concat([[x, y]]).every((p) => inPoly(p, oceanPx))) continue;
      const d = Math.min(...coastPx.map((c) => distToLine([x, y], c)));
      if (d < h / 2 + 2) continue;
      const score = Math.min(d, 36) - 0.05 * Math.hypot(x - W / 2, y - H / 2);
      if (!best || score > best.score) best = { x, y, b, score };
    }
    if (best) { L.add(best.b, "water", "ocean"); oceanLabel = { x: best.x, y: best.y, text, size }; break; }
  }

  /* Water labels along the river and the waterway. */
  const waterLabels = [];
  const wlByName = {};
  for (const wl of geo.waterlines) if (bbHits(wl.bb, view)) (wlByName[wl.name] = wlByName[wl.name] || []).push(...linePieces(F, wl.pts, 0.8, 0));
  for (const [name, pcs] of Object.entries(wlByName)) {
    const chained = chainPieces(pcs.map((l) => clipLine(l, 0, 0, W, H)).flat().filter((l) => l.length > 1), 3);
    const off = SZ.water * 0.7;
    /* A name this long needs a fairly straight run; a gentler bend is tried when none is free. */
    let best = null;
    for (const [sharp, turn] of [[0.24, 0.9], [0.3, 1.25]]) {
      best = [-off, off, 0].map((o) => curvedLabel(L, chained, name, SZ.water, { offset: o, pad: 2, sharp, turn, score: (x, y) => -Math.hypot(x - hx, y - hy) * 0.01 })).filter(Boolean).sort((a, b) => b.score - a.score)[0];
      if (best) break;
    }
    if (best) { best.boxes.forEach((b) => L.add(b, "water", name)); waterLabels.push({ text: name, ...best }); }
  }

  /* The other main towns, nearest first: a town name tells a newcomer more than a road number. */
  geo.towns.filter((t) => t.rank === 1 && t !== homeTown).sort((a, b) => km(home, a) - km(home, b)).forEach((t) => placeTown(t, ["Myrtle Beach", "North Myrtle Beach", "Conway"].includes(t.name)));

  /* Route markers: the routes a newcomer drives, near the home first. One marker a route and
     four at most: readers found a map full of road numbers hard to read. */
  const shields = [];
  const routeList = Object.keys(routePieces).sort((a, b) => {
    const ia = ROUTE_ORDER.indexOf(a), ib = ROUTE_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  const nearHome = (pcs) => Math.min(...pcs.flat().map(([x, y]) => Math.hypot(x - hx, y - hy)));
  routeList.sort((a, b) => {
    const pa = ROUTE_ORDER.includes(a) ? 0 : 1, pb = ROUTE_ORDER.includes(b) ? 0 : 1;
    return pa - pb || nearHome(routePieces[a]) - nearHome(routePieces[b]);
  });
  const visLen = (pcs) => pcs.reduce((s, l) => s + l.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - l[i][0], p[1] - l[i][1]), 0), 0);
  for (const route of routeList) {
    const pcs = routePieces[route].map((l) => clipLine(l, 0, 0, W, H)).flat().filter((l) => l.length > 1);
    const len = visLen(pcs);
    if (len < 40) continue;
    const listed = ROUTE_ORDER.includes(route);
    if (shields.length >= (listed ? 4 : 2)) continue;
    const sp = shieldParts(route);
    const want = 1;
    const placed = [];
    for (let k = 0; k < want; k++) {
      let best = null;
      for (const l of pcs) {
        const cum = [0]; for (let i = 1; i < l.length; i++) cum.push(cum[i - 1] + Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1]));
        for (let d = 0; d <= cum.at(-1); d += 8) {
          let i = 1; while (i < cum.length - 1 && cum[i] < d) i++;
          const t = (d - cum[i - 1]) / ((cum[i] - cum[i - 1]) || 1), x = l[i - 1][0] + t * (l[i][0] - l[i - 1][0]), y = l[i - 1][1] + t * (l[i][1] - l[i - 1][1]);
          const b = rect2(x, y, sp.w + 2, sp.h + 3);
          if (!L.fits(b, 2, null, 6)) continue;
          if (placed.some((p) => Math.hypot(p.x - x, p.y - y) < 150)) continue;
          if (shields.some((s) => s.route === route && Math.hypot(s.x - x, s.y - y) < 150)) continue;
          const dh = Math.hypot(x - hx, y - hy);
          const score = k === 0 ? -Math.abs(dh - 55) * 0.6 : dh * 0.2;
          if (!best || score > best.score) best = { x, y, b, score };
        }
      }
      if (!best) break;
      L.add(best.b, "shield", route + "#" + k);
      placed.push(best); shields.push({ route, sp, x: best.x, y: best.y });
    }
  }

  /* Park labels: inside the park when it is big enough, else beside it. */
  const parkLabels = [];
  for (const p of parksIn) {
    if (p.kind !== "state park" && p.kind !== "garden") continue;
    const big = p.polys.map((rings) => rings[0].map(([lo, la]) => P(lo, la))).sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)))[0];
    if (!big) continue;
    const cx = big.reduce((s, q) => s + q[0], 0) / big.length, cy = big.reduce((s, q) => s + q[1], 0) / big.length;
    if (cx < 0 || cx > W || cy < 0 || cy > H) continue;
    const lines = wrap2(p.name, 14), w = Math.max(...lines.map((l) => tw2(l, SZ.place))) + 4, h = lines.length * (SZ.place + 2) + 1;
    const offs = [[0, 0]];
    for (const r of [6, 12, 20]) for (let k = 0; k < 8; k++) offs.push([Math.cos(k * Math.PI / 4) * (w / 2 + r), Math.sin(k * Math.PI / 4) * (h / 2 + r)]);
    for (const [dx, dy] of offs) {
      const b = rect2(cx + dx, cy + dy, w, h);
      if (L.fits(b, 3) && onLand(b)) { L.add(b, "label", p.name); parkLabels.push({ p, b, lines }); break; }
    }
  }

  /* Airport area, when no landmark already names it: "Myrtle Beach airport", on it or beside it. */
  let airportLabel = null;
  if (!lms.some((l) => resolveKind(l.kind) === "airport") && bbHits(geo.airport.bb, view)) {
    const ring = geo.airport.rings[0].map(([lo, la]) => P(lo, la));
    const cx = ring.reduce((s, q) => s + q[0], 0) / ring.length, cy = ring.reduce((s, q) => s + q[1], 0) / ring.length;
    const lines = wrap2(airportWords(geo), 12), w = Math.max(...lines.map((l) => tw2(l, SZ.place))) + 4, h = lines.length * (SZ.place + 2) + 1;
    const offs = [[0, 0]];
    for (const r of [6, 12, 20, 30]) for (let k = 0; k < 8; k++) offs.push([Math.cos(k * Math.PI / 4) * (w / 2 + r), Math.sin(k * Math.PI / 4) * (h / 2 + r)]);
    if (cx > 0 && cx < W && cy > 0 && cy < H) for (const [dx, dy] of offs) {
      const b = rect2(cx + dx, cy + dy, w, h);
      if (L.fits(b, 3) && onLand(b)) { L.add(b, "label", "airport"); airportLabel = { x: b.cx, y: b.cy, lines }; break; }
    }
  }

  /* A smaller place only when a landmark on the map is in it ("the beach in Garden City"), and
     the state names, when there is room. A reader did not know "Carolina Forest" and found the
     map crowded with names. */
  const holdsLandmark = (t) => marks.some((m) => t.outline.some((r) => inPoly([m.lm.lon, m.lm.lat], r)));
  geo.towns.filter((t) => t.rank === 2 && holdsLandmark(t)).sort((a, b) => km(home, a) - km(home, b)).forEach((t) => placeTown(t, false));
  const stateLabels = [];
  if (slPieces.length) {
    /* Offsets: a label turned to follow the line sits north of it at a negative offset. */
    const so = SZ.state * 0.5 + 4.5;
    for (const [text, off] of [["NORTH CAROLINA", -so], ["SOUTH CAROLINA", so]]) {
      const w = tw2(text, SZ.state, 0.12) + 4;
      const best = alongLine(L, slPieces.map((l) => clipLine(l, 0, 0, W, H)).flat().filter((l) => l.length > 1), w, SZ.state + 3, { offsets: [off], bendMax: 4, accept: (b) => onLand(b) });
      if (best) { L.add(best.b, "label", text); stateLabels.push({ text, ...best }); }
    }
  }

  /* ---------- write the svg ---------- */
  const used = new Set(["home", ...marks.map((m) => m.kind)]);
  const defs = [...used].map((k) => `<symbol id="${id}-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconInner(k)}</symbol>`).join("");
  const sym = (k, x, y, size, color) => `<use href="#${id}-${k}" x="${r1(x)}" y="${r1(y)}" width="${r1(size)}" height="${r1(size)}" color="${color}"/>`;
  const g = (x, y, inner) => `<g transform="translate(${r1(x)} ${r1(y)})"><g class="k">${inner}</g></g>`;
  const gr = (x, y, ang, inner) => `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(ang * 180 / Math.PI)})"><g class="k">${inner}</g></g>`;
  const txt = (cls, x, y, anchor, body) => `<text class="${cls}" x="${r1(x)}" y="${r1(y)}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}>${body}</text>`;
  const lab = [];
  for (const tl of townLabels) {
    const lh = tl.size + 2.5, y0 = -(tl.lines.length * lh) / 2 + tl.size * 0.85;
    lab.push(g(tl.b.cx, tl.b.cy, txt(tl.big ? "T" : "t", 0, y0, "middle", tl.lines.map((l, i) => `<tspan x="0"${i ? ` dy="${lh}"` : ""}>${esc(l)}</tspan>`).join(""))));
  }
  /* A name of one or two lines, centred on its box. */
  const block = (cls, lines, size, extra = "") => { const lh = size + 2; return txt(cls, 0, -(lines.length * lh) / 2 + size * 0.85, "middle", lines.map((l, i) => `<tspan x="0"${i ? ` dy="${lh}"` : ""}>${esc(l)}</tspan>`).join("")).replace(`class="${cls}"`, `class="${cls}"${extra}`); };
  for (const pl of parkLabels) lab.push(g(pl.b.cx, pl.b.cy, block("p", pl.lines, SZ.place)));
  if (airportLabel) lab.push(g(airportLabel.x, airportLabel.y, block("p", airportLabel.lines, SZ.place, ' style="fill:#6b6153"')));
  const wdefs = waterLabels.map((wl, i) => `<path id="${id}-w${i}" d="${wl.d}"/>`).join("");
  waterLabels.forEach((wl, i) => lab.push(`<text class="wc"><textPath href="#${id}-w${i}" startOffset="50%" text-anchor="middle">${esc(wl.text)}</textPath></text>`));
  for (const sl of stateLabels) lab.push(gr(sl.x, sl.y, sl.ang, txt("t", 0, r1(SZ.state * 0.36), "middle", sl.text).replace('class="t"', `class="t" style="font-size:${SZ.state}px;fill:#6f7984"`)));
  if (oceanLabel) lab.push(g(oceanLabel.x, oceanLabel.y, txt("o", 0, r1(oceanLabel.size * 0.34), "middle", esc(oceanLabel.text)).replace('class="o"', oceanLabel.size === SZ.ocean ? 'class="o"' : `class="o" style="font-size:${oceanLabel.size}px"`)));
  for (const s of shields) lab.push(g(s.x, s.y, shieldSvg(s.sp)));
  const mk = [];
  for (const m of marks) if (m.moved) mk.push(leaderSvg(m));
  for (const l of lmLabels) if (l) mk.push(markerSvg(l, R, sym, g, txt));
  {
    const y = hc.y + HLH - 4;
    const body = homeLines.map((l, i) => `<tspan x="${r1(hc.x)}"${i ? ` dy="${HLH}"` : ""}>${esc(l)}</tspan>`).join("");
    mk.push(g(hx, hy, pinSvg((x, y2, size, color) => sym("home", x, y2, size, color), PK) + txt("h", hc.x, y, hc.anchor, body)));
  }

  const shown = lms.filter((l) => !dropped.includes(l));
  const alt = spec.alt || describeRegion(Object.assign({}, spec, { landmarks: shown }), geo, shown);
  const css = css2(id, "", strokes);
  const body = `<defs>${defs}${wdefs}</defs>${geom.join("")}${furn}${lab.join("")}<g>${mk.join("")}</g>`;
  const m = {
    kind: "region", name: home.name, svg: svgShell(id, F, alt, css, body), alt, width: W, height: H,
    credit: CREDIT2, caption: `${spec.caption ? spec.caption.trim() + " " : ""}${CREDIT2}`,
    frame: F.frame, outline: !!outlineD,
    boxes: L.items.map((b) => ({ kind: b.kind, owner: b.owner, pts: b.pts, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 })),
    labels: { home: true, towns: townLabels.map((t) => t.t.name), routes: shields.map((s) => s.route), water: waterLabels.map((w) => w.text), parks: parkLabels.map((p) => p.p.name), ocean: !!oceanLabel, airport: !!airportLabel || lmLabels.some((l) => l.m.kind === "airport"), landmarks: lmLabels.map((l) => l.m.lm.name) },
    dropped: dropped.map((l) => l.name),
  };
  return emit2(m, Object.assign({ slug: home.area || home.name }, opts), "region");
}

/* ---------------- close-up: inside the neighborhood ---------------- */

/* Street names as a driver reads them on a sign: "US 17 Bypass", "SC 707", "TPC Blvd".
   A state road number with no name ("State Rd S-26-1043") is not labelled. */
const KNOWN_ROUTES = new Set(["US 17", "US 501", "US 701", "SC 9", "SC 22", "SC 31", "SC 57", "SC 65", "SC 90", "SC 179", "SC 319", "SC 544", "SC 707", "SC 905"]);
function cleanStreet(n) {
  let s = String(n || "").trim().replace(/\s+/g, " ");
  if (!s || /^(no ?name|unnamed|private|alley|driveway)$/i.test(s) || /^(State Rd|State Rte|Co Rd|Pvt Rd|Private Rd) S?-?\d/i.test(s) || /^S-\d/.test(s)) return "";
  s = s.replace(/^[NSEW] (?=(US|State) Hwy )/, "");
  s = s.replace(/^US Hwy (\d+) Byp( [NSEW])?$/, "US $1 Bypass").replace(/^US Hwy (\d+) Bus( [NSEW])?$/, "US $1 Business")
    .replace(/^US Hwy (\d+)( [NSEW])?$/, "US $1").replace(/^State Hwy (\d+)( [NSEW])?$/, "SC $1").replace(/^[NSEW] Hwy (\d+)$/, "Highway $1");
  s = s.replace(/\bTpc\b/g, "TPC");
  /* A route number that is not on the list is likely a data slip: leave it unlabelled. */
  const route = s.match(/^(US|SC) \d+/);
  if (route && !KNOWN_ROUTES.has(route[0])) return "";
  return s;
}

function closeMap(spec, opts = {}) {
  validate2(spec);
  const geo = loadGeo2();
  const W = opts.width || 360;
  const home = spec.home;
  const area = findArea(home, geo, true);
  const amenity = amenityOf(spec, area, home);
  const ent = spec.entrance === false ? null : (spec.entrance || area.entrance);
  const box = area.box; // west, south, east, north of the cached data

  /* Frame: the outline, the amenity and the entrance; then a nearby grocery or hospital when
     taking it in at most doubles the frame and stays inside the cached data. */
  const ob = bbOf(area.outline);
  const base = [{ lon: ob[0], lat: ob[1] }, { lon: ob[2], lat: ob[3] }, amenity, ...(ent ? [ent] : [])];
  const fo = { W, padFrac: 0.12, padKm: 0.18, minSpanKm: 1.1, M: { l: 12, r: 12, t: 34, b: 28 }, rMin: 0.8, rMax: 1.3 };
  let F = frame2(base, fo);
  const inBox = (p) => p.lon > box[0] && p.lon < box[2] && p.lat > box[1] && p.lat < box[3];
  const inFrame = (Fr, p) => { const [x, y] = Fr.P(p.lon, p.lat); return x > 34 && x < Fr.W - 34 && y > 40 && y < Fr.H - 34; };
  const cands = (spec.landmarks || []).filter((l) => l.map === "close" || l.map === "both" || (l.map !== "region" && ["grocery", "hospital"].includes(resolveKind(l.kind)))).map((l) => nameAirport(l, geo));
  const shownLms = [];
  let fpts = base.slice();
  for (const lm of cands) {
    if (!inBox(lm)) continue;
    if (inFrame(F, lm)) { shownLms.push(lm); continue; }
    const F2 = frame2([...fpts, lm], fo);
    if (F2.spanX * F2.spanY <= F.spanX * F.spanY * 1.45 && [[F2.frame.west, F2.frame.south], [F2.frame.east, F2.frame.north]].every(([lo, la]) => lo >= box[0] - 0.002 && lo <= box[2] + 0.002 && la >= box[1] - 0.002 && la <= box[3] + 0.002)) {
      F = F2; fpts.push(lm); shownLms.push(lm);
    }
  }
  for (const lm of cands) if (!shownLms.includes(lm) && inFrame(F, lm)) shownLms.push(lm);
  shownLms.sort((a, b) => cands.indexOf(a) - cands.indexOf(b));
  const { H, P } = F, view = F.view;
  const mPerUnit = 1000 / F.s;
  const id = opts.id || "c3c-" + slug(home.name);
  const L = new Layout2(W, H);
  const geom = [];

  /* Golf course land and water. */
  const golfD = area.golf.filter((gf) => bbHits(gf.bb, view)).map((gf) => polyD(F, gf.rings, 0.4, 4)).join("");
  if (golfD) geom.push(`<path d="${golfD}" fill="${C2.golf}" stroke="${C2.golfEdge}" stroke-width=".6" fill-rule="evenodd"/>`);
  const waterIn = area.water.filter((w) => bbHits(w.bb, view));
  const wD = waterIn.map((w) => polyD(F, w.rings, 0.35, 1.5)).join("");
  if (wD) geom.push(`<path d="${wD}" fill="${C2.water}" stroke="${C2.waterEdge}" stroke-width=".6" fill-rule="evenodd"/>`);

  /* Streets. Width follows the scale, within limits. */
  const lw = Math.max(2.1, Math.min(4, 11 / mPerUnit)), mw = lw * 1.7;
  const streetsIn = area.streets.filter((s) => bbHits(s.bb, view));
  const byCls = { 1: [], 2: [], 3: [] };
  const named = {};
  for (const s of streetsIn) {
    const pcs = linePieces(F, s.pts, 0.3);
    if (!pcs.length) continue;
    byCls[s.cls].push(...pcs.map((l) => pathRel(l)));
    const nm = cleanStreet(s.name);
    if (nm) (named[nm] = named[nm] || { name: nm, cls: s.cls, pcs: [] }).pcs.push(...pcs);
    if (nm && s.cls < named[nm].cls) named[nm].cls = s.cls;
  }
  const sw = { 3: [lw + 1.4, lw], 2: [lw * 1.3 + 1.4, lw * 1.3], 1: [mw + 1.6, mw] };
  const sc = { 3: [C2.streetCase, C2.street], 2: [C2.majorCase, C2.major], 1: [C2.majorCase, C2.major] };
  const sG = [], strokes = {};
  for (const c of [3, 2, 1]) if (byCls[c].length) { sG.push(`<path class="c${c}" d="${byCls[c].join("")}" stroke="${sc[c][0]}"/>`); strokes["c" + c] = sw[c][0]; }
  for (const c of [3, 2, 1]) if (byCls[c].length) { sG.push(`<path class="f${c}" d="${byCls[c].join("")}" stroke="${sc[c][1]}"/>`); strokes["f" + c] = sw[c][1]; }
  if (sG.length) geom.push(`<g fill="none" stroke-linecap="round" stroke-linejoin="round">${sG.join("")}</g>`);

  /* Fade what is outside the community, then draw its outline. */
  const outlinePx = area.outline.map((r) => r.map(([lo, la]) => P(lo, la)));
  const outlineD = polyD(F, area.outline, 0.25, 1, 4);
  geom.push(`<path d="M-4-4H${W + 4}V${H + 4}H-4z${outlineD}" fill="${C2.land}" fill-opacity=".5" fill-rule="evenodd"/>`);
  geom.push(`<path class="outline" d="${outlineD}" fill="none" stroke="${C2.brass}" stroke-width="2.2" stroke-linejoin="round"/>`);
  const inOutline = (p) => outlinePx.some((r) => inPoly(p, r));

  /* ---------- labels ---------- */
  const furn = furniture2(L, F, [0.1, 0.25, 0.5, 1]);
  const [ax, ay] = P(amenity.lon, amenity.lat);
  const PK = 0.85;
  L.add(rect2(ax, ay - 19 * PK, 28 * PK, 42 * PK), "marker", "amenity");
  let entPt = null;
  if (ent) {
    /* The entrance mark, moved off the pin when the two are close, with a line to its spot. */
    const [ex, ey] = P(ent.lon, ent.lat);
    let vx = ex - ax, vy = ey - ay, n = Math.hypot(vx, vy);
    if (n < 0.5) { vx = 0; vy = 1; n = 1; }
    let x = ex, y = ey;
    for (let k = 0; k < 20 && L.hit(rect2(x, y, 17, 17), 1); k++) { x += 2 * vx / n; y += 2 * vy / n; }
    entPt = { x, y, tx: ex, ty: ey, moved: Math.hypot(x - ex, y - ey) > 3 };
    L.add(rect2(x, y, 17, 17), "marker", "entrance");
  }
  const R = 10;
  reserveDots(L, F, shownLms, "lm");

  /* Labels beside a mark (the amenity, the entrance): a name, and the road it is on when that
     road's own name found no room. */
  const placeBeside = (x, y, main, sub, size, owner, r, extraCands = []) => {
    const SL = SZ.sub + 2.5, lh = size + 2.5, w = Math.max(tw2(main, size), sub ? tw2(sub, SZ.sub) : 0) + 4, h = lh + (sub ? SL : 0) + 1;
    const cs = [...extraCands.map((c) => Object.assign({}, c, { y: c.y - (sub && c.y < 0 ? SL : 0) })), ...besideCandidates(w, h, r, [0, 5, 12, 22])];
    const own = (o) => o.owner === owner;
    /* A spot outside the outline first, when there is one beside the mark: the inside is kept
       for the community's name. */
    for (const outside of [true, false]) for (const c of cs) {
      const b = boxOf(x, y, c, w, h), bb = rectXY(b.x0, b.y0, b.x1, b.y1);
      if (outside && inOutline([bb.cx, bb.cy])) continue;
      if (L.fits(bb, 2, own)) { L.add(bb, "label", owner); return { c, w, h, lh, main, sub }; }
    }
    return null;
  };

  /* Labels in order: the pin's name and "Entrance" beside their marks, the roads they are on,
     the landmarks, the community's name, named water, the longest streets inside, golf course
     land, then the roads around it; six street names at most. Street names bend with the
     street. A name with no clear spot is left off. */
  const SS = SZ.street, MAX_STREETS = 6;
  const insideLen = (st) => st.pcs.reduce((s, l) => s + l.slice(1).reduce((t, p, i) => t + (inOutline(p) && inOutline(l[i]) ? Math.hypot(p[0] - l[i][0], p[1] - l[i][1]) : 0), 0), 0);
  const totalLen = (st) => st.pcs.reduce((s, l) => s + l.slice(1).reduce((t, p, i) => t + Math.hypot(p[0] - l[i][0], p[1] - l[i][1]), 0), 0);
  const nearest = (x, y) => Object.values(named).map((st) => ({ st, d: Math.min(...st.pcs.map((l) => distToLine([x, y], l))) })).sort((a, b) => a.d - b.d);
  const key = new Set();
  /* The key roads: the entrance's road (ent.on), else the street nearest the entrance, and the
     amenity's street. Their names come after the labels beside the marks, so a street name
     does not push "Entrance" away from its mark. */
  const stem = (n) => String(n).split(" ").slice(0, -1).join(" ").toLowerCase();
  if (entPt) {
    const near = nearest(entPt.x, entPt.y).filter((n) => n.d < 6);
    const on = ent.on && near.find((n) => stem(n.st.name) === stem(ent.on));
    if (on || near[0]) key.add((on || near[0]).st);
  }
  /* The amenity's street comes from its address (the cached area or spec.amenity.street), never
     from whichever street happens to be nearest. */
  const amStreet = amenity.street ? named[cleanStreet(amenity.street)] : null;
  if (amStreet) key.add(amStreet);
  const streetLabels = [];
  const placeStreet = (st, score) => {
    if (streetLabels.some((x) => x.text === st.name) || streetLabels.length >= MAX_STREETS) return false;
    const vis = chainPieces(st.pcs.map((l) => clipLine(l, 0, 0, W, H)).flat().filter((l) => l.length > 1));
    const best = curvedLabel(L, vis, st.name, SS, { score });
    if (opts.trace) opts.trace.push(`${st.name}: ${best ? "placed" : "no room"} (${Math.round(totalLen(st))} units)`);
    if (!best) return false;
    best.boxes.forEach((b) => L.add(b, "street", st.name));
    streetLabels.push({ text: st.name, ...best });
    return true;
  };
  const centre = (x, y) => -Math.hypot(x - W / 2, y - H / 2) * 0.01;

  /* The pin's name and "Entrance" first, right beside their marks (a reader looks for "where do
     I turn in"). Then the road they are on. When that road's name finds no room, its name goes
     under the label instead ("on Burning Ridge Road"), if there is room; else the label stays
     as it was. */
  const amCands = [{ anchor: "start", x: 13, y: -22 * PK - 8 }, { anchor: "end", x: -13, y: -22 * PK - 8 }, { anchor: "middle", x: 0, y: -40 * PK - 17 }, { anchor: "middle", x: 0, y: 4 }];
  let amLab = placeBeside(ax, ay, amenity.label || "Amenity center", "", SZ.amenity, "amenity", 13, amCands);
  let entLab = ent ? placeBeside(entPt.x, entPt.y, ent.label || "Entrance", "", SZ.place, "entrance", 9) : null;
  for (const st of key) placeStreet(st, (x, y) => -Math.hypot(x - ax, y - ay) * 0.03);
  const labelled = (name) => streetLabels.some((x) => x.text === name);
  const withSub = (lab, x, y, sub, size, owner, r, extra) => {
    if (!lab || !sub) return lab;
    L.items = L.items.filter((it) => !(it.owner === owner && it.kind === "label"));
    return placeBeside(x, y, lab.main, sub, size, owner, r, extra) || placeBeside(x, y, lab.main, "", size, owner, r, extra);
  };
  const amSub = amenity.street && !labelled(cleanStreet(amenity.street)) ? `on ${cleanStreet(amenity.street)}` : "";
  amLab = withSub(amLab, ax, ay, amSub, SZ.amenity, "amenity", 13, amCands);
  const entSub = ent && ent.on && !streetLabels.some((x) => stem(x.text) === stem(ent.on)) ? `on ${ent.on}` : "";
  if (ent) entLab = withSub(entLab, entPt.x, entPt.y, entSub, SZ.place, "entrance", 9);
  /* A landmark outside the community keeps its name outside the outline when it can, so the
     inside is left for the community's own name. */
  const crossesOutline = (b) => outlinePx.some((r) => r.some((a, i) => { const c = r[(i + 1) % r.length]; return satOverlap(b, { pts: [a, c], x0: Math.min(a[0], c[0]), y0: Math.min(a[1], c[1]), x1: Math.max(a[0], c[0]), y1: Math.max(a[1], c[1]) }); }));
  const sameSide = (lb, lm) => !crossesOutline(lb) && inOutline([lb.cx, lb.cy]) === inOutline(P(lm.lon, lm.lat));
  const { labels: lmLabels, dropped } = placeCallouts(L, F, shownLms, R, "lm", { prefer: sameSide });
  const marks = lmLabels.map((l) => l.m);

  /* The community's name, inside its outline where there is room, clear of the outline. It comes
     after the pin, the entrance and the landmarks, so their names sit beside their marks. */
  const nameText = (home.label || home.name).toUpperCase();
  const NSZ = SZ.name;
  let nameLab = null;
  const [ox0, oy0, ox1, oy1] = [Math.min(...outlinePx.flat().map((p) => p[0])), Math.min(...outlinePx.flat().map((p) => p[1])), Math.max(...outlinePx.flat().map((p) => p[0])), Math.max(...outlinePx.flat().map((p) => p[1]))];
  /* The outline's long axis, for a long thin community. */
  const allO = outlinePx.flat(), mx = allO.reduce((t, p) => t + p[0], 0) / allO.length, my = allO.reduce((t, p) => t + p[1], 0) / allO.length;
  let sxx = 0, syy = 0, sxy = 0; for (const [x, y] of allO) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); }
  let axis = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  if (axis > Math.PI / 2) axis -= Math.PI; if (axis < -Math.PI / 2) axis += Math.PI;
  const angles = Math.abs(axis) > 0.12 && Math.abs(axis) < 1.1 ? [0, axis] : [0];
  const lineSets = [[nameText], wrap2(nameText, 14), wrap2(nameText, 9)].filter((ls, i, all) => all.findIndex((x) => x.join("|") === ls.join("|")) === i);
  search: for (const nsz of [NSZ, SZ.street]) for (const lines of lineSets) for (const ang of angles) {
    const w = Math.max(...lines.map((l) => tw2(l, nsz, 0.14))) + 6, h = lines.length * (nsz + 3) + 2;
    let best = null;
    const ocx = (ox0 + ox1) / 2, ocy = (oy0 + oy1) / 2;
    for (let y = Math.max(oy0, 6); y <= Math.min(oy1, H - 6); y += 3) for (let x = Math.max(ox0, 6); x <= Math.min(ox1, W - 6); x += 3) {
      const b = rect2(x, y, w, h, ang);
      if (!b.pts.every((p) => inOutline(p)) || crossesOutline(inflate(b, 3)) || !L.fits(b, 3)) continue;
      const score = -Math.hypot(x - ocx, (y - ocy) * 1.4);
      if (!best || score > best.score) best = { b, score };
    }
    if (best) { L.add(best.b, "label", "name"); nameLab = { b: best.b, lines, inside: true, ang, size: nsz }; break search; }
  }
  if (!nameLab) {
    const lines = wrap2(nameText, 18), w = Math.max(...lines.map((l) => tw2(l, NSZ, 0.14))) + 6, h = lines.length * (NSZ + 3) + 2;
    let best = null;
    for (let y = h / 2 + 4; y < H - h / 2 - 4; y += 3) for (let x = w / 2 + 4; x < W - w / 2 - 4; x += 3) {
      const b = rect2(x, y, w, h);
      if (!L.fits(b, 3) || crossesOutline(inflate(b, 2))) continue;
      /* Close to the outline; between spots about as close, the one to the north (a map names
         an area above it). */
      const score = -Math.min(...outlinePx.map((r) => distToLine([x, y], r.concat([r[0]])))) - 0.04 * y;
      if (!best || score > best.score) best = { b, score };
    }
    if (best) { L.add(best.b, "label", "name"); nameLab = { b: best.b, lines, inside: false, size: NSZ }; }
  }


  /* Named water: the waterway or the river, along its middle. */
  const waterLabels = [];
  for (const wl of geo.waterlines) {
    if (!bbHits(wl.bb, view) || waterLabels.some((x) => x.text === wl.name)) continue;
    const pcs = chainPieces(linePieces(F, wl.pts, 0.8, 0).map((l) => clipLine(l, 0, 0, W, H)).flat().filter((l) => l.length > 1), 3);
    const best = curvedLabel(L, pcs, wl.name, SZ.water, { pad: 2, sharp: 0.2, turn: 0.7 }) || curvedLabel(L, pcs, wl.name, SZ.water, { pad: 2, sharp: 0.28, turn: 1.1 });
    if (best) { best.boxes.forEach((b) => L.add(b, "water", wl.name)); waterLabels.push({ text: wl.name, ...best }); }
  }

  /* The longest streets inside the community: four at most. Readers on a phone could not read
     a close-up full of small, turned street names, and did not need most of them. */
  const streets = Object.values(named).map((st) => ({ st, inL: insideLen(st), tot: totalLen(st) }));
  let inside = 0;
  for (const { st } of streets.filter((x) => x.inL > 45).sort((a, b) => b.inL - a.inL)) {
    if (inside >= 4) break;
    if (placeStreet(st, (x, y) => (inOutline([x, y]) ? 10 : 0) + centre(x, y))) inside++;
  }

  /* Golf course land. */
  let golfLabel = null;
  if (golfD) {
    const text = "Golf course", w = tw2(text, SZ.place) + 4, h = SZ.place + 3;
    const polys = area.golf.flatMap((gf) => gf.rings.slice(0, 1)).map((r) => clipPolygon(r.map(([lo, la]) => P(lo, la)), 0, 0, W, H)).filter((r) => r.length > 2).sort((a, b) => Math.abs(ringArea(b)) - Math.abs(ringArea(a)));
    for (const ring of polys.slice(0, 3)) {
      if (golfLabel) break;
      const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
      let best = null;
      for (let y = Math.min(...ys); y <= Math.max(...ys); y += 4) for (let x = Math.min(...xs); x <= Math.max(...xs); x += 4) {
        const b = rect2(x, y, w, h);
        if (!b.pts.every((p) => inPoly(p, ring)) || inOutline([x, y]) || !L.fits(b, 3)) continue;
        const d = distToLine([x, y], ring.concat([ring[0]]));
        if (!best || d > best.d) best = { b, d };
      }
      if (best) { L.add(best.b, "label", "golf"); golfLabel = best; }
    }
  }

  /* The main roads around it, then one more street: three at most. */
  let outside = 0;
  for (const { st } of streets.filter((x) => x.inL <= 45 && x.st.cls === 1 && x.tot > 60).sort((a, b) => b.tot - a.tot)) {
    if (outside >= 2) break;
    if (placeStreet(st, centre)) outside++;
  }
  for (const { st } of streets.filter((x) => x.inL <= 45 && x.st.cls !== 1 && x.tot > 90).sort((a, b) => b.tot - a.tot)) {
    if (outside >= 3) break;
    if (placeStreet(st, centre)) outside++;
  }

  /* ---------- write the svg ---------- */
  const used = new Set(["clubhouse", ...marks.map((m) => m.kind)]);
  const defs = [...used].map((k) => `<symbol id="${id}-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconInner(k)}</symbol>`).join("");
  const sym = (k, x, y, size, color) => `<use href="#${id}-${k}" x="${r1(x)}" y="${r1(y)}" width="${r1(size)}" height="${r1(size)}" color="${color}"/>`;
  const g = (x, y, inner) => `<g transform="translate(${r1(x)} ${r1(y)})"><g class="k">${inner}</g></g>`;
  const gr = (x, y, ang, inner) => `<g transform="translate(${r1(x)} ${r1(y)}) rotate(${r1(ang * 180 / Math.PI)})"><g class="k">${inner}</g></g>`;
  const txt = (cls, x, y, anchor, body) => `<text class="${cls}" x="${r1(x)}" y="${r1(y)}"${anchor !== "start" ? ` text-anchor="${anchor}"` : ""}>${body}</text>`;
  const lab = [];
  const sdefs = streetLabels.map((sl, i) => `<path id="${id}-s${i}" d="${sl.d}"/>`).join("");
  streetLabels.forEach((sl, i) => lab.push(`<text class="s"><textPath href="#${id}-s${i}" startOffset="50%" text-anchor="middle">${esc(sl.text)}</textPath></text>`));
  const wdefs = waterLabels.map((wl, i) => `<path id="${id}-w${i}" d="${wl.d}"/>`).join("");
  waterLabels.forEach((wl, i) => lab.push(`<text class="wc"><textPath href="#${id}-w${i}" startOffset="50%" text-anchor="middle">${esc(wl.text)}</textPath></text>`));
  if (golfLabel) lab.push(g(golfLabel.b.cx, golfLabel.b.cy, txt("p", 0, r1(SZ.place * 0.35), "middle", "Golf course")));
  if (nameLab) {
    const z = nameLab.size, lh = z + 3, y0 = -(nameLab.lines.length * lh) / 2 + z * 0.85 + 1;
    const t = txt("c", 0, y0, "middle", nameLab.lines.map((l, i) => `<tspan x="0"${i ? ` dy="${lh}"` : ""}>${esc(l)}</tspan>`).join(""));
    lab.push(gr(nameLab.b.cx, nameLab.b.cy, nameLab.ang || 0, z === NSZ ? t : t.replace('class="c"', `class="c" style="font-size:${z}px"`)));
  }
  const mk = [];
  for (const m of marks) if (m.moved) mk.push(leaderSvg(m));
  for (const l of lmLabels) if (l) mk.push(markerSvg(l, R, sym, g, txt));
  if (entPt) {
    if (entPt.moved) mk.push(leaderSvg({ tx: entPt.tx, ty: entPt.ty, x: entPt.x, y: entPt.y }));
    const ang = Math.atan2(ay - entPt.ty, ax - entPt.tx) * 180 / Math.PI;
    let inner = `<circle r="7.5" fill="${C2.navy}" stroke="${C2.white}" stroke-width="1.5"/><path d="M-3.6 0H3.4M.6-3 3.6 0 .6 3" fill="none" stroke="${C2.white}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${r1(ang)})"/>`;
    if (entLab) inner += txt("e", entLab.c.x, entLab.c.y + entLab.lh - 2.5, entLab.c.anchor, esc(entLab.main)) + (entLab.sub ? txt("u", entLab.c.x, entLab.c.y + entLab.lh + SZ.sub - 0.5, entLab.c.anchor, esc(entLab.sub)) : "");
    mk.push(g(entPt.x, entPt.y, inner));
  }
  {
    let inner = pinSvg((x, y, size, color) => sym("clubhouse", x, y, size, color), PK);
    if (amLab) inner += txt("a", amLab.c.x, amLab.c.y + amLab.lh - 2.5, amLab.c.anchor, esc(amLab.main)) + (amLab.sub ? txt("u", amLab.c.x, amLab.c.y + amLab.lh + SZ.sub - 0.5, amLab.c.anchor, esc(amLab.sub)) : "");
    mk.push(g(ax, ay, inner));
  }

  const ponds = waterIn.length;
  const golfNear = !!golfD;
  const parts = ["its streets"];
  if (ponds) parts.push("the ponds");
  if (golfNear) parts.push("golf course land nearby");
  parts.push(`the ${(amenity.label || "amenity center").toLowerCase()}`);
  if (ent) parts.push(`the ${(ent.label || "entrance").toLowerCase()}${ent.on ? ` on ${ent.on}` : ""}`);
  let alt = spec.closeAlt || `A close-up map of ${home.name}, with ${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}.`;
  const onMap = shownLms.filter((l) => !dropped.includes(l));
  if (!spec.closeAlt && onMap.length) alt += " " + onMap.map((l) => `${l.spoken || l.name} is ${l.minutes ? `about ${mins2(l.minutes)} away by car` : "nearby"}.`).join(" ");
  const css = css2(id, `#${id} .s{font-size:${SS}px;font-weight:500;fill:${C2.streetInk};stroke:${C2.white};stroke-width:2.6px}#${id} .c{font:500 ${NSZ}px 'DM Sans',system-ui,sans-serif;letter-spacing:.14em;fill:${C2.brassInk}}#${id} .a{font-size:${SZ.amenity}px;font-weight:500}#${id} .e{font-size:${SZ.place}px;font-weight:500}#${id} .u{font-size:${SZ.sub}px;font-weight:500;fill:${C2.slate}}`
    + `@media(min-width:600px){#${id} .s{font-size:${r1(SS * 0.8)}px;stroke-width:2.1px}}@media(min-width:900px){#${id} .s{font-size:${r1(SS * 0.64)}px;stroke-width:1.7px}}`, strokes);
  const body = `<defs>${defs}${sdefs}${wdefs}</defs>${geom.join("")}${furn}${lab.join("")}<g>${mk.join("")}</g>`;
  const m = {
    kind: "close", name: home.name, svg: svgShell(id, F, alt, css, body), alt, width: W, height: H,
    credit: CREDIT2, caption: `${spec.closeCaption ? spec.closeCaption.trim() + " " : ""}${CREDIT2}`,
    frame: F.frame, area: area.slug, outline: !!outlineD, amenity, entrance: ent, landmarks: onMap.map((l) => l.name), dropped: dropped.map((l) => l.name),
    boxes: L.items.map((b) => ({ kind: b.kind, owner: b.owner, pts: b.pts, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 })),
    labels: { name: !!nameLab, amenity: !!amLab, entrance: !!entLab, streets: streetLabels.map((s) => s.text), water: waterLabels.map((w) => w.text), golf: !!golfLabel },
  };
  return emit2(m, Object.assign({ slug: area.slug }, opts), "close");
}

/* Both maps for one community. Landmarks the close-up shows that sit within 2 km of home are
   left off the region map, where they would only crowd the pin, and so is a grocery store
   unless its map is "region" or "both". */
function communityMaps(spec, opts = {}) {
  const close = closeMap(spec, opts.close || opts);
  const nearShown = new Set((spec.landmarks || []).filter((l) => close.landmarks.includes(l.name) && km(spec.home, l) < 2 && l.map !== "both").map((l) => l.name));
  /* A grocery store is a close-up thing; on the region map it only crowds the pin. */
  const forRegion = (l) => !nearShown.has(l.name) && (l.map === "region" || l.map === "both" || resolveKind(l.kind) !== "grocery");
  const region = regionMap(Object.assign({}, spec, { landmarks: (spec.landmarks || []).filter(forRegion) }), opts.region || opts);
  return { region, close, links: mapLinksHtml({ name: spec.home.name, lat: spec.home.lat, lon: spec.home.lon }) };
}

/* ---------------- live map ---------------- */

/*
 * DEPRECATED (2026-10-10). Use mapLinksHtml. The keyless embed URL redirects with
 * X-Frame-Options SAMEORIGIN, so the frame stays blank in previews and in some browsers.
 * Kept so older specs still build.
 *
 * A Google Maps embed (no API key) that loads only when the reader taps it, or, with
 * load: "view", when it scrolls into view. Until then the page loads nothing from Google.
 * Tap is the default: the speed audit (audit/SPEED-AND-CONTRAST.md, /map/) found a map that
 * loads at once costs the phone score most, and its fix was "load the map on a click".
 *
 * Options: lat, lon (required), name (the place, for the title), zoom (default 13),
 *   load ("tap" default, or "view"), svg (a drawn map to show first), caption (for the drawn map),
 *   ratio (the box shape, default "4 / 3").
 */
function liveMapHtml(o) {
  if (!o || typeof o.lat !== "number" || typeof o.lon !== "number") throw new Error("liveMapHtml needs lat and lon");
  const zoom = Math.max(3, Math.min(20, Math.round(o.zoom || 13)));
  const name = o.name || "this place";
  const q = `${o.lat.toFixed(6)},${o.lon.toFixed(6)}`;
  const src = `https://www.google.com/maps?q=${q}&z=${zoom}&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const title = `Live map of ${name} from Google Maps`;
  const ratio = /^[0-9. /]+$/.test(o.ratio || "") ? o.ratio : "4 / 3";
  const pin = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${iconInner("pin")}</svg>`;
  const iframe = `<iframe src="${esc(src)}" title="${esc(title)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe>`;
  const load = "var w=this.parentNode;w.innerHTML=w.querySelector('template').innerHTML";
  const box = `<div class="c3-live" style="position:relative;width:100%;max-width:760px;aspect-ratio:${ratio};max-height:440px;background:var(--ivory-2);border:1px solid var(--rule)">`
    + `<template>${iframe}</template>`
    + `<button type="button" onclick="${load}" style="position:absolute;inset:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;padding:1rem;background:transparent;border:0;cursor:pointer;color:var(--navy);font:inherit;text-align:center">`
    + `<span style="color:var(--brass-ink)">${pin}</span>`
    + `<span class="btn btn-brass">Show the live map</span>`
    + `<span style="color:var(--muted);font-size:.85rem;line-height:1.5;max-width:22rem">Opens Google Maps here. Zoom in, or drag to look around ${esc(name)}.</span>`
    + `</button></div>`;
  const view = o.load === "view"
    ? `<script>(function(w){if(!('IntersectionObserver'in window))return;var o=new IntersectionObserver(function(e){if(e[0].isIntersecting){o.disconnect();var b=w.querySelector('button');if(b)b.click()}},{rootMargin:'150px'});o.observe(w)})(document.currentScript.previousElementSibling)</script>`
    : "";
  const link = `<p style="color:var(--muted);font-size:.85rem;line-height:1.6;margin-top:.6rem"><a href="${esc(open)}" style="color:var(--navy);text-decoration:underline" target="_blank" rel="noopener noreferrer">Open ${esc(name)} in Google Maps</a></p>`;
  const live = box + view + link;
  if (!o.svg) return `<div style="margin:1.2rem 0;max-width:760px">${live}</div>`;
  const cap = o.caption ? `<figcaption style="color:var(--muted);font-size:.85rem;line-height:1.6;margin-top:.6rem">${o.caption}</figcaption>` : "";
  return `<figure style="margin:1.8rem 0 1rem;max-width:760px">${o.svg}${cap}</figure><div style="margin:0 0 1.8rem;max-width:760px">${live}</div>`;
}

/*
 * Two buttons under the maps: "Open in Google Maps" (brass) and "Get directions" (outline).
 * Plain links in the site's button classes. Nothing loads from Google until the reader taps.
 * Options: lat, lon (required), name (used in the link title).
 */
function mapLinksHtml(o) {
  if (!o || typeof o.lat !== "number" || typeof o.lon !== "number" || !Number.isFinite(o.lat) || !Number.isFinite(o.lon)) throw new Error("mapLinksHtml needs lat and lon");
  const q = `${o.lat.toFixed(6)},${o.lon.toFixed(6)}`;
  const open = `https://www.google.com/maps/search/?api=1&query=${q}`;
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${q}`;
  const name = o.name ? esc(o.name) : "this place";
  /* Plain text links, not buttons: the website audit allows a button only for /contact/, a phone number or a tool. */
  const pin = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" style="vertical-align:-3px;margin-right:.35rem"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>`;
  const a = (cls, href, text, title) => `<a class="c3-map-link ${cls}" href="${esc(href)}" title="${title}" target="_blank" rel="noopener noreferrer" style="color:var(--navy);font-weight:500;text-decoration:underline;text-decoration-color:var(--brass);text-underline-offset:3px">${pin}${text}</a>`;
  return `<p class="c3-map-links" style="display:flex;flex-wrap:wrap;gap:.6rem 1.4rem;margin:.9rem 0 1.8rem;max-width:760px">`
    + a("open", open, "Open in Google Maps", `${name} in Google Maps`)
    + a("directions", dir, "Get directions", `Directions to ${name} in Google Maps`)
    + `</p>`;
}

/* ---------------- refresh the cached geodata ---------------- */

const MIRRORS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter", "https://overpass.private.coffee/api/interpreter"];
const MAIN = ["Little River", "North Myrtle Beach", "Myrtle Beach", "Conway", "Surfside Beach", "Murrells Inlet", "Pawleys Island"];
const MINOR = ["Carolina Forest", "Socastee", "Longs", "Loris", "Aynor", "Georgetown", "Garden City"];

function overpass(query) {
  const { execFileSync } = require("child_process");
  for (let i = 0; i < MIRRORS.length * 3; i++) {
    const u = MIRRORS[i % MIRRORS.length];
    try {
      const body = execFileSync("curl", ["-sS", "-m", "170", "--data-urlencode", "data=" + query, u], { maxBuffer: 1 << 28, stdio: ["ignore", "pipe", "ignore"] }).toString();
      if (body.trim().startsWith("{")) return JSON.parse(body);
    } catch { /* next mirror */ }
  }
  throw new Error("Overpass: every mirror failed");
}

function chainWays(ways) { // join ways that share end nodes into longer lines
  const key = (p) => p.lat.toFixed(7) + "," + p.lon.toFixed(7);
  let lines = ways.map((w) => w.geometry.slice());
  let merged = true;
  while (merged) {
    merged = false;
    for (let i = 0; i < lines.length && !merged; i++) for (let j = 0; j < lines.length && !merged; j++) {
      if (i === j) continue;
      const a = lines[i], b = lines[j];
      if (key(a.at(-1)) === key(b[0])) { lines[i] = a.concat(b.slice(1)); lines.splice(j, 1); merged = true; }
      else if (key(a.at(-1)) === key(b.at(-1))) { lines[i] = a.concat(b.slice(0, -1).reverse()); lines.splice(j, 1); merged = true; }
    }
  }
  return lines;
}

function buildGeo(raw, meta = {}) {
  const lat0 = 33.7, kx = 111320 * Math.cos(lat0 * Math.PI / 180), ky = 110570;
  const toM = (p) => [p.lon * kx, p.lat * ky], toLL = ([x, y]) => [+(x / kx).toFixed(4), +(y / ky).toFixed(4)];
  const flat = (pts) => pts.flat();
  const lenKm = (pts) => { let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L / 1000; };
  const [w, s, e, n] = DATA_BBOX;
  const inBox = ([lon, lat]) => lon >= w - 0.05 && lon <= e + 0.05 && lat >= s - 0.05 && lat <= n + 0.05;

  const coastChains = chainWays(raw.coast.elements.filter((x) => x.type === "way" && x.geometry)).sort((a, b) => b.length - a.length);
  let coast = coastChains[0];
  if (coast[0].lon > coast.at(-1).lon) throw new Error("coastline does not run southwest to northeast; land must be on its left");
  coast = simplify(coast.map(toM), 25).map(toLL);

  const water = [];
  for (const [name, src, filt] of [["Intracoastal Waterway", raw.icw, (x) => x.tags && x.tags.waterway], ["Waccamaw River", raw.wacc, (x) => x.tags && x.tags.waterway === "river"]]) {
    const lines = chainWays(src.elements.filter((x) => x.type === "way" && x.geometry && filt(x)))
      .map((l) => simplify(l.map(toM), 30))
      .filter((l) => lenKm(l) > 0.8)
      .map((l) => l.map(toLL).filter(inBox))
      .filter((l) => l.length > 1);
    water.push({ name, lines: lines.map(flat) });
  }
  const towns = [];
  for (const nm of [...MAIN, ...MINOR]) {
    const node = raw.towns.elements.filter((x) => x.tags && x.tags.name === nm && x.tags.place !== "county")[0];
    if (node) towns.push({ name: nm, lat: +node.lat.toFixed(4), lon: +node.lon.toFixed(4), main: MAIN.includes(nm) });
  }
  return {
    about: "Grand Strand coast, Intracoastal Waterway, Waccamaw River and town points for tools/area-map.js. Simplified (about 25 to 30 m). Coordinates are [lon, lat] pairs, flattened.",
    source: "OpenStreetMap, via the Overpass API",
    license: "ODbL 1.0, https://opendatacommons.org/licenses/odbl/1-0/",
    credit: CREDIT,
    fetched: meta.fetched || new Date().toISOString().slice(0, 10),
    osm_base: meta.osm_base || (raw.coast.osm3s && raw.coast.osm3s.timestamp_osm_base) || "",
    bbox: DATA_BBOX,
    towns,
    coast: flat(coast),
    water,
  };
}

function writeGeo(geo) {
  const lines = ["{"];
  const keys = Object.keys(geo);
  keys.forEach((k, i) => {
    const comma = i < keys.length - 1 ? "," : "";
    if (k === "water") lines.push(`  "water": [\n${geo.water.map((wt) => `    {"name": ${JSON.stringify(wt.name)}, "lines": [\n${wt.lines.map((l) => "      " + JSON.stringify(l)).join(",\n")}\n    ]}`).join(",\n")}\n  ]${comma}`);
    else if (k === "towns") lines.push(`  "towns": [\n${geo.towns.map((t) => "    " + JSON.stringify(t)).join(",\n")}\n  ]${comma}`);
    else lines.push(`  ${JSON.stringify(k)}: ${JSON.stringify(geo[k])}${comma}`);
  });
  lines.push("}");
  fs.mkdirSync(path.dirname(GEO_FILE), { recursive: true });
  fs.writeFileSync(GEO_FILE, lines.join("\n") + "\n");
}

function refreshGeo(rawDir) {
  const bb = `(${DATA_BBOX[1]},${DATA_BBOX[0]},${DATA_BBOX[3]},${DATA_BBOX[2]})`;
  const get = (file, q) => {
    if (rawDir && fs.existsSync(path.join(rawDir, file))) return JSON.parse(fs.readFileSync(path.join(rawDir, file), "utf8"));
    console.error(`fetching ${file} from Overpass`);
    return overpass(q);
  };
  const raw = {
    coast: get("coast.json", `[out:json][timeout:160];way["natural"="coastline"]${bb};out geom;`),
    wacc: get("wacc.json", `[out:json][timeout:160];way["name"="Waccamaw River"]["waterway"="river"]${bb};out geom;`),
    icw: get("icw.json", `[out:json][timeout:160];way["name"="Atlantic Intracoastal Waterway"]${bb};out tags geom;`),
    towns: get("towns.json", `[out:json][timeout:100];node["place"]["name"~"^(${[...MAIN, ...MINOR].join("|")})$"]${bb};out;`),
  };
  const geo = buildGeo(raw);
  writeGeo(geo);
  console.error(`wrote ${path.relative(process.cwd(), GEO_FILE)}: ${fs.statSync(GEO_FILE).size} bytes, ${geo.coast.length / 2} coast points, ${geo.towns.length} towns`);
}

module.exports = {
  /* version 2 */
  regionMap, closeMap, communityMaps, mapLinksHtml, loadGeo2, describeRegion, cleanStreet, CREDIT2, GEO2_FILE, INLINE_MAX, FILE_MAX,
  internals: { satOverlap, curvedLabel, chainPieces, Layout2, rect2, frame2, linePieces, tw2, SZ, EDGE, nameAirport, amenityOf },
  /* version 1, kept for older specs */
  areaMap, areaMapSvg, liveMapHtml, describe, CREDIT, GEO_FILE, DATA_BBOX, MAX_BYTES, loadGeo, buildGeo,
  simplify, clipPolygon, clipLine, textWidth,
};

if (require.main === module) {
  const args = process.argv.slice(2);
  const val = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : undefined; };
  if (args.includes("--refresh-geo")) {
    refreshGeo(val("--raw") || null);
  } else if (args[0] && !args[0].startsWith("--")) {
    const spec = JSON.parse(fs.readFileSync(args[0], "utf8"));
    if (args.includes("--v1")) {
      const m = areaMap(spec);
      process.stdout.write(args.includes("--live") ? liveMapHtml({ name: spec.home.name, lat: spec.home.lat, lon: spec.home.lon, svg: m.svg, caption: m.caption }) + "\n" : m.svg + "\n");
      console.error(`${m.bytes} bytes, ${m.width} x ${m.height}. aria-label: ${m.alt}`);
    } else if (args.includes("--links")) {
      process.stdout.write(mapLinksHtml({ name: spec.home.name, lat: spec.home.lat, lon: spec.home.lon }) + "\n");
    } else {
      const opts = { dir: val("--dir"), src: val("--src") };
      const m = args.includes("--close") ? closeMap(spec, opts) : regionMap(spec, opts);
      process.stdout.write(m.html + "\n");
      console.error(`${m.kind}: ${m.bytes} bytes, ${m.width} x ${m.height}, ${m.inline ? "inline" : "file " + m.file}. aria-label: ${m.alt}`);
    }
  } else {
    console.error("usage: node tools/area-map.js places.json [--close] [--dir <dir> --src <url path>] | --links | --v1 [--live] | --refresh-geo [--raw <dir>]");
    process.exit(1);
  }
}
