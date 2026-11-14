/* /sell/seller-disclosure/ - what a seller must disclose in South Carolina: the state's Residential Property Condition
 * Disclosure Statement (SC Code 27-50-10 and on), who must give it and the 15 exempt kinds of sale, when it is due,
 * what Yes, No and No Representation mean, every question on the form as a checklist, repairs already made, the flood
 * questions and the storms they reach back over, the beachfront statement a contract needs (SC Code 48-39-330), lead
 * paint for homes built before 1978, what you do not have to disclose, and what happens if something is left out.
 *
 * Batch 2026-11-n, Lane N (a new page). Version 1, 2026-11-08. Design: the approved pilots of batch 2026-11-a
 * (sell-fsbo, submarkets-pawleys-island, hoa-liens-and-foreclosure, invest-condos): a two-line headline with the italic
 * sub line at about half the H1 size, the answer first, one card style used once (the exempt sales, the one place the
 * reader finds their own case), plain lists under thin rules elsewhere, one block width of 720 px, and on wide screens
 * the checklist's part index and the photo beside what they serve. DESIGN.md in the batch folder says why.
 * Facts: Blog-Brain batches/2026-11-n/sell-seller-disclosure/facts.md, VERIFIED rows, and CORRECTED rows only in the
 * verifier's wording (VERIFY.md). Struck wording: sell-seller-disclosure-struck.json (no "each signs", no "No exemption
 * covers", no bare "nine parts", no "about 1 in 3" for Florence, no "For those owners", no "so their contracts need",
 * no "to about 1 in 3 in Conway", no 90-day rentals without the Vacation Rental Act, no discovery rule for fraud, no
 * "material adverse fact" without the health risk).
 * Sources (primary): SC Code 27-50, 48-39, 15-3-530, 40-57-30(25) (scstatehouse.gov statmast.php); the Real Estate
 * Commission's form and addendum, updated June 2025; 2018 Act No. 245; EPA lead disclosure rule; FEMA NFIP data FAQ;
 * OpenFEMA NFIP claims; Utah and Tennessee CLUE pages; SC DES beachfront jurisdictional lines; Horry County parcels;
 * Census ACS B25034.
 * Data, never typed (website working copy, data/2026-11-n/sell-seller-disclosure/):
 *   form-checklist.json      the form's parts, its 28 numbered questions, the describe lines and the addendum's 11,
 *                            each with a phrase the script found in the form's text (rows 10, 11, 20)
 *   ownership-findings.json  homes by last recorded sale against Matthew and Florence (row 14)
 *   seaward-findings.json    homes on lots that reach seaward of the setback line, by beach and kind (row 18)
 *   acs-findings.json        share of homes built before 1980, county and towns, ACS 2020-2024 5-year (row 22)
 *   photos.json              the one photo: oceanfront condo buildings north of Myrtle Beach, USGS 2011, public domain
 *   data/2026-10-d/buyers-undisclosed-flooding/claims-findings.json   FEMA paid claims (rows 13, 14)
 * Row 22: the county figure is the 5-year estimate (16 percent), the same vintage as the towns (the verifier's option),
 * so the page gives one value for the county.
 * Owner questions (OWNER-QUESTIONS.md): Q1 no story is used. Q2 and Q3 are open, so no offer promises a records
 * look-up beyond what approved pages already offer (a flood zone look-up, as on /submarkets/pawleys-island/; reading
 * a filled-in form, as on /sell/fsbo/), and no sentence says what our agents hand a seller at listing.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));

const SELF = "/sell/seller-disclosure/";
const DATA = path.join(__dirname, "..", "data", "2026-11-n", "sell-seller-disclosure");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const FORMJ = read("form-checklist.json");
const OWN = read("ownership-findings.json").all_county.all;
const SEA = read("seaward-findings.json");
const ACS = read("acs-findings.json");
const CLAIMS = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "data", "2026-10-d", "buyers-undisclosed-flooding", "claims-findings.json"), "utf8"));
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const CTA = "/contact/";

/* ---- Rows 10, 11, 20: the form's counts. ---- */
const C = FORMJ.counts;
if (C.parts !== 9 || C.numbered !== 28 || C.addendum !== 11 || C.own_years_only.join() !== "5,7,19,20,25,26,27,28") throw new Error("rows 10, 11: the form's counts moved");
const NUMBERED = FORMJ.parts.flatMap((p) => p.items).filter((i) => typeof i.n === "number");
if (NUMBERED.length !== 28 || FORMJ.addendum.length !== 11) throw new Error("rows 10, 20: the checklist does not hold 28 and 11");

/* ---- Rows 13, 14: FEMA claims (UF's data) and last recorded sales. ---- */
const AP = CLAIMS.all_paid;
if (AP.paid !== 8815 || AP.outside !== 2047 || Math.round(AP.pct_outside_of_known) !== 23) throw new Error("row 13 moved");
const EV = CLAIMS.events || {};
const PAID_M = (EV["Hurricane Matthew"] || {}).paid, PAID_F = (EV["Hurricane Florence"] || {}).paid;
if (PAID_M !== 1033 || PAID_F !== 895) throw new Error("row 14: storm claims moved");
if (OWN.with_sale_date !== 219225 || OWN.owned_before_matthew !== 63941 || OWN.owned_before_florence !== 80497) throw new Error("row 14 moved");
const B_M = OWN.owned_before_matthew, B_MF = OWN.owned_before_florence - OWN.owned_before_matthew, A_F = OWN.with_sale_date - OWN.owned_before_florence;
const pct = (v) => 100 * v / OWN.with_sale_date;
if (Math.round(pct(B_M)) !== 29 || Math.round(pct(OWN.owned_before_florence)) !== 37) throw new Error("row 14: the shares moved");

