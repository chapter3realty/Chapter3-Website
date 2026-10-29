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
import { featureLabel, isFeature } from "./features.js";

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
  const more = ["yearMin", "lotMin", "hoaMax", "garage", "domMax", "sqft", "waterfront"].filter((x) => p.get(x)).length
    + (p.get("hoa") === "0" ? 1 : 0) + (p.get("has") ? p.get("has").split(",").length : 0) + (p.get("not") ? p.get("not").split(",").length : 0);
  return { price, bb, type, town: p.get("city") || "", more: more ? `Filters (${more})` : "" };
}

/* The Filters window, house first (owner, 2026-10-28: "House filters come first; a See more button
   early for listing, commute and geographic filters"). Each tick is shown only when the CRM lists it. */
const HOUSE_TICKS = [["one_level", "One level"], ["pool", "Private pool"], ["private_dock", "Private dock"], ["attached_garage", "Attached garage"], ["screened_porch", "Screened porch"], ["fenced_yard", "Fenced yard"]];
const LISTING_TICKS = [["price_reduced", "Price just cut"], ["open_house", "Open house coming up"], ["new_construction", "New construction"], ["quick_move_in", "Ready to move in"], ["foreclosure", "Foreclosure"], ["short_sale", "Short sale"], ["distressed_sale", "Distressed sale"], ["fha_accepted", "Seller takes FHA"], ["va_accepted", "Seller takes VA"], ["assumable_loan", "Assumable loan"]];
const AREA_TICKS = [["walk_to_beach", "Walk to the beach"], ["near_beach", "Near the beach"], ["east_of_17", "East of 17"], ["outside_city_limits", "Outside city limits"], ["golf_cart_ok", "Golf carts allowed"], ["str_allowed", "Nightly rentals allowed"], ["rentals_allowed", "Rentals allowed"], ["gated", "Gated"]];
const SQFT = [["", "Any size"], ["1000", "1,000+ sq ft"], ["1500", "1,500+ sq ft"], ["2000", "2,000+ sq ft"], ["2500", "2,500+ sq ft"], ["3000", "3,000+ sq ft"]];

/**
 * The bar. `params`: the search in force. `features`: the CRM applies the MLS features and
 * ranges. `compact`: an article's strip, scaled down. `map`: the map page, which applies a
 * change at once without leaving the page. `ask`: the words in the search box (the jobs guide
 * asks for an employer). Everywhere else, a search opens the map with it (owner, 2026-10-28).
 */
/** What the AI search bar asks. */
export const AI_ASK = "Tell me everything you want and why. I'll find you houses.";

