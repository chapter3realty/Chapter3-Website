#!/usr/bin/env python3
"""Every derived number for /submarkets/conway/. Writes findings.json and the chart files (aggregates only: no addresses, PINs or owner names).
Inputs: RAW (fetch_county.py, pull_listings.py outputs; kept out of the repo), SALES (Horry County deed sales Oct 2025 - Sep 2026 from
data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json), NFIP (data/2026-10-d/buyers-undisclosed-flooding/raw/nfip-claims-horry-slim.json),
HMA (data/2026-10-d/buyers-undisclosed-flooding/other-findings.json), and this folder's raw/ (USGS, NWS, FEMA policies, Census, HUD).
Run: RAW=<scratch> SALES=<file> NFIP=<file> HMA=<file> python3 -I analyze.py <datadir>"""
import sys, os, json, re, math, collections, statistics as st, datetime
import numpy as np, shapely
from shapely.geometry import Polygon, LineString, MultiLineString, shape
from shapely.ops import unary_union
D = sys.argv[1]; R = os.path.join(D, "raw"); RAW = os.environ["RAW"]
L = lambda n: json.load(open(os.path.join(RAW, n)))
def esri(f):
    g = None
    for r in f["geometry"]["rings"]:
        p = Polygon(r).buffer(0); g = p if g is None else g.symmetric_difference(p)
    return g
def med(v): v = sorted(v); return st.median(v) if v else None
def q(v, p):  # inclusive quartile, position 1 + (n-1) p
    v = sorted(v); k = (len(v) - 1) * p; f = math.floor(k); c = min(f + 1, len(v) - 1); return v[f] + (v[c] - v[f]) * (k - f)
out = {"made": "analyze.py", "run": datetime.datetime.now(datetime.timezone.utc).isoformat()}
city = esri(L("city.json")[0]); shapely.prepare(city)
sfz = unary_union([esri(f) for f in L("sfz.json")]); shapely.prepare(sfz)
sfha = unary_union([esri(f) for f in L("sfha.json")]); shapely.prepare(sfha)
out["city_area_sq_mi"] = round(city.area * 69.05 * 57.37, 1)  # degrees to miles at 33.8 N (approximate)
TOWN = (-79.047814, 33.836003)  # USGS GNIS place point for Conway (same point as affordable-facts rows 46 and 50)
out["town_point"] = {"lon": TOWN[0], "lat": TOWN[1], "in_city": bool(shapely.contains_xy(city, *TOWN))}
def miles(x, y): return math.hypot((x - TOWN[0]) * 57.37, (y - TOWN[1]) * 69.05)
# ---- homes: residential parcels with a building (LandUseCode 1xx, MarketImprv > 0); location = the parcel's address point, else polygon center
P = L("parcels.json"); A = L("addr.json")
apt = {}
for a in A:
    if a.get("PIN"): apt.setdefault(int(a["PIN"]), a)
for p in P:
    a = apt.get(int(p["PIN"]))
    if a: p["x"], p["y"], p["postal"], p["street"] = a["x"], a["y"], (a["POSTAL_CITY"] or "").upper(), a["STREETNAME"]
    else:
        c = p["c"]["rings"][0]; p["x"], p["y"], p["postal"], p["street"] = sum(v[0] for v in c) / len(c), sum(v[1] for v in c) / len(c), "", None
X = np.array([p["x"] for p in P]); Y = np.array([p["y"] for p in P])
inC, inZ, inH = shapely.contains_xy(city, X, Y), shapely.contains_xy(sfz, X, Y), shapely.contains_xy(sfha, X, Y)
HOUSE = {"100", "101", "102", "110", "126"}; MFG = {"120", "121"}
def norm(s):
    s = (s or "").split(";")[0].strip().upper()
    s = re.sub(r"\b(PH(ASE)?|SEC(TION)?)\s*[\dIVX\-AB ]+.*$", "", s).strip(" ,-")
    s = re.sub(r"\b(SUBD?|SD|S/D|HPR)\b", "", s).strip(" ,-").replace("PLNTN", "PLANTATION").replace("PLTN", "PLANTATION").replace("'", "")
    if "WILD WING" in s or "WILDWING" in s: s = "WILD WING"
    if s.startswith("ST JOHNS RIDGE"): s = "ST JOHNS RIDGE"
    if s.startswith("CARSENS FERRY"): s = "CARSENS FERRY"
    if s.startswith("THE THICKET"): s = "THE THICKET"
    if s.startswith("AVIARY VILLAGE"): s = "AVIARY VILLAGE"
    if s.startswith("SHERWOOD"): s = "SHERWOOD"
    if s.startswith("JASMINE WOODS"): s = "JASMINE WOODS"
    if s.startswith("WOODCREEK"): s = "WOODCREEK"
    return re.sub(r"\s+", " ", s)
