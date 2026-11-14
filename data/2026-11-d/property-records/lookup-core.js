/* The property lookup on /buyers/property-records/: the parts that read each public source's answer.
 * Pure functions, no page and no network. The spec writes this file into the page's script as it is,
 * and lookup-test.js runs the same functions on the answers saved in raw/api/, so a change at the county
 * fails the test, not the page (LOOKUP-TOOL.md; PLAN "The test").
 *
 * Rules from the ledger (Blog-Brain batches/2026-11-d/property-records/facts.md and VERIFY.md):
 *   R1, R48  accept a match at score 90 or more, matched to a county address point or along the street.
 *   R4, R6   at a condo building, one point returns many parcels: never trust one unit's PIN for the building.
 *   R7, R8   FEMA first; the county's copy has no subtype, and stores shaded Zone X in FLD_ZONE.
 *   R13      a deed book and page only when both are digits; strip leading zeros from both.
 *   R15      the tax search opens with ?PIN=.
 * No owner name, value or sale price is asked of any source. Nothing is stored.
 * Plain ES2017: the same text runs in node and in a browser. */

var PR_SRC = {
  locator: "https://gisportal.horrycounty.org/server/rest/services/Locators/County_Locator/GeocodeServer",
  parcels: "https://gisportal.horrycounty.org/server/rest/services/OpenData/Parcels/MapServer/0/query",
  points: "https://gisportal.horrycounty.org/server/rest/services/OpenData/AddressPoints/MapServer/0/query",
  towns: "https://gisportal.horrycounty.org/server/rest/services/OpenData/Municipalities/MapServer/0/query",
  evac: "https://gisportal.horrycounty.org/server/rest/services/OpenData/EvacuationZones_Horry/MapServer/0/query",
  fema: "https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query",
  countyFlood: "https://gisportal.horrycounty.org/server/rest/services/EmergencyMgmt/Current_FEMA_Flood_Zones/FeatureServer/7/query",
  supFlood: "https://gisportal.horrycounty.org/server/rest/services/EmergencyMgmt/Regulated_Supplemental_Flood_Zone/FeatureServer/4/query",
  zoning: "https://www.horrycountysc.gov/parcelapp/rest/services/HorryCountyGISApp/MapServer/30/query",
  deeds: "https://www.horrycountysc.gov/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
};

/* The fields asked of each source. Layer 24 also holds owner names and values: ask for these four only. */
var PR_FIELDS = {
  parcels: "PIN,TMS,LOT,SHAPE.STArea()",
  points: "PIN",
  towns: "NAME",
  evac: "Zone",
  fema: "FLD_ZONE,ZONE_SUBTY,SFHA_TF",
  countyFlood: "FLD_ZONE,SFHA_TF",
  supFlood: "OBJECTID",
  zoning: "ZoningCode",
  deeds: "PIN,DeedBook,DeedPage,Acreage"
};

/* The links on the card. */
var PR_LINKS = {
  deedJump: "https://acclaimweb.horrycounty.org/AcclaimWeb/details/JumpToBookPage/1/",
  deedSearch: "https://acclaimweb.horrycounty.org/AcclaimWeb/",
  tax: "https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx",
  parcelMap: "https://www.horrycountysc.gov/gis/parcels",
  fema: "https://msc.fema.gov/portal/home",
  gtMap: "https://experience.arcgis.com/experience/fa729743d97047579f348d68f9643ba1",
  gtDeeds: "https://www.georgetowndeeds.com/",
  gtTax: "https://georgetowncountysctax.com/"
};

/* An answer that is not a usable ArcGIS answer. */
function prBad(j) {
  return !j || typeof j !== "object" || !!j.error;
}

/* The query string for a question asked at one point (longitude x, latitude y, WGS84). */
function prPointQuery(x, y, fields, meters) {
  var q = "geometry=" + encodeURIComponent(x + "," + y) + "&geometryType=esriGeometryPoint&inSR=4326"
    + "&spatialRel=esriSpatialRelIntersects&outFields=" + encodeURIComponent(fields) + "&returnGeometry=false&f=json";
  if (meters) q += "&distance=" + meters + "&units=esriSRUnit_Meter";
  return q;
}

