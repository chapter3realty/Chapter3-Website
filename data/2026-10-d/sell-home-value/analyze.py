"""Findings for /sell/home-value/ from public records and aggregate listing counts.
Inputs:
  SALES = <web>/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (Horry County deeds Oct 2025-Sep 2026, home sales; see that folder's README)
  RAW/parcels-values.json, addresses.json, flood-sfha.json, ocean.json, cap-stats.json (fetch_county.py)
  RAW/listings-active.json (pull_listings.py), raw/fhfa-34820.csv (the CBSA 34820 rows of https://www.fhfa.gov/hpi/download/quarterly_datasets/hpi_at_metro.csv), raw/horry-county.json, raw/redfin-estimate.html (this folder)
  PLACES = <scratch>/sell-out-of-state-buyers/raw/places.json (Census TIGERweb places, from that folder's fetch_points.py)
Output: findings.json (no names, addresses, PINs or deed book/page). The worked example's PINs are written to RAW/worked-example-private.json only.
Usage: RAW=<scratch raw> SALES=<path> PLACES=<path> python3 -I analyze.py <datadir>"""
import sys, os, json, math, re, csv, statistics as st, collections
D = sys.argv[1]; RAW = os.environ.get("RAW", os.path.join(D, "raw"))
SALES = os.environ["SALES"]; PLACES = os.environ["PLACES"]
S = json.load(open(SALES))["sales"]
P = {str(int(p["PIN"])).zfill(11): p for p in json.load(open(os.path.join(RAW, "parcels-values.json")))}
K = math.cos(math.radians(33.7)); M = 111320.0
def med(v): return st.median(v) if v else None
def qs(v):
    v = sorted(v)
    if len(v) < 4: return None
    q = st.quantiles(v, n=4, method="inclusive"); return [round(q[0]), round(q[2])]
def r1000(x): return int(round(x / 1000.0) * 1000) if x is not None else None
# ---- geometry helpers
def inside(x, y, rings):
    c = False
    for ring in rings:
        for i in range(len(ring) - 1):
            (x1, y1), (x2, y2) = ring[i], ring[i + 1]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def bbox(rings):
    xs = [p[0] for r in rings for p in r]; ys = [p[1] for r in rings for p in r]; return min(xs), min(ys), max(xs), max(ys)
oc = json.load(open(os.path.join(RAW, "ocean.json")))
SEG = [(r[i], r[i + 1]) for f in oc["features"] for r in f["geometry"]["rings"] for i in range(len(r) - 1)]
def ocean_m(lon, lat):
    best = 1e12
    for (x1, y1), (x2, y2) in SEG:
        ax, ay = (x1 - lon) * K * M, (y1 - lat) * M; bx, by = (x2 - lon) * K * M, (y2 - lat) * M
        dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy
        t = 0 if L == 0 else max(0, min(1, -(ax * dx + ay * dy) / L))
        d = math.hypot(ax + t * dx, ay + t * dy)
        if d < best: best = d
    return best
FL = []
for f in json.load(open(os.path.join(RAW, "flood-sfha.json"))):
    rings = f["geometry"]["rings"]; FL.append((bbox(rings), rings, f["attributes"]["FLD_ZONE"]))
def flood_zone(lon, lat):
    for (a, b, c, d), rings, z in FL:
        if a <= lon <= c and b <= lat <= d and inside(lon, lat, rings): return z
    return None
PL = json.load(open(PLACES))
PLB = [(bbox(p["rings"]), p) for p in PL]
def place(lon, lat):
    for (a, b, c, d), p in PLB:
        if a <= lon <= c and b <= lat <= d and inside(lon, lat, p["rings"]): return p["name"]
    return None
HC = json.load(open(os.path.join(D, "raw", "horry-county.json")))["features"][0]["geometry"]["rings"]
# ---- sales
def is_condo(x): return x["condo"] or (P.get(x["pin"], {}).get("LandUseCode") == "107")
AREA_NAME = {"Myrtle Beach city": "Myrtle Beach (city)", "North Myrtle Beach city": "North Myrtle Beach (city)", "Surfside Beach town": "Surfside Beach",
             "Conway city": "Conway (city)", "Carolina Forest CDP": "Carolina Forest", "Socastee CDP": "Socastee", "Forestbrook CDP": "Forestbrook",
             "Red Hill CDP": "Red Hill", "Garden City CDP": "Garden City", "Little River CDP": "Little River", "Loris city": "Loris (city)", "Aynor town": "Aynor"}
