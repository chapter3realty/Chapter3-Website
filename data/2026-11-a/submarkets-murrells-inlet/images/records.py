"""Licence records for the photos on /submarkets/murrells-inlet/ (writes ../photos.json).
Run in the scratch folder that holds labels.json and naip-frames.json: python3 -I records.py"""
import json, os
D='/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/web2'
HERE=os.path.dirname(os.path.abspath(__file__))
LB=json.load(open('labels.json')); FR=json.load(open('naip-frames.json'))
SLUG='submarkets-murrells-inlet'; B=f'images/2026-11-a/{SLUG}/'
INFO={
 'creek':('murrells-inlet-marshwalk-from-above','The MarshWalk from above',
   'The MarshWalk from above: restaurants along the boardwalk at the edge of the inlet, Business 17 behind them, and salt marsh islands in the creek.',
   'Aerial photo of the MarshWalk in Murrells Inlet, labelled: restaurant buildings and decks along a boardwalk at the edge of the inlet, Business 17 behind them, marsh islands in the creek and a marina with boats at the bottom',
   'Murrells Inlet','The MarshWalk, Business 17',
   'Restaurant buildings and decks line a boardwalk along the inlet; Business 17 runs behind them; marsh islands and the tidal creek fill the right side; a marina with boats and a long pier are at the bottom. The MarshWalk dot is OpenStreetMap way 930398329.'),
 'horry':('murrells-inlet-horry-side-from-above','Houses around the Indigo Creek golf course from above',
   'The Horry side from above: houses on curving streets beside the ponds and fairways of the Indigo Creek golf course.',
   'Aerial photo of the Horry side of Murrells Inlet: houses on curving streets and cul-de-sacs beside golf fairways, sand bunkers, ponds and woods, with rows of townhouses at the lower left',
   'Murrells Inlet','Indigo Creek, Horry County',
   'Houses on curving streets and cul-de-sacs, golf fairways with sand bunkers and greens, ponds and strips of woods, and rows of townhouses at the lower left. The OpenStreetMap point for Indigo Creek Golf Club (-79.02909, 33.60678) is inside the frame.'),
 'river':('murrells-inlet-wacca-wache-landing-from-above','Wacca Wache Landing on the Waccamaw River from above',
   'Wacca Wache Landing on the Waccamaw River, with a marina beside it, on the Georgetown side west of the bypass.',
   'Aerial photo of the Waccamaw River off Wachesaw Road, labelled: the dark river, Wacca Wache Landing on its bank, a marina basin full of boats, and woods and buildings around it',
   'Murrells Inlet','Wacca Wache Landing, Wachesaw Road, Georgetown County',
   'The wide dark Waccamaw River at left; a marina basin with boat slips and a boat storage building; the landing dot at the county layer point; woods, condo buildings and tennis courts at the lower right.'),
 'between':('murrells-inlet-between-the-roads-from-above','Streets of houses between the US 17 bypass and Business 17 from above',
   'Between the US 17 bypass and Business 17 from above: streets of houses, with a loop street of newer houses in the middle and shops along the bypass at the left.',
   'Aerial photo of Murrells Inlet, labelled: the US 17 bypass at the left with shops along it, Business 17 at the right, and streets of houses between them, with a loop street of newer houses in the middle',
   'Murrells Inlet','Between the US 17 bypass and US 17 Business, Georgetown County',
   'The four-lane US 17 bypass at the left with a gas station, shops and parking lots along it; Business 17 at the right; between them streets of houses under trees, a loop street of newer houses in the middle, and a road crossing from the bypass toward Business 17; a large building with an orange roof at the bottom. Re-cut on 2026-11-03 so the frame is centred on the houses, not the work buildings to the south.'),
 'docks':('murrells-inlet-creek-front-docks-from-above','Creek-front houses with docks from above',
   'Houses on the creek side of Business 17 from above, with docks reaching out over the marsh edge to the creek.',
   'Aerial photo of creek-front houses in Murrells Inlet, labelled: Business 17 at the left, houses under live oaks, and wooden docks running from the yards out to the tidal creek, with salt marsh islands beyond',
   'Murrells Inlet','The creek side of Business 17, Georgetown County',
   'Business 17 at the left with shops along it; houses under large trees between the road and the creek; several wooden docks with floating platforms on the creek; salt marsh islands at the right.'),
}
NAIP=dict(source='https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer',source_name='The National Map (USGS)',
  author='USDA Farm Service Agency, NAIP',author_type='Organization',license='Public domain',license_url='https://www.fsa.usda.gov/help/policies-and-links/',
  provenance='U.S. government aerial photo: USDA National Agriculture Imagery Program (NAIP), South Carolina 2023, natural color, 60 cm. Exported by Chapter3 from the USGS National Map NAIP image service (exportImage, Web Mercator, cubic resampling, mosaic locked to Year=2023) on 2026-11-02; the exact request is in source_request.',
  license_note='Same source and terms as the batch 2026-10-b and Garden City NAIP records: The National Map offers "free downloads of public domain, NAIP compressed orthoimagery"; the USDA FSA policy page says public domain information "may be freely distributed or copied, but use of appropriate byline/photo/image credits is requested."',
  terms_urls=['https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer','https://www.fsa.usda.gov/help/policies-and-links/'],
  taken='2023',display_credit='U.S. government aerial photo',
  credit='Photo: USDA Farm Service Agency, NAIP, public domain, via The National Map (USGS). Labels by Chapter3 Realty.',digital_source_type='composite')