export function filterBar({ action = "/homes/map/", params, features = false, compact = false, map = false, ask = "" }) {
  const p = new URLSearchParams(params);
  const L = labels(p);
  const has = new Set((p.get("has") || "").split(",").filter(Boolean));
  const ticks = (list) => list.filter(([key]) => isFeature(key)).map(([key, word]) => `<label class="hx-tick"><input type="checkbox" name="has" value="${esc(key)}" data-cur${has.has(key) ? " checked" : ""}><span>${esc(word)}</span></label>`).join("");
  const curated = new Set([...HOUSE_TICKS, ...LISTING_TICKS, ...AREA_TICKS].map(([key]) => key).filter(isFeature));
  // Kept as is: what has no control in this bar.
  const keep = ["city", "subdivision", "near", "miles", "zip", "sort", "yearMax", "sold", "not", ...(features ? [] : ["has", "yearMin", "lotMin", "hoaMax", "garage", "domMax", "sqft"])]
    .filter((x) => p.get(x)).map((x) => `<input type="hidden" name="${x}" value="${esc(p.get(x))}">`).join("");
  const prices = (name, cur) => `<select name="${name}" aria-label="${name === "min" ? "Lowest price" : "Highest price"}">${opt("", name === "min" ? "No min" : "No max", cur)}${[...new Set([...PRICE_STEPS, +cur || 0])].filter(Boolean).sort((a, b) => a - b).map((v) => opt(v, k(v), cur)).join("")}</select>`;
  const quick = [["", "300000", "Under $300K"], ["300000", "500000", "$300K to $500K"], ["500000", "1000000", "$500K to $1M"], ["1000000", "", "$1M+"]]
    .map(([a, b, t]) => `<button type="button" class="hx-quick" data-min="${a}" data-max="${b}">${t}</button>`).join("");
  const saleP = `<p class="hx-pop-h">Show</p><div class="hx-list"><label><input type="radio" name="all" value=""${p.get("all") === "1" ? "" : " checked"}><span>For sale</span></label><label><input type="radio" name="all" value="1"${p.get("all") === "1" ? " checked" : ""}><span>For sale and under contract</span></label></div>`;
  const priceP = `<p class="hx-pop-h">Price</p><div class="hx-pop-2"><label>Min${prices("min", p.get("min"))}</label><label>Max${prices("max", p.get("max"))}</label></div><div class="hx-quicks">${quick}</div>`;
  const bedsP = `<p class="hx-pop-h">Bedrooms</p>${seg("beds", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"], ["5", "5+"]], p.get("beds"))}<p class="hx-pop-h">Bathrooms</p>${seg("baths", [["", "Any"], ["1", "1+"], ["2", "2+"], ["3", "3+"], ["4", "4+"]], p.get("baths"))}`;
  const typeP = `<p class="hx-pop-h">Home type</p><div class="hx-list">${TYPES.map(([v, l]) => `<label><input type="radio" name="type" value="${esc(v)}"${(p.get("type") || "") === v ? " checked" : ""}><span>${esc(l)}</span></label>`).join("")}</div>`;
  const hoaCur = p.get("hoa") === "0" ? "0" : p.get("hoaMax") || "";
  const sel = (name, list, cur, word, attr) => `<select name="${name}"${attr || ""}>${withCur(list, cur, word).map(([v, l]) => opt(v, l, cur)).join("")}</select>`;
  const waterTick = `<label class="hx-tick"><input type="checkbox" name="waterfront" value="1"${p.get("waterfront") === "1" ? " checked" : ""}><span>Waterfront</span></label>`;
  const groups = `<p class="hx-pop-h">Every MLS feature</p><label class="hx-fsearch"><input type="search" data-hx-fsearch placeholder="Pool, dock, walk to the beach, golf cart..." aria-label="Find a feature" autocomplete="off"></label>`
    + `<div class="hx-feats-live" data-hx-feats data-has="${esc([...has].filter((x) => !curated.has(x)).join(","))}">${[...has].filter((x) => !curated.has(x)).length ? `<input type="hidden" name="has" value="${esc([...has].filter((x) => !curated.has(x)).join(","))}">` : ""}<p class="hx-feats-wait">Loading every MLS feature...</p></div>`;
  const moreP = features
    ? `<div class="hx-mod-h"><p>Filters</p><button type="button" class="hx-mod-x" data-hx-close-pop aria-label="Close">&times;</button></div><div class="hx-mod-b">`
      + `<p class="hx-pop-h">The home</p>${bedsP}${typeP}`
      + `<div class="hx-pop-3"><label>Size${sel("sqft", SQFT, p.get("sqft"), (v) => `${(+v).toLocaleString("en-US")}+ sq ft`)}</label><label>Lot size${sel("lotMin", LOTS, p.get("lotMin"), (v) => `${v} acres or more`)}</label>`
      + `<label>Year built${sel("yearMin", YEARS, p.get("yearMin"), (v) => `${v} or newer`)}</label><label>Garage${sel("garage", GARAGE, p.get("garage"), (v) => `${v}+ car`)}</label>`
      + `<label>HOA fee${sel("hoaPick", HOA, hoaCur, (v) => `Up to $${(+v).toLocaleString("en-US")} a month`, " data-hx-hoa")}</label></div>`
      + `<div class="hx-ticks">${waterTick}${ticks(HOUSE_TICKS)}</div>`
      + `<button type="button" class="hx-seemore" data-hx-seemore aria-expanded="false">See more filters: the listing, commute and area</button><div class="hx-more-rest" hidden>`
      + `<p class="hx-pop-h">The listing</p><div class="hx-pop-3"><label>Listed${sel("domMax", DOM, p.get("domMax"), (v) => `Last ${v} days`)}</label></div><div class="hx-ticks">${ticks(LISTING_TICKS)}</div>`
      + `<p class="hx-pop-h">Commute and places</p><p class="hx-mod-n">Homes within a few miles of a place you go every day. Two at most.</p>`
      + `<div class="hx-commute" data-hx-commute data-has="${esc([...has].join(","))}">${[0, 1].map((i) => `<div class="hx-pop-2"><label>Near<select data-lm="${i}" aria-label="Place"><option value="">Pick a place</option></select></label><label>Within<select data-mi="${i}" aria-label="Miles"><option value="10">10 miles, about 20 minutes</option><option value="5">5 miles</option><option value="2">2 miles</option><option value="1">1 mile</option></select></label></div>`).join("")}<input type="hidden" name="has" value="" data-hx-commute-out></div>`
      + `<p class="hx-pop-h">The area</p><div class="hx-ticks">${ticks(AREA_TICKS)}</div>${groups}</div></div>`
      + `<div class="hx-mod-f"><button type="button" class="hx-mod-reset" data-hx-reset>Reset all</button><button type="submit" class="hx-pop-go">Show homes</button></div>`
    : `<p class="hx-pop-h">More filters</p>${waterTick}<label class="hx-tick"><input type="checkbox" name="hoa" value="0"${p.get("hoa") === "0" ? " checked" : ""}><span>No HOA, as listed by the listing agent</span></label>`;
  const more = pop("more", "Filters", L.more, moreP, true).replace('<details class="hx-pop', `<details class="hx-pop${features ? " hx-modal" : ""}`).replace(/<button type="submit" class="hx-pop-go">Show homes<\/button><\/div><\/details>$/, features ? "</div></details>" : '<button type="submit" class="hx-pop-go">Show homes</button></div></details>');
  return `<form class="hx-fb${compact ? " hx-fb-c" : ""}${map ? " hx-fb-map" : ""}" action="${esc(action)}" method="get" data-hx-fb${map ? " data-hx-map-fb" : ""}${compact ? " data-hx-fb-c" : ""} aria-label="Search homes">${keep}`
    /* The AI search comes first, on its own row, and says it is AI (owner, 2026-10-29: "tell me everything you
       want and why I'll find you houses"). It reads goals as well as features (map.js ai()). The filters
       follow, price first. */
    + `<div class="hx-fb-ai"><p class="hx-ai-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/></svg>AI-powered search</p>`
    + `<label class="hx-fb-q"><textarea name="q" rows="1" enterkeyhint="search" autocomplete="off" maxlength="400" aria-label="${esc(ask || AI_ASK)}" placeholder="${esc(ask || AI_ASK)}">${esc(p.get("q") || "")}</textarea><button type="submit" class="hx-fb-go">Find houses</button></label></div>`
    + `<div class="hx-fb-pills">${pop("price", "Price", L.price, priceP)}${pop("beds", "Beds & baths", L.bb, bedsP)}${pop("type", "Home type", L.type, typeP)}${pop("sale", "For sale", p.get("all") === "1" ? "With under contract" : "", saleP)}${more}</div>`
    + `</form>`;
}

