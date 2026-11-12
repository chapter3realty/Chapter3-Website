"""The page's town table: for each town, the middle resale price (carried from /sell/home-value/, findings.json by_area,
ledger SHV 3) and months of supply on resales (towns.json, from analyze_towns.py). Houses and condos. A cell is printed
only with 100+ resales of that kind in the town for months, and 20+ for a price (SHV rule).
Usage: SHV=<data/2026-10-d/sell-home-value/findings.json> python3 -I build_towns.py <this dir> -> town-table.json"""
import json, os, sys
D = sys.argv[1]
A = {a["area"]: a for a in json.load(open(os.environ["SHV"]))["by_area"]}
T = {t["place"]: t for t in json.load(open(os.path.join(D, "towns.json")))["towns"]}
MAP = [("Myrtle Beach", "Myrtle Beach (city)", "Myrtle Beach city"), ("North Myrtle Beach", "North Myrtle Beach (city)", "North Myrtle Beach city"),
       ("Surfside Beach", "Surfside Beach", "Surfside Beach town"), ("Garden City", "Garden City", "Garden City CDP"),
       ("Little River", "Little River", "Little River CDP"), ("Carolina Forest", "Carolina Forest", "Carolina Forest CDP"),
       ("Forestbrook", "Forestbrook", "Forestbrook CDP"), ("Socastee", "Socastee", "Socastee CDP"), ("Red Hill", "Red Hill", "Red Hill CDP"),
       ("Conway", "Conway (city)", "Conway city")]
rows = []
for label, a, p in MAP:
    r = {"town": label, "census_place": p}
    for k in ("house", "condo"):
        sa = A[a].get(k) or {}; st = T[p][k]
        r[k] = {"median_resale": sa.get("median") if (sa.get("n") or 0) >= 20 else None, "resales_priced": sa.get("n"),
                "for_sale_resale": st["for_sale"] - st["for_sale_new"], "resold_12mo": st["resold_12mo"],
                "months_resale": st["months_supply_resale"], "for_sale_all": st["for_sale"], "price_cut": st["price_cut"]}
    rows.append(r)
out = {"rule": __doc__.split("\n")[0:4], "rows": rows,
       "limit": "819 of the 13,194 deed sales have no map point and no town; town months of supply count only sales with a point, so each town's figure runs a little high (about 6 percent on average)."}
json.dump(out, open(os.path.join(D, "town-table.json"), "w"), indent=1)
for r in rows: print(r["town"], "H", r["house"]["median_resale"], r["house"]["months_resale"], "| C", r["condo"]["median_resale"], r["condo"]["months_resale"], r["condo"]["for_sale_resale"], r["condo"]["resold_12mo"])
