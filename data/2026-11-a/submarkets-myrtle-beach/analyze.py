#!/usr/bin/env python3
"""Findings for /submarkets/myrtle-beach/ from City of Myrtle Beach zoning, Horry County parcels, address points, FEMA zones and deeds,
and the CRM's active listings counted in aggregate.
Run: RAW=<scratch> SALES=<out-of-state-buyers.json> python3 -I analyze.py <datadir>
Needs fetch_gis.py, pull_listings.py and str_zones.py to have run. Writes <datadir>/findings.json (counts and medians only:
no names, addresses, PINs or deed book and page) and RAW/parcel-classes.json (per parcel, kept out of the repo)."""
import sys, os, json, statistics, collections, math, datetime
from shapely.geometry import Polygon, Point, MultiPolygon
from shapely.ops import unary_union
from shapely.strtree import STRtree
RAW = os.environ["RAW"]; DD = sys.argv[1]; SALES = os.environ["SALES"]
def J(n): return json.load(open(os.path.join(RAW, n)))
def esri(rings):
    """Esri rings to a shapely geometry: clockwise rings are outer, counter-clockwise are holes."""
    outer, holes = [], []
    for r in rings:
        a = sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))
        p = Polygon(r).buffer(0)
        (outer if a < 0 else holes).append(p)
    g = unary_union(outer) if outer else Polygon()
    return g.difference(unary_union(holes)) if holes else g
def med(xs): return round(statistics.median(xs), 0) if xs else None
def q(xs, k):
    if len(xs) < 4: return None
    return round(statistics.quantiles(xs, n=4)[k], 0)
def pct(a, b): return round(100 * a / b, 1) if b else None

# ---- City limits (county layer 31 MYRTLE BEACH, same source as the Conway ledger) and the city's own layer, for comparison
CITY = unary_union([esri(f["geometry"]["rings"]) for f in J("city.json")])
CITY2 = unary_union([esri(f["geometry"]["rings"]) for f in J("citylimits-city.json")])
lat0 = 33.7; kx = math.cos(math.radians(lat0)) * 111320; ky = 110540
def area_sqmi(g):
    from shapely.ops import transform
    return transform(lambda x, y, z=None: (x * kx, y * ky), g).area / 2589988.11
out = {"meta": {"made": "analyze.py", "run": datetime.datetime.now(datetime.timezone.utc).isoformat()},
       "city": {"county_layer_sqmi": round(area_sqmi(CITY), 2), "city_layer_sqmi": round(area_sqmi(CITY2), 2),
                "sym_diff_sqmi": round(area_sqmi(CITY.symmetric_difference(CITY2)), 2)}}

def zone_class(code, row):
    """R districts other than RMV: never (the city's text). RMV: always (the city's text). Others: shaded on the city's map,
    measured with about 60 m of tolerance for the image fit (share of the polygon 60 percent or more)."""
    share = row["pink_px_60m"] / row["px"] if row["px"] else 0
    if code == "RMV": return "str", share
    if code.startswith("R"): return "r_no", share
    if share >= 0.6: return "str", share
    return ("pud_no" if "PUD" in code else "other_no"), share
# ---- Zoning, with the city's visitor-accommodation map share per polygon (str_zones.py)
zp = json.load(open(os.path.join(DD, "zone-pink.json")))
zfeat = J("zoning.json")
ZONES = []
for f, row in zip(zfeat, zp["by_poly"]):
    code = (f["attributes"]["ZONING_DIS"] or "").strip()
    cls, share = zone_class(code, row)
    ZONES.append((esri(f["geometry"]["rings"]), code, cls, round(share, 2)))
ztree = STRtree([z[0] for z in ZONES])
def zone_of(pt):
    for i in ztree.query(pt):
        if ZONES[i][0].contains(pt): return ZONES[i]
    return None
