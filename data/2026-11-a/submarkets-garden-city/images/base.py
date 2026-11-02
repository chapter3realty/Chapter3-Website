from PIL import Image, ImageFilter
import numpy as np
im=np.array(Image.open('gc-aerial-raw.jpg').convert('RGB')).astype(np.int16)
H,W,_=im.shape
white=(im.min(axis=2)>238)
white[:1100,:]=False; white[:, :800]=False
# per row, fill with mean of the 30 sea pixels left of the first white pixel
out=im.copy()
for y in range(H):
  xs=np.where(white[y])[0]
  if len(xs)==0: continue
  x0=xs[0]; ref=im[y,max(0,x0-40):x0-8].mean(axis=0)
  out[y,x0:]=ref
img=Image.fromarray(out.clip(0,255).astype(np.uint8))
# soften the filled block
mask=Image.fromarray((white*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.GaussianBlur(6))
blur=img.filter(ImageFilter.GaussianBlur(10))
img=Image.composite(blur,img,mask)
print(white.sum())
img.save('gc-aerial-filled.png')
img.resize((1000,int(1000*H/W)),Image.LANCZOS).save('gc-aerial-1000.webp',quality=74,method=6)
img.resize((700,int(700*H/W)),Image.LANCZOS).save('gc-aerial-700.webp',quality=74,method=6)
