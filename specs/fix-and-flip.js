/* /invest/strategies/fix-and-flip/ - flipping a house on the Grand Strand: what quick resales made in
 * Horry County last year, how our agents find a house worth flipping (the deal finder), the math, and
 * the local costs and rules.
 *
 * Batch 2026-10-c, Lane U. Version 1, 2026-10-29. The page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-c/facts/fix-and-flip-facts.md (verified rows only). Charts are
 * built from data/2026-10-c/horry-flips.json (the county deed index, pulled 2026-10-29), never typed.
 * Kept from the live page: the calculator, the inherited-house story (the owner, 2026-10-29: "worth about
 * 390k after repairs"; no sale, net or profit figure, stories.json "inherited-house-flip"), who buys finished flips, the loans and the
 * cash sections. Corrected from the live page: roofs (the county's pages disagree on a reroof permit;
 * verifier row 14), the deed fee (the seller's by law, the buyer's on a foreclosure deed), wholesaling
 * (the statute's own terms). Verifier corrections of 2026-10-29 (rows 2, 7, 14, 28, 30) are in.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));

const FLIPS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-10-c", "horry-flips.json"), "utf8"));
const median = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const ALL = FLIPS.flips, HOUSES = ALL.filter((f) => !f.no_land_value), UNITS = ALL.filter((f) => f.no_land_value);
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const round1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
if (ALL.length !== FLIPS.meta.summary.count) throw new Error("horry-flips.json: the count and the rows disagree");

const SELF = "/invest/strategies/fix-and-flip/";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const CFR = "https://www.govinfo.gov/content/pkg/CFR-2025-title44-vol1/xml/CFR-2025-title44-vol1-sec59-1.xml";
const HC_FLOOD = "https://horrycountysc.gov/departments/emergency-management/flooding/build-responsibly/";
const MB_FLOOD = "https://www.cityofmyrtlebeach.com/services/flood_protection/index.php";
const HC_PERMIT = "https://www.horrycountysc.gov/departments/code-enforcement/permits/building-permit/when-to-get-a-building-permit/";
const MB_PERMIT = "https://www.cityofmyrtlebeach.com/departments/construction_services_department.php";
const T40_59 = "https://www.scstatehouse.gov/code/t40c059.php";
const T40_57 = "https://www.scstatehouse.gov/code/t40c057.php";
const EPA_RRP = "https://www.epa.gov/lead/renovation-repair-and-painting-program";
const EPA_DISC = "https://www.epa.gov/lead/real-estate-disclosure";
const REG27 = "https://www.scstatehouse.gov/coderegs/Chapter%2027.pdf";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const T12_43 = "https://www.scstatehouse.gov/code/t12c043.php";
const LEVY = "https://www.horrycountysc.gov/media/kufln4qp/tax-levy-2026_2.pdf";
const DRF = "https://dor.sc.gov/tax/deed-recording-fee";
const IRS409 = "https://www.irs.gov/taxtopics/tc409";
const IRS1031 = "https://www.irs.gov/businesses/small-businesses-self-employed/like-kind-exchanges-real-estate-tax-tips";
const SCDOR_RATE = "https://dor.sc.gov/news/information-about-h-4216";
const BRICKWOOD = "https://brickwoodmortgage.com/";

/* Chart 1: the middle gross gain, by who resold the home (verifier, limit 2: the all-homes middle mixes
   companies and people, so give both). The house and condo split is in the text; its house figure is
   the low case, because the lot test uses land value, which condos do not have (verifier, limit 3).
   The file's company flag counts 143 and 201; the verifier's own pattern counted 144 and 200, with the
   same middle gains, so the page says "about 140" and "about 200". */
