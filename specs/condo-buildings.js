/* /invest/condo-buildings/ - Myrtle Beach and North Myrtle Beach oceanfront condo buildings: which one
 * fits what you want, an entry per building (south to north) with its units for sale, how the monthly
 * HOA fees compare building by building, what an oceanfront fee pays for, which buildings sell the most
 * units, and condo, condotel or timeshare.
 *
 * Batch 2026-11-b, Lane U. Version 1, 2026-11-09. The live page was hand-made in July (two wide tables
 * of 29 buildings, then condotel financing and fees); this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/invest-condo-buildings/PLAN.md. Demand: must-answer.md. Facts: facts.md, VERIFIED
 * rows and CORRECTED rows at the verifier's values and wording only (VERIFY.md; struck wording in
 * batches/2026-11-b/facts/invest-condo-buildings-struck.json).
 * Data: data/2026-11-b/invest-condo-buildings/ (findings.json, the per-building numbers; raw/building-
 * points.json and raw/oceanfront-addresses.json, the order south to north; ../hoa/fees-by-kind.json, the
 * whole oceanfront group). Every fee, price, count and share is read from those files here. The
 * verifier's corrections (rows 2, 4, 5, 6, 7, 8) are typed in CORR, with the row beside each, because
 * findings.json holds the researcher's first figures; each is checked against the figure it replaces.
 * Kept from the live page: the title and H1 (data/headlines.json), the directory south to north, the
 * three kinds of ownership, "the building matters more than the unit" (now the end band), the FAQ
 * questions on condotels, timeshares, loans and high fees, the internal links.
 * Cut (PLAN 1): "Not published" fee cells, the unsourced dues-rise and desk-split percentages, broker-page
 * build years, heights and unit counts, "eight approved projects", "Our team once fixed that",
 * Margaritaville (pre-construction, not in the feed), the condotel financing section (two sentences and
 * a link now), the two wide tables.
 * Homes strips: one per building entry (glass.js homes); the 29 places are in Blog-Brain
 * batches/2026-10-b/data/idx-places.json (index false), each search checked against the feed
 * (raw/strip-places-check.json). Until a strip fills, its pill to the contact form shows.
 * Version 2, fix round 1 (REVIEW-1.md): each entry opens with the place it sits or what the resort has
 * (ledger rows 26 to 41, VERIFIED-BY-FIXER: resort pages and measured distances to landmarks); the power
 * bill and pets moved to the table; "typical" defined once; Breakers moved to the table (its towers list
 * under other MLS names); Currents and the Sand Bottom Pool cut (no source says tower owners may use them).
 * Version 3, 2026-11-10 (owner: "a wow factor for all the buildings would make it an exceptional page. also make sure
 * its not cannibalizing"): each entry leads with one true thing a buyer would picture (rows 43 to 79, WOW-VERIFY.md),
 * then its counts and fees; each homes strip has its own title. Renting, loans and the investment question cut to a
 * sentence and a link each (the siblings own them); two FAQ questions that belonged to /invest/condotel-financing/
 * replaced by directory questions.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/condo-buildings/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-condo-buildings");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), PTS = read("raw/building-points.json"), ADDR = read("raw/oceanfront-addresses.json");
const HUB = JSON.parse(fs.readFileSync(path.join(DATA, "..", "hoa", "fees-by-kind.json"), "utf8")).segments.condo_oceanfront;
/* The one photo (photos.json in this page's data folder: CC BY-SA 4.0, copied from /invest/str-vs-ltr/ with its
   files; looked at full size 2026-11-09). It shows a row of towers on the beach and names no building. */
