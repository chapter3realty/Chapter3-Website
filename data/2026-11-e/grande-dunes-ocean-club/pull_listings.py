"""Homes for sale now in Grande Dunes, aggregate only, from https://chapter3realty.com/homes/api/map (CCMLS via the CRM)
and /homes/api/lookup. Saves counts, price, size and HOA ranges per MLS subdivision and type.
No MLS number, address or photo is saved. Run: python3 -I pull_listings.py <this dir> (raw copies in raw/ keep MLS numbers, scratch only)."""
import json, sys, os, time, urllib.request, urllib.parse, statistics as st, collections, datetime
D=sys.argv[1]; B="https://chapter3realty.com/homes/api/"
def get(p,q):
    u=B+p+"?"+urllib.parse.urlencode(q)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=90))
        except Exception: time.sleep(3+3*i)
    raise SystemExit("fail "+u)
out={"pulled":datetime.datetime.now(datetime.UTC).isoformat()}
m=get("map",{"subdivision":"Grande Dunes"}); out["refreshedAt"]=m["meta"]["refreshedAt"]
cards=[get("lookup",{"mls":p["mls"]})["facts"] for p in m["pins"]]
json.dump(cards,open(os.path.join(D,"raw/cards.json"),"w"))
def summ(cs):
    r={"n":len(cs)}
    pr=[c["listPrice"] for c in cs if c.get("listPrice")]
    if pr: r["price"]={"median":st.median(pr),"min":min(pr),"max":max(pr)}
    sq=[c["sqft"] for c in cs if c.get("sqft")]
    if sq: r["sqft_median"]=st.median(sq)
    yb=[c["yearBuilt"] for c in cs if c.get("yearBuilt")]
    if yb: r["year_built"]=[min(yb),max(yb)]
    r["beds"]=sorted(collections.Counter(c.get("beds") for c in cs).items(),key=lambda x:str(x[0]))
    h=[c["hoaMonthly"] for c in cs if c.get("hoaMonthly") is not None]
    r["hoa_listed_n"]=len(h)
    if h: r["hoa"]={"min":min(h),"median":st.median(h),"max":max(h)}
    r["waterfront_flag"]=sum(1 for c in cs if c.get("waterfront"))
    return r
out["all"]=summ(cards)
out["all"]["built_2024_or_later"]=sum(1 for c in cards if (c.get("yearBuilt") or 0)>=2024)
out["types"]={t:summ([c for c in cards if c.get("type")==t]) for t in {c.get("type") for c in cards}}
out["subdivisions"]={s:summ([c for c in cards if c.get("subdivision")==s]) for s in sorted({c.get("subdivision") for c in cards})}
out["cities_zips"]=collections.Counter((c.get("city"),c.get("zip")) for c in cards).most_common()
out["cities_zips"]=[[list(k),v] for k,v in out["cities_zips"]]
json.dump(out,open(os.path.join(D,"listings.json"),"w"),indent=1,default=str)
print(json.dumps(out,indent=1,default=str)[:6000])
