"""Caravelle Resort and Caravelle Tower (6900 and 7000 N Ocean Blvd, Myrtle Beach) in Horry County's public records, in aggregate.
1. Parcels: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query, LegalDescr LIKE 'CARAVELLE%'.
   Two regimes: 'CARAVELLE RESORT HPR; UNIT n' and 'CARAVELLE TOWER HPR; UNIT n'. Units = parcels with a building value.
   Floor = unit number less its last two digits. Kept: counts per regime and floor, door numbers, market-value groups, last-sale years,
   owner mailing state (counts), taxed at the 4 percent ratio. Never kept: a PIN, an owner, a unit's own record.
2. Sales: deed index windows already pulled for the site (2025-10-01..2026-09-30 and 2025-11-01..2026-10-31). Zero-dollar and under-$1,000 deeds are counted apart.
Run: python3 -I pull_county.py <this dir> <website root>. Writes county.json."""
import json, sys, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'CARAVELLE%'", "outFields": "LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate,Acreage,TaxDistrict",
     "returnGeometry": "false", "resultRecordCount": 3000, "f": "json"}
rows = [x["attributes"] for x in json.load(urllib.request.urlopen(urllib.request.Request(U + "?" + urllib.parse.urlencode(q), headers={"User-Agent": "Mozilla/5.0"}), timeout=120))["features"]]
def reg(a): return "tower" if a["LegalDescr"].upper().startswith("CARAVELLE TOWER") else "resort"
def num(a):
    m = re.search(r"UNIT\s*#?\s*(\d{3,4})\b", a["LegalDescr"].upper()); return int(m[1]) if m else None
rows_all = rows
rows = [a for a in rows_all if re.match(r"CARAVELLE (RESORT|TOWER)\b", a["LegalDescr"].upper())]  # drops the stray "CARAVELLE PROPERTIES" parcel
units = [a for a in rows if (a.get("MarketImprv") or 0) > 0]
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "rule": __doc__, "parcels": len(rows), "stray_parcels_left_out": len(rows_all) - len(rows), "units": len(units),
       "parcels_without_building_value": [re.sub(r"UNIT.*", "", a["LegalDescr"]) + (a["LegalDescr"].split(";")[-1].strip()) for a in rows if (a.get("MarketImprv") or 0) <= 0],
       "landuse": dict(collections.Counter((a.get("LandUseCode") or "")[:1] + "xx" for a in units)), "by_regime": {}}
for r in ("resort", "tower"):
    us = [a for a in units if reg(a) == r]; per = collections.Counter(); nonum = 0
    for a in us:
        n = num(a)
        if n is None: nonum += 1
        else: per[n // 100] += 1
    vals = collections.Counter(a.get("MarketProp") for a in us)
    yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in us)
    stt = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in us)
    r4 = sum(1 for a in us if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
    r6 = sum(1 for a in us if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002)
    out["by_regime"][r] = {"units": len(us), "units_without_floor_number": nonum, "floors": {"lowest": min(per), "top": max(per), "missing_between": [f for f in range(min(per), max(per) + 1) if f not in per],
        "units_per_floor": {str(k): per[k] for k in sorted(per)}},
        "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1])],
        "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))},
        "owner_state_top": stt.most_common(8), "owner_out_of_sc": sum(v for k, v in stt.items() if k not in ("SC", "blank")), "owner_in_sc": stt.get("SC", 0),
        "taxed_at_4pct": r4, "taxed_at_6pct": r6, "tax_districts": dict(collections.Counter(a["TaxDistrict"] for a in us))}
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    qq = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": qq[0], "p75": qq[2], "min": xs[0], "max": xs[-1]}
def fl(t):
    m = re.search(r"(?:UNIT|CONDO|APT)\s*#?\s*(\d{3,4})\b", t.upper()); return int(m[1]) // 100 if m else None
s1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("CARAVELLE")]
out["sales_window_1"] = {"window": "2025-10-01 to 2026-09-30", "all": summ([s["cons"] for s in s1 if s["cons"] >= 1000]),
    "resort": summ([s["cons"] for s in s1 if s["legal"].upper().startswith("CARAVELLE RESORT") and s["cons"] >= 1000]),
    "tower": summ([s["cons"] for s in s1 if s["legal"].upper().startswith("CARAVELLE TOWER") and s["cons"] >= 1000]),
    "resort_floors_1_to_7": summ([s["cons"] for s in s1 if s["legal"].upper().startswith("CARAVELLE RESORT") and s["cons"] >= 1000 and (fl(s["legal"]) or 0) <= 7]),
    "resort_floors_8_up": summ([s["cons"] for s in s1 if s["legal"].upper().startswith("CARAVELLE RESORT") and s["cons"] >= 1000 and (fl(s["legal"]) or 0) >= 8]),
    "under_1000": sum(1 for s in s1 if s["cons"] < 1000),
    "buyer_tax_bill_in_sc": sum(1 for s in s1 if s["cons"] >= 1000 and s["where"] == "SC"), "buyer_tax_bill_out_of_sc": sum(1 for s in s1 if s["cons"] >= 1000 and s["where"] != "SC"),
    "buyer_states_out_of_sc": collections.Counter(s["owner_state"] for s in s1 if s["cons"] >= 1000 and s["where"] != "SC").most_common(),
    "buyer_is_company": sum(1 for s in s1 if s["cons"] >= 1000 and s.get("company")),
    "by_quarter": collections.Counter(s["date"][:4] + "Q" + str((int(s["date"][5:7]) - 1) // 3 + 1) for s in s1 if s["cons"] >= 1000)}
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
p2 = [x for x in d2["deeds"] if re.search(r"\bHPR CARAVELLE (RESORT|TOWER)\b", x.get("Comments") or "")]
k2 = [x for x in p2 if (x.get("Consideration") or 0) >= 1000]
out["sales_window_2"] = {"window": d2["from"] + " to " + d2["to"], "all": summ([x["Consideration"] for x in k2]),
    "resort": summ([x["Consideration"] for x in k2 if "CARAVELLE RESORT" in x["Comments"]]), "tower": summ([x["Consideration"] for x in k2 if "CARAVELLE TOWER" in x["Comments"]]),
    "resort_floors_1_to_7": summ([x["Consideration"] for x in k2 if "CARAVELLE RESORT" in x["Comments"] and (fl(x["Comments"]) or 0) <= 7]),
    "resort_floors_8_up": summ([x["Consideration"] for x in k2 if "CARAVELLE RESORT" in x["Comments"] and (fl(x["Comments"]) or 0) >= 8]),
    "zero_dollar_deeds": sum(1 for x in p2 if not x.get("Consideration")), "under_1000_not_zero": sum(1 for x in p2 if 0 < (x.get("Consideration") or 0) < 1000)}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps({k: v for k, v in out.items() if k != "rule"}, indent=1, default=str)[:7000])
