/* /buyers/retirees/ - retiring to Myrtle Beach: whether it is a good place to retire, what a retired week is
 * like, the four 55+ communities we have guides for (what each is like, then the drives, the storm zone and the
 * price), hospitals, hurricanes, the weather, what a house costs a year at 65, and how South Carolina taxes
 * retirement income under the 2026 law.
 *
 * Batch 2026-11-a, Lane U. Version 2, review round 1 (critic, reader, owner's eye): REVIEW-1.md in
 * Blog-Brain batches/2026-11-a/buyers-retirees/. Reader and must-answers: must-answer.md and PLAN.md there.
 * Facts: facts.md there, VERIFIED and CORRECTED rows only, at their corrected values (VERIFY.md,
 * buyers-retirees-struck.json), and the round 1 rows 51 to 72 (carried from verified sibling ledgers, or
 * VERIFIED-BY-FIXER, for the lead to re-check). Every chart and table is built from
 * data/2026-11-a/buyers-retirees/: page-data.json, examples.json and sctax.js (the same 2026 income tax rules
 * as build_examples.py, checked against its three examples below).
 * Round 1 changes: the headline leads with what retiring here gives (no state tax on Social Security), not
 * with costs; places come before the tax detail; each community entry says what life there is like first,
 * then the drives, the storm zone, the price and the fee; the share chart, the hospital cards, the storm cards
 * and the weather cards are folded into sentences; the tax rules list is cut (the calculator and the three
 * examples carry it); one offer per community, no repeated "price my year" boxes.
 * Round 2 (REVIEW-2.md): the short answer has no bare "Yes"; the good-place lead is cut (the cards answer it);
 * the modest-income line is in the short answer and card 3 only; the McLeod line gives the drive from Del Webb at
 * Grande Dunes (row 73, drives-mcleod-carolina-forest.json); the Grande Dunes tax is scoped to before the
 * exemption; the New York story carries its "not a promise" label again (RULES SHAPE-6).
 * Stories used as recorded: ny-client-tax-drop, off-season-open. Not used: blackmoor-to-seasons (no point on
 * this page; it stays on the 55+ hub).
 * Not printed: owners' mailing states (row 28), any count of hospitals with an ER (row 34).
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

const DATA = path.join(__dirname, "..", "data", "2026-11-a", "buyers-retirees");
const PD = JSON.parse(fs.readFileSync(path.join(DATA, "page-data.json"), "utf8"));
const EX = PD.examples;
const SCTAX_SRC = fs.readFileSync(path.join(DATA, "sctax.js"), "utf8").replace(/^if \(typeof module.*$/m, "");
/* The calculator runs the same function as this check: the three ledger examples (rows 11 to 13). */
const c3ScTax = new Function(SCTAX_SRC + "; return c3ScTax;")();
EX.income_tax_2026.forEach((e) => {
  const p1 = e.people[0], p2 = e.people[1] || {};
  const r = c3ScTax({ joint: e.joint, age1: p1.age, age2: p2.age, ss: e.social_security, ret1: p1.retirement || 0, ret2: p2.retirement || 0, mil: p1.military || 0 });
  if (Math.abs(r.tax - e.sc_income_tax_2026) > 0.005) throw new Error(`sctax.js disagrees with examples.json: ${e.name}`);
});

const IMG_DIR = path.join(__dirname, "..", "chapter3realty", "images", "2026-11-a", "buyers-retirees");
fs.mkdirSync(IMG_DIR, { recursive: true });
const kit = PK.create({ h, theme: "glass", photos: JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "photos.json"), "utf8")).photos,
  mapDir: IMG_DIR, mapSrc: "/images/2026-11-a/buyers-retirees" });
const { placesMap, glance } = kit;
const ph = kit.photoSet({ aerialWidth: "620px" });

const SELF = "/buyers/retirees/";
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r10 = (v) => "$" + (Math.round(v / 10) * 10).toLocaleString("en-US");
const pct = (v) => Math.round(v * 100);
/* A number and its unit stay on one line (critic, round 1: "$0 to / $5,340" at 390 px). */
const nw = (t) => `<span style="white-space:nowrap">${t}</span>`;

/* Sources a reader can open. */
const ACT110 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/4216.htm";
const IL2620 = "https://dor.sc.gov/sites/dor/files/policies/IL26-20.pdf";
const T12_6 = "https://www.scstatehouse.gov/code/t12c006.php";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const ZONES = "https://www.scemd.org/prepare/know-your-zone/";
const ANNEX_C = "https://www.scemd.org/media/2202/2026-annex-c-evacuation-zones-and-clearance-times.pdf";
const CARE = "https://www.medicare.gov/care-compare/";
const NOAA = "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals";
const ACS = "https://data.census.gov/table/ACSST1Y2025.S0101?g=050XX00US45051";
const HOPA = "https://www.law.cornell.edu/uscode/text/42/3607";
const DOI = "https://doi.sc.gov/614/Cost-of-Homeowners-Insurance";
const PASSPORT = "https://www.myrtlebeachgolfpassport.com/memberships/annual-membership/";
const PINES = "https://www.cityofmyrtlebeach.com/i_want_to/find/whispering_pines_golf_course.php";
const ROUTES = "https://www.flymyrtlebeach.com/flight-information/route-map/";

