#!/usr/bin/env python3
"""Build the three zoom levels the homepage towns map flies down through before it lands on the Grand Strand
basemap: the United States, the Southeast and the Carolina coast. Same palette as build_basemap.py (Google Maps'
dark road map), Web Mercator, no text.

    FFMPEG=/path/to/ffmpeg python3 design/homepage-v2/map/build_zoom.py [--work DIR]

Sources: U.S. Census Bureau cartographic boundary states 2024 (1:5,000,000 and 1:500,000) and 2020 urban areas,
TIGER/Line 2024 counties, area water and primary and secondary roads, USGS PAD-US 4.1 parks and refuges, and
Natural Earth (public domain) for the other countries, the Great Lakes, lakes and rivers. The Census data is free
to use on the condition that the Census Bureau is credited, which the map's "Map data" line does.

Writes media/map/zoom-{us,se,coast}-{1600,3200}.{avif,webp} and data/strand-zoom.json (each level's extent).
The page (src/fx.html) places each level with the same camera as the basemap: a level is Mercator, the basemap is
an equirectangular plane, and the two agree at the camera target's latitude to within a pixel over the plane.
"""
import argparse, collections, json, math, os, subprocess, sys, time, urllib.parse, zipfile

import numpy as np
import shapely
from shapely.geometry import MultiPolygon, Polygon, box, shape
from shapely.ops import unary_union

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.dont_write_bytecode = True        # no __pycache__ in the repo
import build_basemap as bb            # noqa: E402  palette, helpers, render and encode

CENSUS = "https://www2.census.gov/geo/tiger/"
NE = "https://naciscdn.org/naturalearth/"
ZOOM_JSON = os.path.join(bb.HP, "data", "strand-zoom.json")
C = bb.C
URBAN = "#222f45"                     # built-up areas, between land and the basemap's airport tone
BORDER = "#5a616b"                    # country borders
WIDTHS = [(3200, 200_000), (1600, 90_000)]    # image width, AVIF byte ceiling
CEILING = {"coast": {3200: 180_000, 1600: 85_000}}   # the coast has the most roads, and is on screen for the shortest time
# each level is on screen for about a second while the camera moves, so its AVIF may sit further below the 4:2:0 cap
# than the basemap's (build_basemap.py AVIF_DB 1.5): about half the bytes, and no difference in motion
bb.AVIF_DB = 3.0

# name, extent (lon0, lon1, lat0, lat1). Each is about three to four times the next one's scale.
LEVELS = [
    ("us", (-135.0, -50.0, 10.0, 58.0)),     # wide of the contiguous states, so the pan east never reaches an edge
    ("se", (-88.5, -69.5, 27.5, 39.5)),
    ("coast", (-81.9, -75.9, 31.6, 35.8)),
]
W0 = 3200                             # the drawing's own width in px; line widths below are in these px

def ym(lat):
    """Mercator northing in degrees of longitude."""
    return np.degrees(np.log(np.tan(np.pi / 4 + np.radians(lat) / 2)))

class Level:
    def __init__(self, key, ext):
        self.key, (self.lon0, self.lon1, self.lat0, self.lat1) = key, ext
        self.ppd = W0 / (self.lon1 - self.lon0)
        self.top = float(ym(self.lat1))
        self.h = int(round((self.top - float(ym(self.lat0))) * self.ppd))
        self.deg = (self.lon0 - 0.3, self.lat0 - 0.3, self.lon1 + 0.3, self.lat1 + 0.3)
        self.clip = box(-8, -8, W0 + 8, self.h + 8)

    def to_px(self, a):
        out = np.empty_like(a)
        out[:, 0] = (a[:, 0] - self.lon0) * self.ppd
        out[:, 1] = (self.top - ym(np.clip(a[:, 1], -85, 85))) * self.ppd
        return out

    def proj(self, g):
        return bb.valid(shapely.transform(g, self.to_px)).intersection(self.clip)

def log(*a): print(*a, flush=True)

def fetch(url):
    dest = os.path.join(bb.WORK, os.path.basename(url))
    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
        log("  download", url)
        subprocess.run(["curl", "-fsSL", "--retry", "3", "-o", dest + ".part", url], check=True)
        os.replace(dest + ".part", dest)
    return dest

def fetch_tiger(rel):
    """A TIGER/Line zip, checked: the Census server can answer with an HTML page ("Request Rejected") and a 200,
    so a download that is not a zip is dropped and tried again, with a query string."""
    dest = os.path.join(bb.WORK, os.path.basename(rel))
    for attempt in range(8):
        if os.path.exists(dest):
            try:
                zipfile.ZipFile(dest).close()
                return dest
            except zipfile.BadZipFile:
                os.remove(dest)
                log("  not a zip, the server refused it; trying again in", 5 * attempt, "s:", rel)
                time.sleep(5 * attempt)
        # after a refusal, the same file with a query string: the refusal sticks to the exact URL
        url = bb.TIGER + rel + (f"?try={attempt}" if attempt else "")
        subprocess.run(["curl", "-fsSL", "--retry", "3", "-o", dest + ".part", url], check=True)
        os.replace(dest + ".part", dest)
        time.sleep(0.4)
    raise SystemExit("the Census server kept refusing " + rel)

