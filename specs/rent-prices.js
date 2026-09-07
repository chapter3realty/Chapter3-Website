/* /invest/rent-prices/ - what a house rents for in Myrtle Beach. FY2027 fair
 * market rents from HUD's file and the 40th-percentile definition from HUD's FMR
 * page, both re-opened 2026-09-07. Metro asking rent from Zillow's public ZORI
 * file (Metro, all homes, smoothed), re-opened the same day. No lease data from
 * the owner (research/invest-next/owner-answers-batch4.md, answer 10); the page
 * routes to the analyzer and to an agent. The bar chart is static SVG of the
 * same five figures as the table. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const RTN = "/invest/run-the-numbers/";
const ANALYZER = "/invest/long-term-rental/";
const FMR27 = "https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx";
const FMRDEF = "https://www.huduser.gov/portal/datasets/fmr.html";
const ZORI = "https://www.zillow.com/research/data/";

const ROWS = [["Studio", 1155], ["One bedroom", 1258], ["Two bedrooms", 1504], ["Three bedrooms", 1823], ["Four bedrooms", 1981]];
const CHART = (() => {
  const W = 600, L = 128, BW = W - L - 70, rowH = 26, max = 2200;
  let s = `<svg viewBox="0 0 ${W} ${5 * rowH + 4}" width="100%" role="img" aria-label="Fair market rent by bedroom count, Horry County, fiscal year 2027" style="display:block;max-width:600px;font-family:var(--sans);margin:.6rem 0 1.2rem">`;
  ROWS.forEach(([name, v], i) => {
    const y = i * rowH + 2, bw = Math.round(BW * v / max);
    s += `<text x="${L - 8}" y="${y + 15}" font-size="12" text-anchor="end" fill="#1c2028">${name}</text>`;
    s += `<rect x="${L}" y="${y}" width="${bw}" height="20" fill="#c4783a"><title>${name}: $${v.toLocaleString("en-US")}</title></rect>`;
    s += `<text x="${L + bw + 6}" y="${y + 15}" font-size="12" fill="#1c2028">$${v.toLocaleString("en-US")}</text>`;
  });
  return s + `</svg>`;
})();

module.exports = {
  url: "/invest/rent-prices/",
  title: "Myrtle Beach Rent Prices: What a House Rents For | Chapter3",
  description: "Myrtle Beach rent prices: the county benchmark by bedroom count, the metro asking rent, what moves a house above or below it, and how to get the number for yours.",
  ogTitle: "What a house rents for in Myrtle Beach",
  crumb: "Rent prices",
  eyebrow: "Long-term rents",
  h1: "How much does a house rent for in Myrtle Beach?",
  h1em: "The county benchmark, and what moves it.",
  sub: "The federal rent benchmark for Horry County is $1,504 for two bedrooms and $1,823 for three. A house rents above or below it depending on location, condition and lease length.",
  heroCta: { label: "Have us run the rent", href: RTN },
  author: "devin",
  shortAnswer: "Two public numbers describe long-term rents here. The federal fair market rent for Horry County, fiscal year 2027, is $1,258 for one bedroom, $1,504 for two, $1,823 for three and $1,981 for four. Utilities are included. It is the 40th percentile, so most standard units rent above it. The metro's typical asking rent across all home types was about $1,714 in July 2026. One house rents above or below those numbers on bedroom count, location, condition, whether it is furnished, and lease length. Our analyzer estimates the rent for any address, and an agent runs the number from local leases before you offer.",
  sections: [
    { h2: "What is the benchmark rent in Horry County?", html:
      h.p(`${h.ext(FMR27, "The federal fair market rent")} is the government's estimate of rent in this metro area. It is published each year for the voucher program and other housing programs. ${h.ext(FMRDEF, "It is the 40th percentile of gross rents")} for standard-quality units, so 60 percent of standard units rent above it. It includes utilities.`) +
      h.raw(CHART) +
      h.table(["Bedrooms", "Fair market rent, federal fiscal year 2027"], [["Studio", "$1,155"], ["One", "$1,258"], ["Two", "$1,504"], ["Three", "$1,823"], ["Four", "$1,981"]]) +
      h.p(`The second public number is a market index. ${h.ext(ZORI, "The typical asking rent for the Myrtle Beach metro")} across houses, townhouses and apartments was about $1,714 in July 2026. It was about $1,695 in September 2025. Asking rents are what landlords list, not what tenants sign, and they move with the season here.`) },
    { h2: "What moves a house above or below the benchmark?", html: (bg) =>
      h.table(["What", "Effect on the rent"], [["Bedroom count", "The benchmark rises $158 to $319 with each bedroom. Leases here follow the same shape."], ["Location", "East of Highway 17 or on the water rents above the same house west of it."], [`${h.a("/invest/student-rentals/", "Near the university")}`, "Rents by the room, on the academic calendar."], ["Condition and age", "A renovated kitchen and a newer roof rent for more, and rent faster."], [`${h.a("/invest/mid-term-rentals/", "Furnished, on a short lease")}`, "More per month than the same house unfurnished on a twelve-month lease."], ["A lease matched to a season or a semester", "Carries a premium."]]) +
      h.p(`${h.a("/invest/where-to-buy/", "Where to buy a rental, by strategy")}, with each part of the Grand Strand in one table.`) +
      h.cta("Want the rent for one house?", "Tell us the address. We run the rent from local leases and listings, with the bedroom count, the location and the condition, before you offer.", "Have us run the rent", RTN, bg) },
    { h2: "How do you find out what one house will rent for?", html:
      h.p(`Two ways. ${h.a(ANALYZER, "Our investment analyzer")} takes any Grand Strand address and returns an estimated market rent with the cash flow. It is a screening estimate, not an appraisal. The other way is to ask us. An agent runs the number from current local leases and listings for the house you are looking at, at no cost, before you write the offer.`) +
      h.p(`The analyzer is the quick answer. The agent's number is the one to write the offer on.`) },
    { h2: "What comes out of the rent?", html:
      h.p(`The rent is the top line. Below it come ${h.a("/invest/property-management/", "the manager's share if you hire one")}, ${h.a("/invest/landlord-insurance/", "the landlord policy")} and ${h.a("/buyers/property-taxes/", "the property tax at the 6 percent rate")}. Then the association dues, maintenance, and vacancy between tenants. Run the numbers before you offer, not after.`) },
    { h2: "How much do rents change here?", html: (bg) =>
      h.p(`Slowly, lately. The metro's typical asking rent moved from about $1,695 in September 2025 to about $1,714 in July 2026, about one percent. In Chapter3's files new communities add supply faster than tenants arrive, so ${h.a("/invest/new-construction-rentals/", "a street of identical new houses rents on price alone")}.`) +
      h.cta("Buying a rental and want the rent checked first?", "Tell us the address and the plan. We run the rent, the expenses and the association documents before you write the offer.", "Ask about a rental", "/contact/", bg) },
  ],
  faqTitle: "Rent prices FAQ",
  faq: [
    { q: "What is the fair market rent in Horry County?", a: "For federal fiscal year 2027: $1,155 for a studio, $1,258 for one bedroom, $1,504 for two, $1,823 for three and $1,981 for four. It is the 40th percentile of gross rents for standard units, with utilities." },
    { q: "Is the fair market rent the average rent?", a: "No. It is the 40th percentile, so about 60 percent of standard units rent above it. The metro's typical asking rent was about $1,714 in July 2026." },
    { q: "How do I find out what my house would rent for?", a: "Enter the address in our investment analyzer for a screening estimate, or ask us and an agent runs the rent from local leases and listings at no cost." },
    { q: "Do furnished rentals rent for more in Myrtle Beach?", a: "Per month, yes, on leases shorter than a year, such as furnished stays for traveling nurses and seasonal workers. The trade is more turnover and more work between stays." },
  ],
  sources: [
    { name: "HUD, fair market rents FY2027", href: FMR27 },
    { name: "HUD, how fair market rents are defined", href: FMRDEF },
    { name: "Zillow research data, observed rent index", href: ZORI },
  ],
  sourcesNote: "Educational only. Benchmarks are area figures; the rent for one house comes from local leases.",
  bottomCta: { h2: "Get the rent for the house you are looking at.", p: "One call. We run the rent from local leases and listings before you offer.", label: "Call a specialized agent", href: TEL },
  keywords: "Myrtle Beach rent prices, how much can I rent my house for Myrtle Beach, average rent Horry County, fair market rent Horry County 2027, Myrtle Beach rental rates",
  about: "What a house rents for in Myrtle Beach",
};