def area(x):
    p = x.get("place")
    if p in AREA_NAME: return AREA_NAME[p]
    if p == "outside any Census place" and x.get("postal_city"):
        pc = x["postal_city"].title()
        return {"Myrtle Beach": "Myrtle Beach mailing address, outside the city", "Conway": "Conway mailing address, outside the city",
                "Longs": "Longs", "Murrells Inlet": "Murrells Inlet (Horry County side)", "Little River": "Little River mailing address, outside Little River",
                "Loris": "Loris mailing address, outside the city", "Surfside Beach": "Surfside Beach mailing address, outside the town",
                "Aynor": "Aynor mailing address, outside the town", "Galivants Ferry": "Galivants Ferry"}.get(pc)
    return None
for x in S:
    x["c"] = is_condo(x); x["mv"] = P.get(x["pin"], {}).get("MarketProp"); x["area"] = area(x)
    if "lat" in x:
        x["ocean_m"] = ocean_m(x["lon"], x["lat"]); x["sfha"] = flood_zone(x["lon"], x["lat"])
# A sale with no parcel point or address (most often a condo unit with no parcel polygon) takes the area most common
# among the other sales in its building or subdivision (county legal description before ';'), when that group has one.
GA = collections.defaultdict(collections.Counter)
for x in S:
    if x["area"] and x["group"]: GA[x["group"]][x["area"]] += 1
for x in S:
    x["area_from_group"] = False
    if not x["area"] and x["group"] and GA.get(x["group"]):
        a, n = GA[x["group"]].most_common(1)[0]
        if n >= 2 and n >= 0.8 * sum(GA[x["group"]].values()): x["area"] = a; x["area_from_group"] = True
R = [x for x in S if not x["builder"]]
F = {"meta": {"sales_source": "Horry County Register of Deeds index (AcclaimWeb, DEED 001), recorded 2025-10-01 to 2026-09-30, home sales as filtered in data/2026-10-d/sell-out-of-state-buyers (13,194). Resale = seller not matched as a builder.",
              "condo_rule": "condo = county land use code 107 or legal description contains HPR; every other residential parcel with a building is 'house' (houses, townhomes, manufactured homes on their own lot)."}}
F["area_coverage"] = {"resales": len(R), "with_area": sum(1 for x in R if x["area"]), "from_group": sum(1 for x in R if x["area_from_group"]),
                     "condo_resales": sum(1 for x in R if x["c"]), "condo_with_area": sum(1 for x in R if x["c"] and x["area"])}
F["counts"] = {"sales": len(S), "resales": len(R), "builder": len(S) - len(R), "resale_condo": sum(x["c"] for x in R), "resale_house": sum(not x["c"] for x in R)}
def grp(xs): 
    v = [x["cons"] for x in xs]; return {"n": len(v), "median": r1000(med(v)) if v else None, "iqr": [r1000(z) for z in qs(v)] if len(v) >= 4 else None}
F["county_all"] = {"resale_house": grp([x for x in R if not x["c"]]), "resale_condo": grp([x for x in R if x["c"]]),
                   "new_house": grp([x for x in S if x["builder"] and not x["c"]]), "new_condo": grp([x for x in S if x["builder"] and x["c"]])}
A = collections.defaultdict(list)
for x in R:
    if x["area"]: A[x["area"]].append(x)
F["by_area"] = sorted([{"area": k, "house": grp([x for x in v if not x["c"]]), "condo": grp([x for x in v if x["c"]])} for k, v in A.items() if len(v) >= 30],
                      key=lambda r: -(r["house"]["n"] + r["condo"]["n"]))