for i, p in enumerate(P):
    p["in"], p["z"], p["h"] = bool(inC[i]), bool(inZ[i]), bool(inH[i]); p["g"] = norm(p["LegalDescr"]); p["mi"] = miles(p["x"], p["y"])
CI = [p for p in P if p["in"]]
cnt = lambda ps: {"homes": len(ps), "in_sfha": sum(p["h"] for p in ps), "in_sfz": sum(p["z"] for p in ps), "in_either": sum(p["h"] or p["z"] for p in ps), "in_sfz_not_sfha": sum(p["z"] and not p["h"] for p in ps)}
out["homes_in_city"] = cnt(CI) | {"houses": sum(p["LandUseCode"] in HOUSE for p in CI), "manufactured": sum(p["LandUseCode"] in MFG for p in CI), "with_address_point": sum(int(p["PIN"]) in apt for p in CI),
                                 "by_tax_district": collections.Counter(p["TaxDistrict"] for p in CI).most_common(5)}
for k in ("in_sfha", "in_sfz", "in_either"): out["homes_in_city"]["pct_" + k] = round(100 * out["homes_in_city"][k] / len(CI), 1)
# Conway mailing address: homes whose address point says POSTAL_CITY Conway, inside and outside the city limits
CP = [p for p in P if p["postal"] == "CONWAY"]
out["conway_mailing_homes"] = {"all_in_box": len(CP), "inside_city": sum(p["in"] for p in CP), "outside_city": sum(not p["in"] for p in CP),
                               "pct_inside": round(100 * sum(p["in"] for p in CP) / len(CP), 1),
                               "address_points_countywide_by_zip": {str(x["attributes"]["ZIPCODE"]): x["attributes"]["n"] for x in L("conway-postal.json")},
                               "outside_city_flood": cnt([p for p in CP if not p["in"]])}
# by subdivision (normalized legal description), inside the city, 25+ homes
G = collections.defaultdict(list)
for p in CI: G[p["g"]].append(p)
subs = []
for g, ps in G.items():
    if len(ps) < 25 or not g: continue
    subs.append({"name": g, "homes": len(ps), "in_sfz": sum(p["z"] for p in ps), "in_sfha": sum(p["h"] for p in ps), "in_either": sum(p["z"] or p["h"] for p in ps),
                 "miles_from_town_point": round(miles(st.mean(p["x"] for p in ps), st.mean(p["y"] for p in ps)), 1),
                 "lon": round(st.mean(p["x"] for p in ps), 5), "lat": round(st.mean(p["y"] for p in ps), 5), "median_county_value": round(med([p["MarketProp"] for p in ps]))})
subs.sort(key=lambda s: -s["in_either"])
out["subdivisions_flood"] = subs
# streets inside the city with the most homes in the Florence flood extent
SZ = collections.Counter(p["street"] for p in CI if p["z"] and p["street"]); SA = collections.Counter(p["street"] for p in CI if p["street"])
out["streets_most_homes_in_sfz"] = [[s, n, SA[s]] for s, n in SZ.most_common(25)]
# ---- Florence and Matthew road closures that touch the city limits
def lines(f):
    g = f.get("geometry") or {}; ps = g.get("paths") or []
    return MultiLineString(ps) if ps else None