/* ---------------------------------------------------------------------------- */
/* Data, from page-data.json                                                       */

const PT = EX.property_tax;                               // row 23
const T64 = r10(PT.legal_residence_under_65), T65 = r10(PT.legal_residence_65_homestead), T2ND = r10(PT.second_home_or_rental);
const YEAR65 = r10(PT.legal_residence_65_homestead + PT.stormwater_fee);   // rows 23, 24
const C = Object.fromEntries(PD.communities.map((c) => [c.name, c]));
const MT = C["Myrtle Trace"], SPC = C["Seasons at Prince Creek West"], GD = C["Del Webb at Grande Dunes"], NMB = C["Del Webb North Myrtle Beach"];
const ORDER = [MT, SPC, GD, NMB];
const OUTSIDE = ORDER.filter((c) => c.evacuation_zone === "none").length;
if (OUTSIDE !== 3 || SPC.evacuation_zone !== "C") throw new Error("zones changed: rewrite the storm lines");
const mins = ORDER.map((c) => c.hospital.minutes);       // row 35, NMB at its page's 10 minutes
if (Math.max(...mins) !== 10 || Math.min(...mins) !== 3) throw new Error("hospital minutes changed: rewrite the tiles and the hospital lines");
/* The share of homes taxed as a full-time home (rows 25, 26, corrected), as words in each entry. */
const share = (c) => { const p = pct(c.full_time_share); return p >= 90 ? "More than 9 in 10" : p >= 87 ? "Nearly 9 in 10" : "More than 8 in 10"; };
const OL = PD.one_level;                                  // row 45, re-pulled on build day
const OL_TOTAL = Math.round(OL.total / 100) * 100, OL_SHARE = OL.under_400k / OL.total;
if (OL_SHARE < 0.6 || OL_SHARE > 0.73) throw new Error("one-level share moved off two in three: rewrite the line");
const IN55 = PD.communities.reduce((t, c) => t + parseInt(String(c.for_sale).replace(/\D/g, ""), 10), 0);   // row 46
/* Most and fewest under $400,000 among the towns in the chart (critic, round 1: a tie at the low end). */
const byUnder = OL.towns.slice().sort((a, b) => b.under_400k - a.under_400k);
const MOST = byUnder[0].town, LOWTWO = byUnder.slice(-2).map((t) => t.town).reverse();
if (MOST !== "Conway" || byUnder.slice(-2)[1].under_400k - byUnder.slice(-2)[0].under_400k > 5) throw new Error("the town order changed: rewrite the most and fewest line");

/* Row 11 to 13: the three worked examples. */
const [EX1, EX2, EX3] = EX.income_tax_2026;
const taxText = (v) => (v === 0 ? "$0" : `about ${r10(v)}`);

/* ---------------------------------------------------------------------------- */
/* Visuals                                                                         */

/* The tax on one $400,000 house, three ways (row 23). */
const TAX_CHART = G.bars([
  { name: "You live in it, 65 or older", value: PT.legal_residence_65_homestead, valueText: T65, feature: "with the $50,000 exemption" },
  { name: "You live in it, under 65", value: PT.legal_residence_under_65, valueText: T64, feature: "the 4 percent rate" },
  { name: "A second home or a rental", value: PT.second_home_or_rental, valueText: T2ND, feature: "the 6 percent rate", reference: true },
], { caption: "Property tax a year on one $400,000 house outside the city limits", nameLabel: "How the house is used", featureLabel: "rate", valueLabel: "tax a year",
  note: "Horry County's 2026 tax rates, in the county outside the city limits. Inside a city, the city's tax is added." });

/* One-level houses for sale by town, under $400,000 (row 45, aggregate counts of active listings). */
const OL_CHART = G.bars(OL.towns.map((t) => ({ name: t.town, value: t.under_400k, valueText: `${t.under_400k}`, feature: `${t.total} in all` })),
  { caption: "One-level houses for sale under $400,000, in seven mailing towns", nameLabel: "Town", featureLabel: "one-level houses for sale at any price", valueLabel: "under $400,000",
    format: (v) => String(v), compact: true, phoneList: true,
    note: "Houses for sale on the MLS on the day this page was built, counted by the town in their mailing address. The count changes every day." });

