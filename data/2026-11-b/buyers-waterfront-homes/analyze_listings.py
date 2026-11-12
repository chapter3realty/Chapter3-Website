"""Batch 2026-11-b, /buyers/waterfront-homes/. Homes for sale on each kind of water, from the CRM's public map API
(CCMLS data counted in aggregate only: no address, firm, photo or MLS number leaves RAW).
Area: South Carolina listings in the CRM's search area (as pulled by pull_listings.py).
Kinds follow the water the listing names: ocean (houses: water_ocean), oceanfront condo (condo in an oceanfront building;
and the subset whose unit faces the ocean), Intracoastal Waterway, Intracoastal with a dock (both flags), marsh, creek,
canal, river, lake or pond (lake and pond are one flag set in the CRM).
Writes listings-findings.json. Run: RAW=<scratch> python3 -I analyze_listings.py"""
import json, os, statistics
RAW = os.environ["RAW"]; HERE = os.path.dirname(os.path.abspath(__file__))
L = json.load(open(os.path.join(RAW, "listings-water.json")))
H = L["homes"]; S = {k: set(v) for k, v in L["sets"].items()}
SC = {m for m, h in H.items() if h.get("state") == "SC"}
def summ(ms):
    ms = [m for m in ms if m in SC]
    p = sorted(H[m]["price"] for m in ms if H[m]["price"])
    psf = sorted(H[m]["price"] / float(H[m]["sqft"]) for m in ms if H[m]["price"] and H[m].get("sqft") and float(H[m]["sqft"]) > 300)
    if not p: return {"n": 0}
    q = statistics.quantiles(p, n=4) if len(p) >= 4 else [None, None, None]
    return {"n": len(p), "median_ask": statistics.median(p), "p25": q[0], "p75": q[2], "min": p[0], "max": p[-1],
            "median_per_sqft": round(statistics.median(psf)) if psf else None, "under_300k": sum(x < 300000 for x in p), "over_1m": sum(x >= 1000000 for x in p)}
hs = lambda k: S.get("house+" + k, set())
cs = lambda k: S.get("condo+" + k, set())
dock = hs("private_dock")
lakepond = hs("water_lake") | hs("water_pond")
tidal = hs("water_ocean") | hs("water_icw") | hs("water_marsh") | hs("water_creek") | hs("water_canal") | hs("water_river")
out = {"pulled": L["pulled"], "source": "https://chapter3realty.com/homes/api/map (type, waterfront=1, has=<key>, price bands)", "kinds": {
    "ocean_house": summ(hs("water_ocean")),
    "ocean_condo_building": summ(cs("oceanfront_building")),
    "ocean_condo_unit_faces_ocean": summ(cs("oceanfront_unit")),
    "icw_house": summ(hs("water_icw")),
    "icw_house_with_dock": summ(hs("water_icw") & dock),
    "icw_house_no_dock": summ(hs("water_icw") - dock),
    "marsh_house": summ(hs("water_marsh")),
    "creek_house": summ(hs("water_creek")),
    "canal_house": summ(hs("water_canal")),
    "river_house": summ(hs("water_river")),
    "lake_or_pond_house": summ(lakepond),
    "lake_or_pond_only_house": summ(lakepond - tidal - hs("water_ocean")),
    "waterfront_house": summ(hs("waterfront")),
    "tidal_or_river_house_with_dock": summ(tidal & dock),
    "tidal_or_river_house_no_dock": summ(tidal - dock),
    "deep_water_house": summ(hs("deep_water")),
    "boat_slip_house": summ(hs("boat_slip")),
}}
# The CRM's water keys also tick a view or community access (2026-11-a verifier); "on the water" here = the listing's
# waterfront flag plus the water it names.
wf = hs("waterfront")
on = lambda k: hs(k) & wf
tid = (on("water_icw") | on("water_marsh") | on("water_creek") | on("water_canal") | on("water_river")) - on("water_ocean")
out["on_the_water"] = {
    "ocean_house": summ(on("water_ocean")), "icw_house": summ(on("water_icw")), "icw_with_dock": summ(on("water_icw") & dock), "icw_no_dock": summ(on("water_icw") - dock),
    "marsh_house": summ(on("water_marsh")), "creek_house": summ(on("water_creek")), "canal_house": summ(on("water_canal")), "river_house": summ(on("water_river")),
    "lake_or_pond_house": summ((hs("water_lake") | hs("water_pond")) & wf),
    "tidal_or_river_with_dock": summ(tid & dock), "tidal_or_river_no_dock": summ(tid - dock),
    "waterfront_houses_with_dock": summ(wf & dock), "waterfront_houses": summ(wf),
    "waterfront_under_300k_on_lake_or_pond_only": sum(1 for m in wf if m in SC and H[m]["price"] and H[m]["price"] < 300000 and m in (hs("water_lake") | hs("water_pond")) and m not in tidal and m not in hs("water_ocean")),
}
out["names_vs_marked_waterfront"] = {k: {"name_it": len(hs(k) & SC), "marked_waterfront": len(hs(k) & wf & SC)} for k in
    ("water_ocean", "water_icw", "water_marsh", "water_creek", "water_canal", "water_river", "water_lake", "private_dock")}
json.dump(out, open(os.path.join(HERE, "listings-findings.json"), "w"), indent=1)
for k, v in out["kinds"].items(): print(k, v)
print("--- on the water (waterfront flag)")
for k, v in out["on_the_water"].items(): print(k, v)
