"""Recorded sales in Carolina Forest (the Census-designated place outline, data/2026-11-a/invest-where-to-buy/areas.geojson; a parcel counts when its center point is inside) from the county deed index, Horry County Register of Deeds DEED (001), recorded 2025-11-01 to 2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json, person names already blanked).
Same filter as the Conway page's analyze_deeds.py: consideration over $10,000; exactly one 11-digit parcel; no tax-sale or court party; memo without CORRECT, RE-RECORD, SEVERAL, PARCELS, TRACTS, LOTS or "n UNITS"; one deed per book and page; parcel in the county parcel layer.
House = land use 101, 106 or 109. Condo = land use 107. Land use 100 (vacant or mixed) left out. Seller a business = DirectName not blank.
Saves counts, medians, ranges only. Usage: python3 -I analyze_deeds_cf.py <buyers-builders dir> <this dir> zip <postal-all.json>   or   ... cdp"""
import json,sys,re,statistics as st,collections
from shapely.geometry import shape,Point
B,D=sys.argv[1],sys.argv[2]
MODE=sys.argv[3] if len(sys.argv)>3 else "zip"   # "zip": county address layer ZIP 29579 (postal-all.json from pull_postal.py, kept out of the repo); "cdp": Census place outline
PC=json.load(open(sys.argv[4]))["postal_city"] if MODE=="zip" else None
cf=shape(json.load(open(D+"/carolina-forest-outline.geojson"))["features"][0]["geometry"])
R=json.load(open(B+"/raw/deeds-co.json")); P=json.load(open(B+"/raw/parcels.json"))["parcels"]
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
deeds=R["deeds"]; steps=collections.OrderedDict(); steps["all deeds"]=len(deeds)
multi=collections.Counter(d["BookPage"] for d in deeds)
k=[d for d in deeds if (d["Consideration"] or 0)>10000]; steps["over $10,000"]=len(k)
k=[d for d in k if re.fullmatch(r"\d{11}",d["ParcelNumber"] or "")]; steps["one parcel number"]=len(k)
k=[d for d in k if not TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "")]; steps["not tax sale, corrective or multi-parcel memo"]=len(k)
k=[d for d in k if multi[d["BookPage"]]==1]; steps["book and page on one deed only"]=len(k)
k=[d for d in k if d["ParcelNumber"] in P]; steps["parcel in county layer"]=len(k)
if MODE=="zip": k=[d for d in k if PC.get(d["ParcelNumber"],["","",""])[1]=="29579"]; steps["county address layer ZIP 29579"]=len(k); k=[d for d in k if P[d["ParcelNumber"]]["TaxDistrict"] in ("100","600","800")]; steps["tax district 100, 600 or 800 (county levy only, no city)"]=len(k)
else: k=[d for d in k if P[d["ParcelNumber"]]["lng"] and cf.contains(Point(P[d["ParcelNumber"]]["lng"],P[d["ParcelNumber"]]["lat"]))]; steps["parcel center inside the Carolina Forest outline"]=len(k)
def q(v):
    v=sorted(v); n=len(v)
    if not n: return None
    return {"count":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
lu=lambda d:P[d["ParcelNumber"]]["LandUseCode"]
houses=[d for d in k if lu(d) in("101","106","109")]; condos=[d for d in k if lu(d)=="107"]
by=lambda L:[d["Consideration"] for d in L]
bands=[(0,300000),(300000,400000),(400000,500000),(500000,600000),(600000,10**9)]
out={"deeds_from":R["from"],"deeds_to":R["to"],"steps":steps,"land_use_counts":dict(collections.Counter(lu(d) for d in k)),
 "houses":q(by(houses)),"houses_seller_business":q(by([d for d in houses if d["DirectName"]])),"houses_seller_person":q(by([d for d in houses if not d["DirectName"]])),
 "condos":q(by(condos)),"condos_seller_business":q(by([d for d in condos if d["DirectName"]])),
 "house_price_bands":{f"{a}-{b}":sum(1 for d in houses if a<=d["Consideration"]<b) for a,b in bands},
 "houses_by_tax_district":dict(collections.Counter(P[d["ParcelNumber"]]["TaxDistrict"] for d in houses))}
qs=collections.defaultdict(list)
for d in houses:
    y,m=d["RecordDate"][:4],int(d["RecordDate"][5:7]); qs[f"{y}-Q{(m-1)//3+1}"].append(d["Consideration"])
out["houses_by_quarter"]={a:{"count":len(v),"median":st.median(v)} for a,v in sorted(qs.items())}
sell=collections.Counter()
for d in houses:
    n=d["DirectName"]
    if re.search(r"HORTON",n): sell["D.R. Horton"]+=1
    elif n: sell["other business"]+=1
    else: sell["person"]+=1
out["houses_by_seller"]=dict(sell); out["dr_horton_share_pct"]=round(100*sell["D.R. Horton"]/len(houses),1)
out["business_sellers_top"]=collections.Counter(re.sub(r"\b(INC|LLC|LP|CO|COMPANY|LTD)\b","",d["DirectName"]).strip()[:30] for d in houses if d["DirectName"]).most_common(10)
# size of the middle half in price per acre not used
out["mode"]=MODE; json.dump(out,open(D+"/findings-deeds-"+MODE+".json","w"),indent=1); print(json.dumps(out,indent=1))
