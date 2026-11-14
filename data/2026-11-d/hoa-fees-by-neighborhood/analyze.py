"""Builds the page's table and findings from hoa-by-neighborhood.json and hoa-includes.json (this folder).
Names with "@" or a curly apostrophe are left out: the site's subdivision search ignores them, so their fees cannot be measured.
South Carolina only: a community whose homes are mostly in a North Carolina zip code (28xxx) is left out of the page.
Town: the city most of its listings give; "Carolina Forest" or "Socastee" when most of its listings carry the CRM's area tag.
Fee shown: the middle half of the homes with a fee (lowest quarter to highest quarter) when 4 or more list one, else lowest to highest.
"Listings say the fee includes X" when half or more of the homes with a fee tick X. "Has a pool / clubhouse / tennis" when half
or more of all its homes tick it. Communities on leased land (campgrounds, Lakeside Crossing) are marked leased_land and kept out of the fee findings.
Writes table.json (one row per community) and findings.json (the counts the page prints).
Run: python3 -I analyze.py <this dir>."""
import json, os, sys, statistics, collections
D = sys.argv[1]
H = json.load(open(os.path.join(D, "hoa-by-neighborhood.json")))
I = json.load(open(os.path.join(D, "hoa-includes.json")))["communities"]
SIB = json.load(open(os.path.join(D, "sibling-pages.json")))  # name key -> page url, hand-made from the live site
INC = [("lawn_care_included", "lawn care"), ("hoa_includes_internet", "internet"), ("hoa_includes_cable", "cable TV"),
       ("hoa_includes_trash", "trash pickup"), ("hoa_includes_water_sewer", "water and sewer"), ("hoa_includes_insurance", "insurance")]
HAS = [("community_pool", "pool"), ("clubhouse", "clubhouse"), ("tennis", "tennis")]
# Homes on leased land: no HOA fee, a land lease instead. Ocean Lakes: its own page ("2,579 Annual Lease Sites", raw/oceanlakes-annual-lease.txt);
# Lakeside Crossing: batch 2026-10-b no-hoa ledger row 1 (verified); any name with "campground": batch 2026-10-b no-hoa method 6.
LEASED = lambda k: k in ("ocean lakes", "lakeside crossing") or "campground" in k
rows, nc, ignored = [], 0, []
for k, c in H["communities"].items():
    zips = c["zips"]; ncz = sum(v for z, v in zips.items() if str(z).startswith("28"))
    if ncz * 2 > c["homes"]: nc += 1; continue
    if k.startswith("not within") or k.startswith("not in "): continue  # MLS placeholders, not neighborhoods
    if c.get("skipped") or "@" in c["name"] or "\u2019" in c["name"]: ignored.append(c["name"]); continue  # the site's search ignores these names
    inc = I.get(k, {}); wf = inc.get("homes_with_fee") or 0; af = inc.get("among_homes_with_fee") or {}; hf = inc.get("homes_found") or 0
    town = max(c["towns"].items(), key=lambda kv: kv[1])[0]
    if hf and inc.get("area_carolina_forest", 0) * 2 > hf: town = "Carolina Forest"
    elif hf and inc.get("area_socastee", 0) * 2 > hf: town = "Socastee"
    kinds = [(c["houses"], "houses"), (c["townhomes"], "townhomes"), (c.get("manufactured", 0), "manufactured homes")]
    kind = " and ".join(n for v, n in sorted(kinds, reverse=True) if v) if sum(1 for v, _ in kinds if v) <= 2 else "mixed"
    lo, hi = (c["fee_q1"], c["fee_q3"]) if (c["with_fee"] or 0) >= 4 else (c["fee_min"], c["fee_max"])
    rows.append({"key": k, "name": c["name"], "town": town, "kind": kind, "homes": c["homes"], "houses": c["houses"], "townhomes": c["townhomes"],
                 "manufactured": c.get("manufactured", 0), "with_fee": c["with_fee"], "no_fee_or_zero": c["no_fee_or_zero"],
                 "says_no_hoa": c["listing_says_no_hoa"], "fee_low": lo, "fee_high": hi, "fee_mid": c["fee_median"], "fee_min": c["fee_min"], "fee_max": c["fee_max"],
                 "by_type": c.get("by_type"),
                 "includes": [lab for f, lab in INC if wf and af.get(f, 0) * 2 >= wf],
                 "has": [lab for f, lab in HAS if hf and inc.get(f, 0) * 2 >= hf],
                 "leased_land": LEASED(k), "price_mid": c["price_median"], "year_min": c["year_min"], "year_max": c["year_max"], "center": c["center"],
                 "page": SIB.get(k)})