zarea = collections.defaultdict(float)
for g, code, cls, sh in ZONES: zarea[cls] += area_sqmi(g)
out["zoning"] = {"polygons": len(ZONES), "sqmi_by_class": {k: round(v, 2) for k, v in zarea.items()},
                 "codes_str": sorted(set(c for g, c, cl, s in ZONES if cl == "str")),
                 "codes_partly_str": sorted(set(c for g, c, cl, s in ZONES if cl == "str") & set(c for g, c, cl, s in ZONES if cl != "str")),
                 "fit_iou": round(zp["fit_iou"], 3)}

# ---- Parts of the city, by zoning district (names from the county legal descriptions most common in each; see the ledger)
PARTS = {"grande_dunes": {"GRANDE DUNES PUD"},
         "market_common": {"CENTER POINTE PUD", "C6", "CLEMSON TRACT PUD", "ITAP PUD"},
         "arbor_glenn_meridian": {"ARBOR GLENN PUD"},
         "pine_lakes_pud": {"PINE LAKES COUNTRY CLUB PUD", "PINE LAKES ESTATES PUD"}}
def part_of(code):
    if code is None: return "none"
    for k, v in PARTS.items():
        if code in v: return k
    if code in ("R5", "R7", "R8", "R10", "R15", "R10BTW"): return "older_r_house_zones"
    return "rest"
# ---- FEMA zones (county layer 19)
fema = []
for f in J("sfha.json"):
    if f.get("geometry"): fema.append((esri(f["geometry"]["rings"]), f["attributes"]["FLD_ZONE"]))
ftree = STRtree([g for g, z in fema])
def fzone(pt):
    hits = [fema[i][1] for i in ftree.query(pt) if fema[i][0].contains(pt)]
    order = {"VE": 0, "AE": 1, "A": 2, "AO": 3}
    hz = sorted([h for h in hits if h in order], key=lambda z: order[z])
    if hz: return hz[0]
    return "X shaded" if hits else "X"

# ---- Parcels: homes inside the city
addr = J("addr.json"); pts = J("parcel-pts.json")
apin = {}
for a in addr:
    if a.get("PIN"): apin.setdefault(int(a["PIN"]), a)
aptree_pts = [Point(a["x"], a["y"]) for a in addr if a.get("ZIPCODE")]
aptree_meta = [a for a in addr if a.get("ZIPCODE")]
atree = STRtree(aptree_pts)
def near_zip(pt):
    i = atree.nearest(pt); return aptree_meta[i]["ZIPCODE"], aptree_meta[i].get("SUBDIVISION")
HOUSE = {"100", "101", "102", "110", "126"}
def kind(p):
    legal = p["LegalDescr"] or ""
    if p["LandUseCode"] == "107" or "HPR" in legal: return "condo"
    if p["LandUseCode"] in HOUSE: return "house"
    if p["LandUseCode"] in ("108", "135"): return "villa_townhouse"
    return "other"
rows = []
for p in J("parcels.json"):
    pin = int(p["PIN"]); a = apin.get(pin)
    if a: pt = Point(a["x"], a["y"]); zipc, sub = a.get("ZIPCODE"), a.get("SUBDIVISION")
    elif str(pin) in pts: pt = Point(*pts[str(pin)]); zipc, sub = near_zip(pt)
    else: continue
    if not CITY.contains(pt): continue
    z = zone_of(pt)
    ratio = (p["AssessedProp"] / p["TaxableProp"]) if p["TaxableProp"] else None
    rows.append({"kind": kind(p), "x": round(pt.x, 6), "y": round(pt.y, 6), "zip": zipc, "sub": sub,
                 "zcode": z[1] if z else None, "zcls": z[2] if z else "none", "fz": fzone(pt), "part": part_of(z[1] if z else None),
                 "own": None if ratio is None else ("4" if abs(ratio - 0.04) < 0.003 else ("6" if abs(ratio - 0.06) < 0.003 else "other")),
                 "state": (p["OwnerState"] or "").strip().upper(), "mkt": p["MarketProp"], "acres": p["Acreage"], "td": p["TaxDistrict"]})
