"""Summarises cards-anon.json (anonymous cards: type, price, beds, hoa, subdivision...) into cards-stats.json. python3 -I stats.py"""
import json,statistics as st,collections
C=json.load(open("cards-anon.json"));out={}
def q(v):
    v=sorted(v);n=len(v)
    return None if not n else {"n":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
for t in ("house","condo"):
    L=[c for c in C if c["type"]==t]
    out[t]={"cards":len(L),"price":q([c["price"] for c in L if c["price"]]),"hoa_nonzero":q([c["hoa"] for c in L if c["hoa"]]),"hoa_zero":sum(1 for c in L if c["hoa"]==0),"hoa_none":sum(1 for c in L if c["hoa"] is None),
      "beds":dict(collections.Counter(c["beds"] for c in L)),"newc":sum(1 for c in L if c["newc"]),"yb_since_2010":sum(1 for c in L if (c["yb"] or 0)>=2010),"yb":q([c["yb"] for c in L if c["yb"]]),
      "subs":collections.Counter(c["sub"] for c in L if c["sub"]).most_common(25),"flood":dict(collections.Counter(str(c["flood"]) for c in L)),"waterfront":sum(1 for c in L if c["waterfront"])}
json.dump(out,open("cards-stats.json","w"),indent=1);print(json.dumps(out,indent=1))
