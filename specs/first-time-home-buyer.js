/* /buyers/first-time-home-buyer-myrtle-beach/ - a first home in Horry County: what the cash to buy is made of
 * and what lowers each part, what a first budget buys here (condo, townhouse or house), the neighborhoods
 * where starter houses sell, condo or house, the yearly cost besides the loan, who qualifies, and the steps.
 *
 * Batch 2026-10-d, Lane U. Version 1, 2026-11-01. The live page was hand-made; this spec replaces it.
 * Version 2, 2026-11-01, review round 1 (critic, reader, owner's eye; REVIEW-1.md has each finding and
 * what changed): the cash answer names the three parts of the cash; the worked example shows only what
 * comes off the buyer's cash; 576 is said once; SC Housing's income limits are on the page; the starter
 * section names neighborhoods from the deeds (subdivisions.json, row 44) with one line each from the
 * sibling page that owns them (row 45); condo or house is written as what it means for the buyer; the
 * price chart is one stacked bar a band; the ZIP chart is cut; no flood zone codes; the steps say what
 * happens and what we do; the end offer band keeps its dark panel (NEEDS.md item 4).
 * Version 3, 2026-11-01, review round 2 (REVIEW-2.md): the dek is the answer; earnest money is part of
 * the cash, not a third cost; the worked example is folded into the seller card; the four neighborhood
 * entries are this page's own lines from subdivisions.json (row 50), each with a homes strip in place
 * of the stand-in photo (owner, 2026-10-21); Socastee is named (row 49); the FAQ keeps only what the
 * body does not say; lender talk, the deed fee, the termite letter and the 65-and-over break are cut
 * from the body; no sentence about missing insurance data.
 * Version 4, 2026-11-03, the lead's final fix list (REVIEW-FINAL.md): FHA's smallest down payment is
 * said as a rule (a 580 score), with no percent (PLAYBOOK A17); home insurance has a figure (Census, row 54);
 * the four neighborhoods are told by the loan that fits each (USDA's area, row 53) and the owner page keeps
 * what each is like; the qualify card on past ownership no longer reads as a contradiction; the photo is a
 * street of houses that sold under $300,000 (NOAA, January 2026, row 55), not a pond in the Golf and Yacht Club.
 * Facts: Blog-Brain batches/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/facts.md (VERIFIED rows,
 * CORRECTED rows in the verifier's "Use" wording only, and rows 42 to 47 marked VERIFIED-BY-FIXER for the
 * lead to re-check; VERIFY.md). Demand: must-answer.md (Google suggestions of 2026-11-01). Plan: PLAN.md.
 * Data: data/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/ (findings.json, chart-ladder.json,
 * map-starter-points.json and subdivisions.json, built by build_findings.py and subdivisions.py from the
 * county deed index and parcels, the county flood and ZIP layers, and the CRM's active listings in
 * aggregate). Every count, share and median on the page is computed here from those files and checked
 * against its ledger row.
 * Kept from the live page: the title and H1 the owner liked (data/headlines.json), condos and townhomes
 * as entry points, the building's loan approval, the HOA papers we read before an offer, the 3-year
 * first-time meaning (now with its exceptions), "Chapter3 Realty is not a lender".
 * Never on the page: a down payment amount or percentage, a rate, a payment (PLAYBOOK A14, A17).
 * Photos: none of our own yet. Each neighborhood entry carries a homes strip (G.homes), which the
 * website fills with live listing photos; the photo partner's shots go in when he sends them
 * (batches/2026-10-d/buyers-first-time-home-buyer-myrtle-beach/shot-list.md).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/buyers/first-time-home-buyer-myrtle-beach/";
const DATA = path.join(__dirname, "..", "data", "2026-10-d", "buyers-first-time-home-buyer-myrtle-beach");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), LADDER = read("chart-ladder.json").rows, ZIPS = read("chart-zip.json").rows, PTS = read("map-starter-points.json").points;
const SUB = read("subdivisions.json");
/* Our one picture of the subject: a U.S. government aerial (NOAA, January 2026, public domain) of three
   streets of houses in Bent Oak Estates, Myrtle Beach, framed on deed sales: 9 of the 10 houses that sold
   in the frame went for under $300,000 (photos.json here; facts.md row 55). */
const ph = PK.create({ h, photos: read("photos.json").photos }).photoSet({ aerialWidth: "720px" });
const HOUSES_AERIAL = () => ph.aerial("bent-oak-estates-houses-from-above", "Houses in Bent Oak Estates, in the City of Myrtle Beach, from above in January 2026. Nine of the 10 houses that sold in this view in the past year went for under $300,000.", { closeUp: true });
const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const near = (v, step) => Math.round(v / step) * step;
const must = (ok, what) => { if (!ok) throw new Error(`first-time-home-buyer: ${what} differs from its ledger row`); };

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                             */

