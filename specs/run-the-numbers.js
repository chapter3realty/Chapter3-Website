/* /invest/run-the-numbers/ - the conversion page every investor page links to.
 * Built by tools/mkpage.js. Owner brief 2026-09-05: "one page every investor
 * page links to: the reader pastes a listing address and a strategy, we send
 * back the numbers." The form posts through the shared c3SendForm() to the
 * CRM with the locked TCPA string. */
const { h } = require("../tools/mkpage.js");

const TCPA = "I consent to receive calls and text messages from Chapter 3 Realty about my property inquiry, showing appointments, and listing information I requested, at the phone number provided, including calls placed using an automated system or an artificial or prerecorded voice. Message frequency varies. Message and data rates may apply. Reply HELP for help, STOP to opt out. Consent is not a condition of any purchase.";

const FORM = `<div id="rnWrap" style="max-width:680px;background:var(--ivory);border:1px solid var(--rule);border-radius:14px;padding:1.6rem;text-align:left;margin:1.4rem 0">
<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="rnAddr" placeholder="Property address or MLS number" aria-label="Property address or MLS number"></div>
<div class="idx-lead" style="grid-template-columns:1fr"><select class="idx-input" id="rnPlan" aria-label="Your plan for the property"><option value="">Your plan for the property</option><option>Long-term rental</option><option>Short-term rental</option><option>Mid-term rental</option><option>Fix and flip</option><option>Not sure yet</option></select></div>
<div class="idx-lead" style="grid-template-columns:1fr"><textarea class="idx-input" id="rnNotes" rows="3" aria-label="Anything you already know" placeholder="Anything you already know: rent history, dues, cash or loan, whether you will stay in it yourself"></textarea></div>
<div class="idx-lead"><input class="idx-input" id="rnName" placeholder="Your name" aria-label="Your name"><input class="idx-input" id="rnPhone" placeholder="Phone" type="tel" aria-label="Phone"></div>
<div class="idx-lead" style="grid-template-columns:1fr"><input class="idx-input" id="rnEmail" placeholder="Email" type="email" aria-label="Email"></div>
<label class="form-consent" style="display:flex;gap:.5rem;align-items:flex-start;font-family:var(--sans);font-size:.72rem;color:var(--muted);line-height:1.45;margin:0 0 .85rem;cursor:pointer"><input type="checkbox" id="rnConsent" style="margin-top:.15rem;accent-color:var(--brass);flex-shrink:0;width:15px;height:15px"><span>${TCPA}</span></label>
<p id="rnErr" style="display:none;color:#a03333;font-family:var(--sans);font-size:.8rem;margin:0 0 .7rem"></p>
<button class="btn btn-brass" style="width:100%" onclick="rnSubmit()">Send the address</button>
<p style="font-family:var(--sans);font-size:.75rem;color:var(--muted);margin:.7rem 0 0;line-height:1.5">Free, no obligation. A licensed team member replies the same day, evenings included. Prefer to talk now? <a href="tel:+18543332135" class="btn btn-outline" style="padding:.35rem .8rem;font-size:.8rem">Call 854.333.2135</a>.</p>
</div>
<div id="rnOk" style="display:none;max-width:680px;background:var(--ivory);border:1px solid var(--brass);border-radius:14px;padding:1.4rem;color:var(--navy);line-height:1.6;margin:1.4rem 0">Thanks. A licensed team member will send the numbers for that address the same day, evenings included.</div>
<script>
function rnSubmit(){
 var a=document.getElementById('rnAddr').value.trim(),pl=document.getElementById('rnPlan').value,nt=document.getElementById('rnNotes').value.trim(),n=document.getElementById('rnName').value.trim(),ph=document.getElementById('rnPhone').value.trim(),em=document.getElementById('rnEmail').value.trim(),c=document.getElementById('rnConsent').checked,err=document.getElementById('rnErr');
 function fail(m){err.textContent=m;err.style.display='block';}
 err.style.display='none';
 if(!a||!n){fail('Add the property address and your name.');return;}
 if(!ph&&!em){fail('Add a phone number or an email so we can reach you.');return;}
 if(!c){fail('Check the consent box to send the request.');return;}
 var interest=(pl==='Short-term rental')?'STR / Vacation rental':'Investment property';
 var msg='Plan: '+(pl||'not stated')+(nt?'. '+nt:'');
 c3SendForm({property_address:a,name:n,phone:ph,email:em,interest:interest,message:msg,consent:'yes'},'run-the-numbers');
 document.getElementById('rnWrap').style.display='none';
 document.getElementById('rnOk').style.display='block';
}
</script>`;

