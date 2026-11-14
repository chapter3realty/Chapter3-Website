/* /buyers/new-construction/builders/ - new home builders in Myrtle Beach: which builders sold the most new homes in Horry
 * County in 12 months (our count of county deeds, as a chart), where each builds by mailing town and community, what its
 * homes sold for and what it asks now, who owns the names on the signs, the warranty and own lender each states in its
 * annual report, and what we check with any builder before you sign. The general guide, /buyers/new-construction/, owns
 * the rest (new or nearly new, the ten busiest communities and what they have, the first tax bill, lot premiums, your
 * own agent, incentives and the builder's lender, inspections, warranty law); this page links each in one sentence.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 2, 2026-11-08, after review round 1 (REVIEW-1.md in the batch folder):
 * the five community companies off the ranking (15 builders), a profile of each of the five largest builders, the other
 * builders in one list, no photo, no asking-price column, no lender percentages, a dot map sized by homes. Version 1, 2026-11-08. Design: the approved pilots of batch 2026-11-a
 * (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line headline with the italic
 * sub line at about half the H1 size, the answer first, one chart in the one card style, plain tables and lists under
 * thin rules, one block width of 720 px, and on wide screens the worked example beside the paragraphs that explain it.
 * No cards: the reader compares numbers, which a table does better. DESIGN.md in the batch folder says why.
 * Facts: Blog-Brain batches/2026-11-n/buyers-builders/facts.md, VERIFIED rows, and CORRECTED rows only in the
 * verifier's wording (VERIFY.md). Struck wording: buyers-builders-struck.json (no 5,280 or 17,778, no 17 builders, no
 * H&H Homes as its own builder, no $295,000, no Eden Springs in Conway, no plat names the builders do not sell under,
 * no "large builders" side by side, no "rental owners", no 147, no builder named for the five community companies,
 * no Lennar 84 percent without "who used a mortgage", no Beazer with no mortgage company as a present fact, no license
 * rule without the general contractor license).
 * Data, never typed (website working copy, data/2026-11-n/buyers-builders/):
 *   findings-verified.json   the verifier's re-run of analyze.py (H&H under Dream Finders, RERECORD dropped, the
 *                            owner-sold median on parcels with a building): rows 1 to 10. Every chart and table here
 *                            reads it. Row 10's company count is the file's 147 less one person ("GIANG CO M",
 *                            VERIFY.md correction 8): 146, D.R. Horton 56.
 * Typed and checked: the annual-report rows 11 to 24 (text, each cell in the verifier's wording) and the license rule
 * (row 25, SC Code 40-59-20(6), 40-59-30(A), 40-59-270).
 * Photos: none. Review 1 cut the 2023 aerial (it showed cleared land and no house). The photo partner's shot list for a
 * later version is in the batch folder (shot-list.md).
 * Owner questions (OWNER-QUESTIONS.md): O1 who pays our fee on a new build (not answered here; the general guide owns
 * it), Q2 the license-check line (proposed default yes; it is in the checklist).
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/buyers/new-construction/builders/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "buyers-builders");
const F = JSON.parse(fs.readFileSync(path.join(DATA, "findings-verified.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(msg); };
const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const r1k = (v) => "$" + (Math.round(v / 1000) * 1000).toLocaleString("en-US");
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthYear = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${iso.slice(0, 4)}`;
const FROM = monthYear(F.deeds_from), TO = monthYear(F.deeds_to);
const DAY = new Date(F.listings.pulled).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
const CTA = "/contact/";
const MAP = "/homes/map/?has=new_construction,county_horry";

/* ---- Rows 1 to 3: the totals. ---- */
must(F.deeds_from === "2025-11-01" && F.deeds_to === "2026-10-31", "row 1: the window moved");
must(F.builder_sales === 5277 && F.home_sales_kept === 17774 && Math.round(F.builder_share_pct / 10) === 3, "row 1 moved");
must(F.builders_with_50_or_more === 16 && F.top2_share_pct === 44.8 && F.top5_share_pct === 67.0, "row 2 moved");
must(r1k(F.builder_median_price) === "$335,000" && r1k(F.other_median_price_seller_a_person_building_on_roll) === "$306,000", "row 3 moved");
const TOP2 = Math.round(F.top2_share_pct);

/* The builders with 50 or more sales, in the file's order (most first). The five community companies are left off the
   ranking (review 1): no verified row ties them to one builder (row 15 struck), and their deeds name no builder. They are
   named once, under the chart. Great Southern Homes is named as its deeds name it, with its owner now (row 13). */
const GROUP = "Chesapeake Homes (community companies)";
const SHOW = { "Stanley Martin (Great Southern Homes)": "Great Southern Homes" };
const nm = (b) => SHOW[b] || b;
const B16 = F.by_builder.filter((b) => b.sales >= 50);
must(B16.length === F.builders_with_50_or_more, "row 2: the builder list moved");
const BLD = B16.filter((b) => b.builder !== GROUP);
const N50 = BLD.length;
must(N50 === 15, "review 1: 15 builders with 50 or more, the community companies apart");
must(BLD.map((b) => `${nm(b.builder)}:${b.sales}`).join() === "D.R. Horton:1397,Lennar:967,Ryan Homes:477,Pulte Homes:382,Meritage Homes:313,Mungo Homes:206,Great Southern Homes:182,Beverly Homes:182,Beazer Homes:156,Dream Finders Homes:149,Starlight Homes:148,Toll Brothers:100,Ashton Woods:94,DRB Homes:61,Howell Homes:52", "row 2: the counts moved");
const BY = Object.fromEntries(F.by_builder.map((b) => [b.builder, b]));
const DRH = BY["D.R. Horton"], LEN = BY["Lennar"], RYAN = BY["Ryan Homes"], PUL = BY["Pulte Homes"], MER = BY["Meritage Homes"], TOLL = BY["Toll Brothers"], STAR = BY["Starlight Homes"];
const GRP = BY[GROUP];
must(GRP.sales === 239 && GRP.towns[0][0] === "Myrtle Beach" && GRP.towns[1][0] === "Little River" && (GRP.towns[0][1] + GRP.towns[1][1]) / GRP.sales > 0.66, "row 15: the community companies moved");
must(r1k(LEN.price.median) === "$258,000" && r1k(STAR.price.median) === "$259,000" && r1k(TOLL.price.median) === "$612,000", "row 3: the price range moved");
must(Math.round(100 / DRH.share_pct) === 4, "row 2: D.R. Horton 1 in 4 moved");
must(BY["Dream Finders Homes"].price.median === 309000, "row 3: Dream Finders moved");

