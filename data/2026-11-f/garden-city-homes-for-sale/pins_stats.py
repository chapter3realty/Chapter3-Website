"""Price and beds of the active homes in the CRM Garden City area, from the map API pins (list price, beds). Reads the scratch pin files (they hold addresses; not in the repo). Writes pins-stats.json (no address, no MLS). python3 -I pins_stats.py <scratch dir>"""
import json,sys,statistics as st,collections,re
S=sys.argv[1];out={}
def pr(s): return int(re.sub(r"[^\d]","",s))
def q(v):
    v=sorted(v);n=len(v)
    return None if not n else {"n":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
for t in ("house","condo","manufactured"):
    d=json.load(open(f"{S}/map-{t}.json"));P=d["pins"]
    out[t]={"total":d["total"],"pins":len(P),"price":q([pr(p["price"]) for p in P]),"beds":dict(sorted(collections.Counter(str(p["beds"]) for p in P).items())),
      "tags":dict(collections.Counter(p.get("tag") or "" for p in P)),
      "bands":{"under300":sum(1 for p in P if pr(p["price"])<300000),"300_599":sum(1 for p in P if 300000<=pr(p["price"])<600000),"600_999":sum(1 for p in P if 600000<=pr(p["price"])<1000000),"1m_up":sum(1 for p in P if pr(p["price"])>=1000000)},
      "acres_1_up":sum(1 for p in P if float(re.sub(r"[^\d.]","",str(p.get("acres") or "0")) or 0)>=1)}
json.dump(out,open("pins-stats.json","w"),indent=1);print(json.dumps(out,indent=1))
