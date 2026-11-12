import json,urllib.request,urllib.parse,time,sys
from collections import Counter
B="https://chapter3realty.com/homes/api/map?"
def g(p):
    j=json.load(urllib.request.urlopen(urllib.request.Request(B+urllib.parse.urlencode(p),headers={"User-Agent":"Mozilla/5.0 (research; chapter3realty.com)"}),timeout=60)); time.sleep(2.2); return j
EX={"mb":{"type":"condo","city":"Myrtle Beach","has":"oceanfront_building,inside_city_limits,str_allowed"},
"nmb":{"type":"condo","city":"North Myrtle Beach","has":"oceanfront_building,str_allowed"},
"surfside":{"type":"condo","city":"Surfside Beach","has":"str_allowed"},
"gc":{"type":"condo","has":"area_garden_city,str_allowed"}}
out={}
for n,p in EX.items():
    pins=[x for x in g(dict(p,beds=2))['pins'] if x['beds']==2]
    c=Counter(); samp={}
    for x in pins:
        q={"geometry":f"{x['lng']},{x['lat']}","geometryType":"esriGeometryPoint","inSR":"4326","spatialRel":"esriSpatialRelIntersects","outFields":"PIN,TaxDistrict","returnGeometry":"false","f":"json"}
        try:
            j=json.load(urllib.request.urlopen("https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?"+urllib.parse.urlencode(q),timeout=60))
            ds=sorted(set(f['attributes']['TaxDistrict'] for f in j['features']))
            k=','.join(str(d) for d in ds) or 'none'
        except Exception as e: k='err'
        c[k]+=1
        if k not in samp and j.get('features'): samp[k]=j['features'][0]['attributes']['PIN']
    out[n]={'counts':dict(c),'sample_pin':samp}; print(n,dict(c),samp,flush=True)
json.dump(out,open('districts.json','w'),indent=1)
