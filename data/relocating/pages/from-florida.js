/*
 * Page spec: /buyers/relocating/from-florida/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-florida.js
 *
 * OWNER INSTRUCTION 2026-08-30: the focus is NOT taxes. Lead with the other
 * benefits. The standing rule from state-tax.json movingOutGotcha still
 * binds: never run a tax-savings angle at a Florida buyer, so the taxes are
 * disclosed in full, honestly, in ONE section near the bottom, and nowhere
 * does the page imply the move saves tax money. Facts:
 * research/relocating/local-facts.md H7 (Florida, 2026-08-30), A1/A3
 * (hospitals), C11 (airport), F-golf (around 80, attribute to the local
 * count), col-places.json RPP rows, plus the SC side established in
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
  ctaBox: 'background:var(--white);border:1px solid var(--rule);border-radius:6px;padding:1.2rem 1.3rem;margin-top:1.8rem;max-width:720px;display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between',
  small: 'font-family:var(--sans);font-size:.78rem;color:var(--muted);line-height:1.6;max-width:720px',
  th: 'padding:.6rem .5rem;font-weight:600;text-align:left;border-bottom:1px solid var(--rule)',
  td: 'padding:.6rem .5rem;vertical-align:top;border-bottom:1px solid var(--rule)',
};
const A = (href, text) => `<a href="${href}" style="${S.a}">${text}</a>`;
const X = (href, text) => `<a href="${href}" style="${S.a}" rel="noopener" target="_blank">${text}</a>`;

const faq = [
  { q: 'Why do people move from Florida to Myrtle Beach?',
    a: 'Four reasons repeat in the national data and reporting: the insurance renewal, condo assessments under Florida&#39;s post-Surfside inspection rules, day-to-day costs that grew larger than the income-tax savings, and wanting to be closer to family up north without giving up a mild winter. Home prices matter too: a typical home here cost about $342,000 in July 2026 against about $378,000 statewide there. It is usually not taxes, and the tax section on this page says so plainly.' },
  { q: 'What is a halfback move?',
    a: 'A halfback is a person who moved from the Northeast or Midwest to Florida and then moved partway back north, to the Carolinas, Georgia or Tennessee. The usual reasons are to keep a mild winter and the ocean, pay less to own a home, and live closer to family. In a national count of 2025 moves, South Carolina gained about 5,400 net residents 65 and older, more than any state; more of them came from North Carolina than anywhere else, and Florida was next at nearly 1,900.' },
  { q: 'Is Myrtle Beach cheaper than Florida overall?',
    a: 'On average, yes. The price data behind our cost of living page puts the Myrtle Beach area about nine index points below the Florida statewide average, with housing the widest gap: a typical home costs about $342,000 here against about $378,000 statewide in Florida. Groceries and gas cost less here, and home insurance averages about $4,500 a year against about $6,500 across Florida. One category is higher: state income tax, which Florida does not charge. For most Florida households the house and the insurance outweigh the income tax, and the calculator on this page runs your own numbers.' },
  { q: 'Will I pay state income tax after moving from Florida to South Carolina?',
    a: 'Yes. Florida has none and South Carolina taxes income at 1.99 percent up to $30,000 of taxable income and 5.21 percent past it, after a $30,000 standard deduction for a married couple. A couple on $120,000 of wages pays about $3,700 a year. Social Security is not taxed, and the deductions at 65 leave a modest pension taxed lightly or not at all.' },
  { q: 'Do I keep my Save Our Homes cap or homestead exemption if I leave Florida?',
    a: 'No. The cap&#39;s benefit can transfer to another Florida homestead, but not across the state line. Selling ends it either way: the buyer of your house is reassessed at market value. Your South Carolina house is assessed under South Carolina&#39;s rules, including the 4 percent owner-occupied rate and, at 65 and older after a year of residency, a homestead exemption on the first $50,000 of value.' },
  { q: 'Is homeowners insurance cheaper in Myrtle Beach than in Florida?',
    a: 'On average, yes. Priced on the same $300,000 house, a Myrtle Beach policy averages about $4,500 a year against about $6,500 across Florida, about $15,600 in Miami, about $10,400 in Naples and about $6,300 in Tampa. Jacksonville at about $4,100 and Ocala at about $4,000 cost less than Myrtle Beach. Premiums are set per address, so buy through us and we get you written wind, hail and flood quotes on the exact house before you make an offer.' },
  { q: 'Will my car cost more to own in South Carolina than in Florida?',
    a: 'The tax on it, yes. Florida registration is a flat fee set by the car&#39;s weight. South Carolina bills every vehicle yearly on its value, roughly $360 to $460 on a $30,000 car plus a $50 road fee, and each vehicle pays a one-time $250 fee at its first registration here, due within 45 days of the move.' },
];

const INS_TABLE = `
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch;margin:1.2rem 0 1.4rem"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:420px"><thead><tr><th style="${S.th}">Home insurance, same $300,000 house</th><th style="${S.th}">Average a year</th></tr></thead><tbody>
<tr><td style="${S.td}">Key West</td><td style="${S.td}">$25,860</td></tr>
<tr><td style="${S.td}">Miami</td><td style="${S.td}">$15,576</td></tr>
<tr><td style="${S.td}">Port St. Lucie</td><td style="${S.td}">$13,908</td></tr>
<tr><td style="${S.td}">Naples</td><td style="${S.td}">$10,440</td></tr>
<tr><td style="${S.td}">Cape Coral</td><td style="${S.td}">$8,808</td></tr>
<tr><td style="${S.td}">Pensacola</td><td style="${S.td}">$7,716</td></tr>
<tr><td style="${S.td}"><strong>Florida statewide</strong></td><td style="${S.td}"><strong>$6,504</strong></td></tr>
<tr><td style="${S.td}">Tampa</td><td style="${S.td}">$6,264</td></tr>
<tr><td style="${S.td}">Orlando</td><td style="${S.td}">$5,328</td></tr>
<tr style="background:rgba(196,120,58,.07)"><td style="${S.td}"><strong>Myrtle Beach</strong></td><td style="${S.td}"><strong>$4,472</strong></td></tr>
<tr><td style="${S.td}">Jacksonville</td><td style="${S.td}">$4,080</td></tr>
<tr><td style="${S.td}">Ocala</td><td style="${S.td}">$4,020</td></tr>
<tr><td style="${S.td}">South Carolina statewide</td><td style="${S.td}">$2,796</td></tr>
</tbody></table></div>`;

const spec = {
  slug: '/buyers/relocating/from-florida/',
  cur: 'buyers-relocating-fromfl',
  title: 'Moving From Florida to Myrtle Beach: What You Gain',
  description: 'What Florida movers gain in Myrtle Beach: a lower home price, a smaller beach town with a full airport and six hospitals, and honest numbers on insurance and taxes.',
  headline: 'Moving From Florida to Myrtle Beach',
  keywords: 'moving from Florida to Myrtle Beach, Florida to South Carolina taxes, leaving Florida for South Carolina',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From Florida', href: '/buyers/relocating/from-florida/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From Florida</span></div><p class="eyebrow" style="margin-bottom:1rem">Florida to the Grand Strand</p><h1 class="detail-h1">Moving from Florida<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">What to expect on the house price, the smaller beach town, daily costs, insurance and taxes.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk to a local expert</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">What Florida movers gain here</h2><p style="${S.p}">A typical home here cost about $342,000 in July 2026. The Florida statewide typical was about $378,000, and the large coastal metros cost more: about $478,000 around Miami and Fort Lauderdale, about $554,000 around Naples. Day-to-day prices in the Myrtle Beach area are about nine index points below the Florida average. The airport has ten airlines and more than 50 nonstop routes. Six hospitals serve the area, including the adult Level I trauma center. The local count puts golf at around 80 courses.</p><p style="${S.p}">The reasons Florida movers give are clear: the homeowners insurance renewal, a condo special assessment, prices that rose faster than pay, and overcrowding.</p><p style="${S.pLast}">Insurance is lower here on average. For the same $300,000 of coverage, a Myrtle Beach policy averages about $4,500 a year against about $6,500 across Florida, and the gap is much wider if you are coming from South Florida or the Gulf coast. The ${A('#insurance', 'insurance section')} has the figure for your metro.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Halfbacks</p><h2 style="${S.h2}">Halfway back: why Florida movers choose the Carolinas</h2><p style="${S.p}">A halfback is a person who moved from the Northeast or Midwest to Florida and later moved halfway back, to the Carolinas, Georgia or Tennessee. They want to keep a mild winter and the ocean, pay less to own a home, and live closer to family up north. Florida stopped being what they wanted, so they moved to a state between Florida and home.</p><p style="${S.p}">In a national count of 2025 moves, South Carolina gained more residents 65 and older than any state, about 5,400 net. Nearly 1,900 of them came from Florida, more than from any state except North Carolina. Most people moving into the Myrtle Beach area still come from the Northeast, so a Floridian who grew up in New York or New Jersey will meet neighbors who grew up where they did.</p><p style="${S.pLast}">From here, the mid-Atlantic is one day of driving instead of two. Most Northeast cities are one nonstop flight. Grandchildren can visit in either direction without a connecting flight. Winter stays warm enough to golf year-round. If you are moving for retirement, the ${A('/buyers/retirees/', 'retiring here page')} covers what changes in a purchase after 65.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The biggest number</p><h2 style="${S.h2}">What a Florida sale buys at the coast</h2><p style="${S.p}">Your own metro matters more than the Florida statewide number. In the July 2026 price data, a typical home cost about $478,000 in the Miami and Fort Lauderdale metro, about $554,000 around Naples, about $404,000 around Sarasota and Bradenton, about $387,000 around Orlando, and about $362,000 around Tampa, against about $342,000 here. Sell in one of the higher markets and $342,000 here buys a comparable house with money left over, or the same house with a smaller loan. Sell around Tampa or Orlando and prices are close to ours. Sell in an inland market like Ocala, where a typical home cost about $273,000, and homes here cost more. We will tell you which case you are in before you plan around it.</p><p style="${S.pLast}">The difference can become a smaller loan, a bigger house, or savings. Prices differ by town here, and several towns around Myrtle Beach are smaller and quieter than Myrtle Beach itself. The ${A('/buyers/relocating/which-town/', 'which town page')} compares them before you book a trip.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Selling in Florida and buying here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Start with a real comparison</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The town</p><h2 style="${S.h2}">A smaller beach town that keeps the hospitals and the airport</h2><p style="${S.p}">Many Florida movers want a smaller town without losing a major airport and major hospitals. This area has both. The name Myrtle Beach covers a group of separate towns, and several are much quieter than the name suggests: Surfside Beach, Pawleys Island, Litchfield, Little River, Murrells Inlet. Each has its own price range. Many buyers who start out searching for Myrtle Beach buy in one of these towns instead.</p><p style="${S.p}">Getting back to Florida for family is one flight, and the ${A('/buyers/relocating/getting-around/', 'getting around')} page lists the airlines and the routes. The ${A('/buyers/relocating/healthcare/', 'healthcare page')} lists each hospital with its bed count and address, and three more hospitals are under construction.</p><p style="${S.pLast}">On the county&#39;s unincorporated beaches you can drive a golf cart on the sand from November 1 through February 28, and the ${A('/buyers/relocating/beaches/', 'beach rules page')} has the dog hours and umbrella rules town by town. Summers here are hot, like Florida&#39;s. Autumn and winter are cooler than Florida&#39;s, and winter is cool enough for a jacket. The ${A('/buyers/relocating/weather/', 'weather page')} has the numbers season by season, including the ocean temperature month by month.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Daily costs</p><h2 style="${S.h2}">Groceries, gas and the power bill</h2><p style="${S.p}">Most daily costs are lower here. Groceries cost less than the Florida average and are untaxed in both states. The gas tax is about 11 cents a gallon lower, on top of the price difference at the pump. The typical electric bill is a few dollars a month lower. These numbers come from the same price data behind our ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')}, which compares your own metro against the Grand Strand.</p><p style="${S.pLast}">One cost is higher here: the general sales tax is 8 percent in unincorporated Horry County and 9 percent in the City of Myrtle Beach, against roughly 7 percent average combined in Florida.</p></div></section>

<section style="background:var(--ivory-2)" id="insurance"><div class="wrap"><p style="${S.eyebrow}">Insurance</p><h2 style="${S.h2}">What insurance costs here, and what it costs where you are</h2><p style="${S.p}">On average it costs less here. Priced on the same $300,000 house, a Myrtle Beach policy averages about $4,500 a year. The Florida statewide average is about $6,500. Your own metro matters more than the state number, the same way it does with home prices.</p>${INS_TABLE}<p style="${S.p}">Coming from Miami you would pay roughly $11,000 a year less. From Naples, roughly $6,000 less. From Cape Coral, roughly $4,300 less. From Tampa about $1,800 less and from Orlando about $850 less. Two Florida markets cost less than Myrtle Beach: Jacksonville at about $4,100 and Ocala at about $4,000, and we will tell you that rather than let you find out at renewal.</p><p style="${S.p}">Averages are a point of reference, not a quote. Premiums here are set per address: distance to the water, elevation, roof age and shape, and the parcel&#39;s flood zone. Buy through Chapter 3 Realty and we get you written wind, hail and flood quotes on the exact house before you make an offer, so you compare a real number here against your real Florida bill. The ${A('/buyers/coastal-insurance/', 'coastal insurance page')} explains what sets the premium here, what the wind deductible means in dollars, and when flood coverage is required.</p><p style="${S.p}">If you are selling because of a condo assessment, bring the paperwork when we talk. Florida&#39;s rules after the Surfside collapse require structural inspections of condo and co-op buildings three stories and taller once they reach 30 years, with the association paying for the work, and owners pay those costs through special assessments and higher dues. Those are Florida laws and they do not apply in South Carolina. A condo association in any state can still vote a special assessment, so before you offer on a building here we read its budget, reserves and assessment history with you.</p><p style="${S.pLast}">You have lived through hurricane seasons, so we will keep this short. The ${A('/buyers/relocating/hurricanes/', 'storm history page')} lists every hurricane to reach the Grand Strand since Hugo and what each one did, so you can compare this coast&#39;s storm record with Florida&#39;s.</p></div></section>

<section style="background:var(--ivory)" id="taxes"><div class="wrap"><p style="${S.eyebrow}">Full disclosure</p><h2 style="${S.h2}">The taxes, honestly</h2><p style="${S.pLast}">Most Florida movers pay more total tax after this move, and we would rather show that than hide it. The calculator below opens on a Florida example with the deductions already applied. Change any line to your own numbers and it gives you the difference in dollars. Every tax on both sides is listed under it.</p></div></section>
${taxCalcSection({ preselect: 'FL', bg: 'ivory-2' })}
<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Line by line</p><h2 style="${S.h2}">Every tax, both states</h2>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">Florida</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">State income tax</td><td style="${S.td}">None</td><td style="${S.td}">1.99% up to $30,000, then 5.21%</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Pensions, 401(k)s and IRAs in retirement</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Taxed past the deductions</td></tr>
<tr><td style="${S.td}">Estate or inheritance tax</td><td style="${S.td}">None</td><td style="${S.td}">None</td></tr>
<tr><td style="${S.td}">Property tax on a $378,000 primary home</td><td style="${S.td}">About $2,900 a year at the average rate on a new purchase; a long-held capped home bills less</td><td style="${S.td}">Roughly $1,390 in unincorporated Horry County</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">None; registration is a flat fee by weight</td><td style="${S.td}">Yes, on the car&#39;s value</td></tr>
<tr><td style="${S.td}">Sales tax</td><td style="${S.td}">About 7% average combined</td><td style="${S.td}">8% in the county, 9% in the city</td></tr>
<tr><td style="${S.td}">Gas tax</td><td style="${S.td}">39.4 cents a gallon</td><td style="${S.td}">28.75 cents</td></tr>
</tbody></table></div>
<h3 style="${S.h3}">Income</h3><p style="${S.p}">You start paying a state income tax. A working couple on $120,000 of wages pays about $3,700 a year here that Florida never charged. Retirees pay less: Social Security stays untaxed, and at 65 and older South Carolina deducts up to $15,000 of income per person on top of the standard deduction, which typically leaves a couple receiving $60,000 of pension and $30,000 of Social Security owing nothing. A couple taking $100,000 or more a year from IRAs will owe income tax here, and the calculator below shows the figure. Military retirement is untaxed in both states.</p>
<h3 style="${S.h3}">The house</h3><p style="${S.p}">The property tax is lower here: roughly $1,390 a year on a $378,000 primary home in unincorporated Horry County against about $2,900 at Florida&#39;s average rate on a new purchase. One warning for long-time owners: your current Florida bill is probably lower than that average because of the cap on assessed value, and that protection ends when you sell no matter where you go next, so compare your actual bill instead of the average. The cap&#39;s benefit can move to another Florida homestead but not across the state line. At 65 and older, after a year of residency here, a homestead exemption takes the first $50,000 of value off the bill. The ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the application deadline.</p>
<h3 style="${S.h3}">The car and the estate</h3><p style="${S.p}">The car tax is the one new bill: South Carolina taxes every vehicle yearly on its value, roughly $360 to $460 on a $30,000 car plus a $50 road fee, with a one-time $250 fee per vehicle and a 45 day registration window; steps are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}. Neither state taxes estates or inheritances, so your estate plan does not need to change for tax reasons. Florida charges no tax for moving out of the state.</p>
<p style="${S.pLast}">The calculator below runs all of it against your own numbers and says plainly when the answer is that you would pay more.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want your Florida numbers run against a real house here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Have an expert run it both ways</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>


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

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Florida to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.flsenate.gov/Laws/Constitution', 'Florida Constitution, Article VII')}, ${X('https://floridarevenue.com/property/Documents/pt112.pdf', 'Florida DOR on the assessment cap')}, ${X('https://www.flsenate.gov/Laws/Statutes/2025/320.08', 'Florida vehicle registration fees')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://www.horrycountysc.gov/tax-payer-services/vehicle-tax/', 'Horry County vehicle tax')}, ${X('https://www.hireahelper.com/moving-statistics/retirement-study-2026/', '2025 retiree moving study')}, ${X('https://www.flsenate.gov/Laws/Statutes/2025/553.899', 'Florida inspection law')}, ${X('https://insurify.com/homeowners-insurance/states/', 'home insurance averages by state and city')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
