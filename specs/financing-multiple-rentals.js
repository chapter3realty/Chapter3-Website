/* /invest/financing-multiple-rentals/ - financing more than one rental. Loan
 * rules re-opened 2026-09-07 in the conventional selling guide (multiple financed
 * properties, minimum reserves) and the FHA handbook (one insured principal
 * residence per borrower, the exceptions, the rent test on three- and four-unit
 * buildings); named in the sources line only, never in the copy. Brokerage facts
 * from research/invest-next/owner-answers-batch4.md (rounds 1 to 3); his LTV
 * percentages stay off the page (not a DOWN_PAYMENT_OK page). A loan fact that
 * needs a source says "according to a loan officer at our preferred lender".
 * Owner rules 2026-09-07: nothing "carries" a loan, nothing "maps" a loan.
 * Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const LIMIT = "https://selling-guide.fanniemae.com/sel/b2-2-03/multiple-financed-properties-same-borrower";
const RESERVES = "https://selling-guide.fanniemae.com/sel/b3-4.1-01/minimum-reserve-requirements";
const FHA = "https://www.hud.gov/program_offices/housing/sfh/handbook_4000-1";
const DSCRRES = "https://www.pinnaclefundingnetwork.com/blog/32-dscr-loan-reserve-requirements.html";

module.exports = {
  url: "/invest/financing-multiple-rentals/",
  title: "Finance Multiple Rental Properties in Myrtle Beach | Chapter3",
  description: "Financing multiple rental properties in Myrtle Beach: the ten-property limit, the reserves a lender verifies but never holds, FHA multi-unit growth, and equity.",
  ogTitle: "Financing more than one rental property in Myrtle Beach",
  crumb: "Financing more rentals",
  eyebrow: "Repeat investors",
  h1: "How do you finance more than one rental property?",
  h1em: "The limit, the reserves, the equity.",
  sub: "Standard loans allow ten financed properties. Each loan adds reserves you show and keep. The next down payment in Myrtle Beach can come from equity in a house you own.",
  heroCta: { label: "Plan the next purchase", href: "/contact/" },
  author: "devin",
  shortAnswer: "Standard investment loans allow up to ten financed properties per borrower, counting your own home if it has a mortgage. Each new loan adds reserves: months of the new payment, plus a share of the loan balances on your other rentals. The lender verifies that money and you keep it. Loans made on the property's rent, such as DSCR loans, are not under the ten limit. A buyer who lives in a two- to four-unit building can buy it with an FHA loan, one building at a time. After the first rental, the down payment on the next house can come from equity in one you own. We run the next house before you offer, and a loan officer at our preferred lender plans the loan with you.",
  sections: [
    { h2: "How many rentals can you finance?", html:
      h.p(`${h.ext(LIMIT, "Ten financed properties")} on standard loans. A property with two mortgages counts once. A building with two to four units counts once.`) +
      h.table(["Counts toward the ten", "Does not count"], [["Your own home, if it has a mortgage", "Commercial property"], ["Every one- to four-unit property with a mortgage in your name, whatever loan bought it", "Buildings with more than four units"], ["A second home with a mortgage", "Vacant lots"]]) +
      h.p(`The limit applies when the house you are buying is a rental or a second home. There is no limit on a standard loan for the home you live in.`) +
      h.p(`Loans made on the property's rent, such as ${h.a("/invest/strategies/dscr-loans/", "DSCR loans")} and portfolio loans, are not under that limit. Each of those lenders has its own count. According to a loan officer at our preferred lender, most investors never reach ten, and the ones who do use those loans for the houses after it.`) },
    { h2: "Can you grow with FHA loans and multi-unit buildings?", html:
      h.p(`Yes, one building at a time. An FHA loan is for the home you live in. It allows a building with two, three or four units when you live in one unit and rent the others. You must move in within 60 days and plan to live there for at least a year. The down payment is small because you live there.`) +
      h.p(`${h.ext(FHA, "FHA insures one loan at a time")} as your primary residence. A second FHA loan needs one of four exceptions.`) +
      h.table(["Exception", "What it requires"], [["A job move", "The new home is more than 100 miles from the old one."], ["A larger family", "More dependents, the home no longer fits, and enough equity in the old home."], ["Leaving a shared home", "A co-borrower stays in the old home and you move out for good."], ["You only co-signed", "You were a non-occupying co-borrower on the first loan."]]) +
      h.p(`The usual path has four steps. Buy the building with an FHA loan. Live there a year. Move out and keep it as a rental. Buy the next home with a standard loan for the home you live in. Some buyers refinance the FHA loan into a standard loan so they can use FHA again. A three- or four-unit building must also pass a rent test. Three quarters of the appraiser's market rent for all the units must be at least the full monthly payment.`) +
      h.p(`Is FHA capped at ten? No. FHA has no limit on the number of financed properties you hold. It limits you to one FHA loan at a time, with the four exceptions. The ten-property limit is a standard-loan rule, and it counts every financed house you hold, including the ones you bought with FHA. A lender will refuse an FHA loan that looks like a way to buy rentals. Live in each home. Move when your life needs a different home.`) },
    { h2: "How much do lenders want in reserves?", html:
      h.p(`Reserves are money in your accounts on the day the loan closes. The lender does not take it, hold it or freeze it. You prove it is there with statements, and you keep it.`) +
      h.p(`${h.ext(RESERVES, "The standard rule asks for six months of the new property's payment")}: principal, interest, taxes, insurance and dues. It also asks for a share of the loan balances on your other financed rentals. Your own home and the house you are buying are not in that total.`) +
      h.table(["Financed properties", "Reserve on the other rentals' loan balances"], [["One to four", "Two percent"], ["Five or six", "Four percent"], ["Seven to ten", "Six percent"]]) +
      h.p(`A lender that makes loans on the property's rent writes its own reserve rule. ${h.ext(DSCRRES, "Most ask for two to six months of the new payment")}. Some also ask for a few months of the payment on each other rental you own. Ask for the figure before you shop. ${h.a("/invest/cash-to-close/", "What lender reserves are, and what else you pay at closing")}.`) },
    { h2: "Can the next purchase be funded from equity?", html: (bg) =>
      h.p(`Yes. A cash-out refinance or a line of credit on a property you own can fund the down payment on the next one. According to a loan officer at our preferred lender, a rental that has paid down its loan or risen in value is the usual source. Lenders cap the cash you can take out of a rental below the cap on a home you live in.`) +
      h.p(`It is still a down payment. The money is borrowed against one house to buy another, so two loans now depend on the rents. The rent on the refinanced house must pay its new, larger payment. The rent on the new house must pay its own payment. If both do, you bought the second house without new cash from savings.`) +
      h.cta("Planning the next one?", "Tell us what you own and what you want to buy. We run the rent on the next house, and a loan officer at our preferred lender works out the loan, the limit and the reserves with you.", "Plan the next purchase", "/contact/", bg) },
    { h2: "What goes wrong on the second purchase?", html: (bg) =>
      h.p(`<strong>Expecting the same paperwork.</strong> The document list changes with every loan. Each lender has its own list. Each underwriter can add to it. A seller can ask for more. The list for your second loan will not match the list for your first, even with the same broker. Send each document the day the loan officer asks for it.`) +
      h.p(`<strong>Skipping the worst case.</strong> A second rental doubles the income and doubles the risk. Before you buy, write down what happens if both houses have no tenant for three months, or if one needs a roof. Write down where that money comes from. We help clients plan for those cases before they buy, so the worst case is unlikely, and survivable if it comes.`) +
      h.p(`<strong>Spending the reserve.</strong> In Chapter3's files a client planned to fix a house he owned, rent it, sell a few others and buy more. Fixing the house would have used every dollar he had. We showed him the risk. He sold a few houses first, then fixed the house, and bought fewer than he planned. It took him longer. He did it the safer way, he kept a reserve, and he can keep buying now.`) +
      h.cta("Ready for the next one?", "One call. We run the next house and put you with a loan officer at our preferred lender.", "Call a specialized agent", TEL, bg) },
  ],
  faqTitle: "Financing more rentals FAQ",
  faq: [
    { q: "How many investment properties can I finance?", a: "Ten financed properties on standard loans, counting your own home if it has a mortgage. Loans made on the property's rent, such as DSCR loans, are not under that limit. Each of those lenders has its own count." },
    { q: "Can I use FHA loans to build a rental portfolio?", a: "One building at a time. An FHA loan is for the home you live in, and it allows two to four units. FHA insures one loan per borrower at a time, with four exceptions. FHA has no ten-property limit. The ten-property limit is a standard-loan rule." },
    { q: "Does the lender hold my reserves?", a: "No. Reserves are money you prove is in your accounts when the loan closes. The lender does not take it or freeze it. You keep it." },
    { q: "Can I use equity from one rental to buy another?", a: "Yes. A cash-out refinance or a line of credit on a property you own can fund the next down payment. Both loans then depend on the rents, so the rent on each house must pay that house's loan." },
    { q: "What reserves do I need for a second rental?", a: "Six months of payments on the new property under the standard rule, plus a share of the loan balances on your other financed rentals. The share rises with the count. A DSCR lender writes its own rule." },
  ],
  sources: [
    { name: "Fannie Mae Selling Guide, multiple financed properties", href: LIMIT },
    { name: "Selling Guide, minimum reserves", href: RESERVES },
    { name: "FHA Single Family Housing Policy Handbook 4000.1", href: FHA },
    { name: "A DSCR lender's published reserve guideline", href: DSCRRES },
  ],
  sourcesNote: "Educational only, not a loan offer. Loan rules change; a loan officer confirms them for your file.",
  bottomCta: { h2: "Plan the next loan before you shop.", p: "One call. We run the rent on the next house and put you with a loan officer at our preferred lender.", label: "Call a specialized agent", href: TEL },
  keywords: "how to finance multiple rental properties, financing a second rental property, how many mortgages can you have, ten financed properties limit, FHA multi unit house hacking, reserves for investment property, cash out refinance to buy another rental Myrtle Beach",
  about: "Financing more than one rental property in Myrtle Beach",
};
