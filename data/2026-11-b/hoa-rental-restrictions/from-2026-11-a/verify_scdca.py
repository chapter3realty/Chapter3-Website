"""Verifier's recount of SC Department of Consumer Affairs HOA complaints that mention renting (2022 to 2025).
Why: scdca_rentals.py picked its text columns with a case-sensitive "Recommend", so it skipped the two
"Other recommendations ..." columns, and its word list had no "rented". This script reads every free-text column
(document-request explanation, all four recommendation columns, both complaint description columns, business action
and business response), never the HOA name, address or management company. Same word boundaries.
TOPIC lists the complaints the verifier read and judged to be about an association's rental rule (read by hand, 2026-11-04).
Counts and complaint numbers only; no names.
Run: python3 -I verify_scdca.py <datadir> <workbook dir>"""
import sys, os, re, json, glob, openpyxl, collections
out, src = sys.argv[1], sys.argv[2]
W = re.compile(r"\b(rent|rents|rented|rental|rentals|renter|renters|renting|lease|leases|leasing|leased|tenant|tenants|airbnb|vrbo|short[- ]term)\b", re.I)
TOPIC = {"C22-01769", "C22-04112", "C22-02844", "C22-01498", "C23-00986", "C23-04311", "C23-05451", "C24-03943", "C24-04131"}
res = {"source": "SCDCA HOA legislative report workbooks (data/2026-10-d/hoa-special-assessments/raw/)", "by_year": {}, "hits": []}
for f in sorted(glob.glob(os.path.join(src, "scdca-legislative-*.xlsx"))):
    rows = list(openpyxl.load_workbook(f, read_only=True).worksheets[0].iter_rows(values_only=True))
    h = [re.sub(r"\s+", " ", str(x or "")).strip() for x in rows[0]]
    ci = h.index("HOA County")
    txt = [i for i, x in enumerate(h) if re.search(r"explanation|recommend|description|business action|business response", x, re.I)]
    c = collections.Counter(); year = None
    for r in rows[1:]:
        if not r or not r[0]: continue
        year = getattr(r[1], "year", year); horry = str(r[ci] or "").strip().lower() == "horry"
        c["all"] += 1; c["horry_all"] += horry
        cols = [h[i] for i in txt if r[i] and W.search(str(r[i]))]
        if cols:
            c["mention_all"] += 1; c["mention_horry"] += horry
            t = r[0] in TOPIC; c["rule_all"] += t; c["rule_horry"] += t and horry
            res["hits"].append({"year": year, "complaint": r[0], "horry": horry, "about_rental_rule": t, "columns": cols})
    res["by_year"][str(year)] = dict(c)
tot = collections.Counter()
for v in res["by_year"].values(): tot.update(v)
res["total"] = dict(tot); res["text_columns"] = [h[i] for i in txt]
json.dump(res, open(os.path.join(out, "scdca-rentals-verified.json"), "w"), indent=1)
print(json.dumps(res["by_year"]), json.dumps(res["total"]))
