/* /sell/out-of-state-buyers/ - how an owner who lives in another state sells a Grand Strand home without
 * coming back, what South Carolina holds back, where the price goes, what the owner must tell the buyer,
 * what happens to guest bookings, and what the county's sales say about buyers from other states.
 *
 * Batch 2026-10-d, Lane U. The page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-d/sell-out-of-state-buyers/facts.md (verified rows, and corrected
 * rows only in the verifier's safe wording, VERIFY.md; rows 31 to 41 are VERIFIED-BY-FIXER, for the lead
 * to re-check). Struck wording: sell-out-of-state-buyers-struck.json.
 * Every buyer figure is computed here from data/2026-10-d/sell-out-of-state-buyers/ (the county's deed
 * index for October 2025 through September 2026, matched to the county parcel file), never typed.
 * Review round 1 (REVIEW-1.md): raw counts, the town list, the home value and tax table, the movers'
 * figures and the 9 px signing diagram are cut.
 * Review round 2 (REVIEW-2.md): the seller who lives away comes first; the buyer data is one short block
 * at the end; the state ranking, the month chart, the Suffolk line, the ad-spend line, the FBI figure,
 * the deed office address, the notary-law detail and the 13-day story are cut.
 * Review round 3 (REVIEW-3.md): the lede is the answer; icons on the steps; what our agents do at
 * steps 3 and 4 (story bank: low-appraisal-reconsideration, no-vendor-names; row 40); a picture of who
 * is at the signing; the money path in its own section; guest bookings in their own section as a
 * timeline with the second notice; the FAQ answers only what the body does not; no hedges; "own from"
 * is gone; I-295 never splits at its hyphen (U+2011).
 * Final fix (REVIEW-FINAL.md): what our agent must do once the home is listed (row 43, SC Code 40-57-350);
 * how the deed travels (row 44, SC Bar EAO 05-16); who picks and pays the attorney (rows 40, 45, 46); who
 * holds the key; the online-notary answer cites SC Code 26-1-5 (row 47); the 1 in 4 homes line (row 6).
 * Sibling owners: /sell/capital-gains/ owns the refund detail and the calculator; /invest/out-of-state/
 * owns the buyer's side of a remote closing; /buyers/closing-costs/ owns the deed fee (registry
 * "deed-fee-payer"); /sell/rental-property/ owns the sale with a tenant in it.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));

const SELF = "/sell/out-of-state-buyers/";
const DIR = path.join(__dirname, "..", "data", "2026-10-d", "sell-out-of-state-buyers");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const S = read("out-of-state-buyers-summary.json").summary;

/* The one photo (rules/images.md): a USGS oblique aerial, public domain; record in this page's data folder,
   with the writer's check that the towers are HPR condo parcels inside North Myrtle Beach city. */
const PK = require(path.join(BB, "tools", "page-kit.js"));
const ph = PK.create({ h, photos: read("photos.json").photos, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "820px" });
const TOWERS = ph.aerial("north-myrtle-beach-oceanfront-condo-towers-2011", "Oceanfront condo towers in North Myrtle Beach, where more than half of buyers are from another state.");

/* An h3 with an id, so the steps can point at it. */
const h3id = (id, text, short) => h.h3(text).replace("<h3 ", `<h3 id="${id}" data-toc="${short}" `);
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const pct = (v) => `${Math.round(v)}%`;
/* The form's name with a no-break hyphen, so "I-" never ends a line (critic, round 3). */
const F295 = "Form I‑295";
/* Checks: the page's words say "about 3 in 10", "more than half", "about 1 in 4" and "about 1 in 10";
   stop the build if the file moves. */
