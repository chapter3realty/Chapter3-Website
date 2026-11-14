/* /sell/fsbo/ - selling a house by owner (FSBO) in South Carolina: that it is legal, what it saves on the county's
 * middle resale home, the closing attorney, the state's disclosure form read question by question, what national and
 * Horry County records show about by-owner prices, how buyers find the house and who pays their agent, a decision
 * table, the steps in order, and the coaching offer with the live page's form.
 *
 * Batch 2026-11-a, Lane U. Version 1, 2026-11-04. The live page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-11-a/sell-fsbo/facts.md, VERIFIED rows, and CORRECTED rows only in the verifier's
 * wording (VERIFY.md). Struck wording: sell-fsbo-struck.json (no "the attorney prepares the deed", no exempt sale
 * without "only", no "28-question form", no "middle house", no "5 percent of home sales", no 38 percent, no "most
 * qualified buyers", no "we confirm the wiring", no "a seller of a home built before 1978").
 * Data, never typed (website working copy):
 *   data/2026-11-a/sell-fsbo/findings.json       the form's counts and coastal questions (rows 8, 9), NAR 2025 (rows
 *                                                17 to 19), the worked example (rows 14, 15), our same-surname count
 *                                                (rows 23, 24)
 *   data/2026-11-a/buyers-buying-in-myrtle-beach/market.json   houses for sale and price cuts (row 22, BMB's values)
 *   data/2026-11-a/sell-fsbo/photos.json         the one photo: raised beach houses at Surfside Beach, USGS 2011,
 *                                                public domain (the same frame as /invest/where-to-buy/, copied)
 * Kept from the live page: the coaching offer and its credit-back, the lead form with its consent text word for word
 * (source "fsbo-coaching"), the phone number, the practical steps (check the buyer can pay, show safely, never wire on
 * an emailed instruction), the links to home value and net proceeds, the FAQ questions readers search.
 * Cut: the 38 percent line (struck), the Clever survey lines, the ad spend and views (they disagree with /sell/; owner
 * question Q5), "four owners", "360,000 dollars" in words.
 * Owner questions still open (facts.md): Q1 the coaching fee (the page says "a flat fee" until he gives it), Q4 an MLS
 * entry for a coached seller (left out), Q7 who holds earnest money (left out). NEEDS.md lists them.
 * Fix round 1 (2026-11-04, REVIEW-1.md): the 9 percent county-value test is no longer set against the fee (it is one
 * line in the pricing section, with the 16 percent, as on /sell/home-value/); the "What moves your money" chart is cut;
 * the buyers section answers how owners reach buyers (row 28, NAR Exhibit 8-7, as a chart) and how a home gets on the
 * MLS (row 29); the attorney section says where the purchase contract comes from (row 30); the tax cards give the
 * hold-back rule and how it comes back (row 31); each fact is said once and the steps link back to it; the hero tiles
 * are what the seller came for; the hero lede is hidden (it repeated the short answer).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, kit, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/sell/fsbo/";
const DATA = path.join(__dirname, "..", "data", "2026-11-a");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("sell-fsbo/findings.json");
const MARKET = read("buyers-buying-in-myrtle-beach/market.json").kinds.house;
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");

/* ---- Rows 14 to 16: the worked example. ---- */
const PRICE = F.worked.price;
const DEED = Math.ceil(PRICE / 500) * 1.85;
const ONE = PRICE / 100;
const MISS = Math.round(PRICE * 0.088 / 1000) * 1000; // row 16: 8.8 percent at the median, "about $31,000"
if (PRICE !== 350000 || DEED !== F.worked.deed_fee || DEED !== 1295 || ONE !== F.worked.one_percent || MISS !== 31000) throw new Error("rows 14 to 16: the worked example moved");

/* ---- Rows 8, 9: the form. ---- */
if (F.form.numbered_questions !== 28 || F.form.addendum_questions !== 11 || F.form.coastal_count !== 7) throw new Error("rows 8, 9: the form's counts moved");

/* ---- Rows 17, 18: NAR 2025. ---- */
const NAR = F.nar_2025;
if (NAR.fsbo_share_pct !== 5 || NAR.agent_assisted_pct !== 91 || NAR.resort_area.fsbo_pct !== 9 || NAR.fsbo_knew_buyer_pct !== 3) throw new Error("row 17 moved");
const MP = NAR.median_price;
if (MP.fsbo_seller_knew_buyer !== 360000 || MP.fsbo_seller_did_not_know_buyer !== 372200 || MP.agent_assisted_only !== 425000) throw new Error("row 18 moved");
const HT = NAR.hardest_task;
if (HT.getting_the_price_right !== 17 || HT.none !== 42 || NAR.did_not_actively_market_pct !== 40) throw new Error("row 19 moved");

/* ---- Rows 23, 24: our same-surname count. ---- */
const SN = F.surnames, U = SN.under_100k;
if (SN.same_surname !== 73 || SN.person_to_person_resales !== 7522 || U.same !== 22 || U.other !== 294 || U.other_n !== 7449) throw new Error("rows 23, 24 moved");
if (SN.median_price.same_surname !== 200000 || SN.median_price.other_person_to_person !== 310000) throw new Error("row 24: middle prices moved");

/* ---- Row 22: houses for sale now (BMB's values: one fact, one value). ---- */
if (MARKET.for_sale !== 3710 || MARKET.price_cut !== 2061) throw new Error("row 22: BMB's listing counts moved");
const CUT_PCT = Math.round(100 * MARKET.price_cut / MARKET.for_sale);

/* ---- Links ---- */
const T40_57 = "https://www.scstatehouse.gov/code/t40c057.php";
const DOE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const T37_10 = "https://www.scstatehouse.gov/code/t37c010.php";
const EAO = "https://www.scbar.org/for-lawyers/quicklinks/legal-resources/ethics-advisory-opinions/ethics-advisory-opinion-06-11/";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const FORM = "https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf";
const EPA = "https://www.epa.gov/lead/real-estate-disclosures-about-potential-lead-hazards";
const T12_24 = "https://www.scstatehouse.gov/code/t12c024.php";
const T12_8 = "https://www.scstatehouse.gov/code/t12c008.php";
const NAR_REL = "https://nar.realtor/newsroom/first-time-home-buyer-share-falls-to-historic-low-of-21-median-age-rises-to-40";
const NAR_SET = "https://www.nar.realtor/the-facts/what-the-nar-settlement-means-for-home-buyers-and-sellers";
const LLR = "https://llr.sc.gov/re/RECPDF/Limited%20Market%20Exposure%20Guidance%20Document.pdf";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const FEMA = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2";
const IRS701 = "https://www.irs.gov/taxtopics/tc701";
const AG07 = "https://www.scag.gov/wp-content/uploads/2011/03/harrison-j-h-5-22-07-os-8395-unauthorized-practice-of-law.pdf";
const DOR26 = "https://dor.sc.gov/news/information-about-h-4216";
const NAR_PDF = "https://www.rirealtors.org/clientuploads/documents/NAR/Homebuyers_and_sellers_trend_2025.pdf";
const CFPB = "https://www.consumerfinance.gov/archive/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/";
const LEAD = "#lead-form";

