/* /invest/section-8-rentals/ - renting to Housing Choice Voucher tenants in
 * Horry County. Rules read 2026-09-07 at law.cornell.edu (eCFR blocks fetches;
 * links point at eCFR). Local facts from mbhaonline.org and conwayhousingsc.org
 * the same day. FY2027 fair market rents from HUD's file, re-opened the same day.
 * Brokerage facts from research/invest-next/owner-answers-batch4.md, fact-checked
 * there; the developer story is anonymized. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const C503 = "https://www.ecfr.gov/current/title-24/section-982.503";
const C505 = "https://www.ecfr.gov/current/title-24/section-982.505";
const C402 = "https://www.ecfr.gov/current/title-24/section-982.402";
const C305 = "https://www.ecfr.gov/current/title-24/section-982.305";
const C451 = "https://www.ecfr.gov/current/title-24/section-982.451";
const C404 = "https://www.ecfr.gov/current/title-24/section-982.404";
const C552 = "https://www.ecfr.gov/current/title-24/section-982.552";
const C310 = "https://www.ecfr.gov/current/title-24/section-982.310";
const MBHA = "https://mbhaonline.org/housing_programs/housing_choice_voucher_program_(hcv)/index.php";
const MBHAAPP = "https://mbhaonline.org/applicants/applicant_information.php";
const CHA = "https://www.conwayhousingsc.org/housing-choice-vouchers";
const CHALL = "https://www.conwayhousingsc.org/landlords";
const FMR27 = "https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx";
const FMRDEF = "https://www.huduser.gov/portal/datasets/fmr.html";

module.exports = {
  url: "/invest/section-8-rentals/",
  title: "Section 8 Rentals in Horry County, SC | Chapter3",
  description: "Renting to Section 8 voucher tenants in Horry County: the two housing authorities, the payment standard by bedroom count, the inspection, and how you get paid.",
  ogTitle: "Renting to Section 8 voucher tenants in Horry County",
  crumb: "Section 8 rentals",
  eyebrow: "Voucher rentals",
  h1: "How does renting to a Section 8 voucher tenant work in Horry County?",
  h1em: "The payment standard, the inspection, the contract.",
  sub: "In Horry County the housing authority pays most of a voucher tenant's rent by direct deposit, up to a payment standard that depends on the bedroom count.",
  heroCta: { label: "Send the address", href: RTN },
  author: "devin",
  shortAnswer: "A Housing Choice Voucher, still called Section 8, pays part of a tenant's rent. Two housing authorities run the program in Horry County. The Housing Authority of Myrtle Beach covers its service area in the eastern county. The Conway Housing Authority covers Conway and the unincorporated county. The authority pays its share to you by direct deposit each month. The tenant pays the rest. The most the program pays depends on a payment standard for each bedroom count, between 90 and 110 percent of the federal fair market rent. For four bedrooms that rent is $1,981 this fiscal year. The house must pass an inspection first, and the rent must be reasonable for the area. We run the numbers before you offer.",
  sections: [
    { h2: "What is a Housing Choice Voucher?", html:
      h.p(`A Housing Choice Voucher is federal rent help that a low-income family uses in a privately owned rental. Most people still call it Section 8. The federal housing agency funds it and a local housing authority runs it. The family finds the house. You screen the family and rent to it. The authority pays part of the rent to you.`) +
      h.p(`The voucher carries a bedroom count. ${h.ext(C402, "The authority assigns it by family size")}, at the smallest number of bedrooms that houses the family without crowding. The family may rent a bigger or a smaller house than that count. The count matters because the most the program pays depends on it.`) +
      h.p(`The tenant pays a share of the rent from income, generally 30 to 40 percent of adjusted income. The authority pays the rest, up to its limit.`) },
    { h2: "Who runs the program in Horry County?", html:
      h.p(`Two authorities. ${h.ext(MBHA, "The Housing Authority of Myrtle Beach")} administers 660 vouchers. ${h.ext(MBHAAPP, "Its vouchers can be used only in its service area")}, which it describes as eastern Horry County. Its office is at 1704 North Oak Street in Myrtle Beach, 843-918-1525.`) +
      h.p(`${h.ext(CHA, "The Conway Housing Authority")} administers 373 vouchers for the City of Conway and the unincorporated parts of Horry County. Its office number is 843-248-7327.`) +
      h.p(`Which authority you deal with depends on the tenant's voucher, not on your address alone. A family with a Conway voucher rents in Conway or the unincorporated county. A family with a Myrtle Beach voucher rents inside that authority's service area. Ask which authority issued the voucher before you take an application.`) },
    { h2: "How much does a voucher pay?", html: (bg) =>
      h.p(`The program pays up to a payment standard for each bedroom count. ${h.ext(C503, "The rule puts the standard between 90 and 110 percent")} of the federal fair market rent for the area. An authority can go higher with federal approval. Each authority chooses its own number inside that range. Neither authority lists its standards on its website, so ask for the current table before you price the house.`) +
      h.table(["Bedrooms", "Fair market rent, federal fiscal year 2027"], [["Studio", "$1,155"], ["One", "$1,258"], ["Two", "$1,504"], ["Three", "$1,823"], ["Four", "$1,981"]]) +
      h.p(`${h.ext(FMR27, "Those are the federal figures for Horry County")}, ${h.ext(FMRDEF, "the 40th percentile of rents")} for standard units with utilities included. A standard at 110 percent of the four-bedroom figure is $2,179. The standard is the most the program counts toward the rent. The authority pays the standard minus the tenant's share. If you charge more than the standard, the tenant pays the extra, and at move-in the tenant's total share cannot exceed 40 percent of adjusted income.`) +
      h.p(`${h.ext(C505, "The standard the authority uses is the lower of two numbers")}: the bedroom count on the voucher and the bedroom count of your house. A four-bedroom house earns the four-bedroom standard only for a family whose voucher is for four bedrooms. Check that before you price the house at the top rate.`) +
      h.p(`${h.ext(C305, "The rent must also be reasonable")} compared with unassisted rentals of the same size and quality nearby. The authority checks that before it approves the lease, and it can refuse a rent above the market.`) +
      h.p(`In Chapter3's files a developer from Maryland buys three- and four-bedroom houses here that need work. He fixes them and rents them to voucher families. One house cost $220,000 to buy and repair. It is worth about $280,000 now and rents at the four-bedroom standard. The bedroom count is why he buys the bigger houses.`) +
      h.cta("Want the voucher rent for one address?", "Send the address. We check which authority covers it, the bedroom count on the county record and the current payment standard, and run the numbers before you offer.", "Send the address", RTN, bg) },
    { h2: "How do you get a house approved?", html:
      h.p(`Six steps, in order.`) +
      h.ol([
        `Screen the family the way you screen any tenant. The authority checks income for the program. It does not check the family for you. ${h.a("/invest/landlord-rules/", "The screening notices the law requires")}.`,
        `Complete the request for tenancy approval with the family. The Conway authority calls it the leasing packet.`,
        `Pass the inspection. ${h.ext(C305, "An authority this size must inspect within 15 days")} of the request. Conway says three to fifteen days. The inspector checks the federal housing quality standards: working heat, plumbing and electricity, no hazards, and a sound structure.`,
        `Pass the rent check. The authority compares your rent with unassisted rentals nearby and approves it or asks for a lower number.`,
        `Sign the contract. You sign a lease with the family and a housing assistance payments contract with the authority. ${h.ext(C305, "The contract must be signed within 60 days of the lease start")}, and the authority pays nothing before it is signed. Once it is signed the authority pays back to the lease start, up to 60 days.`,
        `Get paid. ${h.ext(CHALL, "The Conway authority pays by direct deposit")} each month. The family pays its share to you directly.`,
      ]) +
      h.p(`${h.ext(C404, "You must keep the house to the inspection standard")} for as long as you take the payments. The authority re-inspects. If you do not make a required repair within its deadline, it stops paying until you do.`) },
    { h2: "Does the government pay on time?", html:
      h.p(`Its share, yes. ${h.ext(C451, "The rule requires the authority to pay promptly when due")}, and the contract can charge the authority a late fee if local landlords charge one. In Chapter3's files the authority's share has arrived on time every month.`) +
      h.p(`The tenant's share is different. The family owes it under the lease like any rent, and it can be late like any rent. You collect it and, if you must, evict for it the same way you evict anyone. The first payment also waits for the contract, so plan for a gap between move-in and the first deposit.`) },
    { h2: "What happens if a voucher tenant damages the house?", html: (bg) =>
      h.p(`Report it to the authority in writing, and use the deposit and the courts the way you would with any tenant. ${h.ext(C404, "Damage beyond ordinary wear is a breach of the family's program obligations")}, and the authority must act on it under the rule.`) +
      h.p(`${h.ext(C552, "The authority may end the family's assistance")} for that breach. It must end it if you evict the family through the court for a serious lease violation. It may refuse the family a new voucher for five years after an eviction from assisted housing. It may also refuse while the family owes a housing authority money. The rule does not ban a family for life, so the deposit still matters.`) +
      h.p(`${h.ext(C310, "You can evict a voucher tenant")} for nonpayment of the family's share, for serious or repeated lease violations, and for other good cause. It goes through the magistrate court like any eviction. Send the authority a copy of the notice. ${h.a("/invest/landlord-rules/", "How an eviction works in Horry County")}.`) +
      h.cta("Buying a rental to hold long term?", "Tell us the budget and the bedroom count. We find houses that fit the payment standard and the inspection, and run the numbers before you offer.", "Start the search", "/contact/", bg) },
    { h2: "Which houses work best for voucher tenants?", html:
      h.p(`Three and four bedrooms, because the standard steps up with each bedroom and families with children hold the larger vouchers. Houses that need work, bought below the price of a finished house, because the inspection tests safety and function, not finishes.`) +
      h.p(`Check the house against the standard before you buy: heat, plumbing, electrical, windows, railings, smoke alarms and the roof. Fixing those first is cheaper than a failed inspection and a lost month.`) },
  ],
  faqTitle: "Section 8 rental FAQ",
  faq: [
    { q: "Who pays the rent on a Section 8 rental?", a: "The housing authority pays its share by direct deposit each month, and the tenant pays the rest directly to you. The authority's share is the payment standard minus the tenant's share, or the rent minus the tenant's share if the rent is lower." },
    { q: "How much does Section 8 pay for a 3 bedroom in Horry County?", a: "The federal fair market rent for three bedrooms is $1,823 for fiscal year 2027. Each housing authority adopts a payment standard between 90 and 110 percent of it. Ask the authority for its current table. The tenant's share comes out of that number." },
    { q: "Can I evict a Section 8 tenant?", a: "Yes, for nonpayment of the tenant's share, for serious or repeated lease violations, and for other good cause, through the court like any eviction. Send the housing authority a copy of the notice." },
    { q: "Does a tenant lose the voucher for damaging the house?", a: "The authority may end assistance for damage beyond ordinary wear, and it must end it if you evict the family through the court for a serious lease violation. It may refuse a new voucher for five years after such an eviction, and while the family owes a housing authority money." },
    { q: "Which housing authority covers my rental?", a: "The Housing Authority of Myrtle Beach for its service area in eastern Horry County, and the Conway Housing Authority for the City of Conway and the unincorporated county. The tenant's voucher names the authority." },
  ],
  sources: [
    { name: "24 CFR 982.503, payment standards", href: C503 },
    { name: "982.505, the lower-of rule", href: C505 },
    { name: "982.402, subsidy standards", href: C402 },
    { name: "982.305, approval and timing", href: C305 },
    { name: "982.451, the payments contract", href: C451 },
    { name: "982.404, damage and maintenance", href: C404 },
    { name: "982.552, denial and termination", href: C552 },
    { name: "982.310, owner eviction", href: C310 },
    { name: "Housing Authority of Myrtle Beach", href: MBHA },
    { name: "Conway Housing Authority", href: CHA },
    { name: "HUD, fair market rents FY2027", href: FMR27 },
  ],
  sourcesNote: "Educational only, not legal advice. Payment standards change each year; confirm the current table with the authority.",
  bottomCta: { h2: "Run the voucher rent before you offer.", p: "Send the address. We check the authority, the bedroom count and the payment standard, and run the numbers.", label: "Send the address", href: RTN },
  keywords: "Section 8 rentals Horry County, housing choice voucher landlord Myrtle Beach, Conway Housing Authority landlord, Section 8 payment standard Horry County, renting to voucher tenants South Carolina",
  about: "Renting to Housing Choice Voucher tenants in Horry County",
};
