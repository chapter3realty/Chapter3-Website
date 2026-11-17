"""Splits the Palms deed sales (county.json windows) into numbered units and penthouses, by floor band. Aggregates only.
Run: python3 -I pull_sales_split.py <this dir> <website root>. Writes sales_split.json."""
import json, re, sys, statistics as st
D, W = sys.argv[1], sys.argv[2]
s1 = [(s["cons"], s["legal"].upper()) for s in json.load(open(W + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("THE PALMS; UNIT")]
d2 = json.load(open(W + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
s2 = [(x["Consideration"], x["Comments"].upper()) for x in d2["deeds"] if re.search(r"\bHPR PALMS (U/APT|PENTHOUSE)", x.get("Comments") or "") and (x.get("Consideration") or 0) > 0]
def kind(t):
    if "PH" in t or "PENTHOUSE" in t: return "penthouse"
    m = re.search(r"(?:UNIT|CONDO)\s*#?\s*(\d{3,4})\b", t)
    if not m: return "other"
    f = int(m[1]) // 100
    return "floors_1_to_10" if f <= 10 else "floors_11_up"
def summ(xs):
    xs = sorted(xs)
    return {"n": len(xs), "median": st.median(xs) if xs else None, "min": xs[0] if xs else None, "max": xs[-1] if xs else None}
out = {}
for name, s in (("hub_window_2025-10-01_to_2026-09-30", s1), ("later_window_2025-11-01_to_2026-10-31", s2)):
    out[name] = {k: summ([c for c, t in s if kind(t) == k]) for k in ("floors_1_to_10", "floors_11_up", "penthouse", "other")}
    out[name]["numbered_units_only"] = summ([c for c, t in s if kind(t) in ("floors_1_to_10", "floors_11_up")])
    out[name]["all"] = summ([c for c, t in s])
json.dump(out, open(D + "/sales_split.json", "w"), indent=1); print(json.dumps(out, indent=1))
