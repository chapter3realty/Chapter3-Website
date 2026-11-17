"""Riverwalk findings (aggregate only). Reads RAW/county.json (pull_county.py) and the deed index (DEED (001), 2025-11-01 to 2026-10-31).
Condo units = parcels (land use 107) whose legal description starts RIVERWALK AT ARROWHEAD, RIVERWALK @ ARROWHEAD (the original 1997-99 phase) or RIVERWALK II (later phases);
garage units (117), townhome lots (109, RIVERWALK TNHMS) and common areas are counted apart. Sales matched by parcel number. No PIN, owner or address is written.
Run: RAW=<dir> SALES=<deeds-co.json> python3 -I analyze.py <this dir>. Writes findings.json."""
import json, os, re, sys, collections, statistics as st, datetime
from shapely.geometry import shape, Polygon, MultiPolygon, Point
from shapely.ops import unary_union
D, RAW, SALES = sys.argv[1], os.environ["RAW"], os.environ["SALES"]
c = json.load(open(RAW + "/county.json")); rows = c["rows"]; g = c["geo"]
def poly(rings): return Polygon(rings[0], rings[1:]) if len(rings) > 1 else Polygon(rings[0])
def mp(f):
    r = f["geometry"]["rings"]; out = None   # even-odd: each ring flips inside/outside (holes stay holes)
    for ring in r:
        p = Polygon(ring).buffer(0); out = p if out is None else out.symmetric_difference(p)
    return out
def phase(a):
    s = a["LegalDescr"].split(";")[0].strip()
    if s.startswith("RIVERWALK II"): return "II"
    if s in ("RIVERWALK AT ARROWHEAD", "RIVERWALK @ ARROWHEAD"): return "I"
    return "TH" if "TNHMS" in s else "other"
P = []
for r in rows:
    a = r["attributes"]; a["ph"] = phase(a); a["geom"] = mp(r); P.append(a)
condo = [a for a in P if a["LandUseCode"] == "107"]; garage = [a for a in P if a["LandUseCode"] == "117"]; th = [a for a in P if a["LandUseCode"] == "109"]
out = {"read": c["read"], "rule": __doc__}
out["counts"] = {"condo_units": len(condo), "phase_I_units": sum(1 for a in condo if a["ph"] == "I"), "phase_II_units": sum(1 for a in condo if a["ph"] == "II"), "garage_units": len(garage), "townhome_lots": len(th),
                 "all_parcels": len(P), "common_area_and_other": len([a for a in P if a["LandUseCode"] not in ("107", "117", "109")])}
# buildings: "UNIT 11-102" -> building 11 ; "BLD 14 ... 102"; II ones carry the phase
def bld(a):
    m = re.search(r"UN(?:IT|T)?\s*#?\s*(\d+)-(\d{3})", a["LegalDescr"]) or re.search(r"UN\s*(\d+)-(\d{3})", a["LegalDescr"])
    return (a["ph"], int(m[1]), int(m[2]) // 100) if m else None
bl = [bld(a) for a in condo]; out["parse"] = {"unparsed": sum(1 for b in bl if b is None)}
bs = collections.defaultdict(set)
for b in bl:
    if b: bs[(b[0], b[1])].add(b[2])
out["buildings"] = {"distinct_building_numbers_by_phase": {ph: len({k for k in bs if k[0] == ph}) for ph in ("I", "II")}, "floors_seen": sorted({f for v in bs.values() for f in v}),
                    "units_per_floor": {str(f): sum(1 for b in bl if b and b[2] == f) for f in sorted({f for v in bs.values() for f in v})}}
imp = [a["MarketProp"] for a in condo]
out["county_value"] = {"median": st.median(imp), "min": min(imp), "max": max(imp), "by_phase": {ph: {"n": sum(1 for a in condo if a["ph"] == ph), "median": st.median([a["MarketProp"] for a in condo if a["ph"] == ph])} for ph in ("I", "II")}}
out["townhome_county_value"] = {"n": len(th), "median": st.median(a["MarketProp"] for a in th), "min": min(a["MarketProp"] for a in th), "max": max(a["MarketProp"] for a in th)}
r4 = [a for a in condo if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002]
r6 = [a for a in condo if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002]
out["tax_status"] = {"taxed_4pct_legal_residence": len(r4), "taxed_6pct": len(r6), "other": len(condo) - len(r4) - len(r6), "n": len(condo), "tax_district": dict(collections.Counter(a["TaxDistrict"] for a in condo))}
st_ = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in condo)
out["owner_mailing_state"] = {"top": st_.most_common(8), "out_of_sc": sum(v for k, v in st_.items() if k not in ("SC", "blank")), "sc": st_.get("SC", 0), "blank": st_.get("blank", 0)}
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in condo)
out["last_sale_year"] = {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))}
# geometry: flood, waterway, golf, city, zoning, pools, footprints
fl = [(f["attributes"]["FLD_ZONE"], f["attributes"].get("SFHA_TF"), mp(f)) for f in g["flood"]]
zs = {}
for a in condo:
    zs[id(a)] = [(z, s) for z, s, p in fl if p.intersects(a["geom"]) and p.intersection(a["geom"]).area > 0]
