import sys; sys.path.insert(0,'eri')
from render import *
mode=sys.argv[1]
px,py=P(-78.971344,33.604653); print(px,py)
box=(int(px-2300),int(py-1350),int(px+1300),int(py+1350))  # 3600 x 2700
im,T,s=crop(box,2400); out=im.convert('RGBA'); d=ImageDraw.Draw(out)
if mode=='labels':
  x,y=T(-78.971344,33.604653)
  pill(d,(x+60,y-200),'Surfside Beach Pier',100)
out.convert('RGB').save('eri/pier-%s.png'%mode); print(out.size)
