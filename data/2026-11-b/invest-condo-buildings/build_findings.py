"""What /invest/condo-buildings/ prints, built from the pulled files. Never edit findings.json by hand.
Reads buildings.json, building-fees.json (pull_building_fees.py), regimes-out.json (pull_regimes.py) and the /hoa/
hub's oceanfront segment (../hoa/fees-by-kind.json). Writes findings.json, chart-fees.json, chart-sales.json, table.json.
Rules:
- A fee is printed only when 3 or more units for sale give one (MIN_FEE). Otherwise the building reads
  "Too few units for sale to give a fee" and the count.
- Fees are the bisection value to $5 ("about"); the middle half is printed only when 12 or more give a fee.
- Asking price: the middle asking price of the units for sale, rounded to $5,000 (aggregate only).
- Sales: county deeds recorded 2025-10-01 to 2026-09-30, middle price rounded to $1,000; printed when 5 or more.
- A year of fees as a share of the middle sale price is printed when both exist.
Run: python3 -I build_findings.py <this folder>."""
import json, sys
out = sys.argv[1]
MIN_FEE, MIN_SALES = 3, 5
B = json.load(open(f"{out}/buildings.json"))["buildings"]
F = json.load(open(f"{out}/building-fees.json"))
R = json.load(open(f"{out}/regimes-out.json"))["buildings"]
hub = json.load(open(f"{out}/../hoa/fees-by-kind.json"))["segments"]["condo_oceanfront"]
def r5k(x): return int(round(x / 5000.0)) * 5000 if x else None
def r1k(x): return int(round(x / 1000.0)) * 1000 if x else None
rows = []
for b in B:
    f = F["buildings"].get(b["slug"], {}); g = R.get(b["slug"], {})
    q = f.get("quartiles", {})
    tot = f.get("total") or 0; wf = f.get("with_fee") or 0
    fee = q.get("median", {}).get("at_or_below") if wf >= MIN_FEE else None
    row = {"slug": b["slug"], "name": b["name"], "city": b["city"], "on_july_page": b["on_july_page"],
           "for_sale": tot, "with_fee": wf, "fee": fee,
           "fee_band": [q["p25"]["at_or_below"], q["p75"]["at_or_below"]] if (fee and "p25" in q and "p75" in q) else None,
           "fee_note": None if fee else ("No units for sale this week" if tot == 0 else "Too few units for sale to give a fee"),
           "asking_median": r5k(f.get("asking", {}).get("median")) if tot >= MIN_FEE else None,
           "asking_n": f.get("asking", {}).get("n"),
           "beds": f.get("beds"), "sqft_median": f.get("sqft_median"),
           "flags": f.get("flags"), "units": g.get("units"), "sales": g.get("sales"),
           "sales_median": r1k(g.get("sales_median")) if (g.get("sales") or 0) >= MIN_SALES else None,
           "pct_units_sold": g.get("pct_units_sold") if (g.get("sales") or 0) >= MIN_SALES else None}
    if row["fee"] and row["sales_median"]:
        row["fee_year_pct_of_sale"] = round(100 * row["fee"] * 12 / row["sales_median"], 1)
    if row["flags"] and tot:
        row["shares"] = {k: round(v / tot, 2) for k, v in row["flags"].items()}
    rows.append(row)
with_fee = [r for r in rows if r["fee"]]
july = [r for r in rows if r["on_july_page"]]
findings = {
    "made": "build_findings.py", "pulled": F.get("pulled"), "deeds": "recorded 2025-10-01 to 2026-09-30",
    "buildings": rows,
    "counts": {"buildings": len(rows), "with_fee": len(with_fee), "july_buildings": len(july),
               "july_with_fee": sum(1 for r in july if r["fee"]),
               "for_sale_in_these": sum(r["for_sale"] for r in rows)},
    "fee_range": {"low": min(with_fee, key=lambda r: r["fee"])["name"] if with_fee else None,
                  "low_fee": min(r["fee"] for r in with_fee) if with_fee else None,
                  "high": max(with_fee, key=lambda r: r["fee"])["name"] if with_fee else None,
                  "high_fee": max(r["fee"] for r in with_fee) if with_fee else None},
    "hub_oceanfront": {"total": hub["total"], "median": hub["quartiles"]["median"]["at_or_below"],
                       "p25": hub["quartiles"]["p25"]["at_or_below"], "p75": hub["quartiles"]["p75"]["at_or_below"]},
}
json.dump(findings, open(f"{out}/findings.json", "w"), indent=1)
json.dump({"title": "What each oceanfront building charges a month", "unit": "$ a month (middle fee of units for sale)",
           "rows": [{"label": r["name"], "value": r["fee"], "n": r["with_fee"]} for r in sorted(with_fee, key=lambda r: r["fee"])]},
          open(f"{out}/chart-fees.json", "w"), indent=1)
sold = sorted([r for r in rows if r["sales_median"]], key=lambda r: -r["sales"])[:12]
json.dump({"title": "Oceanfront buildings that sold the most units last year", "unit": "units sold (county deeds)",
           "rows": [{"label": r["name"], "value": r["sales"], "note": r["sales_median"]} for r in sold]},
          open(f"{out}/chart-sales.json", "w"), indent=1)
json.dump([{k: r[k] for k in ["name", "city", "fee", "with_fee", "fee_note", "asking_median", "sales", "sales_median", "units"]} for r in rows],
          open(f"{out}/table.json", "w"), indent=1)
print(json.dumps(findings["counts"]), json.dumps(findings["fee_range"]))
