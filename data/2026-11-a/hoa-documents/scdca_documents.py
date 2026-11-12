"""Horry County HOA complaints to SC Consumer Affairs, report years 2023 to 2026 (calendar 2022 to 2025):
documents before or after purchase, denied access to the documents, when and from whom the owner learned of the HOA,
and whether the owner says they understand their rights. Counts only; no names.
Usage: python3 scdca_documents.py <outdir> <dir with scdca-legislative-YYYY.xlsx>  (needs openpyxl)
The workbooks are the ones saved by the sibling page: data/2026-10-d/hoa-special-assessments/raw/."""
import sys, json, os, collections, openpyxl
out, src = sys.argv[1], sys.argv[2]
COLS = {"docs": "Governing documents obtained before or after purchase?", "denied": "Have you been denied access to the governing documents?",
        "when": "When was information provided?", "who": "Who provided the information?", "understand": "Do you understand rights and obligations?",
        "received": "Have you received a copy of the governing documents of the H"}
res = {"source": "https://www.consumer.sc.gov/HOA-reports", "years": {}, "statewide": {}}
tot = collections.defaultdict(collections.Counter); who_tot = collections.Counter(); sw = collections.defaultdict(collections.Counter)
for yr in (2023, 2024, 2025, 2026):
    ws = openpyxl.load_workbook(os.path.join(src, f"scdca-legislative-{yr}.xlsx"), read_only=True).worksheets[0]
    rows = list(ws.iter_rows(values_only=True)); h = [str(x or "") for x in rows[0]]
    ix = {k: next(i for i, c in enumerate(h) if c.startswith(v)) for k, v in COLS.items()}
    cty = h.index("HOA County")
    y = collections.defaultdict(collections.Counter); who = collections.Counter(); n = 0
    for r in rows[1:]:
        if not r or not r[0]: continue
        for k in ("docs", "denied", "when", "understand", "received"):
            sw[k][str(r[ix[k]] or "not noted").strip()] += 1
        sw["all"]["complaints"] += 1
        if str(r[cty] or "").strip().lower() != "horry": continue
        n += 1
        for k in ("docs", "denied", "when", "understand", "received"):
            v = str(r[ix[k]] or "not noted").strip(); y[k][v] += 1; tot[k][v] += 1
        for part in str(r[ix["who"]] or "not noted").split(","):
            p = part.strip() or "not noted"; who[p] += 1; who_tot[p] += 1
    res["years"][f"report {yr} (calendar {yr-1})"] = {"horry_complaints": n, **{k: dict(v) for k, v in y.items()}, "who_provided": dict(who)}
res["four_years_horry"] = {"complaints": sum(v["horry_complaints"] for v in res["years"].values()), **{k: dict(v) for k, v in tot.items()},
                           "who_provided (a complaint can name more than one)": dict(who_tot.most_common())}
res["statewide"] = {k: dict(v) for k, v in sw.items()}
d = res["four_years_horry"]["denied"]; yes = d.get("Yes", 0); no = d.get("No", 0)
res["denied_yes_share_of_answered_pct"] = round(100 * yes / (yes + no), 1) if yes + no else None
json.dump(res, open(os.path.join(out, "scdca-documents.json"), "w"), indent=1)
print(json.dumps(res["four_years_horry"], indent=1)); print("denied share", res["denied_yes_share_of_answered_pct"])
