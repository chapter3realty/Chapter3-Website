/* /invest/mid-term-rentals/ - furnished monthly stays and the 90-day line.
 * Facts: research/invest-next/mid-term-rentals-facts.md; every cited source
 * re-opened by the writer 2026-09-06. The city's conversion-overlay ordinance
 * is a scanned PDF the writer could not machine-read; its text is quoted from
 * the codified section the researcher read on Municode (see the research
 * file). Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const DOR = "https://dor.sc.gov/tax/accommodations";
const HORRY = "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/";
const CITYFAQ = "https://www.cityofmyrtlebeach.com/careers/business/business_faq.php";
const PZ = "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php";
const STRC = "https://www.cityofmyrtlebeach.com/2024-069%20Conversion%20Overlay_Short%20Term%20Rentals%20(1st).pdf";
const NMBSTR = "https://nmb.us/833/Short-term-Rentals";
const SURF = "https://surfsidebeach.org/AgendaCenter/ViewFile/Item/1246?fileID=6196";
const GSA = "https://www.gsa.gov/travel/plan-book/per-diem-rates/per-diem-rates-results?action=perdiems_report&fiscal_year=2026&state=SC&city=Myrtle%20Beach";

module.exports = {
  url: "/invest/mid-term-rentals/",
  title: "Mid-Term Rentals in Myrtle Beach: The 90-Day Floor | Chapter3",
  description: "Furnished stays of one to six months on the Grand Strand: travel nurses and people between homes. Where nightly rentals are banned, a 90-day stay is legal.",
  ogTitle: "Mid-term rentals in Myrtle Beach: travel nurses and the 90-day floor",
  crumb: "Mid-term rentals",
  eyebrow: "Furnished, by the month",
  h1: "Can you rent a Myrtle Beach home by the month where Airbnb is banned?",
  h1em: "Yes, at 90 days.",
  sub: "South Carolina does not treat a stay of 90 continuous days as a short-term rental. Residential neighborhoods in the city that ban nightly rentals allow a 90-day stay.",
  heroCta: { label: "Send the address", href: RTN },
  author: "tim",
  shortAnswer: "A mid-term rental is a furnished home rented by the month, for stays of about one to six months. The tenants are travel nurses on 13-week contracts, people between homes, workers on a project, and families waiting on a closing. On the Grand Strand the number that matters is 90. A stay of 90 continuous days pays no accommodations tax and no county hospitality fee. The City of Myrtle Beach does not count it as a short-term rental. That makes a 90-day furnished lease legal in residential zones where nightly rentals are banned. Below: who the tenants are, the rules, the platforms, and how to price it.",
  sections: [
    { h2: "What is a mid-term rental?", html:
      h.p("A mid-term rental is a furnished home rented by the month, for stays of about one to six months. The rent usually includes utilities and internet. The tenant brings clothes and a laptop, not a sofa.") +
      h.p("It sits between the two rentals most owners know. A short-term rental is rented by the night and pays the accommodations tax. A long-term rental is unfurnished on a twelve-month lease. The mid-term rental is furnished and monthly, and it is outside the nightly-rental rules once the stay is long enough.") +
      h.p("The tenants are travel nurses on contracts, people between homes, workers on a project, families waiting on a closing, and insurance placements after a fire or a flood.") },
    { h2: "Why is 90 days the number on the Grand Strand?", html:
      h.p(`Three rules use the same line. ${h.ext(DOR, "The state accommodations tax")} applies to stays under 90 consecutive days and stops at 90 continuous days to the same person. ${h.ext(HORRY, "Horry County's hospitality fee")} stops at 90 consecutive days at the same location to the same guest. ${h.ext(CITYFAQ, "The City of Myrtle Beach")} does not count a stay of 90 or more consecutive days as a short-term accommodation.`) +
      h.p(`Zoning follows the same line inside the city. ${h.ext(PZ, "The city's planning office")} says a property cannot be rented for less than 90 days unless it is zoned for short-term rentals. Most residential neighborhoods are not. A stay of 90 days or more is not a short-term rental, so a 90-day furnished lease is allowed where a nightly one is not.`) +
      h.p("National advice says 30 days. Inside the Myrtle Beach city limits the floor is 90 nights, because a 30-day stay is still a short-term rental there. Set the minimum at 90.") +
      h.p(`One exception applies to oceanfront buildings. In December 2024 the city adopted ${h.ext(STRC, "an overlay zone")} between Kings Highway and the ocean. In it, a building of more than two units that was built or used for nightly rental may not be leased for 90 days or more. The 90-day plan works in the neighborhoods, not in the oceanfront towers.`) +
      h.p(`${h.ext(NMBSTR, "North Myrtle Beach")} has no zoning limit on rental length and licenses every rental. ${h.ext(SURF, "Surfside Beach")} allows stays under 30 days only in its R3 and C3 districts and defines a long-term rental as 365 days or more. It does not define the months between, so ask the town before you count on a 90-day plan there.`) },
    { h2: "Who rents by the month here?", html: (bg) =>
      h.table(["Tenant", "How long", "What sets the stay"], [
        ["Travel nurses", "About 13 weeks, the standard contract, often extended", "The hospital's contract dates. The Grand Strand's hospitals are Grand Strand Medical Center in Myrtle Beach, Tidelands Waccamaw Community Hospital in Murrells Inlet, Conway Medical Center in Conway, and McLeod Health Seacoast in Little River."],
        ["Insurance and relocation placements", "Months, set by the claim or the move", "The insurer or the employer pays. The platform that began with travel nurses now lists relocating families and insurance placements too."],
        ["Seasonal workers", "Up to four months in summer", `Student visa holders in the summer work program. Sponsors must help arrange housing. ${h.a("/invest/j1-rentals/", "J-1 rentals, explained")}.`],
        ["Winter visitors", "Two or three months", "The cold months up north."],
        ["Buyers between homes", "Until a closing or a build finishes", "Buyers waiting on a closing or a new build."],
      ]) +
      h.p(`Thirteen weeks is 91 days. ${h.ext("https://healthtrustjobs.com/careers/travel-nursing-jobs/", "One hospital staffing company")} says assignments usually last 13 weeks, and ${h.ext("https://www.ayahealthcare.com/travel-nursing/travel-nursing-questions/", "a national agency")} says nurses take agency housing or a housing stipend and find their own place. A 91-day contract clears the 90-day line by one day.`) +
      h.cta("Want it run both ways?", "Send the address. We run it furnished by the month and unfurnished on a year lease, and we check the zoning and the HOA minimum lease term.", "Send the address", RTN, bg) },
    { h2: "How do you price a furnished monthly rental?", html:
      h.p(`There is no public rent index for furnished monthly stays here. One public reference exists. ${h.ext(GSA, "The federal lodging rate for Horry County")} is $110 a night from October through March, $132 in April and May, and $182 from June through August. It is a reimbursement ceiling for government travelers, not a market rent, and a nurse's stipend is set by the agency.`) +
      h.p("Price it three ways and take the middle.") +
      h.ul([
        "The unfurnished rent for the same home, plus the furnishing, utilities and internet you now carry.",
        "The comparable furnished listings on the platforms for the same month.",
        "The stipend a tenant tells you they have.",
      ]) +
      h.p(`Then run it against the alternatives. ${h.a("/invest/long-term-rental/", "The investor analyzer")} takes a rent figure; put the furnished number in and compare it with the unfurnished one. ${h.a("/invest/str-vs-ltr/", "Short-term against long-term")} covers the nightly case.`) },
    { h2: "Where do you list it?", html:
      h.p(`${h.ext("https://www.furnishedfinder.com/list-your-property", "Furnished Finder")} charges a flat $199 a year to list, takes no commission and no booking fee, and handles stays of 30 days or more. It began with travel nurses. ${h.ext("https://www.airbnb.com/help/article/2729", "Airbnb")} counts 28 nights or longer as a monthly stay, lets you set a monthly discount, and collects the rent in monthly installments.`) +
      h.p(`On Airbnb, set the minimum stay to 90 nights inside the Myrtle Beach city limits. Airbnb collects South Carolina taxes only on reservations of 89 nights and shorter, which matches the state line. ${h.ext("https://www.airbnb.com/help/article/2328", "Airbnb's South Carolina tax page")} lists what it collects.`) +
      h.p("Ask the hospital's housing office and the agency's housing desk once the home is ready. Both place nurses directly.") },
    { h2: "Which lease and which insurance do you need?", html:
      h.p(`A 90-day stay is a tenancy, not a hotel stay. ${h.ext("https://www.scstatehouse.gov/code/t27c040.php", "The state landlord and tenant law")} excludes transient occupancy in accommodations that pay the accommodations tax, and a 90-day stay does not pay it. Use a written lease with an end date, take a deposit under the deposit rules, and give the tenant the owner notice. ${h.a("/invest/property-management/", "The deposit and notice rules")}.`) +
      h.p("Whether a stay of 30 to 89 days counts as transient occupancy is not written in the statute. Ask a South Carolina attorney before you lease for less than 90 days.") +
      h.p(`Insurance changes with the use. ${h.ext("https://doi.sc.gov/954/Second-Home-Insurance-What-You-Need-to-K", "The state insurance department")} says renting a vacation home to others will likely raise the cost and may need added coverage. A homeowners policy is written for the home you live in. Ask for a landlord policy that covers the furnishings you own, and place wind and flood where the zone requires. ${h.a("/buyers/coastal-insurance/", "Coastal insurance, explained")}.`) },
    { h2: "Which Grand Strand properties fit?", html: (bg) =>
      h.p("Two- and three-bedroom homes and townhomes within a short drive of a hospital. Carolina Forest and Socastee for Grand Strand Medical Center. Murrells Inlet and Surfside Beach for Tidelands Waccamaw. Conway for Conway Medical Center and the university. Little River for McLeod Health Seacoast.") +
      h.p(`Conway has a second calendar. ${h.ext("https://www.coastal.edu/news/fall2025/ccubreakstotalenrollmentrecordforthirdconsecutiveyear/", "Coastal Carolina University")} enrolled 12,006 students in fall 2025, a record, and its semesters set two move-in waves a year. Ask us what furnished homes near the campus have rented for.`) +
      h.p("Read the covenants before you offer. Many associations set a minimum lease term of 30, 90 or 180 days, and some cap the number of leases a year. A 90-day plan needs a 90-day minimum or shorter.") +
      h.cta("Looking near a hospital or an employer?", "Tell us the hospital or the employer. We list the homes within a short drive that allow a 90-day lease.", "Ask about a neighborhood", "/contact/", bg) },
  ],
  faqTitle: "Mid-term rental FAQ",
  faq: [
    { q: "Is a 30-day rental legal in Myrtle Beach?", a: "Inside the city limits, not in residential zones. The city counts any stay under 90 days as a short-term rental, and zones that begin with R do not allow them. A 90-day stay is not a short-term rental." },
    { q: "Does a 90-day tenant pay accommodations tax?", a: "No. The state tax stops at 90 continuous days to the same person, and the county hospitality fee stops at 90 consecutive days. Stays under 90 days pay both." },
    { q: "How long is a travel nurse contract?", a: "Thirteen weeks is the standard, which is 91 days. Agencies also offer shorter and longer assignments, and many nurses extend." },
    { q: "Can I use Airbnb for monthly stays?", a: "Yes. Airbnb treats 28 nights or longer as a monthly stay, lets you set monthly discounts, and collects payment in monthly installments. Set your minimum nights to 90 inside the Myrtle Beach city limits." },
    { q: "Do I need a landlord policy for a furnished rental?", a: "Yes. A homeowners policy is written for the home you live in. Renting it out changes the coverage, and the state insurance department says to expect a higher cost and added coverage." },
  ],
  sources: [
    { name: "South Carolina Department of Revenue, accommodations tax", href: DOR },
    { name: "Horry County, hospitality fee", href: HORRY },
    { name: "City of Myrtle Beach, planning and zoning", href: PZ },
    { name: "Town of Surfside Beach, zoning uses", href: SURF },
    { name: "GSA, per diem rates for Horry County", href: GSA },
  ],
  sourcesNote: "Educational only, not legal or tax advice. Ask the planning office for the rule at your address.",
  bottomCta: { h2: "The 90-day lease is the legal option where Airbnb is banned.", p: "Send the address. We run it furnished by the month and unfurnished on a year lease, and check the zoning and the HOA minimum.", label: "Send the address", href: RTN },
  keywords: "mid-term rentals Myrtle Beach, travel nurse housing Myrtle Beach, furnished monthly rental Myrtle Beach, 90 day rental rule Myrtle Beach",
  about: "Mid-term furnished rentals on the Grand Strand",
};
