#!/usr/bin/env python3
"""Every derived number for /buyers/waterfront-homes/. Run: RAW=<scratch> SALES=<out-of-state-buyers.json> python3 -I analyze.py <datadir>
Reads RAW/water-parcels.json, RAW/sale-shapes.json, RAW/hydro.json (fetch_county.py), RAW/listings-water.json (pull_listings.py),
RAW/nfip-policies-sf.json (pull_fema.py), <datadir>/raw/tides-2026.json (pull_tides.py), <datadir>/bridges.json.
Writes <datadir>/findings.json and the chart files chart-*.json. No addresses, PINs, owner names or MLS numbers are written."""
import json, os, sys, math, statistics, collections, datetime
from shapely.geometry import Polygon, Point
from shapely.ops import unary_union
from shapely import affinity
D = sys.argv[1]; RAW = os.environ["RAW"]
SALES = os.environ.get("SALES", os.path.join(D, "..", "..", "2026-10-d", "sell-out-of-state-buyers", "out-of-state-buyers.json"))
J = lambda n: json.load(open(os.path.join(RAW, n)))
K = math.cos(math.radians(33.75))
proj = lambda g: affinity.scale(g, xfact=111320 * K, yfact=110950, origin=(0, 0))   # metres, good to about 1 percent here
med = lambda a: statistics.median(a) if a else None
def q(a):
    a = sorted(a)
    if len(a) < 4: return {"n": len(a), "median": med(a)}
    qq = statistics.quantiles(a, n=4); return {"n": len(a), "median": med(a), "q1": qq[0], "q3": qq[2]}
HOUSE_LU = {"100", "101", "102", "110", "126"}
def kind(a):
    lu = str(a.get("LandUseCode")); ld = (a.get("LegalDescr") or "").upper()
    if lu in ("107", "135") or "HPR" in ld or " UNIT" in ld: return "condo"
    if lu in ("120", "121", "122", "130"): return "manufactured"
    if lu == "109": return "townhouse"
    if lu in HOUSE_LU: return "house"
    return "other"
LABEL = {"Intracoastal Waterway": "Intracoastal Waterway", "HOUSE CREEK": "Cherry Grove channels (House Creek)", "Waccamaw River": "Waccamaw River"}
def stretch(y, x, water):
    if water != "Intracoastal Waterway": return LABEL.get(water, water)
    if y >= 33.81: return "Waterway: Little River and North Myrtle Beach"
    if y >= 33.725: return "Waterway: Myrtle Beach and Carolina Forest"
    return "Waterway: Socastee"
out = {"made": datetime.datetime.now(datetime.timezone.utc).isoformat()}

# 1. Homes whose lot touches the county's water outline (layer 21), countywide
hydro = J("hydro.json")
W = collections.defaultdict(list)
for h in hydro:
    n = h["attributes"]["NAME"]
    if n.strip(): W[n].append(unary_union([Polygon(r).buffer(0) for r in h["geometry"]["rings"]]))
W = {n: unary_union(v) for n, v in W.items()}
WP = {n: proj(g) for n, g in W.items()}
wp = J("water-parcels.json")
homes = [x for x in wp if str(x["LandUseCode"]).startswith("1") and (x.get("MarketImprv") or 0) > 0]
def centre(x):
    try: c = unary_union([Polygon(r).buffer(0) for r in x["g"]["rings"]]).centroid; return c.y, c.x
    except Exception: return None, None
cnt = collections.Counter(); lots = collections.Counter()
for x in homes:
    y, xx = centre(x)
    if y is None: continue
    cnt[(stretch(y, xx, x["water"][0]), kind(x))] += 1
for x in wp:
    if str(x["LandUseCode"]).startswith("1") and not (x.get("MarketImprv") or 0) > 0:
        y, xx = centre(x)
        if y is not None: lots[stretch(y, xx, x["water"][0])] += 1
