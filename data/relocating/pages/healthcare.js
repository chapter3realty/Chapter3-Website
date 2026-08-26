/*
 * Page spec: /buyers/relocating/healthcare/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/healthcare.js
 *
 * Facts trace to research/relocating/local-facts.md section A, built from each
 * health system's own pages. COMPLIANCE: this page states facts and never
 * grades, ranks or recommends a provider. The legal review already caught a
 * graded healthcare line once (finding 2.4). Do not reintroduce one. Project
 * dates carry an as-of because they move.
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
  { q: 'What hospitals are in Myrtle Beach?',
    a: 'Six hospitals serve Horry and Georgetown counties: Grand Strand Medical Center in Myrtle Beach at 403 beds, Conway Medical Center at 222, McLeod Health Seacoast in Little River at 155, Tidelands Georgetown Memorial at 131, Tidelands Waccamaw in Murrells Inlet at 124, and McLeod Health Loris at 50. Three more hospitals are being built.' },
  { q: 'Is there a trauma center in Myrtle Beach?',
    a: 'Yes. Grand Strand Medical Center is an adult Level I trauma center and a pediatric Level II trauma center. Tidelands Waccamaw in Murrells Inlet is a designated adult Level IV trauma center.' },
  { q: 'Are new hospitals being built in Myrtle Beach?',
    a: 'Three. McLeod Health’s 48-bed Carolina Forest hospital has been admitting patients since January 2025 and is slated to open fully in 2026. Grand Strand Health broke ground in February 2026 on the 59-bed South Strand Hospital on the US-17 Bypass, due late 2027. Tidelands Health has begun site work on a 36-bed hospital at SC-31 and SC-707, due late 2028.' },
  { q: 'What awards and certifications do Myrtle Beach hospitals hold?',
    a: 'Healthgrades placed Grand Strand Medical Center among America’s 250 Best Hospitals in 2023 and 2024, and among America’s 100 Best for stroke care and critical care from 2023 through 2025. Tidelands Waccamaw and Tidelands Georgetown are Joint Commission-certified advanced primary stroke centers. Conway Medical Center runs an accredited family medicine residency sponsored by Campbell University.' },
  { q: 'Is there a VA hospital in Myrtle Beach?',
    a: 'There is a VA outpatient clinic at 1800 Airpark Drive in Myrtle Beach, part of VA Charleston Health Care, offering primary care, mental health, geriatrics, laboratory, imaging and telehealth. The nearest full VA medical center is the Ralph H. Johnson VA Medical Center at 109 Bee Street in Charleston.' },
  { q: 'Does where I buy change how far I am from a hospital?',
    a: 'Yes, and it is worth checking before you choose an area. The hospitals sit at Myrtle Beach, Carolina Forest, Conway, Little River, Murrells Inlet, Loris and Georgetown, with free-standing emergency rooms between them. Ask us for the drive from any specific address you are considering.' },
];

const spec = {
  slug: '/buyers/relocating/healthcare/',
  cur: 'buyers-relocating-healthcare',
  title: 'Healthcare in Myrtle Beach, SC: Hospitals, Beds and Drives',
  description: 'Every hospital serving the Grand Strand with bed counts and addresses, the three under construction, what care means a drive to Charleston, and the VA clinic.',
  headline: 'Healthcare and Hospitals in Myrtle Beach, South Carolina',
  keywords: 'hospitals in Myrtle Beach SC, healthcare Myrtle Beach, Grand Strand Medical Center, Conway Medical Center',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Healthcare', href: '/buyers/relocating/healthcare/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Healthcare</span></div><p class="eyebrow" style="margin-bottom:1rem">Hospitals on the Grand Strand</p><h1 class="detail-h1">Healthcare and hospitals<br/><em style="font-style:italic;color:var(--brass)">in Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">Six hospitals with about 1,085 beds, three more under construction, and the certifications each system holds. Facts and addresses for every one of them.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Ask us about an address</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Six hospitals now, and about 1,085 beds</h2><p style="${S.p}">Where is the nearest hospital, and what can it handle? Buyers ask us that early, and the numbers say they should: 30 of every 100 residents here are 65 or older, against about 19 of every 100 across the United States. We do not rank hospitals or tell you which to use. What follows is what exists, where it is, and what each one holds, from the health systems&#39; own pages.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:620px"><thead><tr><th style="${S.th}">Hospital</th><th style="${S.th}">Where</th><th style="${S.th}">Beds</th><th style="${S.th}">Noted on its own pages</th></tr></thead><tbody>
<tr><td style="${S.td}">Grand Strand Medical Center</td><td style="${S.td}">809 82nd Pkwy, Myrtle Beach</td><td style="${S.td}">403</td><td style="${S.td}">Adult Level I and pediatric Level II trauma; heart surgery on site</td></tr>
<tr><td style="${S.td}">Conway Medical Center</td><td style="${S.td}">300 Singleton Ridge Rd, Conway</td><td style="${S.td}">222</td><td style="${S.td}">Independent non-profit, chartered 1928</td></tr>
<tr><td style="${S.td}">McLeod Health Seacoast</td><td style="${S.td}">4000 Highway 9 East, Little River</td><td style="${S.td}">155</td><td style="${S.td}">24-bed emergency department; heart and stroke services</td></tr>
<tr><td style="${S.td}">Tidelands Georgetown Memorial</td><td style="${S.td}">606 Black River Rd, Georgetown</td><td style="${S.td}">131</td><td style="${S.td}">Certified advanced primary stroke center; serving since 1950</td></tr>
<tr><td style="${S.td}">Tidelands Waccamaw Community</td><td style="${S.td}">4070 Highway 17 S, Murrells Inlet</td><td style="${S.td}">124</td><td style="${S.td}">Certified advanced primary stroke center; adult Level IV trauma</td></tr>
<tr><td style="${S.td}">McLeod Health Loris</td><td style="${S.td}">Loris</td><td style="${S.td}">50</td><td style="${S.td}">Women&#39;s services, general surgery, emergency care, urology, dialysis access</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Bed counts and addresses are from each health system&#39;s own site. The 1,085 total is our arithmetic on this table. Tidelands Health is an MUSC Health affiliate; Grand Strand Health is part of HCA Healthcare.</p>
<p style="${S.p};margin-top:1.2rem">Free-standing emergency rooms fill the gaps between them. Grand Strand Health runs one on the north strand, one in Carolina Forest on Oakheart Road, and South Strand Medical Center on the US-17 Bypass at Sheffield Parkway. Conway Medical Center broke ground in October 2025 on a free-standing emergency department in the Socastee area.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Under construction</p><h2 style="${S.h2}">Three hospitals are being built at once</h2><p style="${S.p}">This is unusual and it is a direct consequence of how fast the county is growing. As of August 2026, here is where each one stands.</p><h3 style="${S.h3}">McLeod Health Carolina Forest, 48 beds</h3><p style="${S.p}">A four-story hospital on the Carolina Forest campus with operating suites, imaging and laboratory. It licensed its first four beds and began admitting patients on 21 January 2025, and McLeod said in January 2026 that it remains on schedule to open in 2026. It is the first new hospital built in Horry County since McLeod Health Seacoast opened in 2011.</p><h3 style="${S.h3}">South Strand Hospital, 59 beds</h3><p style="${S.p}">Grand Strand Health broke ground on 9 February 2026 on the US-17 Bypass at Sheffield Parkway, next to its existing free-standing emergency room. Fifty-nine inpatient beds and four operating rooms, at about $220 million, with completion expected late 2027. It is part of a larger program that also adds free-standing emergency departments in Conway, Murrells Inlet and Little River.</p><h3 style="${S.h3}">Tidelands Health Carolina Bays, 36 beds</h3><p style="${S.pLast}">At the interchange of SC-31 and SC-707 in south Horry County, with MUSC Health. Site work has begun and construction is expected to finish in late 2028. The campus is planned to include a long-term acute care hospital and a rehabilitation hospital alongside the 36-bed acute-care building.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want to know what is near a house you are considering?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Send me the address</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Certifications and awards</p><h2 style="${S.h2}">What the hospitals hold, from the bodies that award it</h2><p style="${S.p}">We do not grade hospitals. The awarding bodies publish who holds what, and that record speaks for the system here.</p><p style="${S.p}">Grand Strand Medical Center is an adult Level I trauma center and a pediatric Level II trauma center, with heart surgery on site. Healthgrades placed it among America&#39;s 250 Best Hospitals in 2023 and 2024, and among America&#39;s 100 Best for stroke care and for critical care in 2023, 2024 and 2025. It also holds the American Heart Association and American Stroke Association Get With The Guidelines Stroke Gold Plus award.</p><p style="${S.p}">Tidelands Waccamaw and Tidelands Georgetown are both certified by the Joint Commission as advanced primary stroke centers. Waccamaw is a designated baby-friendly hospital and an adult Level IV trauma center, and Tidelands Health is an affiliate of MUSC Health.</p><p style="${S.pLast}">Conway Medical Center runs an accredited family medicine residency program sponsored by Campbell University, which means new doctors do part of their training here, and it has been an independent, locally governed non-profit since 1928.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Veterans</p><h2 style="${S.h2}">The VA clinic here is outpatient</h2><p style="${S.pLast}">The Myrtle Beach VA Clinic at 1800 Airpark Drive is a community-based outpatient clinic within VA Charleston Health Care, open weekdays, with primary care, mental health, geriatrics, laboratory, imaging and telehealth. The nearest full VA medical center is the Ralph H. Johnson VA Medical Center at 109 Bee Street in Charleston. There is no VA clinic in Conway, North Myrtle Beach or Georgetown. If you are buying with ${A('/buyers/va-loans/', 'a VA loan')}, that drive is worth knowing about at the same time.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-healthcare');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Where you buy</p><h2 style="${S.h2}">The area you choose changes the drive</h2><p style="${S.p}">North strand: McLeod Health Seacoast is the hospital in Little River, and Grand Strand Health runs a free-standing emergency room on the north strand. Central: Grand Strand Medical Center is in Myrtle Beach, and Carolina Forest has both the McLeod Health Carolina Forest hospital, admitting patients since January 2025, and a free-standing emergency room on Oakheart Road. Inland: Conway Medical Center. South strand: Tidelands Waccamaw is the hospital in Murrells Inlet, the South Strand free-standing emergency room is on the US-17 Bypass with the 59-bed hospital under construction beside it, and Tidelands Georgetown Memorial is further south.</p><p style="${S.p}">On the south strand there are gated and ungated communities directly across the US-17 Bypass from the South Strand Hospital construction site, and there is a wide selection of homes within a short drive of each hospital above. Which one is closest depends on the address, not the town name, so we measure it per address.</p><p style="${S.pLast}">If access to care is one of your criteria, say so when we start, and we will find you a home near a hospital with the kind of care you need. The ${A('/buyers/relocating/which-town/', 'town by town page')} sets out the other practical differences between the areas, and the ${A('/buyers/relocating/pros-and-cons/', 'pros and cons page')} covers what daily life here is actually like.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Myrtle Beach healthcare FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyzes himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.mygrandstrandhealth.com/about', 'Grand Strand Health')}, ${X('https://www.conwaymedicalcenter.com/about/', 'Conway Medical Center')}, ${X('https://www.mcleodhealth.org/locations/mcleod-seacoast/', 'McLeod Health')}, ${X('https://www.tidelandshealth.org/locations/hospitals/', 'Tidelands Health')}, ${X('https://www.va.gov/charleston-health-care/locations/myrtle-beach-va-clinic/', 'VA Charleston Health Care')}. Bed counts, designations, awards and project dates are as published by each system or awarding body and were current in August 2026. We are not medical advisers and this page does not rank or recommend any provider.</p></div></section>
`,
};

module.exports = spec;
