/* /buyers/flood-zone-check/ - is this Horry County house in a flood zone: how to check an address on
 * FEMA's map, our count of high-risk homes for sale that do not come up under a flood-zone search, what
 * the zone letters mean for a bank loan, when the lender tells you, and the elevation certificate.
 *
 * Batch 2026-11-d, Lane N (a new page). Version 1, built 2026-11-13. Plan: Blog-Brain
 * batches/2026-11-d/flood-zone-check/PLAN.md. Facts: facts.md there, VERIFIED rows and CORRECTED rows at
 * the verifier's safe wording only (VERIFY.md; struck wording in batches/2026-11-d/facts/
 * buyers-flood-zone-check-struck.json). Fix round 1: row 14b (VERIFIED-BY-FIXER: the property records search
 * tested at AE, VE and X) makes our search step 1; row 29 (VERIFIED-BY-FIXER, FloodSmart) gives the elevation
 * certificate's reason. Each fact is said once on the page (REVIEW-1.md). No "X500" (row 20). No time order between the lender's
 * notice and the offer (row 25). No claim that price makes no difference (row 6).
 * Data: data/2026-11-d/flood-zone-check/listing-vs-map.json (our home search's active listings, counted in
 * aggregate, each listing's map pin tested against Horry County's copy of FEMA's flood map; no listing,
 * address, MLS number or photo is in the file) and chart-high-risk-tagged.csv. Every count, share and the
 * day of the count are read from those files here and checked against their ledger rows.
 * No story (none in stories/stories.json fits). No quote. No insurance premium, rate or payment.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB, kit } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));

const SELF = "/buyers/flood-zone-check/";
const DATA = path.join(__dirname, "..", "data", "2026-11-d", "flood-zone-check");
const S0 = JSON.parse(fs.readFileSync(path.join(DATA, "listing-vs-map.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`flood-zone-check.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const NB = " ";

/* ---------- The study (ledger rows 1 to 8) ---------- */
const HC = S0.horry;
must(HC.horry === 6393 && HC.sfha === 1122 && HC.sfha_flagged === 231 && HC.sfha_not_flagged === 891, "rows 1 and 2 changed: 6,393 / 1,122 / 231 / 891");
must(HC.sfha_flagged + HC.sfha_not_flagged === HC.sfha, "rows 1 and 2 do not add up");
must(Math.round(HC.horry / HC.sfha) === 6, "row 1: about 1 in 6");
must(Math.round(HC.sfha / HC.sfha_not_flagged * 10) / 10 === 1.3, "row 2: about 4 in 5 (891 of 1,122 is 79 percent)");
must(HC.flagged === 397 && HC.flagged_not_sfha === 166, "row 8 changed: 166 of 397");
const TY = S0.horry_by_type;
must(TY.condo.sfha === 833 && Math.round(TY.condo.sfha / HC.sfha * 4) === 3, "row 4: about 3 in 4 are condos");
const VE = S0.fema_zone_letter.VE, AE = S0.fema_zone_letter.AE;
must(VE.sfha === 108 && VE.sfha_flagged === 23 && AE.sfha + VE.sfha === HC.sfha, "row 5 changed: VE 108 / 23");
must(Math.round((VE.sfha - VE.sfha_flagged) / VE.sfha * 5) === 4, "row 5: about 4 in 5 in VE");
const BANDS = Object.entries(S0.price_bands);
must(BANDS.every(([, b]) => b.sfha_flagged / b.sfha < 0.3), "row 6: in every price band, fewer than 3 in 10 come up");
const TOPB = S0.price_bands["$1 million and up"];
must(TOPB.sfha === 59 && TOPB.sfha - TOPB.sfha_flagged === 45, "row 6: 45 of 59 at $1 million and up");
const NMB = S0.towns_by_postal_city["North Myrtle Beach"];
must(NMB.horry === 902 && NMB.sfha === 316 && Math.round(NMB.horry / NMB.sfha) === 3, "row 7: about 1 in 3 in North Myrtle Beach");

