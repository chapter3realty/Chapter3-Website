"""Repeat home buyers in Horry County, deeds recorded 2025-10-01..2026-09-30.
Joins the 2026-10-d kept home sales (data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json: one-parcel
residential sales with a building, $10,000 or more, no tax sale or corrective deed) to the raw AcclaimWeb rows
(first-named grantee) and counts buyers who recorded two or more home purchases.
Usage: DEEDS=<dir of deeds-YYYY-MM-DD.json> python3 -I analyze_repeat.py <this dir> <path to out-of-state-buyers.json>
Writes repeat-buyers.json (counts only; no names, PINs or addresses) and, to RAW (scratch), repeat-pins.json."""
import sys, os, json, glob, re, collections, statistics
D, SALES = sys.argv[1], sys.argv[2]
RAW = os.environ.get("RAW", os.path.join(D, "raw-private")); os.makedirs(RAW, exist_ok=True)
rows = {r["BookPage"]: r for f in sorted(glob.glob(os.path.join(os.environ["DEEDS"], "deeds-2*.json"))) for r in json.load(open(f))["Data"]}
S = json.load(open(SALES))["sales"]
COMPANY = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LP|LLP|LTD|PARTNERS|PARTNERSHIP|HOLDINGS|PROPERTIES|INVESTMENTS?|GROUP|ENTERPRISES|BANK|ASSOCIATION|FUND|REIT|TRUST|TRUSTEE|TR)\b")
INSTITUTION = re.compile(r"OPENDOOR|OFFERPAD|CARTUS|SIRVA|RELOCATION|SECRETARY OF|HOUSING AND URBAN|VETERANS AFFAIRS|FEDERAL NATIONAL|FEDERAL HOME LOAN|FANNIE|FREDDIE|\bBANK\b|MORTGAGE|SERVICING|NATIONAL ASSOCIATION|\bHUD\b|\bREO\b")
BUILDER = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|DREAM FINDERS|BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOME BUILDERS|DEVELOPMENT")
def norm(n): return re.sub(r"[^A-Z0-9 ]", "", (n or "").upper()).replace(" ", "")
by = collections.defaultdict(list); miss = 0
for s in S:
    r = rows.get(s["bp"])
    if not r: miss += 1; continue
    g = r["IndirectName"] or ""
    if any(x["pin"] == s["pin"] for x in by[norm(g)]): continue   # same home twice (resale or second deed): count it once
    by[norm(g)].append(dict(s, grantee=g))
def kind(g):
    if INSTITUTION.search(g): return "institution"
    if BUILDER.search(g): return "builder"
    if COMPANY.search(g): return "company"
    return "person"
buyers = {k: v for k, v in by.items() if k}
out = {"source": "Horry County AcclaimWeb DEED (001) recorded 2025-10-01..2026-09-30 (30,339 deeds, 2026-10-d pull); kept home sales from data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json",
       "method": "Homes = distinct parcels per buyer. Buyer = the deed index's first-named grantee, letters and digits only. A couple listed in a different order on two deeds counts as two buyers, so repeat counts are a floor.",
       "home_sales": len(S), "unmatched": miss, "buyers": len(buyers)}
tiers = collections.Counter(); kinds = collections.defaultdict(lambda: collections.Counter()); homes_by_kind = collections.Counter()
rep_sales = []; pins = []
for k, v in buyers.items():
    n = len(v); kd = kind(v[0]["grantee"])
    t = "1" if n == 1 else "2" if n == 2 else "3-4" if n <= 4 else "5-9" if n <= 9 else "10+"
    tiers[t] += 1; kinds[kd][t] += 1
    if n >= 2:
        homes_by_kind[kd] += n
        if kd in ("person", "company"):
            rep_sales += v; pins += [x["pin"] for x in v]
out["buyers_by_count"] = dict(tiers)
out["buyers_by_kind_and_count"] = {k: dict(v) for k, v in kinds.items()}
out["homes_bought_by_repeat_buyers_by_kind"] = dict(homes_by_kind)
pc = [k for k, v in buyers.items() if len(v) >= 2 and kind(v[0]["grantee"]) in ("person", "company")]
out["repeat_person_or_company"] = {"buyers": len(pc), "homes": len(rep_sales),
    "share_of_all_home_sales_pct": round(100 * len(rep_sales) / len(S), 1),
    "people": sum(1 for k in pc if kind(buyers[k][0]["grantee"]) == "person"),
    "companies": sum(1 for k in pc if kind(buyers[k][0]["grantee"]) == "company"),
    "homes_by_people": sum(len(buyers[k]) for k in pc if kind(buyers[k][0]["grantee"]) == "person"),
    "homes_by_companies": sum(len(buyers[k]) for k in pc if kind(buyers[k][0]["grantee"]) == "company"),
    "exactly_two": sum(1 for k in pc if len(buyers[k]) == 2),
    "condo_share_pct": round(100 * sum(1 for x in rep_sales if x["condo"]) / len(rep_sales), 1),
    "median_price": statistics.median(x["cons"] for x in rep_sales),
    "median_price_all_sales": statistics.median(x["cons"] for x in S),
    "tax_bill_outside_sc_pct": round(100 * sum(1 for x in rep_sales if x["owner_is_grantee"] and x["where"] in ("US", "CANADA", "OTHER")) / max(1, sum(1 for x in rep_sales if x["owner_is_grantee"])), 1),
    "from_builder_pct": round(100 * sum(1 for x in rep_sales if x["builder"]) / len(rep_sales), 1)}
# people who bought exactly two: days between the two deeds
gaps = []
for k in pc:
    v = buyers[k]
    if len(v) == 2 and kind(v[0]["grantee"]) == "person":
        a, b = sorted(x["date"] for x in v)
        import datetime
        da = datetime.date(*map(int, a.split("/"))); db = datetime.date(*map(int, b.split("/")))
        gaps.append((db - da).days)
if gaps:
    out["people_two_homes_days_between"] = {"n": len(gaps), "median": statistics.median(gaps), "same_day": sum(1 for g in gaps if g == 0),
        "within_30": sum(1 for g in gaps if g <= 30), "over_180": sum(1 for g in gaps if g > 180)}
# people who bought exactly two: same place?
same = 0; tot = 0
for k in pc:
    v = buyers[k]
    if len(v) == 2 and kind(v[0]["grantee"]) == "person":
        tot += 1; same += (v[0]["place"] == v[1]["place"])
out["people_two_homes_same_census_place"] = {"n": tot, "same": same}
json.dump(out, open(os.path.join(D, "repeat-buyers.json"), "w"), indent=1)
json.dump(sorted(set(pins)), open(os.path.join(RAW, "repeat-pins.json"), "w"))
print(json.dumps(out, indent=1))