const PHOTO = read("photos.json").photos[0];
const must = (ok, msg) => { if (!ok) throw new Error(`condo-buildings.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);
/* One rounding for a sale price everywhere on the page: to $1,000 under $200,000, else to $5,000
   (row 7: Margate's 950,632 is printed "about $950,000"). */
const rs = (v) => (v < 200000 ? r1k(v) : r5k(v));

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                              */

must(F.counts.buildings === 47 && F.counts.with_fee === 45 && F.counts.july_buildings === 28 && F.counts.july_with_fee === 26, "row 1 changed");
/* Row 3 (VERIFIED): the whole oceanfront group, the hub's figure. */
must(F.hub_oceanfront.total === 1106 && F.hub_oceanfront.median === 920 && F.hub_oceanfront.p25 === 730 && F.hub_oceanfront.p75 === 1140, "row 3 changed");
must(HUB.total === 1106 && HUB.quartiles.median.at_or_below === 920, "fees-by-kind.json disagrees with row 3");
/* Row 16 (VERIFIED, re-counted live by the verifier): what the listings say an oceanfront fee includes. */
const COV = HUB.covers, share = (k) => Math.round(COV[k].share_of_with_fee * 100);
must(COV.hoa_includes_water_sewer.with_flag === 1068 && COV.hoa_includes_insurance.with_flag === 896 && COV.hoa_includes_internet.with_flag === 974 && COV.hoa_includes_electric.with_flag === 631, "row 16 changed");
must(share("hoa_includes_water_sewer") === 97 && share("hoa_includes_internet") === 88 && share("hoa_includes_insurance") === 81 && share("hoa_includes_electric") === 57, "row 16 shares");

/* The verifier's corrections (VERIFY.md), each checked against the value it replaces. */
const CORR = {
  /* Row 2, 4, 8: 10 listings in the building carry the oceanfront flag; no bedroom or flag shares. */
  "crescent-shores": { was: { fee: 1070, for_sale: 14 }, set: { fee: 1270, for_sale: 10, with_fee: 10, fee_band: null, asking_median: 560000, beds: null, flags: null } },
  /* Row 2, 4, 8: re-pulled with the city; 11 in the building. */
  "holiday-pavilion": { was: { fee: 1055, for_sale: 15 }, set: { fee: 1055, for_sale: 11, with_fee: 11, fee_band: null, asking_median: 150000, beds: { 0: 6, 1: 5 }, flags: { hoa_includes_electric: 9, pets_allowed: 1, indoor_pool: 9 } } },
  /* Rows 5 to 7: struck, the county's records could not be tied to the listings. */
  "mb-resort": { was: { units: 244, sales: 15 }, set: { units: null, sales: null, sales_median: null, struck: true } },
  "ocean-creek": { was: { units: 163, sales: 11 }, set: { units: null, sales: null, sales_median: null, struck: true } },
  /* Rows 5 to 7: names on the same footprint added. */
  "maisons-sur-mer": { was: { units: 229, sales: 14, sales_median: 588000 }, set: { units: 252, sales: 16, sales_median: 583000 } },
  "sands-ocean": { was: { units: 464, sales: 32, sales_median: 134000 }, set: { units: 491, sales: 36, sales_median: 138000 } },
  "beach-cove": { was: { units: 328, sales: 36, sales_median: 172000 }, set: { units: 334, sales: 37, sales_median: 171000 } },
  /* Rows 6, 7: one deed of $8,424,000 moved 24 units; 6 one-unit sales. */
  "prince": { was: { sales: 7, sales_median: 375000 }, set: { sales: 6, sales_median: 365000 } },
};
const RAW = Object.fromEntries(F.buildings.map((b) => [b.slug, b]));
must(Object.keys(RAW).length === 47, "47 buildings");
for (const [slug, c] of Object.entries(CORR)) {
  const b = RAW[slug]; must(b, `no building ${slug}`);
  for (const [k, v] of Object.entries(c.was)) must(b[k] === v, `${slug}.${k} is ${b[k]}, not ${v}: the data was re-run, recheck the correction`);
  Object.assign(b, c.set);
}
/* Row 6: Sea Mist's 64 sales are 62 units (2 sold twice). */
const SEA_MIST_UNITS_SOLD = 62;
must(RAW["sea-mist"].sales === 64 && RAW["sea-mist"].units === 271, "row 6 Sea Mist changed");

/* Position south to north: the building's mean listing point, else its main street's point. */
const lat = (b) => {
  if (PTS[b.slug]) return PTS[b.slug][0];
  const bf = read("building-fees.json").buildings[b.slug];
  const st = bf && bf.streets && bf.streets[0] && bf.streets[0][0];
  const a = st && ADDR.buildings.find((x) => `${x.street} | ${x.city}` === st);
  return a ? a.lat : null;
};
F.buildings.forEach((b) => { b.lat = lat(b); });
const B = (slug) => { const b = RAW[slug]; must(b, `no building ${slug}`); return b; };
const fl = (b, k) => (b.flags ? b.flags[k] : null);
const bedsAtLeast = (b, k) => Object.entries(b.beds || {}).reduce((t, [n, c]) => t + (+n >= k ? c : 0), 0);
const fee = (slug) => money(B(slug).fee);
const sold = (slug) => rs(B(slug).sales_median);
const ask = (slug) => r5k(B(slug).asking_median);

/* The facts the entries state, checked here. */
const WITH = F.buildings.filter((b) => b.fee);
const byFee = WITH.slice().sort((a, b) => a.fee - b.fee);
must(byFee[0].slug === "sands-ocean" && byFee[0].fee === 425 && byFee[byFee.length - 1].slug === "margate" && byFee[byFee.length - 1].fee === 1820, "row 2: the lowest and highest fees changed");
must(byFee[byFee.length - 2].slug === "dunes-village" && byFee[byFee.length - 3].slug === "royale-palms", "row 2: second and third highest fees changed");
const SALES = F.buildings.filter((b) => b.sales >= 5 && b.sales_median);
const bySale = SALES.slice().sort((a, b) => a.sales_median - b.sales_median);
must(bySale[0].slug === "sea-mist" && bySale[1].slug === "coral-beach" && bySale[bySale.length - 1].slug === "margate" && bySale[bySale.length - 2].slug === "north-beach-towers", "row 7: the lowest and highest sale prices changed");
must(B("landmark").units === 571 && F.buildings.every((b) => b.slug === "landmark" || !(b.units > 571)), "row 5: Landmark is the most units");
must(B("landmark").for_sale === 93 && F.buildings.every((b) => b.slug === "landmark" || b.for_sale < 93), "row 4: Landmark has the most for sale");
must(F.buildings.every((b) => b.slug === "mb-resort" || !b.beds || (b.beds["2"] || 0) < 35) && B("mb-resort").beds["2"] === 35, "row 4: Myrtle Beach Resort has the most two-bedrooms for sale");
must(F.buildings.every((b) => b.slug === "sand-dunes" || !b.beds || (b.beds["3"] || 0) < 20) && B("sand-dunes").beds["3"] === 20, "row 4: Sand Dunes has the most three-bedrooms for sale");
must(F.buildings.every((b) => b.slug === "margate" || !(b.sqft_median > 2426)), "row 4: Margate has the largest units");
const band = (b) => (b.fee_band ? b.fee_band[1] - b.fee_band[0] : 0);
must(F.buildings.every((b) => b.slug === "caribbean" || band(b) < band(B("caribbean"))), "row 2: Caribbean has the widest middle half");
must(B("coral-beach").fee_year_pct_of_sale === 18.8 && B("sea-mist").fee_year_pct_of_sale === 13.8 && B("landmark").fee_year_pct_of_sale === 10.9 && B("north-beach-towers").fee_year_pct_of_sale === 1.8 && B("margate").fee_year_pct_of_sale === 2.3, "row 9 changed");
["margate", "brighton", "royale-palms", "south-hampton", "north-beach-towers", "palace", "meridian-plaza", "carolina-winds"].forEach((s) => must(fl(B(s), "hoa_includes_electric") === 0, `row 4: ${s} electric`));
const NO_POWER = F.buildings.filter((b) => b.flags && b.for_sale && fl(b, "hoa_includes_electric") === 0).length;
must(NO_POWER === 10, `row 4: ${NO_POWER} buildings with no listing saying the fee pays the power bill`);
must(fl(B("landmark"), "hoa_includes_electric") === 80 && fl(B("caravelle"), "hoa_includes_electric") === 38, "row 4 electric examples");
must(fl(B("margate"), "pets_allowed") === 8 && fl(B("royale-palms"), "pets_allowed") === 12 && fl(B("coral-beach"), "pets_allowed") === 0 && fl(B("sea-mist"), "pets_allowed") === 1, "row 4 pets examples");
must(B("brighton").fee < B("south-hampton").fee && B("south-hampton").fee < B("margate").fee, "Kingston fees order");
must(B("south-hampton").units < B("brighton").units && B("brighton").units < B("margate").units && B("south-hampton").sales_median < B("brighton").sales_median, "Kingston sizes order");
/* The sales chart: buildings with 30 or more one-unit sales (rows 6, 7, corrected). */
const TOPSALES = F.buildings.filter((b) => b.sales >= 30).sort((a, b) => b.sales - a.sales || a.name.localeCompare(b.name));
must(TOPSALES.map((b) => b.slug).join() === "sea-mist,landmark,coral-beach,compass-cove,beach-cove,sands-ocean,bay-watch,caravelle,sand-dunes", `the sales chart's buildings changed: ${TOPSALES.map((b) => b.slug)}`);
const PCTS = F.buildings.filter((b) => b.units && b.sales !== null && b.sales !== undefined).map((b) => b.sales / b.units).sort((a, b) => a - b);
const MID_PCT = PCTS[Math.floor(PCTS.length / 2)];
const ONE_IN = Math.round(1 / MID_PCT);
must(ONE_IN === 17, `the middle building's share of units sold is 1 in ${ONE_IN}`);
must(F.buildings.every((b) => b.slug === "sea-mist" || !(b.units && b.sales) || b.sales / b.units < 64 / 271), "row 6: Sea Mist sells the most often");
must(B("towers-on-the-grove").sales === 0 && B("towers-on-the-grove").units === 236, "row 6: Towers on the Grove");
must(B("monterey-bay").sales === 20 && B("monterey-bay").units === 195, "row 6: Monterey Bay");
must(Math.round(B("beach-cove").units / B("beach-cove").sales) === 9, "row 6: Beach Cove about 1 in 9");

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main: the approved 2026-11-08 treatment (garden-city.js, hoa.js).   */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = "<style>"
  /* The headline: the italic line at about half the H1's size. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  /* Key facts: short rows under rules on a phone. */
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance span.t{line-height:1.3}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:minmax(0,1fr)!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}${S} .c3-glance li>span:last-child{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:.1rem .8rem;flex:1;min-width:0}${S} .c3-glance strong{font-size:1rem!important;flex:1 1 auto;min-width:0}${S} .c3-glance span.t{white-space:nowrap;flex:0 0 auto}}`
  /* The contents list: no card, in columns between two thin rules. */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(4,minmax(0,1fr))}}`
  + `${S} nav[aria-label="On this page"] li a{padding:.5rem 0!important}`
  /* The guide: a plain list under thin rules, each want then its buildings. */
  + `${S} .c3-cb-guide{list-style:none;margin:.4rem 0 1rem;padding:0;max-width:720px;border-bottom:${RULE}}`
  + `${S} .c3-cb-guide li{margin:0;padding:.65rem 0 .7rem;border-top:${RULE};line-height:1.55;color:var(--muted);font-size:var(--read,1.0625rem)}`
  + `${S} .c3-cb-guide b{display:block;color:var(--navy);font-weight:650;margin-bottom:.1rem}`
  /* Each building: its name as the heading, its text, then its units for sale. */
  + `${S} h3.c3-cb-h3{font-family:var(--serif);font-size:1.4rem;color:var(--navy);margin:2.4rem 0 .6rem;line-height:1.3;scroll-margin-top:90px}`
  + `${S} h3.c3-cb-h3:first-of-type{margin-top:1.4rem}`
  + `${S} .c3-cb-lead{font-family:var(--sans);font-size:.8rem;letter-spacing:.12em;text-transform:uppercase;font-weight:650;color:var(--g-ink,#8a5226);margin:2.6rem 0 0}`
  + `${S} .hx-strip:not(:empty){margin:1rem 0 .4rem}${S} .hx-fallback .c3-offer{margin:1rem 0 .4rem}`
  /* The table of every building: plain, under thin rules; on a phone the name, then three values in a row. */
  + `${S} .c3-cb-tab{max-width:760px;margin:1.2rem 0 .6rem}`
  + `${S} .c3-cb-tab table{width:100%;border-collapse:collapse;font-family:var(--sans);color:var(--navy);font-size:1rem}`
  + `${S} .c3-cb-tab caption{text-align:left;font-weight:600;padding:0 0 .6rem;line-height:1.4;font-size:1.0625rem}`
  + `${S} .c3-cb-tab th,${S} .c3-cb-tab td{padding:.5rem .4rem;border-bottom:${RULE};text-align:left;vertical-align:top;line-height:1.35}`
  + `${S} .c3-cb-tab th:first-child{padding-left:0}${S} .c3-cb-tab td:last-child,${S} .c3-cb-tab th:last-child{padding-right:0}`
  + `${S} .c3-cb-tab thead th{font-size:.9rem;font-weight:600;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .c3-cb-tab th.grp{font-size:.8rem;font-weight:650;letter-spacing:.1em;text-transform:uppercase;color:var(--g-ink,#8a5226);padding-top:1rem}`
  + `${S} .c3-cb-tab tbody th[scope=row]{font-weight:600}${S} .c3-cb-tab tbody th .c{display:block;font-weight:400;font-size:.9rem;color:var(--muted)}`
  + `${S} .c3-cb-tab td{font-variant-numeric:tabular-nums}${S} .c3-cb-tab td .l{display:none}${S} .c3-cb-tab td.w{color:var(--muted);font-size:.95rem}`
  + `@media (max-width:599px){${S} .c3-cb-tab table,${S} .c3-cb-tab tbody,${S} .c3-cb-tab caption{display:block;width:100%}`
  + `${S} .c3-cb-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .c3-cb-tab tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:.8rem;padding:.6rem 0;border-bottom:${RULE}}`
  + `${S} .c3-cb-tab th,${S} .c3-cb-tab td{border:0;padding:0}${S} .c3-cb-tab tbody th{grid-column:1/-1;padding-bottom:.3rem}`
  + `${S} .c3-cb-tab tbody th .c{display:inline;margin-left:.4rem}${S} .c3-cb-tab th.grp{padding:.8rem 0 0}`
  + `${S} .c3-cb-tab td .l{display:block;font-size:.8125rem;color:var(--muted)}${S} .c3-cb-tab td.w{font-size:.9rem}${S} .c3-cb-tab tr.none td{grid-column:1/-1}}`
  + `${S} .c3-cb-note{font-size:1rem;color:var(--muted);line-height:1.6;max-width:720px;margin:.2rem 0 1.2rem}`
  /* What the fee includes: a short list under rules. */
  + `${S} .c3-cb-cov{list-style:none;margin:.6rem 0 1.2rem;padding:0;max-width:720px;border-bottom:${RULE}}`
  + `${S} .c3-cb-cov li{display:grid;grid-template-columns:5.6rem 1fr;gap:.8rem;align-items:baseline;margin:0;padding:.55rem 0;border-top:${RULE};color:var(--navy);line-height:1.4}`
  + `${S} .c3-cb-cov li b{font-variant-numeric:tabular-nums;font-weight:650}${S} .c3-cb-more li{grid-template-columns:6.2rem 1fr;color:var(--muted);line-height:1.55}${S} .c3-cb-more li b{color:var(--navy)}@media (max-width:599px){${S} .c3-cb-more li{grid-template-columns:1fr;gap:.15rem}}`
  + `${S} h2{text-wrap:balance}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The end band: the edge writes the listings notice after it (the same fix as garden-city.js and hoa.js). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (max-width:359px){.c3-glance{grid-template-columns:minmax(0,1fr)!important}}`
  /* One block width. */
  + `${S} .c3-gchart,${S} .c3-cb-tab,${S} .c3-cb-guide,${S} .c3-cb-cov{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* The buildings with an entry, and their homes strips.                            */

/* slug in findings.json -> the strip's place slug (BUILD.md, for idx-places.json), also the entry's id. */
const PLACE = {
  "mb-resort": "myrtle-beach-resort", "compass-cove": "compass-cove", "bluewater": "bluewater-resort", "landmark": "landmark-resort",
  "palace": "the-palace", "sea-mist": "sea-mist-resort", "coral-beach": "coral-beach-resort", "bay-view": "bay-view-resort",
  "camelot": "camelot-by-the-sea", "caribbean": "caribbean-resort", "beach-colony": "beach-colony",
  "dunes-village": "dunes-village-resort", "monterey-bay": "monterey-bay-suites", "grande-cayman": "grande-cayman-resort",
  "caravelle": "caravelle-resort", "ocean-reef": "ocean-reef-resort", "sand-dunes": "sand-dunes-resort", "sands-ocean": "sands-ocean-club",
  "margate": "margate-tower", "brighton": "brighton-tower", "south-hampton": "south-hampton", "royale-palms": "royale-palms",
  "seawatch": "seawatch-resort", "ocean-creek": "ocean-creek-resort", "north-beach-towers": "north-beach-towers",
  "beach-cove": "beach-cove-resort", "bay-watch": "bay-watch-resort", "avista": "avista-resort", "prince": "prince-resort",
};
const id = (slug) => { must(PLACE[slug], `no entry for ${slug}`); return PLACE[slug]; };
const go = (slug, text) => h.a(`#${id(slug)}`, text || B(slug).name);
/* A building in the table only links to the table. */
const goT = (slug, text) => h.a("#every-building", text || B(slug).name);

