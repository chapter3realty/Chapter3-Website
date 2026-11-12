import sys; sys.path.insert(0,'eri')
from render import *
mode=sys.argv[1] if len(sys.argv)>1 else 'labels'
box=(2800,2640,8800,7140)   # 6000 x 4500, 4:3
im,T,s=crop(box,2400)
ov=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(ov)
col={'nightly':(240,150,60),'no_nightly':(90,190,110)}
for f in G['features']:
  pr=f['properties']
  if pr.get('layer')!='zoning' or pr['group'] not in col: continue
  for poly in f['geometry']['coordinates']:
    rings=[[T(*p) for p in r] for r in poly]
    m=Image.new('L',im.size,0); md=ImageDraw.Draw(m); md.polygon(rings[0],fill=255)
    for r in rings[1:]: md.polygon(r,fill=0)
    tint=Image.new('RGBA',im.size,col[pr["group"]]+(48,)); ov.paste(tint,(0,0),m)
    d.line(rings[0]+[rings[0][0]],fill=col[pr['group']]+(255,),width=7)
out=Image.alpha_composite(im.convert('RGBA'),ov)
if mode=='labels':
  d=ImageDraw.Draw(out)
  pill(d,(640,250),'R1 and R2:\nno nightly rentals',96)
  pill(d,(1800,250),'R3: nightly\nrentals allowed',96)
  pier=T(-78.971344,33.604653); px,py=pier
  d.ellipse([px-24,py-24,px+24,py+24],fill=(196,120,58,255),outline=(255,255,255,255),width=5)
  pill(d,(px+40,py+110),'Pier',96,anchor='lm')
out.convert('RGB').save('eri/line-%s.png'%mode)
print(out.size)
