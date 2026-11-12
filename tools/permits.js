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
 *      read date does not move. Kept for reference only; the page uses feed 4.
 *   4. Census Building Permits Survey, CBSA files for 34820 (the Myrtle Beach
 *      metro, which is Horry County alone since the 2023 delineation). The
 *      newest year-to-date file (cbsaYYMMy), the same month a year earlier,
 *      the two latest annual files (cbsaYYYYa) and every monthly first count
 *      (cbsaYYMMc) since January 2024. Units = the four "Estimates with
 *      Imputation" groups (fields 7, 10, 13 and 16, one-based). The year-to-date
 *      and annual files add late reports and corrections, so they do not equal
 *      the sum of the monthly files. Also the place file for the newest full
 *      year: "Horry County Unincorporated Area".
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
const CBSA_DIR = "https://www2.census.gov/econ/bps/CBSA%20(beginning%20Jan%202024)/";
const PLACE_SO = "https://www2.census.gov/econ/bps/Place/South%20Region/";

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
async function census(prev) {
  const listing = await retry(() => get(CBSA_DIR, {}, 60000));
  const ys = [...new Set(listing.match(/cbsa\d{4}y\.txt/g) || [])].sort();
  if (!ys.length) throw new Error("census: no year-to-date files listed");
  const latest = ys[ys.length - 1].slice(4, 8), yy = +latest.slice(0, 2), mm = +latest.slice(2, 4);
  const units = (txt, file) => {
    const line = txt.split("\n").find(l => l.split(",")[2] === "34820");
    if (!line) throw new Error(`census: no 34820 line in ${file}`);
    const f = line.split(",");
    return [7, 10, 13, 16].reduce((a, i) => a + Number(f[i - 1]), 0);
  };
  const file = async (name) => units(await retry(() => get(CBSA_DIR + name, {}, 60000)), name);
  const pad = (n) => String(n).padStart(2, "0");
  const y1 = 2000 + yy - 1, y2 = 2000 + yy - 2;
  const ytd_now = await file(`cbsa${latest}y.txt`), ytd_prev = await file(`cbsa${pad(yy - 1)}${pad(mm)}y.txt`);
  const annual = { [y2]: await file(`cbsa${y2}a.txt`), [y1]: await file(`cbsa${y1}a.txt`) };
  const monthly = { ...(prev.monthly || {}) };
  for (let y = 24; y <= yy; y++) for (let m = 1; m <= (y === yy ? mm : 12); m++) {
    const key = `20${pad(y)}-${pad(m)}`;
    if (monthly[key] === undefined) monthly[key] = await file(`cbsa${pad(y)}${pad(m)}c.txt`);
  }
  const place = (await retry(() => get(PLACE_SO + `so${y1}a.txt`, {}, 90000))).split("\n").find(l => (l.split(",")[16] || "").trim() === "Horry County Unincorporated Area");
  if (!place) throw new Error("census: no Horry County Unincorporated Area line in the place file");
  const pf = place.split(",");
  const unincorporated = { year: y1, units: [19, 22, 25, 28].reduce((a, i) => a + Number(pf[i - 1]), 0) };
  return { source: CBSA_DIR, place_source: PLACE_SO + `so${y1}a.txt`, read: today, latest_month: `20${pad(yy)}-${pad(mm)}`, ytd_now, ytd_prev, annual, monthly, unincorporated,
    note: "Census Building Permits Survey, CBSA 34820, total units (1-unit + 2-units + 3-4 units + 5+ units), estimates with imputation. ytd and annual files include late reports and corrections; monthly values are each month's first count." };
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
  try { next.permits_census = await census(prev.permits_census || {}); const c = next.permits_census; log("census", `through ${c.latest_month}: ytd ${c.ytd_now} (a year earlier ${c.ytd_prev}); annual ${JSON.stringify(c.annual)}; unincorporated ${c.unincorporated.year} ${c.unincorporated.units}`); }
  catch (e) { log("census", `FAILED (${e.message}); kept the ${prev.permits_census ? prev.permits_census.read : "seed"} values`); }
  if (CHECK) { console.log("\n--check: nothing written"); return; }
  fs.writeFileSync(OUT, JSON.stringify(next, null, 1) + "\n");
  console.log(`\nwrote ${path.relative(process.cwd(), OUT)}`);
})().catch((e) => { console.error(e); process.exit(1); });
