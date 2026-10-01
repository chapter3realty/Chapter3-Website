// Assemble the homepage redesign from the live homepage plus three source files.
//   node design/homepage-v2/assemble.js [base] [out]
// base defaults to chapter3realty/index.html, out to design/homepage-v2/index.html.
//
// Everything shared stays byte-identical: head meta and schema, the header and
// footer partials (the lead pop-up lives in the footer), the listing-search
// modal with its consent text, c3SendForm, the MAP block and the reset script.
// Only these change: the homepage-only <style> blocks, the content of
// #page-home, and the old effects layer, which src/fx.html replaces.
const fs = require("fs"), path = require("path");
const DIR = __dirname, REPO = path.join(DIR, "..", "..");
const base = process.argv[2] || path.join(REPO, "chapter3realty", "index.html");
const out = process.argv[3] || path.join(DIR, "index.html");
const src = (f) => fs.readFileSync(path.join(DIR, "src", f), "utf-8").replace(/\r\n/g, "\n");
let s = fs.readFileSync(base, "utf-8").replace(/\r\n/g, "\n");

function cut(str, from, to, label, keepEnd = true) {
  const i = str.indexOf(from); if (i < 0) throw new Error("anchor not found: " + label + " (start)");
  const j = str.indexOf(to, i + from.length); if (j < 0) throw new Error("anchor not found: " + label + " (end)");
  return [str.slice(0, i), str.slice(i, keepEnd ? j + to.length : j), str.slice(keepEnd ? j + to.length : j)];
}
const once = (str, needle, label) => {
  const n = str.split(needle).length - 1;
  if (n !== 1) throw new Error(`${label}: expected 1 match, found ${n}`);
};

