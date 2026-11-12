/* /buyers/relocating/why-myrtle-beach/ - why so many people are moving to Myrtle Beach: the four reasons with a
 * number each, what people do here in a normal week, whether the county is still growing and where the new people
 * live (with a map), where they come from, what a house up north buys here, jobs and pay, taxes and insurance, why
 * some people leave, and who the move usually works for, ending on one story of a move we helped with.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-04; fix round 1, 2026-11-04 (REVIEW-1.md). The page was built from
 * data/relocating/pages/why-myrtle-beach.js with assemble-page.js; this spec replaces it (BRIEF.md: "Upgrade them
 * there, or move them to a spec"), so that file is retired with this page (NEEDS.md 1).
 * Reader, must-answers and plan: Blog-Brain batches/2026-11-a/buyers-relocating-why-myrtle-beach/must-answer.md and
 * PLAN.md. Facts: facts.md there, VERIFIED, CORRECTED, carried and VERIFIED-BY-FIXER rows only, at their corrected
 * values (VERIFY.md and buyers-relocating-why-myrtle-beach-struck.json). Row 10 is struck and not used.
 * Every chart, table, the map and the tool are built from data/2026-11-a/buyers-relocating-why-myrtle-beach/:
 *   census-pep.json (rows 11 to 15), rfa-projection.json (row 18), irs-migration.json (rows 2 to 9),
 *   zhvi-origins.json and zhvi-ohio.json (rows 23, 24, 45), listings-counts.json (row 25), weather-normals.json
 *   (rows 46, 47), acs.json and ../../2026-10-d/sell-out-of-state-buyers/acs-origin-counties.json (row 26),
 *   ../invest-where-to-buy/raw/places.json (Census outlines for the map), photos.json (the new aerial).
 * Fix round 1: the lead sentence is rebuilt from rows 4 and 23; the four reasons are the beach and the water, the
 * winter, the house price and the tax (work moved to its own section); a section on what people do here, with three
 * photos; a map of the city and the places outside it; insurance; one number each for winter, heat and hurricanes;
 * the year-by-year, births-and-deaths and eight-county charts cut; the Boston story cut (an investor story); one
 * story with tension near the end (schools-zone-edge-family).
 * Stories used as recorded: making-friends-seasonal, business-owners-lower-prices, remote-workers-half,
 * maryland-transplant, ohio-move, virginia-beach-comparison, traffic-timing, off-season-open, jobs-within-two-months,
 * cps-client-hired, insurance-quote-before-offer, schools-zone-edge-family.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

const BB = [path.join(__dirname, "..", "tools", "blog-brain-2026-11-a"), path.join(__dirname, "..", "tools", "blog-brain-2026-10-b"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "page-kit.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/page-kit.js)");
const PK = require(path.join(BB, "tools", "page-kit.js"));
const G = require(path.join(BB, "tools", "glass.js"));
const { compareCards } = require(path.join(BB, "tools", "compare.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));

const DATA = path.join(__dirname, "..", "data", "2026-11-a", "buyers-relocating-why-myrtle-beach");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const readAt = (...p) => JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", ...p), "utf8"));
const PEP = read("census-pep.json"), RFA = read("rfa-projection.json").horry, IRS = read("irs-migration.json");
const ZHVI = read("zhvi-origins.json").counties.filter((c) => !c.missing), LIST = read("listings-counts.json");
const OHIO = read("zhvi-ohio.json"), WX = read("weather-normals.json");
const ACS_ORIG = readAt("2026-10-d", "sell-out-of-state-buyers", "acs-origin-counties.json");
const ACS_EXTRA = read("acs.json").extra_origins;
const PLACES = readAt("2026-11-a", "invest-where-to-buy", "raw", "places.json").places;

/* Photos: this page's new aerial (photos.json here), the site's records (the beach in late November, the boats in
   Murrells Inlet, the Riverwalk in Conway) and the downtown beach from /buyers/buying-in-myrtle-beach/. */
const PHOTOS = read("photos.json").photos.concat(readAt("photos.json").photos)
  .concat(readAt("2026-11-a", "buyers-buying-in-myrtle-beach", "photos.json").photos.filter((p) => /myrtle-beach-skywheel-beach/.test(p.file)));
const kit = PK.create({ h, theme: "glass", photos: PHOTOS });
const ph = kit.photoSet({ aerialWidth: "760px" });

const SELF = "/buyers/relocating/why-myrtle-beach/";
const fmt = (v) => Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + fmt(Math.round(v / 1000) * 1000);
const r10k = (v) => "$" + fmt(Math.round(v / 10000) * 10000);
const about100 = (v) => fmt(Math.round(v / 100) * 100);
const about10 = (v) => fmt(Math.round(v / 10) * 10);
const must = (ok, msg) => { if (!ok) throw new Error(msg); };

/* ---------------------------------------------------------------------------- */
/* Data checks: the copy below states these facts in words; if a file changes, the build stops.  */

