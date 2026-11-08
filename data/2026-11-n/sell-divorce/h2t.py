import re,html,sys
t=open(sys.argv[1],encoding='latin-1').read()
t=re.sub(r'(?is)<(script|style).*?</\1>','',t)
t=re.sub(r'<br\s*/?>|</p>|</div>|</tr>|</li>|</h\d>','\n',t); t=re.sub(r'<[^>]+>','',t); t=html.unescape(t)
t=re.sub(r'\n\s*\n+','\n\n',t)
open(sys.argv[2],'w').write(t)
