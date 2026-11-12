"""Every derived number on /invest/rental-program-vs-airbnb/. Inputs:
- raw/dl/kingston-manual.txt: one Myrtle Beach resort's Owner Reference Manual (Kingston Resorts), text of the PDF a listing site posted
  (https://homesforsalelistings.net/wp-content/uploads/2021/02/kingston-manual.pdf; PDF created 2017-11-02, modified 2021-02-19).
- ../../str-market.json: AirROI trailing-twelve-month market figures, the site's one source for short-term rental numbers.
- raw/dl/airbnb-1857.html.txt, raw/dl/vrbo-fee.html.txt: the platforms' host fee pages.
- listings.json, raw/by-building.json: the CRM pull (pull_listings.py).
Run: python3 -I compute.py <this folder>. Writes findings.json."""
import json, sys, re, os
D = sys.argv[1]
man = open(os.path.join(D, "raw/dl/kingston-manual.txt")).read()
def pct(label):
    m = re.search(label + r"[^%]*?currently ([\d.]+)%", man, re.S); return float(m.group(1))
mgmt, mkt, inv = pct("MANAGEMENT FEE"), pct("MARKETING ASSESSMENT"), pct("INVENTORY REPLACEMENT FEE")
club = float(re.search(r"currently \$([\d.]+) per month", man).group(1))
ab = open(os.path.join(D, "raw/dl/airbnb-1857.html.txt")).read(); vr = open(os.path.join(D, "raw/dl/vrbo-fee.html.txt")).read()
airbnb_single = float(re.search(r"Most hosts pay ([\d.]+)%, remaining", ab).group(1))
airbnb_split = float(re.search(r"Most hosts pay a ([\d.]+)% service fee", ab).group(1))
vrbo = float(re.search(r"a ([\d.]+)% commission rate is charged on the rental amount", vr).group(1))
mk = json.load(open(os.path.join(D, "../../str-market.json")))
m = {x["slug"]: x for x in mk["markets"]}; mg = mk["management"]
prog_take = mgmt + mkt + inv
per1000 = {"program_manual": round(1000 * (1 - prog_take / 100), 2), "airbnb_single": round(1000 * (1 - airbnb_single / 100), 2),
           "vrbo": round(1000 * (1 - vrbo / 100), 2), "airbnb_split_old": round(1000 * (1 - airbnb_split / 100), 2),
           "full_service_low_take": 1000 * (1 - mg["fullServiceLow"] / 100), "full_service_high_take": 1000 * (1 - mg["fullServiceHigh"] / 100)}
# sample statement lines in the manual
stmt = {"gross": 229.95, "marketing": 5.98, "management": 80.48, "fees_total": 86.46, "owner_revenue": 143.49, "health_club": 40.85,
        "inventory": 2.30, "maintenance": 22.50, "personal": 11.00, "other_total": 76.65, "check": 66.84, "nights": 3}
for k in ["229.95", "86.46", "143.49", "76.65", "66.84", "80.48", "5.98", "40.85", "2.30", "22.50", "11.00"]: assert k in man, k
assert abs(stmt["gross"] - stmt["fees_total"] - stmt["other_total"] - stmt["check"]) < 0.01
stmt["fees_pct_of_gross"] = round(100 * stmt["fees_total"] / stmt["gross"], 1); stmt["check_pct_of_gross"] = round(100 * stmt["check"] / stmt["gross"], 1)
def year(slug):
    g = m[slug]["revenue"]
    prog = g * (1 - prog_take / 100) - 12 * club
    ab_ = g * (1 - airbnb_single / 100)
    return {"market": m[slug]["name"], "gross": g, "program_after_fees_and_club": round(prog), "airbnb_after_fee": round(ab_),
            "vrbo_after_fee": round(g * (1 - vrbo / 100)), "gap_airbnb_minus_program": round(ab_ - prog),
            "gap_pct_of_gross": round(100 * (ab_ - prog) / g, 1), "full_service_40": round(g * 0.60), "full_service_60": round(g * 0.40)}
out = {"made": "compute.py", "manual": {"management_pct": mgmt, "marketing_pct": mkt, "inventory_pct": inv, "program_take_pct": round(prog_take, 1),
       "health_club_per_month": club, "health_club_per_year": 12 * club, "statement": stmt},
       "platform": {"airbnb_single_pct": airbnb_single, "airbnb_split_pct": airbnb_split, "vrbo_pct": vrbo},
       "per_1000": per1000, "break_even_per_1000": round(per1000["airbnb_single"] - per1000["program_manual"], 2),
       "years": {s: year(s) for s in ["myrtle-beach", "north-myrtle-beach"]},
       "str_market": {"retrieved": mk["retrieved"], "dataAsOf": mk["dataAsOf"]}}
L = os.path.join(D, "listings.json")
if os.path.exists(L):
    j = json.load(open(L)); g = j["groups"]; a, p, n = g["oceanfront_building"], g["in_program"], g["not_in_program_by_subtraction"]
    def share(x, y): return round(100 * x / y, 1) if y else None
    out["crm"] = {"pulled": j["pulled"], "oceanfront_listings": a["listings"], "in_program": p["listings"], "pct_in_program": share(p["listings"], a["listings"]),
        "not_in_program": n["listings"],
        "conventional": {"program": [p["flags"]["conventional_accepted"], p["listings"], share(p["flags"]["conventional_accepted"], p["listings"])],
                         "not": [n["flags"]["conventional_accepted"], n["listings"], share(n["flags"]["conventional_accepted"], n["listings"])]},
        "cash_only": {"program": [p["flags"]["cash_only_listing"], share(p["flags"]["cash_only_listing"], p["listings"])], "not": [n["flags"]["cash_only_listing"], share(n["flags"]["cash_only_listing"], n["listings"])]},
        "fha": {"program": p["flags"]["fha_accepted"], "not": n["flags"]["fha_accepted"]},
        "furnished": {"program": share(p["flags"]["furnished"], p["listings"]), "not": share(n["flags"]["furnished"], n["listings"])},
        "median_ask": {"program": p["median_ask_5k"], "all": a["median_ask_5k"]}, "median_dues": {"program": p["median_dues_25"], "all": a["median_dues_25"]},
        "ask_at_or_under_200k": {"program": share(p["ask_at_or_under"]["200000"] if "200000" in p["ask_at_or_under"] else p["ask_at_or_under"][200000], p["listings"]),
                                  "not": share(n["ask_at_or_under"]["200000"] if "200000" in n["ask_at_or_under"] else n["ask_at_or_under"][200000], n["listings"])},
        "city": {"program": p["city"], "not": n["city"]}}
B = os.path.join(D, "raw/by-building.json")
if os.path.exists(B):
    bb = json.load(open(B))["buildings"]
    big = [b for b in bb if b["listings"] >= 8 and b["building"] != "(none given)"]
    for b in big: b["pct_program"] = round(100 * b["in_program"] / b["listings"])
    out["buildings"] = {"count_named": len([b for b in bb if b["building"] != "(none given)"]), "with_8_plus": len(big),
        "all_in_program": [b["building"] for b in big if b["in_program"] == b["listings"]],
        "none_in_program": [b["building"] for b in big if b["in_program"] == 0],
        "table": sorted(big, key=lambda b: -b["listings"])}
json.dump(out, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps({k: v for k, v in out.items() if k not in ("buildings",)}, indent=1))