/* The decision cards: the reader finds their own line. */
const { icon } = require(path.join(BB, "tools", "icons.js"));
const decide = (rows) => "<style>main#main .c3-decide{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(17rem,1fr));gap:.75rem;max-width:880px}"
  + "main#main .c3-decide li{margin:0;padding:1rem 1.05rem 1.05rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.55));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 28px -16px rgba(28,32,40,.35)}"
  + "main#main .c3-decide .q{display:flex;align-items:center;gap:.6rem;color:var(--navy);font-weight:600;font-size:var(--read,1.0625rem);line-height:1.4;margin:0 0 .45rem}"
  + "main#main .c3-decide .q .i{flex:none;display:flex;width:2.3rem;height:2.3rem;border-radius:50%;align-items:center;justify-content:center;color:var(--brass-ink);background:rgba(196,120,58,.12)}"
  + "main#main .c3-decide .a{color:var(--muted);line-height:1.6;margin:0}"
  + "@media (prefers-reduced-transparency:reduce){main#main .c3-decide li{background:#fbf8f3}}</style>"
  + `<ul class="c3-decide" role="list">` + rows.map((r) => `<li><p class="q"><span class="i" aria-hidden="true">${icon(r.icon, { size: 22 })}</span><span>If ${r.ifText}</span></p><p class="a">${r.then}</p></li>`).join("") + "</ul>";
const DECIDE = decide([
  { icon: "home", ifText: "you will live here most of the year", then: "Apply for the lower tax rate on a home you live in, called the 4 percent rate, as soon as you close. At 65, apply for the $50,000 exemption too: it takes $50,000 off the value you are taxed on." },
  { icon: "calendar", ifText: "it will be a second home for a few years first", then: `A second home pays the higher rate: about ${T2ND} a year on a $400,000 house, until it becomes your legal home.` },
  { icon: "dollar", ifText: "you live on Social Security and a modest pension", then: `You may owe no South Carolina income tax. The ${h.a("#income-tax", "calculator below")} works out yours.` },
  { icon: "beach", ifText: "you want to live near the beach", then: `Each of the four 55+ communities below is 4 to 15 minutes by car from the beach.` },
  { icon: "storm", ifText: "you would rather not plan a hurricane evacuation", then: "Three of the four 55+ communities are outside every hurricane evacuation zone." },
]);

/* The three 2026 income tax examples (rows 11 to 13). Short headers, so a 940 px table does not wrap them. */
const INCOME_TABLE = compareCards([
  { name: "Couple, both 66", cells: { ss: money(EX1.social_security), other: `${money(EX1.people[0].retirement)} private pension`, tax: taxText(EX1.sc_income_tax_2026) } },
  { name: "Single, 67", cells: { ss: money(EX2.social_security), other: `${money(EX2.people[0].retirement)} New York public pension`, tax: taxText(EX2.sc_income_tax_2026) } },
  { name: "Couple, 60 and 58", cells: { ss: "None", other: `${money(EX3.people[0].military)} military retirement pay`, tax: taxText(EX3.sc_income_tax_2026) } },
], [{ key: "ss", label: "Social Security", num: true }, { key: "other", label: "Other income" }, { key: "tax", label: "State tax", num: true }],
{ caption: "Three example households a year, under the 2026 rules", nameLabel: "Example" });

/* The calculator: the 2026 estimate, the function in sctax.js. On a phone each label sits above its box
   (critic, round 1: labels wrapped to five lines beside 8.2rem boxes at 320 px). */
