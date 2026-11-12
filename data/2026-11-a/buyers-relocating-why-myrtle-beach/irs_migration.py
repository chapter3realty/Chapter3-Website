"""IRS SOI county-to-county migration for Horry County (45051), filing years 2018-19 to 2022-23.
Inputs: raw/countyinflowYYYY.csv and raw/countyoutflowYYYY.csv from https://www.irs.gov/pub/irs-soi/ .
Run: python3 -I irs_migration.py <this dir>. Writes irs-migration.json.
n1 = returns (about households), n2 = exemptions/individuals (about people), agi in thousands of dollars.
Rows with -1 are suppressed by the IRS."""
import csv, json, sys
D = sys.argv[1]
YEARS = ["1819", "1920", "2021", "2122", "2223"]
out = {"source": "https://www.irs.gov/statistics/soi-tax-stats-migration-data", "county": "Horry County, SC (45051)", "years": {}}
for y in YEARS:
    yr = {"label": f"20{y[:2]}-20{y[2:]}", "in": {}, "out": {}, "in_counties": [], "out_counties": []}
    for kind in ("in", "out"):
        f = f"{D}/raw/county{kind}flow{y}.csv"
        for r in csv.DictReader(open(f, encoding="latin-1")):
            for k in ("y1_statefips", "y2_statefips"): r[k] = r[k].zfill(2)
            for k in ("y1_countyfips", "y2_countyfips"): r[k] = r[k].zfill(3)
            if kind == "in":
                if not (r["y2_statefips"] == "45" and r["y2_countyfips"] == "051"): continue
                st, co, name, ab = r["y1_statefips"], r["y1_countyfips"], r["y1_countyname"], r["y1_state"]
            else:
                if not (r["y1_statefips"] == "45" and r["y1_countyfips"] == "051"): continue
                st, co, name, ab = r["y2_statefips"], r["y2_countyfips"], r["y2_countyname"], r["y2_state"]
            n1, n2, agi = int(r["n1"]), int(r["n2"]), int(r["agi"])
            if st in ("96", "97", "98", "57", "58", "59") or (st == "45" and co == "051"):
                yr[kind][name] = {"returns": n1, "people": n2, "agi_thousands": agi}
            else:
                yr[kind + "_counties"].append({"fips": st + co, "state": ab, "county": name, "returns": n1, "people": n2, "agi_thousands": agi})
    out["years"][y] = yr
# summary per year
summ = []
for y in YEARS:
    yr = out["years"][y]
    I = yr["in"]["Horry County Total Migration-US and Foreign"]; O = yr["out"]["Horry County Total Migration-US and Foreign"]
    Id = yr["in"]["Horry County Total Migration-Different State"]; Od = yr["out"]["Horry County Total Migration-Different State"]
    summ.append({"year": yr["label"], "in_returns": I["returns"], "out_returns": O["returns"], "net_returns": I["returns"] - O["returns"],
                 "in_people": I["people"], "out_people": O["people"], "net_people": I["people"] - O["people"],
                 "in_agi_per_return": round(I["agi_thousands"] * 1000 / I["returns"]), "out_agi_per_return": round(O["agi_thousands"] * 1000 / O["returns"]),
                 "in_agi_total_k": I["agi_thousands"], "out_agi_total_k": O["agi_thousands"],
                 "in_diffstate_returns": Id["returns"], "out_diffstate_returns": Od["returns"],
                 "ratio_in_to_out": round(I["returns"] / O["returns"], 2), "ratio_diffstate": round(Id["returns"] / Od["returns"], 2)})
out["summary"] = summ
# latest year: top origin counties outside Horry with the reverse flow
y = "2223"; yr = out["years"][y]
outmap = {c["fips"]: c for c in yr["out_counties"]}
rows = []
for c in sorted(yr["in_counties"], key=lambda c: -c["returns"]):
    if c["returns"] < 0: continue
    o = outmap.get(c["fips"])
    rows.append({"county": c["county"], "state": c["state"], "fips": c["fips"], "arrived_returns": c["returns"], "arrived_people": c["people"],
                 "arrived_agi_per_return": round(c["agi_thousands"] * 1000 / c["returns"]),
                 "left_returns": (o["returns"] if o and o["returns"] >= 0 else None)})
