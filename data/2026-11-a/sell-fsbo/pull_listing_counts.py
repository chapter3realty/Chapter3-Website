"""Active for-sale listing COUNTS from the CRM's public map API (aggregate only; no addresses, firms or photos saved).
For each home type: all active, active with a price cut (has=price_reduced), and listed in the last 30 and 7 days (domMax).
Run: python3 -I pull_listing_counts.py <outdir>. Writes <outdir>/listing-counts.json."""
import json, sys, os, time, urllib.request, urllib.parse, datetime
out = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
            return {"url": url, "total": d["total"], "labels": d.get("labels"), "refreshedAt": (d.get("meta") or {}).get("refreshedAt")}
        except Exception: time.sleep(3)
    raise SystemExit("failed " + url)
res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "rows": {}}
for t in ["", "house", "townhouse", "condo", "manufactured"]:
    base = {"type": t} if t else {}
    r = {"all": total(base), "price_reduced": total(dict(base, has="price_reduced")),
         "listed_30d": total(dict(base, domMax="30")), "listed_7d": total(dict(base, domMax="7"))}
    res["rows"][t or "any"] = r
    print(t or "any", {k: v["total"] for k, v in r.items()}, flush=True)
json.dump(res, open(os.path.join(out, "listing-counts.json"), "w"), indent=1)
