"""What a flood policy costs in Horry County, by ZIP area and flood zone, from OpenFEMA NfipPolicies v3.
Input: PRIVATE/nfip-policies-horry-2025-26.json, the pull made for /buyers/common-mistakes/
(https://www.fema.gov/api/open/v3/NfipPolicies, filter startswith(censusGeoid,'45051'), policies effective 2025-09-01 to 2026-08-31).
policyCost = premium + reserve fund assessment + federal policy fee + HFIAA surcharge (FEMA's definition): what the owner pays.
Houses: occupancyType 1 or 11, condominiumCoverageTypeCode N or empty. Condo units: condominiumCoverageTypeCode U (a unit owner's own policy).
One-year policies only (policyTermIndicator 1). Zone groups from ratedFloodZone: A* high risk, V* coastal high hazard, X/B/C moderate or low.
Run: PRIVATE=<dir> python3 -I analyze_flood.py <datadir>. Writes flood-by-area.json."""
import json, os, sys, statistics as st, collections
D = sys.argv[1]; P = os.environ["PRIVATE"]
d = json.load(open(os.path.join(P, "nfip-policies-horry-2025-26.json")))
def grp(z):
    z = (z or "").upper()
    return "V" if z.startswith("V") else "A" if z.startswith("A") else "X" if z in ("X", "B", "C") else "other"
def s(v):
    if not v: return None
    v = sorted(v); qi = lambda p: v[min(len(v) - 1, int(p * (len(v) - 1) + 0.5))]
    return {"n": len(v), "median": st.median(v), "p25": qi(.25), "p75": qi(.75)}
rows = [r for r in d["rows"] if r.get("policyTermIndicator") == 1 and (r.get("policyCost") or 0) > 0]
H = [r for r in rows if r.get("occupancyType") in (1, 11) and r.get("condominiumCoverageTypeCode") in (None, "N")]
U = [r for r in rows if r.get("condominiumCoverageTypeCode") == "U"]
AREAS = {"29579": "Carolina Forest", "29588": "Socastee", "29577": "Myrtle Beach (central and south)", "29572": "Myrtle Beach (north end)",
         "29575": "Surfside Beach", "29576": "Murrells Inlet and Garden City", "29582": "North Myrtle Beach", "29566": "Little River",
         "29568": "Longs", "29526": "Conway (29526)", "29527": "Conway (29527)"}
out = {"source": d["source"], "filter": d["filter"], "pulled": d["pulled"], "records": d["count"], "asOfDate": d["rows"][0].get("asOfDate"),
       "rule": __doc__, "county": {}, "areas": {}}
for label, grpset in (("house", H), ("condo_unit", U)):
    for lived in (True, False, None):
        sel = [r for r in grpset if lived is None or bool(r.get("primaryResidenceIndicator")) == lived]
        key = label + ("|lived in" if lived else "|not lived in" if lived is False else "|all")
        out["county"][key] = {"all_zones": s([r["policyCost"] for r in sel]),
                              **{z: s([r["policyCost"] for r in sel if grp(r.get("ratedFloodZone")) == z]) for z in ("A", "V", "X")},
                              "share_in_A_or_V": round(sum(grp(r.get("ratedFloodZone")) in ("A", "V") for r in sel) / len(sel), 3) if sel else None}
for z, name in AREAS.items():
    h = [r for r in H if r.get("reportedZipCode") == z]
    hl = [r for r in h if r.get("primaryResidenceIndicator")]
    u = [r for r in U if r.get("reportedZipCode") == z]
    out["areas"][z] = {"name": name,
        "house_lived_in": {"all_zones": s([r["policyCost"] for r in hl]), "A": s([r["policyCost"] for r in hl if grp(r.get("ratedFloodZone")) == "A"]),
                           "X": s([r["policyCost"] for r in hl if grp(r.get("ratedFloodZone")) == "X"]),
                           "share_rated_A_or_V": round(sum(grp(r.get("ratedFloodZone")) in ("A", "V") for r in hl) / len(hl), 3) if hl else None},
        "house_not_lived_in": {"all_zones": s([r["policyCost"] for r in h if not r.get("primaryResidenceIndicator")])},
        "condo_unit": {"all_zones": s([r["policyCost"] for r in u])}}
json.dump(out, open(os.path.join(D, "flood-by-area.json"), "w"), indent=1)
for k, v in out["county"].items(): print(k, {a: (b["median"], b["n"]) if isinstance(b, dict) and b else b for a, b in v.items()})
for z, v in out["areas"].items():
    hl = v["house_lived_in"]
    print(z, v["name"], "house lived-in", hl["all_zones"] and (hl["all_zones"]["median"], hl["all_zones"]["n"]), "A", hl["A"] and (hl["A"]["median"], hl["A"]["n"]), "X", hl["X"] and (hl["X"]["median"], hl["X"]["n"]), "shareA", hl["share_rated_A_or_V"], "| not lived", v["house_not_lived_in"]["all_zones"] and v["house_not_lived_in"]["all_zones"]["median"], "| condo unit", v["condo_unit"]["all_zones"] and (v["condo_unit"]["all_zones"]["median"], v["condo_unit"]["all_zones"]["n"]))
