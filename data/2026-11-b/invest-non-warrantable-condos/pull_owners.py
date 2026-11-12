"""Two of Fannie Mae's project tests, read from Horry County's parcel layer for the 47 oceanfront buildings in our directory.
Source: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query (one parcel per condo unit).
Units: every parcel whose legal description starts with one of the building's county regime names
(../invest-condo-buildings/regimes.json, the same match /invest/condo-buildings/ used) and that has a building value (MarketImprv > 0).
Per regime (the county's name for one condo regime, which is the project a lender reviews; spellings that differ only in
punctuation or spaces are one regime, e.g. 'PRINCE CONDO @ C.G PIER' and '@ C.G.PIER') and per building:
  - units; units taxed at the 4% legal-residence ratio (AssessedProp / TaxableProp = 0.04), the rest at 6% or exempt;
  - single-entity test: units held by the owner name that holds the most units (exact name after removing punctuation
    and extra spaces), as a share of units; whether that owner name reads as a company or an association; never the name;
  - owners whose mailing state is not SC.
Nothing kept here names an owner, a PIN, a unit or a value. Run: python3 -I pull_owners.py <this folder> [regimes file; default regimes-fixed.json]. Writes owners.json."""
import json, sys, time, re, urllib.request, urllib.parse, collections, datetime
out = sys.argv[1]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
RF = sys.argv[2] if len(sys.argv) > 2 else f"{out}/regimes-fixed.json"  # CB regimes.json with the CB verifier row 5 fixes
R = json.load(open(RF))["buildings"]
COMPANY = re.compile(r"\b(LLC|L L C|INC|CORP|CORPORATION|CO|COMPANY|LP|LLP|LTD|PARTNERSHIP|HOLDINGS|PROPERTIES|INVESTMENTS|ENTERPRISES|GROUP|BANK|TRUST CO)\b")
ASSOC = re.compile(r"\b(ASSOC|ASSN|ASSOCIATION|OWNERS|HOA|HPR|REGIME|COUNCIL OF CO.?OWNERS)\b")
def norm(n): return re.sub(r"\s+", " ", re.sub(r"[^A-Z0-9 ]", " ", (n or "").upper())).strip()
def kind(n):
    n = n.split(" C O ")[0]  # classify the owner, not the "c/o" manager
    if ASSOC.search(n): return "association"
    if COMPANY.search(n): return "company"
    return "person or trust"
res = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": U, "regimes_file": RF.replace(out + "/", ""), "buildings": {}}
for slug, names in R.items():
    if not names: continue
    where = "(" + " OR ".join("LegalDescr LIKE '" + n.replace("'", "''") + ";%'" for n in names) + ")"
    feats, off = [], 0
    while True:
        q = {"where": where, "outFields": "LegalDescr,LandUseCode,MarketImprv,AssessedProp,TaxableProp,OwnerName,OwnerState", "returnGeometry": "false", "resultOffset": off, "resultRecordCount": 2000, "f": "json"}
        j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=120)); time.sleep(0.5)
        f = j.get("features", []); feats += f
        if not j.get("exceededTransferLimit") or not f: break
        off += len(f)
    per = collections.defaultdict(list)
    for x in feats:
        a = x["attributes"]
        if (a.get("MarketImprv") or 0) <= 0: continue
        per[re.sub(r"[^A-Z0-9]", "", a["LegalDescr"].split(";")[0].upper())].append(a)  # one regime, however the county spells it
    def stats(rows):
        n = len(rows)
        if not n: return {"units": 0}
        r4 = sum(1 for a in rows if a.get("TaxableProp") and abs(a["AssessedProp"] / a["TaxableProp"] - 0.04) < 0.002)
        own = collections.Counter(norm(a.get("OwnerName")) for a in rows)
        top, topn = own.most_common(1)[0]
        multi = [c for c in own.values() if c > 1]
        oos = sum(1 for a in rows if (a.get("OwnerState") or "").upper() not in ("SC", ""))
        return {"units": n, "legal_residence_4pct": r4, "legal_residence_share": round(100 * r4 / n, 1),
                "not_legal_residence_share": round(100 * (n - r4) / n, 1),
                "top_owner_units": topn, "top_owner_share": round(100 * topn / n, 1), "top_owner_kind": kind(top),
                "owners": len(own), "owners_with_2plus_units": len(multi), "units_held_by_multi_owners": sum(multi),
                "out_of_state_owner_units": oos, "out_of_state_share": round(100 * oos / n, 1),
                "landuse_first_digit": dict(collections.Counter((a.get("LandUseCode") or "")[:1] + "xx" for a in rows))}
    allrows = [a for v in per.values() for a in v]
    res["buildings"][slug] = {"regimes": {k: stats(v) for k, v in per.items()}, "building": stats(allrows)}
    b = res["buildings"][slug]["building"]
    print(slug, b.get("units"), b.get("legal_residence_share"), b.get("top_owner_share"), b.get("top_owner_kind"), flush=True)
json.dump(res, open(f"{out}/owners.json", "w"), indent=1)
