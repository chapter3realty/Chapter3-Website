"""Labelled worked example for /hoa/reserves/. Round example costs (ours, not any real building);
useful lives from HUD's CNA e-Tool Estimated Useful Life table (Family column, raw/hud-eul.txt).
Percent funded = reserve balance / fully funded balance, where each component's fully funded
balance = current cost x effective age / useful life (National Reserve Study Standards, raw/ar-nrss.txt).
Budget test = reserve line / annual budgeted assessment income (Fannie Mae B4-2.2-01; Freddie Mac Bulletin 2026-C).
Run: python3 -I worked_example.py > worked-example.json"""
import json
UNITS = 80
DUES_MONTH = 600            # example monthly dues per unit
RESERVE_LINE = 60000        # example yearly reserve contribution in the budget
BALANCE_WEAK = 400000       # example reserve balance today
YEARS = 5                   # look-ahead window
# name, HUD component (Family EUL), HUD life, years since last replaced, example cost
C = [("Flat roof", "3.3.4.2.1 Low slope built-up roof, with gravel finish", 20, 15, 480000),
     ("Elevator machinery (two elevators)", "3.5.1.6 Elevator, machinery", 20, 17, 360000),
     ("Exterior paint and coatings", "3.3.2.4.5 Paints and stains, exterior", 8, 6, 240000),
     ("Concrete balconies", "3.3.2.7.8 Balcony/Porch, steel frame or concrete", 40, 30, 800000),
     ("Parking lot paving", "3.2.4.1 Asphalt Pavement", 25, 12, 120000),
     ("Pool pumps and equipment", "3.2.7.8 Pool/Spa pumps and equipment", 10, 4, 30000)]
rows = []
for name, hud, life, age, cost in C:
    rows.append({"part": name, "hud": hud, "life_years": life, "age_years": age, "years_left": life - age,
                 "cost": cost, "fully_funded_share": round(cost * age / life)})
ffb = sum(r["fully_funded_share"] for r in rows)
cost_total = sum(r["cost"] for r in rows)
due = [r for r in rows if r["years_left"] <= YEARS]
due_cost = sum(r["cost"] for r in due)
income = UNITS * DUES_MONTH * 12
def case(balance):
    cash = balance + RESERVE_LINE * YEARS
    gap = max(0, due_cost - cash)
    return {"balance": balance, "percent_funded": round(100 * balance / ffb, 1),
            "cash_in_5_years": cash, "due_in_5_years": due_cost, "gap": gap,
            "gap_per_unit_80": round(gap / UNITS), "gap_per_unit_40": round(gap / 40), "gap_per_unit_200": round(gap / 200)}
strong_balance = round(0.75 * ffb, -4)
out = {"label": "Example with round numbers, not a real building", "units": UNITS, "dues_month": DUES_MONTH,
       "components": rows, "cost_total": cost_total, "fully_funded_balance": ffb,
       "due_within_years": YEARS, "due_parts": [r["part"] for r in due],
       "weak": case(BALANCE_WEAK), "strong": case(strong_balance),
       "budget": {"assessment_income_year": income, "reserve_line": RESERVE_LINE,
                  "reserve_share_pct": round(100 * RESERVE_LINE / income, 1),
                  "needed_at_10pct": round(0.10 * income), "needed_at_15pct": round(0.15 * income),
                  "extra_per_unit_month_for_15pct": round((0.15 * income - RESERVE_LINE) / UNITS / 12)},
       "notes": "Gap split equally per unit for simplicity; in a real condo each owner's share is the unit's percentage in the master deed. Same gap divided by 40 and 200 units shows how size changes the per-unit bill."}
print(json.dumps(out, indent=1))
