/*
 * Page spec: /buyers/relocating/from-pennsylvania/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-pennsylvania.js
 *
 * Cloned from the from-new-york template per its header instruction: every
 * number changed for this state. Facts: research/relocating/state-tax-table.md
 * section 6 (PA), plus section 1 (SC). Do not change a figure without re-opening
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
  { q: 'Do retirees pay more income tax in South Carolina than in Pennsylvania?',
    a: 'Usually a little, yes. Pennsylvania taxes no retirement income at all. South Carolina taxes it past deductions of up to $10,000 from 65 per person plus an age-65 deduction of up to $15,000. For most retired couples the bill is small, but it is new, and the honest reasons to move are property tax, gas and the inheritance tax.' },
  { q: 'How much lower is property tax in Myrtle Beach than the Philadelphia suburbs?',
    a: 'A $440,000 home in Montgomery or Bucks County bills about $5,800 to $5,900 a year. The same value in unincorporated Horry County bills roughly $1,600 at the primary rate. Philadelphia itself is the exception; its rate is low and the drop is smaller.' },
  { q: 'Does moving to South Carolina end the Pennsylvania inheritance tax?',
    a: 'Mostly. South Carolina has no estate or inheritance tax. But Pennsylvania real estate stays subject to Pennsylvania inheritance tax even after you move, so keeping the old house keeps that tax on it. Your attorney owns this question.' },
  { q: 'Does the Philadelphia wage tax follow me?',
    a: 'No. It ends with Philadelphia residency and employment, and South Carolina has no local income tax anywhere to replace it.' },
  { q: 'Is there a car tax in South Carolina?',
    a: 'Yes. South Carolina bills every vehicle yearly on its value, where Pennsylvania charges only a flat registration. Budget roughly $400 to $500 a year on a mid priced car once the $50 road fee is counted, plus a one-time $250 fee when it first gets South Carolina plates, with a 45 day deadline after the move.' },
  { q: 'What costs less in Myrtle Beach than in Pennsylvania?',
    a: 'Gas by about 29 cents a gallon, property tax by roughly two thirds on a comparable suburban home, and there is no wage tax and no inheritance tax. Clothing and general sales tax cost more, and the car tax is new.' },
];

const spec = {
  slug: '/buyers/relocating/from-pennsylvania/',
  cur: 'buyers-relocating-frompa',
  title: 'Moving From Pennsylvania to Myrtle Beach: The Trade-Offs',
  description: 'What changes moving from Pennsylvania to Myrtle Beach: retirement income tax goes up a little, property and gas taxes drop hard, and the inheritance tax ends.',
  headline: 'Moving From Pennsylvania to Myrtle Beach',
  keywords: 'moving from Pennsylvania to Myrtle Beach, Pennsylvania to South Carolina taxes, PA retirees moving south',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From Pennsylvania', href: '/buyers/relocating/from-pennsylvania/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From Pennsylvania</span></div><p class="eyebrow" style="margin-bottom:1rem">Pennsylvania to the Grand Strand</p><h1 class="detail-h1">Moving from Pennsylvania<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Pennsylvania movers leave the wage tax, the inheritance tax and the most expensive gas in the region, and start paying income tax on retirement income above the deductions.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Pennsylvania and South Carolina, side by side</h2><p style="${S.p}">One line moves against you and most move with you. Each is explained below.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">Pennsylvania</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">State income tax</td><td style="${S.td}">3.07% flat</td><td style="${S.td}">1.99% up to $30,000, then 5.21%</td></tr>
<tr><td style="${S.td}">Local wage tax</td><td style="${S.td}">Nearly everywhere; about 3.7% in Philadelphia</td><td style="${S.td}">None anywhere</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Pensions, 401(k)s and IRAs in retirement</td><td style="${S.td}">Not taxed at all</td><td style="${S.td}">Taxed past the deductions</td></tr>
<tr><td style="${S.td}">Property tax on a $440,000 primary home</td><td style="${S.td}">About $5,800 to $5,900 in Montgomery or Bucks County</td><td style="${S.td}">Roughly $1,600 in unincorporated Horry County</td></tr>
<tr><td style="${S.td}">Inheritance tax</td><td style="${S.td}">0% to a spouse, 4.5% to children, 12% to siblings, 15% to others</td><td style="${S.td}">None</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">None</td><td style="${S.td}">Yes, on the car&#39;s value</td></tr>
<tr><td style="${S.td}">Sales tax on clothing</td><td style="${S.td}">Not taxed</td><td style="${S.td}">8% in the county, 9% in the city</td></tr>
<tr><td style="${S.td}">Gas tax</td><td style="${S.td}">57.6 cents a gallon</td><td style="${S.td}">28.75 cents</td></tr>
<tr><td style="${S.td}">Typical home value, July 2026</td><td style="${S.td}">Philadelphia area about $392,000</td><td style="${S.td}">About $342,000</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Rates are the 2026 tax year. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>
${taxCalcSection({ preselect: 'PA', bg: 'ivory-2' })}


<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">What drops</p><h2 style="${S.h2}">Property tax, the wage tax and the most expensive gas in the region</h2><h3 style="${S.h3}">Property tax</h3><p style="${S.p}">A $440,000 home in Montgomery or Bucks County bills about $5,800 to $5,900 a year. The same value in unincorporated Horry County bills roughly $1,600 at the primary rate, which also removes the school operating tax. Philadelphia itself is the exception: its rate is low and its houses cheap, so a rowhouse seller sees a smaller drop. You apply for the primary rate yourself; the ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline.</p><h3 style="${S.h3}">The wage tax, if you still work</h3><p style="${S.p}">Nearly every Pennsylvania municipality taxes wages on top of the state rate, and Philadelphia&#39;s is about 3.7 percent. South Carolina has no local income tax anywhere. A working Philadelphia household keeps that entire amount. If the move needs a job on this end, say so. We have pointed arriving clients at local employers and openings that fit their background. The move only makes sense if you enjoy your life and job here in South Carolina.</p><h3 style="${S.h3}">Gas</h3><p style="${S.pLast}">Pennsylvania&#39;s fuel tax is 57.6 cents a gallon, the highest of any state we compare. South Carolina&#39;s is 28.75 cents. That is about 29 cents a gallon, every fill, the largest drop of any move on this site.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want your Pennsylvania bills against a real house here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Have an expert run it both ways</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Retirees, read this first</p><h2 style="${S.h2}">Retirement income tax moves against you here</h2><p style="${S.p}">Most of our Pennsylvania buyers are retirees. That is why this page leads with the one line that moves against them. Pennsylvania taxes no retirement income at all. Pensions, 401(k) and IRA withdrawals after retirement age are simply not taxed, and neither is Social Security. That is rare, and it means a retired Pennsylvanian&#39;s state income tax bill is zero.</p><p style="${S.p}">South Carolina taxes the same income past its deductions: up to $3,000 of retirement income before 65 and up to $10,000 from 65, per person, plus an age-65 deduction of up to $15,000, plus the standard deduction every filer gets. For a typical retired couple the resulting bill is small. It is not zero, and Pennsylvania&#39;s is.</p><p style="${S.pLast}">The income tax is not a reason to move. The property tax, the gas tax and the inheritance tax are, and the house math stands on its own.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The estate</p><h2 style="${S.h2}">The inheritance tax, and the part that stays behind</h2><p style="${S.p}">Pennsylvania taxes inheritances from the first dollar: nothing to a spouse, 4.5 percent to children, 12 percent to siblings, 15 percent to others. South Carolina has no estate or inheritance tax at all. For a family passing a home and savings to children, that difference is measured in tens of thousands of dollars.</p><p style="${S.pLast}">One part does not move with you. Pennsylvania real estate stays subject to Pennsylvania inheritance tax even after you become a South Carolina resident, so keeping the old house keeps that tax attached to it. What any of this means for your own estate is a conversation for your attorney; we are stating the two states&#39; rules, not advising.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The rest of the bill</p><h2 style="${S.h2}">The car, the clothes and the sales tax</h2><p style="${S.p}">Two smaller lines move against you. South Carolina taxes every vehicle on its value each year, roughly $360 to $460 on a $30,000 car plus a $50 road fee, where Pennsylvania charges a flat registration. Count on a one-time $250 fee per vehicle on arrival and a 45 day window to register. Clothing, which Pennsylvania never taxes, carries the full 8 to 9 percent sales tax here. Deadlines and office addresses are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><p style="${S.pLast}">Before you shop, look at the map. Myrtle Beach in a search box covers the whole run of towns around it, and several are smaller and quieter than the city: Surfside Beach, Pawleys Island, Litchfield, Little River. Prices differ town to town, plenty of buyers who searched Myrtle Beach end up buying in one of them, and we are glad to show you several in a day. The ${A('/buyers/relocating/which-town/', 'which town page')} maps the differences first.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-from-pennsylvania');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>



<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Pennsylvania to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.pa.gov/agencies/revenue/resources/tax-types-and-information/inheritance-tax', 'Pennsylvania inheritance tax')}, ${X('https://www.pa.gov/agencies/revenue/resources/tax-rates/motor-fuel-tax-rates', 'Pennsylvania motor fuel tax')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://taxfoundation.org/data/all/state/property-taxes-by-state-county/', 'Tax Foundation property taxes')}, ${X('https://www.horrycountysc.gov/tax-payer-services/vehicle-tax/', 'Horry County vehicle tax')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
