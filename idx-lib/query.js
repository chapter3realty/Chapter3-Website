/**
 * The search box in plain words: "3 bed house under 400k in Conway", "waterfront condo
 * North Myrtle Beach", "Market Common". Read into the search's own filters (contract §5)
 * and nothing else: a word we cannot read is dropped, never passed on to the CRM.
 * Returns { params, place, understood } where place is a /homes/near/<slug>/ community.
 */
import { PLACES } from "./places.js";

export const CITIES = ["Myrtle Beach", "North Myrtle Beach", "Surfside Beach", "Garden City", "Murrells Inlet", "Pawleys Island", "Little River", "Conway", "Longs", "Loris", "Aynor", "Calabash"];
const ALIAS = { nmb: "North Myrtle Beach", "n myrtle beach": "North Myrtle Beach", "north myrtle": "North Myrtle Beach", surfside: "Surfside Beach", pawleys: "Pawleys Island", "murrells": "Murrells Inlet" };
const TYPE_WORDS = [
  [/\b(single[- ]family|houses?)\b/, "house"],
  [/\b(condos?|condominiums?)\b/, "condo"],
  [/\b(town ?houses?|town ?homes?)\b/, "townhouse"],
  [/\b(mobile|manufactured)( homes?)?\b/, "manufactured"],
  [/\b(duplex|triplex|fourplex|quadplex|multi[- ]family)\b/, "multi"],
  [/\b(land|lots?|acreage)\b/, "land"],
];
const WATER = /\b(waterfront|water front|on the water|oceanfront|ocean front|lakefront|lake front|riverfront|river front|on the waterway|marsh front)\b/;

/* Phrases a buyer uses, read into the CRM's features and ranges (owner, 2026-10-28: "fixer upper",
   "rental homes"). Each is [words, what they mean]. A feature the CRM does not list is dropped later
   (featureList). Distances use 10 miles for "near an employer": about 20 minutes by car here. */
const PHRASES = [
  [/\b(fixer[- ]?uppers?|fixers?|needs? (some )?work|handyman( special)?|tlc|as[- ]is|investor special|distressed|rehab|flip)\b/, { has: ["distressed_sale"] }],
  [/\b(foreclosures?|bank[- ]owned|reo)\b/, { has: ["foreclosure"] }],
  [/\bshort sales?\b/, { has: ["short_sale"] }],
  [/\b(airbnb|vrbo|short[- ]term rentals?|nightly rentals?|vacation rentals?)\b/, { has: ["str_allowed"] }],
  [/\b(rental homes?|rentals?|rental property|investment (homes?|property)|income property|long[- ]term rentals?)\b/, { has: ["rentals_allowed"] }],
  [/\b(one[- ](story|level)|single[- ](story|level)|ranch|no stairs)\b/, { has: ["one_level"] }],
  [/\b(private )?pools?\b/, { has: ["pool"] }],
  [/\b(boat )?docks?\b/, { has: ["private_dock"] }],
  [/\b(walk(ing distance)? to (the )?beach|steps to the (beach|sand))\b/, { has: ["walk_to_beach"] }],
  [/\b(near|close to|by) the (beach|ocean)\b/, { has: ["near_beach"] }],
  [/\beast of (hwy |highway )?17\b/, { has: ["east_of_17"] }],
  [/\bgolf carts?\b/, { has: ["golf_cart_ok"] }],
  [/\b(on the )?golf( course)?\b/, { has: ["on_golf_course"] }],
  [/\b(price (cut|drop|reduced|reduction)|reduced)\b/, { has: ["price_reduced"] }],
  [/\bopen houses?\b/, { has: ["open_house"] }],
  [/\b(new construction|new build|brand new|newly built)\b/, { has: ["new_construction"] }],
  [/\b(move[- ]in ready|quick move[- ]in)\b/, { has: ["quick_move_in"] }],
  [/\bfurnished\b/, { has: ["furnished"] }],
  [/\bfha\b/, { has: ["fha_accepted"] }],
  [/\b(va loan|va accepted|veterans?)\b/, { has: ["va_accepted"] }],
  [/\bassumable\b/, { has: ["assumable_loan"] }],
  [/\b(gated|gate)\b/, { has: ["gated"] }],
  [/\b(clubhouse)\b/, { has: ["clubhouse"] }],
  [/\b(community pool)\b/, { has: ["community_pool"] }],
  [/\boutside (the )?city limits\b/, { has: ["outside_city_limits"] }],
  [/\b(no hoa|without (an )?hoa|no association)\b/, { hoa: "0" }],
  [/\b(big|large) (lot|yard)\b/, { lotMin: "0.5" }],
  [/\b(acreage|acres?)\b/, { lotMin: "1" }],
  [/\b(3|three)[- ]car garage\b/, { garage: "3" }],
  [/\b(2|two)[- ]car garage\b/, { garage: "2" }],
  [/\bgarage\b/, { garage: "1" }],
  [/\b(newer|new) (homes?|houses?|condos?)\b/, { yearMin: "2015" }],
  [/\b(older|old|historic) (homes?|houses?)\b/, { yearMax: "1980" }],
  // Employers and places, as the jobs guide's box asks: "name your industry or employer".
  [/\b(grand strand (medical|regional)|gsmc)\b/, { has: ["grand_strand_medical_center_10mi"] }],
  [/\bconway medical\b/, { has: ["conway_medical_center_10mi"] }],
  [/\bmcleod\b/, { has: ["mcleod_seacoast_10mi"] }],
  [/\btidelands\b/, { has: ["tidelands_waccamaw_10mi"] }],
  [/\b(nurses?|nursing|doctors?|hospitals?|medical|health ?care|physicians?)\b/, { has: ["grand_strand_medical_center_10mi"] }, { generic: true }],
  [/\b(airport|airlines?|aviation|pilots?)\b/, { has: ["myrtle_beach_airport_5mi"] }],
  [/\b(coastal carolina( university)?|ccu|university|professors?|college)\b/, { has: ["downtown_conway_10mi"] }],
  [/\b(boardwalk|tourism|hospitality|hotels?|resorts?)\b/, { has: ["myrtle_beach_boardwalk_5mi"] }, { generic: true }],
  [/\bbroadway at the beach\b/, { has: ["broadway_at_the_beach_5mi"] }],
  [/\bbarefoot landing\b/, { has: ["barefoot_landing_5mi"] }],
  [/\bmarket common\b/, { has: ["market_common_5mi"] }],
  [/\b(retail|coastal grand( mall)?|mall)\b/, { has: ["coastal_grand_mall_5mi"] }, { generic: true }],
  [/\b(brookgreen( gardens)?)\b/, { has: ["brookgreen_gardens_5mi"] }],
];

