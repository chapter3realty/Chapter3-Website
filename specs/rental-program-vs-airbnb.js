/* /invest/rental-program-vs-airbnb/ - the building's rental desk against
 * self-managing, for an oceanfront condo owner. Facts:
 * research/invest-next/rental-program-vs-airbnb-facts.md, each cited source
 * re-opened 2026-09-06. No conclusion about any named building or program
 * (non-negotiable 5). Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";

module.exports = {
  url: "/invest/rental-program-vs-airbnb/",
  title: "Rental Program vs Airbnb for a Myrtle Beach Condo | Chapter3",
  description: "What an oceanfront condo owner keeps under the building's rental program versus self-managing on Airbnb or Vrbo: fees, taxes, owner use, exit terms and the loan.",
  ogTitle: "Rental program or Airbnb for your Myrtle Beach oceanfront condo",
  crumb: "Rental program vs Airbnb",
  eyebrow: "Oceanfront condos",
  h1: "Rental program or Airbnb for a Myrtle Beach condo?",
  h1em: "What you keep.",
  sub: "An oceanfront condo's rental program takes a share of every booking. Self-managing on Airbnb costs about 3 percent plus your own time. Compare the two before you choose a building.",
  heroCta: { label: "Send the address", href: RTN },
  author: "tim",
  shortAnswer: "An on-site rental program is the building's own rental desk. It books the guests, cleans the unit, takes the payment and sends you the rest, less its share. Self-managing means you list the unit on Airbnb or Vrbo, pay the platform fee, hire the cleaner and remit the taxes yourself. The program costs more per booking and less of your time. It can also limit your own use of the unit and change which lenders will finance the building. Read the program agreement and a recent owner statement before you offer. We request both for you.",
  sections: [
    { h2: "What is an on-site rental program?", html:
      h.p("A rental program, also called a rental pool or a rental desk, is a business that rents out the units in one building for their owners. In many oceanfront buildings it is run by the hotel operator or the management company on site. You sign a management agreement with it.") +
      h.p("The program advertises the unit, books the guests, runs check-in, cleans between stays and collects the money. Each month it sends you an owner statement: the gross rent, its share, the cleaning and linen charges, and the net paid to you.") +
      h.p("Joining is voluntary in some buildings and required in others. The building's recorded documents say which. A building that requires it is run as a hotel, and that changes the loan, covered below.") },
    { h2: "What does self-managing on Airbnb or Vrbo involve?", html:
      h.p("You hold the listing. You set the nightly price, the minimum nights and the blocked dates. You hire a cleaner and a handyman, answer the guests, and file the taxes on any stay you book yourself.") +
      h.p(`The platforms charge per booking. ${h.ext("https://www.airbnb.com/help/article/1857", "Airbnb's host fee")} is 3 percent of the booking on its standard structure. Owners who list through property-management software pay Airbnb's host-only fee instead, most often 15.5 percent. ${h.ext("https://help.vrbo.com/articles/How-is-the-booking-fee-calculated", "Vrbo charges")} a 5 percent commission plus 3 percent payment processing on each booking.`) +
      h.p(`The platform's host protection is not insurance for your unit. ${h.ext("https://www.airbnb.com/help/article/3142", "Airbnb says its own cover")} is not a substitute for personal insurance, and it excludes hurricanes. You carry an owner policy with a short-term rental endorsement either way. ${h.a("/buyers/coastal-insurance/", "Coastal insurance, explained")}.`) },
    { h2: "How do the costs compare on one booking?", html: (bg) =>
      h.p("The lines below are the ones on an owner statement and on a platform payout. The program's share is the number that varies most, and it is in the agreement, not on any website. Ask for it.") +
      h.table(["What comes out of the booking", "Rental program", "Self-managed"], [
        ["Share of the rent", "The program's percentage of gross rent, set in the agreement.", "The platform fee: about 3 percent on Airbnb, 8 percent on Vrbo."],
        ["Cleaning", "Charged per stay by the program, or billed to the guest.", "Your cleaner, per stay, billed to the guest as a cleaning fee."],
        ["Linen and supplies", "Program charges, often per stay.", "Yours to buy."],
        ["Card processing", "Often a separate line.", "Inside the platform fee."],
        ["Marketing", "Sometimes a program fee.", "None beyond the platform."],
        ["Owner use", "Limited by the agreement; some programs charge for it.", "Unlimited, within the tax rules on personal use."],
        ["Your time", "Almost none.", "Messages, calendar, cleaner, repairs, tax filings."],
      ]) +
      h.p(`The right comparison is the last twelve months of owner statements for the unit against what comparable units earn on the platforms. ${h.a("/invest/airbnb-income/", "What Grand Strand short-term rentals earn")}.`) +
      h.cta("Looking at a unit with a rental desk?", "Send the address. We request the program agreement and a recent owner statement and run the numbers both ways.", "Send the address", RTN, bg) },
    { h2: "Who pays the taxes in each case?", html:
      h.p(`Whoever takes the payment remits the state accommodations tax. ${h.ext("https://dor.sc.gov/tax/accommodations", "The state's rule")} is that the person or business who books the stay collects and pays. If Airbnb or Vrbo take the payment, they remit on the full booking. If the program takes the payment, the program remits. If you book a guest yourself, you remit that stay's tax and you need a retail license.`) +
      h.p(`The county fee is separate. ${h.ext("https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/", "Horry County's hospitality fee")} is 3 percent of rent outside the city limits and 1.5 percent inside. When a manager arranges the stay, the county tells the owner to make sure the manager is collecting and remitting it. A stay of 90 consecutive days or more is exempt.`) +
      h.p(`Service fees charged by a program or a platform count as part of the rent for tax. ${h.a("/invest/accommodations-tax/", "Accommodations tax, explained")}.`) },
    { h2: "Can you still use your own unit?", html:
      h.p("Under the program, only as the agreement allows. Some agreements cap owner nights. Some require notice to hold dates. Some reserve peak weeks for guests, and some charge the owner a cleaning fee for a personal stay. Self-managing, you block the calendar whenever you want.") +
      h.p(`Personal use has a tax limit either way. More than 14 nights a year, or 10 percent of the nights it was rented, and the unit counts as a home for tax. ${h.a("/invest/14-day-rule/", "The 14-day rule")}.`) },
    { h2: "What does the program change about the loan?", html:
      h.p("Lenders treat a building that is run as a hotel differently. The signs they look for are written down. The documents require owners to pool their units for rental. The documents limit when an owner can occupy the unit. Owners must share rental profit with the association or the manager. Any one of those is enough, and a front desk, daily cleaning and nightly rentals count too.") +
      h.p(`A unit in a building with those terms is financed with a condotel loan or a portfolio loan, from a shorter list of lenders. A voluntary pooling agreement with blackout dates can be counted the same way. ${h.a("/invest/condotel-financing/", "Condotel financing, explained")}. ${h.a("/invest/non-warrantable-condos/", "Non-warrantable condos")}.`) },
    { h2: "What must you read in the program agreement?", html: (bg) =>
      h.ul([
        "The share, and whether it is taken from gross rent or from rent after cleaning.",
        "Every charge to the owner: cleaning, linen, supplies, card processing, marketing, and any markup on repairs.",
        "Who sets the nightly rate. In most programs the program does.",
        "Owner-use terms: caps, notice, reserved weeks, charges.",
        "Exclusivity: whether you may also list on Airbnb or Vrbo.",
        "The term and the exit notice, and what happens to bookings already on the calendar when you leave.",
        "Who holds the guest deposits and who remits each tax.",
        "Furnishing standards and the insurance the program requires you to carry.",
      ]) +
      h.p("Ask for the last twelve months of owner statements with the agreement. The statement shows what you keep.") +
      h.cta("Want the agreement read before you offer?", "Tell us the building. We request the documents, read the owner-use and exit terms, and tell you what they cost.", "Ask about a building", "/contact/", bg) },
    { h2: "Which one fits which owner?", html:
      h.p("On average, self-managing keeps more of each booking, and the program asks less of you. An owner who lives far away and wants no calls chooses the program. An owner who will run the calendar chooses self-managing, in a building whose documents allow it.") +
      h.p("In a building run as a hotel, the program is often the only option the documents allow. There the question is not program or Airbnb. It is whether that building's numbers work with the program's share taken out. We run them before you offer.") },
  ],
  faqTitle: "Rental program FAQ",
  faq: [
    { q: "Do I have to join the building's rental program?", a: "Only if the building's recorded documents require it. Many programs are voluntary. The agreement and the master deed say which. We read both before you offer." },
    { q: "Can I use Airbnb while I am in the program?", a: "Check the exclusivity clause. Some agreements allow outside bookings with notice and some do not." },
    { q: "Who pays the accommodations tax when the program books the guest?", a: "The program does, on the full booking, because it takes the payment. If you book a guest yourself, you remit that stay's tax and need a retail license." },
    { q: "Does joining a rental program affect my loan?", a: "It can. A lender treats a building that requires pooling, limits owner use, or shares rental profit with the manager as a hotel-type project. Those units need a condotel or portfolio loan." },
    { q: "What should I ask the program for before I offer?", a: "The agreement, the fee schedule, and the last twelve months of owner statements for the unit or a similar one. Also the owner-use rules and the exit terms." },
  ],
  sources: [
    { name: "Airbnb, host service fees", href: "https://www.airbnb.com/help/article/1857" },
    { name: "Vrbo, pay-per-booking fees", href: "https://help.vrbo.com/articles/How-is-the-booking-fee-calculated" },
    { name: "South Carolina Department of Revenue, accommodations tax", href: "https://dor.sc.gov/tax/accommodations" },
    { name: "Horry County, hospitality fee", href: "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/" },
    { name: "Fannie Mae Selling Guide, ineligible projects", href: "https://selling-guide.fanniemae.com/sel/b4-2.1-03/ineligible-projects" },
  ],
  sourcesNote: "Educational only, not tax or legal advice. Platform fees and tax rates change; the linked pages carry the current figures.",
  bottomCta: { h2: "The owner statement shows what you keep.", p: "Send the address. We request the program agreement and a recent owner statement and run the numbers both ways.", label: "Send the address", href: RTN },
  keywords: "Myrtle Beach condo rental program vs Airbnb, rental pool vs self managing Myrtle Beach condo, oceanfront condo rental program fees, Myrtle Beach condotel rental program",
  about: "Myrtle Beach oceanfront condo rental programs",
};
