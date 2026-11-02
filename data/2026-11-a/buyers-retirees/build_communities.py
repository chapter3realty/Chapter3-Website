"""One row per 55+ community for the comparison table, joined from this folder's data files.
Measured here: homes with a building and the share taxed as a full-time home (parcels-findings.json), evacuation zone
(zones-findings.json), drive to the nearest hospital (drives.json). Carried from the four live 55+ pages so the site gives
one value (facts.md rows 29 to 32, 35, 41): HOA fee, years built, the guest rule, and the rounded drive minutes those pages print.
Run: python3 -I build_communities.py <datadir>. Writes communities.json."""
import sys, json, os
D = sys.argv[1]
P = json.load(open(os.path.join(D, "parcels-findings.json"))); Z = json.load(open(os.path.join(D, "zones-findings.json")))
R = {(d["from"], d["to"]): d for d in json.load(open(os.path.join(D, "drives.json")))["drives"]}
CARRIED = {  # value as printed on the community's own page; facts.md row in brackets
  "Del Webb at Grande Dunes": {"url": "/buyers/55-plus-communities/del-webb-grande-dunes/", "where": "Myrtle Beach", "fee": "about $400 a month (house), $445 (villa)", "built": "2018 to 2026",
                               "guests": "Under 19: up to 90 nights in any 12 months", "hospital": "Grand Strand Medical Center", "minutes": 6, "row": "29, 35"},
  "Del Webb North Myrtle Beach": {"url": "/buyers/55-plus-communities/del-webb-north-myrtle-beach/", "where": "North Myrtle Beach", "fee": "about $315 a month", "built": "2022 to now",
                                  "guests": "Not published", "hospital": "McLeod Health Seacoast", "minutes": 12, "row": "30, 35"},
  "Myrtle Trace": {"url": "/buyers/55-plus-communities/myrtle-trace/", "where": "Conway", "fee": "$95 a month", "built": "mostly 1980s and 1990s",
                   "guests": "No age limit for others in the home", "hospital": "Conway Medical Center", "minutes": 3, "row": "31, 35"},
  "Seasons at Prince Creek West": {"url": "/buyers/55-plus-communities/seasons-at-prince-creek-west/", "where": "near Murrells Inlet", "fee": "about $340 a month", "built": "2006 to 2016",
                                   "guests": "Under 18: visits up to 60 days a year", "hospital": "Tidelands Waccamaw Community Hospital", "minutes": 8, "row": "32, 35"},
}
rows = []
for name, c in CARRIED.items():
    p, z = P[name], Z[name]
    zone = list(z["home_parcels_by_scemd_zone"].keys())
    rows.append({"name": name, **c, "homes": p["homes_with_building"], "full_time_share": p["share_4pct"], "full_time_share_owned_before_2026": p["share_4pct_owned_before_2026"],
                 "evacuation_zone": "none" if zone == ["none"] else ",".join(zone), "drive_measured_minutes": R[(name, c["hospital"])]["minutes"]})
county = {"houses": P["Horry County, 101 house, all"]["share_4pct"], "all_homes": P["Horry County, all homes, all"]["share_4pct"]}
json.dump({"communities": rows, "county_full_time_share": county}, open(os.path.join(D, "communities.json"), "w"), indent=1)
for r in rows: print(r["name"], r["homes"], r["full_time_share"], r["evacuation_zone"], r["minutes"], r["drive_measured_minutes"])
print(county)
