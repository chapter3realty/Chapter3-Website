/* /invest/student-rentals/ - a rental for Coastal Carolina University
 * students in Conway. Facts: research/invest-next/student-rentals-facts.md;
 * every cited source re-opened by the writer 2026-09-06, the two zoning
 * ordinances read from the downloaded PDFs, the housing policy STUD-336 read
 * from the university's own PDF 2026-09-07. The five subdivision names are
 * ordinance text, not conclusions about any community. Brokerage facts from
 * research/invest-next/owner-answers-batch3.md (answers 7 to 13, rounds 2 and
 * 4), told as "in Chapter3's files". The overlay example is illustrative and
 * says so. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const ENROLL = "https://www.coastal.edu/news/fall2025/ccubreakstotalenrollmentrecordforthirdconsecutiveyear/";
const LIVEON = "https://coastal.edu/housing/housingandmealplanrequirement/";
const POLICY = "https://www.coastal.edu/uploads/policies/pdf/stud-336-february2021.pdf";
const CDS = "https://www.coastal.edu/media/2024siteassets/contentassets/documents/iraa/datareportsampdashboards/externalandpublicresources/cdsf25.pdf";
const COA = "https://www.coastal.edu/financialaid/generalinformation/2026-2027costofattendance/";
const RESFAQ = "https://www.coastal.edu/admissions/resfaqs/";
const VETCODE = "https://www.scstatehouse.gov/code/t59c111.php";
const SCDVA = "https://scdva.sc.gov/education";
const EXAMS = "https://www.coastal.edu/registrar/examschedule/";
const MOVEIN = "https://www.coastal.edu/housing/move-in/";
const DOSFAQ = "https://www.coastal.edu/deanofstudents/communityoutreachandeducation/faqs/";
const SHUTTLE = "https://www.coastal.edu/parking-and-transportation-services/shuttle/";
const UDO = "https://www.conwaysc.gov/Current%20UDO%20(7.20.26).pdf";
const HORRYZ = "https://www.horrycountysc.gov/media/i0pfcm2o/appendix-b-zoning-ordinance-upated-912026.pdf";
const HUD = "https://www.hud.gov/helping-americans/fair-housing-act-overview";
const FR98 = "https://www.govinfo.gov/content/pkg/FR-1998-12-18/html/98-33568.htm";

module.exports = {
  url: "/invest/student-rentals/",
  title: "Student Rentals Near Coastal Carolina University | Chapter3",
  description: "Buying a rental for Coastal Carolina students in Conway: the live-on rule, the August lease cycle, the three-tenant cap, co-signers, and the house a parent buys.",
  ogTitle: "Student rentals near Coastal Carolina University in Conway",
  crumb: "Student rentals",
  eyebrow: "Conway, by the semester",
  h1: "How does a student rental near Coastal Carolina University work?",
  h1em: "The rules, the calendar, the caps.",
  sub: "Coastal Carolina has 12,006 students. First- and second-year students must live on campus. Juniors and seniors rent off campus, and a Conway house can hold three unrelated tenants.",
  heroCta: { label: "Send the address", href: RTN },
  author: "devin",
  shortAnswer: "A student rental is a house or townhome rented to Coastal Carolina University students by the academic year. The university requires first- and second-year students to live on campus, so the tenants are juniors, seniors and graduate students. Leases follow the calendar: classes begin in mid-August and end in early May. Conway's zoning code allows one family in a house, and it counts up to three unrelated people as a family. That means an ordinary house inside the city holds three unrelated students, whatever the bedroom count. The five neighborhoods next to campus allow one tenant per bedroom, up to four. About three in four student leases carry a parent co-signer. Some parents buy a house near campus and move the family in. We check the cap and the parking before you offer.",
  sections: [
    { h2: "What is a student rental?", html:
      h.p(`A student rental is a house, townhome or condo leased to college students, by the bedroom or by the academic year. In Conway the students are Coastal Carolina University's. ${h.ext(ENROLL, "The university had 12,006 students in fall 2025")}, a record for the third year running.`) +
      h.p(`The university lists off-campus housing through its own service and ${h.ext(DOSFAQ, "tells students to attend its off-campus housing fairs")} before they sign a lease. It also tells them that switching apartments or canceling a lease is up to the landlord. Your lease terms are the rules they follow.`) +
      h.p("Two groups rent near campus: students who want cheap housing, and families who move to Conway to be near a student and pay more for a nice house.") },
    { h2: "Who has to live on campus, and who rents?", html:
      h.p(`${h.ext(LIVEON, "The university requires")} full-time first- and second-year students who finished high school within the past two years to live in university housing. The off-campus tenants are juniors, seniors and graduate students, plus the few younger students with an exemption.`) +
      h.p("Because of that rule the tenants are juniors and seniors. A junior signs for two years at most, so expect turnover every year or two. A house that rents by the bedroom re-rents one room at a time. A house that rents to one group re-rents all at once, in August.") },
    { h2: "When do leases start and end?", html:
      h.p(`The lease follows the academic calendar. ${h.ext(EXAMS, "Fall 2026 begins August 19 and ends December 11")}. Spring 2027 begins January 11 and ends May 4. Summer terms run May 10 to August 6. ${h.ext(MOVEIN, "Fall move-in")} runs August 12 to 16, by appointment, and off-campus leases follow the same week.`) +
      h.p(`Two lease terms work. A twelve-month lease from August 1 covers the summer. A nine-month lease matches the academic year and leaves the summer to fill with ${h.a("/invest/mid-term-rentals/", "a furnished summer stay")} or ${h.a("/invest/j1-rentals/", "seasonal workers")}. A lease shorter than twelve months, matched to the class calendar, rents for more. That premium is what makes a house near campus earn more than a plain annual lease.`) +
      h.p("Start marketing the house one month before the lease ends. In Chapter3's files, August is the month with no vacancy near campus, because new students arrive then and need a house. A whole-house annual lease renews in the fall, before the students leave for winter break. A by-the-room house renews one room at a time. An August turnover costs days vacant, cleaning, paint, carpet, and a summer inspection if you order one. We put the turnover cost in the projection before you offer.") },
    { h2: "How many students can live in one house?", html: (bg) =>
      h.p(`The number of tenants a house can hold is a zoning rule, and it depends on where the house is. Inside the City of Conway, ${h.ext(UDO, "the zoning code")} allows one family in a house. It defines a family as related people, or a group of not more than three unrelated people living as one household. Three unrelated students is therefore the cap in an ordinary residential zone, however many bedrooms the house has.`) +
      h.p("Next to campus the rule changes. The city's Coastal Carolina University Neighborhood Overlay covers five subdivisions of record: Quail Creek, Quail Creek Village, College Park, College Place and Barberry Drive. In it, unrelated occupants cannot exceed the number of bedrooms on the county record, and never more than four. Parking on the street or on the yard is banned between 11 at night and 8 in the morning. The owner, the agent and the tenants are each liable, and each day is a separate offense.") +
      h.p("An example, made up to show the rule. A four-bedroom house in one of the five overlay subdivisions rents to four students, each with a car. Four unrelated occupants is the cap, and the county record must show four bedrooms. A fifth tenant is a violation, and each day is a separate offense for the owner, the agent and the tenants. The same house one street outside the overlay, inside the city, rents to three unrelated people, whatever the bedroom count.") +
      h.p("Because of the parking rule, limit the tenants to the number of cars the driveway and the garage hold. Put that number in the lease.") +
      h.p(`Outside the city limits the county rule applies. ${h.ext(HORRYZ, "Horry County's zoning ordinance")} defines a family as up to five unrelated persons. The county code carries the same four-bedroom overlay for the same five subdivisions on its side of the city line. Which rule applies depends on the city limit and the overlay map, so check the parcel, not the street name.`) +
      h.p(`Federal law applies as well. ${h.ext(HUD, "The Fair Housing Act")} protects race, color, national origin, religion, sex, familial status and disability. Student status is not on that list, but a rule aimed at students that keeps out families with children breaks the law. ${h.ext(FR98, "Two people per bedroom")} is the federal benchmark for a reasonable occupancy policy for families.`) +
      h.cta("Want to rent to college students?", "Tell us your budget. We find the houses near campus that fit the cap and the parking, read the county record and the covenants, and help you buy the right one.", "Start the search", "/contact/", bg) },
    { h2: "How do you screen a student tenant?", html:
      h.p(`We recommend tenants who earn three to five times the rent. Most students cannot, so about three in four student leases in Chapter3's files carry a parent co-signer. The co-signer signs the lease and is liable for the whole rent, like the tenant. ${h.a("/invest/landlord-rules/", "The screening notices the law requires")}.`) +
      h.p("These are college students, and the house will be used the way you used one. If you can accept the risk of parties, a house near campus is a good investment. Our tools for that risk are the short-lease premium, the parent co-signer and a larger deposit. The other two are an owner who lives nearby, or a multi-unit with a manager living in one unit. State law has no maximum deposit.") },
    { h2: "Do parents buy a house near campus?", html:
      h.p(`Yes. Families move here when their student starts at Coastal Carolina, and they buy a house so the student can live at home. ${h.ext(CDS, "Two thirds of the first-year class comes from outside South Carolina")}, 1,952 of the 2,931 students who enrolled in fall 2025. No public count says how many of those families buy a house here.`) +
      h.p(`The house is the family's legal residence. It is taxed at the 4 percent rate and financed as a primary residence. ${h.a("/buyers/property-taxes/", "How Horry County property tax is calculated")}.`) +
      h.p(`Moving here also changes what the student pays for school. ${h.ext(COA, "In-state tuition and fees are $11,640 for the 2026-27 year")}. Out-of-state tuition is $31,302. ${h.ext(RESFAQ, "The university requires twelve months")} in off-campus South Carolina housing before the resident rate applies. It turns down an application that looks like a move made to get that rate. Ask the university's residency office before you count on it.`) +
      h.p(`A veteran's child can pay no tuition at all. ${h.ext(VETCODE, "State law admits the child of a wartime veteran free of tuition")} at any state-supported college here. The veteran must have been killed in action, died in service, or died of a service-related illness. A living veteran qualifies when permanently and totally disabled, held as a prisoner of war, missing in action, or awarded the Purple Heart or the Medal of Honor. ${h.ext(SCDVA, "Both the veteran and the child must have lived in South Carolina")} for the twelve months before the application, and the child must be 26 or younger. It covers tuition, not fees, books or housing. Apply to the state veterans' affairs department, not to the school.`) +
      h.p("The other pattern is simpler. The student rents, and about three in four times a parent co-signs the lease.") +
      h.p(`A first- or second-year student can live in the family house. ${h.ext(POLICY, "The university's housing policy")} exempts a student whose permanent address on file is within 50 miles of campus and who lives there with a parent or legal guardian. The exemption is automatic. The student does not apply for it.`) },
    { h2: "Which houses and neighborhoods fit?", html: (bg) =>
      h.p(`Three or four bedrooms with off-street parking for every car, because the overlay bans street and yard parking overnight. ${h.ext(SHUTTLE, "The university shuttle")} serves the campus lots, its own University Place communities and a Walmart stop. It does not serve private neighborhoods. The house needs to be a short drive or a bike ride from campus.`) +
      h.p(`The five overlay subdivisions are the closest and carry the four-person cap with the parking rule. The rest of the city carries the three-person cap. Unincorporated Horry County toward Carolina Forest carries five, at a longer drive. ${h.a("/submarkets/conway/", "Conway, the guide")}. ${h.a("/submarkets/carolina-forest/", "Carolina Forest, the guide")}.`) +
      h.p("Many communities here ban renting outright. We filter those out before you see a house. We then read the covenants and the association's rules for anything that blocks the strategy. That means a leasing cap, a minimum lease term, an occupancy limit or a parking rule. That review is the biggest value Chapter3 adds for an investor here.") +
      h.cta("Looking at a house near campus?", "Tell us the address. We tell you which cap applies, what the county record says the bedroom count is, and what the roommates' rent would need to be.", "Ask about Conway", "/contact/", bg) },
    { h2: "How do you manage it from another state?", html:
      h.p(`Most of these owners live far away. Use a written lease that names every tenant and makes each one liable for the whole rent. Add a parent guarantor for each tenant. Hold the deposit under the deposit rules, and give the tenant the owner's name and address in writing. ${h.a("/invest/landlord-rules/", "The landlord rules")}.`) +
      h.p(`Plan the August turnover in June: inspection, paint, cleaning and a lease signed before the old one ends. ${h.a("/invest/property-management/", "A local manager")} does that for a share of the rent, or we give you the numbers to decide whether to self-manage.`) },
  ],
  faqTitle: "Student rental FAQ",
  faq: [
    { q: "Can freshmen live in my rental house?", a: "Usually not. The university requires first- and second-year students who finished high school within two years to live on campus, with limited exemptions." },
    { q: "Can a freshman live at the parents' house near campus?", a: "Yes. The university's housing policy exempts a student whose permanent address on file is within 50 miles of campus and who lives there with a parent or legal guardian. The exemption is automatic." },
    { q: "Can a veteran's child go to Coastal Carolina free?", a: "State law admits the child of a wartime veteran free of tuition at a state-supported college. The veteran must have been killed in action, died in service, or died of a service-related illness. A living veteran qualifies when permanently and totally disabled, held as a prisoner of war, missing in action, or awarded the Purple Heart or the Medal of Honor. Both the veteran and the child must have lived in South Carolina for the twelve months before the application. The child must be 26 or younger. It covers tuition only." },
    { q: "How many students can share a house in Conway?", a: "Inside the city, a household is up to three unrelated people. In the five subdivisions next to campus, the cap is the bedroom count up to four, and overnight parking on the street or the yard is banned. In unincorporated Horry County it is five." },
    { q: "Do student tenants need a co-signer?", a: "Usually. We recommend tenants who earn three to five times the rent, and most students cannot. About three in four student leases in Chapter3's files carry a parent co-signer." },
    { q: "When should the lease start?", a: "Before classes begin. Fall 2026 classes begin August 19 and move-in runs August 12 to 16. A twelve-month lease from August 1 covers the summer; a nine-month lease leaves it to fill. Start marketing one month before the lease ends." },
    { q: "Is student status protected under fair housing law?", a: "Not under federal law, which protects race, color, national origin, religion, sex, familial status and disability. A rule aimed at students that keeps out families with children breaks the law." },
  ],
  sources: [
    { name: "Coastal Carolina, fall 2025 enrollment", href: ENROLL },
    { name: "Coastal Carolina, housing policy STUD-336", href: POLICY },
    { name: "Coastal Carolina, term dates", href: EXAMS },
    { name: "Coastal Carolina, Common Data Set", href: CDS },
    { name: "Coastal Carolina, cost of attendance", href: COA },
    { name: "Coastal Carolina, residency", href: RESFAQ },
    { name: "SC Code 59-111-20", href: VETCODE },
    { name: "SC veterans affairs, tuition", href: SCDVA },
    { name: "City of Conway ordinance", href: UDO },
    { name: "Horry County zoning", href: HORRYZ },
  ],
  sourcesNote: "Educational only. Confirm the parcel with the planning office.",
  bottomCta: { h2: "Run the cap and the parking before you offer.", p: "Send the address. We check the city limit, the overlay, the bedroom count and the parking, and run the numbers.", label: "Send the address", href: RTN },
  keywords: "student rentals near Coastal Carolina University, Conway SC student housing investment, CCU off campus housing rental property, Conway occupancy limit unrelated persons",
  about: "Student rental property near Coastal Carolina University",
};
