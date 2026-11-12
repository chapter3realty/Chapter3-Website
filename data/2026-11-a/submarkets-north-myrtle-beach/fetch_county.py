#!/usr/bin/env python3
"""Horry County GIS records for /submarkets/north-myrtle-beach/. Run: RAW=<scratch> python3 -I fetch_county.py
Writes into RAW (kept out of the repo; parcels and address points carry addresses or PINs):
  munis.json     parcelapp layer 31 Municipalities, NAME = NORTH MYRTLE BEACH (city limits), WGS84
  parcels.json   layer 24 residential parcels with a building (LandUseCode 1xx, MarketImprv > 0) in the box:
                 PIN, LandUseCode, TaxDistrict, Acreage, LegalDescr, CONDOLABEL, MarketProp, MarketImprv, MarketLand,
                 AssessedProp, TaxableProp, OwnerState, SaleDate, MarketArea, MarketSubArea, centroid. No owner name or street.
  shapes.json    layer 24 outlines (PIN only) of the same parcels that are not condo units, for the waterfront test
  addr.json      layer 22 address points in the box: PIN, STREETNAME, SUBDIVISION, POSTAL_CITY, ZIPCODE, point (no house numbers)
  sfha.json      layer 19 FEMA flood zone polygons in the box (FLD_ZONE, SFHA_TF, STATIC_BFE), WGS84
  hydro.json     layer 21 hydrography polygons in the box (NAME), WGS84
  roads.json     layer 18 road centerlines in the box for US 17, Sea Mountain Hwy, Ocean Blvd, Main St and Little River Neck Rd (FULLNAME, SPEEDLIMIT, CFCC), WGS84"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
BOX = "-78.812,33.772,-78.592,33.872"   # North Myrtle Beach city limits (extent -78.806,33.779,-78.601,33.865) plus a margin
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(8):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", url[-12:], e, file=sys.stderr); time.sleep(5 + 3 * i)
    raise SystemExit("failed " + url)
def have(n): return os.path.exists(os.path.join(RAW, n))
def save(n, o): json.dump(o, open(os.path.join(RAW, n), "w"))
env = {"geometry": BOX, "geometryType": "esriGeometryEnvelope", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects"}
def page(url, where, fields, geom, extra=None, step=1000):
    p = {"where": where, "returnIdsOnly": "true"}; p.update(env)
    ids = sorted(q(url, p).get("objectIds") or []); rows = []
    for i in range(0, len(ids), step):
        pp = {"objectIds": ",".join(map(str, ids[i:i+step])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url[-10:], i, len(rows), flush=True)
    return rows
W = "LandUseCode LIKE '1%' AND MarketImprv > 0"
if not have("munis.json"):
    save("munis.json", q(PA % 31, {"where": "NAME='NORTH MYRTLE BEACH'", "outFields": "OBJECTID,NAME", "returnGeometry": "true", "outSR": "4326"})["features"])
if not have("parcels.json"):
    def centre(g):   # the service returns no centroid; use the mean of the outline's vertices (parcels are small)
        pts = [p for r in (g or {}).get("rings", []) for p in r[:-1]]
        return {"x": round(sum(p[0] for p in pts) / len(pts), 6), "y": round(sum(p[1] for p in pts) / len(pts), 6)} if pts else None
    save("parcels.json", [x["attributes"] | {"c": centre(x.get("geometry"))} for x in page(PA % 24, W,
         "PIN,LandUseCode,TaxDistrict,Acreage,LegalDescr,CONDOLABEL,MarketProp,MarketImprv,MarketLand,AssessedProp,TaxableProp,OwnerState,SaleDate,MarketArea,MarketSubArea", True,
         extra={"maxAllowableOffset": "0.00002"})])
if not have("shapes.json"):
    save("shapes.json", [{"PIN": x["attributes"]["PIN"], "g": x.get("geometry")} for x in page(PA % 24, W + " AND (CONDOLABEL IS NULL OR CONDOLABEL = '')", "PIN", True, extra={"maxAllowableOffset": "0.00001"}, step=500)])
if not have("addr.json"):
    rows = page(PA % 22, "1=1", "PIN,STREETNAME,SUBDIVISION,POSTAL_CITY,ZIPCODE", True)
    save("addr.json", [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in rows if x.get("geometry")])
if not have("sfha.json"):
    save("sfha.json", page(PA % 19, "1=1", "FLD_ZONE,SFHA_TF,STATIC_BFE", True, extra={"maxAllowableOffset": "0.00002"}, step=200))
if not have("hydro.json"):
    save("hydro.json", page(PA % 21, "1=1", "NAME", True, extra={"maxAllowableOffset": "0.00002"}, step=200))
if not have("roads.json"):
    names = "'N HWY 17','S HWY 17','HWY 17','N KINGS HWY','S KINGS HWY','SEA MOUNTAIN HWY','N OCEAN BLVD','S OCEAN BLVD','MAIN ST','LITTLE RIVER NECK RD','HWY 31','CAROLINA BAYS PKWY'"
    save("roads.json", q(PA % 18, dict(env, where="FULLNAME IN (%s)" % names, outFields="FULLNAME,SPEEDLIMIT,CFCC", returnGeometry="true", outSR="4326")))
print("done")
