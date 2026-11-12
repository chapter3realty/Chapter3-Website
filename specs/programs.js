/* /buyers/programs/ - SC Housing's down payment help for a buyer in Horry County: how much, who
 * qualifies, when it is repaid, which homes count and where they are for sale, the other programs,
 * no money down (USDA's area on our map), the local help, and how to apply.
 *
 * Batch 2026-10-d, Lane U. Version 1, 2026-11-01. The live page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-d/buyers-programs/facts.md (VERIFIED rows, and CORRECTED rows in
 * the verifier's "Use" wording only; row 14, County First, is STRUCK and left out). Demand:
 * must-answer.md (Google suggestions of 2026-11-01). Plan: PLAN.md.
 * Data: data/2026-10-d/buyers-programs/ (findings.json, chart-houses-by-town.json, usda-map.json,
 * built by build-findings.py and build-map-data.py from the raw pulls). Every count and share on
 * the page is computed here from those files, never typed. The program rules and limits are typed
 * from their ledger rows (row numbers beside each).
 * Kept from the live page: the H1 and title the owner liked (data/headlines.json), the targeted
 * county rule (row 1, corrected), the 640 score, the course, the 15-year term, the home types, the
 * honest line about a smaller house or a longer save, the closing cost calculator link, and the
 * #afba disclosure (287 pages link to /buyers/programs/#afba).
 * Not kept (judge, SWEEP): "Interest Rate 0%", "Monthly Payments None", the agency's "low-to-moderate
 * income" wording, "We run the numbers both ways", "An Chapter3 agent", the 10.01.2025 dates, the
 * unsourced "Myrtle Beach buyers use them regularly".
 * Photo: a house in Conway's historic district (CC BY-SA 3.0, data/2026-10-d/buyers-programs/photos.json)
 * until the photo partner's shots arrive (batches/2026-10-d/buyers-programs/shot-list.md).
 * Review round 1 (2026-11-01): heading, hero and short answer rewritten so no fact is said twice; the
 * side-by-side table, the hero tiles, the HUD bar and the HOME card cut; counts rounded to "in five"
 * shares; the loan types, the recapture limits and the rate answer added (facts.md rows F1 to F3,
 * VERIFIED-BY-FIXER); the example moved near the end with a turn; the end band and the feed box
 * fixed with page CSS (NEEDS.md 8 to 10). REVIEW-1.md lists each change.
 * Review round 2 (2026-11-01): the loan table, both disclaimer sentences, the repeated FAQs and the
 * repeated check promise cut; the USDA town table, the open-now answer, the bank grant answer (F7),
 * the builder FAQ (F8) and Habitat's first step (F9) added. REVIEW-2.md lists each change.
 * Review round 3 (2026-11-01): the cash answer leads with the answer; the repeated town and USDA
 * sentences cut; the recapture clause restored word for word (row 11); modular and manufactured
 * explained (F15); the loan types named in plain words (F13); Habitat in dollars (F14); the seller
 * help FAQ (F16); the photo is now a house in Conway (photos.json here). REVIEW-3.md lists each change.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards, story } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));

const SELF = "/buyers/programs/";
const DATA = path.join(__dirname, "..", "data", "2026-10-d", "buyers-programs");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json"), TOWNS = read("chart-houses-by-town.json").rows, MAP = read("usda-map.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n(v);
const pct = (a, b) => Math.round(a / b * 100);
const T = Object.fromEntries(TOWNS.map((r) => [r.town, r]));
if (TOWNS.length !== 9) throw new Error("chart-houses-by-town.json: expected 9 towns");

/* The program limits (rows 2, 4, 6, 13). */
const DPA = 10000, INC12 = 114960, INC3 = 134120, PRICE = 450000, SCORE = 640, PHA_INC = 140000;

/* Homes for sale (rows 28, 29): the nine mailing cities, list prices, from the CRM in aggregate. */
const HOUSE = F.listings_by_type_9_cities.house, CONDO = F.listings_by_type_9_cities.condo;
const HOUSE_SUM = TOWNS.reduce((t, r) => [t[0] + r.houses_for_sale, t[1] + r.under_450k], [0, 0]);
if (HOUSE_SUM[0] !== HOUSE.all || HOUSE_SUM[1] !== HOUSE.under_450k) throw new Error("the town rows and the house totals disagree");
const INLAND = ["Aynor", "Conway", "Loris", "Longs"], BEACH = ["Myrtle Beach", "Surfside Beach", "Murrells Inlet", "North Myrtle Beach"];
const inlandShare = pct(INLAND.reduce((t, k) => t + T[k].under_450k, 0), INLAND.reduce((t, k) => t + T[k].houses_for_sale, 0));
const beachShare = pct(BEACH.reduce((t, k) => t + T[k].under_450k, 0), BEACH.reduce((t, k) => t + T[k].houses_for_sale, 0));
/* The page says these shares in words (owner, 2026-10-07: too many exact numbers). Each word is checked here. */
if (inlandShare < 78 || inlandShare > 83) throw new Error("inland share is no longer about four in five: " + inlandShare);
if (beachShare < 30 || beachShare > 38) throw new Error("beach share is no longer about a third: " + beachShare);
const WHERE = (k) => INLAND.includes(k) ? "inland" : BEACH.includes(k) ? "beach" : "coast";

/* USDA (row 31, corrected): houses at or under $450,000 we could place on the map in Horry County. */
const U = F.usda_listing_tally_under_450k.house;
const U_IN = U.usda_eligible, U_ALL = U.usda_eligible + U.usda_ineligible;
if (U_IN !== 1024 || U_ALL !== 1671) throw new Error("USDA tally differs from ledger row 31");
const uTown = (k) => ({ inside: T[k].under_450k_usda_eligible, placed: T[k].under_450k_usda_eligible + T[k].under_450k_usda_ineligible });
const uAll = pct(U_IN, U_ALL), uMB = pct(uTown("Myrtle Beach").inside, uTown("Myrtle Beach").placed);
if (uAll < 58 || uAll > 63) throw new Error("USDA share is no longer about six in ten: " + uAll);
if (uMB >= 10) throw new Error("Myrtle Beach USDA share is no longer under one in ten: " + uMB);
if (["North Myrtle Beach", "Surfside Beach", "Murrells Inlet"].some((k) => uTown(k).inside !== 0)) throw new Error("a beach town now has USDA houses");
/* The USDA share by town, in words (owner, 2026-10-07: too many exact numbers). Each word is computed. */
const inWords = (a, b) => { const r = a / b; if (a === 0) return "None"; if (a === b) return "All"; if (r >= .95) return "Nearly all";
  if (r >= .85) return "About nine in ten"; if (r >= .2 && r < .3) return "About one in four"; if (r < .1) return "Fewer than one in ten"; throw new Error("no word for " + a + " of " + b); };