/* ---- Row 18: homes on lots seaward of the setback line. ---- */
if (SEA.residential_with_building !== 10740 || SEA.by_kind.condo !== 9609 || SEA.by_kind.house !== 515) throw new Error("row 18 moved");
const BEACH = Object.entries(SEA.by_beach).sort((a, b) => b[1] - a[1]);
if (BEACH.reduce((s, [, v]) => s + v, 0) !== SEA.residential_with_building || BEACH[0][0] !== "North Myrtle Beach") throw new Error("row 18: the beaches do not add up");

/* ---- Row 22: homes built before 1980, towns with 4,000 or more homes (5-year), and the county (5-year). ---- */
const H5 = ACS.horry_5yr;
if (H5.pct_before_1980 !== 16.0) throw new Error("row 22: the county figure moved");
const TOWNS = ACS.places.filter((p) => p.units >= 4000).sort((a, b) => b.pct_before_1980 - a.pct_before_1980);
const tname = (n) => n.replace(/ (city|town|CDP)$/, "");
const LORIS = ACS.places.find((p) => p.name === "Loris city");
if (tname(TOWNS[0].name) !== "Surfside Beach" || tname(TOWNS[1].name) !== "Conway" || tname(TOWNS[TOWNS.length - 1].name) !== "Carolina Forest" || !(LORIS.pct_before_1980 > 50) || LORIS.units >= 4000) throw new Error("row 22: the towns moved");
const pctOf = (name) => Math.round(ACS.places.find((p) => tname(p.name) === name).pct_before_1980);
if (pctOf("Myrtle Beach") !== 28 || pctOf("North Myrtle Beach") !== 19 || pctOf("Carolina Forest") !== 1) throw new Error("row 22: the town shares moved");

/* ---- Links ---- */
const T27_50 = "https://www.scstatehouse.gov/code/statmast.php?title=27&amp;chapter=50";
const T48_39 = "https://www.scstatehouse.gov/code/statmast.php?title=48&amp;chapter=39";
const T15_3 = "https://www.scstatehouse.gov/code/statmast.php?title=15&amp;chapter=3";
const T40_57 = "https://www.scstatehouse.gov/code/statmast.php?title=40&amp;chapter=57";
const FORM = "https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf";
const EPA = "https://www.epa.gov/lead/real-estate-disclosures-about-potential-lead-hazards";
const FEMA_FAQ = "https://agents.floodsmart.gov/flood-maps-and-data/faqs-about-nfip-data";
const OPENFEMA = "https://www.fema.gov/openfema-data-page/fima-nfip-redacted-claims-v2";
const UT_CLUE = "https://insurance.utah.gov/consumers/clue/";
const TN_CLUE = "https://www.tn.gov/commerce/insurance/consumer-resources/clue.html";
const PARCELS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24";
const CENSUS = "https://data.census.gov/table/ACSDT5Y2024.B25034?g=050XX00US45051";
const DHS_FOIA = "https://www.dhs.gov/foia";
const CFR_521 = "https://www.ecfr.gov/current/title-6/chapter-I/part-5/subpart-B/section-5.21";

/* ---- The glance row under the H1 (rows 5, 10, 11). ---- */
const GLANCE = PK.glance([
  { icon: "cards", label: `${C.numbered} questions`, text: "on the state form, each Yes, No or No Representation" },
  { icon: "calendar", label: `${C.own_years_only.length} items`, text: "ask about the years you owned the home" },
  { icon: "key", label: "15 kinds of sale", text: "need no form" },
]);

/* ---- Rows 5, 6: the exempt sales, as cards (the one chooser on the page). ---- */
const card = (k, title, text) => `<li><b>${title}</b>${text}</li>`; /* k: the card's short group name, kept in the spec only */
const EXEMPT = `<ul class="sd-cards" aria-label="Sales that need no disclosure form in South Carolina">`
  + card("Family", "Only to close family", "A sale only to your spouse, or only to your children, grandchildren, parents or grandparents. If your child's spouse is also a buyer, the sale needs the form.")
  + card("Co-owners", "Only between co-owners", "One owner sells to the other owners, and no one else is a buyer.")
  + card("Estates and courts", "An executor, trustee or court", `A sale by an executor or trustee settling an estate or a trust, or a sale under a court order. Our page on ${h.a("/sell/inherited-house/", "selling an inherited house")} covers the rest.`)
  + card("Foreclosure", "The foreclosure, and the lender's sale after it", "The foreclosure sale itself, and a sale by a lender that took the home at a foreclosure sale.")
  + card("Divorce", "A transfer between spouses", `A transfer between spouses under a divorce decree or a court's property order. A sale to a buyer outside the marriage needs the form, unless it is another exempt kind. See ${h.a("/sell/divorce/", "selling in a divorce")}.`)
  + card("New homes", "The first sale of a new home", `A home no one has ever lived in, sold for the first time. Our ${h.a("/buyers/new-construction/", "new construction page")} covers buying one.`)
  + card("Taxes", "A tax sale", "A transfer because an owner did not pay federal, state or local taxes.")
  + card("Auctions", "A public auction", "A home sold at a public auction.")
  + card("Timeshares", "A timeshare", "A vacation time share, or a share in a vacation home owned by many people.")
  + card("By agreement", "Both sides agree in writing", "Buyer and seller both agree in writing not to complete the form. Neither side has to agree.")
  + `</ul>`;

