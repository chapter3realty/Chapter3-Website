"""Every number /invest/non-warrantable-condos/ prints from local data. Reads owners.json, control.json, hud-horry-all.json, program.json,
../invest-condo-buildings/buildings.json and ../invest-condotel-financing/{counts,findings}.json.
Writes findings.json, chart-owner-homes.json and table-buildings.json. Run: python3 -I build_findings.py <this folder>."""
import json, sys, statistics
out = sys.argv[1]
O = json.load(open(f"{out}/owners.json"))["buildings"]
C = json.load(open(f"{out}/control.json"))["seagate_village"]
H = json.load(open(f"{out}/hud-horry-all.json"))["records"]
B = {b["slug"]: b for b in json.load(open(f"{out}/../invest-condo-buildings/buildings.json"))["buildings"]}
CF = json.load(open(f"{out}/../invest-condotel-financing/findings.json"))
CC = json.load(open(f"{out}/../invest-condotel-financing/counts.json"))
units = sum(v["building"]["units"] for v in O.values())
home = sum(v["building"]["legal_residence_4pct"] for v in O.values())
shares = {k: v["building"]["legal_residence_share"] for k, v in O.items()}
over75 = [k for k, v in O.items() if v["building"]["not_legal_residence_share"] >= 75]
# Single-entity test, per regime (the project a lender reviews), 21+ units, more than 20% held by one owner name.
se = []
for k, v in O.items():
    for reg, s in v["regimes"].items():
        if s["units"] >= 21 and s["top_owner_units"] * 5 > s["units"]:
            se.append({"building": k, "name": B[k]["name"], "regime": reg, "units": s["units"], "top_owner_units": s["top_owner_units"], "share": s["top_owner_share"], "kind": s["top_owner_kind"]})
se_buildings = sorted({x["building"] for x in se})
# Rental program share among condos for sale now, per building (CRM listing flag; seller's agent's field).
P = json.load(open(f"{out}/program.json"))
prog = {k: v for k, v in P["buildings"].items() if v["for_sale"]}
hud = {"records": len(H), "by_status": {}}
for r in H: hud["by_status"][r["status"]] = hud["by_status"].get(r["status"], 0) + 1
f = {"read": {"owners": json.load(open(f"{out}/owners.json"))["read"], "control": json.load(open(f"{out}/control.json"))["read"], "hud": json.load(open(f"{out}/hud-horry-all.json"))["read"], "program": P["read"]},
     "buildings": len(O), "units": units, "units_taxed_as_home": home, "share_taxed_as_home": round(100 * home / units, 1),
     "building_share_taxed_as_home": {"median": statistics.median(shares.values()), "max": max(shares.values()), "max_building": max(shares, key=shares.get),
                                      "under_10": sum(1 for s in shares.values() if s < 10), "zero": sorted(k for k, s in shares.items() if s == 0)},
     "buildings_75pct_or_more_not_home": len(over75), "buildings_under_75pct_not_home": sorted(set(O) - set(over75)),
     "control_seagate_village": C,
     "single_entity_over_20pct": {"regimes": se, "buildings": se_buildings, "count_buildings": len(se_buildings)},
     "rental_program_for_sale": {"buildings_with_listings": len(prog), "median_share": statistics.median(x["share"] for x in prog.values()),
                                 "buildings_90pct_plus": sum(1 for x in prog.values() if x["share"] >= 90), "buildings_under_half": sorted(k for k, x in prog.items() if x["share"] < 50 and x["for_sale"] >= 5),
                                 "for_sale": sum(x["for_sale"] for x in prog.values()), "in_program": sum(x["in_program"] for x in prog.values())},
     "home_like": sorted([{"building": k, "name": B[k]["name"], "taxed_as_home_pct": shares[k], "for_sale": prog.get(k, {}).get("for_sale"), "in_program": prog.get(k, {}).get("in_program")} for k in shares if shares[k] >= 15], key=lambda x: -x["taxed_as_home_pct"]),
     "oceanfront_in_program_share": CF.get("in_program_share_of_oceanfront"), "hud": hud}
json.dump(f, open(f"{out}/findings.json", "w"), indent=1)
top = sorted(shares.items(), key=lambda kv: -kv[1])[:6]
json.dump({"title": "In every oceanfront tower, few units are the owner's home",
           "note": "Share of condo units taxed at the 4% owner-occupant rate, Horry County parcel records. Fannie Mae asks a lender to look harder when 75% or more are investments or second homes, that is, when 25% or fewer are homes.",
           "line": {"value": 25, "label": "Fannie Mae's closer-look line"},
           "bars": [{"label": B[k]["name"], "value": v} for k, v in top] + [{"label": "All " + str(len(O)) + " oceanfront towers", "value": f["share_taxed_as_home"]}, {"label": "Seagate Village (inland, FHA-approved)", "value": C["share"]}]},
          open(f"{out}/chart-owner-homes.json", "w"), indent=1)
rows = []
for k, v in O.items():
    b = v["building"]; mx = max(v["regimes"].values(), key=lambda s: s["top_owner_share"] if s["units"] >= 21 else 0)
    rows.append({"slug": k, "name": B[k]["name"], "units": b["units"], "taxed_as_home_pct": b["legal_residence_share"],
                 "largest_owner_pct_in_a_regime": mx["top_owner_share"], "over_single_entity_line": k in se_buildings,
                 "for_sale": prog.get(k, {}).get("for_sale"), "for_sale_in_program_pct": prog.get(k, {}).get("share")})
json.dump({"note": "Public signs only; a lender's review of the building's documents decides. No owner, PIN, unit or value.", "rows": sorted(rows, key=lambda r: r["name"])}, open(f"{out}/table-buildings.json", "w"), indent=1)
print(json.dumps({k: f[k] for k in ["buildings", "units", "units_taxed_as_home", "share_taxed_as_home", "building_share_taxed_as_home", "buildings_75pct_or_more_not_home", "buildings_under_75pct_not_home", "rental_program_for_sale", "hud"]}, indent=1))
print(json.dumps(f["single_entity_over_20pct"], indent=1))
