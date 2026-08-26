/*
 * Page spec: generated for the relocating cluster.
 * Climate facts: local-facts.md B5, B6, B9. Stations are NAMED because the
 * proxy honesty is the point. The 215-sunny-days corrective must never cite
 * NOAA for the 215 figure; it is a commercial estimate and the page says so.
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
  { q: 'How hot are Myrtle Beach summers?',
    a: 'The normal summer high is about 86 degrees, with about 21 days a year reaching 90 and almost none reaching 100. July normals at the North Myrtle Beach station are 87.6 for the high and 73.7 for the low. The heat is humid, so it reads hotter than the number.' },
  { q: 'Does it snow in Myrtle Beach?',
    a: 'About an inch a year on average, and most years none. The weather service snowfall database shows 87.4 total inches since 1940. The record is 14 inches in December 1989, and the 5 inch storm of January 2025 was the biggest in 35 years. Another 5 inches fell in early 2026.' },
  { q: 'What is winter like in Myrtle Beach?',
    a: 'January normals are a 55.7 degree high and a 36.7 low at the North Myrtle Beach station, with about 34 nights a year at or below freezing. The beach stays open, the boardwalk stays open, and the tourist crowds are gone.' },
  { q: 'How warm is the ocean in Myrtle Beach?',
    a: 'On the government pier gauge, roughly 50 degrees in January and February, upper 60s by late April, and upper 70s to mid 80s from June through September. October still averages in the low 70s, and November falls to the mid 60s.' },
  { q: 'How many sunny days does Myrtle Beach get?',
    a: 'The 215 sunny days figure that circulates online is a commercial estimate, not a government one. The nearest long term government station shows about 111 clear days a year and 62 percent of possible sunshine, well above Great Lakes and inland Northeast cities on the same measure.' },
  { q: 'How humid is Myrtle Beach?',
    a: 'Humid in summer. The nearest station with long term humidity records shows morning humidity around 85 to 88 percent in July and August. July dew points at the closest hourly station average around 73 degrees, which is what makes 87 feel heavy.' },
];

const spec = {
  slug: '/buyers/relocating/weather/',
  cur: 'buyers-relocating-weather',
  title: 'Myrtle Beach Weather by Season: The Government Numbers',
  description: 'Myrtle Beach weather from NOAA normals: season by season temperatures, ocean water by month, real humidity and sunshine figures, and how often it actually snows.',
  headline: 'Myrtle Beach Weather, Season by Season',
  keywords: 'Myrtle Beach weather by month, Myrtle Beach climate, ocean temperature Myrtle Beach, does it snow in Myrtle Beach',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Weather', href: '/buyers/relocating/weather/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Weather</span></div><p class="eyebrow" style="margin-bottom:1rem">The climate, measured</p><h1 class="detail-h1">Myrtle Beach weather,<br/><em style="font-style:italic;color:var(--brass)">season by season.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Government weather numbers, not brochure numbers: what each season measures, how warm the ocean actually is by month, and how often it snows.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk through my move</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">The four seasons, from the official station</h2><p style="${S.p}">These are 1991 to 2020 normals from the North Myrtle Beach airport station, the one the National Weather Service uses for this coast&#39;s official records. A normal is a thirty year average, so a given week will run above or below it.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:540px"><thead><tr><th style="${S.th}">Season</th><th style="${S.th}">Normal high / low</th><th style="${S.th}">What the record adds</th></tr></thead><tbody>
<tr><td style="${S.td}">Winter, January</td><td style="${S.td}">55.7 / 36.7</td><td style="${S.td}">About 34 nights a year at or below freezing</td></tr>
<tr><td style="${S.td}">Spring, April</td><td style="${S.td}">71.8 / 53.3</td><td style="${S.td}">Ocean already in the upper 60s by late April</td></tr>
<tr><td style="${S.td}">Summer, July</td><td style="${S.td}">87.6 / 73.7</td><td style="${S.td}">About 21 days a year reach 90; almost none reach 100</td></tr>
<tr><td style="${S.td}">Fall, October</td><td style="${S.td}">75.6 / 56.3</td><td style="${S.td}">Ocean still averages in the low 70s</td></tr>
</tbody></table></div>
<p style="${S.p};margin-top:1.1rem">The averages do not show storms. Hurricane season runs from the start of June to the end of November, and the largest single rain totals here have come from tropical systems. Every storm that reached the Grand Strand since 1989 is on our ${A('/buyers/relocating/hurricanes/', 'storm by storm record')}.</p>
<p style="${S.small};margin-top:.9rem">Annual normals at the same station: 72.7 high, 55.2 low, 48.47 inches of rain across about 122 days with measurable precipitation. Station USW00093718, NOAA 1991 to 2020 monthly normals.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The ocean</p><h2 style="${S.h2}">How warm the water is, month by month</h2><p style="${S.p}">This is the federal water temperature gauge at Springmaid Pier in Myrtle Beach, averaged by month across 2024 and 2025. Nobody has to guess.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:480px"><thead><tr><th style="${S.th}">Months</th><th style="${S.th}">Water temperature</th></tr></thead><tbody>
<tr><td style="${S.td}">January and February</td><td style="${S.td}">around 50</td></tr>
<tr><td style="${S.td}">March and April</td><td style="${S.td}">upper 50s to upper 60s</td></tr>
<tr><td style="${S.td}">May</td><td style="${S.td}">mid 70s</td></tr>
<tr><td style="${S.td}">June through September</td><td style="${S.td}">upper 70s to mid 80s</td></tr>
<tr><td style="${S.td}">October</td><td style="${S.td}">low 70s</td></tr>
<tr><td style="${S.td}">November</td><td style="${S.td}">mid 60s</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">NOAA Springmaid Pier gauge, station 8661070, hourly readings averaged by us across 2024 and 2025. The swim season in practice runs May into October.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Humidity and sun</p><h2 style="${S.h2}">The two numbers people argue about, sourced</h2><h3 style="${S.h3}">Humidity is real</h3><p style="${S.p}">Myrtle Beach itself has no long term government humidity record, so the honest numbers come from the nearest stations that do. Wilmington&#39;s long term record shows morning humidity around 85 to 88 percent in July and August, and the closest hourly station puts July dew points around 73 degrees. That combination is why an 87 degree afternoon here asks more of you than the same number inland. Summers are air conditioned, and the ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')} carries the real electricity bills that go with that.</p><h3 style="${S.h3}">The sunny days number you see everywhere is not a government number</h3><p style="${S.pLast}">Websites repeat that Myrtle Beach gets about 215 sunny days a year. That figure comes from commercial estimates, not from NOAA, and no government station publishes it. What the nearest long term government station does show: 62 percent of possible sunshine and about 111 clear days a year. On that same government measure, Buffalo records 54 clear days, Pittsburgh 59 and Cleveland 66. The honest version is still a large difference; it just is not 215.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Snow</p><h2 style="${S.h2}">It snows about an inch a year, and twice lately it mattered</h2><p style="${S.p}">The weather service keeps a snowfall database for Myrtle Beach going back to 1940. The total across those 85 years is 87.4 inches, an average of about one inch a year, and most years record none at all. The record is 14 inches, December 1989.</p><p style="${S.pLast}">Recent years have been livelier than the average suggests. Five inches fell in January 2025, which the weather service called the city&#39;s largest snowstorm in 35 years, and another five fell at the turn of February 2026. Plows are not a municipal habit here, so a snow day mostly means the town closes and children see the beach white, briefly.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want to talk about timing a move around the seasons?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Talk through my move</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-weather');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Myrtle Beach weather FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.ncei.noaa.gov/access/us-climate-normals/', 'NOAA 1991-2020 climate normals')}, ${X('https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070', 'NOAA Springmaid Pier gauge')}, ${X('https://www.weather.gov/ilm/MYRsnowfallDatabase', 'NWS Myrtle Beach snowfall database')}, ${X('https://www.ncei.noaa.gov/products/land-based-station/comparative-climatic-data', 'NCEI comparative climatic data')}. Humidity and sunshine figures are from the nearest long term stations, named above, because Myrtle Beach has none. Water averages are our arithmetic on the hourly gauge.</p></div></section>
`,
};

module.exports = spec;