/* ---- Rows 3, 9: when, as three plain steps. ---- */
const WHEN = `<ol class="sd-when" aria-label="When the disclosure form is due">`
  + `<li><span class="k">When you list</span><b>Fill it in and sign it</b>Answer from what you know and the records you have.</li>`
  + `<li><span class="k">Before the contract</span><b>The buyer gets it and signs for it</b>The buyer's signature says they received it.</li>`
  + `<li><span class="k">Until closing</span><b>Keep it true</b>If the roof starts to leak after you hand it over, correct the form or make the repair before closing.</li>`
  + `</ol>`;

/* ---- Rows 7, 8: the three answers. ---- */
const ANSWERS = `<dl class="sd-ans" aria-label="What each answer on the form means">`
  + `<div><dt>Yes</dt><dd>You know of a problem. Explain it on the form, or attach a report from an engineer, a contractor, a pest control company or another expert.</dd></div>`
  + `<div><dt>No</dt><dd>You have no actual knowledge of a problem.</dd></div>`
  + `<div><dt>No Representation</dt><dd>You do not know enough to answer Yes or No. It is not a way to skip a question. It does not protect you if you know of the problem, or learn of it later.</dd></div>`
  + `</dl>`;

/* ---- Rows 10, 11, 20: the checklist, built from form-checklist.json. ---- */
const PART_NAMES = { HOA: "Homeowners association (HOA)" };
const OWN_SET = new Set(C.own_years_only);
/* Our wording where the JSON's plain label has a list in brackets (the site's audit: no parenthetical asides). */
const PLAIN = { "I-C": "What the water pipes are made of, such as PEX, PVC, copper, polybutylene or steel", 27: "Federal flood aid from FEMA, the SBA or HUD that you received while you owned it", IX: "Whether an HOA or condo association governs the home. If Yes, fill in the addendum",
  "IV-B": "Any termite treatment, or a termite bond, which is a contract with a pest control company, and who provides it",
  17: "Shared driveways, private roads, a fence or building over the line, or easements, which give someone else a right to use part of your land",
  28: "A charge for beach renourishment, which is sand added back to the beach, while you owned it" };
const PLAIN_ADD = { 3: "Special assessments, which are charges the association adds on top of the regular dues" };
const item = (no, text, own, describe) => `<li><label><input type="checkbox"><span class="no${own ? " own" : ""}${describe ? " ds" : ""}" aria-label="${describe ? "Describe line" : "Question"} ${no}${own ? ", asks about the years you owned the home" : ""}">${no}</span><span class="t">${text}</span></label></li>`;
const ROMAN = FORMJ.parts.map((p) => p.part);
const CHECKLIST = `<div class="sd-cl-wrap"><div class="sd-cl" id="sd-checklist">`
  + `<p class="sd-cl-head"><span>The South Carolina disclosure form, every question</span><button type="button" class="sd-print" onclick="sdPrint()">Print this checklist</button></p>`
  + `<p class="sd-legend"><span class="no own" aria-hidden="true">5</span>The brown numbers mark the ${C.own_years_only.length} items that ask only about the years you owned the home. Letters mark lines where you describe something.</p>`
  + FORMJ.parts.map((p) => `<div class="sd-part" id="part-${p.part.toLowerCase()}" role="group" aria-label="Part ${p.part}"><h3 data-toc="${p.part} ${PART_NAMES[p.name] || p.name}"><span class="pn">Part ${p.part}</span> ${PART_NAMES[p.name] || p.name}</h3><ul>`
    + p.items.map((i) => item(typeof i.n === "number" ? i.n : String(i.n).replace(/^[IVX]+-?/, "") || p.part, PLAIN[i.n] || i.plain, OWN_SET.has(i.n), i.describe)).join("") + `</ul></div>`).join("")
  + `<div class="sd-part" id="part-addendum" role="group" aria-label="The HOA addendum"><h3 data-toc="+ The HOA addendum"><span class="pn">Addendum</span> For a home in an HOA or condo association</h3><ul>`
  + FORMJ.addendum.map((a) => item(a.n, PLAIN_ADD[a.n] || a.plain, false, false)).join("")
  + `<li class="sd-note">The addendum also asks the dues, what period they cover, and how to reach the association.</li></ul></div>`
  + `<p class="sd-src">Our short wording of the state form, updated June 2025. ${h.ext(FORM, "Download the form")} for the full wording of each question.</p></div>`
  + `<nav class="sd-idx" aria-label="Parts of the form"><p>Parts of the form</p><ol>`
  + FORMJ.parts.map((p) => `<li><a href="#part-${p.part.toLowerCase()}"><span>${p.part}</span> ${PART_NAMES[p.name] || p.name}</a></li>`).join("")
  + `<li><a href="#part-addendum"><span>+</span> The HOA addendum</a></li></ol></nav></div>`
  + `<script>function sdPrint(){document.body.classList.add('sd-printing');window.print();setTimeout(function(){document.body.classList.remove('sd-printing')},500)}</script>`;
if (ROMAN.join() !== "I,II,III,IV,V,VI,VII,VIII,IX") throw new Error("row 10: the parts moved");

void B_MF; void A_F;

/* ---- Chart (row 18): homes on lots that reach seaward of the setback line, by beach. ---- */
const SEA_CHART = G.bars(BEACH.map(([name, v]) => ({ name, value: v, valueText: n0(v) })), {
  caption: "Homes on lots that reach past the beach setback line, by beach", nameLabel: "Beach", valueLabel: "homes", compact: true,
  note: "Each condo unit counts once, so one oceanfront building counts many times." });