/* The day of the count, from the data file (never typed). */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const pm = String(S0.pulled).match(/^(\d{4})-(\d{2})-(\d{2})/);
must(pm, "listing-vs-map.json has no pull date");
const PULL_DAY = `${MONTHS[+pm[2] - 1]} ${+pm[3]}, ${pm[1]}`;

/* The chart's two bars come from the chart file, which build_charts.py writes from the same pull. */
const CSV = fs.readFileSync(path.join(DATA, "chart-high-risk-tagged.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(","));
const csvVal = (k) => { const r = CSV.find((x) => x[0] === k); must(r, `chart file has no row "${k}"`); return +r[1]; };
const UP = csvVal("came up under flood zone"), NOT = csvVal("did not come up");
must(UP === HC.sfha_flagged && NOT === HC.sfha_not_flagged, "the chart file and listing-vs-map.json disagree");
must(CSV.every((r) => r[2] === `${pm[1]}-${pm[2]}-${pm[3]}`), "the chart file is from another day's pull");

/* The chart: two bars on one scale, each on a light track that stands for all ${HC.sfha} high-risk homes, so the
   share reads at a glance. Drawn twice, at the width it shows at (a phone one, viewBox 300, and a wide one, viewBox
   600), so its words stay 14 to 16 px at every width (home-value.js). Inside the glass chart card (c3-gchart). */
const ROWS = [
  { label: "Did not come up under flood zone", v: NOT, fill: "#c4783a", ink: "#fff" },
  { label: "Came up under flood zone", v: UP, fill: "#5c6b78", ink: "#fff" },
];
const barSvg = (W, fs, cls) => {
  const bh = Math.round(fs * 1.9), lab = fs * 1.15, gap = fs * 1.3;
  let y = 0, body = "";
  for (const r of ROWS) {
    const ly = y + fs, by = ly + fs * 0.55, bw = Math.max(4, r.v / HC.sfha * W);
    const txt = `${n0(r.v)} homes`, inside = bw > txt.length * fs * 0.6 + 24;
    const tx = inside ? bw - 10 : bw + 8, anchor = inside ? "end" : "start", ink = inside ? r.ink : "#1c2028";
    body += `<text x="0" y="${ly.toFixed(1)}" font-size="${fs}" font-weight="600" fill="#1c2028">${r.label}</text>`
      + `<rect x="0" y="${by.toFixed(1)}" width="${W}" height="${bh}" rx="${(bh / 2).toFixed(1)}" fill="#1c2028" fill-opacity=".07"/>`
      + `<rect x="0" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh}" rx="${(bh / 2).toFixed(1)}" fill="${r.fill}"/>`
      + `<text x="${tx.toFixed(1)}" y="${(by + bh / 2 + fs * 0.36).toFixed(1)}" font-size="${fs}" font-weight="700" text-anchor="${anchor}" fill="${ink}">${txt}</text>`;
    y = by + bh + gap + lab - fs;
  }
  const H = Math.round(y - gap + fs * 0.4);
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Bar chart. Of ${n0(HC.sfha)} Horry County homes for sale in FEMA's high-risk flood zone, ${n0(NOT)} did not come up when our home search filtered for flood zone, and ${n0(UP)} did.">${body}</svg>`;
};
const CHART = `<figure class="c3-gchart fz-chart"><span class="cap">Of ${n0(HC.sfha)} homes for sale in the high-risk flood zone, ${n0(UP)} came up under our flood zone filter</span>`
  + barSvg(300, 15, "fz-n") + barSvg(600, 16, "fz-w")
  + `<figcaption>Horry County homes for sale in our home search whose map pin is inside FEMA's high-risk flood zone, counted on ${PULL_DAY}.</figcaption></figure>`;

/* ---------- The zone letters (rows 17, 18, 20, 21, 24) ---------- */
const ZONES = [
  ["VE", "High risk, on the coast, where storm waves are expected", "Yes"],
  ["AE or A", "High risk: a 1 percent or greater chance of a flood each year", "Yes"],
  ["Shaded X", "Moderate risk: a 0.2 percent chance of a flood each year", "No federal rule. Some lenders still ask."],
  ["X", "Minimal flood risk", "No federal rule. Some lenders still ask."],
];
const ZONE_TABLE = `<div class="fz-tabwrap"><table class="fz-tab"><caption>What each flood zone letter in Horry County means</caption>`
  + `<thead><tr><th scope="col">Zone</th><th scope="col">What it means</th><th scope="col">Does a bank loan need flood insurance?</th></tr></thead><tbody>`
  + ZONES.map(([z, m, y]) => `<tr><th scope="row">${z}</th><td><span class="l">What it means</span>${m}</td><td><span class="l">Bank loan needs flood insurance?</span>${y}</td></tr>`).join("")
  + `</tbody></table></div>`;

/* ---------- Links ---------- */
const MSC = "https://msc.fema.gov/portal/home";
const NFHL = "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer";
const CFR59 = "https://www.ecfr.gov/current/title-44/section-59.1";
const CFR60 = "https://www.ecfr.gov/current/title-44/section-60.3";
const CFR64 = "https://www.ecfr.gov/current/title-44/section-64.3";
const CFR22 = "https://www.ecfr.gov/current/title-12/section-22.9";
const USC4012 = "https://www.law.cornell.edu/uscode/text/42/4012a";
const USC4104 = "https://www.law.cornell.edu/uscode/text/42/4104a";
const FLOODSMART = "https://www.floodsmart.gov/get-insured/buy-a-policy";
const FS_COST = "https://www.floodsmart.gov/flood-insurance-cost";
const HC_EC = "https://horrycountysc.gov/departments/emergency-management/flooding/elevation-certificates/";
const HC_GIS = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19";
const CONTACT = "/contact/";
const LOOKUP = "/buyers/property-records/";

/* ---------- Design: the batch's approved treatment (garden-city.js, DESIGN.md of 2026-11-08) ----------
   The italic line at about half the H1's size; one card style for the chart and the offers; the table and
   the lists plain under thin rules; one block width of 720 px. */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const DESIGN_CSS = "<style>"
  + `@media (min-width:700px){${S} .detail-h1{text-wrap:balance}}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:var(--g-ink,#8a5226)!important}}`
  /* The zone table: plain, under thin rules. On a phone each zone is its letter, then two short labelled lines. */
  + `${S} .fz-tabwrap{max-width:720px;margin:1.2rem 0 1.4rem}`
  + `${S} .fz-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .fz-tab caption{text-align:left;font-weight:600;padding:0 0 .6rem;line-height:1.4}`
  + `${S} .fz-tab th,${S} .fz-tab td{padding:.65rem .8rem .65rem 0;border-bottom:${RULE};text-align:left;vertical-align:top;line-height:1.45}`
  + `${S} .fz-tab thead th{font-size:.95rem;border-bottom:1px solid rgba(28,32,40,.35)}`
  + `${S} .fz-tab tbody th{font-weight:700;white-space:nowrap}${S} .fz-tab td .l{display:none}`
  + `@media (max-width:599px){${S} .fz-tab,${S} .fz-tab tbody,${S} .fz-tab caption{display:block;width:100%}`
  + `${S} .fz-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .fz-tab tr{display:block;padding:.7rem 0;border-bottom:${RULE}}${S} .fz-tab tbody tr:first-child{border-top:${RULE}}`
  + `${S} .fz-tab th,${S} .fz-tab td{display:block;border:0;padding:0}${S} .fz-tab tbody th{padding-bottom:.25rem}`
  + `${S} .fz-tab td{margin-top:.3rem}${S} .fz-tab td .l{display:block;font-size:.9rem;color:var(--muted)}}`
  /* The three facts under the chart: a plain list under thin rules, no cards. */
  + `${S} ul.fz-facts{list-style:none;margin:1.2rem 0 1.4rem;padding:0;max-width:720px;font-size:inherit}${S} ul.fz-facts li{font-size:var(--read,1.0625rem)!important}`
  + `${S} ul.fz-facts li{border-top:${RULE};padding:.75rem 0 .8rem;margin:0;line-height:1.7;color:var(--muted)}${S} ul.fz-facts li:last-child{border-bottom:${RULE}}`
  + `${S} ul.fz-facts strong{color:var(--navy)}`
  /* The chart: the phone drawing under 600 px, the wide one from 600 px. */
  + `${S} .fz-chart .cap{display:block}${S} svg.fz-n{display:block;width:100%;height:auto;max-width:340px;margin:.4rem 0 .2rem}${S} svg.fz-w{display:none;width:100%;height:auto;max-width:640px;margin:.4rem 0 .2rem}`
  + `@media (min-width:600px){${S} svg.fz-n{display:none}${S} svg.fz-w{display:block}}`
  + `${S} .fz-chart svg text{font-family:var(--sans),system-ui,sans-serif}`
  /* One block width. */
  + `${S} .c3-gchart,${S} .fz-tabwrap,${S} ul.fz-facts{max-width:720px!important;box-sizing:border-box}`
  /* The end band (the same fix as /submarkets/garden-city/: the edge writes the listings notice after it). */
  + `${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important;width:calc(100% - 32px);max-width:720px!important;box-sizing:border-box}`
  + `@media (max-width:699px){${S}>section[style^="background:var(--navy)"]:last-of-type:not(.c3-x)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}`
  + `@media (min-width:980px) and (max-width:1099px){header nav.primary{gap:2.4rem!important}}`
  + "</style>";

const facts = (items) => `<ul class="fz-facts">${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

/* ---------- The photo (licence record: data/2026-10-b/photos.json, USGS oblique aerial, public domain) ----------
   One picture of one town from the ocean back to its streets, under the line that one town holds both kinds of zone.
   Its caption states row 7 (postal city). Shown close-up, so it is not the page's share image (the og card is). */
const ph = kit.photoSet({ aerialWidth: "720px" });
const NMB_PHOTO = ph.aerial("crescent-beach-streets-from-the-ocean-2011",
  `Crescent Beach in North Myrtle Beach, seen from over the ocean: buildings on the beach, then streets of houses. About 1${NB}in${NB}3 homes for sale with a North Myrtle Beach address is in FEMA's high-risk flood zone, and the rest are not.`, { closeUp: true });

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "Is My House in a Flood Zone? Horry County Flood Map Check",
  description: "Is my house in a flood zone? Check any Horry County address on FEMA's flood map, learn what AE, VE and X mean, and how often our home search misses it.",
  ogTitle: "Is this Horry County house in a flood zone? How to check FEMA's map, what the letters mean, and how often our home search misses the zone",
  crumb: "Flood Zone Check",
  eyebrow: "Buying a home",
  h1: "How to check if a Horry County house is in a flood zone",
  h1em: "Look it up on FEMA's map before you make an offer.",
  sub: `Of Horry County homes for sale in FEMA's high-risk flood zone, about 4 in 5 did not come up in this site's home search filtered for flood zone.`,
  heroCta: { title: "Send us an address. We find its flood zone.", label: "Have us find the zone", href: CONTACT },
  topOfferLine: "Send us the address of a house you like. We find its flood zone.",
  author: "devin",
  toc: false,
  shortAnswer: [
    `If the address is in zone A, AE or VE on FEMA's flood map, the house is in the high-risk flood zone. A mortgage from a bank there needs flood insurance.`,
    `To see the zone, type the address into our free ${h.a(LOOKUP, "property records search")}. It is also on FEMA's ${h.ext(MSC, "Flood Map Service Center")}, the official public source for flood maps.`,
    `Do not count on a search filter. We check FEMA's map for every house you send us.`,
  ],
  sections: [
    { h2: "Does a home search show the flood zone?", id: "home-search", html: (bg) =>
      DESIGN_CSS + ph.css() + G.homesQScript() +
      h.p(`Not reliably. We put every Horry County home for sale in our home search on FEMA's flood map, by its map pin. About 1 in 6 has its pin in the high-risk flood zone.`) +
      CHART +
      h.p(`Our home search finds a home under "Flood zone" only when the data that comes with the home says so. FEMA's map is the official answer for the zone. The gap shows up across the market:`) +
      facts([
        `<strong>Condos.</strong> About 3 in 4 of the high-risk homes for sale are condos. A condo building also has its own flood policy, explained in our ${h.a("/hoa/master-insurance-ho6/", "guide to condo master insurance")}.`,
        `<strong>The wave zone.</strong> ${n0(VE.sfha)} homes for sale are in zone VE, FEMA's coastal zone where storm waves are expected. About 4 in 5 of them did not come up.`,
        `<strong>Every price.</strong> At every price, fewer than 3 in 10 of the high-risk homes for sale came up. At $1 million and up, ${n0(TOPB.sfha - TOPB.sfha_flagged)} of ${n0(TOPB.sfha)} did not.`,
      ]) +
      h.p(`The mismatch goes both ways. Of the ${n0(HC.flagged)} homes that came up under flood zone, ${n0(HC.flagged_not_sfha)} have a map pin outside FEMA's high-risk zone.`) +
      h.cta("Like a house? We will check its flood zone before you offer.", "We read FEMA's map for the address, look for an elevation certificate and get a flood insurance quote.", "Have us check this house's flood zone", CONTACT, bg) },

    { h2: "Three steps to check an address", id: "how-to-check", html: () =>
      h.p(`Three steps give you the zone, FEMA's own answer and a copy to keep:`) +
      h.ol([
        `<strong>Type the address into our free ${h.a(LOOKUP, "property records search")}.</strong> It reads FEMA's flood map at the address, then names the zone and what it means.`,
        `<strong>Check it on FEMA's ${h.ext(MSC, "Flood Map Service Center")}.</strong> Type the same address and read the zone letter at the house. The table below says what each letter means.`,
        `<strong>Download or print the map.</strong> FEMA updates its maps, so a copy you print today can be replaced by a newer one.`,
      ]) +
      h.p(`Check each address, not the town. One town can hold both kinds of zone.`) +
      NMB_PHOTO +
      h.p(`Horry County's own parcel map has a Flood Zones layer with FEMA's codes. Our ${h.a("/buyers/property-records/gis-map/", "guide to the Horry County GIS map")} shows where it is.`) },

    { h2: "What does my flood zone mean?", id: "zone-letters", html: () =>
      h.p(`Each zone letter stands for a level of flood risk. In the high-risk zones, a mortgage from a bank needs flood insurance on the building.`) +
      ZONE_TABLE +
      h.p(`A 1 percent chance of a flood each year adds up to a 1 in 4 chance or more over 30 years.`) +
      h.p(`What flood insurance costs here is in our ${h.a("/buyers/coastal-insurance/", "guide to coastal insurance in Myrtle Beach")}. For a house on the water, our ${h.a("/buyers/waterfront-homes/", "waterfront homes guide")} shows where zone VE reaches.`) +
      h.p(`Some houses are built up off the ground, on pilings. The homes below are listed that way.`) +
      G.homesQ("has=raised_home", "Homes raised on pilings") },

    { h2: "When will the lender tell me the house is in a flood zone?", id: "lender", html: (bg) =>
      h.p(`If the house is in the high-risk zone, a regulated lender must tell you in writing, a reasonable time before the loan closes.`) +
      facts([
        `<strong>The wait for a policy.</strong> A National Flood Insurance Program policy bought while the mortgage is made starts with no wait. Most others wait 30 days.`,
        `<strong>Before you offer.</strong> Get the zone and a flood insurance quote, so the cost is part of the price you offer.`,
      ]) +
      h.p(`Whether the house has flooded before is a separate question. Our guide to ${h.a("/buyers/undisclosed-flooding/", "finding out if a house has flooded")} covers it.`) +
      h.cta("Send us the address. We get the flood quote before you offer.", "We find the house's flood zone and get a flood insurance quote before you sign a contract.", "Get a flood zone check and quote", CONTACT, bg) },

    { h2: "Does the house have an elevation certificate?", id: "elevation-certificate", html: () =>
      h.p(`An elevation certificate records how high a building's lowest floor is, measured from sea level.`) +
      facts([
        `<strong>Why you want one.</strong> FEMA's flood insurance site says an elevation certificate is not required to buy flood insurance, but it can help you pay less.`,
        `<strong>When the rules require one.</strong> A building built or substantially improved in the high-risk zone must have its lowest floor height on record. Federal rules name the elevation certificate as that proof.`,
        `<strong>Where to find one.</strong> Horry County posts the signed elevation certificates it has on file, by year and permit number: about 1,700 from 2010 to 2025. They are listed by permit, not by address, and an older house may have none.`,
      ]) +
      h.p(`We look for the certificate when you send us an address. For the other things we look at before an offer, see our list of ${h.a("/buyers/common-mistakes/", "common buyer mistakes in Myrtle Beach")}.`) },
  ],
  faqTitle: "Flood zone check FAQ",
  faq: [
    { q: "Is there a Horry County flood map PDF?", a: "Yes. FEMA's Flood Map Service Center lets you download or print the official flood map for any address in the county." },
    { q: "How new is Horry County's flood map?", a: "The countywide map took effect in December 2021. FEMA has revised four small areas of it since, most recently in September 2026." },
    { q: "Does Zone X mean I do not need flood insurance?", a: "No federal rule makes you buy it in Zone X, but some lenders still ask. FEMA recommends flood insurance even where a lender does not require it." },
    { q: "Can I use private flood insurance for the loan?", a: "Yes, if the policy meets the federal rule. Under federal law, a lender must accept private flood insurance that does. A private policy has its own wait before it starts." },
    { q: "Does a cash buyer get the flood zone notice?", a: "No. The written notice comes from a lender with the loan, so a cash buyer gets none." },
  ],
  sources: [
    { name: "FEMA Map Service Center", href: MSC },
    { name: "FEMA flood map data", href: NFHL },
    { name: "Horry County flood zones", href: HC_GIS },
    { name: "44 CFR 59.1", href: CFR59 },
    { name: "60.3", href: CFR60 },
    { name: "64.3", href: CFR64 },
    { name: "42 U.S.C. 4012a", href: USC4012 },
    { name: "4104a", href: USC4104 },
    { name: "12 CFR 22.9", href: CFR22 },
    { name: "FloodSmart", href: FLOODSMART },
    { name: "costs", href: FS_COST },
    { name: "Horry County elevation certificates", href: HC_EC },
  ],
  sourcesNote: `Our count: CCMLS homes for sale in our home search, in aggregate, each map pin on the county's copy of FEMA's map, on ${PULL_DAY}. It matched FEMA's live map at 80 of 80 sampled pins. Georgetown County is left out. Not legal or insurance advice.`,
  afterSources: () => ph.credits(),
  bottomCta: { h2: "Found a house? Send us the address.", p: "We find its flood zone on FEMA's map, look for an elevation certificate and get a flood insurance quote, before you make an offer.", label: "Send us the address", href: CONTACT },
  keywords: "is my house in a flood zone, is my house in a flood zone by address, how to check flood zone, how to check if a house is in a flood zone, what flood zone am I in, Horry County flood map, Horry County flood zone map, Horry County flood zones, Horry County FEMA flood map, Myrtle Beach flood zone map, flood zone AE meaning, flood zone X meaning, Horry County elevation certificate",
  about: "FEMA flood zones and how to check the flood zone of a house in Horry County, South Carolina",
});
