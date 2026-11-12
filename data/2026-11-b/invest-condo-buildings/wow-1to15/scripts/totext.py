import sys, re, html, os
for p in sys.argv[2:]:
    s = open(p, encoding='utf-8', errors='replace').read()
    s = re.sub(r'(?is)<(script|style|noscript)[^>]*>.*?</\1>', ' ', s)
    s = re.sub(r'(?s)<[^>]+>', '\n', s)
    s = html.unescape(s)
    lines = [re.sub(r'\s+', ' ', l).strip() for l in s.split('\n')]
    open(os.path.join(sys.argv[1], os.path.basename(p)[:-5] + '.txt'), 'w').write('\n'.join(l for l in lines if l))
