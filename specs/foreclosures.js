/* /invest/foreclosures/ - buying at the Horry County master-in-equity sale,
 * at the county tax sale, or as a bank-owned listing after the sale. Facts:
 * research/invest-next/foreclosures-facts.md; every cited source re-opened by
 * the writer 2026-09-06 (county pages and PDFs, statute chapters, Rule 71,
 * the court's FAQ, the Johnson opinion, federal pages). Brokerage facts, the
 * tax-sale story and the site-visit story from
 * research/invest-next/owner-answers-batch3.md (answers 26 to 32, round 2).
 * The next sale date is not printed: it changes monthly. Built by
 * tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const MIE = "https://www.horrycountysc.gov/departments/master-in-equity/";
const SALES = "https://horrycountysc.gov/departments/master-in-equity/principal-sales/";
const BIDDER = "https://www.horrycountysc.gov/media/erupyg1k/bidder-information-foreclosure-sale.pdf";
const REGFORM = "https://www.horrycountysc.gov/media/wfdlezhn/bidder-registration-form.pdf";
const T15 = "https://www.scstatehouse.gov/code/t15c039.php";
const RULE71 = "https://www.sccourts.org/resources/judicial-community/court-rules/civil/rule-71/";
const MIEFAQ = "https://www.sccourts.org/media/12mcqkhy/faq_eng_masterinequity-court.pdf";
const DRF = "https://www.scstatehouse.gov/code/t12c024.php";
const JOHNSON = "https://www.sccourts.org/media/opinions/HTMLFiles/COA/4165.htm";
const TAXLIEN = "https://www.scstatehouse.gov/code/t12c049.php";
const DELTAX = "https://www.horrycountysc.gov/departments/treasurer/delinquent-tax/";
const TAXSALE = "https://www.horrycountysc.gov/media/abgkgrll/bidder-tax-sale-information.pdf";
const T1251 = "https://www.scstatehouse.gov/code/t12c051.php";
const HUDSELL = "https://www.hud.gov/helping-americans/hudhomes-how-to-sell";
const HUDFAQ = "https://www.hudhomestore.gov/FAQ";
const ML = "https://www.hud.gov/sites/dfiles/OCHCO/documents/2025-13hsgml.pdf";
const PTFA = "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title12-section5220&num=0&edition=prelim";
const ROD = "https://www.horrycountysc.gov/departments/register-of-deeds/";

module.exports = {
  url: "/invest/foreclosures/",
  title: "Buying a Foreclosure in Horry County, SC | Chapter3",
  description: "A foreclosure purchase in Horry County: the master-in-equity sale, the 30-day bidding period, the tax sale and its redemption year, and bank-owned listings.",
  ogTitle: "How to buy a foreclosure in Horry County: the sale, the deed, the tax sale and REO",
  crumb: "Foreclosures",
  eyebrow: "The sale and the listing",
  h1: "How do you buy a foreclosure in Horry County?",
  h1em: "The courthouse sale, the deed it passes, and the bank-owned listing.",
  sub: "Horry County's foreclosure sale is held at 11 in the morning on the first Monday of each month, for registered bidders with certified funds. Bank-owned homes list on the MLS.",
  heroCta: { label: "Ask about a sale property", href: "/contact/" },
  author: "tim",
  shortAnswer: "Horry County's foreclosed homes are sold two ways. The master-in-equity court auctions them at 11 in the morning on the first Monday of each month, in Conway. You register a week ahead and bid in person. You pay 5 percent of the bid in certified funds by noon the next day, and the rest within 30 days. If the lender asked for a deficiency judgment, bidding stays open for 30 more days and anyone can outbid you. The deed carries no warranty and comes subject to unpaid taxes and senior liens. Bank-owned homes, called REO, list on the MLS and sell through an ordinary contract, and government sellers give owner-occupants the first days. A tenant in the house keeps the lease or gets 90 days. Tim Nash has bought at this sale many times, for himself and for clients.",
  sections: [
    { h2: "What is a foreclosure sale in Horry County?", html:
      h.p("A foreclosure sale is a court-ordered auction of a home whose owner defaulted on the mortgage. In South Carolina the lender sues, the court orders the sale, and a judge called the master-in-equity holds the auction. The high bidder gets a master's deed from the court, not a deed from the owner.") +
      h.p("There are two ways to buy. You bid at the sale, or you buy the house from the lender after the lender wins the bid and lists it. The second kind is a bank-owned listing, called REO. This page covers both, and the county's separate tax sale. Tim Nash has bought at the Horry County sale many times, for his own account and for clients.") +
      h.p(`${h.ext(MIE, "Horry County holds the sale")} at 11 in the morning on the first Monday of each month, or the first Tuesday when the Monday is a holiday. ${h.ext(BIDDER, "The sale is held")} on the third floor of the Horry County Government and Justice Building, 1301 2nd Avenue, Conway. Each property is advertised three times over three consecutive weeks in a county newspaper. ${h.ext(SALES, "The county lists the properties")} with links to the judgment and the notice of sale.`) },
    { h2: "How do you register and bid?", html:
      h.p(`New bidders send ${h.ext(REGFORM, "the registration form")} with a copy of a government photo ID at least a week before the sale. The county registers no one on the day of the sale. Its documents give the deadline as seven days, one week, and the Monday before, so file it a full week ahead.`) +
      h.p(`You or your authorized agent must be in the room. ${h.ext(BIDDER, "The court allows no virtual bidding")}. Bids rise in even increments of at least $500. The lender bids once, at the sale, and cannot bid again.`) +
      h.p(`A first-time winner pays ${h.ext(SALES, "a $2,500 certified check")} at the close of bidding, or the property is re-sold at once. Every winner pays 5 percent of the bid in certified funds by noon the next day. The balance is due within 30 days, on the date the judgment sets. A winner who does not pay forfeits the deposit and the right to bid at future sales.`) },
    { h2: "What is the 30-day upset bid period?", html: (bg) =>
      h.p(`A deficiency judgment is a claim against the borrower for the part of the debt the sale does not cover. When the lender's complaint asks for one, the sale does not close on sale day. ${h.ext(T15, "State law keeps the bidding open")} until the 30th day after the sale, not counting the sale day. On that day, at 11 in the morning, the master reopens the bidding. Anyone can bid more than the high bid from the sale. ${h.ext(MIE, "The lender cannot bid")} at the upset bid sale.`) +
      h.p("When the complaint waives the deficiency, the advertisement says so, and the bidding closes on sale day. Compliance can be made immediately. Read the notice of sale for that sentence before you plan.") +
      h.p("The deposit rule applies to both sales. A winner at the sale or at the upset bid sale who fails to pay the balance by the 30th day after the close forfeits the deposit.") +
      h.cta("Watching a property on the sale list?", "Send the address. We pull the judgment and the notice of sale, and run the rent and the repair budget against the bid.", "Send the address", RTN, bg) },
    { h2: "What does the master's deed carry?", html:
      h.p(`${h.ext(BIDDER, "The master's deed is not a warranty deed")}. ${h.ext(T15, "It passes the rights the court adjudged to be sold")}, and nothing more. The liens of everyone named in the case end at the sale. A lien held by someone who was not in the case survives, including a prior mortgage that was not foreclosed.`) +
      h.p(`Property taxes are ${h.ext(TAXLIEN, "a first lien")}. ${h.ext(JOHNSON, "The state's court of appeals has held")} that property cannot be sold in foreclosure free of the existing tax liens unless provision is made to pay them. The county's sheet says the same in one sentence: unpaid taxes are the successful bidder's. ${h.ext(RULE71, "The judgment lists the liens, taxes and other rights")} the property is sold subject to, so read it before you bid.`) +
      h.p(`The court has no keys, no knowledge of the condition and no access to give you. ${h.ext(BIDDER, "The county advises")} an attorney's certification of title, based on a title search, before you bid. We get the quote for that certification before you register, and a lender wants the same quote with its own list of what the attorney must certify. On a master-in-equity deed ${h.ext(DRF, "the buyer pays the deed recording fee")}, $1.85 for each $500 of value. On an ordinary sale the seller pays it.`) +
      h.p(`${h.ext(MIEFAQ, "The court's own guide")} tells the owner they may stay until the home is sold and the deed issues. The foreclosure chapter of the state code sets no period for the owner to redeem after that. The tax sale is different. It has a 12-month redemption period.`) },
    { h2: "Who is living in the house, and what are their rights?", html:
      h.p(`${h.ext(PTFA, "Federal law")} protects a bona fide tenant when title passes at a foreclosure. The tenant keeps a lease signed before the foreclosure notice until its term ends. A buyer who will live in the home as a primary residence can end the lease at the sale, with 90 days notice. A tenant without a lease, or on a month-to-month lease, gets 90 days notice.`) +
      h.p(`Bona fide means three things. The tenant is not the borrower or the borrower's child, spouse or parent. The lease was an arm's length transaction. The rent is not substantially below market. The 90 days run from the day title passes to you. A former owner who stays is removed through the court, never by you. ${h.a("/invest/landlord-rules/", "How the sheriff removes an occupant, and what a lockout costs")}.`) },
    { h2: "Why visit the property before the sale?", html:
      h.p("Because the court gives you no access, the visit is the only inspection you get. A Chapter3 agent took a call from a man who planned to bid on a house at the sale. The agent drove to the property first: a brick ranch on an acre, a tarped roof, and a car with a current plate in the carport. He knocked. The sister of the previous owner answered. She still lived there, and the bank would not speak with her because her name was not on the loan.") +
      h.p("The agent spent two weeks in the county records and found that the mobile home behind the house had never been conveyed with the land. It was her property. He told the buyer before the sale, not after. He then wrote a lease between the buyer and her for the back corner of the lot, and both signed it in an afternoon. The buyer got a renovation with someone on site to watch it. She kept her home under a written lease. The agent listed the house that summer and sold it in eleven days to a couple from Ohio. The visit before the sale is what made the purchase work.") },
    { h2: "How do you pay for a courthouse purchase?", html:
      h.p(`${h.ext(BIDDER, "The county's terms")} are certified funds for the deposit by noon the next day and full payment within 30 days. Neither county document mentions financing or a contingency. The judgment sets the compliance date, and the deposit is forfeited if you miss it.`) +
      h.p("Decide how you will pay before you register. A loan that needs an appraisal, an inspection or a title commitment has to close inside the compliance period, on a deed with no warranty. Ask the lender before the sale whether it will do that, and whether it will lend against the property once the deed is recorded. Devin Day, licensed MLO, NMLS 2721275, reviewed this section.") +
      h.p(`${h.a("/invest/strategies/brrrr/", "The BRRRR page")} covers the refinance after a cash purchase. ${h.a("/invest/strategies/fix-and-flip/", "The fix and flip page")} covers the repair budget.`) },
    { h2: "How does a bank-owned listing work?", html: (bg) =>
      h.p("When the lender is the high bidder, the house becomes the lender's real estate owned, REO. The lender lists it on the MLS and sells it through an ordinary contract and closing. The earnest money is held by the closing attorney, as in any sale here. Everything else is negotiated in the contract. Ordinary financing works when the condition allows. Devin Day, licensed MLO, NMLS 2721275, puts the loan on a bank-owned purchase at about 45 days, longer than an ordinary purchase, case by case.") +
      h.p(`Government-owned homes sell through ${h.ext(HUDSELL, "HUD Home Store")} and usually the MLS. Only ${h.ext(HUDFAQ, "a HUD-registered broker")} can submit an offer. Owner-occupants get an exclusive period first: ${h.ext(ML, "15 days for a home marketed as insured, five days for one marketed as uninsured")}. Investors bid only in the extended period after it. The homes sell as-is, and the seller urges an inspection before the offer. The listing's financing code says whether an FHA loan can be used, with or without a repair escrow.`) +
      h.cta("Want bank-owned listings pulled for your numbers?", "Tell us the area and the budget. We send the bank-owned listings with the rent and the repair estimate for each one.", "Ask about REO listings", "/contact/", bg) },
    { h2: "What about past-due HOA fees on a foreclosed condo?", html:
      h.p("In an ordinary sale the association's lien for past-due assessments is paid from the seller's proceeds at closing. At a foreclosure sale there may be no proceeds. In Devin Day's experience the association then asks the new owner for the balance, or waives it. We get the association's statement before closing, so the balance is in the numbers and not a surprise after the deed.") +
      h.p("The balance can end the deal. Devin Day's example: a flip carrying $7,000 of back assessments, with no margin left after them, is a property we tell you not to bid on.") },
    { h2: "What about the county tax sale?", html:
      h.p(`The tax sale is a different sale, run by the county treasurer, for unpaid property taxes. ${h.ext(DELTAX, "Taxes become delinquent on March 17")}. The list is advertised three consecutive Thursdays before the sale, and the date, time and place are advertised in November. ${h.ext(TAXSALE, "The county's last published sheet")} put the sale in the same building, at 9 in the morning. It listed a $25 registration fee and a $450 title search and deed charge on each property sold.`) +
      h.p(`Payment is cash or certified funds at the close of the sale. Then you wait. ${h.ext(T1251, "The owner, a grantee from the owner, or a mortgage or judgment creditor")} can redeem within 12 months by paying the taxes, costs and interest. Redemption puts the owner back in place. A relative who pays the taxes does not take the house; the owner keeps it. During those 12 months you have no ownership rights, cannot enter the property and cannot contact the owner.`) +
      h.p(`Between 20 and 45 days before the year ends, ${h.ext(T1251, "the county mails a certified notice")} to the owner and to any grantee, mortgage holder or lessee of record. If a required step was missed before the deed issues, the county can void the sale and refund the bid with the interest the county earned on it. That happened to a Chapter3 client. He waited the full year. On the day the deed was due, the owner's sister told the county the family had not received the notice the law requires. The county agreed. The redemption period started over, the taxes were paid, and the client got his bid back with interest.`) +
      h.p(`If no one redeems, the county issues a tax title within about 30 days. The buyer pays the deed preparation, the documentary stamps and the recording fee. ${h.ext(T1251, "The statute calls the tax deed")} evidence of good title, not a warranty. A suit to recover the land can be brought within two years of the sale. Until those two years pass the title is contestable. Selling the house or borrowing against it can wait on a quiet title action, which is attorney time and months.`) +
      h.p(`Devin Day's summary: tax sales have the largest possible gain and are the hardest to complete, because the law is written to let the owner keep the house. Either you own a house for the taxes and costs, or you get the bid back with interest. ${h.a("/buyers/property-taxes/", "How the tax bill is calculated")}.`) },
    { h2: "How do you check a sale property before you bid?", html:
      h.p(`Read the judgment and the notice of sale on the county list. The judgment names the liens, taxes and other rights the property is sold subject to. The court file is on the Horry County Public Index. ${h.ext(ROD, "The Register of Deeds")} holds the deeds, mortgages and plats, so a title search there finds the senior liens. The treasurer's office has the tax balance.`) +
      h.p(`Visit the property and knock. You cannot go in without the occupant's consent. Price the repairs from the outside and from the last listing photos, and keep a reserve for what you cannot see. Then run the rent against the bid, the repairs, the back taxes, the association balance and the recording fee. ${h.a("/invest/where-to-buy/", "Which areas fit which strategy")}.`) },
  ],
  faqTitle: "Foreclosure FAQ",
  faq: [
    { q: "When is the Horry County foreclosure sale?", a: "At 11 in the morning on the first Monday of each month, or the first Tuesday when the Monday is a holiday. It is held on the third floor of the Horry County Government and Justice Building, 1301 2nd Avenue, Conway. The list is on the county website." },
    { q: "How much money do I need at the foreclosure sale?", a: "Certified funds. A first-time winner brings a $2,500 certified check to the close of bidding. Every winner pays 5 percent of the bid by noon the next day and the balance within 30 days. A winner who does not pay forfeits the deposit and the right to bid at future sales." },
    { q: "Can someone outbid me after the sale?", a: "Yes, when the lender asked for a deficiency judgment. Bidding stays open for 30 days and reopens at 11 in the morning on the 30th day. Anyone can bid more, and the lender cannot bid again. When the lender waived the deficiency, the sale closes on sale day." },
    { q: "Does the master's deed clear all the liens?", a: "No. It carries no warranty. Liens held by parties to the case end at the sale. Taxes and any lien held by someone not in the case survive, and unpaid taxes fall on the bidder." },
    { q: "Can I get a mortgage for a foreclosure auction purchase?", a: "The county terms give you 30 days and no contingency. Ask the lender before the sale whether it can close inside that window on a deed with no warranty. Bank-owned listings take ordinary financing, and a loan on one is about 45 days in Devin Day's experience." },
    { q: "Can an investor buy a HUD home?", a: "Only in the extended period, after the owner-occupant exclusive period of 15 days for an insured home or five days for an uninsured one. The offer goes through a HUD-registered broker, and the home sells as-is." },
    { q: "Can a family member pay the taxes and take the house after a tax sale?", a: "No. The owner, a grantee from the owner, or a mortgage or judgment creditor can redeem within 12 months, and redemption puts the owner back in place. A relative who pays does not take title." },
    { q: "Is a tax deed good title?", a: "The statute makes it evidence of good title, not a warranty. A suit to recover the land can be brought within two years of the sale. Until then the title is contestable, and a sale or a loan can wait on a quiet title action." },
    { q: "Who holds the earnest money on a bank-owned purchase?", a: "The closing attorney, as in any sale here. The rest of the terms are negotiated in the contract." },
  ],
  sources: [
    { name: "Horry County, master-in-equity", href: MIE },
    { name: "Horry County, bidder sheet", href: BIDDER },
    { name: "SC Code, Title 15, Chapter 39", href: T15 },
    { name: "SC Rules of Civil Procedure, Rule 71", href: RULE71 },
    { name: "SC Code 12-24-20", href: DRF },
    { name: "Ex parte Johnson, 2006", href: JOHNSON },
    { name: "Horry County Treasurer, delinquent tax", href: DELTAX },
    { name: "SC Code, Title 12, Chapter 51", href: T1251 },
    { name: "HUD Home Store FAQ", href: HUDFAQ },
    { name: "HUD Mortgagee Letter 2025-13", href: ML },
    { name: "12 U.S.C. 5220 note", href: PTFA },
  ],
  sourcesNote: "Educational only, not legal advice. Read the county's current sale sheet before you register.",
  bottomCta: { h2: "Run the bid, the repairs and the back taxes before sale day.", p: "Send the address from the sale list. We pull the judgment and the notice of sale and run the rent against the bid.", label: "Send the address", href: RTN },
  keywords: "Horry County foreclosure sale, master in equity sale Horry County, buying a foreclosure in Myrtle Beach, Horry County tax sale redemption, tax deed South Carolina quiet title, REO homes Myrtle Beach",
  about: "Buying a foreclosure at the Horry County master-in-equity sale, at the tax sale, or as a bank-owned listing",
};
