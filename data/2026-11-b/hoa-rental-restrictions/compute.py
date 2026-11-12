"""Build findings.json (every number the page uses) and chart rows from listings.json, other-rules.json and scdca-rentals.json.
Run: python3 -I compute.py <datadir>."""
import json, sys, os
D = sys.argv[1]
L = json.load(open(os.path.join(D, "listings.json"))); O = json.load(open(os.path.join(D, "other-rules.json")))
S = json.load(open(os.path.join(D, "scdca-rentals.json")))
pct = lambda a, b: round(100 * a / b, 1) if b else None
F = {"pulled": L["pulled"], "by_type": {}}
for t, g in L["by_type"].items():
    for k in ["all", "no_hoa_fee", "with_hoa_fee"]:
        b = g[k]; n = b["listings"]
        if not n: continue
        F["by_type"][f"{t}_{k}"] = {"listings": n, "nightly": b["nightly"], "yearly_only": b["yearly_only"], "not_marked": b["not_marked"],
            "pct_nightly": pct(b["nightly"], n), "pct_yearly_only": pct(b["yearly_only"], n), "pct_not_marked": pct(b["not_marked"], n)}
NAMES = {"myrtle_beach_city": "City of Myrtle Beach", "north_myrtle_beach": "North Myrtle Beach", "surfside_beach": "Surfside Beach",
         "garden_city": "Garden City", "murrells_inlet": "Murrells Inlet", "little_river": "Little River", "carolina_forest": "Carolina Forest",
         "socastee": "Socastee", "conway": "Conway", "longs": "Longs"}
F["by_area"] = {}
for a, g in L["by_area"].items():
    c, h = g["condo"], g["house"]
    F["by_area"][a] = {"name": NAMES[a],
        "condo": {"listings": c["listings"], "nightly": c["nightly"], "pct_nightly": pct(c["nightly"], c["listings"])},
        "house_with_hoa_fee": {"listings": h["with_hoa_fee"], "nightly": h["with_hoa_fee_nightly"], "not_marked": h["with_hoa_fee_not_marked"],
                                "pct_nightly": pct(h["with_hoa_fee_nightly"], h["with_hoa_fee"]), "pct_not_marked": pct(h["with_hoa_fee_not_marked"], h["with_hoa_fee"])},
        "house_no_hoa_fee": {"listings": h["no_hoa_fee"], "nightly": h["nightly"] - h["with_hoa_fee_nightly"],
                             "pct_nightly": pct(h["nightly"] - h["with_hoa_fee_nightly"], h["no_hoa_fee"])},
        "share_houses_with_hoa_fee": pct(h["with_hoa_fee"], h["listings"])}
hg = O["groups"]["house"]
F["boat_parking"] = {"house_no_hoa_fee": {"listings": hg["no_hoa_fee"]["listings"], "rv_boat_parking": hg["no_hoa_fee"]["rv_boat_parking"],
                                          "pct": pct(hg["no_hoa_fee"]["rv_boat_parking"], hg["no_hoa_fee"]["listings"])},
                     "house_with_hoa_fee": {"listings": hg["listings"] - hg["no_hoa_fee"]["listings"], "rv_boat_parking": hg["rv_boat_parking"] - hg["no_hoa_fee"]["rv_boat_parking"],
                                            "pct": pct(hg["rv_boat_parking"] - hg["no_hoa_fee"]["rv_boat_parking"], hg["listings"] - hg["no_hoa_fee"]["listings"])}}
tot = sum(v["all"] for v in S["by_year"].values()); rent = sum(v.get("rental_all", 0) for v in S["by_year"].values())
ht = sum(v.get("horry_all", 0) for v in S["by_year"].values()); hr = sum(v.get("rental_horry", 0) for v in S["by_year"].values())
F["scdca"] = {"years": "2022-2025", "complaints_all": tot, "mention_renting_all": rent, "complaints_horry": ht, "mention_renting_horry": hr}
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
# chart 1: what listings say about renting, by kind of home (100 percent bars)
rows = []
for key, label in [("condo_all", "Condos"), ("townhouse_with_hoa_fee", "Townhouses with an HOA fee"), ("house_with_hoa_fee", "Houses with an HOA fee"), ("house_no_hoa_fee", "Houses with no HOA fee")]:
    b = F["by_type"][key]; rows.append({"group": label, "listings": b["listings"], "nightly": b["nightly"], "yearly_only": b["yearly_only"], "not_marked": b["not_marked"]})
json.dump({"title": "What homes for sale in Horry County say about renting", "segments": ["nightly", "yearly_only", "not_marked"], "rows": rows}, open(os.path.join(D, "chart-by-type.json"), "w"), indent=1)
# chart 2: nightly allowed, condos vs HOA houses, by area
rows = [{"area": v["name"], "condo_listings": v["condo"]["listings"], "condo_nightly": v["condo"]["nightly"], "condo_pct": v["condo"]["pct_nightly"],
         "hoa_house_listings": v["house_with_hoa_fee"]["listings"], "hoa_house_nightly": v["house_with_hoa_fee"]["nightly"], "hoa_house_pct": v["house_with_hoa_fee"]["pct_nightly"]}
        for v in F["by_area"].values()]
json.dump({"title": "Share of homes for sale that say nightly rentals are allowed, by area", "rows": rows}, open(os.path.join(D, "chart-by-area.json"), "w"), indent=1)
print(json.dumps(F, indent=1))