/* ---- The chart (rows 2, 3): homes sold by each builder, the middle price beside the name. ---- */
const CHART = G.bars(BLD.map((b, i) => ({
  name: b.builder === "Stanley Martin (Great Southern Homes)" ? "Great Southern Homes, now Stanley Martin" : nm(b.builder),
  feature: `about ${r1k(b.price.median)}`,
  value: b.sales, valueText: n0(b.sales), reference: i >= 5,
})), { caption: "New homes each builder sold to a first owner in Horry County", nameLabel: "Builder", featureLabel: "middle price", valueLabel: "homes sold", compact: true,
  note: `Our count of county deeds recorded ${FROM} to ${TO}: houses, townhouses and condos a builder sold to its first owner. Builders that sold 50 or more. The middle price is the one half sold above and half below. We count homes sold and do not rate build quality.` });

/* ---- Row 4: the town table (towns with 40 or more new-home sales; the builders with 10 or more there, top three, names
   only). The community companies are not a builder, so they are not named here; the town totals still count their homes. ---- */
const PAGE = { "Conway": "/submarkets/conway/", "Myrtle Beach": "/submarkets/myrtle-beach/", "North Myrtle Beach": "/submarkets/north-myrtle-beach/", "Little River": "/submarkets/little-river/", "Murrells Inlet": "/submarkets/murrells-inlet/", "Surfside Beach": "/submarkets/surfside-beach/" };
const TOWNS = F.by_town.filter((t) => t.sales >= 40);
must(TOWNS.map((t) => `${t.town}:${t.sales}`).join() === "Conway:1478,Longs:1340,Myrtle Beach:1131,North Myrtle Beach:383,Loris:315,Little River:256,Murrells Inlet:135,Aynor:125,Surfside Beach:70,Galivants Ferry:42", "row 4: the towns moved");
const BIG3 = TOWNS.slice(0, 3).reduce((s, t) => s + t.sales, 0);
must(Math.round(BIG3 / F.builder_sales * 4) === 3, "row 4: the 3 in 4 moved");
const topB = (t) => t.top.filter(([b, n]) => b !== GROUP && n >= 10);
const LEADS = (b) => TOWNS.filter((t) => topB(t)[0][0] === b).map((t) => t.town).join();
must(LEADS("D.R. Horton") === "Conway,Loris,Little River,Surfside Beach,Galivants Ferry" && LEADS("Lennar") === "Longs,Myrtle Beach,North Myrtle Beach", "row 4: the town leaders moved");
const lead = (t) => topB(t).slice(0, 3).map(([b]) => nm(b).replace(/ /g, "&nbsp;")).join(", ");
const townRow = (t) => `<tr><th scope="row">${PAGE[t.town] ? `<a href="${PAGE[t.town]}">${t.town}</a>` : t.town}</th>`
  + `<td class="num" data-l="New homes sold">${n0(t.sales)}</td>`
  + `<td class="txt" data-l="Builders that sold the most">${lead(t)}</td>`
  + `<td class="num" data-l="Middle price">${r1k(t.median_price)}</td></tr>`;
const TOWN_TABLE = `<table class="bd-t bd-towns"><caption>New homes sold, by mailing town</caption>`
  + `<thead><tr><th scope="col">Town</th><th scope="col" class="num">New homes sold</th><th scope="col">Builders that sold the most there</th><th scope="col" class="num">Middle price</th></tr></thead><tbody>`
  + TOWNS.map(townRow).join("") + `</tbody></table>`
  + `<p class="bd-note">Our count of county deeds for the same 12 months. Builders are listed with the most sales first. Towns with 40 or more new homes sold.</p>`;

/* ---- Row 4, as a picture: the dot map. Every kept sale at its parcel's centre, rounded to about 100 m (map-points.json,
   written by map_points.py from the verifier's rules). Review 1: the points are gathered into cells of about 1 km for each
   builder, and each dot's area grows with the homes it stands for, so a dot is a place, not a home. The five largest
   builders are drawn in five colours on top, the rest in gray under them, clipped to the county line
   (data/2026-10-d/buyers-new-construction/raw/horry-county-boundary.json, Census TIGERweb, reused) with the coast and towns
   of tools/area-map.js. Palette checked with the dataviz validator (light): contrast below 3:1 for three hues, so the key
   names each builder and the town table carries the numbers. No address, price or name. ---- */
