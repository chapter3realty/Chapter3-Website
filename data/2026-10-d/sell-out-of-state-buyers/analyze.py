"""Who bought Horry County homes, Oct 2025 - Sep 2026, by the buyer's tax-bill mailing state.
Inputs (raw/): deeds-*.json (AcclaimWeb DEED 001), parcels.json (layer 24), addresses.json (layer 22), stock-by-state*.json.
Output: out-of-state-buyers.json (every kept sale and every summary the page uses).
Usage: python3 -I analyze.py <datadir>"""
import sys, json, glob, os, re, statistics, collections, datetime
D = sys.argv[1]
# Raw downloads (deed index rows and parcel records carry owner names) stay outside the repo: set RAW, default <datadir>/raw.
RAW = os.environ.get("RAW", os.path.join(D, "raw")); os.makedirs(RAW, exist_ok=True)
rows = [r for f in sorted(glob.glob(os.path.join(RAW, "deeds-2*.json"))) for r in json.load(open(f))["Data"]]
P = {}
for p in json.load(open(os.path.join(RAW, "parcels.json"))): P[str(int(p["PIN"])).zfill(11)] = p
A = {}
for a in json.load(open(os.path.join(RAW, "addresses.json"))): A.setdefault(str(int(a["PIN"])).zfill(11), a)
BUILDER = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|H & H CONSTRUCTORS|RS PARKER|DRB GROUP|DREAM FINDERS|HOWELL HOMES|MILLROSE|LEWIS CONSTRUCTION|CHRIS MANNING|CAROLINA COTTAGE|HUNTER QUINN|BRADLEY JONES|SANDS BUILDING|OCEAN PALMS BUILDERS|INFINITY CUSTOM|ALMOND QUALITY|AG EHC|KL LB BUY|BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOMES OF|HOME BUILDERS|DEVELOPMENT")
TAXSALE = re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY")
CORR = re.compile(r"CORRECT|RE-RECORD")
COMPANY = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LP|LLP|LTD|PARTNERS|PARTNERSHIP|HOLDINGS|PROPERTIES|INVESTMENTS?|GROUP|ENTERPRISES|BANK|ASSOCIATION|FUND|REIT)\b")
CANADA = {"ON", "ONT", "ONTARIO", "QC", "QUEBEC", "NL", "NS", "BC", "BRITISH COLUMBIA", "AB", "NB", "MB", "PE", "SK", "NOVA SCOTIA", "NEW BRUNSWICK", "ALBERTA", "MANITOBA"}
US = set("AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY PR VI GU AE AP AA".split())
def where(st):
    s = (st or "").strip().upper()
    if s == "SC": return "SC"
    if s in US: return "US"
    if s in CANADA: return "CANADA"
    if s == "": return "BLANK"
    return "OTHER"
bp_parcels = collections.defaultdict(set)
for r in rows: bp_parcels[r["BookPage"]].add((r["ParcelNumber"] or "").strip())
counts = collections.Counter(); kept = []
for r in rows:
    pin = (r["ParcelNumber"] or "").strip(); c = r["Consideration"] or 0
    if c < 10000: counts["under_10000"] += 1; continue
    if not (pin.isdigit() and len(pin) == 11) or len(bp_parcels[r["BookPage"]]) > 1: counts["not_one_parcel"] += 1; continue
    if TAXSALE.search((r["DirectName"] or "") + " " + (r["IndirectName"] or "")) or CORR.search(r["Comments"] or ""): counts["taxsale_or_corrective"] += 1; continue
    p = P.get(pin)
    if not p: counts["not_in_parcel_layer"] += 1; continue
    if not ((p["LandUseCode"] or "").startswith("1") and (p["MarketImprv"] or 0) > 0): counts["not_residential_building"] += 1; continue
    counts["home_sales"] += 1
    db, dp = (p["DeedBook"] or "").strip().lstrip("0"), (p["DeedPage"] or "").strip().lstrip("0")
    b, pg = r["BookPage"].split("/")
    a = A.get(pin, {})
    kept.append({"bp": r["BookPage"], "pin": pin, "cons": c, "date": r["RecordDate"], "grantor": r["DirectName"], "grantee": r["IndirectName"],
                 "builder": bool(BUILDER.search(r["DirectName"] or "")), "owner_is_grantee": (db, dp) == (b.lstrip("0"), pg.lstrip("0")),
                 "owner_state": (p["OwnerState"] or "").strip().upper(), "owner_city": (p["OwnerCity"] or "").strip(), "where": where(p["OwnerState"]),
                 "company": bool(COMPANY.search(r["IndirectName"] or "")), "condo": "HPR" in (p["LegalDescr"] or ""),
                 "legal": p["LegalDescr"], "group": (p["LegalDescr"] or "").split(";")[0].strip(), "postal_city": a.get("POSTAL_CITY"), "zip": a.get("ZIPCODE"),
                 "market_prop": p["MarketProp"]})
