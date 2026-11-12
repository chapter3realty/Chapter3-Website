"""IRS SOI county-to-county inflow into Horry County SC (45051), 2022-2023.
Usage: python3 -I irs_migration.py <datadir>  -> irs-horry-inflow.json"""
import sys, csv, json, os, collections
D = sys.argv[1]
# Raw downloads (deed index rows and parcel records carry owner names) stay outside the repo: set RAW, default <datadir>/raw.
RAW = os.environ.get("RAW", os.path.join(D, "raw")); os.makedirs(RAW, exist_ok=True)
rows = [r for r in csv.DictReader(open(os.path.join(RAW, "countyinflow2223.csv"), encoding="latin-1")) if r["y2_statefips"] == "45" and r["y2_countyfips"] == "051"]
tot = {r["y1_countyname"]: {"returns": int(r["n1"]), "people": int(r["n2"]), "agi_thousands": int(r["agi"])} for r in rows if r["y1_statefips"] in ("96", "97", "98")}
cty = [r for r in rows if r["y1_statefips"] not in ("96", "97", "98") and r["y1_statefips"] != "45" and int(r["y1_statefips"]) < 57]
top = sorted(cty, key=lambda r: -int(r["n1"]))[:20]
bystate = collections.Counter()
for r in cty: bystate[r["y1_state"]] += int(r["n1"])
nonmig = [r for r in rows if r["y1_statefips"] == "45" and r["y1_countyfips"] == "051"]
out = {"source": "https://www.irs.gov/pub/irs-soi/countyinflow2223.csv", "totals": tot, "nonmigrants": {"returns": int(nonmig[0]["n1"]), "people": int(nonmig[0]["n2"])},
       "top_counties_outside_sc": [{"county": r["y1_countyname"], "state": r["y1_state"], "returns": int(r["n1"]), "people": int(r["n2"]), "agi_thousands": int(r["agi"])} for r in top],
       "published_county_rows_by_state": bystate.most_common(15), "note": "County rows are published only where a flow has 20 or more returns; the state sums are minimums."}
json.dump(out, open(os.path.join(D, "irs-horry-inflow.json"), "w"), indent=1)
print(json.dumps(out, indent=1)[:4000])
