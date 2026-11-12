#!/usr/bin/env python3
"""Named neighborhoods in the Murrells Inlet mailing area, by county side and part: home count, kind, and 12-month sales (count, median).
Horry: the name is the first clause of the parcel legal description with lot, phase, section, unit and numbers removed, and a few
spellings joined (NAME_FIX). Georgetown: the county's Neighborhoods layer (Boundaries 3). Names only; no addresses or parcel numbers.
Run: RAW=<scratch> SALES=<out-of-state-buyers.json> python3 -I names.py <datadir>. Writes names.json."""
import sys, os, json, re, statistics, collections
RAW = os.environ["RAW"]; D = sys.argv[1]
H = json.load(open(os.path.join(RAW, "homes.json")))
NAME_FIX = {"SEASONS @PRINCE CK": "SEASONS @ PRINCE CREEK", "PINES OF ST JAMES": "THE PINES OF ST JAMES", "TWIN OAKS LT": "TWIN OAKS",
            "BROOKEFIELD LT": "BROOKEFIELD", "KINGS GRANT LT": "KINGS GRANT", "MEADOWS OF ST PATRICK LT": "MEADOWS OF ST PATRICK",
            "WYNBROOKE HPR": "WYNBROOKE", "MARCLIFFE WEST HPR": "MARCLIFFE HPR", "VILLAS @ INT'L CLUB HPR": "VILLAS @ INT'L CL HPR"}
def nm(l):
    l = (l or "").upper()
    l = re.sub(r"\bPH(ASE)?\s*\S+|\bSEC(TION)?\s*\S+|\bLOT\s*\S+|\bBLK\s*\S+|\bUNIT\s*\S+|\bBLDG\s*\S+|#\S+|\bPLT.*|\d+", "", l)
    n = re.sub(r"\s+", " ", l.split(";")[0]).strip(" ;,-")
    return NAME_FIX.get(n, n)
for h in H:
    h["name"] = nm(h["legal"]) if h["county"] == "horry" else (h.get("hood") or "")
S = json.load(open(os.environ["SALES"]))
idx = {h["id"]: h for h in H if h["county"] == "horry"}
sales = collections.defaultdict(list)
for s in S["sales"]:
    h = idx.get(int(s["pin"]))
    if h and "2025-10-01" <= s["date"].replace("/", "-") <= "2026-09-30": sales[(h["county"], h["part"], h["name"])].append(s["cons"])
for h in H:
    if h["county"] == "georgetown" and h["sale_date"] and "2025-10-01" <= h["sale_date"] <= "2026-09-30" and (h["price"] or 0) >= 10000:
        sales[(h["county"], h["part"], h["name"])].append(h["price"])
groups = collections.defaultdict(list)
for h in H:
    if h["part"] in ("garden_city", "gc_strip"): continue
    groups[(h["county"], h["part"], h["name"])].append(h)
out = []
for (c, p, n), xs in groups.items():
    if len(xs) < 40 or not n: continue
    k = collections.Counter(x["kind"] for x in xs)
    pr = sorted(sales.get((c, p, n), []))
    out.append({"county": c, "part": p, "name": n, "homes": len(xs), "kinds": dict(k), "legal_residence_pct": round(100 * sum(bool(x["lr"]) for x in xs) / len(xs), 1),
                "high_risk_flood": sum(x["fz"] in ("VE", "AE", "AO", "A") for x in xs), "sales_12m": len(pr), "median_12m": statistics.median(pr) if pr else None})
out.sort(key=lambda r: -r["homes"])
json.dump({"made": "names.py", "note": "Neighborhoods with 40 or more homes; Horry names from legal descriptions (approximate), Georgetown from the county layer.", "names": out}, open(os.path.join(D, "names.json"), "w"), indent=1)
for r in out[:45]: print(r["county"][:4], r["part"], r["name"], r["homes"], r["kinds"], r["legal_residence_pct"], r["sales_12m"], r["median_12m"])
