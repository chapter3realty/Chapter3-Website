"""Active for-sale listing COUNTS and middle asking prices from the CRM's public map API (aggregate only; no addresses,
firms or photos are saved). For each home type: all active, "Cash only" listings (has=cash_only_listing), "Needs work"
listings (filter-list count only; see below), and cash-only with a price cut. Run: python3 -I pull_listing_counts.py <outdir>.
Writes <outdir>/listing-counts.json."""
import json, sys, os, time, urllib.request, urllib.parse, datetime, statistics as st, re
out = sys.argv[1]
BASE = "https://chapter3realty.com/homes/api/map?"
def get(p):
    time.sleep(2)
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
            prices = [int(re.sub(r"\D", "", x["price"])) for x in d.get("pins", []) if re.sub(r"\D", "", x.get("price") or "")]
            return {"url": url, "total": d["total"], "pins_returned": len(d.get("pins", [])),
                    "median_asking": round(st.median(prices)) if prices and len(prices) == d["total"] else None,
                    "refreshedAt": (d.get("meta") or {}).get("refreshedAt")}
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(15 * (i + 1))
    raise SystemExit("failed " + url)
res = {"pulled": datetime.datetime.utcnow().isoformat() + "Z",
       "note": "Whole feed (CCMLS listings the CRM carries), no county outline. median_asking only when every pin came back.", "rows": {}}
for t in ["house", "townhouse", "condo", "manufactured"]:  # the whole feed with a filter returns 503; types are summed instead
    b = {"type": t} if t else {}
    r = {"all": get(b), "cash_only": get(dict(b, has="cash_only_listing")), "cash_only_price_cut": get(dict(b, has="cash_only_listing,price_reduced"))}
    res["rows"][t or "any"] = r
    print(t or "any", {k: (v["total"], v["pins_returned"], v["median_asking"]) for k, v in r.items()}, flush=True)
# has=fixer_upper returned HTTP 503 on every try (2026-11-08), so "Needs work" is read from the filter list's whole-feed count.
f = json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/filters", headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
res["filter_list"] = {"url": "https://chapter3realty.com/homes/api/filters", "countedAt": f.get("countedAt"),
                      "counts": {i["k"]: i["n"] for g in f["groups"] for i in g["items"] if i["k"] in ("cash_only_listing", "fixer_upper", "price_reduced")}}
print(res["filter_list"])
json.dump(res, open(os.path.join(out, "listing-counts.json"), "w"), indent=1)