json.dump(rows, open(os.path.join(RAW, "parcel-classes.json"), "w"))
def summ(xs):
    n = len(xs); st = collections.Counter(x["state"] for x in xs)
    return {"homes": n, "rate_4pct": sum(x["own"] == "4" for x in xs), "pct_4pct": pct(sum(x["own"] == "4" for x in xs), n),
            "rate_6pct": sum(x["own"] == "6" for x in xs), "pct_6pct": pct(sum(x["own"] == "6" for x in xs), n),
            "owner_mail_sc": st.get("SC", 0), "owner_mail_not_sc": n - st.get("SC", 0) - st.get("", 0),
            "pct_owner_mail_not_sc": pct(n - st.get("SC", 0) - st.get("", 0), n),
            "in_sfha": sum(x["fz"] in ("VE", "AE", "A", "AO") for x in xs), "pct_in_sfha": pct(sum(x["fz"] in ("VE", "AE", "A", "AO") for x in xs), n),
            "in_ve": sum(x["fz"] == "VE" for x in xs),
            "median_county_value": med([x["mkt"] for x in xs if x["mkt"]])}
H = {"all": summ(rows)}
for k in ("condo", "house", "villa_townhouse", "other"): H[k] = summ([r for r in rows if r["kind"] == k])
H["by_zone_class"] = {c: {k: summ([r for r in rows if r["zcls"] == c and (k == "all" or r["kind"] == k)]) for k in ("all", "condo", "house", "villa_townhouse")}
                      for c in ("str", "r_no", "pud_no", "other_no", "none")}
H["by_zip"] = {str(zc): {k: summ([r for r in rows if r["zip"] == zc and (k == "all" or r["kind"] == k)]) for k in ("all", "condo", "house")}
               for zc in sorted(set(r["zip"] for r in rows if r["zip"]))}
H["by_part"] = {k: {kk: summ([r for r in rows if r["part"] == k and (kk == "all" or r["kind"] == kk)]) for kk in ("all", "condo", "house")}
              for k in list(PARTS) + ["older_r_house_zones", "rest"]}
for k in H["by_part"]:
    xs = [r for r in rows if r["part"] == k and r["kind"] == "house"]
    H["by_part"][k]["house_median_acres"] = med([x["acres"] for x in xs if x["acres"]])
    H["by_part"][k]["center"] = [round(statistics.mean(x["x"] for x in xs), 5), round(statistics.mean(x["y"] for x in xs), 5)] if xs else None
H["by_tax_district"] = collections.Counter(r["td"] for r in rows).most_common(12)
H["zone_codes_houses"] = collections.Counter(r["zcode"] for r in rows if r["kind"] == "house").most_common(25)
# subdivisions with 40 or more houses: what kind of place each is
subs = collections.defaultdict(list)
for r in rows:
    if r["kind"] == "house" and r["sub"]: subs[r["sub"]].append(r)
H["subdivisions_houses"] = sorted([dict(name=k, **{kk: vv for kk, vv in summ(v).items() if kk in ("homes", "pct_4pct", "pct_owner_mail_not_sc", "pct_in_sfha", "median_county_value")},
                                       str_zone=sum(x["zcls"] == "str" for x in v), median_acres=med([x["acres"] for x in v if x["acres"]]),
                                       cx=round(statistics.mean(x["x"] for x in v), 5), cy=round(statistics.mean(x["y"] for x in v), 5))
                                  for k, v in subs.items() if len(v) >= 40], key=lambda d: -d["homes"])
out["homes_in_city"] = H

