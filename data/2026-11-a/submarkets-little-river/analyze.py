#!/usr/bin/env python3
"""Every derived number for /submarkets/little-river/. Writes findings.json and the chart and map files (aggregates only:
no names, addresses, PINs or deed book and page).
Inputs: RAW (fetch_county.py, pull_listings.py and pull_deeds.py outputs; kept out of the repo), SALES (kept Horry County home
sales recorded 2025-10-01 to 2026-09-30, data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json), and this folder's raw/
(Census, HUD, FEMA policies, drives).
Run: RAW=<scratch> SALES=<file> python3 -I analyze.py <datadir>"""
import sys, os, json, re, math, glob, collections, statistics as st, datetime
import numpy as np, shapely
from shapely.geometry import Polygon, shape, mapping
from shapely.ops import unary_union
D = sys.argv[1]; R = os.path.join(D, "raw"); RAW = os.environ["RAW"]
L = lambda n: json.load(open(os.path.join(RAW, n)))
def esri(g):
    out = None
    for r in g["rings"]:
        p = Polygon(r).buffer(0); out = p if out is None else out.symmetric_difference(p)
    return out
def med(v): v = sorted(v); return st.median(v) if v else None
def q(v, p):
    v = sorted(v); k = (len(v) - 1) * p; f = math.floor(k); c = min(f + 1, len(v) - 1); return v[f] + (v[c] - v[f]) * (k - f)
def summ(v): v = [x for x in v if x is not None]; return {"n": len(v), "median": med(v), "q1": q(v, .25) if v else None, "q3": q(v, .75) if v else None}
LAT0 = 33.87; KX, KY = 111320 * math.cos(math.radians(LAT0)), 110950   # metres per degree near Little River
def m2(g): return shapely.transform(g, lambda c: c * np.array([KX, KY]))  # to local metres (equal-area enough at this scale)
out = {"made": "analyze.py", "run": datetime.datetime.now(datetime.timezone.utc).isoformat()}

# ---- boundaries
zipg = esri(L("zip.json")[0]["geometry"]); cdp = esri(L("cdp.json")[0]["geometry"]); com = esri(L("community.json")[0]["geometry"])
nmb = unary_union([esri(m["geometry"]) for m in L("munis.json") if "NORTH MYRTLE" in (m["attributes"]["NAME"] or "").upper()])
for g in (zipg, cdp, com, nmb): shapely.prepare(g)
SQMI = 2589988.0
out["areas_sq_mi"] = {"zip_29566": round(m2(zipg).area / SQMI, 1), "cdp": round(m2(cdp).area / SQMI, 1), "county_community": round(m2(com).area / SQMI, 1),
                      "zip_inside_north_myrtle_beach": round(m2(zipg.intersection(nmb)).area / SQMI, 1)}
CENTER = (-78.6232583, 33.8727006)  # OpenStreetMap place point for Little River (same start as pull_drives.py)

# ---- homes: land use 1xx with a building (same rule as the Conway ledger); location = address point, else outline center
P = {str(int(p["PIN"])): p for p in L("parcels.json")}
for s in L("parcel-shapes.json"):
    p = P.get(str(int(s["PIN"])))
    if p and s.get("g"): p["shape"] = esri(s["g"])
apt = {}
for a in L("addr.json"):
    if a.get("PIN"): apt.setdefault(str(int(a["PIN"])), a)
for k, p in P.items():
    a = apt.get(k)
    if a: p["x"], p["y"], p["postal"] = a["x"], a["y"], (a["POSTAL_CITY"] or "").upper()
    elif p.get("shape") is not None: c = p["shape"].representative_point(); p["x"], p["y"], p["postal"] = c.x, c.y, ""
    else: p["x"] = None
PP = [p for p in P.values() if p.get("x") is not None]
X = np.array([p["x"] for p in PP]); Y = np.array([p["y"] for p in PP])
for nm, g in (("zip", zipg), ("cdp", cdp), ("nmb", nmb)):
    m = shapely.contains_xy(g, X, Y)
    for i, p in enumerate(PP): p[nm] = bool(m[i])
