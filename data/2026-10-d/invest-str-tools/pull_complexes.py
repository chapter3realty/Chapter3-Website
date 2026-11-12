"""Which condo complexes the worked two-bedroom condos on /invest/str-tools/ belong to, from the CRM.
Pins from the public map API (https://chapter3realty.com/homes/api/map); the complex is the "Subdivision" line on
each listing's public page on chapter3realty.com/homes/ (shown without sign-up).
Output: counts by complex and street, with how many fall under each monthly fee ceiling (hoaMax) and how many the
listing marks as the fee paying the electric. No address number, MLS number, price or firm is kept in the output.
Exactly 2 bedrooms: pins with beds == 2. Calls spaced 2.1 s (the CRM allows about 300 searches per 10 minutes).
Run: python3 -I pull_complexes.py <this folder>. Writes raw/listings-complexes.json."""
import json, sys, time, re, html, urllib.request, urllib.parse, datetime, collections
root = sys.argv[1]
SITE = "https://chapter3realty.com"
UA = {"User-Agent": "Mozilla/5.0 (research; chapter3realty.com)"}
def fetch(url, js=True):
    for _ in range(5):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read().decode("utf8", "replace")
            time.sleep(2.1); return json.loads(r) if js else r
        except Exception:
            time.sleep(20)
    return {} if js else ""
def pins(p):
    j = fetch(SITE + "/homes/api/map?" + urllib.parse.urlencode(dict(p, beds=2, limit=144)))
    return [x for x in j.get("pins", []) if x.get("beds") == 2]
def street(addr):
    s = addr.split(",")[0].strip()
    s = re.sub(r"\s+(Unit|Apt|#|Ste|Suite|Bldg)\b.*$", "", s, flags=re.I)
    s = re.sub(r"^\d+[A-Za-z\-]*\s+", "", s).rstrip(".")
    s = re.sub(r"^(N|S|North|South)\s+Ocean Blvd(\. [NS])?$", "Ocean Blvd", s)
    s = re.sub(r"^Ocean Blvd\. [NS]$", "Ocean Blvd", s)
    return s
def subdivision(url):
    t = fetch(SITE + url, js=False)
    m = re.search(r"Subdivision</span>\s*(?:<[^>]+>\s*)*([^<]+)<", t)
    return html.unescape(m.group(1)).strip() if m else ""
EX = {
    "mb_city_oceanfront_condo_2br": {"type": "condo", "city": "Myrtle Beach", "has": "oceanfront_building,inside_city_limits,str_allowed"},
    "nmb_oceanfront_condo_2br": {"type": "condo", "city": "North Myrtle Beach", "has": "oceanfront_building,str_allowed"},
    "surfside_condo_2br": {"type": "condo", "city": "Surfside Beach", "has": "str_allowed"},
    "garden_city_condo_2br": {"type": "condo", "has": "area_garden_city,str_allowed"},
}
BANDS = [400, 600, 800, 1000]
out = {"pulled": datetime.datetime.utcnow().isoformat() + "Z", "source": SITE + "/homes/api/map and the listing pages' Subdivision line", "groups": {}}
for name, p in EX.items():
    base = pins(p)
    band = {b: {x["mls"] for x in pins(dict(p, hoaMax=b))} for b in BANDS}
    elec = {x["mls"] for x in pins(dict(p, has=p["has"] + ",hoa_includes_electric"))}
    rows = collections.defaultdict(lambda: {"n": 0, "streets": collections.Counter(), "electric": 0, **{"fee_le_%d" % b: 0 for b in BANDS}})
    for x in base:
        sub = subdivision(x["url"]) or "(none given)"
        r = rows[sub]; r["n"] += 1; r["streets"][street(x["addr"])] += 1
        r["electric"] += x["mls"] in elec
        for b in BANDS: r["fee_le_%d" % b] += x["mls"] in band[b]
    g = {"n": len(base), "electric_n": len(elec), **{"fee_le_%d" % b: len(band[b]) for b in BANDS},
         "complexes": sorted(({"name": k, **{kk: (dict(vv) if kk == "streets" else vv) for kk, vv in v.items()}} for k, v in rows.items()), key=lambda r: -r["n"])}
    out["groups"][name] = g
    print(name, g["n"], [(c["name"], c["n"], c["fee_le_600"], c["electric"]) for c in g["complexes"][:10]], flush=True)
json.dump(out, open(root + "/raw/listings-complexes.json", "w"), indent=1)
