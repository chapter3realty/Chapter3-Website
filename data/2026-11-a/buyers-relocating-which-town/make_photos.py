# Writes photos.json for /buyers/relocating/which-town/ (batch 2026-11-a): three new USDA NAIP 2023 aerials
# (Loris, Aynor, the Socastee swing bridge), exported from The National Map's NAIP image service with the
# requests in naip-requests.json, plus the licence records of ten photos already on sibling pages, copied
# unchanged (each keeps its own file path and its "slug"; "reused_on" names this page).
# Run from the website root: python3 -I data/2026-11-a/buyers-relocating-which-town/make_photos.py <dir with loris-lots.jpg, aynor.jpg, socastee-bridge.jpg>
# Fix round 1 (2026-11-04): the Loris frame is now houses on big lots outside town (loris-lots), not downtown.
# Every frame was looked at full size by the writer on 2026-11-04.
import json, os, sys
from PIL import Image
DL = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
SLUG = "buyers-relocating-which-town"
B = f"images/2026-11-a/{SLUG}/"
REQ = json.load(open(os.path.join(HERE, "naip-requests.json")))

REUSE = {
 "invest-where-to-buy": ["longs-new-subdivision-from-above", "carolina-forest-houses-and-woods-from-above"],
 "submarkets-little-river": ["little-river-harbours-from-above"],
 "submarkets-conway": ["conway-older-house-and-oak"],
 "submarkets-north-myrtle-beach": ["cherry-grove-channels-from-above"],
 "submarkets-myrtle-beach": ["market-common-valor-park"],
 "submarkets-surfside-beach": ["surfside-beach-pier-from-above-2026"],
 "submarkets-garden-city": ["garden-city-beach-and-marsh-from-the-ocean-2011"],
 "submarkets-murrells-inlet": ["murrells-inlet-creek-front-docks-from-above"],
 "submarkets-pawleys-island": ["pawleys-island-north-end"],
}
# Three sibling files carry no embedded licence metadata (tools/image-meta.js, S13). Rather than change a
# sibling's files, this page copies them into its own folder, where photos.js embed writes the metadata.
COPY = {"longs-new-subdivision-from-above", "carolina-forest-houses-and-woods-from-above", "pawleys-island-north-end"}
import shutil
out = []
for sib, names in REUSE.items():
  recs = json.load(open(os.path.join(HERE, "..", sib, "photos.json")))["photos"]
  for n in names:
    hit = [r for r in recs if os.path.basename(r["file"]).startswith(n)]
    assert len(hit) == 1, (sib, n, len(hit))
    r = json.loads(json.dumps(hit[0])); r["reused_on"] = "/buyers/relocating/which-town/ (licence record copied from data/2026-11-a/%s/photos.json)" % sib
    # Fix round 1: every aerial badge on this page names its year, as the NAIP frames made here do.
    if r.get("display_credit") == "U.S. government aerial photo" and r.get("taken"):
      r["display_credit"] += ", " + r["taken"][:4]
    if n in COPY:
      for k in ("600", "1200"):
        src = r["variants"][k]; dst = B + n + ("-600w.webp" if k == "600" else "-1200w.webp")
        shutil.copyfile(os.path.join(WEB, "chapter3realty", src), os.path.join(WEB, "chapter3realty", dst)); r["variants"][k] = dst
      r["file"] = B + n + ".webp"
      shutil.copyfile(os.path.join(WEB, "chapter3realty", r["variants"]["1200"]), os.path.join(WEB, "chapter3realty", r["file"]))
      r["slug"] = SLUG
      r["reused_on"] += "; files copied into this page's folder so their embedded metadata could be written without changing the sibling's files"
    out.append(r)

NAIP = [
 ("loris-lots", "loris-houses-on-big-lots-from-above", (0, 0, 2000, 1500), False,
  "Houses on big lots outside Loris, from above",
  "Straight down on the country northwest of the City of Loris on 2023 NAIP imagery: two country roads meet at a corner; along them, about thirty houses and manufactured homes sit on wide grassy lots with sheds, gardens and gravel drives; plowed farm fields across the road on the right and at the top; pine woods and a wet hollow at the lower left.",
  "Outside Loris: houses on wide lots along two country roads, with sheds, gardens and farm fields across the road.",
  "Aerial photo of houses and manufactured homes on wide grassy lots along two country roads outside Loris, with sheds, plowed farm fields and pine woods",
  {"city": "Loris", "sublocation": "Unincorporated Horry County, about 3 km northwest of the City of Loris (ZIP code area 29569)"}),
 ("aynor", "aynor-town-and-fields-from-above", (0, 0, 2000, 1500), False,
  "Aynor and the farm fields beside it, from above",
  "Straight down on Aynor on 2023 NAIP imagery: on the right, the town's grid of streets with houses on large grassy lots, a few shops, a ball field and a water tower; down the middle, a four-lane highway; on the left, plowed farm fields and pine woods.",
  "Aynor from above: houses on big lots along the town's grid of streets, and farm fields and woods across the highway.",
  "Aerial photo of Aynor with houses on large grassy lots along a grid of streets on the right, a highway in the middle and plowed farm fields and woods on the left",
  {"city": "Aynor", "sublocation": "Town of Aynor and the land west of it (ZIP code area 29511)"}),
 ("socastee-bridge", "socastee-swing-bridge-from-above", (0, 0, 2000, 1500), True,
  "The old Socastee swing bridge, from above",
  "Straight down on the Intracoastal Waterway at Socastee on 2023 NAIP imagery: the old steel truss swing bridge, painted blue, carries a two-lane road across the waterway in the middle; a newer four-lane highway bridge crosses at the lower left; houses on a curving street at the upper left, woods along both banks, a small dock and boat landing below the old bridge.",
  "The old Socastee swing bridge, the blue steel span, on the Intracoastal Waterway, with the newer highway bridge at the lower left.",
  "Aerial photo of a blue steel truss swing bridge carrying a two-lane road over the Intracoastal Waterway at Socastee, with a newer four-lane bridge at the lower left and houses at the upper left",
  {"city": "Myrtle Beach", "sublocation": "Old Socastee Swing Span (S-616, old SC 544), Socastee"}),
]

