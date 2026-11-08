/* /sell/sell-or-buy-first/ - should an owner here sell first or buy first: what Horry County owners who moved from one
 * home to another here actually did (our count of county deeds), how long each way took, how long a sale takes in the
 * Myrtle Beach area, what a lender counts when you buy first, how South Carolina's sale-contingency addendum works, a
 * rent-back after closing, and the property tax on two homes.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 2, 2026-11-08 (review round 1: REVIEW-1.md). Design: the approved
 * pilots of batch 2026-11-a (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line
 * headline with the italic sub line at about half the H1 size, the answer first, one card style used once (the three
 * ways, the one place the reader chooses), plain lists under thin rules and fsbo's numbered steps elsewhere, one block
 * width of 720 px, and on wide screens the photo beside the three cards. DESIGN.md in the batch folder says why.
 * Facts: Blog-Brain batches/2026-11-n/sell-sell-or-buy-first/facts.md, VERIFIED rows, and CORRECTED rows only in the
 * verifier's "Use:" wording (VERIFY.md). Row 16 is STRUCK and not used. Struck wording: sell-sell-or-buy-first-struck.json
 * (no "in the same week", no "found the next home", no "drops out only once", no "borrows against the home you own", no
 * checkbox placement, no seller carve-out, no "goes on without the condition", no copy-of-each-contract duty, no "no set
 * 72 hours", no SCR391, no "South Carolina kick-out", no "in writing before closing", no "will not agree to one", no
 * "both homes keep the 4 percent").
 * Data, never typed (website working copy, data/2026-11-n/sell-sell-or-buy-first/):
 *   chart-moves.json   the three ways, the time bands, price direction, builder homes, the years, Zillow's timing
 *                      (rows 1, 3 to 8); made by build_charts.py from moves.json and timing.json
 *   moves.json         the counts for the method note (row 2)
 *   photos.json        the one photo: a brick house on an older street in Conway, ProfReader, CC BY-SA 4.0,
 *                      Wikimedia Commons (licence record checked by tools/photos.js)
 * Typed and checked: the Fannie Mae rules (rows 9 to 11, 18), the SC REALTORS forms (rows 12 to 15, 17), SC Code
 * 12-43-220 (rows 19, 22), IRS Topic 701 (row 20), the /sell/ hub's service (row 21), the same-week steps (row 23).
 * No lender is named, so no affiliated-business disclosure is needed: the lender offer says "a loan officer at our
 * preferred lender" (BIZ-3). No rate and no payment amount anywhere.
 * Owner questions open (OWNER-QUESTIONS.md): Q1 a real story (the page ships without one), Q2 the 2026 SCR504 and SCR505
 * (the page states only what the 2020 forms, SCR's 2018 FAQ and the current-form description agree on), Q3 how a
 * rent-back is put in writing (the page uses the proposed answer, with no claim about who drafts it).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/sell/sell-or-buy-first/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "sell-sell-or-buy-first");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const C = read("chart-moves.json");
const MV = read("moves.json");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const CTA = "/contact/";

/* ---- Row 1: the three ways. ---- */
const WAY = Object.fromEntries(C.three_ways.map((w) => [w.key, w]));
const N = C.n;
if (N !== 1749 || WAY.same_week.n !== 572 || WAY.same_week.same_day_n !== 199 || WAY.bought_first.n !== 593 || WAY.sold_first.n !== 584) throw new Error("row 1 moved");
if (WAY.same_week.pct !== 32.7 || WAY.bought_first.pct !== 33.9 || WAY.sold_first.pct !== 33.4 || WAY.same_week.same_day_pct !== 11.4) throw new Error("row 1: shares moved");

/* ---- Rows 4, 5: time between, in the middle case, and the bands. ---- */
const BF = C.gap_bands.bought_first, SF = C.gap_bands.sold_first;
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
if (WAY.bought_first.median_days_both_owned !== 91 || sum(BF) !== 593 || BF["181-365"] !== 125) throw new Error("row 4 moved");
if (WAY.sold_first.median_days_between !== 65.5 || sum(SF) !== 584 || SF["8-30"] !== 164 || SF["181-365"] !== 121) throw new Error("row 5 moved");
/* 125/593 = 21 percent ("about 1 in 5"); 164/584 = 28 percent ("more than 1 in 4"); 121/584 = 21 percent ("about 1 in 5"). */
if (Math.round(100 * BF["181-365"] / 593) !== 21 || Math.round(100 * SF["8-30"] / 584) !== 28 || Math.round(100 * SF["181-365"] / 584) !== 21) throw new Error("rows 4, 5: the shares moved");