const uBeach = BEACH.reduce((t, k) => [t[0] + uTown(k).inside, t[1] + uTown(k).placed], [0, 0]);
if (uBeach[0] / uBeach[1] >= .1) throw new Error("beach USDA share is no longer under one in ten");
const USDA_TOWNS = ["Aynor", "Loris", "Conway", "Longs", "Little River", "Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Murrells Inlet"];
const NB = "\u00a0"; /* keeps a number with its unit on one line (critic: "15 / years") */

/* Incomes (rows 26, 27). */
const R = F.renters_acs1_2024, MED = F.median_household_income_acs1_2024.value;
const renters100 = Math.round(R.share_under_100k * 100);
if (renters100 !== 83) throw new Error("renter share differs from ledger row 27");

/* ---------------------------------------------------------------------------- */
/* Page styles: the glass cards this page draws itself (rules, timeline, tiles,  */
/* decision cards, steps). Scoped to .c3-pg.                                     */

const GL = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 40px -28px rgba(28,32,40,.45);border-radius:20px";
const CSS = "<style>"
  + `.c3-pg-ic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;color:var(--brass);background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.45)}`
  /* The rule cards */
  + ".c3-pg-rules{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.8rem;max-width:960px}"
  + "@media (min-width:760px){.c3-pg-rules{grid-template-columns:1fr 1fr}}"
  + `.c3-pg-rules>li{${GL};margin:0;padding:1rem 1.1rem .95rem;display:grid;grid-template-columns:40px 1fr;gap:.2rem .85rem;align-items:start;align-content:start}`
  + ".c3-pg-rules .k{grid-column:2;align-self:center;font-family:var(--sans);font-size:.95rem;font-weight:600;color:var(--navy);line-height:1.3}"
  + ".c3-pg-rules .v{grid-column:1 / -1;margin-top:.35rem;font-family:var(--serif);font-size:1.3rem;color:var(--navy);line-height:1.3}"
  + ".c3-pg-rules .d{grid-column:1 / -1;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55;margin-top:.15rem}"
  
  /* The 15-year timeline */
  + `.c3-pg-time{${GL};margin:1.4rem 0 1.6rem;padding:1.2rem 1.2rem 1rem;max-width:760px}`
  + ".c3-pg-time .cap{display:block;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1rem;margin:0 0 .9rem}"
  + ".c3-pg-time .bar{display:grid;grid-template-columns:repeat(15,1fr) 1.6fr;gap:3px;height:46px}"
  + ".c3-pg-time .bar span{background:var(--brass);border-radius:4px}"
  + ".c3-pg-time .bar span.y10{background:#a8612c}"
  + ".c3-pg-time .bar span.free{background:#fff;border:2px dashed var(--brass);min-width:2.8rem;padding:0 .3rem;box-sizing:border-box;display:flex;align-items:center;justify-content:center;font-family:var(--sans);font-weight:700;color:var(--navy);font-size:1rem}"
  + ".c3-pg-time .ticks{position:relative;height:1.6rem;margin-top:.35rem;font-family:var(--sans);font-size:.95rem;color:var(--navy)}"
  + ".c3-pg-time .ticks span{position:absolute;top:0;white-space:nowrap}"
  + ".c3-pg-time .owe{display:flex;align-items:center;gap:.5rem;margin:0 0 .55rem;font-family:var(--sans);font-size:1rem;font-weight:600;color:var(--navy)}"
  + ".c3-pg-time .owe i{display:inline-block;width:1.4rem;height:.8rem;border-radius:3px;background:var(--brass)}"
  + ".c3-pg-time .two{display:grid;gap:.6rem;margin-top:.9rem}"
  + "@media (min-width:640px){.c3-pg-time .two{grid-template-columns:1fr 1fr}}"
  + ".c3-pg-time .two p{margin:0;padding:.75rem .85rem;border-radius:14px;background:rgba(255,255,255,.75);border:1px solid rgba(196,120,58,.35);color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5}"
  + ".c3-pg-time .two strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1rem;margin-bottom:.15rem}"
  /* The four loan types (round 3) */
  + ".c3-pg-loans{margin:.6rem 0 1.4rem;padding:0 0 0 1.2rem;max-width:760px;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}"
  + ".c3-pg-loans li{margin:.3rem 0}.c3-pg-loans strong{color:var(--navy);font-family:var(--sans)}"
  /* "After year 15" wraps to two lines on a narrow phone so it clears "Year 10" (critic, round 3, 320 px). */
  + "@media (max-width:420px){.c3-pg-time .ticks{height:2.7rem}.c3-pg-time .ticks span.end{white-space:normal;text-align:right;width:3.6rem;line-height:1.2}}"
  /* Two big numbers side by side */
  + ".c3-pg-tiles{list-style:none;padding:0;display:grid;gap:.8rem;margin:1.2rem 0 1.4rem;max-width:760px}"
  + "@media (min-width:600px){.c3-pg-tiles{grid-template-columns:1fr 1fr}}"
  + `.c3-pg-tiles>li{${GL};margin:0;padding:1rem 1.15rem}`
  + ".c3-pg-tiles b{display:block;font-family:var(--serif);font-weight:400;font-size:2.4rem;line-height:1.1;color:#8a5226}"
  + ".c3-pg-tiles span{display:block;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5;margin-top:.2rem}"
  /* Decision cards: if this is you, look at this */
  + ".c3-pg-pick{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.8rem;max-width:960px}"
  + "@media (min-width:760px){.c3-pg-pick{grid-template-columns:1fr 1fr}}"
  + `.c3-pg-pick>li{${GL};margin:0;padding:1rem 1.1rem;display:flex;gap:.85rem;align-items:flex-start}`
  + "@media (max-width:480px){.c3-pg-pick>li{display:block}.c3-pg-pick>li>.c3-pg-ic{float:right;margin:0 0 .4rem .7rem}}"
  + ".c3-pg-pick .if{display:block;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.5}"
  + ".c3-pg-pick .go{display:block;margin-top:.4rem;font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1.05rem;line-height:1.35}"
  + ".c3-pg-pick .go a{color:var(--navy);text-decoration:underline;text-underline-offset:.18em}"
  + ".c3-pg-pick .go small{display:block;font-weight:500;color:var(--muted);font-size:1rem;margin-top:.1rem}"
  /* Numbered steps */
  + ".c3-pg-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.7rem;max-width:760px}"
  + `.c3-pg-steps>li{${GL};counter-increment:s;margin:0;padding:.95rem 1.1rem .95rem 4rem;position:relative;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.55}`
  + ".c3-pg-steps>li::before{content:counter(s);position:absolute;left:1rem;top:.9rem;width:2.1rem;height:2.1rem;border-radius:50%;background:var(--navy);color:#f4efe8;font-family:var(--sans);font-weight:700;display:flex;align-items:center;justify-content:center}"
  + ".c3-pg-steps strong{display:block;color:var(--navy);font-family:var(--sans);font-size:1.05rem;margin-bottom:.1rem}"
  /* The USDA table */
  + `.c3-pg-tbl{${GL};width:100%;border-collapse:separate;border-spacing:0;overflow:hidden;font-family:var(--sans);font-size:1rem;color:var(--navy)}`
  + ".c3-pg-tbl caption{caption-side:top;text-align:left;font-weight:600;font-size:1rem;color:var(--navy);padding:0 .2rem .6rem;line-height:1.35}"
  + ".c3-pg-tbl th,.c3-pg-tbl td{padding:.6rem .9rem;text-align:left;border-bottom:1px solid rgba(28,32,40,.08);line-height:1.35}"
  + ".c3-pg-tbl thead th{font-size:.9rem;color:var(--muted);font-weight:600}"
  + ".c3-pg-tbl tbody th{font-weight:600;width:52%}.c3-pg-tbl td{color:#8a5226;font-weight:600}"
  + ".c3-pg-tbl tbody tr:last-child th,.c3-pg-tbl tbody tr:last-child td{border-bottom:0}"
  /* The map and the photo */
  + ".c3-pg-map{margin:0;padding:0;max-width:540px}"
  + ".c3-pg-map svg{display:block;width:100%;height:auto}"
  + ".c3-pg-key{display:flex;flex-wrap:wrap;gap:.4rem 1.2rem;margin:.6rem .2rem .1rem;font-family:var(--sans);font-size:1rem;color:var(--navy)}"
  + ".c3-pg-key span{display:inline-flex;align-items:center;gap:.45rem}.c3-pg-key i{display:inline-block;width:1.2rem;height:.9rem;border-radius:3px}"
  + ".c3-pg-photo img{display:block;width:100%;height:auto;border-radius:16px}"
  /* The end band. glass.js styles every navy band that is not main's last child as the slim top offer; at
     the edge the feed's disclaimer (div.hx-wrap) follows the end band, so the end band got the light bar
     with ivory text on it (critic and owner, round 1). This puts the dark panel back. NEEDS.md 8. */
  + `main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;display:block!important;text-align:center!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;width:calc(100% - 32px)!important;max-width:720px!important;margin:0 auto!important;box-sizing:border-box}`
  + `@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@supports not ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){main#main>section[style^="background:var(--navy)"]:last-of-type:not(:first-child)>.wrap{background:#2a3040!important}}`
  /* The feed's search box ran 44 px past a 320 px screen (critic, round 1). NEEDS.md 9. */
  + ".hx-fb,.hx-fb-ai,.hx-fb-q{max-width:100%;min-width:0;box-sizing:border-box}.hx-fb-q textarea{min-width:0}.hx-fb-pills{flex-wrap:wrap;max-width:100%}"
  /* The site header ran 5 px past a 1024 px window (critic, round 1; the same on every page). This page
     only narrows the header's gap between 1000 and 1100 px until the shared header CSS is fixed. NEEDS.md 10. */
  + "@media (min-width:1000px) and (max-width:1100px){header .header-inner{gap:2rem}}"
  /* Light fix, triage 2026-11-08 (the approved look, Blog-Brain batches/2026-11-a/hoa-documents/DESIGN.md):
     1. the italic line at about half the H1's size, on its own line; */
  + "@media (min-width:700px){main#main .detail-h1{text-wrap:balance}}main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}"
  + "@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}"
  /* 2. the Conway house photo without a card frame, and on a wide screen in a side column beside the town chart
     it belongs to, as on /submarkets/garden-city/. Below 1,100 px the order is unchanged. */
  + "main#main .c3-pg-part figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;padding:0!important}"
  + "main#main .c3-pg-part figure.c3ph-hero figcaption{padding:0!important}"
  + "@media (min-width:1100px){main#main .c3-pg-part{display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:auto auto 1fr;column-gap:2.5rem;align-items:start}"
  + "main#main .c3-pg-part>*{grid-column:1}main#main .c3-pg-part>figure.c3ph-hero{grid-column:2;grid-row:1/-1;margin:.3rem 0 0!important;max-width:none!important}}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* Section 1: the tests, as glass cards (rows 1, 4 to 7, 9, 10).                 */