module.exports = {
  url: "/invest/run-the-numbers/",
  title: "Run the Numbers on a Myrtle Beach Rental | Chapter3",
  description: "Send the address of a Myrtle Beach rental you are considering. We return the rent, taxes at the 6 percent rate, insurance, dues and cash flow, free.",
  ogTitle: "Run the numbers on a Myrtle Beach rental before you offer",
  crumb: "Run the numbers",
  eyebrow: "Free, before you offer",
  h1: "Run the numbers on a Myrtle Beach rental",
  h1em: "before you offer.",
  sub: "Send one address. You get the numbers for that Myrtle Beach rental: rent, property tax at the 6 percent rate, insurance, dues, management and cash flow, free.",
  heroCta: { label: "Send the address", href: "#run-form" },
  author: "devin",
  shortAnswer: "Send the address of a Myrtle Beach rental you are thinking about buying, and the plan you have for it. A licensed team member builds the numbers for that property. That means the rent it can earn, the property tax at the 6 percent rate, the insurance, the HOA dues, the management fee and the monthly cash flow. You get them the same day, free, with no obligation. The investor analyzer does a first pass on its own if you want to start there.",
  sections: [
    { h2: "What is a run-the-numbers request?", html:
      h.p("It is one address and one plan, sent to us before you offer. We build the purchase numbers for that property and send them back to you. It is the same work we do for a client before any offer, done before you decide whether to work with us.") +
      h.p("The numbers are estimates for a buying decision. They are not an appraisal and not a loan quote. Your lender sets the loan terms and an appraiser sets the appraised value.") },
    { h2: "What do you get back?", html:
      h.p("One sheet with the lines below, each with its source.") +
      h.table(["What you get", "Where it comes from"], [
        ["Rent the unit can earn", "Rented comparables from the MLS, and the unit&#39;s own rental history when the seller provides it."],
        ["Property tax", `The county&#39;s assessed value at the 6 percent rate for a property that is not your legal residence. ${h.a("/buyers/property-taxes/", "How Horry County property tax works")}.`],
        ["Insurance", `An estimate for that address, with wind and flood where the zone requires it. ${h.a("/buyers/coastal-insurance/", "Coastal insurance, explained")}.`],
        ["HOA dues and what they cover", `The listing and the association documents. ${h.a("/hoa/", "Our HOA guide")}.`],
        ["Management", `The fee for the plan you chose: the building&#39;s rental program, an outside company, or self-managed. ${h.a("/invest/condos/", "Why we do not default to the on-site manager")}.`],
        ["Monthly cash flow and DSCR", `Rent minus every cost above and the loan. DSCR is the ratio your lender checks. ${h.a("/invest/strategies/dscr-loans/", "DSCR loans, explained")}.`],
        ["Rental rules at that address", `Whether nightly rentals are allowed there, by city and zone. ${h.a("/invest/str-rules/", "The rules by city")}.`],
        ["Building financing, for a condo", `Whether lenders finance that building. ${h.a("/invest/condotel-financing/", "Condotel financing")}.`],
      ]) },
    { h2: "What should you send?", id: "run-form", html:
      h.p("The address is enough. Everything else helps.") +
      h.ul([
        "The address, or the MLS number.",
        "Your plan: long-term rental, short-term rental, mid-term rental or fix and flip. Not sure is fine.",
        `How you plan to pay, cash or a loan. We do not need your finances to run the property. ${h.a("/invest/cash-to-close/", "What you pay at closing, beyond the down payment")}.`,
        `Whether you will stay in it yourself. More than 14 nights a year changes the tax treatment. ${h.a("/invest/14-day-rule/", "The 14-day rule")}.`,
        "Anything you already have: a rent history, the dues, a prior inspection.",
      ]) + FORM },
    { h2: "How long does it take?", html:
      h.p("Most requests come back the same day, evenings included. A condo takes longer when the dues or the rental rules are only in the association documents, because we request them first. An address in a zone where nightly rentals need checking takes a call to the city.") +
      h.p("You get the numbers by email. If you gave a phone number, you also get a call.") },
    { h2: "Can you run the numbers yourself first?", html: (bg) =>
      h.p(`Yes. ${h.a("/invest/long-term-rental/", "The investor analyzer")} takes a price, a rent and the costs. It returns the monthly cash flow, the cap rate and the DSCR. The cap rate is the yearly net income divided by the price. The DSCR is the rent divided by the loan payment. ${h.a("/invest/str-tools/", "The short-term rental tools")} estimate nightly revenue by area.`) +
      h.p("A person adds three things the tools cannot: the rent a specific unit gets, the rules in that building, and an insurance figure for that address.") +
      h.cta("Already ran it through the analyzer?", "Send the address and the number you got. We tell you what the tool could not see.", "Send the address", "#run-form", bg) },
    { h2: "Why get the numbers from a local agent?", html:
      h.p("Agents at Chapter3 own rentals on the Grand Strand. Tim Nash has sold on this beach for more than 30 years. The rent comparables come from the same MLS we sell from, and the building rules come from the association documents.") +
      h.p("A national site gives you averages. We give you the numbers for one address, from people who work here.") },
    { h2: "What happens after you send it?", html:
      h.p("A licensed team member reads the request and builds the sheet. You get it by email the same day, evenings included. If you gave a phone number, you get a call too.") +
      h.p("If the numbers work, we can set up a showing or walk the property on video for you. If they do not work, we say so and you keep the sheet. You can send more than one address.") },
  ],
  faqTitle: "Run-the-numbers FAQ",
  faq: [
    { q: "Is running the numbers free?", a: "Yes. There is no fee and no obligation. You can send one address or several." },
    { q: "Do I need to be working with Chapter3 already?", a: "No. Send the address and we build the numbers. You decide afterwards whether to work with us." },
    { q: "Can you run numbers on a property listed with another brokerage?", a: "Yes. Any property for sale on the Grand Strand. We use the listing, the county record, rental comparables and the association documents." },
    { q: "What if the property is not for sale yet?", a: "Send it anyway. We run numbers on a property you already own or one you are watching." },
    { q: "Will you call me?", a: "Only if you give a phone number. Leave it blank and we answer by email." },
  ],
  sources: [
    { name: "Horry County Assessor, Guide to Assessment", href: "https://www.horrycountysc.gov/departments/assessor/guide-to-assessment/" },
    { name: "IRS Publication 527, residential rental property", href: "https://www.irs.gov/publications/p527" },
  ],
  sourcesNote: "The numbers we send are estimates for a buying decision, not an appraisal or a loan quote.",
  bottomCta: { h2: "One address is enough to start.", p: "Send it and a licensed team member returns the numbers the same day, evenings included.", label: "Send the address", href: "#run-form" },
  keywords: "run the numbers on a Myrtle Beach rental, Myrtle Beach rental property analysis, investment property cash flow Myrtle Beach, free rental analysis Myrtle Beach",
  about: "Myrtle Beach investment property analysis",
};
