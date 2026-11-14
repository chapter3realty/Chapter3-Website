import re,html,sys
for p in sys.argv[1:]:
    s=open(p,errors='ignore').read()
    s=re.sub(r'<(script|style|nav|footer|header)\b.*?</\1>','',s,flags=re.S|re.I)
    m=re.search(r'<main.*?</main>',s,re.S|re.I); s=m.group(0) if m else s
    links=re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>',s,re.S)
    t=re.sub(r'<[^>]+>',' ',s); t=html.unescape(t); t=re.sub(r'\s+',' ',t)
    print('=====',p); print(t[:4000]); print('LINKS:')
    for h,x in links:
        x=re.sub(r'<[^>]+>','',x).strip()
        if x: print('  ',x[:60],'->',h)