const RULES = [
  { ic: "dollar", k: "Household income", v: `Up to ${money(INC12)} for 1 or 2 people, ${money(INC3)} for 3 or more`, d: "The income of everyone on the loan or the deed counts together." },
  { ic: "home", k: "Home price", v: `Up to ${money(PRICE)}`, d: "The lot can be 5 acres at most." },
  { ic: "key", k: "What you own now", v: "No other property when the loan closes", d: "Owning bare land is allowed." },
  { ic: "tax", k: "Credit and debts", v: `A credit score of ${SCORE} or more`, d: "If the FHA, VA, USDA or conventional loan's own rules ask for a higher score, the higher score applies. All your monthly debt payments together can be at most 45 percent of your income." },
  { ic: "pin", k: "Citizenship", v: "A U.S. citizen or a permanent resident", d: "A permanent resident needs a green card. A visa of any kind does not qualify." },
  { ic: "family", k: "Who is on the loan", v: "Only buyers who will live in the home", d: "The Homebuyer Program allows no cosigner. A gift toward the purchase can come from a relative, a domestic partner or a fiancé." },
  { ic: "calendar", k: "The homebuyer course", v: "One buyer takes it before loan approval", d: "Online or in a classroom, within 12 months of closing, even if you have owned a home before. The lender arranges it." },
];
const RULES_HTML = `<ul class="c3-pg-rules" role="list" aria-label="SC Housing Homebuyer Program rules in Horry County">`
  + RULES.map((r) => `<li><span class="c3-pg-ic" aria-hidden="true">${icon(r.ic, { size: 22 })}</span><span class="k">${r.k}</span><span class="v">${r.v}</span><span class="d">${r.d}</span></li>`).join("") + "</ul>";

