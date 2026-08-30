/*
 * Page spec: /buyers/relocating/from-florida/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-florida.js
 *
 * THE RULE FOR THIS PAGE, from state-tax.json movingOutGotcha: Florida to
 * South Carolina is a tax INCREASE in almost every dimension and the page must
 * not pretend otherwise. Never run a tax-savings angle at a Florida buyer.
 * The page leads with what rises. Facts: research/relocating/local-facts.md
 * H7 (Florida, opened 2026-08-30) plus the SC side established in
 * state-tax-table.md section 1. Do not change a figure without re-opening
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
  { q: 'Will I pay state income tax after moving from Florida to South Carolina?',
    a: 'Yes. Florida has none and South Carolina taxes income at 1.99 percent up to $30,000 of taxable income and 5.21 percent past it, after a $30,000 standard deduction for a married couple. A couple on $120,000 of wages pays about $3,700 a year. Social Security is not taxed, and the deductions at 65 leave a modest pension taxed lightly or not at all.' },
  { q: 'Do I keep my Save Our Homes cap or homestead exemption if I leave Florida?',
    a: 'No. The cap&#39;s benefit can transfer to another Florida homestead, but not across the state line. Selling ends it either way: the buyer of your house is reassessed at market value. Your South Carolina house starts fresh under South Carolina&#39;s rules, including the 4 percent owner-occupied rate and, at 65 and older after a year of residency, a homestead exemption on the first $50,000 of value.' },
  { q: 'Is homeowners insurance cheaper in Myrtle Beach than in Florida?',
    a: 'We will not promise that. Insurance on this coast is real money and it is priced to the address: distance to water, elevation, roof age and flood zone. Get a written quote on any specific house here before you offer, wind and flood both, and put it beside your current Florida bill. That comparison, not anyone&#39;s average, is your answer.' },
  { q: 'Will my car cost more to own in South Carolina than in Florida?',
    a: 'The tax on it, yes. Florida registration is a flat fee set by the car&#39;s weight. South Carolina bills every vehicle yearly on its value, roughly $360 to $460 on a $30,000 car plus a $50 road fee, and each vehicle pays a one-time $250 fee at its first registration here, due within 45 days of the move.' },
  { q: 'Is Myrtle Beach cheaper than Florida overall?',
    a: 'On the house, usually: the typical Florida home ran about $378,000 in July 2026 against about $342,000 here, and where in Florida you sell decides what that buys. On taxes, no: most Florida movers pay somewhat more tax here, and this page itemizes it. Gas and groceries run lower here.' },
  { q: 'Why do people move from Florida to Myrtle Beach?',
    a: 'Not for the tax table. The usual reasons are the price of the house against Florida&#39;s coastal markets, family already in the Carolinas, and wanting a smaller beach town. The move makes sense when those outweigh the tax lines that rise, and this page exists so you can see those lines before you decide, not after.' },
];

const spec = {
  slug: '/buyers/relocating/from-florida/',
  cur: 'buyers-relocating-fromfl',
  title: 'Moving From Florida to Myrtle Beach: Not About Taxes',
  description: 'Moving from Florida to Myrtle Beach is not a tax-savings move, and we say so: what rises, what falls, the insurance step to take first, and what your sale buys here.',
  headline: 'Moving From Florida to Myrtle Beach',
  keywords: 'moving from Florida to Myrtle Beach, Florida to South Carolina taxes, leaving Florida for South Carolina',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From Florida', href: '/buyers/relocating/from-florida/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From Florida</span></div><p class="eyebrow" style="margin-bottom:1rem">Florida to the Grand Strand</p><h1 class="detail-h1">Moving from Florida<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What to expect when the taxes move against you, what to expect on insurance quotes, what to expect your Florida sale to buy here, and what to expect on the car, the groceries and the sales tax.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Florida and South Carolina, side by side</h2><p style="${S.p}">A move from Florida to Myrtle Beach raises your taxes more often than it lowers them, and this page says so before it says anything else. You pick up a state income tax, the sales tax rises, and the car gains a yearly bill. What falls: the property tax, the gas tax, groceries, and usually the price of the house. The typical Florida home ran about $378,000 in July 2026 against about $342,000 here. Every line is explained below.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">Florida</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">State income tax</td><td style="${S.td}">None</td><td style="${S.td}">1.99% up to $30,000, then 5.21%</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Pensions, 401(k)s and IRAs in retirement</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Taxed past the deductions</td></tr>
<tr><td style="${S.td}">Estate or inheritance tax</td><td style="${S.td}">None</td><td style="${S.td}">None</td></tr>
<tr><td style="${S.td}">Property tax on a $378,000 primary home</td><td style="${S.td}">About $2,900 a year at the average rate on a new purchase; a long-held capped home bills less</td><td style="${S.td}">Roughly $1,390 in unincorporated Horry County</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">None; registration is a flat fee by weight</td><td style="${S.td}">Yes, on the car&#39;s value</td></tr>
<tr><td style="${S.td}">Sales tax</td><td style="${S.td}">About 7% average combined</td><td style="${S.td}">8% in the county, 9% in the city</td></tr>
<tr><td style="${S.td}">Gas tax</td><td style="${S.td}">39.4 cents a gallon</td><td style="${S.td}">28.75 cents</td></tr>
<tr><td style="${S.td}">Typical home value, July 2026</td><td style="${S.td}">About $378,000 statewide</td><td style="${S.td}">About $342,000</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Rates are the 2026 tax year. Home values are Zillow statewide typicals. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>

${taxCalcSection({ preselect: 'FL', bg: 'ivory-2' })}

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The line that rises</p><h2 style="${S.h2}">You pick up an income tax here</h2><p style="${S.p}">Florida does not tax personal income. South Carolina does: 1.99 percent on taxable income up to $30,000 and 5.21 percent past it, after a standard deduction of $30,000 for a married couple filing together. A working couple on $120,000 of wages pays about $3,700 a year here that Florida never charged. That number scales with what you earn, and the calculator above runs it against your own figures.</p><p style="${S.p}">Retirees fare better, and it is worth being exact about why. Social Security is not taxed here, same as Florida. Retirement account withdrawals and pensions are taxed, but the deductions blunt it: up to $10,000 of retirement income per person from age 65, plus an age deduction of up to $15,000 per person, plus the standard deduction. A retired couple drawing $60,000 of pension and $30,000 of Social Security typically owes South Carolina nothing at all. A couple drawing six figures from IRAs will owe real money that Florida did not ask for. Know which couple you are before you price the move.</p><p style="${S.pLast}">Military retirement is fully exempt here at any age, same practical result as Florida.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want your Florida numbers run against a real house here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Have an expert run it both ways</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The house taxes</p><h2 style="${S.h2}">The property tax falls, and your Florida cap ends either way</h2><p style="${S.p}">The rate here is lower. A $378,000 primary home bills roughly $1,390 a year in unincorporated Horry County at the 4 percent owner-occupied rate, which also removes the school operating tax. The same value in Florida bills about $2,900 at the state&#39;s average rate on a new purchase. At 65 and older, after a year of residency here, a homestead exemption takes the first $50,000 of value off the bill. You apply for the 4 percent rate yourself after closing; the ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline.</p><p style="${S.p}">Now the part a long-time Florida owner already suspects. Your current bill is probably held down by the cap on how fast your assessed value can rise, about 3 percent a year. That protection does not cross the state line. It can move with you to another Florida homestead, within three years, but not to South Carolina, and selling ends it for the house you leave: the buyer is reassessed at market value. So compare your actual Florida tax bill, not the average, against the Horry County number. If you have owned since the 2010s, the gap is smaller than the averages suggest, and the calculator above says so on the result panel.</p><p style="${S.pLast}">One more familiar mechanic: South Carolina reassesses on sale too, so the bill you compute on the purchase price is the bill you should budget, not the seller&#39;s old one.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The question you actually came with</p><h2 style="${S.h2}">Get the insurance quotes before you write an offer</h2><p style="${S.p}">If insurance is the reason you are reading this page, here is the honest version. We will not promise your premium falls in South Carolina, because nobody quoting an average can promise that. Insurance on this coast is priced to the address: distance to the water, elevation, roof age and shape, and the flood zone the parcel sits in. Two houses a mile apart can carry very different bills.</p><p style="${S.p}">So do it in this order. Before you write an offer on any specific house here, get a written wind and hail quote and a written flood quote on that address, and put them next to your current Florida declarations page. That comparison is your answer, and it is the only version of the answer worth trusting. The ${A('/buyers/coastal-insurance/', 'coastal insurance page')} explains what drives the number here, what the wind deductible means in dollars, and when flood coverage is required.</p><p style="${S.pLast}">You have done hurricane season before, so we will not lecture you about it. The ${A('/buyers/relocating/hurricanes/', 'storm history page')} lists every hurricane to reach the Grand Strand since Hugo and what each one did, so you can judge this coast on its record instead of its reputation.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The rest of the bill</p><h2 style="${S.h2}">The car tax is new, the sales tax rises, groceries stay untaxed</h2><p style="${S.p}">Florida registers a car for a flat fee set by its weight. South Carolina bills every vehicle on its value, every year: roughly $360 to $460 on a $30,000 car depending on the town, plus a $50 road fee, and the county bill must be paid before the plate renews. Count on a one-time $250 fee per vehicle at first registration and a 45 day window after the move. Devin paid this bill for the first time after his own move here, and the honest advice is to put it in the budget now so it never surprises you. Steps and addresses are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><p style="${S.pLast}">The general sales tax rises about a point or two: roughly 7 percent average combined in Florida against 8 percent in unincorporated Horry County and 9 percent in the City of Myrtle Beach. Groceries are exempt in both states, and grocery prices themselves run lower here than the Florida average. The gas tax drops about 11 cents a gallon.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The house</p><h2 style="${S.h2}">What a Florida sale buys at the coast</h2><p style="${S.p}">The typical Florida home ran about $378,000 in July 2026; the typical home here about $342,000. Averages understate the real spread, because Florida&#39;s coastal metros price far above their state line while the Grand Strand does not. A sale in most of coastal Florida buys a comparable house here with money left over, a smaller loan, or both. A sale in inland or Panhandle markets lands closer to even, and we will say so rather than stretch it.</p><p style="${S.pLast}">What the leftover money does is your call: a lower payment, a bigger house, or cash kept. Where it goes furthest differs by town, and several towns around Myrtle Beach are smaller and quieter than the name suggests. The ${A('/buyers/relocating/which-town/', 'which town page')} maps the differences before you book a trip.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Selling in Florida and buying here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Start with a real comparison</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The wash</p><h2 style="${S.h2}">What does not change when you cross the state line</h2><p style="${S.p}">Neither state taxes estates or inheritances, so nothing in your estate plan is forced to move. Social Security is untaxed in both. Both coasts carry hurricane risk and both price it into insurance, which is why the quote comes before the offer in either state. And neither state will tax you for leaving: Florida has no exit charge of any kind.</p><p style="${S.pLast}">The honest summary of this whole page: Florida movers do not come here for the tax table, because the tax table mostly moves against them. They come for what the house costs. Whether the move makes sense rests on two numbers, the house price and the insurance quote, so run both before you decide. We will help you do it with real addresses.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-from-florida');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Florida to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.flsenate.gov/Laws/Constitution', 'Florida Constitution, Article VII')}, ${X('https://floridarevenue.com/property/Documents/pt112.pdf', 'Florida DOR on the assessment cap')}, ${X('https://www.flsenate.gov/Laws/Statutes/2025/320.08', 'Florida vehicle registration fees')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://www.horrycountysc.gov/tax-payer-services/vehicle-tax/', 'Horry County vehicle tax')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
