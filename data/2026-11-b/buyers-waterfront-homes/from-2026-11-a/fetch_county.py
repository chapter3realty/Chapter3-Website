#!/usr/bin/env python3
"""Horry County GIS records for /buyers/waterfront-homes/. Run: RAW=<scratch> python3 -I fetch_county.py
Writes into RAW (kept out of the repo; parcels carry PINs and legal descriptions):
  hydro.json        parcelapp layer 21 Hydrography, every polygon in the county (NAME, outline), WGS84
  water-parcels.json  parcelapp layer 24 parcels whose outline comes within 15 m of a named tidal or river water polygon
                    (Intracoastal Waterway, Waccamaw River, Little River, Dunn Sound, Sheephead and House Creeks):
                    PIN, LandUseCode, Acreage, LegalDescr, MarketImprv, MarketLand, MarketProp; outline; and which polygon
  sale-shapes.json  layer 24 outlines (PIN only) for every kept house sale (2026-10-d deeds) within 600 m of those polygons
  roads-icw.json    Public/Streets layer 1 road lines that cross the Intracoastal Waterway or Waccamaw River polygons (name, class)
  sfha-icw.json     parcelapp layer 19 FEMA zones (FLD_ZONE) within 15 m of the waterway polygons, for zone tests"""
import sys, json, os, time, urllib.request, urllib.parse
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
PA = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/%d/query"
ST = "https://www.horrycounty.org/gisweb/rest/services/Public/Streets/MapServer/1/query"
SALES = os.environ.get("SALES", "../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json")
def q(url, params):
    data = urllib.parse.urlencode(dict(params, f="json")).encode()
    for i in range(6):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, data=data, headers={"User-Agent": "Mozilla/5.0"}), timeout=300).read())
            if "error" in d: raise Exception(d["error"])
            return d
        except Exception as e:
            print("retry", url, str(e)[:200], file=sys.stderr); time.sleep(5)
    raise SystemExit("failed " + url)
def have(n): return os.path.exists(os.path.join(RAW, n))
def save(n, o): json.dump(o, open(os.path.join(RAW, n), "w"))
def load(n): return json.load(open(os.path.join(RAW, n)))
TIDAL = ["Intracoastal Waterway", "Waccamaw River", "Little River", "DUNN SOUND CREEK", "SHEEPHEAD CREEK", "HOUSE CREEK"]
if not have("hydro.json"):
    save("hydro.json", q(PA % 21, {"where": "1=1", "outFields": "OBJECTID,NAME", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00002"})["features"])
hydro = load("hydro.json")
PF = "PIN,LandUseCode,Acreage,LegalDescr,MarketImprv,MarketLand,MarketProp"
def by_geom(url, geom, fields, dist=None, extra=None, step=500):
    p = {"where": "1=1", "geometry": json.dumps(geom), "geometryType": "esriGeometryPolygon", "inSR": "4326", "spatialRel": "esriSpatialRelIntersects", "returnIdsOnly": "true"}
    if dist: p.update(distance=str(dist), units="esriSRUnit_Meter")
    ids = sorted(q(url, p).get("objectIds") or []); rows = []
    for i in range(0, len(ids), step):
        pp = {"objectIds": ",".join(map(str, ids[i:i+step])), "outFields": fields, "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00001"}
        if extra: pp.update(extra)
        rows += q(url, pp)["features"]; print(url[-24:], i, len(rows), flush=True)
    return rows
if not have("water-parcels.json"):
    out = {}
    for h in hydro:
        name = h["attributes"]["NAME"]
        if name not in TIDAL: continue
        g = {"rings": h["geometry"]["rings"], "spatialReference": {"wkid": 4326}}
        for r in by_geom(PA % 24, g, PF, dist=15):
            a = r["attributes"]; pin = a["PIN"]
            if pin in out: out[pin]["water"] = sorted(set(out[pin]["water"] + [name])); continue
            out[pin] = dict(a, water=[name], g=r.get("geometry"))
    save("water-parcels.json", list(out.values()))
if not have("roads-icw.json"):
    rows = []
    for h in hydro:
        if h["attributes"]["NAME"] not in ("Intracoastal Waterway", "Waccamaw River"): continue
        g = {"rings": h["geometry"]["rings"], "spatialReference": {"wkid": 4326}}
        for r in by_geom(ST, g, "*"): rows.append(dict(r["attributes"], water=h["attributes"]["NAME"], g=r.get("geometry")))
    save("roads-icw.json", rows)
if not have("sale-shapes.json"):
    from shapely.geometry import Point, shape
    from shapely.ops import unary_union
    polys = []
    for h in hydro:
        if h["attributes"]["NAME"] in TIDAL:
            from shapely.geometry import Polygon
            for ring in h["geometry"]["rings"]:
                try: polys.append(Polygon(ring).buffer(0))
                except Exception: pass
    W = unary_union(polys).buffer(0.006)  # about 600 m
    sales = json.load(open(SALES))["sales"]
    pins = sorted({s["pin"] for s in sales if not s.get("condo") and s.get("lat") and W.contains(Point(s["lon"], s["lat"]))})
    print("candidate sale pins", len(pins))
    rows = []
    for i in range(0, len(pins), 200):
        w = "PIN IN (%s)" % ",".join(str(int(p)) for p in pins[i:i+200])
        rows += [{"PIN": r["attributes"]["PIN"], "LandUseCode": r["attributes"]["LandUseCode"], "g": r.get("geometry")} for r in q(PA % 24, {"where": w, "outFields": "PIN,LandUseCode", "returnGeometry": "true", "outSR": "4326", "maxAllowableOffset": "0.00001"})["features"]]
        print("sale shapes", len(rows), flush=True)
    save("sale-shapes.json", rows)
print("done")
