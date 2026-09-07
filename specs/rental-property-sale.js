/* /sell/rental-property/ - selling a rental with a tenant or bookings in
 * place. Facts: research/invest-next/selling-a-rental-facts.md; every cited
 * source re-opened by the writer 2026-09-06. The withholding rate is the
 * state's top individual rate for the tax year of the sale (5.21 percent for
 * 2026), not the pre-2024 7 percent. The 60-day move-in figure is the owner's
 * instruction ("most lenders require") and matches Handbook 4000.1 for FHA
 * (read 2026-09-06). Brokerage facts and the sale story from
 * research/invest-next/owner-answers-batch3.md (answers 1 to 6, rounds 2 and
 * 3). Owner rule 2026-09-06: the owner's name is never written on this page,
 * and nothing "sets" anything. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const HV = "/sell/home-value/";
const SC2740 = "https://www.scstatehouse.gov/code/t27c040.php";
const SC2750 = "https://www.scstatehouse.gov/code/t27c050.php";
const SC128 = "https://www.scstatehouse.gov/code/t12c008.php";
const DORRATE = "https://dor.sc.gov/tax/individual-income";
const I290 = "https://dor.sc.gov/forms-site/Forms/I290.pdf";
const I295 = "https://dor.sc.gov/forms-site/Forms/I295.pdf";
const TC409 = "https://www.irs.gov/taxtopics/tc409";
const I8824 = "https://www.irs.gov/instructions/i8824";
const P523 = "https://www.irs.gov/publications/p523";
const FHA = "https://www.hud.gov/hud-partners/single-family-handbook-4000-1";

module.exports = {
  url: "/sell/rental-property/",
  hub: { name: "Sell", url: "/sell/" },
  title: "Selling a Myrtle Beach Rental With Tenants in Place | Chapter3",
  description: "Selling a Myrtle Beach rental with a tenant or bookings in place: which buyers the lease allows, the deposit at closing, the 90-day booking rule, and withholding.",
  ogTitle: "Selling a Myrtle Beach rental with tenants or bookings in place",
  crumb: "Selling a rental",
  eyebrow: "Selling a rental?",
  h1: "How do you sell a Myrtle Beach rental with a tenant in place?",
  h1em: "Or with bookings on the calendar.",
  sub: "Which buyers can buy your rental depends on the lease. The deposit goes to the buyer, bookings inside 90 days transfer, and an out-of-state seller has tax withheld.",
  heroCta: { label: "Have us price the rental", href: HV },
  author: "tim",
  shortAnswer: "You can sell a rental with the tenant in it and with guests booked. The lease continues and the buyer becomes the landlord at closing. Which buyers can buy depends on the lease. Most lenders require the buyer to move in within 60 days of closing on an FHA, VA or USDA loan. A longer lease means an investor buyer, a wait, or a buyout. The security deposit and a written notice to the tenant move with the sale. On a vacation rental, the buyer takes the property subject to every booking that starts within 90 days of the deed being recorded. You must disclose every future booking in writing before the contract. Showings need 24 hours notice. If you live in another state, the buyer withholds state tax at closing at the top individual rate, 5.21 percent for a 2026 sale. Depreciation is taxed at the sale unless you exchange.",
  sections: [
    { h2: "What happens to the lease when you sell?", html:
      h.p(`The lease continues and the buyer becomes the landlord at closing. ${h.ext(SC2740, "State law")} relieves a seller who sells in good faith of liability under the lease for events after the tenant gets written notice of the sale. Until the tenant has that notice, you are still liable as the landlord.`) +
      h.p("The security deposit is the item sellers miss. The law does not say who sends the notice. It says you stay liable for the deposit unless two things happen. The deposit is transferred to the buyer, and the tenant is told in writing within a reasonable time. Both protect you, so you send the notice on closing day, with the buyer's name and address. Ask the closing attorney to show the deposit as a credit to the buyer on the settlement statement.") +
      h.p(`The buyer must also give the tenant, in writing, the name and address of the new owner or the person acting for the owner. ${h.a("/invest/landlord-rules/", "What the buyer must give the existing tenants")}. ${h.a("/invest/property-management/", "The deposit and notice rules, in full")}.`) },
    { h2: "Who can buy a house with a tenant in it?", html:
      h.p(`Anyone can buy it. The question is who can use it. A buyer who plans to live in the house usually has an FHA, VA or USDA loan. Most lenders require that buyer to move in ${h.ext(FHA, "within 60 days of closing")}. If the lease runs longer than that, the buyer cannot move in on time and cannot use that loan.`) +
      h.p("Our rule: with three to four months or less left on the lease, an owner-occupant buyer can close and wait. With more time left, you have three choices. Sell to an investor, who keeps the tenant. Wait until the lease ends, then sell to anyone. Pay the tenant to leave early, then sell to anyone.") +
      h.p(`Investors look at two things. The first is condition. A house the tenant kept up sells to a turnkey investor at full price. A damaged house sells to a repair-and-rent investor at a discount, so the damage costs you the repair and the discount. The second is cash flow. The investor pays today's price and today's taxes, so the rent covers less of the cost than it did for you. A house in an appreciating area still sells with modest cash flow. We have investors who buy exactly that. ${h.a("/buyers/property-taxes/", "How the sale resets the tax value")}.`) +
      h.p("A Chapter3 agent sold one this way. The seller had owned the house for 15 years and was moving to New York to be near his sister. He did not want to manage a rental from that distance, or pay someone else to. The lease had eight months left. The house was in good condition and in an appreciating area. His cash flow was over $1,200 a month. The next owner's would be about half, because the buyer would pay today's taxes and carry a larger loan. We did not offer the tenant a buyout. A buyout was the fallback if no investor came, to reach owner-occupant buyers. The agent marketed the house to our list of investors who accept modest cash flow in an appreciating area. A cash buyer closed 13 days after the listing date.") },
    { h2: "How do showings work with a tenant in place?", html:
      h.p(`${h.ext(SC2740, "The tenant cannot unreasonably refuse")} entry to show the home to prospective buyers. You must give at least 24 hours notice and enter only at reasonable times. You cannot use showings to harass the tenant, and the tenant cannot change the locks without your permission. We do everything the statute allows to show the house well, and nothing more.`) +
      h.p(`Selling is not a reason the law accepts for ending a lease. A month-to-month tenancy ends on 30 days written notice. A fixed lease runs to its end date or ends by a paid buyout. ${h.a("/invest/landlord-rules/", "Why you cannot evict a tenant to sell")}.`) +
      h.p("The tenant is not paid for showings unless you choose to pay or the lease says so. Sometimes a buyout costs less: a written agreement that pays the tenant to leave on a date before the lease ends. You cannot control the condition of the house on showing day. Set showing windows the tenant agrees to, two or three a week, and keep to them. A tenant who is treated well shows a clean home. Tell the tenant in writing what happens to the lease at the sale, because that is the question every tenant asks first.") },
    { h2: "What happens to bookings on a vacation rental?", html: (bg) =>
      h.p(`${h.ext(SC2750, "The state's vacation rental law")} covers it. The buyer takes the property subject to every vacation rental agreement for stays that begin within 90 days of the day the deed is recorded. The rental management agreement transfers for those stays too. A guest whose stay begins later than that has no right to it, and is due a refund within 45 days of the recording.`) +
      h.p("Two duties fall on you as the seller. Before the contract is ratified, you must disclose to the buyer in writing every future period the property is booked. Within 14 days of the contract, and again within 14 days of closing, you must give the rental management company the buyer's name and address. A seller who knowingly skips either is liable to the guest for actual damages.") +
      h.p(`Most rental programs here are in oceanfront short-term buildings. Expect the association's charges at closing: a transfer fee, and often a few months of dues paid in advance. Those charges are common in any association, with or without a program. A building where most units are investor-owned is usually non-warrantable, so the buyer needs ${h.a("/invest/non-warrantable-condos/", "a non-warrantable condo loan")}. The same fact tells the buyer the building is run for investors. ${h.a("/sell/sell-my-condo/", "Selling a condo with bookings in place")}. ${h.a("/invest/rental-program-vs-airbnb/", "What the program agreement says")}.`) +
      h.cta("Selling a unit in a rental program?", "Send the address and the program's name. We read the exit terms and the booking calendar with you before the listing goes live.", "Have us price the rental", HV, bg) },
    { h2: "What must you disclose?", html:
      h.p(`The state disclosure statement covers a rental. None of its exemptions names a rental or a tenant-occupied home. ${h.ext(SC2750, "The statement must say")} whether a rental, rental management, vacation rental or other lease contract will be in place at closing. It must also list any utility charges the tenant owes that you know of. You deliver it before the buyer signs the contract.`) +
      h.p(`The Commission's form has a section for it: the lease terms, the bookings that start within 90 days of recording, and the management company's name. "Owner occupied" on that form is a status box, not an exemption. ${h.a("/sell/fsbo/", "Filling out the disclosure form")}.`) },
    { h2: "What does the state withhold from an out-of-state seller?", html:
      h.p(`If your permanent home is outside South Carolina on the day of the sale, ${h.ext(SC128, "the buyer must withhold state income tax")} from your proceeds. The amount is the state's top individual income tax rate applied to your gain, if you give the buyer a signed affidavit of the gain. Without the affidavit it applies to the whole amount realized. A corporation is withheld at 5 percent.`) +
      h.p(`${h.ext(DORRATE, "The top individual rate")} is 6 percent for a 2025 sale and 5.21 percent for a 2026 sale. The withholding is capped at your net proceeds, and the buyer remits it by the 15th of the following month. It is a prepayment credited on your state return. ${h.ext(I290, "The buyer's form")} and ${h.ext(I295, "the seller's affidavit")} are the two documents. We work with several closing attorneys who prepare both.`) +
      h.p(`Two cases withhold less. Gain excluded as a principal residence is not withheld, but a rental you never lived in has none. A 1031 exchange with a replacement property identified at the sale is not withheld; without an identified replacement, it is. ${h.a("/sell/capital-gains/", "The withholding and gain calculator")}.`) },
    { h2: "What tax comes due on the gain?", html: (bg) =>
      h.p(`Two federal taxes apply. The gain from the depreciation you took is taxed at ${h.ext(TC409, "up to 25 percent")}. The rest of the gain is taxed at the capital gains rates. The home-sale exclusion does not apply to a property you never lived in. If you lived in it and then rented it, ${h.ext(P523, "the years it was a rental after 2008 are nonqualified use")}. The depreciation after 1997 is never excludable.`) +
      h.p(`A 1031 exchange defers both. ${h.ext(I8824, "You identify the replacement within 45 days")} of the sale and receive it within 180 days, or by your return due date if that comes first. The 45 days start on closing day, so choose the replacement before you list. ${h.a("/invest/strategies/1031-exchange/", "How we run a 1031 here")}. ${h.a("/invest/cost-segregation/", "What recapture costs after a cost segregation study")}.`) +
      h.cta("Want the net figured before you list?", "Send the address, the lease and the depreciation you have taken. We show your net after closing costs, withholding and the two taxes, and what an exchange changes.", "Have us price the rental", HV, bg) },
    { h2: "How do you price and market a rental?", html:
      h.p("Two buyer pools want different things. An investor wants the rent roll, the lease and the deposit ledger, and will buy with the tenant in place. An owner-occupant wants possession, so the lease end date is when that pool can buy. Price to the pool the lease allows.") +
      h.p("Three ways to sell it. Sell now with the tenant in place, to investors. Sell at lease end, to everyone. The third way is a written buyout that pays the tenant to leave early, which opens the wider pool sooner. We list the rent, the lease dates and the deposit in the listing package so an investor can run the numbers from the listing.") +
      h.p(`For a condo, the buyer can ask the association for a statement of what you owe, and unpaid assessments are paid from the price at closing. Clear them first. ${h.a("/sell/net-proceeds/", "Your net proceeds, line by line")}.`) },
  ],
  faqTitle: "Selling a rental FAQ",
  faq: [
    { q: "Can I sell a house with a tenant in it?", a: "Yes. The lease continues and the buyer becomes the landlord at closing. Give the tenant written notice of the sale and transfer the deposit to the buyer." },
    { q: "Can I sell my rental to a buyer with an FHA, VA or USDA loan?", a: "Only if the tenant will be out within about 60 days of closing, because most lenders require the buyer to move in within 60 days on those loans. With more months left on the lease, the buyer is an investor, or you wait for the lease to end, or you pay the tenant to leave." },
    { q: "Can I evict my tenant so I can sell?", a: "No. Selling is not one of the three grounds for ejectment. A month-to-month tenancy ends on 30 days written notice. A fixed lease runs to its end date or ends by a paid buyout." },
    { q: "How much notice do I give a tenant for a showing?", a: "At least 24 hours, at reasonable times. The tenant cannot unreasonably refuse, and you cannot use showings to harass." },
    { q: "What happens to my Airbnb bookings when I sell?", a: "The buyer takes the property subject to every booking that starts within 90 days of the deed being recorded, and to the management agreement for those stays. Later guests get a refund within 45 days. You must disclose every future booking in writing before the contract." },
    { q: "How much does South Carolina withhold from an out-of-state seller?", a: "The top individual income tax rate, which is 5.21 percent for a 2026 sale. It applies to the gain if you give the buyer a signed affidavit of gain, or to the whole sale price if you do not. It is a prepayment credited on your state return." },
    { q: "Do I pay tax on depreciation when I sell a rental?", a: "Yes. The gain from depreciation is taxed at up to 25 percent, and the rest at capital gains rates. A 1031 exchange defers both if you identify a replacement within 45 days and close within 180." },
  ],
  sources: [
    { name: "South Carolina Code, residential landlord and tenant", href: SC2740 },
    { name: "South Carolina Code, property disclosure and vacation rentals", href: SC2750 },
    { name: "South Carolina Code 12-8-580, nonresident withholding", href: SC128 },
    { name: "SCDOR, individual income tax rates", href: DORRATE },
    { name: "HUD Handbook 4000.1, owner occupancy", href: FHA },
    { name: "IRS Topic 409, capital gains and losses", href: TC409 },
  ],
  sourcesNote: "Educational only, not legal or tax advice. The withholding rate moves with the state's top individual rate each year.",
  bottomCta: { h2: "Sell it with the lease in place or at lease end.", p: "Send the address and the lease dates. We price it both ways and tell you which buyer pool each one reaches.", label: "Have us price the rental", href: HV },
  keywords: "selling a rental property Myrtle Beach, sell house with tenants South Carolina, can I sell my house with a tenant to an FHA buyer, South Carolina nonresident seller withholding 2026, selling a vacation rental with bookings South Carolina",
  about: "Selling a Myrtle Beach rental property",
};