/* ---- Chart (row 22): homes built before 1980, by town. ---- */
const LEAD_CHART = G.bars(TOWNS.map((p) => ({ name: tname(p.name), value: p.pct_before_1980, valueText: `${Math.round(p.pct_before_1980)}%` }))
  .concat([{ name: "Horry County", value: H5.pct_before_1980, valueText: `${Math.round(H5.pct_before_1980)}%`, reference: true }]),
  { caption: "Share of homes built before 1980, by town", nameLabel: "Town", valueLabel: "built before 1980", compact: true, max: 40,
    note: "Census estimates for 2020 to 2024, for homes of every kind, lived in or not. Towns with fewer than 4,000 homes are left off, because the estimates for them are rough. Garden City and Murrells Inlet reach into Georgetown County." });

/* ---- The steps (rows 5, 9, 15, 16, 17, 21). ---- */
const step = (n, title, text) => `<li><span class="n" aria-hidden="true">${n}</span><span class="c"><b>${title}</b>${text}</span></li>`;
const STEPS = `<ol class="sd-steps" aria-label="How to fill out the South Carolina seller disclosure, in order">`
  + step(1, "Check whether your sale needs it", "Compare your sale with the 15 exempt kinds above.")
  + step(2, "Gather your records", `The roof's year and repair bills, permits for any work, your termite contract, the HOA dues and contact, and any lease or rental booking. For the parcel number and the deed, use our ${h.a("/buyers/property-records/", "Horry County property search by address")}.`)
  + step(3, "Get your flood and insurance history", `Ask FEMA for your home's flood claim record, and order its CLUE report. The ${h.a("#flooding", "flooding section")} says how to ask for each.`)
  + step(4, "Answer every question", "Yes means you explain it or attach a report.")
  + step(5, "Built before 1978? Add the lead papers", "The federal lead form and the pamphlet.")
  + step(6, "On the beach? Add the setback statement", "Your agent raises it with the closing attorney before the contract.")
  + step(7, "Give it to the buyer before the contract", "Keep a copy the buyer signed, and keep it true until closing.")
  + `</ol>`;

/* ---- The photo (VERIFY.md, Photos: 2011_0824_180321d usable; the caption never says a lot is past the line). ---- */
const PHOTOS = read("photos.json").photos;
const ph = PK.create({ h, photos: PHOTOS, mapDir: path.join(__dirname, "..", "chapter3realty", "images", "maps"), mapSrc: "/images/maps" }).photoSet({ aerialWidth: "720px" });
const PHOTO = ph.aerial("oceanfront-condos-north-of-myrtle-beach", "Oceanfront condo buildings north of Myrtle Beach in 2011. Most of the homes we counted on lots past the setback line are condo units like these.");
const GENERIC_CREDIT = /<div role="listitem">Chapter3 Realty resized these photos and cropped some of them\.[^<]*<\/div>/;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys. This page states the law and the state's form; it is not legal advice. For advice on your own sale, talk to a South Carolina attorney.</p>`;
const AFTER = () => { const c = ph.credits(); return LEGAL + c.replace(GENERIC_CREDIT, ""); };

