/**
 * The filter bar (owner, 2026-10-26: the old filters "look way outdated and useless"). One
 * component for the search page and for every article's homes strip: pills (Price, Beds &
 * baths, Home type, Town, More) that open a small panel each. It is a plain GET form, so it
 * works with no script at all (it opens /homes/ with the filters); with the script, the search
 * page applies a choice at once and an article's strip refreshes in place
 * (GET /homes/api/strip), without leaving the article.
 *
 * "More" holds the MLS features (idx-lib/features.js) and the ranges (year built, lot, HOA fee,
 * garage, days on market). It shows them only when the CRM answer says it applies them
 * (`features`); before that, it offers what the CRM reads today (no HOA).
 *
 * No backslash anywhere in FILTER_SCRIPT: it lives in a template string, which eats them.
 */
import { CITIES } from "./query.js";
import { FEATURE_GROUPS, FEATURE_LABEL } from "./features.js";

const esc = (v) => String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const k = (n) => (n >= 1e6 ? `$${(n / 1e6).toLocaleString("en-US", { maximumFractionDigits: 2 })}M` : `$${Math.round(n / 1000)}K`);
const PRICE_STEPS = [100000, 150000, 200000, 250000, 300000, 350000, 400000, 450000, 500000, 600000, 700000, 800000, 900000, 1000000, 1250000, 1500000, 2000000, 3000000];
const TYPES = [["", "Any type"], ["house", "House"], ["condo", "Condo"], ["townhouse", "Townhouse"], ["multi", "2 to 4 units"], ["land", "Land"], ["manufactured", "Manufactured"]];
const YEARS = [["", "Any year"], ["2024", "2024 or newer"], ["2020", "2020 or newer"], ["2015", "2015 or newer"], ["2010", "2010 or newer"], ["2000", "2000 or newer"], ["1990", "1990 or newer"]];
const LOTS = [["", "Any lot"], ["0.25", "1/4 acre or more"], ["0.5", "1/2 acre or more"], ["1", "1 acre or more"], ["5", "5 acres or more"]];
const HOA = [["", "Any HOA"], ["0", "No HOA"], ["100", "Up to $100 a month"], ["200", "Up to $200 a month"], ["300", "Up to $300 a month"], ["500", "Up to $500 a month"]];
const GARAGE = [["", "Any"], ["1", "1+ car"], ["2", "2+ car"], ["3", "3+ car"]];
const DOM = [["", "Any time"], ["7", "Last 7 days"], ["30", "Last 30 days"]];

/* The value in force is always one of the choices, so a feed's $230K or 2.5 baths is shown and kept. */
const withCur = (list, cur, word) => (cur && !list.some(([v]) => String(v) === String(cur)) ? [...list, [String(cur), word(cur)]] : list);
const opt = (v, label, cur) => `<option value="${esc(v)}"${String(cur ?? "") === String(v) ? " selected" : ""}>${esc(label)}</option>`;
const seg = (name, list, cur) => `<div class="hx-seg" role="radiogroup">${withCur(list, cur, (v) => `${v}+`).map(([v, l]) => `<label><input type="radio" name="${name}" value="${esc(v)}"${String(cur ?? "") === v ? " checked" : ""}><span>${esc(l)}</span></label>`).join("")}</div>`;
const pop = (key, label, active, inner, wide) => `<details class="hx-pop${wide ? " hx-pop-w" : ""}${active ? " hx-on" : ""}" data-k="${key}"><summary><span>${esc(active || label)}</span><svg viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5"/></svg></summary><div class="hx-pop-p">${inner}<button type="submit" class="hx-pop-go">Show homes</button></div></details>`;

/** What a pill says when its filter is on: "$300K-$500K", "3+ bd, 2+ ba", "Conway". */
export function labels(p) {
  const min = +p.get("min") || 0, max = +p.get("max") || 0;
  const price = min && max ? `${k(min)} to ${k(max)}` : min ? `${k(min)}+` : max ? `Up to ${k(max)}` : "";
  const beds = p.get("beds"), baths = p.get("baths");
  const bb = [beds ? `${beds}+ bd` : "", baths ? `${baths}+ ba` : ""].filter(Boolean).join(", ");
  const type = (TYPES.find(([v]) => v && v === p.get("type")) || [])[1] || "";
  const more = ["yearMin", "lotMin", "hoaMax", "garage", "domMax", "status", "waterfront"].filter((x) => p.get(x)).length
    + (p.get("hoa") === "0" ? 1 : 0) + (p.get("has") ? p.get("has").split(",").length : 0) + (p.get("not") ? p.get("not").split(",").length : 0);
  return { price, bb, type, town: p.get("city") || "", more: more ? `More (${more})` : "" };
}

