"""SC Department of Consumer Affairs HOA complaint workbooks (report years 2023 to 2026 = calendar years 2022 to 2025):
for complaints about associations in Horry County, (1) when the owner got the governing documents (before or after
purchase), (2) whether the owner was told membership was required, (3) the label word in the association's name
(same rule as classify_names.py). Counts only, no names.
Workbooks: data/2026-10-d/hoa-special-assessments/raw/scdca-legislative-<year>.xlsx (from https://www.consumer.sc.gov/HOA-reports).
Usage: python3 scdca_docs.py <this dir> <dir with the workbooks>. Needs openpyxl. Writes scdca-docs.json."""
import sys, os, json, re, collections, openpyxl
d, src = sys.argv[1], sys.argv[2]
LABELS = [("condo", r"REGIME|\bHPR\b|HORIZONTAL|CONDO|CO-?OWNER|COUNCIL OF"), ("poa", r"PROPERTY OWNER|\bPOA\b"),
          ("hoa", r"HOMEOWNER|HOME OWNER|\bHOA\b"), ("community", r"COMMUNITY ASSOC|MASTER|OWNERS ASSOC|RESIDENTS|ASSOCIATION|\bASSN\b|\bASSOC\b")]
def label(n):
    for k, rx in LABELS:
        if re.search(rx, n or "", re.I): return k
    return "other"
out = {"source": "https://www.consumer.sc.gov/HOA-reports", "years": {}}
tot = collections.defaultdict(collections.Counter)
for y in (2023, 2024, 2025, 2026):
    wb = openpyxl.load_workbook(os.path.join(src, f"scdca-legislative-{y}.xlsx"), read_only=True)
    rows = list(wb.worksheets[0].iter_rows(values_only=True)); h = [str(x or "").strip() for x in rows[0]]
    col = lambda name: next(i for i, x in enumerate(h) if x.lower().startswith(name.lower()))
    cc, cb, ci, cn = col("HOA County"), col("Governing documents obtained"), col("Were you informed"), col("HOA Name")
    c = collections.Counter(); names = set()
    for r in rows[1:]:
        if not r or str(r[cc] or "").strip().lower() != "horry": continue
        c["complaints"] += 1
        c["docs_" + (str(r[cb]).strip().lower() if r[cb] else "blank")] += 1
        c["informed_" + (str(r[ci]).strip().lower() if r[ci] else "blank")] += 1
        names.add(str(r[cn] or "").strip().upper())
    c.update("name_" + label(n) for n in names); c["distinct_names"] = len(names)
    out["years"][f"report {y} (calendar {y-1})"] = dict(c); tot["all"].update(c)
out["four_years_horry"] = dict(tot["all"])
a = tot["all"]; known = a["docs_before"] + a["docs_after"]
out["share_after_of_known_pct"] = round(100 * a["docs_after"] / known, 1) if known else None
print(json.dumps(out, indent=1))
json.dump(out, open(os.path.join(d, "scdca-docs.json"), "w"), indent=1)
