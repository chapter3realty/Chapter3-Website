/* /buyers/buying-in-myrtle-beach/ - buying a home in Myrtle Beach: is it a buyer's market (months of supply
 * for condos and houses, by price and by town), what homes cost and cost to own, the South Carolina steps
 * from buyer agreement to recorded deed, buying from another state, and what can go wrong here.
 *
 * Batch 2026-11-a, Lane U. Version 1. The live page was hand-made HTML with no spec; this spec replaces it.
 * Reader, must-answers and plan: Blog-Brain batches/2026-11-a/buyers-buying-in-myrtle-beach/ (must-answer.md, PLAN.md).
 * Facts: facts.md there, VERIFIED and CORRECTED rows only, at their corrected values (VERIFY.md and
 * buyers-buying-in-myrtle-beach-struck.json). Rows 24 (due diligence period) and 39 (days to close) are struck:
 * owner questions 1 and 3; the page prints no contract rule and no total days. Corrections in: houses at
 * $700,000 and up are "near" the buyers' side (row 6); City of Myrtle Beach condos "about a year", houses
 * "5 to 6 months" (row 8, the 65 condo-hotel units and the no-point gap); no "new is cheaper" (row 11); the
 * months of deeds (row 12); "house or other home" (row 13); "another state or country" (row 16); no "do not
 * pay more" (row 17); the FHFA wording of SHV 6 (row 18); "we line up the inspection" (row 25); comparable
 * sales with no named recipient (row 30); business days for the appraisal copy (row 31); "personal or family
 * use" (row 34); "physical presence" (row 37); recording fees in state law (row 38); "the county values"
 * (row 41); $7,850 and $650 (row 44); North Myrtle Beach house $7,670 (row 45); the NMB license wording (row 50).
 * Every chart, table, map and chip is built from the data files, never typed:
 *   data/2026-11-a/buyers-buying-in-myrtle-beach/market.json      rows 4 to 7, 9, 10 (months, price cuts, listing age)
 *   data/2026-11-a/buyers-buying-in-myrtle-beach/town-table.json  rows 8, 14 (towns)
 *   data/2026-11-a/buyers-buying-in-myrtle-beach/new-sales.json   row 11 (builder sales)
 *   data/2026-10-d/sell-home-value/findings.json                   rows 12, 13, 47 (resale prices, months, flood)
 *   data/2026-11-a/buyers-cost-to-own/examples.json                rows 44, 45 (yearly cost; carried C2O 1, 3, 6)
 *   data/2026-11-a/invest-where-to-buy/raw/places.json             Census place outlines for the map
 *   data/2026-11-a/buyers-buying-in-myrtle-beach/photos.json       two photo records (Commons CC BY-SA 2.0; NOAA public domain)
 * Kept from the live page: the owner's headline words "buyer's market" (scoped to what the count shows; NEEDS.md 4),
 * the "Have us look at a property" offer, the links to common mistakes, flooding and market reports (the condo
 * litigation link was cut in review round 1). Review round 1: Blog-Brain batches/2026-11-a/buyers-buying-in-myrtle-beach/REVIEW-1.md. Cut: the lead form above the answer, emoji tiles, golf and sunshine claims, the unsourced growth
 * line (now row 19), the 2030 forecast, the copied condo mistakes, "remote online notarization", the insurance
 * range, "off market listings", "30 to 45 days".
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

const BB = [path.join(__dirname, "..", "tools", "blog-brain-2026-11-a"), path.join(__dirname, "..", "tools", "blog-brain-2026-10-b"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "page-kit.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/page-kit.js)");
const PK = require(path.join(BB, "tools", "page-kit.js"));
const G = require(path.join(BB, "tools", "glass.js"));
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));

const ROOT = path.join(__dirname, "..");
const readJ = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, "data", ...p), "utf8"));
const DIR = ["2026-11-a", "buyers-buying-in-myrtle-beach"];
const MK = readJ(...DIR, "market.json").kinds, TT = readJ(...DIR, "town-table.json").rows, NEW = readJ(...DIR, "new-sales.json");
const SHV = readJ("2026-10-d", "sell-home-value", "findings.json"), EX = readJ("2026-11-a", "buyers-cost-to-own", "examples.json");
const PLACES = readJ("2026-11-a", "invest-where-to-buy", "raw", "places.json").places;

const kit = PK.create({ h, theme: "glass", photos: readJ(...DIR, "photos.json").photos,
  mapDir: path.join(ROOT, "chapter3realty", "images", "maps"), mapSrc: "/images/maps" });
const { glance } = kit;
const ph = kit.photoSet({ aerialWidth: "760px" });

const SELF = "/buyers/buying-in-myrtle-beach/";
const must = (ok, msg) => { if (!ok) throw new Error(`buying-in-myrtle-beach: ${msg}`); };
const usd = (v) => "$" + Math.round(v).toLocaleString("en-US");
const k1 = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const r10 = (v) => "$" + (Math.round(v / 10) * 10).toLocaleString("en-US");
const one = (v) => (Math.round(v * 10) / 10).toFixed(1);

/* ---------- the deciding figures (rows 4 to 7, 9, 10) ---------- */
const HO = MK.house, CO = MK.condo;
must(CO.months_all > 7 && CO.months_all < 8, "[5] condos are no longer about 7.5 months");
must(HO.months_all > 3.5 && HO.months_all < 4.5, "[4] houses are no longer about 4 months");
must(HO.months_new < 3.5, "[4] new houses are no longer about 3 months");
must(HO.pct_price_cut > 50 && CO.pct_price_cut > 50, "[9] 'more than half' cut their price");
must(Math.round(HO.pct_listed_over_90_days / 10) === 4 && CO.pct_listed_over_90_days > 50, "[10] about 4 in 10 houses, more than half of condos");
const TOP = HO.bands.find((b) => b.band === "700000-up");
must(TOP.months_all > 6.5 && TOP.months_all < 7.5 && TOP.months_resale < 7, "[6] $700,000 and up: about 7, resales under 7 (near, not past)");
must(HO.bands.filter((b) => b.band !== "700000-up").every((b) => b.months_all < 5), "[6] houses under $700,000 are all under 5 months");
must(CO.bands.every((b) => b.months_all >= 6.5), "[7] condos 6.5 months or more at every price");
const CONDO_M = one(CO.months_all), HOUSE_M = Math.round(HO.months_all);

/* ---------- Chart 1: months of supply by kind and price (rows 3 to 7) ---------- */
/* Three shades, from the Texas A&M benchmark (row 3): under 5 months sellers have the edge; 5 to 7 is the usual
   local balance; past 7 buyers have room. A group counts as past 7 only when its resales alone are past 7 too
   (verifier, row 6: houses at $700,000 and up are 7.2 in all, 6.8 on resales, "near", not past). */
