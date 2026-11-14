/* /submarkets/surfside-beach/ - Surfside Beach, SC: what living there is like (the pier, a year of town
 * events, golf carts, the beach, drive times), whether it is part of Myrtle Beach (and the county rule for
 * the "Surfside Beach" listings outside the town), our street map of where nightly rentals are allowed,
 * what homes sold for, the yearly cost on each side, flooding and the 48 percent rule, renting it out, and
 * the pros and cons.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-03; fix round 1, 2026-11-04 (REVIEW-1.md): life first, the
 * zone codes said once, fewer exact numbers, streets on the map with a two-part phone view, answers in
 * place of open questions, an offer per section with its own words.
 * Facts: Blog-Brain batches/2026-11-a/submarkets-surfside-beach/facts.md (VERIFIED rows, CORRECTED rows at
 * the verifier's "Use:" wording only, and rows 45 to 53 marked VERIFIED-BY-FIXER for the lead to re-check;
 * VERIFY.md; struck wording in submarkets-surfside-beach-struck.json). Demand: must-answer.md.
 * Data: data/2026-11-a/submarkets-surfside-beach/ (findings.json, map-layers.geojson, map-streets.geojson,
 * band-edge-streets.json, map-counts.json, listings-findings.json, nfip-findings.json, crs-findings.json,
 * beach-distance.json, ocean-lakes-findings.json, raw/drives.json, raw/town-events/, photos.json) and the
 * site's one short-term rental file, data/str-market.json (rows 37, 38). Every count, price, share, policy
 * cost, chart value and drive time is read from those files here and checked against its ledger row.
 * Deeds: the 2026-10-d out-of-state-buyers pull (data/2026-10-d/sell-out-of-state-buyers/), reused.
 * Pictures: our rental map (inline SVG), two crops of NOAA aerial frame 185159_0112261658253_036_RGB1
 * (public domain; zoning lines drawn on one), and a CC BY-SA beach photo already on the site, until the
 * photo partner's shots of the inland streets arrive (shot-list.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, prosCons, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/submarkets/surfside-beach/";
const SLUG = "submarkets-surfside-beach";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), MC = read("map-counts.json"), L = read("listings-findings.json"), NF = read("nfip-findings.json");
const CRS = read("crs-findings.json"), BD = read("beach-distance.json"), OL = read("ocean-lakes-findings.json");
const LAYERS = read("map-layers.geojson"), DRIVES = read("raw/drives.json").drives, PHOTOS = read("photos.json").photos;
const STR = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "str-market.json"), "utf8")).markets.find((m) => m.slug === "surfside-beach");

const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r100 = (v) => money(Math.round(v / 100) * 100);
const must = (ok, msg) => { if (!ok) throw new Error(`surfside-beach.js: ${msg}`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

const ST = F.stock, SA = F.sales;
/* Row 4: homes by side of the line. */
const HG = MC.homes_by_group;
must(HG.nightly === 1662 && HG.no_nightly === 1874 && HG.other === 509 && ST["town/all"].homes === 4045 && F.zones_count.PD === 447, "row 4 changed");
/* Row 5 (CORRECTED wording: "taxed as its owner's main home"; "tax bills go to another state"). */
must(ST["R3/all"].pct_owner_occupied === 12.9 && ST["R1/all"].pct_owner_occupied === 71.1 && ST["town/all"].pct_owner_occupied === 36.0, "row 5 changed");
must(ST["R3/all"].pct_tax_bill_outside_sc === 52.9 && ST["R1/all"].pct_tax_bill_outside_sc === 13.1, "row 5 bills changed");
/* Rows 6 to 8: deed sales. */
const R3H = SA["R3/house"], R3C = SA["R3/condo"], R1H = SA["R1/house"], R2H = SA["R2/house"], TOWN = SA["town/all"];
must(R3H.sales === 39 && R3H.median === 1000000 && R3C.sales === 45 && R3C.median === 380000, "row 6 changed");
must(R1H.sales === 20 && R1H.median === 541750 && R2H.sales === 28 && R2H.median === 486500, "row 7 changed");
must(TOWN.sales === 179 && TOWN.median === 534000 && TOWN.matched_grantee === 175 && TOWN.buyer_outside_sc === 81, "row 8 changed");
/* Rows 9 to 11, 43, 44: tax. Mills from the 2026 levy (row 9). */
const MILLS = { county: 52.1, school: 119.1, schoolOps: 109.1, town: 43.0 };
const TOTAL = Math.round((MILLS.county + MILLS.school + MILLS.town) * 10) / 10;
must(TOTAL === 214.2, "row 9 total");
const taxMain = (v) => v * 0.04 * (TOTAL - MILLS.schoolOps) / 1000, taxRental = (v) => v * 0.06 * TOTAL / 1000;
must(Math.round(taxMain(500000)) === 2102 && Math.round(taxRental(500000)) === 6426, "row 11 changed");
const R1_VALUE = ST["R1/house"].median_county_market_value;
must(Math.round(R1_VALUE) === 487876 && Math.round(taxMain(R1_VALUE)) === 2051, "row 43 changed");
must(Math.round(taxRental(R3C.median)) === 4884, "row 44 changed");
/* Row 12: high-risk flood zone by district. */
must(ST["town/all"].pct_high_risk === 39.0 && ST["R3/all"].pct_high_risk === 78.3 && ST["R1/all"].pct_high_risk === 15.5 && ST["R2/all"].pct_high_risk === 2.0, "row 12 changed");
must(ST["ocean_side/all"].pct_high_risk === 100.0 && ST["ocean_side/all"].homes === 567, "row 12 ocean side changed");
/* Row 14: CRS class on 2026 policies. */
const crs = (id) => CRS.by_community_class.find((r) => r[1] === id);
must(crs("450111")[2] === 7 && crs("450104")[2] === 5, "row 14 changed");
/* Row 15 (CORRECTED wording): flood policy cost, two block groups. */
const NG = NF.groups;
const FLOOD_SOUTH = NG["mostly_R3/11"].median_cost, FLOOD_INLAND = NG["mostly_R1_R2/11"].median_cost;
must(NG["mostly_R3/11"].policies === 301 && Math.round(FLOOD_SOUTH) === 1256 && NG["mostly_R1_R2/11"].policies === 64 && Math.round(FLOOD_INLAND) === 702, "row 15 changed");
must(Math.round(taxMain(R1_VALUE) + FLOOD_INLAND) === 2753, "row 43 total changed");
/* Rows 31, 32: listings, in aggregate. */
const LB = MC.listings_by_group, LG = L.groups;
must(LB.nightly === 45 && LB.no_nightly === 24 && LB.outside_town === 154 && L.in_town === 77, "row 31 changed");
const LISTED = LB.nightly + LB.no_nightly + LB.outside_town + LB.other;
must(LISTED === 231, "row 31 total");
must(LG["R3C3/house"].n === 19 && LG["R3C3/house"].median_ask === 1250000 && LG["R3C3/condo"].median_ask === 519000 && LG["R1R2/house"].median_ask === 545000, "row 32 changed");
must(LG["all/house"].n === 42 && LG["all/house"].no_hoa_fee === 36, "row 32 HOA changed");
/* Rows 33, 34: Ocean Lakes. */
must(OL.with_building === 956 && OL.with_building_land_value_zero === 949 && Math.round(OL.median_building_value) === 248463 && OL.parent_parcel[0].Acreage === 241.67, "row 34 changed");
must(MC.ocean_lakes_parcel_inside_town === false, "row 33 changed");
/* Rows 37, 38: the site's STR file. */
must(STR.revenue === 42902 && STR.occupancy === 36.9 && STR.adr === 419 && STR.listings === 551 && STR.yoy === 7.1, "row 37 changed");
must(STR.peakMonth === "July" && STR.peakRevenue === 11600 && STR.lowMonth === "January" && STR.lowRevenue === 2360, "row 38 months changed");
must(STR.bottom25 === 1810 && STR.median === 3840 && STR.top25 === 7470 && STR.top10 === 12800, "row 38 spread changed");
/* Row 40: distance to Ocean Boulevard, straight line. */
must(BD.zones.town.max_miles === 0.8 && BD.zones.R1.max_miles === 0.65 && BD.zones.R1.median_miles === 0.36, "row 40 changed");
/* Row 27 (CORRECTED: Ocean Lakes is the campground, not its gate): drives from the pier, free flow.
   Under 15 minutes to the minute, longer to the nearest 5 (CRAFT 2). */
