/* /why-chapter-3/ - why choose Chapter3 Realty: the AI home search (say the home you want in your own words), how it shows
 * the homes that fit, the numbers a reader can run free, the people behind it, what working with us gets you, and one
 * line of license facts.
 *
 * Batch 2026-11-b, Lane U, second rewrite (2026-11-12). The owner on the first rewrite: "seems alot more like a big
 * disclosure rather than selling ourselves ... it really glossed over our tools". Plan: Blog-Brain
 * batches/2026-11-b/why-chapter-3/PLAN.md. Facts: facts.md in the same folder (second ledger), VERIFIED rows, and
 * CORRECTED rows only in the verifier's wording (VERIFY.md). Struck wording: batches/2026-11-b/facts/why-chapter-3-struck.json.
 * The page describes the LIVE search, as the verifier asks (VERIFY.md, top): the box reads "describe the home you want",
 * the AI reads the descriptions for every visitor, the best fits move up, no photo row and no reasons.
 * Rows used: 1 (CORRECTED), 2, 3, 4, 5 (CORRECTED), 6, 7, 8, 9 (CORRECTED), 10 (CORRECTED, first clause only), 11, 12, 13,
 * 14 (CORRECTED: 47 buildings, 45 with a fee, 42 with sale prices), 22, 23, 24 (the idea of its last sentence, in the
 * firm's voice, without quote marks, as the row allows), 25, 26, 28 to 36.
 * Not on this page: "only", "first" or "best" about the search (rows 15 to 21); the owner's phrase "dynamic preview photos"
 * as a label (VERIFY note 2); the flood count (row 27: on a page that sells our search it reads as a mark against it,
 * and /buyers/undisclosed-flooding/ owns it); any rate, payment, down payment or value; the analyzer's loan inputs.
 * Data, never typed: data/2026-11-b/why-chapter-3/tools.json (scripts/pull_tools.mjs, re-run on build day), the home-value
 * guide's findings.json (row 13) and the condo building guide's table.json (row 14).
 * Design, as /sell/home-value/ and /submarkets/garden-city/: answer first under question headings, the italic line at
 * about half the H1's size, one card style for the demo and the offers, plain lists under thin rules, one block width
 * of 720 px, an offer after about every second section tied to what it answered. Every request button links to
 * /contact/; the site opens the short pop-up.
 * Homes: the edge feed under the opening (idx-lib/feeds.js, the lead's) and one place strip, wf-oceanfront-condos.
 * Fix round 1 (2026-11-12, REVIEW-1.md): a seller line, a seller story and a seller offer in section 5 (rows 28, 38, 39);
 * the investor offer moved to the numbers section; the feature bars became one plain card; three spec-sheet lines cut.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/why-chapter-3/";
const ROOT = path.join(__dirname, "..", "data");
const read = (...p) => JSON.parse(fs.readFileSync(path.join(ROOT, ...p), "utf8"));
const TOOLS = read("2026-11-b", "why-chapter-3", "tools.json");
const HV = read("2026-10-d", "sell-home-value", "findings.json");
const CB = read("2026-11-b", "invest-condo-buildings", "table.json");
const must = (ok, msg) => { if (!ok) throw new Error(`why-chapter-3.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const day = (iso) => { const d = new Date(iso); must(!isNaN(d), `not a date: ${iso}`); return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }); };
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* ---- Row 4: the features a search, and the AI, can ask for. Printed as "more than N00". ---- */
const FEATURES = TOOLS.live.features_total;
must(FEATURES >= 500 && TOOLS.live.feature_groups.length >= 5, `row 4: the feature list looks wrong (${FEATURES})`);
const FEAT_FLOOR = Math.floor(FEATURES / 100) * 100;
const PULL_DAY = day(TOOLS.pulled);

/* ---- Row 3: two sentences typed into the live search, what it read from each, and how many homes matched. The
   "retiring" demo stays off the page (row 3). A demo whose count is zero, or that reads fewer than three filters, is
   dropped, never typed. ---- */