/**
 * The bar. `params`: the search in force. `features`: the CRM applies the MLS features and
 * ranges. `compact`: an article strip (no words box; the strip refreshes in place).
 */
export function filterBar({ action = "/homes/", params, features = false, compact = false }) {
  const p = new URLSearchParams(params);
  const L = labels(p);
  const has = new Set((p.get("has") || "").split(",").filter(Boolean));
  // Kept as is: what has no control in this bar (with the CRM's ranges, "not" still has none).
  const keep = ["subdivision", "near", "miles", "zip", "sort", "sqft", "yearMax", "sold", "not", ...(features ? [] : ["has", "yearMin", "lotMin", "hoaMax", "garage", "domMax", "status"])]
    .filter((x) => p.get(x)).map((x) => `<input type="hidden" name="${x}" value="${esc(p.get(x))}">`).join("");
  const prices = (name, cur) => `<select name="${name}" aria-label="${name === "min" ? "Lowest price" : "Highest price"}">${opt("", name === "min" ? "No min" : "No max", cur)}${[...new Set([...PRICE_STEPS, +cur || 0])].filter(Boolean).sort((a, b) => a - b).map((v) => opt(v, k(v), cur)).join("")}</select>`;
  const quick = [["", "300000", "Under $300K"], ["300000", "500000", "$300K to $500K"], ["500000", "1000000", "$500K to $1M"], ["1000000", "", "$1M+"]]
    .map(([a, b, t]) => `<button type="button" class="hx-quick" data-min="${a}" data-max="${b}">${t}</button>`).join("");
  const priceP = `<p class="hx-pop-h">Price</p><div class="hx-pop-2"><label>Min${prices("min", p.get("min"))}</label><label>Max${prices("max", p.get("max"))}</label></div><div class="hx-quicks">${quick}</div>`;
  const bedsP = `<p class="hx-pop-h">Bedrooms</p>${seg("beds", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"], ["5", "5+"]], p.get("beds"))}<p class="hx-pop-h">Bathrooms</p>${seg("baths", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"]], p.get("baths"))}`;
  const typeP = `<p class="hx-pop-h">Home type</p><div class="hx-list">${TYPES.map(([v, l]) => `<label><input type="radio" name="type" value="${esc(v)}"${(p.get("type") || "") === v ? " checked" : ""}><span>${esc(l)}</span></label>`).join("")}</div>`;
  const townP = `<p class="hx-pop-h">Town</p><div class="hx-list hx-list-2"><label><input type="radio" name="city" value=""${p.get("city") ? "" : " checked"}><span>Every town</span></label>${CITIES.map((c) => `<label><input type="radio" name="city" value="${esc(c)}"${p.get("city") === c ? " checked" : ""}><span>${esc(c)}</span></label>`).join("")}</div>`;
  const hoaCur = p.get("hoa") === "0" ? "0" : p.get("hoaMax") || "";
  const ranges = features
    ? `<div class="hx-pop-3"><label>Year built<select name="yearMin">${withCur(YEARS, p.get("yearMin"), (v) => `${v} or newer`).map(([v, l]) => opt(v, l, p.get("yearMin"))).join("")}</select></label>`
      + `<label>Lot size<select name="lotMin">${withCur(LOTS, p.get("lotMin"), (v) => `${v} acres or more`).map(([v, l]) => opt(v, l, p.get("lotMin"))).join("")}</select></label>`
      + `<label>HOA fee<select name="hoaPick" data-hx-hoa>${withCur(HOA, hoaCur, (v) => `Up to $${(+v).toLocaleString("en-US")} a month`).map(([v, l]) => opt(v, l, hoaCur)).join("")}</select></label>`
      + `<label>Garage<select name="garage">${withCur(GARAGE, p.get("garage"), (v) => `${v}+ car`).map(([v, l]) => opt(v, l, p.get("garage"))).join("")}</select></label>`
      + `<label>Listed<select name="domMax">${withCur(DOM, p.get("domMax"), (v) => `Last ${v} days`).map(([v, l]) => opt(v, l, p.get("domMax"))).join("")}</select></label></div>`
      + `<label class="hx-tick"><input type="checkbox" name="status" value="active"${p.get("status") === "active" ? " checked" : ""}><span>For sale only, not under contract</span></label>`
    : `<label class="hx-tick"><input type="checkbox" name="hoa" value="0"${p.get("hoa") === "0" ? " checked" : ""}><span>No HOA, as listed by the listing agent</span></label>`;
  const waterTick = `<label class="hx-tick"><input type="checkbox" name="waterfront" value="1"${p.get("waterfront") === "1" ? " checked" : ""}><span>Waterfront</span></label>`;
  const groups = features ? FEATURE_GROUPS.map((g) => `<p class="hx-pop-h">${esc(g.name)}</p><div class="hx-feats">${g.keys.filter(([key]) => key !== "waterfront").map(([key, label]) => `<label><input type="checkbox" name="has" value="${esc(key)}"${has.has(key) ? " checked" : ""}><span>${esc(label)}</span></label>`).join("")}</div>`).join("") : "";
  const moreP = `<p class="hx-pop-h">More filters</p>${waterTick}${ranges}${groups}`;
  return `<form class="hx-fb${compact ? " hx-fb-c" : ""}" action="${esc(action)}" method="get" data-hx-fb${compact ? " data-hx-strip-fb" : ""} aria-label="Filters">${keep}`
    + (compact ? "" : `<label class="hx-fb-q"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input name="q" type="search" enterkeyhint="search" autocomplete="off" maxlength="200" aria-label="Search homes" placeholder="Town, neighborhood, ZIP, or &quot;3 bed under $400k&quot;"></label>`)
    + `<div class="hx-fb-pills">${pop("price", "Price", L.price, priceP)}${pop("beds", "Beds & baths", L.bb, bedsP)}${pop("type", "Home type", L.type, typeP)}${pop("town", "Town", L.town, townP, true)}${pop("more", "More", L.more, moreP, true)}</div>`
    + `<noscript><button type="submit" class="hx-pop-go">Show homes</button></noscript></form>`;
}