const LATEST = IRS.summary.find((s) => s.year === "2022-2023");
must(LATEST && LATEST.in_returns === 15075 && LATEST.out_returns === 9143, "IRS totals changed: rewrite rows 2 and 8 in the copy");
must(IRS.summary.every((s) => s.in_returns > s.out_returns), "a year with more leaving than arriving: rewrite the growth lines");
const POP25 = PEP.pop["2025"], BASE20 = PEP.base2020;
const GROWTH = Math.round((POP25 - BASE20) / BASE20 * 100);                     // row 11: 22
must(GROWTH === 22, "the growth percent changed");
const C = PEP.components;
must(!Object.keys(C.NATURALCHG).filter((k) => /^\d{4}$/.test(k)).some((k) => C.NATURALCHG[k] >= 0), "a year with more births than deaths: rewrite row 14");
const PER_DAY = Math.round(C.DOMESTICMIG["2025"] / 365);                          // row 15: 39
const Z = Object.fromEntries(ZHVI.map((c) => [c.fips, c]));
const HORRY = Z["45051"], SUFFOLK = Z["36103"], MECK = Z["37119"], NASSAU = Z["36059"];
const SUFFOLK_GAP = r10k(SUFFOLK.zhvi - HORRY.zhvi);                              // row 24: about $410,000
const O = Object.fromEntries(OHIO.counties.map((c) => [c.fips, c]));
must(OHIO.month === read("zhvi-origins.json").month && O["45051"].zhvi === HORRY.zhvi, "the Ohio values are from another Zillow month");
must(O["39049"].zhvi < HORRY.zhvi && O["39035"].zhvi < HORRY.zhvi && Z["42003"].zhvi < HORRY.zhvi, "an Ohio or Pittsburgh home now costs more than one here: rewrite row 45");
const count = (max) => { const r = LIST.rows.find((x) => x.params.type === "house" && x.params.max === max); must(r, `no house count at ${max}`); return r.total; };
const HOUSES = LIST.rows.find((x) => x.params.type === "house" && !x.params.max).total;   // row 25: about 3,700
const RAN_ON = new Date(LIST.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
const REG = IRS.regions["2022-2023"];
const sameIn = 2150, sameOut = 2297;                                               // row 5, from the IRS same-state rows
{ const y = IRS.years["2223"]; must(!y || (y.in["Horry County Total Migration-Same State"].returns === sameIn && y.out["Horry County Total Migration-Same State"].returns === sameOut), "same-state flows changed"); }
const GEO = IRS.top_origins_2223.find((r) => r.fips === "45043");                 // row 7: Georgetown County, the largest single source
must(GEO && GEO.arrived_returns === 531 && IRS.top_origins_2223[0].fips === "45043", "Georgetown County is no longer the largest single source");
const OUT_STATE_SHARE = REG.in.irs_diffstate_total / LATEST.in_returns;           // row 4: 12,877 of 15,075
must(Math.round(OUT_STATE_SHARE * 7) === 6, "the out-of-state share is no longer about 6 in 7");
/* Weather (rows 46, 47): January normals, freezing nights, 90-degree days, snow. */
must(Math.round(+WX.jan_high) === 56 && Math.round(+WX.jan_low) === 37 && Math.round(+WX.nights_at_or_below_32_year) === 34
  && Math.round(+WX.days_90_plus_year) === 21 && +WX.days_high_at_or_below_32_year < 0.5 && WX.snow.annual_mean_in === 1, "a weather normal changed: rewrite rows 46 and 47");

/* ---------------------------------------------------------------------------- */
/* Visuals                                                                         */

/* People in Horry County: the 2020 census, the latest estimate and the state's projection (rows 11, 18). */
const POP_CHART = G.bars([
  { name: "2020 census", value: BASE20, valueText: `about ${fmt(Math.round(BASE20 / 1000) * 1000)}` },
  { name: "Latest estimate", value: POP25, valueText: `about ${about100(POP25)}` },
  { name: "2030, projected", value: RFA["2030"], valueText: `about ${fmt(Math.round(RFA["2030"] / 1000) * 1000)}`, reference: true },
], { caption: "People living in Horry County, now and projected", nameLabel: "When", valueLabel: "people", format: fmt, compact: true, max: Math.round(RFA["2030"] * 1.05),
  note: "Census Bureau counts. The 2030 figure is South Carolina's own projection, not a count." });

/* Households that moved in, by where they came from (rows 4, 5, 7). */
const REGION_CHART = G.bars([
  { name: "The South, outside South Carolina", value: REG.in.South, valueText: `about ${about100(REG.in.South)}` },
  { name: "The Northeast", value: REG.in.Northeast, valueText: `about ${about100(REG.in.Northeast)}` },
  { name: "Other South Carolina counties", value: sameIn, valueText: `about ${about100(sameIn)}`, feature: "most from Georgetown County" },
  { name: "The Midwest", value: REG.in.Midwest, valueText: `about ${about100(REG.in.Midwest)}` },
  { name: "The West", value: REG.in.West, valueText: `about ${about100(REG.in.West)}` },
], { caption: "Households that moved to Horry County in one year, by where they came from", nameLabel: "Came from", featureLabel: "note", valueLabel: "households",
  format: fmt, compact: true, phoneList: true, max: Math.round(REG.in.South * 1.2),
  note: "IRS counts of households that changed county. The South includes North Carolina, Virginia, Maryland and Florida." });

/* Where the households that left went (row 9). */
const DEST = IRS.top_destinations_2223;
const d = (fips) => { const r = DEST.find((x) => x.fips === fips); must(r, `destination ${fips} missing`); return r.left_returns; };
must(DEST.slice(0, 3).map((x) => x.fips).join() === "45043,37019,45019", "the top three destinations changed");
const LEFT_CHART = G.bars([
  { name: "Georgetown County, SC", value: d("45043"), valueText: `about ${about10(d("45043"))}`, feature: "next door, to the south" },
  { name: "Brunswick County, NC", value: d("37019"), valueText: `about ${about10(d("37019"))}`, feature: "next door, to the north" },
  { name: "Charleston County, SC", value: d("45019"), valueText: `about ${about10(d("45019"))}` },
], { caption: "Where the most households went when they left Horry County, in one year", nameLabel: "Went to", featureLabel: "note", valueLabel: "households",
  format: fmt, compact: true, phoneList: true, max: Math.round(d("45043") * 1.25),
  note: "IRS counts of households that changed county." });

/* What a house buys: houses for sale at or under the typical home value in four counties (row 25). */
const SALE_CHART = G.bars([
  { name: "Nassau County, NY", value: count(852000), valueText: `about ${about10(count(852000))}`, feature: `at or under ${r1k(NASSAU.zhvi)}` },
  { name: "Suffolk County, NY", value: count(730000), valueText: `about ${about10(count(730000))}`, feature: `at or under ${r1k(SUFFOLK.zhvi)}` },
  { name: "Mecklenburg County, NC", value: count(415000), valueText: `about ${about10(count(415000))}`, feature: `at or under ${r1k(MECK.zhvi)}` },
  { name: "Horry County, SC", value: count(320000), valueText: `about ${about10(count(320000))}`, feature: `at or under ${r1k(HORRY.zhvi)}`, reference: true },
], { caption: "Houses for sale here at or under a typical home's value in each county", nameLabel: "Typical home value in", featureLabel: "price line", valueLabel: "houses for sale",
  format: fmt, compact: true, phoneList: true, max: Math.round(HOUSES * 1.15),
  note: `Houses only, not condos, out of about ${about100(HOUSES)} houses for sale in Horry and Georgetown counties and nearby. We ran this count on ${RAN_ON}; ask us and we run it again for your price.` });

/* The tool: pick your county, see its typical home value against Horry County's (rows 23, 45) and a link to the
   houses for sale at or under it. No automated value for any address: county figures only. */
const TOOL_ROWS = ZHVI.filter((c) => c.fips !== "45051").map((c) => ({ id: c.fips, label: `${c.name}, ${c.state}`, zhvi: c.zhvi }))
  .concat(OHIO.counties.filter((c) => c.state === "OH").map((c) => ({ id: c.fips, label: `${c.label}, OH`, zhvi: c.zhvi })))
  .sort((a, b) => b.zhvi - a.zhvi).map((c) => Object.assign(c, { v: Math.round(c.zhvi / 1000) * 1000 }));
const TOOL_HORRY = Math.round(HORRY.zhvi / 1000) * 1000;
const LAB = 'style="display:block;color:rgba(244,239,232,.92);font-family:var(--sans);font-size:1rem;line-height:1.4;margin:0 0 .45rem"';
const SEL = 'style="width:100%;max-width:100%;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.4);border-radius:10px;color:#f4efe8;font-family:var(--sans);font-size:1rem;padding:.65rem .7rem"';
const row = (label, id, val) => `<div class="c3-wr"><span>${label}</span><strong id="${id}">${val}</strong></div>`;
const def = TOOL_ROWS.find((r) => r.id === "37119");
const TOOL = `<div class="c3-wbuys c3-calc-box" style="background:var(--navy);background-image:linear-gradient(160deg,rgba(42,48,64,.97),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:1.4rem 1.3rem 1.3rem;margin:1.6rem 0;max-width:620px;box-shadow:0 26px 60px -30px rgba(28,32,40,.6)">`
  + `<p style="font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brass-2);margin:0 0 .4rem;font-family:var(--sans);font-weight:600">What your house buys here</p>`
  + `<label for="wbCounty" ${LAB}>The county you live in now</label>`
  + `<select id="wbCounty" onchange="c3Wb()" ${SEL}>${TOOL_ROWS.map((r) => `<option value="${r.v}"${r === def ? " selected" : ""}>${r.label}</option>`).join("")}</select>`
  + `<div style="display:grid;gap:.55rem;margin-top:1.1rem">`
  + row("A typical home there", "wbThere", r1k(def.v)) + row("A typical home in Horry County", "wbHere", r1k(TOOL_HORRY))
  + `</div>`
  + `<div style="border-top:1px solid rgba(244,239,232,.22);margin-top:1rem;padding-top:.9rem"><p id="wbSay" aria-live="polite" style="font-family:var(--sans);color:rgba(244,239,232,.92);line-height:1.55;margin:0 0 .9rem;font-size:1.05rem">About ${r1k(def.v - TOOL_HORRY)} less here, before moving and sale costs.</p>`
  + `<a id="wbLink" class="c3-wblink" href="/homes/map/?type=house&amp;max=${def.v}">See houses for sale at or under ${r1k(def.v)}</a></div></div>`
  + `<script>function c3Wb(){var s=document.getElementById("wbCounty");if(!s)return;var v=parseInt(s.value,10),here=${TOOL_HORRY};`
  + `var m=function(n){return "$"+Math.round(n).toLocaleString("en-US")};var t=document.getElementById("wbThere"),y=document.getElementById("wbSay"),l=document.getElementById("wbLink");if(!t||!y||!l)return;`
  + `t.textContent=m(v);var d=Math.round((v-here)/1000)*1000;y.textContent=d>0?"About "+m(d)+" less here, before moving and sale costs.":d<0?"About "+m(-d)+" more here than there.":"About the same as here.";`
  + `l.href="/homes/map/?type=house&max="+v;l.textContent="See houses for sale at or under "+m(v)}document.addEventListener("DOMContentLoaded",c3Wb);</script>`
  + `<style>main#main .c3-wbuys .c3-wr{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;font-family:var(--sans);color:rgba(244,239,232,.88);font-size:1rem}`
  + `main#main .c3-wbuys .c3-wr strong{color:var(--brass-2);font-family:var(--serif);font-size:1.5rem;line-height:1.1;white-space:nowrap}main#main .c3-wbuys .c3-wblink{display:inline-block;color:var(--brass-2);font-family:var(--sans);font-weight:600;font-size:1.05rem;text-decoration:underline;text-underline-offset:.2em;line-height:1.4;padding:.35rem 0}</style>`;

/* Owners' typical yearly property tax, Horry County and the counties movers come from (row 26). 10001 is the
   table's top code: $10,000 or more. */
const ACS_ALL = Object.fromEntries(ACS_ORIG.map((c) => [c.fips, +c.B25103.estimate]).concat(Object.values(ACS_EXTRA).map((c) => [c.fips, +c.B25103.estimate])));
const taxRow = (fips, name) => { const v = ACS_ALL[fips]; must(v, `no tax bill for ${fips}`);
  return { name, value: Math.min(v, 10000), valueText: v >= 10001 ? "$10,000 or more" : "$" + fmt(v) }; };
const TAX_CHART = G.bars([
  taxRow("36103", "Suffolk County, NY"), taxRow("36059", "Nassau County, NY"), taxRow("36071", "Orange County, NY"), taxRow("34029", "Ocean County, NJ"),
  taxRow("37183", "Wake County, NC"), taxRow("37119", "Mecklenburg County, NC"), taxRow("37019", "Brunswick County, NC"),
  Object.assign(taxRow("45051", "Horry County, SC"), { reference: true }),
], { caption: "The typical yearly property tax bill on a home its owner lives in", nameLabel: "County", valueLabel: "tax a year", format: fmt, compact: true, phoneList: true, max: 14000,
  note: "Census Bureau, the middle bill paid by owners who live in their homes, averaged over five years. The Census table stops at $10,000." });
must(ACS_ALL["45051"] === 944, "Horry's typical tax bill changed: rewrite the reason card and the tax section");

/* The map: the City of Myrtle Beach and four places outside any city (rows 16, 17), from the Census outlines. */
const ring = (rings) => {
  let best = null, ba = 0;
  for (const r of rings) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); if (Math.abs(a) > ba) { ba = Math.abs(a); best = r; } }
  let s = best; while (s.length > 390) s = s.filter((_, i) => i % 2 === 0);
  return s;
};
const outline = (census) => { const p = PLACES.find((x) => x.name === census); must(p, `no outline for ${census}`); return ring(p.rings); };
const MAP = (() => {
  const areas = [
    { name: "City of Myrtle Beach", polygon: outline("Myrtle Beach city"), mark: "1" },
    { name: "Carolina Forest", polygon: outline("Carolina Forest CDP"), mark: "2" },
    { name: "Socastee", polygon: outline("Socastee CDP"), mark: "3" },
    { name: "Murrells Inlet", polygon: outline("Murrells Inlet CDP"), mark: "4" },
    { name: "Little River", polygon: outline("Little River CDP"), mark: "5" },
  ];
  const m = regionMap({ name: "The City of Myrtle Beach and places outside it", areas, areaLabels: "numbers", maxRatio: 0.9 }, { glass: true });
  must(m.svg.length < 90000, `the map is ${m.svg.length} bytes`);
  const alt = "Map of the Grand Strand from Little River to Murrells Inlet, with the ocean, the Intracoastal Waterway and the main roads. Five outlines are numbered: 1, the City of Myrtle Beach along the coast; 2, Carolina Forest; 3, Socastee; 4, Murrells Inlet; 5, Little River, all four outside any city.";
  const svg = m.svg.replace(/aria-label="[^"]*"/, `aria-label="${alt}"`).replace("<svg ", '<svg style="display:block;width:100%;height:auto" ');
  const key = `<ol class="c3w-key" role="list" aria-label="Map key">` + areas.map((x, i) => `<li><b>${i + 1}</b>${x.name}${i ? ", outside city limits" : ", about 41,000 people"}</li>`).join("") + `</ol>`;
  return `<div class="c3w-map">` + h.figure(svg, `The City of Myrtle Beach and four places outside any city where many of the new homes are. The outlines are the Census Bureau's. ${m.credit}`) + key + `</div>`;
})();
const MAP_CSS = "<style>main#main .c3w-map{max-width:760px}main#main .c3w-map figure{margin:1.2rem 0 .5rem!important}"
  + "main#main .c3w-key{list-style:none;margin:0 0 1.2rem;padding:0;display:grid;gap:.35rem;font-family:var(--sans);font-size:1rem;line-height:1.4;color:var(--navy)}"
  + "main#main .c3w-key li{margin:0;display:flex;align-items:center;gap:.45rem}main#main .c3w-key b{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;border-radius:50%;background:#fff;border:1.5px solid var(--navy);font-size:.85rem}"
  + "main#main .c3w-states{list-style:none;margin:.4rem 0 1.2rem;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(9rem,100%),1fr));gap:.2rem 1rem}main#main .c3w-states li{margin:0;padding:.3rem 0}</style>";

