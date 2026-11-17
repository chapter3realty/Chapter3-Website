"""Property tax bills for a sample of Briarcliffe Acres houses, from the Horry County Treasurer's public payment site
(https://horrycountytreasurer.qpaybill.com/Taxes/), read the way functions/api/tax.js reads it (list page, then the newest bill's detail page,
fields by element id). Kept: tax year, county appraisal, assessed value, ratio, county and city tax, fees, total, paid status. Never a name or an address.
Run: python3 -I pull_tax.py <pins.json> <out.json>"""
import sys, json, re, time, urllib.request, http.cookiejar
SITE = "https://horrycountytreasurer.qpaybill.com/Taxes/"
def num(s):
    s = re.sub(r"[$,\s]", "", s or ""); return float(s) if re.fullmatch(r"-?\d*\.?\d+", s) else None
def opener():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
def get(o, url):
    for i in range(3):
        try: return o.open(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; Chapter3RealtyLookup/1.0; +https://chapter3realty.com/buyers/property-records/)"}), timeout=40).read().decode("utf8", "replace")
        except Exception as e: err = e; time.sleep(3)
    raise err
def eid(s, k):
    m = re.search(r'id="ctl00_MainContent_%s"[^>]*>([^<]*)<' % k, s); return m.group(1).strip() if m else ""
out = []
for pin in json.load(open(sys.argv[1])):
    try:
        o = opener(); lst = get(o, SITE + "TaxesDefaultType4.aspx?PIN=" + pin)
        bills = []
        for m in re.finditer(r'<tr class="gv(?:alt)?row">([\s\S]*?)</tr>', lst):
            c = [re.sub(r"&nbsp;|&amp;", " ", re.sub(r"<[^>]+>", "", x)).strip() for x in re.findall(r"<td>([\s\S]*?)</td>", m.group(1))]
            if len(c) < 9 or c[5] != "RealEstate" or not re.fullmatch(r"\d{4}", c[2]): continue
            l = re.search(r"TaxesDetailsType4\.aspx\?receiptNo=(\d+)&amp;recID=(\d+)", m.group(1))
            bills.append({"year": int(c[2]), "status": c[6].lower(), "amount": num(c[8]), "detail": ("TaxesDetailsType4.aspx?receiptNo=%s&recID=%s" % l.groups()) if l else None})
        bills.sort(key=lambda b: -b["year"]); last = None
        d = next((b for b in bills if b["detail"]), None)
        if d:
            s = get(o, SITE + d["detail"])
            last = {"year": num(eid(s, "lblTaxYr")), "appraisal": num(eid(s, "lblMarketVal")), "assessed": num(eid(s, "lblAssmt")), "countyTax": num(eid(s, "lblCountyTax")),
                    "cityTax": num(eid(s, "lblCityTax")), "fees": num(eid(s, "lblFees")), "residential": num(eid(s, "lblResidential")), "homestead": num(eid(s, "lblHomestead")),
                    "other": num(eid(s, "lblOther")), "total": num(eid(s, "lblTotalTaxes")),
                    "ratio": re.findall(r"<td>\s*(\d+)%\s*</td>", s)[:2]}
        out.append({"pin_tail": pin[-4:], "bills": [{k: v for k, v in b.items() if k != "detail"} for b in bills[:4]], "last": last})
    except Exception as e: out.append({"err": str(e)})
    time.sleep(1.5)
json.dump(out, open(sys.argv[2], "w"), indent=1)