/** Chips for the features in force (the search page's removable chips). */
export const featureChipLabel = (key) => FEATURE_LABEL[key] || key;

export const FILTER_STYLE = `
.hx-fb{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;margin:.9rem 0 1rem;position:relative;z-index:5}
.hx-fb-q{display:flex;align-items:center;gap:.5rem;flex:1 1 22rem;min-height:3rem;padding:0 1rem;border-radius:999px;background:#fff;border:1px solid rgba(28,32,40,.14);box-shadow:0 1px 2px rgba(28,32,40,.05)}
.hx-fb-q:focus-within{border-color:var(--brass-ink,#91592b);box-shadow:0 0 0 3px rgba(196,120,58,.18)}
.hx-fb-q svg{width:19px;height:19px;flex:none;fill:none;stroke:#5c6b78;stroke-width:2;stroke-linecap:round}
.hx-fb-q input{flex:1;min-width:0;border:0;outline:none;background:none;font:inherit;font-size:1rem;color:var(--ink,#1c2028)}
.hx-fb-pills{display:flex;flex-wrap:wrap;gap:.45rem}
.hx-pop{position:relative}
.hx-pop>summary{list-style:none;display:flex;align-items:center;gap:.45rem;min-height:2.6rem;padding:0 .95rem;border-radius:999px;background:#fff;border:1px solid rgba(28,32,40,.16);font-size:.9rem;font-weight:600;color:var(--ink,#1c2028);cursor:pointer;white-space:nowrap;user-select:none}
.hx-pop>summary::-webkit-details-marker{display:none}
.hx-pop>summary svg{width:11px;height:8px;fill:none;stroke:currentColor;stroke-width:1.6;transition:transform .15s}
.hx-pop[open]>summary svg{transform:rotate(180deg)}
.hx-pop>summary:hover{border-color:rgba(28,32,40,.35)}
.hx-pop.hx-on>summary{background:var(--ink,#1c2028);border-color:var(--ink,#1c2028);color:#fff}
.hx-pop-p{position:absolute;top:calc(100% + .45rem);left:0;width:min(21rem,calc(100vw - 2rem));max-height:min(70vh,34rem);overflow:auto;padding:1rem 1.05rem 1.05rem;border-radius:16px;background:#fff;box-shadow:0 20px 50px rgba(28,32,40,.22);border:1px solid rgba(28,32,40,.08)}
.hx-pop-w .hx-pop-p{width:min(30rem,calc(100vw - 2rem))}.hx-pop[data-k=more] .hx-pop-p{left:auto;right:0}
.hx-fb:has(details[open]){z-index:10000}
.hx-fb-err{flex-basis:100%;margin:.1rem 0 0;font-size:.85rem;color:#8a2d1c}
.hx-pop-h{margin:.2rem 0 .5rem;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--slate,#5c6b78)}
.hx-pop-h~.hx-pop-h{margin-top:.95rem}
.hx-pop-2,.hx-pop-3{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}.hx-pop-3{margin:.2rem 0 .7rem}
.hx-pop-p label{display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;font-weight:600;color:var(--slate,#5c6b78)}
.hx-pop-2>*,.hx-pop-3>*{min-width:0}.hx-pop-p select{width:100%;min-width:0;min-height:2.6rem;padding:0 .7rem;border-radius:10px;border:1px solid rgba(28,32,40,.18);background:#faf8f4;font:inherit;font-size:.92rem;color:var(--ink,#1c2028)}
.hx-quicks{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.6rem}
.hx-quick{padding:.4rem .7rem;border-radius:999px;border:1px solid rgba(28,32,40,.16);background:#faf8f4;font:inherit;font-size:.82rem;font-weight:600;color:var(--ink,#1c2028);cursor:pointer}
.hx-quick:hover{border-color:var(--ink,#1c2028)}
.hx-seg{display:flex;border:1px solid rgba(28,32,40,.16);border-radius:12px;overflow:hidden}
.hx-seg label{flex:1;display:block;position:relative}
.hx-seg input,.hx-list input,.hx-feats input{position:absolute;opacity:0;pointer-events:none}
.hx-seg span{display:block;text-align:center;padding:.6rem .2rem;font-size:.9rem;font-weight:600;color:var(--ink,#1c2028);cursor:pointer;border-left:1px solid rgba(28,32,40,.1)}
.hx-seg label:first-child span{border-left:0}
.hx-seg input:checked+span{background:var(--ink,#1c2028);color:#fff}
.hx-list{display:grid;gap:.3rem}.hx-list-2{grid-template-columns:1fr 1fr}
.hx-list label,.hx-feats label{position:relative;display:block}
.hx-list span{display:block;padding:.55rem .75rem;border-radius:10px;font-size:.92rem;font-weight:500;color:var(--ink,#1c2028);cursor:pointer;background:#faf8f4}
.hx-list input:checked+span{background:var(--ink,#1c2028);color:#fff}
.hx-feats{display:flex;flex-wrap:wrap;gap:.35rem}
.hx-feats span{display:inline-block;padding:.42rem .72rem;border-radius:999px;border:1px solid rgba(28,32,40,.16);font-size:.84rem;font-weight:500;color:var(--ink,#1c2028);cursor:pointer;background:#fff}
.hx-feats input:checked+span{background:var(--ink,#1c2028);border-color:var(--ink,#1c2028);color:#fff}
.hx-seg input:focus-visible+span,.hx-list input:focus-visible+span,.hx-feats input:focus-visible+span{outline:2px solid var(--brass-ink,#91592b);outline-offset:2px}
.hx-tick{flex-direction:row!important;align-items:center;gap:.55rem!important;margin:.35rem 0;font-size:.9rem!important;font-weight:500!important;color:var(--ink,#1c2028)!important;cursor:pointer}
.hx-tick input{width:1.1rem;height:1.1rem;accent-color:var(--ink,#1c2028)}
.hx-pop-go{display:block;width:100%;margin-top:.95rem;min-height:2.8rem;border:0;border-radius:999px;background:var(--ink,#1c2028);color:#fff;font:inherit;font-weight:700;font-size:.92rem;cursor:pointer}
.hx-pop-go:hover{background:#2a3040}
.hx-fb-c{margin:.1rem 0 .95rem}
.hx-fb-c .hx-pop>summary{min-height:2.35rem;font-size:.85rem;padding:0 .85rem}
.hx-strip[data-loading] .hx-s-row{opacity:.45;transition:opacity .15s}
.hx-s-empty{padding:1.4rem;border-radius:14px;background:#fff;color:var(--slate,#5c6b78);font-size:.92rem}
@media (max-width:640px){.hx-fb-pills{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;width:100%;padding-bottom:.2rem}.hx-fb-pills::-webkit-scrollbar{display:none}
.hx-pop{position:static}.hx-fb .hx-pop-p{position:fixed;left:.75rem!important;right:.75rem!important;top:auto;bottom:.75rem;width:auto!important;max-height:72vh;border-radius:20px;z-index:1000;box-shadow:0 -10px 60px rgba(28,32,40,.35)}
body:has(.hx-fb details[open]) #c3-fab{display:none}}
`;