by = collections.defaultdict(dict)
for (s, k), n in cnt.items(): by[s][k] = n
out["homes_on_water"] = {"rule": "a parcel with a county land-use code starting with 1 and a building value above 0 whose outline comes within 15 m of a polygon in the county's hydrography layer (parcelapp layer 21). Murrells Inlet's creeks, the Garden City and Pawleys marsh creeks and the lakes are not in that layer, so their homes are not counted.",
    "by_stretch": dict(by), "houses_total": sum(n for (s, k), n in cnt.items() if k == "house"), "all_homes_total": sum(cnt.values()),
    "vacant_residential_lots_by_stretch": dict(lots), "water_bodies_in_layer": sorted({h["attributes"]["NAME"] for h in hydro})}

# 2. House sales on the water vs. nearby, county deeds 2025-10-01 to 2026-09-30 (2026-10-d kept sales)
sales = json.load(open(SALES))["sales"]
shapes = {int(x["PIN"]): x for x in J("sale-shapes.json")}
rows = []
for s in sales:
    if s.get("condo") or not s.get("lat"): continue
    p = int(s["pin"]); sh = shapes.get(p)
    if not sh or str(sh["LandUseCode"]) not in HOUSE_LU or not sh.get("g"): continue
    g = proj(unary_union([Polygon(r).buffer(0) for r in sh["g"]["rings"]]))
    d = {n: g.distance(w) for n, w in WP.items() if n in LABEL}
    n = min(d, key=d.get)
    rows.append({"price": s["cons"], "builder": s["builder"], "lat": s["lat"], "lon": s["lon"], "water": n if d[n] <= 15 else None, "near": n, "dist": d[n], "pt": proj(Point(s["lon"], s["lat"]))})
sale_out = {}
for n in LABEL:
    on = [r for r in rows if r["water"] == n and r["price"] >= 10000]
    off = [r for r in rows if r["water"] is None and r["price"] >= 10000 and any(r["pt"].distance(o["pt"]) <= 1000 for o in on)]
    sale_out[LABEL[n]] = {"on_water": q([r["price"] for r in on]), "on_water_builder": sum(r["builder"] for r in on), "on_water_under_10000_dropped": sum(1 for r in rows if r["water"] == n and r["price"] < 10000),
                          "within_1km_not_on_water": q([r["price"] for r in off]),
                          "ratio_medians": round(med([r["price"] for r in on]) / med([r["price"] for r in off]), 2) if on and off else None}
    # by stretch for the waterway
    if n == "Intracoastal Waterway":
        st = collections.defaultdict(list); sto = collections.defaultdict(list)
        for r in on: st[stretch(r["lat"], r["lon"], n)].append(r)
        for k, v in st.items():
            offk = [r for r in rows if r["water"] is None and r["price"] >= 10000 and any(r["pt"].distance(o["pt"]) <= 1000 for o in v)]
            sale_out[k] = {"on_water": q([r["price"] for r in v]), "within_1km_not_on_water": q([r["price"] for r in offk]), "ratio_medians": round(med([r["price"] for r in v]) / med([r["price"] for r in offk]), 2) if offk else None}
out["sales"] = {"source": "Horry County Register of Deeds, deeds recorded 2025-10-01 to 2026-09-30, the kept home sales of batch 2026-10-d (data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json)",
    "rule": "houses only (land use 100, 101, 102, 110, 126); on the water = parcel outline within 15 m of the county's water outline; nearby = a house sale not on the water within 1 km of an on-water sale on the same water; deeds under $10,000 dropped",
    "house_sales_tested": len(rows), "groups": sale_out}

