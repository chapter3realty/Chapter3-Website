"""Horry County home resales by month of recording, 2020-07 to 2026-10 (full years 2021-2025), from county deeds.
Inputs (RAW): deeds-YYYY-MM[a|b].json (AcclaimWeb DEED 001, pull_deeds.py), parcels.json (GIS layer 24, fetch_parcels.py).
Output: <datadir>/findings.json (every count and median the page uses; no names, no addresses).
Usage: RAW=<scratch dir> python3 -I analyze.py <datadir>"""
import sys, json, glob, os, re, statistics, collections, datetime
D = sys.argv[1]; RAW = os.environ["RAW"]
rows = [r for f in sorted(glob.glob(os.path.join(RAW, "deeds-20*.json"))) for r in json.load(open(f))["Data"]]
P = {str(int(p["PIN"])).zfill(11): p for p in json.load(open(os.path.join(RAW, "parcels.json")))}
# Same builder list and filters as data/2026-10-d/sell-out-of-state-buyers/analyze.py
BUILDER = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|H & H CONSTRUCTORS|RS PARKER|DRB GROUP|DREAM FINDERS|HOWELL HOMES|MILLROSE|LEWIS CONSTRUCTION|CHRIS MANNING|CAROLINA COTTAGE|HUNTER QUINN|BRADLEY JONES|SANDS BUILDING|OCEAN PALMS BUILDERS|INFINITY CUSTOM|ALMOND QUALITY|AG EHC|KL LB BUY|BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOMES OF|HOME BUILDERS|DEVELOPMENT")
TAXSALE = re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY|FORECLOS")
CORR = re.compile(r"CORRECT|RE-RECORD")
bp = collections.defaultdict(set)
for r in rows: bp[r["BookPage"]].add((r["ParcelNumber"] or "").strip())
seen = set(); counts = collections.Counter(); sales = []
for r in rows:
    key = (r["BookPage"], r["TransactionItemId"])
    if key in seen: counts["duplicate_row"] += 1; continue
    seen.add(key)
    pin = (r["ParcelNumber"] or "").strip(); c = r["Consideration"] or 0
    if c < 10000: counts["under_10000"] += 1; continue
    if not (pin.isdigit() and len(pin) == 11) or len(bp[r["BookPage"]]) > 1: counts["not_one_parcel"] += 1; continue
    names = (r["DirectName"] or "") + " " + (r["IndirectName"] or "")
    if TAXSALE.search(names) or CORR.search(r["Comments"] or ""): counts["taxsale_foreclosure_or_corrective"] += 1; continue
    p = P.get(pin)
    if not p: counts["not_in_parcel_layer"] += 1; continue
    if not ((p["LandUseCode"] or "").startswith("1") and (p["MarketImprv"] or 0) > 0): counts["not_residential_building_now"] += 1; continue
    if BUILDER.search(r["IndirectName"] or ""): counts["sold_to_builder_lot"] += 1; continue
    mp = (p["MarketProp"] or 0)
    if mp and c < 0.3 * mp: counts["under_30pct_of_county_value"] += 1; continue
    new = bool(BUILDER.search(r["DirectName"] or ""))
    db, dp = (p["DeedBook"] or "").strip().lstrip("0"), (p["DeedPage"] or "").strip().lstrip("0")
    b, pg = r["BookPage"].split("/")
    st = (p["OwnerState"] or "").strip().upper()
    sales.append({"date": r["RecordDate"].replace("/", "-"), "cons": c, "condo": "HPR" in (p["LegalDescr"] or ""), "new": new,
                  "mp": mp, "owner_now": (db, dp) == (b.lstrip("0"), pg.lstrip("0")), "out_of_state": st not in ("SC", ""), "state_blank": st == ""})
    counts["kept_new" if new else "kept_resale"] += 1
med = lambda v: statistics.median(v) if v else None
# The index carries a parcel number on nearly every deed only from July 2020 (before that, about a third or less), so full years are 2021-2025.
YEARS = list(range(2021, 2026)); FIRST = "2020-07"; MON = list(range(1, 13))
def grp(xs):
    g = collections.defaultdict(list)
    for x in xs: g[(int(x["date"][:4]), int(x["date"][5:7]))].append(x["cons"])
    return g
