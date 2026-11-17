"""Aggregates from cards-anon.json (one anonymous card per home for sale inside Horry County): asking price, monthly HOA fee by kind and by bedrooms for condos, new construction share. Counts and ranges only. Usage: python3 -I analyze_cards.py <dir>. Writes cards-stats.json"""
import json,sys,statistics as st,collections
D=sys.argv[1]; C=[c for c in json.load(open(D+"/cards-anon.json"))["cards"] if c["answered"] and c["price"]]
def q(v):
    v=sorted(v); n=len(v)
    if not n: return None
    return {"n":n,"median":st.median(v),"p25":v[n//4],"p75":v[min(n-1,3*n//4)],"min":v[0],"max":v[-1]}
out={"cards":len(C),"by_type":dict(collections.Counter(c["type"] for c in C))}
for t in ("house","condo","townhouse"):
    L=[c for c in C if c["type"]==t]
    pos=[c["hoa"] for c in L if c["hoa"] and c["hoa"]>0]; zero=sum(1 for c in L if c["hoa"]==0); none=sum(1 for c in L if c["hoa"] is None)
    out[t]={"cards":len(L),"asking":q([c["price"] for c in L]),"hoa_monthly_positive":q(pos),"hoa_zero":zero,"hoa_missing":none,"new_construction":sum(1 for c in L if c["newc"])}
cb={}
for b in (1,2,3):
    L=[c["hoa"] for c in C if c["type"]=="condo" and c["beds"]==b and c["hoa"] and c["hoa"]>0]; cb[str(b)]=q(L)
out["condo_hoa_by_beds"]=cb
hb={}
for city in ("Myrtle Beach","Conway","Longs","Loris","Little River","North Myrtle Beach","Surfside Beach"):
    L=[c["hoa"] for c in C if c["type"]=="house" and c["city"]==city and c["hoa"] and c["hoa"]>0]; hb[city]=q(L)
out["house_hoa_by_city"]=hb
json.dump(out,open(D+"/cards-stats.json","w"),indent=1); print(json.dumps(out,indent=1))
