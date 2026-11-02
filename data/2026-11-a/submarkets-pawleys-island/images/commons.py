"""Add the Wikimedia Commons photos used by /submarkets/pawleys-island/ (fix round 1) to photos.json.
Run after records.py (which writes the NAIP record):
  python3 -I commons.py <dir with the downloaded Commons files> <website chapter3realty dir>
Each file was downloaded from Commons (1920 px thumbnail, or the original when it is smaller), looked at full
size by the fixer on 2026-11-02, and saved here as WebP at 600 and 1200 px wide. The files are not cut: the
page crops with the browser, and the credits block says so. Licence facts are copied from each file page
(Commons API extmetadata and wikitext, read 2026-11-02)."""
import json, os, sys
from PIL import Image
src, site = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
B = 'images/2026-11-a/submarkets-pawleys-island/'
OUT = os.path.join(site, B)
SA4 = ('CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/')
SA3 = ('CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/')
CC0 = ('CC0', 'https://creativecommons.org/publicdomain/zero/1.0/')
P = [
    {'in': 'MarshwalkwayPawleysjp.jpg', 'fn': 'pawleys-island-marsh-walkway', 'page': 'https://commons.wikimedia.org/wiki/File:Marsh_walkway_Pawleys.jpg',
     'author': 'Phoebe', 'lic': SA4, 'taken': '2019-07-28', 'orig': '3024x4032',
     'title': 'Marsh walkway Pawleys',
     'commons_desc': 'Walkway into the marsh on the intercoastal side, Pawleys Island South Carolina, July 2019',
     'what': 'A wooden walkway with a small roofed platform runs out over the salt marsh to a tidal creek, with marsh grass, trees and a road behind.',
     'caption': 'A walkway and a covered platform over the creek on the marsh side of Pawleys Island.',
     'alt': 'A wooden walkway with a small roofed platform over a tidal creek and marsh grass on Pawleys Island'},
    {'in': 'StillStandingpreHurr.jpg', 'fn': 'pawleys-island-old-house-still-standing', 'page': 'https://commons.wikimedia.org/wiki/File:Still_Standing_(pre-Hurricane_Hugo_home,_Pawleys_Island,_South_Carolina_-_18_July_2006).jpg',
     'author': 'Pollinator', 'lic': SA3, 'taken': '2006-07-18', 'orig': '1800x1204',
     'title': 'Still Standing (pre-Hurricane Hugo home, Pawleys Island, South Carolina - 18 July 2006)',
     'commons_desc': 'An "arrogantly shabby" surviving home from pre-Hurricane Hugo (1989) days. Pawley\'s Island, South Carolina.',
     'what': None, 'caption': None, 'alt': None},
    {'in': 'PawleysIslandNorthEnd.jpg', 'fn': 'pawleys-island-north-end', 'page': 'https://commons.wikimedia.org/wiki/File:Pawleys_Island_North_End.jpg',
     'author': 'Phoebe', 'lic': SA4, 'taken': '2023-07-28', 'orig': '4032x3024',
     'title': 'Pawleys Island North End',
     'commons_desc': "North end of Pawley's Island at low tide, July 2023",
     'what': None, 'caption': None, 'alt': None},
]
LOOKED = json.load(open(os.path.join(here, 'commons-looked.json'))) if os.path.exists(os.path.join(here, 'commons-looked.json')) else {}
recs = []
for p in P:
    f = os.path.join(src, p['in'])
    look = LOOKED.get(p['fn'], {})
    what, caption, alt = p['what'] or look.get('what'), p['caption'] or look.get('caption'), p['alt'] or look.get('alt')
    if not (os.path.exists(f) and what and caption and alt):
        print('skip', p['fn'], '(no file, or not looked at yet)'); continue
    im = Image.open(f).convert('RGB')
    if im.size[0] < 1200: raise SystemExit(f"{p['fn']} is under 1200 px wide")
    sizes = {}
    for w in (600, 1200):
        h = round(w * im.size[1] / im.size[0])
        im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, f"{p['fn']}-{w}w.webp"), quality=80, method=6)
        sizes[w] = h
    name, url = p['lic']
    sa = 'BY-SA' in name
    recs.append({'slug': 'submarkets-pawleys-island', 'file': f"{B}{p['fn']}-1200w.webp",
                 'variants': {'600': f"{B}{p['fn']}-600w.webp", '1200': f"{B}{p['fn']}-1200w.webp"},
                 'width': 1200, 'height': sizes[1200], 'title': p['title'], 'what': what, 'caption': caption, 'alt': alt,
                 'place': {'city': 'Pawleys Island'}, 'source': p['page'], 'source_name': 'Wikimedia Commons', 'commons_page': p['page'],
                 'author': p['author'], 'license': name, 'license_url': url,
                 'credit': f"Photo: {p['author']}, {name}, via Wikimedia Commons" if name != 'CC0' else f"Photo: {p['author']}, CC0, via Wikimedia Commons",
                 'provenance': 'own work', 'taken': p['taken'], 'original_size': p['orig'], 'share_alike': sa,
                 'commons_description': p['commons_desc'],
                 'subject_check': f"Looked at full size by the fixer of /submarkets/pawleys-island/ on 2026-11-02. It shows: {what} No person as the subject; no readable sign, plate or house number at page size.",
                 'changes': 'Resized and saved as WebP by Chapter3 Realty; the file is not cut. The page crops it with the browser.'})
pj = os.path.join(here, '..', 'photos.json')
d = json.load(open(pj))
keep = [r for r in d['photos'] if not any(r['file'] == n['file'] for n in recs)]
d['photos'] = keep + recs
json.dump(d, open(pj, 'w'), indent=1)
print('ok', [r['file'] for r in recs])