out["top_origins_2223"] = rows[:25]
out["top_destinations_2223"] = [{"county": c["county"], "state": c["state"], "fips": c["fips"], "left_returns": c["returns"], "left_people": c["people"],
                                 "left_agi_per_return": round(c["agi_thousands"] * 1000 / c["returns"]), "arrived_returns": next((i["returns"] for i in yr["in_counties"] if i["fips"] == c["fips"]), None)}
                                for c in sorted(yr["out_counties"], key=lambda c: -c["returns"]) if c["returns"] >= 0][:25]
# five-year sums by named county (in) for counties named every year
from collections import defaultdict
acc = defaultdict(lambda: {"returns": 0, "years": 0, "state": "", "county": ""})
for y in YEARS:
    for c in out["years"][y]["in_counties"]:
        if c["returns"] < 0: continue
        a = acc[c["fips"]]; a["returns"] += c["returns"]; a["years"] += 1; a["state"] = c["state"]; a["county"] = c["county"]
out["five_year_origins"] = sorted([dict(fips=k, **v) for k, v in acc.items()], key=lambda r: -r["returns"])[:25]
# state roll-up of named county rows, latest year (undercount: small flows are suppressed into 'Other flows')
st = defaultdict(int); sto = defaultdict(int)
for c in yr["in_counties"]:
    if c["returns"] > 0: st[c["state"]] += c["returns"]
for c in yr["out_counties"]:
    if c["returns"] > 0: sto[c["state"]] += c["returns"]
out["state_rollup_named_rows_2223"] = {"note": "Sum of named county rows only. Flows under the IRS disclosure threshold are in 'Other flows' lines and are not counted, so every state is an undercount.",
                                       "in": sorted(st.items(), key=lambda x: -x[1])[:15], "out": sorted(sto.items(), key=lambda x: -x[1])[:15]}
out["other_flows_2223"] = {k: v for k, v in yr["in"].items() if "Other" in k}
out["other_flows_out_2223"] = {k: v for k, v in yr["out"].items() if "Other" in k}
json.dump(out, open(f"{D}/irs-migration.json", "w"), indent=1)
for s in summ: print(s)
print(json.dumps(out["top_origins_2223"][:16], indent=0))
print("DEST", json.dumps(out["top_destinations_2223"][:12]))
print("5yr", json.dumps(out["five_year_origins"][:12]))
print(out["state_rollup_named_rows_2223"])
print(out["other_flows_2223"]); print(out["other_flows_out_2223"])
# Census regions: named out-of-state county rows plus the IRS "Other flows - <region>" lines = every out-of-state return.
REG = {"Northeast": "CT ME MA NH RI VT NJ NY PA", "Midwest": "IL IN MI OH WI IA KS MN MO NE ND SD",
       "South": "DE DC FL GA MD NC SC VA WV AL KY MS TN AR LA OK TX", "West": "AZ CO ID MT NV NM UT WY AK CA HI OR WA"}
s2r = {s: r for r, ss in REG.items() for s in ss.split()}
regions = {}
for y in YEARS:
    yr = out["years"][y]; res = {}
    for kind in ("in", "out"):
        tot = {r: 0 for r in REG}
        for c in yr[kind + "_counties"]:
            if c["returns"] > 0 and c["state"] != "SC": tot[s2r[c["state"]]] += c["returns"]
        for r in REG:
            o = yr[kind].get(f"Other flows - {r}")
            if o: tot[r] += o["returns"]
        tot["check_sum"] = sum(tot[r] for r in REG); tot["irs_diffstate_total"] = yr[kind]["Horry County Total Migration-Different State"]["returns"]
        res[kind] = tot
    regions[yr["label"]] = res
out["regions"] = regions
json.dump(out, open(f"{D}/irs-migration.json", "w"), indent=1)
print(json.dumps(regions, indent=0))