const K = F.by_kind;                                     // rows 1, 4 (corrected: code 117 dropped)
must(F.inputs.kept === 12775 && K.condo.sales === 4332, "row 1 (kept sales)");
must(K.condo.median === 219000 && K.townhouse.median === 253500 && K.house.median === 366555, "row 4 (medians)");
must(K.house.under_300k === 2147 && F.under_300k.share_of_all_sales === 45.9, "row 4 (under $300,000)");
const L = F.listings;                                    // rows 5, 6
const HSE = L.house_le_300k, CND = L.condo_le_250k, TWN = L.townhouse_le_300k;
must(HSE.count === 576 && HSE.median_beds === 3 && HSE.median_price === 270000 && HSE.median_acres === 0.2, "row 5");
must(CND.count === 1705 && CND.median_beds === 1 && near(CND.median_sqft, 10) === 740, "row 6 (condos)");
must(near(TWN.count, 100) === 200 && TWN.median_beds === 3 && TWN.median_sqft === 1430, "row 6 (townhouses)");
const PRICE = HSE.median_price;                          // $270,000, the middle of the houses listed at or under $300,000
const NV = F.houses_new_vs_resale;                       // row 3
must(NV.new.under_300k === 521 && near(NV.new.median, 1000) === 349000 && NV.resale.median === 375000, "row 3");
const BY_ZIP_LIST = L.house_le_300k_by_zip;              // row 8
const INLAND_LIST = BY_ZIP_LIST.filter((z) => ["29526", "29527", "29568", "29569"].includes(z.zip)).reduce((t, z) => t + z.count, 0);
must(INLAND_LIST === 395, "row 8");
const FL = F.flood;                                      // row 9
must(FL.house_townhouse_under_300k.in_sfha === 78 && FL.house_townhouse_under_300k.placed === 2403 && FL.condo_under_300k.placed === 2926, "row 9");
const OOS = F.out_of_state;                              // row 24
must(OOS.house_townhouse_under_300k.outside_sc === 349 && OOS.condo_under_300k.outside_sc === 1509, "row 24");
const TAX = F.tax_example;                               // row 33
must(TAX.value === PRICE && TAX.tax_4pct === 993 && TAX.tax_6pct === 3256, "row 33");
const TAX4 = near(TAX.tax_4pct, 10), TAX6 = near(TAX.tax_6pct, 10), TAXD = near(TAX.tax_6pct - TAX.tax_4pct, 10);
const SELLER = PRICE * 0.06;                             // row 12: up to 6 percent in all
must(SELLER === 16200, "row 12");
const LAD = (lo) => LADDER.find((r) => r.band[0] === lo);
const under200 = [LAD(0), LAD(150000)], b250 = LAD(250000);
must(under200.reduce((t, r) => t + r.condo, 0) === 1876 && under200.reduce((t, r) => t + r.total, 0) === 2398, "row 2 (under $200,000)");
must(b250.house === 1246 && b250.total === 1885 && b250.house_new === 356, "row 2 ($250,000 to $300,000)");
const Z = Object.fromEntries(ZIPS.map((r) => [r.zip, r]));
must(Z["29527"].share === 68.7 && Z["29569"].share === 64.0 && Z["29582"].share === 8.1, "row 7");
must(PTS.length === 2403, "row 7 (map points)");
const S = (name) => SUB[name];                           // row 44: subdivisions.json
must(S("The Townes at Amber Bluff").under_300k === 63 && S("Indigo Grove").under_300k === 44 && S("Birchwood").under_300k === 25
  && S("Myrtle Beach Golf and Yacht Club").under_300k === 33, "row 44 (neighborhood counts)");
must(S("The Townes at Amber Bluff").townhouse_under_300k === 62 && S("Indigo Grove").townhouse_under_300k === 0
  && S("Birchwood").new_under_300k === 25 && S("Myrtle Beach Golf and Yacht Club").new_under_300k === 0, "row 50 (new or resale, townhouse or house)");
const MID = (name) => near(S(name).median_under_300k, 1000);  // row 50: the middle sale under $300,000
must(MID("The Townes at Amber Bluff") === 238000 && MID("Indigo Grove") === 245000 && MID("Birchwood") === 226000
  && MID("Myrtle Beach Golf and Yacht Club") === 225000, "row 50 (middle prices)");
const SOC = F.starter_by_zip.find((z) => z.zip === "29588");  // row 49
must(SOC && SOC.starter === 295 && F.starter_by_zip.slice().sort((a, b) => b.starter - a.starter)[2].zip === "29588", "row 49 (Socastee third)");

/* ---------------------------------------------------------------------------- */
/* Page styles: the glass cards this page draws itself. Scoped to .c3-ft.        */
/* Every block is 760 px wide at most, so the right edges line up on a wide screen (critic, round 1). */

