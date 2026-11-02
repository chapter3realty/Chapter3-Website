"""Export USDA NAIP 2023 aerial frames (public domain) from the USGS National Map image service
for /submarkets/pawleys-island/. Frames are bboxes in lon/lat; output JPGs go to the folder given.
Usage: python3 -I naip.py <out dir> <frame> ...   (frames: overview, middle, south)"""
import math, json, sys, os, urllib.parse, subprocess
R=6378137
mx=lambda lo: R*math.radians(lo)
my=lambda la: R*math.log(math.tan(math.pi/4+math.radians(la)/2))
FRAMES={
 # name: (west, south, east, north, width px)
 'overview':(-79.175,33.392,-79.085,33.478,1400),
 'middle':(-79.127787,33.4290,-79.1150,33.4370,1644),
 'south':(-79.1404,33.3993,-79.1340,33.4053,1800),
}
out_dir=sys.argv[1]; here=os.path.dirname(os.path.abspath(__file__))
rec_f=os.path.join(here,'naip-frames.json'); rec=json.load(open(rec_f)) if os.path.exists(rec_f) else {}
for k in sys.argv[2:]:
  w,s,e,n,W=FRAMES[k]; bb=[mx(w),my(s),mx(e),my(n)]; H=round(W*(bb[3]-bb[1])/(bb[2]-bb[0]))
  mr=json.dumps({"mosaicMethod":"esriMosaicAttribute","sortField":"Year","sortValue":"2050","ascending":True,"where":"Year=2023"})
  q={'bbox':','.join(str(v) for v in bb),'bboxSR':3857,'imageSR':3857,'size':f'{W},{H}','format':'jpg','pixelType':'U8','interpolation':'RSP_CubicConvolution','mosaicRule':mr,'f':'image','renderingRule':json.dumps({"rasterFunction":"None"}),'bandIds':'0,1,2'}
  url='https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?'+urllib.parse.urlencode(q)
  r=subprocess.run(['curl','-sS','-m','240','--retry','3','-o',os.path.join(out_dir,k+'-raw.jpg'),'-w','%{http_code} %{size_download}',url],capture_output=True,text=True); print(k,W,H,r.stdout,r.stderr)
  rec[k]={'url':url,'bbox_wgs84':[w,s,e,n],'bbox3857':bb,'size':[W,H]}
json.dump(rec,open(rec_f,'w'),indent=1)
