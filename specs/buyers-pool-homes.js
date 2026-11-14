/* /buyers/pool-homes/ - homes with a pool in Myrtle Beach: where the houses with their own pool are (our count of the
 * site's listings, by town), what they ask and how the chance of a pool climbs with price, your own pool or a
 * neighborhood pool, five neighborhoods with a shared pool, what a pool costs to keep, Horry County's pool fence rule as
 * our own drawing, and what a home inspection leaves out. A landing page: the live search is its main offer.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 2, review round 1 (2026-11-08). Design: the approved pilots of batch
 * 2026-11-a (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line headline with
 * the italic sub line at about half the H1 size, the answer first, one card style used once (own pool or neighborhood
 * pool, the one place the reader chooses), plain lists and a plain table under thin rules elsewhere, one block width of
 * 720 px, and on wide screens the photo beside the paragraphs on where pool homes are. DESIGN.md in the batch folder.
 * Round 1 (REVIEW-1.md): the opening leads with where a pool is and the shared-pool choice, price said once; five named
 * neighborhoods with their pools, each with its own offer; upkeep with the one primary cost figure (ENERGY STAR); the
 * fence rule says who it covers (7 in 10 pool houses are outside city limits) and who runs it inside a city
 * (SC Code 6-9-30); the technical lines cut; each figure said once; three new FAQs from verified rows.
 * Facts: Blog-Brain batches/2026-11-n/buyers-pool-homes/facts.md, VERIFIED rows, CORRECTED rows only in the
 * verifier's wording (VERIFY.md), and rows 23 to 28 marked VERIFIED-BY-FIXER (round 1). Struck wording: struck.json.
 * Data, never typed (website working copy, data/2026-11-n/buyers-pool-homes/):
 *   findings.json       rows 1 to 7 and 20, row 19 (NOAA normals); built by analyze.py
 *   neighborhoods.json  rows 23 and 27 (five neighborhoods, townhouses with a shared pool); pull_neighborhoods.py
 *   photos.json         the one photo: oceanfront houses with pools in Surfside Beach, USGS 2011, public domain
 * Typed and checked: the law and guidance (rows 8 to 18, 25, 26), each in the verifier's wording.
 * Our own drawing: the county's fence rule (rows 10, 11), numbered, with its key beside it.
 * Owner questions open (OWNER-QUESTIONS.md): Q1 upkeep a month (no local figure; the offer gets a quote), Q2 who
 * inspects the pool for our buyers (left off), Q3 a real story (none), Q4 screen enclosures (left off).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/buyers/pool-homes/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "buyers-pool-homes");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const F = read("findings.json");
const NJ = read("neighborhoods.json");
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const about10 = (v) => n0(Math.round(v / 10) * 10);
const oneIn = (part, whole) => Math.round(whole / part);
const DAY = new Date(F.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const CTA = "/contact/";
const MAP = "/homes/map/?q=house%20with%20a%20pool";

/* ---- Rows 1, 2: the share and the middle asking prices. ---- */
const SH = F.share_with_pool, MED = F.medians;
if (SH.pool !== 257 || SH.houses !== 2950 || oneIn(SH.pool, SH.houses) !== 11) throw new Error("row 1 moved");
if (MED.ask.pool !== 955000 || MED.ask.not_pool !== 400000) throw new Error("row 2 moved");

/* ---- Row 4: the chance of a pool by price. ---- */
const BANDS = F.pool_share_by_price;
if (BANDS.length !== 8 || BANDS[0].to !== 300000 || BANDS[0].pool !== 5 || BANDS[0].houses !== 575) throw new Error("row 4: the bands moved");
const U5 = F.under_500k, O1 = F.over_1m;
if (U5.pool !== 37 || U5.houses !== 1906) throw new Error("row 4: under $500,000 moved");
if (!(O1.pct > 50) || O1.pool !== 117) throw new Error("row 4: over $1 million moved");

/* ---- Row 3: the same size, two bands only. ---- */
const SB = F.size_bands, S15 = SB["1500-1999"], S30 = SB["3000-3999"];
if (S15.pool.median_ask_5k !== 515000 || S15.not_pool.median_ask_5k !== 350000 || S30.pool.median_ask_5k !== 1120000 || S30.not_pool.median_ask_5k !== 775000) throw new Error("row 3 moved");

/* ---- Rows 6, 7: what else pool houses have. ---- */
const TR = F.traits;
if (oneIn(TR.east_of_17.pool, SH.pool) !== 3 || oneIn(TR.east_of_17.houses, SH.houses) !== 6) throw new Error("row 6: east of US 17 moved");
if (oneIn(TR.waterfront.pool, SH.pool) !== 5 || oneIn(TR.waterfront.houses, SH.houses) !== 7) throw new Error("row 6: waterfront moved");
const OUTSIDE = Math.round((SH.pool - TR.inside_city_limits.pool) / SH.pool * 10);
if (OUTSIDE !== 7) throw new Error("row 6: inside city limits moved");
if (Math.round(TR.hot_tub.pool_pct / 25) !== 1) throw new Error("row 7: hot tub moved");
if (Math.round(TR.str_allowed.pool_pct) !== 28 || Math.round(TR.str_allowed.houses_pct) !== 12) throw new Error("row 7: short-term rentals moved");
if (oneIn(TR.gated.pool, SH.pool) !== 5 || oneIn(TR.gated.houses, SH.houses) !== 9) throw new Error("row 7: gated moved");

