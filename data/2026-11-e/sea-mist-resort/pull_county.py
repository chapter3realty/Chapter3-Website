"""Sea Mist Resort (regime TIDES/DRIFTWD/OASIS HPR) in Horry County's public records, in aggregate.
1. Parcels: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query, every parcel whose
   LegalDescr starts "TIDES/DRIFTWD/OASIS HPR;" (the regime name /invest/condo-buildings/ used). Units = parcels with a building value.
   Kept: units per floor (floor = the unit number less its last two digits), door numbers per floor, the count of units at
   each county market value (the assessor's unit types), the year of each unit's last recorded sale (counts), owner mailing
   state (counts), units taxed at the 4% legal-residence ratio. Never kept: a PIN, an owner, a unit's own record.
2. Sales: the deed sales /invest/condo-buildings/ used (data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json,
   AcclaimWeb DEED (001) recorded 2025-10-01 to 2026-09-30, kept sales only), plus the later window 2025-11-01 to 2026-10-31
   (data/2026-11-n/buyers-builders/raw/deeds-co.json, Consideration > 0). Kept: count, median, quartiles, range, by floor band,
   and buyers' tax-bill state (in or out of South Carolina) for the first window.
Run: python3 -I pull_county.py <this dir> <website root>. Writes county.json."""
import json, sys, time, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
feats, off = [], 0
while True:
    q = {"where": "LegalDescr LIKE 'TIDES/DRIFTWD/OASIS HPR;%'", "outFields": "LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate,Acreage",
         "returnGeometry": "false", "resultOffset": off, "resultRecordCount": 2000, "f": "json"}
    j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120)); time.sleep(0.5)
    f = j.get("features", []); feats += f
    if not j.get("exceededTransferLimit") or not f: break
    off += len(f)
rows = [x["attributes"] for x in feats]
units = [a for a in rows if (a.get("MarketImprv") or 0) > 0]
other = [a for a in rows if (a.get("MarketImprv") or 0) <= 0]
floor = collections.Counter(); doors = collections.defaultdict(set); unparsed = 0
for a in units:
    m = re.search(r"UNIT\s*#?\s*(\d)(\d\d)(\d\d)\b", a["LegalDescr"].upper())
    if not m: unparsed += 1; continue
    tw = m[1]; floor[(tw, int(m[2]))] += 1; doors[(tw, int(m[2]))].add(int(m[3]))
vals = collections.Counter(a.get("MarketProp") for a in units)
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in units)
state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in units)
r4 = sum(1 for a in units if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
lu = collections.Counter((a.get("LandUseCode") or "")[:1] + "xx" for a in units)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "rule": __doc__,
       "parcels": len(rows), "units": len(units), "parcels_without_building_value": len(other),
       "landuse_first_digit": dict(lu), "unparsed_unit_numbers": unparsed,
       "towers": {tw: {"floors_lowest": min(f for t, f in floor if t == tw), "floors_highest": max(f for t, f in floor if t == tw), "floors": sum(1 for t, f in floor if t == tw),
                       "units": sum(v for (t, f), v in floor.items() if t == tw), "units_per_floor": sorted(set(v for (t, f), v in floor.items() if t == tw)),
                       "floor_numbers": sorted(f for t, f in floor if t == tw)} for tw in sorted(set(t for t, f in floor))},
       "other_units": [a["LegalDescr"].split(";")[1].strip() for a in units if not re.search(r"UNIT\s*#?\s*\d{5}\b", a["LegalDescr"].upper())],
       "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1]) if n >= 3],
       "county_market_value_groups_under_3": sum(n for v, n in vals.items() if n < 3),
       "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))},
       "owner_state_top": state.most_common(8), "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")),
       "taxed_as_home_4pct": r4}
# sales
def fl(legal):
    m = re.search(r"(?:UNIT|CONDO)\s*(\d)(\d\d)(\d\d)\b", legal.upper()); return (m[1], int(m[2])) if m else (None, None)
def tw(legal): return fl(legal)[0]
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    q = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": q[0], "p75": q[2], "min": xs[0], "max": xs[-1]}
s1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("TIDES/DRIFTWD/OASIS HPR;")]
w1 = {"window": "2025-10-01 to 2026-09-30", "all": summ([s["cons"] for s in s1]),
      "tower_2": summ([s["cons"] for s in s1 if tw(s["legal"]) == "2"]), "tower_5": summ([s["cons"] for s in s1 if tw(s["legal"]) == "5"]),
      "floors_4_to_9_tower5": summ([s["cons"] for s in s1 if tw(s["legal"]) == "5" and fl(s["legal"])[1] <= 9]), "floors_10_up_tower5": summ([s["cons"] for s in s1 if tw(s["legal"]) == "5" and fl(s["legal"])[1] >= 10]),
      "by_month": sorted(collections.Counter(s["date"][:7] for s in s1).items()), "units_sold_twice_or_more": sum(1 for v in collections.Counter(s["pin"] for s in s1).values() if v > 1),
      "buyer_tax_bill_in_sc": sum(1 for s in s1 if s["where"] == "SC"), "buyer_tax_bill_out_of_sc": sum(1 for s in s1 if s["where"] != "SC"),
      "buyer_states_out_of_sc": collections.Counter(s["owner_state"] for s in s1 if s["where"] != "SC").most_common(),
      "buyer_is_company": sum(1 for s in s1 if s.get("company")),
      "by_quarter": collections.Counter(s["date"][:4] + "Q" + str((int(s["date"][5:7]) - 1) // 3 + 1) for s in s1)}
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
R2 = r"\bHPR TIDES/DRIFTWOOD/OASIS\b"
s2 = [x for x in d2["deeds"] if re.search(R2, x.get("Comments") or "") and (x.get("Consideration") or 0) >= 1000]
w2 = {"window": d2["from"] + " to " + d2["to"], "all": summ([x["Consideration"] for x in s2]),
      "tower_2": summ([x["Consideration"] for x in s2 if tw(x["Comments"]) == "2"]), "tower_5": summ([x["Consideration"] for x in s2 if tw(x["Comments"]) == "5"]),
      "zero_dollar_deeds": sum(1 for x in d2["deeds"] if re.search(R2, x.get("Comments") or "") and not x.get("Consideration")),
      "commercial_unit_deeds": sum(1 for x in d2["deeds"] if re.search(R2, x.get("Comments") or "") and not re.search(r"\d{5}", x["Comments"])),
      "note": "Considerations of $1,000 or more kept (the first window keeps $10,000 or more). Deeds with no unit number counted apart"}
w2["under_10000"] = sum(1 for x in s2 if x["Consideration"] < 10000)
out["sales"] = {"hub_window": w1, "later_window": w2}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps(out, indent=1, default=str)[:6000])
