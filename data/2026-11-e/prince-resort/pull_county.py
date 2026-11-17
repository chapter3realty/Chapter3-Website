"""Prince Resort (Prince Condominium @ Cherry Grove Pier, Horry County) in public records, in aggregate.
1. Parcels: Horry County parcel layer 24, LegalDescr LIKE 'PRINCE CONDO%'. Units = parcels with a building value.
   Phase I (3500 N Ocean Blvd) and Phase II (3601 N Ocean Blvd) by the 'PH I' / 'PH II' in the legal. Floor = unit number less its last two digits.
   Kept: units per phase and floor, market-value groups, last-sale years, owner mailing state (counts), taxed at the 4 percent ratio.
   Never kept: a PIN, an owner, a unit's own record.
2. Sales: the deed index windows already pulled for the site (2025-10-01..2026-09-30 and 2025-11-01..2026-10-31). Bulk deeds ("UNITS AND WEEKS") and zero-dollar deeds are separated.
Run: python3 -I pull_county.py <this dir> <website root>. Writes county.json."""
import json, sys, time, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'PRINCE CONDO%'", "outFields": "LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate,Acreage,TaxDistrict",
     "returnGeometry": "false", "resultRecordCount": 3000, "f": "json"}
rows = [x["attributes"] for x in json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120))["features"]]
units = [a for a in rows if (a.get("MarketImprv") or 0) > 0]
def phase(a): return "II" if "PH II" in a["LegalDescr"].upper() else "I"
def num(a):
    m = re.search(r"UN(?:IT)?\s*(\d{3,4})\b", a["LegalDescr"].upper()); return int(m[1]) if m else None
per = collections.defaultdict(collections.Counter); nonum = collections.Counter()
for a in units:
    n = num(a)
    if n is None: nonum[(phase(a), re.sub(r".*;\s*", "", a["LegalDescr"]))] += 1
    else: per[phase(a)][n // 100] += 1
vals = collections.Counter(a.get("MarketProp") for a in units)
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in units)
state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in units)
r4 = sum(1 for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
r6 = sum(1 for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "rule": __doc__, "parcels": len(rows), "units": len(units),
       "units_by_phase": dict(collections.Counter(phase(a) for a in units)),
       "units_per_floor": {p: {str(k): v for k, v in sorted(c.items())} for p, c in per.items()},
       "floors": {p: [min(c), max(c), [f for f in range(min(c), max(c) + 1) if f not in c]] for p, c in per.items()},
       "units_without_floor_number": {f"{k[0]}:{k[1]}": v for k, v in nonum.items()},
       "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1])],
       "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))},
       "owner_state_top": state.most_common(8), "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")),
       "taxed_at_4pct": r4, "taxed_at_6pct": r6, "tax_districts": dict(collections.Counter(a["TaxDistrict"] for a in rows)),
       "common_area_acres": [a["Acreage"] for a in rows if (a.get("MarketImprv") or 0) <= 0]}
def fl(t):
    m = re.search(r"(?:UN|UNIT|CONDO)\s*(\d{3,4})\b", t.upper()); return int(m[1]) // 100 if m else None
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    q = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": q[0], "p75": q[2], "min": xs[0], "max": xs[-1]}
s1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("PRINCE CONDO")]
bulk1 = [s for s in s1 if s["cons"] >= 2_000_000]; k1 = [s for s in s1 if s["cons"] < 2_000_000]
out["sales_window_1"] = {"window": "2025-10-01 to 2026-09-30", "bulk_deeds": len(bulk1), "unit_sales": summ([s["cons"] for s in k1]),
    "tower_I": summ([s["cons"] for s in k1 if "PH I " in s["legal"].upper() + " "]), "tower_II": summ([s["cons"] for s in k1 if "PH II" in s["legal"].upper()]),
    "buyer_tax_bill_in_sc": sum(1 for s in k1 if s["where"] == "SC"), "buyer_tax_bill_out_of_sc": sum(1 for s in k1 if s["where"] != "SC"),
    "buyer_is_company": sum(1 for s in k1 if s.get("company")), "market_value_at_sale_median_note": "county value of the sold units",
    "ratio_sale_to_county_value": [round(s["cons"] / s["market_prop"], 2) for s in k1 if s.get("market_prop")]}
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
p2 = [x for x in d2["deeds"] if re.search(r"PRINCE CONDOMIN", x.get("Comments") or "")]
k2 = [x for x in p2 if 1000 < (x.get("Consideration") or 0) < 2_000_000]
out["sales_window_2"] = {"window": d2["from"] + " to " + d2["to"], "unit_sales": summ([x["Consideration"] for x in k2]),
    "bulk_units_and_weeks_deeds": sum(1 for x in p2 if "WEEKS" in x["Comments"]), "zero_dollar_deeds": sum(1 for x in p2 if not x.get("Consideration"))}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps({k: v for k, v in out.items() if k != "rule"}, indent=1, default=str)[:5000])
