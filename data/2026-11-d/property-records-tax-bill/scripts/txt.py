import sys,re,html
for f in sys.argv[1:]:
    s=open(f,errors='ignore').read()
    s=re.sub(r'<script.*?</script>|<style.*?</style>','',s,flags=re.S|re.I)
    s=re.sub(r'<a [^>]*href="([^"]*)"[^>]*>',r' [\1] ',s)
    t=html.unescape(re.sub(r'<[^>]+>','\n',s))
    t=re.sub(r'\n\s*\n+','\n',t)
    print('=====',f); print(t)