# The layers hold some closures from other events; keep closures that began in each storm's window.
WIN = {"florence": ("2018-09-10", "2018-10-31"), "matthew": ("2016-09-25", "2016-11-30")}
for nm, fn in (("florence", "closures-florence.json"), ("matthew", "closures-matthew.json")):
    rows = []
    for f in L(fn):
        g = lines(f)
        if g is None or not city.intersects(g): continue
        a = f["attributes"]; days = ((a["OpenedDate"] or 0) - (a["ClosedDate"] or 0)) / 86400000 if a["OpenedDate"] and a["ClosedDate"] else None
        cd = datetime.datetime.utcfromtimestamp(a["ClosedDate"] / 1000).date().isoformat() if a["ClosedDate"] else ""
        if not (WIN[nm][0] <= cd <= WIN[nm][1]): continue
        rows.append({"street": a["FULLNAME"], "reason": a["CLOSEREASON"], "closed": datetime.datetime.utcfromtimestamp(a["ClosedDate"] / 1000).date().isoformat() if a["ClosedDate"] else None,
                     "opened": datetime.datetime.utcfromtimestamp(a["OpenedDate"] / 1000).date().isoformat() if a["OpenedDate"] else None, "days": round(days, 1) if days is not None else None})
    fl = [r for r in rows if r["reason"] == "Flood"]
    bystreet = collections.defaultdict(list)
    for r in fl: bystreet[r["street"]].append(r["days"] or 0)
    out["closures_" + nm] = {"segments_touching_city": len(rows), "flood_segments": len(fl), "flood_streets": len(bystreet),
                             "first_closed": min((r["closed"] for r in fl if r["closed"]), default=None), "last_opened": max((r["opened"] for r in fl if r["opened"]), default=None),
                             "longest_by_street_days": sorted([[s, round(max(v), 1)] for s, v in bystreet.items()], key=lambda x: -x[1])[:25],
                             "median_days_flood_segment": med([r["days"] for r in fl if r["days"] is not None])}
# ---- deed sales Oct 2025 - Sep 2026, inside the city limits
S = json.load(open(os.environ["SALES"]))["sales"]
pin = {str(int(p["PIN"])).zfill(11): p for p in P}
CS = []
for s in S:
    if s.get("lon") is None or not shapely.contains_xy(city, s["lon"], s["lat"]): continue
    p = pin.get(s["pin"]); s["z"] = bool(p and p["z"]); s["h"] = bool(p and p["h"]); s["g"] = p["g"] if p else None; s["mi"] = miles(s["lon"], s["lat"]); s["use"] = p["LandUseCode"] if p else None
    CS.append(s)
def summ(v):
    v = [x["cons"] for x in v]
    return {"n": len(v), "median": med(v), "q1": round(q(v, .25)) if v else None, "q3": round(q(v, .75)) if v else None} if v else {"n": 0}
res = [s for s in CS if not s["builder"]]
out["sales_in_city"] = {"all": summ(CS), "resales": summ(res), "resales_not_condo": summ([s for s in res if not s["condo"]]), "resales_condo": summ([s for s in res if s["condo"]]),
                        "builder": summ([s for s in CS if s["builder"]]), "resales_in_flood_either": summ([s for s in res if s["z"] or s["h"]]),
                        "resales_outside_flood": summ([s for s in res if not (s["z"] or s["h"])]), "buyer_mailing_state_not_sc_pct": round(100 * sum(s["where"] != "SC" for s in CS) / len(CS), 1)}
# areas of the city, by where they sit (see AREAS below; defined from the subdivision table, in plain words)
def area(x, y, mi_):
    if mi_ <= 1.0: return "downtown"
    if x > -79.03 and y < 33.83: return "us501"          # out US 501 toward the university: Wild Wing, Kiskadee Parke, Aviary Village, Coastal Point West, Meadow Farms
    if y >= 33.877: return "north"                        # north on SC 905 and US 701: Ridgewood West, Maple Hill, Kingston Oaks, Country Manor
    if y >= 33.852: return "crabtree"                      # across Crabtree Swamp, north of downtown: Sherwood, Country Club Forest, Kingston Bay, Midtown Village, Rivertown Row, Elmhurst
    return "west"                                          # west and south of downtown, toward US 378 and US 701 South: Rosehaven, Oak Glenn, New Castle, Pecan Grove, Woodland Lakes
AREAS = collections.defaultdict(lambda: {"homes": [], "sales": []})
for p in CI: AREAS[area(p["x"], p["y"], p["mi"])]["homes"].append(p)
for s in res: AREAS[area(s["lon"], s["lat"], s["mi"])]["sales"].append(s)
out["areas"] = {}
for k, v in AREAS.items():
    hs = v["homes"]; ss = [s for s in v["sales"] if not s["condo"]]
    top = collections.Counter(p["g"] for p in hs if p["g"]).most_common(8)
    out["areas"][k] = cnt(hs) | {"pct_in_either": round(100 * sum(p["z"] or p["h"] for p in hs) / len(hs), 1), "resales_not_condo": summ(ss),
                                 "median_acres_houses": med([p["Acreage"] for p in hs if p["LandUseCode"] in HOUSE and p["Acreage"]]), "largest_subdivisions": top}
