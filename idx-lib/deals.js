/**
 * The deal finder (owners, 2026-10-29: "press a button and it finds the absolute best properties";
 * fix and flips first). For agents only: /homes/deals/, behind the DEALS_KEY password and a signed-up
 * account, because it reads sold homes (contract §5: sold data is for the registered tier only).
 *
 * It never puts a value on a house. An automated value (an AVM) is a separate MLS licence we do not
 * have; the CRM's comps follow the same rule (chapter3-crm src/lib/mls/comps.ts). So the page shows
 * the facts of the nearby sales, and the agent types the after-repair value. The math runs on that.
 *
 * Fix and flip, one press:
 *   1. Candidates: homes for sale that show a reason to be cheap: a distressed sale, a foreclosure,
 *      a short sale, or an older house at the low end of the market (a few CRM searches).
 *   2. Nearby sales: for each candidate, houses of about its size that sold within a mile (two if
 *      too few) in the last 12 months: how many, their price a square foot from low to high, and the
 *      middle one. Ranked by how far the asking price a square foot sits under that middle.
 *   3. Repairs: a first figure by the house's age and its distress, per square foot (the agent's own
 *      figures, editable on the page); the page then asks the AI to look at the photos of the best ones
 *      and replaces the figure with its estimate.
 *   4. The math, once the agent types the after-repair value: that value, less the price, repairs,
 *      buying and selling costs and the months held, is the profit; the 70 percent rule's highest offer
 *      beside it.
 * Nothing here is advice to a buyer: it is a list for an agent to check.
 */

import { listingPath } from "./render.js";
import { photoUrl } from "./photo.js";

export const FLIP_DEFAULTS = {
  maxPrice: 600000, minPrice: 50000,
  buyPct: 2, sellPct: 8, holdMonths: 6, holdPerMonth: 900,
  light: 15, medium: 35, heavy: 60, // repairs, dollars a square foot
};

