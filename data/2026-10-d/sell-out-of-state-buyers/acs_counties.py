"""ACS 2024 5-year median home value (B25077) and median real estate taxes paid (B25103) for Horry County and the largest
origin counties outside SC in the IRS 2022-2023 inflow file. One data.census.gov call per county and table.
Usage: python3 -I acs_counties.py <datadir> -> acs-origin-counties.json"""
import sys, json, os, time, urllib.request
D = sys.argv[1]
# Raw downloads (deed index rows and parcel records carry owner names) stay outside the repo: set RAW, default <datadir>/raw.
RAW = os.environ.get("RAW", os.path.join(D, "raw")); os.makedirs(RAW, exist_ok=True)
irs = json.load(open(os.path.join(D, "irs-horry-inflow.json")))

import csv
fips = {}
for r in csv.DictReader(open(os.path.join(RAW, "countyinflow2223.csv"), encoding="latin-1")):
    if r["y2_statefips"] == "45" and r["y2_countyfips"] == "051": fips[(r["y1_countyname"], r["y1_state"])] = r["y1_statefips"] + r["y1_countyfips"]
geos = [("Horry County", "SC", "45051")] + [(c["county"], c["state"], fips[(c["county"], c["state"])]) for c in irs["top_counties_outside_sc"][:10]]
out = []
for name, st, g in geos:
    row = {"county": name, "state": st, "fips": g}
    for t in ("B25077", "B25103"):
        url = f"https://data.census.gov/api/access/data/table?id=ACSDT5Y2024.{t}&g=0500000US{g}"
        for i in range(4):
            try:
                d = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0"}), timeout=90).read()); break
            except Exception as e: print("retry", e, file=sys.stderr); time.sleep(4)
        hdr, val = d["response"]["data"][0], d["response"]["data"][1]
        rec = dict(zip(hdr, val))
        row[t] = {"estimate": rec.get(t + "_001E"), "moe": rec.get(t + "_001M"), "name": rec.get("NAME"), "url": url}
    out.append(row); print(row["county"], st, row["B25077"]["estimate"], row["B25103"]["estimate"], flush=True)
json.dump(out, open(os.path.join(D, "acs-origin-counties.json"), "w"), indent=1)
