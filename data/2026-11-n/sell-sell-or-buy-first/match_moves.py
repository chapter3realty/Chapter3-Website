"""Horry County owners who sold one home and bought another in the county within a year, from county deeds.
Reuses the deed pull and parcel file of data/2026-11-n/sell-best-time-to-sell/ (pull_deeds.py, fetch_parcels.py).
Inputs (RAW): deeds-YYYY-MM[a|b].json (AcclaimWeb DEED 001 index), parcels.json (GIS layer 24).
Writes RAW/pairs.json (names, parcel numbers: stays outside the repo) and <datadir>/moves.json (counts only).
Usage: RAW=<scratch dir with the best-time-to-sell raw files> OUT=<scratch dir for pairs> python3 -I match_moves.py <datadir>"""
import sys, json, glob, os, re, statistics, collections, datetime
D = sys.argv[1]; RAW = os.environ["RAW"]; OUT = os.environ.get("OUT", RAW)
rows = [r for f in sorted(glob.glob(os.path.join(RAW, "deeds-20*.json"))) for r in json.load(open(f))["Data"]]
P = {str(int(p["PIN"])).zfill(11): p for p in json.load(open(os.path.join(RAW, "parcels.json")))}
# Same builder list and filters as data/2026-11-n/sell-best-time-to-sell/analyze.py
BUILDER = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|H & H CONSTRUCTORS|RS PARKER|DRB GROUP|DREAM FINDERS|HOWELL HOMES|MILLROSE|LEWIS CONSTRUCTION|CHRIS MANNING|CAROLINA COTTAGE|HUNTER QUINN|BRADLEY JONES|SANDS BUILDING|OCEAN PALMS BUILDERS|INFINITY CUSTOM|ALMOND QUALITY|AG EHC|KL LB BUY|BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOMES OF|HOME BUILDERS|DEVELOPMENT")
TAXSALE = re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY|FORECLOS")
CORR = re.compile(r"CORRECT|RE-RECORD")
# A party that is not one person: companies, trusts, estates, banks, governments, churches, relocation firms.
ENTITY = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LTD|LP|LLP|PLLC|PA|TRUST|TRUSTS|TR|TRS|TRUSTEE|TRUSTEES|TTEE|ESTATE|EST|BANK|ASSOC|ASSOCIATION|PARTNERS|PARTNERSHIP|HOLDINGS|PROPERTIES|PROPERTY|INVESTMENTS?|INVESTORS|REALTY|GROUP|FUND|CHURCH|MINISTRIES|CITY|COUNTY|STATE|SECRETARY|FEDERAL|MORTGAGE|HOMES|ENTERPRISES|VENTURES|CAPITAL|RELOCATION|CARTUS|SIRVA|OPENDOOR|OFFERPAD|REDFIN|HOUSING|AUTHORITY|UNITED|NATIONAL|FINANCIAL|SERVICES|MANAGEMENT|RENTALS?|REVOCABLE|IRREVOCABLE|LIVING|FAMILY|PERSONAL REPRESENTATIVE|PR|AS|ATTY|ATTORNEY|GUARDIAN|CONSERVATOR|AGENT|POA)\b")
def norm(n):
    n = re.sub(r"[^A-Z ]", " ", (n or "").upper())
    n = re.sub(r"\b(ETAL|ET AL|ET UX|ETUX|AKA|FKA|NKA)\b.*$", "", n)
    return " ".join(n.split())
def person(n): return bool(n) and not ENTITY.search(n) and len(n.split()) >= 3
bp = collections.defaultdict(set)
for r in rows: bp[r["BookPage"]].add((r["ParcelNumber"] or "").strip())
seen = set(); deeds = []; cnt = collections.Counter()
for r in rows:
    key = (r["BookPage"], r["TransactionItemId"])
    if key in seen: continue
    seen.add(key)
    d = r["RecordDate"].replace("/", "-")
    if d < "2020-07-01": continue
    pin = (r["ParcelNumber"] or "").strip(); c = r["Consideration"] or 0
    if c < 10000 or not (pin.isdigit() and len(pin) == 11) or len(bp[r["BookPage"]]) > 1: continue
    if TAXSALE.search((r["DirectName"] or "") + " " + (r["IndirectName"] or "")) or CORR.search(r["Comments"] or ""): continue
    p = P.get(pin)
    if not p or not ((p["LandUseCode"] or "").startswith("1") and (p["MarketImprv"] or 0) > 0): continue
    if BUILDER.search(r["IndirectName"] or ""): continue
    mp = p["MarketProp"] or 0
    if mp and c < 0.3 * mp: continue
    deeds.append({"date": d, "pin": pin, "cons": c, "bp": r["BookPage"], "seller": norm(r["DirectName"]), "buyer": norm(r["IndirectName"]),
                  "new": bool(BUILDER.search(r["DirectName"] or "")), "condo": "HPR" in (p["LegalDescr"] or "")})