/* ---- The three paths (rows 15, 20; the coaching offer from the live page; Q1 open). ---- */
const PATHS = compareCards([
  { name: "Sell it yourself", icon: "key", bestFor: "You do all of it", cells: { deed: money(DEED), list: "None", buyer: "Your choice", coach: "None" } },
  { name: "Sell it yourself, with our coaching", icon: "cards", bestFor: "You do it, we coach", cells: { deed: money(DEED), list: "None", buyer: "Your choice", coach: "Flat fee, credited if you list with us" } },
  { name: "List with an agent", icon: "home", bestFor: "The agent markets and sells it", cells: { deed: money(DEED), list: "What you agree with your broker", buyer: "Your choice", coach: "None" } },
], [
  { key: "deed", label: "Deed fee", num: true },
  { key: "list", label: "Listing broker's fee" },
  { key: "buyer", label: "Buyer's agent" },
  { key: "coach", label: "Coaching fee" },
], { caption: `Three ways to sell a ${money(PRICE)} home, and what each one costs you`, nameLabel: "How you sell", bestForLabel: "How it works" });

/* ---- The calculator: price and a fee percent the reader types. Fees are negotiable (row 20), so no rate is
   suggested; the box starts at 1 percent, the unit the page uses. Never a loan payment or a rate. ---- */
const CALC = `<div class="fs-calc" role="group" aria-labelledby="fsCalcT">`
  + `<p class="k" id="fsCalcT">Try your own price</p>`
  + `<div class="fs-in"><label for="fsPrice">Your price</label><span class="u">$ <input id="fsPrice" type="number" min="0" step="1000" value="${PRICE}" oninput="fsCalc()"></span></div>`
  + `<div class="fs-in"><label for="fsPct">A fee you were quoted, in percent</label><span class="u"><input id="fsPct" type="number" min="0" max="10" step="0.25" value="1" oninput="fsCalc()"> %</span></div>`
  + `<dl class="fs-out"><div><dt>The fee you do not pay</dt><dd id="fsFee">${money(ONE)}</dd></div>`
  + `<div><dt>Deed fee, owed either way</dt><dd id="fsDeed">${money(DEED)}</dd></div></dl>`
  + `<p class="n">The box starts at 1 percent. Type the fee an agent quoted you.</p></div>`
  + `<script>function fsCalc(){var g=function(i){var v=parseFloat(document.getElementById(i).value);return isFinite(v)&&v>0?v:0};`
  + `var m=function(n){return "$"+Math.round(n).toLocaleString("en-US")};var p=g("fsPrice"),f=g("fsPct");`
  + `document.getElementById("fsDeed").textContent=m(Math.ceil(p/500)*1.85);document.getElementById("fsFee").textContent=m(p*f/100)}</script>`;

/* ---- Row 3: who picks the attorney, as three cards. ---- */
const card = (k, title, text, hot) => `<li${hot ? ' class="hot"' : ""}><span class="k">${k}</span><b>${title}</b>${text}</li>`;
const ATTORNEY = `<ul class="fs-cards fs-3" aria-label="Who chooses the closing attorney">`
  + card("The buyer has a home loan", "The buyer chooses", "If the loan is for a home the buyer will live in, the buyer picks the closing attorney, and the lender must follow that choice.")
  + card("Every sale", "The contract can name one", "The contract can name the closing attorney and say who pays the attorney's fees. You and the buyer agree on it.")
  + card("You want advice", "Hire your own", "An attorney who represents only the buyer does not advise the seller. Advice on your side of the deal comes from your own attorney.", true)
  + `</ul>`;

/* ---- Rows 1, 2, 4, 11: the three duties, as numbered cards. ---- */
const DUTIES = `<ol class="fs-duties" aria-label="What every owner who sells must do in South Carolina">`
  + `<li><b>A South Carolina attorney supervises the closing</b>${h.a("#attorney", "Who picks the attorney")}</li>`
  + `<li><b>The buyer gets the state's disclosure form before the contract</b>${h.a("#paperwork", "What the form asks")}</li>`
  + `<li><b>Most homes built before 1978 need lead papers</b>${h.a("#lead", "Which homes")}</li></ol>`;

/* ---- Rows 8, 9: our drawing of the state's form, part by part (findings.json "form"). ---- */
const PARTS = [
  ["I", "Water and sewer", "Questions 1 to 4"],
  ["II", "Roof, gutters, foundation and floors", "Questions 5 to 7"],
  ["III", "Plumbing, electrical, appliances, heating and cooling", "Questions 8 to 14"],
  ["IV", "Termites, wood rot and other pests", "Describe"],
  ["V", "Zoning, rights of others to use your land, legal claims, water damage, flood and the beach", "Questions 15 to 28", true],
  ["VI", "Lead paint, asbestos, radon, buried tanks and mold", "Describe"],
  ["VII", "Leases and vacation rentals in place at closing", "Describe"],
  ["VIII", "Utility charges and equipment the utility financed", "Describe"],
  ["IX", "Whether the home is in an association", "Yes or No, then the addendum"],
];
if (PARTS.length !== 9 || !F.form.parts[4].startsWith("V. THE ZONING")) throw new Error("rows 8, 9: the form's parts moved");
/* Question 28 in plain words: the form's "beach nourishment assessment" is a charge for sand added to the beach. */
const COAST = Object.entries(F.form.coastal_questions).map(([k, v]) => [k, k === "28" ? "a charge for beach nourishment, sand added to the beach, while you owned it" : v]);
if (!/beach nourishment assessment/.test(F.form.coastal_questions["28"])) throw new Error("row 9: question 28 moved");
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const FORM_FIG = `<figure class="fs-fig"><p class="cap">What South Carolina's disclosure form asks, part by part</p>`
  + `<ol class="fs-form" aria-label="The nine parts of the South Carolina disclosure form">`
  + PARTS.map(([n, name, q, hot]) => `<li${hot ? ' class="hot"' : ""}><span class="pn">${n}</span><span class="pt">${name}</span><span class="pq">${q}</span>`
    + (hot ? `<span class="coast"><b>Questions 22 to 28, on the coast and flooding</b><ul>${COAST.map(([k, v]) => `<li><i>${k}</i>${cap(v.replace(/\s*\(.*?\)/, ""))}</li>`).join("")}</ul>Question 20 also asks whether the house flooded while you owned it.</span>` : "") + `</li>`).join("")
  + `</ol><figcaption>Our drawing of the state's form. Each numbered question is answered Yes, No or No Representation. Parts marked "Describe" have lines to write on.</figcaption></figure>`;

