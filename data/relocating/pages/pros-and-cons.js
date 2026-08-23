/*
 * Page spec: /buyers/relocating/pros-and-cons/
 * Assemble with: node data/relocating/assemble-page.js data/relocating/pages/pros-and-cons.js
 *
 * Facts: research/relocating/local-facts.md (A healthcare, B climate),
 * data/relocating/col-places.json (BEA/Zillow), research/relocating/owner-answers.md.
 *
 * FAIR HOUSING: this page describes weather, property, cost, distance and
 * services. It says nothing about who lives anywhere, nothing about safety or
 * crime, and nothing that characterises a neighbourhood by its residents. The
 * owner's observations about people, housing-type mix and homelessness were
 * deliberately excluded; see owner-answers.md for what was cut and why.
 */
'use strict';

const S = {
  eyebrow: 'font-family:var(--sans);font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:var(--brass);margin-bottom:.5rem;font-weight:600',
  h2: 'font-family:var(--serif);font-size:1.7rem;color:var(--navy);margin-bottom:1rem;letter-spacing:-.01em',
  h3: 'font-family:var(--serif);font-size:1.15rem;color:var(--navy);margin:1.4rem 0 .5rem',
  p: 'color:var(--muted);line-height:1.75;max-width:720px;margin-bottom:1rem',
  pLast: 'color:var(--muted);line-height:1.75;max-width:720px',
  ul: 'color:var(--muted);line-height:1.65;margin:0 0 0 1.1rem;padding:0;font-family:var(--sans);font-size:.93rem',
  a: 'color:var(--brass);font-weight:600;text-decoration:none',
  ctaBox: 'background:var(--ivory);border:1px solid var(--rule);border-radius:6px;padding:1.2rem 1.3rem;margin-top:1.8rem;max-width:720px;display:flex;gap:1rem;flex-wrap:wrap;align-items:center;justify-content:space-between',
  small: 'font-family:var(--sans);font-size:.78rem;color:var(--muted);line-height:1.6;max-width:720px',
  th: 'padding:.6rem .5rem;font-weight:600;text-align:left;border-bottom:1px solid var(--rule)',
  td: 'padding:.6rem .5rem;vertical-align:top;border-bottom:1px solid var(--rule)',
};
const X = (href, text) => `<a href="${href}" style="${S.a}" rel="noopener" target="_blank">${text}</a>`;
const A = (href, text) => `<a href="${href}" style="${S.a}">${text}</a>`;

const faq = [
  { q: 'Is Myrtle Beach a good place to live?',
    a: 'It depends what you want from a place. Housing costs less than most of the Northeast, winters are mild, and you are near the water. What you give up is walkability, higher pay and some big city services. Summers are hot and humid, and hurricane season runs June to November.' },
  { q: 'What are the biggest downsides of living in Myrtle Beach?',
    a: 'You cannot walk to much, so you drive everywhere. Pay is lower than in a northern metro. Summers are humid. Your car is taxed every year, which is new for most movers. And insurance costs more on the oceanfront, though it drops as you move inland.' },
  { q: 'Do hurricanes destroy houses in Myrtle Beach?',
    a: 'Hurricanes reach this coast and they do damage property. The last storm to flatten a large part of the Grand Strand was Hugo in 1989, and since then the worst losses have come from river flooding inland rather than wind on the beach. Risk is decided by the address, not the region: ask what year the house was built, when the roof was last replaced, its flood zone, and whether it has flooded before.' },
  { q: 'How bad is summer traffic in Myrtle Beach?',
    a: 'Lighter than newcomers from a large metro expect. Rush hour typically adds five to ten minutes. Which road you take matters more than the season: US-17 Business runs through stop lights, while SC-31 and SC-22 are limited access and usually faster even when the mileage is longer.' },
  { q: 'Does it snow in Myrtle Beach?',
    a: 'Rarely. The average is about an inch a year and most years get none. Two recent winters each produced a 5 inch storm, and the record is 14 inches from a Christmas storm in 1989. When it does snow, roads and schools close for a day or two.' },
  { q: 'What is Myrtle Beach like in the winter?',
    a: 'Quieter, and less different than people expect. The water parks and some attractions close and some places trim their hours, but the town keeps running. From about October to April everything is easier to get into.' },
];