/* ---- Row 20: the shared pool. ---- */
const CP = F.community_pool.extra.community_pool_no_private;
if (CP.listings !== 1261 || CP.median_ask_5k !== 435000 || CP.median_hoa_fee_5 !== 105 || CP.at_or_under["300000"] !== 168 || CP.at_or_under["500000"] !== 827) throw new Error("row 20 moved");
if (!(CP.median_ask_5k * 2 < MED.ask.pool)) throw new Error("row 20: 'more than twice' no longer holds");

/* ---- Row 23: five neighborhoods with a shared pool; row 27: townhouses. ---- */
const NB = NJ.neighborhoods;
const nbWant = { "Myrtle Beach Golf and Yacht Club": [11, 250000], "The Farm at Carolina Forest": [15, 350000], "Berkshire Forest": [17, 450000], "Waterbridge": [27, 680000], "Plantation Lakes": [14, 800000] };
for (const [k, [n, m]] of Object.entries(nbWant)) if (!NB[k] || NB[k].houses !== n || NB[k].median_ask_5k !== m) throw new Error(`row 23: ${k} moved`);
if (NB["Myrtle Beach Golf and Yacht Club"].at_or_under_300k !== 9 || NB["Berkshire Forest"].at_or_under_500k !== 13 || NB["Plantation Lakes"].private_pool !== 5 || NB["The Farm at Carolina Forest"].private_pool !== 0) throw new Error("row 23: a neighborhood count moved");
const TH = NJ.townhouse_community_pool;
if (NJ.pulled.slice(0, 10) !== F.pulled.slice(0, 10)) throw new Error("row 23: not the same day as the town table");
if (TH.listings !== 149 || TH.all_townhouses !== 298 || TH.median_ask_5k !== 270000) throw new Error("row 27: townhouses moved");

/* ---- Row 5: by town (10 or more pool houses), most first; Pawleys Island said in a sentence (no medians pulled). ---- */
const BY = F.by_place;
const label = (p) => p.replace(" (area)", " area").replace("Murrells Inlet", "Murrells Inlet, Horry County side");
const linkFor = (p) => {
  if (p === "Carolina Forest (area)") return "/homes/map/?type=house&amp;has=pool,area_carolina_forest,county_horry";
  if (p === "Garden City (area)") return "/homes/map/?type=house&amp;has=pool,area_garden_city,county_horry";
  return `/homes/map/?type=house&amp;city=${encodeURIComponent(p)}&amp;has=pool,county_horry`;
};
const BIG = BY.filter((p) => p.pool >= 10).sort((a, b) => b.pool - a.pool);
const SMALL = BY.filter((p) => p.pool < 10).sort((a, b) => b.pool - a.pool);
if (BIG.length !== 8 || BIG[0].place !== "Myrtle Beach" || BIG[0].pool !== 113 || BIG.some((p) => !p.pool_median_ask_5k)) throw new Error("row 5: the towns moved");
if (SMALL.map((p) => `${p.place}:${p.pool}`).join() !== "Little River:8,Loris:5,Socastee (area):4,Aynor:1") throw new Error("row 5: the small towns moved");
const PAW = F.georgetown.pawleys_island;
if (PAW.pool !== 16 || PAW.houses !== 117) throw new Error("row 5: Pawleys Island moved");
const SURF = BY.find((p) => p.place === "Surfside Beach");
if (Math.round(SURF.pct) !== 25) throw new Error("row 5: Surfside Beach moved");
const row = (p, all) => `<tr${all ? ' class="all"' : ""}><th scope="row">${all ? p.place : `<a href="${linkFor(p.place)}">${label(p.place)}</a>`}</th>`
  + `<td data-l="With a pool">${n0(p.pool)} of ${n0(p.houses)}</td>`
  + `<td data-l="Middle price, with a pool">${money(p.pool_median_ask_5k)}</td>`
  + `<td data-l="Middle price, no pool">${money(p.not_pool_median_ask_5k)}</td></tr>`;
const TOWNS = `<table class="pl-towns"><caption>Houses for sale with their own pool, by town</caption>`
  + `<thead><tr><th scope="col">Town</th><th scope="col">With a pool</th><th scope="col">Middle asking price, with a pool</th><th scope="col">Middle asking price, no pool</th></tr></thead><tbody>`
  + BIG.map((p) => row(p)).join("")
  + row({ place: "All of Horry County", pool: SH.pool, houses: SH.houses, pool_median_ask_5k: MED.ask.pool, not_pool_median_ask_5k: MED.ask.not_pool }, true)
  + `</tbody></table>`
  + `<p class="pl-note">A town here is the mailing address, not the city limits. Carolina Forest and Garden City are areas, not towns, and they overlap the towns. Above-ground pools are not counted. Each name opens its pool homes on our map.</p>`;

/* ---- Row 4: the chart, the share of houses with their own pool at each price. ---- */
const bandName = (b) => b.from === 0 ? `${money(b.to)} or less` : b.to === null ? `Over ${money(b.from)}` : `${money(b.from)} to ${money(b.to)}`;
const TOP = Math.ceil(Math.max(...BANDS.map((b) => b.pct)) / 5) * 5;
const CHART = G.bars(BANDS.map((b, i) => ({ name: bandName(b), value: b.pct, valueText: `${Math.round(b.pct)}%`, reference: i < 3 })),
  { caption: "Share of houses for sale with their own pool, by asking price", nameLabel: "Asking price", valueLabel: "share with a pool", max: TOP, compact: true,
    note: "Houses for sale in Horry County, our count. Under $500,000 the bars are gray." });