const strip = (slug, head) => {
  const name = B(slug).name;
  return G.homes(id(slug), name, G.offer(name, { label: `Get the condos for sale at ${name}` }), head);
};
/* Each entry: the name, the wow and the facts, then its homes strip under its own bold, true title (owner, 2026-11-10). */
const entry = (slug, head, paras) => `<h3 id="${id(slug)}" class="c3-cb-h3">${B(slug).name}</h3>` + paras.map((p) => h.p(p)).join("") + strip(slug, head);

/* Shares in words (owner, PLAIN-2: few numbers). Row 4: under 8 listings, the count is said instead. */
const WORD = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];
const w = (v) => (v <= 10 ? WORD[v] : n0(v));
/* The word a sentence uses for a flag share is checked against the data: [low, high] share of listings. */
const SAY = { none: [0, 0], one: [1, 1], few: [0.01, 0.15], some: [0.15, 0.4], half: [0.4, 0.6], most: [0.5001, 0.9999], almost: [0.85, 0.9999], every: [1, 1] };
const says = (slug, k, word) => {
  const b = B(slug), v = fl(b, k), of = b.for_sale, r = v / of;
  must(v !== null && v !== undefined, `${slug}.${k}: no flag`);
  must(of >= 8 || word === "count", `${slug}.${k}: under 8 listings, say the count`);
  if (word === "count") return w(v);
  const [lo, hi] = SAY[word];
  must(word === "one" ? v === 1 : word === "none" ? v === 0 : r >= lo && r <= hi, `${slug}.${k}: ${v} of ${of} is not "${word}"`);
  return word;
};

/* Distances to landmarks (rows 26 to 28, VERIFIED-BY-FIXER): landmark-distances.json, made by landmark_distances.py from
   the listings' mean points and OpenStreetMap. Each phrase is checked against the measured miles. */
const DIST = read("landmark-distances.json");
const NEAR = { "beside": [0, 0.08], "about a quarter mile": [0.2, 0.3], "about a third of a mile": [0.3, 0.4], "about half a mile": [0.4, 0.6],
  "about three quarters of a mile": [0.65, 0.85], "under a mile": [0.75, 0.99], "about a mile": [0.9, 1.1], "a little over a mile": [1.0, 1.25],
  "about a mile and a half": [1.4, 1.65], "about two and a half miles": [2.35, 2.65] };
const far = (slug, landmark, phrase, side) => {
  const r = DIST.pairs.find((x) => x.building === slug && x.landmark === landmark) || DIST.neighbors.find((x) => x.building === slug && x.of === landmark);
  must(r, `no distance from ${slug} to ${landmark}`);
  const [lo, hi] = NEAR[phrase]; must(r.miles >= lo && r.miles <= hi, `${slug} to ${landmark} is ${r.miles} miles, not "${phrase}"`);
  if (side) must(r.side === side, `${slug} is ${r.side} ${landmark}, not ${side}`);
  return phrase;
};

/* The entries, south to north (by the listings' points). Version 3 (owner, 2026-11-10: "a wow factor for all the
   buildings would make it an exceptional page"): each entry opens with the one true thing a buyer would picture and
   want, from rows 43 to 79 as the verifier wrote them (Blog-Brain batches/2026-11-b/invest-condo-buildings/
   WOW-VERIFY.md and WOW.md). The counts and fees follow, cut to what the wow does not already say. The strip title
   is the same fact, said boldly. Rows 50, 51 and 56 are struck or blocked: Sea Mist, Coral Beach and Dunes Village
   keep their best verified detail (WOW.md, open). Heights: the FAA's figure with "about" where its accuracy is loose;
   no height for Bay View, Beach Colony or Ocean Creek (rows 52, 55, 68). Every figure from the data is read here. */