/* R48: Pawleys Island, Litchfield and ZIP 29585 are Georgetown County; the Horry finder does not know them. */
function prIsGeorgetown(text) {
  return /\b(pawleys|litchfield|georgetown)\b|\b29585\b/i.test(String(text || ""));
}

/* R1, R48: the best match, or why there is none.
   Returns { ok: true, address, x, y, city } or { ok: false, why: "none" | "street" | "service" }. */
function prPickMatch(j) {
  if (prBad(j) || !Array.isArray(j.candidates)) return { ok: false, why: "service" };
  var best = null, street = false;
  for (var i = 0; i < j.candidates.length; i++) {
    var c = j.candidates[i] || {}, a = c.attributes || {}, type = a.Addr_type || "";
    var score = typeof c.score === "number" ? c.score : a.Score;
    if (!(score >= 90) || !c.location) continue;
    if (type === "PointAddress" || type === "StreetAddress" || type === "Subaddress") {
      if (!best || score > best.score) best = { score: score, c: c, a: a };
    } else if (type === "StreetName") street = true;
  }
  if (!best) return { ok: false, why: street ? "street" : "none" };
  var addr = best.a.Match_addr || best.c.address || "";
  return { ok: true, address: addr, x: best.c.location.x, y: best.c.location.y, city: best.a.City || prCityOf(addr) };
}

/* The city in a matched address: "937 BROADWAY, Myrtle Beach, 29577" gives "Myrtle Beach". */
function prCityOf(addr) {
  var parts = String(addr || "").split(",").map(function (s) { return s.trim(); });
  for (var i = 1; i < parts.length; i++) if (/[a-z]/i.test(parts[i]) && !/^SC$/i.test(parts[i])) return parts[i];
  return "";
}

/* R28: a PIN comes back as a number; print it as an 11-digit string. */
function prPin(v) {
  if (v === null || v === undefined || v === "") return "";
  var s = typeof v === "number" ? String(Math.round(v)) : String(v).trim();
  if (!/^\d{1,11}$/.test(s)) return "";
  while (s.length < 11) s = "0" + s;
  return s;
}

/* R3, R4, R5: the parcels at the point. One parcel: its numbers. More than one: a building with units.
   Returns null when the source failed, else { n, pin, tms, lot, sqft }. */
function prParcels(j) {
  if (prBad(j) || !Array.isArray(j.features)) return null;
  var f = j.features;
  if (f.length !== 1) return { n: f.length, pin: "", tms: "", lot: "", sqft: 0 };
  var a = f[0].attributes || {};
  var lot = typeof a.LOT === "string" ? a.LOT.trim() : "";
  var tms = typeof a.TMS === "string" ? a.TMS.trim() : "";
  return { n: 1, pin: prPin(a.PIN), tms: /^\d{10}$/.test(tms) ? tms : "", lot: lot, sqft: +a["SHAPE.STArea()"] || 0 };
}

/* R6: the parcel number on the address point nearest the match, or "" when there is none. */
function prPointPin(j) {
  if (prBad(j) || !Array.isArray(j.features) || j.features.length !== 1) return "";
  return prPin((j.features[0].attributes || {}).PIN);
}

/* R10: the town at the point; "" is unincorporated Horry County. Returns null when the source failed. */
var PR_TOWNS = {
  "MYRTLE BEACH": "Myrtle Beach", "NORTH MYRTLE BEACH": "North Myrtle Beach", "CONWAY": "Conway",
  "SURFSIDE BEACH": "Surfside Beach", "LORIS": "Loris", "AYNOR": "Aynor", "ATLANTIC BEACH": "Atlantic Beach",
  "BRIARCLIFFE": "Briarcliffe Acres"
};
function prTown(j) {
  if (prBad(j) || !Array.isArray(j.features)) return null;
  for (var i = 0; i < j.features.length; i++) {
    var n = String((j.features[i].attributes || {}).NAME || "").trim().toUpperCase();
    if (n) return PR_TOWNS[n] || n.charAt(0) + n.slice(1).toLowerCase();
  }
  return "";
}

