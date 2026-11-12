"""What investors pay, and what they resell for: Horry County deeds, Oct 2025 - Sep 2026.
Inputs: SALES = data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (13,194 kept home sales, no names)
        LANDUSE = RAW/landuse-107.json from fetch_landuse.py (parcels the county codes 107, condo unit)
        DEEDS = folder of AcclaimWeb weekly deed files (deeds-YYYY-MM-DD.json, from that folder's pull_deeds.py; they carry names, kept outside the repo)
Output: <outdir>/offmarket.json (counts and medians only; no names, PINs or book and page).
Usage: SALES=... LANDUSE=... DEEDS=... python3 -I deeds_offmarket.py <outdir>"""
import sys, os, json, glob, re, statistics, collections, datetime
out = sys.argv[1]
S = json.load(open(os.environ["SALES"]))["sales"]
L107 = set(json.load(open(os.environ["LANDUSE"]))["pins_107"])  # fetch_landuse.py
for s in S: s["condo"] = bool(s["condo"] or s["pin"] in L107)  # the /sell/home-value/ rule: land use 107 or HPR
rows = {r["BookPage"]: r for f in sorted(glob.glob(os.path.join(os.environ["DEEDS"], "deeds-2*.json"))) for r in json.load(open(f))["Data"]}
COMPANY = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LP|LLP|LTD|PARTNERS|PARTNERSHIP|HOLDINGS|PROPERTIES|INVESTMENTS?|GROUP|ENTERPRISES|BANK|ASSOCIATION|FUND|REIT)\b")
TRUST = re.compile(r"\bTRUST|TRUSTEE|ESTATE OF|LIVING TR|REVOCABLE")
BUILDER = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|H & H CONSTRUCTORS|RS PARKER|DRB GROUP|DREAM FINDERS|HOWELL HOMES|MILLROSE|LEWIS CONSTRUCTION|CHRIS MANNING|CAROLINA COTTAGE|HUNTER QUINN|BRADLEY JONES|SANDS BUILDING|OCEAN PALMS BUILDERS|INFINITY CUSTOM|ALMOND QUALITY|AG EHC|KL LB BUY|BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOMES OF|HOME BUILDERS|DEVELOPMENT")  # same as the sales file
STOP = {"LLC","INC","THE","OF","AND","CO","CORP","L","C","TRUST","TRUSTEE","REVOCABLE","LIVING","ET","AL","UX","VIR","JR","SR","II","III","PROPERTIES","HOLDINGS","GROUP","INVESTMENTS","INVESTMENT","COMPANY","LP","LLP","LTD","REALTY","HOMES","HOME","SC","OF"}
def toks(n): return {t for t in re.findall(r"[A-Z0-9]+", (n or "").upper()) if len(t) > 2 and t not in STOP}
def med(v): return round(statistics.median(v), 3) if v else None
def q(v, p): v = sorted(v); return round(v[int(p * (len(v) - 1))], 3) if v else None
def d(s): return datetime.date(*map(int, s.split("/")))
for s in S:
    r = rows.get(s["bp"], {}); s["_grantor"] = r.get("DirectName") or ""; s["_grantee"] = r.get("IndirectName") or ""
res = [s for s in S if not s["builder"]]
R = {"meta": {"made": "deeds_offmarket.py", "sales_file": "data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json",
              "source": "Horry County AcclaimWeb DEED (001) recorded 2025-10-01..2026-09-30; county market value from Horry County GIS parcel layer 24, read 2026-11-01",
              "rules": "Condo = county land use 107 or HPR in the legal description (the /sell/home-value/ rule). Resale = seller is not a home builder (BUILDER pattern of the sales file). Company buyer = buyer name matches the COMPANY pattern (LLC, INC, CORP, PROPERTIES, INVESTMENTS and so on); trusts and estates count as people. Ratio = recorded price / county market value of the parcel. Resale pair = the same parcel sold twice in the window, no builder on either side of the first deed, where the second seller's name shares a word with the first buyer's name.",
              "note": "No names, parcel numbers or book and page are written here."}}
R["counts"] = {"kept_sales": len(S), "resales": len(res), "resale_company_buyer": sum(s["company"] for s in res),
               "resale_house": sum(not s["condo"] for s in res), "resale_condo": sum(s["condo"] for s in res),
               "resale_house_company": sum(s["company"] and not s["condo"] for s in res), "resale_condo_company": sum(s["company"] and s["condo"] for s in res)}
R["ratio_to_county_value"] = {}
for kind, f in (("house", lambda s: not s["condo"]), ("condo", lambda s: s["condo"])):
    for who, g in (("company", lambda s: s["company"]), ("person", lambda s: not s["company"])):
        v = [s["cons"] / s["market_prop"] for s in res if f(s) and g(s) and (s["market_prop"] or 0) > 20000]
        pr = [s["cons"] for s in res if f(s) and g(s)]
        R["ratio_to_county_value"][f"{kind}_{who}"] = {"n": len(v), "median_ratio": med(v), "p25": q(v, .25), "p75": q(v, .75), "median_price": med(pr)}
# same parcel sold twice
by = collections.defaultdict(list)
for s in S: by[s["pin"]].append(s)
pairs = []
for pin, xs in by.items():
    xs.sort(key=lambda s: s["date"])
    for a, b in zip(xs, xs[1:]):
        if a["bp"] == b["bp"]: continue
        if not (toks(a["_grantee"]) & toks(b["_grantor"])): continue
        days = (d(b["date"]) - d(a["date"])).days
        if days < 1: continue
        if BUILDER.search(a["_grantee"]) or BUILDER.search(a["_grantor"]): continue  # a builder on either side of the first deed: new construction, not a resale bought and resold
        pairs.append({"second_buyer_company": b["company"], "first_buyer_company": a["company"], "first_seller_builder": a["builder"], "condo": a["condo"], "days": days,
                      "p1": a["cons"], "p2": b["cons"], "ratio": b["cons"] / a["cons"], "v": a["market_prop"] or 0})
def summ(ps):
    r = [p["ratio"] for p in ps]
    return {"n": len(ps), "median_resale_over_purchase": med(r), "median_purchase_over_resale": med([p["p1"] / p["p2"] for p in ps]), "p25": q(r, .25), "p75": q(r, .75),
            "median_days_between_deeds": med([p["days"] for p in ps]), "median_first_price": med([p["p1"] for p in ps]),
            "median_second_price": med([p["p2"] for p in ps]), "first_over_county_value": med([p["p1"] / p["v"] for p in ps if p["v"] > 20000]),
            "second_buyer_company": sum(p["second_buyer_company"] for p in ps),
            "share_resold_for_more": round(sum(p["ratio"] > 1 for p in ps) / len(ps), 3) if ps else None}
cb = [p for p in pairs if p["first_buyer_company"] and not p["first_seller_builder"]]
R["resold_pairs"] = {"all": summ(pairs), "company_bought_resale": summ(cb),
                     "company_bought_resale_house": summ([p for p in cb if not p["condo"]]),
                     "company_bought_resale_condo": summ([p for p in cb if p["condo"]]),
                     "person_bought_resale": summ([p for p in pairs if not p["first_buyer_company"] and not p["first_seller_builder"]])}
json.dump(R, open(os.path.join(out, "offmarket.json"), "w"), indent=1)
print(json.dumps(R, indent=1))
