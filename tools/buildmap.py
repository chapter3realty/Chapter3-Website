"""Build the Grand Strand satellite base image and project the ZIP polygons onto it.
Imagery: USGS National Map "USGSImageryOnly" (public domain, U.S. Geological Survey).
Boundaries: Census TIGERweb 2020 ZIP Code Tabulation Areas (public domain).
Output: grand-strand.jpg (the base) and map-shapes.json (polygons in image pixels)."""
import json, math, io, urllib.request, concurrent.futures as cf
from PIL import Image, ImageEnhance

Z = 12
TILE = "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}"
shapes = json.load(open("zcta.json"))

def x_of(lon, z): return (lon + 180.0) / 360.0 * (2 ** z)
def y_of(lat, z):
    r = math.radians(lat)
    return (1.0 - math.asinh(math.tan(r)) / math.pi) / 2.0 * (2 ** z)

pts = [p for ring in shapes.values() for p in ring]
W_LON, E_LON = min(p[0] for p in pts), max(p[0] for p in pts)
S_LAT, N_LAT = min(p[1] for p in pts), max(p[1] for p in pts)
PAD = 0.012
W_LON -= PAD; E_LON += PAD; S_LAT -= PAD; N_LAT += PAD

fx0, fx1 = x_of(W_LON, Z), x_of(E_LON, Z)
fy0, fy1 = y_of(N_LAT, Z), y_of(S_LAT, Z)
tx0, tx1 = math.floor(fx0), math.floor(fx1)
ty0, ty1 = math.floor(fy0), math.floor(fy1)
cols, rows = tx1 - tx0 + 1, ty1 - ty0 + 1
print(f"zoom {Z}: {cols} x {rows} = {cols*rows} tiles -> {cols*256} x {rows*256} px")

def fetch(args):
    tx, ty = args
    url = TILE.format(z=Z, x=tx, y=ty)
    for attempt in range(3):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 chapter3realty map build"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return (tx, ty, r.read())
        except Exception as e:
            if attempt == 2: print("  tile fail", tx, ty, e)
    return (tx, ty, None)

jobs = [(tx, ty) for ty in range(ty0, ty1 + 1) for tx in range(tx0, tx1 + 1)]
canvas = Image.new("RGB", (cols * 256, rows * 256), (16, 24, 32))
ok = 0
with cf.ThreadPoolExecutor(max_workers=8) as ex:
    for tx, ty, data in ex.map(fetch, jobs):
        if not data: continue
        canvas.paste(Image.open(io.BytesIO(data)).convert("RGB"), ((tx - tx0) * 256, (ty - ty0) * 256))
        ok += 1
print(f"fetched {ok}/{len(jobs)} tiles")

# crop to the exact bounding box
left = int(round((fx0 - tx0) * 256)); top = int(round((fy0 - ty0) * 256))
right = int(round((fx1 - tx0) * 256)); bottom = int(round((fy1 - ty0) * 256))
img = canvas.crop((left, top, right, bottom))
print("cropped:", img.size)

OUT_W = 1400
img = img.resize((OUT_W, int(round(img.height * OUT_W / img.width))), Image.LANCZOS)
# quiet the imagery so the coloured overlay and labels carry the page
img = ImageEnhance.Color(img).enhance(0.62)
img = ImageEnhance.Brightness(img).enhance(0.80)
img = ImageEnhance.Contrast(img).enhance(0.95)
img.save("grand-strand.jpg", quality=76, optimize=True, progressive=True)
print("saved grand-strand.jpg", img.size, round(len(open("grand-strand.jpg","rb").read())/1024), "KB")

# project + simplify the polygons into this image's pixel space
IW, IH = img.size
def to_px(lon, lat):
    return ((x_of(lon, Z) - fx0) / (fx1 - fx0) * IW, (y_of(lat, Z) - fy0) / (fy1 - fy0) * IH)

def rdp(points, eps):
    if len(points) < 3: return points
    a, b = points[0], points[-1]
    dx, dy = b[0]-a[0], b[1]-a[1]
    n = math.hypot(dx, dy)
    idx, far = 0, -1.0
    for i in range(1, len(points)-1):
        p = points[i]
        d = abs(dy*p[0] - dx*p[1] + b[0]*a[1] - b[1]*a[0]) / n if n else math.hypot(p[0]-a[0], p[1]-a[1])
        if d > far: idx, far = i, d
    if far > eps:
        return rdp(points[:idx+1], eps)[:-1] + rdp(points[idx:], eps)
    return [a, b]

out = {}
for zipcode, ring in shapes.items():
    px = [to_px(lon, lat) for lon, lat in ring]
    simp = rdp(px, 2.2)
    out[zipcode] = [[round(x, 1), round(y, 1)] for x, y in simp]
    print(f"  {zipcode}: {len(ring)} -> {len(simp)} points")
json.dump({"width": IW, "height": IH, "bbox": [W_LON, S_LAT, E_LON, N_LAT], "zips": out}, open("map-shapes.json", "w"))
print("saved map-shapes.json")
