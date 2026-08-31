/*
 * Page spec: /buyers/relocating/from-new-york/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-new-york.js
 *
 * This is the TEMPLATE for the origin-state pages. Before cloning it for NC,
 * OH, NJ or PA, read research/relocating/state-tax-table.md for that state and
 * change every number. The reason these pages are not scaled content is that
 * the tax math genuinely differs; if a clone only swaps the state name, delete
 * it rather than publish it.
 *
 * Facts: research/relocating/state-tax-table.md sections 1 (SC) and 2 (NY),
 * data/relocating/state-tax.json, data/relocating/col-places.json.
 *
 * Two things in the research that a careless draft gets wrong, both handled below:
 *  - ACS top-codes median property taxes at "$10,000+", so Nassau, Suffolk and
 *    Westchester medians are UNDERSTATED. Never print $10,000 as their median.
 *  - The NYC boroughs are the exception: their effective property tax rates
 *    (0.56%-0.88%) are close to South Carolina's. A Brooklyn seller will not
 *    see the property tax drop a Nassau seller sees. Do not write one sentence
 *    that covers both.
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
  { q: 'How much cheaper is Myrtle Beach than New York?',
    a: 'Overall prices are about 17 percent lower than the New York metro area on the federal price index, and housing about 44 percent lower. In July 2026 the typical home was about $342,000 here against about $737,000 there. A household earning $95,000 in the New York metro keeps the same standard of living here on about $79,000.' },
  { q: 'Will my property taxes go down if I move from New York to South Carolina?',
    a: 'From Long Island, Westchester or Rockland, substantially. Those counties run effective rates of roughly 1.6 to 2.1 percent, against about 0.38 percent in Horry County on a primary home. From Brooklyn, Queens or Staten Island, much less: the boroughs average 0.56 to 0.88 percent because assessment caps hold assessed values well below market, so the gap is far smaller.' },
  { q: 'Does South Carolina tax my pension if I move from New York?',
    a: 'Often, yes. New York fully exempts New York State and local government pensions, federal pensions and military pensions, with no cap. South Carolina exempts military retirement fully, but a state or municipal pension from New York becomes taxable here beyond the retirement and age-65 deductions. Social Security is untaxed in both states.' },
  { q: 'Do I have to pay tax on my car every year in South Carolina?',
    a: 'Yes, and New York does not do this, so it surprises people. Vehicles are assessed at 6 percent of value at the full local rate, so a $30,000 car is taxed roughly $360 a year outside the city limits. You also pay a one-time $250 fee per vehicle when you first register it here, and you have 45 days from moving to do it.' },
  { q: 'Can New York still tax me after I move to South Carolina?',
    a: 'It can, in two situations. New York says your domicile does not change until you can show with clear and convincing evidence that you abandoned it. Separately, even with a genuine domicile change, New York taxes you as a full-year resident if you keep a permanent home there for substantially all of the year and spend 184 days or more in the state. Keeping the old house and visiting family half the year is the common trap. Get advice from a tax professional before you plan your year.' },
  { q: 'What is the biggest cost that goes up when moving from New York?',
    a: 'Insurance. A coastal policy here is often homeowners plus wind and hail plus flood, priced separately, with hurricane deductibles set as a percentage of the insured value. Get an insurance quote before you write an offer, because it changes the monthly number more than any other line.' },
];

const spec = {
  slug: '/buyers/relocating/from-new-york/',
  cur: 'buyers-relocating-fromny',
  title: 'Moving From New York to Myrtle Beach: The Real Numbers',
  description: 'What changes moving from New York to the Grand Strand: income and property tax, what your sale buys here, the yearly vehicle tax, and the residency trap.',
  headline: 'Moving From New York to Myrtle Beach',
  keywords: 'moving from New York to Myrtle Beach, New York to South Carolina relocation, NY to Myrtle Beach taxes',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From New York', href: '/buyers/relocating/from-new-york/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From New York</span></div><p class="eyebrow" style="margin-bottom:1rem">New York to the Grand Strand</p><h1 class="detail-h1">Moving from New York<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What to expect on paper the day you move, what property tax to expect from the part of New York you leave, what to expect on a New York pension, and what to expect your sale to buy here.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">What changes when you move</h2><p style="${S.p}">The table compares the two states for the 2026 tax year. Each line is explained below.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">New York</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">Top income tax rate</td><td style="${S.td}">10.9%, nine brackets</td><td style="${S.td}">5.21%, two brackets</td></tr>
<tr><td style="${S.td}">Local income tax</td><td style="${S.td}">Yes in New York City and Yonkers</td><td style="${S.td}">None anywhere</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Government and military pensions</td><td style="${S.td}">Fully exempt, no cap</td><td style="${S.td}">Military exempt; other pensions taxed beyond the deductions</td></tr>
<tr><td style="${S.td}">Property tax, statewide effective rate</td><td style="${S.td}">1.30%</td><td style="${S.td}">0.49%; Horry County about 0.38%</td></tr>
<tr><td style="${S.td}">Median property tax bill</td><td style="${S.td}">$6,542</td><td style="${S.td}">$1,337</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">None</td><td style="${S.td}">Yes, every year</td></tr>
<tr><td style="${S.td}">Estate tax</td><td style="${S.td}">Yes, above about $7.35m</td><td style="${S.td}">None</td></tr>
<tr><td style="${S.td}">Combined sales tax, typical</td><td style="${S.td}">About 8.5%</td><td style="${S.td}">8% in Horry County, 9% in the city</td></tr>
<tr><td style="${S.td}">Typical home value, July 2026</td><td style="${S.td}">About $737,000</td><td style="${S.td}">About $342,000</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Rates are the 2026 tax year. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>
${taxCalcSection({ preselect: 'NY', bg: 'ivory-2' })}


<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Property tax</p><h2 style="${S.h2}">Property tax depends on which part of New York you leave</h2>
<h3 style="${S.h3}">Long Island, Westchester and Rockland</h3><p style="${S.p}">The drop is large. Those counties carry effective property tax rates of roughly 1.6 percent in Suffolk, 1.7 percent in Nassau, 1.8 percent in Westchester and 2.1 percent in Rockland. Horry County averages about 0.38 percent on a primary home. The federal survey stops counting at $10,000, so the published medians for those counties are floors rather than actual figures. The real median bill in all four is above $10,000. On a comparable house here you are usually looking at a bill in the low thousands.</p><p style="${S.p}">One client of ours left a house worth about $1 million and a property tax bill over $20,000 a year. They bought a similar sized house here for about $700,000, beachfront in North Myrtle Beach with ocean views, near the restaurants they wanted and near the waterway, because they own a boat and finally wanted to use it. The county bill on the house is about $3,200. Those are one household&#39;s rounded numbers, not a promise, but they show the scale of the gap.</p>
<h3 style="${S.h3}">Brooklyn, Queens, Staten Island and the Bronx</h3><p style="${S.p}">The math is different in the boroughs. Effective rates are about 0.56 to 0.88 percent, because the city&#39;s assessment caps hold assessed values far below market value. That is already close to South Carolina&#39;s rates. You still gain on the purchase price. Do not expect a big drop in property tax.</p>
<h3 style="${S.h3}">The 4 percent rate, and why you apply for it</h3><p style="${S.pLast}">South Carolina assesses a primary home at 4 percent of value and everything else at 6 percent. The 4 percent rate also removes the school operating tax, so the difference on the same house is roughly three to one. You have to apply for it. If you buy here before you sell in New York, or keep the New York house, this is the detail to get right. The ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want the tax bill on a specific house, at your ownership status?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Have an expert run my tax bill</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Pensions</p><h2 style="${S.h2}">How South Carolina taxes a New York pension</h2><p style="${S.p}">New York does not tax New York State and local government pensions, federal pensions or military pensions. There is no dollar cap and no age test. If you retired from a New York school district, a police or fire department, a municipality or the state, New York taxes that pension at zero.</p><p style="${S.p}">South Carolina treats it differently. Military retirement pay stays fully exempt at any age. A New York government pension is not military pay, so here it counts as ordinary retirement income. The shelter is smaller: a retirement income deduction of up to $3,000 a year before 65 and up to $10,000 from 65, plus a separate age-65 deduction of up to $15,000 against any income, reduced by whatever retirement deduction you already claimed.</p><p style="${S.p}">For a large public pension, that can mean paying South Carolina tax on income New York was not taxing at all. The cheaper house and the lower property tax usually outweigh it, but not always. Run the numbers before you move, not after. Social Security is untaxed in both states.</p><p style="${S.pLast}">Private pensions, 401(k)s and IRAs compare better. New York&#39;s exclusion for that income is capped at $20,000 per person from age 59 and a half, and withdrawals count against that cap. We are not tax advisers, and this is the point to bring one in. What we can do is tell you the housing side precisely.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Two costs that go up</p><h2 style="${S.h2}">The car tax and the residency rule</h2><h3 style="${S.h3}">South Carolina taxes vehicles every year</h3><p style="${S.p}">New York charges a registration fee every two years and no property tax on cars. South Carolina charges a county property tax on every vehicle, every year, at 6 percent of the car&#39;s value, and the bill must be paid before your plate will renew. A $30,000 car is taxed roughly $360 a year outside the city limits and closer to $460 inside Myrtle Beach, plus a $50 county road fee. Arriving costs more still: a one-time $250 fee per vehicle, and you have 45 days from your move to register. A two-car household should plan on roughly $500 to $1,000 a year that did not exist in New York, and about $600 in one-time fees. The steps are on our ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}, in order, because the county has to bill you before the DMV will issue a plate.</p><h3 style="${S.h3}">New York can keep taxing you after you leave</h3><p style="${S.p}">This is the one that costs real money when it goes wrong. New York holds that your domicile does not change until you can show, in its words, with clear and convincing evidence that you abandoned it. There is a second test. Even after a genuine move, New York taxes you as a full-year resident if you keep a permanent home there for substantially all of the year and spend 184 days or more in the state.</p><p style="${S.pLast}">Keep the Long Island house for the kids and spend half the year visiting, and you can end up filing and paying as a New York resident. If you plan to keep the northern property, or expect to spend much of the year back there, talk to a tax professional before you decide how the year will look. It also affects the 4 percent application here, which asks where you actually live.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Before you pick a neighborhood</p><h2 style="${S.h2}">The mistake we see New York buyers make most</h2><p style="${S.p}">It is not a tax mistake. It is buying into a neighborhood whose rules do not fit how you plan to live. Most homes here sit inside an HOA, and the covenants decide real things: whether a boat or a trailer can park at the house, whether a golf cart can get you anywhere, whether you can rent the place out, and whether the pool and the social calendar you pictured actually exist there.</p><p style="${S.pLast}">Buyers who skip the documents find out after closing. We read them with you before you offer. Start with our ${A('/hoa/', 'HOA guide')} and ${A('/hoa/documents/', 'how to read HOA documents')}.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-from-new-york');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">What the proceeds buy</p><h2 style="${S.h2}">What your New York sale buys here</h2><p style="${S.p}">Overall prices here are about 17 percent below the New York metro area, and housing about 44 percent below. Utilities land about 31 percent lower, everyday goods about 13 percent lower, and other services about 7 percent lower. Typical rent is roughly $1,700 a month against about $3,600. The number most people care about is the house: about $342,000 typical here against about $737,000 there, in July 2026.</p><p style="${S.p}">In practice that means a Nassau or Suffolk sale often clears a Grand Strand purchase outright, which is why so many buyers here pay cash, and why an offer backed by a strong pre-approval matters if you are financing. What you should not do is assume the whole difference is yours to keep. Insurance is higher, the car tax is new, and the first year is when people overspend. That trade is covered honestly on our ${A('/buyers/relocating/pros-and-cons/', 'pros and cons page')}.</p><p style="${S.p}">The proceeds also buy differently town by town. Myrtle Beach on this page includes the towns around it: North Myrtle Beach, Surfside Beach, Garden City, Murrells Inlet and Pawleys Island. The same budget buys a different house in each one, and seeing three towns in an afternoon is a normal showing day here, not a special request. The ${A('/buyers/relocating/which-town/', 'town by town page')} sets out how they differ.</p><p style="${S.pLast}">One thing worth hearing from someone who deals with New York buyers weekly. People arriving from the Northeast tend to expect the pace and the directness they are used to, and it takes a season to adjust. Transactions here move differently, neighbors talk to you, and the summer is genuinely busy in a way winter is not. None of that shows up in a tax table, and all of it shapes whether the move sticks.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">New York to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div>
<p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.tax.ny.gov/', 'New York Department of Taxation and Finance')}, ${X('https://dor.sc.gov/', 'South Carolina Department of Revenue')}, ${X('https://taxfoundation.org/data/all/state/property-taxes-by-state-county/', 'Tax Foundation property taxes by state and county')}, ${X('https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area', 'BEA regional price parities')}, ${X('https://www.zillow.com/research/data/', 'Zillow research data')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
