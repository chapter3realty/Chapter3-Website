/*
 * Page spec: generated for the relocating cluster.
 * Storm facts: local-facts.md B7, one NWS primary source per storm.
 * COMPLIANCE: no reassurance conclusions (legal finding 2.2 was exactly
 * that), no predictions either way, no named private buildings. Piers are
 * public landmarks in NWS reports and may be named. The date-count audit
 * warning will fire; this is a history page and the dates are the content.
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
  { q: 'Do hurricanes hit Myrtle Beach?',
    a: 'Yes. Since 1989, seven hurricanes and one tropical storm have done real damage on the Grand Strand, from Hugo through Tropical Storm Debby in 2024. Most seasons pass with no direct hit. The Atlantic season runs June 1 to November 30 and peaks around September 10.' },
  { q: 'When was the last hurricane to hit Myrtle Beach?',
    a: 'Hurricane Ian made landfall near Georgetown as a Category 1 on September 30, 2022, damaging three piers here and pushing sand over roads in Garden City. Tropical Storm Debby followed in August 2024 with 15 to 19 inches of rain and river flooding that lasted well after the storm.' },
  { q: 'What was the worst hurricane in Myrtle Beach history?',
    a: 'Hugo, September 22, 1989, a Category 4 that came ashore near Sullivan&#39;s Island. Weather service records show a 13 foot storm surge at Garden City that destroyed up to 90 percent of homes there, and three piers destroyed in Myrtle Beach. Nothing since has matched it.' },
  { q: 'Does Myrtle Beach flood?',
    a: 'Two different ways. Storm surge floods low ground near the ocean during a storm. River flooding comes days later and reaches inland: after Florence in 2018 the Waccamaw River crested at 21.16 feet and flooded about 1,000 homes and businesses near Conway, plus 1,580 more in rural parts of the county. Check the flood zone of the address, not the town name.' },
  { q: 'When is hurricane season in Myrtle Beach?',
    a: 'June 1 to November 30, the Atlantic season. Government climatology puts the peak at September 10, with most activity from mid August to mid October. Every damaging storm in the local record since 1989 arrived between August and early October.' },
  { q: 'What is my hurricane evacuation zone in Myrtle Beach?',
    a: 'Horry County uses lettered Zones A, B and C, and evacuations are ordered by zone. Look up any address on the state&#39;s Know Your Zone map before you buy, the same way you check its flood zone. We pull both for every address our buyers consider.' },
];

const spec = {
  slug: '/buyers/relocating/hurricanes/',
  cur: 'buyers-relocating-hurricanes',
  title: 'Hurricanes in Myrtle Beach: Every Storm Since Hugo',
  description: 'Every hurricane and tropical storm that damaged the Grand Strand since 1989, from weather service records, and why the worst flooding was inland, days later.',
  headline: 'Hurricanes and Flooding in Myrtle Beach, South Carolina',
  keywords: 'hurricanes in Myrtle Beach, Myrtle Beach hurricane history, does Myrtle Beach flood, Myrtle Beach evacuation zone',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Hurricanes', href: '/buyers/relocating/hurricanes/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Hurricanes</span></div><p class="eyebrow" style="margin-bottom:1rem">The storm record</p><h1 class="detail-h1">Hurricanes and flooding<br/><em style="font-style:italic;color:var(--brass)">in Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Eight storms have done real damage here since 1989. This page lists every one, from official weather records, and the fact most buyers miss: the worst recent flooding was inland.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Ask us about an address</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Storms reach this coast, and the record says how often</h2><p style="${S.p}">We are not going to tell you hurricanes are not a thing here, because they are, and we are not going to tell you they are constant, because the record says otherwise. Since 1989, eight tropical systems have done real damage on the Grand Strand. Most seasons pass without a direct hit. Every damaging storm in that record arrived between August and early October.</p><p style="${S.pLast}">The Atlantic season runs June 1 to November 30. Government climatology puts the peak at September 10, with most activity between mid August and mid October. What follows is each storm and what it actually did here, from National Weather Service storm reports, so you can judge the risk from facts instead of from a brochure in either direction.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The record</p><h2 style="${S.h2}">Every damaging storm since 1989, and what it did here</h2>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:640px"><thead><tr><th style="${S.th}">Storm</th><th style="${S.th}">When</th><th style="${S.th}">What happened on the Grand Strand</th></tr></thead><tbody>
<tr><td style="${S.td}">Hugo, Category 4</td><td style="${S.td}">September 1989</td><td style="${S.td}">13 foot surge at Garden City destroyed up to 90 percent of homes there; three Myrtle Beach piers destroyed; dunes washed away</td></tr>
<tr><td style="${S.td}">Floyd, Category 2</td><td style="${S.td}">September 1999</td><td style="${S.td}">16.8 inches of rain in Myrtle Beach; chest deep water near Pine Lakes; the largest peacetime evacuation to that date</td></tr>
<tr><td style="${S.td}">Matthew, Category 1</td><td style="${S.td}">October 2016</td><td style="${S.td}">74 mph gust at the airport; Springmaid Pier destroyed; the Waccamaw River crested at 17.87 feet ten days later; 170 roads closed</td></tr>
<tr><td style="${S.td}">Florence, Category 1</td><td style="${S.td}">September 2018</td><td style="${S.td}">Landfall in North Carolina; up to 23.63 inches of rain; record river flooding near Conway and Socastee days afterward</td></tr>
<tr><td style="${S.td}">Dorian, offshore</td><td style="${S.td}">September 2019</td><td style="${S.td}">Stayed 30 miles off Cape Fear; an EF0 tornado in North Myrtle Beach; 15.21 inches of rain at Pawleys Island</td></tr>
<tr><td style="${S.td}">Isaias, Category 1</td><td style="${S.td}">August 2020</td><td style="${S.td}">Landfall just over the state line; middle of the Cherry Grove pier destroyed; a foot of flooding a block inland in North Myrtle Beach</td></tr>
<tr><td style="${S.td}">Ian, Category 1</td><td style="${S.td}">September 2022</td><td style="${S.td}">Landfall near Georgetown; part of the Pawleys Island pier collapsed; two more piers damaged; three feet of sand across a Garden City road</td></tr>
<tr><td style="${S.td}">Debby, tropical storm</td><td style="${S.td}">August 2024</td><td style="${S.td}">15 to 19 inches of rain across the county; three tornadoes in the region; river flooding that continued well after the storm</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Each row is from the National Weather Service Wilmington office&#39;s report on that storm. Categories are at landfall. Dorian and Florence made landfall elsewhere; their damage here came from rain, surf and tornadoes.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The fact buyers miss</p><h2 style="${S.h2}">The worst recent flooding was inland, days after landfall</h2><p style="${S.p}">People shopping from out of state usually picture hurricane risk as an oceanfront problem. The last decade here says something different. Florence made landfall in North Carolina in September 2018, and the wind on the Grand Strand stayed below hurricane strength. The damage came from rain. It kept falling for days, and the Waccamaw River rose for almost two weeks, reaching a record 21.16 feet at Conway on September 26. Weather service records count about 1,000 flooded homes and businesses near the river, severe flooding along the Intracoastal Waterway in Socastee, and 1,580 more damaged homes in rural parts of the county. Two years earlier, Matthew had pushed the same river to what was then its record.</p><p style="${S.p}">So the question that matters when you buy is not how close the ocean is. It is where the water goes. A house two blocks from the beach on high ground and a house twelve miles inland beside the river carry different risks, and neither one is obvious from the photos of the home.</p><p style="${S.pLast}">That is what the maps are for. Every address has a FEMA flood zone, and the ${A('/buyers/coastal-insurance/', 'insurance page')} explains why the zone named X still does not mean zero risk. Every address also has a county evacuation zone, covered next.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Before you buy</p><h2 style="${S.h2}">Three things to check on any address, before you fall for the house</h2><h3 style="${S.h3}">The flood zone</h3><p style="${S.p}">Look the address up on the federal flood maps. The zone decides whether a lender requires flood insurance and is the single best public clue to where water has gone before. We pull it for every address our buyers consider.</p><h3 style="${S.h3}">The evacuation zone</h3><p style="${S.p}">Horry County uses lettered evacuation zones, A, B and C, and the state orders evacuations by zone. The ${X('https://www.scemd.org/prepare/know-your-zone/', 'Know Your Zone map')} shows any address in seconds. Knowing your letter before a storm is the difference between following one clear instruction and refreshing the news.</p><h3 style="${S.h3}">The insurance, priced before you offer</h3><p style="${S.pLast}">Wind and flood coverage are separate from the homeowner policy on this coast, and the cost changes street by street. The ${A('/buyers/coastal-insurance/', 'coastal insurance page')} explains the three policies, and we price them on a real address as part of any offer we write. A storm plan you made in February beats one you make in September.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want the flood zone, evacuation zone and insurance picture on a house?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Ask us about an address</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-hurricanes');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Myrtle Beach hurricane FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.weather.gov/ilm/hurricanehugo', 'NWS Wilmington storm reports')}, ${X('https://www.nhc.noaa.gov/climo/', 'National Hurricane Center season climatology')}, ${X('https://www.scemd.org/prepare/know-your-zone/', 'SC Know Your Zone')}, ${X('https://msc.fema.gov/portal/home', 'FEMA flood maps')}, ${X('https://www.horrycountysc.gov/departments/emergency-management/hurricanes/know-your-zone/', 'Horry County Emergency Management')}. Figures are as published in each storm report. We are not insurers or engineers; past storms do not predict future ones in either direction.</p></div></section>
`,
};

module.exports = spec;