HOUSE = {"100", "101", "102", "110", "126"}; TOWN = {"109"}; CONDO = {"107", "135"}; MFG = {"120", "121", "122", "130"}
def kind(p):
    u = p["LandUseCode"]; lg = (p["LegalDescr"] or "").upper()
    if u in CONDO or re.search(r"\bHPR\b|\bUNIT\b", lg): return "condo"
    if u in MFG: return "manufactured"
    if u in TOWN: return "townhouse"
    if u in HOUSE: return "house"
    return "other"
for p in PP: p["kind"] = kind(p) if p["LandUseCode"] != "306" else "slip"
HZ = [p for p in PP if p["zip"] and p["kind"] != "slip"]
out["homes_zip"] = {"all": len(HZ), "by_kind": dict(collections.Counter(p["kind"] for p in HZ).most_common()),
                    "by_land_use": dict(collections.Counter(p["LandUseCode"] for p in HZ).most_common()),
                    "inside_north_myrtle_beach": sum(p["nmb"] for p in HZ), "inside_nmb_by_kind": dict(collections.Counter(p["kind"] for p in HZ if p["nmb"])),
                    "postal_little_river": sum(p["postal"] == "LITTLE RIVER" for p in HZ), "no_address_point": sum(p["postal"] == "" for p in HZ),
                    "by_tax_district": dict(collections.Counter(p["TaxDistrict"] for p in HZ).most_common(6)),
                    "in_cdp": sum(p["cdp"] for p in HZ)}
mf = [p for p in HZ if p["kind"] == "manufactured"]
out["manufactured_zip"] = {"n": len(mf), "with_land_value": sum((p["MarketLand"] or 0) > 0 for p in mf), "by_code": dict(collections.Counter(p["LandUseCode"] for p in mf)),
                           "county_value_median": med([p["MarketProp"] for p in mf]), "largest_groups": collections.Counter((p["LegalDescr"] or "").split(";")[0].strip() or "(no subdivision)" for p in mf).most_common(8)}
houses = [p for p in HZ if p["kind"] == "house"]
out["house_lots_zip"] = {"n": len(houses), "median_acres_county": med([p["Acreage"] for p in houses if p["Acreage"]]),
                         "acre_or_more": sum((p["Acreage"] or 0) >= 1 for p in houses)}

# ---- water: homes whose outline is within 15 m of the county's water polygons (Intracoastal Waterway, Little River, creeks)
hyd = [(h["attributes"].get("NAME") or "").strip() or "(unnamed)" for h in L("hydro.json")]
hydg = [m2(esri(h["geometry"])) for h in L("hydro.json")]
water = unary_union(hydg); shapely.prepare(water)
waterb = water.buffer(15); shapely.prepare(waterb)
for p in HZ:
    p["wf"] = bool(p.get("shape") is not None and shapely.intersects(waterb, m2(p["shape"])))
    p["wfname"] = None
    if p["wf"]:
        sh = m2(p["shape"]); d = [(g.distance(sh), n) for g, n in zip(hydg, hyd)]; p["wfname"] = min(d)[1]
out["water_homes_zip"] = {"rule": "parcel outline within 15 m of a county hydrography polygon (parcelapp layer 21)", "water_bodies": hyd,
                          "n": sum(p["wf"] for p in HZ), "by_kind": dict(collections.Counter(p["kind"] for p in HZ if p["wf"])),
                          "by_water": dict(collections.Counter(p["wfname"] for p in HZ if p["wf"])),
                          "houses_on_water": sum(p["wf"] for p in houses), "houses": len(houses)}

