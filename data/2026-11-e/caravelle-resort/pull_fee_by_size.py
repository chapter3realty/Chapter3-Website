"""Does the Caravelle fee follow the unit's square footage? Each listing's fee is put in a $25 bracket with hoaMax (as pull_listings.py does),
joined in memory to its square feet, and only band-level summaries are saved (count, lowest and highest bracket per size band). No listing is kept.
Run: python3 -I pull_fee_by_size.py <dir>. Writes fee-by-size.json."""
import json, sys, time, re, urllib.request, urllib.parse, statistics as st
D = sys.argv[1]; UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
AT = re.compile(r"^(6900|7000) (N OCEAN BLVD|OCEAN BLVD N)\b")
def get(p):
    url = "https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode(dict({"type": "condo", "subdivision": "Caravelle"}, **p))
    j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60)); time.sleep(2.1); return j["pins"]
pins = {x["mls"]: x for x in get({}) if AT.match(re.sub(r"\bNORTH\b", "N", x["addr"].upper().replace(".", "")))}
br = {}
for t in range(575, 976, 25):
    for x in get({"hoaMax": t}):
        if x["mls"] in pins and x["mls"] not in br: br[x["mls"]] = t
bands = [("under 450 sq ft", 0, 450), ("450 to 519", 450, 520), ("520 to 599", 520, 600), ("600 and over", 600, 9999)]
out = {"n": len(pins), "with_bracket": len(br), "bands": {}}
for nm, a, b in bands:
    v = [br[m] for m, x in pins.items() if m in br and x.get("sqft") and a <= x["sqft"] < b]
    out["bands"][nm] = {"n": len(v), "bracket_lowest": min(v) if v else None, "bracket_highest": max(v) if v else None, "median_bracket": st.median(v) if v else None}
xs = [(pins[m]["sqft"], br[m]) for m in br if pins[m].get("sqft")]
mx, my = st.mean(a for a, _ in xs), st.mean(b for _, b in xs)
out["correlation_sqft_fee"] = round(sum((a - mx) * (b - my) for a, b in xs) / (sum((a - mx) ** 2 for a, _ in xs) * sum((b - my) ** 2 for _, b in xs)) ** .5, 2)
json.dump(out, open(D + "/fee-by-size.json", "w"), indent=1); print(json.dumps(out))
