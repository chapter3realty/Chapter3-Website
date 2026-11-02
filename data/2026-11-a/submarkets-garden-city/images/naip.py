import math, json, sys, urllib.parse, subprocess
R=6378137
mx=lambda lo: R*math.radians(lo)
my=lambda la: R*math.log(math.tan(math.pi/4+math.radians(la)/2))
ALL={'pier':(-78.9985,33.5772,700),'marsh':(-79.0045,33.5775,600),'streets':(-79.0005,33.5865,700),'inland':(-79.0080,33.6010,700),'point':(-79.0270,33.5385,900)}
FR={k:ALL[k] for k in sys.argv[1:]}
import os
out0=json.load(open('naip-frames.json')) if os.path.exists('naip-frames.json') else {}
out={}
for k,(lo,la,g) in FR.items():
  c=math.cos(math.radians(la)); hw=g/2/c; hh=hw*0.75
  X,Y=mx(lo),my(la); bb=[X-hw,Y-hh,X+hw,Y+hh]
  mr=json.dumps({"mosaicMethod":"esriMosaicAttribute","sortField":"Year","sortValue":"2050","ascending":True,"where":"Year=2023"})
  q={'bbox':','.join(str(v) for v in bb),'bboxSR':3857,'imageSR':3857,'size':os.environ.get('SZ','2400,1800'),'format':'jpg','pixelType':'U8','interpolation':'RSP_CubicConvolution','mosaicRule':mr,'f':'image','renderingRule':json.dumps({"rasterFunction":"None"}),'bandIds':'0,1,2'}
  url='https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?'+urllib.parse.urlencode(q)
  r=subprocess.run(['curl','-sS','-m','240','--retry','3','-o',k+'-raw.jpg','-w','%{http_code} %{size_download}',url],capture_output=True,text=True); print(k,r.stdout,r.stderr)
  out[k]={'url':url,'bbox3857':bb,'center':[lo,la],'ground_m':g}
out0.update(out); json.dump(out0,open('naip-frames.json','w'),indent=1)