# ---- FEMA high-risk zone (layer 19 SFHA_TF = 'T'), by home point
sf = L("sfha.json"); sfz = collections.defaultdict(list)
for f in sf: sfz[f["attributes"]["FLD_ZONE"]].append(esri(f["geometry"]))
sfzu = {k: unary_union(v) for k, v in sfz.items()}
for g in sfzu.values(): shapely.prepare(g)
hx = np.array([p["x"] for p in HZ]); hy = np.array([p["y"] for p in HZ])
zin = {k: shapely.contains_xy(g, hx, hy) for k, g in sfzu.items()}
for i, p in enumerate(HZ): p["sfha"] = next((k for k in ("VE", "AE", "A", "AO") if k in zin and zin[k][i]), None)
out["sfha_zip"] = {"homes": len(HZ), "in_sfha": sum(bool(p["sfha"]) for p in HZ), "by_zone": dict(collections.Counter(p["sfha"] for p in HZ if p["sfha"])),
                   "by_kind": {k: {"n": sum(p["kind"] == k for p in HZ), "in_sfha": sum(p["kind"] == k and bool(p["sfha"]) for p in HZ)} for k in ("house", "townhouse", "condo", "manufactured")},
                   "water_homes_in_sfha": sum(p["wf"] and bool(p["sfha"]) for p in HZ), "water_homes": sum(p["wf"] for p in HZ)}

# ---- boat slips: county land use 306, located by outline centre
SL = []
for s in L("slips.json"):
    if not s.get("g"): continue
    v = [pt for r in s["g"]["rings"] for pt in r[:-1]] or [pt for r in s["g"]["rings"] for pt in r]
    s["x"], s["y"] = sum(a for a, b in v) / len(v), sum(b for a, b in v) / len(v); SL.append(s)  # vertex mean (outlines were simplified)
sx = np.array([s["x"] for s in SL]); sy = np.array([s["y"] for s in SL]); inz = shapely.contains_xy(zipg, sx, sy); innmb = shapely.contains_xy(nmb, sx, sy)
def marina(lg):
    m = (lg or "").split(";")[0].strip().upper().replace("'", "").replace("MAIRNERS", "MARINERS")
    for k, v in (("MARINERS POINTE", "Mariner's Pointe"), ("LIGHTKEEPERS", "Lightkeepers Village"), ("COQ", "Coquina Harbour"), ("DOCK HOLIDAYS", "Dock Holidays Marina"), ("HARBOURGATE", "Harbourgate Yacht Club")):
        if m.startswith(k): return v
    return "(other: " + m + ")"
zs = [s for s, i in zip(SL, inz) if i]
out["slips"] = {"county": len(L("slips.json")), "with_outline": len(SL), "in_zip": len(zs), "in_zip_inside_nmb": int(sum(innmb[inz])),
                "by_marina_zip": collections.Counter(marina(s["LegalDescr"]) for s in zs).most_common(20),
                "outside_zip_by_marina": collections.Counter(marina(s["LegalDescr"]) for s, i in zip(SL, inz) if not i).most_common(12),
                "outside_zip_inside_nmb": int(sum(innmb[~inz])),
                "county_value_by_marina_zip": {m: summ([s["MarketProp"] for s in zs if marina(s["LegalDescr"]) == m]) for m in sorted({marina(s["LegalDescr"]) for s in zs})},
                "county_value_zip": summ([s["MarketProp"] for s in zs]), "county_value_zip_min_max": [min(s["MarketProp"] for s in zs), max(s["MarketProp"] for s in zs)] if zs else None}