/* ---- Rows 1, 7, 20, 21, 24: own pool or neighborhood pool, the one place with cards. ---- */
const ES = "https://www.energystar.gov/products/pool_pumps";
const card = (k, title, text) => `<li><span class="k">${k}</span><b>${title}</b>${text}</li>`;
const CHOICE = `<ul class="pl-cards" aria-label="Your own pool or a neighborhood pool">`
  + card("Your own pool", "Swim when you like, and keep it up yourself",
    `<p>You pay for the chemicals, the repairs, the fence and the power for the pump. A pool pump can use as much as ${money(310)} of electricity a year.</p>`
    + `<p>About 1 in 4 of these houses also lists a hot tub.</p>`)
  + card("A neighborhood pool", "Swim down the street, and the HOA keeps it up",
    `<p>The middle homeowners association (HOA) fee in these neighborhoods is about ${money(CP.median_hoa_fee_5)} a month. The middle asking price of their houses is about ${money(CP.median_ask_5k)}.</p>`
    + `<p>The state requires a yearly permit for the pool, and a certified pool operator checks it at least three times a week while it is open.</p>`)
  + `</ul>`;

/* ---- The worked example (rows 4, 20): a $500,000 budget. ---- */
const BUDGET = `<div class="pl-stat"><p class="k">On a budget of ${money(500000)} or less</p><ul>`
  + `<li><strong>${U5.pool}</strong><span>houses for sale with their own pool, in all of Horry County</span></li>`
  + `<li><strong>${n0(CP.at_or_under["500000"])}</strong><span>houses for sale in a neighborhood with a shared pool</span></li></ul></div>`;

/* ---- Row 23: the five neighborhoods, lowest middle price first, each with its own offer. ---- */
const nbMap = (k) => `/homes/map/?type=house&amp;subdivision=${encodeURIComponent(NB[k].subdivision_words)}&amp;has=county_horry`;
const nb = (k, where, text, offer) => `<li><b><a href="${nbMap(k)}">${k}</a>${where}</b>${text} <a class="pl-ask" href="${CTA}">${offer}</a></li>`;
const GY = NB["Myrtle Beach Golf and Yacht Club"], FM = NB["The Farm at Carolina Forest"], BF = NB["Berkshire Forest"], WB = NB["Waterbridge"], PL = NB["Plantation Lakes"];
const NBLIST = `<ul class="pl-plain pl-nb" aria-label="Five neighborhoods with a shared pool">`
  + nb("Myrtle Beach Golf and Yacht Club", ", off Bay Road near Socastee",
    `Mostly one-story houses behind a gatehouse. Owners share a pool and a hot tub, open April 15 to October 15, with tennis courts and a community center. Of its ${GY.houses} houses for sale, ${GY.at_or_under_300k} asked ${money(300000)} or less.`,
    "Have us send you its houses for sale as they list")
  + nb("The Farm at Carolina Forest", "",
    `The HOA has a large pool and a small pool. Its rules allow no private pool on a lot, so owners swim at these. Its ${FM.houses} houses for sale had a middle asking price of about ${money(FM.median_ask_5k)}. Our ${h.a("/submarkets/carolina-forest/the-farm/", "guide to The Farm")} has its fee and rules.`,
    "Have us find you a house in The Farm")
  + nb("Berkshire Forest", ", in Carolina Forest",
    `Two pool areas. The first, beside a lake, has a pool with a water slide. The second has a pool and pickleball courts. ${BF.at_or_under_500k} of its ${BF.houses} houses for sale asked ${money(500000)} or less.`,
    "Have us show you houses in Berkshire Forest")
  + nb("Waterbridge", ", in Carolina Forest",
    `Its HOA describes a swimming pool complex, pocket parks and over 80 acres of lakes and natural areas. Its ${WB.houses} houses for sale had a middle asking price of about ${money(WB.median_ask_5k)}.`,
    "Have us price a house in Waterbridge")
  + nb("Plantation Lakes", ", in Carolina Forest",
    `Two large pools joined by waterfalls, a clubhouse with a gym, and lakes where owners take out pontoon boats. ${PL.private_pool} of its ${PL.houses} houses for sale also have a pool of their own.`,
    "Have us set up a search in Plantation Lakes")
  + `</ul>`;