const E = {
  "mb-resort": () => entry("mb-resort", "Myrtle Beach Resort condos, a mile south of the state park's forest", [
    /* Rows 43 (FAA DOF 45-000740, about 236 ft), 26 and 41 (1.03 mi to the park's parcel: "more than a mile"). */
    `Myrtle Beach Resort's Renaissance Tower stands about 236 feet tall, the southernmost tower on this page. More than a mile up the beach is Myrtle Beach State Park, with its seaside forest and fishing pier, one of the last green stretches of beachfront on the Grand Strand.`,
    `The resort has more two-bedroom units for sale than any other building here. Every listing gives the same address, so we find which tower a unit is in before you offer. The typical unit asks about ${ask("mb-resort")}, with a fee near ${fee("mb-resort")} a month.`,
  ]),
  "compass-cove": () => entry("compass-cove", "Oceanfront condos at Compass Cove, with 23 water features", [
    /* Rows 31, 44, 45 (FAA DOF 45-020957, 166 ft, 1A). */
    `Compass Cove has 23 water features, among them three lazy rivers and two waterslides, the Schooner Screamer and the Compass Cruiser. The Crow's Nest Oceanfront Bar & Grill is on site.`,
    /* Row 26. */
    `It stands ${far("compass-cove", "Springmaid Pier", "under a mile", "north of")} north of Springmaid Pier. Units here change hands often: only three buildings on this page had more sales. Most are studios and one-bedrooms, and they sold for about ${sold("compass-cove")}, with fees near ${fee("compass-cove")} a month.`,
  ]),
  "bluewater": () => entry("bluewater", "Oceanfront condos at Bluewater Resort, with indoor pickleball", [
    /* Row 46 (the resort's own site). Row 26. */
    `Bluewater has indoor pickleball and racquetball courts, so you can play all year. It stands about halfway between Springmaid Pier and Family Kingdom's rides, ${far("bluewater", "Springmaid Pier", "a little over a mile") && far("bluewater", "Family Kingdom", "a little over a mile")} from each.`,
    /* Row 5 (CORRECTED): "about $94,000" only as the middle of 22 sales. */
    `It is mostly one-bedrooms, and most list the same fee, about ${fee("bluewater")} a month. Its sales in the past year had a typical price of about ${sold("bluewater")}. Its name covers more than one kind of unit, so we price a Bluewater unit from sales of units like it.`,
  ]),
  "palace": () => entry("palace", "Condos in the Palace, a 241-foot tower on the ocean", [
    /* Rows 47 (FAA DOF 45-000725, 241 ft, 1A; floors numbered to 23), 48 (passes are for "a Palace Resort guest"). */
    `The Palace stands 241 feet tall. It has two beach accesses and a putting green next to its oceanfront pools, and its guests get two free passes a day to the H2Oasis water park at Landmark, in season.`,
    /* Row 27. */
    `It stands ${far("palace", "landmark", "beside")} Landmark Resort. Its units for sale are studios, one-bedrooms and two-bedrooms in about equal numbers. A typical unit sold for about ${sold("palace")}, with a typical fee of about ${fee("palace")} a month.`,
  ]),
  "landmark": () => entry("landmark", "Oceanfront condos at Landmark Resort, home of the H2Oasis water park", [
    /* Row 49. Row 17 (VERIFIED): the water park is for rental-program guests. */
    `Landmark has 17 water features. Its 300-foot indoor lazy river is heated and open all year, and a second one runs outside in season. Its water park, H2Oasis, has three slides, for guests who stay through the resort's own rental program.`,
    /* Rows 4, 5, 26. */
    `It is the biggest building on this page, with ${n0(B("landmark").units)} units, and it has more for sale this week than any other. Family Kingdom's rides are ${far("landmark", "Family Kingdom", "under a mile")} north. Every unit for sale is a studio or a one-bedroom. They sold for about ${sold("landmark")}, with a typical fee near ${fee("landmark")} a month.`,
  ]),
  "sea-mist": () => entry("sea-mist", "The lowest-priced oceanfront condos on this page: Sea Mist Resort", [
    /* Row 50 STRUCK (the Wahoo Waterpark): the price is the wow (rows 6, 7, verified). Row 26. */
    `Sea Mist Resort is where an oceanfront condo costs the least: a typical unit sold for about ${sold("sea-mist")}, the lowest here.`,
    `Family Kingdom's rides are ${far("sea-mist", "Family Kingdom", "about half a mile", "south of")} north, and the 2nd Avenue Pier at the Boardwalk's south end is ${far("sea-mist", "2nd Avenue Pier", "under a mile")} away. Every unit for sale this week is a studio, asking about ${ask("sea-mist")}, with a fee near ${fee("sea-mist")} a month.`,
  ]),
  "coral-beach": () => entry("coral-beach", "Oceanfront condos at Coral Beach, among the lowest-priced here", [
    /* Row 51 BLOCKED (the bowling alley): rows 7 and 27 (the fallback). Row 2 (CORRECTED: the verifier's wording for the fee). */
    `Coral Beach Resort stands ${far("coral-beach", "sea-mist", "beside", "north of")} Sea Mist, on its north side, and its units sold for about ${sold("coral-beach")}, the second lowest here. Only ${w(F.buildings.filter((b) => b.sales > B("coral-beach").sales).length)} buildings had more sales.`,
    `Most of its ${B("coral-beach").for_sale} units for sale are one-bedrooms, and the typical fee is about ${fee("coral-beach")} a month. That is a high fee for the price, so we get the building's budget before you offer, to see what it pays for.`,
  ]),
  "bay-view": () => entry("bay-view", "Condos at Bay View, right on the Myrtle Beach Boardwalk", [
    /* Rows 52 (CORRECTED: no height), 32, 26. */
    `Bay View sits right in front of the Boardwalk, and Starbucks is on the ground floor of the tower. The 2nd Avenue Pier is about a third of a mile south, and the SkyWheel is about half a mile north.`,
    `Inside are a heated pool and a heated lazy river. Most units for sale are one-bedrooms. They sold for about ${sold("bay-view")}, and the typical fee is about ${fee("bay-view")} a month.`,
  ]),
  "camelot": () => (far("camelot", "Pier 14", "about half a mile", "north of"), entry("camelot", "Oceanfront condos at Camelot by the Sea, a walk from the Boardwalk", [
    /* Row 53 (0.42 mi to Pier 14, 0.54 mi to the SkyWheel). */
    `From Camelot by the Sea, the Boardwalk's north end at Pier 14 is about a ten-minute walk, and the SkyWheel is ${far("camelot", "SkyWheel", "about half a mile", "north of")} away.`,
    `It charges one of the lowest fees on the oceanfront, about ${fee("camelot")} a month, and its units, from studios to three bedrooms, sold for about ${sold("camelot")}.`,
  ])),
  "caribbean": () => entry("caribbean", "Oceanfront condos at the Caribbean, beside Sea Captain's House", [
    /* Rows 33, 54, 27. */
    `The Caribbean has a lazy river outside and a second one indoors. Beside it is the restaurant Sea Captain's House, which began as an oceanfront beach cottage built in 1930.`,
    `Its units run from one-bedrooms to four bedrooms, the widest spread of fees on this page: a larger unit pays a much larger fee. A Caribbean unit sold for about ${sold("caribbean")}, with a typical fee of about ${fee("caribbean")} a month.`,
  ]),
  "beach-colony": () => (says("beach-colony", "pets_allowed", "almost"), entry("beach-colony", "Beach Colony condos, with a lawn and hammocks by the sand", [
    /* Rows 55 (CORRECTED: no height), 37, 27. */
    `Between Beach Colony's pool deck and the sand is an oceanfront lawn with hammocks. There is a lazy river too, with indoor and outdoor pools.`,
    `It stands ${far("dunes-village", "beach-colony", "beside") && "next to"} Dunes Village and has one of the lowest fees here, about ${fee("beach-colony")} a month. Almost every unit for sale allows pets. Most are one- and two-bedrooms; they sold for about ${sold("beach-colony")}, and the typical one asks about ${ask("beach-colony")}.`,
  ])),
  "dunes-village": () => (says("dunes-village", "indoor_pool", "every"), entry("dunes-village", "Big oceanfront condos at Dunes Village: most have two bedrooms or more", [
    /* Row 56 BLOCKED (a water park in each tower): row 4 (the fallback). */
    `Dunes Village Resort has room for a big group: most of its units for sale have two bedrooms or more, up to four bedrooms, and the building has an indoor pool. It stands next to Beach Colony.`,
    `Only Margate Tower charges more: the typical fee here is about ${fee("dunes-village")} a month. Dunes Village units sold for about ${sold("dunes-village")}.`,
  ])),
  "monterey-bay": () => entry("monterey-bay", "Oceanfront condos at Monterey Bay Suites, with a rooftop pool", [
    /* Row 57. Row 22 (CORRECTED): the resort's own list, no "heated". */
    `Monterey Bay Suites has a pool on its roof, with a view of the Myrtle Beach skyline. Downstairs, the indoor pool opens into the outdoor pool, so you can swim out into the sun. There is an indoor lazy river too.`,
    `Every unit for sale is a one-bedroom. About one in ten of its units sold in the past year, for about ${sold("monterey-bay")}, and the typical fee is about ${fee("monterey-bay")} a month.`,
  ]),
  "grande-cayman": () => entry("grande-cayman", "Oceanfront condos at Grande Cayman, with 720 feet of beach", [
    /* Rows 58 (720 ft is the whole resort; the slide is seasonal), 34, 10. */
    `Grande Cayman has 720 feet of beach on the north end of Myrtle Beach, and a waterslide three stories tall, open in season. Its lazy river is under a roof, so you can float it all year.`,
    `It was once called Long Bay Resort. Units for sale are mostly studios and one-bedrooms, with a few of three bedrooms. The typical fee is about ${fee("grande-cayman")} a month, and units sold for about ${sold("grande-cayman")}.`,
  ]),
  "caravelle": () => entry("caravelle", "Oceanfront condos at The Caravelle, with a block-long pool deck", [
    /* Rows 59 (the 7th-floor pool is in the main building), 36. */
    `The Caravelle's pool deck is a full block long, from the beach to Ocean Boulevard. In the main Caravelle building, the indoor pool is on the seventh floor, behind floor-to-ceiling windows.`,
    /* Rows 36 and 13: Sea Mark Tower is one of the resort's nine buildings, and on HUD's FHA list. */
    `It has been a Myrtle Beach resort since 1960, mostly studios and one-bedrooms. One of its nine buildings, Sea Mark Tower, is on HUD's list of condos approved for FHA loans, and its units are listed under their own name. Only ${w(F.buildings.filter((b) => b.sales > B("caravelle").sales).length)} buildings had more sales. Units sold for about ${sold("caravelle")}, with a typical fee of about ${fee("caravelle")} a month.`,
  ]),
  "ocean-reef": () => entry("ocean-reef", "Oceanfront condos at Ocean Reef, home of the Shipwreck Water Park", [
    /* Row 77 (CORRECTED: no date, so not "just"; the resort's rooms and grounds, never an owner's unit). Row 35. */
    `Ocean Reef completed a renovation of more than $15 million. Children get the Shipwreck Water Park, with giant tiki men, a sinking ship and a waterslide, and there is an indoor lazy river for a rainy day.`,
    `About half its units for sale are studios, and a few have three bedrooms or more, so the fees spread wide. The typical fee is about ${fee("ocean-reef")} a month, and a quarter of the units for sale pay about ${money(B("ocean-reef").fee_band[1])} or more. Units sold for about ${sold("ocean-reef")}.`,
  ]),
  "sand-dunes": () => entry("sand-dunes", "Sand Dunes condos with a 130,000-gallon water park on the grounds", [
    /* Row 78 (CORRECTED: nothing on price across the street). Row 38. */
    `Sand Dunes has a 130,000-gallon water park on its grounds, an oceanfront lazy river and a blacklight indoor mini golf course. The resort's suites, condos and villas fill eight buildings, some on the sand and some across the street.`,
    `It has more three-bedroom units for sale than any other building here, and studios too, so its fees range widely; the typical one is about ${fee("sand-dunes")} a month. It had among the most sales of any building, at a typical price of about ${sold("sand-dunes")}.`,
  ]),
  "sands-ocean": () => entry("sands-ocean", "Sands Ocean Club condos, near the course that hosted the PGA Tour", [
    /* Row 79 (CORRECTED: hosted the 2026 Classic; say nothing about who may play). Row 26 (0.20 mi to the club's parcel). */
    `Sands Ocean Club sits on Shore Drive, under a quarter mile from the Dunes Golf and Beach Club, a private club since 1948. The club's course hosted the PGA Tour's 2026 Myrtle Beach Classic.`,
    /* Row 5 (CORRECTED): "at least 491". */
    `It has the lowest fee on this page, about ${fee("sands-ocean")} a month. Most of its units for sale are studios, and a studio's fee is smaller. It is a large resort of at least ${B("sands-ocean").units} units, and a unit here sold for about ${sold("sands-ocean")}.`,
  ]),
  "margate": () => (says("margate", "pets_allowed", "every"), entry("margate", "Condos in Margate Tower, the tallest building in Myrtle Beach", [
    /* Rows 60 (CORRECTED: about 330 feet; tallest in Myrtle Beach, two sources), 61 (units to floor 29). */
    `Margate Tower rises about 330 feet, the tallest building in Myrtle Beach. Its units climb to the 29th floor.`,
    `It has the largest units on this page too: every unit for sale has three or four bedrooms, and the typical one has about ${n0(Math.round(B("margate").sqft_median / 100) * 100)} square feet. Its fee is the highest here, about ${fee("margate")} a month, and so are its sale prices, about ${sold("margate")}. Every unit for sale allows pets.`,
  ])),
  "brighton": () => entry("brighton", "Brighton Tower condos, 21 floors over Kingston Plantation's beach", [
    /* Row 63 (units to floor 21). */
    `Brighton's units climb to the 21st floor, over Kingston's half mile of beach. It has the lowest fee of the three Kingston towers, about ${fee("brighton")} a month.`,
    `Each unit for sale has two or three bedrooms. They sold for about ${sold("brighton")}, and the typical one for sale asks about ${ask("brighton")}.`,
  ]),
  "south-hampton": () => entry("south-hampton", "South Hampton condos on Kingston Plantation's half mile of beach", [
    /* Row 64 (CORRECTED: not "the smallest"), 27. */
    `South Hampton stands ${far("south-hampton", "Embassy Suites (Kingston Plantation)", "beside")} the Embassy Suites, on Kingston's half mile of beach. It has ${B("south-hampton").units} units, fewer than Margate or Brighton, and they sold for the least of the three, about ${sold("south-hampton")}.`,
    `All its units for sale have two or three bedrooms, and the typical fee is about ${fee("south-hampton")} a month.`,
  ]),
  "royale-palms": () => entry("royale-palms", "Royale Palms condos, 24 floors up beside the Hilton", [
    /* Rows 65 (about 255 feet, two sources), 66 (for guests who rent through Kingston Resorts, never owners), 27. */
    `Royale Palms rises about 255 feet ${far("royale-palms", "Hilton Myrtle Beach Resort", "beside")} the Hilton, with units up to the 24th floor. For guests who rent here, the resort lists the Hilton's sand-bottom pool and Currents Seaside Entertainment.`,
    `Most of its units for sale have three bedrooms, and the rest have two. The typical fee is about ${fee("royale-palms")} a month, the third highest here, and units sold for about ${sold("royale-palms")}.`,
  ]),
  "seawatch": () => entry("seawatch", "SeaWatch condos, with 19 water features behind a gate", [
    /* Rows 67, 39, 26. */
    `SeaWatch has 19 water features: six oceanfront pools, two lazy rivers and ten hot tubs. In season there is a tiki bar and grill on the oceanfront, and a fire pit.`,
    `It is a gated resort ${far("seawatch", "Tanger Outlets, Kings Road", "about a mile")} from the Tanger Outlets. Only ${w(B("seawatch").for_sale)} units are for sale this week, but ${B("seawatch").sales} sold in the past year, for about ${sold("seawatch")}. We tell you when a unit like the one you want comes up.`,
  ]),
  "ocean-creek": () => entry("ocean-creek", "Ocean Creek condos on 57 acres, with sunsets over a tidal creek", [
    /* Rows 18 (VERIFIED), 68 (CORRECTED: no height). Row 28 measures Barefoot Landing. */
    `From Ocean Creek's towers, you watch the sun go down past the dunes and a creek that rises and falls with the tide. Its 57 acres have walking and biking trails, tennis and pickleball courts, and a stretch of beach the resort calls secluded.`,
    `The gated grounds reach US 17, across the highway from Barefoot Landing. Units for sale run from studios to three bedrooms. The typical one asks about ${ask("ocean-creek")}, with a fee of about ${fee("ocean-creek")} a month.`,
  ]),
  "north-beach-towers": () => (says("north-beach-towers", "indoor_pool", "every"), entry("north-beach-towers", "North Beach Towers condos, with a swim-up bar and 2.5 acres of pools", [
    /* Rows 69 (the resort's 7.5 acres, not the sales copy's 60), 70 (CORRECTED: PH units not all above floor 19). */
    `North Beach Towers stand on a 7.5-acre island between the ocean and White Point Swash, the resort says. Around them are 2.5 acres of pools, with a lazy river, a swim-up bar and private cabanas.`,
    `Units run from one-bedrooms to four bedrooms and have the second-highest sale prices on this page, about ${sold("north-beach-towers")}. The typical fee is about ${fee("north-beach-towers")} a month.`,
  ])),
  "beach-cove": () => entry("beach-cove", "Beach Cove condos, where every unit faces the ocean", [
    /* Rows 71 ("the resort says" stays), 19. */
    `Every suite and condo at Beach Cove faces the ocean, the resort says. A 350-foot lazy river winds past three outdoor pools, heated in season.`,
    /* Rows 5 to 7 (CORRECTED): 334 units, 37 sales, about $171,000. */
    `Every unit for sale is a one- or two-bedroom. Units here sell often: about one in nine sold in the past year, for about ${sold("beach-cove")}. The typical fee is about ${fee("beach-cove")} a month.`,
  ]),
  "bay-watch": () => entry("bay-watch", "Bay Watch condos, three oceanfront towers at Crescent Beach", [
    /* Row 72 (CORRECTED: the top floor is not used). Row 28. */
    `Bay Watch is three towers on the sand at Crescent Beach: North, Center and South. The grounds have lazy rivers, indoor and outdoor pools, and Fishtails, a bar by the pool.`,
    `With ${B("bay-watch").units} units it is one of the largest buildings here, ${far("bay-watch", "Main Street, ocean end", "about two and a half miles", "south of")} south of Main Street. Its typical fee, about ${fee("bay-watch")} a month, is one of the lowest, and its units, from studios to three bedrooms, sold for about ${sold("bay-watch")}.`,
  ]),
  "avista": () => entry("avista", "Avista condos, a quarter mile from Main Street, home of the shag", [
    /* Rows 73 (CORRECTED: not "first danced"), 74, 28. The town's story is the town page's; one sentence and a link. */
    `Avista stands ${far("avista", "Main Street, ocean end", "about a quarter mile")} from the ocean end of ${h.a("/submarkets/north-myrtle-beach/", "Main Street")}. The state Senate calls North Myrtle Beach the birthplace of the shag; in the 1940s, visitors came to dance at the beach music clubs on Main Street and Ocean Drive.`,
    `Its pools, lazy river and hot tubs are outdoors and indoors, so a rainy day still has a swim. Most units for sale are one-bedrooms. With a typical fee of about ${fee("avista")} a month, Avista units sold for about ${sold("avista")}.`,
  ]),
  "prince": () => entry("prince", "Prince Resort condos by the Cherry Grove Pier, lazy river on the roof", [
    /* Rows 75 (CORRECTED: the SCDNR record, not "largest from land"), 76, 29. */
    `Prince Resort has a pool and a lazy river on its roof, beside the Cherry Grove Pier. Some condos look out over the inlet instead of the ocean. It is the northernmost building on this page.`,
    `Six units sold on their own in the past year, for about ${sold("prince")}. The typical fee is about ${fee("prince")} a month.`,
  ]),
};
/* Row 29: Prince is next to the pier (3500 N Ocean Blvd; the pier is at 3502), 0.13 mile by the listings' point. */
must(read("building-fees.json").buildings.prince.streets[0][0] === "3500 N Ocean Blvd | North Myrtle Beach" && DIST.pairs.find((x) => x.building === "prince").miles <= 0.15, "Prince next to the Cherry Grove Pier");
must(TOPSALES.some((b) => b.slug === "caravelle") && TOPSALES.some((b) => b.slug === "sand-dunes"), "Caravelle and Sand Dunes are among the most sales");
must(B("ocean-reef").beds["0"] / B("ocean-reef").for_sale >= 0.4 && B("ocean-reef").beds["0"] / B("ocean-reef").for_sale <= 0.6, "Ocean Reef: about half studios");
must(B("prince").sales === 6, "Prince: six one-unit sales");
must(B("brighton").beds["2"] + B("brighton").beds["3"] === B("brighton").for_sale && B("south-hampton").beds["2"] + B("south-hampton").beds["3"] === B("south-hampton").for_sale, "Kingston two and three bedrooms");
must(bedsAtLeast(B("dunes-village"), 2) * 2 > B("dunes-village").for_sale, "Dunes Village: most have 2 bedrooms or more");
must(F.buildings.filter((b) => b.sales > B("compass-cove").sales).length === 3, "Compass Cove: three buildings had more sales");
must(B("monterey-bay").beds["1"] === B("monterey-bay").for_sale && B("sea-mist").beds["0"] === B("sea-mist").for_sale, "Monterey Bay one-bedrooms, Sea Mist studios");

