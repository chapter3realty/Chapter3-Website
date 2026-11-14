/* /buyers/undisclosed-flooding/ - has this house flooded before, and how to find out in Horry County:
 * the five checks we run before an offer (who can get each record, what each misses), what the seller's
 * disclosure form asks and the years it leaves out, the local proof that floods here reach past FEMA's
 * map (claims by storm, Florence, the county's Florence flood map), buying a house that flooded, the
 * empty lots, and what to do if the seller hid it.
 *
 * Batch 2026-10-d, Lane U. Version 1, 2026-11-01. The live page was hand-made; this spec replaces it.
 * Facts: Blog-Brain batches/2026-10-d/buyers-undisclosed-flooding/facts.md (VERIFIED rows, and CORRECTED
 * rows in the verifier's "Use" wording only; VERIFY.md). Demand: must-answer.md (Google suggestions,
 * 2026-11-01). Plan: PLAN.md.
 * Data: data/2026-10-d/buyers-undisclosed-flooding/ (claims-findings.json from OpenFEMA NfipClaims v3;
 * other-findings.json from NfipMultipleLossProperties, NfipResidentialPenetrationRates and
 * HmaSubapplications; gis-findings.json and map-*.geojson from Horry County GIS and the CRM's active
 * listings in aggregate). Every count and share on the page is read from those files here and checked
 * against its ledger row (must()), never typed.
 * Kept from the live page: the title and H1 the owner liked (data/headlines.json), "a flood zone is not a
 * flood history" (now with local proof), the four check areas (now five numbered checks, corrected), the
 * link to /contact/. Fix round 1 (REVIEW-1.md) cut the sentences that only pointed to other pages.
 * Not kept (judge, SWEEP, ledger corrections): the unsourced story (not in stories/stories.json; owner
 * question in PROPOSED.md), "most agents do not check", "our building study surfaces exactly this", a
 * CLUE report the buyer pulls, the burst-pipe example, "Talk to a licensed agent".
 * Never on the page: a premium, rate or payment; a listing, an address or a map dot; a claim that CLUE
 * shows flood claims; "can keep its rate" (row 27, struck).
 * Map: drawn here from the county's layers (NEEDS.md 2: area-map.js has no fill layer), written to
 * images/2026-10-d/buyers-undisclosed-flooding/florence-flood-map.svg at build time.
 * Photo: one public domain photo (SC National Guard, Florence, Conway area), record in this page's
 * data folder (photos.json), left edge cropped (a mailbox number). Photo partner's shots:
 * batches/2026-10-d/buyers-undisclosed-flooding/shot-list.md.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, compareCards } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const { icon } = require(path.join(BB, "tools", "icons.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const { loadGeo2 } = require(path.join(BB, "tools", "area-map.js"));

const SELF = "/buyers/undisclosed-flooding/";
const SLUG = "buyers-undisclosed-flooding";
const DATA = path.join(__dirname, "..", "data", "2026-10-d", SLUG);
const IMG_DIR = path.join(__dirname, "..", "chapter3realty", "images", "2026-10-d", SLUG);
const IMG_SRC = `/images/2026-10-d/${SLUG}`;
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const C = read("claims-findings.json"), O = read("other-findings.json"), GIS = read("gis-findings.json");
const n = (v) => Math.round(v).toLocaleString("en-US");
const must = (ok, what) => { if (!ok) throw new Error(`undisclosed-flooding: ${what} differs from its ledger row`); };
const CONTACT = "/contact/";

/* ---------------------------------------------------------------------------- */
/* The numbers, each checked against its ledger row.                             */

const ALL = C.all_paid;                                                   // row 18
must(ALL.paid === 8815 && ALL.outside === 2047 && Math.round(ALL.pct_outside_of_known) === 23, "row 18");
const EV = C.events;                                                      // rows 20, 22, 36
const FLO = EV["Hurricane Florence"], NOW = C.current_map.florence;
must(FLO.outside === 391 && Math.round(FLO.pct_outside_of_known) === 45, "row 20 (rated)");
must(NOW.current_outside === 433 && NOW.with_current_zone === 863 && Math.round(NOW.pct_outside_today_of_known) === 50, "row 20 (today's map)");
const PEN = O.penetration;                                                // row 23
must(Math.round(PEN.resPenetrationRate * 100) === 15 && Math.round(PEN.totalResStructures / PEN.resContractsInForce) === 7, "row 23");
const ML = O.multiple_loss;                                               // row 25
must(ML.properties === 1094 && ML.zone_outside === 203, "row 25");
const HMA = O.hma_buildings_by_disaster_activity;                         // row 12
must(HMA["1299 Acquisition"] === 63 && HMA["4286 Acquisition"] === 86 && HMA["4394 Acquisition"] === 8, "row 12");
const HOMES = GIS.homes;                                                  // row 32
must(HOMES.houses_in_sfz_not_sfha_without_slivers === 392 && HOMES.houses.in_sfz_not_sfha === 683 && HOMES.houses.in_sfz === 2133, "row 32 (houses)");
must(GIS.area_sq_mi.sfz_outside_sfha_without_slivers === 7.9 && GIS.area_sq_mi.sfz_outside_sfha === 11.9, "row 32 (area)");
const LST = GIS.listings;                                                 // row 33
must(LST.in_horry === 6455, "row 33 (listings)");
const IN_SFZ = Object.values(LST.in_sfz).reduce((t, v) => t + v, 0), IN_SFZ_OUT = Object.values(LST.in_sfz_not_sfha).reduce((t, v) => t + v, 0);
must(IN_SFZ === 87 && IN_SFZ_OUT === 21, "row 33 (in the Florence map)");
const IN_SFZ_ROUND = Math.ceil(IN_SFZ / 10) * 10;                                       // "nearly 90"
must(IN_SFZ_ROUND - IN_SFZ <= 3, "row 33 (nearly 90)");
const SELL = GIS.sellers;                                                 // row 34
must(SELL.after_florence_2018_09_14 === 1549 && SELL.houses_matched_with_sale_date === 2028, "row 34");
const SHARE_AFTER = Math.round(SELL.after_florence_2018_09_14 / SELL.houses_matched_with_sale_date * 4);   // 3 (of 4)
must(SHARE_AFTER === 3, "row 34 (3 in 4)");

