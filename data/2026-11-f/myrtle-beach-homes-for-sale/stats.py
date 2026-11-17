"""Anonymous stats from cards-anon.json (no MLS number, address, firm). Usage: python3 -I stats.py > cards-stats.json"""
import json,statistics as st,collections
L=json.load(open("cards-anon.json")); P=json.load(open("listings-pull.json"))
def q(v):
    v=sorted(v); n=len(v)
    return None if not n else {"n":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
o={"totals":P["totals"],"mls_collected":P["mls_collected"]}
for t in("house","townhouse"):
    c=[x for x in L if x["type"]==t and x["price"]]
    o[t]={"cards":len(c),"price":q([x["price"] for x in c]),"hoa":q([x["hoa"] for x in c if x["hoa"]]),"hoa_zero_or_none":sum(1 for x in c if not x["hoa"]),
      "beds":dict(collections.Counter(x["beds"] for x in c)),"yb_median":st.median([x["yb"] for x in c if x["yb"]]),"zip":dict(collections.Counter(x["zip"] for x in c)),
      "bands":{k:sum(1 for x in c if a<=x["price"]<b) for k,(a,b) in {"<250":(0,250000),"250-350":(250000,350000),"350-450":(350000,450000),"450-650":(450000,650000),"650+":(650000,10**9)}.items()}}
    o[t]["zip_price"]={z:q([x["price"] for x in c if x["zip"]==z]) for z in o[t]["zip"]}
    o[t]["zip_hoa"]={z:q([x["hoa"] for x in c if x["zip"]==z and x["hoa"]]) for z in o[t]["zip"]}
    o[t]["subs"]=collections.Counter(x["sub"] for x in c if x["sub"]).most_common(60)
print(json.dumps(o,indent=1))
