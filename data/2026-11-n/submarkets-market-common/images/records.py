"""Write photos.json for /submarkets/myrtle-beach/market-common/: the Commons photos the page shows.
Usage: python3 -I records.py <dir with hero.jpg and warbird.jpg> <website chapter3realty dir>
hero.jpg: Commons 3840 px thumbnail of the panorama, cut to 3:2 at x 1880 (no car plates, no shop sign as the
subject); the 600w and 1200w files and the share crops were made with tools/photos.js variants and crops.
warbird.jpg: the Commons original (2560 x 1706). Licence facts copied from each file page (Commons API, read
2026-11-08 by the verifier, VERIFY.md "Photos"). Looked at full size by the writer on 2026-11-08."""
import json, os, sys
from PIL import Image
src, site = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__)); data = os.path.dirname(here)
B = 'images/2026-11-n/submarkets-market-common/'
SA4 = ('CC BY-SA 4.0', 'https://creativecommons.org/licenses/by-sa/4.0/')
SA3 = ('CC BY-SA 3.0', 'https://creativecommons.org/licenses/by-sa/3.0/')
P = [
  {'in': 'hero.jpg', 'fn': 'market-common-town-center-homes-over-shops', 'made': True,
   'page': 'https://commons.wikimedia.org/wiki/File:Panorama_of_The_Market_Common,_Myrtle_Beach_(May_2023)_01.jpg',
   'author': 'DiscoA340', 'lic': SA4, 'taken': '2023-05-13', 'orig': '9120x2800 (panorama; cut to 3:2)',
   'title': 'Panorama of The Market Common, Myrtle Beach (May 2023) 01',
   'what': 'A four-story building in The Market Common town center: shops on the brick ground floor, three floors of homes with balconies above, a corner tower with a cupola, street trees and a flower bed at a corner of the street.',
   'caption': 'Homes over the shops in the town center. These apartments are rented by the year, not sold.',
   'alt': 'A four-story building with shops on the ground floor and apartments with balconies above, on a street in The Market Common',
   'crops': True},
  {'in': 'warbird.jpg', 'fn': 'market-common-warbird-park', 'made': False,
   'page': 'https://commons.wikimedia.org/wiki/File:WarbirdPark.jpg',
   'author': 'Erechtheus', 'lic': SA3, 'taken': '2006-08-01', 'orig': '2560x1706',
   'title': 'WarbirdPark',
   'what': 'Warbird Park on Farrow Parkway: an A-10 attack plane seen from behind, with its two engines and twin tail, the nose of an A-7 at right, three flagpoles, a brick plaza and trees.',
   'caption': 'Warbird Park on Farrow Parkway: an A-10, the kind of attack plane the base flew, and an A-7 beside it.',
   'alt': 'An A-10 jet seen from behind and an A-7 jet beside it, on display on a brick plaza with flags at Warbird Park',
   'crops': False},
  {'in': 'lake.jpg', 'fn': 'market-common-grand-park-lake', 'made': False,
   'page': 'https://commons.wikimedia.org/wiki/File:The_Market_Common,_Myrtle_Beach_(13_May_2023)_35.jpg',
   'author': 'DiscoA340', 'lic': SA4, 'taken': '2023-05-13', 'orig': '6000x4000 (Commons 1920 px thumbnail)',
   'title': 'The Market Common, Myrtle Beach (13 May 2023) 35',
   'what': 'The lake in Grand Park at The Market Common in the evening, with a lawn and trees along its shore.',
   'caption': "The lake in Grand Park, beside the town center's shops. It has a 1.1-mile path around it.",
   'alt': 'The lake and lawn at Grand Park in The Market Common in the evening',
   'crops': False},
]
recs = []
for p in P:
    f = os.path.join(src, p['in'])
    try: Image.open(f).verify()
    except Exception: print('skip', p['fn'], '(no image file yet)'); continue
    if not p['made']:
        im = Image.open(f).convert('RGB')
        for w in (600, 1200):
            h = round(w * im.size[1] / im.size[0])
            im.resize((w, h), Image.LANCZOS).save(os.path.join(site, B, f"{p['fn']}-{w}w.webp"), quality=80, method=6)
    h1200 = Image.open(os.path.join(site, B, f"{p['fn']}-1200w.webp")).size[1]
    name, url = p['lic']
    r = {'slug': 'submarkets-market-common', 'file': f"{B}{p['fn']}-1200w.webp",
         'variants': {'600': f"{B}{p['fn']}-600w.webp", '1200': f"{B}{p['fn']}-1200w.webp"},
         'width': 1200, 'height': h1200, 'title': p['title'], 'what': p['what'], 'caption': p['caption'], 'alt': p['alt'],
         'place': {'city': 'Myrtle Beach', 'sublocation': 'The Market Common'}, 'source': p['page'], 'source_name': 'Wikimedia Commons',
         'commons_page': p['page'], 'author': p['author'], 'license': name, 'license_url': url,
         'credit': f"Photo: {p['author']}, {name}, via Wikimedia Commons", 'provenance': 'own work', 'taken': p['taken'],
         'original_size': p['orig'], 'share_alike': True,
         'subject_check': "Looked at full size by the writer on 2026-11-08: " + p['what'] + " No person as the subject; no readable plate or house number at page size; no sign is the subject."}
    if p['crops']:
        r['crops'] = {k: {'path': f"{B}{p['fn']}-{k}.webp", 'width': 1200, 'height': hh} for k, hh in (('1x1', 1200), ('4x3', 900), ('16x9', 675))}
        r['crop_note'] = 'Crops cut from the center of the 3:2 photo (enlarged 2 percent to 1,200 px tall) by tools/photos.js crops.'
    recs.append(r)
json.dump({'photos': recs}, open(os.path.join(data, 'photos.json'), 'w'), indent=1)
print([r['file'] for r in recs])