/* ---- Chart 2 (row 18): NAR middle prices. Chart 3 (row 24): our count. ---- */
const NAR_CHART = G.bars([
  { name: "By owner, seller knew the buyer", value: MP.fsbo_seller_knew_buyer },
  { name: "By owner, seller did not know the buyer", value: MP.fsbo_seller_did_not_know_buyer },
  { name: "Sold with an agent", value: MP.agent_assisted_only, reference: true },
], { caption: "Middle sale price in NAR's 2025 survey, by how the home sold", nameLabel: "How it sold", valueLabel: "middle price",
  note: "The groups sell different homes in different places, so the gap is not all price lost. The survey covers people who bought a home to live in and also sold one." });
const SN_CHART = G.bars([
  { name: "Seller and buyer share a last name", value: U.same / U.same_n * 100, valueText: "3 in 10", feature: `${U.same} of ${U.same_n} sales` },
  { name: "Other sales between people", value: U.other / U.other_n * 100, valueText: "1 in 25", feature: `${U.other} of ${U.other_n.toLocaleString("en-US")} sales`, reference: true },
], { caption: "Horry County home sales recorded under $100,000", nameLabel: "Who sold to whom", featureLabel: "how many", valueLabel: "share under $100,000",
  note: `Our count of the county's deeds, October 2025 to September 2026: resales between two people, with no company, trust, estate or builder on either side. The middle price was ${r1k(SN.median_price.same_surname)} when the two shared a last name and ${r1k(SN.median_price.other_person_to_person)} for the rest.` });

/* ---- Chart 4 (row 28): how by-owner sellers reached buyers, NAR 2025 Exhibit 8-7. Typed from the exhibit (the
   rendered page, fix1/p113-113.png); the check below holds it to the ledger. ---- */
const REACH = [
  ["A yard sign", 24], ["Friends, relatives or neighbors", 22], ["The MLS website", 20], ["An open house", 20],
  ["Realtor.com", 14], ["Sites that gather listings from many sources", 13], ["Social media", 9], ["For-sale-by-owner websites", 5],
];
if (REACH.map((r) => r[1]).join() !== "24,22,20,20,14,13,9,5" || NAR.did_not_actively_market_pct !== 40) throw new Error("row 28 moved");
const REACH_CHART = G.bars(REACH.map(([name, v]) => ({ name, value: v, valueText: `${v}%` }))
  .concat([{ name: "Did not actively market it", value: NAR.did_not_actively_market_pct, valueText: `${NAR.did_not_actively_market_pct}%`, reference: true }]),
  { caption: "How owners who sold by themselves reached buyers", nameLabel: "Way they reached buyers", valueLabel: "share of by-owner sellers", compact: true,
    note: "NAR's 2025 survey. Sellers could name more than one way, so the shares add to more than 100 percent." });

/* ---- Row 22: the market card. ---- */
const MARKET_CARD = `<div class="fs-stat"><p class="k">Houses for sale in Horry County now</p><ul>`
  + `<li><strong>About ${(Math.round(MARKET.for_sale / 100) * 100).toLocaleString("en-US")}</strong><span>houses listed for sale on the MLS, the database brokers share</span></li>`
  + `<li><strong>${CUT_PCT} percent</strong><span>of them have already cut their asking price. Buyers compare yours with all of them.</span></li></ul></div>`;

/* ---- Rows 5, 9, 25, and the offer: the decision table, as cards. ---- */
const DECIDE = `<ul class="fs-cards fs-2" aria-label="Should you sell by owner: your situation and what to do">`
  + card("You already have a buyer", "A relative, a neighbor or your tenant", `Selling it yourself fits best. There is no one to find, so the work is the papers and the closing. ${h.a("#no-form", "Sales that need no form")}`)
  + card("You are selling to a stranger", "You want the most money", `See ${h.a("#sell-for-less", "whether homes sold by owners sell for less")}, and what changes the price.`, true)
  + card("Your house is near the water", "Or in a flood zone", `Gather your flood papers before you list: insurance, past claims and repair bills. Questions 20 and 22 to 28 of the form ask about each.`)
  + card("You want to keep the fee", "But not do it alone", `You sell it yourself, and a licensed agent coaches you on the price, the form and the contract for a flat fee. ${h.a(LEAD, "Our coaching")}`)
  + `</ul>`;

/* ---- The steps (rows 2 to 4, 10, 11, 15, 27; practice steps kept from the live page). ---- */
const step = (n, when, title, text, law) => `<li${law ? ' class="hot"' : ""}><span class="n" aria-hidden="true">${n}</span><span class="c"><span class="t">${when}</span>${law ? '<span class="t law">Required by law</span>' : ""}<b>${title}</b>${text}</span></li>`;
const STEPS = `<ol class="fs-steps" aria-label="The steps to sell a house by owner in South Carolina, in order">`
  + step(1, "Before you list", "Set the price", `Price it from the recorded sales most like your home. Our ${h.a("/sell/home-value/", "home value page")} shows how.`)
  + step(2, "Before you list", "Fill in the papers", `The state's disclosure form, the HOA addendum if you have an association, and the ${h.a("#lead", "lead papers")} for most homes built before 1978.`, true)
  + step(3, "Showings", "Reach buyers and show the house", `Use the ways ${h.a("#buyers", "in the chart above")}. Keep valuables and medicines out of sight during showings.`)
  + step(4, "Before you sign", "Check that the buyer can pay", "Ask for a loan approval letter from a lender, or proof of the cash, before you sign anything.")
  + step(5, "Signing", "Hand over the form, then sign the contract", `The form comes first, unless the contract names another time. Agree in writing on the deposit and who holds it, the inspection period, the loan deadline and the closing date. ${h.a("#contract", "Who writes the contract")}`, true)
  + step(6, "After signing", "The buyer's lead test", `For most homes built before 1978, the buyer's ${h.a("#lead", "lead test period")} starts now.`, true)
  + step(7, "Before closing", "Keep the form up to date", `The ${h.a("#form-rules", "form rules")} apply until closing day.`, true)
  + step(8, "Closing day", "Sign, and get paid by wire", `${h.a("#paid", "Check the wiring instructions by phone")}. The deed fee comes out of the sale.`)
  + `</ol>`;