const ORDER = (town) => F.buildings.filter((b) => b.city === town && PLACE[b.slug]).sort((a, b) => a.lat - b.lat).map((b) => b.slug);
const MB = ORDER("Myrtle Beach"), NMB = ORDER("North Myrtle Beach");
must(MB.join() === "mb-resort,compass-cove,bluewater,palace,landmark,sea-mist,coral-beach,bay-view,camelot,caribbean,beach-colony,dunes-village,monterey-bay,grande-cayman,caravelle,ocean-reef,sand-dunes,sands-ocean,margate,brighton,south-hampton,royale-palms,seawatch", `Myrtle Beach order changed: ${MB}`);
must(NMB.join() === "ocean-creek,north-beach-towers,beach-cove,bay-watch,avista,prince", `North Myrtle Beach order changed: ${NMB}`);
must(Object.keys(E).length === MB.length + NMB.length, "every entry is placed");
/* Kingston Plantation (row 30: the MLS names "Kingston Plantation - Margate Tower", "- Brighton Towers", "- South Hampton";
   Kingston Resorts' own words for the grounds). Row 20's Currents and Sand Bottom Pool are cut: no source says tower owners
   may use them. */
const KINGSTON = `<h3 class="c3-cb-lead" id="kingston-plantation">Kingston Plantation</h3>`
  /* Row 62 (CORRECTED): the half mile and the 157 acres are Kingston Resorts' figures; lakes only beside its lodges and villas. */
  + h.p(`The next three towers stand in Kingston Plantation. Kingston Resorts counts more than half a mile of beach on its grounds, and 157 acres built around trees, with lakes beside its lodges and villas. Families have stayed here since the 1960s, when it was a campground called Lake Arrowhead, and the Arcadian Shores golf course is across the street. Each tower has its own fee.`);
