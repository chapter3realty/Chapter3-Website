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

  /* ---- cost-of-living data: asset must equal the JSON, and neither may go stale ----
   *
   * /buyers/relocating/cost-of-living/ carries a 439-place calculator fed by
   * /assets/col.<hash>.js, which is generated from data/relocating/col-places.json
   * by data/relocating/build-col-data.js. Same failure mode as the STR figures:
   * a number that lives only in a page goes stale silently. Three gates:
   *
   *   1. the deployed asset must be byte-identical to what the JSON generates.
   *   2. Zillow month must be under 120 days old (WARN), 200 blocks (FAIL). BEA
   *      publishes a new vintage each December; WARN once the vintage is more
   *      than two full years behind the calendar.
   *   3. the headline figures typed into the page copy (Myrtle Beach all-items
   *      and housing index, typical home value) must equal the JSON.
   */
  {
    const dp = path.join(__dirname, "data", "relocating", "col-places.json");
    const page = path.join(ROOT, "buyers", "relocating", "cost-of-living", "index.html");
    if (fs.existsSync(page)) {
      if (!fs.existsSync(dp)) {
        errors.push("data/relocating/col-places.json is missing - the cost-of-living calculator has no source of truth");
      } else {
        let d = null;
        try { d = JSON.parse(fs.readFileSync(dp, "utf-8")); }
        catch (e) { errors.push(`data/relocating/col-places.json does not parse: ${e.message}`); }
        if (d) {
          const { buildAsset } = require(path.join(__dirname, "data", "relocating", "build-col-data.js"));
          const assetName = assetFiles().find(n => /^col\.[0-9a-f]{10}\.js$/.test(n) || n === "col.js");
          if (!assetName) errors.push("no /assets/col.*.js - run 'node build.js coldata' then 'node build.js rehash'");
          else if (fs.readFileSync(path.join(ASSETS, assetName), "utf-8") !== buildAsset(d))
            errors.push(`/assets/${assetName} does not match data/relocating/col-places.json - run 'node build.js coldata' then 'node build.js rehash'`);
          const zDays = Math.floor((Date.now() - Date.parse(d.meta.zillowLatestMonth)) / 86400000);
          if (!Number.isFinite(zDays)) errors.push(`col-places.json has an unreadable zillowLatestMonth: ${d.meta.zillowLatestMonth}`);
          else if (zDays >= 200) errors.push(`cost-of-living home values are ${zDays} days old (Zillow month ${d.meta.zillowLatestMonth}). Run 'node build.js coldata', update the typed figures on the page, then rehash.`);
          else if (zDays >= 120) warns.push(`cost-of-living home values are ${zDays} days old (Zillow month ${d.meta.zillowLatestMonth}); the build blocks at 200. Run 'node build.js coldata' soon.`);
          const vintage = parseInt(d.meta.rppVintage, 10);
          if (new Date().getFullYear() - vintage > 2) warns.push(`cost-of-living price index is the ${vintage} vintage; BEA has released a newer one. Re-download MARPP/SARPP and run 'node build.js coldata'.`);
          const mb = (d.places || []).find(p => p.id === "myrtle-beach-conway-north-myrtle-beach-sc");
          if (!mb) errors.push("col-places.json has no Myrtle Beach record");
          else {
            /* Check the figures the page ACTUALLY states, which are written in
             * plain language, not index points. The owner cut "rents index at
             * 83.1 against a national 100" because it means nothing to a buyer,
             * so this gate must not demand it back. What the copy says is "about
             * 6 percent less" and "about 17 percent less", which are the two
             * index gaps rounded, plus the typical home value. */
            const html = fs.readFileSync(page, "utf-8");
            const want = [
              [`${Math.round(100 - mb.rpp.all)} percent`, "overall gap vs the US average"],
              [`${Math.round(100 - mb.rpp.housing)} percent`, "rent gap vs the US average"],
              ["$" + (Math.round(mb.zhvi / 1000) * 1000).toLocaleString("en-US"), "typical home value"],
            ];
            for (const [v, label] of want)
              if (!html.includes(v)) errors.push(`/buyers/relocating/cost-of-living/ copy is stale: ${label} should read "${v}" (recompute from data/relocating/col-places.json).`);
          }
        }
      }
    }
  }

  /* ---- market data must not go stale, and pages must match the data file ----
   *
   * On 2026-08-15 the site was publishing AirROI figures pulled on July 6. In
   * five weeks three of four markets had flipped from growth to decline while
   * /invest/airbnb-income/ still advertised North Myrtle Beach at +7.5% when it
   * was actually -5.4%. Nobody noticed because the number lived only in the
   * page. Two gates follow from that:
   *
   *   1. data/str-market.json carries its own retrieval date. Owner refreshes
   *      every 90 days. WARN at 75 so there is notice, FAIL at 90 so a stale
   *      number cannot reach a deploy.
   *   2. every revenue figure in the file must actually appear on the page that
   *      shows the table, or the JSON is decorative and the page has drifted.
   */
  {
    const dp = path.join(__dirname, "data", "str-market.json");
    if (!fs.existsSync(dp)) {
      errors.push("data/str-market.json is missing - the STR figures have no source of truth");
    } else {
      let d = null;
      try { d = JSON.parse(fs.readFileSync(dp, "utf-8")); }
      catch (e) { errors.push(`data/str-market.json does not parse: ${e.message}`); }
      if (d) {
        const limit = d.refreshDays || 90;
        const days = Math.floor((Date.now() - Date.parse(d.retrieved)) / 86400000);
        if (!Number.isFinite(days)) {
          errors.push(`data/str-market.json has an unreadable "retrieved" date: ${d.retrieved}`);
        } else if (days >= limit) {
          errors.push(`STR market data is ${days} days old (limit ${limit}). Re-open each sourceUrl in `
            + `data/str-market.json, update the figures, set "retrieved", then run 'node build.js strdata'.`);
        } else if (days >= limit - 15) {
          warns.push(`STR market data is ${days} days old; it blocks the build at ${limit}. Refresh soon.`);
        }
        const usd = n => "$" + Number(n).toLocaleString("en-US");

        // the roll-up page must carry every market's revenue...
        const target = path.join(ROOT, "invest", "airbnb-income", "index.html");
        if (fs.existsSync(target)) {
          const html = fs.readFileSync(target, "utf-8");
          for (const m of d.markets || []) {
            if (!html.includes(usd(m.revenue)))
              errors.push(`/invest/airbnb-income/ does not show ${m.name} at ${usd(m.revenue)} - the page has drifted `
                + `from data/str-market.json. Run 'node build.js strdata'.`);
          }
          // ...and the Myrtle Beach percentile copy, which drifted once because
          // the first version of this gate only looked at revenue.
          const mb = (d.markets || []).find(m => m.slug === "myrtle-beach");
          if (mb) for (const k of ["top10", "top25", "median", "bottom25"]) {
            if (mb[k] != null && !html.includes(usd(mb[k])))
              errors.push(`/invest/airbnb-income/ percentile copy is stale: Myrtle Beach ${k} should read ${usd(mb[k])}.`);
          }
        }

        // each submarket page must match its own row
        for (const m of d.markets || []) {
          const p = path.join(ROOT, "submarkets", m.slug, "index.html");
          if (!fs.existsSync(p)) continue;
          const html = fs.readFileSync(p, "utf-8");
          if (!html.includes("Short-term rental data")) continue; // block not added yet
          const want = [[usd(m.revenue), "revenue"], [m.occupancy + "%", "occupancy"],
                        [usd(m.adr), "nightly rate"], [usd(m.top10), "top-10% tier"], [usd(m.median), "median tier"]];
          for (const [v, label] of want)
            if (!html.includes(v))
              errors.push(`/submarkets/${m.slug}/ ${label} disagrees with data/str-market.json (expected ${v}).`);
        }
      }
    }
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

/* =========================================================================
 * dates - the ONE place any date this site publishes is decided.
 *
 * Every page states its age in three places: the visible "Updated <date>"
 * line, schema dateModified, and sitemap lastmod. They must agree, and they
 * must equal the day the page's PROSE last changed. Doing this by hand went
 * wrong in every possible direction:
 *
 *   - all 54 lastmods stamped to one day, which tells Google the whole site
 *     is churn and is the fastest way to have it stop trusting the dates
 *   - llms-full.txt dated by UTC clock, claiming a day that had not happened
 *   - 30 pages carrying two different dateModified values at once
 *   - a page counted as "edited" because the only change was the date stamp
 *     this very process had just written to it
 *
 * So: never decide a date by hand or by clock again. Run this. It derives
 * each date from git - the day the page's stripped visible text actually
 * changed - and writes that one value to all three places.
 *
 *   node build.js dates          fix every date, print what moved and why
 *   node build.js dates --check  report drift, change nothing, exit 1
 *
 * --check runs inside preflight, so a page whose dates drifted cannot reach
 * a deploy. If it fails, the fix is always `node build.js dates`.
 * ========================================================================= */

// Local calendar date. NEVER toISOString(): it is UTC, so from ~8pm Eastern
// it returns tomorrow. That shipped - llms-full.txt claimed 2026-07-28 while
// every page inside it said 07-27.
const localISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
const longDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
};

// A visible date stamp, in any wording the site uses.
const DATE_STAMP = /(?:&middot;|·)?\s*\b(Updated|Reviewed|Published|Verified|Last updated)\s+[A-Z][a-z]+\s+\d{1,2},?\s*20\d\d/g;
// Only these two mean "modified". "Published" is a historical fact and is
// never rewritten - a page can be published in June and updated in July.
const MODIFIED_STAMP = /\b(Updated|Reviewed)\s+[A-Z][a-z]+\s+\d{1,2},\s*20\d\d/g;

/*
 * What counts as CONTENT for the purpose of dating a page.
 *
 * Everything stripped here changes without the page saying anything new.
 * Both directions of getting this wrong have already happened:
 *
 *   strip too little - the date stamp this command writes reads as an edit on
 *     the next run, so every page bumps every time and the sitemap is bulk
 *     stamped. This is the single rule the site most needs not to break, and
 *     the naive version of this check walked straight into it.
 *   strip too much - a real rewrite looks like nothing and the page keeps
 *     advertising a stale date.
 *
 * The site mixes &#39; and &#x27; for apostrophes, so entities are normalised
 * before comparing or the same sentence reads as two different ones.
 */
