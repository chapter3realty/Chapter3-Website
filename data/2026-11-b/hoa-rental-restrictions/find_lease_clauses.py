"""Find leasing clauses in association documents (text from pdftotext or tesseract).
Usage: python3 -I find_lease_clauses.py <cam dir> > raw/lease-clauses.txt
A sentence is printed when it names leasing or renting of a home and a limit on it."""
import json,re,os,sys
d=sys.argv[1]
idx={o['fid']:o for o in json.load(open(os.path.join(d,'cam-index.json')))}
A=re.compile(r'(?i)\b(leas(e|ed|es|ing)|rent(al|als|ed|ing)?|renters?|sub-?let|transient)\b')
B=re.compile(r'(?i)minimum|less than|shorter than|fewer than|at least|not be (leased|rented)|shall not (lease|rent)|prohibit|transient|hotel|motel|rental (program|pool|desk)|percent of (the )?(units|apartments|lots)|number of (units|apartments|lots)|register|registration|(\d+|one|two|three|six|twelve|thirty|seven)\s*\(?\d*\)?\s*(consecutive )?(days?|months?|years?|nights?|weeks?)')
X=re.compile(r'(?i)tenants?[- ]in[- ]common|percentage interest|occupancy permit|mortgage holders|warranty')
for fid,o in sorted(idx.items(),key=lambda x:(x[1]['assoc'],x[1]['name'])):
  p=os.path.join(d,'txt',fid+'.txt'); q=os.path.join(d,'ocr',fid+'.txt')
  f=p if os.path.exists(p) and len(open(p,errors='ignore').read().strip())>500 else (q if os.path.exists(q) else None)
  if not f: continue
  t=re.sub(r'\s+',' ',open(f,errors='ignore').read())
  out=[s for s in re.split(r'(?<=[.;:])\s+(?=[A-Z(])',t) if A.search(s) and B.search(s) and not X.search(s)]
  if out:
    print('=====',o['assoc'],'|',o['name'],'| file',fid,'|',os.path.basename(os.path.dirname(f)))
    for s in out[:12]: print('  -',s[:700])
