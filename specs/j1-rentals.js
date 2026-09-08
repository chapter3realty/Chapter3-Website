/* /invest/j1-rentals/ - renting a Myrtle Beach house to J-1 Summer Work Travel
 * students. Rebuilt 2026-09-08 at the same URL, keeping the original
 * datePublished (2026-09-01). Every rule is quoted from 22 CFR 62.32, 62.10 and
 * 62.40 (read at law.cornell.edu), the City of Myrtle Beach code as mirrored,
 * the 2018 IPMC section 404 text, SC Code 27-40 and 42 U.S.C. 3604; every
 * number from the State Department's 2025 data, the airport, the county or a
 * dated news report, all in research/invest-next/j1-facts.md. The old page's
 * "$500 to $700 a person", "624 beds under construction" and "May to
 * September" claims were wrong or stale and are replaced (that file, section
 * "Contradictions"). The owner's 60-person house is told as a cautionary case
 * next to the occupancy math, anonymized. No employer, building or landlord is
 * judged; observable dated statements only. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const CFR32 = "https://www.law.cornell.edu/cfr/text/22/62.32";
const CFR10 = "https://www.law.cornell.edu/cfr/text/22/62.10";
const CFR40 = "https://www.law.cornell.edu/cfr/text/22/62.40";
const FLYER = "https://j1visa.state.gov/wp-content/uploads/2026/04/2025-Summer-Work-Travel-Exchange-CY-Flyer.pdf";
const DATES = "https://j1visa.state.gov/wp-content/uploads/2026/02/2026_SWT-Program-Date-Chart.pdf";
const SWT = "https://j1visa.state.gov/programs/summer-work-travel/";
const WTOP = "https://wtop.com/maryland/2026/04/will-marylands-favorite-beach-town-have-enough-international-student-workers-this-summer/";
const WBTW = "https://www.yahoo.com/news/45-million-international-student-housing-121258159.html";
const WMBF26 = "https://www.wmbfnews.com/2026/02/12/myrtle-beach-businesses-rely-international-students-summer-season-staffing/";
const WMBF24 = "https://www.wmbfnews.com/2024/11/27/they-deserve-better-myrtle-beach-looks-address-j-1-student-housing-struggles-with-new-development/";
const WMBF25 = "https://www.wmbfnews.com/2025/04/17/how-myrtle-beach-is-addressing-overcrowding-concerns-vital-summertime-workforce/";
const WPDE25 = "https://wpde.com/news/local/myrtle-beach-foreigner-j1-visa-hospitality-workers-immigration-h2b-international-residence-hall";
const PC21 = "https://www.postandcourier.com/myrtle-beach/myrtle-beach-man-houses-international-students-in-garage-apartment-without-license/article_22c4a5cc-e4ed-11eb-8e51-2b44a3c03de4.html";
const MHN = "https://www.myhorrynews.com/news/exchange-student-housing-set-to-open-in-2025-in-myrtle-beach/article_af7a70a4-a6c4-11ef-bd5a-b7cd044d23e7.html";
const IRH = "https://irhliving.com/irh-locations/irh-myrtlebeach-sc/";
const CODE300 = "https://myrtlebeach-sc.elaws.us/code/coor_coor_ch6_artiii_sec6-300";
const CODE400 = "https://myrtlebeach-sc.elaws.us/code/coor_coor_ch6_artiv_sec6-400";
const IPMC = "https://www.athensalabama.us/DocumentCenter/View/3051/Occupancy-Limitations-2018-IPMC-Section-404-12262024";
const LICENSE = "https://www.cityofmyrtlebeach.com/careers/business/business_faq.php";
const SC2740 = "https://www.scstatehouse.gov/code/t27c040.php";
const SC2737 = "https://www.scstatehouse.gov/code/t27c037.php";
const HUD = "https://archives.hud.gov/news/2016/pr16-135.cfm";
const USC3604 = "https://www.law.cornell.edu/uscode/text/42/3604";
const CVB = "https://www.myrtlebeachareacvb.com/events/j-1-work-amp-travel-forum";
const SEAAIRE = "https://www.walktothebeach.com/j1s/";
const J1HOUSE = "https://j1house.com/";
const CIEE = "https://www.ciee.org/in-the-usa/work/work-travel-usa/next-steps/living/housing";
const INTEREX = "https://www.interexchange.org/programs/work-travel-usa/international-staff/resources/housing-guide/";
const GREENHEART = "https://greenheartexchange.org/professional-exchange/work-and-travel/";
const ISOP = "https://www.myrtlebeachj1students.com/housing";
const WTG = "https://www.workandtravelgroup.com/us/program/work-and-travel-usa/jobs/job-locations/east-coast-ii/north-and-south-carolina/";
const COAST = "https://coastrta.com/j-1-travel-information/";

module.exports = {
  url: "/invest/j1-rentals/",
  datePublished: "2026-09-01",
  title: "J-1 Student Rentals in Myrtle Beach | Chapter3",
  description: "Renting a Myrtle Beach house to J-1 summer students: who they are, which employers hire and house them, the rent per bed, the lawful bed count and the eviction rule.",
  ogTitle: "Renting a Myrtle Beach house to J-1 students",
  crumb: "J-1 rentals",
  eyebrow: "Seasonal rentals",
  h1: "How do you rent a Myrtle Beach house to J-1 students?",
  h1em: "The program, the employers, the beds, the rules.",
  sub: "J-1 students staff the Myrtle Beach summer and rent by the bed. A house holds as many as its bedroom floor area allows, at $100 to $140 a week each.",
  heroCta: { label: "Call a specialized agent", href: TEL },
  author: "devin",
  shortAnswer: "J-1 students are college students from abroad on a four-month summer work visa. South Carolina had about 3,000 of them in 2025 and Myrtle Beach was the fourth busiest destination in the country. They rent by the bed, three or four to a room, at about $100 to $140 a week each. The city's rule on how many people a house may hold counts bedroom floor area, 70 square feet for one person and 50 square feet each for two or more. A 2,500 square foot four-bedroom house holds about 10 to 13 people, and a garage holds none. Leases are per person and end before the student's program does. The state landlord law applies to them like any tenant. The owner of one house we sold reported 60 people in it at $700 each. That is the case this page tells you not to copy.",
  sections: [
    { h2: "What is a J-1 student, and why do they rent in Myrtle Beach?", html:
      h.p(`A J-1 student is a full-time college student from another country on a Summer Work Travel visa. ${h.ext(CFR32, "The program allows up to four months of seasonal work")} during the student's summer break, and no extension. ${h.ext(SWT, "Most students have a job before they arrive")}, through a sponsor organization that screens them and vets the employer.`) +
      h.p(`They rent here because the jobs are here. Myrtle Beach has about 35,000 residents and ${h.ext(MHN, "about 17 million visitors a year")}. Hotels, restaurants and attractions need summer staff the town cannot supply. ${h.ext(WBTW, "The city has hosted about 8,500 J-1 students since 2018")}.`) +
      h.p(`${h.ext(FLYER, "The State Department counted 104,609 Summer Work Travel students in 2025")}. South Carolina had 3,003 of them, the 14th most of any state. ${h.ext(WTOP, "Myrtle Beach was the fourth busiest destination in the country")}, after Ocean City, Orlando and Wisconsin Dells. No source gives the exact Myrtle Beach count.`) +
      h.p(`The top sending countries in 2025 were Jamaica, Thailand, Mexico, Peru, Romania, Turkey, Ecuador and the Dominican Republic. ${h.ext(DATES, "Each country has its own program window")}. Most run May to September. Peru, Argentina, Brazil, Chile and South Africa run December to April, so some students are here in winter. No source says how many.`) },
    { h2: "Which employers hire the most J-1 students, and do they house them?", html:
      h.p(`The employers with the most seasonal jobs. ${h.ext(WMBF24, "The president of Lazarus Entertainment Group said in November 2024")} that 150 of the 500 summer staff at Myrtle Waves Water Park and Broadway Grand Prix are J-1 students. He said he had been pre-renting houses around the city to get enough beds. He had reserved 150 of the 300 beds in the new residence hall for the next summer.`) +
      h.p(`${h.ext(WMBF26, "The owner of Extreme Pizza and Toasted Yolk Cafe")} told a reporter in February 2026 that without the students the summer would be like 2021. That was the year no one had enough staff. ${h.ext(WTG, "Sponsor job listings for the area")} show a pizza restaurant, a diner chain and an oceanfront resort offering housing at $100 a week. A beachwear chain offers it at $110 a week, taken from the paycheck.`) +
      h.p(`The rule puts the housing duty on the sponsor, not the employer. ${h.ext(CFR32, "If the employer does not provide housing, the sponsor must actively and immediately assist the student")} in finding it. The sponsor must also consider housing that meets local codes when it places the job. No rule requires a sponsor to inspect or approve a private landlord's house, and no rule caps the rent.`) +
      h.p(`One purpose-built building exists. ${h.ext(IRH, "The International Residence Hall on Globe Drive")} has more than 300 beds, four to a room, with weekly rent. ${h.ext(WPDE25, "It opened in May 2025")}, with tax incentives from the city. More buildings are planned; the reported totals differ by source. Its rent is not published.`) +
      h.table(["How students find a house", "What the source says"], [
        ["Employer housing first", "Sponsors tell students they learn at hiring whether the employer offers housing"],
        ["Their own search", "Sponsors list Craigslist, Apartments.com, Roommates.com, Zillow and Facebook groups"],
        ["Houses that advertise to them", "Two North Myrtle Beach operators list rooms by the week on their own sites"],
        ["A landlord who works with employers", "One North Myrtle Beach landlord has placed seasonal workers for employers for ten years"],
        ["The city's orientation site", "Lists one provider, the residence hall, and warns about deposit scams"],
      ]) +
      h.p(`There is no sponsor portal where a landlord signs up. ${h.ext(CVB, "The visitor bureau held a J-1 forum for employers, landlords and sponsors")} in February 2026. Employers pre-rent, and students search. A house that an employer has rented for its staff, year after year, is the steadiest version of this rental.`) },
    { h2: "How much rent does a J-1 house collect in Myrtle Beach?", html: (bg) =>
      h.p(`Rent is per bed, per week, with the kitchen, Wi-Fi and laundry included. ${h.ext(SEAAIRE, "One North Myrtle Beach operator lists $120 a week in spring and $130 in summer")}, three to a room, with a 90-day minimum lease and a $260 deposit. ${h.ext(J1HOUSE, "Another lists $130 and $140 a week")}, four to a room in bunk beds, with a $250 deposit. Employer housing in the sponsor listings is $100 to $110 a week.`) +
      h.p(`That is about $430 to $610 a month per person. Our earlier figure of $500 to $700 a month came from our own observation. The listings are lower, so this page uses the listings.`) +
      h.table(["Lawful beds", "Rent per bed a month", "Four months, mid-May to mid-September"], [
        ["10", "$550", "$22,000"],
        ["10", "$600", "$24,000"],
        ["13", "$600", "$31,200"],
      ]) +
      h.p(`The bed count in the table is the lawful count for a 2,500 square foot four-bedroom house, from the next section. The season is four months because the visa allows four. Deposits of $250 a person are held through the season, and the local listings keep $50 to $100 of each for cleaning and linens at checkout.`) +
      h.p(`${h.ext(GREENHEART, "One sponsor caps a student's rent at a third of gross pay")}. At 32 hours a week, the minimum in several local listings, a third of pay is a few hundred dollars a month. The rent per bed has a ceiling the students' wages put on it.`) +
      h.cta("Want the rent on a house you are looking at?", "Send us the address and the bedroom sizes. We count the lawful beds and run the season against a yearly lease before you offer.", "Have us run the numbers", "/invest/run-the-numbers/", bg) },
    { h2: "How many people can a Myrtle Beach house lawfully hold?", html:
      h.p(`Inside the City of Myrtle Beach the answer comes from bedroom floor area. ${h.ext(CODE300, "The city adopts the International Property Maintenance Code")}. ${h.ext(IPMC, "Its occupancy section")} says a bedroom for one person needs 70 square feet, and a bedroom for two or more needs 50 square feet for each person. Kitchens and nonhabitable spaces cannot be slept in. Every bedroom needs a path to a toilet without passing through another bedroom.`) +
      h.p(`A 2,500 square foot four-bedroom house: one 14 by 16 foot bedroom holds four people. Three 12 by 12 foot bedrooms hold two each. That is ten people. If the three smaller bedrooms are 12 by 14 feet, they hold three each, and the house holds thirteen. A detached garage holds no one unless it was converted under a permit with a certificate of occupancy.`) +
      h.p(`In Chapter3's files, the owner of a house we sold reported 40 people in 2,500 square feet at $700 a month each, and 20 more in a detached garage. That is $42,000 a month. It is also 60 people in a house that lawfully sleeps 10 to 13, and a garage that lawfully sleeps none. We sold the house. We do not run it, and we tell every buyer not to copy it.`) +
      h.p(`The fines are per day. ${h.ext(CODE400, "A code violation in the city is a civil fine of up to $200")}. After seven days' notice to fix it, the fine is up to $2,000 for each day it continues. ${h.ext(LICENSE, "Every rental in the city needs a business license")}. Renting without one is a misdemeanor, with up to a $500 fine and 30 days, and each day is a separate offense.`) +
      h.p(`Enforcement happens, and it starts with complaints. ${h.ext(PC21, "In July 2021 a homeowner was charged")} for housing three J-1 students in a garage apartment he built without permits; the students were moved. ${h.ext(WMBF25, "In 2025 the city described reports of more than ten students in a two-bedroom space")}. ${h.ext(WMBF26, "In 2026 the fire marshal described past citations")} for four or five students in one bed with an air mattress in the closet.`) +
      h.p(`North Myrtle Beach and the unincorporated county do not list the property maintenance code among their adopted codes, as mirrored online. They enforce through the building codes, their unfit-dwelling rules and, in North Myrtle Beach, the zoning definitions. Confirm the count for the exact house with the building department before you model the rent. We do that with you.`) },
    { h2: "What do J-1 students look for in a Myrtle Beach rental?", html:
      h.ul([
        `<strong>Close to work without a car.</strong> ${h.ext(J1HOUSE, "One operator says all its houses are under two miles from the job")} and most students rent or buy a bike. ${h.ext(COAST, "Every Coast RTA bus carries two bikes")}. A house near the oceanfront employers or on a bus route fills first.`,
        `<strong>Their own bed.</strong> ${h.ext(GREENHEART, "A sponsor's rule: every participant has a bed with a frame, in a bedroom")}, never a couch in a living room.`,
        `<strong>A kitchen, Wi-Fi and laundry.</strong> Every local listing advertises all three. Linens are sometimes included.`,
        `<strong>Weekly rent and a clear deposit.</strong> ${h.ext(INTEREX, "Sponsors tell students to ask the weekly cost, the deposit and what is refundable")}, and to check the occupancy limit in the lease.`,
        `<strong>No scams.</strong> ${h.ext(ISOP, "The city's orientation site warns students about people who take deposits and provide no room")}. Sponsors tell them never to wire money before arrival. A landlord who shows the house on a video call and takes the deposit on arrival removes that fear.`,
        `<strong>Smoke detectors.</strong> Sponsors tell students to check for them. The 2013 motel closure in the city was for missing detectors and seven or eight people in rooms built for four.`,
      ]) },
    { h2: "How do you screen and lease to J-1 tenants?", html:
      h.p(`One lease per person, in English. Sponsors assume an English lease and tell students to read it and keep a signed copy. Put the move-in and move-out dates, the rent, the deposit and the occupancy limit in it. ${h.ext(CFR32, "The student must report the address to the sponsor within ten days")}, so the sponsor has your address on file.`) +
      h.p(`Screen every applicant the same way. ${h.ext(USC3604, "National origin is a protected class")}, and ${h.ext(HUD, "a rule that all tenants must speak English is a practice federal housing regulators call suspect")}. A passport is a photo ID. Sponsors tell students a landlord can ask for photo ID, an employer letter and proof of funds from home. Every student has the sponsor's 24-hour number and can give it to you.`) +
      h.p(`End the lease before the program does. ${h.ext(CFR32, "The visa allows four months")} plus 30 days to travel, and the student must leave the country by then. A fixed term that ends on the job's end date, with the deposit returned to an address abroad, is the clean version. ${h.a("/invest/landlord-rules/", "The landlord rules page")} has the deposit clock and the notices.`) },
    { h2: "What happens if you need to evict a J-1 tenant?", html: (bg) =>
      h.p(`The same law as any tenant. ${h.ext(SC2740, "The state landlord and tenant act applies to every dwelling in the state")} and says nothing about citizenship. ${h.ext(SC2737, "The grounds are unpaid rent, a term that has ended, or a broken lease")}. More people in the house than the lease allows is a broken lease, and the fourteen-day notice applies.`) +
      h.p(`Weekly rent with no fixed term makes a week-to-week tenancy, which either side ends on seven days' written notice. A fixed term ends on its date. ${h.ext(SC2740, "Fifteen days of unexplained absence after unpaid rent is abandonment")}. The magistrate process, the writ and the fees are on ${h.a("/invest/landlord-rules/", "the landlord rules page")}.`) +
      h.p(`The student's program does not end with the housing. ${h.ext(CFR40, "Losing housing is not a ground for termination")}. ${h.ext(CFR32, "The sponsor must actively and immediately help the student find new housing")}, and the student reports the new address within ten days. Sponsors list eviction as a reason to call their 24-hour line. In the 2021 garage case the city moved the students the same day.`) +
      h.p(`The cost of an eviction on a four-month lease is the season. A house that stays inside the lawful count, with one lease per person and the sponsor's number in the file, rarely needs one. In Chapter3's files, the problem houses are the overfilled ones, not the tenants.`) +
      h.cta("Buying a house for this rental?", "Call us with the address. We count the lawful beds, check the license and the zoning, and run the season against a yearly lease.", "Call a specialized agent", TEL, bg) },
    { h2: "What can go wrong with a J-1 rental?", html:
      h.p(`The season is four months. From October to April the house needs winter tenants: monthly renters, traveling workers, or the southern-hemisphere students whose numbers here are unknown. Model the year, not the summer.`) +
      h.p(`Wear is higher with ten people. Budget paint and cleaning every fall. Neighbors notice a full house, and the city says neighbors are how it learns about overcrowding.`) +
      h.p(`The residence hall competes at the low end, three hundred beds at a time, with employers reserving blocks. A clean house inside the lawful count, near the jobs, competes on quality. A duplex or fourplex spreads the same model across units; ${h.a("/invest/strategies/small-multifamily/", "the small multifamily page")} has the financing. ${h.a("/invest/student-rentals/", "Student rentals near the university")} are the year-round version.`) },
  ],
  faqTitle: "J-1 rental FAQ",
  faq: [
    { q: "What is a J-1 student?", a: "A full-time college student from another country on a Summer Work Travel visa, allowed up to four months of seasonal work during the home country's summer break. The State Department counted 104,609 of them in 2025. South Carolina had 3,003, and Myrtle Beach was the fourth busiest destination in the country." },
    { q: "How much do J-1 students pay for housing in Myrtle Beach?", a: "About $100 to $140 a week per bed, three or four to a room, with the kitchen, Wi-Fi and laundry included. That is about $430 to $610 a month per person. Deposits in the local listings are $250 to $260, with $50 to $100 kept for cleaning at checkout." },
    { q: "How many J-1 students can live in one house?", a: "Inside the City of Myrtle Beach, as many as the bedroom floor area allows. That is 70 square feet for one person and 50 square feet each for two or more, with no sleeping in kitchens or garages. A 2,500 square foot four-bedroom house holds about 10 to 13 people. North Myrtle Beach and the county use their building codes and unfit-dwelling rules instead, so confirm the count for the exact house." },
    { q: "Which Myrtle Beach employers hire J-1 students?", a: "The largest reported is Lazarus Entertainment Group. Its president said 150 of the 500 summer staff at Myrtle Waves and Broadway Grand Prix are J-1 students. He pre-rents houses and reserved 150 residence hall beds. Sponsor listings also show a pizza restaurant, a diner chain, an oceanfront resort and a beachwear chain offering housing at $100 to $110 a week." },
    { q: "Can you evict a J-1 student?", a: "Yes, under the same state law as any tenant, for unpaid rent, a term that has ended or a broken lease, through the magistrate court. Losing housing does not end the student's program. The sponsor must help find new housing, and the student reports the new address within ten days." },
    { q: "What months do J-1 students rent in Myrtle Beach?", a: "Most program windows run May to September, and the visa allows four months plus 30 days to travel. Students from Peru, Argentina, Brazil, Chile and South Africa have December to April windows, so some are here in winter, but no source counts them locally." },
  ],
  sources: [
    { name: "22 CFR 62.32", href: CFR32 },
    { name: "22 CFR 62.10", href: CFR10 },
    { name: "22 CFR 62.40", href: CFR40 },
    { name: "State Department, 2025 figures", href: FLYER },
    { name: "2026 program dates", href: DATES },
    { name: "WTOP, April 2026", href: WTOP },
    { name: "WBTW, March 2025", href: WBTW },
    { name: "WMBF, February 2026", href: WMBF26 },
    { name: "Myrtle Beach Code 6-300", href: CODE300 },
    { name: "IPMC section 404", href: IPMC },
    { name: "Code 6-400, fines", href: CODE400 },
    { name: "business license FAQ", href: LICENSE },
    { name: "SC Code 27-40", href: SC2740 },
    { name: "HUD on language rules", href: HUD },
    { name: "the residence hall", href: IRH },
  ],
  sourcesNote: "Educational only, not legal advice. Confirm the lawful bed count for a specific house with its building department.",
  bottomCta: { h2: "Talk to us before you buy a house for J-1 tenants.", p: "One call. The lawful bed count, the license, the zoning, and the season against a yearly lease.", label: "Call a specialized agent", href: TEL },
  keywords: "J-1 student housing Myrtle Beach, renting to J-1 students, J-1 rental Myrtle Beach landlord, Myrtle Beach seasonal worker housing, international student housing Myrtle Beach investors, occupancy limit Myrtle Beach rental",
  about: "Renting a house in Myrtle Beach to J-1 Summer Work Travel students",
};
