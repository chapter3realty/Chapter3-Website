"""Cherry Grove homes for sale now, in aggregate, from the site's public map API (CCMLS active listings through the CRM).
Place = the site's Cherry Grove search: within 0.8 mile of 33.83434,-78.62798 (idx-lib/places.js "cherry-grove"). Counts, medians and ranges only.
HOA fee: for each threshold T the call hoaMax=T returns listings whose fee is T or less, so each listing's fee is known to a bracket.
Never saved: an MLS number, an address, one listing's price or fee, a firm or a photo.
Run: python3 -I pull_listings.py <this dir>. Writes listings.json."""
import json, sys, time, statistics as st, urllib.request, urllib.parse, datetime, collections
D = sys.argv[1]; C = {"near": "33.83434,-78.62798", "miles": "0.8", "status": "active"}
def get(p):
    for i in range(5):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode(p), headers={"User-Agent": "Mozilla/5.0 (research)"}), timeout=60)); time.sleep(2.1); return j
        except Exception: time.sleep(8 * (i + 1))
    raise SystemExit("fail")
def price(x): return int(x["price"].replace("$", "").replace(",", ""))
def q(v):
    v = sorted(v)
    if not v: return {"n": 0}
    return {"n": len(v), "min": v[0], "p25": st.quantiles(v, n=4)[0] if len(v) > 3 else None, "median": st.median(v), "p75": st.quantiles(v, n=4)[2] if len(v) > 3 else None, "max": v[-1]}
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rule": __doc__}
j = get(C); out["refreshedAt"] = j["meta"]["refreshedAt"]; out["source"] = j["meta"]["source"]; out["all"] = q([price(x) for x in j["pins"]])
for t in ("house", "condo", "land"):
    j = get({**C, "type": t}); out[t] = {"asking": q([price(x) for x in j["pins"]]), "beds": dict(collections.Counter(str(x["beds"]) for x in j["pins"])),
        "sqft": q([x["sqft"] for x in j["pins"] if x.get("sqft")]),
        "tag_waterfront": sum(1 for x in j["pins"] if x["tag"] == "Waterfront"), "tag_built_2026": sum(1 for x in j["pins"] if "Built" in (x["tag"] or ""))}
    out[t]["price_per_sqft"] = q([price(x) / x["sqft"] for x in j["pins"] if x.get("sqft")])
for k, extra in (("dock_houses", {"type": "house", "has": "private_dock"}), ("waterfront_houses", {"type": "house", "waterfront": "1"}), ("new_2026_houses", {"type": "house", "yearMin": "2026"}),
                 ("houses_no_hoa", {"type": "house", "hoa": "0"}), ("pool", {"has": "pool"}), ("ocean_view", {"has": "ocean_view"}), ("elevator", {"has": "home_elevator"})):
    j = get({**C, **extra}); out[k] = {"n": j["total"], "asking": q([price(x) for x in j["pins"]])}
# HOA brackets, condos and houses
for t in ("condo", "house"):
    prev = 0; hist = {}
    for T in [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 700, 800, 900, 1000, 1200, 1500, 2000]:
        n = get({**C, "type": t, "hoaMax": str(T)})["total"]; hist[str(T)] = n
    out["hoa_cumulative_" + t] = hist
json.dump(out, open(D + "/listings.json", "w"), indent=1)
print(json.dumps(out, indent=1)[:3500])
