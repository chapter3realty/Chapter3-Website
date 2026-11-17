"""Preserve (SHAFTESBURY GLEN PH 9) deeds with stated price over $10,000, 2025-11-01..2026-10-31, houses and lot-parcels together (new houses close on lot parcels before the county rolls the building). Run with RAW=<scratch> SALES=<deeds-co.json>."""
import json,os,statistics as st
C=json.load(open(os.environ["RAW"]+"/county.json"));P={str(k).zfill(11) for k,a in C["parcels"].items() if a["section"].startswith("SHAFTESBURY GLEN PH 9")}
D=json.load(open(os.environ["SALES"]));import collections
m=collections.Counter(d["BookPage"] for d in D["deeds"])
s=[d["Consideration"] for d in D["deeds"] if d["ParcelNumber"] in P and (d["Consideration"] or 0)>10000 and m[d["BookPage"]]==1]
q=st.quantiles(s,n=4);print(len(s),min(s),q[0],st.median(s),q[2],max(s))
