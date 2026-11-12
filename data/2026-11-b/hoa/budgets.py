"""Where a fee goes, from two public association budgets. Run: python3 -I budgets.py <this folder>. Writes budgets.json.
1. Del Webb at Grande Dunes (55+, Myrtle Beach): 2025 annual budget column of the Budget Comparison Statement, period ending
   9/30/2025, Department 1 Operating (raw/dwgd-2025-09-financial.pdf, from
   https://www.delwebbatgrandedunes.com/ResourceCenter/Download/48372~3384081; pdftotext -layout -> .txt). Lines are parsed
   from the text by account number; the annual budget is the last figure on each line.
2. Myrtle Trace Homeowners HOA (55+, Conway): "2025 & 2026 Budget Comparisons", page 6 of the 2026 annual meeting packet
   (raw/myrtle-trace-2026-annual-meeting.pdf, from https://myrtletracesc.org/wp-content/uploads/AnnualMeetingCommitteeReports/2026/2026AAnnualMeetingDocuments.pdf).
   The page is a scan; the 2026 BUDGET column was typed by hand from raw/mt-p6-6.png (pdftoppm -r 110). Verifier: re-read the image."""
import json, re, sys
d = sys.argv[1] if len(sys.argv) > 1 else "."
txt = open(f"{d}/raw/dwgd-2025-09-financial.txt").read().split("Department 2")[0]
def line(acct):
    m = re.search(rf"\b{acct}\b[^\n]*", txt)
    nums = re.findall(r"\(?[\d,]+\.\d\d\)?", m.group(0))
    v = nums[-1]; neg = v.startswith("(")
    v = float(v.strip("()").replace(",", ""))
    return -v if neg else v
A = {k: line(k) for k in ["40005", "40015", "40016", "40020", "49001", "55013", "55022", "55025", "55032", "55035", "55159",
                          "51005", "51025", "51065", "51997", "51998", "53179", "53307", "53316", "52005", "52025", "52045", "52061"]}
m = re.search(r"Total Expense[^\n]*", txt); total_exp = float(re.findall(r"[\d,]+\.\d\d", m.group(0))[-1].replace(",", ""))
m = re.search(r"Total Assessment Revenue[^\n]*", txt); total_assess = float(re.findall(r"[\d,]+\.\d\d", m.group(0))[-1].replace(",", ""))
reserve = -A["49001"]
spend_and_save = total_exp + reserve
groups = {
    "Grande Dunes Ocean Club (beach club)": A["51997"],
    "Grande Dunes master association": A["51998"],
    "Lawns and landscaping": A["55025"] + A["53179"] + A["53307"] + A["53316"],
    "Staff (wages, taxes, benefits)": A["51005"] + A["51025"],
    "Power, water, gas, phone and internet for shared buildings": A["52005"] + A["52025"] + A["52045"] + A["52061"],
    "Savings for future repairs (reserves)": reserve,
    "Insurance": A["51065"],
}
groups["Everything else (cleaning, pool, ponds, management, upkeep)"] = spend_and_save - sum(groups.values())
dw = {"source": "Del Webb at Grande Dunes, Budget Comparison Statement, Dept. 1 Operating, annual budget 2025",
      "lines": A, "total_assessment_revenue": total_assess, "total_expense": total_exp, "transfer_to_reserves": reserve,
      "spend_and_save": spend_and_save,
      "groups": {k: {"dollars": round(v), "share_pct": round(100 * v / spend_and_save, 1)} for k, v in groups.items()}}
# Myrtle Trace, 2026 BUDGET column, typed from the scan.
mt = {"Homeowners Dues": 590520.00, "Miscellaneous Other": 33280.00, "TOTAL INCOME": 623800.00,
      "Clubhouse Expenses": 12760.00, "General & Administration Expenses": 75191.00, "Grounds & Buildings Expenses": 334771.00,
      "Pool & Lake Expenses": 40072.00, "Property & Income Tax Expenses": 2000.00, "Utilities, Clubhouse Communications": 48372.00,
      "TOTAL OPERATING EXPENSES": 513166.00, "EXCESS TOTAL REVENUES OVER EXPENSES": 110634.00}
assert abs(mt["Homeowners Dues"] + mt["Miscellaneous Other"] - mt["TOTAL INCOME"]) < 1
assert abs(sum(mt[k] for k in ["Clubhouse Expenses", "General & Administration Expenses", "Grounds & Buildings Expenses", "Pool & Lake Expenses",
                               "Property & Income Tax Expenses", "Utilities, Clubhouse Communications"]) - mt["TOTAL OPERATING EXPENSES"]) < 1
assert abs(mt["TOTAL INCOME"] - mt["TOTAL OPERATING EXPENSES"] - mt["EXCESS TOTAL REVENUES OVER EXPENSES"]) < 1
homes = 518  # myrtle-trace ledger (batch 2026-10-a) rows 23 and 31
per_home_month = mt["Homeowners Dues"] / homes / 12
pick = {"Grounds and buildings": mt["Grounds & Buildings Expenses"], "Left over after expenses": mt["EXCESS TOTAL REVENUES OVER EXPENSES"],
        "Office, management and administration": mt["General & Administration Expenses"], "Utilities": mt["Utilities, Clubhouse Communications"],
        "Pool and lakes": mt["Pool & Lake Expenses"], "Clubhouse": mt["Clubhouse Expenses"], "Taxes": mt["Property & Income Tax Expenses"]}
mtr = {"source": "Myrtle Trace HOA, 2025 & 2026 Budget Comparisons, 2026 BUDGET column (scan, p. 6)", "lines_2026": mt,
       "homes": homes, "dues_per_home_month": round(per_home_month, 2),
       "groups_of_each_100_income": {k: round(100 * v / mt["TOTAL INCOME"], 1) for k, v in pick.items()}}
json.dump({"del_webb_grande_dunes_2025": dw, "myrtle_trace_2026": mtr}, open(f"{d}/budgets.json", "w"), indent=1)
print(json.dumps({"dw": dw["groups"], "dw_total": spend_and_save, "mt": mtr["groups_of_each_100_income"], "mt_per_home": mtr["dues_per_home_month"]}, indent=1))
