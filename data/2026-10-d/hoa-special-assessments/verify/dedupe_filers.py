"""Verifier check: association filer counts by year after merging spelling variants of one name (INC, HOA vs HOMEOWNERS ASSOCIATION, punctuation)."""
import sys,json,glob,os,re,collections
RAW=sys.argv[1]
BULK=re.compile(r"WYNDHAM|MARRIOTT|HILTON GRAND|BLUEGREEN|VISTANA|WESTGATE|DIAMOND RESORTS|HOLIDAY INN CLUB|VACATION|TIMESHARE|INTERVAL|WATER AND SEWER|\bTR(USTEE)?\b", re.I)
def norm(n):
    n=n.upper().replace("&"," AND ").replace("@"," AT "); n=re.sub(r"[^A-Z0-9 ]"," ",n)
    n=re.sub(r"\b(INC|INCORPORATED|THE|OF|AT|LLC|CORP|CORPORATION|CO|ASSOC|ASSN|ASSOCIATION|ASSOCIATIONS|HOMEOWNERS|HOMEOWNER|HOME|OWNERS|OWNER|PROPERTY|POA|HOA|COA|NFP|NONPROFIT|HPR|HORIZONTAL|REGIME|COUNCIL|CO OWNERS|COOWNERS)\b"," ",n)
    return re.sub(r"\s+","",n)
by=collections.defaultdict(set); raw=collections.defaultdict(set)
for f in glob.glob(os.path.join(RAW,"liens-condo-lien-[0-9]*.json")):
    for r in json.load(open(f))["Data"]:
        n=(r.get("DirectName") or "").strip(); y=r["RecordDate"][:4] if r.get("RecordDate") else None
        # RecordDate format check
        if n and not BULK.search(n):
            y=os.path.basename(f)[17:21]; by[y].add(norm(n)); raw[y].add(n)
for y in sorted(by): print(y, len(raw[y]), len(by[y]))
