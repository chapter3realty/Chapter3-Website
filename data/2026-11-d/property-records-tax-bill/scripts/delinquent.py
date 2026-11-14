# Aggregate the county's 2026 delinquent tax sale lists. Prints counts and bid stats only; no names.
import sys,openpyxl,statistics,json,re,collections
out={}
for f,key in [(sys.argv[1],'real_estate'),(sys.argv[2],'mobile_home')]:
    ws=openpyxl.load_workbook(f,read_only=True).worksheets[0]
    rows=list(ws.iter_rows(values_only=True))
    hdr_i=[i for i,r in enumerate(rows) if r and r[0] in ('Item','Item Number')][0]
    hdr=rows[hdr_i]; data=[r for r in rows[hdr_i+1:] if r and r[1]]
    bids=[float(r[5]) for r in data if isinstance(r[5],(int,float))]
    pins=set(str(r[1]).strip() for r in data)
    desc=collections.Counter()
    for r in data:
        d=str(r[4] or '').upper()
        for k in ['LOT','UNIT','ACRE','CONDO','TIMESHARE','INTERVAL','WEEK','HORIZONTAL','VILLA','TRACT','PARCEL','MOBILE','BLDG']:
            if k in d: desc[k]+=1
    bs=sorted(bids)
    q=lambda p: bs[int(p*(len(bs)-1))]
    out[key]=dict(rows=len(data),unique_pins=len(pins),bids_n=len(bids),bid_total=round(sum(bids)),bid_median=round(statistics.median(bids)),bid_p10=round(q(.1)),bid_p25=round(q(.25)),bid_p75=round(q(.75)),bid_p90=round(q(.9)),bid_min=round(min(bids)),bid_max=round(max(bids)),
        under_1000=sum(b<1000 for b in bids),under_2500=sum(b<2500 for b in bids),over_10000=sum(b>10000 for b in bids),desc_keywords=dict(desc),title=rows[0][0])
    # bucket counts for a chart
    edges=[0,500,1000,2500,5000,10000,25000,10**9]
    labels=['under $500','$500 to $999','$1,000 to $2,499','$2,500 to $4,999','$5,000 to $9,999','$10,000 to $24,999','$25,000 or more']
    out[key]['buckets']=[dict(label=l,count=sum(edges[i]<=b<edges[i+1] for b in bids)) for i,l in enumerate(labels)]
print(json.dumps(out,indent=1))