S = {"filters": dict(counts), "rule": "Deeds of $10,000 or more on one parcel; no tax sale, sheriff, master-in-equity, foreclosure or corrective deed; the parcel is residential (land use 1xx) with a building on the county roll today; not sold to a builder; price at least 30 percent of the county's current market value. 'new' = seller matches the builder list; 'resale' = everything else. 'condo' = the county legal description has HPR (horizontal property regime)."}
for kind, sel in [("resale_all", lambda x: not x["new"]), ("resale_condo", lambda x: not x["new"] and x["condo"]),
                  ("resale_house", lambda x: not x["new"] and not x["condo"]), ("new", lambda x: x["new"])]:
    xs = [x for x in sales if sel(x)]; g = grp(xs)
    table = {f"{y}-{m:02d}": {"n": len(g[(y, m)]), "median": med(g[(y, m)])} for (y, m) in sorted(g) if f"{y}-{m:02d}" >= FIRST}
    # each month's share of its year's sales, and its median over the year's median, full years 2019-2025
    share = {m: [] for m in MON}; idx = {m: [] for m in MON}; share_x = {m: [] for m in MON}; idx_x = {m: [] for m in MON}
    for y in YEARS:
        ys = [v for m in MON for v in g[(y, m)]]; ymed = med(ys)
        for m in MON:
            share[m].append(len(g[(y, m)]) / len(ys)); idx[m].append(med(g[(y, m)]) / ymed)
            if y != 2021: share_x[m].append(len(g[(y, m)]) / len(ys)); idx_x[m].append(med(g[(y, m)]) / ymed)
    S[kind] = {"by_month": table,
               "typical_month": {m: {"avg_share_of_year_pct": round(100 * statistics.mean(share[m]), 2), "avg_median_vs_year_pct": round(100 * statistics.mean(idx[m]) - 100, 2),
                                     "min_share_pct": round(100 * min(share[m]), 2), "max_share_pct": round(100 * max(share[m]), 2),
                                     "years_above_year_median": sum(1 for v in idx[m] if v > 1),
                                     "no_2021_share_pct": round(100 * statistics.mean(share_x[m]), 2), "no_2021_median_vs_year_pct": round(100 * statistics.mean(idx_x[m]) - 100, 2)} for m in MON},
               "by_year": {y: {"n": sum(len(g[(y, m)]) for m in MON), "median": med([v for m in MON for v in g[(y, m)]])} for y in YEARS},
               "jan_oct": {y: {"n": sum(len(g[(y, m)]) for m in range(1, 11)), "median": med([v for m in range(1, 11) for v in g[(y, m)]])} for y in YEARS + [2026]},
               "pooled_5yr_by_month": {m: {"n": sum(len(g[(y, m)]) for y in YEARS), "median_of_month_medians": med([med(g[(y, m)]) for y in YEARS])} for m in MON}}
# Trend-free price check: each month's median against the median of all sales in the 13 months centred on it
# (six months before, the month, six after), months 2021-01 to 2025-12, so a rising or falling year does not tilt the result.
def ym(x): return int(x["date"][:4]) * 12 + int(x["date"][5:7]) - 1
for kind, sel in [("resale_all", lambda x: not x["new"]), ("resale_condo", lambda x: not x["new"] and x["condo"]), ("resale_house", lambda x: not x["new"] and not x["condo"])]:
    bym = collections.defaultdict(list)
    for x in sales:
        if sel(x): bym[ym(x)].append(x["cons"])
    res = {m: [] for m in MON}
    for y in YEARS:
        for m in MON:
            k = y * 12 + m - 1
            win = [v for j in range(k - 6, k + 7) for v in bym[j]]
            res[m].append(med(bym[k]) / med(win))
    S[kind]["centred_13mo"] = {m: {"avg_pct": round(100 * statistics.mean(v) - 100, 2), "years_above": sum(1 for z in v if z > 1), "each_year_pct": [round(100 * z - 100, 1) for z in v]} for m, v in res.items()}
# (A same-home check, price over the county's market value, was tried and dropped: for sales from 2023 on, the county's
# value equals the sale price on most parcels (reappraisal after an assessable transfer), so the ratio is 1.)
# out-of-state buyers by month (resales whose buyer is still the owner today; owner's tax-bill state)
oos = {m: [0, 0] for m in MON}
for x in sales:
    if x["new"] or not x["owner_now"] or x["state_blank"] or not (2021 <= int(x["date"][:4]) <= 2025): continue
    m = int(x["date"][5:7]); oos[m][0] += 1; oos[m][1] += x["out_of_state"]
S["out_of_state_by_month"] = {"rule": "Resales 2021-2025 whose buyer is still the owner on today's roll; share whose tax bill goes outside SC.",
                              "by_month": {m: {"n": v[0], "outside_sc": v[1], "pct": round(100 * v[1] / v[0], 1)} for m, v in oos.items()}}
# daily recordings around Hurricane Ian (landfall near Georgetown, 2022-09-30) and Tropical Storm Debby (2024-08)
day = collections.Counter(x["date"] for x in sales if not x["new"])
def window(a, b):
    a = datetime.date.fromisoformat(a); b = datetime.date.fromisoformat(b); out = {}
    while a <= b: out[a.isoformat()] = day.get(a.isoformat(), 0); a += datetime.timedelta(days=1)
    return out
S["storm_days"] = {"ian_2022": window("2022-09-19", "2022-10-14"), "debby_2024": window("2024-07-29", "2024-08-16")}
json.dump({"meta": {"made": "analyze.py", "source": "Horry County Register of Deeds AcclaimWeb, DEED (001) index, recorded 2019-01-01 to 2026-10-31 (pulled); used from 2020-07-01, when the index starts to carry a parcel number on nearly every deed; Horry County GIS parcel layer 24 read 2026-11-08",
                    "note": "No names, no addresses, no parcel numbers in this file. Rerun pull_deeds.py and fetch_parcels.py to see the rows."}, "summary": S},
          open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps(S["filters"], indent=1))
