/* /hoa/hoa-vs-poa/ - HOA vs POA vs condo regime in South Carolina: that the law treats an HOA and a POA the same,
 * what local associations call themselves, how a condo regime differs from a neighborhood of houses (what you own,
 * the roof, the fee and what it pays for), why some homes pay two associations, what surprises buyers, how we find
 * every association a property belongs to, the lender's view of a condo, and the pros and cons.
 *
 * Batch 2026-10-d, Lane U. The page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-d/hoa-hoa-vs-poa/facts.md (verified rows, and corrected rows only in the
 * verifier's approved wording, VERIFY.md). Struck wording: hoa-hoa-vs-poa-struck.json.
 * Charts and tables are built here from data/2026-10-d/hoa-hoa-vs-poa/ (website working copy), never typed:
 *   fees-by-type.json            typical monthly fee by kind of home for sale, middle-half bands (rows 15, 16)
 *   has-with-fee.json            what the fee pays for, by kind of home (row 17; trash among houses is 46, row 17's fix)
 *   association-names-merged.json  the name labels of the associations that recorded a lien in 2025, spellings
 *                                merged (row 18 as the verifier corrected it; the unmerged 548 is struck)
 *   scdca-docs.json              Horry County HOA complaints: papers received before or after the purchase (row 24)
 *   photos.json                  the one photo's licence record (CC BY-SA 4.0, Wikimedia Commons)
 * Kept from the live page: the title words, the breadcrumb, "the label matters less than the documents" (now the
 * statute under it, rows 1 and 2), the three surprises (now each with a record or a count), the service "we identify
 * the association or associations and what each one covers", the links to reserves, rental restrictions and coastal
 * insurance. Cut: "Read the declaration, not the name" and "Check for both" (homework), the unsourced roof line, the
 * typed "July 2026" dates, the second phone button, the long legal notice.
 * Sibling owners: /hoa/special-assessments/ (the Horry lien count by year), /hoa/master-insurance-ho6/ (the policy
 * split), /hoa/south-carolina-hoa-laws/ (the Act's other sections), /buyers/no-hoa-homes/ (homes with no HOA),
 * /invest/non-warrantable-condos/ (lender detail), /hoa/tax-deductible/ (tax).
 * The homes feed is the website edge's (idx-lib/feeds.js LAWN_HOUSE); its place on the page is the edge's too (NEEDS.md 1).
 * Review round 1 (2026-11-01): plain words for the owner (rules, not covenants; condo, not regime, except where the
 * word is defined), no law or paper doing things, each fact said once, the how-we-check steps cut to the offer, the
 * lien answer for a POA (rows 18, 28, 29), townhouse internet and amenities (row 27), the fee table stacks on a phone,
 * the photo cropped to the towers. REVIEW-1.md in the batch folder lists each finding and what changed.
 * Review round 2 (2026-11-01): one answer at the top (the hero sub is a dek, the FAQ is short), each offer said once,
 * the loan rule in the verifier's correction 7, every fee-table cell checked (row 30), each community's typical listed
 * fee and what its listings say the fee covers (community-fees.json, row 31), the checks listed in order, "lien"
 * explained, the cards' offers pinned to the bottom. REVIEW-2.md lists each finding and what changed.
 * Final fix (2026-11-03): the answer said once at the top (glance tiles cut, the dek and first section no longer restate
 * it), what two fees come to answered with what we know and the check that adds them up, "lien" defined where first used,
 * the round 2 feed and header stopgap CSS removed (the shared CSS now holds the fix). REVIEW-FINAL.md lists each item.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/hoa/hoa-vs-poa/";
const T27_30 = "https://www.scstatehouse.gov/code/t27c030.php";
const T27_31 = "https://www.scstatehouse.gov/code/t27c031.php";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const ADDENDUM = "https://www.llr.sc.gov/re/RECPDF/Residential%20Property%20Condition%20Disclosure%20Statement%20Addendum.pdf";
const CFR = "https://www.govinfo.gov/content/pkg/CFR-2025-title44-vol1/pdf/CFR-2025-title44-vol1-part61-appA3.pdf";
const FNMA = "https://selling-guide.fanniemae.com/sel/b4-2.1-01/general-information-project-standards";
const SCDCA = "https://www.consumer.sc.gov/HOA-reports";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeName";
const DIR = path.join(__dirname, "..", "data", "2026-10-d", "hoa-hoa-vs-poa");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const FEES = read("fees-by-type.json").types, HAS = read("has-with-fee.json").types, NAMES = read("association-names-merged.json"), DCA = read("scdca-docs.json");

const money = (v) => "$" + Math.round(v).toLocaleString("en-US");
const pct = (a, b) => Math.round(a / b * 100);
const to100 = (v) => Math.round(v / 100) * 100;

/* ---- Row 15: the typical fee and the middle half by kind of home. Since 2026-11-09 these come from the HOA hub's
   pull (data/2026-11-b/hoa/findings.json, verified in Blog-Brain batches/2026-11-b/hoa/), so the two pages print one
   figure. /hoa/ owns the fees search (cannibalization map); this page says the fee once and links there. ---- */
