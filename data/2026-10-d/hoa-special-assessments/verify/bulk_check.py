"""Verifier check: how much of the 2021 to 2025 lien rise depends on the 25-a-year bulk threshold."""
import sys,json,glob,os,re,collections
RAW=sys.argv[1]
BULK=re.compile(r"WYNDHAM|MARRIOTT|HILTON GRAND|BLUEGREEN|VISTANA|WESTGATE|DIAMOND RESORTS|HOLIDAY INN CLUB|VACATION|TIMESHARE|INTERVAL|WATER AND SEWER|\bTR(USTEE)?\b", re.I)
docs={}
for f in glob.glob(os.path.join(RAW,"liens-condo-lien-[0-9]*.json")):
    for r in json.load(open(f))["Data"]:
        k=r.get("BookPage") or r.get("TransactionId")
        x=docs.setdefault(k,{"y":r["RecordDate"][:4],"f":set()}); x["f"].add((r.get("DirectName") or "").strip())
cnt=collections.defaultdict(collections.Counter)
for x in docs.values():
    for n in x["f"]: cnt[x["y"]][n]+=1
for y in ("2021","2022","2023","2024","2025","2026"):
    namebulk=thr=rest=0; thrnames=[]
    for x in docs.values():
        if x["y"]!=y: continue
        ns=[n for n in x["f"] if n]
        if any(BULK.search(n) for n in ns): namebulk+=1
        elif any(cnt[y][n]>=25 for n in ns): thr+=1
        else: rest+=1
    big=sorted(((c,n) for n,c in cnt[y].items() if c>=25 and not BULK.search(n)),reverse=True)
    print(y,"name-bulk",namebulk,"threshold-only",thr,"rest",rest,"rest+thr",rest+thr,"n_thr_filers",len(big),[c for c,n in big][:12])
print("threshold sensitivity (liens left after removing name-bulk and filers with >= T liens that year)")
for T in (25,50,100,200,10**9):
    row=[]
    for y in ("2021","2022","2023","2024","2025"):
        n=0
        for x in docs.values():
            if x["y"]!=y: continue
            ns=[m for m in x["f"] if m]
            if any(BULK.search(m) for m in ns) or any(cnt[y][m]>=T for m in ns): continue
            n+=1
        row.append(n)
    print(T,row, round(row[-1]/row[0],2))
