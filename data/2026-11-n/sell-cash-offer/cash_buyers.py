"""Who buys Horry County homes with a company name on the deed, what they pay, and what they resell for.
Inputs: SALES = data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (13,194 home sales: deeds recorded
2025-10-01..2026-09-30, $10,000 or more, one residential parcel with a building, tax sales and corrective deeds left out);
DEEDS = folder of the weekly AcclaimWeb DEED (001) pulls made by that folder's pull_deeds.py (first-named grantor = DirectName,
first-named grantee = IndirectName). The deed rows carry names, so they stay out of the repo; this script writes no names.
Run: SALES=<sales.json> DEEDS=<raw dir> python3 -I cash_buyers.py <outdir>  -> <outdir>/cash-buyers.json
A deed names a buyer, not how it paid. "Company buyer" is a stand-in for the investor buyers a cash-offer seller meets."""
import json, os, sys, glob, re, statistics as st, collections, datetime
out = sys.argv[1]
sales = json.load(open(os.environ["SALES"]))["sales"]
deeds = {}
for f in sorted(glob.glob(os.path.join(os.environ["DEEDS"], "deeds-20*.json"))):
    for r in json.load(open(f))["Data"]:
        deeds[r["BookPage"]] = (r["DirectName"] or "", r["IndirectName"] or "", r["CompressedDirectName"] or "", r["CompressedIndirectName"] or "")
BANKGOV = re.compile(r"\b(BANK|FEDERAL|NATIONAL MORTGAGE|FANNIE|FREDDIE|SECRETARY|HOUSING AND URBAN|VETERANS|CREDIT UNION|MORTGAGE|LOAN|SAVINGS|"
                     r"COUNTY|CITY OF|TOWN OF|STATE OF|UNITED STATES|AUTHORITY|HABITAT|CHURCH|MINISTR|SCHOOL|UNIVERSITY)\b")
ENTITY = re.compile(r"\b(LLC|L L C|LLC\.|INC|INC\.|INCORPORATED|CORP|CORPORATION|COMPANY|CO|LP|L P|LLP|LLLP|LTD|PLLC|PARTNERSHIP|PARTNERS|"
                    r"HOLDINGS?|PROPERTIES|PROPERTY|INVESTMENTS?|INVESTORS?|GROUP|ENTERPRISES?|VENTURES?|CAPITAL|REALTY|FUND|REIT|"
                    r"ACQUISITIONS?|RENTALS?|ASSETS|HOMES|SOLUTIONS|DEVELOPMENT|BUILDERS?|CONSTRUCTION)\b")
TRUST = re.compile(r"\b(TRUSTEES?|TRUST|TR|TRS|REVOCABLE|LIVING TRUST)\b")
ESTATE = re.compile(r"\b(ESTATE|EST|PERS REP|PR|PERSONAL REPRESENTATIVE|EXECUTOR|EXECUTRIX|HEIRS)\b")
def kind(n):
    n = n.strip().upper()
    if not n: return "blank"
    if BANKGOV.search(n): return "bank_or_agency"
    if ENTITY.search(n): return "company"
    if TRUST.search(n): return "trust"
    if ESTATE.search(n): return "estate"
    return "person"
rows = []
for s in sales:
    d = deeds.get(s["bp"])
    if not d: continue
    g, e, cg, ce = d
    rows.append({**s, "gk": kind(g), "ek": kind(e), "cg": cg, "ce": ce})
resale = [r for r in rows if not r["builder"]]
med = lambda xs: round(st.median(xs)) if xs else None
def pct(a, b): return round(100 * a / b, 1) if b else None
def share(rs):
    n = len(rs); c = sum(1 for r in rs if r["ek"] == "company")
    return {"sales": n, "company_buyer": c, "pct_company": pct(c, n)}
BANDS = [(0, 150000, "under $150,000"), (150000, 250000, "$150,000 to $249,999"), (250000, 350000, "$250,000 to $349,999"),
         (350000, 500000, "$350,000 to $499,999"), (500000, 1e12, "$500,000 and up")]