const HUB = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-11-b", "hoa", "findings.json"), "utf8")).fees_by_kind;
const shown = (v) => (v >= 200 ? Math.round(v / 10) * 10 : v); // as the hub prints them: about $650, $290, $95
const MED = { condo: shown(HUB.condo.median), townhouse: shown(HUB.townhouse.median), house: shown(HUB.house.median) };
if (MED.condo !== 650 || MED.townhouse !== 290 || MED.house !== 95) throw new Error("the HOA hub's findings.json no longer gives $650, $290 and $95; recheck both pages");
const band = (t) => [HUB[t].p25, HUB[t].p75];
if (band("condo").join() !== "460,940" || band("house").join() !== "70,135") throw new Error("the HOA hub's findings.json no longer gives the middle-half bands");
const RATIO = MED.condo / MED.house;
const TIMES = ["", "", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"][Math.ceil(RATIO)];
const YEAR_CONDO = to100(MED.condo * 12), YEAR_HOUSE = to100(MED.house * 12);
/* Row 16: houses listed with no HOA. */
const NO_HOA = FEES.house.listed_no_hoa / FEES.house.total;
if (Math.round(NO_HOA * 10) !== 3) throw new Error("fees-by-type.json: houses with no HOA are no longer about three in ten (row 16)");

const FEE_CHART = G.bars([
  { name: "Condo", value: MED.condo, valueText: `about ${money(MED.condo)}`, feature: `the middle half pay roughly ${money(band("condo")[0])} to ${money(band("condo")[1])}` },
  { name: "Townhouse", value: MED.townhouse, valueText: `about ${money(MED.townhouse)}` },
  { name: "House", value: MED.house, valueText: `about ${money(MED.house)}`, feature: `the middle half pay roughly ${money(band("house")[0])} to ${money(band("house")[1])}` },
], { caption: "Typical monthly association fee of homes for sale on the Grand Strand", nameLabel: "Kind of home", featureLabel: "range", valueLabel: "typical fee a month", compact: true,
  note: `Our count of homes for sale in the local MLS that list a fee. Half pay more than the typical fee, and half pay less.` });

/* ---- Row 17: what the fee pays for, as a share of homes with a fee, computed from the counts. ---- */
const ITEMS = [["hoa_includes_insurance", "Insurance"], ["hoa_includes_water_sewer", "Water and sewer"], ["lawn_care_included", "Lawn care"],
  ["hoa_includes_trash", "Trash pickup"], ["hoa_includes_internet", "Internet"], ["community_amenities", "Amenities in the community"]];
const share = (t, k) => pct(HAS[t].has[k].with_fee, HAS[t].with_fee);
if (share("condo", "hoa_includes_insurance") !== 78 || share("house", "hoa_includes_insurance") !== 4 || share("house", "hoa_includes_trash") !== 46 || share("townhouse", "hoa_includes_insurance") !== 34 || share("townhouse", "lawn_care_included") !== 83 || share("townhouse", "hoa_includes_internet") !== 25 || share("townhouse", "community_amenities") !== 56)
  throw new Error("has-with-fee.json no longer gives the ledger's rows 17 and 27");
/* Row 30 (review round 2): the six cells rows 17 and 27 did not hold, from the same file the verifier re-ran. Every cell is now checked. */
const CELLS = { condo: [78, 84, 91, 91, 70, 87], townhouse: [34, 19, 83, 73, 25, 56], house: [4, 2, 9, 46, 9, 61] };
for (const t of Object.keys(CELLS)) ITEMS.forEach(([k], i) => { if (share(t, k) !== CELLS[t][i]) throw new Error(`has-with-fee.json: ${t} ${k} is ${share(t, k)}, not the ledger's ${CELLS[t][i]} (rows 17, 27, 30)`); });
const KINDS = [["condo", "Condos"], ["townhouse", "Town&shy;houses"], ["house", "Houses"]];
const PAYS = `<figure class="hp-pays"><p class="cap" id="hp-pays-cap">What the association fee covers</p>`
  + `<div class="hp-pays-t" role="table" aria-labelledby="hp-pays-cap"><div role="row" class="hd"><span role="columnheader">Covers</span>${KINDS.map(([, n]) => `<span role="columnheader">${n}</span>`).join("")}</div>`
  + ITEMS.map(([k, label]) => `<div role="row"><span role="rowheader">${label}</span>` + KINDS.map(([t]) => {
    const v = share(t, k);
    return `<span role="cell"><b>${v}%</b><i aria-hidden="true"><i style="width:${v}%"></i></i></span>`;
  }).join("") + `</div>`).join("") + `</div>`
  + `<figcaption>Share of homes for sale with an association fee whose listing says the fee covers each item. The amenities row counts listings that say the community has shared amenities, not that the fee pays for them. Our count of the local MLS.</figcaption></figure>`;

/* ---- Row 18 (corrected): what associations call themselves, spellings merged. ---- */
const NS = NAMES.by_label, NT = NAMES.associations;
if (NT !== 526 || NS.hoa !== 275 || NS.poa !== 103 || NS.condo !== 45 || NS.community !== 97 || NS.other !== 6 || NAMES.master_named !== 4)
  throw new Error("association-names-merged.json is not the verifier's row 18 count");
const NAME_CHART = G.bars([
  { name: "Homeowners or HOA", value: pct(NS.hoa, NT), valueText: `${pct(NS.hoa, NT)}%` },
  { name: "Property owners or POA", value: pct(NS.poa, NT), valueText: `${pct(NS.poa, NT)}%` },
  { name: "Another name", value: pct(NS.community, NT), valueText: `${pct(NS.community, NT)}%`, feature: "community or master association" },
  { name: "A condo word", value: pct(NS.condo, NT), valueText: `${pct(NS.condo, NT)}%`, feature: "condominium or regime" },
], { caption: "What Horry County associations call themselves", nameLabel: "Word in the name", featureLabel: "for example", valueLabel: "share of associations", format: (v) => `${v}%`, max: 100, compact: true,
  note: `Our count of the more than ${Math.floor(NT / 100) * 100} associations that recorded a lien for unpaid charges in Horry County in 2025, from the county's deed index.` });

/* ---- Row 24: complaints, papers after the purchase. ---- */
const FY = DCA.four_years_horry, KNOWN = FY.docs_after + FY.docs_before;
if (FY.docs_after !== 235 || FY.docs_before !== 124) throw new Error("scdca-docs.json is not the ledger's row 24");
const STAT = `<div class="hp-stat"><p class="k">The papers often come late</p><p class="big">${pct(FY.docs_after, KNOWN)}%</p>`
  + `<p class="sub">of Horry County owners who complained to the state about their association got its papers only after they bought.</p>`
  + `<p class="do">Owners file these complaints with <a href="${SCDCA}" target="_blank" rel="noopener" style="color:inherit">South Carolina Consumer Affairs</a>.</p>`
  + `<p class="src">${FY.docs_after} of the ${KNOWN} complaints from 2022 to 2025 that said when the owner got the papers</p></div>`;

/* ---- Our drawing: what you own in a house and in a condo (rows 2, 7, 8). ---- */
const SVGT = 'font-family="var(--sans)"';
const HOUSE_SVG = `<svg role="img" aria-label="Drawing: in a neighborhood of houses, you own the lot and the house on it; the association has the common areas." viewBox="0 0 340 250" width="100%" style="display:block;height:auto" ${SVGT}>`
  + `<rect x="0" y="210" width="340" height="40" fill="#e6dccb"/>`
  + `<rect x="8" y="96" width="190" height="130" rx="10" fill="rgba(196,120,58,.10)" stroke="#c4783a" stroke-width="2.5" stroke-dasharray="7 5"/>`
  + `<polygon points="34,152 103,104 172,152" fill="#c4783a"/><rect x="46" y="150" width="114" height="62" fill="#fff" stroke="#1c2028" stroke-width="2"/>`
  + `<rect x="92" y="174" width="22" height="38" fill="#1c2028" opacity=".85"/><rect x="58" y="164" width="22" height="18" fill="#cfdde6" stroke="#1c2028" stroke-width="1.5"/><rect x="126" y="164" width="22" height="18" fill="#cfdde6" stroke="#1c2028" stroke-width="1.5"/>`
  + `<rect x="216" y="180" width="116" height="30" rx="12" fill="#a9cbd8" stroke="#5c6b78" stroke-width="1.5"/>`
  + `<text x="274" y="140" font-size="20" font-weight="700" fill="#1c2028" text-anchor="middle">Common</text><text x="274" y="164" font-size="20" fill="#1c2028" text-anchor="middle">areas</text>`
  + `<text x="8" y="30" font-size="23" font-weight="700" fill="#8a5226">Yours</text><text x="8" y="60" font-size="20" fill="#1c2028">the lot and the house on it</text></svg>`;
const CONDO_SVG = `<svg role="img" aria-label="Drawing: in a condo, you own your unit; the roof, main walls, halls, elevators and land are shared by every owner." viewBox="0 0 340 250" width="100%" style="display:block;height:auto" ${SVGT}>`
  + `<rect x="0" y="210" width="340" height="40" fill="#e6dccb"/>`
  + `<rect x="18" y="92" width="170" height="120" fill="rgba(92,107,120,.14)" stroke="#5c6b78" stroke-width="2"/><rect x="12" y="82" width="182" height="12" fill="#5c6b78"/>`
  + [0, 1, 2].map((r) => [0, 1, 2].map((c) => {
    const x = 30 + c * 52, y = 104 + r * 35, me = r === 1 && c === 2;
    return `<rect x="${x}" y="${y}" width="42" height="26" rx="3" fill="${me ? "#c4783a" : "#fff"}" stroke="${me ? "#8a5226" : "#1c2028"}" stroke-width="${me ? 3 : 1.5}"/>`;
  }).join("")).join("")
  + `<line x1="176" y1="152" x2="214" y2="152" stroke="#8a5226" stroke-width="2.5"/>`
  + `<text x="220" y="148" font-size="23" font-weight="700" fill="#8a5226">Yours</text><text x="220" y="174" font-size="20" fill="#1c2028">one unit</text>`
  + `<text x="8" y="26" font-size="21" font-weight="700" fill="#1c2028">Shared by every owner</text><text x="8" y="52" font-size="19" fill="#1c2028">roof, main walls, halls,</text><text x="8" y="74" font-size="19" fill="#1c2028">elevators and the land</text></svg>`;
const OWN = `<figure class="hp-own"><div class="hp-own-g"><div class="pnl"><p class="k">A house in an HOA or POA</p>${HOUSE_SVG}</div><div class="pnl"><p class="k">A condo</p>${CONDO_SVG}</div></div>`
  + `<figcaption>Our drawing of what you own in each.</figcaption></figure>`;

/* ---- The layers (rows 20 to 22): our diagram, then three communities from the county record. ---- */
const LAYERS = `<figure class="hp-layers" aria-label="Diagram: a master association over a whole community, with a neighborhood association and a condo association inside it">`
  + `<div class="l1"><b>Master association</b><span>Rules over the whole community, and its own fee</span>`
  + `<div class="l2s"><div class="l2"><b>Neighborhood association</b><span>Its own rules and fee for one neighborhood</span></div><div class="l2"><b>Condo association</b><span>Its own rules and fee for one building</span></div></div></div>`
  + `<figcaption>Our diagram of two layers. A home can belong to the master association and to one association inside it.</figcaption></figure>`;
/* Row 31 (review round 2): the fee homes for sale list in each of the three communities, and what the listings say
   about the fee, from community-fees.json (pull_community_fees.py, the CRM's public map API, counts only). */
const CF = read("community-fees.json").sets;
const cf = (sub, t) => { const s = CF.find((x) => x.subdivision === sub && x.type === t); return { n: s.total, med: s.median_band_5[1], has: (k) => s.has[k] / s.total }; };
const GD = cf("Grande Dunes", "house"), BF = cf("Barefoot", "condo"), PC_ = cf("Prince Creek", "house");
if (GD.med !== 350 || BF.med !== 570 || PC_.med !== 140 || GD.n !== 106 || BF.n !== 112 || PC_.n !== 46) throw new Error("community-fees.json is not the ledger's row 31");
if (Math.round(GD.has("community_amenities") * 100) !== 92 || Math.round(GD.has("gated") * 100) !== 44 || Math.round(BF.has("hoa_includes_insurance") * 100) !== 88 || Math.round(PC_.has("gated") * 100) !== 52 || Math.round(PC_.has("hoa_includes_trash") * 100) !== 80)
  throw new Error("community-fees.json shares are not the ledger's row 31");
const GD_TIMES = ["", "", "two", "three", "four", "five"][Math.ceil(GD.med / MED.house)];
const chips = (xs) => `<ul class="chips">${xs.map((x, i) => `<li class="${i ? "in" : "top"}">${x}</li>`).join("")}</ul>`;
const share10 = (v) => ["", "one in ten", "two in ten", "three in ten", "four in ten", "half", "six in ten", "seven in ten", "eight in ten", "nine in ten", "nearly all"][Math.round(v * 10)];
/* Final fix: each card carries its community's live homes strip (idx-lib/places.js slugs grande-dunes, barefoot-resort,
   prince-creek). The edge fills it while the listing search is on; empty, it takes no space. */
const STRIP = { "Grande Dunes": "grande-dunes", "Barefoot Resort": "barefoot-resort", "Prince Creek": "prince-creek" };
const COMMUNITY = (name, town, fee, layers, text, short = name) => `<article class="hp-comm"><h3>${name}<span>${town}</span></h3><p class="fee">${fee}</p>${chips(layers)}<p>${text}</p>${G.homes(STRIP[name], name)}${G.offer(short, { label: `Ask about ${short}` })}</article>`;
const COMMUNITIES = `<div class="hp-comms">`
  + COMMUNITY("Grande Dunes", "Myrtle Beach", `Houses for sale here list a typical fee of about ${money(GD.med)} a month, nearly ${GD_TIMES} times the typical house fee on the Grand Strand.`,
    ["Grande Dunes Master Association", "Bal Harbor Property Owners Association", "Cipriana Park Property Owners Association"],
    `More than ${share10(GD.has("community_amenities"))} of those listings say the community has shared amenities, and more than ${share10(GD.has("gated"))} list a gate. Bal Harbor and Cipriana Park, two neighborhoods inside Grande Dunes, each have their own POA. Each has an agreement with the master on architectural review, the approval of changes to a home's outside.`)
  + COMMUNITY("Barefoot Resort", "North Myrtle Beach", `The typical condo for sale here lists about ${money(BF.med)} a month, a little under the typical condo fee on the Grand Strand.`,
    ["Barefoot Resort Residential Owners Association", "Barefoot Resort Nonresidential Owners Association", "Condo associations for its buildings"],
    `Nearly ${share10(BF.has("hoa_includes_insurance"))} of those listings say the fee covers insurance. The residential owners association is the master, with its own design guidelines. The nonresidential owners association is a separate one, with its own papers. Condo buildings inside Barefoot have their own condo associations.`, "Barefoot")
  + COMMUNITY("Prince Creek", "Murrells Inlet", `A typical house for sale here lists a fee of about ${money(PC_.med)} a month.`,
    ["Prince Creek Master Community Association", "Prince Creek West Road and Park Districts Association"],
    `About ${share10(PC_.has("gated"))} of those listings list a gate, and ${share10(PC_.has("hoa_includes_trash"))} say the fee covers trash pickup. The master association has the master rules and design standards. Prince Creek West also has an association for its roads and parks, with its own rules and its own policy for collecting late dues.`)
  + `</div>`;

/* ---- The comparison (rows 1, 2, 6, 7, 8, 14, 26). The fee is in the chart, not here. ---- */
const COMPARE = compareCards([
  { name: "House in an HOA or POA", icon: "home", cells: { own: "The lot and the house", roof: "The HOA's rules say who", lender: "No" } },
  { name: "Townhouse", icon: "town", cells: { own: "A lot or a unit, as its deed says", roof: "Like a house or a condo, by the deed", lender: "Like a house or a condo, by the deed" } },
  { name: "Condo", icon: "key", cells: { own: "Your unit and a share of the building", roof: "Every owner shares the cost", lender: "Yes, except detached or small buildings" } },
], [{ key: "own", label: "What you own" }, { key: "roof", label: "Roof and outside walls" }, { key: "lender", label: "Lender reviews the whole building" }],
{ caption: "House, townhouse or condo: what changes", nameLabel: "Kind of home" });

/* ---- What surprises buyers (rows 5, 9, 13, 23, 24). ---- */
const SURPRISES = `<ol class="hp-sur">`
  + `<li><span class="n" aria-hidden="true">1</span><div><b>Counting on the building's flood policy</b><p>In a condo, the association insures the building, and a policy on your own unit is a separate one. Flood insurance has a limit: the building's ${h.ext(CFR, "National Flood Insurance Program")} policy and your own flood policy together pay at most $250,000 for your unit. ${h.a("/hoa/master-insurance-ho6/", "Master insurance and your condo policy")} shows which policy covers what.</p></div></li>`
  + `<li><span class="n" aria-hidden="true">2</span><div><b>Finding a second association after closing</b><p>The ${h.ext(ADDENDUM, "seller's disclosure form")} has room for one association's charges and one contact. The ${h.ext(DEEDS, "Horry County Register of Deeds")} index is free to search online, but the county does not show the papers themselves to the public online. They are viewed and printed in Conway, or ordered by mail.</p></div></li>`
  + `</ol>`;

/* ---- Pros and cons (rows 8, 9, 14, 15, 17, 20 to 22, 26). No number twice. ---- */
const PC = (title, good, hard) => `<div class="hp-pc-c"><h3>${title}</h3><ul>${good.map((t) => `<li class="g"><span aria-hidden="true">+</span><span>${t}</span></li>`).join("")}${hard.map((t) => `<li class="b"><span aria-hidden="true">&minus;</span><span>${t}</span></li>`).join("")}</ul></div>`;
const PROS = `<div class="hp-pc">`
  + PC("A condo",
    ["The association keeps up and insures the building, roof included.", "Your property tax bill is for your unit alone."],
    ["The biggest monthly fee, because it pays for the building.", "Every owner shares the cost of big repairs to the building."])
  + PC("A house in an HOA or POA",
    ["The smallest monthly fee.", "The lot and the house are yours alone."],
    ["The policy on the house is a bill of its own.", "In some master-planned communities, a second association with its own rules and fee."])
  + `</div>`;

/* ---- The one photo (rules/images.md), CC BY-SA 4.0, viewed full size, cropped to the towers; record in this page's data folder. ---- */
const ph = PK.create({ h, photos: read("photos.json").photos, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "760px" });
const PHOTO = ph.aerial("myrtle-beach-oceanfront-towers", "Oceanfront towers in Myrtle Beach.");
ph.share("myrtle-beach-oceanfront-towers");

/* Final fix (lead): the glance tiles are cut. They gave the two fees the short answer gives a few lines lower. */

const GLASSCARD = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.8);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 10px 26px -18px rgba(28,32,40,.35)";
const M = "main#main";
const CSS = "<style>"
  /* What the fee pays for */
  + `${M} .hp-pays{max-width:760px;margin:1.4rem 0 1.6rem;padding:1.1rem 1.1rem 1rem;border-radius:20px;${GLASSCARD}}`
  + `${M} .hp-pays .cap{color:var(--navy);font-weight:600;font-family:var(--sans);font-size:1.0625rem;line-height:1.4;margin:0 0 .7rem}`
  + `${M} .hp-pays-t [role=row]{display:grid;grid-template-columns:minmax(0,1.25fr) repeat(3,minmax(0,1fr));gap:.6rem;align-items:center;padding:.5rem 0;border-top:1px solid rgba(28,32,40,.08)}`
  + `${M} .hp-pays-t [role=row].hd{border-top:0;padding-top:0}`
  + `${M} .hp-pays-t{position:relative}`
  /* At 520 px and below each row stacks: the item on its own line, its three shares under it (critic, round 1: at 320 px the label column overlapped the Condos column). */
  + `@media (max-width:520px){${M} .hp-pays{padding:1rem .85rem .9rem}${M} .hp-pays-t [role=row]{grid-template-columns:repeat(3,minmax(0,1fr));gap:.2rem .7rem}`
  + `${M} .hp-pays-t [role=rowheader]{grid-column:1/-1;font-weight:600;margin:0 0 .1rem}`
  + `${M} .hp-pays-t .hd [role=columnheader]:first-child{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}`
  + `${M} .hp-pays-t [role=columnheader]{font-size:.9rem;hyphens:manual;line-height:1.25}}`
  + `${M} .hp-pays-t [role=columnheader]{font-family:var(--sans);font-size:.95rem;font-weight:600;color:var(--navy)}`
  + `${M} .hp-pays-t [role=rowheader]{color:var(--navy);font-size:1rem;line-height:1.3}`
  + `${M} .hp-pays-t [role=cell] b{display:block;font-family:var(--sans);font-size:1.05rem;color:var(--navy);line-height:1.2}`
  + `${M} .hp-pays-t [role=cell]>i{display:block;height:.4rem;border-radius:99px;background:rgba(28,32,40,.08);margin-top:.3rem;overflow:hidden}`
  + `${M} .hp-pays-t [role=cell]>i>i{display:block;height:100%;border-radius:99px;background:var(--brass)}`
  + `${M} .hp-pays figcaption{color:var(--muted);font-size:1rem;line-height:1.55;margin-top:.7rem}`
  /* The drawing */
  + `${M} .hp-own{max-width:760px;margin:1.4rem 0 1.6rem}`
  + `${M} .hp-own-g{display:grid;gap:.8rem}@media (min-width:700px){${M} .hp-own-g{grid-template-columns:1fr 1fr}}`
  + `${M} .hp-own .pnl{padding:.9rem 1rem .6rem;border-radius:20px;${GLASSCARD}}@media (max-width:520px){${M} .hp-own .pnl{padding:.8rem .7rem .5rem}}`
  + `${M} .hp-own .k{font-family:var(--sans);font-weight:600;color:var(--navy);font-size:1.0625rem;margin:0 0 .4rem}`
  + `${M} .hp-own figcaption{color:var(--muted);font-size:1rem;line-height:1.55;margin-top:.7rem}`
  /* The layers diagram */
  + `${M} .hp-layers{max-width:760px;margin:1.4rem 0 1.4rem}`
  + `${M} .hp-layers .l1{padding:1rem 1rem 1rem;border-radius:22px;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97));color:#fff;box-shadow:0 22px 50px -30px rgba(28,32,40,.6)}`
  + `${M} .hp-layers b{display:block;font-family:var(--sans);font-size:1.1rem;line-height:1.3}`
  + `${M} .hp-layers .l1>span{display:block;color:rgba(244,239,232,.85);margin:.15rem 0 .8rem;line-height:1.45}`
  + `${M} .hp-layers .l2s{display:grid;gap:.6rem}@media (min-width:600px){${M} .hp-layers .l2s{grid-template-columns:1fr 1fr}}`
  + `${M} .hp-layers .l2{padding:.8rem .9rem;border-radius:16px;background:rgba(255,255,255,.94);color:var(--navy)}`
  + `${M} .hp-layers .l2 span{display:block;color:var(--muted);line-height:1.45;margin-top:.1rem}`
  + `${M} .hp-layers figcaption{color:var(--muted);font-size:1rem;line-height:1.55;margin-top:.7rem}`
  /* Communities */
  + `${M} .hp-comms{display:grid;gap:.9rem;max-width:960px;margin:1.2rem 0 1.4rem}@media (min-width:900px){${M} .hp-comms{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* Round 2 (critic): each card a column, so the offer sits at the bottom of every card, on one line. */
  + `${M} .hp-comm{padding:1rem 1.1rem .4rem;border-radius:20px;display:flex;flex-direction:column;${GLASSCARD}}`
  + `${M} .hp-comm .c3-offer{margin-top:auto!important;padding-top:.3rem}${M} .hp-comm .c3-offer a.c3-offer-pill{white-space:nowrap}@media (max-width:379px){${M} .hp-comm .c3-offer a.c3-offer-pill{white-space:normal;text-wrap:balance}}`
  + `${M} .hp-comm .fee{color:var(--navy);font-weight:500}${M} .hp-comm .hx-strip{margin:0 0 .6rem;min-width:0}`
  /* Kept from the round 2 stopgap (NEEDS 15): at 1024 px the shared header phone still runs the page to 1029 px in this
     working copy (/invest/strategies/fix-and-flip/ measures the same). The feed rule at 320 px is cut: the shared CSS now holds it. */
  + `@media (min-width:900px) and (max-width:1100px){header .header-ctas{gap:.5rem}header a.hdr-phone{padding-left:.4rem;padding-right:.4rem}}`
  /* Round 2 (critic): the contents list in two columns from 700 px, not ten stacked links. */
  + `@media (min-width:700px){${M} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:1fr 1fr;column-gap:2rem}}`
  + `${M} .hp-comm h3{font-family:var(--serif);font-size:1.3rem;color:var(--navy);margin:0 0 .6rem;line-height:1.25}`
  + `${M} .hp-comm h3 span{display:block;font-family:var(--sans);font-size:.95rem;color:var(--muted);font-weight:400;margin-top:.15rem}`
  + `${M} .hp-comm .chips{list-style:none;margin:0 0 .8rem;padding:0;display:grid;gap:.35rem}`
  + `${M} .hp-comm .chips li{margin:0;padding:.4rem .7rem;border-radius:12px;font-size:.98rem;line-height:1.45;color:var(--navy)}`
  + `${M} .hp-comm .chips li.top{background:var(--navy);color:#fff;font-weight:600}`
  + `${M} .hp-comm .chips li.in{background:var(--ivory-2);margin-left:1rem;border-left:3px solid var(--brass)}`
  + `${M} .hp-comm p{color:var(--muted);line-height:1.65;margin:0 0 .7rem}`
  + `${M} .hp-comm .c3-offer{margin:.4rem 0 1rem}${M} .hp-comm .c3-offer a.c3-offer-pill{font-size:1rem;padding-left:1rem;gap:.5rem}`
  /* Surprises */
  + `${M} .hp-sur{list-style:none;margin:1.2rem 0 1.4rem;padding:0;display:grid;gap:.8rem;max-width:760px}`
  + `${M} .hp-sur li{margin:0;display:flex;gap:.8rem;align-items:flex-start;padding:1rem 1.1rem;border-radius:18px;${GLASSCARD}}`
  + `${M} .hp-sur .n{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.9rem;height:1.9rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;margin-top:.05rem}`
  + `${M} .hp-sur b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.1rem;line-height:1.3;margin-bottom:.3rem}`
  + `${M} .hp-sur p{color:var(--muted);line-height:1.6;margin:0 0 .4rem}`
  + `${M} .hp-sur p.do{color:var(--navy);font-weight:500;margin:0}`
  /* The complaint figure */
  + `${M} .hp-stat{max-width:760px;margin:1rem 0 1.6rem;padding:1.2rem 1.3rem;border-radius:20px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));color:var(--ivory);box-shadow:0 26px 60px -30px rgba(28,32,40,.6)}`
  + `${M} .hp-stat .big{font-family:var(--serif);font-size:clamp(2.6rem,10vw,3.4rem);line-height:1;color:#fff;margin:0 0 .4rem}`
  + `${M} .hp-stat .sub{color:rgba(244,239,232,.92);line-height:1.55;margin:0 0 .7rem;font-size:1.0625rem}`
  + `${M} .hp-stat .k{font-family:var(--sans);font-weight:600;font-size:1.05rem;color:#e8c99a;margin:0 0 .5rem}`
  + `${M} .hp-stat .do{color:#fff;font-weight:500;line-height:1.55;margin:0 0 .7rem;font-size:1.0625rem}`
  + `${M} .hp-stat .src{color:rgba(244,239,232,.75);font-size:.95rem;line-height:1.5;margin:0;border-top:1px solid rgba(244,239,232,.2);padding-top:.6rem}`
  /* Pros and cons */
  + `${M} .hp-pc{display:grid;gap:.9rem;max-width:960px;margin:1.2rem 0 1.4rem}@media (min-width:760px){${M} .hp-pc{grid-template-columns:1fr 1fr;align-items:start}}`
  + `${M} .hp-pc-c{padding:1rem 1.1rem .4rem;border-radius:20px;${GLASSCARD}}`
  + `${M} .hp-pc-c h3{font-family:var(--sans);font-size:1.15rem;font-weight:600;color:var(--navy);margin:0 0 .7rem}`
  + `${M} .hp-pc-c ul{list-style:none;margin:0;padding:0}`
  + `${M} .hp-pc-c li{display:flex;gap:.65rem;align-items:flex-start;color:var(--muted);line-height:1.6;margin:0 0 .75rem}`
  + `${M} .hp-pc-c li>span:first-child{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.45rem;height:1.45rem;border-radius:50%;font-weight:700;font-family:var(--sans);margin-top:.12rem}`
  + `${M} .hp-pc-c li.g>span:first-child{background:var(--brass);color:#fff}${M} .hp-pc-c li.b>span:first-child{border:1.5px solid var(--muted);color:var(--muted)}`
  + `${M} .hp-note{color:var(--muted);font-size:1rem;line-height:1.6;max-width:720px;margin:0 0 1rem}`
  /* Workaround (sibling special-assessments, NEEDS 5): keep the closing band dark when the site adds a block after it. */
  + `${M}>section[style^="background:var(--navy)"]:has(>.wrap>h2){padding:.9rem 0!important}`
  + `${M}>section[style^="background:var(--navy)"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}`
  + `@media (max-width:699px){${M}>section[style^="background:var(--navy)"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + "</style>";


const LIENS = "/hoa/liens-and-foreclosure/", FINES = "/hoa/violations-and-fines/";
const NAMED = Math.floor(NT / 100) * 100;

const FAQ = [
  { q: "Is an HOA the same as a POA in South Carolina?", a: "Yes. Under the South Carolina Homeowners Association Act, the name does not matter. A group is an HOA when papers filed with the county make the owners pay it dues, except a timeshare plan." },
  { q: "Can a POA put a lien on my house?", a: `Yes, if its papers filed with the county give it a lien for unpaid dues, as an HOA's papers can. That is a claim on your house for the unpaid dues. About one in five of the more than ${NAMED} associations that recorded a lien for unpaid charges in Horry County in 2025 had "property owners" or "POA" in the name.` },
  { q: "Is a POA voluntary in South Carolina?", a: "Only when no papers filed with the county make the owners pay it. A group with no such papers, such as a voluntary civic club, is not an HOA under South Carolina's HOA Act. If the papers on your home make you pay, the dues are not voluntary, whatever the group calls itself." },
  { q: "What is a regime fee in South Carolina?", a: "The condo fee. South Carolina's condo law calls a condo a horizontal property regime, so the fee its owners pay is called a regime fee." },
  { q: "What do I own in a condo?", a: "Your unit alone, plus a share of the shared parts, given as a percentage in the condo's founding papers. No owner can force the shared parts to be split up, and selling a unit sells its share with it." },
  { q: "Can a home have two HOAs?", a: "Yes. A home in a master-planned community can belong to a master association and to a neighborhood or condo association inside it, each with its own papers and fee. Grande Dunes, Barefoot Resort and Prince Creek each have more than one association." },
];