/* ---- Rows 6, 7: price direction, builder homes. ---- */
const UP = C.by_direction.bought_higher, DOWN = C.by_direction.bought_lower_or_same, NEW = C.new_home_from_builder;
if (UP.n !== 1152 || UP.bought_first_pct !== 39.6 || DOWN.n !== 597 || DOWN.same_week_pct !== 40.5 || DOWN.bought_first_pct !== 22.9) throw new Error("row 6 moved");
if (MV.lives_there.bought_higher_pct !== 65.9 || MV.lives_there.median_purchase_over_sale !== 1.161) throw new Error("row 6: price direction moved");
if (NEW.n !== 572 || NEW.sold_first_pct !== 43.7) throw new Error("row 7 moved");

/* ---- Row 3: the years. ---- */
const YRS = ["2021", "2022", "2023", "2024", "2025"];
const Y = C.by_sale_year;
if (Y["2021"].same_week_pct !== 18.9 || Y["2025"].same_week_pct !== 38.0 || Y["2021"].sold_first_pct !== 47.3 || Y["2025"].sold_first_pct !== 26.2) throw new Error("row 3 moved");

/* ---- Row 8: listing to closing, the Myrtle Beach area, the last 12 months. ---- */
const T = C.timing_myrtle_beach_last_12;
if (T.listing_to_contract_median_days_avg !== 57.5 || T.contract_to_closing_mean_days_avg !== 37.2 || T.listing_to_closing_days !== 94.7 || T.us_listing_to_closing_days !== 61.5) throw new Error("row 8 moved");
const WK = (d) => Math.round(d / 7);
if (WK(T.listing_to_contract_median_days_avg) !== 8 || WK(T.contract_to_closing_mean_days_avg) !== 5) throw new Error("row 8: the weeks moved");

/* ---- Row 2: the method note. ---- */
if (MV.counts.resales !== 55081 || MV.counts.resales_person_seller !== 34108 || MV.counts.resales_person_seller_name_on_4_or_fewer_deeds !== 33089 || MV.matched !== 3233 || MV.lives_there.n !== 1749) throw new Error("row 2 moved");

/* ---- Links ---- */
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const ZR = "https://www.zillow.com/research/data/";
const FNMA_REO = "https://selling-guide.fanniemae.com/sel/b3-6-06/qualifying-impact-other-real-estate-owned";
const FNMA_BRIDGE = "https://selling-guide.fanniemae.com/sel/b3-4.3-14/bridgeswing-loans";
const FNMA_OCC = "https://selling-guide.fanniemae.com/sel/b2-1.1-01/occupancy-types";
const SCR504 = "https://screaltors.org/scr504-sale-of-buyers-property-contingency/";
const T12_43 = "https://www.scstatehouse.gov/code/statmast.php?title=12&chapter=43";
const IRS701 = "https://www.irs.gov/taxtopics/tc701";

/* ---- The glance rows under the H1 (rows 1, 4, 5). ---- */
/* "Typical" is the median, said plainly: about half took less time, and half took longer (owner, round 1). */
const GLANCE = PK.glance([
  { icon: "home", label: "About 3 months", text: "owning two homes, for a typical owner here who bought first" },
  { icon: "key", label: "About 2 months", text: "between homes, for a typical owner here who sold first" },
  { icon: "calendar", label: "About 3 months", text: "to sell a home here, from listing to closing" },
]);

/* ---- The one chooser: the three ways, as cards (rows 1, 4 to 7, 13). The only cards on the page. ---- */
const way = (k, title, rows) => `<li><span class="k">${k}</span><b>${title}</b><dl>`
  + rows.map(([dt, dd]) => `<div><dt>${dt}</dt><dd><p>${dd}</p></dd></div>`).join("") + `</dl></li>`;
const WAYS = `<ul class="sb-cards" aria-label="Three ways to sell one home and buy the next">`
  + way("Buy first", "Fits if you can pay for two homes for a while", [
    ["How long", "About 3 months owning both homes, for a typical owner here. About 1 in 5 owned both for 6 months to a year."],
    ["The risk", "Two sets of house bills if your old home sells slowly."],
    ["What helps", `A lender's approval with ${h.a("#lender-rules", "both homes counted")}, or cash.`],
  ])
  + way("Sell first", "Fits if you need the money from your sale, and can wait to move in", [
    ["How long", "About 2 months between homes, for a typical owner. More than 1 in 4 bought the next home within a month of the sale; about 1 in 5 took more than 6 months."],
    ["The risk", "Moving twice, and paying for a place to live in between."],
    ["Where to stay", `The home you sold, on a ${h.a("#rent-back-rules", "rent-back")}, a rental by the month, or family. A storage unit can hold your things.`],
    ["What helps", `A ${h.a("/sell/cash-offer/", "cash buyer")} can close sooner, so you know your move-out day.`],
  ])
  + way("Both within a week", "Fits if you need the money from your sale, and want one move", [
    ["How long", "Both deeds recorded within 7 days of each other."],
    ["The risk", "If your sale falls through, you may lose the home you are buying, or have to buy without the money from your sale."],
    ["What helps", `${h.a("#same-week", "The six steps below")}, and an ${h.a("#sale-steps", "offer that depends on your sale")}.`],
  ])
  + `</ul>`;

