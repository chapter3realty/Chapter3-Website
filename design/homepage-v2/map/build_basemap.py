#!/usr/bin/env python3
"""Build the dark Grand Strand basemap for the homepage towns section.

    python3 design/homepage-v2/map/build_basemap.py [--work DIR]

Steps: download U.S. Census Bureau TIGER/Line 2024 shapefiles and USGS PAD-US 4.1
protected areas (both public domain) into a work folder outside the repo, project them
onto the page's plane, write an SVG in Google Maps' current dark roadmap palette with no
text on it, rasterize it with Playwright Chromium (render_svg.js), encode AVIF and WebP
with ffmpeg (quality first, then the byte ceiling), and write data/strand-plane.json
with the plane constants, the towns and the shield and water-label anchors. Every anchor
is sampled on the lossless renders and on each encoded file, decoded by ffmpeg and by
Chromium, before anything in the repo is written.

Needs: python3 with pyshp, shapely, numpy; curl; node with playwright
(NODE_PATH=$(npm root -g)); a Chromium binary; an ffmpeg with libaom-av1 and
libwebp. Paths can be overridden with CHROMIUM, FFMPEG and STRAND_MAPDATA.
"""
import argparse, collections, io, json, math, os, re, subprocess, time, urllib.parse, zipfile

import numpy as np
import shapefile
import shapely
import shapely.affinity
from shapely.geometry import LineString, MultiLineString, MultiPolygon, Point, Polygon, box, shape
from shapely.ops import linemerge, nearest_points, unary_union

HERE = os.path.dirname(os.path.abspath(__file__))
HP = os.path.dirname(HERE)
MEDIA = os.path.join(HP, "media", "map")
PLANE_JSON = os.path.join(HP, "data", "strand-plane.json")
WORK = os.environ.get("STRAND_MAPDATA", "/tmp/claude-0/-home-user-Chapter3-Website/9ba410d9-cb33-5363-bdba-94e4f377d9fb/scratchpad/mapdata")
FFMPEG = os.environ.get("FFMPEG", "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2")
CHROMIUM = os.environ.get("CHROMIUM", "/opt/pw-browsers/chromium")
TIGER = "https://www2.census.gov/geo/tiger/TIGER2024/"
# USGS Protected Areas Database of the United States (PAD-US) 4.1, public domain
PADUS = "https://services.arcgis.com/v01gqwM5QqNysAAi/arcgis/rest/services/Manager_Name_PADUS/FeatureServer/0/query"
PADUS_WHERE = ("FeatClass='Fee' AND Des_Tp IN ('NF','NWR','SP','SHCA','SCA','LP','LREC','PCON','PHCA') "
               "AND GIS_Acres>=20")          # land owned outright: forests, refuges, parks, preserves
STATES = ("45", "37")                          # South Carolina, North Carolina

# ---- the plane: must match the page's town math exactly ------------------------
LON0, LON1, LAT0, LAT1 = -79.62, -78.12, 33.12, 34.20
K = math.cos(math.radians(33.655))
S = 1000 / ((-78.46 - -79.27) * K)          # plane units per degree of latitude
W = (LON1 - LON0) * K * S                    # plane width  (~1852)
H = (LAT1 - LAT0) * S                        # plane height (~1602)
IMG_W = 2048
IMG_H = round(IMG_W * H / W)                 # 1771
SX, SY = IMG_W / W, IMG_H / H                # plane units -> 2048 px
# width, AVIF byte ceiling. The page's plane is wider than the screen (2000 CSS px on desktop, 1200 on phones), so
# 2x and 3x screens need the two larger files to stay sharp; srcset in src/main.tpl.html picks one by density.
SIZES = [(4096, 450_000), (3072, 320_000), (2048, 320_000), (1400, 170_000)]

def plane_x(lon): return (lon - LON0) * K * S
def plane_y(lat): return (LAT1 - lat) * S

TOWNS = [  # Census 2025 Gazetteer
    ("pawleys-island", "Pawleys Island", 33.428093, -79.124988),
    ("murrells-inlet", "Murrells Inlet", 33.55725, -79.057165),
    ("garden-city", "Garden City", 33.591671, -79.006572),
    ("surfside-beach", "Surfside Beach", 33.609651, -78.97754),
    ("myrtle-beach", "Myrtle Beach", 33.71039, -78.886024),
    ("carolina-forest", "Carolina Forest", 33.76636, -78.913478),
    ("conway", "Conway", 33.834533, -79.049173),
    ("north-myrtle-beach", "North Myrtle Beach", 33.824512, -78.708694),
    ("little-river", "Little River", 33.880648, -78.640489),
]

# ---- style: Google Maps dark roadmap as it renders today ------------------------
# Sampled from Google's own dark color-scheme image (developers.google.com/maps/documentation/
# javascript/mapcolorscheme): land #1a2536, water #06080b, parks #154043, built-up #25334b;
# motorways and trunk roads #4c6c96, arterials and streets #3f5167, both with #121b27 edges.
# The state line is a neutral grey no lighter than the arterials. Widths are px of the 2048
# image, sized so the far half of the tilted map still shows the main roads.
C = dict(
    water="#06080b", land="#1a2536", park="#154043", airport="#25334b", state="#4a5058",
    local="#3f5167", sec="#3f5167", hwy="#4c6c96", edge="#121b27",
)
HWY_W, HWY_EDGE = 3.6, 0.6                     # tier 1; edge = dark edge on each side
SEC_W, SEC_EDGE = 1.6, 0.3                     # tier 2; ramps that reach a tier 1 road are this width in its blue
LOCAL_W, LOCAL_OPACITY = 0.9, 0.8              # tier 3: streets, in towns only
RIVER_W = 1.5                                  # named rivers from the linear water files
STATE_W, STATE_DASH = 1.0, "4 3"
LOCAL_LAT_MAX = 33.93        # no streets north of here (plane y < 400): the far third of the tilted view
TOWN_PAD = 3.0               # px around TIGER places (cities, towns, CDPs) that count as "in town"
MIN_WATER_M2 = 1500          # any water body smaller than this is dropped
POND_CODES = {"H2030", "H2040", "H2041"}       # lakes, ponds, reservoirs: true size, and only the larger ones
POND_MIN_TOWN, POND_MIN_RURAL = 5000, 20000    # m2 kept in town (golf and subdivision ponds) and outside
GROW_CODES = {"H3010", "H3013", "H3020", "H2051"}   # rivers, streams, canals, estuaries
WATER_GROW = 0.6    # px added to each bank of those, so a 90 m channel still reads
WATER_GROW_NAMED = {"Intracoastal Waterway": 1.1, "Waccamaw Riv": 0.9}   # the two the page names
RIVER_RE = re.compile(r"\bRiv\b")
LAND_OPEN = 0.3     # px; an opening of the land removes sub-pixel slivers left between TIGER polygons
PARK_CODES = {f"K{n}" for n in range(2180, 2191)} | {"K2561"}   # parks, forests, refuges, golf
AIRPORT_CODES = {"K2451", "K2456", "K2457"}

