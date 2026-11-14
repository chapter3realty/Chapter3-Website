/* /buyers/property-records/gis-map/ - the Horry County GIS parcel map: how to get past the county's
 * sign-in, search by address, owner, PIN or TMS, and read the parcel card; how to find property lines;
 * how close the map's lots come to their listed acreage (our count); when a surveyor is needed; the
 * tax map number; zoning codes; the county's aerial photos since 1998; and Georgetown County's open
 * map for Pawleys Island and Litchfield.
 *
 * Batch 2026-11-d, Lane N. A new page, version 1, 2026-11-13. Plan: Blog-Brain
 * batches/2026-11-d/property-records-gis-map/PLAN.md. Demand: must-answer.md. Facts: facts.md,
 * VERIFIED rows, and CORRECTED rows at the verifier's wording only (VERIFY.md; struck wording in
 * batches/2026-11-d/facts/buyers-property-records-gis-map-struck.json). Row numbers are given as F<n>.
 * Not used: "free" for the county account or map (F5 struck), "no county map skips the sign-in" (F7),
 * Garden City heights without the PDD condition (F33), qPublic as an owner search (F48), market or
 * assessed values from the open parcel layer for any address (F10 note).
 * Data: data/2026-11-d/property-records-gis-map/ (drawn-vs-listed.json, the chart CSV, layers-and-counts.csv,
 * raw/aerials-*.json). Every count, share and year below is read from those files and checked against
 * its ledger row.
 * Pictures: drawings only (the parcel card, the two lines, the years strip) and one chart. No photo:
 * no place on the page is its subject, and county imagery is not used.
 * Homes: the site's edge places this page's feed under the opening (lead item in BUILD.md); one strip
 * here, Pawleys Island and Litchfield, in the Georgetown section.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const IC = require(path.join(BB, "tools", "icons.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/buyers/property-records/gis-map/";
const SLUG = "property-records-gis-map";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", SLUG);
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`${SLUG}.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");

/* ---------------------------------------------------------------------------- */
/* Data, checked against the ledger.                                              */

const DV = read("drawn-vs-listed.json");
must(DV.rows === 302630, "F17: 302,630 parcels");
must(DV.comparable === 85490, "F35: 85,490 compared");
must(DV.within_5pct === 80.1 && DV.off_10pct_or_more === 10.7, "F36: 80.1 within 5%, 10.7 off more than 10%");
must(DV.drawn_bigger_share === 51.2, "F36: drawn bigger on 51.2%");
/* F19: every parcel has an 11-digit PIN (4 blank). F20: about 1 in 4 has no TMS. */
const pinFull = (DV.pin_patterns.find(([p]) => p === "99999999999") || [])[1];
must(pinFull === 302626, "F19: 302,626 eleven-digit PINs");
const tmsBlank = DV.tms_patterns.filter(([p]) => p.trim() === "" || p === "<Null>").reduce((s, [, c]) => s + c, 0);
const tmsShare = tmsBlank / DV.rows;
must(Math.abs(tmsShare - 0.234) < 0.001, `F20: 23.4% with no TMS (file gives ${(tmsShare * 100).toFixed(1)})`);
const IN5 = Math.round(DV.within_5pct / 20); /* 80.1% = 4 in 5 */
must(IN5 === 4, "F36: 4 in 5");

