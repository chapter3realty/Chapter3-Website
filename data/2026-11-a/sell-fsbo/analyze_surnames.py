"""Home sales in Horry County between a seller and buyer who share a last name (a public-records stand-in for
"sold to someone they knew"), and how their prices compare with neighbors' sales.
Inputs: SALES = data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (13,194 home sales, deeds recorded
2025-10-01..2026-09-30, $10,000 or more, one residential parcel with a building); DEEDS = folder of the weekly AcclaimWeb
DEED (001) pulls (pull_deeds.py in that folder) with DirectName (first-named grantor) and IndirectName (first-named grantee).
The AcclaimWeb index holds one row per deed: the first-named grantor and grantee only.
Run: SALES=<sales.json> DEEDS=<raw dir> python3 -I analyze_surnames.py <outdir>. Writes <outdir>/surname-findings.json (no names)."""
import json, os, sys, glob, re, statistics as st, collections
out = sys.argv[1]
sales = json.load(open(os.environ["SALES"]))["sales"]
deeds = {}
for f in sorted(glob.glob(os.path.join(os.environ["DEEDS"], "deeds-20*.json"))):
    for r in json.load(open(f))["Data"]:
        deeds[r["BookPage"]] = (r["DirectName"] or "", r["IndirectName"] or "")
CO = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LTD|LP|LLP|PARTNERS|PARTNERSHIP|BANK|ASSOCIATION|ASSN|HOMES|BUILDERS|"
                r"PROPERTIES|PROPERTY|INVESTMENTS?|HOLDINGS|GROUP|TRUSTEES?|TRUST|TR|ESTATE|EST|FUND|MORTGAGE|FEDERAL|NATIONAL|"
                r"SECRETARY|HOUSING|DEVELOPMENT|REALTY|VENTURES|ENTERPRISES|CHURCH|CITY|COUNTY|STATE|UNITED|AUTHORITY|SERVICES?|"
                r"CAPITAL|LENDING|FINANCIAL|CREDIT|RESIDENTIAL|COMMUNITIES|CONSTRUCTION|SOLUTIONS|ASSETS|REO|PR|PERS REP|PERSONAL)\b")
def surname(n):
    n = n.strip()
    if not n or CO.search(n): return None
    return n.split()[0].strip(",")
def kind(n):
    n = n.strip()
    if not n: return "blank"
    if re.search(r"\b(TRUSTEES?|TRUST|TR)\b", n) and not re.search(r"\b(LLC|INC|BANK)\b", n): return "trust"
    if re.search(r"\b(ESTATE|EST|PERS REP|PR)\b", n): return "estate"
    return "company" if CO.search(n) else "person"
rows = []
missing = 0
for s in sales:
    d = deeds.get(s["bp"])
    if not d: missing += 1; continue
    g, e = d
    sg, se = surname(g), surname(e)
    selfdeed = bool(sg and se and g.split()[:2] == e.split()[:2])  # same surname and first name: one person deeding to themselves (and maybe another)
    rows.append({**s, "gk": kind(g), "ek": kind(e), "same": bool(sg and se and sg == se and not selfdeed), "selfdeed": selfdeed})
pp = [r for r in rows if r["gk"] == "person" and r["ek"] == "person" and not r["builder"] and not r["selfdeed"]]
selfdeeds = sum(1 for r in rows if r["gk"] == "person" and r["ek"] == "person" and not r["builder"] and r["selfdeed"])
same = [r for r in pp if r["same"]]
med = lambda xs: round(st.median(xs)) if xs else None
# Neighbors: other person-to-person resales in the same subdivision/legal group and of the same kind (condo or not), not same-surname.
groups = collections.defaultdict(list)
for r in pp:
    if not r["same"] and r.get("group"): groups[(r["group"], r["condo"])].append(r["cons"])
def ratio(r, k=5):
    xs = list(groups.get((r.get("group"), r["condo"]), []))
    if not r["same"] and r["cons"] in xs:
        xs.remove(r["cons"])
    return r["cons"] / st.median(xs) if len(xs) >= k else None
rs = [x for x in (ratio(r) for r in same) if x]
ro = [x for x in (ratio(r) for r in pp if not r["same"]) if x]
def dist(xs):
    xs = sorted(xs)
    return {"n": len(xs), "median": round(st.median(xs), 3), "p25": round(xs[len(xs) // 4], 3), "p75": round(xs[3 * len(xs) // 4], 3),
            "share_below_90pct": round(100 * sum(1 for x in xs if x < 0.9) / len(xs), 1),
            "share_below_75pct": round(100 * sum(1 for x in xs if x < 0.75) / len(xs), 1)}
res = {
    "meta": {"made": "analyze_surnames.py", "sales_file": "data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json",
             "deeds": "Horry County AcclaimWeb DEED (001), recorded 2025-10-01..2026-09-30, first-named grantor and grantee",
             "note": "No names are written here. A deed whose first-named grantor and grantee share a surname and first name (one person deeding to themselves, often adding a spouse) is left out. Same surname = the first word of the first-named grantor and grantee match, both people (not a company, trust or estate)."},
    "home_sales": len(sales), "matched_to_deed_row": len(rows), "missing_deed_row": missing,
    "kinds": collections.Counter(f'{r["gk"]}->{r["ek"]}' for r in rows).most_common(12),
    "self_deeds_left_out": selfdeeds, "person_to_person_resales": len(pp), "same_surname": len(same),
    "pct_same_of_person_to_person": round(100 * len(same) / len(pp), 1),
    "pct_same_of_all_home_sales": round(100 * len(same) / len(rows), 1),
    "median_price": {"same_surname": med([r["cons"] for r in same]), "other_person_to_person": med([r["cons"] for r in pp if not r["same"]]),
                     "all_home_sales": med([r["cons"] for r in rows]), "all_resales_not_builder": med([r["cons"] for r in rows if not r["builder"]]),
                     "houses_not_condo_resale": med([r["cons"] for r in rows if not r["builder"] and not r["condo"]])},
    "condo_share": {"same": round(100 * sum(r["condo"] for r in same) / len(same), 1), "other": round(100 * sum(r["condo"] for r in pp if not r["same"]) / (len(pp) - len(same)), 1)},
    "vs_neighbors_same_group_min5": {"same_surname": dist(rs), "other_person_to_person": dist(ro)},
    "vs_neighbors_same_group_min3": {"same_surname": dist([x for x in (ratio(r, 3) for r in same) if x]), "other_person_to_person": dist([x for x in (ratio(r, 3) for r in pp if not r["same"]) if x])},
    "same_surname_price_bands": collections.Counter(("under 100k" if r["cons"] < 100000 else "100k-200k" if r["cons"] < 200000 else "200k-300k" if r["cons"] < 300000 else "300k+") for r in same),
    "other_price_bands": collections.Counter(("under 100k" if r["cons"] < 100000 else "100k-200k" if r["cons"] < 200000 else "200k-300k" if r["cons"] < 300000 else "300k+") for r in pp if not r["same"]),
}
json.dump(res, open(os.path.join(out, "surname-findings.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
