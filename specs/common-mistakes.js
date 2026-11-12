/* /buyers/common-mistakes/ - the Myrtle Beach home buyer mistakes that cost the most: ten mistakes, each
 * with what it costs on a house the county values at $350,000, what makes it different here, and when our
 * agents check for it.
 *
 * Batch 2026-11-a, Lane U. Version 1. The live page was old-template HTML with no spec; this spec replaces it.
 * Reader, must-answers and plan: Blog-Brain batches/2026-11-a/buyers-common-mistakes/ (must-answer.md, PLAN.md).
 * Facts: facts.md there, VERIFIED and CORRECTED rows only, at their corrected values (VERIFY.md,
 * buyers-common-mistakes-struck.json). Row 27 (the contract's due diligence rules) is STRUCK: the page names
 * the due diligence period only as the time we line up the checks, and states no contract rule.
 * Every chart, tile and count is built from data/2026-11-a/buyers-common-mistakes/ (never typed):
 *   examples.json          rows 12, 18, 30 (the $350,000 tax examples, the seller's bill, one flood)
 *   parcels-findings.json  rows 13, 14 (houses still taxed at 6 percent with the bill mailed to the house)
 *   fema-findings.json     row 28 (FEMA flood policy cost by zone);  claims-findings.json  rows 29, 30
 *   flood-tag-findings.json row 31 (houses and condos for sale in the high-risk zone, pulled on build day)
 *   listings-counts.json   row 32 (septic and well by mailing town, pulled on build day)
 *   condo-age.json         row 34 (condos for sale in buildings built 1996 or earlier, pulled on build day)
 *   photos.json            three public-domain photos reused from licensed records (see each record's reused_from)
 *   hoa-counts.json        fixer row F4 (houses for sale with an HOA fee, pulled 2026-11-02 in review round 1)
 *   ../../2026-10-d/hoa-reserves/condo-ages.json  RES 27, carried (the listed condo HOA fee by building age)
 * Kept from the live page: the H1 and title the owner liked, the idea that our agents find these before you
 * close (now said in each entry), the buyer-representation point (corrected, rows 36 and 37), the links to
 * the first-time buyer guide and the condo-in-litigation page. Cut: the three stories (not in stories.json;
 * PROPOSED.md 1 asks the owner), the unsourced cost figures (facts.md "Live-page claims cut"), the broken
 * search box, the two mid-page navy bands. Stories used as recorded: ny-buyer-rules-fit (rules-fit version,
 * no quotation marks, no name), hoa-rental-bans-filtered (no "massive value add") and dscr-zillow-links (the
 * other agent not named or described).
 * Review round 1 (REVIEW-1.md): stage folded into each ranked card and the stage list cut; wind added as
 * entry 5 (fixer rows F1, F3); the job-change entry moved to the FAQ; the HOA entry rebuilt on local facts;
 * service lines say "we can" until the owner answers question 2; one offer label; FAQ holds only new facts.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h } = require("../tools/mkpage.js");

const BB = [path.join(__dirname, "..", "tools", "blog-brain-2026-11-a"), path.join(__dirname, "..", "tools", "blog-brain-2026-10-b"), process.env.BLOG_BRAIN,
  path.join(__dirname, "..", "..", ".."), "/home/user/Blog-Brain"].filter(Boolean)
  .find((d) => fs.existsSync(path.join(d, "tools", "page-kit.js")));
if (!BB) throw new Error("Blog-Brain tools not found (tools/page-kit.js)");
const PK = require(path.join(BB, "tools", "page-kit.js"));
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));

const DATA = path.join(__dirname, "..", "data", "2026-11-a", "buyers-common-mistakes");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const EX = read("examples.json"), PARCELS = read("parcels-findings.json"), FEMA = read("fema-findings.json");
const CLAIMS = read("claims-findings.json"), TAG = read("flood-tag-findings.json"), LIST = read("listings-counts.json"), CONDO = read("condo-age.json");
const HOA = read("hoa-counts.json");                                                        // fixer row F4
const AGES = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-10-d", "hoa-reserves", "condo-ages.json"), "utf8"));   // RES 27, carried

const kit = PK.create({ h, theme: "glass", photos: read("photos.json").photos,
  mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" });
const { glance } = kit;
const ph = kit.photoSet({ aerialWidth: "760px" });

const SELF = "/buyers/common-mistakes/";
const r10 = (v) => "$" + (Math.round(v / 10) * 10).toLocaleString("en-US");
const r100 = (v) => "$" + (Math.round(v / 100) * 100).toLocaleString("en-US");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
/* "about 1 in N" from a share, N rounded to a whole number. */
const oneIn = (a, b) => `1 in ${Math.round(b / a)}`;
const nw = (t) => `<span style="white-space:nowrap">${t}</span>`;

/* ---------------------------------------------------------------------------- */
/* Data (rows named in the header)                                                 */