F["by_area_rule"] = "Area = the Census place (city, town or CDP) containing the parcel's center point; outside any place, the mailing city of the county address point; a sale with neither takes its building's or subdivision's area when 2+ and 80%+ of that group's placed sales share one area. Areas with 30+ resales. A cell with fewer than 20 sales should not be printed."
# ---- monthly resale medians (recorded month)
MO = collections.defaultdict(lambda: {"house": [], "condo": []})
for x in R: MO[x["date"][:7].replace("/", "-")]["condo" if x["c"] else "house"].append(x["cons"])
F["by_month"] = {m: {t: {"n": len(v), "median": r1000(med(v))} for t, v in d.items()} for m, d in sorted(MO.items())}
# ---- methods test: 2026 resales, estimate before the sale, compared with the recorded price
T = [x for x in R if x["date"] >= "2026/01" and "lat" in x and x["mv"]]
Rp = [x for x in R if "lat" in x and x["mv"]]
def km(a, b): return math.hypot((a["lon"] - b["lon"]) * K * 111.32, (a["lat"] - b["lat"]) * 111.32)
E = collections.defaultdict(lambda: collections.defaultdict(list)); far = []
examples = []
for x in T:
    prior = [y for y in Rp if y["c"] == x["c"] and y["date"] < x["date"] and y["pin"] != x["pin"]]
    if len(prior) < 6: continue
    near = sorted(prior, key=lambda y: km(x, y))[:6]; far.append(km(x, near[-1]))
    comp = med([y["cons"] for y in near]); adj = x["mv"] * med([y["cons"] / y["mv"] for y in near])
    t = "condo" if x["c"] else "house"
    for k, v in (("neighbors_median", comp / x["cons"] - 1), ("county_value", x["mv"] / x["cons"] - 1), ("neighbors_adjusted_by_county_value", adj / x["cons"] - 1)):
        E["all"][k].append(v); E[t][k].append(v)
    if not x["c"] and x["area"] == "Carolina Forest": examples.append((x, near, comp, adj))
def summ(v):
    a = [abs(z) for z in v]
    return {"n": len(v), "median_miss_pct": round(100 * med(a), 1), "within_5_pct": round(100 * sum(z <= .05 for z in a) / len(a), 1),
            "within_10_pct": round(100 * sum(z <= .10 for z in a) / len(a), 1), "over_20_pct": round(100 * sum(z > .20 for z in a) / len(a), 1),
            "estimate_above_price_pct": round(100 * sum(z > 0 for z in v) / len(v), 1), "median_signed_pct": round(100 * med(v), 1)}
F["methods_test"] = {"rule": "Each 2026 resale (recorded Jan-Sep 2026) with a parcel point and a county value. neighbors_median = median price of the 6 nearest resales of the same type (condo or house) recorded before it in the pull (from Oct 2025). county_value = the parcel's county market value (2024 reassessment value; ATI reset only takes effect at Dec 31 of the sale year, so 2026 sales still show the pre-sale value). neighbors_adjusted_by_county_value = the home's county value times the median of (price / county value) for the same 6 sales. Miss = estimate / recorded price - 1.",
                     "median_distance_to_6th_sale_km": round(med(far), 2), **{t: {k: summ(v) for k, v in d.items()} for t, d in E.items()}}
# worked example: the Carolina Forest house whose three misses sit closest to the all-house medians
mh = F["methods_test"]["house"]
def score(e):
    x, near, comp, adj = e
    return abs(abs(comp / x["cons"] - 1) * 100 - mh["neighbors_median"]["median_miss_pct"]) + abs(abs(x["mv"] / x["cons"] - 1) * 100 - mh["county_value"]["median_miss_pct"]) + abs(abs(adj / x["cons"] - 1) * 100 - mh["neighbors_adjusted_by_county_value"]["median_miss_pct"])