const spec = {
  slug: '/buyers/relocating/pros-and-cons/',
  cur: 'buyers-relocating-proscons',
  title: 'Pros and Cons of Living in Myrtle Beach, SC Year-Round',
  description: 'An honest look at living on the Grand Strand full time: real costs, weather in numbers, hurricane season, traffic, walkability, and what newcomers find hardest.',
  headline: 'The Pros and Cons of Living in Myrtle Beach Year-Round',
  keywords: 'pros and cons of living in Myrtle Beach, is Myrtle Beach a good place to live, living in Myrtle Beach year-round',
  breadcrumb: [{ name: 'Buyers', href: '/buyers/' }, { name: 'Relocating', href: '/buyers/relocating/' }, { name: 'Pros and Cons', href: '/buyers/relocating/pros-and-cons/' }],
  faq,
  main: ({ faqHtml, bylineDate }) => `
<div class="detail-hero bg-grid"><div class="wrap"><div class="breadcrumb"><a href="/">Home</a><span>/</span><a href="/buyers/">Buyers</a><span>/</span><a href="/buyers/relocating/">Relocating</a><span>/</span><span style="color:var(--muted)">Pros and Cons</span></div><p class="eyebrow" style="margin-bottom:1rem">Living here full time, honestly</p><h1 class="detail-h1">The pros and cons of living<br/><em style="font-style:italic;color:var(--brass)">in Myrtle Beach.</em></h1><p style="color:var(--muted);font-size:.9rem;margin-bottom:1rem">By <strong style="color:var(--navy);font-weight:600">Devin Day</strong>, Operations Officer &amp; licensed MLO, NMLS 2721275 &middot; Reviewed by <strong style="color:var(--navy);font-weight:600">Timmy Fredrick Nash</strong>, Broker-in-Charge &middot; <span style="white-space:nowrap">Updated ${bylineDate}</span></p><p class="detail-sub">We sell real estate here, so read this knowing that. It still includes the parts people complain about, because you will find those in month three anyway.</p><div style="margin-top:1.8rem;display:flex;gap:.75rem;flex-wrap:wrap"><a class="btn btn-brass btn-lg" href="#lead-form">Ask us the awkward questions</a><a class="btn btn-outline btn-lg" href="tel:+18543332135">Call 854.333.2135</a></div></div></div>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The short answer</p><h2 style="${S.h2}">Is Myrtle Beach a good place to live?</h2><p style="${S.p}">It depends what you want from a place. Your housing money goes further, the winters are mild, and you are near the water. What you give up is walkability, higher pay, and some big city services.</p><div style="border-left:2px solid var(--brass);padding:.2rem 0 .2rem 1.1rem;margin:1.5rem 0;max-width:680px"><p style="font-family:var(--serif);font-size:1.12rem;line-height:1.65;color:var(--navy);margin:0 0 .55rem;font-style:italic">&ldquo;Life down here is different. It is relaxing and a little fast paced at the same time. Yes, it is cheaper, but depending on where you are coming from, some things will feel like a real upgrade and some things may make you reconsider. We want to sell you a home, but this is a small town. We want to run into you at the grocery store and hear that you are happy here, not that you regret the move. So tell us what you want, and we will tell you honestly whether it is here.&rdquo;</p><p style="font-family:var(--sans);font-size:.78rem;color:var(--muted);margin:0">What Timmy Nash, our Broker-in-Charge, tells every relocation client in the first ten minutes.</p></div>
<p style="${S.pLast}">Here is the whole trade, split into two lists so you can scan it.</p>

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:1.1rem;max-width:760px;margin-top:1.6rem">
<div style="background:#fff;border:1px solid var(--rule);border-radius:6px;padding:1.3rem 1.4rem"><h3 style="font-family:var(--serif);font-size:1.2rem;color:var(--navy);margin:0 0 .9rem">Pros of living in Myrtle Beach</h3><ul style="${S.ul}">
<li style="margin-bottom:.55rem">A typical home costs about $342,000, well under most of the Northeast</li>
<li style="margin-bottom:.55rem">Mild winters. January highs average the mid 50s</li>
<li style="margin-bottom:.55rem">Sixty miles of beach, and the ocean is swimmable from June into October</li>
<li style="margin-bottom:.55rem">No state tax on Social Security, and none on military retirement pay</li>
<li style="margin-bottom:.55rem">Property tax on a main home is low. Only 4 percent of the value is assessed, so a $350,000 house runs around $1,300 a year</li>
<li style="margin-bottom:.55rem">Sunnier than the northern cities most people leave</li>
<li style="margin-bottom:.55rem">Traffic is light compared with any large metro</li>
<li style="margin-bottom:0">Golf carts are a real way to get around in many neighborhoods</li>
</ul></div>
<div style="background:#fff;border:1px solid var(--rule);border-radius:6px;padding:1.3rem 1.4rem"><h3 style="font-family:var(--serif);font-size:1.2rem;color:var(--navy);margin:0 0 .9rem">Cons of living in Myrtle Beach</h3><ul style="${S.ul}">
<li style="margin-bottom:.55rem">You cannot walk to much. This is a driving area</li>
<li style="margin-bottom:.55rem">Pay is lower than in a northern metro</li>
<li style="margin-bottom:.55rem">Summers are hot and humid, with about 22 days a year over 90 degrees</li>
<li style="margin-bottom:.55rem">Hurricane season runs June to November</li>
<li style="margin-bottom:.55rem">Insurance costs more on the oceanfront, though it drops inland</li>
<li style="margin-bottom:.55rem">Your car is taxed every year, which is new for most movers</li>
<li style="margin-bottom:.55rem">More mosquitoes than a dense city</li>
<li style="margin-bottom:0">Some specialist medical care means a drive to Charleston</li>
</ul></div>
</div>
<div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Want to see what your budget buys here before you decide?</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Show me homes</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div>
</div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Money</p><h2 style="${S.h2}">What it costs to live in Myrtle Beach</h2><p style="${S.p}">Housing is where you gain. A typical home here runs about $342,000. The same measure is about $737,000 in the New York area, $742,000 in Boston and $580,000 in Washington. Rent runs about 17 percent below the national average.</p><p style="${S.p}">Everything else is closer to normal. Food, power and everyday items sit near the national average, so do not plan on the grocery bill falling. Pay is lower here too, which matters if you are still working.</p><p style="${S.pLast}">Two costs are genuinely new. South Carolina taxes your car every year, which most northern states do not, and a second home is taxed at about three times the rate of a main home. Both are covered on our ${A('/buyers/relocating/cost-of-living/', 'cost of living page')}, which compares your city with this one directly.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Weather</p><h2 style="${S.h2}">What the weather is really like</h2><h3 style="${S.h3}">Winters are mild</h3><p style="${S.p}">January averages a high near 56 and a low in the mid 30s. Snow is rare: about an inch a year on average, and most years get none. Two recent winters each produced a 5 inch storm, and the record is 14 inches from a Christmas storm in 1989. When it does snow, roads and schools close for a day or two, because there is no reason to own plows here.</p><h3 style="${S.h3}">Summers are hot and humid</h3><p style="${S.p}">July averages a high near 87 and a low near 72. The area gets about 22 days a year at or above 90 degrees and almost none at 100, so the raw temperature is not extreme. The humidity is what people feel. Most newcomers say they adjust within a season or two.</p><h3 style="${S.h3}">It is brighter than most places people leave</h3><p style="${S.pLast}">The nearest long term weather station records about 62 percent of possible sunshine and 111 clear days a year. Pittsburgh runs about 42 percent, Buffalo about 47 percent, and Cleveland about 66 clear days. People from those cities notice it in the first month.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Storms</p><h2 style="${S.h2}">Do hurricanes destroy houses in Myrtle Beach?</h2><p style="${S.p}">Hurricanes reach this coast and they do damage property. The last storm to flatten a large part of it was Hugo in 1989, more than 35 years ago. Since then the Grand Strand has taken a direct Category 1 landfall at Georgetown, a close pass from a Category 1, and a string of tropical storms. Those destroyed piers and dunes. They did not level the towns.</p><p style="${S.p}">What actually damaged the most houses was water, and it was inland. When Florence came ashore in North Carolina in 2018, the wind here was survivable. Days later the Waccamaw River crested at a record 21 feet and flooded around a thousand homes and businesses near Conway and Socastee, miles from the ocean. Matthew did a smaller version two years earlier.</p><p style="${S.p}">Homes built to the current coastal wind code are engineered for higher wind loads than older stock, which is part of why insurers price them differently. That is a construction standard, not a guarantee for any particular storm or any particular house. What decides the risk is the address: the year it was built, when the roof was last replaced, its flood zone, and whether it has flooded before. A Zone X designation is not proof that it has not.</p><p style="${S.pLast}">We wrote up how to pull a property&#39;s real flood history on ${A('/buyers/undisclosed-flooding/', 'how to find out if a house flooded')}. Insurance is higher on the oceanfront and drops as you move inland, and the ${A('/buyers/coastal-insurance/', 'coastal insurance page')} explains what drives a quote.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">Send us an address and we will pull its flood history before you offer.</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Check an address</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Getting around</p><h2 style="${S.h2}">It is a golf cart area, not a walking city</h2><p style="${S.p}">This is the complaint we hear most from people who moved from a real city, and it is fair. Outside a few pockets you cannot walk to a grocery store, and there is no transit network worth planning a life around. What the area has instead is golf carts. Large parts of the Grand Strand are built around them, and in many neighborhoods that is genuinely how people get to the beach, dinner and a neighbor&#39;s house.</p><p style="${S.pLast}">There are rules. A cart needs a state permit, the driver needs a license and insurance, and it can only run on roads posted 35 mph or less, within four miles of the address on the permit. So the question for any house is not whether the neighborhood is cart friendly, it is what the speed limits are between that house and where you want to go. A 45 mph road you cannot drive along ends the trip. The rules by town are on our ${A('/buyers/relocating/moving-checklist/', 'moving checklist')}.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Traffic</p><h2 style="${S.h2}">Traffic is lighter than newcomers expect</h2><p style="${S.p}">Summer brings visitors, and it still does not compare with a big city commute. Rush hour typically adds five to ten minutes. Leaving between 5 and 8 in the morning gets you most places without a real stop.</p><p style="${S.p}">Which road you take matters more than the season. US-17 Business runs through stop lights end to end. SC-31 and SC-22 are limited access and usually faster even when the mileage is longer. Locals default to the highways and visitors do not, which is most of the difference.</p><p style="${S.pLast}">For scale, the busiest road in the county carries about 82,000 vehicles a day averaged across the year. Off peak, North Myrtle Beach is about 30 minutes from Myrtle Beach, Surfside about 15, Murrells Inlet about 25, Conway about 25 and Carolina Forest about 20. Wilmington is under two hours, Charleston and Columbia about three.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">The off season</p><h2 style="${S.h2}">What Myrtle Beach is like in the winter</h2><p style="${S.p}">Quieter, and less different than the reputation suggests. The water parks and some attractions close and some places trim their hours, but the town keeps running. Restaurants, shops and the boardwalk stay open, and from about October to April everything is easier to get into.</p><p style="${S.pLast}">Locals use the off season. In the City of Myrtle Beach, dogs are allowed on the beach at any hour from the day after Labor Day through April 30; in summer they are limited to before 10 a.m. and after 5 p.m., and each town sets its own hours. Golf courses, restaurants and spas run off season rates, hotel rooms sell well below summer prices, and there is no line for any of it. Several of our clients say the off season is the reason they stayed: the vacation attractions spend the winter serving the people who live here.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Where you buy matters</p><h2 style="${S.h2}">Know whether you are buying in a visitor area or a year-round one</h2><p style="${S.p}">The Grand Strand is really two housing markets sitting next to each other. Some streets are mostly short-term rentals, close to the beach, busy in summer and quiet in January. Others are ordinary year-round neighborhoods where the same cars are in the same driveways in February.</p><p style="${S.p}">Neither is better. They suit different plans. If you are buying an investment property, rental activity near the beach is the point, and our ${A('/invest/str-rules/', 'short-term rental rules page')} covers where it is allowed.</p><p style="${S.pLast}">Rental activity is a matter of public record rather than opinion. Short-term rental permits are filed with the municipality, and an association&#39;s rental cap and minimum lease term are written into its covenants. Ask us for the covenants and the permit records on any address and read them yourself.</p><div style="${S.ctaBox}"><p style="margin:0;color:var(--navy);font-family:var(--sans);font-size:.92rem;font-weight:600">We will pull the covenants and permit records on any address you are considering.</p><div style="display:flex;gap:.7rem;flex-wrap:wrap"><a class="btn btn-brass" href="#lead-form">Get the documents</a><a class="btn btn-outline" href="tel:+18543332135">Call 854.333.2135</a></div></div></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">If you run a business</p><h2 style="${S.h2}">You cannot charge northern prices here</h2><p style="${S.pLast}">Business owners who move down repeatedly find they have to cut their rates. That is not a local quirk, it is the same fact that made the housing cheap: prices and wages across this market are lower than in a northern metro, so the going rate for your work is lower too. If your plan depends on keeping your old prices, price your service against local competitors before you count on the income. Plenty of people make the trade happily, because the lower cost of living absorbs it. It is only a problem when nobody warned you.</p></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Healthcare</p><h2 style="${S.h2}">What medical care is here, and what is a drive</h2><p style="${S.p}">Better covered than most areas this size, and expanding. Grand Strand Medical Center in Myrtle Beach has 403 beds and is a verified adult Level I trauma center, so the most serious adult emergencies are treated here rather than transferred. Conway Medical Center has 222 beds, McLeod Health Seacoast in Little River 155, Tidelands Waccamaw in Murrells Inlet 124, Tidelands Georgetown 131 and McLeod Health Loris 50.</p><p style="${S.p}">Three more hospitals are in progress: a 48-bed McLeod hospital in Carolina Forest, a 59-bed Grand Strand Health hospital on the US-17 Bypass expected in late 2027, and a 36-bed Tidelands hospital with MUSC at the SC-31 and SC-707 interchange expected in 2028. Bed counts and timelines come from each health system.</p><p style="${S.pLast}">What is not here is Level I pediatric trauma and organ transplant. Both are at MUSC in Charleston, about two hours south, and some specialist care follows the same pattern. For veterans, the Myrtle Beach VA clinic is outpatient only and the nearest VA medical center is also in Charleston.</p></div></section>

<section style="background:var(--ivory)"><div class="wrap"><p style="${S.eyebrow}">Small stuff that is not small</p><h2 style="${S.h2}">Bugs, and the rest of coastal life</h2><p style="${S.pLast}">Mosquitoes are more noticeable than in a dense city, because much of the county is low, wet and rural. Horry County runs a mosquito control program with truck and aerial spraying that starts in early May, and residents outside city limits can request treatment. Near marsh you also meet biting midges, which everyone here calls no-see-ums. They are small enough to pass through a standard screen, so a finer mesh and a fan on the porch do more than repellent. The large cockroaches locals call palmetto bugs live outdoors in trees and come inside occasionally. None of this is a reason not to move. All of it is a reason to budget for pest control and look at the screens.</p></div></section>

<section style="background:var(--navy)" id="lead-form"><div class="wrap" style="padding:3.5rem 1.5rem"><div style="max-width:620px;margin:0 auto">
<p style="font-family:var(--sans);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--brass-2);margin-bottom:.7rem;text-align:center">Free, no obligation</p>
<h2 style="font-family:var(--serif);font-size:1.9rem;font-weight:300;color:var(--ivory);letter-spacing:-.01em;margin-bottom:.6rem;text-align:center">Ask us the question you think we will dodge.</h2>
<p style="font-family:var(--sans);font-size:.93rem;color:rgba(244,239,232,.68);margin:0 auto 1.9rem;line-height:1.65;text-align:center;max-width:52ch">Tell us what you are worried about and where you are moving from. You get a straight answer and the numbers on a real house, not a brochure.</p>
<div id="ldWrap">
<div style="display:grid;gap:.7rem;margin-bottom:1rem">
<input class="ld-in" id="ldCtx" placeholder="What you want to know, and where you are moving from">
<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:.7rem"><input class="ld-in" id="ldName" placeholder="Your name" autocomplete="name"><input class="ld-in" id="ldPhone" placeholder="Phone" type="tel" autocomplete="tel"></div>
<input class="ld-in" id="ldEmail" placeholder="Email" type="email" autocomplete="email">
</div>
<label style="display:flex;gap:.6rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:rgba(244,239,232,.6);line-height:1.5;margin:0 0 1.1rem;cursor:pointer"><input type="checkbox" id="ldConsent" style="margin-top:.18rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.</span></label>
<p id="ldErr" style="display:none;color:#e6b0a9;font-family:var(--sans);font-size:.8rem;margin:0 0 .8rem"></p>
<button class="btn btn-brass" style="width:100%;justify-content:center" onclick="ldSubmit()">Send it</button>
<p style="font-family:var(--sans);font-size:.78rem;color:rgba(244,239,232,.6);margin:.9rem 0 0;line-height:1.6;text-align:center">We reply the same day, evenings included. Prefer to talk now? <a href="tel:+18543332135" style="color:var(--brass-2);font-weight:600;text-decoration:none;white-space:nowrap">Call 854.333.2135</a></p>
</div>
<div id="ldOk" style="display:none;border:1px solid var(--brass);border-radius:6px;padding:1.4rem;color:var(--ivory);text-align:center;line-height:1.6;font-family:var(--sans)">Thanks. A licensed team member will reply the same day, evenings included.</div>
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
 if(!cx||!n){fail('Add your question and your name.');return;}
 if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}
 if(ph&&!c){fail('Check the consent box so we can call or text you, or leave the phone blank and use email.');return;}
 c3SendForm({property_address:cx,name:n,phone:ph,email:em,consent:c?'yes':'no'},'relocating-pros-and-cons');
 document.getElementById('ldWrap').style.display='none';
 document.getElementById('ldOk').style.display='block';
}
</script></div></section>

<section style="background:var(--ivory-2)"><div class="wrap"><p style="${S.eyebrow}">Common questions</p><h2 style="${S.h2}">Living in Myrtle Beach FAQ</h2>${faqHtml}<div style="border-top:1px solid var(--rule);margin-top:2.2rem;padding-top:1.5rem;max-width:720px"><p style="${S.eyebrow}">Who wrote this</p><p style="${S.small}">Chapter 3 Realty is a real estate brokerage in Myrtle Beach, built as a partnership around a simple idea: you should be as informed as possible on the biggest purchase of your life, every single time. Timmy Fredrick Nash is the Broker-in-Charge, South Carolina broker license 43182, with more than 30 years selling real estate on the Grand Strand. He reviews every page we publish and runs our market analyses himself. His father, Fred Nash, sold real estate here before him, and the Fred Nash Boulevard by the airport carries the family name. Devin Day wrote this page. He is our Operations Officer, a licensed mortgage loan originator, NMLS 2721275, and a relocator himself, from Ohio. Meet the team on ${A('/about/', 'the about page')} or read ${A('/why-chapter-3/', 'why buyers work with us')}. The direct line is <a href="tel:+18543332135" style="${S.a}">854.333.2135</a>.</p></div>
<p style="${S.small};margin-top:1.6rem"><strong style="color:var(--navy)">Sources:</strong> ${X('https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area', 'BEA regional price parities')}, ${X('https://www.ncei.noaa.gov/access/us-climate-normals/', 'NOAA climate normals')}, ${X('https://www.weather.gov/ilm/', 'National Weather Service Wilmington')}, ${X('https://tidesandcurrents.noaa.gov/stationhome.html?id=8661070', 'NOAA Springmaid Pier gauge')}, ${X('https://www.horrycountysc.gov/departments/stormwater/major-initiatives/mosquito-control/', 'Horry County Mosquito Control')}, ${X('https://www.scdot.org/travel/travel-trafficdata.html', 'SCDOT traffic counts')}, ${X('https://www.cityofmyrtlebeach.com/i_want_to/learn_about/beach_conditions.php', 'Myrtle Beach beach rules')}. Hospital bed counts and project timelines come from each health system. Drive times are off-peak estimates. Household bills and observations are ours and are labelled as such.</p></div></section>
`,
};

module.exports = spec;