/* Reason cards and decision cards: glass cards with an icon, a bold line and a short answer. A card never sets a
   minimum wider than its column (min(19rem,100%)), so a 320 px phone does not scroll sideways. */
const CARD_CSS = "<style>main#main .c3-rc{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(19rem,100%),1fr));gap:.75rem;max-width:760px}"
  + "main#main .c3-rc li{margin:0;min-width:0;padding:1rem 1.05rem 1.05rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.55));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 28px -16px rgba(28,32,40,.35)}"
  + "main#main .c3-rc .q{display:flex;align-items:center;gap:.6rem;color:var(--navy);font-weight:600;font-size:var(--read,1.0625rem);line-height:1.35;margin:0 0 .45rem}"
  + "main#main .c3-rc .q .i{flex:none;display:flex;width:2.3rem;height:2.3rem;border-radius:50%;align-items:center;justify-content:center;color:var(--brass-ink);background:rgba(196,120,58,.12)}"
  + "main#main .c3-rc .a{color:var(--muted);line-height:1.6;margin:0}"
  + "@media (prefers-reduced-transparency:reduce){main#main .c3-rc li{background:#fbf8f3}}</style>";
const cards = (rows) => `<ul class="c3-rc" role="list">` + rows.map((r) => `<li><p class="q"><span class="i" aria-hidden="true">${icon(r.icon, { size: 22 })}</span><span>${r.q}</span></p><p class="a">${r.a}</p></li>`).join("") + "</ul>";