const mins = (k) => { const m = DRIVES[k].minutes; return m < 15 ? Math.round(m) : Math.round(m / 5) * 5; };
const D = { food: mins("food_lion_bus17"), gc: mins("garden_city_pier"), ol: mins("ocean_lakes_campground"), park: mins("myrtle_beach_state_park"),
  hosp: mins("tidelands_waccamaw_hospital"), marsh: mins("marshwalk"), mc: mins("market_common"), air: mins("airport_terminal"),
  mall: mins("coastal_grand"), hb: mins("huntington_beach_sp"), bway: mins("broadway_at_the_beach"), gsmc: mins("grand_strand_medical") };
must(D.food === 5 && D.gc === 6 && D.ol === 7 && D.park === 11 && D.hosp === 12 && D.marsh === 12 && D.mc === 14 && D.air === 15 && D.mall === 15 && D.hb === 20 && D.bway === 20 && D.gsmc === 25, "row 27 drives changed");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main.                                              */

const C_NIGHT = "#d9823b", C_NO = "#5f9a6e", C_OTHER = "#c8c2b8";
const CSS = `<style>
main#main h2{text-wrap:balance}
main#main .c3-sb-fig{margin:1.3rem 0 1.5rem;max-width:720px}
main#main .c3-sb-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}
main#main .c3-sb-frame{border-radius:18px;overflow:hidden;background:#cfe2e8;border:1px solid rgba(255,255,255,.8);box-shadow:0 8px 24px rgba(28,32,40,.1)}
main#main .c3-sb-frame svg{display:block;width:100%;height:auto}
main#main .c3-sb-halves{display:grid;gap:.5rem}main#main .c3-sb-wide{display:none}
main#main .c3-sb-panel{margin:.4rem 0 0;font-weight:600;color:var(--navy);font-size:1rem}
@media (min-width:700px){main#main .c3-sb-halves{display:none}main#main .c3-sb-wide{display:block}}
@media (min-width:760px){main#main .c3-pc{align-items:stretch}}
main#main td{overflow-wrap:normal}
main#main .c3-sb-key{list-style:none;margin:.9rem 0 0;padding:0;display:grid;gap:.5rem}
main#main .c3-sb-key li{display:flex;align-items:flex-start;gap:.65rem;font-size:1.02rem;line-height:1.4;margin:0;color:var(--muted)}
main#main .c3-sb-key b{color:var(--navy)}
main#main .c3-sb-sw{flex:none;width:1.35rem;height:1.35rem;border-radius:6px;margin-top:.08rem;border:1px solid rgba(28,32,40,.25)}
main#main .c3-sb-stats{list-style:none;padding:0;margin:1.1rem 0 1.3rem;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.6rem;max-width:680px}
@media (min-width:700px){main#main .c3-sb-stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
main#main .c3-sb-stats li{margin:0;padding:.75rem .85rem;border-radius:16px;background:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.85);box-shadow:0 6px 18px rgba(28,32,40,.07)}
main#main .c3-sb-stats b{display:block;font-family:var(--serif);font-size:1.45rem;color:var(--navy);line-height:1.15}
main#main .c3-sb-stats span{display:block;color:var(--muted);font-size:.95rem;line-height:1.35;margin-top:.2rem}
main#main .c3-sb-rules{list-style:none;padding:0;margin:1rem 0 1.4rem;display:grid;gap:.55rem;max-width:720px}
@media (min-width:700px){main#main .c3-sb-rules{grid-template-columns:1fr 1fr}}
main#main .c3-sb-rules li{margin:0;padding:.7rem .9rem;border-radius:14px;background:rgba(255,255,255,.55);border:1px solid rgba(255,255,255,.8);color:var(--muted);line-height:1.5;font-size:1rem}
main#main .c3-sb-rules strong{color:var(--navy);display:block}
main#main .c3-sb-note{max-width:720px;margin:1.2rem 0 1.4rem;padding:1rem 1.2rem;border-radius:16px;background:rgba(255,255,255,.55);border-left:4px solid var(--brass);color:var(--muted);line-height:1.7}
main#main .c3-sb-note b{color:var(--navy)}
main#main figure.c3ph-hero img{aspect-ratio:4/3!important}
/* The end band (the same fix as /submarkets/garden-city/ and /submarkets/conway/). */
main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}
@media (max-width:359px){.c3-glance{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:.4rem!important}}
@media (max-width:359px){.hx-feed .hx-fb-ai,.hx-feed label.hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap!important;box-sizing:border-box}.hx-feed .hx-fb-ai>*{min-width:0}.hx-feed .hx-pop{flex-wrap:wrap!important;max-width:100%}}
</style>`;

