"""Counts of homes for sale on the site's public map API by MLS city and kind, 12 cities the site lists, plus the unfiltered total. Counts only. Usage: python3 -I pull_counts.py > counts.json"""
import json,time,urllib.request,urllib.parse,datetime
B="https://chapter3realty.com/homes/api/map?"
def tot(**p):
    for i in range(8):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request(B+urllib.parse.urlencode(p),headers={"User-Agent":"Mozilla/5.0"}),timeout=90))
            if "total" in r: return r["total"]
        except Exception: pass
        time.sleep(3+2*i)
    return None
cities=["Myrtle Beach","North Myrtle Beach","Surfside Beach","Garden City","Murrells Inlet","Pawleys Island","Little River","Conway","Longs","Loris","Aynor","Calabash"]
out={"read":datetime.datetime.now(datetime.UTC).isoformat(),"all":tot(),"cities":{}}
for t in ["house","condo","townhouse"]: out["all_"+t]=tot(type=t)
for c in cities:
    out["cities"][c]={t:tot(city=c,type=t) for t in ["house","condo","townhouse"]}; out["cities"][c]["all"]=tot(city=c)
print(json.dumps(out,indent=1))
