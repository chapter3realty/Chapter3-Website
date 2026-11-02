"""Findings from raw/parcels-55plus.json and raw/county-class-stats.json. Run: python3 -I analyze_parcels.py <datadir>
Writes parcels-findings.json: per community, homes with a building, the share taxed at 4% (legal residence), the same for
owners who bought before 2026 (a new owner's first bill can still carry the old class), and owners' mailing states (counts only)."""
import sys, json, os, collections, datetime
D = sys.argv[1]; R = json.load(open(os.path.join(D, "raw", "parcels-55plus.json")))
C = json.load(open(os.path.join(D, "raw", "county-class-stats.json")))
cut = datetime.datetime(2026, 1, 1).timestamp() * 1000
res = {}
for name, rows in R["parcels"].items():
    homes = [r for r in rows if str(r["LandUseCode"]).startswith("1") and (r["MarketImprv"] or 0) > 0 and (r["TaxableProp"] or 0) > 0]
    def cls(r): return "4%" if r["AssessedProp"] < r["TaxableProp"] * 0.05 else "6%"
    lu = collections.Counter(r["LandUseCode"] for r in homes)
    old = [r for r in homes if r["SaleDate"] and r["SaleDate"] < cut]
    st = collections.Counter((r["OwnerState"] or "").strip() or "(blank)" for r in homes)
    st_old = collections.Counter((r["OwnerState"] or "").strip() or "(blank)" for r in old)
    n4 = sum(cls(r) == "4%" for r in homes); o4 = sum(cls(r) == "4%" for r in old)
    ratios = collections.Counter(round(r["AssessedProp"] / r["TaxableProp"], 3) for r in homes)
    res[name] = {"parcels_in_set": len(rows), "homes_with_building": len(homes), "landuse": dict(lu),
                 "at_4pct": n4, "share_4pct": round(n4 / len(homes), 3),
                 "owned_before_2026": len(old), "owned_before_2026_at_4pct": o4, "share_4pct_owned_before_2026": round(o4 / len(old), 3) if old else None,
                 "owner_state_top": st.most_common(8), "owner_in_sc": st.get("SC", 0), "share_owner_mail_sc": round(st.get("SC", 0) / len(homes), 3),
                 "owner_state_top_owned_before_2026": st_old.most_common(8),
                 "ratio_values": dict(ratios.most_common(6))}
cs = {(s["set"], s["class"], s["landuse"]): s["n"] for s in C["stats"]}
for since in ["all", "owned before 2026"]:
    for lu in ["all homes", "101 house"]:
        a, b = cs[(since, "4%", lu)], cs[(since, "6%", lu)]
        res["Horry County, %s, %s" % (lu, since)] = {"at_4pct": a, "at_6pct": b, "share_4pct": round(a / (a + b), 3)}
json.dump(res, open(os.path.join(D, "parcels-findings.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
