"""NAIP close-ups for /submarkets/murrells-inlet/ (USDA NAIP 2023, public domain, via The National Map).
Run from a scratch folder: python3 -I naip.py <frame> ...  Writes <frame>-raw.jpg and naip-frames.json there."""
import math, json, sys, urllib.parse, subprocess, os
R=6378137
mx=lambda lo: R*math.radians(lo)
my=lambda la: R*math.log(math.tan(math.pi/4+math.radians(la)/2))
# frame: (center lon, center lat, ground width in metres)
ALL={'creek':(-79.0322,33.5578,650),'horry':(-79.0300,33.6050,750),'river':(-79.0850,33.5625,650),'between':(-79.0462,33.5492,600),'docks':(-79.0418,33.5500,420)}
out0=json.load(open('naip-frames.json')) if os.path.exists('naip-frames.json') else {}
for k in sys.argv[1:]:
  lo,la,g=ALL[k]; c=math.cos(math.radians(la)); hw=g/2/c; hh=hw*0.75
  X,Y=mx(lo),my(la); bb=[X-hw,Y-hh,X+hw,Y+hh]
  mr=json.dumps({"mosaicMethod":"esriMosaicAttribute","sortField":"Year","sortValue":"2050","ascending":True,"where":"Year=2023"})
  q={'bbox':','.join(str(v) for v in bb),'bboxSR':3857,'imageSR':3857,'size':'2400,1800','format':'jpg','pixelType':'U8','interpolation':'RSP_CubicConvolution','mosaicRule':mr,'f':'image','renderingRule':json.dumps({"rasterFunction":"None"}),'bandIds':'0,1,2'}
  url='https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?'+urllib.parse.urlencode(q)
  r=subprocess.run(['curl','-sS','-m','240','--retry','3','-o',k+'-raw.jpg','-w','%{http_code} %{size_download}',url],capture_output=True,text=True); print(k,r.stdout,r.stderr)
  out0[k]={'url':url,'bbox3857':bb,'center':[lo,la],'ground_m':g}
json.dump(out0,open('naip-frames.json','w'),indent=1)
