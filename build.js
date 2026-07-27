#!/usr/bin/env node
/*
 * build.js  -  shared-asset manager for the Chapter 3 static site.
 *
 * The site is plain HTML you push with wrangler. To keep pages small and fast,
 * the big CSS and JS that used to be copied into every page now live once in
 * chapter3realty/assets/ and each page links to them. This script keeps that
 * setup honest.
 *
 * Two commands:
 *
 *   node build.js check      (default)  Verify nothing is broken before you push.
 *                                       - every /assets/ link in a page points to a real file
 *                                       - no page has re-grown a huge inline <style> or <script>
 *                                       - no asset file is orphaned (referenced by zero pages)
 *                                       Prints page/asset counts and average page size.
 *
 *   node build.js rehash                Run this AFTER you edit a file in assets/.
 *                                       It renames the file to match its new content
 *                                       (app.<newhash>.css) and updates every page that
 *                                       links to it. That new name is what busts the
 *                                       browser cache so visitors get your change.
 *
 * Nothing here deploys. After 'check' passes, deploy yourself with wrangler.
 */
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const ROOT = "chapter3realty";
const ASSETS = path.join(ROOT, "assets");
const PARTIALS = "partials";
const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex").slice(0, 10);

/*
 * Shared page chrome lives ONCE in partials/ and is stamped into every page by
 * 'node build.js stitch'. To change the nav, footer, analytics snippet, or the
 * Google Maps loader: edit the file in partials/, run stitch, check, then deploy.
 * 'check' fails if any page's copy has drifted from its partial, so the partial
 * is always the single source of truth.
 *
 * How a region is found inside a page:
 *  - header: the <header>...</header> element (one per page)
 *  - footer: the <footer...>...</footer> element (one per page)
 *  - ga / maps-loader: the inline <script> whose body contains the signature text
 */
const REGIONS = [
  { name: "header", file: "header.html", find: (s) => spanBetween(s, "<header>", "</header>") },
  { name: "footer", file: "footer.html", find: (s) => spanBetween(s, "<footer", "</footer>") },
  { name: "ga", file: "ga.html", find: (s) => scriptBySignature(s, "GA deferred") },
  { name: "maps-loader", file: "maps-loader.html", find: (s) => scriptBySignature(s, "GOOGLE_MAPS_KEY") },
];
function spanBetween(s, a, b) {
  const i = s.indexOf(a); if (i < 0) return null;
  const j = s.indexOf(b, i); if (j < 0) return null;
  return { start: i, end: j + b.length };
}
function scriptBySignature(s, sig) {
  for (const m of s.matchAll(/<script>[\s\S]*?<\/script>/g))
    if (m[0].includes(sig)) return { start: m.index, end: m.index + m[0].length };
  return null;
}
const partial = (name) => fs.readFileSync(path.join(PARTIALS, name), "utf-8");
// Compare/stamp chrome ignoring line-ending style (repo is CRLF, git blobs are LF).
const lf = (s) => s.replace(/\r\n/g, "\n");
const eolOf = (s) => (s.includes("\r\n") ? "\r\n" : "\n");            // a page's own line ending
const toEol = (s, eol) => s.replace(/\r\n/g, "\n").replace(/\n/g, eol); // convert content to that ending

function walkHtml(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkHtml(p, out);
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}
const htmlFiles = () => walkHtml(ROOT, []);
const assetFiles = () => (fs.existsSync(ASSETS) ? fs.readdirSync(ASSETS).filter((n) => /\.(css|js)$/.test(n)) : []);
const REF_RE = /\/assets\/([A-Za-z0-9._-]+\.(?:css|js))/g;

