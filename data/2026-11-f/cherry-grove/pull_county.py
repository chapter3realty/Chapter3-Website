"""Cherry Grove's old plats (legal description starts CHERRY GROVE) in Horry County's public records, aggregate only.
Parcels: county GIS layer 24, LegalDescr LIKE 'CHERRY GROVE%'. House = building value over $0 and land use 101/106/109; lot = no building value;
condo = land use 107. Kept: counts, medians, ranges, tax-ratio counts, owner mailing state counts, flood zone counts.
Sales: deeds recorded 2025-11-01 to 2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json, AcclaimWeb DEED 001) whose ParcelNumber is a
parcel of the old plats above (matched by parcel number, not by words); stated price over $10,000. No PIN, owner or address is written.
Run: python3 -I pull_county.py <this dir> <website root>"""
import json, sys, time, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
feats, off = [], 0
while True:
    q = {"where": "LegalDescr LIKE 'CHERRY GROVE%'", "outFields": "PIN,LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,Acreage",
         "returnGeometry": "false", "resultOffset": off, "resultRecordCount": 1000, "f": "json"}
    j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=180)); time.sleep(0.5)
    f = j.get("features", []); feats += f
    if not j.get("exceededTransferLimit") or not f: break
    off += len(f)
rows = [x["attributes"] for x in feats]
def kind(a):
    lu = (a.get("LandUseCode") or "")
    if (a.get("MarketImprv") or 0) <= 0: return "lot"
    if lu == "107": return "condo"
    if lu in ("101", "106", "109"): return "house"
    return "other"
for a in rows: a["k"] = kind(a)
kc = collections.Counter(a["k"] for a in rows)
H = [a for a in rows if a["k"] == "house"]
r4 = sum(1 for a in H if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.003)
oos = sum(1 for a in H if (a.get("OwnerState") or "SC").upper() not in ("SC", ""))
ac = sorted(a["Acreage"] for a in H if a.get("Acreage"))
val = sorted(a["MarketProp"] for a in H if a.get("MarketProp"))
def q4(v):
    v = sorted(v); return {"n": len(v), "min": v[0], "p25": st.quantiles(v, n=4)[0], "median": st.median(v), "p75": st.quantiles(v, n=4)[2], "max": v[-1]} if len(v) > 3 else {"n": len(v)}
names = collections.Counter(re.split(r";", a["LegalDescr"])[0].strip() for a in rows)
byname = collections.defaultdict(list)
for a in H: byname[re.split(r";", a["LegalDescr"])[0].strip()].append(a)
pin2 = {str(a["PIN"]).strip(): a for a in rows}
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
sales = []
for x in d2["deeds"]:
    c = (x.get("Comments") or "").upper()
    p = pin2.get(str(x.get("ParcelNumber")).strip())
    if not p: continue
    if (x.get("Consideration") or 0) <= 10000: continue
    sales.append({"k": p["k"] if p else "unmatched", "cons": x["Consideration"], "date": x["RecordDate"], "legal": p["LegalDescr"].split(";")[0].strip().upper()})
sk = collections.defaultdict(list)
for s in sales: sk[s["k"]].append(s["cons"])
q = collections.Counter(s["date"][:4] + "Q" + str((int(s["date"][5:7]) - 1) // 3 + 1) for s in sales if s["k"] == "house")
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "parcels": len(rows), "by_kind": dict(kc),
       "name_counts": names.most_common(12), "house_acres": q4(ac) if len(ac) > 3 else None, "house_county_value": q4(val),
       "houses_taxed_4pct_legal_residence": r4, "houses": len(H), "houses_owner_mail_out_of_sc": oos,
       "sales_window": [d2["from"], d2["to"]], "sales": {k: q4(v) for k, v in sk.items()},
       "house_sales_by_quarter": dict(sorted(q.items())), "house_sales_by_name": {n: q4([s["cons"] for s in sales if s["k"] == "house" and s["legal"].startswith(n)]) for n in list(byname)[:6]}}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps(out, indent=1, default=str)[:5000])
