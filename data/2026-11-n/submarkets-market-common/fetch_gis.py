#!/usr/bin/env python3
"""City of Myrtle Beach and Horry County GIS records for /submarkets/myrtle-beach/market-common/.
Run: RAW=<scratch> python3 -I fetch_gis.py
Writes into RAW (kept out of the repo; parcels and address points carry addresses):
  zoning.json   City of Myrtle Beach zoning districts (terra.cityofmyrtlebeach.com ZONING_DISTRICTS_MB layer 0), every field, WGS84
  parcels.json  county layer 24 parcels in the box (all land uses): PIN, LandUseCode, TaxDistrict, Acreage, LegalDescr, CONDOLABEL,
                MarketProp, MarketImprv, MarketLand, AssessedProp, TaxableProp, SaleDate, OwnerState (no names or street) + centroid + shape
  addr.json     county layer 22 address points in the box: PIN, STREETNAME, SUBDIVISION, POSTAL_CITY, ZIPCODE, UNIT, point (no house numbers)
  fema.json     county layer 19 FEMA flood zones in the box
  roads.json    county layer 18 road centerlines in the box
  hydro.json    county layer 21 hydrography in the box
  city.json     county layer 31 municipality MYRTLE BEACH"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
CZ = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0/query"
BOX = "-78.975,33.625,-78.895,33.700"   # the former Myrtle Beach Air Force Base and its edges
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", url, e, file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
def have(n): return os.path.exists(os.path.join(RAW, n))
def save(n, o): json.dump(o, open(os.path.join(RAW, n), "w"))
env = {"geometry": BOX, "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
def page(url, where, fields, geom, extra=None, step=500):
    p = {"where": where, "returnIdsOnly": "true"}; p.update(env)
    ids = sorted(q(url, p)["objectIds"] or []); rows = []
    for i in range(0, len(ids), step):
        pp = {"objectIds": ",".join(map(str, ids[i:i+step])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url[-30:], i, len(rows), flush=True)
    return rows
if not have("zoning.json"): save("zoning.json", page(CZ, "1=1", "*", True))
if not have("city.json"):
    save("city.json", q(PA % 31, {"where": "NAME = 'MYRTLE BEACH'", "outFields": "*", "returnGeometry": "true", "outSR": "4326"})["features"])
if not have("parcels.json"):
    save("parcels.json", [x["attributes"] | {"c": x.get("centroid"), "g": x.get("geometry")} for x in page(PA % 24, "1=1",
         "PIN,LandUseCode,TaxDistrict,Acreage,LegalDescr,CONDOLABEL,MarketProp,MarketImprv,MarketLand,AssessedProp,TaxableProp,SaleDate,OwnerState,MarketArea,MarketSubArea", True,
         extra={"returnCentroid": "true", "maxAllowableOffset": "0.00001"})])
if not have("addr.json"):
    rows = page(PA % 22, "1=1", "PIN,STREETNAME,SUBDIVISION,POSTAL_CITY,ZIPCODE,UNIT", True)
    save("addr.json", [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in rows if x.get("geometry")])
if not have("fema.json"): save("fema.json", page(PA % 19, "1=1", "FLD_ZONE,SFHA_TF,STATIC_BFE,SOURCE_CIT", True, extra={"maxAllowableOffset": "0.00001"}))
if not have("roads.json"): save("roads.json", page(PA % 18, "1=1", "*", True))
if not have("hydro.json"): save("hydro.json", page(PA % 21, "1=1", "OBJECTID,NAME", True))