/* Incomes beside the limits (rows 4, 22, 26). The median is for households of every size; the note says so. */
const INCOME_CHART = G.bars([
  { name: "SC Housing limit, 3 or more people", value: INC3, feature: "Homebuyer Program" },
  { name: "SC Housing limit, 1 or 2 people", value: INC12, feature: "Homebuyer Program" },
  { name: "Middle household income, Horry County", value: MED, valueText: "about " + money(Math.round(MED / 500) * 500), feature: "all household sizes", reference: true },
], { caption: "SC Housing's income limits beside what households here earn", nameLabel: "Income", featureLabel: "what it is", valueLabel: "yearly income", compact: true,
  note: "The median (middle) household income is the U.S. Census Bureau's latest one-year figure for Horry County, for households of every size." });

/* The labelled example (row 1: the targeted county rule). Present tense; no real client. */
const EXAMPLE = story([
  "<strong>Example:</strong> Dana rents in Myrtle Beach and still owns a house in Ohio.",
  "She wants SC Housing's down payment help for a house in Conway.",
  "Her Chapter3 agent finds the problem before she makes an offer. SC Housing will not close the Conway loan while she owns the Ohio house.",
  "The agent writes the Conway closing date into the contract for a day after the Ohio sale closes.",
  "What this means for you: set the closing on your new home for after the sale of the old one.",
], "", "ivory");

/* ---------------------------------------------------------------------------- */
/* Section 2: the 15-year timeline (row 3). The full $10,000 is owed until year  */
/* 15, then $0. It is never drawn as shrinking.                                  */

const TIMELINE = `<figure class="c3-pg-time" role="img" aria-label="Timeline: from the day you move in until year 15 you owe the full $10,000. If you sell, refinance or move out in year 10, the full $10,000 is repaid. After year 15 SC Housing forgives all of it and you owe nothing.">`
  + `<span class="cap" aria-hidden="true">What you owe on SC Housing's $10,000, year by year</span>`
  + `<p class="owe" aria-hidden="true"><i></i>You owe the full $10,000 in every one of years 1 to 15</p>`
  + `<div class="bar" aria-hidden="true">${Array.from({ length: 15 }, (_, i) => `<span${i === 9 ? ' class="y10"' : ""}></span>`).join("")}<span class="free">$0</span></div>`
  + `<div class="ticks" aria-hidden="true"><span style="left:0">Move in</span><span style="left:calc(9.5 / 16.6 * 100%);transform:translateX(-50%)">Year 10</span><span class="end" style="right:0">After year 15</span></div>`
  + `<div class="two" aria-hidden="true"><p><strong>Sell, refinance or move out in year${NB}10</strong>The full $10,000 is repaid from the sale or the new loan.</p><p><strong>Still living there after year${NB}15</strong>SC Housing forgives all of it. You repay nothing.</p></div>`
  + `</figure>`;

/* ---------------------------------------------------------------------------- */
/* Section 3: houses at or under $450,000 by town (row 28, corrected wording).   */

const TOWN_CHART = G.bars(TOWNS.map((r) => ({ name: r.town, value: r.share_under_450k * 100, valueText: `${Math.round(r.share_under_450k * 100)}%`,
  feature: WHERE(r.town) })),
  { caption: "Share of houses for sale listed at or under $450,000, by town", nameLabel: "Town", featureLabel: "where", valueLabel: "share", max: 100, compact: true,
    note: "Houses for sale on the Coastal Carolinas MLS (CCMLS), counted by Chapter3 in aggregate, at list price. Towns are mailing addresses, so Conway includes country land outside the city and Myrtle Beach includes Carolina Forest and Socastee. Murrells Inlet includes some homes in Georgetown County." });

const CONDO_TILES = `<ul class="c3-pg-tiles" role="list"><li><b>${pct(CONDO.under_450k, CONDO.all)}%</b><span>of condos for sale in the same towns are listed at or under $450,000.</span></li>`
  + `<li><b>9</b><span>condo projects in all of Horry County are approved for FHA loans. HUD, the U.S. Department of Housing and Urban Development, keeps the list.</span></li></ul>`;

/* ---------------------------------------------------------------------------- */
/* Section 4: USDA's area, drawn from usda-map.json (row 31). Our own map.       */