def shapes(zpath, bbox=None, where=None):
    """(record dict, shapely geometry) for every shape in a zipped shapefile, optionally inside bbox."""
    for sr in bb.reader(zpath).iterShapeRecords(bbox=bbox):
        d = sr.record.as_dict()
        if where and not where(d): continue
        if not sr.shape.points: continue
        yield d, bb.valid(shape(sr.shape.__geo_interface__))

def fetch_padus(lv, min_acres, offset_deg):
    """PAD-US 4.1 polygons in the level's extent: the basemap's designations, at least min_acres, generalized."""
    dest = os.path.join(bb.WORK, f"padus-4.1-zoom-{lv.key}.geojson")
    if os.path.exists(dest) and os.path.getsize(dest) > 0: return dest
    log("  download PAD-US 4.1 for", lv.key)
    feats, offset = [], 0
    while True:
        q = urllib.parse.urlencode(dict(
            where=f"{bb.PADUS_WHERE} AND GIS_Acres>={min_acres}", geometry=",".join(str(v) for v in lv.deg),
            geometryType="esriGeometryEnvelope", inSR=4326, spatialRel="esriSpatialRelIntersects",
            outFields="Unit_Nm,Des_Tp,GIS_Acres", outSR=4326, maxAllowableOffset=offset_deg,
            resultOffset=offset, resultRecordCount=500, f="geojson"))
        for _ in range(8):
            page = json.loads(subprocess.run(["curl", "-fsSL", "--retry", "3", bb.PADUS + "?" + q],
                                             capture_output=True, check=True).stdout)
            if "error" not in page: break
            log("   ", page["error"].get("message", "error"), "- retrying in 65 s")
            time.sleep(65)
        else: raise SystemExit("the PAD-US service kept refusing the query")
        feats += page.get("features", [])
        more = page.get("exceededTransferLimit") or page.get("properties", {}).get("exceededTransferLimit")
        if not more or not page.get("features"): break
        offset += len(page["features"])
    with open(dest + ".part", "w") as fh: json.dump({"type": "FeatureCollection", "features": feats}, fh)
    os.replace(dest + ".part", dest)
    return dest

def padus(lv, min_acres, offset_deg):
    """Generalized on the server, so a polygon can come back broken: repair it, or leave it out."""
    with open(fetch_padus(lv, min_acres, offset_deg)) as fh:
        fc = json.load(fh)
    out, bad = [], 0
    for f in fc["features"]:
        if not f.get("geometry"): continue
        try:
            g = shape(f["geometry"])
            g = g if g.is_valid else g.buffer(0)
            if g.is_empty or not g.is_valid: raise ValueError
            out.append(g)
        except Exception:
            bad += 1
    log(f"  PAD-US {lv.key}: {len(out)} areas, {bad} left out")
    return out

def interior_borders(polys, tol):
    """Lines where two of the given polygons meet: state lines, not coastlines."""
    whole = unary_union(polys)
    edges = unary_union([p.boundary for p in polys])
    return edges.difference(whole.boundary.buffer(tol))

# ---- data per level ---------------------------------------------------------------
def states(cb, lv):
    return [(d["STUSPS"], g) for d, g in shapes(fetch(CENSUS + f"GENZ2024/shp/cb_2024_us_state_{cb}.zip"), lv.deg)]

def primary_roads(lv, interstates_only=False):
    out = collections.defaultdict(list)
    for d, g in shapes(fetch(CENSUS + "TIGER2024/PRIMARYROADS/tl_2024_us_primaryroads.zip"), lv.deg):
        if interstates_only and d.get("RTTYP") != "I": continue
        out["I" if d.get("RTTYP") == "I" else "P"].append(g)
    return out

def urban(lv, min_km2):
    z = fetch(CENSUS + "GENZ2020/shp/cb_2020_us_ua20_500k.zip")
    return [g for d, g in shapes(z, lv.deg) if (d.get("ALAND20") or 0) >= min_km2 * 1e6]

def ne(path, lv, where=None):
    return [(d, g) for d, g in shapes(fetch(NE + path), lv.deg, where)]

