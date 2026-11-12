"""The nine towns' homes-strip places for /submarkets/ (fix round 1, 2026-11-10).

Copies the town-<slug> "near" searches that /buyers/relocating/which-town/ already uses from the CRM place
catalog (Blog-Brain batches/2026-10-b/data/idx-places.json) and checks each against the website's
idx-lib/places.js, so the hub's map links run the same search as its strips. Writes homes-places.json.
Run from anywhere: python3 homes_places.py [<Blog-Brain root>]"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
BB = sys.argv[1] if len(sys.argv) > 1 else "/home/user/Blog-Brain"
SITE = os.path.normpath(os.path.join(HERE, "..", "..", ".."))
SLUGS = {"little-river": "town-little-river", "north-myrtle-beach": "town-north-myrtle-beach", "myrtle-beach": "town-myrtle-beach",
         "surfside-beach": "town-surfside-beach", "garden-city": "town-garden-city", "murrells-inlet": "town-murrells-inlet",
         "pawleys-island": "town-pawleys-litchfield", "carolina-forest": "town-carolina-forest", "conway": "town-conway"}
cat = {p["slug"]: p for p in json.load(open(os.path.join(BB, "batches", "2026-10-b", "data", "idx-places.json")))["places"]}
edge = open(os.path.join(SITE, "idx-lib", "places.js")).read()
out, bad = [], []
for town, slug in SLUGS.items():
    p = cat.get(slug)
    if not p: bad.append(f"{slug} is not in idx-places.json"); continue
    m = re.search(r'"%s":\s*\{\s*"name":\s*"([^"]+)",\s*"q":\s*\{\s*"near":\s*"([^"]+)",\s*"miles":\s*([\d.]+)' % re.escape(slug), edge)
    if not m: bad.append(f"{slug} is not in idx-lib/places.js"); continue
    if (m.group(1), m.group(2), float(m.group(3))) != (p["name"], p["q"]["near"], float(p["q"]["miles"])):
        bad.append(f"{slug}: idx-lib/places.js and idx-places.json differ")
    out.append({"town": town, "slug": slug, "name": p["name"], "near": p["q"]["near"], "miles": p["q"]["miles"]})
json.dump({"made_by": "homes_places.py", "note": "The CRM place for each town's homes strip on /submarkets/; the same search as which-town's entry.",
           "places": out}, open(os.path.join(HERE, "homes-places.json"), "w"), indent=1)
if bad: print(*bad, sep="\n"); sys.exit(1)
print("nine places, each in the catalog and at the edge")