# tier 1: S1100, plus S1200 carrying US 17, 17 Bus, 17 Byp, 501, 701 or SC 31, SC 22
ROUTE_RE = re.compile(r"^(?:[NSEW] )?(US Hwy|State Hwy) (17|501|701|31|22)(?: (Bus|Byp))?(?: [NSEW])?$")
def route_token(name):
    m = ROUTE_RE.match(name or "")
    if not m: return None
    kind, num, suffix = m.groups()
    if (kind == "US Hwy") != (num in ("17", "501", "701")): return None
    if suffix and num != "17": return None                 # 501 Bus, 701 Bus stay tier 2
    return ("US" if kind == "US Hwy" else "SC") + num + (suffix or "").upper()

# ---- helpers --------------------------------------------------------------------
def log(*a): print(*a, flush=True)

def fetch(rel):
    dest = os.path.join(WORK, os.path.basename(rel))
    if not os.path.exists(dest) or os.path.getsize(dest) == 0:
        log("  download", rel)
        subprocess.run(["curl", "-fsSL", "--retry", "3", "-o", dest + ".part", TIGER + rel], check=True)
        os.replace(dest + ".part", dest)
    return dest

def fetch_padus():
    """PAD-US polygons inside the extent, as GeoJSON (cached). The service allows a few large queries a minute."""
    dest = os.path.join(WORK, "padus-4.1-strand.geojson")
    if os.path.exists(dest) and os.path.getsize(dest) > 0: return dest
    log("  download PAD-US 4.1 (USGS feature service)")
    feats, offset = [], 0
    while True:
        q = urllib.parse.urlencode(dict(
            where=PADUS_WHERE, geometry=f"{LON0},{LAT0},{LON1},{LAT1}", geometryType="esriGeometryEnvelope",
            inSR=4326, spatialRel="esriSpatialRelIntersects", outFields="Unit_Nm,Des_Tp,GIS_Acres,State_Nm",
            outSR=4326, resultOffset=offset, resultRecordCount=500, f="geojson"))
        for _ in range(8):
            page = json.loads(subprocess.run(["curl", "-fsSL", "--retry", "3", PADUS + "?" + q],
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

def reader(zpath, dbf_only=False):
    zf = zipfile.ZipFile(zpath)
    stem = os.path.splitext(os.path.basename(zpath))[0]
    part = lambda ext: io.BytesIO(zf.read(stem + ext))
    if dbf_only: return shapefile.Reader(dbf=part(".dbf"))
    return shapefile.Reader(shp=part(".shp"), shx=part(".shx"), dbf=part(".dbf"))

def to_px(a):
    out = np.empty_like(a)
    out[:, 0] = (a[:, 0] - LON0) * K * S * SX
    out[:, 1] = (LAT1 - a[:, 1]) * S * SY
    return out

def proj(g): return shapely.transform(g, to_px)

def valid(g): return g if g.is_valid else shapely.make_valid(g)

def polys(g):
    if g.is_empty: return []
    if isinstance(g, Polygon): return [g]
    if isinstance(g, MultiPolygon): return list(g.geoms)
    return [p for x in getattr(g, "geoms", []) for p in polys(x)]

def lines(g):
    if g.is_empty: return []
    if isinstance(g, LineString): return [g]
    if isinstance(g, MultiLineString): return list(g.geoms)
    return [p for x in getattr(g, "geoms", []) for p in lines(x)]

DEG_BOX = (LON0 - 0.05, LAT0 - 0.05, LON1 + 0.05, LAT1 + 0.05)
CLIP = box(-12, -12, IMG_W + 12, IMG_H + 12)      # a little past the canvas so no line ends show

# ---- 1. data --------------------------------------------------------------------
def load_counties():
    ext = box(LON0, LAT0, LON1, LAT1)
    out = []
    for sr in reader(fetch("COUNTY/tl_2024_us_county.zip")).iterShapeRecords(bbox=DEG_BOX):
        g = valid(shape(sr.shape.__geo_interface__))
        if g.intersection(ext).area > 0:
            d = sr.record.as_dict()
            out.append((d["GEOID"], d["NAMELSAD"], d["STATEFP"], g))
    return out

def load_places():
    """Cities, towns and census-designated places, grown by TOWN_PAD: what counts as "in town"."""
    gs = []
    for st in STATES:
        for sr in reader(fetch(f"PLACE/tl_2024_{st}_place.zip")).iterShapeRecords(bbox=DEG_BOX):
            g = valid(proj(shape(sr.shape.__geo_interface__))).intersection(CLIP)
            if not g.is_empty and g.area > 0: gs.append(g)
    towns = unary_union(gs).buffer(TOWN_PAD, quad_segs=4)
    shapely.prepare(towns)
    return towns, len(gs)

def load_water(fips, towns):
    """Area water. The ocean and lakes keep their true outline; rivers, canals and estuaries grow by WATER_GROW."""
    kept, dropped, named = [], collections.Counter(), collections.defaultdict(list)
    for f in fips:
        for sr in reader(fetch(f"AREAWATER/tl_2024_{f}_areawater.zip")).iterShapeRecords(bbox=DEG_BOX):
            d = sr.record.as_dict()
            code = d["MTFCC"]
            if d["AWATER"] < MIN_WATER_M2: dropped[f"under {MIN_WATER_M2} m2"] += 1; continue
            g = valid(proj(shape(sr.shape.__geo_interface__))).intersection(CLIP)
            if g.is_empty or g.area == 0: continue
            if code in POND_CODES:
                p = g.representative_point()
                need = POND_MIN_TOWN if shapely.contains_xy(towns, p.x, p.y) else POND_MIN_RURAL
                if d["AWATER"] < need: dropped["lakes and ponds under the size rule"] += 1; continue
            g = g.simplify(0.1)
            if code in GROW_CODES: g = g.buffer(WATER_GROW_NAMED.get(d["FULLNAME"], WATER_GROW), quad_segs=4)
            kept.append(g)
            if d["FULLNAME"]: named[d["FULLNAME"]].append(g)
    return kept, dropped, named

def load_rivers(fips):
    """Named rivers from the linear water files: the Census area water stops short on several of them."""
    out = []
    for f in fips:
        for sr in reader(fetch(f"LINEARWATER/tl_2024_{f}_linearwater.zip")).iterShapeRecords(bbox=DEG_BOX):
            d = sr.record.as_dict()
            if d["MTFCC"] != "H3010" or not RIVER_RE.search(d["FULLNAME"] or ""): continue
            g = proj(shape(sr.shape.__geo_interface__)).intersection(CLIP)
            if not g.is_empty: out.append(g)
    return out

def load_landmarks():
    parks, airports, seen = [], [], collections.Counter()
    for st in STATES:
        for sr in reader(fetch(f"AREALM/tl_2024_{st}_arealm.zip")).iterShapeRecords(bbox=DEG_BOX):
            d = sr.record.as_dict()
            code = d["MTFCC"]
            if code not in PARK_CODES and code not in AIRPORT_CODES: continue
            g = valid(proj(shape(sr.shape.__geo_interface__))).intersection(CLIP)
            if g.is_empty or g.area == 0: continue
            seen[code] += 1
            (parks if code in PARK_CODES else airports).append(g)
    return parks, airports, seen

def load_padus():
    """Forests, wildlife refuges, state and local parks and preserves. Safe Harbor agreements cover
    private land that stays private, so they are not drawn as parks."""
    out, seen = [], collections.Counter()
    with open(fetch_padus()) as fh: gj = json.load(fh)
    for f in gj["features"]:
        p = f.get("properties") or {}
        if not f.get("geometry") or "safe harbor" in (p.get("Unit_Nm") or "").lower(): continue
        g = valid(proj(shape(f["geometry"]))).intersection(CLIP)
        if g.is_empty or g.area == 0: continue
        out.append(g)
        seen[p.get("Des_Tp")] += 1
    return out, seen

def route_names(f):
    """LINEARID -> route tokens carried on at least half of its edges (alternate names)."""
    prim, alt = {}, collections.defaultdict(set)
    for tlid, full, lid, pa in reader(fetch(f"FEATNAMES/tl_2024_{f}_featnames.zip"), dbf_only=True).iterRecords(
            fields=["TLID", "FULLNAME", "LINEARID", "PAFLAG"]):
        if pa == "P": prim[tlid] = lid
        else:
            t = route_token(full)
            if t: alt[tlid].add(t)
    total, any_hit, hits = collections.Counter(), collections.Counter(), collections.defaultdict(collections.Counter)
    for tlid, lid in prim.items():
        total[lid] += 1
        if alt.get(tlid): any_hit[lid] += 1
        for t in alt.get(tlid, ()): hits[lid][t] += 1
    out = {}
    for lid, n in any_hit.items():
        if 2 * n >= total[lid]:
            out[lid] = {t for t, k in hits[lid].items() if 2 * k >= total[lid]} or set(hits[lid])
    return out

def load_roads(fips, towns):
    """Tier 1 "hwy", tier 2 "sec" and "ramp", tier 3 "loc" (streets in towns, south of LOCAL_LAT_MAX)."""
    cls_geoms = {"loc": [], "sec": [], "ramp": [], "hwy": []}
    routes = collections.defaultdict(list)
    counts = collections.Counter()
    for f in fips:
        alts = route_names(f)
        for sr in reader(fetch(f"ROADS/tl_2024_{f}_roads.zip")).iterShapeRecords(bbox=DEG_BOX):
            d = sr.record.as_dict()
            m, name, lid = d["MTFCC"], d["FULLNAME"], d["LINEARID"]
            toks = set()
            if m in ("S1100", "S1200"):
                t = route_token(name)
                toks = ({t} if t else set()) | alts.get(lid, set())
                cls = "hwy" if (m == "S1100" or toks) else "sec"
            elif m == "S1630": cls = "ramp"
            elif m == "S1400": cls = "loc"
            else: continue                                   # trails, service, private, parking, walkways
            g = proj(shape(sr.shape.__geo_interface__)).intersection(CLIP)
            if g.is_empty: continue
            if cls == "loc":
                cls_geoms["loc"] += lines(g)
                continue
            cls_geoms[cls].append(g)
            counts[cls] += 1
            for t in toks: routes[t].append(g)
    # a ramp takes the blue of the highway it serves; ramps that reach no tier 1 road, even through other
    # ramps, are drawn as tier 2 so no blue fragment floats on its own
    ramps = cls_geoms["ramp"]
    hwy = unary_union(cls_geoms["hwy"]).buffer(1.0)
    shapely.prepare(hwy)
    tree = shapely.STRtree(ramps)
    blue = {i for i, g in enumerate(ramps) if hwy.intersects(g)}
    todo = list(blue)
    while todo:
        for j in tree.query(ramps[todo.pop()].buffer(0.5), predicate="intersects"):
            if int(j) not in blue: blue.add(int(j)); todo.append(int(j))
    cls_geoms["ramp"] = [g for i, g in enumerate(ramps) if i in blue]
    cls_geoms["sec"] += [g for i, g in enumerate(ramps) if i not in blue]
    counts["ramp"], counts["ramp as tier 2"] = len(blue), len(ramps) - len(blue)
    # streets only where Google shows them at this scale: inside towns, and not in the far third of the tilt
    loc = cls_geoms["loc"]
    mid = np.array([ls.interpolate(0.5, normalized=True).coords[0] for ls in loc]) if loc else np.zeros((0, 2))
    keep = shapely.contains_xy(towns, mid[:, 0], mid[:, 1]) & (mid[:, 1] >= plane_y(LOCAL_LAT_MAX) * SY)
    cls_geoms["loc"] = [ls for ls, k in zip(loc, keep) if k]
    counts["loc"], counts["loc dropped"] = int(keep.sum()), int((~keep).sum())
    return cls_geoms, routes, counts

# ---- 2. geometry ----------------------------------------------------------------
def build():
    os.makedirs(WORK, exist_ok=True)
    log("counties")
    counties = load_counties()
    fips = [c[0] for c in counties]
    log("  in extent:", ", ".join(f"{c[0]} {c[1]}" for c in counties))
    cpx = [(geoid, name, st, valid(proj(g))) for geoid, name, st, g in counties]
    land0 = unary_union([g.intersection(CLIP) for *_, g in cpx])
    sc = unary_union([g for _, _, st, g in cpx if st == "45"])
    nc = unary_union([g for _, _, st, g in cpx if st == "37"])
    state_line = sc.boundary.intersection(nc.buffer(0.5))

    log("places")
    towns, n_places = load_places()
    log(f"  {n_places} cities, towns and CDPs")

    log("water")
    water_list, dropped, named = load_water(fips, towns)
    log(f"  {len(water_list)} polygons kept; dropped:", dict(dropped))
    water = unary_union(water_list)
    land = valid(land0.difference(water))
    land = valid(land.buffer(-LAND_OPEN, quad_segs=4).buffer(LAND_OPEN, quad_segs=4))
    rivers = load_rivers(fips)
    log(f"  {len(rivers)} named river lines")

    log("parks and airports")
    parks, airports, seen = load_landmarks()
    log("  Census area landmarks used:", dict(seen))
    pad, pad_seen = load_padus()
    log("  PAD-US areas used:", dict(pad_seen))
    park = valid(unary_union(parks + pad)).intersection(land) if parks or pad else Polygon()
    airport = valid(unary_union(airports)).intersection(land) if airports else Polygon()

    log("roads")
    roads, routes, counts = load_roads(fips, towns)
    log("  road features:", dict(counts))
    state_line = state_line.intersection(land.buffer(1.5)).intersection(CLIP)
    return dict(counties=counties, land=land, water=water, named=named, park=park, airport=airport,
                rivers=rivers, state=state_line, roads=roads, routes=routes, towns=towns)

# ---- 3. svg ---------------------------------------------------------------------
def num(v):
    v = int(v)
    q, r = divmod(abs(v), 10)
    return ("-" if v < 0 else "") + (str(q) if (q or not r) else "") + (("." + str(r)) if r else "")

def path_d(coords, closed):
    t = np.round(np.asarray(coords)[:, :2] * 10).astype(np.int64)      # tenths of a pixel
    keep = np.ones(len(t), bool)
    keep[1:] = (t[1:] != t[:-1]).any(axis=1)
    t = t[keep]
    if closed and len(t) > 1 and (t[0] == t[-1]).all(): t = t[:-1]
    if len(t) < (3 if closed else 2): return ""
    d = np.diff(t, axis=0)
    body = " ".join(f"{num(a)} {num(b)}" for a, b in d)
    return f"M{num(t[0, 0])} {num(t[0, 1])}l{body}" + ("z" if closed else "")

def poly_d(g, tol):
    g = g.simplify(tol, preserve_topology=True)
    out = []
    for p in polys(g):
        for ring in (p.exterior, *p.interiors):
            out.append(path_d(ring.coords, True))
    return "".join(out)

def line_d(geoms, tol):
    out = []
    for g in geoms:
        for ls in lines(g.simplify(tol, preserve_topology=False)):
            out.append(path_d(ls.coords, False))
    return "".join(out)

def write_svg(geo, path):
    r = geo["roads"]
    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {IMG_W} {IMG_H}" preserveAspectRatio="none">',
        "<defs>",
        f'<path id="sec" d="{line_d(r["sec"], 0.3)}"/>',
        f'<path id="ramp" d="{line_d(r["ramp"], 0.3)}"/>',
        f'<path id="hwy" d="{line_d(r["hwy"], 0.25)}"/>',
        "</defs>",
        f'<rect width="{IMG_W}" height="{IMG_H}" fill="{C["water"]}"/>',
        f'<path fill="{C["land"]}" fill-rule="evenodd" d="{poly_d(geo["land"], 0.25)}"/>',
        f'<path fill="{C["park"]}" fill-rule="evenodd" d="{poly_d(geo["park"], 0.3)}"/>',
        f'<path fill="{C["airport"]}" fill-rule="evenodd" d="{poly_d(geo["airport"], 0.3)}"/>',
        f'<path fill="none" stroke="{C["water"]}" stroke-width="{RIVER_W:g}" stroke-linecap="round" stroke-linejoin="round" d="{line_d(geo["rivers"], 0.3)}"/>',
        f'<path fill="none" stroke="{C["state"]}" stroke-width="{STATE_W:g}" stroke-dasharray="{STATE_DASH}" d="{line_d([geo["state"]], 0.3)}"/>',
        '<g fill="none" stroke-linecap="round" stroke-linejoin="round">',
        f'<path opacity="{LOCAL_OPACITY:g}" stroke="{C["local"]}" stroke-width="{LOCAL_W:g}" d="{line_d(r["loc"], 0.35)}"/>',
        f'<use href="#sec" stroke="{C["edge"]}" stroke-width="{SEC_W + 2 * SEC_EDGE:g}"/>',
        f'<use href="#ramp" stroke="{C["edge"]}" stroke-width="{SEC_W + 2 * SEC_EDGE:g}"/>',
        f'<use href="#sec" stroke="{C["sec"]}" stroke-width="{SEC_W:g}"/>',
        f'<use href="#ramp" stroke="{C["hwy"]}" stroke-width="{SEC_W:g}"/>',
        f'<use href="#hwy" stroke="{C["edge"]}" stroke-width="{HWY_W + 2 * HWY_EDGE:g}"/>',
        f'<use href="#hwy" stroke="{C["hwy"]}" stroke-width="{HWY_W:g}"/>',
        "</g>",
        "</svg>",
    ]
    with open(path, "w") as fh: fh.write("\n".join(parts))
    return os.path.getsize(path)

# ---- 4. raster + encode ---------------------------------------------------------
def node_env():
    env = dict(os.environ, CHROMIUM=CHROMIUM)
    if "NODE_PATH" not in env:
        env["NODE_PATH"] = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True, check=True).stdout.strip()
    return env

