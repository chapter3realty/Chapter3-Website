#!/usr/bin/env node
/*
 * permits.js - the monthly data pull behind /invest/what-is-being-built/.
 *
 *   node tools/permits.js            # refresh research/invest-next/data/pipeline-latest.json
 *   node tools/permits.js --check    # print what would change, write nothing
 *
 * Three feeds, each with its own read date in the JSON:
 *   1. Horry County "Major Residential Developments" layer (ArcGIS Online):
 *      approved-but-unbuilt units, county-wide and by community. Live and
 *      updated by the county through August 2026.
 *   2. Horry County "Active Permits" layer (county GIS server): permits issued
 *      in the last 30 days and the newest issue date. The layer stopped
 *      updating on 2025-09-22 (research/invest-next/construction-pipeline-facts.md,
 *      section 6). The page prints the newest issue date so a stale feed reads
 *      as stale, never as "no permits".
 *   3. FRED series MYRT845BPPRIV, the Census count of housing units authorized
 *      by permit in the Myrtle Beach metro, monthly. fred.stlouisfed.org
 *      refuses some clients; when it fails the previous months stay and the
 *      read date does not move.
 *
 * Nothing is inferred: a feed that fails keeps its old values and old read
 * date, and the page shows that date. Then: node tools/mkpage.js
 * specs/what-is-being-built.js, node build.js dates, node build.js preflight.
 */
const fs = require("fs"), path = require("path"), https = require("https");

const OUT = path.join(__dirname, "..", "research", "invest-next", "data", "pipeline-latest.json");
const CHECK = process.argv.includes("--check");
const today = new Date().toISOString().slice(0, 10);

const DEV = "https://utility.arcgis.com/usrsvcs/servers/80af96d3ac864d068045634ac4365405/rest/services/PZ_Edit/pz_MajorResidentialDevelopments/FeatureServer/0/query";
const PERMITS = "https://www.horrycounty.org/gisweb/rest/services/Public/PermitsActive/MapServer/0/query";
const FRED = "https://fred.stlouisfed.org/data/MYRT845BPPRIV.txt";

function get(url, params, timeoutMs) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params || {})) u.searchParams.set(k, v);
  return new Promise((resolve, reject) => {
    const req = https.get(u, { headers: { "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) chapter3realty permits.js", Accept: "*/*" }, timeout: timeoutMs || 60000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (d) => body += d);
      res.on("end", () => res.statusCode === 200 ? resolve(body) : reject(new Error(`HTTP ${res.statusCode}`)));
    });
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
    req.on("error", reject);
  });
}
async function retry(fn, tries) {
  let last;
  for (let i = 0; i < (tries || 3); i++) { try { return await fn(); } catch (e) { last = e; await new Promise(r => setTimeout(r, 2000 * (i + 1))); } }
  throw last;
}
const stat = (type, field, name) => ({ statisticType: type, onStatisticField: field, outStatisticFieldName: name });
const isoDaysAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return d.toISOString().slice(0, 10); };

