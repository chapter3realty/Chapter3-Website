#!/usr/bin/env node
/*
 * headlines.js - set an article's headline from data/headlines.json (owner, 2026-10-26: headlines
 * "better for marketing ... and better filters to back up my click bait").
 *
 *   node tools/headlines.js            # show what would change
 *   node tools/headlines.js --write    # change it
 *
 * Each entry: { title, h1: [first line, second line] }. On a hand-made page it sets the <title>, the
 * og and twitter titles, the WebPage name, the Article headline and the H1 (keeping the H1's own
 * markup: the line break and the italic second line). On a relocating page it edits the page's data
 * file (data/relocating/pages/<slug>.js) and reassembles it, as that page is never edited by hand.
 * A page built from specs/ is refused: its spec holds its title.
 */
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const SITE = path.join(ROOT, "chapter3realty");
const DATA = JSON.parse(fs.readFileSync(path.join(ROOT, "data", "headlines.json"), "utf8"));
const WRITE = process.argv.includes("--write");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const attr = (s) => esc(s).replace(/"/g, "&quot;");
const jsonStr = (s) => JSON.stringify(String(s)).slice(1, -1);
const headline = (t) => t.replace(/\s*\|\s*Chapter3( Realty)?$/, "");

function specPages() {
  const out = new Set();
  for (const f of fs.readdirSync(path.join(ROOT, "specs"))) {
    const s = fs.readFileSync(path.join(ROOT, "specs", f), "utf8");
    for (const m of s.matchAll(/(?:^|\n)\s*(?:url:|const SELF =)\s*"([^"]+)"/g)) out.add(m[1]);
  }
  return out;
}

/** The H1's inside: the first line, then the second in the page's own <br/><em ...> wrapper if it has one. */
function h1Inner(old, [a, b]) {
  const em = /<br\s*\/?>\s*<em([^>]*)>[\s\S]*?<\/em>/.exec(old);
  return em ? `${esc(a)}<br/><em${em[1]}>${esc(b)}</em>` : `${esc(a)} ${esc(b)}`;
}

function setH1(html, h1) {
  const m = /(<h1[^>]*>)([\s\S]*?)(<\/h1>)/.exec(html);
  if (!m) throw new Error("no <h1>");
  return html.slice(0, m.index) + m[1] + h1Inner(m[2], h1) + m[3] + html.slice(m.index + m[0].length);
}

function handPage(url, e) {
  const file = path.join(SITE, url, "index.html");
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  const old = (s.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!old) throw new Error(`${url}: no <title>`);
  const headEnd = s.indexOf("</head>");
  let head = s.slice(0, headEnd), rest = s.slice(headEnd);
  // Function replacements only: a title with "$2" in it ("$20,900") must stay text.
  head = head.replace(/<title>[^<]*<\/title>/, () => `<title>${esc(e.title)}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, (m, a, b) => a + attr(e.title) + b)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, (m, a, b) => a + attr(e.title) + b);
  // In the JSON-LD: the WebPage name is the title; the Article headline is the title without the brand.
  head = head.split(JSON.stringify(old.replace(/&amp;/g, "&")).slice(1, -1)).join(jsonStr(e.title));
  head = head.replace(/("headline":\s*")[^"]*(")/g, (m, a, b) => a + jsonStr(headline(e.title)) + b);
  rest = setH1(rest, e.h1);
  s = head + rest;
  if (s !== before && WRITE) fs.writeFileSync(file, s);
  return s !== before;
}

function relocPage(url, e) {
  const slug = url.split("/").filter(Boolean).pop();
  const file = path.join(ROOT, "data", "relocating", "pages", `${slug}.js`);
  let s = fs.readFileSync(file, "utf8");
  const before = s;
  const q = (v) => `'${String(v).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
  s = s.replace(/(\n\s*title:\s*)'(?:[^'\\]|\\.)*'/, (m, a) => a + q(e.title)).replace(/(\n\s*headline:\s*)'(?:[^'\\]|\\.)*'/, (m, a) => a + q(headline(e.title)));
  s = setH1(s, e.h1.map((x) => x.replace(/'/g, "’")));
  if (s === before) return false;
  if (WRITE) {
    fs.writeFileSync(file, s);
    execFileSync("node", [path.join(ROOT, "data", "relocating", "assemble-page.js"), file], { stdio: "inherit" });
  }
  return true;
}

const specs = specPages();
let n = 0;
for (const [url, e] of Object.entries(DATA)) {
  if (url.startsWith("_")) continue;
  if (!e.title || !Array.isArray(e.h1) || e.h1.length !== 2) throw new Error(`${url}: needs a title and a two-line h1`);
  if (e.title.length > 62) throw new Error(`${url}: title is ${e.title.length} characters (max 62)`);
  if (specs.has(url)) { console.log(`skip ${url}: its spec holds the title`); continue; }
  const reloc = fs.existsSync(path.join(ROOT, "data", "relocating", "pages", `${url.split("/").filter(Boolean).pop()}.js`)) && url.startsWith("/buyers/relocating/") && url !== "/buyers/relocating/";
  const changed = reloc ? relocPage(url, e) : handPage(url, e);
  if (changed) { n++; console.log(`${WRITE ? "set " : "would set "}${url}: ${e.title}`); }
}
console.log(`${n} page(s) ${WRITE ? "changed" : "to change"}.`);