def level_us(lv):
    log("level us")
    st = states("5m", lv)
    us = unary_union([g for _, g in st])
    other = [g for d, g in ne("50m/cultural/ne_50m_admin_0_countries.zip", lv) if d.get("ADM0_A3") != "USA"]
    lakes = [g for _, g in ne("50m/physical/ne_50m_lakes.zip", lv)]
    borders = [g for _, g in ne("50m/cultural/ne_50m_admin_0_boundary_lines_land.zip", lv)]
    roads = primary_roads(lv, interstates_only=True)
    return dict(
        land=lv.proj(unary_union([us] + other)),
        water=lv.proj(unary_union(lakes)) if lakes else Polygon(),
        state=lv.proj(interior_borders([g for _, g in st], 0.01)),
        border=lv.proj(unary_union(borders)),
        hwy=[lv.proj(g) for g in roads["I"]],
    )

def level_se(lv):
    log("level se")
    st = states("500k", lv)
    lakes = [g for d, g in ne("10m/physical/ne_10m_lakes.zip", lv)] + \
            [g for d, g in ne("10m/physical/ne_10m_lakes_north_america.zip", lv)]
    rivers = [g for d, g in ne("10m/physical/ne_10m_rivers_lake_centerlines.zip", lv)] + \
             [g for d, g in ne("10m/physical/ne_10m_rivers_north_america.zip", lv)
              if (d.get("scalerank") or 99) <= 10]
    roads = primary_roads(lv)
    return dict(
        land=lv.proj(unary_union([g for _, g in st])),
        water=lv.proj(unary_union(lakes)) if lakes else Polygon(),
        rivers=[lv.proj(g) for g in rivers],
        urban=lv.proj(unary_union(urban(lv, 25))),
        park=lv.proj(unary_union(padus(lv, 5000, 0.004))),
        state=lv.proj(interior_borders([g for _, g in st], 0.002)),
        hwy=[lv.proj(g) for g in roads["I"]],
        sec=[lv.proj(g) for g in roads["P"]],
    )

def level_coast(lv):
    """Land the way build_basemap.py makes it: TIGER counties less TIGER area water, so the coastline matches."""
    log("level coast")
    ext = box(lv.lon0, lv.lat0, lv.lon1, lv.lat1)
    counties = [(d["GEOID"], d["STATEFP"], g) for d, g in
                shapes(fetch_tiger("COUNTY/tl_2024_us_county.zip"), lv.deg) if g.intersects(ext)]
    log("  counties:", len(counties))
    land = unary_union([g for _, _, g in counties])
    water = []
    for geoid, _, _ in counties:
        for d, g in shapes(fetch_tiger(f"AREAWATER/tl_2024_{geoid}_areawater.zip")):
            if (d.get("AWATER") or 0) < 60_000 and d.get("MTFCC") in bb.POND_CODES: continue   # ponds
            water.append(g)
    water = unary_union(water)
    by_state = collections.defaultdict(list)
    for _, sfp, g in counties: by_state[sfp].append(g)
    state_polys = [unary_union(v) for v in by_state.values()]
    roads = primary_roads(lv)
    sec = []
    for sfp in sorted(by_state):
        for d, g in shapes(fetch_tiger(f"PRISECROADS/tl_2024_{sfp}_prisecroads.zip"), lv.deg):
            if d.get("MTFCC") == "S1200": sec.append(g)
    return dict(
        land=lv.proj(land.difference(water)),
        urban=lv.proj(unary_union(urban(lv, 0))),
        park=lv.proj(unary_union(padus(lv, 300, 0.0012))),
        state=lv.proj(interior_borders(state_polys, 0.001)),
        hwy=[lv.proj(g) for g in roads["I"] + roads["P"]],
        sec=[lv.proj(g) for g in sec],
    )

# ---- drawing ----------------------------------------------------------------------
STYLE = {   # px of the 3200 drawing
    "us": dict(state_w=1.3, border_w=1.8, hwy_w=1.5, hwy_op=0.75, tol=0.6),
    "se": dict(state_w=1.6, hwy_w=2.6, hwy_edge=0.5, sec_w=1.5, river_w=1.3, tol=0.45),
    "coast": dict(state_w=1.6, state_dash="6 4", hwy_w=3.0, hwy_edge=0.6, sec_w=1.5, sec_edge=0.3, tol=0.35),
}

