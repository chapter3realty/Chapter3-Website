"""Where builders sold the most homes, community by community (fixer, review round 1, 2026-11-01).
Builder sales are the verified set from verify_build_deeds.py (5,108 deeds, company names only). The community is the
subdivision name written in each deed's memo ("LOT 12 SUB AUBERON WOODS PH 2"), with the phase, section and lot cut off.
That is the plat name in the county's records; a builder may sell the community under a longer or different name.
For each of the 10 communities with the most builder sales:
  sales, the builders that recorded them, the middle deed price (county deeds, not MLS), the middle point of the parcels,
  inside a city or not (county GIS layer 31 Municipalities, point in polygon on every parcel),
  the nearest numbered highway or parkway (county GIS layer 17 Highways),
  straight-line miles to the ocean (the coastline in Blog-Brain tools/geo/grand-strand-v2.json, Census TIGER/Line),
  open space, common area and amenity sites on the plat (county GIS layer 24, LegalDescr starting with the name).
Usage: python3 -I build_communities.py <this dir> [--fetch]   (--fetch reads layer 24 again; layers 17 and 31 are in raw/)
Writes findings-communities.json."""
import json, sys, os, re, math, statistics as st, collections, urllib.request, urllib.parse
DOC = __doc__
D = sys.argv[1]
src = open(os.path.join(D, "verify_build_deeds.py")).read().split("out = {")[0]
exec(src)  # defines b (builder deeds), P (parcels), k (all kept home sales)
NORM = [("HORTON", "D.R. Horton"), ("LENNAR", "Lennar"), (r"\bNVR\b", "NVR (Ryan Homes)"), ("PULTE", "Pulte"), ("MERITAGE", "Meritage"),
        ("CLAYTON PROPERTIES", "Clayton Properties"), ("GREAT SOUTHERN", "Great Southern Homes"), ("BEVERLY", "Beverly Homes"),
        ("BEAZER", "Beazer"), ("STARLIGHT", "Starlight Homes"), ("TOLL", "Toll Brothers"), ("DREAM FINDERS", "Dream Finders"),
        ("CHRIS MANNING", "Chris Manning"), ("CAROLINA COTTAGE", "Carolina Cottage Homes"), ("HOWELL", "Howell Homes")]
def builder(n):
    for pat, lab in NORM:
        if re.search(pat, n or ""): return lab
    return "other"
def sub(m):
    m = m or ""
    s = re.search(r"\bSUB (.+)$", m)
    if s: name = s.group(1)
    else:
        name = re.sub(r"^(LOT|UNIT|L)\s*[\w-]+\s*", "", m); name = re.sub(r"^TS [A-Z ]+", "", name).strip() or None
    if not name: return None
    name = re.sub(r"\b(PH(ASE)?|SEC(TION)?|SF|TR(ACT)?|BLK|BLOCK|POD|UNIT)\s*[\w-]*.*$", "", name).strip()
    name = re.sub(r"\s+(\d+[A-Z]?|[IVX]+)$", "", name).strip()
    return name.replace("CRESCENT COVE HAGUE MARINA", "CRESCENT COVE") or None
G = collections.defaultdict(list)
for d in b:
    nm = sub(d["Comments"])
    if nm: G[nm].append(d)
top = sorted(G.items(), key=lambda kv: -len(kv[1]))[:10]

# geometry helpers
def pip(x, y, ring):
    c = False; j = len(ring) - 1
    for i in range(len(ring)):
        xi, yi = ring[i]; xj, yj = ring[j]
        if (yi > y) != (yj > y) and x < (xj - xi) * (y - yi) / (yj - yi) + xi: c = not c
        j = i
    return c
def km(a, b):
    R = 6371; t = math.pi / 180; dl = (b[1] - a[1]) * t; do = (b[0] - a[0]) * t
    h = math.sin(dl / 2) ** 2 + math.cos(a[1] * t) * math.cos(b[1] * t) * math.sin(do / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))
def seg_km(p, a, b):
    cx = math.cos(p[1] * math.pi / 180); ax, ay, bx, by, px, py = a[0] * cx, a[1], b[0] * cx, b[1], p[0] * cx, p[1]
    dx, dy = bx - ax, by - ay; L = dx * dx + dy * dy
    t = 0 if L == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / L))
    return km(p, ((ax + t * dx) / cx, ay + t * dy))
MUNI = json.load(open(os.path.join(D, "raw", "county-municipalities.json")))["features"]
HWY = json.load(open(os.path.join(D, "raw", "county-highways.json")))["features"]
flat = json.load(open(os.path.join(os.environ.get("BB", "/home/user/Blog-Brain"), "tools", "geo", "grand-strand-v2.json")))["region"]["coast"]
coast = []; x = y = 0
for i in range(0, len(flat), 2):
    x += flat[i]; y += flat[i + 1]; coast.append((x / 1e4 - 80, y / 1e4 + 33))
def muni(lon, lat):
    for f in MUNI:
        nm = f["attributes"]["NAME"]
        if nm and any(pip(lon, lat, r) for r in f["geometry"]["rings"]): return nm
    return None
