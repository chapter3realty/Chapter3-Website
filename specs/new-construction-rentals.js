/* /invest/new-construction-rentals/ - buying new construction as a rental on the
 * Grand Strand. Permit counts from the Census series on FRED (MYRT845BPPRIV), read
 * 2026-09-07. SC Code 27-30-130 and the Horry County Register of Deeds read the
 * same day. Brokerage facts from research/invest-next/owner-answers-batch4.md; the
 * Little River story is anonymized and names no community or builder
 * (non-negotiable 5). Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const FRED = "https://fred.stlouisfed.org/series/MYRT845BPPRIV";
const HOAACT = "https://www.scstatehouse.gov/code/t27c030.php";
const ROD = "https://www.horrycountysc.gov/departments/register-of-deeds/";
const ACCLAIM = "https://acclaimweb.horrycounty.org/acclaimweb";

module.exports = {
  url: "/invest/new-construction-rentals/",
  title: "Renting Out New Construction on the Grand Strand | Chapter3",
  description: "New construction as a rental on the Grand Strand: the recorded covenants, why early buyers in a community cash flow and late ones do not, and builder incentives.",
  ogTitle: "Renting out new construction on the Grand Strand",
  crumb: "New construction rentals",
  eyebrow: "New communities",
  h1: "Can you buy new construction as a rental on the Grand Strand?",
  h1em: "The covenants, the builder, the timing.",
  sub: "The area permits about 7,000 new homes a year. Whether new construction can be rented depends on the recorded covenants. The cash flow depends on when you buy.",
  heroCta: { label: "Send the address", href: RTN },
  author: "devin",
  shortAnswer: "Yes, in most communities, and the numbers depend on when you buy. Builders were authorized to start 6,898 homes in the Myrtle Beach area in 2025. Whether a new house can be rented depends on the covenants recorded for that community, and a rule is enforceable only if it is recorded. In Chapter3's files the first buyers in a new community get the lowest price and the best cash flow. Rents did not rise with the prices in a Little River community we watched, so the last buyers paid more for the same rent. Most builders give incentives to buyers with FHA, VA or conventional loans, and rarely to investors. We pull the covenants and run the rent before you sign.",
  sections: [
    { h2: "How much new construction is there?", html:
      h.p(`${h.ext(FRED, "Builders were authorized to start 6,898 homes")} in the Myrtle Beach area in 2025, after 7,152 in 2024. Through July 2026 the count is 3,873. The building runs from Little River and Longs in the north through Carolina Forest and Conway to Surfside Beach and Murrells Inlet in the south.`) +
      h.p(`Most of it is single-family houses and townhouses in planned communities with a homeowners association. ${h.a("/buyers/new-construction/", "How buying new construction works here")}, including the inspection a new house still needs.`) },
    { h2: "Can you rent out a new house?", html: (bg) =>
      h.p(`Usually, but the answer is in two documents, not in the sales office. The first is the recorded covenants for the community. The second is the builder's purchase contract.`) +
      h.p(`${h.ext(HOAACT, "A homeowners association rule is enforceable only if it is recorded")} with the county register of deeds. Rules and amendments adopted during the year must be recorded by January 10 of the next year, or they stop being enforceable. The recorded set is the set that binds you.`) +
      h.p(`${h.ext(ACCLAIM, "The county's online records index")} holds the recorded covenants and plats. We pull them for any community before a client signs. Look for a leasing cap, a minimum lease term, an approval process, and an owner-occupancy period after purchase.`) +
      h.p(`There is no pattern to apply here. This area has communities by the ocean, west of Highway 17, next to the university, in rural Longs, built for retirees, and next to the entertainment districts. The rental rules change with each of those, so every new community is read on its own.`) +
      h.cta("Looking at a new community?", "Send the address or the community name. We pull the recorded covenants, read the builder's contract terms, and run the rent before you sign.", "Send the address", RTN, bg) },
    { h2: "When does a new community cash flow?", html:
      h.p(`Early. In Chapter3's files an agent now on our team helped buyers purchase eight townhouses in one new community in Little River. The houses were nearly identical and each rented for a little over $2,000 a month. The first sold for $230,000 and the last for $292,000, about eighteen months later. The rents did not move.`) +
      h.p(`The cash flow went to the early buyers. Each later buyer paid more for the same rent, and by the end of the build-out the numbers no longer worked as a rental. Another buyer in the same community, not our client, bought nine houses, rents none of them, and holds them to sell at about $300,000.`) +
      h.p(`The reason is how a builder sells a community. Early sales pay back the builder's land and site costs, so the first prices are the lowest. Near the end of a build-out few homes remain, and the price rises. Buy early for cash flow and appreciation. Buy late only if the rent still covers the price.`) },
    { h2: "Do builders give investors incentives?", html:
      h.p(`Rarely. ${h.a("/buyers/new-construction/", "Builders here offer closing cost credits, design money and rate buydowns")} to buyers who use the builder's preferred lender with an FHA, VA or conventional loan. In Chapter3's experience a buyer with an investor loan, such as a DSCR loan, almost never gets those incentives.`) +
      h.p(`Price the house without the incentive. If a builder offers one on an investor loan, count it as a gain, not a plan. Ask a loan officer at our preferred lender to compare the builder's loan with an investor loan before you decide.`) },
    { h2: "What else changes when the rental is new?", html: (bg) =>
      h.p(`Four things. The county assesses a rental at 6 percent from the first bill. The tax is about three times the bill for the same house as a legal residence. ${h.a("/buyers/property-taxes/", "How Horry County property tax is calculated")}. The association dues in a new community often rise once the builder hands the association to the owners. A new house still needs an inspection, and the builder's warranty runs from closing, not from the day a tenant reports a problem. A house that rents for the same as forty others on the street rents on price alone.`) +
      h.cta("Buying your first new build as a rental?", "Tell us the community and the budget. We read the covenants, compare the loans, and run the rent before you sign.", "Let us make it simple", "/contact/", bg) },
  ],
  faqTitle: "New construction rental FAQ",
  faq: [
    { q: "Can I rent out a new construction home in Myrtle Beach?", a: "Usually. It depends on the covenants recorded for the community and on the builder's contract. A rule is enforceable only if it is recorded with the county, so we pull the recorded set before you sign." },
    { q: "Do builders offer incentives to investors?", a: "Rarely. Most incentives go to buyers using the builder's preferred lender with an FHA, VA or conventional loan. In Chapter3's experience an investor loan almost never gets them." },
    { q: "Is it better to buy early or late in a new community?", a: "Early, for both cash flow and appreciation. In one Little River community the first townhouse sold for $230,000 and the last for $292,000, about eighteen months apart. The rent stayed a little over $2,000 for both." },
    { q: "How many new homes are being built around Myrtle Beach?", a: "Builders were authorized to start 6,898 homes in the Myrtle Beach area in 2025 and 7,152 in 2024, by the federal permit count." },
  ],
  sources: [
    { name: "Census building permits, Myrtle Beach area, on FRED", href: FRED },
    { name: "SC Code 27-30-130, recording of association rules", href: HOAACT },
    { name: "Horry County Register of Deeds", href: ROD },
    { name: "Horry County records index", href: ACCLAIM },
  ],
  sourcesNote: "Educational only. Covenants change; read the recorded set for the community before you sign.",
  bottomCta: { h2: "Read the covenants before you sign with the builder.", p: "Send the address or the community name. We pull the recorded covenants and run the rent.", label: "Send the address", href: RTN },
  keywords: "new construction rental property Myrtle Beach, can you rent out a new construction home, new home community rental restrictions South Carolina, buying new construction as an investment Grand Strand, builder incentives investors",
  about: "Buying new construction as a rental on the Grand Strand",
};
