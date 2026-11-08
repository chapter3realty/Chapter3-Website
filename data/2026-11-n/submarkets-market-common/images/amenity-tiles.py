"""USDA NAIP 2023 tiles (public domain), 300 m square, centred on each county amenity parcel, for reading what stands there (hood_details.py AERIAL). Run from images/: python3 -I amenity-tiles.py"""
import math,json,urllib.parse,subprocess,sys
R=6378137
mx=lambda lo: R*math.radians(lo); my=lambda la: R*math.log(math.tan(math.pi/4+math.radians(la)/2))
P={'emmens_amen':(-78.961373,33.669595),'emmens_club':(-78.955136,33.666125),'cresswind_amen':(-78.954579,33.678128),'belle_amen':(-78.968186,33.665791),'mbafb_amen':(-78.950967,33.668237),'parkplace_amen':(-78.949251,33.663167),'reserve_ca3':(-78.948179,33.673767)}
for k,(lo,la) in P.items():
  half=150/math.cos(math.radians(la))
  bb=[mx(lo)-half,my(la)-half,mx(lo)+half,my(la)+half]
  mr=json.dumps({"mosaicMethod":"esriMosaicAttribute","sortField":"Year","sortValue":"2050","ascending":True,"where":"Year=2023"})
  q={'bbox':','.join(str(v) for v in bb),'bboxSR':3857,'imageSR':3857,'size':'600,600','format':'jpg','pixelType':'U8','interpolation':'RSP_CubicConvolution','mosaicRule':mr,'f':'image','bandIds':'0,1,2'}
  url='https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?'+urllib.parse.urlencode(q)
  r=subprocess.run(['curl','-sS','-m','120','--retry','2','-o',f'amenity-tiles/{k}.jpg','-w','%{http_code} %{size_download}',url],capture_output=True,text=True); print(k,r.stdout,r.stderr[:100],flush=True)
