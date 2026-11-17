"""Recorded sales in the Horry-County part of the Garden City Census place (2020 CDP boundary, TIGERweb; data/2026-11-a/submarkets-garden-city/raw/cdp2020.geojson)
from the county deed index (Horry County Register of Deeds DEED 001, recorded 2025-11-01 to 2026-10-31; data/2026-11-n/buyers-builders/raw/deeds-co.json, person names blanked).
Same filter as data/2026-11-f/conway-homes-for-sale/analyze_deeds.py: consideration over $10,000; one 11-digit parcel; no tax-sale or court party; memo without CORRECT, RE-RECORD, SEVERAL, PARCELS, TRACTS, LOTS, "n UNITS"; book and page on one deed; parcel in county layer.
Kind: land use 107 or legal description containing HPR = condo; 101, 106, 109 = house; 135 = townhouse; others = other. Counts, medians and ranges only (no PIN, no book and page).
Usage: python3 -I analyze_deeds.py <data dir>"""
import json,sys,re,statistics as st,collections
from shapely.geometry import shape,Point
D=sys.argv[1]
cdp=shape(json.load(open(D+"/2026-11-a/submarkets-garden-city/raw/cdp2020.geojson"))["features"][0]["geometry"])
B=D+"/2026-11-n/buyers-builders/raw"
P=json.load(open(B+"/parcels.json"))["parcels"]; R=json.load(open(B+"/deeds-co.json"))
TAX=re.compile(r"DELINQUENT TAX|SHERIFF|MASTER IN EQUITY"); MEMO=re.compile(r"CORRECT|RE-RECORD|SEVERAL|PARCELS|TRACTS|\bLOTS\b|\d+ UNITS")
deeds=R["deeds"]; multi=collections.Counter(d["BookPage"] for d in deeds)
inside={k for k,v in P.items() if v["lng"] and cdp.contains(Point(v["lng"],v["lat"]))}
steps=collections.OrderedDict(); steps["all county deeds"]=len(deeds)
k=[d for d in deeds if (d["Consideration"] or 0)>10000]; steps["over $10,000"]=len(k)
k=[d for d in k if re.fullmatch(r"\d{11}",d["ParcelNumber"] or "")]; steps["one parcel number"]=len(k)
k=[d for d in k if not TAX.search((d["DirectName"] or "")+" "+(d["IndirectName"] or "")) and not MEMO.search(d["Comments"] or "")]; steps["not tax sale, corrective or multi-parcel"]=len(k)
k=[d for d in k if multi[d["BookPage"]]==1]; steps["book and page on one deed"]=len(k)
k=[d for d in k if d["ParcelNumber"] in P and (P[d["ParcelNumber"]]["LandUseCode"] or "").startswith("1")]; steps["parcel in county layer, residential"]=len(k)
k=[d for d in k if d["ParcelNumber"] in inside]; steps["inside the Garden City Census place"]=len(k)
def kind(p):
    c=p["LandUseCode"]; l=p["LegalDescr"] or ""
    if c=="107" or "HPR" in l: return "condo"
    if c in("101","106","109"): return "house"
    if c=="135": return "townhouse"
    return "other"
def q(v):
    v=sorted(v);n=len(v)
    if not n: return None
    return {"count":n,"median":st.median(v),"p25":v[int(n*.25)],"p75":v[min(n-1,int(n*.75))],"min":v[0],"max":v[-1]}
by=collections.defaultdict(list)
for d in k: by[kind(P[d["ParcelNumber"]])].append(d)
bands=[(0,200000),(200000,300000),(300000,400000),(400000,600000),(600000,10**9)]
out={"deeds_from":R["from"],"deeds_to":R["to"],"steps":steps,"all":q([d["Consideration"] for d in k])}
for kd,L in by.items():
    out[kd]=q([d["Consideration"] for d in L]); out[kd]["bands"]={f"{a}-{b}":sum(1 for d in L if a<=d["Consideration"]<b) for a,b in bands}
    out[kd]["seller_is_business"]=sum(1 for d in L if d["DirectName"])
out["zip_note"]="All Garden City addresses are zip 29576 (or 29575 at the north edge)."
json.dump(out,open("findings-deeds.json","w"),indent=1); print(json.dumps(out,indent=1))