print(len(deeds), "home deeds 2020-07 to 2026-10", file=sys.stderr)
# How often each person's name appears on these deeds, either side. A name on more than 4 deeds is an investor or a common name: left out.
freq = collections.Counter()
for x in deeds:
    freq[x["seller"]] += 1; freq[x["buyer"]] += 1
MAXF = int(os.environ.get("MAXF", "4"))
buys = collections.defaultdict(list)
for x in deeds:
    if person(x["buyer"]) and freq[x["buyer"]] <= MAXF: buys[x["buyer"]].append(x)
day = lambda s: datetime.date.fromisoformat(s)
S0, S1 = "2021-07-01", "2025-10-31"   # sales with a full year of deeds on both sides
sales = [x for x in deeds if not x["new"] and S0 <= x["date"] <= S1]
c = collections.Counter(); c["resales"] = len(sales)
ps = [x for x in sales if person(x["seller"])]; c["resales_person_seller"] = len(ps)
ok = [x for x in ps if freq[x["seller"]] <= MAXF]; c[f"resales_person_seller_name_on_{MAXF}_or_fewer_deeds"] = len(ok)
pairs = []; far = collections.Counter()
for s in ok:
    cand = [b for b in buys.get(s["seller"], []) if b["pin"] != s["pin"]]
    if not cand: continue
    g = [((day(b["date"]) - day(s["date"])).days, b) for b in cand]
    near = [t for t in g if abs(t[0]) <= 365]
    # chance-match check, only for sales with two years of deeds on both sides
    if "2022-07-01" <= s["date"] <= "2024-10-31":
        if near: far["within_365"] += 1
        elif any(366 <= abs(t[0]) <= 730 for t in g): far["366_to_730"] += 1
    if not near: continue
    gap, b = min(near, key=lambda t: (abs(t[0]), t[0]))
    pairs.append({"sale": s, "buy": b, "gap": gap})
# one purchase counts once: if two sales match the same purchase, keep the nearer one
best = {}
for p in pairs:
    k = p["buy"]["bp"]
    if k not in best or (abs(p["gap"]), p["gap"]) < (abs(best[k]["gap"]), best[k]["gap"]): best[k] = p
c["pairs_before_one_sale_per_purchase"] = len(pairs); pairs = list(best.values())
# today's assessment of the purchased home (fetch_assess.py): 4 percent = the buyer's legal residence, if the buyer still owns it
A = {}
af = os.path.join(OUT, "assess.json")
if os.path.exists(af): A = json.load(open(af))
def lives(p):
    a = A.get(p["buy"]["pin"])
    if not a or not a.get("TaxableProp"): return None
    still = (a["DeedBook"] or "").strip().lstrip("0") + "/" + (a["DeedPage"] or "").strip().lstrip("0") == "/".join(z.lstrip("0") for z in p["buy"]["bp"].split("/"))
    if not still: return "sold_again_or_changed"
    return "legal_residence_4pct" if a["AssessedProp"] / a["TaxableProp"] < 0.05 else "six_pct"
pc = sum(1 for s in ok if "2022-07-01" <= s["date"] <= "2024-10-31")
def kind(gap):
    if gap == 0: return "same_day"
    if abs(gap) <= 7: return "within_a_week"
    return "bought_first" if gap < 0 else "sold_first"
K = collections.Counter(kind(p["gap"]) for p in pairs)
med = lambda v: statistics.median(v) if v else None
bf = [-p["gap"] for p in pairs if p["gap"] < -7]; sf = [p["gap"] for p in pairs if p["gap"] > 7]
def band(v, edges):
    out = collections.OrderedDict()
    for lo, hi in edges: out[f"{lo}-{hi}"] = sum(1 for z in v if lo <= z <= hi)
    return out
E = [(8, 30), (31, 60), (61, 90), (91, 180), (181, 365)]
up = [p for p in pairs if p["buy"]["cons"] > p["sale"]["cons"]]
ratio = [p["buy"]["cons"] / p["sale"]["cons"] for p in pairs]
def bykind(sel):
    v = [p for p in pairs if sel(p)]
    return {"n": len(v), "same_day": sum(kind(p["gap"]) == "same_day" for p in v), "within_a_week": sum(kind(p["gap"]) == "within_a_week" for p in v),
            "bought_first": sum(kind(p["gap"]) == "bought_first" for p in v), "sold_first": sum(kind(p["gap"]) == "sold_first" for p in v)}
