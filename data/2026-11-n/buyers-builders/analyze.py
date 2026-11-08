"""Who builds the new homes in Horry County: our own count from county deeds, and the asking prices of their homes for sale now.

Inputs (all in this folder):
  raw/deeds-co.json     every DEED (001) recorded 2025-11-01 to 2026-10-31 (pull_deeds.py); a person's name is blanked
  raw/parcels.json      county parcel layer 24 for every parcel on a priced deed (pull_parcels.py)
  raw/postal-city.json  county address layer 22, postal city for each parcel a company sold (pull_parcels.py)
  argv[2] (optional)    the scratch pin file from pull_listings.py (holds the listing firm; never kept in this repo)
Writes findings.json. Every number on the page comes from findings.json.

Deed filter: the verified rule of data/2026-10-d/buyers-new-construction/verify_build_deeds.py, unchanged:
  consideration over $10,000; exactly one 11-digit parcel; no tax-sale or court party; memo without CORRECT, RE-RECORD,
  SEVERAL, PARCELS, TRACTS, LOTS or "n UNITS"; parcel in the county layer; residential land use code (starts with 1).
A builder sale: the seller (grantor) is one of the builder companies below and the buyer (grantee) is not a company
(a builder-to-builder lot sale or a sale to an HOA is not a home sale to a first owner). A buyer whose name was blanked is a person.
Usage: python3 -I analyze.py <this dir> [<scratch pins json>]"""
import json, sys, os, re, statistics as st, collections, math
D = sys.argv[1]
R = json.load(open(os.path.join(D, "raw", "deeds-co.json")))
P = json.load(open(os.path.join(D, "raw", "parcels.json")))["parcels"]
PC = json.load(open(os.path.join(D, "raw", "postal-city.json")))["postal_city"]

# seller name on the deed -> the name the builder sells under. "deed" is the company the deed names.
BUILDERS = [
    (r"\bD ?R HORTON INC|^HORTON D R", "D.R. Horton", "D R Horton Inc / DR Horton Inc"),
    (r"^LENNAR CAROLINAS", "Lennar", "Lennar Carolinas LLC"),
    (r"^NVR INC", "Ryan Homes", "NVR Inc"),
    (r"^PULTE HOME COMPANY", "Pulte Homes", "Pulte Home Company LLC"),
    (r"^MERITAGE HOMES OF THE CAROLINAS", "Meritage Homes", "Meritage Homes of the Carolinas Inc"),
    (r"^CLAYTON PROPERTIES GROUP", "Mungo Homes", "Clayton Properties Group Inc"),
    (r"^GREAT SOUTHERN HOMES", "Stanley Martin (Great Southern Homes)", "Great Southern Homes Inc"),
    (r"^BEVERLY HOMES", "Beverly Homes", "Beverly Homes LLC"),
    (r"^BEAZER HOMES", "Beazer Homes", "Beazer Homes LLC"),
    (r"^STARLIGHT HOMES SOUTH CAROLINA", "Starlight Homes", "Starlight Homes South Carolina LLC"),
    (r"^TOLL SOUTHEAST", "Toll Brothers", "Toll Southeast LP Company Inc"),
    (r"^ASHTON CHARLESTON RESIDENTIAL", "Ashton Woods", "Ashton Charleston Residential LLC"),
    (r"^H ?& ?H CONSTRUCTORS", "H&H Homes", "H & H Constructors of Fayetteville LLC"),
    (r"^DRB GROUP SOUTH CAROLINA", "DRB Homes", "DRB Group South Carolina LLC"),
    (r"^DREAM FINDERS HOMES", "Dream Finders Homes", "Dream Finders Homes LLC"),
    (r"^HOWELL HOMES", "Howell Homes", "Howell Homes Inc"),
    (r"^(BANBURY|BAYTREE|WATERBRIDGE|HERITAGE|CEDAR BRANCH) SC LLC$", "Chesapeake Homes (community companies)", "Banbury SC, Baytree SC, Waterbridge SC, Heritage SC, Cedar Branch SC LLC"),
    (r"^LEWIS CONSTRUCTION GROUP", "Lewis Construction Group", "Lewis Construction Group LLC"),
    (r"^CHRIS MANNING (BUILDERS|COMMUNITIES)", "Chris Manning", "Chris Manning Builders LLC / Communities"),
    (r"^CAROLINA COTTAGE HOMES", "Carolina Cottage Homes", "Carolina Cottage Homes LLC"),
    (r"^HUNTER QUINN HOMES", "Hunter Quinn Homes", "Hunter Quinn Homes LLC"),
    (r"^BRADLEY JONES CONSTRUCTION", "Bradley Jones", "Bradley Jones Construction LLC"),
    (r"^SANDS BUILDING GROUP", "Sands Building Group", "Sands Building Group Inc"),
    (r"^OCEAN PALMS BUILDERS", "Ocean Palms Builders", "Ocean Palms Builders LLC"),
    (r"^ALMOND QUALITY BUILDERS", "Almond Quality Builders", "Almond Quality Builders Inc"),
    (r"^INFINITY CUSTOM BUILT", "Infinity Custom Built Homes", "Infinity Custom Built Homes LLC"),
    (r"^AMERI BUILT HOMES", "Ameri Built Homes", "Ameri Built Homes Inc"),
    (r"^MUNGO HOMES", "Mungo Homes", "Mungo Homes Coastal Division Properties LLC"),
    (r"^STANLEY MARTIN|^SM SOUTH CAROLINA", "Stanley Martin", "Stanley Martin"),
]
def builder(n):
    for pat, lab, _ in BUILDERS:
        if re.search(pat, n or ""): return lab
    return None