# slip deed sales: AcclaimWeb DEED rows 2025-10-01 to 2026-09-30 naming one slip parcel, $1,000 or more, not corrective or tax sale
rows = [r for f in sorted(glob.glob(os.path.join(RAW, "deeds-2*.json"))) for r in json.load(open(f))["Data"]]
bp = collections.defaultdict(set)
for r in rows: bp[r["BookPage"]].add((r["ParcelNumber"] or "").strip())
slipin = {str(int(s["PIN"])): s for s in zs}; slipall = {str(int(s["PIN"])): s for s in L("slips.json")}
TAX = re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); CORR = re.compile(r"CORRECT|RE-RECORD")
ss, skipped = [], collections.Counter()
for r in rows:
    pin = (r["ParcelNumber"] or "").strip().lstrip("0")
    if pin not in slipall: continue
    if (r["Consideration"] or 0) < 1000: skipped["under_1000"] += 1; continue
    if len(bp[r["BookPage"]]) > 1: skipped["several_parcels"] += 1; continue
    if TAX.search((r.get("DirectName") or "") + " " + (r.get("IndirectName") or "")) or CORR.search(r.get("Comments") or ""): skipped["tax_or_corrective"] += 1; continue
    ss.append({"in_nmb": bool(shapely.contains_xy(nmb, *next(((t["x"], t["y"]) for t in SL if str(int(t["PIN"])) == pin)))), "in_zip": pin in slipin, "price": r["Consideration"], "marina": marina(slipall[pin]["LegalDescr"]), "county_value": slipall[pin]["MarketProp"], "date": r["RecordDate"]})
z = [s for s in ss if s["in_zip"]]
out["slip_sales"] = {"deed_rows": len(rows), "kept_county": len(ss), "kept_zip": len(z), "skipped_slip_deeds": dict(skipped), "price_zip": summ([s["price"] for s in z]),
                     "min_max_zip": [min(s["price"] for s in z), max(s["price"] for s in z)] if z else None,
                     "by_marina_zip": {m: summ([s["price"] for s in z if s["marina"] == m]) for m in sorted({s["marina"] for s in z})},
                     "by_marina_county": {m: summ([s["price"] for s in ss if s["marina"] == m]) | {"in_nmb": sum(s["in_nmb"] for s in ss if s["marina"] == m)} for m in sorted({s["marina"] for s in ss})},
                     "list": sorted([{"marina": s["marina"], "month": s["date"][:7], "price": s["price"], "county_value": s["county_value"]} for s in ss], key=lambda t: (t["marina"], t["month"])),
                     "price_to_county_value_median": med([s["price"] / s["county_value"] for s in z if s["county_value"]])}

# ---- home sales: kept sales (2026-10-d rules) whose parcel is in the ZIP polygon
S = json.load(open(os.environ["SALES"]))["sales"]
for s in S:
    p = P.get(str(int(s["pin"]))) if s.get("pin") else None
    s["p"] = p
inS = [s for s in S if s["p"] is not None and s["p"].get("zip")]
for s in inS: s["kind"] = s["p"]["kind"]; s["wf"] = s["p"].get("wf", False); s["sfha"] = s["p"].get("sfha")
def ksumm(f): return summ([s["cons"] for s in inS if f(s)])
out["sales_zip"] = {"window": "recorded 2025-10-01 to 2026-09-30", "all": ksumm(lambda s: True),
                    "house_resale": ksumm(lambda s: s["kind"] == "house" and not s["builder"]), "house_new_builder": ksumm(lambda s: s["kind"] == "house" and s["builder"]),
                    "townhouse": ksumm(lambda s: s["kind"] == "townhouse"), "condo": ksumm(lambda s: s["kind"] == "condo"),
                    "manufactured": ksumm(lambda s: s["kind"] == "manufactured"),
                    "house_resale_on_water": ksumm(lambda s: s["kind"] == "house" and not s["builder"] and s["wf"]),
                    "house_resale_not_water": ksumm(lambda s: s["kind"] == "house" and not s["builder"] and not s["wf"]),
                    "house_resale_in_sfha": ksumm(lambda s: s["kind"] == "house" and not s["builder"] and s["sfha"]),
                    "condo_on_water": ksumm(lambda s: s["kind"] == "condo" and s["wf"]), "condo_not_water": ksumm(lambda s: s["kind"] == "condo" and not s["wf"]),
                    "inside_nmb": ksumm(lambda s: s["p"]["nmb"]),
                    "out_of_state_buyer_share": round(100 * sum(s["where"] in ("US", "CANADA") for s in inS) / len(inS), 1) if inS else None,
                    "buyer_where": dict(collections.Counter(s["where"] for s in inS))}
