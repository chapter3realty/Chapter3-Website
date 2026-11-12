import csv, math, sys, json
# Rental vacancy and vacancy duration (VACS, VACDUR) for PUMAs 02701 and 02702, housing units only (TYPEHUGQ 1).
# Fix round 1, 2026-11-03. Researched for the owner reviewer's vacancy question; NOT used on the page (REVIEW-1.md).
# Usage: python3 -I vacancy_pums.py <psam_h45.csv> > vacancy-pums-2024-5yr.json
src = sys.argv[1]
P = {"02701","02702"}
rows = []
with open(src, newline="") as f:
    for r in csv.DictReader(f):
        if r["PUMA"] in P and r["TYPEHUGQ"] == "1": rows.append(r)
def w(r, i=0): return float(r["WGTP" if i == 0 else f"WGTP{i}"])
def est(pred_num, pred_den):
    def f(i):
        num = sum(w(r,i) for r in rows if pred_num(r)); den = sum(w(r,i) for r in rows if pred_den(r))
        return num, den
    n0, d0 = f(0)
    reps = [f(i) for i in range(1,81)]
    rate = n0/d0
    se = math.sqrt(4/80*sum((n/d - rate)**2 for n,d in reps))
    sen = math.sqrt(4/80*sum((n - n0)**2 for n,d in reps))
    return {"num": round(n0), "den": round(d0), "rate_pct": round(100*rate,1), "moe90_pct": round(164.5*se,1), "num_moe90": round(1.645*sen),
            "records": sum(1 for r in rows if pred_num(r))}
out = {}
for name, b in [("house_detached", lambda r: r["BLD"]=="02"), ("apartment_or_condo_2plus", lambda r: r["BLD"] in ("04","05","06","07","08","09")), ("all", lambda r: True)]:
    renter = lambda r, b=b: b(r) and r["TEN"]=="3"
    forrent = lambda r, b=b: b(r) and r["VACS"]=="1"
    rentedno = lambda r, b=b: b(r) and r["VACS"]=="2"
    den = lambda r, b=b: renter(r) or forrent(r) or rentedno(r)
    o = {"rental_vacancy": est(forrent, den)}
    # vacancy duration among vacant for-rent units
    for lab, codes in [("lt_2m", ("1","2")), ("lt_1m", ("1",)), ("2_to_6m", ("3","4")), ("6m_plus", ("5","6","7"))]:
        o["dur_"+lab] = est(lambda r, b=b, codes=codes: forrent(r) and r["VACDUR"] in codes, forrent)
    o["dur_counts"] = {c: sum(1 for r in rows if forrent(r) and r["VACDUR"]==c) for c in "1234567"}
    o["seasonal_records"] = sum(1 for r in rows if b(r) and r["VACS"]=="5")
    out[name] = o
print(json.dumps(out, indent=1))