OTHER_DEV = re.compile(r"BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOMES OF|HOME BUILDERS|DEVELOPMENT|COMMUNITIES|MILLROSE|LAND\b")
ASSOC = re.compile(r"ASSOCIATION|OWNERS|REGIME|COUNCIL OF CO")
TAX = re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO = re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
deeds = R["deeds"]; steps = collections.OrderedDict(); steps["all deeds"] = len(deeds)
k = [d for d in deeds if (d["Consideration"] or 0) > 10000]; steps["over $10,000"] = len(k)
k = [d for d in k if re.fullmatch(r"\d{11}", d["ParcelNumber"] or "")]; steps["one parcel number"] = len(k)
k = [d for d in k if not TAX.search((d["DirectName"] or "") + " " + (d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "")]; steps["not tax sale, corrective or multi-parcel memo"] = len(k)
k = [d for d in k if d["ParcelNumber"] in P]; steps["parcel in county layer"] = len(k)
k = [d for d in k if (P[d["ParcelNumber"]]["LandUseCode"] or "").startswith("1")]; steps["residential land use code"] = len(k)
for d in k:
    d["bl"] = builder(d["DirectName"])
    g = d["IndirectName"] or ""
    d["co_buyer"] = bool(g)
    # not a home sale to a first owner: a buyer that is itself a builder or developer, or an owners' association (common land)
    d["first_owner"] = d["bl"] is not None and not (builder(g) or OTHER_DEV.search(g) or ASSOC.search(g))
b = [d for d in k if d["first_owner"]]
excluded_company_buyer = collections.Counter(d["bl"] for d in k if d["bl"] and not d["first_owner"])

def sub(m):  # same subdivision parse as data/2026-10-d/buyers-new-construction/build_communities.py
    m = m or ""
    s = re.search(r"\bSUB (.+)$", m)
    if s: name = s.group(1)
    else:
        name = re.sub(r"^(LOT|UNIT|L)\s*[\w-]+\s*", "", m); name = re.sub(r"^TS [A-Z ]+", "", name).strip() or None
    if not name: return None
    name = re.sub(r"\b(PH(ASE)?|SEC(TION)?|SF|TR(ACT)?|BLK|BLOCK|POD|UNIT)\s*[\w-]*.*$", "", name).strip()
    name = re.sub(r"\s+(\d+[A-Z]?|[IVX]+)$", "", name).strip()
    name = re.sub(r"^HPR\s+|\s+U/APT/CONDO.*$", "", name).strip()
    name = re.sub(r"^CITY NORTH MYRTLE BEACH\s+", "", name)
    name = {"CRESCENT COVE HAGUE MARINA": "CRESCENT COVE", "BELLA VITA  PINE ISLAND": "BELLA VITA", "SPRINGS GROVE": "SPRING GROVE",
            "BLUE HERON RETREAT TOWNHOMES": "BLUE HERON RETREAT"}.get(name, name)
    return name or None
for d in b: d["sub"] = sub(d["Comments"])
# postal city: the address point's postal city; a parcel with no address point yet takes the most common postal city of the
# other builder parcels in its subdivision, then of its nearest builder parcel with one.
by_sub = collections.defaultdict(collections.Counter)
for d in b:
    c = PC.get(d["ParcelNumber"])
    if c and d["sub"]: by_sub[d["sub"]][c] += 1
known = [(P[d["ParcelNumber"]]["lat"], P[d["ParcelNumber"]]["lng"], PC[d["ParcelNumber"]]) for d in b if PC.get(d["ParcelNumber"]) and P[d["ParcelNumber"]]["lat"]]
how = collections.Counter()
for d in b:
    c = PC.get(d["ParcelNumber"])
    if c: d["town"] = c; how["address point"] += 1; continue
    if d["sub"] and by_sub[d["sub"]]: d["town"] = by_sub[d["sub"]].most_common(1)[0][0]; how["same subdivision"] += 1; continue
    p = P[d["ParcelNumber"]]
    if p["lat"]:
        d["town"] = min(known, key=lambda x: (x[0] - p["lat"]) ** 2 + (x[1] - p["lng"]) ** 2)[2]; how["nearest parcel"] += 1
    else: d["town"] = "unknown"; how["unknown"] += 1
q = lambda xs, n: st.quantiles(xs, n=n, method="inclusive")
def pr(xs):
    xs = sorted(xs)
    if len(xs) < 2: return {"n": len(xs), "median": xs[0] if xs else None, "p25": None, "p75": None, "p10": None, "p90": None, "min": xs[0] if xs else None, "max": xs[-1] if xs else None}
    return {"n": len(xs), "median": st.median(xs), "p25": q(xs, 4)[0], "p75": q(xs, 4)[2], "p10": q(xs, 10)[0] if len(xs) > 1 else xs[0],
            "p90": q(xs, 10)[8] if len(xs) > 1 else xs[0], "min": xs[0], "max": xs[-1]}
cnt = collections.Counter(d["bl"] for d in b)
out = {"source_deeds": R["source"], "deeds_from": R["from"], "deeds_to": R["to"], "deeds_pulled": R["pulled"], "steps": steps,
       "home_sales_kept": len(k), "builder_sales": len(b), "builder_share_pct": round(100 * len(b) / len(k), 1),
       "builder_sales_to_a_company_excluded": excluded_company_buyer.most_common(),
       "builder_sales_bought_by_a_company": len([d for d in b if d["co_buyer"]]),
       "builder_sales_bought_by_a_company_by_builder": collections.Counter(d["bl"] for d in b if d["co_buyer"]).most_common(6), "town_assigned_by": dict(how),
       "builder_median_price": st.median([d["Consideration"] for d in b]),
       "other_median_price_seller_a_person": st.median([d["Consideration"] for d in k if not d["bl"] and not d["DirectName"]]),
       "builders_with_50_or_more": len([1 for v in cnt.values() if v >= 50]),
       "top5_share_pct": round(100 * sum(v for _, v in cnt.most_common(5)) / len(b), 1),
       "top2_share_pct": round(100 * sum(v for _, v in cnt.most_common(2)) / len(b), 1)}
deedname = {lab: dn for _, lab, dn in BUILDERS}
rows = []
for name, n in cnt.most_common():
    ds = [d for d in b if d["bl"] == name]
    subs = collections.Counter(d["sub"] or "no subdivision in memo" for d in ds)
    towns = collections.Counter(d["town"] for d in ds)
    months = collections.Counter(d["RecordDate"][:7].replace("/", "-") for d in ds)
    rows.append({"builder": name, "deed_seller": deedname.get(name), "sales": n, "share_pct": round(100 * n / len(b), 1),
                 "price": pr([d["Consideration"] for d in ds]),
                 "subdivisions_with_5_plus": len([1 for s, v in subs.items() if v >= 5 and s != "no subdivision in memo"]),
                 "top_subdivisions": subs.most_common(6), "towns": towns.most_common(), "sales_by_month": sorted(months.items()),
                 "first_half": sum(v for m, v in months.items() if m <= "2026-04"), "second_half": sum(v for m, v in months.items() if m >= "2026-05")})
out["by_builder"] = rows
# town by town: builder sales and the two builders with the most there
tw = collections.defaultdict(collections.Counter)
for d in b: tw[d["town"]][d["bl"]] += 1
out["by_town"] = sorted([{"town": t, "sales": sum(c.values()), "builders_with_10_plus": len([1 for v in c.values() if v >= 10]),
                          "top": c.most_common(4), "median_price": st.median([d["Consideration"] for d in b if d["town"] == t])}
                         for t, c in tw.items()], key=lambda r: -r["sales"])
# communities where more than one builder sold 10 or more
cs = collections.defaultdict(collections.Counter)
for d in b:
    if d["sub"]: cs[d["sub"]][d["bl"]] += 1
out["communities_two_plus_builders"] = sorted([[s, c.most_common()] for s, c in cs.items() if len([1 for v in c.values() if v >= 10]) >= 2],
                                              key=lambda r: -sum(v for _, v in r[1]))
out["communities_total_with_10_plus"] = len([1 for c in cs.values() if sum(c.values()) >= 10])

# ---- active listings (aggregate only) ----
FIRM = {"DR Horton": "D.R. Horton", "Lennar Carolinas LLC": "Lennar", "Pulte Home Company, LLC": "Pulte Homes",
        "Meritage Homes of the Carolina": "Meritage Homes", "CPG Inc. dba Mungo Homes": "Mungo Homes", "The Beverly Group": "Beverly Homes",
        "Beazer Homes LLC": "Beazer Homes", "Starlight Homes": "Starlight Homes", "Toll Brothers Real Estate Inc.": "Toll Brothers",
        "Ashton Charleston Residential": "Ashton Woods", "DRB Group South Carolina, LLC": "DRB Homes", "DFH Realty Georgia, LLC": "Dream Finders Homes",
        "SM South Carolina Brokerage, LLC": "Stanley Martin (Great Southern Homes)", "Today Homes Realty SC, LLC": "Chesapeake Homes (community companies)",
        "Bulldawg Property Sales LLC": "Bradley Jones", "ChrisManningCommunities Realty": "Chris Manning"}
FILT = {"dr_horton": "D.R. Horton", "bradley_jones": "Bradley Jones", "lennar": "Lennar", "mungo": "Mungo Homes", "beverly": "Beverly Homes",
        "meritage": "Meritage Homes", "stanley_martin": "Stanley Martin (Great Southern Homes)", "pulte": "Pulte Homes", "beazer": "Beazer Homes",
        "chesapeake": "Chesapeake Homes (community companies)", "dream_finders": "Dream Finders Homes", "starlight": "Starlight Homes",
        "great_southern": "Stanley Martin (Great Southern Homes)", "ashton_woods": "Ashton Woods", "ryan": "Ryan Homes"}
if len(sys.argv) > 2:
    L = json.load(open(sys.argv[2])); pins = L["pins"]
    how = collections.Counter()
    for p in pins:
        f = {FILT[x] for x in p["filters"] if x in FILT}
        if p["firm"] in FIRM: p["bl"] = FIRM[p["firm"]]; how["builder's own sales company"] += 1
        elif len(f) == 1: p["bl"] = f.pop(); how["listing says built by (outside agent)"] += 1
        else: p["bl"] = None; how["builder not named"] += 1
    out["listings"] = {"source": "https://chapter3realty.com/homes/api/map? (CCMLS feed), has=new_construction,county_horry", "pulled": L["pulled"],
                       "total_new_construction": len(pins), "by_type": dict(collections.Counter(p["type"] for p in pins)),
                       "builder_named_by": dict(how), "filter_counts": L["filter_counts"]}
    lr = []
    for name in sorted({p["bl"] for p in pins if p["bl"]}, key=lambda n: -len([p for p in pins if p["bl"] == n])):
        ps = [p for p in pins if p["bl"] == name and p["price"]]
        ppsf = [p["price"] / p["sqft"] for p in ps if p["sqft"]]
        lr.append({"builder": name, "for_sale": len(ps), "types": dict(collections.Counter(p["type"] for p in ps)),
                   "price": pr([p["price"] for p in ps]), "at_or_under_300k": len([p for p in ps if p["price"] <= 300000]), "median_sqft": st.median([p["sqft"] for p in ps if p["sqft"]]) if ppsf else None,
                   "median_price_per_sqft": round(st.median(ppsf)) if ppsf else None,
                   "beds": collections.Counter(p["beds"] for p in ps).most_common(), "towns": collections.Counter(p["city"] for p in ps).most_common()})
    out["listings"]["by_builder"] = lr
    allp = [p["price"] for p in pins if p["price"]]
    out["listings"]["all_price"] = pr(allp)
    out["listings"]["under_300k"] = len([x for x in allp if x <= 300000])
    out["listings"]["under_300k_builder_named"] = len([p for p in pins if p["price"] and p["price"] <= 300000 and p["bl"]])
    # deed sales against MLS listings for the same builder (how much of each builder's selling shows up in the MLS)
    lc = {r["builder"]: r["for_sale"] for r in lr}
    out["sales_vs_listings"] = [[r["builder"], r["sales"], lc.get(r["builder"], 0)] for r in rows[:16]]
# the community with the most builder sales: its middle point (for an aerial before and after)
top_sub = collections.Counter(d["sub"] for d in b if d["sub"]).most_common(1)[0][0]
pts = [P[d["ParcelNumber"]] for d in b if d["sub"] == top_sub and P[d["ParcelNumber"]]["lat"]]
out["top_community"] = {"name": top_sub, "sales": len(pts), "lat": round(st.median(p["lat"] for p in pts), 5), "lng": round(st.median(p["lng"] for p in pts), 5),
                        "lat_range": [min(p["lat"] for p in pts), max(p["lat"] for p in pts)], "lng_range": [min(p["lng"] for p in pts), max(p["lng"] for p in pts)]}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({x: out[x] for x in out if x not in ("by_builder", "by_town", "listings", "communities_two_plus_builders")}, indent=0))
for r in rows[:20]: print(r["sales"], r["builder"], r["price"]["p25"], r["price"]["median"], r["price"]["p75"], r["subdivisions_with_5_plus"], r["towns"][:4], r["top_subdivisions"][:4], r["first_half"], r["second_half"])
for t in out["by_town"]: print(t)
if "listings" in out:
    print(out["listings"]["builder_named_by"], out["listings"]["all_price"], out["listings"]["under_300k"])
    for r in out["listings"]["by_builder"]: print(r["for_sale"], r["builder"], r["price"]["min"], r["price"]["p25"], r["price"]["median"], r["price"]["p75"], r["price"]["max"], r["median_sqft"], r["median_price_per_sqft"], r["types"], r["towns"][:4])
    print(out["sales_vs_listings"])
print(out["communities_two_plus_builders"][:12])