const GL = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 40px -28px rgba(28,32,40,.45);border-radius:20px";
const C_CONDO = "#56636e", C_TOWN = "#4e6440", C_HOUSE = "#8a5226", C_OTHER = "#d8d0c3", C_NEW = "#c4783a", C_RESALE = "#5c6b78";
const W = "max-width:760px";
const BAND = 'main#main>section[style^="background:var(--navy)"]';
const CSS = "<style>"
  + `.c3-ft-ic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;color:var(--brass);background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.45)}`
  /* Icon cards (the ways the cash comes down, who qualifies) */
  + `.c3-ft-ways{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.8rem;${W}}`
  + "@media (min-width:700px){.c3-ft-ways{grid-template-columns:1fr 1fr}}"
  + `.c3-ft-ways>li{${GL};margin:0;padding:1rem 1.1rem .95rem;display:grid;grid-template-columns:40px 1fr;gap:.2rem .85rem;align-items:start;align-content:start}`
  + ".c3-ft-ways .k{grid-column:2;align-self:center;font-family:var(--sans);font-size:1.05rem;font-weight:650;color:var(--navy);line-height:1.3}"
  + ".c3-ft-ways .d{grid-column:1 / -1;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55;margin-top:.35rem}"
  + ".c3-ft-ways .d a{color:var(--navy);text-decoration:underline}"
  /* Big-number tiles (the worked example, the homes listed now) */
  + `.c3-ft-ex{${GL};margin:1.4rem 0 1.6rem;padding:1.1rem 1.15rem 1rem;${W}}`
  + ".c3-ft-ex .cap{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;line-height:1.35;margin:0 0 .8rem}"
  + ".c3-ft-ex .after{color:var(--muted);font-size:1rem;line-height:1.55;margin:.8rem 0 0}"
  + ".c3-ft-tiles{list-style:none;padding:0;margin:0;display:grid;gap:.65rem}"
  + "@media (min-width:640px){.c3-ft-tiles{grid-template-columns:1fr 1fr}.c3-ft-tiles.three{grid-template-columns:1fr 1fr 1fr}}"
  + ".c3-ft-tiles>li{margin:0;padding:.8rem .9rem;border-radius:14px;background:rgba(255,255,255,.78);border:1px solid rgba(196,120,58,.3)}"
  + ".c3-ft-tiles b{display:block;font-family:var(--serif);font-weight:400;font-size:2rem;line-height:1.1;color:#8a5226}"
  + ".c3-ft-tiles .t{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1rem;margin-top:.25rem}"
  + ".c3-ft-tiles span.d{display:block;color:var(--muted);font-size:1rem;line-height:1.5;margin-top:.2rem}"
  + ".c3-ft-tiles .ic{display:flex;align-items:center;gap:.5rem;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;margin-bottom:.35rem}"
  + ".c3-ft-tiles .ic span{color:var(--brass);display:inline-flex}"
  /* The kind-of-home chart: one stacked bar a price band, shares only */
  + `.c3-ft-chart{${GL};margin:1.4rem 0 1.6rem;padding:1.1rem 1.15rem 1rem;${W}}`
  + ".c3-ft-chart .cap{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;line-height:1.35;margin:0 0 .6rem}"
  + ".c3-ft-key{display:flex;flex-wrap:wrap;gap:.3rem 1.1rem;margin:0 0 .9rem;font-family:var(--sans);font-size:1rem;color:var(--navy)}"
  + ".c3-ft-key span{display:inline-flex;align-items:center;gap:.4rem}.c3-ft-key i{display:inline-block;width:1.1rem;height:.75rem;border-radius:3px}"
  + ".c3-ft-row{display:grid;grid-template-columns:minmax(0,1fr);gap:.25rem;margin:0 0 .75rem;font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.35}"
  + "@media (min-width:700px){.c3-ft-row{grid-template-columns:10.5rem minmax(0,1fr);align-items:center;gap:.9rem}}"
  + ".c3-ft-row:last-of-type{margin-bottom:0}"
  + ".c3-ft-stack{display:flex;height:1.6rem;border-radius:7px;overflow:hidden;min-width:0}"
  + ".c3-ft-stack i{display:flex;align-items:center;justify-content:center;font-style:normal;font-size:.9rem;font-weight:650;color:#fff;white-space:nowrap;overflow:hidden}"
  + ".c3-ft-stack i.lt{color:var(--navy)}"
  /* The map */
  + ".c3-ft-map svg{display:block;width:100%;height:auto}"
  + ".c3-ft-mkey{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;margin:.6rem .2rem .1rem;font-family:var(--sans);font-size:1rem;color:var(--navy)}"
  + ".c3-ft-mkey span{display:inline-flex;align-items:center;gap:.45rem}.c3-ft-mkey i{display:inline-block;width:.8rem;height:.8rem;border-radius:50%}"
  /* Neighborhood entries */
  + `.c3-ft-hoods{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;grid-template-columns:minmax(0,1fr);gap:.8rem;${W}}`
  + `.c3-ft-hoods>li{${GL};margin:0;padding:1rem 1.15rem;min-width:0}`
  + ".c3-ft-hoods h3{margin:0 0 .15rem;font-family:var(--serif);font-size:1.3rem;font-weight:400;color:var(--navy);line-height:1.25}"
  + ".c3-ft-hoods h3 a{color:inherit;text-decoration:none}.c3-ft-hoods h3 a:hover{text-decoration:underline}"
  + ".c3-ft-hoods .w{display:block;font-family:var(--sans);font-weight:650;font-size:1rem;color:#8a5226;margin:0 0 .45rem}"
  + ".c3-ft-hoods p{margin:0 0 .5rem;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}.c3-ft-hoods p:last-child{margin-bottom:0}"
  + ".c3-ft-hoods p a{color:var(--navy);text-decoration:underline}"
  + ".c3-ft-hoods figure{margin:.6rem 0 .7rem}.c3-ft-hoods img{display:block;width:100%;height:auto;border-radius:12px}"
  + ".c3-ft-hoods figcaption{color:var(--muted);font-size:.95rem;line-height:1.5;margin-top:.4rem}"
  /* Condo or house: two cards side by side */
  + `.c3-ft-vs{list-style:none;padding:0;display:grid;gap:.8rem;margin:1.2rem 0 1.4rem;${W}}`
  + "@media (min-width:700px){.c3-ft-vs{grid-template-columns:1fr 1fr}}"
  + `.c3-ft-vs>.c{${GL};margin:0;padding:1rem 1.15rem .4rem}`
  + ".c3-ft-vs .hd{display:flex;align-items:center;gap:.7rem;margin:0 0 .6rem;font-family:var(--serif);font-size:1.35rem;color:var(--navy)}"
  + ".c3-ft-vs p:not(.hd){margin:0 0 .7rem;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}"
  /* What we check: a short glass checklist */
  + `.c3-ft-check{${GL};list-style:none;margin:1.2rem 0 1.6rem;padding:1rem 1.15rem;${W};display:grid;gap:.7rem}`
  + ".c3-ft-check li{margin:0;display:grid;grid-template-columns:1.9rem 1fr;gap:.6rem;align-items:start;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}"
  + ".c3-ft-check li::before{content:'';width:1.6rem;height:1.6rem;border-radius:50%;margin-top:.05rem;background:var(--brass) url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M5 12.5l4.5 4.5L19 7.5'/%3E%3C/svg%3E\") center/1rem no-repeat}"
  + ".c3-ft-check strong{color:var(--navy);font-family:var(--sans)}"
  /* Numbered steps */
  + `.c3-ft-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.7rem;${W}}`
  + `.c3-ft-steps>li{${GL};counter-increment:s;margin:0;padding:.95rem 1.1rem .95rem 4rem;position:relative;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}`
  + ".c3-ft-steps>li::before{content:counter(s);position:absolute;left:1rem;top:.9rem;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--navy);color:#f4efe8;font-family:var(--sans);font-weight:700;display:flex;align-items:center;justify-content:center}"
  + ".c3-ft-steps strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem;margin-bottom:.1rem}"
  + ".c3-ft-note{color:var(--muted);font-size:.95rem;line-height:1.55;margin:-.6rem 0 1.4rem;max-width:760px}"
  /* Workarounds for shared parts, until the lead moves them (NEEDS.md items 4 to 6). */
  /* 4. The end offer band: the homes feed adds its MLS notice after it inside <main>, so glass.js's
        ":not(:last-child)" rule drew it as the light top bar with ivory text. The end band is the one
        whose heading is an h2: give it back its dark panel. */
  + `${BAND}:has(>.wrap>h2)>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97));border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6);display:block;text-align:center!important;border-radius:28px;padding:2.2rem 1.6rem;margin-left:auto!important;margin-right:auto!important;max-width:720px}`
  + `@media (max-width:699px){${BAND}:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem;border-radius:24px}}`
  + `@supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){${BAND}:has(>.wrap>h2)>.wrap{background:#2a3040!important}}`
  + `@media (prefers-reduced-transparency:reduce){${BAND}:has(>.wrap>h2)>.wrap{background:#2a3040!important}}`
  /* 4b. The top offer card started at 16 px while the text column starts at the site's .wrap padding
        (2rem, 1.25rem up to 768 px, 1.4rem up to 480 px as measured). Line its left edge up with the column (critic, round 2). */
  + `${BAND}:not(:has(>.wrap>h2))>.wrap{margin-left:max(2rem,calc((100% - 1200px) / 2 + 2rem))!important;width:calc(100% - 4rem)}`
  + `@media (max-width:768px){${BAND}:not(:has(>.wrap>h2))>.wrap{margin-left:1.25rem!important;width:calc(100% - 2.5rem)}}`
  + `@media (max-width:480px){${BAND}:not(:has(>.wrap>h2))>.wrap{margin-left:1.4rem!important;width:calc(100% - 2.8rem)}}`
  /* 5. The homes search bar was 341 px wide in a 320 px window (the page slid sideways). */
  + "main .hx-fb,main .hx-fb>*{min-width:0;max-width:100%}main .hx-fb-ai>.hx-fb-q{align-self:stretch;width:100%;max-width:100%;min-width:0;box-sizing:border-box}main .hx-fb-q textarea{width:0;min-width:0}"
  /* 6. The header's phone number ended at 1029 px in a 1024 px window. */
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas{gap:8px}}"
  /* The contents list: four columns on a wide screen, so the box is not one column of eight short links (critic, round 2). */
  + 'main#main nav[aria-label="On this page"]{max-width:760px!important}@media (min-width:700px){main#main nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));column-gap:1.2rem}}'
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Section 1: the cash. What it is made of, the ways each part comes down (rows  */
/* 11 to 19, 42), and what comes off on the $270,000 house (rows 5, 12, 18, 43). */

const WAYS = [
  { ic: "key", k: "FHA's smallest down payment, at a 580 score", d: "Every buyer with a credit score of 580 or more can get FHA's smallest down payment. From 500 to 579 you put more down, and below 500 FHA does not insure the loan. Your lender gives you the dollar figure for your price." },
  { ic: "key", k: "No down payment on a VA loan", d: `A loan backed by the Department of Veterans Affairs (VA) often needs no down payment, as long as the price is not above the appraised value. That is the value an appraiser gives the home for the loan. Our ${h.a("/buyers/va-loans/", "VA loan guide")} covers who can use one.` },
  { ic: "home", k: "No down payment on a USDA loan", d: "A USDA loan, backed by the U.S. Department of Agriculture, can cover the full price, with no down payment, when the appraiser values the home at the price or more. It is for low- and moderate-income buyers in USDA's area. On our map, about 6 in 10 houses listed at or under $450,000 in Horry County are inside that area. Nearly all have a Conway, Loris, Aynor or Longs address." },
  { ic: "dollar", k: "The seller pays your closing costs", d: `On an FHA loan, insured by the Federal Housing Administration, the seller, a builder or the agents can pay up to 6 percent of the price in all toward your closing costs. On a ${money(PRICE)} house, the middle one listed now at or under $300,000, that is up to ${money(SELLER)}. It can cover only your actual closing costs, and the seller has to agree to it in your offer.` },
  /* Light fix, triage 2026-11-08 and the cannibalization map: /buyers/programs/ is the one page for SC Housing's
     details, so this card keeps one sentence and a link there. */
  { ic: "tax", k: "$10,000 from SC Housing", d: `SC Housing, the South Carolina State Housing Finance and Development Authority, gives an eligible buyer $10,000 toward the down payment and closing costs. Our guide to ${h.a("/buyers/programs/", "SC down payment assistance")} has who qualifies, when it is repaid and the steps.` },
  { ic: "family", k: "A gift toward the purchase", d: "On an FHA loan, the money can be a gift from family, an employer or labor union, a charity or a government homebuyer program. The lender needs a gift letter signed by the giver." },
  { ic: "calendar", k: "Up to $10,000 from an IRA", d: "You can take up to $10,000 out of an IRA, an individual retirement account, for a first home without the 10 percent early-withdrawal penalty. You, and your spouse if you are married, must not have owned a main home in the last two years. The money must be spent within 120 days." },
];
const cards = (list, label) => `<ul class="c3-ft-ways" role="list" aria-label="${label}">`
  + list.map((w) => `<li><span class="c3-ft-ic" aria-hidden="true">${icon(w.ic, { size: 22 })}</span><span class="k">${w.k}</span><span class="d">${w.d}</span></li>`).join("") + "</ul>";


/* ---------------------------------------------------------------------------- */
/* Section 2: what sold, by price and kind (chart-ladder.json, rows 1 and 2),    */
/* then what is listed now (rows 5, 6).                                          */

const BANDS = LADDER.filter((r) => r.band[1] !== null && r.band[1] <= 400000);
if (BANDS.length !== 6) throw new Error("chart-ladder.json: expected six bands up to $400,000");
const bandName = ([lo, hi]) => lo === 0 ? `Under ${money(hi)}` : `${money(lo)} to ${money(hi)}`;
const seg = (v, total, color, light) => {
  const p = v / total * 100;
  return p < 0.5 ? "" : `<i class="${light ? "lt" : ""}" style="width:${p.toFixed(1)}%;background:${color}">${p >= 12 ? Math.round(p) + "%" : ""}</i>`;
};
const KIND_CHART = `<figure class="c3-ft-chart"><span class="cap">What sold in Horry County in the past year, by price</span>`
  + `<div class="c3-ft-key" aria-hidden="true"><span><i style="background:${C_CONDO}"></i>Condos</span><span><i style="background:${C_TOWN}"></i>Townhouses</span><span><i style="background:${C_HOUSE}"></i>Houses</span><span><i style="background:${C_OTHER}"></i>Manufactured</span></div>`
  + BANDS.map((r) => {
    const pc = (v) => Math.round(v / r.total * 100);
    return `<div class="c3-ft-row"><span>${bandName(r.band)}</span><span class="c3-ft-stack" role="img" aria-label="${bandName(r.band)}: condos ${pc(r.condo)} percent, townhouses ${pc(r.townhouse)} percent, houses ${pc(r.house)} percent">`
      + seg(r.condo, r.total, C_CONDO) + seg(r.townhouse, r.total, C_TOWN) + seg(r.house, r.total, C_HOUSE) + seg(r.manufactured, r.total, C_OTHER, true) + `</span></div>`;
  }).join("")
  + `<figcaption style="color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.9rem">Each bar is the homes that sold in that price range. Homes over $400,000 are not shown.</figcaption></figure>`;

const NOW_TILES = `<div class="c3-ft-ex"><span class="cap">For sale now: the middle home in each group</span><ul class="c3-ft-tiles three" role="list">`
  + `<li><span class="ic"><span aria-hidden="true">${icon("town", { size: 20 })}</span>Condos, ${money(250000)} or less</span><b>About ${n(near(CND.count, 100))}</b><span class="d">listed. The middle one has ${CND.median_beds} bedroom and about ${n(near(CND.median_sqft, 10))} square feet.</span></li>`
  + `<li><span class="ic"><span aria-hidden="true">${icon("key", { size: 20 })}</span>Townhouses, ${money(300000)} or less</span><b>About ${n(near(TWN.count, 100))}</b><span class="d">listed. The middle one has ${TWN.median_beds} bedrooms and about ${n(TWN.median_sqft)} square feet.</span></li>`
  + `<li><span class="ic"><span aria-hidden="true">${icon("home", { size: 20 })}</span>Houses, ${money(300000)} or less</span><b>${n(HSE.count)}</b><span class="d">listed. The middle one has ${HSE.median_beds} bedrooms and about ${n(near(HSE.median_sqft, 10))} square feet on a fifth of an acre, at ${money(PRICE)}.</span></li>`
  + `</ul></div>`;

/* ---------------------------------------------------------------------------- */
/* Section 3: where the starter houses sold (map-starter-points.json, row 7),    */
/* and the neighborhoods with the most of them (subdivisions.json, rows 44, 45). */

const starterMap = () => {
  const { loadGeo2 } = require(path.join(BB, "tools", "area-map.js"));
  const geo = loadGeo2();
  const k = 560, cos = Math.cos(33.9 * Math.PI / 180), lon0 = -79.36, lat0 = 34.33;
  const X = (lon) => (lon - lon0) * cos * k, Y = (lat) => (lat0 - lat) * k;
  const MW = 440, MH = 430;
  const outline = read("raw/horry-county-boundary.geojson").features[0].geometry.coordinates[0].filter((_, i) => i % 3 === 0);
  const pts = (r) => r.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join("L");
  const sea = [...geo.coast, [-78.0, 33.75], [-78.0, 32.9], [-79.6, 32.9], [-79.6, 33.1]];
  /* One path per color; each dot is a zero-length line with a round cap. Dots on the same spot are drawn once. */
  const dots = (isNew) => {
    const seen = new Set(); let d = "";
    for (const [lo, la, , nw] of PTS) {
      if (!!nw !== isNew) continue;
      const x = X(lo).toFixed(0), y = Y(la).toFixed(0), key = x + "," + y;
      if (seen.has(key)) continue; seen.add(key); d += `M${x} ${y}h0`;
    }
    return d;
  };
  const FT = 'font-family="Inter,system-ui,sans-serif"';
  const HALO = 'paint-order="stroke" stroke="#fbf8f3" stroke-width="5" stroke-linejoin="round"';
  const T = Object.fromEntries(geo.towns.map((t) => [t.name, t]));
  /* Label spots in map units from the town's point, checked in the shots at 390, 768 and 1440. */
  const LAB = [["Loris", 12, 6, "start"], ["Longs", 12, -6, "start"], ["Aynor", 0, -14, "middle"], ["Conway", -12, 6, "end"],
    ["Little River", -8, -12, "end"], ["North Myrtle Beach", 7, 20, "start", ["North Myrtle", "Beach"]], ["Carolina Forest", 14, -30, "start", ["Carolina", "Forest"]],
    ["Myrtle Beach", 12, 16, "start"], ["Socastee", -12, 2, "end"], ["Surfside Beach", -11, 8, "end"]];
  const towns = LAB.map(([name, dx, dy, a, lines]) => {
    const t = T[name]; if (!t) throw new Error(`area-map towns: no ${name}`);
    const x = X(t.lon), y = Y(t.lat);
    const txt = (lines || [name]).map((l, i) => `<tspan x="${(x + dx).toFixed(1)}" dy="${i ? 20 : 0}">${l}</tspan>`).join("");
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#fff" stroke="#1c2028" stroke-width="2"/>`
      + `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${a}" ${FT} font-size="19.5" font-weight="600" fill="#1c2028" ${HALO}>${txt}</text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW} ${MH}" role="img" aria-label="Map of Horry County with a dot for each house or townhouse that sold for under $300,000 in the past year. The dots crowd around Conway, Longs and Loris, along the roads between them, and in Socastee, west of Myrtle Beach. Few are near the beach in North Myrtle Beach.">`
    + `<defs><clipPath id="c3-ft-frame"><rect width="${MW}" height="${MH}"/></clipPath></defs><g clip-path="url(#c3-ft-frame)">`
    + `<rect width="${MW}" height="${MH}" fill="#e9e3d8"/>`
    + `<path d="M${pts(outline)}Z" fill="#fdfbf7" stroke="#5c6b78" stroke-width="1.6" stroke-linejoin="round"/>`
    + `<path d="M${pts(sea)}Z" fill="#d3e0e5"/>`
    + `<path d="${dots(false)}" stroke="${C_RESALE}" stroke-opacity=".7" stroke-width="4.6" stroke-linecap="round" fill="none"/>`
    + `<path d="${dots(true)}" stroke="${C_NEW}" stroke-opacity=".9" stroke-width="4.6" stroke-linecap="round" fill="none"/>`
    + `<text x="${MW - 12}" y="${MH - 12}" text-anchor="end" ${FT} font-size="17" font-style="italic" fill="#3f6275">Atlantic Ocean</text>`
    + towns + `</g></svg>`;
  return `<figure class="c3-ft-map" style="margin:1.6rem 0 1.8rem;max-width:560px">${svg}`
    + `<div class="c3-ft-mkey" aria-hidden="true"><span><i style="background:${C_RESALE}"></i>Resale house or townhouse</span><span><i style="background:${C_NEW}"></i>New from a builder</span></div>`
    + `<figcaption style="color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem">Each dot is a house or townhouse that sold for under $300,000 in the past year. Map: Chapter3 Realty, from Horry County deed and parcel records and Census TIGER/Line county lines and coast.</figcaption></figure>`;
};

const AFF = "/buyers/affordable-places-to-live/";
/* Each entry is this page's own line from subdivisions.json (row 50) and the road from the owner page
   (rows 45, 49), then the place's homes strip (G.homes; CRM slugs from batches/2026-10-b/data/idx-places.json),
   which the website fills with live listing photos (owner, 2026-10-21). The owner page holds the rest. */
/* This page's angle on them is the loan (lead, 2026-11-03: the life in each is the owner page's): the
   kind of home, the middle price (row 50) and whether USDA's no-down-payment loan can be used there
   (row 53: every deed sale tested against USDA's ineligible area; the live layer agrees at each center). */
const IN_USDA = "Inside USDA's area.";
const HOODS = [
  { id: "amber-bluff", name: "The Townes at Amber Bluff", where: "Conway, off Savannah Bluff Road",
    p: [`New townhomes, at a middle price of about ${money(MID("The Townes at Amber Bluff"))} last year.`, IN_USDA] },
  { id: "indigo-grove", name: "Indigo Grove", where: "Near Longs, off SC 90",
    p: [`New houses, at a middle price of about ${money(MID("Indigo Grove"))} last year.`, IN_USDA] },
  { id: "birchwood", name: "Birchwood", where: "Southwest of Longs, off SC 905",
    p: [`New houses, at a middle price of about ${money(MID("Birchwood"))} last year, less than the new townhomes at Amber Bluff.`, IN_USDA] },
  { id: "golf-and-yacht-club", name: "Myrtle Beach Golf and Yacht Club", where: "Off Bay Road, from SC 707 near Socastee",
    p: [`Resale houses, at a middle price of about ${money(MID("Myrtle Beach Golf and Yacht Club"))} last year.`,
      "Outside USDA's area, so a USDA loan cannot be used here. An FHA or VA loan can, and on either the seller can pay your closing costs."] },
];
const HOODS_HTML = `<ul class="c3-ft-hoods" role="list">` + HOODS.map((o) => `<li><h3>${h.a(`${AFF}#${o.id}`, o.name)}</h3><span class="w">${o.where}</span>`
  + `<p>${o.p.join(" ")}</p>` + G.homes(o.id, o.name) + `</li>`).join("") + `</ul>`;
const MORE = ["Cypress Ridge", "Tupelo Park", "Warner Crossing", "Andalusia", "Kingston Oaks", "Meadows Edge", "Spring Grove"];
must(MORE.every((m) => S(m) && S(m).under_300k >= 17 && S(m).new_under_300k / S(m).under_300k > 0.9), "row 44 (other neighborhoods)");

/* ---------------------------------------------------------------------------- */
/* Section 4: condo or house (rows 5, 6, 9, 21 to 24).                           */

const pctTo = (a, b) => Math.round(a / b * 100);
must(pctTo(FL.condo_under_300k.in_sfha, FL.condo_under_300k.placed) === 17 && pctTo(FL.house_townhouse_under_300k.in_sfha, FL.house_townhouse_under_300k.placed) === 3, "row 9 (shares)");
must(pctTo(OOS.condo_under_300k.outside_sc, OOS.condo_under_300k.matched) === 52 && pctTo(OOS.house_townhouse_under_300k.outside_sc, OOS.house_townhouse_under_300k.matched) === 15, "row 24 (shares)");
must(Math.round(HSE.median_sqft / CND.median_sqft) === 2, "rows 5 and 6 (twice the floor space)");
const VS = [
  { ic: "town", name: "A condo", p: [
    "A condo is the lowest price into a home of your own here. The loan is the hard part: the building has to be approved for it. HUD, the federal housing department, lists only 9 condo communities in all of Horry County that are approved for FHA loans.",
    "About 1 in 6 condos that sold under $300,000 were in a high-risk flood zone, where the lender will require flood insurance. About half went to owners who get their tax bill in another state."] },
  { ic: "home", name: "A house", p: [
    "A house costs more, and the loan is simpler: there is no building to approve. The middle house listed at or under $300,000 has about twice the floor space of the middle condo, and a yard.",
    "Only about 3 in 100 houses and townhouses that sold under $300,000 were in a high-risk flood zone. About 1 in 7 went to owners whose tax bill goes to another state."] },
];
const CONDO_HOUSE = `<ul class="c3-ft-vs" role="list" aria-label="A condo or a house for a first home in Horry County">`
  + VS.map((c) => `<li class="c"><p class="hd"><span class="c3-ft-ic" aria-hidden="true">${icon(c.ic, { size: 22 })}</span>${c.name}</p>`
    + c.p.map((x) => `<p>${x}</p>`).join("") + `</li>`).join("") + `</ul>`;

const CHECKS = `<ul class="c3-ft-check" role="list" aria-label="What we check before you make an offer">`
  + `<li><span><strong>The building's loan approval.</strong> For a condo, we find out whether the building is approved for your loan before you offer.</span></li>`
  + `<li><span><strong>The HOA papers.</strong> We read the rules, the budget, the money saved for repairs and the financial statements, so a fee rise or a one-time repair bill is no surprise.</span></li>`
  + `<li><span><strong>The flood zone.</strong> We look up every home you offer on, so you know whether the lender will require flood insurance.</span></li>`
  + `<li><span><strong>The insurance quote.</strong> If you buy with us, we get you one before you make an offer on a house.</span></li>`
  + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* Section 5: the yearly cost besides the loan (rows 31 to 37, 41).              */

const COST_TABLE = h.table(["Cost besides the loan", "What to plan for"], [
  ["Property tax on your own home, after you file", `About ${money(TAX4)} a year on a ${money(PRICE)} house`],
  ["Property tax if you do not file", `About ${money(TAX6)} a year on the same house`],
  ["Home insurance on a house", "About $2,000 a year in the middle; half of owners pay $1,300 to $3,000"],
  ["A condo owner's own insurance", "About $800 a year; the condo fee may also pay the building's insurance"],
  ["Electric, one household's summer bill", "About $130 a month"],
  ["Water, the same household", "About $50 a month"],
]);
const COST_NOTE = `<p class="c3-ft-note">Tax: county tax outside the cities, on the county's value, before special district and stormwater fees. Insurance: what Horry County owners who live in their home told the Census they paid in 2024 for fire, hazard and flood insurance, outside the Loris area. Electric and water: one of our team's own bills, on a 1,400 square foot two-story house; one household, not an average.</p>`;

/* ---------------------------------------------------------------------------- */
/* Section 6: who qualifies (rows 10, 11, 18, 25, 26, 42).                       */

const QUALIFY = [
  { ic: "key", k: "Have you owned a home before?", d: "SC Housing's main program in Horry County does not ask whether you owned a home in the past. It asks only that you own no other property, or a share of one, on the day the loan closes. Bare land is allowed. The IRA rule above is different: no main home in the last two years." },
  { ic: "tax", k: "Your credit score", d: "SC Housing needs at least a 640 credit score. FHA needs 500, and 580 for its smallest down payment." },
  { ic: "dollar", k: "Your income, for SC Housing", d: "In Horry County, SC Housing's household income limit is about $115,000 a year for one or two people and about $134,000 for three or more. The home's price can be up to $450,000." },
  { ic: "calendar", k: "Living in it", d: "On an FHA loan, one buyer moves in within 60 days of closing and plans to stay at least a year." },
];

/* ---------------------------------------------------------------------------- */
/* Section 7: the steps (rows 11, 28, 30, 32, 34, 38, 39, 40).                   */

const STEPS = `<ol class="c3-ft-steps">`
  + `<li><strong>Get pre-approved by a lender.</strong>The lender checks your credit and income and gives you a price to shop under. When an SC Housing program fits, a Chapter3 agent connects you with an SC Housing approved lender.</li>`
  + `<li><strong>Choose a home.</strong>We send homes in your budget and run the checks above on each one you like.</li>`
  + `<li><strong>Make the offer.</strong>You can ask the seller to pay your closing costs in the offer. If a real estate broker holds your earnest money, it stays in the broker's trust account until the sale closes. In an ordinary sale it is credited to you at closing.</li>`
  + `<li><strong>Inspect the house.</strong>A home inspector looks over the house for you.</li>`
  + `<li><strong>The appraisal.</strong>The lender's appraiser gives the home a value. Low appraisals are rare here. When one comes in low, our agents gather recent sales of similar homes and ask for the value to be looked at again.</li>`
  + `<li><strong>Close with an attorney.</strong>Every South Carolina home closing must be supervised by a South Carolina attorney.</li>`
  + `<li><strong>Move in, then file for the 4 percent rate.</strong>Apply to the county assessor by January 15 after the year you move in.</li>`
  + `</ol>`;

const CONTACT = "/contact/";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "First-Time Home Buyer in Myrtle Beach: Cash and $10,000 Help",
  description: "First-time home buyer in Myrtle Beach? What your cash to buy is made of, what lowers it, what $300,000 buys here, where starter houses sell, and the steps.",
  ogTitle: "First-time home buyer in Myrtle Beach: the cash it takes, what your budget buys, and where",
  crumb: "First-Time Home Buyer",
  eyebrow: "First-time buyers",
  h1: "Your first home in Myrtle Beach",
  h1em: "may take less cash than you think.",
  sub: "Your cash to buy in Myrtle Beach is the down payment plus the closing costs, and a first-time buyer can often bring less of each.",
  /* Hero chips (critic, round 2): three full rows at every width, so each part sits on one line, never
     one word a line; "VA and USDA loans", "FHA and VA" and
     "SC Housing" are held together with no-break spaces. */
  heroMedia: "<style>main#main .c3-glance li{line-height:1.4}main#main .c3-glance strong{font-size:1rem;font-weight:600}main#main .c3-glance span.t{font-size:1rem}"
    + "main#main .c3-glance{grid-template-columns:1fr;gap:.45rem;max-width:460px}main#main .c3-glance li{flex-direction:row;text-align:left;justify-content:flex-start;gap:.6rem;padding:.5rem .7rem}"
    /* Light fix, triage 2026-11-08: the italic line at about half the H1's size, on its own line (the approved look,
       Blog-Brain batches/2026-11-a/hoa-documents/DESIGN.md). */
    + "@media (min-width:700px){main#main .detail-h1{text-wrap:balance}}main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}"
    + "@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}</style>" + PK.glance([
    { icon: "key", label: "Often no down payment", text: "on VA and USDA loans" },
    { icon: "dollar", label: "Seller-paid closing costs", text: "on FHA and VA" },
    { icon: "tax", label: "$10,000 from SC Housing", text: "under its income limit" },
  ]),
  heroCta: { title: "Homes in your budget, checked for you", label: "Send me homes in my budget", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `Your down payment depends on your loan. Your lender gives you the figure when it pre-approves you, after checking your credit and income. Part of your cash is earnest money, the deposit you give with your offer. In an ordinary sale it is credited to you at closing.`,
    `A VA loan often needs no down payment. A USDA loan can cover the full price inside USDA's area, mostly around Conway, Loris, Aynor and Longs, for low- and moderate-income buyers. On an FHA loan, a credit score of 580 or more gets FHA's smallest down payment, and the seller can pay your closing costs. SC Housing adds $10,000 for buyers under its income limit.`,
  ],
  sections: [
    { h2: "How much cash do you need to buy a first home in Myrtle Beach?", toc: "Cash", id: "cash", html: (bg) =>
      CSS +
      h.p("The closing costs are the fees to make the loan and close the sale. Seven things can lower what you bring.") +
      cards(WAYS, "Seven ways the cash to buy a first home comes down") +
      h.p(`Our ${h.a("/buyers/closing-costs/", "closing cost calculator")} adds up each closing cost for your price.`) +
      h.cta("Ask the seller to pay your closing costs", "Tell us the loan you plan to use. When you find a home, we write that request into your offer.", "Have us ask the seller for you", CONTACT, bg) },

    { h2: "What does a first home cost in Myrtle Beach, and what do you get?", toc: "What it buys", id: "what-it-buys", html: () =>
      h.p("Almost half the homes sold in Horry County in the past year sold for under $300,000. Under $200,000, most were condos. From $250,000, most were houses.") +
      ph.css() +
      KIND_CHART +
      NOW_TILES +
      HOUSES_AERIAL() +
      h.h3("New houses often cost less than resales") +
      h.p(`In the middle, a new house from a builder sold for about ${money(near(NV.new.median, 5000))}, against about ${money(NV.resale.median)} for a resale.`) +
      h.p(`In our experience, most builders here offer incentives to buyers using FHA, VA and conventional loans. A conventional loan is one that no government agency backs. Our ${h.a("/buyers/new-construction/", "new construction guide")} covers buying from a builder, and our page on ${h.a("/buyers/new-construction/builders/", "the builders")} shows where each one builds.`) },

    { h2: "Where are the starter houses around Myrtle Beach?", toc: "Where", id: "where", html: () =>
      G.homesCss() +
      h.p(`Mostly inland. The most sold around Conway and Longs, then in Socastee, west of Myrtle Beach. In one of Conway's ZIP codes, about 7 in 10 houses and townhouses that sold went for under $300,000. In North Myrtle Beach it was about 1 in 12.`) +
      starterMap() +
      h.p("Four neighborhoods with many sales under $300,000 last year, and the loans that fit each. Three are new from a builder and inside USDA's area on USDA's own map. There, a buyer who qualifies can use a USDA loan with no down payment. None of the lots sold in the four were in a high-risk flood zone.") +
      HOODS_HTML +
      h.p(`Other neighborhoods had many sales under $300,000 last year, nearly all new from a builder. They are Cypress Ridge and Tupelo Park near Longs, Warner Crossing and Andalusia near Loris, Kingston Oaks and Meadows Edge in Conway, and Spring Grove near Aynor. Our guide to the ${h.a(AFF, "most affordable places to live")} says what life is like in each of the four, and has eight more, with prices and HOA fees.`) +
      G.offer("Conway and Longs", { label: "Get houses for sale in Conway and Longs", href: CONTACT }) },

    { h2: "Should your first home in Myrtle Beach be a condo or a house?", toc: "Condo or house", id: "condo-or-house", html: (bg) =>
      h.p("A house, if your budget reaches about $250,000 and you can live inland. Below that, most homes that sell are condos, and a condo can be a good first home once we have checked the building.") +
      CONDO_HOUSE +
      h.p("In our experience, condo buildings with a rental program usually do not meet the rules most conventional loans follow, because so many owners are investors. An FHA loan in a building that is not on HUD's list needs an approval for that one unit.") +
      h.p(`A condo also has a monthly fee to its homeowners association (HOA), and the chance of a special assessment, a one-time bill for repairs. Our guide to ${h.a("/hoa/special-assessments/", "special assessments")} explains them. Many houses have an HOA too; our ${h.a("/buyers/no-hoa-homes/", "guide to homes with no HOA")} lists places without one.`) +
      h.h3("What we check before you make an offer") +
      CHECKS +
      h.cta("Condos and houses in your budget", "Tell us your budget and the towns you like. An agent sends homes that fit.", "Send me condos and houses", CONTACT, bg) },

    { h2: "What will your first home cost each year besides the loan?", toc: "Yearly cost", id: "yearly-cost", html: () =>
      h.p(`Property tax is the yearly cost you can work out before you buy. On a ${money(PRICE)} house you live in, outside the cities, the county tax is about ${money(TAX4)} a year once you file for the 4 percent owner rate.`) +
      COST_TABLE + COST_NOTE +
      h.p(`The 4 percent rate means your home is taxed on 4 percent of its value. Any home you do not file for is taxed on 6 percent, and pays school operating tax too. Filing saves more than ${money(Math.floor((TAX6 - TAX4) / 100) * 100)} a year here, and it is not automatic: the last step below has the deadline. Our ${h.a("/buyers/property-taxes/", "property tax guide")} has every town's rate.`) +
      h.h3("Flood and wind") +
      h.p(`A lender must require flood insurance when the building is in a high-risk flood zone. A policy bought while the mortgage is made starts with no wait; otherwise there is a 30‑day wait. Before you close in that zone, check ${h.a("/buyers/coastal-insurance/", "what flood insurance costs here")}.`) +
      h.p(`In Myrtle Beach, homes east of the U.S. 17 Bypass are in the state's coastal wind area, where insurers may leave wind and hail out of a homeowners policy. The insurance figures above include flood and wind policies where owners have them. Your own quote depends on the house. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} explains the policies, and our ${h.a("/buyers/cost-to-own/", "cost to own guide")} adds up a year.`) },

    { h2: "Do you qualify as a first-time home buyer in South Carolina?", toc: "Qualify", id: "qualify", html: (bg) =>
      h.p("These are the lines that decide whether the help above fits you.") +
      cards(QUALIFY, "Who qualifies as a first-time home buyer in Horry County") +
      h.p(`Is there a federal first-time buyer tax credit? Not yet. ${h.a("/buyers/programs/", "The SC Housing programs")} are the help you can use now.`) +
      h.cta("Could SC Housing's help fit you?", "Tell us your household size and your income. When an SC Housing program fits, an agent connects you with an SC Housing approved lender.", "Have us connect you to an SC Housing lender", CONTACT, bg) },

    { h2: "What are the steps to buy your first home in South Carolina?", toc: "Steps", id: "steps", html: () =>
      STEPS +
      h.p(`Our guide to ${h.a("/buyers/buying-in-myrtle-beach/", "buying a home in Myrtle Beach")} covers the purchase in more detail, and our ${h.a("/buyers/common-mistakes/", "common buyer mistakes")} page lists what goes wrong. Moving from another state? Our ${h.a("/buyers/relocating/", "relocation guide")} covers the move.`) },
  ],
  faqTitle: "First-time home buyer questions",
  /* Round 2 (owner's eye: "Say a fact once"): each answer is something the body does not say. */
  faq: [
    { q: "Is there a first-time home buyer tax credit in South Carolina?", a: "SC Housing no longer offers its tax credit certificate. The tax break an owner gets here is the 4 percent rate on the home you live in, which needs an application to the county assessor." },
    { q: "Is there a homestead exemption for first-time buyers in Horry County?", a: "Not for being a first-time buyer. In South Carolina the homestead exemption is for owners 65 or older who have lived in the state a year, or who are disabled or blind. It exempts the first $50,000 of the home's value." },
    { q: "Is there help if I earn more than SC Housing's limit?", a: "Palmetto Home Advantage, another SC Housing program, has an income limit of $140,000 in every county, counted on the buyers' own income, not the whole household. It is open to first-time and repeat buyers. Its help is forgiven after 10 years, and repaid in full on a sale, refinance or move before then." },
    { q: "What is the FHA loan limit in Horry County?", a: "FHA's 2026 loan limit for a one-unit home in Horry County is about $541,000. That is well above HUD's own estimate of the area's middle sale price, $340,000." },
  ],
  sources: [
    { name: "Horry County deed index", href: "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType" },
    { name: "HUD Handbook 4000.1", href: "https://www.hud.gov/sites/default/files/Housing/documents/40001-hsgh-Update-18.pdf" },
    { name: "FHA loan limits", href: "https://entp.hud.gov/idapp/html/hicostlook.cfm" },
    { name: "VA purchase loans", href: "https://www.va.gov/housing-assistance/home-loans/loan-types/purchase-loan/" },
    { name: "7 CFR 3555", href: "https://www.ecfr.gov/current/title-7/subtitle-B/chapter-XXXV/part-3555" },
    { name: "IRS Publication 590-B", href: "https://www.irs.gov/publications/p590b" },
    { name: "SC Code 12-43", href: "https://www.scstatehouse.gov/code/t12c043.php" },
    { name: "Horry County 2026 tax levy", href: "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf" },
    { name: "FloodSmart", href: "https://www.floodsmart.gov/get-insured/buy-a-policy" },
    { name: "USDA eligibility map", href: "https://eligibility.sc.egov.usda.gov/eligibility/welcomeAction.do" },
    { name: "Census microdata", href: "https://www2.census.gov/programs-surveys/acs/data/pums/2024/1-Year/" },
  ],
  sourcesNote: "Sales: Horry County deeds of $10,000 or more, October 2025 to September 2026, with the county's maps. Listings: Chapter3's MLS count. Insurance: Census microdata for Horry County outside the Loris area. Chapter3 Realty is not a lender. Not loan or tax advice.",
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Find a first home that fits your budget", p: "Tell us your budget and when you want to move. An agent starts the search with you.", label: "Start my home search", href: CONTACT },
  keywords: "first time home buyer Myrtle Beach, first time home buyer South Carolina requirements, how much do I need to buy a house in Myrtle Beach, median home price Myrtle Beach, starter homes Myrtle Beach, condo or house Myrtle Beach, FHA loan limit Horry County",
  about: "Buying a first home in Myrtle Beach and Horry County, South Carolina",
});
