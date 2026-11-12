"""What a first home costs in Horry County, from public records and the CRM's active listings in aggregate.
Inputs:
  ../sell-out-of-state-buyers/out-of-state-buyers.json : every kept home sale in the Horry County deed index
      (AcclaimWeb DEED 001, recorded 2025-10-01 to 2026-09-30; $10,000 or more, one parcel, no tax-sale or corrective
      deed, residential land use with a building), with the builder flag and the parcel center point. Built by that
      folder's pull_deeds.py, fetch_parcels.py, fetch_points.py and analyze.py. Read only here.
  raw/parcel-attrs.json : county parcel layer 24, land use code and values for those parcels (fetch_attrs.py).
  raw/flood-sfha.json  : high-risk flood zones A, AE, VE from county GIS layer 19 (fetch_flood.py).
  raw/zips.json        : ZIP code areas, county GIS layer 20 (fetch_zips.py).
  raw/listings-400k.json : active listings up to $400,000 (pull_listings.py). The feed reaches past Horry County,
      so listings are kept only inside the county line (raw/horry-county-boundary.geojson, Census TIGERweb, copied from
      ../buyers-programs/raw/, made by that folder's pull-usda.sh).
Output: findings.json (every number the ledger uses), chart-ladder.json, chart-zip.json.
Usage: python3 -I build_findings.py <this dir>"""
import sys, json, os, re, statistics as st, collections as C
D = sys.argv[1]
J = lambda *p: json.load(open(os.path.join(D, *p)))
SALES = J("..", "sell-out-of-state-buyers", "out-of-state-buyers.json")["sales"]
ATTR = {str(int(r["PIN"])).zfill(11): r for r in J("raw", "parcel-attrs.json")["rows"]}
FLOOD = J("raw", "flood-sfha.json")["features"]; ZIPS = J("raw", "zips.json")["features"]
LIST = J("raw", "listings-400k.json")
TIMESHARE = re.compile(r"\bWEEK|TIMESHARE|INTERVAL", re.I)
HOUSE, CONDO, TOWN, MANUF = {"100", "101", "102", "110", "126"}, {"107", "135"}, {"109"}, {"120", "121"}
def kind(s, lu):
    if lu == "117": return "other"  # garage and parking units (verifier, 2026-11-01)
    if "HPR" in (s["legal"] or "") or lu in CONDO: return "condo"
    if lu in TOWN: return "townhouse"
    if lu in HOUSE: return "house"
    if lu in MANUF: return "manufactured"
    return "other"
# point in polygon with holes (even-odd over all rings), with a bounding-box prefilter
def prep(feats, key):
    out = []
    for f in feats:
        rings = (f.get("geometry") or {}).get("rings") or []
        if not rings: continue
        xs = [p[0] for r in rings for p in r]; ys = [p[1] for r in rings for p in r]
        out.append((min(xs), min(ys), max(xs), max(ys), rings, f["attributes"][key]))
    return out
def inside(x, y, rings):
    c = False
    for ring in rings:
        for i in range(len(ring) - 1):
            (x1, y1), (x2, y2) = ring[i], ring[i + 1]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
    return c
FL, ZP = prep(FLOOD, "FLD_ZONE"), prep(ZIPS, "ZIPCODE")
ZNAME = {f["attributes"]["ZIPCODE"]: f["attributes"]["CITY"] for f in ZIPS}
def lookup(x, y, polys):
    for a, b, c, d, rings, v in polys:
        if a <= x <= c and b <= y <= d and inside(x, y, rings): return v
    return None
rows, drop = [], C.Counter()
for s in SALES:
    if TIMESHARE.search(s["legal"] or ""): drop["timeshare"] += 1; continue
    a = ATTR.get(s["pin"]); lu = (a or {}).get("LandUseCode") or ""
    k = kind(s, lu)
    if k == "other": drop["other land use"] += 1; continue
    r = {"price": s["cons"], "kind": k, "new": s["builder"], "lat": s.get("lat"), "lon": s.get("lon"),
         "matched": s["owner_is_grantee"], "outside_sc": s["where"] in ("US", "CANADA", "OTHER"), "tax_district": (a or {}).get("TaxDistrict")}
    if r["lat"] is not None:
        r["zip"] = lookup(r["lon"], r["lat"], ZP); r["sfha"] = lookup(r["lon"], r["lat"], FL)
    rows.append(r)
med = lambda v: st.median(v) if v else None
def pct(a, b): return round(100 * a / b, 1) if b else None
F = {"inputs": {"sales_in_file": len(SALES), "dropped": dict(drop), "kept": len(rows),
               "with_point": sum(1 for r in rows if r["lat"] is not None)}}
