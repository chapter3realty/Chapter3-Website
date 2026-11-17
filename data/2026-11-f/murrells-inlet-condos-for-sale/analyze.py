"""Aggregates for the page: listings (cards.json) and deed sales inside the City of Myrtle Beach tax districts (raw/sales-rows.json).
Writes findings.json. No address, MLS number or unit. Run: python3 -I analyze.py <this dir>."""
import json, statistics as st, collections, sys
D = sys.argv[1]
c = json.load(open(D + "/cards.json")); cards = [x for x in c["cards"] if x.get("listPrice")]
def qs(v):
    v = sorted(v)
    if not v: return None
    q = st.quantiles(v, n=4) if len(v) > 3 else [v[0], st.median(v), v[-1]]
    return {"n": len(v), "min": v[0], "p25": q[0], "median": st.median(v), "p75": q[2], "max": v[-1]}
out = {"refreshedAt": c["refreshedAt"], "total": c["total"], "cards": len(cards)}
out["types"] = collections.Counter(x["type"] for x in cards)
out["cities"] = collections.Counter(x["city"] for x in cards)
pr = [x["listPrice"] for x in cards if x["listPrice"]]
out["price"] = qs(pr)
out["price_bands"] = {"under_150k": sum(p < 150000 for p in pr), "150k_300k": sum(150000 <= p < 300000 for p in pr), "300k_plus": sum(p >= 300000 for p in pr), "under_100k": sum(p < 100000 for p in pr), "300k_500k": sum(300000 <= p < 500000 for p in pr), "500k_plus": sum(p >= 500000 for p in pr), "1m_plus": sum(p >= 1000000 for p in pr)}
out["by_beds"] = {str(b): {"n": sum(1 for x in cards if x["beds"] == b), "price": qs([x["listPrice"] for x in cards if x["beds"] == b and x["listPrice"]]), "sqft": qs([x["sqft"] for x in cards if x["beds"] == b and x["sqft"]]), "hoa": qs([x["hoaMonthly"] for x in cards if x["beds"] == b and x["hoaMonthly"]])} for b in (0, 1, 2, 3, 4)}
out["by_beds"]["4plus"] = {"n": sum(1 for x in cards if (x["beds"] or 0) >= 4)}
for name, f in (("oceanfront", lambda x: x["waterfront"]), ("not_oceanfront", lambda x: not x["waterfront"])):
    g = [x for x in cards if f(x)]
    out[name] = {"n": len(g), "price": qs([x["listPrice"] for x in g if x["listPrice"]]), "hoa": qs([x["hoaMonthly"] for x in g if x["hoaMonthly"]]), "hoa_missing": sum(1 for x in g if not x["hoaMonthly"])}
    out[name]["hoa_by_beds"] = {str(b): qs([x["hoaMonthly"] for x in g if x["beds"] == b and x["hoaMonthly"]]) for b in (1, 2, 3)}
out["hoa_all"] = qs([x["hoaMonthly"] for x in cards if x["hoaMonthly"]]); out["hoa_missing"] = sum(1 for x in cards if not x["hoaMonthly"])
out["tags"] = collections.Counter(x["tag"] for x in cards)
yb = [x["yearBuilt"] for x in cards if x["yearBuilt"]]
out["year_built"] = {"n": len(yb), "median": st.median(yb), "min": min(yb), "max": max(yb), "since_2015": sum(y >= 2015 for y in yb), "before_1990": sum(y < 1990 for y in yb), "since_2022": sum(y >= 2022 for y in yb)}
out["new_construction"] = sum(1 for x in cards if x["newConstruction"])
out["subdivisions_top"] = collections.Counter(x["subdivision"] for x in cards).most_common(60)
out["subdivisions_n"] = len({x["subdivision"] for x in cards})
CITY = {"660"}
rows = json.load(open(D + "/raw/sales-rows.json"))
def sales(f): v = [r[2] for r in rows if f(r)]; return qs(v)
out["sales"] = {"horry_condo_deeds": len(rows), "horry": sales(lambda r: True), "city_limits": sales(lambda r: r[0] in CITY), "outside_city": sales(lambda r: r[0] not in CITY), "surfside_district_660": sales(lambda r: r[0] == "660")}
sb = collections.defaultdict(list)
for r in rows:
    if r[0] in CITY: sb[r[1]].append(r[2])
out["sales_by_regime_top"] = sorted(((k, len(v), st.median(v)) for k, v in sb.items()), key=lambda t: -t[1])[:25]
out["sales_city_bands"] = {"under_100k": sum(1 for r in rows if r[0] in CITY and r[2] < 100000), "100_200k": sum(1 for r in rows if r[0] in CITY and 100000 <= r[2] < 200000), "200_300k": sum(1 for r in rows if r[0] in CITY and 200000 <= r[2] < 300000), "300_500k": sum(1 for r in rows if r[0] in CITY and 300000 <= r[2] < 500000), "500k_plus": sum(1 for r in rows if r[0] in CITY and r[2] >= 500000)}
json.dump(out, open(D + "/findings.json", "w"), indent=1, default=dict); print(json.dumps(out, default=dict)[:6000])
