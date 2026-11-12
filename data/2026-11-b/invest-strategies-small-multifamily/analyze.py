"""Findings for /invest/strategies/small-multifamily/ (batch 2026-11-b). Every number on the page that is not a quoted rule comes from findings.json.
Inputs:
  RAW/multi-active.json     pull_listings.py (the site's own map API, type=multi = the MLS "2 to 4 units" type; kept outside the repo)
  RAW/smf-parcels.json, RAW/smf-addresses.json   fetch_county.py (Horry County parcels coded 102, 103, 104 with a building)
  ../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json   Horry County deeds recorded 2025-10-01 to 2026-09-30 (13,194 home sales; ledger 2026-10-b affordable-facts row 18)
  ../../2026-10-d/sell-home-value/raw/horry-county.json   Census TIGERweb county boundary
  pums-2to4.json            analyze_pums.py (Census ACS PUMS 2020-2024)
  code-check.json           check_codes.py (address points per parcel, by land use code)
Run: RAW=<scratch> python3 -I analyze.py <this dir>. Writes findings.json and raw/listings-prices.json (price, town, code only)."""
import json, sys, os, statistics, collections, math, re
D = sys.argv[1]; up = lambda *p: os.path.join(D, "..", "..", *p)
RAW = os.environ.get("RAW", os.path.join(D, "raw"))
L = json.load(open(os.path.join(RAW, "multi-active.json")))
P = json.load(open(os.path.join(RAW, "smf-parcels.json")))
A = json.load(open(os.path.join(RAW, "smf-addresses.json")))["addresses"]
S = json.load(open(up("2026-10-d", "sell-out-of-state-buyers", "out-of-state-buyers.json")))
ring = json.load(open(up("2026-10-d", "sell-home-value", "raw", "horry-county.json")))["features"][0]["geometry"]["rings"]
pums = json.load(open(os.path.join(D, "pums-2to4.json"))); cc = json.load(open(os.path.join(D, "code-check.json")))
oc = json.load(open(up("2026-10-d", "sell-home-value", "raw", "ocean.json")))
SEG = [(r[i], r[i + 1]) for f in oc["features"] for r in f["geometry"]["rings"] for i in range(len(r) - 1)]
M = 111320.0; K = math.cos(math.radians(33.7))
def ocean_m(lon, lat):  # straight-line meters to the Census Atlantic Ocean polygon edge (same method as sell-home-value)
    best = 1e12
    for (x1, y1), (x2, y2) in SEG:
        ax, ay = (x1 - lon) * K * M, (y1 - lat) * M; bx, by = (x2 - lon) * K * M, (y2 - lat) * M
        dx, dy = bx - ax, by - ay; L2 = dx * dx + dy * dy
        t = 0 if L2 == 0 else max(0, min(1, -(ax * dx + ay * dy) / L2))
        best = min(best, math.hypot(ax + t * dx, ay + t * dy))
    return best
def oband(m): return "under 0.25 mile" if m < 402 else "0.25 to 1 mile" if m < 1609 else "1 to 3 miles" if m < 4828 else "over 3 miles"
OB = ["under 0.25 mile", "0.25 to 1 mile", "1 to 3 miles", "over 3 miles"]
def inside(x, y):
    c = False
    for r in ring:
        for i in range(len(r)):
            x1, y1 = r[i - 1]; x2, y2 = r[i]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
def q(v, p):
    v = sorted(v); k = (len(v) - 1) * p; f = int(k); return v[f] + (v[min(f + 1, len(v) - 1)] - v[f]) * (k - f)
r1000 = lambda x: int(round(x / 1000.0)) * 1000
def summ(pr):
    if not pr: return {"n": 0}
    return {"n": len(pr), "median": r1000(statistics.median(pr)), "p25": r1000(q(pr, .25)), "p75": r1000(q(pr, .75)), "min": r1000(min(pr)), "max": r1000(max(pr))}
UNITS = {"102": 2, "103": 3, "104": 4}
FHA = {"102": 693050, "103": 837700, "104": 1041125}  # HUD CY2026 FHA forward limits, Horry County (FTHB ledger row 26)
out = {"meta": {"made": "analyze.py", "listings_pulled": L["pulled"], "listings_refreshed": L["refreshed"], "listings_source": L["source"], "parcels_fetched": P["fetched"],
                "note": "Active listings, parcels and sales in aggregate only. No address, PIN, firm, owner or MLS number is in this file."}}