const DEMO_Q = ["condo I can airbnb near the beach under 300k", "3 bedroom house with a pool under 600k in Murrells Inlet"];
const DEMOS = DEMO_Q.map((q) => TOOLS.demos.find((d) => d.q === q)).filter((d) => d && d.total > 0 && d.chips.length >= 3);
must(DEMOS.length >= 1, "row 3: no demo search has homes today");
const noun = (d) => (d.chips.includes("Condo") ? "condo" : d.chips.includes("House") ? "house" : "home") + (d.total === 1 ? "" : d.chips.includes("House") ? "s" : "s");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const DEMO_CARD = `<figure class="wc-card wc-demo"><span class="cap">Type it the way you would say it</span>`
  + DEMOS.map((d) => `<a class="wc-try" href="/homes/map/?q=${encodeURIComponent(d.q)}">`
    + `<span class="q">${esc(d.q)}</span>`
    + `<span class="rd">Our search read</span><span class="chips">${d.chips.map((c) => `<span>${esc(c)}</span>`).join("")}</span>`
    + `<span class="n"><b>${n0(d.total)} ${noun(d)}</b> for sale matched. <u>Run this search</u></span></a>`).join("")
  + `<figcaption>Counted on ${PULL_DAY}. Counts change every day. In the live search, Chapter3 AI also reads your sentence and can add what it heard.</figcaption></figure>`;

/* ---- Row 10 (CORRECTED; first clause only): pages that carry a live row of homes with the AI search box. The page says
   "most pages on our site" (fix round 1: the count itself is a verifier's note, not a reader's reason), so the file must
   still show more than half. ---- */
const S10 = TOOLS.site;
must(S10.pages_with_feed > 100 && S10.pages_with_feed <= S10.sitemap_pages && S10.pages_with_feed * 2 > S10.sitemap_pages, "row 10: the feed count looks wrong");

/* ---- Row 13: the home sales behind /sell/home-value/, and the months, from that guide's own file. ---- */
const SALES = HV.counts.sales;
must(SALES === 13194, `row 13: the sale count changed (${SALES})`);
const per = HV.meta.sales_source.match(/recorded (\d{4})-(\d{2})-\d{2} to (\d{4})-(\d{2})-\d{2}/);
must(per, "row 13: no recorded period");
const SALES_SPAN = `${MONTHS[+per[2] - 1]} ${per[1]} to ${MONTHS[+per[4] - 1]} ${per[3]}`;

/* ---- Row 14 (CORRECTED): the condo building guide's buildings, how many have a fee, how many have sale prices. ---- */
const CB_N = CB.length, CB_FEE = CB.filter((b) => b.fee != null).length, CB_SOLD = CB.filter((b) => b.sales_median != null).length;
must(CB_N === 47 && CB_FEE === 45 && CB_SOLD === 42, `row 14: the building counts changed (${CB_N}, ${CB_FEE}, ${CB_SOLD})`);

/* ---- Links. ---- */
const LOOKUP = "https://verify.llronline.com/LicLookup/Rec/Rec.aspx?div=19";
const ROAD = "https://roads.horrycountysc.gov/projects/fred-nash-boulevard/";
const DEEDS = "https://www.horrycountysc.gov/departments/register-of-deeds/";
const ASK = "/contact/";
const PHONE = "854.333.2135";

/* ---- The place strip (owner, 2026-11-08: "horizontal idx listings is the strongest tool we have"). Fix round 1: the
   Garden City Airbnb strip was an odd fit on the firm's page, whose reader may be a relocating family or a seller. The
   existing place wf-oceanfront-condos (row 40: condos with an oceanfront unit, 25 miles around Myrtle Beach) is the
   broad want most readers share. Empty, it takes no space. ---- */
/* The photo (record in data/2026-11-b/why-chapter-3/photos.json, copied from /invest/strategies/: a public domain USGS oblique
   aerial, 2011) shows oceanfront condo buildings, so it is the strip's fallback: it shows until the strip has homes. */