if (S.all.sales !== 12125 || S.all.outside_sc !== 3603) throw new Error("summary: the matched sales or the outside count changed; reread the ledger rows 1 and 2");
if (!(S.by_type.condo.pct_outside_sc > 50) || Math.round(S.all.pct_outside_sc / 10) !== 3) throw new Error("summary: 3 in 10 or the condo half no longer holds");
if (Math.round(S.by_type.other.pct_outside_sc / 25) !== 1) throw new Error("summary: 'about 1 in 4' of other homes no longer holds");
/* Row 6: about 1 in 4 of every Horry home has its tax bill mailed outside South Carolina. */
if (!S.stock || Math.round(S.stock.all.pct_outside_sc / 25) !== 1) throw new Error("stock: 'about 1 in 4 homes' no longer holds; reread row 6");
const NMB = S.by_place["North Myrtle Beach city"], CONWAY = S.by_place["Conway city"];
if (!(NMB.pct_outside_sc > 50) || Math.round(CONWAY.pct_outside_sc) !== 10) throw new Error("by_place: 'more than half' in North Myrtle Beach or 'about 1 in 10' in Conway no longer holds; reread row 5");
/* Row 8: every month has buyers from other states; January (the fewest) is about 1 in 4 sales; October has the most. */
const MONTHS = Object.values(S.by_month);
if (MONTHS.length !== 12 || MONTHS.some((v) => !(v.outside_sc > 0))) throw new Error("by_month: 12 months, each with buyers from other states, expected; reread row 8");
const JAN = S.by_month["2026/01"], OCT = S.by_month["2025/10"];
if (!JAN || !OCT) throw new Error("by_month: January 2026 or October 2025 is missing; reread row 8");
if (Math.round(JAN.outside_sc / (JAN.sc + JAN.outside_sc) * 100 / 25) !== 1) throw new Error("by_month: 'about 1 in 4' in January no longer holds");
if (Math.min(...MONTHS.map((v) => v.outside_sc)) !== JAN.outside_sc) throw new Error("by_month: January is no longer the slowest month");
if (Math.max(...MONTHS.map((v) => v.outside_sc)) !== OCT.outside_sc) throw new Error("by_month: October no longer has the most out-of-state closings");

const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const T30_5 = "https://www.scstatehouse.gov/code/t30c005.php";
const T26_3 = "https://www.scstatehouse.gov/code/t26c003.php";
const T26_6 = "https://www.scstatehouse.gov/code/t26c006.php";
const T62_8 = "https://www.scstatehouse.gov/code/t62c008.php";
const T12_8 = "https://www.scstatehouse.gov/code/t12c008.php";
const T12_24 = "https://www.scstatehouse.gov/code/t12c024.php";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const T26_1 = "https://www.scstatehouse.gov/code/t26c001.php";
const T40_57 = "https://www.scstatehouse.gov/code/t40c057.php";
const EAO = (n) => `https://www.scbar.org/for-lawyers/quicklinks/legal-resources/ethics-advisory-opinions/ethics-advisory-opinion-${n}/`;
const T37_10 = "https://www.scstatehouse.gov/code/t37c010.php";
const I295 = "https://dor.sc.gov/sites/dor/files/forms/I295.pdf";
const I290 = "https://dor.sc.gov/sites/dor/files/forms/I290.pdf";
const SCDOR_RATE = "https://dor.sc.gov/news/information-about-h-4216";
const ROD_PRE = "https://www.horrycountysc.gov/media/404mgbzc/prereqs.pdf";
const DOE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const IRS701 = "https://www.irs.gov/taxtopics/tc701";
const IRS409 = "https://www.irs.gov/taxtopics/tc409";
const FIRPTA = "https://www.irs.gov/individuals/international-taxpayers/firpta-withholding";
const CFPB = "https://www.consumerfinance.gov/about-us/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/";

/* ---- Page CSS: work-arounds for three shared faults (NEEDS.md 8 to 10), scoped to this page ---- */
/* 1. The closing offer band. glass.js COMPACT_RULES light the first navy band with :not(:last-child);
      at the edge the IDX disclaimer is written in after the last band, so the last band turned light
      and its ivory text could not be read. The band with no section after it keeps the dark panel. */
const LAST = 'main#main>section[style^="background:var(--navy)"]:not(:has(~section))';
const DARK = "background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important";
const PAGE_CSS = `<style>${LAST}>.wrap{${DARK};display:block!important;text-align:center!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;border-radius:28px!important}`
  + `${LAST}>.wrap>h2{color:var(--ivory)!important}${LAST}>.wrap>p{color:rgba(244,239,232,.86)!important}`
  + `@media (max-width:699px){${LAST}>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  /* 2. The listing-search box was 340 px wide in a 320 px window (min-width:auto on a flex item). */
  + `main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important}main#main .hx-fb-q textarea{min-width:0;max-width:100%}`
  /* 3. The header's phone number ran 5 px past a 1024 px window. Between 1000 and 1120 px only its icon shows
        (the link keeps its label with the number). */
  + `@media (min-width:1000px) and (max-width:1120px){header .hdr-phone-num{display:none}}`
  /* 4. The H1 left "state." alone on its second line at 1024 and 320 px (critic, round 3). */
  + `main#main h1.detail-h1{text-wrap:balance}</style>`;

