"""Findings for /submarkets/myrtle-beach/golf-and-yacht-club/. Parcels: county GIS, legal description starts 'MB GOLF & YACHT' (PIN kept only in scratch).
Sales: Horry County deeds recorded 2025-11-01..2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json), a sale = deed on one community parcel, price over $10,000,
deed covering several parcels dropped. House = county building value over 0, land use 110/101. Writes findings.json: counts, medians, ranges only.
Run: SCR=<scratch> python3 -I analyze.py <this dir>"""
import json,os,sys,urllib.request,urllib.parse,collections,statistics as st,datetime
D=sys.argv[1];SCR=os.environ["SCR"]
B="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
def post(l,p):
    return json.loads(urllib.request.urlopen(urllib.request.Request(B%l,data=urllib.parse.urlencode(dict(p,f="json")).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=120).read())
d=post(24,{"where":"LegalDescr LIKE 'MB GOLF & YACHT%'","outFields":"PIN,LegalDescr,LandUseCode,MarketLand,MarketImprv,MarketProp,AssessedProp,TaxableProp,SaleDate","returnGeometry":"false","resultRecordCount":2000})
rows=[f["attributes"] for f in d["features"]]; assert not d.get("exceededTransferLimit")
json.dump(rows,open(SCR+"/parcels-pin.json","w"))
deeds=json.load(open(os.environ.get("SALES","/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/wt-139/data/2026-11-n/buyers-builders/raw/deeds-co.json")))
byp={str(int(float(r["PIN"]))).zfill(11):r for r in rows}
multi=collections.Counter(x["BookPage"] for x in deeds["deeds"])
sales=[]
for x in deeds["deeds"]:
    r=byp.get(x["ParcelNumber"])
    if not r or (x["Consideration"] or 0)<=10000 or multi[x["BookPage"]]>1: continue
    sales.append({"month":x["RecordDate"][:7],"price":x["Consideration"],"house":(r["MarketImprv"] or 0)>0})
def q(v):
    v=sorted(v);n=len(v);return {"n":n,"min":v[0],"q1":v[n//4],"median":st.median(v),"q3":v[(3*n)//4],"max":v[-1]} if v else {}
H=[r for r in rows if r["LandUseCode"] in("110","101") and (r["MarketImprv"] or 0)>0]
ratio=[round(r["AssessedProp"]/r["MarketProp"],3) for r in H if r["MarketProp"]]
hs=[s for s in sales if s["house"]]
out={"made":datetime.date.today().isoformat(),"rule":__doc__,"parcels":len(rows),"land_use":dict(collections.Counter(r["LandUseCode"] for r in rows)),
 "houses":len(H),"county_market_value_houses":q([r["MarketProp"] for r in H]),"assessed_ratio":dict(collections.Counter(ratio).most_common(5)),
 "sales_window":[deeds["from"],deeds["to"]],"house_sales":{"count":len(hs),"prices":q([s["price"] for s in hs]),"by_month":dict(sorted(collections.Counter(s["month"] for s in hs).items()))},
 "all_sales_count":len(sales),"lot_sales":[s["price"] for s in sales if not s["house"]]}
json.dump(out,open(D+"/findings.json","w"),indent=1);print(json.dumps(out,indent=0))