const GC_PH = PH.findPhoto(read("2026-11-b", "why-chapter-3", "photos.json").photos, "garden-city-condos-2011");
const GC_PHOTO = PH.heroPhoto(GC_PH, { alt: GC_PH.alt, caption: "Oceanfront condo buildings at Garden City Beach, with the salt marsh behind them.", maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
const CREDITS = PH.creditsList([{ photo: GC_PH, caption: "Condo buildings at Garden City Beach" }]);
const OC_STRIP = G.homes("wf-oceanfront-condos", "condos facing the ocean", GC_PHOTO, "Wake up to the ocean: oceanfront condos for sale now");

/* ---- V2, row 4: what a reader can ask for, at a glance. Fix round 1: the seven group bars ("The listing itself 52")
   meant nothing to a buyer. One line with the count, then the asks the body already named (rows 2 and 4), then the groups
   in plain words. Values from TOOLS. ---- */
const GROUP_WORD = { "Water and boats": "water and boats", "Beach and places nearby": "the beach and places nearby", "Outside": "outside",
  "Inside": "inside", "Community and HOA": "the community and HOA", "The listing": "the listing", "Kind of home": "the kind of home" };
const GROUPS = TOOLS.live.feature_groups.map((g) => ({ name: GROUP_WORD[g.label] || g.label.toLowerCase(), n: g.items }));
must(GROUPS.reduce((s, g) => s + g.n, 0) === FEATURES, "row 4: the groups do not add up");
const GROUP_LIST = GROUPS.map((g) => g.name).slice(0, -1).join(", ") + " and " + GROUPS[GROUPS.length - 1].name;
const ASKS = ["A dock for the boat", "Near the beach", "A private pool", "No HOA", "A condo you can rent by the night"];
const FEAT_CARD = `<figure class="wc-card wc-feat"><span class="cap">Ask for any of ${n0(FEATURES)} things, from a dock to no HOA</span>`
  + `<span class="chips">${ASKS.map((c) => `<span>${esc(c)}</span>`).join("")}</span>`
  + `<figcaption>Each one is a filter it knows. They come in ${GROUPS.length} groups: ${GROUP_LIST}. Counted the same day.</figcaption></figure>`;

/* ---- V3, row 12: the free calculators, one line each in the tool's own words, as a two-column table in the card. ---- */
const CALC_TABLE = (rows) => `<figure class="wc-card wc-tw"><table class="wc-tab"><caption>Free calculators on this site</caption>`
  + `<thead><tr><th scope="col">Calculator</th><th scope="col">What it tells you</th></tr></thead><tbody>`
  + rows.map(([a, t]) => `<tr><th scope="row">${a}</th><td>${t}</td></tr>`).join("") + `</tbody></table></figure>`;

/* ---- The page's own styles: one card style (the demo and the offers), lists under thin rules, one 720 px column. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CARD = "background:linear-gradient(180deg,rgba(255,255,255,.8),rgba(255,255,255,.58));border:1px solid rgba(255,255,255,.75);box-shadow:inset 0 1px 0 rgba(255,255,255,.9),0 18px 40px -26px rgba(28,32,40,.45);border-radius:22px";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  + `${S} .wc-card,${S} .wc-plain,${S} .c3-offer,${S} .hx-strip{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  /* the demo card: the sentence in a search-box shape, the filters it read as chips, then the count */
  + `${S} .wc-card{${CARD};display:block;margin:1.5rem 0 1.8rem!important;padding:1.15rem 1.35rem 1.05rem!important}`
  + `${S} .wc-demo .cap{display:block;font-family:var(--sans);font-weight:600;font-size:1.15rem;line-height:1.35;color:var(--navy);margin:0 0 .4rem}`
  + `${S} .wc-try{display:block;text-decoration:none;color:var(--navy);padding:.95rem 0 1rem;border-bottom:${RULE}}`
  + `${S} .wc-try:last-of-type{border-bottom:0}`
  + `${S} .wc-try .q{display:block;font-family:var(--sans);font-size:1.0625rem;line-height:1.45;background:#fff;border:1px solid rgba(28,32,40,.22);border-radius:14px;padding:.7rem .95rem;box-shadow:inset 0 1px 2px rgba(28,32,40,.06)}`
  + `${S} .wc-try .rd{display:block;font-family:var(--sans);font-size:.9rem;font-weight:600;letter-spacing:.02em;color:var(--muted);margin:.75rem 0 .35rem}`
  + `${S} .wc-try .chips{display:flex;flex-wrap:wrap;gap:.4rem}`
  + `${S} .wc-try .chips span{font-family:var(--sans);font-size:.95rem;line-height:1.2;padding:.38rem .7rem;border-radius:999px;background:rgba(28,32,40,.06);border:1px solid rgba(28,32,40,.14);color:var(--navy)}`
  + `${S} .wc-try .n{display:block;font-family:var(--sans);font-size:1.0625rem;line-height:1.45;margin-top:.75rem;color:var(--muted)}`
  + `${S} .wc-try .n b{color:var(--navy);font-size:1.2rem}${S} .wc-try .n u{color:${INK};text-underline-offset:3px;white-space:nowrap}`
  + `${S} .wc-try:hover .q,${S} .wc-try:focus-visible .q{border-color:var(--brass)}`
  + `${S} .wc-card figcaption{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.6rem 0 0!important;padding:0!important}`
  + `@media (max-width:699px){${S} .wc-card{padding:1rem 1rem .95rem!important}}`
  /* the features card: one line with the count, then the asks as chips */
  + `${S} .wc-feat .cap{display:block;font-family:var(--sans);font-weight:600;font-size:1.25rem;line-height:1.35;color:var(--navy);margin:0 0 .8rem;text-wrap:balance}`
  + `${S} .wc-feat .chips{display:flex;flex-wrap:wrap;gap:.45rem}${S} .wc-feat figcaption{margin-top:1rem!important}`
  + `${S} .wc-feat .chips span{font-family:var(--sans);font-size:1rem;line-height:1.25;padding:.45rem .8rem;border-radius:999px;background:#fff;border:1px solid rgba(28,32,40,.18);color:var(--navy)}`
  /* the calculators table: two columns, plain rows under thin rules inside the card */
  + `${S} .wc-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .wc-tw caption{text-align:left;font-weight:600;font-size:1.15rem;line-height:1.35;padding:0 0 .7rem}`
  + `${S} .wc-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .9rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);line-height:1.3}`
  + `${S} .wc-tw tbody th{text-align:left;font-weight:600;padding:.65rem .9rem .65rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top;width:34%}`
  + `${S} .wc-tw tbody th a{color:var(--navy)}`
  + `${S} .wc-tw td{padding:.65rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.45;color:var(--muted)}`
  + `${S} .wc-tw tbody tr:last-child th,${S} .wc-tw tbody tr:last-child td{border-bottom:0}`
  /* on a phone each calculator row folds: the name, then what it tells you under it */
  + `@media (max-width:559px){${S} .wc-tw thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}${S} .wc-tw tr{display:block;padding:.65rem 0;border-bottom:${RULE}}${S} .wc-tw tbody tr:last-child{border-bottom:0}${S} .wc-tw tbody th,${S} .wc-tw td{display:block;width:auto;border:0!important;padding:0!important}${S} .wc-tw td{margin-top:.2rem}}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .wc-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .wc-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .wc-plain li:last-child{border-bottom:${RULE}}${S} .wc-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  + `${S} .wc-plain b a{color:var(--navy)}`
  /* the strip inside section 2, with room above and below */
  + `${S} .hx-strip:not(:empty){margin:1.2rem 0 1.6rem}`
  /* the one line of license facts, small, near the end */
  + `${S} .wc-lic{font-family:var(--sans);font-size:.95rem;line-height:1.6;color:var(--muted);max-width:720px;margin:1.6rem 0 0;padding-top:.8rem;border-top:${RULE}}`
  /* Work-arounds kept from the first build: the feed's search row at 320 px, the header phone at 1000 to 1100 px, and
     the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="wc-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "Does Chapter3 have an AI home search?", a: `Yes. Type the home you want as a sentence, and Chapter3 AI turns it into a search from more than ${FEAT_FLOOR} MLS features. It answers with one line on what it heard.` },
  { q: "Do you have to sign up to use the AI search?", a: "No. The search, and the AI's read of the listing descriptions, work for every visitor. Asking Chapter3 AI about one home on its page takes a free sign-up." },
  { q: "Does it cost anything to talk with Chapter3?", a: "No. Consultations, rental analyses and pricing reviews are free, for buyers and sellers. You pay only under a written agreement you choose to sign." },
  { q: "Is Chapter3 Realty licensed in South Carolina?", a: "Yes. Chapter3 Realty Corp holds South Carolina real estate company license 28849. Its Broker-in-Charge, Tim Nash, holds license 43182." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "About", url: "/about/" },
  title: "Why Chapter3 Realty: AI Home Search on the Grand Strand",
  description: "Search Grand Strand homes in your own words with Chapter3 AI, see the best fits first, run the numbers free, and meet the people behind it.",
  ogTitle: "Why Chapter3 Realty: describe the home you want, Chapter3 AI finds it, and our agents check it before you offer",
  crumb: "Why Chapter3",
  eyebrow: "Why Chapter3",
  h1: "Why Chapter3 Realty on the Grand Strand",
  h1em: "Describe the home you want. Our AI finds it, and our agents check it before you offer.",
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: "Chapter3 Realty pairs an AI home search for the Grand Strand with local agents who check a home for you, and price yours free when you sell.",
  heroMedia: CSS,
  heroCta: { title: "Tell us the home you want. We find it, and we check it for you.", label: "Find me a home", href: ASK },
  author: "devin",
  shortAnswer: [
    `Tell Chapter3 AI what you want, in your own words, and it builds the search for you. When you ask for more than price and beds, it reads the listing descriptions and puts the best fits first.`,
    `Behind it is Tim Nash, our Broker-in-Charge, with over 30 years on the Grand Strand. On a home you want to buy, our team gets the HOA papers, a rental analysis and an insurance quote before you offer. On a home you want to sell, the pricing review is free.`,
  ],
  sections: [
    /* Owner, 2026-11-12: "just make it the horizontal IDX and have the text bar like normal then talk about its
       capabilities in a human way ... this whole page is like an announcement for Chapter3". The page's own feed (the AI
       search bar and the live row of homes, idx-lib/feeds.js, low) sits right above this section. Headings are
       announcements, not questions (owner, same day). */
    { h2: "Meet Chapter3 AI: search the Grand Strand the way you talk", toc: "Chapter3 AI", id: "ai-search", html: () =>
      h.p(`That search bar above is Chapter3 AI. Type what you want the way you would say it to a friend. "A three-bedroom with a pool in Murrells Inlet under $600,000." "A condo near the beach I can Airbnb." It builds the search for you.`) +
      h.p(`It knows more than ${FEAT_FLOOR} things a listing can say, from a dock for the boat to no HOA at all. Tell it why you want something, and it uses that too.`) +
      h.p(`Change your mind halfway? Type "cheaper" or "what about Conway", and it picks up where you left off. It never filters on who a person is or who lives nearby.`) },

    { h2: "It reads every listing, so you do not have to", toc: "It reads the listings", id: "see-homes", html: () =>
      h.p(`Ask for more than price and bedrooms, and Chapter3 AI reads the full description of every home your search found. The best fits move to the top. The ones that do not fit drop off the list. Nobody has to sign up for that.`) +
      plain([
        [h.a("/homes/map/", "Photos right on the map"), "A click on a dot shows the home's photo and price, and a second click opens it. Click any spot to search around it, in 2D or 3D."],
        ["Homes near your daily drive", "Ask for homes within a few miles of up to two places you go every day, like your office."],
        ["Ask about any home", `On each home's page, sign up free and ask Chapter3 AI about it. Ask what the HOA fee covers, how old the roof and the AC are, what the flood zone is, or whether you can rent it out.`
          + ` It answers from that listing. It can be wrong, and it never gives a value, a rate or a payment.`],
        ["Homes on the page you are reading", "Most pages on our site open with a live row of homes for sale and the AI search box. The most appealing homes come first, not the cheapest, each with its photo."],
      ]) +
      OC_STRIP },

    { h2: "Run the numbers yourself, free", toc: "Free numbers", id: "free-numbers", html: (bg) =>
      h.p(`Our ${h.a("/invest/run-the-numbers/", "rental analyzer")} reads the MLS. Pick a home for sale, and it fills in the beds, baths and size, then estimates the rent, the costs, the cash flow and the return.`) +
      h.p(`It also shows building permits filed nearby. Our other free calculators each answer one question.`) +
      CALC_TABLE([
        [h.a("/invest/str-tools/", "Airbnb calculator"), "What a nightly rental keeps after the HOA fee, the property tax and Airbnb's cut."],
        [h.a("/buyers/cost-to-own/", "Cost to own"), "What a home costs each year besides the loan: tax, insurance, the HOA fee and upkeep."],
        [h.a("/buyers/property-taxes/", "Property tax"), "Your Horry County tax bill, as your main home or as a rental."],
        [h.a("/buyers/closing-costs/", "Closing costs"), "Both sides of a closing, with real Horry County numbers."],
        [h.a("/sell/net-proceeds/", "Seller net"), "What you keep when you sell, line by line."],
        [h.a("/sell/capital-gains/", "Capital gains"), "South Carolina's tax and withholding on a home sale."],
        [h.a("/buyers/relocating/cost-of-living/", "Cost of living"), "How Myrtle Beach compares with where you live now."],
      ]) +
      h.h3("Our guides count the county's records") +
      h.p(`We count the county's own records ourselves.`) +
      plain([
        [h.a("/sell/home-value/", "Home value guide"), `Built from ${n0(SALES)} home sales recorded at the county's ${h.ext(DEEDS, "Register of Deeds")}, ${SALES_SPAN}.`],
        [h.a("/invest/condo-buildings/", "Condo building guide"), `Compare ${CB_N} oceanfront buildings in Myrtle Beach and North Myrtle Beach. For most, it shows the monthly HOA fee and what units sold for.`],
      ]) +
      h.p(`Every guide and calculator is on ${h.a("/guides/", "our guides page")}.`) +
      h.cta("Send me homes with the numbers to prove it.", "Investors ask us for this more than anything else. Tell us your plan, and we send the homes with the numbers on each.", "Send me the homes and numbers", ASK, bg) },

    { h2: "The people behind it: three generations on the Grand Strand", toc: "The people", id: "people", html: () =>
      h.p(`Tim Nash, our Broker-in-Charge, has sold real estate on the Grand Strand for over 30 years. He is the third generation of his family in this market.`) +
      h.p(`${h.ext(ROAD, "Fred Nash Boulevard")}, by Myrtle Beach International Airport, is named for his father, Fred Nash, who sold real estate here before him.`) +
      h.p(`This is a small town to us. We want to run into you at the grocery store and hear that you are happy here. Tell us what you want, and we will tell you honestly whether it is here.`) +
      h.p(`We build these tools ourselves, and our team keeps growing, with a focus on using AI to find homes that rent well. We find the home for you; you do not have to bring us one.`) +
      h.p(`You can ${h.a("/about/", "meet the team")} on our About page.`) },

    { h2: "What you get when you work with us", toc: "Working with us", id: "work-with-us", html: (bg) =>
      h.p(`Talking with us is free. Consultations, rental analyses and pricing reviews cost nothing, and you pay only under a written agreement you choose to sign.`) +
      plain([
        ["Know the insurance cost first", "We can get you a quote on the home before you make an offer, so you know what it costs to insure."],
        ["Only communities that let you rent", "When we search for an investor, we leave out communities that ban renting. We read the HOA papers for rules that would block your plan."],
        ["The papers behind the home", "On a home you are serious about, we get the HOA's bylaws and as many of its financial records as we can. We add the building's lawsuit history where it can be found, and a rental analysis."],
        ["No old HOA debt at closing", "Before closing, our agents check whether an HOA lien or unpaid fees will follow the home."],
        [`Selling? Two numbers before you choose`, `We show you the price range for a listing and what a cash buyer would pay, side by side. Our ${h.a("/sell/net-proceeds/", "seller net calculator")} shows what you keep.`],
      ]) +
      h.p(`One of our agents sold a rented house for an owner who was moving to New York. The agent offered it to our list of investors, and a cash buyer closed within 13 days of the day he listed. One sale, not a promise.`) +
      h.cta("Thinking of selling?", "Send us the address. An agent sends back both numbers, free, and nobody here pushes you either way.", "Get both numbers for my home", ASK, bg) +
      `<p class="wc-lic">Chapter3 Realty Corp is licensed in South Carolina, company license 28849, with Tim Nash as Broker-in-Charge, license 43182. Both are on the state's ${h.ext(LOOKUP, "Licensee Lookup")}.</p>` },
  ],
  /* The share card: tools/ogcard.js from the page's eyebrow and H1, moved into this page's images folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/why-chapter-3/share.jpg",
  ogImageAlt: "Why Chapter3 Realty on the Grand Strand. Describe the home you want. Our AI finds it, and our agents check it before you offer.",
  faqTitle: "Questions about Chapter3",
  faq: FAQ,
  sources: [
    { name: "Chapter3 home search", href: "https://chapter3realty.com/homes/map/" },
    { name: "Licensee Lookup", href: LOOKUP },
    { name: "Fred Nash Boulevard", href: ROAD },
    { name: "Register of Deeds", href: DEEDS },
  ],
  afterSources: () => CREDITS + PH.imageSchema([GC_PH]),
  sourcesNote: `The ${n0(FEATURES)} features and the share of pages with a row of homes are from our live home search and our sitemap. All were counted on ${PULL_DAY}. Listings are from the CCMLS through our home search.`,
  bottomCta: { h2: "Tell us the home you want.", p: `Call ${PHONE}, Monday to Friday, 9 a.m. to 6 p.m., or Saturday, 10 a.m. to 4 p.m. Or tell us here, and we send you the homes that fit.`, label: "Tell us what you want", href: ASK },
  keywords: "AI home search, why Chapter3 Realty, AI real estate search, search homes with AI, Myrtle Beach AI home search, Grand Strand real estate agents, Chapter3 AI, Myrtle Beach real estate company, free rental property calculator Myrtle Beach",
  about: "Chapter3 Realty, a real estate brokerage on the Grand Strand, South Carolina: its AI home search, its free calculators and the people behind them",
});
