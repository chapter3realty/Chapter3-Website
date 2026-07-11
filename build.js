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
const md5 = (buf) => crypto.createHash("md5").update(buf).digest("hex").slice(0, 10);

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

const cmd = process.argv[2] || "check";
if (cmd === "check") check();
else if (cmd === "rehash") rehash();
else { console.log("Usage: node build.js [check|rehash]"); process.exit(1); }