/* ---- The page's own styles (the pilots' treatment, prefix sd-). ---- */
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
  /* the exempt sales: cards, the one chooser */
  + `${S} .sd-cards{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:.75rem;max-width:720px}`
  + `@media (min-width:700px){${S} .sd-cards{grid-template-columns:repeat(2,minmax(0,1fr))}}`
  + `${S} .sd-cards li{margin:0;padding:.95rem 1.1rem;border-radius:18px;${CARD};color:var(--muted);line-height:1.55;font-size:1rem}`
  + `${S} .sd-cards .k,${S} .sd-when .k{display:block;font-family:var(--sans);font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700;margin-bottom:.25rem}`
  + `${S} .sd-cards b,${S} .sd-when b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.3rem}`
  /* when: three plain steps under a thin rule */
  + `${S} .sd-when{list-style:none;counter-reset:w;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:1rem 2rem;max-width:720px}`
  + `@media (min-width:700px){${S} .sd-when{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .sd-when li{margin:0;padding:.85rem 0 0;border-top:2px solid var(--navy);color:var(--muted);line-height:1.55}`
  /* the three answers: rows under thin rules */
  + `${S} .sd-ans{margin:1.1rem 0 1.4rem;padding:0;max-width:720px}`
  + `${S} .sd-ans>div{display:grid;grid-template-columns:11rem minmax(0,1fr);gap:.3rem 1.2rem;padding:.8rem 0;border-top:1px solid ${RULE}}${S} .sd-ans>div:last-child{border-bottom:1px solid ${RULE}}`
  + `${S} .sd-ans dt{color:var(--navy);font-family:var(--sans);font-weight:700;font-size:1.08rem}${S} .sd-ans dd{margin:0;color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `@media (max-width:599px){${S} .sd-ans>div{grid-template-columns:1fr}}`
  /* the checklist: one card, plain rows, a part index beside it on a wide screen */
  + `${S} .sd-cl{max-width:720px;margin:1.3rem 0 1.5rem;padding:.6rem 1.1rem 1rem;border-radius:18px;box-sizing:border-box;${CARD}}`
  + `${S} .sd-cl-head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:.6rem;margin:.4rem 0 .4rem;color:var(--navy);font-family:var(--sans);font-weight:600;font-size:1.0625rem}`
  + `${S} .sd-print{font-family:var(--sans);font-size:.95rem;font-weight:600;color:var(--navy);background:rgba(255,255,255,.7);border:1px solid rgba(28,32,40,.3);border-radius:999px;padding:.5rem 1rem;min-height:44px;cursor:pointer}`
  + `${S} .sd-legend{display:flex;gap:.6rem;align-items:flex-start;margin:0 0 .4rem;color:var(--muted);font-size:.98rem;line-height:1.5}`
  + `${S} .sd-part h3{display:block;margin:1.1rem 0 .2rem;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;scroll-margin-top:90px}`
  + `${S} .sd-part .pn{display:block;margin-bottom:.1rem;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700}`
  + `${S} .sd-part ul{list-style:none;margin:0;padding:0}`
  + `${S} .sd-part li{margin:0;border-top:1px solid rgba(28,32,40,.1)}`
  + `${S} .sd-part label{display:grid;grid-template-columns:22px 2.4rem minmax(0,1fr);gap:.65rem;align-items:start;padding:.55rem 0;cursor:pointer;color:var(--ink,#1c2028);line-height:1.5;font-size:1.0625rem}`
  + `${S} .sd-part input{width:20px;height:20px;margin:.15rem 0 0;accent-color:${INK}}`
  + `${S} .sd-cl .no{display:inline-flex;align-items:center;justify-content:center;min-width:2.2rem;height:1.6rem;padding:0 .3rem;box-sizing:border-box;border-radius:6px;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.85rem}`
  + `${S} .sd-cl .no.own{background:${INK}}${S} .sd-cl .no.ds{background:none;color:var(--navy);border:1px solid rgba(28,32,40,.35)}`
  + `${S} .sd-legend .no{flex:none;margin-top:.05rem}`
  + `${S} .sd-part li.sd-note{padding:.55rem 0 0;color:var(--muted);font-size:.98rem;line-height:1.5}`
  + `${S} .sd-src{margin:1rem 0 0;color:var(--muted);font-size:.92rem;line-height:1.5}`
  + `${S} .sd-idx{display:none}`
  + `@media (min-width:1100px){${S} .sd-cl-wrap{display:grid;grid-template-columns:720px 230px;column-gap:2.5rem;align-items:start;max-width:990px}${S} .sd-cl{margin:1.3rem 0 1.5rem}`
  + `${S} .sd-idx{display:block;position:sticky;top:96px;margin-top:1.3rem;font-family:var(--sans)}`
  + `${S} .sd-idx p{margin:0 0 .5rem;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase;color:${INK};font-weight:700}`
  + `${S} .sd-idx ol{list-style:none;margin:0;padding:0}${S} .sd-idx li{margin:0;border-top:1px solid ${RULE}}`
  + `${S} .sd-idx a{display:flex;gap:.55rem;padding:.42rem 0;color:var(--navy);font-size:.95rem;line-height:1.35;text-decoration:none}${S} .sd-idx a:hover{text-decoration:underline}`
  + `${S} .sd-idx a span{flex:none;width:2.2rem;color:var(--muted);font-weight:700}}`
  /* print only the checklist when its button is used */
  + `@media print{body.sd-printing *{visibility:hidden!important}body.sd-printing #sd-checklist,body.sd-printing #sd-checklist *{visibility:visible!important}body.sd-printing #sd-checklist{position:absolute;left:0;top:0;width:100%;max-width:none;box-shadow:none;background:#fff}body.sd-printing .sd-print{display:none}}`
  /* plain lists under thin rules */
  + `${S} .sd-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0;display:grid;gap:0;max-width:720px}`
  + `${S} .sd-plain li{margin:0;padding:.8rem 0;border-top:1px solid ${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}${S} .sd-plain li:last-child{border-bottom:1px solid ${RULE}}`
  + `${S} .sd-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.25rem}`
  /* the steps: numbers on a line, no card around each step */
  + `${S} .sd-steps{list-style:none;margin:1.3rem 0 1.5rem;padding:0;max-width:720px;position:relative}`
  + `${S} .sd-steps::before{content:"";position:absolute;left:1.05rem;top:.6rem;bottom:.6rem;width:2px;background:rgba(28,32,40,.14)}`
  + `${S} .sd-steps>li{position:relative;margin:0 0 1.2rem;padding:0 0 0 3.3rem}${S} .sd-steps>li:last-child{margin-bottom:0}`
  + `${S} .sd-steps .n{position:absolute;left:0;top:.05rem;display:inline-flex;align-items:center;justify-content:center;width:2.15rem;height:2.15rem;border-radius:50%;background:var(--navy);color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;box-shadow:0 0 0 4px #f8f4ee}`
  + `${S} .sd-steps .c{display:block;color:var(--muted);line-height:1.55}${S} .sd-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* A wide screen: the photo beside the paragraphs that explain the beach line. */
  + `@media (min-width:1100px){${S} .sd-side{display:grid;grid-template-columns:minmax(0,1fr) 380px;grid-template-rows:auto auto auto 1fr;column-gap:2.5rem;max-width:1000px;align-items:start}`
  + `${S} .sd-side>*{grid-column:1}${S} .sd-side>.c3-aerial{grid-column:2;grid-row:1/5;margin:.3rem 0 1.2rem!important;max-width:none!important}${S} .sd-side>.c3-aerial figure{margin:0!important}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{background:none!important;border:0!important;box-shadow:none!important;padding:0!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;max-width:720px}`
  + `${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.92rem}`
  /* offer boxes: a larger button */
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} .sd-cards b,${S} .sd-steps b,${S} a.btn{text-wrap:balance}`
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  /* a phone: the three hero tiles as short rows, not squeezed columns */
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border-top:1px solid ${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:1px solid ${RULE}!important}}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"]>ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.6rem}}`
  /* Work-arounds copied from the pilots: the feed's search row at 320 px, the header phone at 1000 to 1100 px,
     and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  /* the slim offer under the short answer: balance its two lines, so no word sits alone */
  + "main#main section[style^=\"background:var(--navy)\"]:not(:has(>.wrap>h2))>.wrap>p{text-wrap:balance}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

/* The FAQ repeats only questions the page answers, said short. */
const FAQ = [
  { q: "Is a seller disclosure required for new construction in South Carolina?", a: "Not for the first sale of a home no one has ever lived in. Every later sale of that home needs the form, unless it is another of the 15 exempt kinds." },
  { q: "Can a buyer and seller agree to skip the disclosure form?", a: "Yes. Both must agree in writing not to complete it, and neither side has to agree." },
  { q: "How long is a seller's disclosure good for?", a: "Until closing. If anything changes before then, the seller corrects the form or makes the repair." },
  { q: "Does an investor who never lived in the house have to fill it in?", a: "Yes, unless the sale is one of the 15 exempt kinds. The law lists no exemption for an investor, a landlord or a company." },
  { q: "Do you have to disclose a death in a house in South Carolina?", a: "No. If a buyer asks you directly, you may not lie about it." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Sell", url: "/sell/" },
  title: "South Carolina Seller Disclosure: All 28 Questions",
  description: "What South Carolina sellers must disclose: all 28 questions on the state form, who is exempt, flooding, the beachfront rule and lead paint.",
  ogTitle: "South Carolina seller disclosure: all 28 questions on the state form, who is exempt, and what happens if something is left out",
  crumb: "Seller Disclosure",
  eyebrow: "Selling a home",
  h1: "South Carolina seller disclosure: all 28 questions",
  h1em: "What the state form asks, who is exempt, and the extra papers some homes need.",
  /* Required by mkpage; hidden on the page (the pilots' style), since the short answer says it. */
  sub: "Who must fill in the state form, what its 28 numbered questions mean, and what happens if a seller leaves something out.",
  heroMedia: CSS + GLANCE,
  heroCta: { title: "Selling soon? Start with your flood zone.", label: "Have us look up your flood zone", href: CTA },
  author: "devin",
  shortAnswer: [
    "A South Carolina seller must give the buyer the state's disclosure form, filled in and signed, before both sign the contract. The form asks what you know about the home, and a seller who knowingly leaves a problem off can owe the buyer their losses.",
    `Fifteen kinds of sale need no form. Two things touch many Grand Strand sales. One is the flood questions about the years you owned the home. The other is a beachfront statement for homes on lots past the state's setback line, about 10,700 in Horry County.`,
  ],
  sections: [
    { h2: "Who has to fill out a seller disclosure in South Carolina?", toc: "Who must fill it in", id: "who", html: () =>
      ph.css() +
      h.p(`The owner of a home with one to four units who sells it. The ${h.ext(T27_50, "state law")} applies to a house, a condo, a townhouse or a building of up to four homes. It applies to a sale, a trade, a land contract, where the buyer pays you over time, and a lease with an option to buy.`) +
      h.p("The law's duty falls on each owner named in the contract. The form has signature lines for the owners.") +
      h.p("The form covers the home itself, not shared areas you have no direct responsibility for, such as a condo's common areas. The condo addendum still asks about problems you know of in the shared areas.") +
      h.p(`The law lists no exemption for an investor, a landlord, a second-home owner or a company. The "never lived in" exemption covers only the first sale of a home no one has ever lived in. A rental you never lived in still needs the form, unless the sale is one of the 15 exempt kinds. Our page on ${h.a("/sell/rental-property/", "selling a rental property")} covers the rest of that sale.`) },

    { h2: "Which sales do not need the disclosure form?", toc: "Sales that need no form", id: "exempt", html: (bg) =>
      h.p("South Carolina lists 15 kinds of sale that need no form. Find yours:") +
      EXEMPT +
      h.p("The other three are a sale to or from the federal government, a sale to the State, and a transfer to a residential trust. If you are not sure your sale fits one of the 15, the closing attorney can say.") +
      h.p(`Selling "as is", which means without repairs, still needs the form, unless the sale is one of the 15 kinds. Our pages on ${h.a("/sell/repairs-before-selling/", "repairs before selling")} and ${h.a("/sell/cash-offer/", "cash offers")} cover those choices.`) +
      h.cta("Not sure your sale needs the form?", "Tell us who you are selling to and how. An agent checks your sale against the state's list and marks anything the closing attorney should decide.", "Ask us about your sale", CTA, bg) },

    { h2: "When do you give the buyer the seller disclosure?", toc: "When it is due", id: "when", html: () =>
      h.p("Before the buyer signs the contract, unless your contract names another time.") +
      WHEN +
      h.p("A missing form does not cancel the contract or stop the closing, and it does not put a defect on the title. A seller who knowingly skips it still breaks a duty under the same law.") },

    { h2: "What do Yes, No and No Representation mean on the form?", toc: "How to answer", id: "answers", html: (bg) =>
      h.p("Each answer is about what you know. The form asks about problems, which it says include present defects, malfunctions, damage, conditions or characteristics.") +
      ANSWERS +
      h.p("For questions 15 to 28, the form asks what you know or were told in a notice, such as a letter from the county. The law does not define \"actual knowledge\" beyond the form's words. A question about what you should have known goes to a South Carolina attorney.") +
      h.p("The form says that if you attach an expert's report, you are not liable for its mistakes. The exception is if you were grossly negligent, meaning careless in a serious way, in getting it or passing it on.") +
      h.cta("Selling without an agent?", "The form is yours to fill in either way. Our coaching for owners includes reading it before a buyer sees it, for a flat fee that is credited back if you list with us later.", "Ask us about coaching for owners", "/sell/fsbo/#lead-form", bg) },

    { h2: "What does the South Carolina disclosure form ask?", toc: "Every question on the form", id: "checklist", html: (bg) =>
      h.p(`The ${h.ext(FORM, "state form")} has nine parts of questions, one for each subject the law names, and a last part for explaining your Yes answers. It asks ${C.numbered} numbered questions, each answered Yes, No or No Representation.`) +
      h.p("It also has lines where you describe things such as where the water comes from, the roof's age, termite treatment, leases and contamination. A home in a homeowners association (HOA), a property owners association or a condo association also needs the addendum.") +
      CHECKLIST +
      h.p(`Our ${h.a("/hoa/documents/", "HOA documents page")} lists the association papers a buyer asks for. If you are selling without an agent, our ${h.a("/sell/fsbo/", "for-sale-by-owner page")} covers the rest of that sale.`) +
      h.h3("Do you have to disclose a problem you already fixed?") +
      h.p("Yes, for the roof, the structure and flood damage. The form asks you to describe roof leaks and repairs, and structural repairs, made while you owned the home, with dates. It also asks for flood claims, and for flood repairs you paid for without a claim.") +
      h.h3("Leases and vacation rentals") +
      h.p(`Leases and vacation rentals in place at closing go on the form. Under the state's Vacation Rental Act, the seller lists every future rental period in writing before the contract. The buyer takes the home subject to rentals under that act that begin within 90 days after the deed is recorded.`) +
      h.p(`That act does not cover a condo rented through a hotel-style front desk. The closing attorney can say which rules apply to yours. Our pages on ${h.a("/sell/sell-my-condo/", "selling a condo")} and ${h.a("/sell/rental-property/", "selling a rental")} cover the bookings.`) +
      h.cta("Want your answers read before a buyer sees them?", "Send us the form once it is filled in. An agent reads it and marks any Yes that still needs an explanation or a report.", "Send us your form to read", CTA, bg) },

    { h2: "Do you have to disclose flooding when you sell a house in South Carolina?", toc: "Flooding", id: "flooding", html: () =>
      h.p("Yes. Every seller answers the form's flood questions, wherever the home is. Nearly 1 in 4 of the flood insurance claims FEMA has paid in Horry County were on buildings rated outside the high-risk flood zone.") +
      h.p("Question 20 asks whether the house flooded while you owned it. Questions 22 to 28 ask about erosion, flood zones and flood risk, and whether the home has flood insurance now.") +
      h.p("They also ask about flood claims, flood repairs without a claim, federal flood aid and charges for beach renourishment, which is sand added back to the beach. Five of these questions, 20 and 25 to 28, ask only about the years you owned the home.") +
      h.h3("The storms your answers can cover") +
      h.p(`We checked the last recorded sale of every home in Horry County. More than 1 in 3 (37 percent) last sold before Hurricane Florence in September 2018. About 3 in 10 (29 percent) last sold before Hurricane Matthew in October 2016.`) +
      h.p(`If you have owned your home since before those storms, the form's questions about "your ownership" cover them. FEMA paid more than ${n0(Math.floor(PAID_M / 100) * 100)} flood claims in the county for Matthew and nearly ${n0(Math.ceil(PAID_F / 100) * 100)} for Florence.`) +
      h.h3("Your home's flood claim record") +
      h.p(`${h.ext(FEMA_FAQ, "FEMA gives the owner")} the flood insurance claims and payments on the home, including those from before you owned it. A buyer cannot get them. To ask for yours:`) +
      `<ul class="sd-plain" aria-label="How to ask FEMA for your home's flood claim record">`
      + `<li><b>Where to send it</b>In writing to FEMA's records office, or online at ${h.ext(DHS_FOIA, "dhs.gov/foia")}. Mark it "Privacy Act Request".</li>`
      + `<li><b>What to put in it</b>Your full name, current address, date and place of birth and country of citizenship, and the home's address.</li>`
      + `<li><b>How to sign it</b>Before a notary, or with a statement that it is true under penalty of perjury, as the ${h.ext(CFR_521, "federal rule")} allows.</li></ul>` +
      h.p("Question 25 asks only about claims while you owned the home. Question 23 asks about any flood risk you know of, and the form says you must disclose what you know when you fill it in. A South Carolina attorney can say whether an older claim belongs in your answer to question 23.") +
      h.h3("The CLUE report") +
      h.p("The insurance industry's claims report on a home is called a CLUE report. Only the owner, an insurer or a lender can order it. It covers recent years of roof, wind and water claims.") +
      h.p(`You order it from LexisNexis Risk Solutions, online, by phone or by mail. Our page on ${h.a("/buyers/undisclosed-flooding/", "undisclosed flooding")} shows what a buyer can find out about a home's flood past. Flood insurance costs are on our ${h.a("/buyers/coastal-insurance/", "coastal insurance page")}.`) },

    { h2: "What extra disclosure does a beachfront home need?", toc: "Beachfront homes", id: "beachfront", html: (bg) =>
      `<div class="sd-side">` +
      h.p("The state draws a beachfront setback line a set distance inland from the top of the main sand dune. A home on a lot that reaches past that line, toward the ocean, needs a second statement in the sale contract.") +
      PHOTO +
      h.p(`${h.ext(T48_39, "State law")} says the contract must state that the property is or may be affected by the state's beach lines. Leaving the statement out does not make the contract invalid.`) +
      h.p(`We checked every home parcel in Horry County against the state's setback line map. About 10,700 homes are on lots that reach past that line. Nearly 9 in 10 are condo units, and about 500 are houses.`) + `</div>` +
      SEA_CHART +
      h.p("A survey settles where the line falls on a given lot.") +
      h.cta("Selling an oceanfront condo or house?", "Tell us the address. We raise the beachfront statement with the closing attorney at the start, so it is in the contract when you sign.", "Ask us about an oceanfront sale", CTA, bg) },

    { h2: "Do you need a lead paint disclosure in South Carolina?", toc: "Lead paint", id: "lead", html: (bg) =>
      h.p(`Yes, for most homes built before 1978. ${h.ext(EPA, "Federal law")} adds four steps to the sale:`) +
      `<ul class="sd-plain" aria-label="The federal lead rule for a home built before 1978">`
      + `<li><b>The pamphlet</b>Give the buyer the federal lead pamphlet.</li>`
      + `<li><b>What you know</b>Say what you know about lead paint in the home, and hand over any lead reports.</li>`
      + `<li><b>The warning</b>The contract must include a lead warning statement.</li>`
      + `<li><b>The test period</b>The buyer gets 10 days to test for lead, unless you both agree in writing to a different period or the buyer waives it.</li></ul>` +
      h.p("Keep the signed form for three years. Four cases are not covered. One is a unit with no bedroom, such as a studio, where no child under six lives.") +
      h.p("Another is housing for older people or people with disabilities where no child under six lives. The other two are a home a certified inspector found free of lead paint, and a foreclosure sale.") +
      h.p(`About 1 in 6 homes in Horry County (${Math.round(H5.pct_before_1980)} percent) was built before 1980. The share changes a lot by town: about 1 in 3 in Conway and Surfside Beach, and about 1 percent in Carolina Forest.`) +
      LEAD_CHART +
      h.p(`The Census counts homes by decade, so the chart shows homes built before 1980. The share built before 1978 is a little lower.`) +
      h.cta("Selling a house built in the 1970s or before?", "Send us the address. We confirm the year built in the county's records and add the lead form and pamphlet to your papers before you list.", "Have us check the year built", CTA, bg) },

    { h2: "What do you not have to disclose in South Carolina?", toc: "What you do not have to say", id: "not-required", html: () =>
      h.p(`${h.ext(T27_50, "South Carolina law")} names three things a seller does not have to disclose:`) +
      `<ul class="sd-plain" aria-label="What a South Carolina seller does not have to disclose">`
      + `<li><b>A death in the home</b>That someone died in the home, or how they died.</li>`
      + `<li><b>An illness</b>That someone who lived there had a disease that medical evidence shows is highly unlikely to spread through living in the home.</li>`
      + `<li><b>The sex offender registry</b>Public information from the state's sex offender registry.</li></ul>` +
      h.p("If a buyer asks you directly about any of them, you may not lie.") },

    { h2: "What happens if a seller does not disclose something?", toc: "If something is left out", id: "left-out", html: () =>
      h.p("A seller who knowingly leaves a problem off the form, or answers falsely, can owe the buyer their actual losses and court costs. A court may add the winner's attorney fees.") +
      h.p(`Under the disclosure law, the buyer keeps every other legal right. Many claims in South Carolina must be filed within three years (${h.ext(T15_3, "SC Code 15-3-530")}). When the clock starts depends on the claim; an attorney can say which applies.`) +
      h.h3("Your agent cannot hide what they know") +
      h.p(`The form says a real estate agent must disclose material adverse facts they know of about the home, whatever the owner answers. A ${h.ext(T40_57, "material adverse fact")} is a problem that significantly lowers the home's value or soundness, or is a significant health risk to the people who live there.`) +
      h.p("A listing agent must tell you in writing what the law requires of you. An agent is not liable for your false answers if they did not know or have reason to suspect they were false.") +
      h.p("The form is not a warranty, and it does not replace the buyer's inspection. The law keeps the buyer's duty to inspect, and agents have no duty to inspect.") },

    { h2: "How do you fill out a seller disclosure, step by step?", toc: "Step by step", id: "steps", html: () =>
      h.p("Seven steps, from the first look at the form to closing day:") +
      STEPS },
  ],
  pageImages: () => ph.pageImages(),
  afterSources: () => AFTER(),
  faqTitle: "Seller disclosure FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 27-50", href: T27_50 },
    { name: "SC disclosure form", href: FORM },
    { name: "SC Code 48-39", href: T48_39 },
    { name: "SC Code 15-3", href: T15_3 },
    { name: "SC Code 40-57", href: T40_57 },
    { name: "EPA lead rule", href: EPA },
    { name: "FEMA NFIP data FAQ", href: FEMA_FAQ },
    { name: "OpenFEMA claims", href: OPENFEMA },
    { name: "6 CFR 5.21", href: CFR_521 },
    { name: "Utah CLUE", href: UT_CLUE },
    { name: "Tennessee CLUE", href: TN_CLUE },
    { name: "Horry County parcels", href: PARCELS },
    { name: "Census B25034", href: CENSUS },
  ],
  sourcesNote: "Our counts from county parcels, the state's setback line and FEMA claims. The checklist is our short wording of the form.",
  bottomCta: { h2: "Selling a home on the Grand Strand?", p: "Send us the address. We price it from recorded sales near it and go through the disclosure form with you before the first showing.", label: "Have us plan your sale", href: CTA },
  keywords: "seller disclosure South Carolina, seller disclosure form South Carolina, South Carolina residential property condition disclosure statement, no representation disclosure, seller disclosure exemptions SC, do you have to disclose flooding when selling a house, lead paint disclosure, beachfront setback line disclosure, what happens if seller does not disclose",
  about: "The South Carolina seller disclosure form and what a home seller must disclose",
});
