# Build data/towns.json: the home values the town cards on the homepage map show.
#   python3 design/homepage-v2/map/build_towns.py [zillow-city.csv zillow-zip.csv]
# With no arguments it downloads Zillow's two public files. Refresh it when Zillow publishes a new month (mid-month),
# then run node design/homepage-v2/map/towncards.js, which rewrites the pins in chapter3realty/index.html. The short-term
# rental figures on the same cards are not here: towncards.js reads them from data/str-market.json, the site's one source
# for them, so the cards always match the town pages.
#
# The figure is the Zillow Home Value Index (ZHVI): all homes, middle tier, smoothed and seasonally adjusted, which
# Zillow calls the typical home value. Zillow publishes it for seven of the nine towns. For the other two it publishes
# only the ZIP code: Carolina Forest lies wholly in ZIP 29579 (a third of the ZIP's land), and Garden City mostly in
# 29576, which it shares with Murrells Inlet (Census 2020 ZCTA to place relationship file). Their cards name the ZIP.
import csv, json, os, sys, urllib.request, datetime

HP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CITY_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
ZIP_URL = "https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv"
# slug: (Zillow region type, Zillow region name). Zillow names a ZIP region by its five digits.
TOWNS = {
    "pawleys-island": ("city", "Pawleys Island"),
    "murrells-inlet": ("city", "Murrells Inlet"),
    "garden-city": ("zip", "29576"),
    "surfside-beach": ("city", "Surfside Beach"),
    "myrtle-beach": ("city", "Myrtle Beach"),
    "carolina-forest": ("zip", "29579"),
    "conway": ("city", "Conway"),
    "north-myrtle-beach": ("city", "North Myrtle Beach"),
    "little-river": ("city", "Little River"),
}
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

def rows(path):
    with open(path, newline="") as f:
        r = csv.reader(f)
        head = next(r)
        for row in r:
            d = dict(zip(head, row))
            if d.get("State") == "SC": yield head, row, d

def fetch(url, path):
    if not os.path.exists(path):
        print("downloading", url)
        urllib.request.urlretrieve(url, path)
    return path

def main():
    tmp = os.environ.get("TMPDIR", "/tmp")
    city = sys.argv[1] if len(sys.argv) > 2 else fetch(CITY_URL, os.path.join(tmp, "zillow_zhvi_city.csv"))
    zips = sys.argv[2] if len(sys.argv) > 2 else fetch(ZIP_URL, os.path.join(tmp, "zillow_zhvi_zip.csv"))
    want = {(k, n) for k, n in TOWNS.values()}
    found = {}
    for kind, path in (("city", city), ("zip", zips)):
        for head, row, d in rows(path):
            key = (kind, d["RegionName"])
            if key in want:
                if key in found: raise SystemExit(f"two Zillow regions named {key}")
                found[key] = (head, row, d)
    out = {}
    last = None
    for slug, key in TOWNS.items():
        if key not in found: raise SystemExit(f"Zillow has no {key[0]} region {key[1]}")
        head, row, d = found[key]
        cols = [c for c in head if c[:2] == "20" and len(c) == 10]
        end = max(c for c in cols if row[head.index(c)])
        last = last or end
        if end != last: raise SystemExit(f"{slug}: Zillow's latest month is {end}, the others' {last}")
        y, m = int(end[:4]), int(end[5:7])
        at = lambda yy, mm: next(c for c in cols if c.startswith(f"{yy:04d}-{mm:02d}"))
        val = lambda c: float(row[head.index(c)])
        v, v1, v10 = val(end), val(at(y - 1, m)), val(at(y - 10, m))
        # ten years, one point a quarter, ending on the latest month
        series = []
        for q in range(40, -1, -1):
            mm = m - 3 * q
            yy = y + (mm - 1) // 12
            mm = (mm - 1) % 12 + 1
            series.append(round(val(at(yy, mm))))
        out[slug] = {
            "region": {"type": key[0], "name": key[1], "id": d["RegionID"]},
            "value": round(v), "yoy": round(100 * (v - v1) / v1, 1), "tenYear": round(100 * (v - v10) / v10),
            "start": round(v10), "series": series,
        }
    y, m = int(last[:4]), int(last[5:7])
    doc = {
        "note": ("Home values for the town cards on the homepage map, from map/build_towns.py. value is the Zillow Home Value "
                 "Index for the latest month (all homes, middle tier, smoothed, seasonally adjusted); yoy its change over twelve "
                 "months and tenYear over ten years, in percent; series one value a quarter for the ten years to the latest month. "
                 "A region of type zip is the ZIP code, named on the card."),
        "source": "Zillow Home Value Index",
        "sourceUrl": "https://www.zillow.com/research/data/",
        "month": f"{y:04d}-{m:02d}",
        "monthName": f"{MONTHS[m - 1]} {y}",
        "startName": f"{MONTHS[m - 1]} {y - 10}",
        "retrieved": datetime.date.today().isoformat(),
        "towns": out,
    }
    path = os.path.join(HP, "data", "towns.json")
    with open(path, "w") as f: json.dump(doc, f, indent=1)
    for slug, t in out.items():
        print(f"{slug:20s} {t['region']['type']:4s} {t['region']['name']:20s} ${t['value']:>9,}  {t['yoy']:+.1f}% 1y  {t['tenYear']:+d}% 10y")
    print("wrote", os.path.relpath(path, os.path.dirname(os.path.dirname(HP))), "for", doc["monthName"])

main()
