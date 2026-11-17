"""Condo deeds recorded 2025-11-01 to 2026-10-31 (Horry County Register of Deeds index, via data/2026-11-n/buyers-builders/raw/deeds-co.json,
DEED 001), kept when the legal text names a condo unit (U/APT/CONDO) and consideration is over $10,000. Each parcel number is looked up in
Horry County GIS layer 24 for TaxDistrict and LandUseCode; the City of Myrtle Beach tax districts are the ones the Palace and Bay View parcels carry.
Kept: counts, medians, quartiles. No PIN, no unit. Run: python3 -I pull_sales.py <this dir> <website root>. Writes sales.json."""
import json, re, sys, urllib.request, urllib.parse, statistics as st, datetime, collections, time
D, ROOT = sys.argv[1], sys.argv[2]
deeds = json.load(open(ROOT + "/data/2026-11-n/buyers-builders/raw/deeds-co.json"))["deeds"]
U = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
con = [r for r in deeds if re.search(r"U/APT/CONDO", r["Comments"] or "") and (r["Consideration"] or 0) > 10000 and r["ParcelNumber"]]
pins = sorted({r["ParcelNumber"] for r in con})
info = {}
for i in range(0, len(pins), 150):
    ch = pins[i:i+150]
    q = {"where": "PIN IN (%s)" % ",".join(ch), "outFields": "PIN,TaxDistrict,LandUseCode", "returnGeometry": "false", "f": "json"}
    for t in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(U, urllib.parse.urlencode(q).encode(), headers={"User-Agent": "Mozilla/5.0"}), timeout=120)); break
        except Exception: time.sleep(3)
    for f in d["features"]: a = f["attributes"]; info[str(int(a["PIN"]))] = (a["TaxDistrict"], a["LandUseCode"])
json.dump({"districts": collections.Counter(v[0] for v in info.values()), "n": len(con), "pins": len(pins), "looked_up": len(info)}, open(D + "/raw/sales-districts.json", "w"), default=dict)
rows = []
for r in con:
    ti = info.get(str(r["ParcelNumber"]).split(".")[0])
    legal = re.sub(r"^HPR\s+", "", re.sub(r"\s+U/APT/CONDO.*$", "", r["Comments"]))
    rows.append((ti[0] if ti else None, legal, r["Consideration"]))
json.dump(rows, open(D + "/raw/sales-rows.json", "w"))
print(collections.Counter(x[0] for x in rows).most_common(15))
