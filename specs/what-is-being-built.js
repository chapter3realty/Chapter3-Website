/* /invest/what-is-being-built/ - what is being built on the Grand Strand right
 * now, regenerated monthly. The moving numbers come from
 * research/invest-next/data/pipeline-latest.json, which tools/permits.js
 * refreshes from the federal permit count (FRED MYRT845BPPRIV), the county's
 * "Major Residential Developments" layer and the county's permit map. Each
 * feed prints its own read date, and a stale feed reads as stale. The fixed
 * facts (hospitals, the interstate, roads, the airport, downtown) are quoted
 * from the sources in research/invest-next/construction-pipeline-facts.md
 * and carry their dates; re-read that file's section 7 before adding a claim.
 * Wording rule from the research: the interstate is bought right of way and
 * plans, never "under construction" or "coming in 20xx". No conclusion about a
 * named builder, community or hospital; dated facts only. Monthly procedure:
 * node tools/permits.js, node tools/mkpage.js specs/what-is-being-built.js,
 * node build.js dates, node build.js preflight, commit. Built by tools/mkpage.js. */
const path = require("path");
const { h } = require("../tools/mkpage.js");
const P = require(path.join(__dirname, "..", "research", "invest-next", "data", "pipeline-latest.json"));

const TEL = "tel:+18543332135";
const FRED = "https://fred.stlouisfed.org/series/MYRT845BPPRIV";
const DEVLAYER = "https://www.arcgis.com/home/item.html?id=80af96d3ac864d068045634ac4365405";
const PACKET = "https://horrycounty.granicus.com/AgendaViewer.php?view_id=3&clip_id=3355";
const I73 = "https://projectportal.scdot.gov/i-73-project";
const RIDE73 = "https://roads.horrycountysc.gov/projects/interstate-connector/";
const CON = "https://dph.sc.gov/sites/scdph/files/2026-09/2026_August_Archived_CON_Applications.pdf";
const MCLEOD = "https://www.mcleodhealth.org/news-entry/mcleod-health-offers-preview-of-new-hospital-in-carolina-forest/";
const HCA = "https://www.wmbfnews.com/2026/02/09/its-really-about-access-south-strand-hospital-breaks-ground-220-million-facility/";
const TIDE = "https://wpde.com/news/local/tidelands-health-carolina-bays-new-hospital-horry-county-interchange-highway-31-707-acute-care-provider-medical-surgical-services-heart-care-musc-rehabilitation-encompass-open-in-2028-south-carolina-septmeber-27-2023";
const CMC = "https://www.conwaymedicalcenter.com/news/topic/cmc-breaks-ground-for-new-cmc-socastee-free-standing-emergency-department/";
const RIDE4 = "https://roads.horrycountysc.gov/resources/ride-4/";
const US501 = "https://roads.horrycountysc.gov/projects/us-hwy-501-sc-hwy-31-to-sc-544/";
const SC31 = "https://www.ncdot.gov/news/press-releases/Pages/2026/2026-04-22-public-input-shapes-carolina-bays-parkway-project.aspx";
const AIRPORT = "https://www.flymyrtlebeach.com/media/";
const TERMINAL = "https://www.flymyrtlebeach.com/media/news/myr-unveils-terminal-expansion-with-ribbon-cutting-celebration/";
const DOWNTOWN = "https://wpde.com/news/local/city-seeks-proposals-from-experts-for-arts-innovation-district-redevelopment-request-for-qualifications-partner-stormwater-infrastructure-sewer-utilities-vertical";
const PERMITMAP = "https://www.horrycountysc.gov/gis/permits";
const ENERGOV = "https://egweb.horrycounty.org/EnerGov_prod/selfservice#/home";
const WARDEN = "https://www.aol.com/myrtle-beach-area-full-developments-100000068.html";