def render(svg, jobs):
    args = ["node", os.path.join(HERE, "render_svg.js"), "svg", svg]
    for out, w, h in jobs: args += [out, str(w), str(h)]
    subprocess.run(args, check=True, env=node_env())

def decode_in_chromium(files):
    """Each file as Chromium decodes it (render_svg.js decode), saved as a PNG in WORK."""
    outs = [os.path.join(WORK, "chromium-" + os.path.basename(f) + ".png") for f in files]
    args = ["node", os.path.join(HERE, "render_svg.js"), "decode"]
    for f, o in zip(files, outs): args += [f, o]
    subprocess.run(args, check=True, env=node_env())
    return outs

def read_rgb(path, vf=None):
    cmd = [FFMPEG, "-v", "error", "-i", path] + (["-vf", vf] if vf else []) + ["-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    p = subprocess.run(cmd, capture_output=True, check=True)
    info = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True).stderr
    w, h = map(int, re.search(r", (\d{2,5})x(\d{2,5})", info).groups())
    return np.frombuffer(p.stdout, np.uint8).reshape(h, w, 3)

YUV = "scale=out_color_matrix=bt709:out_range=full:flags=accurate_rnd+full_chroma_int,format=yuv420p"

def encode_avif(png, out, crf):
    # 8-bit 4:2:0 (AV1 Main profile, which every AVIF decoder handles), BT.709 full range, tagged
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", png, "-vf", YUV,
                    "-c:v", "libaom-av1", "-still-picture", "1", "-crf", str(crf), "-b:v", "0",
                    "-cpu-used", "3", "-row-mt", "1", "-tiles", "2x2",
                    "-color_primaries", "bt709", "-color_trc", "iec61966-2-1", "-colorspace", "bt709", "-color_range", "pc",
                    out], check=True)
    return os.path.getsize(out)

