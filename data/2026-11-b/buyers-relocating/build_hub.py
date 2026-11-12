"""Data for the relocation hub /buyers/relocating/ (batch 2026-11-b).

Run: python3 -I build_hub.py <website root>
Reads files other batches already pulled (named below) plus the Census county
gazetteer in raw/, measures drives with the public OSRM router, and writes
hub.json. No names, no addresses, no single sale leaves this script.

Inputs
- data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json
  (Horry County deeds Oct 2025 - Sep 2026 joined to the parcel layer;
  owner_state = the state the county mails the tax bill to)
- data/2026-11-a/buyers-relocating-why-myrtle-beach/raw/countyinflow2223.csv
  (IRS SOI county-to-county inflow into Horry County, filing years 2022-2023)
- raw/2024_Gaz_counties_national.txt (Census 2024 county gazetteer,
  internal point of each county)
"""
import csv, json, os, sys, time, urllib.request
from collections import Counter

ROOT = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
SALES = os.path.join(ROOT, "data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json")
IRS = os.path.join(ROOT, "data/2026-11-a/buyers-relocating-why-myrtle-beach/raw/countyinflow2223.csv")
GAZ = os.path.join(HERE, "raw/2024_Gaz_counties_national.txt")

# The ten states that have a /buyers/relocating/from-<state>/ guide today.
GUIDES = {"NC": "north-carolina", "NY": "new-york", "NJ": "new-jersey", "PA": "pennsylvania",
          "OH": "ohio", "MD": "maryland", "VA": "virginia", "CT": "connecticut",
          "MA": "massachusetts", "FL": "florida"}
# Myrtle Beach city center, the same point that reproduces the getting-around page's
# Charlotte figure (170 road miles, about 3 h 40 m).
MB = (33.6891, -78.8867)

# 1. Buyers by tax-bill state, from the deed file -------------------------------------
d = json.load(open(SALES))
sales = [s for s in d["sales"] if s.get("owner_is_grantee")]
all_n = len(sales)
by_state = Counter(); by_state_house = Counter(); by_state_condo = Counter()
for s in sales:
    if s["where"] in ("US", "CANADA"):
        st = s["owner_state"] if s["where"] == "US" else "CANADA"
        by_state[st] += 1
        (by_state_condo if s["condo"] else by_state_house)[st] += 1
out_n = sum(by_state.values())
guide_n = sum(by_state[k] for k in GUIDES)
houses = [s for s in sales if not s["condo"]]
houses_out = sum(1 for s in houses if s["where"] in ("US", "CANADA"))

# 2. IRS: households from each guide state's largest origin county ---------------------
rows = list(csv.DictReader(open(IRS)))
named = [r for r in rows if r["y1_statefips"] not in ("96", "97", "98") and r["y1_countyfips"] != "000"
         and not r["y1_countyname"].startswith(("Horry County", "Other flows"))]
top_county = {}
for r in named:
    st = r["y1_state"]
    n = int(r["n1"])
    if st in GUIDES and (st not in top_county or n > top_county[st]["households"]):
        top_county[st] = {"fips": r["y1_statefips"] + r["y1_countyfips"], "county": r["y1_countyname"],
                          "households": n}

# 3. Drive from that county's internal point to Myrtle Beach ---------------------------
gaz = {}
with open(GAZ) as f:
    for r in csv.DictReader(f, delimiter="\t"):
        r = {k.strip(): v.strip() for k, v in r.items()}
        gaz[r["GEOID"]] = (float(r["INTPTLAT"]), float(r["INTPTLONG"]))

def osrm(a, b):
    url = ("https://router.project-osrm.org/route/v1/driving/"
           f"{a[1]},{a[0]};{b[1]},{b[0]}?overview=false")
    with urllib.request.urlopen(url, timeout=30) as resp:
        r = json.load(resp)["routes"][0]
    return round(r["distance"] / 1609.344), round(r["duration"] / 60)

drives = {}
for st, c in top_county.items():
    pt = gaz.get(c["fips"])
    if not pt:
        continue
    mi, mins = osrm(pt, MB)
    drives[st] = {"from": c["county"], "point": pt, "road_miles": mi, "minutes_no_traffic": mins}
    time.sleep(1)
check = osrm((35.2271, -80.8431), MB)  # Charlotte city center, control

out = {
    "made": "build_hub.py",
    "sources": {
        "deeds": "Horry County AcclaimWeb deeds Oct 2025 - Sep 2026 + parcel layer 24 (batch 2026-10-d)",
        "irs": "https://www.irs.gov/pub/irs-soi/countyinflow2223.csv",
        "gazetteer": "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_counties_national.zip",
        "router": "https://router.project-osrm.org (OpenStreetMap road network, no traffic)",
    },
    "deeds": {
        "matched_sales": all_n, "outside_sc": out_n, "pct_outside_sc": round(100 * out_n / all_n, 1),
        "guide_states_buyers": guide_n, "pct_of_outside_from_guide_states": round(100 * guide_n / out_n, 1),
        "houses": len(houses), "houses_outside_sc": houses_out,
        "pct_houses_outside_sc": round(100 * houses_out / len(houses), 1),
        "by_state": by_state.most_common(25),
        "by_state_house": by_state_house.most_common(15),
        "by_state_condo": by_state_condo.most_common(15),
    },
    "guide_states": [
        {"state": st, "slug": GUIDES[st], "buyers": by_state[st], "houses": by_state_house[st],
         "condos": by_state_condo[st], "irs_top_county": top_county.get(st), "drive": drives.get(st)}
        for st in sorted(GUIDES, key=lambda k: -by_state[k])
    ],
    "control_charlotte": {"road_miles": check[0], "minutes_no_traffic": check[1]},
}
json.dump(out, open(os.path.join(HERE, "hub.json"), "w"), indent=1)
print(json.dumps(out["deeds"], indent=1)[:1500])
for g in out["guide_states"]:
    print(g["state"], g["buyers"], g["houses"], g["condos"], g["irs_top_county"], g["drive"] and (g["drive"]["road_miles"], g["drive"]["minutes_no_traffic"]))
print("control", out["control_charlotte"])
