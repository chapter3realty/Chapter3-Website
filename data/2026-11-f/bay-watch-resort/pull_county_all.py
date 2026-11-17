"""Bay Watch Resort in Horry County's public records, in aggregate. Writes county.json, flood.json.
Parcels: Horry County GIS layer 24, LegalDescr LIKE 'BAYWATCH RESORT%'. Units = parcels with a building value.
Kept: counts per phase (I, II, III), floors, county market value groups, owner mailing state (counts), units taxed as a home (4% ratio),
last-sale year (counts). Sales: deed files data/2026-10-d (2025-10-01..2026-09-30) and data/2026-11-n (2025-11-01..2026-10-31, joined by PIN, Consideration >= 1000).
Never kept: a PIN, an owner, a unit's own record. Run: python3 -I pull_county_all.py <this dir> <website root>"""
import json, sys, time, re, urllib.request, urllib.parse, collections, statistics as st, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
D, WEB = sys.argv[1], sys.argv[2]
B = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/"
U = B + "24/query"
def qq(url, p): return json.load(urllib.request.urlopen(url + "?" + urllib.parse.urlencode(p), timeout=120))
WH = "LegalDescr LIKE 'BAYWATCH RESORT%'"
feats, off = [], 0
while True:
    j = qq(U, {"where": WH, "outFields": "PIN,LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate", "returnGeometry": "true", "outSR": 4326, "resultOffset": off, "resultRecordCount": 500, "f": "json"})
    f = j.get("features", []); feats += f; time.sleep(0.5)
    if not j.get("exceededTransferLimit") or not f: break
    off += len(f)
rows = [x["attributes"] for x in feats]
units = [a for a in rows if (a.get("MarketImprv") or 0) > 0]
def ph(a):
    m = re.search(r"\bPH\s+(III|II|I)\b", a["LegalDescr"].upper()); return m[1] if m else "?"
def unit_no(a):
    m = re.search(r"UNIT\s*#?\s*(?:\d-)?(\d{3,4})\b", a["LegalDescr"].upper()); return int(m[1]) if m else None
per = collections.Counter(ph(a) for a in units)
floors = collections.defaultdict(set)
for a in units:
    n = unit_no(a)
    if n: floors[ph(a)].add(n // 100)
vals = collections.Counter(a.get("MarketProp") for a in units)
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in units)
state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in units)
r4 = sum(1 for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
r6 = sum(1 for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002)
mv = sorted(a["MarketProp"] for a in units if a.get("MarketProp"))
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "rule": __doc__, "parcels": len(rows), "units": len(units),
       "legal_prefixes": collections.Counter(re.sub(r"UNIT.*|C/A.*", "", a["LegalDescr"]).strip() for a in rows).most_common(),
       "units_by_phase": dict(per), "floors_by_phase": {k: [min(v), max(v), len(v)] for k, v in floors.items()},
       "market_value": {"median": st.median(mv), "p25": st.quantiles(mv, n=4)[0], "p75": st.quantiles(mv, n=4)[2], "min": mv[0], "max": mv[-1]},
       "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1]) if n >= 5][:14],
       "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))},
       "owner_state_top": state.most_common(8), "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")),
       "taxed_as_home_4pct": r4, "taxed_6pct": r6}
val = {str(a["PIN"]): a["MarketProp"] for a in rows}
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    q = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": q[0], "p75": q[2], "min": xs[0], "max": xs[-1]}
s1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("BAYWATCH RESORT")]
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))["deeds"]
s2 = [x for x in d2 if re.search(r"HPR BAYWATCH", (x.get("Comments") or "").upper()) and (x.get("Consideration") or 0) >= 1000]
z2 = sum(1 for x in d2 if re.search(r"HPR BAYWATCH", (x.get("Comments") or "").upper()) and not (x.get("Consideration") or 0))
out["sales"] = {"window_1": {"window": "2025-10-01 to 2026-09-30", "all": summ([s["cons"] for s in s1]), "buyer_in_sc": sum(1 for s in s1 if s["where"] == "SC"), "buyer_out_of_sc": sum(1 for s in s1 if s["where"] != "SC"), "company_buyers": sum(1 for s in s1 if s.get("company"))},
                "window_2": {"window": "2025-11-01 to 2026-10-31", "all": summ([x["Consideration"] for x in s2]), "zero_or_under_1000_deeds": z2 + sum(1 for x in d2 if re.search(r"HPR BAYWATCH", (x.get("Comments") or "").upper()) and 0 < (x.get("Consideration") or 0) < 1000)}}
def grp(v):
    return "under_150k" if v < 150000 else ("150k_to_249k" if v < 250000 else "250k_up")
g1 = collections.defaultdict(list)
for s in s1: g1[grp(s["market_prop"])].append(s["cons"])
g2 = collections.defaultdict(list)
for x in s2:
    v = val.get(str(x.get("ParcelNumber")))
    if v: g2[grp(v)].append(x["Consideration"])
out["sales"]["by_county_value_w1"] = {k: summ(v) if len(v) >= 3 else {"n": len(v), "kept": False} for k, v in g1.items()}
out["sales"]["by_county_value_w2"] = {k: summ(v) if len(v) >= 3 else {"n": len(v), "kept": False} for k, v in g2.items()}
out["units_by_county_value_group"] = dict(collections.Counter(grp(v) for v in val.values() if v))
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps(out, indent=1, default=str)[:5000])
# flood
polys = []
for f in feats:
    if (f["attributes"].get("MarketImprv") or 0) <= 0 and "C/A" not in f["attributes"]["LegalDescr"]: pass
    for r in (f.get("geometry") or {}).get("rings", []):
        if len(r) >= 4: polys.append(Polygon(r).buffer(0))
fp = unary_union(polys)
info = qq(B + "19", {"f": "json"})
geoms = [fp] if fp.geom_type == "Polygon" else list(fp.geoms)
zl = qq(B + "19/query", {"geometry": json.dumps({"rings": [list(map(list, g.exterior.coords)) for g in geoms], "spatialReference": {"wkid": 4326}}), "geometryType": "esriGeometryPolygon", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "true", "outSR": 4326, "f": "json"})
zones = []
for f in zl.get("features", []):
    g = unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r) >= 4])
    a = {k: v for k, v in f["attributes"].items() if k.upper() in ("FLD_ZONE", "ZONE", "ZONE_SUBTY", "STATIC_BFE", "SFHA_TF", "FLOODZONE", "BFE", "DFIRM_ID")}
    zones.append({"attributes": a, "share_of_footprint": round(g.intersection(fp).area / fp.area, 3)})
c = fp.centroid
fo = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "parcels": len(polys), "footprint_center": [round(c.y, 6), round(c.x, 6)], "bounds": [round(v, 6) for v in fp.bounds],
      "zones_touching": zones, "share_in_no_zone": round(1 - sum(z["share_of_footprint"] for z in zones), 3), "note": "footprint = union of all Bay Watch parcels (3 towers plus common ground)"}
json.dump(fo, open(D + "/flood.json", "w"), indent=1); print(json.dumps(fo, indent=1))
