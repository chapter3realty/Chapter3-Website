"""Condo deeds recorded 2025-11-01 to 2026-10-31, Horry County Register of Deeds index (raw/sales-rows.json, copy of the Myrtle Beach sibling's pull_sales.py output: legal text names a condo unit, consideration over $10,000, with the parcel's tax district).
Inside the Town of Surfside Beach = tax district 660 (county Municipalities layer 31 gives SURFSIDE BEACH). Commercial condo rows (names with COMMERCIAL, BUSINESS) are left out. Outside the town: deeds whose legal name matches an MLS community name now for sale (Southbridge, South Bay Lakes, Plantation Golf Villas, Hampton Greens, Villas on the Green), all tax district 600.
Writes findings-deeds.json. No parcel, unit or address. Run: python3 -I deeds_surfside.py <this dir>."""
import json, re, sys, statistics as st, collections
D = sys.argv[1]; rows = json.load(open(D + "/raw/sales-rows.json"))
def q(v):
    v = sorted(v)
    if not v: return None
    p = st.quantiles(v, n=4) if len(v) > 3 else [v[0], st.median(v), v[-1]]
    return {"n": len(v), "min": v[0], "p25": p[0], "median": st.median(v), "p75": p[2], "max": v[-1]}
town = [r for r in rows if r[0] == "660" and not re.search(r"COMMERCIAL|BUSINESS", r[1].upper())]
pr = [r[2] for r in town]
out = {"town_all_660": len([r for r in rows if r[0] == "660"]), "town_residential": q(pr),
 "bands": {"under_200k": sum(p < 200000 for p in pr), "200_300k": sum(200000 <= p < 300000 for p in pr), "300_500k": sum(300000 <= p < 500000 for p in pr), "500k_plus": sum(p >= 500000 for p in pr)}}
G = {"Southbridge": "SOUTHBRIDGE", "South Bay Lakes": "SOUTH BAY", "Plantation Golf Villas (Grand Palms)": "PLANTATION GOLF", "Hampton Greens": "HAMPTON GREENS", "Villas on the Green": "VILLAS ON THE GREEN", "Golf Colony": "GOLF COLONY"}
out["outside"] = {k: q([r[2] for r in rows if re.search(p, r[1].upper()) and r[0] == "600"]) for k, p in G.items()}
allout = [r[2] for r in rows if r[0] == "600" and any(re.search(p, r[1].upper()) for p in list(G.values()))]
out["outside_all_named"] = q(allout)
json.dump(out, open(D + "/findings-deeds.json", "w"), indent=1); print(json.dumps(out, indent=1))