/* ---- Rows 10, 11: our drawing of the county's fence rule, numbered, with its key. ---- */
const C = { navy: "#1c2028", brass: "#c4783a", ink: "#8a5226", water: "#a9d3e6", waterEdge: "#5c8fa8", grass: "#e3ecd6", house: "#e8dfd2", ivory: "#fbf8f3", muted: "#5a5f6b" };
const mark = (n, x, y) => `<g><circle cx="${x}" cy="${y}" r="15" fill="${C.navy}"/><text x="${x}" y="${y + 6}" text-anchor="middle" font-family="Inter,Arial,sans-serif" font-size="17" font-weight="700" fill="#fff">${n}</text></g>`;
const word = (x, y, t, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || "start"}" font-family="Inter,Arial,sans-serif" font-size="${o.size || 15}" font-weight="${o.weight || 600}" fill="${o.fill || C.navy}">${t}</text>`;
const pickets = (x1, y1, x2, y2, step) => {
  const out = [], len = Math.hypot(x2 - x1, y2 - y1), nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  for (let d = step / 2; d < len; d += step) {
    const x = x1 + (x2 - x1) * d / len, y = y1 + (y2 - y1) * d / len;
    out.push(`M${(x - nx * 5).toFixed(1)} ${(y - ny * 5).toFixed(1)}L${(x + nx * 5).toFixed(1)} ${(y + ny * 5).toFixed(1)}`);
  }
  return out.join("");
};
const FENCE = [[40, 82, 40, 300], [40, 300, 190, 300], [240, 300, 400, 300], [400, 300, 400, 82]];
const DRAWING = `<svg class="pl-svg" viewBox="0 0 480 360" role="img" aria-labelledby="plSvgT" xmlns="http://www.w3.org/2000/svg">`
  + `<title id="plSvgT">Drawing of a backyard pool from above: the house wall on one side and a fence on the other three, a gate that swings out, and the pump outside the fence. The words House, Pool and Outside the fence label the parts. Numbers 1 to 6 match the list.</title>`
  + `<rect x="0" y="0" width="480" height="360" rx="18" fill="${C.ivory}"/>`
  + `<rect x="40" y="82" width="360" height="218" fill="${C.grass}"/>`
  + `<rect x="20" y="16" width="400" height="66" rx="4" fill="${C.house}" stroke="${C.navy}" stroke-width="2"/>`
  + `<rect x="228" y="70" width="34" height="12" rx="2" fill="${C.brass}"/>`
  + `<rect x="112" y="128" width="196" height="116" rx="20" fill="${C.water}" stroke="${C.waterEdge}" stroke-width="3"/>`
  + `<path d="M140 170q12-8 24 0t24 0t24 0M200 205q12-8 24 0t24 0t24 0" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity=".8"/>`
  + FENCE.map(([a, b, c, d]) => `<path d="M${a} ${b}L${c} ${d}" stroke="${C.brass}" stroke-width="5" stroke-linecap="round"/><path d="${pickets(a, b, c, d, 14)}" stroke="${C.brass}" stroke-width="2"/>`).join("")
  + `<path d="M190 300L225.4 335.4" stroke="${C.navy}" stroke-width="5" stroke-linecap="round"/>`
  + `<path d="M240 300A50 50 0 0 1 225.4 335.4" fill="none" stroke="${C.navy}" stroke-width="2" stroke-dasharray="4 4"/>`
  + `<circle cx="234" cy="293" r="4.5" fill="${C.navy}"/>`
  + `<rect x="436" y="168" width="26" height="40" rx="5" fill="${C.navy}"/><circle cx="449" cy="182" r="6" fill="none" stroke="#fff" stroke-width="2"/>`
  + `<path d="M404 222H432M404 216v12M432 216v12" stroke="${C.ink}" stroke-width="2.5" stroke-linecap="round"/>`
  + word(70, 56, "House", { size: 17 }) + word(272, 230, "Pool", { size: 17, anchor: "middle" }) + word(60, 340, "Outside the fence", { size: 14, weight: 500, fill: C.muted })
  + mark(1, 40, 190) + mark(2, 330, 300) + mark(3, 258, 338) + mark(4, 216, 276) + mark(5, 245, 48) + mark(6, 449, 140)
  + `</svg>`;
const key = (n, title, text) => `<li><span class="n" aria-hidden="true">${n}</span><span><b>${title}</b>${text}</span></li>`;
const FENCE_FIG = `<figure class="pl-fig"><p class="cap">Horry County's pool fence rule, outside city limits</p><div class="pl-fig-in">${DRAWING}`
  + `<ol class="pl-key" aria-label="What the numbers in the drawing show">`
  + key(1, "Height", "At least 48 inches tall, measured on the side away from the pool.")
  + key(2, "Gaps", "No opening a 4-inch ball could pass through. The gap under the fence is at most 2 inches over grass, or 4 over concrete.")
  + key(3, "The gate", "It opens outward, away from the pool. It closes by itself and latches by itself.")
  + key(4, "The latch", "A latch lower than 54 inches goes on the pool side, at least 3 inches below the top of the gate.")
  + key(5, "Doors and windows", "Where the house wall is part of the barrier, each door to the pool needs an alarm. Each window with a sill under 48 inches needs one too.")
  + key(6, "The pump", "Pumps, filters and heaters sit at least 36 inches from the outside of the fence, so they cannot be used to climb over it.")
  + `</ol></div><figcaption>Our drawing of section 305 of the 2021 International Swimming Pool and Spa Code, as Horry County's pool fence form quotes it.</figcaption></figure>`;

/* ---- The glance row under the H1 (rows 20, 1 to 6, 19). ---- */
const AN = F.air_normals_f, hi = (m) => Math.round(AN[m].high);
if (hi(6) !== 85 || hi(7) !== 88 || hi(8) !== 87 || hi(9) !== 83 || hi(5) !== 79 || hi(10) !== 76) throw new Error("row 19 moved");
const GLANCE = PK.glance([
  { icon: "home", label: `About ${about10(CP.listings)} houses`, text: "for sale share a neighborhood pool" },
  { icon: "beach", label: "Near the ocean", text: "where a house is most likely to have its own pool" },
  { icon: "calendar", label: "June to September", text: "average daily highs above 80 degrees" },
]);

