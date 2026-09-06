/* /invest/landlord-rules/ - what a South Carolina landlord must do, and how
 * an eviction runs in Horry County. Facts: research/invest-next/landlord-rules-facts.md;
 * every cited source re-opened by the writer 2026-09-06 (statute pages, court
 * forms, the fee schedule, county pages, federal pages). Brokerage facts from
 * research/invest-next/owner-answers-batch3.md (answers 14, 16, 17, 18),
 * attributed to Devin Day. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const LTA = "https://www.scstatehouse.gov/code/t27c040.php";
const EJECT = "https://www.scstatehouse.gov/code/t27c037.php";
const FORMS = "https://www.sccourts.org/court-forms/?courtType=Mag";
const FEES = "https://www.sccourts.org/about/court-news/2025-07-01/fee-memorandum-magistrate-courts-and-municipal-courts/";
const FEE2027 = "https://www.scstatehouse.gov/sess126_2025-2026/bills/4813.htm";
const MAGCT = "https://www.sccourts.org/courts/trial-courts/magistrate-court/";
const HORRYCT = "https://www.sccourts.org/courts/courthouse-search/horry/";
const CIVIL = "https://www.horrycountysc.gov/departments/sheriffs-office/additional-services/civil-process/";
const SURF = "https://www.horrycountysc.gov/news/articles/surfside-magistrate-office-currently-closed/";
const FTC = "https://www.ftc.gov/business-guidance/resources/using-consumer-reports-what-landlords-need-know";
const CFPB = "https://www.consumerfinance.gov/ask-cfpb/what-should-i-do-if-my-rental-application-is-denied-because-of-a-tenant-screening-report-en-2105/";
const HUD = "https://www.hud.gov/stat/fheo/rights-obligations";
const SCRA = "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title50-section3951&num=0&edition=prelim";
const SCRACAP = "https://www.govinfo.gov/content/pkg/FR-2026-03-10/html/2026-04689.htm";
const DOJ = "https://www.justice.gov/servicemembers/financial-and-housing-rights-0";

module.exports = {
  url: "/invest/landlord-rules/",
  title: "South Carolina Landlord Rules and Evictions | Chapter3",
  description: "South Carolina landlord rules for a Myrtle Beach rental: the deposit clock, 24-hour entry, the five-day rent notice, and the Horry County eviction steps and fees.",
  ogTitle: "South Carolina landlord rules and the Horry County eviction process",
  crumb: "Landlord rules",
  eyebrow: "Owning the rental",
  h1: "What are the landlord rules in South Carolina?",
  h1em: "Deposits, entry, notices and the Horry County eviction.",
  sub: "South Carolina landlord rules for a Myrtle Beach rental: the deposit clock, the owner disclosure, 24-hour entry, the five-day rent notice, and the Horry County eviction steps.",
  heroCta: { label: "Ask about your rental", href: "/contact/" },
  author: "tim",
  shortAnswer: "A South Carolina landlord must give the tenant the owner's name and address in writing and keep the home fit and habitable. The landlord must give 24 hours notice before entering, and must return or itemize the deposit within 30 days of move-out. Rent unpaid five days after the due date lets you end the lease, if the lease carries the state's notice clause in bold. Every other breach gets 14 days to cure. An eviction is filed at the Horry County magistrate court for the property's area, on a sworn two-page form, for $55 on the statewide fee schedule. The tenant has ten days to answer. After the writ, the sheriff gives 24 hours. In Chapter3's files the process runs up to three weeks. Changing the locks yourself costs three months of rent.",
  sections: [
    { h2: "Who is a landlord under South Carolina law?", html:
      h.p(`${h.ext(LTA, "South Carolina's residential landlord and tenant law")} covers every house, condo and apartment rented as a home. It applies whoever owns the property and wherever the owner lives. It sets duties for the landlord and for the tenant. A lease cannot make the tenant waive them.`) +
      h.p(`The law also treats a manager as the landlord in one case. A manager who never gives the tenant the owner's name and address in writing becomes the landlord for notices and lawsuits. ${h.a("/invest/property-management/", "What a manager must do for you")}.`) },
    { h2: "What must you give the tenant at move-in?", html:
      h.p(`Three things go to the tenant in writing at or before move-in. The first is ${h.ext(LTA, "the name and address of the owner")}, or of the person who acts for the owner. Keep it current. The duty passes to whoever owns the property next.`) +
      h.p(`The second is the lease, with the state's rent notice in bold, conspicuous type. The law lets that clause serve as the only notice of nonpayment for the whole tenancy. It reads: "If you do not pay your rent within five days of the due date, the landlord can start to have you evicted. You will get no other notice as long as you live in this rental unit."`) +
      h.p(`The third is a receipt for the deposit, if you take one. ${h.ext(LTA, "The deposit rule")} sets no maximum, requires no interest and requires no separate account. An owner of more than four adjoining units who sets different deposit standards for different tenants must post the standards or hand each applicant a copy.`) +
      h.p("A late fee is a lease term, not a statute. The law counts late charges as rent and sets no cap. Write the amount and the grace period into the lease. The only limits are the ban on making the tenant waive rights and the rule against unconscionable terms. Which charge and which grace period fit your unit is case by case. We go through the lease with you, clause by clause, before the first tenant signs.") },
    { h2: "What must you maintain?", html:
      h.p(`${h.ext(LTA, "The landlord's duties")} are to meet the building and housing codes that affect health and safety, keep the home fit and habitable, and keep common areas safe. You must supply running water, reasonable hot water and reasonable heat. You must keep the electrical, gas, plumbing, sanitary, heating, ventilating and air conditioning systems in good and safe working order.`) +
      h.p("Every appliance in the unit counts as supplied by you unless the lease excludes it. You cannot exclude an appliance the home needs for essential services. List the appliances the tenant owns in the lease.") +
      h.p("The tenant must keep the unit reasonably safe and clean, cause no damage, and keep guests from disturbing other tenants. The tenant must follow the lease and its rules, and cannot change the locks without your permission.") },
    { h2: "When can you enter the rental?", html:
      h.p(`Give ${h.ext(LTA, "at least 24 hours notice")} and enter at reasonable times. The purposes the law lists are inspection, repairs, improvements, agreed services, and showing the unit to buyers, lenders, tenants, workers or contractors. You cannot use the right of entry to harass the tenant.`) +
      h.p("Three cases need no consent. An emergency allows entry at any time, and a weather forecast that threatens the property counts as one. Scheduled services such as filter changes or pest treatment allow entry between 9 in the morning and 6 in the evening. The lease must state that right in a conspicuous place. A service the tenant asked for allows entry between 8 in the morning and 8 at night, announced first.") +
      h.p(`Showings when you sell follow the same 24 hours. ${h.a("/sell/rental-property/", "Selling with the tenant in place")}.`) },
    { h2: "Can you end a lease to sell the house?", html:
      h.p(`No. ${h.ext(EJECT, "The grounds for ejectment")} are unpaid rent, a term that has ended, or a lease violation. Selling the house is not one of them. A fixed-term lease runs to its end date, or ends by agreement, usually a buyout you pay the tenant to leave early.`) +
      h.p(`${h.ext(LTA, "A month-to-month tenancy")} ends on 30 days written notice from either side, for any reason. That is the fastest legal route to an empty house. A tenant who has complained about a code violation can still raise retaliation as a defense, so state the reason in the notice: the sale.`) },
    { h2: "What happens when rent is late?", html: (bg) =>
      h.p(`Rent unpaid ${h.ext(LTA, "five days after the due date")} lets you end the lease, if the tenant had the written notice. The bold clause in the lease is that notice. Without the clause, one written notice per lease term is enough. The clause carries into a month-to-month tenancy after the lease term ends.`) +
      h.p(`${h.ext(EJECT, "Rent keeps accruing")} after you file, at the lease rate, until the tenant leaves. Accepting it does not waive the eviction and does not renew the lease.`) +
      h.p(`A tenant who is absent without explanation for 15 days after missing rent has ${h.ext(LTA, "abandoned the unit")}. If the tenant also shut off the utilities, abandonment is immediate. You must then try to re-rent at a fair rent. You can enter and dispose of property left behind that is worth $500 or less. Anything worth more is removed only through the court.`) +
      h.cta("Own a rental and want the lease checked against these rules?", "Send the address and the lease. We tell you what the unit rents for now and which lease terms to update.", "Ask about your rental", "/contact/", bg) },
    { h2: "How do you end a lease for other reasons?", html:
      h.p(`For a breach other than unpaid rent, send ${h.ext(LTA, "a written notice")} that names the breach. The notice sets an end date at least 14 days after the tenant receives it. A tenant who fixes the breach by that date stays. A tenant who starts the fix within the 14 days and finishes it in good faith within a reasonable time also stays. A breach that affects health, safety or the physical condition of the property follows a separate rule.`) +
      h.p("A month-to-month tenancy ends on 30 days written notice from either side. A tenant who stays past the end date is a holdover, and you file for possession.") +
      h.p(`${h.ext(LTA, "Retaliation is barred")}. You cannot raise the rent above market, cut services or file for possession because the tenant complained to a code office, or to you, about a violation. The tenant raises that defense in writing within ten days of the rule to vacate. A retaliatory non-renewal with the rent current bars possession for 75 days. Damages run to three months of rent or three times the loss, whichever is greater, plus attorney's fees. Tenant neglect and the tenant's own material breach are exceptions.`) },
    { h2: "How does an eviction work in Horry County?", html: (bg) =>
      h.p("The law sets the minimum times. The calendar belongs to the court and the sheriff. Devin Day, Chapter3's operations officer, puts the Horry County process at up to three weeks from filing to the writ. A strong case with a clean ledger has finished in a few days. After the writ, the tenant has 24 hours. There are four steps.") +
      h.h3("Step 1: file the application") +
      h.p(`File the ${h.ext(FORMS, "Application for Ejectment")}, form SCCA 732, at the magistrate court for the property's area. You swear to the facts before a notary and attach the lease or other written proof. The grounds are unpaid rent, a term that has ended, or a lease violation. ${h.ext(LTA, "Your broker-in-charge or property manager can file it")} for you, with no separate charge.`) +
      h.p(`${h.ext(FEES, "The statewide fee schedule")} lists $20 to file, $10 to serve and a $10 assessment. It adds $5 to mail when mailing is required and $10 to serve the writ if that is needed. The total is $55. ${h.ext(FEE2027, "The filing fee becomes $40")} on January 1, 2027, and the court has not published the rest of the new schedule.`) +
      h.h3("Step 2: the rule to vacate") +
      h.p(`The magistrate issues a ${h.ext(EJECT, "rule to vacate or show cause")}. The tenant is served in person. If two attempts fail, at least 48 hours apart and at times of day at least eight hours apart, the rule is posted on the door and mailed. ${h.ext(CIVIL, "The sheriff's office")} asks you to wait five days after filing before you call about service.`) +
      h.p("Served in person, the tenant has ten days to move or ask for a hearing. Posted and mailed, the tenant has 20 days.") +
      h.h3("Step 3: the hearing or the writ") +
      h.p(`If the tenant does not answer in time, the magistrate issues the writ of ejectment. A tenant who answers gets a hearing, run like any other civil case. Either side can demand a jury, in writing, at least five business days before the hearing date. The court takes no written witness statements, even notarized ones. If you win, the writ issues within five days. The magistrate can also award unpaid rent, up to ${h.ext(MAGCT, "the court's $7,500 limit")}.`) +
      h.h3("Step 4: the sheriff") +
      h.p(`A deputy or constable presents ${h.ext(FORMS, "the writ")} and gives the occupants 24 hours to leave. After that, a deputy can enter by force, using the least destructive means. The county calls the removal a sit-out: you request it, and a deputy oversees the removal of the belongings, which can be set beside the public street. The officer can delay for an ill or elderly tenant. To collect a money judgment, ${h.ext(CIVIL, "file it with the Clerk of Court")} for $35, then with the sheriff for $25.`) +
      h.p(`Never change the locks, remove a door or cut a utility. ${h.ext(LTA, "A lockout")} costs three months of rent or twice the tenant's actual damages, whichever is greater, plus attorney's fees. Only the sheriff or a constable removes a tenant, and only on a writ.`) +
      h.p(`Horry County has ${h.ext(HORRYCT, "six magistrate offices")}. Conway is at 1201 Third Avenue and Myrtle Beach at 1201 21st Avenue North. Surfside Beach is at 9630 Scipio Lane, Little River at 107 Highway 57 North, Loris at 3817 Walnut Street and Aynor at 640 9th Avenue. ${h.ext(SURF, "The county posted in late 2024")} that the Surfside Beach office was closed for maintenance. Call before you file there.`) +
      h.p(`A tenant on active military duty ${h.ext(SCRA, "cannot be evicted without a court order")} when the rent is at or below the federal ceiling. The ceiling is ${h.ext(SCRACAP, "$10,542.60 a month for 2026")}. The court can stay the case for 90 days. ${h.ext(DOJ, "File an affidavit of the tenant's military status")} before any default judgment.`) +
      h.cta("Buying a rental and want the rules priced in?", "Send the address. We run the rent, the vacancy and the turnover cost before you offer.", "Send the address", RTN, bg) },
    { h2: "What does a Chapter3 agent do during an eviction?", html:
      h.p("Six things. We do all of them.") +
      h.ol([
        "Read the lease and the ledger, confirm the five-day clause is in bold, and send the written notice if it is not.",
        "Complete the Application for Ejectment. When Chapter3 manages the unit, the broker-in-charge files it for you at no separate charge, as the statute allows.",
        "Calendar the answer window, ten or twenty days, and the hearing date. Gather the photos, the ledger and the notices, and bring the witnesses, because the court takes no written statements.",
        "Check the tenant's military status and file the affidavit before any default judgment.",
        "Request the sit-out with the sheriff's civil process office and meet the deputy at the property.",
        "Photograph the unit, change the locks once the deputy hands it back, and list it for rent that week.",
      ]) +
      h.p("Rent keeps accruing until the tenant leaves, so every day saved on steps two and three is rent recovered.") },
    { h2: "Will a property manager handle the eviction?", html:
      h.p(`Some will. An all-inclusive manager files the application, attends the hearing and meets the deputy. A manager you pay for some services only will not. Most managers charge a percentage of the rent whatever the work is. Some charge by the hour, and an eviction then costs extra. Ask before you sign the management agreement. ${h.a("/invest/property-management/", "What to ask a manager, and what one costs")}.`) },
    { h2: "How do you screen an applicant?", html:
      h.p(`${h.ext(HUD, "Fair housing law")} bars any decision based on race, color, national origin, religion, sex, familial status or disability. That covers refusing to rent, setting different terms, and saying a unit is unavailable when it is not. Write one screening standard and apply it to every applicant.`) +
      h.p(`A credit or background report is a consumer report. ${h.ext(FTC, "You must certify to the screening company")} that you use it only for housing. Denying the application, raising the deposit or the rent, or requiring a co-signer because of the report is an adverse action. You must then give the applicant ${h.ext(CFPB, "a notice")}. The notice names the company that supplied the report, with its address and phone number. It says the company did not make the decision. It explains the right to dispute the report and to get a free copy within 60 days.`) +
      h.p(`Keep the application, the report and the notice for every applicant, accepted or not. We work with screening companies we recommend once you are a client, and the notice rules apply whichever one you use. ${h.a("/invest/student-rentals/", "A student house adds an occupancy cap")}. ${h.a("/invest/mid-term-rentals/", "A furnished mid-term rental screens a traveling professional")}.`) },
  ],
  faqTitle: "Landlord rules FAQ",
  faq: [
    { q: "How long does a South Carolina landlord have to return a security deposit?", a: "Thirty days after the tenancy ends, the tenant moves out and the tenant asks for it, whichever is later. Any deduction must be itemized in writing. A landlord who withholds wrongly owes three times the amount plus attorney fees." },
    { q: "How much notice must a landlord give before entering?", a: "At least 24 hours, at reasonable times. Emergencies need no notice. Scheduled services and services the tenant asked for have their own daytime windows." },
    { q: "How many days late can rent be before an eviction starts?", a: "Five days after the due date, if the lease carries the state rent notice in bold or the tenant received one written notice that lease term. The landlord can then end the lease and file for ejectment." },
    { q: "How long does an eviction take in Horry County?", a: "The law sets the minimums. A tenant served in person has ten days to answer, and 20 days if the rule was posted and mailed. After a hearing or a default, the writ issues within five days, and the sheriff gives 24 hours. In Chapter3's files the process runs up to three weeks, and a few days for a strong case." },
    { q: "Can a landlord evict a tenant to sell the house?", a: "No. The grounds are unpaid rent, a term that has ended, or a lease violation. A month-to-month tenancy ends on 30 days written notice. A fixed lease runs to its end date or ends by a buyout." },
    { q: "Does a property manager handle evictions?", a: "An all-inclusive manager does, as part of its fee. A manager paid for some services only does not, and some managers bill an eviction by the hour. Ask before you sign the management agreement." },
    { q: "Can I change the locks on a tenant who has not paid?", a: "No. A lockout, a removed door or a cut utility costs three months of rent or twice the tenant damages, whichever is greater, plus attorney fees. Only the sheriff or a constable removes a tenant, on a writ." },
    { q: "What does it cost to file an eviction in South Carolina?", a: "The statewide schedule totals $55: $20 to file, $10 to serve, $5 to mail if required, a $10 assessment, and $10 to serve the writ if needed. The filing fee rises to $40 in 2027." },
  ],
  sources: [
    { name: "SC Code, Title 27, Chapter 40", href: LTA },
    { name: "SC Code, Title 27, Chapter 37, ejectment", href: EJECT },
    { name: "SC Judicial Branch, magistrate forms", href: FORMS },
    { name: "SC Judicial Branch, civil fee schedule", href: FEES },
    { name: "H.4813 of 2026, magistrate fees", href: FEE2027 },
    { name: "Horry County Sheriff, civil process", href: CIVIL },
    { name: "SC Judicial Branch, Horry County courts", href: HORRYCT },
    { name: "FTC, using consumer reports", href: FTC },
    { name: "50 U.S.C. 3951", href: SCRA },
  ],
  sourcesNote: "Educational only, not legal advice. Fees are the statewide magistrate schedule in force at publication.",
  bottomCta: { h2: "Get the rent, the lease terms and the turnover cost before you buy.", p: "Send the address. We run the numbers with the deposit, notice and entry rules built in.", label: "Send the address", href: RTN },
  keywords: "South Carolina landlord tenant law, Horry County eviction process, how long does an eviction take in Horry County, Myrtle Beach landlord rules, security deposit return South Carolina 30 days, magistrate court ejectment fee",
  about: "South Carolina landlord duties and the Horry County eviction process",
};
