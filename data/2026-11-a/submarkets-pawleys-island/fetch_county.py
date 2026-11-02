"""Pull Georgetown County GIS open data for the Pawleys Island area.

Writes raw files to $RAW (outside the repo: parcels carry owner mailing fields).
Run: RAW=<dir> python3 -I fetch_county.py
Source: https://gis1.georgetowncountysc.org/portal/rest/services (read 2026-11-02).
"""
import json, os, sys, time, urllib.parse, urllib.request

RAW = os.environ.get("RAW") or sys.exit("set RAW")
B = "https://gis1.georgetowncountysc.org/portal/rest/services"
ENV = "-79.22,33.36,-79.03,33.53"  # Litchfield north end to DeBordieu, ocean to the Waccamaw River


def get(url, params):
    q = urllib.parse.urlencode(params)
    for i in range(5):
        try:
            with urllib.request.urlopen(url + "?" + q, timeout=120) as r:
                return json.load(r)
        except Exception as e:  # retry slow pages
            print("retry", i, e, file=sys.stderr)
            time.sleep(3)
    raise SystemExit("failed " + url)


def pull(layer, out, fields="*", where="1=1", env=ENV, geom=True, page=2000, extra=None):
    feats, off = [], 0
    while True:
        p = {"where": where, "outFields": fields, "returnGeometry": "true" if geom else "false",
             "outSR": 4326, "f": "geojson" if geom else "json", "resultOffset": off,
             "resultRecordCount": page, "geometryPrecision": 6}
        if env:
            p.update({"geometry": env, "geometryType": "esriGeometryEnvelope", "inSR": 4326,
                      "spatialRel": "esriSpatialRelIntersects"})
        if extra:
            p.update(extra)
        d = get(f"{B}/{layer}/query", p)
        fs = d.get("features", [])
        feats += fs
        print(layer, off, len(fs), file=sys.stderr)
        if len(fs) < page and not d.get("exceededTransferLimit") and not d.get("properties", {}).get("exceededTransferLimit"):
            break
        off += len(fs)
        if not fs:
            break
    json.dump({"type": "FeatureCollection", "features": feats}, open(os.path.join(RAW, out), "w"))
    return len(feats)


PF = ",".join(["TMS", "Zone", "StreetNumber", "StreetName", "BillingAddress", "City", "State", "ZipCode",
               "TotalLandArea", "SaleDate", "SalePrice", "LandUseCode", "LegalDescription", "YearID"])
print("parcels", pull("GCGIS_Export/FeatureServer/2", "parcels.geojson", PF))
print("munis", pull("GCGIS_Boundaries/FeatureServer/1", "munis.geojson", env=None))
print("taxdist", pull("GCGIS_Boundaries/FeatureServer/2", "taxdist.geojson", env=None))
print("hoods", pull("GCGIS_Boundaries/FeatureServer/3", "neighborhoods.geojson"))
print("flood", pull("GCGIS_Nature/FeatureServer/9", "flood.geojson", "FLD_ZONE,ZONE_SUBTY,STATIC_BFE,SFHA_TF,DFIRM_ID,VERSION_ID,SOURCE_CIT"))
print("baseline", pull("GCGIS_Nature/FeatureServer/6", "ocrm-baseline.geojson"))
print("setback", pull("GCGIS_Nature/FeatureServer/7", "ocrm-setback.geojson"))
print("addr", pull("GCGIS_Export/FeatureServer/0", "addresses.geojson",
                   "TMS,Zip_Code,Zip_Comm,Inc_Muni,Add_Type,Status,UNIT", env=ENV))
TOWN = "-79.15,33.40,-79.10,33.47"
print("bld2024", pull("GCGIS_Buildings/FeatureServer/1", "bld2024.geojson", "TMS,status,pct_change,MuniName", env=TOWN, page=1000))
print("bld2017", pull("GCGIS_Buildings/FeatureServer/5", "bld2017.geojson", "*", env=TOWN, page=1000))

print("roads", pull("GCGIS_Export/FeatureServer/1", "roads.geojson",
            "St_Full,St_RouteNo,St_Class,PostComm_L,PostComm_R,SpeedLimit"))