/* R11: zone A, B or C; "" outside every zone. Null when the source failed. */
function prEvac(j) {
  if (prBad(j) || !Array.isArray(j.features)) return null;
  for (var i = 0; i < j.features.length; i++) {
    var z = String((j.features[i].attributes || {}).Zone || "").trim().toUpperCase();
    if (/^[ABC]$/.test(z)) return z;
  }
  return "";
}

/* R12: the county zoning code, outside the towns only; "" when none. Null when the source failed. */
function prZoning(j) {
  if (prBad(j) || !Array.isArray(j.features)) return null;
  for (var i = 0; i < j.features.length; i++) {
    var z = String((j.features[i].attributes || {}).ZoningCode || "").trim();
    if (z) return z;
  }
  return "";
}

/* R9: inside the county's Supplemental Flood Zone? Null when the source failed. */
function prSupFlood(j) {
  if (prBad(j) || !Array.isArray(j.features)) return null;
  return j.features.length > 0;
}

/* R7, R8, R23 to R26: the flood zone in plain words.
   Returns null when the source failed, else { zone, level, text }. level: "high", "coastal", "moderate",
   "minimal" or "other". The county's copy has no ZONE_SUBTY; it stores shaded Zone X in FLD_ZONE. */
function prFlood(j) {
  if (prBad(j) || !Array.isArray(j.features) || !j.features.length) return null;
  var a = j.features[0].attributes || {};
  var z = String(a.FLD_ZONE || "").trim().toUpperCase(), sub = String(a.ZONE_SUBTY || "").trim().toUpperCase();
  if (!z) return null;
  var MUST = "A federally regulated or federally backed mortgage requires flood insurance on the building.";
  if (/^0\.2 PCT/.test(z)) return { zone: "X", level: "moderate", text: "Zone X, shaded: moderate risk. Federal rules do not require flood insurance here." };
  if (/^V/.test(z)) return { zone: z, level: "coastal", text: "Zone " + z + ": high risk, from tidal flooding with waves. " + MUST };
  if (/^A/.test(z)) return { zone: z, level: "high", text: "Zone " + z + ": high risk, a 1 percent or greater chance of flooding in any year. " + MUST };
  if (z === "X" && /^0\.2 PCT/.test(sub)) return { zone: "X", level: "moderate", text: "Zone X, shaded: moderate risk. Federal rules do not require flood insurance here." };
  if (z === "X") return { zone: "X", level: "minimal", text: "Zone X: minimal risk on FEMA's map. Federal rules do not require flood insurance here." };
  return { zone: z, level: "other", text: "Zone " + z + " on FEMA's map." };
}

/* R13, R14: the deed record's link, when the county's record gives a book and page in digits.
   Returns null when the source failed, else { book, page, acres } (book "" when there is no usable pair). */
function prDeed(j) {
  if (prBad(j) || !Array.isArray(j.features)) return null;
  var a = (j.features[0] || {}).attributes || {};
  var b = String(a.DeedBook || "").trim(), p = String(a.DeedPage || "").trim();
  var ok = /^\d+$/.test(b) && /^\d+$/.test(p) && +b > 0 && +p > 0;
  return { book: ok ? String(+b) : "", page: ok ? String(+p) : "", acres: +a.Acreage > 0 ? +a.Acreage : 0 };
}

/* The land line: the county's listed acreage when it has one, else the drawn area, rounded. */
function prAcres(deed, sqft) {
  var ac = deed && deed.acres ? deed.acres : (sqft ? sqft / 43560 : 0);
  if (!(ac > 0)) return "";
  var r = ac >= 10 ? Math.round(ac) : ac >= 1 ? Math.round(ac * 10) / 10 : Math.round(ac * 100) / 100;
  if (r === 0) r = 0.01;
  return "About " + r + (r === 1 ? " acre" : " acres") + (deed && deed.acres ? " on the county's record." : ", as the county's map draws the lot.");
}

