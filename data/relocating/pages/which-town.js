/*
 * Page spec: /buyers/relocating/which-town/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/which-town.js
 *
 * FAIR HOUSING: this is the highest-risk page shape on the site. The legal
 * review already recorded a BLOCKER (finding 2.1) for copy that pointed a
 * buyer at a geography because of who lived there. This page therefore
 * compares ONLY governance, price, published rules and measured drives, and
 * says plainly that we hand over records instead of characterizing areas.
 * Never add a sentence describing the residents of any town, in any form,
 * including who is 'around all year'.
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
  { q: 'What towns make up the Grand Strand?',
    a: 'Running north to south: Little River, North Myrtle Beach, Myrtle Beach itself, Carolina Forest and Socastee inland, Surfside Beach, Garden City, Murrells Inlet and Pawleys Island, with Conway inland on the Waccamaw River. Some are incorporated cities and towns and some are unincorporated county, which changes the rules that apply.' },
  { q: 'Which Grand Strand town is the cheapest?',
    a: 'On the price ranges we publish for each area, Conway starts lowest at about $120,000 and Little River at about $150,000. Pawleys Island starts highest at about $450,000. Every area has a wide range, so the starting figure matters less than what your budget reaches in each one.' },
  { q: 'Does it matter if a house is inside city limits?',
    a: 'Yes, in four practical ways. Sales tax is 9 percent inside the City of Myrtle Beach against 8 percent in the county. Curbside trash collection is a city service, so outside city limits you arrange it yourself. The free resident beach parking decal is for city residents. And zoning, golf cart and short-term rental rules are set by whoever governs that address.' },
  { q: 'Can I rent out a house on the Grand Strand?',
    a: 'It depends entirely on the address. Myrtle Beach allows short-term rentals only in limited zones. North Myrtle Beach requires an annual permit, a business license and a responsible party. Surfside Beach allows them in certain zones only. Unincorporated county areas are generally more permissive. An HOA can also forbid what the zoning allows.' },
  { q: 'How far apart are the Grand Strand towns?',
    a: 'Closer than people expect. Off-peak from Myrtle Beach it is about 15 minutes to Surfside Beach, 20 to Carolina Forest, 25 to Conway and to Murrells Inlet, 30 to North Myrtle Beach and 35 to Pawleys Island. Summer traffic on US-17 makes all of those longer, sometimes much longer.' },
  { q: 'How do you decide which town to show me?',
    a: 'By what you tell us the house has to do: your budget, what it needs to be near, whether you intend to rent it, and whether you want a golf cart to be legal on your roads. We work from published records, zoning, covenants and permits, and we give you the documents to read yourself rather than characterizing who lives in an area.' },
];

const spec = {
  slug: '/buyers/relocating/which-town/',
  cur: 'buyers-relocating-whichtown',
  title: 'Which Grand Strand Town Is Right for You?',
  description: 'Conway to Pawleys Island, what actually differs between Grand Strand towns: price ranges, city versus county rules, short-term rental limits and real drive times.',
  headline: 'Which Grand Strand Town Is Right for You',
  keywords: 'best area to live Myrtle Beach, Grand Strand towns compared, where to live Myrtle Beach SC',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Which Town', href: '/buyers/relocating/which-town/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Which Town</span></div><p class="eyebrow" style="margin-bottom:1rem">Town by town</p><h1 class="detail-h1">Which Grand Strand town<br/><em style="font-style:italic;color:var(--brass)">is right for you.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Myrtle Beach is one name for a run of towns with different prices and different rules. Four things actually differ, and all four are a matter of record.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Shortlist my towns</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Four things decide which town fits you</h2><p style="${S.p}">People search Myrtle Beach and then buy somewhere else on this list, because the name covers about sixty miles of coast plus the inland towns behind it. These four differences decide the purchase.</p><div class="wt-grid"><div class="wt-cell"><span class="wt-n">1</span><span class="wt-t">City limits, or unincorporated county</span><span class="wt-d">One line on the map sets your sales tax, your trash pickup, your beach parking decal, and who writes the zoning, golf cart and rental rules for your address.</span></div><div class="wt-cell"><span class="wt-n">2</span><span class="wt-t">What your budget reaches</span><span class="wt-d">The starting price in Conway and the starting price on Pawleys Island are more than $300,000 apart.</span></div><div class="wt-cell"><span class="wt-n">3</span><span class="wt-t">Whether you can rent it out</span><span class="wt-d">Rental rules vary more between these towns than anything else, and an HOA can forbid what the zoning allows.</span></div><div class="wt-cell"><span class="wt-n">4</span><span class="wt-t">The drive</span><span class="wt-d">To work, to a hospital, to the airport. Distances are short all year; summer traffic is the variable.</span></div></div><style>.wt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule);max-width:900px;margin-top:.4rem}.wt-cell{display:flex;flex-direction:column;gap:.35rem;background:var(--ivory);padding:1.15rem 1.2rem}.wt-n{font-family:var(--serif);font-size:1.3rem;color:var(--brass);line-height:1}.wt-t{font-family:var(--sans);font-size:.95rem;font-weight:600;color:var(--navy);line-height:1.35}.wt-d{font-family:var(--sans);font-size:.84rem;color:var(--muted);line-height:1.55}</style></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Side by side</p><h2 style="${S.h2}">The towns, with prices and rules</h2>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:680px"><thead><tr><th style="${S.th}">Area</th><th style="${S.th}">Price range</th><th style="${S.th}">Governed by</th><th style="${S.th}">Short-term rentals</th></tr></thead><tbody>
<tr><td style="${S.td}">${A('/submarkets/little-river/', 'Little River')}</td><td style="${S.td}">$150,000 to $800,000</td><td style="${S.td}">Unincorporated county</td><td style="${S.td}">Generally allowed under county rules</td></tr>
<tr><td style="${S.td}">${A('/submarkets/north-myrtle-beach/', 'North Myrtle Beach')}</td><td style="${S.td}">$300,000 to $2,500,000+</td><td style="${S.td}">City</td><td style="${S.td}">Annual permit, business license and a responsible party</td></tr>
<tr><td style="${S.td}">${A('/submarkets/myrtle-beach/', 'Myrtle Beach')}</td><td style="${S.td}">$150,000 to $1,500,000+</td><td style="${S.td}">City</td><td style="${S.td}">Limited zones only; most residential zones no</td></tr>
<tr><td style="${S.td}">${A('/submarkets/carolina-forest/', 'Carolina Forest')}</td><td style="${S.td}">Mostly newer construction</td><td style="${S.td}">Unincorporated county</td><td style="${S.td}">County rules, but HOA covenants usually decide</td></tr>
<tr><td style="${S.td}">${A('/submarkets/conway/', 'Conway')}</td><td style="${S.td}">$120,000 to $500,000</td><td style="${S.td}">City</td><td style="${S.td}">Allowed under city and county rules</td></tr>
<tr><td style="${S.td}">${A('/submarkets/surfside-beach/', 'Surfside Beach')}</td><td style="${S.td}">$250,000 to $1,500,000</td><td style="${S.td}">Town</td><td style="${S.td}">Certain zones only</td></tr>
<tr><td style="${S.td}">${A('/submarkets/garden-city/', 'Garden City')}</td><td style="${S.td}">$225,000 to $1,200,000</td><td style="${S.td}">Mostly unincorporated county</td><td style="${S.td}">Generally allowed under county rules</td></tr>
<tr><td style="${S.td}">${A('/submarkets/murrells-inlet/', 'Murrells Inlet')}</td><td style="${S.td}">$200,000 to $1,000,000+</td><td style="${S.td}">Unincorporated county</td><td style="${S.td}">Allowed; rules differ by county line and by HOA</td></tr>
<tr><td style="${S.td}">${A('/submarkets/pawleys-island/', 'Pawleys Island')}</td><td style="${S.td}">$450,000 to $5,000,000+</td><td style="${S.td}">Town, plus unincorporated mainland</td><td style="${S.td}">Generally allowed, subject to zoning and HOA</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Price ranges are the working ranges on each area page and move with the market. Rental rules are summarized; the governing document for any address is the municipal ordinance and the HOA covenants, not this table. Murrells Inlet and Pawleys Island straddle the Horry and Georgetown county line, which changes which county rules apply.</p>
<div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Not sure which of these your budget reaches?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Shortlist my towns</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">City or county</p><h2 style="${S.h2}">The line that changes four bills at once</h2><p style="${S.p}">This is the difference people miss, because it does not show up in a listing. Whether an address sits inside a municipality or in unincorporated Horry County changes all of the following.</p><h3 style="${S.h3}">Sales tax</h3><p style="${S.p}">Nine percent inside the City of Myrtle Beach, eight percent in the county. Groceries are untaxed either way.</p><h3 style="${S.h3}">Trash</h3><p style="${S.p}">Curbside collection is a city service. Outside city limits you arrange it yourself, and the options and costs are on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p><h3 style="${S.h3}">Beach parking</h3><p style="${S.p}">The free resident parking decal is issued by the city to city residents. Living two streets outside the line means paying at the meters.</p><h3 style="${S.h3}">Golf carts and rentals</h3><p style="${S.pLast}">Both are set by whoever governs the address. A golf cart that is legal on your street may not be legal a mile away, and short-term rental rules change at the same line. Check the address, not the town name.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The drive</p><h2 style="${S.h2}">Everything is closer than it looks, until July</h2><p style="${S.p}">Off-peak driving times to Myrtle Beach, measured on the road network with no traffic in them: Surfside Beach about 15 minutes over 8 miles, Carolina Forest about 20 minutes over 10 miles, Conway about 25 minutes over 14 miles, Murrells Inlet about 25 minutes over 17 miles, North Myrtle Beach about 30 minutes over 20 miles, Pawleys Island about 35 minutes over 26 miles.</p><p style="${S.p}">Those are a model, not a promise. US-17 in July is a different road, and the local workaround is to use SC-31 or SC-22 rather than the highway with all the traffic lights on it.</p><p style="${S.pLast}">Two drives are worth measuring before you choose an area rather than after: the one to whatever medical care your household actually depends on, which the ${A('/buyers/relocating/healthcare/', 'healthcare page')} sets out, and the one to work if you will be earning here, which the ${A('/buyers/relocating/jobs/', 'jobs page')} covers.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Where we landed</p><h2 style="${S.h2}">The people who wrote this page chose their own towns this way</h2><p style="${S.p}">Devin, who wrote this page, lives in Murrells Inlet. The reasons were a list, not a feeling: the office is close, the stores and restaurants he actually uses are close, the beach is close, and Market Common with its bookstore is a short drive. The one thing he leaves the area for is training at Fitness Edge MMA in Carolina Forest. Abdulla, who builds our tools, made the same call and landed in Murrells Inlet too; his gym is Crunch by the mall, a bit further toward Myrtle Beach, and everything else on his list was already nearby.</p><p style="${S.p}">Two client moves show how different the right answer gets. A North Carolina family who wanted land and a house built to their own plan bought in Longs, which is inland, rural and affordable enough that the dream house fit the budget, and they commute. A New York couple went the other direction entirely: a beachfront home in North Myrtle Beach with ocean views, close to places to go out, and near the waterway because they own a boat and wanted to finally use it. Same coast, opposite answers, both correct.</p><p style="${S.p}">Two misconceptions we correct weekly. First, that Myrtle Beach is one big party strip. The entertainment district is real and it is compact; leave the downtown blocks and you are in quiet residential streets, some of them expensive, within a short drive, and the distance between the two is something you choose. Second, that the whole area is a retirement community. About 30 percent of the county is 65 or older, which means about 70 percent is not, and there is a university campus in Conway. Every age buys here, and we work with all of them.</p><p style="${S.pLast}">Longs is not in the table above because it does not have its own page yet. It sits inland past Little River, and it trades drive time for land and price. Ask us about it if that trade sounds like yours.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">How we do this</p><h2 style="${S.h2}">We give you the records, not our opinion of a neighborhood</h2><p style="${S.p}">Fair housing law is strict about agents steering buyers toward or away from areas, and it is strict for good reason. So we do not describe who lives in an area, and you should be wary of any agent who does.</p><p style="${S.p}">What we do instead is hand over what is written down. Zoning and short-term rental rules are municipal ordinances. Rental caps and minimum lease terms are in the HOA covenants. Flood zones are on the federal maps. School attendance zones are on the state and district lookup tools, which the ${A('/buyers/relocating/schools/', 'schools page')} shows you how to use. Every one of those is a document you can read yourself, and we will get you all of them for any address before you make an offer.</p><p style="${S.pLast}">Tell us what the house has to do and what it has to be near. That is a question about property, and it is one we can answer properly.</p></div></section>

<section style="background:var(--navy)" id="lead-form"><div class="wrap" style="padding:3.5rem 1.5rem"><div style="max-width:620px;margin:0 auto">
<p style="font-family:var(--sans);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brass-2);margin-bottom:.7rem;text-align:center">Free, no obligation</p>
<h2 style="font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--ivory);letter-spacing:-.01em;margin-bottom:1.4rem;text-align:center">Leave a name and number.</h2>
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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-which-town');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Go deeper</p><h2 style="${S.h2}">Each area, in detail</h2><p style="${S.pLast}">Every area above has its own page with the market data, the tax and insurance position, the flood picture and the rental rules: ${A('/submarkets/little-river/', 'Little River')}, ${A('/submarkets/north-myrtle-beach/', 'North Myrtle Beach')}, ${A('/submarkets/myrtle-beach/', 'Myrtle Beach')}, ${A('/submarkets/carolina-forest/', 'Carolina Forest')}, ${A('/submarkets/conway/', 'Conway')}, ${A('/submarkets/surfside-beach/', 'Surfside Beach')}, ${A('/submarkets/garden-city/', 'Garden City')}, ${A('/submarkets/murrells-inlet/', 'Murrells Inlet')} and ${A('/submarkets/pawleys-island/', 'Pawleys Island')}.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Grand Strand towns FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyzes himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> municipal ordinances for each town, ${X('https://www.horrycountysc.gov/', 'Horry County')}, ${X('https://msc.fema.gov/portal/home', 'FEMA flood map service center')}, ${X('https://dor.sc.gov/', 'SC Department of Revenue')} for sales tax, and our own area pages for price ranges. Drive times are off-peak model estimates with no traffic in them. Rules change; the ordinance and the covenants that apply to a specific address govern, not this page.</p></div></section>
`,
};

module.exports = spec;