def encode_webp(png, out, q):
    # RGBA in, so libwebp does its own colour conversion (decodes to the exact palette)
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", png, "-pix_fmt", "bgra",
                    "-c:v", "libwebp", "-lossless", "0", "-quality", str(q), "-compression_level", "6",
                    "-preset", "drawing", out], check=True)
    return os.path.getsize(out)

def psnr(a, b):
    mse = np.mean((a.astype(np.float64) - b.astype(np.float64)) ** 2)
    return 99.0 if mse == 0 else 10 * math.log10(255 ** 2 / mse)

# Quality first, then the byte ceiling. 4:2:0 chroma caps what any AVIF of this map can reach, so the
# reference is the PNG taken through 4:2:0 and back with no compression at all. The AVIF gets the highest
# crf (smallest file) within AVIF_DB of that cap: at 3x zoom the lossless render, crf 4 and crf 10 of this
# map look the same, and crf 16 starts to soften the street grid. The WebP gets the lowest quality that
# matches the AVIF's PSNR, or else the highest that stays under twice the AVIF's bytes.
AVIF_DB = 1.5
AVIF_CRFS = range(4, 41, 2)
WEBP_QS = range(70, 101, 2)

def pick_avif(png, out, limit):
    """Walk crf upward: keep the last crf that meets the quality rule and fits; if none fits before the
    quality rule fails, the byte ceiling binds and the first crf that fits wins."""
    ref = read_rgb(png)
    cap = psnr(ref, read_rgb(png, YUV + ",format=rgb24"))
    good = None
    for crf in AVIF_CRFS:
        size = encode_avif(png, out, crf)
        db = psnr(ref, read_rgb(out))
        if db >= cap - AVIF_DB:
            if size <= limit: good = (crf, size, db)
            continue
        if good: break
        if size <= limit:
            good = (crf, size, db)
            break
    if not good: raise SystemExit(f"cannot fit {out} under {limit} bytes")
    encode_avif(png, out, good[0])
    return (*good, cap)