# ---- NFIP paid claims, City of Conway community
C = json.load(open(os.environ["NFIP"]))
paid = lambda r: (r["netBuildingPaymentAmount"] or 0) + (r["netContentsPaymentAmount"] or 0) + (r["netIccPaymentAmount"] or 0)
cw = [r for r in C["rows"] if r["nfipCommunityName"] == "CONWAY, CITY OF"]
by = collections.defaultdict(lambda: {"claims": 0, "paid_claims": 0, "paid": 0.0})
for r in cw:
    b = by[r["yearOfLoss"]]; b["claims"] += 1
    if paid(r) > 0: b["paid_claims"] += 1; b["paid"] += paid(r)
out["nfip_city_of_conway"] = {"source": C["source"], "pulled": C["pulled"], "by_year": {y: {k: round(v) if k == "paid" else v for k, v in b.items()} for y, b in sorted(by.items())},
                              "paid_claims_all": sum(b["paid_claims"] for b in by.values()), "paid_all": round(sum(b["paid"] for b in by.values())),
                              "paid_claims_2019_on": sum(b["paid_claims"] for y, b in by.items() if y >= 2019)}
f18 = [paid(r) for r in cw if r["yearOfLoss"] == 2018 and paid(r) > 0]; out["nfip_city_of_conway"]["median_paid_2018"] = round(med(f18))
# ---- FEMA buyouts (Hazard Mitigation Grant Program acquisitions) by the City of Conway
H = json.load(open(os.environ["HMA"]))["hma_projects"]
hc = [h for h in H if h["subapplicantName"] == "Conway" and h["primaryActivity"] == "Acquisition"]
out["hmgp_conway_acquisitions"] = {"by_disaster": dict(collections.Counter()), "projects": hc}
agg = collections.defaultdict(lambda: [0, 0.0])
for h in hc: agg[h["disasterNumber"]][0] += h["numberBuildingLocations"]; agg[h["disasterNumber"]][1] += h["totalSubapplicationAmount"]
out["hmgp_conway_acquisitions"]["by_disaster"] = {k: {"buildings": v[0], "amount": round(v[1])} for k, v in agg.items()}
# ---- USGS daily gage height, Waccamaw River at Conway Marina (02110704); NWS flood stages and crests (CNWS1)
rows = [l.rstrip("\n").split("\t") for l in open(os.path.join(R, "usgs-02110704-dv-gage.rdb")) if l.startswith("USGS")]
dv = [(r[2], float(r[3])) for r in rows if r[3] not in ("", "Ice", "Eqp")]
N = json.load(open(os.path.join(R, "nwps-CNWS1.json")))
cat = {k: v["stage"] for k, v in N["flood"]["categories"].items()}
def spell(a, b, thr):
    seg = [(d, v) for d, v in dv if a <= d <= b]; ab = [d for d, v in seg if v >= thr]
    return {"first": ab[0], "last": ab[-1], "days": len(ab)} if ab else None
out["river"] = {"site": "USGS 02110704 WACCAMAW RIVER AT CONWAY MARINA AT CONWAY, SC; NWS CNWS1", "flood_categories_ft": cat,
                "florence": {"peak_daily_mean": max((x for x in dv if "2018-09-10" <= x[0] <= "2018-11-15"), key=lambda x: x[1]), "above_minor": spell("2018-09-10", "2018-11-15", cat["minor"]), "above_major": spell("2018-09-10", "2018-11-15", cat["major"])},
                "matthew": {"peak_daily_mean": max((x for x in dv if "2016-10-01" <= x[0] <= "2016-12-15"), key=lambda x: x[1]), "above_minor": spell("2016-10-01", "2016-12-15", cat["minor"]), "above_major": spell("2016-10-01", "2016-12-15", cat["major"])},
                "days_at_or_above_minor_by_year": {}}