/* The town line, and the mailing city when it says another place (R17 to R20). */
function prTownText(town, mailCity) {
  var mail = String(mailCity || "").trim();
  if (town) {
    var t = "Inside the limits of " + town + ", so " + town + "'s own zoning applies.";
    if (mail && mail.toLowerCase() !== town.toLowerCase()) t = "The mailing address says " + mail + ". " + t;
    return t;
  }
  var u = "Outside every town: unincorporated Horry County, so the county's zoning applies.";
  if (mail && PR_TOWN_NAMES.indexOf(mail.toLowerCase()) >= 0) u = "The mailing address says " + mail + ", but this address is outside " + mail + "'s limits. It is in unincorporated Horry County, so the county's zoning applies.";
  return u;
}
var PR_TOWN_NAMES = ["myrtle beach", "north myrtle beach", "conway", "surfside beach", "loris", "aynor", "atlantic beach", "briarcliffe acres"];

/* The hurricane line (R11). Never "safe". */
function prEvacText(z) {
  if (z) return "Evacuation zone " + z + ". The zones mark land at risk of storm surge from the ocean.";
  return "Outside every hurricane evacuation zone on the county's map.";
}

/* The record links for one parcel (R14 to R16). */
function prRecordLinks(pin, deed) {
  var out = [];
  if (deed && deed.book) out.push({ label: "Deed record", href: PR_LINKS.deedJump + deed.book + "/" + deed.page });
  else out.push({ label: "Deed search", href: PR_LINKS.deedSearch });
  out.push({ label: "Tax bill", href: pin ? PR_LINKS.tax + "?PIN=" + pin : PR_LINKS.tax });
  out.push({ label: "Parcel map (county sign-in)", href: pin ? PR_LINKS.parcelMap + "/pin/" + pin : PR_LINKS.parcelMap });
  return out;
}

/* The county answers in capitals: "1101 N OCEAN BLVD, Myrtle Beach, SC, 29577" reads as
   "1101 N Ocean Blvd, Myrtle Beach, SC 29577". Directions and the state stay in capitals. */
function prNice(addr) {
  var parts = String(addr || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  if (!parts.length) return "";
  parts[0] = parts[0].split(/\s+/).map(function (w) {
    if (/^(N|S|E|W|NE|NW|SE|SW)$/i.test(w)) return w.toUpperCase();
    if (/^\d+(ST|ND|RD|TH)$/i.test(w)) return w.toLowerCase();
    if (/\d/.test(w)) return w.toUpperCase();
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(" ");
  var zip = /^\d{5}$/.test(parts[parts.length - 1]) ? parts.pop() : "";
  var out = parts.join(", ");
  return zip ? out + (/, SC$/i.test(out) ? " " : ", SC ") + zip : out;
}

/* Our homes map near the point (R49). */
function prHomesHref(x, y) {
  return "/homes/map/?near=" + (Math.round(y * 100000) / 100000) + "," + (Math.round(x * 100000) / 100000) + "&miles=1";
}

/* The live strip's search for the homes within a mile of the point (round 2). The browser asks
   /homes/api/strip with this; the link is the fallback when the strip is empty or fails. */
function prHomesStripQ(x, y) {
  return "near=" + (Math.round(y * 100000) / 100000) + "," + (Math.round(x * 100000) / 100000) + "&miles=1";
}

if (typeof module !== "undefined" && module.exports) module.exports = {
  PR_SRC: PR_SRC, PR_FIELDS: PR_FIELDS, PR_LINKS: PR_LINKS, prBad: prBad, prPointQuery: prPointQuery, prIsGeorgetown: prIsGeorgetown,
  prPickMatch: prPickMatch, prCityOf: prCityOf, prPin: prPin, prParcels: prParcels, prPointPin: prPointPin, prTown: prTown,
  prEvac: prEvac, prZoning: prZoning, prSupFlood: prSupFlood, prFlood: prFlood, prDeed: prDeed, prAcres: prAcres,
  prTownText: prTownText, prEvacText: prEvacText, prRecordLinks: prRecordLinks, prHomesHref: prHomesHref, prHomesStripQ: prHomesStripQ, prNice: prNice
};
