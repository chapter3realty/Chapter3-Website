/* /invest/canadian-buyers/ - how a Canadian buys, rents out and sells a Myrtle
 * Beach rental. Every fact re-opened 2026-09-07 and recorded with its quote in
 * research/invest-next/canadian-facts.md (62 sources): the conventional
 * non-citizen rule, FHA's exclusion of non-permanent residents, three
 * foreign-national lenders' public requirements (no LTV, no rate, no
 * down-payment figure on this page), the ITIN, the 30 percent withholding on
 * rent and the election, FIRPTA, SC's non-resident seller withholding (now
 * tied to the top state rate, not 7 percent), estate exposure and the treaty
 * credit, the six-month stay, the substantial presence test, CRA's rules, the
 * attorney closing and the 6 percent assessment. The owner's answer 7 is on
 * the page as Chapter3's experience where the sources agree with it
 * (research/invest-next/owner-answers-batch5.md). No neighbourhood is called
 * "Canadian": no source says it. Chapter3 is a brokerage; nothing here is a
 * loan offer (A17, A17b). Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const NET = "/sell/net-proceeds/";
const B2202 = "https://selling-guide.fanniemae.com/sel/b2-2-02/non-us-citizen-borrower-eligibility-requirements";
const HUDFHA = "https://www.hud.gov/news/hud-no-25-048";
const LENDER = "https://www.americamortgages.com/ultimate-dscr-loan-faq-foreign-nationals-expats/";
const ITIN = "https://www.irs.gov/individuals/individual-taxpayer-identification-number";
const P519 = "https://www.irs.gov/publications/p519";
const P515 = "https://www.irs.gov/publications/p515";
const W8 = "https://www.irs.gov/instructions/iw8eci";
const FIRPTA = "https://www.irs.gov/individuals/international-taxpayers/firpta-withholding";
const CERT = "https://www.irs.gov/individuals/international-taxpayers/withholding-certificates";
const ESTATE = "https://www.irs.gov/individuals/international-taxpayers/some-nonresidents-with-us-assets-must-file-estate-tax-returns";
const SPT = "https://www.irs.gov/individuals/international-taxpayers/substantial-presence-test";
const F8840 = "https://www.irs.gov/forms-pubs/about-form-8840";
const TREATY = "https://www.irs.gov/pub/irs-trty/canada.pdf";
const CRA = "https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/canadian-residents-going-down-south.html";
const T1135 = "https://www.canada.ca/en/revenue-agency/services/tax/international-non-residents/information-been-moved/foreign-reporting/foreign-income-verification-statement.html";
const SC580 = "https://www.scstatehouse.gov/code/t12c008.php";
const I290 = "https://dor.sc.gov/forms-site/Forms/I290.pdf";
const SC220 = "https://www.scstatehouse.gov/code/t12c043.php";
const DOE = "https://www.sccourts.org/opinions/htmlfiles/sc/25508.htm";
const GC = "https://travel.gc.ca/destinations/united-states";
const USCIS = "https://www.uscis.gov/alienregistration";
const NAR = "https://www.nar.realtor/newsroom/foreign-buyers-purchased-45-3-billion-worth-of-u-s-homes-from-april-25-to-march-26";
const CANAM = "https://www.scencyclopedia.org/sce/entries/can-am-days/";
const VMB = "https://www.visitmyrtlebeach.com/plan/international-travelers/canadian-travelers";

module.exports = {
  url: "/invest/canadian-buyers/",
  title: "Canadians Buying Rentals in Myrtle Beach | Chapter3",
  description: "How a Canadian buys a Myrtle Beach rental: cash or a foreign-national loan, the U.S. tax number, the 30 percent rent withholding, and both withholdings at the sale.",
  ogTitle: "How a Canadian buys a rental in Myrtle Beach",
  crumb: "Canadian buyers",
  eyebrow: "Buying from Canada",
  h1: "How does a Canadian buy a rental in Myrtle Beach?",
  h1em: "The loan, the tax number, the two withholdings.",
  sub: "A Canadian can buy a Myrtle Beach rental with cash or a foreign-national loan. The rent needs a U.S. tax number. The sale has two withholdings.",
  heroCta: { label: "Ask about buying from Canada", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "A Canadian can own a house in South Carolina with no residency and no visa. The buying part is the same as it is for anyone.",
    "The money is the first difference. Most Canadian investors here pay cash. A regular American mortgage is for people living in the United States. A Canadian living in Canada uses a foreign-national loan, which is qualified on the rent the house brings in.",
    "The paperwork is the second. You get a United States tax number. You choose how the rent is taxed. You file the form that stops a 30 percent withholding on the rent. Two more withholdings come out when you sell. Canada taxes the same income and credits the tax you already paid here.",
    "Each of those steps has a section below, in the order you will meet them.",
  ],
  sections: [
    { h2: "Can a Canadian buy a house in Myrtle Beach?", html:
      h.p(`Yes. Nothing in South Carolina requires a buyer to be a citizen or a resident. ${h.ext(NAR, "Canada is the top country of origin for foreign buyers of U.S. homes")}, and about half of foreign buyers pay cash. ${h.ext(CANAM, "Myrtle Beach has held Can-Am Days for Ontario families every March since 1961")}. ${h.ext(VMB, "The area's visitor bureau calls Myrtle Beach the top beach in America for Canadian visitors")}.`) +
      h.p(`Every closing in South Carolina is run by a closing attorney. You can sign in person or by power of attorney from Canada. What you need before you offer:`) +
      h.table(["What", "Why"], [["A passport", "Identity for the attorney, the lender if any, and the utilities."], ["A U.S. bank account", "Two Canadian banks open U.S. accounts from Canada with a Canadian ID. The closing attorney gives wiring instructions for the funds."], ["A U.S. tax number, or a plan to get one", "Needed to file the return on the rent, to stop the 30 percent withholding, and to sell. Not needed to buy."], ["An accountant on each side of the border", "The rent and the sale are taxed in both countries. Canada credits the U.S. tax, but only on a return that claims it."]]) },
    { h2: "How does a Canadian pay for a Myrtle Beach rental?", html: (bg) =>
      h.p(`Three ways.`) +
      h.table(["Way", "Who it is for", "What it needs"], [["Cash", "Most Canadian investors, in Chapter3's files and in the national data.", "Funds wired to the closing attorney. No U.S. credit, no tax number, no loan file."], ["A foreign-national loan", "A Canadian who lives in Canada and wants a loan on a rental.", "A passport, foreign bank statements and reserves. No U.S. credit score. Some programs ask for a U.S. tax number, most do not. The loan is qualified on the property's rent, and it is for rentals only."], ["A standard U.S. loan", "A Canadian who lives in the U.S. with work authorization and a Social Security number or a U.S. tax number.", "The same file a U.S. buyer brings. Not open to a Canadian living in Canada."]]) +
      h.p(`${h.ext(B2202, "The standard loan rules cover non-citizens who are residents of the United States")}. A Canadian in Canada is outside that sentence, so the loan that fits is ${h.a("/invest/strategies/dscr-loans/", "one qualified on the rent")}. ${h.ext(LENDER, "One foreign-national lender's public list")}: a passport, six to twelve months of foreign bank statements, and no U.S. credit required. ${h.ext(HUDFHA, "FHA loans are closed to non-permanent residents")}, so a work permit opens a standard loan but not an FHA one.`) +
      h.p(`In Chapter3's experience the cash buyer closes fastest. A few of our Canadian investors have closed with a U.S. loan. If you want one, tell us early, because the loan file takes longer from outside the country.`) +
      h.cta("Buying a rental from Canada?", "Tell us the town and the budget. We tour by video, read the association documents, and put you with the closing attorney and, if you want a loan, a loan officer at our preferred lender.", "Ask about buying from Canada", "/contact/", bg) },
    { h2: "What is the U.S. tax number, and when does a Canadian owner need it?", html:
      h.p(`${h.ext(ITIN, "It is a nine-digit number for people who are not eligible for a Social Security number")}. You apply with Form W-7, by mail or in person, and you attach the tax return it is for unless an exception applies. A landlord receiving rent and a seller of U.S. property both qualify for an exception. Allow seven weeks, and nine to eleven from overseas or in tax season.`) +
      h.p(`You do not need it to buy. You need it three times after that. It goes on the U.S. return for the rent. It goes on the form that stops the 30 percent withholding, which you give to whoever collects your rent. It goes on the withholding certificate application when you sell. It expires if it is not used on a return for three years. Apply the year you buy, not the week you sell.`) },
    { h2: "How is the rent taxed for a Canadian owner?", html:
      h.p(`Two ways, and you choose.`) +
      h.table(["", "The default", "The election"], [["What is taxed", "The gross rent, with no deductions", "The net rent, after every expense the property has"], ["The rate", "A flat 30 percent", "The normal U.S. rates on the net"], ["Who takes it", `${h.ext(P515, "Whoever collects the rent withholds it")}: a manager, or the tenant`, "Nobody. You file Form 1040-NR and pay what the return shows"], ["The paper", "None", `${h.ext(W8, "Form W-8ECI to the person collecting the rent")}, which needs your U.S. tax number`]]) +
      h.p(`${h.ext(P519, "The election treats the rent as business income")}, so the mortgage interest, the taxes, the insurance, the manager and the depreciation all count. Almost every owner makes it. Without the form, the person collecting your rent must withhold 30 percent of every payment and is personally liable if they do not. Managers here will ask for the form before the first tenant pays.`) +
      h.p(`The U.S. return is due June 15. Canada taxes the same rent as world income and ${h.ext(CRA, "credits the U.S. tax you paid")}. ${h.ext(T1135, "A rental costing more than C$100,000 also goes on Form T1135")} each year; a vacation home used mostly by your family may not. The treaty does not exempt the rent. It lets the U.S. tax it first and makes Canada credit that tax.`) },
    { h2: "What happens when a Canadian sells a Myrtle Beach rental?", html: (bg) =>
      h.p(`Two withholdings at the closing table, then two returns. Both withholdings are deposits against the tax, not the tax itself. The excess comes back through the returns.`) +
      h.table(["Withholding", "How much", "On what", "Who takes it"], [["Federal", `${h.ext(FIRPTA, "15 percent")}`, "The sale price, not the gain", "The buyer, through the closing attorney"], ["South Carolina", `${h.ext(SC580, "The state's top income tax rate")}`, "The gain, if you sign an affidavit stating it. The sale price if you do not", "The buyer, remitted on Form I-290 by the fifteenth of the next month"]]) +
      h.p(`The federal residence exception, for sales at $300,000 or less, needs a buyer who will live in the house. A buyer who will rent it cannot give that, so a rental sold to another investor gets the full 15 percent. ${h.ext(CERT, "A withholding certificate can cut it to the tax that is due")}. The application, Form 8288-B, needs the tax numbers of everyone in the deal and takes about 90 days, so it is filed before the closing, not after.`) +
      h.p(`The state affidavit needs your U.S. tax number too. Without it, the state share is taken from the whole price. Then Canada taxes the gain as world income and credits the U.S. tax. ${h.a("/sell/rental-property/", "How selling a rental works here")}, and ${h.a("/sell/capital-gains/", "the capital gains rules")} that apply to every seller.`) +
      h.cta("Selling a Myrtle Beach rental from Canada?", "Tell us the address. We run the sale price, both withholdings and the closing costs before you list, and we start the certificate early.", "Have us run your net proceeds", NET, bg) },
    { h2: "How long can a Canadian stay, and when does U.S. tax residency start?", html:
      h.p(`${h.ext(GC, "Six months without a visa")}, declared at the border. ${h.ext(USCIS, "A stay of 30 days or longer must be registered")} with the U.S. government, and a Canadian who drove in without an entry record does that online.`) +
      h.p(`Tax residency is a separate count. ${h.ext(SPT, "The substantial presence test")} adds every day this year, a third of last year's days, and a sixth of the year before. At 183 you are a U.S. tax resident. About four months every year, every year, is enough to reach it. A snowbird who reaches it but keeps a home and a closer connection to Canada ${h.ext(F8840, "files Form 8840 by the return deadline")} to stay a nonresident. Miss the form and the exception is lost for that year. Canada keeps taxing you as a resident the whole time.`) },
    { h2: "What is different for a Canadian owner after closing?", html:
      h.ul([
        `<strong>The tax bill.</strong> ${h.ext(SC220, "The 4 percent rate needs a South Carolina domicile")}, so a Canadian's house is assessed at 6 percent like every rental. ${h.a("/buyers/property-taxes/", "The bill is about three times the bill for the same house as a primary residence")}.`,
        `<strong>The utilities.</strong> The power company runs a credit check to size the deposit and accepts a passport number or a tax number as identification. With no U.S. credit file, expect a deposit.`,
        `<strong>The insurance.</strong> ${h.a("/invest/landlord-insurance/", "The same landlord policy, wind and flood any investor buys here")}.`,
        `<strong>The estate.</strong> ${h.ext(ESTATE, "U.S. real estate is a U.S. asset for estate tax")}, and a nonresident's estate files when its U.S. assets pass $60,000. ${h.ext(TREATY, "The treaty gives a Canadian resident's estate a credit pro-rated to the U.S. share of the whole estate")}. The return is due nine months after death. Plan the title with an accountant on each side before you buy, not after.`,
      ]) },
  ],
  faqTitle: "Canadian buyer FAQ",
  faq: [
    { q: "Can a Canadian get a mortgage on a Myrtle Beach rental?", a: "A standard U.S. loan is for people who live in the U.S. with a Social Security number or a U.S. tax number. A Canadian living in Canada uses a foreign-national loan qualified on the rent, with a passport and foreign bank statements and no U.S. credit. Most Canadian investors here pay cash." },
    { q: "Do Canadians pay U.S. tax on Myrtle Beach rent?", a: "Yes. The default is a flat 30 percent of the gross rent, withheld by whoever collects it. Almost every owner instead elects to be taxed on the net rent, files Form 1040-NR, and gives the rent collector Form W-8ECI. Canada taxes the same rent and credits the U.S. tax." },
    { q: "How much is withheld when a Canadian sells a house in South Carolina?", a: "Two withholdings. The federal one is 15 percent of the sale price, taken by the buyer. The state one is the state's top income tax rate on the gain, or on the price without a seller's affidavit. Both are deposits; the excess comes back through the returns." },
    { q: "Do I need an ITIN to buy a house in Myrtle Beach?", a: "No. You need it to file the U.S. return on the rent, to stop the 30 percent withholding, and to get a withholding certificate when you sell. Apply the year you buy. It takes seven to eleven weeks." },
    { q: "How long can a Canadian stay in Myrtle Beach each year?", a: "Six months without a visa, declared at the border, with online registration for a stay of 30 days or more. About four months every year can make you a U.S. tax resident under the substantial presence test unless you file Form 8840 by the return deadline." },
  ],
  sources: [
    { name: "Selling Guide B2-2-02", href: B2202 },
    { name: "HUD 25-048", href: HUDFHA },
    { name: "a foreign-national lender's FAQ", href: LENDER },
    { name: "IRS, ITIN", href: ITIN },
    { name: "IRS Pub 519", href: P519 },
    { name: "Form W-8ECI", href: W8 },
    { name: "IRS, FIRPTA", href: FIRPTA },
    { name: "IRS, withholding certificates", href: CERT },
    { name: "IRS, nonresident estates", href: ESTATE },
    { name: "IRS, substantial presence", href: SPT },
    { name: "Form 8840", href: F8840 },
    { name: "U.S.-Canada treaty", href: TREATY },
    { name: "CRA, T1135", href: T1135 },
    { name: "SC Code 12-8-580", href: SC580 },
    { name: "SC Form I-290", href: I290 },
    { name: "SC Code 12-43-220", href: SC220 },
    { name: "Canada travel advice", href: GC },
    { name: "USCIS registration", href: USCIS },
    { name: "NAR 2026", href: NAR },
  ],
  sourcesNote: "Educational only, not tax, legal or loan advice. Chapter3 is a real estate brokerage, not a lender.",
  bottomCta: { h2: "Buying in Myrtle Beach from Canada?", p: "One call. We tour by video, read the documents, and line up the attorney and the accountant before you offer.", label: "Call a specialized agent", href: TEL },
  keywords: "Canadian buying property in Myrtle Beach, Canadians buying rental property in South Carolina, foreign national loan Myrtle Beach, FIRPTA withholding South Carolina, ITIN rental income Canada, snowbird buying condo Myrtle Beach",
  about: "How a Canadian buys, rents out and sells a Myrtle Beach rental",
};
