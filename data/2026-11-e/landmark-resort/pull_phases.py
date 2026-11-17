"""Landmark Resort: deed sales 2025-10-01 to 2026-09-30 split by the county's two regimes (LANDMARK HPR PH I, PH II).
Source: data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (AcclaimWeb deeds, kept sales). Counts and medians only.
Run: python3 -I pull_phases.py <this dir> <website root>. Writes phases.json."""
import json, sys, statistics as st
D, WEB = sys.argv[1], sys.argv[2]
o = json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"]
y = [s for s in o if (s.get("legal") or "").upper().startswith("LANDMARK HPR")]
out = {}
for name, f in (("phase_I", lambda l: "PH II" not in l), ("phase_II", lambda l: "PH II" in l)):
    v = sorted(s["cons"] for s in y if f(s["legal"].upper())); q = st.quantiles(v, n=4)
    out[name] = {"n": len(v), "median": st.median(v), "p25": q[0], "p75": q[2], "min": v[0], "max": v[-1]}
json.dump(out, open(D + "/phases.json", "w"), indent=1); print(out)