const CLR = { sell: "#3d6f93", bal: "#b59a77", buy: "#c4783a" };
const cls = (b) => (b.months_all < 5 ? "sell" : b.months_all > 7 && b.months_resale > 7 ? "buy" : "bal");
/* Fix round 1 (critic, reader, owner): the printed number must match its colour. A group past 7 in all but not
   on resales (houses at $700,000 and up: 7.2 and 6.8) prints "about 7", which the key's "5 to 7" covers. */
const shown = (b) => (b.months_all > 7 && cls(b) === "bal" ? "about 7" : one(b.months_all));
const bandName = (band, kind) => {
  const [lo, hi] = band.split("-"), k = (v) => "$" + (+v / 1000) + "K";
  const what = kind === "condo" ? "Condos" : "Houses";
  return hi === "up" ? `${what} ${k(lo)} and up` : +lo === 0 ? `${what} under ${k(hi)}` : `${what} ${k(lo)} to ${k(hi)}`;
};
const SCALE = 10; /* months at the right edge; every value is under it */
must([...HO.bands, ...CO.bands].every((b) => b.months_all < SCALE), "a band passes the chart's scale");
const barRow = (name, b, o = {}) => {
  const c = cls(b);
  return `<li class="bm-r${o.all ? " bm-all" : ""}"><span class="bm-n">${name}</span><span class="bm-t"><span class="bm-k"><i class="bm-b ${c}" style="width:${(b.months_all / SCALE * 100).toFixed(1)}%"></i></span>`
    + `<b class="bm-v">${shown(b)}<small> months</small></b></span></li>`;
};
const CHART_CSS = "<style>"
  + "main#main .bm{max-width:760px;margin:1.5rem 0 1.6rem;padding:1.1rem 1.1rem 1rem;border-radius:22px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.8);box-shadow:0 18px 40px -26px rgba(28,32,40,.35);backdrop-filter:blur(16px) saturate(140%);-webkit-backdrop-filter:blur(16px) saturate(140%);box-sizing:border-box}"
  + "main#main .bm .cap{display:block;font-family:var(--sans);font-weight:700;color:var(--navy);font-size:1.05rem;line-height:1.35;margin:0 0 .7rem}"
  + "main#main .bm-key{list-style:none;margin:0 0 .9rem;padding:0;display:flex;flex-wrap:wrap;gap:.35rem 1rem;font-family:var(--sans);font-size:.95rem;line-height:1.35;color:var(--navy)}"
  + "main#main .bm-key li{margin:0;display:flex;align-items:center;gap:.4rem}main#main .bm-key i{flex:0 0 auto;width:.95rem;height:.95rem;border-radius:4px}"
  + "main#main .bm h3.bm-g{font-family:var(--sans)!important;font-size:.82rem!important;letter-spacing:.12em;text-transform:uppercase;color:#8a5226!important;font-weight:700;margin:.6rem 0 .35rem!important}"
  + "main#main .bm ol{list-style:none;margin:0;padding:0;display:grid;gap:.55rem}"
  + "main#main .bm-r{margin:0;display:grid;grid-template-columns:minmax(0,15rem) minmax(0,1fr);align-items:center;gap:.2rem .9rem;font-family:var(--sans);color:var(--navy)}"
  + "main#main .bm-n{font-size:1rem;line-height:1.3}main#main .bm-all .bm-n{font-weight:700}"
  + "main#main .bm-t{display:grid;grid-template-columns:minmax(0,1fr) 7.4rem;align-items:center;gap:.5rem}"
  /* the track: the bar's scale (the 5 to 7 shading and its key entry are cut, owner reviewer round 1) */
  + "main#main .bm-k{position:relative;display:flex;align-items:center;min-height:1.6rem}"
  + "main#main .bm-b{display:block;height:1.05rem;border-radius:999px;min-width:.6rem}main#main .bm-all .bm-b{height:1.35rem}"
  + `main#main .bm-b.sell,main#main .bm-key i.sell{background:${CLR.sell}}main#main .bm-b.bal,main#main .bm-key i.bal{background:${CLR.bal}}main#main .bm-b.buy,main#main .bm-key i.buy{background:${CLR.buy}}`
  + "main#main .bm-v{white-space:nowrap;font-size:1rem;font-weight:700}main#main .bm-v small{font-size:.9rem;font-weight:500;color:var(--muted)}"
  + "main#main .bm figcaption{margin-top:.85rem;color:var(--muted);font-size:.95rem;line-height:1.55}"
  + "@media (max-width:599px){main#main .bm{padding:1rem .85rem .9rem}main#main .bm-r{grid-template-columns:1fr;gap:.15rem}main#main .bm ol{gap:.7rem}}"
  + "</style>";
const SUPPLY_CHART = CHART_CSS
  + `<figure class="bm" role="group" aria-label="Months of homes for sale at the past year's pace of sales, Horry County, condos and houses by price">`
  + `<span class="cap">Horry County: how many months it would take to sell every home for sale</span>`
  + `<ul class="bm-key" role="list"><li><i class="sell"></i>Sellers have the edge (under 5)</li><li><i class="bal"></i>Balanced (5 to 7)</li><li><i class="buy"></i>Buyers have room (over 7)</li></ul>`
  + `<h3 class="bm-g">Condos</h3><ol>` + barRow("All condos", CO, { all: true }) + CO.bands.map((b) => barRow(bandName(b.band, "condo"), b)).join("") + `</ol>`
  + `<h3 class="bm-g">Houses</h3><ol>` + barRow("All houses", HO, { all: true }) + HO.bands.map((b) => barRow(bandName(b.band, "house"), b)).join("") + `</ol>`
  + `<figcaption>How long the homes for sale today would take to sell at the past year's pace, across Horry County. Builders' sales are counted. Houses include townhouses and manufactured homes.</figcaption></figure>`;
const CONDO_UNDER7 = CO.bands.filter((b) => b.months_all < 7).length;
must(CONDO_UNDER7 === 2 && CO.months_all > 7, "[7] two condo price ranges just under 7, all condos past 7");

/* ---------- the towns (rows 8, 14) ---------- */
must(TT.length === 10, "the town table has ten towns");
const T = Object.fromEntries(TT.map((t) => [t.town, t]));
/* Row 8 (verifier): the City of Myrtle Beach's 65 condo-hotel units in the house group and the 6 percent no-point
   gap move its figures, so the page prints ranges for the city, never the file's single values. */
