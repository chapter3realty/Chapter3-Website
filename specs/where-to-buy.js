/* /invest/where-to-buy/ - nine Grand Strand areas for a rental investor, by
 * strategy. Facts: research/invest-next/where-to-buy-facts.md; every cited
 * source re-opened by the writer 2026-09-06. A1: this page is a decision
 * table that links to /invest/str-rules/ and the submarket guides; it does
 * not restate the rules. No price figures: the MLS statistics source could
 * not be re-opened, so prices link to the market report. Built by
 * tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const RTN = "/invest/run-the-numbers/";
const PZ = "https://www.cityofmyrtlebeach.com/departments/planning_and_zoning_department.php";
const STRC = "https://cms6.revize.com/revize/myrtlebeachsc/07.%202024-069%20Conversion%20Overlay_Short%20Term%20Rentals%20(2nd).pdf";
const NMBSTR = "https://nmb.us/833/Short-term-Rentals";
const SURFBL = "https://www.surfsidebeach.org/180/Business-Licensing";
const SURFZ = "https://surfsidebeach.org/AgendaCenter/ViewFile/Item/1246?fileID=6196";
const HORRY = "https://www.horrycountysc.gov/departments/treasurer/hospitality-fee/";
const HORRYBL = "https://horrycountysc.gov/departments/treasurer/business-license/application-instructions/";
const GTTAX = "https://gtcountysc.gov/351";
const GTFAQ = "https://www.gtcountysc.gov/m/faq?cat=68";
const GTDEF = "https://gtcountysc.gov/DocumentCenter/View/1347";
const GTGRR = "https://gtcountysc.gov/DocumentCenter/View/261";
const CONWAYBL = "https://www.conwaysc.gov/business/business_license/index.php";
const CONWAYUDO = "https://www.conwaysc.gov/Current%20UDO%20(7.20.26).pdf";
const CENSUS = "https://www2.census.gov/geo/docs/reference/codes2020/place_by_cou/st45_sc_place_by_county2020.txt";
const SC61 = "https://www.scstatehouse.gov/code/t06c001.php";

module.exports = {
  url: "/invest/where-to-buy/",
  title: "Where to Buy a Rental on the Grand Strand | Chapter3",
  description: "Nine Grand Strand areas compared for a rental investor: which county, whether nightly rentals are allowed, who licenses it, and what local taxes apply. By strategy.",
  ogTitle: "Where to buy a rental on the Grand Strand, by strategy",
  crumb: "Where to buy",
  eyebrow: "Nine areas, one table",
  h1: "Where should you buy a rental on the Grand Strand?",
  h1em: "Nightly, monthly or yearly.",
  sub: "Nightly rentals are banned in most Grand Strand neighborhoods. The table shows where a rental property can be rented nightly in nine areas, plus the license and taxes.",
  heroCta: { label: "Send the address", href: RTN },
  author: "tim",
  shortAnswer: "Start with the strategy, because the rules differ by town. Nightly rentals are legal in North Myrtle Beach and in the resort zones of Myrtle Beach. They are legal in two districts of Surfside Beach, and in unincorporated Horry County where the covenants allow. They are banned in the city's residential neighborhoods and limited to three districts in Conway. Monthly and yearly rentals are legal everywhere. The county matters too. Georgetown County has no business license and a 30-day tax threshold. Horry County licenses every business and uses 90 days. The table has all nine areas. Send us the address and we check the row for it.",
  sections: [
    { h2: "Which strategy are you buying for?", html:
      h.p(`Three strategies need three different places. A nightly rental needs zoning that allows it, a building or covenants that allow it, and guests. A furnished monthly rental needs a hospital or an employer nearby and a 90-day floor. A yearly rental needs year-round tenants and a low price of entry. ${h.a("/invest/str-vs-ltr/", "Short-term against long-term")}, ${h.a("/invest/mid-term-rentals/", "mid-term rentals")} and ${h.a("/invest/long-term-rental/", "the investor analyzer")} cover the numbers for each.`) +
      h.p("The table below answers four questions for each area. Which county is it in? Are nightly rentals allowed? Who licenses a rental? Which local taxes sit on top of the state's 7 percent on stays under 90 days?") },
    { h2: "How do the nine Grand Strand areas compare?", html:
      h.table(["Area", "County", "Nightly rentals", "License", "Local levies on top of the state tax", "Fits"], [
        ["City of Myrtle Beach", "Horry", `Only in the zones marked for it. ${h.ext(PZ, "Residential zones bar stays under 90 days")}. Since December 2024, ${h.ext(STRC, "oceanfront buildings of more than two units")} built for nightly rental may not be leased for 90 days or more.`, "City license for every rental; renewals due April 30", "City 0.5 percent plus a 1 percent fee; county 1.5 percent", "Nightly in the resort zones; yearly in the neighborhoods"],
        ["North Myrtle Beach", "Horry", `${h.ext(NMBSTR, "No special zoning or permit")} beyond the license. A stay under 90 days is a short-term rental.`, "City license, May 1 to April 30", "City 1.5 percent; county 1.5 percent", "Nightly citywide, subject to the covenants"],
        ["Surfside Beach", "Horry", `${h.ext(SURFZ, "Stays under 30 days only in the R3 and C3 districts")}. Yearly rentals in every residential district.`, `${h.ext(SURFBL, "Town license; every rental is a business")}; renewals due April 30`, "Town 0.5 percent plus a 1 percent fee; county 1.5 percent", "Nightly in two districts; yearly elsewhere"],
        ["Garden City Beach (Horry side), Carolina Forest, Socastee, Little River, Longs", "Horry, unincorporated", "No county zoning rule on rental length. The recorded covenants decide.", `${h.ext(HORRYBL, "County license, May 1 to April 30")}, zoning approval first`, `${h.ext(HORRY, "County 3 percent")}`, "Carolina Forest and Socastee: yearly and monthly. Garden City Beach and Little River: nightly where the covenants allow"],
        ["Murrells Inlet, southern Garden City, Litchfield", "Georgetown, unincorporated", `The county zoning allows ${h.ext(GTDEF, "a house rented for stays up to 30 days")}, called a tourist home, ${h.ext(GTGRR, "in its resort districts")}. Ask the county about any other district.`, `${h.ext(GTFAQ, "No county business license")}`, `${h.ext(GTTAX, "County 3 percent")}, and the threshold is 30 days, not 90`, "Nightly in the resort districts; monthly near Tidelands Waccamaw"],
        ["Pawleys Island (the town)", "Georgetown", "Rental is the town's main industry. Ask the town for the rule by district.", "No county license; the town collects its own tax", "Town 3 percent", "Nightly and weekly"],
        ["Conway", "Horry", `Nightly rental is ${h.ext(CONWAYUDO, "a commercial use allowed in three downtown districts")}, capped at 90 days. Houses elsewhere: yearly and monthly.`, `${h.ext(CONWAYBL, "City license, May 1 to April 30")}`, "City 1 percent fee plus 0.5 percent; county 1.5 percent", "Yearly; monthly near the hospital and the university"],
      ]) +
      h.p(`Two things hold across every row. ${h.ext(SC61, "State law caps")} the combined county and city accommodations tax at 3 percent in any one place. The state's own tax on stays under 90 days applies everywhere. ${h.a("/invest/str-rules/", "The rules by city, in full")}. ${h.a("/invest/accommodations-tax/", "Who remits which tax")}.`) },
    { h2: "What decides the nightly rental rule at an address?", html: (bg) =>
      h.p("Three layers, checked in this order. The state sets the tax and the 90-day line, and it does not ban nightly rentals anywhere. The city or the county sets the zoning. The recorded covenants of the subdivision or the building can bar what the zoning allows, and often do.") +
      h.p(`The state layer could change. ${h.ext("https://www.scstatehouse.gov/sess126_2025-2026/bills/3861.htm", "One bill in committee")} would stop cities and counties from banning short-term rentals. ${h.ext("https://www.scstatehouse.gov/sess126_2025-2026/bills/442.htm", "Another")} would confirm their power to ban them. Either one rewrites the table. North Myrtle Beach has held workshops on its own rules since late 2024 and adopted none by the date on this page.`) +
      h.cta("Want the row checked for one address?", "Send the address and the plan. We check the zoning, the covenants, the license and the tax lines for that property.", "Send the address", RTN, bg) },
    { h2: "Which county is the address in, and why does it matter?", html:
      h.p(`${h.ext(CENSUS, "Murrells Inlet, Litchfield and the town of Pawleys Island are in Georgetown County")}. The southern part of Garden City is too. Everything from Surfside Beach north is Horry County. The line runs through Garden City, so check the parcel, not the mailing address.`) +
      h.p("Georgetown County requires no business license, charges a 3 percent accommodations tax, and stops that tax at 30 continuous days. Horry County licenses every business in its unincorporated area, charges a 3 percent fee outside city limits and 1.5 percent inside, and stops it at 90 consecutive days. Both counties assess a rental at the 6 percent rate. " + h.a("/buyers/property-taxes/", "How the property tax is calculated") + ".") },
    { h2: "How do you check the flood zone?", html:
      h.p(`By address, never by area. ${h.ext("https://msc.fema.gov/portal/home", "The federal flood map service")} takes an address and returns the map. ${h.ext("https://www.horrycountysc.gov/online-services/fema-flood-maps/", "Horry County")} links the same maps and runs a parcel search. ${h.ext("https://gtcountysc.gov/424/Flood-Protection", "Georgetown County")} lists four ways, including its building department at 129 Screven Street. Two houses on one street can sit in different zones. ${h.a("/buyers/coastal-insurance/", "What the zone does to the insurance bill")}.`) },
    { h2: "Where does each strategy fit?", html: (bg) =>
      h.p(`Nightly: North Myrtle Beach, the resort zones of Myrtle Beach, Garden City Beach and Pawleys Island, in a building or a subdivision whose documents allow it. ${h.a("/submarkets/north-myrtle-beach/", "North Myrtle Beach")}. ${h.a("/submarkets/garden-city/", "Garden City")}. ${h.a("/submarkets/pawleys-island/", "Pawleys Island")}.`) +
      h.p(`Monthly, furnished: within a short drive of a hospital. Carolina Forest and Socastee serve Grand Strand Medical Center, and Murrells Inlet serves Tidelands Waccamaw. Little River serves McLeod Health Seacoast, and Conway serves Conway Medical Center and ${h.a("/invest/student-rentals/", "the university")}. ${h.a("/submarkets/carolina-forest/", "Carolina Forest")}. ${h.a("/submarkets/murrells-inlet/", "Murrells Inlet")}. ${h.a("/submarkets/little-river/", "Little River")}.`) +
      h.p(`Yearly, unfurnished: Conway, Carolina Forest, Socastee, Little River and Longs, where the price of entry is lowest and the tenants stay year round. ${h.a("/submarkets/conway/", "Conway")}. ${h.a("/market-reports/", "The market report")} lists the median sale price by area each month.`) +
      h.cta("Choosing between two areas?", "Send both addresses. We run the numbers for each under your plan and show which row wins.", "Send the addresses", RTN, bg) },
  ],
  faqTitle: "Where-to-buy FAQ",
  faq: [
    { q: "Where are Airbnbs legal on the Grand Strand?", a: "North Myrtle Beach citywide, subject to the covenants. Myrtle Beach only in the zones marked for it, not in residential neighborhoods. Surfside Beach in two districts. Unincorporated Horry County where the covenants allow. Georgetown County's resort districts, for a house rented up to 30 days." },
    { q: "Is Murrells Inlet in Horry County or Georgetown County?", a: "Georgetown County, along with Litchfield and the southern part of Garden City. Georgetown County requires no business license, and its 3 percent accommodations tax stops at 30 days." },
    { q: "Which area is best for a long-term rental?", a: "Conway, Carolina Forest, Socastee and Little River have the lowest prices of entry and year-round tenants. The choice within them comes down to the neighborhood's covenants and the numbers for the house." },
    { q: "Can I do a 90-day furnished rental in a Myrtle Beach neighborhood?", a: "Yes, in residential zones, because a stay of 90 days or more is not a short-term rental there. Not in the oceanfront buildings covered by the December 2024 overlay." },
    { q: "Do the rules change?", a: "Yes. Two state bills in committee would either stop local bans or confirm them, and North Myrtle Beach is drafting its own rules. Check the row before you offer." },
  ],
  sources: [
    { name: "City of Myrtle Beach, planning and zoning", href: PZ },
    { name: "City of North Myrtle Beach, short-term rentals", href: NMBSTR },
    { name: "Town of Surfside Beach, zoning uses", href: SURFZ },
    { name: "Georgetown County, accommodations tax", href: GTTAX },
    { name: "Horry County, hospitality fee", href: HORRY },
  ],
  sourcesNote: "Educational only, not legal advice. Every row is the rule on the read date; the fit column is our reading of the market, not a rule.",
  bottomCta: { h2: "The right area follows the strategy.", p: "Send the address and the plan. We check the zoning, the covenants, the license and the tax lines, and run the numbers.", label: "Send the address", href: RTN },
  keywords: "where to buy a rental property Myrtle Beach, best area for investment property Myrtle Beach, Grand Strand short-term rental zoning by city, Murrells Inlet Georgetown County rental rules",
  about: "Grand Strand submarkets for rental investors",
};
