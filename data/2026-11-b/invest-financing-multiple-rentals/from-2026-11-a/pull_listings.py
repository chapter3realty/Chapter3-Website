"""Active for-sale listings on the CRM's public map API, counted in aggregate (no addresses, MLS numbers, firms or photos kept).
Counts homes at or under the median price repeat buyers paid (repeat-buyers.json). Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]; BASE = "https://chapter3realty.com/homes/api/map?"
med = int(json.load(open(D + "/repeat-buyers.json"))["repeat_person_or_company"]["median_price"])
calls = []
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))
            calls.append({"url": url, "total": d["total"]}); return d["total"], d["meta"].get("refreshedAt")
        except Exception as e:
            err = e; time.sleep(3)
    raise SystemExit("failed " + url + " " + str(err))
out = {"median_repeat_price": med}
for kind, beds in [("house", 3), ("condo", 2), ("townhouse", 2)]:
    n, ref = total({"type": kind, "beds": beds}); m, _ = total({"type": kind, "beds": beds, "max": med})
    out[kind] = {"beds_min": beds, "listings": n, "at_or_under_median_repeat_price": m}
out["feed_refreshed"] = ref; out["pulled"] = datetime.datetime.utcnow().isoformat() + "Z"; out["calls"] = calls
json.dump(out, open(D + "/listings.json", "w"), indent=1); print(json.dumps({k: v for k, v in out.items() if k != "calls"}, indent=1))
