"""Counts of every search the page's strips use, from the live site. Run: python3 -I check_strips.py <dir>. Writes strips.json."""
import json, sys, time, urllib.request, urllib.parse, datetime
C = "near=33.83434,-78.62798&miles=0.8"
S = {"all": C, "houses": C+"&type=house", "condos": C+"&type=condo", "townhouses": C+"&type=townhouse", "land": C+"&type=land",
     "dock": C+"&has=private_dock", "dock_houses": C+"&type=house&has=private_dock", "waterfront_houses": C+"&type=house&waterfront=1",
     "waterfront_condos": C+"&type=condo&waterfront=1", "new2026": C+"&yearMin=2026", "new2026_houses": C+"&type=house&yearMin=2026",
     "oceanfront": C+"&has=oceanfront", "ocean_view": C+"&has=ocean_view", "condos_under_300": C+"&type=condo&max=300000", "condos_under_250": C+"&type=condo&max=250000",
     "houses_under_600": C+"&type=house&max=600000", "houses_over_1m": C+"&type=house&min=1000000", "pool": C+"&has=pool", "boat_lift": C+"&has=boat_lift_any",
     "elevator": C+"&has=home_elevator", "hoa0_houses": C+"&type=house&hoa=0", "rental_ok": C+"&has=short_term_rental_ok", "subdivision": "subdivision=Cherry+Grove"}
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "strips": {}}
for k, q in S.items():
    r = {}
    for api in ("map", "strip"):
        try:
            j = json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/%s?%s&status=active" % (api, q) if api == "map" else "https://chapter3realty.com/homes/api/strip?" + q, headers={"User-Agent": "Mozilla/5.0 (research)"}), timeout=60))
            r[api] = {"ok": j.get("ok"), "total": j.get("total"), "n_pins": len(j.get("pins", [])) if "pins" in j else None, "keys": [x for x in j if x not in ("html", "pins")]}
        except Exception as e: r[api] = {"err": str(e)[:80]}
        time.sleep(1.5)
    out["strips"][k] = {"q": q, **r}; print(k, r["map"].get("total"), r["strip"].get("total"), r["strip"].get("keys"))
json.dump(out, open(sys.argv[1] + "/strips.json", "w"), indent=1)
