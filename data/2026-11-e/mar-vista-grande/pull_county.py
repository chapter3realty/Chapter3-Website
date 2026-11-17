"""Mar Vista Grande in Horry County's public records, in aggregate.
1. Parcels: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query, every parcel whose LegalDescr
   starts "MAR VISTA GRANDE HPR;". Units = parcels with a building value. Unit numbers: "UNIT 1001" (floors 7 to 12), "UNIT CL-502" (floors 5 and 6),
   "UNIT PH 1406" (floors 14 and 15), "UNIT CU-1" (commercial). Floor = the number less its last two digits.
   Kept: units per floor group, county market-value groups (counts), last-sale year (counts), owner mailing state (counts), units taxed at 4 percent.
   Never kept: a PIN, an owner, a unit's own record.
2. Sales: deed sales from data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json (recorded 2025-10-01 to 2026-09-30) and the later window
   from data/2026-11-n/buyers-builders/raw/deeds-co.json (2025-11-01 to 2026-10-31, Consideration > 0). Count, median, quartiles, range.
Run: python3 -I pull_county.py <this dir> <website root>. Writes county.json."""
import json, sys, time, re, urllib.request, urllib.parse, collections, statistics as st, datetime
D, WEB = sys.argv[1], sys.argv[2]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
q = {"where": "LegalDescr LIKE 'MAR VISTA GRANDE HPR;%'", "outFields": "LegalDescr,LandUseCode,MarketImprv,MarketProp,AssessedProp,TaxableProp,OwnerState,SaleDate",
     "returnGeometry": "false", "resultRecordCount": 2000, "f": "json"}
rows = [x["attributes"] for x in json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120))["features"]]
units = [a for a in rows if (a.get("MarketImprv") or 0) > 0]
def parse(d):
    m = re.search(r"UNIT\s+(CL-|CU-|PH\s+)?(\d+)", d.upper()); return (m[1] or "").strip("- ").strip(), int(m[2]) if m else (None, None)
grp = collections.Counter(); doors = collections.defaultdict(set)
for a in units:
    pre, n = parse(a["LegalDescr"])
    if pre == "CU": grp[("CU", 0)] += 1; continue
    grp[(pre, n // 100)] += 1; doors[(pre, n // 100)].add(n % 100)
condos = [a for a in units if parse(a["LegalDescr"])[0] != "CU"]
vals = collections.Counter(a.get("MarketProp") for a in condos)
yr = collections.Counter(datetime.datetime.fromtimestamp(a["SaleDate"] / 1000, datetime.timezone.utc).year if a.get("SaleDate") else None for a in condos)
state = collections.Counter((a.get("OwnerState") or "").upper() or "blank" for a in condos)
r4 = sum(1 for a in condos if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
r6 = sum(1 for a in condos if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.06) < 0.002)
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "rule": __doc__, "parcels": len(rows), "units_with_building_value": len(units),
       "condos": len(condos), "commercial_units": grp[("CU", 0)], "parcels_without_building_value": len(rows) - len(units),
       "floor_groups": {(p or "plain") + str(f): {"units": n, "doors": [min(doors[(p, f)]), max(doors[(p, f)])] if doors[(p, f)] else None} for (p, f), n in sorted(grp.items(), key=lambda t: (t[0][1], t[0][0]))},
       "county_market_value_groups": [[v, n] for v, n in sorted(vals.items(), key=lambda t: -t[1]) if n >= 3], "county_market_value_groups_under_3": sum(n for v, n in vals.items() if n < 3),
       "last_sale_year": {str(k): v for k, v in sorted(yr.items(), key=lambda t: (t[0] is None, t[0]))}, "owner_state_top": state.most_common(8),
       "owner_out_of_sc": sum(v for k, v in state.items() if k not in ("SC", "blank")), "taxed_as_home_4pct": r4, "taxed_at_6pct": r6}
def summ(xs):
    xs = sorted(xs)
    if not xs: return {"n": 0}
    qq = st.quantiles(xs, n=4) if len(xs) >= 4 else [None, st.median(xs), None]
    return {"n": len(xs), "median": st.median(xs), "p25": qq[0], "p75": qq[2], "min": xs[0], "max": xs[-1]}
s1 = [s for s in json.load(open(WEB + "/data/2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))["sales"] if (s.get("legal") or "").upper().startswith("MAR VISTA GRANDE HPR;")]
d2 = json.load(open(WEB + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))
mv = [x for x in d2["deeds"] if re.search(r"HPR MAR VISTA GRAND", (x.get("Comments") or "").upper())]
s2 = [x for x in mv if (x.get("Consideration") or 0) > 0]
out["sales"] = {"hub_window": dict({"window": "2025-10-01 to 2026-09-30", "all": summ([s["cons"] for s in s1]), "under_300000": sum(1 for s in s1 if s["cons"] < 300000),
                "all_without_under_300000": summ([s["cons"] for s in s1 if s["cons"] >= 300000])}),
                "later_window": {"window": d2["from"] + " to " + d2["to"], "all": summ([x["Consideration"] for x in s2]), "under_300000": sum(1 for x in s2 if x["Consideration"] < 300000),
                "all_without_under_300000": summ([x["Consideration"] for x in s2 if x["Consideration"] >= 300000]), "zero_dollar_deeds": len(mv) - len(s2)}}
json.dump(out, open(D + "/county.json", "w"), indent=1, default=str); print(json.dumps(out, indent=1, default=str)[:3500])