# 1. For sale now
H = [h for h in L["homes"].values() if h["price"] and h["lat"] and h["lng"]]
hc = [h for h in H if inside(h["lng"], h["lat"])]
code = lambda h: (h["luc"] or [""])[0] if h["luc"] and len(h["luc"]) == 1 else ("" if not h["luc"] else "+".join(h["luc"]))
fs = {"api_total": L["api_total"], "with_point": len(H), "outside_horry": len(H) - len(hc), "horry": summ([h["price"] for h in hc]),
      "horry_by_town": {t: summ([h["price"] for h in hc if h["town"] == t]) for t, _ in collections.Counter(h["town"] for h in hc).most_common()},
      "outside_by_town": dict(collections.Counter(h["town"] for h in H if not inside(h["lng"], h["lat"]))),
      "horry_by_parcel_code": dict(collections.Counter(code(h) or "no parcel at the pin" for h in hc)),
      "horry_bands": {"under_300k": sum(1 for h in hc if h["price"] < 300000), "300_500k": sum(1 for h in hc if 300000 <= h["price"] < 500000),
                      "500_750k": sum(1 for h in hc if 500000 <= h["price"] < 750000), "750k_1m": sum(1 for h in hc if 750000 <= h["price"] < 1000000), "1m_up": sum(1 for h in hc if h["price"] >= 1000000)},
      "ocean_bands": {b: summ([h["price"] for h in hc if oband(ocean_m(h["lng"], h["lat"])) == b]) for b in OB}, "tags": dict(collections.Counter(h["tag"] or "" for h in hc))}
dup = [h for h in hc if code(h) in FHA]
fs["on_coded_parcels"] = {c: summ([h["price"] for h in dup if code(h) == c]) for c in FHA}
fs["on_coded_parcels_at_or_under_fha_limit"] = {c: sum(1 for h in dup if code(h) == c and h["price"] <= FHA[c]) for c in FHA}
fs["all_horry_under_2unit_fha_limit"] = sum(1 for h in hc if h["price"] <= FHA["102"])
out["for_sale"] = fs
json.dump({"pulled": L["pulled"], "rows": sorted([[h["price"], h["town"], code(h), inside(h["lng"], h["lat"])] for h in H])}, open(os.path.join(D, "raw", "listings-prices.json"), "w"))
# 2. The stock: every coded parcel, its town (most common postal city of its address points), its assessment ratio
pc = collections.defaultdict(collections.Counter)
for a in A: pc[a["PIN"]][(a["POSTAL_CITY"] or "").title()] += 1
city = collections.defaultdict(collections.Counter)
for a in A: city[a["PIN"]][(a["CITY"] or "").title()] += 1
pt = {}
for a in A: pt.setdefault(a["PIN"], (a["lng"], a["lat"]))
def ratio(p):
    t, s = p["TaxableProp"] or 0, p["AssessedProp"] or 0
    if not t: return "none"
    r = s / t
    return "4%" if r < 0.041 else ("6%" if r > 0.059 else "split")
rows = []
for p in P["parcels"]:
    rows.append({"code": p["LandUseCode"], "town": pc[p["PIN"]].most_common(1)[0][0] if pc[p["PIN"]] else "(no address point)",
                 "muni": city[p["PIN"]].most_common(1)[0][0] if city[p["PIN"]] else "", "ratio": ratio(p), "market": p["MarketProp"], "pin": p["PIN"],
                 "group": re.sub(r"\s+", " ", (p["LegalDescr"] or "").split(";")[0]).strip().upper(), "om": ocean_m(*pt[p["PIN"]]) if p["PIN"] in pt else None})
st = {"total": len(rows), "by_code": dict(collections.Counter(r["code"] for r in rows)), "units_total": sum(UNITS[r["code"]] for r in rows),
      "by_town": [[t, n] for t, n in collections.Counter(r["town"] for r in rows).most_common()],
      "by_town_and_code": {t: dict(collections.Counter(r["code"] for r in rows if r["town"] == t)) for t, _ in collections.Counter(r["town"] for r in rows).most_common(12)},
      "ratio": dict(collections.Counter(r["ratio"] for r in rows)), "ratio_by_code": {c: dict(collections.Counter(r["ratio"] for r in rows if r["code"] == c)) for c in UNITS},
      "ratio_by_town": {t: dict(collections.Counter(r["ratio"] for r in rows if r["town"] == t)) for t, _ in collections.Counter(r["town"] for r in rows).most_common(8)},
      "county_value_median_by_code": {c: r1000(statistics.median([r["market"] for r in rows if r["code"] == c and r["market"]])) for c in UNITS},
      "stock_by_landuse_with_building": json.load(open(os.path.join(D, "raw", "stock-by-landuse.json")))["rows"],
      "code_check": cc["codes"]}
st["ocean_bands"] = {b: sum(1 for r in rows if r["om"] is not None and oband(r["om"]) == b) for b in OB}
st["ocean_no_point"] = sum(1 for r in rows if r["om"] is None)
st["ocean_bands_by_town"] = {t: {b: sum(1 for r in rows if r["town"] == t and r["om"] is not None and oband(r["om"]) == b) for b in OB} for t, _ in collections.Counter(r["town"] for r in rows).most_common(7)}
st["top_legal_groups"] = collections.Counter(r["group"] for r in rows).most_common(25)
# Named clusters: the recorded plat name at the start of the legal description, spelling variants joined
NAMES = {"CRESCENT BCH": "CRESCENT BEACH", "CHERRY GROVE BCH": "CHERRY GROVE BEACH", "CHERRY GROVE": "CHERRY GROVE BEACH", "E CHERRY GROVE BEACH": "CHERRY GROVE BEACH",
         "WINDY HILL BCH": "WINDY HILL BEACH", "OCEAN DR BCH": "OCEAN DRIVE BEACH", "OCEAN TERR": "OCEAN TERRACE", "WINDTREE EST": "WINDTREE ESTATES"}
