/*
 * Page spec: /buyers/relocating/from-ohio/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-ohio.js
 *
 * Cloned from the from-new-york template per its header instruction: every
 * number changed for this state. Facts: research/relocating/state-tax-table.md
 * section 4 (OH), plus section 1 (SC). Do not change a figure without re-opening
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
  { q: 'Is Myrtle Beach cheaper than Ohio?',
    a: 'Mostly, not entirely. You stop paying local income tax, gas costs about 10 cents less, and property tax rates are far lower. Against that, a typical house costs more than the Cleveland area, sales tax is higher, and the yearly car tax is new. The calculator on our cost of living page runs your exact city.' },
  { q: 'Do I pay local income tax in Myrtle Beach?',
    a: 'No. South Carolina has no city or school district income tax anywhere. Most Ohio cities charge 1 to 3 percent of wages, so for working households this is usually the biggest single change.' },
  { q: 'How is retirement income taxed in South Carolina compared with Ohio?',
    a: 'Ohio taxes pensions and retirement account withdrawals with credits that top out at $200 a year. South Carolina allows a deduction instead: up to $15,000 of income per person from age 65, with the retirement income deduction of up to $10,000 counting against that same $15,000. Social Security is untaxed in both.' },
  { q: 'Does South Carolina really tax my car every year?',
    a: 'Yes. Vehicles are taxed yearly on value: a $30,000 car is taxed roughly $360 to $460 plus a $50 road fee, and the bill must be paid before the plate renews. Ohio charges a flat fee of roughly $36 to $74. Add a one-time $250 fee per vehicle when you arrive, within 45 days.' },
  { q: 'Can Ohio still tax me after I move to South Carolina?',
    a: 'It can if the move is not clean. Holding an Ohio driver&#39;s license at any point in the year, spending 213 or more day-pairs back in Ohio, or missing the October 15 non-residency statement each keep Ohio&#39;s claim alive. A snowbird split between the two states should bring in a CPA first.' },
  { q: 'What surprised Devin most after moving from Ohio?',
    a: 'The county vehicle bill, which Ohio never sends: every vehicle here is taxed on its value each year. Then two he did not see coming: needing sunglasses daily in summer, and a job market far wider than Pleasant City, the village of about 400 he left.' },
];

const spec = {
  slug: '/buyers/relocating/from-ohio/',
  cur: 'buyers-relocating-fromoh',
  title: 'Moving From Ohio to Myrtle Beach: What Actually Changes',
  description: 'What changes moving from Ohio to Myrtle Beach: the city income taxes you leave, the vehicle tax you gain, the retiree math, and the Ohio residency rules.',
  headline: 'Moving From Ohio to Myrtle Beach',
  keywords: 'moving from Ohio to Myrtle Beach, Ohio to South Carolina relocation, Ohio retirees moving to Myrtle Beach',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From Ohio', href: '/buyers/relocating/from-ohio/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From Ohio</span></div><p class="eyebrow" style="margin-bottom:1rem">Ohio to the Grand Strand</p><h1 class="detail-h1">Moving from Ohio<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What taxes to expect once city income tax stops, what to expect on retirement income, what to expect to cost more here, and what surprised Devin after he made this exact move.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Get the Ohio comparison</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Ohio and South Carolina, side by side</h2><p style="${S.p}">The state rates look close. The differences live in the local taxes, the car, and retirement income. Each line is explained below.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">Ohio</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">State income tax</td><td style="${S.td}">Flat 2.75% above $26,050</td><td style="${S.td}">1.99% up to $30,000, then 5.21%</td></tr>
<tr><td style="${S.td}">Local income tax</td><td style="${S.td}">City taxes, commonly 1% to 3%, and some school districts add their own</td><td style="${S.td}">None anywhere</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Pensions, 401(k)s and IRAs</td><td style="${S.td}">Taxed, with credits that top out at $200 a year</td><td style="${S.td}">Deductions up to $10,000 from 65, plus an age-65 deduction</td></tr>
<tr><td style="${S.td}">Property tax, statewide effective rate</td><td style="${S.td}">1.36%</td><td style="${S.td}">0.49%; Horry County about 0.38% on a primary home</td></tr>
<tr><td style="${S.td}">Median property tax bill</td><td style="${S.td}">$2,937</td><td style="${S.td}">$1,337</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">No</td><td style="${S.td}">Yes, every year</td></tr>
<tr><td style="${S.td}">Gas tax</td><td style="${S.td}">38.5 cents a gallon</td><td style="${S.td}">28.75 cents</td></tr>
<tr><td style="${S.td}">Typical home value, July 2026</td><td style="${S.td}">Cleveland area about $254,000</td><td style="${S.td}">About $342,000</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Rates are the 2026 tax year. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>
${taxCalcSection({ preselect: 'OH', bg: 'ivory-2' })}


<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Income tax</p><h2 style="${S.h2}">You stop paying city income tax</h2><p style="${S.p}">Ohio&#39;s state rate is one of the lowest in the country. What most Ohio households actually feel is the layer under it: city income taxes, commonly 1 to 3 percent of wages, and in some places a school district income tax on top of that.</p><p style="${S.pLast}">South Carolina has no local income tax anywhere. No city rate, no district rate. For a working household this is the largest single income-tax change in the whole comparison, and it is bigger than the difference between the two state rates.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Retirees</p><h2 style="${S.h2}">Retirement income: the clearest win of any state we compare</h2><p style="${S.p}">Ohio taxes pensions, 401(k) and IRA withdrawals at its flat rate. The relief is a retirement credit that tops out at $200 a year, one per return, and ends entirely at $100,000 of income, plus a $50 credit at 65.</p><p style="${S.pLast}">South Carolina works from deductions instead: up to $3,000 of retirement income before 65 and up to $10,000 from 65, per person, plus a separate age-65 deduction of up to $15,000 against any income. Social Security is untaxed in both states. For most retirees the same pension is simply taxed less here, and the property tax on the house drops at the same time.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Retiring here from Ohio? We will run your whole picture.</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Have an expert run my retirement math</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The other direction</p><h2 style="${S.h2}">Two things cost more here, and Devin hit both</h2><h3 style="${S.h3}">South Carolina taxes your car every year</h3><p style="${S.p}">Ohio charges a flat registration of roughly $36 plus small local fees, and nothing based on the car&#39;s value. Here every vehicle is taxed yearly on its value: a $30,000 car is taxed roughly $360 outside the city limits and closer to $460 inside Myrtle Beach, plus a $50 road fee, and the county bill must be paid before the plate renews. Arriving adds a one-time $250 fee per vehicle, with 45 days to register. A two-car household should plan on roughly $500 to $1,000 a year that did not exist in Ohio. The bill for boats and campers works the same way. Devin, who wrote this page, arrived from Ohio three years ago, and this tax was the item that caught him: his first county bill was $325 for the car, plus the one-time $250 fee and the $50 road fee. The steps, in order, are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><h3 style="${S.h3}">Houses and sales tax</h3><p style="${S.pLast}">A typical home here costs about $342,000 against about $254,000 in the Cleveland area, so the purchase itself is a step up for many Ohio buyers even though the tax rate on it is far lower. The figure is the Myrtle Beach metro; the towns around it price differently. If you are coming from a small town, you do not have to land in a resort city: Conway, Longs, Aynor and Little River all sit within a short drive of the beach, and we are glad to show them next to the beachfront so you can compare. The ${A('/buyers/relocating/which-town/', 'which town page')} compares all of them properly. Sales tax runs 8 percent in the county and 9 percent in the city, against about 7.3 percent combined in Ohio. Groceries are untaxed in both.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">If you keep a foot in Ohio</p><h2 style="${S.h2}">Ohio has a residency test with real teeth</h2><p style="${S.p}">Ohio presumes you are still a resident until you show otherwise, and its test is specific. You cannot hold an Ohio driver&#39;s license at any point in a year you claim to be gone. Your days back in Ohio are counted, and at 213 or more the presumption becomes very hard to beat. And the non-residency statement has a hard deadline: filed by October 15 of the following year, it makes your non-resident status final; missed, Ohio presumes you never left.</p><p style="${S.pLast}">If the plan is a clean move, surrender the license early and the rest follows. If the plan is a winter here and a summer there, bring in a CPA before you set up the year, not after.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-from-ohio');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">First hand</p><h2 style="${S.h2}">What surprised Devin after the move</h2><p style="${S.p}">Devin moved here from Pleasant City, a village of about 400 people in Guernsey County, Ohio. Three years in, three things stand out to him. The county vehicle bill, which Ohio never sends; the numbers are further up this page. Needing sunglasses: he never owned a pair that mattered in Ohio and reaches for them daily here in summer. And the work: coming from a village of 400, the range of jobs here felt like a big city&#39;s.</p><p style="${S.pLast}">His own bills are quoted, labelled as one household&#39;s, on the ${A('/buyers/relocating/cost-of-living/', 'cost of living page')}, and his first-45-days mistakes are the reason the ${A('/buyers/relocating/moving-checklist/', 'checklist')} exists.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Ohio to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://codes.ohio.gov/ohio-revised-code/section-5747.02', 'Ohio income tax statute')}, ${X('https://www.bmv.ohio.gov/doc-fees.aspx', 'Ohio BMV fees')}, ${X('https://codes.ohio.gov/ohio-revised-code/section-5747.24', 'Ohio residency statute')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://www.horrycountysc.gov/tax-payer-services/vehicle-tax/', 'Horry County vehicle tax')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
