#!/usr/bin/env python3
"""Horry County GIS records for /submarkets/conway/. Run: RAW=<scratch> python3 -I fetch_county.py
Writes into RAW (kept out of the repo; parcels and address points carry addresses):
  city.json            parcelapp layer 31 Municipalities, NAME = CONWAY (city limits), WGS84
  munis.json           every municipality name in layer 31 (to confirm the name)
  parcels.json         layer 24 residential parcels with a building in the Conway box: PIN, LandUseCode, TaxDistrict, Acreage, LegalDescr, MarketProp, SaleDate (no owner fields)
  addr.json            layer 22 address points in the box: PIN, STREETNAME, SUBDIVISION, POSTAL_CITY, ZIPCODE, point (no house numbers)
  sfz.json             HazardsMap layer 17, Regulated Supplemental Flood Zone (county's Florence flood extent), WGS84
  sfha.json            parcelapp layer 19 FEMA high-risk zone polygons (SFHA_TF = 'T') in the box, WGS84
  closures-florence.json, closures-matthew.json  HazardsMap layers 0 and 1, road closures in the box (FULLNAME, dates, reason, city)
  conway-postal.json   count of address points countywide by POSTAL_CITY = CONWAY, by ZIPCODE (statistics query)"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
HZ = "https://www.horrycounty.org/gisweb/rest/services/Public/HazardsMap/MapServer/%d/query"
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
BOX = "-79.26,33.61,-78.60,34.07"   # covers every address point whose mailing city is Conway (returnExtentOnly, 2026-11-01)
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
def page(url, where, fields, geom, spatial=True, extra=None):
    p = {"where": where, "returnIdsOnly": "true"}; p.update(env if spatial else {})
    ids = sorted(q(url, p)["objectIds"] or []); rows = []
    for i in range(0, len(ids), 1000):
        pp = {"objectIds": ",".join(map(str, ids[i:i+1000])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url[-12:], i, len(rows), flush=True)
    return rows
if not have("munis.json"):
    save("munis.json", q(PA % 31, {"where": "1=1", "outFields": "OBJECTID,NAME", "returnGeometry": "false"})["features"])
if not have("city.json"):
    save("city.json", q(PA % 31, {"where": "UPPER(NAME) LIKE '%CONWAY%'", "outFields": "*", "returnGeometry": "true", "outSR": "4326"})["features"])
if not have("parcels.json"):
    save("parcels.json", [x["attributes"] | {"c": x.get("geometry")} for x in page(PA % 24, "LandUseCode LIKE '1%' AND MarketImprv > 0", "PIN,LandUseCode,TaxDistrict,Acreage,LegalDescr,MarketProp,MarketImprv,SaleDate", True, extra={"returnCentroid": "true", "maxAllowableOffset": "0.0005"})])
if not have("addr.json"):
    rows = page(PA % 22, "1=1", "PIN,STREETNAME,SUBDIVISION,POSTAL_CITY,ZIPCODE", True)
    save("addr.json", [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in rows if x.get("geometry")])
if not have("sfz.json"):
    feats = []
    for oid in range(1, 42):
        feats += q(HZ % 17, {"objectIds": oid, "outFields": "*", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})["features"]
    save("sfz.json", feats)
if not have("sfha.json"):
    save("sfha.json", page(PA % 19, "SFHA_TF='T'", "FLD_ZONE,SFHA_TF,STATIC_BFE", True, extra={"maxAllowableOffset": "0.00002"}))
for lyr, n in [(0, "closures-florence.json"), (1, "closures-matthew.json")]:
    if not have(n):
        save(n, page(HZ % lyr, "1=1", "FULLNAME,ClosedDate,OpenedDate,Status,CLOSEREASON,LeftCity,RightCity,ClosedAgency", True))
if not have("conway-postal.json"):
    st = [{"statisticType": "count", "onStatisticField": "OBJECTID", "outStatisticFieldName": "n"}]
    save("conway-postal.json", q(PA % 22, {"where": "UPPER(POSTAL_CITY) = 'CONWAY'", "groupByFieldsForStatistics": "ZIPCODE", "outStatistics": json.dumps(st)})["features"])