out=[]
for k,(fn,title,cap,alt,city,sub,shows) in INFO.items():
  r={'slug':SLUG,'file':f'{B}{fn}-1200w.webp','variants':{'600':f'{B}{fn}-600w.webp','1200':f'{B}{fn}-1200w.webp'},'width':1200,'height':900,
     'title':title,'what':f'{title} (USDA NAIP aerial photo, 2023): {shows}','caption':cap,'alt':alt,'place':{'city':city,'sublocation':sub}}
  r.update(NAIP)
  labs=LB[k]['labels']
  r['changes']='Chapter3 Realty cut this view from the NAIP service'+(' and added labels placed from map data' if labs else '')
  if not labs: r['credit']='Photo: USDA Farm Service Agency, NAIP, public domain, via The National Map (USGS).'
  r['labels']=[l['label'] for l in labs]
  r['annotation_sources']={l['label']:f"{l['how']} ({l['lon']}, {l['lat']}); label_naip.py" for l in labs}
  r['source_request']=FR[k]['url']; r['frame']={'bbox_wgs84':LB[k]['bbox_wgs84'],'ground_m_per_px_1200w':round(FR[k]['ground_m']/1200,2)}
  r['original_size']=f"{LB[k]['size'][0]}x{LB[k]['size'][1]} (NAIP export{', labels drawn' if labs else ''}, then resized)"
  r['subject_check']=f'Looked at full size by the writer of /submarkets/murrells-inlet/ on 2026-11-02. It shows: {shows} No person; no readable sign, plate or house number at page size.'
  if k=='creek':
    r['crops']={c:{'path':f'{B}{fn}-{c}.webp','width':1200,'height':h} for c,h in (('1x1',1200),('4x3',900),('16x9',675))}
    r['crop_note']='Crops cut from the center of the unlabelled export by tools/photos.js crops, so the share image carries no text.'
  out.append(r)
out.append({'slug':SLUG,'file':f'{B}sunnyside-murrells-inlet-1200w.webp','variants':{'600':f'{B}sunnyside-murrells-inlet-600w.webp','1200':f'{B}sunnyside-murrells-inlet-1200w.webp'},
  'width':1200,'height':675,'title':'Sunnyside, Murrells Inlet Historic District',
  'what':'A white one-and-a-half-story weatherboarded cottage with a front gable, a porch on four square columns, two central brick chimneys and live oaks around it: Sunnyside, in the Murrells Inlet Historic District.',
  'caption':'Sunnyside, built about 1850, one of the two planters\' houses the creek-side village grew from.',
  'alt':'Sunnyside in Murrells Inlet: a white one-and-a-half-story cottage with a front gable, a porch on four square columns, two brick chimneys and a red door, with live oaks around a lawn',
  'place':{'city':'Murrells Inlet','sublocation':'Sunnyside, Murrells Inlet Historic District'},
  'source':'https://commons.wikimedia.org/wiki/File:Sunnyside_-_Murrells_Inlet_Historic_District.jpg','source_name':'Wikimedia Commons',
  'commons_page':'https://commons.wikimedia.org/wiki/File:Sunnyside_-_Murrells_Inlet_Historic_District.jpg',
  'author':'Upstateherd','license':'CC BY-SA 4.0','license_url':'https://creativecommons.org/licenses/by-sa/4.0/',
  'credit':'Photo: Upstateherd, CC BY-SA 4.0, via Wikimedia Commons','share_alike':True,
  'provenance':"own work (Commons: Credit 'Own work', Artist Upstateherd; LicenseShortName 'CC BY-SA 4.0', AttributionRequired true; read through the Commons API by the verifier of this page on 2026-11-02, meta.json). Made from the Commons 1920 px rendering.",
  'taken':'2017-11-24','original_size':'5312x2988','changes':'Resized by Chapter3 Realty',
  'subject_check':'Looked at full size by the writer of /submarkets/murrells-inlet/ on 2026-11-02, and by the verifier (VERIFY.md: matches the National Register description of Sunnyside, a one-and-a-half-story cottage built about 1850). No person; no sign or plate.'})
json.dump({'photos':out},open(os.path.join(HERE,'..','photos.json'),'w'),indent=1)
print(len(out),[r['file'].split('/')[-1] for r in out])