/* Row 36: the storms in the chart, grouped by each storm's leading cause (the ledger's labels). */
const STORMS = [
  { key: "Hurricane Isaias", name: "Isaias", group: "surge" },
  { key: "Hurricane Ian", name: "Ian", group: "surge" },
  { key: "Hurricane Hugo", name: "Hugo", group: "surge" },
  { key: "Hurricane Matthew", name: "Matthew", group: "both" },
  { key: "Hurricane Floyd", name: "Floyd", group: "rain" },
  { key: "Hurricane Florence", name: "Florence", group: "rain" },
  { key: "October severe storms", name: "The October rains", group: "rain" },
].map((s) => { const e = EV[s.key], yrs = Object.keys(e.years || {}); if (yrs.length !== 1) throw new Error(`row 36: ${s.key} has ${yrs.length} years`);
  return Object.assign(s, { year: yrs[0], outside: e.outside, known: e.high + e.outside, pct: e.outside / (e.high + e.outside) * 100 }); });
const YEAR = Object.fromEntries(STORMS.map((s) => [s.name, s.year]));                  // each storm's year, from the claims data
must(YEAR.Florence === "2018" && YEAR.Matthew === "2016" && SELL.after_florence_2018_09_14, "Florence 2018 (rows 13, 34)");
const PCT = Object.fromEntries(STORMS.map((s) => [s.name, Math.round(s.pct)]));
must(PCT.Isaias === 2 && PCT.Ian === 5 && PCT.Hugo === 9 && PCT.Matthew === 20 && PCT.Floyd === 37 && PCT.Florence === 45 && PCT["The October rains"] === 51, "row 36");

/* ---------------------------------------------------------------------------- */
/* Page styles: the glass blocks this page draws itself. Scoped to .c3-uf.        */

