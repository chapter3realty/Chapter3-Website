#!/usr/bin/env python3
"""What a unit in a 2 to 4 unit building rents for in Horry County, and how many such buildings have an owner living in them.
Census ACS PUMS 2020-2024 5-year, South Carolina housing file:
  https://www2.census.gov/programs-surveys/acs/data/pums/2024/5-Year/csv_hsc.zip (psam_h45.csv; kept outside the repo).
Same method as data/2026-11-a/invest-rent-prices/analyze_pums.py: PUMAs 02701 and 02702 (wholly in Horry County),
dollars x ADJHSG / 1e6 (2024 dollars), replicate weights WGTP1-80 for 90 percent margins.
BLD 04 = a building with 2 apartments; 05 = 3 or 4 apartments (Census data dictionary). TEN 1-2 owner, 3 renter.
RNTP = lease (contract) rent; GRNTP = with the utilities the renter pays.
Usage: python3 -I analyze_pums.py <psam_h45.csv> <out.json>"""
import csv, json, math, sys
src, out = sys.argv[1], sys.argv[2]
PUMAS = ("02701", "02702")
allr = []
with open(src, newline="") as f:
    for r in csv.DictReader(f):
        if r["PUMA"] in PUMAS and r["NP"] not in ("", "0"): allr.append(r)  # occupied homes
def adj(r, k): return float(r[k]) * float(r["ADJHSG"]) / 1e6
def wmed(pairs):
    pairs = sorted(pairs); tot = sum(w for _, w in pairs)
    if tot <= 0: return None
    acc = 0
    for v, w in pairs:
        acc += w
        if acc >= tot / 2: return v
def moe(est, reps): return round(1.645 * math.sqrt(4 / 80 * sum((x - est) ** 2 for x in reps if x is not None)))
def stat(group, field):
    grp = [r for r in group if r[field] not in ("", "0")]
    if not grp: return None
    vals = [adj(r, field) for r in grp]
    est = wmed([(v, float(r["WGTP"])) for v, r in zip(vals, grp)])
    reps = [wmed([(v, float(r[f"WGTP{i}"])) for v, r in zip(vals, grp)]) for i in range(1, 81)]
    return {"records": len(grp), "homes": round(sum(float(r["WGTP"]) for r in grp)), "median": round(est), "moe90": moe(est, reps)}
def count(group):
    est = sum(float(r["WGTP"]) for r in group)
    reps = [sum(float(r[f"WGTP{i}"]) for r in group) for i in range(1, 81)]
    return {"records": len(group), "homes": round(est), "moe90": moe(est, reps)}
small = lambda r: r["BLD"] in ("04", "05")
renter = lambda r: r["TEN"] == "3" and r["RNTP"] not in ("", "0")
owner = lambda r: r["TEN"] in ("1", "2")
res = {"source": "Census ACS PUMS 2020-2024 5-year, SC housing file, PUMAs 02701 and 02702 (most of Horry County)", "dollars": "2024 dollars (ADJHSG)", "contract_rent": {}, "gross_rent": {}, "counts": {}}
R = [r for r in allr if renter(r)]
G = {"small_2to4_all": [r for r in R if small(r)], "duplex_bld04": [r for r in R if r["BLD"] == "04"], "three_four_bld05": [r for r in R if r["BLD"] == "05"],
     "house_detached": [r for r in R if r["BLD"] == "02"]}
for b in (1, 2, 3):
    G[f"small_2to4_{b}br"] = [r for r in R if small(r) and (int(r["BDSP"]) >= 3 if b == 3 else int(r["BDSP"]) == b)]
for k, g in G.items():
    res["contract_rent"][k] = stat(g, "RNTP"); res["gross_rent"][k] = stat(g, "GRNTP")
res["counts"]["occupied_in_2to4"] = count([r for r in allr if small(r)])
res["counts"]["renter_in_2to4"] = count([r for r in allr if small(r) and r["TEN"] == "3"])
res["counts"]["owner_in_2to4"] = count([r for r in allr if small(r) and owner(r)])
res["counts"]["all_renter_homes"] = count([r for r in allr if r["TEN"] == "3"])
sm = [r for r in R if small(r)]; tot = sum(float(r["WGTP"]) for r in sm)
res["bedrooms_share_2to4_renters"] = {b: round(100 * sum(float(r["WGTP"]) for r in sm if (int(r["BDSP"]) >= 3 if b == "3+" else r["BDSP"] == b)) / tot, 1) for b in ("0", "1", "2", "3+")}
json.dump(res, open(out, "w"), indent=1); print(json.dumps(res, indent=1))
