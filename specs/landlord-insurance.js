/* /invest/landlord-insurance/ - insurance on a Myrtle Beach rental, and the tax
 * that costs more. Trade body figure from iii.org, flood surcharge from FEMA's
 * HFIAA fact sheet (state-hosted copy), tax multiple from the site's own
 * calculator page and the county assessor, all read 2026-09-07. Brokerage facts
 * from research/invest-next/owner-answers-batch4.md, fact-checked there. The
 * coastal insurance page keeps the average premiums and the three-policy
 * explainer; this page links there instead of repeating them. No insurance agent
 * is named (no AfBA exists). Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const RTN = "/invest/run-the-numbers/";
const III = "https://www.iii.org/article/coverage-for-renting-out-your-home";
const FEMAFS = "https://dlnreng.hawaii.gov/nfip/wp-content/uploads/sites/11/2015/07/HFIAA-Surcharge-Fact-Sheet_Final-April-2015.pdf";
const MSC = "https://msc.fema.gov/portal/home";
const DOI = "https://doi.sc.gov/";
const ASSESSOR = "https://www.horrycountysc.gov/departments/assessor/";

module.exports = {
  url: "/invest/landlord-insurance/",
  title: "Landlord Insurance on a Myrtle Beach Rental | Chapter3",
  description: "Insurance on a Myrtle Beach rental: the landlord policy, wind and flood, how much more a rental costs to insure, and why the property tax costs more than all three.",
  ogTitle: "Insurance on a Myrtle Beach rental, priced before you offer",
  crumb: "Landlord insurance",
  eyebrow: "Underwriting the rental",
  h1: "What does insurance cost on a Myrtle Beach rental?",
  h1em: "The landlord policy, wind, flood, and the tax that costs more.",
  sub: "A landlord policy is about a fifth more than a homeowner policy, flood adds a $250 surcharge on a rental, and the property tax is three times higher.",
  heroCta: { label: "Call a specialized agent", href: TEL },
  author: "devin",
  shortAnswer: "A rental needs a landlord policy instead of a homeowner policy. It needs wind coverage on most of the coast, and flood coverage where the lender or the zone requires it. The insurance trade body puts a landlord policy at about 25 percent more than a homeowner policy. In Chapter3's files it has run 15 to 20 percent more. Federal flood insurance adds a $250 yearly surcharge on a rental instead of $25, and its premium rises faster. The larger cost is the property tax. A rental is assessed at 6 percent and pays the school operating tax. Its bill is three to four times the bill for the same house as a legal residence. We put all four numbers in the projection before you offer.",
  sections: [
    { h2: "What insurance does a rental need?", html:
      h.p(`Three policies.`) +
      h.table(["Policy", "What it covers", "Who requires it"], [["Landlord policy", "The building, your liability if someone is hurt, and lost rent during a covered repair", "Your lender, and any claim you make"], ["Wind and hail", "Storm damage. Often a separate policy on the coast", "Your lender"], ["Flood", "Rising water. Always a separate policy", "Your lender in a high-risk zone. Your choice elsewhere"]]) +
      h.p(`${h.ext(III, "A landlord policy replaces the homeowner policy")}. A homeowner policy is written for a house you live in. A claim on a rented house can be denied under it.`) +
      h.p(`${h.ext(MSC, "Check the flood zone")} for any address at the federal map center. ${h.a("/buyers/coastal-insurance/", "The three coastal policies, explained")}, with the average premiums here. A short-term rental needs coverage written for short-term use, not a landlord policy. ${h.a("/invest/str-setup/", "What a short-term rental owner arranges after closing")}.`) },
    { h2: "How much more does a rental cost to insure?", html:
      h.table(["Cost", "Home you live in", "Rental"], [["Building policy", "Homeowner policy", "Landlord policy. About 25 percent more by the trade body's figure. 15 to 20 percent more in Chapter3's files"], ["Federal flood surcharge", "$25 a year", "$250 a year"], ["Property tax", "4 percent assessment. No school operating tax", "6 percent assessment. Full school operating tax. Three to four times the bill"]]) +
      h.p(`${h.ext(III, "The insurance trade body puts a landlord policy at about 25 percent more")} than a homeowner policy on the same house. The extra pays for the liability and the lost-rent coverage.`) +
      h.p(`Flood is different. The federal program prices a rental's flood risk the same way it prices a primary home's. ${h.ext(FEMAFS, "It charges a $250 yearly surcharge on a rental instead of $25")}. It also lets the premium rise faster toward its full-risk price. A rental's flood policy can cost a multiple of what the last owner paid while living there. In Chapter3's files that multiple has been about three.`) +
      h.p(`Ask the seller for the current declarations page and any claims on the house before you offer. Tell the insurer how the house will be used, because the vacancy between tenants changes the price.`) },
    { h2: "What makes one quote double another?", html: (bg) =>
      h.p(`Distance to the ocean, roof age, the wind deductible, construction type, and claims on the address. ${h.a("/buyers/coastal-insurance/", "Six ways to lower a coastal premium")}. Quotes on the same house vary widely here. Shop the landlord policy the same way you shopped the first one.`) +
      h.cta("Want the insurance and the tax in the numbers?", "Tell us the address and how you will use it. We get the three quotes and the tax at the 6 percent rate, and put them in the projection before you offer.", "Have us run the numbers", RTN, bg) },
    { h2: "Do taxes or insurance stop more deals?", html:
      h.p(`Taxes, in Chapter3's files. Insurance on a rental is higher than on a primary home by about a fifth. The property tax is higher by a multiple.`) +
      h.p(`${h.ext(ASSESSOR, "The county assesses a legal residence at 4 percent")} of value and every other house at 6 percent. A legal residence also pays no school operating tax. Together, the two rules make a rental's bill about three times the legal-residence bill in the unincorporated county. Inside the city of Myrtle Beach it is about four times. ${h.a("/buyers/property-taxes/", "The calculator, with the county's millage")}.`) +
      h.p(`According to a loan officer at our preferred lender, a DSCR loan prices about the same as a conventional investment loan. That holds with strong credit and a coverage ratio of 1.25 to 1.5. The insurance is about the same on either. The tax is the cost that changes when a house becomes a rental. It is the cost that most often ends a deal in our files.`) },
    { h2: "How do you put insurance into the offer?", html: (bg) =>
      h.p(`Get three quotes before you write the offer, not after the inspection. They are the landlord policy, wind if it is separate, and flood if the zone or the lender requires it. Send the seller's declarations page and the claims history with the quote request.`) +
      h.p(`Lenders require replacement cost coverage on the building, and a flood policy where the map puts the house in a high-risk zone. ${h.ext(III, "Most landlord policies include lost rent")} during a covered repair. ${h.a("/invest/cash-to-close/", "Where the first year of insurance shows up at closing")}.`) +
      h.cta("Buying a rental on the coast?", "Tell us the address and how you will use it. We price the insurance and the tax before you offer, and our analyzer includes both in the cash flow.", "Let us make it simple", "/contact/", bg) },
  ],
  faqTitle: "Landlord insurance FAQ",
  faq: [
    { q: "How much more is landlord insurance than homeowners insurance?", a: "The insurance trade body puts it at about 25 percent more. In Chapter3's files it has been 15 to 20 percent more on the same house." },
    { q: "Is flood insurance more expensive on a rental?", a: "The federal program charges a rental a $250 yearly surcharge instead of $25 and lets its premium rise faster toward the full-risk price. In Chapter3's files a rental's flood policy has cost about three times what the owner paid while living there." },
    { q: "Do I need flood insurance on a rental in Myrtle Beach?", a: "If the house is in a high-risk flood zone and the loan is federally backed, yes. Outside those zones it is your choice. Check the zone at the federal map center before you offer." },
    { q: "Why does a rental pay more property tax than a home?", a: "A rental is assessed at 6 percent instead of 4, and it pays the school operating tax that a legal residence does not. Together that is about three times the bill in the unincorporated county and about four times inside the city of Myrtle Beach." },
  ],
  sources: [
    { name: "Insurance Information Institute, renting out your home", href: III },
    { name: "FEMA, flood surcharge fact sheet", href: FEMAFS },
    { name: "FEMA flood map center", href: MSC },
    { name: "SC Department of Insurance", href: DOI },
    { name: "Horry County Assessor", href: ASSESSOR },
  ],
  sourcesNote: "Educational only, not insurance advice. Premiums are quotes on the house, not averages; get them before you offer.",
  bottomCta: { h2: "Price the insurance and the tax before you offer.", p: "One call. We get the three quotes and the tax at the 6 percent rate, and put them in the projection.", label: "Call a specialized agent", href: TEL },
  keywords: "landlord insurance Myrtle Beach, rental property insurance cost South Carolina coast, flood insurance on a rental, investment property insurance vs homeowners, property tax on a rental Horry County",
  about: "Insurance on a Myrtle Beach rental property",
};
