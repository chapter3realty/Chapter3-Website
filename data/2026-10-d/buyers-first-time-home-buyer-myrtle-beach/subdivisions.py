"""Neighborhoods where houses and townhouses sold for under $300,000 (review round 1, owner: "name some roads
some communities"). Same sales, same land use rules and same timeshare filter as build_findings.py; the
neighborhood is the first part of the deed's legal description (the 'group' field), and phases of one
neighborhood are added together by the NAMES table below. Counts only; no address, no buyer.
Usage: python3 -I subdivisions.py <this dir>  -> subdivisions.json"""
import sys, json, os, re, collections as C, statistics as st
D = sys.argv[1]
J = lambda *p: json.load(open(os.path.join(D, *p)))
SALES = J("..", "sell-out-of-state-buyers", "out-of-state-buyers.json")["sales"]
ATTR = {str(int(r["PIN"])).zfill(11): r for r in J("raw", "parcel-attrs.json")["rows"]}
TIMESHARE = re.compile(r"\bWEEK|TIMESHARE|INTERVAL", re.I)
HOUSE, CONDO, TOWN = {"100", "101", "102", "110", "126"}, {"107", "135"}, {"109"}
NAMES = {  # page name: legal description groups (all phases)
  "The Townes at Amber Bluff": r"^THE TOWNS @ AMBER BLUFF",
  "Indigo Grove": r"^INDIGO GROVE",
  "Birchwood": r"^BIRCHWOOD$",
  "Myrtle Beach Golf and Yacht Club": r"^MB GOLF & YACHT",
  "Cypress Ridge": r"^CYPRESS RIDGE",
  "Warner Crossing": r"^WARNER CROSSING",
  "Kingston Oaks": r"^KINGSTON OAKS",
  "Tupelo Park": r"^TUPELO PARK",
  "Spring Grove": r"^SPRING GROVE",
  "Victory Point": r"^VICTORY POINT",
  "The Fairways at Wild Wing": r"^FAIRWAYS @WILDWING",
  "Meadows Edge": r"^MEADOWS EDGE",
  "Andalusia": r"^ANDALUSIA",
}
out = {}
for name, pat in NAMES.items():
    rx = re.compile(pat); v = []
    for s in SALES:
        if TIMESHARE.search(s["legal"] or "") or not rx.search(s["group"] or ""): continue
        lu = (ATTR.get(s["pin"]) or {}).get("LandUseCode") or ""
        if lu == "117" or "HPR" in (s["legal"] or "") or lu in CONDO: continue
        if lu not in HOUSE | TOWN: continue
        v.append(s)
    u = [s for s in v if s["cons"] < 300000]
    out[name] = {"sold": len(v), "under_300k": len(u), "new_under_300k": sum(1 for s in u if s["builder"]),
                 "townhouse_under_300k": sum(1 for s in u if ((ATTR.get(s["pin"]) or {}).get("LandUseCode") or "") in TOWN),
                 "median_under_300k": st.median([s["cons"] for s in u]) if u else None,
                 "postal_city": C.Counter(s["postal_city"] for s in u).most_common(2), "groups": sorted(C.Counter(s["group"] for s in v))}
json.dump(out, open(os.path.join(D, "subdivisions.json"), "w"), indent=1)
for k, r in out.items(): print(k, r["under_300k"], "of", r["sold"], "new", r["new_under_300k"], "town", r["townhouse_under_300k"], r["median_under_300k"], r["postal_city"])
