"""OSRM drive times (public router on OpenStreetMap roads, fastest route, free flow, no traffic, no stops) from one start point in each
of 13 places to five everyday destinations. Start points reuse the sibling town pages' own starts where they exist, so one drive has
one figure on the site:
  Little River: OSM place point (submarkets-little-river/pull_drives.py)   North Myrtle Beach: Main Street at Ocean Drive (submarkets-north-myrtle-beach)
  Conway: USGS GNIS point (submarkets-conway)   Surfside Beach: the pier (submarkets-surfside-beach)   Garden City: the pier (submarkets-garden-city)
  Murrells Inlet: the MarshWalk (submarkets-murrells-inlet)   Pawleys Island: Town Hall (submarkets-pawleys-island)
  Myrtle Beach: City Hall, 937 Broadway (OSM)   Loris: City Hall (OSM)   Aynor: Town Hall, 600 S Main St (OSM)
  Longs, Socastee, Carolina Forest: the OSM place point (place=village), read 2026-11-03.
Destinations: the nearest of ten ocean beach points (piers, Main Street's ocean end, the two state parks, OSM), the Myrtle Beach
boardwalk at Pier 14 (OSM), the airport terminal (sibling point), the nearest of five hospitals with an emergency room (points below), Coastal Grand Mall (OSM). Run: python3 -I pull_drives.py <datadir>. Writes drives.json."""
import sys, json, os, time, subprocess
D = sys.argv[1]
def get(url):
    for i in range(5):
        try: return json.loads(subprocess.run(["curl", "-sS", "-g", "-m", "60", "-A", "Mozilla/5.0", url], capture_output=True, text=True, check=True).stdout)
        except Exception as e: print("retry", e, file=sys.stderr); time.sleep(3 + 2 * i)
    raise SystemExit("failed " + url)
START = {  # north to south, inland places in between by latitude of their area
  "Loris": (-78.8896152, 34.0569178), "Aynor": (-79.2046552, 33.9984491), "Longs": (-78.7330522, 33.9385274),
  "Little River": (-78.6232583, 33.8727006), "Conway": (-79.047814, 33.836003), "North Myrtle Beach": (-78.6735286, 33.8211378),
  "Carolina Forest": (-78.9603912, 33.7602981), "Myrtle Beach": (-78.8817437, 33.6954656), "Socastee": (-78.9986488, 33.6830012),
  "Surfside Beach": (-78.9717534, 33.6049921), "Garden City": (-78.99795, 33.57690), "Murrells Inlet": (-79.03313, 33.55595),
  "Pawleys Island": (-79.12152664, 33.43324962)}
BEACH = {"Cherry Grove Pier": (-78.6326763, 33.8287315), "Main Street at Ocean Drive, North Myrtle Beach": (-78.6735286, 33.8211378),
  "Pier 14, Myrtle Beach": (-78.8747973, 33.6943277), "2nd Avenue Pier": (-78.8851010, 33.6833477), "Springmaid Pier": (-78.9170387, 33.6559793),
  "Myrtle Beach State Park": (-78.9311317, 33.6505854), "Surfside Beach Pier": (-78.9717534, 33.6049921), "Garden City Pier": (-78.9974040, 33.5760849),
  "Huntington Beach State Park entrance": (-79.07684, 33.50898), "Pawleys Island Town Hall": (-79.12152664, 33.43324962)}
# Hospital points: the ones the sibling town pages measured to (OSM), so a drive has one figure on the site; McLeod Loris from the
# Census geocoder (buyers-retirees/raw/geocodes.json), which no town page uses.
G = json.load(open(os.path.join(D, "../buyers-retirees/raw/geocodes.json")))
HOSP = {"Grand Strand Medical Center": (-78.81947, 33.75808), "Conway Medical Center": (-79.001894, 33.785483),
        "Tidelands Waccamaw Community Hospital": (-79.0433811, 33.5605964), "McLeod Health Seacoast": (-78.66371, 33.86573),
        "McLeod Health Loris": (G["McLeod Health Loris"]["lon"], G["McLeod Health Loris"]["lat"])}
ONE = {"Myrtle Beach boardwalk (Pier 14)": (-78.8747973, 33.6943277), "Myrtle Beach International Airport terminal": (-78.9227887, 33.6814671),
       "Coastal Grand Mall": (-78.9223169, 33.7027515)}
def drive(a, b):
    if abs(a[0] - b[0]) < 1e-6 and abs(a[1] - b[1]) < 1e-6: return 0.0, 0.0
    url = f"https://router.project-osrm.org/route/v1/driving/{a[0]},{a[1]};{b[0]},{b[1]}?overview=false"
    r = get(url)["routes"][0]; time.sleep(0.6)
    return round(r["duration"] / 60, 1), round(r["distance"] / 1609.344, 1)
out = {"method": "OSRM public router (router.project-osrm.org), fastest route, free flow, no traffic; minutes = duration / 60; miles by road",
       "pulled": time.strftime("%Y-%m-%d"), "starts": START, "beach_points": BEACH, "hospitals": HOSP, "rows": []}
for t, s in START.items():
    row = {"place": t}
    bm = min(((drive(s, p), n) for n, p in BEACH.items()), key=lambda x: x[0][0])
    row["beach"] = {"to": bm[1], "minutes": bm[0][0], "miles": bm[0][1]}
    hm = min(((drive(s, p), n) for n, p in HOSP.items()), key=lambda x: x[0][0])
    row["hospital"] = {"to": hm[1], "minutes": hm[0][0], "miles": hm[0][1]}
    for n, p in ONE.items():
        m, mi = drive(s, p); row[n] = {"minutes": m, "miles": mi}
    out["rows"].append(row); print(json.dumps(row), flush=True)
json.dump(out, open(os.path.join(D, "drives.json"), "w"), indent=1)
