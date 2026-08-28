/*
 * Page spec: /buyers/relocating/jobs/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/jobs.js
 *
 * Every figure here traces to research/relocating/local-facts.md section D,
 * which was built from BLS QCEW and LAUS, Census QuickFacts and the Horry
 * County audited annual report. Do not change a number without re-opening the
 * source named there. The honest framing is required: pay here is lower and
 * the page says so in the second section.
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
  { q: 'Are there jobs available in Myrtle Beach right now?',
    a: 'Yes, and growth is the reason. Employers in Horry County added jobs at nearly twice the national rate between 2019 and 2025, 9.1 percent against 5.1 percent, and the Census Bureau ranked this metro second in the country for percent population growth in the year to July 2025. Hiring is steadiest in health care, education, retail, hospitality and the trades.' },
  { q: 'Can you find a job in Myrtle Beach?',
    a: 'It depends on the field. Health care, education, the trades, retail and hospitality hire steadily here, and the county had 146,055 covered jobs across 12,762 workplaces in 2025. Corporate and senior management roles are scarce because there is no headquarters here. Manufacturing is 2.3 percent of jobs against 8.1 percent nationally.' },
  { q: 'What is the average salary in Myrtle Beach?',
    a: 'The average job in Horry County paid $50,053 in 2025, against $78,722 nationally, so about 64 cents on the national dollar. Median household income is $66,880 against $80,734 nationally. The first figure counts jobs and the second counts households, so a two-earner household is better described by the second.' },
  { q: 'What are the biggest employers in Myrtle Beach?',
    a: 'On the county’s own audited list as of June 2025: Horry County School District at 6,643, Wal-Mart and Sam’s Club at 2,813, Horry County Government at 2,652, Conway Medical Center at 2,035 and McLeod Health at 1,777. The ten largest employ about 12.3 percent of everyone working here.' },
  { q: 'Is work in Myrtle Beach seasonal?',
    a: 'A quarter of the jobs are in leisure and hospitality, so the county unemployment rate moves on a schedule. It was 7.0 percent in January 2026 and 4.2 percent in April 2026. Salaried work in hospitals, schools and county government does not follow that pattern; hourly hospitality work and visitor-facing trades do.' },
  { q: 'Which jobs pay closest to the national average here?',
    a: 'Education and health services, at $1,244 a week here against $1,278 nationally. Construction and financial activities also pay well by local standards. The widest gaps are in information and professional and business services, where the national average is roughly double the local one.' },
  { q: 'Do I need a local job to buy a house in Myrtle Beach?',
    a: 'No. Your lender qualifies you on your own income, wherever it comes from, and plenty of buyers here keep a remote job at out-of-state pay. If you will be earning locally instead, work out what a local salary supports before you set a price range.' },
];

const spec = {
  slug: '/buyers/relocating/jobs/',
  cur: 'buyers-relocating-jobs',
  title: 'Jobs in Myrtle Beach, SC: What the Economy Actually Pays',
  description: 'What work exists in Myrtle Beach, who the largest employers are, what the average job pays against the national average, and how seasonal the year really is.',
  headline: 'Jobs and the Economy in Myrtle Beach, South Carolina',
  keywords: 'jobs in Myrtle Beach SC, Myrtle Beach economy, working in Myrtle Beach, Horry County employers',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Jobs and the Economy', href: '/buyers/relocating/jobs/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Jobs and the Economy</span></div><p class="eyebrow" style="margin-bottom:1rem">Work on the Grand Strand</p><h1 class="detail-h1">Jobs and the economy<br/><em style="font-style:italic;color:var(--brass)">in Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">The pay here is lower than most places people move from. This page gives you the real numbers, how much pay to expect, and how seasonal the income is.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Talk through my move</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">What the local economy is built on</h2><p style="${S.p}">Horry County had 146,055 covered jobs across 12,762 workplaces in 2025.</p><p style="${S.p}">One job in four is in leisure and hospitality, and that is the whole story behind the wage numbers further down. There is no dominant factory and no corporate headquarters here. The largest employer is the school district.</p><p style="${S.p}">The growth matters as much as the mix. Employers here added jobs at nearly twice the national rate between 2019 and 2025, 9.1 percent against 5.1 percent on the federal wage files. In the Census Bureau&#39;s estimates released in March 2026, this metro ranked second in the country for percent growth in the year to July 2025, and the county has added 21.8 percent to its population since 2020. Employers have been hiring to keep up with that growth, which is why arriving buyers find open positions in more fields than in most cities.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:620px"><thead><tr><th style="${S.th}">Industry</th><th style="${S.th}">Jobs here</th><th style="${S.th}">Share of jobs</th><th style="${S.th}">Average week</th><th style="${S.th}">US average week</th></tr></thead><tbody>
<tr><td style="${S.td}">Leisure and hospitality</td><td style="${S.td}">36,321</td><td style="${S.td}">24.9%</td><td style="${S.td}">$566</td><td style="${S.td}">$657</td></tr>
<tr><td style="${S.td}">Trade, transport and utilities</td><td style="${S.td}">32,162</td><td style="${S.td}">22.0%</td><td style="${S.td}">$795</td><td style="${S.td}">$1,241</td></tr>
<tr><td style="${S.td}">Education and health services</td><td style="${S.td}">16,909</td><td style="${S.td}">11.6%</td><td style="${S.td}">$1,244</td><td style="${S.td}">$1,278</td></tr>
<tr><td style="${S.td}">Professional and business services</td><td style="${S.td}">13,640</td><td style="${S.td}">9.3%</td><td style="${S.td}">$1,177</td><td style="${S.td}">$2,086</td></tr>
<tr><td style="${S.td}">Construction</td><td style="${S.td}">9,598</td><td style="${S.td}">6.6%</td><td style="${S.td}">$1,273</td><td style="${S.td}">$1,631</td></tr>
<tr><td style="${S.td}">Financial activities</td><td style="${S.td}">7,605</td><td style="${S.td}">5.2%</td><td style="${S.td}">$1,326</td><td style="${S.td}">$2,556</td></tr>
<tr><td style="${S.td}">Manufacturing</td><td style="${S.td}">3,372</td><td style="${S.td}">2.3%</td><td style="${S.td}">$1,157</td><td style="${S.td}">$1,721</td></tr>
<tr><td style="${S.td}">Information</td><td style="${S.td}">1,644</td><td style="${S.td}">1.1%</td><td style="${S.td}">$1,589</td><td style="${S.td}">$3,671</td></tr>
</tbody></table></div>
<p style="${S.small};margin-top:.9rem">Private-sector jobs and average weekly wages, annual 2025, from the federal employment and wage survey. The share column is our arithmetic against the 146,055 all-ownership total.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The number that matters</p><h2 style="${S.h2}">The average job here paid $50,053 in 2025</h2><p style="${S.p}">The national figure for the same year was $78,722. That is about 64 cents on the national dollar, and we will say it plainly: a big reason things cost less here is that wages are lower. Most of the gap comes from which jobs exist here: manufacturing is 2.3 percent of jobs here against 8.1 percent nationally, and leisure and hospitality is more than twice the national share.</p><p style="${S.p}">Households do better than that number suggests, because it counts jobs rather than people. Median household income in the county is $66,880, against $69,324 for South Carolina and $80,734 nationally. A two-earner household is described by that second figure, not the first.</p><p style="${S.pLast}">What this means when you are looking at a house: your lender qualifies you on your own income. If you keep a remote job at northern pay, this page is not about you. If you are going to earn here, work the numbers on a house from a local salary before you fall for a listing price, and the ${A('/buyers/relocating/cost-of-living/', 'cost of living calculator')} will show you what your current income is worth here.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want to know what a local salary buys here?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="/buyers/relocating/cost-of-living/">Run my income both ways</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Who hires</p><h2 style="${S.h2}">The largest employers are schools, hospitals, shops and government</h2><p style="${S.p}">This is the county&#39;s own audited list, as of June 2025. The ten together employ 22,658 people, about 12.3 percent of everyone working here.</p>
<div style="overflow-x:auto;-webkit-overflow-scrolling:touch"><table style="width:100%;border-collapse:collapse;font-family:var(--sans);font-size:.9rem;color:var(--navy);min-width:460px"><thead><tr><th style="${S.th}">Employer</th><th style="${S.th}">Employees</th></tr></thead><tbody>
<tr><td style="${S.td}">Horry County School District</td><td style="${S.td}">6,643</td></tr>
<tr><td style="${S.td}">Wal-Mart and Sam&#39;s Club</td><td style="${S.td}">2,813</td></tr>
<tr><td style="${S.td}">Horry County Government</td><td style="${S.td}">2,652</td></tr>
<tr><td style="${S.td}">Conway Medical Center</td><td style="${S.td}">2,035</td></tr>
<tr><td style="${S.td}">McLeod Health, Loris and Seacoast</td><td style="${S.td}">1,777</td></tr>
<tr><td style="${S.td}">Food Lion</td><td style="${S.td}">1,659</td></tr>
<tr><td style="${S.td}">Grand Strand Regional Medical Center</td><td style="${S.td}">1,655</td></tr>
<tr><td style="${S.td}">Coastal Carolina University</td><td style="${S.td}">1,541</td></tr>
<tr><td style="${S.td}">City of Myrtle Beach</td><td style="${S.td}">1,269</td></tr>
<tr><td style="${S.td}">Horry Telephone Company</td><td style="${S.td}">614</td></tr>
</tbody></table></div>
<p style="${S.p};margin-top:1.1rem">Two things follow from that list. If you work in health care, education or the trades, the hiring here is steady and you will be in the higher-paid group of people in Myrtle Beach: education and health services pay $1,244 a week here against $1,278 nationally. If you are a senior manager in a corporate function, there are very few chairs, because there is no headquarters to sit in.</p><p style="${S.pLast}">There is manufacturing, but not much of it. The regional development corporation lists Kyocera AVX as the largest industrial employer at about 1,000 people, then Apollo Valves, Canfor Southern Pine, Pepsi Bottling Ventures and Metglas. Health care is the sector adding capacity fastest, because three hospitals are being built at once, which is covered on the ${A('/buyers/relocating/healthcare/', 'healthcare page')}. Where you live relative to these employers sets your commute. Our ${A('/buyers/relocating/getting-around/', 'getting around page')} covers the roads.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">The season</p><h2 style="${S.h2}">How the season moves the job market here</h2><p style="${S.p}">Because a quarter of the jobs follow the tourist season, unemployment here swings on a schedule. In January 2026 the county rate was 7.0 percent. In April 2026 it was 4.2 percent. In June 2026 it was 4.7 percent, still preliminary. Those are the same county in the same year.</p><p style="${S.p}">The shape repeats: the rate peaks in January and February, bottoms out in April, and rises again in late summer.</p><p style="${S.pLast}">Who this actually changes things for: hourly workers in hospitality, and anyone self-employed in a trade that serves visitors. Both should look at a full year of income rather than a good month before deciding what house payment they are comfortable with. Salaried work in the hospitals, the schools and the county does not move with the season at all.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The third option</p><h2 style="${S.h2}">Working remotely from here</h2><p style="${S.p}">Everything above assumes you will earn at local wages. About half of the buyers who come to us from the northern states now arrive with a remote job in hand. They keep the job they have and bring it with them. If you hold northern pay and live here, you are earning at the higher end of wages in this market. One of our clients works his New York job from here in alternating weeks; his story is further down this page, and the ${A('/buyers/relocating/getting-around/', 'getting around page')} covers the airport that makes it workable.</p><p style="${S.pLast}">The practical question is the wiring. Two wired providers cover most addresses here: HTC, the local cooperative, which says it runs the largest fiber network in the area and sells symmetrical speeds, and Spectrum, whose cable reaches most of the county with fast downloads and much slower uploads, the number video calls care about. Satellite service, including Starlink, reaches the addresses the wires miss, and the area has been in a fiber building push for several years. Cell service has not been a problem for our team on any of several carriers, and Devin&#39;s phone held through Tropical Storm Debby. Which provider serves a given house still changes street by street, not town by town, so check any address you are serious about on the ${X('https://broadbandmap.fcc.gov/', 'FCC broadband map')}, and tell us if remote work is your income: we check the wiring the way we check the flood zone.</p></div></section>

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
 c3SendForm({name:n,phone:ph,consent:'yes'},'relocating-jobs');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">What we do</p><h2 style="${S.h2}">If the move needs a job on this end, say so early</h2><p style="${S.p}">We have pointed arriving clients at local employers and openings that fit their background. It is not a placement service and we do not promise anyone a job. We live here and we know who is hiring.</p><p style="${S.p}">What we actually see, from our own buyers: most arrive and are earning here within a month or two. Clients of ours have landed in child protective services, in stores, and at welding shops. Others never change jobs at all. Some split the year and work up north half the time, and some keep a remote job at northern pay. It comes down to your skills and your education, and that timing is our experience with our clients, not a promise.</p><p style="${S.p}">Two of those moves show the range. One client worked in child protective services up north, applied here during a visit, went home, and had the job a month later. She sold up north, bought here, and financed the purchase with BrickWood Mortgage. Another client, a veteran, kept his New York job after the move and works it in alternating weeks. Both patterns are normal here.</p><p style="${S.p}">One financing trap Devin flags as a loan originator. If the job that moves you here is with a family member&#39;s business, lenders treat that income differently and can require up to two years of history before it counts toward a mortgage. If that is the plan, have the lending conversation before you accept the offer, not after.</p><p style="${S.small}">Chapter 3 Realty has a business relationship with BrickWood Mortgage. The full RESPA Affiliated Business Arrangement disclosure is in the footer of this page and ${A('/buyers/programs/#afba', 'here')}. You are never required to use BrickWood, and you are free to shop lenders.</p><p style="${S.pLast}">If the new job is what qualifies you for the mortgage, arrange the employment before you make an offer on a house. Our preferred lender can use your job offer letter to qualify you, but only after the background checks and all other conditions of employment are complete, and that can take up to eight weeks. Tell us the whole picture at the start and we will time the house hunt around it.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Jobs in Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyzes himself. His father, Fred Nash, also sold real estate here, and Fred Nash Boulevard by Myrtle Beach International Airport is named for him. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div><p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.bls.gov/cew/', 'BLS Quarterly Census of Employment and Wages')}, ${X('https://www.bls.gov/lau/', 'BLS Local Area Unemployment Statistics')}, ${X('https://www.census.gov/quickfacts/fact/table/horrycountysouthcarolina,SC,US/PST045225', 'Census QuickFacts')}, ${X('https://www.horrycountysc.gov/media/gazhrjh5/horry-county-acfr-6-30-2025-website.pdf', 'Horry County annual financial report 2025')}, ${X('https://www.mbredc.org/site-selection/top-employers/', 'Myrtle Beach Regional EDC')}. Wage and job figures are annual 2025. Unemployment figures are not seasonally adjusted. We are not employment advisers and nothing here is a promise of work.</p></div></section>
`,
};

module.exports = spec;