async function developments() {
  const total = JSON.parse(await retry(() => get(DEV, { where: "1=1", outStatistics: JSON.stringify([stat("sum", "TOTAL_REMA", "rem"), stat("sum", "SF_REMAINI", "sf"), stat("sum", "MF_REMAINI", "mf"), stat("count", "OBJECTID", "n")]), f: "json" })));
  const byC = JSON.parse(await retry(() => get(DEV, { where: "1=1", groupByFieldsForStatistics: "COMMUNITY", outStatistics: JSON.stringify([stat("sum", "TOTAL_REMA", "rem")]), orderByFields: "rem DESC", f: "json" })));
  const byS = JSON.parse(await retry(() => get(DEV, { where: "1=1", groupByFieldsForStatistics: "STATUS", outStatistics: JSON.stringify([stat("sum", "TOTAL_REMA", "rem"), stat("count", "OBJECTID", "n")]), f: "json" })));
  const upd = JSON.parse(await retry(() => get(DEV, { where: "1=1", groupByFieldsForStatistics: "UPDATED", outStatistics: JSON.stringify([stat("sum", "TOTAL_REMA", "rem"), stat("count", "OBJECTID", "n")]), f: "json" })));
  if (!total.features || !byC.features) throw new Error("developments: no features in reply");
  const t = total.features[0].attributes;
  const title = (s) => s ? s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()) : "no community named";
  return {
    endpoint: DEV, read: today, records: t.n, remaining_total: t.rem, remaining_single_family: t.sf, remaining_multifamily: t.mf,
    by_community: byC.features.map(f => ({ name: title(f.attributes.COMMUNITY), rem: f.attributes.rem })),
    by_status: byS.features.map(f => ({ status: f.attributes.STATUS, rem: f.attributes.rem, n: f.attributes.n })),
    updated: upd.features.map(f => ({ updated: f.attributes.UPDATED, rem: f.attributes.rem, n: f.attributes.n })).sort((a, b) => b.n - a.n).slice(0, 8),
    note: "Maximum units allowed by approved zoning minus units built, unincorporated Horry County only; the county says the layer is updated annually and many records still carry a 2019 date.",
  };
}
async function permitFeed(prev) {
  const since = isoDaysAgo(30);
  const cnt = JSON.parse(await retry(() => get(PERMITS, { where: `ISSUEDATE >= DATE '${since}'`, returnCountOnly: "true", f: "json" }, 90000)));
  const st = JSON.parse(await retry(() => get(PERMITS, { where: "1=1", outStatistics: JSON.stringify([stat("count", "OBJECTID", "n"), stat("max", "ISSUEDATE", "maxIssue")]), f: "json" }, 90000)));
  const maxMs = st.features && st.features[0] && st.features[0].attributes.maxIssue;
  const maxIssue = maxMs ? new Date(maxMs).toISOString().slice(0, 10) : null;
  const live = !!maxIssue && maxIssue >= isoDaysAgo(45);
  return { endpoint: PERMITS, read: today, since, last30: cnt.count, total: st.features ? st.features[0].attributes.n : null, max_issue_date: maxIssue, live,
    last_live_30_days: live ? cnt.count : (prev && prev.last_live_30_days) || 313,
    note: "Unincorporated Horry County permits on the county's public map. When max_issue_date is older than 45 days the feed is stale and last30 says nothing about building activity." };
}
async function fred(prev) {
  const txt = await retry(() => get(FRED, {}, 30000), 2);
  const monthly = {};
  for (const line of txt.split("\n")) { const m = line.match(/^(\d{4}-\d{2})-\d{2}\s+(\d+)/); if (m) monthly[m[1]] = +m[2]; }
  if (Object.keys(monthly).length < 12) throw new Error("fred: too few rows");
  return { ...prev, read: today, monthly: { ...(prev.monthly || {}), ...monthly } };
}

(async () => {
  const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  const next = { ...prev, generated: today };
  const log = (k, msg) => console.log(`${k.padEnd(14)} ${msg}`);
  try { next.developments = await developments(); log("developments", `${next.developments.remaining_total.toLocaleString()} units remaining in ${next.developments.records} records`); }
  catch (e) { log("developments", `FAILED (${e.message}); kept the ${prev.developments ? prev.developments.read : "seed"} values`); }
  try { next.county_permit_feed = await permitFeed(prev.county_permit_feed); log("permit feed", `${next.county_permit_feed.last30} issued since ${next.county_permit_feed.since}; newest issue date ${next.county_permit_feed.max_issue_date}; live=${next.county_permit_feed.live}`); }
  catch (e) { log("permit feed", `FAILED (${e.message}); kept the ${prev.county_permit_feed ? prev.county_permit_feed.read : "seed"} values`); }
  try { next.permits_fred = await fred(prev.permits_fred || {}); const ks = Object.keys(next.permits_fred.monthly).sort(); log("fred", `through ${ks[ks.length - 1]} (${next.permits_fred.monthly[ks[ks.length - 1]]} units)`); }
  catch (e) { const ks = Object.keys((prev.permits_fred || {}).monthly || {}).sort(); log("fred", `FAILED (${e.message}); kept the values through ${ks[ks.length - 1] || "none"}, read ${(prev.permits_fred || {}).read || "seed"}`); }
  if (CHECK) { console.log("\n--check: nothing written"); return; }
  fs.writeFileSync(OUT, JSON.stringify(next, null, 1) + "\n");
  console.log(`\nwrote ${path.relative(process.cwd(), OUT)}`);
})().catch((e) => { console.error(e); process.exit(1); });
