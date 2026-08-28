/*
 * Page spec: /buyers/relocating/from-connecticut/
 * Figures: state-tax.json (CT entry) + 2026-08-27 passes: OLR 2024-R-0130 /
 * DRS senior flyer (pension, IRA phase-in complete 2026), CGS 12-71e
 * (32.46 mill cap, 70% assessment), DRS estate and gift page ($15M, 12%).
 * FRAMING RULES: car tax is familiar AND usually smaller here, never the
 * surprise framing. Estate section is short because $15M reaches almost
 * nobody; the honest CT stories are the income cliffs and the property tax.
 */
'use strict';

const { taxCalcSection } = require('../tax-calc.js');

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
  { q: 'Is South Carolina cheaper than Connecticut?',
    a: 'On the recurring bills, clearly. Property tax runs about 1.54 percent effective in Connecticut against about 0.38 percent on a primary home in Horry County, the median bill drops from $6,573 to $1,337, the car tax falls for most movers, and a typical house costs about $111,000 less. Sales tax at the register is the line that rises.' },
  { q: 'Does Connecticut tax Social Security?',
    a: 'Not below $75,000 of AGI single or $100,000 married filing jointly. At those thresholds the exemption changes at once rather than phasing gently. South Carolina never taxes Social Security at any income.' },
  { q: 'What happens to my pension and IRA exemption when I leave Connecticut?',
    a: 'Connecticut fully exempts pension, annuity and, from 2026, IRA income below $75,000 AGI single or $100,000 joint, sliding to nothing by $100,000 and $150,000. South Carolina&#39;s retirement and age-65 deductions are smaller on paper but have no income test, and military retirement is fully exempt.' },
  { q: 'Does South Carolina have a gift or estate tax?',
    a: 'Neither. Connecticut is the only state with its own gift tax, but its estate and gift exemption now tracks the federal amount, $15 million for 2026, so in practice it reaches almost nobody. For most movers this line is no longer the reason to move; the property tax is.' },
  { q: 'Will my car tax go up in South Carolina?',
    a: 'For most Connecticut movers it goes down. Both states tax vehicles yearly on value. Connecticut assesses 70 percent of a depreciated value at your town&#39;s mill rate, capped at 32.46 mills. Here a $30,000 car runs about $362 a year in unincorporated Horry County, plus a $50 road fee and a one-time $250 registration fee on arrival.' },
  { q: 'How much does a house cost in Myrtle Beach compared with Connecticut?',
    a: 'A typical home here runs about $342,000 against a Connecticut statewide average of about $453,000, on the same July 2026 Zillow measure. Fairfield County sits far above that average and the northeast corner below it. See how much further every dollar goes here on our cost of living calculator.' },
];