CENTRE = {
 "loris-lots": "a point chosen from the county parcel points of the Loris area where most house lots are an acre or more (fix round 1, 2026-11-04: the owner's reviewer asked for a frame that shows the land, not downtown)",
 "aynor": "the OpenStreetMap point of Aynor Town Hall (Nominatim, read 2026-11-04)",
 "socastee-bridge": "the OpenStreetMap point of the Socastee Swing Bridge (way 24818207) (Nominatim, read 2026-11-04)",
}

def save(src, box, name, crops):
  im = Image.open(src).convert("RGB").crop(box)
  w, h = im.size
  big = im.resize((1200, round(1200 * h / w)), Image.LANCZOS)
  d = os.path.join(WEB, "chapter3realty", B)
  for f, i in ((name + ".webp", big), (name + "-1200w.webp", big), (name + "-600w.webp", im.resize((600, round(600 * h / w)), Image.LANCZOS))):
    i.save(os.path.join(d, f), "WEBP", quality=82, method=6)
  c = {}
  if crops:
    for k, (rw, rh) in (("1x1", (1, 1)), ("4x3", (4, 3)), ("16x9", (16, 9))):
      cw = min(w, round(h * rw / rh)); ch = round(cw * rh / rw)
      x0 = (w - cw) // 2; y0 = (h - ch) // 2
      cr = im.crop((x0, y0, x0 + cw, y0 + ch)).resize((1200, round(1200 * rh / rw)), Image.LANCZOS)
      p = B + f"{name}-{k}.webp"; cr.save(os.path.join(WEB, "chapter3realty", p), "WEBP", quality=82, method=6)
      c[k] = {"path": p, "width": cr.size[0], "height": cr.size[1]}
  return big.size, c

for key, name, box, crops, title, what, cap, alt, place in NAIP:
  (w, h), c = save(os.path.join(DL, key + ".jpg"), box, name, crops)
  q = REQ[key]
  r = {"slug": SLUG, "file": B + name + ".webp",
   "variants": {"600": B + name + "-600w.webp", "1200": B + name + "-1200w.webp"}, "width": w, "height": h,
   "title": title, "what": what, "caption": cap, "alt": alt, "place": place,
   "source": "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer",
   "source_name": "The National Map (USGS)", "author": "USDA Farm Service Agency, NAIP", "author_type": "Organization",
   "license": "Public domain", "license_url": "https://www.fsa.usda.gov/help/policies-and-links/",
   "provenance": f"U.S. government aerial photo: USDA National Agriculture Imagery Program (NAIP), South Carolina 2023, natural color, 60 cm. Exported by Chapter3 from the USGS National Map NAIP image service (exportImage, Web Mercator, cubic resampling, mosaic locked to Year=2023) on 2026-11-04, a {q['width_m']} by {q['height_m']} m window centred on {q['lat']} N, {-q['lon']} W; the exact request is in source_request.",
   "license_note": "Same source and terms as the NAIP records of /invest/where-to-buy/ in this batch: The National Map offers \"free downloads of public domain, NAIP compressed orthoimagery\"; the USDA FSA policy page says public domain information \"may be freely distributed or copied, but use of appropriate byline/photo/image credits is requested.\"",
   "terms_urls": ["https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer", "https://www.fsa.usda.gov/help/policies-and-links/"],
   "taken": "2023", "display_credit": "U.S. government aerial photo, 2023",
   "credit": "Photo: USDA Farm Service Agency, NAIP, public domain, via The National Map (USGS).",
   "digital_source_type": "digitalCapture",
   "subject_check": f"Looked at full size (2000 x 1500) by the writer on 2026-11-04. Window centred on {CENTRE[key]}. No label is drawn; the caption names no business, street or subdivision. No person, plate or sign is readable at 60 cm.",
   "source_request": q["request"]}
  if c: r["crops"] = c
  out.append(r)
json.dump({"photos": out}, open(os.path.join(HERE, "photos.json"), "w"), indent=1)
print(len(out))
