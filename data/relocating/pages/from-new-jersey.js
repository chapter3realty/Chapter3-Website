/*
 * Page spec: /buyers/relocating/from-new-jersey/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/from-new-jersey.js
 *
 * Cloned from the from-new-york template per its header instruction: every
 * number changed for this state. Facts: research/relocating/state-tax-table.md
 * section 5 (NJ), plus section 1 (SC). Do not change a figure without re-opening
 * the source listed there.
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
  { q: 'How much lower are property taxes in Myrtle Beach than New Jersey?',
    a: 'Bergen County runs about 1.89 percent effective; Horry County runs about 0.38 percent on a primary home, and the primary rate removes the school operating tax. At published rates a $400,000 primary home in the unincorporated county bills roughly $1,470 a year. Seniors should first net off New Jersey&#39;s relief programs, which do not travel.' },
  { q: 'Is there really a New Jersey exit tax when you sell your house?',
    a: 'No. It is an estimated tax withheld at closing when the seller is already a non-resident: the gain at the top rate, and never less than 2 percent of the sale price. It is reconciled on the New Jersey non-resident return and refunded to the extent it exceeds the actual tax. Raise the timing with your New Jersey closing attorney early.' },
  { q: 'Will South Carolina tax my pension more than New Jersey does?',
    a: 'It can. New Jersey excludes up to $100,000 of retirement income for a couple at 62 and older when total income is $150,000 or less, which beats South Carolina&#39;s deductions. Above that cliff New Jersey gives nothing and South Carolina&#39;s deductions win. Social Security is untaxed in both.' },
  { q: 'Do Stay NJ, the Senior Freeze or ANCHOR transfer to South Carolina?',
    a: 'No. They are New Jersey programs and they end with the move. South Carolina&#39;s senior break is different: at 65, after one year of residency, the first $50,000 of a primary home&#39;s value is exempt, with no income test.' },
  { q: 'Is there a car tax in South Carolina?',
    a: 'Yes, and it is yearly. Expect about $360 to $460 on a $30,000 car depending on the town, plus a $50 road fee, billed by the county before the plate will renew. Each vehicle also pays a one-time $250 fee at its first South Carolina registration, within 45 days of the move.' },
  { q: 'What gets more expensive after leaving New Jersey?',
    a: 'Clothing gains an 8 to 9 percent sales tax, every vehicle picks up the yearly tax, and coastal insurance is usually higher than an inland New Jersey policy. Price an insurance quote early; it is the line that moves a monthly budget most.' },
];

const spec = {
  slug: '/buyers/relocating/from-new-jersey/',
  cur: 'buyers-relocating-fromnj',
  title: 'Moving From New Jersey to Myrtle Beach: What You Save',
  description: 'What changes moving from New Jersey to Myrtle Beach: the property tax drop, the senior programs that do not travel, the 2% closing holdback, and the car tax.',
  headline: 'Moving From New Jersey to Myrtle Beach',
  keywords: 'moving from New Jersey to Myrtle Beach, New Jersey to South Carolina taxes, NJ exit tax on home sale',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'From New Jersey', href: '/buyers/relocating/from-new-jersey/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">From New Jersey</span></div><p class="eyebrow" style="margin-bottom:1rem">New Jersey to the Grand Strand</p><h1 class="detail-h1">Moving from New Jersey<br/><em style="font-style:italic;color:var(--brass)">to Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">The property tax drop from New Jersey is the largest we see from any state. Here is that math done honestly, the senior programs that do not move with you, and the closing holdback everyone calls an exit tax.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Put my bills side by side</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">New Jersey and South Carolina, side by side</h2><p style="${S.p}">The property tax line decides this comparison for most households. Each line is explained below.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}"></th><th style="${S.th}">New Jersey</th><th style="${S.th}">South Carolina</th></tr></thead><tbody>
<tr><td style="${S.td}">Top income tax rate</td><td style="${S.td}">10.75%, eight brackets; almost nobody pays it</td><td style="${S.td}">5.21%, two brackets</td></tr>
<tr><td style="${S.td}">Local income tax</td><td style="${S.td}">None</td><td style="${S.td}">None</td></tr>
<tr><td style="${S.td}">Social Security</td><td style="${S.td}">Not taxed</td><td style="${S.td}">Not taxed</td></tr>
<tr><td style="${S.td}">Retirement income exclusion</td><td style="${S.td}">Up to $100,000 joint at 62 and older; nothing above $150,000 of income</td><td style="${S.td}">Deductions up to $10,000 from 65, plus an age-65 deduction</td></tr>
<tr><td style="${S.td}">Property tax, effective rate</td><td style="${S.td}">Bergen County about 1.89%</td><td style="${S.td}">Horry County about 0.38% on a primary home</td></tr>
<tr><td style="${S.td}">Annual tax on your car</td><td style="${S.td}">No</td><td style="${S.td}">Yes, every year</td></tr>
<tr><td style="${S.td}">Estate and inheritance tax</td><td style="${S.td}">No estate tax; inheritance tax on some heirs</td><td style="${S.td}">Neither</td></tr>
<tr><td style="${S.td}">Sales tax on clothing</td><td style="${S.td}">Exempt</td><td style="${S.td}">Taxed at 8% to 9%</td></tr>
<tr><td style="${S.td}">Gas tax</td><td style="${S.td}">49.1 cents a gallon</td><td style="${S.td}">28.75 cents</td></tr>
<tr><td style="${S.td}">Typical home value, July 2026</td><td style="${S.td}">New York metro area about $737,000</td><td style="${S.td}">About $342,000</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Rates are the 2026 tax year. Property figures are the most recent federal survey data. The calculator on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')} runs the full comparison against your income.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Property tax</p><h2 style="${S.h2}">The property tax drop, done honestly</h2><p style="${S.p}">This is the number that moves people. Bergen County runs about 1.89 percent effective. Horry County runs about 0.38 percent on a primary home, and the primary rate also removes the school operating tax. At published rates, a $400,000 owner-occupied home in the unincorporated county bills roughly $1,470 a year. Many New Jersey sellers pay five figures now.</p><h3 style="${S.h3}">If you are 65 or older, do the honest version</h3><p style="${S.p}">New Jersey&#39;s senior relief is real and it does not travel. The programs many owners hold, including one that pays a large share of the bill outright and a freeze on increases, can take thousands off what you actually pay. Net them off your real bill before you count the saving, or the comparison flatters the move.</p><p style="${S.pLast}">South Carolina&#39;s own senior break: at 65, after one year as a resident, the first $50,000 of a primary home&#39;s value comes off before tax, with no income test. You apply for the 4 percent primary rate yourself; the ${A('/buyers/property-taxes/', 'property tax page')} has the calculator and the deadline.</p><p style="${S.p}">You know this pattern from the shore: the famous name is one town on a long coast. It works the same way here. North Myrtle Beach, Surfside Beach, Garden City and Murrells Inlet each carry their own prices and their own property tax bills, and the right town for your budget may be one over from the one you searched. Ask us to show you more than one, or start with the ${A('/buyers/relocating/which-town/', 'town comparison')}.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want your real bill against a real house here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Compare my property tax</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Selling the New Jersey house</p><h2 style="${S.h2}">There is no exit tax. There is a prepayment.</h2><p style="${S.p}">If you sell the New Jersey home after you have already become a South Carolina resident, the closing withholds an estimated income tax payment: the gain at New Jersey&#39;s top rate, and never less than 2 percent of the sale price, even with no gain at all. The deed cannot be recorded without it.</p><p style="${S.p}">The money is not lost. It is an estimated payment, reconciled on your New Jersey non-resident return, and refunded to the extent it exceeds the actual tax. Sell while you are still a New Jersey resident and the withholding generally does not apply. There is also an exemption when the entire gain on a principal residence is excludable under the federal rule.</p><p style="${S.pLast}">New Jersey is one of our most common origin states, and the holdback has not stopped a move we have handled: it is either tax already owed or money that comes back. The order of the sale and the move decides which form applies, and that is a conversation for your New Jersey closing attorney, early. We will not advise on the sequencing; we will tell you it matters.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Pensions</p><h2 style="${S.h2}">Some New Jersey retirees pay more income tax here, not less</h2><p style="${S.p}">New Jersey excludes up to $100,000 of retirement income for a couple at 62 and older, if total income stays at or below $150,000. That is far more generous than South Carolina&#39;s deductions. A retired couple under the cap can genuinely pay more state income tax after the move.</p><p style="${S.pLast}">The cap is a cliff: one dollar of income above $150,000 and New Jersey&#39;s exclusion is gone entirely, while South Carolina&#39;s deductions remain. Social Security and military pensions are untaxed in both states. For most households the property tax difference outweighs all of it, but run the income side before you assume it helps.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The rest of the bill</p><h2 style="${S.h2}">The car, the clothes, the gas and the estate</h2><h3 style="${S.h3}">The car tax is new</h3><p style="${S.p}">New Jersey registers cars by weight and never taxes them as property. Horry County does, every year: about $360 on a $30,000 car outside the city limits, closer to $460 inside Myrtle Beach, plus a $50 road fee, and the plate does not renew until the bill is paid. First registration adds a one-time $250 fee per vehicle, due within 45 days of the move, and the county sends the same kind of bill for a boat or camper. The order of the offices is on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><h3 style="${S.h3}">Clothing gains a tax, gas loses one</h3><p style="${S.p}">New Jersey exempts clothing; here it is taxed at 8 to 9 percent. Gas runs about 20 cents a gallon cheaper on the two states&#39; published fuel taxes, the largest per-gallon drop of any state we compare except Pennsylvania. Groceries are untaxed in both.</p><h3 style="${S.h3}">Estate and inheritance</h3><p style="${S.pLast}">New Jersey has no estate tax but still taxes inheritances left to some heirs, mainly siblings, nieces, nephews and friends; spouses and children are exempt. South Carolina has neither tax. What that means for your own estate is a question for your attorney, not a page.</p></div></section>

<section style="background:var(--navy)" id="lead-form"><div class="wrap" style="padding:3.5rem 1.5rem"><div style="max-width:620px;margin:0 auto">
<p style="font-family:var(--sans);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brass-2);margin-bottom:.7rem;text-align:center">Free, no obligation</p>
<h2 style="font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--ivory);letter-spacing:-.01em;margin-bottom:.6rem;text-align:center">Send us your property tax bill.</h2>
<p style="font-family:var(--sans);font-size:.93rem;color:rgba(244,239,232,.68);margin:0 auto 1.9rem;line-height:1.65;text-align:center;max-width:52ch">We will put it next to the bill on a real house in your range here, with the insurance and the dues included, so the comparison is honest.</p>
<div id="ldWrap">
<div style="display:grid;gap:.7rem;margin-bottom:1rem">
<input class="ld-in" id="ldCtx" placeholder="Your New Jersey county, and your target price range here">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.7rem"><input class="ld-in" id="ldName" placeholder="Your name" autocomplete="name"><input class="ld-in" id="ldPhone" placeholder="Phone" type="tel" autocomplete="tel"></div>
<input class="ld-in" id="ldEmail" placeholder="Email" type="email" autocomplete="email">
</div>
<label style="display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:rgba(244,239,232,.6);line-height:1.5;margin:0 0 1.1rem;cursor:pointer"><input type="checkbox" id="ldConsent" style="margin-top:.18rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.</span></label>
<p id="ldErr" style="display:none;color:#e6b0a9;font-family:var(--sans);font-size:.8rem;margin:0 0 .8rem"></p>
<button class="btn btn-brass" style="width:100%;justify-content:center" onclick="ldSubmit()">Send my tax bill</button>
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
 if(!cx||!n){fail('Add your county and your name.');return;}
 if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}
 if(ph&&!c){fail('Check the consent box so we can call or text you, or leave the phone blank and use email.');return;}
 c3SendForm({property_address:cx,name:n,phone:ph,email:em,consent:c?'yes':'no'},'relocating-from-new-jersey');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>



<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">New Jersey to Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.nj.gov/treasury/taxation/njit7.shtml', 'New Jersey retirement income exclusions')}, ${X('https://www.nj.gov/treasury/taxation/pdf/pubs/tb/tb57r.pdf', 'New Jersey nonresident sale withholding')}, ${X('https://www.nj.gov/treasury/taxation/inheritance-estate/inheritance.shtml', 'New Jersey inheritance tax')}, ${X('https://dor.sc.gov/news/information-about-h-4216', 'South Carolina 2026 income tax')}, ${X('https://taxfoundation.org/data/all/state/property-taxes-by-state-county/', 'Tax Foundation property taxes')}. We are not tax advisers; rates change and your situation decides the answer. Verify with a professional before you plan around any of it.</p></div></section>
`,
};

module.exports = spec;
