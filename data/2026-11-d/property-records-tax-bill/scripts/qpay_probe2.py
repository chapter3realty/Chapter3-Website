# Same probe, with the dropdown postback first (ASP.NET), for PIN / Map / Notice searches.
import sys,re,html,urllib.request,urllib.parse,http.cookiejar,ssl,os
base='https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx'
cj=http.cookiejar.CookieJar(); ctx=ssl.create_default_context(cafile='/root/.ccr/ca-bundle.crt')
op=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj),urllib.request.HTTPSHandler(context=ctx)); op.addheaders=[('User-Agent','Mozilla/5.0')]
def fields(s): return {n:html.unescape(v) for n,v in re.findall(r'<input type="hidden" name="([^"]+)" id="[^"]*" value="([^"]*)"',s)}
s=op.open(base).read().decode('utf-8','ignore'); f=fields(s)
f.update({'__EVENTTARGET':'ctl00$MainContent$ddlCriteriaList','ctl00$MainContent$SearchType':'radAllSearchButton','ctl00$MainContent$PaidStatus':'radAllPaymentsButton','ctl00$MainContent$ddlYearList':sys.argv[2],'ctl00$MainContent$ddlCriteriaList':sys.argv[3],'ctl00$MainContent$txtCriteriaBox':''})
s=op.open(base,urllib.parse.urlencode(f).encode()).read().decode('utf-8','ignore'); f=fields(s)
hint=re.findall(r'Please enter[^<]*',s); print('hint:',hint[:2])
f.update({'__EVENTTARGET':'','ctl00$MainContent$SearchType':'radAllSearchButton','ctl00$MainContent$PaidStatus':'radAllPaymentsButton','ctl00$MainContent$ddlYearList':sys.argv[2],'ctl00$MainContent$ddlCriteriaList':sys.argv[3],'ctl00$MainContent$txtCriteriaBox':sys.argv[1],'ctl00$MainContent$btnSearch':'Search'})
r=op.open(base,urllib.parse.urlencode(f).encode()).read().decode('utf-8','ignore'); open(sys.argv[4],'w').write(r)
print('results:',r.count('TaxesDetailsType4'), re.findall(r'No records[^<]*',r)[:1])
