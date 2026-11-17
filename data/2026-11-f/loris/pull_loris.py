"""Homes for sale now in Loris (MLS city "Loris") in aggregate from the site's public map API and card lookup. Saves counts, ranges, subdivision names with counts. No address, MLS number, firm or photo is saved. Run: python3 -I pull_loris.py <dir>"""
import json,sys,time,urllib.request,urllib.parse,datetime,collections,statistics as st
D=sys.argv[1];B="https://chapter3realty.com/homes/api/"
def get(path,p):
    u=B+path+"?"+urllib.parse.urlencode(p)
    for i in range(8):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=90))
            if r.get("ok") is False: raise Exception(r)
            return r
        except Exception: time.sleep(3+3*i)
    raise SystemExit("failed "+u)
def total(**p): return get("map",dict(city="Loris",**p))["total"]
def pins(**p): return get("map",dict(city="Loris",**p))["pins"]
out={"pulled":datetime.datetime.now(datetime.UTC).isoformat(),"rule":__doc__}
out["totals"]={t:total(type=t) for t in ["house","condo","townhouse","manufactured","multi","land"]}; out["totals"]["all"]=total()
# slice houses by price until each slice has under 144 so every pin comes back
def slices(lo,hi,**p):
    n=total(min=lo,max=hi,**p)
    if n==0: return []
    if n<140 or hi-lo<=2000: return [(lo,hi)]
    m=(lo+hi)//2
    return slices(lo,m,**p)+slices(m+1,hi,**p)
mls={}
for typ in ["house","condo","townhouse"]:
    for lo,hi in slices(0,5000000,type=typ):
        for x in pins(type=typ,min=lo,max=hi): mls[x["mls"]]=typ
out["mls_collected"]=dict(collections.Counter(mls.values()))
cards={}
for m,t in mls.items():
    time.sleep(0.15); f=get("lookup",{"mls":m}).get("facts") or {}
    cards[m]=dict(type=t,price=f.get("listPrice"),beds=f.get("beds"),baths=f.get("baths"),sqft=f.get("sqft"),yb=f.get("yearBuilt"),hoa=f.get("hoaMonthly"),sub=f.get("subdivision"),acres=f.get("lotAcres") or f.get("acres"),taxAnnual=f.get("taxAnnual"),flood=f.get("floodZone"),waterfront=f.get("waterfront"),newc=f.get("newConstruction"),dom=f.get("daysOnMarket"),stories=f.get("stories"),zip=f.get("zip"))
json.dump(list(cards.values()),open(D+"/cards-anon.json","w"))  # no mls, address
print(len(cards))

out["cards_with_price"]=sum(1 for c in cards.values() if c["price"])
json.dump(out,open(D+"/listings-pull.json","w"),indent=1)
