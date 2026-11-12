"""What Horry County owners complained to the SC Department of Consumer Affairs about, by concern, from the
per-complaint Legislative Report workbooks (https://www.consumer.sc.gov/HOA-reports). Reuses the workbooks
pulled for /hoa/special-assessments/ (data/2026-10-d/hoa-special-assessments/raw/scdca-legislative-<year>.xlsx;
each report year covers the calendar year before it). A complaint can name several concerns (the
"Complaint Description" cell holds a list), so concern counts add to more than the complaints.
Counts only; no HOA, management company or person is kept.
Run: python3 -I scdca_concerns.py <this dir> <dir with the xlsx>. Writes scdca-concerns.json."""
import sys, os, json, re, collections, openpyxl
d, src = sys.argv[1], sys.argv[2]
out = {"source": "https://www.consumer.sc.gov/HOA-reports", "inputs": [], "years": {}, "total": {}}
tot = collections.Counter(); tot_n = 0
for year in (2023, 2024, 2025, 2026):
    f = os.path.join(src, f"scdca-legislative-{year}.xlsx")
    if not os.path.exists(f): continue
    out["inputs"].append(f.split("/data/")[-1])
    rows = list(openpyxl.load_workbook(f, read_only=True).worksheets[0].iter_rows(values_only=True))
    head = [str(h).strip() if h else "" for h in rows[0]]
    ci = next(i for i, h in enumerate(head) if h.lower().startswith("hoa county"))
    cd = next(i for i, h in enumerate(head) if h.lower() == "complaint description")
    body = [r for r in rows[1:] if r and r[0] and str(r[ci] or "").strip().lower().startswith("horry")]
    c = collections.Counter()
    for r in body:
        for part in re.split(r"[;,\n]\s*(?=[A-Z])", str(r[cd] or "")):
            p = part.strip()
            if p: c[p] += 1
    out["years"][f"report {year} (calendar {year-1})"] = {"horry_complaints": len(body), "concerns": dict(c.most_common())}
    tot.update(c); tot_n += len(body)
out["total"] = {"horry_complaints": tot_n, "concerns": dict(tot.most_common()),
                "pct_of_complaints": {k: round(100 * v / tot_n, 1) for k, v in tot.most_common()}}
json.dump(out, open(os.path.join(d, "scdca-concerns.json"), "w"), indent=1)
print(json.dumps(out["total"], indent=1))