const PRICE = EX.price;
if (PRICE !== 350000) throw new Error("examples.json price changed: rewrite the $350,000 copy");
const PRICE_T = "$" + PRICE.toLocaleString("en-US");
const CO = EX.tax["Unincorporated Horry County"], CITY = EX.tax["City of Myrtle Beach"];   // row 12
const SB = EX.seller_bill_example;                                                         // row 18
const FL = EX.flood;                                                                       // rows 28 to 30
if (FL.median_paid_house_outside_high_risk_since_2015 !== CLAIMS.by.since_2015_single_family.outside.median_building_payment) throw new Error("examples.json and claims-findings.json disagree");
if (FL.median_policy_house_lived_in_X !== FEMA.groups.ratedFloodZone["X (moderate or low risk) | lived in"].median) throw new Error("examples.json and fema-findings.json disagree");
const P24 = PARCELS.periods["2024-2025"], P18 = PARCELS.periods["2018-2019"];             // row 13
const S24 = [P24["2024_mailed_to_house_6%"], P24["2024_mailed_to_house"]];
const S25 = [P24["2025_mailed_to_house_6%"], P24["2025_mailed_to_house"]];
const S18 = [P18["mailed_to_house_6%"], P18["mailed_to_house"]];
if (oneIn(...S24) !== "1 in 7" || oneIn(...S25) !== "1 in 5" || oneIn(...S18) !== "1 in 17") throw new Error("parcel shares moved: rewrite the 1 in 7, 1 in 5 and 1 in 17 lines");
const HOUSE = TAG.by_type.house;                                                             // row 31
if (Math.round(HOUSE.in_sfha_not_tagged / HOUSE.in_sfha * 10) !== 8) throw new Error("flood tag share moved off 8 in 10: rewrite");
const cnt = (label) => { const r = LIST.rows.find((x) => x.label === label); if (!r || !Number.isFinite(r.total)) throw new Error(`listings-counts.json: no ${label}`); return r.total; };
const SEPTIC_ALL = [cnt("house septic"), cnt("all house")], WELL = cnt("house well_water");  // row 32
const TOWNS = ["Aynor", "Loris", "Conway", "Myrtle Beach", "North Myrtle Beach", "Surfside Beach"].map((t) => ({ town: t, septic: cnt(`house septic in ${t}`), all: cnt(`house in ${t}`) }));
const BUILD_YEAR = new Date().getFullYear();
const CONDO_AGE = BUILD_YEAR - CONDO.built_through;                                         // row 34
const CONDO_SHARE = Math.round(CONDO.built_1996_or_earlier / CONDO.condos * 100);
if (CONDO_SHARE < 51 || CONDO_SHARE > 59) throw new Error("condo age share moved: rewrite 'more than half'");

/* ---------------------------------------------------------------------------- */
/* Page CSS: the ranked cards, the number on each entry's heading, the tiles, the "we do" box, the stacked
   bars, the zone cards and the example box. All scoped to main#main; text at reading size. */

const ENTRY_IDS = ["six-percent-tax", "seller-tax-bill", "flood-outside-the-zone", "flood-zone-listing", "wind-insurance",
  "condo-repair-savings", "weekly-rentals", "inspection", "hoa-rules", "your-agent"];
const M = "main#main";
const GLASS = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.85);box-shadow:inset 0 1px 0 rgba(255,255,255,.95),0 1px 2px rgba(28,32,40,.05),0 12px 30px -18px rgba(28,32,40,.32)";
const CHIP = "flex:none;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;color:var(--g-ink,#8a5226);background:rgba(196,120,58,.13)";
/* The end offer band: the website's listing notice follows it inside <main>, so glass.js's top-bar rules
   reach it (retirees NEEDS.md 1, not yet fixed in glass.js); this puts the dark panel back (NEEDS.md 4). */