const LAB = 'class="c3-rl" style="display:flex;justify-content:space-between;align-items:center;gap:.8rem;color:rgba(244,239,232,.92);font-family:var(--sans);font-size:1rem;line-height:1.3"';
const IN = 'style="width:8.2rem;flex:none;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.4);border-radius:8px;color:#f4efe8;font-family:var(--sans);font-size:1rem;padding:.5rem .6rem;text-align:right"';
const num = (id, label, v, step) => `<label ${LAB}><span>${label}</span><input id="${id}" type="number" inputmode="numeric" min="0" step="${step}" value="${v}" oninput="c3Ret()" ${IN}></label>`;
const CALC = `<div class="c3-retcalc c3-calc-box" style="background:var(--navy);background-image:linear-gradient(160deg,rgba(42,48,64,.97),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14);border-radius:18px;padding:1.4rem 1.3rem 1.3rem;margin:1.6rem 0;max-width:620px;box-shadow:0 26px 60px -30px rgba(28,32,40,.6)">`
  + `<p style="font-size:.85rem;letter-spacing:.12em;text-transform:uppercase;color:var(--brass-2);margin:0 0 .4rem;font-family:var(--sans);font-weight:600">Your 2026 South Carolina income tax</p>`
  + `<p style="color:rgba(244,239,232,.8);font-family:var(--sans);font-size:1rem;line-height:1.5;margin:0 0 1rem">Type in your own numbers for one year.</p>`
  + `<div style="display:grid;gap:.7rem">`
  + `<label ${LAB}><span>Filing</span><select id="rtJoint" onchange="c3Ret()" ${IN.replace("text-align:right", "text-align:left")}><option value="1" selected>Married</option><option value="0">Single</option></select></label>`
  + num("rtAge1", "Your age", 66, 1) + num("rtAge2", "Your spouse's age", 66, 1)
  + num("rtSs", "Social Security, both of you ($)", 40000, 1000)
  + num("rtRet1", "Your pension, IRA or 401(k) ($)", 30000, 1000) + num("rtRet2", "Your spouse's pension, IRA or 401(k) ($)", 0, 1000)
  + num("rtMil", "Military retirement pay ($)", 0, 1000) + num("rtOther", "Other income, such as interest or wages ($)", 0, 1000)
  + `</div>`
  + `<div style="display:flex;justify-content:space-between;gap:1rem;align-items:baseline;border-top:1px solid rgba(244,239,232,.22);margin-top:1.1rem;padding-top:1rem;font-family:var(--sans);color:rgba(244,239,232,.92)"><span>Estimated state income tax</span><strong id="rtTax" style="color:var(--brass-2);font-family:var(--serif);font-size:1.9rem;line-height:1">$0</strong></div>`
  + `<p id="rtSay" aria-live="polite" style="font-family:var(--sans);color:rgba(244,239,232,.85);line-height:1.55;margin:.6rem 0 0;font-size:1rem">Your deductions cover all of your South Carolina income.</p>`
  + `</div>`
  + `<script>${SCTAX_SRC}function c3Ret(){var g=function(id){var e=document.getElementById(id);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0};`
  + `var j=document.getElementById("rtJoint"),joint=j&&j.value==="1",s2=document.getElementById("rtAge2"),r2=document.getElementById("rtRet2");if(s2)s2.disabled=!joint;if(r2)r2.disabled=!joint;`
  + `var r=c3ScTax({joint:joint,age1:g("rtAge1"),age2:g("rtAge2"),ss:g("rtSs"),ret1:g("rtRet1"),ret2:g("rtRet2"),mil:g("rtMil"),other:g("rtOther")});`
  + `var m=function(n){return "$"+Math.round(n).toLocaleString("en-US")};var t=document.getElementById("rtTax"),s=document.getElementById("rtSay");if(!t||!s)return;t.textContent=m(r.tax);`
  + `s.textContent=r.taxable<=0?"Your deductions cover all of your South Carolina income.":"South Carolina taxes "+m(r.taxable)+" of your income after its deductions. Social Security is not counted."}`
  + `document.addEventListener("DOMContentLoaded",c3Ret);</script>`
  + `<style>main#main .c3-retcalc input:disabled{opacity:.45}`
  + `@media (max-width:520px){main#main .c3-retcalc .c3-rl{flex-wrap:wrap!important;gap:.35rem!important}main#main .c3-retcalc .c3-rl>span{flex:1 1 100%}main#main .c3-retcalc input,main#main .c3-retcalc select{width:100%!important}}</style>`;

/* One map of the four communities and the hospital nearest each (rows 34, 35; geocodes in raw/geocodes.json).
   The North Strand emergency room is in the Del Webb North Myrtle Beach entry, not on the map: its pin
   touched the community's pin at 390 px (critic, round 1). */
const GEO = JSON.parse(fs.readFileSync(path.join(DATA, "raw", "geocodes.json"), "utf8"));
const H_PTS = ["Conway Medical Center", "Grand Strand Medical Center", "Tidelands Waccamaw Community Hospital", "McLeod Health Seacoast"]
  .map((n) => ({ name: n, lat: GEO[n].lat, lon: GEO[n].lon }));
const MAP = placesMap("Hospitals near the 55+ communities", [
  ...ORDER.map((c) => ({ name: c.name, short: c.name.replace("Seasons at Prince Creek West", "Seasons").replace("Del Webb at Grande Dunes", "Del Webb Grande Dunes").replace("Del Webb North Myrtle Beach", "Del Webb NMB"), lat: c.lat, lon: c.lon })),
  ...H_PTS.map((p) => ({ name: p.name, short: p.name.replace(" Community Hospital", "").replace(" Medical Center", " Medical").replace("McLeod Health ", "McLeod "), lat: p.lat, lon: p.lon })),
], { caption: "Map of the four 55+ communities (1 to 4) and the hospital nearest each (5 to 8).", key: true });

/* One entry per community: what life there is like first, then the drives, the storm zone, the price and the
   fee (owner's eye, round 1: "sell the location ... then mention price"). The homes strip is the photo: the
   website's edge fills it with homes for sale there; until then, or with the search off, the photo shows. */
const anchor = (c) => c.url.split("/").filter(Boolean).pop();
const entry = (c, n, slug, photo, paras, at = 1) => `<h3 id="${anchor(c)}" style="font-family:var(--serif);font-size:1.35rem;color:var(--navy);margin:2.2rem 0 .7rem;line-height:1.3">${n}. ${c.name}</h3>`
  + paras.slice(0, at).map((t) => h.p(t)).join("") + G.homes(slug, c.name, photo, `For sale now in ${c.name}`) + paras.slice(at).map((t) => h.p(t)).join("")
  + G.offer(c.name, { label: `Get the homes for sale in ${c.name}`, href: `/contact/?place=${encodeURIComponent(c.name)}` });