must(T["Myrtle Beach"].condo.months_resale > 11 && T["Myrtle Beach"].condo.months_resale < 13, "[8] city condos are no longer about a year");
must(T["Myrtle Beach"].house.months_resale > 5 && T["Myrtle Beach"].house.months_resale < 6, "[8] city houses are no longer 5 to 6 months");
const OVERRIDE = { "Myrtle Beach": { house: "5 to 6 months", condo: "about a year" } };
const GUIDE = { "Myrtle Beach": "/submarkets/myrtle-beach/", "North Myrtle Beach": "/submarkets/north-myrtle-beach/", "Surfside Beach": "/submarkets/surfside-beach/",
  "Garden City": "/submarkets/garden-city/", "Little River": "/submarkets/little-river/", "Carolina Forest": "/submarkets/carolina-forest/", Conway: "/submarkets/conway/" };
const monthsCell = (t, k) => (OVERRIDE[t.town] && OVERRIDE[t.town][k]) || (t[k] && t[k].months_resale ? `${one(t[k].months_resale)} months` : "Too few sales");
const priceCell = (t, k) => (t[k] && t[k].median_resale && t[k].resales_priced >= 20 ? k1(t[k].median_resale) : "Too few sales");
/* The town table: one row a town, houses and condos side by side (a phone keeps the three columns; the
   card form of compareCards was three phone screens long). The dot beside each supply uses the chart's shades. */
const cell = (t, k) => {
  const m = t[k] && t[k].months_resale, dot = m ? `<i class="tt-d ${cls({ months_all: m, months_resale: m })}" aria-hidden="true"></i>` : "";
  const pr = priceCell(t, k);
  /* Fix round 1 (reader): a price beside "Too few sales" read as a contradiction. With no supply count, the
     whole cell says "Too few sales". */
  return pr === "Too few sales" || !m ? `<td><span>Too few sales</span></td>` : `<td><b>${pr}</b><span>${dot}${monthsCell(t, k)}</span></td>`;
};
const TOWN_TABLE = "<style>main#main .tt{max-width:760px;margin:1.2rem 0 .6rem;border-radius:20px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.8);box-shadow:0 18px 40px -26px rgba(28,32,40,.35);padding:.6rem .9rem .4rem;box-sizing:border-box}"
  + "main#main .tt table{width:100%;border-collapse:collapse;font-family:var(--sans);color:var(--navy)}"
  + "main#main .tt caption{text-align:left;font-weight:700;font-size:1.05rem;line-height:1.35;padding:.4rem 0 .6rem;caption-side:top}"
  + "main#main .tt th,main#main .tt td{text-align:left;vertical-align:top;padding:.55rem .35rem;border-bottom:1px solid rgba(28,32,40,.1);font-size:1rem;line-height:1.35}"
  + "main#main .tt thead th{font-size:.85rem;letter-spacing:.06em;text-transform:uppercase;color:#8a5226;border-bottom:2px solid rgba(28,32,40,.16)}"
  + "main#main .tt tbody th{font-weight:600}main#main .tt tbody tr:last-child>*{border-bottom:0}"
  + "main#main .tt td b{display:block;font-weight:700}main#main .tt td span{display:flex;align-items:center;gap:.35rem;color:var(--muted);font-size:.95rem;white-space:nowrap}"
  + `main#main .tt-d{flex:0 0 auto;width:.7rem;height:.7rem;border-radius:50%}main#main .tt-d.sell{background:${CLR.sell}}main#main .tt-d.bal{background:${CLR.bal}}main#main .tt-d.buy{background:${CLR.buy}}`
  /* a phone: fixed columns, and the supply line may wrap under its dot (critic round 1: the table ran 39 px
     past a 320 px screen) */
  + "@media (max-width:420px){main#main .tt{padding:.5rem .55rem .3rem}main#main .tt table{table-layout:fixed}main#main .tt th,main#main .tt td{padding:.5rem .2rem;font-size:.92rem;overflow-wrap:break-word}"
  + "main#main .tt thead th{font-size:.75rem;letter-spacing:.04em}main#main .tt td span{font-size:.85rem;gap:.25rem;white-space:normal;align-items:flex-start}main#main .tt-d{margin-top:.3rem}"
  + "main#main .tt thead th:first-child,main#main .tt tbody th{width:35%}main#main .tt tbody th{font-size:.86rem;overflow-wrap:normal}}</style>"
  + `<div class="tt"><table><caption>Middle resale price and months of supply, by town</caption>`
  + `<thead><tr><th scope="col">Town</th><th scope="col">Houses</th><th scope="col">Condos</th></tr></thead><tbody>`
  + TT.map((t) => `<tr><th scope="row">${GUIDE[t.town] ? h.a(GUIDE[t.town], t.town) : t.town}</th>${cell(t, "house")}${cell(t, "condo")}</tr>`).join("")
  + `</tbody></table></div>`;
const HOUSE_LOW = TT.filter((t) => t.house.months_resale < 4).map((t) => t.town);
must(["Carolina Forest", "Forestbrook", "Surfside Beach", "Little River", "Red Hill"].every((t) => HOUSE_LOW.includes(t)) && HOUSE_LOW.length === 5, "[8] the five towns under 4 months changed");
const GC = T["Garden City"];
must(GC.house.months_resale > 9 && GC.house.months_resale < 10, "[8] Garden City houses are no longer about 9 months");
const CONDO_MOST = TT.filter((t) => t.condo.months_resale).sort((a, b) => b.condo.months_resale - a.condo.months_resale)[0].town;
must(CONDO_MOST === "Myrtle Beach", "[8] the city no longer has the most condo supply");

/* The map: each town's Census outline (places.json), numbered as in the table, shaded by its house supply
   with the chart's three shades. Myrtle Beach's 5 to 6 months reads "balanced", as the table says. */
