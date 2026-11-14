# Probe the Horry County tax portal's search form once, to record which fields a result shows.
# Saves the raw response; prints only column headers and the row count.
import sys,re,html,urllib.request,urllib.parse,http.cookiejar,ssl,os
base='https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx'
cj=http.cookiejar.CookieJar(); ctx=ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE') or '/root/.ccr/ca-bundle.crt')
op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj),urllib.request.HTTPSHandler(context=ctx))
op.addheaders=[('User-Agent','Mozilla/5.0')]
def fields(s):
    d={}
    for n,v in re.findall(r'<input type="hidden" name="([^"]+)" id="[^"]*" value="([^"]*)"',s): d[n]=html.unescape(v)
    return d
s=op.open(base).read().decode('utf-8','ignore')
f=fields(s)
f.update({'ctl00$MainContent$SearchType':'radRealEstateButton','ctl00$MainContent$PaidStatus':'radAllPaymentsButton','ctl00$MainContent$ddlYearList':sys.argv[2],'ctl00$MainContent$ddlCriteriaList':sys.argv[3],'ctl00$MainContent$txtCriteriaBox':sys.argv[1],'ctl00$MainContent$btnSearch':'Search'})
r=op.open(base,urllib.parse.urlencode(f).encode()).read().decode('utf-8','ignore')
open(sys.argv[4],'w').write(r)
ths=[re.sub(r'<[^>]+>','',h).strip() for h in re.findall(r'<th[^>]*>(.*?)</th>',r,re.S)]
print('headers:',ths)
print('rows:',len(re.findall(r'<tr[^>]*class="[^"]*(?:Row|row)[^"]*"',r)), 'trs:',len(re.findall(r'<tr',r)))
t=re.sub(r'<script.*?</script>|<style.*?</style>','',r,flags=re.S); t=html.unescape(re.sub(r'<[^>]+>','\n',t)); t=re.sub(r'\n\s*\n+','\n',t)
print([l for l in t.split('\n') if re.search(r'(?i)record|result|found|no ',l)][:10])