const entries = (list) => list.map((s) => (s === "margate" ? KINGSTON : "") + E[s]()).join("");

/* ---------------------------------------------------------------------------- */
/* The guide: what the reader wants, then the buildings that have it.               */

must(B("sea-mist").sales_median < 100000 && B("coral-beach").sales_median < 100000 && B("landmark").sales_median <= 100000, "guide: about $100,000 or less");
must([B("beach-colony"), B("margate"), B("brighton"), B("royale-palms"), B("north-beach-towers"), B("ocean-creek")].every((b) => fl(b, "pets_allowed") * 2 > b.for_sale), "guide: pets on most listings");
/* Rows 17, 19, 22, 31, 33 to 35, 37 to 39: the resort's own lists. Row 32: Bay View on the Boardwalk; row 26: Camelot. */
must([B("dunes-village"), B("sand-dunes"), B("margate"), B("brighton"), B("south-hampton"), B("royale-palms"), B("north-beach-towers")].every((b) => bedsAtLeast(b, 2) * 2 > b.for_sale), "guide: most have 2 bedrooms or more");
const GUIDE = `<ul class="c3-cb-guide" aria-label="Which building fits what you want">`
  + [
    ["Units that sold for about $100,000 or less", [go("sea-mist"), go("coral-beach"), go("landmark")]],
    ["A low monthly fee", [go("sands-ocean"), go("beach-colony"), go("sea-mist"), go("bay-watch"), go("camelot")]],
    ["Waterslides", [go("compass-cove"), go("grande-cayman"), go("ocean-reef"), go("sand-dunes"), `${go("landmark")} (for rental-program guests)`]],
    /* Rows 22, 33, 34, 49, 52, 74, 77: indoors or under a roof. */
    ["A lazy river indoors or under a roof, for any season", [go("landmark"), go("bay-view"), go("caribbean"), go("monterey-bay"), go("grande-cayman"), go("ocean-reef"), go("avista")]],
    ["A lazy river outside", [go("compass-cove"), go("beach-colony"), go("sand-dunes"), go("seawatch"), go("north-beach-towers"), go("beach-cove"), go("bay-watch"), `${go("prince")}, on the roof`]],
    ["Near the Boardwalk and the SkyWheel", [go("bay-view"), go("camelot")]],
    ["Next to a fishing pier", [`${go("prince")}, at the Cherry Grove Pier`]],
    ["Mostly two and three bedrooms", [go("dunes-village"), go("sand-dunes"), go("margate"), go("brighton"), go("south-hampton"), go("royale-palms"), go("north-beach-towers")]],
    ["Pets allowed on most listings", [go("beach-colony"), go("margate"), go("brighton"), go("royale-palms"), go("north-beach-towers"), go("ocean-creek")]],
    ["Behind a gate", [go("ocean-creek"), go("seawatch")]],
  ].map(([t, items]) => `<li><b>${t}</b>${items.join(", ")}</li>`).join("") + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* Chart 1 (rows 2, 3): the lowest and highest fees, and the whole group between.   */

const low = byFee.slice(0, 6), high = byFee.slice(-5).reverse();
must(low.map((b) => b.slug).join() === "sands-ocean,towers-on-the-grove,anderson-ocean-club,beach-colony,bay-watch,sea-mist" || low.map((b) => b.slug).join() === "sands-ocean,towers-on-the-grove,anderson-ocean-club,beach-colony,sea-mist,bay-watch", `chart 1 lowest changed: ${low.map((b) => b.slug)}`);
const link = (b) => (PLACE[b.slug] ? `#${PLACE[b.slug]}` : "#every-building");
const FEE_CHART = G.bars([
  ...low.map((b) => ({ name: b.name, value: b.fee, valueText: money(b.fee), href: link(b) })),
  { name: "All oceanfront condos for sale", value: F.hub_oceanfront.median, valueText: money(F.hub_oceanfront.median), reference: true },
  ...high.slice().reverse().map((b) => ({ name: b.name, value: b.fee, valueText: money(b.fee), href: link(b) })),
], { caption: `The lowest fee is about ${money(byFee[0].fee)} a month, the highest about ${money(byFee[byFee.length - 1].fee)}`, nameLabel: "Building", valueLabel: "Typical fee a month", compact: true, phoneList: true,
  note: `The typical monthly fee of the units for sale in each building, for the six lowest and the five highest. "All oceanfront condos for sale" is the typical fee of all ${n0(F.hub_oceanfront.total)} of them.` });

/* Chart 2 (rows 6, 7, corrected): where the most units sold. */
const SALES_CHART = G.bars(TOPSALES.map((b) => ({ name: b.name, value: b.sales, valueText: `${b.sales} sales`, href: link(b) })),
  { caption: "Sea Mist and Landmark sold the most units", nameLabel: "Building", valueLabel: "Units sold in the past year", compact: true, phoneList: true,
    note: "Units sold one at a time for $10,000 or more in the past year, from the county's deed records. A unit that sold twice counts twice. Buildings with 30 or more sales." });

/* ---------------------------------------------------------------------------- */
/* The table of every building (rows 2, 6 to 8).                                     */