def cat(z): return "AE" if any(zn == "AE" for zn, s in z) else ("0.2" if z else "X")
out["flood_condo_parcels"] = dict(collections.Counter(cat(zs[id(a)]) for a in condo))
shareAE = {}
allc = unary_union([a["geom"] for a in condo]); area = allc.area
ae = unary_union([p for z, s, p in fl if z == "AE"]) if any(z == "AE" for z, s, p in fl) else None
f02 = unary_union([p for z, s, p in fl if z != "AE"])
out["flood_area_share"] = {"ae_share_of_unit_parcel_area": (ae.intersection(allc).area / area) if ae else 0, "x_shaded_0p2_share": f02.intersection(allc).area / area}
out["flood_layer_zone_counts"] = dict(collections.Counter(f["attributes"]["FLD_ZONE"] for f in g["flood"]))
# building footprints touching AE
fp = [(f["attributes"]["FTR_CODE"], mp(f)) for f in g["footprints"]]
resid = [(code, p) for code, p in fp if code in (1800, 1810, 1820) or code == 1800]
inside = [(code, p) for code, p in fp if p.centroid.within(allc.buffer(0.00005))]
out["footprints_in_community"] = dict(collections.Counter(code for code, p in inside))
out["footprints_touch_AE"] = sum(1 for code, p in inside if code == 1800 and ae is not None and p.intersects(ae))
out["footprints_in_0p2"] = sum(1 for code, p in inside if code == 1800 and p.intersects(f02))
out["pool_footprints_1870_in_community"] = out["footprints_in_community"].get(1870, 0)
# waterway distance (metres via local projection)
import math
lat0 = allc.centroid.y; kx = 111320 * math.cos(math.radians(lat0)); ky = 110540
def m(geom_a, geom_b): return geom_a.distance(geom_b) * 0  # placeholder
from shapely import affinity
def proj(gm): return affinity.scale(gm, xfact=kx, yfact=ky, origin=(0, 0))
icw = unary_union([mp(f) for f in g["hydro"]]); icwp = proj(icw)
d_ = sorted(proj(a["geom"]).distance(icwp) for a in condo)
out["waterway_distance_m"] = {"min": round(d_[0]), "median": round(st.median(d_)), "max": round(d_[-1]), "within_25m": sum(1 for x in d_ if x <= 25), "within_100m": sum(1 for x in d_ if x <= 100), "within_250m": sum(1 for x in d_ if x <= 250), "n": len(d_)}
# golf
golf = [f for f in g["big"] if "ARROWHEAD COUNTRY CLUB" in (f["attributes"]["OwnerName"] or "")]
gp = proj(unary_union([mp(f) for f in golf]))
dg = sorted(proj(a["geom"]).distance(gp) for a in condo)
out["golf_distance_m"] = {"owner_parcels": [(f["attributes"]["LegalDescr"], round(f["attributes"]["Shape.STArea()"] * 0 + 1)) for f in golf][:0], "parcels_used": len(golf), "acres": round(sum(f["attributes"]["Shape.STArea()"] for f in golf) / 43560 * 1.0, 1), "within_15m": sum(1 for x in dg if x <= 15), "within_50m": sum(1 for x in dg if x <= 50), "median": round(st.median(dg)), "n": len(dg)}
out["towns"] = [f["attributes"]["NAME"] for f in g["towns"]]
out["town_contains_center"] = any(mp(f).contains(allc.centroid) for f in g["towns"])
out["town_contains_all_condo_parcels"] = sum(1 for a in condo if any(mp(f).contains(a["geom"].representative_point()) for f in g["towns"]))
zz = collections.Counter()
for f in g["zoning"]:
    p = mp(f)
    for a in condo:
        if p.contains(a["geom"].representative_point()): zz[f["attributes"]["ZoningCode"] + " " + str(f["attributes"].get("Ordinance"))] += 1
out["zoning_condo_parcels"] = dict(zz)
out["center"] = [round(allc.centroid.y, 5), round(allc.centroid.x, 5)]
out["bbox"] = [round(v, 5) for v in allc.bounds]
# sales
pins = {str(a["PIN"]).zfill(11): a for a in P}
sd = json.load(open(SALES))
def cons(x): return x.get("Consideration") or 0
sales = [x for x in sd["deeds"] if str(x["ParcelNumber"]).zfill(11) in pins]
out["deeds_window"] = [sd["from"], sd["to"]]
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    q = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": q[0], "p75": q[2], "min": xs[0], "max": xs[-1]}
byk = collections.defaultdict(list); zero = collections.Counter()
for x in sales:
    a = pins[str(x["ParcelNumber"]).zfill(11)]; k = {"I": "condos_phase_I", "II": "condos_phase_II", "TH": "townhomes"}.get(a["ph"], a["ph"] + "_" + a["LandUseCode"])
    if cons(x) >= 1000: byk[k].append(cons(x))
    else: zero[k] += 1
out["sales"] = {"deed_rows_matched": len(sales), "under_1000_transfers": dict(zero), "condos_all": summ(byk["condos_phase_I"] + byk["condos_phase_II"]), **{k: summ(v) for k, v in byk.items()}}
out["sales"]["condos_by_quarter"] = dict(collections.Counter(x["RecordDate"][:4] + "Q" + str((int(x["RecordDate"][5:7]) - 1) // 3 + 1) for x in sales if cons(x) >= 1000 and pins[str(x["ParcelNumber"]).zfill(11)]["ph"] in ("I", "II")))
out["sales"]["condos_units_sold_once_or_more"] = len({x["ParcelNumber"] for x in sales if cons(x) >= 1000 and pins[str(x["ParcelNumber"]).zfill(11)]["ph"] in ("I", "II")})
json.dump(out, open(D + "/findings.json", "w"), indent=1, default=str)
print(json.dumps({k: v for k, v in out.items() if k != "rule"}, indent=1, default=str))