const REASONS = cards([
  { icon: "dock", q: "The beach and the water", a: "The ocean still averages the low 70s in October. Behind the beach towns are the Intracoastal Waterway, the Waccamaw River and the Murrells Inlet marsh, each with public boat landings." },
  { icon: "calendar", q: "The winter is short and mild", a: "A January day averages a high of about 56 degrees and a low of about 37. Snow averages about an inch a year, and about two winters in three bring none." },
  { icon: "home", q: "A house costs less than in most places movers leave", a: `A typical home in Horry County is valued at about ${r1k(HORRY.zhvi)}. Around Charlotte it is about ${r1k(MECK.zhvi)}, and on Long Island about ${r1k(SUFFOLK.zhvi)} or more.` },
  { icon: "tax", q: "The property tax is low", a: "An owner who lives in the home here typically pays about $944 a year. On Long Island the typical bill is $10,000 or more." },
]);

const DECIDE = cards([
  { icon: "home", q: "If your home is worth more than a typical one here", a: "Selling it can pay for a home here with money left over, before costs. The tool above shows the gap for your county." },
  { icon: "dollar", q: "If you live on a pension, Social Security or a remote job", a: "Lower local pay matters less to you, and the retiree tax breaks in the taxes section apply to you." },
  { icon: "town", q: "If you need a local job", a: "Plan on lower pay than up north, and apply for jobs on your house-hunting visit. One of our clients applied for a child protective services job on a visit and was hired a month later." },
  { icon: "beach", q: "If you want to be outside all winter", a: "A day that stays below freezing from morning to night comes about once in three years. In our team's experience, the Boardwalk stays open all winter." },
  { icon: "calendar", q: "If you want big-city night life", a: "In summer, bands play every night at both ends of the Garden City Pier. Our clients from Virginia describe Virginia Beach as much bigger. One put it this way: nobody here parties like Miami, but people here are enjoying their money." },
]);