KINDS = ["condo", "townhouse", "house", "manufactured"]
F["by_kind"] = {}
for k in KINDS:
    v = [r["price"] for r in rows if r["kind"] == k]
    F["by_kind"][k] = {"sales": len(v), "median": med(v), "under_250k": sum(x < 250000 for x in v), "under_300k": sum(x < 300000 for x in v)}
h = [r for r in rows if r["kind"] == "house"]
F["houses_new_vs_resale"] = {"new": {"sales": sum(r["new"] for r in h), "median": med([r["price"] for r in h if r["new"]]),
                                     "under_300k": sum(1 for r in h if r["new"] and r["price"] < 300000)},
                             "resale": {"sales": sum(not r["new"] for r in h), "median": med([r["price"] for r in h if not r["new"]]),
                                        "under_300k": sum(1 for r in h if not r["new"] and r["price"] < 300000)}}
BANDS = [(0, 150000), (150000, 200000), (200000, 250000), (250000, 300000), (300000, 350000), (350000, 400000), (400000, 450000), (450000, 10**12)]
ladder = []
for lo, hi in BANDS:
    b = [r for r in rows if lo <= r["price"] < hi]
    ladder.append({"band": [lo, hi if hi < 10**12 else None], "total": len(b),
                   **{k: sum(1 for r in b if r["kind"] == k) for k in KINDS},
                   "house_new": sum(1 for r in b if r["kind"] == "house" and r["new"]), "townhouse_new": sum(1 for r in b if r["kind"] == "townhouse" and r["new"])})
F["ladder"] = ladder
for cap in (250000, 300000):
    b = [r for r in rows if r["price"] < cap]
    F[f"under_{cap//1000}k"] = {"total": len(b), **{k: sum(1 for r in b if r["kind"] == k) for k in KINDS},
                                "share_of_all_sales": pct(len(b), len(rows))}
# where houses and townhouses under $300,000 sold, by ZIP area
starter = [r for r in rows if r["kind"] in ("house", "townhouse") and r["price"] < 300000 and r.get("zip")]
allht = [r for r in rows if r["kind"] in ("house", "townhouse") and r.get("zip")]
byzip = C.Counter(r["zip"] for r in starter); allzip = C.Counter(r["zip"] for r in allht)
F["starter_by_zip"] = [{"zip": z, "name": ZNAME.get(z), "starter": n, "all_house_townhouse": allzip[z], "share": pct(n, allzip[z]),
                        "median_all": med([r["price"] for r in allht if r["zip"] == z])} for z, n in byzip.most_common()]
F["starter_total_placed"] = len(starter)
# flood: parcel center inside a high-risk zone (A, AE, VE)
def fl(group):
    g = [r for r in group if r["lat"] is not None]
    n = sum(1 for r in g if r.get("sfha")); return {"placed": len(g), "in_sfha": n, "pct": pct(n, len(g)), "zones": dict(C.Counter(r["sfha"] for r in g if r.get("sfha")))}
F["flood"] = {"house_townhouse_under_300k": fl([r for r in rows if r["kind"] in ("house", "townhouse") and r["price"] < 300000]),
              "condo_under_300k": fl([r for r in rows if r["kind"] == "condo" and r["price"] < 300000]),
              "all_house_townhouse": fl([r for r in rows if r["kind"] in ("house", "townhouse")]),
              "all_condo": fl([r for r in rows if r["kind"] == "condo"]),
              "all": fl(rows)}
# who bought: the current owner's tax-bill mailing state, on sales where the deed buyer is still the owner of record
def oos(group):
    g = [r for r in group if r["matched"]]; n = sum(1 for r in g if r["outside_sc"]); return {"matched": len(g), "outside_sc": n, "pct": pct(n, len(g))}
F["out_of_state"] = {"condo_under_300k": oos([r for r in rows if r["kind"] == "condo" and r["price"] < 300000]),
                     "house_townhouse_under_300k": oos([r for r in rows if r["kind"] in ("house", "townhouse") and r["price"] < 300000]),
                     "all_under_300k": oos([r for r in rows if r["price"] < 300000]), "all": oos(rows)}