/* ---- The live page's lead form, its consent text word for word. ---- */
const CONSENT = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
const LEAD_FORM = `<div id="ldWrap" class="fs-form-box">`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldCtx" placeholder="Property address" aria-label="Property address" autocomplete="street-address"></div>`
  + `<div class="idx-lead"><input class="idx-input" id="ldName" placeholder="Your name" aria-label="Your name" autocomplete="name"><input class="idx-input" id="ldPhone" placeholder="Phone" aria-label="Phone" type="tel" autocomplete="tel"></div>`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldEmail" placeholder="Email" aria-label="Email" type="email" autocomplete="email"></div>`
  + `<label class="fs-consent"><input type="checkbox" id="ldConsent"><span>${CONSENT}</span></label>`
  + `<p id="ldErr" class="fs-err" role="alert"></p>`
  + `<button type="button" class="btn btn-brass btn-lg" onclick="ldSubmit()">Send my coaching request</button>`
  + `<p class="fs-tel">Free, no obligation. Prefer to talk now? Call <a href="tel:+18543332135">854.333.2135</a>.</p></div>`
  + `<div id="ldOk" class="fs-ok">Thanks. A licensed team member will reach out the same day, evenings included, to explain the coaching and build your free pricing analysis.</div>`
  + `<script>function ldSubmit(){`
  + `var cx=document.getElementById('ldCtx').value.trim(),n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),em=document.getElementById('ldEmail').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');`
  + `function fail(m){err.textContent=m;err.style.display='block';}err.style.display='none';`
  + `if(!cx||!n){fail('Add the property address and your name.');return;}`
  + `if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}`
  + `if(!c){fail('Check the consent box to send the request.');return;}`
  + `c3SendForm({property_address:cx,name:n,phone:ph,email:em,consent:c?'yes':'no'},'fsbo-coaching');`
  + `document.getElementById('ldWrap').style.display='none';document.getElementById('ldOk').style.display='block';}</script>`;

