"""Homes for sale now under the MLS subdivision "Myrtle Beach Golf & Yacht" (search subdivision=Myrtle+Beach+Golf+%26+Yacht, 9 homes) and
"Sandpiper Place - MB Golf & Yacht" (2), from https://chapter3realty.com/homes/api/map and /lookup. Saved: aggregate-ready rows with no MLS number, address or firm
(lat/lng rounded to 3 places). Run: python3 -I pull_listings.py <dir>"""
import json,sys,urllib.request,urllib.parse
def get(p,q): return json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/"+p+"?"+urllib.parse.urlencode(q),headers={"User-Agent":"Mozilla/5.0"}),timeout=60))
out={}
for sub in["Myrtle Beach Golf & Yacht","Sandpiper Place - MB Golf & Yacht"]:
    d=get("map",{"subdivision":sub});rows=[]
    for p in d["pins"]:
        c=get("lookup",{"mls":p["mls"]}).get("facts") or {}
        if c.get("subdivision")!=sub: continue
        rows.append({k:c.get(k) for k in("subdivision","type","listPrice","beds","baths","sqft","yearBuilt","hoaMonthly","lotAcres","waterfront","zip")}|{"lat":round(p["lat"],3),"lng":round(p["lng"],3)})
    out[sub]={"refreshedAt":d["meta"]["refreshedAt"],"rows":rows}
json.dump(out,open(sys.argv[1]+"/listings.json","w"),indent=1)
