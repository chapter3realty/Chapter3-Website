/* /invest/section-8-rentals/ - renting to Housing Choice Voucher tenants in
 * Horry County. Rules read 2026-09-07 at law.cornell.edu (eCFR blocks fetches;
 * links point at eCFR). Local facts from mbhaonline.org, conwayhousingsc.org and
 * the City of Myrtle Beach news page, the same day. FY2027 fair market rents from
 * HUD's file, re-opened the same day. Brokerage facts from
 * research/invest-next/owner-answers-batch4.md (rounds 1 and 2), fact-checked
 * there; the developer story is anonymized. The rent-split tool uses the fair
 * market rent at a chosen percent because neither authority publishes its
 * standard; its assumptions are stated under it (PLAYBOOK A21) and two cases
 * are hand-computed in the HANDOFF (A34). Built by tools/mkpage.js. */
const { h } = require("../tools/mkpage.js");

const TEL = "tel:+18543332135";
const C503 = "https://www.ecfr.gov/current/title-24/section-982.503";
const C505 = "https://www.ecfr.gov/current/title-24/section-982.505";
const C507 = "https://www.ecfr.gov/current/title-24/section-982.507";
const C508 = "https://www.ecfr.gov/current/title-24/section-982.508";
const C402 = "https://www.ecfr.gov/current/title-24/section-982.402";
const C305 = "https://www.ecfr.gov/current/title-24/section-982.305";
const C451 = "https://www.ecfr.gov/current/title-24/section-982.451";
const C404 = "https://www.ecfr.gov/current/title-24/section-982.404";
const C552 = "https://www.ecfr.gov/current/title-24/section-982.552";
const C310 = "https://www.ecfr.gov/current/title-24/section-982.310";
const MBHA = "https://mbhaonline.org/housing_programs/housing_choice_voucher_program_(hcv)/index.php";
const MBHAAPP = "https://mbhaonline.org/applicants/applicant_information.php";
const MBNEWS = "https://www.cityofmyrtlebeach.com/news_detail_T6_R1498.php";
const CHA = "https://www.conwayhousingsc.org/housing-choice-vouchers";
const CHALL = "https://www.conwayhousingsc.org/landlords";
const FMR27 = "https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx";
const FMRDEF = "https://www.huduser.gov/portal/datasets/fmr.html";

