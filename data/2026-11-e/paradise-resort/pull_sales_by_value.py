"""Paradise Resort: recorded sales split by the county's own market value for the unit (a stand-in for unit size, since deeds carry no
bedrooms): units the county values under $200,000 (the one-bedroom size; the one-bedrooms for sale ask $119,900 to $194,900) and units it
values at $300,000 or more (two- and three-bedrooms; those for sale ask $362,500 to $532,500). Sources: Horry County GIS layer 24
(PIN, MarketProp, LegalDescr 'PARADISE RESORT HPR%'), joined by PIN to the deed files named in pull_county.py (window 1: out-of-state-buyers.json,
2025-10-01 to 2026-09-30; window 2: data/2026-11-n/buyers-builders/raw/deeds-co.json, 2025-11-01 to 2026-10-31, Consideration >= 1000).
Kept: per group the count, median, lowest and highest price. A group of fewer than 3 is not kept. Never kept: a PIN, a unit, a buyer, a date of a single deed.
Run: python3 -I pull_sales_by_value.py <this dir> <website root>. Merges "sales_by_value" into county.json."""
import json, sys, urllib.request, urllib.parse, statistics as st, datetime, collections
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'PARADISE RESORT HPR%'", "outFields": "PIN,MarketProp", "returnGeometry": "false", "f": "json", "resultRecordCount": 2000}
rows = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120))["features"]
val = {str(r["attributes"]["PIN"]): r["attributes"]["MarketProp"] for r in rows}
def grp(v): return "under_200k" if v < 200000 else ("300k_up" if v >= 300000 else "between")
def summ(xs):
    return {"n": len(xs), "median": st.median(xs), "min": min(xs), "max": max(xs)} if len(xs) >= 3 else {"n": len(xs), "kept": False}
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "units_by_county_value": dict(collections.Counter(grp(v) for v in val.values() if v))}
s1 = [x for x in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if x["legal"].upper().startswith("PARADISE RESORT HPR")]
w1 = collections.defaultdict(list)
for x in s1: w1[grp(x["market_prop"])].append(x["cons"])
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))["deeds"]
w2 = collections.defaultdict(list); miss = 0
for x in d2:
    if str(x.get("ParcelNumber")) in val and (x.get("Consideration") or 0) >= 1000:
        w2[grp(val[str(x["ParcelNumber"])])].append(x["Consideration"])
out["window_1"] = {"window": "2025-10-01 to 2026-09-30", **{k: summ(v) for k, v in w1.items()}}
out["window_2"] = {"window": "2025-11-01 to 2026-10-31", **{k: summ(v) for k, v in w2.items()}}
c = json.load(open(D + "/county.json")); c["sales_by_value"] = out; json.dump(c, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps(out, indent=1, default=str)[1200:])