# ---- Homes with a Myrtle Beach mailing address: inside and outside the city (address points in the box)
mb_addr = [a for a in addr if (a.get("POSTAL_CITY") or "").upper() == "MYRTLE BEACH"]
res_pins = set(int(p["PIN"]) for p in J("parcels.json"))
seen = set(); inside = outside = 0
for a in mb_addr:
    pin = int(a["PIN"]) if a.get("PIN") else None
    if pin is None or pin not in res_pins or pin in seen: continue
    seen.add(pin)
    if CITY.contains(Point(a["x"], a["y"])): inside += 1
    else: outside += 1
out["mailing_address"] = {"note": "address points with POSTAL_CITY Myrtle Beach whose PIN is a residential parcel with a building in the box; one per PIN; condo units mostly have no own address point, so this counts buildings and houses, not units",
                          "inside_city": inside, "outside_city": outside, "pct_inside": pct(inside, inside + outside)}

# countywide: every address point with a Myrtle Beach mailing city whose parcel is residential with a building (fetch_mailing.py)
if os.path.exists(os.path.join(RAW, "mb-postal-landuse.json")):
    lu = J("mb-postal-landuse.json"); seen = set(); cin = cout = 0; zc = collections.Counter(); zin = collections.Counter()
    for a in J("mb-postal.json"):
        if not a.get("PIN"): continue
        pin = str(int(a["PIN"]))
        if pin in seen or pin not in lu: continue
        u, imp = lu[pin]
        if not (u or "").startswith("1") or not imp: continue
        seen.add(pin); inside_ = CITY.contains(Point(a["x"], a["y"]))
        cin += inside_; cout += (not inside_); zc[a.get("ZIPCODE")] += 1; zin[a.get("ZIPCODE")] += inside_
    out["mailing_address_countywide"] = {"note": "one per residential parcel with a building that has its own address point; condo units mostly share their building's point, so this counts houses, villas and buildings, not condo units",
                                         "inside_city": cin, "outside_city": cout, "pct_inside": pct(cin, cin + cout),
                                         "by_zip": {str(k): {"all": v, "inside_city": zin[k], "pct_inside": pct(zin[k], v)} for k, v in zc.most_common()}}
# ---- Deed sales (Horry County deeds recorded 2025-10-01 to 2026-09-30; kept-sale rules of the 2026-10-d ledger)
S = json.load(open(SALES))["sales"]
ins = []
for s in S:
    if s.get("lon") is None: continue
    pt = Point(s["lon"], s["lat"])
    if not CITY.contains(pt): continue
    z = zone_of(pt)
    s2 = dict(s, zcls=z[2] if z else "none", zcode=z[1] if z else None, fz=fzone(pt), zip=s.get("zip") or near_zip(pt)[0], part=part_of(z[1] if z else None))
    ins.append(s2)
def ssum(xs):
    pr = [x["cons"] for x in xs]
    oos = [x for x in xs if x.get("owner_is_grantee")]
    return {"n": len(xs), "median": med(pr), "q1": q(pr, 0), "q3": q(pr, 2),
            "matched_owner": len(oos), "buyer_mail_not_sc": sum(x["where"] not in ("SC", "BLANK") for x in oos),
            "pct_buyer_mail_not_sc": pct(sum(x["where"] not in ("SC", "BLANK") for x in oos), len(oos)),
            "company_buyer": sum(bool(x.get("company")) for x in xs)}
D = {"all": ssum(ins), "condo": ssum([s for s in ins if s["condo"]]), "not_condo": ssum([s for s in ins if not s["condo"]]),
     "builder": ssum([s for s in ins if s["builder"]]), "resale_not_condo": ssum([s for s in ins if not s["condo"] and not s["builder"]]),
     "resale_condo": ssum([s for s in ins if s["condo"] and not s["builder"]])}
D["by_zone_class"] = {c: {"condo": ssum([s for s in ins if s["zcls"] == c and s["condo"]]), "not_condo": ssum([s for s in ins if s["zcls"] == c and not s["condo"]])}
                      for c in ("str", "r_no", "pud_no", "other_no", "none")}
