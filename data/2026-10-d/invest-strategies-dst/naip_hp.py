# Haven Pointe at Carolina Forest (RK HAVEN POINTE AT CAROLINA FOREST DST, land use 211) from the USGS NAIP service, 2023.
import sys, json, math, urllib.parse, urllib.request
PARC, OUTPNG, OUTJSON = sys.argv[1:4]
d = json.load(open(PARC))
f = [f for f in d["features"] if "HAVEN POINTE" in f["attributes"]["OwnerName"] and f["attributes"]["LandUseCode"] == "211"][0]
ring = f["geometry"]["rings"][0]
R = 6378137.0
merc = lambda lon, lat: (math.radians(lon) * R, math.log(math.tan(math.pi / 4 + math.radians(lat) / 2)) * R)
pts = [merc(x, y) for x, y in ring]
xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
w = (max(xs) - min(xs)) * 1.18; h = (max(ys) - min(ys)) * 1.18
if w / h > 4 / 3: h = w * 3 / 4
else: w = h * 4 / 3
bbox = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]
mosaic = {"mosaicMethod": "esriMosaicAttribute", "sortField": "Year", "sortValue": "2050", "ascending": True, "where": "Year=2023"}
q = {"bbox": ",".join(map(str, bbox)), "bboxSR": 3857, "imageSR": 3857, "size": "2400,1800", "format": "png", "pixelType": "U8",
     "interpolation": "RSP_CubicConvolution", "noData": "", "compression": "", "mosaicRule": json.dumps(mosaic), "f": "image",
     "renderingRule": json.dumps({"rasterFunction": "None"}), "bandIds": "0,1,2"}
url = "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?" + urllib.parse.urlencode(q)
urllib.request.urlretrieve(url, OUTPNG)
px = [((x - bbox[0]) / w * 2400, (bbox[3] - y) / h * 1800) for x, y in pts]
inv = lambda X, Y: (math.degrees(X / R), math.degrees(2 * math.atan(math.exp(Y / R)) - math.pi / 2))
json.dump({"url": url, "bbox3857": bbox, "bbox_wgs84": [*inv(bbox[0], bbox[1]), *inv(bbox[2], bbox[3])], "ring_px": px,
           "m_per_px_2400": w / 2400 * math.cos(math.radians(33.7645))}, open(OUTJSON, "w"), indent=1)
print(url); print("m/px", w / 2400 * math.cos(math.radians(33.7645)))
