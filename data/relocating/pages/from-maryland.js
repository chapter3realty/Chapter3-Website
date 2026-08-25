/*
 * Page spec: /buyers/relocating/from-maryland/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-maryland.js
 *
 * Maryland figures trace to research/relocating/state-tax-table.md SECTION 10,
 * which is the primary-source pass done 2026-08-25. Section 7.1 is the older
 * AARP-based sketch and must not be used for anything on this page.
 * Two things section 10 forbids and this page obeys:
 *   - no county-by-county local rate pairing (the booklet extraction was not
 *     reliable on names), only the range and the two 2026 changes;
 *   - no claim about Maryland's annual vehicle tax beyond 'Maryland does not
 *     bill you yearly for your car', which is what the comparison needs.
 * The pension exclusion is indexed, so it is always printed with its tax year.
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
  { q: 'Is South Carolina cheaper than Maryland?',
    a: 'On tax, yes for most households, and the county income tax is the reason. Every Maryland county and Baltimore City charges one on top of the state rate, and most sit at 3.20 percent. South Carolina has no local income tax anywhere. Property tax and a typical house both cost less here too.' },
  { q: 'Does Maryland have a local income tax?',
    a: 'Yes. Every county and Baltimore City levies one on top of the state rate. On the Comptroller’s 2025 chart the rates run from 2.65 percent to 3.30 percent, with most counties at 3.20 percent. Two changed for 2026: Allegany rose to 3.20 percent and Kent to 3.30 percent. South Carolina charges none.' },
  { q: 'Does Maryland tax my retirement income?',
    a: 'Social Security is not taxed in Maryland. Other pension and retirement income is taxed, with a pension exclusion for taxpayers who are 65 or older or totally disabled: $39,500 for tax year 2024 and $41,200 for tax year 2025, indexed each year. Military retirees at least 55 may subtract up to $20,000.' },
  { q: 'What is the Maryland estate and inheritance tax?',
    a: 'Maryland is the only state with both. The estate tax applies above a $5 million exemption at rates up to 16 percent, and a separate inheritance tax applies to property passing to non-lineal heirs. Direct lineal heirs are exempt from the inheritance tax. South Carolina has neither.' },
  { q: 'Will I pay a new tax on my car in South Carolina?',
    a: 'Yes, and for most movers it is the surprise. South Carolina taxes every vehicle on its value each year, and the county bill must be paid before the plate renews. A car titled elsewhere also pays a one-time $250 fee at first registration, and you have 45 days from the move to register.' },
  { q: 'How much does a house cost in Myrtle Beach compared with Maryland?',
    a: 'A typical home here runs about $342,000. Maryland is too varied for one median to be useful against that, because Montgomery County and the Eastern Shore are different markets. Compare your own city with here on our cost of living calculator instead of working from a statewide figure.' },
];

const spec = {
  slug: '/buyers/relocating/from-maryland/',
  cur: 'buyers-relocating-frommd',
  title: 'Moving From Maryland to Myrtle Beach: The Tax You Stop Paying',
  description: 'What changes moving from Maryland to Myrtle Beach: the county income tax you stop paying, the estate and inheritance taxes, property tax, and the new car tax.',
  headline: 'Moving From Maryland to Myrtle Beach',
  keywords: 'moving from Maryland to Myrtle Beach, Maryland to South Carolina taxes, Maryland local income tax',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From Maryland', href: '/buyers/relocating/from-maryland/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From Maryland</span></div><p class="eyebrow" style="margin-bottom:1rem">Maryland to the Grand Strand</p><h1 class="detail-h1">Moving from Maryland<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Maryland charges a county income tax on top of the state rate. You stop paying it when you move here, and for a working household that is the biggest change on this page.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Compare Maryland with here</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Maryland and South Carolina, side by side</h2><p style="${S.p}">Each line is explained below. Rates are the 2026 tax year unless the line says otherwise.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:580px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">Maryland</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">State income tax</td><td style="${S.td}">2% to 6.5%, graduated</td><td style="${S.td}">1.99% up to $30,000, then 5.21%</td></tr>
<tr><td style="${S.td}">Local income tax</td><td style="${S.td}">Every county and Baltimore City; most at 3.20%</td><td style="${S.td}">None anywhere</td></tr>
<tr><td style="${S.td}">Extra tax on capital gains</td><td style="${S.td}">2% above $350,000 of federal AGI</td><td style="${S.td}">None</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Other retirement income</td><td style="${S.td}">Taxed past the pension exclusion at 65</td><td style="${S.td}">Taxed past the retirement deductions; military exempt</td></tr>
<tr><td style="${S.td}">Property tax, statewide effective rate</td><td style="${S.td}">0.92%</td><td style="${S.td}">0.49%; Horry County about 0.38% on a primary home</td></tr>
<tr><td style="${S.td}">Median property tax bill</td><td style="${S.td}">$4,144</td><td style="${S.td}">$1,337</td></tr>
<tr><td style="${S.td}">Sales tax</td><td style="${S.td}">6.00%, no local add-on</td><td style="${S.td}">8% in the county, 9% inside Myrtle Beach</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">No</td><td style="${S.td}">Yes, on value, every year</td></tr>
<tr><td style="${S.td}">Estate and inheritance tax</td><td style="${S.td}">Both. Estate above $5,000,000; inheritance on non-lineal heirs</td><td style="${S.td}">Neither</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Maryland rates from the Comptroller of Maryland. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The county tax</p><h2 style="${S.h2}">You stop paying the county income tax</h2><p style="${S.p}">Maryland is unusual. Every county and Baltimore City charges an income tax on top of the state rate, and you pay it based on where you live rather than where you work. On the Comptroller&#39;s own 2025 rate chart those local rates run from 2.65 percent to 3.30 percent, and the great majority of counties sit at 3.20 percent. Two moved for 2026: Allegany rose to 3.20 percent and Kent to 3.30 percent.</p><p style="${S.p}">South Carolina has no local income tax anywhere, in any county or town. So a Maryland household earning here keeps that entire amount, and it applies to the first dollar of income rather than the last.</p><p style="${S.p}">The state rates themselves are closer than people expect. Maryland runs 4.75 percent on most middle incomes, up to $150,000 of taxable income on a joint return. South Carolina charges 1.99 percent on the first $30,000 and 5.21 percent above it, with a deduction that shrinks as joint income climbs from $80,000 to $190,000. Compare the state lines and it is not obvious. Add the county tax and it is.</p><p style="${S.pLast}">Two Maryland rules bite harder at the top. The 2025 legislative session added brackets of 6.25 and 6.5 percent above $600,000 and $1,200,000 of taxable income on a joint return, and it imposed an additional 2 percent tax on net capital gains for anyone with federal adjusted gross income over $350,000. Maryland itemized deductions also phase out above $200,000 of federal AGI. If you are selling a business or a large position in the same year you move, the timing of that sale matters and it is a question for your accountant before you list the house.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want your Maryland bills against a real house here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Run my county tax saving</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Retirees</p><h2 style="${S.h2}">Check which exclusion you are relying on</h2><p style="${S.p}">Social Security is untaxed in both states, so that part of the move is neutral. Everything else needs looking at, because Maryland&#39;s pension exclusion is generous and it is age-gated.</p><p style="${S.p}">Maryland excludes up to $39,500 of qualifying pension and retirement income for tax year 2024, and up to $41,200 for tax year 2025, if you were 65 or older on the last day of the year or you or your spouse were totally disabled. The figure is indexed, so always check the year on any number you are quoted, including this one. Military retirees at least 55 may subtract up to $20,000 of military retirement income.</p><p style="${S.pLast}">South Carolina exempts military retirement fully at any age. Other retirement income is sheltered by a retirement deduction of up to $3,000 before 65 and up to $10,000 from 65, plus a separate age-65 deduction of up to $15,000. So a Maryland retiree already over 65 and drawing a large pension may find the income tax comparison closer than expected, while the county tax, the property tax and the estate tax all still move in their favor. Run it both ways before you decide, and the ${A('/buyers/retirees/', 'retiree page')} covers what else changes.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The estate</p><h2 style="${S.h2}">Maryland is the only state that charges both</h2><p style="${S.p}">Maryland levies an estate tax and an inheritance tax. The estate tax applies above a $5 million exemption at rates reaching 16 percent. The inheritance tax applies to property passing to heirs who are not direct lineal relatives, so children and grandchildren are exempt from it while a niece, a nephew or a friend is not.</p><p style="${S.pLast}">South Carolina has neither. For a household with a paid-off house and retirement accounts, and for anyone whose plan leaves property to someone other than their children, this is a larger number than the annual tax lines above it. Where you are domiciled at death is what decides it, so if a move is part of that plan, do it properly rather than halfway. We are not tax advisers and this is a conversation for your own; what we can tell you is that it comes up on this page more than any other.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The rest of the bill</p><h2 style="${S.h2}">Property tax drops, sales tax rises, and the car is new</h2><h3 style="${S.h3}">Property tax</h3><p style="${S.p}">Maryland runs about 0.92 percent effective statewide with a median bill of $4,144. South Carolina runs about 0.49 percent, and Horry County about 0.38 percent on a primary home, where the primary rate also removes the school operating tax. The median bill here is $1,337. You apply for the primary rate yourself, and the ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline.</p><h3 style="${S.h3}">The car tax is genuinely new</h3><p style="${S.p}">This is the one that catches Maryland movers, because Maryland does not bill you for your car every year. Here every vehicle is taxed on its value annually, the county bill must be paid before the plate renews, and a vehicle titled elsewhere pays a one-time $250 fee at first registration. You have 45 days from the move. Boats and campers work the same way. The steps in order are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><h3 style="${S.h3}">Sales tax goes up</h3><p style="${S.pLast}">Maryland charges 6 percent with no local add-on, and exempts groceries. Here it is 8 percent in the county and 9 percent inside the City of Myrtle Beach, and groceries are untaxed in Horry County. On everything that is not food, you will pay more.</p></div></section>

<section style="background:var(--navy)" id="lead-form"><div class="wrap" style="padding:3.5rem 1.5rem"><div style="max-width:620px;margin:0 auto">
<p style="font-family:var(--sans);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brass-2);margin-bottom:.7rem;text-align:center">Free, no obligation</p>
<h2 style="font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--ivory);letter-spacing:-.01em;margin-bottom:.6rem;text-align:center">Tell us which part of Maryland you are leaving.</h2>
<p style="font-family:var(--sans);font-size:.93rem;color:rgba(244,239,232,.68);margin:0 auto 1.9rem;line-height:1.65;text-align:center;max-width:52ch">We will put your current bills next to the real ones on a house in your range here, including the county income tax you stop paying.</p>
<div id="ldWrap">
<div style="display:grid;gap:.7rem;margin-bottom:1rem">
<input class="ld-in" id="ldCtx" placeholder="Where in Maryland you are, and your price range here">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.7rem"><input class="ld-in" id="ldName" placeholder="Your name" autocomplete="name"><input class="ld-in" id="ldPhone" placeholder="Phone" type="tel" autocomplete="tel"></div>
<input class="ld-in" id="ldEmail" placeholder="Email" type="email" autocomplete="email">
</div>
<label style="display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:rgba(244,239,232,.6);line-height:1.5;margin:0 0 1.1rem;cursor:pointer"><input type="checkbox" id="ldConsent" style="margin-top:.18rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.</span></label>
<p id="ldErr" style="display:none;color:#e6b0a9;font-family:var(--sans);font-size:.8rem;margin:0 0 .8rem"></p>
<button class="btn btn-brass" style="width:100%;justify-content:center" onclick="ldSubmit()">Send my Maryland numbers</button>
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
 var cx=document.getElementById('ldCtx').value.trim(),n=document.getElementById('ldName').value.trim(),ph=document.getElementById('ldPhone').value.trim(),em=document.getElementById('ldEmail').value.trim(),c=document.getElementById('ldConsent').checked,err=document.getElementById('ldErr');
 function fail(m){err.textContent=m;err.style.display='block';}
 err.style.display='none';
 if(!cx||!n){fail('Add your Ohio city and your name.');return;}
 if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}
 if(ph&&!c){fail('Check the consent box so we can call or text you, or leave the phone blank and use email.');return;}
 c3SendForm({property_address:cx,name:n,phone:ph,email:em,consent:c?'yes':'no'},'relocating-from-maryland');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">What the sale buys</p><h2 style="${S.h2}">What a Maryland sale buys at the coast</h2><p style="${S.p}">A typical home here runs about $342,000. We are not going to put a single Maryland number next to that, because Maryland covers everything from Montgomery County to the Eastern Shore and one median would mislead you. Run your own address instead: the ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')} compares your actual city with here in about a minute. What we can tell you from the tax side is already on this page, and the property tax on whatever you buy drops from a $4,144 median bill to a $1,337 one. If you will be earning here rather than bringing income with you, the ${A('/buyers/relocating/jobs/', 'jobs page')} sets out the local pay honestly.</p><p style="${S.pLast}">Where that budget goes is a separate question. Myrtle Beach on this page means the whole run of towns: Conway inland, North Myrtle Beach and Little River to the north, Surfside Beach, Murrells Inlet and Pawleys Island to the south. The same money buys a different house in each, and the ${A('/buyers/relocating/which-town/', 'town by town page')} lays out what actually differs between them.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">First hand</p><h2 style="${S.h2}">What a Howard County transplant noticed here</h2><p style="${S.p}">A colleague of ours made this exact move from Clarksville and then Columbia, in Howard County. Three of his observations hold up and are worth having before you arrive.</p><p style="${S.p}">The organic food moved from the store to the farm. He finds the grocery stores here carry less of what he bought off the shelf in Maryland, and the answer turned out to be the farm stands and butcher shops, which are more common here and closer to town than the ones he knew in Maryland.</p><p style="${S.p}">Summer is motorcycle season. He counts far more bikes here than he ever saw in Maryland, and Devin, who wrote this page, rides one himself: the roads are flat and straight, and the riding season is most of the year.</p><p style="${S.pLast}">There is construction everywhere, because the growth statistics on our ${A('/buyers/relocating/jobs/', 'jobs page')} are visible from the road. New neighborhoods, new stores and three new hospitals at once. Coming from a settled Maryland suburb, that is the change he says you notice first.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Maryland to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyzes himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.marylandcomptroller.gov/content/dam/mdcomp/md/state-payroll/memos/2026/2026-maryland-state-and-local-withholding-information.pdf', 'Comptroller of Maryland 2026 withholding information')}, ${X('https://www.marylandcomptroller.gov/content/dam/mdcomp/tax/instructions/2025/resident-booklet.pdf', 'Maryland 2025 resident booklet')}, ${X('https://www.marylandcomptroller.gov/content/dam/mdcomp/tax/legal-publications/technical-bulletins/tb-51.pdf', 'Maryland Technical Bulletin 51')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://taxfoundation.org/data/all/state/property-taxes-by-state-county/', 'Tax Foundation property taxes')}, ${X('https://www.census.gov/quickfacts/', 'Census QuickFacts')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