def pick_webp(png, out, target_db, limit):
    """The lowest quality that reaches target_db, or else the highest that stays under limit."""
    ref = read_rgb(png)
    best = None
    for q in WEBP_QS:
        size = encode_webp(png, out, q)
        if size > limit: break
        best = (q, size, psnr(ref, read_rgb(out)))
        if best[2] >= target_db: break
    if not best: raise SystemExit(f"cannot fit {out} under {limit} bytes")
    encode_webp(png, out, best[0])
    return best

# ---- 5. anchors -----------------------------------------------------------------
# Shields and water labels are HTML on the page, placed over the tilted plane by CSS
# (design/homepage-v2/src/head.html, #towns). Each anchor sits on its feature; where the brief
# leaves room ("near", "midway"), it slides along the feature to the spot nearest the nominal
# one that stays clear of the town pins, the town labels, the other anchors, the text card,
# the compass and the fogged edges, at every heading of the slow turn. CAMERAS copies the
# page's camera and label sides for each width band from head.html as it stood on 2026-09-29
# (21:48 UTC). It only steers placement: when the page's camera changes, update it, rebuild,
# and run the page's own label tests.
TX, TY, HW = 0.49, 0.45, H / W                 # camera target on the plane (fractions), height/width
CAMERAS = [
    dict(name="desktop", vws=(1100, 1440, 1920), sh=760, P=1200, pw=1900, tilt=56, heads=(13, 16, 19), cx=80, cy=0.66,
         fog=90, font=13.5, card=True, compass=(28, None),
         right={"myrtle-beach", "little-river", "surfside-beach"}, left={"conway", "murrells-inlet"}),
    dict(name="tablet", vws=(900, 1099), sh=600, P=1100, pw=1600, tilt=54, heads=(9, 12, 15), cx=80, cy=0.55,
         fog=50, font=13.5, card=False, compass=(20, 34),
         right={"myrtle-beach", "north-myrtle-beach", "surfside-beach", "murrells-inlet"}, left={"carolina-forest"}),
    dict(name="small tablet", vws=(700, 899), sh=600, P=1100, pw=1300, tilt=50, heads=(13, 16, 19), cx=0, cy=0.55,
         fog=50, font=13.5, card=False, compass=(20, 34),
         right={"myrtle-beach", "north-myrtle-beach", "surfside-beach", "pawleys-island"},
         left={"carolina-forest", "murrells-inlet"}),
    dict(name="phone", vws=(360, 430), sh=620, P=900, pw=1300, tilt=52, heads=(-30, -28, -26), cx=50, cy=0.5,
         fog=40, font=12, card=False, compass=(20, 23.8),
         right={"myrtle-beach", "surfside-beach", "murrells-inlet"},
         left={"north-myrtle-beach", "little-river", "garden-city", "carolina-forest"}),
]
# box sizes in CSS px, measured on the page (town labels at 13.5 px type; phones use 12 px type).
# The compass sits 2rem (34 px) and 1.4rem (23.8 px) from the right edge on tablets and phones.
TOWN_LABEL_W = {"pawleys-island": 117.5, "murrells-inlet": 107.7, "garden-city": 102.9, "surfside-beach": 121.1,
                "myrtle-beach": 109.8, "carolina-forest": 121.8, "north-myrtle-beach": 149.4, "conway": 77.1,
                "little-river": 93.5}
SHIELD_W = {"17": 19.1, "501": 27.1, "31": 21.5, "22": 24.1}
WATER_W = {"Atlantic Ocean": 103, "Intracoastal Waterway": 155, "Waccamaw River": 116}
SHIELD_H, WATER_H, PIN_R, STEM, CARD, COMPASS = 17.5, 13, 9, 28, (470, 272.4, 56), 44
CLEAR = 6                                      # CSS px between an anchor's box and anything else
MASK_MIN = 0.5                                 # the plane fades out toward its edges; stay where it is at least half visible

def label_size(slug, cam):
    w = TOWN_LABEL_W[slug]
    if cam["font"] == 13.5: return w, 31.5
    return (w - 26) * cam["font"] / 13.5 + 22, cam["font"] + 16         # 7/10 px padding and a 1 px border

def screen(cam, vw, x, y, head):
    """Plane units -> stage CSS px, exactly as the page's .tw-pt transform does it."""
    u, v = (x / W - TX) * cam["pw"], (y / H - TY) * cam["pw"] * HW
    h, t = math.radians(head), math.radians(cam["tilt"])
    up, vp = u * math.cos(h) - v * math.sin(h), u * math.sin(h) + v * math.cos(h)
    k = cam["P"] / (cam["P"] - vp * math.sin(t))
    return vw / 2 + cam["cx"] + up * k, cam["cy"] * cam["sh"] + vp * math.cos(t) * k

def screen_angle(cam, ang, head):
    a = math.radians(ang + head)
    return math.degrees(math.atan2(math.sin(a) * math.cos(math.radians(cam["tilt"])), math.cos(a)))

def mask_alpha(x, y):
    """How visible the plane is at (x, y): the page masks it with a radial gradient, #000 62% to transparent."""
    e = math.hypot((x - TX * W) / (min(TX, 1 - TX) * W), (y - TY * H) / (min(TY, 1 - TY) * H))
    return 1.0 if e <= 0.62 else max(0.0, (1 - e) / 0.38)

def fixed_obstacles(cam, vw, head):
    """Town pins, their stems and labels, the card and the compass, in stage px."""
    out = []
    for slug, n, lat, lon in TOWNS:
        X, Y = screen(cam, vw, plane_x(lon), plane_y(lat), head)
        w, h = label_size(slug, cam)
        out.append(Point(X, Y).buffer(PIN_R))
        if slug in cam["right"]: out.append(box(X + 12, Y - h / 2, X + 12 + w, Y + h / 2))
        elif slug in cam["left"]: out.append(box(X - 12 - w, Y - h / 2, X - 12, Y + h / 2))
        else: out += [box(X - w / 2, Y - STEM - h, X + w / 2, Y - STEM), box(X - 2, Y - STEM, X + 2, Y)]
    side = max(32, (vw - 1200) / 2 + 32)
    if cam["card"]: out.append(box(side, CARD[2], side + CARD[0], CARD[2] + CARD[1]))
    bottom, right = cam["compass"]
    right = side if right is None else right
    out.append(box(vw - right - COMPASS, cam["sh"] - bottom - COMPASS, vw - right, cam["sh"] - bottom))
    return out

def anchor_box(cam, vw, head, a):
    X, Y = screen(cam, vw, a["x"], a["y"], head)
    if a["type"] == "shield":
        w, h = SHIELD_W[a["label"]], SHIELD_H
        return box(X - w / 2, Y - h / 2, X + w / 2, Y + h / 2)
    hl, hh = WATER_W[a["label"]] / 2, WATER_H / 2
    b = shapely.affinity.rotate(box(-hl, -hh, hl, hh), screen_angle(cam, a["angle"], head), origin=(0, 0))
    return shapely.affinity.translate(b, X, Y)

VIEWS = [(cam, vw, head) for cam in CAMERAS for vw in cam["vws"] for head in cam["heads"]]
FIXED = {(cam["name"], vw, head): fixed_obstacles(cam, vw, head) for cam, vw, head in VIEWS}

