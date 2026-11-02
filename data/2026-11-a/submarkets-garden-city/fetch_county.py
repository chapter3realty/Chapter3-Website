#!/usr/bin/env python3
"""Horry County GIS records for /submarkets/garden-city/. Run: RAW=<scratch> python3 -I fetch_county.py
Writes into RAW (kept out of the repo; parcels and address points carry addresses):
  parcels.json  layer 24 residential parcels with a building (LandUseCode 1xx, MarketImprv > 0) in the box:
                PIN, LandUseCode, TaxDistrict, Acreage, LegalDescr, CONDOLABEL, MarketProp, MarketImprv, AssessedProp, TaxableProp,
                OwnerState, SaleDate, centroid. No owner name, street or city is requested.
  addr.json     layer 22 address points in the box: PIN, STREETNAME, SUBDIVISION, POSTAL_CITY, ZIPCODE, point (no house numbers)
  fema.json     layer 19 FEMA flood zone polygons in the box (FLD_ZONE, SFHA_TF, STATIC_BFE), WGS84
  roads.json    layer 18 road centerlines in the box (all fields), WGS84
  hydro.json    layer 21 hydrography polygons in the box, WGS84"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
BOX = "-79.045,33.545,-78.965,33.630"   # Garden City CDP (2020) plus the beach strip to the county line
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed")
def have(n): return os.path.exists(os.path.join(RAW, n))
def save(n, o): json.dump(o, open(os.path.join(RAW, n), "w"))
env = {"geometry": BOX, "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
def page(url, where, fields, geom, extra=None):
    p = {"where": where, "returnIdsOnly": "true"}; p.update(env)
    ids = sorted(q(url, p)["objectIds"] or []); rows = []
    for i in range(0, len(ids), 500):
        pp = {"objectIds": ",".join(map(str, ids[i:i+500])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url[-10:], i, len(rows), flush=True)
    return rows
if not have("parcels.json"):
    save("parcels.json", [x["attributes"] | {"c": x.get("centroid"), "g": x.get("geometry")} for x in page(PA % 24, "LandUseCode LIKE '1%' AND MarketImprv > 0",
         "PIN,LandUseCode,TaxDistrict,Acreage,LegalDescr,CONDOLABEL,MarketProp,MarketImprv,MarketLand,AssessedProp,TaxableProp,OwnerState,SaleDate,MarketArea,MarketSubArea", True,
         extra={"returnCentroid": "true", "maxAllowableOffset": "0.00001"})])
if not have("addr.json"):
    rows = page(PA % 22, "1=1", "PIN,STREETNAME,SUBDIVISION,POSTAL_CITY,ZIPCODE,UNIT", True)
    save("addr.json", [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in rows if x.get("geometry")])
if not have("fema.json"):
    save("fema.json", page(PA % 19, "1=1", "FLD_ZONE,SFHA_TF,STATIC_BFE,SOURCE_CIT", True, extra={"maxAllowableOffset": "0.00001"}))
if not have("roads.json"):
    save("roads.json", page(PA % 18, "1=1", "*", True))
if not have("hydro.json"): save("hydro.json", page(PA % 21, "1=1", "OBJECTID,NAME", True))
