#!/usr/bin/env python3
"""Horry County GIS and Census TIGER records for /submarkets/little-river/. Run: RAW=<scratch> python3 -I fetch_county.py
Writes into RAW (kept out of the repo; parcels and address points carry addresses):
  community.json   Public/Communities layer 0, Name = LITTLE RIVER (the county's planning community), WGS84
  cdp.json         Census TIGERweb Places layer 5, Little River CDP (GEOID 4542010), WGS84
  zip.json         parcelapp layer 20 Zipcodes, ZIPCODE = 29566 (Little River), WGS84
  munis.json       parcelapp layer 31 Municipalities in the box (North Myrtle Beach's limits), WGS84
  parcels.json     layer 24 parcels in the box, land use 1xx with a building, plus every land use 306 (boat slip): PIN, LandUseCode, TaxDistrict, Acreage, LegalDescr, MarketProp, MarketImprv, MarketLand, SaleDate, DeedBook, DeedPage (no owner fields; outlines in parcel-shapes.json)
  slips.json       layer 24, every land use 306 parcel in the county (same fields, outline)
  addr.json        layer 22 address points in the box: PIN, STREETNAME, SUBDIVISION, POSTAL_CITY, ZIPCODE, point (no house numbers)
  sfha.json        parcelapp layer 19 FEMA high-risk zone polygons (SFHA_TF = 'T') in the box, WGS84
  hydro.json       parcelapp layer 21 Hydrography polygons in the box (NAME), WGS84
  launches.json    Public/ParksRecreation layer 1 Boat Launch, every county landing, WGS84
  devs.json        Public/Layers layer 0 Major Residential Developments in the box (approved, platted, built, remaining units), WGS84 centroid
  permits.json     Public/PermitsActive layer 0 active permits in the box (type, work class, description, dates, postal code, value; no owner)
  evac.json        Public/Evacuation layer 2 evacuation zones in the box, WGS84"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
G = "https://www.horrycounty.org/gisweb/rest/services/Public/%s/MapServer/%d/query"
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
TW = "https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Places_CouSub_ConCity_SubMCD/MapServer/5/query"
BOX = "-78.84,33.79,-78.53,34.00"   # the county's Little River community (extent -78.757,33.831,-78.541,33.944) plus the 29566 ZIP's built-up edge
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
def page(url, where, fields, geom, spatial=True, extra=None, step=1000):
    p = {"where": where, "returnIdsOnly": "true"}; p.update(env if spatial else {})
    ids = sorted(q(url, p).get("objectIds") or []); rows = []
    for i in range(0, len(ids), step):
        pp = {"objectIds": ",".join(map(str, ids[i:i+step])), "outFields": fields, "returnGeometry": "true" if geom else "false", "outSR": "4326"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url[-30:], i, len(rows), flush=True)
    return rows
PF = "PIN,LandUseCode,TaxDistrict,Acreage,LegalDescr,MarketProp,MarketImprv,MarketLand,SaleDate,DeedBook,DeedPage"
if not have("community.json"):
    save("community.json", q(G % ("Communities", 0), {"where": "Name='LITTLE RIVER'", "outFields": "*", "returnGeometry": "true", "outSR": "4326"})["features"])
if not have("cdp.json"):
    save("cdp.json", q(TW, {"where": "GEOID='4542010'", "outFields": "NAME,GEOID,AREALAND,AREAWATER", "returnGeometry": "true", "outSR": "4326"})["features"])
if not have("zip.json"):
    save("zip.json", q(PA % 20, {"where": "ZIPCODE='29566'", "outFields": "*", "returnGeometry": "true", "outSR": "4326"})["features"])
if not have("munis.json"):
    save("munis.json", q(PA % 31, dict(env, where="1=1", outFields="OBJECTID,NAME", returnGeometry="true", outSR="4326"))["features"])
if not have("parcels.json"):
    save("parcels.json", [x["attributes"] | {"c": x.get("centroid")} for x in page(PA % 24, "(LandUseCode LIKE '1%' AND MarketImprv > 0) OR LandUseCode = '306'", PF, False, extra={"returnCentroid": "true", "returnGeometry": "true", "maxAllowableOffset": "0.0005"})])
if not have("parcel-shapes.json"):  # parcel outlines (no attributes but PIN) for the waterfront test
    save("parcel-shapes.json", [{"PIN": x["attributes"]["PIN"], "g": x.get("geometry")} for x in page(PA % 24, "(LandUseCode LIKE '1%' AND MarketImprv > 0) OR LandUseCode = '306'", "PIN", True, extra={"maxAllowableOffset": "0.00001"}, step=500)])
if not have("slips.json"):
    save("slips.json", [x["attributes"] | {"g": x.get("geometry")} for x in page(PA % 24, "LandUseCode = '306'", PF, False, spatial=False, extra={"returnCentroid": "true", "returnGeometry": "true", "maxAllowableOffset": "0.001"})])
if not have("addr.json"):
    rows = page(PA % 22, "1=1", "PIN,STREETNAME,SUBDIVISION,POSTAL_CITY,ZIPCODE", True)
    save("addr.json", [dict(x["attributes"], x=round(x["geometry"]["x"], 6), y=round(x["geometry"]["y"], 6)) for x in rows if x.get("geometry")])
if not have("sfha.json"):
    save("sfha.json", page(PA % 19, "SFHA_TF='T'", "FLD_ZONE,SFHA_TF,STATIC_BFE", True, extra={"maxAllowableOffset": "0.00002"}))
if not have("hydro.json"):
    save("hydro.json", page(PA % 21, "1=1", "NAME", True, extra={"maxAllowableOffset": "0.00002"}))
if not have("launches.json"):
    save("launches.json", q(G % ("ParksRecreation", 1), {"where": "1=1", "outFields": "*", "returnGeometry": "true", "outSR": "4326"})["features"])
if not have("devs.json"):
    save("devs.json", [x["attributes"] | {"g": x.get("geometry")} for x in page(G % ("Layers", 0), "1=1", "NAME,REZONING_C,STATUS,COMMUNITY,ACRES,TYPE,MF_APPROVE,SF_APPROVE,SF_PLATTED,MF_CONSTRU,SF_CONSTRU,MF_REMAINI,SF_REMAINI,TOTAL_REMA,UPDATED,NOTES,SUB_NAME", False, extra={"returnCentroid": "true", "returnGeometry": "true", "maxAllowableOffset": "0.001"})])
if not have("permits.json"):
    save("permits.json", [x["attributes"] | {"g": x.get("geometry")} for x in page(G % ("PermitsActive", 0), "1=1", "PERMITNUMBER,APPLYDATE,ISSUEDATE,EXPIREDATE,FINALIZEDATE,PermitType,Workclass,DESCRIPTION,StreetName,CITY,POSTALCODE,VALUE", False, extra={"returnCentroid": "true", "returnGeometry": "true", "maxAllowableOffset": "0.001"})])
if not have("evac.json"):
    save("evac.json", page(G % ("Evacuation", 2), "1=1", "*", True, extra={"maxAllowableOffset": "0.0001"}))
print("done")