def conflicts(a, placed):
    """Count the views (camera, width, heading) where the anchor's box is on screen and either overlaps
    something or runs off the side ("hard"), or comes within CLEAR px of something or sits in the fogged top
    or bottom edge ("soft"). An anchor that is off screen in a view does not count against it there."""
    hard, soft = collections.Counter(), collections.Counter()
    if mask_alpha(a["x"], a["y"]) < MASK_MIN:
        return collections.Counter({cam["name"]: 99 for cam in CAMERAS}), soft
    for cam, vw, head in VIEWS:
        key = (cam["name"], vw, head)
        b = anchor_box(cam, vw, head, a)
        x0, y0, x1, y1 = b.bounds
        if x1 < 0 or x0 > vw or y1 < 0 or y0 > cam["sh"]: continue           # off screen here
        gap = min([b.distance(o) for o in FIXED[key]] + [b.distance(p["boxes"][key]) for p in placed])
        if gap < 1 or x0 < 0 or x1 > vw: hard[cam["name"]] += 1
        elif gap < CLEAR or y0 < 2.2 * cam["fog"] or y1 > cam["sh"] - 48 or x0 < CLEAR or x1 > vw - CLEAR:
            soft[cam["name"]] += 1
    return hard, soft

def choose(cands, nominal, placed):
    """The candidate anchor with the fewest overlaps (desktop, then the other widths), then the fewest near
    misses (same order), then the one nearest the nominal point."""
    best = None
    for a in cands:
        hard, soft = conflicts(a, placed)
        d_h, d_s = hard["desktop"], soft["desktop"]
        key = (d_h, sum(hard.values()) - d_h, d_s, sum(soft.values()) - d_s,
               round(math.hypot(a["x"] - nominal[0], a["y"] - nominal[1]), 1))
        if best is None or key < best[0]: best = (key, a)
    a = best[1]
    a["boxes"] = {(cam["name"], vw, head): anchor_box(cam, vw, head, a) for cam, vw, head in VIEWS}
    return a, best[0]

def on_route(routes, toks):
    return unary_union([g for t in toks for g in routes.get(t, [])])

def route_points(geom, step=2.0):
    """Points every `step` px along every line of a route (2048 px space)."""
    pts = []
    for ls in lines(geom):
        n = max(2, int(ls.length / step) + 1)
        pts += [(p.x, p.y) for p in (ls.interpolate(d) for d in np.linspace(0, ls.length, n))]
    return np.array(pts)

def mid_carriageway(geom, X, Y, reach=6):
    """Centre of a divided road at (X, Y): the mean of the nearest points of the parts within reach."""
    p = Point(X, Y)
    near = [nearest_points(ls, p)[0] for ls in lines(geom) if ls.distance(p) <= reach]
    return (float(np.mean([q.x for q in near])), float(np.mean([q.y for q in near]))) if near else (X, Y)

def between(geom, a, b, lo, hi, off=40):
    """Route points whose position along the chord a->b is within [lo, hi] and that stay near it."""
    a, b = np.array(a), np.array(b)
    v = b - a
    pts = route_points(geom)
    t = ((pts - a) @ v) / (v @ v)
    dist = np.abs(v[0] * (pts[:, 1] - a[1]) - v[1] * (pts[:, 0] - a[0])) / np.linalg.norm(v)
    keep = (t >= lo) & (t <= hi) & (dist <= off)
    return pts[keep], t[keep]

def cross_at_lat(geom, lat, near_lon):
    """Point where geom crosses a latitude, the crossing nearest near_lon (px space)."""
    Y = plane_y(lat) * SY
    hits = geom.intersection(LineString([(-50, Y), (IMG_W + 50, Y)]))
    pts = []
    for g in getattr(hits, "geoms", [hits]):
        if g.is_empty: continue
        if isinstance(g, Point): pts.append((g.x, g.y))
        else: pts.append((g.centroid.x, g.centroid.y))
    if not pts: raise SystemExit(f"no crossing at lat {lat}")
    X0 = plane_x(near_lon) * SX
    pts.sort(key=lambda p: abs(p[0] - X0))
    near = [p for p in pts if abs(p[0] - pts[0][0]) < 6]     # both carriageways of a divided road
    return float(np.mean([p[0] for p in near])), Y

def local_angle(geom, X, Y, radius):
    """Direction of a channel around (X, Y): principal axis of its outline, degrees in (-90, 90]."""
    part = geom.intersection(Point(X, Y).buffer(radius))
    pts = []
    for p in polys(part):
        pts.append(np.asarray(p.exterior.coords))
        pts += [np.asarray(r.coords) for r in p.interiors]
    pts = np.concatenate(pts)
    pts = pts[np.hypot(pts[:, 0] - X, pts[:, 1] - Y) < radius - 0.5]   # drop the window's own edge
    pts = pts - pts.mean(axis=0)
    w, v = np.linalg.eigh(pts.T @ pts)
    dx, dy = v[:, np.argmax(w)]
    ang = math.degrees(math.atan2(dy, dx))
    while ang <= -90: ang += 180
    while ang > 90: ang -= 180
    return ang

def channel_points(geom, lat0, lat1, near_lon, radius, shows):
    """Points on a channel at latitudes lat0..lat1, with the channel's local angle. At each latitude the channel's
    crossing nearest near_lon is walked from its middle outward to the first spot shows(X, Y) accepts: a road
    drawn along a bank can cover part of a narrow channel."""
    out, X0 = [], plane_x(near_lon) * SX
    for lat in np.arange(lat0, lat1 + 1e-9, 0.001):
        Y = plane_y(lat) * SY
        chords = lines(geom.intersection(LineString([(-50, Y), (IMG_W + 50, Y)])))
        if not chords: continue
        xs = [q[0] for q in min(chords, key=lambda c: abs(c.centroid.x - X0)).coords]
        xa, xb = min(xs), max(xs)
        xm = (xa + xb) / 2
        X = next((x for x in sorted(np.arange(xa, xb + 1e-9, 0.25), key=lambda x: abs(x - xm)) if shows(x, Y)), None)
        if X is not None: out.append((X, Y, local_angle(geom, X, Y, radius)))
    return out

def town_px(slug):
    lat, lon = next((la, lo) for s, _, la, lo in TOWNS if s == slug)
    return plane_x(lon) * SX, plane_y(lat) * SY

