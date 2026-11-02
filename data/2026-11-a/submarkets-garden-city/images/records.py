import json, os
D='/tmp/claude-0/-home-user-Blog-Brain/6dac3d75-8af3-5045-bdd7-7ad0adf5395f/scratchpad/web2'
LB=json.load(open('labels.json')); FR=json.load(open('naip-frames.json'))
B='images/2026-11-a/submarkets-garden-city/'
INFO={
 'pier':('garden-city-pier-from-above','The ocean side by the pier from above',
   'The ocean side by the pier from above: buildings and beach houses between Waccamaw Drive and the beach, and the salt marsh behind.',
   'Aerial photo of Garden City Beach, labelled: the Garden City Pier running from the beach into the ocean, buildings and beach houses along Waccamaw Drive, and Atlantic Avenue crossing the salt marsh',
   'Garden City Beach','The Garden City Pier, Atlantic Avenue and Waccamaw Drive',
   'The pier runs from the beach out into the ocean at lower right; Atlantic Avenue crosses the salt marsh at upper left and meets Waccamaw Drive; houses with docks line the marsh at left. Labels placed from coordinates (labels.json).'),
 'marsh':('garden-city-marsh-from-above','The salt marsh behind the beach strip from above',
   'The salt marsh behind the beach strip, with docks from the houses on both edges.',
   'Aerial photo of the salt marsh at Garden City at high tide, with long private docks running out from houses on the mainland at left and on the beach strip at lower right',
   'Garden City Beach','The salt marsh south of Atlantic Avenue',
   'Salt marsh and tidal water fill the frame; houses with docks stand at the left edge and the lower right; the Atlantic Avenue causeway crosses at the upper right.'),
 'streets':('garden-city-streets-from-above','Streets between the marsh and Business 17 from above',
   'Streets between the marsh and Business 17 from above: houses and yards, a pond, and the salt marsh at the lower right.',
   'Aerial photo of streets of houses under trees in Garden City, with a pond at the top and the salt marsh at the lower right, labelled',
   'Garden City','Streets between the salt marsh and Business 17',
   'Streets of houses and yards, a wooded strip, a pond with a fountain at the top, and salt marsh at the lower right.'),
 'point':('garden-city-point-from-above','The Georgetown end near Garden City Point from above',
   'The Georgetown end near Garden City Point from above: houses on canals with private docks, Waccamaw Drive and the beach.',
   'Aerial photo of the south end of Garden City Beach, labelled: houses on curving canals with private docks between the inlet water at left and Waccamaw Drive and the Atlantic Ocean at right',
   'Garden City Beach','South Waccamaw Drive near Garden City Point, Georgetown County',
   'Houses on curving canals with many private docks; Waccamaw Drive and beach houses along the ocean at right; open inlet water and a marsh island at upper left. The frame is south of the county line (33.5727 N).'),
 'inland':('garden-city-west-of-17-from-above','Subdivisions west of Business 17 from above',
   'Subdivisions west of Business 17 from above: houses on curving streets, ponds, a pool and courts, and woods.',
   'Aerial photo of subdivisions west of Business 17 in Garden City: houses on curving streets around ponds, a swimming pool and sports courts, with woods at the upper right',
   'Garden City','Subdivisions west of Business 17',
   'Houses on curving streets and cul-de-sacs, two ponds, a pool beside fenced sports courts and a parking lot, a power-line strip, and woods at the upper right. The frame is west of Business 17 (it reaches -79.0042; Business 17 is near -78.993 at this latitude).'),
}
out=[]
for k,(fn,title,cap,alt,city,sub,shows) in INFO.items():
  if k not in LB or not os.path.exists(f'{D}/chapter3realty/{B}{fn}-1200w.webp'): continue
  r={'slug':'submarkets-garden-city','file':f'{B}{fn}-1200w.webp','variants':{'600':f'{B}{fn}-600w.webp','1200':f'{B}{fn}-1200w.webp'},
   'width':1200,'height':900,'title':title,'what':f'{title} (USDA NAIP aerial photo, 2023): {shows}','caption':cap,'alt':alt,
   'place':{'city':city,'sublocation':sub},
   'source':'https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer','source_name':'The National Map (USGS)',
   'author':'USDA Farm Service Agency, NAIP','author_type':'Organization','license':'Public domain','license_url':'https://www.fsa.usda.gov/help/policies-and-links/',
   'provenance':'U.S. government aerial photo: USDA National Agriculture Imagery Program (NAIP), South Carolina 2023, natural color, 60 cm. Exported by Chapter3 from the USGS National Map NAIP image service (exportImage, Web Mercator, cubic resampling, mosaic locked to Year=2023) on 2026-11-02; the exact request is in source_request.',
   'license_note':'Same source and terms as the batch 2026-10-b NAIP records (data/2026-10-b/photos.json): The National Map offers "free downloads of public domain, NAIP compressed orthoimagery"; the USDA FSA policy page says public domain information "may be freely distributed or copied, but use of appropriate byline/photo/image credits is requested."',
   'terms_urls':['https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer','https://www.fsa.usda.gov/help/policies-and-links/'],
   'taken':'2023','display_credit':'U.S. government aerial photo',
   'credit':'Photo: USDA Farm Service Agency, NAIP, public domain, via The National Map (USGS). Labels by Chapter3 Realty.',
   'digital_source_type':'composite','changes':'Chapter3 Realty cut this view from the NAIP service and added labels placed from map data',
   'labels':[l['label'] for l in LB[k]['labels']],'annotation_sources':{l['label']:f"{l['how']} ({l['lon']}, {l['lat']}); label_naip.py" for l in LB[k]['labels']},
   'source_request':FR[k]['url'],'frame':{'bbox_wgs84':LB[k]['bbox_wgs84'],'ground_m_per_px_1200w':round(FR[k]['ground_m']/1200,2)},
   'original_size':f"{LB[k]['size'][0]}x{LB[k]['size'][1]} (NAIP export, labels drawn, then resized)",
   'subject_check':f'Looked at full size by the writer of /submarkets/garden-city/ on 2026-11-02. It shows: {shows} No person; no readable sign, plate or house number at page size.',
  }
  if k=='pier':
    r['crops']={c:{'path':f'{B}{fn}-{c}.webp','width':1200,'height':h} for c,h in (('1x1',1200),('4x3',900),('16x9',675))}
    r['crop_note']='Crops cut from the center of the unlabelled export by tools/photos.js crops, so the share image carries no text.'
  out.append(r)
# Fix round 1: the USGS oblique photo of the beach houses and the marsh behind them, already on the site
# (images/buyers/no-hoa/, record in data/2026-10-b/photos.json), reused here with the same licence record.
OB=[p for p in json.load(open(f'{D}/data/2026-10-b/photos.json'))['photos'] if p['file'].endswith('garden-city-beach-and-marsh-from-the-ocean-2011.webp')][0]
ob=dict(OB); ob['slug']='submarkets-garden-city'
ob['caption']='Beach houses along Waccamaw Drive, seen from over the ocean, with the salt marsh and its creeks behind them and docks on the far shore.'
ob['subject_check']='Looked at full size by the fixer of /submarkets/garden-city/ on 2026-11-02 (review round 1). It shows rows of beach houses between the beach and the marsh, tidal creeks and marsh islands, and docks along the far shore. People on the beach are too small to identify; no readable sign or plate.'
out.append(ob)
json.dump({'photos':out},open(f'{D}/data/2026-11-a/submarkets-garden-city/photos.json','w'),indent=1)
print([r['file'] for r in out])
