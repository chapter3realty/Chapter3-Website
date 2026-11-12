"""Count SC Department of Consumer Affairs HOA complaints (the per-complaint Legislative Report workbooks)
by county and by the concern categories that touch money: fees and special assessments, allocation of
funds, financial statements, maintenance and repairs. Also counts complaints whose free-text fields use
the words "special assessment".
Inputs: raw/scdca-legislative-<year>.xlsx from https://www.consumer.sc.gov/HOA-reports
(the <year> is the report year; each report covers the calendar year before it).
Run: python3 scdca_counts.py <this dir>. Writes scdca-counts.json (counts only, no HOA names)."""
import sys, os, json, re, openpyxl
d = sys.argv[1] if len(sys.argv) > 1 else "."
CATS = {
    "fees_special_assessments": "Consumer disagrees with HOA Fees/Special Assessments",
    "allocation_of_funds": "Concerns on Allocation of HOA funds",
    "financial_statements": "Failure to produce financial statements",
    "maintenance_repairs": "Concerns regarding maintenance or repairs",
}
SA = re.compile(r"special\s+assess", re.I)
out = {"source": "https://www.consumer.sc.gov/HOA-reports", "reports": {}}
for year in (2023, 2024, 2025, 2026):
    f = os.path.join(d, "raw", f"scdca-legislative-{year}.xlsx")
    if not os.path.exists(f): continue
    ws = openpyxl.load_workbook(f, read_only=True).worksheets[0]
    rows = list(ws.iter_rows(values_only=True))
    head = [str(h).strip() if h else "" for h in rows[0]]
    def col(name):
        for i, h in enumerate(head):
            if h.lower().startswith(name.lower()): return i
        raise KeyError(name)
    ci, cd = col("HOA County"), col("Complaint Description")
    text_cols = [i for i, h in enumerate(head) if re.search(r"description|recommendation|explanation", h, re.I)]
    body = [r for r in rows[1:] if r and r[0]]
    def tally(sub):
        t = {"complaints": len(sub)}
        for k, label in CATS.items():
            t[k] = sum(1 for r in sub if r[cd] and label.lower() in str(r[cd]).lower())
        t["words_special_assessment"] = sum(1 for r in sub if any(r[i] and SA.search(str(r[i])) for i in text_cols))
        return t
    horry = [r for r in body if str(r[ci] or "").strip().lower() == "horry"]
    geo = [r for r in body if str(r[ci] or "").strip().lower() == "georgetown"]
    out["reports"][str(year)] = {"calendar_year": year - 1, "statewide": tally(body), "horry": tally(horry), "georgetown": tally(geo),
                                 "columns": {"county": head[ci], "concerns": head[cd], "free_text": [head[i] for i in text_cols]}}
    print(year, json.dumps(out["reports"][str(year)]["statewide"]), json.dumps(out["reports"][str(year)]["horry"]))
json.dump(out, open(os.path.join(d, "scdca-counts.json"), "w"), indent=1)
