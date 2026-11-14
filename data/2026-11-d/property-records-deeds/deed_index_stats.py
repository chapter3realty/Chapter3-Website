"""Aggregate-only statistics from a 12-month pull of the Horry County deed index (AcclaimWeb, doc type DEED 001).
Usage: python3 -I deed_index_stats.py <dir with deeds-YYYY-MM-DD.json weekly files> <out.json>
The raw rows (pulled for batch 2026-11-b /sell/fsbo/ verification) carry party names and stay in the scratchpad.
This script writes counts and shares only: no names, no book/page, no parcel numbers."""
import sys, json, glob, os, statistics, datetime, collections
src, out = sys.argv[1], sys.argv[2]
seen = {}; files = sorted(glob.glob(os.path.join(src, "deeds-20*.json")))
for f in files:
    for r in json.load(open(f))["Data"]:
        seen[r["TransactionItemId"]] = r
rows = list(seen.values())
def num(x):
    try: return float(str(x).replace("$", "").replace(",", ""))
    except: return None
def d(r):
    s = r["RecordDate"]
    if s.startswith("/Date("): return datetime.datetime.utcfromtimestamp(int(s[6:-2].split("-")[0][:10]))
    s = s.split(" ")[0]
    return datetime.datetime.strptime(s, "%Y/%m/%d" if s[:4].isdigit() else "%m/%d/%Y")
dates = [d(r) for r in rows]
cons = [num(r["Consideration"]) for r in rows]
zero = sum(1 for c in cons if not c)
under10k = sum(1 for c in cons if c is not None and 0 < c < 10000)
priced = sorted(c for c in cons if c and c >= 10000)
parcel = sum(1 for r in rows if (r.get("ParcelNumber") or "").strip())
memo = sum(1 for r in rows if (r.get("Comments") or "").strip())
types = collections.Counter(r["DocTypeDescription"] for r in rows)
bymonth = collections.Counter(x.strftime("%Y-%m") for x in dates)
res = {"source": "Horry County Register of Deeds, AcclaimWeb index, doc type DEED (001), weekly pulls",
  "files": len(files), "first_record_date": min(dates).strftime("%Y-%m-%d"), "last_record_date": max(dates).strftime("%Y-%m-%d"),
  "deeds": len(rows), "consideration_zero_or_blank": zero, "consideration_zero_pct": round(100*zero/len(rows), 1),
  "consideration_1_to_9999": under10k, "consideration_10000_plus": len(priced),
  "median_consideration_10000_plus": statistics.median(priced),
  "with_parcel_number": parcel, "with_parcel_pct": round(100*parcel/len(rows), 1),
  "with_memo_legal": memo, "with_memo_pct": round(100*memo/len(rows), 1),
  "doc_types": dict(types), "deeds_by_month": dict(sorted(bymonth.items())),
  "avg_per_weekday": round(len(rows)/sum(1 for i in range((max(dates)-min(dates)).days+1) if (min(dates)+datetime.timedelta(i)).weekday()<5), 1)}
json.dump(res, open(out, "w"), indent=1); print(json.dumps(res, indent=1))
