/**
 * The homes on a map: the 2D map page (/homes/map/, Google Maps, like Zillow's) and the
 * blue dots on the 3D map (/map/). Both read /homes/api/map, which runs one search from
 * validated filters and returns only what a pin needs.
 *
 * A home gets a pin only when the CRM sends its map point and its address. A home whose
 * seller withheld the address never gets a pin (CCMLS 16.5, contract §6). The public card
 * carries no point yet (REQUEST FOR THE CRM, batches/2026-10-b/IDX-STUDY.md, request 2):
 * until it does, the map page shows the list and says the pins are coming.
 */
import { photoUrl } from "./photo.js";
import { acres, addressLine, cardTag, headlinePrice, listingPath, safeUrl, statusWord } from "./render.js";

/** The Google Maps browser key: a public key, locked to our domain in Google Cloud. A setting can replace it. */
export const mapsKey = (env) => (/^AIza[0-9A-Za-z_-]{35}$/.test(env.MAPS_BROWSER_KEY || "") ? env.MAPS_BROWSER_KEY : "AIzaSyAFTNMGh-PmVFTl3S0ViiM9zNYicFrgGfs");

/** "$425K", "$1.2M": the short price on a map pin. */
export function shortPrice(l) {
  const n = l.status === "Closed" ? l.soldPrice : l.listPrice;
  if (typeof n !== "number" || !isFinite(n)) return "";
  if (n >= 1e6) return `$${(Math.round(n / 1e5) / 10).toString().replace(/\.0$/, "")}M`;
  return `$${Math.round(n / 1000)}K`;
}

const num = (n) => (typeof n === "number" && isFinite(n) ? n : null);

/** One pin: only plain values. The browser builds every element with textContent. */
export function pinOf(l) {
  const pt = l.point || {};
  const lat = num(pt.lat), lng = num(pt.lng);
  if (!l.address || lat === null || lng === null || lat < 31 || lat > 37 || lng < -82 || lng > -75) return null;
  return {
    mls: String(l.mlsNumber || ""), url: listingPath(l), lat, lng,
    price: headlinePrice(l), short: shortPrice(l), photo: photoUrl(safeUrl(l.photo), "card"),
    beds: num(l.beds), baths: num(l.baths), sqft: num(l.sqft), acres: acres(l.lotAcres), status: statusWord(l.status), tag: cardTag(l),
    addr: `${addressLine(l)}${l.postalCode ? `, ${l.postalCode}` : ""}`, firm: String(l.listingFirm || "listing brokerage"),
  };
}

/**
 * Until the CRM puts the map point on the public card (its branch website/public-map-points),
 * a home with an address is placed from the US Census geocoder: free, public, no key. Each
 * answer is kept 30 days. A withheld address is never looked up (CCMLS 16.5).
 */
const CENSUS = "https://geocoding.geo.census.gov/geocoder/locations/onelineaddress";
export async function geocode(l) {
  if (!l || !l.address || !l.city) return null;
  const line = `${l.address}, ${l.city}, ${l.state || "SC"}${l.postalCode ? ` ${l.postalCode}` : ""}`;
  const url = `${CENSUS}?address=${encodeURIComponent(line)}&benchmark=Public_AR_Current&format=json`;
  const cache = typeof caches !== "undefined" ? caches.default : null;
  const key = cache ? new Request(`https://chapter3realty.com/__geo-cache/${encodeURIComponent(line.toLowerCase())}`) : null;
  try {
    if (key) { const hit = await cache.match(key); if (hit) { const j = await hit.json(); return j && typeof j.lat === "number" ? j : null; } }
    const r = await fetch(url, { signal: AbortSignal.timeout(2500) });
    const j = await r.json();
    const m = j && j.result && Array.isArray(j.result.addressMatches) ? j.result.addressMatches[0] : null;
    const pt = m && m.coordinates && typeof m.coordinates.y === "number" ? { lat: m.coordinates.y, lng: m.coordinates.x } : null;
    const ok = pt && pt.lat >= 31 && pt.lat <= 37 && pt.lng >= -82 && pt.lng <= -75 ? pt : null;
    if (key) await cache.put(key, new Response(JSON.stringify(ok || {}), { headers: { "content-type": "application/json", "cache-control": `public, max-age=${ok ? 2592000 : 86400}` } }));
    return ok;
  } catch { return null; }
}

/**
 * Fill in missing map points, all homes in one call to the Census batch geocoder. Cloudflare
 * allows 50 outside calls per request, and one call per home (with its cache read and write)
 * passed that and broke the map page (2026-10-25). This makes at most three: a cache read,
 * the geocoder, a cache write. A home that is not found, or a slow geocoder, leaves no pin.
 */
