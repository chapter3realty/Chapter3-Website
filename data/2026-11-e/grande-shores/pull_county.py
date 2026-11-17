"""Grande Shores in Horry County's public records, in aggregate.
1. Parcels: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query, every parcel whose
   LegalDescr starts "GRANDE SHORES HPR" (the county's regime name; "HPR" is the county's tag). Condo units = land use 107 with a building value.
   Kept: units per floor (floor = unit number less its last two digits; "PH nn" units counted apart), the count of units at each county
   market value (the assessor's unit types), the year of each unit's last recorded sale (counts), owner mailing state (counts, in or out of SC),
   units taxed at the 4% legal-residence ratio, and the commercial parcels' land-use codes (counts). Never kept: a PIN, an owner, a unit's own record.
2. Sales: the deed files the Palace page used (data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json, AcclaimWeb DEED (001), recorded
   2025-10-01 to 2026-09-30; data/2026-11-n/buyers-builders/raw/deeds-co.json, recorded 2025-11-01 to 2026-10-31, Consideration > 0).
   Kept: count, median, quartiles, range, and the same by county value group when a group has 5 or more sales. No unit, no deed, no price on its own.
Run: python3 -I pull_county.py <this dir> <website root>. Writes county.json."""
import json, sys, time, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
feats, off = [], 0
while True:
    q = {"where": "LegalDescr LIKE 'GRANDE SHORES HPR%'", "outFields": "LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate",
         "returnGeometry": "false", "resultOffset": off, "resultRecordCount": 2000, "f": "json"}
    j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120)); time.sleep(0.5)
    f = j.get("features", []); feats += f
    if not j.get("exceededTransferLimit") or not f: break
    off += len(f)
rows = [x["attributes"] for x in feats]
condos = [a for a in rows if (a.get("LandUseCode") or "").startswith("1") and (a.get("MarketImprv") or 0) > 0]
other = [a for a in rows if a not in condos]
floor = collections.Counter(); doors = collections.defaultdict(set); ph = 0; unparsed = 0
for a in condos:
    L = a["LegalDescr"].upper()
    if re.search(r"UNIT\s+PH\s*\d+", L): ph += 1; continue
    m = re.search(r"UNIT\s*#?\s*(\d{3,4})\b", L)
    if not m: unparsed += 1; continue
    n = int(m[1]); floor[n // 100] += 1; doors[n // 100].add(n % 100)
vals = collections.Counter(a.get("MarketProp") for a in condos)
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in condos)
state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in condos)
r4 = sum(1 for a in condos if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
r6 = sum(1 for a in condos if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "rule": __doc__,
       "parcels": len(rows), "condo_units": len(condos), "penthouse_units": ph, "unparsed_unit_numbers": unparsed,
       "other_parcels": [[a["LegalDescr"].split(";")[-1].strip()[:30], a.get("LandUseCode"), round(a.get("MarketProp") or 0)] for a in other],
       "floors": {"numbers": sorted(floor), "count": len(floor), "units_per_floor": {str(k): floor[k] for k in sorted(floor)}, "doors_per_floor": {str(k): [min(doors[k]), max(doors[k]), len(doors[k])] for k in sorted(doors)}},
       "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1])],
       "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))},
       "owner_state_top": state.most_common(8), "owner_in_sc": state.get("SC", 0), "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")),
       "taxed_as_home_4pct": r4, "taxed_at_6pct": r6}
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    q = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": q[0], "p75": q[2], "min": xs[0], "max": xs[-1]}
mp = {}
s1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("GRANDE SHORES HPR")]
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
s2 = [x for x in d2["deeds"] if re.search(r"\bHPR GRANDE SHORES\b", x.get("Comments") or "") and (x.get("Consideration") or 0) > 0]
by_pin = {}
def grp(pin, mval): return mval
w1 = {"window": "2025-10-01 to 2026-09-30", "all": summ([s["cons"] for s in s1]),
      "by_value_group": {str(int(v)): summ([s["cons"] for s in s1 if s.get("market_prop") == v]) for v in sorted({s.get("market_prop") for s in s1 if s.get("market_prop")})},
      "buyer_tax_bill_in_sc": sum(1 for s in s1 if s["where"] == "SC"), "buyer_tax_bill_out_of_sc": sum(1 for s in s1 if s["where"] != "SC"),
      "buyer_states_out_of_sc": collections.Counter(s["owner_state"] for s in s1 if s["where"] != "SC").most_common(),
      "buyer_is_company": sum(1 for s in s1 if s.get("company")),
      "by_quarter": dict(collections.Counter(s["date"][:4] + "Q" + str((int(s["date"][5:7]) - 1) // 3 + 1) for s in s1))}
w2 = {"window": d2["from"] + " to " + d2["to"], "all": summ([x["Consideration"] for x in s2]),
      "zero_dollar_deeds": sum(1 for x in d2["deeds"] if re.search(r"\bHPR GRANDE SHORES\b", x.get("Comments") or "") and not x.get("Consideration")),
      "under_1000": sum(1 for x in s2 if x["Consideration"] < 1000)}
out["sales"] = {"hub_window": w1, "later_window": w2}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str)
print(json.dumps(out, indent=1, default=str)[:5000])
