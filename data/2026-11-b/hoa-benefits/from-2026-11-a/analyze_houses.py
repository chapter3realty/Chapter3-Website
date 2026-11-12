"""Do houses with an HOA fee list for more? Asking price per square foot and lot size, houses with a fee
against houses with none, in the same ZIP code and of a similar age, from raw/houses-active.json (pull_houses.py).
Groups: "with fee" = returned by the all-houses search and not by the no-fee search (hoaMax=0); "no fee" =
returned by the no-fee search. Age: built 2000 or later (yearMin=2000 search) and built 2015 or later. Land: a fourth cut keeps
houses built 2000 or later on lots of 0.10 to 0.30 acre, to compare houses on the same size of lot.
Kept: list price $50,000 or more, 600 to 6,000 square feet. Lot acres: only pins with acres above 0.
A ZIP is compared only when each group has at least MIN homes. The county line: the 15 Horry County ZIPs
(as in ../buyers-cost-to-own/hoa-horry.json). Asking prices, not sale prices.
Distance: the same houses (built 2000 or later) by straight-line distance band to the beach, county-wide and
ZIP by band.
Run: python3 -I analyze_houses.py <this dir>. Writes price-test.json."""
import json, os, sys, statistics as st
d = sys.argv[1]; MIN = 15
raw = json.load(open(os.path.join(d, "raw", "houses-active.json")))
HORRY = ["29511", "29526", "29527", "29544", "29566", "29568", "29569", "29572", "29575", "29576", "29577", "29579", "29581", "29582", "29588"]
NAMES = {"29579": "Carolina Forest and Myrtle Beach west of the waterway", "29588": "Socastee", "29577": "Myrtle Beach (central and south)",
         "29572": "Myrtle Beach (north end)", "29575": "Surfside Beach", "29576": "Murrells Inlet and Garden City", "29582": "North Myrtle Beach",
         "29566": "Little River", "29568": "Longs", "29526": "Conway (29526)", "29527": "Conway (29527)", "29569": "Loris", "29544": "Galivants Ferry",
         "29511": "Aynor", "29581": "Nichols"}
homes = [h for h in raw["homes"] if h["in_all"] and h["price"] and h["price"] >= 50000 and h["sqft"] and 600 <= h["sqft"] <= 6000 and h["zip"] in HORRY]
def summ(g):
    if not g: return None
    ppsf = [h["price"] / h["sqft"] for h in g]; ac = [h["acres"] for h in g if h["acres"] and h["acres"] > 0]
    return {"n": len(g), "median_ppsf": round(st.median(ppsf)), "median_price": round(st.median([h["price"] for h in g]), -3),
            "median_sqft": round(st.median([h["sqft"] for h in g])), "n_acres": len(ac), "median_acres": round(st.median(ac), 2) if ac else None}
out = {"rule": __doc__, "pulled": raw["pulled"], "api_totals": raw["api_totals"], "truncated_bands": raw["truncated_bands"], "kept": len(homes), "cuts": {}}
for cut, test in (("all ages", lambda h: True), ("built 2000 or later", lambda h: h["built_2000_plus"]), ("built 2015 or later", lambda h: h["built_2015_plus"]),
                  ("built 2000 or later, lot 0.10 to 0.30 acre", lambda h: h["built_2000_plus"] and h["acres"] and 0.10 <= h["acres"] <= 0.30)):
    sel = [h for h in homes if test(h)]
    res = {"county": {"with_fee": summ([h for h in sel if not h["no_fee"]]), "no_fee": summ([h for h in sel if h["no_fee"]])}, "zips": []}
    diffs = []
    for z in HORRY:
        w = [h for h in sel if h["zip"] == z and not h["no_fee"]]; n = [h for h in sel if h["zip"] == z and h["no_fee"]]
        if len(w) >= MIN and len(n) >= MIN:
            sw, sn = summ(w), summ(n)
            pct = round(100 * (sw["median_ppsf"] - sn["median_ppsf"]) / sn["median_ppsf"], 1)
            res["zips"].append({"zip": z, "name": NAMES.get(z, z), "with_fee": sw, "no_fee": sn, "ppsf_diff_pct": pct})
            diffs.append(pct)
    res["zips_compared"] = len(diffs)
    res["zips_fee_higher"] = sum(1 for x in diffs if x > 0)
    res["median_of_zip_diffs_pct"] = round(st.median(diffs), 1) if diffs else None
    out["cuts"][cut] = res