const BATCH = "https://geocoding.geo.census.gov/geocoder/locations/addressbatch";
const csvField = (v) => `"${String(v ?? "").replace(/[\r\n]+/g, " ").replace(/"/g, "'")}"`;
export async function withPoints(listings, budgetMs = 4000, max = 144) {
  const need = listings.filter((l) => l && !l.point && l.address && l.city).slice(0, max);
  if (!need.length) return listings;
  const csv = need.map((l, i) => [i, l.address, l.city, l.state || "SC", l.postalCode || ""].map(csvField).join(",")).join("\n");
  const cache = typeof caches !== "undefined" ? caches.default : null;
  try {
    let text = null, key = null;
    if (cache) {
      const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(csv)))].map((b) => b.toString(16).padStart(2, "0")).join("");
      key = new Request(`https://chapter3realty.com/__geo-batch/${hash}`);
      const hit = await cache.match(key);
      if (hit) text = await hit.text();
    }
    if (text === null) {
      const form = new FormData();
      form.append("addressFile", new Blob([csv], { type: "text/csv" }), "homes.csv");
      form.append("benchmark", "Public_AR_Current");
      const r = await fetch(BATCH, { method: "POST", body: form, signal: AbortSignal.timeout(budgetMs) });
      if (!r.ok) return listings;
      text = await r.text();
      if (key) await cache.put(key, new Response(text, { headers: { "content-type": "text/csv", "cache-control": "public, max-age=86400" } }));
    }
    // "id","input","Match","Exact","matched address","lng,lat","tiger id","side"
    for (const line of text.split("\n")) {
      const f = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
      if (f[2] !== "Match") continue;
      const l = need[Number(f[0])];
      const [lng, lat] = String(f[5] || "").split(",").map(Number);
      if (l && !l.point && lat >= 31 && lat <= 37 && lng >= -82 && lng <= -75) l.point = { lat, lng };
    }
  } catch { /* no pins this time; the list still shows every home */ }
  return listings;
}

/** A validated map point and radius from "lat,lng" and miles, or null. */
export function nearOf(near, miles) {
  const m = /^(-?\d+(?:\.\d+)?),\s?(-?\d+(?:\.\d+)?)$/.exec(String(near || ""));
  if (!m) return null;
  const lat = +m[1], lng = +m[2];
  if (lat < 31 || lat > 37 || lng < -82 || lng > -75) return null;
  const mi = Math.min(25, Math.max(0.1, Number(miles) || 1));
  return { near: `${lat.toFixed(6)},${lng.toFixed(6)}`, miles: String(Math.round(mi * 10) / 10) };
}