def band(c): return next(l for a, b, l in BANDS if a <= c < b)
res = {"meta": {"made": "cash_buyers.py", "sales_file": "data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json",
                "deeds": "Horry County Register of Deeds, AcclaimWeb DEED (001), recorded 2025-10-01..2026-09-30, first-named grantor and grantee",
                "company": "first-named grantee's name has LLC, Inc., Corp., Company, LP, Ltd., Holdings, Properties, Investments, Group, Homes, Rentals and like words; banks, government, churches and charities counted apart",
                "resale": "seller is not a home builder (builder list in out-of-state analyze.py)",
                "note": "No names are written here. A deed shows who bought, not whether they paid cash."}}
res["home_sales"] = len(rows)
res["resales"] = len(resale)
res["buyer_kinds_resale"] = collections.Counter(r["ek"] for r in resale).most_common()
res["all_resales"] = share(resale)
res["resales_seller_person_or_trust_or_estate"] = share([r for r in resale if r["gk"] in ("person", "trust", "estate")])
res["resales_seller_estate"] = share([r for r in resale if r["gk"] == "estate"])
res["houses_resale"] = share([r for r in resale if not r["condo"]])
res["condos_resale"] = share([r for r in resale if r["condo"]])
res["by_band_resale"] = [{"band": l, **share([r for r in resale if a <= r["cons"] < b])} for a, b, l in BANDS]
res["by_band_houses_resale"] = [{"band": l, **share([r for r in resale if not r["condo"] and a <= r["cons"] < b])} for a, b, l in BANDS]
by_place = collections.defaultdict(list)
for r in resale: by_place[r.get("place") or "unknown"].append(r)
res["by_place_resale_min150"] = sorted([{"place": k, **share(v)} for k, v in by_place.items() if len(v) >= 150], key=lambda x: -x["pct_company"])
by_month = collections.defaultdict(list)
for r in resale: by_month[r["date"][:7]].append(r)
res["by_month_resale"] = [{"month": m.replace("/", "-"), **share(v)} for m, v in sorted(by_month.items())]
IBUY = re.compile(r"OPENDOOR|OFFERPAD|REDFINNOW|ZILLOWHOMES|KNOCKHOMES|ORCHARDPROPERT")
res["instant_offer_company_buyers_resale"] = sum(1 for r in resale if r["ek"] in ("company", "trust") and IBUY.search(r["ce"]))
c = collections.Counter(r["ce"] for r in resale if r["ek"] == "company")
res["company_buyers"] = {"distinct_names": len(c), "names_with_one_purchase": sum(1 for v in c.values() if v == 1),
                         "names_with_5_or_more": sum(1 for v in c.values() if v >= 5), "purchases_by_names_with_5_or_more": sum(v for v in c.values() if v >= 5)}
res["median_price_resale"] = {"company_buyer": med([r["cons"] for r in resale if r["ek"] == "company"]),
                              "person_buyer": med([r["cons"] for r in resale if r["ek"] == "person"]),
                              "house_company_buyer": med([r["cons"] for r in resale if r["ek"] == "company" and not r["condo"]]),
                              "house_person_buyer": med([r["cons"] for r in resale if r["ek"] == "person" and not r["condo"]]),
                              "house_all": med([r["cons"] for r in resale if not r["condo"]])}
# Same-neighborhood test: company buyer's price / median price people paid in the same subdivision or building (county legal
# description before ';'), same kind (condo or not), 5 or more person-buyer resales in the group.
G = collections.defaultdict(list)
for r in resale:
    if r["ek"] == "person" and r.get("group"): G[(r["group"], r["condo"])].append(r["cons"])
def ratio(r, k=5):
    xs = G.get((r.get("group"), r["condo"]), [])
    return r["cons"] / st.median(xs) if len(xs) >= k else None