const MAP = (() => {
  const ring = (rings) => {
    let best = null, ba = 0;
    for (const r of rings) { let a = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); if (Math.abs(a) > ba) { ba = Math.abs(a); best = r; } }
    let s = best; while (s.length > 390) s = s.filter((_, i) => i % 2 === 0);
    return s;
  };
  const areas = TT.map((t, i) => { const p = PLACES.find((x) => x.name === t.census_place); must(p, `no outline for ${t.census_place}`); return { name: t.town, polygon: ring(p.rings), mark: String(i + 1) }; });
  const m = regionMap({ name: "Ten towns and communities on the Grand Strand", areas, areaLabels: "numbers", maxRatio: 0.8 }, { glass: true });
  let svg = m.svg;
  const g = svg.match(/<g class="ar"[^>]*>([\s\S]*?)<\/g>/);
  must(g, "the map's area group is missing");
  const paths = g[1].match(/<path [^>]*\/>/g);
  must(paths && paths.length === TT.length, "the map has a different number of outlines");
  const recol = `<g class="ar" stroke-width="1.6" stroke-linejoin="round">` + paths.map((p, i) => {
    const c = CLR[cls({ months_all: TT[i].house.months_resale, months_resale: TT[i].house.months_resale })];
    return p.replace(/ fill="[^"]*"/, "").replace(/ stroke="[^"]*"/, "").replace("<path ", `<path fill="${c}" fill-opacity=".5" stroke="${c}" `);
  }).join("") + "</g>";
  svg = svg.replace(g[0], recol);
  must(svg.length < 70000, `the map is ${svg.length} bytes`);
  const alt = "Map of the Grand Strand from Little River to Garden City and inland to Conway, with ten towns and communities numbered as in the table below and shaded by their months of houses for sale: blue under 5 months, sand 5 to 7, brass over 7.";
  const html = svg.replace(/aria-label="[^"]*"/, `aria-label="${alt}"`).replace("<svg ", '<svg style="display:block;width:100%;height:auto" ');
  const key = `<ol class="c3b-key" role="list" aria-label="Map key">` + TT.map((t, i) => `<li><b>${i + 1}</b>${t.town}</li>`).join("") + `</ol>`;
  return `<div class="c3b-map">` + h.figure(html, `Each town is shaded by how long its houses for sale would take to sell, in the chart's colors. The outlines are the Census Bureau's town and community lines. ${m.credit}`) + key + `</div>`;
})();
const MAP_CSS = "<style>main#main .c3b-map{max-width:760px}main#main .c3b-map figure{margin:1.2rem 0 .5rem!important}"
  + "main#main .c3b-key{list-style:none;margin:0 0 1.2rem;padding:0;display:flex;flex-wrap:wrap;gap:.3rem .9rem;font-family:var(--sans);font-size:1rem;line-height:1.4;color:var(--navy)}"
  + "main#main .c3b-key li{margin:0;display:flex;align-items:center;gap:.35rem}main#main .c3b-key b{display:inline-flex;align-items:center;justify-content:center;width:1.5rem;height:1.5rem;border-radius:50%;background:#fff;border:1.5px solid var(--navy);font-size:.85rem}</style>";

/* ---------- prices and the yearly cost (rows 11, 13, 44, 45) ---------- */
const RES = SHV.county_all;
must(RES.resale_house.median === 350000 && RES.resale_condo.median === 215000, "[13] the county's middle resale prices changed");
const BUILDER_SHARE = NEW.builder_sales / NEW.kept_deeds;
must(BUILDER_SHARE > 0.25 && BUILDER_SHARE < 0.33, "[11] builders no longer sold more than 1 in 4");
const NEW_HOUSE = NEW.builder_median_price_by_kind.house;
must(NEW_HOUSE === 330000, "[11] the middle builder sale is no longer $330,000");
const WX = EX.worked_example.unincorporated, CX = EX.worked_example.condo_unincorporated;
must(Math.round(WX.total / 10) * 10 === 7850 && Math.round(WX.total_per_month / 10) * 10 === 650 && WX.hoa_yearly === 1200, "[44] $7,850, $650 and the $1,200 HOA fee (C2O 1 corrected)");
must(Math.round(CX.total / 10) * 10 === 10170 && CX.hoa_yearly / CX.total > 0.74 && CX.hoa_yearly / CX.total < 0.8, "[45] $10,170, three quarters the condo fee");
const pick = (k, place) => EX[k].find((r) => r.place === place);
const YR = [["Myrtle Beach", "condo"], ["Myrtle Beach", "house"], ["North Myrtle Beach", "condo"], ["North Myrtle Beach", "house"]]
  .map(([p, k]) => ({ p, k, r: pick(k === "condo" ? "condos" : "houses", p) }));
must(YR.every((y) => y.r), "[45] a town is missing from examples.json");
must(Math.round(YR[0].r.total_legal_residence / 10) * 10 === 11490 && Math.round(YR[1].r.total_legal_residence / 10) * 10 === 8210
  && Math.round(YR[2].r.total_legal_residence / 10) * 10 === 11240 && Math.round(YR[3].r.total_legal_residence / 10) * 10 === 7670, "[45] C2O 6 corrected values changed");
const YEAR_CHART = G.bars(YR.map((y) => ({ name: `${y.k === "condo" ? "Condo" : "House"} in ${y.p}`, value: y.r.total_legal_residence,
  valueText: r10(y.r.total_legal_residence), feature: `middle price ${k1(y.r.middle_price)}`, reference: y.k === "house" })),
  { caption: "Yearly cost to own the middle condo or house, not counting the mortgage", nameLabel: "Home", featureLabel: "middle resale price", valueLabel: "yearly cost",
    max: Math.max(...YR.map((y) => y.r.total_legal_residence)) * 1.15, note: "For an owner who lives in the home: property tax, the county fee where it applies, insurance, the HOA or condo fee and upkeep.", compact: true });
/* F3: in Myrtle Beach the middle condo costs less than half as much to buy as the middle house. */
must(YR[0].r.middle_price / YR[1].r.middle_price < 0.5 && YR[2].r.middle_price / YR[3].r.middle_price >= 0.5, "[F3] only in Myrtle Beach is the condo under half the house's price");

/* ---------- the steps (rows 20 to 23, 25 to 38, 40 to 43) ---------- */
/* Fix round 1 (owner reviewer): each step says what happens and what we do. Cut as detail a buyer does not
   need: the trust account, the recording fees, the appraisal-at-closing waiver, the disclosure law's wording,
   who may issue a CL-100 (kept in the FAQ), the MLS rule, the notary law. The appraisal story moved to
   "What can go wrong". The 2025 deadline is cut; the city tax figures are in the FAQ only. */
