/*
 * Page spec: /buyers/relocating/from-north-carolina/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-north-carolina.js
 *
 * Cloned from the from-new-york template per its header instruction: every
 * number changed for this state. Facts: research/relocating/state-tax-table.md
 * section 3 (NC), plus section 1 (SC). Do not change a figure without re-opening
 * the source listed there.
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
  { q: 'Is Myrtle Beach cheaper than North Carolina?',
    a: 'Close, and it depends on the line. Houses cost less than Charlotte or Raleigh, groceries lose the 2 percent tax, gas is about 12 cents cheaper, and property tax is lower. Income tax is lower only below about $100,000 of joint income. The calculator on our cost of living page runs your exact city.' },
  { q: 'Will my property taxes go down if I move from North Carolina to South Carolina?',
    a: 'Somewhat. Charlotte and Raleigh average about 0.69 percent effective while Horry County averages about 0.38 percent on a primary home, and the primary rate also removes the school operating tax. Expect a saving of a few thousand a year on a comparable house, not a windfall.' },
  { q: 'Does South Carolina tax my North Carolina pension?',
    a: 'It depends which pension. Military retirement is exempt in both states. Some older North Carolina government pensions are fully exempt there and taxed here past the deductions, so that group should run the numbers first. Private pensions and 401(k)s usually do better here, because South Carolina has retirement deductions and North Carolina has none.' },
  { q: 'Is the vehicle tax different in South Carolina?',
    a: 'The idea is the same: both states tax cars yearly with the plate. The mechanics differ here: the county bills you before the plate renews, a car titled elsewhere pays a one-time $250 fee, and you have 45 days from the move to register.' },
  { q: 'How much do homes cost in Myrtle Beach compared with Charlotte or Raleigh?',
    a: 'A typical home here costs about $342,000, against about $389,000 in the Charlotte area and about $437,000 in the Raleigh area, on the same July 2026 measure.' },
  { q: 'Why do so many people move from North Carolina to Myrtle Beach?',
    a: 'More people move to Myrtle Beach from North Carolina than from anywhere else. The usual reasons are the coast itself, more house for the money than the Charlotte or Raleigh metros, and retirement deductions North Carolina does not offer. The bills are close. The coast is the difference.' },
];

const spec = {
  slug: '/buyers/relocating/from-north-carolina/',
  cur: 'buyers-relocating-fromnc',
  title: 'Moving From North Carolina to Myrtle Beach: The Close Call',
  description: 'What changes moving from North Carolina to Myrtle Beach: the income tax crossover near $100,000, property and grocery taxes, gas, and what your sale buys here.',
  headline: 'Moving From North Carolina to Myrtle Beach',
  keywords: 'moving from North Carolina to Myrtle Beach, North Carolina to South Carolina taxes, Charlotte to Myrtle Beach',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From North Carolina', href: '/buyers/relocating/from-north-carolina/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From North Carolina</span></div><p class="eyebrow" style="margin-bottom:1rem">Carolina to Carolina</p><h1 class="detail-h1">Moving from North Carolina<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What taxes to expect in both directions, what to expect your Charlotte or Raleigh sale to buy at the coast, what to expect on your pension, and what to expect on groceries, gas and the car.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">North Carolina and South Carolina, side by side</h2><p style="${S.p}">The two states are closer on taxes than any other pair we compare. Each line is explained below.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">North Carolina</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">Income tax</td><td style="${S.td}">3.99% flat</td><td style="${S.td}">1.99% up to $30,000, then 5.21%</td></tr>
<tr><td style="${S.td}">Local income tax</td><td style="${S.td}">None</td><td style="${S.td}">None</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Government pensions</td><td style="${S.td}">Some older state and federal pensions fully exempt</td><td style="${S.td}">Taxed past the retirement deductions; military fully exempt</td></tr>
<tr><td style="${S.td}">Property tax, statewide effective rate</td><td style="${S.td}">0.66%</td><td style="${S.td}">0.49%; Horry County about 0.38% on a primary home</td></tr>
<tr><td style="${S.td}">Median property tax bill</td><td style="${S.td}">$2,044</td><td style="${S.td}">$1,337</td></tr>
<tr><td style="${S.td}">Sales tax on groceries</td><td style="${S.td}">2%</td><td style="${S.td}">0% in Horry County</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">Yes</td><td style="${S.td}">Yes</td></tr>
<tr><td style="${S.td}">Gas tax</td><td style="${S.td}">41.25 cents a gallon</td><td style="${S.td}">28.75 cents</td></tr>
<tr><td style="${S.td}">Typical home value, July 2026</td><td style="${S.td}">Charlotte about $389,000; Raleigh about $437,000</td><td style="${S.td}">About $342,000</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Rates are the 2026 tax year. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>
${taxCalcSection({ preselect: 'NC', bg: 'ivory-2' })}


<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">What the sale buys</p><h2 style="${S.h2}">What a Charlotte or Raleigh sale buys at the coast</h2><p style="${S.p}">A typical Charlotte home sells for about $389,000 and a typical Raleigh home about $437,000, against about $342,000 here. That is not the gap a New York seller sees, but it usually trades a suburban lot for a coastal one with money left over, and the property tax on it drops at the same time.</p><p style="${S.p}">Myrtle Beach is the name people search, but the market around it is a set of towns: North Myrtle Beach, Surfside Beach, Murrells Inlet, Pawleys Island, Little River and inland Conway, each with its own prices. One of them may fit you better than the city itself, and we would love to show you the ones you have not seen on a weekend trip. What actually differs between them is laid out ${A('/buyers/relocating/which-town/', 'town by town')}.</p><p style="${S.pLast}">Because the bills are this close, most North Carolina moves are about the coast itself, or a lifestyle change, not the tax math. The cost of living generally shifts less from North Carolina than from any other state we compare. The ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')} shows whether your city runs more or less than Myrtle Beach and its surrounding areas, in about a minute.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Income tax</p><h2 style="${S.h2}">The income tax can move either way, and the line sits near $100,000</h2><p style="${S.p}">North Carolina charges one flat rate on everything past its deduction. South Carolina charges a low rate on the first $30,000 and a higher one above it, with a deduction that shrinks as joint income climbs from $80,000 to $190,000.</p><p style="${S.p}">We ran the two published schedules side by side for a married couple with no dependents. At $60,000 of income, South Carolina charges about $600 and North Carolina about $1,400. At $100,000 the two states land within a few dollars of each other. Above $100,000, South Carolina charges more, not less.</p><p style="${S.pLast}">Dependents and credits move that line, so treat it as the shape of the comparison rather than your bill. What it means in practice: a working couple under $100,000 saves a little, a higher earner pays a little more, and nobody should make this move for the income tax alone.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want the numbers on your own income and city?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Have an expert run my numbers</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Pensions</p><h2 style="${S.h2}">Check which kind of pension you hold before you move</h2><p style="${S.p}">North Carolina fully exempts some older government pensions: state, local and federal retirees who had five years of service before August 12, 1989, and military retirees with twenty years of service. If that is you, this move taxes income that has been tax free. South Carolina exempts military retirement fully at any age, but other government pensions are ordinary retirement income here, sheltered only by the deductions.</p><p style="${S.pLast}">Every other retiree does better here. North Carolina taxes private pensions, 401(k)s and IRA withdrawals at the flat rate with no age break at all. South Carolina allows a retirement deduction of up to $3,000 before 65 and up to $10,000 from 65, plus a separate age-65 deduction of up to $15,000. Social Security is untaxed in both states.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The rest of the bill</p><h2 style="${S.h2}">Groceries, gas, property tax and the car</h2><h3 style="${S.h3}">Groceries and gas get cheaper</h3><p style="${S.p}">North Carolina puts a 2 percent local tax on groceries. Horry County puts none. Gas costs about 12.5 cents a gallon less here on the two states&#39; published fuel taxes.</p><h3 style="${S.h3}">Property tax drops, but modestly</h3><p style="${S.p}">Charlotte and Raleigh both average about 0.69 percent effective. Horry County averages about 0.38 percent on a primary home, and the primary rate also removes the school operating tax. It is a modest improvement, but it is still a few thousand dollars a year saved, usually on a bigger home. You apply for the primary rate yourself; the ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline.</p><h3 style="${S.h3}">The car tax is familiar</h3><p style="${S.p}">North Carolina already taxes vehicles every year with the registration, so this one is not a surprise. The mechanics differ: here the county bills you first and the plate renews after you pay, a car titled elsewhere pays a one-time $250 fee at first registration, and you have 45 days from the move. The steps are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><h3 style="${S.h3}">Sales tax goes up</h3><p style="${S.pLast}">General merchandise is taxed about 7.1 percent combined in North Carolina, against 8 percent in the county and 9 percent inside the City of Myrtle Beach.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-from-north-carolina');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>


<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">One recent move</p><h2 style="${S.h2}">A North Carolina family who built here instead of buying</h2><p style="${S.p}">One of our recent North Carolina clients decided not to buy an existing house at all. They wanted out of North Carolina&#39;s taxes, a warmer coast, and a home built to their own plan, without ending up too far from family. They chose Longs, inland past Little River, where land is affordable enough that the house they actually wanted fit the budget, and they commute. We found the land, helped them vet a builder, and connected them with BrickWood Mortgage, which financed the construction.</p><p style="${S.p}">They brought their cleaning business with them too, and being local let them pitch the big hotels here directly. Land, builder and construction loan is a harder transaction than a resale. It has more steps and more ways to stall, and it goes better when the agent and the lender already work together. That is the setup we run.</p><p style="${S.small}">Chapter 3 Realty has a business relationship with BrickWood Mortgage. The full RESPA Affiliated Business Arrangement disclosure is in the footer of this page and ${A('/buyers/programs/#afba', 'here')}. You are never required to use BrickWood, and you are free to shop lenders.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">North Carolina to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.ncdor.gov/taxes-forms/individual-income-tax/tax-rate-schedules', 'North Carolina income tax schedules')}, ${X('https://www.ncdot.gov/dmv/title-registration/Pages/vehicle-property-tax.aspx', 'North Carolina vehicle property tax')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://taxfoundation.org/data/all/state/property-taxes-by-state-county/', 'Tax Foundation property taxes')}, ${X('https://www.zillow.com/research/data/', 'Zillow research data')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
