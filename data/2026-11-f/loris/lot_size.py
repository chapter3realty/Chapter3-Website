"""Lot size (county parcel Acreage) of houses sold 2025-11-01 to 2026-10-31, same filter as analyze_deeds.py, for postal cities Loris, Conway and Longs; and Loris prices by inside/outside the city (tax district 220).
Usage: python3 -I lot_size.py <buyers-builders dir> <dir with postal-all.json>. Writes lot-size.json. Counts and medians only."""
import json,sys,re,statistics as st,collections
B,D=sys.argv[1],sys.argv[2]
R=json.load(open(B+"/raw/deeds-co.json"))["deeds"];P=json.load(open(B+"/raw/parcels.json"))["parcels"];PC=json.load(open(D+"/postal-all.json"))["postal_city"]
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY");MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
multi=collections.Counter(d["BookPage"] for d in R)
ok=[d for d in R if (d["Consideration"] or 0)>10000 and re.fullmatch(r"\d{11}",d["ParcelNumber"] or "") and not TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "") and multi[d["BookPage"]]==1 and d["ParcelNumber"] in P and P[d["ParcelNumber"]]["LandUseCode"] in("101","106","109")]
out={}
def q(v):
    v=sorted(v);n=len(v);return {"count":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))]} if n else None
for c in("Loris","Conway","Longs"):
    k=[d for d in ok if PC.get(d["ParcelNumber"],[""])[0]==c and P[d["ParcelNumber"]].get("Acreage") is not None]
    a=[P[d["ParcelNumber"]]["Acreage"] for d in k]
    out[c]={"houses_with_acreage":len(a),"acres":q(a),"one_acre_or_more":sum(1 for x in a if x>=1),"two_acres_or_more":sum(1 for x in a if x>=2),"under_half_acre":sum(1 for x in a if x<.5)}
L=[d for d in ok if PC.get(d["ParcelNumber"],[""])[0]=="Loris"]
out["Loris_inside_city_220"]=q([d["Consideration"] for d in L if P[d["ParcelNumber"]]["TaxDistrict"]=="220"])
out["Loris_outside_city"]=q([d["Consideration"] for d in L if P[d["ParcelNumber"]]["TaxDistrict"]!="220"])
out["Loris_by_acres_price"]={n:q([d["Consideration"] for d in L if lo<=(P[d["ParcelNumber"]].get("Acreage") or 0)<hi]) for n,lo,hi in(("under 0.5",0,.5),("0.5 to 1",.5,1),("1 to 2",1,2),("2 and up",2,999))}
json.dump(out,open(D+"/lot-size.json","w"),indent=1);print(json.dumps(out,indent=1))