/* Page CSS. The glance row at the reading line height. The end offer band: the website's listing notice
   follows it inside <main>, so glass.js's top-bar rules caught it (NEEDS.md 1); this puts the dark panel back
   on the band with an H2. The top homes strip's search box at 320 px (NEEDS.md 3): kept inside the column. */
const BAND_END = 'main#main>section[style^="background:var(--navy)"]:has(>.wrap>h2)';
const PAGE_CSS = "<style>main#main .c3-glance li{line-height:1.4}"
  /* Light fix, triage 2026-11-08: the italic line at about half the H1's size, on its own line (the approved look,
     batches/2026-11-a/hoa-documents/DESIGN.md). */
  + "@media (min-width:700px){main#main .detail-h1{text-wrap:balance}}main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}"
  + "@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}"
  + `${BAND_END}{padding:.9rem 0 1.4rem!important}${BAND_END}>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important}`
  + `${BAND_END}>.wrap>h2{color:var(--ivory)!important}${BAND_END}>.wrap>p{color:rgba(244,239,232,.82)!important}`
  + `@media (max-width:699px){${BAND_END}>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}${BAND_END}>.wrap>h2{font-size:1.5rem!important;line-height:1.25}}`
  + "main#main .hx-feed .hx-fb,main#main .hx-feed .hx-fb-ai,main#main .hx-feed .hx-fb-q{min-width:0!important;max-width:100%!important;box-sizing:border-box}"
  /* The shared header at 1000 to 1120 px: the phone number ran 5 px past a 1024 px window (critic, round 1;
     NEEDS.md 2). The icon and its spoken label stay; only the digits hide in that band. */
  + "@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}"
  + "</style>";

const PH_MT = ph.aerial("conway-main-street", "Main Street in downtown Conway, about 10 minutes from Myrtle Trace by car.", { closeUp: true });
const PH_SPC = ph.aerial("murrells-inlet-boats", "Fishing boats at a marina in Murrells Inlet.", { closeUp: true });
const PH_GD = ph.aerial("del-webb-grande-dunes-clubhouse-from-above", "The Del Webb at Grande Dunes clubhouse from above, with its outdoor pool and the courts beside it.", { closeUp: true });
const PH_NMB = ph.aerial("north-myrtle-beach-beach-umbrellas", "Beach chairs and umbrellas on the beach in North Myrtle Beach.");

const ENTRIES = [
  entry(MT, 1, "myrtle-trace-55", PH_MT, [
    "Myrtle Trace, just outside Conway, has a calendar of about 70 events and club meetings a month. Its activities committee runs a coffee klatch, a dining-out group and meals for neighbors who cannot get out, and the calendar has had a Labor Day picnic and a craft fair. Owners share a clubhouse, a pool and ponds where they can fish.",
    "Conway Medical Center is about 3 minutes away by car, downtown Conway about 10 and the beach about 15. Myrtle Trace is outside every hurricane evacuation zone, and outside the city limits, so there is no city tax.",
    `Homes here usually sell for about $300,000, the least of the four. The HOA fee is $95 a month. ${share(MT)} homes are taxed as someone's full-time home. At least one person in each home must be 55 or older, and the HOA's rules set no minimum age for anyone else. Read our ${h.a(MT.url, "Myrtle Trace guide")}.`,
  ]),
  entry(SPC, 2, "prince-creek-55", PH_SPC, [
    "Seasons at Prince Creek West, near Murrells Inlet, has a clubhouse with an indoor pool, an outdoor pool and a fitness center, plus tennis and bocce. Publix is about 5 minutes away by car, and the Murrells Inlet MarshWalk about 10.",
    "Tidelands Waccamaw Community Hospital is about 8 minutes away, and the beach at Garden City about 13. Seasons is the one of the four inside a hurricane evacuation zone: every home is in Zone C.",
    `Homes here usually sell for about $500,000. The HOA fee, about $340 a month, includes internet, weekly trash pickup and lawn care. ${share(SPC)} homes are taxed as someone's full-time home, the most of the four. The 55+ resident must live there at least six months a year. No one under 18 may live there, and a visitor under 18 may stay up to 60 days a year. Read our ${h.a(SPC.url, "Seasons guide")}.`,
  ]),
  entry(GD, 3, "del-webb-grande-dunes-55", PH_GD, [
    "Del Webb at Grande Dunes, in Myrtle Beach beside the Intracoastal Waterway, is the one with a beach club in the HOA fee. Each household gets a membership in the Grande Dunes Ocean Club, with a pool and private beach access, about 8 minutes away by car. The club runs groups such as Mexican Train and mahjong, holiday events and wine tastings.",
    "At home, the clubhouse has indoor and outdoor pools, a fitness center, an arts and crafts room and courts for tennis, pickleball and bocce, and staff are there every day.",
    "Grand Strand Medical Center is about 6 minutes away, and the nearest beach access about 4. Del Webb at Grande Dunes is outside every hurricane evacuation zone. It is inside the Myrtle Beach city limits.",
    `Houses here usually sell for about $665,000, and villas for about $430,000. With the city's tax added, a house at that price that is your home pays about $2,700 a year, before the $50,000 exemption at 65.`,
    `The HOA fee is about $400 a month for a house and about $445 for a villa. ${share(GD)} homes are taxed as someone's full-time home. Every lived-in home needs one resident 55 or older, and a visitor under 19 may stay overnight up to 90 days in any 12 months. Read our ${h.a(GD.url, "Grande Dunes guide")}.`,
  ], 2),
  entry(NMB, 4, "del-webb-nmb-55", PH_NMB, [
    "Del Webb North Myrtle Beach is the newest of the four: about 400 homes built since 2022, and the builder still sells new ones. Its clubhouse has an indoor lap pool, an outdoor pool with a walk-in entry and a fitness center, with pickleball and bocce courts and walking trails.",
    "The city's community center is about a minute away by car. On weekdays you can play indoor pickleball there for a few dollars a day, and its outdoor courts are free.",
    "The nearest city beach parking lot is about 4 minutes away, and city beach parking is free all winter. McLeod Health Seacoast hospital is about 10 minutes away, and the North Strand emergency room, open day and night, about 5. Del Webb North Myrtle Beach is outside every hurricane evacuation zone.",
    `In the last year, new homes from the builder usually sold for about $635,000, and homes resold by their owners for about $535,000. The HOA fee is about $315 a month. ${share(NMB)} homes are taxed as someone's full-time home. At least one person in each household must be 55 or older. Read our ${h.a(NMB.url, "Del Webb North Myrtle Beach guide")}.`,
  ], 2),
].join("");

