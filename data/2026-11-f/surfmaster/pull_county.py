"""Surfmaster (MLS subdivisions SURFMASTER I and SURFMASTER II; 1690 and 1620 N Waccamaw Dr, Garden City Beach) in Horry County public records, in aggregate.
Parcels: Horry County GIS layer 24, LegalDescr 'SURFMASTER; %' (regime 1) and 'SURFMASTER PH II; %' (regime 2). Units = parcels with a building value.
Kept: unit counts, floors (unit number less its last two digits), doors per floor, county value groups, last-sale year counts, owner mailing state counts.
Deeds: window 1 (2025-10-01 to 2026-09-30) = data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json joined by PIN; window 2 (2025-11-01 to 2026-10-31) = data/2026-11-n/buyers-builders/raw/deeds-co.json joined by ParcelNumber.
Flood: layer 19 polygons touching the common-area parcels' footprint. Tax: units taxed at 6 percent.
Never kept: a PIN, an owner, a unit's own record. Run: python3 -I pull_county.py <this dir> <website root>"""
import json, sys, time, re, urllib.request, urllib.parse, collections, statistics as st, datetime
from shapely.geometry import Polygon
from shapely.ops import unary_union
D, WEB = sys.argv[1], sys.argv[2]
B = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/"
def q(layer, p): return json.load(urllib.request.urlopen(B + f"{layer}/query?" + urllib.parse.urlencode(p), timeout=120))
REG = {"I": "LegalDescr LIKE 'SURFMASTER; %'", "II": "LegalDescr LIKE 'SURFMASTER PH II; %'"}
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    qq = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": qq[0], "p75": qq[2], "min": xs[0], "max": xs[-1]}
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "regimes": {}}
allunits = {}
d1 = json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"]
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
for name, w in REG.items():
    rows = [f["attributes"] for f in q(24, {"where": w, "outFields": "PIN,LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate,Acreage", "returnGeometry": "false", "resultRecordCount": 2000, "f": "json"})["features"]]
    units = [a for a in rows if (a.get("MarketImprv") or 0) > 0]
    other = [a for a in rows if (a.get("MarketImprv") or 0) <= 0]
    floor = collections.Counter(); doors = collections.defaultdict(set); unp = 0
    for a in units:
        m = re.search(r"UNIT\s*#?\s*(\d{3,4})\b", a["LegalDescr"].upper())
        if not m: unp += 1; continue
        n = int(m[1]); floor[n // 100] += 1; doors[n // 100].add(n % 100)
    vals = collections.Counter(a.get("MarketProp") for a in units)
    yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in units)
    state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in units)
    lu = collections.Counter((a.get("LandUseCode") or "")[:1] + "xx" for a in units)
    six = [a for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002]
    four = [a for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002]
    pins = {str(a["PIN"]): a for a in units}
    allunits.update(pins)
    s1 = [s for s in d1 if str(s["pin"]) in pins]
    s2 = [x for x in d2["deeds"] if str(x.get("ParcelNumber")) in pins and (x.get("Consideration") or 0) >= 1000]
    z2 = sum(1 for x in d2["deeds"] if str(x.get("ParcelNumber")) in pins and not x.get("Consideration"))
    # flood footprint: common-area parcel(s) (no building value)
    j = q(24, {"where": w, "outFields": "OBJECTID,MarketImprv", "returnGeometry": "true", "outSR": 4326, "f": "json"})
    polys = [Polygon(r).buffer(0) for f in j["features"] if (f["attributes"].get("MarketImprv") or 0) <= 0 for r in f["geometry"]["rings"] if len(r) >= 4]
    fp = unary_union(polys); c = fp.centroid
    gj = {"rings": [list(map(list, fp.exterior.coords))] if fp.geom_type == "Polygon" else [list(map(list, g.exterior.coords)) for g in fp.geoms], "spatialReference": {"wkid": 4326}}
    zl = q(19, {"geometry": json.dumps(gj), "geometryType": "esriGeometryPolygon", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects", "outFields": "*", "returnGeometry": "true", "outSR": 4326, "f": "json"})
    zones = []
    for f in zl.get("features", []):
        g = unary_union([Polygon(r).buffer(0) for r in f["geometry"]["rings"] if len(r) >= 4])
        a = {k: v for k, v in f["attributes"].items() if k.upper() in ("FLD_ZONE", "ZONE", "ZONE_SUBTY", "STATIC_BFE", "SFHA_TF", "FLOODZONE", "BFE", "DFIRM_ID", "ZONE_")}
        zones.append({"attributes": a, "share_of_footprint": round(g.intersection(fp).area / fp.area, 3)})
    time.sleep(0.5)
    out["regimes"][name] = {"where": w, "parcels": len(rows), "units": len(units), "parcels_without_building_value": len(other), "acreage_common_area": [a.get("Acreage") for a in other],
        "landuse_first_digit": dict(lu), "unparsed_unit_numbers": unp,
        "floors": {"numbers": sorted(floor), "top": max(floor), "units_per_floor": {str(k): floor[k] for k in sorted(floor)}, "doors_per_floor": {str(k): [min(doors[k]), max(doors[k]), len(doors[k])] for k in sorted(doors)}},
        "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1]) if n >= 3], "county_market_value_groups_under_3": sum(n for v, n in vals.items() if n < 3),
        "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))}, "owner_state_top": state.most_common(8),
        "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")), "taxed_as_home_4pct": len(four), "taxed_6pct": len(six),
        "tax6": ({"taxable": summ([a["TaxableProp"] for a in six]), "market": summ([a["MarketProp"] for a in six]), "implied_tax_at_254.6_mills_NOT_USED_site_is_county_unincorporated": None} if six else None),
        "sales_window_1_2025-10-01_to_2026-09-30": {**summ([s["cons"] for s in s1]), "buyer_tax_bill_in_sc": sum(1 for s in s1 if s["where"] == "SC"), "buyer_tax_bill_out_of_sc": sum(1 for s in s1 if s["where"] != "SC")},
        "sales_window_2_2025-11-01_to_2026-10-31": {**summ([x["Consideration"] for x in s2]), "zero_dollar_deeds": z2},
        "flood": {"footprint_center": [round(c.y, 6), round(c.x, 6)], "zones_touching": zones, "share_in_no_zone": round(1 - sum(z["share_of_footprint"] for z in zones), 3)}}
out["units_total"] = sum(r["units"] for r in out["regimes"].values())
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps(out, indent=1, default=str)[:9000])
