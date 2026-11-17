"""FEMA NFHL MapServer layer 28 (S_FLD_HAZ_AR) over the community's bounding box, polygons kept for the share-of-lots count in analyze.py.
Run: RAW=<scratch> python3 -I pull_fema.py"""
import json,os,urllib.request,urllib.parse,time
RAW=os.environ["RAW"]; C=json.load(open(RAW+"/county.json"))
xs=[p[0] for a in C["parcels"].values() for r in a["rings"] for p in r]; ys=[p[1] for a in C["parcels"].values() for r in a["rings"] for p in r]
env="%f,%f,%f,%f"%(min(xs),min(ys),max(xs),max(ys))
U="https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query"
p={"geometry":env,"geometryType":"esriGeometryEnvelope","inSR":"4326","spatialRel":"esriSpatialRelIntersects","where":"1=1","outFields":"OBJECTID,FLD_ZONE,SFHA_TF,ZONE_SUBTY,STATIC_BFE","returnGeometry":"true","outSR":"4326","maxAllowableOffset":"0.00002","f":"json"}
for i in range(5):
    try: d=json.load(urllib.request.urlopen(urllib.request.Request(U,data=urllib.parse.urlencode(p).encode(),headers={"User-Agent":"Mozilla/5.0"}),timeout=120)); break
    except Exception as e: print("retry",e); time.sleep(5)
json.dump(d,open(RAW+"/fema.json","w")); print(env,[ (f["attributes"]["FLD_ZONE"],f["attributes"]["SFHA_TF"],f["attributes"]["ZONE_SUBTY"]) for f in d["features"]])
