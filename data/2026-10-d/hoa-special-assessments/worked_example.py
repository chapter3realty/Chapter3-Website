"""The page's labelled worked example: how one special assessment splits across a condo building.
South Carolina's Horizontal Property Act (S.C. Code 27-31-60 and 27-31-190) shares common expenses by each unit's
percentage in the master deed. The building, the repair cost and the reserve balance are stated round numbers for
the example (judge's notes, audit/judged-2026-10-31.json); they describe no real building.
Run: python3 -I worked_example.py <this dir>. Writes worked-example.json."""
import sys, os, json
d = sys.argv[1] if len(sys.argv) > 1 else "."
units = [  # (kind, count, percentage of the whole in the master deed)
    ("1-bedroom", 60, 0.65), ("2-bedroom", 40, 0.95), ("3-bedroom", 20, 1.15)]
total_pct = round(sum(n * p for _, n, p in units), 6)
assert abs(total_pct - 100) < 1e-9, total_pct
roof, reserve = 1_200_000, 300_000
short = roof - reserve
rows = [{"unit": k, "count": n, "percent": p, "share": round(short * p / 100)} for k, n, p in units]
assert abs(sum(r["share"] * r["count"] for r in rows) - short) < 1  # the shares add back to the shortfall
out = {"building_units": sum(n for _, n, _ in units), "percent_total": total_pct, "repair_cost": roof, "reserve_on_hand": reserve,
       "shortfall": short, "average_per_unit": round(short / sum(n for _, n, _ in units)), "rows": rows,
       "fannie_mae_unfunded_critical_repair_line_per_unit": 10000}
json.dump(out, open(os.path.join(d, "worked-example.json"), "w"), indent=1)
print(json.dumps(out, indent=1))
