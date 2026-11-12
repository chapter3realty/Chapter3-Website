#!/usr/bin/env node
/*
 * pull_tools.mjs - the counts the /why-chapter-3/ page prints about the site's own tools.
 *
 *   node data/2026-11-b/why-chapter-3/scripts/pull_tools.mjs   (run from the website repo root)
 *
 * Writes data/2026-11-b/why-chapter-3/tools.json:
 *   - live: the live home search (https://chapter3realty.com/homes/api/map, no filter) total, and the
 *     live filter list (/homes/api/filters): how many MLS features a search (and the AI) can ask for.
 *   - site: from this working copy, how many pages in sitemap.xml carry a homes feed under their opening
 *     (idx-lib/feeds.js FEEDS), how many named places have a homes strip (idx-lib/places.js PLACES),
 *     and how many strip slots the built pages carry (data-place in each chapter3realty index.html).
 *   - demos: three sentences typed into the live search box, the filters it read from them (its chips) and
 *     how many homes matched. Long sentences also go to Chapter3 AI in the browser; this is the server's first read.
 * Counts only. No listing, address, MLS number or map point is saved.
 */
import fs from "node:fs"; import path from "node:path"; import { execFileSync } from "node:child_process";
const ROOT = process.cwd();
const OUT = path.join(ROOT, "data", "2026-11-b", "why-chapter-3", "tools.json");
const { FEEDS } = await import(path.join(ROOT, "idx-lib", "feeds.js"));
const { PLACES } = await import(path.join(ROOT, "idx-lib", "places.js"));

/* curl, so the request goes through the session's HTTPS proxy (node's fetch does not). */
const get = async (u) => JSON.parse(execFileSync("curl", ["-sS", "-f", "-A", "Mozilla/5.0 (count script)", u], { encoding: "utf8", maxBuffer: 64 << 20 }));
const map = await get("https://chapter3realty.com/homes/api/map?");
const filters = await get("https://chapter3realty.com/homes/api/filters");
const DEMOS = ["condo I can airbnb near the beach under 300k", "3 bedroom house with a pool under 600k in Murrells Inlet", "one level home for retiring with no HOA near a golf course"];
const demos = [];
for (const q of DEMOS) { const j = await get("https://chapter3realty.com/homes/api/map?q=" + encodeURIComponent(q));
  demos.push({ q, total: j.total, chips: (j.chips || []).map((c) => c.t), params: j.params, left: j.left || "" }); }
const groups = (filters.groups || []).map((g) => ({ label: g.label || g.l || g.name || "", items: (g.items || []).length }));

const locs = [...fs.readFileSync(path.join(ROOT, "chapter3realty", "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/chapter3realty\.com([^<]*)<\/loc>/g)].map((m) => m[1]);
const feeds = Object.keys(FEEDS);
let slots = 0, stripPages = 0;
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (e.name === "index.html") { const n = (fs.readFileSync(p, "utf8").match(/class="hx-strip" data-place="/g) || []).length; if (n) { slots += n; stripPages++; } } } };
walk(path.join(ROOT, "chapter3realty"));

const out = {
  pulled: new Date().toISOString(),
  live: { homes_for_sale_total: map.total, map_keys: Object.keys(map).filter((k) => k !== "pins"), filters_counted_at: filters.countedAt || null,
    feature_groups: groups, features_total: groups.reduce((s, g) => s + g.items, 0) },
  demos,
  site: { sitemap_pages: locs.length, pages_with_feed: locs.filter((u) => feeds.includes(u)).length, feeds_total: feeds.length,
    places_with_strip: Object.keys(PLACES).length, strip_slots: slots, pages_with_strips: stripPages },
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify(out, null, 1));