/* ---- The photo (VERIFY.md, Photos: public domain; frames up to 175738d are inside Surfside Beach). ---- */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("surfside-beach-houses-with-pools-2011", PHOTOS[0].caption);
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, insurers or tax advisers, and nothing on this page is legal, insurance or tax advice. For the rule on one property, ask the county or city building office or a South Carolina attorney.</p>`;
const AFTER = () => { const c = ph.credits(); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* ---- Links ---- */
const AFF = "https://www.horrycountysc.gov/media/r2sebvu1/pool-fence-affidavit-2021-ispsc.pdf";
const T6_9 = "https://www.scstatehouse.gov/code/statmast.php?title=6&chapter=9";
const BCC = "https://llr.sc.gov/bcc/PDFfiles/Building%20Codes%20in%20Effect%20for%20South%20Carolina%20Final.pdf";
const T40_59 = "https://www.scstatehouse.gov/code/statmast.php?title=40&chapter=59";
const LLR = "https://www.llr.sc.gov/res/PDF/FAQ/RBI%20FAQ.pdf";
const ASHI = "https://www.homeinspector.org/Resources/Standard-of-Practice";
const T12_37 = "https://www.scstatehouse.gov/code/t12c037.php";
const R61_51 = "https://www.des.sc.gov/sites/des/files/Library/Regulations/R.61-51.pdf";
const NAIC = "https://content.naic.org/article/consumer_insight_protecting_your_home_coverage_pools_hot_tubs_and_backyard_toys.htm";
const CPSC = "https://www.cpsc.gov/s3fs-public/Pool-or-Spa-Submersion-Estimated-Nonfatal-Drowning-Injuries-and-Reported-Drownings-2026-Report.pdf";
const NOAA = "https://www.ncei.noaa.gov/products/land-based-station/us-climate-normals";

/* ---- The page's own styles (the pilots' treatment, prefix pl-). ---- */
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.82),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const INK = "#8a5226", RULE = "rgba(28,32,40,.16)";
const S = "main#main";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line. */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  /* One block width (720 px, as the contents box and the offers). */
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  /* the chart: a narrower name column, so the bars use the box; small bars are short bars, not dots */
  + `@media (min-width:700px){${S} .c3-gchart [role=row]{grid-template-columns:minmax(0,14.5rem) minmax(0,1fr)!important}}`
  + `${S} .c3-gchart .b{border-radius:3px!important;min-width:4px!important}`
  /* the town table: plain rows under thin rules; on a phone each row is a block */
  + `${S} .pl-towns{width:100%;max-width:720px;border-collapse:collapse;margin:1.3rem 0 .6rem;font-size:1rem;font-variant-numeric:tabular-nums}`
  + `${S} .pl-towns caption{caption-side:top;text-align:left;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1.0625rem;margin-bottom:.6rem}`
  + `${S} .pl-towns thead th{padding:.5rem .6rem .5rem 0;border-bottom:2px solid var(--navy);color:var(--navy);text-align:right;font-family:var(--sans);font-size:.8rem;letter-spacing:.05em;text-transform:uppercase;vertical-align:bottom;line-height:1.3}`
  + `${S} .pl-towns thead th:first-child,${S} .pl-towns tbody th{text-align:left}`
  + `${S} .pl-towns tbody th,${S} .pl-towns td{padding:.7rem .6rem .7rem 0;border-bottom:1px solid ${RULE};vertical-align:top;line-height:1.45}`
  + `${S} .pl-towns tbody th a{color:var(--navy);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.18em}`
  + `${S} .pl-towns tbody th{font-family:var(--sans);font-weight:600;color:var(--navy)}${S} .pl-towns td{text-align:right;color:var(--muted);white-space:nowrap}`
  + `${S} .pl-towns tr.all th,${S} .pl-towns tr.all td{color:var(--navy);font-weight:700;border-bottom:2px solid var(--navy)}`
  + `@media (max-width:699px){${S} .pl-towns thead{display:none}${S} .pl-towns,${S} .pl-towns tbody,${S} .pl-towns tr,${S} .pl-towns tbody th,${S} .pl-towns td{display:block;width:auto}`
  + `${S} .pl-towns tr{padding:.75rem 0;border-bottom:1px solid ${RULE}}${S} .pl-towns tbody th,${S} .pl-towns td{padding:0;border:0!important;text-align:left}`
  + `${S} .pl-towns tbody th{font-size:1.0625rem;margin-bottom:.25rem}${S} .pl-towns td{display:flex;justify-content:space-between;gap:1rem;white-space:normal}`
  + `${S} .pl-towns td::before{content:attr(data-l);color:var(--muted);white-space:nowrap}${S} .pl-towns td{color:var(--navy)}${S} .pl-towns caption{display:block;width:auto}}`
  + `${S} .pl-note{max-width:720px;color:var(--muted);font-size:.95rem;line-height:1.55;margin:.4rem 0 1.4rem}`
  /* cards, only for the one choice: your own pool or a neighborhood pool */
  + `${S} .pl-cards{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.75rem;max-width:720px}`
  + `@media (min-width:760px){${S} .pl-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .pl-cards>li{margin:0;padding:1.1rem 1.15rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55}`
  + `${S} .pl-cards .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin-bottom:.3rem}`
  + `${S} .pl-cards b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.15rem;line-height:1.35;margin-bottom:.4rem}`
  + `${S} .pl-cards p{margin:0 0 .6rem;font-size:1rem;line-height:1.6}${S} .pl-cards p:last-child{margin-bottom:0}`
  /* large numbers under a thin rule, no box */
  + `${S} .pl-stat{max-width:720px;margin:1.2rem 0 1.5rem}`
  + `${S} .pl-stat .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .pl-stat ul{list-style:none;margin:0;padding:0;display:grid;gap:1rem 2rem}@media (min-width:600px){${S} .pl-stat ul{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .pl-stat li{margin:0;padding:.75rem 0 0;border-top:1px solid ${RULE}}${S} .pl-stat strong{display:block;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,6vw,2.1rem);line-height:1.05;margin-bottom:.3rem}`
  + `${S} .pl-stat span{display:block;color:var(--muted);line-height:1.5;font-size:1rem}`
  /* the drawing: one figure, the drawing beside its key on a wide screen, no box inside a box */
  + `${S} figure.pl-fig{max-width:720px;margin:1.3rem 0 1.5rem;padding:0!important;background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}`
  + `${S} .pl-fig .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .7rem}`
  + `${S} .pl-fig-in{display:grid;gap:1rem 1.6rem;align-items:start}@media (min-width:700px){${S} .pl-fig-in{grid-template-columns:minmax(0,1.1fr) minmax(0,1fr)}${S} .pl-svg{position:sticky;top:110px}}`
  + `${S} .pl-svg{display:block;width:100%;height:auto;border-radius:18px;box-shadow:0 10px 26px -18px rgba(28,32,40,.35)}`
  + `${S} .pl-key{list-style:none;margin:0;padding:0}${S} .pl-key li{display:flex;gap:.7rem;align-items:flex-start;margin:0;padding:.6rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.5;font-size:1rem}`
  + `${S} .pl-key li:first-child{border-top:0;padding-top:0}${S} .pl-key .n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.7rem;height:1.7rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.9rem}`
  + `${S} .pl-key b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.02rem;line-height:1.3;margin-bottom:.1rem}`
  + `${S} .pl-fig figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.8rem;padding:0!important}`
  /* short facts and the neighborhoods: a plain list under thin rules */
  + `${S} .pl-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:0;max-width:720px}`
  + `${S} .pl-plain li{margin:0;padding:.85rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}${S} .pl-plain li:last-child{border-bottom:1px solid ${RULE}}`
  + `${S} .pl-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.35;margin-bottom:.3rem}`
  + `${S} .pl-nb b a{color:var(--navy);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.18em}${S} .pl-nb b{font-weight:600}`
  + `${S} .pl-nb{grid-template-columns:minmax(0,1fr)}${S} .pl-nb li{min-width:0}${S} a.pl-ask{display:table;max-width:100%;margin-top:.45rem;color:${INK};font-family:var(--sans);font-weight:600;font-size:1rem;text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.2em}`
  /* A wide screen: the photo beside the paragraphs on where pool homes are. */
  + `@media (min-width:1100px){${S} .pl-side{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:auto auto 1fr;column-gap:2.5rem;max-width:1000px;align-items:start}`
  + `${S} .pl-side>*{grid-column:1}${S} .pl-side>.c3-aerial{grid-column:2;grid-row:1/4;margin:.3rem 0 1.2rem!important;max-width:none!important}`
  + `${S} .pl-side>.c3-aerial figure{margin:0!important}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px}`
  + `${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.92rem}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .pl-cards b,${S} .pl-plain b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* a phone: the three hero tiles as short rows, not squeezed columns */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid ${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid ${RULE}!important}}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from the pilots: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* The FAQ asks what the body does not answer (review round 1), each from a verified row. */
