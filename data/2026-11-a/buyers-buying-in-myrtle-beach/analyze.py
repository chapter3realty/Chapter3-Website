"""Findings for /buyers/buying-in-myrtle-beach/ (batch 2026-11-a). Writes findings.json and the chart files. No PINs,
MLS numbers, addresses or names leave scratch.

Inputs:
  SALES   data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json  Horry County deeds recorded 2025-10-01..2026-09-30,
          home sales as filtered there (13,194: $10,000+, one residential parcel with a building, no tax-sale or corrective deed)
  RAW/landuse.json         county land use code per PIN (fetch_landuse.py)
  RAW/listings-sets.json   CRM active listings by type and subset (pull_listings.py)
  HORRY   data/2026-10-d/sell-home-value/raw/horry-county.json  Census county outline (TIGERweb)
Rules (the same as /sell/home-value/, SHV ledger rows 1 and 24): condo = land use 107 or HPR in the legal description;
every other home is a 'house' (houses, townhomes, manufactured homes on their own lot). Resale = seller not a builder.
Listings: house group = MLS types house + townhouse + manufactured; condo = MLS type condo; inside the Horry outline.
Months of supply = homes for sale now / (homes sold in the 12 months / 12).
Usage: RAW=<scratch> SALES=<path> HORRY=<path> python3 -I analyze.py <this dir>"""
import json, os, sys, statistics as st
from collections import Counter, defaultdict
D = sys.argv[1]; RAW = os.environ["RAW"]
S = json.load(open(os.environ["SALES"]))["sales"]
LU = json.load(open(os.path.join(RAW, "landuse.json")))
def is_condo(x): return bool(x["condo"]) or LU.get(str(int(x["pin"])).zfill(11)) == "107"
for x in S: x["c"] = is_condo(x); x["m"] = x["date"][:7].replace("/", "-")
F = {"meta": {"sales": "Horry County Register of Deeds index (AcclaimWeb DEED 001), recorded 2025-10-01 to 2026-09-30, filtered as in data/2026-10-d/sell-out-of-state-buyers (13,194 home sales)",
              "kinds": "condo = county land use 107 or HPR in the legal description; house = every other home (houses, townhomes, manufactured homes on their own lot)",
              "listings": "Chapter3 CRM public map API, active for-sale listings counted inside the Census Horry County outline; house group = MLS house + townhouse + manufactured; condo = MLS condo",
              "months_of_supply": "homes for sale now / (homes sold in the 12 months / 12)"}}
kinds = {"house": [x for x in S if not x["c"]], "condo": [x for x in S if x["c"]]}
F["sales"] = {k: {"all": len(v), "resale": sum(not x["builder"] for x in v), "builder": sum(bool(x["builder"]) for x in v)} for k, v in kinds.items()}
F["sales"]["total"] = len(S)
F["sales_by_month"] = {m: {k: sum(1 for x in v if x["m"] == m) for k, v in kinds.items()} for m in sorted({x["m"] for x in S})}
BANDS = {"house": [(0, 300000), (300000, 450000), (450000, 700000), (700000, 10**9)],
         "condo": [(0, 150000), (150000, 250000), (250000, 400000), (400000, 10**9)]}
def label(lo, hi): return f"{lo}-{hi}" if hi < 10**9 else f"{lo}-up"
# listings
L = None
try: L = json.load(open(os.path.join(RAW, "listings-sets.json")))
except FileNotFoundError: pass
if L:
    from shapely.geometry import shape, Point
    from shapely.prepared import prep
    hc = json.load(open(os.environ["HORRY"]))["features"][0]["geometry"]
    poly = prep(shape({"type": "Polygon" if len(hc["rings"]) == 1 else "MultiPolygon", "coordinates": hc["rings"] if len(hc["rings"]) == 1 else [[r] for r in hc["rings"]]}))
    GROUP = {"house": ["house", "townhouse", "manufactured"], "condo": ["condo"]}
    def homes(setname, kind):
        out = {}
        for t in GROUP[kind]:
            for mls, (price, lat, lng) in L["sets"].get(setname, {}).get(t, {}).items():
                if lat is not None and lng is not None and poly.contains(Point(lng, lat)): out[mls] = price
        return out
    sets = list(L["sets"].keys())
    F["listings"] = {"pulled": L["pulled"], "refreshedAt": L.get("refreshedAt"), "truncated_bands": len(L["truncated"]), "api_totals": L["api_totals"]}
    for k in ("house", "condo"):
        allh = homes("all", k); newc = homes("new_construction", k); cut = homes("price_reduced", k)
        sold = kinds[k]; resold = [x for x in sold if not x["builder"]]
        r = {"for_sale": len(allh), "new_construction": len(set(newc) & set(allh)), "price_reduced": len(set(cut) & set(allh)),
             "pct_price_reduced": round(100 * len(set(cut) & set(allh)) / len(allh), 1),
             "median_ask": st.median(p for p in allh.values() if p),
             "sold_12mo": len(sold), "resold_12mo": len(resold),
             "months_supply_all": round(len(allh) / (len(sold) / 12), 1),
             "months_supply_resale": round((len(allh) - len(set(newc) & set(allh))) / (len(resold) / 12), 1)}
        dom = {}
        for s in sets:
            if s.startswith("dom"):
                n = int(s[3:]); dom[n] = len(set(homes(s, k)) & set(allh))
        r["listed_within_days"] = dict(sorted(dom.items()))
        r["pct_listed_within_days"] = {n: round(100 * c / len(allh), 1) for n, c in sorted(dom.items())}
        # median age of today's listings: first window that holds half
        half = len(allh) / 2; prev = (0, 0); med = None
        for n, c in sorted(dom.items()):
            if c >= half: med = round(prev[0] + (half - prev[1]) * (n - prev[0]) / (c - prev[1])); break
            prev = (n, c)
        r["median_days_listed_interpolated"] = med
        bands = []
        resale_ask = {m: p for m, p in allh.items() if m not in newc}
        for lo, hi in BANDS[k]:
            fs = sum(1 for p in allh.values() if p and lo <= p < hi)
            fs_r = sum(1 for p in resale_ask.values() if p and lo <= p < hi)
            sd = sum(1 for x in sold if lo <= x["cons"] < hi)
            sd_r = sum(1 for x in resold if lo <= x["cons"] < hi)
            bands.append({"band": label(lo, hi), "for_sale": fs, "sold_12mo": sd, "months_supply": round(fs / (sd / 12), 1) if sd else None,
                          "for_sale_resale": fs_r, "resold_12mo": sd_r, "months_supply_resale": round(fs_r / (sd_r / 12), 1) if sd_r else None})
        r["by_price_band"] = bands
        F["listings"][k] = r
    # winter vs summer: listings now against sales per month by season
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: F[k] for k in ("sales",)}, indent=0)[:600])
if L:
    for k in ("house", "condo"):
        r = F["listings"][k]; print(k, {x: r[x] for x in r if x not in ("by_price_band",)}); [print("  ", b) for b in r["by_price_band"]]
