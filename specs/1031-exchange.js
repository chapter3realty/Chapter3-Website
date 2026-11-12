/* /invest/strategies/1031-exchange/ - a 1031 exchange in South Carolina: the federal rules the state follows, the
 * state's hold-back at closing for a seller who lives in another state and the Form I-295 exchange box, a worked
 * Myrtle Beach example, the 45 and 180 days with a date tool, the day-45 list, what an exchange can buy in Horry County,
 * a vacation condo, cash kept, the loan, and a reverse exchange.
 *
 * Batch 2026-11-b, Lane U. The live page was hand-made; this is its first spec. Plan: Blog-Brain
 * batches/2026-11-b/invest-strategies-1031-exchange/PLAN.md. Facts: facts.md in the same folder, VERIFIED rows, and
 * CORRECTED rows (1, 3, 18, 26, 30, 32, 34, 36, 37, 38, 39, 41, 43) only in the verifier's wording (VERIFY.md).
 * Struck wording: batches/2026-11-b/facts/invest-strategies-1031-exchange-struck.json. Never on this page: the LLC
 * sentences (rows 3, 18), "holds back nothing" for the intermediary route (row 43), any wording that the hold-back may
 * be spent on the replacement (row 10), any tie between a tax-bill address and the hold-back (row 39).
 * Data, never typed: data/2026-11-b/invest-strategies-1031-exchange/findings.json (the worked example, rows 43 and 2;
 * active listings counted in aggregate on the day in meta.listings_pulled, row 42; county resale prices, row 41;
 * buyers' tax-bill states, row 40; the date examples, row 44, which the date tool must reproduce).
 * Design, as /sell/net-proceeds/ and /submarkets/garden-city/ (owner-approved 2026-11-08): the italic line at about
 * half the H1's size, one card style for the chart, the date tool and the offers, plain tables and lists under thin
 * rules, one block width of 720 px, an offer after about every second section, each tied to that section.
 * Homes: the site's edge feed under the opening ("Rented now: income property from $400,000", idx-lib/feeds.js), and
 * two strips in "What can a 1031 exchange buy" (fix round 1; owner 2026-11-08: "horizontal idx listings is the
 * strongest tool we have"): 2 to 4 unit buildings, and condos. Their places (duplexes-around-myrtle-beach, condos-around-myrtle-beach) and
 * withStrips: true on this URL's feed are in Blog-Brain batches/2026-11-b/invest-strategies-1031-exchange/strips.patch
 * for the lead (idx-lib is outside this page's folder). Until it is applied the strips stay empty and take no space,
 * the offer card shows in their place, and the edge feed is left off this page (a page with slots needs withStrips).
 * Kept from the live page: the title's searched words, the plain names for the trade words, the steps with what we
 * do at each, the three identification rules, the return-date cutoff, the four stories, the reverse exchange and its
 * titleholder, the links out, the FAQ questions people search, the phone number.
 * Built by tools/mkpage.js. */
const fs = require("fs"), path = require("path");
const { h, BB } = require("./_kit.js");
const G = require(path.join(BB, "tools", "glass.js"));
const PK = require(path.join(BB, "tools", "page-kit.js"));
const PH = require(path.join(BB, "tools", "photos.js"));

const SELF = "/invest/strategies/1031-exchange/";
const DATA = path.join(__dirname, "..", "data", "2026-11-b", "invest-strategies-1031-exchange");
const F = JSON.parse(fs.readFileSync(path.join(DATA, "findings.json"), "utf8"));
const must = (ok, msg) => { if (!ok) throw new Error(`1031-exchange.js: ${msg}`); };
const n0 = (v) => Math.round(v).toLocaleString("en-US");
const money = (v) => "$" + n0(v);
const r10 = (v) => money(Math.round(v / 10) * 10);
const r100 = (v) => money(Math.round(v / 100) * 100);
const r1k = (v) => money(Math.round(v / 1000) * 1000);
const r5k = (v) => money(Math.round(v / 5000) * 5000);

/* ---- Rows 2 and 43: the worked example (constructed; the same sale as /sell/capital-gains/ and DST). ---- */
const EX = F.worked_example, IN = EX.inputs, PX = EX.partial_exchange;
must(IN.price === 400000 && IN.bought === 250000 && IN.depreciation === 60000 && IN.selling_costs === 24000 && IN.rate_2026 === 0.0521, "row 43: the example's inputs moved");
must(EX.amount_realized === 376000 && EX.gain === 186000 && EX.replacement_to_defer_all === 376000, "row 43: the amount realized or the gain moved");
must(Math.abs(EX.withhold_no_affidavit - 19589.6) < 0.01 && Math.abs(EX.withhold_affidavit_of_gain - 9690.6) < 0.01 && EX.withhold_full_exchange_paid_to_state === 0, "row 43: the hold-backs moved");
must(IN.boot_kept === 30000 && PX.replacement_cost === 346000 && PX.withhold_on_boot === 1563 && Math.abs(PX.sc_tax_on_boot_top_rate - 875.28) < 0.01, "row 43: the cash-kept case moved");
must(Math.abs(EX.sc_tax_full_sale_top_rate - 5426.74) < 0.01, "row 43: the state tax on the full sale moved");
must(Math.abs(IN.price * 0.06 - IN.selling_costs) < 0.01 && Math.abs(EX.amount_realized * IN.rate_2026 - EX.withhold_no_affidavit) < 0.01 && Math.abs(EX.gain * IN.rate_2026 - EX.withhold_affidavit_of_gain) < 0.01, "row 43: the arithmetic no longer holds");
const RATE = "5.21";
must((IN.rate_2026 * 100).toFixed(2) === RATE, "row 2: the 2026 rate is no longer 5.21 percent");
const PRICE = money(IN.price), NET = money(EX.amount_realized), GAIN = money(EX.gain), KEEP = money(IN.boot_kept);
must(r100(EX.withhold_no_affidavit) === "$19,600" && r100(EX.withhold_affidavit_of_gain) === "$9,700" && r10(PX.withhold_on_boot) === "$1,560" && r10(PX.sc_tax_on_boot_top_rate) === "$880" && r100(EX.sc_tax_full_sale_top_rate) === "$5,400", "row 43: the rounded figures in the copy moved");