const CO = ALL.filter((f) => f.resale_seller_company), PERSON = ALL.filter((f) => !f.resale_seller_company);
const about = (n) => `about ${Math.round(n / 10) * 10}`;
const GAIN_CHART = G.bars([
  { name: "Resold by a company", value: median(CO.map((f) => f.gain)), valueText: round1k(median(CO.map((f) => f.gain))), feature: `${about(CO.length)} resales` },
  { name: "Every quick resale", value: median(ALL.map((f) => f.gain)), valueText: round1k(median(ALL.map((f) => f.gain))), feature: `${ALL.length} resales`, reference: true },
  { name: "Resold by a person", value: median(PERSON.map((f) => f.gain)), valueText: round1k(median(PERSON.map((f) => f.gain))), feature: `${about(PERSON.length)} resales` },
], { caption: "Middle gain on a home resold within 12 months, Horry County", nameLabel: "Who resold it", featureLabel: "how many", valueLabel: "middle gain",
  note: "The gain between the two deed prices, before repairs, loans, taxes, insurance and both closings. Resales recorded in the 12 months to September 2026. The count is a floor: some sales that may have been a lot that became a new house were left out." });

/* Where (cold reader, 2026-10-29: "I came for which parts of the Grand Strand are worth flipping in").
   Each resale's parcel point is placed in its 2020 Census ZIP Code Tabulation Area (data file meta.where);
   the areas are ZIP codes, named for the towns and communities a reader knows, and an area needs 15
   resales to be shown. Every figure is computed here from the file. */
const { regionMap } = require(path.join(BB, "tools", "area-map.js"));
const AREAS = [
  { name: "Conway", zips: ["29526", "29527"] },
  { name: "Carolina Forest", zips: ["29579"] },
  { name: "Little River", zips: ["29566"] },
  { name: "Socastee", zips: ["29588"] },
  { name: "Myrtle Beach", zips: ["29572", "29577"] },
  { name: "North Myrtle Beach", zips: ["29582"] },
  { name: "Surfside Beach", zips: ["29575"] },
  { name: "Murrells Inlet and Garden City", zips: ["29576"] },
  { name: "Longs", zips: ["29568"] },
].map((a) => {
  const fs = ALL.filter((f) => a.zips.includes(f.zcta)), houses = fs.filter((f) => !f.no_land_value);
  if (fs.length < 15) throw new Error(`${a.name}: ${fs.length} resales, under 15`);
  return Object.assign(a, { n: fs.length, houses: houses.length, paid: median(fs.map((f) => f.buy_cons)), gain: median(fs.map((f) => f.gain)),
    lat: median(fs.map((f) => f.lat)), lon: median(fs.map((f) => f.lng)) });
}).sort((x, y) => y.gain - x.gain);
const ZIPS = AREAS.map((a) => a.zips.join(" and ")).join("; ");
const WHERE_TABLE = G.bars(AREAS.map((a) => ({ name: a.name, value: a.gain, valueText: round1k(a.gain),
  feature: `${a.n} resales, mostly ${a.houses * 2 > a.n ? "houses" : "condos"}, paid ${round1k(a.paid)}` })),
  { caption: "Middle gain on a home resold within 12 months, by area", nameLabel: "Area", featureLabel: "resales, what sold and middle price paid", valueLabel: "middle gain", compact: true, phoneList: true });
const WHERE_MAP = (() => {
  const m = regionMap({ name: "Where homes were resold within a year", places: AREAS.map((a) => ({ name: a.name, lat: a.lat, lon: a.lon })) },
    { dir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), src: "/images/maps", glass: true });
  return h.figure(m.html, `Each number marks where an area's quick resales were, in the order of the chart below. The areas are ZIP codes. Another ${ALL.length - AREAS.reduce((t, a) => t + a.n, 0)} resales around Loris, Aynor and Green Sea were too few to show. ${m.credit}`) + (m.unlabelled && m.unlabelled.length ? m.key : "");
})();
const TOP3 = AREAS.filter((a) => a.houses * 2 > a.n).slice(0, 3).map((a) => a.name);
const MB = AREAS.find((a) => a.name === "Myrtle Beach"), NMB = AREAS.find((a) => a.name === "North Myrtle Beach");

/* The months (ledger row 8) are in the text only: the owner's eye, round 3, found the 12-row chart showed nothing the sentence does not. */

