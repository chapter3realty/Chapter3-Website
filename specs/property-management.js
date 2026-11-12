/* /invest/property-management/ - what a property manager costs on the Grand Strand, in percent and in
 * dollars a year, what a vacation rental manager costs, whether an owner needs one, what the fee buys,
 * who pays the rental taxes, and how to get out of a management contract.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-04. Replaces the 2026-09-06 page (no fee number, mostly
 * licence and trust-account law, an eight-item "ask" list, no visual).
 * Facts: Blog-Brain batches/2026-11-a/invest-property-management/facts.md, VERIFIED and CORRECTED rows
 * only, at the corrected wording (VERIFY.md). Struck list: invest-property-management-struck.json.
 * Every number is computed here from data/2026-11-a/invest-property-management/ (findings.json from the
 * county parcel pull and the fee pages; fees.json, the managers' published terms), never typed.
 * Sources: the owner-fee pages of five managers serving Horry County (rows 1 to 7; no firm is named on
 * the page); Horry County's parcel layer by tax-bill address (rows 13 to 16); Census ACS PUMS 2020-2024
 * through the rent-prices sibling (rows 9, 10); data/str-market.json (rows 8, 12); SC Code 40-57 and
 * 27-40; SCDOR accommodations tax; Horry County hospitality fee; City of Myrtle Beach business FAQ;
 * IRS Publication 527; HUD's Fair Housing Act overview; stories pm-eviction-fees, str-cheapest-cleaner,
 * no-vendor-names.
 * Kept from the live page: the H1 and title, the law it cited (cut to plain rules near the end), the
 * short-term tax facts, the owner-approved line on reading the owner-use and exit terms, the links to
 * the sibling pages. Cut: the textbook opening, the "ask" list, the closing-day paragraph.
 * Photos: a key in a lockbox (Brainy J, CC0, Wikimedia Commons) and the oceanfront towers from
 * /invest/str-vs-ltr/ (DiscoA340, CC BY-SA 4.0), until the photo partner's shots arrive (shot-list.md).
 * Review round 1 (2026-11-04): fixes from the critic, reader and owner reviews; see REVIEW-1.md in the batch folder.
 * New fee-page facts in fix round 1 are facts.md rows 36 to 41 (VERIFIED-BY-FIXER).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, glance, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/property-management/";
const DATA = path.join(__dirname, "..", "data", "2026-11-a", "invest-property-management");
const read = (f, d = DATA) => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"));
const F = read("findings.json"), FEES = read("fees.json");
const PHOTOS = read("photos.json").photos.concat(read("photos.json", path.join(__dirname, "..", "data", "2026-10-d", "invest-str-vs-ltr")).photos);

/* ---------------------------------------------------------------------------- */
/* Numbers, rounded the way the ledger says                                       */

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r50 = (v) => money(Math.round(v / 50) * 50);
const r100 = (v) => money(Math.round(v / 100) * 100);
const LT = F.lt_fees, WY = F.worked_year, SY = F.str_year, OW = F.owners;
if (LT.firms !== 5 || LT.at_10pct !== 4 || LT.monthly_median_pct !== 10) throw new Error("rows 1 and 2 moved: re-verify");
if (WY.rent !== 1600 || WY.mgmt_year !== 1920 || WY.avg_year_low !== 2219 || WY.avg_year_high !== 2384) throw new Error("row 11 moved: re-verify");
const RENT = money(WY.rent), FEE_MO = money(WY.monthly_fee), FEE_YR = money(WY.mgmt_year);
const NEW_LO = r100(WY.year_new_tenant_low), NEW_HI = r100(WY.year_new_tenant_high), RENEW = r50(WY.year_renewal);
const AVG_LO = r100(WY.avg_year_low), AVG_HI = r100(WY.avg_year_high);
const AVG_PCT = Math.round((WY.avg_pct_of_rent_low + WY.avg_pct_of_rent_high) / 2);
const TURN = Math.round(100 / WY.turnover_share_12m); /* 25.8 percent: "about 1 in 4" (row 10) */
const SEVEN = Math.round(WY.seven_pct_with_150_min_effective_pct), SEVEN_BE = money(Math.round(WY.seven_pct_breakeven_rent / 10) * 10);
if (SEVEN !== 9 || TURN !== 4 || AVG_PCT !== 12) throw new Error("rows 6, 10, 11 moved: re-verify");
const RENEWALS = LT.renewals_published_usd.map(money);
const BASIC = `${Math.round(SY.basic_low_pct)} to ${Math.round(SY.basic_high_pct)}`, FULL = `${SY.full_low_pct} to ${SY.full_high_pct}`;
/* Review 1: the dollars are worked from the rounded 13 and 17 percent the reader sees, so the sum checks (row 12 inputs). */
const STR_REV = r100(SY.revenue), STR_LO = r100(SY.revenue * Math.round(SY.basic_low_pct) / 100), STR_HI = r100(SY.revenue * Math.round(SY.basic_high_pct) / 100);
if (STR_LO !== "$3,400" || STR_HI !== "$4,400") throw new Error("row 12 moved: re-verify");
const PCT_AWAY = Math.round(OW.pct_6pct_not_local), PCT_CONDO = Math.round(OW.condo_6pct_not_local_pct), PCT_HOUSE = Math.round(OW.house_6pct_not_local_pct);
const PCT_IND = Math.round(OW.individual_all_pct_not_local);
if (PCT_AWAY !== 63 || PCT_CONDO !== 78 || PCT_HOUSE !== 57 || PCT_IND !== 64) throw new Error("rows 13 and 15 moved: re-verify");
const n = (v) => Math.round(v).toLocaleString("en-US");
const NB = (t) => `<span style="white-space:nowrap">${t}</span>`; /* keeps "3-bedroom" and a price range on one line (critic) */
const BR3 = NB("3-bedroom");
const SIXIN10 = Math.round(OW.pct_6pct_not_local / 10);
if (SIXIN10 !== 6) throw new Error("row 13 moved: re-verify");
const ST = { NC: "North Carolina", NY: "New York", PA: "Pennsylvania", VA: "Virginia", NJ: "New Jersey" };
const list = (xs) => `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;
const HOUSE_STATES = list(OW.top_states_house_6pct.slice(1, 5).map(([s]) => ST[s]));

/* ---------------------------------------------------------------------------- */
/* Links                                                                          */

const CONTACT = "/contact/";
const SC4057 = "https://www.scstatehouse.gov/code/t40c057.php";
const SC2740 = "https://www.scstatehouse.gov/code/t27c040.php";
const SCDOR = "https://dor.sc.gov/tax/accommodations";
const HC_HOSP = "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/";
const MB_BL = "https://www.cityofmyrtlebeach.com/careers/business/business_faq.php";
const IRS527 = "https://www.irs.gov/publications/p527";
const HUD = "https://www.hud.gov/helping-americans/fair-housing-act-overview";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/";
const PUMS_URL = "https://www.census.gov/programs-surveys/acs/microdata.html";

/* ---------------------------------------------------------------------------- */
/* Styles for the page's own blocks                                               */

const CSS = `<style>
main#main .c3-glance li,main#main .c3-glance span.t{line-height:1.4}
/* Offer boxes inside a section: a large button (owner, 2026-11-03). */
main#main div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.06rem;padding:.85rem 1.5rem;min-height:52px;display:inline-flex;align-items:center}
/* The closing offer is followed by the homes strip (.hx-wrap), so glass.js's compact rule for the first offer also catches it. Put the dark panel back (as on /invest/rent-prices/; NEEDS.md there). */
main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;display:block!important;padding:2.2rem 1.6rem!important;border-radius:28px!important;margin-left:auto!important;margin-right:auto!important;text-align:center!important}
main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap>*{color:var(--ivory)}
main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap>p{color:rgba(244,239,232,.8)!important}
@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:has(+.hx-wrap)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}
/* The homes strip's search box ran past a 320 px window on the sibling pages (critic). */
main#main .hx-fb-ai{max-width:100%;box-sizing:border-box;flex-wrap:wrap;min-width:0}
main#main .hx-fb-ai>.hx-ai-badge{flex-wrap:wrap;white-space:normal;max-width:100%;min-width:0}
main#main .hx-fb-ai>.hx-fb-q{flex:1 1 100%;max-width:100%;min-width:0;flex-wrap:wrap;box-sizing:border-box}
main#main .hx-fb-q textarea{min-width:7.5rem}
main#main .hx-fb-go{max-width:100%}
@media (min-width:1000px) and (max-width:1120px){.header-ctas .hdr-phone-num{display:none}}
@media (min-width:700px){main#main nav[aria-label="On this page"]{max-width:none!important}main#main nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:1.4rem}}
/* The worked year */
main#main .pm-ex{max-width:720px;margin:1rem 0 1.4rem;padding:1.1rem 1.2rem;border-radius:18px;background:linear-gradient(180deg,rgba(255,255,255,.78),rgba(255,255,255,.55));border:1px solid rgba(255,255,255,.85);box-shadow:0 14px 30px -24px rgba(28,32,40,.4);font-family:var(--sans);color:var(--navy)}
main#main .pm-ex .k{font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:#8a5226;font-weight:600;margin:0 0 .5rem}
main#main .pm-ex dl{margin:0;display:grid}
main#main .pm-ex dl>div{display:flex;justify-content:space-between;align-items:baseline;gap:1rem;padding:.6rem 0;border-bottom:1px solid rgba(28,32,40,.12)}
main#main .pm-ex dl>div.t{border-bottom:0;border-top:2px solid var(--navy);margin-top:.2rem}
main#main .pm-ex dl>div.t dt,main#main .pm-ex dl>div.t dd{font-weight:700}
main#main .pm-ex dt{margin:0;line-height:1.45;font-size:1.02rem}
main#main .pm-ex dd{margin:0;text-align:right;font-variant-numeric:tabular-nums;font-weight:600;font-size:1.02rem;min-width:7.2rem;white-space:nowrap;flex:none}
main#main .pm-ex dt .s{display:block;margin-top:.2rem;font-size:.95rem;color:var(--muted);line-height:1.45}
main#main .pm-ex p{margin:.7rem 0 0;color:var(--navy);line-height:1.55;font-size:1.05rem;font-weight:600}
@media (max-width:480px){main#main .pm-ex dl>div{flex-direction:column;gap:.15rem}main#main .pm-ex dd{text-align:left;min-width:0;color:#8a5226}}
/* The rule and fee cards */
main#main .pm-rules{max-width:760px;display:grid;gap:.8rem;margin:1rem 0 1.4rem;list-style:none;padding:0}
main#main .pm-rules>li{margin:0}
@media (min-width:700px){main#main .pm-rules{grid-template-columns:1fr 1fr}}
main#main .pm-rules>li{padding:1rem 1.15rem;border-radius:16px;background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid rgba(255,255,255,.85);box-shadow:0 14px 30px -24px rgba(28,32,40,.4)}
main#main .pm-rules b{display:block;font-family:var(--sans);color:var(--navy);font-size:1.08rem;margin-bottom:.4rem}
main#main .pm-rules p{margin:0;color:var(--muted);line-height:1.6}
main#main .pm-cap{font-family:var(--sans);color:var(--navy);font-weight:600;font-size:1.08rem;margin:1.4rem 0 .2rem}
main#main .pm-rules p strong{color:var(--navy)}
main#main .pm-rules p.t{text-wrap:balance;font-family:var(--sans);color:var(--navy);font-size:1.08rem;font-weight:700;margin-bottom:.4rem;line-height:1.35}
/* The money drawing */
main#main .pm-flow{max-width:760px;margin:1.4rem 0 1.6rem;padding:1.1rem 1.1rem .9rem;border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.5));border:1px solid rgba(255,255,255,.85);box-shadow:0 14px 30px -24px rgba(28,32,40,.4)}
main#main .pm-flow ol{list-style:none;margin:0;padding:0;display:grid;gap:2.1rem;position:relative}
main#main .pm-flow li{position:relative;margin:0;padding:.9rem 1rem;border-radius:14px;background:#fff;border:1px solid rgba(28,32,40,.1);font-family:var(--sans);color:var(--muted);line-height:1.5}
main#main .pm-flow li b{display:flex;align-items:center;gap:.5rem;color:var(--navy);font-size:1.08rem;margin-bottom:.25rem}
main#main .pm-flow li b span{display:inline-flex;width:1.6rem;height:1.6rem;border-radius:50%;background:#c4783a;color:#fff;font-size:.9rem;align-items:center;justify-content:center;flex:none}
main#main .pm-flow li:not(:last-child)::after{content:"";position:absolute;left:50%;bottom:-1.75rem;width:0;height:0;border-left:.7rem solid transparent;border-right:.7rem solid transparent;border-top:1rem solid #c4783a;transform:translateX(-50%)}
@media (min-width:760px){main#main .pm-flow ol{grid-template-columns:repeat(3,1fr);gap:2.2rem}main#main .pm-flow li:not(:last-child)::after{left:auto;right:-1.7rem;top:50%;bottom:auto;border-top:.7rem solid transparent;border-bottom:.7rem solid transparent;border-left:1rem solid #c4783a;border-right:0;transform:translateY(-50%)}}
main#main .pm-flow figcaption{margin:.9rem 0 0;color:var(--muted);font-size:.95rem;line-height:1.5}
/* Offer headings: no word alone on the last line (critic, 320 px). */
main#main div[style^="border-left:3px solid var(--brass)"]>p:first-child,main#main>section[style^="background:var(--navy)"] h2{text-wrap:balance}
/* The hero's summary line repeated the line above it (owner's eye), as on /invest/strategies/fix-and-flip/. */
main#main .detail-hero .detail-sub{display:none}
/* Light fix, triage 2026-11-08: the italic line at about half the H1's size, on its own line (the approved look,
   Blog-Brain batches/2026-11-a/hoa-documents/DESIGN.md). */
@media (min-width:700px){main#main .detail-h1{text-wrap:balance}}
main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}
@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}
/* The tax table */
main#main .pm-tab{width:100%;max-width:640px;border-collapse:collapse;font-family:var(--sans);font-size:1.02rem;line-height:1.45;color:var(--navy);margin:1rem 0 1.2rem}
main#main .pm-tab caption{caption-side:top;text-align:left;font-weight:600;padding:0 0 .5rem}
main#main .pm-tab th,main#main .pm-tab td{padding:.55rem .5rem;border-bottom:1px solid rgba(28,32,40,.12);text-align:left;vertical-align:top}
main#main .pm-tab th:first-child,main#main .pm-tab td:first-child{padding-left:0}
main#main .pm-tab thead th{border-bottom:2px solid var(--navy)}
main#main .pm-tab td:last-child{white-space:nowrap;font-weight:600}
</style>`;

/* ---------------------------------------------------------------------------- */
/* Block 1: what local managers print (rows 1 to 5). Firms are described by office and plan, never named
   (story no-vendor-names). Review 1: the reader could not place Firms C and D; the text above the table says
   who they are. */

const LABEL = { beachrentalgroup: "Firm A: North Myrtle Beach office, full-service plan", jnp: "Firm B: Myrtle Beach office, standard plan",
  purepm: "Firm C: regional firm, full-service plan", annualrentals: "Firm D: a brokerage's Myrtle Beach rentals site",
  childs: "Firm E: Myrtle Beach office, flat-fee plan" };
const ORDER = ["beachrentalgroup", "jnp", "purepm", "annualrentals", "childs"];
const share = (f) => f.monthly_min_usd ? `As low as ${f.monthly_pct}%, ${money(f.monthly_min_usd)} minimum`
  : `${f.monthly_pct}% of the rent${/collected/.test(f.monthly_note || "") ? ", if collected" : ""}`;
const place = (f) => f.leasing_share_of_month === 0 ? "None" : f.leasing_share_of_month === 1 ? "One month's rent"
  : f.leasing_share_of_month === 0.5 ? "Half a month's rent" : `${Math.round(f.leasing_share_of_month * 100)}% of a month's rent`;
const usd = (v) => v === null || v === undefined ? "Not printed" : v === 0 ? "None" : money(v);
if (FEES.long_term.length !== LT.firms || ORDER.some((id) => !FEES.long_term.find((f) => f.id === id))) throw new Error("fees.json changed: re-verify rows 1 to 5");
const FEE_CARDS = compareCards(ORDER.map((id) => FEES.long_term.find((f) => f.id === id)).map((f) => ({
  name: LABEL[f.id], cells: { share: share(f), place: place(f), renew: usd(f.renewal_usd), setup: usd(f.setup_usd) },
})), [{ key: "share", label: "Each month" }, { key: "place", label: "To find a tenant" }, { key: "renew", label: "Renewal" }, { key: "setup", label: "Setup" }],
{ caption: "What five managers serving Horry County print for a yearly lease, main plan", nameLabel: "Manager" });

/* Block 2: the worked year (rows 9 to 11). Review 1: the new-tenant row says why the top figure is
   $1,600 + 11 months of 10 percent (Firm A starts its 10 percent in the second month, row 2), so the sum checks. */
const WORKED = h.raw(`<div class="pm-ex" role="group" aria-label="Worked example"><p class="k" style="margin-top:0">Worked example: a ${BR3} house renting for ${RENT} a month</p><dl>`
  + `<div><dt>The manager's 10 percent</dt><dd>${FEE_MO} a month, ${FEE_YR} a year</dd></div>`
  + `<div><dt>A year with a new tenant<span class="s">Add half a month's rent to place the tenant. Or a full month's rent, at the firm that then starts its 10 percent in the second month.</span></dt><dd>about ${NEW_LO} to ${NEW_HI}</dd></div>`
  + `<div><dt>A year the tenant stays<span class="s">Add a ${RENEWALS.join(" to ")} renewal fee.</span></dt><dd>about ${RENEW}</dd></div>`
  + `<div class="t"><dt>Most years, with a new tenant about 1 year in ${TURN}</dt><dd>about ${AVG_LO} to ${AVG_HI}</dd></div>`
  + `</dl><p>That is about ${AVG_PCT} percent of the rent, not 10.</p></div>`);

/* Block 3: vacation rental plans (row 8). Review 1: full service is a share of gross profit, never of the
   bookings (str-market.json fullServiceBase); the table and the short answer say so. */
const STR_CARDS = compareCards([
  { name: "Basic plan", cells: { share: `About ${BASIC}% of the bookings`, covers: "Marketing, guest messages, bookkeeping" } },
  { name: "Full service", cells: { share: `About ${FULL}% of profit after costs`, covers: "Basic, plus taxes and repairs" } },
], [{ key: "share", label: "The manager takes" }, { key: "covers", label: "What it covers" }],
{ caption: "What owners here pay a vacation rental manager, in the rentals we have seen", nameLabel: "Plan" });

/* Block 4: where the owners get their tax bill (rows 13, 16). Review 1: one finding in plain words; the
   method (the 6 percent rate, the bulk addresses, the 98.5 percent control) moved to the sources line. */
const AREA_NAME = { "Grand Strand": "Inside the area" };
const OWNERS_CHART = G.bars(OW.chart_6pct.map((r) => ({
  name: AREA_NAME[r.label] || r.label, value: r.pct, valueText: r.pct < 1 ? "under 1%" : `${Math.round(r.pct)}%`,
  feature: `about ${n(Math.round(r.n / 100) * 100)} homes`, reference: !!AREA_NAME[r.label],
})), { caption: "For most rentals and second homes here, the tax bill goes outside the area", nameLabel: "Tax bill mailed to", featureLabel: "homes", valueLabel: "share",
  note: `Horry County homes not taxed as anyone's main home: rentals, second homes and others. "Inside the area" means Horry County's post-office ZIP codes and Pawleys Island's.` });

/* Block 5: the decision (rows 8, 13, 17, 18, 33). Review 1: a compare table's cell holds 40 letters, which
   clipped the reasons into fragments ("About 8 in 10 for sale list one"). Cards hold full sentences. */
const dcard = (t, what, why) => `<li><p class="t">${t}</p><p><strong>${what}</strong> ${why}</p></li>`;
const DECIDE = h.raw(`<p class="pm-cap">Do you need a property manager?</p><ul class="pm-rules" role="list" aria-label="Do you need a property manager?">`
  + dcard("A house on a yearly lease, and you live away", "Hire a manager.", "Someone near the home has to let in the tenant and the repair people.")
  + dcard("A house on a yearly lease, and you live here", "Run it yourself, or hire a manager.", "You need no license to rent out your own home.")
  + dcard("A condo in an oceanfront building", "Compare the building's rental program with a manager.", "About 8 in 10 oceanfront condos for sale list a vacation rental program.")
  + dcard("A vacation rental on a booking site", "Hire a full-service manager, or take the basic plan and your own cleaner.", "The worst mistake we see is running it yourself with the cheapest cleaner. Theft and damage have followed.")
  + `</ul>`);

/* Block 6: what costs extra (rows 5, 32 and fixer rows 36 to 41), and how the money moves (row 20).
   Review 1: replaces the two task lists any town's guide has. */
const card = (t, b) => `<li><p class="t">${t}</p><p>${b}</p></li>`;
const EXTRAS = h.raw(`<ul class="pm-rules" role="list">`
  + card("A setup fee", `Firm B charges ${money(FEES.long_term.find((f) => f.id === "jnp").setup_usd)} to start. Firm A prints no setup fee.`)
  + card("A month with no rent", "Firm D takes its fee only on rent it collects. The other four pages do not say what they charge in a month no rent comes in.")
  + card("Inspections", "Firm B's standard plan includes the move-in and move-out inspections. It charges $100 for an extra inspection you ask for.")
  + card("Repairs", "Firm B usually pays repair bills up front and takes them out of your next month's payment. You may use your own repair person. None of the five pages prints a markup on repair bills.")
  + card("Evictions", "Many managers handle evictions, depending on the plan. Most charge their percentage of the rent whatever the work, but some bill an eviction by the hour. Firm E charges no eviction fee beyond the cost of serving the papers and the court's costs.")
  + card("A tenant who leaves early", "If a tenant Firm D placed breaks the lease in the first 12 months, Firm D finds a new tenant for free.")
  + `</ul>`);
const FLOW = h.raw(`<figure class="pm-flow" role="group" aria-label="How the money moves on a long-term rental with a manager"><ol>`
  + `<li><b><span>1</span>The tenant pays</b>The rent each month, and a security deposit at the start.</li>`
  + `<li><b><span>2</span>The manager's trust account</b>A bank account for other people's money. The deposit stays in it until the lease ends.</li>`
  + `<li><b><span>3</span>You are paid</b>The rent, after the bank clears it, less the manager's fee.</li>`
  + `</ol><figcaption>How the money moves on a long-term rental with a manager. Our own drawing.</figcaption></figure>`);

/* Block 7: what is taxed on a booking (rows 25, 26). */
const TAXED = h.raw(`<table class="pm-tab"><caption>On a stay under 90 days, what the guest pays</caption><thead><tr><th scope="col">The charge</th><th scope="col">Taxed?</th></tr></thead><tbody>`
  + `<tr><td>The nightly rent</td><td>Yes</td></tr>`
  + `<tr><td>A cleaning fee every guest must pay</td><td>Yes, like the rent</td></tr>`
  + `<tr><td>A cleaning fee the guest can choose to skip</td><td>No</td></tr>`
  + `</tbody></table>`);

/* Block 8: the rules an owner acts on (rows 21, 23). Review 1: the four cards on how a manager's office
   runs (licence, supervisor, unlicensed staff, owner notice) are cut to one sentence and the FAQ. */
const RULES = h.raw(`<ul class="pm-rules" role="list">`
  + card("A way out after the first term", "An agreement that renews on its own must let either side cancel on 30 days' notice after the first term.")
  + card("Renewal pay on page one", "The agreement must say how the manager is paid. Pay for a future lease renewal must be in underlined capital letters on page one.")
  + card("The deposit list, within 30 days", "Any deduction must be listed in a written notice to the tenant, with any balance. The 30 days run from the latest of three things: the tenancy ends, the tenant hands back the home, and the tenant asks for the deposit.")
  + card("Three times what was wrongly kept", "If the owner misses the 30 days, the tenant can recover three times the amount wrongfully withheld, plus reasonable attorney's fees.")
  + `</ul>`);

/* Photos */
const KEY_PHOTO = PH.findPhoto(PHOTOS, "key-in-a-lockbox");
const TOWERS = PH.findPhoto(PHOTOS, "myrtle-beach-oceanfront-towers-from-the-beach");
const lazy = (html) => html.replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.6rem 0 1.8rem;');
const photo = (rec, cap, mw = "640px") => lazy(PH.heroPhoto(rec, { alt: rec.alt, caption: cap, maxWidth: mw, sizes: `(max-width: 680px) 100vw, ${mw}` }));
const KEY_CAP = "A key in a lockbox. When you live away, someone near has to let in the tenant, the plumber and the next showing.";
const TOWERS_CAP = "Oceanfront towers along the beach in Myrtle Beach.";
const CREDITS = PH.creditsList([{ photo: KEY_PHOTO, caption: "A key in a lockbox" }, { photo: TOWERS, caption: "Oceanfront towers along the beach in Myrtle Beach" }]);

/* ---------------------------------------------------------------------------- */
/* The page                                                                       */

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Myrtle Beach Property Management: What It Costs | Chapter3",
  description: `What Myrtle Beach property managers charge: 10 percent of the rent, a fee to find a tenant, about ${AVG_PCT} percent a year in all, and vacation rental fees.`,
  ogTitle: "What does property management cost in Myrtle Beach?",
  crumb: "Property management",
  eyebrow: "Managers and fees",
  h1: "What does property management cost in Myrtle Beach?",
  h1em: "Five local fee schedules, and a year of fees worked out.",
  sub: "Five local fee schedules, a year of fees worked out, and when an owner needs a manager.",
  /* Light fix, triage 2026-11-08: the hero tiles answer the title (the fee), from the short answer and the worked year.
     The 7 percent plan, the 6 in 10 tax bills and the 30 days' notice stay in their own sections. */
  heroMedia: glance([
    { icon: "dollar", label: "10% of the rent", text: "each month" },
    { icon: "home", label: "Half to one month's rent", text: "to place a tenant" },
    { icon: "calendar", label: `About ${AVG_LO} to ${AVG_HI}`, text: `a year on a ${RENT} rent` },
  ]),
  heroCta: { title: "Know the manager's real fee before you buy.", label: "Have us run the numbers", href: CONTACT },
  author: "devin",
  shortAnswer: [
    `Four of the five property managers serving Horry County that print their fees take 10 percent of each month's rent on a yearly lease. Most add half a month to a full month's rent each time they place a new tenant. On a ${BR3} house renting for about ${RENT} a month, that comes to about ${NB(`${AVG_LO} to ${AVG_HI}`)} a year.`,
    `A vacation rental manager costs more. In the rentals we have seen, a basic plan takes about ${BASIC} percent of the bookings. Full service takes about ${FULL} percent of the profit after costs, not of the bookings. Chapter3 does not manage property. We work out what you keep after the manager's fee.`,
  ],
  sections: [
    { h2: "How much do property managers charge in Myrtle Beach?", toc: "What managers charge", id: "fees", html: () =>
      CSS +
      h.p(`We read the fee pages of the five managers serving Horry County that print their long-term fees. A long-term rental is a home leased to one tenant for a year or more. Three of the five have an office in Horry County. Firm C serves Myrtle Beach from its Charleston office, in Summerville. Firm D is the Myrtle Beach rentals site of a national brokerage's local franchise, and it prints no office address.`) +
      FEE_CARDS +
      h.p(`The fee to find a tenant is called a leasing or placement fee. It runs from nothing to one full month's rent, and half a month is the middle. A renewal fee is charged when the tenant signs on for another year. The two firms that print one charge ${RENEWALS.join(" or ")}.`) +
      h.p(`Compare dollars, not percents. A plan that prints "as low as 7 percent" with a $150 monthly minimum costs about ${SEVEN} percent on a ${RENT} rent. $150 is more than 7 percent of any rent under about ${SEVEN_BE}.`) },

    { h2: "What does a property manager cost in a year?", toc: "Cost in a year", id: "a-year", html: (bg) =>
      h.p(`The fee to find a tenant changes the total from one year to the next. We worked out a year of fees on a ${BR3} house renting for ${RENT} a month, on the terms in the table above.`) +
      WORKED +
      h.ul([
        `<strong>Why 1 year in ${TURN}.</strong> About 1 in ${TURN} households renting a house here moved in within the past 12 months.`,
        `<strong>What it leaves out.</strong> Repairs, and the ${h.a("#extra-fees", "charges on top")} that some firms print.`,
      ]) +
      h.p(`What a house rents for here, by bedrooms and area, is on our ${h.a("/invest/rent-prices/", "rent prices page")}.`) +
      h.cta("Want this worked out for the house you are looking at?", "Send us the address. We put the manager's fee next to the rent, tax, insurance and HOA dues. You see whether the rent still covers the costs.", "Have us run this house", CONTACT, bg) },

    { h2: "What does a vacation rental manager charge in Myrtle Beach?", toc: "Vacation rentals", id: "vacation-rentals", html: (bg) =>
      h.p(`More than a long-term manager, because there is more work. A vacation rental, also called a short-term rental, is rented by the night or the week. Owners here pay for one of two kinds of plan:`) +
      STR_CARDS +
      h.p(`On a basic plan, you still arrange the cleaning, and repairs and tax help cost extra. Full service is a share of what is left after the costs of running the home. Its dollar cost depends on those costs.`) +
      h.p(`Local firms that print a vacation rental fee show 10 to 25 percent of the booking. One Little River firm prints 15 percent and charges cleaning to the guests, not the owner. We plan with the ranges above, which come from rentals we have seen run.`) +
      h.p(`The average Myrtle Beach vacation rental listing, of any type or size, takes in about ${STR_REV} a year in bookings. That counts the cleaning fees guests pay. On all of it, ${Math.round(SY.basic_low_pct)} percent is about ${STR_LO} and ${Math.round(SY.basic_high_pct)} percent is about ${STR_HI}.`) +
      photo(TOWERS, TOWERS_CAP) +
      h.p(`Whether nightly guests beat a yearly lease is on our ${h.a("/invest/str-vs-ltr/", "short-term against long-term rental page")}. A condo in a building with its own rental program is weighed on ${h.a("/invest/rental-program-vs-airbnb/", "rental program or Airbnb")}.`) +
      h.cta("Buying a condo with a rental program?", "We read the owner-use and exit terms of the building's program agreement with you before you sign.", "Have us read the program terms", CONTACT, bg) },

    { h2: "Do I need a property manager, or can I manage it myself?", toc: "Do you need one", id: "do-you-need-one", html: (bg) =>
      h.p(`A manager is the person near the home who shows it, lets in repair people and answers the tenant. Of the homes here that are not anyone's main home, about ${SIXIN10} in 10 have a tax bill mailed outside the area.`) +
      OWNERS_CHART +
      h.p(`North Carolina gets the most of these bills. After it, for houses, come ${HOUSE_STATES}. A Canadian owner gives the manager one tax form first, as ${h.a("/invest/canadian-buyers/", "our page on how a Canadian buys a Myrtle Beach rental")} explains.`) +
      DECIDE +
      photo(KEY_PHOTO, KEY_CAP, "560px") +
      h.cta("Looking for a manager here?", "Once we are working together, we introduce you to the management companies we recommend.", "Ask us which managers we recommend", CONTACT, bg) },

    { h2: "What do property managers charge besides the monthly fee?", toc: "Fees on top", id: "extra-fees", html: (bg) =>
      h.p(`For the monthly share, a long-term manager advertises the home, screens applicants and signs the lease. The manager also collects the rent and arranges repairs. Federal fair housing law applies to the advertising, the screening and the lease. The five fee pages also print charges on top of it, and a few things they leave out:`) +
      EXTRAS +
      FLOW +
      h.cta("Have a management agreement in front of you?", "Send it to us before you sign. We read the fee lines, the renewal pay and the way out with you.", "Send us the agreement", CONTACT, bg) },

    { h2: "Who pays the taxes on a vacation rental in Myrtle Beach?", toc: "Rental taxes", id: "taxes", html: (bg) =>
      h.p(`On stays under 90 days, whoever takes the guest's booking and payment collects the state's 7 percent accommodations tax on the full booking. That is the manager or the booking site, or you when you book the guest yourself.`) +
      TAXED +
      h.p(`Three more rules for a vacation rental owner:`) +
      h.ul([
        `<strong>A state retail license.</strong> An owner who rents only through a manager or a booking site needs none. An owner who books guests directly needs one. The exception is a home rented one week or less in each calendar quarter.`,
        `<strong>The county's fee.</strong> Horry County adds a hospitality fee on short stays: 3 percent outside city limits and 1.5 percent inside. Cities may add their own. When a manager arranges the stay, the county's page says the manager should collect and pay it.`,
        `<strong>A city business license.</strong> The City of Myrtle Beach requires one for every rental property, short-term or long-term.`,
      ]) +
      h.p(`Every tax on a stay is on our ${h.a("/invest/accommodations-tax/", "accommodations tax page")}, and the setup steps are on ${h.a("/invest/str-setup/", "setting up a short-term rental")}.`) +
      h.cta("Want to know who collects each tax on your rental?", "Send us the manager's agreement or the booking site you plan to use. We go through who collects and pays each tax with you.", "Ask us about the rental taxes", CONTACT, bg) },

    { h2: "How do I fire a property manager in South Carolina?", toc: "Contracts and the law", id: "the-law", html: () =>
      h.p(`Give the notice your agreement asks for. ${h.ext(SC4057, "State law")} adds four rules an owner can use:`) +
      RULES +
      h.p(`The agreement also may not bind you to list the home for sale with the same firm. The rest of the licensing law is about how a manager's office must run.`) +
      h.p(`The deposit rules bind you as the owner, manager or not. More is on our ${h.a("/invest/landlord-rules/", "South Carolina landlord rules page")}.`) },
  ],
  faqTitle: "Property management FAQ",
  /* Review 1: each answer is a question the body does not answer (owner, 2026-10-14 and 2026-10-26). */
  faq: [
    { q: "Are property management fees tax deductible?", a: "Yes. Management fees are a rental expense you deduct from rental income on your tax return." },
    { q: "Does a property manager need a license in South Carolina?", a: "Yes. Managing someone else's property for a fee needs a real estate license. Every licensed manager works under a broker-in-charge or a property manager-in-charge." },
    { q: "Can a manager's unlicensed staff negotiate my lease?", a: "No. Staff without a license may not negotiate a lease, approve an application, or explain the management agreement to you." },
    { q: "Does my tenant have to be told who owns the home?", a: "Yes. The tenant must be told in writing, at or before the lease starts, the name and address of the owner or the owner's agent. A manager who signs a lease without that notice takes on the landlord's duties for that lease and receives the tenant's notices and legal papers." },
    { q: "Is an HOA management company the same thing?", a: "No. A company that runs a homeowners association is a different job. This page is about a manager who rents out your home." },
  ],
  sources: [
    { name: "SC Code 40-57", href: SC4057 },
    { name: "SC Code 27-40", href: SC2740 },
    { name: "SCDOR lodging tax", href: SCDOR },
    { name: "County hospitality fee", href: HC_HOSP },
    { name: "Myrtle Beach business licenses", href: MB_BL },
    { name: "IRS Publication 527", href: IRS527 },
    { name: "HUD Fair Housing Act", href: HUD },
    { name: "County assessor", href: ASSESSOR },
    { name: "Census microdata", href: PUMS_URL },
  ],
  sourcesNote: `Fees: the fee pages of the ${LT.firms} managers that publish them; most do not. Owners: our count of county parcels by tax-bill ZIP code. Bookings: AirROI, past year. The ${RENT} rent is near the middle for 3-bedroom houses leased in the past two years, with a wide margin. Not legal or tax advice.`,
  pageImages: () => PH.pageImages(KEY_PHOTO),
  /* Review 1: the helper's closing credits line repeats what each credit says, so it is left out here. */
  afterSources: () => CREDITS.replace(/<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\. Each photo keeps the license listed with it\.<\/div>/, "") + PH.imageSchema([KEY_PHOTO, TOWERS]),
  bottomCta: { h2: "Want the numbers for a rental you are looking at?", p: "Send us the address. We put the rent, tax, insurance, dues and the manager's fee side by side. Once we work together, we introduce the managers we recommend.", label: "Send us the address", href: CONTACT },
  keywords: "property management Myrtle Beach, Myrtle Beach property management fees, how much do property managers charge, property management fee percentage, leasing fee, lease renewal fee, property management hidden fees, vacation rental management fees Myrtle Beach, Airbnb management Myrtle Beach, is a property manager worth it, how to fire a property manager South Carolina, South Carolina property manager license, property management fees tax deductible",
  about: "Property management fees and choosing a manager for a rental in Myrtle Beach and Horry County, South Carolina",
});