const TOOL = `
<div id="s8tool" style="background:var(--ivory-2);border:1.5px solid var(--rule);padding:1.4rem 1.4rem 1.2rem;margin:1.2rem 0 1.4rem">
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.9rem 1.2rem;margin-bottom:1rem">
    <label style="display:block;font-size:.78rem;color:var(--muted);font-weight:600">Your monthly rent<br><input id="s8rent" type="number" min="0" step="25" value="1800" oninput="c3S8()" aria-label="Your monthly rent in dollars" style="width:100%;max-width:150px;margin-top:.3rem;background:var(--ivory);border:1px solid rgba(28,32,40,.3);border-radius:6px;color:var(--navy);font-family:var(--sans);font-size:.95rem;padding:.42rem .55rem"></label>
    <label style="display:block;font-size:.78rem;color:var(--muted);font-weight:600">Family income a month, before tax<br><input id="s8inc" type="number" min="0" step="50" value="2400" oninput="c3S8()" aria-label="Family monthly income in dollars" style="width:100%;max-width:150px;margin-top:.3rem;background:var(--ivory);border:1px solid rgba(28,32,40,.3);border-radius:6px;color:var(--navy);font-family:var(--sans);font-size:.95rem;padding:.42rem .55rem"></label>
    <label style="display:block;font-size:.78rem;color:var(--muted);font-weight:600">Bedrooms on the voucher<br><select id="s8br" onchange="c3S8()" aria-label="Bedrooms on the voucher" style="width:100%;max-width:150px;margin-top:.3rem;background:var(--ivory);border:1px solid rgba(28,32,40,.3);border-radius:6px;color:var(--navy);font-family:var(--sans);font-size:.95rem;padding:.42rem .55rem"><option value="0">Studio</option><option value="1">One</option><option value="2">Two</option><option value="3" selected>Three</option><option value="4">Four</option></select></label>
    <label style="display:block;font-size:.78rem;color:var(--muted);font-weight:600">Authority standard, percent of fair market rent<br><select id="s8pct" onchange="c3S8()" aria-label="Payment standard as a percent of the fair market rent" style="width:100%;max-width:150px;margin-top:.3rem;background:var(--ivory);border:1px solid rgba(28,32,40,.3);border-radius:6px;color:var(--navy);font-family:var(--sans);font-size:.95rem;padding:.42rem .55rem"><option value="90">90</option><option value="100" selected>100</option><option value="110">110</option></select></label>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem 1rem;margin-bottom:.9rem">
    <div><div style="font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Payment standard</div><div id="s8ps" style="font-family:var(--serif);font-size:1.5rem;color:var(--navy)">$1,823</div></div>
    <div><div style="font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Authority pays</div><div id="s8hap" style="font-family:var(--serif);font-size:1.5rem;color:var(--navy)">$1,080</div></div>
    <div><div style="font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">Tenant pays</div><div id="s8ten" style="font-family:var(--serif);font-size:1.5rem;color:var(--navy)">$720</div><div id="s8share" style="font-size:.78rem;color:var(--muted)">30 percent of income</div></div>
  </div>
  <p id="s8note" style="font-size:.85rem;color:var(--navy);line-height:1.5;margin:0 0 1rem;min-height:1.2em"></p>
  <div style="font-size:.78rem;color:var(--muted);margin-bottom:.35rem">Who pays your rent</div>
  <div id="s8chart1" style="margin-bottom:1rem"></div>
  <div style="font-size:.78rem;color:var(--muted);margin-bottom:.35rem">Which bedroom standards reach your rent</div>
  <div id="s8chart2"></div>
</div>
<script>
  var FMR={0:1155,1:1258,2:1504,3:1823,4:1981}, NAMES=["Studio","One bedroom","Two bedrooms","Three bedrooms","Four bedrooms"];
  var BRASS="#c4783a", PURPLE="#6a5aa8", GRAY="#b9b3aa", NAVY="#1c2028", MUTED="rgba(28,32,40,.78)";
  function $(i){return document.getElementById(i)}
  function fmt(n){return "$"+Math.round(n).toLocaleString("en-US")}
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;")}
  function c3S8(){
    var rent=Math.max(0,+$("s8rent").value||0), inc=Math.max(0,+$("s8inc").value||0), br=+$("s8br").value, pct=+$("s8pct").value;
    var ps=Math.round(FMR[br]*pct/100), ttp=Math.round(inc*0.30);
    var hap=Math.max(0,Math.min(ps,rent)-ttp), tenant=Math.max(0,rent-hap), share=inc>0?tenant/inc:0;
    $("s8ps").textContent=fmt(ps); $("s8hap").textContent=fmt(hap); $("s8ten").textContent=fmt(tenant);
    $("s8share").textContent=inc>0?Math.round(share*100)+" percent of income":"";
    var note="";
    if(rent>ps) note+="Your rent is "+fmt(rent-ps)+" above the standard. The tenant pays that part. ";
    if(inc>0&&share>0.40) note+="That is over the 40 percent cap at move-in. The authority will not approve this rent for this family.";
    $("s8note").textContent=note;
    var W=600, total=Math.max(rent,1), w1=Math.round(W*hap/total), w2=Math.max(0,W-w1-(w1>0&&tenant>0?2:0));
    var s='<svg viewBox="0 0 '+W+' 58" width="100%" role="img" aria-label="Authority pays '+fmt(hap)+', tenant pays '+fmt(tenant)+'" style="display:block;max-width:600px;font-family:var(--sans)">';
    if(hap>0) s+='<rect x="0" y="0" width="'+w1+'" height="24" rx="0" fill="'+BRASS+'"><title>Authority pays '+esc(fmt(hap))+'</title></rect>';
    if(tenant>0) s+='<rect x="'+(w1+(hap>0?2:0))+'" y="0" width="'+w2+'" height="24" fill="'+PURPLE+'"><title>Tenant pays '+esc(fmt(tenant))+'</title></rect>';
    s+='<rect x="0" y="34" width="12" height="12" fill="'+BRASS+'"/><text x="17" y="44" font-size="12" fill="'+NAVY+'">Authority '+esc(fmt(hap))+'</text>';
    s+='<rect x="190" y="34" width="12" height="12" fill="'+PURPLE+'"/><text x="207" y="44" font-size="12" fill="'+NAVY+'">Tenant '+esc(fmt(tenant))+'</text>';
    s+='<text x="380" y="44" font-size="12" fill="'+MUTED+'">Rent '+esc(fmt(rent))+'</text></svg>';
    $("s8chart1").innerHTML=s;
    var max=Math.max(rent,Math.round(FMR[4]*1.1))*1.08, L=118, BW=W-L-60, rowH=26, H=5*rowH+24;
    var c='<svg viewBox="0 0 '+W+' '+H+'" width="100%" role="img" aria-label="Payment standard by bedroom count against your rent" style="display:block;max-width:600px;font-family:var(--sans)">';
    for(var b=0;b<5;b++){var v=Math.round(FMR[b]*pct/100), bw=Math.max(2,Math.round(BW*v/max)), y=b*rowH+4, reach=v>=rent;
      c+='<text x="'+(L-8)+'" y="'+(y+15)+'" font-size="12" text-anchor="end" fill="'+NAVY+'">'+NAMES[b]+'</text>';
      c+='<rect x="'+L+'" y="'+y+'" width="'+bw+'" height="20" fill="'+(reach?BRASS:GRAY)+'"><title>'+NAMES[b]+': '+esc(fmt(v))+(reach?" reaches your rent":" is under your rent")+'</title></rect>';
      c+='<text x="'+(L+bw+6)+'" y="'+(y+15)+'" font-size="12" fill="'+NAVY+'">'+esc(fmt(v))+'</text>';}
    var rx=L+Math.round(BW*rent/max);
    c+='<line x1="'+rx+'" y1="0" x2="'+rx+'" y2="'+(5*rowH+4)+'" stroke="'+NAVY+'" stroke-width="2"/>';
    c+='<text x="'+Math.min(rx+6,W-90)+'" y="'+(5*rowH+18)+'" font-size="11" fill="'+MUTED+'">Your rent '+esc(fmt(rent))+'</text></svg>';
    $("s8chart2").innerHTML=c;
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",c3S8); else c3S8();
</script>`;

