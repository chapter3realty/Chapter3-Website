#!/usr/bin/env python3
"""/buyers/flood-zone-check/: chart files from listing-vs-map.json (aggregates only). Run: python3 -I build_charts.py <datadir>"""
import json, sys, os, csv
d = sys.argv[1]; j = json.load(open(os.path.join(d, "listing-vs-map.json"))); h = j["horry"]
def w(name, head, rows):
    with open(os.path.join(d, name), "w", newline="") as f:
        c = csv.writer(f); c.writerow(head); c.writerows(rows)
# The one chart: homes for sale inside FEMA's high-risk zone, split by whether our search's flood-zone filter finds them.
w("chart-high-risk-tagged.csv", ["group", "homes", "pulled"],
  [["came up under flood zone", h["sfha_flagged"], j["pulled"][:10]], ["did not come up", h["sfha_not_flagged"], j["pulled"][:10]]])
# Table rows, if the writer uses them: by kind of home, by FEMA zone letter, by price band.
w("table-by-type.csv", ["type", "in_high_risk_zone", "came_up", "did_not"],
  [[t, v.get("sfha", 0), v.get("sfha_flagged", 0), v.get("sfha_not_flagged", 0)] for t, v in j["horry_by_type"].items()])
w("table-by-zone.csv", ["zone", "in_zone", "came_up", "did_not"],
  [[z, v["sfha"], v["sfha_flagged"], v["sfha"] - v["sfha_flagged"]] for z, v in j["fema_zone_letter"].items()])
w("table-by-price.csv", ["band", "homes_for_sale", "in_high_risk_zone", "came_up", "did_not"],
  [[b, v.get("horry", 0), v.get("sfha", 0), v.get("sfha_flagged", 0), v.get("sfha", 0) - v.get("sfha_flagged", 0)] for b, v in j["price_bands"].items()])
w("table-by-postal-city.csv", ["postal_city", "homes_for_sale", "in_high_risk_zone", "came_up"],
  [[t, v.get("horry", 0), v.get("sfha", 0), v.get("sfha_flagged", 0)] for t, v in j["towns_by_postal_city"].items()])
print(open(os.path.join(d, "chart-high-risk-tagged.csv")).read())
