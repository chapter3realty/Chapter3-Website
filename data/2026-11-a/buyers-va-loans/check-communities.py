"""The VA-listed condo communities the page names, checked one by one (fix round 1, 2026-11-02).
For each, the VA record (name and street, from raw/va-condos-HORRY-approved-true.json) is compared with the
streets of the condos for sale that the CRM's map API matches to the name (type=condo&subdivision=...).
A community is kept only when at least 8 in 10 of its listings (and at least 3) are on the VA record's street (or, when the record gives only a
PO box or no street, on a street in the community's own name). Then the middle point of its listings is
looked up in the Census geocoder for its Census place (a city, a town or a CDP such as Carolina Forest); a
point outside every place gets none, and the page then names the mailing town.
Aggregate only: the count for sale, how many are marked VA, the price range and the bedroom range.
Street names are kept as evidence; no house number or address is kept.
Run: python3 -I check-communities.py <datadir>. Writes communities-checked.json."""
import json, sys, time, re, statistics, collections, urllib.request, urllib.parse, datetime
d = sys.argv[1] if len(sys.argv) > 1 else "."
UA = {"User-Agent": "Mozilla/5.0"}
def get(url):
    for i in range(3):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60))
        except Exception:
            time.sleep(2)
    return None
# name on the page, subdivision query, the VA record's first line, the street the listings must be on
SELECT = [
    ("Magnolia Pointe", "magnolia pointe", "MAGNOLIA POINTE", ["Luster Leaf", "Magnolia Lake", "Magnolia Point"]),
    ("Magnolia North", "magnolia north", "MAGNOLIA NORTH", ["Dahlia", "Dahila", "Carnation", "Orchid"]),
    ("Windsor Green", "windsor green", "WINDSOR GREEN CONDOMINIUM", ["Windsor Green"]),
    ("The Village at Queens Harbour", "the village at queens harbour", "THE VILLAGE AT QUEENS HARBOUR", ["Ella Kinley", "Shelby Lawson"]),
    ("Shorewood", "shorewood", "SHOREWOOD CONDO", ["Old Bryan"]),
    ("Seagate Village", "seagate village", "SEAGATE VILLAGE", None),
    ("Monterey Bay Suites", "monterey bay suites resort", "MONTEREY BAY SUITES RESORT", ["Ocean Blvd"]),
    ("The Havens at Barefoot", "the havens", "THE HAVENS", ["Catalina"]),
    ("Edgewater", "edgewater", "EDGEWATER", ["Waterview"]),
    ("Carolina Keyes", "carolina keyes", "CAROLINA KEYES", ["West Port", "W Port"]),
    ("Carolina Yacht Landing", "carolina yacht landing", "CAROLINA YACHT LANDING", ["Plantation Harbour", "Harbour Ct", "Waypoint Ridge"]),
    ("Southbridge", "southbridge", "SOUTHBRIDGE", ["Southbridge", "South Bridge", "Essex", "Andover", "Hopkins", "Huntingdon"]),
    ("Park West", "park west", "PARK WEST HOMEOWNERS ASSOCIATI", ["Chenoa", "Bunting"]),
    ("Myrtle Greens", "myrtle greens", "MYRTLE GREENS CONDOMIMIUMS", ["Myrtle Greens"]),
    ("Tullamore Lakes", "tullamore lakes", "TULLAMORE LAKES", ["South Shore", "S Shore"]),
]
recs = json.load(open(f"{d}/raw/va-condos-HORRY-approved-true.json"))
out = []
for name, q, first, streets in SELECT:
    va = [r for r in recs if r["firstLineName"] == first]
    assert va, first
    j = get("https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode({"type": "condo", "subdivision": q}))
    jv = get("https://chapter3realty.com/homes/api/map?" + urllib.parse.urlencode({"type": "condo", "subdivision": q, "has": "va_accepted"}))
    pins = j["pins"]
    st = collections.Counter(re.sub(r"^[\d\-A-Za-z]*\d[\d\-A-Za-z]*\s+", "", p["addr"].split(",")[0]).strip() for p in pins)
    on = sum(c for s, c in st.items() if streets is None or any(k.lower() in s.lower() for k in streets))
    prices = sorted(int(re.sub(r"\D", "", p["price"])) for p in pins)
    beds = sorted(p["beds"] for p in pins if isinstance(p.get("beds"), (int, float)))
    lat, lng = statistics.median(p["lat"] for p in pins), statistics.median(p["lng"] for p in pins)
    g = get("https://geocoding.geo.census.gov/geocoder/geographies/coordinates?" + urllib.parse.urlencode(
        {"x": lng, "y": lat, "benchmark": "Public_AR_Current", "vintage": "Current_Current", "layers": "Incorporated Places,Census Designated Places", "format": "json"}))
    geo = (g or {}).get("result", {}).get("geographies", {})
    place = [x["NAME"] for k in ("Incorporated Places", "Census Designated Places") for x in geo.get(k, [])]
    out.append({"name": name, "query": j.get("params"), "va_record": [{"firstLineName": r["firstLineName"], "street": r["secondLineName"], "city": r["city"], "status": r["dispositionCode"]} for r in va],
                "for_sale": j.get("total"), "va_marked": (jv or {}).get("total"), "listing_streets": dict(st), "on_record_street": on,
                "kept": on >= max(3, 0.8 * len(pins)),
                "price_min": prices[0], "price_max": prices[-1], "price_median": statistics.median(prices),
                "beds_min": beds[0] if beds else None, "beds_max": beds[-1] if beds else None,
                "census_place": place, "refreshedAt": (j.get("meta") or {}).get("refreshedAt")})
    print(name, j.get("total"), on, place, prices[0], prices[-1], flush=True)
    time.sleep(.3)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "method": __doc__, "rows": out}, open(f"{d}/communities-checked.json", "w"), indent=1)
