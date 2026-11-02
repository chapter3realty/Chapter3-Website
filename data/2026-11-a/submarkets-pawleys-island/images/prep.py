"""Make the page's image files from the NAIP exports (naip.py) for /submarkets/pawleys-island/.
  overview: the map base (the SVG map in the spec draws on it), 1000 px wide.
  south:    the setback inset base, cut to CROP_SOUTH (pixels of the 1800 px export), 900 px wide.
  middle:   the labelled close-up of the island at the North Causeway, cut to 4:3, labels placed from
            coordinates (a road label snaps to the road in map-layers.geojson), 600w and 1200w, and an
            unlabelled copy for the share-image crops.
Usage: python3 -I prep.py <dir with *-raw.jpg> <website chapter3realty dir>"""
import json, math, os, sys
from PIL import Image, ImageDraw, ImageFont
src, site = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(site, 'images', '2026-11-a', 'submarkets-pawleys-island')
FR = json.load(open(os.path.join(here, 'naip-frames.json')))
G = json.load(open(os.path.join(here, '..', 'map-layers.geojson')))
R = 6378137; mx = lambda lo: R * math.radians(lo); my = lambda la: R * math.log(math.tan(math.pi / 4 + math.radians(la) / 2))
ilo = lambda x: math.degrees(x / R); ila = lambda y: math.degrees(2 * math.atan(math.exp(y / R)) - math.pi / 2)
CROP_SOUTH = (650, 250, 1500, 1150)
CROP_MIDDLE = (0, 0, 1644, 1233)
info = {}
# overview
im = Image.open(os.path.join(src, 'overview-raw.jpg')).convert('RGB')
im.resize((1000, round(1000 * im.size[1] / im.size[0])), Image.LANCZOS).save(os.path.join(OUT, 'pawleys-area-aerial-1000.webp'), quality=72, method=6)
info['overview'] = {'file': 'pawleys-area-aerial-1000.webp', 'frame_px': list(im.size), 'bbox_wgs84': FR['overview']['bbox_wgs84']}
# south
im = Image.open(os.path.join(src, 'south-raw.jpg')).convert('RGB')
c = im.crop(CROP_SOUTH); c.resize((1000, round(1000 * c.size[1] / c.size[0])), Image.LANCZOS).save(os.path.join(OUT, 'pawleys-south-end-aerial-1000.webp'), quality=74, method=6)
info['south'] = {'file': 'pawleys-south-end-aerial-1000.webp', 'frame_px': list(im.size), 'crop_px': list(CROP_SOUTH), 'bbox_wgs84': FR['south']['bbox_wgs84']}
# middle
im = Image.open(os.path.join(src, 'middle-raw.jpg')).convert('RGB')
w, s, e, n = FR['middle']['bbox_wgs84']; W, H = im.size
P = lambda lo, la: ((mx(lo) - mx(w)) / (mx(e) - mx(w)) * W - CROP_MIDDLE[0], (my(n) - my(la)) / (my(n) - my(s)) * H - CROP_MIDDLE[1])
im = im.crop(CROP_MIDDLE); im.save(os.path.join(src, 'middle-unlabelled.png'))
Wd, Hd = im.size; sc = Wd / 2400
ROADNAME = {'North Causeway': 'North Causeway Rd'}
road = lambda name: [c for f in G['features'] if f['properties'].get('name') == ROADNAME.get(name, name) for l in f['geometry']['coordinates'] for c in l]
LAB = [('North Causeway', 'road', (-79.1238, 33.4340)), ('Salt marsh', -79.1255, 33.4302, 'it'), ('Atlantic Ocean', -79.1175, 33.4300, 'it'),
       ('Pawleys Island', -79.1181, 33.4343, 'b'), ('Mainland', -79.1255, 33.4362, 'b')]
FB = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'; FI = '/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'
rec = []
for L in LAB:
    text = L[0]
    if L[1] == 'road':
        pts = road(text); tx, ty = P(*L[2])
        best = min(range(len(pts)), key=lambda i: (P(*pts[i])[0] - tx) ** 2 + (P(*pts[i])[1] - ty) ** 2)
        a, b = pts[max(0, best - 1)], pts[min(len(pts) - 1, best + 1)]
        (x1, y1), (x2, y2) = P(*a), P(*b); ang = math.degrees(math.atan2(-(y2 - y1), x2 - x1))
        if ang > 90: ang -= 180
        if ang < -90: ang += 180
        lo, la = pts[best]; x, y = P(lo, la); style = 'b'
    else:
        lo, la, style = L[1], L[2], L[3]; x, y = P(lo, la); ang = 0
    font = ImageFont.truetype(FI if style == 'it' else FB, int(128 * sc))
    tw, th = font.getbbox(text)[2:]; pad = int(24 * sc)
    layer = Image.new('RGBA', (tw + 2 * pad, th + 2 * pad), (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    d.text((pad, pad), text, font=font, fill=(255, 255, 255, 255), stroke_width=int(14 * sc), stroke_fill=(20, 28, 34, 215))
    if ang: layer = layer.rotate(ang, expand=True, resample=Image.BICUBIC)
    ox, oy = int(x - layer.size[0] / 2), int(y - layer.size[1] / 2)
    if not (0 <= ox and ox + layer.size[0] <= Wd and 0 <= oy and oy + layer.size[1] <= Hd): raise SystemExit(f'{text} runs off the frame')
    im.paste(layer, (ox, oy), layer)
    rec.append({'label': text, 'lon': round(lo, 6), 'lat': round(la, 6), 'how': 'road vertex, map-layers.geojson' if L[1] == 'road' else 'given point'})
im.save(os.path.join(src, 'middle-labelled.png'))
for wpx in (600, 1200):
    im.resize((wpx, round(wpx * Hd / Wd)), Image.LANCZOS).save(os.path.join(OUT, f'pawleys-island-at-the-north-causeway-{wpx}w.webp'), quality=78, method=6)
cb = [ilo(mx(w) + CROP_MIDDLE[0] / W * (mx(e) - mx(w))), s, e, n]
info['middle'] = {'labels': rec, 'crop_px': list(CROP_MIDDLE), 'size': [Wd, Hd], 'bbox_wgs84': [round(v, 6) for v in cb]}
json.dump(info, open(os.path.join(here, 'images.json'), 'w'), indent=1)
print(json.dumps(info, indent=1))