/* ---- Rows 40 to 42: who buys here, what homes sold for, what is for sale now. ---- */
const BS = F.buyer_states_carried;
must(BS.by_type.condo.sales === 2402 && BS.by_type.condo.outside_sc === 1306 && Math.round(BS.by_type.condo.pct_outside_sc) === 54, "row 40: condo buyers moved");
const CONDO_BUYERS_OUT = Math.round(BS.by_type.condo.pct_outside_sc);
const RM = F.resale_medians_carried.county_all;
must(RM.resale_house.median === 350000 && RM.resale_condo.median === 215000, "row 41: the resale medians moved");
const L = F.listings_horry;
must(L.condo.horry === 2694 && L.condo.median === 215000 && L.condo.at_or_over_example === 471, "row 42: condos moved");
must(L.house.horry === 2929 && L.house.median === 420000 && L.house.at_or_over_example === 1720, "row 42: houses moved");
must(L.townhouse.horry === 307 && L.townhouse.median === 265000 && L.townhouse.at_or_over_example === 58, "row 42: townhouses moved");
must(L.multi.horry === 51 && L.multi.median === 680000 && L.multi.at_or_over_example === 44, "row 42: 2 to 4 unit buildings moved");
must(L.house.at_or_over_example > 3 * L.condo.at_or_over_example, "row 42: houses no longer far outnumber condos at the example price");
must(r5k(L.condo.median) === r1k(RM.resale_condo.median), "rows 41 and 42: condos no longer sell for about what they ask");
const PULLED = new Date(F.meta.listings_pulled);
must(!isNaN(PULLED), "findings.json meta.listings_pulled is not a date");
const PULL_DAY = PULLED.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/* ---- Rows 23, 24, 44: the date tool's arithmetic, one function run here against the ledger's examples and in the
   browser. Calendar days from the closing day; day 180 is cut short by the tax return's due date (April 15 of the next
   year for a person who files by the calendar year), and an extension keeps the full 180 days. No date is typed: the
   tool opens on today's date, read in the browser. ---- */
const CLOCK = "function xClock(y,m,d){var t=Date.UTC(y,m-1,d),day=86400000,a=new Date(t+45*day),b=new Date(t+180*day),r=Date.UTC(y+1,3,15);return{d45:a,d180:b,late:b.getTime()>r}}";
const xClock = new Function(CLOCK + "return xClock;")();
for (const ex of F.clock.examples) {
  const [y, m, d] = ex.closing.split("-").map(Number), c = xClock(y, m, d);
  must(c.d45.toISOString().slice(0, 10) === ex.day45 && c.d180.toISOString().slice(0, 10) === ex.day180, `row 44: the date tool disagrees with ${ex.closing}`);
}
{
  const [y, m, d] = F.clock.latest_closing_with_full_180_without_extension.split("-").map(Number);
  must(!xClock(y, m, d).late && xClock(y, m, d + 1).late, "row 24: the day after which an extension is needed moved");
}

/* ---- Links (each opened by the researcher and again by the verifier). ---- */
const SC8 = "https://www.scstatehouse.gov/code/t12c008.php";
const SC6 = "https://www.scstatehouse.gov/code/t12c006.php";
const DOR = "https://dor.sc.gov/news/information-about-h-4216";
const I295 = "https://dor.sc.gov/sites/dor/files/forms/I295.pdf";
const I290 = "https://dor.sc.gov/sites/dor/files/forms/I290.pdf";
const RR = "https://dor.sc.gov/sites/dor/files/policies/RR09-13.pdf";
const USC1031 = "https://www.law.cornell.edu/uscode/text/26/1031";
const USC6072 = "https://www.law.cornell.edu/uscode/text/26/6072";
const REG = "https://www.law.cornell.edu/cfr/text/26/1.1031(k)-1";
const TIPS = "https://www.irs.gov/businesses/small-businesses-self-employed/like-kind-exchanges-real-estate-tax-tips";
const I8824 = "https://www.irs.gov/instructions/i8824";
const RP0816 = "https://www.irs.gov/irb/2008-10_IRB";
const RP1858 = "https://www.irs.gov/irb/2018-50_IRB";
const HELENE = "https://www.irs.gov/newsroom/irs-announces-tax-relief-for-victims-of-hurricane-helene-in-south-carolina-various-deadlines-postponed-to-may-1-2025";
const RP0037 = "https://www.irs.gov/irb/2000-40_IRB";
const RR0486 = "https://www.irs.gov/irb/2004-33_IRB";
const DEEDS = "https://acclaimweb.horrycounty.org/AcclaimWeb/search/SearchTypeDocType";
const ASK = "/contact/";

/* ---- The photo (record in data/2026-11-b/invest-strategies-1031-exchange/photos.json: the USGS 2011 oblique aerial that
   /invest/where-to-buy/ shows, public domain, looked at full size by that page's writer). It shows the two kinds of home
   the section counts, condo towers and beach houses on one block, beside that sentence. Its caption says only what it shows. ---- */
const PHOTOS = JSON.parse(fs.readFileSync(path.join(DATA, "photos.json"), "utf8")).photos;
const BLOCK = PH.findPhoto(PHOTOS, "north-myrtle-beach-towers-and-houses-2011");
const BLOCK_CAP = "Condo towers and beach houses on the same oceanfront block in North Myrtle Beach.";
const BLOCK_PHOTO = PH.heroPhoto(BLOCK, { alt: BLOCK.alt, caption: BLOCK_CAP, maxWidth: "720px", sizes: "(max-width: 760px) 100vw, 720px" })
  .replace(' fetchpriority="high" decoding="async"', ' loading="lazy" decoding="async"').replace('<figure class="c3ph-hero" style="', '<figure class="c3ph-hero" style="margin:1.3rem 0 1.5rem;');
const CREDITS = PH.creditsList([{ photo: BLOCK, caption: "Condo towers and beach houses in North Myrtle Beach" }]);

/* ---- The glance row under the H1 (rows 2, 7, 23). ---- */
const GLANCE = PK.glance([
  { icon: "calendar", label: "45 and 180 days", text: "to name the next property, and to own it" },
  { icon: "tax", label: `${RATE}%`, text: "the state's hold-back rate on a 2026 sale" },
  { icon: "key", label: "Form I-295", text: "the state form with the exchange boxes" },
]);