/* ---- The photo (VERIFY.md, Photos: cleared; caption per the verifier, every seller answers these). ---- */
const PHOTOS = read("sell-fsbo/photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "760px" });
const PHOTO = ph.aerial("raised-beach-houses-surfside-beach", PHOTOS[0].caption);
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, and nothing on this page is legal or tax advice. For advice on your own sale, talk to a South Carolina attorney.</p>`;
const AFTER = () => { const c = ph.credits(); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* ---- The glance row under the H1 (rows 8, 15, 22). ---- */
const GLANCE = PK.glance([
  { icon: "dollar", label: money(ONE), text: `kept per 1 percent of fees on a ${money(PRICE)} home` },
  { icon: "cards", label: "3 legal duties", text: "for most owners who sell" },
  { icon: "key", label: "8 steps", text: "from the price to closing day" },
]);

/* ---- The page's own styles. ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const RED = "#a8482f", BRASS = "#c4783a", INK = "#8a5226";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line (design pass 2026-11-07). */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  /* One block width (720 px, as the contents box and the offers). Text stays at its own measure. */
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  /* the form drawing: one card, plain rows, part V outlined */
  + `${S} figure.fs-fig{max-width:720px;margin:1.3rem 0 1.5rem;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}`
  + `${S} .fs-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .7rem}`
  + `${S} .fs-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.7rem}`
  /* the three duties: a plain numbered row under a thin rule */
  + `${S} .fs-duties{list-style:none;counter-reset:d;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:1rem 2rem;max-width:720px}`
  + `@media (min-width:760px){${S} .fs-duties{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .fs-duties li{counter-increment:d;position:relative;margin:0;padding:.85rem 0 0 2.6rem;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.55}`
  + `${S} .fs-duties li::before{content:counter(d);position:absolute;left:0;top:.85rem;display:inline-flex;align-items:center;justify-content:center;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.9rem}`
  + `${S} .fs-duties b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.3rem}`
  + `${S} .fs-duties a{display:block;margin-top:.45rem;font-family:var(--sans);font-size:.95rem;font-weight:600}`
  /* cards, only for the two choosers: the attorney, your situation */
  + `${S} .fs-cards,${S} .fs-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.75rem;max-width:720px}`
  + `@media (min-width:760px){${S} .fs-2{grid-template-columns:repeat(2,minmax(0,1fr))}${S} .fs-3{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .fs-cards li{margin:0;padding:1rem 1.1rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  + `${S} .fs-cards .k,${S} .fs-plain .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin-bottom:.3rem}`
  + `${S} .fs-cards b,${S} .fs-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.3rem}`
  /* short facts: a plain list under thin rules */
  + `${S} .fs-plain{gap:1.1rem 2rem}${S} .fs-plain li{margin:0;padding:.85rem 0 0;border-top:1px solid rgba(28,32,40,.16);color:var(--muted);line-height:1.55}`
  /* the calculator */
  + `${S} .fs-calc{max-width:600px;margin:1.4rem 0 1.5rem;padding:1.25rem 1.3rem 1.1rem;border-radius:20px;box-sizing:border-box;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14);color:var(--ivory);font-family:var(--sans)}`
  + `${S} .fs-calc .k{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);font-weight:600;margin:0 0 .9rem}`
  + `${S} .fs-in{display:flex;justify-content:space-between;align-items:center;gap:.8rem;margin:0 0 .7rem;flex-wrap:wrap}`
  + `${S} .fs-in label{color:rgba(244,239,232,.92);font-size:1rem;flex:1 1 10rem}${S} .fs-in .u{white-space:nowrap;color:rgba(244,239,232,.7)}`
  + `${S} .fs-in input{width:9rem;min-height:44px;box-sizing:border-box;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.4);border-radius:8px;color:#f4efe8;font-family:var(--sans);font-size:1.05rem;padding:.4rem .6rem;text-align:right}`
  + `${S} .fs-in #fsPct{width:5.5rem}`
  + `${S} .fs-out{margin:1rem 0 0;padding:.9rem 0 0;border-top:1px solid rgba(244,239,232,.22);display:grid;gap:.55rem}`
  + `${S} .fs-out div{display:flex;justify-content:space-between;align-items:baseline;gap:1rem}${S} .fs-out dt{color:rgba(244,239,232,.88);font-size:1rem}`
  + `${S} .fs-out dd{margin:0;color:var(--brass-2);font-family:var(--serif);font-size:1.45rem;line-height:1.1;white-space:nowrap}`
  + `${S} .fs-calc .n{margin:.8rem 0 0;color:rgba(244,239,232,.75);font-size:.95rem;line-height:1.5}`
  /* A wide screen: the calculator beside the two paragraphs that explain it, the photo beside the flood paragraph. */
  + `@media (min-width:1100px){${S} .fs-side{display:grid;grid-template-columns:minmax(0,1fr) 360px;grid-template-rows:auto 1fr;column-gap:2.5rem;max-width:960px;align-items:start}`
  + `${S} .fs-side>*{grid-column:1}${S} .fs-side>.fs-calc,${S} .fs-side>.c3-aerial{grid-column:2;grid-row:1/3;margin:.3rem 0 1.2rem!important;max-width:none}`
  + `${S} .fs-side>.c3-aerial{margin-top:1.75rem!important}${S} .fs-side>.c3-aerial figure{margin:0!important}`
  + `${S} .fs-side .fs-in label{flex:1 1 6rem}${S} .fs-side .fs-in input{width:7.5rem}${S} .fs-side .fs-in #fsPct{width:5rem}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px}`
  + `${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.92rem}`
  /* the drawing of the form */
  + `${S} .fs-form{list-style:none;margin:0;padding:.4rem 1rem;border-radius:18px;${CARD};display:grid;gap:0}`
  + `${S} .fs-form>li{display:grid;grid-template-columns:2.4rem minmax(0,1fr);gap:.1rem .7rem;align-items:center;margin:0;padding:.6rem 0;border-top:1px solid rgba(28,32,40,.1)}${S} .fs-form>li:first-child{border-top:0}`
  + `${S} .fs-form .pn{grid-row:span 2;display:inline-flex;align-items:center;justify-content:center;height:2rem;border-radius:6px;background:var(--navy);color:#fff;font-family:var(--serif);font-size:.9rem}`
  + `${S} .fs-form .pt{color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1rem;line-height:1.3}`
  + `${S} .fs-form .pq{color:var(--muted);font-family:var(--sans);font-size:.92rem}`
  + `${S} .fs-form>li.hot{margin:.3rem -.6rem;padding:.7rem .6rem;border:2px solid ${BRASS};border-radius:12px;background:rgba(196,120,58,.08)}${S} .fs-form>li.hot+li{border-top:0}${S} .fs-form li.hot .pn{background:${INK}}`
  + `${S} .fs-form .coast{grid-column:1/-1;margin-top:.55rem;padding:.6rem 0 0;border-top:1px solid rgba(196,120,58,.35);color:var(--muted);font-size:.98rem;line-height:1.5}`
  + `${S} .fs-form .coast b{display:block;color:var(--navy);font-family:var(--sans);margin-bottom:.35rem}${S} .fs-form .coast ul{list-style:none;margin:0 0 .5rem;padding:0;display:grid;gap:.3rem}${S} .fs-form .coast li{display:flex;gap:.55rem;align-items:baseline;padding:0;margin:0}${S} .fs-form .coast i{flex:none;font-style:normal;font-family:var(--sans);font-weight:700;font-size:.85rem;color:#fff;background:${INK};border-radius:6px;padding:.05rem .4rem}`
  /* two numbers: large figures under a thin rule, no dark box */
  + `${S} .fs-stat{max-width:720px;margin:1.2rem 0 1.5rem}`
  + `${S} .fs-stat .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .fs-stat ul{list-style:none;margin:0;padding:0;display:grid;gap:1rem 2rem}@media (min-width:600px){${S} .fs-stat ul{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .fs-stat li{margin:0;padding:.75rem 0 0;border-top:1px solid rgba(28,32,40,.16)}${S} .fs-stat strong{display:block;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,6vw,2.1rem);line-height:1.05;margin-bottom:.3rem}`
  + `${S} .fs-stat span{display:block;color:var(--muted);line-height:1.5;font-size:1rem}`
  /* the lead rule: a note with a left rule, at the text's size */
  + `${S} .fs-lead-box{max-width:665px;margin:1.4rem 0 1.5rem;padding:.15rem 0 .15rem 1.1rem;border-left:3px solid ${BRASS};color:var(--muted);line-height:1.6}`
  + `${S} .fs-lead-box b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;margin-bottom:.3rem}`
  /* the steps: numbers on a line, no card around each step */
  + `${S} .fs-steps{list-style:none;margin:1.3rem 0 1.5rem;padding:0;max-width:720px;position:relative}`
  + `${S} .fs-steps::before{content:"";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.14)}`
  + `${S} .fs-steps>li{position:relative;margin:0 0 1.35rem;padding:0 0 0 3.3rem}${S} .fs-steps>li:last-child{margin-bottom:0}`
  + `${S} .fs-steps .n{position:absolute;left:0;top:.05rem;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;box-shadow:0 0 0 4px #f8f4ee}`
  + `${S} .fs-steps li.hot .n{background:${RED}}`
  + `${S} .fs-steps .c{display:block;color:var(--muted);line-height:1.55}`
  + `${S} .fs-steps .t{display:inline-block;margin:0 0 .3rem;padding:.1rem .55rem;border-radius:999px;background:rgba(28,32,40,.07);color:var(--navy);font-family:var(--sans);font-size:.85rem;font-weight:600}`
  + `${S} .fs-steps .t.law{margin-left:.35rem;background:rgba(168,72,47,.12);color:#8f3a24}${S} .fs-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* the coaching list: checks under thin rules */
  + `${S} .fs-coach{list-style:none;margin:1rem 0 1.3rem;padding:0;display:grid;gap:0 2rem;max-width:720px}@media (min-width:700px){${S} .fs-coach{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .fs-coach li{margin:0;padding:.7rem 0 .7rem 2rem;position:relative;border-top:1px solid rgba(28,32,40,.16);color:var(--navy);font-family:var(--sans);line-height:1.45}`
  + `${S} .fs-coach li::before{content:"";position:absolute;left:.15rem;top:.95rem;width:.95rem;height:.55rem;border-left:3px solid ${BRASS};border-bottom:3px solid ${BRASS};transform:rotate(-45deg)}`
  /* the lead form */
  + `${S} .fs-form-box{max-width:720px;margin:1.4rem 0 1rem;padding:1.4rem 1.3rem;border-radius:20px;box-sizing:border-box;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14)}`
  + `${S} .fs-form-box .idx-lead{margin-bottom:.7rem}${S} .fs-form-box .idx-input{min-height:48px;font-size:1.0625rem}`
  + `${S} .fs-consent{display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.875rem;color:rgba(244,239,232,.86);line-height:1.5;margin:.3rem 0 1rem;cursor:pointer}`
  + `${S} .fs-consent input{margin-top:.2rem;accent-color:#c4783a;flex-shrink:0;width:20px;height:20px}`
  + `${S} .fs-form-box .btn{width:100%;justify-content:center;min-height:50px}`
  + `${S} .fs-err{display:none;color:#ffb4a8;font-family:var(--sans);font-size:1rem;margin:0 0 .8rem}`
  + `${S} .fs-tel{color:rgba(244,239,232,.86);font-family:var(--sans);font-size:1rem;margin:.8rem 0 0}${S} .fs-tel a{color:var(--brass-2)}`
  + `${S} .fs-ok{display:none;max-width:720px;margin:1.4rem 0 1rem;padding:1.3rem;border-radius:20px;background:var(--navy);color:var(--ivory);font-family:var(--sans);font-size:1.0625rem;line-height:1.6}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .fs-cards b,${S} .fs-steps b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* a phone: the three hero tiles as short rows, not squeezed columns */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid rgba(28,32,40,.16)!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid rgba(28,32,40,.16)!important}}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from /hoa/documents/: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* The FAQ repeats only questions the page answers, said short. */
const FAQ = [
  { q: "Who pays the deed stamps when you sell by owner in South Carolina?", a: `The seller pays them, whether or not an agent is involved: ${money(DEED)} on a ${money(PRICE)} sale.` },
  { q: "Can I sell my house to my son or daughter without the disclosure form?", a: "Yes, if the sale is only to your children, grandchildren, parents or grandparents. If your child's spouse is also a buyer, the sale needs the form." },
  { q: "Do I have to tell a buyer that someone died in the house?", a: "No. South Carolina does not require it. If a buyer asks you directly, you may not lie about it." },
  { q: "Can I sell my house as is in South Carolina?", a: "Yes. An as-is sale still needs the state's disclosure form, unless it is one of the sales that need no form, such as some family sales." },
  { q: "Can a buyer use their own agent to buy a for-sale-by-owner home?", a: "Yes. The buyer's written agreement with their agent says how that agent is paid. You can offer to pay that agent, or offer the buyer a credit toward their costs." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "Sell Your House by Owner in South Carolina (FSBO) | Chapter3",
  description: "Can you sell your house by owner in South Carolina? What it saves on a $350,000 Horry County home, the state form, the attorney and the steps.",
  ogTitle: "Selling your house by owner in South Carolina: what it saves, the state form, the attorney and the steps",
  crumb: "For Sale By Owner",
  eyebrow: "Selling a home",
  h1: "Selling your house by owner in South Carolina",
  h1em: "What it saves on a Myrtle Beach-area home, and the three things the law requires.",
  /* Required by mkpage; hidden on the page (the first section's style), since it repeated the short answer (owner's eye, round 1). */
  sub: "The money, the state's form, the attorney and the eight steps of a sale by owner, worked on a home at the county's middle price.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Get a free price for your home, whether you sell it yourself or list", label: "Get my free price", href: LEAD },
  author: "devin",
  shortAnswer: [
    "Yes. You can sell your house by owner in Myrtle Beach, or anywhere in South Carolina, without a real estate agent or a license. A South Carolina attorney must supervise the closing, and you give the buyer the state's disclosure form before you both sign the contract.",
    `In Horry County, the middle-priced home resold in the year to September 2026, not counting condos, sold for about ${money(PRICE)}. On that home, each 1 percent of fees you do not pay is ${money(ONE)}.`,
  ],
  sections: [
    { h2: "Can you sell your own house in South Carolina without a real estate agent?", toc: "Is it legal", id: "is-it-legal", html: () =>
      ph.css() + "<style>main#main .detail-hero .detail-sub{display:none}</style>" +
      h.p(`Yes. South Carolina's ${h.ext(T40_57, "license law")} does not apply to an owner selling their own home, so you need no real estate license. This is called selling "for sale by owner", or FSBO.`) +
      h.p("Three duties apply to most owners who sell, with or without an agent:") +
      DUTIES },

    { h2: "How much do you save selling by owner on a Myrtle Beach-area home?", toc: "What you save", id: "what-you-save", html: (bg) =>
      `<div class="fs-side">` + h.p(`You save the listing broker's fee, what you would pay an agent to market and sell the home. Try it with your own price and the fee you were quoted:`) +
      CALC +
      h.p(`Two costs stay the same with or without an agent. You owe the deed fee, also called ${h.ext(T12_24, "deed stamps")}: $1.85 for each $500 of the price. You also pay your share of the closing attorney's fee. Ask the attorney's office for its fee in writing before the contract says who pays it.`) + `</div>` +
      h.p(`The three ways to sell differ in who markets the house, who handles the papers and who you pay:`) +
      PATHS +
      h.p(`Our ${h.a("/sell/net-proceeds/", "net proceeds calculator")} works out what you keep after your loan payoff.`) +
      h.cta("What would you keep, by owner or with an agent?", "Send the address. We price the home from recorded county sales and work out what you keep both ways, free.", "Have us work out what you keep", LEAD, bg) },

    { h2: "Do you need a lawyer to sell a house by owner in South Carolina?", toc: "The attorney", id: "attorney", html: () =>
      h.p(`Yes, for the closing, the meeting where the buyer pays and you sign the house over. Every home closing in South Carolina ${h.ext(DOE, "must be supervised")} by a South Carolina attorney.`) +
      h.p("Preparing a deed for someone else is the practice of law. Anyone who prepares your deed for you, the paper that transfers the house, must be a lawyer.") +
      h.h3("Who picks the closing attorney?") +
      ATTORNEY +
      `<h3 id="contract" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">Who writes the purchase contract?</h3>` +
      h.p(`A 2007 opinion of the state Attorney General's office looked at agents who fill in the blanks of a printed sale contract an attorney wrote. If the buyer has an agent, the offer may come to you on that kind of form.`) +
      h.p(`The ${h.ext(AG07, "office")} said that does not appear to be the practice of law, if no legal advice is given or asked for. The state Supreme Court has the final word. Preparing a legal paper for someone else is the practice of law when it involves legal advice. Advice on the contract's terms comes from a lawyer. A South Carolina attorney can write the contract for you, or read the buyer's before you sign.`) +
      `<h3 id="paid" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">How you get paid safely</h3>` +
      h.p(`Closing money often moves by wire transfer, and ${h.ext(CFPB, "scammers send fake wiring instructions")} by email. Never follow wiring instructions in an email. Confirm them by phone with the attorney's office, at a number you agreed on in advance.`) },

    { h2: "What paperwork do you need to sell by owner in South Carolina?", toc: "The paperwork", id: "paperwork", html: (bg) =>
      h.p(`The main paper is the state's ${h.ext(FORM, "Residential Property Condition Disclosure Statement")}, a form where you tell the buyer what you know about the home. ${h.ext(T27_50, "State law")} requires it for a home with one to four units, unless the sale is one of the kinds ${h.a("#no-form", "listed below")} that need no form. The form is free. Our guide to ${h.a("/sell/seller-disclosure/", "the South Carolina seller disclosure form")} goes through all 28 questions.`) +
      h.p("The form has nine parts. It asks 28 numbered questions, each answered Yes, No or No Representation, plus lines where you describe things such as the roof's age, pests and leases.") +
      FORM_FIG +
      h.p(`A home in a homeowners association (HOA), a property owners association or a condo also needs the form's addendum. It asks 11 more questions and lists the dues and the association's contact. Our ${h.a("/hoa/documents/", "HOA documents page")} lists the association papers a buyer will ask for.`) +
      `<div class="fs-side">` + h.h3("Why the flood questions matter here") +
      PHOTO +
      h.p(`FEMA has paid 8,815 flood insurance claims in Horry County since 1978. Nearly 1 in 4 were on buildings rated outside the high-risk flood zone. That is why questions 23 to 27 matter here, even away from the water. Our ${h.a("/buyers/undisclosed-flooding/", "flood history page")} shows what a buyer can find out about a home's flood past.`) + `</div>` +
      `<h3 id="form-rules" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">Four rules about the form</h3>` +
      `<ul class="fs-plain fs-2" aria-label="Four rules about the disclosure form">`
      + card('"No Representation"', "Not a way to skip a question", "It means you do not know enough to answer Yes or No. It does not protect you if you know of the problem.")
      + card("After you hand it over", "Correct it if anything changes", "If the roof starts to leak before closing, you must correct the form or repair the roof.")
      + card("If you leave something out", "You can owe the buyer", "A seller who knowingly leaves a problem off the form, or answers falsely, can owe the buyer their actual losses and court costs. A court may add the winner's attorney fees.", true)
      + card("Selling as is", "The form still applies", `You can sell "as is", which means without repairs. An as-is sale still needs the form, unless it is one of the sales listed below.`)
      + `</ul>` +
      h.p("Not giving the form does not cancel the contract or stop the closing.") +
      h.h3("What you do not have to tell a buyer") +
      h.p("You do not have to disclose that someone died in the home. You also do not have to disclose an illness of someone who lived there if it is highly unlikely to spread by living in the home. The same goes for the sex offender registry. If a buyer asks you directly, you may not lie.") +
      `<h3 id="no-form" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">Sales that need no form</h3>` +
      h.p("South Carolina lists 15 kinds of sale that need no form. Among them:") +
      h.ul([
        "A sale only to your spouse, or only to your children, grandchildren, parents or grandparents. If your child's spouse is also a buyer, the sale needs the form.",
        "A sale only between co-owners.",
        "A sale by an executor or trustee settling an estate or a trust.",
        "The first sale of a home no one has lived in.",
        "A sale at public auction.",
        "Any sale where buyer and seller both agree in writing to skip the form.",
      ]) +
      `<div class="fs-lead-box" id="lead"><b>Homes built before 1978</b>A seller of most homes built before 1978 must also give the buyer the ${h.ext(EPA, "federal lead pamphlet")}. You also say what you know about lead paint and hand over any lead reports. The contract must include a lead warning statement. The buyer gets 10 days to test for lead, unless both agree in writing to a different period or the buyer waives it. Keep the signed form for three years. Four cases are not covered. One is a unit with no bedroom. Another is housing for older people or people with disabilities where no child under six lives. The others are a home a certified inspector found free of lead paint, and a foreclosure sale.</div>` +
      h.cta("Want a licensed agent to read your form first?", "Send us your filled-in form before a buyer sees it. Our agents read every answer and mark the ones a buyer will ask about.", "Send us your form to review", LEAD, bg) },

    { h2: "Do houses sold by owner sell for less?", toc: "By-owner prices", id: "sell-for-less", html: () =>
      h.p(`Nationally, yes, but many of those sales were to someone the seller knew. NAR, the National Association of Realtors, surveys people who bought a home to live in and also sold one. In ${h.ext(NAR_REL, "its 2025 survey")}, 5 percent sold by owner, the lowest share in NAR's records.`) +
      h.p(`More than half of by-owner sellers already knew the buyer. In resort and recreation areas, 9 percent sold by owner.`) +
      NAR_CHART +
      h.p(`County deeds point the same way for sales between people who share a last name. We read the county's deed index for a year and compared those sales with other sales between two people. To search that index yourself, see our ${h.a("/buyers/property-records/deeds/", "guide to searching Horry County deeds by name")}.`) +
      SN_CHART +
      h.p(`A shared last name is not proof of family, and relatives with different last names are missed. Even so, those ${SN.same_surname} sales recorded far lower prices.`) +
      h.h3("Selling to a stranger") +
      h.p("Selling to a stranger is a different job. The price has to come from the sales most like your home, and enough buyers have to see the house.") +
      h.p(`Asked the hardest part, ${HT.getting_the_price_right} percent of by-owner sellers named getting the price right, more than any other task.`) +
      h.p(`Two quick numbers are a poor guide to a price. We checked both against 4,919 house resales recorded this year. On a typical house, each was this far off the sale price:`) +
      `<div class="fs-stat"><p class="k">How far off, on a typical house</p><ul>`
      + `<li><strong>9 percent</strong><span>the county's value, an estimate made for tax</span></li>`
      + `<li><strong>16 percent</strong><span>the middle price of the six nearest sales</span></li></ul></div>` +
      h.p(`Our ${h.a("/sell/home-value/", "home value page")} shows the test.`) },

    { h2: "How will buyers find your house, and do you have to pay their agent?", toc: "Finding buyers", id: "buyers", html: (bg) =>
      h.p(`Owners who sell by themselves reach buyers with a yard sign, word of mouth, open houses and listing websites. This chart shows how by-owner sellers in ${h.ext(NAR_PDF, "NAR's 2025 survey")} did it:`) +
      REACH_CHART +
      h.p("The MLS is the database real estate brokers share to list homes for sale, so an owner gets on it through a broker. In NAR's survey, 7 percent of sellers who used an agent said the agent put the home on the MLS and did little else.") +
      h.p("On the MLS, your house competes with every other home for sale:") +
      MARKET_CARD +
      h.p(`${h.ext(LLR, "Broad marketing")} generally exposes a home to the greatest number of qualified buyers. Keeping a home off the open market may reduce buyer competition and may hurt the price, terms or time to sell.`) +
      `<h3 id="buyers-agent" style="font-family:var(--serif);font-size:1.25rem;color:var(--navy);margin:1.6rem 0 .6rem">Do you have to pay the buyer's agent?</h3>` +
      h.p(`No rule requires it. Since August 2024, an agent who uses the MLS ${h.ext(NAR_SET, "signs a written agreement")} with a buyer before touring a home. Offers to pay the buyer's agent are no longer made on the MLS.`) +
      h.p("You can still offer to pay the buyer's agent off the MLS, or offer the buyer a credit toward their costs. Agents' fees are negotiable, and no law names an amount.") +
      h.cta("A price from the sales next to yours", "We pull the recorded sales closest to your home and send you a price range, free, whether you sell by owner or list.", "Have us find the sales closest to yours", LEAD, bg) },

    { h2: "Is selling by owner a good idea for you?", toc: "Is it for you", id: "for-you", html: () =>
      h.p("The answer changes with who the buyer is and where the house is. Find your situation:") +
      DECIDE },

    { h2: "What are the steps to sell a house by owner in South Carolina?", toc: "The steps", id: "steps", html: (bg) =>
      h.p(`Eight steps, from the price to the money in your account. Steps marked "Required by law" come from state or federal rules.`) +
      STEPS +
      h.h3("Do you pay tax on the sale?") +
      h.p(`Often not. Under ${h.ext(IRS701, "federal tax law")}, you can leave part or all of your gain out of your income.`) +
      `<ul class="fs-plain fs-2" aria-label="Tax on the sale of a home">`
      + card("How much", "Up to $250,000 of gain", "Or $500,000 of gain for a married couple filing jointly.")
      + card("Who qualifies", "You lived there 2 of 5 years", "You owned and lived in the home at least 2 of the last 5 years. You did not use this exclusion on another home in the 2 years before.")
      + card("You live in another state", "The buyer holds back state tax", `For a 2026 sale it is 5.21 percent. It is figured on your gain if you sign the state's ${h.ext(T12_8, "gain affidavit")}, Form I-295, or on the whole price if you do not. A main home whose gain fits inside the federal exclusion has none.`, true)
      + card("Getting it back", "Your South Carolina return", "File a South Carolina return for the year of the sale. The amount held back counts toward the tax you owe there. You can ask for a refund of any amount held back beyond the tax.", true)
      + `</ul>` +
      h.p(`Our ${h.a("/sell/capital-gains/", "capital gains page")} works through the tax when the gain is larger.`) +
      h.cta("Do the eight steps with a coach", "You sell it yourself. We coach you on the price, the form, the contract and closing day, for a flat fee.", "Have us coach your sale", LEAD, bg) },

    { h2: "What does Chapter3's coaching for owners include?", toc: "Our coaching", id: "lead-form", html: () =>
      h.p("You list and sell the home yourself, and keep what you save. A licensed Chapter3 agent coaches you through it for a flat fee:") +
      `<ul class="fs-coach" aria-label="What the coaching covers">${["The price, from county sales of similar homes", "The state's form, read before a buyer sees it", "The purchase contract and its deadlines", "Checking a buyer's loan approval or proof of cash", "Lining up the closing attorney and closing day", "Whether listing is worth the fee for your house"].map((x) => `<li>${x}</li>`).join("")}</ul>` +
      h.p("If you decide to list with us at any point, the full coaching fee is credited back. The price check is free either way.") +
      h.p("We are paid the flat coaching fee if you sell it yourself. If you list with us, we are paid the listing fee you agree with us, less the coaching fee you already paid.") +
      LEAD_FORM },
  ],
  pageImages: [{ "@type": "ImageObject", url: `https://chapter3realty.com/${PHOTOS[0].file}`, contentUrl: `https://chapter3realty.com/${PHOTOS[0].file}`, width: PHOTOS[0].width, height: PHOTOS[0].height, description: PHOTOS[0].alt }],
  afterSources: () => AFTER(),
  faqTitle: "Selling by owner FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 40-57", href: T40_57 },
    { name: "Doe v. McMaster", href: DOE },
    { name: "SC Code 37-10", href: T37_10 },
    { name: "SC Bar 06-11", href: EAO },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC form", href: FORM },
    { name: "EPA lead rule", href: EPA },
    { name: "SC Code 12-24", href: T12_24 },
    { name: "SC Code 12-8", href: T12_8 },
    { name: "SCDOR H. 4216", href: DOR26 },
    { name: "NAR 2025 release", href: NAR_REL },
    { name: "NAR 2025 Profile", href: NAR_PDF },
    { name: "SC AG opinion", href: AG07 },
    { name: "NAR settlement", href: NAR_SET },
    { name: "SC Commission", href: LLR },
    { name: "County deeds", href: DEEDS },
    { name: "OpenFEMA", href: FEMA },
    { name: "IRS Topic 701", href: IRS701 },
    { name: "CFPB", href: CFPB },
  ],
  sourcesNote: "Our reading of county deeds: the $350,000 home, the county-value test, the last-name count. Listings: our search, in aggregate.",
  bottomCta: { h2: "Sell it yourself, with a licensed agent's help", p: "Coaching for a flat fee, credited back in full if you list with us. Start with a free price from recorded county sales.", label: "Ask us about coaching", href: LEAD },
  keywords: "for sale by owner South Carolina, FSBO Myrtle Beach, sell house without a realtor South Carolina, sell my house by owner Horry County, SC seller disclosure form, deed stamps SC, closing attorney South Carolina, do I have to pay the buyer's agent, FSBO vs agent",
  about: "Selling a home by owner (FSBO) in South Carolina and Horry County",
});
