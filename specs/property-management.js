/* /invest/property-management/ - choosing a manager for a Grand Strand rental.
 * Facts: research/invest-next/property-management-facts.md, each cited
 * source re-opened 2026-09-06. Chapter3 is never described as managing
 * property; whether it refers managers is an open owner question. No local
 * fee range is stated because no primary source exists for one. Built by
 * tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const SC4057 = "https://www.scstatehouse.gov/code/t40c057.php";
const SC2740 = "https://www.scstatehouse.gov/code/t27c040.php";

module.exports = {
  url: "/invest/property-management/",
  title: "Myrtle Beach Property Management: What It Costs | Chapter3",
  description: "How to choose a property manager for a Myrtle Beach rental: the license the state requires, the fees, the trust account, the deposit rules and what to ask.",
  ogTitle: "Property management in Myrtle Beach: what it costs and what to ask",
  crumb: "Property management",
  eyebrow: "Managers, fees, deposits",
  h1: "What does property management cost in Myrtle Beach?",
  h1em: "What to ask before you sign.",
  sub: "A licensed manager charges a share of the rent, plus leasing and renewal fees. South Carolina sets the license, the trust account and the deposit rules.",
  heroCta: { label: "Send the address", href: RTN },
  author: "tim",
  shortAnswer: "A property manager finds the tenant or the guest, collects the rent, handles repairs and returns the deposit. In South Carolina the manager must hold a real estate license or a property manager license. The manager works under a manager-in-charge and keeps your tenant's deposit in a trust account. Long-term managers charge a share of the monthly rent plus a fee to place a tenant. Short-term managers charge a share of each booking. The fee you agree to changes every number on the property, so settle it before you offer. We run the numbers with the real fee in.",
  sections: [
    { h2: "What is a property manager?", html:
      h.p("A property manager is a person or a company that rents out your property for a fee. For a long-term rental that means advertising, screening applicants, signing the lease, collecting rent, arranging repairs and handling the move-out. For a short-term rental it means pricing, bookings, guest messages, cleaning between stays and the tax filings.") +
      h.p("Managing your own property needs no license. Managing someone else's for a fee does. An oceanfront building's own rental desk is a property manager too, with its own agreement. " + h.a("/invest/rental-program-vs-airbnb/", "Rental program or Airbnb, compared") + ".") },
    { h2: "What license does a South Carolina property manager need?", html:
      h.p(`${h.ext(SC4057, "State law")} makes it unlawful to act as a property manager without an active license. Two licenses qualify: a real estate broker license, or a property manager license, which covers renting and leasing only. Every manager works under a broker-in-charge or a property manager-in-charge, the person responsible for the trust account.`) +
      h.p(`Ask for the license number and the name of the manager-in-charge. ${h.ext("https://llr.sc.gov/re/", "The state commission")} that licenses managers has a public lookup. An unlicensed person may not negotiate a lease, approve an application, or explain the management agreement to you.`) },
    { h2: "Where does the tenant's deposit go?", html:
      h.p(`Into the manager's trust account, and it stays there until the lease ends. ${h.ext(SC4057, "State law")} requires the manager-in-charge to keep a bank account titled with the word trust or escrow. Security deposits, pet deposits and advance rent stay in it for the whole lease. Rent is paid out to you after the bank clears it.`) +
      h.p(`The return rules bind you as the owner. ${h.ext(SC2740, "Any deduction must be itemized")} in a written notice to the tenant, with the balance, within 30 days after the tenant moves out and asks for it. An owner who fails to send the notice can owe three times the amount withheld plus the tenant's attorney fees.`) +
      h.p("When you buy a rental with a tenant in place, that duty transfers to you at closing. Get the deposit, the lease and the move-in condition report from the seller through the closing attorney.") },
    { h2: "What does a manager charge?", html: (bg) =>
      h.p("The fee is a share of the money the property earns, plus fees for specific work. The share is in the agreement, not on any website, and it varies by manager. Ask for every line in writing before you offer on the property.") +
      h.table(["Fee", "Long-term rental", "Short-term rental"], [
        ["The share", "A percentage of each month's collected rent.", "A percentage of each booking. One national company publishes 10 and 15 percent plans; on-site programs set their own share in the program agreement."],
        ["Placing a tenant or a guest", "A leasing fee, often a share of the first month's rent.", "Inside the booking share."],
        ["Renewal", "Some managers charge when a tenant renews. State law requires that fee in underlined capitals on page one.", "None."],
        ["Cleaning and supplies", "None between tenants beyond the turnover you approve.", "Per stay, charged to the guest or to you."],
        ["Repairs", "Ask for the spending limit that needs your approval, and any markup on invoices.", "Same."],
        ["Setup", "Sometimes a one-time fee.", "Sometimes a one-time fee. The published plans above charge one."],
      ]) +
      h.p(`${h.ext("https://evolve.com/owner/vacation-rental-management", "The published 10 and 15 percent plans")} are one company's national pricing, not a Myrtle Beach average. On a short-term rental, the manager's fees count as part of the rent for accommodations tax.`) +
      h.cta("Have the numbers run with the real fee.", "Send the address and the plan. We run rent, taxes, insurance, dues and the management fee together before you offer.", "Send the address", RTN, bg) },
    { h2: "What must the management agreement say?", html:
      h.p(`${h.ext(SC4057, "State law")} requires a written agreement. It must name the parties, identify the property, state how the manager is paid, state the renewal terms and any renewal pay, and set the terms for tenants. An automatic renewal is allowed only with a clause that lets either side cancel on 30 days' notice once the first term ends.`) +
      h.p("Two protections are written for the owner. Pay for a future lease renewal must be printed in underlined capital letters on the first page. The agreement may not bind you to list the property for sale with the same firm later. A sale needs a separate listing agreement.") },
    { h2: "What must the tenant be told?", html:
      h.p(`${h.ext(SC2740, "State law")} requires a written notice to the tenant at or before the start of the lease. It names the owner, or the person authorized to act for the owner, with an address. The manager usually sends it. If the manager signs the lease and fails to disclose, the manager becomes your agent for that lease.`) +
      h.p("When you buy a rental with a tenant, send that notice after closing. It tells the tenant where the rent goes and who to call.") },
    { h2: "Who files the taxes and licenses on a short-term rental?", html:
      h.p(`Whoever takes the payment remits the state accommodations tax. ${h.ext("https://dor.sc.gov/tax/accommodations", "The state's rule")} is that the person or business who books the stay collects and pays. A manager who books and takes payment remits on the full booking. You need no retail license if you rent only through a manager or a platform. Book a guest yourself and you remit that stay's tax.`) +
      h.p(`${h.ext("https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/", "Horry County's hospitality fee")} is 3 percent of rent outside the city limits and 1.5 percent inside. The county tells owners to make sure the manager is collecting and remitting it. ${h.ext("https://www.cityofmyrtlebeach.com/careers/business/business_faq.php", "The City of Myrtle Beach")} requires a business license for every rental property, short-term or long-term. ${h.a("/invest/accommodations-tax/", "Accommodations tax and licenses, explained")}. ${h.a("/invest/str-setup/", "Every account a short-term rental needs, in order")}.`) },
    { h2: "What should you ask before you sign?", html: (bg) =>
      h.ul([
        "The license number, the manager-in-charge, and the bank that holds the trust account.",
        "Every fee, in writing: the share, the leasing fee, renewals, setup, per-stay charges, and any markup on repairs.",
        "The spending limit for repairs without your approval.",
        `How applicants are screened. ${h.ext("https://www.hud.gov/helping-americans/fair-housing-act-overview", "Federal fair housing law")} applies to every rental, and the manager screens under it.`,
        "How often you get a statement, and what is on it.",
        "How many units the manager runs in your building or your neighborhood, and how fast a guest or tenant gets a response.",
        "The term, the exit notice, and what happens to a tenant or to bookings on the calendar when you leave.",
        "Whether the manager files the county fee and the city license for you, or you do.",
      ]) +
      h.p("Ask for a sample owner statement and a sample lease. Read the management agreement before you offer on the property, not after closing.") +
      h.cta("Reading an agreement now?", "Send it with the address. We read the fee lines and the exit terms with you and run the numbers with them in.", "Send the address", RTN, bg) },
    { h2: "How is the manager set up before closing?", html:
      h.p("Tell us the plan when you send the address. We run the numbers with the manager's fee in, and we read the owner-use and exit terms of any agreement with you before you sign. For an oceanfront condo, we request the building's program agreement and a recent owner statement with the association documents.") +
      h.p("On closing day the deposit, the lease and the tenant notice change hands with the keys. Settle who sends what before that day.") },
  ],
  faqTitle: "Property management FAQ",
  faq: [
    { q: "Do I need a property manager for a Myrtle Beach rental?", a: "No. An owner may manage their own property without a license. A manager makes sense when you live elsewhere, when the building has a rental desk, or when you do not want the calls." },
    { q: "What license must a property manager have in South Carolina?", a: "A real estate broker license or a property manager license, and they must work under a broker-in-charge or property manager-in-charge who is responsible for the trust account." },
    { q: "Where is my tenant's security deposit kept?", a: "In the manager's trust account until the lease ends. State law requires it. When the tenant leaves, any deduction must be itemized in writing within 30 days." },
    { q: "Who pays the accommodations tax when a manager books the guest?", a: "The manager, on the full booking, because the manager takes the payment. You remit the tax only on stays you book yourself, and then you need a retail license." },
    { q: "Can the management agreement renew automatically?", a: "Only with a clause that lets either side cancel on 30 days' notice after the first term ends. State law requires that clause." },
  ],
  sources: [
    { name: "South Carolina Code, real estate licensing and trust accounts", href: SC4057 },
    { name: "South Carolina Code, residential landlord and tenant", href: SC2740 },
    { name: "South Carolina Department of Revenue, accommodations tax", href: "https://dor.sc.gov/tax/accommodations" },
    { name: "Horry County, hospitality fee", href: "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/" },
    { name: "HUD, Fair Housing Act overview", href: "https://www.hud.gov/helping-americans/fair-housing-act-overview" },
  ],
  sourcesNote: "Educational only, not legal advice. No Myrtle Beach fee average is published anywhere we could verify; the agreement is the only source for your fee.",
  bottomCta: { h2: "Settle the management fee before you offer.", p: "Send the address and the plan. We run the numbers with the manager's real fee and read the agreement with you.", label: "Send the address", href: RTN },
  keywords: "property management Myrtle Beach, Myrtle Beach property management fees, property manager Myrtle Beach rental, South Carolina property manager license",
  about: "Property management for Myrtle Beach rentals",
};
