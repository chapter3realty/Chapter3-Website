"""Second pass on the CRM's public map API, aggregate counts only.
(1) Houses: exactly 3 bedrooms tested against the ZIP's 3-bedroom HUD FY2027 Small Area FMR, 4+ bedrooms against the 4-bedroom FMR.
    exactly-3 count = count(beds>=3, price<=m) - count(beds>=4, price<=m).
(2) Condos, 2+ bedrooms, list price $50,000 or more: the 1 percent test after HOA dues. A condo passes when price <= 100 x (2-bedroom rent - monthly dues).
    Counted by dues band (lo, hi]: count(hoaMax=hi, max=100*(rent-hi)) - count(hoaMax=lo, max=100*(rent-hi)) is a floor (dues taken at the top of the band);
    the same with max=100*(rent-lo) is a ceiling.
Run: python3 -I pull_listings2.py <datadir>. Writes listings-vs-rent-2.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
D = sys.argv[1]
SAF = json.load(open(D + "/safmr-fy2027.json"))["zips"]
BASE = "https://chapter3realty.com/homes/api/map?"
def total(p):
    url = BASE + urllib.parse.urlencode(p)
    for i in range(4):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=90))["total"]
        except Exception as e:
            err = e; time.sleep(3)
    raise SystemExit("failed " + url + " " + str(err))
ZIPS = ["29511","29526","29527","29544","29566","29568","29569","29572","29575","29576","29577","29579","29581","29582","29588"]
houses = []
for z in ZIPS:
    r3, r4 = SAF[z]["3"], SAF[z]["4"]
    row = {"zip": z, "rent3": r3, "rent4": r4, "beds3plus": total({"zip": z, "type": "house", "beds": 3}),
           "beds4plus": total({"zip": z, "type": "house", "beds": 4}), "pass": {}}
    for y in [0.12, 0.10, 0.08]:
        m3, m4 = int(r3 * 12 / y), int(r4 * 12 / y)
        a = total({"zip": z, "type": "house", "beds": 3, "max": m3}); b = total({"zip": z, "type": "house", "beds": 4, "max": m3})
        c = total({"zip": z, "type": "house", "beds": 4, "max": m4})
        row["pass"][str(y)] = {"exactly3": a - b, "four_plus": c, "max3": m3, "max4": m4}
    houses.append(row); print(row, flush=True)
BANDS = [0, 200, 300, 400, 500, 600, 700, 800, 1000, 1500]
condos = []
for z in ["29526","29566","29568","29572","29575","29576","29577","29579","29582","29588"]:
    rent = SAF[z]["2"]; base = {"zip": z, "type": "condo", "beds": 2, "min": 50000}  # min drops timeshare-type listings under $50,000
    row = {"zip": z, "rent2": rent, "listings": total(base), "dues_known_upto_1500": total(dict(base, hoaMax=1500)),
           "price_only_pass": total(dict(base, max=rent * 100)), "price_only_pass_hoa_known": total(dict(base, max=rent * 100, hoaMax=1500)), "floor": 0, "ceiling": 0, "bands": []}
    for lo, hi in zip(BANDS[:-1], BANDS[1:]):
        if rent - lo <= 0: break
        def cnt(mx, dues):
            if mx <= 0: return 0
            return total(dict(base, hoaMax=dues, max=mx)) if dues else 0
        f = cnt(100 * (rent - hi), hi) - cnt(100 * (rent - hi), lo) if rent - hi > 0 else 0
        c = cnt(100 * (rent - lo), hi) - cnt(100 * (rent - lo), lo)
        row["bands"].append({"dues": [lo, hi], "floor": f, "ceiling": c}); row["floor"] += f; row["ceiling"] += c
    condos.append(row); print(row, flush=True)
json.dump({"pulled": datetime.datetime.now(datetime.UTC).isoformat(), "api": BASE, "houses": houses, "condos2": condos},
          open(D + "/listings-vs-rent-2.json", "w"), indent=1)