const BAND_END = 'main#main>section[style^="background:var(--navy)"]:has(>.wrap>h2)';
const PAGE_CSS = "<style>main#main .c3-glance li{line-height:1.4}"
  /* The ranked cards, each with the stage we check it at (review round 1: the stage list is folded in here). */
  + `${M} .c3m-rank{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;grid-template-columns:1fr;gap:.6rem;max-width:920px}`
  + `@media (min-width:760px){${M} .c3m-rank{grid-template-columns:1fr 1fr}}`
  + `${M} .c3m-rank li{margin:0;padding:.8rem 1rem .85rem .85rem;border-radius:18px;${GLASS};display:grid;grid-template-columns:2.2rem minmax(0,1fr);column-gap:.75rem;align-items:start}`
  + `${M} .c3m-rank .n{${CHIP};width:2.2rem;height:2.2rem;font-family:var(--serif);font-weight:600;font-size:1.05rem}`
  + `${M} .c3m-rank a{color:var(--navy);font-weight:600;font-size:var(--read,1.0625rem);line-height:1.35;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.18em}`
  + `${M} .c3m-rank .c{display:block;margin-top:.2rem;color:var(--muted);font-size:1rem;line-height:1.45}`
  + `${M} .c3m-rank .c strong{color:var(--g-ink,#8a5226);font-weight:600}`
  + `${M} .c3m-rank .w{display:block;margin-top:.25rem;color:var(--navy);font-size:.95rem;line-height:1.4}${M} .c3m-rank .w b{font-weight:600}`
  /* The number on each entry's heading (a CSS counter is not read as text, so the heading stays the question). */
  + ENTRY_IDS.map((id, i) => `${M} section#${id} h2::before{content:"${i + 1}";${CHIP};width:2.3rem;height:2.3rem;font-size:1.1rem;font-weight:600;margin:0 .6rem .2rem 0;vertical-align:.18em}`).join("")
  /* Number tiles. */
  + `${M} .c3m-stat{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(13rem,100%),1fr));gap:.65rem;max-width:760px;margin:1.3rem 0 .4rem}`
  + `${M} .c3m-stat>div{padding:.9rem 1rem;border-radius:18px;${GLASS}}`
  + `${M} .c3m-stat .big{display:block;font-family:var(--serif);font-size:1.9rem;line-height:1.1;color:var(--g-ink,#8a5226);font-weight:600;margin-bottom:.3rem}`
  + `${M} .c3m-stat .t{display:block;color:var(--navy);font-size:1rem;line-height:1.45}`
  + `${M} .c3m-stat3{grid-template-columns:repeat(3,minmax(0,1fr))}@media (max-width:520px){${M} .c3m-stat3{gap:.45rem}${M} .c3m-stat3>div{padding:.7rem .65rem}${M} .c3m-stat3 .big{font-size:1.3rem}}`
  + `${M} .c3m-tnote{color:var(--muted);font-size:.95rem;line-height:1.55;max-width:760px;margin:.2rem 0 1.4rem}`
  /* What we do. */
  + `${M} .c3m-callout{display:flex;gap:.75rem;align-items:flex-start;max-width:720px;margin:1.3rem 0 1rem;padding:.85rem 1.05rem;border-radius:16px;${GLASS}}`
  + `${M} .c3m-callout .i{${CHIP};width:1.8rem;height:1.8rem;margin-top:.15rem}`
  + `${M} .c3m-callout p{margin:0;color:var(--navy);line-height:1.6;font-size:var(--read,1.0625rem)}`
  /* The stacked bars (row 31). */
  + `${M} .c3m-stack{max-width:760px;margin:1.4rem 0 1.6rem;padding:1.1rem 1.15rem 1rem!important;box-sizing:border-box}`
  + `${M} .c3m-stack .cap{display:block;color:var(--navy);font-weight:600;font-size:1.1em;line-height:1.35;margin:0 0 .9rem}`
  + `${M} .c3m-stack .row{margin:0 0 .95rem}${M} .c3m-stack .lab{display:block;color:var(--navy);font-weight:600;line-height:1.35;margin-bottom:.35rem}`
  + `${M} .c3m-stack .bar{display:flex;height:1.05rem;border-radius:999px;overflow:hidden;background:rgba(92,107,120,.18)}`
  + `${M} .c3m-stack .bar .no{background:linear-gradient(90deg,#c4783a,#d4894a)}${M} .c3m-stack .bar .yes{background:#5c6b78}`
  + `${M} .c3m-stack .key{display:flex;flex-wrap:wrap;gap:.2rem 1.1rem;margin-top:.4rem;color:var(--muted);font-size:1rem;line-height:1.45}`
  + `${M} .c3m-stack .key b{color:var(--navy);font-weight:600}`
  + `${M} .c3m-stack .sw{display:inline-block;width:.8rem;height:.8rem;border-radius:3px;margin-right:.35rem;vertical-align:-.05em}`
  + `${M} .c3m-stack figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.3rem 0 0;padding:0!important}`
  /* Cards with a heading line (applying, zones, the agent's two stages). */
  + `${M} .c3m-cards{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(14rem,100%),1fr));gap:.65rem;max-width:820px}`
  + `${M} .c3m-cards li{margin:0;padding:.9rem 1rem;border-radius:18px;${GLASS}}`
  + `${M} .c3m-cards .h{display:flex;align-items:center;gap:.55rem;margin:0 0 .35rem;color:var(--navy);font-weight:600;font-size:var(--read,1.0625rem);line-height:1.35}`
  + `${M} .c3m-cards .h .i{${CHIP};width:2rem;height:2rem}`
  + `${M} .c3m-cards p{margin:0;color:var(--muted);line-height:1.55;font-size:1rem}`
  + `${M} .c3m-ex{max-width:720px;margin:1.3rem 0 1.4rem;padding:1rem 1.15rem;border-radius:18px;${GLASS}}`
  + `${M} .c3m-ex .k{display:inline-block;font-family:var(--sans);font-size:.85rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--g-ink,#8a5226);margin-bottom:.35rem}`
  + `${M} .c3m-ex p{margin:0 0 .5rem;color:var(--navy);line-height:1.6}${M} .c3m-ex p:last-child{margin-bottom:0}`
  + `@media (prefers-reduced-transparency:reduce){${M} .c3m-rank li,${M} .c3m-stat>div,${M} .c3m-callout,${M} .c3m-cards li,${M} .c3m-ex{background:#fbf8f3}}`
  /* The end offer band. */
  + `${BAND_END}{padding:.9rem 0 1.4rem!important}${BAND_END}>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important}`
  + `${BAND_END}>.wrap>h2{color:var(--ivory)!important}${BAND_END}>.wrap>p{color:rgba(244,239,232,.82)!important}`
  + `@media (max-width:699px){${BAND_END}>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}${BAND_END}>.wrap>h2{font-size:1.5rem!important;line-height:1.25}}`
  /* The top homes strip's search box at 320 px ran 40 px past the column (critic, round 1): kept inside it,
     as the retirees spec does (NEEDS.md 7). */
  + "main#main .hx-feed .hx-fb,main#main .hx-feed .hx-fb-ai,main#main .hx-feed .hx-fb-q{min-width:0!important;max-width:100%!important;box-sizing:border-box}"
  /* The shared header at 1000 to 1120 px: the phone number ran 5 px past a 1024 px window (critic, round 1;
     NEEDS.md 7). The icon and its spoken label stay; only the digits hide in that band. */
  + "@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Blocks                                                                          */

const CHECK = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7"/></svg>';
const we = (text) => `<div class="c3m-callout"><span class="i" aria-hidden="true">${CHECK}</span><p>${text}</p></div>`;
const tiles3 = (items) => `<div class="c3m-stat c3m-stat3">${items.map((t) => `<div><span class="big">${t.big}</span><span class="t">${t.text}</span></div>`).join("")}</div>`;
const tiles = (items) => `<div class="c3m-stat">${items.map((t) => `<div><span class="big">${t.big}</span><span class="t">${t.text}</span></div>`).join("")}</div>`;
const cards = (items, label) => `<ul class="c3m-cards" role="list" aria-label="${label}">${items.map((c) => `<li><p class="h"><span class="i" aria-hidden="true">${icon(c.icon, { size: 20 })}</span><span>${c.head}</span></p><p>${c.text}</p></li>`).join("")}</ul>`;
/* Room for the value label after the longest bar: the bars stop at 3/4 of the track (critic, round 1:
   "about $4,220" ended 2 px from the card's edge at 390 px). */
const ROOM = (rows) => Math.max(...rows.map((r) => r.value)) / 0.75;

/* The ranked list: ten mistakes, each linked to its entry, with what it costs and when we check for it.
   The costs are the entries' own figures. */