/* The calculator from the live page, unchanged but for its dash. */
const IN = 'style="width:132px;background:rgba(244,239,232,.12);border:1px solid rgba(244,239,232,.34);border-radius:6px;color:#f4efe8;font-family:var(--sans);font-size:.95rem;padding:.42rem .55rem;text-align:right"';
const LAB = 'style="display:flex;justify-content:space-between;align-items:center;gap:1rem;color:rgba(244,239,232,.9);font-family:var(--sans);font-size:.93rem"';
const field = (id, label, v) => `<label ${LAB}>${label}<span style="white-space:nowrap;color:rgba(244,239,232,.55)">$ <input id="${id}" type="number" min="0" step="1000" value="${v}" oninput="c3Flip()" aria-label="${label} in dollars" ${IN}></span></label>`;
const CALC = `<div class="c3-flipcalc" style="background:var(--navy);border-radius:12px;padding:1.5rem 1.6rem;margin:1.6rem 0;max-width:600px">`
  + `<p style="font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass-2);margin-bottom:.9rem">Run your own deal</p>`
  + `<div style="display:grid;gap:.75rem">${field("flipArv", "What it sells for fixed up", 300000)}${field("flipPaid", "What you pay", 200000)}${field("flipRehab", "Repairs", 45000)}${field("flipCosts", "Holding and selling costs", 30000)}</div>`
  + `<div style="display:flex;justify-content:space-between;gap:1rem;align-items:baseline;border-top:1px solid rgba(244,239,232,.22);margin-top:1.15rem;padding-top:1rem;font-family:var(--sans);color:rgba(244,239,232,.9)"><span>Your profit</span><strong id="flipProfit" style="color:var(--brass-2);font-family:var(--serif);font-size:1.7rem;line-height:1">$25,000</strong></div>`
  + `<div style="display:flex;justify-content:space-between;gap:1rem;align-items:baseline;margin-top:.5rem;font-family:var(--sans);color:rgba(244,239,232,.75);font-size:.9rem"><span>Price plus repairs, as a share of the fixed-up value</span><strong id="flipRatio" style="color:var(--ivory)">82%</strong></div>`
  + `<p id="flipVerdict" style="font-family:var(--sans);color:rgba(244,239,232,.72);line-height:1.6;margin:.7rem 0 0;font-size:.92rem">Above the 70 percent most flippers aim for, so this deal leaves little room for the repairs to run over.</p></div>`
  + `<script>function c3Flip(){var g=function(id){var e=document.getElementById(id);var v=e?parseFloat(e.value):NaN;return isFinite(v)&&v>0?v:0};`
  + `var money=function(n){return "$"+Math.round(n).toLocaleString("en-US")};var pr=document.getElementById("flipProfit"),ra=document.getElementById("flipRatio"),sy=document.getElementById("flipVerdict");if(!pr||!ra||!sy)return;`
  + `var arv=g("flipArv"),paid=g("flipPaid"),reh=g("flipRehab"),cost=g("flipCosts");var profit=arv-paid-reh-cost;pr.textContent=(profit<0?"-":"")+money(Math.abs(profit));`
  + `if(!arv){ra.textContent="--";sy.textContent="Enter what the house sells for fixed up.";return}var share=(paid+reh)/arv*100;ra.textContent=Math.round(share)+"%";`
  + `sy.textContent=profit<=0?"This deal loses money. Lower the price you pay or the repair budget.":share<=70?"Inside the 70 percent most flippers aim for, which leaves room for the repairs to run over.":share<=75?"A little over the 70 percent most flippers aim for.":"Above the 70 percent most flippers aim for, so this deal leaves little room for the repairs to run over."}`
  + `document.addEventListener("DOMContentLoaded",c3Flip);</script>`;



