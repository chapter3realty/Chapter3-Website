#!/usr/bin/env python3
"""Chart and map data for /submarkets/myrtle-beach/, built only from files in this folder and RAW.
Run: RAW=<scratch> python3 -I charts.py <datadir>
Writes:
  chart-values.json      Zillow ZHVI for the city of Myrtle Beach, condos and single-family, monthly from 2019-01 (raw/zillow-zhvi-city-*.csv)
  chart-jobs.json        BLS QCEW private leisure and hospitality jobs in Horry County, by month (raw/qcew-*.csv)
  chart-str-months.json  AirROI average revenue per active Myrtle Beach listing by calendar month (raw/airroi-myrtle-beach.txt)
  chart-owners.json      Condos and houses inside the city: main home (4 percent rate) or not, owner's tax-bill address in SC or not (findings.json)
  map-str-zones.geojson  City of Myrtle Beach zoning areas grouped as: shaded on the city's visitor-accommodation map; R zone; planned development
                         not shaded; other district not shaded. Plus the city limits. Simplified (about 8 m)."""
import sys, os, json, csv, glob, re
from shapely.geometry import Polygon, mapping
from shapely.ops import unary_union
RAW = os.environ["RAW"]; DD = sys.argv[1]
def W(n, o): json.dump(o, open(os.path.join(DD, n), "w"), separators=(",", ":"))
# Zillow
vals = {}
for k in ("condo", "sfr"):
    r = list(csv.reader(open(os.path.join(DD, "raw", f"zillow-zhvi-city-{k}.csv"))))
    h = r[0]
    row = [x for x in r[1:] if x[2] == "Myrtle Beach"][0]
    vals[k] = [[h[i][:7], round(float(row[i]))] for i in range(8, len(h)) if row[i] and h[i] >= "2019-01"]
W("chart-values.json", {"source": "Zillow Research, ZHVI city files, middle tier, smoothed, seasonally adjusted; RegionName Myrtle Beach (RegionID 46666)",
                        "condo": vals["condo"], "single_family": vals["sfr"]})
# QCEW
jobs = []
for f in sorted(glob.glob(os.path.join(DD, "raw", "qcew-45051-*.csv"))):
    for r in csv.DictReader(open(f)):
        if r["own_code"] == "5" and r["industry_code"] == "1026":
            y, q = int(r["year"]), int(r["qtr"])
            for m in range(3):
                jobs.append([f"{y}-{3 * (q - 1) + m + 1:02d}", int(r[f"month{m + 1}_emplvl"])])
W("chart-jobs.json", {"source": "BLS QCEW, Horry County (45051), private, NAICS supersector 1026 Leisure and hospitality, monthly employment", "months": jobs})
# AirROI by calendar month
t = open(os.path.join(DD, "raw", "airroi-myrtle-beach.txt")).read()
t = re.sub(r"&\]:[^>]*>", "|", t)
i = t.find("Average monthly revenue per active listing in Myrtle Beach, by calendar month")
seg = t[i:i + 900]
months = re.findall(r"\|(January|February|March|April|May|June|July|August|September|October|November|December) \|[^|]+\|\$([\d,]+)", seg)
W("chart-str-months.json", {"source": "AirROI, Myrtle Beach market page, 'Revenue by month in Myrtle Beach in numbers' (each calendar month averaged over the past two years), page updated October 1, 2026",
                            "months": [[m, int(v.replace(",", ""))] for m, v in months]})
# Owners
F = json.load(open(os.path.join(DD, "findings.json")))["homes_in_city"]
W("chart-owners.json", {k: {"homes": F[k]["homes"], "main_home_4pct": F[k]["rate_4pct"], "rate_6pct": F[k]["rate_6pct"],
                            "tax_bill_outside_sc": F[k]["owner_mail_not_sc"]} for k in ("condo", "house")})
# Map
def zone_class(code, row):
    """R districts other than RMV: never (the city's text). RMV: always (the city's text). Others: shaded on the city's map,
    measured with about 60 m of tolerance for the image fit (share of the polygon 60 percent or more)."""
    share = row["pink_px_60m"] / row["px"] if row["px"] else 0
    if code == "RMV": return "str", share
    if code.startswith("R"): return "r_no", share
    if share >= 0.6: return "str", share
    return ("pud_no" if "PUD" in code else "other_no"), share
def esri(rings):
    o, h = [], []
    for r in rings:
        a = sum(r[i][0] * r[i + 1][1] - r[i + 1][0] * r[i][1] for i in range(len(r) - 1))
        (o if a < 0 else h).append(Polygon(r).buffer(0))
    g = unary_union(o); return g.difference(unary_union(h)) if h else g
zp = json.load(open(os.path.join(DD, "zone-pink.json")))["by_poly"]
groups = {"str": [], "r_no": [], "pud_no": [], "other_no": []}
for f, row in zip(json.load(open(os.path.join(RAW, "zoning.json"))), zp):
    code = (f["attributes"]["ZONING_DIS"] or "").strip(); cls, share = zone_class(code, row)
    groups[cls].append(esri(f["geometry"]["rings"]))
feats = []
label = {"str": "Nightly rentals allowed (shaded on the city's map)", "r_no": "R zone: no rentals under 90 days",
         "pud_no": "Planned development, not shaded", "other_no": "Other district, not shaded"}
for k, gs in groups.items():
    g = unary_union(gs).simplify(0.00008, preserve_topology=True)
    feats.append({"type": "Feature", "properties": {"class": k, "label": label[k]}, "geometry": mapping(g)})
city = unary_union([esri(f["geometry"]["rings"]) for f in json.load(open(os.path.join(RAW, "city.json")))]).simplify(0.00008, preserve_topology=True)
feats.append({"type": "Feature", "properties": {"class": "city_limits", "label": "City of Myrtle Beach"}, "geometry": mapping(city)})
def rnd(o):
    if isinstance(o, float): return round(o, 5)
    if isinstance(o, (list, tuple)): return [rnd(x) for x in o]
    if isinstance(o, dict): return {k: rnd(v) for k, v in o.items()}
    return o
W("map-str-zones.geojson", rnd({"type": "FeatureCollection", "features": feats}))
print({k: len(v) for k, v in groups.items()}, len(jobs), len(months), len(vals["condo"]))