const OFFER = "Before you offer", ACCEPTED = "After the seller accepts your offer", TOUR = "Before you tour a home";
const RANK = [
  { id: ENTRY_IDS[0], t: "Paying the 6 percent tax on a home you live in", c: `<strong>About ${r10(CO.gap_per_year)} a year</strong> more than the 4 percent rate`, w: OFFER },
  { id: ENTRY_IDS[1], t: "Budgeting from the seller's tax bill", c: `<strong>About ${r100(SB.buyer_6pct_over_seller)} a year</strong> over the seller's bill, for a second home`, w: OFFER },
  { id: ENTRY_IDS[2], t: "No flood insurance outside the high-risk zone", c: `<strong>About ${Math.round(FL.years_of_X_cover_per_median_outside_claim)} years</strong> of flood insurance, paid out in one flood`, w: ACCEPTED },
  { id: ENTRY_IDS[3], t: "A flood zone the listing does not mention", c: `<strong>About ${r10(FL.median_policy_house_lived_in_A)} a year</strong> of flood insurance the loan requires`, w: OFFER },
  { id: ENTRY_IDS[4], t: "A homeowners policy that leaves out wind", c: "<strong>The wind damage</strong> the policy does not pay", w: OFFER },
  { id: ENTRY_IDS[5], t: "A condo building short on repair savings", c: "<strong>About $4,750 a unit</strong> in one bill, in our example", w: OFFER },
  { id: ENTRY_IDS[6], t: "Weekly rentals in a Myrtle Beach residential zone", c: "<strong>The rental income</strong>, and fines of up to $500 each time", w: OFFER },
  { id: ENTRY_IDS[7], t: "Skipping the inspection to win the house", c: "<strong>Any repair</strong> the inspection would have found", w: ACCEPTED },
  { id: ENTRY_IDS[8], t: "HOA rules that do not fit how you live", c: "<strong>The boat, the golf cart or the rental</strong> you bought for", w: OFFER },
  { id: ENTRY_IDS[9], t: "Thinking the agent you called works for you", c: "<strong>Advice</strong> on your side of the deal", w: TOUR },
];
const LABEL = RANK.map((r) => r.t);   /* each entry's data-toc label, so the list matches its headings (score H14) */
const RANKED = `<ol class="c3m-rank" role="list">${RANK.map((r, i) => `<li><span class="n" aria-hidden="true">${i + 1}</span><span><a href="#${r.id}">${r.t}</a><span class="c">${r.c}</span><span class="w"><b>We check:</b> ${r.w.charAt(0).toLowerCase() + r.w.slice(1)}</span></span></li>`).join("")}</ol>`;

/* Entry 1: tax a year on the $350,000 house outside the city limits, at the two rates (row 12). */
const TAX_ROWS = [
  { name: "Your home, after you apply", value: CO["4pct"], valueText: `about ${r10(CO["4pct"])}`, feature: "4 percent rate" },
  { name: "The same house at 6 percent", value: CO["6pct"], valueText: `about ${r10(CO["6pct"])}`, reference: true },
];
const TAX_CHART = G.bars(TAX_ROWS, { max: ROOM(TAX_ROWS), caption: `Property tax a year on a house the county values at ${PRICE_T}, outside the city limits`, nameLabel: "How the house is taxed", featureLabel: "rate", valueLabel: "tax a year",
  note: "Horry County's 2026 tax rates. The county's stormwater fee and small special districts are left out." });
const TIMES = Math.round(CO["6pct"] / CO["4pct"]);
if (TIMES !== 3) throw new Error("tax ratio moved off 3 times: rewrite the hero tile");

/* Entry 1: houses still at 6 percent, by the year bought (row 13). */
const SHARE_TILES = tiles3([
  { big: oneIn(...S25), text: "bought in 2025" },
  { big: oneIn(...S24), text: "bought in 2024" },
  { big: oneIn(...S18), text: "bought in 2018 or 2019, not sold since" },
]) + `<p class="c3m-tnote">The share, rounded, of houses owned by a person who gets the tax bill at that same house, still taxed at 6 percent. The newest buyers can still apply for this year.</p>`;

/* Entry 2: the labelled example (row 18). */
const SELLER_ROWS = [
  { name: "The seller's bill", value: SB.seller_bill_4pct, valueText: `about ${r100(SB.seller_bill_4pct)}`, feature: "their home for many years" },
  { name: "Your bill, as your home", value: SB.buyer_bill_4pct, valueText: `about ${r10(SB.buyer_bill_4pct)}`, feature: "after you apply" },
  { name: "Your bill, as a second home", value: SB.buyer_bill_6pct, valueText: `about ${r10(SB.buyer_bill_6pct)}`, feature: "6 percent rate", reference: true },
];
const SELLER_CHART = G.bars(SELLER_ROWS, { max: ROOM(SELLER_ROWS), caption: `Example: tax a year on one house the county values at ${PRICE_T}`, nameLabel: "Whose bill", featureLabel: "why", valueLabel: "tax a year",
  note: "Outside the city limits, at the county's 2026 rates. The seller's figure taxes about 63 percent of the value, the average share for homes whose last deed was in 2005 to 2014." });

/* Entry 3: one flood outside the zone and inside it (rows 29, 30). */
const FLOOD_TILES = tiles([
  { big: r100(FL.median_paid_house_outside_high_risk_since_2015), text: "FEMA's middle repair payment when an insured house outside the high-risk zone flooded" },
  { big: r100(FL.median_paid_house_high_risk_since_2015), text: "the same payment for a house inside the zone" },
]);

/* Entry 4: what a FEMA flood policy costs a year (row 28). Zone V is left out: 141 policies, and a different
   middle on FEMA's current-zone field (verifier, row 28). */