const GL = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.56));border:1px solid rgba(255,255,255,.92);box-shadow:inset 0 1px 0 rgba(255,255,255,.85),0 18px 40px -28px rgba(28,32,40,.45);border-radius:20px";
const C_SURGE = "#7d8b97", C_RAIN = "#c4783a", C_BOTH = "#a68a6c";
const C_SFHA = "#cfe0ea", C_SFZ = "#4f7f9f", C_OUT = "#c4783a";
const CSS = "<style>"
  /* The five checks: numbered glass cards, each with who can get the record and what it misses. */
  + ".c3-uf-steps{list-style:none;counter-reset:s;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.8rem;max-width:760px}"
  + `.c3-uf-steps>li{${GL};counter-increment:s;margin:0;padding:1rem 1.15rem 1rem 4.1rem;position:relative;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.6}`
  + ".c3-uf-steps>li::before{content:counter(s);position:absolute;left:1rem;top:1rem;width:2.2rem;height:2.2rem;border-radius:50%;background:var(--navy);color:#f4efe8;font-family:var(--sans);font-weight:700;display:flex;align-items:center;justify-content:center}"
  + ".c3-uf-steps .k{display:block;color:var(--navy);font-family:var(--sans);font-weight:650;font-size:1.1rem;line-height:1.35;margin:.1rem 0 .4rem}"
  + ".c3-uf-tag{display:inline-flex;align-items:center;gap:.4rem;font-family:var(--sans);font-size:.95rem;font-weight:600;line-height:1.3;color:var(--navy);background:rgba(255,255,255,.85);border:1px solid rgba(145,89,43,.35);border-radius:999px;padding:.2rem .7rem .2rem .45rem;margin:0 0 .55rem}"
  + ".c3-uf-tag.own{border-color:rgba(28,32,40,.4)}.c3-uf-tag span{display:inline-flex;color:var(--brass)}.c3-uf-tag.own span{color:var(--navy)}"
  + ".c3-uf-steps p{margin:0 0 .5rem}.c3-uf-steps p:last-child{margin-bottom:0}"
  + ".c3-uf-steps .miss{border-top:1px solid rgba(28,32,40,.12);padding-top:.5rem;margin-top:.6rem;font-size:1rem}"
  + ".c3-uf-steps .miss b{color:var(--navy);font-family:var(--sans);font-weight:650}"
  + ".c3-uf-steps a{color:var(--navy);text-decoration:underline}"
  + "@media (max-width:519px){.c3-uf-steps>li{padding:.95rem 1rem}.c3-uf-steps>li::before{position:static;float:left;margin:0 .7rem .3rem 0}"
  + ".c3-uf-steps .k{min-height:2.2rem;display:flex;align-items:center;margin-top:0}.c3-uf-steps .c3-uf-tag{display:flex;width:fit-content;clear:both}}"
  /* The years the form asks about: a two-part bar. */
  + `.c3-uf-years{${GL};margin:1.4rem 0 1.6rem;padding:1.1rem 1.15rem 1rem;max-width:760px}`
  + ".c3-uf-years .cap{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;line-height:1.35;margin:0 0 .9rem}"
  + ".c3-uf-bar{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:.35rem;font-family:var(--sans)}"
  + ".c3-uf-bar>div{border-radius:12px;padding:.7rem .8rem;line-height:1.35;font-size:1rem;min-width:0}"
  + ".c3-uf-bar .before{background:repeating-linear-gradient(135deg,#e9e4dc 0 8px,#f3efe9 8px 16px);color:var(--navy);border:1px solid rgba(28,32,40,.14)}"
  + `.c3-uf-bar .mine{background:linear-gradient(180deg,#d4894a,#c4783a);color:#1c2028}`
  + ".c3-uf-bar b{display:block;font-weight:700;font-size:1.02rem;margin-bottom:.15rem}"
  + ".c3-uf-pin{display:inline-flex;align-items:center;gap:.35rem;margin-top:.45rem;font-weight:650;font-size:.95rem;color:#1c2028;background:#fff;border-radius:999px;padding:.12rem .6rem .12rem .4rem;border:1px solid rgba(28,32,40,.25)}"
  + ".c3-uf-pin span{display:inline-flex;color:#3f6275}"
  + ".c3-uf-ends{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);gap:.35rem;font-family:var(--sans);font-size:.95rem;line-height:1.3;color:var(--muted);margin-top:.45rem}"
  + ".c3-uf-ends>span:last-child{display:flex;justify-content:space-between;gap:.5rem}"
  + ".c3-uf-years figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.8rem 0 0;padding:0}"
  /* The claims chart: grouped bars, each storm's share outside the zone. */
  + `.c3-uf-chart{${GL};margin:1.4rem 0 1.6rem;padding:1.1rem 1.15rem 1rem;max-width:760px}`
  + ".c3-uf-chart .cap{display:block;font-family:var(--sans);font-weight:650;color:var(--navy);font-size:1.05rem;line-height:1.35;margin:0 0 .8rem}"
  + ".c3-uf-grp{margin:0 0 .9rem}.c3-uf-grp:last-of-type{margin-bottom:0}"
  + ".c3-uf-grp .gh{display:flex;align-items:center;gap:.5rem;font-family:var(--sans);font-weight:650;font-size:1rem;color:var(--navy);margin-bottom:.35rem;border-bottom:1px solid rgba(28,32,40,.12);padding-bottom:.2rem}"
  + ".c3-uf-grp .gh i{display:inline-block;width:1rem;height:.7rem;border-radius:3px}"
  + ".c3-uf-row{display:grid;grid-template-columns:minmax(7.5rem,11rem) minmax(0,1fr) 3rem;align-items:center;gap:.6rem;font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.3;margin:.35rem 0}"
  + ".c3-uf-row small{display:block;color:var(--muted);font-size:.9rem}"
  + ".c3-uf-row .bar{display:block;min-width:0;background:rgba(28,32,40,.06);border-radius:5px}"
  + ".c3-uf-row .bar i{display:block;height:.75rem;border-radius:5px;min-width:3px}"
  + ".c3-uf-row em{font-style:normal;font-weight:650;text-align:right;font-variant-numeric:tabular-nums}"
  + ".c3-uf-chart figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.9rem 0 0;padding:0}"
  /* The map: our own SVG file, a legend under it. */
  + ".c3-uf-map img{display:block;width:100%;height:auto;border-radius:12px}"
  + ".c3-uf-key{list-style:none;display:grid;gap:.35rem;margin:.7rem .3rem .2rem;padding:0;font-family:var(--sans);font-size:1rem;color:var(--navy);line-height:1.35}"
  + ".c3-uf-key li{display:flex;align-items:center;gap:.55rem;margin:0}.c3-uf-key i{flex:none;display:inline-block;width:1.4rem;height:.9rem;border-radius:3px;border:1px solid rgba(28,32,40,.2)}"
  /* The houses on the flooded land: three number tiles. */
  + ".c3-uf-tiles{list-style:none;margin:1.2rem 0 1.5rem;padding:0;display:grid;gap:.65rem;max-width:760px}"
  + "@media (min-width:760px){.c3-uf-tiles{grid-template-columns:repeat(3,minmax(0,1fr))}.c3-uf-tiles b{font-size:1.6rem!important}}"
  + `.c3-uf-tiles>li{${GL};margin:0;padding:.9rem 1rem}`
  + ".c3-uf-tiles b{display:block;font-family:var(--serif);font-weight:400;font-size:1.9rem;line-height:1.1;color:#8a5226;margin-bottom:.3rem}"
  + ".c3-uf-tiles span{display:block;color:var(--muted);font-size:1rem;line-height:1.5}"
  /* The photo. */
  + ".c3-uf-photo img{display:block;width:100%;height:auto;border-radius:12px}"
  /* Three things to know before buying a house that flooded. */
  + ".c3-uf-three{list-style:none;margin:1.2rem 0 1.6rem;padding:0;display:grid;gap:.8rem;max-width:960px}"
  + "@media (min-width:860px){.c3-uf-three{grid-template-columns:repeat(3,minmax(0,1fr))}}"
  + `.c3-uf-three>li{${GL};margin:0;padding:1rem 1.1rem .95rem}`
  + ".c3-uf-three .hd{display:flex;align-items:center;gap:.65rem;margin:0 0 .5rem;font-family:var(--sans);font-weight:650;font-size:1.08rem;color:var(--navy);line-height:1.3}"
  + ".c3-uf-ic{flex:none;display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:13px;color:var(--brass);background:rgba(255,255,255,.85);border:1px solid rgba(255,255,255,.95);box-shadow:0 6px 14px -10px rgba(28,32,40,.45)}"
  + ".c3-uf-three p{margin:0 0 .5rem;color:var(--muted);font-size:var(--read,1.0625rem);line-height:1.6}.c3-uf-three p:last-child{margin-bottom:0}"
  + ".c3-uf-three .we{color:var(--navy);font-weight:500}"
  + `main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14);box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6);display:block;text-align:center!important;border-radius:28px;padding:2.2rem 1.6rem;margin:0 auto!important}`
  + `@media (max-width:699px){main#main>section[style^="background:var(--navy)"]:last-of-type>.wrap{padding:1.6rem 1.2rem 1.7rem;border-radius:24px}}`
  /* Shared chrome, scoped here until the lead fixes it once (NEEDS.md 4): the listing strip's search box
     ran past a 320 px window, and the header phone number past a 1024 px one. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "</style>";

/* ---------------------------------------------------------------------------- */
/* The five checks (rows 8, 9, 14 to 17, 24, 11).                                 */

