"""Live strip searches for the Sea Mist page: the count each returns today (https://chapter3realty.com/homes/api/strip?<q>), with the first card's labels only. Writes strips.json. Run: python3 -I strips.py <this dir>"""
import json, sys, urllib.request, urllib.parse, datetime, time
Q = {
 "whole": "subdivision=Sea Mist Resort",
 "whole_type": "subdivision=Sea Mist Resort&type=condo",
 "oceanfront_unit": "subdivision=Sea Mist Resort&has=oceanfront_unit",
 "rental_program": "subdivision=Sea Mist Resort&has=vacation_rental_program",
 "electric_in_fee": "subdivision=Sea Mist Resort&has=hoa_includes_electric",
 "under_60k": "subdivision=Sea Mist Resort&max=60000",
 "high_floor": "subdivision=Sea Mist Resort&has=high_floor_unit",
 "near_oceanfront_1br": "near=33.67498,-78.898459&miles=1&type=condo&has=oceanfront_unit&beds=1",
 "near_oceanfront_2br": "near=33.67498,-78.898459&miles=1&type=condo&has=oceanfront_unit&beds=2",
 "near_oceanfront": "near=33.67498,-78.898459&miles=1&type=condo&has=oceanfront_unit",
 "near_2br_any": "near=33.67498,-78.898459&miles=1&type=condo&beds=2",
 "near_3br_oceanfront": "near=33.67498,-78.898459&miles=1&type=condo&has=oceanfront_unit&beds=3",
}
out = {"read": datetime.datetime.now(datetime.timezone.utc).isoformat(), "strips": {}}
for k, q in Q.items():
    url = "https://chapter3realty.com/homes/api/strip?" + urllib.parse.urlencode(urllib.parse.parse_qsl(q))
    try:
        j = json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research)"}), timeout=60))
        out["strips"][k] = {"q": q, "url": url, "ok": j.get("ok"), "total": j.get("total"), "labels": j.get("labels"), "note": j.get("note"), "link": j.get("link"), "empty": "hx-s-empty" in (j.get("html") or "")}
    except Exception as e:
        out["strips"][k] = {"q": q, "error": str(e)}
    time.sleep(1)
json.dump(out, open(sys.argv[1] + "/strips.json", "w"), indent=1)
for k, v in out["strips"].items(): print(k, v.get("total"), v.get("empty"), v.get("note"), v.get("error"))
