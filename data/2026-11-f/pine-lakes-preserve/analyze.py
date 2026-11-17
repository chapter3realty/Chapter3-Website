"""Findings for /submarkets/myrtle-beach/pine-lakes-preserve/ from the county cache (pull_county.py), FEMA (pull_fema.py) and the county deed index.
Place = county parcels whose legal description starts PINE LAKES PH or PINE LAKE PH (phases 1A, 1B, 2, 3): the MLS name "The Preserve at Pine Lakes"; the HOA parcels are owned by PRESERVE AT PINE LAKES HOA INC.
Sales = Horry County deeds recorded 2025-11-01 to 2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json; DEED 001, person names blanked): priced over $10,000, one 11-digit parcel,
no tax sale, stated price at least 70% of the county market value (lower deeds look like part-interest or non-market transfers; dropped and counted), no CORRECT/RE-RECORD/SEVERAL/PARCELS/TRACTS/LOTS/"n UNITS" memo, book and page on one deed. House = building value over $0, land use 101/106/109.
Size = largest county 'Residential' footprint (layer 27, 2023): roof outline, not living area. Golf lot = within 15 m of a land-use 389/394 parcel owned by FOUNDERS NATIONAL GOLF LLC.
Run: RAW=<scratch> SALES=<deeds-co.json> python3 -I analyze.py <this dir>"""
import json,os,sys,math,re,statistics as st,collections,datetime
from shapely.geometry import Polygon,Point
from shapely.ops import unary_union
from shapely.strtree import STRtree
D=sys.argv[1]; RAW=os.environ["RAW"]; C=json.load(open(RAW+"/county.json")); FE=json.load(open(RAW+"/fema.json"))
P,G=C["parcels"],C["geo"]; A=C["addresses"]
K=111320*math.cos(math.radians(33.735)); SQFT=K*111320*10.7639
def poly(r): return unary_union([Polygon(x).buffer(0) for x in r if len(x)>=4])
fps=[(f["attributes"]["FTR_CODE"],poly(f["geometry"]["rings"])) for f in G["footprints"]]; tree=STRtree([g for c,g in fps])
golfs=[poly(b["geometry"]["rings"]) for b in G["big"] if "FOUNDERS NATIONAL GOLF" in (b["attributes"]["OwnerName"] or "") and b["attributes"]["LandUseCode"] in("389","394")]
hoa=[poly(b["geometry"]["rings"]) for b in G["big"] if "PRESERVE AT PINE LAKES HOA" in (b["attributes"]["OwnerName"] or "")]
hoa_ac=round(sum(b["attributes"]["Acreage"] or 0 for b in G["big"] if "PRESERVE AT PINE LAKES HOA" in (b["attributes"]["OwnerName"] or "")),1)
sfha=[poly(f["geometry"]["rings"]) for f in FE["features"] if f["attributes"]["SFHA_TF"]=="T"]
cnty_sfha=[poly(f["geometry"]["rings"]) for f in G["flood"] if f["attributes"]["SFHA_TF"]=="T"]
town=poly(G["towns"][0]["geometry"]["rings"])
lots=[]
for pin,a in P.items():
    g=poly(a["rings"]); c=g.representative_point()
    hf=max((f for code,f in (fps[i] for i in tree.query(g)) if code==1800 and g.contains(f.representative_point())),key=lambda f:f.area,default=None)
    pool=sum(1 for i in tree.query(g) if fps[i][0]==1870 and g.contains(fps[i][1].representative_point()))
    lots.append({"pin":pin,"section":a["section"],"street":(A.get(pin) or [{}])[0].get("street"),"use":a["LandUseCode"],"imp":a["MarketImprv"] or 0,"value":a["MarketProp"] or 0,"lot":a["lotSqft"],
      "house":(hf.area*SQFT) if hf is not None else 0,"pool":pool>0,"ratio":round((a["AssessedProp"] or 0)/a["TaxableProp"],3) if a["TaxableProp"] else None,
      "golf":any(g.distance(x)*K<15 for x in golfs),"hoa_edge":any(g.distance(x)*K<15 for x in hoa) and a["LandUseCode"] in("101","109","106","100"),
      "sfha":any(g.intersects(x) for x in sfha),"sfha_county":any(g.intersects(x) for x in cnty_sfha),"in_city":town.contains(c),"dist":a["TaxDistrict"],"state":a["OwnerState"],"x":c.x,"y":c.y,"acres":a["Acreage"]})