M = [k for k in kept if k["owner_is_grantee"]]
# place: Census TIGERweb place (city, town or CDP) containing the parcel's center point (raw/points.json, raw/places.json from fetch_points.py)
def inside(pt, rings):
    x, y = pt; c = False
    for ring in rings:
        for i in range(len(ring) - 1):
            (x1, y1), (x2, y2) = ring[i], ring[i + 1]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
if os.path.exists(os.path.join(RAW, "points.json")):
    PT = json.load(open(os.path.join(RAW, "points.json"))); PL = json.load(open(os.path.join(RAW, "places.json")))
    for k in kept:
        pt = PT.get(k["pin"]); k["place"] = None
        if pt:
            k["lon"], k["lat"] = round(pt[0], 5), round(pt[1], 5)
            for pl in PL:
                if inside(pt, pl["rings"]): k["place"] = pl["name"]; break
        if pt and not k["place"]: k["place"] = "outside any Census place"
def share(xs): 
    n = len(xs); o = sum(1 for x in xs if x["where"] in ("US", "CANADA", "OTHER"))
    return {"sales": n, "outside_sc": o, "pct_outside_sc": round(100 * o / n, 1) if n else None}
def med(v): return statistics.median(v) if v else None
S = {"filter_counts": dict(counts), "kept": len(kept), "matched_current_owner": len(M),
     "where_counts": dict(collections.Counter(x["where"] for x in M))}
S["all"] = share(M)
S["by_type"] = {"condo": share([x for x in M if x["condo"]]), "other": share([x for x in M if not x["condo"]])}
S["by_builder"] = {"builder": share([x for x in M if x["builder"]]), "resale": share([x for x in M if not x["builder"]])}
S["by_buyer_kind"] = {"company": share([x for x in M if x["company"]]), "person": share([x for x in M if not x["company"]])}
st = collections.Counter(x["owner_state"] for x in M if x["where"] in ("US", "CANADA", "OTHER"))
S["top_states"] = st.most_common(15)
S["canada"] = sum(1 for x in M if x["where"] == "CANADA")
bands = [(0, 200000), (200000, 300000), (300000, 400000), (400000, 500000), (500000, 750000), (750000, 1e12)]
S["by_price_band"] = {f"{int(a)}-{int(b) if b < 1e12 else 'up'}": share([x for x in M if a <= x["cons"] < b]) for a, b in bands}
S["by_place"] = {k: dict(share([x for x in M if x.get("place") == k]), condo=share([x for x in M if x.get("place") == k and x["condo"]]), other=share([x for x in M if x.get("place") == k and not x["condo"]])) for k, n in collections.Counter(x.get("place") for x in M).most_common(20)}
mon = collections.defaultdict(lambda: [0, 0])
for x in M:
    m = x["date"][:7]; mon[m][0 if x["where"] == "SC" else 1 if x["where"] in ("US", "CANADA", "OTHER") else 0] += 1
S["by_month"] = {m: {"sc": v[0], "outside_sc": v[1]} for m, v in sorted(mon.items())}
# price: median price per group, and paired comparison inside the same building or subdivision
S["median_price"] = {"sc": med([x["cons"] for x in M if x["where"] == "SC"]), "outside_sc": med([x["cons"] for x in M if x["where"] in ("US", "CANADA", "OTHER")])}
for t in ("condo", "other"):
    sub = [x for x in M if x["condo"] == (t == "condo")]
    S["median_price_" + t] = {"sc": med([x["cons"] for x in sub if x["where"] == "SC"]), "outside_sc": med([x["cons"] for x in sub if x["where"] in ("US", "CANADA", "OTHER")])}