def anchors(geo, rasters):
    """Anchors in plane units, placed in order: the water labels, then the shields. A candidate may be picked only
    if it shows its feature on every raster the page may load: strictly on the lossless renders, and by the
    verify() rules on the encoded files (rasters: (image, lossless?) pairs)."""
    def on_feature(a): return all(shows(a, img, geo, strict) for img, strict in rasters)
    R = geo["routes"]
    us17 = on_route(R, ["US17", "US17BYP"])              # the US 17 mainline; 17 Bus is its own route
    us501, sc31, sc22 = on_route(R, ["US501"]), on_route(R, ["SC31"]), on_route(R, ["SC22"])
    lat = {s: la for s, _, la, _ in TOWNS}
    placed, report = [], []
    def water(label, ang): return lambda c: dict(type="water", label=label, x=c[0] / SX, y=c[1] / SY, angle=c[2] if ang is None else ang)
    def shield(label, kind, geom, order):
        def make(c):
            X, Y = mid_carriageway(geom, c[0], c[1])
            return dict(type="shield", label=label, kind=kind, x=X / SX, y=Y / SY, order=order)
        return make
    def place(name, cands, nominal, make):
        made = [a for a in (make(c) for c in cands) if on_feature(a)]
        if not made: raise SystemExit(f"no candidate for {name} shows on the rendered map")
        a, key = choose(made, nominal, placed)
        placed.append(a)
        report.append((name, key, a))

    # Atlantic Ocean: open water south-east of Myrtle Beach, level (the page may turn it along the coast)
    X, Y = plane_x(-78.72) * SX, plane_y(33.575) * SY
    place("Atlantic Ocean", [(X, Y, 0.0)], (X / SX, Y / SY), water("Atlantic Ocean", 0.0))
    # Intracoastal Waterway between Myrtle Beach and North Myrtle Beach, along the channel
    icw = unary_union(geo["named"]["Intracoastal Waterway"])
    cands = channel_points(icw, lat["myrtle-beach"], lat["north-myrtle-beach"], -78.80, 90,
                           lambda X, Y: on_feature(dict(type="water", label="Intracoastal Waterway", x=X / SX, y=Y / SY)))
    X, Y = cross_at_lat(icw, (lat["myrtle-beach"] + lat["north-myrtle-beach"]) / 2, -78.80)
    place("Intracoastal Waterway", cands, (X / SX, Y / SY), water("Intracoastal Waterway", None))
    # Waccamaw River south of Conway, along the channel
    wac = unary_union(geo["named"]["Waccamaw Riv"])
    cands = channel_points(wac, 33.64, 33.80, -79.06, 70,
                           lambda X, Y: on_feature(dict(type="water", label="Waccamaw River", x=X / SX, y=Y / SY)))
    X, Y = cross_at_lat(wac, 33.745, -79.06)
    place("Waccamaw River", cands, (X / SX, Y / SY), water("Waccamaw River", None))
    # SC 31 near Carolina Forest's latitude
    X, Y = cross_at_lat(sc31, lat["carolina-forest"], -78.85)
    pts = route_points(sc31)
    place("31", pts[np.hypot(pts[:, 0] - X, pts[:, 1] - Y) < 90], (X / SX, Y / SY), shield("31", "sc", sc31, 2))
    # US 17 near Myrtle Beach: the mainline (the bypass) within reach of the city's pin
    mb = np.array(town_px("myrtle-beach"))
    pts = route_points(us17)
    pts = pts[np.hypot(*(pts - mb).T) < 160]
    near = min(pts, key=lambda p: math.hypot(*(p - mb)))
    place("17 (Myrtle Beach)", pts, (near[0] / SX, near[1] / SY), shield("17", "us", us17, 0))
    # US 501 midway between Conway and Myrtle Beach
    pts, t = between(us501, town_px("conway"), town_px("myrtle-beach"), 0.2, 0.8)
    mid = pts[np.argmin(np.abs(t - 0.5))]
    place("501", pts, (mid[0] / SX, mid[1] / SY), shield("501", "us", us501, 1))
    # SC 22 midway along its length
    run = max(lines(linemerge(lines(sc22))), key=lambda l: l.length)
    pts = [(p.x, p.y) for p in (run.interpolate(f, normalized=True) for f in np.linspace(0.3, 0.7, 81))]
    place("22", pts, (pts[40][0] / SX, pts[40][1] / SY), shield("22", "sc", sc22, 3))
    # US 17 between Pawleys Island and Murrells Inlet
    X, Y = cross_at_lat(us17, (lat["pawleys-island"] + lat["murrells-inlet"]) / 2, -79.1)
    pts, t = between(us17, town_px("pawleys-island"), town_px("murrells-inlet"), 0.2, 0.8, off=60)
    place("17 (Pawleys to Murrells Inlet)", pts, (X / SX, Y / SY), shield("17", "us", us17, 4))

    log("  placement: overlaps and near misses, desktop (of 9 views) / other widths (of 18); plane units from the nominal spot")
    for name, (dh, oh, ds, os_, dist), a in report:
        lon, la = LON0 + a["x"] / (K * S), LAT1 - a["y"] / S
        log(f"    {name:32s} overlaps {dh:2d} / {oh:2d}  near {ds:2d} / {os_:2d}  {dist:6.1f}  at {la:.4f}, {lon:.4f}")
    shields = sorted([a for a in placed if a["type"] == "shield"], key=lambda a: a["order"])
    waters = [a for a in placed if a["type"] == "water"]
    return shields, waters, report

# ---- 6. checks ------------------------------------------------------------------
def hexrgb(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)

def at_px(a, img):
    """Where the page puts an anchor on this raster: its px, py percentages, rounded as the JSON rounds them."""
    h, w = img.shape[:2]
    return round(100 * a["x"] / W, 2) / 100 * w, round(100 * a["y"] / H, 2) / 100 * h

def colour_gap(img, X, Y, want, r):
    """Smallest colour distance to `want` among the pixels within r of the pixel that holds (X, Y)."""
    xi, yi = int(X), int(Y)
    patch = img[max(0, yi - r):yi + r + 1, max(0, xi - r):xi + r + 1].reshape(-1, 3).astype(float)
    return float(np.sqrt(((patch - hexrgb(want)) ** 2).sum(axis=1)).min())

def road_angle(geo, a):
    """Direction in degrees of the tier 1 road nearest an anchor."""
    route = geo["hwy_union"]
    q = nearest_points(route, Point(a["x"] * SX, a["y"] * SY))[0]
    seg = min(lines(route), key=lambda ls: ls.distance(q))
    d = seg.project(q)
    p0, p1 = seg.interpolate(max(0, d - 3)), seg.interpolate(min(seg.length, d + 3))
    return math.degrees(math.atan2(p1.y - p0.y, p1.x - p0.x))

def feature_test(a, img, geo, strict):
    """How an anchor sits on one raster: (passes, colour gap, road width, width needed). A water label needs a
    water pixel; a shield needs a tier 1 pixel on a run of road as wide as tier 1 (ramps share the blue at
    1.6 px). Verify allows one pixel of slack and a colour gap of 18; placement, on the lossless renders,
    wants the anchor's own pixel within 12 and 0.25 px more road."""
    X, Y = at_px(a, img)
    r, tol, extra = (0, 12, 0.25) if strict else (1, 18, 0.0)
    if a["type"] == "water":
        gap = colour_gap(img, X, Y, C["water"], 0 if a["label"] == "Atlantic Ocean" else r)
        return gap <= tol, gap, None, None
    if "road_angle" not in a: a["road_angle"] = road_angle(geo, a)
    gap = colour_gap(img, X, Y, C["hwy"], r)
    width, need = road_width(img, X, Y, a["road_angle"], C["hwy"]), (HWY_W - 1.2) * img.shape[1] / IMG_W
    return gap <= tol and width >= need + extra, gap, width, need

def shows(a, img, geo, strict): return feature_test(a, img, geo, strict)[0]