# 3. Active listings by kind of water (CRM map API, aggregate only)
try:
    L = J("listings-water.json")
    H = L["homes"]; S = {k: set(v) for k, v in L["sets"].items()}
    OUTSIDE = {"Manning", "Awendaw", "Mullins", "Andrews"}   # SC addresses outside Horry County and the Georgetown County coast
    def sc(m): return H[m].get("state") == "SC" and H[m].get("city") not in OUTSIDE
    def stats(ms):
        ms = [m for m in ms if sc(m)]
        pr = [H[m]["price"] for m in ms if H[m]["price"]]
        ppsf = [H[m]["price"] / H[m]["sqft"] for m in ms if H[m]["price"] and H[m]["sqft"]]
        return {"n": len(ms), "median_price": med(pr), "median_per_sqft": round(med(ppsf)) if ppsf else None}
    lst = {"pulled": L["pulled"], "api_totals": L["api_totals"], "truncated": L["truncated"], "source_line": (L.get("meta") or {}).get("source"), "rule": "Horry County and the Georgetown County coast: South Carolina addresses, less Manning, Awendaw, Mullins and Andrews; houses unless named. Lake and pond are one set in the CRM (identical), so they are one kind here."}
    dock = S.get("house+private_dock", set())
    for k in ["waterfront", "water_ocean", "water_icw", "water_canal", "water_creek", "water_marsh", "water_river", "water_lake", "water_pond", "deep_water", "boat_slip"]:
        ms = S.get("house+" + k, set())
        st = stats(ms); st["with_private_dock"] = stats(ms & dock)["n"]; st["with_dock"] = stats(ms & dock); st["without_dock"] = stats(ms - dock)
        lst["house+" + k] = st
    lst["house+private_dock"] = stats(dock)
    lst["house+private_dock_not_waterfront_flag"] = stats(dock - S.get("house+waterfront", set()))
    wf = S.get("house+waterfront", set())
    lake_or_pond = S.get("house+water_lake", set()) | S.get("house+water_pond", set())
    other_water = set().union(*[S.get("house+" + k, set()) for k in ["water_ocean", "water_icw", "water_canal", "water_creek", "water_marsh", "water_river"]])
    lst["house_waterfront_lake_or_pond_only"] = stats((wf & lake_or_pond) - other_water)
    lst["house_waterfront_on_moving_water"] = stats(wf & other_water)
    lst["house_waterfront_no_water_kind"] = stats(wf - lake_or_pond - other_water)
    lst["lake_and_pond_sets_identical"] = S.get("house+water_lake") == S.get("house+water_pond")
    for t in ["condo", "townhouse"]:
        lst[t + "+water_ocean"] = stats(S.get(t + "+water_ocean", set())); lst[t + "+waterfront"] = stats(S.get(t + "+waterfront", set())); lst[t + "+water_icw"] = stats(S.get(t + "+water_icw", set()))
    by_city = collections.Counter(H[m]["city"] for m in S.get("house+private_dock", set()) if sc(m))
    lst["house_dock_by_city"] = by_city.most_common()
    lst["house_icw_by_city"] = collections.Counter(H[m]["city"] for m in S.get("house+water_icw", set()) if sc(m)).most_common()
    lst["house+waterfront+nohoa"] = stats(S.get("house+waterfront+nohoa", set()))
    lst["house+waterfront+nohoa"]["by_kind"] = {k: stats(S.get("house+waterfront+nohoa", set()) & S.get("house+" + k, set()))["n"] for k in ["water_ocean", "water_icw", "water_canal", "water_creek", "water_marsh", "water_river", "water_lake"]}
    lst["house+waterfront+nohoa"]["with_private_dock"] = stats(S.get("house+waterfront+nohoa", set()) & dock)["n"]
    lst["house+waterfront+nohoa"]["by_city"] = collections.Counter(H[m]["city"] for m in S.get("house+waterfront+nohoa", set()) if sc(m)).most_common()
    lst["house_waterfront_by_city"] = collections.Counter(H[m]["city"] for m in wf if sc(m)).most_common()
    lst["house_lake_by_city"] = collections.Counter(H[m]["city"] for m in lake_or_pond if sc(m)).most_common()
    lst["house_waterfront_under_300k"] = {"all": stats({m for m in wf if (H[m]["price"] or 0) < 300000})["n"], "lake_or_pond": stats({m for m in wf & lake_or_pond if (H[m]["price"] or 0) < 300000})["n"], "river": stats({m for m in wf & S.get("house+water_river", set()) if (H[m]["price"] or 0) < 300000})["n"]}
    lst["not_sc_dropped"] = sum(1 for m in H if not sc(m))
    wfs = {m for m in wf if sc(m)}
    mv = (set().union(*[S.get("house+" + k, set()) for k in ["water_canal", "water_creek", "water_marsh", "water_icw", "water_river"]]) & wfs) - S.get("house+water_ocean", set())
    def sq(ms): v = [H[m]["sqft"] for m in ms if sc(m) and H[m]["sqft"]]; return med(v)
    lst["tidal_or_river_waterfront"] = {"rule": "listed as waterfront and naming a canal, creek, marsh, the Intracoastal Waterway or a river, and not the ocean", "all": stats(mv), "with_dock": dict(stats(mv & dock), median_sqft=sq(mv & dock)), "without_dock": dict(stats(mv - dock), median_sqft=sq(mv - dock))}
    lst["waterfront_flag_by_kind"] = {k: stats(S.get("house+" + k, set()) & wfs)["n"] for k in ["water_ocean", "water_canal", "water_creek", "water_marsh", "water_icw", "water_river", "water_lake"]}
    lst["kind_flag_not_waterfront"] = {k: stats(S.get("house+" + k, set()) - wfs)["n"] for k in ["water_icw", "water_creek", "water_marsh", "water_river"]}
    lst["waterfront_under_300k_by_city"] = collections.Counter(H[m]["city"] for m in wfs if (H[m]["price"] or 0) < 300000).most_common()
    KINDS = [("water_lake", "A lake or pond"), ("water_canal", "A canal or channel"), ("water_ocean", "The ocean"), ("water_river", "A river"), ("water_icw", "The Intracoastal Waterway"), ("water_creek", "A tidal creek"), ("water_marsh", "The marsh")]
    json.dump({"what": "Houses for sale listed as waterfront, by the water each listing names (a listing can name more than one), CRM active listings in aggregate (CCMLS), pulled " + L["pulled"][:10],
               "rule": lst["rule"], "total_waterfront_houses": lst["house+waterfront"]["n"], "lake_or_pond_only": lst["house_waterfront_lake_or_pond_only"]["n"],
               "rows": [{"kind": lab, "key": k, "n": lst["waterfront_flag_by_kind"][k]} for k, lab in KINDS],
               "dock_compare": lst["tidal_or_river_waterfront"]}, open(os.path.join(D, "chart-listings.json"), "w"), indent=1)
    out["listings"] = lst
