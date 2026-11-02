"""Builds findings.json (every derived number the page uses) and the chart files from raw/.
Run from this folder: python3 -I build-findings.py"""
import json, re, datetime, collections
R = "raw/"
out = {"built": datetime.date.today().isoformat()}

# 1. VA condo report, Horry County (all statuses) vs approved; HUD FHA list
va = json.load(open(R + "va-condos-HORRY-approved-false.json"))
va_ok = json.load(open(R + "va-condos-HORRY-approved-true.json"))
ge = json.load(open(R + "va-condos-GEORGETOWN-approved-false.json"))
ge_ok = json.load(open(R + "va-condos-GEORGETOWN-approved-true.json"))
st = collections.Counter(x["dispositionCode"] for x in va)
names_ok = sorted({x["firstLineName"].strip().upper() for x in va_ok})
hudA = int(re.search(r"(\d+) records were selected", open(R + "hud-condos-horry-A.html", errors="ignore").read()).group(1))
hudX = int(re.search(r"(\d+) records were selected", open(R + "hud-condos-horry-X.html", errors="ignore").read()).group(1))
recent = [x for x in va if x["reviewCompletedDate"] and datetime.datetime.fromtimestamp(x["reviewCompletedDate"]/1000, datetime.timezone.utc).date() >= datetime.date(2025, 11, 1)]
out["va_condos"] = {
    "horry_records_all_status": len(va), "horry_status_counts": dict(st),
    "horry_records_approved": len(va_ok), "horry_unique_names_approved": len(names_ok),
    "georgetown_records_all_status": len(ge), "georgetown_records_approved": len(ge_ok),
    "horry_reviews_completed_last_12_months": len(recent),
    "horry_reviews_completed_last_12_months_by_status": dict(collections.Counter(x["dispositionCode"] for x in recent)),
    "hud_fha_horry_approved": hudA, "hud_fha_horry_all_status": hudX,
    "ratio_va_to_fha_approved_records": round(len(va_ok) / hudA, 1),
}
# 1b. Our 29-building oceanfront directory (/invest/condo-buildings/) matched to the VA list by hand (name or street address).
DIRECTORY_MATCH = {
    "approved_project_on_file": ["Beach Cove Resort (VA: BEACH COVE RESORT HOA, INC)", "Myrtle Beach Resort, 5905 S Kings Hwy (VA: THE RENAISSANCE TOWER HORIZONT, 5905 SOUTH KINGS HIGHWAY; one tower of the resort)"],
    "rejected_review_on_file": ["Sand Dunes Resort complex (VA: OCEAN DUNES TOWER 1, 75TH AVENUE NORTH)", "Ocean Creek Resort (VA: THE TOWER, 100 OCEAN CREEK DR)"],
    "directory_size": 29,
}
DIRECTORY_MATCH["no_record"] = DIRECTORY_MATCH["directory_size"] - 4
out["directory_match"] = DIRECTORY_MATCH

# 2. CRM listing counts (aggregate)
L = {r["label"]: r["total"] for r in json.load(open(R + "listings-counts.json"))["rows"]}
pct = lambda a, b: round(100 * a / b) if b else None
def pair(a, b): return {"va": L[a], "all": L[b], "pct": pct(L[a], L[b])}
out["listings"] = {
    "pulled": json.load(open(R + "listings-counts.json"))["pulled"],
    "all": pair("type=all has=va_accepted", "type=all has=-"),
    "house": pair("type=house has=va_accepted", "type=house has=-"),
    "condo": pair("type=condo has=va_accepted", "type=condo has=-"),
    "townhouse": pair("type=townhouse has=va_accepted", "type=townhouse has=-"),
    "manufactured": pair("type=manufactured has=va_accepted", "type=manufactured has=-"),
    "condo_oceanfront_building": pair("condo oceanfront_building+va", "condo oceanfront_building"),
    "condo_rental_program": pair("condo vacation_rental_program+va", "condo vacation_rental_program"),
    "condo_oceanfront_building_fha": {"fha": L["condo oceanfront_building+fha"], "all": L["condo oceanfront_building"]},
    "house_new_construction": pair("house new_construction+va", "house new_construction"),
    "house_flood_zone": pair("house flood_zone+va", "house flood_zone"),
    "house_market_common_2mi": pair("house market_common_2mi+va", "house market_common_2mi"),
    "assumable_all": L["type=all has=assumable_loan"], "assumable_house": L["type=house has=assumable_loan"], "assumable_condo": L["type=condo has=assumable_loan"],
}
towns = ["Conway", "Longs", "Loris", "Aynor", "Little River", "Myrtle Beach", "Murrells Inlet", "Surfside Beach", "North Myrtle Beach"]
out["chart_houses_by_town"] = [{"town": t, "va": L[f"{t} house+va"], "all": L[f"{t} house"], "pct": pct(L[f"{t} house+va"], L[f"{t} house"])} for t in towns]
bands = [(0, 249999), (250000, 299999), (300000, 349999), (350000, 399999), (400000, 499999), (500000, 699999), (700000, 999999), (1000000, None)]
def blabel(lo, hi): return (f"Under $250K" if lo == 0 else ((f"${lo//1000}K to $1M" if hi == 999999 else f"${lo//1000}K to ${(hi+1)//1000}K") if hi else "$1M and up"))
out["chart_houses_by_price"] = [{"band": blabel(lo, hi), "va": L[f"house {lo}-{hi}+va"], "all": L[f"house {lo}-{hi}"], "pct": pct(L[f"house {lo}-{hi}+va"], L[f"house {lo}-{hi}"])} for lo, hi in bands]
cum = 0; half = L["type=house has=va_accepted"] / 2
for row, (lo, hi) in zip(out["chart_houses_by_price"], bands):
    cum += row["va"]
    if cum >= half: out["median_band_va_houses"] = row["band"]; break