rows.sort(key=lambda r: (r["town"], r["name"].lower()))
json.dump({"pulled": H["pulled"], "rule": __doc__, "rows": rows}, open(os.path.join(D, "table.json"), "w"), indent=1)
paid = [r for r in rows if r["fee_mid"] and not r["leased_land"]]
med = lambda xs: statistics.median(xs) if xs else None
def band(v):
    for top, lab in [(50, "Under $50"), (100, "$50 to $100"), (150, "$100 to $150"), (200, "$150 to $200"), (300, "$200 to $300"), (500, "$300 to $500")]:
        if v <= top: return lab
    return "Over $500"
hs = [r for r in paid if r["houses"] * 2 > r["homes"]]
F = {"pulled": H["pulled"], "communities_sc": len(rows), "left_out_nc": nc,
     "homes_in_table": sum(r["homes"] for r in rows), "homes_seen": H["homes_seen"],
     "with_a_fee": len(paid), "no_fee_on_any": sum(1 for r in rows if not r["fee_mid"] and not r["leased_land"]), "leased_land": [(r["name"], r["homes"]) for r in rows if r["leased_land"]],
     "house_communities_by_middle_fee": {b: n for b in ["Under $50", "$50 to $100", "$100 to $150", "$150 to $200", "$200 to $300", "$300 to $500", "Over $500"] for n in [sum(1 for r in hs if band(r["fee_mid"]) == b)]},
     "left_out_search_ignores_name": ignored,
     "house_middle_of_middles": med([r["fee_mid"] for r in hs]),
     "townhome_middle_of_middles": med([r["fee_mid"] for r in paid if r["townhomes"] * 2 > r["homes"]]),
     "house_lawn_vs_not": {"lawn": med([r["fee_mid"] for r in hs if "lawn care" in r["includes"]]), "n_lawn": sum(1 for r in hs if "lawn care" in r["includes"]),
                           "no_lawn": med([r["fee_mid"] for r in hs if "lawn care" not in r["includes"]]), "n_no_lawn": sum(1 for r in hs if "lawn care" not in r["includes"])},
     "house_pool_clubhouse_vs_neither": {"both": med([r["fee_mid"] for r in hs if "pool" in r["has"] and "clubhouse" in r["has"]]),
                                         "n_both": sum(1 for r in hs if "pool" in r["has"] and "clubhouse" in r["has"]),
                                         "neither": med([r["fee_mid"] for r in hs if "pool" not in r["has"] and "clubhouse" not in r["has"]]),
                                         "n_neither": sum(1 for r in hs if "pool" not in r["has"] and "clubhouse" not in r["has"])},
     "lowest_house_with_pool_and_clubhouse": sorted([(r["fee_mid"], r["name"], r["town"], r["homes"]) for r in hs if "pool" in r["has"] and "clubhouse" in r["has"]])[:10],
     "highest_house": sorted([(r["fee_mid"], r["name"], r["town"], r["homes"], r["includes"], r["has"]) for r in hs], reverse=True)[:12],
     "lowest_house": sorted([(r["fee_mid"], r["name"], r["town"], r["homes"]) for r in hs])[:12],
     "by_town": {t: {"communities": len(v), "middle_of_middles": med([r["fee_mid"] for r in v if r["fee_mid"]])}
                 for t, v in sorted(collections.defaultdict(list, {t: [r for r in rows if r["town"] == t] for t in {r["town"] for r in rows}}).items())},
     "carolina_forest": sorted([(r["fee_mid"], r["name"], r["homes"], r["has"], r["includes"]) for r in rows if r["town"] == "Carolina Forest" and r["fee_mid"]]),
     "biggest": sorted([(r["homes"], r["name"], r["town"], r["fee_low"], r["fee_high"]) for r in rows], reverse=True)[:25]}
json.dump(F, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps(F, indent=1)[:6000])
