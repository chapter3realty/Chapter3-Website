"""Find the vote each master deed or declaration requires to amend it.
Usage: python3 -I find_amend_votes.py <cam dir> > raw/amend-votes.txt
Prints sentences that name amending (amend, revoke, modify) with a share (percent, two-thirds, three-fourths, majority)."""
import json,re,os,sys
d=sys.argv[1]
idx={o['fid']:o for o in json.load(open(os.path.join(d,'cam-index.json')))}
A=re.compile(r'(?i)\b(amend(ed|ment|ments)?|revoked?|modif(y|ied|ication))\b')
B=re.compile(r'(?i)\d{2}\s*%|\d{2}\s*percent|(sixty|seventy|eighty|fifty|sixty-six|sixty-seven|seventy-five)[- ]?(\w+ )?(percent|\(\d+%\))|two[- ]thirds|three[- ]fourths|three[- ]quarters|2/3|3/4|majority|unanimous|all of the (co-)?owners')
X=re.compile(r'(?i)mortgage holders? (who|that) receives?|deemed to have approved|insurance|condemnation|reserve')
for fid,o in sorted(idx.items(),key=lambda x:(x[1]['assoc'],x[1]['name'])):
  if not re.search(r'(?i)master|deed|declaration|covenant|ccr|amend|restrict',o['name']): continue
  p=os.path.join(d,'txt',fid+'.txt'); q=os.path.join(d,'ocr',fid+'.txt')
  f=p if os.path.exists(p) and len(open(p,errors='ignore').read().strip())>500 else (q if os.path.exists(q) else None)
  if not f: continue
  t=re.sub(r'\s+',' ',open(f,errors='ignore').read())
  out=[s for s in re.split(r'(?<=[.;:])\s+(?=[A-Z(])',t) if A.search(s) and B.search(s) and not X.search(s) and re.search(r'(?i)master deed|declaration|this deed|covenants|restrictions|regime',s)]
  if out:
    print('=====',o['assoc'],'|',o['name'],'| file',fid,'|',os.path.basename(os.path.dirname(f)))
    for s in out[:6]: print('  -',s[:650])
