"""Highest floor in each building, read from the unit numbers in Horry County's parcel layer.
Source: https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query, every parcel whose
LegalDescr starts with the building's regime names (regimes.json), e.g. "BRIGHTON KINGSTON PLANT; UNIT 1903 PH 1".
A unit number of 3 or 4 digits is read as floor (all but the last two digits) and door (the last two). Kept: regime,
count of numbered units, highest floor, the count of units on each floor. No PIN, owner, value or single unit's record.
Run: python3 -I unit_floors.py <data folder> <out.json> <slug> [<slug> ...]."""
import json, sys, re, time, urllib.request, urllib.parse, collections, datetime
folder, out, slugs = sys.argv[1], sys.argv[2], sys.argv[3:]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
R = json.load(open(folder + "/regimes.json"))["buildings"]
res = {"method": __doc__, "read": datetime.datetime.utcnow().isoformat() + "Z", "buildings": {}}
for slug in slugs:
    names = R[slug]
    where = "(" + " OR ".join("LegalDescr LIKE '" + n.replace("'", "''") + ";%'" for n in names) + ")"
    feats, off = [], 0
    while True:
        q = {"where": where, "outFields": "LegalDescr,MarketImprv", "returnGeometry": "false", "resultOffset": off, "resultRecordCount": 2000, "f": "json"}
        j = json.load(urllib.request.urlopen(U + "?" + urllib.parse.urlencode(q), timeout=90)); time.sleep(0.5)
        f = j.get("features", []); feats += f
        if not j.get("exceededTransferLimit") or not f: break
        off += len(f)
    per = collections.defaultdict(collections.Counter); odd = collections.Counter()
    for x in feats:
        a = x["attributes"]
        if (a.get("MarketImprv") or 0) <= 0: continue
        reg = a["LegalDescr"].split(";")[0].strip()
        m = re.search(r"UNIT\s*#?\s*([A-Z]?)-?(\d{3,4})\b", a["LegalDescr"].upper())
        if not m: odd[re.sub(r"\d", "9", a["LegalDescr"].split(";", 1)[-1].strip())[:30]] += 1; continue
        per[reg + (" " + m[1] if m[1] else "")][int(m[2]) // 100] += 1
    res["buildings"][slug] = {"regimes": names, "by_regime": {k: {"units": sum(v.values()), "top_floor": max(v), "floors_with_units": len(v),
                              "per_floor": dict(sorted(v.items()))} for k, v in per.items()}, "unparsed_patterns": dict(odd.most_common(8))}
    print(slug, {k: (sum(v.values()), max(v), len(v)) for k, v in per.items()}, dict(odd.most_common(3)), flush=True)
json.dump(res, open(out, "w"), indent=1)