F["starter_tax_districts"] = C.Counter(r["tax_district"] for r in rows if r["kind"] in ("house", "townhouse") and r["price"] < 300000).most_common(12)
# the starter map: houses and townhouses under $300,000 (price band, new or resale, point rounded to about 100 m)
json.dump({"title": "Houses and townhouses sold under $300,000 in Horry County, Oct 2025 to Sep 2026", "source": "Horry County deed index and parcel records",
           "points": [[round(r["lon"], 3), round(r["lat"], 3), int(r["price"] // 50000 * 50000), int(r["new"])] for r in rows
                      if r["kind"] in ("house", "townhouse") and r["price"] < 300000 and r["lat"] is not None],
           "fields": ["lon", "lat", "price band floor", "new from a builder (1) or resale (0)"]}, open(os.path.join(D, "map-starter-points.json"), "w"))
# listings now, aggregate
HB = J("raw", "horry-county-boundary.geojson")["features"][0]["geometry"]["coordinates"]
L0 = list(LIST["homes"].values())
L = [x for x in L0 if x.get("lat") is not None and inside(x["lng"], x["lat"], HB)]
F["listings_inputs"] = {"listings_up_to_400k": len(L0), "inside_horry": len(L)}
for x in L:
    x["zip"] = lookup(x["lng"], x["lat"], ZP) if x.get("lat") else None
def agg(g):
    sq = [x["sqft"] for x in g if x.get("sqft")]; bd = [x["beds"] for x in g if x.get("beds") is not None]; ac = [x["acres"] for x in g if x.get("acres")]
    return {"count": len(g), "median_sqft": med(sq), "median_beds": med(bd), "beds_3plus": sum(1 for b in bd if b >= 3), "with_beds": len(bd),
            "median_acres": med(ac), "median_price": med([x["price"] for x in g if x.get("price")])}
F["listings"] = {"pulled": LIST["pulled"], "totals": LIST["totals"]}
for k in ("house", "townhouse", "condo", "manufactured"):
    for cap in (250000, 300000, 350000, 400000):
        F["listings"][f"{k}_le_{cap//1000}k"] = agg([x for x in L if x["type"] == k and x["price"] and x["price"] <= cap])
hz = C.Counter(x["zip"] for x in L if x["type"] == "house" and x["price"] and x["price"] <= 300000)
F["listings"]["house_le_300k_by_zip"] = [{"zip": z, "name": ZNAME.get(z), "count": n} for z, n in hz.most_common()]
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
json.dump({"title": "Horry County home sales, Oct 2025 to Sep 2026, by price and kind of home", "source": "Horry County deed index and parcel records",
           "rows": ladder}, open(os.path.join(D, "chart-ladder.json"), "w"), indent=1)
json.dump({"title": "Houses and townhouses sold under $300,000, Oct 2025 to Sep 2026, by ZIP area", "rows": F["starter_by_zip"]},
          open(os.path.join(D, "chart-zip.json"), "w"), indent=1)
print(json.dumps({k: F[k] for k in ("inputs", "by_kind", "houses_new_vs_resale", "under_250k", "under_300k", "flood")}, indent=1))
# worked example: the yearly county tax on the middle-priced house listed at or under $300,000, in unincorporated
# Horry County with the county fire district and waste management levies (raw/horry-tax-levy-2026.txt, the Auditor's
# certified 2026 levy). A legal residence is assessed at 4 percent and pays no school operating millage (SC Code
# 12-43-220(c)(1); 12-37-220(B)(47)); any other home is assessed at 6 percent and pays all of it (12-43-220(e)).
lev = {}
for line in open(os.path.join(D, "raw", "horry-tax-levy-2026.txt")):
    m = re.match(r"\s*([A-Z][A-Z .&'\-–]+?)\s*\.{3,}\s*([\d.]+)\s*$", line)
    if m: lev[m.group(1).strip()] = float(m.group(2))
county, debt, op = lev["TOTAL LEVY FOR COUNTY PURPOSES"], lev["BOARD OF EDUCATION DEBT SERVICE FUND"], lev["SCHOOL OPERATION FUND"]
fire, appar, waste = lev["COUNTY FIRE DISTRICT"], lev["COUNTY FIRE APPARATUS REPLACEMENT"], lev["WASTE MANAGEMENT"]
price = F["listings"]["house_le_300k"]["median_price"]
m4 = county + debt + fire + appar + waste; m6 = m4 + op
F["tax_example"] = {"value": price, "mills_legal_residence": round(m4, 1), "mills_other": round(m6, 1),
                    "tax_4pct": round(price * 0.04 * m4 / 1000), "tax_6pct": round(price * 0.06 * m6 / 1000),
                    "ratio": round((price * 0.06 * m6) / (price * 0.04 * m4), 2),
                    "levies": {"county": county, "school_debt": debt, "school_operating": op, "county_fire": fire, "fire_apparatus": appar, "waste_management": waste}}
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(F["tax_example"])
