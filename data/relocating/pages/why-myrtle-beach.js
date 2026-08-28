/*
 * Page spec: /buyers/relocating/why-myrtle-beach/
 * Every figure already lives, verified, elsewhere in this repo:
 * IRS SOI county migration (local-facts D-series), QCEW growth (D19),
 * Census-attributed metro rank (jobs page, Mar 2026 attribution), BEA RPP
 * (col-places.json), Zillow same-measure prices, sunshine/clear days (B9),
 * hurricane direct-hit counts (G6), client quotes (owner-answers 2026-08-28).
 * ONE page, with regional sections, on purpose: separate northerner /
 * midwesterner / southerner pages would be near-duplicates competing with
 * the state pages. Regional headers are geography, not protected classes.
 */
'use strict';

const S = {
  eyebrow: 'font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600',
  h2: 'font-family:var(--serif);font-size:1.7rem;color:var(--navy);margin-bottom:1rem;letter-spacing:-.01em',
  h3: 'font-family:var(--serif);font-size:1.15rem;color:var(--navy);margin:1.4rem 0 .5rem',
  p: 'color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1rem',
  pLast: 'color:var(--muted);line-height:1.75;max-width:720px',
  a: 'color:var(--brass);font-weight:600;text-decoration:none',
  ctaBox: 'background:var(--ivory);border:1px solid var(--rule);border-radius:6px;padding:1.2rem 1.3rem;margin-top:1.8rem;max-width:720px;display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between',
  small: 'font-family:var(--sans);font-size:.78rem;color:var(--muted);line-height:1.6;max-width:720px',
  th: 'padding:.6rem .5rem;font-weight:600;text-align:left;border-bottom:1px solid var(--rule)',
  td: 'padding:.6rem .5rem;vertical-align:top;border-bottom:1px solid var(--rule)',
};
const A = (href, text) => `<a href="${href}" style="${S.a}">${text}</a>`;
const X = (href, text) => `<a href="${href}" style="${S.a}" rel="noopener" target="_blank">${text}</a>`;


const faq = [
  { q: 'Why is everyone moving to Myrtle Beach?',
    a: 'The same four reasons, in different orders: a typical home near $342,000 while the places movers come from average $418,000 to $669,000, South Carolina taxes among the lowest in the country for a primary home, a coast that stays warm into October, and enough growth that work and new construction keep up. The IRS counted about 15,000 households moving into Horry County in a single year.' },
  { q: 'Is Myrtle Beach really growing that fast?',
    a: 'Yes. The Census Bureau ranked this metro among the very fastest growing in the country in its March 2026 release, employment here grew 9.1 percent from 2019 to 2025 against 5.1 percent nationally, and the households arriving reported about 2.5 times the income of the households leaving on the IRS migration file.' },
  { q: 'Where do most people moving to Myrtle Beach come from?',
    a: 'North Carolina is the single biggest source, right next door. After that come New York, New Jersey, Pennsylvania, Ohio, Maryland, Virginia, Connecticut and Massachusetts. We wrote a full tax and price comparison for each of those moves, state by state.' },
  { q: 'Is Myrtle Beach a good place to live year round?',
    a: 'For most of our buyers, yes, and we keep an honest page on exactly that question, including the parts people leave over: summers are humid, a quarter of the jobs follow the tourist season, and you will want a car. The beach, the prices and the taxes are what they stay for.' },
  { q: 'Why do retirees move to Myrtle Beach?',
    a: 'Social Security is never taxed in South Carolina at any income, retirement deductions here have no income test, military retirement is fully exempt, owner-occupied property tax is among the lowest in the country, and there is no estate or inheritance tax. Then the ocean stays warm enough to swim into October.' },
  { q: 'Why are investors buying in Myrtle Beach?',
    a: 'Millions of visitors a year rent somewhere to sleep, and oceanfront condos sell at prices northern buyers compare with parking spaces back home. Our Airbnb income page carries the real revenue ranges from five data vendors, and the building directory shows which buildings finance.' },
];

