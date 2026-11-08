"""Active new-construction listings in Horry County from the CRM's public map API (CCMLS feed), for counting by builder in aggregate.
Step 1: every pin with has=new_construction,county_horry for type house, townhouse and condo (price bands split until every pin comes back;
the API returns at most 144 pins per search).
Step 2: membership of each CRM "Built by ..." filter (has=new_construction,county_horry,builder_<key>).
Writes the full pin list ONLY to the scratch file given as argument 2 (it holds the listing firm, which this repo never keeps), and writes
raw/listings-calls.json (every URL called and the total the API reported) here.
Usage: python3 -I pull_listings.py <this dir> <scratch json>"""
import json, sys, os, time, urllib.request, urllib.parse, datetime, re
D, OUT = sys.argv[1], sys.argv[2]
BASE = "https://chapter3realty.com/homes/api/map?"
calls = []
def get(p):
    url = BASE + urllib.parse.urlencode(p, safe=",")
    for i in range(5):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
            if d.get("ok"): calls.append([url, d["total"], len(d["pins"])]); return d
        except Exception: pass
        time.sleep(4)
    raise SystemExit("failed " + url)
num = lambda s: float(str(s).replace("$", "").replace(",", "")) if s not in (None, "") else None
def band(q, lo, hi, acc, trunc):
    d = get(dict(q, min=lo, max=hi))
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(q, lo, mid, acc, trunc); band(q, mid + 1, hi, acc, trunc); return
    if d["total"] > len(d["pins"]): trunc.append([q, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        parts = [x.strip() for x in (p.get("addr") or "").split(",")]
        m = re.search(r"Built (\d{4})", p.get("tag") or "")
        acc[p["mls"]] = {"type": q["type"], "price": num(p["price"]), "beds": p.get("beds"), "sqft": p.get("sqft"), "acres": num(p.get("acres")),
                         "year": int(m.group(1)) if m else None, "status": p.get("status"), "city": parts[-3] if len(parts) >= 3 else None,
                         "lat": p.get("lat"), "lng": p.get("lng"), "firm": p.get("firm"), "filters": []}
pins, trunc, totals = {}, [], {}
for t in ["house", "townhouse", "condo"]:
    q = {"has": "new_construction,county_horry", "type": t}
    totals[t] = get(q)["total"]; band(q, 0, 8000000, pins, trunc); print(t, totals[t], len(pins), flush=True)
KEYS = ["dr_horton", "bradley_jones", "lennar", "mungo", "beverly", "meritage", "stanley_martin", "pulte", "beazer", "chesapeake",
        "dream_finders", "clayton", "adams", "starlight", "great_southern", "ashton_woods", "ryan"]
ftot = {}
for k in KEYS:
    acc = {}
    for t in ["house", "townhouse", "condo"]:
        band({"has": "new_construction,county_horry,builder_" + k, "type": t}, 0, 8000000, acc, trunc)
    ftot[k] = len(acc)
    for m in acc:
        if m in pins: pins[m]["filters"].append(k)
    print(k, len(acc), flush=True)
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "totals": totals, "filter_counts": ftot, "truncated": trunc,
           "pins": list(pins.values())}, open(OUT, "w"))
json.dump({"pulled": datetime.datetime.utcnow().isoformat() + "Z", "api": BASE, "totals": totals, "filter_counts": ftot,
           "truncated": trunc, "calls": calls}, open(os.path.join(D, "raw", "listings-calls.json"), "w"), indent=0)
print("pins", len(pins), "calls", len(calls), "trunc", trunc)