/* ---------------- the moving numbers ---------------- */
const F = P.permits_fred, monthly = F.monthly, months = Object.keys(monthly).sort();
const latestM = months[months.length - 1], latestY = latestM.slice(0, 4), latestMo = +latestM.slice(5, 7);
const sumYear = (y) => months.filter(m => m.startsWith(y)).reduce((a, m) => a + monthly[m], 0);
const ytd = (y) => months.filter(m => m.startsWith(y) && +m.slice(5, 7) <= latestMo).reduce((a, m) => a + monthly[m], 0);
const y2024 = sumYear("2024"), y2025 = sumYear("2025"), ytdNow = ytd(latestY), ytdPrev = ytd(String(+latestY - 1));
const ytdChg = (ytdNow / ytdPrev - 1) * 100;
const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const mName = (m) => MONTH[+m.slice(5, 7) - 1] + " " + m.slice(0, 4);
const ytdLabel = latestMo === 1 ? `January ${latestY}` : `January to ${MONTH[latestMo - 1]} ${latestY}`;
const D = P.developments, feed = P.county_permit_feed, air = P.airport;
const top = D.by_community.filter(c => !/no community/.test(c.name)).slice(0, 10);
const longDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${MONTH[m - 1]} ${d}, ${y}`; };
const fmt = (n) => Math.round(n).toLocaleString("en-US");
const p1 = (n) => (Math.round(n * 10) / 10).toFixed(1);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const airChg = (air.jan_jul_2026 / air.jan_jul_2025 - 1) * 100, air25 = (air.passengers_2025 / air.passengers_2024 - 1) * 100;

/* ---------------- charts ---------------- */
const NAVY = "#1c2028", MUTED = "rgba(28,32,40,.78)", BRASS = "#c4783a", BRASS_LT = "#e3bf8f", GRID = "rgba(28,32,40,.12)";
const SVGSTYLE = 'style="display:block;max-width:640px;font-family:var(--sans)"';
function permitChart() {
  const ms = months.filter(m => m >= "2024-01"), W = 640, H = 230, L = 44, R = 10, T = 12, B = 34, PW = W - L - R, PH = H - T - B;
  const max = 900, bw = PW / ms.length, x = (i) => L + i * bw, y = (v) => T + PH * (1 - v / max);
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Homes permitted each month in the Myrtle Beach metro, January 2024 to ${mName(latestM)}" ${SVGSTYLE}>`;
  for (const g of [300, 600, 900]) s += `<line x1="${L}" y1="${y(g)}" x2="${W - R}" y2="${y(g)}" stroke="${GRID}"/><text x="${L - 5}" y="${y(g) + 4}" font-size="11" text-anchor="end" fill="${MUTED}">${g}</text>`;
  ms.forEach((m, i) => {
    const v = monthly[m], isLatest = m === latestM, col = m.startsWith(latestY) ? BRASS : BRASS_LT;
    s += `<rect x="${(x(i) + 1.5).toFixed(1)}" y="${y(v).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${(PH - (y(v) - T)).toFixed(1)}" fill="${col}"><title>${mName(m)}: ${v} homes</title></rect>`;
    if (m.endsWith("-01")) s += `<text x="${(x(i) + 2).toFixed(1)}" y="${H - 12}" font-size="11" fill="${NAVY}">${m.slice(0, 4)}</text>`;
    if (isLatest) s += `<text x="${(x(i) + bw / 2).toFixed(1)}" y="${(y(v) - 5).toFixed(1)}" font-size="11" font-weight="600" text-anchor="middle" fill="${NAVY}">${v}</text>`;
  });
  s += `<rect x="${L}" y="${H - 8}" width="10" height="8" fill="${BRASS_LT}"/><text x="${L + 14}" y="${H}" font-size="11" fill="${NAVY}">Earlier years</text><rect x="${L + 110}" y="${H - 8}" width="10" height="8" fill="${BRASS}"/><text x="${L + 124}" y="${H}" font-size="11" fill="${NAVY}">${latestY}</text>`;
  return s + "</svg>";
}
function communityChart() {
  const W = 640, L = 130, R = 70, BW = W - L - R, rowH = 24, H = top.length * rowH + 10, max = Math.max(...top.map(c => c.rem));
  let s = `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Approved but unbuilt homes by community, unincorporated Horry County" ${SVGSTYLE}>`;
  top.forEach((c, i) => { const y = i * rowH + 3, w = Math.max(2, Math.round(BW * c.rem / max)); s += `<text x="${L - 8}" y="${y + 14}" font-size="12" text-anchor="end" fill="${NAVY}">${esc(c.name)}</text><rect x="${L}" y="${y}" width="${w}" height="18" fill="${BRASS}"><title>${esc(c.name)}: ${fmt(c.rem)} units</title></rect><text x="${L + w + 6}" y="${y + 14}" font-size="12" fill="${NAVY}">${fmt(c.rem)}</text>`; });
  return s + "</svg>";
}
const CHART_PERMITS = permitChart(), CHART_COMM = communityChart();