yr = collections.defaultdict(lambda: [0, 0])
for d, v in dv: yr[d[:4]][0] += 1; yr[d[:4]][1] += v >= cat["minor"]
out["river"]["days_at_or_above_minor_by_year"] = {y: {"days_with_data": a, "days_at_or_above_minor": b} for y, (a, b) in sorted(yr.items())}
hc_ = N["flood"]["crests"]["historic"]
out["river"]["top_crests"] = [[c["occurredTime"][:10], c["stage"]] for c in sorted(hc_, key=lambda c: -c["stage"])[:10]]
out["river"]["crests_at_or_above_major"] = sorted([[c["occurredTime"][:10], c["stage"]] for c in hc_ if c["stage"] >= cat["major"]])
# one flood event = crests at or above major stage less than 30 days apart; keep the highest crest of each event
ev = []
for d_, s_ in out["river"]["crests_at_or_above_major"]:
    t = datetime.date.fromisoformat(d_)
    if ev and (t - ev[-1]["last"]).days < 30:
        ev[-1]["last"] = t
        if s_ > ev[-1]["stage"]: ev[-1]["stage"], ev[-1]["date"] = s_, d_
    else: ev.append({"date": d_, "stage": s_, "last": t})
out["river"]["major_events"] = [[e["date"], e["stage"]] for e in ev]
out["river"]["major_event_years_2015_2025"] = sorted({e["date"][:4] for e in ev if "2015" <= e["date"][:4] <= "2025"})
dec = collections.Counter()
for d, s_ in out["river"]["crests_at_or_above_major"]: dec[d[:3] + "0s"] += 1
out["river"]["major_crests_by_decade"] = dict(sorted(dec.items()))
out["river"]["impacts"] = {str(i["stage"]): i["statement"] for i in N["flood"]["impacts"]}
# chart: the Florence and Matthew rises, daily mean stage
json.dump({"title": "Waccamaw River at Conway, daily average height, after Matthew (2016) and Florence (2018)", "units": "feet on the USGS gauge at the Conway Marina",
           "flood_stage": cat["minor"], "major_flood_stage": cat["major"],
           "florence": [[d, v] for d, v in dv if "2018-09-08" <= d <= "2018-10-31"], "matthew": [[d, v] for d, v in dv if "2016-10-01" <= d <= "2016-11-23"],
           "landfall": {"florence": "2018-09-14", "matthew": "2016-10-08"}}, open(os.path.join(D, "chart-river-rise.json"), "w"), indent=0)
json.dump({"title": "Every flood on the Waccamaw at Conway that reached major flood stage (14 ft), highest crest of each", "units": "feet on the gauge", "major_flood_stage": cat["major"], "rows": out["river"]["major_events"], "note": "NWS historic crest list for CNWS1; crests less than 30 days apart counted as one flood. The list may miss floods in years with no record."}, open(os.path.join(D, "chart-major-crests.json"), "w"), indent=1)
# ---- NFIP policy cost, ZIPs 29526 and 29527, single-family, policies that began June 2025 - May 2026
out["nfip_policies"] = {}
for z in ("29526", "29527"):
    for g in ("x", "a"):
        rr = json.load(open(os.path.join(R, "nfip-policies-%s-%s.json" % (z, g))))["NfipPolicies"]
        prem = [r["totalInsurancePremiumOfThePolicy"] for r in rr if r["totalInsurancePremiumOfThePolicy"] is not None]
        cost = [r["policyCost"] for r in rr if r.get("policyCost") is not None]
        prim = [r["policyCost"] for r in rr if r.get("policyCost") is not None and r.get("primaryResidenceIndicator") is True]
        out["nfip_policies"][z + "_" + g] = {"n": len(rr), "premium_median": med(prem), "premium_q1": q(prem, .25) if prem else None, "premium_q3": q(prem, .75) if prem else None,
                                             "cost_median": med(cost), "cost_q1": q(cost, .25) if cost else None, "cost_q3": q(cost, .75) if cost else None, "primary_n": len(prim), "primary_cost_median": med(prim)}