for r in rows: r["cl"] = NAMES.get(r["group"], r["group"])
cl = collections.Counter(r["cl"] for r in rows if r["cl"])
st["clusters"] = [{"name": k, "buildings": n, "codes": dict(collections.Counter(r["code"] for r in rows if r["cl"] == k)),
                   "mailing_city": collections.Counter(r["town"] for r in rows if r["cl"] == k).most_common(1)[0][0],
                   "ocean_m_median": round(statistics.median([r["om"] for r in rows if r["cl"] == k and r["om"] is not None])) if any(r["om"] is not None for r in rows if r["cl"] == k) else None,
                   "county_value_median": r1000(statistics.median([r["market"] for r in rows if r["cl"] == k and r["market"]])),
                   "owner_4pct_or_split": sum(1 for r in rows if r["cl"] == k and r["ratio"] in ("4%", "split"))} for k, n in cl.most_common(14)]
out["stock"] = st
# 3. What sold: deeds Oct 2025 to Sep 2026 on those parcels
codeof = {r["pin"]: r["code"] for r in rows}; omof = {r["pin"]: r["om"] for r in rows}; clof = {r["pin"]: r["cl"] for r in rows}; townof = {r["pin"]: r["town"] for r in rows}
sold = [s for s in S["sales"] if int(s["pin"]) in codeof]
sold_all = [s["cons"] for s in sold]
out["sold"] = {"window": "deeds recorded 2025-10-01 to 2026-09-30", "all": summ(sold_all),
               "by_code": {c: summ([s["cons"] for s in sold if codeof[int(s["pin"])] == c]) for c in UNITS},
               "by_town": {t: summ([s["cons"] for s in sold if townof[int(s["pin"])] == t]) for t, _ in collections.Counter(townof[int(s["pin"])] for s in sold).most_common()},
               "buyer_tax_bill_out_of_state": sum(1 for s in sold if s.get("owner_state") and s["owner_state"] != "SC"), "buyer_company": sum(1 for s in sold if s.get("company")),
               "share_of_all_home_sales_pct": round(100 * len(sold) / len(S["sales"]), 1), "all_home_sales": len(S["sales"]),
               "ocean_bands": {b: summ([s["cons"] for s in sold if omof.get(int(s["pin"])) is not None and oband(omof[int(s["pin"])]) == b]) for b in OB},
               "by_cluster": {c["name"]: summ([s["cons"] for s in sold if clof.get(int(s["pin"])) == c["name"]]) for c in st["clusters"]},
               "by_month": dict(sorted(collections.Counter(s["date"][:7] for s in sold).items()))}
# 4. Rents (carried from pums-2to4.json) and the worked example
cr, gr = pums["contract_rent"], pums["gross_rent"]
out["rents"] = {"lease_2br_in_2to4": cr["small_2to4_2br"], "with_utilities_2br_in_2to4": gr["small_2to4_2br"], "lease_all_in_2to4": cr["small_2to4_all"], "with_utilities_all_in_2to4": gr["small_2to4_all"],
                "lease_house_detached": cr["house_detached"], "bedrooms_share_2to4_renters": pums["bedrooms_share_2to4_renters"], "counts": pums["counts"]}
med2 = out["sold"]["by_code"]["102"].get("median"); rent = cr["small_2to4_2br"]["median"]
out["worked_example"] = {"duplex_price_median_sold": med2, "units": 2, "lease_rent_each_2br": rent, "rent_roll_month": 2 * rent, "rent_roll_year": 24 * rent,
                         "gross_rent_pct_of_price": round(100 * 24 * rent / med2, 1) if med2 else None, "price_per_unit": r1000(med2 / 2) if med2 else None,
                         "fha_self_sufficiency_fourplex": {"units": 4, "rent_each": rent, "appraiser_rent_total": 4 * rent, "less_25pct": 3 * rent,
                                                            "rule": "PITI / net self-sufficiency rent may not exceed 100 percent (HUD 4000.1 II.A.1.b.iv(B)(3)(c)); net = appraiser's fair market rent of all units, including the owner's, less the greater of the appraiser's vacancy and maintenance or 25 percent."},
                         "note": "Constructed example. Rent is the Census median lease rent for a 2-bedroom unit in a 2 to 4 unit building, Horry County, leases in place (2020-2024, 2024 dollars); a new lease runs higher (rent-prices ledger row 7). No payment, rate or loan amount."}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: out[k] for k in ["for_sale", "sold", "worked_example"]}, indent=1)); print(json.dumps({k: v for k, v in st.items() if k not in ("stock_by_landuse_with_building",)}, indent=1))
