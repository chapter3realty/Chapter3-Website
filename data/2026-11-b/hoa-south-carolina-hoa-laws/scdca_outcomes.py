"""Horry County and statewide HOA complaints to SC Consumer Affairs, report years 2023 to 2026 (calendar 2022 to 2025):
how each complaint was closed (Status), days to close, and what complainants recommended. Counts only, no names.
Usage: python3 -I scdca_outcomes.py <out-dir> <dir with scdca-legislative-YYYY.xlsx>"""
import sys, json, os, collections, datetime
import openpyxl
out, raw = sys.argv[1], sys.argv[2]
ENF = {"State agency oversight": ["state agency oversight"],
       "Dispute resolution within the HOA": ["dispute resolution with the hoa", "dispute resolution within the hoa"],
       "HOA ombudsman": ["hoa ombudsman"],
       "Magistrate's court enforcement": ["magistrate"],
       "Other": ["other"], "Not noted": ["not noted"]}
CHG = {"Open meetings and notice": ["open meeting"],
       "Rules for viewing and copying records": ["viewing/copying", "viewing/ copying"],
       "Forbid liens and foreclosure": ["forbid hoa from placing liens"],
       "Set or change developer turnover": ["developer transition"],
       "Other": ["other"], "Not noted": ["not noted"]}
def split(v, table):
    if v is None: return ["Not noted"]
    t = str(v).lower()
    return [k for k, keys in table.items() if any(x in t for x in keys)] or ["Unmatched"]
res = {"source": "https://www.consumer.sc.gov/HOA-reports (Legislative Report workbooks, report years 2023-2026)",
       "method": "One row per complaint included in the report. Horry = 'HOA County' contains HORRY. Status is the agency's closing code. "
                 "Recommendation cells hold one or more of the form's fixed choices; each choice found in the cell (case-insensitive substring, two spellings of dispute resolution merged) is counted once per complaint, so shares add to more than 100. "
                 "Days to close = 'Date Complaint Closed' minus the complaint date, where both are dates.",
       "by_year": {}, "all_years": {}}
agg = {k: {"complaints": 0, "status": collections.Counter(), "enforce": collections.Counter(), "change": collections.Counter(), "days": []} for k in ("horry", "statewide")}
for ry in (2023, 2024, 2025, 2026):
    wb = openpyxl.load_workbook(os.path.join(raw, f"scdca-legislative-{ry}.xlsx"), read_only=True, data_only=True)
    ws = wb.worksheets[0]
    rows = ws.iter_rows(values_only=True)
    h = [str(x).strip() if x else '' for x in next(rows)]
    ix = lambda name: next(i for i, x in enumerate(h) if x.lower().startswith(name.lower()))
    c_county, c_status, c_closed = ix('HOA County'), ix('Status'), ix('Date Complaint Closed')
    c_date = 1
    c_enf = ix('Recommendations for enforcing'); c_chg = ix('Recommendations for changing')
    yr = {k: {"complaints": 0, "status": collections.Counter(), "enforce": collections.Counter(), "change": collections.Counter(), "days": []} for k in ("horry", "statewide")}
    for r in rows:
        if not any(r): continue
        keys = ["statewide"] + (["horry"] if r[c_county] and 'HORRY' in str(r[c_county]).upper() else [])
        for k in keys:
            for bucket in (yr[k], agg[k]):
                bucket["complaints"] += 1
                bucket["status"][str(r[c_status]).strip()] += 1
                for p in set(split(r[c_enf], ENF)): bucket["enforce"][p] += 1
                for p in set(split(r[c_chg], CHG)): bucket["change"][p] += 1
                a, b = r[c_date], r[c_closed]
                if isinstance(a, datetime.datetime) and isinstance(b, datetime.datetime): bucket["days"].append((b - a).days)
    res["by_year"][ry - 1] = yr
def fin(b):
    d = sorted(b.pop("days"))
    b["median_days_to_close"] = d[len(d)//2] if d else None
    b["n_with_days"] = len(d)
    for k in ("status", "enforce", "change"): b[k] = dict(b[k].most_common())
    return b
for y in res["by_year"]:
    for k in res["by_year"][y]: fin(res["by_year"][y][k])
res["all_years"] = {k: fin(v) for k, v in agg.items()}
json.dump(res, open(os.path.join(out, "scdca-outcomes.json"), "w"), indent=1)
print(json.dumps(res["all_years"], indent=1))
