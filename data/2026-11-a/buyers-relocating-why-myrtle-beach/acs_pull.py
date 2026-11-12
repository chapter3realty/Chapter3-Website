"""ACS tables from data.census.gov for Horry County, South Carolina and the United States, and median home value and
median real estate taxes for the largest out-of-state origin counties (IRS 2022-2023 inflow).
Run: python3 -I acs_pull.py <this dir>. Writes acs.json. One call per table and geography."""
import sys, json, time, urllib.request
D = sys.argv[1]
def get(tid, g):
    url = f"https://data.census.gov/api/access/data/table?id={tid}&g={g}"
    for i in range(4):
        try:
            d = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "curl/8.5.0"}), timeout=90).read())
            hdr, val = d["response"]["data"][0], d["response"]["data"][1]
            return dict(zip(hdr, val)), url
        except Exception as e:
            print("retry", tid, g, e, file=sys.stderr); time.sleep(4)
    return None, url
GEOS = {"Horry County, SC": "0500000US45051", "South Carolina": "0400000US45", "United States": "010XX00US"}
out = {"tables": {}}
for tid in ["ACSDT1Y2024.B05002", "ACSDT1Y2024.B01002", "ACSDT1Y2024.B07001", "ACSDT5Y2024.B05002", "ACSDT5Y2024.B25077", "ACSDT5Y2024.B25103", "ACSDT1Y2024.B25077"]:
    for name, g in GEOS.items():
        rec, url = get(tid, g)
        out["tables"].setdefault(tid, {})[name] = {"url": url, "data": rec}
        print(tid, name, None if not rec else {k: v for k, v in rec.items() if k.endswith("_001E") or k.endswith("_003E") or k.endswith("_004E") or k.endswith("_065E")}, flush=True)
# extra origin counties not in the sibling file (2026-10-d/sell-out-of-state-buyers/acs-origin-counties.json)
EXTRA = {"Nassau County, NY": "36059", "Dutchess County, NY": "36027", "Baltimore County, MD": "24005", "Capitol Planning Region, CT": "09110", "Maricopa County, AZ": "04013", "Monmouth County, NJ": "34025", "Bucks County, PA": "42017", "Westchester County, NY": "36119"}
out["extra_origins"] = {}
for name, f in EXTRA.items():
    row = {"fips": f}
    for t in ("B25077", "B25103"):
        rec, url = get(f"ACSDT5Y2024.{t}", "0500000US" + f)
        row[t] = {"estimate": rec and rec.get(t + "_001E"), "moe": rec and rec.get(t + "_001M"), "name": rec and rec.get("NAME"), "url": url}
    out["extra_origins"][name] = row; print(name, row["B25077"]["estimate"], row["B25103"]["estimate"], flush=True)
json.dump(out, open(f"{D}/acs.json", "w"), indent=1)