const FLOOD_TABLE = h.table(["House with a FEMA flood policy", "Middle cost a year"], [
  ["Outside the zone, lived in", nw(`about ${r10(FL.median_policy_house_lived_in_X)}`)],
  ["In the zone, lived in", nw(`about ${r10(FL.median_policy_house_lived_in_A)}`)],
  ["In the zone, not lived in", nw(`about ${r10(FL.median_policy_house_not_lived_in_A)}`)],
]);

/* Entry 4: houses for sale in the high-risk zone (condo row cut in review round 2), and how many listings say so (row 31). */
const stackRow = (label, t) => {
  const no = t.in_sfha_not_tagged, yes = t.in_sfha_tagged, all = t.in_sfha;
  if (no + yes !== all) throw new Error("flood-tag-findings.json: the parts do not add up");
  return `<div class="row"><span class="lab">${label}: ${n0(all)} for sale in the zone</span>`
    + `<div class="bar" aria-hidden="true"><span class="no" style="width:${(no / all * 100).toFixed(1)}%"></span><span class="yes" style="width:${(yes / all * 100).toFixed(1)}%"></span></div>`
    + `<div class="key"><span><span class="sw" style="background:#c4783a" aria-hidden="true"></span><b>${n0(no)}</b> do not say flood zone</span><span><span class="sw" style="background:#5c6b78" aria-hidden="true"></span><b>${n0(yes)}</b> do</span></div></div>`;
};
const STACK = `<figure class="c3m-stack"><span class="cap">Houses for sale in FEMA's high-risk flood zone, and whether the listing's feature list says so</span>`
  + stackRow("Houses", HOUSE)
  + `<figcaption>Houses for sale in Horry County on the day this page was built, each tested against the county's copy of FEMA's flood map. The agent's own remarks may still mention it.</figcaption></figure>`;

/* Entry 1: applying (rows 5, 6, 8). The refund (row 10) is in the FAQ, with its time limit. */
const APPLY_CARDS = cards([
  { icon: "home", head: "You apply once", text: "Unless the ownership or who lives there changes." },
  { icon: "calendar", head: "Move in partway through a year", text: "You get the 4 percent rate for that whole year." },
  { icon: "tax", head: "Aim for the end of May", text: "Apply by then, and the bill the county mails later that year comes at 4 percent. If you miss May, you can still apply for that year until its bill is due, usually January 15 of the next year." },
], "Applying for the 4 percent rate");

/* Entry 7: the city's rule in three cards (row 23). */
const ZONE_CARDS = cards([
  { icon: "home", head: "Zoning districts starting with R", text: "No rentals under 90 days." },
  { icon: "key", head: "The RMV district", text: "The one R district where rentals under 90 days are allowed." },
  { icon: "town", head: "24 houses", text: "In the whole city, only 24 houses in the traditional residential zones keep an older right to rent for under 90 days." },
], "The City of Myrtle Beach rule on rentals under 90 days");

/* Entry 8: septic tanks by mailing town (row 32), from the highest share down. */
const SEPTIC_CHART = G.bars(TOWNS.slice().sort((a, b) => b.septic / b.all - a.septic / a.all).map((t) => ({ name: t.town, value: t.septic / t.all, valueText: t.septic === 0 ? "none" : `about ${oneIn(t.septic, t.all)}`, feature: `${t.septic} of ${n0(t.all)} houses` })),
  { caption: "Houses for sale that list a septic tank, by mailing town", nameLabel: "Town", featureLabel: "houses with septic of houses for sale", valueLabel: "share",
    format: (v) => String(v), compact: true, phoneList: true,
    note: "Houses for sale on the MLS on the day this page was built, counted by the town in their mailing address, which can include land outside the town limits. Some listings do not say, so the true counts may be higher." });

/* Entry 10: before and after you sign (row 36; 40-57-30(43), fixer row F2). */
const AGENT_CARDS = cards([
  { icon: "cards", head: "Before you both sign", text: "You are the firm's customer. Under the law, the firm can help the sale along without representing you or the seller." },
  { icon: "key", head: "After you both sign an agreement", text: "The firm is your agent, on the terms the agreement states, including its pay." },
], "Who the firm works for, before and after you sign");

/* Photos (photos.json; each looked at full size by the writer). */
const PH_FLOOD = ph.aerial("conway-florence-floodwater-street", "Floodwater on a street of houses in the Conway area after Hurricane Florence.");
const PH_TOWERS = ph.aerial("myrtle-beach-oceanfront-towers-2011", "Oceanfront towers in Myrtle Beach. Roofs, balconies and pools like these are what a condo's repair savings pay for.");
const PH_BEACH = ph.aerial("houses-and-towers-from-the-ocean", "Houses and condo towers side by side in Myrtle Beach. Each lot has its own zoning district, and the district decides whether it can be rented for under 90 days.");
ph.share("houses-and-towers-from-the-ocean");

/* Sources a reader can open. */
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const T12_54 = "https://www.scstatehouse.gov/code/t12c054.php";
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const T38_75 = "https://www.scstatehouse.gov/code/t38c075.php";
const T40_57 = "https://www.scstatehouse.gov/code/t40c057.php";
const CHECKLIST = "https://www.horrycountysc.gov/media/oy0hxkmu/spa-required-docs-4252023.pdf";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const NFIP = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2";
const USC4012A = "https://www.law.cornell.edu/uscode/text/42/4012a";
const MB_ZONING = "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php";
const NAR = "https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers";
const FANNIE = "https://selling-guide.fanniemae.com/sel/b3-3.1-04/verbal-verification-employment";
const FREDDIE = "https://guide.freddiemac.com/app/guide/bulletin/2026-C";
const AR = "https://www.reservestudy.com/wp-content/uploads/2026/05/2026-04-29-100000-Industry-Insights-Report-FINAL.pdf";