/* Design pass, 2026-11-08 (redo3/submarkets-surfside-beach/DESIGN.md), the same look as the Garden City, Myrtle Beach
   and North Myrtle Beach guides: a two-line headline, photos beside their text on a wide screen and without a frame,
   one card style (charts and the closing offer), plain tables and lists under thin rules, the section offers as
   plain lines with a pill, and one block width of 720 px. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CTA = `${S} div[style^="border-left:3px solid var(--brass)"]`;
const ARROW = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12h14M13 6l6 6-6 6'/%3E%3C/svg%3E\")";
const DESIGN_CSS = "<style>"
  /* 1. The headline: the italic line at about half the H1's size; on a phone the tiles are short rows under rules, with no box. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* 2. Photos without a card frame; on a wide screen each photo sits beside the text it explains. */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px!important}${S} figure.c3ph-hero figcaption{padding:0!important}`
  + `@media (min-width:1100px){${S} .c3-sb-side{display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:var(--sb-rows);column-gap:2.5rem;align-items:start}`
  + `${S} .c3-sb-side>*{grid-column:1}${S} .c3-sb-side>figure.c3ph-hero{grid-column:2;grid-row:1/-1;margin:.4rem 0 1.4rem!important;max-width:none!important}`
  + `${S} .c3-sb-side>h3:first-child{margin-top:0!important}${S} .c3-sb-side{margin-top:1.6rem}}`
  /* The map keeps its own rounded frame and loses the outer card; its key is a plain list. */
  + `${S} figure.c3-sb-fig{${FLAT};padding:0!important}${S} figure.c3-sb-fig>figcaption{padding:0!important}`
  /* 3. One card style, kept for the charts and the closing offer. Tables are plain, under thin rules. */
  + `${TBL}{${FLAT};padding:0!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${S} .c3-cc{${FLAT};padding:0!important}${S} .c3-cc thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${S} .c3-cc th:first-child,${S} .c3-cc td:first-child{padding-left:0}`
  + `@media (max-width:39.999em){${S} .c3-cc tbody tr{${FLAT};border-top:${RULE}!important;margin:0!important;padding:.7rem 0 .75rem!important}`
  + `${S} .c3-cc tbody tr:last-child{border-bottom:${RULE}!important}${S} .c3-cc th,${S} .c3-cc td{padding-left:0!important;padding-right:0!important}}`
  /* The year of events: a two-column list split by rules. The town's history: a brass rule, no box. */
  + `${S} .c3-sb-rules{gap:0 2rem!important}${S} .c3-sb-rules li{${FLAT};border-top:${RULE}!important;padding:.75rem 0 .8rem!important}`
  + `${S} .c3-sb-rules li:last-child{border-bottom:${RULE}!important}@media (min-width:700px){${S} .c3-sb-rules li:nth-last-child(2){border-bottom:${RULE}!important}}`
  + `${S} .c3-sb-note{background:none!important;border-radius:0!important;padding:.2rem 0 .2rem 1.2rem!important}`
  /* The pros and cons: two plain columns, each under a brass rule. */
  + `${S} .c3-pc>div{${FLAT};border-top:2px solid var(--brass)!important;padding:.9rem 0 0!important}${S} .c3-pc{column-gap:2.5rem!important}`
  /* 4. The section offers: no box. A thin rule, the title and the line, and the button as the light pill of the town guides. */
  + `${CTA}{${FLAT};border-top:${RULE}!important;padding:1.2rem 0 0!important;margin:2rem 0 2.2rem!important}`
  + `${CTA}>p:first-child{font-family:var(--serif);font-size:1.2rem;font-weight:400!important;line-height:1.35}`
  + `${CTA} a.btn.btn-brass{display:inline-flex;align-items:center;gap:.7rem;min-height:44px;padding:.55rem .6rem .55rem 1.2rem!important;border-radius:999px;`
  + `font-family:var(--sans);font-size:var(--read,1.0625rem);color:var(--navy)!important;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,.62))!important;`
  + `border:1px solid rgba(145,89,43,.35)!important;box-shadow:inset 0 1px 0 #fff,0 8px 20px -14px rgba(28,32,40,.45)!important;text-align:left}`
  + `${CTA} a.btn.btn-brass::after{content:"";flex:none;width:2rem;height:2rem;border-radius:50%;background:${ARROW} center/18px no-repeat,linear-gradient(180deg,#d4894a,#c4783a)}`
  + `${CTA} a.btn.btn-brass:hover{border-color:var(--brass)!important;background:linear-gradient(180deg,#fff,rgba(232,201,154,.35))!important}`
  /* The homes strip after the beach block. */
  + `${S} .c3-sb-side+.hx-strip:not(:empty){margin-top:1.4rem}${S} .c3-sb-side+.hx-strip,${S} .c3-sb-side+.hx-strip+.hx-fallback{margin-bottom:2.4rem}`
  /* 5. One block width. */
  + `${S} .c3-gchart,${TBL},${S} .c3-cc,${S} .c3-pc,${S} .c3-sb-rules,${S} .c3-sb-note,${S} figure.c3-sb-fig{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* A photo and the text it explains in one block, so the photo can sit beside the text on a wide screen (its grid rows
   span every text row; the last row takes what is left). Below 1,100 px the order is unchanged. */
const side = (...kids) => { kids = kids.filter(Boolean); const k = kids.filter((x) => !x.includes('class="c3ph-hero"')).length;
  return `<div class="c3-sb-side" style="--sb-rows:${"auto ".repeat(Math.max(k - 1, 0))}1fr">` + kids.join("") + `</div>`; };

/* ---------------------------------------------------------------------------- */
/* The rental map: our own, from map-layers.geojson (rows 3 and 4) and the county  */
/* street centerlines in map-streets.geojson (row 46). The town is a long strip    */
/* along the beach; the map is turned so the beach runs along the bottom. On a     */
/* wide screen it is one picture. On a phone it is two taller pictures, south and  */
/* north of the pier, so a reader can find a street (critic and owner, round 1).   */
/* The shapes are drawn once (<defs>) and each view reuses them with <use>.        */

const STREETS = read("map-streets.geojson");
const MAP = (() => {
  const feat = (test) => LAYERS.features.filter((f) => test(f.properties));
  const town = feat((p) => p.layer === "town_limits")[0].geometry.coordinates[0];
  const lat0 = 33.613, lon0 = -78.975, kx = Math.cos(lat0 * Math.PI / 180) * 111320, ky = 110574;
  const xy = ([lo, la]) => [(lo - lon0) * kx, (la - lat0) * ky];
  /* Turn by the town's ocean edge: the line through the town-limit points nearest the sea on each end. */
  const pts = town.map(xy), mx = pts.reduce((s, p) => s + p[0], 0) / pts.length, my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
  let sxx = 0, syy = 0, sxy = 0; for (const [x, y] of pts) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); }
  const ax = 0.5 * Math.atan2(2 * sxy, sxx - syy), ca = Math.cos(ax), sa = Math.sin(ax);
  const across = (p) => -(p[0] - mx) * sa + (p[1] - my) * ca, along = (p) => (p[0] - mx) * ca + (p[1] - my) * sa;
  const seaSide = pts.filter((p) => across(p) < 0), mid = (lo) => seaSide.filter((p) => lo ? along(p) < 0 : along(p) >= 0);
  const lowest = (q) => q.reduce((m, p) => (across(p) < across(m) ? p : m));
  const [e1, e2] = [lowest(mid(true)), lowest(mid(false))];
  const th = Math.atan2(e2[1] - e1[1], e2[0] - e1[0]), c = Math.cos(th), s = Math.sin(th);
  must(th > 0.6 && th < 1.1, "the town's axis should run north-east");
  const rot = ([x, y]) => [x * c + y * s, -x * s + y * c];
  const R = (ll) => rot(xy(ll));
  const tr = town.map(R), tx = tr.map((p) => p[0]), ty = tr.map((p) => p[1]);
  const coast = Math.min(...ty);
  const X0 = Math.min(...tx) - 260, X1 = Math.max(...tx) + 1250, Y1 = Math.max(...ty) + 140, Y0 = coast - 520;
  const W = Math.round(X1 - X0), H = Math.round(Y1 - Y0), TOWN_X1 = Math.round(Math.max(...tx) - X0);
  const P = (ll) => { const [x, y] = R(ll); return [Math.round(x - X0), Math.round(Y1 - y)]; };
  const ring = (r) => "M" + r.map((ll) => P(ll).join(" ")).join("L") + "Z";
  const polys = (f) => (f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates).map((poly) => poly.map(ring).join("")).join("");
  const lineList = (g) => (g.type === "LineString" ? [g.coordinates] : g.coordinates);
  const lines = (f) => lineList(f.geometry).map((l) => "M" + l.map((ll) => P(ll).join(" ")).join("L")).join("");
  const zone = (g, fill) => feat((p) => p.layer === "zoning" && p.group === g).map((f) => `<path d="${polys(f)}" fill="${fill}" fill-rule="evenodd"/>`).join("");
  const road = (name) => feat((p) => p.layer === "road" && p.name === name)[0];
  const pier = feat((p) => p.layer === "poi")[0].geometry.coordinates, [px, py] = P(pier);
  const PIER_M = Math.round(814 * 0.3048);              // row 17: 814 feet, out to sea
  const yCoast = Math.round(Y1 - coast);
  const ol = feat((p) => p.layer === "ocean_lakes")[0];
  const bus = road("US 17 Business"), ob = road("Ocean Boulevard");
  const streetPaths = STREETS.features.map(lines).join("");
  must(STREETS.features.length > 100, "map-streets.geojson looks empty");
  /* Text: one size in map units, so the labels read at about 15 to 18 px in every view. */
  const T = (x, y, txt, o = {}) => `<text x="${Math.round(x)}" y="${Math.round(y)}" text-anchor="${o.anchor || "middle"}"${o.rot ? ` transform="rotate(${o.rot.toFixed(1)} ${Math.round(x)} ${Math.round(y)})"` : ""} style="font-family:'DM Sans',system-ui,sans-serif;font-size:${o.size || 125}px;font-weight:${o.weight || 700};fill:${o.fill || "#1c2028"};${o.italic ? "font-style:italic;" : ""}${o.halo === false ? "" : "paint-order:stroke;stroke:#fff;stroke-width:24px;stroke-linejoin:round;"}">${txt}</text>`;
  /* Street labels, placed on the street (row 46; map-streets.geojson label_at, label_dir). */
  const SL = STREETS.features.filter((f) => f.properties.label).map((f) => {
    const [ax2, ay2] = P(f.properties.label_at), [bx, by] = P(f.properties.label_dir);
    let a = Math.atan2(by - ay2, bx - ax2) * 180 / Math.PI; if (a > 90) a -= 180; if (a < -90) a += 180;
    return { x: ax2, y: ay2, a, text: f.properties.label };
  });
  must(SL.length === 10, "street labels changed");
  const streetLabels = (v0, v1) => SL.filter((l) => l.x > v0 + 200 && l.x < v1 - 200)
    .map((l) => T(l.x, l.y + 40, l.text, { size: 100, weight: 600, fill: "#2a3040", rot: l.a })).join("");
  const busAll = bus.geometry.coordinates.flat().map(P).filter(([x, y]) => y > 0 && y < H);
  const busLabel = (v0, v1) => { const q = busAll.filter(([x]) => x > v0 + 900 && x < v1 - 900); must(q.length, "US 17 Business is not in a view"); const b = q[Math.floor(q.length / 2)]; return T(b[0], b[1] - 60, "US 17 Business"); };
  const north = (x0) => { const [nx, ny] = (() => { const [a, b] = rot([0, 1]); return [a, -b]; })(); const A = { x: x0 + 260, y: 420 }, nl = 190;
    return `<line x1="${A.x}" y1="${A.y}" x2="${Math.round(A.x + nx * nl)}" y2="${Math.round(A.y + ny * nl)}" stroke="#1c2028" stroke-width="22" stroke-linecap="round"/>`
      + `<circle cx="${Math.round(A.x + nx * nl)}" cy="${Math.round(A.y + ny * nl)}" r="26" fill="#1c2028"/>` + T(A.x + nx * (nl + 120), A.y + ny * (nl + 120) + 40, "N", { size: 110 }); };
  const HALF = Math.round(0.5 * 1609.34);              // half a mile, for scale (row 40 is in miles)
  const scale = (x1) => { const sbx = x1 - HALF - 120, sby = H - 90;
    return `<line x1="${sbx}" y1="${sby}" x2="${sbx + HALF}" y2="${sby}" stroke="#1c2028" stroke-width="18"/>` + T(sbx + HALF / 2, sby - 70, "half a mile", { size: 105, weight: 600, fill: "#2f6276", italic: true, halo: false }); };
  const shapes = `<g id="c3-sb-mapg">`
    + `<rect x="0" y="0" width="${W}" height="${yCoast}" fill="#f1ece3"/>`
    + `<rect x="0" y="${yCoast}" width="${W}" height="${H - yCoast}" fill="#cfe2e8"/>`
    + `<path d="${ring(ol.geometry.coordinates[0])}" fill="#e6e0d5" stroke="#8a8378" stroke-width="10" stroke-dasharray="40 26"/>`
    + `<path d="${ring(town)}" fill="#fbf8f3"/>`
    + zone("other", C_OTHER) + zone("no_nightly", C_NO) + zone("nightly", C_NIGHT)
    + `<path d="${streetPaths}" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${ring(town)}" fill="none" stroke="#1c2028" stroke-width="12"/>`
    + `<path d="${lines(bus)}" fill="none" stroke="#1c2028" stroke-opacity=".55" stroke-width="30" stroke-linecap="round"/><path d="${lines(bus)}" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round"/>`
    + `<path d="${lines(ob)}" fill="none" stroke="#fff" stroke-width="14" stroke-linecap="round"/>`
    + `<line x1="${px}" y1="${py}" x2="${px}" y2="${py + PIER_M}" stroke="#1c2028" stroke-width="22" stroke-linecap="round"/>`
    + `<circle cx="${px}" cy="${py}" r="30" fill="#fff" stroke="#1c2028" stroke-width="10"/></g>`;
  must(px > 0 && px < W && py > 0 && py < H, "the pier is off the map");
  const olPts = ol.geometry.coordinates[0].map(P).filter(([x]) => x < W);
  const pierLabel = T(px - 60, py + PIER_M - 10, "Pier", { anchor: "end", size: 135 });
  const DESC = "Map of the Town of Surfside Beach, turned so the beach runs along the bottom. An orange band along the ocean marks the blocks where nightly rentals are allowed. A larger green area inland marks the streets where rentals under 30 days are not allowed. Gray areas are other districts. North of the pier the line between them follows Dogwood Drive North; south of the pier it follows Willow Drive South, then Lakeside Drive. US 17 Business runs along the inland edge. Ocean Lakes Family Campground, outside the town, is at the north end.";
  const view = (id, v0, v1, label, extra) => `<svg class="c3-sb-map" xmlns="http://www.w3.org/2000/svg" viewBox="${v0} 0 ${v1 - v0} ${H}" role="img" aria-labelledby="${id}"><title id="${id}">${label}</title><use href="#c3-sb-mapg"/>`
    + pierLabel + busLabel(v0, v1) + streetLabels(v0, v1) + T(Math.round(v0 + (v1 - v0) * (v1 - v0 === W ? 0.62 : 0.42)), H - 150, "Atlantic Ocean", { size: 135, weight: 600, fill: "#2f6276", italic: true, halo: false })
    + north(v0) + scale(v1) + (extra || "") + `</svg>`;
  const full = view("c3-sb-map-t", 0, W, DESC, T(W - 40, (Math.min(...olPts.map((p) => p[1])) + Math.max(...olPts.map((p) => p[1]))) / 2, "Ocean Lakes", { anchor: "end", size: 110, weight: 700, fill: "#5c564c" }));
  const S0 = 0, S1 = Math.min(W, px + 380), N0 = Math.max(0, px - 380), N1 = Math.min(W, TOWN_X1 + 160);
  const south = view("c3-sb-map-s", S0, S1, "The south half of the town, from the south town line to the pier. " + DESC);
  const northV = view("c3-sb-map-n", N0, N1, "The north half of the town, from the pier to the north town line. " + DESC);
  const defs = `<svg class="c3-sb-defs" xmlns="http://www.w3.org/2000/svg" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden"><defs>${shapes}</defs></svg>`;
  const key = `<ul class="c3-sb-key" aria-label="Map key">`
    + `<li><span class="c3-sb-sw" style="background:${C_NIGHT}"></span><span><b>Near the ocean: nightly rentals allowed.</b> The town's R3 and C3 zones, about 4 in 10 of its homes.</span></li>`
    + `<li><span class="c3-sb-sw" style="background:${C_NO}"></span><span><b>Inland: no rentals under 30 days.</b> The R1 and R2 zones, close to half of the town's homes.</span></li>`
    + `<li><span class="c3-sb-sw" style="background:${C_OTHER}"></span><span><b>Other districts:</b> the pier's entertainment district, planned developments and commercial land. We check the parcel.</span></li>`
    + `<li><span class="c3-sb-sw" style="background:#e6e0d5;border:2px dashed #8a8378"></span><span><b>Ocean Lakes Family Campground:</b> next to the town, not in it.</span></li>`
    + `</ul>`;
  must(Math.round(HG.nightly / ST["town/all"].homes * 10) === 4 && HG.no_nightly / ST["town/all"].homes > 0.45 && HG.no_nightly / ST["town/all"].homes < 0.5, "row 4 shares");
  return `<figure class="c3-sb-fig">${defs}<div class="c3-sb-frame c3-sb-wide">${full}</div>`
    + `<div class="c3-sb-halves"><p class="c3-sb-panel">South of the pier</p><div class="c3-sb-frame">${south}</div><p class="c3-sb-panel">North of the pier</p><div class="c3-sb-frame">${northV}</div></div>`
    + `<figcaption>Where nightly rentals are allowed in the Town of Surfside Beach, with its streets. Map drawn by Chapter3 from the town's zoning map and Horry County parcel and street records.</figcaption>${key}</figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* Photos. Three, each under its sentence. The 2011 oblique of the old pier came  */
/* out in fix round 1: three of four photos were the pier from the air (owner).   */
/* Inland streets and town life wait for the photo partner (shot-list.md).        */

const rec = (end) => { const r = PHOTOS.find((x) => x.file.endsWith(end)); must(r, `no photo record for ${end}`); return r; };
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.4rem 0 1.6rem;');
const photo = (r, caption) => lazy(PH.heroPhoto(r, { alt: r.alt, caption: caption || r.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" }));
const LINE = rec("/surfside-beach-rental-line-from-above.webp"), PIER = rec("/surfside-beach-pier-from-above-2026.webp");
const SAND = rec("/surfside-beach-houses-from-the-sand.webp");
const SHOWN = [PIER, SAND, LINE];
const CREDITS = PH.creditsList(SHOWN.map((p) => ({ photo: p, caption: p.caption.replace(/\.$/, "") })));
const SAND_CAPTION = "Beach houses behind the dunes at Surfside Beach.";
must(SAND.caption === SAND_CAPTION || SAND.caption === "Beach houses along the sand at Surfside Beach.", "sand caption");

/* ---------------------------------------------------------------------------- */
/* Charts                                                                         */

/* Rows 6 and 7: middle sale price by side and kind. Plain names; the zone codes stay on the map. */
const PRICE_CHART = G.bars([
  { name: "Houses near the ocean", value: R3H.median, valueText: "$1,000,000", feature: "nightly rentals allowed" },
  { name: "Houses inland, largest lots", value: R1H.median, valueText: r5k(R1H.median), feature: "lots of 9,000 sq ft or more" },
  { name: "Houses inland, smaller lots", value: R2H.median, valueText: r5k(R2H.median), feature: "lots of 6,000 sq ft or more" },
  { name: "Condos near the ocean", value: R3C.median, valueText: r5k(R3C.median), feature: "nightly rentals allowed" },
], { caption: "Near the ocean, houses sold for about twice the inland ones in the past year", nameLabel: "Side and kind of home", featureLabel: "lot or kind", valueLabel: "Middle price", compact: true,
  note: "Middle price: half sold for more, half for less. Every sale Horry County recorded inside the town limits in the past year." });
must(r5k(R1H.median) === "$540,000" && r5k(R2H.median) === "$485,000", "price rounding");

/* Row 12: share of homes in a high-risk flood zone. */
const pct = (v) => `${Math.floor(v)} percent`;   // 15.5 is "15 percent" in the ledger (row 12)
const FLOOD_CHART = G.bars([
  { name: "Inland, smaller lots", value: ST["R2/all"].pct_high_risk, valueText: pct(ST["R2/all"].pct_high_risk) },
  { name: "Inland, largest lots", value: ST["R1/all"].pct_high_risk, valueText: pct(ST["R1/all"].pct_high_risk) },
  { name: "The whole town", value: ST["town/all"].pct_high_risk, valueText: pct(ST["town/all"].pct_high_risk), reference: true },
  { name: "Near the ocean", value: ST["R3/all"].pct_high_risk, valueText: pct(ST["R3/all"].pct_high_risk) },
], { caption: "Homes in FEMA's high-risk flood zone, inland and near the ocean", nameLabel: "Where", valueLabel: "Share of homes", compact: true, max: 100,
  note: "FEMA's high-risk flood zones on Horry County's flood map, at each home's parcel." });

/* Row 38: one month's gross bookings by listing rank. */
const STR_CHART = G.bars([
  { name: "Bottom quarter of listings", value: STR.bottom25, valueText: `${money(Math.round(STR.bottom25 / 100) * 100)} or less` },
  { name: "The middle listing", value: STR.median, valueText: money(Math.round(STR.median / 100) * 100), reference: true },
  { name: "Top quarter", value: STR.top25, valueText: `${money(Math.round(STR.top25 / 100) * 100)} or more` },
  { name: "Top tenth", value: STR.top10, valueText: `${money(Math.round(STR.top10 / 100) * 100)} or more` },
], { caption: `In a month, the middle Surfside Beach area rental takes in about ${money(Math.round(STR.median / 100) * 100)}`, nameLabel: "Listings", valueLabel: "Gross bookings in a month", compact: true, max: Math.round(STR.top10 * 1.6),
  note: "AirROI, the active Airbnb listings in its Surfside Beach market. Gross bookings, before cleaning, platform and management costs." });

/* Row 47 and row 43: the yearly cost on each side. */
const R3_VALUE = ST["R3/house"].median_county_market_value;
must(Math.round(R3_VALUE) === 857423 && Math.round(taxRental(R3_VALUE)) === 11020 && Math.round(taxRental(R3_VALUE) + FLOOD_SOUTH) === 12276, "row 47 changed");
const COST_TABLE = h.table(["Each year, about", "An inland house you live in", "A house near the ocean, rented or a second home"], [
  ["The county's value for tax", r10k(R1_VALUE), r10k(R3_VALUE)],
  ["Town and county tax, before credits", r100(taxMain(R1_VALUE)), r1000(taxRental(R3_VALUE))],
  ["Flood policy, the typical one on these streets", r50(FLOOD_INLAND), r50(FLOOD_SOUTH)],
  ["<b>Total, besides the mortgage and home insurance</b>", `<b>${r50(taxMain(R1_VALUE) + FLOOD_INLAND)}</b>`, `<b>${r100(taxRental(R3_VALUE) + FLOOD_SOUTH)}</b>`],
]);
must(LG["all/house"].no_hoa_fee / LG["all/house"].n > 0.84 && LG["all/house"].no_hoa_fee / LG["all/house"].n < 0.87, "row 32: about 6 in 7");
must(r50(taxMain(R1_VALUE) + FLOOD_INLAND) === "$2,750" && r100(taxRental(R3_VALUE) + FLOOD_SOUTH) === "$12,300" && r10k(R3_VALUE) === "$860,000", "row 43 and 47 rounding");

/* ---------------------------------------------------------------------------- */
/* Sources                                                                        */

const CODE = "https://library.municode.com/sc/surfside_beach/codes/code_of_ordinances?nodeId=CH17ZO";
const ZMAP = "https://surfsidebeach.org/DocumentCenter/View/3026/New-Zoning-Map";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const T12 = "https://www.scstatehouse.gov/code/t12c043.php";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-policies-v2";
const RULE48 = "https://www.surfsidebeach.org/DocumentCenter/View/392/48-Percent-Rule-PDF";
const PIERPAGE = "https://www.surfsidebeach.org/212/Surfside-Beach-Fishing-Pier";
const BEACHES = "https://www.surfsidebeach.org/200/Beaches";
const PARKING = "https://www.surfsidebeach.org/202/Parking";
const EVENTS = "https://www.surfsidebeach.org/178/Events";
const T56 = "https://www.scstatehouse.gov/code/t56c002.php";
const MINUTES = "https://www.surfsidebeach.org/AgendaCenter/ViewFile/Minutes/_08262025-1302";
const LICENCE = "https://www.surfsidebeach.org/DocumentCenter/View/148";
const ST575 = "https://dor.sc.gov/sites/dor/files/forms/ST575.pdf";
const AIRROI = STR.sourceUrl;
const OCEANLAKES = "https://www.oceanlakes.com/lodging-2/annual-lease-sales/";
const CENSUS = "https://data.census.gov/table?g=160XX00US4570585";
const HORRYZONING = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const USC4012A = "https://www.law.cornell.edu/uscode/text/42/4012a";

/* ---------------------------------------------------------------------------- */
/* The offers. Each one says something different and fits its section (owner,     */
/* 2026-11-03). Button labels stay short so they do not leave one word alone on a  */
/* phone (critic, round 1).                                                        */

const TOP = { title: "Get the Surfside Beach homes that fit how you will use it", label: "Send me Surfside Beach homes", href: "/contact/?place=Surfside%20Beach" };
const END = {
  h2: "Before you offer on a Surfside Beach home, we check four things.",
  p: "Whether it is inside the town and which side of the rental line it is on. Its flood zone against the 48 percent rule. Its tax as a main home or a rental.",
  label: "Ask about a Surfside Beach home", href: "/contact/?place=Surfside%20Beach",
};
const OUT_SHARE = Math.round(LB.outside_town / LISTED * 3);   // in thirds: 154 of 231 is two in three
must(OUT_SHARE === 2, "row 31 share");
const NB = " ";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Neighborhoods", url: "/submarkets/" },
  pageImages: () => PH.pageImages(LINE),
  title: "Surfside Beach, SC Real Estate: Life, Rental Map, Prices",
  description: "Surfside Beach, SC: what living there is like, our map of the streets where nightly rentals are allowed, home prices, yearly costs, flooding and golf carts.",
  ogTitle: "Surfside Beach, SC: life in the town, where nightly rentals are allowed, and what homes cost",
  crumb: "Surfside Beach",
  eyebrow: "Surfside Beach, SC",
  h1: "Surfside Beach real estate:",
  h1em: "life in a two-mile beach town, and where you can rent by the night.",
  sub: "Surfside Beach is a town of about 4,200 people with a free concrete pier, summer concerts in the park and a clear line where nightly rentals stop.",
  heroMedia: glance([
    { icon: "beach", label: "Beach", text: "About 2 miles long" },
    { icon: "dock", label: "Concrete pier", text: "814 feet" },
    { icon: "key", label: "Nightly rentals", text: "Near the ocean" },
    { icon: "airport", label: "Airport", text: `${D.air} min drive` },
  ]),
  heroCta: TOP,
  topOfferLine: "Live there, rent it, or both? Tell us. We send the homes that fit.",
  author: "devin",
  toc: false,
  shortAnswer: [
    `Surfside Beach is its own town of about 4,200 people, on about 2 miles of beach south of Myrtle Beach. Every home is within about 0.8 mile of the beach road.`,
    `The town has a new concrete pier, free summer concerts and golf cart parades down Ocean Boulevard. Nightly rentals are allowed only on the blocks near the ocean. The inland streets, with bigger lots under the trees, are for living in or renting by the year.`,
  ],
  sections: [
    { h2: "What is it like to live in Surfside Beach?", toc: "Living here", id: "living-here", html: () =>
      CSS + DESIGN_CSS + G.homesCss() +
      h.p(`The town calls itself the Family Beach. Its center is the pier, at the ocean end of Surfside Drive.`) +
      side(h.h3("The pier"),
        h.p(`The town's fishing pier is all concrete and reaches 814 feet into the ocean. It opened on the town's 60th birthday, and walking on it is free.`),
        photo(PIER),
        h.p(`The pier has two restaurants, The Whistling Duck and Surf Diner, plus an ice cream shop and a bait shop. A day of fishing is $14. From April through October it stays open until 1 a.m.`)) +
      h.h3("A year of town events") +
      h.p(`The town has its own events department, and many of its events are free. Many take place at the pier, on Ocean Boulevard or in Memorial Park.`) +
      `<ul class="c3-sb-rules">`
        + `<li><strong>Spring</strong>A two-day barbecue festival with a cook-off in March. A kite festival at the pier in April. The Memorial Day golf cart parade down Ocean Boulevard.</li>`
        + `<li><strong>Summer</strong>A free concert in Memorial Park, next to the library, on Sundays from 4 to 7 p.m. The Fourth of July golf cart parade, free to join.</li>`
        + `<li><strong>Fall</strong>An end-of-summer fireworks festival at the pier in September, with free shuttles from the town's parking lots.</li>`
        + `<li><strong>All season</strong>An arts and crafts market every Thursday from March to November, at Surfside Drive and Willow Drive. The Yuletide golf cart parade in December.</li>`
      + `</ul>` +
      h.h3("Golf carts") +
      h.p(`Most trips here need a car or a golf cart. To drive a cart on the street, South Carolina law requires a DMV permit decal, liability insurance and a licensed driver 16 or older.`) +
      h.p(`Carts may use only roads posted at 35 mph or less, and never the sand. A cart driven at night must have working headlights and taillights. The town passed its own golf cart ordinance in 2025.`) +
      side(h.h3("The beach"),
        h.p(`The town has 36 public beach accesses and 12 beach parking lots. Five accesses have wheelchair access, and beach wheelchairs are available through the town police department.`),
        photo(SAND),
        h.p(`An owner who lives elsewhere gets two free parking passes per household for the town's lots. The town's lots charge by the hour from March through October. Dogs stay off the beach from 10 a.m. to 5 p.m., May through Labor Day.`)) +
      /* The homes strip (owner, 2026-11-08: "horizontal idx listings is the strongest tool we have"); the pill is its fallback. */
      G.homes("town-surfside-beach", "Surfside Beach", G.offer("Surfside Beach", { label: "Get the homes for sale in Surfside Beach" }), "Homes for sale in Surfside Beach now") +
      h.h3("How far is everything?") +
      h.p(`Drive times by car from the pier, without traffic. Summer traffic on US 17 Business is slower.`) +
      h.table(["From the Surfside Beach Pier to", "By car, about"], [
        ["Food Lion on US 17 Business", `${D.food}${NB}min`],
        ["Garden City Pier", `${D.gc}${NB}min`],
        ["Myrtle Beach State Park", `${D.park}${NB}min`],
        ["Tidelands Waccamaw Community Hospital", `${D.hosp}${NB}min`],
        ["The MarshWalk in Murrells Inlet", `${D.marsh}${NB}min`],
        ["Market Common", `${D.mc}${NB}min`],
        ["Myrtle Beach International Airport", `${D.air}${NB}min`],
        ["Broadway at the Beach", `${D.bway}${NB}min`],
      ]) },

    { h2: "Is Surfside Beach part of Myrtle Beach?", toc: "Its own town", id: "own-town", html: () =>
      h.p(`No. Surfside Beach is its own town in Horry County, incorporated in 1964, with its own council, police department and beach rules. Its mailing ZIP code is 29575.`) +
      h.p(`A "Surfside Beach" address does not prove a home is in the town. Of the homes for sale with that address when we counted, about two in three were outside the town limits.`) +
      h.p(`Those homes are on county land, where the town's rental rules do not apply. Horry County's zoning has no limit on how long a home there may be rented, but a subdivision's recorded rules can. We read those rules for the home you like.`) +
      `<div class="c3-sb-note"><b>How the town began.</b> Much of its land was once the Ark Plantation. The beach was later called Roach's Beach, then Floral Beach, and took the name Surfside Beach in 1952. Hurricane Hazel in 1954 destroyed 18 of the 65 houses then at the beach.</div>` +
      h.h3("What do you own at Ocean Lakes?") +
      h.p(`Ocean Lakes Family Campground is next to the town's north end, about ${D.ol} minutes from the pier by car, and it is not in the town. It has about 2,600 sites leased by the year.`) +
      h.p(`At Ocean Lakes you buy the house, mobile home or camper on the site, not the land. The site comes with a yearly lease from the campground, and we go through it with you before you offer.`) +
      G.offer("Ocean Lakes", { label: "Ask about a home in Ocean Lakes" }) },

    { h2: "Where can you rent by the night in Surfside Beach?", toc: "Rental map", id: "rental-map", html: (bg) =>
      h.p(`Nightly rentals are allowed only on the blocks near the ocean, the orange band on the map. The town calls them its R3 and C3 zones, and its own zoning sheet names R3 "High Density/Weekly Rental".`) +
      MAP +
      h.p(`North of the pier, the line follows Dogwood Drive North, and houses on that street fall on both sides. South of the pier, it follows Willow Drive South for about 0.3 mile, to about 6th Avenue South. From there it follows Lakeside Drive: houses on the ocean side of Lakeside are on the rental side, and houses on its inland side are not.`) +
      h.p(`At the pier, the town's entertainment district breaks the band. Inland, the green streets reach back to the commercial strip on US 17 Business. On those streets the town allows rentals of a year or more, and none under 30 days.`) +
      h.p(`The gray areas are planned developments and commercial land. Each planned development has its own approved uses, so we read the approval for the parcel.`) +
      side(h.h3("What the line looks like from the air"),
        photo(LINE, "Near the pier, from the air. Inside the green line: inland streets, no rentals under 30 days. Inside the orange line: nightly rentals allowed. Land outside both lines is in other districts. Lines drawn by Chapter3 from the town's zoning map."),
        h.p(`The two sides look different. Near the ocean, tall beach houses stand close together on small lots. Inland, houses are farther apart, under the trees.`),
        h.cta("Is the house you like on the rental side?", "Send us the listing or the address. We place it on the town's zoning map and tell you which rules apply before you offer.", "Send us the listing", "/contact/", bg)) },

    { h2: "What do homes cost in Surfside Beach?", toc: "Home prices", id: "prices", html: (bg) =>
      h.p(`A house near the ocean costs about twice an inland house. In the past year, houses near the ocean sold for about $1 million at the middle, and inland houses for about ${r5k(R2H.median)} to ${r5k(R1H.median)}.`) +
      PRICE_CHART +
      h.p(`The two sides are built to different rules. Near the ocean, the town allows taller buildings on smaller lots:`) +
      compareCards([
        { name: "Near the ocean (R3)", cells: { str: "Allowed", tall: "55 feet", lot: "3,600 sq ft (3,000 attached)" } },
        { name: "Inland, smaller lots (R2)", cells: { str: "Not allowed", tall: "35 feet", lot: "6,000 sq ft" } },
        { name: "Inland, largest lots (R1)", cells: { str: "Not allowed", tall: "35 feet", lot: "9,000 sq ft" } },
      ], [{ key: "str", label: "Nightly rentals" }, { key: "tall", label: "Tallest building" }, { key: "lot", label: "Smallest lot for a house" }], { caption: "The town's building rules near the ocean and inland", nameLabel: "Where" }) +
      h.p(`Nearly half of the recent buyers whose deed we could match gave a mailing address outside South Carolina.`) +
      h.p(`Most houses for sale in the town had no HOA (homeowners association) fee when we counted, about 6 in 7. Our page on ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")} covers what that lets you park and build.`) +
      h.cta("Know what one Surfside Beach home is worth", "Send us the address. We pull the recorded sales on its street and its side of the line, and tell you what they say about the price.", "Have us pull the sales", "/contact/", bg) },

    { h2: "What does it cost to own a home in Surfside Beach each year?", toc: "Yearly cost", id: "yearly-cost", html: (bg) =>
      h.p(`Besides the mortgage and home insurance, the yearly cost here is mostly property tax and flood insurance. Both depend on where the house is and how you use it.`) +
      COST_TABLE +
      h.p(`A buyer's tax starts from the county's value, which resets toward the price at the sale. Owners who bought years ago often pay less because of the state's 15 percent cap on reassessment.`) +
      h.h3("Why a main home pays about a third as much") +
      h.p(`South Carolina does not tax the whole value of a home. For your main home, the tax rate applies to 4 percent of the county's value, and the school operating tax is skipped.`) +
      h.p(`For a second home or rental, the rate applies to 6 percent of the value, with every tax. On the same home, that makes the tax about 3 times as much. Our ${h.a("/buyers/property-taxes/", "property tax calculator")} has every town's rate.`) +
      h.h3("Flood insurance near the ocean and inland") +
      h.p(`From the pier to the south end of town, most homes are on the rental side. There, a typical flood policy on a house costs about $1,250 a year. On the inland streets it is about $700.`) +
      h.p(`FEMA takes 15 percent off flood insurance in the town, for the town's flood rules and programs.`) +
      h.cta("Get the yearly cost of one address", "Send us the address. We work out its tax as a main home and as a rental, and get a flood quote for the house.", "Have us price the tax", "/contact/", bg) },

    { h2: "Does Surfside Beach flood?", toc: "Flooding", id: "flooding", html: (bg) =>
      h.p(`Inland, few homes are in a high-risk flood zone: ${pct(ST["R2/all"].pct_high_risk)} on the smaller-lot streets and ${pct(ST["R1/all"].pct_high_risk)} on the largest lots. Near the ocean it is most homes, and every home on the ocean side of Ocean Boulevard. To check one address, use our ${h.a("/buyers/flood-zone-check/", "flood map check")}.`) +
      FLOOD_CHART +
      h.p(`A federally backed or regulated mortgage on a home in a high-risk zone requires flood insurance.`) +
      h.h3("The 48 percent rule") +
      h.p(`This town rule matters most for an older, low house. It covers a building whose lowest floor is below the 100-year flood level, the flood height on FEMA's map.`) +
      h.p(`If repairs or improvements cost 48 percent or more of the building's value, the whole building must be raised. It goes up to that flood level plus 3 feet.`) +
      h.p(`The town uses the county assessor's building value, land excluded, unless the owner submits a licensed appraisal. Half the town's homes were built before about 1985.`) +
      h.p(`Before you offer on an older house near the ocean, we pull its flood zone and the county's building value. You then know how much work the rule allows before the house must be raised.`) +
      h.h3("What the storms did") +
      h.p(`The pier was first built in 1953. Hurricanes Hazel and Hugo each destroyed it, and after Hugo it was not rebuilt until 1993. Hurricane Matthew in 2016 took more than half of its length.`) +
      h.p(`Our pages on ${h.a("/buyers/undisclosed-flooding/", "finding out whether a house has flooded")} and ${h.a("/buyers/coastal-insurance/", "coastal insurance")} show what else we look at.`) +
      h.cta("Get the flood facts for one Surfside Beach house", "Send us the address. We pull its flood zone and the county's building value, and tell you where the 48 percent line falls.", "Have us check for flooding", "/contact/", bg) },

    { h2: "Can you Airbnb a house in Surfside Beach, and what does it earn?", toc: "Renting it out", id: "airbnb", html: (bg) =>
      h.p(`Yes, on the blocks near the ocean, with a town business license for each rental property. The owner also files the town's hospitality fee and local accommodations tax every month, even when nothing is due.`) +
      h.p(`Guests pay about 12 percent in lodging taxes on top of the rent, to the state, the county and the town. You collect it and send it on.`) +
      h.h3("What a Surfside Beach area rental takes in") +
      h.p(`AirROI, a rental data company, counts about ${r10x(STR.listings)} active Airbnb listings in its Surfside Beach market, which reaches past the town limits. The average one took in about ${r1000(STR.revenue)} in gross bookings over the past year, before costs.`) +
      h.p(`That was up about ${Math.round(STR.yoy)} percent on the year before. Most of the money comes in summer: the average listing takes in about five times as much in July as in January.`) +
      STR_CHART +
      h.h3("Worked example: a condo near the ocean, rented by the night") +
      h.p(`Take a condo near the ocean at about ${r1000(R3C.median)}, the middle condo sale there in the past year. Say it books what the average listing books, with no loan.`) +
      h.table(["One year of nightly renting", "About"], [
        ["Gross bookings, the average listing in AirROI's area", r1000(STR.revenue)],
        ["Town and county tax as a rental, if the county values it at the price paid", r10(taxRental(R3C.median))],
      ]) +
      h.p(`That leaves about ${r1000(STR.revenue - taxRental(R3C.median))} before every other cost: the condo dues, cleaning, management, insurance, utilities and any loan. Those depend on the building, so we price them for the exact unit before you offer.`) +
      h.cta("Thinking of renting a Surfside condo or house by the night?", "Send us the address. We confirm it is on the rental side, and price the tax, the dues and the insurance for that unit.", "Ask about renting it out", "/contact/", bg) +
      h.p(`What Airbnbs take in across eight towns is on our ${h.a("/invest/airbnb-income/", "Airbnb income page")}. The rules by town are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}, and the yearly rental math on our ${h.a("/invest/long-term-rental/", "long-term rental page")}.`) },

    { h2: "What are the pros and cons of living in Surfside Beach?", toc: "Pros and cons", id: "pros-cons", html: (bg) =>
      prosCons([
        { text: "About 2 miles of beach with 36 public accesses." },
        { text: "A new concrete pier, free to walk, with two restaurants." },
        { text: "Free summer concerts in Memorial Park and golf cart parades on Ocean Boulevard." },
        { text: "Owners who live elsewhere park free in town lots with two passes." },
      ], [
        { text: "Near the ocean, only about 1 home in 8 is taxed as its owner's main home.", act: "On the inland streets with the largest lots, about 7 in 10 are." },
        { text: "Flood insurance costs more near the ocean, and big work on a low house there can mean raising it.", act: "We check the zone and the building value first." },
        { text: "Two in three \"Surfside Beach\" listings are outside the town, under county rules.", act: "We check the town limits and the subdivision's rules for every listing." },
      ], { bg }) +
      h.p(`Comparing beach towns? Our guides to ${h.a("/submarkets/garden-city/", "Garden City")}, ${h.a("/submarkets/murrells-inlet/", "Murrells Inlet")} and ${h.a("/submarkets/myrtle-beach/", "Myrtle Beach")} cover their own rules and prices.`) },
  ],
  faqTitle: "Surfside Beach, SC FAQ",
  faq: [
    { q: "Is Surfside Beach part of Myrtle Beach?", a: "No. Surfside Beach is its own town in Horry County, incorporated in 1964, with the ZIP code 29575." },
    { q: "Can you Airbnb in Surfside Beach?", a: "Only on the blocks near the ocean, in the town's R3 and C3 zoning districts. Rentals under 30 days are not allowed in the inland R1 and R2 districts." },
    { q: "Can you drive a golf cart in Surfside Beach?", a: "Yes, on town streets posted at 35 mph or less, with a state permit decal, insurance and a licensed driver 16 or older. Never on the beach." },
    { q: "Are dogs allowed on Surfside Beach?", a: "Not from 10 a.m. to 5 p.m., May 1 through Labor Day. At other times, leashed dogs are welcome." },
    { q: "Is parking free in Surfside Beach?", a: "Town lots charge from March 1 to October 31, 8 a.m. to 6 p.m. An owner who lives elsewhere gets two free passes per household." },
    { q: "What is the property tax rate in Surfside Beach?", a: `On a home the county values at $500,000, the town and county tax is about ${r100(taxMain(500000))} a year as your main home. As a second home or rental, it is about ${r100(taxRental(500000))}.` },
    { q: "What schools serve Surfside Beach?", a: "Horry County Schools, which assigns schools by address. We look up the assigned schools for any home you like." },
    { q: "What about crime in Surfside Beach?", a: `We do not rate places for crime. The town has its own police department, and the FBI publishes the crime each police agency reports.` },
  ],
  sources: [
    { name: "town code", href: CODE },
    { name: "town zoning map", href: ZMAP },
    { name: "Horry County GIS", href: GIS },
    { name: "county deeds", href: DEEDS },
    { name: "county zoning", href: HORRYZONING },
    { name: "2026 tax levy", href: LEVY },
    { name: "SC Code 12-43", href: T12 },
    { name: "OpenFEMA", href: NFIP },
    { name: "42 U.S.C. 4012a", href: USC4012A },
    { name: "48 percent rule", href: RULE48 },
    { name: "the pier", href: PIERPAGE },
    { name: "town events", href: EVENTS },
    { name: "town beaches", href: BEACHES },
    { name: "parking", href: PARKING },
    { name: "SC Code 56-2", href: T56 },
    { name: "council minutes", href: MINUTES },
    { name: "license guide", href: LICENCE },
    { name: "SCDOR ST-575", href: ST575 },
    { name: "AirROI", href: AIRROI },
    { name: "Ocean Lakes", href: OCEANLAKES },
    { name: "Census 2020", href: CENSUS },
  ],
  sourcesNote: "Our counts: town zoning on county parcels and streets, flood maps and deeds. Listings in aggregate. Not legal or tax advice.",
  afterSources: () => CREDITS + PH.imageSchema(SHOWN),
  bottomCta: END,
  keywords: "Surfside Beach SC real estate, living in Surfside Beach SC, Surfside Beach SC short term rental map, Surfside Beach R3 zoning, Airbnb Surfside Beach SC, Surfside Beach SC homes for sale, is Surfside Beach part of Myrtle Beach, Surfside Beach golf cart parade, Surfside Beach events, Surfside Beach parking pass, Surfside Beach flood zone, Surfside Beach property tax rate, Ocean Lakes lot lease",
  about: "The Town of Surfside Beach, a beach town in Horry County, South Carolina",
});

function r1000(v) { return money(Math.round(v / 1000) * 1000); }
function r10k(v) { return money(Math.round(v / 10000) * 10000); }
function r50(v) { return money(Math.round(v / 50) * 50); }
function r10x(v) { return n(Math.round(v / 10) * 10); }
