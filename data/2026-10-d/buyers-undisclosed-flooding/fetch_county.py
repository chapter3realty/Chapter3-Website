#!/usr/bin/env python3
"""Horry County GIS layers for the flood-history page. Run: python3 -I fetch_county.py
Writes raw/:
  sfz.json          HazardsMap layer 17, Regulated Supplemental Flood Zone (Hurricane Florence flood extent, WCU), WGS84
  flood-sfha.json   parcelapp layer 19, FEMA flood zones with SFHA_TF = 'T' (high-risk), WGS84
  addresses-points.json every address point (layer 22): PIN and point only (no street names kept)
  res-parcels.json  layer 24 residential parcels with a building: PIN, LandUseCode, PARCELTYPE, SaleDate (no owner fields)
  county.json       layer 33 county boundary, WGS84
The server refuses spatial queries with the large SFZ polygons, so the point-in-polygon tests run locally (analyze_gis.py)."""
import sys, json, os, time, urllib.request, urllib.parse
HERE = os.path.dirname(os.path.abspath(__file__)); RAW = os.environ.get('RAW', os.path.join(HERE, 'raw'))  # big raw files live outside the repo; set RAW to a scratch folder
HZ = "https://www.horrycounty.org/gisweb/rest/services/Public/HazardsMap/MapServer/%d/query"
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
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
def save(name, obj): json.dump(obj, open(os.path.join(RAW, name), "w"))
def have(name): return os.path.exists(os.path.join(RAW, name))
if not have("sfz.json"):
    feats = []
    for oid in range(1, 42):
        d = q(HZ % 17, {"objectIds": oid, "outFields": "*", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})
        feats += d["features"]; print("sfz", oid, flush=True)
    save("sfz.json", feats)
if not have("flood-sfha.json"):
    ids = q(PA % 19, {"where": "SFHA_TF='T'", "returnIdsOnly": "true"})["objectIds"]
    feats = []
    for i in range(0, len(ids), 50):
        feats += q(PA % 19, {"objectIds": ",".join(map(str, ids[i:i+50])), "outFields": "FLD_ZONE,SFHA_TF,STATIC_BFE", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})["features"]
        print("sfha", i, len(feats), flush=True)
    save("flood-sfha.json", feats)
def page_all(url, where, fields, geom, name):
    ids = sorted(q(url, {"where": where, "returnIdsOnly": "true"})["objectIds"])
    rows = []
    for i in range(0, len(ids), 2000):
        d = q(url, {"where": "OBJECTID >= %d AND OBJECTID <= %d AND (%s)" % (ids[i], ids[min(i + 1999, len(ids) - 1)], where),
                    "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"})
        for x in d["features"]:
            r = x["attributes"]
            if geom:
                g = x.get("geometry") or {}
                try: r["x"] = round(float(g["x"]), 6); r["y"] = round(float(g["y"]), 6)
                except Exception: r["x"] = r["y"] = None
            rows.append(r)
        if i % 20000 == 0: print(name, i, len(rows), flush=True)
    return rows
if not have("addresses-points.json"):
    # Every address point: PIN and point only. No street names are kept.
    save("addresses-points.json", page_all(PA % 22, "1=1", "PIN", True, "addr"))
if not have("res-parcels.json"):
    # Residential parcels with a building (LandUseCode 1xx, MarketImprv > 0): PIN, use code, last sale date. No owner fields.
    save("res-parcels.json", page_all(PA % 24, "LandUseCode LIKE '1%' AND MarketImprv > 0", "PIN,LandUseCode,PARCELTYPE,SaleDate", False, "parcels"))
if not have("county.json"):
    save("county.json", q(PA % 33, {"where": "1=1", "outFields": "*", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.0002"})["features"])
