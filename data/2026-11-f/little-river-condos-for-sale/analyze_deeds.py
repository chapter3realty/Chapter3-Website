"""Recorded condo sales in the Little River buildings that have homes for sale now, from the county deed index (Horry County Register of Deeds DEED 001,
recorded 2025-11-01 to 2026-10-31; data/2026-11-n/buyers-builders/raw/deeds-co.json, person names already blanked).
Filter as in ../little-river-homes-for-sale/analyze_deeds.py: consideration over $10,000; exactly one 11-digit parcel; no tax-sale or court party; memo without CORRECT, RE-RECORD,
SEVERAL, PARCELS, TRACTS, LOTS or "n UNITS"; book and page on one deed; parcel in the county parcel layer. A condo sale = memo names a unit (U/APT/CONDO).
A building is matched by the regime name in the memo (BUILD below); the postal city of the parcel (county layer 42, postal-all.json) is checked where the parcel has one.
Saves counts, middles and quartiles only. Usage: python3 -I analyze_deeds.py <buyers-builders dir> <this dir> <postal-all.json>"""
import json,sys,re,statistics as st,collections
B,D,PCF=sys.argv[1:4]
R=json.load(open(B+"/raw/deeds-co.json")); P=json.load(open(B+"/raw/parcels.json"))["parcels"]; PC=json.load(open(PCF))["postal_city"]
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
deeds=R["deeds"]; multi=collections.Counter(d["BookPage"] for d in deeds)
k=[d for d in deeds if (d["Consideration"] or 0)>10000 and re.fullmatch(r"\d{11}",d["ParcelNumber"] or "") and "U/APT/CONDO" in (d["Comments"] or "")
   and not TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "") and multi[d["BookPage"]]==1 and d["ParcelNumber"] in P]
BUILD=collections.OrderedDict([("Cypress Bay","CYPRESS BAY"),("Baytree","BAY ?TREE"),("Carolina Yacht Landing","YACHT LANDING"),("Spinnaker Cove","SPINNAKER"),
 ("Lightkeepers Village","LIGHTKEEPERS"),("Mariner's Pointe","MARINERS? POINT"),("Intercoastal Village","INTERCOASTAL VILLAGE"),("Village at the Glens","VILLAGE AT THE GLENS"),
 ("Coquina Harbour","COQUINA"),("Moorings at Eastport","MOORINGS AT EASTPORT")])
def q(v):
    v=sorted(v); n=len(v)
    if not n: return None
    return {"count":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
out={"deeds_from":R["from"],"deeds_to":R["to"],"condo_deeds_kept_countywide":len(k),"buildings":{}}
allb=[]
for name,pat in BUILD.items():
    m=[d for d in k if re.search(pat,d["Comments"].upper())]
    cities=collections.Counter(PC.get(d["ParcelNumber"],["(no address)",""])[0] for d in m)
    dist=collections.Counter(P[d["ParcelNumber"]]["TaxDistrict"] for d in m)
    out["buildings"][name]={**(q([d["Consideration"] for d in m]) or {"count":0}),"postal_city":dict(cities),"tax_district":dict(dist),
      "business_seller":sum(1 for d in m if d["DirectName"])}
    allb+=m
out["named_buildings_all"]=q([d["Consideration"] for d in allb])
out["named_buildings_bands"]={f"{a}-{b}":sum(1 for d in allb if a<=d["Consideration"]<b) for a,b in [(0,100000),(100000,150000),(150000,200000),(200000,250000),(250000,300000),(300000,10**9)]}
out["named_buildings_business_seller"]=sum(1 for d in allb if d["DirectName"])
qs=collections.defaultdict(list)
for d in allb: qs[d["RecordDate"][:4]+"-Q"+str((int(d["RecordDate"][5:7])-1)//3+1)].append(d["Consideration"])
out["named_by_quarter"]={a:{"count":len(v),"median":st.median(v)} for a,v in sorted(qs.items())}
json.dump(out,open(D+"/findings-deeds.json","w"),indent=1); print(json.dumps(out,indent=1))