const STEPS = [
  { t: "Sign a buyer agreement with your agent",
    p: "In South Carolina, no firm represents you as your agent until you both sign a written agreement that says so. We sign it with you before your first tour.",
    we: "It states what your agent is paid. That fee is negotiable, and a seller may still offer to pay it." },
  { t: "Choose a home and make an offer",
    p: `Before you offer, we find the home's flood zone and get an insurance quote for the address, if you buy with Chapter3. You can sign the offer by e-signature from anywhere; South Carolina law counts it the same as ink.` },
  { t: "Inspect the home and read the papers",
    p: "In South Carolina, inspecting the home is the buyer's job. We line up the inspection.",
    we: `The seller of most resale houses must give you the state's disclosure form before you sign. For a condo, we get the HOA papers and the rental rules.` },
  { t: "The loan and the appraisal",
    p: "Within three business days of your application, your lender must send a Loan Estimate, a form that lists the loan's terms and costs.",
    we: "You get a free copy of the appraisal as soon as it is done." },
  { t: "The closing attorney",
    p: "A South Carolina attorney supervises the title search, the loan papers, the closing and the recording of the deed. With a home loan for personal or family use, the lender must ask which attorney you want and follow your choice.",
    we: "We work with several closing attorneys and can recommend them once we are working with you. At least three business days before closing, your lender sends the Closing Disclosure: the loan's final terms and costs." },
  { t: "Closing, here or from home",
    p: "You can sign at the attorney's office. From another state, you can sign the deed papers and the mortgage before a notary where you live, with two witnesses." },
  { t: "The deed is recorded in Conway",
    p: `The deed and mortgage are recorded at the Horry County Register of Deeds in Conway. The seller pays the state's deed fee. To look up a recorded deed, use our ${h.a("/buyers/property-records/", "Horry County property lookup")}.`,
    we: `${h.a("/buyers/closing-costs/", "What the buyer pays at closing")} is listed fee by fee on its own page.` },
  { t: "Apply for the 4&nbsp;percent tax rate",
    p: `A home you live in and apply for is taxed on 4 percent of its value; a second home or a rental on 6 percent. The 4 percent rate is not automatic: you ${h.a("/buyers/property-taxes/", "apply to the county")} after you buy.`,
    we: `On a house the county values at $350,000 outside the cities, the current tax is about $1,290 a year at 4 percent and about $4,220 at 6 percent. A sale resets the county's value, so the seller's tax bill is not yours.` },
];
const STEP_CSS = "<style>"
  + "main#main .bs{list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:760px;position:relative}"
  + "main#main .bs::before{content:\"\";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.16)}"
  + "main#main .bs>li{position:relative;margin:0 0 .7rem;padding:0 0 0 3.1rem}"
  + "main#main .bs .n{position:absolute;left:0;top:.75rem;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem}"
  + "main#main .bs li.hot .n{background:#c4783a}"
  + "main#main .bs .c{display:block;padding:.85rem 1rem .9rem;border-radius:16px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.8);box-shadow:0 10px 26px -20px rgba(28,32,40,.35);color:var(--muted);line-height:1.6}"
  + "main#main .bs li.hot .c{border:2px solid #c4783a;background:#fff}"
  + "main#main .bs h3{display:block;color:var(--navy)!important;font-family:var(--sans)!important;font-size:1.1rem!important;line-height:1.35;margin:0 0 .3rem!important;font-weight:700;text-wrap:balance}"
  + "main#main .bs p{margin:0 0 .45rem;max-width:none}main#main .bs p:last-child{margin-bottom:0}"
  + "main#main .bs .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}"
  /* a phone: no side rail, the number inside the card beside its heading, the text the card's full width */
  + "@media (max-width:599px){main#main .bs::before{display:none}main#main .bs>li{padding:0}"
  + "main#main .bs .n{left:.9rem;top:.8rem;width:1.9rem;height:1.9rem;font-size:.9rem}"
  + "main#main .bs h3{display:flex!important;align-items:center;min-height:1.9rem;padding-left:2.5rem}main#main .bs .c{padding:.8rem .95rem .85rem}}"
  + "</style>";
const STEP_LIST = STEP_CSS + `<ol class="bs">` + STEPS.map((s, i) => `<li${i === 4 || i === 7 ? ' class="hot"' : ""}><div class="c"><h3><span class="n">${i + 1}</span><span class="sr"> Step ${i + 1}: </span>${s.t}</h3><p>${s.p}</p>${s.we ? `<p>${s.we}</p>` : ""}</div></li>`).join("") + `</ol>`;

/* ---------- what can go wrong (rows 46 to 51) ---------- */
const FL = SHV.flood.by_type;
must(Math.round(FL.condo.n / FL.condo.in_sfha) === 4 && Math.round(FL.house.n / FL.house.in_sfha) === 15, "[47] 1 in 4 condos, 1 in 15 houses");
/* Fix round 1: plain words for rows 48 and 51 (F5), the flood policy cost (F4), the links folded into the
   sentence that states the fact, a "we" line on every card, and the story low-appraisal-reconsideration as its
   own card (owner reviewer). Cards are paired by length so no card has a tall empty space. */
const RISKS = [
  { k: "Flood zone", t: `About 1 in 4 condos and 1 in 15 houses resold in Horry County in the past year sat in FEMA's high-risk flood zone. There, most mortgages require flood insurance. For a house you live in there, a federal flood policy cost a middle of about $1,070 a year.`,
    w: `We find the zone before you offer, and look for ${h.a("/buyers/undisclosed-flooding/", "past flooding")} too.` },
  { k: "Insurance", t: `The middle owner of a one-family house here pays about $2,000 a year for ${h.a("/buyers/coastal-insurance/", "home insurance")}, about 40 percent more than in the rest of South Carolina. A condo owner pays about $800 for their own policy.`,
    w: "We get a quote for the address before you offer, if you buy with us." },
  { k: "The second-home tax rate", t: "If you never apply for the 4 percent rate, your home is taxed at 6 percent, as a second home is: about three times the tax (step 8).",
    w: "We work out the tax at both rates on any address you send." },
  { k: "A low appraisal", t: "In our experience, low appraisals are rare here.",
    w: "When one comes in low, we send comparable sales with a request to look at the value again. Once, the value changed and the borrower brought less to closing." },
  { k: "Nightly rentals", t: `Inside the City of Myrtle Beach, a rental under 90 days is legal only where the zoning allows it. About 3 in 4 condos are in such zones; about 96 in 100 houses are not. In North Myrtle Beach a ${h.a("/invest/str-rules/", "short-term rental")} needs a business license, and for now there is no special zoning or permit process beyond it.`,
    w: "We read the zoning and the HOA papers before you offer." },
  { k: "Condos run like hotels", t: `Fannie Mae, which backs many ordinary home loans, will not back one in a building run like a hotel. Signs include a front desk, daily cleaning, or a rule that owners join the rental program. Buyers there need a ${h.a("/invest/condotel-financing/", "different loan")} or cash.`,
    w: "We read the building's rules before you offer, so you know which loans can work there." },
];
const RISK_CSS = "<style>main#main .br{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.65rem;max-width:760px}"
  + "@media (min-width:700px){main#main .br{grid-template-columns:repeat(2,minmax(0,1fr))}main#main .br li:last-child:nth-child(odd){grid-column:1/-1}}"
  + "main#main .br li{margin:0;padding:1rem 1.1rem;border-radius:18px;background:rgba(255,255,255,.62);border:1px solid rgba(255,255,255,.8);box-shadow:0 10px 26px -20px rgba(28,32,40,.35);color:var(--muted);line-height:1.6}"
  + "main#main .br h3{display:block;color:var(--navy)!important;font-family:var(--sans)!important;font-size:1.1rem!important;line-height:1.35;margin:0 0 .3rem!important;font-weight:700}"
  + "main#main .br p{margin:0;max-width:none}main#main .br p.w{margin-top:.55rem;padding-top:.55rem;border-top:1px solid rgba(28,32,40,.1);color:var(--navy);font-weight:600}"
  + "main#main .br p.w a{font-weight:600}</style>";
