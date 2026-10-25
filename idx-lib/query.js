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

  for (const [a, city] of Object.entries(ALIAS)) if (!params.has("city") && t.includes(` ${a} `)) { take(new RegExp(`\\b${a}\\b`)); params.set("city", city); }
  for (const c of [...CITIES].sort((a, b) => b.length - a.length)) {
    if (params.has("city")) break;
    if (take(new RegExp(`\\b${c.toLowerCase()}\\b`))) params.set("city", c);
  }
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

  for (const [re, type] of TYPE_WORDS) if (re.test(t)) { params.set("type", type); understood.push("type"); break; }
  // Nothing else read: the words may be a neighborhood's name as the MLS writes it.
  const rest = t.replace(/\b(in|near|for sale|homes?|for|the|a|with|and|sale)\b/g, " ").replace(/\s+/g, " ").trim();
  if (!understood.length && !place && /^[a-z0-9 .,'&-]{3,60}$/.test(rest) && /[a-z]{3}/.test(rest)) { params.set("subdivision", rest); understood.push("subdivision"); }
  if (/\b(cheapest|lowest price|least expensive)\b/.test(t)) params.set("sort", "price_asc");
  else if (/\b(most expensive|highest price|luxury)\b/.test(t)) params.set("sort", "price_desc");
  return { params, place, understood };
}