if examples:
    x, near, comp, adj = min(examples, key=score)
    F["worked_example"] = {"rule": "A Carolina Forest house resale recorded in 2026, chosen as the one whose three misses are closest to the median misses for all houses (typical, not best). Identity kept out of the public file.",
        "price": r1000(x["cons"]), "county_value": r1000(x["mv"]), "recorded_month": x["date"][:7], "same_subdivision_as_sale": None,
        "six_sales": [{"price": r1000(y["cons"]), "county_value": r1000(y["mv"]), "distance_mi": round(km(x, y) / 1.609, 2), "months_before": round((int(x["date"][:4]) * 12 + int(x["date"][5:7]) - int(y["date"][:4]) * 12 - int(y["date"][5:7]))), "same_group": y["group"] == x["group"], "price_to_county": round(y["cons"] / y["mv"], 3)} for y in near],
        "neighbors_median": r1000(comp), "adjusted": r1000(adj), "miss_neighbors_pct": round(100 * (comp / x["cons"] - 1), 1), "miss_county_pct": round(100 * (x["mv"] / x["cons"] - 1), 1), "miss_adjusted_pct": round(100 * (adj / x["cons"] - 1), 1)}
    F["worked_example"]["same_subdivision_as_sale"] = sum(s["same_group"] for s in F["worked_example"]["six_sales"])
    json.dump({"pin": x["pin"], "bp": x["bp"], "group": x["group"], "near": [{"pin": y["pin"], "bp": y["bp"], "group": y["group"]} for y in near]}, open(os.path.join(RAW, "worked-example-private.json"), "w"), indent=1)
# ---- condos against the county value, by distance from the ocean
def band(m): return "under 0.1 mile" if m < 161 else "0.1 to 0.5 mile" if m < 805 else "0.5 to 2 miles" if m < 3219 else "over 2 miles"
F["county_value_vs_price_2026_by_type_and_ocean"] = {t: {b: summ([x["mv"] / x["cons"] - 1 for x in T if (x["c"] == (t == "condo")) and band(x["ocean_m"]) == b]) for b in ["under 0.1 mile", "0.1 to 0.5 mile", "0.5 to 2 miles", "over 2 miles"] if any((x["c"] == (t == "condo")) and band(x["ocean_m"]) == b for x in T)} for t in ("condo", "house")}
# ---- flood zone
W = [x for x in R if "lat" in x]
F["flood"] = {"rule": "FEMA high-risk zone (SFHA) polygons from Horry County GIS layer 19 (SFHA_TF = T); parcel center point inside.",
              "resales_with_point": len(W), "in_sfha": sum(1 for x in W if x["sfha"]), "pct": round(100 * sum(1 for x in W if x["sfha"]) / len(W), 1),
              "by_type": {t: {"n": sum(1 for x in W if x["c"] == (t == "condo")), "in_sfha": sum(1 for x in W if x["c"] == (t == "condo") and x["sfha"])} for t in ("condo", "house")},
              "zones": dict(collections.Counter(x["sfha"] for x in W if x["sfha"]))}
G = collections.defaultdict(list)
for x in W:
    if not x["c"] and x["group"]: G[x["group"]].append(x)
inn, out = [], []; ng = 0
for g, xs in G.items():
    a = [x for x in xs if x["sfha"]]; b = [x for x in xs if not x["sfha"]]
    if len(xs) < 6 or len(a) < 2 or len(b) < 2: continue
    ng += 1
    for x in xs:
        o = med([y["cons"] for y in xs if y is not x]); (inn if x["sfha"] else out).append(x["cons"] / o)
F["flood"]["same_subdivision_houses"] = {"groups": ng, "in_sfha": {"n": len(inn), "median_vs_neighbors": round(med(inn), 3) if inn else None}, "outside": {"n": len(out), "median_vs_neighbors": round(med(out), 3) if out else None},
    "rule": "house resales in a subdivision (legal description before ';') with 6+ sales and 2+ each side; each price over the median of the other sales in the group"}