module.exports = {
  url: "/invest/section-8-rentals/",
  title: "Section 8 Rentals in Horry County, SC | Chapter3",
  description: "Renting to Section 8 voucher tenants in Horry County: the two housing authorities, the payment standard by bedroom count, the inspection, and how you get paid.",
  ogTitle: "Renting to Section 8 voucher tenants in Horry County",
  crumb: "Section 8 rentals",
  eyebrow: "Voucher rentals",
  h1: "How does renting to a Section 8 voucher tenant work in Horry County?",
  h1em: "The payment standard, the inspection, the contract.",
  sub: "In Horry County the housing authority pays most of a voucher tenant's rent by direct deposit, up to a payment standard that depends on the bedroom count.",
  heroCta: { label: "Call to learn more", href: TEL },
  author: "devin",
  shortAnswer: "A Housing Choice Voucher, still called Section 8, pays part of a tenant's rent. Two housing authorities run it in Horry County. The Housing Authority of Myrtle Beach covers its service area in the eastern county. The Conway Housing Authority covers Conway and the unincorporated county. The authority pays its share to you by direct deposit each month. The tenant pays the rest. The most the program pays depends on a payment standard for each bedroom count, between 90 and 110 percent of the federal fair market rent. For four bedrooms that rent is $1,981 this fiscal year. The house must pass an inspection first, and the rent must match similar houses nearby. We run the numbers before you offer.",
  sections: [
    { h2: "What is a Housing Choice Voucher?", html:
      h.p(`A voucher is federal rent help. A family with low income uses it to rent a house from a private owner. Most people still call it Section 8.`) +
      h.p(`The federal housing agency pays for it. A local housing authority runs it. The family finds the house. You screen the family and rent to them. The authority pays part of the rent to you.`) +
      h.table(["Who", "What they do"], [["The family", "Finds the house, signs the lease, pays its share of the rent"], ["The housing authority", "Inspects the house, checks the rent, pays its share by direct deposit"], ["You", "Screen the family, sign the lease and the contract, keep the house to the standard"]]) +
      h.p(`The voucher has a bedroom count. ${h.ext(C402, "The authority picks it by family size")}. The family may rent a bigger or a smaller house. The count matters because it caps what the program pays.`) +
      h.p(`The tenant pays a share of the rent from income, usually 30 to 40 percent of adjusted income. The authority pays the rest, up to its cap.`) },
    { h2: "Who runs the program in Horry County?", html:
      h.table(["Authority", "Vouchers", "Where its vouchers can be used", "Phone"], [["Housing Authority of Myrtle Beach", "660", "Its service area, which it describes as eastern Horry County", "843-918-1525"], ["Conway Housing Authority", "373", "The City of Conway and the unincorporated county", "843-248-7327"]]) +
      h.p(`${h.ext(MBHA, "The Myrtle Beach authority")} is at 1704 North Oak Street. ${h.ext(MBHAAPP, "Its vouchers work only inside its service area")}. ${h.ext(CHA, "The Conway authority")} lists its rules and forms online.`) +
      h.p(`The tenant's voucher names the authority. A Conway voucher rents in Conway or the unincorporated county. A Myrtle Beach voucher rents in that authority's service area. Ask which authority issued the voucher before you take an application.`) },
    { h2: "How much does a voucher pay?", html: (bg) =>
      h.p(`The program pays up to a payment standard for each bedroom count. ${h.ext(C503, "The rule puts the standard between 90 and 110 percent")} of the federal fair market rent. Each authority picks its own number in that range. Neither authority lists its standards online. Ask for the current table before you price the house.`) +
      h.table(["Bedrooms", "Fair market rent, federal fiscal year 2027"], [["Studio", "$1,155"], ["One", "$1,258"], ["Two", "$1,504"], ["Three", "$1,823"], ["Four", "$1,981"]]) +
      h.p(`${h.ext(FMR27, "Those are the federal figures for Horry County")}, ${h.ext(FMRDEF, "the 40th percentile of rents")} for standard units with utilities included. At 110 percent, the four-bedroom standard is $2,179.`) +
      h.p(`The standard is the most the program counts toward the rent. The authority pays the standard minus the tenant's share. If you charge more than the standard, the tenant pays the extra.`) +
      h.p(`${h.ext(C505, "The authority uses the lower of two bedroom counts")}: the count on the voucher and the count of your house. A four-bedroom house earns the four-bedroom standard only for a family with a four-bedroom voucher.`) +
      h.p(`In Chapter3's files a developer from Maryland buys three- and four-bedroom houses here that need work. He fixes them and rents them to voucher families. One house cost $220,000 to buy and repair. It is worth about $280,000 now and rents at the four-bedroom standard. The bedroom count is why he buys the bigger houses.`) +
      h.cta("Want help buying a house for this strategy?", "Tell us the bedroom count and the budget. We find houses that pass the inspection and fit the payment standard, and run the numbers before you offer.", "Call a specialized agent", TEL, bg) },
    { h2: "How is the rent split between the tenant and the authority?", html:
      h.p(`Enter your rent and the family's income. The tool splits the rent between the authority and the tenant. It also shows which bedroom standards reach your rent.`) +
      h.raw(TOOL) +
      h.p(`The tool uses the federal fair market rent for the bedroom count, at the percent you pick, because neither authority publishes its standard. It estimates the tenant's share at 30 percent of the income you enter. The authority uses adjusted income, its own standard and a utility allowance, so its numbers will differ. The rent must also pass the rent check below.`) },
    { h2: "What stops you from charging the most the voucher allows?", html:
      h.p(`Four things.`) +
      h.ol([
        `<strong>The rent check.</strong> ${h.ext(C507, "The authority may not approve the lease until it decides your rent is reasonable")} against similar unassisted houses nearby. It looks at location, quality, size, type, age, and what you include. Your rent can never be above what you charge unassisted tenants for the same kind of unit.`,
        `<strong>The 40 percent cap.</strong> ${h.ext(C508, "At move-in the tenant's share cannot exceed 40 percent")} of the family's adjusted income. If your rent is above the standard, the extra comes from the tenant, and the cap can block the lease.`,
        `<strong>The utility allowance.</strong> If the tenant pays the utilities, the authority adds a utility allowance to your rent before it compares the total to the standard. ${h.ext(C505, "The comparison uses gross rent")}, rent plus utilities. A house where the tenant pays utilities has less room under the standard.`,
        `<strong>The bedroom count on the voucher.</strong> The standard follows the smaller of the voucher's count and the house's count.`,
      ]) +
      h.p(`The standard is a ceiling, not a price. The rent you can charge is the market rent for that house, up to the standard.`) },
    { h2: "How do you get a house approved?", html:
      h.p(`The house is approved after you find the tenant, not before. The authority inspects for a specific family and a specific lease. There is no list of pre-approved houses.`) +
      h.ol([
        `<strong>Screen the family.</strong> Screen the way you screen any tenant. The authority checks income for the program. It does not check the family for you. ${h.a("/invest/landlord-rules/", "The screening notices the law requires")}.`,
        `<strong>File the request.</strong> Complete the request for tenancy approval with the family. The Conway authority calls it the leasing packet.`,
        `<strong>Pass the inspection.</strong> ${h.ext(C305, "An authority this size must inspect within 15 days")} of the request. Conway says three to fifteen days. The inspector checks heat, plumbing, electricity, hazards, and the structure.`,
        `<strong>Pass the rent check.</strong> The authority compares your rent with similar unassisted houses nearby. It approves the rent or asks for a lower number.`,
        `<strong>Sign the contract.</strong> You sign a lease with the family and a payments contract with the authority. ${h.ext(C305, "The contract must be signed within 60 days of the lease start")}. The authority pays nothing before it is signed. Once signed, it pays back to the lease start, up to 60 days.`,
        `<strong>Get paid.</strong> ${h.ext(CHALL, "The Conway authority pays by direct deposit")} each month. The family pays its share to you.`,
      ]) +
      h.p(`${h.ext(C404, "You must keep the house to the inspection standard")} while you take the payments. The authority re-inspects. If you miss a repair deadline, it stops paying until the repair is done.`) },
    { h2: "How hard is it to find a tenant with a voucher?", html:
      h.p(`Not hard. The two authorities hold 1,033 vouchers between them, and far more families want one than can get one.`) +
      h.p(`${h.ext(CHA, "The Conway waiting list is closed")}. ${h.ext(MBNEWS, "The Myrtle Beach authority last opened its list in January 2022")}, for two days. It drew 1,000 names by lottery from the applications and told applicants the wait can be years.`) +
      h.p(`In Conway's program a family with a voucher has 60 days to find a house. The family chooses the house. Your competition is the other houses that take vouchers and fit the standard. The authority does not publish how many there are.`) +
      h.p(`The gate is not the tenant. It is the inspection and the rent check. A house that passes both, with the right bedroom count, at or under the standard, has a tenant pool with few other choices.`) },
    { h2: "Does Horry County pay on time?", html:
      h.p(`The housing authority's share, yes. ${h.ext(C451, "The rule requires the authority to pay when due")}, and the contract can charge the authority a late fee if local landlords charge one. In Chapter3's files the authority's share has arrived on time every month.`) +
      h.p(`The tenant's share is different. The family owes it under the lease, and it can be late like any rent. You collect it and, if you must, ${h.a("/invest/landlord-rules/", "evict for it the way you evict anyone")}. The first payment also waits for the contract, so plan for a gap between move-in and the first deposit.`) },
    { h2: "What happens if a voucher tenant damages the house?", html: (bg) =>
      h.p(`Report it to the authority in writing. Then use the deposit and the courts the way you would with any tenant. ${h.ext(C404, "Damage beyond ordinary wear breaks the family's program obligations")}, and the authority must act on it.`) +
      h.p(`${h.ext(C552, "The authority may end the family's assistance")} for that. It must end it if you evict the family through the court for a serious lease violation. It may refuse the family a new voucher for five years after an eviction from assisted housing. It may also refuse while the family owes a housing authority money.`) +
      h.p(`${h.ext(C310, "You can evict a voucher tenant")} for nonpayment of the family's share, for serious or repeated lease violations, and for other good cause. It goes through the magistrate court like any eviction. Send the authority a copy of the notice.`) +
      h.cta("Buying a rental to hold long term?", "Tell us the budget and the bedroom count. We find houses that fit the payment standard and the inspection, and run the numbers before you offer.", "Start the search", "/contact/", bg) },
    { h2: "Which houses fit the program?", html:
      h.p(`Two facts point to bigger houses. The standard steps up with each bedroom, as the table above shows. Families with children hold the larger vouchers, because the voucher's bedroom count follows family size.`) +
      h.p(`One client's pattern, not a rule: the developer from Maryland buys houses that need work, because the inspection tests safety and function, not finishes. Any house that passes the inspection and the rent check can take a voucher.`) +
      h.p(`Check the house against the standard before you buy: heat, plumbing, electrical, windows, railings, smoke alarms, and the roof. Fixing those first costs less than a failed inspection and a lost month.`) },
  ],
  faqTitle: "Section 8 rental FAQ",
  faq: [
    { q: "Who pays the rent on a Section 8 rental?", a: "The housing authority pays its share by direct deposit each month, and the tenant pays the rest directly to you. The authority's share is the payment standard minus the tenant's share, or the rent minus the tenant's share if the rent is lower." },
    { q: "How much does Section 8 pay for a 3 bedroom in Horry County?", a: "The federal fair market rent for three bedrooms is $1,823 for fiscal year 2027. Each housing authority adopts a payment standard between 90 and 110 percent of it. Ask the authority for its current table. The tenant's share comes out of that number." },
    { q: "Is it hard to find a Section 8 tenant in Horry County?", a: "No. The two authorities hold 1,033 vouchers. The Conway waiting list is closed. The Myrtle Beach list last opened in 2022 for two days and drew 1,000 names by lottery. The gate is the inspection and the rent check, not the tenant." },
    { q: "Do I get the house approved before I find a tenant?", a: "No. The authority inspects for a specific family and a specific lease after you accept a voucher holder. There is no list of pre-approved houses." },
    { q: "Can I evict a Section 8 tenant?", a: "Yes, for nonpayment of the tenant's share, for serious or repeated lease violations, and for other good cause, through the court like any eviction. Send the housing authority a copy of the notice." },
    { q: "Does a tenant lose the voucher for damaging the house?", a: "The authority may end assistance for damage beyond ordinary wear, and it must end it if you evict the family through the court for a serious lease violation. It may refuse a new voucher for five years after such an eviction, and while the family owes a housing authority money." },
  ],
  sources: [
    { name: "24 CFR 982.503, payment standards", href: C503 },
    { name: "982.505, the lower-of rule", href: C505 },
    { name: "982.507, reasonable rent", href: C507 },
    { name: "982.508, the 40 percent cap", href: C508 },
    { name: "982.305, approval and timing", href: C305 },
    { name: "982.404, damage and maintenance", href: C404 },
    { name: "982.552, denial and termination", href: C552 },
    { name: "Housing Authority of Myrtle Beach", href: MBHA },
    { name: "City of Myrtle Beach, the 2022 voucher lottery", href: MBNEWS },
    { name: "Conway Housing Authority", href: CHA },
    { name: "HUD, fair market rents FY2027", href: FMR27 },
  ],
  sourcesNote: "Educational only, not legal advice. Payment standards change each year; confirm the current table with the authority.",
  bottomCta: { h2: "Talk to us before you buy a house for this strategy.", p: "One call. We find houses that fit the standard and the inspection, and run the numbers.", label: "Call a specialized agent", href: TEL },
  keywords: "Section 8 rentals Horry County, housing choice voucher landlord Myrtle Beach, Conway Housing Authority landlord, Section 8 payment standard Horry County, renting to voucher tenants South Carolina",
  about: "Renting to Housing Choice Voucher tenants in Horry County",
};