/* Entry 9: houses for sale with an HOA fee (fixer row F4, hoa-counts.json). */
const HOA_ALL = HOA.rows.find((r) => r.label === "all house").total, HOA_NONE = HOA.rows.find((r) => r.label === "house no HOA fee").total;
const HOA_SHARE = Math.round((HOA_ALL - HOA_NONE) / HOA_ALL * 10);
if (HOA_SHARE !== 7) throw new Error("hoa-counts.json: houses with a fee moved off 7 in 10: rewrite");
/* FAQ: the listed condo HOA fee by building age (RES 27, carried; data/2026-10-d/hoa-reserves/condo-ages.json). */
const feeBand = (b) => { const r = AGES.rows.find((x) => x.band === b); if (!r) throw new Error(`condo-ages.json: no ${b}`); return r.median_fee_month_within_5; };
const FEE_ALL = feeBand("all"), FEE_OLD = feeBand("built 1986 or earlier");

/* An offer box inside a section: h.cta's look (glass.js styles it). The first one also carries the phone as a
   second button (CTA-4). Owner, 2026-11-03: an offer after about every second section, each tied to the entry
   above it, and no two with the same words (CRAFT 3, STANDARD H5); this replaces review round 1's one label. */
const CTA_LABEL = "Have us check a house";
const ctaBox = (title, text, label, bg, phone) => `<div style="border-left:3px solid var(--brass);background:var(--${bg});padding:1.2rem 1.4rem;margin:1.8rem 0;max-width:720px"><p style="color:var(--navy);font-weight:600;margin-bottom:.4rem">${title}</p><p style="color:var(--muted);line-height:1.7;margin-bottom:.8rem">${text}</p>`
  + `<p style="display:flex;flex-wrap:wrap;gap:.6rem;margin:0"><a class="btn btn-brass" href="/contact/">${label}</a>${phone ? `<a class="btn btn-brass" href="tel:+18543332135">Call 854.333.2135</a>` : ""}</p></div>`;
