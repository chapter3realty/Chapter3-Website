/**
 * Matching an address the visitor typed to a listing (the rental analyzer's lookup, functions/homes/[[path]].js).
 */
/** The house number and the first word of the street name, for matching an address. */
export function streetKey(a) {
  const m = /^\s*(\d+[a-z]?)\s+(?:(?:n|s|e|w|north|south|east|west)\.?\s+)?([a-z0-9]+)/i.exec(String(a || ""));
  return m ? `${m[1].toLowerCase()} ${m[2].toLowerCase()}` : "";
}
/** The street's direction (N, S, E or W), or "" (2026-11-14: "1100 S Ocean Blvd" in Surfside Beach once matched "1100 N Ocean Blvd" in North Myrtle Beach). */
export function streetDir(a) {
  const m = /^\s*\d+[a-z]?\s+(n|s|e|w|north|south|east|west)\.?\s/i.exec(String(a || ""));
  return m ? m[1][0].toLowerCase() : "";
}
const townKey = (t) => String(t || "").toLowerCase().replace(/[^a-z]/g, "");
/**
 * The same home: the same number and street word, the same direction when both name one, and, when the visitor gave
 * a town or a ZIP code, the same town or the same ZIP. A listing in another town is never taken for the one asked.
 */
export function sameHome(l, street, city, zip) {
  if (!l || !l.address || streetKey(l.address) !== streetKey(street)) return false;
  const d1 = streetDir(l.address), d2 = streetDir(street);
  if (d1 && d2 && d1 !== d2) return false;
  const c = townKey(city), z = /^\d{5}$/.test(zip || "") ? zip : "";
  if (!c && !z) return true;
  return !!((c && townKey(l.city) === c) || (z && String(l.postalCode || "") === z));
}
