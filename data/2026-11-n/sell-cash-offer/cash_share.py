"""Share of Horry County home sales with no mortgage recorded by the buyer: a public-records stand-in for "paid cash".
Inputs: SALES (as cash_buyers.py), DEEDS (weekly DEED (001) pulls), MORTS = folder of weekly MORTGAGE (002) pulls made by
pull_mortgages.py for 2025-09-24..2026-10-21 (one week before and three weeks after the deed window). The mortgage index has no
parcel number, so a sale counts as financed when a mortgage was recorded 0 to 14 days after the deed (or the same day) whose
first-named borrower matches the deed's first-named buyer:
  strict = same compressed name; loose = same first two words of the name (surname and first name), or the same surname with a
  loan amount from 50 to 105 percent of the price; broad = ANY mortgage recorded 3 days before to 30 days after the deed whose
  first-named borrower has the buyer's surname (first word). "cash_pct_floor" uses broad (the fewest sales read as cash, so a
  floor); "cash_pct_ceiling" uses strict.
Caveats: a loan recorded later, a loan in another name, or a loan from family not recorded all read as cash.
Run: SALES=<sales.json> DEEDS=<raw dir> MORTS=<raw dir> python3 -I cash_share.py <outdir> -> <outdir>/cash-share.json (no names)."""
import json, os, sys, glob, re, statistics as st, collections, datetime, runpy
out = sys.argv[1]
sales = json.load(open(os.environ["SALES"]))["sales"]
deeds = {}
for f in sorted(glob.glob(os.path.join(os.environ["DEEDS"], "deeds-20*.json"))):
    for r in json.load(open(f))["Data"]:
        deeds[r["BookPage"]] = (r["DirectName"] or "", r["IndirectName"] or "")
morts = collections.defaultdict(list)
for f in sorted(glob.glob(os.path.join(os.environ["MORTS"], "mortgages-20*.json"))):
    for r in json.load(open(f))["Data"]:
        n = (r["DirectName"] or "").upper().split()
        if n: morts[n[0].strip(",")].append((datetime.date(*map(int, r["RecordDate"].split("/"))), n, r["Consideration"] or 0))
ENTITY = re.compile(r"\b(LLC|L L C|INC|INCORPORATED|CORP|CORPORATION|COMPANY|CO|LP|L P|LLP|LLLP|LTD|PLLC|PARTNERSHIP|PARTNERS|HOLDINGS?|"
                    r"PROPERTIES|PROPERTY|INVESTMENTS?|INVESTORS?|GROUP|ENTERPRISES?|VENTURES?|CAPITAL|REALTY|FUND|REIT|ACQUISITIONS?|"
                    r"RENTALS?|ASSETS|HOMES|SOLUTIONS|DEVELOPMENT|BUILDERS?|CONSTRUCTION)\b")
TRUST = re.compile(r"\b(TRUSTEES?|TRUST|TR|TRS)\b")
def kind(n):
    n = n.upper()
    if ENTITY.search(n): return "company"
    if TRUST.search(n): return "trust"
    return "person"
def broad(s, buyer):
    d0 = datetime.date(*map(int, s["date"].split("/")))
    b = buyer.upper().split()
    return bool(b) and any(-3 <= (d - d0).days <= 30 for d, n, amt in morts.get(b[0].strip(","), []))
def financed(s, buyer):
    d0 = datetime.date(*map(int, s["date"].split("/")))
    b = buyer.upper().split()
    if not b: return (False, False)
    strict = loose = False
    for d, n, amt in morts.get(b[0].strip(","), []):
        if not (0 <= (d - d0).days <= 14): continue
        if n == b: strict = loose = True; break
        if n[:2] == b[:2] or (s["cons"] and 0.5 <= amt / s["cons"] <= 1.05): loose = True
    return (strict, loose)
rows = []
for s in sales:
    d = deeds.get(s["bp"])
    if not d: continue
    st_, lo = financed(s, d[1])
    rows.append({"cons": s["cons"], "condo": s["condo"], "builder": s["builder"], "ek": kind(d[1]), "strict": st_, "loose": lo, "broad": broad(s, d[1])})
def pct(a, b): return round(100 * a / b, 1) if b else None
def share(rs):
    n = len(rs)
    return {"sales": n, "cash_pct_floor": pct(sum(1 for r in rs if not r["broad"]), n), "cash_pct_loose": pct(sum(1 for r in rs if not r["loose"]), n),
            "cash_pct_ceiling": pct(sum(1 for r in rs if not r["strict"]), n)}
BANDS = [(0, 150000, "under $150,000"), (150000, 250000, "$150,000 to $249,999"), (250000, 350000, "$250,000 to $349,999"),
         (350000, 500000, "$350,000 to $499,999"), (500000, 1e12, "$500,000 and up")]
rs = [r for r in rows if not r["builder"]]
res = {"meta": {"made": "cash_share.py", "rule": __doc__.split("Caveats")[0].strip(), "note": "No names are written here."},
       "mortgage_rows": sum(len(v) for v in morts.values()),
       "all_home_sales": share(rows), "resales": share(rs),
       "resales_person_buyer": share([r for r in rs if r["ek"] == "person"]),
       "resales_company_buyer": share([r for r in rs if r["ek"] == "company"]),
       "resale_houses": share([r for r in rs if not r["condo"]]), "resale_condos": share([r for r in rs if r["condo"]]),
       "resale_houses_by_band": [{"band": l, **share([r for r in rs if not r["condo"] and a <= r["cons"] < b])} for a, b, l in BANDS],
       "resale_condos_by_band": [{"band": l, **share([r for r in rs if r["condo"] and a <= r["cons"] < b])} for a, b, l in BANDS],
       "no_mortgage_resales_by_buyer_kind_floor": dict(collections.Counter(r["ek"] for r in rs if not r["broad"])),
       "builder_sales": share([r for r in rows if r["builder"]])}
json.dump(res, open(os.path.join(out, "cash-share.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