def dist(xs):
    xs = sorted(xs)
    if not xs: return None
    return {"n": len(xs), "median": round(st.median(xs), 3), "p25": round(xs[len(xs) // 4], 3), "p75": round(xs[3 * len(xs) // 4], 3),
            "share_below_80pct": pct(sum(1 for x in xs if x < 0.8), len(xs)), "share_below_70pct": pct(sum(1 for x in xs if x < 0.7), len(xs))}
res["vs_neighbors"] = {
    "rule": "price / median price person buyers paid in the same subdivision or building, same kind, 5+ person-buyer resales; seller a person, trust or estate",
    "house_company_buyer": dist([x for x in (ratio(r) for r in resale if r["ek"] == "company" and r["gk"] in ("person", "trust", "estate") and not r["condo"]) if x]),
    "condo_company_buyer": dist([x for x in (ratio(r) for r in resale if r["ek"] == "company" and r["gk"] in ("person", "trust", "estate") and r["condo"]) if x]),
}
# Resales by the same company: a deed to a company, then a later deed of the same parcel in the window from that same company.
byp = collections.defaultdict(list)
for r in rows: byp[r["pin"]].append(r)
def dt(s): return datetime.date(*map(int, s.split("/")))
# Builder-like names (a lot bought, then a house built and sold) are left out, and so is a first price under a quarter of the
# second (a lot or a part interest, not a house); the count left out by that floor is written as "left_out_under_25pct".
BUILDLIKE = re.compile(r"HOMESINC|HOMESLLC|BUILDER|CONSTRUCT|HOMEPLACE|DEVELOP")
pairs = []; low = []
for pin, rs in byp.items():
    rs.sort(key=lambda r: (r["date"], r["bp"]))
    for i, a in enumerate(rs):
        if a["ek"] != "company" or a["builder"] or BUILDLIKE.search(a["ce"]): continue
        for b in rs[i + 1:]:
            if b["cg"] and a["ce"] and (b["cg"] == a["ce"] or b["cg"][:14] == a["ce"][:14]):
                if a["cons"] < 0.25 * b["cons"]:
                    low.append(1); break
                pairs.append({"days": (dt(b["date"]) - dt(a["date"])).days, "buy": a["cons"], "sell": b["cons"], "condo": a["condo"],
                              "first_seller": a["gk"], "second_buyer": b["ek"]})
                break
def summ(ps):
    if not ps: return None
    r = [p["buy"] / p["sell"] for p in ps]
    gap = [p["sell"] - p["buy"] for p in ps]
    return {"n": len(ps), "median_days": med([p["days"] for p in ps]), "median_buy": med([p["buy"] for p in ps]), "median_sell": med([p["sell"] for p in ps]),
            "median_buy_as_pct_of_sell": round(100 * st.median(r), 1), "p25_pct": round(100 * sorted(r)[len(r) // 4], 1), "p75_pct": round(100 * sorted(r)[3 * len(r) // 4], 1),
            "median_gap": med(gap), "share_sold_for_more": pct(sum(1 for g in gap if g > 0), len(gap)),
            "second_buyer_person": pct(sum(1 for p in ps if p["second_buyer"] == "person"), len(ps))}
res["company_resold"] = {
    "rule": "same parcel; deed to a company (seller not a builder), then a later deed in the window whose first-named grantor is that company (compressed name match). Both deeds must be in the 12-month window, so every hold here is under a year.",
    "all": summ(pairs),
    "within_30_days": summ([p for p in pairs if p["days"] <= 30]),
    "within_30_days_from_person_seller": summ([p for p in pairs if p["days"] <= 30 and p["first_seller"] in ("person", "trust", "estate")]),
    "31_to_365_days": summ([p for p in pairs if p["days"] > 30]),
    "31_to_365_days_houses_from_person_seller": summ([p for p in pairs if p["days"] > 30 and not p["condo"] and p["first_seller"] in ("person", "trust", "estate")]),
    "left_out_under_25pct": len(low),
}
json.dump(res, open(os.path.join(out, "cash-buyers.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