/* V3: the chart rows (F37), from the CSV. */
const CSV = fs.readFileSync(path.join(DATA, "chart-drawn-vs-listed-by-lot-size.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(","));
const BANDS = CSV.filter((r) => r[0] !== "all").map(([band, n, in5, off10]) => ({ band, n: +n, off10: +off10 }));
must(BANDS.length === 5, "F37: five bands");
const EXPECT = { "under 1/4 acre": 4.7, "1/4 to 1/2 acre": 10.5, "1/2 to 1 acre": 17.9, "1 to 5 acres": 13.2, "5 acres or more": 10.0 };
for (const b of BANDS) must(EXPECT[b.band] === b.off10, `F37: ${b.band} is ${EXPECT[b.band]}`);
const WORST = BANDS.slice().sort((a, b) => b.off10 - a.off10)[0];
must(WORST.band === "1/2 to 1 acre", "F37: half-acre to one-acre lots differ most");
const BAND_NAME = { "under 1/4 acre": "Under a quarter acre", "1/4 to 1/2 acre": "A quarter to a half acre", "1/2 to 1 acre": "A half acre to 1 acre", "1 to 5 acres": "1 to 5 acres", "5 acres or more": "5 acres or more" };

/* F12, F13: the aerial years and their bands, from the county's image services. */
const AER = fs.readdirSync(path.join(DATA, "raw")).filter((f) => /^aerials-\d{4}\.json$/.test(f)).sort()
  .map((f) => { const d = read(path.join("raw", f)); return { year: +f.slice(8, 12), bw: d.bandCount === 1 }; });
must(AER.length === 11 && AER[0].year === 1998 && AER[AER.length - 1].year === 2026, "F12: 11 years, 1998 to 2026");
must(AER.filter((a) => a.bw).map((a) => a.year).join() === "1998,2001", "F13: 1998 and 2001 are black and white");

/* F25: building outlines, from the layer counts file. */
const LAYERS = Object.fromEntries(fs.readFileSync(path.join(DATA, "layers-and-counts.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => { const i = l.lastIndexOf(","); return [l.slice(0, i), +l.slice(i + 1)]; }));
must(LAYERS["Building footprints"] === 417124, "F25: 417,124 building outlines");

/* ---------------------------------------------------------------------------- */
/* Links.                                                                         */

const MAP = "https://www.horrycountysc.gov/gis/parcels";
const REGISTER = "https://www.horrycountysc.gov/register";
const DISCLAIMER = "https://www.horrycountysc.gov/gis/parcels/disclaimer";
const LAYERSVC = "https://www.horrycountysc.gov/parcelapp/rest/services/HorryCountyGISApp/MapServer";
const TAXMAP = "https://www.horrycountysc.gov/tax-payer-services/real-property-tax/";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/";
const ZONING_PDF = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const ZONING_PAGE = "https://www.horrycountysc.gov/departments/planning-and-zoning/";
const GT_MAP = "https://experience.arcgis.com/experience/fa729743d97047579f348d68f9643ba1";
const GT_DEEDS = "https://www.georgetowndeeds.com/NameSearch.php";
const GT_GIS = "https://gtcountysc.gov/260/GIS-Asset-Management";
const LLR = "https://llr.sc.gov/eng/";
const LLR_LOOKUP = "https://verify.llronline.com/LicLookup/Engineers/Engineer.aspx?div=50";
const LEAD = "/contact/";
/* Sibling pages of this batch (deeds, tax bill, flood zone check, land) may not be built yet. A link to one is
   written only when its page exists in this working copy, else its words stay as plain text; rebuild this spec
   once they are built (BUILD.md). */
const SITE_ROOT = path.join(__dirname, "..", "chapter3realty");
const live = (u) => fs.existsSync(path.join(SITE_ROOT, ...u.split("/").filter(Boolean), "index.html"));
const sib = (u, text) => (live(u) ? h.a(u, text) : text);

/* ---------------------------------------------------------------------------- */
/* The one photo: a U.S. government aerial (USDA NAIP, public domain) of new streets cleared for houses,  */
/* already licensed and on the site for /submarkets/north-myrtle-beach/ (its record is reused unchanged). */
/* It sits beside the sentence it shows: aerial photos show when a street of houses was built.           */

const NMB_PHOTOS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-a", "submarkets-north-myrtle-beach", "photos.json"), "utf8")).photos;
const AERIAL_REC = NMB_PHOTOS.find((r) => /west-of-us-17-new-streets-from-above-1200w\.webp$/.test(r.file));
must(AERIAL_REC && AERIAL_REC.license === "Public domain", "the NAIP aerial record (North Myrtle Beach photos.json)");
const AERIAL_CAP = "New streets cleared for houses west of US 17 in North Myrtle Beach, seen from above. A run of aerial photos shows the year a street like this was built";
const AERIAL = PH.heroPhoto(AERIAL_REC, { alt: AERIAL_REC.alt, caption: AERIAL_CAP + ".", maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"');
const CREDITS = PH.creditsList([{ photo: AERIAL_REC, caption: AERIAL_CAP }]);

/* ---------------------------------------------------------------------------- */
/* Page styles, scoped to main#main. One card style for the drawings, the chart and the offers; lists  */
/* and tables plain under thin rules; one block width of 720 px.                                       */

const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const CARD = "border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 14px 34px -24px rgba(28,32,40,.45)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const TBL = `${S} div[style^="overflow-x:auto;margin:1.2rem 0"]`;
const CSS = "<style>"
  /* The headline: the italic line at about half the H1's size. */
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.25rem,2.4vw,2.1rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  + `${S} .detail-h1{text-wrap:pretty}${S} h2{text-wrap:balance}${S} .btn{text-wrap:balance}`
  /* The glass header at 980 to 1099 px (the same fix as the other glass pages). */
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  /* The county button: navy, so it does not look like our request buttons. */
  + `${S} .gm-go{display:inline-flex;align-items:center;gap:.55rem;min-height:52px;padding:.8rem 1.4rem;border-radius:999px;background:var(--navy);color:#fff!important;font-family:var(--sans);font-weight:600;font-size:1.05rem;text-decoration:none!important;box-shadow:0 10px 24px -14px rgba(28,32,40,.7)}`
  + `${S} .gm-go:hover{background:#2a3040}${S} .gm-go svg{flex:none}`
  + `@media (max-width:359px){${S} .gm-go{padding:.8rem 1.1rem;font-size:1rem;gap:.45rem}}`
  + `${S} .gm-go-note{font-size:.95rem;color:var(--muted);margin:.55rem 0 1.4rem;line-height:1.5}`
  /* The three steps: plain rows under thin rules, a glass icon chip and a number each. */
  + `${S} ol.gm-steps{list-style:none;margin:.4rem 0 1.2rem;padding:0;max-width:720px;counter-reset:gm}`
  + `${S} ol.gm-steps>li{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:.9rem;align-items:start;padding:.95rem 0;border-top:${RULE};margin:0;counter-increment:gm}`
  + `${S} ol.gm-steps>li:last-child{border-bottom:${RULE}}`
  + `${S} ol.gm-steps .ic{display:inline-flex;color:var(--brass);margin-top:.1rem}`
  + `${S} ol.gm-steps h3{margin:0 0 .25rem!important;font-family:var(--sans);font-size:1.1rem!important;font-weight:650;color:var(--navy);line-height:1.35}`
  + `${S} ol.gm-steps h3::before{content:counter(gm) ". "}`
  + `${S} ol.gm-steps p{margin:0!important;color:var(--muted);line-height:1.65;font-size:var(--read,1.0625rem)}`
  /* Cards: the parcel card, the line drawing, the years strip. */
  + `${S} .gm-fig{margin:1.4rem 0 1.6rem;max-width:720px}`
  + `${S} .gm-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem}`
  + `${S} .gm-card{${CARD};padding:1rem 1.15rem 1.05rem;box-sizing:border-box}`
  + `${S} .gm-card .hd{display:flex;align-items:center;gap:.5rem;font-family:var(--sans);font-weight:700;font-size:1rem;color:var(--navy);padding-bottom:.6rem;border-bottom:2px solid var(--navy);margin-bottom:.15rem}`
  + `${S} .gm-card dl{margin:0;display:grid;grid-template-columns:1fr}`
  + `${S} .gm-card .r{display:grid;grid-template-columns:minmax(0,11rem) minmax(0,1fr);column-gap:1rem;padding:.55rem 0;border-bottom:1px solid rgba(28,32,40,.1)}`
  + `${S} .gm-card .r:last-child{border-bottom:0}`
  + `${S} .gm-card dt{font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;line-height:1.4}`
  + `${S} .gm-card dd{margin:0;color:var(--muted);font-size:1rem;line-height:1.45}`
  + `@media (max-width:520px){${S} .gm-card .r{grid-template-columns:1fr;row-gap:.1rem}}`
  + `${S} .gm-draw{${CARD};padding:.6rem;box-sizing:border-box}${S} .gm-draw svg{display:block;width:100%;height:auto}`
  + `${S} svg.gm-lines text{font-family:var(--sans),system-ui,sans-serif;font-size:30px;fill:#4a4f5c;font-weight:600}`
  + `@media (min-width:600px){${S} svg.gm-lines text{font-size:22px}}`
  + `${S} .gm-key{display:flex;flex-direction:column;gap:.35rem;padding:.7rem .4rem .2rem;font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.35}`
  + `${S} .gm-key span{display:flex;align-items:center;gap:.6rem}${S} .gm-key span::before{content:"";flex:none;width:2.4rem;height:0}`
  + `${S} .gm-key span.s::before{border-top:4px solid #1c2028}${S} .gm-key span.d::before{border-top:3px dashed #2f6f8f}`
  /* Figures sit on the page without a second frame: the card inside is the one frame. */
  + `${S} figure.gm-fig,${S} figure.c3ph-hero{${FLAT};padding:0!important}${S} figure.gm-fig>figcaption,${S} figure.c3ph-hero>figcaption{padding:0!important}`
  + `${S} figure.c3ph-hero{max-width:720px!important}${S} .gm-nw{white-space:nowrap}`
  /* The aerial's labels sit near its edges: show the whole frame. The line drawing stays small on a wide screen. */
  + `${S} figure.c3ph-hero img{aspect-ratio:${AERIAL_REC.width}/${AERIAL_REC.height}!important}${S} figure.gm-fig.gm-small{max-width:560px}`
  + `${TBL} td:first-child{white-space:nowrap}`
  + `${S} .gm-years{${CARD};padding:1rem 1.1rem;box-sizing:border-box}`
  + `${S} .gm-years ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.9rem .45rem}`
  + `@media (min-width:600px){${S} .gm-years ol{grid-template-columns:repeat(6,minmax(0,1fr))}}`
  + `@media (min-width:900px){${S} .gm-years ol{grid-template-columns:repeat(11,minmax(0,1fr))}}`
  /* A timeline, not buttons: each year is plain text under a colored bar, with no pill shape. */
  + `${S} .gm-years li{margin:0;padding:.45rem 0 0;text-align:center;font-family:var(--sans);font-weight:600;font-size:1rem;color:var(--navy);background:none;border-top:5px solid rgba(196,120,58,.55);cursor:default}`
  + `${S} .gm-years li.bw{border-top-color:rgba(28,32,40,.4)}`
  + `${S} .gm-years .k{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;margin-top:.75rem;font-size:.95rem;color:var(--muted)}`
  + `${S} .gm-years .k span::before{content:"";display:inline-block;width:1.4rem;height:0;border-top:5px solid rgba(196,120,58,.55);margin-right:.45rem;vertical-align:.2rem}`
  + `${S} .gm-years .k span.bw::before{border-top-color:rgba(28,32,40,.4)}`
  /* Lists and tables plain, under thin rules. */
  + `${S} ul.gm-list{list-style:none;margin:.6rem 0 1.3rem;padding:0;max-width:720px}`
  + `${S} ul.gm-list>li{margin:0;padding:.75rem 0;border-top:${RULE};color:var(--muted);line-height:1.6}`
  + `${S} ul.gm-list>li:last-child{border-bottom:${RULE}}${S} ul.gm-list strong{color:var(--navy)}`
  + `${TBL}{${FLAT};padding:0!important;max-width:720px!important}`
  + `${TBL} thead th{border-bottom:1px solid rgba(28,32,40,.3)!important}`
  + `${TBL} th:first-child,${TBL} td:first-child{padding-left:0!important}${TBL} th:last-child,${TBL} td:last-child{padding-right:0!important}`
  + `${TBL} table{font-size:1rem!important}`
  + `@media (max-width:599px){${TBL} table,${TBL} tbody,${TBL} tr,${TBL} td{display:block;width:100%}${TBL} thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${TBL} tr{padding:.65rem 0;border-bottom:${RULE}}${TBL} td{border:0!important;padding:.1rem 0!important}${TBL} td:first-child{font-weight:650;color:var(--navy)}`
  + `${TBL} td[data-l]::before{content:attr(data-l) ": ";color:var(--muted);font-weight:500}}`
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  + "</style>";

/* A table that turns into rows of labelled cells on a phone. */
const table = (head, rows) => h.table(head, rows).replace(/<tbody>([\s\S]*)<\/tbody>/, (m, body) => "<tbody>" + body.replace(/<tr>([\s\S]*?)<\/tr>/g, (r, cells) => {
  let i = 0;
  return "<tr>" + cells.replace(/<td ([^>]*)>/g, (t, attrs) => { const l = head[i++]; return i === 1 ? t : `<td ${attrs} data-l="${l}">`; }) + "</tr>";
}) + "</tbody>");

const ic = (name) => `<span class="ic">${IC.icon(name, { size: 30 })}</span>`;
const step = (icon, title, text) => `<li>${ic(icon)}<div><h3>${title}</h3><p>${text}</p></div></li>`;
const arrowOut = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';

/* ---------------------------------------------------------------------------- */
/* V1: the parcel card, drawn (F10). Field names as the county card shows them.  */

const CARD_ROWS = [
  ["Owner Name", "Who owns the lot."],
  ["PIN", "The 11-digit number every county office uses for the lot."],
  ["TMS", "The 10-digit tax map number."],
  ["Zoning Code", "What the county allows on the lot, outside the towns."],
  ["Acreage", "The lot's size in the county's records."],
  ["Square Footage", "The area of the shape drawn on the map."],
  ["Deed Book, Deed Page", "Where the deed is filed at the Register of Deeds."],
  ["Date Transferred", "When the lot last changed hands."],
  ["Soil Type", "The soil under the lot, by name."],
];
const PARCEL_CARD = `<figure class="gm-fig"><div class="gm-card" role="img" aria-label="A drawing of the parcel card on the Horry County GIS map, with a plain meaning beside each field: owner name, PIN, TMS, zoning code, acreage, square footage, deed book and page, date transferred and soil type.">`
  + `<div class="hd">${IC.icon("home", { size: 22 })}<span>Parcel details</span></div><dl>`
  + CARD_ROWS.map(([k, v]) => `<div class="r"><dt>${k}</dt><dd>${v}</dd></div>`).join("")
  + `</dl></div><figcaption>A drawing of the card the county map shows when you click a lot, with what each field means. The card also shows the lot number, the tax district and the legal description.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* V2: the county map's line and the surveyed line, drawn. One message; no numbers. */

const LINES = (() => {
  const pins = [[70, 46], [470, 40], [486, 236], [64, 244]];
  const poly = pins.map((p) => p.join(",")).join(" ");
  const off = pins.map(([x, y], i) => [x + [10, 14, 8, 12][i], y + [10, -6, 12, 4][i]]).map((p) => p.join(",")).join(" ");
  const dots = pins.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#c4783a" stroke="#fff" stroke-width="2.5"/>`).join("");
  return `<figure class="gm-fig gm-small"><div class="gm-draw"><svg class="gm-lines" viewBox="0 0 560 290" role="img" aria-label="A drawing of one lot from above. A solid line joins four corner markers set by a surveyor. A thin dashed line, the county map's line, runs close to it but not on it.">`
    + `<rect x="0" y="0" width="560" height="290" rx="14" fill="#eef1e8"/>`
    + `<rect x="190" y="100" width="170" height="100" rx="4" fill="#d9d3c7" stroke="#8b8478" stroke-width="2"/><text x="275" y="160" text-anchor="middle">House</text>`
    + `<polygon points="${poly}" fill="none" stroke="#1c2028" stroke-width="4" stroke-linejoin="round"/>`
    + `<polygon points="${off}" fill="none" stroke="#2f6f8f" stroke-width="2.5" stroke-dasharray="9 7" stroke-linejoin="round"/>`
    + dots
    + `</svg><div class="gm-key"><span class="s">The surveyed line and its corner markers</span><span class="d">The county map's line, drawn for taxes</span></div></div><figcaption>A drawing, not a real lot. The county draws its lines for taxes. A licensed surveyor finds and marks the corners on the ground.</figcaption></figure>`;
})();

/* ---------------------------------------------------------------------------- */
/* V3: the chart, from the CSV (F37). Title in the verifier's scope (VERIFY 37).  */

const pc = (v) => `${Math.round(v)}%`;
const CHART = G.bars(BANDS.map((b) => ({ name: BAND_NAME[b.band], value: b.off10, valueText: pc(b.off10) })), {
  caption: "Half-acre to one-acre lots are drawn off their listed size most often",
  note: `Share of lots drawn more than 10% bigger or smaller than their listed acreage, by listed lot size. ${n0(DV.comparable)} lots the county map lists with an acreage. Our count from the county's parcel layer.`,
  nameLabel: "Listed lot size", valueLabel: "Drawn more than 10% off", max: 20, compact: true,
});

/* ---------------------------------------------------------------------------- */
/* The years strip (F12, F13).                                                    */

const YEARS = `<figure class="gm-fig"><div class="gm-years" role="img" aria-label="The county's aerial photo years on the GIS map: ${AER.map((a) => a.year).join(", ")}. The first two are black and white; the rest are in color.">`
  + `<ol>${AER.map((a) => `<li${a.bw ? ' class="bw"' : ""}>${a.year}</li>`).join("")}</ol>`
  + `<div class="k"><span class="bw">Black and white</span><span>Color</span></div></div>`
  + `<figcaption>The ${AER.length} years of county aerial photos on the map's Imagery tab, each about 6 inches a pixel.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* Offers. Every request button goes to /contact/; the site opens the short pop-up. */

const TOP_OFFER = (bg) => h.cta("No county account? Send us the address.", "We pull the parcel, the recorded plat and the flood zone for you, free.", "Have us pull the parcel", LEAD, bg);
const END = {
  h2: "Send us the address. We pull the parcel, the plat and the flood zone.",
  p: "You need no county account. An agent sends you the county's facts about that lot, free.",
  label: "Send us the address", href: LEAD,
};
const PAWLEYS_STRIP = G.homesQ("city=Pawleys Island&type=house", "Houses for sale in Pawleys Island");
const ACRE_STRIP = G.homesQ("type=house&lotMin=1", "Houses on an acre or more");

const toFt = Math.round(43560 * 0.1 / 100) * 100; /* F38: 4,356 square feet, said as about 4,400 */
must(toFt === 4400, "F38: about 4,400 square feet");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Property records", url: "/buyers/property-records/" },
  title: "Horry County GIS Map: Parcel Search, Login & Property Lines",
  description: "The Horry County GIS parcel map now asks for a county sign-in. How to get in, search by address, owner or PIN, and read lot lines, acreage and zoning.",
  ogTitle: "Horry County GIS map: get past the sign-in, find any parcel, and read its lines, acreage and zoning",
  crumb: "GIS Map",
  eyebrow: "Horry County property records",
  h1: "Horry County GIS map: find any parcel, its lines and its tax map number",
  h1em: "Every lot in the county, with its lines, its zoning and aerial photos back to 1998.",
  sub: "The county's parcel map now opens on a sign-in screen. Three steps get you from that screen to a lot's lines, acreage and zoning.",
  heroCta: false,
  author: "devin",
  toc: false,
  shortAnswer: [
    `The Horry County GIS map is the county's parcel map, and it now asks you to sign in with a county account before it shows the map. Once in, search by address, owner, PIN or TMS, then click the lot.`,
    `The card gives the owner, the PIN, the zoning, the acreage and the deed book and page. The lines on the map are drawn for taxes, not surveyed.`,
  ],
  sections: [
    { h2: "How do I use the Horry County GIS map?", id: "steps", html: (bg) =>
      CSS + G.homesCss() + G.homesQScript() +
      `<p class="gm-cta-row"><a class="gm-go" href="${MAP}" target="_blank" rel="noopener">Open the county GIS map${arrowOut}</a></p>`
      + `<p class="gm-go-note">The map belongs to Horry County. Chapter3 is a real estate brokerage, not the county.</p>`
      + `<ol class="gm-steps">`
      + step("key", "Make a county account, then sign in.", `Choose ${h.ext(REGISTER, "Register")} on the sign-in screen. The form asks for your name, email, mailing address and phone, and it has no payment step. The sign-in may also ask for a code.`)
      + step("pin", "Search by address, owner, PIN or TMS.", `Open the Search tab and pick one. The PIN works on every lot. About 1 in 4 lots has no TMS on the map.`)
      + step("home", "Click the lot.", `A card opens with the county's facts about that piece of land. Zoom in close to see the lengths of the lines.`)
      + `</ol>`
      + TOP_OFFER(bg)
      + h.p(`Deeds, tax bills and the county's other records are in our ${h.a("/buyers/property-records/", "Horry County property records guide")}.`) },

    { h2: "What does the parcel card tell you?", id: "parcel-card", html: () =>
      h.p(`The parcel card is the box that opens when you click a lot on the map.`)
      + PARCEL_CARD
      + h.p(`The card shows no value for the home and no tax. For what a home could sell for, see ${h.a("/sell/home-value/", "what homes like yours sold for")}. With the PIN from the card, you can find ${sib("/buyers/property-records/tax-bill/", "the lot's tax bill")}.`) },

    { h2: "How do I find property lines in Horry County?", toc: "Property lines", id: "property-lines", html: (bg) =>
      h.p(`Zoom in on the county map until the lot lines show their lengths. Then use the map's own tools to measure and compare.`)
      + `<ul class="gm-list">`
      + `<li><strong>Read the line lengths.</strong> At close zoom, about 2 of every 3 line pieces show their length in whole feet.</li>`
      + `<li><strong>Measure a fence run.</strong> On the Tools tab, Measurement Tools has Distance and Area.</li>`
      + `<li><strong>Turn on Building Footprints.</strong> We checked the layer: the map draws ${n0(LAYERS["Building footprints"])} building outlines, so you can see the house and the shed against the lines.</li>`
      + `<li><strong>Find the recorded plat.</strong> A plat is the surveyor's drawing of the lot, filed with the county. Our ${sib("/buyers/property-records/deeds/", "deed and plat search guide")} shows how to find it.</li>`
      + `</ul>`
      + LINES },

    { h2: "Is the Horry County GIS map accurate?", toc: "Accuracy", id: "accuracy", html: () =>
      h.p(`The county map is close enough to find a lot, but not close enough to place a fence. The county's ${h.ext(DISCLAIMER, "disclaimer")} says its map shows parcels "as used for taxing purposes and not for survey purposes."`)
      + h.p(`The county keeps two sizes for many lots: the acreage it lists and the area of the shape it draws. We checked every lot the county lists with an acreage, ${n0(DV.comparable)} lots, and set the two side by side.`)
      + h.p(`On ${IN5} in 5 of those lots, the two are within 5% of each other. About 1 in 10 is drawn more than 10% bigger or smaller. On a one-acre lot, 10% is about ${n0(toFt)} square feet.`)
      + CHART
      + h.p(`The differences go both ways: about half of these lots are drawn bigger than listed, and half smaller. The listed acreage and the drawn shape come from different county records, and neither is a survey. A difference shows the two disagree, not which one is right.`)
      + h.p(`You can see both on the card. Acreage is the listed size, and Square Footage is the drawn shape's area. One acre is 43,560 square feet.`)
      + ACRE_STRIP },

    { h2: "When do you need a surveyor?", toc: "Surveyors", id: "surveyor", html: (bg) =>
      h.p(`You need a licensed surveyor whenever a decision depends on exactly where the line is on the ground.`)
      + `<ul class="gm-list">`
      + `<li><strong>A fence or a wall near a line.</strong> The county map does not show which side of the line a post is on.</li>`
      + `<li><strong>An addition, a pool or a shed near a side line.</strong> The zoning code says how far a building must stay from the lines. In the SF 10 district, a house stays at least 10 feet from each side line (${h.a("#zoning", "zoning codes")}).</li>`
      + `<li><strong>A disagreement with a neighbor about the line.</strong></li>`
      + `<li><strong>Buying land, or splitting a lot.</strong> The acreage on the map is not a survey.</li>`
      + `<li><strong>An HOA that asks for a surveyor's drawing</strong> before a fence or a shed, as ${h.a("/submarkets/carolina-forest/the-farm/", "The Farm in Carolina Forest")} does.</li>`
      + `</ul>`
      + h.p(`South Carolina licenses land surveyors through its ${h.ext(LLR, "Board of Registration for Professional Engineers and Surveyors")}. The board's ${h.ext(LLR_LOOKUP, "licensee lookup")} shows whether a surveyor holds a license.`)
      + h.cta("Buying a lot or a house with land? We check the lines before you offer.", "We pull the county's records on the lot and tell you whether it needs a survey.", "Have us check the lines", LEAD, bg) },

    { h2: "What is the Horry County tax map number?", toc: "Tax map number", id: "tax-map-number", html: () =>
      h.p(`The tax map number, or TMS, is a 10-digit number the county gives a parcel to identify it and place it on the map. The parcel card shows two numbers, the TMS and the PIN.`)
      + table(["Number", "Digits", "Shown on the map for"], [
        ["PIN", "11", "Every lot"],
        ["TMS, the tax map number", "10", "About 3 in 4 lots"],
      ])
      + h.p(`For a lot with no TMS, search by PIN or address. The county's ${h.ext(ASSESSOR, "tax estimator")} asks for the PIN.`)
      + h.p(`For what the tax on a home will be, use our ${h.a("/buyers/property-taxes/", "Horry County property tax guide")}. To find and pay a bill, see ${sib("/buyers/property-records/tax-bill/", "how to look up a tax bill")}.`) },

    { h2: "What do zoning codes like CFA, FA and SF 10 mean?", toc: "Zoning codes", id: "zoning", html: (bg) =>
      h.p(`The zoning code on the parcel card tells you what the county allows on the lot and how far a house must stay from its lines. The table shows six codes you will see often on the county map.`)
      + table(["Code", "Name", "What it allows"], [
        ["CFA", "Commercial Forest Agriculture", "Farms, forestry, homes, businesses, churches and recreation"],
        ["FA", "Forest and Agriculture", "Farms, forestry, and homes, businesses and churches at low density"],
        ["HC", "Highway Commercial", "Businesses along the county's roads"],
        ["SF 10", "Single Family", "Houses on lots of at least 10,000 square feet"],
        ["MSF 10", "Manufactured Single Family", "Houses or manufactured homes on lots of at least 10,000 square feet"],
        ["SF 20", "Single Family", "Houses on lots of at least 20,000 square feet"],
      ])
      + `<ul class="gm-list">`
      + `<li><strong>How far a house stays from the lines.</strong> In SF 10 and MSF 10, at least 25 feet from the front line, 10 feet from each side and 15 feet from the back. The full table is in the county's ${h.ext(ZONING_PDF, "zoning ordinance")}.</li>`
      + `<li><strong>Inside the towns.</strong> In Myrtle Beach, North Myrtle Beach, Conway, Surfside Beach and the county's other towns, the county map shows no zoning code. The town's own zoning applies there.</li>`
      + `<li><strong>How tall at the beach.</strong> The county map's Garden City overlay marks height zones of 35, 80, 120 and 180 feet. The ordinance allows new buildings in ${h.a("/submarkets/garden-city/", "Garden City")} up to 35 feet. The exceptions are the areas its map shows and a Planned Development District, where up to 180 feet may be approved.</li>`
      + `</ul>` },

    { h2: "See the land in 1998, and every few years since", toc: "Old aerial photos", id: "aerials", html: () =>
      h.p(`The map's Imagery tab holds the county's own aerial photos from ${AER.length} years, from ${AER[0].year} to ${AER[AER.length - 1].year}.`)
      + YEARS
      + h.p(`Click through the years to see when a house went up and what stood on the land before it. A street of new houses looks like this from above.`)
      + AERIAL
      + h.p(`On the Legend tab, these layers are worth turning on:`)
      + `<ul class="gm-list">`
      + `<li><strong>Flood Zones.</strong> FEMA's flood zone codes, such as AE and VE.${live("/buyers/flood-zone-check/") ? ` Our ${h.a("/buyers/flood-zone-check/", "flood zone guide")} says what each one means for a buyer.` : ""}</li>`
      + `<li><strong>Contours.</strong> Lines every 2 feet of height, to see which part of a lot is lowest. For a house's own flood history, see ${h.a("/buyers/undisclosed-flooding/", "how to find out if a house flooded")}.</li>`
      + `<li><strong>Soils.</strong> Each soil area by name, the same name the parcel card gives.</li>`
      + `<li><strong>Interstate 73.</strong> The planned route of the new interstate.</li>`
      + `<li><strong>Airport Overlays.</strong> The zones the county draws around its airports.</li>`
      + `</ul>` },

    { h2: "Georgetown County GIS for Pawleys Island and Litchfield", toc: "Georgetown County", id: "georgetown", html: () =>
      h.p(`${h.a("/submarkets/pawleys-island/", "Pawleys Island")} and Litchfield are in Georgetown County, and its ${h.ext(GT_MAP, "GIS One Map")} opens with no sign-in. Search it by TMS number, address or road name.`)
      + `<ul class="gm-list">`
      + `<li><strong>The TMS has 13 digits, typed with hyphens,</strong> in the county's own format: <span class="gm-nw">05-0029-049-00-00</span>.</li>`
      + `<li><strong>Addresses spell out the direction and shorten the road type:</strong> SOUTH HAZARD ST, not S HAZARD ST, and HAGLEY DR, not HAGLEY DRIVE.</li>`
      + `<li><strong>To search by owner name,</strong> use the ${h.ext(GT_DEEDS, "Register of Deeds name search")}. The map also links the Assessor's qPublic database.</li>`
      + `<li><strong>About 2 in 3 parcels have a plat reference.</strong> In the deeds search, a plat slide needs an S in front, as in S839-2.</li>`
      + `<li><strong>The state's beachfront lines are a layer:</strong> the baseline and the setback line along the ocean, the lines an oceanfront buyer asks about.</li>`
      + `<li><strong>The Swipe tool compares two aerial years,</strong> for example 2022 and 2024.</li>`
      + `</ul>`
      + h.p(`Georgetown's map has the same warning as Horry's: its layers do not replace a legal survey, deed or plat. Questions about the map go to the county's ${h.ext(GT_GIS, "GIS office")}.`)
      + PAWLEYS_STRIP },
  ],
  faqTitle: "Horry County GIS map questions",
  faq: [
    { q: "Do I need an account to use the Horry County GIS map?", a: "Yes. The parcel map asks for a sign-in with a county website account. Choose Register on the sign-in screen to make one. The same account opens the county's Land Records app." },
    { q: "Does the county charge for a GIS map account?", a: "The sign-up form shows no fee and has no payment step. To skip the account, send us the address and we pull the parcel card for you." },
    { q: "Can I search the Horry County GIS map by owner name?", a: "Yes. On the Search tab, choose Owner and type the name. The map matches every word you type anywhere in the owner's name, so the order of the words does not matter." },
    { q: "What if my parcel has no TMS number?", a: "Search by PIN or by address instead. About 1 in 4 parcels on the Horry County map shows no TMS, but every parcel has an 11-digit PIN." },
    { q: "Does the Horry County GIS map show what a house is worth?", a: "No. The parcel card shows who owns the lot, its size and its zoning, but no value for the home and no tax. An agent prices a home from recent sales of homes like it." },
    { q: "Can I print the Horry County GIS map?", a: "Yes. The Tools tab has Print Map, next to the measuring tools for distance and area." },
    { q: "Is Chapter3 part of Horry County?", a: "No. Chapter3 is a real estate brokerage. The GIS map belongs to Horry County. We pull a lot's county records for buyers and owners, free." },
  ],
  sources: [
    { name: "Horry County GIS map", href: MAP },
    { name: "parcel layer", href: LAYERSVC },
    { name: "tax map number", href: TAXMAP },
    { name: "Assessor", href: ASSESSOR },
    { name: "zoning ordinance", href: ZONING_PDF },
    { name: "Planning and Zoning", href: ZONING_PAGE },
    { name: "Georgetown One Map", href: GT_MAP },
    { name: "SC LLR", href: LLR },
  ],
  sourcesNote: `Our count: the county's parcel layer, every lot with a listed acreage (${n0(DV.comparable)}), drawn area against listed acreage. Not a survey and not legal advice.`,
  afterSources: () => CREDITS + PH.imageSchema([AERIAL_REC]),
  bottomCta: END,
  keywords: "Horry County GIS, Horry County GIS map, Horry County GIS login, Horry County parcel search, Horry County tax map, Horry County tax map number, TMS number, PIN number lookup, Horry County property lines, Horry County zoning map, Horry County zoning codes CFA FA, Georgetown County GIS, Pawleys Island tax map",
  about: "The Horry County GIS parcel map, Horry County, South Carolina",
});