const cellFee = (b) => (b.fee ? money(b.fee) : "No units for sale");
const cellAsk = (b) => (b.asking_median ? r5k(b.asking_median) : "");
const cellSold = (b) => (b.struck ? "Not counted" : b.sales === 0 ? "None recorded" : b.sales >= 5 && b.sales_median ? rs(b.sales_median) : "Too few sales");
/* The power bill and pets (row 4), as a word for the share of the building's units for sale; under 8 listings, the count. */
const cellFlag = (b, k) => {
  const v = fl(b, k), of = b.for_sale;
  if (v === null || v === undefined || !of) return "Not counted";
  if (v === of) return "All";
  if (v === 0) return "None";
  if (of < 8) return `${v} of ${of}`;
  const r = v / of;
  return v === 1 ? "One" : r >= 0.85 ? "Almost all" : r > 0.6 ? "Most" : r >= 0.4 ? "About half" : r >= 0.15 ? "Some" : "A few";
};
/* A building with no units for sale has no point; it goes last in its town. */
const ALLORDER = (town) => F.buildings.filter((b) => b.city === town).sort((a, b) => (a.lat || 99) - (b.lat || 99) || a.name.localeCompare(b.name));
must(F.buildings.filter((b) => b.lat === null).map((b) => b.slug).sort().join() === "island-vista,ocean-drive-beach-golf", "every building with units has a point");
const row = (b) => {
  const nm = PLACE[b.slug] ? h.a(`#${PLACE[b.slug]}`, b.name) : b.name;
  const c = b.for_sale ? `<span class="c">${b.for_sale} for sale</span>` : "";
  const td = (lab, v, word) => `<td${word ? ' class="w"' : ""}><span class="l">${lab}</span>${v}</td>`;
  if (!b.fee) return `<tr class="none"><th scope="row">${nm}</th><td colspan="5" class="w">No units for sale this week</td></tr>`;
  const sd = cellSold(b);
  return `<tr><th scope="row">${nm}${c}</th>${td("Fee a month", cellFee(b))}${td("Fee pays power", cellFlag(b, "hoa_includes_electric"))}${td("Pets allowed", cellFlag(b, "pets_allowed"))}${td("Asking now", cellAsk(b))}${td("Sold for", sd, /^[A-Z]/.test(sd))}</tr>`;
};
const grp = (t) => `<tr><th colspan="6" scope="colgroup" class="grp">${t}</th></tr>`;
const TABLE = `<div class="c3-cb-tab" id="every-building"><table><caption>Every oceanfront building, south to north</caption>`
  + `<thead><tr><th scope="col">Building</th><th scope="col">Fee a month</th><th scope="col">Fee pays power</th><th scope="col">Pets allowed</th><th scope="col">Asking now</th><th scope="col">Sold for, past year</th></tr></thead>`
  + `<tbody>${grp("Myrtle Beach")}${ALLORDER("Myrtle Beach").map(row).join("")}</tbody>`
  + `<tbody>${grp("North Myrtle Beach")}${ALLORDER("North Myrtle Beach").map(row).join("")}</tbody></table></div>`;

/* ---------------------------------------------------------------------------- */
/* Sources.                                                                       */

const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const HUD = "https://entp.hud.gov/idapp/html/condlook.cfm";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects";
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pulled = (F.pulled.match(/^(\d{4})-(\d{2})-(\d{2})/) || []);
must(pulled.length, "findings.json: no pull date");
const PULLED = `${MONTHS[+pulled[2] - 1]} ${+pulled[3]}, ${pulled[1]}`;

/* ---------------------------------------------------------------------------- */
/* The offers. Each one tied to the question its section answered; no two share words. */

const TOP = { title: "Tell us the building", label: "Send me units in one building", href: "/contact/" };
const END = {
  h2: "Learn the building before you choose the unit.",
  p: "Send us the buildings you like. We get each one's fee, budget, savings for repairs, rules on renting and recent sales, and tell you what we find.",
  label: "Have us check a building", href: "/contact/",
};

/* Links used in the copy must be live pages. */
["/hoa/", "/hoa/reserves/", "/hoa/special-assessments/", "/hoa/master-insurance-ho6/", "/hoa/estoppel-and-transfer-fees/", "/invest/condotel-financing/",
  "/invest/condos/", "/invest/rental-program-vs-airbnb/", "/invest/str-rules/", "/sell/sell-my-condo/", "/buyers/condo-in-litigation/", "/submarkets/myrtle-beach/", "/submarkets/north-myrtle-beach/"]
  .forEach((u) => must(fs.existsSync(path.join(__dirname, "..", "chapter3realty", ...u.split("/").filter(Boolean), "index.html")), `no page at ${u}`));

