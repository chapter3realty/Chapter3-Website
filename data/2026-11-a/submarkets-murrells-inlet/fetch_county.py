#!/usr/bin/env python3
"""Horry and Georgetown County GIS records for /submarkets/murrells-inlet/ (batch 2026-11-a).
Run: RAW=<scratch> python3 -I fetch_county.py [step ...]
Writes into RAW (kept out of the repo: parcels and address points carry addresses and owner mailing fields):
 Horry (https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer):
  h-addr.json     layer 22 address points with POSTAL_CITY Murrells Inlet (any case): PIN, STREETNAME, SUBDIVISION, POSTAL_CITY, ZIPCODE, point
  h-parcels.json  layer 24 residential parcels with a building (LandUseCode 1xx, MarketImprv > 0) in BOX_H: no owner name or street
  h-fema.json     layer 19 FEMA zones in BOX_H;  h-hydro.json layer 21;  h-roads.json layer 18 (names, class)
 Georgetown (https://gis1.georgetowncountysc.org/portal/rest/services):
  g-parcels.geojson  GCGIS_Export 2 in BOX_G (land use, sale date and price, legal description, billing city and state)
  g-addr.geojson     GCGIS_Export 0 in BOX_G;  g-flood.geojson GCGIS_Nature 9;  g-wetlands.geojson GCGIS_Nature 0
  g-taxdist.geojson  GCGIS_Boundaries 2; g-hoods.geojson GCGIS_Boundaries 3; g-roads.geojson GCGIS_Export 1
  g-bld2024.geojson  GCGIS_Buildings 1 in BOX_G; g-school-{elem,middle,high}.geojson GCGIS_Education 4,6,5; g-landings.geojson GCGIS_PubSafety 0"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
H = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
G = "https://gis1.georgetowncountysc.org/portal/rest/services/%s/FeatureServer/%d/query"
BOX_H = "-79.105,33.525,-78.950,33.700"   # Horry addresses with a Murrells Inlet postal city (all but a few strays)
BOX_G = "-79.140,33.480,-78.990,33.580"   # Georgetown: Huntington Beach State Park and Brookgreen to the county line
STEPS = sys.argv[1:] or ["haddr", "hparcels", "hfema", "hhydro", "hroads", "g"]
def q(url, params, post=True):
    data = urllib.parse.urlencode(dict(params, f=params.get("f", "json"))).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
def have(n): return os.path.exists(os.path.join(RAW, n))
def save(n, o): json.dump(o, open(os.path.join(RAW, n), "w"))
def env(box): return {"geometry": box, "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
def page_ids(url, where, fields, geom, box=None, extra=None):
    p = {"where": where, "returnIdsOnly": "true"}
    if box: p.update(env(box))
    ids = sorted(q(url, p)["objectIds"] or []); rows = []
    for i in range(0, len(ids), 500):
        pp = {"objectIds": ",".join(map(str, ids[i:i+500])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url.split('/')[-2], i, len(rows), "of", len(ids), flush=True)
    return rows
if "haddr" in STEPS and not have("h-addr.json"):
    rows = page_ids(H % 22, "UPPER(POSTAL_CITY)='MURRELLS INLET'", "PIN,STREETNAME,SUBDIVISION,POSTAL_CITY,ZIPCODE,UNIT", True)
    save("h-addr.json", [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in rows if x.get("geometry")])
if "hparcels" in STEPS and not have("h-parcels.json"):
    save("h-parcels.json", [x["attributes"] | {"c": x.get("centroid"), "g": x.get("geometry")} for x in page_ids(H % 24, "LandUseCode LIKE '1%' AND MarketImprv > 0",
         "PIN,LandUseCode,TaxDistrict,Acreage,LegalDescr,CONDOLABEL,MarketProp,MarketImprv,MarketLand,AssessedProp,TaxableProp,OwnerState,SaleDate,MarketArea,MarketSubArea", True, BOX_H,
         extra={"returnCentroid": "true", "maxAllowableOffset": "0.00001"})])
if "hfema" in STEPS and not have("h-fema.json"):
    save("h-fema.json", page_ids(H % 19, "1=1", "FLD_ZONE,SFHA_TF,STATIC_BFE,SOURCE_CIT", True, BOX_H, extra={"maxAllowableOffset": "0.00001"}))
if "hhydro" in STEPS and not have("h-hydro.json"):
    save("h-hydro.json", page_ids(H % 21, "1=1", "OBJECTID,NAME", True, BOX_H))
if "hroads" in STEPS and not have("h-roads.json"):
    save("h-roads.json", page_ids(H % 18, "1=1", "*", True, BOX_H))
def gpull(svc, layer, out, fields="*", box=BOX_G, pagesize=2000):
    if have(out): return
    feats, off = [], 0
    while True:
        p = {"where": "1=1", "outFields": fields, "returnGeometry": "true", "outSR": 4326, "f": "geojson",
             "resultOffset": off, "resultRecordCount": pagesize, "geometryPrecision": 6}
        if box: p.update(env(box))
        d = q(G % (svc, layer), p)
        fs = d.get("features", []); feats += fs; print(out, off, len(fs), flush=True)
        if len(fs) < pagesize and not d.get("exceededTransferLimit") and not d.get("properties", {}).get("exceededTransferLimit"): break
        if not fs: break
        off += len(fs)
    save(out, {"type": "FeatureCollection", "features": feats})
if "g" in STEPS:
    gpull("GCGIS_Export", 2, "g-parcels.geojson", ",".join(["TMS", "Zone", "StreetName", "City", "State", "ZipCode", "TotalLandArea", "SaleDate", "SalePrice",
                                                           "LandUseCode", "LegalDescription", "YearID"]))
    gpull("GCGIS_Export", 0, "g-addr.geojson", "TMS,Zip_Code,Zip_Comm,Inc_Muni,Add_Type,Status,UNIT,St_Full")
    gpull("GCGIS_Nature", 9, "g-flood.geojson", "FLD_ZONE,ZONE_SUBTY,STATIC_BFE,SFHA_TF")
    gpull("GCGIS_Nature", 0, "g-wetlands.geojson")
    gpull("GCGIS_Boundaries", 2, "g-taxdist.geojson", box=None)
    gpull("GCGIS_Boundaries", 3, "g-hoods.geojson")
    gpull("GCGIS_Export", 1, "g-roads.geojson", "St_Full,St_RouteNo,St_Class,PostComm_L,PostComm_R,SpeedLimit")
    gpull("GCGIS_Buildings", 1, "g-bld2024.geojson", "TMS,status", pagesize=1000)
    gpull("GCGIS_Education", 4, "g-school-elem.geojson", box=None)
    gpull("GCGIS_Education", 6, "g-school-middle.geojson", box=None)
    gpull("GCGIS_Education", 5, "g-school-high.geojson", box=None)
    gpull("GCGIS_PubSafety", 0, "g-landings.geojson", box=None)
