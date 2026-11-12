#!/usr/bin/env python3
"""What renters in Horry County pay, by kind of home, bedrooms and how long they have lived there.
Census ACS PUMS 2020-2024 5-year, South Carolina housing file:
  https://www2.census.gov/programs-surveys/acs/data/pums/2024/5-Year/csv_hsc.zip (psam_h45.csv; kept outside the repo).
PUMAs 02701 (Horry central and north, North Myrtle Beach) and 02702 (Horry central and south, Myrtle Beach) lie wholly in
Horry County; 02601 mixes north Horry with Dillon and Marion and is left out.
Renters: TEN 3 (rented) with RNTP > 0 (cash rent). RNTP is the rent in the lease (contract rent), GRNTP adds the
utilities and fuels the renter pays (gross rent). Dollars x ADJHSG / 1e6, which puts every survey year in 2024 dollars.
BLD 02 one-family detached house; 03 one-family attached (townhouse); 04-09 buildings of 2 or more apartments; 01 mobile home.
MV 1 moved in within 12 months; 2 13 to 23 months; 3 2 to 4 years; 4 5 to 9 years; 5+ 10 years or more.
Margins: successive-difference replicate weights WGTP1-80, 90 percent margin = 1.645 x sqrt(4/80 x sum (rep - est)^2).
Usage: python3 -I analyze_pums.py <psam_h45.csv> <out.json>"""
import csv, json, math, sys
src, out = sys.argv[1], sys.argv[2]
PUMAS = {"02701": "Horry central and north (North Myrtle Beach, Conway, Little River, Longs)", "02702": "Horry central and south (Myrtle Beach, Socastee, Surfside, Murrells Inlet)"}
rows = []
with open(src, newline="") as f:
    for r in csv.DictReader(f):
        if r["PUMA"] not in PUMAS: continue
        if r["TEN"] == "3" and r["RNTP"] not in ("", "0"): rows.append(r)
def adj(r, k): return float(r[k]) * float(r["ADJHSG"]) / 1e6
def wmed(pairs):
    pairs = sorted(pairs); tot = sum(w for _, w in pairs)
    if tot <= 0: return None
    acc = 0
    for v, w in pairs:
        acc += w
        if acc >= tot / 2: return v
def stat(group, field="RNTP"):
    if not group: return None
    vals = [adj(r, field) for r in group if r[field] not in ("", "0")]
    grp = [r for r in group if r[field] not in ("", "0")]
    est = wmed([(v, float(r["WGTP"])) for v, r in zip(vals, grp)])
    reps = [wmed([(v, float(r[f"WGTP{i}"])) for v, r in zip(vals, grp)]) for i in range(1, 81)]
    se = math.sqrt(4 / 80 * sum((x - est) ** 2 for x in reps if x is not None))
    return {"records": len(grp), "homes": round(sum(float(r["WGTP"]) for r in grp)), "median": round(est), "moe90": round(1.645 * se)}
det = lambda r: r["BLD"] == "02"
att = lambda r: r["BLD"] == "03"
apt = lambda r: r["BLD"] in ("04", "05", "06", "07", "08", "09")
mob = lambda r: r["BLD"] == "01"
beds = lambda r, b: (int(r["BDSP"]) >= 4) if b == 4 else int(r["BDSP"]) == b
recent = lambda r: r["MV"] == "1"
recent2 = lambda r: r["MV"] in ("1", "2")
long5 = lambda r: r["MV"] in ("4", "5", "6", "7")
res = {"source": "Census ACS PUMS 2020-2024 5-year, SC housing file, PUMAs 02701 and 02702", "dollars": "2024 dollars (ADJHSG)", "pumas": PUMAS, "contract_rent": {}, "gross_rent": {}}
G = {
    "all_renters": rows,
    "house_detached": [r for r in rows if det(r)],
    "townhouse_attached": [r for r in rows if att(r)],
    "apartment_or_condo_2plus": [r for r in rows if apt(r)],
    "mobile_home": [r for r in rows if mob(r)],
}
for b in (1, 2, 3, 4):
    G[f"house_detached_{b}br"] = [r for r in rows if det(r) and beds(r, b)]
    G[f"apartment_or_condo_{b}br"] = [r for r in rows if apt(r) and beds(r, b)]
    G[f"all_{b}br"] = [r for r in rows if beds(r, b)]
G["house_detached_3br_moved_in_last_2y"] = [r for r in rows if det(r) and beds(r, 3) and recent2(r)]
G["house_detached_3br_5y_or_more"] = [r for r in rows if det(r) and beds(r, 3) and long5(r)]
G["house_detached_moved_in_last_12m"] = [r for r in rows if det(r) and recent(r)]
G["house_detached_moved_in_last_2y"] = [r for r in rows if det(r) and recent2(r)]
G["house_detached_5y_or_more"] = [r for r in rows if det(r) and long5(r)]
G["all_moved_in_last_12m"] = [r for r in rows if recent(r)]
G["all_moved_in_last_2y"] = [r for r in rows if recent2(r)]
G["all_5y_or_more"] = [r for r in rows if long5(r)]
for p in PUMAS:
    G[f"puma_{p}_house_detached"] = [r for r in rows if r["PUMA"] == p and det(r)]
    G[f"puma_{p}_house_detached_3br"] = [r for r in rows if r["PUMA"] == p and det(r) and beds(r, 3)]
    G[f"puma_{p}_apartment_or_condo_2br"] = [r for r in rows if r["PUMA"] == p and apt(r) and beds(r, 2)]
    G[f"puma_{p}_all_renters"] = [r for r in rows if r["PUMA"] == p]
for k, g in G.items():
    res["contract_rent"][k] = stat(g, "RNTP"); res["gross_rent"][k] = stat(g, "GRNTP")
# Utilities the renter pays on top of the lease rent (GRNTP - RNTP), median, for renters in detached houses and in apartments
def util(group):
    pairs = sorted((adj(r, "GRNTP") - adj(r, "RNTP"), float(r["WGTP"])) for r in group if r["GRNTP"] not in ("", "0"))
    return {"records": len(pairs), "median": round(wmed(pairs))}
res["utilities_paid_by_renter"] = {"house_detached": util(G["house_detached"]), "apartment_or_condo_2plus": util(G["apartment_or_condo_2plus"])}
dh = sum(float(r["WGTP"]) for r in G["house_detached"])
res["detached_bedrooms_share"] = {b: round(100 * sum(float(r["WGTP"]) for r in G["house_detached"] if (int(r["BDSP"]) >= 4 if b == "4+" else r["BDSP"] == b)) / dh, 1) for b in ("1", "2", "3", "4+")}
# Share of renters in each kind of home
tot = sum(float(r["WGTP"]) for r in rows)
res["share_of_renter_homes"] = {k: round(100 * sum(float(r["WGTP"]) for r in G[k]) / tot, 1) for k in ("house_detached", "townhouse_attached", "apartment_or_condo_2plus", "mobile_home")}
# How long renters in detached houses have stayed
res["detached_moved_in"] = {mv: round(100 * sum(float(r["WGTP"]) for r in G["house_detached"] if r["MV"] == mv) / sum(float(r["WGTP"]) for r in G["house_detached"]), 1) for mv in "1234567"}
json.dump(res, open(out, "w"), indent=1)
for k in res["contract_rent"]: print(k, res["contract_rent"][k], "| gross", (res["gross_rent"][k] or {}).get("median"))
print("util", res["utilities_paid_by_renter"], res["detached_bedrooms_share"]); print(res["share_of_renter_homes"]); print(res["detached_moved_in"])