const CO_GAIN = round1k(median(CO.map((f) => f.gain))), PERSON_GAIN = round1k(median(PERSON.map((f) => f.gain)));
const BIG3 = AREAS.filter((a) => a.houses * 2 > a.n).slice(0, 3);
const LOSSES = ALL.filter((f) => f.gain < 0).length, PERSON_LOSSES = PERSON.filter((f) => f.gain < 0).length;
const list3 = (xs) => `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`;

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Invest", url: "/invest/" },
  title: "Fix and Flip Myrtle Beach: Local Numbers and Rules | Chapter3",
  description: "What Horry County flips made last year and where, how our agents find a house worth flipping, the 70 percent rule, and the local costs, permits and flood rules.",
  ogTitle: "Fix and flip in Myrtle Beach: what local flips made, where, and how we find the next one",
  crumb: "Fix and Flip",
  eyebrow: "Strategy",
  h1: "How do you find a fix and flip in Myrtle Beach?",
  h1em: "What quick resales gained here last year, where they were, and how our deal finder looks for the next one.",
  sub: "Local numbers from the county's deeds, the 70 percent rule, and the rules a flip meets here.",
  heroCta: { title: "The best houses for sale this week, in your price range", text: "Tell us your price range. An agent runs our deal finder and sends you the best houses for sale, with the nearby sales behind each one.", label: "Get the flip list", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    `Yes, a fix and flip can pay here if you buy right. In the year to September 2026, Horry County homes were resold within 12 months of their last sale at least ${ALL.length} times. When a company resold the home, the middle gain between the two deed prices was about ${CO_GAIN}, before any costs. ${list3(BIG3.map((a) => a.name))} had the biggest gains on houses.`,
    `Our deal finder pulls every house for sale with a reason to be cheap and compares it with what houses its size sold for nearby. An agent then reads the repairs and works out your highest offer.`,
  ],
  sections: [
    { h2: "Do fix and flips make money in Myrtle Beach?", toc: "Local numbers", id: "local-numbers", html: () =>
      /* The hero's summary line repeats the line above it (owner's eye, 2026-10-29), so it is hidden on this page, as on /buyers/second-home/. */
      "<style>main#main .detail-hero .detail-sub{display:none}</style>" +
      h.p(`Most resell for more than the earlier deed price. We read every deed Horry County recorded for two years. Quick resales, a home sold again within 12 months of its last sale, were about 3 of every 100 home sales not made by a builder. The chart gives the middle gain: half gained more, half less.`) +
      GAIN_CHART +
      h.p(`The company figure is the closer guide to an investor's flip. Resales by a person hold most of the losses: about ${Math.round(PERSON_LOSSES / 5) * 5} of the ${LOSSES} homes that sold for less than the earlier deed price. Houses also gained more than condos, a middle of about ${round1k(median(HOUSES.map((f) => f.gain)))} against about ${round1k(median(UNITS.map((f) => f.gain)))}.`) },

    { h2: "Where on the Grand Strand do flips happen?", toc: "Where", id: "where", html: () =>
      h.p(`The biggest gains on houses were in ${list3(BIG3.map((a) => a.name))}. ${MB.name} had the most quick resales, but most were condos, and the middle one gained about ${round1k(MB.gain)}. No single neighborhood had more than three house resales: the flips are spread across many streets. The deal finder looks at every home for sale for that reason.`) +
      WHERE_MAP + WHERE_TABLE },

    { h2: "How do we find a house worth flipping?", toc: "How we find them", id: "how-we-find-them", html: (bg) =>
      h.p("Our agents use a deal finder we built to look at every home for sale on the Grand Strand in one pass. An agent checks everything it finds:") +
      h.ol([
        `<strong>A reason to be cheap.</strong> It pulls every house for sale that has one: a distressed sale, a ${h.a("/invest/foreclosures/", "foreclosure")}, a short sale, or an older house at the low end of the price range.`,
        "<strong>The nearby sales.</strong> For the cheapest houses per square foot, it finds houses of about the same size that sold within a mile in the last year.",
        "<strong>The list.</strong> The houses furthest under the middle of their nearby sales make the list. It reads the photos and description of the top ones and lists the repairs it can see, with a cost range for each.",
        "<strong>The agent's call.</strong> An agent reads the sales, decides what the house will sell for once it is fixed, and works out your highest offer. That number comes from an agent who knows the streets, never from a computer.",
      ]) +
      h.p("A house far under its neighbors is not always a deal. Sometimes the size in the listing is wrong, the price is an auction's opening bid, or the house needs everything. The finder marks those, and the agent finds out which it is before you spend a dollar.") +
      h.cta("What you get on the flip list", "For each house: its asking price per square foot against the middle of its nearby sales, the six nearest sales, the repairs its photos show with a cost range, and your highest offer by the 70 percent rule. Tell us your price range.", "Get the flip list", "/contact/", bg) },

    { h2: "How do you work out what to offer?", toc: "The math", id: "the-math", html: () =>
      h.p("Every flip starts with the after-repair value, what the house will sell for once it is fixed up. Take that number and subtract everything you spend. What is left is your profit.") +
      h.p("Many flippers use the 70 percent rule to set their highest offer: 70 percent of the after-repair value, minus the repairs. On a house that will sell for $300,000 fixed up and needs $45,000 of work, that is $165,000. The 30 percent left over covers your costs and your profit.") +
      CALC },

    { h2: "What does a flip cost here besides the house and the repairs?", toc: "Local costs", id: "local-costs", html: () =>
      h.p("Four costs bill you every month you own the house: the property tax, the loan, insurance and utilities. The rest come at the two closings, and when you sell, the commission and the deed fee.") +
      h.p(`The tax is the one most investors miss. A house that is not its owner's own home is taxed on 6 percent of its value, not 4 percent, and it pays the school operating tax.`) +
      h.p(`On a house the county appraises at $250,000, in one of its tax districts outside the cities, that is about $3,015 a year instead of about $919, plus an $89.40 fee on each bill. We work out the bill for the actual address, and every town's rate is in our ${h.a("/buyers/property-taxes/", "property tax calculator")}.`) +
      h.p(`The deed fee is $1.85 for each $500 of the price, and the law puts it on the seller: about $962 on a ${money(FLIPS.meta.summary.median_sell)} sale. If you buy at the county's court-ordered foreclosure sale, you pay the fee on that deed as well.`) +
      h.p("We also get the insurance quotes for the empty house and the loan's terms, so the monthly cost of holding it is a number, not a guess.") },

    { h2: "What permits and licenses does a flip need?", toc: "Permits and licenses", id: "permits", html: () =>
      h.p(`In Horry County outside the cities, ${h.ext(HC_PERMIT, "you need a building permit")} to build, alter, repair or tear down, and for any electrical, gas, mechanical or plumbing work. South Carolina ${h.ext(T40_59, "licenses the people who do the work")} by the size of the job:`) +
      compareCards([
        { name: "Paint, wallpaper, tile, carpet, cabinets, countertops", cells: { permit: "No", who: "You, or a pro registered with the state" } },
        { name: "A new roof", cells: { permit: "We check first", who: "A roofer registered with the state" } },
        { name: "Electrical, plumbing, heating and air", cells: { permit: "Yes", who: "A contractor licensed for the trade" } },
        { name: "Walls, structure, a full renovation", cells: { permit: "Yes", who: "A licensed builder, for jobs over $5,000" } },
      ], [{ key: "permit", label: "County permit" }, { key: "who", label: "Who may do it" }], { caption: "Permits and licenses for flip work in Horry County", nameLabel: "The work" }) +
      h.p("Before you budget a new roof, we ask the county's code office whether it needs a permit. The county's own pages disagree.") +
      h.p("The owner's exemption from the license does not cover a flip. It is only for a house you build or repair to live in, and a sale or rental within two years of finishing is presumed to mean it was done to sell.") +
      h.p(`Working without the license is a misdemeanor for the contractor, with a fine of $500 to $10,000, at least 30 days in jail, or both. An unlicensed contractor also cannot put a lien on the house or sue to be paid. In the City of Myrtle Beach, ${h.ext(MB_PERMIT, "electrical, plumbing, gas and mechanical work")} each need a trade permit.`) +
      h.h3("Houses built before 1978") +
      h.p(`Many of the cheapest houses are old enough to have lead paint. In a house built before 1978, ${h.ext(EPA_RRP, "anyone paid to do work that disturbs paint")} must be certified in lead-safe work. The EPA says the rule applies to a flipper doing their own work too. Small patches are outside it: 6 square feet of paint or less in a room, or 20 square feet or less outside. Replacing windows is always covered.`) +
      h.h3("Houses in a flood zone") +
      h.p(`This is the rule that can end a flip. If the work costs 50 percent or more of the building's value before the work, not counting the land, ${h.ext(CFR, "the federal flood program")} calls it a substantial improvement. Work to fix code violations an inspector has cited, and some work on historic buildings, are left out of that count.`) +
      h.p(`In ${h.ext(HC_FLOOD, "unincorporated Horry County")}, the whole house must then meet the rules for a new building. In a high-risk flood zone marked AE on the flood map, that means a lowest floor at least 3 feet above the flood height shown on the flood map for that spot.`) +
      h.p(`In the ${h.ext(MB_FLOOD, "City of Myrtle Beach")}, work on a building in a flood zone that does not meet today's flood rules must cost less than 50 percent of the building's value.`) +
      h.p(`For an older house low to the ground, the rule can mean raising it or keeping the job under the limit. We check the flood zone and the county's building value before you offer, so you know the repair budget the rule allows. Our ${h.a("/buyers/coastal-insurance/", "coastal insurance")} page covers flood insurance on the finished house.`) },

    { h2: "How does a finished flip sell here?", toc: "Selling it", id: "selling-it", html: () =>
      h.p("Most of our buyers for a finished flip are moving from out of state, or retiring. We spend several thousand dollars a month advertising to buyers moving to the Grand Strand, so a finished flip goes in front of them the day it lists. Lighter repairs sometimes suit the rental buyers on our list before the house reaches the open market.") +
      h.p("One investor here inherited a house and had it fully repaired over about two and a half months. An agent at Chapter3 advertised it for sale while the work was going on. It went under contract a week before the work finished, and it closed for cash the day construction ended. Repaired, the house was worth about $390,000.") +
      h.p("Advertise before the work ends. The loan, the tax and the insurance stop the day the house sells.") +
      h.p("Plan to list by March. The fewest homes sell here in January and February. Every other month, about 800 to 1,050 sell, and prices move little, so the season gives you more buyers, not a higher price.") },

    { h2: "What do you owe when you sell?", toc: "Disclosures and tax", id: "selling", html: () =>
      h.p(`When you sell a house as an investor, you give the buyer ${h.ext(T27_50, "South Carolina's property condition disclosure")}, the same form any owner gives. There is no exemption for investors, and it goes to the buyer before both sides sign.`) +
      h.p(`When you sell most homes built before 1978, you also give the buyer the EPA's lead pamphlet and a lead disclosure, and the buyer gets 10 days to have the paint tested unless the buyer waives it. If the buyer asks for a termite letter, only a licensed pest control company may issue it.`) +
      h.p(`A gain on a house held one year or less is a ${h.ext(IRS409, "short-term gain")}, taxed as ordinary income. If you flip as a business, a house held mainly for sale to customers is not a capital asset, so its gain is not a capital gain at all. A flip also ${h.ext(IRS1031, "cannot go into a 1031 exchange")}.`) +
      h.p(`South Carolina's 44 percent deduction on capital gains is for property held more than a year, so a flip gets none of it. For 2026, ${h.ext(SCDOR_RATE, "South Carolina's top rate")} is 5.21 percent on income above $30,000. Talk to a tax advisor before your first sale.`) },

    { h2: "Is wholesaling allowed in South Carolina?", toc: "Wholesaling", id: "wholesaling", html: () =>
      h.p(`Not the way it used to work. ${h.ext(T40_57, "South Carolina's 2024 license law")} defines wholesaling as holding a contract to buy a home and then marketing the house to another buyer before you own it. Marketing someone else's property for pay is a broker's work and needs a license. A real estate brokerage and its agents may not wholesale or help a wholesaler. Assigning the contract itself is not wholesaling under the law.`) +
      h.p("The agents at Chapter3 have sold on the Grand Strand for decades and often hear about discounted houses, such as estate sales and new foreclosures, before they reach the big listing websites.") },

    { h2: "How do you pay for a flip?", toc: "Loans and cash", id: "loans", html: () =>
      h.p(`Many flips use a hard money loan, a short-term loan that closes quickly and can pay for part of the repairs. Its rate is higher than a normal mortgage, so every extra month you own the house costs you money. Our preferred lender, ${h.ext(BRICKWOOD, "BrickWood Mortgage")}, offers fix-and-flip and bridge loans, so the purchase, the loan and the repair budget are planned together.`) +
      h.raw('<p style="font-size:.8rem;color:var(--muted);line-height:1.6;max-width:720px;margin-top:-.2rem;margin-bottom:1rem"><strong style="color:var(--navy)">Disclosure.</strong> Chapter3 Realty Corp has a business relationship with BrickWood Mortgage (NMLS #189497). Because of this relationship, this referral may provide Chapter3 Realty a financial or other benefit. You are never required to use BrickWood. You are free to shop any lender. <a href="/buyers/programs/#afba" style="color:var(--navy);text-decoration:underline">See full AfBA Disclosure.</a></p>') +
      h.p("Cash is stronger. Bank-owned and off-market houses usually go to the buyer who can close soonest, and cash has no appraisal to fail. It also removes the largest holding cost, the loan interest.") +
      h.p("You can still win with a loan off-market, where there is no cash offer to lose to. Our agents talk to owners before a house is listed and learn what the seller needs. Then we build the offer around it: the closing date, a shorter inspection, more earnest money, or a price that pays the seller for waiting on your loan.") +
      h.p(`Keep a backup plan. We run each address through our ${h.a("/invest/long-term-rental/", "rental analyzer")} too, so you know what it would rent for if it does not sell. If it would rent well, you can refinance into a ${h.a("/invest/strategies/dscr-loans/", "DSCR loan")}, which is approved on the rent instead of your tax returns, and keep it. That is the ${h.a("/invest/strategies/brrrr/", "BRRRR strategy")}: buy, fix, rent, refinance, repeat.`) },
  ],
  faqTitle: "Fix and flip FAQ",
  faq: [
    { q: "How long does a flip take in Myrtle Beach?", a: `About six months from purchase to resale. The middle home resold within a year in Horry County sold again ${FLIPS.meta.summary.median_days} days after its purchase, and the middle half took about four to ten months.` },
    { q: "Can I flip a house in Myrtle Beach from out of state?", a: "Yes. A Chapter3 agent walks the house on video, runs the numbers, and lines up the closing attorney and the inspector. Our page for out-of-state buyers explains how a closing works from a distance." },
    { q: "Do I have to use BrickWood Mortgage?", a: "No. You may use any lender you like. BrickWood Mortgage is our preferred lender for fix-and-flip and bridge loans." },
    { q: "Do you need a license to flip houses in South Carolina?", a: "No real estate license is needed to buy and sell a house you own. The contractors you hire need theirs, and the permits section above shows which work needs a license." },
  ],
  sources: [
    { name: "Horry County deed index", href: DEEDS },
    { name: "44 CFR 59.1", href: CFR },
    { name: "Horry County building permits", href: HC_PERMIT },
    { name: "SC Code 40-59", href: T40_59 },
    { name: "SC Code 40-57", href: T40_57 },
    { name: "EPA lead rules", href: EPA_RRP },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC Code 12-43", href: T12_43 },
    { name: "Horry County 2026 tax levy", href: LEVY },
    { name: "SCDOR deed recording fee", href: DRF },
    { name: "IRS Topic 409", href: IRS409 },
  ],
  sourcesNote: "Quick resales: every deed the county recorded over two years, read by Chapter3, placed by the county's parcel map and Census ZIP areas; builder sales and lots left out. Not legal or tax advice.",
  bottomCta: { h2: "Want this week's flip list?", p: "Tell us your price range. An agent runs our deal finder and sends you the best houses for sale, with the nearby sales and the repairs behind each one.", label: "Get the flip list", href: "/contact/" },
  keywords: "fix and flip Myrtle Beach, flipping houses Myrtle Beach, house flipping South Carolina, fix and flip Horry County, best places to flip houses Myrtle Beach, 70 percent rule, after repair value, flip houses license South Carolina, flip house taxes South Carolina, substantial improvement flood rule Horry County",
  about: "Fixing and reselling houses (fix and flip) in Myrtle Beach and Horry County, South Carolina",
});