byyear = {y: bykind(lambda p, y=y: p["sale"]["date"][:4] == str(y)) for y in range(2021, 2026)}
res = {"meta": {"made": "match_moves.py", "source": "Horry County Register of Deeds AcclaimWeb DEED (001) index, recorded 2020-07-01 to 2026-10-31 (pull of data/2026-11-n/sell-best-time-to-sell/), and Horry County GIS parcel layer 24 read 2026-11-08",
                "rule": "A home deed: $10,000 or more on one parcel, no tax sale, sheriff, master-in-equity, foreclosure or corrective deed, a residential parcel (land use 1xx) with a building on today's roll, not sold to a builder, price at least 30 percent of the county's market value. A sale: a home deed recorded 2021-07-01 to 2025-10-31 whose seller is not a builder. A move: the first-named seller on the sale deed is, letter for letter, the first-named buyer on a home deed for a different parcel recorded within 365 days before or after. Only names of one person with three or more words (first, middle or initial, last) count, and only if the name is on 4 or fewer home deeds in the whole period, so investors and common names drop out. When a seller has more than one such purchase, the nearest in time is used. Gap = purchase recording date minus sale recording date; 'same week' = 7 days or fewer apart.",
                "limits": "Each index row carries only the first-named seller and buyer, so a couple named in a different order on the two deeds is missed, and so is anyone who sold through a trust or bought in a new name. Moves into or out of the county are not counted. The count is a floor, not a total.",
                "note": "No names, addresses or parcel numbers in this file."},
           "counts": dict(c), "matched": len(pairs),
           "share_of_person_sales_matched_pct": round(100 * len(pairs) / len(ok), 1),
           "chance_check": {"sales_2022-07_to_2024-10": pc, "with_purchase_within_365_days": far["within_365"], "with_purchase_only_366_to_730_days_away": far["366_to_730"],
                            "note": "If name matches were chance, a purchase 1 to 2 years away would be about as common as one within a year. Some real moves take over a year, so the second number is an upper bound on chance matches."},
           "order": dict(K), "order_pct": {k: round(100 * v / len(pairs), 1) for k, v in K.items()},
           "bought_first_days": {"n": len(bf), "median": med(bf), "bands": band(bf, E)},
           "sold_first_days": {"n": len(sf), "median": med(sf), "bands": band(sf, E)},
           "price": {"bought_higher_n": len(up), "bought_higher_pct": round(100 * len(up) / len(pairs), 1), "median_purchase_over_sale": round(med(ratio), 3),
                     "median_sale": med([p["sale"]["cons"] for p in pairs]), "median_purchase": med([p["buy"]["cons"] for p in pairs])},
           "by_direction": {"bought_higher": bykind(lambda p: p["buy"]["cons"] > p["sale"]["cons"]), "bought_lower_or_same": bykind(lambda p: p["buy"]["cons"] <= p["sale"]["cons"])},
           "bought_new_from_builder": bykind(lambda p: p["buy"]["new"]), "bought_resale": bykind(lambda p: not p["buy"]["new"]),
           "condo_house": {f"{'condo' if p0 else 'house'}_to_{'condo' if p1 else 'house'}": sum(1 for p in pairs if p['sale']['condo'] == p0 and p['buy']['condo'] == p1) for p0 in (True, False) for p1 in (True, False)},
           "by_sale_year": byyear}
if A:
    L = collections.Counter(lives(p) for p in pairs)
    home = [p for p in pairs if lives(p) == "legal_residence_4pct"]
    hb = [-p["gap"] for p in home if p["gap"] < -7]; hs = [p["gap"] for p in home if p["gap"] > 7]
    KH = collections.Counter(kind(p["gap"]) for p in home)
    res["lives_there"] = {"rule": "The buyer on the purchase deed still owns the home (the county's current deed book and page are that deed's) and the county assesses it at the 4 percent legal residence ratio (assessed value under 5 percent of taxable value).",
                          "status": dict(L), "n": len(home), "order": dict(KH), "order_pct": {k: round(100 * v / len(home), 1) for k, v in KH.items()},
                          "bought_first_days": {"n": len(hb), "median": med(hb), "bands": band(hb, E)}, "sold_first_days": {"n": len(hs), "median": med(hs), "bands": band(hs, E)},
                          "bought_higher_pct": round(100 * sum(p["buy"]["cons"] > p["sale"]["cons"] for p in home) / len(home), 1),
                          "median_purchase_over_sale": round(med([p["buy"]["cons"] / p["sale"]["cons"] for p in home]), 3),
                          "by_direction": {"bought_higher": bykind(lambda p: p in home and p["buy"]["cons"] > p["sale"]["cons"]), "bought_lower_or_same": bykind(lambda p: p in home and p["buy"]["cons"] <= p["sale"]["cons"])},
                          "bought_new_from_builder": bykind(lambda p: p in home and p["buy"]["new"]),
                          "by_sale_year": {y: bykind(lambda p, y=y: p in home and p["sale"]["date"][:4] == str(y)) for y in range(2021, 2026)}}
res["meta"]["max_deeds_per_name"] = MAXF
json.dump(res, open(os.path.join(D, os.environ.get("NAME", "moves.json")), "w"), indent=1)
json.dump([{"gap": p["gap"], "sale": p["sale"], "buy": p["buy"]} for p in pairs], open(os.path.join(OUT, "pairs.json"), "w"))
print(json.dumps(res.get("lives_there"), indent=1)); print(json.dumps({k: res[k] for k in ("counts", "matched", "share_of_person_sales_matched_pct", "chance_check", "order", "order_pct", "bought_first_days", "sold_first_days", "price")}, indent=1))