const RISK_LIST = RISK_CSS + `<ul class="br" role="list">` + RISKS.map((r) => `<li><h3>${r.k}</h3><p>${r.t}</p><p class="w">${r.w}</p></li>`).join("") + `</ul>`;

/* ---------- out of state (rows 16, 17, 19) ---------- */
const STAT_CSS = "<style>main#main .bo{list-style:none;margin:1.1rem 0 1.3rem;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.65rem;max-width:760px}"
  + "main#main .bo li{margin:0;padding:1rem 1rem .95rem;border-radius:18px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));color:rgba(244,239,232,.92);line-height:1.45;font-family:var(--sans);font-size:1rem}"
  + "main#main .bo strong{display:block;color:#d4894a;font-family:var(--serif);font-size:clamp(1.7rem,6.5vw,2.2rem);line-height:1.05;margin-bottom:.35rem;font-weight:600}</style>";
const OOS = STAT_CSS + `<ul class="bo" role="list"><li><strong>3 in 10</strong>homes sold went to a buyer with a tax bill in another state or country</li><li><strong>Over half</strong>of condos sold went to such a buyer</li></ul>`;

/* ---------- mid-page offers (CRAFT 3): each tied to the section before it, each in its own words ---------- */
const offerBox = (title, text, label, topic) => `<div class="bx"><p class="bx-t">${title}</p><p>${text}</p><p class="bx-b"><a class="btn btn-brass" href="/contact/" data-topic="${topic}">${label}</a></p></div>`;
const OFFER_CSS = "<style>main#main .bx{max-width:760px;margin:1.8rem 0 .4rem;padding:1.2rem 1.3rem;border-radius:20px;background:rgba(255,255,255,.7);border:1px solid rgba(196,120,58,.45);box-shadow:0 18px 40px -28px rgba(28,32,40,.4)}"
  + "main#main .bx p{color:var(--muted);line-height:1.65;margin:0 0 .8rem}main#main .bx .bx-t{color:var(--navy);font-family:var(--sans);font-weight:700;font-size:1.15rem;line-height:1.35;margin:0 0 .35rem}"
  + "main#main .bx .bx-b{margin:0}"
  /* no single word alone on a heading's last line */
  + "main#main h2,main#main h3,main#main a.btn{text-wrap:balance}"
  + "main#main .c3-glance li{line-height:1.45!important}main#main .c3-glance strong{font-size:.95rem!important}main#main .c3-glance span.t{font-size:1.1rem!important;font-weight:700;color:var(--navy)!important}"
  /* one right edge for every block on a wide screen (critic round 1: 774 to 1014 px) */
  + "main#main .c3-gchart{max-width:760px}"
  /* The closing offer. The site's "Just listed" strip (div.hx-wrap) is added after it inside <main> at run time,
     so glass.js's compact rule (navy band :not(:last-child)) turns it into a light bar while its text stays
     ivory (critic round 1). Until the lead fixes the shared rule (NEEDS.md 13), the last navy band keeps its
     dark panel here. */
  + "main#main>section[style^=\"background:var(--navy)\"]:last-of-type:not(:first-of-type)>.wrap{display:block;text-align:center!important;"
  + "background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14);"
  + "box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6);border-radius:28px;padding:2.2rem 1.6rem;margin-left:auto!important;margin-right:auto!important;max-width:720px}"
  + "main#main>section[style^=\"background:var(--navy)\"]:last-of-type:not(:first-of-type)>.wrap>a.btn{padding:.85rem 1.6rem}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:last-of-type:not(:first-of-type)>.wrap{padding:1.6rem 1.2rem 1.7rem;border-radius:24px}}"
  + "</style>";

/* ---------- design pass 2026-11-08 (redo2/buyers-buying-in-myrtle-beach/DESIGN.md) ----------
   A two-line headline, a contents list without a card, one card style (the charts, the map and the offers),
   open lists and a plain table, flat out-of-state numbers, and on a wide screen each photo beside its text. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = "<style>"
  /* 1. the italic line at about half the H1's size; on a phone the tiles are flat rows under thin rules */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* 2. the contents list: no card, in columns between two thin rules; the FAQ link takes the last row */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}${S} nav[aria-label="On this page"] li:last-child:nth-child(odd){grid-column:1/-1}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{grid-template-columns:repeat(3,minmax(0,1fr))}${S} nav[aria-label="On this page"] li:last-child{grid-column:1/-1}}`
  /* 3. open steps: the rail and the numbered dots stay, the cards go; steps 5 and 8 keep their brass dot */
  + `${S} .bs .c,${S} .bs li.hot .c{${FLAT};padding:.45rem 0 .9rem!important}${S} .bs .n{top:.3rem!important}`
  + `@media (max-width:599px){${S} .bs>li{border-top:${RULE};margin:0}${S} .bs>li:last-child{border-bottom:${RULE}}${S} .bs .c,${S} .bs li.hot .c{padding:.8rem 0 .85rem!important}${S} .bs .n{left:0!important;top:.8rem!important}}`
  /* the six risks: an open list, each item under a thin rule, two columns on a wide screen */
  + `${S} .br{gap:0 2rem!important}${S} .br li{${FLAT};border-top:${RULE}!important;padding:.9rem 0 1rem!important}`
  + `${S} .br p.w{border-top:0!important;padding-top:0!important}`
  /* the town table: a plain table under thin rules */
  + `${S} .tt{${FLAT};padding:0!important}${S} .tt th:first-child{padding-left:0}`
  /* the photos without a frame */
  + `${S} .c3-aerial figure{${FLAT};padding:0!important}${S} .c3-aerial figure figcaption{padding:.5rem 0 0!important}`
  /* 4. the two out-of-state numbers, flat between thin rules */
  + `${S} .bo{gap:0 1.6rem!important}${S} .bo li{background:none!important;border-radius:0!important;border-top:${RULE};border-bottom:${RULE};padding:.85rem 0 .9rem!important;color:var(--navy)!important}${S} .bo strong{color:#8a5226!important}`
  + `@media (max-width:599px){${S} .bo{grid-template-columns:1fr!important}${S} .bo li{display:grid;grid-template-columns:7.6rem minmax(0,1fr);align-items:center;gap:.8rem}${S} .bo li+li{border-top:0}${S} .bo strong{margin:0!important}}`
  /* 5. on a wide screen, each photo beside the paragraphs it goes with; below 1,100 px the order is as before */
  + `@media (min-width:1100px){${S} .c3b-side{display:grid;grid-template-columns:minmax(0,665px) minmax(0,1fr);column-gap:2.5rem;align-items:start}`
  + `${S} .c3b-side>*{grid-column:1}${S} .c3b-side>.c3-aerial{grid-column:2;grid-row:1/span 5}${S} .c3b-side .c3-aerial figure{margin:.35rem 0 0!important;max-width:none!important}}`
  /* critic 2026-11-08: the open steps run about 91 characters a line; hold them to the text measure */
  + `${S} .bs p{max-width:660px!important}`
  /* critic 2026-11-08: from 1,000 to 1,100 px the header's phone number pushed the page 5 px past the window (the same fix as /invest/condos/) */
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone-num{display:none}}"
  + "</style>";

