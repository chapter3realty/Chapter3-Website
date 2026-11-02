"""Write data/2026-11-a/submarkets-pawleys-island/photos.json: the licence record for the labelled NAIP
close-up (USDA, public domain). The two map bases (area and south end) are drawn into the page as our own
maps over the same public-domain imagery; their credit is in each map's caption. Usage: python3 -I records.py"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
IM = json.load(open(os.path.join(here, 'images.json'))); FR = json.load(open(os.path.join(here, 'naip-frames.json')))
B = 'images/2026-11-a/submarkets-pawleys-island/'; fn = 'pawleys-island-at-the-north-causeway'; m = IM['middle']
shows = ('The North Causeway crosses the salt marsh and its tidal creeks from the mainland at upper left to the island; '
         'on the island, one or two rows of houses stand between the marsh side and the beach; long private docks run into the marsh; '
         'the Atlantic Ocean at right. Labels placed from coordinates (images.json).')
r = {'slug': 'submarkets-pawleys-island', 'file': f'{B}{fn}-1200w.webp', 'variants': {'600': f'{B}{fn}-600w.webp', '1200': f'{B}{fn}-1200w.webp'},
     'width': 1200, 'height': 900, 'title': 'Pawleys Island at the North Causeway from above',
     'what': f'Pawleys Island at the North Causeway from above (USDA NAIP aerial photo, 2023): {shows}',
     'caption': 'Pawleys Island at the North Causeway from above: the salt marsh, the causeway, and the rows of houses between the marsh and the beach.',
     'alt': 'Aerial photo of Pawleys Island, labelled: the North Causeway crossing the salt marsh from the mainland to the island, a narrow strip of houses, and the Atlantic Ocean',
     'place': {'city': 'Pawleys Island', 'sublocation': 'The North Causeway and the middle of the island'},
     'source': 'https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer', 'source_name': 'The National Map (USGS)',
     'author': 'USDA Farm Service Agency, NAIP', 'author_type': 'Organization', 'license': 'Public domain',
     'license_url': 'https://www.fsa.usda.gov/help/policies-and-links/',
     'provenance': 'U.S. government aerial photo: USDA National Agriculture Imagery Program (NAIP), South Carolina 2023, natural color, 60 cm. Exported by Chapter3 from the USGS National Map NAIP image service (exportImage, Web Mercator, cubic resampling, mosaic locked to Year=2023) on 2026-11-02; the exact request is in source_request.',
     'license_note': 'Same source and terms as the batch 2026-10-b and 2026-11-a NAIP records: The National Map offers "free downloads of public domain, NAIP compressed orthoimagery"; the USDA FSA policy page says public domain information "may be freely distributed or copied, but use of appropriate byline/photo/image credits is requested."',
     'terms_urls': ['https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer', 'https://www.fsa.usda.gov/help/policies-and-links/'],
     'taken': '2023', 'display_credit': 'U.S. government aerial photo',
     'credit': 'Photo: USDA Farm Service Agency, NAIP, public domain, via The National Map (USGS). Labels by Chapter3 Realty.',
     'digital_source_type': 'composite', 'changes': 'Chapter3 Realty cut this view from the NAIP service and added labels placed from map data',
     'labels': [l['label'] for l in m['labels']], 'annotation_sources': {l['label']: f"{l['how']} ({l['lon']}, {l['lat']}); prep.py" for l in m['labels']},
     'source_request': FR['middle']['url'], 'frame': {'bbox_wgs84': m['bbox_wgs84'], 'ground_m_per_px_1200w': 1.07},
     'original_size': f"{m['size'][0]}x{m['size'][1]} (NAIP export cut to 4:3, labels drawn, then resized)",
     'subject_check': f'Looked at full size by the writer of /submarkets/pawleys-island/ on 2026-11-02. It shows: {shows} No person; no readable sign, plate or house number at page size.',
     'crops': {c: {'path': f'{B}{fn}-{c}.webp', 'width': 1200, 'height': h} for c, h in (('1x1', 1200), ('4x3', 900), ('16x9', 675))},
     'crop_note': 'Crops cut from the center of the unlabelled export by tools/photos.js crops, so the share image carries no text.'}
json.dump({'photos': [r]}, open(os.path.join(here, '..', 'photos.json'), 'w'), indent=1)
print('ok')