# ---- tax cap, county-wide
C = json.load(open(os.path.join(RAW, "cap-stats.json")))
F["cap"] = {"residential_with_building": C["all"]["n"], "taxable_below_market": C["taxable_below_market"]["n"],
            "pct_below": round(100 * C["taxable_below_market"]["n"] / C["all"]["n"], 1),
            "below_taxable_over_market": round(C["taxable_below_market"]["taxable"] / C["taxable_below_market"]["market"], 3),
            "all_taxable_over_market": round(C["all"]["taxable"] / C["all"]["market"], 3),
            "legal_res_4pct": {"n": C["legal_res_4pct"]["n"], "below": C["legal_res_4pct_below"]["n"], "pct_below": round(100 * C["legal_res_4pct_below"]["n"] / C["legal_res_4pct"]["n"], 1)},
            "other_6pct": {"n": C["other_6pct"]["n"], "below": C["other_6pct_below"]["n"], "pct_below": round(100 * C["other_6pct_below"]["n"] / C["other_6pct"]["n"], 1)},
            "rule": "Horry County GIS layer 24, land use 1xx with a building value. 4% vs 6% split by AssessedProp / TaxableProp (parcels with no assessed value are in 'all' only)."}
# ---- active listings, aggregate
L = json.load(open(os.path.join(RAW, "listings-active.json")))
H = [h for h in L["homes"].values() if h["lat"] and h["lng"] and inside(h["lng"], h["lat"], HC) and h["price"]]
for h in H: h["om"] = ocean_m(h["lng"], h["lat"])
def ppsf(xs):
    v = [h["price"] / h["sqft"] for h in xs if h["sqft"] and h["sqft"] >= 250]
    return {"n": len(v), "median_asking_per_sqft": round(med(v)) if v else None, "median_asking": r1000(med([h["price"] for h in xs])) if xs else None, "median_sqft": round(med([h["sqft"] for h in xs if h["sqft"]])) if xs else None}
F["listings"] = {"pulled": L["pulled"], "in_horry": len(H), "by_type": {t: len([h for h in H if h["type"] == t]) for t in ("house", "townhouse", "condo", "manufactured")},
                 "rule": "CRM public map API, active for-sale listings, aggregate only; inside the Census Horry County boundary; price per square foot uses listings with 250+ sq ft.",
                 "condo_by_ocean": {b: ppsf([h for h in H if h["type"] == "condo" and band(h["om"]) == b]) for b in ["under 0.1 mile", "0.1 to 0.5 mile", "0.5 to 2 miles", "over 2 miles"]},
                 "house_by_ocean": {b: ppsf([h for h in H if h["type"] == "house" and band(h["om"]) == b]) for b in ["under 0.1 mile", "0.1 to 0.5 mile", "0.5 to 2 miles", "over 2 miles"]}}
# ---- FHFA
rows = [r for r in csv.reader(open(os.path.join(D, "raw", "fhfa-34820.csv"))) if r[1] == "34820" and r[4] not in ("-", "")]
F["fhfa_myrtle_beach_msa"] = {"series": [[int(r[2]), int(r[3]), float(r[4])] for r in rows if int(r[2]) >= 2016], "rule": "FHFA All-Transactions House Price Index, Myrtle Beach-Conway-North Myrtle Beach MSA (CBSA 34820), 1995Q1 = 100, not seasonally adjusted."}
s = F["fhfa_myrtle_beach_msa"]["series"]; last = s[-1]
def at(y, q): return next(v for (a, b, v) in s if a == y and b == q)
F["fhfa_myrtle_beach_msa"]["latest"] = {"quarter": f"{last[0]}Q{last[1]}", "index": last[2], "one_year_pct": round(100 * (last[2] / at(last[0] - 1, last[1]) - 1), 1),
                                        "five_year_pct": round(100 * (last[2] / at(last[0] - 5, last[1]) - 1), 1), "peak": max(s, key=lambda r: r[2])}
# ---- Redfin
t = open(os.path.join(D, "raw", "redfin-estimate.html")).read().replace('\\"', '"')
F["redfin_horry"] = {m.group(1): {k: json.loads(m.group(0) + "]}")[k] for k in ("transactionCount", "estimateCount", "medianError", "errorsWithin5", "errorsWithin10", "errorsWithin20")}
                     for m in re.finditer(r'\{"pipelineType":"(\w+)","segmentName":"Horry County"[^{}]*?"childRegions":\[', t)}
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in F.items() if k not in ("fhfa_myrtle_beach_msa",)}, indent=1)[:12000])
