/* /invest/student-rentals/ - a rental for Coastal Carolina University
 * students in Conway. Facts: research/invest-next/student-rentals-facts.md;
 * every cited source re-opened by the writer 2026-09-06, the two zoning
 * ordinances read from the downloaded PDFs. The five subdivision names are
 * ordinance text, not conclusions about any community. Built by
 * tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const ENROLL = "https://www.coastal.edu/news/fall2025/ccubreakstotalenrollmentrecordforthirdconsecutiveyear/";
const LIVEON = "https://coastal.edu/housing/housingandmealplanrequirement/";
const EXAMS = "https://www.coastal.edu/registrar/examschedule/";
const MOVEIN = "https://www.coastal.edu/housing/move-in/";
const COA = "https://www.coastal.edu/financialaid/generalinformation/2026-2027costofattendance/";
const DOSFAQ = "https://www.coastal.edu/deanofstudents/communityoutreachandeducation/faqs/";
const SHUTTLE = "https://www.coastal.edu/parking-and-transportation-services/shuttle/";
const UDO = "https://www.conwaysc.gov/Current%20UDO%20(7.20.26).pdf";
const HORRYZ = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const HUD = "https://www.hud.gov/helping-americans/fair-housing-act-overview";
const FR98 = "https://www.govinfo.gov/content/pkg/FR-1998-12-18/html/98-33568.htm";

module.exports = {
  url: "/invest/student-rentals/",
  title: "Student Rentals Near Coastal Carolina University | Chapter3",
  description: "Buying a rental for Coastal Carolina students in Conway: the live-on rule, the August lease cycle, the occupancy caps near campus, and what a parent buys.",
  ogTitle: "Student rentals near Coastal Carolina University in Conway",
  crumb: "Student rentals",
  eyebrow: "Conway, by the semester",
  h1: "How does a student rental near Coastal Carolina University work?",
  h1em: "The rules, the calendar, the caps.",
  sub: "Coastal Carolina had 12,006 students in fall 2025. First- and second-year students live on campus. A Conway student rental serves the rest, under the city's cap of three unrelated tenants.",
  heroCta: { label: "Send the address", href: RTN },
  author: "tim",
  shortAnswer: "A student rental is a house or townhome rented to Coastal Carolina University students by the academic year. The university requires its first- and second-year students to live on campus, so the tenants are juniors, seniors and graduate students. Leases follow the calendar: classes begin in mid-August and end in early May. The City of Conway counts a household as no more than three unrelated people. The neighborhoods next to campus cap tenants at the bedroom count, up to four. Parents often buy the house, rent the other rooms, and sell at graduation. The numbers work when the bedroom count, the cap and the rent per room line up. We run them before you offer.",
  sections: [
    { h2: "What is a student rental?", html:
      h.p(`A student rental is a house, townhome or condo leased to college students, usually by the bedroom or by the academic year. In Conway the students are Coastal Carolina University's. ${h.ext(ENROLL, "The university had 12,006 students in fall 2025")}, a record for the third year running.`) +
      h.p(`The university lists off-campus housing through its own service and ${h.ext(DOSFAQ, "tells students to attend its off-campus housing fairs")} before they sign a lease. It also tells them that switching apartments or canceling a lease is up to the landlord. Your lease terms are the rules they live by.`) },
    { h2: "Who has to live on campus, and who rents?", html:
      h.p(`${h.ext(LIVEON, "The university requires")} full-time first- and second-year students who finished high school within the past two years to live in university housing. The off-campus tenants are juniors, seniors and graduate students, plus the few younger students with an exemption.`) +
      h.p("That rule shapes the product. A junior signs for two years at most, so expect turnover every year or two. A house that rents by the bedroom refills one room at a time. A house that rents to one group refills all at once, in August.") },
    { h2: "When do leases start and end?", html:
      h.p(`The calendar sets the lease. ${h.ext(EXAMS, "Fall 2026 begins August 19 and ends December 11")}. Spring 2027 begins January 11 and ends May 4. Summer terms run May 10 to August 6. ${h.ext(MOVEIN, "Fall move-in")} runs August 12 to 16, by appointment, and off-campus leases follow the same week.`) +
      h.p(`Two lease shapes work. A twelve-month lease from August 1 keeps the house paid through the summer. A nine-month lease matches the academic year and leaves the summer to fill, which is where ${h.a("/invest/mid-term-rentals/", "a furnished summer stay")} or ${h.a("/invest/j1-rentals/", "seasonal workers")} come in. Sign next year's lease in the fall, before the students leave for winter break.`) },
    { h2: "How many students can live in one house?", html: (bg) =>
      h.p(`This is the number that decides the numbers. Inside the City of Conway, ${h.ext(UDO, "the zoning code")} defines a family as related people or a group of not more than three unrelated persons living as one household. Three unrelated tenants is the cap in an ordinary residential zone, however many bedrooms the house has.`) +
      h.p("Next to campus the rule changes. The city's Coastal Carolina University Neighborhood Overlay covers five subdivisions of record: Quail Creek, Quail Creek Village, College Park, College Place and Barberry Drive. In it, unrelated occupants cannot exceed the number of bedrooms on the county record, and never more than four. Parking on the street or on the yard is banned between 11 at night and 8 in the morning. The owner, the agent and the tenants are each liable, and each day is a separate offense.") +
      h.p(`Outside the city limits the county sets the rule. ${h.ext(HORRYZ, "Horry County's zoning ordinance")} defines a family as up to five unrelated persons. The county code carries the same four-bedroom overlay for the same five subdivisions on its side of the city line. Which rule applies depends on the city limit and the overlay map, so check the parcel, not the street name.`) +
      h.p(`Federal law sits over all of it. ${h.ext(HUD, "The Fair Housing Act")} protects race, color, national origin, religion, sex, familial status and disability. Student status is not on that list, but a rule aimed at students that keeps out families with children breaks the law. ${h.ext(FR98, "Two people per bedroom")} is the federal benchmark for a reasonable occupancy policy for families.`) +
      h.cta("Want the cap checked for one address?", "Send the address. We check the city limit, the overlay map, the bedroom count on the county record and the parking, and run the rent by the room.", "Send the address", RTN, bg) },
    { h2: "What does a student rental earn?", html:
      h.p(`There is no public rent index for student houses in Conway. The one public figure is the university's own budget. ${h.ext(COA, "Its 2026-27 cost of attendance")} allows $8,086 for off-campus housing for the academic year, a figure it builds from the consumer price index. That is a budgeting allowance per student, not a rent, and it is what a financial aid package assumes a student can spend.`) +
      h.p(`The arithmetic is rent per bedroom times the number of tenants the cap allows, against the cost of the house at the 6 percent tax rate. Three tenants in a four-bedroom house inside the city is a different number from four in the overlay. ${h.a("/invest/long-term-rental/", "The investor analyzer")} takes the total rent; we put the per-room figures in from local leases.`) },
    { h2: "What do parents buy?", html:
      h.p("The common pattern is a parent who buys a three- or four-bedroom house before the student's junior year. The student lives in one room, roommates rent the others, and the house is sold or kept at graduation. The rent from the roommates carries part of the cost, and the parent avoids two years of rent.") +
      h.p(`Three things to settle first. The student cannot live there before junior year unless the university grants an exemption. The house is not the parent's legal residence, so it is taxed at the 6 percent rate. ${h.a("/buyers/property-taxes/", "How Horry County property tax is calculated")}. The lender decides how the loan is classified. Ask before you count on any program. Devin Day, licensed MLO, NMLS 2721275, reviewed this section.`) },
    { h2: "Which houses and neighborhoods fit?", html: (bg) =>
      h.p(`Three or four bedrooms with off-street parking for every car, because the overlay bans street and yard parking overnight. ${h.ext(SHUTTLE, "The university shuttle")} serves the campus lots, its own University Place communities and a Walmart stop. It does not serve private neighborhoods. The house needs to be a short drive or a bike ride from campus.`) +
      h.p(`The five overlay subdivisions are the closest and carry the four-person cap with the parking rule. The rest of the city carries the three-person cap. Unincorporated Horry County toward Carolina Forest carries five, at a longer drive. Read the covenants for a leasing limit before you offer. ${h.a("/submarkets/conway/", "Conway, the guide")}. ${h.a("/submarkets/carolina-forest/", "Carolina Forest, the guide")}.`) +
      h.cta("Looking at a house near campus?", "Tell us the address. We tell you which cap applies, what the county record says the bedroom count is, and what the roommates' rent would need to be.", "Ask about Conway", "/contact/", bg) },
    { h2: "How do you manage it from another state?", html:
      h.p(`Most of these owners are far away. Use a written lease that names every tenant and makes each one liable for the whole rent. ${h.a("/invest/property-management/", "The state's landlord and tenant law")} does not say that for you. Add a parent guarantor for each tenant. Hold the deposit under the deposit rules and give the owner notice.`) +
      h.p("Plan the August turnover in June: inspection, paint, cleaning and a lease signed before the old one ends. A local manager does that for a share of the rent, or we can connect you with the numbers to decide whether to self-manage.") },
  ],
  faqTitle: "Student rental FAQ",
  faq: [
    { q: "Can freshmen live in my rental house?", a: "Usually not. The university requires first- and second-year students who finished high school within two years to live on campus, with limited exemptions." },
    { q: "How many students can share a house in Conway?", a: "Inside the city, a household is up to three unrelated people. In the five subdivisions next to campus, the cap is the bedroom count up to four, and overnight parking on the street or the yard is banned. In unincorporated Horry County it is five." },
    { q: "When should the lease start?", a: "Before classes begin. Fall 2026 classes begin August 19 and move-in runs August 12 to 16. A twelve-month lease from August 1 covers the summer; a nine-month lease leaves it to fill." },
    { q: "Is student status protected under fair housing law?", a: "Not under federal law, which protects race, color, national origin, religion, sex, familial status and disability. A rule aimed at students that keeps out families with children breaks the law." },
    { q: "What does a student pay for off-campus housing?", a: "The university budgets $8,086 for off-campus housing for the 2026-27 academic year, a figure it builds from the consumer price index. It is a budgeting allowance, not a rent. Rent per bedroom comes from local leases." },
  ],
  sources: [
    { name: "Coastal Carolina University, fall 2025 enrollment", href: ENROLL },
    { name: "Coastal Carolina University, housing requirement", href: LIVEON },
    { name: "Coastal Carolina University, term dates", href: EXAMS },
    { name: "City of Conway, Unified Development Ordinance", href: UDO },
    { name: "Horry County, zoning ordinance", href: HORRYZ },
  ],
  sourcesNote: "Educational only, not legal advice. The overlay boundaries and the family definitions are quoted from the ordinances; confirm the parcel with the planning office.",
  bottomCta: { h2: "Run the cap and the rent per room before you offer.", p: "Send the address. We check the city limit, the overlay, the bedroom count and the parking, and run the numbers by the room.", label: "Send the address", href: RTN },
  keywords: "student rentals near Coastal Carolina University, Conway SC student housing investment, CCU off campus housing rental property, Conway occupancy limit unrelated persons",
  about: "Student rental property near Coastal Carolina University",
};
