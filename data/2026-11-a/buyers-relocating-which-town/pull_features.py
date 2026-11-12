"""Houses for sale now on the CRM's public map API (https://chapter3realty.com/homes/api/map), counted in aggregate by
what a mover asks for. One set per question; each set is every active house (type=house, status=active) the API returns
for that filter: all houses; has=beach_1mi (within a mile of the beach, the CRM's own distance tag); hoa=0 (no HOA fee
listed); has=new_construction; lotMin=1 (lot of an acre or more); has=rv_boat_parking; has=waterfront; has=one_level.
Splits price bands until each search returns every pin (the API returns at most 144 pins a call).
A band with no match returns suggested homes that do not match; those bands are skipped (fix 2026-11-03).
Keeps MLS number (to drop duplicates), price, lat and lng only. No address, firm or photo is saved.
Run: RAW=<scratch> python3 -I pull_features.py. Writes RAW/house-features.json (kept out of the repo: MLS numbers)."""
import json, os, time, urllib.request, urllib.parse, datetime
RAW = os.environ["RAW"]; os.makedirs(RAW, exist_ok=True)
BASE = "https://chapter3realty.com/homes/api/map?"
calls = 0
def get(p):
    global calls; calls += 1
    url = BASE + urllib.parse.urlencode(p)
    for i in range(5):
        try: return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60))
        except Exception: time.sleep(3 + 2 * i)
    raise SystemExit("failed " + url)
def num(s):
    try: return float(str(s).replace("$", "").replace(",", ""))
    except Exception: return None
def band(base, lo, hi, acc, warn):
    d = get(dict(base, min=lo, max=hi))
    if d["total"] == 0: return   # with no match the API returns other homes as suggestions; never count those
    if len(d["pins"]) > d["total"]: warn.append(["more pins than total", base, lo, hi, d["total"], len(d["pins"])])
    if d["total"] > len(d["pins"]) and hi - lo > 500:
        mid = (lo + hi) // 2; band(base, lo, mid, acc, warn); band(base, mid + 1, hi, acc, warn); return
    if d["total"] > len(d["pins"]): warn.append([base, lo, hi, d["total"], len(d["pins"])])
    for p in d["pins"]:
        acc[p["mls"]] = [num(p["price"]), p.get("lat"), p.get("lng")]
SETS = [("all", {}), ("beach_1mi", {"has": "beach_1mi"}), ("no_hoa", {"hoa": "0"}), ("new_construction", {"has": "new_construction"}),
        ("acre_lot", {"lotMin": "1"}), ("rv_boat_parking", {"has": "rv_boat_parking"}), ("waterfront", {"has": "waterfront"}), ("one_level", {"has": "one_level"})]
out = {"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "api": BASE, "sets": {}, "api_totals": {}, "truncated": []}
for name, extra in SETS:
    base = dict({"type": "house", "status": "active"}, **extra)
    acc = {}; band(base, 0, 30000000, acc, out["truncated"])
    d = get(base); out["api_totals"][name] = d["total"]; out["meta"] = d.get("meta")
    out["sets"][name] = acc; print(name, "pins", len(acc), "api total", d["total"], "calls", calls, flush=True)
out["calls"] = calls
json.dump(out, open(os.path.join(RAW, "house-features.json"), "w"))
print("done calls", calls, "truncated", out["truncated"][:5])
