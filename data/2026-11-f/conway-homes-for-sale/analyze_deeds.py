"""Recorded sales in Conway (county address layer: postal city Conway) from the county deed index, Horry County Register of Deeds DEED (001),
recorded 2025-11-01 to 2026-10-31 (data/2026-11-n/buyers-builders/raw/deeds-co.json, person names already blanked).
Same filter as data/2026-11-n/buyers-builders/analyze.py: consideration over $10,000; exactly one 11-digit parcel; no tax-sale or court party;
memo without CORRECT, RE-RECORD, SEVERAL, PARCELS, TRACTS, LOTS or "n UNITS"; parcel in the county parcel layer; land use code starts with 1.
House sale = deed on a parcel with land use 101, 106 or 109 (single-family), whether or not the county has put the new building on its roll yet (about 700 deeds, nearly all with a business as seller, are new homes the roll has not caught up with). Land use 100 (vacant or mixed, 456 deeds) is left out: it cannot be told from lots.
A deed with the same book and page on more than one parcel is dropped. Seller a business = DirectName not blank (a person's name was blanked).
Conway = POSTAL_CITY Conway in postal-all.json (pull_postal.py). 29526 and 29527 are the two zip codes. Tax district 110 = City of Conway levy.
Saves counts, medians, ranges only. Usage: python3 -I analyze_deeds.py <buyers-builders dir> <this dir>"""
import json,sys,os,re,statistics as st,collections
B,D=sys.argv[1],sys.argv[2]
R=json.load(open(B+"/raw/deeds-co.json")); P=json.load(open(B+"/raw/parcels.json"))["parcels"]; PC=json.load(open(D+"/postal-all.json"))["postal_city"]
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
deeds=R["deeds"]; steps=collections.OrderedDict(); steps["all deeds"]=len(deeds)
multi=collections.Counter(d["BookPage"] for d in deeds)
k=[d for d in deeds if (d["Consideration"] or 0)>10000]; steps["over $10,000"]=len(k)
k=[d for d in k if re.fullmatch(r"\d{11}",d["ParcelNumber"] or "")]; steps["one parcel number"]=len(k)
k=[d for d in k if not TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "")]; steps["not tax sale, corrective or multi-parcel memo"]=len(k)
k=[d for d in k if multi[d["BookPage"]]==1]; steps["book and page on one deed only"]=len(k)
k=[d for d in k if d["ParcelNumber"] in P and (P[d["ParcelNumber"]]["LandUseCode"] or "").startswith("1")]; steps["parcel in county layer, residential land use"]=len(k)
k=[d for d in k if PC.get(d["ParcelNumber"],["",""])[0]=="Conway"]; steps["postal city Conway"]=len(k)
def q(v):
    v=sorted(v); n=len(v)
    if not n: return None
    return {"count":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
houses,lots=[],[]
for d in k:
    p=P[d["ParcelNumber"]]; lu=p["LandUseCode"]; impr=p["MarketImprv"] or 0
    if lu in("101","106","109"): houses.append(d)
    elif lu=="100": lots.append(d)
by=lambda L:[d["Consideration"] for d in L]
bands=[(0,200000),(200000,300000),(300000,400000),(400000,500000),(500000,10**9)]
out={"deeds_from":R["from"],"deeds_to":R["to"],"steps":steps,
 "houses":q(by(houses)),"houses_seller_business":q(by([d for d in houses if d["DirectName"]])),"houses_seller_person":q(by([d for d in houses if not d["DirectName"]])),
 "land_use_100_left_out":q(by(lots)),
 "house_price_bands":{f"{a}-{b}":sum(1 for d in houses if a<=d["Consideration"]<b) for a,b in bands},
 "houses_by_zip":{z:q(by([d for d in houses if PC[d["ParcelNumber"]][1]==z])) for z in ("29526","29527")},
 "houses_by_tax_district":dict(collections.Counter(P[d["ParcelNumber"]]["TaxDistrict"] for d in houses)),
 "houses_median_price_by_tax_district":{t:q(by([d for d in houses if P[d["ParcelNumber"]]["TaxDistrict"]==t])) for t in ("110","100")},
 "houses_by_quarter":{}}
qs=collections.defaultdict(list)
for d in houses:
    y,m=d["RecordDate"][:4],int(d["RecordDate"][5:7]); qs[f"{y}-Q{(m-1)//3+1}"].append(d["Consideration"])
out["houses_by_quarter"]={a:{"count":len(v),"median":st.median(v)} for a,v in sorted(qs.items())}
sell=collections.Counter()
for d in houses:
    n=d["DirectName"]
    if re.search(r"HORTON",n): sell["D.R. Horton (DR Horton Inc and D R Horton Inc)"]+=1
    elif n: sell["other business"]+=1
    else: sell["person"]+=1
out["houses_by_seller"]=dict(sell); out["dr_horton_share_pct"]=round(100*sell["D.R. Horton (DR Horton Inc and D R Horton Inc)"]/len(houses),1)
out["business_sellers_top"]=collections.Counter(re.sub(r"\b(INC|LLC|LP|CO|COMPANY|LTD)\b","",d["DirectName"]).strip()[:30] for d in houses if d["DirectName"]).most_common(10)
json.dump(out,open(D+"/findings-deeds.json","w"),indent=1); print(json.dumps(out,indent=1))