export const MAP_STYLE = `<style>
/* The map page fills the screen under our header (owner, 2026-10-28): no footer to scroll into. */
html.hx-fit,html.hx-fit body,body:has(.hx-mapapp){overflow:hidden}
#hx-root[data-wide]{max-width:none!important;width:100%!important;padding:0!important;margin:0!important}
.hx-mapapp{position:fixed;left:0;right:0;bottom:0;top:7.5rem;z-index:20;display:flex;flex-direction:column;background:#fff}
.hx-mtop{flex:none;padding:.6rem 1rem .45rem;border-bottom:1px solid rgba(28,32,40,.1);background:#fff;position:relative;z-index:30}
.hx-mtop .hx-fb{margin:0;flex-wrap:nowrap;align-items:flex-end}.hx-mtop .hx-fb-ai{flex:1 1 30rem;min-width:0}.hx-mtop .hx-fb-q{min-height:2.9rem}.hx-mtop .hx-fb-pills{flex-wrap:nowrap}
.hx-mchips{display:flex;flex-wrap:wrap;gap:.35rem;margin:.45rem 0 0}.hx-mchips[hidden]{display:none}
.hx-ai-note{margin:.35rem 0 0;font-size:.82rem;color:var(--slate,#5c6b78)}.hx-ai-note.hx-ai-on{margin:.5rem 0 .2rem;padding:.55rem .8rem;border-radius:12px;background:rgba(196,120,58,.08);border-left:3px solid #c4783a;font-size:.9rem;color:var(--ink,#1c2028)}.hx-ai-note[hidden]{display:none}
.hx-map-body{position:relative;flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) min(50vw,720px)}
.hx-mapbox{position:relative;min-height:0;background:#e9e5dc}
/* The map is its own layer, so Google's tiles never cover the buttons on top of it. */
.hx-map{position:absolute;inset:0;z-index:0}
.hx-map-list{overflow:auto;min-height:0;padding:.9rem 1rem 0;background:#fff;border-left:1px solid rgba(28,32,40,.1)}
.hx-list-h h1{font-family:var(--serif,Georgia,serif)!important;font-size:1.3rem!important;line-height:1.2!important;margin:0 0 .15rem!important}
.hx-map-count{margin:0 0 .8rem;font-size:.9rem;color:var(--slate,#5c6b78)}.hx-map-count b{font-weight:800;color:var(--ink,#1c2028)}
.hx-map-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem}
.hx-map-cards .hx-c{position:relative}
.hx-map-cards .hx-hot{outline:3px solid #1a73e8;outline-offset:2px;border-radius:14px}
.hx-list-more{margin:1rem 0 0;font-size:.88rem;color:var(--slate,#5c6b78);text-align:center}.hx-list-more[hidden]{display:none}
.hx-list-foot{margin:1.2rem -1rem 0;padding:.9rem 1rem 1.2rem;background:#faf8f4;border-top:1px solid rgba(28,32,40,.08)}
.hx-list-foot .hx-disclaimer{margin:0}
.hx-map-hint{position:absolute;left:.8rem;bottom:.8rem;z-index:4;margin:0;padding:.35rem .75rem;border-radius:999px;background:rgba(255,255,255,.92);box-shadow:0 2px 10px rgba(0,0,0,.15);font-size:.82rem;font-weight:600;color:#1c2028;pointer-events:none}
.hx-map-note{position:absolute;left:1rem;right:1rem;bottom:1rem;z-index:5;max-width:30rem;margin:0 auto;padding:.8rem 1rem;border-radius:14px;background:rgba(255,255,255,.95);box-shadow:0 8px 24px rgba(28,32,40,.18);font-size:.9rem;text-align:center}
.hx-map-note[hidden]{display:none}
.hx-map-toggle{display:none}
.hx-mode{position:absolute;top:.8rem;right:.8rem;z-index:10;display:flex;padding:3px;border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 6px 20px rgba(28,32,40,.2)}
.hx-mode button{border:0;background:none;font:inherit;font-weight:700;font-size:.88rem;padding:.45rem .95rem;border-radius:999px;cursor:pointer;color:#1c2028}
.hx-mode button[aria-pressed="true"]{background:#1c2028;color:#fff}
.hx-full-b{position:absolute;top:3.9rem;right:.8rem;z-index:10;display:inline-flex;align-items:center;gap:.4rem;border:0;border-radius:999px;background:rgba(255,255,255,.96);box-shadow:0 6px 20px rgba(28,32,40,.2);font:inherit;font-weight:700;font-size:.85rem;padding:.5rem .9rem;cursor:pointer;color:#1c2028}
.hx-full-b svg{width:16px;height:16px;fill:none;stroke:currentColor;stroke-width:2}
.hx-map-body.hx-full{grid-template-columns:1fr}.hx-map-body.hx-full .hx-map-list{display:none}
.hx-mapapp:fullscreen{top:0!important}
.hx-map3d{position:absolute;inset:0;z-index:3;background:#1c2028}.hx-map3d[hidden]{display:none}.hx-map3d gmp-map-3d{width:100%;height:100%;display:block}
.hx-map3d-off{display:flex;align-items:center;justify-content:center;color:#f4efe8;padding:2rem;text-align:center}
.hx-mpop{position:absolute;left:50%;bottom:1rem;transform:translateX(-50%);z-index:11;width:min(23rem,calc(100% - 2rem));border-radius:16px;background:#fff;box-shadow:0 14px 40px rgba(28,32,40,.32)}
main#main .hx-mpop .hx-c{margin:0;box-shadow:none;border-radius:16px 16px 0 0;transform:none}main#main .hx-mpop .hx-c-link{display:grid;grid-template-columns:8.5rem minmax(0,1fr)}
main#main .hx-mpop .hx-c-photo{aspect-ratio:auto;height:100%;min-height:7.5rem}
main#main .hx-mpop .hx-c-body{padding:.6rem .8rem;padding-right:2.4rem}main#main .hx-mpop .hx-c-price{font-size:1.15rem}main#main .hx-mpop .hx-c-facts{font-size:.85rem}main#main .hx-mpop .hx-c-addr{font-size:.85rem}main#main .hx-mpop .hx-c-firm{font-size:.72rem}main#main .hx-mpop .hx-c-tag{display:none}
.hx-mpop .hx-heart{display:none}
.hx-mpop.hx-mpop-top{bottom:auto;top:4rem}
.hx-mpop-x{position:absolute;top:.35rem;right:.35rem;z-index:2;width:2rem;height:2rem;border:0;border-radius:999px;background:rgba(255,255,255,.95);font-size:1.25rem;line-height:1;cursor:pointer}
.hx-mpop-go{display:block;margin:0;padding:.45rem .8rem .6rem;font-size:.8rem;color:var(--slate,#5c6b78);text-align:center;border-top:1px solid rgba(28,32,40,.08)}
.hx-list-sent{height:1px}
@media (max-width:1100px){.hx-map-body{grid-template-columns:minmax(0,1fr) min(46vw,420px)}.hx-map-cards{grid-template-columns:1fr}}
@media (max-width:899px){.hx-mtop{padding:.5rem .75rem .4rem}.hx-mtop .hx-fb{flex-wrap:wrap}.hx-mtop .hx-fb-ai{flex:1 1 100%}.hx-mtop .hx-fb-pills{flex-wrap:wrap}
 .hx-map-body{grid-template-columns:1fr}
 .hx-map-list{position:absolute;inset:0;z-index:8;border:0;display:none}.hx-map-cards{grid-template-columns:1fr}
 .hx-map-body.hx-show-list .hx-map-list{display:block}
 .hx-map-toggle{display:inline-flex;align-items:center;gap:.4rem;position:absolute;left:50%;transform:translateX(-50%);bottom:1rem;z-index:9;border:0;border-radius:999px;background:#1c2028;color:#fff;font:inherit;font-weight:700;padding:.75rem 1.4rem;box-shadow:0 8px 24px rgba(28,32,40,.35);cursor:pointer}
 .hx-mpop{bottom:4.6rem}.hx-full-b{display:none}.hx-mpop.hx-mpop-top{bottom:auto;top:3.6rem}}
</style>`;

/**
 * The map page (owner, 2026-10-28, Zillow's): a click on a blue dot shows the home, a second click
 * opens it; the list shows only the homes with a dot in view, and moving the map searches there; 3D
 * keeps the dots and the list. A search from the bar runs here without leaving the page. Words the
 * search box cannot read go to the AI once (cached per sentence), and come back as filters the
 * reader can see and remove. Nothing from the CRM is written with innerHTML. No backslash here.
 */
