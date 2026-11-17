"""Ocean Forest Villas (5601 N Ocean Blvd) in Horry County's public records, in aggregate.
The county files the five buildings (A to E, units numbered by floor and door) under the old names "A PLACE AT THE BEACH" and "OCEAN FOREST"
(not the MLS name, and not the separate Shore Dr community "A Place at the Beach"). Parcels are therefore chosen by place AND name:
GIS layer 24, envelope lat 33.7278 to 33.7310, lon -78.8375 to -78.8325, LegalDescr starting "A PLACE AT TH", "A PLACE AT BCH", "PLACE AT B" or "OCEAN FOREST;",
land use starting 1. Building letter = the A-E in the legal description. Kept: units per building, county value groups (counts), last-deed year (counts),
owner mailing state (counts), units taxed at the 4 percent owner-occupant rate. Never kept: a PIN, an owner, a unit's own record.
Sales: deed index rows (data/2026-11-n/buyers-builders/raw/deeds-co.json, 2025-11-01 to 2026-10-31) whose Comments hold "PLACE AT" and "OCEAN FOREST" but not "PLAZA", consideration over $1,000.
Run: python3 -I pull_county.py <this dir> <website root>. Writes county.json."""
import json, sys, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"
q = {"geometry": "-78.8375,33.7270,-78.8325,33.7310", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects",
     "outFields": "LegalDescr,LandUseCode,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate", "returnGeometry": "true", "outSR": 4326, "resultRecordCount": 2000, "f": "json"}
r = json.load(urllib.request.urlopen(U + urllib.parse.urlencode(q), timeout=120))
NAME = re.compile(r"^(A PLACE AT TH|A PLACE AT BCH|PLACE AT B|OCEAN FOREST;)")
def letter(l):
    s = l.split(";", 1)[1] if ";" in l else l
    m = re.search(r"\b([A-E])[- ]?\d{3}\b|\b\d{3}[- ]?([A-E])\b", s); return (m[1] or m[2]) if m else None
units, other, fp = [], 0, []
for x in r["features"]:
    a = x["attributes"]; g = x["geometry"]["rings"][0]; la = sum(p[1] for p in g) / len(g)
    if not NAME.match(a["LegalDescr"] or "") or la < 33.7278 or not (a.get("LandUseCode") or "").startswith("1"): continue
    b = letter(a["LegalDescr"])
    if b: units.append((a, b)); fp += g
    else: other += 1
bld = collections.Counter(b for _, b in units)
vals = collections.Counter(a.get("MarketProp") for a, _ in units)
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a, _ in units)
state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a, _ in units)
r4 = sum(1 for a, _ in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "rule": __doc__, "units": len(units), "common_area_or_unlettered_parcels": other,
       "units_per_building": dict(sorted(bld.items())), "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1]) if n >= 3],
       "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))},
       "owner_state_top": state.most_common(8), "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")), "taxed_as_home_4pct": r4,
       "footprint_center": [round(sum(p[1] for p in fp) / len(fp), 6), round(sum(p[0] for p in fp) / len(fp), 6)]}
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    q4 = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": q4[0], "p75": q4[2], "min": xs[0], "max": xs[-1]}
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
mine = [x for x in d2["deeds"] if "PLACE AT" in (x.get("Comments") or "") and "OCEAN FOREST" in x["Comments"] and "PLAZA" not in x["Comments"]]
s2 = [x for x in mine if (x.get("Consideration") or 0) > 1000]
def bl(c):
    m = re.search(r"CONDO\s+([A-E])\s?\d{3}", c); return m[1] if m else None
out["sales"] = {"window": d2["from"] + " to " + d2["to"], "deed_rows_matched": len(mine), "all": summ([x["Consideration"] for x in s2]),
                "by_building_n": dict(collections.Counter(bl(x["Comments"]) for x in s2)), "zero_or_under_1000": len(mine) - len(s2),
                "by_half": {"2025-11 to 2026-04": summ([x["Consideration"] for x in s2 if x["RecordDate"] < "2026/05"]), "2026-05 to 2026-10": summ([x["Consideration"] for x in s2 if x["RecordDate"] >= "2026/05"])},
                "note": "Consideration as indexed; a deed under $1,000 is a transfer, not a sale"}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps({k: v for k, v in out.items() if k != "rule"}, indent=1, default=str)[:3500])