/* ---------------- tables ---------------- */
const T_SUM = h.table(["What", "Where it stands", "Data through"], [
  ["Houses", `${fmt(ytdNow)} homes permitted in the metro, ${ytdLabel}; ${fmt(y2025)} in 2025`, mName(latestM) + ", federal count"],
  ["Approved and not yet built", `${fmt(D.remaining_total)} units in the unincorporated county's planning layer`, `County layer, read ${longDate(D.read)}`],
  ["Hospitals", "Three with state licenses and not yet fully open: 48, 59 and 36 beds; five free-standing emergency departments", "State license list, August 31, 2026"],
  ["Interstate 73", "Right of way bought, plans drawn, no construction contract and no construction money", "SCDOT, read September 7, 2026"],
  ["Roads", "US 501 to SC 544 and the downtown 501 realignment finishing fall 2026; US 701 north of Conway and the US 17 Bypass six-laning under way", "County and SCDOT pages, September 2026"],
  ["Airport", `$93.5 million terminal open since December 2025; passengers ${p1(Math.abs(airChg))} percent below 2025 in January to July 2026`, "Airport tables, read " + longDate(air.read)],
]);
const T_PERMITS = h.table(["Period", "Homes permitted"], [
  ["2024", fmt(y2024)], ["2025", fmt(y2025)], [ytdLabel, fmt(ytdNow)], [`Same months of ${+latestY - 1}`, fmt(ytdPrev)], [mName(latestM), fmt(monthly[latestM])],
]);
const T_DEV = h.table(["Development (community)", "Approved", "Built", "Left to build", "County record date"], [
  ["Sayebrook East (Surfside)", "3,040", "0", "3,040", "February 2019"],
  ["Pine Ridge (Burgess)", "2,506 by zoning, capped at 2,000 by the August 2026 agreement", "0", "up to 2,000", "The agreement"],
  ["Sayebrook West (Surfside)", "1,880", "217", "1,663", "August 2026"],
  ["Palmetto Ranch (Longs)", "1,292", "0", "1,292", "February 2019"],
  ["Collins Tract (Conway South)", "898, rezoning case filed 2026", "0", "898", "August 2026"],
  ["Auberon Woods (Bear Bluff)", "1,188", "351", "837", "July 2026"],
  ["Tupelo Bay Golf Villas (Garden City)", "800", "180", "620", "August 2026"],
  ["Berkshire Village (Carolina Forest)", "729", "113", "616", "July 2026"],
  ["Bluffs on the Waterway (Carolina Forest)", "935", "358", "577", "July 2026"],
  ["Bella Vita (Carolina Forest)", "1,807", "1,409", "398", "July 2026"],
]);
const T_HOSP = h.table(["Hospital", "Beds", "Where", "Where it stands"], [
  ["McLeod Health Carolina Forest", "48", "Carolina Forest", "Ribbon cut August 27, 2026; the hospital says it opens this fall; about $90 million by its latest figure"],
  ["South Strand Hospital (Grand Strand Health)", "59", "US 17 Bypass at Sheffield Parkway", "Ground broken February 9, 2026; completion reported for late 2027; about $220 million"],
  ["Tidelands Health Carolina Bays", "36, plus a 24-bed long-term care hospital and a 36-bed rehabilitation hospital", "SC 31 at SC 707", "Licensed; appeals resolved in 2023; opening projected for 2028"],
  ["Free-standing emergency departments", "", "Little River (open), Murrells Inlet, Conway (Rivertown), Socastee (late 2026), SC 90 at SC 22 (2027)", "Two systems: Grand Strand Health and Conway Medical Center"],
]);
const T_ROADS = h.table(["Road", "What", "Budget", "Where it stands"], [
  ["US 501, SC 31 to SC 544", "Six lanes and new signals", "$41 million", "Estimated completion fall 2026"],
  ["US 501 realignment, downtown Myrtle Beach", "New alignment to 7th Avenue North at Oak Street", "$13.9 million", "Estimated completion fall 2026"],
  ["US 17 Bypass, SC 707 to Harrelson Boulevard", "Four lanes to six", "Not stated", "SCDOT told a reporter the end of 2026"],
  ["US 701, SC 319 to SC 22", "Five lanes north of Conway", "$65.1 million", "Under construction"],
  ["SC 9 east of Loris", "Four lanes to SC 66", "$21.7 million", "Completion planned spring 2026"],
  ["Forestbrook Road", "Five lanes, US 501 to Dick Pond Road", "$89.1 million", "Funded; no schedule on the county page"],
  ["Conway Perimeter Road, phase two", "New four-lane road, US 378 to US 701", "$18.4 million", "Funded; no schedule on the county page"],
  ["SC 31 south, SC 707 to US 17 Bypass", "New parkway connection, paid through the Pine Ridge agreement", "Not stated", "Agreement passed August 18, 2026; a resident told council building starts about 2029"],
  ["SC 31 north, SC 9 to North Carolina", "New freeway to US 17 at Shallotte", "$797 million, both states", "North Carolina dropped the preferred route in April 2026 and has no construction money"],
  ["SC 90", "Two lanes to four, East Cox Ferry Road to US 17", "$745 million", "Design 2025 to 2030"],
  ["SC 22 extension", "New highway from US 501 near Aynor to Surfside and Murrells Inlet", "$1.56 billion", "Not started; environmental study under way"],
  ["Conway river crossing", "New bridge over the Waccamaw", "$860 million", "Not started"],
]);