/* ---- Chart A (row 3): the three ways by the year of the sale, as 100 percent bars. ---- */
const YEAR_NOTE = { "2021": "Jul to Dec", "2025": "Jan to Oct" };
const CHART_A = `<figure class="sb-fig sb-stack"><p class="cap" id="sbStackCap">What owners here did, by year</p>`
  + `<p class="key" aria-hidden="true"><span><i class="sw w"></i>Both within a week</span><span><i class="sw b"></i>Bought first</span><span><i class="sw f"></i>Sold first</span></p>`
  + `<table aria-labelledby="sbStackCap"><thead class="sr"><tr><th scope="col">Year of the sale</th><th scope="col">Both within a week</th><th scope="col">Bought first</th><th scope="col">Sold first</th></tr></thead><tbody>`
  + YRS.map((y) => {
    const r = Y[y];
    const td = (cls, v) => `<td class="s ${cls}" style="flex-grow:${v}">${Math.round(v)}%</td>`;
    return `<tr><th scope="row">${y}${YEAR_NOTE[y] ? `<small>${YEAR_NOTE[y]}</small>` : ""}</th>${td("w", r.same_week_pct)}${td("b", r.bought_first_pct)}${td("f", r.sold_first_pct)}</tr>`;
  }).join("")
  + `</tbody></table><figcaption>Owners who sold one Horry County home and bought another here within a year, by the year of the sale. Our count of county deeds: ${n0(N)} owners in all.</figcaption></figure>`;

/* ---- Drawing B (rows 4, 5, 8): how long each part takes, in days, on one scale. ---- */
const MAXD = 100;
const pctD = (d) => Math.round(d / MAXD * 1000) / 10;
const lane = (title, value, inner, cls = "") => `<div class="ln${cls ? " " + cls : ""}"><p class="who"><b>${title}</b><span>${value}</span></p><span class="tr" aria-hidden="true">${inner}</span></div>`;
const TIMES = `<figure class="sb-fig sb-time"><p class="cap">How long each part takes, in days</p>`
  + `<div role="img" aria-label="Selling a home in the Myrtle Beach area: about ${WK(T.listing_to_contract_median_days_avg)} weeks to a signed contract, then about ${WK(T.contract_to_closing_mean_days_avg)} weeks to closing, about 3 months in all. A typical owner here who bought first owned two homes for about 3 months; a typical owner who sold first was between homes for about 2 months.">`
  + lane("Selling a home here", "about 3 months",
    `<span class="s c" style="width:${pctD(T.listing_to_contract_median_days_avg)}%"></span><span class="s k" style="left:${pctD(T.listing_to_contract_median_days_avg)}%;width:${pctD(T.contract_to_closing_mean_days_avg)}%"></span>`, "sale")
  + `<p class="key"><span><i class="sw c"></i>To a signed contract: about ${WK(T.listing_to_contract_median_days_avg)} weeks</span><span><i class="sw k"></i>Then to closing: about ${WK(T.contract_to_closing_mean_days_avg)} weeks</span></p>`
  + lane("Buy first: owning two homes", "about 3 months", `<span class="s b" style="width:${pctD(WAY.bought_first.median_days_both_owned)}%"></span>`)
  + lane("Sell first: between homes", "about 2 months", `<span class="s f" style="width:${pctD(WAY.sold_first.median_days_between)}%"></span>`)
  + `<p class="ax"><span>0</span><span>30 days</span><span>60 days</span><span>90 days</span></p></div>`
  + `<figcaption>Selling: Zillow's figures for the Myrtle Beach area over the 12 months to September 2026. Buy first and sell first: the typical owner in our count of county deeds.</figcaption></figure>`;

/* ---- Plain lists under thin rules. ---- */
const plain = (items, label, id) => `<ul class="sb-plain"${id ? ` id="${id}"` : ""} aria-label="${label}">` + items.map(([b, t]) => `<li><b>${b}</b><p>${t}</p></li>`).join("") + `</ul>`;