/* ---- Small line icons of our own, drawn on the same 24 px grid as tools/icons.js ---- */
const svg = (inner, size = 22) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
const IC = {
  home: icon("home", { size: 22, set: "glass" }),
  pen: svg('<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4M14 20h6"/>'),
  key: icon("key", { size: 22, set: "glass" }),
  law: svg('<path d="M12 4v16M8 20h8M5 7h14M7 7l-3 6.5a3 3 0 0 0 6 0zM17 7l-3 6.5a3 3 0 0 0 6 0z"/><circle cx="12" cy="4" r="1"/>'),
  stamp: svg('<path d="M9.5 3.5h5l-.8 6h3.8a2 2 0 0 1 2 2V14h-15v-2.5a2 2 0 0 1 2-2h3.8zM4.5 17.5h15M7 20.5h10"/>'),
  deed: svg('<path d="M6.5 3h8l4 4v14h-12zM14.5 3v4h4M9.5 12h6M9.5 15.5h6"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  person: svg('<path d="M4.5 21v-.8A6.2 6.2 0 0 1 10.7 14h2.6a6.2 6.2 0 0 1 6.2 6.2v.8"/><circle cx="12" cy="7.5" r="3.8"/>', 34),
};

/* ---- The steps of a sale from another state (rows 12, 13, 35, 36, 38, 40; story bank:
   low-appraisal-reconsideration, no-vendor-names) ---- */
const GLASS_CARD = "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -20px rgba(28,32,40,.35)";
const STEP_CSS = `<style>main#main .c3-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.4rem;padding:0;max-width:760px;display:grid;gap:.7rem}`
  + `main#main .c3-steps>li{counter-increment:s;position:relative;margin:0;padding:.95rem 1.1rem .9rem 3.6rem;border-radius:16px;${GLASS_CARD};color:var(--muted);line-height:1.65;font-size:var(--read,1.0625rem)}`
  + `main#main .c3-steps>li::before{content:counter(s);position:absolute;left:1rem;top:.95rem;width:1.9rem;height:1.9rem;border-radius:50%;background:linear-gradient(135deg,#c4783a,#d4894a);color:#fff;font-weight:700;font-size:1rem;display:flex;align-items:center;justify-content:center;font-family:var(--sans)}`
  + `main#main .c3-steps strong{display:flex;gap:.5rem;align-items:flex-start;color:var(--navy);font-weight:600;margin-bottom:.2rem}`
  + `main#main .c3-steps strong svg{flex:none;color:#91592b;margin-top:.15rem}`
  + `main#main .c3-steps .who{display:inline-block;margin-top:.35rem;font-size:.9rem;color:#8a5226;font-weight:600}`
  + `@media (max-width:699px){main#main .c3-steps>li{padding:.85rem .9rem .85rem 3.2rem}main#main .c3-steps>li::before{left:.8rem;top:.85rem;width:1.75rem;height:1.75rem}}</style>`;
const step = (ic, title, text, who) => `<li><strong>${ic}<span>${title}</span></strong>${text}${who ? `<br><span class="who">${who}</span>` : ""}</li>`;
const HOME = "Where you are: at home";
const STEPS = STEP_CSS + `<ol class="c3-steps">`
  + step(IC.home, "We price the home and show it to buyers.", "Our agent prices it to what sold near it and shows it to buyers and their agents.", HOME)
  + step(IC.pen, "You sign the offer and the contract from home.", "You sign them by e-signature on your phone or computer. In South Carolina that counts the same as ink.", HOME)
  + step(IC.key, "The buyer's inspector and appraiser visit the home.", `The inspector checks the home's condition, and the appraiser judges its value. They work for the buyer. Someone with a key lets them in, and you choose that person. See ${h.a("#key", "who holds the key")}. Low appraisals are rare here. When one comes in low, one of our agents sends recent sales nearby with a request to reconsider the value.`, HOME)
  + step(IC.law, "A South Carolina attorney supervises the closing.", `The deed is the paper that passes the home to the buyer. Only a lawyer may prepare one for someone else, so a lawyer here draws up yours. The contract can name the attorney and who pays. See ${h.a("#attorney", "who picks the attorney")}.`, HOME)
  + step(IC.stamp, "You sign the deed where you live.", `The closing attorney's office sends you the deed. You sign it before a notary near you and send it back. See ${h.a("#papers", "how the papers travel")}.`, "Where you are: a notary near you")
  + step(IC.deed, "The deed is recorded in Horry County.", "Recorded means filed in the county's public records. The recording date starts the 90-day count for any guest stays you have booked. The guest bookings section below gives each date.", HOME)
  + `</ol>`;

/* ---- Who is in the room at the signing (rows 13, 14, 33). HTML text at reading size, not SVG labels
   (the round 1 diagram had 9 px labels). ---- */
const SIGN_CSS = `<style>main#main .c3-sign{max-width:760px;margin:1rem 0 1.4rem;padding:1rem;border-radius:18px;${GLASS_CARD}}`
  + `main#main .c3-sign ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.6rem}`
  + `main#main .c3-sign li{margin:0;padding:.9rem .8rem;border-radius:14px;background:rgba(255,255,255,.7);text-align:center;color:var(--muted);font-size:.95rem;line-height:1.5}`
  + `main#main .c3-sign .face{display:flex;width:3.4rem;height:3.4rem;margin:0 auto .5rem;border-radius:50%;align-items:center;justify-content:center;color:#91592b;background:rgba(196,120,58,.12)}`
  + `main#main .c3-sign li.you .face{color:#fff;background:linear-gradient(135deg,#c4783a,#d4894a)}`
  + `main#main .c3-sign strong{display:block;color:var(--navy);font-weight:600;font-size:1rem;margin-bottom:.2rem}`
  + `main#main .c3-sign figcaption{margin-top:.75rem;color:var(--navy);font-size:.95rem;line-height:1.5;text-align:center}`
  + `@media (max-width:599px){main#main .c3-sign ol{grid-template-columns:1fr}main#main .c3-sign li{display:grid;grid-template-columns:3.4rem 1fr;gap:.2rem .8rem;text-align:left;align-items:center}main#main .c3-sign .face{grid-row:span 2;margin:0}}</style>`;
const seat = (cls, who, text) => `<li${cls ? ` class="${cls}"` : ""}><span class="face">${IC.person}</span><strong>${who}</strong><span>${text}</span></li>`;
const SIGNING = SIGN_CSS + `<figure class="c3-sign" aria-label="Who must be in the room when you sign the deed"><ol>`
  + seat("you", "You", `Sign the deed, and ${F295} if you use it.`)
  + seat("", "The notary", "Watches you sign and stamps the deed. Can also sign as your first witness.")
  + seat("", "One more adult", "Signs as your second witness. Bring someone who is not on the deed.")
  + `</ol><figcaption>The notary and both witnesses watch you sign. The notary may be one of the two witnesses.</figcaption></figure>`;

/* ---- Row 31, 32: the 2026 rate and one worked example, computed here ---- */
const RATE = 5.21, PRICE = 400000, GAIN = 100000;
const money = (v) => "$" + n0(v);
const held = (base) => money(base * RATE / 100);
const DEED_FEE = Math.ceil(PRICE / 500) * 1.85; /* row 17: $1.85 for each $500 */
const HOLD_TABLE = compareCards([
  { name: "Your main home, with the gain inside the federal exclusion", cells: { held: "Nothing", ex: "$0" } },
  { name: `Not your main home (or a gain above the exclusion), and you sign ${F295}`, cells: { held: `${RATE}% of your gain`, ex: held(GAIN) } },
  { name: `You do not sign ${F295}`, cells: { held: `${RATE}% of price minus selling costs`, ex: `Under ${held(PRICE)}` } },
], [{ key: "held", label: "What the buyer holds back" }, { key: "ex", label: `On a ${money(PRICE)} sale with a ${money(GAIN)} gain`, num: true }],
  { caption: "The hold-back when the seller lives in another state", nameLabel: "Your sale" });

/* ---- Where the price goes (rows 17, 21, 28, 31, 32): the same $400,000 sale, a rental with a $100,000
   gain and the form signed. No net figure: the payoff and the commission are the seller's own. ---- */
const PATH_CSS = `<style>main#main .c3-path{max-width:760px;margin:1rem 0 1.4rem;padding:.4rem 1rem;border-radius:18px;${GLASS_CARD}}`
  + `main#main .c3-path ol{list-style:none;margin:0;padding:0}`
  + `main#main .c3-path li{display:grid;grid-template-columns:2.4rem 1fr auto;gap:.2rem .8rem;align-items:center;margin:0;padding:.85rem 0;border-bottom:1px solid rgba(28,32,40,.1);color:var(--muted);line-height:1.5}`
  + `main#main .c3-path li:last-child{border-bottom:0}`
  + `main#main .c3-path .ic{display:flex;width:2.4rem;height:2.4rem;border-radius:50%;align-items:center;justify-content:center;color:#91592b;background:rgba(196,120,58,.12)}`
  + `main#main .c3-path strong{display:block;color:var(--navy);font-weight:600}`
  + `main#main .c3-path .amt{font-weight:700;color:var(--navy);white-space:nowrap;font-variant-numeric:tabular-nums;text-align:right}`
  + `main#main .c3-path li.end .ic{color:#fff;background:linear-gradient(135deg,#c4783a,#d4894a)}`
  + `main#main .c3-path figcaption{padding:.8rem 0 .4rem;color:var(--navy);font-weight:600}`
  + `@media (max-width:479px){main#main .c3-path li{grid-template-columns:2.4rem 1fr}main#main .c3-path .amt{grid-column:2;text-align:left}}</style>`;
const leg = (ic, title, text, amt, cls) => `<li${cls ? ` class="${cls}"` : ""}><span class="ic">${ic}</span><span><strong>${title}</strong>${text}</span>${amt ? `<span class="amt">${amt}</span>` : ""}</li>`;
const MONEY_PATH = PATH_CSS + `<figure class="c3-path"><figcaption>A ${money(PRICE)} sale of a rental with a ${money(GAIN)} gain</figcaption><ol>`
  + leg(IC.home, "The price", "What the buyer pays.", money(PRICE))
  + leg(IC.deed, "Deed recording fee", "The seller owes it: $1.85 for each $500 of the price.", "&minus;" + money(DEED_FEE))
  + leg(icon("tax", { size: 22, set: "glass" }), "State hold-back", `${RATE}% of the gain, with ${F295} signed. It counts toward your South Carolina tax.`, "&minus;" + held(GAIN))
  + leg(icon("dollar", { size: 22, set: "glass" }), "Your loan payoff, the commission and other closing costs", "Your own figures.", "")
  + leg(IC.check, "The rest is yours", "Confirm the account it goes to by phone first (below).", "", "end")
  + `</ol></figure>`;

/* ---- Guest bookings at a sale (row 38, with the second notice in 27-50-250(B)) ---- */
const TIME_CSS = `<style>main#main .c3-time{list-style:none;max-width:760px;margin:1rem 0 1.4rem;padding:0;display:grid;gap:.55rem}`
  + `main#main .c3-time li{display:grid;grid-template-columns:12rem 1fr;gap:.3rem 1rem;align-items:start;margin:0;padding:.85rem 1rem;border-radius:14px;${GLASS_CARD};color:var(--muted);line-height:1.55}`
  + `main#main .c3-time .when{color:#8a5226;font-weight:700;font-size:.95rem}`
  + `@media (max-width:599px){main#main .c3-time li{grid-template-columns:1fr}}</style>`;
const when = (w, t) => `<li><span class="when">${w}</span><span>${t}</span></li>`;
const BOOKINGS = TIME_CSS + `<ol class="c3-time" aria-label="Guest bookings when a rental home is sold">`
  + when("Before the contract is signed", "The buyer gets, in writing, every future date the home is booked.")
  + when("Within 14 days of the contract", "The rental company gets the buyer's name and address in writing.")
  + when("Within 14 days after the sale", "The rental company gets the buyer's name, address and the date the deed was recorded.")
  + when("Up to 90 days after recording", "Guest stays that begin in this time go ahead. The buyer must honor them.")
  + when("Stays that begin later", "They cannot be enforced, and the guest is due a refund within 45 days after the recording.")
  + `</ol>`;

/* ---- The buyer data, one block (rows 2, 3, 5, 7) ---- */
const SHARE_CHART = G.bars([
  { name: "Condos", value: S.by_type.condo.pct_outside_sc, valueText: pct(S.by_type.condo.pct_outside_sc) },
  { name: "Every home sold", value: S.all.pct_outside_sc, valueText: pct(S.all.pct_outside_sc), reference: true },
  { name: "Other homes", value: S.by_type.other.pct_outside_sc, valueText: pct(S.by_type.other.pct_outside_sc) },
], { caption: "Buyers from another state, Horry County", nameLabel: "Kind of home", valueLabel: "share of buyers", max: 100, format: pct,
  note: "A year of Horry County deeds, matched to the county's tax records: buyers whose tax bill goes to another state or country." });
const LOO = S.same_place_leave_one_out.all;
const PAID_CHART = G.bars([
  { name: "Buyers from other states", value: LOO.outside_sc.pct_above_others_median, valueText: pct(LOO.outside_sc.pct_above_others_median) },
  { name: "Buyers from South Carolina", value: LOO.sc.pct_above_others_median, valueText: pct(LOO.sc.pct_above_others_median), reference: true },
], { caption: "Paid more than the typical price in their building or subdivision", nameLabel: "Buyer", valueLabel: "share who paid more", max: 100, format: pct,
  note: "Homes sold by their owners, not by builders." });

/* The photo credits (NEEDS.md 11): photos.js adds a second credit line that repeats the first, and cuts the
   schema's creditText at the first period ("U.S"). Both are fixed here for this page. */
const credits = () => ph.credits()
  .replace('<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.</div>', "")
  .split('"creditText":"U.S"').join('"creditText":"U.S. Geological Survey"');

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "Selling a Myrtle Beach Home From Out of State | Chapter3",
  description: "Sell a Myrtle Beach home from another state without coming back: the six steps, who must see you sign the deed, and what South Carolina holds back.",
  ogTitle: "Selling a Grand Strand home from another state",
  crumb: "Selling From Out of State",
  eyebrow: "Selling",
  h1: "Sell your Grand Strand home from another state.",
  h1em: "You do not have to come back.",
  sub: "Your Horry County home can sell while you stay in your own state. You sign the deed before a notary there, and the closing here goes ahead without you.",
  heroCta: { title: "Live in another state? Get a price and a closing plan for your home.", label: "Send me a price and plan", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    `None of the six steps needs you in South Carolina. We price and show the home, and you sign the contract online. A South Carolina attorney supervises the closing, where the home changes hands.`,
    `The buyer holds back part of the price for state income tax, unless it was your main home and your gain, or profit, is tax-free under federal law. For 2026, it is ${RATE} percent of your gain if you sign the state's ${F295}, or of the price less your selling costs if you do not.`,
    `About 3 in 10 buyers here are from another state, and we found no sign that they pay more than local buyers.`,
  ],
  sections: [
    { h2: "Can you sell a Grand Strand home without coming back?", toc: "Selling from away", id: "sell-from-away", html: (bg) =>
      PAGE_CSS +
      h.p(`Yes. About 1 in 4 homes in Horry County has its tax bill mailed outside South Carolina. Each step below says where you are for it.`) +
      STEPS +
      h3id("papers", "How the deed gets to you and back", "how the papers travel") +
      h.p(`The closing attorney's office sends you the deed and the other closing papers. You sign them before a notary where you live and send them back to that office.`) +
      h.p(`The South Carolina Bar's ethics committee calls this a closing by mail. No law requires you to attend the closing. For the attorney's own client, the attorney must review every paper and answer questions by phone, fax or email.`) +
      h.p(`Send the signed papers back with a carrier that tracks the package. The office then records the deed in Horry County.`) +
      h.h3("Who must be there when you sign the deed") +
      SIGNING +
      h.h3("Can you use an online notary from your state?") +
      h.p(`Do not plan on it. South Carolina's own notary law defines appearing before a notary as being in each other's ${h.a(T26_1, "physical presence")}. The state has no video notarization of its own, so sign in person.`) +
      h3id("attorney", "Who picks and pays the closing attorney", "who picks the attorney") +
      h.p(`The sales contract can name the closing attorney and say who pays the attorney's fees. You and the buyer agree on both. When the buyer has a home loan, the lender must ask the buyer which attorney to use and follow that choice.`) +
      h.p(`That attorney works for the buyer. An attorney who works for one side should not advise the other side, except to get a lawyer. For advice of your own, hire your own South Carolina attorney. We work with plenty of attorneys here and can recommend some.`) +
      h3id("key", "Who holds the key", "who holds the key") +
      h.p(`You decide. Someone must let in the buyer's inspector and appraiser and the agents who show the home. Name that person in your listing agreement, the contract you sign with us to sell the home. South Carolina law requires our agent to carry out the terms of that agreement.`) +
      h.h3("If you would rather someone sign for you") +
      h.p(`You can name a person you trust to sign for you, with a power of attorney, a signed paper that lets that person act for you. One made under South Carolina law is witnessed and notarized, and one made under your own state's law can also be valid. Recording it in Horry County costs $25.`) +
      h.cta("The signing steps for the state you live in", "Tell us where you live, where the home is and who has a key. We send the steps for signing from your state.", "Send me the signing steps", "/contact/", bg) },

    { h2: "What does our agent do once your home is listed?", toc: "What our agent does", id: "agent", html: () =>
      h.p(`Once you sign the listing agreement, South Carolina law lists what a seller's agent must do. Our agent must:`) +
      h.ul([
        "carry out the terms of the listing agreement;",
        "seek a sale at your price and terms, or at a price and terms you accept;",
        "bring you every written offer and counteroffer promptly, even after you are under contract;",
        "tell you every material problem with the sale that the agent knows about;",
        "tell you to get expert advice on anything beyond an agent's expertise;",
        "account promptly for any money or property received for you;",
        "keep private what you tell us that could hurt your sale, except in the cases the law allows, such as your written consent.",
      ]) +
      h.p(`Each step above says what we add to that, from pricing to the appraisal. None of it needs you in South Carolina.`) },

    { h2: "What does South Carolina hold back at closing when you live out of state?", toc: "What the state holds back", id: "withholding", html: (bg) =>
      h.p(`When your permanent home is in another state, the buyer must hold back part of the price for South Carolina income tax, unless the sale is exempt. A main home whose gain is inside the federal exclusion is exempt. The buyer sends it to the South Carolina Department of Revenue. If the closing attorney's office holds it back, that office must send it.`) +
      h.p(`For a sale closed in 2026, the rate is ${RATE} percent. It is the state's top income tax rate for the year of the sale, so a sale that closes in a later year may use a different rate. We can tell you the rate for the year your sale will close.`) +
      h.p(`Your gain is what you get from the sale less what the home cost you.`) +
      HOLD_TABLE +
      h.p(`The amount held back is never more than the cash you would get at closing.`) +
      h.h3("Does the main-home exclusion cover you?") +
      h.p(`Only if it was your main home. The federal main-home exclusion leaves up to $250,000 of gain out of your income, or $500,000 for a married couple filing jointly. You must have owned and lived there 2 of the last 5 years, with no exclusion used on another home in the 2 years before the sale. On a joint return, both of you must have lived there. A rental or a second home does not get it.`) +
      h.h3(`${F295}: your sworn statement`) +
      h.p(`${F295} is a sworn statement on a South Carolina tax form. On it you state your gain, or that the home was your main home. You sign it before a notary, so you can sign it at the same visit as the deed. You give it to the buyer and keep a copy with your tax records.`) +
      h.h3("Do you get back what was held back?") +
      h.p(`You file a South Carolina return for the year of the sale, and the amount held back counts toward the tax you owe there. If more was held back than you owe, you can ask the state for the difference as a refund. To run your own numbers, use the calculator in our ${h.a("/sell/capital-gains/", "capital gains and withholding guide")}.`) +
      h.p(`A Canadian owner who is not a U.S. citizen or resident also faces a separate federal hold-back under FIRPTA, generally 15 percent of the price. Our page for ${h.a("/invest/canadian-buyers/", "Canadian owners")} covers it. Selling a house you inherited from far away? Our ${h.a("/sell/inherited-house/", "inherited house guide")} covers that sale.`) +
      h.cta("How much will the buyer hold back?", `Tell us what you paid, what you expect to sell for and whether it was your main home. We work out the hold-back with ${F295} and without it.`, "Have us figure the hold-back", "/contact/", bg) },

    { h2: "Where does the price go at closing?", toc: "Where the price goes", id: "price", html: () =>
      h.p(`The deed recording fee and, unless it was your main home, the state hold-back come out of the price at closing. The example below is the same sale as in the table.`) +
      MONEY_PATH +
      h.p(`Our ${h.a("/sell/net-proceeds/", "net proceeds calculator")} adds your loan payoff and the rest of your closing costs. Real estate commissions are negotiable between you and the brokerage.`) +
      h.h3("Keep your money safe") +
      h.p(`Confirm the account your money goes to with the closing attorney's office by phone, on a number you agreed on in advance. Never follow wire or bank instructions in an email.`) },

    { h2: "What must you tell a buyer about a home you rarely see?", toc: "Your disclosure", id: "disclosure", html: (bg) =>
      h.p(`Tell the buyer what you know. You do not have to report what you do not know. You give the buyer ${h.a("/sell/fsbo/#paperwork", "South Carolina's written disclosure statement")}, the same as an owner who lives next door. On any item you do not know, you can mark that you make no representation, which means you are not saying either way.`) +
      h.p(`What you do know, you must tell. An owner who knowingly gives false, incomplete or misleading information is liable to the buyer for the damage. For a condo, the statement covers your unit, not the parts of the building everyone shares. As your listing agent, we must tell you in writing what this law asks of you.`) +
      h.h3("Sales that need no statement") +
      h.ul(["a sale by the person settling an estate, or by a trustee for a trust;", "a sale to a spouse, a child or another direct relative;", "the first sale of a home no one has lived in;", "a sale where both sides agree in writing to skip it."]) +
      h.cta("South Carolina's disclosure form, by email", "Tell us the home's address. We email you South Carolina's disclosure statement now, so you see each question before you list.", "Send me the disclosure form", "/contact/", bg) },

    { h2: "What happens to your guest bookings when you sell?", toc: "Guest bookings", id: "bookings", html: () =>
      h.p(`If you rent the home to guests, South Carolina law says what happens to each booking, and when the buyer and your rental company must hear about it. Your disclosure statement must also say if a lease or a contract with a rental company will still be in place at closing.`) +
      BOOKINGS +
      h.p(`Selling a home with a long-term tenant in it? Our ${h.a("/sell/rental-property/", "rental property guide")} covers the lease.`) },

    { h2: "Do out-of-state buyers pay more for Grand Strand homes?", toc: "Who buys", id: "who-buys", html: () =>
      h.p(`Buyers from other states paid what their neighbors paid. In the same building or subdivision, they and buyers from South Carolina paid the same typical price. About half of each group paid more than that price, and half paid less.`) +
      PAID_CHART +
      h.p(`Some sellers expect a buyer from a pricier state to pay more. We price your home to what sold near it, the same as for a local buyer.`) +
      SHARE_CHART +
      h.p(`Condos draw the most buyers from other states: more than half, against about 1 in 4 buyers of other homes. Near the ocean the share is higher. In the city of North Myrtle Beach it was more than half; inland in Conway, about 1 in 10. These buyers close here all year, so list your home when it is ready.`) +
      ph.css() + TOWERS },
  ],
  faqTitle: "Selling from out of state: questions",
  faq: [
    { q: "Is anything held back if I sell at a loss?", a: "Not if you sign Form I‑295. The hold-back is figured on your gain, and a home sold for less than it cost you has no gain. Without the form, it is figured on the price less your selling costs." },
    { q: "Does the notary have to be from South Carolina?", a: "No. A notary in the state where you live can notarize the deed, and the act counts the same as a South Carolina notary's. The notary writes in their state and the date their commission ends." },
    { q: "Do I pay unpaid HOA dues at closing?", a: "Usually, yes. Unpaid dues are put as a lien on the home and taken out of the seller's money at closing. Our agents check for them before closing, so they do not surprise you." },
    { q: "Is fall a bad time to sell to out-of-state buyers?", a: "No. More buyers from other states closed in October than in any other month. Even in January, the slowest month, about 1 in 4 buyers came from another state." },
  ],
  sources: [
    { name: "Deeds", href: DEEDS },
    { name: "Parcels", href: PARCELS },
    { name: "Doe v. McMaster", href: DOE },
    { name: "SC Code 30-5", href: T30_5 },
    { name: "26-3", href: T26_3 },
    { name: "26-6", href: T26_6 },
    { name: "62-8", href: T62_8 },
    { name: "12-8-580", href: T12_8 },
    { name: "12-24", href: T12_24 },
    { name: "27-50", href: T27_50 },
    { name: "37-10-102", href: T37_10 },
    { name: "40-57-350", href: T40_57 },
    { name: "26-1-5", href: T26_1 },
    { name: "SC Bar 05-16", href: EAO("05-16") },
    { name: "06-11", href: EAO("06-11") },
    { name: "00-17", href: EAO("00-17") },
    { name: "SC tax rate", href: SCDOR_RATE },
    { name: "Form I-295", href: I295 },
    { name: "Form I-290", href: I290 },
    { name: "Horry deeds office", href: ROD_PRE },
    { name: "IRS 701", href: IRS701 },
    { name: "IRS 409", href: IRS409 },
    { name: "IRS FIRPTA", href: FIRPTA },
    { name: "CFPB", href: CFPB },
  ],
  afterSources: () => credits(),
  pageImages: () => (ph.pageImages() || []).map((o) => (o.creditText === "U.S" ? Object.assign({}, o, { creditText: "U.S. Geological Survey" }) : o)),
  sourcesNote: "Buyers: a year of county sales matched to tax-bill addresses. Not legal or tax advice.",
  bottomCta: { h2: "What would your home sell for?", p: "Tell us the address. We send what similar homes near yours sold for in the past year.", label: "Have us price your home", href: "/contact/" },
  keywords: "selling house out of state, sell house from another state South Carolina, out of state home buyers Myrtle Beach, South Carolina nonresident seller withholding, Form I-295, sell house remotely South Carolina, online notary South Carolina deed, FIRPTA",
  about: "Selling a home in Myrtle Beach and Horry County, South Carolina, while living in another state, and the buyers from other states",
});