module.exports = {
  url: "/invest/what-is-being-built/",
  title: "What Is Being Built in Myrtle Beach Right Now | Chapter3",
  description: "What is being built on the Grand Strand: the homes permitted this year, the approved units not yet built, three hospitals, the roads and I-73. Updated monthly.",
  ogTitle: "What is being built on the Grand Strand right now?",
  crumb: "What is being built",
  eyebrow: "Updated monthly",
  h1: "What is being built on the Grand Strand right now?",
  h1em: "Houses, hospitals, roads, and the permit count.",
  sub: `Builders were allowed to start ${fmt(ytdNow)} homes in the Myrtle Beach metro from ${ytdLabel.replace("January to ", "January through ")}. Three hospitals are being built or opening. The interstate has no contract.`,
  heroCta: { label: "Call a specialized agent", href: TEL },
  author: "devin",
  shortAnswer: [
    `Houses, mostly. Builders were allowed to start ${fmt(y2025)} homes in the Myrtle Beach metro in 2025, and ${fmt(ytdNow)} from ${ytdLabel}. That is ${p1(Math.abs(ytdChg))} percent ${ytdChg < 0 ? "below" : "above"} the same months a year earlier.`,
    `The county has ${fmt(D.remaining_total)} more units already approved and not yet built. Most of them are in Longs, Carolina Forest, Surfside and Burgess.`,
    `The big projects are three hospitals holding state licenses that are not fully open, four road jobs under way, and the airport terminal that opened in December 2025. Interstate 73 has right of way and plans. It has no construction contract and no money to build.`,
    `This page is rebuilt every month from the federal permit count and the county's own data. The sections below have each number and where it came from.`,
  ],
  sections: [
    { h2: "What is being built in Myrtle Beach right now?", html:
      h.p(`Each row names the source and the date its data runs to. The sections below have the detail.`) +
      T_SUM +
      h.p(`Two things the owner of a rental here asks about are not on the list. Nothing is under construction on Interstate 73. No new bridge to the beach has a contract. The section on roads has what is funded and what is only planned.`) },
    { h2: "How many houses are being built?", html: (bg) =>
      h.p(`${h.ext(FRED, "The federal government counts the homes that local governments permit each month")}. The count covers the Myrtle Beach metro, which is Horry County plus Brunswick County in North Carolina. Each month's figure arrives about four weeks after the month ends.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_PERMITS}</div>`) +
      T_PERMITS +
      h.p(`${ytdLabel} is ${p1(Math.abs(ytdChg))} percent ${ytdChg < 0 ? "below" : "above"} the same months of ${+latestY - 1}. Most of the permits are single-family houses in planned communities. ${h.a("/invest/new-construction-rentals/", "Buying a new house as a rental")} has the warranty, the incentives and the recorded rules.`) +
      h.h3("What is approved and not yet built") +
      h.p(`${h.ext(DEVLAYER, "The county's planning office keeps a map of every major subdivision")} with the units its zoning allows and the units built. Subtracting one from the other gives the homes that can still be built without a new approval. On ${longDate(D.read)} that was ${fmt(D.remaining_total)} units in the unincorporated county: ${fmt(D.remaining_single_family)} houses and ${fmt(D.remaining_multifamily)} apartments or condos. The cities keep their own records.`) +
      h.raw(`<div style="max-width:640px;margin:1rem 0 1.2rem">${CHART_COMM}</div>`) +
      h.p(`The county says it updates the layer once a year. ${D.updated[0].n} of its ${fmt(D.records)} records still carry a ${D.updated[0].updated.toLowerCase().replace(/\b[a-z]/, (c) => c.toUpperCase())} date, and those hold ${fmt(D.updated[0].rem)} of the remaining units. Treat a count from an old record as an old count. The largest developments, with the date on each record:`) +
      T_DEV +
      h.p(`Pine Ridge is the one to watch. ${h.ext(PACKET, "Horry County Council passed a development agreement with Pulte Home Company on August 18, 2026")}. The tract was entitled to 2,506 homes and the builder agreed to a cap of 2,000. In return the county gets a connection of SC 31 from SC 707 to US 17 Bypass, with the builder paying part of the road. The county also gets land for a recreation center. A resident told council at the vote that building would start about 2029.`) +
      h.p(`Inside the city of Conway, ${h.ext(WARDEN, "Warden Station was annexed in January 2024 with more than 3,300 homes planned")} on about 1,800 acres along US 701 South. The news report counts 1,380 houses, 1,018 townhomes and 920 apartments. The city's own agreement was not found online. It is not in the county layer because it is inside the city.`) +
      h.p(`At the 2025 pace of ${fmt(y2025)} permits a year, the ${fmt(D.remaining_total)} approved units are about ${Math.round(D.remaining_total / y2025)} years of building. ${h.a("/invest/rent-prices/", "The rent page")} has what new supply does to the rent in the areas that get it.`) +
      h.cta("Buying a rental where the building is?", "Tell us the area and the budget. We run the numbers with the rent from local leases, and check the approved units around the house before you offer.", "Have us run the numbers", "/invest/run-the-numbers/", bg) },
    { h2: "Which hospitals are being built?", html:
      h.p(`Three. ${h.ext(CON, "The state's license list")}, updated August 31, 2026, carries all three with their bed counts and their approval dates from 2021. Each was appealed by competing systems and each survived.`) +
      T_HOSP +
      h.p(`${h.ext(MCLEOD, "McLeod cut the ribbon on August 27, 2026")} on a four-story, 48-bed hospital in Carolina Forest, the first new hospital in Horry County since 2011. ${h.ext(HCA, "Grand Strand Health broke ground on February 9, 2026")} on the 59-bed South Strand Hospital across from its existing medical center. ${h.ext(TIDE, "Tidelands Health's 36-bed hospital at SC 31 and SC 707")} cleared its appeals in 2023 with a 2028 target. The system's own page could not be opened for this update.`) +
      h.p(`${h.ext(CMC, "Conway Medical Center is building two free-standing emergency departments")} and no hospital. One is in Socastee, opening late 2026. One is at SC 90 and SC 22, in 2027. A hospital brings traveling nurses on 13-week contracts. ${h.a("/invest/mid-term-rentals/", "Furnished monthly rentals")} is the rental they use.`) },
    { h2: "Is Interstate 73 being built?", html:
      h.p(`No. ${h.ext(I73, "The state transportation department's own page")} says right of way is bought from I-95 to US 501. It is nearly bought from US 501 to the Marion County line. From there to SC 22 it is still being bought, through 2026. It also says: funding has not been identified to advance construction on any of the three phases. The northern half, into North Carolina, is on hold.`) +
      h.p(`${h.ext(RIDE73, "Horry County has $450 million in its road sales tax for the interstate")}. It is a local match of up to half the cost from SC 22 to the county line. The match is paid only if the state signs a construction contract for the rest. Nothing has been spent.`) +
      h.p(`A road with bought land and finished plans is not a road. Nothing on this page counts the interstate as a reason to buy in one area over another, and no listing should.`) },
    { h2: "Which roads are under construction?", html:
      h.p(`${h.ext(RIDE4, "Horry County's one-percent road sales tax")} funds most of the work. The 2017 to 2025 program paid for the roads finishing now. The 2025 to 2050 program, approved by voters in November 2024, lists $6.6 billion of projects. Design on the large ones starts between 2025 and 2030. Budgets below are the county's or the state's own figures.`) +
      T_ROADS +
      h.p(`Finished since 2018: International Drive from Carolina Forest to SC 90, and the widening of Carolina Forest Boulevard. Also the Fred Nash Boulevard extension around the airport runway, Postal Way, and US 701 through Loris. ${h.ext(US501, "The county's project pages")} carry a budget, the money spent and a date stamp for each road.`) +
      h.p(`${h.ext(SC31, "North Carolina dropped the preferred route for the SC 31 extension on April 22, 2026")}, citing public feedback and funding. The two states will look at other routes. South Carolina's share is funded for land purchase only, from 2027.`) },
    { h2: "What else is changing on the Grand Strand?", html:
      h.p(`${h.ext(TERMINAL, "The airport opened a $93.5 million, six-gate terminal expansion on December 1, 2025")}, six weeks early and under budget by the county's figures. ${h.ext(AIRPORT, "Its own passenger tables")} show ${fmt(air.passengers_2025)} arriving and departing passengers in 2025, ${p1(Math.abs(air25))} percent below the 2024 record. January to July 2026 had ${fmt(air.jan_jul_2026)}, ${p1(Math.abs(airChg))} percent below the same months of 2025. Spirit, its largest airline in 2025, stopped flying in May 2026. Ten airlines serve it today.`) +
      h.p(`${h.ext(DOWNTOWN, "The City of Myrtle Beach has put $97 million into its downtown district")}, with $15 million from the state. The money goes to utilities, a 300-seat theater on Main Street and land purchases. The theater was scheduled for summer 2026 and is now expected toward the end of the year. The US 501 realignment onto 7th Avenue North is part of the same work.`) +
      h.p(`North Myrtle Beach finished a $36 million expansion of its sports complex in November 2025, doubling its ball fields. In May 2026 Horry County approved a $115 million civic center and equestrian arena on Hardwick Road near US 501 and SC 22. It also approved $10 million toward a pool in Carolina Forest.`) },
    { h2: "Where can you see the permits near a house?", html: (bg) =>
      h.p(`${h.ext(PERMITMAP, "The county publishes a map of active permits")} for the unincorporated county, with the address, the type and the value of each. We read it by machine every month. On ${longDate(feed.read)} the newest permit on it was issued ${longDate(feed.max_issue_date)}, and it showed ${feed.last30} permits in the last 30 days. ${feed.live ? "The feed is current." : "The feed has not been updated since that date, so the zero means the map is stale, not that building stopped. In its last live 30 days it showed " + fmt(feed.last_live_30_days || 313) + " permits."}`) +
      h.p(`${h.ext(ENERGOV, "The county's live permit system")} still takes applications and shows records by address. North Myrtle Beach and Conway have their own portals. The City of Myrtle Beach and Surfside Beach publish forms and no online records. For one house, ${h.a("/invest/long-term-rental/", "the rental analyzer")} flags nearby permit activity with the numbers. After you buy through us, we tell you when a permit is filed near the property.`) +
      h.cta("Want the permits pulled for one address?", "Send us the address. We check the county map, the city's records and the approved units around it before you offer.", "Have us run the numbers", "/invest/run-the-numbers/", bg) },
    { h2: "What does the building mean for a rental buyer?", html:
      h.p(`New houses are supply. ${fmt(y2025)} permits a year and ${fmt(D.remaining_total)} approved units mean new competition for a landlord. The areas with the most approved land will have new houses for rent next to yours for years. Those are Longs, Carolina Forest, Surfside, Burgess and Little River. Rents in those areas have to compete with new construction. ${h.a("/invest/rental-returns/", "The returns page")} has the rent and the return by area.`) +
      h.p(`Hospitals are demand. Each one brings traveling nurses on short contracts, and the furnished monthly rental is what they rent. Roads change the drive to the beach, and a house on a road being widened is a house next to a construction site for two years.`) +
      h.p(`The interstate is neither. Until a construction contract is signed, a listing that prices in the interstate is pricing in a plan. We do not.`) },
  ],
  faqTitle: "Grand Strand construction FAQ",
  faq: [
    { q: "How many homes are being built in Myrtle Beach?", a: `Builders were allowed to start ${fmt(y2025)} homes in the Myrtle Beach metro in 2025 and ${fmt(ytdNow)} from ${ytdLabel}, by the federal permit count. The unincorporated county has ${fmt(D.remaining_total)} more units approved and not yet built, most of them in Longs, Carolina Forest, Surfside and Burgess.` },
    { q: "Is Interstate 73 under construction?", a: "No. The state has bought right of way from I-95 to US 501 and most of the way to SC 22, and has plans. It says funding has not been identified to build any of the three phases. Horry County's $450 million is a match paid only after the state signs a construction contract." },
    { q: "What new hospitals are being built in Myrtle Beach?", a: "Three hold state licenses. McLeod Health Carolina Forest, 48 beds, cut its ribbon in August 2026 and opens this fall. South Strand Hospital, 59 beds, broke ground in February 2026 for late 2027. Tidelands Health Carolina Bays, 36 beds at SC 31 and SC 707, is projected for 2028. Five free-standing emergency departments are open or under way." },
    { q: "Which roads are being widened in Myrtle Beach?", a: "US 501 from SC 31 to SC 544 and the downtown 501 realignment finish in fall 2026. US 701 north of Conway is under construction. The US 17 Bypass is going from four lanes to six between SC 707 and Harrelson Boulevard. SC 90 is in design for 2025 to 2030, and the SC 22 extension is not started." },
    { q: "How often is this page updated?", a: `Monthly. The federal permit count, the county's development layer and the county's permit map are read by machine and the page is rebuilt. The current data runs to ${mName(latestM)} for permits and ${longDate(D.read)} for the county layer.` },
  ],
  sources: [
    { name: "Census permits, FRED", href: FRED },
    { name: "Horry County development layer", href: DEVLAYER },
    { name: "Council packet, Ordinance 73-2026", href: PACKET },
    { name: "SCDOT, I-73", href: I73 },
    { name: "State license list", href: CON },
    { name: "McLeod Health", href: MCLEOD },
    { name: "WMBF, South Strand Hospital", href: HCA },
    { name: "RIDE 4", href: RIDE4 },
    { name: "county road projects", href: US501 },
    { name: "NCDOT, SC 31", href: SC31 },
    { name: "airport passenger tables", href: AIRPORT },
    { name: "county permit map", href: PERMITMAP },
  ],
  sourcesNote: "Educational only. Dates and budgets are the agencies' own and change; a project with no contract has no date.",
  bottomCta: { h2: "Buying near the building? Have us check the address first.", p: "One call. The permits around it, the approved units next to it, the road plans, and the rent from local leases.", label: "Call a specialized agent", href: TEL },
  keywords: "what is being built in Myrtle Beach, Myrtle Beach construction 2026, new development Myrtle Beach, Horry County building permits, Interstate 73 status, Myrtle Beach new hospitals, Grand Strand road construction",
  about: "Construction under way on the Grand Strand: homes, hospitals, roads and the monthly permit count",
};