const TAG = (who, own) => `<span class="c3-uf-tag${own ? " own" : ""}"><span aria-hidden="true">${icon(own ? "key" : "pin", { size: 16 })}</span>${who}</span>`;
const FEMA_FAQ = "https://agents.floodsmart.gov/flood-maps-and-data/faqs-about-nfip-data";
const TN_CLUE = "https://www.tn.gov/commerce/insurance/consumer-resources/clue.html";
const PSDS = "https://psds.wcu.edu/projects-and-research/municipalprojects/horry-county-flood-mapping-2/";
const HC_FLOOD_NEWS = "https://horrycountysc.gov/media/kw5fxufi/flood-news-flyer-with-ppa-feb-2026.pdf";
const HC_EC = "https://horrycountysc.gov/departments/emergency-management/flooding/elevation-certificates/";
const HC_BUILD = "https://horrycountysc.gov/departments/emergency-management/flooding/build-responsibly/";
const HC_KNOW = "https://horrycountysc.gov/departments/emergency-management/flooding/prepare-for-a-flood-hazard/know-your-flood-hazard/";
const STEPS = [
  { k: "Ask the seller for the claim records", tag: TAG("From the seller", true),
    body: [`The Federal Emergency Management Agency (FEMA) runs federal flood insurance. It will not give a buyer a house's flood insurance claims: ${h.ext(FEMA_FAQ, "federal privacy law bars it")} without the owner's consent.`,
      `We ask the seller for those, and for the insurance industry's ${h.ext(TN_CLUE, "claims report on the house")}, called CLUE.`],
    miss: "A flood on a house that had no flood insurance." },
  { k: "Put the house on two flood maps", tag: TAG("Public maps: we pull them"),
    body: [`FEMA's flood map is a forecast of risk. After Florence, Horry County ${h.ext(PSDS, "mapped how far Florence's water went")}.`,
      `We put the house on both maps. ${h.a("#florence-map", "Our map of the two")} shows where they differ. To check one address on FEMA's map, use our ${h.a("/buyers/flood-zone-check/", "flood zone check guide")}.`],
    miss: "Whether water got inside. The county's map shows the ground Florence's water covered, in that one storm." },
  { k: "Ask the county's floodplain staff", tag: TAG("We ask the county"),
    body: [`Horry County's ${h.ext(HC_FLOOD_NEWS, "floodplain staff")} answer "Has my property ever flooded?" and keep the county's flood history, including where floods have repeated. The county also posts the ${h.ext(HC_EC, "signed surveys")} it has on file that show how high a floor is.`],
    miss: "A house inside a city. Each city keeps its own records, and we ask that city." },
  { k: "Look for a permit behind every repair", tag: TAG("We ask the county or city"),
    body: [`Outside city limits in Horry County, ${h.ext(HC_BUILD, "any work on a building over $500")} needs a permit. Inside a city, the city issues it. A flood repair done legally leaves a ${h.a("/buyers/common-mistakes/", "permit record")}.`],
    miss: "Work done with no permit. A repair with no record is a question we put to the seller." },
  { k: "Read the house and the street", tag: TAG("At the showing"),
    body: [`We use the county's ${h.ext(HC_KNOW, "questions about water around a house")}. We look at whether water flows away from the house or stands next to the walls, whether the ditch or storm drain is clear, and whether the downspouts carry water well away.`,
      `On the street, a house raised above its older neighbors can be one that flooded and was rebuilt. ${h.a("#empty-lots", "Empty lots between houses")} can be a flood buyout.`],
    miss: "Proof. These are clues, and the records above confirm or rule them out." },
];
const STEPS_HTML = `<ol class="c3-uf-steps" aria-label="The five checks we run on a house's flood history">`
  + STEPS.map((s) => `<li><span class="k">${s.k}</span>${s.tag}${s.body.map((p) => `<p>${p}</p>`).join("")}<p class="miss"><b>What it misses:</b> ${s.miss}</p></li>`).join("") + `</ol>`;

/* ---------------------------------------------------------------------------- */
/* The seller's form (row 3): the six flood questions, and the years it covers.   */

const FORM = "https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf";
const T27_50 = "https://www.scstatehouse.gov/code/t27c050.php";
const YEARS = `<figure class="c3-uf-years" role="group" aria-label="For about 3 in 4 resale houses for sale in Horry County, Florence came before the seller bought, in the years the form does not ask about">`
  + `<span class="cap">For about ${SHARE_AFTER}\u00a0in\u00a04 resale houses for sale here, Florence came before the seller bought</span>`
  + `<div class="c3-uf-bar"><div class="before"><b>Before the seller bought</b>The form does not ask.<br/><span class="c3-uf-pin"><span aria-hidden="true">${icon("storm", { size: 16 })}</span>Florence, ${YEAR.Florence}, is here</span></div>`
  + `<div class="mine"><b>The seller's years</b>The form asks about floods, claims, repairs and federal flood aid.</div></div>`
  + `<div class="c3-uf-ends" aria-hidden="true"><span>\u2191 House built</span><span><span>\u2191 Seller buys</span><span>Your offer \u2191</span></span></div>`
  + `<figcaption>Resale houses for sale (not new builds) that we could match to a county parcel. Our count, from Horry County's parcel records and homes for sale counted in aggregate.</figcaption></figure>`;

/* The labelled example (CRAFT 6; PLAN: rows 3, 8, 14 and 34 only; the live page's story is cut until the owner confirms it). */
const STORY = (bg) => PK.story([
  "<strong>Example:</strong> A buyer likes a house near the Waccamaw River. The seller bought after Florence and answers No to every flood question on the form.",
  "A Chapter3 agent puts the lot on the county's Florence flood map. Florence's water covered the yard. The agent asks for the house's FEMA claim records, and the seller will not send them.",
  "The buyer walks away and offers on a house a mile off, on land the water did not cover.",
], "The form never asked about that flood. The county's map showed it.", bg);

/* ---------------------------------------------------------------------------- */
/* The claims chart (row 36), grouped by the leading cause of each storm's claims. */

const row = (s, color) => `<div class="c3-uf-row" role="row"><span role="rowheader">${s.name}<small>${s.year}</small></span>`
  + `<span class="bar" role="cell" aria-hidden="true"><i style="width:${s.pct.toFixed(1)}%;background:${color}"></i></span><em role="cell">${Math.round(s.pct)}%</em></div>`;