def road_width(img, X, Y, ang, want, tol=24):
    """Width in px of the run of road-coloured pixels across the road through (X, Y), sampled every 0.25 px
    along the normal to the road's direction `ang` (degrees)."""
    h, w = img.shape[:2]
    nx, ny = -math.sin(math.radians(ang)), math.cos(math.radians(ang))
    ts = np.arange(-6, 6.001, 0.25)
    xs, ys = X + ts * nx, Y + ts * ny
    xi, yi = np.clip(xs.astype(int), 0, w - 1), np.clip(ys.astype(int), 0, h - 1)
    hit = np.sqrt(((img[yi, xi].astype(float) - hexrgb(want)) ** 2).sum(axis=1)) <= tol
    mid = len(ts) // 2
    seg = [i for i in range(len(ts)) if hit[i]]
    if not seg: return 0.0
    c = min(seg, key=lambda i: abs(i - mid))                 # the run nearest the anchor
    a = b = c
    while a - 1 >= 0 and hit[a - 1]: a -= 1
    while b + 1 < len(ts) and hit[b + 1]: b += 1
    return (b - a + 1) * 0.25

def verify(img, plane, name, geo):
    """Sample a raster at the anchors exactly as the page will place them (px, py percentages): a shield on a
    tier 1 road, a water label on water, and open water all around the ocean label."""
    h, w = img.shape[:2]
    scale = w / IMG_W
    log(f"  {name} ({w}x{h})")
    ok = True
    for kind, items in (("shield", plane["shields"]), ("water", plane["water"])):
        for j in items:
            a = dict(j, type=kind, x=j["px"] / 100 * W, y=j["py"] / 100 * H)
            good, gap, width, need = feature_test(a, img, geo, strict=False)
            X, Y = at_px(a, img)
            road = f"; road {width:.2f} px wide, tier 1 needs {need:.2f}" if width is not None else ""
            log(f"    {'ok ' if good else 'BAD'} {kind} {j['label']:22s} at ({X:7.1f},{Y:7.1f}) colour off by {gap:4.1f}{road}")
            ok &= good
    # the ocean label needs open water all around it, level or turned along the coast
    a = plane["water"][0]
    X, Y = a["px"] / 100 * w, a["py"] / 100 * h
    P = plane["towns"]
    coast = math.degrees(math.atan2(P["little-river"]["y"] - P["pawleys-island"]["y"], P["little-river"]["x"] - P["pawleys-island"]["x"]))
    yy, xx = np.mgrid[0:h, 0:w]
    clear = True
    for ang in (0.0, coast):
        c, s = math.cos(math.radians(ang)), math.sin(math.radians(ang))
        u, v = (xx - X) * c + (yy - Y) * s, -(xx - X) * s + (yy - Y) * c
        win = img[(np.abs(u) <= 160 * scale) & (np.abs(v) <= 40 * scale)].astype(float)
        clear &= bool((np.sqrt(((win - hexrgb(C["water"])) ** 2).sum(axis=1)) < 8).all())
    log(f"    {'ok ' if clear else 'BAD'} open water around the Atlantic label (level and along the coast)")
    return ok and clear

def plane_json(shields, water):
    def pt(x, y): return {"x": round(x, 1), "y": round(y, 1), "px": round(100 * x / W, 2), "py": round(100 * y / H, 2)}
    return {
        "lon0": LON0, "lon1": LON1, "lat0": LAT0, "lat1": LAT1,
        "K": round(K, 9), "S": round(S, 6), "W": round(W, 3), "H": round(H, 3),
        "img": {"w": IMG_W, "h": IMG_H},
        "towns": {slug: {"n": n, **pt(plane_x(lon), plane_y(lat))} for slug, n, lat, lon in TOWNS},
        "shields": [{"label": a["label"], **pt(a["x"], a["y"]), "kind": a["kind"]} for a in shields],
        "water": [{"label": a["label"], **pt(a["x"], a["y"]), "angle": round(a["angle"], 1)} for a in water],
    }

# ---- main -----------------------------------------------------------------------
def main():
    global WORK
    ap = argparse.ArgumentParser()
    ap.add_argument("--work", default=WORK, help="download and scratch folder, outside the repo")
    args = ap.parse_args()
    WORK = os.path.abspath(args.work)
    repo = os.path.abspath(os.path.join(HP, "..", ".."))
    if os.path.commonpath([WORK, repo]) == repo:
        raise SystemExit("the work folder must be outside the repo")
    os.makedirs(WORK, exist_ok=True)
    os.makedirs(MEDIA, exist_ok=True)
    log(f"plane W={W:.3f} H={H:.3f} K={K:.9f} S={S:.6f}; raster {IMG_W}x{IMG_H}")

    geo = build()
    geo["hwy_union"] = unary_union(geo["roads"]["hwy"])
    svg = os.path.join(WORK, "strand-dark.svg")
    log("svg", round(write_svg(geo, svg) / 1e6, 2), "MB")

    jobs = [(os.path.join(WORK, f"strand-dark-{w}.png"), w, round(w * IMG_H / IMG_W)) for w, _ in SIZES]
    log("render", ", ".join(f"{w}x{h}" for _, w, h in jobs))
    render(svg, jobs)

    log("encode")
    names = [f"strand-dark-{w}.{ext}" for w, _ in SIZES for ext in ("avif", "webp")]
    for (w, limit), (png, _, _) in zip(SIZES, jobs):
        avif = os.path.join(WORK, f"strand-dark-{w}.avif")
        webp = os.path.join(WORK, f"strand-dark-{w}.webp")
        crf, asize, adb, cap = pick_avif(png, avif, limit)
        q, wsize, wdb = pick_webp(png, webp, adb, 2 * asize - 1)
        log(f"  {w}: 4:2:0 ceiling {cap:.2f} dB; avif crf {crf} = {asize:,} B, {adb:.2f} dB (limit {limit:,}); "
            f"webp quality {q} = {wsize:,} B, {wdb:.2f} dB ({wsize / asize:.2f}x the avif)")

    # the anchors go only where every raster the page may load shows their feature, as ffmpeg decodes it
    # and as Chromium does (the two upsample 4:2:0 colour differently, which matters on a 2 px waterway)
    log("decode the encoded files in Chromium")
    seen = decode_in_chromium([os.path.join(WORK, n) for n in names])
    rasters = [(os.path.basename(png), read_rgb(png), True) for png, _, _ in jobs] + \
              [(n + ", ffmpeg", read_rgb(os.path.join(WORK, n)), False) for n in names] + \
              [(n + ", Chromium", read_rgb(c), False) for n, c in zip(names, seen)]
    log("anchors")
    shields, water, _ = anchors(geo, [(img, strict) for _, img, strict in rasters])
    plane = plane_json(shields, water)
    log("verify the lossless renders and the encoded files, decoded by ffmpeg and by Chromium")
    if not all([verify(img, plane, n, geo) for n, img, _ in rasters]):
        raise SystemExit("an anchor missed its feature")

    # what a browser decodes, for a person to look at
    subprocess.run([FFMPEG, "-v", "error", "-y", "-i", os.path.join(WORK, "strand-dark-2048.avif"),
                    os.path.join(WORK, "preview-2048.png")], check=True)
    log("preview", os.path.join(WORK, "preview-2048.png"))

    # only now touch the repo
    for n in names:
        with open(os.path.join(WORK, n), "rb") as src, open(os.path.join(MEDIA, n), "wb") as dst: dst.write(src.read())
    with open(PLANE_JSON, "w") as fh: fh.write(json.dumps(plane, indent=1) + "\n")
    for f in [os.path.join(MEDIA, n) for n in names] + [PLANE_JSON]:
        log(f"wrote {os.path.relpath(f, repo)} ({os.path.getsize(f):,} B)")

if __name__ == "__main__":
    main()