function check() {
  const pages = htmlFiles();
  const assets = new Set(assetFiles());
  const referenced = new Set();
  const errors = [];   // block the deploy
  const warns = [];    // heavy pages worth optimizing, but not broken

  for (const f of pages) {
    const s = fs.readFileSync(f, "utf-8");
    const rel = f.replace(ROOT + path.sep, "");
    // ERROR: every /assets/ reference must resolve to a real file (a broken link = broken page)
    for (const m of s.matchAll(REF_RE)) {
      referenced.add(m[1]);
      if (!assets.has(m[1])) errors.push(`${rel}: links missing asset /assets/${m[1]}`);
    }
    // ERROR: a huge shared CSS block should never reappear inline (regression = every page fat again)
    for (const m of s.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
      if (m[1].length > 20000) errors.push(`${rel}: has a ${(m[1].length / 1024).toFixed(0)}KB inline <style> (extract the shared part to /assets/)`);
    // WARN: a big inline <script> may be page-specific (fine) or a shared block that slipped through (extract it)
    for (const m of s.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g))
      if (m[1].length > 20000) warns.push(`${rel}: ${(m[1].length / 1024).toFixed(0)}KB inline <script> (ok if page-specific; extract if shared)`);
  }
  // ERROR: an asset referenced by nobody is either a leftover or a broken rename
  for (const a of assets) if (!referenced.has(a)) errors.push(`orphan asset: /assets/${a} is referenced by no page`);
  // ERROR: page chrome drifted from its partial. The partial is the single source of
  // truth; a page edited directly will be overwritten on the next stitch, so catch it here.
  if (fs.existsSync(PARTIALS)) {
    for (const r of REGIONS) {
      const want = lf(partial(r.file));
      for (const f of pages) {
        const s = fs.readFileSync(f, "utf-8");
        const span = r.find(s);
        if (span && lf(s.slice(span.start, span.end)) !== want)
          errors.push(`${f.replace(ROOT + path.sep, "")}: ${r.name} differs from partials/${r.file} -> edit the partial, then run 'node build.js stitch'`);
      }
    }
  }
  // ERROR: an asset whose contents no longer match the hash in its name was edited without rehashing.
  // Because /assets/* is cached "immutable" for a year, shipping it would serve the OLD file to
  // returning visitors and the CDN for up to a year. Catch it here instead.
  for (const a of assets) {
    const ext = path.extname(a);
    const nameHash = a.slice(0, -ext.length).split(".")[1] || "";
    const realHash = md5(fs.readFileSync(path.join(ASSETS, a)));
    if (nameHash && nameHash !== realHash)
      errors.push(`stale asset: /assets/${a} was edited but not rehashed (contents hash ${realHash}) -> run 'node build.js rehash'`);
  }

  let total = 0; for (const f of pages) total += fs.statSync(f).size;
  console.log(`Pages: ${pages.length} | Assets: ${assets.size} | Avg page: ${(total / pages.length / 1024).toFixed(0)}KB`);
  if (warns.length) { console.log(`\nWARN (${warns.length}) - heavy pages, not broken:`); warns.forEach((w) => console.log("  ~  " + w)); }
  if (errors.length) { console.log(`\nFAIL (${errors.length}):`); errors.forEach((e) => console.log("  !! " + e)); process.exit(1); }
  console.log("\nOK - all asset links resolve, no giant shared CSS re-inlined, no orphans. Safe to deploy.");
}

function rehash() {
  const pages = htmlFiles();
  const renames = []; // [oldName, newName]
  for (const name of assetFiles()) {
    const buf = fs.readFileSync(path.join(ASSETS, name));
    const ext = path.extname(name);                 // .css / .js
    const parts = name.slice(0, -ext.length).split(".");
    const stem = parts[0];                          // logical name: 'app' or 's'
    const oldHash = parts[1] || "";
    const newHash = md5(buf);
    if (oldHash === newHash) continue;              // unchanged
    const newName = `${stem}.${newHash}${ext}`;
    fs.renameSync(path.join(ASSETS, name), path.join(ASSETS, newName));
    renames.push([name, newName]);
  }
  if (!renames.length) { console.log("No asset content changed - nothing to rehash."); return; }
  let touched = 0;
  for (const f of pages) {
    let s = fs.readFileSync(f, "utf-8"); const before = s;
    for (const [oldN, newN] of renames) s = s.split(`/assets/${oldN}`).join(`/assets/${newN}`);
    if (s !== before) { fs.writeFileSync(f, s); touched++; }
  }
  console.log("Rehashed (content changed -> new cache-busting name):");
  renames.forEach(([o, n]) => console.log(`  ${o}  ->  ${n}`));
  console.log(`Updated references in ${touched} page(s). Run 'node build.js check', then deploy.`);
}