def q(v):
    v=sorted(v)
    return {"n":len(v),"min":v[0],"q1":st.quantiles(v,n=4)[0],"median":st.median(v),"q3":st.quantiles(v,n=4)[2],"max":v[-1]} if len(v)>1 else {"n":len(v)}
L=[l for l in lots if l["use"] in("100","101","106","109")]       # lots and houses (not common land)
H=[l for l in L if l["imp"]>0]; V=[l for l in L if l["imp"]==0]
deeds=json.load(open(os.environ["SALES"])); R=deeds["deeds"]; multi=collections.Counter(d["BookPage"] for d in R)
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
byp={l["pin"]:l for l in L}; sales=[]; dropped_low=[]
for d in R:
    l=byp.get(d["ParcelNumber"])
    if not l or (d["Consideration"] or 0)<=10000 or multi[d["BookPage"]]>1 or TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) or MEMO.search(d["Comments"] or ""): continue
    if l["imp"]>0 and d["Consideration"]<0.7*l["value"]: dropped_low.append(d["Consideration"]); continue
    sales.append({"month":d["RecordDate"][:7],"price":d["Consideration"],"house":l["imp"]>0,"section":l["section"],"pin":l["pin"],"imp":l["imp"]})
hs=[s for s in sales if s["house"]]; ls=[s for s in sales if not s["house"]]
out={"made":datetime.date.today().isoformat(),"rule":__doc__,"county_read":C["read"],"parcels_all":len(lots),
 "land_and_houses":len(L),"houses":len(H),"vacant_lots":len(V),"sections":dict(collections.Counter(l["section"] for l in L)),
 "common_area_acres":hoa_ac,"common_area_parcels":sum(1 for l in lots if l["use"] not in("100","101","106","109")),
 "lot_sqft":q([l["lot"] for l in H]),"house_footprint_sqft":q([round(l["house"]) for l in H if l["house"]]),"footprint_n":sum(1 for l in H if l["house"]),
 "county_value":q([l["value"] for l in H]),"pools":sum(1 for l in H if l["pool"]),"golf_lots":sum(1 for l in L if l["golf"]),"common_edge_lots":sum(1 for l in L if l["hoa_edge"]),
 "sfha_fema":sum(1 for l in L if l["sfha"]),"sfha_county_layer":sum(1 for l in L if l["sfha_county"]),"fema_zones":[[f["attributes"]["FLD_ZONE"],f["attributes"]["SFHA_TF"],f["attributes"]["ZONE_SUBTY"]] for f in FE["features"]],
 "in_city":sum(1 for l in L if l["in_city"]),"tax_district":dict(collections.Counter(l["dist"] for l in L)),
 "out_of_state":sum(1 for l in H if l["state"] not in("SC",None)),"at4":sum(1 for l in H if l["ratio"] is not None and abs(l["ratio"]-.04)<.003),"at6":sum(1 for l in H if l["ratio"] is not None and abs(l["ratio"]-.06)<.003),
 "streets":dict(collections.Counter(l["street"] for l in L).most_common()),
 "sales_window":[deeds["from"],deeds["to"]],
 "sales_houses":{"count":len(hs),"prices":q([s["price"] for s in hs]) if len(hs)>1 else {},"by_month":dict(sorted(collections.Counter(s["month"] for s in hs).items())),
   "by_section":{k:q([s["price"] for s in hs if s["section"]==k]) for k in sorted({s["section"] for s in hs})},"min_sales":sorted(s["price"] for s in hs)[:3],"max_sales":sorted(s["price"] for s in hs)[-3:]},
 "dropped_low_deeds":sorted(dropped_low),"sales_lots":{"count":len(ls),"prices":q([s["price"] for s in ls]) if len(ls)>1 else {}},
 "center":[round(st.mean(l["y"] for l in L),5),round(st.mean(l["x"] for l in L),5)],"bbox":[min(l["x"] for l in L),min(l["y"] for l in L),max(l["x"] for l in L),max(l["y"] for l in L)]}
json.dump(out,open(D+"/findings.json","w"),indent=1)
json.dump({"lots":[[round(l["y"],4),round(l["x"],4),l["section"][-2:].strip(),int(l["golf"]),int(l["hoa_edge"]),int(l["pool"]),int(l["imp"]>0)] for l in L],"columns":["lat","lng","phase","golf","common_edge","pool","house"]},open(D+"/map-lots.json","w"))
print(json.dumps({k:v for k,v in out.items() if k!="rule"},indent=0)[:6000])