function dollars(n, unit) {
  const v = parseFloat(String(n).replace(/,/g, ""));
  if (!isFinite(v)) return null;
  const u = (unit || "").toLowerCase();
  const d = u.startsWith("m") ? v * 1e6 : u.startsWith("k") || u.startsWith("t") ? v * 1e3 : v;
  return d >= 10000 && d <= 50000000 ? Math.round(d) : null;
}
const MONEY = String.raw`\$?\s*(\d[\d,]*(?:\.\d+)?)\s*(k|m|thousand|million)?\b`;

/** Community names from our guide pages, longest first, so "Market Common" beats "Market". */
const PLACE_NAMES = Object.entries(PLACES)
  .map(([slug, p]) => [slug, String(p.name || "").toLowerCase().replace(/,.*$/, "").trim()])
  .filter(([, n]) => n.length >= 4)
  .sort((a, b) => b[1].length - a[1].length);

export function readQuery(raw) {
  const params = new URLSearchParams();
  const understood = [];
  let t = ` ${String(raw || "").toLowerCase().slice(0, 200).replace(/[^a-z0-9$.,+\- ]/g, " ").replace(/\s+/g, " ")} `;
  // Remove what was read, so one word never counts twice; only when it was read.
  const take = (re, ok) => { const m = re.exec(t); if (m && (!ok || ok(m))) { t = t.replace(m[0], " "); return m; } return null; };

  let m = take(new RegExp(String.raw`(?:between |from )?${MONEY}\s*(?:-|to|and)\s*${MONEY}`), (x) => dollars(x[1], x[2] || x[4]) && dollars(x[3], x[4]));
  if (m) {
    const a = dollars(m[1], m[2] || m[4]), b = dollars(m[3], m[4]);
    params.set("min", String(Math.min(a, b))); params.set("max", String(Math.max(a, b))); understood.push("price");
  }
  m = take(new RegExp(String.raw`\b(?:under|below|less than|max|up to|no more than|<)\s*${MONEY}`), (x) => dollars(x[1], x[2]));
  if (m) { params.set("max", String(dollars(m[1], m[2]))); understood.push("max"); }
  m = take(new RegExp(String.raw`\b(?:over|above|more than|min|at least|starting at|>)\s*${MONEY}`), (x) => dollars(x[1], x[2]));
  if (m) { params.set("min", String(dollars(m[1], m[2]))); understood.push("min"); }

  m = take(/\b(\d{1,2})\s*(?:-|to)\s*\d{1,2}\s*(?:beds?|bedrooms?|br|bds?)\b/) || take(/\b(\d{1,2})\s*\+?\s*(?:or more )?(?:beds?|bedrooms?|br|bds?)\b/);
  if (m && +m[1] <= 20) { params.set("beds", m[1]); understood.push("beds"); }
  m = take(/\b(\d(?:\.5)?)\s*\+?\s*(?:baths?|bathrooms?|ba)\b/);
  if (m) { params.set("baths", m[1]); understood.push("baths"); }
  m = take(/\b(\d[\d,]{2,6})\s*\+?\s*(?:sq\.? ?ft|sqft|square feet|sf)\b/);
  if (m) { params.set("sqft", m[1].replace(/,/g, "")); understood.push("sqft"); }
  m = take(/\b(29\d{3}|28\d{3})\b/);
  if (m) { params.set("zip", m[1]); understood.push("zip"); }
  if (take(WATER)) { params.set("waterfront", "1"); understood.push("waterfront"); }

  // Full town names first, so "north myrtle beach" is never read as "north myrtle" and a stray "beach".
  for (const c of [...CITIES].sort((a, b) => b.length - a.length)) {
    if (params.has("city")) break;
    if (take(new RegExp(`\\b${c.toLowerCase()}\\b`))) params.set("city", c);
  }
  for (const [a, city] of Object.entries(ALIAS)) if (!params.has("city") && t.includes(` ${a} `)) { take(new RegExp(`\\b${a}\\b`)); params.set("city", city); }
  if (params.has("city")) understood.push("city");

  // A community from our guide pages: a named subdivision searches by its MLS words;
  // an area (a point on the map) opens its own page.
  let place = null;
  for (const [slug, name] of PLACE_NAMES) {
    if (!t.includes(` ${name} `)) continue;
    const q = PLACES[slug].q || {};
    if (q.subdivision) { params.set("subdivision", q.subdivision); understood.push("subdivision"); }
    else if (!params.has("city")) place = slug;
    t = t.replace(` ${name} `, " ");
    break;
  }

  // Buyer phrases into features and ranges, before the town and type words read what is left.
  const has = [];
  // A named employer or place wins over a line of work: "nurse at McLeod" is McLeod.
  for (const [re, what, how] of PHRASES) {
    if (how && how.generic && has.some((k) => /_\d+mi$/.test(k))) { take(re); continue; }
    if (!take(re)) continue;
    while (take(re)) { /* "single story ranch": both words are the same wish */ }
    for (const [k, v] of Object.entries(what)) {
      if (k === "has") { for (const f of v) if (!has.includes(f)) has.push(f); }
      else if (!params.has(k)) params.set(k, v);
    }
    understood.push("phrase");
  }
  if (has.length) params.set("has", has.join(","));

  for (const [re, type] of TYPE_WORDS) if (take(re)) { params.set("type", type); understood.push("type"); break; }
  // Nothing else read: the words may be a neighborhood's name as the MLS writes it.
  const rest = t.replace(/\b(in|near|for sale|homes?|for|the|a|with|and|sale)\b/g, " ").replace(/\s+/g, " ").trim();
  // A sentence longer than a name is a description, for the AI, not a neighborhood.
  if (!understood.length && !place && /^[a-z0-9 .,'&-]{3,60}$/.test(rest) && /[a-z]{3}/.test(rest) && rest.split(" ").length <= 3) { params.set("subdivision", rest); understood.push("subdivision"); }
  if (/\b(cheapest|lowest price|least expensive)\b/.test(t)) params.set("sort", "price_asc");
  else if (/\b(most expensive|highest price|luxury)\b/.test(t)) params.set("sort", "price_desc");
  const left = t.replace(/\b(in|near|for sale|homes?|houses?|for|the|a|an|with|and|or|sale|to|of|my|i|want|looking|need|buy|some|that|is|on|at|by|best|good|nice|great|close|area|work|works|working|job|jobs|employer|employed|live|living|place|quiet|home|style|type|kind|really|very|please|show|find|me|we|our|family)\b/g, " ").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
  return { params, place, understood, left: params.has("subdivision") && understood.includes("subdivision") && understood.length === 1 ? "" : left };
}