D["by_zip"] = {str(z): {"condo": ssum([s for s in ins if s.get("zip") == z and s["condo"]]), "not_condo": ssum([s for s in ins if s.get("zip") == z and not s["condo"]])}
               for z in sorted(set(s.get("zip") for s in ins if s.get("zip")))}
D["by_part"] = {k: {"condo": ssum([s for s in ins if s["part"] == k and s["condo"]]), "not_condo": ssum([s for s in ins if s["part"] == k and not s["condo"]]),
                    "resale_not_condo": ssum([s for s in ins if s["part"] == k and not s["condo"] and not s["builder"]])}
              for k in list(PARTS) + ["older_r_house_zones", "rest"]}
D["by_month"] = sorted(collections.Counter(s["date"][:7] for s in ins).items())
D["by_month_condo"] = sorted(collections.Counter(s["date"][:7] for s in ins if s["condo"]).items())
D["top_buyer_states"] = collections.Counter(s["owner_state"] for s in ins if s.get("owner_is_grantee") and s["where"] == "US").most_common(8)
# county comparison: every kept sale
D["county"] = {"condo_resale": ssum([s for s in S if s["condo"] and not s["builder"]]), "not_condo_resale": ssum([s for s in S if not s["condo"] and not s["builder"]])}
out["sales_in_city"] = D

# ---- Listings (CRM public map API, city=Myrtle Beach, aggregate only)
L = J("listings-mb.json")
homes = list(L["homes"].values())
li = []
for h in homes:
    if h["lat"] is None: continue
    pt = Point(h["lng"], h["lat"])
    z = zone_of(pt)
    li.append(dict(h, inside=CITY.contains(pt), zcls=z[2] if z else "none", fz=fzone(pt), part=part_of(z[1] if z else None)))
def lsum(xs):
    pr = [x["price"] for x in xs if x["price"]]
    ppsf = [x["price"] / x["sqft"] for x in xs if x["price"] and x["sqft"]]
    return {"n": len(xs), "median_ask": med(pr), "median_ask_per_sqft": med(ppsf)}
LS = {"api_totals": L["api_totals"], "pulled": L["pulled"], "refreshed": (L.get("meta") or {}).get("refreshedAt"), "truncated": L["truncated"],
      "all_mailing": {t: lsum([x for x in li if x["type"] == t]) for t in ("house", "townhouse", "condo")},
      "inside": {t: lsum([x for x in li if x["inside"] and x["type"] == t]) for t in ("house", "townhouse", "condo")},
      "outside": {t: lsum([x for x in li if not x["inside"] and x["type"] == t]) for t in ("house", "townhouse", "condo")},
      "inside_by_zone_class": {c: {t: lsum([x for x in li if x["inside"] and x["zcls"] == c and x["type"] == t]) for t in ("house", "townhouse", "condo")}
                               for c in ("str", "r_no", "pud_no", "other_no", "none")},
      "api_flag_vs_ours": {"api_inside_flag_and_ours": sum(1 for x in li if x["inside"] and "inside_city_limits" in x["flags"]),
                           "api_inside_flag_not_ours": sum(1 for x in li if not x["inside"] and "inside_city_limits" in x["flags"]),
                           "ours_not_api_flag": sum(1 for x in li if x["inside"] and "inside_city_limits" not in x["flags"])}}
LS["inside_by_part"] = {k: {t: lsum([x for x in li if x["inside"] and x["part"] == k and x["type"] == t]) for t in ("house", "townhouse", "condo")}
                        for k in list(PARTS) + ["older_r_house_zones", "rest"]}
# houses for sale inside the city: in a zone that allows nightly rentals vs not; what the listing says about short-term rentals
hin = [x for x in li if x["inside"] and x["type"] in ("house", "townhouse")]
LS["houses_inside"] = {"n": len(hin), "in_str_zone": sum(x["zcls"] == "str" for x in hin),
                       "listing_says_str_allowed": sum("str_allowed" in x["flags"] for x in hin),
                       "listing_says_str_allowed_not_str_zone": sum("str_allowed" in x["flags"] and x["zcls"] != "str" for x in hin)}