export const FILTER_SCRIPT = `<script>(function(){
var forms=document.querySelectorAll("form[data-hx-fb]");
function closeAll(except){document.querySelectorAll("details.hx-pop[open]").forEach(function(d){if(d!==except)d.removeAttribute("open")})}
document.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest("details.hx-pop"))closeAll(null)});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll(null)});
function paramsOf(f){var p=new URLSearchParams();var has=[];
 Array.prototype.forEach.call(f.elements,function(x){if(!x.name||x.disabled)return;
  if((x.type==="radio"||x.type==="checkbox")&&!x.checked)return;
  if(x.name==="has"){has.push(x.value);return}
  if(x.name==="hoaPick"){if(x.value==="0")p.set("hoa","0");else if(x.value)p.set("hoaMax",x.value);return}
  if(x.value!=="")p.set(x.name,x.value)});
 if(has.length)p.set("has",has.join(","));return p}
function label(d,text,on){var s=d.querySelector("summary span");s.textContent=text;d.classList.toggle("hx-on",!!on)}
function say(f,text){var e=f.querySelector(".hx-fb-err");if(!text){if(e)e.remove();return}
 if(!e){e=document.createElement("p");e.className="hx-fb-err";e.setAttribute("role","status");f.appendChild(e)}e.textContent=text}
function go(f){var p=paramsOf(f);
 if(!f.hasAttribute("data-hx-strip-fb")){location.href=f.getAttribute("action")+(p.toString()?"?"+p.toString():"");return}
 var strip=f.closest(".hx-strip"),row=strip&&strip.querySelector("[data-hx-row]");if(!row)return;
 strip.setAttribute("data-loading","1");closeAll(null);
 var n=f.hxSeq=(f.hxSeq||0)+1;
 fetch("/homes/api/strip?"+p.toString(),{credentials:"same-origin"}).then(function(r){return r.json()}).then(function(j){
  if(n!==f.hxSeq)return;strip.removeAttribute("data-loading");
  if(!j||!j.ok){say(f,"Could not refresh the homes. Please try again.");return}
  say(f,"");row.innerHTML=j.html;
  var h=strip.querySelector(".hx-feed-h");if(h)h.textContent="Homes for sale that match your filters";
  var note=strip.querySelector(".hx-s-note");
  if(j.note&&!note){note=document.createElement("p");note.className="hx-s-note";strip.querySelector(".hx-s-head").insertAdjacentElement("afterend",note)}
  if(j.note)note.textContent=j.note;else if(note)note.remove();var all=strip.querySelector(".hx-s-head a");if(all){all.href=j.link;all.textContent=j.total?"See all "+j.total.toLocaleString("en-US"):"See all"}
  Array.prototype.forEach.call(f.querySelectorAll("details.hx-pop"),function(d){var k=d.getAttribute("data-k");if(j.labels&&k in j.labels)label(d,j.labels[k]||d.getAttribute("data-label"),j.labels[k])});
 }).catch(function(){if(n!==f.hxSeq)return;strip.removeAttribute("data-loading");say(f,"Could not refresh the homes. Please try again.")})}
Array.prototype.forEach.call(forms,function(f){
 Array.prototype.forEach.call(f.querySelectorAll("details.hx-pop"),function(d){d.setAttribute("data-label",{price:"Price",beds:"Beds & baths",type:"Home type",town:"Town",more:"More"}[d.getAttribute("data-k")]||"");
  d.addEventListener("toggle",function(){if(d.open)closeAll(d)})});
 f.addEventListener("submit",function(e){e.preventDefault();go(f)});
 f.addEventListener("change",function(e){var t=e.target;if(t.closest("details[data-k=more]"))return;if(t.name==="q")return;go(f)});
 Array.prototype.forEach.call(f.querySelectorAll(".hx-quick"),function(b){b.addEventListener("click",function(){f.elements.min.value=b.getAttribute("data-min");f.elements.max.value=b.getAttribute("data-max");go(f)})});
});
})();</script>`;