/* ---------- photos (photos.json; each looked at full size) ---------- */
const PH_BEACH = ph.aerial("myrtle-beach-skywheel-beach", `The beach beside the SkyWheel in downtown Myrtle Beach, inside city limits.`);
/* Fix round 1 (owner reviewer): a new frame from the same NOAA tile, so this page no longer repeats the
   picture on /buyers/cost-to-own/ (F6). */
const PH_STREET = ph.aerial("carolina-forest-houses-and-ponds-from-above", `Houses around ponds in Carolina Forest, outside city limits, seen from above. The middle resale house there sold for about ${k1(T["Carolina Forest"].house.median_resale)}.`);

/* ---------- sources a reader can open ---------- */
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const TRERC = "https://trerc.tamu.edu/wp-content/uploads/files/PDFs/Articles/1897.pdf";
const FHFA = "https://www.fhfa.gov/data/hpi";
const POPEST = "https://www.census.gov/programs-surveys/popest.html";
const T40_57 = "https://www.scstatehouse.gov/code/t40c057.php";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const DOE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const CFPB_LE = "https://www.consumerfinance.gov/ask-cfpb/what-is-a-loan-estimate-en-1995/";
const NAR = "https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers";
const REG27 = "https://www.scstatehouse.gov/coderegs/Chapter%2027.pdf";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "Buying in Myrtle Beach: Is It a Buyer's Market? | Chapter3",
  description: "Is Myrtle Beach a buyer's market? Months of supply for condos and houses by price and town, what homes cost, and the South Carolina steps from offer to deed.",
  ogTitle: "Buying in Myrtle Beach: a buyer's market for condos, not yet for houses",
  crumb: "Buying in Myrtle Beach",
  eyebrow: "Buyer's guide",
  h1: "Buying in Myrtle Beach:",
  h1em: "a buyer's market for condos, not yet for houses.",
  sub: "Condos have room to bargain; most houses do not yet. The counts by price and town, what a home costs to own, and the South Carolina steps to buy.",
  heroMedia: glance([
    { icon: "calendar", label: "Time to sell, county condos", text: `${CONDO_M} months` },
    { icon: "home", label: "Time to sell, county houses", text: `about ${HOUSE_M} months` },
    { icon: "dollar", label: "Homes with a price cut", text: "over half" },
  ]),
  heroCta: { title: "Want the numbers on one home before you offer?", label: "Have us look at a property", href: "/contact/?topic=buying-in-myrtle-beach" },
  author: "devin",
  /* Fix round 1: the county figures are named as the county's (critic, reader); the price-cut fact is said in
     the hero tile and section 1 only (owner reviewer). */
  shortAnswer: [
    `Across Horry County, the Myrtle Beach area, it is a buyer's market for condos. The condos for sale would take about ${CONDO_M} months to sell at the past year's pace.`,
    `Houses would take about ${HOUSE_M} months, so sellers still have a slight edge. Houses at $700,000 and up are near the point where buyers gain the edge. Inside the City of Myrtle Beach, condos have about a year of supply.`,
  ],
  sections: [
    { h2: "Is Myrtle Beach a buyer's market right now?", toc: "Is it a buyer's market?", id: "buyers-market", html: () =>
      OFFER_CSS + ph.css() + MAP_CSS + DESIGN_CSS +
      h.p(`For condos, yes. For most houses, not yet. The test is months of supply: how long it would take to sell every home for sale if sales kept the past year's pace.`) +
      h.p(`Housing researchers count 5 to 7 months as balanced in a local market. Past 7, buyers have room to bargain; under 5, sellers have the edge.`) +
      SUPPLY_CHART +
      h.p(`Condos as a whole are past 7 months; two condo price ranges sit just under 7, at the top of balanced. On a condo there is room to ask for a lower price or for repairs. On a house under $700,000 there is less room: those houses would sell out in about half the time.`) +
      `<div class="c3b-side">` + h.p(`Sellers already feel it. More than half of the homes for sale have cut their asking price. About 4 in 10 houses and more than half of condos for sale have been listed more than 90 days.`) +
      PH_BEACH +
      h.p(`${h.a("/market-reports/", "House prices")} have stopped climbing. A federal index of Horry County house prices rose about 51 percent in four years, then was about flat in the latest year. It tracks houses, not condos.`) +
      h.p(`Sales follow the season. Recorded resales were fewest in January and February, about 430 houses a month, and were about 620 to 670 a month from May to October.`) + `</div>` },

    { h2: "Where in Myrtle Beach do buyers have the most room to negotiate?", toc: "Town by town", id: "by-town", html: (bg) =>
      h.p(`Condos in the City of Myrtle Beach have the most supply of any town here. Houses in ${HOUSE_LOW.slice(0, -1).join(", ")} and ${HOUSE_LOW.at(-1)} have under 4 months.`) +
      h.p(`Many buyers say "Myrtle Beach" for the whole coast. The map and the table split it into ten towns and communities, from Little River to Garden City and inland to Conway.`) +
      MAP + TOWN_TABLE +
      h.p(`Garden City has the most supply of houses, about ${Math.round(GC.house.months_resale)} months, but more than half of them are manufactured homes. "Too few sales" marks a town with too few resales of that kind to count.`) +
      offerBox("How much room is there on the home you like?", "Send us the address. An agent pulls the nearby sales and how long homes like it have sat on the market, so you know where to start your offer.", "Have us price one home", "buying-in-myrtle-beach-offer") },

    { h2: "How much does a house or condo cost in Myrtle Beach?", toc: "What homes cost", id: "prices", html: () =>
      `<div class="c3b-side">` + h.p(`The middle resale house or other home in Horry County sold for about ${k1(RES.resale_house.median)} in the past year, and the middle resale condo for about ${k1(RES.resale_condo.median)}. Half sold for more, half for less.`) +
      h.p(`${h.a("/buyers/new-construction/", "New homes")} are a big part of the market: builders sold more than 1 in 4 of the homes recorded in the county. The middle home a builder sold, condos aside, went for about ${k1(NEW_HOUSE)}. New houses have the fewest months of supply of any kind of home here, about ${Math.round(HO.months_new)}.`) +
      PH_STREET +
      h.h3("What does a home cost each year besides the mortgage?") +
      h.p(`The middle house, about $350,000, costs about ${r10(WX.total)} a year besides the mortgage if you live in it outside city limits. That is about ${r10(WX.total_per_month)} a month. The biggest parts are upkeep, about $3,270, and insurance, about $2,000.`) + `</div>` +
      h.p(`The middle resale condo, about ${k1(CX.price)}, costs about ${r10(CX.total)} a year, and three quarters of that is the condo fee. The fee pays to run and keep up the shared building and grounds, and may pay the building's insurance.`) +
      YEAR_CHART +
      h.p(`In Myrtle Beach and North Myrtle Beach the middle condo ${h.a("/buyers/cost-to-own/", "costs more to own each year")} than the middle house. But it costs less to buy: in Myrtle Beach, less than half as much. Weigh the smaller loan against the larger fee.`) +
      h.p(`To compare prices with Charleston, see our ${h.a("/buyers/relocating/myrtle-beach-vs-charleston/", "Charleston vs Myrtle Beach page")}.`) },

    { h2: "What are the steps to buy a house in South Carolina?", toc: "The steps", id: "steps", html: () =>
      h.p(`Eight steps, from choosing an agent to the deed recorded in Conway. The biggest difference from many states: every South Carolina home closing must be supervised by a South Carolina attorney.`) +
      STEP_LIST +
      offerBox("Buying from another state?", "Tell us where you live and what you want. We line up the inspection, the insurance quote and a closing attorney.", "Ask us to plan your purchase", "buying-in-myrtle-beach-steps") },

    { h2: "Can I buy a home in Myrtle Beach from out of state?", toc: "Buying from out of state", id: "out-of-state", html: () =>
      h.p(`Yes, and many buyers do:`) +
      OOS +
      h.p(`North Carolina sends the most out-of-state buyers by far, then New York, Pennsylvania, New Jersey and Virginia. In the same building or subdivision, buyers with an out-of-state tax bill paid the same middle price as South Carolina buyers.`) +
      h.p(`More people keep coming. In the latest Census count, the Myrtle Beach metro grew faster than every U.S. metro but one. About 39 more people a day ${h.a("/buyers/relocating/", "moved into Horry County")} from the rest of the country than moved out.`) },

    { h2: "What can go wrong when buying in Myrtle Beach?", toc: "What can go wrong", id: "what-can-go-wrong", html: () =>
      h.p(`Six things here surprise buyers from other states. Each has a fix, and we handle most of them before you offer. The ${h.a("/buyers/common-mistakes/", "ten costliest buyer mistakes")} are ranked on their own page.`) +
      RISK_LIST },
  ],
  faqTitle: "Buying in Myrtle Beach FAQ",
  /* Fix round 1 (owner reviewer): one or two lines each; no entry copies the body. Cut: how long to close (owner
     question 3), the season (in section 1). */
  faq: [
    { q: "Is Myrtle Beach a buyer's market?", a: `For condos, yes: across Horry County, the condos for sale would take about ${CONDO_M} months to sell. For houses under $700,000, not yet.` },
    { q: "Will home prices in Myrtle Beach go down?", a: "We do not forecast prices. Horry County house prices were about flat in the latest year, after four years of gains." },
    { q: "Do you need a lawyer to buy a house in South Carolina?", a: "Yes. Every South Carolina home closing must be supervised by a South Carolina attorney. Step 5 says how you choose one." },
    { q: "What is a CL-100?", a: "The termite letter, the Official South Carolina Wood Infestation Report. Only a licensed pest control applicator may issue it for a sale or a loan. It reports visible insect damage, active infestations, and moisture and decay under the house." },
    { q: "Can I rent my Myrtle Beach condo by the night?", a: "Often, if it is inside the City of Myrtle Beach, where most condos sit in zones that allow it. The condo's own rules can still ban it." },
    { q: "How much are property taxes in Myrtle Beach?", a: "Inside the City of Myrtle Beach, on a house the county values at $350,000, about $1,410 a year if you live in it and apply. As a second home, about $5,350." },
  ],
  sources: [
    { name: "Horry County deed index", href: DEEDS },
    { name: "Texas A&M research center", href: TRERC },
    { name: "FHFA house price index", href: FHFA },
    { name: "Census population estimates", href: POPEST },
    { name: "SC Code 40-57", href: T40_57 },
    { name: "NAR", href: NAR },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "Doe v. McMaster", href: DOE },
    { name: "CFPB", href: CFPB_LE },
    { name: "SC Regulation 27-1085", href: REG27 },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "Fannie Mae B4-2.1-03", href: FNMA },
    { name: "OpenFEMA policies", href: "https://www.fema.gov/openfema-data-page/nfip-redacted-policies-v3" },
  ],
  sourcesNote: "Supply: the Chapter3 listing feed, counted in total, against deeds recorded October 2025 to September 2026. Prices: FHFA, mid-2021 to mid-2025, then the year to mid-2026. Population: Census, the year to July 2025. Not legal or tax advice.",
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Send us an address before you offer.", p: "We pull its flood zone, an insurance quote, the tax at both rates and, for a condo, the HOA papers and rental rules.", label: "Send us an address", href: "/contact/?topic=buying-in-myrtle-beach-end" },
  keywords: "Myrtle Beach buyer's market, buying in Myrtle Beach, is Myrtle Beach a buyers market, Myrtle Beach housing market, how much is a house in Myrtle Beach, steps to buying a house in South Carolina, South Carolina attorney closing, buying a house in South Carolina from out of state, CL-100",
  about: "Buying a home in Myrtle Beach and Horry County, South Carolina",
});
