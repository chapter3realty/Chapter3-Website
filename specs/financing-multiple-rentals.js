/* /invest/financing-multiple-rentals/ - financing the second, third and fourth
 * rental. Loan rules read 2026-09-07 in the conventional selling guide (multiple
 * financed properties, rental income, minimum reserves); named in the sources
 * line only, never in the copy. Brokerage facts from
 * research/invest-next/owner-answers-batch4.md, fact-checked there; his LTV
 * percentages stay off the page (not a DOWN_PAYMENT_OK page). Loan facts that
 * need a source say "according to a loan officer at our preferred lender".
 * Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const LIMIT = "https://selling-guide.fanniemae.com/sel/b2-2-03/multiple-financed-properties-same-borrower";
const RENTINC = "https://selling-guide.fanniemae.com/sel/b3-3.1-08/rental-income";
const RESERVES = "https://selling-guide.fanniemae.com/sel/b3-4.1-01/minimum-reserve-requirements";

module.exports = {
  url: "/invest/financing-multiple-rentals/",
  title: "Financing Your Second, Third and Fourth Rental | Chapter3",
  description: "Financing a second, third and fourth rental in Myrtle Beach: the ten-property limit, the reserves each loan adds, equity for the next one, and second-deal mistakes.",
  ogTitle: "Financing your second, third and fourth rental in Myrtle Beach",
  crumb: "Financing more rentals",
  eyebrow: "Repeat investors",
  h1: "How do you finance your second, third and fourth rental?",
  h1em: "The limit, the reserves, the equity.",
  sub: "Standard loans stop at ten financed properties, and each one adds reserves. The first rental is the hardest to finance. The next down payment can come from equity you own.",
  heroCta: { label: "Plan the next purchase", href: "/contact/" },
  author: "devin",
  shortAnswer: "Standard investment loans allow up to ten financed properties per borrower. Your own home counts if it has a mortgage. Each rental adds reserves: months of payments on the new one, and a share of the balances on the others. The first rental is the hardest to finance. The loan rules count rent toward your income only after a year of managing property, and investor lenders often want experience too. After the first, the down payment on the next house can come from equity in one you own. The numbers must still work with both loans on them. We run the next house before you offer, and a loan officer at our preferred lender maps the loan.",
  sections: [
    { h2: "Why is the first rental the hardest to finance?", html:
      h.p(`Two reasons. ${h.ext(RENTINC, "The standard loan rules count rent toward your income")} only after twelve months of managing property. Before that, the rent from the house you are buying can offset that house's payment and nothing more. Your own income has to carry the rest.`) +
      h.p(`Investor loans that qualify on the property's rent, such as ${h.a("/invest/strategies/dscr-loans/", "DSCR loans")}, are made under each lender's own rules. According to a loan officer at our preferred lender, many of those lenders want to see prior experience. A first-time investor gets a worse price or a denial at some of them. Our preferred lender has programs for first-time investors.`) +
      h.table(["Loan type", "What the lender asks of a first-time investor"], [["Standard investment loan", "Twelve months of managing property before rent counts as income. Until then the rent only offsets that house's payment."], ["Loan made on the property's rent", "Prior experience, at many lenders. A first-timer may get a worse price or a no. Our preferred lender has first-time programs."]]) +
      h.p(`The fix is to buy the first one well and hold it for a year. After that year the rent counts, the experience counts, and every loan after it is easier.`) },
    { h2: "How many rentals can you finance?", html:
      h.p(`${h.ext(LIMIT, "Ten financed properties")} on standard loans. A property with two mortgages counts once.`) +
      h.table(["Counts toward the ten", "Does not count"], [["Your own home, if it has a mortgage", "Commercial property"], ["Every one- to four-unit property with a mortgage in your name", "Buildings with more than four units"], ["A second home with a mortgage", "Vacant lots"]]) +
      h.p(`Loans made on the property's rent, DSCR and portfolio loans, are outside that limit. Each lender applies its own cap. According to a loan officer at our preferred lender, that is how investors here hold more than ten houses with loans on them.`) },
    { h2: "What reserves does each rental add?", html:
      h.p(`${h.ext(RESERVES, "The rule asks for six months of payments")} in reserve on a new investment property. It also asks for a share of the balances on your other financed properties. The share rises with the count.`) +
      h.table(["Financed properties", "Reserve on the other balances"], [["One to four", "Two percent"], ["Five or six", "Four percent"], ["Seven to ten", "Six percent"]]) +
      h.p(`Reserves are money you keep, not money you spend. ${h.a("/invest/cash-to-close/", "What lender reserves are, and what else you pay at closing")}.`) },
    { h2: "Can the next purchase be funded from equity?", html: (bg) =>
      h.p(`Yes. A cash-out refinance or a line of credit on a property you own can fund the down payment on the next one. According to a loan officer at our preferred lender, a rental that has paid down its loan or risen in value is the usual source. Lenders cap the cash you can pull from a rental below the cap on a home you live in.`) +
      h.p(`It is still a down payment. The money is borrowed against one house to buy another, so two loans now depend on the rents. The refinanced house needs to carry its new payment from its own rent. The new house needs to carry its own. If both do, you bought the second house without new cash from savings.`) +
      h.cta("Planning the next one?", "Tell us what you own and what you want to buy. We run the rent on the next house, and a loan officer at our preferred lender maps the loan around the limit and the reserves.", "Plan the next purchase", "/contact/", bg) },
    { h2: "What goes wrong on the second purchase?", html: (bg) =>
      h.p(`<strong>Expecting the same paperwork.</strong> Each lender and each underwriter asks for its own list, and a seller can ask for more too. Expect a different list from last time, even with the same broker. We ask for the least the file needs, and the underwriter still writes the list.`) +
      h.p(`<strong>Skipping the worst case.</strong> A second rental doubles the income and doubles the risk. Before you buy, write down what happens if both houses sit empty for three months, or if one needs a roof. Write down where that money comes from. We help clients build those defenses before they buy, so the worst case is unlikely, and survivable if it comes.`) +
      h.p(`<strong>Spending the reserve.</strong> In Chapter3's files a client planned to fix a house he owned, rent it, sell a few others and buy more. Fixing the house would have used every dollar he had. We showed him the risk. He sold a few houses first, then fixed the house, and bought fewer than he planned. He kept a reserve, and the plan held.`) +
      h.cta("Ready for the next one?", "One call. We run the next house and put you with a loan officer at our preferred lender who maps the loan.", "Call a specialized agent", TEL, bg) },
  ],
  faqTitle: "Financing more rentals FAQ",
  faq: [
    { q: "How many investment properties can I finance?", a: "Ten financed properties on standard loans, counting your own home if it has a mortgage. Loans made on the property's rent, such as DSCR loans, are outside that limit and follow the lender's own cap." },
    { q: "Why is the first rental harder to finance than the second?", a: "The standard loan rules count rent toward your income only after twelve months of managing property. Until then the rent from the house you are buying can only offset that house's payment. Many investor lenders also want prior experience." },
    { q: "Can I use equity from one rental to buy another?", a: "Yes. A cash-out refinance or a line of credit on a property you own can fund the next down payment. Both loans then depend on the rents, so both houses must carry their own payments." },
    { q: "What reserves do I need for a second rental?", a: "Six months of payments on the new property, plus a share of the balances on your other financed properties. The share rises with the count under the standard loan rules." },
  ],
  sources: [
    { name: "Fannie Mae Selling Guide, multiple financed properties", href: LIMIT },
    { name: "Selling Guide, rental income", href: RENTINC },
    { name: "Selling Guide, minimum reserves", href: RESERVES },
  ],
  sourcesNote: "Educational only, not a loan offer. Loan rules change; a loan officer confirms them for your file.",
  bottomCta: { h2: "Map the next loan before you shop.", p: "One call. We run the rent on the next house and put you with a loan officer at our preferred lender.", label: "Call a specialized agent", href: TEL },
  keywords: "financing second rental property, how many investment property loans can I have, ten financed properties limit, reserves for investment property, cash out refinance to buy another rental Myrtle Beach",
  about: "Financing a second, third and fourth rental in Myrtle Beach",
};