function stitch() {
  const pages = htmlFiles();
  let totalRepl = 0;
  for (const r of REGIONS) {
    const wantLf = lf(partial(r.file));
    let repl = 0, missing = 0;
    for (const f of pages) {
      let s = fs.readFileSync(f, "utf-8");
      const span = r.find(s);
      if (!span) { missing++; continue; }
      const cur = s.slice(span.start, span.end);
      if (lf(cur) !== wantLf) {              // real content change, ignoring line-ending style
        s = s.slice(0, span.start) + toEol(wantLf, eolOf(cur)) + s.slice(span.end);
        fs.writeFileSync(f, s);
        repl++;
      }
    }
    totalRepl += repl;
    console.log(`${r.name.padEnd(12)} stamped into ${repl} page(s)` + (missing ? ` (${missing} page(s) have no ${r.name}, skipped)` : ""));
  }
  console.log(totalRepl ? `\nDone. Run 'node build.js check', then deploy.` : `\nEverything already matched the partials - nothing to do.`);
}

/* llmsfull: regenerate chapter3realty/llms-full.txt from the live HTML so it can
 * never drift from the pages again. Page list + order come from sitemap.xml, so
 * anything not in the sitemap (legal pages, map) is automatically excluded. */
function llmsfull() {
  const decode = (t) => t
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&rsquo;|&#8217;/g, "’")
    .replace(/&lsquo;/g, "‘").replace(/&ldquo;/g, "“").replace(/&rdquo;/g, "”")
    .replace(/&middot;/g, "·").replace(/&nbsp;/g, " ").replace(/&#8594;|&rarr;/g, "→")
    .replace(/&#8595;/g, "").replace(/&mdash;/g, ", ").replace(/&ndash;/g, "-").replace(/&hellip;/g, "...");
  const strip = (t) => decode(t.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  const pageText = (html) => {
    const m = html.match(/<main[\s\S]*?<\/main>/i);
    let s = m ? m[0] : html;
    s = s.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
         .replace(/<svg[\s\S]*?<\/svg>/gi, "").replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
         .replace(/<form[\s\S]*?<\/form>/gi, "");
    s = s.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, t) => "\n\n# " + strip(t) + "\n");
    s = s.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => "\n\n## " + strip(t) + "\n");
    s = s.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => "\n\n### " + strip(t) + "\n");
    s = s.replace(/<li[^>]*>/gi, "\n- ").replace(/<br\s*\/?>/gi, "\n");
    s = s.replace(/<\/(p|div|section|tr|ul|ol|table|details|summary|blockquote|li|figure)>/gi, "\n");
    s = decode(s.replace(/<[^>]+>/g, " "));
    return s.split("\n").map(l => l.replace(/\s+/g, " ").trim()).join("\n")
            .replace(/\n{3,}/g, "\n\n").trim();
  };
  const today = new Date().toISOString().slice(0, 10);
  const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  const urls = [...sm.matchAll(/<loc>(https:\/\/chapter3realty\.com(\/[^<]*))<\/loc>/g)].map(m => [m[1], m[2]]);
  const out = [
    "# Chapter3 Realty - Full Site Content", "",
    "> Complete plain-text content of chapter3realty.com for language models and answer engines.",
    "> Chapter3 Realty is a data-forward real estate brokerage serving Myrtle Beach and the Grand Strand, South Carolina.",
    `> Last updated: ${today}. Index version: https://chapter3realty.com/llms.txt`, ""
  ];
  let count = 0;
  for (const [full, rel] of urls) {
    const file = rel === "/" ? path.join(ROOT, "index.html")
      : path.join(ROOT, rel.replace(/^\//, "").replace(/\/$/, "").split("/").join(path.sep), "index.html");
    if (!fs.existsSync(file)) { console.log("  skip (no file): " + rel); continue; }
    const html = fs.readFileSync(file, "utf8");
    const title = strip((html.match(/<title>([\s\S]*?)<\/title>/i) || [, rel])[1]);
    const desc = strip((html.match(/<meta name="description" content="([^"]*)"/i) || [, ""])[1]);
    out.push("---", "", `## ${title}`, `URL: ${full}`, `Summary: ${desc}`, "", pageText(html), "");
    count++;
  }
  const dest = path.join(ROOT, "llms-full.txt");
  fs.writeFileSync(dest, out.join("\n") + "\n", "utf8");
  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`llms-full.txt regenerated: ${count} pages, ${kb}KB, dated ${today}.`);
}

/* ────────────────────────────────────────────────────────────────────────────
 * audit: the publish gate. Every rule here exists because the matching defect
 * actually reached (or nearly reached) production on this site at least once.
 * Blockers exit 1. See PLAYBOOK.md for the human procedure this enforces.
 * ────────────────────────────────────────────────────────────────────────── */

// Locked strings. These must be byte-identical wherever they appear.
const TCPA = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
const AFBA_SIG = "Affiliated Business Arrangement";

// Copy the owner has banned: creative/metaphorical phrasing. Style rule is
// "literal and direct", so these read as off-brand.
const BANNED_PHRASES = [
  "whole game", "content engine", "marina country", "are wishes", "black box",
  "no-brainer", "slam dunk", "hidden gem", "goldmine", "jackpot", "kick back",
  "rewards patience", "trades speed for scenery", "collect price cuts", "collects price cuts",
];
// Fair-housing advertising risk: statements about who lives somewhere or how safe it is.
const FAIR_HOUSING = [
  "safe neighborhood", "low crime", "crime-free", "family-friendly neighborhood",
  "perfect for families", "no children", "adults only", "exclusive neighborhood",
  "good schools for your kids",
];
// Unsubstantiated performance promises (FTC substantiation). Checked with a
// negation guard, because "returns are not guaranteed" is a disclaimer, not a claim.
const GUARANTEE = /\bwe guarantee\b|\bguarantees?\b|\bguaranteed\b|you will sell your|we will sell your|cannot fail|we promise|won['’]t fail/gi;
// A negation anywhere in the run-up to the word, without crossing a sentence
// boundary, means it is a disclaimer: "not a guarantee", "Nobody can guarantee".
const NEGATED_BEFORE = /\b(?:not|no|never|nobody|none|nor|without|cannot|can['’]t|isn['’]t|aren['’]t|won['’]t)\b[^.!?;]{0,32}$/i;
// Reg Z 1026.24(d) trigger term: a stated down payment amount pulls in APR +
// repayment-term disclosure obligations. Assessment ratios (4%/6%) are tax, not credit.
const TRIGGER_DOWN = /([0-9]+(?:\.[0-9]+)? ?(?:percent|%)) ?(?:down\b|down payment)/gi;

// Decode named AND numeric entities. Pages use a mix of &#39; and &#x27; for the
// same apostrophe; missing one form caused a false "FAQ not visible" failure.
const decodeEnt = (t) => t
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
  .replace(/&rsquo;|&lsquo;|&apos;/g, "'").replace(/&ldquo;|&rdquo;/g, '"')
  .replace(/&nbsp;/g, " ").replace(/&middot;/g, "·").replace(/&mdash;|&ndash;/g, "-");
// Normalise for text comparison: entities, smart quotes, tags, punctuation, case.
const textKey = (t) => decodeEnt(t).replace(/[’‘]/g, "'").replace(/[“”]/g, '"')
  .replace(/<[^>]+>/g, " ").toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

function audit() {
  const pages = htmlFiles();
  const errors = [], warns = [];
  const titles = new Map(), descs = new Map();
  const sitemapPath = path.join(ROOT, "sitemap.xml");
  const sm = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, "utf-8") : "";
  const smUrls = new Set([...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]));
  const smDates = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map(m => m[1]);
  const llms = fs.existsSync(path.join(ROOT, "llms.txt")) ? fs.readFileSync(path.join(ROOT, "llms.txt"), "utf-8") : "";
  const declaredKw = new Map();  // keyword -> [pages]  (cannibalisation guard)
  const inbound = new Map();     // page -> Set(pages linking to it from BODY copy)
  const shingles = new Map();    // page -> Set(8-word shingles) for near-duplicate detection
  const indexable = [];
  // Phrases that only make sense in reading order. An AI answer engine quotes a
  // single passage, so "as mentioned above" makes that passage useless.
  const ANAPHORA = /\b(?:as (?:mentioned|noted|discussed) (?:above|earlier|before)|as described above|see above|the (?:former|latter))\b/i;

  for (const f of pages) {
    // 404.html is an error document, not an indexable page: no canonical or sitemap entry.
    if (path.basename(f) !== "index.html") continue;
    const s = fs.readFileSync(f, "utf-8");
    const rel = "/" + f.replace(ROOT + path.sep, "").replace(/index\.html$/, "").split(path.sep).join("/");
    const url = "https://chapter3realty.com" + rel;
    const noindex = /content="noindex/.test(s);
    const E = (m) => errors.push(`${rel}  ${m}`);
    const W = (m) => warns.push(`${rel}  ${m}`);

    /* ---- indexing ---- */
    if (noindex && smUrls.has(url)) E("noindex page is listed in sitemap.xml");
    if (!noindex && !smUrls.has(url)) E("missing from sitemap.xml");
    if (!noindex && rel !== "/" && !llms.includes(rel)) W("not listed in llms.txt");

    /* ---- title / description ---- */
    const t = (s.match(/<title>([^<]*)<\/title>/) || [])[1];
    if (!t) E("no <title>");
    else {
      const shown = decodeEnt(t);
      if (shown.length > 62) E(`title ${shown.length} chars (max 62, it truncates in Google)`);
      if (shown.length < 20) W(`title only ${shown.length} chars`);
      if (titles.has(t)) E(`duplicate <title> shared with ${titles.get(t)}`); else titles.set(t, rel);
    }
    const d = (s.match(/name="description" content="([^"]*)"/) || [])[1];
    if (!d) E("no meta description");
    else {
      const shown = decodeEnt(d);
      if (!noindex && (shown.length < 110 || shown.length > 165)) E(`meta description ${shown.length} chars (want 110-165)`);
      if (descs.has(d)) E(`duplicate meta description shared with ${descs.get(d)}`); else descs.set(d, rel);
    }

    /* ---- canonical / open graph ---- */
    const canon = (s.match(/rel="canonical" href="([^"]*)"/) || [])[1];
    if (!canon) E("no canonical");
    else if (canon !== url) E(`canonical points to ${canon}, expected ${url}`);
    const ogUrl = (s.match(/property="og:url" content="([^"]*)"/) || [])[1];
    if (ogUrl && ogUrl !== url) E(`og:url ${ogUrl} != canonical`);
    if (!noindex) for (const p of ["og:title", "og:description", "og:image"])
      if (!s.includes(`property="${p}"`)) W(`missing ${p}`);

    /* ---- structure ---- */
    const h1s = s.match(/<h1[^>]*>/g) || [];
    if (h1s.length !== 1) E(`${h1s.length} <h1> tags (must be exactly 1)`);

    /* ---- structured data ---- */
    const blocks = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => m[1]);
    const parsed = [];
    for (const b of blocks) {
      try { parsed.push(JSON.parse(b)); }
      catch (err) { E(`invalid JSON-LD: ${String(err.message).slice(0, 60)}`); }
    }
    // Google requires every FAQ answer/question in schema to be visible on the page.
    const visible = textKey(s.replace(/<script[\s\S]*?<\/script>/g, " "));
    for (const blk of parsed) {
      if (blk && blk["@type"] === "FAQPage") {
        for (const q of blk.mainEntity || []) {
          if (q && q.name && !visible.includes(textKey(q.name)))
            E(`FAQ schema question not visible on page: "${String(q.name).slice(0, 55)}"`);
        }
      }
      if (blk && blk["@type"] === "Article" && blk.keywords) {
        for (const k of String(blk.keywords).split(",").map(x => x.trim().toLowerCase()).filter(Boolean)) {
          if (!declaredKw.has(k)) declaredKw.set(k, []);
          declaredKw.get(k).push(rel);
        }
      }
    }

    /* ---- invisible text: ivory-on-ivory ----
     * This defect has now shipped THREE times. The first two fixes used a
     * non-greedy "hero block" regex that stopped at the first </div></div> and
     * silently missed 16 pages whose hero has deeper nesting.
     * Static analysis CANNOT solve the general case: an inline background sits
     * on one element while the ivory text sits on a sibling, and a text scan
     * has no nesting model. Attempting it produced 20 false positives.
     * So the gate pins the two exact patterns that have actually shipped
     * broken, and the general case is owned by the browser contrast check in
     * .claude/verify.js, which measures what is really painted. Both are
     * required by PLAYBOOK.md; neither alone is sufficient.
     * Scope matters: .detail-hero is IVORY, but the homepage, /about/, /buyers/
     * and the submarket guides use a NAVY hero where ivory text is correct.
     * Ignoring that, an earlier pass "fixed" 8 submarket bylines to dark text
     * and measured them at 1.00:1 navy-on-navy: the same defect, freshly made. */
    const lightHero = /class="detail-hero/.test(s);
    if (lightHero && /<p style="color:\s*rgba\(244,\s*239,\s*232[^"]*">\s*By /.test(s))
      E("byline is ivory on the light .detail-hero (invisible) — use color:var(--muted)");
    if (lightHero && /class="btn btn-outline btn-lg"[^>]*style="color:\s*var\(--ivory\)/.test(s))
      E("hero outline button is ivory on the light .detail-hero (invisible) — drop the inline colour override");

    /* ---- legal ---- */
    // Strip code and form controls: a number inside a calculator input is not ad copy.
    let prose = s.replace(/<script[\s\S]*?<\/script>/g, " ")
                 .replace(/<label[\s\S]*?<\/label>|<input[^>]*>|<select[\s\S]*?<\/select>/g, " ");
    const trig = [...prose.matchAll(TRIGGER_DOWN)].map(m => m[0].trim());
    if (trig.length) W(`Reg Z trigger term in copy: ${[...new Set(trig)].slice(0, 3).join(", ")} (needs APR + repayment terms, or rewrite qualitatively)`);
    if (s.includes("c3SendForm(") && !s.includes(TCPA)) E("lead form present but the exact TCPA consent string is missing or altered");
    if (/brickwoodmortgage\.com/.test(prose) && !s.includes(AFBA_SIG)) E("links to the affiliated lender without an AfBA disclosure");
    const low = decodeEnt(prose).toLowerCase();
    for (const p of BANNED_PHRASES) if (low.includes(p)) W(`off-brand phrase: "${p}"`);
    for (const p of FAIR_HOUSING) if (low.includes(p)) E(`fair-housing risk phrase: "${p}"`);
    for (const g of prose.matchAll(GUARANTEE)) {
      const before = prose.slice(Math.max(0, g.index - 70), g.index);
      if (NEGATED_BEFORE.test(before)) continue;   // "returns are not guaranteed" = disclaimer
      E(`unsubstantiated guarantee: "...${prose.slice(Math.max(0, g.index - 22), g.index + g[0].length).replace(/\s+/g, " ").trim()}"`);
    }

    /* ---- links ---- */
    for (const m of s.matchAll(/href="(\/[a-zA-Z0-9\-/]*)"/g)) {
      const target = m[1].split("#")[0].replace(/^\/|\/$/g, "");
      if (!target) continue;
      if (!fs.existsSync(path.join(ROOT, target.split("/").join(path.sep))))
        E(`dead internal link ${m[1]}`);
    }

    /* ---- collect for the cross-page checks below ---- */
    if (!noindex) {
      indexable.push(rel);
      const mainM = s.match(/<main[\s\S]*?<\/main>/);
      const mainHtml = (mainM ? mainM[0] : s).replace(/<script[\s\S]*?<\/script>/g, " ");
      // inbound links from BODY copy only: nav and footer link everything, so
      // counting them would hide a genuinely orphaned page.
      for (const m of mainHtml.matchAll(/href="(\/[a-zA-Z0-9\-/]*)"/g)) {
        const t = m[1].split("#")[0];
        if (t === rel) continue;
        if (!inbound.has(t)) inbound.set(t, new Set());
        inbound.get(t).add(rel);
      }
      const words = decodeEnt(mainHtml.replace(/<[^>]+>/g, " ")).toLowerCase().match(/[a-z]{3,}/g) || [];
      const sh = new Set();
      for (let i = 0; i + 8 <= words.length; i++) sh.add(words.slice(i, i + 8).join(" "));
      shingles.set(rel, sh);
      const plain = decodeEnt(mainHtml.replace(/<[^>]+>/g, " "));
      const ana = plain.match(ANAPHORA);
      if (ana) W(`reading-order phrase "${ana[0]}" — breaks the passage if an AI quotes it alone`);
      const heads = [...s.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)].map(m => m[1]);
      if (heads.length && !heads.some(h => h.includes("?")))
        W("no question-shaped H2/H3 — weaker for People Also Ask and AI answers");
    }

    /* ---- images ---- */
    for (const m of s.matchAll(/<img\b[^>]*>/g)) {
      if (!/\balt=/.test(m[0])) E("an <img> has no alt attribute");
      else if (!/\bwidth=/.test(m[0]) || !/\bheight=/.test(m[0])) W("an <img> lacks width/height (causes layout shift)");
    }
  }

  /* ---- cross-page ---- */
  for (const [k, ps] of declaredKw)
    if (new Set(ps).size > 1) errors.push(`cannibalisation: keyword "${k}" declared by ${[...new Set(ps)].join(", ")}`);
  // A sitemap where every lastmod is identical reads as auto-stamped and Google discounts it.
  if (smDates.length > 5 && new Set(smDates).size === 1)
    errors.push(`sitemap.xml: all ${smDates.length} lastmod dates are identical (${smDates[0]}) - only date pages whose visible text changed`);
  for (const dt of new Set(smDates))
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) errors.push(`sitemap.xml: malformed lastmod "${dt}"`);

  /* ---- orphan pages ----
   * A page nothing links to from body copy gets very little crawl priority and
   * no internal link equity. /buyers/new-construction/ shipped orphaned. */
  for (const rel of indexable) {
    if (rel === "/") continue;                       // the homepage is linked by every nav
    if (!inbound.has(rel) || inbound.get(rel).size === 0)
      errors.push(`${rel}  orphan: no other page links to it from body copy (nav/footer do not count)`);
  }

  /* ---- near-duplicate bodies ----
   * Template-built siblings can drift into being the same page twice, which
   * splits impressions between them. */
  for (let i = 0; i < indexable.length; i++) {
    for (let j = i + 1; j < indexable.length; j++) {
      const a = shingles.get(indexable[i]), b = shingles.get(indexable[j]);
      if (!a || !b || a.size < 40 || b.size < 40) continue;
      let shared = 0;
      for (const x of a) if (b.has(x)) shared++;
      const overlap = shared / Math.min(a.size, b.size);
      if (overlap > 0.25)
        warns.push(`near-duplicate content ${(overlap * 100).toFixed(0)}%: ${indexable[i]} and ${indexable[j]}`);
    }
  }

  /* ---- llms.txt must not claim to be fresher or staler than the site ---- */
  const llmsDate = (llms.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/) || [])[1];
  const newestPage = [...smDates].sort().pop();
  if (llmsDate && newestPage && llmsDate < newestPage)
    warns.push(`llms.txt says "Last updated: ${llmsDate}" but the newest page changed ${newestPage} — run 'node build.js llmsfull' and update the header`);

  /* ---- divergent duplicate logic across bundles ----
   * Two bundles defining the same function with DIFFERENT bodies means one page
   * silently runs older maths than the rest. Found live: /sell/ shipped a stale
   * recalcLtr with the vacancy double-subtraction long after it was fixed. */
  const jsAssets = assetFiles().filter(n => n.endsWith(".js"));
  const fnBodies = new Map();  // fnName -> [{asset, sig}]
  for (const a of jsAssets) {
    const src = fs.readFileSync(path.join(ASSETS, a), "utf-8");
    for (const m of src.matchAll(/function ([a-zA-Z_$][\w$]*)\s*\(/g)) {
      const sig = crypto.createHash("md5").update(src.slice(m.index, m.index + 1200)).digest("hex").slice(0, 8);
      if (!fnBodies.has(m[1])) fnBodies.set(m[1], []);
      fnBodies.get(m[1]).push({ asset: a, sig });
    }
  }
  for (const [fn, defs] of fnBodies) {
    if (defs.length < 2) continue;
    if (new Set(defs.map(d => d.sig)).size > 1)
      warns.push(`divergent duplicate: ${fn}() differs between ${defs.map(d => d.asset).join(" and ")} - one page runs stale logic`);
  }

  /* ---- inert CSS utility classes (a class that never sets display:grid) ---- */
  for (const a of assetFiles().filter(n => n.endsWith(".css"))) {
    const css = fs.readFileSync(path.join(ASSETS, a), "utf-8");
    for (const m of css.matchAll(/\.(grid-\d|flex-\w+)\{([^}]*)\}/g)) {
      const [, cls, body] = m;
      if (/grid-template/.test(body) && !/display:\s*grid/.test(body))
        warns.push(`/assets/${a}: .${cls} sets grid-template but never display:grid, so the class does nothing`);
    }
  }

  console.log(`Audited ${pages.length} pages against the PLAYBOOK.md rules.`);
  if (warns.length) { console.log(`\nWARN (${warns.length}) - review, not blocking:`); warns.forEach(w => console.log("  ~  " + w)); }
  if (errors.length) {
    console.log(`\nFAIL (${errors.length}) - fix before publishing:`);
    errors.forEach(e => console.log("  !! " + e));
    process.exit(1);
  }
  console.log("\nOK - zero blocking defects. Page quality gate passed.");
}

const cmd = process.argv[2] || "check";
if (cmd === "check") check();
else if (cmd === "rehash") rehash();
else if (cmd === "stitch") stitch();
else if (cmd === "llmsfull") llmsfull();
else if (cmd === "audit") audit();
else if (cmd === "preflight") { check(); console.log(""); audit(); }
else { console.log("Usage: node build.js [check|rehash|stitch|llmsfull|audit|preflight]"); process.exit(1); }
