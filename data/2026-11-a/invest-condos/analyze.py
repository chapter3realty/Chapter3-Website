"""Findings for /invest/condos/ from public records. No PIN, address or owner name is written out.
Inputs (scratch, kept out of the repo because they carry PINs):
  RAW/condo-parcels.json   every condo unit parcel (fetch_condo_parcels.py)
  RAW/flood-points.json    FEMA zone at each sale point (fetch_flood.py)
  DEEDS                    batch 2026-10-d deed file out-of-state-buyers.json (Horry County deeds recorded 2025-10-01..2026-09-30)
Run: RAW=<scratch> DEEDS=<file> python3 -I analyze.py <datadir>. Writes findings.json."""
import json, os, sys, statistics as st, collections
D = sys.argv[1]; RAW = os.environ["RAW"]
P = json.load(open(os.path.join(RAW, "condo-parcels.json")))
deeds = json.load(open(os.environ["DEEDS"]))["sales"]
flood = json.load(open(os.path.join(RAW, "flood-points.json")))
ratio = json.load(open(os.path.join(D, "raw", "ratio-counts.json")))
def area(td):
    td = str(td)
    if td == "550": return "North Myrtle Beach"
    if td[:2] in ("88", "89"): return "City of Myrtle Beach"
    if td == "660": return "Surfside Beach"
    if td in ("110",): return "Conway"
    return "Outside city limits and other towns"
def pct(a, b): return round(100 * a / b, 1) if b else None
out = {"made": "analyze.py", "sources": {"parcels": P["query"] + " where " + P["where"] + " (read " + P["read"] + ")",
       "deeds": "Horry County AcclaimWeb DEED (001), recorded 2025-10-01 to 2026-09-30, batch 2026-10-d pull and filters",
       "flood": "Horry County GIS layer 19 'Flood Zones' (FEMA flood map), point query at each sale's parcel point"}}
# 1. the stock
rows = P["rows"]; n = len(rows)
four = [r for r in rows if r["TaxableProp"] and r["AssessedProp"] < 0.05 * r["TaxableProp"]]
oos = [r for r in rows if r["OwnerState"] and r["OwnerState"].strip() not in ("SC", "")]
blds = collections.Counter(r["LegalDescr"].split(";")[0].strip() for r in rows)
stock = {"units": n, "regimes_by_legal_name": len(blds), "units_4pct": len(four), "pct_4pct": pct(len(four), n),
         "units_mailing_outside_sc": len(oos), "pct_mailing_outside_sc": pct(len(oos), n),
         "median_county_market_value": st.median([r["MarketProp"] for r in rows if r["MarketProp"]]),
         "other_homes": {"homes": ratio["counts"]["other_all"]["count"], "homes_4pct": ratio["counts"]["other_4pct"]["count"],
                         "pct_4pct": pct(ratio["counts"]["other_4pct"]["count"], ratio["counts"]["other_all"]["count"])},
         "by_area": {}}
for a in sorted({area(r["TaxDistrict"]) for r in rows}):
    g = [r for r in rows if area(r["TaxDistrict"]) == a]
    stock["by_area"][a] = {"units": len(g), "pct_4pct": pct(sum(1 for r in g if r in four), len(g)),
                           "pct_mailing_outside_sc": pct(sum(1 for r in g if r["OwnerState"] and r["OwnerState"].strip() not in ("SC", "")), len(g)),
                           "median_county_market_value": st.median([r["MarketProp"] for r in g if r["MarketProp"]])}
sizes = sorted(blds.values())
stock["units_per_regime"] = {"median": st.median(sizes), "regimes_100_plus": sum(1 for s in sizes if s >= 100),
                             "units_in_regimes_100_plus": sum(s for s in sizes if s >= 100)}
out["stock"] = stock
# 2. the sales
cs = [x for x in deeds if x.get("condo")]; hs = [x for x in deeds if not x.get("condo")]
def summ(g):
    pr = [x["cons"] for x in g]
    m = [x for x in g if x.get("owner_is_grantee") and x.get("where") in ("SC", "US", "CANADA", "OTHER")]
    return {"sales": len(g), "median_price": st.median(pr), "quartiles": [round(q) for q in st.quantiles(pr, n=4)],
            "builder_sales": sum(1 for x in g if x["builder"]), "matched_owner": len(m),
            "pct_buyer_mailing_outside_sc": pct(sum(1 for x in m if x["where"] != "SC"), len(m)),
            "under_200k": sum(1 for x in g if x["cons"] < 200000), "pct_under_200k": pct(sum(1 for x in g if x["cons"] < 200000), len(g))}
out["sales"] = {"condo": summ(cs), "other": summ(hs)}
PIN = {r["PIN"]: r for r in rows}
by_area = collections.defaultdict(list)
for x in cs:
    r = PIN.get(int(x["pin"])) if str(x["pin"]).isdigit() else None
    by_area[area(r["TaxDistrict"]) if r else "not in condo layer"].append(x)
out["sales"]["condo_by_area"] = {a: {"sales": len(g), "median_price": st.median([x["cons"] for x in g])} for a, g in by_area.items()}
grp = collections.Counter(x["legal"].split(";")[0].strip() for x in cs if x.get("legal"))
top = []
for name, k in grp.most_common(12):
    g = [x for x in cs if x.get("legal", "").split(";")[0].strip() == name]
    units = blds.get(name)
    top.append({"legal_name": name, "sales": k, "units_in_regime": units, "pct_of_units_sold": pct(k, units) if units else None,
                "median_price": st.median([x["cons"] for x in g]), "builder_sales": sum(1 for x in g if x["builder"])})
out["sales"]["top_regimes_by_recorded_sales"] = top
out["sales"]["regimes_with_a_sale"] = len(grp)
# 3. flood zones at condo sale points
def zone(x):
    if not x.get("lat"): return None
    v = flood.get(f"{x['lat']:.5f},{x['lon']:.5f}")
    if v is None: return None
    if not v: return "no zone mapped"
    zs = {f["FLD_ZONE"] for f in v}
    for z in ("VE", "AE", "A", "AO", "AH"):
        if z in zs: return z
    return "X" if "X" in zs else sorted(zs)[0]
zc = collections.Counter(zone(x) for x in cs)
known = sum(v for k, v in zc.items() if k)
sfha = sum(v for k, v in zc.items() if k in ("VE", "AE", "A", "AO", "AH"))
out["flood_condo_sales"] = {"sales_with_zone": known, "by_zone": {str(k): v for k, v in zc.most_common()},
                            "pct_VE": pct(zc["VE"], known), "pct_AE": pct(zc["AE"], known), "pct_high_risk": pct(sfha, known)}
zh = collections.Counter(zone(x) for x in hs)
kh = sum(v for k, v in zh.items() if k)
out["flood_other_sales"] = {"sales_with_zone": kh, "by_zone": {str(k): v for k, v in zh.most_common()},
                            "pct_high_risk": pct(sum(v for k, v in zh.items() if k in ("VE", "AE", "A", "AO", "AH")), kh)}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
