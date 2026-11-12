"""HUD FHA condo list (entp.hud.gov condo lookup), Horry County SC, every status, every result page.
Pages are 25 rows; the 'next' form posts startAt=26, 51, ... and maxRows=50, 75, ... (read from each page's form). One cookie session, pages in order.
Run: python3 -I pull_hud_all.py <this folder>. Writes raw/hud-condos-horry-X-p<n>.html and hud-horry-all.json
(project name, ID, address, composition, status, status date, expiration date; public project records)."""
import sys, re, html, json, time, urllib.request, urllib.parse, http.cookiejar
out = sys.argv[1]
cj = http.cookiejar.CookieJar(); op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cj))
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
F = "https://entp.hud.gov/idapp/html/condlook.cfm"; R = "https://entp.hud.gov/idapp/html/condo1.cfm"
def get(url, data=None, ref=None):
    rq = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode() if data else None, headers={"User-Agent": UA, **({"Referer": ref} if ref else {})})
    return op.open(rq, timeout=90).read().decode("latin-1")
get(F)
base = dict(FAPPROVAL_METHOD="NEW", FSORTED_BY="condo_name", FSTATE="SC", FCOUNTY="HORRY", FCONDO_ID="", FCONDO_NAME="", FCITY="", FZIP="", FSTATUS_CODE="X", FSEARCH_TYPE="P", FBEGIN_MO="", FBEGIN_DY="", FBEGIN_YR="", FEND_MO="", FEND_DY="", FEND_YR="", CAME_FROM="oth", IN_FHAC="true")
rows, page, ref, start, maxr = [], 1, F, None, None
while True:
    d = dict(base)
    if start: d.update(startAt=start, maxRows=maxr, pageIn=F, thisPage="condo1.cfm")
    s = get(R, d, ref); open(f"{out}/raw/hud-condos-horry-X-p{page}.html", "w").write(s)
    got = 0
    for r in re.findall(r"<tr[^>]*>(.*?)</tr>", s, re.S | re.I):
        c = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip() for x in re.findall(r"<td[^>]*>(.*?)</td>", r, re.S | re.I)]
        if len(c) >= 13 and c[3] == "HORRY COUNTY":
            rows.append(dict(name=c[0], id=c[1], address=c[2], composition=c[4], fha_concentration=c[6], method=c[7], status=c[9], comments=c[10], status_date=c[11], expiration=c[12])); got += 1
    m = re.search(r'name="startAt" value="(\d+)"', s); mx = re.search(r'name="maxRows" value="(\d+)"', s)
    print(page, got, m.group(1) if m else None, flush=True)
    if not got or not m: break
    start, maxr, ref, page = m.group(1), mx.group(1), R, page + 1; time.sleep(1.5)
json.dump({"read": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "source": F + " (State SC, County HORRY, Status All, Project search)", "records": rows}, open(f"{out}/hud-horry-all.json", "w"), indent=1)
print(len(rows))