const GROUPS = [["surge", "Storm surge on the beach", C_SURGE], ["both", "Surge and river", C_BOTH], ["rain", "Rain and river floods", C_RAIN]];
const CHART = `<figure class="c3-uf-chart"><div role="table" aria-label="Share of paid flood claims in Horry County on buildings outside FEMA's high-risk zone, by storm">`
  + `<span class="cap" aria-hidden="true">Paid flood claims in Horry County insured as outside FEMA's high-risk zone, by storm</span>`
  + GROUPS.map(([g, label, color]) => `<div class="c3-uf-grp" role="rowgroup"><div class="gh" aria-hidden="true"><i style="background:${color}"></i>${label}</div>`
    + STORMS.filter((s) => s.group === g).map((s) => row(s, color)).join("") + `</div>`).join("")
  + `</div><figcaption>Each bar is the share of that storm's paid flood claims, out of 100 percent, on buildings insured as outside FEMA's high-risk zone. Storms are grouped by their main cause of flooding in FEMA's records.</figcaption></figure>`;

/* ---------------------------------------------------------------------------- */
/* The map (rows 14, 32): FEMA's high-risk zone, the county's Florence flood map, */
/* and the land Florence flooded outside FEMA's zone (strips under ~60 m left    */
/* out, so the map shows the 400-house figure, not map noise). Our own SVG file.  */

const MAP_FILE = "florence-flood-map.svg";
const map = (() => {
  const W = 440, lon0 = -79.36, lat0 = 34.32, cos = Math.cos(33.93 * Math.PI / 180), k = W / ((-78.52 - lon0) * cos);
  const H = Math.round((lat0 - 33.55) * k);
  const X = (lon) => (lon - lon0) * cos * k, Y = (lat) => (lat0 - lat) * k;
  const geoj = (f) => { const g = read(f).features[0].geometry; return g.type === "Polygon" ? [g.coordinates] : g.coordinates; };
  /* Douglas-Peucker in map units, a closed ring split at its farthest point. */
  const dp = (pts, tol) => {
    if (pts.length < 3) return pts;
    const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
    const st = [[0, pts.length - 1]];
    while (st.length) {
      const [a, b] = st.pop(); let md = -1, mi = -1; const [ax, ay] = pts[a], [bx, by] = pts[b], dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1e-9;
      for (let i = a + 1; i < b; i++) { const d = Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / L; if (d > md) { md = d; mi = i; } }
      if (md > tol) { keep[mi] = 1; st.push([a, mi], [mi, b]); }
    }
    return pts.filter((_, i) => keep[i]);
  };
  const area = (r) => { let s = 0; for (let i = 0, j = r.length - 1; i < r.length; j = i++) s += (r[j][0] + r[i][0]) * (r[j][1] - r[i][1]); return Math.abs(s / 2); };
  const pathOf = (polys, tol, minArea) => {
    let d = "";
    for (const p of polys) for (const ring of p) {
      const q = ring.map(([lo, la]) => [X(lo), Y(la)]);
      let far = 1, fd = -1; for (let i = 1; i < q.length; i++) { const dd = Math.hypot(q[i][0] - q[0][0], q[i][1] - q[0][1]); if (dd > fd) { fd = dd; far = i; } }
      const r = dp(q.slice(0, far + 1), tol).concat(dp(q.slice(far), tol).slice(1));
      if (r.length < 4 || area(r) < minArea) continue;
      let px = Math.round(r[0][0] * 10), py = Math.round(r[0][1] * 10); const parts = [];
      for (let i = 1; i < r.length - 1; i++) { const x = Math.round(r[i][0] * 10), y = Math.round(r[i][1] * 10); if (x === px && y === py) continue; parts.push(`${(x - px) / 10} ${(y - py) / 10}`); px = x; py = y; }
      d += `M${Math.round(r[0][0] * 10) / 10} ${Math.round(r[0][1] * 10) / 10}l${parts.join(" ").replace(/ -/g, "-")}z`;
    }
    return d;
  };
  const geo = loadGeo2();
  const T = Object.fromEntries(geo.towns.map((t) => [t.name, t]));
  const sea = [...geo.coast, [-78.0, 33.75], [-78.0, 32.9], [-79.6, 32.9], [-79.6, 33.1]];
  const line = (r) => r.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join("L");
  const FT = 'font-family="Inter,system-ui,-apple-system,Segoe UI,Arial,sans-serif"';
  const HALO = 'paint-order="stroke" stroke="#fbf8f3" stroke-width="5" stroke-linejoin="round"';
  /* Label spots in map units from each town's point, checked in the shots at 390, 768 and 1440. */
  const LAB = [["Loris", 10, 6, "start"], ["Longs", 10, -8, "start"], ["Conway", -11, 6, "end"], ["Socastee", -10, 16, "end"], ["Myrtle Beach", 9, 18, "start", ["Myrtle", "Beach"]]];
  const towns = LAB.map(([name, dx, dy, a, lines]) => {
    const t = T[name]; if (!t) throw new Error(`area-map towns: no ${name}`);
    const x = X(t.lon), y = Y(t.lat);
    const txt = (lines || [name]).map((l, i) => `<tspan x="${(x + dx).toFixed(1)}" dy="${i ? 24 : 0}">${l}</tspan>`).join("");
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#fff" stroke="#1c2028" stroke-width="2"/>`
      + `<text x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${a}" ${FT} font-size="22" font-weight="600" fill="#1c2028" ${HALO}>${txt}</text>`;
  }).join("");
  const county = geoj("map-county.geojson")[0][0];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 2}" height="${H * 2}">`
    + `<defs><clipPath id="c"><path d="M${line(county)}Z"/></clipPath></defs>`
    + `<rect width="${W}" height="${H}" fill="#e9e3d8"/>`
    + `<path d="M${line(county)}Z" fill="#fdfbf7"/>`
    + `<path d="M${line(sea)}Z" fill="#d3e0e5"/>`
    + `<g clip-path="url(#c)">`
    + `<path d="${pathOf(geoj("map-sfha.geojson"), 0.7, 2.5)}" fill="${C_SFHA}" fill-rule="evenodd"/>`
    + `<path d="${pathOf(geoj("map-sfz.geojson"), 0.45, 0.6)}" fill="${C_SFZ}" fill-rule="evenodd" stroke="${C_SFZ}" stroke-width=".5" stroke-linejoin="round"/>`
    + `<path d="${pathOf(geoj("map-sfz-outside-sfha-core.geojson"), 0.3, 0.12)}" fill="${C_OUT}" fill-rule="evenodd" stroke="${C_OUT}" stroke-width="1.6" stroke-linejoin="round"/>`
    + `</g>`
    + `<path d="M${line(county)}Z" fill="none" stroke="#5c6b78" stroke-width="1.4" stroke-linejoin="round"/>`
    + `<text x="${W - 14}" y="${H - 16}" text-anchor="end" ${FT} font-size="18" font-style="italic" fill="#3f6275">Atlantic Ocean</text>`
    + towns + `</svg>`;
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const file = path.join(IMG_DIR, MAP_FILE);
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== svg) fs.writeFileSync(file, svg);
  if (svg.length > 120000) throw new Error(`the map is ${svg.length} bytes; simplify more`);
  return { W, H };
})();
const MAP = `<figure class="c3-uf-map" id="florence-map" style="margin:1.6rem 0 1.8rem;max-width:560px">`
  + `<img src="${IMG_SRC}/${MAP_FILE}" width="${map.W}" height="${map.H}" loading="lazy" decoding="async" alt="Map of Horry County. FEMA's high-risk flood zone runs along the rivers and the coast. Florence's flood water covered most of it along the Waccamaw and Little Pee Dee rivers, and spread outside it in many places between Loris, Longs, Conway and Socastee.">`
  + `<ul class="c3-uf-key" aria-hidden="true"><li><i style="background:${C_SFHA}"></i>FEMA's current high-risk flood zone</li><li><i style="background:${C_SFZ}"></i>Land Florence's water covered (the county's map)</li><li><i style="background:${C_OUT}"></i>Land Florence flooded outside FEMA's zone</li></ul>`
  + `<figcaption style="color:var(--muted);font-size:.95rem;line-height:1.55;margin-top:.6rem">Orange marks land Florence's water covered that FEMA's current map does not call high risk. Map: Chapter3 Realty, from Horry County's flood map layers and the Census Bureau's coastline.</figcaption></figure>`;