# county-wide resale house for comparison (same kind rule is not available countywide; use the sales file's own non-condo, non-builder set)
rs = [x["cons"] for x in S if not x["builder"] and not x["condo"]]
out["county_resale_not_condo_median"] = {"n": len(rs), "median": med(rs)}

# ---- active listings (CRM, city = Little River), aggregate only; FEMA zone by our overlay of the pin
Ld = L("listings-little-river.json"); hm = list(Ld["homes"].values())
lx = np.array([h["lng"] for h in hm]); ly = np.array([h["lat"] for h in hm])
lin = {k: shapely.contains_xy(g, lx, ly) for k, g in sfzu.items()}
for i, h in enumerate(hm): h["sfha"] = any(bool(v[i]) for v in lin.values())
def lsum(v): return summ([h["price"] for h in v]) | {"in_sfha_by_pin": sum(h["sfha"] for h in v)}
out["listings"] = {"pulled": Ld["pulled"], "source": (Ld.get("meta") or {}).get("source"), "api_totals": Ld["api_totals"], "kept": len(hm),
                   "by_type": {t: lsum([h for h in hm if h["type"] == t]) for t in ("house", "townhouse", "condo", "manufactured", "land")},
                   "house_3bed": lsum([h for h in hm if h["type"] == "house" and h.get("beds") == 3]),
                   "house_3bed_under_400k": sum(1 for h in hm if h["type"] == "house" and h.get("beds") == 3 and (h["price"] or 0) < 400000),
                   "house_under_300k": sum(1 for h in hm if h["type"] == "house" and (h["price"] or 0) < 300000)}

# ---- HUD FY2027 Small Area FMR, rent-to-price worked example
H = {r["ZIP Code"]: r for r in json.load(open(os.path.join(R, "safmr-2027-metro34820.json")))["rows"]}
def fmr(z, b): return H[z]["SAFMR %dBR" % b]
out["hud_fy2027"] = {z: {b: fmr(z, b) for b in (1, 2, 3, 4)} for z in ("29566", "29582", "29568", "29579", "29577", "29576", "29575", "29526", "29527", "29588") if z in H}
P3 = out["sales_zip"]["house_resale"]["median"]
EX = {"price": P3, "rent_3br_month": fmr("29566", 3), "rent_year": fmr("29566", 3) * 12}
EX["gross_rent_to_price_pct"] = round(100 * EX["rent_year"] / P3, 1)
EX["tax_6pct"] = round(P3 * 0.06 * 0.201 + 89.40)       # rental or second home: 201.0 mills on 6 percent, plus the $89.40 fee (affordable row 70)
EX["tax_4pct"] = round(P3 * 0.04 * 0.0919 + 89.40)      # legal residence: 91.9 net mills on 4 percent, plus the fee
EX["tax_6pct_share_of_rent"] = round(100 * EX["tax_6pct"] / EX["rent_year"], 1)
out["worked_example"] = EX

# ---- NFIP single-family policies, ZIP 29566, policies beginning 2025-06-01 to 2026-05-31
nf = {}
for g in ("x", "a"):
    d = json.load(open(os.path.join(R, "nfip-policies-29566-%s.json" % g)))["NfipPolicies"]
    v = [x["policyCost"] for x in d if x.get("policyCost") is not None]
    nf[g] = summ(v) | {"primary_residence": sum(1 for x in d if x.get("primaryResidenceIndicator") in (True, 1, "1", "Y"))}
out["nfip_policies_29566"] = nf