// 0. fill the content template with the owner-approved copy, byte for byte from the base page. The hero's H1 and H2 and
// the analyzer's heading and text are in src/main.tpl.html itself: the owner rewrote them for the redesign (2026-10-01)
const baseSrc = s;
function grab(re, label) { const m = baseSrc.match(re); if (!m) throw new Error("copy not found in base: " + label); return m[1]; }
function grabAll(re, label, n) { const m = [...baseSrc.matchAll(re)]; if (m.length !== n) throw new Error(`${label}: expected ${n}, found ${m.length}`); return m; }
const plane = JSON.parse(fs.readFileSync(path.join(DIR, "data", "strand-plane.json"), "utf-8"));
const zoomLv = JSON.parse(fs.readFileSync(path.join(DIR, "data", "strand-zoom.json"), "utf-8")).levels;
const fill = {};
{
  const stars = grab(/<div class="c3-review"><div style="[^"]*">([^<]+)<\/div>/, "stars");
  const rv = grabAll(/<div class="c3-review"><div style="[^"]*">[^<]+<\/div><p style="font-family:var\(--serif\)[^"]*">([^<]+)<\/p><p style="[^"]*">([^<]+)<\/p><\/div>/g, "reviews", 5);
  fill.REVIEWS = rv.map((m, k) => `<figure class="rv-slide${k ? "" : " on"}" role="group" aria-roledescription="slide" aria-label="Review ${k + 1} of 5"><span class="rv-stars" role="img" aria-label="5 out of 5 stars">${stars}</span><blockquote><p>${m[1]}</p></blockquote><figcaption>${m[2]}</figcaption></figure>`).join("\n");
}
fill.AN_EB = grab(/<section id="ltr-teaser"[\s\S]*?<p style="[^"]*">([^<]+)<\/p><h2/, "analyzer eyebrow");
{
  const why = grab(/<div class="why-stats why-stats-8">([\s\S]*?)<\/div>\n<div style="display:flex;justify-content:center;margin-top:3rem">/, "badges");
  const b = [...why.matchAll(/<div class="why-stat"><div class="why-ico">(<svg[\s\S]*?<\/svg>)<\/div><div><div class="stat-kpi">([^<]+)<\/div><div class="stat-label">([^<]+)<\/div><\/div><\/div>/g)];
  if (b.length !== 8) throw new Error("badges: expected 8, found " + b.length);
  fill.BADGES = b.map((m, k) => `<div class="why-stat" style="--i:${k}"><div class="why-ico">${m[1].replace(/<(path|rect|circle)\b/g, '<$1 pathLength="1"')}</div><div><div class="stat-kpi">${m[2]}</div><div class="stat-label">${m[3]}</div></div></div>`).join("");
}
{
  const t = grabAll(/<div class="team-card">\n<img class="team-photo" src="([^"]+)" alt="([^"]+)"[^>]*>\n<h3 class="team-name">([^<]+)<\/h3>\n<p class="team-role">([^<]+)<\/p>\n<p class="team-bio">([^<]+)<\/p>\n<\/div>/g, "team", 3);
  fill.TEAM = t.map((m, k) => `<div class="tm" role="listitem" style="--i:${k}"><div class="tp"><img src="${m[1]}" alt="${m[2]}" width="330" height="330" loading="lazy" decoding="async"></div><h3 class="tm-name">${m[3]}</h3><p class="tm-role">${m[4]}</p><p class="tm-bio">${m[5]}</p></div>`).join("\n");
}
{
  const f = grabAll(/<div style="border-top:1px solid var\(--rule\);padding:1\.4rem 0"><h3 style="[^"]*">([^<]+)<\/h3><p style="[^"]*">([^<]+)<\/p><\/div>/g, "faq", 3);
  fill.FAQ = f.map((m, k) => `<div class="qa" style="--i:${k}"><h3>${m[1]}</h3><p>${m[2]}</p></div>`).join("\n");
}
{
  // the towns map: every label is placed over the tilted map by CSS from its spot on the plane (fractions of its width and height)
  const f = (n) => +(n / 100).toFixed(4);
  const towns = Object.entries(plane.towns).sort((a, b) => b[1].y - a[1].y);   // south to north, the order a visitor reads the coast
  fill.PINS = towns.map(([slug, t], k) => {
    if (!fs.existsSync(path.join(REPO, "chapter3realty", "submarkets", slug, "index.html"))) throw new Error("no page for town " + slug);
    return `<li class="tw-pt tw-pin" data-town="${slug}" style="--px:${f(t.px)};--py:${f(t.py)};--i:${k}"><a href="/submarkets/${slug}/">${t.n}</a><i class="rg"></i></li>`;
  }).join("\n");
  // head.html hides a shield at a width where it would sit under a label (data-r names the route). CSS draws the shield and
  // water text from data-t, so this decoration, hidden from assistive tech, adds no loose lines to llms-full.txt
  fill.SHIELDS = plane.shields.map((s) => `<span class="tw-pt sh ${s.kind === "sc" ? "sc" : "us"}" data-r="${s.label}" style="--px:${f(s.px)};--py:${f(s.py)}"><b data-t="${s.label}"></b></span>`).join("\n");
  // the zoom levels the map flies down through (map/build_zoom.py): the United States, the Southeast, the Carolina coast.
  // No srcset until fx.html decides the flight will use them (motion allowed, no Save-Data, not a 2G or 3G link).
  fill.PLANE = [plane.lon0, plane.lat1, plane.K, plane.S, plane.W, plane.H].join(",");
  fill.ZOOM = zoomLv.map((l) => {
    const set = (ext) => `/media/map/zoom-${l.key}-1600.${ext} 1600w,/media/map/zoom-${l.key}-3200.${ext} 3200w`;
    for (const w of [1600, 3200]) for (const ext of ["avif", "webp"]) if (!fs.existsSync(path.join(DIR, "media", "map", `zoom-${l.key}-${w}.${ext}`))) throw new Error("no zoom image " + l.key + " " + w + " " + ext);
    return `<div class="tw-lod" data-lod="${l.key}" data-ext="${l.lon0},${l.lon1},${l.lat0},${l.lat1}"><picture><source type="image/avif" data-srcset="${set("avif")}" sizes="(max-width:699px) 530px,1600px"><img data-srcset="${set("webp")}" sizes="(max-width:699px) 530px,1600px" width="1600" height="${l.files["1600"].h}" alt="" decoding="async"></picture></div>`;
  }).join("\n");
  // water names: where each sits, and at which angle, is set per width in head.html; these are the names the basemap carries
  const cls = { "Intracoastal Waterway": "icw", "Waccamaw River": "wac", "Atlantic Ocean": "sea" };
  fill.WATER = plane.water.map((w) => {
    if (!cls[w.label]) throw new Error("no place set for water label " + w.label);
    return `<span class="tw-pt wl ${cls[w.label]}"><i data-t="${w.label}"></i></span>`;
  }).join("\n");
}
let mainHtml = src("main.tpl.html").replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => { if (!(k in fill)) throw new Error("no fill for " + k); return fill[k]; });

