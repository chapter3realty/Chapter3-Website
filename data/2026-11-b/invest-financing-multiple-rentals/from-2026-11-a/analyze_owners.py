"""How many owners hold two or more Horry County homes taxed at the 6 percent ratio (rentals and second homes).
Input: RAW/homes-6pct.json from pull_owner_counts.py. Output: owner-counts.json (counts only, no names).
Owner = the county's owner-name field, letters and digits only. Spelling differences split one owner in two, so the counts are a floor.
Usage: RAW=<scratch dir> python3 -I analyze_owners.py <this dir>"""
import sys, os, json, re, collections, statistics
D = sys.argv[1]; RAW = os.environ["RAW"]
H = json.load(open(os.path.join(RAW, "homes-6pct.json")))
COMPANY = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LP|LLP|LTD|PARTNERS|PARTNERSHIP|HOLDINGS|PROPERTIES|INVESTMENTS?|GROUP|ENTERPRISES|FUND|REIT|TRUST|TRUSTEE|TR|TRS)\b")
INSTITUTION = re.compile(r"OPENDOOR|OFFERPAD|CARTUS|SIRVA|RELOCATION|SECRETARY OF|HOUSING AND URBAN|VETERANS AFFAIRS|FEDERAL NATIONAL|FEDERAL HOME LOAN|FANNIE|FREDDIE|\bBANK\b|MORTGAGE|SERVICING|NATIONAL ASSOCIATION|\bHUD\b|\bREO\b|HOUSING AUTHORITY|COUNTY|CITY OF|TOWN OF|STATE OF|UNIVERSITY|CHURCH|ASSOCIATION|\bHOA\b|OWNERS ASSOC|REGIME")
BUILDER = re.compile(r"HORTON|LENNAR|\bNVR\b|PULTE|MERITAGE|CLAYTON PROPERTIES|GREAT SOUTHERN HOMES|BEVERLY HOMES|STARLIGHT HOMES|BEAZER|ASHTON CHARLESTON|TOLL SOUTHEAST|DREAM FINDERS|BUILDERS?\b|CONSTRUCTION|CONSTRUCTORS|HOMES (INC|LLC)|HOME BUILDERS|DEVELOPMENT|DEVELOPERS?\b")
def kind(n):
    if INSTITUTION.search(n): return "institution"
    if BUILDER.search(n): return "builder"
    if COMPANY.search(n): return "company"
    return "person"
by = collections.defaultdict(list)
for h in H: by[re.sub(r"[^A-Z0-9]", "", (h["OwnerName"] or "").upper())].append(h)
by.pop("", None)
def tier(n): return "1" if n == 1 else "2" if n == 2 else "3-4" if n <= 4 else "5-9" if n <= 9 else "10+"
out = {"source": "Horry County GIS parcel layer 24, read " + json.load(open(os.path.join(D, "raw", "owner-count-queries.json")))["read"],
       "definition": "Home = land use 1xx with a building value. 6 percent = assessed value 5.5 to 6.5 percent of taxable value (not the owner's legal residence: rentals, second homes, homes held by companies, and new homes a builder has not sold).",
       "homes_6pct": len(H), "owners": len(by)}
T = collections.defaultdict(collections.Counter); homes = collections.defaultdict(collections.Counter)
for k, v in by.items():
    kd = kind(v[0]["OwnerName"]); t = tier(len(v)); T[kd][t] += 1; homes[kd][t] += len(v)
out["owners_by_kind_and_tier"] = {k: dict(v) for k, v in T.items()}
out["homes_by_kind_and_tier"] = {k: dict(v) for k, v in homes.items()}
pc = {k: v for k, v in by.items() if kind(v[0]["OwnerName"]) in ("person", "company")}
multi = {k: v for k, v in pc.items() if len(v) >= 2}
hp = sum(len(v) for v in pc.values()); hm = sum(len(v) for v in multi.values())
out["people_and_companies"] = {"owners": len(pc), "homes": hp, "owners_2plus": len(multi), "homes_held_by_owners_2plus": hm,
    "share_of_their_homes_held_by_2plus_pct": round(100 * hm / hp, 1),
    "owners_exactly_1": sum(1 for v in pc.values() if len(v) == 1),
    "owners_2": sum(1 for v in multi.values() if len(v) == 2), "owners_3_4": sum(1 for v in multi.values() if 3 <= len(v) <= 4),
    "owners_5_9": sum(1 for v in multi.values() if 5 <= len(v) <= 9), "owners_10plus": sum(1 for v in multi.values() if len(v) >= 10),
    "people_2plus": sum(1 for v in multi.values() if kind(v[0]["OwnerName"]) == "person"),
    "companies_2plus": sum(1 for v in multi.values() if kind(v[0]["OwnerName"]) == "company"),
    "people_2_to_4": sum(1 for v in multi.values() if kind(v[0]["OwnerName"]) == "person" and len(v) <= 4),
    "owners_2plus_mailing_sc_pct": round(100 * sum(1 for v in multi.values() if (v[0]["OwnerState"] or "").strip().upper() == "SC") / len(multi), 1),
    "owners_2plus_all_condos": sum(1 for v in multi.values() if all("HPR" in (x["LegalDescr"] or "") for x in v)),
    "owners_2plus_no_condo": sum(1 for v in multi.values() if not any("HPR" in (x["LegalDescr"] or "") for x in v)),
    "median_value_of_homes_held_by_2plus": statistics.median(x["MarketProp"] for v in multi.values() for x in v if x["MarketProp"])}
json.dump(out, open(os.path.join(D, "owner-counts.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
