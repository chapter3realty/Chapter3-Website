/* /buyers/relocating/ - relocating to Myrtle Beach: you can buy before you move. The seven steps of buying from
 * another state, which state guide is yours (the ten states most out-of-state buyers come from), and every moving
 * guide in one calm list, grouped by the question it answers.
 *
 * Batch 2026-11-b, Lane U. The live hub was hand-made HTML (no spec); this is its first spec, and it stays the
 * relocation hub (URL kept). Plan: Blog-Brain batches/2026-11-b/buyers-relocating/PLAN.md. Demand: must-answer.md.
 * Facts: facts.md, VERIFIED rows, and CORRECTED rows (7, 8, 15, 18, 20, 23) only in the verifier's wording
 * (VERIFY.md). Row 8 (horses) is not printed: the beaches page owns beach rules (review 1).
 * Struck wording: batches/2026-11-b/facts/buyers-relocating-struck.json.
 * Data, never typed (website working copy): data/2026-11-b/buyers-relocating/hub.json (the ten guide states, their
 * buyers and the road miles from each state's top source county) and data/2026-10-d/sell-out-of-state-buyers/
 * out-of-state-buyers.json (OSB 2 and 3: the share of buyers with a tax bill outside South Carolina). The spec
 * throws if a ledger value moves.
 * Design, as /sell/ and /submarkets/garden-city/ (owner-approved): the italic line at about half the H1's size,
 * one card style for the chart and the offers, plain lists under thin rules, one block width of 720 px, an offer
 * after about every second section, each tied to that section.
 * Kept from the live page: the searched words "Relocating to Myrtle Beach", the idea that you can buy before you
 * move, the remote purchase steps (rewritten from verified rows), links to every relocating guide and state page,
 * the phone button and the consent text word for word.
 * Cut (PLAN.md): the "Coming soon" search box, the orange band, the two FAQ blocks, the mistakes section, the
 * mortgage section and every lender line, the unrecorded couple story, every claim in the struck list.
 * Homes: the site's edge puts the move-in ready feed (idx-lib/feeds.js "/buyers/relocating/") under the opening.
 * The hub names no single place, so it carries no glass.js homes() strip.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));

const SELF = "/buyers/relocating/";
const DATA = path.join(__dirname, "..", "data");
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), "utf8"));
const HUB = read("2026-11-b/buyers-relocating/hub.json");
const OSB = read("2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json").summary;
const must = (ok, msg) => { if (!ok) throw new Error(`relocating.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const r10 = (v) => Math.round(v / 10) * 10;

/* ---- Rows 9 and 10 (OSB 2, 3): buyers whose tax bill goes outside South Carolina. ---- */
must(OSB.all.sales === 12125 && OSB.all.outside_sc === 3603, "row 9: the deed count moved");
const OUT_IN_10 = Math.round(OSB.all.outside_sc / OSB.all.sales * 10);
must(OUT_IN_10 === 3, "row 9: no longer about 3 in 10");
must(OSB.by_type.condo.outside_sc / OSB.by_type.condo.sales > 0.5, "row 10: condos no longer more than half");
/* hub.json leaves out the 5 buyers with a tax bill in another country (VERIFY.md, row 12): never print its outside_sc. */
must(HUB.deeds.outside_sc + OSB.where_counts.OTHER === OSB.all.outside_sc, "rows 9 and 12: hub.json and OSB no longer agree");