/* The houses on that land (rows 32, 33), as three tiles under the map. */
const LAND_TILES = `<ul class="c3-uf-tiles" role="list" aria-label="Houses and homes for sale on land Florence flooded">`
  + `<li><b>About 400</b><span>houses stand on the orange land, away from its thin edges: flooded in Florence, and not high risk on FEMA's map.</span></li>`
  + `<li><b>More than\u00a0${n(Math.floor(HOMES.houses.in_sfz / 1000) * 1000)}</b><span>houses stand on land Florence's water covered. The map shows where water covered the ground, not which houses took water inside.</span></li>`
  + `<li><b>Nearly ${IN_SFZ_ROUND}</b><span>homes for sale in Horry County stand on land Florence's water covered.</span></li></ul>`;

/* ---------------------------------------------------------------------------- */
/* The photo (public domain, SC National Guard; record in this page's photos.json). */

const PHOTOS = fs.existsSync(path.join(DATA, "photos.json")) ? read("photos.json").photos : [];
const ph = PHOTOS.length ? PK.create({ h, photos: PHOTOS }).photoSet({ aerialWidth: "760px" }) : null;
const PHOTO = ph ? ph.aerial("conway-florence-floodwater-street", "Floodwater on a street of houses in the Conway area after Florence.") : "";

/* ---------------------------------------------------------------------------- */
/* Buying a house that flooded (rows 16, 24, 10).                                 */

const W23001 = "https://agents.floodsmart.gov/sites/default/files/bulletins/W-23001/w-23001.pdf";
const THREE = `<ul class="c3-uf-three" role="list" aria-label="Three things to know before buying a house that flooded">`
  + `<li><span class="hd"><span class="c3-uf-ic" aria-hidden="true">${icon("home", { size: 22 })}</span>It was repaired with permits</span>`
  + `<p>Each flood repair has its permit on file, as in check 4.</p><p class="we">We match each repair to its permit record.</p></li>`
  + `<li><span class="hd"><span class="c3-uf-ic" aria-hidden="true">${icon("flood", { size: 22 })}</span>It is raised, or its risk is known</span>`
  + `<p>If repairs after a flood cost 50 percent or more of the house's value before it, the house must be ${h.ext(HC_BUILD, "raised above the flood height on FEMA's map")}.</p><p class="we">We pull the survey of how high its floor sits.</p></li>`
  + `<li><span class="hd"><span class="c3-uf-ic" aria-hidden="true">${icon("dollar", { size: 22 })}</span>You know the flood insurance cost</span>`
  + `<p>A house's federal flood claims ${h.ext(W23001, "stay with the address")}, not the owner, and its claim history can raise the cost of its flood insurance.</p><p class="we">We help you get a flood insurance quote on the house.</p></li>`
  + `</ul>`;

/* ---------------------------------------------------------------------------- */
/* If the seller hid it (rows 6, 28 to 30, 35).                                   */

const LLR = "https://llr.sc.gov/re/complaint.aspx";
const WHO = compareCards([
  { name: "A seller who knew and did not tell you", cells: { who: "A South Carolina real estate attorney" } },
  { name: "An agent who knew and did not tell you", cells: { who: "Real Estate Commission and an attorney" } },
  { name: "A dispute over the sales contract", cells: { who: "An attorney, not the Commission" } },
], [{ key: "who", label: "Who handles it" }], { caption: "Where a complaint about a flood no one told you about goes", nameLabel: "The problem" });