/* ---- The steps of a sale contingency (rows 12 to 15), fsbo's numbered steps with no card around each. ---- */
const step = (n, title, text) => `<li><span class="n" aria-hidden="true">${n}</span><span class="c"><b>${title}</b>${text}</span></li>`;
const STEPS = `<ol class="sb-steps" id="sale-steps" aria-label="How an offer that depends on selling your home works in South Carolina">`
  + step(1, "The deadline", "You and the seller write in the date by which your own home must sell and close. If that date is missed, either side can end the contract by written notice, within the number of days you agreed on.")
  + step(2, "While you wait", "You must make a good-faith effort to sell your home, and keep the seller informed about that sale.")
  + step(3, "The seller keeps showing the house", "The seller can keep showing the house and accept a backup offer, a second offer that moves up if yours ends.")
  + step(4, "The notice", "If an offer comes in that does not depend on another sale, the seller can send you a notice on a second form, SCR505.")
  + step(5, "Your choice", "Within the days you agreed on, you choose one of four things. You can show that your home is under contract to close in time. You can drop the condition if you can buy without selling. You can step back to second place, or end the contract.")
  + `</ol>`;

/* ---- How to sell and buy within a week (row 23: rows 8, 9, 13, 17, 21 put in order). ---- */
const WEEK = `<ol class="sb-steps" id="same-week" aria-label="How to sell one home and buy the next within a week">`
  + step(1, "Pick your move day", "Choose the day you want to be in the next home. Both closing dates are set around it. We build the timeline for your sale and your purchase around that day.")
  + step(2, "Ask a lender what you can borrow", `Ask before you shop. The lender can tell you ${h.a("#lender-rules", "what it needs to see")} from your sale, such as the signed sale contract.`)
  + step(3, "List your home and start looking", `Do both at once. Over the past year, a typical home here took about ${WK(T.listing_to_contract_median_days_avg)} weeks to get a signed contract.`)
  + step(4, "Make your offer depend on your sale", `When you find the next home, offer with a closing date on your move day. Add the ${h.a("#sale-contingency", "addendum")}, form SCR504, so the purchase goes ahead only if your sale closes.`)
  + step(5, "Accept a buyer whose date fits", "Take an offer on your home that closes on your move day, or a few days before it.")
  + step(6, "Plan for a date that slips", `The closing date in each contract is a deadline. To move it, both sides sign a change to that contract. With a ${h.a("#rent-back", "rent-back")} on your sale, you can stay a few days if the purchase closes late.`)
  + `</ol>`;

/* ---- The photo: a home in Horry County, beside the three cards on a wide screen (round 1: the subject, not the deed office). ---- */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("conway-brick-house", PHOTOS[0].caption);
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const METHOD = `<div class="sb-notes"><p class="sb-small"><strong>How we counted.</strong> We read ${n0(MV.counts.resales)} home resales recorded in Horry County from July 2021 to October 2025. ${n0(MV.counts.resales_person_seller)} had one person as the first-named seller, named with a first name, a middle name or initial and a last name. Companies, trusts and estates were left out. We also left out names on more than 4 home deeds, such as investors and common names, which left ${n0(MV.counts.resales_person_seller_name_on_4_or_fewer_deeds)}.</p>`
  + `<p class="sb-small">For ${n0(MV.matched)} of those sales, the same name bought another Horry County home within a year before or after. ${n0(N)} of those buyers still own the new home. The county taxes it at the 4 percent rate for a home the owner claims as a legal residence. The true number of moves is higher. A couple named in a different order on the two deeds is missed, and so is a purchase in a trust's name.</p>`
  + `<p class="sb-small">Dates are the days the county recorded each deed. Days to a contract and to closing are Zillow's figures for the Myrtle Beach area.</p>`;
const LEGAL = `<p class="sb-small"><strong>Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, lenders or tax advisers, and nothing on this page is legal, loan or tax advice.</p></div>`;
const AFTER = () => METHOD + LEGAL + ph.credits().replace(GENERIC_CREDIT, "");