/* ---- Rows 11 to 14: the ten states with a moving guide. ---- */
const NAMES = { NC: "North Carolina", NY: "New York", PA: "Pennsylvania", NJ: "New Jersey", VA: "Virginia", MD: "Maryland", OH: "Ohio", MA: "Massachusetts", CT: "Connecticut", FL: "Florida" };
/* Row 14: the county names in the reader's words. Connecticut's "Capitol Planning Region" is the Hartford area. */
const COUNTY = { "Capitol Planning Region": "the Hartford area" };
const ROW11 = { NC: 916, NY: 438, PA: 376, NJ: 262, VA: 256, MD: 169, OH: 149, MA: 131, CT: 129, FL: 76 };
const ROW14 = { NC: 51, VA: 438, MD: 503, OH: 591, PA: 612, NJ: 636, FL: 693, NY: 747, CT: 792, MA: 842 };
const GS = [...HUB.guide_states].sort((a, b) => b.buyers - a.buyers);
must(GS.length === 10, "row 13: ten guide states");
for (const s of GS) {
  must(NAMES[s.state], `no name for ${s.state}`);
  must(s.buyers === ROW11[s.state], `row 11/12: ${s.state} buyers moved`);
  must(s.drive && s.drive.road_miles === ROW14[s.state], `row 14: ${s.state} miles moved`);
  must(fs.existsSync(path.join(__dirname, "..", "chapter3realty", "buyers", "relocating", `from-${s.slug}`, "index.html")), `no guide page for ${s.slug}`);
}
must(GS.reduce((t, s) => t + s.buyers, 0) === HUB.deeds.guide_states_buyers && HUB.deeds.guide_states_buyers === 2902, "row 13: 2,902 moved");
const GUIDE_IN_10 = Math.round(HUB.deeds.guide_states_buyers / OSB.all.outside_sc * 10);
must(GUIDE_IN_10 === 8, "row 13: no longer about 8 in 10");
must(GS[0].state === "NC" && GS[0].buyers > 2 * GS[1].buyers, "row 11: North Carolina no longer first by far");
const BRUNSWICK = GS[0];
must(BRUNSWICK.irs_top_county.county === "Brunswick County" && r10(BRUNSWICK.drive.road_miles) === 50, "row 15: Brunswick County moved");

/* The deed period, from the data file (never typed): "Oct 2025 - Sep 2026". */
const MON = { Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June", Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December" };
const per = HUB.sources.deeds.match(/(\w{3}) (\d{4}) - (\w{3}) (\d{4})/);
must(per && MON[per[1]] && MON[per[3]], "hub.json sources.deeds: no period");
const PERIOD = `${MON[per[1]]} ${per[2]} to ${MON[per[3]]} ${per[4]}`;

/* ---- V1: the ten states, one plain table under thin rules (rows 11 to 14). The buyers cell carries a thin bar, so the
   order reads at a glance; each state links to its guide; the miles name the county they are measured from. ---- */
const MAXB = GS[0].buyers;
const STATES = `<div class="rl-tw"><table class="rl-tab"><caption>North Carolina sends the most out-of-state buyers, by far<span class="k">Buyers in a year from each state, and the road miles to Myrtle Beach</span></caption>`
  + `<thead><tr><th scope="col">State</th><th scope="col">Buyers in a year</th><th scope="col">Road miles to Myrtle Beach</th></tr></thead><tbody>`
  + GS.map((s) => {
    const from = COUNTY[s.irs_top_county.county] || s.irs_top_county.county;
    return `<tr><th scope="row">${h.a(`/buyers/relocating/from-${s.slug}/`, NAMES[s.state])}</th>`
      + `<td><span class="l">Buyers in a year</span><span class="v">${n0(s.buyers)}</span><span class="bar" style="--f:${(s.buyers / MAXB).toFixed(3)}" aria-hidden="true"></span></td>`
      + `<td><span class="l">Road miles to Myrtle Beach</span><span class="v">about ${n0(r10(s.drive.road_miles))}</span><span class="u"> road miles</span><span class="z"> from ${from}</span></td></tr>`;
  }).join("")
  + `</tbody></table><p class="nt">Buyers: Horry County homes bought in a year by people with a tax bill in that state. Miles are by road from the middle of the county in that state that sends the most households here. Tap a state for its moving guide.</p></div>`;

/* ---- The photo: Garden City Beach from over the ocean (USGS, public domain; record from /invest/where-to-buy/, its
   parcels checked as Horry County tax district 610). Review 1: it sits under "Where should I live?" and its caption
   says what it shows (houses on the sand, the marsh behind), not a winter rule the 2011 summer photo cannot show. ---- */
