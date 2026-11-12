"""Read one 2026 Horry County real estate tax bill by PIN from the Treasurer's public search
(https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx). Prints the district/levy, city/levy, assessed and taxes lines.
Run: python3 -I bill.py <PIN> [<PIN> ...]"""
import sys, re, html, urllib.request, urllib.parse, http.cookiejar
U = "https://horrycountytreasurer.qpaybill.com/Taxes/TaxesDefaultType4.aspx"
cj = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj)); op.addheaders = [("User-Agent", "Mozilla/5.0")]
def hidden(s): return dict(re.findall(r'<input[^>]*type="hidden"[^>]*name="([^"]+)"[^>]*value="([^"]*)"', s))
def text(s): s = re.sub(r"<script.*?</script>|<style.*?</style>", "", s, flags=re.S); return html.unescape(re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", s)))
for pin in sys.argv[1:]:
    s = op.open(U, timeout=60).read().decode("utf-8", "ignore")
    f = hidden(s); f.update({"ctl00$MainContent$SearchType": "radAllSearchButton", "ctl00$MainContent$PaidStatus": "radAllPaymentsButton",
        "ctl00$MainContent$ddlYearList": "2026", "ctl00$MainContent$ddlCriteriaList": "PIN", "ctl00$MainContent$txtCriteriaBox": pin, "ctl00$MainContent$btnSearch": "Search"})
    s2 = op.open(U, urllib.parse.urlencode(f).encode(), timeout=60).read().decode("utf-8", "ignore")
    open(f"result-{pin}.html", "w").write(s2)
    t = text(s2); i = t.find("2026")
    links = [html.unescape(l) for l in re.findall(r'href="(TaxesDetailsType4[^"]*)"', s2)]
    rows = re.findall(r"(\d{9}) .{0,80}?(20\d\d) .{0,60}?" + pin, t)
    yr = [l for l, r in zip(links, rows) if r[1] == "2026"] or links[:1]
    if not yr: print(pin, "no bill"); continue
    d = text(op.open(urllib.parse.urljoin(U, yr[0]), timeout=60).read().decode("utf-8", "ignore"))
    open(f"bill-{pin}.txt", "w").write(d)
    out = [re.search(k + r".{0,40}", d) for k in ("District/Levy:", "City/Levy:", "Total Assessed:", "Fees:", "Total Taxes:", "Tax Year:")]
    print(pin, " | ".join(m.group(0) for m in out if m))
