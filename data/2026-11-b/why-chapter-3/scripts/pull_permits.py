#!/usr/bin/env python3
"""Horry County's public Active Permits layer, counted by permit type and work class. Aggregates only (no address, PIN or permit number kept).
Source: https://www.horrycounty.org/gisweb/rest/services/Public/PermitsActive/MapServer/0 (the layer behind https://www.horrycountysc.gov/gis/permits).
Run: python3 -I pull_permits.py <outdir>. Writes <outdir>/permits-active.json."""
import json, sys, urllib.request, urllib.parse, datetime
out = sys.argv[1]
U = "https://www.horrycounty.org/gisweb/rest/services/Public/PermitsActive/MapServer/0/query"
def q(p):
    url = U + "?" + urllib.parse.urlencode(dict(p, f="json"))
    return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=120)), url
def grp(field):
    stats = json.dumps([{"statisticType": "count", "onStatisticField": "OBJECTID_1", "outStatisticFieldName": "n"}])
    d, url = q({"where": "1=1", "groupByFieldsForStatistics": field, "outStatistics": stats})
    rows = sorted(([f["attributes"][field], f["attributes"]["n"]] for f in d["features"]), key=lambda r: -r[1])
    return rows, url
total, turl = q({"where": "1=1", "returnCountOnly": "true"})
mm, murl = q({"where": "1=1", "outStatistics": json.dumps([{"statisticType": "min", "onStatisticField": "ISSUEDATE", "outStatisticFieldName": "first"}, {"statisticType": "max", "onStatisticField": "ISSUEDATE", "outStatisticFieldName": "last"}])})
a = mm["features"][0]["attributes"]
ms = lambda v: datetime.datetime.fromtimestamp(v / 1000, datetime.timezone.utc).date().isoformat() if v else None
pt, pturl = grp("PermitType"); wc, wcurl = grp("Workclass")
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "total": total["count"], "total_url": turl,
  "issued_first": ms(a["first"]), "issued_last": ms(a["last"]), "by_permit_type": pt, "by_permit_type_url": pturl, "by_workclass": wc, "by_workclass_url": wcurl,
  "limits": "Active permits only, as the public layer holds them. Every row is work class New. The newest issue date shows whether the layer is current. Which towns are in it was not checked."},
  open(f"{out}/permits-active.json", "w"), indent=1)
print(total["count"], ms(a["first"]), ms(a["last"])); print(pt[:15]); print(wc[:15])