/* Page CSS: the end offer band keeps its dark panel (retirees.js, glass top-bar rule); the header phone digits hide
   between 1000 and 1120 px, where they ran past a 1024 px window on other rebuilt pages. */
const BAND_END = 'main#main>section[style^="background:var(--navy)"]:has(>.wrap>h2)';
const PAGE_CSS = "<style>main#main .c3-glance li{line-height:1.4}"
  + `${BAND_END}{padding:.9rem 0 1.4rem!important}${BAND_END}>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important}`
  + `${BAND_END}>.wrap>h2{color:var(--ivory)!important}${BAND_END}>.wrap>p{color:rgba(244,239,232,.82)!important}`
  + `@media (max-width:699px){${BAND_END}>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}${BAND_END}>.wrap>h2{font-size:1.5rem!important;line-height:1.25}}`
  + "@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}"
  + "</style>";

/* Photos, each under the sentence it proves. */
const PH_BEACH = ph.aerial("myrtle-beach-beach-from-above", "The beach in Myrtle Beach in late November, seen from a high floor.", { closeUp: true });
const PH_DOWNTOWN = ph.aerial("myrtle-beach-skywheel-beach", "The beach downtown, by the SkyWheel on the Boardwalk.", { closeUp: true });
const PH_INLET = ph.aerial("murrells-inlet-boats", "Fishing boats tied up in Murrells Inlet.", { closeUp: true });
const PH_RIVER = ph.aerial("conway-riverwalk-boardwalk", "The Riverwalk in Conway, beside the old riverfront warehouses on the Waccamaw River.", { closeUp: true });
const PH_WOODS = ph.aerial("woods-cleared-for-new-streets-from-above", "Woods cleared for new streets and house lots outside the city limits, between Conway and North Myrtle Beach.");
ph.share("woods-cleared-for-new-streets-from-above");

/* Sources a reader can open. */
const IRS_URL = "https://www.irs.gov/statistics/soi-tax-stats-migration-data";
const PEP_URL = "https://www.census.gov/newsroom/press-releases/2026/2025-popest-metro-micro-counties.html";
const ACS_URL = "https://data.census.gov/table/ACSDT1Y2024.B05002?g=050XX00US45051";
const RFA_URL = "https://rfa.sc.gov/programs/census-state-liaison-and-data-center/search-and-download-population-data/rfa-population-projections";
const QCEW_URL = "https://www.bls.gov/cew/";
const ZILLOW_URL = "https://www.zillow.com/research/data/";
const T12_6 = "https://www.scstatehouse.gov/code/t12c006.php";
const T12_16 = "https://www.scstatehouse.gov/code/t12c016.php";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const T56_3 = "https://www.scstatehouse.gov/code/t56c003.php";
const NOAA_URL = "https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070";
const NCEI_URL = "https://www.ncei.noaa.gov/access/us-climate-normals/";
const SNOW_URL = "https://www.weather.gov/ilm/MYRsnowfallDatabase";
const NHC_URL = "https://www.nhc.noaa.gov/climo/";
const FEMA_URL = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const PUMS_URL = "https://www.census.gov/programs-surveys/acs/microdata.html";