const FAQ = [
  { q: "Are there homes with a pool under $300,000 in Myrtle Beach?", a: `Few. On the day we counted, ${BANDS[0].pool} of the ${n0(BANDS[0].houses)} houses for sale in Horry County at ${money(300000)} or less had their own pool. ${CP.at_or_under["300000"]} houses at that price were in a neighborhood with a shared pool.` },
  { q: "Does a pool add value to a home in Myrtle Beach?", a: "On asking prices, yes. At every size we checked, houses with a pool ask more than houses without one. Part of that gap comes from where they are: nearer the beach and more often on the water." },
  { q: "Do pool homes in Myrtle Beach allow short-term rentals?", a: `More often than other houses. About ${Math.round(TR.str_allowed.pool_pct)} percent of houses for sale with their own pool say short-term rentals are allowed, against about ${Math.round(TR.str_allowed.houses_pct)} percent of all houses.` },
  { q: "Are pool homes near Myrtle Beach in gated communities?", a: `About 1 in ${oneIn(TR.gated.pool, SH.pool)} houses for sale with their own pool is in a gated community, against about 1 in ${oneIn(TR.gated.houses, SH.houses)} of all houses.` },
  { q: "Do townhouses near Myrtle Beach have a pool?", a: `Many share one. Half of the ${n0(TH.all_townhouses)} townhouses for sale in Horry County, ${n0(TH.listings)}, are in a community with a shared pool. Their middle asking price is about ${money(TH.median_ask_5k)}.` },
];
if (TH.listings * 2 !== TH.all_townhouses) throw new Error("row 27: 'half' no longer holds");

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: `Homes With a Pool in Myrtle Beach: 1 in ${oneIn(SH.pool, SH.houses)} Houses Has One`,
  description: `About 1 in ${oneIn(SH.pool, SH.houses)} houses for sale near Myrtle Beach has its own pool. Where they are, five neighborhoods with a shared pool, upkeep and the fence rule.`,
  ogTitle: "Homes with a pool in Myrtle Beach: where they are, neighborhoods with a shared pool, and the county's fence rule",
  crumb: "Pool Homes",
  eyebrow: "Buying a home",
  h1: "Homes with a pool in Myrtle Beach",
  h1em: `About 1 house in ${oneIn(SH.pool, SH.houses)} for sale has its own pool. Many more share one.`,
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: "Where the pool homes are, the neighborhoods with a shared pool, and what Horry County requires around a pool.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Want the pool homes in your price range? We will send them.", label: "Send us your price range", href: CTA },
  author: "devin",
  shortAnswer: [
    `A house with its own pool is most likely near the ocean and at a higher price. The middle one asks about ${money(MED.ask.pool)}. The row of homes above shows some of them.`,
    `On a smaller budget, the usual way to have a pool is a neighborhood with a shared one, such as The Farm at Carolina Forest or Berkshire Forest. There the pool comes with the homeowners association (HOA) fee. Our ${h.a("/submarkets/myrtle-beach/plantation-point/", "Plantation Point homes guide")} shows one Myrtle Beach neighborhood where houses have in-ground pools.`,
  ],
  sections: [
    { h2: "Where are the homes for sale with a pool in Myrtle Beach?", toc: "Where", id: "where", html: () =>
      ph.css() +
      `<div class="pl-side">` +
      h.p(`A house near the ocean is the most likely to have its own pool. About 1 in 3 houses for sale with a pool is east of US 17, the highway along the coast. Of all houses for sale, about 1 in 6 is.`) +
      PHOTO +
      h.p(`Surfside Beach and the Garden City area have the highest share. In each, 1 house in ${Math.round(100 / SURF.pct)} or more for sale has its own pool.`) +
      `</div>` +
      G.homesCss() + G.homes("pool-homes-east-of-17", "pool homes east of US 17", "", "Houses with a pool for sale east of US 17") +
      h.p(`We checked every house for sale on our site on ${DAY} and counted the ones that list their own pool:`) +
      TOWNS +
      h.p(`${SMALL.map((p) => `${label(p.place)} (${p.pool})`).slice(0, -1).join(", ")} and ${label(SMALL[SMALL.length - 1].place)} (${SMALL[SMALL.length - 1].pool}) each had fewer than 10, too few for a middle price. Across the county line in Georgetown County, ${PAW.pool} of the ${PAW.houses} houses for sale in ${h.a("/homes/map/?q=house%20with%20a%20pool%20in%20pawleys%20island", "Pawleys Island")} have a pool.`) },

    { h2: "How much does a house with a pool cost in Myrtle Beach?", toc: "Prices", id: "cost", html: (bg) =>
      h.p(`A private pool comes mostly with the top of the market. Over ${money(1000000)}, more than half of houses for sale have one.`) +
      CHART +
      h.p(`At the same size, a house with a pool still asks far more. Houses of 1,500 to 1,999 square feet ask about ${money(S15.pool.median_ask_5k)} with a pool and ${money(S15.not_pool.median_ask_5k)} without. At 3,000 to 3,999 square feet it is about ${money(S30.pool.median_ask_5k)} against ${money(S30.not_pool.median_ask_5k)}.`) +
      h.p(`That gap is not the price of a pool. Houses with a pool are more often on the water, about 1 in 5 against 1 in 7.`) +
      G.homes("pool-homes-under-400k", "pool homes at $400,000 or less", "", "Houses with a pool at $400,000 or less") +
      h.cta("Is that pool house priced right?", "Send us the listing. We set its asking price beside the houses most like it nearby, with and without a pool.", "Have us price a pool house", CTA, bg) },

    { h2: "Should you buy a house with a pool or use a community pool?", toc: "Own or shared", id: "own-or-shared", html: () =>
      h.p(`A house with its own pool asks more than twice as much in the middle as one in a neighborhood with a shared pool.`) +
      CHOICE +
      BUDGET },

    { h2: "Which neighborhoods near Myrtle Beach have a shared pool?", toc: "Neighborhoods", id: "neighborhoods", html: () =>
      h.p(`Five of them follow, from the lowest middle price to the highest. Each name opens its houses for sale on our map. The counts are from the same day as the town table.`) +
      NBLIST +
      h.p(`Each community on our ${h.a("/buyers/55-plus-communities/", "55+ communities page")} also has its own clubhouse and pool.`) },

    { h2: "What does a pool cost to keep up in Horry County?", toc: "Upkeep", id: "upkeep", html: (bg) =>
      h.p("A pool adds power, care and insurance to your bills. A pool you add later also raises your property tax.") +
      `<ul class="pl-plain" aria-label="What a pool adds to the cost of owning">`
      + `<li><b>Power for the pump</b>The pump can be a home's second largest user of energy. An ${h.ext(ES, "ENERGY STAR")} certified in-ground pump uses about 20 percent less and saves about ${money(50)} a year.</li>`
      + `<li><b>Chemicals and care</b>Each pool service company charges its own price for weekly care and chemicals. We get a quote for the house you want before you make an offer.</li>`
      + `<li><b>Insurance</b>Tell your insurer about the pool before you buy. A pool can raise the premium, and the insurer can ask whether it is covered or locked when no one is using it, and what fence you have. An umbrella policy adds liability coverage above your homeowners policy.</li>`
      + `<li><b>Property tax</b>A pool that is already there is part of the home's value for tax. If you add a pool after you buy, the county adds its full value to your home's value. There is a 15 percent limit on how much the county can raise a home's value at a countywide revaluation. It does not cover the new pool in its first taxed year. Our ${h.a("/buyers/property-taxes/", "property tax page")} has the rates.</li>`
      + `</ul>` +
      h.cta("What will this pool cost you to keep?", "Tell us which house. We get a quote from a pool service company and ask the seller for the pool's repair bills.", "Have us get a pool service quote", CTA, bg) },

    { h2: "Do you need a fence around a pool in Horry County?", toc: "Fence rule", id: "fence", html: () =>
      h.p(`Yes. Outside city limits, Horry County requires a fence or other barrier with gates around a pool. The county uses the 2021 International Swimming Pool and Spa Code.`) +
      
      h.p(`Inside a city such as Myrtle Beach or North Myrtle Beach, the city's own building official issues the pool permit. South Carolina has no statewide pool code, so each city decides its own rule. We ask the city's building office about the house you want.`) +
      h.p(`We read the county's pool fence form, which quotes the code, and drew its rule:`) +
      FENCE_FIG +
      `<ul class="pl-plain" aria-label="Three more parts of the county's rule">`
      + `<li><b>Covers instead of a fence</b>A hot tub with a safety cover that locks needs no fence. Neither does a pool with a powered safety cover that meets the safety standard.</li>`
      + `<li><b>Instead of door alarms</b>The code also allows a safety cover on the pool, tested and labeled to the safety standard. The county can approve another protection, such as doors that close and latch by themselves.</li>`
      + `<li><b>A new pool</b>It needs a county permit and inspections, and no one may swim in it until the county approves them.</li>`
      + `</ul>` +
      h.p(`The rule is there for small children. Most children who drown in a pool or spa drown at a home, the ${h.ext(CPSC, "Consumer Product Safety Commission")} reports.`) },

    { h2: "Do home inspectors check pools in South Carolina?", toc: "Inspection", id: "inspection", html: (bg) =>
      h.p(`Not unless you ask. The standard South Carolina home inspectors follow comes from the ${h.ext(ASHI, "American Society of Home Inspectors")}. It does not require them to inspect a pool, a hot tub or a fence.`) +
      h.p(`You and the inspector can agree to add the pool. The inspector must tell you before the inspection what it will not cover.`) +
      h.cta("Buying a house with a pool?", "Tell us which house. We ask the seller for the pool's county permit papers and tell you what the inspection will leave out.", "Have us look into the pool", CTA, bg) },
  ],
  pageImages: [{ "@type": "ImageObject", url: `https://chapter3realty.com/${PHOTOS[0].file}`, contentUrl: `https://chapter3realty.com/${PHOTOS[0].file}`, width: PHOTOS[0].width, height: PHOTOS[0].height, description: PHOTOS[0].alt }],
  afterSources: () => AFTER(),
  faqTitle: "Pool homes FAQ",
  faq: FAQ,
  sources: [
    { name: "Horry County fence form", href: AFF },
    { name: "SC Code 6-9", href: T6_9 },
    { name: "SC codes council", href: BCC },
    { name: "SC Code 40-59", href: T40_59 },
    { name: "LLR inspector FAQ", href: LLR },
    { name: "ASHI standard", href: ASHI },
    { name: "SC Code 12-37", href: T12_37 },
    { name: "DES R.61-51", href: R61_51 },
    { name: "NAIC", href: NAIC },
    { name: "ENERGY STAR", href: ES },
    { name: "CPSC", href: CPSC },
    { name: "NOAA normals", href: NOAA },
    { name: "Golf and Yacht Club HOA", href: "https://www.mbgyc.com/" },
    { name: "Waterbridge HOA", href: "https://waterbridgehoa.com/" },
    { name: "Plantation Lakes POA", href: "https://www.plantationlakespoa.com/community.html" },
  ],
  sourcesNote: `Homes for sale: our count of the listings on our site, Horry County, ${DAY}, asking prices. Source: Coastal Carolinas Association of REALTORS® Multiple Listing Service (CCMLS).`,
  bottomCta: { h2: "Want a pool home? We will find it.", p: "Tell us your price and the towns you like. We set up a search for houses with a pool, or in a neighborhood with one, and send you the matches.", label: "Have us set up your pool-home search", href: CTA },
  keywords: "homes with a pool Myrtle Beach, houses for sale with pool Myrtle Beach SC, private pool homes Horry County, neighborhoods with a community pool Myrtle Beach, pool fence requirements Horry County, do home inspectors check pools South Carolina, pool upkeep cost, does a pool increase property taxes SC",
  about: "Homes for sale with a pool in Myrtle Beach and Horry County, South Carolina",
});