/* ---- The page's own styles (copied from the approved pilots and /sell/best-time-to-sell/, then this page's figures). ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const BRASS = "#c4783a", INK = "#8a5226", SLATE = "#56626e", PALE = "#c3c9cf";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line (pilots' design pass). */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  /* Our own figures: the one card style, 720 px. */
  + `${S} figure.sb-fig{max-width:720px;box-sizing:border-box;margin:1.4rem 0 1.6rem;padding:1.1rem 1.2rem 1rem;border-radius:20px;${CARD}}`
  + `${S} .sb-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .8rem;text-wrap:balance}`
  + `${S} .sb-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.9rem;padding:0!important}`
  + `${S} .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}`
  + `${S} .sb-fig .key{display:flex;flex-wrap:wrap;gap:.35rem 1.3rem;color:var(--muted);font-family:var(--sans);font-size:.95rem;margin:0 0 .8rem;max-width:none}`
  + `${S} .sb-fig .sw{display:inline-block;width:1.2rem;height:.75rem;border-radius:3px;margin-right:.45rem;vertical-align:middle}`
  + `${S} .sb-fig .sw.w,${S} .sb-fig .s.w{background:${INK}}${S} .sb-fig .sw.b,${S} .sb-fig .s.b{background:${SLATE}}${S} .sb-fig .sw.f,${S} .sb-fig .s.f{background:${PALE}}`
  + `${S} .sb-fig .sw.c,${S} .sb-fig .s.c{background:rgba(196,120,58,.42)}${S} .sb-fig .sw.k,${S} .sb-fig .s.k{background:${BRASS}}`
  /* Chart A: 100 percent bars, drawn as a real table (one row per year). */
  + `${S} .sb-stack table{width:100%;border-collapse:separate;border-spacing:0;margin:0 0 1rem}${S} .sb-stack tbody{display:grid;gap:.55rem}`
  + `${S} .sb-stack tr{display:flex;align-items:stretch;min-height:2.1rem}`
  + `${S} .sb-stack th{flex:0 0 4.2rem;margin-right:.7rem;text-align:left;align-self:center;padding:0;border:0;background:none;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1rem;line-height:1.15}`
  + `${S} .sb-stack th small{display:block;color:var(--muted);font-weight:400;font-size:.8rem;margin-top:.1rem}`
  + `${S} .sb-stack td.s{flex-basis:0;flex-shrink:1;min-width:0;display:flex;align-items:center;justify-content:center;padding:0;border:0;font-family:var(--sans);font-weight:700;font-size:.95rem;color:#fff}`
  + `${S} .sb-stack td.s.w{border-radius:8px 0 0 8px}${S} .sb-stack td.s.f{color:var(--navy);border-radius:0 8px 8px 0}${S} .sb-stack td.s+td.s{border-left:2px solid #f8f4ee}`
  /* Drawing B: lanes on one day scale. */
  + `${S} .sb-time .ln{margin:0 0 1rem}${S} .sb-time .ln.sale{margin-bottom:.45rem}`
  + `${S} .sb-time .who{display:flex;justify-content:space-between;align-items:baseline;gap:.8rem;margin:0 0 .35rem;max-width:none;line-height:1.45}`
  + `${S} .sb-time .who b{color:var(--navy);font-family:var(--sans);font-size:1rem}${S} .sb-time .who span{color:var(--muted);font-family:var(--sans);font-size:.95rem;white-space:nowrap}`
  + `${S} .sb-time .tr{position:relative;display:block;height:.95rem;border-radius:6px;background:rgba(28,32,40,.06)}`
  + `${S} .sb-time .s{position:absolute;top:0;bottom:0;left:0;border-radius:6px}${S} .sb-time .s.c{border-radius:6px 0 0 6px}${S} .sb-time .s.k{border-radius:0 6px 6px 0}`
  + `${S} .sb-time .key{margin:0 0 1.1rem}`
  + `${S} .sb-time .ax{display:grid;grid-template-columns:30fr 30fr 30fr 10fr;border-top:1px solid rgba(28,32,40,.16);margin:.2rem 0 1rem;padding-top:.35rem;max-width:none}`
  + `${S} .sb-time .ax span{color:var(--muted);font-family:var(--sans);font-size:.9rem;padding-left:.25rem;border-left:1px solid rgba(28,32,40,.16);white-space:nowrap}`
  /* The one chooser: three cards, one under another, each with its rows. */
  + `${S} .sb-cards{list-style:none;margin:1.1rem 0 1rem;padding:0;display:grid;gap:.8rem;max-width:720px}`
  + `${S} .sb-cards>li{margin:0;padding:1.05rem 1.2rem .5rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  + `${S} .sb-cards .k{display:block;font-family:var(--sans);font-size:.8rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin-bottom:.25rem}`
  + `${S} .sb-cards>li>b{display:block;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:1.3rem;line-height:1.3;margin-bottom:.6rem}`
  + `${S} .sb-cards dl{margin:0}${S} .sb-cards dl>div{padding:.55rem 0;border-top:1px solid rgba(28,32,40,.12)}`
  + `${S} .sb-cards dt{color:var(--navy);font-family:var(--sans);font-weight:700;font-size:.95rem;margin:0 0 .1rem}${S} .sb-cards dd{margin:0}${S} .sb-cards dd p{margin:0!important;max-width:none;font-size:1.02rem;line-height:1.55;color:var(--muted)}`
  + `@media (min-width:700px){${S} .sb-cards dl>div{display:grid;grid-template-columns:8.5rem minmax(0,1fr);gap:1rem}${S} .sb-cards dt{margin:0;padding-top:.08rem}}`
  /* Plain lists under thin rules. */
  + `${S} .sb-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:1.1rem;max-width:720px}`
  + `${S} .sb-plain>li{margin:0;padding:.85rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.65;font-size:1.0625rem}@media (min-width:700px){${S} .sb-plain>li{font-size:1.15rem}}`
  + `${S} .sb-plain>li>p{margin:0!important;max-width:none;font-size:inherit;line-height:inherit;color:inherit}${S} .sb-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.3rem}`
  /* The steps: numbers on a line, no card around each step (fsbo). */
  + `${S} .sb-steps{list-style:none;margin:1.3rem 0 1.5rem;padding:0;max-width:720px;position:relative}`
  + `${S} .sb-steps::before{content:"";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.14)}`
  + `${S} .sb-steps>li{position:relative;margin:0 0 1.35rem;padding:0 0 0 3.3rem}${S} .sb-steps>li:last-child{margin-bottom:0}`
  + `${S} .sb-steps .n{position:absolute;left:0;top:.05rem;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;box-shadow:0 0 0 4px #f8f4ee}`
  + `${S} .sb-steps .c{display:block;color:var(--muted);line-height:1.6;font-size:1.0625rem}@media (min-width:700px){${S} .sb-steps .c{font-size:1.15rem}}`
  + `${S} .sb-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* A wide screen: the photo beside the intro and the three cards. */
  + `@media (min-width:1100px){${S} .sb-side{display:grid;grid-template-columns:minmax(0,1fr) 400px;grid-template-rows:auto 1fr;column-gap:2.5rem;max-width:1040px;align-items:start}`
  + `${S} .sb-side>*{grid-column:1}${S} .sb-side>.c3-aerial{grid-column:2;grid-row:1/3;margin:.3rem 0 1.2rem!important;max-width:none!important}`
  + `${S} .sb-side>.c3-aerial figure{margin:0!important}}`
  /* The photo sits on the page: the picture and its caption, no card around it. */
  + `${S} figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px}`
  + `${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  + `${S} .sb-small{font-size:.85rem;color:var(--muted);line-height:1.65;max-width:600px;margin-top:1rem}@media (max-width:699px){${S} .sb-small{font-size:.88rem}}${S} .sb-small strong{color:var(--navy)}`
  /* Offer boxes: a larger button. */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .sb-cards b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* A phone: the three hero tiles as short rows. */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}`
  + `${S} figure.sb-fig{padding:1rem .9rem .9rem}${S} .sb-stack th{flex-basis:3.6rem;margin-right:.5rem}${S} .sb-stack td.s{font-size:.88rem}${S} .sb-cards>li{padding:1rem 1rem .4rem}}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from the pilots: the feed's search row at 320 px, the header phone at 1000 to 1100 px, the
     closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* The FAQ repeats only questions the page answers, said short. */