const STATES = [["new-york", "New York"], ["new-jersey", "New Jersey"], ["pennsylvania", "Pennsylvania"], ["connecticut", "Connecticut"], ["massachusetts", "Massachusetts"],
  ["maryland", "Maryland"], ["virginia", "Virginia"], ["north-carolina", "North Carolina"], ["ohio", "Ohio"], ["florida", "Florida"]]
  .map(([s, n]) => h.a(`/buyers/relocating/from-${s}/`, n));

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Relocating", url: "/buyers/relocating/" },
  pageImages: () => ph.pageImages(),
  title: "Why Is Everyone Moving to Myrtle Beach? 4 Reasons, in Numbers",
  description: "Why so many people are moving to Myrtle Beach: the beach and the water, short winters, house prices, low property tax, where movers come from, why some leave.",
  ogTitle: "Why are so many people moving to Myrtle Beach? Four reasons, told with numbers",
  crumb: "Why Myrtle Beach",
  eyebrow: "Moving to Myrtle Beach",
  h1: "Why are so many people moving to Myrtle Beach?",
  h1em: "Four reasons, told with numbers.",
  sub: "Movers come to Horry County for the beach and the water, a short and mild winter, a lower home price and a low property tax.",
  heroMedia: PAGE_CSS + ph.css() + CARD_CSS + MAP_CSS + kit.glance([
    { icon: "town", label: "Growth", text: `${GROWTH}% since 2020` },
    { icon: "pin", label: "Born in another state", text: "6 in 10" },
    { icon: "calendar", label: "January high", text: "About 56°F" },
  ]),
  heroCta: { title: "Find out what the money from your house buys here.", label: "Ask us what it buys", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "Most households moving to Myrtle Beach and the rest of Horry County come from another state. In most of the out-of-state counties that send the most, a typical home costs more than one here.",
    "They come for the beach and the water, a short winter and, for most out-of-state movers, a much lower property tax bill. In the latest count, about 15,000 households moved in and about 9,100 moved out.",
  ],
  sections: [
    { h2: "Why are so many people moving to Myrtle Beach?", toc: "The four reasons", id: "four-reasons", html: () =>
      h.p("The City of Myrtle Beach is in Horry County, South Carolina, and the coast here is called the Grand Strand. People move here for the beach and the water, a short winter, lower house prices and low property tax.") +
      REASONS +
      PH_BEACH },

    { h2: "What do people do in Myrtle Beach?", toc: "Life here", id: "life-here", html: () =>
      h.p("Downtown, the Boardwalk is about 1.3 miles long, beside the ocean, with a raised wooden walk and a paved path along the sand.") +
      PH_DOWNTOWN +
      h.p("Murrells Inlet is known for seafood. Its restaurants grew from the oyster roasts of the inlet's founding families. The MarshWalk there is a half-mile wooden boardwalk on the salt marsh, with restaurants and free live music.") +
      h.p("From October through May, anyone with a South Carolina saltwater fishing license may gather oysters and clams on the inlet's public grounds. Parts of the grounds close at times for bacteria.") +
      PH_INLET +
      h.p("Inland, Conway's Riverwalk follows the Waccamaw River for about 1.5 miles, with a kayak launch and a public boat landing beside it.") +
      PH_RIVER +
      h.p("On the Intracoastal Waterway in Carolina Forest, the county's Bike and Run Park has about 7 miles of trails. Huntington Beach State Park, south of Murrells Inlet, has 3 miles of beach and a freshwater lake known for alligators.") +
      h.p("Myrtle Beach's first golf course, Pine Lakes, opened in 1927. Anyone who lives or owns a home in Horry County can buy the Myrtle Beach Golf Passport for $72 a year. It gives member rates at the courses that take it.") +
      h.p("The off season is quieter, not closed: in our team's experience, only the tourist attractions and water parks close in winter. One mover from Maryland noticed that farm stands and butchers fill the gap the grocery stores leave in organic food.") },

    { h2: "Is Myrtle Beach still growing?", toc: "Still growing?", id: "still-growing", html: () =>
      h.p(`Yes. Horry County grew about ${GROWTH} percent from the 2020 census to the latest estimate. The growth is people moving in: in the latest year, about ${PER_DAY} more people a day arrived from other parts of the country than left.`) +
      POP_CHART +
      h.p("Among the country's metro areas, the Myrtle Beach area, which is all of Horry County, grew the second fastest from mid-2024 to mid-2025. Only Ocala, Florida grew faster.") },

    { h2: "Is Myrtle Beach getting overcrowded?", toc: "Overcrowded?", id: "overcrowded", html: (bg) =>
      h.p("Most of the growth is not in the beach towns. The City of Myrtle Beach itself has about 41,000 people. About three in four Horry County residents live outside any city or town.") +
      h.p("About four in five of the people added since 2020 settled outside city limits, in places such as Carolina Forest, Socastee, Murrells Inlet and Little River.") +
      MAP +
      h.p("Outside city limits is not far from the sand. With no traffic, the beach is about 10 minutes from the middle house in Murrells Inlet, 13 in Socastee, 14 in Little River and 18 in Carolina Forest.") +
      PH_WOODS +
      h.p(`Summer traffic is lighter than most movers expect. In our team's experience, rush hour adds 5 to 10 minutes, and ${h.a("/buyers/relocating/getting-around/", "SC 31 or SC 22 avoids the many stop lights on US 17")}. Our ${h.a("/buyers/relocating/which-town/", "which town page")} compares the towns.`) +
      h.cta("New homes going up outside the city limits", "Tell us your price and how far from the beach you want to live. We send you new homes for sale that fit.", "Send me new homes for sale", "/contact/", bg) },

    { h2: "Where are people moving to Myrtle Beach from?", toc: "Where from", id: "where-from", html: () =>
      h.p("About six in seven households that move to Horry County come from another state. The South sends the most, then the Northeast.") +
      REGION_CHART +
      h.p(`The single county that sends the most is Georgetown County, South Carolina, just to the south, with about ${about10(GEO.arrived_returns)} households in the latest count. Outside South Carolina, the most come from Suffolk County on Long Island, then Brunswick, Mecklenburg and Wake counties in North Carolina.`) +
      h.p("Few go back north. For every household that moved from Horry County to Ocean County, New Jersey, about five came from it.") +
      h.p("About six in ten Horry County residents were born in another state, against about one in four Americans. About 3 in 10 homes sold here in the last 12 months went to a buyer whose tax bill goes to another state or country.") +
      h.p("We wrote a page for the move from each of the states most movers come from:") + `<ul class="c3w-states" role="list">${STATES.map((x) => `<li>${x}</li>`).join("")}</ul>` },

    { h2: "What would my house buy in Myrtle Beach?", toc: "What your house buys", id: "what-your-house-buys", html: (bg) =>
      h.p(`In most of the out-of-state counties that send the most movers, a typical home is worth more than one here. Sell a typical Suffolk County home and buy a typical one here, and about ${SUFFOLK_GAP} is left before moving costs, sale costs and any loan payoff.`) +
      h.p("From Ohio and the Pittsburgh area, the reverse is true: a typical home here costs more than one there. Pick your county to see the gap.") +
      TOOL +
      h.p("These are county figures, not a value for your house. We price the house you want here against nearby sales.") +
      h.p("About half of the houses for sale here are priced at or under a typical Charlotte-area home's value.") +
      SALE_CHART +
      h.cta("The houses your budget buys here", "Send us what you expect from your sale up north. We send you the houses for sale it buys, town by town.", "Send us your budget", "/contact/", bg) },

    { h2: "Are there jobs in Myrtle Beach, and what does work pay?", toc: "Jobs and pay", id: "jobs-and-pay", html: () =>
      h.p("Yes, and the number of jobs grew faster than in the country. Pay is lower, though: the average job here pays about 64 cents for every dollar of the national average.") +
      compareCards([
        { name: "Horry County", cells: { jobs: "About 9%", pay: "About $50,000" } },
        { name: "United States", cells: { jobs: "About 5%", pay: "About $79,000" } },
      ], [{ key: "jobs", label: "More jobs, 2019 to 2025", num: true }, { key: "pay", label: "Average pay a year", num: true }],
      { caption: "Jobs and pay in Horry County and the country", nameLabel: "Where" }) +
      h.p("Most of our buyers who need work find it within a month or two, in fields from child protective services and stores to welding. That is our clients' experience, not a promise.") +
      h.p("Many movers bring their work with them. About half of our clients who come from the northern states arrive with a remote job.") +
      h.p(`Business owners who move here tell us they cannot charge as much for their services as they did up north. Our ${h.a("/buyers/relocating/jobs/", "jobs page")} has more on work and pay here.`) },

    { h2: "How much are taxes and insurance in Myrtle Beach?", toc: "Taxes and insurance", id: "taxes", html: (bg) =>
      h.p("Property tax on a home you live in is low here, a fraction of the bill in most of the out-of-state counties movers come from.") +
      TAX_CHART +
      h.p(`The bills in the chart are what owners pay today. For a house you buy, budget from its price: about $1,470 a year on a $400,000 house you live in outside the city limits. It is about $4,820 if it is a second home or a rental.`) +
      h.h3("Home insurance costs more than in the rest of the state") +
      h.p("Owners of a house in Horry County pay about $2,000 a year for home insurance at the middle, against about $1,400 in the rest of South Carolina.") +
      h.p("Flood insurance depends on the street. Outside FEMA's high-risk flood zone, federal rules do not require it, and a policy usually costs about $550 a year. Inside it, your lender requires one, usually about $1,070.") +
      h.p("Few houses in Carolina Forest, Conway, Myrtle Beach or Little River are in the high-risk zone: 5 percent or fewer. In Garden City, Surfside Beach and around Pawleys Island, about 3 in 10 are. We get you an insurance quote on a house before you make an offer.") +
      h.h3("If you are retired") +
      h.ul([
        `South Carolina ${h.ext(T12_6, "does not tax Social Security")}.`,
        "From the year you turn 65, up to $10,000 a year of retirement income is deducted for each person. A second deduction brings the total to $15,000 a person against any income. Military retirement pay is not taxed at all.",
        `At 65, after a year living in South Carolina, ${h.ext(T12_37, "you pay no property tax")} on the first $50,000 of your home's value. For 2026 only, an owner who already qualified in 2025 gets $75,000.`,
        `South Carolina ${h.ext(T12_16, "has no estate tax")}.`,
      ]) +
      h.h3("The tax many movers do not expect") +
      h.p("South Carolina taxes vehicles every year. One of our team moved here from a village of about 400 in Ohio, and his first vehicle tax bill was $325.") +
      h.p(`Each car first titled in another state also pays a ${h.ext(T56_3, "one-time $250 state fee")} when you register it here. Owners on active duty in the military, and their spouses and dependents, do not pay it.`) +
      h.cta("The tax bill on one house, before you offer", "Pick a house you like. We work out its property tax as your full-time home and as a second home.", "Have us work out the tax", "/contact/", bg) },

    { h2: "Are people leaving Myrtle Beach, and why?", toc: "Who leaves, and why", id: "why-people-leave", html: () =>
      h.p("Some are, but fewer than arrive. In the latest count, about 9,100 households left Horry County and about 15,000 arrived. The top destinations for households that leave Horry County are nearby: Georgetown County, SC, Brunswick County, NC, and Charleston County, SC.") +
      LEFT_CHART +
      h.p("Those who leave reported less income: about $55,000 a household on average, against about $83,000 for those who arrived.") +
      h.p("Making friends is harder than movers expect, because many people near the city core are tourists or a seasonal population that leaves. Our advice: buy outside the City of Myrtle Beach. Be a regular at places tourists do not go, such as gyms and clubs.") +
      h.p("Summers are hot and humid: about 21 days a year reach 90 degrees. Hurricane season is June through November, and across the Atlantic most activity comes between mid-August and mid-October.") +
      h.p(`Our ${h.a("/buyers/relocating/hurricanes/", "hurricane page")} lists the storms that have hit this coast and what each one did.`) },

    { h2: "Should you move to Myrtle Beach?", toc: "Should you move?", id: "should-you-move", html: () =>
      h.p(`The move usually works for people who bring their money or their income with them. It is harder for people who need a local salary like the one they had up north. The rest is on our page on ${h.a("/buyers/relocating/pros-and-cons/", "the honest pros and cons of living here year-round")}.`) +
      DECIDE +
      h.h3("One move we helped with") +
      h.p("A family moved here because their oldest child was starting at Coastal Carolina University. The younger child still needed a school.") +
      h.p("The houses they liked sat near the edge of a school zone. The agents checked each address against the district lookup and gave no opinion on any school.") +
      h.p(`We check the ${h.a("/buyers/relocating/schools/", "school zone")} for any address you like, the same way.`) },
  ],
  faqTitle: "Moving to Myrtle Beach FAQ",
  faq: [
    { q: "Is Myrtle Beach the fastest growing city in America?", a: "No, but it is close. The Myrtle Beach area, which is all of Horry County, grew the second fastest of any metro area from mid-2024 to mid-2025, behind Ocala, Florida. The City of Myrtle Beach itself has about 41,000 people." },
    { q: "Are people leaving Myrtle Beach?", a: "Some are. In the latest count, about 9,100 households left Horry County and about 15,000 arrived. Most who leave go nearby, to Georgetown or Charleston County in South Carolina or Brunswick County, North Carolina." },
    { q: "Where do most people moving to Myrtle Beach come from?", a: "About six in seven come from another state, most from the South and the Northeast. The single largest source is Georgetown County, SC. Outside South Carolina, the most come from Suffolk County on Long Island." },
    { q: "Is it cheaper to live in Myrtle Beach?", a: "Homes and property tax usually cost less than in the out-of-state counties most movers come from. Home insurance costs more than in the rest of South Carolina, and local pay is lower." },
    { q: "What is winter like in Myrtle Beach?", a: "Short and mild. A January day averages a high of about 56 degrees and a low of about 37, and snow averages about an inch a year." },
    { q: "Does South Carolina tax Social Security?", a: "No, South Carolina does not tax Social Security. Military retirement pay is not taxed either." },
  ],
  sources: [
    { name: "IRS migration", href: IRS_URL },
    { name: "Census estimates", href: PEP_URL },
    { name: "Census ACS", href: ACS_URL },
    { name: "ACS microdata", href: PUMS_URL },
    { name: "SC projections", href: RFA_URL },
    { name: "BLS QCEW", href: QCEW_URL },
    { name: "Zillow data", href: ZILLOW_URL },
    { name: "OpenFEMA", href: FEMA_URL },
    { name: "NOAA normals", href: NCEI_URL },
    { name: "NWS snowfall", href: SNOW_URL },
    { name: "NOAA hurricanes", href: NHC_URL },
    { name: "NOAA Springmaid Pier", href: NOAA_URL },
    { name: "SC Code 12-6", href: T12_6 },
    { name: "12-16", href: T12_16 },
    { name: "12-37", href: T12_37 },
    { name: "56-3-627", href: T56_3 },
  ],
  sourcesNote: "Households: IRS returns that changed county, latest year. Home values: Zillow, by county. Weather: North Myrtle Beach airport normals. Insurance: our count of Census and FEMA data. Listings: counts from the multiple listing service (MLS). Not tax advice.",
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Thinking about the move?", p: "Tell us where you live now and what you want here. An agent shows you the towns, the homes and the yearly costs that fit.", label: "Ask us about your move", href: "/contact/" },
  keywords: "why is everyone moving to Myrtle Beach, why are people moving to Myrtle Beach, moving to Myrtle Beach, is Myrtle Beach growing, Horry County population growth, where are people moving to Myrtle Beach from, why are people leaving Myrtle Beach, is Myrtle Beach overcrowded, cost of living Myrtle Beach, Myrtle Beach winter, Myrtle Beach pros and cons",
  about: "Moving to Myrtle Beach and Horry County, South Carolina",
});
