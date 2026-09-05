/*
 * Page spec: /buyers/relocating/beaches/
 * Every rule traces to the jurisdiction's own page, opened 2026-08-27.
 * DIVISION OF LABOR: the checklist owns HOW to get the parking decal and
 * the golf cart road permit; the weather page owns water temperatures;
 * which-town owns town character. This page owns the RULES ON THE SAND.
 * Never blend jurisdictions: the county's year-round umbrella-only rule
 * and Pawleys' year-round dogs are true ONLY where stated.
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
  { q: 'Are dogs allowed on the beach in Myrtle Beach?',
    a: 'Yes. In the City of Myrtle Beach dogs are allowed before 10 a.m. and after 5 p.m. from May 1 through Labor Day, and at any hour the rest of the year, always on a leash of 7 feet or shorter. Each town sets its own clock: North Myrtle Beach allows dogs before 10 a.m. and after 4 p.m. starting May 15, and Pawleys Island allows dogs year round at any hour.' },
  { q: 'Which beach near Myrtle Beach allows dogs all day in summer?',
    a: 'Pawleys Island. The town allows dogs on the beach year round with no daytime ban: leashed 8 a.m. to 8 p.m. from May 1 through September 30, and off leash under voice control, leash in hand, from October through April. Every other beach on the Grand Strand runs a midday summer ban.' },
  { q: 'Are tents allowed on Myrtle Beach beaches?',
    a: 'Depends on the town and the season. Myrtle Beach allows only round umbrellas up to 7.5 feet from Memorial Day through Labor Day, with tents up to 12 by 12 the rest of the year. North Myrtle Beach is umbrella-only May 15 through Labor Day. Surfside Beach allows canopies up to 10 by 10. County beaches like Garden City are umbrella-only all year.' },
  { q: 'Is alcohol allowed on the beach in Myrtle Beach?',
    a: 'No. Alcohol and glass are prohibited on every beach on the Grand Strand, and on the county beaches the ban covers the access paths too. Fires, including barbecues, are prohibited, and holes deeper than two feet are not allowed in Myrtle Beach; fill any hole before you leave.' },
  { q: 'Can you drive a golf cart on the beach in Myrtle Beach?',
    a: 'Not in the cities. On Horry County&#39;s unincorporated beaches, which include stretches of Garden City, permitted golf carts with a licensed driver are allowed on the sand from November 1 through February 28. That winter season is the exception, not the rule, and the cities do not offer one.' },
  { q: 'Do you have to pay to park at the beach?',
    a: 'Depends where you live and where you park. The City of Myrtle Beach sells no visitor pass but gives its residents a decal covering city paid spaces. North Myrtle Beach posts its rules at each access. Surfside Beach uses town decals. Where you buy decides which program you are in, so pick your town deliberately.' },
];

const spec = {
  slug: '/buyers/relocating/beaches/',
  cur: 'buyers-relocating-beaches',
  title: 'Myrtle Beach Beach Rules by Town: Dogs, Tents, Parking',
  description: 'Beach rules across the Grand Strand, town by town: when dogs are allowed, umbrella and tent limits, parking, the winter golf cart season, and who sets each rule.',
  headline: 'Beach Rules on the Grand Strand, Town by Town',
  keywords: 'Myrtle Beach beach rules, dogs on beach Myrtle Beach, beach tent rules Myrtle Beach, golf cart on beach',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Beaches', href: '/buyers/relocating/beaches/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Beaches</span></div><p class="eyebrow" style="margin-bottom:1rem">The sand, practically</p><h1 class="detail-h1">The beaches,<br/><em style="font-style:italic;color:var(--brass)">town by town.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Tim Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Dog hours, tent and umbrella rules, parking and golf carts on the sand, town by town for every Grand Strand beach, before you pick a town.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Ask us about the beaches</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Same ocean, five sets of rules</h2><p style="${S.p}">The Grand Strand&#39;s sand belongs to different governments: the cities of Myrtle Beach and North Myrtle Beach, the towns of Surfside Beach and Pawleys Island, and Horry County for the unincorporated stretches such as most of Garden City. Each writes its own beach rules, and they differ. Where you buy decides which government&#39;s rules apply on your everyday beach.</p><p style="${S.pLast}">Three rules are the same everywhere: no alcohol, no glass, no fires on the sand, anywhere. Everything else varies, and the two tables below carry the differences that change how you would use the beach: the dog clock and the shade rules. If one of these tables decides your town for you, the ${A('/buyers/relocating/which-town/', 'town by town page')} carries prices and the rest.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Dogs</p><h2 style="${S.h2}">The dog clock, beach by beach</h2><p style="${S.p}">Every beach here allows dogs most of the year. The difference is summer. The table below states the hours dogs are allowed, in season and off, so you do not have to work it out from the ban times. Leashes are required on all of them, 7 feet or shorter.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:620px"><thead><tr><th style="${S.th}">Beach</th><th style="${S.th}">In season, dogs allowed</th><th style="${S.th}">The season</th><th style="${S.th}">Off season, dogs allowed</th></tr></thead><tbody>
<tr><td style="${S.td}">Myrtle Beach</td><td style="${S.td}">Before 10 a.m. and after 5 p.m.</td><td style="${S.td}">May 1 to Labor Day</td><td style="${S.td}">Any hour</td></tr>
<tr><td style="${S.td}">North Myrtle Beach</td><td style="${S.td}">Before 10 a.m. and after 4 p.m.</td><td style="${S.td}">May 15 to Labor Day</td><td style="${S.td}">Any hour</td></tr>
<tr><td style="${S.td}">Surfside Beach</td><td style="${S.td}">Before 10 a.m. and after 5 p.m.</td><td style="${S.td}">May 1 to Labor Day</td><td style="${S.td}">Any hour</td></tr>
<tr><td style="${S.td}">Garden City and other county beaches</td><td style="${S.td}">Before 10 a.m. and after 5 p.m.</td><td style="${S.td}">May 1 to Labor Day</td><td style="${S.td}">Any hour</td></tr>
<tr><td style="${S.td}">Pawleys Island</td><td style="${S.td}">Any hour, leashed 8 a.m. to 8 p.m.</td><td style="${S.td}">May 1 to September 30</td><td style="${S.td}">Any hour, off leash under voice control</td></tr>
</tbody></table></div>
<p style="${S.p};margin-top:1.1rem">Read the last row again if the dog is family. Pawleys Island is the one beach on this coast where a July afternoon with the dog on the sand is legal, and from October to April the town allows dogs off leash under voice control with a leash in hand. Off season, Myrtle Beach opens up too: dogs any hour on the beach and the boardwalk from the day after Labor Day through April 30.</p><p style="${S.pLast}">Pick up after the dog everywhere; every jurisdiction requires it and tickets get written. In North Myrtle Beach the timing differs enough to matter: the ban starts May 15 rather than May 1 and ends at 4 rather than 5, an extra hour of summer evening beach.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Shade</p><h2 style="${S.h2}">What shade you can put up, and when</h2><p style="${S.p}">This is the rule visitors trip over every summer, and each government writes it differently.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:560px"><thead><tr><th style="${S.th}">Beach</th><th style="${S.th}">Peak season</th><th style="${S.th}">Rest of the year</th></tr></thead><tbody>
<tr><td style="${S.td}">Myrtle Beach</td><td style="${S.td}">Round umbrellas only, up to 7.5 feet, Memorial Day through Labor Day</td><td style="${S.td}">Tents up to 12 by 12 allowed</td></tr>
<tr><td style="${S.td}">North Myrtle Beach</td><td style="${S.td}">Umbrellas only, 9 foot shade on a pole up to 7 feet 6, May 15 through Labor Day</td><td style="${S.td}">Shading devices allowed</td></tr>
<tr><td style="${S.td}">Surfside Beach</td><td style="${S.td}">Canopies up to 10 by 10 allowed, set 10 feet behind the guard stands</td><td style="${S.td}">Same rule year round</td></tr>
<tr><td style="${S.td}">Garden City and other county beaches</td><td style="${S.td}">Umbrellas only, up to 7 feet 6, all year; infant cabanas to 4 by 3 by 3</td><td style="${S.td}">Same rule year round</td></tr>
</tbody></table></div>
<p style="${S.p};margin-top:1.1rem">Two details save arguments. In Myrtle Beach nothing goes up before 8 a.m. and everything comes off the sand by 7 p.m.; in North Myrtle Beach and on the county beaches, anything left between 7 p.m. and 8 a.m. is removed. Surfside Beach is the one place on this list where a family canopy is legal on a July afternoon. Buyers choose a town on small facts like that.</p><p style="${S.pLast}">The rest of the everywhere-rules: holes no deeper than two feet in Myrtle Beach and filled before you leave on every beach, and no fireworks. In North Myrtle Beach, swimmers stay within 50 yards of shore and no deeper than shoulder height. Myrtle Beach runs designated surfing and kayak zones at five street ends in summer between 10 and 5.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Parking and carts</p><h2 style="${S.h2}">Who parks free, and the winter cart season</h2><h3 style="${S.h3}">Parking follows your address</h3><p style="${S.p}">Each government runs its own parking program, and the pattern is simple: residency in the right town is what makes beach parking cheap. The City of Myrtle Beach gives its residents a decal covering city paid spaces, meters and street-end accesses; Surfside Beach issues town decals; North Myrtle Beach posts its rules access by access. If you buy outside the town limits, you are a visitor in the paid zones like everyone else, which is one of the quiet differences between an address inside city limits and one outside them. How to get the decal after you close is on the ${A('/buyers/relocating/moving-checklist/', 'new resident checklist')}, and the incorporated-or-not question is explained on the ${A('/buyers/relocating/which-town/', 'town by town page')}.</p><h3 style="${S.h3}">Golf carts: on the road yes, on the sand only in winter, only in the county</h3><p style="${S.p}">Golf carts with the $5 state permit drive local streets all over the Grand Strand, and many neighborhoods are built around that. The sand is different. The cities keep carts off the beach in every season, but Horry County allows permitted carts with a licensed driver on its unincorporated beaches from November 1 through February 28. The road-permit rules are on the ${A('/buyers/relocating/moving-checklist/', 'checklist')}.</p><p style="${S.pLast}">On a Saturday in January, in cart season, you put the cooler and the buckets in the cart and drive down onto the sand at Garden City. The beach is empty in both directions, so you pick your spot and stop there. The kids build sandcastles. You eat lunch out of the cooler with the ocean fifty feet away and no one else around. Then you sit and watch the waves for an hour before you drive back up the beach. That is a normal winter weekend for owners here, and most visitors never learn the season exists.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Buying near the sand? We will walk the exact access with you.</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Ask us about the beaches</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Our own guide</p><h2 style="${S.h2}">Where we go, by mood</h2><p style="${S.p}">For the social day, the team goes downtown, to the stretch by the boardwalk. Pay about ten dollars to park for the day. You are then next to the music, the bars, the volleyball court that runs all day, and everyone staying in the hotels around you. It is the easiest place on the coast to spend a day talking to people you just met.</p><p style="${S.p}">For the quiet day, drive to Cherry Grove, as far north as South Carolina goes. Parking is usually free at the accesses, and the walking trails at the Heritage Shores preserve on the marsh side, plus the long walk up the point, lead to stretches of sand most visitors never reach. For the slow day, Surfside Beach calls itself the Family Beach and its town beach runs at that pace: sandcastles, small crowds, short walks from the neighborhood streets behind it.</p><p style="${S.pLast}">The dog table above is personal for us: Devin brings his dog to the sand every chance the clock allows, off season especially, and calls it the best free thing on this coast. Two practical notes to finish. The chair and umbrella stands working the sand in front of the hotels are licensed beach services, and renting from them is how you set up without carrying anything. September is the locals&#39; month: the crowds go home, the water stays warm into October, and the ${A('/buyers/relocating/weather/', 'weather page')} shows it month by month.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Living with it</p><h2 style="${S.h2}">What this means when you own here</h2><p style="${S.p}">Rules read differently when the beach is your daily walk instead of your vacation week. The summer dog clock stops mattering when your normal beach hour is 7 a.m. before work. The umbrella rules stop mattering in September, which is warmer in the water than June and empty of crowds; the ${A('/buyers/relocating/weather/', 'weather page')} has the ocean temperatures month by month. The flags and rip current basics become second nature the way anyone&#39;s home geography does.</p><p style="${S.pLast}">Decide which of these five sets of rules fits how your household uses a beach before you buy rather than after. A dog household points one way. A grandchildren-every-July household points another. Tell us which one you are and we will show you the sand along with the house.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-beaches');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Grand Strand beach rules FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Tim Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.cityofmyrtlebeach.com/i_want_to/learn_about/beach_conditions.php', 'City of Myrtle Beach beach rules')}, ${X('https://www.nmb.us/249/Beach-Laws', 'North Myrtle Beach beach laws')}, ${X('https://www.surfsidebeach.org/214/Frequently-Needed-Information', 'Town of Surfside Beach')}, ${X('https://www.horrycountysc.gov/about-our-beaches', 'Horry County beach rules')}, ${X('https://www.townofpawleysisland.com/beach-rules/', 'Town of Pawleys Island beach rules')}. Rules change; each government&#39;s own page governs, and we re-check these when we update this page.</p></div></section>
`,
};

module.exports = spec;