# ---- Census: 2020 count (seasonal homes) and ACS 2020-2024 (units in structure, tenure, value)
G = {"4542010": "Little River CDP", "4528455": "Garden City CDP", "4551280": "North Myrtle Beach city", "4548985": "Murrells Inlet CDP", "4511833": "Carolina Forest CDP", "4516405": "Conway city", "45051": "Horry County"}
def cen(t, g):
    f = glob.glob(os.path.join(R, "census-*.%s-*%s.json" % (t, g)))
    d = json.load(open(f[0]))["response"]["data"]; return dict(zip(d[0], d[1]))
cz = {}
for g, n in G.items():
    h1 = cen("H1", g); h5 = cen("H5", g); b24 = cen("B25024", g); b03 = cen("B25003", g)
    tot = int(h1["H1_001N"]); seas = int(h5["H5_006N"]); acs = int(b24["B25024_001E"])
    cz[n] = {"units_2020": tot, "occupied_2020": int(h1["H1_002N"]), "seasonal_2020": seas, "seasonal_pct_2020": round(100 * seas / tot, 1),
             "occupied_pct_2020": round(100 * int(h1["H1_002N"]) / tot, 1),
             "acs_units": acs, "acs_mobile_home_pct": round(100 * int(b24["B25024_010E"]) / acs, 1), "acs_one_unit_detached_pct": round(100 * int(b24["B25024_002E"]) / acs, 1),
             "acs_owner_occupied_pct": round(100 * int(b03["B25003_002E"]) / int(b03["B25003_001E"]), 1),
             "acs_median_value": int(cen("B25077", g)["B25077_001E"]), "acs_median_gross_rent": int(cen("B25064", g)["B25064_001E"]),
             "acs_median_year_built": int(cen("B25035", g)["B25035_001E"])}
    p20 = cen("P1", g).get("P1_001N"); cz[n]["pop_2020"] = int(p20) if p20 else None
    try: cz[n]["pop_2010"] = int(dict(zip(*json.load(open(glob.glob(os.path.join(R, "census-DECENNIALSF12010.P1-*%s.json" % g))[0]))["response"]["data"][:2]))["P001001"])
    except Exception: cz[n]["pop_2010"] = None
    if cz[n]["pop_2010"]: cz[n]["growth_2010_2020_pct"] = round(100 * (cz[n]["pop_2020"] / cz[n]["pop_2010"] - 1), 1)
out["census"] = cz

# ---- county boat landings near Little River
out["landings"] = [{"name": f["attributes"]["FacilityName"], "access_to": f["attributes"]["AccessTo"], "ramps": f["attributes"]["NumRamps"], "docks": f["attributes"]["NumDocks"],
                    "parking": f["attributes"]["NumParkingSpaces"], "surface": f["attributes"]["ParkingSurface"], "lon": round(f["geometry"]["x"], 5), "lat": round(f["geometry"]["y"], 5),
                    "in_zip": bool(shapely.contains_xy(zipg, f["geometry"]["x"], f["geometry"]["y"])), "in_nmb": bool(shapely.contains_xy(nmb, f["geometry"]["x"], f["geometry"]["y"]))}
                   for f in L("launches.json") if f["geometry"]["y"] > 33.80 and f["geometry"]["x"] > -78.80]

# ---- active building permits (county), new homes in the ZIP
pm = L("permits.json")
for p in pm:
    v = [pt for r in (p.get("g") or {}).get("rings", []) for pt in r]
    p["inzip"] = bool(v) and bool(shapely.contains_xy(zipg, sum(a for a, b in v) / len(v), sum(b for a, b in v) / len(v)))
pz = [p for p in pm if p["inzip"]]
out["permits_active_zip"] = {"all": len(pz), "by_type": collections.Counter(" / ".join(((p["PermitType"] or "").strip(), (p["Workclass"] or "").strip(), (p["DESCRIPTION"] or "").strip()[:20])) for p in pz).most_common(12),
                             "issued_range": [datetime.date.fromtimestamp(min(p["ISSUEDATE"] for p in pz if p["ISSUEDATE"]) / 1000).isoformat(), datetime.date.fromtimestamp(max(p["ISSUEDATE"] for p in pz if p["ISSUEDATE"]) / 1000).isoformat()] if pz else None}

