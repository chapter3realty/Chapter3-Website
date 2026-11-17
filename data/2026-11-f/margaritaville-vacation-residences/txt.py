import re,html,sys
t=open(sys.argv[1],errors='ignore').read()
t=re.sub(r'<(script|style|nav|header|footer)[\s\S]*?</\1>','',t); t=re.sub(r'<[^>]+>','\n',t); t=html.unescape(t)
t=re.sub(r'\n\s*\n+','\n',t)
i=t.find('Skip to content'); 
print(t[:int(sys.argv[2])])