/* What we check (review round 2, owner): the checks in order, one line each on what it means for the buyer.
   Only what ledger Question 1 and row 25 cover: every association, each fee and what it covers, the rules, who keeps up what. */
const CHECKS = `<ol class="hp-sur hp-chk">`
  + [["Every association the home belongs to", "Not only the one on the seller's form. A second association means a second fee and a second set of rules."],
     ["What each one charges, and what the fee covers", "Then you know what the fees add up to each month before you make an offer, and which bills they already pay."],
     ["The rules that could change your plans", "For example, a ban on renting. When we search for an investor's rental, we read the HOA papers and leave out communities that ban it."],
     ["Who keeps up and insures what", "In a condo, the building is shared. For a house, the HOA's papers say what is yours to keep up."]]
    .map(([b, p], i) => `<li><span class="n" aria-hidden="true">${i + 1}</span><div><b>${b}</b><p>${p}</p></div></li>`).join("")
  + `</ol>`;

/* Light fix, triage 2026-11-08: the italic line at about half the H1's size, on its own line (the approved look,
   Blog-Brain batches/2026-11-a/hoa-documents/DESIGN.md). */
const EM_CSS = "<style>@media (min-width:700px){main#main .detail-h1{text-wrap:balance}}main#main .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}"
  + "@media (max-width:959px){main#main .detail-h1 em{color:#8a5226!important}}</style>";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "HOA Guide", url: "/hoa/" },
  title: "HOA vs POA in South Carolina: Same Thing in Law | Chapter3",
  description: "In South Carolina an HOA and a POA are the same thing in law. What differs is the home: what a condo fee covers, who fixes the roof, why some pay two.",
  ogTitle: "HOA vs POA in South Carolina: the same in law, and what changes the fee",
  crumb: "HOA vs POA",
  eyebrow: "HOA Guide",
  h1: "Is a POA the same as an HOA in South Carolina?",
  h1em: "Fees by kind of home, and why some homes pay two associations.",
  sub: "Yes. In South Carolina law they are the same. Also what you own in a Grand Strand condo, who fixes the roof, and how a condo can change the loan.",
  heroCta: { title: "Send us an address. We find every association it belongs to.", label: "Have us check a property", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    "Yes. In South Carolina, a property owners association (POA) and a homeowners association (HOA) are the same thing in law. Under the South Carolina Homeowners Association Act, a group is an HOA when papers filed with the county make the owners pay it dues.",
    `The kind of home changes the fee. On the Grand Strand, the typical fee on a condo for sale is about ${money(MED.condo)} a month, and on a house about ${money(MED.house)}. Condo owners share the building, and the association insures it.`,
  ],
  sections: [
    { h2: "What is the difference between an HOA and a POA?", toc: "HOA vs POA", id: "hoa-vs-poa", html: () => CSS + EM_CSS + G.homesCss() + ph.css() +
      h.p("You may read that a POA covers more kinds of property than an HOA, such as empty lots or shops. Under either name, the group's papers on file with the county list what it runs and what its owners pay.") +
      h.p(`If you fall behind on dues, a POA can put a lien on your home when its papers allow one. A lien is a claim on the home for the money you owe. An HOA can do the same. Of the more than ${NAMED} associations that recorded a lien for unpaid charges in Horry County in 2025, about half have "homeowners" or "HOA" in the name, and one in five "property owners" or "POA".`) +
      NAME_CHART +
      h.p(`In a condo, an unpaid fee is a lien on the unit under state law. The association can foreclose in court, asking the court to sell the unit to pay the debt, as a lender can with a mortgage. For a house, the association's papers list what it can do. ${h.a(LIENS, "Can an HOA foreclose in South Carolina?")} covers the steps, and ${h.a(FINES, "HOA violations and fines")} covers fines.`) +
      h.p(`A name does not always tell you the kind of home. A few names mix a condo word with "property owners" or "homeowners". Some carry no label word at all, only a place name such as a Tower or Villas.`) +
      `<p class="hp-note">On this page, POA means a property owners association, not a power of attorney.</p>` },

    { h2: "How is a condo association different from an HOA?", toc: "Condo vs house", id: "condo-vs-house", html: () =>
      h.p("A condo association is an HOA too, but it runs a building, not a neighborhood. In a condo, the owners share the building. In a neighborhood of houses, you own your lot and the house on it. That one difference changes the fee, what it covers and how a lender looks at the home.") +
      COMPARE +
      PHOTO },

    { h2: "What do you own, and who fixes the roof?", toc: "What you own", id: "what-you-own", html: (bg) =>
      h.p("In a condo you own your unit alone, plus a share of the shared parts, given as a percentage in the condo's founding papers.") +
      OWN +
      h.p("Unless the founding papers say otherwise, the shared parts include the land under the building, the foundations, main walls, roofs, halls, lobbies, stairways, elevators and the central power and water systems. Every owner pays a share of their upkeep by that percentage, and the association insures the building. It may also enter your unit at reasonable hours to repair the shared parts, and for emergency repairs.") +
      h.p(`Who pays after a leak or a fire is on our ${h.a("/hoa/who-pays-for-damage/", "who pays for condo damage")} page.`) +
      h.h3("And in a neighborhood of houses?") +
      h.p(`South Carolina's ${h.ext(T27_30, "HOA Act")} has no rule on who maintains or insures a house in a planned community. It is in the HOA's rules, in papers filed with the county. In most house listings, the fee does not include insurance.`) +
      h.cta("Who fixes the roof on a home you like?", "Send us the address. We read its association papers and tell you what is yours to repair and insure.", "Have us read its papers", "/contact/", bg) },

    { h2: "What is a regime fee, and why is a condo fee higher?", toc: "Regime fees", id: "regime-fees", html: () =>
      h.p(`A regime fee is the condo fee. South Carolina's ${h.ext(T27_31, "condo law")} calls a condo a horizontal property regime. A condo fee is higher because it pays for the building: on the Grand Strand, the typical condo fee is nearly ${TIMES} times the typical house fee.`) +
      FEE_CHART +
      h.p(`In a year, that is about ${money(YEAR_CONDO)} for the typical condo and about ${money(YEAR_HOUSE)} for the typical house, on top of the mortgage, the property tax and your own insurance.`) +
      h.p(`What fees run here, by kind of home, and what each one covers is on our ${h.a("/hoa/", "Myrtle Beach HOA fees page")}.`) +
      PAYS +
      h.p(`About three in ten houses for sale have no association at all. ${h.a("/buyers/no-hoa-homes/", "Homes with no HOA")} has its own page.`) },

    { h2: "Why do some homes pay two HOA fees?", toc: "Two associations", id: "two-associations", html: (bg) =>
      h.p(`Because some master-planned communities have two layers. A master association has rules over the whole community. Inside it, a neighborhood association or a condo association can have its own rules and its own fee. For you, that can mean two bills and two sets of rules. The name will not warn you: only ${NAMES.master_named} of the more than ${NAMED} associations in the lien count above have "master" in the name.`) +
      LAYERS +
      h.h3("What do the two fees come to together?") +
      h.p(`The master's fee plus the fee of the association inside it. A listing's fee may leave out the second one, so we have no count of that total for homes here. For a home you send us, adding the two up is ${h.a("#what-we-check", "the second of our checks")}.`) +
      h.h3("Three communities here with more than one association") +
      h.p("Each entry starts with the typical fee that homes for sale there list, as their agents entered it.") +
      COMMUNITIES +
      h.cta("Does a home you like pay two fees?", "Name the home. We look for a master association and any association inside it, and add up what each one charges.", "Have us add up its fees", "/contact/", bg) },

    { h2: "What surprises buyers in an HOA or a condo?", toc: "Surprises", id: "surprises", html: () =>
      SURPRISES +
      STAT },

    { h2: "What do we check before you make an offer?", toc: "What we check", id: "what-we-check", html: (bg) =>
      h.p("We read the papers of every association on the home, and we check these four things:") +
      CHECKS +
      h.p(`${h.a("/hoa/rental-restrictions/", "HOA rental restrictions")} covers the rules on renting, and ${h.a("/hoa/reserves/", "HOA reserves")} covers what an association has saved.`) +
      h.cta("Four checks before you make an offer", "Send us the address of a home you like, condo or house.", "Have us run the four checks", "/contact/", bg) },

    { h2: "Does a condo association change your loan?", toc: "Loans", id: "loans", html: () =>
      h.p(`Yes, for many condos. A lender that follows ${h.ext(FNMA, "Fannie Mae's rules")} reviews the whole condo project before a loan on an attached unit. That applies to a project of more than ten units, and to one of five to ten units inside a larger community or under a master association.`) +
      h.p(`Three kinds of home skip the full review: a detached condo, a small condo project, and a house or townhouse in a neighborhood where every owner must belong to the HOA. A detached condo is a stand-alone home sold as a condo. ${h.a("/invest/non-warrantable-condos/", "Condos most lenders will not lend on")} covers buildings that fail it.`) },

    { h2: "Does it matter if it is called a POA?", toc: "Pros and cons", id: "pros-and-cons", html: (bg) =>
      h.p("The real choice is between a condo and a house, not between an HOA and a POA:") +
      PROS +
      h.p(`Whether dues are tax deductible has its own page: ${h.a("/hoa/tax-deductible/", "are HOA fees tax deductible")}. How owners split the bill for a big condo repair is on ${h.a("/hoa/special-assessments/", "condo special assessments")}. Our page ${h.a("/hoa/benefits/", "are HOA fees worth it")} weighs what the fees buy against what you give up.`) +
      h.cta("Torn between a condo and a house?", "Tell us your budget and the towns you like. We send condos and houses for sale, each with its monthly fee.", "Send me condos and houses", "/contact/", bg) },
  ],
  pageImages: () => ph.pageImages(),
  afterSources: () => ph.credits(),
  faqTitle: "HOA vs POA questions",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-30", href: T27_30 },
    { name: "SC Code 27-31", href: T27_31 },
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC disclosure addendum", href: ADDENDUM },
    { name: "44 CFR 61 App. A(3)", href: CFR },
    { name: "Fannie Mae B4-2.1-01", href: FNMA },
    { name: "SCDCA HOA reports", href: SCDCA },
    { name: "Horry County deed index", href: DEEDS },
  ],
  sourcesNote: "Fees and what they cover: our count of homes for sale in the local MLS. Association names: our count of the county's lien index. Not legal advice; a South Carolina attorney can advise on your documents.",
  bottomCta: { h2: "Ask about any home on the Grand Strand", p: "An agent reads its association papers and replies with the fees, the rules and who insures what.", label: "Ask about a home", href: "/contact/" },
  keywords: "HOA vs POA, HOA vs POA South Carolina, is a POA the same as an HOA, property owners association South Carolina, regime fee South Carolina, horizontal property regime, condo association vs HOA, master association vs HOA, two HOA fees, Horizontal Property Act South Carolina",
  about: "Homeowners associations, property owners associations and condo regimes (horizontal property regimes) in South Carolina",
});