/** Chips for the features in force (the search page's removable chips). */
export const featureChipLabel = (key) => featureLabel(key);

export const FILTER_STYLE = `
.hx-fb{display:flex;flex-wrap:wrap;gap:.55rem;align-items:center;margin:.9rem 0 1rem;position:relative;z-index:5}
.hx-fb-ai{flex:1 1 100%;display:flex;flex-direction:column;gap:.4rem}.hx-fb-ai .hx-fb-q{flex:none}
.hx-ai-badge{display:inline-flex;align-items:center;gap:.35rem;margin:0;font-size:.78rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--brass-ink,#91592b)}
.hx-ai-badge svg{width:16px;height:16px;fill:#c4783a}
.hx-fb-q{display:flex;align-items:center;gap:.5rem;min-height:3.4rem;padding:0 .45rem 0 1.15rem;border-radius:999px;background:#fff;border:1.5px solid rgba(196,120,58,.55);box-shadow:0 6px 22px rgba(196,120,58,.14)}
.hx-fb-q:focus-within{border-color:var(--brass-ink,#91592b);box-shadow:0 0 0 3px rgba(196,120,58,.18)}
.hx-fb-q textarea{flex:1;min-width:0;height:2.9rem;padding:.72rem 0;border:0;outline:none;background:none;font:inherit;font-size:1.02rem;line-height:1.4;color:var(--ink,#1c2028);resize:none;overflow:hidden}
.hx-fb-pills{display:flex;flex-wrap:wrap;gap:.45rem}
.hx-pop{position:relative}
.hx-pop>summary{list-style:none;display:flex;align-items:center;gap:.5rem;min-height:2.75rem;padding:0 1rem;border-radius:999px;background:#fff;border:1px solid rgba(28,32,40,.14);box-shadow:0 1px 3px rgba(28,32,40,.08);font-size:.92rem;font-weight:600;color:var(--ink,#1c2028);cursor:pointer;white-space:nowrap;user-select:none;transition:border-color .15s,box-shadow .15s}
.hx-pop>summary::-webkit-details-marker{display:none}
.hx-pop>summary svg{width:11px;height:8px;fill:none;stroke:#c4783a;stroke-width:1.8;transition:transform .15s}
.hx-pop[open]>summary svg{transform:rotate(180deg)}
.hx-pop>summary:hover{border-color:rgba(196,120,58,.6);box-shadow:0 4px 14px rgba(28,32,40,.1)}
.hx-pop[open]>summary{border-color:#c4783a;box-shadow:0 0 0 3px rgba(196,120,58,.18)}
.hx-pop.hx-on>summary{background:var(--ink,#1c2028);border-color:var(--ink,#1c2028);color:#fff}
.hx-pop-p{position:absolute;top:calc(100% + .55rem);left:0;width:min(22rem,calc(100vw - 2rem));max-height:min(70vh,34rem);overflow:auto;padding:1.15rem 1.2rem 1.2rem;border-radius:20px;background:#fff;box-shadow:0 24px 60px rgba(28,32,40,.24),0 2px 6px rgba(28,32,40,.06);border:1px solid rgba(28,32,40,.07)}
.hx-pop-w .hx-pop-p{width:min(30rem,calc(100vw - 2rem))}.hx-pop[data-k=more] .hx-pop-p{left:auto;right:0}
.hx-fb:has(details[open]){z-index:10000}
.hx-fb-err{flex-basis:100%;margin:.1rem 0 0;font-size:.85rem;color:#8a2d1c}
.hx-pop-h{margin:.2rem 0 .5rem;font-size:.72rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--slate,#5c6b78)}
.hx-pop-h~.hx-pop-h{margin-top:.95rem}
.hx-pop-2,.hx-pop-3{display:grid;grid-template-columns:1fr 1fr;gap:.55rem}.hx-pop-3{margin:.2rem 0 .7rem}
.hx-pop-p label{display:flex;flex-direction:column;gap:.25rem;font-size:.78rem;font-weight:600;color:var(--slate,#5c6b78)}
.hx-pop-2>*,.hx-pop-3>*{min-width:0}.hx-pop-p select{width:100%;min-width:0;min-height:2.85rem;padding:0 2.2rem 0 .85rem;border-radius:12px;border:1px solid rgba(28,32,40,.16);background:#faf8f4 url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%278%27 viewBox=%270 0 12 8%27%3E%3Cpath d=%27M1 1.5l5 5 5-5%27 fill=%27none%27 stroke=%27%23c4783a%27 stroke-width=%271.8%27/%3E%3C/svg%3E") no-repeat right .85rem center;-webkit-appearance:none;appearance:none;font:inherit;font-size:.95rem;font-weight:600;color:var(--ink,#1c2028);cursor:pointer}
.hx-pop-p select:hover{border-color:rgba(196,120,58,.6)}.hx-pop-p select:focus{outline:none;border-color:#c4783a;box-shadow:0 0 0 3px rgba(196,120,58,.18)}
.hx-quicks{display:flex;flex-wrap:wrap;gap:.35rem;margin-top:.6rem}
.hx-quick{padding:.5rem .8rem;border-radius:999px;border:1px solid rgba(28,32,40,.14);background:#fff;font:inherit;font-size:.85rem;font-weight:600;color:var(--ink,#1c2028);cursor:pointer;transition:background .15s,border-color .15s}
.hx-quick:hover{border-color:#c4783a;background:rgba(196,120,58,.08)}
.hx-seg{display:flex;border:1px solid rgba(28,32,40,.16);border-radius:12px;overflow:hidden}
.hx-seg label{flex:1;display:block;position:relative}
.hx-seg input,.hx-list input,.hx-feats input{position:absolute;opacity:0;pointer-events:none}
.hx-seg span{display:block;text-align:center;padding:.6rem .2rem;font-size:.9rem;font-weight:600;color:var(--ink,#1c2028);cursor:pointer;border-left:1px solid rgba(28,32,40,.1)}
.hx-seg label:first-child span{border-left:0}
.hx-seg input:checked+span{background:var(--ink,#1c2028);color:#fff}
.hx-list{display:grid;gap:.3rem}.hx-list-2{grid-template-columns:1fr 1fr}
.hx-list label,.hx-feats label{position:relative;display:block}
.hx-feats label[hidden],.hx-feats[hidden],.hx-feats-live .hx-pop-h[hidden]{display:none!important}
.hx-list span{display:block;padding:.55rem .75rem;border-radius:10px;font-size:.92rem;font-weight:500;color:var(--ink,#1c2028);cursor:pointer;background:#faf8f4}
.hx-list input:checked+span{background:var(--ink,#1c2028);color:#fff}
.hx-feats{display:flex;flex-wrap:wrap;gap:.35rem}
.hx-fsearch{display:block!important;margin:0 0 .6rem}.hx-fsearch input{width:100%;min-height:2.6rem;padding:0 .8rem;border-radius:10px;border:1px solid rgba(28,32,40,.18);background:#faf8f4;font:inherit;font-size:.92rem}
.hx-feats-wait{font-size:.85rem;color:var(--slate,#5c6b78);margin:.2rem 0}
.hx-feats-live .hx-pop-h{margin-top:.8rem}
.hx-feats span small{color:var(--slate,#5c6b78);font-weight:400;margin-left:.3rem}.hx-feats input:checked+span small{color:rgba(255,255,255,.7)}
.hx-feats-note{font-size:.8rem;color:#8a2d1c;margin:.4rem 0 0}
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
.hx-fb-go{flex:none;border:0;border-radius:999px;background:linear-gradient(180deg,#d4894a,#c4783a);color:#151a22;font:inherit;font-weight:700;font-size:.9rem;padding:.7rem 1.15rem;cursor:pointer;white-space:nowrap}
.hx-fb-go:hover{background:#c4783a}
.hx-fb-q textarea::placeholder{color:#6b7480}
/* The Filters window (owner, 2026-10-28: Zillow's, with our look): the house first, then See more. */
.hx-fb .hx-modal>.hx-pop-p{position:fixed;left:50%;right:auto;top:calc(var(--hx-top,0px) + 1rem);bottom:1rem;transform:translateX(-50%);width:min(40rem,calc(100vw - 2rem))!important;max-height:52rem;padding:0;display:flex;flex-direction:column;overflow:hidden;z-index:10002;border-radius:20px}
.hx-modal[open]>summary::before{content:"";position:fixed;inset:0;background:rgba(21,26,34,.5);z-index:10001;cursor:default}
.hx-mod-h{display:flex;align-items:center;justify-content:space-between;padding:1rem 1.25rem;border-bottom:1px solid rgba(28,32,40,.1)}
.hx-mod-h p{margin:0;font-family:var(--serif,Georgia,serif);font-size:1.35rem;color:var(--ink,#1c2028)}
.hx-mod-x{width:2.4rem;height:2.4rem;border:0;border-radius:999px;background:#f1ede6;font-size:1.5rem;line-height:1;cursor:pointer;color:var(--ink,#1c2028)}
.hx-mod-b{flex:1;overflow:auto;padding:1rem 1.25rem 1.25rem}
.hx-mod-b>.hx-pop-h:first-child{margin-top:0}
.hx-mod-b .hx-list{grid-template-columns:repeat(3,minmax(0,1fr))}
.hx-mod-b .hx-pop-3{grid-template-columns:repeat(3,minmax(0,1fr));margin-top:.9rem}
.hx-ticks{display:grid;grid-template-columns:1fr 1fr;gap:0 1rem;margin:.6rem 0 .2rem}
.hx-seemore{display:block;width:100%;margin:1rem 0 .4rem;padding:.8rem 1rem;border:1.5px dashed rgba(196,120,58,.55);border-radius:14px;background:rgba(196,120,58,.06);color:var(--brass-ink,#91592b);font:inherit;font-weight:700;font-size:.92rem;cursor:pointer;text-align:left}
.hx-more-rest[hidden]{display:none}
.hx-mod-n{margin:-.2rem 0 .6rem;font-size:.85rem;color:var(--slate,#5c6b78)}
.hx-commute .hx-pop-2{margin-bottom:.5rem}
.hx-mod-f{display:flex;justify-content:space-between;align-items:center;gap:1rem;padding:.85rem 1.25rem;border-top:1px solid rgba(28,32,40,.1);background:#fff}
.hx-mod-f .hx-pop-go{width:auto;margin:0;padding:0 1.6rem;background:var(--brass,#c4783a);color:#151a22}
.hx-mod-reset{border:0;background:none;font:inherit;font-weight:600;color:var(--ink,#1c2028);text-decoration:underline;cursor:pointer}
html.hx-modal-open{overflow:hidden}
.hx-fb-c .hx-fb-q{min-height:2.9rem}.hx-fb-c .hx-fb-q textarea{font-size:.95rem}.hx-fb-c .hx-fb-go{padding:.4rem .85rem;font-size:.8rem}
@media (max-width:640px){.hx-fb-q{border-radius:22px;align-items:flex-end;padding:.2rem .4rem .4rem 1rem}.hx-fb-q textarea{height:4.4rem;padding:.6rem 0}.hx-fb-go{padding:.6rem .9rem;font-size:.85rem}.hx-fb .hx-modal>.hx-pop-p{left:0!important;right:0!important;top:var(--hx-top,0px);bottom:0;transform:none;width:100%!important;max-height:none;border-radius:0}
 .hx-mod-b .hx-list{grid-template-columns:1fr 1fr}.hx-mod-b .hx-pop-3{grid-template-columns:1fr 1fr}.hx-ticks{grid-template-columns:1fr}}
@media (max-width:640px){.hx-fb-pills{flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;width:100%;padding-bottom:.2rem}.hx-fb-pills::-webkit-scrollbar{display:none}
.hx-pop{position:static}.hx-fb .hx-pop-p{position:fixed;left:.75rem!important;right:.75rem!important;top:auto;bottom:.75rem;width:auto!important;max-height:72vh;border-radius:20px;z-index:1000;box-shadow:0 -10px 60px rgba(28,32,40,.35)}
body:has(.hx-fb details[open]) #c3-fab{display:none}}
`;