const FAQ = [
  { q: "Is it better to sell your house first, then buy?", a: "It is the safer order when your next purchase needs the money from this sale. You never own two homes at once. The cost is a move in between, and a rent-back in the home you sold can shorten that gap." },
  { q: "Can you close on both houses on the same day?", a: "Yes. About 1 in 9 Horry County owners who sold one home and bought another here had both deeds recorded on the same day. Both closing dates are set for that day, and the purchase offer depends on the sale." },
  { q: "What is a kick-out clause in South Carolina?", a: "South Carolina's forms do not use that name. The closest thing is a notice, form SCR505, under the sale-contingency addendum, form SCR504. A seller can send it when an offer comes in that does not depend on another sale. The SC REALTORS' legal staff say agents sometimes call the addendum a right of first refusal or a knockout clause." },
  { q: "How long can a seller rent back after closing?", a: "As long as the buyer agrees in writing. The buyer's loan can set a limit, as the rent-back section explains." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "Sell or Buy First in Myrtle Beach? Owners Split in Thirds",
  description: "Sell first, buy first, or both within a week? What Horry County owners did, how long each took, and how SC sale contingencies and rent-backs work.",
  ogTitle: "Sell or buy first in Myrtle Beach? What Horry County owners did, and how long each way took",
  crumb: "Sell or Buy First",
  eyebrow: "Selling a home",
  h1: "Sell or buy first in Myrtle Beach?",
  h1em: "About a third bought first, a third sold first, and a third did both within a week.",
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: `Whether to sell first or buy first, from what ${n0(N)} Horry County owners did when they moved from one home to another.`,
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Selling one home and buying another here? Start with what yours would sell for.", label: "Have us price your home", href: CTA },
  author: "devin",
  shortAnswer: [
    "Buy first if you can pay for two homes for about 3 months, with a lender's approval or cash. Sell first if you need the money from your sale, and can live somewhere else for about 2 months.",
    "You can also do both within a week, with an offer on the next home that depends on your sale. Those times are typical for Horry County owners: about half took less time, and half took longer.",
  ],
  sections: [
    { h2: "Which fits you: sell first, buy first, or both within a week?", toc: "Which way fits", id: "which-way", html: () =>
      ph.css() +
      `<div class="sb-side">` +
      h.p("Each way has its own cost: two homes at once, some weeks with no home of your own, or a purchase that depends on your sale.") +
      PHOTO +
      WAYS +
      `</div>` },

    { h2: "What do Horry County owners do: sell first or buy first?", toc: "What owners did", id: "what-owners-did", html: () =>
      h.p("More owners here now sell and buy within a week of each other. About 1 in 5 did in late 2021, and almost 4 in 10 did in 2025.") +
      CHART_A +
      h.p("Selling first fell from almost half of these moves to about 1 in 4. Buying first stayed near a third.") +
      h.p("Two in three of these owners paid more for their next home. A typical owner paid about 16 percent more than they sold for.") +
      h.p(`About a third bought a new home from a builder. Our ${h.a("/buyers/new-construction/", "new construction page")} covers builders and their contracts.`) },

    { h2: "How do you sell your house and buy another within a week?", toc: "Both within a week", id: "how-same-week", html: (bg) =>
      h.p("You list your home and shop for the next one at the same time. Then you line up the two closing dates, so you move once.") +
      WEEK +
      h.cta("Want your sale and purchase to close in the order you pick?", "Tell us your move day. We set your listing date and both closing dates to fit it.", "Have us line up both closings", CTA, bg) },

    { h2: "How long does it take to sell a house in Myrtle Beach?", toc: "How long it takes", id: "how-long", html: () =>
      h.p(`About 3 months from listing to closing in the Myrtle Beach area, over the past year. A typical home took about ${WK(T.listing_to_contract_median_days_avg)} weeks to get a signed contract, then about ${WK(T.contract_to_closing_mean_days_avg)} weeks to close.`) +
      h.p("That is about a month longer than the national figure. Owners here who bought first owned two homes for about the same time.") +
      TIMES +
      h.p(`The month you list changes the first part. Our page on ${h.a("/sell/best-time-to-sell/", "the best time to sell")} gives it month by month.`) },

    { h2: "Can you buy a house before you sell yours?", toc: "Buying first", id: "buy-first", html: (bg) =>
      h.p("Yes, if a lender approves you with both homes counted, or you pay cash.") +
      plain([
        ["Both homes' bills", `A lender counts ${h.ext(FNMA_REO, "the bills of both homes")}: the payment, taxes, insurance and any HOA dues. Once your home is under contract and your buyer can no longer back out over their loan, the lender can leave the old home's bills out.`],
        ["Which loans this covers", "That is the rule for a loan the lender sells to Fannie Mae, which buys home loans from lenders. Your lender can tell you if your loan is one of them."],
        ["Money to buy before you sell", `A ${h.ext(FNMA_BRIDGE, "bridge loan")} is a short loan to help you buy before you sell. A home equity line of credit (HELOC) is a loan against the home you own now. The lender decides on either one.`],
        ["If you keep the old home", `If you keep it as a second home, its bills count too. If you rent it out, the lender decides how much of the rent counts as income. Our page on ${h.a("/sell/rental-property/", "rental property")} covers renting it out.`],
      ], "What a lender counts when you buy before you sell", "lender-rules") +
      h.cta("Find out if a lender will count both homes", "We put you in touch with a loan officer at our preferred lender, who can tell you what you qualify for with both homes counted.", "Have us connect you with a lender", CTA, bg) },

    { h2: "How does an offer that depends on selling your house work in South Carolina?", toc: "Depending on your sale", id: "sale-contingency", html: () =>
      h.p(`You add an addendum, an extra page added to the purchase contract. In South Carolina it is the SC REALTORS ${h.ext(SCR504, "sale-contingency addendum")}, form SCR504.`) +
      h.p("Agents call it a sale contingency. The purchase goes ahead only if your own sale closes in time.") +
      STEPS +
      h.p("We write the days into the addendum with you. The closing attorney can explain what they mean for your own purchase.") +
      h.p("When you are the seller, a buyer's offer can come with the same addendum. The same steps then apply from the other side.") },

    { h2: "Can you sell your house and stay after closing?", toc: "Rent-back", id: "rent-back", html: (bg) =>
      h.p("Yes, if your buyer agrees in writing. This is called a rent-back: you stay in the house after closing and pay the buyer for the days you stay.") +
      plain([
        ["The standard contract", "Under the South Carolina REALTORS contract, the seller hands over the house empty and reasonably clean at closing, with all keys, codes and remotes. That changes only if seller and buyer agree otherwise in writing."],
        ["The buyer's loan", `A buyer with a loan sold to Fannie Mae who will live in the home must ${h.ext(FNMA_OCC, "move in within 60 days")} of signing the mortgage. A rent-back longer than 60 days does not fit that rule. Cash buyers and investors are outside it.`],
        ["What we put in writing", "The move-out day, the rent for each day, a deposit, who pays the power and water, and who insures what."],
      ], "Staying in the house after closing", "rent-back-rules") +
      h.cta("Need a few weeks in the house after you sell?", "We ask for the rent-back in your contract, so the days and the rent are agreed before closing day.", "Have us ask for a rent-back", CTA, bg) },

    { h2: "What happens to your property taxes if you own two homes for a while?", toc: "Property taxes", id: "taxes", html: () =>
      h.p("The old home can keep the lower rate for the year you move out, if your household does not claim it on the new home too. If you still own it the next year and do not live there, you can no longer claim the lower rate on it.") +
      plain([
        ["Why", `A home that was your legal residence for any part of a year is taxed at the ${h.ext(T12_43, "4 percent rate")} for that whole year. A home that is no longer your legal residence is taxed at 6 percent.`],
        ["The new home", `You apply for the 4 percent rate by January 15 of the year after the first tax year you claim it. You certify that no one in your household claims that rate on another home. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the rates in dollars.`],
        ["When you move out", "Tell the county assessor within six months of the change (SC Code 12-43-220)."],
        ["Selling it later", `To get the federal tax break on a home sale, you must have lived there for ${h.ext(IRS701, "2 of the 5 years")} before you sell. If you lived there at least 2 years, you have up to 3 years after moving out to sell and still pass that test. Our ${h.a("/sell/capital-gains/", "capital gains page")} covers the rest. A tax pro can tell you how it applies to your sale.`],
      ], "Property tax and income tax when you own two homes") },
  ],
  pageImages: [{ "@type": "ImageObject", url: `https://chapter3realty.com/${PHOTOS[0].file}`, contentUrl: `https://chapter3realty.com/${PHOTOS[0].file}`, width: PHOTOS[0].width, height: PHOTOS[0].height, description: PHOTOS[0].alt }],
  afterSources: () => AFTER(),
  faqTitle: "Sell or buy first FAQ",
  faq: FAQ,
  sources: [
    { name: "County deeds", href: DEEDS },
    { name: "County parcels", href: GIS },
    { name: "Zillow Research", href: ZR },
    { name: "Fannie Mae B3-6-06", href: FNMA_REO },
    { name: "Fannie Mae B3-4.3-14", href: FNMA_BRIDGE },
    { name: "Fannie Mae B2-1.1-01", href: FNMA_OCC },
    { name: "SC REALTORS on SCR504", href: SCR504 },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "IRS Topic 701", href: IRS701 },
  ],
  sourcesNote: "What owners did and how long it took: our count of county deeds, sales recorded July 2021 to October 2025. Sale times: Zillow, the Myrtle Beach area.",
  bottomCta: { h2: "Have us plan your move from one home to the next", p: "Tell us when you want to be in the next home. We plan your listing, your offer and both closings back from that day.", label: "Have us plan my move", href: CTA },
  keywords: "sell or buy first, should I sell my house before buying another, buy a house before selling mine, home sale contingency South Carolina, SCR504, kick-out clause, rent back after closing, bridge loan, sell and buy at the same time Myrtle Beach",
  about: "Whether to sell a home first or buy the next one first in Myrtle Beach and Horry County, South Carolina",
});