export const MAP_SCRIPT = `<script>(function(){
var app=document.querySelector("[data-hx-map]");if(!app)return;
document.documentElement.classList.add("hx-fit");
function fitTop(){var h=document.querySelector("header");app.style.top=(h?Math.max(0,Math.round(h.getBoundingClientRect().bottom)):0)+"px"}
fitTop();addEventListener("resize",fitTop);setTimeout(fitTop,400);
var key=app.getAttribute("data-key"),state=new URLSearchParams(app.getAttribute("data-params")||""),all=[],total=+app.getAttribute("data-total")||0,hearts={};
try{all=JSON.parse(document.getElementById("hx-pins").textContent)||[]}catch(e){}
try{JSON.parse(app.getAttribute("data-hearts")||"[]").forEach(function(m){hearts[m]=1})}catch(e){}
var list=document.getElementById("hx-map-cards"),count=document.getElementById("hx-map-count"),more=document.getElementById("hx-list-more"),note=document.getElementById("hx-map-note"),body=app.querySelector(".hx-map-body"),tg=document.getElementById("hx-map-toggle"),chipsBox=document.getElementById("hx-chips"),aiNote=document.getElementById("hx-ai-note"),form=app.querySelector("form[data-hx-map-fb]");
var phone=window.matchMedia?matchMedia("(max-width: 899px)"):{matches:false};
function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e}
var NS="http://www.w3.org/2000/svg";
function heart(p){var b=el("button","hx-heart hx-heart-sm");b.type="button";b.setAttribute("data-mls",p.mls);b.setAttribute("aria-pressed",hearts[p.mls]?"true":"false");b.setAttribute("aria-label","Save "+p.addr);
 var s=document.createElementNS(NS,"svg");s.setAttribute("viewBox","0 0 24 24");s.setAttribute("width","22");s.setAttribute("height","22");s.setAttribute("aria-hidden","true");var pa=document.createElementNS(NS,"path");pa.setAttribute("d","M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z");s.appendChild(pa);b.appendChild(s);return b}
function card(p,withHeart){var a=el("article","hx-c"),l=el("a","hx-c-link");l.href=p.url;l.setAttribute("draggable","false");a.setAttribute("data-mls",p.mls);
 var ph=el("span","hx-c-photo");if(p.photo&&(p.photo.indexOf("https://")===0||p.photo.indexOf("/homes/p/")===0)){var im=el("img");im.src=p.photo;im.alt=p.addr;im.loading="lazy";im.referrerPolicy="no-referrer";im.width=480;im.height=300;ph.appendChild(im)}else ph.appendChild(el("span","hx-nophoto","No photo yet"));
 if(p.tag)ph.appendChild(el("span","hx-c-tag",p.tag));l.appendChild(ph);var b=el("span","hx-c-body");b.appendChild(el("span","hx-c-price",p.price));
 var f=el("span","hx-c-facts"),bits=[];if(p.beds!=null)bits.push([p.beds," bds"]);if(p.baths!=null)bits.push([p.baths," ba"]);if(p.sqft!=null)bits.push([p.sqft.toLocaleString("en-US")," sqft"]);if(p.acres)bits.push([p.acres,p.acres==="1"?" acre":" acres"]);
 bits.forEach(function(x,i){if(i)f.appendChild(el("i"));f.appendChild(el("b",null,String(x[0])));f.appendChild(document.createTextNode(x[1]))});if(p.status){if(bits.length)f.appendChild(el("i"));f.appendChild(document.createTextNode(p.status))}
 b.appendChild(f);b.appendChild(el("span","hx-c-addr",p.addr));b.appendChild(el("span","hx-c-firm","MLS #"+p.mls+", "+p.firm+". Listing provided by CCMLS."));l.appendChild(b);a.appendChild(l);if(withHeart)a.appendChild(heart(p));return a}
/* The list draws 24 homes, and 24 more as the reader nears the end: fewer photos asked for at once. */
var shown=[],drawn=0,sent=null,io=null;
function more24(){shown.slice(drawn,drawn+24).forEach(function(p){list.appendChild(card(p,true))});drawn=Math.min(shown.length,drawn+24);if(sent)list.appendChild(sent)}
if(window.IntersectionObserver){sent=el("div","hx-list-sent");io=new IntersectionObserver(function(es){if(es[0].isIntersecting&&drawn<shown.length)more24()},{root:document.getElementById("hx-map-list"),rootMargin:"600px"});io.observe(sent)}
function render(ps){while(list.firstChild)list.removeChild(list.firstChild);shown=ps;drawn=0;more24();if(!io){while(drawn<shown.length&&drawn<120)more24()}
 count.textContent="";count.appendChild(el("b",null,ps.length.toLocaleString("en-US")));count.appendChild(document.createTextNode(ps.length===1?" home in this area":" homes in this area"));
 if(total>ps.length){count.appendChild(document.createTextNode(", of "+total.toLocaleString("en-US")+" that match"))}
 more.hidden=!(total>all.length);if(!more.hidden)more.textContent="Zoom in or move the map to see more of the "+total.toLocaleString("en-US")+" homes."}
/* The list and the map on a phone, like Zillow's app: the list first, a Map button. */
/* Full-size map (owner, 2026-10-28): the list steps aside and the map fills the screen; again to come back. */
var fb=document.getElementById("hx-full-b");
function full(on){body.classList.toggle("hx-full",on);if(fb){fb.lastChild.textContent=on?"Show the list":"Full map";fb.setAttribute("aria-pressed",String(on))}
 if(map)setTimeout(function(){google.maps.event.trigger(map,"resize");listView()},60)}
if(fb)fb.addEventListener("click",function(){var on=!body.classList.contains("hx-full");full(on);
 try{if(on&&app.requestFullscreen&&!document.fullscreenElement)app.requestFullscreen().catch(function(){});else if(!on&&document.fullscreenElement)document.exitFullscreen()}catch(e){}});
document.addEventListener("fullscreenchange",function(){if(!document.fullscreenElement&&body.classList.contains("hx-full"))full(false)});
if(tg)tg.addEventListener("click",function(){var showList=!body.classList.contains("hx-show-list");body.classList.toggle("hx-show-list",showList);tg.textContent=showList?"Map":"List";if(!showList&&map)google.maps.event.trigger(map,"resize")});
/* Chips: each removes itself; Clear all starts over. */
function drawChips(cs){while(chipsBox.firstChild)chipsBox.removeChild(chipsBox.firstChild);(cs||[]).forEach(function(c){var a=el("a","hx-applied-chip",c.t);a.href="/homes/map/"+(c.x?"?"+c.x:"");a.setAttribute("data-x",c.x);a.appendChild(el("span",null," ×"));chipsBox.appendChild(a)});
 var cl=el("a","hx-clear","Clear all");cl.href="/homes/map/";cl.setAttribute("data-x","");chipsBox.appendChild(cl);chipsBox.hidden=!(cs&&cs.length)}
chipsBox.addEventListener("click",function(e){var a=e.target.closest&&e.target.closest("[data-x]");if(!a)return;e.preventDefault();aiNote.hidden=true;search(new URLSearchParams(a.getAttribute("data-x")),{fit:true})});
/* The bar shows the search in force after every search, including what a sentence or the AI added. */
var NAMES={sale:"For sale",price:"Price",beds:"Beds & baths",type:"Home type",more:"Filters"};
function pills(L){if(!form||!L)return;Array.prototype.forEach.call(form.querySelectorAll("details.hx-pop"),function(d){var k=d.getAttribute("data-k");if(!(k in L))return;d.querySelector("summary span").textContent=L[k]||NAMES[k];d.classList.toggle("hx-on",!!L[k])})}
function syncForm(p){if(!form)return;var has=(p.get("has")||"").split(",").filter(Boolean),hoa=p.get("hoa")==="0"?"0":(p.get("hoaMax")||"");
 Array.prototype.forEach.call(form.elements,function(x){if(!x.name)return;
  if(x.name==="q"){x.value="";return}
  if(x.type==="radio"){x.checked=x.value===(p.get(x.name)||"");return}
  if(x.type==="checkbox"){x.checked=x.name==="has"?has.indexOf(x.value)>=0:p.get(x.name)===x.value;return}
  if(x.tagName==="SELECT"){var v=x.name==="hoaPick"?hoa:(p.get(x.name)||"");if(v&&!Array.prototype.some.call(x.options,function(o){return o.value===v})){var o=el("option",null,v);o.value=v;x.appendChild(o)}x.value=v;return}});
 Array.prototype.forEach.call(form.querySelectorAll("input[type=hidden]"),function(x){if(x.hasAttribute("data-hx-commute-out")){var keep=x.value.split(",").filter(function(k){return has.indexOf(k)>=0});x.value=keep.join(",");if(!keep.length)Array.prototype.forEach.call(form.querySelectorAll("[data-lm]"),function(s){s.value=""});return}x.remove()});
 var shown={};Array.prototype.forEach.call(form.querySelectorAll("input[name=has]"),function(x){if(x.type==="checkbox"&&x.checked)shown[x.value]=1;if(x.type==="hidden")x.value.split(",").forEach(function(k){if(k)shown[k]=1})});
 var rest=has.filter(function(k){return !shown[k]});
 ["city","subdivision","near","miles","zip","sort","yearMax","not"].forEach(function(n){if(p.get(n)){var h=el("input");h.type="hidden";h.name=n;h.value=p.get(n);form.appendChild(h)}});
 if(rest.length){var h=el("input");h.type="hidden";h.name="has";h.value=rest.join(",");form.appendChild(h)}}
var map=null,marks=[],pop=null,popFor=null,hot=null,user=false,timer=0,seq=0,map3=null,box3=null,marks3=[],L3=null,Pin3=null;
function in3d(){return !!(map3&&box3&&!box3.hidden)}
function miles(a,b,c,d){var R=3958.8,r=Math.PI/180;return 2*R*Math.asin(Math.sqrt(Math.pow(Math.sin((c-a)*r/2),2)+Math.cos(a*r)*Math.cos(c*r)*Math.pow(Math.sin((d-b)*r/2),2)))}
/* In 3D the view is a circle around the camera's center: about 0.7 of its distance, in miles. */
function view3(){var c=map3.center||{};return{lat:c.lat,lng:c.lng,mi:Math.max(0.3,Math.min(25,(map3.range||5000)*0.7/1609))}}
function inView(p){if(in3d()){var v=view3();return v.lat==null||miles(v.lat,v.lng,p.lat,p.lng)<=v.mi}if(!map||!map.getBounds())return true;return map.getBounds().contains({lat:p.lat,lng:p.lng})}
var searched=false;
function listView(){if(!all.length&&!searched)return;render(all.filter(inView));if(hot)hilite(hot)}
function msg(j){return j&&j.error==="stale"?"The listing search is being refreshed. Please try again in a few minutes.":"Please try again in a minute."}
function search(p,o){o=o||{};state=new URLSearchParams(p);var n=++seq;count.textContent="Searching...";
 return fetch("/homes/api/map?"+state.toString(),{credentials:"same-origin"}).then(function(r){return r.json()}).then(function(j){if(n!==seq)return;
  if(!j||!j.ok){count.textContent=msg(j);return}
  searched=true;all=j.pins||[];total=j.total||0;state=new URLSearchParams(j.params||"");
  try{history.replaceState(null,"","/homes/map/"+(state.toString()?"?"+state.toString():""))}catch(e){}
  drawChips(j.chips);pills(j.labels);syncForm(state);
  var h1=app.querySelector(".hx-list-h h1");if(h1)h1.textContent="Homes for sale"+(state.get("city")?" in "+state.get("city"):state.get("subdivision")?" in "+state.get("subdivision"):state.get("near")?" in this area":" on the Grand Strand");
  if(popFor){closePop()}
  if(!o.ring)clearRing();
  draw(o.fit!==false);listView();
  if(o.ai!==false&&wantsAi(j.q,j.left))ai(j.q,j.left)}).catch(function(){if(n===seq)count.textContent="Please try again in a minute."})}
document.addEventListener("hx-search",function(e){aiNote.hidden=true;search(e.detail,{fit:true})});
/* Words the rules could not read: the AI picks filters from the CRM's own list, once per sentence. */
var ALLOW=["min","max","beds","baths","type","city","sqft","yearMin","yearMax","lotMin","hoaMax","garage","hoa"];
/* The AI reads the whole sentence when it is more than a few words, or has words the rules could not read:
   what the buyer wants, and why (their goal: rental income, a boat, retiring, work, a flip), and turns it
   into filters from the CRM's own list (owner, 2026-10-29). It says in one line what it understood. It never
   filters on who a person is (fair housing). The answer for one sentence is saved (cache_key). */
function wantsAi(q,left){return!!(q&&(left||String(q).trim().split(/ +/).length>=5))}
function ai(q,left){if(!q||!window.hxFeats)return;aiNote.hidden=false;aiNote.classList.add("hx-ai-on");aiNote.textContent="AI is reading what you want and why...";
 window.hxFeats().then(function(j){if(!j||!j.ok||!j.groups){aiNote.hidden=true;return}var keys=[],names={};j.groups.forEach(function(g){g.items.forEach(function(it){keys.push(it.k);names[it.k]=it.l})});
  var prompt="You are the home search for Chapter3 Realty on the Grand Strand, South Carolina. A buyer wrote: "+JSON.stringify(q)+". "+
   "Filters already set from their words: "+JSON.stringify(state.toString())+". Words the simple reader could not use: "+JSON.stringify(left||"")+". "+
   "Read what they want AND why they want it, and choose the filters that find the right homes for that goal. Examples of goals: rental income by the night means homes where short-term rentals are allowed; renting to tenants means long-term rentals allowed; a boat means a private dock, waterfront or a boat ramp nearby; retiring or no stairs means one level; golf means a golf community; the beach every day means walk to the beach; a job or a hospital means the nearest place key ending in _10mi; a flip or fixer means a distressed sale or an older house (yearMax 1999); room to spread out means a bigger lot; a tight budget means a max price. "+
   "Never filter on who a person is or who lives nearby: age, children or family, race, religion, disability, sex, origin. Use their numbers when they give them. Leave out anything you are not sure of. JSON only, start { end }. "+
   "Keys you may use: has (feature keys from this list only, at most 4, at most 2 ending in mi), min, max (dollars), beds, baths, type (house|condo|townhouse|multi|land|manufactured), city (Myrtle Beach|North Myrtle Beach|Surfside Beach|Garden City|Murrells Inlet|Pawleys Island|Little River|Conway|Longs|Loris|Aynor|Calabash), sqft, yearMin, yearMax, lotMin (acres), hoaMax, garage, hoa (0 for no HOA). "+
   "Feature keys: "+keys.join(",")+". Answer like "+JSON.stringify({has:[],why:"Looking for ... because you want ...: one plain sentence, under 25 words, about the homes and the goal, never about the person"})+".";
  return fetch("https://api-proxy.chapter3realty.workers.dev",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-haiku-5-5",max_tokens:350,cache_key:["search2",q,state.toString()].join("|"),messages:[{role:"user",content:prompt}]})})
   .then(function(r){return r.json()}).then(function(d){var t=d&&d.content&&d.content.filter(function(b){return b.type==="text"}).pop();if(!t){aiNote.hidden=true;return}
    var a=t.text.indexOf("{"),z=t.text.lastIndexOf("}");var o=JSON.parse(t.text.slice(a,z+1));var p=new URLSearchParams(state),added=0;
    var has=(p.get("has")||"").split(",").filter(Boolean),dist=has.filter(function(k){return/mi$/.test(k)}).length;
    (Array.isArray(o.has)?o.has:[]).slice(0,4).forEach(function(k){if(!names[k]||has.indexOf(k)>=0)return;if(/mi$/.test(k)){if(dist>=2)return;dist++}has.push(k);added++});if(has.length)p.set("has",has.join(","));
    ALLOW.forEach(function(k){if(o[k]!=null&&o[k]!==""&&!p.get(k)){p.set(k,String(o[k]));added++}});
    var why=o.why?String(o.why).replace(/[<>]/g,"").slice(0,180):"";
    if(!added){aiNote.textContent=why?"AI: "+why+" The filters above already match.":"We searched what we could read. Add a detail, or use the filters.";return}
    aiNote.textContent="AI: "+(why?why+" ":"")+"Remove any filter you do not want.";
    search(p,{fit:true,ai:false})})}).catch(function(){aiNote.hidden=true})}
function hilite(mls){hot=mls;marks.forEach(function(m){style(m,m.p.mls===mls)});marks3.forEach(function(m){if(m.pin)try{m.pin.background=m.p.mls===mls?"#c4783a":"#1a73e8"}catch(x){}});Array.prototype.forEach.call(list.children,function(c){c.classList.toggle("hx-hot",c.getAttribute("data-mls")===mls)})}
function closePop(){if(pop)pop.remove();pop=null;popFor=null}
/* The first click on a dot shows the home; a second click on the same dot opens it. */
function tap(p){if(popFor===p.mls){location.href=p.url;return}
 closePop();pop=el("div","hx-mpop");var x=el("button","hx-mpop-x","×");x.type="button";x.setAttribute("aria-label","Close");x.addEventListener("click",closePop);pop.appendChild(x);
 pop.appendChild(card(p,false));pop.appendChild(el("p","hx-mpop-go","Click the dot again, or the card, to open it."));
 /* The card never covers its own dot: a dot low on the map gets the card at the top. */
 var bd=map&&map.getBounds();if(bd){var ne=bd.getNorthEast(),sw=bd.getSouthWest();if((ne.lat()-p.lat)/((ne.lat()-sw.lat())||1)>0.5)pop.classList.add("hx-mpop-top")}
 document.getElementById("hx-mapbox").appendChild(pop);popFor=p.mls;hilite(p.mls);
 if(!phone.matches){var c=list.querySelector("[data-mls='"+p.mls+"']");if(c)c.scrollIntoView({behavior:"smooth",block:"nearest"})}}
/* A home the visitor points at, in the list or on the map, turns Chapter3 brass (owner, 2026-10-29). */
function dot(on){return{path:google.maps.SymbolPath.CIRCLE,scale:on?10:6.5,fillColor:on?"#c4783a":"#1a73e8",fillOpacity:1,strokeColor:"#fff",strokeWeight:2}}
function pill(p,on){var w=Math.max(46,p.short.length*8+16);var svg="<svg xmlns='http://www.w3.org/2000/svg' width='"+w+"' height='26'><rect x='1' y='1' width='"+(w-2)+"' height='24' rx='12' fill='"+(on?"#c4783a":"#1a73e8")+"' stroke='#fff' stroke-width='2'/></svg>";
 return{url:"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg),scaledSize:new google.maps.Size(w,26),anchor:new google.maps.Point(w/2,13),labelOrigin:new google.maps.Point(w/2,13)}}
function style(m,on){var close=map.getZoom()>=14;m.setIcon(close?pill(m.p,on):dot(on));m.setLabel(close?{text:m.p.short||"Home",color:"#fff",fontSize:"12px",fontWeight:"700"}:null);m.setZIndex(on?1000:1)}
function draw(fit){if(!map)return;marks.forEach(function(m){m.setMap(null)});marks=[];var bounds=new google.maps.LatLngBounds();
 all.forEach(function(p){var m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map:map,title:p.price+", "+p.addr});m.p=p;style(m,false);bounds.extend(m.getPosition());m.addListener("click",function(){tap(p)});marks.push(m)});
 if(fit&&all.length){user=false;map.fitBounds(bounds,48);google.maps.event.addListenerOnce(map,"idle",function(){if(map.getZoom()>15)map.setZoom(15);user=false;listView()})}
 note.hidden=all.length>0;if(!all.length)note.textContent="No homes with a map location match this search. Change a filter, or click another spot on the map.";
 if(map3)dots3();
 if(fit&&in3d()&&all.length){var la=0,ln=0,far=0;all.forEach(function(p){la+=p.lat;ln+=p.lng});la/=all.length;ln/=all.length;all.forEach(function(p){far=Math.max(far,miles(la,ln,p.lat,p.lng))});
  map3.center={lat:la,lng:ln,altitude:0};map3.range=Math.max(1500,Math.min(60000,far*1609*1.6))}}
/* Moving or zooming the map only changes which homes the list shows; it never searches again, so a
   visitor can zoom in on a house (owner, 2026-10-29). A click on the map searches around that spot,
   about half the width of the view, and a brass ring shows the area searched. */
var ring=null,tapped3=0;
function clearRing(){if(ring){ring.setMap(null);ring=null}}
function clickSearch(lat,lng){var d;if(in3d()){d=view3().mi*0.6}else{var c=map.getCenter(),b=map.getBounds();if(!b)return;var ne=b.getNorthEast();d=miles(c.lat(),c.lng(),ne.lat(),ne.lng())*0.45}
 d=Math.min(15,Math.max(0.5,Math.round(d*10)/10));
 if(map&&!in3d()){clearRing();ring=new google.maps.Circle({map:map,center:{lat:lat,lng:lng},radius:d*1609,strokeColor:"#c4783a",strokeOpacity:.95,strokeWeight:2,fillColor:"#c4783a",fillOpacity:.08,clickable:false})}
 var u=new URLSearchParams(state);["city","zip","subdivision","near","miles"].forEach(function(k){u.delete(k)});if(u.get("sort")==="nearest")u.delete("sort");
 u.set("near",lat.toFixed(5)+","+lng.toFixed(5));u.set("miles",String(d));search(u,{fit:false,ai:false,ring:true})}
if(!key){render(all);return}
(function(g){var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=function(){return h||(h=new Promise(function(f,n){a=m.createElement("script");e.set("libraries",Array.from(r)+"");for(k in g)e.set(k.replace(/[A-Z]/g,function(t){return"_"+t[0].toLowerCase()}),g[k]);e.set("callback",c+".maps."+q);a.src="https://maps.googleapis.com/maps/api/js?"+e;d[q]=f;a.onerror=function(){h=n(Error(p+" could not load."))};m.head.append(a)}))};d[l]?0:d[l]=function(f){var n=Array.prototype.slice.call(arguments,1);r.add(f);return u().then(function(){return d[l].apply(d,[f].concat(n))})}})({key:key,v:"beta"});
google.maps.importLibrary("maps").then(function(lib){
 map=new lib.Map(document.getElementById("hx-map"),{center:{lat:33.70,lng:-78.92},zoom:10,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,clickableIcons:false,gestureHandling:"greedy"});
 map.addListener("dragstart",function(){user=true});map.addListener("zoom_changed",function(){marks.forEach(function(m){style(m,m.p.mls===hot)})});
 document.getElementById("hx-map").addEventListener("wheel",function(){user=true},{passive:true});document.getElementById("hx-map").addEventListener("touchstart",function(){user=true},{passive:true});
 map.addListener("idle",function(){if(!user)return;user=false;listView()});
 map.addListener("click",function(e){if(pop){closePop();return}if(e&&e.latLng)clickSearch(e.latLng.lat(),e.latLng.lng())});
 list.addEventListener("mouseover",function(e){var c=e.target.closest&&e.target.closest("[data-mls]");if(c&&c.getAttribute("data-mls")!==hot)hilite(c.getAttribute("data-mls"))});
 draw(true);
 var focus=app.getAttribute("data-focus");if(focus){var fm=null;marks.forEach(function(m){if(m.p.mls===focus)fm=m});
  if(fm){google.maps.event.addListenerOnce(map,"idle",function(){map.setCenter(fm.getPosition());map.setZoom(15);hilite(focus);listView()})}}
 if(wantsAi(app.getAttribute("data-q"),app.getAttribute("data-left")))ai(app.getAttribute("data-q"),app.getAttribute("data-left"));
 /* 2D or 3D in the top right (owner, 2026-10-28): the same dots, clickable, and the same list. */
 var btns=Array.prototype.slice.call(app.querySelectorAll("[data-mode]"));
 function setMode(m){btns.forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-mode")===m?"true":"false")});
  if(m==="2d"){if(box3&&!box3.hidden&&map3&&map3.center&&map3.center.lat!=null){map.setCenter({lat:map3.center.lat,lng:map3.center.lng})}if(box3)box3.hidden=true;setTimeout(listView,300);return}
  if(box3){if(map3){var cc=map.getCenter();map3.center={lat:cc.lat(),lng:cc.lng(),altitude:0}}box3.hidden=false;setTimeout(listView,300);return}
  box3=el("div","hx-map3d");document.getElementById("hx-mapbox").insertBefore(box3,document.getElementById("hx-map").nextSibling);
  Promise.all([google.maps.importLibrary("maps3d"),google.maps.importLibrary("marker").catch(function(){return{}})]).then(function(libs){L3=libs[0];Pin3=libs[1].PinElement;
   var c=map.getCenter();map3=new L3.Map3DElement({center:{lat:c.lat(),lng:c.lng(),altitude:0},range:Math.max(1500,Math.min(60000,40000/Math.pow(2,map.getZoom()-10))),tilt:62,heading:20,mode:"HYBRID"});
   box3.appendChild(map3);dots3();
   var t3=0;function moved3(){if(!in3d())return;clearTimeout(t3);t3=setTimeout(listView,400)}
   map3.addEventListener("gmp-click",function(e){if(Date.now()-tapped3<400)return;if(pop){closePop();return}var q=e&&e.position;if(q&&q.lat!=null)clickSearch(typeof q.lat==="function"?q.lat():q.lat,typeof q.lng==="function"?q.lng():q.lng)});
   ["gmp-centerchange","gmp-rangechange"].forEach(function(n){map3.addEventListener(n,moved3)})}).catch(function(){box3.textContent="The 3D map could not load here. The 2D map still works.";box3.className="hx-map3d hx-map3d-off"})}
 btns.forEach(function(b){b.addEventListener("click",function(){setMode(b.getAttribute("data-mode"))})});
 if(app.getAttribute("data-view")==="3d")setMode("3d");
}).catch(function(){note.hidden=false;note.textContent="The map could not load. Every home is in the list.";render(all)});
function dots3(){if(!map3||!L3)return;marks3.forEach(function(m){m.remove()});marks3=[];
 all.forEach(function(p){var mk=new L3.Marker3DInteractiveElement({position:{lat:p.lat,lng:p.lng,altitude:0},altitudeMode:L3.AltitudeMode.CLAMP_TO_GROUND,title:p.price+", "+p.addr});
  mk.p=p;if(Pin3){try{mk.pin=new Pin3({background:p.mls===hot?"#c4783a":"#1a73e8",borderColor:"#ffffff",glyphColor:"#ffffff",scale:.7});mk.append(mk.pin)}catch(x){}}
  mk.addEventListener("gmp-click",function(){tapped3=Date.now();tap(p)});map3.append(mk);marks3.push(mk)})}
})();</script>`;
