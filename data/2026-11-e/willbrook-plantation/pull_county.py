"""Willbrook Plantation (Pawleys Island, Georgetown County): the county's public GIS, read for the community's parcels.
Community = every parcel whose legal description contains WILLBROOK (the county's section names: WILLBROOK PHASE n, WILLBROOK PLNT STAGE n).
Source: https://gis1.georgetowncountysc.org/portal/rest/services (GCGIS_Export 2 parcels, 0 addresses; GCGIS_Nature 9 flood, 6 and 7 not used here).
Owner names are never saved; no owner field is requested. The per-parcel cache goes to RAW (outside the repo).
Run: RAW=<scratch dir> python3 -I pull_county.py <this dir>"""
import json, os, sys, time, urllib.parse, urllib.request, datetime
D, RAW = sys.argv[1], os.environ["RAW"]
B = "https://gis1.georgetowncountysc.org/portal/rest/services"
def get(path, p):
    for i in range(6):
        try:
            with urllib.request.urlopen(f"{B}/{path}/query?" + urllib.parse.urlencode(dict(p, f="json")), timeout=120) as r:
                d = json.load(r)
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", path, e, file=sys.stderr); time.sleep(4)
    raise SystemExit("failed " + path)
def pull(path, where, fields, geom=True, extra=None, page=500):
    out, off = [], 0
    while True:
        p = {"where": where, "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": 4326, "geometryPrecision": 6,
             "resultOffset": off, "resultRecordCount": page}
        if extra: p.update(extra)
        d = get(path, p); fs = d.get("features", []); out += fs
        if len(fs) < page and not d.get("exceededTransferLimit"): return out
        off += len(fs)
PF = "TMS,StreetNumber,StreetName,City,State,ZipCode,TotalLandArea,SaleDate,SalePrice,LandUseCode,LegalDescription,Zone"
par = pull("GCGIS_Export/FeatureServer/2", "LegalDescription LIKE '%WILLBROOK%'", PF)
print("parcels", len(par))
xs = [x for f in par for r in f["geometry"]["rings"] for x, y in r]; ys = [y for f in par for r in f["geometry"]["rings"] for x, y in r]
env = {"geometry": f"{min(xs)-.004},{min(ys)-.004},{max(xs)+.004},{max(ys)+.004}", "geometryType": "esriGeometryEnvelope", "inSR": 4326, "spatialRel": "esriSpatialRelIntersects"}
geo = {"flood": pull("GCGIS_Nature/FeatureServer/9", "1=1", "FLD_ZONE,ZONE_SUBTY,STATIC_BFE,SFHA_TF", extra=env),
       "munis": pull("GCGIS_Boundaries/FeatureServer/1", "1=1", "*"),
       "addr": pull("GCGIS_Export/FeatureServer/0", "1=1", "TMS,Add_Type,Status,Inc_Muni", extra=env)}
for k, v in geo.items(): print(k, len(v))
json.dump({"read": datetime.datetime.now(datetime.UTC).isoformat(), "bbox": env["geometry"], "parcels": par, "geo": geo}, open(os.path.join(RAW, "county.json"), "w"))