const MP = JSON.parse(fs.readFileSync(path.join(DATA, "map-points.json"), "utf8"));
must(MP.builder_sales === F.builder_sales && MP.with_point === F.builder_sales, "map: the points do not match the count");
const TOP5 = BLD.slice(0, 5).map((b) => b.builder);
const HUE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"], OTHER = "#b9b0a2";
const dotMap = () => {
  const { loadGeo2 } = require(path.join(BB, "tools", "area-map.js"));
  const geo = loadGeo2();
  const ring = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-10-d", "buyers-new-construction", "raw", "horry-county-boundary.json"), "utf8")).features[0].geometry.rings[0].filter((_, i) => i % 2 === 0);
  const k = 560, cos = Math.cos(33.9 * Math.PI / 180), lon0 = -79.36, lat0 = 34.33;
  const X = (lon) => (lon - lon0) * cos * k, Y = (lat) => (lat0 - lat) * k;
  const W = 440, H = 430, CELL = 6;
  const pts = (r) => r.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join("L");
  const sea = [...geo.coast, [-78.0, 33.75], [-78.0, 32.9], [-79.6, 32.9], [-79.6, 33.1]];
  /* one cell per builder group: the weighted centre and the count of homes */
  const cells = (keep) => { const m = new Map();
    for (const [la, lo, bl, n] of MP.points) { if (!keep(bl)) continue; const x = X(lo), y = Y(la), key = Math.floor(x / CELL) + "," + Math.floor(y / CELL);
      const c = m.get(key) || { x: 0, y: 0, n: 0 }; c.x += x * n; c.y += y * n; c.n += n; m.set(key, c); }
    return [...m.values()].sort((a, b) => b.n - a.n); };
  const r = (n) => 1.6 + 1.05 * Math.sqrt(n);
  const layer = (keep, c, op) => cells(keep).map((d) => `<circle cx="${(d.x / d.n).toFixed(1)}" cy="${(d.y / d.n).toFixed(1)}" r="${r(d.n).toFixed(1)}"/>`).join("")
    .replace(/^/, `<g fill="${c}" fill-opacity="${op}" stroke="#fff" stroke-width=".8">`) + `</g>`;
  const FT = 'font-family="Inter,system-ui,sans-serif"';
  const HALO = 'paint-order="stroke" stroke="#fbf8f3" stroke-width="6" stroke-linejoin="round"';
  const T = Object.fromEntries(geo.towns.map((t) => [t.name, t]));
  const LAB = [["Loris", 0, -16, "middle"], ["Longs", 0, -15, "middle"], ["Aynor", 0, -15, "middle"], ["Conway", -13, 7, "end"],
    ["Little River", 4, -16, "middle"], ["North Myrtle Beach", 40, 36, "middle", ["North Myrtle", "Beach"]],
    ["Myrtle Beach", 14, 18, "start"], ["Surfside Beach", 12, 22, "start"]];
  const towns = LAB.map(([name, dx, dy, a, lines]) => { const t = T[name]; if (!t) throw new Error(`map: no town ${name}`);
    const x = X(t.lon), y = Y(t.lat);
    const txt = (lines || [name]).map((l, i) => `<tspan x="${(x + dx).toFixed(1)}" dy="${i ? 23 : 0}">${l}</tspan>`).join("");
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#fff" stroke="#1c2028" stroke-width="2"/>`
      + `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${a}" ${FT} font-size="21" font-weight="600" fill="#1c2028" ${HALO}>${txt}</text>`; }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Map of Horry County with a dot for each place builders sold new homes in 12 months; a larger dot stands for more homes. The largest dots are around Conway, Longs, Myrtle Beach and North Myrtle Beach, and the dots thin out near Loris and Aynor. D.R. Horton's are largest around Conway, Lennar's and Meritage's around Longs, and Pulte's near Myrtle Beach and North Myrtle Beach. Almost none are on the beach itself.">`
    + `<defs><clipPath id="bd-frame"><rect width="${W}" height="${H}"/></clipPath><clipPath id="bd-county"><path d="M${pts(ring)}Z"/></clipPath></defs><g clip-path="url(#bd-frame)">`
    + `<rect width="${W}" height="${H}" fill="#e9e3d8"/>`
    + `<path d="M${pts(ring)}Z" fill="#fdfbf7" stroke="#5c6b78" stroke-width="1.6" stroke-linejoin="round"/>`
    + `<path d="M${pts(sea)}Z" fill="#d3e0e5"/>`
    + `<g clip-path="url(#bd-county)">` + layer((bl) => !TOP5.includes(bl), OTHER, ".7")
    + TOP5.map((bl, i) => ({ bl, i })).reverse().map(({ bl, i }) => layer((x) => x === bl, HUE[i], ".85")).join("") + `</g>`
    + `<text x="${W - 12}" y="${H - 36}" text-anchor="end" ${FT} font-size="19" font-style="italic" fill="#3f6275">Atlantic Ocean</text>`
    + towns + `</g></svg>`;
  const key = TOP5.map((bl, i) => `<span><i style="background:${HUE[i]}"></i>${bl}</span>`).join("") + `<span><i style="background:${OTHER}"></i>Every other seller</span>`;
  return `<figure class="bd-map">${svg}<div class="bd-key" aria-hidden="true">${key}</div>`
    + `<figcaption>Each dot is a place where a builder sold new homes. A larger dot stands for more homes. Map: Chapter3 Realty, from county deeds, county parcel records and Census map lines.</figcaption></figure>`;
};

/* ---- Row 5 (the verifier's community names) and row 7 (listings by the builder's own sales company, in aggregate):
   the five largest builders, each in one place. Review 1: the owner asked for what each builder's homes are like. ---- */
const tops = (b) => b.top_subdivisions.map((s) => s[0]);
must(tops(DRH)[0] === "AUBERON WOODS" && tops(DRH)[1] === "EDEN SPRINGS" && tops(LEN)[0] === "INDIGO GROVE" && tops(LEN)[1] === "KINGSTON OAKS", "row 5: D.R. Horton or Lennar moved");
must(tops(RYAN)[0] === "GRANDE DUNES NORTH" && tops(PUL).includes("CRESCENT COVE") && tops(PUL).includes("CHESTNUT GREENS") && tops(MER).includes("CYPRESS RIDGE") && tops(BY["Mungo Homes"])[0] === "ARCADIA", "row 5 moved");
must(tops(STAR).slice(0, 3).join() === "SPRING GROVE,ANDALUSIA,BAYVIEW", "row 5: Starlight moved");
must(BY["Mungo Homes"].towns[0][0] === "Conway" && Math.round(BY["Mungo Homes"].towns[0][1] / BY["Mungo Homes"].sales * 2) === 1, "row 5: Mungo's towns moved");
must(MER.towns[0][0] === "Longs" && MER.towns[0][1] / MER.sales > 0.85, "row 5: Meritage's towns moved");
must(PUL.towns.map((t) => t[0]).join() === "Myrtle Beach,North Myrtle Beach,Longs" && PUL.towns[1][1] === 114 && TOLL.towns.map((t) => t[0]).join() === "North Myrtle Beach,Murrells Inlet,Myrtle Beach", "row 5: Pulte or Toll towns moved");
const L = F.listings;
const LB = Object.fromEntries(L.by_builder.map((b) => [b.builder, b]));
/* the homes listed now: the median size to the nearest 100 sq ft; the bedroom words checked against the counts */
const sqft = (b) => n0(Math.round(LB[b].median_sqft / 100) * 100);
const share = (b, beds) => LB[b].beds.filter(([n]) => beds.includes(n)).reduce((s, [, c]) => s + c, 0) / LB[b].for_sale;
must(share("D.R. Horton", [3, 4]) > 0.8 && share("Lennar", [3, 4]) > 0.8 && share("Meritage Homes", [3, 4]) > 0.95 && share("Pulte Homes", [3]) > 0.6, "row 7: the bedroom counts moved");
must(LB["D.R. Horton"].types.house / LB["D.R. Horton"].for_sale > 0.9 && LB["Lennar"].types.townhouse >= 20 && LB["Pulte Homes"].types.house === LB["Pulte Homes"].for_sale && LB["Meritage Homes"].types.house === LB["Meritage Homes"].for_sale, "row 7: the home types moved");
must([sqft("D.R. Horton"), sqft("Lennar"), sqft("Pulte Homes"), sqft("Meritage Homes")].join("|") === "1,800|1,800|2,700|1,600", "row 7: the sizes moved");
const line = (k, v) => `<span class="bd-l"><em>${k}</em> ${v}</span>`;
const prof = (b, intro, where, homes, warranty, lender) => `<li><b>${b}</b><p>${intro}</p>`
  + line("Where:", where) + line("The homes:", homes) + line("Warranty:", warranty) + line("Lender:", lender) + `</li>`;
const NC = "/buyers/new-construction/";
must(BLD.slice(0, 5).map((b) => b.builder).join() === "D.R. Horton,Lennar,Ryan Homes,Pulte Homes,Meritage Homes" && BLD.slice(0, 5).sort((x, y) => y.price.median - x.price.median)[0] === PUL, "row 3: the five largest or their prices moved");
const PROFILES = `<ul class="bd-plain bd-prof" aria-label="The five largest builders">`
  + prof("D.R. Horton", `The most new homes of any builder, for about ${r1k(DRH.price.median)} in the middle.`,
    "Auberon Woods in Conway and Eden Springs in Longs, and the most homes in Conway, Loris and Little River.",
    `Its homes for sale now are mostly houses with 3 or 4 bedrooms, about ${sqft("D.R. Horton")} square feet in the middle.`,
    "1 year on most of the home, 2 years on the major systems of the house, 10 years on major structural parts.",
    "It owns one, DHI Mortgage.")
  + prof("Lennar", `The second most, for about ${r1k(LEN.price.median)} in the middle, the lowest price of these five.`,
    "The Overlook in Longs and Kingston Oaks in Conway, and the most homes in Longs, Myrtle Beach and North Myrtle Beach.",
    `Its homes for sale now are houses and townhouses, mostly with 3 or 4 bedrooms, about ${sqft("Lennar")} square feet in the middle.`,
    "At least 1 year on materials and workmanship. Its annual report gives no longer term.",
    "It owns one.")
  + prof("Ryan Homes", `The third most, for about ${r1k(RYAN.price.median)} in the middle.`,
    "Grande Dunes North Village, which has Longs mailing addresses, and more homes around Conway.",
    "Its owner, NVR, builds Ryan Homes mainly for first-time buyers and buyers moving up from their first home.",
    "Its annual report gives no term. We get the booklet from the builder.",
    "It owns one, NVR Mortgage.")
  + prof("Pulte Homes", `The fourth most, for about ${r1k(PUL.price.median)} in the middle, the highest price of these five.`,
    `${h.a("/buyers/55-plus-communities/del-webb-north-myrtle-beach/", "Del Webb North Myrtle Beach")} and Crescent Cove in Myrtle Beach, and more homes in Longs. Del Webb is PulteGroup's brand for active adults, and our ${h.a("/buyers/55-plus-communities/", "55+ guide")} compares it with the others.`,
    `Its homes for sale now are all houses, mostly with 3 bedrooms, about ${sqft("Pulte Homes")} square feet in the middle. That is larger than the others here.`,
    "1 year on the whole home, and some parts for up to 10 years.",
    "It owns one, Pulte Mortgage.")
  + prof("Meritage Homes", `The fifth most, for about ${r1k(MER.price.median)} in the middle.`,
    "Cypress Ridge in Longs. Nearly all its homes have Longs addresses.",
    `Its homes for sale now are houses with 3 or 4 bedrooms, about ${sqft("Meritage Homes")} square feet in the middle.`,
    "Generally 1 year on workmanship, 2 years on the systems of the house, and up to 10 years on the structure.",
    "It shares a mortgage company with a partner and works with lenders it prefers. It may pay part of the closing costs for buyers who use them.")
  + `</ul>`;

/* ---- Rows 12 to 14, 21 to 24: the other builders on the chart worth a line, each in one place. ---- */
const oth = (b, text) => `<li><b>${b}</b>${text}</li>`;
const OTHERS = `<ul class="bd-plain bd-2" aria-label="Other builders and who owns them">`
  + oth("Mungo Homes", "Its busiest community is Arcadia in Myrtle Beach, and about half its homes have Conway addresses. It is part of Clayton Properties Group, a Berkshire Hathaway company, and the deeds name Clayton Properties Group.")
  + oth("Great Southern Homes, now Stanley Martin", "Mostly Conway addresses. This South Carolina builder became part of Stanley Martin Homes in 2026, and Stanley Martin now lists its homes for sale. Before the sale, it gave 1 year on materials and workmanship, 2 years on plumbing, wiring and heating and air, and 10 years on the structure.")
  + oth("Starlight Homes", "Spring Grove in Aynor, Andalusia in Loris and Bayview in Conway, at some of the lowest prices on the chart. It is an Ashton Woods company. Ashton Woods also sells homes here under its own name, mostly with Little River addresses.")
  + oth("Dream Finders Homes", "Mostly Conway addresses. It came here by buying the homebuilding business of H&amp;H Constructors of Fayetteville, and its count includes those homes. It gives 1 year on workmanship and up to 10 years on the structure, and owns a mortgage company, Jet HomeLoans.")
  + oth("Beazer Homes", "It became part of Dream Finders Homes in 2026. Before that, its annual report said it owned no mortgage company and named several lenders for each community. It gave 1 to 2 years on workmanship and up to 10 years on certain structural failures.")
  + oth("Toll Brothers", "The highest prices on the chart. Its homes are around North Myrtle Beach, Murrells Inlet and Myrtle Beach, including SayeBrook. Many of its buyers get a limited 10-year warranty on the structure, and it owns a mortgage company.")
  + `</ul>`;
must(BY["Stanley Martin (Great Southern Homes)"].towns[0][0] === "Conway" && BY["Dream Finders Homes"].towns[0][0] === "Conway" && BY["Ashton Woods"].towns[0][0] === "Little River", "rows 13, 14: the towns moved");
must(BLD.slice().sort((x, y) => y.price.median - x.price.median)[0].builder === "Toll Brothers" && BLD.slice().sort((x, y) => x.price.median - y.price.median).slice(0, 3).map((b) => b.builder).includes("Starlight Homes"), "row 3: the highest or lowest moved");

/* ---- Row 6: three communities where two or more builders each sold 10 or more. ---- */
must(F.communities_two_plus_builders.map((c) => c[0]).join() === "ARCADIA,WATERBRIDGE,SAYEBROOK RESIDENTIAL", "row 6 moved");

/* ---- Rows 3, 7, 8: the price table. The price range of each builder's sales from the deeds, and how many of its homes
   are for sale in the MLS now (counted in aggregate). Review 1: the asking-price column is gone; two builders' asking
   middles sat above their whole sold range with no verified reason. A dash where the listings cannot be matched to the
   deeds (Howell Homes: VERIFY.md 7). ---- */
must(L.total_new_construction === 1086 && L.under_300k === 280, "row 7 moved");
const NO_MATCH = new Set(["Howell Homes"]);
const listedCell = (b) => {
  if (NO_MATCH.has(b.builder)) return "&mdash;";
  const l = LB[b.builder];
  if (!l) throw new Error(`row 7: no listings row for ${b.builder}`);
  return n0(l.for_sale);
};
const priceRow = (b) => `<tr><th scope="row">${nm(b.builder)}</th>`
  + `<td class="num" data-l="Typical price range">${r1k(b.price.p25)} to ${r1k(b.price.p75)}</td>`
  + `<td class="num" data-l="For sale now">${listedCell(b)}</td></tr>`;
const PRICE_TABLE = `<table class="bd-t bd-prices"><caption>What each builder's new homes sold for, and how many are for sale now</caption>`
  + `<thead><tr><th scope="col">Builder</th><th scope="col" class="num">Typical price range</th><th scope="col" class="num">For sale now</th></tr></thead><tbody>`
  + BLD.map(priceRow).join("") + `</tbody></table>`
  + `<p class="bd-note">Typical price range: half of each builder's homes sold inside it, by our count of county deeds for the same 12 months. For sale now: its new homes in the MLS on the day we counted. Great Southern Homes' homes for sale are listed by Stanley Martin. A dash means we could not match the builder's listings to its deeds.</p>`;
must(LB["Ryan Homes"].for_sale === 1 && LB["Lennar"].for_sale === 60 && LB["D.R. Horton"].for_sale === 248, "row 8 moved");

/* ---- Row 7: the worked example, a budget of $300,000 (among listings with a named builder). ---- */
const U3 = Object.fromEntries(L.by_builder.map((b) => [b.builder, b.at_or_under_300k]));
must(Math.min(U3["Beverly Homes"], U3["Stanley Martin (Great Southern Homes)"], U3["Starlight Homes"], U3["DRB Homes"]) === U3["DRB Homes"], "row 7: the 13 or more moved");
must(U3["D.R. Horton"] === 83 && U3["Lennar"] === 45 && U3["Beverly Homes"] === 22 && U3["Stanley Martin (Great Southern Homes)"] === 16 && U3["Starlight Homes"] === 16 && U3["DRB Homes"] === 13, "row 7: under $300,000 by builder moved");
const BUDGET = `<div class="bd-stat"><p class="k">On a budget of ${money(300000)}</p><ul>`
  + `<li><strong>${L.under_300k}</strong><span>new homes for sale at ${money(300000)} or less</span></li>`
  + `<li><strong>${U3["D.R. Horton"]}</strong><span>of them by D.R. Horton, the most of any builder</span></li>`
  + `<li><strong>${U3["Lennar"]}</strong><span>by Lennar, the next most</span></li></ul></div>`;

/* ---- Row 25 and the general guide's sections: what we check before you sign. ---- */
const chk = (title, text) => `<li><b>${title}</b>${text}</li>`;
const CHECK = `<ol class="bd-check" aria-label="What we check with any builder">`
  + chk("The license", `South Carolina requires a state license for anyone who builds a home for someone else on a job over $5,000. It can be a residential builder license or a general contractor license. Building without one is a misdemeanor. We check the builder's license with the state.`)
  + chk("The warranty, in writing", "We get the builder's warranty booklet. It says what each part of the house is covered for, for how long, and who you call.")
  + chk("The HOA", `We read the homeowners association (HOA) papers with you. They give the monthly fee, what it pays for, and ${h.a("/hoa/developer-control-turnover/", "when the builder hands the HOA to the owners")}.`)
  + chk("The lot premium and the upgrades", `A lot premium is an extra charge for a particular lot. Upgrades are the features you add, which builders call options. We compare both with the base price. Our guide lists ${h.a(NC + "#tax-bill", "what else the price leaves out")}, including the first full tax bill.`)
  + chk("The incentive and its lender", `Some incentives come only with the builder's own lender. We ask the builder in writing what it offers, and our guide covers ${h.a(NC + "#incentives", "whether to use the builder's lender")}.`)
  + chk("Your own inspection", `A new house can still have mistakes in it. We set up an inspection before you close, and our guide covers ${h.a(NC + "#inspections", "when to inspect a new home")}.`)
  + chk("Your own agent, from the first visit", `Tell us before your first visit or online sign-up. We register with the builder as your agent. Our guide explains ${h.a(NC + "#your-agent", "why the first visit matters")}.`)
  + `</ol>`;

/* ---- The glance row under the H1 (rows 1 to 3). ---- */
const GLANCE = PK.glance([
  { icon: "home", label: `${n0(F.builder_sales)} new homes`, text: "sold to their first owners in Horry County in a year" },
  { icon: "cards", label: `${N50} builders`, text: "sold 50 or more each" },
  { icon: "dollar", label: `About ${r1k(F.builder_median_price)}`, text: "middle price of a new home" },
]);

/* ---- Links ---- */
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const DHI = "https://www.sec.gov/Archives/edgar/data/882184/000088218425000081/dhi-20250930.htm";
const LENK = "https://www.sec.gov/Archives/edgar/data/920760/000162828026003870/len-20251130.htm";
const NVR = "https://www.sec.gov/Archives/edgar/data/906163/000090616326000018/nvr-20251231.htm";
const PHM = "https://www.sec.gov/Archives/edgar/data/822416/000082241626000007/phm-20251231.htm";
const MTH = "https://www.sec.gov/Archives/edgar/data/833079/000083307926000010/mth-20251231.htm";
const BZH = "https://www.sec.gov/Archives/edgar/data/915840/000091584025000075/bzh-20250930.htm";
const BZH8K = "https://www.sec.gov/Archives/edgar/data/915840/000110465926117198/tm2622398d20_8k.htm";
const TOL = "https://www.sec.gov/Archives/edgar/data/794170/000079417025000112/tol-20251031.htm";
const DFH = "https://www.sec.gov/Archives/edgar/data/1825088/000162828026010837/dfh-20251231.htm";
const UHG = "https://www.sec.gov/Archives/edgar/data/1830188/000183018826000009/uhg-20251231.htm";
const UHG8K = "https://www.sec.gov/Archives/edgar/data/1830188/000110465926054519/tm2613353d1_8k.htm";
const BRK = "https://www.sec.gov/Archives/edgar/data/1067983/000119312526083899/brka-20251231.htm";
const CPG = "https://claytonhomes.com/newsroom/press-releases/Clayton-Properties-Group-Acquires-Mungo-Homes";
const STARL = "https://www.starlighthomes.com/";
const T40_59 = "https://www.scstatehouse.gov/code/statmast.php?title=40&chapter=59";

/* ---- The page's own styles (the pilots' treatment, prefix bd-). ---- */
const INK = "#8a5226", RULE = "rgba(28,32,40,.16)";
const S = "main#main";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  /* The headline: the italic sub line at about half the H1's size, on its own line. */
  + `${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `${S} .detail-h1{text-wrap:balance}@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .detail-hero .detail-sub{display:none}`
  /* One block width (720 px, as the contents box and the offers). */
  + `${S} .c3-gchart{max-width:720px!important;box-sizing:border-box}`
  /* the three tables: plain rows under thin rules; on a phone each row is a block with its labels */
  + `${S} .bd-t{width:100%;max-width:720px;border-collapse:collapse;margin:1.3rem 0 .6rem;font-size:1rem;font-variant-numeric:tabular-nums}`
  + `${S} .bd-t caption{caption-side:top;text-align:left;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1.0625rem;line-height:1.4;margin-bottom:.6rem}`
  + `${S} .bd-t thead th{padding:.5rem .7rem .5rem 0;border-bottom:2px solid var(--navy);color:var(--navy);text-align:left;font-family:var(--sans);font-size:.8rem;letter-spacing:.05em;text-transform:uppercase;vertical-align:bottom;line-height:1.3}`
  + `${S} .bd-t thead th.num{text-align:right}`
  + `${S} .bd-t tbody th,${S} .bd-t td{padding:.7rem .7rem .7rem 0;border-bottom:1px solid ${RULE};vertical-align:top;line-height:1.45;text-align:left}`
  + `${S} .bd-t tbody th{font-family:var(--sans);font-weight:600;color:var(--navy)}${S} .bd-t tbody th a{color:var(--navy);text-decoration:underline;text-decoration-thickness:1px;text-underline-offset:.18em}`
  + `${S} .bd-t td{color:var(--muted)}${S} .bd-t td.num{text-align:right;white-space:nowrap}${S} .bd-t td:last-child,${S} .bd-t th:last-child{padding-right:0}`
  + `${S} .bd-warranty td.txt{font-size:.97rem;line-height:1.5}${S} .bd-warranty tbody th{width:22%}`
  + `@media (max-width:699px){${S} .bd-t thead{display:none}${S} .bd-t,${S} .bd-t tbody,${S} .bd-t tr,${S} .bd-t tbody th,${S} .bd-t td{display:block;width:auto!important}`
  + `${S} .bd-t caption{display:block;width:auto}${S} .bd-t tr{padding:.75rem 0;border-bottom:1px solid ${RULE}}${S} .bd-t tbody th,${S} .bd-t td{padding:0;border:0!important;text-align:left}`
  + `${S} .bd-t tbody th{font-size:1.0625rem;margin-bottom:.3rem}`
  + `${S} .bd-t td.num{display:flex;flex-wrap:wrap;justify-content:space-between;gap:0 1rem;white-space:nowrap;color:var(--navy);text-align:left}${S} .bd-t td.num::before{content:attr(data-l);color:var(--muted)}`
  + `${S} .bd-t td.txt{margin:.35rem 0 0;color:var(--navy)}${S} .bd-t td.txt::before{content:attr(data-l);display:block;color:var(--muted);font-family:var(--sans);font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;margin-bottom:.1rem}}`
  + `${S} .bd-note{max-width:720px;color:var(--muted);font-size:.95rem;line-height:1.55;margin:.4rem 0 1.4rem}`
  /* the dot map: on the page, no card; its key under it */
  + `${S} figure.bd-map{max-width:560px;margin:1.4rem 0 1.4rem;padding:0!important;${FLAT}}${S} .bd-map svg{display:block;width:100%;height:auto;border-radius:14px}`
  + `${S} .bd-key{display:flex;flex-wrap:wrap;gap:.35rem 1.1rem;margin:.7rem 0 .2rem}${S} .bd-key span{display:inline-flex;align-items:center;gap:.45rem;color:var(--navy);font-family:var(--sans);font-size:.95rem}`
  + `${S} .bd-key i{display:inline-block;width:.8rem;height:.8rem;border-radius:50%}${S} .bd-map figcaption{color:var(--muted);font-size:.92rem;line-height:1.55;margin-top:.5rem;padding:0!important}`
  /* plain lists under thin rules, two columns on a wide screen */
  + `${S} .bd-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:0 2rem;max-width:720px}`
  + `@media (min-width:760px){${S} .bd-2{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .bd-plain li{margin:0;padding:.8rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.55;font-size:1.0625rem}`
  + `${S} .bd-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.25rem}`
  /* the checklist: numbers on a thin rule, no box */
  + `${S} .bd-check{list-style:none;counter-reset:c;margin:1.1rem 0 1.4rem;padding:0;max-width:720px}`
  + `${S} .bd-check li{counter-increment:c;position:relative;margin:0;padding:.85rem 0 .85rem 2.7rem;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}${S} .bd-check li:last-child{border-bottom:1px solid ${RULE}}`
  + `${S} .bd-check li::before{content:counter(c);position:absolute;left:0;top:.9rem;display:inline-flex;align-items:center;justify-content:center;width:1.75rem;height:1.75rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.9rem}`
  + `${S} .bd-check b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.25rem}`
  /* large numbers under a thin rule, no box */
  + `${S} .bd-stat{max-width:720px;margin:1.2rem 0 1.5rem}`
  + `${S} .bd-stat .k{font-family:var(--sans);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .6rem}`
  + `${S} .bd-stat ul{list-style:none;margin:0;padding:0;display:grid;gap:.9rem 2rem}@media (min-width:600px) and (max-width:1099px){${S} .bd-stat ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .bd-stat li{margin:0;padding:.7rem 0 0;border-top:1px solid ${RULE}}${S} .bd-stat strong{display:block;color:var(--navy);font-family:var(--serif);font-weight:400;font-size:clamp(1.7rem,6vw,2.1rem);line-height:1.05;margin-bottom:.3rem}`
  + `${S} .bd-stat span{display:block;color:var(--muted);line-height:1.5;font-size:1rem}`
  /* A wide screen: the worked example beside the paragraphs that explain it. */
  + `@media (min-width:1100px){${S} .bd-side{display:grid;grid-template-columns:minmax(0,1fr) 300px;grid-template-rows:auto auto 1fr;column-gap:2.5rem;max-width:1000px;align-items:start}`
  + `${S} .bd-side>*{grid-column:1}${S} .bd-side>.bd-stat{grid-column:2;grid-row:1/4;margin:.3rem 0 1.2rem}}`
  /* the five profiles: a plain list under thin rules, one line for each fact */
  + `${S} .bd-prof li{padding:1rem 0 1.05rem}${S} .bd-prof p{margin:0 0 .45rem;color:var(--navy)}`
  + `${S} .bd-l{display:block;margin:.2rem 0 0;padding-left:6.4rem;text-indent:-6.4rem}${S} .bd-l em{display:inline-block;width:6.1rem;text-indent:0;font-style:normal;font-family:var(--sans);font-size:.8rem;letter-spacing:.06em;text-transform:uppercase;color:${INK};font-weight:700}`
  + `@media (max-width:519px){${S} .bd-l{padding-left:0;text-indent:0;margin-top:.45rem}${S} .bd-l em{display:block;width:auto}}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .bd-plain b,${S} .bd-check b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* a phone: the three hero tiles as short rows, not squeezed columns */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:1px solid ${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid ${RULE}!important}}`
  /* the contents list: no card, in columns between two rules (invest-condos) */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:1px solid ${RULE}!important;border-bottom:1px solid ${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* Work-arounds copied from the pilots: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We rank builders by homes sold in county records and rate no builder. Nothing on this page is legal advice. For the terms of one builder's contract, talk to a South Carolina attorney.</p>`;