# ---- active listings with a Conway mailing address, aggregate only
LS = L("listings-conway.json"); hm = list(LS["homes"].values())
lx = np.array([h["lng"] or 0 for h in hm]); ly = np.array([h["lat"] or 0 for h in hm])
lin, lz, lh = shapely.contains_xy(city, lx, ly), shapely.contains_xy(sfz, lx, ly), shapely.contains_xy(sfha, lx, ly)
for i, h in enumerate(hm): h["in"], h["z"], h["h"] = bool(lin[i]), bool(lz[i]), bool(lh[i])
def lsum(v): pr = [h["price"] for h in v if h["price"]]; return {"n": len(v), "median_price": med(pr)}
houses = [h for h in hm if h["type"] == "house"]
out["listings"] = {"pulled": LS["pulled"], "meta_source": LS["meta"]["source"], "refreshedAt": LS["meta"]["refreshedAt"], "api_totals": LS["api_totals"],
                   "by_type": {t: lsum([h for h in hm if h["type"] == t]) for t in ("house", "townhouse", "condo", "manufactured", "land")},
                   "houses_inside_city": lsum([h for h in houses if h["in"]]), "houses_outside_city": lsum([h for h in houses if not h["in"]]),
                   "houses_in_sfha_or_sfz": sum(h["z"] or h["h"] for h in houses), "houses_one_acre_plus": sum((h["acres"] or 0) >= 1 for h in houses),
                   "houses_one_acre_plus_median": med([h["price"] for h in houses if (h["acres"] or 0) >= 1 and h["price"]]),
                   "houses_under_250k": sum((h["price"] or 0) < 250000 for h in houses), "houses_new_construction_tag": LS["api_totals"].get("house+new_construction"),
                   "houses_by_beds": dict(collections.Counter(h["beds"] for h in houses))}
# ---- resale price by Census place (not a builder, not an HPR unit), countywide, for the "is Conway the cheapest" check
rs = [x for x in S if not x["builder"] and not x["condo"]]
out["resale_by_place_not_condo"] = {"Horry County (all kept sales)": {"n": len(rs), "median": med([x["cons"] for x in rs])}}
for pl in ["Conway city", "Myrtle Beach city", "North Myrtle Beach city", "Carolina Forest CDP", "Socastee CDP", "Little River CDP", "Loris city", "Aynor town"]:
    v = [x["cons"] for x in rs if x["place"] == pl]; out["resale_by_place_not_condo"][pl] = {"n": len(v), "median": med(v)}
# ---- yearly property tax, calculation (rates: affordable-facts rows 62, 66, 75; 6 percent case from the 2026 levy sheet)
PRICE = 265000  # the rounded middle resale price of a house in the city (sales_in_city.resales_not_condo, $264,250; affordable page "about $265,000")
out["tax_calc"] = {"price": PRICE, "inside_city_4pct": round(PRICE * 0.04 * 0.1634), "inside_city_6pct": round(PRICE * 0.06 * (0.1712 + 0.1013)),
                   "outside_city_4pct_district100": round(PRICE * 0.04 * 0.0919 + 89.40), "outside_city_6pct_district100": round(PRICE * 0.06 * 0.2010 + 89.40),
                   "note": "4 percent inside: 171.2 + 101.3 - 109.1 = 163.4 mills; 6 percent inside: 171.2 + 101.3 = 272.5 mills; outside (district 100): 201.0 - 109.1 = 91.9 mills at 4 percent, 201.0 at 6 percent, plus the $89.40 county stormwater fee. Before any homestead exemption; tax is on the county's value, not the price."}
# ---- map layers for the page (simplified; aggregates only)
from shapely.geometry import mapping
clip = city.buffer(0.004)
def gj(g, props): return {"type": "Feature", "properties": props, "geometry": mapping(g)}
json.dump({"type": "FeatureCollection", "features": [gj(city.simplify(0.0002), {"name": "City of Conway (city limits), Horry County GIS layer 31"})]}, open(os.path.join(D, "map-city.geojson"), "w"))
json.dump({"type": "FeatureCollection", "features": [
    gj(sfha.intersection(clip).simplify(0.0001), {"name": "FEMA high-risk flood zone (SFHA), Horry County GIS layer 19"}),
    gj(sfz.intersection(clip).simplify(0.0001), {"name": "Where Florence's water reached (county Supplemental Flood Zone), HazardsMap layer 17"})]}, open(os.path.join(D, "map-flood-city.geojson"), "w"))
LBL = {}
for k, v in AREAS.items():
    hs = v["homes"]; LBL[k] = {"lon": round(st.median(p["x"] for p in hs), 5), "lat": round(st.median(p["y"] for p in hs), 5), "homes": len(hs)}
out["area_label_points"] = LBL
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1, default=str)
print(json.dumps({k: out[k] for k in ("homes_in_city", "conway_mailing_homes", "sales_in_city", "listings", "nfip_policies", "hmgp_conway_acquisitions")}, indent=1, default=str)[:9000])
