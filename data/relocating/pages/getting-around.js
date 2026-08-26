/*
 * Page spec: generated for the relocating cluster.
 * Facts: local-facts.md C10-C14 plus 2026-08-26 re-checks (airline count
 * reconfirmed at ten; still no 2025 passenger release, so 2024 stays "last
 * published year"). I-73 wording rule: never imply a date. Fare wording
 * rule: "about a dollar, check the site" because the operator contradicts
 * itself. AADT numbers only from the 2025 SCDOT sheet.
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
  { q: 'Does Myrtle Beach have an airport?',
    a: 'Yes, inside the city. Myrtle Beach International had ten airlines and nonstop service to more than 50 cities as of August 2026, and 3.8 million passengers in 2024, the last full year it has published. A terminal expansion opened in December 2025.' },
  { q: 'Do you need a car in Myrtle Beach?',
    a: 'Plan on one. The public bus runs seven days a week and covers the main towns, but routes are limited and most daily life here is built around driving. Many neighborhoods also allow golf carts on local streets, with a permit.' },
  { q: 'Is there public transportation in Myrtle Beach?',
    a: 'Coast RTA runs ten fixed bus routes seven days a week, 362 days a year, serving Myrtle Beach, Conway, Surfside Beach, Garden City, Murrells Inlet, Pawleys Island, Georgetown, Loris and more. Fares are about a dollar a ride; check the current table on their site. Every bus is wheelchair accessible.' },
  { q: 'Is I-73 to Myrtle Beach built yet?',
    a: 'No. As of 2026 no segment of I-73 in South Carolina is open or under construction. The state is buying right of way between I-95 and the coast, and the county has set aside conditional matching money, but no construction contract exists. Treat any completion date you hear as a guess.' },
  { q: 'What is the difference between US 17 Business and US 17 Bypass?',
    a: 'Two parallel roads. Business is Kings Highway, the older road near the ocean with stoplights and driveways. The Bypass is the divided highway inland of it, carrying much more traffic: its busiest stretch counted 82,200 vehicles a day in 2025, the highest in the county. SC 31 runs even further inland with almost no lights.' },
  { q: 'How far is Myrtle Beach from Charleston or Charlotte?',
    a: 'Measured on the road network with no traffic: Charleston about 98 miles and 2 hours 15 minutes, Wilmington about 74 miles and 1 hour 45, Charlotte about 170 miles and 3 hours 40, Raleigh about 186 miles and 3 hours 45, Columbia about 138 miles and 3 hours 5.' },
];

const spec = {
  slug: '/buyers/relocating/getting-around/',
  cur: 'buyers-relocating-getting-around',
  title: 'Getting Around Myrtle Beach: Airport, Roads and Drive Times',
  description: 'How Myrtle Beach actually moves: ten airlines and 50 plus nonstop cities at MYR, the two US 17s, the freeways locals use, the bus, and the honest status of I-73.',
  headline: 'Getting Around Myrtle Beach: the Airport, the Roads and the Bus',
  keywords: 'Myrtle Beach airport flights, getting around Myrtle Beach, I-73 South Carolina, US 17 Bypass vs Business',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Getting Around', href: '/buyers/relocating/getting-around/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Getting Around</span></div><p class="eyebrow" style="margin-bottom:1rem">Planes, roads and the bus</p><h1 class="detail-h1">Getting around Myrtle Beach<br/><em style="font-style:italic;color:var(--brass)">when you live here.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Moving to Myrtle Beach without an interstate: the airport with 50 plus nonstop cities, the freeways locals use to skip beach traffic, real drive times to Charlotte and Charleston, the bus, and the honest status of I-73.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Ask a local</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The airport</p><h2 style="${S.h2}">The airport is in town, and the family can fly straight here</h2><p style="${S.p}">Myrtle Beach International sits inside the city, minutes from most of the Grand Strand rather than an hour out. As of August 2026 it lists ten airlines and nonstop service to more than 50 cities, and the airline list changes several times a year, so check the current ${X('https://www.flymyrtlebeach.com/flight-information/route-map/', 'route map')} for your own city. The terminal was expanded in December 2025, and the airport took top national rankings in USA Today&#39;s 10Best readers&#39; choice awards in October 2025.</p><h3 style="${S.h3}">What that is worth when you live here</h3><p style="${S.p}">You can get back to where you came from without a connection, and the people you left can get to you. One of our clients works his New York job in alternating weeks from here, which the ${A('/buyers/relocating/jobs/', 'jobs page')} covers. It also shapes where to buy: the airport sits at the south end of Myrtle Beach beside Market Common, so Surfside Beach and Socastee are about 15 minutes from a departure, and even North Myrtle Beach or Pawleys Island is about half an hour. Tell us which trips you make most and we will keep the airport run in mind when we build your showing list.</p><h3 style="${S.h3}">Notes from our own trips</h3><p style="${S.pLast}">An hour is enough with no checked bag. With real luggage plan on two and a half hours, because bag check closes out well before departure and same day ticket sales stop roughly two hours before takeoff, in our experience. Allegiant&#39;s own fee schedule lists a $22 per passenger, per segment charge on bookings made on the website or call center; buy at the airport counter instead and that charge does not apply, and the counter is staffed around departures, which is workable once you live here. Some of our clients hold Frontier&#39;s ${X('https://www.flyfrontier.com/deals/gowild-pass/', 'GoWild all you can fly pass')}: as of August 2026 Frontier&#39;s nonstops from here are Cleveland and Long Island, and the pass also books connecting routes.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The roads</p><h2 style="${S.h2}">Two US 17s and two freeways: learn these four names first</h2><h3 style="${S.h3}">US 17 Business is Kings Highway</h3><p style="${S.p}">The old road, closest to the ocean, running through the beachfront strip with stoplights and driveways. Slowest, most scenic, most tourist traffic.</p><h3 style="${S.h3}">US 17 Bypass carries the most traffic</h3><p style="${S.p}">The divided highway just inland. Its busiest stretch, between SC 707 and US 501, counted 82,200 vehicles a day in 2025, the highest figure in the county.</p><h3 style="${S.h3}">SC 31 and SC 22 are the roads locals use</h3><p style="${S.p}">Two limited access freeways further inland, built under the county&#39;s road sales tax. SC 31 runs behind the beach from Little River to Socastee; SC 22 connects the Conway area to the north strand. Almost no stoplights on either. The county&#39;s own planning document says many returning tourists avoid or are unaware of these roads, which is exactly why a ten mile drive on them beats the same ten miles on the beach highway, measured on the ${A('/buyers/relocating/which-town/', 'town by town page')}.</p><h3 style="${S.h3}">US 501 is the road inland</h3><p style="${S.p}">The main road to Conway and onward toward I-95. A surface road with lights, not a freeway, and it carries up to 65,900 vehicles a day near the beach. If your life will run between Conway and the coast daily, drive your exact commute once before you offer on a house.</p><p style="${S.pLast}">One concrete commute, Devin&#39;s: US 17 from Murrells Inlet to Surfside Beach at 7 a.m. is wide open, the run up to Carolina Forest near 5 p.m. is a little busy, and the only place he reliably waits is the traffic lights entering and leaving Carolina Forest. In three years of daily driving he has yet to sit in traffic on SC 31.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The interstate</p><h2 style="${S.h2}">There is no interstate to Myrtle Beach, and here is the honest status of I-73</h2><p style="${S.p}">Myrtle Beach is one of the largest US metros with no interstate connection, and the planned fix is I-73, which would link the coast to I-95. As of 2026 the truthful status is this: no segment is open, no segment is under construction, and no construction contract has been signed. The state has bought about 99 percent of the right of way between I-95 and US 501 and most of the next stretch, and the county has set aside 450 million dollars of conditional matching money that only unlocks when the state signs construction contracts. There is no opening date yet.</p><p style="${S.pLast}">Separately, the two Carolinas are studying an extension of SC 31 north across the state line to US 17 near Shallotte. Hearings were held in autumn 2025; construction, if it happens, was reported as unlikely to begin before 2029. Until either project moves, the practical routes to the wider world are US 501 to I-95, and US 17 along the coast.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The bus, honestly</p><h2 style="${S.h2}">Coast RTA exists and is thin: plan on a car</h2><p style="${S.p}">The public bus, Coast RTA, runs ten fixed routes, seven days a week, 362 days a year, reaching Myrtle Beach, Conway, Surfside Beach, Garden City, Murrells Inlet, Pawleys Island, Georgetown, Loris and more. Every bus is wheelchair accessible. The fare is about a dollar a ride with a daily cap when you tap a card; the operator&#39;s posted tables vary, so check the current fare on their site before you rely on it.</p><p style="${S.pLast}">What it is not is a system you can build a commute around in most of the county. The main Conway to Myrtle Beach route starts about 6 a.m. and finishes its last runs by about 9 p.m., and its express version runs twice a day each way. Households here run on cars, and many neighborhoods add a golf cart for local streets, which takes a five dollar permit covered on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Day trips</p><h2 style="${S.h2}">What is within a drive, measured</h2>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:480px"><thead><tr><th style="${S.th}">To</th><th style="${S.th}">Road miles</th><th style="${S.th}">Off-peak drive</th></tr></thead><tbody>
<tr><td style="${S.td}">Wilmington, NC</td><td style="${S.td}">74</td><td style="${S.td}">about 1 h 45 m</td></tr>
<tr><td style="${S.td}">Florence, SC</td><td style="${S.td}">67</td><td style="${S.td}">about 1 h 30 m</td></tr>
<tr><td style="${S.td}">Charleston, SC</td><td style="${S.td}">98</td><td style="${S.td}">about 2 h 15 m</td></tr>
<tr><td style="${S.td}">Columbia, SC</td><td style="${S.td}">138</td><td style="${S.td}">about 3 h 5 m</td></tr>
<tr><td style="${S.td}">Charlotte, NC</td><td style="${S.td}">170</td><td style="${S.td}">about 3 h 40 m</td></tr>
<tr><td style="${S.td}">Raleigh, NC</td><td style="${S.td}">186</td><td style="${S.td}">about 3 h 45 m</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Measured on the public road network, city center to city center, with no traffic in the times. Summer weekends run longer. The same measurement for the towns inside the Grand Strand is on the ${A('/buyers/relocating/which-town/', 'town by town page')}.</p>
<div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Are these better roads than your current city?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Speak to an agent</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-getting-around');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Getting around Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.flymyrtlebeach.com/flight-information/airlines/', 'Myrtle Beach International Airport')}, ${X('https://www.scdot.org/content/dam/scdot-legacy/travel/pdf/trafficcounts/2025/HORRY.pdf', 'SCDOT 2025 Horry County traffic counts')}, ${X('https://roads.horrycountysc.gov/projects/interstate-connector/', 'Horry County I-73 project page')}, ${X('https://coastrta.com/how-to-ride/', 'Coast RTA')}, ${X('https://www.allegiantair.com/popup/taxes-and-fees', 'Allegiant fee schedule')}. Airport figures are as of August 2026 and change; drive times are off-peak models. We are not a travel service and schedules are the operators&#39; to keep.</p></div></section>
`,
};

module.exports = spec;