const MID_CTA = (bg) => ctaBox("Found a house you like?", "We can find its flood zone on FEMA's map, get a flood insurance quote and price the tax at both rates, before you make an offer.", "Have us check a house's flood zone and tax", bg, true);

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "Myrtle Beach Buyer Mistakes That Cost the Most | Chapter3",
  description: `Ten Myrtle Beach home buyer mistakes and what each costs on a ${PRICE_T} house: the 6 percent tax, flood and wind insurance, the seller's bill and condo savings.`,
  ogTitle: "The Myrtle Beach buyer mistakes that cost the most",
  crumb: "Buyer Mistakes",
  eyebrow: "Before you buy",
  h1: "The Myrtle Beach buyer mistakes",
  h1em: "that cost the most.",
  sub: `The costliest mistake is paying the second-home 6 percent tax on a home you live in: about ${r10(CO.gap_per_year)} a year on a ${PRICE_T} house. Nine more follow, by cost.`,
  heroMedia: glance([
    { icon: "tax", label: "Your home taxed at 6 percent", text: `${TIMES} times the 4 percent bill` },
    { icon: "flood", label: "Houses for sale in the flood zone", text: "8 in 10 listings do not say so" },
    { icon: "storm", label: "One flood outside the zone", text: `${r100(FL.median_paid_house_outside_high_risk_since_2015)} paid` },
  ]),
  heroCta: { title: "Found a house? We can check it for these mistakes before you offer.", label: CTA_LABEL, href: "/contact/" },
  toc: false, /* the ranked list links to every entry and is the page's contents */
  author: "devin",
  shortAnswer: [
    `Of people who bought a house in Horry County in 2024 and have its tax bill mailed to that house, about ${oneIn(...S24)} are still taxed at 6 percent. That is the rate for second homes and rentals. It is the costliest mistake here, and it comes back every year until they apply for the 4 percent rate for the home they live in.`,
    "The seller's low tax bill, flood insurance and wind cover come next.",
  ],
  sections: [
    { h2: "What are the biggest mistakes when buying a house in Myrtle Beach?", toc: "The ten mistakes", id: "the-list", html: () =>
      PAGE_CSS + ph.css() +
      h.p(`Each one says what it costs and when we check for it, and links to its section. If this is your first home, read our ${h.a("/buyers/first-time-home-buyer-myrtle-beach/", "first-time buyer guide")} too.`) +
      RANKED },

    { h2: "Are you paying the 6 percent tax on a home you live in?", toc: LABEL[0], id: ENTRY_IDS[0], html: (bg) =>
      h.p("Yes, until you apply. A home you live in is taxed on 4 percent of its value once you apply and qualify, and it does not pay the part of the tax that runs the schools. Until then, the county bills it at 6 percent, the rate for second homes and rentals.") +
      TAX_CHART +
      h.p("Newer owners are the most likely to still pay it.") +
      SHARE_TILES +
      h.h3("Why do people moving here miss it?") +
      h.p("The county does not apply it for you. It asks for South Carolina papers that a new arrival does not have yet:") +
      h.ul([
        "a South Carolina driver's license or ID at the home's address, for each owner who lives there and a spouse;",
        "South Carolina registration for every vehicle you own, at that address;",
        "your state and federal tax returns, or the Social Security 1099;",
        "if you own another home, its tax bill showing no exemption, or a letter that the exemption was removed.",
      ]) +
      h.p("You also certify that no one in the home claims the 4 percent rate on another home. That means you, a spouse or a child under 18 you support. None of you can claim to be a legal resident of another state.") +
      APPLY_CARDS +
      we(`Our ${h.a("/buyers/property-taxes/", "property tax calculator")} works out the bill in any town.`) +
      ctaBox("Get the tax on a house at 4 percent and at 6 percent", "Send us the address. We can work out its tax bill at both rates while you choose, and give you the county's list of papers at closing.", "Have us price the tax on a house", bg) },

    { h2: "Why is my tax bill so much higher than the seller's?", toc: LABEL[1], id: ENTRY_IDS[1], html: () =>
      h.p("The seller's bill shows what the seller pays, not what you will pay. A home owned for many years is often taxed on a value far below the county's own value of it. A sale resets that value, and the new value is first taxed the year after the sale.") +
      h.p("Example: the seller has lived in a house since about 2010. The county taxes it on much less than its full value. You buy the house as a second home. Your bill is on the full value, at the second-home rate. You pay about five times the seller's bill.") +
      SELLER_CHART +
      h.p(`We can work out your bill at your price and your tax rate, not from the seller's bill. Our ${h.a("/buyers/property-taxes/", "property tax guide")} explains how a sale resets the value.`) },

    { h2: "Do I need flood insurance if the house is not in a flood zone?", toc: LABEL[2], id: ENTRY_IDS[2], html: () =>
      h.p("Federal law does not require flood insurance outside FEMA's high-risk zone. But since 2015, 3 in 10 paid flood claims in Horry County were on buildings outside that zone, and those repairs cost more.") +
      FLOOD_TILES +
      h.p("One middle payment outside the zone equals about 48 years of the middle flood policy there.") +
      PH_FLOOD +
      we(`We can get a flood insurance quote on any house you are about to buy, in the zone or out of it. Our ${h.a("/buyers/undisclosed-flooding/", "flood history page")} shows how to learn whether a house has flooded before.`) },

    { h2: "Will the listing tell me the house is in a flood zone?", toc: LABEL[3], id: ENTRY_IDS[3], html: (bg) =>
      h.p(`Usually not. Of the ${n0(HOUSE.in_sfha)} houses for sale in Horry County inside FEMA's high-risk flood zone, ${n0(HOUSE.in_sfha_not_tagged)} do not say "flood zone" in their listing's feature list.`) +
      STACK +
      h.p("In the zone, a loan from a federally regulated lender requires flood insurance, and you must be told in writing.") +
      h.p("Flood insurance costs more in the zone, and more again on a house the owner does not live in.") + FLOOD_TABLE +
      we("We can test any address against FEMA's flood map before you offer, so the insurance is in your budget before the lender asks for it.") +
      MID_CTA(bg) },

    { h2: "Does a homeowners policy cover wind near the beach?", toc: LABEL[4], id: ENTRY_IDS[4], html: () =>
      h.p("Not always. In Horry County east of U.S. 17 or Bypass 17, whichever is farther west, and in named coastal areas of other counties, South Carolina lets an insurer leave wind and hail out of a homeowners policy. In Myrtle Beach, that line is the Bypass. Outside those areas, an insurer needs the state insurance director's approval to do it.") +
      h.p(`If wind is left out, you need a separate wind policy. The state's backup insurer for wind sells one to owners in this coastal area who cannot get it from another insurer. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} explains the three policies a house here can need.`) +
      h.p("Before you offer, we can tell you which side of the line a house is on, and get a homeowners quote that shows whether wind is in it.") },

    { h2: "How do I know a condo building has saved enough for repairs?", toc: LABEL[5], id: ENTRY_IDS[5], html: (bg) =>
      h.p("Only from the building's own budget and records. South Carolina does not require a condo to keep repair savings, called reserves, or to study what its repairs will need.") +
      h.p(`More than half of the condos for sale on the Grand Strand are in buildings ${CONDO_AGE} years old or older.`) +
      PH_TOWERS +
      `<div class="c3m-ex"><span class="k">Example</span><p>An 80-unit building has saved 26 percent of what it should hold by now for its repairs. ${h.ext(AR, "Association Reserves")}, a firm that studies condo savings, calls anything under 30 percent weak, with a high chance of a special bill to the owners.</p><p>In our example, the bill five years out is about $4,750 a unit, split evenly. It leaves out inflation and interest.</p></div>` +
      h.p(`${h.ext(FREDDIE, "Freddie Mac")} buys home loans from lenders. For loan applications from January 4, 2027, it needs a building's budget to put at least 15 percent of its dues into savings. A buyer whose loan follows Freddie Mac's rules needs a building that meets it.`) +
      we(`Our pages on ${h.a("/hoa/reserves/", "condo reserves")}, ${h.a("/hoa/special-assessments/", "special assessments")} and ${h.a("/buyers/condo-in-litigation/", "condos in a lawsuit")} explain each one.`) +
      ctaBox("Find out what a condo building has saved for repairs", "Send us the building. Before you offer, we can get its budget, its savings figure and its recent board minutes, and go over them with you.", "Have us get a condo's budget", bg) },

    { h2: "Can I rent my Myrtle Beach house by the week?", toc: LABEL[6], id: ENTRY_IDS[6], html: () =>
      h.p(`Inside the City of Myrtle Beach, only where the zoning allows rentals under 90 days. Most of the city's residential neighborhoods are not zoned for them.`) +
      ZONE_CARDS +
      h.p("A violation is a misdemeanor, with a fine of up to $500, 30 days in jail, or both, each time. Where the zoning allows a short-term rental, the city requires a business license for it.") +
      PH_BEACH +
      h.p(`The ${h.ext(MB_ZONING, "city is rewriting its zoning code")}. The rules also differ in each other town and in the county outside the cities; our ${h.a("/invest/str-rules/", "short-term rental rules page")} has each one. Before you make an offer, we can look up the zoning of any address in the city.`) },

    { h2: "Should I skip the inspection to win the house?", toc: LABEL[7], id: ENTRY_IDS[7], html: () =>
      h.p("No. Under South Carolina law, inspecting the house is the buyer's job, and the agents have no duty to inspect it.") +
      h.p("The seller's disclosure form is not an inspection. On most resales of a house with one to four units, the seller must give you the state's form before you sign, unless the contract says otherwise. It tells you only what the seller knows.") +
      h.p("The law exempts some sales from the form, such as a new home no one has lived in, a foreclosure, an estate sale and an auction.") +
      h.p(`Septic tanks are rare at the beach and more common inland. About ${oneIn(...SEPTIC_ALL)} houses for sale on the Grand Strand list one, and ${WELL} list well water.`) +
      SEPTIC_CHART +
      h.p("We can line up the inspection once the seller accepts your offer, with a septic and a well check where the house has them.") },

    { h2: "Will the HOA let me keep my boat, golf cart or rental?", toc: LABEL[8], id: ENTRY_IDS[8], html: (bg) =>
      h.p(`Only if its recorded rules allow it. About ${HOA_SHARE} in 10 houses for sale on our MLS, which covers the Grand Strand and inland Horry County, have an HOA fee, so most houses here come with a homeowners association (HOA) and its rules.`) +
      h.p("In South Carolina, those rules bind you only if they are on file with the county. The HOA's papers are recorded at the county's Register of Deeds. A rule the board adds or changes must be recorded by January 10 of the next year to stay in force.") +
      h.p(`The biggest mistake we see from buyers moving from New York is not checking that a community's rules fit how they live: its rules on boats, golf carts, rentals and pools. The same check matters for any buyer with a boat, a cart or a rental plan. For one community's rules, read ${h.a("/submarkets/carolina-forest/the-farm/", "the HOA rules in The Farm at Carolina Forest")}.`) +
      we(`Many communities here ban renting the house out at all. When we search for you, we leave those out, and we read the HOA papers for any rule that would block your rental plan. If you would rather have no HOA, see our page on ${h.a("/buyers/no-hoa-homes/", "homes with no HOA")}.`) +
      ctaBox("Find out if a community's rules fit how you live", "Send us the community or the address. We can read its HOA papers for the boat, the golf cart, the pool and renting before you offer.", "Have us read the HOA rules", bg) },

    { h2: "Does the agent I called work for me?", toc: LABEL[9], id: ENTRY_IDS[9], html: () =>
      h.p("Not until you both sign. In South Carolina, no brokerage firm represents you until you and the firm agree to it in writing.") +
      AGENT_CARDS +
      h.p("Paying an agent does not by itself make the agent yours.") +
      h.p(`Since 2024, ${h.ext(NAR, "agents who use the MLS")}, the shared list of homes for sale, must sign a written agreement with you before you tour a home. It must state the agent's pay as an amount or a rate, and bar the agent from taking more from any source. It must also say that fees are fully negotiable and not fixed by law.`) +
      h.p("An agent on your side also tells you when a house is not a good buy. One buyer spent over a year sending his agent Zillow links. Each time, he was told it was a good buy in an up and coming neighborhood. He came to us after that.") +
      we("Before we show you a home, we put in writing what we will do for you and what we are paid.") },
  ],
  faqTitle: "Buyer mistakes FAQ",
  faq: [
    { q: "How do I apply for the 4 percent rate in Horry County?", a: "Online, on the county's Online Services page, under Legal Residence Application. If the county asks for a missing paper, you can send it by mail, fax or email, or bring it to the Assessor's Office. The office's phone number is 843-915-5040." },
    { q: "How far back can I get a refund of the 6 percent tax on my home?", a: "If you qualified for the 4 percent rate and paid at 6 percent, you can claim the extra tax back from the county assessor. Under state law, you have two years from the day you paid that bill, and a county council may allow refunds of the county's own share for more past years." },
    { q: "Does a condo's HOA fee show whether it has saved enough for repairs?", a: `No. In our count of condos for sale here, the middle HOA fee is about ${r10(FEE_ALL)} a month, and about ${r10(FEE_OLD)} in buildings built in 1986 or earlier. Older buildings do not charge much more, so the fee alone does not show what a building has saved for its age.` },
    { q: "Can I change jobs while buying a house in Myrtle Beach?", a: `Wait until after closing if you can. On a loan that follows Fannie Mae's rules, the lender checks again that you still have your job no more than 10 business days before closing, or 15 in some cases. A loan officer at our preferred lender can tell you what your loan will need.` },
  ],
  sources: [
    { name: "SC Code 12-43", href: T12_43 },
    { name: "12-37", href: T12_37 },
    { name: "12-54", href: T12_54 },
    { name: "27-30", href: T27_30 },
    { name: "27-50", href: T27_50 },
    { name: "38-75", href: T38_75 },
    { name: "40-57", href: T40_57 },
    { name: "Horry County checklist", href: CHECKLIST },
    { name: "2026 county levy", href: LEVY },
    { name: "FEMA flood claims", href: NFIP },
    { name: "42 U.S.C. 4012a", href: USC4012A },
    { name: "Myrtle Beach zoning", href: MB_ZONING },
    { name: "NAR", href: NAR },
    { name: "Association Reserves", href: AR },
    { name: "Fannie Mae", href: FANNIE },
    { name: "Freddie Mac", href: FREDDIE },
  ],
  sourcesNote: "Our counts: Horry County parcel records, FEMA's flood policy and claim files, and homes for sale on the MLS, counted in total. Not legal, tax or insurance advice.",
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Buying on the Grand Strand?", p: "Tell us about the house. Before you offer, we can price the tax at both rates, test the flood map and the wind line, look up the zoning and read the HOA papers.", label: "Send us the house you like", href: "/contact/" },
  keywords: "home buyer mistakes Myrtle Beach, biggest mistakes when buying a house, mistakes to avoid when buying a house South Carolina, Horry County legal residence application, 4 percent tax rate South Carolina, Myrtle Beach flood zone, do I need flood insurance Myrtle Beach, does homeowners insurance cover wind Myrtle Beach, should I waive inspection, buyer agent South Carolina, Myrtle Beach short term rental zoning",
  about: "Mistakes home buyers make in Myrtle Beach and Horry County, South Carolina",
});