except FileNotFoundError:
    out["listings"] = "not pulled"

# 4. NFIP policy cost, single-family homes, by zone
try:
    r = J("nfip-policies-sf.json")["NfipPolicies"]
    def zg(z):
        z = (z or "").upper()
        return "V" if z.startswith("V") else ("A" if z.startswith("A") else ("X" if z else "unknown"))
    G = collections.defaultdict(list)
    for x in r:
        if x.get("policyCost") is None: continue
        z = zg(x.get("ratedFloodZone")); pr = "home" if x.get("primaryResidenceIndicator") else "second"
        for k in (z + "/all", z + "/" + pr, "all/all", "zip" + x["reportedZipCode"] + "/" + z): G[k].append(x["policyCost"])
    out["nfip"] = {"source": "OpenFEMA NfipPolicies v3, single-family (occupancyType 1 or 11), policies that began 2025-06-01 to 2026-05-31, ZIPs " + ", ".join(sorted({x["reportedZipCode"] for x in r})),
                   "what": "policyCost: what the policyholder paid for the year, premium plus fees and surcharges", "groups": {k: q(v) for k, v in sorted(G.items()) if len(v) >= 10}}
except FileNotFoundError:
    out["nfip"] = "not pulled"

# 5. Tides and bridges (data files)
tides = json.load(open(os.path.join(D, "raw", "tides-2026.json")))
out["tides"] = {k: {kk: v[kk] for kk in ("name", "kind", "mean_range_ft", "max_range_ft", "min_low_ft") if kk in v} for k, v in tides.items() if "mean_range_ft" in v}
br = json.load(open(os.path.join(D, "bridges.json")))["rows"]
out["bridges"] = {"fixed_65": sum(1 for b in br if b["kind"] == "fixed"), "swing": [[b["name"], b["mile"], b["clear_ft"]] for b in br if b["kind"] == "swing"],
                  "lowest_fixed_ft": min(b["clear_ft"] for b in br if b["kind"] == "fixed"), "rail": [[b["name"], b["mile"], b["clear_ft"]] for b in br if b["kind"] == "railroad"],
                  "miles_state_line_to_socastee": round(371.0 - 340.8, 1)}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1, default=str)

