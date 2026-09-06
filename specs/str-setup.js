/* /invest/str-setup/ - what a short-term rental owner sets up after closing,
 * in order. Facts: research/invest-next/str-setup-facts.md; every cited
 * source re-opened by the writer 2026-09-06. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const DOR = "https://dor.sc.gov/tax/accommodations";
const DORLIC = "https://dor.sc.gov/businesses/apply-business-tax-account/licensing-retail-license";
const HORRY = "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/";
const HORRYBL = "https://horrycountysc.gov/departments/treasurer/business-license/application-instructions/";
const HORRYRATES = "https://www.horrycountysc.gov/media/gjnntcw1/2024-rate-schedule.pdf";
const HORRYPT = "https://www.horrycountysc.gov/tax-payer-services/";
const PZ = "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php";
const CITYBL = "https://www.cityofmyrtlebeach.com/departments/business_license_division.php";
const CITYTAX = "https://www.cityofmyrtlebeach.com/news_detail_T6_R1323.php";
const NMBSTR = "https://nmb.us/833/Short-term-Rentals";
const NMBFEE = "https://www.nmb.us/m/faq?cat=22";
const GTFAQ = "https://www.gtcountysc.gov/m/faq?cat=68";
const GTTAX = "https://www.gtcountysc.gov/351/Hospitality-Accommodations-Tax";
const GTRET = "https://www.gtcountysc.gov/436/Business-Personal-Property-Residential-R";
const AB2328 = "https://www.airbnb.com/help/article/2328";

module.exports = {
  url: "/invest/str-setup/",
  title: "Myrtle Beach Short-Term Rental Setup After Closing | Chapter3",
  description: "The steps after closing on a Myrtle Beach short-term rental, in order: zoning, licenses, tax accounts, the county fee, alarms, insurance and the listing.",
  ogTitle: "Setting up a Myrtle Beach short-term rental after closing, in order",
  crumb: "Short-term rental setup",
  eyebrow: "After closing",
  h1: "What do you set up after closing on a Myrtle Beach short-term rental?",
  h1em: "In this order.",
  sub: "Eight steps come after closing on a short-term rental and before the first guest: zoning, the license, taxes, the county fee, alarms, insurance, furnishing and the listing.",
  heroCta: { label: "Ask for the closing-day checklist", href: "/contact/" },
  author: "tim",
  shortAnswer: "After closing, a short-term rental needs the same set of accounts whichever town it is in. Confirm the zoning and the building's rules first, because a business license is refused without them. Then the state tax license if you take bookings yourself, the city or county business license, the county fee account, and the personal property return next spring. Alarms and a landlord policy before the first guest. Then the listing, with the taxes the platform collects and the ones it does not. The whole list fits on one page. Ask us for it at closing.",
  sections: [
    { h2: "What has to be in place before the first guest?", html:
      h.ol([
        "Zoning and the recorded building rules allow nightly rental at that address.",
        "The business license from the city or the county, which checks the zoning first.",
        "The state tax license, only if you take bookings and payments yourself.",
        "The county fee account, and the city account inside city limits.",
        "Working smoke and carbon monoxide alarms.",
        "A landlord policy, with wind and flood where required.",
        "Furnishing, and the utilities in your name.",
        "The listing, with the taxes set correctly.",
      ]) +
      h.p("Each step is explained below, with who issues what. The personal property return comes the following spring.") },
    { h2: "Is the property zoned for nightly rentals?", html:
      h.p(`Inside the City of Myrtle Beach, ${h.ext(PZ, "the planning office")} says a property cannot be rented for less than 90 days unless it is zoned for short-term rentals. Most residential neighborhoods are not, and only 24 houses in traditional residential zones are grandfathered. A business license needs the zoning approval first. A violation is a misdemeanor.`) +
      h.p(`${h.ext(NMBSTR, "North Myrtle Beach")} has no special zoning or permit process beyond the license. Surfside Beach allows stays under 30 days only in two districts. Unincorporated Horry County has no county short-term rental ordinance, so the recorded covenants decide. ${h.a("/invest/str-rules/", "The rules by city, in full")}.`) +
      h.p("The building's recorded documents can bar nightly rental where the zoning allows it. Read the covenants and any rental amendment before closing, not after.") },
    { h2: "Which licenses do you need?", html:
      h.table(["Where the property is", "Business license", "Who issues it"], [
        ["City of Myrtle Beach", `Required for every rental property, short-term or long-term. The fee is set from gross receipts. Renewals are due April 30. ${h.ext(CITYBL, "Business License Division")}.`, "The city"],
        ["North Myrtle Beach", `Required for all short-term rentals. ${h.ext(NMBSTR, "The city's short-term rental page")}.`, "The city"],
        ["Unincorporated Horry County", `Required for every business in the unincorporated area; the year runs May 1 to April 30 and zoning approval comes first. ${h.ext(HORRYBL, "Application instructions")}. Rental real estate is rate class 6: ${h.ext(HORRYRATES, "$55 minimum on the first $50,000 of gross income")}, then $1.37 per $1,000, doubled for a business with no fixed place of business in the county.`, "The county treasurer"],
        ["Georgetown County", `${h.ext(GTFAQ, "No county business license")}. The county collects a 3 percent local accommodations tax instead. Check the Town of Pawleys Island separately.`, "None at county level"],
      ]) +
      h.p(`The state license is separate. ${h.ext(DOR, "The state revenue department")} requires a retail license only if you take bookings and payments yourself. If every booking runs through a manager or a platform that takes the payment, they remit the tax and you need no state license. ${h.ext(DORLIC, "The license costs $50")}, does not expire, and once you hold it you file a return every period, even with no rentals.`) },
    { h2: "Which tax accounts and fees?", html: (bg) =>
      h.p(`The state charges 5 percent sales tax and 2 percent accommodations tax on stays under 90 consecutive days. Returns are due by the 20th of the following month. Whoever takes the payment remits it. ${h.ext(HORRY, "Horry County's hospitality fee")} is 3 percent of rent outside the city limits and 1.5 percent inside, due the 20th. The county says to make sure a property manager who arranges the stay is remitting it.`) +
      h.p(`Inside the City of Myrtle Beach, a short-term rental also ${h.ext(CITYTAX, "collects 0.5 percent local accommodations tax and a 1 percent hospitality fee")} for the city. ${h.ext(NMBFEE, "North Myrtle Beach")} charges 1.5 percent on transient accommodations, due the 20th. ${h.ext(GTTAX, "Georgetown County")} charges 3 percent, remitted by the 20th, with a 5 percent penalty per month late.`) +
      h.p(`${h.ext(AB2328, "Airbnb collects")} the 5 percent and 2 percent state taxes and the local taxes it lists for Horry County, Myrtle Beach, North Myrtle Beach and Surfside Beach. It lists nothing for Georgetown County. You remit whatever the platform does not list, and everything on stays you book yourself. ${h.a("/invest/accommodations-tax/", "Accommodations tax, explained")}.`) +
      h.cta("Want the accounts listed for one address?", "Send the address and the plan. We tell you which town, which license, which fee accounts and who remits what.", "Send the address", RTN, bg) },
    { h2: "What is the personal property return?", html:
      h.p(`A yearly form listing the furnishings in a rental. ${h.ext(HORRYPT, "Horry County's auditor")} requires it from anyone who owned a property on December 31 that was not their legal residence. The county's inventory form lists beds, dressers, sofas, televisions, the refrigerator, the stove, the washer and the dryer. The county then bills a tax on those items in the fall.`) +
      h.p(`${h.ext(GTRET, "Georgetown County")} requires the same return from every owner at the 6 percent rate, with furnishings and appliances included. If you do not file, the auditor assumes a fully furnished rental. File it either way.`) },
    { h2: "What do the alarms and the insurance require?", html:
      h.p(`South Carolina adopts the national residential and fire codes statewide, and ${h.ext("https://www.scstatehouse.gov/code/t06c009.php", "cities and counties enforce only those codes")}. The current editions are the 2021 codes, in force since January 2023. Smoke alarms and carbon monoxide alarms are placed where those codes say; the city or county inspector can tell you the count for your floor plan.`) +
      h.p(`${h.ext("https://www.airbnb.com/help/article/2904", "Airbnb requires hosts to state")} whether smoke and carbon monoxide detectors are present and to keep them working. It ${h.ext("https://www.airbnb.com/help/article/514", "provides a combination alarm")} to eligible hosts at no cost.`) +
      h.p(`A homeowners policy is written for the home you live in. ${h.ext("https://doi.sc.gov/954/Second-Home-Insurance-What-You-Need-to-K", "The state insurance department")} says renting a vacation home to others will likely raise the cost and may need added coverage. ${h.ext("https://www.airbnb.com/help/article/3142", "Airbnb's own cover")} is not a substitute for personal insurance. Get a landlord policy with the furnishings covered, and wind and flood where the zone requires. ${h.a("/buyers/coastal-insurance/", "Coastal insurance, explained")}.`) },
    { h2: "How do you set up the listing?", html: (bg) =>
      h.p(`${h.ext("https://www.airbnb.com/help/article/2895", "Airbnb's ground rules")} require the photos and the description to represent the space as it is, and the home to be clean and free of hazards before check-in. ${h.ext("https://help.vrbo.com/articles/Vrbo-photo-guidelines", "Vrbo requires")} at least six published photos, at 1024 by 683 pixels or larger, and suspends a listing that drops under six for more than 30 days.`) +
      h.p(`Set the house rules, the minimum nights, the cleaning fee and the tax settings before the listing goes live. Then choose a manager, or manage it yourself. ${h.a("/invest/property-management/", "What a manager costs")}. ${h.a("/invest/rental-program-vs-airbnb/", "Rental program or Airbnb")}.`) +
      h.p(`State law does not require you to register tenants with the association. ${h.ext("https://www.scstatehouse.gov/code/t27c030.php", "The state HOA law")} has no such rule. The recorded governing documents set it, so read them for a guest registration or a parking rule.`) +
      h.cta("Want the checklist for your closing?", "Tell us the address. We send the steps for that town, in order, with the phone numbers.", "Ask for the checklist", "/contact/", bg) },
    { h2: "Who turns on the utilities?", html:
      h.p(`Each utility wants identification, the settlement statement, and a deposit before the service goes into your name. ${h.ext("https://www.santeecooper.com/residential/start-move-stop-service/start-service/", "Santee Cooper")} runs a credit check to set the deposit and connects after it is paid. ${h.ext("https://horryelectric.com/services/electric-service/start-residential-service/", "Horry Electric Cooperative")} charges a $5 membership, a $10 application and a $20 connect fee, and asks for the settlement statement. The water systems work the same way. ${h.a("/invest/out-of-state/", "Which utility serves which area")}.`) },
    { h2: "What happens at tax time?", html:
      h.p(`Rental income and expenses go on ${h.ext("https://www.irs.gov/taxtopics/tc414", "Schedule E")}, and depreciation starts when the unit is placed in service. A platform sends a Form 1099-K when your payouts pass ${h.ext("https://www.irs.gov/newsroom/form-1099-k-faqs-general-information", "$20,000 and 200 transactions")} in a year, and it can send one below that. Keep the owner statements either way. ${h.a("/invest/str-tax-treatment/", "How short-term rental income is taxed")}.`) },
  ],
  faqTitle: "Short-term rental setup FAQ",
  faq: [
    { q: "Do I need a state retail license for my short-term rental?", a: "Only if you take bookings and payments yourself. If every booking runs through a manager or a platform that takes the payment, they remit the tax and you need no state license." },
    { q: "Does Airbnb pay all my taxes?", a: "No. It collects the state taxes and the local taxes it lists for your area. You remit any local fee it does not list, and everything on stays you book yourself." },
    { q: "Do I need a business license for a rental in the City of Myrtle Beach?", a: "Yes. The city requires one for every rental property, short-term or long-term, and a zoning check comes first." },
    { q: "What is the personal property return?", a: "A yearly form to the county auditor listing the furnishings in a rental that is not your legal residence. The county then bills a tax on them in the fall." },
    { q: "Can I rent nightly in a residential neighborhood in Myrtle Beach?", a: "Almost never. Most residential zones in the city do not allow stays under 90 days. A 90-day lease is allowed there." },
  ],
  sources: [
    { name: "South Carolina Department of Revenue, accommodations tax", href: DOR },
    { name: "Horry County, business license instructions", href: HORRYBL },
    { name: "Horry County, hospitality fee", href: HORRY },
    { name: "City of Myrtle Beach, planning and zoning", href: PZ },
    { name: "Airbnb, taxes collected in South Carolina", href: AB2328 },
  ],
  sourcesNote: "Educational only, not legal or tax advice. Rates, fees and license years change; the linked pages carry the current figures.",
  bottomCta: { h2: "The setup list fits on one page.", p: "Tell us the address. We send the steps for that town, in order, with the numbers to call.", label: "Ask for the checklist", href: "/contact/" },
  keywords: "short-term rental setup Myrtle Beach, Airbnb business license Myrtle Beach, Horry County hospitality fee short-term rental, personal property return rental furnishings Horry County",
  about: "Setting up a Myrtle Beach short-term rental after closing",
};
