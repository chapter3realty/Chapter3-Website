"""Census ACS tables for /invest/rent-prices/, through the data.census.gov access endpoint (api.census.gov needs a key).
Run: python3 -I pull_acs.py <datadir>. Writes raw/acs/<table>-<geo>.json (the endpoint's own response) and acs.json (estimates and margins).
Tables: B25031 median gross rent by bedrooms; B25064 median gross rent; B25058 median contract rent; B25003 tenure;
B25032 tenure by units in structure; B25063 gross rent distribution; B25070 gross rent as a share of income; B25004 vacancy status.
Geographies: Grand Strand ZCTAs, four cities and eight census-designated places (Carolina Forest, Socastee and others), Horry County, the metro, SC and the US (2020-2024 5-year);
Horry County and the metro by year (1-year, 2012-2024; 2020 has no standard 1-year release)."""
import json, os, sys, time, urllib.request
D = sys.argv[1]; RAW = os.path.join(D, "raw", "acs"); os.makedirs(RAW, exist_ok=True)
ZCTAS = ["29511","29526","29527","29544","29545","29566","29568","29569","29572","29575","29576","29577","29579","29581","29582","29585","29588"]
# Place codes from TIGERweb (Places_CouSub_ConCity_SubMCD layers 4 and 5, state 45).
PLACES = {"Myrtle Beach city": "160XX00US4549075", "North Myrtle Beach city": "160XX00US4551280", "Conway city": "160XX00US4516405",
          "Surfside Beach town": "160XX00US4570585", "Carolina Forest CDP": "160XX00US4511833", "Socastee CDP": "160XX00US4567390",
          "Forestbrook CDP": "160XX00US4526372", "Red Hill CDP": "160XX00US4559190", "Murrells Inlet CDP": "160XX00US4548985",
          "Garden City CDP": "160XX00US4528455", "Little River CDP": "160XX00US4542010", "Bucksport CDP": "160XX00US4510000"}
GEOS = {**{"ZCTA " + z: "860Z200US" + z for z in ZCTAS}, **PLACES, "Horry County": "050XX00US45051", "Myrtle Beach metro": "310XX00US34820", "South Carolina": "040XX00US45", "United States": "010XX00US"}
def get(tid, g):
    f = os.path.join(RAW, f"{tid}-{g}.json")
    if os.path.exists(f) and os.path.getsize(f) > 100: return json.load(open(f))
    url = f"https://data.census.gov/api/access/data/table?id={tid}&g={g}"
    for i in range(4):
        try:
            b = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=120).read()
            d = json.loads(b); open(f, "wb").write(b); return d
        except Exception as e:
            err = e; time.sleep(4)
    print("FAILED", url, err, flush=True); return None
def rows(d):
    if not d: return None
    h, v = d["response"]["data"][0], d["response"]["data"][1]
    return dict(zip(h, v))
out = {"source": "U.S. Census Bureau, American Community Survey, via https://data.census.gov/api/access/data/table", "five_year": {}, "one_year": {}}
for t in ["B25031", "B25064", "B25058", "B25003", "B25032", "B25063", "B25070", "B25004"]:
    for name, g in GEOS.items():
        r = rows(get(f"ACSDT5Y2024.{t}", g))
        if r: out["five_year"].setdefault(name, {"geo": g}).update({k: v for k, v in r.items() if k.startswith(t)})
        print("5y", t, name, "ok" if r else "none", flush=True)
for y in [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2021, 2022, 2023, 2024]:
    for t in ["B25031", "B25064"]:
        for name, g in [("Horry County", "050XX00US45051"), ("Myrtle Beach metro", "310XX00US34820")]:
            r = rows(get(f"ACSDT1Y{y}.{t}", g))
            if r: out["one_year"].setdefault(str(y), {}).setdefault(name, {}).update({k: v for k, v in r.items() if k.startswith(t)})
            print("1y", y, t, name, "ok" if r else "none", flush=True)
json.dump(out, open(os.path.join(D, "acs.json"), "w"), indent=1)
