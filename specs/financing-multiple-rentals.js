/* /invest/financing-multiple-rentals/ - buying a second rental in Myrtle Beach:
 * the mistakes, one client's story, equity for the next one. Rebuilt 2026-09-07
 * on the owner's instruction (research/invest-next/owner-answers-batch4.md,
 * round 4): Chapter3 is a brokerage, never a lender, so no headline offers
 * financing; the ten-property limit is one short section halfway down, not the
 * focus; no FHA section. Loan rules re-opened the same day in the conventional
 * selling guide (multiple financed properties, minimum reserves); named in the
 * sources line only. His LTV percentages and "0 dollars down" stay off the page
 * (not a DOWN_PAYMENT_OK page): the page says "no new cash from savings".
 * Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const LIMIT = "https://selling-guide.fanniemae.com/sel/b2-2-03/multiple-financed-properties-same-borrower";
const RESERVES = "https://selling-guide.fanniemae.com/sel/b3-4.1-01/minimum-reserve-requirements";
const DSCRRES = "https://www.pinnaclefundingnetwork.com/blog/32-dscr-loan-reserve-requirements.html";

module.exports = {
  url: "/invest/financing-multiple-rentals/",
  title: "Buying a Second Rental in Myrtle Beach | Chapter3",
  description: "Buying a second rental in Myrtle Beach: the three mistakes we see, one client's story, and how equity in a rental you own pays for the next one.",
  ogTitle: "Buying a second rental in Myrtle Beach",
  crumb: "Second rental",
  eyebrow: "Repeat investors",
  h1: "What goes wrong when you buy a second rental in Myrtle Beach?",
  h1em: "The mistakes, the story, the equity.",
  sub: "In Myrtle Beach a second rental fails for three reasons: wrong paperwork, no plan for the worst case, and a spent reserve. Equity you own can buy the next one.",
  heroCta: { label: "Plan the next purchase", href: "/contact/" },
  author: "devin",
  shortAnswer: "Three things. Buyers expect the same paperwork as the first loan, and it is never the same. They skip the worst case. They spend the reserve on the house and have nothing for the first empty month. In Chapter3's files a client planned to spend every dollar fixing one house. He sold a few houses first, kept a reserve, and is buying again. Once you own a rental with equity, a cash-out refinance or a line of credit on it can pay the down payment on the next one. The next purchase then takes no new cash from savings. The rent on each house must pay that house's loan. We run the next house before you offer.",
  sections: [
    { h2: "What are the three mistakes on a second rental in Myrtle Beach?", html: (bg) =>
      h.p(`<strong>Expecting the same paperwork.</strong> The document list changes with every loan. Each lender has its own list. Each underwriter can add to it. The list for your second loan will not match the list for your first, even with the same broker. Send each document the day the loan officer asks for it.`) +
      h.p(`<strong>Skipping the worst case.</strong> A second rental doubles the income and doubles the risk. Before you buy, write down what happens if both houses have no tenant for three months, or if one needs a roof. Write down where that money comes from. We help clients plan for those cases before they buy, so the worst case is unlikely, and survivable if it comes.`) +
      h.p(`<strong>Spending the reserve.</strong> In Chapter3's files a client planned to fix a house he owned, rent it, sell a few others and buy more. Fixing the house would have used every dollar he had. We showed him the risk. He sold a few houses first, then fixed the house, and bought fewer than he planned. It took him longer. He did it the safer way, he kept a reserve, and he can keep buying now.`) +
      h.cta("Planning the next one?", "Tell us what you own and what you want to buy. We run the rent on the next house and check the numbers with both loans on them before you offer.", "Plan the next purchase", "/contact/", bg) },
    { h2: "How do you buy the next rental in Myrtle Beach without cash from savings?", html:
      h.p(`With equity you already own. A cash-out refinance or a line of credit on a property you own can pay the down payment on the next one. According to a loan officer at our preferred lender, a rental that has paid down its loan or risen in value is the usual source. Lenders cap the cash you can take out of a rental below the cap on a home you live in.`) +
      h.p(`This is how owners of several rentals buy the next one with no new cash from savings. The down payment still exists. It comes from a house you already own instead of your bank account.`) +
      h.p(`Two loans now depend on the rents. The rent on the refinanced house must pay its new, larger payment. The rent on the new house must pay its own payment. If both do, you bought the second house without new cash from savings. If one does not, you bought a house that costs you money every month.`) +
      h.p(`In Myrtle Beach the second cost that changes is the tax. ${h.a("/buyers/property-taxes/", "A rental is assessed at 6 percent")}, so the new house pays about three times the tax the seller paid while living in it. Put that number in before you decide the equity is enough.`) },
    { h2: "Is there a limit on how many rentals you can finance?", html:
      h.p(`Yes, on standard loans, and almost nobody reaches it. ${h.ext(LIMIT, "The standard limit is ten financed properties")}, counting your own home if it has a mortgage. Investors who pass it use ${h.a("/invest/strategies/dscr-loans/", "DSCR loans")} or portfolio loans, which have no such limit. Most investors never think about it.`) },
    { h2: "How much do lenders want in reserves for a second rental?", html: (bg) =>
      h.p(`Reserves are money in your accounts on the day the loan closes. The lender does not take it, hold it or freeze it. You prove it is there with statements, and you keep it.`) +
      h.p(`${h.ext(RESERVES, "The standard rule asks for six months of the new property's payment")}: principal, interest, taxes, insurance and dues. It also asks for a small share of the loan balances on your other financed rentals. ${h.ext(DSCRRES, "A DSCR lender writes its own rule")}. Most ask for two to six months of the new payment. Some add a few months for each other rental you own. Ask for the figure before you shop. ${h.a("/invest/cash-to-close/", "What lender reserves are, and what else you pay at closing")}.`) +
      h.cta("Ready for the next one?", "One call. We run the next house and put you with a loan officer at our preferred lender.", "Call a specialized agent", TEL, bg) },
  ],
  faqTitle: "Second rental FAQ",
  faq: [
    { q: "What is the most common mistake when buying a second rental?", a: "Spending the reserve. The house takes every dollar, and the first empty month or the first repair has nothing to pay it. Keep the reserve, buy fewer houses if you must, and keep buying." },
    { q: "Can I use equity from one rental to buy another in Myrtle Beach?", a: "Yes. A cash-out refinance or a line of credit on a property you own can pay the next down payment, so the purchase takes no new cash from savings. Both loans then depend on the rents. The rent on each house must pay that house's loan." },
    { q: "Does the lender hold my reserves?", a: "No. Reserves are money you prove is in your accounts when the loan closes. The lender does not take it or freeze it. You keep it." },
    { q: "Is there a limit on how many rentals I can finance?", a: "On standard loans, ten financed properties, counting your own home. Almost nobody reaches it. Investors who do use DSCR or portfolio loans, which have no such limit." },
  ],
  sources: [
    { name: "Fannie Mae Selling Guide, multiple financed properties", href: LIMIT },
    { name: "Selling Guide, minimum reserves", href: RESERVES },
    { name: "A DSCR lender's published reserve guideline", href: DSCRRES },
  ],
  sourcesNote: "Educational only, not a loan offer. Chapter3 is a real estate brokerage. Loan rules change; a loan officer confirms them for your file.",
  bottomCta: { h2: "Buying your second rental in Myrtle Beach?", p: "One call. We run the rent on the next house and check the numbers with both loans on them.", label: "Call a specialized agent", href: TEL },
  keywords: "buying a second rental property Myrtle Beach, second investment property mistakes, use equity to buy another rental, cash out refinance rental property Myrtle Beach, reserves for a second rental",
  about: "Buying a second rental in Myrtle Beach",
};
