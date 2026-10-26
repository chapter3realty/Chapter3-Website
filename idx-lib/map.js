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
import { addressLine, cardTag, headlinePrice, listingPath, safeUrl, statusWord } from "./render.js";

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
    price: headlinePrice(l), short: shortPrice(l), photo: safeUrl(l.photo),
    beds: num(l.beds), baths: num(l.baths), sqft: num(l.sqft), status: statusWord(l.status), tag: cardTag(l),
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
#hx-root[data-wide]{max-width:none!important;width:100%!important;padding:0!important;margin:0!important}
.hx-map-top{padding:.8rem 1.25rem .2rem;max-width:1600px;margin:0 auto}
.hx-map-top .hx-search{margin:.2rem 0 .5rem}.hx-map-top h1{font-size:1.5rem!important;margin:.2rem 0 .5rem!important}
.hx-map-body{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 440px;height:calc(100vh - 15rem);min-height:520px;border-top:1px solid rgba(28,32,40,.1)}
.hx-map{position:relative;background:#e9e5dc}
.hx-map-list{overflow:auto;padding:1rem;background:#faf8f4;border-left:1px solid rgba(28,32,40,.1)}
.hx-map-count{margin:0 0 .8rem;font-size:.95rem}.hx-map-count b{font-weight:800}
.hx-map-cards{display:grid;gap:1rem}
.hx-map-cards .hx-hot{outline:3px solid #1a73e8;outline-offset:2px;border-radius:14px}
.hx-area{position:absolute;top:1rem;left:50%;transform:translateX(-50%);z-index:5;border:0;border-radius:999px;background:#1c2028;color:#fff;font:inherit;font-weight:700;padding:.65rem 1.2rem;box-shadow:0 8px 24px rgba(28,32,40,.3);cursor:pointer}
.hx-map-note{position:absolute;left:1rem;right:1rem;bottom:1rem;z-index:5;max-width:30rem;margin:0 auto;padding:.8rem 1rem;border-radius:14px;background:rgba(255,255,255,.92);box-shadow:0 8px 24px rgba(28,32,40,.18);font-size:.9rem;text-align:center}
.hx-map-toggle{display:none}
.hx-mode{position:absolute;top:1rem;right:1rem;z-index:6;display:flex;padding:3px;border-radius:999px;background:rgba(255,255,255,.95);box-shadow:0 6px 20px rgba(28,32,40,.2)}
.hx-mode button{border:0;background:none;font:inherit;font-weight:700;font-size:.88rem;padding:.45rem .95rem;border-radius:999px;cursor:pointer;color:#1c2028}
.hx-mode button[aria-pressed="true"]{background:#1c2028;color:#fff}
.hx-map3d{position:absolute;inset:0;z-index:3;background:#1c2028}.hx-map3d[hidden]{display:none}.hx-map3d gmp-map-3d{width:100%;height:100%;display:block}
.hx-map3d-off{display:flex;align-items:center;justify-content:center;color:#f4efe8;padding:2rem;text-align:center}
.hx-pop{position:absolute;left:50%;bottom:1rem;transform:translateX(-50%);z-index:6;width:min(22rem,calc(100% - 2rem))}
.hx-pop .hx-x{top:.4rem;right:.4rem;z-index:2;background:rgba(255,255,255,.9)}
.hx-pop .hx-c-link{display:grid;grid-template-columns:7.5rem minmax(0,1fr)}.hx-pop .hx-c-photo{aspect-ratio:auto;height:100%;min-height:7rem}.hx-pop .hx-c-body{padding:.6rem .8rem;padding-right:2.4rem}.hx-pop .hx-c-price{font-size:1.15rem}.hx-pop .hx-c-firm,.hx-pop .hx-c-tag{display:none}
.hx-maplist{color:var(--brass-ink,#91592b);font-weight:600}
@media (max-width:899px){.hx-map-body{grid-template-columns:1fr;height:calc(100vh - 13rem)}.hx-map-list{display:none;position:absolute;inset:0;z-index:7;border:0}
 .hx-map-body.hx-show-list .hx-map-list{display:block}
 .hx-map-toggle{display:inline-flex;position:absolute;right:1rem;bottom:1rem;z-index:8;border:0;border-radius:999px;background:#1c2028;color:#fff;font:inherit;font-weight:700;padding:.65rem 1.1rem;box-shadow:0 8px 24px rgba(28,32,40,.3)}
 .hx-pop{bottom:4.5rem}}
</style>`;

/**
 * The 2D map. Blue dots far out, price pills close in (zoom 14 and nearer), like Zillow.
 * "Search this area" after the visitor moves the map runs the search around the new view.
 * Nothing from the CRM is written with innerHTML: every card is built with textContent.
 */
export const MAP_SCRIPT = `<script>(function(){
var app=document.querySelector("[data-hx-map]");if(!app)return;
var key=app.getAttribute("data-key"),base=app.getAttribute("data-params")||"",pins=[];
try{pins=JSON.parse(document.getElementById("hx-pins").textContent)||[]}catch(e){}
var list=document.getElementById("hx-map-cards"),count=document.getElementById("hx-map-count"),area=document.getElementById("hx-area"),note=document.getElementById("hx-map-note"),body=document.querySelector(".hx-map-body");
var tg=document.querySelector(".hx-map-toggle");if(tg)tg.addEventListener("click",function(){var on=body.classList.toggle("hx-show-list");tg.textContent=on?"Map":"List"});
function el(t,c,txt){var e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e}
function card(p){var a=el("article","hx-c"),l=el("a","hx-c-link");l.href=p.url;a.setAttribute("data-mls",p.mls);
 var ph=el("span","hx-c-photo");if(p.photo&&p.photo.indexOf("https://")===0){var im=el("img");im.src=p.photo;im.alt=p.addr;im.loading="lazy";im.referrerPolicy="no-referrer";ph.appendChild(im)}
 if(p.tag)ph.appendChild(el("span","hx-c-tag",p.tag));l.appendChild(ph);var b=el("span","hx-c-body");b.appendChild(el("span","hx-c-price",p.price));
 var f=el("span","hx-c-facts"),bits=[];if(p.beds!=null)bits.push([p.beds," bds"]);if(p.baths!=null)bits.push([p.baths," ba"]);if(p.sqft!=null)bits.push([p.sqft.toLocaleString("en-US")," sqft"]);
 bits.forEach(function(x,i){if(i)f.appendChild(el("i"));f.appendChild(el("b",null,String(x[0])));f.appendChild(document.createTextNode(x[1]))});if(p.status){if(bits.length)f.appendChild(el("i"));f.appendChild(document.createTextNode(p.status))}
 b.appendChild(f);b.appendChild(el("span","hx-c-addr",p.addr));b.appendChild(el("span","hx-c-firm","MLS #"+p.mls+", "+p.firm+". Listing provided by CCMLS."));l.appendChild(b);a.appendChild(l);return a}
function showList(ps,total){while(list.firstChild)list.removeChild(list.firstChild);ps.forEach(function(p){list.appendChild(card(p))});
 count.textContent="";var bb=el("b",null,(total||ps.length).toLocaleString("en-US"));count.appendChild(bb);count.appendChild(document.createTextNode(" homes"+(total>ps.length?", "+ps.length+" on the map":"")))}
if(!key)return;
(function(g){var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=function(){return h||(h=new Promise(function(f,n){a=m.createElement("script");e.set("libraries",Array.from(r)+"");for(k in g)e.set(k.replace(/[A-Z]/g,function(t){return"_"+t[0].toLowerCase()}),g[k]);e.set("callback",c+".maps."+q);a.src="https://maps.googleapis.com/maps/api/js?"+e;d[q]=f;a.onerror=function(){h=n(Error(p+" could not load."))};m.head.append(a)}))};d[l]?0:d[l]=function(f){var n=Array.prototype.slice.call(arguments,1);r.add(f);return u().then(function(){return d[l].apply(d,[f].concat(n))})}})({key:key,v:"beta"});
google.maps.importLibrary("maps").then(function(lib){
 var map=new lib.Map(document.getElementById("hx-map"),{center:{lat:33.70,lng:-78.92},zoom:10,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,clickableIcons:false,gestureHandling:"greedy"});
 var marks=[],pop=null,moved=false,hot=null,lastPins=null;
 function dot(on){return{path:google.maps.SymbolPath.CIRCLE,scale:on?9:6.5,fillColor:on?"#0b57d0":"#1a73e8",fillOpacity:1,strokeColor:"#fff",strokeWeight:2}}
 function pill(p,on){var w=Math.max(46,p.short.length*8+16);var svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="26"><rect x="1" y="1" width="'+(w-2)+'" height="24" rx="12" fill="'+(on?"#0b57d0":"#1a73e8")+'" stroke="#fff" stroke-width="2"/></svg>';
  return{url:"data:image/svg+xml;charset=UTF-8,"+encodeURIComponent(svg),scaledSize:new google.maps.Size(w,26),anchor:new google.maps.Point(w/2,13),labelOrigin:new google.maps.Point(w/2,13)}}
 function style(m,on){var close=map.getZoom()>=14;m.setIcon(close?pill(m.p,on):dot(on));m.setLabel(close?{text:m.p.short||"Home",color:"#fff",fontSize:"12px",fontWeight:"700"}:null);m.setZIndex(on?1000:1)}
 function hilite(mls){marks.forEach(function(m){style(m,m.p.mls===mls)});Array.prototype.forEach.call(list.children,function(c){c.classList.toggle("hx-hot",c.getAttribute("data-mls")===mls)})}
 function popup(p){if(pop)pop.remove();pop=el("div","hx-pop");var x=el("button","hx-x","\\u00d7");x.type="button";x.setAttribute("aria-label","Close");x.addEventListener("click",function(){pop.remove();pop=null});pop.appendChild(x);var cd=card(p);var ht=cd.querySelector(".hx-heart");if(ht)ht.remove();pop.appendChild(cd);document.getElementById("hx-map").appendChild(pop)}
 function draw(ps,fit){lastPins=ps;marks.forEach(function(m){m.setMap(null)});marks=[];var bounds=new google.maps.LatLngBounds();
  ps.forEach(function(p){var m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map:map,title:p.price+", "+p.addr});m.p=p;style(m,false);bounds.extend(m.getPosition());
   m.addListener("click",function(){hilite(p.mls);var c=list.querySelector('[data-mls="'+p.mls+'"]');if(c&&window.innerWidth>=900)c.scrollIntoView({behavior:"smooth",block:"nearest"});if(window.innerWidth<900)popup(p)});marks.push(m)});
  if(fit&&ps.length){map.fitBounds(bounds,48);google.maps.event.addListenerOnce(map,"idle",function(){if(map.getZoom()>15)map.setZoom(15);moved=false;area.hidden=true})}
  note.hidden=ps.length>0}
 list.addEventListener("mouseover",function(e){var c=e.target.closest&&e.target.closest("[data-mls]");if(c&&c.getAttribute("data-mls")!==hot){hot=c.getAttribute("data-mls");hilite(hot)}});
 map.addListener("zoom_changed",function(){marks.forEach(function(m){style(m,m.p.mls===hot)})});
 map.addListener("dragend",function(){moved=true;area.hidden=false});map.addListener("zoom_changed",function(){if(marks.length&&moved)area.hidden=false});
 area.addEventListener("click",function(){var c=map.getCenter(),ne=map.getBounds().getNorthEast(),R=3958.8,r=Math.PI/180;
  var d=2*R*Math.asin(Math.sqrt(Math.pow(Math.sin((ne.lat()-c.lat())*r/2),2)+Math.cos(c.lat()*r)*Math.cos(ne.lat()*r)*Math.pow(Math.sin((ne.lng()-c.lng())*r/2),2)));
  var u=new URLSearchParams(base);u.delete("city");u.delete("zip");u.delete("subdivision");u.set("near",c.lat().toFixed(5)+","+c.lng().toFixed(5));u.set("miles",String(Math.min(25,Math.max(0.3,Math.round(d*10)/10))));
  area.hidden=true;count.textContent="Searching this area...";
  fetch("/homes/api/map?"+u.toString(),{credentials:"same-origin"}).then(function(r){return r.json()}).then(function(j){if(!j.ok){count.textContent=j.error==="stale"?"The listing search is being refreshed. Please try again in a few minutes.":"Please try again in a minute.";return}showList(j.pins,j.total);draw(j.pins,false)}).catch(function(){count.textContent="Please try again in a minute."})});
 draw(pins,true);
 /* A home from a listing page: light it and fly to it. */
 var focus=app.getAttribute("data-focus");if(focus){var fm=null;marks.forEach(function(m){if(m.p.mls===focus)fm=m});
  if(fm){google.maps.event.addListenerOnce(map,"idle",function(){map.setCenter(fm.getPosition());map.setZoom(15);hot=focus;hilite(focus)})}}
 /* 2D or 3D, one page (owner, 2026-10-25). 3D is Google's photorealistic map with the same blue dots. */
 var box3=null,map3=null,marks3=[],btns=$$("[data-mode]");
 function $$(q){return Array.prototype.slice.call(document.querySelectorAll(q))}
 function setMode(m){btns.forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-mode")===m?"true":"false")});
  if(m==="2d"){if(box3)box3.hidden=true;return}
  area.hidden=true;
  if(box3){box3.hidden=false;return}
  box3=el("div","hx-map3d");document.getElementById("hx-map").appendChild(box3);
  Promise.all([google.maps.importLibrary("maps3d"),google.maps.importLibrary("marker").catch(function(){return{}})]).then(function(libs){var L=libs[0],Pin=libs[1].PinElement;
   var c=map.getCenter();map3=new L.Map3DElement({center:{lat:c.lat(),lng:c.lng(),altitude:0},range:Math.max(1500,Math.min(60000,40000/Math.pow(2,map.getZoom()-10))),tilt:62,heading:20,mode:"HYBRID"});
   box3.appendChild(map3);
   (lastPins||pins).forEach(function(p){var mk=new L.Marker3DInteractiveElement({position:{lat:p.lat,lng:p.lng,altitude:0},altitudeMode:L.AltitudeMode.CLAMP_TO_GROUND,title:p.price+", "+p.addr});
    if(Pin){try{mk.append(new Pin({background:"#1a73e8",borderColor:"#ffffff",glyphColor:"#ffffff",scale:.7}))}catch(x){}}
    mk.addEventListener("gmp-click",function(){popup(p)});map3.append(mk);marks3.push(mk)});
  }).catch(function(){box3.textContent="The 3D map could not load here. The 2D map still works.";box3.className="hx-map3d hx-map3d-off"})}
 btns.forEach(function(b){b.addEventListener("click",function(){setMode(b.getAttribute("data-mode"))})});
 if(app.getAttribute("data-view")==="3d")setMode("3d");
}).catch(function(){note.hidden=false;note.textContent="The map could not load. The list of homes is on the right."});
})();</script>`;
