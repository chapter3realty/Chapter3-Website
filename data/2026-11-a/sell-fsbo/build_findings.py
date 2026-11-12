"""Builds findings.json for /sell/fsbo/ from the raw sources in raw/ and the sibling files named below.
Run: python3 -I build_findings.py <this dir>
- form: the SC Residential Property Condition Disclosure Statement (LLR, effective 6/2023, updated 6/2025), raw/sc-disclosure-06-2025.txt, questions counted from the text
- nar: NAR 2025 Profile of Home Buyers and Sellers, chapter 8 (raw/nar-2025-highlights-rir.txt), values read from Exhibits 8-1, 8-3, 8-6, 8-7, 8-8 by pattern
- worked: the deed recording fee (SC Code 12-24-10, $1.85 per $500 or part) on the county's middle resale house price ($350,000, SHV row 2)
- surnames: surname-findings.json (analyze_surnames.py)
- listings: listing-counts.json (pull_listing_counts.py), a cross-check only; the page carries buyers-buying-in-myrtle-beach row 9"""
import json, os, re, sys, math
D = sys.argv[1]
R = lambda f: open(os.path.join(D, "raw", f), encoding="utf-8").read()
form = R("sc-disclosure-06-2025.txt")
main, _, addendum = form.partition("DISCLOSURE STATEMENT ADDENDUM")
qs = sorted({int(m) for m in re.findall(r"(?m)^\s*(\d{1,2})[.\s]", main) if 1 <= int(m) <= 28})
add_qs = sorted({int(m) for m in re.findall(r"(?m)^\s*(\d{1,2})\.\s", addendum) if 1 <= int(m) <= 11})
parts = re.findall(r"(?m)^(I|II|III|IV|V|VI|VII|VIII|IX|X)\.\s+([A-Z][A-Z ,\-/()']+)", main)
coastal = {22: "erosion and erosion control (bulkhead, seawall, sandbags)", 23: "flood hazards, wetlands, flood zones, flood risk",
           24: "flood insurance on the property now", 25: "flood insurance claims during your ownership",
           26: "flood repairs not claimed on insurance during your ownership", 27: "federal flood disaster aid during your ownership",
           28: "beach nourishment assessment during your ownership"}
for q, words in coastal.items():
    assert re.search(rf"(?m)^\s*{q}[.\s]", main), q
nar = open(os.path.join(os.environ.get("PRIV", os.path.join(D, "raw")), "nar-2025-highlights-rir.txt"), encoding="utf-8").read()
def need(s):
    assert s in nar, s
    return True
need("FSBO homes sold for a median of \n$360,000") if "FSBO homes sold for a median of \n$360,000" in nar else need("$360,000")
need("$372,200"); need("$425,000"); need("RESORT/")
price = 350000
deed_fee = math.ceil(price / 500) * 1.85
sur = json.load(open(os.path.join(D, "surname-findings.json")))
lc = json.load(open(os.path.join(D, "listing-counts.json")))
out = {
  "form": {"source": "https://llr.sc.gov/re/recpdf/Property-Condition-Disclosure-Statement-06.2025.pdf", "pages": 7,
           "numbered_questions": len(qs), "addendum_questions": len(add_qs), "parts": [f"{a}. {b.strip()}" for a, b in parts],
           "answer_choices": ["Yes", "No", "No Representation"], "coastal_questions": coastal, "coastal_count": len(coastal)},
  "nar_2025": {"source": "NAR 2025 Profile of Home Buyers and Sellers, ch. 8 (transactions July 2024 to June 2025)",
               "fsbo_share_pct": 5, "agent_assisted_pct": 91, "fsbo_knew_buyer_pct": 3, "fsbo_did_not_know_pct": 2,
               "resort_area": {"fsbo_pct": 9, "agent_pct": 90}, "rural": {"fsbo_pct": 10}, "suburb": {"fsbo_pct": 3},
               "median_price": {"fsbo_seller_knew_buyer": 360000, "fsbo_seller_did_not_know_buyer": 372200, "agent_assisted_only": 425000, "first_fsbo_then_agent": 425000, "all_fsbo": 360000},
               "main_reason": {"sold_to_relative_friend_neighbor": 30, "did_not_want_to_pay_commission": 28, "buyer_contacted_seller": 14},
               "did_not_actively_market_pct": 40,
               "hardest_task": {"getting_the_price_right": 17, "preparing_or_fixing_up": 12, "selling_in_time_planned": 10, "paperwork": 7, "none": 42}},
  "worked": {"price": price, "price_source": "SHV row 2 (middle resale house, Horry County, 12 months to Sept 2026)",
             "deed_fee": round(deed_fee, 2), "one_percent": price / 100},
  "surnames": {k: sur[k] for k in ["person_to_person_resales", "same_surname", "self_deeds_left_out", "median_price", "same_surname_price_bands", "other_price_bands", "vs_neighbors_same_group_min3"]},
  "listings_crosscheck": {k: {kk: vv["total"] for kk, vv in v.items()} for k, v in lc["rows"].items()} | {"pulled": lc["pulled"]},
}
sb = out["surnames"]
sb["under_100k"] = {"same": sb["same_surname_price_bands"]["under 100k"], "same_n": sb["same_surname"],
                    "other": sb["other_price_bands"]["under 100k"], "other_n": sb["person_to_person_resales"] - sb["same_surname"]}
sb["under_100k"]["same_pct"] = round(100 * sb["under_100k"]["same"] / sb["under_100k"]["same_n"], 1)
sb["under_100k"]["other_pct"] = round(100 * sb["under_100k"]["other"] / sb["under_100k"]["other_n"], 1)
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: out[k] for k in ["form", "worked"]}, indent=1)); print(sb["under_100k"])