const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);
const median = (a) => { const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : null; };
const miles = (a, b) => { const R = 3958.8, r = Math.PI / 180; return 2 * R * Math.asin(Math.sqrt(Math.sin((b.lat - a.lat) * r / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin((b.lng - a.lng) * r / 2) ** 2)); };

/** The owner's settings from the page, each kept inside a sane range. */
export function flipSettings(q) {
  const s = { ...FLIP_DEFAULTS };
  const take = (k, lo, hi) => { const v = Number(q.get(k)); if (q.has(k) && isFinite(v) && v >= lo && v <= hi) s[k] = v; };
  take("maxPrice", 20000, 10000000); take("minPrice", 0, 5000000);
  take("buyPct", 0, 10); take("sellPct", 0, 15); take("holdMonths", 1, 24); take("holdPerMonth", 0, 20000);
  take("light", 0, 300); take("medium", 0, 300); take("heavy", 0, 400);
  return s;
}

/** How much work a house likely needs, before anyone looks at its photos: light, medium or heavy. */
export function repairTier(l, why) {
  let p = 0;
  if (why.has("distressed") || why.has("foreclosure") || why.has("short sale")) p += 1;
  const y = num(l.yearBuilt);
  if (y && y < 1980) p += 1; else if (y && y < 1995) p += 0.5;
  return p >= 2 ? "heavy" : p >= 1 ? "medium" : "light";
}

/**
 * The facts of the nearby sales, never a value for the subject: how many sold, their price a square
 * foot from low to high and the middle one, and how far the subject's asking price a square foot sits
 * under that middle. Needs 3 sales of about the same size (within 30 percent).
 */
export function nearbySales(subject, comps) {
  const sq = num(subject.sqft), price = num(subject.listPrice);
  const usable = comps.filter((c) => num(c.soldPrice) > 0 && num(c.sqft) > 0 && c.mlsNumber !== subject.mlsNumber
    && (!sq || (c.sqft >= sq * 0.7 && c.sqft <= sq * 1.3)));
  if (!sq || !price || usable.length < 3) return { n: usable.length, comps: usable, under: null };
  const psf = usable.map((c) => c.soldPrice / c.sqft);
  const mid = median(psf), own = price / sq;
  return {
    n: usable.length, comps: usable, own: Math.round(own), low: Math.round(Math.min(...psf)), high: Math.round(Math.max(...psf)), mid: Math.round(mid),
    under: Math.round((1 - own / mid) * 100),
  };
}

/** The flip, in dollars, on the agent's own after-repair value. repairs: the AI's figure when there is one, else the tier's. */
export function flipMath(price, arv, repairs, s) {
  const buy = price * s.buyPct / 100, sell = arv * s.sellPct / 100, hold = s.holdMonths * s.holdPerMonth;
  const allIn = price + repairs + buy + sell + hold;
  const profit = arv - allIn;
  const cash = price + repairs + buy + hold;
  return { buy: Math.round(buy), sell: Math.round(sell), hold: Math.round(hold), allIn: Math.round(allIn), profit: Math.round(profit),
    roi: cash > 0 ? Math.round(profit / cash * 1000) / 10 : 0, maxOffer: Math.round((arv * 0.7 - repairs) / 1000) * 1000 };
}

/**
 * The whole first pass, server side. search(params) runs one CRM search with the agent's own
 * signed-up account and returns its listings (or []). points(listings) fills in map points.
 * Returns the candidates furthest under their nearby sales, with those sales, before the AI looks at the photos.
 */
export async function findFlips(search, points, s, today = new Date()) {
  const base = { status: "active", type: "house", min: String(s.minPrice), max: String(s.maxPrice), size: "48" };
  const asks = [
    ["distressed", { ...base, has: "distressed_sale" }],
    ["foreclosure", { ...base, has: "foreclosure" }],
    ["short sale", { ...base, has: "short_sale" }],
    ["older house", { ...base, yearMax: "1985", sort: "price_asc" }],
    ["older house", { ...base, yearMax: "1985", sort: "price_asc", page: "2" }],
    ["low price", { ...base, sort: "price_asc" }],
  ];
  const found = new Map();
  const lists = await Promise.all(asks.map(([, p]) => search(p).catch(() => [])));
  lists.forEach((ls, i) => {
    for (const l of ls) {
      if (!l || !l.mlsNumber || !num(l.listPrice) || !num(l.sqft) || l.sqft < 500 || !l.address) continue;
      const have = found.get(l.mlsNumber) || { l, why: new Set() };
      have.why.add(asks[i][0]); found.set(l.mlsNumber, have);
    }
  });
  let cands = [...found.values()];
  await points(cands.map((c) => c.l));
  cands = cands.filter((c) => c.l.point && num(c.l.point.lat));
  // Cheapest a square foot first: the likeliest to sit under their nearby sales. At most 60 get them.
  cands.sort((a, b) => a.l.listPrice / a.l.sqft - b.l.listPrice / b.l.sqft);
  cands = cands.slice(0, 60);
  const since = new Date(today.getTime() - 365 * 86400000).toISOString().slice(0, 10);
  const compsFor = async (l, mi) => {
    const p = { sold: "1", near: `${l.point.lat.toFixed(5)},${l.point.lng.toFixed(5)}`, miles: String(mi), type: "house", sqft: String(Math.round(l.sqft * 0.7)), size: "48", sort: "nearest" };
    if (num(l.beds)) p.beds = String(Math.max(1, l.beds - 1));
    const ls = await search(p).catch(() => []);
    return ls.filter((c) => c.soldOn && c.soldOn >= since);
  };
  const out = [];
  for (let i = 0; i < cands.length; i += 6) {
    await Promise.all(cands.slice(i, i + 6).map(async (c) => {
      let comps = await compsFor(c.l, 1);
      if (comps.length < 4) comps = comps.concat((await compsFor(c.l, 2)).filter((x) => !comps.some((y) => y.mlsNumber === x.mlsNumber)));
      const v = nearbySales(c.l, comps);
      if (v.under === null) return;
      const tier = repairTier(c.l, c.why);
      out.push({
        mls: String(c.l.mlsNumber), address: c.l.address, city: c.l.city || "", zip: c.l.postalCode || "", price: c.l.listPrice,
        beds: num(c.l.beds), baths: num(c.l.baths), sqft: c.l.sqft, year: num(c.l.yearBuilt), acres: num(c.l.lotAcres), dom: num(c.l.daysOnMarket),
        url: listingPath(c.l), photo: c.l.photo ? photoUrl(c.l.photo, "card") : null, firm: c.l.listingFirm || "", point: c.l.point, why: [...c.why],
        tier, repairs: Math.round(c.l.sqft * s[tier] / 500) * 500, repairsFrom: "your figures",
        n: v.n, own: v.own, low: v.low, high: v.high, mid: v.mid, under: v.under,
        comps: v.comps.sort((a, b) => miles(c.l.point, a.point || c.l.point) - miles(c.l.point, b.point || c.l.point)).slice(0, 6)
          .map((x) => ({ address: x.address || "address withheld", soldPrice: x.soldPrice, soldOn: x.soldOn, sqft: x.sqft, psf: Math.round(x.soldPrice / x.sqft), mi: x.point ? Math.round(miles(c.l.point, x.point) * 10) / 10 : null })),
      });
    }));
  }
  // An asking price a square foot more than 60 percent under the middle sale is more often a mistake
  // than a steal (a typo, an auction's opening bid, the wrong size): marked to check, ranked last.
  for (const d of out) d.check = d.under > 60 ? "The asking price a square foot is far under what houses like it sold for. Check the listing: it may be an auction's opening bid, a typo in the size, or a house that needs everything." : "";
  out.sort((a, b) => (a.check ? 1 : 0) - (b.check ? 1 : 0) || b.under - a.under);
  return { checked: found.size, compared: out.length, deals: out.slice(0, 25) };
}

/* The page's own script. It asks the server for the first pass, then asks the AI to look at the
   photos and description of the best 12 (the same repair check, and the same saved answers, as the
   rental analyzer), and ranks again. Nothing from the CRM is written with innerHTML. No backslash. */
export const DEALS_SCRIPT = `<script>(function(){
var app=document.getElementById("dl-app");if(!app)return;
var signed=document.body.getAttribute("data-hx-signed")==="1";
function $(id){return document.getElementById(id)}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function money(n){return n==null||isNaN(n)?"--":(n<0?"-$":"$")+Math.abs(Math.round(n)).toLocaleString("en-US")}
var FIELDS=["maxPrice","minPrice","buyPct","sellPct","holdMonths","holdPerMonth","light","medium","heavy"];
function load(k,d){try{return localStorage.getItem(k)||d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var keyBox=$("dl-key");keyBox.value=load("c3_deals_key","");
FIELDS.forEach(function(f){var b=$("dl-"+f);var v=load("c3_deals_"+f,"");if(b&&v)b.value=v;if(b)b.addEventListener("change",function(){save("c3_deals_"+f,b.value)})});
if(!signed)$("dl-signin").hidden=false;
function settings(){var o={};FIELDS.forEach(function(f){o[f]=Number($("dl-"+f).value)||0});return o}
/* The flip on the agent's own after-repair value (the page never makes one: no AVM licence). */
function math(d,arv,s){var buy=d.price*s.buyPct/100,sell=arv*s.sellPct/100,hold=s.holdMonths*s.holdPerMonth;var allIn=d.price+d.repairs+buy+sell+hold,cash=d.price+d.repairs+buy+hold;
 return{costs:Math.round(buy+sell+hold),allIn:Math.round(allIn),profit:Math.round(arv-allIn),roi:cash>0?Math.round((arv-allIn)/cash*1000)/10:0,maxOffer:Math.round((arv*0.7-d.repairs)/1000)*1000}}
function arvOf(d){return Number(load("c3_deals_arv_"+d.mls,""))||0}
var status=$("dl-status"),list=$("dl-list"),deals=[];
function say(t){status.textContent=t}
function row(k,v,strong){var r=el("div","dl-r"+(strong?" dl-r-s":""));r.appendChild(el("span",null,k));r.appendChild(el("b",null,v));return r}
function flipBox(d,box){while(box.firstChild)box.removeChild(box.firstChild);var arv=arvOf(d);
 if(!arv){box.appendChild(el("p","dl-small","Type your after-repair value to see the profit and the highest offer."));return}
 var m=math(d,arv,settings());box.appendChild(row("Buying, holding, selling",money(m.costs)));box.appendChild(row("All in",money(m.allIn)));
 box.appendChild(row("Profit",money(m.profit)+" · "+m.roi+"% on the cash in",m.profit>0));box.appendChild(row("Highest offer by the 70% rule",money(m.maxOffer),true))}
function draw(){while(list.firstChild)list.removeChild(list.firstChild);
 if(!deals.length){list.appendChild(el("p","dl-none","No home in your price range has enough nearby sales to compare right now. Widen the prices in Your figures, or run again later."));return}
 deals.forEach(function(d,i){var c=el("article","dl-c");
  var top=el("div","dl-top");var a=el("a","dl-photo");a.href=d.url;a.target="_blank";a.rel="noopener";if(d.photo){var im=el("img");im.src=d.photo;im.alt=d.address;im.loading="lazy";a.appendChild(im)}top.appendChild(a);
  var h=el("div","dl-h");h.appendChild(el("p","dl-rank","#"+(i+1)+" · "+d.why.join(", ")));var t=el("a","dl-addr",d.address+", "+d.city);t.href=d.url;t.target="_blank";t.rel="noopener";h.appendChild(t);
  h.appendChild(el("p","dl-facts",[d.beds!=null?d.beds+" bd":"",d.baths!=null?d.baths+" ba":"",d.sqft.toLocaleString("en-US")+" sq ft",d.year?"built "+d.year:"",d.acres?d.acres+" acres":"",d.dom!=null?d.dom+" days listed":""].filter(Boolean).join(" · ")));
  h.appendChild(el("p","dl-profit",d.under>0?d.under+"% under the middle nearby sale, a sq ft":"At or above the middle nearby sale, a sq ft"));top.appendChild(h);c.appendChild(top);
  var g=el("div","dl-grid");
  g.appendChild(row("Asking",money(d.price)+" · $"+d.own+" a sq ft"));g.appendChild(row(d.n+" nearby sales, a sq ft","$"+d.low+" to $"+d.high+" · middle $"+d.mid));
  g.appendChild(row("Repairs",money(d.repairs)+" · "+d.repairsFrom));c.appendChild(g);
  if(d.check)c.appendChild(el("p","dl-check",d.check));
  if(d.repairNote)c.appendChild(el("p","dl-note",d.repairNote));
  var det=el("details","dl-comps");det.appendChild(el("summary",null,"The "+d.comps.length+" nearest of those sales"));
  var tb=el("table");d.comps.forEach(function(x){var tr=el("tr");[x.address,money(x.soldPrice),x.soldOn,x.sqft.toLocaleString("en-US")+" sq ft","$"+x.psf+"/sq ft",x.mi!=null?x.mi+" mi":""].forEach(function(v){tr.appendChild(el("td",null,v))});tb.appendChild(tr)});det.appendChild(tb);c.appendChild(det);
  var lab=el("label","dl-in dl-arv");lab.appendChild(el("span",null,"Your after-repair value, from the sales"));var bx=el("span","dl-in-b");bx.appendChild(el("i",null,"$"));var inp=el("input");inp.type="number";inp.inputMode="numeric";inp.placeholder="Type it";var have=arvOf(d);if(have)inp.value=String(have);bx.appendChild(inp);lab.appendChild(bx);c.appendChild(lab);
  var fb=el("div","dl-grid dl-flipbox");c.appendChild(fb);flipBox(d,fb);
  inp.addEventListener("input",function(){save("c3_deals_arv_"+d.mls,String(Number(inp.value)||""));flipBox(d,fb)});
  var go=el("a","dl-go","Open it in the analyzer");go.href="/invest/long-term-rental/?mls="+encodeURIComponent(d.mls)+"&go=1";go.target="_blank";go.rel="noopener";c.appendChild(go);
  c.appendChild(el("p","dl-firm","MLS #"+d.mls+", listed by "+(d.firm||"the listing brokerage")+"."));
  list.appendChild(c)})}
/* The AI looks at the photos and the description of the best 12, as the rental analyzer does. */
function repairCheck(d){return fetch("/homes/api/lookup?mls="+encodeURIComponent(d.mls),{credentials:"same-origin"}).then(function(r){return r.json()}).then(function(j){
  var f=j&&j.found&&j.facts;if(!f)return null;var all=(f.photos||[]).filter(function(u){return u.indexOf("https://")===0});
  var pick=all.length<=4?all:[0,1,2,3].map(function(i){return all[Math.round(i*(all.length-1)/3)]});
  var full=[d.address,d.city,d.zip].filter(Boolean).join(", ");var notes=f.remarks?String(f.remarks).replace(/[ ]+/g," ").slice(0,700):"";
  var text="Repair check for "+full+(d.year?", built "+d.year:"")+", "+d.sqft+" sq ft. JSON only, start { end }. Look at the listing photos"+(notes?" and read the listing description":"")+". List only repairs you can SEE in a photo or READ in the description: damaged or dated roof, siding, windows, floors, kitchen, baths, ceilings with stains, missing fixtures, overgrown or damaged exterior, as is, needs TLC, investor special, handyman. Never guess at what you cannot see. A clean, updated home needs nothing: say so. "+(notes?"Description: "+notes+" ":"")+"Cost each item as a 2026 Myrtle Beach area contractor range in whole dollars. "+JSON.stringify({needsWork:true,items:[{item:"short plain name",seen:"photo",low:0,high:0}],summary:"one plain sentence on the home's condition"});
  var content=[{type:"text",text:text}].concat(pick.map(function(u){return{type:"image",source:{type:"url",url:u}}}));
  return fetch("https://api-proxy.chapter3realty.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-5-5",max_tokens:700,cache_key:["repair2",full,"mls"+d.mls+"-"+pick.length,""].join("|"),messages:[{role:"user",content:content}]})})
   .then(function(r){return r.json()}).then(function(x){var b=x&&x.content&&x.content.filter(function(k){return k.type==="text"}).pop();if(!b)return null;var t=b.text,i=t.indexOf("{"),z=t.lastIndexOf("}");var o=JSON.parse(t.slice(i,z+1));
    var items=(o.items||[]).filter(function(k){return k&&k.high>0});var lo=0,hi=0;items.forEach(function(k){lo+=k.low||0;hi+=k.high});
    return{needsWork:o.needsWork===true&&items.length>0,mid:Math.round((lo+hi)/2/500)*500,lo:lo,hi:hi,summary:o.summary||"",items:items}})}).catch(function(){return null})}
function run(){var key=keyBox.value.trim();if(!key){say("Type the deal finder password first.");keyBox.focus();return}save("c3_deals_key",key);
 var s=settings(),q=new URLSearchParams();FIELDS.forEach(function(f){q.set(f,String(s[f]))});q.set("kind","flip");
 $("dl-flip").disabled=true;say("Looking through every home for sale for a reason to be cheap, then at what houses like each one sold for nearby. About a minute...");
 fetch("/homes/api/deals?"+q.toString(),{credentials:"same-origin",headers:{"x-deals-key":key}}).then(function(r){return r.json().then(function(j){j._s=r.status;return j})}).then(function(j){
  if(!j||!j.ok){$("dl-flip").disabled=false;say(j&&j.error==="sign_in"?"Sign in to your account on the site first: the sold homes need it.":j&&j._s===404?"That password is not right.":"The search did not finish. Please try again in a minute.");return}
  deals=j.deals;draw();say("Checked "+j.checked+" homes; compared "+j.compared+" with nearby sales. Now the AI is looking at the photos of the first 12...");
  var top=deals.slice(0,12),done=0;
  function next(k){if(k>=top.length){draw();$("dl-flip").disabled=false;say("Done. Checked "+j.checked+" homes; compared "+j.compared+"; the AI looked at the photos of "+done+". Furthest under their nearby sales first.");return}
   var d=top[k];repairCheck(d).then(function(r){if(r){done++;if(r.needsWork){d.repairs=Math.max(r.mid,500);d.repairsFrom="the AI, from the photos";d.repairNote=r.summary+" About "+money(r.lo)+" to "+money(r.hi)+": "+r.items.map(function(x){return x.item}).join(", ")+"."}else{d.repairsFrom="your figures (the AI saw no work in the photos)";d.repairNote=r.summary}}
    draw();say("The AI has looked at "+(k+1)+" of "+top.length+"...");next(k+1)})}
  next(0)}).catch(function(){$("dl-flip").disabled=false;say("The search did not finish. Please try again in a minute.")})}
$("dl-flip").addEventListener("click",run);
FIELDS.forEach(function(f){var b=$("dl-"+f);if(b)b.addEventListener("input",function(){if(deals.length)draw()})});
})();</script>`;