const PH = require(path.join(BB, "tools", "photos.js"));
const PIER = read("2026-11-a/invest-where-to-buy/photos.json").photos.find((r) => r.file.endsWith("/garden-city-pier-and-beach-road-2011.webp"));
must(PIER && /tax district 610/.test(PIER.place.sublocation), "no photo record for the Garden City pier, or it is no longer in the county's part");
const PIER_CAP = "Garden City Beach from over the ocean in 2011: raised houses and condos along the sand, with the salt marsh behind them.";
const PIER_PHOTO = PH.heroPhoto(PIER, { alt: PIER.alt, caption: PIER_CAP, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.2rem 0 1.4rem;');
const CREDITS_NOTE = '<div role="listitem">Chapter3 Realty resized these photos and cropped some of them.</div>';
const CREDITS = PH.creditsList([{ photo: PIER, caption: "Garden City Beach from over the ocean" }]).replace(CREDITS_NOTE, "");

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const IRS = "https://www.irs.gov/statistics/soi-tax-stats-migration-data";
const ACS = "https://data.census.gov/table/ACSDT5Y2024.B25103?g=050XX00US45051";
const NORMALS = "https://www.ncei.noaa.gov/access/us-climate-normals/";
const TIDES = "https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070";
const BEACHES = "https://www.horrycountysc.gov/about-our-beaches";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const CODE = (t, c) => `https://www.scstatehouse.gov/code/t${t}c${c}.php`;
const DOE = "https://www.sccourts.org/media/opinions/HTMLFiles/SC/25508.htm";
const EAO = "https://www.scbar.org/for-lawyers/quicklinks/legal-resources/ethics-advisory-opinions/ethics-advisory-opinion-05-16/";
const DMV = "https://dmv.sc.gov/driver-services/moving-to-sc";
const TEL = "tel:+18543332135";
const LEAD = "#lead-form";

/* ---- The lead form: the live page's consent text word for word. ---- */
const CONSENT = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";
const LEAD_FORM = `<div id="ldWrap" class="rl-form">`
  + `<div class="idx-lead"><input class="idx-input" id="ldName" placeholder="Your name" aria-label="Your name" autocomplete="name"><input class="idx-input" id="ldPhone" placeholder="Phone" aria-label="Phone" type="tel" autocomplete="tel"></div>`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="ldEmail" placeholder="Email (optional)" aria-label="Email (optional)" type="email" autocomplete="email"></div>`
  + `<div class="idx-lead" style="grid-template-columns:1fr"><textarea class="idx-input" id="ldNote" rows="3" placeholder="Where you are moving from, and when (optional)" aria-label="Where you are moving from, and when (optional)"></textarea></div>`
  + `<label class="rl-consent"><input type="checkbox" id="ldConsent"><span>${CONSENT}</span></label>`
  + `<p id="ldErr" class="rl-err" role="alert"></p>`
  + `<button type="button" class="btn btn-brass btn-lg" onclick="ldSubmit()">Talk to us about your move</button>`
  + `<p class="rl-tel">Prefer to talk now?</p><a class="btn btn-outline rl-call" href="${TEL}">Call 854.333.2135</a></div>`
  + `<div id="ldOk" class="rl-ok">Thanks. A local agent will call you about your move.</div>`
  + `<script>function ldSubmit(){`
  + `var n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),em=document.getElementById('ldEmail').value.trim(),nt=document.getElementById('ldNote').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');`
  + `function fail(m){err.textContent=m;err.style.display='block';}err.style.display='none';`
  + `if(!n||!ph){fail('Add your name and a phone number so we can call you.');return;}`
  + `if(!c){fail('Check the consent box to send the request.');return;}`
  + `c3SendForm({name:n,phone:ph,email:em,message:'Relocation enquiry. '+nt,consent:c?'yes':'no'},'Relocating page');`
  + `document.getElementById('ldWrap').style.display='none';document.getElementById('ldOk').style.display='block';}</script>`;

/* ---- The page's own styles: one card style (the glass surface) for the chart and the offers; lists under thin
   rules; one block width of 720 px. Copied from /sell/ with this page's prefix. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226", BRASS = "#c4783a";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}`
  + `${S} .c3-gchart,${S} .rl-steps,${S} .rl-guides,${S} .rl-form{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  /* the steps: a plain numbered list under thin rules, a bold lead-in on each */
  + `${S} .rl-steps{list-style:none;counter-reset:st;margin:1.1rem 0 1.4rem;padding:0}`
  + `${S} .rl-steps li{counter-increment:st;position:relative;margin:0;padding:.8rem 0 .8rem 2.6rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .rl-steps li:last-child{border-bottom:${RULE}}`
  + `${S} .rl-steps li::before{content:counter(st);position:absolute;left:0;top:.85rem;width:1.8rem;height:1.8rem;border-radius:50%;background:${BRASS};color:#fff;font-family:var(--sans);font-weight:700;font-size:.95rem;display:flex;align-items:center;justify-content:center}`
  + `${S} .rl-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.15rem}`
  /* the state table: plain, under thin rules; on a phone each row is the state, then two cells side by side */
  + `${S} .rl-tw{max-width:720px;margin:1.3rem 0 1.4rem}`
  + `${S} .rl-tab{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .rl-tab caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem;font-size:1.08rem}`
  + `${S} .rl-tab thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .8rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .rl-tab tbody th{text-align:left;font-weight:600;padding:.65rem .9rem .65rem 0;border-bottom:${RULE};vertical-align:top;width:32%}`
  + `${S} .rl-tab td{padding:.65rem .8rem .65rem 0;border-bottom:${RULE};vertical-align:top;line-height:1.35}`
  + `${S} .rl-tab td .l{display:none}${S} .rl-tab .v{font-weight:600;font-variant-numeric:tabular-nums}`
  + `${S} .rl-tab .bar{display:block;height:6px;border-radius:3px;margin-top:.4rem;background:${BRASS};width:calc(100% * var(--f));min-width:4px}`
  + `${S} .rl-tab .z{display:block;color:var(--muted);font-size:.95rem;margin-top:.1rem}`
  + `${S} .rl-tw .nt{color:var(--muted);font-size:.95rem;line-height:1.55;margin:.7rem 0 0}`
  + `${S} .rl-tab caption .k{display:none}${S} .rl-tab .u{display:none}${S} .rl-tw .nt{max-width:620px}`
  + `@media (max-width:599px){${S} .rl-tab,${S} .rl-tab tbody,${S} .rl-tab caption{display:block;width:100%}`
  + `${S} .rl-tab caption .k{display:block;font-weight:400;color:var(--muted);font-size:.95rem;margin-top:.2rem}${S} .rl-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .rl-tab tr{display:block;padding:.6rem 0;border-bottom:${RULE}}`
  + `${S} .rl-tab th,${S} .rl-tab td{display:block;border:0!important;padding:0;width:auto!important}${S} .rl-tab td .l{display:none}`
  + `${S} .rl-tab td:nth-of-type(1){display:flex;align-items:center;gap:.7rem;margin-top:.25rem}${S} .rl-tab td:nth-of-type(1) .v{flex:0 0 2.6rem}${S} .rl-tab td:nth-of-type(1) .bar{margin:0;flex:0 0 auto;width:calc((100% - 3.3rem) * var(--f))}`
  + `${S} .rl-tab td:nth-of-type(2){color:var(--muted);font-size:.95rem;margin-top:.2rem}${S} .rl-tab td:nth-of-type(2) .v{font-weight:400}${S} .rl-tab td:nth-of-type(2) .u{display:inline}${S} .rl-tab td:nth-of-type(2) .z{display:inline;font-size:inherit;margin:0}}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  /* the guides: a plain list under thin rules, the link on top, one short fact under it where a row has one */
  + `${S} .rl-guides{list-style:none;margin:.6rem 0 1.4rem;padding:0}`
  + `${S} .rl-guides li{margin:0;padding:.7rem 0;border-top:${RULE};line-height:1.55;font-size:1.0625rem;color:var(--muted)}`
  + `${S} .rl-guides li:last-child{border-bottom:${RULE}}`
  + `${S} .rl-guides a{display:block;font-weight:600;font-family:var(--sans)}${S} .rl-guides span{display:block;margin-top:.2rem}${S} .rl-guides span a{display:inline;font-weight:inherit;font-family:inherit}`
  + `${S} section h3{margin-top:1.6rem}`
  /* the lead form */
  + `${S} .rl-form{margin:1.4rem 0 1rem;padding:1.4rem 1.3rem;border-radius:20px;background:linear-gradient(160deg,rgba(42,48,64,.96),rgba(28,32,40,.98));border:1px solid rgba(255,255,255,.14)}`
  + `${S} .rl-form .idx-lead{margin-bottom:.7rem}${S} .rl-form .idx-input{min-height:48px;font-size:1.0625rem;box-sizing:border-box;width:100%}${S} .rl-form textarea.idx-input{font-family:var(--sans);resize:vertical}`
  + `${S} .rl-consent{display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.875rem;color:rgba(244,239,232,.86);line-height:1.5;margin:.3rem 0 1rem;cursor:pointer}`
  + `${S} .rl-consent input{margin-top:.2rem;accent-color:${BRASS};flex-shrink:0;width:20px;height:20px}`
  + `${S} .rl-form .btn{width:100%;justify-content:center;min-height:50px;box-sizing:border-box}`
  + `${S} .rl-err{display:none;color:#ffb4a8;font-family:var(--sans);font-size:1rem;margin:0 0 .8rem}`
  + `${S} .rl-tel{color:rgba(244,239,232,.86);font-family:var(--sans);font-size:1rem;margin:.9rem 0 0}`
  + `${S} .rl-form a.rl-call{display:flex;align-items:center;margin-top:.6rem;color:var(--ivory);border:1px solid rgba(244,239,232,.55);background:transparent}`
  + `${S} .rl-ok{display:none;max-width:720px;margin:1.4rem 0 1rem;padding:1.3rem;border-radius:20px;background:var(--navy);color:var(--ivory);font-family:var(--sans);font-size:1.0625rem;line-height:1.6}`
  /* Work-arounds copied from /sell/: the feed's search row at 320 px, the header phone at 1000 to 1100 px, the slim
     offer bar starting where the text starts, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "@media (min-width:700px){main#main>section[style^=\"background:var(--navy)\"]:not(:last-child)>.wrap{margin-left:max(2rem,calc((100% - 1200px) / 2 + 2rem))!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys, and nothing on this page is legal advice.</p>`;

/* ---- V2: the seven steps of buying from another state (rows 16 to 24). ---- */
const STEPS = `<ol class="rl-steps">`
  + `<li><b>Pick the towns first.</b>Tell us how you want to live, and we narrow the search to the towns that fit. Start with our ${h.a("/buyers/relocating/which-town/", "13 towns near Myrtle Beach, compared")}.</li>`
  + `<li><b>See the houses.</b>We tour the homes you like for you, and we tell you what the listing photos do not show. If you want to see a house yourself, we plan the showings around your trip.</li>`
  + `<li><b>Know the insurance before you offer.</b>When you buy with us, we get an insurance quote for the address before you make an offer.</li>`
  + `<li><b>Offer from home.</b>Under ${h.ext(CODE(26, "006"), "South Carolina law")}, an electronic signature on a contract has the same effect as one in ink. You can sign the offer from anywhere.</li>`
  + `<li><b>Inspect.</b>A home inspection is ${h.ext(CODE(27, "050"), "the buyer's job")} in South Carolina. We line up the inspection.</li>`
  + `<li><b>Choose the closing attorney.</b>Every South Carolina home closing must be supervised by a ${h.ext(DOE, "South Carolina attorney")}. We work with several closing attorneys and can recommend them once we are working with you.</li>`
  + `<li><b>Sign the closing papers at home.</b>In a ${h.ext(EAO, "closing by mail")}, the papers are sent to you to sign and return. The attorney must be reachable by phone or email to explain them. You sign the deed or mortgage before a notary where you live, with two witnesses, and it ${h.ext(CODE(30, "005"), "is filed here")}. A lender may set its own signing rules.</li>`
  + `</ol>`;

/* ---- V3: every guide, grouped by the question it answers. A fact only where a verified row has one. ---- */
const guides = (items) => `<ul class="rl-guides">${items.map(([u, t, f]) => `<li>${h.a(u, t)}${f ? `<span>${f}</span>` : ""}</li>`).join("")}</ul>`;
const R = "/buyers/relocating/";
const GROUPS = [
  ["Is it the right move?", [
    [`${R}why-myrtle-beach/`, "Why so many people are moving to Myrtle Beach"],
    [`${R}pros-and-cons/`, "The honest pros and cons of living here year-round"],
    ["/buyers/retirees/", "Retiring to Myrtle Beach, and how the state taxes retirement income"],
    ["/buyers/55-plus-communities/", "55+ communities near Myrtle Beach, compared"],
  ]],
  ["Where should I live?", [
    [`${R}which-town/`, "13 towns near Myrtle Beach, compared"],
    ["/buyers/best-neighborhoods/", "The best neighborhoods, by what you love"],
    ["/submarkets/", "A guide to each part of the Grand Strand"],
  ]],
  ["What will it cost?", [
    [`${R}cost-of-living/`, "The cost of living, compared with your city"],
    ["/buyers/cost-to-own/", "What owning a home costs each month, line by line"],
    ["/buyers/property-taxes/", "Horry County property tax: 4% vs 6%", `A home you live in and apply for is taxed on 4 percent of its value, and ${h.a("/buyers/second-home/", "a second home")} or rental on 6 percent. The 4 percent rate is not automatic: you apply after you buy.`],
    ["/buyers/coastal-insurance/", "What home, wind and flood insurance cost here"],
  ]],
  ["Work, health care and school", [
    [`${R}jobs/`, "Who hires here, and what jobs pay", `About half of the buyers who come to us from the northern states arrive with a remote job.`],
    [`${R}healthcare/`, "Hospitals and health care near Myrtle Beach"],
    [`${R}schools/`, "How school zones, choice and registration work"],
  ]],
  ["Weather, storms and the beach", [
    [`${R}weather/`, "Myrtle Beach weather by month", `The ocean at Myrtle Beach averages the low 70s in October.`],
    [`${R}beaches/`, "Beach rules, town by town: dogs, tents, parking and golf carts", `From November 1 through February 28, golf carts with a valid state permit and a licensed driver may go on the beaches ${h.ext(BEACHES, "Horry County runs")}. Those are its unincorporated stretches outside the towns, which include the Horry County part of Garden City Beach.`],
    [`${R}hurricanes/`, "Every damaging hurricane since 1989"],
  ]],
  ["Getting here and getting around", [
    [`${R}getting-around/`, "The four road names to learn, and the airport in town"],
  ]],
  ["The move itself", [
    [`${R}moving-checklist/`, "Your first 45 days, in order", `When you move here for good, you have 45 days to get a South Carolina driver's license and 45 days to register your car here.`],
    ["/buyers/common-mistakes/", "The buyer mistakes that cost the most"],
  ]],
];
/* Review 1: the winter golf carts (row 7, the verifier's wording) are one line under the beaches guide, which owns
   beach rules; the state park's horse line (row 8) is left to that page (BUILD.md, for the lead). The photo of
   Garden City Beach sits under "Where should I live?". */
const GUIDE_LISTS = GROUPS.map(([q, items]) => h.h3(q) + guides(items) + (q.startsWith("Where") ? PIER_PHOTO : "")).join("");

/* Review 1: each answer adds what the steps do not say. The closing by mail is said in the short answer and in
   step 7, so it has no FAQ entry of its own. */
const FAQ = [
  { q: "Can I sign my closing papers on a video call?", a: "Not with a South Carolina notary. South Carolina law has no remote (video) notarization. Ask your closing attorney how you will sign." },
  { q: "Who picks the closing attorney?", a: "You do, when you buy with a home loan for personal or family use. The lender must ask which attorney you want for the closing and follow your choice." },
  { q: "Which state do most out-of-state buyers come from?", a: `North Carolina, by far. Our count of Horry County deeds over one year found ${n0(GS[0].buyers)} buyers with a tax bill in North Carolina. ${NAMES[GS[1].state]} was next, with ${n0(GS[1].buyers)}.` },
  { q: "Can I move to Myrtle Beach before I have a job here?", a: "Yes. Most of our buyers who move here find work within a month or two. That is our clients' experience, not a promise." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Buyers", url: "/buyers/" },
  title: "Relocating to Myrtle Beach: How to Buy Before You Move",
  description: "Relocating to Myrtle Beach: how to buy from another state, from an offer signed online to an attorney closing by mail, plus every moving guide by question.",
  ogTitle: "Relocating to Myrtle Beach: how to buy a home before you move, and every moving guide by question",
  crumb: "Relocating",
  eyebrow: "Moving to Myrtle Beach",
  h1: "Relocating to Myrtle Beach? You can buy before you move.",
  h1em: "How to buy from home, and every moving guide by question.",
  /* The one-line answer on the first phone screen (critic: the edge feed sits between the hero and the short answer). */
  sub: `When relocating to Myrtle Beach from another state, you can sign, inspect and close on a home from where you live now.`,
  heroMedia: CSS,
  heroCta: { title: "Moving here? Tell us where from and what you want.", label: "Plan my move with us", href: "/contact/" },
  author: "devin",
  shortAnswer: [
    `If you are relocating to Myrtle Beach, you can buy a home before you move. The offer can be signed electronically, and a South Carolina attorney may close by mail, so you do not have to be at the closing.`,
    `In the latest IRS count, about 15,000 households moved into Horry County in one year, and about 9,100 moved out. In Myrtle Beach, a January day averages a high of about 56 degrees. An owner who lives in the home here typically pays about $944 a year in property tax. Our guide to ${h.a(`${R}why-myrtle-beach/`, "why so many people move here")} gives the four reasons, with numbers.`,
  ],
  sections: [
    { h2: "Can I buy a house in Myrtle Beach before I move?", toc: "Buy before you move", id: "buy-before-you-move", html: (bg) =>
      h.p(`We do most of the work here while you stay where you are. These are the seven steps, in order.`) +
      STEPS +
      h.p(`You will not be the only buyer doing this from afar. About ${OUT_IN_10} in 10 homes sold in Horry County in the latest year went to a buyer whose tax bill goes to another state or country. For condos it was more than half.`) +
      h.p(`The market and ${h.a("/buyers/buying-in-myrtle-beach/#steps", "the steps to buy a house in South Carolina")} are in our buying guide. Still own a home where you live now? ${h.a("/sell/sell-or-buy-first/", "Sell first or buy first")} shows the three ways to time the two sales.`) +
      h.cta("Buying from another state? Send us the homes you like.", "We set up the showings, get the insurance quote before you offer, and keep the attorney and the papers on schedule while you are still at home.", "Send us the homes you like", "/contact/", bg) },

    { h2: "Which moving guide is for your state?", toc: "Your state", id: "your-state", html: () =>
      h.p(`About ${GUIDE_IN_10} in 10 out-of-state buyers here come from these ten states. Each state has its own moving guide.`) +
      STATES +
      h.p(`North Carolina's largest source of new households is next door: Brunswick County, which borders Horry County.`) +
      h.p(`Moving from somewhere else? Start with ${h.a(`${R}why-myrtle-beach/#where-from`, "where movers to Myrtle Beach come from")}.`) },

    { h2: "What should I know before moving to Myrtle Beach?", toc: "Every moving guide", id: "guides", html: (bg) =>
      h.p(`Each question below has its own guide. Where it helps, we give the one fact movers ask about first.`) +
      GUIDE_LISTS +
      h.cta("Not sure which town fits your move?", "Tell us how you want to live and where you will work. We send you the towns that fit, and the homes for sale in them.", "Have us pick towns for you", "/contact/", bg) },

    { h2: "Talk to a local agent about your move", toc: "Contact us", id: "lead-form", html: () =>
      h.p(`Leave your name and number. A licensed agent calls you to talk through the towns, the homes and the timing of your move.`) +
      LEAD_FORM },
  ],
  faqTitle: "Questions about relocating",
  faq: FAQ,
  sources: [
    { name: "IRS migration data", href: IRS },
    { name: "Census ACS", href: ACS },
    { name: "NOAA normals", href: NORMALS },
    { name: "NOAA tides", href: TIDES },
    { name: "Horry County beaches", href: BEACHES },
    { name: "Horry County deeds", href: DEEDS },
    { name: "SC Code 26-6", href: CODE(26, "006") },
    { name: "SC Code 27-50", href: CODE(27, "050") },
    { name: "SC Code 37-10", href: CODE(37, "010") },
    { name: "SC Code 30-5", href: CODE(30, "005") },
    { name: "SC Code 26-1", href: CODE(26, "001") },
    { name: "SC Code 12-43", href: CODE(12, "043") },
    { name: "Doe v. McMaster", href: DOE },
    { name: "SC Bar 05-16", href: EAO },
    { name: "SCDMV", href: DMV },
  ],
  sourcesNote: `Buyers: our count of Horry County deeds, ${PERIOD}, by tax bill address. Miles: by road from each state's top source county.`,
  afterSources: () => CREDITS + PH.imageSchema([PIER]) + LEGAL,
  bottomCta: { h2: "Moving to Myrtle Beach? Start with one call.", p: "Tell us where you are coming from and when. A local agent calls you back.", label: "Talk to us about your move", href: "/contact/" },
  keywords: "relocating to Myrtle Beach, relocating to Myrtle Beach SC, Myrtle Beach relocation guide, relocation realtor Myrtle Beach, buying a home in Myrtle Beach from out of state, buy a house before you move South Carolina, close by mail South Carolina",
  about: "Relocating to Myrtle Beach and Horry County, South Carolina",
});