G = collections.defaultdict(list)
for x in M:
    if x["where"] in ("SC", "US", "CANADA", "OTHER") and not x["builder"] and x["group"]: G[(x["group"], x["condo"])].append(x)
ratios = {"sc": [], "outside_sc": []}; ratios_t = {True: {"sc": [], "outside_sc": []}, False: {"sc": [], "outside_sc": []}}; ngroups = 0; nsales = 0
for (g, condo), xs in G.items():
    a = [x for x in xs if x["where"] == "SC"]; b = [x for x in xs if x["where"] != "SC"]
    if len(xs) < 6 or not a or not b: continue
    ngroups += 1; nsales += len(xs); m = med([x["cons"] for x in xs])
    for x in xs:
        k = "sc" if x["where"] == "SC" else "outside_sc"
        ratios[k].append(x["cons"] / m); ratios_t[condo][k].append(x["cons"] / m)
def q(v):
    v = sorted(v); n = len(v)
    return [round(statistics.quantiles(v, n=4, method="inclusive")[i], 4) for i in range(3)] if n > 3 else None
def loo(xs):
    # each sale against the median of the OTHER sales in its group, split by buyer side
    res = {"sc": [], "outside_sc": []}
    for x in xs:
        others = [y["cons"] for y in xs if y is not x]
        res["sc" if x["where"] == "SC" else "outside_sc"].append(x["cons"] / statistics.median(others))
    return res
LOO = {"all": {"sc": [], "outside_sc": []}, "condo": {"sc": [], "outside_sc": []}, "other": {"sc": [], "outside_sc": []}}
for (g, condo), xs in G.items():
    a = [x for x in xs if x["where"] == "SC"]; b = [x for x in xs if x["where"] != "SC"]
    if len(xs) < 6 or not a or not b: continue
    r = loo(xs)
    for k in r:
        LOO["all"][k] += r[k]; LOO["condo" if condo else "other"][k] += r[k]
S["same_place_leave_one_out"] = {t: {k: {"n": len(v), "median": round(med(v), 4), "quartiles": q(v), "mean": round(statistics.mean(v), 4),
    "pct_above_others_median": round(100 * sum(1 for z in v if z > 1) / len(v), 1)} for k, v in LOO[t].items()} for t in LOO}
S["same_place_test"] = {"groups": ngroups, "sales": nsales, "rule": "resale (not builder) sales in a building or subdivision (county legal description before ';') with 6+ matched sales and at least one buyer each side; each price divided by that group's median price",
    "median_ratio": {k: round(med(v), 4) for k, v in ratios.items()}, "n": {k: len(v) for k, v in ratios.items()},
    "condo": {k: (round(med(v), 4), len(v)) for k, v in ratios_t[True].items()}, "other": {k: (round(med(v), 4), len(v)) for k, v in ratios_t[False].items()}}
# stock: every residential parcel with a building, by owner mailing state
def stock(f):
    d = json.load(open(os.path.join(RAW, f)))
    r = {str(x["attributes"]["OwnerState"] or "").strip().upper(): 0 for x in d["features"]}
    for x in d["features"]: r[str(x["attributes"]["OwnerState"] or "").strip().upper()] += x["attributes"]["n"]
    t = sum(r.values()); sc = r.get("SC", 0); blank = r.get("", 0)
    return {"parcels": t, "sc": sc, "blank": blank, "outside_sc": t - sc - blank, "pct_outside_sc": round(100 * (t - sc - blank) / t, 1),
            "top": sorted(((v, k) for k, v in r.items() if k not in ("SC", "")), reverse=True)[:12]}
S["stock"] = {"all": stock("stock-by-state.json"), "condo": stock("stock-by-state-condo.json"), "other": stock("stock-by-state-house.json")}
PUBLIC = [{k: v for k, v in x.items() if k not in ("grantor", "grantee", "owner_city")} for x in kept]
json.dump({"meta": {"made": "analyze.py", "note": "Names of grantors, grantees and owner cities are left out of this file; rerun the pull to see them.", "source": "Horry County AcclaimWeb DEED (001) recorded 2025-10-01..2026-09-30; Horry County GIS layers 24 and 22 read 2026-11-01"}, "summary": S, "sales": PUBLIC},
          open(os.path.join(D, "out-of-state-buyers.json"), "w"), indent=0)
print(json.dumps(S, indent=1))