/* ---- V1: what goes to the state in the example (row 43, the verifier's wording). ---- */
const HOLD_CHART = G.bars([
  { name: "No form: held back at closing", value: EX.withhold_no_affidavit, valueText: r100(EX.withhold_no_affidavit) },
  { name: "Form I-295 stating your gain: held back at closing", value: EX.withhold_affidavit_of_gain, valueText: r100(EX.withhold_affidavit_of_gain) },
  { name: `Exchange keeping ${KEEP} cash: sent later`, value: PX.withhold_on_boot, valueText: r10(PX.withhold_on_boot) },
  { name: "Full exchange, finished, through an intermediary", value: 0, valueText: "$0" },
], {
  caption: `About what goes to South Carolina when an owner from another state sells a ${PRICE} condo`,
  nameLabel: "How you sell", valueLabel: "Paid to South Carolina",
  note: "The example above, sold in 2026. Money held back beyond your state tax comes back to you.",
});

/* ---- V2: the date tool, which is also the timeline. It opens on today's date (read in the browser). The script
   lives in a template string: no backslash escapes in it (VERDICTS 2026-10-26). ---- */
/* The 180 days drawn to scale, once for a phone and once for a wide screen, so the words stay 15 px: the first 45 days
   in brass (name it), the other 135 in a lighter brass (own it by day 180). */
const lineSvg = (W, fs, cls) => {
  const y = Math.round(fs * 2.2), bh = Math.round(fs * 0.75), x45 = Math.round(W * 45 / 180), H = y + bh + Math.round(fs * 2.1);
  const t = (x, a, txt, yy, w) => `<text x="${x}" y="${yy}" text-anchor="${a}" font-size="${fs}"${w ? ` font-weight="${w}"` : ""} fill="#1c2028">${txt}</text>`;
  return `<svg class="${cls}" viewBox="0 0 ${W} ${H}" role="img" aria-label="The 180 days to scale: from day 0, when your sale closes, you have 45 days to name the replacement, then until day 180 to own it." font-family="DM Sans, system-ui, sans-serif">`
    + t(0, "start", "Day 0", Math.round(fs * 1.2), 700) + t(x45, "middle", "Day 45", Math.round(fs * 1.2), 700) + t(W, "end", "Day 180", Math.round(fs * 1.2), 700)
    + `<rect x="0" y="${y}" width="${W}" height="${bh}" rx="${Math.round(bh / 2)}" fill="#c4783a" fill-opacity=".3"/>`
    + `<rect x="0" y="${y}" width="${x45}" height="${bh}" rx="${Math.round(bh / 2)}" fill="#c4783a"/>`
    + `<rect x="${x45 - 1}" y="${y - 4}" width="2" height="${bh + 8}" fill="#1c2028"/>`
    + t(Math.round(x45 / 2), "middle", "Name it", y + bh + Math.round(fs * 1.5)) + t(Math.round((x45 + W) / 2), "middle", "Own it by day 180", y + bh + Math.round(fs * 1.5))
    + `</svg>`;
};
const stop = (cls, day, what) => `<li class="${cls}"><span class="dn">${day}</span><span class="dt" id="xo${cls}">&nbsp;</span><span class="dw">${what}</span></li>`;
const CLOCK_TOOL = `<div class="ex-card ex-clock" role="group" aria-labelledby="xcT">`
  + `<p class="k" id="xcT">Your 1031 dates</p>` + lineSvg(320, 15, "ex-n") + lineSvg(640, 15, "ex-w")
  + `<div class="ex-in"><label for="xcDay">The day your sale closes</label><input id="xcDay" type="date" oninput="xcGo()" onchange="xcGo()"></div>`
  + `<ol class="ex-line" aria-live="polite">`
  + stop("d0", "Day 0", "Your sale closes. The money goes to your intermediary.")
  + stop("d45", "Day 45", "Your signed list of possible replacements is due.")
  + stop("d180", "Day 180", "You must own the new property.")
  + `</ol>`
  + `<p class="ex-warn" id="xcWarn" hidden>Your tax return is due on April 15, before day 180. File an extension to keep the full 180 days.</p>`
  + `<p class="n">For a person who files a tax return for the calendar year.</p></div>`
  + `<script>${CLOCK}function xcFmt(t){return t.toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric",year:"numeric",timeZone:"UTC"})}`
  + `function xcGo(){var i=document.getElementById("xcDay");if(!i||!i.value)return;var p=i.value.split("-").map(Number);if(p.length<3||!p[0])return;`
  + `var c=xClock(p[0],p[1],p[2]),s=function(id,t){var e=document.getElementById(id);if(e)e.textContent=t};`
  + `s("xod0",xcFmt(new Date(Date.UTC(p[0],p[1]-1,p[2]))));s("xod45",xcFmt(c.d45));s("xod180",xcFmt(c.d180));`
  + `var w=document.getElementById("xcWarn");if(w)w.hidden=!c.late}`
  + `document.addEventListener("DOMContentLoaded",function(){var i=document.getElementById("xcDay");if(!i)return;if(!i.value){var n=new Date();`
  + `i.value=n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0")}xcGo()})</script>`;

/* ---- V3: what is for sale in Horry County now (row 42), a real table that folds on a phone. ---- */
const KINDS = [["Condos", L.condo], ["Houses", L.house], ["Townhouses", L.townhouse], ["Buildings with 2 to 4 units", L.multi]];
const kindRow = ([name, k]) => `<tr><th scope="row">${name}</th><td><span class="l">For sale</span>${n0(k.horry)}</td>`
  + `<td><span class="l">Middle ask</span>${r5k(k.median)}</td><td><span class="l">Asking ${NET} or more</span>${n0(k.at_or_over_example)}</td></tr>`;
const FOR_SALE = `<div class="ex-tw"><table class="ex-tab"><caption>Homes for sale in Horry County, our count on ${PULL_DAY}. Asking prices are rounded.</caption>`
  + `<thead><tr><th scope="col">Kind of home</th><th scope="col">For sale</th><th scope="col">Middle asking price</th><th scope="col">Asking ${NET} or more</th></tr></thead>`
  + `<tbody>${KINDS.map(kindRow).join("")}</tbody></table></div>`;

/* ---- The homes strips (fix round 1). The places are in strips.patch for the lead (Blog-Brain batch folder): a
   25-mile "near" search around Myrtle Beach, the largest a place may ask (idx-lib/edge.js placeParams), one by type.
   Live map search 2026-11-09: 58 buildings with 2 to 4 units and 2,830 condos in that circle, from Pawleys Island to
   Longs and Conway. A place cannot ask for a price floor, so the titles name only the kind of home and the area.
   The condo strip's fallback is the section's offer card, shown only while the strip is empty. ---- */
