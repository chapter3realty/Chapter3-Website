/* /invest/new-construction-rentals/ - buying new construction as a rental in
 * Myrtle Beach. Permit counts from the Census series on FRED (MYRT845BPPRIV), read
 * 2026-09-07. SC Code 27-30-130 and the Horry County Register of Deeds read the
 * same day. The 1-2-10 builder warranty terms re-opened 2026-09-07 at two
 * warranty companies' pages (sources line). Brokerage facts from
 * research/invest-next/owner-answers-batch4.md (rounds 1 to 3); the Little River
 * story is anonymized and names no community or builder (non-negotiable 5).
 * "Rules" is the owner's word for covenants. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const FRED = "https://fred.stlouisfed.org/series/MYRT845BPPRIV";
const HOAACT = "https://www.scstatehouse.gov/code/t27c030.php";
const ROD = "https://www.horrycountysc.gov/departments/register-of-deeds/";
const ACCLAIM = "https://acclaimweb.horrycounty.org/acclaimweb";
const WARRANTY = "https://www.strucsure.com/builders/our-builder-warranties/1-2-10-warranty/";

module.exports = {
  url: "/invest/new-construction-rentals/",
  datePublished: "2026-09-07",
  title: "New Construction as a Rental in Myrtle Beach | Chapter3",
  description: "New construction as a rental in Myrtle Beach: the recorded rules on renting, why early buyers in a community cash flow and late ones do not, and builder incentives.",
  ogTitle: "Buying new construction as a rental in Myrtle Beach",
  crumb: "New construction rentals",
  eyebrow: "New communities",
  h1: "Can you buy new construction as a rental in Myrtle Beach?",
  h1em: "The rules, the builder, the timing.",
  sub: "The area permits about 7,000 new homes a year. Whether new construction can be rented depends on the recorded rules. Builders rarely give investor buyers incentives.",
  heroCta: { label: "Talk to a new construction agent", href: "/contact/" },
  author: "devin",
  shortAnswer: "Yes, in most communities. Builders were allowed to start 6,898 homes in the Myrtle Beach area in 2025. Whether a new house can be rented depends on the rules recorded for that community. A rule counts only if it is recorded with the county. In Chapter3's files the first buyers in a new community get the lowest price and the best cash flow. In one Little River community the rents stayed flat while the prices rose, so the last buyers paid more for the same rent. Most builders give incentives to buyers with FHA, VA or conventional loans, and rarely to investors. We pull the rules and run the rent before you sign.",
  sections: [
    { h2: "How much new construction is there?", html: (bg) =>
      h.p(`${h.ext(FRED, "Builders were allowed to start 6,898 homes")} in the Myrtle Beach area in 2025. Builders are working from Little River and Longs in the north, through Carolina Forest and Conway, to Surfside Beach and Murrells Inlet in the south.`) +
      h.table(["Year", "Homes authorized in the Myrtle Beach area"], [["2024", "7,152"], ["2025", "6,898"], ["2026, January to July", "3,873"]]) +
      h.p(`Most of it is single-family houses and townhouses in planned communities with a homeowners association. ${h.a("/invest/what-is-being-built/", "What is being built right now")} has the monthly count, the approved communities and the roads. ${h.a("/buyers/new-construction/", "How buying new construction works here")}, including the inspection a new house still needs.`) +
      h.p(`A new house is a simple rental to own in the first years. The roof, the water heater and the heating and cooling system are new, and the builder's warranty pays for defects.`) +
      h.cta("Want to buy a new construction home?", "Tell us the area and the budget. We tour the communities with you, pull the recorded rules, and run the rent before you sign.", "Talk to a new construction agent", "/contact/", bg) },
    { h2: "Can you rent out a new house?", html:
      h.p(`Usually. The answer is in two documents. The first is the rules recorded for the community. The second is the builder's purchase contract.`) +
      h.p(`${h.ext(HOAACT, "A homeowners association rule counts only if it is recorded")} with the county register of deeds. Rules and changes adopted during the year must be recorded by January 10 of the next year. If they are not, they cannot be enforced.`) +
      h.p(`A community can ban renting. State law says a rule must be recorded to count. It does not limit what a recorded rule may say about renting. A recorded ban on renting is enforceable here.`) +
      h.table(["Rule to look for", "What it means for a rental"], [["Leasing cap", "Only a fixed share of the homes may be rented at one time. You may wait for a slot."], ["Minimum lease term", "Often one year. It blocks furnished and seasonal stays."], ["Approval process", "The association reviews the tenant or the lease first."], ["Owner-occupancy period", "You must live in the house for a fixed time after buying before you may rent it."]]) +
      h.p(`${h.ext(ACCLAIM, "The county's online records index")} has the recorded rules and the plats. We pull them for any community before a client signs.`) +
      h.p(`There is no pattern to apply. This area has communities by the ocean, west of Highway 17, next to the university, in rural Longs, built for retirees, and next to the entertainment districts. The rules change with each. Every new community is read on its own.`) },
    { h2: "When does a new community cash flow?", html:
      h.p(`Early. In Chapter3's files an agent now on our team helped buyers purchase eight townhouses in one new community in Little River. The houses were nearly identical. Each rented for a little over $2,000 a month.`) +
      h.table(["", "First sale", "Last sale, about 18 months later"], [["Price", "$230,000", "$292,000"], ["Rent", "A little over $2,000", "A little over $2,000"]]) +
      h.p(`The cash flow went to the early buyers. Each later buyer paid more for the same rent. By the end of the build-out the numbers no longer worked as a rental. Another buyer in the same community, not our client, bought nine houses, rents none of them, and keeps them to sell at about $300,000.`) +
      h.p(`The reason is how a builder sells a community. Early sales pay back the builder's land and site costs, so the first prices are the lowest. Near the end of a build-out few homes remain, and the price rises. Buy early for cash flow and appreciation. Buy late only if the rent still pays the costs.`) },
    { h2: "Do builders give investors incentives?", html:
      h.p(`Rarely. ${h.a("/buyers/new-construction/", "Builders here offer closing cost credits, design money and rate buydowns")} to buyers who use the builder's preferred lender with an FHA, VA or conventional loan. In Chapter3's experience a buyer with an investor loan, such as a DSCR loan, almost never gets those incentives.`) +
      h.p(`If a builder offers one on an investor loan, count it as a gain, but not part of the plan. If you need to know what the rates and monthly payments would look like here in Myrtle Beach, call us. We work with our preferred lender to give you solid numbers.`) },
    { h2: "What else changes when the rental is new?", html: (bg) =>
      h.ul([
        `<strong>The tax.</strong> The county assesses a rental at 6 percent. ${h.a("/buyers/property-taxes/", "The bill is about three times the bill for the same house as a primary residence")}. That is the same for a new house and an old one.`,
        `<strong>The dues.</strong> Association dues in a new community often rise once the builder turns the association over to the owners.`,
        `<strong>The warranty.</strong> Most builders give a written warranty. The usual terms are one year on workmanship and materials, two years on the plumbing, electrical and heating and cooling systems, and ten years on the structure. It starts at closing. In Chapter3's experience many builders also send a repair crew back near the end of the first year. The crew fixes drywall cracks and nail pops and touches up paint. Ask for the warranty booklet before you sign.`,
        `<strong>The competition.</strong> A new community has many near-identical houses. Several owners rent at the same time, and the builder is still selling new houses on the same street, some with incentives. A tenant compares the houses on price, because the houses are the same. You cannot charge more for a feature every house has, so your rent is the lowest rent on the street. That ends when the build-out ends and the houses start to differ in condition and upgrades.`,
      ]) +
      h.cta("Buying your first new build as a rental?", "Tell us the community and the budget. We read the rules, compare the loans, and run the rent before you sign.", "Let us make it simple", "/contact/", bg) },
  ],
  faqTitle: "New construction rental FAQ",
  faq: [
    { q: "Can I rent out a new construction home in Myrtle Beach?", a: "Usually. It depends on the rules recorded for the community and on the builder's contract. A rule counts only if it is recorded with the county, so we pull the recorded set before you sign." },
    { q: "Can an HOA ban rentals in South Carolina?", a: "Yes. A recorded rule that bans or limits renting is enforceable. State law requires the rule to be recorded with the county to count. It does not limit what a recorded rule may say about renting." },
    { q: "Do builders offer incentives to investors?", a: "Rarely. Most incentives go to buyers using the builder's preferred lender with an FHA, VA or conventional loan. In Chapter3's experience an investor loan almost never gets them." },
    { q: "Is it better to buy early or late in a new community?", a: "Early, for both cash flow and appreciation. In one Little River community the first townhouse sold for $230,000 and the last for $292,000, about eighteen months apart. The rent stayed a little over $2,000 for both." },
    { q: "What warranty comes with a new construction rental?", a: "Most builders give a written warranty. The usual terms are one year on workmanship and materials, two years on the plumbing, electrical and heating and cooling systems, and ten years on the structure. It starts at closing. Ask for the booklet before you sign." },
    { q: "How many new homes are being built around Myrtle Beach?", a: "Builders were allowed to start 6,898 homes in the Myrtle Beach area in 2025 and 7,152 in 2024, by the federal permit count." },
  ],
  sources: [
    { name: "Census building permits, Myrtle Beach area, on FRED", href: FRED },
    { name: "SC Code 27-30-130, recording of association rules", href: HOAACT },
    { name: "Horry County Register of Deeds", href: ROD },
    { name: "Horry County records index", href: ACCLAIM },
    { name: "The 1-2-10 builder warranty, StrucSure Home Warranty", href: WARRANTY },
  ],
  sourcesNote: "Educational only. Rules change; read the recorded set for the community before you sign.",
  bottomCta: { h2: "Read the rules before you sign with the builder.", p: "One call. We pull the recorded rules and run the rent.", label: "Call a specialized agent", href: TEL },
  keywords: "new construction rental property Myrtle Beach, can you rent out a new construction home, new home community rental restrictions South Carolina, buying new construction as an investment Myrtle Beach, builder incentives investors, builder warranty rental",
  about: "Buying new construction as a rental in Myrtle Beach",
};