/* The FAQ repeats only questions the page answers, said short. */
const FAQ = [
  { q: "Which home builder in Myrtle Beach is best?", a: `We rank builders by homes sold, not by quality. D.R. Horton sold the most new homes in Horry County. To judge one builder, check the seven things in the last section of this page, starting with its license and its written warranty.` },
  { q: "Is D.R. Horton or Lennar bigger in Myrtle Beach?", a: `D.R. Horton. It sold ${n0(DRH.sales)} new homes in Horry County in those 12 months, against ${n0(LEN.sales)} for Lennar. Lennar's homes sold for less in the middle, about ${r1k(LEN.price.median)} against about ${r1k(DRH.price.median)}.` },
  { q: "Is Del Webb part of Pulte?", a: "Yes. Del Webb is PulteGroup's brand for active adults. Pulte's count on this page includes the homes it sold at Del Webb North Myrtle Beach." },
  { q: "Why can't I find Ryan Homes in the listings?", a: `Few of its homes are listed in the MLS, the database brokers share. Ryan Homes sold ${n0(RYAN.sales)} homes here in those 12 months and had ${LB["Ryan Homes"].for_sale} listed on the day we counted. We ask the builder for its homes for sale directly.` },
  { q: "Who is Clayton Properties Group?", a: "The Berkshire Hathaway company that owns Mungo Homes. It is the seller on the deeds for Mungo's homes in Horry County." },
  { q: "Does a home builder need a license in South Carolina?", a: "Yes, for a home job over $5,000. Building without one is a misdemeanor." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: `New Home Builders in Myrtle Beach: ${N50} Ranked by Homes Sold`,
  description: `D.R. Horton and Lennar sold about ${TOP2}% of the ${n0(F.builder_sales)} new homes sold in Horry County in a year. Each large builder's towns, homes, prices and warranty.`,
  ogTitle: "New home builders in Myrtle Beach, ranked by homes sold: where each builds, what its homes are like and cost, its warranty and lender",
  crumb: "Builders",
  eyebrow: "Buying a new home",
  h1: "New home builders in Myrtle Beach, ranked by homes sold",
  h1em: `The ${N50} that sold 50 or more homes in Horry County in a year, where they build and what their homes cost.`,
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: "Every builder that sold 50 or more new homes in a year, the towns it builds in, what its homes are like and what they cost.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: `About ${n0(Math.round(L.total_new_construction / 10) * 10)} new homes are for sale now. We send you the ones that fit.`, label: "Send us your town and price", href: CTA },
  author: "devin",
  shortAnswer: [
    `D.R. Horton and Lennar build the most new homes around Myrtle Beach. Together they sold about ${TOP2} percent of the ${n0(F.builder_sales)} new homes sold to their first owners in Horry County in a year.`,
    `Ryan Homes, Pulte Homes and Meritage Homes come next, and ${N50} builders sold 50 or more. About 3 in 4 of the new homes are inland, with Conway, Longs and Myrtle Beach addresses.`,
  ],
  sections: [
    { h2: "Which builders build the most new homes around Myrtle Beach?", toc: "Who builds the most", id: "ranking", html: () =>
      h.p(`D.R. Horton sold the most, about 1 in 4 of the new homes. Each bar is one builder, with the middle price its buyers paid:`) +
      CHART +
      h.p(`The five largest sold about two-thirds of the new homes. A builder's new home sold for about ${r1k(F.builder_median_price)} in the middle, against about ${r1k(F.other_median_price_seller_a_person_building_on_roll)} for a home resold by its owner.`) +
      h.p(`Five more sellers are companies that each sell new homes in one community, such as Waterbridge SC LLC in Waterbridge. Their deeds name no builder, so we count them apart. Together they sold ${n0(GRP.sales)} homes, mostly with Myrtle Beach and Little River addresses.`) +
      h.p(`This page counts builders that sell new homes in their own communities. To build on a lot you own, you hire a builder under a construction contract. To buy the lot first, see our ${h.a("/buyers/land/", "guide to buying land in Horry County")}. The license check in the last section applies to that builder too, and our guide gives ${h.a(NC + "#how-long", "how long each kind of build takes")}.`) },

    { h2: "Where does each builder build in Horry County?", toc: "Where they build", id: "where", html: (bg) =>
      h.p(`Mostly inland, around Conway, Longs and Myrtle Beach. A mailing address is not the city limits: a Myrtle Beach address includes Carolina Forest and Socastee:`) +
      dotMap() +
      h.p(`Each town has its own leaders. Among the builders on the chart, D.R. Horton sold the most in Conway, Loris, Little River and Surfside Beach. Lennar sold the most in Longs, Myrtle Beach and North Myrtle Beach:`) +
      TOWN_TABLE +
      h.p(`Three communities let you compare builders in one visit. In each, two or more builders each sold 10 or more homes. In Arcadia, they are Mungo Homes, Pulte Homes and Lennar. In Waterbridge, they are D.R. Horton and the community company Waterbridge SC LLC. In SayeBrook, they are Toll Brothers, Pulte Homes and Carolina Cottage Homes.`) +
      h.p(`What the ten busiest new communities have, from pools to boat docks, is in ${h.a(NC + "#where", "our new construction guide")}.`) +
      h.cta("Compare two builders in one afternoon", "Tell us the town and your price. We pick the builders that build there at that price and set up the visits, as your agent from the first one.", "Have us plan your builder visits", CTA, bg) },

    { h2: "What are the five largest builders like?", toc: "The five largest", id: "largest", html: () =>
      h.p("For each one: what it sold, where, what its homes are like, and the warranty and lender its annual report states:") +
      PROFILES +
      h.p(`Each of the five owns all or part of a mortgage company. At the four that give a share, most buyers who take a mortgage use it. That choice is separate from the house. Our guide covers ${h.a(NC + "#incentives", "whether to use the builder's lender")}.`) },

    { h2: "Who are the other large builders, and who owns them?", toc: "Other builders", id: "owners", html: (bg) =>
      h.p("Several builders here sell under one name and sign deeds under another, and some have been bought by other companies. The name on the deed is the company that sold you the house, and it stands behind the warranty:") +
      OTHERS +
      h.cta("Know who you are buying from", "Send us the builder's contract. We read it with you, line by line, starting with the name of the seller.", "Send us the builder's contract", CTA, bg) },

    { h2: "What do new homes from each builder cost?", toc: "What they cost", id: "prices", html: () =>
      h.p(`Lennar and Starlight Homes sold for the least in the middle, and Toll Brothers for the most. The table gives the price range of each builder's sales, and how many of its homes are for sale now:`) +
      PRICE_TABLE +
      `<div class="bd-side">` +
      BUDGET +
      h.p(`At ${money(300000)} or less, Beverly Homes, Stanley Martin, Starlight Homes and DRB Homes also listed ${U3["DRB Homes"]} or more each.`) +
      G.homesCss() + G.homes("new-homes-under-300k", "new homes at $300,000 or less", "", "New homes for sale at $300,000 or less") +
      `</div>` +
      h.h3("Why some builders are hard to find in the listings") +
      h.p(`Many builders' homes never reach the MLS, the database brokers share to list homes for sale. Ryan Homes sold ${n0(RYAN.sales)} homes here and had ${LB["Ryan Homes"].for_sale} listed that day. Lennar sold ${n0(LEN.sales)} and had ${LB["Lennar"].for_sale}. We ask those builders for their homes for sale directly.`) },

    { h2: "What should you ask a builder before you sign?", toc: "Before you sign", id: "ask", html: () =>
      h.p("Seven things. We check each one with you before you sign a builder's contract:") +
      CHECK },
  ],
  afterSources: () => LEGAL,
  faqTitle: "New home builders FAQ",
  faq: FAQ,
  sources: [
    { name: "Horry County deeds", href: DEEDS },
    { name: "D.R. Horton 10-K", href: DHI },
    { name: "Lennar 10-K", href: LENK },
    { name: "NVR 10-K", href: NVR },
    { name: "PulteGroup 10-K", href: PHM },
    { name: "Meritage 10-K", href: MTH },
    { name: "Toll Brothers 10-K", href: TOL },
    { name: "Dream Finders 10-K", href: DFH },
    { name: "Beazer 10-K", href: BZH },
    { name: "Beazer 8-K", href: BZH8K },
    { name: "UHG 10-K", href: UHG },
    { name: "UHG 8-K", href: UHG8K },
    { name: "Berkshire 10-K", href: BRK },
    { name: "Clayton release", href: CPG },
    { name: "Starlight Homes", href: STARL },
    { name: "SC Code 40-59", href: T40_59 },
  ],
  sourcesNote: `Builder sales: our count of county deeds, ${FROM} to ${TO}. Listings: our count, ${DAY}, in aggregate. Source: Coastal Carolinas Association of REALTORS® Multiple Listing Service (CCMLS).`,
  bottomCta: { h2: "Buy from any builder with your own agent", p: "We come to your first visit, read the builder's contract with you, and set up your inspections before you close.", label: "Have us join your first builder visit", href: CTA },
  keywords: "new home builders Myrtle Beach, home builders Horry County SC, biggest home builders Myrtle Beach, D.R. Horton Myrtle Beach, Lennar Myrtle Beach, Ryan Homes Myrtle Beach, Mungo Homes Clayton Properties Group, Great Southern Homes Stanley Martin, builder warranty, builder preferred lender, questions to ask a home builder",
  about: "New home builders in Myrtle Beach and Horry County, South Carolina, ranked by homes sold",
});