// 1. head: drop the homepage-only layout blocks, add ours
for (const [a, b, l] of [
  ["<style>/* mobile home layout v54 */", "</style>", "v54 home layout"],
  ['<style id="c3-ui-tweaks">', "</style>", "c3-ui-tweaks"],
  ['<style id="c3-why-icons">', "</style>", "c3-why-icons"],
]) { once(s, a, l); const [pre, , post] = cut(s, a, b, l); s = pre + post; }
once(s, "</head>", "head close");
s = s.replace("</head>", () => src("head.html").trim() + "\n</head>");

// 2. main: everything inside <main> is replaced; #page-home wrapper kept
once(s, '<main id="main">', "main open");
{
  const [pre, , post] = cut(s, '<main id="main">', "</main>", "main");
  s = pre + '<main id="main">\n<div class="page-section active" id="page-home">\n' + mainHtml.trim() + "\n</div>\n</main>" + post;
}

// 3. the old effects layer (cursor, particles, transition, tilt, reveal) and its touch CSS
{
  const a = "<!-- ══════════════════════════════════════\n     DYNAMIC LAYER v2 ELEMENTS";
  once(s, a, "dynamic layer");
  const i = s.indexOf(a);
  const reset = '<script>(function(){document.addEventListener("DOMContentLoaded",function(){document.querySelectorAll(".page-section")';
  const j = s.indexOf(reset, i); if (j < 0) throw new Error("reset script not found after dynamic layer");
  s = s.slice(0, i) + s.slice(j);
  const [pre, , post] = cut(s, '<style id="c3-mobile-fix-css">', "</style>", "mobile fix css");
  s = pre + post;
}

// 4. the old carousel and the v54 reorder script; the modal and shouldIBuy stay
for (const [a, l] of [
  ['<script>(function(){var box=document.getElementById("c3-reviews")', "carousel script"],
  ["<script>/* v54: on mobile, move reviews", "v54 reorder script"],
]) { once(s, a, l); const [pre, , post] = cut(s, a, "</script>", l); s = pre + post; }

// 5. our effects, last thing in the body
once(s, "</body>", "body close");
s = s.replace("</body>", () => src("fx.html").trim() + "\n</body>");

// guards: shared pieces survived byte-identical
for (const f of ["head.html", "fx.html"]) if (!s.includes(src(f).trim())) throw new Error(f + " was altered on the way in");
if (!s.includes(mainHtml.trim())) throw new Error("main was altered on the way in");
const lf = (x) => x.replace(/\r\n/g, "\n");
for (const [name, file, a, b] of [["header", "header.html", "<header>", "</header>"], ["footer", "footer.html", "<footer", "</footer>"]]) {
  const want = lf(fs.readFileSync(path.join(REPO, "partials", file), "utf-8"));
  const i = s.indexOf(a), j = s.indexOf(b, i);
  if (s.slice(i, j + b.length) !== want) throw new Error(name + " partial drifted");
}
const baseLf = lf(fs.readFileSync(base, "utf-8"));
for (const needle of ['<div id="idxModal"', "function c3SendForm(", "var MAP={", "function shouldIBuy()", "GA deferred", "GOOGLE_MAPS_KEY"]) {
  if (!s.includes(needle)) throw new Error("lost: " + needle);
}
{ // modal byte-identical
  const grab = (x) => { const i = x.indexOf('<div id="idxModal"'); return x.slice(i, x.indexOf('<script src="/assets/s.6af7c2078d.js">', i)); };
  if (grab(s) !== grab(baseLf)) throw new Error("idx modal drifted");
}
const TCPA = (x) => [...x.matchAll(/I consent to receive calls[^<]*/g)].map((m) => m[0]);
if (JSON.stringify(TCPA(s)) !== JSON.stringify(TCPA(baseLf))) throw new Error("TCPA consent strings changed");
for (const m of s.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) if (m[1].length > 20000) throw new Error("inline <style> over 20KB: " + m[1].length);

const eol = fs.readFileSync(base, "utf-8").includes("\r\n") ? "\r\n" : "\n";
fs.writeFileSync(out, s.replace(/\n/g, eol));
console.log("wrote", path.relative(REPO, out), Math.round(fs.statSync(out).size / 1024) + "KB");
