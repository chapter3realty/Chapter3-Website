"""Findings for /submarkets/myrtle-beach/kingston-plantation/ from the county parcels in the bbox cache (raw/bbox-parcels.json, pulled from
Parcels layer 24 by envelope -78.800,33.755,-78.765,33.782), the county flood layer 19, and the deed index (SALES = deeds-co.json,
Horry County AcclaimWeb DEED 2025-11-01..2026-10-31, names already blanked). Community = parcels whose legal description starts with one
of the building names below (the MLS 'Kingston Plantation - <building>' names plus the county's own Kingston Plantation names).
Counts, medians, ranges only; no PIN, owner, address, deed book or page in the output.
Run: RAW=raw SALES=<deeds-co.json> python3 -I analyze.py ."""
import json, os, sys, collections, statistics as st, urllib.request, urllib.parse, datetime
D=sys.argv[1]; RAW=os.environ["RAW"]
O=json.load(open(os.path.join(RAW,"bbox-parcels.json")))
PRE=["ARROWHEAD CT","BRIGHTON","CANTERBURY C","CUMBERLAND TERRACE","KINGSTON LAKE","KINGSTON PLANTATION","KINGSTON COMMERCIAL","MARGATE TOWER","NORTH HAMPTON","RICHMOND PARK","SOUTH HAMPTON","ST JAMES PARK","WEST HYDE PARK","WESY HYDE PARK","WINDERMERE BY THE SEA"]
def bld(n):
    n=(n or "").split(";")[0].strip()
    for p in PRE:
        if n.startswith(p): return {"ARROWHEAD CT":"Arrowhead Court","BRIGHTON":"Brighton Towers","CANTERBURY C":"Canterbury Court","CUMBERLAND TERRACE":"Cumberland Terrace","KINGSTON LAKE":"Kingston Lakes","KINGSTON PLANTATION":"(common)","KINGSTON COMMERCIAL":"(commercial)","MARGATE TOWER":"Margate Tower","NORTH HAMPTON":"North Hampton","RICHMOND PARK":"Richmond Park","SOUTH HAMPTON":"South Hampton","ST JAMES PARK":"St James Park","WEST HYDE PARK":"West Hyde Park","WESY HYDE PARK":"West Hyde Park","WINDERMERE BY THE SEA":"Windermere By The Sea"}[p]
    return None
L=[]
for p in O:
    a=p["attributes"]; b=bld(a["LegalDescr"])
    if not b or not p.get("geometry"): continue
    r=p["geometry"]["rings"][0]; x=sum(q[0] for q in r)/len(r); y=sum(q[1] for q in r)/len(r)
    L.append({"pin":str(int(a["PIN"])) if a["PIN"] else None,"b":b,"x":x,"y":y,"mkt":a["MarketProp"] or 0,"ass":a["AssessedProp"] or 0,"tax":a["TaxableProp"] or 0,"land":a["LandUseCode"],"state":a["OwnerState"],"dist":a["TaxDistrict"],"sub":a["MarketSubArea"]})
U=[l for l in L if l["mkt"]>0 and l["b"] not in("(common)","(commercial)")]
def q(v):
    v=sorted(v)
    if not v: return {}
    return {"n":len(v),"median":st.median(v),"min":v[0],"max":v[-1],"q1":v[len(v)//4],"q3":v[3*len(v)//4]}
by=collections.defaultdict(list)
for l in U: by[l["b"]].append(l)
def ratio(l): return l["ass"]/l["tax"] if l["tax"] else None
res={"made":datetime.date.today().isoformat(),"rule":__doc__,"parcels_all":len(L),"units":len(U),
 "buildings":{b:{"units":len(v),"county_value":q([l["mkt"] for l in v])} for b,v in sorted(by.items())},
 "county_value":q([l["mkt"] for l in U]),
 "legal_residence_4pct":sum(1 for l in U if ratio(l) and abs(ratio(l)-0.04)<0.003),
 "assessed_6pct":sum(1 for l in U if ratio(l) and abs(ratio(l)-0.06)<0.003),
 "owner_mailing_out_of_state":sum(1 for l in U if l["state"] not in("SC",None)),
 "tax_districts":dict(collections.Counter(l["dist"] for l in L)),
 "center":[round(st.mean(l["y"] for l in L),5),round(st.mean(l["x"] for l in L),5)]}
# flood zone at each distinct building location
S="https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/19/query"
def zone(x,y):
    u=S+"?"+urllib.parse.urlencode({"geometry":f"{x},{y}","geometryType":"esriGeometryPoint","inSR":4326,"spatialRel":"esriSpatialRelIntersects","outFields":"FLD_ZONE,SFHA_TF,STATIC_BFE","returnGeometry":"false","f":"json"})
    d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"Mozilla/5.0"}),timeout=60))
    return [(f["attributes"]["FLD_ZONE"],f["attributes"]["SFHA_TF"]) for f in d["features"]]
pts={}
for l in U: pts.setdefault((round(l["x"],4),round(l["y"],4)),[]).append(l)
zc=collections.Counter(); zb=collections.defaultdict(collections.Counter)
for (x,y),ls in pts.items():
    z=zone(x,y); k=str(z[0]) if z else "none"
    zc[k]+=len(ls)
    for l in ls: zb[l["b"]][k]+=1
res["flood_zone_by_unit"]=dict(zc); res["flood_by_building"]={b:dict(c) for b,c in zb.items()}
# sales
deeds=json.load(open(os.environ["SALES"])); multi=collections.Counter(d["BookPage"] for d in deeds["deeds"])
byp={l["pin"]:l for l in U}; sales=[]
for d in deeds["deeds"]:
    l=byp.get(str(d["ParcelNumber"]))
    if not l or (d["Consideration"] or 0)<=10000 or multi[d["BookPage"]]>1: continue
    sales.append({"b":l["b"],"price":d["Consideration"],"month":d["RecordDate"][:7],"mkt":l["mkt"]})
res["sales_window"]=[deeds["from"],deeds["to"]]
res["sales"]={"all":q([s["price"] for s in sales]),"by_month":dict(sorted(collections.Counter(s["month"] for s in sales).items())),
  "by_building":{b:q([s["price"] for s in sales if s["b"]==b]) for b in sorted({s["b"] for s in sales})},
  "multi_parcel_deeds_dropped":sum(1 for d in deeds["deeds"] if byp.get(str(d["ParcelNumber"])) and multi[d["BookPage"]]>1)}
json.dump(res,open(os.path.join(D,"findings.json"),"w"),indent=1)
json.dump({"rule":"Building centre points rounded to 4 decimals, one per distinct location, with unit count. No PIN or owner.","points":[[k[1],k[0],len(v),v[0]["b"]] for k,v in pts.items()]},open(os.path.join(D,"map-points.json"),"w"))
print(json.dumps(res,indent=1)[:5000])