def highways(p):
    best = {}
    for f in HWY:
        a = f["attributes"]; nm = a["NAME"]
        if not nm: continue
        for path in f["geometry"]["paths"]:
            for i in range(len(path) - 1):
                dkm = seg_km(p, path[i], path[i + 1])
                if dkm < best.get(nm, 1e9): best[nm] = dkm
    return sorted(([n, round(v / 1.609, 1)] for n, v in best.items()), key=lambda r: r[1])[:3]

common_file = os.path.join(D, "raw", "community-plat-parcels.json")
if "--fetch" in sys.argv or not os.path.exists(common_file):
    CP = {}
    for name, _ in top:
        q = {"where": f"LegalDescr LIKE '{name}%'", "outFields": "PIN,LegalDescr,LandUseCode,Acreage", "returnGeometry": "false", "f": "json"}
        u = "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24/query?" + urllib.parse.urlencode(q)
        feats = json.load(urllib.request.urlopen(u, timeout=90)).get("features", [])
        CP[name] = [f["attributes"] for f in feats if re.search(r"OPEN SPACE|COMMON AREA|AMENIT|POOL|CLUB ?HOUSE|RECREATION|PARK\b|LAKE|POND", f["attributes"]["LegalDescr"] or "")]
    json.dump({"source": "Horry County GIS MapServer layer 24 (Parcels), LegalDescr starting with the community name", "communities": CP}, open(common_file, "w"), indent=1)
CP = json.load(open(common_file))["communities"]
# postal city of each builder-sold parcel (county GIS layer 22 Addresses; only the postal city is kept, no street or number)
addr_file = os.path.join(D, "raw", "community-postal-city.json")
if "--fetch" in sys.argv or not os.path.exists(addr_file):
    AC = {}
    for name, ds in top:
        pins = sorted(set(d["ParcelNumber"] for d in ds)); got = {}
        for i in range(0, len(pins), 100):
            q = {"where": "PIN IN (" + ",".join(pins[i:i + 100]) + ")", "outFields": "PIN,POSTAL_CITY", "returnGeometry": "false", "f": "json"}
            req = urllib.request.Request("https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/22/query", data=urllib.parse.urlencode(q).encode())
            for f in json.load(urllib.request.urlopen(req, timeout=90)).get("features", []):
                got[str(int(f["attributes"]["PIN"]))] = (f["attributes"]["POSTAL_CITY"] or "").strip().title()
        AC[name] = got
    json.dump({"source": "Horry County GIS MapServer layer 22 (Addresses), POSTAL_CITY by PIN", "communities": AC}, open(addr_file, "w"), indent=1)
AC = json.load(open(addr_file))["communities"]

out = {"note": DOC.split("\n")[0], "builder_sales": len(b), "with_a_community_name": sum(len(v) for v in G.values()),
       "communities_named": len(G), "top10_sales": sum(len(v) for _, v in top), "communities": []}
for name, ds in top:
    ps = [P[d["ParcelNumber"]] for d in ds if P[d["ParcelNumber"]].get("lat")]
    pts = [(p["lng"], p["lat"]) for p in ps]
    mid = (st.median(p[0] for p in pts), st.median(p[1] for p in pts))
    mc = collections.Counter(muni(*p) or "unincorporated" for p in pts)
    oc = min(km(mid, c) for c in coast) / 1.609
    cp = CP.get(name, [])
    out["communities"].append({
        "name": name, "sales": len(ds), "builders": collections.Counter(builder(d["DirectName"]) for d in ds).most_common(),
        "median_price": st.median(d["Consideration"] for d in ds),
        "price_quartiles": st.quantiles([d["Consideration"] for d in ds], n=4, method="inclusive"),
        "mid": [round(mid[0], 4), round(mid[1], 4)], "municipality": mc.most_common(),
        "nearest_highways_miles": highways(mid), "ocean_miles": round(oc, 1),
        "plat_open_space_common_acres": round(sum((a["Acreage"] or 0) for a in cp if re.search(r"OPEN SPACE|COMMON AREA", a["LegalDescr"] or "")), 1),
        "plat_amenity": [a["LegalDescr"] for a in cp if re.search(r"AMENIT|POOL|CLUB ?HOUSE|RECREATION", a["LegalDescr"] or "")],
        "postal_city": collections.Counter(AC.get(name, {}).get(d["ParcelNumber"]) or "no address yet" for d in ds).most_common(),
        "months": [min(d["mo"] for d in ds), max(d["mo"] for d in ds)],
    })
json.dump(out, open(os.path.join(D, "findings-communities.json"), "w"), indent=1)
for c in out["communities"]:
    print(c["sales"], c["name"], c["builders"][:3], c["median_price"], c["municipality"], c["nearest_highways_miles"], c["ocean_miles"], c["plat_open_space_common_acres"], c["plat_amenity"][:3], c["postal_city"][:3])
print({k: v for k, v in out.items() if k != "communities"})
