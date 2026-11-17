"""One point per condo building (the middle of the county's parcels whose legal text names the regime), from Horry County GIS layer 24 (centroids by envelope query), WGS84.
Saved: building name, parcel count, mean point. No PIN, owner or unit. Run: python3 -I pull_building_points.py <dir>"""
import json,sys,urllib.request,urllib.parse,time
U="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query"
N={"Cypress Bay":"CYPRESS BAY","Baytree":"BAY TREE","Carolina Yacht Landing":"YACHT LANDING","Spinnaker Cove":"SPINNAKER COVE","Lightkeepers Village":"LIGHTKEEPERS","Mariner's Pointe":"MARINERS POINTE","Intercoastal Village":"INTERCOASTAL VILLAGE","Little River Inn Resort":"LITTLE RIVER INN","Village at the Glens":"VILLAGE AT THE GLENS"}
out={}
for k,v in N.items():
    xs=[];ys=[];off=0;n=0
    while True:
        q={"where":"UPPER(LegalDescr) LIKE '%"+v+"%' AND LandUseCode IN ('107','135','109')","outFields":"LandUseCode","returnGeometry":"true","outSR":4326,"f":"json","resultOffset":off,"resultRecordCount":1000}
        d=None
        for t in range(5):
            try: d=json.load(urllib.request.urlopen(U+"?"+urllib.parse.urlencode(q),timeout=120));break
            except Exception: time.sleep(3)
        f=(d or {}).get("features",[]); n+=len(f)
        for x in f:
            pts=[p for r in (x.get("geometry") or {}).get("rings",[]) for p in r]
            if pts: xs.append(sum(p[0] for p in pts)/len(pts)); ys.append(sum(p[1] for p in pts)/len(pts))
        if not (d or {}).get("exceededTransferLimit") or not f: break
        off+=len(f)
    out[k]={"parcels":n,"lat":round(sum(ys)/len(ys),5) if ys else None,"lng":round(sum(xs)/len(xs),5) if xs else None,"spread_lat":round(max(ys)-min(ys),4) if ys else None,"spread_lng":round(max(xs)-min(xs),4) if xs else None}
json.dump(out,open(sys.argv[1]+"/building-points.json","w"),indent=1); print(json.dumps(out))
