"""OCR the scanned association documents (no text layer) with tesseract, page by page at 150 dpi.
Usage: python3 -I ocr_docs.py <cam dir> <pdf dir>   (pdf dir is outside the repo; the PDFs are ~1 GB)
Writes <cam dir>/ocr/<file id>.txt. Skips map and plat exhibits, bylaws, articles, insurance, pool and parking papers, and reads the first 40 pages of each document."""
import json,os,sys,subprocess,tempfile,shutil,concurrent.futures as cf
import pymupdf
cam,pdfdir=sys.argv[1],sys.argv[2]
os.makedirs(os.path.join(cam,'ocr'),exist_ok=True)
res=json.load(open(os.path.join(cam,'dl.json'))); idx={o['fid']:o for o in json.load(open(os.path.join(cam,'cam-index.json')))}
SKIP={'2410','2411','2412','2422','3503','779','2346','1648'}
import re
NOSUBJ=re.compile(r'(?i)by.?laws|articles|exhibit|supplement|insurance|collection|harrass|parking|pool|storage')
MAXP=40  # the use and leasing articles sit in the body of a master deed; later pages are plats, schedules and joinders
todo=[fid for fid,size,tl in res if tl<=500 and fid not in SKIP and not NOSUBJ.search(idx[fid]['name']) and not os.path.exists(os.path.join(cam,'ocr',fid+'.txt'))]
ENV=dict(os.environ,OMP_THREAD_LIMIT='1')
def tess(png): return subprocess.run(['tesseract',png,'-','--psm','3'],capture_output=True,text=True,env=ENV).stdout
with cf.ThreadPoolExecutor(4) as ex:
    for fid in sorted(todo,key=lambda f: pymupdf.open(os.path.join(pdfdir,f+'.pdf')).page_count):
        doc=pymupdf.open(os.path.join(pdfdir,fid+'.pdf')); tmp=tempfile.mkdtemp(); pngs=[]
        for i,pg in enumerate(doc):
            if i>=MAXP: break
            p=os.path.join(tmp,f'{i:04d}.png'); pg.get_pixmap(dpi=150,colorspace=pymupdf.csGRAY).save(p); pngs.append(p)
        pages=list(ex.map(tess,pngs)); shutil.rmtree(tmp)
        open(os.path.join(cam,'ocr',fid+'.txt'),'w').write('\n\f'.join(f'[page {i+1}]\n'+p for i,p in enumerate(pages)))
        print(fid,idx[fid]['assoc'],len(pngs),flush=True)