const spec = {
  slug: '/buyers/relocating/from-connecticut/',
  cur: 'buyers-relocating-fromct',
  title: 'Moving From Connecticut to Myrtle Beach: The Full Math',
  description: 'Connecticut to Myrtle Beach: property taxes cut by more than half, Social Security never taxed at any income, a smaller car bill, and a beach home for less.',
  headline: 'Moving From Connecticut to Myrtle Beach',
  keywords: 'moving from Connecticut to Myrtle Beach, Connecticut to South Carolina taxes, CT pension tax thresholds',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From Connecticut', href: '/buyers/relocating/from-connecticut/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From Connecticut</span></div><p class="eyebrow" style="margin-bottom:1rem">State to state, honestly</p><h1 class="detail-h1">Moving from Connecticut<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What taxes to expect, what to expect on your Social Security and pension, what to expect your Connecticut sale to buy here, and what Connecticut movers tell us after a year.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Connecticut and South Carolina, side by side</h2><p style="${S.p}">Each line is explained below. Rates are the 2026 tax year unless the line says otherwise.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:580px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">Connecticut</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">State income tax</td><td style="${S.td}">2% to 6.99%, graduated, no standard deduction</td><td style="${S.td}">1.99% up to $30,000, then 5.21%; $30,000 joint standard deduction</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Exempt below $75,000 single / $100,000 joint AGI; taxed in part above</td><td style="${S.td}">Never taxed, at any income</td></tr>
<tr><td style="${S.td}">Pension, annuity and IRA income</td><td style="${S.td}">Fully exempt under the same AGI lines; nothing by $100,000 / $150,000</td><td style="${S.td}">Deductions with no income test; military fully exempt</td></tr>
<tr><td style="${S.td}">Property tax, statewide effective rate</td><td style="${S.td}">1.54%</td><td style="${S.td}">0.49%; Horry County about 0.38% on a primary home</td></tr>
<tr><td style="${S.td}">Median property tax bill</td><td style="${S.td}">$6,573</td><td style="${S.td}">$1,337</td></tr>
<tr><td style="${S.td}">Sales tax</td><td style="${S.td}">6.35% statewide, no local add-on</td><td style="${S.td}">8% in the county, 9% inside Myrtle Beach</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">Yes, town mill rate capped at 32.46 on 70% of value</td><td style="${S.td}">Yes, and usually smaller: about $362 on a $30,000 car in the county</td></tr>
<tr><td style="${S.td}">Estate and gift tax</td><td style="${S.td}">Both exist; exemption $15,000,000 for 2026, so few estates pay</td><td style="${S.td}">Neither</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Connecticut figures from the Department of Revenue Services and the General Assembly&#39;s research office. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>
${taxCalcSection({ preselect: 'CT', bg: 'ivory-2' })}


<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The headline</p><h2 style="${S.h2}">The property tax falls by more than half</h2><p style="${S.p}">Connecticut&#39;s effective property tax rate of about 1.54 percent is among the highest in the country, and the median bill is $6,573. Horry County&#39;s primary-home rate works out near 0.38 percent, the median South Carolina bill is $1,337, and the primary rate also removes the school operating tax from your bill entirely.</p><p style="${S.p}">Put real numbers on it: a $450,000 Connecticut house near the state average carries a bill most owners here would associate with a house three times the price. Buy a $342,000 home here as your primary residence and the bill lands near a tenth of many Fairfield County bills, and the savings repeat every year you own it.</p><p style="${S.pLast}">You apply for the primary rate yourself after you move, by May 31, or your first bill arrives at the higher 6 percent second-home rate. The ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline, and the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')} puts it in order with the rest.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want your Connecticut bills against a real house here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">What the sale buys</p><h2 style="${S.h2}">What a Connecticut sale buys at the coast</h2><p style="${S.p}">A typical Connecticut home runs about $453,000 on the statewide Zillow average, against about $342,000 here, on the same July 2026 measure. Fairfield County sits far above that average and the northeast corner below it. See how much further every dollar goes here compared with your hometown on the ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')}. The property tax on whatever you buy drops from a $6,573 median bill to a $1,337 one, every year.</p><p style="${S.pLast}">If a boat is part of the plan, start where the water is: ${A('/submarkets/little-river/', 'Little River')} keeps the Intracoastal marinas and fishing docks, ${A('/submarkets/murrells-inlet/', 'Murrells Inlet')} works the saltwater creek behind the MarshWalk, and ${A('/submarkets/north-myrtle-beach/', 'North Myrtle Beach')} puts the waterway a golf cart ride from the sand. The ${A('/buyers/relocating/which-town/', 'town by town page')} compares all ten areas on price, rules and features.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Retirees</p><h2 style="${S.h2}">Your Social Security is never taxed here</h2><p style="${S.p}">Start with the number Connecticut watches and South Carolina ignores. Earn more than $75,000 as a single filer or $100,000 as a couple and Connecticut begins taxing part of your Social Security, and the pension, annuity and IRA exemptions shrink toward zero over the same stretch of income. South Carolina never taxes Social Security, at any income, and its retirement deductions have no income test at all.</p><p style="${S.p}">$75,000 in Myrtle Beach spends like about $83,000 in Connecticut, and $100,000 spends like about $110,000, from our ${A('/buyers/relocating/cost-of-living/?from=state-connecticut&income=75000', 'cost of living calculator')}.</p><p style="${S.pLast}">The specifics for your accountant: South Carolina deducts up to $10,000 of retirement income at 65 and another $15,000 off any income at 65, per person, and every dollar of military retirement is exempt. One side note that stays true in either state: a single large IRA withdrawal raises your income for that year, so plan withdrawals with your adviser. The ${A('/buyers/retirees/', 'retiree page')} covers what else changes.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The income tax</p><h2 style="${S.h2}">How the two income taxes are built</h2><p style="${S.p}">Connecticut&#39;s rates run 2 to 6.99 percent, which looks ordinary next to South Carolina&#39;s 1.99 and 5.21. Two design choices make Connecticut&#39;s bill bigger than its brackets suggest. There is no standard deduction, only a personal exemption that itself phases out as income rises. And Connecticut applies benefit recapture: past certain income levels the lower brackets are clawed back, so a high earner pays the top rate on all income rather than just the top slice above the threshold.</p><p style="${S.pLast}">South Carolina starts a joint return with a $30,000 standard deduction, taxes the first $30,000 above it at 1.99 percent, and takes 5.21 percent of the rest, at every income, with nothing clawed back. This particular difference is modest for most households; for high earners the recapture rule makes it larger than the rate gap implies. See how much further every dollar goes here on the ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')}.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The car and the register</p><h2 style="${S.h2}">The car bill shrinks here</h2><h3 style="${S.h3}">The car tax you already know</h3><p style="${S.p}">You will not need the warning we give Ohio and Maryland movers, because Connecticut already taxes cars yearly: 70 percent of a depreciated value at the town mill rate, capped at 32.46 mills. Here the county taxes vehicles on value too, and the working numbers are these: about $362 a year on a $30,000 car in unincorporated Horry County, about $458 inside the City of Myrtle Beach, plus a $50 road fee, with a one-time $250 fee when a car titled elsewhere first registers. For most movers that is a smaller bill than the one they left. The steps and deadlines are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><h3 style="${S.h3}">Sales tax rises</h3><p style="${S.pLast}">Connecticut charges 6.35 percent statewide. Here it is 8 percent in the county and 9 percent inside the City of Myrtle Beach, and we would rather be honest with you about that: on most purchases the tax is higher. Groceries are the exception: untaxed in both states, and everyday goods price lower here than in Connecticut on the federal price index, so the grocery run itself usually costs the same or less.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The estate advantage</p><h2 style="${S.h2}">No estate tax here, at any amount</h2><p style="${S.p}">Connecticut&#39;s estate and gift exemption tracks the federal amount, $15 million for 2026. Most families will never reach it. We would rather tell you that plainly than sell you a benefit you would not receive.</p><p style="${S.p}">Above $15 million, Connecticut charges 12 percent of the amount over the line. That is $120,000 for every million dollars above it. An estate of $20 million owes about $600,000 to Connecticut. An estate of $25 million owes about $1.2 million. South Carolina charges none of it, at any size.</p><p style="${S.p}">Connecticut is also the only state with its own gift tax, at the same 12 percent above the same $15 million, on large gifts you make while you are alive. South Carolina has no estate tax, no inheritance tax and no gift tax. For a very large estate, moving here saves you twelve cents on the dollar in taxes.</p><p style="${S.pLast}">Your attorney structures the plan. We handle the part where you actually become a South Carolinian, from the house to every residency step on the ${A('/buyers/relocating/moving-checklist/', 'checklist')}.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Planning around a large estate?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Speak with our broker</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">First hand</p><h2 style="${S.h2}">What Connecticut movers tell us</h2><p style="${S.pLast}">Our Connecticut clients tend to praise what they are leaving, and they are right to: the historic towns, the schools, places that have been beautiful for three hundred years. What sends them south is the rest of it. The winters go on too long, prices they describe as getting out of hand, and they want more beach and more room than the shoreline they left.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-from-connecticut');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Connecticut to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://portal.ct.gov/drs/individuals/individual-income-tax-portal/estate-and-gift-taxes/tax-information', 'Connecticut DRS estate and gift tax')}, ${X('https://cga.ct.gov/2024/rpt/pdf/2024-R-0130.pdf', 'Connecticut OLR on retirement income exemptions')}, ${X('https://law.justia.com/codes/connecticut/title-12/chapter-203/section-12-71e/', 'CGS 12-71e motor vehicle mill rate')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://taxfoundation.org/data/all/state/property-taxes-by-state-county/', 'Tax Foundation property taxes')}, ${X('https://www.zillow.com/research/data/', 'Zillow research data')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
