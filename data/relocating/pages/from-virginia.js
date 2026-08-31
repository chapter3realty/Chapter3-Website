/*
 * Page spec: /buyers/relocating/from-virginia/
 * Figures: state-tax.json (VA entry) + tax.virginia.gov military benefits
 * FAQ and age-deduction rules re-verified 2026-08-27 (58.1-322.03).
 * FRAMING RULE: the car tax is FAMILIAR to Virginians. Never use the
 * surprise framing. No locality-rate comparison: no verified VA locality
 * table was opened, so the page never says whose car bill is bigger.
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
  { q: 'Is South Carolina cheaper than Virginia?',
    a: 'On most lines, modestly. The state income tax is close, but South Carolina&#39;s standard deduction is about twice Virginia&#39;s, property tax on a primary home runs less than half, and a typical house costs about $76,000 less on the statewide averages. Sales tax is the line that goes up.' },
  { q: 'Does Virginia or South Carolina tax military retirement?',
    a: 'Virginia lets you subtract up to $40,000 of military benefits on 2025 and later returns, with no age requirement. South Carolina exempts every dollar of military retirement pay at any age, with no cap. Below $40,000 of military pension the two match; above it, only South Carolina exempts it all.' },
  { q: 'What happens to the Virginia age deduction when I move?',
    a: 'It stays behind, and for many retirees it was already gone: Virginia&#39;s $12,000 age deduction shrinks a dollar for every dollar of adjusted federal AGI over $50,000 single or $75,000 married, and is gone entirely at $62,000 and $99,000. South Carolina&#39;s retirement and age-65 deductions have no income test.' },
  { q: 'Will I still pay an annual car tax in South Carolina?',
    a: 'Yes, and you already know the routine. Every vehicle is taxed on its value each year and the county bill is paid before the plate renews. A $30,000 car is taxed about $362 a year in unincorporated Horry County plus a $50 road fee, and a car titled elsewhere pays a one-time $250 fee at first registration.' },
  { q: 'How much does a house cost in Myrtle Beach compared with Virginia?',
    a: 'A typical home here costs about $342,000 against a Virginia statewide average of about $418,000, on the same July 2026 Zillow measure. The statewide number hides the split between Northern Virginia and everywhere else. See how much further every dollar goes here on our cost of living calculator.' },
  { q: 'Does South Carolina tax Social Security?',
    a: 'No, and neither does Virginia, so that part of the move is neutral. The differences are in how each state treats the rest of retirement income, and in the property tax.' },
];

const spec = {
  slug: '/buyers/relocating/from-virginia/',
  cur: 'buyers-relocating-fromva',
  title: 'Moving From Virginia to Myrtle Beach: Taxes Compared',
  description: 'Virginia to Myrtle Beach: a beach address for less, retirement deductions with no income limit, military retirement never taxed, and a car tax you already know.',
  headline: 'Moving From Virginia to Myrtle Beach',
  keywords: 'moving from Virginia to Myrtle Beach, Virginia to South Carolina taxes, Virginia car tax vs South Carolina',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From Virginia', href: '/buyers/relocating/from-virginia/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From Virginia</span></div><p class="eyebrow" style="margin-bottom:1rem">State to state, honestly</p><h1 class="detail-h1">Moving from Virginia<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What taxes to expect, what to expect on military retirement, what to expect your Virginia sale to buy here, and what our Virginia clients say after a year.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Virginia and South Carolina, side by side</h2><p style="${S.p}">Each line is explained below. Rates are the 2026 tax year unless the line says otherwise.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:580px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">Virginia</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">State income tax</td><td style="${S.td}">2% to 5.75%; the top rate starts at $17,000</td><td style="${S.td}">1.99% up to $30,000, then 5.21%</td></tr>
<tr><td style="${S.td}">Standard deduction, joint</td><td style="${S.td}">$17,500</td><td style="${S.td}">$30,000</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Retirement income at 65</td><td style="${S.td}">$12,000 age deduction, gone by $62,000 single / $99,000 joint AGI</td><td style="${S.td}">Deductions up to $10,000 plus $15,000 at 65, no income test</td></tr>
<tr><td style="${S.td}">Military retirement</td><td style="${S.td}">Up to $40,000 subtracted</td><td style="${S.td}">Fully exempt, no cap, any age</td></tr>
<tr><td style="${S.td}">Property tax, statewide effective rate</td><td style="${S.td}">0.78%</td><td style="${S.td}">0.49%; Horry County about 0.38% on a primary home</td></tr>
<tr><td style="${S.td}">Median property tax bill</td><td style="${S.td}">$2,872</td><td style="${S.td}">$1,337</td></tr>
<tr><td style="${S.td}">Sales tax</td><td style="${S.td}">5.3% in most places</td><td style="${S.td}">8% in the county, 9% inside Myrtle Beach</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">Yes, the one you know</td><td style="${S.td}">Yes, on value, every year</td></tr>
<tr><td style="${S.td}">Estate and inheritance tax</td><td style="${S.td}">Neither</td><td style="${S.td}">Neither</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Virginia figures from the Virginia Department of Taxation. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>
${taxCalcSection({ preselect: 'VA', bg: 'ivory-2' })}


<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">What the sale buys</p><h2 style="${S.h2}">What a Virginia sale buys at the coast</h2><p style="${S.p}">A typical Virginia home costs about $418,000 on the statewide Zillow average, against about $342,000 here, on the same July 2026 measure. That statewide number hides the split that matters: Northern Virginia sits far above it and much of the rest of the state below it. See how much further every dollar goes here compared with your hometown on the ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')}. The property tax on whatever you buy drops from a $2,872 median bill to a $1,337 one.</p><p style="${S.pLast}">Two parts of the map speak Virginia&#39;s language. Market Common is built on the old Myrtle Beach Air Force Base, and the street grid and parade ground still carry its history, with the airport next door. The beach towns run from ${A('/submarkets/north-myrtle-beach/', 'North Myrtle Beach')} to ${A('/submarkets/pawleys-island/', 'Pawleys Island')}, each at a different price, and appeal to different types of people. Check the ${A('/buyers/relocating/which-town/', 'town by town page')} to see what differs.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Retirees</p><h2 style="${S.h2}">Deductions here come with no income test</h2><p style="${S.p}">Social Security is untaxed in both states, so start from level ground. The difference is what each state does with the rest of retirement income, and Virginia&#39;s headline number comes with a catch that surprises people who have never run it.</p><p style="${S.p}">Virginia&#39;s age deduction is up to $12,000 at 65 and over. It then shrinks a dollar for every dollar that adjusted federal AGI exceeds $50,000 for a single filer or $75,000 for a married couple, and it is gone entirely at $62,000 and $99,000. A couple drawing a pension and two Social Security checks crosses those lines quickly. Pensions, 401(k) and IRA withdrawals are otherwise fully taxed at Virginia&#39;s rates.</p><p style="${S.p}">South Carolina&#39;s deductions have no income test at any level: up to $3,000 of retirement income before 65 and up to $10,000 from 65, per taxpayer, plus a separate age-65 deduction of up to $15,000 per person against any income. The numbers are smaller on paper than Virginia&#39;s $12,000; the difference is that you keep them no matter what you earn.</p><p style="${S.pLast}">Military retirement is its own line. Virginia lets you subtract up to $40,000 of military benefits on 2025 and later returns, with no age requirement, which is genuinely generous. South Carolina exempts every dollar of military retirement pay, at any age, with no cap. Below $40,000 of military pension the states match; above it, this is the only one of the two that never taxes it. The ${A('/buyers/va-loans/', 'VA loan page')} covers the buying side for veterans.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Retiring on a pension and not sure which state wins?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Talk it through with an expert</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The income tax</p><h2 style="${S.h2}">More of your income is never taxed here</h2><p style="${S.p}">Virginia&#39;s top rate of 5.75 percent begins at just $17,000 of taxable income, so nearly everyone with a working income pays it on most of their dollars. South Carolina charges 1.99 percent on the first $30,000 and 5.21 percent above it.</p><p style="${S.pLast}">The bigger difference is what gets taxed at all. South Carolina&#39;s standard deduction is $15,000 single and $30,000 joint against Virginia&#39;s $8,750 and $17,500, so more of your income never reaches a rate. This is a modest cut, not a New York one, and we would rather tell you that plainly. Where the move pays for itself is the property tax and the house price.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The familiar one</p><h2 style="${S.h2}">The car tax will not surprise you</h2><p style="${S.p}">Every other state page we have written warns the mover about South Carolina&#39;s annual vehicle tax, because Ohio, Maryland, New York and the rest do not bill you yearly for a car. You do not need the warning. Virginia&#39;s personal property tax on vehicles works the same way, so the only thing to learn is the local numbers.</p><p style="${S.p}">Here every vehicle is taxed on its value each year and the county bill is paid before the plate renews. A $30,000 car is taxed about $362 a year in unincorporated Horry County, about $458 inside the City of Myrtle Beach, plus a $50 county road fee. A car titled elsewhere pays a one-time $250 fee at first registration, and you have 45 days from the move to register. Boats and campers are taxed the same way.</p><p style="${S.pLast}">The order of operations matters here: insurance first, county tax second, DMV third. The ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')} walks it step by step with the deadlines.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The rest of the bill</p><h2 style="${S.h2}">Property tax drops by more than half</h2><h3 style="${S.h3}">Property tax</h3><p style="${S.p}">Virginia averages about 0.78 percent effective statewide with a median bill of $2,872. South Carolina averages about 0.49 percent, and Horry County about 0.38 percent on a primary home, where the primary rate also removes the school operating tax. The median bill here is $1,337. You apply for the primary rate yourself, and the ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline.</p><h3 style="${S.h3}">Sales tax</h3><p style="${S.pLast}">Virginia charges 5.3 percent in most places. Here it is 8 percent in the county and 9 percent inside the City of Myrtle Beach, and we would rather be honest with you about that: on most purchases the tax is higher. Groceries are the exception: untaxed in Horry County, and everyday goods price lower here than in Virginia on the federal price index, so the grocery run itself usually costs less.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">First hand</p><h2 style="${S.h2}">What our Virginia clients tell us</h2><p style="${S.p}">One of our buyers came down from Virginia Beach, and his comparison stuck with us because it was fair in both directions. Virginia Beach is a much bigger city than Myrtle Beach, and he would tell you its entertainment scene runs many times the size of ours. Nobody should move here expecting a bigger boardwalk than the one they left.</p><p style="${S.p}">What our Virginia clients say they come for instead: a smaller place that is growing quickly, where the money they bring goes further and getting ahead does not require a Northern Virginia income. Most of them leave with real respect for Virginia and the military and government careers it gave them, and they want more of the year outdoors than Virginia weather allows.</p><p style="${S.pLast}">Nobody here parties like Miami, one client put it, but people here are enjoying their money. That is as fair a one-line summary of the Grand Strand as we have heard, and the ${A('/buyers/relocating/pros-and-cons/', 'pros and cons page')} carries the rest of the honest picture, including the parts people leave over.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-from-virginia');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Virginia to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.tax.virginia.gov/military-benefits-faq', 'Virginia Tax military benefits FAQ')}, ${X('https://law.lis.virginia.gov/vacode/title58.1/chapter3/section58.1-322.03/', 'Virginia Code 58.1-322.03')}, ${X('https://www.tax.virginia.gov/news/virginia-taxes-and-your-retirement', 'Virginia Tax on retirement income')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://taxfoundation.org/data/all/state/property-taxes-by-state-county/', 'Tax Foundation property taxes')}, ${X('https://www.zillow.com/research/data/', 'Zillow research data')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
