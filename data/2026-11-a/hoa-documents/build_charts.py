"""Chart rows for /hoa/documents/, built only from the data files in this folder.
Usage: python3 -I build_charts.py <this dir>. Writes chart-recorded.json, chart-scdca.json, chart-states.json."""
import sys, json, os
d = sys.argv[1]
r = json.load(open(os.path.join(d, "recorded-by-year.json")))
rows = [{"year": int(y), "rules_and_policies": v.get("rules and policies", 0), "amendments": v.get("amendment", 0),
         "declarations": v.get("declaration", 0), "bylaws": v.get("bylaws", 0), "all": v["all"],
         "january": r["january_by_year"][y], "partial": y == "2026"} for y, v in r["by_year"].items()]
json.dump({"title": "Association papers filed at the Horry County Register of Deeds, by year (our count of the county index)",
           "note": "RESTRICTIONS (082) rows kept by analyze_recorded.py. 2026 runs to October. January 10 is the yearly recording deadline for rules (SC Code 27-30-130).",
           "source": r["source"], "rows": rows,
           "last_12_months": r["last_12_months_2025-11_to_2026-10"],
           "filers_last_12_months": r["distinct_association_filers_last_12_months"],
           "months_2018_2019": {k: v for k, v in r["by_month"].items() if "2018-06" <= k <= "2019-06"}},
          open(os.path.join(d, "chart-recorded.json"), "w"), indent=1)
s = json.load(open(os.path.join(d, "scdca-documents.json")))["four_years_horry"]
json.dump({"title": "Horry County owners who complained to the state about an HOA, 2022 to 2025",
           "source": "https://www.consumer.sc.gov/HOA-reports",
           "told_of_association": {k: s["when"].get(k, 0) for k in ("Before Closing", "At Closing", "After Closing")},
           "got_documents": {"Before purchase": s["docs"]["Before"], "After purchase": s["docs"]["After"]},
           "denied_access": {"Yes": s["denied"]["Yes"], "No": s["denied"]["No"]},
           "complaints": s["complaints"]}, open(os.path.join(d, "chart-scdca.json"), "w"), indent=1)
states = [
  {"state": "South Carolina", "packet_by_law": "No", "deadline": "None", "cancel_right": "None tied to the HOA papers", "fee_cap": "None", "rows": "3, 4, 6"},
  {"state": "Virginia", "packet_by_law": "Yes, resale certificate", "deadline": "", "cancel_right": "3 days after receipt if the contract sets none; any time before settlement if it never arrives", "fee_cap": "", "rows": "24"},
  {"state": "Maryland", "packet_by_law": "Yes, HOA disclosures", "deadline": "By 20 calendar days after the contract", "cancel_right": "5 calendar days after receipt, if received late", "fee_cap": "Up to $250", "rows": "25"},
  {"state": "Florida (HOA)", "packet_by_law": "Disclosure summary before the contract", "deadline": "Before signing", "cancel_right": "3 days after receipt, if not given before signing", "fee_cap": "", "rows": "26"},
  {"state": "North Carolina (condo)", "packet_by_law": "Statement of fees", "deadline": "Before closing", "cancel_right": "", "fee_cap": "", "rows": "27"}]
json.dump({"title": "What the law gives a buyer of a home in an association, by state", "note": "Blank cells were not researched; the writer leaves them out, never fills them.", "rows": states},
          open(os.path.join(d, "chart-states.json"), "w"), indent=1)
print("ok", len(rows))
