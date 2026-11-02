#!/usr/bin/env python3
"""City of Myrtle Beach and Horry County GIS records for /submarkets/myrtle-beach/.
Run: RAW=<scratch> python3 -I fetch_gis.py
Writes into RAW (kept out of the repo; parcels and address points carry addresses):
  zoning.json        City of Myrtle Beach zoning districts (terra.cityofmyrtlebeach.com ZONING_DISTRICTS_MB layer 0), WGS84, every field
  citylimits-city.json  City of Myrtle Beach CITY_LIMITS_MB layer 0, WGS84
  city.json          Horry County parcelapp layer 31 Municipalities, NAME = MYRTLE BEACH, WGS84
  parcels.json       county layer 24 residential parcels with a building in the city box: PIN, LandUseCode, TaxDistrict, Acreage, LegalDescr, MarketProp, MarketImprv, SaleDate, OwnerState (no names or street) + centroid
  addr.json          county layer 22 address points in the box: PIN, STREETNAME, SUBDIVISION, POSTAL_CITY, ZIPCODE, point (no house numbers)
  sfha.json          county layer 19 FEMA flood zones in the box (every zone), WGS84"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
CZ = "https://terra.cityofmyrtlebeach.com/server/rest/services/ZONING_DISTRICTS_MB/FeatureServer/0/query"
CL = "https://terra.cityofmyrtlebeach.com/server/rest/services/CITY_LIMITS_MB/FeatureServer/0/query"
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
def page(url, where, fields, geom, env=None, extra=None):
    p = {"where": where, "returnIdsOnly": "true"}; p.update(env or {})
    ids = sorted(q(url, p)["objectIds"] or []); rows = []
    for i in range(0, len(ids), 1000):
        pp = {"objectIds": ",".join(map(str, ids[i:i+1000])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url[-30:], i, len(rows), flush=True)
    return rows
if not have("zoning.json"):
    save("zoning.json", page(CZ, "1=1", "*", True))
if not have("citylimits-city.json"):
    save("citylimits-city.json", page(CL, "1=1", "*", True))
if not have("city.json"):
    save("city.json", q(PA % 31, {"where": "NAME = 'MYRTLE BEACH'", "outFields": "*", "returnGeometry": "true", "outSR": "4326"})["features"])
ext = q(PA % 31, {"where": "NAME = 'MYRTLE BEACH'", "returnExtentOnly": "true", "outSR": "4326"})["extent"]
BOX = "%f,%f,%f,%f" % (ext["xmin"] - 0.005, ext["ymin"] - 0.005, ext["xmax"] + 0.005, ext["ymax"] + 0.005)
print("box", BOX)
env = {"geometry": BOX, "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
if not have("parcels.json"):
    save("parcels.json", [x["attributes"] | {"c": x.get("centroid")} for x in page(PA % 24, "LandUseCode LIKE '1%' AND MarketImprv > 0", "PIN,LandUseCode,TaxDistrict,Acreage,LegalDescr,MarketProp,MarketImprv,MarketLand,AssessedProp,TaxableProp,SaleDate,OwnerState,CONDOLABEL", True, env, extra={"returnCentroid": "true", "returnGeometry": "false"})])
if not have("addr.json"):
    rows = page(PA % 22, "1=1", "PIN,STREETNAME,SUBDIVISION,POSTAL_CITY,ZIPCODE", True, env)
    save("addr.json", [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in rows if x.get("geometry")])
if not have("sfha.json"):
    save("sfha.json", page(PA % 19, "1=1", "FLD_ZONE,SFHA_TF,STATIC_BFE", True, env, extra={"maxAllowableOffset": "0.00002"}))
print("done")
# Parcels with no county address point (mostly condo units): fetch the parcel outline and keep one point inside it.
#   parcel-pts.json  {PIN: [lon, lat]} for those parcels
if not have("parcel-pts.json"):
    from shapely.geometry import Polygon
    ap = set(int(x["PIN"]) for x in json.load(open(os.path.join(RAW, "addr.json"))) if x.get("PIN"))
    pins = [int(x["PIN"]) for x in json.load(open(os.path.join(RAW, "parcels.json"))) if int(x["PIN"]) not in ap]
    out = {}
    for i in range(0, len(pins), 400):
        ch = pins[i:i+400]
        fs = q(PA % 24, {"where": "PIN IN (%s)" % ",".join(map(str, ch)), "outFields": "PIN", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})["features"]
        for f in fs:
            rr = (f.get("geometry") or {}).get("rings")
            if not rr: continue
            pt = Polygon(rr[0]).buffer(0).representative_point()
            out[str(f["attributes"]["PIN"])] = [round(pt.x, 6), round(pt.y, 6)]
        print("pts", i, len(out), flush=True)
    save("parcel-pts.json", out)
print("done")
