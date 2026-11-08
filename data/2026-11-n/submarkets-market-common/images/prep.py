"""Make the two aerial map backgrounds for /submarkets/myrtle-beach/market-common/ from the NAIP exports
(naip.py), and a check image of every layer drawn on each, for the writer to look at full size.
Usage: python3 -I prep.py <dir with area-raw.jpg, noise-raw.jpg> <website chapter3realty dir> <check dir>"""
import json, math, os, sys
from PIL import Image, ImageDraw
src, site, chk = sys.argv[1:4]
here = os.path.dirname(os.path.abspath(__file__)); data = os.path.dirname(here)
B = 'images/2026-11-n/submarkets-market-common/'
FR = json.load(open(os.path.join(here, 'naip-frames.json')))
LAY = json.load(open(os.path.join(data, 'map-layers.geojson')))['features']
NOI = json.load(open(os.path.join(data, 'map-noise.geojson')))['features']
R = 6378137; mx = lambda lo: R*math.radians(lo); my = lambda la: R*math.log(math.tan(math.pi/4+math.radians(la)/2))
def rings(g):
    if g['type'] == 'Polygon': return [g['coordinates'][0]]
    return [p[0] for p in g['coordinates']]
out = {}
for k, width in (('area', 1600), ('noise', 1200)):
    w, s, e, n = FR[k]['bbox_wgs84']; W, H = FR[k]['size']
    P = lambda lo, la: ((mx(lo)-mx(w))/(mx(e)-mx(w))*W, (my(n)-my(la))/(my(n)-my(s))*H)
    im = Image.open(os.path.join(src, f'{k}-raw.jpg')).convert('RGB')
    h = round(width*H/W)
    im.resize((width, h), Image.LANCZOS).save(os.path.join(site, B, f'market-common-{k}-aerial.webp'), quality=78, method=6)
    out[k] = {'file': f'market-common-{k}-aerial.webp', 'frame_px': [W, H], 'bbox_wgs84': [w, s, e, n], 'file_px': [width, h]}
    c = im.copy(); d = ImageDraw.Draw(c)
    for f in LAY:
        col = {'district': (255, 255, 0), 'hood': (255, 255, 255)}[f['properties']['layer']]
        for r in rings(f['geometry']): d.line([P(*p) for p in r], fill=col, width=3)
    for f in NOI:
        for r in rings(f['geometry']): d.line([P(*p) for p in r], fill=(255, 80, 0), width=4)
    for lo, la in ((-78.931514, 33.692522), (-78.925131, 33.666958)): x, y = P(lo, la); d.ellipse([x-8, y-8, x+8, y+8], outline=(255, 0, 255), width=4)
    c.save(os.path.join(chk, f'check-{k}.jpg'), quality=85)
json.dump(out, open(os.path.join(here, 'images.json'), 'w'), indent=1)
print(json.dumps(out))
