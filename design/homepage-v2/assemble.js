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

// 1. head: drop the homepage-only layout blocks, add ours
for (const [a, b, l] of [
  ["<style>/* mobile home layout v54 */", "</style>", "v54 home layout"],
  ['<style id="c3-ui-tweaks">', "</style>", "c3-ui-tweaks"],
]) { once(s, a, l); const [pre, , post] = cut(s, a, b, l); s = pre + post; }
once(s, "</head>", "head close");
s = s.replace("</head>", src("head.html").trim() + "\n</head>");

// 2. main: everything inside <main> is replaced; #page-home wrapper kept
once(s, '<main id="main">', "main open");
{
  const [pre, , post] = cut(s, '<main id="main">', "</main>", "main");
  s = pre + '<main id="main">\n<div class="page-section active" id="page-home">\n' + src("main.html").trim() + "\n</div>\n</main>" + post;
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
s = s.replace("</body>", src("fx.html").trim() + "\n</body>");

// guards: shared pieces survived byte-identical
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