# ---- major residential developments (county tracker), Little River community, with the date each row was updated
dv = [d for d in L("devs.json") if (d.get("COMMUNITY") or "").strip() == "LITTLE RIVER"]
out["developments_little_river"] = {"rows": len(dv), "updated": dict(collections.Counter(d.get("UPDATED") for d in dv)),
    "remaining_units_by_update": {u: sum((d.get("TOTAL_REMA") or 0) for d in dv if d.get("UPDATED") == u) for u in {d.get("UPDATED") for d in dv}},
    "totals": {k: sum((d.get(k) or 0) for d in dv) for k in ("SF_APPROVE", "MF_APPROVE", "SF_CONSTRU", "MF_CONSTRU", "SF_REMAINI", "MF_REMAINI", "TOTAL_REMA")},
    "largest_remaining": sorted([(d["NAME"], d.get("TOTAL_REMA") or 0, d.get("STATUS"), d.get("UPDATED")) for d in dv], key=lambda t: -t[1])[:10]}

# ---- evacuation zone at the centre and at the waterfront
ev = L("evac.json")
def zone(x, y): return [e["attributes"]["Zone"] for e in ev if shapely.contains_xy(esri(e["geometry"]), x, y)]
out["evac"] = {"center": zone(*CENTER), "waterfront_mineola": zone(-78.6122, 33.8741), "zone_descriptions": {e["attributes"]["Zone"]: e["attributes"]["Description"] for e in ev}}

# ---- map layers (simplified, WGS84): ZIP outline, North Myrtle Beach limits clipped to the map box, FEMA zone clipped, water
box = shapely.box(-78.78, 33.82, -78.54, 33.95)
def gj(g, tol): return mapping(shapely.set_precision(g.intersection(box).simplify(tol), 0.00001))
json.dump({"type": "FeatureCollection", "features": [
    {"type": "Feature", "properties": {"layer": "zip_29566"}, "geometry": gj(zipg, 0.0003)},
    {"type": "Feature", "properties": {"layer": "north_myrtle_beach_limits"}, "geometry": gj(nmb, 0.0003)},
    {"type": "Feature", "properties": {"layer": "fema_high_risk"}, "geometry": gj(unary_union(list(sfzu.values())), 0.0002)},
    {"type": "Feature", "properties": {"layer": "water"}, "geometry": gj(unary_union([esri(h["geometry"]) for h in L("hydro.json")]), 0.0002)}]},
    open(os.path.join(D, "map-little-river.geojson"), "w"))
pts = [{"kind": "landing", "name": l["name"], "lon": l["lon"], "lat": l["lat"]} for l in out["landings"]]
mz = collections.defaultdict(list)
for s in zs: mz[marina(s["LegalDescr"])].append((s["x"], s["y"]))
pts += [{"kind": "slips", "name": k, "n": len(v), "lon": round(sum(a for a, b in v) / len(v), 5), "lat": round(sum(b for a, b in v) / len(v), 5)} for k, v in mz.items()]
json.dump(pts, open(os.path.join(D, "map-points.json"), "w"), indent=0)

# ---- chart: seasonal share of all homes, 2020 Census
json.dump([{"place": n, "seasonal_pct": cz[n]["seasonal_pct_2020"], "seasonal": cz[n]["seasonal_2020"], "units": cz[n]["units_2020"]} for n in
           ("North Myrtle Beach city", "Garden City CDP", "Little River CDP", "Horry County", "Murrells Inlet CDP", "Carolina Forest CDP", "Conway city")],
          open(os.path.join(D, "chart-seasonal.json"), "w"), indent=1)
