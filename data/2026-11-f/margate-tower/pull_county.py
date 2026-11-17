"""Margate Tower in Horry County's public records, in aggregate. Parcels: Horry County GIS layer 24, LegalDescr LIKE 'MARGATE TOWER HPR PH I;%'.
Units = parcels with a building value. Kept: unit count, floors (unit number less last two digits), taxed-as-home count, last-sale years, owner state counts.
Sales: deed index (AcclaimWeb DEED 001) window 2025-11-01..2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json) matched by parcel number to the Margate parcels,
Consideration >= 1000; and window 2025-10-01..2026-09-30 (data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json, legal starts MARGATE TOWER HPR PH I;).
Never kept: PIN, owner, unit record. Run: python3 -I pull_county.py <this dir> <website root>. Writes county.json."""
import json, sys, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'MARGATE TOWER HPR PH I;%'", "outFields": "PIN,LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate", "returnGeometry": "false", "f": "json", "resultRecordCount": 2000}
rows = [x["attributes"] for x in json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120))["features"]]
units = [a for a in rows if (a.get("MarketImprv") or 0) > 0]
floor = collections.Counter(); unparsed = 0
for a in units:
    m = re.search(r"UNIT\s*(\d{3,4})\b", a["LegalDescr"])
    if not m: unparsed += 1; continue
    floor[int(m[1]) // 100] += 1
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in units)
state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in units)
r4 = sum(1 for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
vals = collections.Counter(a["MarketProp"] for a in units)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__, "parcels": len(rows), "units": len(units), "unparsed_unit_numbers": unparsed,
       "floors": {"top": max(floor), "count": len(floor), "missing_between": [f for f in range(min(floor), max(floor) + 1) if f not in floor], "units_numbered": sum(floor.values())},
       "county_market_value_groups": [[v, n] for v, n in vals.most_common(6)],
       "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))}, "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")),
       "owner_state_top": state.most_common(6), "taxed_as_home_4pct": r4}
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    qq = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": qq[0], "p75": qq[2], "min": xs[0], "max": xs[-1]}
pins = {str(a["PIN"]) for a in rows}
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
s2 = [x for x in d2["deeds"] if str(x.get("ParcelNumber")) in pins and (x.get("Consideration") or 0) >= 1000]
s1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("MARGATE TOWER HPR PH I;")]
def fl(t):
    m = re.search(r"(?:UNIT|CONDO)\s*(\d{3,4})\b", t.upper()); return int(m[1]) // 100 if m else None
out["sales"] = {"window_2": {"window": d2["from"] + " to " + d2["to"], "all": summ([x["Consideration"] for x in s2]),
                  "floors_1_to_14": summ([x["Consideration"] for x in s2 if (fl(x["Comments"]) or 99) <= 14]), "floors_15_up": summ([x["Consideration"] for x in s2 if (fl(x["Comments"]) or 0) >= 15]),
                  "zero_dollar_deeds_matched": sum(1 for x in d2["deeds"] if str(x.get("ParcelNumber")) in pins and not x.get("Consideration")),
                  "matched_by_name_not_pin": sum(1 for x in d2["deeds"] if "MARGATE" in (x.get("Comments") or "").upper() and str(x.get("ParcelNumber")) not in pins)},
                "window_1": {"window": "2025-10-01 to 2026-09-30", "all": summ([s["cons"] for s in s1]),
                  "floors_1_to_14": summ([s["cons"] for s in s1 if (fl(s["legal"]) or 99) <= 14]), "floors_15_up": summ([s["cons"] for s in s1 if (fl(s["legal"]) or 0) >= 15]),
                  "buyer_tax_bill_in_sc": sum(1 for s in s1 if s["where"] == "SC"), "buyer_tax_bill_out_of_sc": sum(1 for s in s1 if s["where"] != "SC")}}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str); print(json.dumps(out, indent=1, default=str))
