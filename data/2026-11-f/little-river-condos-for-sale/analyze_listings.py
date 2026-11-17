"""Aggregates of the condos for sale with MLS city Little River (cards.json from pull_listings.py; only rows whose city is Little River). Counts, middles, quartiles. No address, MLS number or single price kept. Run: python3 -I analyze_listings.py <dir>"""
import json,sys,statistics as st,collections
D=sys.argv[1]; raw=json.load(open(D+"/cards.json")); C=[c for c in raw["cards"] if c["city"]=="Little River"]
def q(v):
    v=sorted(x for x in v if x is not None); n=len(v)
    if n==0: return None
    return {"n":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
o={"refreshedAt":raw["refreshedAt"],"n":len(C)}
o["price"]=q([c["listPrice"] for c in C]); o["fee"]=q([c["hoaMonthly"] for c in C]); o["sqft"]=q([c["sqft"] for c in C]); o["year"]=q([c["yearBuilt"] for c in C])
o["fee_zero"]=sum(1 for c in C if c["hoaMonthly"]==0); o["fee_missing"]=sum(1 for c in C if c["hoaMonthly"] is None)
bb=collections.Counter(min(c["beds"] or 0,4) for c in C)
o["beds_counts"]=dict(sorted(bb.items()))
o["by_beds"]={str(b):{"price":q([c["listPrice"] for c in C if min(c["beds"] or 0,4)==b]),"fee":q([c["hoaMonthly"] for c in C if min(c["beds"] or 0,4)==b]),"sqft":q([c["sqft"] for c in C if min(c["beds"] or 0,4)==b])} for b in sorted(bb)}
o["waterfront"]={"tag":sum(1 for c in C if c["waterfront"]),"price_wf":q([c["listPrice"] for c in C if c["waterfront"]]),"fee_wf":q([c["hoaMonthly"] for c in C if c["waterfront"]]),"price_not":q([c["listPrice"] for c in C if not c["waterfront"]]),"fee_not":q([c["hoaMonthly"] for c in C if not c["waterfront"]])}
o["by_beds_wf"]={str(b):{"wf":q([c["listPrice"] for c in C if c["waterfront"] and min(c["beds"] or 0,4)==b]),"not":q([c["listPrice"] for c in C if not c["waterfront"] and min(c["beds"] or 0,4)==b]),"fee_wf":q([c["hoaMonthly"] for c in C if c["waterfront"] and min(c["beds"] or 0,4)==b]),"fee_not":q([c["hoaMonthly"] for c in C if not c["waterfront"] and min(c["beds"] or 0,4)==b])} for b in (1,2,3)}
dec=collections.Counter((c["yearBuilt"]//10*10 if c["yearBuilt"] else None) for c in C); o["decade_built"]={str(k):v for k,v in sorted(dec.items(),key=lambda x:(x[0] is None,x[0]))}
o["built_before_2000"]=sum(1 for c in C if c["yearBuilt"] and c["yearBuilt"]<2000); o["with_year"]=sum(1 for c in C if c["yearBuilt"])
o["new_construction_flag"]=sum(1 for c in C if c["newConstruction"])
# buildings by MLS subdivision group
def grp(s):
    s=(s or "").upper()
    for k,p in (("Cypress Bay","CYPRESS BAY"),("Baytree","BAY TREE"),("Baytree","BAYTREE"),("Carolina Yacht Landing","YACHT LANDING"),("Spinnaker","SPINNAKER"),("Little River Inn Resort","LITTLE RIVER INN"),
                ("Lightkeepers Village","LIGHTKEEPERS"),("Mariner's Pointe","MARINERS"),("Intercoastal Village","INTERCOASTAL")):
        if p in s: return k
    return "other"
G=collections.defaultdict(list)
for c in C: G[grp(c["subdivision"])].append(c)
o["groups"]={k:{"n":len(v),"price":q([c["listPrice"] for c in v]),"fee":q([c["hoaMonthly"] for c in v]),"beds":q([c["beds"] for c in v]),"year":q([c["yearBuilt"] for c in v]),"wf":sum(1 for c in v if c["waterfront"])} for k,v in sorted(G.items(),key=lambda x:-len(x[1]))}
o["subdivision_names"]=collections.Counter(c["subdivision"] for c in C).most_common(80)
json.dump(o,open(D+"/findings-listings.json","w"),indent=1); print(json.dumps({k:v for k,v in o.items() if k not in("subdivision_names","groups")},indent=0)[:3500]); print(json.dumps(o["groups"])[:3500])
