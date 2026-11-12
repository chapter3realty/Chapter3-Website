"""SC Revenue and Fiscal Affairs Office, Vintage 2023 population projections 2024-2043, Horry County total population by year.
Input: raw/rfa-projections-components.xlsx from
https://rfa.sc.gov/programs/census-state-liaison-and-data-center/search-and-download-population-data/rfa-population-projections
Run: python3 -I rfa_projection.py <this dir>. Writes rfa-projection.json."""
import sys, json, openpyxl
D = sys.argv[1]
wb = openpyxl.load_workbook(f"{D}/raw/rfa-projections-components.xlsx", read_only=True, data_only=True)
ws = wb["TOTAL POPULATION"]
rows = list(ws.iter_rows(values_only=True))
hdr_i = next(i for i, r in enumerate(rows) if r and r[0] == "COUNTY")
top, sub = rows[hdr_i], rows[hdr_i + 1]
hr = next(r for r in rows if r and isinstance(r[0], str) and r[0].strip().upper() == "HORRY")
sc = next(r for r in rows if r and isinstance(r[0], str) and r[0].strip().upper() == "SOUTH CAROLINA")
out = {"source": "https://rfa.sc.gov/programs/census-state-liaison-and-data-center/search-and-download-population-data/rfa-population-projections", "horry": {}, "sc": {}}
period = None
for j, (t, s) in enumerate(zip(top, sub)):
    if t: period = t
    if isinstance(s, str) and "POPULATION" in s and "CHANGE" not in s.split("\n")[0]:
        yr = s.split()[0]
        out["horry"][yr] = hr[j]; out["sc"][yr] = sc[j]
    if isinstance(s, str) and s.startswith("NET MIGRATION"):
        out["horry"].setdefault("net_migration", {})[period] = hr[j]
    if isinstance(s, str) and s.startswith("NATURAL CHANGE"):
        out["horry"].setdefault("natural_change", {})[period] = hr[j]
json.dump(out, open(f"{D}/rfa-projection.json", "w"), indent=1)
print({k: v for k, v in out["horry"].items() if not isinstance(v, dict)})
print("nm", out["horry"].get("net_migration")); print("nc", out["horry"].get("natural_change"))