json.dump({"by_kind": out["homes_zip"]["by_kind"], "on_water": out["water_homes_zip"]["by_kind"], "in_sfha": {k: v["in_sfha"] for k, v in out["sfha_zip"]["by_kind"].items()}},
          open(os.path.join(D, "chart-homes.json"), "w"), indent=1)
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1, default=str)
print(json.dumps(out, indent=1, default=str)[:12000])

# ---- subdivisions (the county legal description before ';', phase words cut), largest 40 in the ZIP, with kind mix, water, flood zone and resale prices
def norm(s):
    s = (s or "").split(";")[0].strip().upper().replace("'", "")
    s = re.sub(r"\b(PH(ASE)?|SEC(TION)?|BLK?|BL)\b\s*[\dIVXA-Z\-& ]*$", "", s).strip(" ,-")
    s = re.sub(r"\b(S/D|S-D|SUBD?|SD|HPR|VLG)\b", "", s).strip(" ,-")
    for k, v in (("WATERFALL", "WATERFALL"), ("CAROLINA CROSSING", "CAROLINA CROSSING"), ("NORTH POINTE", "NORTH POINTE"), ("WINDJAMMER", "WINDJAMMER VILLAGE"), ("HEATHER GLEN", "HEATHER GLEN"),
                 ("BRIDGEWATER", "BRIDGEWATER"), ("BAYTREE", "BAY TREE"), ("BAY TREE", "BAY TREE"), ("MARINERS POINTE", "MARINERS POINTE"), ("LIGHTKEEPERS", "LIGHTKEEPERS VILLAGE"),
                 ("YACHT CLUB LIGHTKEEPERS", "LIGHTKEEPERS VILLAGE"), ("COQUINA HARBOUR", "COQUINA HARBOUR"), ("RIVER HILLS", "RIVER HILLS"), ("TIDEWATER", "TIDEWATER"), ("BELLACROFT", "BELLACROFT"),
                 ("SEA TRAIL", "SEA TRAIL"), ("ROYAL ESTATES", "ROYAL ESTATES"), ("RIVERVIEW H", "RIVERVIEW HEIGHTS"), ("STONES EDGE", "STONES EDGE"), ("CAPTAINS CHOICE", "CAPTAINS CHOICE"), ("WOODRIDGE", "WOODRIDGE")):
        if s.startswith(k): return v
    return re.sub(r"\s+", " ", s) or "(no subdivision)"
for p in HZ: p["sub"] = norm(p["LegalDescr"])
pin2 = {str(int(p["PIN"])): p for p in HZ}
subs = collections.defaultdict(lambda: {"homes": [], "sales": []})
for p in HZ: subs[p["sub"]]["homes"].append(p)
for s in inS:
    if not s["builder"]: subs[s["p"]["sub"]]["sales"].append(s)
rowsS = []
for k, v in subs.items():
    hs = v["homes"]
    if k == "(no subdivision)" or len(hs) < 60: continue
    xs = [p["x"] for p in hs]; ys = [p["y"] for p in hs]
    rowsS.append({"name": k, "homes": len(hs), "kinds": dict(collections.Counter(p["kind"] for p in hs)), "on_water": sum(p["wf"] for p in hs), "in_sfha": sum(bool(p["sfha"]) for p in hs),
                  "median_acres_houses": med([p["Acreage"] for p in hs if p["kind"] == "house" and p["Acreage"]]), "resales": summ([s["cons"] for s in v["sales"]]),
                  "center": [round(med(xs), 5), round(med(ys), 5)], "miles_from_center": round(math.hypot((med(xs) - CENTER[0]) * KX, (med(ys) - CENTER[1]) * KY) / 1609.344, 1)})
out["subdivisions"] = sorted(rowsS, key=lambda r: -r["homes"])
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1, default=str)
for r in out["subdivisions"][:45]: print(r["name"], r["homes"], r["kinds"], "water", r["on_water"], "sfha", r["in_sfha"], "acres", r["median_acres_houses"], "resale", r["resales"]["n"], r["resales"]["median"], "mi", r["miles_from_center"])
