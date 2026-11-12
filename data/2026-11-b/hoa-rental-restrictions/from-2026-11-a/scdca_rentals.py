"""Count SC Department of Consumer Affairs HOA complaints that are about renting, statewide and in Horry County.
Input: the four legislative-report workbooks saved by a sibling (data/2026-10-d/hoa-special-assessments/raw/scdca-legislative-20{23..26}.xlsx;
each covers complaints filed the year before). A complaint counts when any free-text field (complaint description, other details,
recommendations, explanation) uses a renting word: rent, rental(s), renter(s), renting, lease, leasing, tenant(s), airbnb, vrbo,
short-term, short term. Word boundaries, so 'maintenance' does not match 'tenant'. Each hit's text is kept in rental-hits-private.json
(outside the repo: complaint text names people and HOAs); the repo file keeps counts and complaint numbers only.
Run: RAW=<scratch dir> python3 -I scdca_rentals.py <datadir> <workbook dir>"""
import sys, os, re, json, glob, openpyxl, collections
out, src = sys.argv[1], sys.argv[2]; RAW = os.environ.get("RAW", out)
W = re.compile(r"\b(rent|rents|rental|rentals|renter|renters|renting|lease|leases|leasing|leased|tenant|tenants|airbnb|vrbo|short[- ]term)\b", re.I)
res = {"source": "SCDCA HOA legislative report workbooks", "by_year": {}, "hits": []}; private = []
for f in sorted(glob.glob(os.path.join(src, "scdca-legislative-*.xlsx"))):
    wb = openpyxl.load_workbook(f, read_only=True); ws = wb.worksheets[0]
    rows = list(ws.iter_rows(values_only=True)); h = [str(x or "").strip() for x in rows[0]]
    ci = h.index("HOA County"); txt = [i for i, x in enumerate(h) if re.search(r"Description|Recommend|Explanation", x)]
    year = None; c = collections.Counter()
    for r in rows[1:]:
        if not r or not r[0]: continue
        d = r[1]; year = getattr(d, "year", year)
        county = str(r[ci] or "").strip()
        text = " | ".join(str(r[i]) for i in txt if r[i])
        c["all"] += 1; c["horry" if county.lower() == "horry" else "other"] += 0
        if county.lower() == "horry": c["horry_all"] += 1
        if W.search(text):
            c["rental_all"] += 1
            if county.lower() == "horry": c["rental_horry"] += 1
            res["hits"].append({"file": os.path.basename(f), "complaint": r[0], "horry": county.lower() == "horry"})
            private.append({"file": os.path.basename(f), "complaint": r[0], "county": county, "hoa": r[2], "text": text})
    res["by_year"][os.path.basename(f)] = {"complaint_year": year, **{k: v for k, v in c.items() if k != "other"}}
    print(os.path.basename(f), res["by_year"][os.path.basename(f)])
json.dump(res, open(os.path.join(out, "scdca-rentals.json"), "w"), indent=1)
json.dump(private, open(os.path.join(RAW, "rental-hits-private.json"), "w"), indent=1)