def write_svg(lv, geo, path):
    s, t = STYLE[lv.key], STYLE[lv.key]["tol"]
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W0} {lv.h}" preserveAspectRatio="none">',
           f'<rect width="{W0}" height="{lv.h}" fill="{C["water"]}"/>',
           f'<path fill="{C["land"]}" fill-rule="evenodd" d="{bb.poly_d(geo["land"], t)}"/>']
    if "water" in geo:
        out.append(f'<path fill="{C["water"]}" fill-rule="evenodd" d="{bb.poly_d(geo["water"], t)}"/>')
    if "urban" in geo:
        out.append(f'<path fill="{URBAN}" fill-rule="evenodd" d="{bb.poly_d(geo["urban"].intersection(geo["land"]), t)}"/>')
    if "park" in geo:
        out.append(f'<path fill="{C["park"]}" fill-rule="evenodd" d="{bb.poly_d(geo["park"].intersection(geo["land"]), t)}"/>')
    if "rivers" in geo:
        out.append(f'<path fill="none" stroke="{C["water"]}" stroke-width="{s["river_w"]:g}" stroke-linecap="round" '
                   f'stroke-linejoin="round" d="{bb.line_d(geo["rivers"], t)}"/>')
    dash = f' stroke-dasharray="{s["state_dash"]}"' if "state_dash" in s else ""
    out.append(f'<path fill="none" stroke="{C["state"]}" stroke-width="{s["state_w"]:g}"{dash} '
               f'd="{bb.line_d([geo["state"]], t)}"/>')
    if "border" in geo:
        out.append(f'<path fill="none" stroke="{BORDER}" stroke-width="{s["border_w"]:g}" '
                   f'd="{bb.line_d([geo["border"]], t)}"/>')
    out.append('<g fill="none" stroke-linecap="round" stroke-linejoin="round">')
    if geo.get("sec"):
        d = bb.line_d(geo["sec"], t)
        if s.get("sec_edge"):
            out.append(f'<path stroke="{C["edge"]}" stroke-width="{s["sec_w"] + 2 * s["sec_edge"]:g}" d="{d}"/>')
        out.append(f'<path stroke="{C["sec"]}" stroke-width="{s["sec_w"]:g}" d="{d}"/>')
    d = bb.line_d(geo["hwy"], t)
    if s.get("hwy_edge"):
        out.append(f'<path stroke="{C["edge"]}" stroke-width="{s["hwy_w"] + 2 * s["hwy_edge"]:g}" d="{d}"/>')
    op = f' opacity="{s["hwy_op"]:g}"' if "hwy_op" in s else ""
    out.append(f'<path stroke="{C["hwy"]}" stroke-width="{s["hwy_w"]:g}"{op} d="{d}"/>')
    out += ["</g>", "</svg>"]
    with open(path, "w") as fh: fh.write("\n".join(out))
    return os.path.getsize(path)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", default=bb.WORK)
    ap.add_argument("--force", action="store_true", help="rebuild levels already built")
    args = ap.parse_args()
    bb.WORK = args.work
    os.makedirs(bb.WORK, exist_ok=True)
    os.makedirs(bb.MEDIA, exist_ok=True)
    build = {"us": level_us, "se": level_se, "coast": level_coast}
    meta = {"note": "Zoom levels for the towns map (build_zoom.py): Web Mercator extents, drawn at 3200 px wide.",
            "levels": []}
    for key, ext in LEVELS:
        lv = Level(key, ext)
        done = os.path.join(bb.WORK, f"zoom-{key}.json")
        if os.path.exists(done) and not args.force and all(os.path.exists(os.path.join(bb.MEDIA, f"zoom-{key}-{w}.{e}"))
                                                           for w, _ in WIDTHS for e in ("avif", "webp")):
            log("level", key, "already built (--force rebuilds it)")
            with open(done) as fh: meta["levels"].append(json.load(fh))
            continue
        geo = build[key](lv)
        svg = os.path.join(bb.WORK, f"zoom-{key}.svg")
        log(f"  svg {write_svg(lv, geo, svg):,} B, {W0}x{lv.h}")
        jobs = [(os.path.join(bb.WORK, f"zoom-{key}-{w}.png"), w, round(lv.h * w / W0)) for w, _ in WIDTHS]
        bb.render(svg, jobs)
        files = {}
        for (w, limit), (png, _, h) in zip(WIDTHS, jobs):
            limit = CEILING.get(key, {}).get(w, limit)
            avif = os.path.join(bb.MEDIA, f"zoom-{key}-{w}.avif")
            webp = os.path.join(bb.MEDIA, f"zoom-{key}-{w}.webp")
            crf, size, db, cap = bb.pick_avif(png, avif, limit)
            q, wsize, wdb = bb.pick_webp(png, webp, db, 2 * limit)
            log(f"  {w}x{h}: avif crf {crf} {size:,} B {db:.1f} dB (cap {cap:.1f}); webp q {q} {wsize:,} B {wdb:.1f} dB")
            files[w] = dict(h=h, avif=size, webp=wsize)
        meta["levels"].append(dict(key=key, lon0=lv.lon0, lon1=lv.lon1, lat0=lv.lat0, lat1=lv.lat1,
                                   w=W0, h=lv.h, files=files))
        with open(done, "w") as fh: json.dump(meta["levels"][-1], fh)
    with open(ZOOM_JSON, "w") as fh: json.dump(meta, fh, indent=1)
    log("wrote", os.path.relpath(ZOOM_JSON, os.path.dirname(os.path.dirname(bb.HP))))

if __name__ == "__main__":
    main()
