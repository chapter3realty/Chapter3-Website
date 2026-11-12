"""Count Horry County parcels whose legal description names a community, and give their mailing city and a center point.
Usage: python3 -I parcels_by_name.py <outdir> . Writes parcels-by-name.json (counts and city names only; no owner names kept)."""
import json, sys, os, urllib.request, urllib.parse, collections
out = sys.argv[1]
Q = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
NAMES = {"Waterfall": "LegalDescr LIKE '%WATERFALL%'", "Surf Estates": "LegalDescr LIKE '%SURF ESTATES%'",
         "Sugarloaf": "LegalDescr LIKE '%SUGARLOAF%' OR LegalDescr LIKE '%SUGAR LOAF%'", "Atrium": "LegalDescr LIKE '%ATRIUM%'",
         "Intercoastal Village": "LegalDescr LIKE '%INTERCOASTAL VILLAGE%' OR LegalDescr LIKE '%INTRACOASTAL VILLAGE%'",
         "Coquina Harbour": "LegalDescr LIKE '%COQUINA HARBOUR%' OR LegalDescr LIKE '%COQUINA HARBOR%'"}
res = {"source": Q, "fields": "LegalDescr, PIN; geometry centroid (outSR 4326)"}
for k, w in NAMES.items():
    p = {"where": w, "outFields": "PIN,LegalDescr", "returnGeometry": "true", "outSR": "4326", "f": "json", "resultRecordCount": 2000}
    d = json.load(urllib.request.urlopen(Q + "?" + urllib.parse.urlencode(p), timeout=120))
    fs = d.get("features", []); xs = []; ys = []; leg = collections.Counter()
    for f in fs:
        g = f.get("geometry") or {}
        for ring in g.get("rings", [])[:1]:
            xs += [pt[0] for pt in ring]; ys += [pt[1] for pt in ring]
        leg[(f["attributes"].get("LegalDescr") or "")[:40]] += 1
    res[k] = {"parcels": len(fs), "center": [round(sum(ys)/len(ys), 5), round(sum(xs)/len(xs), 5)] if xs else None, "legal_top": leg.most_common(5)}
    print(k, res[k])
json.dump(res, open(os.path.join(out, "parcels-by-name.json"), "w"), indent=1)