# Same distance from the beach: houses built 2000 or later, by straight-line band to the shore (pull_houses.py),
# county-wide and then ZIP by band where both groups have MIN homes.
BANDS = ["under 1 mile", "1 to 3 miles", "3 to 10 miles", "over 10 miles"]
sel = [h for h in homes if h["built_2000_plus"] and h.get("beach_band")]
bb = {"county_by_band": [], "zip_band": []}
for b in BANDS:
    w = [h for h in sel if h["beach_band"] == b and not h["no_fee"]]; n = [h for h in sel if h["beach_band"] == b and h["no_fee"]]
    sw, sn = summ(w), summ(n)
    bb["county_by_band"].append({"band": b, "with_fee": sw, "no_fee": sn, "share_with_fee_pct": round(100 * len(w) / (len(w) + len(n)), 1) if (w or n) else None,
                                 "ppsf_diff_pct": round(100 * (sw["median_ppsf"] - sn["median_ppsf"]) / sn["median_ppsf"], 1) if sw and sn else None})
    for z in HORRY:
        wz = [h for h in w if h["zip"] == z]; nz = [h for h in n if h["zip"] == z]
        if len(wz) >= MIN and len(nz) >= MIN:
            a, c = summ(wz), summ(nz)
            bb["zip_band"].append({"zip": z, "name": NAMES.get(z, z), "band": b, "with_fee": a, "no_fee": c, "ppsf_diff_pct": round(100 * (a["median_ppsf"] - c["median_ppsf"]) / c["median_ppsf"], 1)})
bb["zip_band_compared"] = len(bb["zip_band"]); bb["zip_band_fee_higher"] = sum(1 for x in bb["zip_band"] if x["ppsf_diff_pct"] > 0)
bb["median_of_zip_band_diffs_pct"] = round(st.median([x["ppsf_diff_pct"] for x in bb["zip_band"]]), 1) if bb["zip_band"] else None
out["beach_bands_built_2000_plus"] = bb
json.dump(out, open(os.path.join(d, "price-test.json"), "w"), indent=1)
print("== by beach band, built 2000+")
for r in bb["county_by_band"]: print("  ", r["band"], "fee", r["with_fee"] and (r["with_fee"]["n"], r["with_fee"]["median_ppsf"], r["with_fee"]["median_acres"], r["with_fee"]["median_sqft"]), "| none", r["no_fee"] and (r["no_fee"]["n"], r["no_fee"]["median_ppsf"], r["no_fee"]["median_acres"], r["no_fee"]["median_sqft"]), r["ppsf_diff_pct"], r["share_with_fee_pct"])
for r in bb["zip_band"]: print("  ", r["zip"], r["band"], r["with_fee"]["n"], r["with_fee"]["median_ppsf"], "|", r["no_fee"]["n"], r["no_fee"]["median_ppsf"], r["ppsf_diff_pct"])
print("zip-band compared", bb["zip_band_compared"], "fee higher", bb["zip_band_fee_higher"], "median", bb["median_of_zip_band_diffs_pct"])
for cut, r in out["cuts"].items():
    print("==", cut, r["county"], "zips", r["zips_compared"], "fee higher in", r["zips_fee_higher"], "median diff", r["median_of_zip_diffs_pct"])
    for z in r["zips"]: print("  ", z["zip"], z["name"], "fee", z["with_fee"]["n"], z["with_fee"]["median_ppsf"], z["with_fee"]["median_acres"], "| none", z["no_fee"]["n"], z["no_fee"]["median_ppsf"], z["no_fee"]["median_acres"], "|", z["ppsf_diff_pct"])
