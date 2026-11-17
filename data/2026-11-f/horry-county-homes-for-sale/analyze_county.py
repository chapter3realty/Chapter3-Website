"""Recorded sales in Horry County, county-wide and by postal city, from the county deed index (Horry County Register of Deeds, DEED 001, recorded 2025-11-01 to 2026-10-31; data/2026-11-n/buyers-builders/raw/deeds-co.json, person names already blanked).
Same filter as ../conway-homes-for-sale/analyze_deeds.py: consideration over $10,000; exactly one 11-digit parcel; no tax-sale or court party; memo without CORRECT, RE-RECORD, SEVERAL, PARCELS, TRACTS, LOTS or "n UNITS"; book and page on one deed only; parcel in the county layer with land use starting 1.
House sale = land use 101, 106 or 109. Condo sale = memo names a unit (U/APT/CONDO), one parcel, over $10,000, same exclusions (the parcel need not be in the layer). Postal city from postal-all.json (county address layer 42).
Saves counts, medians, quartiles only. Usage: python3 -I analyze_county.py <buyers-builders dir> <this dir>"""
import json,sys,re,statistics as st,collections
B,D=sys.argv[1],sys.argv[2]
R=json.load(open(B+"/raw/deeds-co.json")); P=json.load(open(B+"/raw/parcels.json"))["parcels"]; PC=json.load(open(D+"/postal-all.json"))["postal_city"]
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
deeds=R["deeds"]; multi=collections.Counter(d["BookPage"] for d in deeds)
k=[d for d in deeds if (d["Consideration"] or 0)>10000 and re.fullmatch(r"\d{11}",d["ParcelNumber"] or "") and not TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "") and multi[d["BookPage"]]==1]
condos=[d for d in k if re.search(r"U/APT/CONDO",d["Comments"] or "")]
res=[d for d in k if d["ParcelNumber"] in P and (P[d["ParcelNumber"]]["LandUseCode"] or "").startswith("1")]
houses=[d for d in res if P[d["ParcelNumber"]]["LandUseCode"] in("101","106","109")]
def q(v):
    v=sorted(v); n=len(v)
    if not n: return None
    return {"count":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
by=lambda L:[d["Consideration"] for d in L]
city=lambda d:PC.get(d["ParcelNumber"],["",""])[0]
bands=[(0,200000),(200000,300000),(300000,400000),(400000,500000),(500000,10**9)]
out={"deeds_from":R["from"],"deeds_to":R["to"],"houses":q(by(houses)),"condos_all_county":q(by(condos)),
 "house_price_bands":{f"{a}-{b}":sum(1 for d in houses if a<=d["Consideration"]<b) for a,b in bands},
 "houses_by_postal_city":{c:q(by([d for d in houses if city(d)==c])) for c in sorted({city(d) for d in houses})},
 "houses_by_zip":{z:q(by([d for d in houses if PC.get(d["ParcelNumber"],["",""])[1]==z])) for z in ("29579","29576","29575","29566","29568","29569","29511","29526","29527","29572","29577","29582","29588")},
 "houses_no_postal_city":sum(1 for d in houses if not city(d))}
sell=collections.Counter()
for d in houses:
    n=d["DirectName"]
    sell["D.R. Horton" if re.search(r"HORTON",n) else ("other business" if n else "person")]+=1
out["houses_by_seller"]=dict(sell)
out["houses_seller_business"]=q(by([d for d in houses if d["DirectName"]])); out["houses_seller_person"]=q(by([d for d in houses if not d["DirectName"]]))
out["house_tax_district"]=dict(collections.Counter(P[d["ParcelNumber"]]["TaxDistrict"] for d in houses).most_common(12))
qs=collections.defaultdict(list)
for d in houses: qs[f'{d["RecordDate"][:4]}-Q{(int(d["RecordDate"][5:7])-1)//3+1}'].append(d["Consideration"])
out["houses_by_quarter"]={a:{"count":len(v),"median":st.median(v)} for a,v in sorted(qs.items())}
json.dump(out,open(D+"/findings-deeds.json","w"),indent=1); print(json.dumps(out,indent=1))
