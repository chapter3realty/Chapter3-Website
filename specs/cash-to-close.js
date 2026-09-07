/* /invest/cash-to-close/ - every line an investor pays beyond the down
 * payment. Qualitative on the loan (owner rule: no down-payment percentage,
 * rate or payment amount on this page). Facts:
 * research/invest-next/cash-to-close-facts.md, each cited source re-opened
 * 2026-09-06. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";

module.exports = {
  url: "/invest/cash-to-close/",
  title: "Cash to Close on a Myrtle Beach Rental | Chapter3",
  description: "What an investor pays at a Horry County closing beyond the down payment: attorney and title, prepaid insurance, the tax escrow, lender reserves and licenses.",
  ogTitle: "Cash to close on a Myrtle Beach rental, beyond the down payment",
  crumb: "Cash to close",
  eyebrow: "Before you offer",
  h1: "What do you pay to close on a Myrtle Beach rental?",
  h1em: "Beyond the down payment.",
  sub: "The down payment is one line. At a Horry County closing the attorney, title insurance, a year of insurance, the tax escrow, lender reserves and the licenses are the rest.",
  heroCta: { label: "Send the address", href: RTN },
  author: "devin",
  shortAnswer: "Cash to close is the wire you send on closing day. It is the down payment plus the closing costs and the prepaid items. On a Horry County rental the closing costs are the attorney, the title search and title insurance, and the recording fees. The prepaid items are a year of insurance, interest to the end of the month, and the first months of the tax escrow. Your lender then asks you to show reserves you do not spend. After closing you pay the licenses, the utility deposits and the furnishing. The list below has every line and who sets it.",
  sections: [
    { h2: "What is cash to close?", html:
      h.p(`It is the amount you wire on closing day. ${h.ext("https://www.consumerfinance.gov/owning-a-home/closing-disclosure/", "The federal closing form")} keeps two totals apart. Total closing costs exclude the down payment. Cash to close is the down payment plus the closing costs plus the prepaid items, less your earnest money and any seller credit.`) +
      h.p("Three groups of money matter. What you pay at closing. What your lender requires you to show and keep. What you pay in the weeks after closing. The table has every line and who sets it.") +
      h.table(["Line", "When", "Who sets it"], [
        ["Down payment", "At closing", "Your lender, or you if you pay cash"],
        ["Attorney, title search, settlement", "At closing", "The attorney's fee schedule"],
        ["Lender's title policy", "At closing", "A premium schedule filed with the state, by price"],
        ["Owner's title policy, optional", "At closing", "The same schedule"],
        ["Recording fees", "At closing", "State law, flat"],
        ["Lender fees", "At closing", "Your lender"],
        ["Insurance, first year", "At closing", "Your insurer, with wind and flood where required"],
        ["Prepaid interest", "At closing", "The days left in the month"],
        ["Tax escrow deposit", "At closing", "Months since the last bill, plus a cushion"],
        ["HOA statement and any capital contribution", "At closing", "The community's recorded documents"],
        ["Inspection, wood report, survey", "Before closing", "The companies you hire"],
        ["Reserves", "Shown, not spent", "Your lender"],
        ["Licenses, utility deposits, furnishing", "After closing", "The state, county or city; the utilities; you"],
      ]) },
    { h2: "What do the attorney and title cost?", html:
      h.p(`South Carolina requires an attorney to run the closing, so there is no separate title company fee. The attorney's fee is flat and set by the attorney. Ask for the schedule before you sign the contract. ${h.a("/buyers/closing-costs/", "Who pays what at a South Carolina closing")}.`) +
      h.p(`Title insurance is two policies. ${h.ext("https://www.consumerfinance.gov/ask-cfpb/what-is-owners-title-insurance-en-164/", "Most lenders require a lender's policy")}, and it protects only the lender. An owner's policy is your choice and protects you. Buying both from one company usually costs less than buying them apart. Premium schedules are filed with the state and public, so the attorney can quote them from the price.`) +
      h.p(`The deed recording fee is the seller's. ${h.ext("https://www.scstatehouse.gov/code/t12c024.php", "State law")} puts it on the grantor. The buyer pays in three cases: a foreclosure deed, a deed from a government body, and a deed from a retirement plan. The flat filing fees are small: $15 to record the deed and $25 to record the mortgage.`) },
    { h2: "What is prepaid at closing?", html:
      h.p(`A year of insurance. On the coast that means the owner policy, wind cover where the policy excludes it, and flood cover where the zone requires it. ${h.ext("https://www.floodsmart.gov/get-insured/buy-a-policy", "A flood policy bought with a loan closing starts at closing")}; a cash buyer waits 30 days, so buy it a month ahead. ${h.a("/buyers/coastal-insurance/", "The coastal insurance bill, explained")}.`) +
      h.p(`Interest from closing day to the end of the month. Then property tax. ${h.ext("https://www.horrycountysc.gov/tax-payer-services/real-property-tax/", "Horry County mails the bill October 1")} and payment is due January 15. The seller credits you at closing for their share of the year, by contract. If you have a loan, the lender opens an escrow account with the months since the last bill plus a cushion of up to two months.`) +
      h.p(`The bill itself is at the 6 percent rate, because a rental is not your legal residence. ${h.a("/buyers/property-taxes/", "How Horry County property tax is calculated")}. If the first bill goes to the prior owner and you never get it, ${h.ext("https://www.scstatehouse.gov/code/t12c045.php", "the treasurer waives the penalty")} once you ask.`) },
    { h2: "What are lender reserves?", html: (bg) =>
      h.p("Reserves are money you still have after the wire clears. Your lender measures them in months of the full monthly cost: the loan payment, taxes, insurance and any association dues. For an investment property the common requirement is six months. For a second home it is two. A home you live in usually needs none.") +
      h.p(`Own other financed properties and the lender adds a percentage of their balances on top. A DSCR loan has its own reserve rule, set by that lender. ${h.a("/invest/strategies/dscr-loans/", "DSCR loans, explained")}.`) +
      h.cta("Want the sheet for one address?", "Send the address and the plan. We build cash to close with your lender's figures, the attorney's schedule, the insurance quote and the tax bill at the 6 percent rate.", "Send the address", RTN, bg) },
    { h2: "Where does the earnest money go?", html:
      h.p(`Into a trust account, and it is credited to you at closing. ${h.ext("https://www.scstatehouse.gov/code/t40c057.php", "State law")} requires the broker-in-charge to deposit a check within 48 hours of written acceptance of the offer, and cash within 48 hours of receipt. The money stays in the account until the sale closes or the contract ends, and is paid out as the contract directs.`) },
    { h2: "What do you pay after closing?", html: (bg) =>
      h.ul([
        `A state retail license if you book guests yourself: ${h.ext("https://dor.sc.gov/businesses/apply-business-tax-account/licensing-retail-license", "$50, and it does not expire")}. The accommodations tax license is another $50. Neither is the county license.`,
        `The county business license, in unincorporated Horry County: ${h.ext("https://www.horrycountysc.gov/media/gjnntcw1/2024-rate-schedule.pdf", "$55 minimum on the first $50,000 of rent")}, then $1.37 per $1,000 above it. The county doubles both for a business with no fixed place of business in the county. Ask the license office whether a rental you run from another state counts.`,
        `A city license inside the City of Myrtle Beach: ${h.ext("https://www.cityofmyrtlebeach.com/careers/business/business_faq.php", "every rental property needs one")}, and the fee is set from gross receipts. ${h.a("/invest/accommodations-tax/", "Licenses and taxes by jurisdiction")}.`,
        "Utility deposits. Each utility takes an application, a copy of the settlement statement and a deposit before the power and water go into your name.",
        "The first repairs, from the inspection report, and the furnishing for a short-term rental. Neither has a fixed price; list them before you offer, not after.",
      ]) +
      h.p(`For a condo, ask the association for a statement of what the seller owes before closing. ${h.ext("https://www.scstatehouse.gov/code/t27c031.php", "State law")} makes the buyer liable with the seller for unpaid assessments, and the statement caps that liability at the figure it shows.`) +
      h.cta("Building a budget for a specific property?", "Send the address. We list every line above with the real figures for that property and your plan.", "Send the address", RTN, bg) },
    { h2: "How do you build the number for one property?", html:
      h.ol([
        "Start with the price and your lender's down payment, or the full price if you pay cash.",
        "Get the attorney's fee schedule and the title premium for that price.",
        "Get an insurance quote for that address, with wind and flood where required.",
        "Take the tax bill at the 6 percent rate and split the year with the seller by contract.",
        "Add the HOA statement, and any capital contribution the documents charge a new owner.",
        "Add the inspection, the wood report and a survey if the lender wants one.",
        "Set aside the reserves your lender requires and do not count them as spendable.",
        "List the licenses, the deposits, the repairs and the furnishing for after closing.",
      ]) +
      h.p("The total is the number to have before you offer. It changes with the lender, the building and the plan. We build it for one address at a time.") },
  ],
  faqTitle: "Cash to close FAQ",
  faq: [
    { q: "Who pays the deed recording fee in South Carolina?", a: "The seller, by statute. The buyer pays it only on a foreclosure deed, a deed from a government body, or a deed from a retirement plan." },
    { q: "Do I need an owner's title policy?", a: "It is optional. The lender's policy is required for a loan and protects only the lender. An owner's policy protects you, and buying both from one company usually costs less than buying them apart." },
    { q: "Do lenders require reserves on an investment property?", a: "Most do. Your lender asks you to show months of the full monthly cost left in the bank after closing. Six months is common for a rental, and more if you have other financed properties." },
    { q: "When is the first property tax bill due?", a: "Horry County mails bills October 1 and payment is due January 15. The seller credits you at closing for their share of the year. If the bill went to the prior owner and you never received it, the treasurer waives the penalty." },
    { q: "Does an out-of-state owner pay more for a Horry County business license?", a: "The county doubles the minimum fee and the rate for a business with no fixed place of business in the county. Ask the license office whether a rental you run from another state counts before you file." },
  ],
  sources: [
    { name: "South Carolina Code, deed recording fee", href: "https://www.scstatehouse.gov/code/t12c024.php" },
    { name: "CFPB, the Closing Disclosure explained", href: "https://www.consumerfinance.gov/owning-a-home/closing-disclosure/" },
    { name: "Horry County, real property tax", href: "https://www.horrycountysc.gov/tax-payer-services/real-property-tax/" },
    { name: "South Carolina Department of Revenue, licenses", href: "https://dor.sc.gov/businesses/apply-business-tax-account/licensing-retail-license" },
    { name: "Fannie Mae Selling Guide, minimum reserve requirements", href: "https://selling-guide.fanniemae.com/sel/b3-4.1-01/minimum-reserve-requirements" },
  ],
  sourcesNote: "Educational only, not legal or lending advice. No loan terms are stated here; your lender quotes your real numbers.",
  bottomCta: { h2: "Send the address and get the cash-to-close sheet.", p: "We build it with your lender's figures, the attorney's schedule, the insurance quote and the tax bill at the 6 percent rate.", label: "Send the address", href: RTN },
  keywords: "cash to close investment property Myrtle Beach, closing costs investment property South Carolina, how much money to buy a rental property Myrtle Beach, lender reserves investment property",
  about: "Cash to close on Myrtle Beach investment property",
};