const usdaMap = () => {
  const { loadGeo2 } = require(path.join(BB, "tools", "area-map.js"));
  const geo = loadGeo2();
  const k = 470, cos = Math.cos(33.9 * Math.PI / 180), lon0 = -79.37, lat0 = 34.32;
  const X = (lon) => (lon - lon0) * cos * k, Y = (lat) => (lat0 - lat) * k;
  const W = 410, H = 392;
  const pts = (r) => r.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join("L");
  const poly = (g) => g.coordinates.map((r) => "M" + pts(r) + "Z").join("");
  /* The ocean: TIGER/Line's coastline (land on its left), closed far out at sea, as area-map.js draws it.
     It is painted over the county, whose outline runs about 3 miles out to sea. */
  const sea = [...geo.coast, [-78.0, 33.75], [-78.0, 32.9], [-79.6, 32.9], [-79.6, 33.1]];
  const F = "font-family=\"Inter,system-ui,sans-serif\"";
  const HALO = 'paint-order="stroke" stroke="#fbf8f3" stroke-width="5" stroke-linejoin="round"';
  /* Label spots, in map units from the town's point (checked in the shots at 390, 768 and 1440). */
  const LAB = {
    "Aynor": [0, -13, "middle"], "Loris": [11, 6, "start"], "Longs": [-11, 1, "end"], "Conway": [-11, 6, "end"],
    "Little River": [10, 16, "start"], "North Myrtle Beach": [12, 18, "start", ["North Myrtle", "Beach"]], "Myrtle Beach": [11, 14, "start"],
    "Surfside Beach": [11, 14, "start"], "Murrells Inlet": [10, 18, "start"],
  };
  const towns = MAP.towns.map((t) => {
    const [dx, dy, a, lines] = LAB[t.name]; const x = X(t.lon), y = Y(Math.max(t.lat, 33.565));
    const pin = t.usda_eligible_at_point ? "#1c2028" : "#fff";
    const txt = (lines || [t.name]).map((l, i) => `<tspan x="${(x + dx).toFixed(1)}" dy="${i ? 21 : 0}">${l}</tspan>`).join("");
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.5" fill="${pin}" stroke="#1c2028" stroke-width="2"/>`
      + `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${a}" ${F} font-size="20" font-weight="600" fill="#1c2028" ${HALO}>${txt}</text>`;
  }).join("");
  /* Round 3 (reader): the text names Carolina Forest and Socastee, so the map labels them too. Points are the
     Census places' TIGER/Line interior points (tools/geo/grand-strand-v2.json). Smaller, in italics, with an
     open ring, so they do not read as towns with a USDA pin. */
  const AREAS = [["Carolina Forest", -78.9135, 33.7664, -7, 21, "end"], ["Socastee", -79.0089, 33.6874, -9, 9, "end"]];
  const areas = AREAS.map(([nm, lo, la, dx, dy, a]) => `<circle cx="${X(lo).toFixed(1)}" cy="${Y(la).toFixed(1)}" r="3.5" fill="none" stroke="#1c2028" stroke-width="1.6"/>`
    + `<text x="${(X(lo) + dx).toFixed(1)}" y="${(Y(la) + dy).toFixed(1)}" text-anchor="${a}" ${F} font-size="18" font-style="italic" fill="#1c2028" ${HALO}>${nm}</text>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of Horry County. The coastal strip from Little River through North Myrtle Beach, Myrtle Beach and Surfside Beach to Murrells Inlet, and inland past Carolina Forest and Socastee, is shaded: it is outside USDA's area. Conway, Aynor, Loris and Longs are inside it.">`
    + `<defs><clipPath id="c3-pg-frame"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#c3-pg-frame)">`
    + `<rect width="${W}" height="${H}" fill="#e9e3d8"/>`
    + `<path d="${poly(MAP.horry_outline)}" fill="#fdfbf7" stroke="#5c6b78" stroke-width="1.6" stroke-linejoin="round"/>`
    + `<path d="M${pts(sea)}Z" fill="#d3e0e5"/>`
    + `<path d="${poly(MAP.usda_ineligible_in_horry)}" fill="rgba(196,120,58,.6)" fill-rule="evenodd" stroke="#91592b" stroke-width="1.2" stroke-linejoin="round"/>`
    + towns + areas + `</g></svg>`;
  return `<figure style="margin:1.6rem 0 1.8rem;max-width:560px"><div class="c3-pg-map">${svg}`
    + `<div class="c3-pg-key" aria-hidden="true"><span><i style="background:rgba(196,120,58,.6);border:1px solid #91592b"></i>Outside USDA's area</span><span><i style="background:#fdfbf7;border:1px solid #5c6b78"></i>Inside USDA's area</span><span><i style="background:#d3e0e5"></i>Atlantic Ocean</span></div></div>`
    + `<figcaption style="color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem">Our map of USDA's home loan area in Horry County. The shaded coast is outside it. Map: Chapter3 Realty, from USDA Rural Development's eligibility map and Census TIGER/Line county lines and coast.</figcaption></figure>`;
};

/* Round 2 (owner): the photo moved out of the USDA section, beside the town chart its caption is about. */
if (TOWNS.some((r) => r.town !== "Conway" && r.under_450k >= T.Conway.under_450k)) throw new Error("Conway no longer has the most houses under the limit");
/* The stand-in photo (data/photos.json, public domain; verifier looked at it full size). The caption
   ties it to the USDA finding beside it (owner, round 1: the photo said nothing). */
/* Round 3 (critic and owner): a house, not shop fronts. The record is in this page's photos.json (CC BY-SA
   3.0, own work by Pollinator; the same record as data/photos.json "conway-historic-home"). The caption does
   not say this house is under the limit: its price is not known. It is lazy-loaded, not a hero. */
const PH = require(path.join(BB, "tools", "photos.js"));
const HOUSE_REC = PH.findPhoto(read("photos.json").photos, "conway-historic-home");
const PHOTO = PH.heroPhoto(HOUSE_REC, { alt: "A white two-story house with green shutters under live oaks in Conway's historic district", caption: "A house under live oaks in Conway's historic district.", maxWidth: "760px", sizes: "(max-width: 800px) 100vw, 760px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const PHOTO_CREDIT = PH.creditsList([{ photo: HOUSE_REC, caption: "A house in Conway's historic district" }]);

/* ---------------------------------------------------------------------------- */
/* Section 5: which program (rows 13, 15, 16, 17, 18, 19). The side-by-side table */
/* is cut (owner, round 1: the card, the table and the H3 said it three times).  */

const PICK = [
  { ic: "key", if: `You own no other property, your household is under the income limit, and the home costs ${money(PRICE)} or less.`, go: "The Homebuyer Program", small: "The $10,000 on this page" },
  { ic: "home", if: "You earn more, the home costs more than $450,000, you already own a home, or you want a manufactured home.", go: "Palmetto Home Advantage", small: `Up to 4${NB}percent of the loan, forgiven after 10${NB}years` },
  { ic: "calendar", if: "You are a teacher, nurse, police officer, firefighter, EMT, veteran, or in the military or National Guard.", go: "Palmetto Heroes", small: "$10,000, closed for 2026" },
  { ic: "family", if: "You, or anyone in your household, has a permanent disability shown by Social Security disability income (SSI or SSDI) or long-term disability income.", go: "Families with Disabilities", small: "The same 15-year forgivable help, homes up to $450,000" },
  { ic: "town", if: "You have had a Housing Choice Voucher (Section 8) for at least a year in the county where you buy.", go: "Voucher homeownership", small: "Where the local housing authority takes part" },
];
const PICK_HTML = `<ul class="c3-pg-pick" role="list" aria-label="Which SC Housing program fits you">`
  + PICK.map((p) => `<li><span class="c3-pg-ic" aria-hidden="true">${icon(p.ic, { size: 22 })}</span><span><span class="if">${p.if}</span><span class="go">${p.go}<small>${p.small}</small></span></span></li>`).join("") + "</ul>";

/* ---------------------------------------------------------------------------- */
/* Section 6: local help (rows 20, 24, 25), as two cards. The HOME card is one   */
/* line now: it is help the reader cannot apply for (owner, round 1).            */

const LOCAL = [
  { ic: "home", go: h.ext("https://habitathorry.org/what-we-do/homeownership/", "Habitat for Humanity of Horry County"), small: "Builds and sells homes",
    if: "For households earning 35 to 80 percent of the county's median income: for three people in 2026, about $23,000 to $62,000 a year. You must have lived in Horry County for the last 12 months. Buyers put in at least 180 hours of work. You start with a short interest form on its homeownership page, and Habitat pairs you with a volunteer Financial Mentor." },
  { ic: "dollar", go: h.ext("https://corp.fhlbatl.com/who-we-are/news/federal-home-loan-bank-of-atlanta-allocates-120-million-for-affordable-housing-in-2026/", "Federal Home Loan Bank of Atlanta"), small: "Grants through member banks",
    if: "<span style=\"display:block\">Earning under 80 percent of the area's median income: up to $17,500 for a first-time buyer, and up to $20,000 for police, teachers, firefighters, health care workers and veterans.</span> <span style=\"display:block;margin-top:.45rem\">Earning 80 to 120 percent: up to $15,000, from its Workforce Housing Plus+ grants.</span>" },
];
const LOCAL_HTML = `<ul class="c3-pg-pick" role="list" aria-label="Down payment help from local groups in Horry County">`
  + LOCAL.map((p) => `<li><span class="c3-pg-ic" aria-hidden="true">${icon(p.ic, { size: 22 })}</span><span><span class="go" style="margin:0 0 .35rem">${p.go}<small>${p.small}</small></span><span class="if">${p.if}</span></span></li>`).join("") + "</ul>";

/* ---------------------------------------------------------------------------- */
/* Section 7: the steps (rows 7, 12, 21).                                        */

const STEPS = `<ol class="c3-pg-steps">`
  + `<li><strong>Pick an SC Housing approved lender.</strong>SC Housing's ${h.ext("https://schousing.sc.gov/homebuyers/find-lender?county=166", "Find a Lender list for Horry County")} has about 90 loan officers at about 40 companies. The lender takes your application and checks that you qualify.</li>`
  + `<li><strong>Take the homebuyer course.</strong>The lender arranges it. One buyer finishes it, online or in a classroom, before the loan is approved.</li>`
  + `<li><strong>Find a home under the limit with us.</strong>We search houses, townhomes and condos at or under $450,000 in the towns you pick.</li>`
  + `<li><strong>Reserve the money.</strong>Once you qualify and decide to go ahead, the lender reserves your loan and the $10,000.</li>`
  + `<li><strong>Close.</strong>The $10,000 goes toward your down payment, closing costs and prepaid items at closing. It cannot pay a real estate commission or an appraisal gap, which is the difference when a home appraises for less than its price.</li>`
  + `</ol>`;

/* ---------------------------------------------------------------------------- */

const AFBA = `<div id="afba" style="margin:1.4rem 0 3rem;max-width:640px"><p style="font-size:.85rem;color:var(--muted);line-height:1.7;margin-bottom:.4rem"><strong style="color:var(--navy)">Affiliated Business Arrangement Disclosure.</strong> Chapter3 Realty Corp has a business relationship with BrickWood Mortgage (NMLS #189497). Because of this relationship, referrals to BrickWood Mortgage may provide Chapter3 Realty a financial or other benefit.</p>`
  + `<p style="font-size:.85rem;color:var(--muted);line-height:1.7">You are NOT required to use BrickWood Mortgage as a condition for the purchase, sale, or refinance of any property. There are frequently other settlement service providers available with similar services. You are free to shop around to determine that you are receiving the best services and the best rate for those services.</p></div>`;

/* A plain two-column table: nine short rows read better on a phone as a table than as nine cards (round 2). */
const USDA_TABLE = `<figure style="margin:1.2rem 0 1rem;max-width:560px"><table class="c3-pg-tbl"><caption>Houses for sale at or under $450,000 inside USDA's area on our map</caption>`
  + `<thead><tr><th scope="col">Town</th><th scope="col">Inside USDA's area</th></tr></thead><tbody>`
  + USDA_TOWNS.map((k) => `<tr><th scope="row">${k}</th><td>${inWords(uTown(k).inside, uTown(k).placed)}</td></tr>`).join("")
  + `</tbody></table></figure>`;

const CONTACT = "/contact/";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "SC Down Payment Assistance Programs in Horry County | Chapter3",
  description: "SC Housing's $10,000 down payment help in Horry County: the income and price limits, who qualifies, when it is repaid, which homes count, and how to apply.",
  ogTitle: "SC Housing down payment help in Horry County: no first-time buyer rule, and the homes that count",
  crumb: "SC Down Payment Help",
  eyebrow: "Buying a home",
  /* Round 1 (owner): the H1 names the county and states a fact the page proves (row 1). */
  h1: "Down payment help in Horry County:",
  h1em: `you do not have to be a <span style="white-space:nowrap">first-time buyer.</span>`,
  /* Round 1: the sub says what the short answer does not (rows 2, 28), so the two do not repeat. */
  sub: `SC Housing gives an eligible buyer $10,000. Most houses for sale in Conway, Loris, Aynor and Longs are under its price limit. Across the beach towns, about a third are.`,
  heroCta: { title: "Homes that fit SC Housing's limits, sent to you", label: "Get the list", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `The ${money(DPA)} is a second mortgage from SC Housing, the state's housing agency. A second mortgage is a second loan on the home. It pays toward the down payment and closing costs. After you have lived in the home 15${NB}years, SC Housing forgives it, and you owe nothing on the ${money(DPA)}. If you sell, refinance or move out sooner, you repay all of it, from the sale or the new loan.`,
    `To qualify, a household of one or two can earn up to ${money(INC12)}, or ${money(INC3)} for three or more. The home can cost up to ${money(PRICE)}, you need a credit score of ${SCORE}, and you must own no other property when the loan closes.`,
  ],
  sections: [
    { h2: "Do you qualify for SC Housing's down payment help in Horry County?", toc: "Do you qualify", id: "qualify", html: (bg) =>
      CSS +
      h.p("You qualify for SC Housing's Homebuyer Program if you pass the seven tests below.") +
      RULES_HTML +
      h.h3("Do you earn too much?") +
      h.p(`Probably not. SC Housing's limit for one or two people is about ${(INC12 / MED).toFixed(1)} times the median, or middle, household income in Horry County.`) +
      INCOME_CHART +
      h.p("About four in five renter households in the county earn under $100,000, below the limit for any household size.") +
      /* Rows 2, 32 and F1 (reader, round 1: which loan, and how much cash). */
      h.h3("How much of your own money do you still need?") +
      h.p("With a VA or USDA loan, the $10,000 can cover most or all of the cash you bring to closing. Those loans need no down payment, so all of it goes to closing costs and prepaid items. Prepaid items are the first property taxes, homeowners insurance and loan interest paid at closing.") +
      h.p("With an FHA or conventional loan, you also need a down payment, and the $10,000 goes toward both.") +
      /* F13: the four loan types in plain words (owner, round 3: FHA, VA and USDA were never explained). */
      h.p("The $10,000 comes only with SC Housing's own first mortgage, which can be any of these four loans:") +
      `<ul class="c3-pg-loans">`
      + `<li><strong>FHA:</strong> insured by the Federal Housing Administration, part of HUD.</li>`
      + `<li><strong>VA:</strong> backed by the U.S. Department of Veterans Affairs, for veterans and service members.</li>`
      + `<li><strong>USDA:</strong> backed by the U.S. Department of Agriculture, for homes inside its area on our map below.</li>`
      + `<li><strong>Conventional:</strong> a loan no government agency backs.</li></ul>` +
      h.p(`Our ${h.a("/buyers/closing-costs/", "closing cost guide")} adds up the costs at closing for a home at your price. Before you make an offer, we get the lender's figure for that home, so you know your number first.`) +
      h.cta("Know the cash you need for a home you like", "Pick a home, and we ask the lender how much cash you would bring to closing on it, before you make an offer.", "Have us find my cash to close", CONTACT, bg) },

    { h2: "Do you have to pay back SC Housing's $10,000?", toc: "Paying it back", id: "paying-it-back", html: () =>
      h.p(`Only if you sell, refinance or stop living in the home before 15${NB}years are up. It does not shrink a little each year: until year${NB}15, you owe all of it.`) +
      TIMELINE +
      /* Rows 11 and F3: what the tax means for the buyer only (owner, round 2). */
      h.h3("Is there a tax if you sell early?") +
      h.p("Only if three things are all true: you sell within nine years, you sell at a gain, and your income has risen above the levels in the recapture notice from your lender. Then you may owe a federal recapture tax, an increase in your federal income tax for the year you sell. SC Housing pays it back if you ask in writing by June 30 of the next year; the refund is reported to the IRS as income.") },

    { h2: "Which homes count in Horry County, and where are they under $450,000?", toc: "Which homes", id: "which-homes", html: (bg) =>
      /* F15: SC Code 23-43-20 and 40-29-20 (critic and owner, round 3: "off-frame modular" was never explained). */
      h.p(`Houses, townhomes, condos in an approved building, and modular homes count, up to ${money(PRICE)}. A modular home is built in sections in a factory and set on a foundation, not on a steel frame.`) +
      /* Round 3 (owner): the chart carries the shares; this line is the one fact it does not show (F12). */
      `<div class="c3-pg-part">` +
      h.p("Conway has more houses for sale at or under $450,000 than any other town, Myrtle Beach included.") +
      TOWN_CHART +
      PHOTO +
      `</div>` +
      h.h3("Condos: under the price limit, but the building must be approved") +
      CONDO_TILES +
      h.p("Several of those nine are approved only for some phases or buildings. An FHA loan on a condo in any other building needs a separate approval for that one unit.") +
      h.p(`In Chapter3's experience, a building with a rental program usually fails the rules for a conventional loan, because so many owners are investors. Our ${h.a("/invest/non-warrantable-condos/", "guide to condos most lenders will not lend on")} explains why. We check the building's approval before you make an offer on a condo.`) +
      h.h3("Manufactured homes") +
      h.p("A manufactured home, once called a mobile home, is built on a permanent steel frame to HUD's code. The Homebuyer Program does not take it. Palmetto Home Advantage takes doublewide or larger manufactured homes on a permanent foundation, usually with a credit score of at least 660. A doublewide is built in two sections; a single-wide does not qualify.") +
      h.cta("Houses and condos under $450,000", "Name the towns you like. An agent sends the houses and condos for sale there under SC Housing's price limit.", "Send me homes under $450,000", CONTACT, bg) },

    { h2: "Can you buy with no money down in Horry County?", toc: "No money down", id: "no-money-down", html: (bg) =>
      h.p("Yes, with a USDA or VA loan. SC Housing offers both with no down payment. A USDA loan needs a home inside USDA's area, and that area leaves out the coast.") +
      h.p("The part left out is the coastal strip from Little River through Myrtle Beach to Murrells Inlet, and inland past Carolina Forest and Socastee. It is less than a fifth of the county's land.") +
      usdaMap() +
      h.p(`We checked every house for sale at or under $450,000 in Horry County against USDA's map. About six in ten were inside USDA's area.`) +
      USDA_TABLE +
      h.p("Murrells Inlet counts only its homes in Horry County.") +
      h.p("A home near the edge can fall on either side, so we check each address on USDA's own lookup before you make an offer.") +
      h.p(`Our ${h.a("/buyers/va-loans/", "VA loan guide")} explains who can use a VA loan.`) +
      h.cta("Is a home you like inside USDA's area?", "Send us the address, and we check it on USDA's own lookup.", "Have us check the address", CONTACT, bg) },

    { h2: "Which SC Housing program fits you in Horry County?", toc: "Which program", id: "which-program", html: () =>
      h.p("Four SC Housing programs are open to Horry County buyers now. A fifth, Palmetto Heroes, is closed until its next round. The voucher program works only where the local housing authority takes part. Find the line that matches you.") +
      PICK_HTML +
      h.h3("Palmetto Home Advantage").replace("<h3 ", '<h3 id="palmetto-home-advantage" ') +
      h.p(`Palmetto Home Advantage counts only the borrowers' own income, not the whole household: up to ${money(PHA_INC)}, for any household size. SC Housing has no price limit for it, but the FHA, VA, USDA or conventional loan still has its own. A repeat buyer may hold at most two financed homes, the new one included. If you sell, refinance or move out within the 10${NB}years, you repay all of the help.`) +
      h.h3("Palmetto Heroes and Families with Disabilities") +
      h.p("Palmetto Heroes' 2026 round filled in about four weeks, after 272 loans. SC Housing has not published a date for the next round. A buyer needs a signed sales contract to get the help, so we start the home search before it opens.") +
      h.p("Families with Disabilities is open in every county, has no first-time buyer rule, and uses FHA, VA or USDA loans.") },

    { h2: "Is there down payment help from Horry County or Myrtle Beach?", toc: "Local help", id: "local-help", html: (bg) =>
      h.p("Not from the county or the cities directly. Horry County runs HUD's HOME program for Horry, Georgetown and Williamsburg counties, and that money goes to developers and nonprofits, not to buyers. Two other routes help buyers themselves.") +
      LOCAL_HTML +
      h.p("The bank grants go through banks that applied for them, and we find out which nearby banks still have money.") +
      h.h3("Can you use a bank grant and SC Housing's $10,000 together?") +
      h.p("Yes, if the grant's own rules allow it. SC Housing's checklist for the lender has a line for a grant from anyone else, and the lender puts the grant's approval letter in the file.") +
      h.cta("See if a bank grant is open near you", "Name the town, and we find out which banks near it still have grant money and what income they allow.", "Ask us about bank grants", CONTACT, bg) },

    { h2: "How do you apply for SC Housing's down payment help?", toc: "How to apply", id: "how-to-apply", html: () =>
      h.p("You apply through an SC Housing approved lender, in the five steps below. The lender handles the application and the reservation.") +
      h.h3("Is the $10,000 open now?") +
      h.p("Yes. SC Housing's program page offers the $10,000. The only program it lists as closed is Palmetto Heroes.") +
      h.p("The money is limited, and SC Housing pays it out while money lasts. Once the lender reserves your loan and the $10,000, SC Housing holds them for 60 days on an existing home or 120 days on a new one, and the lender can ask for more time.") +
      h.h3("The five steps") +
      STEPS +
      h.p("Our preferred lender is not on SC Housing's lender list for Horry County, so when one of these programs fits you, we introduce you to an approved lender.") +
      h.h3("If you still own a home somewhere else") +
      EXAMPLE +
      h.p(`Our first-time home buyer guide explains ${h.a("/buyers/first-time-home-buyer-myrtle-beach/", "the rest of the first-time buyer steps")}. If you are deciding where to look, our guide to the ${h.a("/buyers/affordable-places-to-live/", "most affordable places to live")} around Myrtle Beach describes each one.`) },
  ],
  faqTitle: "SC Housing questions",
  faq: [
    { q: "Do I have to be a first-time buyer in Horry County?", a: "No. Horry County is one of SC Housing's \"targeted\" counties, where the first-time buyer rule does not apply. A buyer who has owned a home before can use the $10,000 once that home is sold." },
    { q: "Can I use SC Housing's help on a new home from a builder?", a: "Yes, if the price is $450,000 or less. SC Housing has a form for the builder who sells the home. Its lender list for Horry County includes DHI Mortgage, Lennar Mortgage and NVR Mortgage Finance, the mortgage companies of the builders D.R. Horton, Lennar and NVR." },
    /* F16 (owner nit, round 3). */
    { q: "Can the seller pay part of my closing costs with SC Housing's help?", a: "Yes, within the limits of your FHA, VA, USDA or conventional loan. SC Housing's guide adds no limit of its own on help from the seller." },
    { q: "Who decides the interest rate on an SC Housing loan?", a: "SC Housing decides the rate on its own first mortgage. It is a fixed rate, posted every day for its approved lenders, and your lender locks it for you when it reserves the loan. SC Housing makes the loan with or without the $10,000, so we have the lender quote it both ways before you choose." },
    { q: "Can I get SC Housing's Made It Home! help or its tax credit in Horry County?", a: "No. SC Housing's Made It Home! help is only for new homes in five other cities, and its Mortgage Credit Certificate, a federal tax credit for buyers, has ended." },
  ],
  sources: [
    { name: "SC Housing programs", href: "https://schousing.sc.gov/homebuyers/programs-homebuyers" },
    { name: "SC Housing program guide", href: "https://schousing.sc.gov/sites/schousing/files/Documents/Homebuyers/Training-Material/COMBINED%20TRAINING%2003.2026.pdf" },
    { name: "2026/2027 limits", href: "https://schousing.sc.gov/sites/schousing/files/Documents/Homebuyers/2026-2027%20(LENDER)SC%20Housing%20Homebuyer%20Home%20Price%20and%20Income%20Limits%20(06.01.2026).pdf" },
    { name: "SC Housing Find a Lender", href: "https://schousing.sc.gov/homebuyers/find-lender?county=166" },
    { name: "HUD condo list", href: "https://entp.hud.gov/idapp/html/condlook.cfm" },
    { name: "USDA address lookup", href: "https://eligibility.sc.egov.usda.gov/eligibility/welcomeAction.do?pageAction=sfp" },
    { name: "Census income", href: "https://data.census.gov/table?q=B19013&g=050XX00US45051" },
    { name: "Census renter income", href: "https://data.census.gov/table?q=B25118&g=050XX00US45051" },
    { name: "SC Housing voucher homeownership", href: "https://schousing.sc.gov/homebuyers/programs-homebuyers/housing-choice-voucher-homeownership-program" },
    { name: "Horry County HOME program", href: "https://horrycountysc.gov/departments/community-development/grants/housing/home/" },
    { name: "SC Housing news", href: "https://schousing.sc.gov/news/sc-housings-palmetto-heroes-program-closes-26-registering-272-home-loans" },
  ],
  sourcesNote: "Homes for sale: Chapter3's count of MLS listings, in aggregate, by mailing address and list price; each placed on USDA's map. Not loan or tax advice.",
  afterSources: () => PHOTO_CREDIT + AFBA,
  bottomCta: { h2: "Find a home that fits SC Housing's limits", p: "Send us your household size and price range. We tell you which program fits, check each condo building's approval and each address on USDA's map, and send the homes that pass.", label: "Ask which program fits", href: CONTACT },
  keywords: "SC Housing down payment assistance, SC Housing income limits Horry County, down payment assistance Myrtle Beach, Palmetto Home Advantage, Palmetto Heroes, SC Housing homebuyer program requirements, forgivable down payment assistance South Carolina, USDA eligible areas Horry County",
  about: "SC Housing down payment assistance for home buyers in Horry County, South Carolina",
});