export const FILTER_SCRIPT = `<script>(function(){
var forms=document.querySelectorAll("form[data-hx-fb]");
function closeAll(except){document.querySelectorAll("details.hx-pop[open]").forEach(function(d){if(d!==except)d.removeAttribute("open")})}
document.addEventListener("click",function(e){if(!e.target.closest||!e.target.closest("details.hx-pop"))closeAll(null)});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll(null);var t=e.target;if(e.key==="Enter"&&!e.shiftKey&&t&&t.tagName==="TEXTAREA"&&t.name==="q"&&t.form){e.preventDefault();if(t.form.requestSubmit)t.form.requestSubmit();else t.form.submit()}});
function paramsOf(f){var p=new URLSearchParams();var has=[];
 Array.prototype.forEach.call(f.elements,function(x){if(!x.name||x.disabled)return;
  if((x.type==="radio"||x.type==="checkbox")&&!x.checked)return;
  if(x.name==="has"){x.value.split(",").forEach(function(k){if(k&&has.indexOf(k)<0)has.push(k)});return}
  if(x.name==="hoaPick"){if(x.value==="0")p.set("hoa","0");else if(x.value)p.set("hoaMax",x.value);return}
  if(x.name==="q"){var v=x.value.trim();if(v)p.set("q",v);return}
  if(x.value!=="")p.set(x.name,x.value)});
 if(has.length)p.set("has",has.join(","));return p}
/* The map page applies a search where it is; anywhere else a search opens the map with it (owner, 2026-10-28). */
function go(f){var p=paramsOf(f);closeAll(null);
 if(f.hasAttribute("data-hx-map-fb")){document.dispatchEvent(new CustomEvent("hx-search",{detail:p}));return}
 location.href=(f.getAttribute("action")||"/homes/map/")+(p.toString()?"?"+p.toString():"")}
window.hxParamsOf=paramsOf;
var featsP=null;function feats(){if(!featsP)featsP=fetch("/homes/api/filters",{credentials:"same-origin"}).then(function(r){return r.json()}).catch(function(){return null});return featsP}
window.hxFeats=feats;
var WORD={nmb:"NMB",mcleod:"McLeod",icw:"ICW",at:"at",the:"the",of:"of"};
var NAME={beach:"The beach",icw:"The Intracoastal Waterway"};
function place(id){if(NAME[id])return NAME[id];return id.split("_").map(function(w,i){return WORD[w]&&(i||w.length<4)?WORD[w]:w.charAt(0).toUpperCase()+w.slice(1)}).join(" ")}
/* Commute and places: two pickers that make one distance feature each, from the CRM's list. */
function commute(f,j){var box=f.querySelector("[data-hx-commute]");if(!box||box.getAttribute("data-done"))return;box.setAttribute("data-done","1");
 var lm={},keys={};j.groups.forEach(function(g){g.items.forEach(function(it){keys[it.k]=1;if(!it.d)return;var m=it.k.split("_"),last=m[m.length-1];
  if(last.slice(-2)!=="mi"||isNaN(+last.slice(0,-2)))return;lm[m.slice(0,-1).join("_")]=1})});
 var ids=Object.keys(lm).sort(function(a,b){return place(a)<place(b)?-1:1}),cur=(box.getAttribute("data-has")||"").split(",").filter(function(k){var m=k.split("_");return lm[m.slice(0,-1).join("_")]});
 var out=box.querySelector("[data-hx-commute-out]");
 [0,1].forEach(function(i){var s=box.querySelector("[data-lm='"+i+"']"),mi=box.querySelector("[data-mi='"+i+"']");ids.forEach(function(id){var o=document.createElement("option");o.value=id;o.textContent=place(id);s.appendChild(o)});
  if(cur[i]){var m=cur[i].split("_");s.value=m.slice(0,-1).join("_");mi.value=m[m.length-1].slice(0,-2)}});
 function sync(){var v=[];[0,1].forEach(function(i){var s=box.querySelector("[data-lm='"+i+"']").value,mi=box.querySelector("[data-mi='"+i+"']").value;if(!s)return;
  var k=[mi,"10","5","2","1"].map(function(n){return s+"_"+n+"mi"}).filter(function(x){return keys[x]})[0];if(k&&v.indexOf(k)<0)v.push(k)});out.value=v.join(",")}
 box.addEventListener("change",sync);sync();
 /* The same places are not drawn twice in the full list below. */
 cur.forEach(function(k){var t=f.querySelector("[data-hx-feats] input[type=hidden][name=has]");if(t)t.value=t.value.split(",").filter(function(x){return x!==k}).join(",")})}
function drawFeats(f){var box=f.querySelector("[data-hx-feats]");if(!box||box.getAttribute("data-done"))return;box.setAttribute("data-done","1");
 var on={};(box.getAttribute("data-has")||"").split(",").forEach(function(k){if(k)on[k]=1});
 var skip={};Array.prototype.forEach.call(f.querySelectorAll("input[data-cur]"),function(x){skip[x.value]=1});
 feats().then(function(j){if(!j||!j.ok||!j.groups){box.querySelector(".hx-feats-wait").textContent="The feature list is not available right now.";return}
  commute(f,j);
  var h=box.querySelector("input[type=hidden][name=has]");if(h)h.remove();box.innerHTML="";
  j.groups.forEach(function(g){var hd=document.createElement("p");hd.className="hx-pop-h";hd.textContent=g.name;var w=document.createElement("div");w.className="hx-feats";
   g.items.forEach(function(it){if(skip[it.k]||it.d)return;var l=document.createElement("label");l.setAttribute("data-words",(it.l+" "+it.k).toLowerCase());var i=document.createElement("input");i.type="checkbox";i.name="has";i.value=it.k;if(on[it.k])i.checked=true;
    var sp=document.createElement("span");sp.textContent=it.l;var sm=document.createElement("small");sm.textContent=it.n.toLocaleString("en-US");sp.appendChild(sm);l.appendChild(i);l.appendChild(sp);w.appendChild(l)});
   if(w.children.length){box.appendChild(hd);box.appendChild(w)}});
  var q=f.querySelector("[data-hx-fsearch]");if(q)q.addEventListener("input",function(){var v=q.value.trim().toLowerCase();Array.prototype.forEach.call(box.querySelectorAll("label[data-words]"),function(l){l.hidden=!!v&&l.getAttribute("data-words").indexOf(v)<0});
   Array.prototype.forEach.call(box.querySelectorAll(".hx-feats"),function(w){var any=w.querySelector("label:not([hidden])");w.hidden=!any;w.previousSibling.hidden=!any})})})}
function reset(f){Array.prototype.forEach.call(f.elements,function(x){if(!x.name&&!x.hasAttribute("data-lm"))return;
 if(x.type==="radio")x.checked=x.value==="";else if(x.type==="checkbox")x.checked=false;else if(x.type==="hidden"){if(x.name==="has"||x.hasAttribute("data-hx-commute-out"))x.value="";else x.remove()}else if(x.tagName==="SELECT")x.selectedIndex=0;else x.value=""})}
Array.prototype.forEach.call(forms,function(f){var compact=f.hasAttribute("data-hx-fb-c");
 Array.prototype.forEach.call(f.querySelectorAll("details.hx-pop"),function(d){d.setAttribute("data-label",{sale:"For sale",price:"Price",beds:"Beds & baths",type:"Home type",more:"Filters"}[d.getAttribute("data-k")]||"");
  d.addEventListener("toggle",function(){if(d.open){closeAll(d);if(d.getAttribute("data-k")==="more"){drawFeats(f);var hd=document.querySelector("header");document.documentElement.style.setProperty("--hx-top",(hd?Math.max(0,Math.round(hd.getBoundingClientRect().bottom)):0)+"px")}}document.documentElement.classList.toggle("hx-modal-open",!!f.querySelector("details.hx-modal[open]"))})});
 f.addEventListener("submit",function(e){e.preventDefault();go(f)});
 f.addEventListener("change",function(e){var t=e.target;if(compact)return;if(t.closest("details[data-k=more]"))return;if(t.name==="q"||t.hasAttribute("data-hx-fsearch"))return;go(f)});
 f.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest("[data-hx-close-pop],[data-hx-seemore],[data-hx-reset]");if(!t)return;
  if(t.hasAttribute("data-hx-close-pop")){closeAll(null);document.documentElement.classList.remove("hx-modal-open");return}
  if(t.hasAttribute("data-hx-seemore")){var r=f.querySelector(".hx-more-rest");r.hidden=!r.hidden;t.setAttribute("aria-expanded",r.hidden?"false":"true");t.textContent=r.hidden?"See more filters: the listing, commute and area":"Fewer filters";return}
  reset(f);if(!compact)go(f)});
 Array.prototype.forEach.call(f.querySelectorAll(".hx-quick"),function(b){b.addEventListener("click",function(){f.elements.min.value=b.getAttribute("data-min");f.elements.max.value=b.getAttribute("data-max");if(!compact)go(f)})});
});
})();</script>`;
