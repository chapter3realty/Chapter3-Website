"""Count Horry County address points by town limits, mailing city and evacuation zone.
Usage: python3 -I analyze_addresses.py <layers_dir> <out_json>"""
import json, sys, collections
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
L, OUT = sys.argv[1], sys.argv[2]
mun = [(f["properties"]["NAME"], shape(f["geometry"]).buffer(0)) for f in json.load(open(L + "/municipalities.geojson"))["features"]]
ev = [(f["properties"]["Zone"], shape(f["geometry"]).buffer(0)) for f in json.load(open(L + "/evac-zones.geojson"))["features"]]
def finder(items):
    geoms = [g for _, g in items]; tree = STRtree(geoms)
    def f(p):
        return [items[i][0] for i in tree.query(p) if geoms[i].contains(p)]
    return f
fm, fe = finder(mun), finder(ev)
total = 0; town = collections.Counter(); zone = collections.Counter(); type_ = collections.Counter()
mail_vs_town = collections.Counter(); nogeom = 0
import gzip
for line in gzip.open(L + "/addresspoints.jsonl.gz", "rt"):
    a = json.loads(line)
    if a["x"] is None: nogeom += 1; continue
    total += 1; p = Point(a["x"], a["y"])
    t = fm(p); t = t[0] if t else "UNINCORPORATED"
    z = fe(p); z = z[0] if z else "none"
    town[t] += 1; zone[z] += 1; type_[a["type"]] += 1
    mail_vs_town[((a["city"] or "").strip().upper(), t)] += 1
mail = collections.defaultdict(dict)
for (c, t), n in mail_vs_town.items(): mail[c][t] = n
res = {"source": "Horry County OpenData AddressPoints, Municipalities, EvacuationZones_Horry (gisportal.horrycounty.org), read 2026-11-13",
       "address_points_with_location": total, "no_location": nogeom, "municipality_names": [m for m, _ in mun],
       "by_town_limits": dict(town.most_common()), "by_evac_zone": dict(zone.most_common()), "by_point_type": dict(type_),
       "mailing_city_vs_town_limits": {c: dict(sorted(v.items(), key=lambda kv: -kv[1])) for c, v in sorted(mail.items(), key=lambda kv: -sum(kv[1].values()))}}
json.dump(res, open(OUT, "w"), indent=1)
print(json.dumps({k: res[k] for k in ["address_points_with_location", "no_location", "municipality_names", "by_town_limits", "by_evac_zone", "by_point_type"]}, indent=1))
for c in ["MYRTLE BEACH", "NORTH MYRTLE BEACH", "CONWAY", "SURFSIDE BEACH", "LITTLE RIVER", "MURRELLS INLET", "LORIS", "AYNOR", "LONGS", "GALIVANTS FERRY"]:
    v = res["mailing_city_vs_town_limits"].get(c, {}); s = sum(v.values()); print(c, s, v)