const MULTI_STRIP = G.homes("duplexes-around-myrtle-beach", "the Myrtle Beach area", "", "Duplexes, triplexes and fourplexes for sale around Myrtle Beach");
const CONDO_STRIP = { slug: "condos-around-myrtle-beach", name: "the Myrtle Beach area", head: "Condos for sale around Myrtle Beach" };

/* ---- The page's own styles. One card style (the glass surface of the chart and the offers) for the chart, the date
   tool and the offers; tables and lists sit on the page under thin rules. As /sell/net-proceeds/. ---- */
const S = "main#main", RULE = "1px solid rgba(28,32,40,.16)", INK = "#8a5226", BRASS = "#c4783a";
const SURF = "background:linear-gradient(180deg,rgba(255,255,255,.76),rgba(255,255,255,.52));border:1px solid var(--g-edge,rgba(255,255,255,.8));box-shadow:var(--g-hi,inset 0 1px 0 rgba(255,255,255,.9)),var(--g-sh,0 10px 26px -18px rgba(28,32,40,.35))";
const FLAT = "background:none!important;border:0!important;box-shadow:none!important;border-radius:0!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important";
const CSS = "<style>"
  /* the contents list: no card, in columns between two thin rules */
  + `${S} nav[aria-label="On this page"]{${FLAT};border-top:${RULE}!important;border-bottom:${RULE}!important;padding:.8rem 0 .5rem!important}`
  + `${S} nav[aria-label="On this page"] ul{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:1.5rem}`
  + `@media (min-width:700px){${S} nav[aria-label="On this page"] ul{grid-template-columns:repeat(3,minmax(0,1fr))}}`
  /* the headline: the italic line at about half the H1's size; the hero sub is said by the short answer */
  + `${S} .detail-h1{text-wrap:balance}${S} .detail-h1 em{display:block;font-size:clamp(1.3rem,2.5vw,2.25rem);line-height:1.25;margin-top:.55rem;text-wrap:balance}`
  + `@media (max-width:959px){${S} .detail-h1 em{color:${INK}!important}}${S} .detail-hero .detail-sub{display:none}`
  /* the hero tiles: glass tiles on a wide screen, short rows under rules on a phone */
  + `${S} .c3-glance li{line-height:1.4}${S} .c3-glance strong{font-size:1.1rem!important;font-weight:700;line-height:1.25}${S} .c3-glance span.t{font-size:.95rem!important;line-height:1.4!important}`
  + `@media (max-width:699px){${S} .c3-glance{grid-template-columns:1fr!important;gap:0!important}${S} .c3-glance li{${FLAT};border-top:${RULE}!important;flex-direction:row!important;text-align:left!important;justify-content:flex-start!important;align-items:center!important;gap:.7rem!important;padding:.55rem 0!important}${S} .c3-glance li:last-child{border-bottom:${RULE}!important}}`
  /* one block width */
  + `${S} .c3-gchart,${S} .ex-tw,${S} .ex-card,${S} .ex-plain,${S} .ex-steps{max-width:720px!important;box-sizing:border-box}`
  + `${S} div[style^="border-left:3px solid var(--brass)"] a.btn{font-size:1.02rem;padding:.85rem 1.4rem;min-height:48px}`
  + `${S} h2,${S} h3,${S} a.btn{text-wrap:balance}`
  /* the photo sits on the page: the picture and its caption, no card around it */
  + `${S} figure.c3ph-hero{${FLAT};padding:0!important;max-width:720px}${S} figure.c3ph-hero .c3ph-f{border-radius:14px!important}${S} figure.c3ph-hero figcaption{padding:0!important;font-size:.95rem}`
  /* the chart: one message, the amount at the end of each bar */
  + `${S} .c3-gchart .v{font-weight:600}`
  /* tables: plain, under thin rules */
  + `${S} .ex-tw{margin:1.3rem 0 1.4rem}`
  + `${S} .ex-tw table{width:100%;border-collapse:collapse;font-family:var(--sans);font-size:1.0625rem;color:var(--navy)}`
  + `${S} .ex-tw caption{text-align:left;font-weight:600;line-height:1.4;padding:0 0 .7rem}`
  + `${S} .ex-tw thead th{font-size:.95rem;font-weight:600;text-align:left;padding:0 .5rem .5rem 0;border-bottom:1px solid rgba(28,32,40,.3);vertical-align:bottom}`
  + `${S} .ex-tw tbody th{text-align:left;font-weight:600;padding:.65rem .8rem .65rem 0;border-bottom:${RULE};line-height:1.35;vertical-align:top}`
  + `${S} .ex-tw td{padding:.65rem .5rem .65rem 0;border-bottom:${RULE};vertical-align:top;font-variant-numeric:tabular-nums;white-space:nowrap}`
  + `${S} .ex-tw td .l{display:none}`
  + `@media (max-width:599px){${S} .ex-tab,${S} .ex-tab tbody,${S} .ex-tab caption{display:block;width:100%}`
  + `${S} .ex-tab thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}`
  + `${S} .ex-tab tr{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));column-gap:.8rem;align-items:end;padding:.7rem 0;border-bottom:${RULE}}`
  + `${S} .ex-tab th,${S} .ex-tab td{border:0;padding:0}${S} .ex-tab tbody th{grid-column:1/-1;padding-bottom:.35rem}`
  + `${S} .ex-tab td{white-space:normal}${S} .ex-tab td .l{display:block;font-size:.875rem;color:var(--muted);line-height:1.3;margin-bottom:.1rem}}`
  /* the date tool: the same glass card as the chart and the offers */
  + `${S} .ex-card{margin:1.3rem 0 1.5rem;padding:1.2rem 1.3rem 1.1rem;border-radius:20px;${SURF};font-family:var(--sans);color:var(--navy)}`
  + `${S} .ex-card .k{font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;color:${INK};font-weight:700;margin:0 0 .7rem}`
  + `${S} .ex-in{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem 1rem;padding:0 0 1rem;margin:0 0 .3rem;border-bottom:${RULE}}`
  + `${S} .ex-in label{font-size:1.0625rem;font-weight:600;color:var(--navy)}`
  + `${S} .ex-in input{min-height:46px;box-sizing:border-box;background:#fff;border:1px solid rgba(28,32,40,.28);border-radius:10px;color:var(--navy);font-family:var(--sans);font-size:1.05rem;padding:.4rem .7rem}`
  + `${S} svg.ex-n{display:block;width:100%;height:auto;max-width:360px;margin:0 0 1rem}${S} svg.ex-w{display:none;width:100%;height:auto;max-width:640px;margin:0 0 1rem}`
  + `@media (min-width:600px){${S} svg.ex-n{display:none}${S} svg.ex-w{display:block}}`
  + `${S} .ex-line{list-style:none;margin:0;padding:0}`
  + `${S} .ex-line li{display:grid;grid-template-columns:5.2rem minmax(0,1fr);column-gap:1rem;padding:.8rem 0 .8rem 1.4rem;border-bottom:${RULE};position:relative;margin:0}`
  + `${S} .ex-line li::before{content:"";position:absolute;left:.2rem;top:1.15rem;width:.65rem;height:.65rem;border-radius:50%;background:${BRASS}}`
  + `${S} .ex-line li::after{content:"";position:absolute;left:.48rem;top:1.9rem;bottom:-1.2rem;width:2px;background:rgba(196,120,58,.35)}`
  + `${S} .ex-line li:last-child::after{display:none}${S} .ex-line li:last-child{border-bottom:0}`
  + `${S} .ex-line .dn{grid-row:1/3;font-weight:700;font-size:1.0625rem;line-height:1.5}`
  + `${S} .ex-line .dt{font-family:var(--serif);font-size:1.35rem;line-height:1.3;color:var(--navy)}`
  + `${S} .ex-line .dw{color:var(--muted);font-size:1rem;line-height:1.5}`
  + `${S} .ex-warn{margin:.6rem 0 0;padding:.75rem .9rem;border-radius:12px;background:rgba(196,120,58,.12);color:var(--navy);font-size:1rem;line-height:1.5}`
  + `${S} .ex-warn[hidden]{display:none}${S} .ex-card .n{margin:.8rem 0 0;color:var(--muted);font-size:.95rem;line-height:1.5}`
  + `@media (max-width:420px){${S} .ex-line li{grid-template-columns:1fr}${S} .ex-line .dn{grid-row:auto}}`
  /* short facts: a plain list under thin rules, a bold lead-in on each */
  + `${S} .ex-plain{list-style:none;margin:1.1rem 0 1.4rem;padding:0}${S} .ex-plain li{margin:0;padding:.8rem 0;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .ex-plain li:last-child{border-bottom:${RULE}}${S} .ex-plain b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* numbered steps: the same list, with the step's number in brass */
  + `${S} .ex-steps{list-style:none;counter-reset:xs;margin:1.1rem 0 1.4rem;padding:0}`
  + `${S} .ex-steps li{counter-increment:xs;position:relative;margin:0;padding:.8rem 0 .8rem 2.6rem;border-top:${RULE};color:var(--muted);line-height:1.6;font-size:1.0625rem}`
  + `${S} .ex-steps li:last-child{border-bottom:${RULE}}${S} .ex-steps li::before{content:counter(xs);position:absolute;left:0;top:.8rem;width:1.8rem;height:1.8rem;border-radius:50%;background:rgba(196,120,58,.14);color:${INK};font-family:var(--sans);font-weight:700;font-size:1rem;line-height:1.8rem;text-align:center}`
  + `${S} .ex-steps b{display:block;color:var(--navy);font-family:var(--sans);font-size:1.08rem;line-height:1.35;margin-bottom:.2rem}`
  /* Work-arounds copied from /sell/net-proceeds/: the feed's search row at 320 px, the header phone at 1000 to
     1100 px, and the closing band kept dark. */
  + "@media (max-width:379px){main#main .hx-fb,main#main .hx-fb>*{min-width:0;max-width:100%}main#main .hx-fb-ai,main#main .hx-fb-q{min-width:0!important;max-width:100%!important;flex-wrap:wrap;box-sizing:border-box}main#main .hx-fb-q textarea{min-width:0;flex:1 1 100%;width:100%}main#main .hx-fb-go{flex:1 1 100%}}"
  + "@media (min-width:1000px) and (max-width:1100px){.header-ctas .hdr-phone{display:none!important}}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2){padding:.9rem 0!important}"
  + "main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{display:block!important;text-align:center!important;background:linear-gradient(160deg,rgba(42,48,64,.95),rgba(28,32,40,.97))!important;border:1px solid rgba(255,255,255,.14)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.14),0 26px 60px -30px rgba(28,32,40,.6)!important;border-radius:28px!important;padding:2.2rem 1.6rem!important;margin-left:auto!important;margin-right:auto!important}"
  + "@media (max-width:699px){main#main>section[style^=\"background:var(--navy)\"]:has(>.wrap>h2)>.wrap{padding:1.6rem 1.2rem 1.7rem!important;border-radius:24px!important}}"
  + "</style>";

const plain = (items) => `<ul class="ex-plain">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ul>`;
const steps = (items) => `<ol class="ex-steps">${items.map(([b, t]) => `<li><b>${b}</b>${t}</li>`).join("")}</ol>`;
const LEGAL = `<p style="font-size:.78rem;color:var(--muted);line-height:1.7;max-width:760px;margin-top:1rem"><strong style="color:var(--navy)">Legal notice.</strong> Chapter3 Realty Corp is a licensed South Carolina real estate brokerage. We are not attorneys or tax advisers, and nothing on this page is legal or tax advice. Your qualified intermediary and your tax adviser confirm the exchange.</p>`;

/* The FAQ repeats only questions the page answers, said short and in other words. Plain characters only. */
const FAQ = [
  { q: "Does a 1031 exchange have to be in the same state?", a: "No. The rules are federal. Real property in the United States is generally like-kind to other US real property if both are held for business or investment. A rental in another state can be traded for one here." },
  { q: "Can I 1031 exchange into a home I will live in?", a: "Not one you only live in. A beach condo you rent out and also use can qualify when it passes the IRS rental test described on this page." },
  { q: "Can I do a 1031 exchange with a family member, such as a parent or a child?", a: "Yes, with a limit. It covers a spouse, parent, grandparent, child, grandchild, brother or sister, and a company you control. If either of you sells the property you got within two years, the deferred gain is taxed. There are a few exceptions, such as a death." },
  { q: "Does South Carolina tax the gain later?", a: "Yes. The state follows the federal rules, so the gain you put off is taxed when you sell without exchanging. South Carolina deducts 44 percent of a net capital gain and taxes the rest." },
  { q: "Is a company that sells a condo held back too?", a: "Yes. For a corporation the rate is 5 percent. A business seller can be treated as a resident on Form I-295 if it meets four tests. It has done business in South Carolina for the last two tax years and will keep doing it. It is registered here and has filed a South Carolina return with none overdue." },
  { q: "Can I exchange into a DST?", a: "Yes. A share of a Delaware statutory trust can be the replacement if the trust stays inside the IRS ruling's limits and the other 1031 rules are met." },
  { q: "Who reports a 1031 exchange to the IRS?", a: "You do, on IRS Form 8824 with your tax return for the year of the exchange." },
];

module.exports = G.page({
  theme: "glass",
  url: SELF,
  hub: { name: "Strategies", url: "/invest/strategies/" },
  title: "1031 Exchange in South Carolina: Rules, 45/180 Days, I-295",
  description: `1031 exchange in South Carolina: the 45 and 180 day rules, the Form I-295 box for the ${RATE}% hold-back, a Myrtle Beach example, a date tool and what to buy.`,
  /* Our own share card (tools/ogcard.js, run on a copy of this page), kept in this page's image folder. */
  ogImage: "https://chapter3realty.com/images/2026-11-b/invest-strategies-1031-exchange/share.jpg",
  ogImageAlt: "1031 exchange in South Carolina: the rules, the 45 and 180 days, and the state's hold-back. Sell from another state, and one box on Form I-295 sends the state's 5.21% hold-back to your intermediary.",
  ogTitle: "1031 exchange in South Carolina: the 45 and 180 days, the state's hold-back and Form I-295, and what an exchange buys here",
  crumb: "1031 Exchange",
  eyebrow: "Tax strategy",
  h1: "1031 exchange in South Carolina: the 45 and 180 days, and the state's hold-back",
  h1em: `Sell from another state, and one box on Form I-295 sends the state's ${RATE}% hold-back to your intermediary.`,
  /* Required by mkpage; hidden by the page's style, since the short answer says it. */
  sub: `South Carolina follows the federal 1031 rules. A seller who lives in another state meets one state step at closing: the ${RATE} percent hold-back and Form I-295.`,
  heroMedia: CSS + G.homesCss() + GLANCE,
  heroCta: { title: "Plan the exchange with us before you list.", label: "Plan my exchange", href: ASK },
  author: "devin",
  shortAnswer: [
    `A 1031 exchange works in South Carolina under the federal rules. Name the replacement within 45 days of your sale, and own it within 180 days.`,
    `If your permanent home is in another state, the buyer must hold back part of the price for state income tax, unless the sale is exempt. Tick the exchange box on Form I-295 and use a qualified intermediary, a neutral company that holds the sale money. The hold-back then goes to the intermediary, and the state is paid nothing if you finish the exchange.`,
  ],
  sections: [
    { h2: "Does a 1031 exchange work in South Carolina?", toc: "South Carolina", id: "south-carolina", html: () =>
      h.p(`Yes. South Carolina's income tax ${h.ext(SC6, "uses the federal tax code")}, including section 1031, the exchange rule. A seller from any state uses the same exchange here.`) +
      h.p("In a 1031 exchange, you sell one rental or investment property, buy another, and put off the tax on the profit. The tax comes due when you later sell without exchanging. A trade counts when it meets three rules:") +
      plain([
        ["What qualifies", `Real property held for business or investment, ${h.ext(USC1031, "traded for like-kind real property")} held the same way. Real property in the United States is generally like-kind to other US real property, improved or not. A rental condo for a rental house counts, and so does land for a duplex. A house bought mainly to resell, a flip, does not.`],
        ["Who holds the money", `You may not touch the money between the sale and the purchase. If it is credited to your account or set aside so you can draw on it, you have received it. A qualified intermediary, a neutral company, can hold it under a written agreement that limits your right to it. That is ${h.ext(REG, "one of the setups the IRS rules accept")}, so the money does not count as yours.`],
        ["Who cannot hold it", "Your real estate agent, attorney, accountant or employee of the past two years cannot be your qualified intermediary. The exception is one whose only work was on 1031 exchanges or routine title, escrow or bank services. Close relatives cannot hold it either. Chapter3 is your agent, so a separate company you choose holds the money."],
      ]) +
      h.p(`The forms call the property you sell the relinquished property, and the one you buy the replacement property. ${h.a("/invest/strategies/", "Our investment strategies guide")} compares the exchange with the other ways investors buy here.`) },

    { h2: "How does a 1031 exchange keep South Carolina's hold-back from going to the state?", toc: "The hold-back", id: "withholding", html: () =>
      h.p(`When the seller's permanent home is outside South Carolina, the buyer must ${h.ext(SC8, "hold back part of the price")} for South Carolina income tax, unless the sale is exempt. For a sale closed in 2026, the rate is ${h.ext(DOR, `${RATE} percent`)}, the state's top individual rate for the year.`) +
      h.p(`${h.ext(I295, "Form I-295")} is the seller's sworn statement to the buyer. If it states your gain, the buyer holds back ${RATE} percent of the gain. Without it, the buyer holds back ${RATE} percent of the price less your selling costs. A seller that is a corporation is withheld at 5 percent instead. The amount is never more than the cash due to you at closing.`) +
      h.h3("Why an exchange changes the hold-back") +
      h.p(`A tax-deferred exchange is not a "sale" for this rule. The Department of Revenue counts a 1031 exchange as exempt. ${h.ext(RR, "Its ruling")} still requires the hold-back when the replacement has not been named at the time of the sale. For an exchange that is not on the same day, it gives two ways to handle it.`) +
      h.h3("The exchange boxes on Form I-295") +
      h.p("The form has three exchange boxes. Tick the one that fits your trade:") +
      plain([
        ["A swap on the same day", "You trade one property for the other at one closing and put off the whole gain. The buyer holds back only on gain the form says will be taxed."],
        ["An exchange where you keep some cash", "Part of the gain will be taxed, and you enter that gain on the form."],
        ["An exchange through a qualified intermediary", "You put off the gain using an intermediary and have followed the state's steps for it, in Revenue Ruling #09-13."],
      ]) +
      h.h3("What happens when you tick the intermediary box") +
      steps([
        ["You sign Form I-295 before a notary", "You give it to the buyer and keep a copy with your tax records. It is not sent to the state unless the state asks for it."],
        ["Form I-290 is filled in as if the sale were taxed", "Form I-290 is the form that pays the hold-back to the state. It goes to your intermediary at closing, with the amount needed to pay the hold-back."],
        ["The buyer and the intermediary sign a contract", "The intermediary files Form I-290 and pays the hold-back for the buyer if the exchange fails. The buyer remains liable for the payment."],
        ["If the exchange fails, the intermediary pays", "It pays by the 15th of the month after the failure is clear. That is the day the exchange is given up or its time runs out, whichever comes first."],
        ["If you finish the exchange, the state is paid nothing", "Form I-290 is never filed."],
      ]) +
      h.p(`There is a second way. You can pay the hold-back from other money, so the whole sale goes into the exchange. The buyer sends it to the state, and you ask for it back once the exchange is complete.`) +
      h.p(`Money held back beyond your tax comes back by ${h.ext(I290, "an amended Form I-290")} before your tax year ends. After that, it is a credit on your South Carolina return. ${h.a("/sell/capital-gains/", "Our capital gains guide")} has the refund steps.`) +
      h.p("Before the buyer signs, we tell the closing attorney's office and your intermediary that the sale is an exchange. The form and the dates are then in place on closing day.") },

    { h2: `What does South Carolina hold back when you exchange a ${PRICE} condo?`, toc: "Example", id: "example", html: (bg) =>
      h.p(`Example. An owner who lives in another state sells a Myrtle Beach rental condo for ${PRICE} in 2026. They bought it for ${money(IN.bought)}, took ${money(IN.depreciation)} of depreciation and pay 6 percent to sell.`) +
      h.p(`The price less selling costs is ${NET}, and the gain is ${GAIN}.`) +
      HOLD_CHART +
      h.p(`Without an exchange, the state tax on this gain is about ${r100(EX.sc_tax_full_sale_top_rate)} at the top rate. The rest of a hold-back comes back once you file. To put off all of the tax, the next property costs ${NET} or more.`) +
      h.p(`The depreciation you took is part of the gain. ${h.a("/invest/rental-depreciation/", "Our rental depreciation guide")} explains how a sale taxes it back.`) +
      h.cta("Selling a Grand Strand rental from another state?", "We plan your Grand Strand closing around the exchange, with the form and the dates in place before the buyer signs.", "Have us plan the closing", ASK, bg) },

    { h2: "What are the 1031 exchange 45-day and 180-day rules?", toc: "45 and 180 days", id: "deadlines", html: () =>
      h.p(`Both deadlines ${h.ext(I8824, "count from the day your sale closes")} and run at the same time, in calendar days.`) +
      h.p(`Your tax return can come first. The exchange must be finished by ${h.ext(USC6072, "the return's due date")}, with extensions, if that is sooner. For a sale that closes after mid-October, day 180 falls after April 15, so an extension keeps all 180 days.`) +
      CLOCK_TOOL +
      h.p(`The IRS can postpone the 45 and 180 days ${h.ext(RP1858, "after a federally declared disaster")}, but never past the tax return's due date with extensions. After Hurricane Helene, ${h.ext(HELENE, "that relief covered")} every South Carolina county.`) +
      h.h3("The exchange, step by step, and what we do at each one") +
      steps([
        ["Before you list", "Choose a qualified intermediary. We start the search for your Grand Strand replacement now, because the 45 days are the short part."],
        ["The sale closes", "The money goes straight to your intermediary, and this day is day 0. We work the closing with the attorney's office so you never touch the money."],
        ["Days 1 to 45", "Shop on the numbers. Our agents check each Grand Strand property's rent, cap rate and tenant history, not the finishes."],
        ["Day 45", "Your signed list goes to your intermediary. We draft it with you and send it in time."],
        ["Day 180", "You close on the new property, and the tax stays put off. Our agents, and the lending, insurance and legal partners we work with here, work to the same date."],
      ]) },

    { h2: "How do you name replacement properties by day 45?", toc: "The day-45 list", id: "day-45-list", html: (bg) =>
      h.p(`Write the list, sign it, and send it to your intermediary ${h.ext(REG, "before day 45 ends")}. Telling your own agent, attorney or accountant does not count. Describe each property by its street address, legal description or a distinct name.`) +
      h.p("Choose one of three ways to write it:") +
      plain([
        ["Up to three properties", "Name up to three, at any price."],
        ["Any number, worth up to twice your sale", "Name more than three if their total value is no more than twice what you sold."],
        ["Any number, if you buy nearly all of them", "Name as many as you like if you buy at least 95 percent of the total value you named."],
      ]) +
      h.p("Name more than the rules allow, and the IRS treats the list as if you named nothing. You can change the list before day 45 with a new signed notice to the same person. A change by phone does not count.") +
      h.cta("Have us build your day-45 shortlist.", "Send us the price range from your sale. We send back the strongest Grand Strand picks and a backup, with the rent and the cap rate for each.", "Start my shortlist", ASK, bg) },

    { h2: "What can a 1031 exchange buy on the Grand Strand?", toc: "What to buy", id: "what-to-buy", html: (bg) =>
      h.p(`Buyers whose tax bill goes to another state or country bought ${CONDO_BUYERS_OUT} percent of the condos sold in Horry County in the past year. 1031 buyers are one of the largest groups of investors we work with here. Many of our investor clients sell in expensive markets and buy here.`) +
      h.p(`In the example, the next property costs ${NET} or more. The table counts what is for sale at that price.`) +
      FOR_SALE +
      h.p("Far more houses than condos for sale ask that much.") +
      BLOCK_PHOTO +
      h.p(`Buildings with 2 to 4 units are scarce: ${L.multi.horry} for sale, and half ask more than ${r5k(L.multi.median)}.`) +
      MULTI_STRIP +
      h.p(`Condos sold for about ${r1k(RM.resale_condo.median)} at the middle in the past year, the same as the middle asking price now. Houses and other homes that are not condos sold for about ${r1k(RM.resale_house.median)}. Under the three-property rule, you can split one sale into two or three condos.`) +
      G.homes(CONDO_STRIP.slug, CONDO_STRIP.name, h.cta("Want the homes for sale at your exchange price?", "Tell us what your sale brings. We send the condos, houses and 2 to 4 unit buildings for sale at that price, with the numbers on each.", "Send me homes at my price", ASK, bg), CONDO_STRIP.head) +
      h.p(`${h.a("/invest/condos/", "Our guide to condos as rentals")} and ${h.a("/invest/strategies/small-multifamily/", "our guide to 2 to 4 unit buildings")} compare the two. ${h.a("/invest/rental-returns/", "Rental returns by area")} gives the cap rates, and ${h.a("/invest/long-term-rental/", "the rental analyzer")} runs the numbers on one address.`) +
      h.h3("How one investor trades up") +
      h.p("One of Tim Nash's longtime clients, an investor based in New York, owns more than 200 properties, mostly condos. The IRS lets an owner deduct the cost of a residential rental building over 27.5 years, called depreciation. When a condo has used up that deduction, he sells it and trades up through a 1031 exchange.") +
      h.p(`${h.a("/invest/how-long-to-hold/", "How long to hold a rental before selling")} has the costs a sale must cover first. ${h.a("/invest/cost-segregation/", "Our cost segregation guide")} shows how a study changes the depreciation on the new property.`) },

    { h2: "Can you 1031 exchange a vacation condo you also use?", toc: "Vacation condo", id: "vacation-condo", html: () =>
      h.p(`Yes, if you rent it out enough. ${h.ext(RP0816, "The IRS will not challenge")} the exchange of a beach condo you rent out and also use if it passes this test:`) +
      plain([
        ["Owned 24 months", "You owned the condo for at least 24 months before the exchange."],
        ["Rented each year", "In each of those two years, you rented it at a fair rent for 14 days or more."],
        ["Little personal use", "Personal use was no more than 14 days or 10 percent of the rented days, whichever is more. Days your family uses it, or anyone pays less than a fair rent, count as personal use."],
      ]) +
      h.p("The condo you buy passes the same test for the 24 months after you buy it. The test is not the only way in. A condo that misses it may still qualify.") +
      h.p(`A home used only as your own home does not qualify. A former main home may get the separate home-sale exclusion if you lived in it two of the last five years. ${h.a("/sell/capital-gains/", "The capital gains guide")} covers that exclusion.`) },

    { h2: "What happens if you keep some of the cash?", toc: "Cash you keep", id: "cash-kept", html: () =>
      h.p(`Cash you keep from the exchange, often called boot, ${h.ext(TIPS, "is taxed")}, up to the amount of your gain. If the new loan is smaller than the one you paid off, the difference counts as cash you kept.`) +
      h.p(`South Carolina's share comes from that part only. Your intermediary sends the state a modified Form I-290 for the money that was not put into the new property.`) +
      h.p(`In the example, buy a ${money(PX.replacement_cost)} property and keep ${KEEP}. The intermediary sends the state about ${r10(PX.withhold_on_boot)}. The state tax on that ${KEEP} is about ${r10(PX.sc_tax_on_boot_top_rate)} at the top rate, and the rest comes back when you file.`) +
      h.p(`Federal tax is due on the cash too. ${h.a("/sell/capital-gains/", "Our capital gains calculator")} has the federal rates.`) },

    { h2: "How do you finance the replacement inside 180 days?", toc: "The loan", id: "loan", html: () =>
      h.p("The loan for the new property must close inside the same 180 days. The lender starts during the search, so the purchase and the loan move together.") +
      h.p(`Use your own lender, or our affiliated lender, BrickWood Mortgage, a separate company. Many exchange buyers use ${h.a("/invest/strategies/dscr-loans/", "a DSCR loan")}, which qualifies on the property's rent.`) },

    { h2: "How does a reverse 1031 exchange work in South Carolina?", toc: "Reverse", id: "reverse", html: (bg) =>
      h.p(`In a reverse exchange you buy first. ${h.ext(RP0037, "Another party")} that is not you or your agent, called an exchange accommodation titleholder, takes title to the new property first.`) +
      steps([
        ["The titleholder takes title", "It holds the new property for you until the exchange is finished."],
        ["You sign an agreement with it", "You and the titleholder sign a written agreement within 5 business days after it takes title."],
        ["You name the property you will sell", "Do it within 45 days after the titleholder takes title."],
        ["You finish the exchange", "Sell the old property and finish within 180 days after the titleholder takes title."],
      ]) +
      h.p(`A reverse exchange fits when the right property comes up before your sale is ready. For the tax put off with no property to manage, ${h.a("/invest/strategies/dst/", "a Delaware statutory trust share")} is the other choice.`) +
      h.cta("Found the next property before your sale?", "Tell us about both properties. We plan the purchase and the sale with your intermediary around the 45 and 180 days.", "Ask about a reverse exchange", ASK, bg) },
  ],
  afterSources: () => CREDITS + PH.imageSchema([BLOCK]) + LEGAL,
  faqTitle: "1031 exchange FAQ",
  faq: FAQ,
  sources: [
    { name: "SC Code 12-8-580", href: SC8 },
    { name: "12-6", href: SC6 },
    { name: "SCDOR", href: DOR },
    { name: "Form I-295", href: I295 },
    { name: "Form I-290", href: I290 },
    { name: "RR 09-13", href: RR },
    { name: "26 USC 1031", href: USC1031 },
    { name: "26 USC 6072", href: USC6072 },
    { name: "26 CFR 1.1031(k)-1", href: REG },
    { name: "IRS", href: TIPS },
    { name: "Form 8824", href: I8824 },
    { name: "Rev. Proc. 2008-16", href: RP0816 },
    { name: "Rev. Proc. 2018-58", href: RP1858 },
    { name: "Rev. Proc. 2000-37", href: RP0037 },
    { name: "Rev. Rul. 2004-86", href: RR0486 },
    { name: "County deeds", href: DEEDS },
  ],
  sourcesNote: `Sales: our count of county deeds. Homes for sale: our count of the listing feed on ${PULL_DAY}, in total only. The example is constructed.`,
  bottomCta: { h2: "Trading a rental for one here?", p: "Call 854.333.2135 or write before you list. We plan the sale, the shortlist and the closing around your 45 and 180 days.", label: "Talk through your exchange", href: ASK },
  keywords: "1031 exchange South Carolina, South Carolina 1031 exchange rules, SC I-295 1031, 1031 exchange 45 day rule, 1031 exchange 180 days, 1031 exchange Myrtle Beach, South Carolina reverse 1031 exchange, delayed 1031 exchange, 1031 exchange vacation home, 1031 exchange properties for sale Myrtle Beach",
  about: "A 1031 exchange of investment real estate in South Carolina, and the state's withholding for a seller who lives in another state",
});
