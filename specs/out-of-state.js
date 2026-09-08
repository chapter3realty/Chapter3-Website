/* /invest/out-of-state/ - buying a Grand Strand rental without visiting.
 * Facts: research/invest-next/out-of-state-facts.md, each source re-opened
 * 2026-09-06 before this spec was written. Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";

module.exports = {
  url: "/invest/out-of-state/",
  datePublished: "2026-09-06",
  title: "Buying a Myrtle Beach Rental From Out of State | Chapter3",
  description: "How to buy a Myrtle Beach rental without flying in: the video walk-through, the inspection, the attorney closing by mail, and management set up before you close.",
  ogTitle: "Buying a Myrtle Beach rental from out of state, without flying in",
  crumb: "Buying from out of state",
  eyebrow: "Remote buyers",
  h1: "How do you buy a Myrtle Beach rental from out of state?",
  h1em: "Without flying in.",
  sub: "Many Grand Strand rental owners live in another state. The walk-through, the inspection and the closing can all be done without a flight to Myrtle Beach.",
  heroCta: { label: "Send us the address", href: RTN },
  author: "tim",
  shortAnswer: "You can buy a Grand Strand rental without visiting. A buyer in Canada has <a href=\"/invest/canadian-buyers/\" style=\"color:var(--navy);text-decoration:underline\">four extra steps</a>. A local agent walks the property on video. A licensed home inspector reports on it. A South Carolina attorney runs the closing, and you sign the papers in your own state before a notary with two witnesses. Flood insurance starts on the day the loan closes. Property tax is charged at the 6 percent rate because the property is not your legal residence. Two things go wrong for remote buyers: wire fraud, and a signing package that does not meet South Carolina form. Both are avoidable.",
  sections: [
    { h2: "What does buying from out of state involve?", html:
      h.p("Five steps have to happen in South Carolina while you are somewhere else. Each one has a person here who does it.") +
      h.table(["Step", "Who does it here", "What you do"], [
        ["Seeing the property", "A Chapter3 agent walks it on video and checks the things that do not show up in the photos.", "Watch, ask, and decide."],
        ["Inspection", "A licensed South Carolina home inspector writes the report.", "Read the report as issued and decide what to ask for."],
        ["Title, documents and closing", "A South Carolina attorney. State law requires it.", "Choose the attorney, or ask us which attorneys close for buyers who are not in the room."],
        ["Signing", "The attorney sends the package to you.", "Sign in your state before a notary, with two witnesses, or name an agent under a power of attorney."],
        ["Money", "The closing attorney receives the funds.", "Wire it after a phone call to a number you already had, never from an email."],
        ["Utilities and management", "The utility and the manager you chose.", "Set both up before closing so the first guest or tenant can arrive."],
      ]) },
    { h2: "Why does South Carolina require an attorney at closing?", html:
      h.p(`South Carolina treats a real estate closing as the practice of law. The title search, the documents, the closing itself and the recording must be done or supervised by a South Carolina attorney. ${h.ext("https://www.sccourts.org/media/opinions/HTMLFiles/SC/26214.htm", "The state's highest court set that rule")}, and it applies to cash buyers as well as financed ones.`) +
      h.p(`You do not pick a title company here. You pick an attorney. The attorney orders the title search, prepares the deed, collects the money, pays the seller and records the deed. The fee is part of your closing costs. ${h.a("/buyers/closing-costs/", "What closing costs in South Carolina include")}.`) },
    { h2: "How do you sign without being in South Carolina?", html: (bg) =>
      h.p("There are two ways. The attorney chooses which one the file can use, and your lender has a say if there is a loan.") +
      h.h3("Sign by mail in your own state") +
      h.p(`The attorney sends the closing package to you. You sign before a notary in your state, and two witnesses sign with you. The notary writes the state of the commission and its expiry date. ${h.ext("https://www.scstatehouse.gov/code/t30c005.php", "South Carolina accepts a deed acknowledged before an out-of-state notary")} when it carries those two witnesses. A package signed with one witness comes back, and the closing slips.`) +
      h.h3("Give someone a power of attorney") +
      h.p("You sign a power of attorney naming a person who signs at the closing for you. It is signed with the same formality as a will, acknowledged like a deed, and recorded with the county for a fee. The attorney drafts it. Ask early, because a lender can refuse a power of attorney on some loan types.") +
      h.h3("What about a notary on a video call?") +
      h.p(`Not with a South Carolina notary. ${h.ext("https://sos.sc.gov/services-and-filings/notaries", "South Carolina notary law")} requires the signer and the notary to be in the same room. Ask the closing attorney whether they accept a video notarization done under another state's law before you count on it.`) +
      h.cta("Buying from another state?", "Send the address and your timeline. We tell you which signing method fits and what to prepare.", "Send the address", RTN, bg) },
    { h2: "How do you see a Myrtle Beach property without visiting?", html:
      h.p("On video, with a person who is in the unit and answers while you watch. Ask for these: the view from every window, the noise at the door, and the age plates on the HVAC and the water heater. In a condo, ask for the parking, the elevator and the hallways. In a house, ask for the lot drainage and the street.") +
      h.p(`Then the inspection. ${h.ext("https://llr.sc.gov/res/homeinspector.aspx", "South Carolina licenses home inspectors")}. A licensed inspector reports on what a video cannot show: the roof, the electrical panel, the crawlspace, the plumbing under the sinks. You get the report as issued. What you ask the seller to fix or credit comes from that report, not from the photos.`) },
    { h2: "How do you keep the closing money safe?", html:
      h.p(`The attack is an email that looks like it came from the attorney or the agent, with new wire instructions. It arrives the week of closing. ${h.ext("https://www.consumerfinance.gov/about-us/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/", "Federal guidance")} is plain: never follow wire instructions in an email. Confirm the account name and number by phone, on a number you had before the email arrived.`) +
      h.p("Do this once, at the start. Get the attorney's phone number in person or from a document you trust. Wire only after a call to that number. A change in instructions is a stop, not a step.") },
    { h2: "What is different for an owner who lives in another state?", html:
      h.p(`Property tax. A rental you do not live in is assessed at ${h.ext("https://www.horrycountysc.gov/departments/assessor/guide-to-assessment/", "the 6 percent rate")}. The 4 percent rate is for a legal residence, needs an application, and does not apply to a rental. ${h.a("/buyers/property-taxes/", "How Horry County property tax is calculated")}.`) +
      h.p(`Flood insurance. A new flood policy starts ${h.ext("https://www.floodsmart.gov/get-insured/buy-a-policy", "30 days after you buy it")}, unless you buy it as part of a loan closing. A cash buyer gets no exception and should buy the policy a month before closing. ${h.a("/buyers/coastal-insurance/", "Wind, flood and the coastal insurance bill")}.`) +
      h.p(`Rental taxes and licenses. A short-term rental needs a business license and pays accommodations tax. If a platform takes the payment, the platform remits. ${h.a("/invest/accommodations-tax/", "Accommodations tax, explained")}.`) },
    { h2: "Who turns on the power and water?", html:
      h.p("Electricity comes from Santee Cooper or Horry Electric Cooperative, depending on the address. Inside the cities of Myrtle Beach and North Myrtle Beach, the city bills water and sewer. Elsewhere it is Grand Strand Water and Sewer Authority. Natural gas, where it exists, is Dominion Energy.") +
      h.p("Each utility wants an application, a copy of the settlement statement, and a deposit. The seller's last bills tell you which utilities serve the address. Ask for them with the disclosure.") },
    { h2: "How is management set up before closing?", html: (bg) =>
      h.p(`For a remote owner the manager is the local contact for guests, tenants and repairs. South Carolina requires a manager to be licensed and to keep deposits in a trust account. ${h.a("/invest/property-management/", "How to choose a property manager here")}. For an oceanfront condo, compare the building's own program with self-managing before you offer. ${h.a("/invest/rental-program-vs-airbnb/", "Rental program or Airbnb")}.`) +
      h.p("If you keep the seller's tenant, the lease and the security deposit transfer to you at closing. The tenant must be told in writing who now owns the property and who manages it.") +
      h.cta("Want the whole thing set up before you close?", "Tell us the address and the plan. We walk it, run the numbers, and line up the closing attorney, the inspector and the manager.", "Send the address", RTN, bg) },
  ],
  faqTitle: "Out-of-state buyer FAQ",
  faq: [
    { q: "Do I have to come to South Carolina to close?", a: "No. You can sign the closing package in your own state before a notary, with two witnesses, or give someone a power of attorney. A South Carolina attorney still runs the closing." },
    { q: "Can I sign the deed on a video call with a notary?", a: "Not with a South Carolina notary. State law requires the signer and the notary to be in the same room. Ask the closing attorney whether they accept a video notarization done under another state's law." },
    { q: "Who holds my earnest money?", a: "Usually the closing attorney's trust account or the brokerage's escrow account. The contract says which. Confirm the wire instructions by phone before you send it." },
    { q: "Why is my property tax higher than the seller's?", a: "The seller may have paid the 4 percent legal-residence rate. A rental you do not live in is assessed at 6 percent. The bill is higher than the seller's for the same property." },
    { q: "Do I need flood insurance if I pay cash?", a: "A lender requires it in a high-risk zone. A cash buyer chooses. A new policy starts 30 days after purchase unless it is bought with a loan closing, so a cash buyer should buy it a month before closing." },
  ],
  sources: [
    { name: "South Carolina Supreme Court, closings under attorney supervision", href: "https://www.sccourts.org/media/opinions/HTMLFiles/SC/26214.htm" },
    { name: "South Carolina Code 30-5-30, recording", href: "https://www.scstatehouse.gov/code/t30c005.php" },
    { name: "South Carolina Secretary of State, notaries", href: "https://sos.sc.gov/services-and-filings/notaries" },
    { name: "CFPB, mortgage closing scams", href: "https://www.consumerfinance.gov/about-us/blog/mortgage-closing-scams-how-protect-yourself-and-your-closing-funds/" },
    { name: "FEMA, when flood coverage starts", href: "https://www.floodsmart.gov/get-insured/buy-a-policy" },
  ],
  sourcesNote: "Educational only, not legal advice. The closing attorney decides what the file needs.",
  bottomCta: { h2: "You do not need a flight to buy here.", p: "Send the address. A local agent walks it on video, runs the numbers and tells you what the closing needs from you.", label: "Send the address", href: RTN },
  keywords: "buying investment property in Myrtle Beach from out of state, out of state investor Myrtle Beach, buy a rental property remotely South Carolina, mail-away closing South Carolina",
  about: "Buying Myrtle Beach investment property remotely",
};