# Map layers: the county's water outlines (simplified), bridge points, tide stations, inlets
feats = []
for n, g in W.items():
    if n in ("Intracoastal Waterway", "Waccamaw River", "HOUSE CREEK", "Little River", "DUNN SOUND CREEK"):
        gg = g.intersection(Polygon([(-79.2, 33.55), (-78.5, 33.55), (-78.5, 33.95), (-79.2, 33.95)])).simplify(0.0003)
        feats.append({"type": "Feature", "properties": {"layer": "water", "name": LABEL.get(n, n.title())}, "geometry": json.loads(json.dumps(gg.__geo_interface__))})
for b in json.load(open(os.path.join(D, "bridges.json")))["rows"]:
    if b.get("lat"): feats.append({"type": "Feature", "properties": {"layer": "bridge", "kind": b["kind"], "name": b["name"], "mile": b["mile"], "clear_ft": b["clear_ft"]}, "geometry": {"type": "Point", "coordinates": [b["lng"], b["lat"]]}})
ST = {"8661070": (33.655, -78.9183), "8660265": (33.835, -78.6333), "8660121": (33.87, -78.6083), "8660642": (33.7667, -78.815), "8660854": (33.7133, -78.9217), "8660983": (33.6867, -79.005), "8660275": (33.835, -79.0417), "8661529": (33.5517, -79.0367), "8661989": (33.435, -79.1267)}
for k, v in tides.items():
    if "mean_range_ft" in v and k in ST: feats.append({"type": "Feature", "properties": {"layer": "tide", "station": v["name"], "mean_range_ft": v["mean_range_ft"]}, "geometry": {"type": "Point", "coordinates": [ST[k][1], ST[k][0]]}})
for nm, (y, x) in {"Little River Inlet": (33.8475, -78.5450), "Murrells Inlet": (33.5260, -79.0290)}.items():
    feats.append({"type": "Feature", "properties": {"layer": "inlet", "name": nm}, "geometry": {"type": "Point", "coordinates": [x, y]}})
json.dump({"type": "FeatureCollection", "note": "Water: Horry County parcelapp layer 21. Bridges: bridges.json. Tide stations: NOAA CO-OPS station positions (mdapi). Inlet points: placed at the jetty mouths for labels only; check against the aerial before drawing.", "features": feats}, open(os.path.join(D, "map-water.geojson"), "w"))

# Charts
json.dump({"what": "Average rise and fall of the tide in 2026, feet (NOAA predictions)", "rows": [{"station": v["name"], "kind": v["kind"], "mean_range_ft": v["mean_range_ft"]} for v in out["tides"].values()]}, open(os.path.join(D, "chart-tides.json"), "w"), indent=1)
json.dump({"what": "Middle house sale price, on the water and within 1 km but not on it, deeds recorded 2025-10-01 to 2026-09-30", "rows": [{"water": k, "on": v["on_water"], "near": v["within_1km_not_on_water"], "ratio": v["ratio_medians"]} for k, v in sale_out.items()]}, open(os.path.join(D, "chart-sales.json"), "w"), indent=1, default=str)
print(json.dumps({k: out[k] for k in ("homes_on_water", "sales", "bridges", "tides")}, indent=1, default=str)[:9000])