out["chart_condo_kinds"] = [
    {"kind": "Houses", **pair("type=house has=va_accepted", "type=house has=-")},
    {"kind": "Townhouses", **pair("type=townhouse has=va_accepted", "type=townhouse has=-")},
    {"kind": "All condos", **pair("type=condo has=va_accepted", "type=condo has=-")},
    {"kind": "Condos with a rental program", **pair("condo vacation_rental_program+va", "condo vacation_rental_program")},
    {"kind": "Condos in an oceanfront building", **pair("condo oceanfront_building+va", "condo oceanfront_building")},
]

# 3. Disabled veteran exemption in dollars: the 4% bill on a home the county values at $400,000 (same model and value as /buyers/property-taxes/)
LEVY = {"county": 52.1, "school_debt": 10.0, "school_ops": 109.1, "county_fire": 20.2, "fire_apparatus": 1.5, "waste": 8.1, "mi_gc_fire": 28.0,
        "Myrtle Beach": 83.4, "North Myrtle Beach": 50.0, "Surfside Beach": 43.0, "Conway": 101.3}
TDF = 0.534  # Myrtle Beach Tourism Development Fee credit on the city tax for a legal residence, 2026 (as /buyers/property-taxes/)
base = LEVY["county"] + LEVY["school_debt"]  # 4% legal residences pay no school operating millage
mills = {"City of Myrtle Beach": base + LEVY["Myrtle Beach"] * (1 - TDF), "North Myrtle Beach": base + LEVY["North Myrtle Beach"],
         "Surfside Beach": base + LEVY["Surfside Beach"], "Conway": base + LEVY["Conway"],
         "Murrells Inlet or Garden City": base + LEVY["mi_gc_fire"] + LEVY["waste"],
         "Unincorporated Horry (Carolina Forest, Socastee, Little River)": base + LEVY["county_fire"] + LEVY["fire_apparatus"] + LEVY["waste"]}
V = 400000
out["exemption_example"] = {"value": V, "rows": [{"place": k, "mills_at_4pct": round(m, 2), "yearly_tax_saved": round(V * 0.04 * m / 1000)} for k, m in mills.items()],
                            "method": "value x 0.04 x mills / 1000; school operating millage exempt (12-37-220(B)(47)); Myrtle Beach city tax less 53.4% TDF credit; excludes small special districts and the $89 stormwater fee"}

# 4. Census ACS 2024 1-year
def acs(t, g):
    d = json.load(open(R + f"acs-ACSDT1Y2024.{t}-{g}.json"))["response"]["data"]; return dict(zip(d[0], d[1]))
vet = {}
for g, n in [("050XX00US45051", "Horry"), ("050XX00US45043", "Georgetown"), ("0400000US45", "South Carolina"), ("0100000US", "United States")]:
    v = acs("B21001", g); vet[n] = {"adults": int(v["B21001_001E"]), "veterans": int(v["B21001_002E"]), "moe": int(v["B21001_002M"]), "pct": round(100 * int(v["B21001_002E"]) / int(v["B21001_001E"]), 1)}
out["veterans_acs2024"] = vet
yb = {}
for g, n in [("050XX00US45051", "Horry"), ("0400000US45", "South Carolina"), ("0100000US", "United States")]:
    v = acs("B25034", g); tot = int(v["B25034_001E"])
    pre80 = sum(int(v[f"B25034_{i:03d}E"]) for i in range(7, 12)); new = sum(int(v[f"B25034_{i:03d}E"]) for i in range(2, 5))
    yb[n] = {"units": tot, "built_before_1980": pre80, "pct_before_1980": round(100 * pre80 / tot, 1), "built_2000_or_later": new, "pct_2000_or_later": round(100 * new / tot, 1)}
out["year_built_acs2024"] = yb

# 5. Drives (OSRM free-flow)
out["drives"] = json.load(open(R + "drives.json"))["drives"]
json.dump(out, open("findings.json", "w"), indent=1)
json.dump(out["chart_houses_by_town"], open("chart-houses-by-town.json", "w"), indent=1)
json.dump(out["chart_condo_kinds"], open("chart-va-by-kind.json", "w"), indent=1)
json.dump(out["chart_houses_by_price"], open("chart-houses-by-price.json", "w"), indent=1)
print(json.dumps(out, indent=1))
