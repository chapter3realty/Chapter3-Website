"""Verifier recount (2026-11-04) for /invest/financing-multiple-rentals/ rows 24 to 27. Counts only; no names.
Reuses the researcher's own loading code (analyze_repeat.py, analyze_owners.py), then:
 - counts a person's trust (name ends in TR, TRS, TRUSTEE or TRUST, with no LLC, INC and the like) as a person, not a company;
 - leaves out resort, timeshare, campground, condo association, club, church, ministry and charity owners (NONINV);
 - re-counts active listings on the CRM map API inside Horry County only (has=county_horry).
Usage: DEEDS=<deed weeks> RAW=<scratch raw> python3 -I verify_recount.py <dir of this page's data> <out-of-state-buyers.json> <out.json>"""
import sys, os, json, re, collections, statistics, urllib.request
D, SALES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
NONINV = re.compile(r"\bASSOC|\bCLUB\b|RESORT|CAMPGROUND|CAMPING|MINISTR|INTERVAL|CHURCH|DELIVERANCE CENTER|FOUNDATION|\bREGIME\b|\bPOA\b|TIMESHARE|VACATION OWNERS")
TRU = re.compile(r"\b(TR|TRS|TRUSTEE|TRUSTEES|TRUST)\b")
BUS = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|COMPANY|CO|LP|LLP|LTD|PARTNERS|PARTNERSHIP|HOLDINGS|PROPERTIES|INVESTMENTS?|GROUP|ENTERPRISES|FUND|REIT)\b")
out = {}
# deeds
g = {}; sys.argv = ["x", D, SALES]
exec(open(os.path.join(D, "analyze_repeat.py")).read().split('out = {"source"')[0], g)
pc = [v for k, v in g["by"].items() if k and len(v) >= 2 and g["kind"](v[0]["grantee"]) in ("person", "company") and not NONINV.search(v[0]["grantee"].upper())]
isp = lambda n: g["kind"](n) == "person" or (TRU.search(n.upper()) and not BUS.search(n.upper()))
rs = [x for v in pc for x in v]; og = [x for x in rs if x["owner_is_grantee"]]
out["repeat_buyers"] = {"buyers": len(pc), "homes": len(rs), "share_pct": round(100 * len(rs) / len(g["S"]), 1),
    "people_incl_trusts": sum(1 for v in pc if isp(v[0]["grantee"])), "of_which_trusts": sum(1 for v in pc if isp(v[0]["grantee"]) and g["kind"](v[0]["grantee"]) == "company"),
    "companies": sum(1 for v in pc if not isp(v[0]["grantee"])), "exactly_two": sum(1 for v in pc if len(v) == 2),
    "median_price": statistics.median(x["cons"] for x in rs), "condo_pct": round(100 * sum(1 for x in rs if x["condo"]) / len(rs), 1),
    "still_owned_by_buyer": len(og), "still_owned_tax_bill_outside_sc_pct": round(100 * sum(1 for x in og if x["where"] in ("US", "CANADA", "OTHER")) / len(og), 1),
    "left_out_noninvestor_buyers": sum(1 for k, v in g["by"].items() if k and len(v) >= 2 and NONINV.search(v[0]["grantee"].upper()))}
# parcels
h = {}; sys.argv = ["x", D]
exec(open(os.path.join(D, "analyze_owners.py")).read().split("by = collections")[0], h)
by = collections.defaultdict(list)
for x in h["H"]: by[re.sub(r"[^A-Z0-9]", "", (x["OwnerName"] or "").upper())].append(x)
by.pop("", None)
m = [v for v in by.values() if len(v) >= 2 and h["kind"](v[0]["OwnerName"]) in ("person", "company")]
drop = [v for v in m if NONINV.search(v[0]["OwnerName"].upper())]; keep = [v for v in m if not NONINV.search(v[0]["OwnerName"].upper())]
isq = lambda n: h["kind"](n) == "person" or (TRU.search(n.upper()) and not BUS.search(n.upper()))
out["owners_6pct"] = {"owners_2plus": len(keep), "exactly_two": sum(1 for v in keep if len(v) == 2), "homes": sum(len(v) for v in keep),
    "people_incl_trusts": sum(1 for v in keep if isq(v[0]["OwnerName"])), "of_which_trusts": sum(1 for v in keep if isq(v[0]["OwnerName"]) and h["kind"](v[0]["OwnerName"]) == "company"),
    "companies": sum(1 for v in keep if not isq(v[0]["OwnerName"])), "owners_10plus": sum(1 for v in keep if len(v) >= 10),
    "left_out_resort_timeshare_assoc_owners": len(drop), "their_homes": sum(len(v) for v in drop)}
# listings, Horry County only
B = "https://chapter3realty.com/homes/api/map?"; L = {"calls": []}
for kind, beds in [("house", 3), ("condo", 2), ("townhouse", 2)]:
    r = {}
    for lab, q in [("listings", f"type={kind}&beds={beds}&has=county_horry"), ("at_or_under_195000", f"type={kind}&beds={beds}&max=195000&has=county_horry")]:
        d = json.load(urllib.request.urlopen(urllib.request.Request(B + q, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
        r[lab] = d["total"]; L["calls"].append({"url": B + q, "total": d["total"]}); L["feed_refreshed"] = d["meta"]["refreshedAt"]
    L[kind] = r
out["listings_horry"] = L
json.dump(out, open(OUT, "w"), indent=1); print(json.dumps(out, indent=1))