of = [x for x in li if x["inside"] and x["type"] == "condo" and "oceanfront_building" in x["flags"]]
LS["oceanfront_condos_inside"] = dict(lsum(of), str_flag=sum("str_allowed" in x["flags"] for x in of),
                                      in_str_zone=sum(x["zcls"] == "str" for x in of),
                                      by_beds={str(b): lsum([x for x in of if x["beds"] == b]) for b in (0, 1, 2, 3, 4)},
                                      price_bands={"under_200k": sum(1 for x in of if x["price"] and x["price"] < 200000),
                                                   "200_300k": sum(1 for x in of if x["price"] and 200000 <= x["price"] < 300000),
                                                   "300_500k": sum(1 for x in of if x["price"] and 300000 <= x["price"] < 500000),
                                                   "500k_up": sum(1 for x in of if x["price"] and x["price"] >= 500000)})
# months of supply, inside the city: active listings now / average monthly deed sales of the past 12 months
cn = sum(1 for x in li if x["inside"] and x["type"] == "condo"); hn = len(hin)
LS["months_supply_inside"] = {"condo_listings": cn, "condo_sales_12m": D["condo"]["n"], "condo_months": round(cn / (D["condo"]["n"] / 12), 1) if D["condo"]["n"] else None,
                              "house_th_listings": hn, "not_condo_sales_12m": D["not_condo"]["n"], "house_months": round(hn / (D["not_condo"]["n"] / 12), 1) if D["not_condo"]["n"] else None,
                              "note": "deed 'not condo' includes houses, villas and townhouses; listings here are house and townhouse types"}
out["listings"] = LS

# ---- Oceanfront condo buildings: deed sales whose point is within about 60 m of a listing the CRM marks as in an oceanfront building
ofpts = [Point(x["lng"], x["lat"]) for x in li if "oceanfront_building" in x["flags"]]
otree = STRtree(ofpts)
def near_of(pt):
    i = otree.nearest(pt); g = ofpts[i]
    return math.hypot((g.x - pt.x) * kx, (g.y - pt.y) * ky) < 60
blds = collections.defaultdict(list)
ofsales = []
for s in ins:
    if not s["condo"]: continue
    if near_of(Point(s["lon"], s["lat"])):
        ofsales.append(s); blds[s.get("group") or "?"].append(s)
D2 = {"oceanfront_condo_sales": ssum(ofsales), "buildings_with_a_sale": len(blds)}
top = sorted(blds.items(), key=lambda kv: -len(kv[1]))[:15]
D2["top_buildings"] = [dict(group=k, **ssum(v), lon=round(statistics.mean(x["lon"] for x in v), 5), lat=round(statistics.mean(x["lat"] for x in v), 5)) for k, v in top]
# active listings near each top building (within 60 m of the building's sale points), aggregate only
for b in D2["top_buildings"]:
    bp = Point(b["lon"], b["lat"])
    near = [x for x in li if x["type"] == "condo" and math.hypot((x["lng"] - b["lon"]) * kx, (x["lat"] - b["lat"]) * ky) < 80]
    b["listings_now"] = lsum(near)
out["oceanfront"] = D2

# ---- Worked example inputs (the page computes nothing new; these are the inputs)
mills_6 = 171.2 + 83.4      # 2026 county and school 171.2 + City of Myrtle Beach 83.4 (affordable-facts row 62)
out["tax"] = {"per_100k_6pct": round(100000 * 0.06 * mills_6 / 1000, 2), "per_100k_4pct_net": 404.00}
json.dump(out, open(os.path.join(DD, "findings.json"), "w"), indent=1, default=str)
print(json.dumps({k: out.get(k) for k in ("city", "zoning", "mailing_address", "mailing_address_countywide")}, indent=1, default=str))