/* ---------------------------------------------------------------------------- */

const NWS = "https://www.weather.gov/ilm/HurricaneFlorence";
const SCOR = "https://scor.sc.gov/news/2024-06/horry-county-buyout-program-begins-demolition";
const NFIP_DATA = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2";
const USC5154A = "https://www.law.cornell.edu/uscode/text/42/5154a";
const T40_57 = "https://www.scstatehouse.gov/code/t40c057.php";
const T15_3 = "https://www.scstatehouse.gov/code/t15c003.php";
const DD_LAW = "https://rosenhagood.com/sc-residential-property-agreements-transitions-to-due-diligence-only-model/";
const SRL = "https://agents.floodsmart.gov/sites/default/files/media/document/2025-07/fema-nfip-policyholders-guide-severe-repetitive-loss_brochure-07-2023.pdf";

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "How to Find Out If a House Flooded: Myrtle Beach | Chapter3",
  description: "Has this house flooded before? How to find a house's flood history in Myrtle Beach and Horry County, what a seller must disclose, and the county's Florence map.",
  ogTitle: "Did this Myrtle Beach house flood before? How to find its flood history",
  crumb: "Flood History",
  eyebrow: "Flood history",
  h1: "Did this Myrtle Beach house flood before?",
  h1em: "How to find its flood history.",
  sub: "Five checks show it: FEMA's claim records, two flood maps, the county's records, repair permits and the house itself. You get all five for any house you send.",
  heroMedia: "<style>main#main .c3-glance li{line-height:1.4}</style>" + PK.glance([
    { icon: "home", label: `About ${SHARE_AFTER} in 4`, text: "resale houses for sale: the seller's form does not ask about Florence" },
    { icon: "flood", label: `${PCT.Florence}%`, text: "of paid Florence claims were insured outside FEMA's zone" },
  ]),
  heroCta: { title: "Have us check a house's flood history", label: "Send us the address", href: CONTACT },
  author: "devin",
  toc: false,
  shortAnswer: [
    `FEMA's records of flood insurance claims on a house go only to its owner, so we ask the seller for them. We put the house on FEMA's flood map and the county's map of the flooding from Hurricane Florence. We ask the county's staff about past floods and look for permits behind repairs. At the showing, we look for clues at the house and on its street.`,
    `We run these checks before you offer. If you learn of a flood after you sign, the South Carolina REALTORS sales contract gives you a due diligence period to end it.`,
  ],
  sections: [
    { h2: "How do you find out if a house has flooded before?", toc: "The five checks", id: "checks", html: () =>
      CSS + (ph ? ph.css() : "") +
      h.p("Our agents check five things. Each card says what that check can miss.") +
      STEPS_HTML +
      h.h3("What if the seller will not send the records?") +
      h.p("If the seller refuses, or does not answer, we tell you right away. You decide with what the maps, the county and the house showed: offer, offer less, or walk away.") +
      h.h3("Can I back out if I find a flood after I sign?") +
      h.p(`Yes, inside the due diligence period on the South Carolina REALTORS sales contract. In that period the buyer ${h.ext(DD_LAW, "can end the contract")} with a written notice of termination to the seller. We tell you what ending it would cost under the contract you sign, before you sign it. That is why we run these checks first.`) },

    { h2: "Does a seller have to disclose flooding in South Carolina?", toc: "What the seller must disclose", id: "seller-disclosure", html: (bg) =>
      h.p(`Yes, on the state's disclosure form, but only for the years the seller owned the house. ${h.ext(T27_50, "South Carolina law")} requires the form for a home with one to four units. The seller hands it over before you sign the contract, unless the contract says otherwise. Our guide to ${h.a("/sell/seller-disclosure/", "the seller disclosure form")} lists every question on it.`) +
      h.p(`${h.ext(FORM, "The form")} asks about floods, flood insurance claims, flood repairs and federal flood aid, each only for the seller's years. One question asks about any flood risk the seller knows of.`) +
      YEARS +
      h.h3('What does "No Representation" mean?') +
      h.p(`It is an answer on the form. A seller may choose it only when they do not have the knowledge to answer. The form says a seller may not choose it to avoid a question, must still disclose what they know, and is not freed from liability by it.`) +
      h.h3("Which sales need no disclosure form?") +
      h.p(`Some sales need no form at all. Among them are estate and trust sales, foreclosure sales, public auctions, the first sale of a ${h.a("/buyers/new-construction/", "new home no one has lived in")}, and a sale where both sides agree in writing to skip it. In those sales, the five checks matter more.`) +
      h.cta("Get the flood claim records a buyer cannot get alone", "We ask the seller for the house's flood claim reports and tell you right away if they refuse.", "Have us ask the seller", CONTACT, bg) },

    { h2: "Can a house flood if it is not in a flood zone?", toc: "Outside the flood zone", id: "outside-the-zone", html: (bg) =>
      h.p(`Yes, and in Horry County it happens most in rain and river floods. Since 1978, nearly 1 in 4 paid flood insurance claims here were on buildings insured as outside FEMA's high-risk zone. That means the policy was priced for a lower-risk zone.`) +
      CHART +
      h.p("In storm surge, almost every paid claim here was inside FEMA's high-risk zone. In rain and river floods, far more were outside it.") +
      h.h3("What Florence did") +
      h.p(`During Hurricane Florence in ${YEAR.Florence}, the Waccamaw River at Conway rose to a ${h.ext(NWS, "record crest")}, more than three feet above the old record from ${h.a("/buyers/relocating/hurricanes/", `Hurricane Matthew in ${YEAR.Matthew}`)}. Nearly 1,000 homes and businesses near the river flooded, many of them badly.`) +
      PHOTO +
      h.p(`Polo Farms, off SC 905, had five feet of water in homes. Aberdeen Country Club in Longs and Bradford Creek off SC 544 had up to three feet. Silver Fox Landing near the ${h.a("/buyers/waterfront-homes/", "Intracoastal Waterway")} had up to eight.`) +
      h.p("FEMA's current flood map took effect about three years after Florence. Our map puts it beside the land Florence's water covered.") +
      MAP +
      LAND_TILES +
      h.cta("Did Florence's water cover the land under a house you like?", "Send us the address. We put it on FEMA's map and the county's Florence map and tell you what each shows. It is free, with no obligation.", "Send us the address", CONTACT, bg) +
      h.h3("Does a clean claim history mean the house never flooded?") +
      h.p(`No. A house with no flood insurance leaves no flood claim. Horry County has about one ${h.a("/buyers/coastal-insurance/", "federal flood policy")} for every seven residential buildings, so most houses here have no federal flood policy to claim on.`) },

    { h2: "Should you buy a house that flooded?", toc: "Buying one that flooded", id: "buy-one-that-flooded", html: (bg) =>
      h.p("Buy a house that flooded only when three things are true. Our agents check each one.") +
      THREE +
      h.p(`A house outside the high-risk zone can still be a repeat-flood house: nearly 1 in 5 Horry County properties on FEMA's list of repeat flood claims are outside it. The worst, which FEMA calls ${h.ext(SRL, "severe repetitive loss")}, pay at least 15 percent more for federal flood insurance.`) +
      h.p(`A seller who took federal flood aid that required flood insurance must tell you in writing, in the sale papers, that you must keep flood insurance on the house. ${h.ext(USC5154A, "Federal law")} requires it.`) +
      h.h3('<span id="empty-lots">Why does a street have empty lots between houses?</span>') +
      h.p(`Sometimes because of a flood buyout. The ${h.ext(SCOR, "state's voluntary buyout program")} has bought dozens of homes in the Socastee area that flooded again and again. It tears the houses down, and the land stays open green space.`) +
      h.p("When a house you like sits beside empty lots, we ask the county's floodplain staff about the street's flood history.") +
      h.cta("Empty lots beside a house you like?", "Send us the address, and we ask the county's floodplain staff about floods on that street.", "Ask us to check the street", CONTACT, bg) },

    { h2: "What if the seller did not disclose flooding?", toc: "If the seller hid it", id: "if-the-seller-hid-it", html: (bg) =>
      h.p(`A seller who knowingly gives false, incomplete or misleading answers on the form ${h.ext(T27_50, "is liable")} for the buyer's actual damages from them, and court costs. The court may also award reasonable attorney fees to whichever side wins.`) +
      h.p(`Your own ${h.ext(T40_57, "buyer's agent")}, under a written agreement, must tell you every serious problem the agent knows of. A fact that significantly lowers the value or the soundness of the house counts.`) +
      WHO +
      h.p(`The ${h.ext(LLR, "Real Estate Commission")} takes complaints against licensed agents, not private sellers, and it does not handle contract disputes. Claims like these have ${h.ext(T15_3, "deadlines in South Carolina law")}. Many are three years, and for fraud the time starts when the fraud is discovered.`) +
      h.p("If you already bought a house that flooded and the seller hid it, talk to a South Carolina real estate attorney. We work with several attorneys here and can introduce you. Chapter3 Realty does not give legal advice.") +
      h.h3("How a flood check can change an offer") +
      STORY(bg) },
  ],
  faqTitle: "Flood history questions",
  faq: [
    { q: "Can I get a CLUE report on a house I want to buy?", a: "No. Only the owner, an insurer or a lender can order the CLUE report on a house, and it covers only recent years. We ask the seller to order it." },
    { q: "Can I see FEMA flood claims by address?", a: "Not until you own the house. Once you do, you can ask FEMA for its claims, including those from before you owned it." },
    { q: "What is a severe repetitive loss property?", a: "Severe repetitive loss is FEMA's label for a house that has flooded again and again. FEMA uses it for four or more paid flood claims over $5,000 each, or for building payments that add up to more than the house is worth, with two of them within 10 years of each other. The label stays with the address when the house sells." },
    { q: "Will the lender tell me if the house is in a flood zone?", a: "Yes, if the house is in FEMA's high-risk zone and the loan is from a bank or other federally regulated lender. The lender must make sure you are told in writing a reasonable time before you sign. The notice is about the zone, not about past floods." },
  ],
  sources: [
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC disclosure form", href: FORM },
    { name: "FEMA NFIP data FAQ", href: FEMA_FAQ },
    { name: "OpenFEMA NFIP claims", href: NFIP_DATA },
    { name: "Horry County flood mapping", href: PSDS },
    { name: "Horry County Build Responsibly", href: HC_BUILD },
    { name: "NWS Hurricane Florence", href: NWS },
    { name: "SC Office of Resilience", href: SCOR },
    { name: "SC Code 40-57", href: T40_57 },
    { name: "Rosen Hagood: SC due diligence contract", href: DD_LAW },
    { name: "Tennessee Insurance: CLUE reports", href: TN_CLUE },
  ],
  sourcesNote: "Claim shares: Chapter3's count of FEMA claims for Horry County. Map and house counts: Chapter3, from Horry County GIS. Homes for sale counted in aggregate from CCMLS listings. Not legal advice.",
  afterSources: () => (ph ? ph.credits() : ""),
  pageImages: () => (ph ? ph.pageImages() : undefined),
  bottomCta: { h2: "Have us check a house's flood history before you\u00a0offer", p: "We put it on FEMA's map and the county's Florence map, check the permits and the county's flood records, and ask the seller for the two claim reports a buyer cannot get. It is free, with no obligation.", label: "Send us the address", href: CONTACT },
  keywords: "has this house flooded before, how to find out if a house has flooded, flood history by address, does seller have to disclose flooding South Carolina, CLUE report flood, FEMA flood claim history, Zone X flooding Horry County, Horry County Supplemental Flood Zone, Florence flooding Conway, severe repetitive loss, flood buyout Socastee",
  about: "Checking a house's flood history before buying in Myrtle Beach and Horry County, South Carolina",
});