const spec = {
  slug: '/buyers/relocating/why-myrtle-beach/',
  cur: 'buyers-relocating-why',
  title: 'Why Is Everyone Moving to Myrtle Beach? The Real Reasons',
  description: 'Why people are moving to Myrtle Beach from every direction: the prices, the taxes, twelve months of coast, and what movers from each region say after they arrive.',
  headline: 'Why Everyone Is Moving to Myrtle Beach',
  keywords: 'why is everyone moving to Myrtle Beach, why are people moving to Myrtle Beach, moving to Myrtle Beach, is Myrtle Beach growing',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Why Myrtle Beach', href: '/buyers/relocating/why-myrtle-beach/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Why Myrtle Beach</span></div><p class="eyebrow" style="margin-bottom:1rem">The big picture</p><h1 class="detail-h1">Why everyone is moving<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What growth to expect, what taxes to expect, what home prices to expect, what jobs to expect, and what movers from every region say after their first year here.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Four reasons, told with numbers</h2><p style="${S.p}">People move here for the same four reasons in different orders. A typical home costs about $342,000 while the states our buyers come from average $418,000 to $669,000 on the same measure. South Carolina taxes are among the friendliest in the country for a primary home: property tax near 0.38 percent in Horry County, Social Security never taxed, no estate tax. The coast works twelve months, with the ocean warm into October and winters mild enough that Devin rides his motorcycle into December. And the growth feeds itself: jobs, stores, hospitals and neighborhoods are being built at the same time, so arriving does not mean settling for less.</p><p style="${S.pLast}">The numbers behind that paragraph: the Census Bureau ranked this metro among the very fastest growing in the country in March 2026, the IRS counted about 15,000 households arriving in a single year with about 2.5 times the income of the households leaving, and employment grew 9.1 percent from 2019 to 2025 against 5.1 percent nationally. Each figure is sourced on its own page, and this page links them all.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">From the Northeast</p><h2 style="${S.h2}">Why Northeasterners move to Myrtle Beach</h2><p style="${S.p}">New York, New Jersey, Pennsylvania, Connecticut and Massachusetts send us the same story with different numbers: sell a house that costs too much to keep, in a place that taxes too much of everything, and buy the coast outright. A Massachusetts average home sale is close to double a home here. New Jersey property tax bills fall by thousands a year. Connecticut retirees stop watching the income lines that decide whether their Social Security is taxed, because here it never is.</p><p style="${S.pLast}">One of our Massachusetts buyers, a retired Boston hotel manager, turned a $450,000 house sale into three oceanfront condos and a working beach life his friends came down to copy; his story is on the ${A('/buyers/relocating/from-massachusetts/', 'Massachusetts page')}. The full math, state by state: ${A('/buyers/relocating/from-new-york/', 'New York')}, ${A('/buyers/relocating/from-new-jersey/', 'New Jersey')}, ${A('/buyers/relocating/from-pennsylvania/', 'Pennsylvania')}, ${A('/buyers/relocating/from-connecticut/', 'Connecticut')} and ${A('/buyers/relocating/from-massachusetts/', 'Massachusetts')}.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">From the Midwest</p><h2 style="${S.h2}">Why Midwesterners move to Myrtle Beach</h2><p style="${S.p}">Ohio buyers, and Devin is one, tend to name two things first. The paycheck stops losing its city slice, because South Carolina has no local income tax anywhere, while most Ohio cities take one or two percent of every check. And the sky changes: the nearest long-term weather station here records 111 clear days a year against 66 for Cleveland, and winters here are mild enough that the beach stays a daily option.</p><p style="${S.pLast}">Devin&#39;s own move, with the vehicle tax that surprised him and the winters that did not, is written out on the ${A('/buyers/relocating/from-ohio/', 'Ohio page')}, and the ${A('/buyers/relocating/weather/', 'weather page')} carries every season in government numbers.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">From the Carolinas and the South</p><h2 style="${S.h2}">Why Southerners love Myrtle Beach</h2><p style="${S.p}">More people move here from North Carolina than from any other state, and the reason is simple: this is their beach already. Charlotte is about three and a half hours, Raleigh under four, and a family that has vacationed here for twenty years eventually does the math on owning the week instead of renting it. The sale of an inland Carolina home buys more coast here than most people expect.</p><p style="${S.pLast}">Virginians arrive with their own version: our Virginia Beach buyers tell us they wanted a smaller, faster growing coast where the money goes further, and they keep their respect for the military and government careers Virginia gave them. The math for both: ${A('/buyers/relocating/from-north-carolina/', 'North Carolina')} and ${A('/buyers/relocating/from-virginia/', 'Virginia')}.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The part nobody prints</p><h2 style="${S.h2}">What movers say after a year here</h2><p style="${S.p}">The quotes we collect from our own buyers say more than the statistics. Nobody here parties like Miami, but people here are enjoying their money. The roads drained faster after Debby than anyone from up north expected. The organic food moved from the store shelf to the farm stand. Summer is motorcycle season. Every one of those lines came from a real client or a member of our team, and each one lives on the page it belongs to.</p><p style="${S.pLast}">We keep the honest picture in one place too: the ${A('/buyers/relocating/pros-and-cons/', 'pros and cons page')} includes the parts people leave over, because a move that fits is worth more to us than a move that closes. When you are ready to see whether this coast fits yours, the ${A('/buyers/relocating/', 'relocation hub')} carries every guide we have written, and the ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')} shows how much further every dollar goes here compared with your hometown.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Wondering if your move works? Ask someone who made it.</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--navy)" id="lead-form"><div class="wrap" style="padding:3.5rem 1.5rem"><div style="max-width:620px;margin:0 auto">
<p style="font-family:var(--sans);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brass-2);margin-bottom:.7rem;text-align:center">Free, no obligation</p>
<h2 style="font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--ivory);letter-spacing:-.01em;margin-bottom:1.4rem;text-align:center">Move to Myrtle.</h2>
<div id="ldWrap">
<div style="display:grid;gap:.7rem;margin-bottom:1rem">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.7rem"><input class="ld-in" id="ldName" placeholder="Your name" autocomplete="name"><input class="ld-in" id="ldPhone" placeholder="Phone" type="tel" autocomplete="tel"></div>
</div>
<label style="display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:rgba(244,239,232,.6);line-height:1.5;margin:0 0 1.1rem;cursor:pointer"><input type="checkbox" id="ldConsent" style="margin-top:.18rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.</span></label>
<p id="ldErr" style="display:none;color:#e6b0a9;font-family:var(--sans);font-size:.8rem;margin:0 0 .8rem"></p>
<button class="btn btn-brass" style="width:100%;justify-content:center" onclick="ldSubmit()">I want to move here</button>
<p style="font-family:var(--sans);font-size:.78rem;color:rgba(244,239,232,.6);margin:.9rem 0 0;line-height:1.6;text-align:center">We reach out the same day, evenings included. Prefer to talk now? <a href="tel:+18543332135" style="color:var(--brass-2);font-weight:600;text-decoration:none;white-space:nowrap">Call 854.333.2135</a></p>
</div>
<div id="ldOk" style="display:none;border:1px solid var(--brass);border-radius:6px;padding:1.4rem;color:var(--ivory);text-align:center;line-height:1.6;font-family:var(--sans)">Thanks. A licensed team member will reach out the same day, evenings included.</div>
</div>
<style>
.ld-in{width:100%;padding:.7rem .85rem;font-family:var(--sans);font-size:.92rem;background:var(--white);border:1px solid transparent;border-radius:4px;color:var(--navy);outline:none;transition:border-color .16s,box-shadow .16s}
.ld-in::placeholder{color:var(--slate)}
.ld-in:focus{border-color:var(--brass-2);box-shadow:0 0 0 3px rgba(212,137,74,.28)}
</style>
<script>
function ldSubmit(){
 var n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');
 function fail(m){err.textContent=m;err.style.display='block';}
 err.style.display='none';
 if(!n){fail('Add your name.');return;}
 if(!ph){fail('Add a phone number so we can reach you.');return;}
 if(!c){fail('Check the consent box so we are allowed to call or text you.');return;}
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-why-myrtle-beach');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Why Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.irs.gov/statistics/soi-tax-stats-migration-data', 'IRS migration data')}, ${X('https://www.census.gov/newsroom/press-kits/2026/population-estimates-metro-micro-counties.html', 'Census Bureau metro estimates')}, ${X('https://www.bls.gov/cew/', 'BLS QCEW employment')}, ${X('https://www.zillow.com/research/data/', 'Zillow research data')}, ${X('https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area', 'BEA regional price parities')}. Every figure on this page is explained and sourced in full on the page it links to.</p></div></section>
`,
};

module.exports = spec;