const HUB_TXT = { p25: money(F.hub_oceanfront.p25), p75: money(F.hub_oceanfront.p75), med: money(F.hub_oceanfront.median), n: n0(Math.round(F.hub_oceanfront.total / 100) * 100) };

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Myrtle Beach Oceanfront Condo Buildings: HOA Fees Compared",
  description: "47 Myrtle Beach and North Myrtle Beach oceanfront condo buildings: what sets each one apart, the monthly HOA fee, what units sold for, and condos for sale now.",
  ogTitle: "Myrtle Beach oceanfront condo buildings, with their HOA fees compared",
  crumb: "Condo Buildings",
  eyebrow: "Oceanfront condo buildings",
  /* The owner's headline (data/headlines.json), the second line as the italic line. */
  h1: "Myrtle Beach oceanfront condo buildings,",
  h1em: "with their HOA fees compared.",
  /* Row 29: Prince Resort is in Cherry Grove. */
  sub: `The monthly HOA fee in ${F.counts.with_fee} oceanfront buildings from Myrtle Beach Resort to Cherry Grove, what their units sold for, and the units for sale now.`,
  heroMedia: glance([
    { icon: "key", label: "For sale now", text: `About ${HUB_TXT.n} condos` },
    { icon: "dollar", label: "Typical fee", text: `About ${HUB_TXT.med} a month` },
    { icon: "home", label: "What units sold for", text: `${rs(bySale[0].sales_median)} to ${rs(bySale[bySale.length - 1].sales_median)}` },
  ]),
  heroCta: TOP,
  topOfferLine: "Tell us the building. We send its units for sale and their fees.",
  author: "devin",
  shortAnswer: [
    `About ${HUB_TXT.n} condos are for sale in Grand Strand oceanfront buildings, and the typical one charges about ${HUB_TXT.med} a month in HOA fees. Building by building, the lowest typical fee is about ${money(byFee[0].fee)} at Sands Ocean Club, and the highest is about ${money(byFee[byFee.length - 1].fee)} at Margate Tower.`,
  ],
  sections: [
    { h2: "Which oceanfront condo building fits what you want?", toc: "What fits you", id: "fits", html: () =>
      DESIGN_CSS + G.homesCss() +
      h.p(`Pick what matters most to you. Each name goes to its building below, with its units for sale.`) +
      h.p(`A typical fee or price is the middle one: half the units pay more, and half pay less. Sale prices are from the past year.`) +
      GUIDE },

    { h2: "What are the oceanfront condo buildings in Myrtle Beach?", toc: "Myrtle Beach", id: "myrtle-beach", html: () =>
      h.p(`${h.a("/submarkets/myrtle-beach/", "Myrtle Beach")}'s oceanfront buildings run from Myrtle Beach Resort, south of the state park, past the Boardwalk and the SkyWheel, north to SeaWatch Resort near the Tanger Outlets.`) +
      PH.heroPhoto(PHOTO, { alt: PHOTO.alt, caption: PHOTO.caption, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" }).replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"') +
      entries(MB) },

    { h2: "What are the oceanfront condo buildings in North Myrtle Beach?", toc: "North Myrtle Beach", id: "north-myrtle-beach", html: (bg) =>
      h.p(`${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach")}'s oceanfront buildings run from Ocean Creek Resort, near Barefoot Landing, north to Prince Resort at the Cherry Grove Pier.`) +
      entries(NMB) +
      h.cta("Before you pick a building, see its money", "Send us the building. We get its budget and its savings for repairs, and tell you what they mean for the fee in the years ahead.", "Have us pull one building's budget and reserves", "/contact/", bg) },

    { h2: "How do HOA fees compare across Myrtle Beach oceanfront buildings?", toc: "Fees compared", id: "fees-compared", html: () =>
      h.p(`In an oceanfront building on the Grand Strand, the typical condo for sale charges about ${HUB_TXT.med} a month, and half of them pay between ${HUB_TXT.p25} and ${HUB_TXT.p75}. Our ${h.a("/hoa/", "HOA fees guide")} gives the fee for every kind of home.`) +
      FEE_CHART +
      /* Row 9 (VERIFIED), said once, here. */
      h.p(`A fee looks different next to the price. At ${go("coral-beach", "Coral Beach")}, a year of fees comes to about a fifth of what a unit sold for. At ${go("sea-mist", "Sea Mist")} and ${go("landmark", "Landmark")}, it is about a tenth or more. At ${go("margate", "Margate Tower")} and ${go("north-beach-towers", "North Beach Towers")}, it is about 2 in 100.`) +
      TABLE +
      h.p(`The fee and the asking price are typical of the units for sale this week. "Fee pays power" and "Pets allowed" say how many of those units list it. The sale price is typical of the past year's one-unit sales. Myrtle Beach Resort and Ocean Creek record their towers under several names, so we do not count their sales.`) },

    { h2: "What does an oceanfront condo HOA fee pay for?", toc: "What fees pay", id: "what-fees-pay", html: (bg) =>
      h.p(`An oceanfront fee pays the building's shared bills. Of every 100 condos for sale in oceanfront buildings, this many listings say the fee includes:`) +
      `<ul class="c3-cb-cov">`
        + [[share("hoa_includes_water_sewer"), "Water and sewer"], [share("hoa_includes_internet"), "Internet"], [share("hoa_includes_insurance"), "Insurance"], [share("hoa_includes_electric"), "The power bill"]]
          .map(([v, t]) => `<li><b>${v} in 100</b><span>${t}</span></li>`).join("")
        + `</ul>` +
      h.p(`The power bill changes the most from building to building. At ${go("landmark", "Landmark")}, ${fl(B("landmark"), "hoa_includes_electric")} of ${B("landmark").for_sale} listings say the fee pays it. In ${NO_POWER} buildings on this page, none of the listings does.`) +
      h.p(`Three more things come with the fee:`) +
      `<ul class="c3-cb-cov c3-cb-more">`
        + `<li><b>Insurance</b><span>Which policy the fee pays, and what your own unit policy covers, is on our page on ${h.a("/hoa/master-insurance-ho6/", "the building's policy and yours")}.</span></li>`
        + `<li><b>Savings</b><span>Part of each fee goes to ${h.a("/hoa/reserves/", "savings for future repairs")}. When those run short, owners pay a ${h.a("/hoa/special-assessments/", "special assessment")} on top of the fee.</span></li>`
        /* Row 15 (VERIFIED): common in any HOA, not only a rental-program building. */
        + `<li><b>At closing</b><span>Buying into one of these buildings usually means a transfer fee to the HOA, and often a few months of dues held at closing, as in any HOA. Our page on ${h.a("/hoa/estoppel-and-transfer-fees/", "HOA fees due at closing")} explains them.</span></li>`
        + `</ul>` +
      h.cta("The fee a seller lists can be out of date", "Send us the unit. We get its fee from the HOA, with what the fee pays and any special assessment on the way.", "Have us get the current fee for one unit", "/contact/", bg) },

    { h2: "Which oceanfront buildings sell the most units?", toc: "Sales by building", id: "sales", html: (bg) =>
      h.p(`In the past year, ${go("sea-mist", "Sea Mist")} and ${go("landmark", "Landmark")} sold the most units. Sea Mist had ${B("sea-mist").sales} sales. Two units sold twice, so ${SEA_MIST_UNITS_SOLD} of its ${B("sea-mist").units} units changed hands, more than 1 in 5. At the typical building on this page, about 1 in ${ONE_IN} did.`) +
      SALES_CHART +
      h.p(`For an owner who sells later, more sales in the building mean more recent prices to price a unit from. At Towers on the Grove, no unit sold on its own over the past twelve months. Our page on ${h.a("/sell/sell-my-condo/", "selling a condo")} covers the sale itself.`) +
      h.cta("Selling a unit later?", "Send us the building and the unit. We price it from the recorded sales in its own building.", "Have us price a unit from its building's sales", "/contact/", bg) },

    { h2: "Condo, condotel or timeshare: what are you buying on the oceanfront?", toc: "Condo or condotel", id: "condotel", html: () =>
      h.p(`Most units in these buildings are condos. Three kinds of ownership share the oceanfront:`) +
      `<ul class="c3-cb-cov c3-cb-more">`
        + `<li><b>Condo</b><span>You own the unit, and the owners together own the building through the HOA.</span></li>`
        + `<li><b>Condotel</b><span>A condo in a building run like a hotel, which rents units to guests by the night.</span></li>`
        + `<li><b>Timeshare</b><span>The use of a unit for some weeks a year, not the whole unit.</span></li>`
        + `</ul>` +
      /* Cannibalization (reports/cannibalization-2026-11-08.json): renting, loans and the investment question belong to
         /invest/str-rules/, /invest/condotel-financing/ and /invest/condos/. A sentence and a link each. Row 14 (VERIFIED). */
      h.p(`About 94 in 100 condos for sale in oceanfront buildings say short-term rentals are allowed, and we read each building's own rules on renting before you offer. The rules town by town are on our ${h.a("/invest/str-rules/", "short-term rental rules page")}, and the choice of a building's ${h.a("/invest/rental-program-vs-airbnb/", "rental program or Airbnb")} has its own page.`) +
      /* Rows 12 (CORRECTED, the sibling's wording) and 13 (VERIFIED). */
      h.p(`A condotel is harder to buy with a loan: Fannie Mae will not buy a loan on a unit in a building run like a hotel. Which loans close on these buildings is on our ${h.a("/invest/condotel-financing/", "condotel financing page")}, and a lawsuit against the association is on our page on ${h.a("/buyers/condo-in-litigation/", "buying a condo in litigation")}.`) +
      h.p(`Whether an oceanfront condo is a good investment is in our ${h.a("/invest/condos/", "condo investing guide")}.`) },
  ],
  faqTitle: "Oceanfront condo buildings FAQ",
  faq: [
    { q: "Which Myrtle Beach oceanfront condos have the lowest HOA fees?", a: `Sands Ocean Club, at a typical ${fee("sands-ocean")} a month, where most units for sale are studios. Then Towers on the Grove, about ${fee("towers-on-the-grove")} from ${B("towers-on-the-grove").for_sale} listings, Anderson Ocean Club, about ${fee("anderson-ocean-club")}, and Beach Colony, about ${fee("beach-colony")}.` },
    { q: "Why are oceanfront condo HOA fees so high?", a: `The fee pays the building's shared bills. Most listings in oceanfront buildings say it includes water and sewer, internet and insurance, and more than half say it pays the power bill.` },
    { q: "Can you have a dog in a Myrtle Beach oceanfront condo?", a: `In some buildings. At Beach Colony, Margate Tower, Royale Palms and Ocean Creek, most units for sale allow pets. At Coral Beach, none of the ${B("coral-beach").for_sale} do. We read the building's pet rule before you offer.` },
    /* Rows 60, 61: two sources agree on Myrtle Beach. */
    { q: "What is the tallest condo building in Myrtle Beach?", a: "Margate Tower, in Kingston Plantation. It rises about 330 feet, and it also has the largest units and the highest fee of the oceanfront buildings on this page." },
    { q: "Which Myrtle Beach oceanfront condo buildings have a lazy river?", a: "Fifteen of the buildings on this page have one. You can float all year at Landmark, Bay View, the Caribbean, Monterey Bay, Grande Cayman, Ocean Reef and Avista, where it is indoors or under a roof. Prince Resort's is on its roof." },
    { q: "What is the difference between a condotel and a timeshare?", a: "A condotel unit is owned whole, like any condo. A timeshare sells the use of a unit for some weeks a year." },
  ],
  sources: [
    { name: "parcels", href: GIS },
    { name: "deeds", href: DEEDS },
    { name: "HUD", href: HUD },
    { name: "Fannie Mae", href: FNMA },
    { name: "Landmark", href: "https://www.landmarkresort.com/" },
    { name: "Ocean Creek", href: "https://www.oceancreek.com/" },
    { name: "Beach Cove", href: "https://www.beachcove.com/" },
    { name: "SeaWatch", href: "https://www.seawatchresort.com/" },
    { name: "Avista", href: "https://www.avistaresort.com/" },
    { name: "Monterey", href: "https://www.montereybaysuites.com/" },
    { name: "Kingston", href: "https://www.kingstonresorts.com/" },
    { name: "Compass", href: "https://www.compasscove.com/" },
    { name: "Bay View", href: "https://www.bayviewresort.com/" },
    { name: "Caribbean", href: "https://www.caribbeanresort.com/" },
    { name: "Cayman", href: "https://www.grandecaymanresort.com/amenities/" },
    { name: "Ocean Reef", href: "https://www.oceanreefmyrtlebeach.com/" },
    { name: "Caravelle", href: "https://www.thecaravelle.com/" },
    { name: "Beach Colony", href: "https://www.beachcolony.com/" },
    { name: "Sand Dunes", href: "https://www.sandsresorts.com/sand-dunes-resort/" },
    { name: "Palace", href: "https://www.palaceresort.com/" },
    { name: "Bluewater", href: "https://www.bluewaterresort.com/" },
    { name: "North Beach", href: "https://www.northbeachrentals.com/" },
    { name: "Bay Watch", href: "https://www.baywatchresort.com/" },
    { name: "Prince", href: "https://www.princeresortonline.com/" },
    { name: "Sea Captain's", href: "https://www.seacaptains.com/" },
    { name: "Dunes Club", href: "https://www.thedunesclub.com/" },
    { name: "FAA", href: "https://aeronav.faa.gov/Obst_Data/DAILY_DOF_DAT.ZIP" },
    { name: "Post and Courier", href: "https://www.postandcourier.com/tallest-buildings-in-myrtle-beach/table_2a835b54-d85f-11eb-8c90-5f0e102e8b9f.html" },
    { name: "SCDNR", href: "https://dnr.sc.gov/fish/saltrecs/records.html" },
    { name: "SC Senate", href: "https://www.scstatehouse.gov/sess125_2023-2024/prever/1271_20240417.htm" },
    { name: "state park", href: "https://southcarolinaparks.com/myrtle-beach" },
    { name: "OpenStreetMap", href: "https://www.openstreetmap.org/copyright" },
  ],
  sourcesNote: `Counts: MLS listings, ${PULLED}; county deeds, past year.`,
  pageImages: () => PH.pageImages(PHOTO),
  afterSources: () => PH.creditsList([{ photo: PHOTO, caption: PHOTO.caption.replace(/\.$/, "") }]) + PH.imageSchema([PHOTO]),
  bottomCta: END,
  keywords: "Myrtle Beach oceanfront condos for sale, North Myrtle Beach oceanfront condos for sale, tallest condo building Myrtle Beach, oceanfront condo HOA fees Myrtle Beach, Myrtle Beach condo buildings, Myrtle Beach condos low HOA fees, pet friendly oceanfront condos Myrtle Beach",
  about: "Oceanfront condo buildings in Myrtle Beach and North Myrtle Beach, South Carolina",
});