const PH_BEACH = ph.aerial("myrtle-beach-beach-from-above", "The beach and the dunes in Myrtle Beach, with few people on the sand, seen from a high floor.", { closeUp: true });
ph.share("north-myrtle-beach-beach-umbrellas");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  pageImages: () => ph.pageImages(),
  title: "Retire to Myrtle Beach: No SC Social Security Tax | Chapter3",
  description: "Myrtle Beach for retirees: no state tax on Social Security, four 55+ communities and what homes sell for, golf, the beach, hospitals and costs at 65.",
  ogTitle: "Retiring to Myrtle Beach: no state tax on Social Security",
  crumb: "Retirees",
  eyebrow: "Retirement on the Grand Strand",
  h1: "Retiring to Myrtle Beach:",
  h1em: "no state tax on Social Security.",
  sub: `Retire here and pay no state tax on Social Security. Each 55+ community on this page is ${Math.min(...mins)} to ${Math.max(...mins)} minutes from a hospital.`,
  heroMedia: glance([
    { icon: "hospital", label: "Hospital", text: `${Math.min(...mins)} to ${Math.max(...mins)} min` },
    { icon: "beach", label: "Beach", text: "4 to 15 min" },
    { icon: "airport", label: "Nonstops", text: "50+ cities" },
  ]),
  heroCta: false, /* round 1 (owner's eye): one offer per community; the end offer closes the page */
  author: "devin",
  shortAnswer: [
    `A retired couple on Social Security and a modest pension can owe no South Carolina income tax. Property tax here is lowest on a home you live in full time. Outside the city limits, a $400,000 house you live in is taxed about ${T65} a year at 65, with the $50,000 exemption. That exemption takes the first $50,000 of the home's value off the tax.`,
    "The four 55+ communities on this page are 4 to 15 minutes by car from the beach. Homes in them usually sell for about $300,000 in Myrtle Trace to about $665,000 for a house in Del Webb at Grande Dunes.",
  ],
  sections: [
    { h2: "Is Myrtle Beach a good place to retire?", toc: "Good place to retire?", id: "good-place-to-retire", html: () =>
      PAGE_CSS +
      h.p("About 128,700 people in Horry County are 65 or older, about 3 in 10 residents. In South Carolina and in the U.S. as a whole, it is about 2 in 10. Whether it suits you depends most on how you will use the home.") +
      DECIDE +
      h.p(`To weigh Myrtle Beach against Charleston, see our ${h.a("/buyers/relocating/myrtle-beach-vs-charleston/", "Myrtle Beach vs Charleston guide")}.`) },

    { h2: "What is a retired week like in Myrtle Beach?", toc: "A retired week", id: "retired-life", html: (bg) =>
      ph.css() + G.homesCss() +
      h.p(`For golf, anyone who lives or owns a home in Horry County can buy the ${h.ext(PASSPORT, "Myrtle Beach Golf Passport")}, $72 a year, for member rates at the courses that take it. The city's own course, ${h.ext(PINES, "Whispering Pines")}, charges county residents $45 a round with a cart, plus tax.`) +
      h.p("In the off season, nothing closes except the tourist attractions and the water parks. The boardwalk stays open, sometimes with shorter hours. Each 55+ community below has its own clubhouse and pool, and three of them have a lifestyle director or a club calendar.") +
      PH_BEACH +
      h.p(`Family can fly straight here. The ${h.ext(ROUTES, "Myrtle Beach airport's route map")} lists nonstop flights to more than 50 cities on ten airlines, among them New York LaGuardia, Newark, Philadelphia, Pittsburgh, Cleveland and Charlotte. The airport is 20 to 35 minutes by car from the four 55+ communities. Plan on a car: ${h.a("/buyers/relocating/getting-around/", "most daily life here is built around driving")}.`) },

    { h2: "Which 55+ communities near Myrtle Beach should you see?", toc: "55+ communities", id: "communities", html: (bg) =>
      h.p("We have a full guide to each of these four 55+ communities.") +
      ENTRIES +
      h.h3("Do you need a 55+ community?") +
      h.p(`No. About ${OL_TOTAL.toLocaleString("en-US")} houses on one level are for sale across the area, and fewer than ${(Math.floor(IN55 / 10) + 1) * 10} homes are for sale in these four 55+ communities. About two in three of the one-level houses are under $400,000. Of the seven towns in the chart, ${MOST} has the most of those; ${LOWTWO[0]} and ${LOWTWO[1]} have the fewest.`) +
      OL_CHART +
      h.p(`Our ${h.a("/buyers/55-plus-communities/", "55+ communities guide")} compares more of them.`) +
      h.cta("Homes near the golf, beach or clubhouse you want", "Tell us what you want near home, and we send you one-level houses for sale that fit, inside or outside a 55+ community.", "Send us what you want nearby", "/contact/", bg) },

    { h2: "How close are the hospitals to Myrtle Beach's 55+ communities?", toc: "Hospitals", id: "hospitals", html: () =>
      h.p(`Each of the four is ${Math.min(...mins)} to ${Math.max(...mins)} minutes by car from a hospital, without traffic.`) +
      MAP.html +
      h.p(`Medicare rates hospitals from 1 to 5 stars. On ${h.ext(CARE, "Care Compare")}, Tidelands Waccamaw Community Hospital, nearest Seasons, has 4 stars. Conway Medical Center, nearest Myrtle Trace, and Grand Strand Medical Center, nearest Del Webb at Grande Dunes, have 2 each.`) +
      h.p(`McLeod Health opened ${h.a("/buyers/relocating/healthcare/", "a new 48-bed hospital in Carolina Forest")} to patients in October 2026. It is about 6 minutes by car from Del Webb at Grande Dunes, the same as Grand Strand Medical Center.`) +
      h.p(`For care later, see our ${h.a("/buyers/senior-living/", "guide to assisted living, memory care and nursing homes in Myrtle Beach")}.`) },

    { h2: "Do Myrtle Beach's 55+ communities have to evacuate for hurricanes?", toc: "Hurricanes and flooding", id: "hurricanes", html: (bg) =>
      h.p(`Three of the four are outside every hurricane evacuation zone. Every home in Seasons at Prince Creek West is in Zone C.`) +
      h.p(`South Carolina draws its ${h.ext(ZONES, "evacuation zones")} A, B and C around storm surge, the rise of sea water in a storm. A home outside every zone is not ordered out by its zone.`) +
      h.p("The homes in all four communities are outside FEMA's high-risk flood areas, so federal law does not require flood insurance with a mortgage, though a lender may still ask for it. In Seasons, 45 lots touch a high-risk area at one edge, so we check where the house is on the lot.") +
      h.p(`Our ${h.a("/buyers/coastal-insurance/", "coastal insurance guide")} explains wind and flood cover, and our ${h.a("/buyers/relocating/hurricanes/", "hurricane page")} has more on storms here.`) +
      h.cta("The storm zone and flood zone of one home", "Send us a home you like. We tell you its hurricane evacuation zone and whether any of its lot is in a high-risk flood area.", "Have us look up a home's zones", "/contact/", bg) },

    { h2: "What is the weather like in Myrtle Beach all year?", toc: "Weather", id: "weather", html: () =>
      h.p("January afternoons are in the mid to upper 50s: about 56 degrees in Myrtle Beach and about 58 in Conway. Each has close to 40 nights a year at or below freezing.") +
      h.p("Summer is milder on the coast. In a normal year, Myrtle Beach has about 22 days of 90 degrees or more, and Conway, inland, about 58.") },

    { h2: "What does a house near Myrtle Beach cost a year at 65?", toc: "Yearly cost at 65", id: "yearly-cost", html: (bg) =>
      h.p(`Outside the city limits, a $400,000 house you live in costs about ${YEAR65} a year in county tax and fees at 65, before insurance and any HOA fee.`) +
      TAX_CHART +
      h.p(`The 4 percent rate is the lower tax rate on a home you live in. Until you apply for it, the county bills the house at the second-home rate. To get it, you certify that no one in your household claims to be a legal resident of another state. A house that becomes your home for any part of the year gets the lower rate for the whole year.`) +
      h.p(`The $50,000 exemption at 65 is its own application. You qualify once you have lived in South Carolina for a year and turned 65 by December 31 of the year before. Until then, the same house is taxed about ${T64} a year.`) +
      h.table(["$400,000 house at 65", "A year"], [
        ["Tax and stormwater fee", nw(YEAR65)],
        ["HOA fee, four 55+ communities", nw("$1,140 to $5,340")],
        ["Flood insurance, if wanted", nw("About $550 to $600")],
        ["Homeowners insurance", "A quote on the house"],
      ]) +
      h.p(`Homeowners insurance is priced house by house. The ${h.ext(DOI, "state insurance department")} says the price depends on how the house is built, its age, the fire protection nearby, the coverage and the deductible. We get you a quote on the exact house before you write an offer.`) +
      h.p("Property tax up north can be many times this. One of our clients from New York sold a $1 million house with more than $20,000 a year in property tax. They bought a $700,000 house here, with about $3,200 in tax. Those are one household's numbers, not a promise.") +
      h.cta("A year's cost for one house, before you offer", "Pick one house. We add up its tax at that price, its HOA fee and an insurance quote, so you know its cost a year.", "Have us add up one house", "/contact/", bg) },

    { h2: "Does South Carolina tax Social Security and pensions?", toc: "Income tax", id: "income-tax", html: () =>
      h.p(`South Carolina does not tax Social Security. Pensions, IRAs and 401(k) plans get a deduction for each person, larger from the year you turn 65, and military retirement pay is not taxed at all. These rules come from a ${h.ext(ACT110, "new state law, Act 110")}.`) +
      INCOME_TABLE +
      CALC +
      h.p(`Most clients we work with who move here come from New York and North Carolina. How your old state taxes the same income is on our pages for buyers moving ${h.a("/buyers/relocating/from-new-york/", "from New York")}, ${h.a("/buyers/relocating/from-new-jersey/", "New Jersey")}, ${h.a("/buyers/relocating/from-pennsylvania/", "Pennsylvania")}, ${h.a("/buyers/relocating/from-ohio/", "Ohio")} and ${h.a("/buyers/relocating/from-north-carolina/", "North Carolina")}.`) },
  ],
  faqTitle: "Retiring to Myrtle Beach FAQ",
  faq: [
    { q: "Does a retired couple have to file a South Carolina tax return?", a: "A married couple, both 65 or older, does not have to file a South Carolina return unless their South Carolina income is over $60,000." },
    { q: "How do I apply for the homestead exemption in Horry County?", a: "Apply at the Horry County Auditor's office, and inside a city at the city too, by July 15 for that year's bill. You must own the home and live in it as your legal home. The exemption takes the first $50,000 of the home's value off the tax." },
    { q: "Do I lose the 4 percent rate if I rent the home out?", a: "Only if you rent it out for more than 72 days in a calendar year. State law keeps the 4 percent rate on a home you live in as long as it is not rented for more than 72 days in that year." },
    { q: "What makes a community 55+ under federal law?", a: "To count as 55+ housing under federal fair housing law, a community needs at least one person 55 or older in at least 80 percent of its occupied homes. It must also publish and follow its age policy, and check ages." },
  ],
  sources: [
    { name: "Act 110", href: ACT110 },
    { name: "SCDOR letter 26-20", href: IL2620 },
    { name: "SC Code 12-6", href: T12_6 },
    { name: "12-37", href: T12_37 },
    { name: "12-43", href: T12_43 },
    { name: "2026 county levy", href: LEVY },
    { name: "SC hurricane zones", href: ANNEX_C },
    { name: "Care Compare", href: CARE },
    { name: "SC Department of Insurance", href: DOI },
    { name: "MYR route map", href: ROUTES },
    { name: "Golf Passport", href: PASSPORT },
    { name: "NOAA normals", href: NOAA },
    { name: "Census ACS", href: ACS },
    { name: "42 U.S.C. 3607", href: HOPA },
  ],
  ogImage: "https://chapter3realty.com/images/2026-11-a/buyers-retirees/share.jpg",
  ogImageAlt: "Retiring to Myrtle Beach: no state tax on Social Security.",
  sourcesNote: "Not legal or tax advice. Tax examples by Chapter3 under the 2026 rules. Full-time homes and hurricane zones: every home in the county's parcel records. Home prices: county deed records. Drives without traffic.",
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Choose where to retire, with an agent", p: "Tell us how you want to live. We pick the 55+ communities and homes that fit, and show them to you.", label: "Have us pick homes for you", href: "/contact/" },
  keywords: "retire to Myrtle Beach, retiring in Myrtle Beach, is Myrtle Beach a good place to retire, things to do for retirees in Myrtle Beach, cost of living Myrtle Beach retirees, South Carolina tax on Social Security, does South Carolina tax pensions, homestead exemption Horry County, 55+ communities near Myrtle Beach, Myrtle Beach hospitals",
  about: "Retiring to Myrtle Beach and Horry County, South Carolina",
});