const contentOf = (html) => {
  if (html == null) return null;
  const m = html.match(/<main[\s\S]*?<\/main>/i);
  let b = m ? m[0] : html;
  b = b.replace(/<script[\s\S]*?<\/script>/gi, " ")
       .replace(/<style[\s\S]*?<\/style>/gi, " ")
       .replace(/<!--[\s\S]*?-->/g, " ")
       .replace(/<[^>]+>/g, " ")
       .replace(/&#x27;|&#39;|&rsquo;|&#8217;/g, "'")
       .replace(/&quot;|&#34;/g, '"')
       .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&middot;/g, " ");
  b = b.replace(DATE_STAMP, " ");
  // legal-entity rename: boilerplate, lands on every page at once, says nothing new
  b = b.replace(/Chapter3 Realty (?:LLC|Corp|Inc)\b/g, "Chapter3 Realty");
  b = b.replace(/\s+/g, " ");
  // Removing a tag leaves a space behind, so wrapping words in a link turns
  // "construction," into "construction ,". Real case: /submarkets/carolina-forest/
  // linked two existing words to /buyers/new-construction/ and nothing else. The
  // prose was identical, but the naive compare called it an edit and wanted to
  // bump the date. Collapse space before punctuation so markup-only changes are
  // invisible here and prose changes still are not.
  b = b.replace(/\s+([,.;:!?%)\]])/g, "$1").replace(/([(\[])\s+/g, "$1");
  return b.trim();
};

const _gitCache = new Map();
const git = (args) => {
  const key = args.join(" ");
  if (_gitCache.has(key)) return _gitCache.get(key);
  const r = require("child_process").spawnSync("git", args,
    { encoding: "utf-8", maxBuffer: 128 * 1024 * 1024 });
  const out = r.status === 0 ? r.stdout : null;
  _gitCache.set(key, out);
  return out;
};

/*
 * History and blobs are fetched in exactly two git calls for the whole site.
 *
 * The obvious version - `git show <sha>:<path>` per commit per page - spawned
 * about 900 processes and took 4m47s on Windows. A gate nobody will wait for is
 * a gate nobody runs. One `git log --name-only` gives every commit that touched
 * every file; one `git cat-file --batch` streams every blob needed.
 */
let _hist = null;
const loadHistory = () => {
  if (_hist) return _hist;
  _hist = new Map();
  const out = git(["log", "--format=\x01%H %as", "--name-only"]) || "";
  for (const rec of out.split("\x01")) {
    if (!rec.trim()) continue;
    const lines = rec.split("\n");
    const head = lines[0].trim(), sp = head.indexOf(" ");
    if (sp < 0) continue;
    const sha = head.slice(0, sp), date = head.slice(sp + 1).trim();
    for (const raw of lines.slice(1)) {
      const p = raw.trim();
      if (!p) continue;
      if (!_hist.has(p)) _hist.set(p, []);
      _hist.get(p).push({ sha, date });   // git log is newest-first
    }
  }
  return _hist;
};

// git cat-file --batch: stdin one "<sha>:<path>" per line, stdout
// "<oid> <type> <size>\n<bytes>\n" per hit or "<input> missing\n" per miss.
// Parsed as Buffer because sizes are byte counts, not character counts.
const catFile = (specs) => {
  const out = new Map();
  if (!specs.length) return out;
  const r = require("child_process").spawnSync("git", ["cat-file", "--batch"],
    { input: specs.join("\n") + "\n", maxBuffer: 1024 * 1024 * 1024 });
  if (r.status !== 0 || !r.stdout) return out;
  const buf = r.stdout;
  let pos = 0, i = 0;
  while (pos < buf.length && i < specs.length) {
    const nl = buf.indexOf(0x0a, pos);
    if (nl === -1) break;
    const header = buf.slice(pos, nl).toString("utf-8");
    pos = nl + 1;
    if (/\bmissing$/.test(header)) { out.set(specs[i++], null); continue; }
    const size = parseInt(header.slice(header.lastIndexOf(" ") + 1), 10);
    if (!Number.isFinite(size)) break;
    out.set(specs[i++], buf.slice(pos, pos + size).toString("utf-8"));
    pos += size + 1;
  }
  return out;
};

/*
 * The day this page's prose last changed.
 *
 * Working tree first: an uncommitted content change is a change made today, and
 * it must win over history or you would publish a page whose visible date
 * predates the edit sitting in front of you.
 *
 * Consecutive entries in `git log -- <path>` are exactly the commits that
 * touched that path, so the content at commit i-1 is what commit i changed
 * away from. Comparing neighbours needs N blobs, not the 2N that looking up
 * every <sha>^ would cost.
 *
 * No --follow. Across a rename, <sha>:<path> points at a path that did not
 * exist yet, which reads as "file added" and dates the page to the move. A
 * moved page has a new URL and is a new page anyway.
 */
const trueDate = (relFile, blobs) => {
  const gp = relFile.split(path.sep).join("/");
  const hist = loadHistory().get(gp) || [];
  const disk = contentOf(fs.readFileSync(relFile, "utf-8"));
  if (!hist.length) return { date: localISO(), why: "new page, not committed yet" };
  if (disk !== contentOf(blobs.get(`${hist[0].sha}:${gp}`)))
    return { date: localISO(), why: "uncommitted content change" };
  for (let i = 0; i < hist.length - 1; i++) {
    const now = contentOf(blobs.get(`${hist[i].sha}:${gp}`));
    const prev = contentOf(blobs.get(`${hist[i + 1].sha}:${gp}`));
    if (prev === null) return { date: hist[i].date, why: "first published" };
    if (now !== prev) return { date: hist[i].date, why: "prose last changed" };
  }
  // Every commit touching this file was chrome, assets or dates. Use the oldest
  // rather than today: the content genuinely has not changed since then.
  return { date: hist[hist.length - 1].date, why: "first published" };
};

// Rewrite visible stamps without touching JSON-LD, which lives in <script> and
// carries its own dateModified handled separately.
const setVisibleDate = (html, iso) => {
  const held = [];
  let out = html.replace(/<script[\s\S]*?<\/script>/gi, (m) => {
    held.push(m); return ` S${held.length - 1} `;
  });
  out = out.replace(MODIFIED_STAMP, `$1 ${longDate(iso)}`);
  return out.replace(/ S(\d+) /g, (_, i) => held[+i]);
};

function dates(check) {
  const smPath = path.join(ROOT, "sitemap.xml");
  if (!fs.existsSync(smPath)) { console.log("no sitemap.xml"); process.exit(1); }
  let sm = fs.readFileSync(smPath, "utf-8");
  if (git(["rev-parse", "--git-dir"]) === null) {
    console.log("dates: not a git repository - cannot derive content dates."); process.exit(1);
  }

  const entries = [...sm.matchAll(
    /<loc>https:\/\/chapter3realty\.com(\/[^<]*)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)];
  const drift = [], moved = [];

  const fileFor = (url) => url === "/" ? path.join(ROOT, "index.html")
    : path.join(ROOT, url.replace(/^\//, "").replace(/\/$/, "").split("/").join(path.sep), "index.html");

  // One batched blob fetch for the whole site, before any page is examined.
  const hist = loadHistory();
  const specs = [];
  for (const [, url] of entries) {
    const f = fileFor(url);
    if (!fs.existsSync(f)) continue;
    const gp = f.split(path.sep).join("/");
    for (const h of hist.get(gp) || []) specs.push(`${h.sha}:${gp}`);
  }
  const blobs = catFile(specs);

  for (const e of entries) {
    const [, url, had] = e;
    const file = fileFor(url);
    if (!fs.existsSync(file)) { drift.push(`${url}  in sitemap but no file on disk`); continue; }

    const { date: want, why } = trueDate(file, blobs);
    const before = fs.readFileSync(file, "utf-8");
    let after = before.replace(/("dateModified"\s*:\s*")[^"]+(")/g, `$1${want}$2`);
    after = setVisibleDate(after, want);

    // datePublished is a historical fact. If this ever moves it, stop.
    const pubBefore = (before.match(/"datePublished"\s*:\s*"[^"]+"/g) || []).join("|");
    const pubAfter = (after.match(/"datePublished"\s*:\s*"[^"]+"/g) || []).join("|");
    if (pubBefore !== pubAfter) {
      console.log(`\nFAIL - ${url}: datePublished would change. Refusing.`); process.exit(1);
    }

    const smWrong = had !== want, pageWrong = after !== before;
    if (!smWrong && !pageWrong) continue;

    if (check) {
      if (smWrong) drift.push(`${url}  sitemap lastmod ${had}, but ${why} on ${want}`);
      if (pageWrong) drift.push(`${url}  visible date or schema disagrees with ${want}`);
    } else {
      if (pageWrong) fs.writeFileSync(file, after);
      if (smWrong) sm = sm.replace(e[0], e[0].replace(`<lastmod>${had}</lastmod>`, `<lastmod>${want}</lastmod>`));
      moved.push(`${url}  ${had} -> ${want}  (${why})`);
    }
  }

  const newest = [...sm.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)].map(m => m[1]).sort().pop();
  const lp = path.join(ROOT, "llms.txt");
  if (fs.existsSync(lp) && newest) {
    const l = fs.readFileSync(lp, "utf-8");
    const cur = (l.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/) || [])[1];
    if (cur && cur !== newest) {
      if (check) drift.push(`llms.txt  Last updated ${cur}, newest page is ${newest}`);
      else {
        fs.writeFileSync(lp, l.replace(/(Last updated:\s*)\d{4}-\d{2}-\d{2}/, `$1${newest}`));
        moved.push(`llms.txt  ${cur} -> ${newest}`);
      }
    }
  }

  if (check) {
    if (drift.length) {
      console.log(`\nFAIL (${drift.length}) - dates are wrong. Run 'node build.js dates'.`);
      drift.forEach(d => console.log("  !! " + d));
      process.exit(1);
    }
    console.log(`OK - all ${entries.length} pages date to their real last content change.`);
    return;
  }

  if (!fs.existsSync(smPath) || !moved.length) {
    console.log(`OK - all ${entries.length} pages already correct. Nothing to change.`);
    return;
  }
  fs.writeFileSync(smPath, sm);
  console.log(`Corrected ${moved.length}:`);
  moved.forEach(m => console.log("  " + m));
  const bump = moved.filter(m => !m.startsWith("llms.txt")).length;
  console.log(`\n${bump} page dates moved, ${entries.length - bump} left alone.`);
  console.log("llms-full.txt carries the header date - run 'node build.js llmsfull' if page text changed.");
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
  const sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8");
  // Date the file by the newest real content change, not by the clock.
  // toISOString() is UTC, so after ~8pm Eastern it stamped tomorrow's date and
  // llms-full.txt claimed to be newer than every page in it.
  const today = [...sm.matchAll(/<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/g)]
    .map(m => m[1]).sort().pop();
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

/* Figurative language. Owner instruction, 2026-08-16: "replace all metaphors and
 * idioms and personification". The relocator batch shipped with nine of these on
 * one page — housing "carries" a gap, money "disappears", insurance is an
 * "ambush", New York "does not let go". Each one makes a plain fact sound like
 * an essay, and the owner reads the page as a buyer would.
 *
 * FAILS the build, because a warning did not stop the last batch. If a phrase
 * here is genuinely literal in context, rewrite the sentence rather than
 * loosening the rule: every entry below was a real defect in real copy. */
const FIGURATIVE = [
  "carries almost", "carries the whole", "does the work", "money disappears",
  "the ambush", "runs the other way", "goes the wrong way", "cuts both ways",
  "pressure-test", "the trap is", "catches people",
  // Owner review 2026-08-25: "the line that disappears" shipped as a header.
  // Taxes end, exemptions are lost, credits stop; nothing disappears. "slice"
  // for a share of income, "dress it up", and agents who "vanish" are the
  // same family. Each of these had a live instance when it was added.
  "disappear", "vanish", "entire slice", "dress it up", "dressing up",
  // Overnight sweep 2026-08-30: each had a live instance when added.
  "the heart of", "navigating bylaws", "unlocks when",
  // Owner, 2026-08-25 round 7: "that one line decides" is banned everywhere.
  "one line decides", "one line on the map", "that one line", "the line that changes",
  // Owner, 2026-08-26 round 3: "Two exceptions decide where to look harder"
  // drew "stop saying any phrase similar to this at all ever." The family is
  // things-decide teaser sentences, plus two road metaphors and one
  // self-referential line caught in the same review. Plain "the county
  // decides" stays legal; the ban is the N-things-decide-X construction.
  // Owner, 2026-08-26 round 4: "never say one rule decides or sits above or
  // anything else similar ever again." The family is rule-hierarchy teasers.
  // Plain geographic "sits" ("the airport sits inside the city") stays legal.
  "one rule decides", "one rule sits", "rule sits above", "sits above",
  "stands above", "rule above every",
  // Owner, 2026-08-28: "the register takes more" and "goes the other way"
  // called out as personification/metaphor. Same review hard-coded the
  // no-negative-headers rule (HEADER_NEGATIVE below).
  "the register takes", "goes the other way",
  // Owner, 2026-08-28: "Sixty miles of sand, five rulebooks" in the beaches
  // hero. Towns write ordinances, not books. Covers rulebook(s) and the
  // two-word form.
  "rulebook", "rule book",
  "exceptions decide", "things decide", "differences decide",
  "decide where to look", "decides where to look",
  "decide the purchase", "decides the purchase",
  "workhorse", "the main artery", "will not invent",
  // NOT "rate card": a property-management rate card is a real document, and
  // /invest/airbnb-income/ cites them literally in its sources line.
  // NOT "the clock starts": the 45-day and 180-day clocks are what the 1031
  // rules are actually called.
  "let go quickly", "does not let go", "worth ten minutes", "dressing it up",
  "the size of the win", "stand in for", "a brand new line",
  "falls straight out", "lives only", "sits outside the", "in your favor",
  // NOT "is where the": it fires on plain literal sentences such as "Conway is
  // where the county offices are". A substring rule cannot tell those apart,
  // and it flagged seven pages that read fine.
  "collapse that is not coming", "eats into", "punishing",
  "the honest ones", "hold on to", "paints a picture", "tells a story",
  "the numbers speak", "at the end of the day", "when push comes to shove",
  "the bottom line is", "a stone's throw", "worth its weight",
];

/* Owner instruction 2026-08-30, second round, verbatim ending: "Ban it all
 * HARDCODED lets never have this conversation again." The banned territory is
 * every figurative device (metaphor, simile, hyperbole, understatement,
 * personification, idiom, irony, sarcasm, oxymoron, synecdoche, metonymy,
 * pun, allegory), every indirect-speech device (euphemism, innuendo,
 * allusion, circumlocution, hedging, equivocation, indirect speech acts),
 * and the AI-writing tells he listed (contrast framing, tricolon,
 * false-suspense transitions, grandiose conclusions, "No X. No Y. Just Z.",
 * ornate metaphor, therapist-speak, the vocabulary blacklist).
 *
 * A regex cannot recognise irony or hyperbole. What it CAN do is hold every
 * named phrase, every blacklisted word, and every detectable structure, and
 * grow by one entry every time a live instance is found - the same contract
 * as FIGURATIVE above. The full taxonomy lives in PLAYBOOK.md A11 so the
 * writer is bound by the whole list, not only the detectable part.
 * Word-sense carve-outs, each checked against the live corpus 2026-08-30:
 *   - "understated" (adjective, the Pawleys Island character) stays legal;
 *     the verb understate/understates/understating is banned.
 *   - "navigation" (keyboard navigation on /accessibility/, literal boat
 *     navigation) stays legal; navigate/navigates/navigated/navigating is
 *     banned.
 *   - a literal lighthouse or landscape is legal; "beacon of", "symphony
 *     of", "tapestry" and "a lighthouse of/for" are banned. */
const AI_TELL_PHRASES = [
  // named by the owner this round, each with a live instance when added
  "is your call", "does the rest", "the pattern shows", "bought into",
  "that still works", "the wanting is", "housing money", "house money",
  // false-suspense transitions
  "here's the kicker", "here is the kicker", "here's where it gets",
  "here is where it gets", "here's the thing", "here is the thing",
  "the thing is,", "the thing about", "the truth is,", "the reality is,",
  "plot twist",
  // grandiose-conclusion family
  "testament to", "a testament", "enduring legacy", "underscores",
  "underscoring", "underscored",
  // hedges (numeric qualifiers like "about" and "roughly" stay legal - the
  // calculator honesty rule requires them)
  "it seems like", "some might say", "one could argue", "arguably",
  "needless to say", "to be fair,", "it's worth noting", "it is worth noting",
  // euphemism
  "passed away",
  // ornate-metaphor family
  "tapestry", "beacon of", "symphony of", "a lighthouse of",
  "a lighthouse for", "uncharted",
  // the vocabulary blacklist
  "delve", "delving", "harken", "resonate", "resonates", "resonating",
  "encapsulate", "encapsulates", "multifaceted", "bespoke",
  "crucial", "pivotal", "vibrant", "game-chang", "game chang",
  // money/number idioms and mannerisms (owner round 2026-08-31)
  "in your pocket", "the last word", "seals it", "fare better", "fares better",
  "set this off", "worth trusting", "moves the other way", "move the other way",
  "run the other way", "runs the other way", "starts fresh", "start fresh",
  "outgrow", "outgrew", "outgrown", "held down by", "its own question",
  "run lower", "runs lower", "run higher", "runs higher",
  "runs about", "run about", "ran about", "runs roughly", "run roughly",
  "ran roughly", "runs around", "run around", "ran around",
  // refusing to answer a factual question instead of giving the average
  // (owner rule 2026-08-31: "give actual data and say on average yes or no").
  // "not a promise" stays legal: it is a required disclaimer on one household's
  // numbers, not a dodge.
  "will not promise", "won't promise", "cannot promise", "can't promise",
  "nobody can promise", "no one can promise", "we do not promise",
  "we don't promise", "not something we promise",
];
const AI_TELL_REGEX = [
  // pseudo-cleft: "What the leftover money does is your call" and "What the
  // designation does is close that school" both shipped.
  [/\bwhat [^.?!;]{1,55} (does|did|was|means) is\b/i, 'pseudo-cleft ("What X does is Y") - state it directly: "X does Y"'],
  [/\bwhat (we|they|you|it) [a-z]{2,12}( [a-z]{2,12})? is\b/i, 'pseudo-cleft ("What we do X is Y") - state it directly: "We do X"'],
  [/\bwhat [^.?!;]{1,55} is is\b/i, 'pseudo-cleft ("What X is is Y") - state it directly'],
  // contrast framing, all three shapes found or listed
  [/\bnot (just|only|merely|simply) [^.?!;]{1,60}[,;] (but |it)/i, 'contrast framing ("not just X, but Y") - state the one true claim'],
  [/, not (just|only) [a-z]/i, 'contrast framing (", not just X") - drop the rhetorical contrast'],
  [/\b(isn't|is not) (just|only|merely) (a|an|about)\b/i, 'contrast framing ("is not just a") - state what it is'],
  // marketing staccato
  [/\bno [\w' -]{1,22}\. no [\w' -]{1,22}\. just\b/i, '"No X. No Y. Just Z." - write one plain sentence'],
  // banned verb forms whose noun or adjective forms stay legal
  [/\bunderstates?\b|\bunderstating\b/i, 'understatement - give the accurate number instead'],
  [/\bnavigat(e|es|ed|ing)\b/i, '"navigate" - say what the person actually does (drive, read, work through)'],
  [/\bleverag/i, '"leverage" - say negotiating power, bargaining power, or borrowed money'],
  [/\bunlock(s|ed|ing)?\b/i, '"unlock" - say what actually becomes available'],
  [/\bfoster(s|ed|ing)?\b/i, '"foster" - say what actually happens'],
  [/\bdynamic(s|ally)?\b/i, '"dynamic" - describe the actual behavior'],
];


/* ---- Hero sub-header rules (owner, 2026-09-01) ----
 * "All of our subheaders need to be keyword and attention grabbing. Make
 * hard rules so that it does it right every time." The rules below are what
 * the subheadline guidance agrees on once the fluff is removed: Nielsen
 * Norman Group (readers scan, front-load the topic word, address the reader),
 * Copyblogger and CXL (a subheadline states one specific benefit or proof,
 * carries a number or a place, runs at most two lines), Google's heading
 * guidance (the page topic in the heading text), plus the owner's own review
 * notes: "minutes, not weeks" flagged as empty contrast, and the 22 relocation
 * subs that all ran on one "what to expect ... what to expect" template.
 * Every rule is measured on the rendered text of the sub, whichever markup
 * the hero uses (ivory .detail-sub, or the inline-styled ivory paragraph on
 * a navy hero). See PLAYBOOK.md A14. */
const SUB_PLACE = /\b(?:Myrtle Beach|Grand Strand|Horry|South Carolina|Conway|Surfside|Pawleys|Litchfield|Little River|Murrells Inlet|Carolina Forest|Garden City|Socastee|Longs|Loris|Aynor|Georgetown|Market Common|Cherry Grove|Forestbrook|Burgess|Coastal Carolina|Intracoastal|Waccamaw|Barefoot|Grande Dunes|Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming|Charlotte|Raleigh|Boston|Pittsburgh|Philadelphia|Baltimore|Buffalo|Cleveland|Columbus|Richmond|Hartford|Tampa|Orlando|Jacksonville|Miami|Naples|Cape Coral|Long Island|Bergen|Nassau|Suffolk|Howard County)\b/;
const SUB_NUMWORD = /\b(?:thousands?|hundreds?|dozens?|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|sixty|eighty|half|quarter|double|triple)\b/i;
// tokens that appear in almost every keyword string on the site, so they
// cannot prove the sub is about THIS page
const SUB_WEAK = new Set(["myrtle","beach","grand","strand","south","carolina","horry","realty","chapter3","chapter",
  "guide","guides","home","homes","house","houses","real","estate","area","areas","near","best","2026","2025",
  "with","from","your","what","that","this","the","and","for","you","when","where","which","how","why","every",
  "need","know","much","make","good","right","work","find","look","live","actually","sell","buy","buying","selling"]);
const SUB_STOP = new Set("the a an and or of to in on for with by at from as is are was were be been it its this that these those you your we our us their they them he she his her not no but if then than so do does did have has had can could will would should may might into over under about after before between more most less least very just only also any all some such which who whom whose what when where why how".split(" "));
const subTokens = (x) => x.toLowerCase().replace(/[^a-z0-9$%' -]/g, " ").split(/\s+/).filter(w => w.length >= 4 && !SUB_STOP.has(w));
const subStem = (w) => { w = w.toLowerCase(); return w.length <= 4 ? w : w.replace(/ies$/, "i").replace(/(?:ing|ed|es|s|ly)$/, ""); };
const subHasToken = (kwTok, text) => {
  const a = subStem(kwTok);
  return text.toLowerCase().split(/[^a-z0-9$%'-]+/).some(w => {
    const b = subStem(w);
    if (!a || !b) return false;
    return a === b || (a.length >= 3 && b.startsWith(a)) || (b.length >= 3 && a.startsWith(b))
      || (a.length >= 6 && b.length >= 6 && a.slice(0, 5) === b.slice(0, 5));
  });
};
/* Returns { text, markup } for the hero sub-header, or null. Two markups
 * exist: <p class="detail-sub"> on ivory heroes, and on navy heroes the first
 * inline-styled ivory paragraph after </h1> that is not the byline. */
function heroSub(mainHtml) {
  const d = mainHtml.match(/<p class="detail-sub">([\s\S]*?)<\/p>/);
  const clean = (x) => decodeEnt(x.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
  if (d) return { text: clean(d[1]), markup: "detail-sub" };
  const h1 = mainHtml.indexOf("</h1>");
  if (h1 < 0) return null;
  const after = mainHtml.slice(h1 + 5, h1 + 2000);
  for (const m of after.matchAll(/<p style="color:rgba\(244,239,232,[^"]*"[^>]*>([\s\S]*?)<\/p>/g)) {
    const t = clean(m[1]);
    if (!/^By\b/.test(t)) return { text: t, markup: "navy inline" };
  }
  return null;
}

/* ---- Sentence-level punch rules (owner, 2026-09-01) ----
 * "Hard code sentences being punchy and snappy and valuable ... research
 * what people are saying you are doing wrong when it comes to writing and
 * hard code the solution." What the complaints agree on, measured here:
 *   - long sentences (a cap per sentence, and a cap on the page mean)
 *   - parenthetical asides (the most-named tell; an aside is its own sentence)
 *   - hedging and intensifying adverbs: actually, very, really, genuinely...
 *   - "And"/"So" sentence openers (the fragment-for-rhythm tic)
 *   - teaser and summarizer phrases: "here is how", "the takeaway", "which
 *     is why", "the whole story", "the good news"
 *   - over-used modals: may/might counted per page
 * Sources: PCWorld's ranked list of AI writing habits, Wikipedia's "Signs of
 * AI writing" project page, Reddit r/writing and r/ClaudeAI threads on
 * Claude's register, and the owner's reviews. The legal blocks (TCPA consent,
 * AfBA disclosure, the calculator disclaimer, sources lists) are exempt: their
 * wording is fixed by law or by the sources themselves. See PLAYBOOK.md A15. */
const PUNCH_MAX_SENTENCE = 40;      // words; error above this
const PUNCH_WARN_SENTENCE = 32;     // words; page warning when more than 3 exceed it
const PUNCH_MAX_MEAN = 20;          // words per sentence, page mean
const PUNCH_MAX_MODALS = 4;         // may/might per page before a warning
const PUNCH_ASIDE_WORDS = 5;        // a parenthetical this long is an aside
const PUNCH_WORDS = [
  // hedges and intensifiers
  [/\bactually\b/i, '"actually" - delete it; the sentence says the same thing without it'],
  [/\bvery\b/i, '"very" - delete it or give the number'],
  [/\breally\b/i, '"really" - delete it'],
  [/\btruly\b/i, '"truly" - delete it'],
  [/\bgenuinely\b/i, '"genuinely" - delete it'],
  [/\bquite\b/i, '"quite" - delete it or give the number'],
  [/(?<!would |'d |\bor )\brather\b(?! than)/i, '"rather" as a hedge - delete it ("rather than" and "would rather" stay legal)'],
  [/\bsomewhat\b/i, '"somewhat" - give the number or delete it'],
  [/\bfairly\b/i, '"fairly" - give the number or delete it'],
  [/\ba bit\b/i, '"a bit" - give the number or delete it'],
  [/\bbasically\b/i, '"basically" - delete it'],
  [/\bessentially\b/i, '"essentially" - delete it'],
  [/\bclearly\b/i, '"clearly" - delete it; state the fact'],
  [/\bobviously\b/i, '"obviously" - delete it'],
  [/\bof course,/i, '"of course" - delete it'],
  // commentary adverbs and summarizers
  [/\bimportantly\b/i, '"importantly" - delete it; put the important fact first'],
  [/\bnotably\b/i, '"notably" - delete it'],
  [/\binterestingly\b/i, '"interestingly" - delete it'],
  [/\bin other words\b/i, '"in other words" - say it once, the clear way'],
  [/\b(?:put simply|simply put)\b/i, '"put simply" - just say it'],
  [/\bin short[,.]/i, '"in short" - delete it'],
  [/\bin practice\b/i, '"in practice" - delete it; state what happens'],
  [/\bin plain (?:english|words|language|terms)\b/i, '"in plain English" - do not describe the writing, just write plainly'],
  [/\bultimately\b/i, '"ultimately" - delete it'],
  [/\bat the end of the day\b/i, '"at the end of the day" - delete it'],
  [/\bthe bottom line\b/i, '"the bottom line" - state the fact'],
  [/\bthe lesson\b/i, '"the lesson" - state the fact, do not narrate a moral'],
  [/\bthe takeaway\b/i, '"the takeaway" - state the fact'],
  [/\bin conclusion\b|\bin summary\b|\bto sum up\b|\ball in all\b/i, 'summary opener - delete it'],
  [/\bthat said,|\bthat being said\b/i, '"that said" - start the sentence with the fact'],
  [/\bit(?:'s| is) important to\b|\bit should be noted\b/i, '"it is important to" - delete the frame, keep the fact'],
  [/\b(?:keep|bear) in mind\b/i, '"keep in mind" - delete the frame, keep the fact'],
  // teaser openers
  // sentence-initial, or after a comma/colon/"so": "a deal here is a house" is not a teaser
  [/(?:^|[.:;!?]\s+|,\s+|\b(?:so|and|but)\s+)here(?:'s| is| are) (?:how|what|why|the|a|an|our|where|when|every|each|two|three|four|five)\b/i, '"here is how/what" teaser - delete it and state the thing'],
  [/\bwhich is why\b/i, '"which is why" - split into two sentences'],
  [/\bthe whole (?:trade|idea|question|point|strategy|deal|exchange|cycle|picture|answer|story|game|reason|process)\b/i, '"the whole story/deal" - say the specific thing'],
  [/\breal (?:money|story|question|answer|picture|version|thing|test|reason|difference)\b/i, '"real X" intensifier - drop "real"'],
  [/\b(?:minutes|hours|days|weeks|months|years), not (?:minutes|hours|days|weeks|months|years)\b/i, '"X, not Y" time contrast - give the actual time'],
  [/\bone thing\b/i, '"one thing" - name the thing'],
  [/\bworth (?:knowing|noting|mentioning|remembering)\b/i, '"worth knowing" - delete the frame, state the fact'],
  [/\bthe (?:good|bad) news\b/i, '"the good news" - state the fact'],
  [/\bthe catch is\b|\bthe big one\b/i, '"the catch is" / "the big one" - state the fact'],
  [/\bthink of it as\b|\bimagine\b|\bpicture this\b/i, 'imagination frame - state the fact'],
  // wordiness and buzzwords
  [/\bwhen it comes to\b/i, '"when it comes to" - say "for" or restructure'],
  [/\bin terms of\b/i, '"in terms of" - delete it'],
  [/\bin order to\b/i, '"in order to" - say "to"'],
  [/\bthe reality of\b|\bthe reality is\b/i, '"the reality" - state the fact'],
  [/\ba (?:wide|broad) (?:range|variety|array) of\b|\ba variety of\b/i, '"a wide range of" - say how many, or name them'],
  [/\bplays? an? (?:\w+ )?role\b/i, '"plays a role" - say what it does'],
  [/\bin today's\b|\bin the (?:world|realm) of\b/i, 'scene-setting opener - delete it'],
  [/\blandscape\b|\brobust\b|\bseamless|\bcutting.edge\b|\bstate.of.the.art\b|\bdeep dive\b|\bsweet spot\b|\bat its core\b|\bthe beauty of\b|\bjourney\b|\bunpack|\bnuance/i, 'buzzword - say the plain thing'],
];
const PUNCH_OPENER = /(?:^|[.!?]\s+)(?:And|So)\b(?!\s+(?:far|what|how|much|many|long)\b)/;

/* ---- The local edge on investor strategy pages (owner, 2026-09-02) ----
 * "All of the investor strategy pages should be focused on why we are the
 * best brokerage to help them in Myrtle Beach and the Grand Strand, otherwise
 * we just compete with national brands. Not too salesy and desperate; should
 * read as informational and frequently drop casually why we are the greatest."
 * Measured as: sentences that pair a Chapter3 token with a local token. A
 * strategy page with fewer than LOCAL_EDGE_MIN of them is a page a national
 * brand could have written. SALESY is the other half of the instruction: the
 * desperate phrases fail everywhere on the site. */
const LOCAL_EDGE_PAGES = /^\/invest\/strategies\//;
const LOCAL_EDGE_MIN = 4;
// case matters only where it must: "US 17" is a road, "us " is the brokerage
const LOCAL_BRAND = /\b(?:Chapter ?3|[Oo]ur (?:agents?|team|broker|lending partner|preferred lender|analysts|buyer list)|an agent at|Timmy|Devin|[Ww]e |us )/;
const LOCAL_PLACE = /\b(?:Myrtle Beach|Grand Strand|Horry|this market|here\b|local|Conway|Coastal Carolinas)/;
const SALESY = [
  // imperative or exclusivity forms only: "Why buyers trust us" and "no hurry" are legal
  [/(?:^|[.!?:]\s+)trust us\b/i, "trust us"], [/\bcall today\b/i, "call today"], [/\bact now\b/i, "act now"],
  [/\bdon'?t (?:wait|miss out)\b/i, "don't wait"], [/\bhurry up\b/i, "hurry up"], [/\byou can'?t afford to\b/i, "you can't afford to"],
  [/\bguaranteed results\b/i, "guaranteed results"], [/\bworld-class\b|\bunmatched\b|\bunrivaled\b|\bsecond to none\b|\baward-winning\b|\bpremier\b/i, "puffery adjective"],
  [/\bthe only brokerage\b|\bno other brokerage\b|\bnobody else can\b|\bno one else can\b/i, "exclusivity claim"],
  [/#1 brokerage|\bnumber one brokerage\b|\btop-rated brokerage\b|\bbest-in-class\b|\bindustry-leading\b|\bleading brokerage\b/i, "ranking claim"],
];

/* Filler and teaser sentences the owner deleted on review (2026-08-22): lines
 * that promise, editorialize or state the obvious instead of giving the fact.
 * "It repeats every year", "prices move weekly", a header ending "and one of
 * them is new", "nobody tells them until they file". Each entry shipped once.
 * Checked against the corpus before adding: no other page contains any of
 * them, so a hit is the defect and not a coincidence. */
const FILLER = [
  "repeats every year", "prices move weekly", "one of them is new",
  "go against you", "the single largest number", "written as though",
  "all upside", "nobody tells them",
];
/* Owner instruction, 2026-08-25: "every CTA on the site needs to either go to
 * a functional value based tool or to a contact us pop up/page. Normal links
 * are for linking to pages; the CTAs are trying to get conversions."
 * A button-styled anchor (class contains "btn") may point only at these pages,
 * tel:/sms:/mailto:, or a form/calculator anchor that actually exists on the
 * target page. The anchor-must-exist part also catches dead buttons: the HOA
 * cluster shipped 60 buttons to #lead-form on pages that had no lead form. */
const CTA_DESTINATIONS = new Set([
  "/contact/",
  "/buyers/cost-to-own/",
  "/buyers/relocating/cost-of-living/",
  "/buyers/closing-costs/",
  "/buyers/property-taxes/",
  "/invest/long-term-rental/",
  "/sell/capital-gains/",
  "/sell/net-proceeds/",
]);
/* Industry jargon. Owner instruction, 2026-08-20: "never use an industry term
 * ever in an article, hard code that". He caught "listing" being used where
 * "house" was meant. A buyer does not say listing, comp, DOM, or SFR; they say
 * house, what it sold for, how long it sat. FAILS the build.
 *
 * Only words with a plain-English equivalent are listed. Terms a buyer must
 * actually learn (escrow, HOA, closing costs, flood zone, assessment ratio)
 * are NOT here: glossing those is the job, per PLAYBOOK A12. */
const JARGON = [
  /* Word-boundary regexes, not substrings: a plain substring list matched
   * "ran(dom)" and "a comp(arable)" on pages that were written correctly.
   *
   * This list is deliberately NARROW, because the first version flagged 54 of
   * 88 pages and most of those were right. Checked every hit by hand first:
   *   - "listing agent" is a role a buyer meets and several pages teach it on
   *     purpose ("the listing agent works for the seller"). Allowed.
   *   - "every listing in the market" on the submarket pages means an Airbnb
   *     listing, which is the correct word. Allowed.
   *   - "days on market" and "months of supply" are the labels on the market
   *     data tables and Zillow shows both to consumers. Allowed.
   *   - "CMA" and "comps" are already glossed on first use, which PLAYBOOK A12
   *     asks for. Allowed.
   * What is banned is the misuse the owner caught: "listing" standing in for
   * the house itself. */
  [/\blisting(?:'s|&#39;s|&rsquo;s)\s+(?:word|claim|school|photo|remarks|description)/i, "listing's (say the home's)"],
  [/\bpast the listing\b|\bon a listing\b|\bon (?:real|our|these) listings\b|\ba listing photo\b/i, "listing (say home)"],
  [/\babsorption rate\b/i, "absorption rate"],
  [/\bprice point\b|\bprice per door\b/i, "price point (say price)"],
  [/\bsfrs?\b|\bsfhs?\b/, "SFR/SFH"],   // bodyLow is lowercased; the old capitals never matched
  [/\bbuy box\b|\boff-market deal\b|\bfarm area\b|\bsphere of influence\b/i, "prospecting jargon"],
  [/\bboots on the ground\b|\bvalue-add play\b|\btrade area\b/i, "investor jargon"],
  [/\bthe subject property\b|\basset class\b|\bproduct type\b/i, "appraiser jargon"],
  [/\bend[- ]user buyer\b|\bretail buyer\b/i, "end-user buyer"],
  // Owner, 2026-08-20: "Don't say marketing copy". Naming our own trade inside
  // an article breaks the fourth wall; the buyer wants the fact, not the genre.
  [/marketing copy|ad copy|sales copy|this article/i, "writing about the writing"],
];

/* Headings must say what the section is about. Owner instruction, 2026-08-20:
 * "stop speaking in metaphors and rhymes and shit be clear if someone reads
 * this they have no idea at all what the next section is about", on the
 * heading "What to bring, and the dates that bind".
 *
 * Checks every H2 and H3 inside <main> for figurative or empty phrasing.
 * A heading is allowed to be a question. It is not allowed to be a riddle.
 * FAILS the build. */
const VAGUE_HEADING = [
  "dates that bind", "the dates that", "what nobody tells you", "the truth about",
  "here is the thing", "what you need to know", "a few thoughts", "some notes on",
  "the real story", "the honest version", "what it really means", "read this first",
  "the bottom line", "the big picture", "food for thought", "worth knowing",
  "the fine print", "what gives", "the catch", "the rub", "the twist",
];

/* Self-congratulation and meta-commentary about our own page. The owner cut
 * "and almost nobody mentions it" by hand. A buyer does not care what other
 * websites do. FAILS the build. */
const SELF_REFERENTIAL = [
  "almost nobody mentions", "nobody mentions", "no one else mentions",
  "most articles", "every other article", "unlike other", "other sites",
  "we are the only", "nobody else", "you will not find this",
  "what makes this page", "the only page",
];
/* Flesch-Kincaid grade level. PLAYBOOK A11a: the /hoa/ batch scored grade 4.8
 * to 6.8 and the owner still could not follow it, so a low score is not proof
 * of a readable page. But a HIGH score is proof of an unreadable one, and the
 * relocator batch drifted to long sentences full of clauses. Warn over 7, fail
 * over 9. Sentences and syllables are counted on visible body prose only. */
const readability = (text) => {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = (clean.match(/[.!?]+(?=\s|$)/g) || []).length || 1;
  const words = clean.split(/\s+/).filter((w) => /[a-z]/i.test(w));
  if (words.length < 120) return null;                  // too short to judge
  const syll = (w) => {
    w = w.toLowerCase().replace(/[^a-z]/g, "");
    if (w.length <= 3) return 1;
    w = w.replace(/(?:es|ed|[^aeiou]e)$/, "");
    return (w.match(/[aeiouy]{1,2}/g) || ["x"]).length;
  };
  const syllables = words.reduce((n, w) => n + syll(w), 0);
  return 0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59;
};
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
const TRIGGER_DOWN = /([0-9]+(?:\.[0-9]+)? ?(?:percent|%))\+? ?(?:down\b|down payment)/gi;
// The same trigger term stated at a distance ("The down payment. Plan on 20 to
// 25 percent...") dodged the adjacency pattern above and shipped on the DSCR
// page. These catch a nonzero percentage within the same sentence as "down
// payment", either order. [1-9] start keeps the "0% down" carve-out legal.
const TRIGGER_DOWN_NEAR = [
  // '.' is allowed forward so the label form is caught ("The down payment.
  // Plan on 20 to 25 percent"); '!?<' still bound the window.
  /down payment\.?[^!?<]{0,70}\b[1-9][0-9]?(?:\.[0-9]+)? ?(?:percent|%)/i,
  /\b[1-9][0-9]?(?:\.[0-9]+)? ?(?:percent|%)[^.!?<]{0,70}down payment/i,
];
// Percentages that sit near "down payment" but are not the down payment:
// VA seller concessions ("0% down payment, no PMI, seller concessions up to
// 4%") false-positived on 2026-09-01. Windows matching these are skipped.
const TRIGGER_DOWN_NEAR_OK = /(?:closing costs?|on top of the down payment|concessions? (?:are capped at|up to) [0-9.]+ ?(?:percent|%))/i;
// closing-cost ranges and seller-concession caps are not 1026.24(d)(1)
// trigger terms; both false-positived on 2026-09-01 and are exempt when the
// phrase sits inside the matched window.

/* Owner instruction 2026-08-30, recorded verbatim in HANDOFF.md: "never talk
 * as if we finance the loan always as BrickWood Finances the loan." Chapter 3
 * is never the actor doing the lending. "our lending partner" and "our
 * financing partner" are the approved constructions and must pass; everything
 * where WE lend is an error. This shipped: two pages said "Our mortgages
 * usually require only hazard insurance". */
const LEND_VOICE = [
  /\b(?:we|chapter\s*3)\s+(?:finance|lend|originate|underwrite)\w*\b/i,
  // "we price it deal by deal" shipped on the DSCR page: Chapter 3 pricing a
  // loan. Scoped to loan words so CMA and listing pricing stay legal.
  /\bwe\s+price\s+(?:it|the|your|each|every)\s*(?:loan|deal|rate)/i,
  /\bour\s+(?:mortgage|loan|rate|financing|lending)s?\b(?!\s+(?:partner|referral))/i,
  /\bwe\s+can\s+get\s+you\s+(?:a\s+)?(?:pre.?approved|approved|loan|mortgage|rate|financ)/i,
  /(?<!\bnot\s)\b(?:financing|loans?|mortgages?)\s+through\s+us\b/i,
];
// Non-negotiable 3 also bans stated rates and payment amounts in credit
// context. The site currently has zero of either (checked 2026-08-30: all 46
// numeric "rate" hits are tax, occupancy or graduation rates; all 72 "$N a
// month" hits are HOA dues, rents and running costs). These pin that.
// APR is matched case-sensitively: the submarket occupancy charts write
// "44% Apr" for April, and a case-insensitive match flagged all eight of them.
const RATE_NUM_I = /\b\d+(?:\.\d+)?\s*(?:%|percent)\s*interest\b|\b(?:interest\s+rates?|mortgage\s+rates?|loan\s+rates?)\s+(?:of|at|from|as\s+low\s+as|around|near|about)\s+\d/i;
const RATE_NUM_APR = /\b\d+(?:\.\d+)?\s*(?:%|percent)\s*APR\b|\bAPR\s+(?:of|at|from|as low as|around|near|about)\s+\d/;
const PAY_NUM = /\b(?:mortgage|loan)\s+payments?[^.!?]{0,60}\$[\d,]+|\$[\d,]+[^.!?]{0,60}\b(?:mortgage|loan)\s+payments?\b/i;

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
  // header only: llms-full.txt is 650KB of page copy and "Last updated" appears
  // inside it, so matching the whole file would read a page's date as the index's
  const llmsFull = fs.existsSync(path.join(ROOT, "llms-full.txt"))
    ? fs.readFileSync(path.join(ROOT, "llms-full.txt"), "utf-8").slice(0, 2000) : "";
  const declaredKw = new Map();  // keyword -> [pages]  (cannibalisation guard)
  // Function names PER BUNDLE, so a page is checked only against the bundles it
  // actually loads. Pooling every bundle together hid a real break: /sell/ called
  // showPersona() from a bundle that had been removed from that page, and the
  // gate stayed green because some other page still shipped it.
  const fnsByAsset = new Map();
  for (const a of assetFiles().filter(n => n.endsWith(".js"))) {
    const src = fs.readFileSync(path.join(ASSETS, a), "utf-8");
    const set = new Set();
    for (const m of src.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)) set.add(m[1]);
    for (const m of src.matchAll(/(?:window\.|var |let |const )([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()/g)) set.add(m[1]);
    fnsByAsset.set(a, set);
  }
  const JS_KEYWORDS = new Set(["if","for","while","return","switch","typeof","void","new","delete","do","else","try","catch"]);
  const inbound = new Map();     // page -> Set(pages linking to it from BODY copy)
  const shingles = new Map();    // page -> Set(8-word shingles) for near-duplicate detection
  const pageSrcCache = new Map(); // for CTA cross-page anchor checks
  const pageHasId = (pg, id) => {
    if (!pageSrcCache.has(pg)) {
      const tf = path.join(ROOT, pg.replace(/^\//, ""), "index.html");
      pageSrcCache.set(pg, fs.existsSync(tf) ? fs.readFileSync(tf, "utf-8") : "");
    }
    return pageSrcCache.get(pg).includes(`id="${id}"`);
  };
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
    /* HTML entities inside JSON-LD.
     *
     * The HTML parser does not decode entities inside <script>, so
     * "calculator&#39;s" in a schema string reaches Google as those six literal
     * characters while the page itself renders an apostrophe. On an FAQPage that
     * silently breaks the schema-to-visible-text match Google requires.
     *
     * This rule exists because the FAQ-visibility check below could never catch
     * it: that one runs textKey() over BOTH sides, which normalises entities
     * away, so the mismatch cancelled out and two pages passed `audit` while
     * .claude/verify.js failed them in the browser. Compare the raw bytes.
     * One error per page; fixing the first usually fixes the rest. */
    {
      const LD_ENT = /&(?:#39|#x27|#8217|rsquo|lsquo|quot|#34|ldquo|rdquo|amp|nbsp|middot|hellip|mdash|ndash|rarr|deg);/i;
      for (const b of blocks) {
        const m = b.match(LD_ENT);
        if (m) { E(`HTML entity "${m[0]}" inside JSON-LD - entities are not decoded in <script>, so this reaches Google literally. Write the character itself.`); break; }
      }
    }

    // Google requires every FAQ answer/question in schema to be visible on the page.
    const visible = textKey(s.replace(/<script[\s\S]*?<\/script>/g, " "));
    for (const blk of parsed) {
      if (blk && blk["@type"] === "FAQPage") {
        /* A repeated Q or A inside one FAQPage.
         *
         * This shipped: /buyers/relocating/from-massachusetts/ carried the same
         * estate-tax question and answer SIX times, in the schema and printed
         * six times down the visible page. Nothing caught it, because the
         * visibility rule above only asks whether each schema question appears
         * on the page - six copies of a visible question pass it six times, and
         * assemble-page's FAQ-to-FAQPage sync passes too, since both sides were
         * equally wrong. A duplicated block is the one shape both existing
         * checks are structurally blind to. Compare the entries to each other.
         * Answers are compared too: a copy-paste that edits the question and
         * leaves the answer is the same defect wearing a hat. */
        const seenQ = new Map(), seenA = new Map();
        for (const q of blk.mainEntity || []) {
          const qk = textKey(String((q && q.name) || ""));
          const ak = textKey(String((q && q.acceptedAnswer && q.acceptedAnswer.text) || ""));
          if (qk) { seenQ.set(qk, (seenQ.get(qk) || 0) + 1); }
          if (ak) { seenA.set(ak, (seenA.get(ak) || 0) + 1); }
        }
        for (const [k, n] of seenQ) if (n > 1) E(`FAQ question repeated ${n} times on this page: "${k.slice(0, 55)}"`);
        for (const [k, n] of seenA) if (n > 1) E(`FAQ answer repeated ${n} times on this page: "${k.slice(0, 55)}"`);
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
    // A real byline is "By <strong>Name</strong>, Role". Matching a bare
    // "By " also hits body copy like "By using this site you agree…".
    const byline = s.match(/<p style="([^"]*)"[^>]*>\s*By\s*<strong/);
    if (byline) {
      const col = byline[1];
      const ivoryText = /color:\s*(?:var\(--ivory\)|rgba\(244,\s*239,\s*232)/.test(col);
      const darkText = /color:\s*(?:var\(--muted\)|var\(--navy\)|rgba\(28,\s*32,\s*40)/.test(col);
      // Both directions. Only checking one is how 8 navy-hero bylines got
      // "fixed" into navy-on-navy at 1.00:1 while the gate stayed green.
      // `.detail-hero{background:var(--ivory)}` is a single unambiguous CSS rule,
      // so ivory text there is provably invisible. Blocker.
      if (lightHero && ivoryText)
        E("byline is ivory on the light .detail-hero (invisible) — use color:var(--muted)");
      // The reverse is NOT provable statically. "No .detail-hero" does not mean
      // the hero is navy: /submarkets/, /market-reports/ and the first-time-buyer
      // page all have light heroes from other classes, and this rule wrongly
      // called them navy. Only the browser knows. Warn and defer.
      if (!lightHero && darkText)
        W("dark byline on a hero this script cannot classify — measure it with .claude/verify.js before trusting either colour");
    }
    if (lightHero && /class="btn btn-outline btn-lg"[^>]*style="color:\s*var\(--ivory\)/.test(s))
      E("hero outline button is ivory on the light .detail-hero (invisible) — drop the inline colour override");

    /* ---- the inline MAP block is LOAD-BEARING, not dead code ----
     * It looks like a leftover from when this was a single-page app, and it was
     * one delete away from being removed as junk. It is the only thing that
     * makes the main content visible on most pages.
     *
     * The chain: /assets/app.css sets .page-section{display:none} and only
     * .page-section.active{display:block} shows it. An early inline script
     * strips .active from every section on DOMContentLoaded and re-adds it to
     * #page-home - but #page-home exists in exactly ONE file, the homepage. On
     * every other page that reset leaves nothing active, and the MAP block's
     * showPage(CUR), registered later and therefore run later, is what puts
     * .active back. Delete it and 64 pages render their chrome and nothing else.
     *
     * Measured, not assumed: /buyers/retirees/ at 375x812 paints 375x8977 with
     * 7287 characters of copy and passes a hit-test, and does so only because
     * this block runs. */
    const hasSection = /class="page-section[^"]*"/.test(s);
    const ownsPageHome = /id="page-home"/.test(s);
    const runsReset = /page-home/.test(s);
    const restores = /showPage\(CUR\)/.test(s);
    if (hasSection && runsReset && !ownsPageHome && !restores)
      E("main content would be invisible: this page hides .page-section, runs the " +
        "reset that looks for #page-home, has no #page-home of its own, and no " +
        "longer calls showPage(CUR) to restore it. Do not remove the inline MAP block.");

    /* ---- Chapter3 is a BROKERAGE. It is not a lender. ----
     * Owner instruction, stated plainly: "we cant finance anything its not our
     * expertise we are not a lender". Devin holds an MLO licence and BrickWood
     * is an affiliated lender, which makes the line easy to blur, and blurring
     * it is a licensing problem rather than a wording preference.
     *
     * Explaining how financing works is fine and useful. Saying or implying
     * that this brokerage does the financing is not. "Underwrite" is the word
     * that slipped through twice: an underwriter works for a lender. */
    {
      const mainTxt = ((s.match(/<main[\s\S]*?<\/main>/i) || [""])[0])
        .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      const OFFERS_CREDIT = /\b(?:we|our team|Chapter3)\s+(?:can\s+)?(?:finance|fund|lend|underwrite|approve|pre-?approve|originate)\w*\b|\bour\s+(?:loan|lending|mortgage|financing)\s+(?:program|product|rate|offer)\w*\b|\bwe\s+offer\s+(?:loans|financing|mortgages)\b/gi;
      for (const m of mainTxt.matchAll(OFFERS_CREDIT))
        E(`"${m[0].trim()}" reads as this brokerage providing credit. Chapter3 is not a lender. Describe what a lender does, do not claim to do it.`);
    }

    /* ---- never "under one roof" ----
     * Owner instruction, 2026-08-14, given as a legal problem and not a style
     * one: "dont ever say we bring it under one roof cause thats illegal so
     * hard code it to never say that again".
     *
     * Chapter3 Realty and BrickWood Mortgage are separate companies. The owner
     * confirmed on 2026-07-30 that Chapter3 does not own BrickWood, and every
     * page carries a disclosure saying the relationship is a referral one the
     * buyer is free to decline. "Under one roof" asserts the opposite: a single
     * business doing both the real estate and the lending. It had shipped in 17
     * places including the site-wide footer, so this is a gate, not a note.
     *
     * Deliberately scoped to a roof word in the SAME SENTENCE as a lender or
     * agent word. /invest/strategies/small-multifamily/ correctly says "one
     * purchase, one loan, one roof" and "One roof or HVAC bill hits every unit
     * at once" about a literal duplex roof, and must keep passing. That is why
     * a bare "loan" is not enough to fire this. */
    {
      const ROOF = /\b(?:under\s+(?:one|the\s+same)\s+roof|(?:one|the\s+same)\s+roof)\b/i;
      const AFFIL = /\b(?:lender|lending|loan officer|mortgage|financ\w*|brokerage|in-house|BrickWood|agents?)\b/i;

      // the claim hid in meta/og/twitter/schema descriptions as well as body copy
      const descs = [...s.matchAll(/<meta[^>]+(?:name|property)="(?:description|og:description|twitter:description)"[^>]+content="([^"]*)"/gi)]
        .map(m => m[1]);
      const jsonDescs = [...s.matchAll(/"(?:description|headline)"\s*:\s*"((?:[^"\\]|\\.)*)"/g)].map(m => m[1]);
      const bodyTxt = ((s.match(/<main[\s\S]*?<\/main>/i) || [s])[0])
        .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

      const sentences = [...descs, ...jsonDescs, ...bodyTxt.split(/(?<=[.!?])\s+/)];
      const seen = new Set();
      for (const sent of sentences) {
        if (!ROOF.test(sent) || !AFFIL.test(sent)) continue;
        const key = sent.trim().slice(0, 60);
        if (seen.has(key)) continue;
        seen.add(key);
        E(`"${sent.trim().slice(0, 100)}" puts real estate and financing under one roof. `
          + `Chapter3 does not own BrickWood; it is a referral relationship. Owner instruction: never say this.`);
      }

      /* Same false claim, different words. "in-house" asserts the lender is
       * part of this company. Owner, 2026-08-14: "we are our own company fully
       * separate". The approved word is "preferred". */
      for (const m of s.matchAll(/\b(?:in-house|our own)\s+lender\b/gi))
        E(`"${m[0]}" says the lender is part of this company. Chapter3 and BrickWood are separate. Use "preferred lender".`);

      /* Chapter3 does not underwrite. Owner, 2026-08-14: "we dont underwrite we
       * just have analyzers or estimators". A lender's underwriter, a title
       * underwriter and the SC Wind and Hail Underwriting Association are all
       * real and stay; this fires only when underwriting is offered as one of
       * OUR services. */
      for (const m of s.matchAll(/\b(?:free|our|instant|rental|DSCR|LTR|STR)\s+underwriting\b/gi))
        E(`"${m[0]}" offers underwriting as a Chapter3 service. We do not underwrite. Say analysis, estimate, or run the numbers.`);
    }

    /* ---- American spelling ----
     * This is a South Carolina brokerage writing for American buyers. Seven
     * British spellings had shipped in visible copy across four pages
     * ("paint colours", "works in your favour", "neighbourhood"), which reads
     * as carelessly generated even when the page underneath is good.
     *
     * "analyses" is deliberately NOT in this list: it is the correct American
     * plural of analysis and /contact/ uses it properly. */
    {
      const BRITISH = /\b(petrol|fibre|storey|storeys|kerb|whilst|amongst|ageing|neighbourhoods?|colours?|realise[ds]?|organis(?:e|ed|es|ing|ation)|behaviour|favour(?:s|ed|ite|ites)?|metres?|prioritise[ds]?|recognise[ds]?|apologise[ds]?|licence[ds]?)\b/gi;
      const visible = ((s.match(/<main[\s\S]*?<\/main>/i) || [""])[0])
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ");
      for (const m of new Set([...visible.matchAll(BRITISH)].map(x => x[0])))
        E(`"${m}" is British spelling. This site writes American English for American buyers.`);
    }

    /* ---- written for a buyer, not for the industry ----
     * All five of these shipped on the /hoa/ batch and the owner, who works in
     * this industry, said he could not follow half of it. A page can pass every
     * readability score and still be unreadable, because the defect is subject
     * matter rather than sentence length. These are the specific failures. */
    {
      const mainOnly = (s.match(/<main[\s\S]*?<\/main>/i) || [""])[0];
      const noScripts = mainOnly.replace(/<(script|style)[\s\S]*?<\/\1>/g, " ");
      const srcBlock = (noScripts.match(/<p style="font-size:\.78rem[\s\S]*?<\/p>/) || [""])[0];
      const prose = noScripts.replace(/<p style="font-size:\.78rem[\s\S]*?<\/p>/, " ");
      const txt = prose.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
      const words = (x) => x.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

      // 1. The hero sub-header rules (length, keyword, anchor, voice) live in the
      //    SUBHEAD block further down; the cap is 30 words there.

      // 2. The sources line is a citation list, not a second article. One page
      //    shipped 1,022 words of recited statute under the copy.
      if (srcBlock && words(srcBlock) > 90)
        E(`sources block is ${words(srcBlock)} words (max 90) - link the source, do not recite it`);

      // 3. A buyer does not know or care who Fannie Mae is. Say "your lender".
      //    A warning, not a blocker: /invest/ pages written for investors can
      //    reasonably name the loan buyers, because warrantability IS their
      //    concept. On a buyer page there is no excuse.
      const INDUSTRY = /Fannie Mae|Freddie Mac|Selling Guide|Lender Letter|Bulletin \d|NAIC|National Association of Insurance|Insurance Information Institute|council of co-owners|horizontal property regime|declarant|Nonprofit Corporation Act|adjudicatory/gi;
      const ind = [...new Set((txt.match(INDUSTRY) || []).map(x => x.toLowerCase()))];
      if (ind.length >= 3)
        W(`names ${ind.length} industry bodies or legal terms in body copy (${ind.slice(0, 4).join(", ")}) - write it the way a buyer would say it`);

      // 4. Effective dates and enactment years are for practitioners.
      const dates = txt.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*20\d\d|\bon or after\b/g) || [];
      if (dates.length > 2)
        W(`${dates.length} explicit dates in body copy - a buyer needs the rule, not when it took effect`);

      // 5. A long read with the only ask in the hero buries it.
      //
      //    The first version of this rule counted ONLY href="#lead-form" and
      //    reported 42 pages with zero in-article CTAs. That was the scanner
      //    being wrong, not the site. Only the generated /hoa/ pages carry a
      //    #lead-form anchor; the whole back catalogue links to /contact/
      //    instead. /submarkets/conway/ has a boxed "Talk to a Conway agent"
      //    at 45% through the article and was still flagged. See rule 4.
      //
      //    A real in-article CTA is a BOXED link (a bare text link reads as
      //    prose and gets skipped, which the owner flagged twice) pointing at
      //    the form, the contact page, or the phone, and sitting in the middle
      //    of the read rather than at the very top or bottom.
      if (words(prose) > 900) {
        const L = prose.length;
        let mid = 0, total = 0;
        for (const m of prose.matchAll(/<a\b[^>]*href="(#lead-form|\/contact\/|tel:[^"]*)"[^>]*>/g)) {
          if (!/class="[^"]*\bbtn\b/.test(m[0])) continue;   // boxed only
          total++;
          const at = m.index / L;
          if (at > 0.2 && at < 0.9) mid++;
        }
        if (mid < 1)
          W(`${words(prose)} words with no boxed CTA in the middle of the read (${total} elsewhere) - add one mid-page`);
      }
    }

    /* ---- the three dates must agree ----
     * visible "Updated <date>" == schema dateModified == sitemap lastmod.
     * They drifted apart on 34 pages before anyone noticed. */
    const MONTHS = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];
    const wantDate = (sm.match(new RegExp("<loc>" + url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "</loc>\\s*<lastmod>([^<]+)</lastmod>")) || [])[1];
    if (wantDate) {
      // \s* after the colon: this regex used to demand `"dateModified":"` with no
      // space, so every pretty-printed JSON-LD block silently skipped the check.
      // /invest/strategies/brrrr/ sat at 2026-07-10 against a 07-19 sitemap and
      // the gate reported clean. A scanner that cannot match is not a passing test.
      const dms = [...s.matchAll(/"dateModified"\s*:\s*"([^"]+)"/g)].map(m => m[1]);
      if (!dms.length) W("no schema dateModified — cannot verify the page date");
      // a page can carry more than one JSON-LD block; they must not disagree
      if (new Set(dms).size > 1) E(`schema has conflicting dateModified values: ${[...new Set(dms)].join(", ")}`);
      for (const dm of new Set(dms))
        if (dm !== wantDate) E(`schema dateModified ${dm} != sitemap lastmod ${wantDate}`);
      const vm = s.replace(/<script[\s\S]*?<\/script>/g, " ").match(/(?:Updated|Reviewed) ([A-Z][a-z]+) (\d{1,2}), (20\d\d)/);
      if (vm) {
        const iso = `${vm[3]}-${String(MONTHS.indexOf(vm[1]) + 1).padStart(2, "0")}-${String(+vm[2]).padStart(2, "0")}`;
        if (iso !== wantDate) E(`visible "${vm[0]}" != sitemap lastmod ${wantDate}`);
      }
    }

    /* ---- inline handlers must call a function that exists ----
     * `node --check` validates syntax only; it happily passes a page whose
     * onclick calls a function an edit deleted. That shipped once. */
    const inlineFns = new Set([...s.matchAll(/function\s+([A-Za-z_$][\w$]*)/g)].map(m => m[1]));
    // only the bundles THIS page loads
    const pageFns = new Set(inlineFns);
    for (const m of s.matchAll(/\/assets\/([A-Za-z0-9._-]+\.js)/g))
      for (const fn of (fnsByAsset.get(m[1]) || [])) pageFns.add(fn);
    for (const m of s.matchAll(/on(?:click|change|input|submit)="([A-Za-z_$][\w$]*)\s*\(/g)) {
      const fn = m[1];
      if (JS_KEYWORDS.has(fn)) continue;
      if (!pageFns.has(fn))
        E(`inline handler calls ${fn}() which is not defined on this page or in any bundle this page loads`);
    }

    /* ---- legal ---- */
    // Strip code and form controls: a number inside a calculator input is not ad copy.
    let prose = s.replace(/<script[\s\S]*?<\/script>/g, " ")
                 .replace(/<label[\s\S]*?<\/label>|<input[^>]*>|<select[\s\S]*?<\/select>/g, " ");
    // Official commentary to 1026.24(d)(1): "This provision applies only if a
    // downpayment is actually required; statements such as no downpayment or
    // no trade-in required do not trigger the additional disclosures."
    // So "0% down" is NOT a triggering term. Counting it was a false positive
    // that wrongly put /buyers/va-loans/ on the high-risk list.
    const trig = [...prose.matchAll(TRIGGER_DOWN)]
      .map(m => m[0].trim())
      .filter(t => parseFloat(t) !== 0);
    if (trig.length) {
      /* Owner decision 2026-08-30 (HANDOFF.md): every stated down-payment
       * percentage is an ERROR, not a review item - the old HIGH/review
       * tiering is gone with the standing exception it served. 1026.24(d)(1)
       * makes "the amount or percentage of any downpayment" a triggering term
       * pulling in 24(d)(2); writing it qualitatively means no trigger term
       * exists and nothing can attach. The one carve-out stands: official
       * commentary says "no downpayment" statements do not trigger, so
       * "0% down" passes (the filter above already dropped it). */
      E(`Reg Z: down-payment percentage in copy (${[...new Set(trig)].slice(0, 3).join(", ")}) - write it qualitatively; only "0% down" / "no down payment" escapes 1026.24(d)(1)`);
    }
    // Distance form of the same trigger (found live on the DSCR page after the
    // adjacency gate passed it): a nonzero percentage in the same sentence as
    // "down payment", either order.
    // Tags stay in `prose`, and a </strong> between the label and the number
    // killed the window on the real DSCR case. Match on a tag-stripped copy.
    const proseTxt = prose.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
    for (const re of TRIGGER_DOWN_NEAR) {
      const m = proseTxt.match(re);
      if (m && !TRIGGER_DOWN_NEAR_OK.test(m[0])) {
        E(`Reg Z: down-payment percentage stated near "down payment" ("${m[0].slice(0, 60)}") - write it qualitatively`);
        break;
      }
    }
    {
      /* The financing voice rule, the rate rule and the payment rule.
       *
       * The scan surface is not just <main>: /about/ shipped "an in-house
       * mortgage lender" in its META DESCRIPTION - the SERP snippet - while
       * its body was clean, so a main-only scan misses the most visible copy
       * on the page. Claims surface = body prose + title + every meta/og/
       * twitter description + every string value inside JSON-LD. Entities are
       * decoded first so "&#39;" cannot split a match. */
      const mainProse = decodeEnt(((s.match(/<main[\s\S]*?<\/main>/) || [s])[0])
        .replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ")
        .replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
      const metaBits = [...s.matchAll(/<meta[^>]+(?:name|property)="(?:description|og:description|twitter:description|og:title)"[^>]+content="([^"]*)"/g)].map(m => m[1]);
      const titleBit = (s.match(/<title>([\s\S]*?)<\/title>/) || [, ""])[1];
      const ldBits = [...s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
        .map(m => { try { return JSON.stringify(JSON.parse(m[1])); } catch { return ""; } });
      const claims = decodeEnt([mainProse, titleBit, ...metaBits, ...ldBits].join(" \n "));
      for (const re of LEND_VOICE) {
        const m = claims.match(re);
        if (m) { E(`first-person lending voice: "${m[0]}" - BrickWood lends, or "your lender" does; Chapter 3 never does (owner rule 2026-08-30)`); break; }
      }
      // "in-house" within a lending sentence, either word order: the
      // internality claim is the "under one roof" defect (mistake 42) in new
      // clothes, and it shipped in eight places including two SERP snippets.
      {
        const IH = /in.house/gi; let ih;
        while ((ih = IH.exec(claims))) {
          const win = claims.slice(Math.max(0, ih.index - 70), ih.index + 80);
          if (/financ|lend|loan|mortgage/i.test(win)) {
            E(`"in-house" beside a lending word: "...${win.trim().slice(0, 90)}..." - BrickWood is a separate company; say "our lending partner" (owner rules 2026-07-30 and 2026-08-30)`);
            break;
          }
        }
      }
      // The plain-English hardcode (owner, 2026-08-30 round two). Runs over
      // the same claims surface as the voice rule: body, title, metas, schema.
      {
        const lowClaims = claims.toLowerCase();
        for (const p of AI_TELL_PHRASES) {
          if (lowClaims.includes(p)) { E(`banned mannerism: "${p}" - say it the direct literal way (PLAYBOOK A11, owner rule 2026-08-30)`); break; }
        }
        for (const [re, msg] of AI_TELL_REGEX) {
          const m = claims.match(re);
          if (m) { E(`banned construction: "${m[0].slice(0, 50)}" - ${msg}`); break; }
        }
      }
      /* ---- SUBHEAD: the hero sub-header (owner rule 2026-09-01, PLAYBOOK A14) ----
       * noindex pages (privacy, terms, accessibility, the map) are legal or
       * utility text and carry neither a hero sub nor page keywords. */
      if (!noindex) {
        const mainHtml = ((s.match(/<main[\s\S]*?<\/main>/) || [s])[0]).replace(/<(script|style)[\s\S]*?<\/\1>/g, " ");
        const h1Txt = decodeEnt(((mainHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [, ""])[1]).replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
        let kw = "";
        for (const b of ldBits) {
          const m = b.match(/"keywords":"([^"]*)"/);
          if (m) { kw = m[1]; break; }
        }
        const phrases = kw.split(",").map(x => x.trim().toLowerCase()).filter(Boolean);
        let want = phrases.length ? subTokens(phrases[0]).filter(w => !SUB_WEAK.has(w)) : [];
        if (!want.length) want = subTokens(phrases.join(" ")).filter(w => !SUB_WEAK.has(w));
        // pages without Article keywords (home, hubs, /about/): the title's
        // first segment names the topic better than a brand-line H1 does
        if (!want.length) want = subTokens(decodeEnt(titleBit).split("|")[0]).filter(w => !SUB_WEAK.has(w));
        if (!want.length) want = subTokens(h1Txt).filter(w => !SUB_WEAK.has(w));
        const hs = heroSub(mainHtml);
        if (!hs) E("no hero sub-header under the H1 - every page carries one (owner rule 2026-09-01)");
        else {
          const sub = hs.text, low = sub.toLowerCase();
          const n = sub.split(/\s+/).filter(Boolean).length;
          if (n < 8) E(`hero sub-header is ${n} words (min 8) - say the specific benefit, with a number or a place`);
          if (n > 30) E(`hero sub-header is ${n} words (max 30) - one specific claim, two lines at most`);
          if (want.length && !want.some(t => subHasToken(t, sub)))
            E(`hero sub-header carries none of the page's keywords (${want.slice(0, 4).join(", ")}) - the topic word belongs in the sub`);
          if (!(/\d|\$|%/.test(sub) || SUB_PLACE.test(sub) || SUB_NUMWORD.test(sub)))
            E("hero sub-header has no concrete anchor - give a number, a dollar figure, a percentage, or a place name");
          if (/\?/.test(sub)) E("hero sub-header is a question - answer it instead");
          if (/!/.test(sub)) E("hero sub-header has an exclamation mark - the fact is the hook");
          if (/\b(?:we|our|us|ours|ourselves)\b/i.test(sub)) E('hero sub-header says "we/our/us" - write it to the reader: what they get, with "you"');
          if (/, not (?!a promise)/i.test(sub)) E('hero sub-header uses ", not X" contrast - give the specific thing instead of what it is not');
          {
            const ws = low.replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
            const seen = new Map();
            for (let i = 0; i + 2 < ws.length; i++) { const k = ws.slice(i, i + 3).join(" "); seen.set(k, (seen.get(k) || 0) + 1); }
            const rep = [...seen].find(([, c]) => c >= 2);
            if (rep) E(`hero sub-header repeats the phrase "${rep[0]}" - a template, not a sentence; say one specific thing`);
          }
          if (h1Txt && low.includes(h1Txt.toLowerCase().replace(/[.]$/, "")))
            E("hero sub-header restates the H1 - it must add the benefit or the proof, not repeat the title");
        }
        /* H2s are the section subheaders. Light rules only: a length band and
         * no generic label, plus at least one keyword-bearing H2 outside the
         * FAQ so the section headings carry the topic too. */
        const h2s = [...mainHtml.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)]
          .map(m => decodeEnt(m[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim()).filter(Boolean);
        for (const h of h2s) {
          const n = h.split(/\s+/).length;
          if (n > 16) E(`H2 is ${n} words (max 16): "${h.slice(0, 60)}" - a heading, not a sentence`);
          if (/^(?:overview|introduction|details|summary|conclusion|more|other|notes|background|resources|next steps|key takeaways|final thoughts|tips|highlights|basics|the basics)$/i.test(h))
            E(`generic H2 "${h}" - say what the section is about`);
        }
        const bodyH2 = h2s.filter(h => !/^frequently asked questions$/i.test(h));
        if (want.length && bodyH2.length && !bodyH2.some(h => want.some(t => subHasToken(t, h)) || SUB_PLACE.test(h)))
          E(`no H2 carries a page keyword (${want.slice(0, 3).join(", ")}) or a place name - put the topic in at least one section heading`);
      }

      /* ---- PUNCH: sentence-level rules (owner rule 2026-09-01, PLAYBOOK A15) ---- */
      if (!noindex) {
        const mainHtml = ((s.match(/<main[\s\S]*?<\/main>/) || [s])[0]).replace(/<(script|style|noscript)[\s\S]*?<\/\1>/g, " ");
        const blocks = [];
        for (const m of mainHtml.matchAll(/<(p|li)\b([^>]*)>([\s\S]*?)<\/\1>/g)) {
          const attrs = m[2], inner = m[3];
          if (/txc-src|footer-afba/.test(attrs)) continue;
          if (m[1] === "li" && /^\s*<a\b[^>]*>[\s\S]*<\/a>\s*$/.test(inner)) continue;   // a citation item
          const t = decodeEnt(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
          if (!t) continue;
          if (t.startsWith(TCPA.slice(0, 30)) || t.includes("Affiliated Business Arrangement") || t.includes("Because of this relationship")
              || t.startsWith("An estimate, not a fact") || /^Sources?[:.]/.test(t) || t.includes("This is general information")) continue;
          blocks.push(t);
        }
        const protect = (x) => x.replace(/\b(U\.S|St|Mt|Dr|Jr|Sr|vs|No|Inc|Corp|Ltd|approx|Ave|Blvd|Hwy|Rd|Mr|Mrs|Ms|Sq)\./g, "$1<DOT>").replace(/(\d)\.(\d)/g, "$1<DOT>$2");
        let total = 0, nSent = 0, over = 0, modals = 0;
        const longest = [], hits = new Map();
        for (const b of blocks) {
          for (const [re, msg] of PUNCH_WORDS) {
            const m = b.match(re);
            if (m && !hits.has(msg)) hits.set(msg, m[0]);
          }
          const op = b.match(PUNCH_OPENER);
          if (op && !hits.has("opener")) hits.set("opener", op[0].trim());
          modals += (b.match(/\b(?:may|might)\b/gi) || []).length;
          const aside = [...b.matchAll(/\(([^()]{0,240})\)/g)].find(a => a[1].split(/\s+/).filter(Boolean).length >= PUNCH_ASIDE_WORDS);
          if (aside && !hits.has("aside")) hits.set("aside", aside[0]);
          const sents = protect(b).split(/(?<=[.!?])\s+(?=["'(]?[A-Z0-9$])/).map(x => x.replace(/<DOT>/g, ".").trim()).filter(Boolean);
          for (const se of sents) {
            const w = se.split(/\s+/).length;
            total += w; nSent++;
            if (w > PUNCH_WARN_SENTENCE) over++;
            if (w > PUNCH_MAX_SENTENCE) longest.push([w, se]);
          }
        }
        /* Headings, the title, the meta descriptions and the schema strings are
         * the most-quoted text on the page, so the word list applies there too
         * (the sentence-shape rules do not: a heading is not a sentence). */
        {
          const heads = [...mainHtml.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)].map(m => decodeEnt(m[1].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim());
          const surface = [...heads, decodeEnt(titleBit), ...metaBits.map(decodeEnt), ...ldBits];
          for (const t of surface) {
            for (const [re, msg] of PUNCH_WORDS) {
              const m = t.match(re);
              if (m && !hits.has(msg)) { hits.set(msg, m[0] + '" in heading/title/meta/schema: "' + t.slice(0, 50)); break; }
            }
          }
        }
        for (const [msg, found] of hits) {
          if (msg === "opener") E(`sentence opens with "${found}" - join it to the sentence before, or start with the subject`);
          else if (msg === "aside") E(`parenthetical aside "${found.slice(0, 60)}" - make it its own sentence or cut it`);
          else E(`punch: ${msg} (found "${found}")`);
        }
        longest.sort((a, b) => b[0] - a[0]);
        for (const [w, se] of longest.slice(0, 3)) E(`sentence is ${w} words (max ${PUNCH_MAX_SENTENCE}): "${se.slice(0, 70)}..." - split it`);
        if (longest.length > 3) E(`${longest.length - 3} more sentences over ${PUNCH_MAX_SENTENCE} words`);
        if (nSent >= 20 && total / nSent > PUNCH_MAX_MEAN) E(`mean sentence length ${(total / nSent).toFixed(1)} words (max ${PUNCH_MAX_MEAN}) - shorten across the page`);
        if (over > 3) W(`${over} sentences over ${PUNCH_WARN_SENTENCE} words - aim shorter`);
        if (modals > PUNCH_MAX_MODALS) W(`"may/might" ${modals} times - say what happens, or what the rule requires`);
      }
      /* ---- LOCAL EDGE + SALESY (owner rule 2026-09-02, PLAYBOOK A16) ---- */
      if (!noindex) {
        const mainTxt = decodeEnt(((s.match(/<main[\s\S]*?<\/main>/) || [s])[0])
          .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ").replace(/<\/(p|li|h[1-6]|td|div)>/g, ". ").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ");
        for (const [re, label] of SALESY) { const m = mainTxt.match(re); if (m) { E(`salesy: "${m[0].trim()}" (${label}) - informational tone; state the specific reason instead (owner rule 2026-09-02)`); break; } }
        if (LOCAL_EDGE_PAGES.test(rel)) {
          const sents = mainTxt.split(/(?<=[.!?])\s+/);
          const edge = sents.filter(x => LOCAL_BRAND.test(x) && LOCAL_PLACE.test(x)).length;
          if (edge < LOCAL_EDGE_MIN)
            E(`local edge: only ${edge} sentence(s) say why Chapter3, here (min ${LOCAL_EDGE_MIN}) - a national brand could have written this page; add the specific local reasons, casually`);
        }
      }
      const rm = mainProse.match(RATE_NUM_I) || mainProse.match(RATE_NUM_APR);
      if (rm) E(`stated interest rate in copy: "${rm[0]}" - never state a rate (non-negotiable 3); keep financing qualitative`);
      // $0 is a calculator's zero state, not an advertised payment.
      const pm = [...mainProse.matchAll(new RegExp(PAY_NUM.source, "gi"))]
        .find(m => /\$[\d,]*[1-9]/.test(m[0]));
      if (pm) E(`stated loan payment amount in copy: "${pm[0].slice(0, 60)}" - never state a payment amount (non-negotiable 3)`);
      if (mainProse.includes("\u2014")) E("em dash in body copy - the style rule is short sentences and commas, never em dashes");
    }
    if (s.includes("c3SendForm(") && !s.includes(TCPA)) E("lead form present but the exact TCPA consent string is missing or altered");
    if (/brickwoodmortgage\.com/.test(prose) && !s.includes(AFBA_SIG)) E("links to the affiliated lender without an AfBA disclosure");
    const low = decodeEnt(prose).toLowerCase();
    for (const p of BANNED_PHRASES) if (low.includes(p)) W(`off-brand phrase: "${p}"`);
    for (const p of FAIR_HOUSING) if (low.includes(p)) E(`fair-housing risk phrase: "${p}"`);
    for (const p of FIGURATIVE) if (low.includes(p)) E(`figurative language: "${p}" - say it literally`);
    // Owner, 2026-08-28: "Nothing's real. Never say that ever again." The
    // banned form is the predicate ("the fines are real", "the gap is real");
    // attributive stays legal ("his real numbers", "real eligibility rules").
    if (/\b(?:is|are|was|were) real(?=\s*[.,:;]|\s+(?:and|but|too|or|when|if)\b)/i.test(low)) E('says something "is real" or "are real" - state the fact instead');
    // Owner, 2026-08-28: headers are what AI assistants quote. No negative
    // framing inside any h2/h3; the honesty lives in body copy.
    {
      const HEADER_NEGATIVE = ["takes more", "warning that", "warning printed", "against the move",
        "goes the other way", "is thin", "never actually get", "gets worse",
        "the gap is real", "swings", "plan on a car", "no longer matters"];
      const mainHtml = (s.match(/<main[\s\S]*?<\/main>/) || [s])[0];
      for (const hm of mainHtml.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)) {
        const ht = hm[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
        for (const neg of HEADER_NEGATIVE) if (ht.includes(neg)) E(`negative header: "${neg}" inside a heading - move the honesty to body copy, keep headers neutral or positive`);
      }
    }
    for (const p of FILLER) if (low.includes(p)) E(`filler line: "${p}" - state the fact or delete the sentence`);
    /* Owner instruction, 2026-08-25: a CTA must deliver what its label
     * promises. "Check the drive from an address" pointed at a lead form,
     * which checks nothing - we do, after they write in. A form or contact
     * destination is a request, so its label must read as one ("Have us
     * check...", "Ask us...", "Send..."), never as an inspection the click
     * itself performs. Buttons that open a real tool (openIdx, a calculator
     * page) may promise the action. */
    const CTA_PROMISE = /^\s*(check|open|map|see|view|browse|explore|watch|look|run|compare|calculate|estimate)\b/i;
    for (const m of s.matchAll(/<a\b[^>]*>/g)) {
      const tag = m[0];
      if (!/\bbtn\b/.test((tag.match(/class="([^"]*)"/) || [])[1] || "")) continue;
      const href = (tag.match(/href="([^"]*)"/) || [])[1] || "";
      if (/^(tel:|sms:|mailto:)/.test(href)) continue;
      const base = href.replace(/[#?].*$/, "");
      const isTool = CTA_DESTINATIONS.has(base) && base !== "/contact/";
      let anchorOk = false;
      if (href.includes("#")) {
        const [pg, id] = href.split("#");
        anchorOk = /(form|calc)/.test(id) && (pg ? pageHasId(pg, id) : s.includes(`id="${id}"`));
      }
      if (!isTool && base !== "/contact/" && !anchorOk) {
        E(`CTA button to "${href}" - a button must convert: point it at a tool page, /contact/, tel:, or a form/calculator anchor that exists, or demote it to a text link`);
        continue;
      }
      const isFormDest = !isTool && !/calc/.test(href.split("#")[1] || "");
      if (isFormDest && !tag.includes("openIdx")) {
        const label = s.slice(m.index + tag.length, m.index + tag.length + 200)
          .split("</a>")[0].replace(/<[^>]*>/g, "").trim();
        if (CTA_PROMISE.test(label)) E(`CTA label "${label}" promises an action but points at a form (${href}) - reword as a request (Have us... / Ask us... / Send...) or point it at a tool`);
      }
    }
    for (const m of s.matchAll(/<button\b[^>]*ldSubmit\(\)[^>]*>([^<]*)<\/button>/g)) {
      const label = m[1].trim();
      if (CTA_PROMISE.test(label)) E(`form submit label "${label}" promises an action the form does not perform - reword as a request`);
    }
    for (const p of SELF_REFERENTIAL) if (low.includes(p)) E(`writes about our own page or other websites: "${p}" - the buyer only needs the fact`);
    /* Scoped to <main>. `prose` is NOT limited to the article: the nav says
     * "listings" and a shared script mentions "the subject property", so
     * scanning the whole page flagged every one of the 88 pages, including
     * /accessibility/. Same trap the readability rule fell into. */
    {
      const bodyOnly = (s.match(/<main[\s\S]*?<\/main>/i) || [""])[0]
        .replace(/<(script|style)[\s\S]*?<\/>/gi, " ");
      const bodyLow = decodeEnt(bodyOnly.replace(/<[^>]+>/g, " ")).toLowerCase().replace(/\s+/g, " ");
      for (const [re, label] of JARGON) if (re.test(bodyLow)) E(`industry term in body copy: "${label}" - say it the way a buyer would`);
      for (const m of bodyOnly.matchAll(/<h([23])[^>]*>([\s\S]*?)<\/h>/g)) {
        const head = decodeEnt(m[2].replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim().toLowerCase();
        for (const v of VAGUE_HEADING)
          if (head.includes(v)) E(`heading does not say what the section is about: "${head.slice(0, 60)}" - name the subject`);
      }
    }
    {
      /* Build the text for readability separately.
       *
       * Two mistakes this avoids, both made while writing this rule:
       *  1. Feeding it `prose` (tags + inline CSS) scored every page grade 47,
       *     because "font-size:.78rem" counts as words with no sentence end.
       *  2. Feeding it `txt` glued table cells and headings into one 226-word
       *     "sentence". A heading is not a run-on sentence. Close every block
       *     element with a full stop first, so each cell, heading and list item
       *     counts as its own unit. */
      // Self-contained on purpose. Two earlier versions of this rule broke on
      // ambient variables: `noScripts` was out of scope and crashed the whole
      // audit, and `prose` turned out not to be limited to <main>, which pulled
      // in the footer and legal boilerplate and inflated every score.
      const readMain = (s.match(/<main[\s\S]*?<\/main>/i) || [""])[0]
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ");
      const readTxt = decodeEnt(
        readMain.replace(/<\/(p|h[1-6]|li|td|th|div|section|caption)>/gi, ". ")
                .replace(/<[^>]+>/g, " ")
      ).replace(/\s*\.\s*(?=\.)/g, "").replace(/\s+/g, " ");
      const grade = readability(readTxt);
      /* Thresholds. The site's own pages run grade 4.7 to 9.5 today, so a hard
       * fail at 9 would block the deploy on eighty pages nobody asked to
       * rewrite. Fail at 12, which is the "unreadable" line (the calibration
       * sample of stacked subordinate clauses scores 43). Warn at 8, which is
       * where drift starts. The owner's instruction is plainer than the gate:
       * aim for 6. /buyers/relocating/cost-of-living/ sits at 4.7. */
      if (grade != null && grade > 12) E(`reading level grade ${grade.toFixed(1)} (max 12) - split the long sentences`);
      else if (grade != null && grade > 8) W(`reading level grade ${grade.toFixed(1)} - aim for 6`);
    }
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
      /* <style> contents are stripped alongside <script>.
       *
       * Without this the near-duplicate check below counted CSS as body words.
       * Every page inline-styles the same chrome, and the tax calculator adds a
       * large identical <style> block to ten pages, so property names, values
       * and class names formed thousands of shingles that are identical by
       * construction. That reported the from-state pages at 49-57% overlap when
       * their rendered prose overlaps 36% at worst - a number that would have
       * driven a real decision about how many state pages to build.
       * Inline style="" attributes were already dropped with their tag; only
       * the <style> element survived. */
      const mainHtml = (mainM ? mainM[0] : s)
        .replace(/<script[\s\S]*?<\/script>/g, " ")
        .replace(/<style[\s\S]*?<\/style>/g, " ");
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

    /* ---- CTA phone links must be buttons, not bare text ----
     * A tel: link styled as underlined body text reads as prose, not an action.
     * The owner flagged it twice. Anything in a CTA row must be a .btn. */
    for (const m of s.matchAll(/<a href="tel:\+18543332135"(?![^>]*class="btn)[^>]*>/g)) {
      const before = s.slice(Math.max(0, m.index - 260), m.index);
      if (/#lead-form|btn-brass/.test(before))
        W("CTA phone link is not styled as a button - use class=\"btn btn-outline\"");
    }

    /* ---- a square photo in a square box crops nothing ----
     * object-position on a same-aspect image/box pair is a no-op, which is how
     * a 'fix' to the team photos changed nothing at all. Flag it so the next
     * person changes the BOX aspect instead of the position. */
    for (const m of s.matchAll(/<img[^>]*width="(\d+)"[^>]*height="(\d+)"[^>]*object-position:[^;"]+/g)) {
      if (m[1] === m[2] && /\/team\//.test(m[0]))
        W("team photo box is square, so object-position does nothing - change the box aspect ratio to reframe");
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
  // A sitemap where every lastmod is identical reads as auto-stamped and Google
  // discounts it. The one legitimate case is a sitewide copy rewrite (2026-09-01:
  // every hero sub and 95 pages of body copy changed in one day), so before
  // failing, ask git whether every page's prose really did change on that date.
  if (smDates.length > 5 && new Set(smDates).size === 1) {
    const day = smDates[0];
    const hist = loadHistory();
    const files = [...sm.matchAll(/<loc>https:\/\/chapter3realty\.com(\/[^<]*)<\/loc>/g)].map(m => m[1] === "/"
      ? path.join(ROOT, "index.html")
      : path.join(ROOT, m[1].replace(/^\//, "").replace(/\/$/, "").split("/").join(path.sep), "index.html"))
      .filter(f => fs.existsSync(f));
    const specs = [];
    for (const f of files) { const gp = f.split(path.sep).join("/"); for (const h of hist.get(gp) || []) specs.push(`${h.sha}:${gp}`); }
    const blobs = catFile(specs);
    const changedThatDay = files.filter(f => trueDate(f, blobs).date === day).length;
    if (changedThatDay === files.length)
      warns.push(`sitemap.xml: all ${smDates.length} lastmod dates are ${day}; git confirms every page's prose changed that day (sitewide rewrite), so this is allowed once`);
    else
      errors.push(`sitemap.xml: all ${smDates.length} lastmod dates are identical (${day}) but git dates only ${changedThatDay} pages to that day - only date pages whose visible text changed`);
  }
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

  /* ---- llms.txt and llms-full.txt must match the site, in BOTH directions ----
   * Was one-directional and only covered llms.txt, so it missed llms-full.txt
   * claiming 2026-07-28 while every page said 07-27. Cause: toISOString() is
   * UTC, which rolls over at 8pm Eastern. A file that claims to be newer than
   * all of its own content tells a crawler the index is ahead of the pages. */
  const newestPage = [...smDates].sort().pop();
  for (const [label, body] of [["llms.txt", llms], ["llms-full.txt", llmsFull]]) {
    if (!body) continue;
    const d = (body.match(/Last updated:\s*(\d{4}-\d{2}-\d{2})/) || [])[1];
    if (!d || !newestPage) continue;
    if (d < newestPage)
      warns.push(`${label} says "Last updated: ${d}" but the newest page changed ${newestPage} — run 'node build.js llmsfull'`);
    if (d > newestPage)
      errors.push(`${label} claims ${d}, which is newer than every page on the site (newest is ${newestPage}) — a clock/timezone stamp, not a real content date`);
  }

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
const flag = process.argv.includes("--check");
/* The tax comparison calculator carries real dollar figures on ten pages. Its
 * arithmetic lives in data/relocating/tax-engine.js and its inputs live in
 * data/relocating/state-tax.json; if those two ever disagree the pages lie
 * quietly. data/relocating/test-tax.js checks both the drift and a set of
 * hand-computed cases, and preflight refuses to pass while it fails. */
function taxEngine() {
  const { execFileSync } = require("child_process");
  const test = path.join(__dirname, "data", "relocating", "test-tax.js");
  if (!fs.existsSync(test)) return;
  try {
    execFileSync(process.execPath, [test], { stdio: "pipe" });
    console.log("OK - tax engine matches state-tax.json and every hand-computed case.");
  } catch (e) {
    const out = (e.stdout ? e.stdout.toString() : "") + (e.stderr ? e.stderr.toString() : "");
    console.log("FAIL - tax engine:");
    console.log(out.split("\n").filter(l => /FAIL|Error/.test(l)).join("\n") || out);
    process.exitCode = 1;
  }
}


if (cmd === "check") check();
else if (cmd === "rehash") rehash();
else if (cmd === "stitch") stitch();
else if (cmd === "llmsfull") llmsfull();
else if (cmd === "dates") dates(flag);
else if (cmd === "audit") audit();
// regenerate data/relocating/col-places.json and /assets/col.js from the raw
// BEA and Zillow files (re-downloads Zillow if the CSVs are absent). Follow
// with 'rehash' so the asset gets its new cache-busting name.
else if (cmd === "coldata") { require("child_process").execFileSync(process.execPath, [path.join(__dirname, "data", "relocating", "build-col-data.js")], { stdio: "inherit" }); }
else if (cmd === "citydata") { require("child_process").execFileSync(process.execPath, [path.join(__dirname, "data", "relocating", "build-cities.js")], { stdio: "inherit" }); }
// dates --check runs last: it is the only gate that compares what the pages
// CLAIM against what git says actually happened.
else if (cmd === "preflight") { check(); console.log(""); audit(); console.log(""); dates(true); console.log(""); taxEngine(); }
else { console.log("Usage: node build.js [check|rehash|stitch|llmsfull|dates|audit|coldata|citydata|preflight]"); process.exit(1); }
