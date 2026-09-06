/* /invest/llc/ - holding a Myrtle Beach rental in a South Carolina LLC.
 * Facts: research/invest-next/llc-facts.md; every cited source re-opened by
 * the writer 2026-09-06 (statute chapters, SOS forms, SCDOR pages and the
 * deed recording fee manual, the CFRE opinion, the county application, the
 * federal due-on-sale list, IRS pages). Brokerage facts from
 * research/invest-next/owner-answers-batch3.md (answers 19 to 25), attributed
 * to Devin Day, NMLS 2721275, without naming the lender. Body copy never names
 * an investor or a rate; the servicing-guide source sits in the sources line
 * only. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const LLCACT = "https://www.scstatehouse.gov/code/t33c044.php";
const SOSFORMS = "https://businessfilings.sc.gov/BusinessFiling/Home/DownloadForms?pdfCategoryId=1";
const DORFAQ = "https://dor.sc.gov/tax-index/business-income-taxes/corporate/corporate-faqs";
const DRF = "https://dor.sc.gov/tax-index/deed-recording-fee";
const DRFLAW = "https://www.scstatehouse.gov/code/t12c024.php";
const DRFMAN = "https://dor.sc.gov/sites/dor/files/Documents/Policy%20Manuals/Deed%20Recording%20Fee%20Manual%202024.pdf";
const ATI = "https://www.scstatehouse.gov/code/t12c037.php";
const LEGRES = "https://www.scstatehouse.gov/code/t12c043.php";
const CFRE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/27032.htm";
const HORRYAPP = "https://www.horrycountysc.gov/media/v5ajislx/legalres-instructionspdf.pdf";
const DOS = "https://www.law.cornell.edu/uscode/text/12/1701j-3";
const FNMA = "https://servicing-guide.fanniemae.com/svc/d1-4.1-02/allowable-exemptions-due-type-transfer";
const WH = "https://www.scstatehouse.gov/code/t12c008.php";
const DORRATE = "https://dor.sc.gov/tax/individual-income";
const I290 = "https://dor.sc.gov/sites/dor/files/forms/I290.pdf";
const IRSSM = "https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies";
const IRSLLC = "https://www.irs.gov/businesses/small-businesses-self-employed/limited-liability-company-llc";
const IRSRENT = "https://www.irs.gov/businesses/small-businesses-self-employed/tips-on-rental-real-estate-income-deductions-and-recordkeeping";
const DOI = "https://doi.sc.gov/DocumentCenter/View/2470/All-You-Ever-Wanted-To-Know-About-South-Carolina-Homeowners-Insurance";

module.exports = {
  url: "/invest/llc/",
  title: "Buying a Myrtle Beach Rental in an LLC | Chapter3",
  description: "Holding a Myrtle Beach rental in a South Carolina LLC: the filing fee, the deed into the LLC, reassessment, the loan question, and withholding when you sell.",
  ogTitle: "Buying and holding a Myrtle Beach rental in a South Carolina LLC",
  crumb: "Buying in an LLC",
  eyebrow: "Ownership structure",
  h1: "Should you hold a Myrtle Beach rental in an LLC?",
  h1em: "What it costs and what it changes.",
  sub: "A single-member LLC costs $110 to form in South Carolina and files no annual report. It takes the deed to a rental without a recording fee or a reassessment.",
  heroCta: { label: "Send the address", href: RTN },
  author: "tim",
  shortAnswer: "An LLC is a company you form with the state to own the rental. South Carolina charges $110 to file the articles and requires a registered agent with a street address in the state. It asks for no annual report from an LLC that is not taxed as a corporation. A single-member LLC is ignored for state tax. Deeding a rental you already own into it costs no recording fee and does not reset the property tax value. It does not change your income tax: the rental still goes on your Schedule E. The loan is the hard part. A conventional loan is made to a person, not a company. A DSCR loan closes in the LLC, and the lender requires it. Every investor client we work with holds title in an LLC, a trust or a corporation. The company's debts stay the company's, unless you sign a personal guaranty.",
  sections: [
    { h2: "What is an LLC, and what does it do for a rental owner?", html:
      h.p(`A limited liability company is a company you form by ${h.ext(LLCACT, "filing articles of organization")} with the state. It exists from the day the filing is accepted. Once you deed the rental to it, the LLC holds title, signs the leases and collects the rent.`) +
      h.p(`${h.ext(LLCACT, "The state's LLC law")} makes the company's debts and liabilities the company's alone. A member is not liable for them solely for being a member. The statute covers nothing else. A guaranty you sign is your own promise, your own negligence is your own, and a lawyer can tell you when a court disregards the company.`) +
      h.p("An LLC does not lower your income tax and does not replace insurance. It changes who owns the rental. That changes the deed, the loan, the property tax file and the sale, in the order below. Every investor client Chapter3 works with holds title in an LLC, a trust or a corporation.") },
    { h2: "What does it cost to form and keep a South Carolina LLC?", html:
      h.p(`${h.ext(SOSFORMS, "The state's filing fee")} for the articles of organization is $110. An online filing shows a $15 electronic records charge on the receipt. The articles name ${h.ext(LLCACT, "a registered agent")} with a street address in South Carolina. The agent can be you, if you live in the state, or a company that does business here.`) +
      h.p(`An LLC that is taxed as a partnership, or ignored for tax, files no annual report and pays no license fee to the state. ${h.ext(DORFAQ, "The report is required")} only from an LLC that elects to be taxed as a corporation, within 60 days of starting business.`) +
      h.p(`Run the company as a company. Open a bank account in its name, sign the leases in its name, and keep its money apart from yours. ${h.a("/invest/out-of-state/", "An owner in another state")} still needs a registered agent with a South Carolina street address. Single-member or multi-member changes nothing about the deed rules or the loan. It changes the tax return and the 4 percent rate, below.`) },
    { h2: "How do you move a rental you already own into the LLC?", html: (bg) =>
      h.p("You sign a deed from yourself to the LLC and record it with the county. Two state charges can apply to that deed: the recording fee and a property tax reassessment. Each has an exemption for a single-member LLC.") +
      h.p(`${h.ext(DRF, "The deed recording fee")} is $1.85 for each $500 of value. ${h.ext(DRFLAW, "For a deed between an owner and their own company")}, value means market value, whatever the deed says was paid. A deed from a member to a single-member LLC that is ignored for tax owes no fee, ${h.ext(DRFMAN, "under the state's fee manual")}. A multi-member LLC taxed as a partnership owes none when the only consideration is an interest in the company. A deed from a partnership or a corporation back to an owner pays the fee.`) +
      h.p(`${h.ext(ATI, "A deed is an assessable transfer of interest")}. The county resets the taxable value to market value as of the end of that year. The 15 percent cap on increases does not apply, and the new value is taxed from the following year. A deed to a single-member LLC, not taxed as a corporation, by its single member is not an assessable transfer. A deed to a multi-member LLC is exempt only when the contribution is tax-free under the federal partnership rule, which is a question for your CPA. ${h.a("/buyers/property-taxes/", "How the reassessment changes the bill")}.`) +
      h.p("Selling more than half of the LLC later is an assessable transfer too. The company must tell the assessor within 45 days on the state's form. The penalty for silence is $100 to $1,000.") +
      h.p("In Chapter3's closings the closing attorney drafts the deed into the LLC. In Devin Day's experience the county rarely questions that deed unless something else about the transfer looks wrong.") +
      h.cta("Buying in an LLC?", "Send the address and how you plan to hold it. We run the numbers, and we tell you what changes on the deed, the loan and the tax file.", "Send the address", RTN, bg) },
    { h2: "Does the LLC change your income tax?", html:
      h.p(`No. ${h.ext(IRSSM, "A single-member LLC is disregarded")} for income tax unless it elects to be taxed as a corporation. The rental goes on your own return, on ${h.ext(IRSRENT, "Schedule E")}, as it did before. ${h.ext(IRSLLC, "An LLC with two or more members")} is a partnership by default and files its own return. The state follows the same classification, on ${h.ext(DORFAQ, "an SC1040 with Schedule E or an SC1065")}.`) +
      h.p(`Depreciation, the 14-day rule and a 1031 exchange work the same inside the LLC. A disregarded LLC is the same taxpayer as its owner for the exchange. ${h.a("/invest/14-day-rule/", "The 14-day rule")}. ${h.a("/invest/strategies/1031-exchange/", "How a 1031 exchange runs here")}.`) },
    { h2: "Can you get a loan in the LLC's name?", html:
      h.p("A conventional loan is made to a person, not a company. The rules that govern those loans allow a trust to borrow in some cases, and not an LLC. You buy in your own name, or the loan is a business-purpose loan made to the LLC.") +
      h.p(`Devin Day, licensed MLO, NMLS 2721275, says every DSCR program and business-purpose loan he works with closes in the name of an LLC or a corporation. The lender requires it. ${h.a("/invest/strategies/dscr-loans/", "How a DSCR loan qualifies on the rent")}. The lender sets its own rules on personal guaranties and on which LLC documents it wants.`) +
      h.p(`Deeding the house to your LLC after closing on a conventional loan raises the due-on-sale question. ${h.ext(DOS, "Federal law lists the transfers")} a lender cannot call the loan for. The list names a lease of three years or less, a transfer to a spouse or child, and a transfer at death. It also names a transfer into a living trust that keeps you as the beneficiary. A transfer to a company is not on it. The servicing rules for many conventional loans allow a transfer to an LLC the borrower controls, for loans the investor bought after mid-2016. The same rules require the deed back to a person before a refinance. Your servicer's rule governs. Ask in writing before you record the deed.`) +
      h.p("One transfer is never allowed. A loan on a primary residence carries a promise to move in and live there, usually for a year. Deeding that house to an LLC a month after closing and renting it out breaks the promise. That is mortgage fraud. Devin Day's rule: we do not help with it, and we show you the legal version, which pays as well or better. Buy with the loan that matches the plan, or live out the occupancy period, then deed and rent.") },
    { h2: "Can an LLC-owned home get the 4 percent rate?", html:
      h.p(`${h.ext(LEGRES, "The 4 percent legal residence rate")} goes to an owner who lives in the home as their domicile. A rental never qualifies, whoever owns it. ${h.ext(CFRE, "The state supreme court has held")} that a home owned by a single-member LLC qualifies when the member meets every test. ${h.ext(HORRYAPP, "Horry County's application")} asks for the operating agreement of a single-member LLC. In Devin Day's experience the assessor accepts the application when the LLC's owner lives in the house.`) +
      h.p(`With a multi-member LLC the rate is prorated to the resident member's share of the company. ${h.ext(LEGRES, "Two exceptions restore the full rate")}. One is a resident who holds at least a quarter of the property with immediate family members. The other is an LLC whose only members are the resident and their parents, spouse, children, grandchildren or siblings, when the resident deeded the house into it.`) +
      h.p(`The rented part of any property is taxed at 6 percent, in your name or the LLC's. ${h.a("/buyers/property-taxes/", "How the two rates are calculated")}.`) },
    { h2: "What happens when the LLC sells?", html:
      h.p(`If the members live outside South Carolina on the day of the sale, ${h.ext(WH, "the buyer withholds state income tax")} from the proceeds. A partnership, a trust and an estate are withheld at the top individual rate, ${h.ext(DORRATE, "5.21 percent for a 2026 sale")}. A corporation and any other nonresident entity are withheld at 5 percent. The state's tax code classes an LLC by its tax election. A partnership-taxed LLC is a partnership, a corporation-taxed LLC is a corporation, and a disregarded LLC is its owner. Ask the closing attorney how it classes the LLC on ${h.ext(I290, "the withholding form")}.`) +
      h.p(`The withholding applies to the gain when the seller gives the buyer a signed affidavit of gain, and to the whole price when it does not. The buyer sends it to the state by the 15th of the month after closing. The LLC allocates it to the members on their returns. ${h.a("/sell/rental-property/", "Selling a rental with a tenant or bookings in place")}. ${h.a("/sell/capital-gains/", "The gain and withholding calculator")}.`) },
    { h2: "What do you decide before the contract?", html: (bg) =>
      h.p("Settle the title holder before you write the offer: you, or an LLC formed before the contract. Decide which loan fits that choice, a conventional loan in your name or a business-purpose loan in the LLC's name. Name the registered agent. Decide whether one LLC holds every property or each property gets its own.") +
      h.p(`Tell the insurer who holds title. ${h.ext(DOI, "The state's insurance guide")} makes insuring the building the owner's job, and the owner is now the LLC. Insurance is a commodity here: hundreds of carriers write a landlord policy with the LLC as the named insured. Devin Day's advice is to buy the cheapest policy that satisfies you and the lender.`) +
      h.cta("Want the structure settled before you offer?", "Tell us how you plan to hold the property. We match the contract, the lender and the closing attorney to that choice.", "Ask about buying in an LLC", "/contact/", bg) },
  ],
  faqTitle: "LLC FAQ",
  faq: [
    { q: "How much does it cost to form an LLC in South Carolina?", a: "The filing fee for the articles of organization is $110. An online filing adds a $15 electronic records charge. An LLC that is not taxed as a corporation files no annual report and pays no license fee." },
    { q: "Do I pay the deed recording fee when I move my rental into my LLC?", a: "Not for a single-member LLC that is ignored for tax. A multi-member LLC taxed as a partnership owes none when the only consideration is an interest in the company. A deed from a partnership or corporation back to an owner pays the fee." },
    { q: "Will my property taxes go up if I deed the house to my LLC?", a: "Not for a deed to a single-member LLC, not taxed as a corporation, by its single member. A deed to a multi-member LLC is exempt only when the contribution is tax-free under the federal partnership rule. Selling more than half of the LLC later triggers a reassessment." },
    { q: "Can my LLC get a conventional mortgage?", a: "No. Conventional loans are made to people. A business-purpose loan such as a DSCR loan closes in the LLC name, and the lender requires the entity. Deeding a house with a conventional loan to your LLC is a question for the servicer, in writing, before you record." },
    { q: "Can I move my house into an LLC after closing on a conventional loan?", a: "Ask the servicer in writing first. Many servicers allow a transfer to an LLC the borrower controls and require the deed back before a refinance. A primary-residence loan carries an occupancy promise, and moving the house into an LLC to rent it a month later breaks it." },
    { q: "Do I need an LLC for a DSCR loan?", a: "Yes. Devin Day, NMLS 2721275, says every DSCR and business-purpose program he works with closes in the name of an LLC or a corporation." },
    { q: "Does an LLC lower the income tax on my rental?", a: "No. A single-member LLC is disregarded and the rental stays on your Schedule E. A multi-member LLC files a partnership return and the income passes to the members." },
    { q: "Does the state withhold tax when my LLC sells?", a: "If the members live outside South Carolina, yes. A partnership-taxed LLC is withheld at the top individual rate, 5.21 percent for a 2026 sale. A corporation-taxed LLC is withheld at 5 percent. A disregarded LLC is withheld as its owner." },
  ],
  sources: [
    { name: "SC Code, Title 33, Chapter 44", href: LLCACT },
    { name: "Secretary of State, entity forms", href: SOSFORMS },
    { name: "SCDOR, corporate FAQs", href: DORFAQ },
    { name: "SC Code 12-24-40", href: DRFLAW },
    { name: "SCDOR, deed recording fee manual", href: DRFMAN },
    { name: "SC Code 12-37-3150", href: ATI },
    { name: "SC Code 12-43-220", href: LEGRES },
    { name: "CFRE, LLC v. Greenville County Assessor", href: CFRE },
    { name: "12 U.S.C. 1701j-3", href: DOS },
    { name: "Fannie Mae Servicing Guide D1-4.1-02", href: FNMA },
    { name: "SC Code 12-8-580", href: WH },
    { name: "IRS, single member LLCs", href: IRSSM },
  ],
  sourcesNote: "Educational only, not legal or tax advice. The withholding rate follows the state's top individual rate each year.",
  bottomCta: { h2: "Settle the title, the loan and the deed before you offer.", p: "Send the address and how you plan to hold it. We run the numbers and match the lender and the closing attorney to that choice.", label: "Send the address", href: RTN },
  keywords: "buying rental property in an LLC South Carolina, transfer rental to LLC South Carolina deed recording fee, LLC property tax reassessment South Carolina, DSCR loan LLC Myrtle Beach, South Carolina LLC filing fee, LLC 4 percent legal residence South Carolina",
  about: "Holding a Myrtle Beach rental property in a South Carolina LLC",
};
