# Review round 1 (2026-11-03): six more photos, one for each entry that had none, and plain captions.
# Run from the website root: python3 data/2026-11-a/invest-where-to-buy/make_photos_r1.py <dir with the downloads>
#  - Five NAIP 2023 aerials (USDA Farm Service Agency, public domain) exported from The National Map's NAIP image
#    service; the exact request for each is in naip-requests.json (copied here as source_request).
#  - One Wikimedia Commons photo released to the public domain by its author (Pubdog, 2010), Conway.
#  - The five USGS 2011 captions lose "seen from a plane in 2011" (owner, 2026-10-11: photo years only in the
#    credits). The year moves to each photo's credit line ("USGS photo, 2011"). The per-photo "changes" note is
#    dropped, so the credits keep the one shared line about resizing and cropping.
# Every frame was looked at full size by the fixer on 2026-11-03.
import json, os, sys
from PIL import Image
DL = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.abspath(os.path.join(HERE, "..", "..", ".."))
B = "images/2026-11-a/invest-where-to-buy/"
P = json.load(open(os.path.join(HERE, "photos.json")))
REQ = json.load(open(os.path.join(DL, "naip-requests.json")))

CAP = {
 "north-myrtle-beach-towers-and-houses-2011": "Condo towers and beach houses on the same oceanfront block in North Myrtle Beach.",
 "surfside-beach-pier-and-houses-2011": "The pier and rows of raised beach houses in Surfside Beach.",
 "garden-city-pier-and-beach-road-2011": "Condo buildings and houses on the strip between the ocean and the marsh at Garden City.",
 "litchfield-beach-houses-and-condos-2011": "Beach houses and low condo buildings at Litchfield Beach, with docks across the marsh.",
 "myrtle-beach-oceanfront-towers-2011": "Oceanfront towers in Myrtle Beach. Three in four condos in the city are in a zone marked for nightly rentals.",
}
keep = []
for r in P["photos"]:
  n = os.path.basename(r["file"])[:-5]
  if n in CAP:
    r["caption"] = CAP[n]; r["display_credit"] = "USGS photo, 2011"; r.pop("changes", None)
    keep.append(r)

NAIP = [
 ("longs", "longs-new-subdivision-from-above", (0, 0, 2000, 1500),
  "A new subdivision going up in Longs, from above",
  "Straight down on a new subdivision in Longs (ZIP 29568) on 2023 NAIP imagery: new streets and three storm ponds cut into bare sand, houses finished or framed along two streets, most lots still empty, a four-lane highway on the left, older houses on large lots and farm fields around it.",
  "A new subdivision going up beside farm fields in Longs: streets and ponds dug, some houses built or framed, and most lots still empty.",
  "Aerial photo of a new subdivision in Longs with streets and ponds cut into bare ground, a few rows of new houses, empty lots, and farm fields and woods around it",
  {"city": "Longs", "sublocation": "A subdivision east of a four-lane highway, ZIP code area 29568, outside North Myrtle Beach"}),
 ("socastee", "socastee-subdivision-from-above", (0, 0, 2000, 1500),
  "A subdivision of houses in Socastee, from above",
  "Straight down on Socastee on 2023 NAIP imagery: a subdivision of similar houses on curving streets around a pond, a pool and clubhouse at its entrance, older houses on wooded lots across the road, a highway on a long bridge on the right with land being cleared beside it, and woods and dark water along the bottom.",
  "A subdivision of similar houses around a pond in Socastee, with older houses on wooded lots across the road and a highway bridge on the right.",
  "Aerial photo of rows of similar houses on curving streets around a pond in Socastee, older houses on wooded lots above them and a highway on a bridge at the right",
  {"city": "Myrtle Beach", "sublocation": "Socastee Census designated place"}),
 ("little-river", "little-river-houses-and-ponds-from-above", (0, 0, 2000, 1500),
  "Houses around ponds in Little River, from above",
  "Straight down on Little River on 2023 NAIP imagery: subdivisions of houses on curving streets around ponds in the upper left, older houses under trees in the middle right, larger multi-unit buildings with parking lots in the lower left, and woods between them.",
  "Houses on curving streets around ponds in Little River, with larger buildings and their parking lots at the lower left.",
  "Aerial photo of houses on curving streets around ponds in Little River, with larger buildings and parking lots at the lower left and woods between",
  {"city": "Little River", "sublocation": "Little River Census designated place"}),
 ("carolina-forest", "carolina-forest-houses-and-woods-from-above", (0, 0, 2000, 1500),
  "A subdivision of houses in Carolina Forest, from above",
  "Straight down on Carolina Forest on 2023 NAIP imagery: houses on streets that end in cul-de-sacs, two ponds, thick pine woods around them, a power line cleared through the woods at the top, and land being cleared for new streets on the right.",
  "Houses on streets that end in cul-de-sacs in Carolina Forest, with woods around them and land being cleared for more on the right.",
  "Aerial photo of a subdivision of houses on cul-de-sac streets in Carolina Forest, with ponds, thick woods around it and cleared land on the right",
  {"city": "Myrtle Beach", "sublocation": "Carolina Forest Census designated place"}),
 ("murrells-inlet", "murrells-inlet-georgetown-side-from-above", (0, 0, 2000, 1125),
  "Murrells Inlet on the Georgetown County side, from above",
  "Straight down on the Georgetown County side of Murrells Inlet on 2023 NAIP imagery, south of the county line: a subdivision of houses on curving streets with a pond at the top, and below it older houses on larger wooded lots, a pond and long storage buildings by a road on the right.",
  "A subdivision on the Georgetown County side of Murrells Inlet, with older houses on larger wooded lots below it.",
  "Aerial photo of a subdivision of houses on curving streets on the Georgetown County side of Murrells Inlet, with houses on larger wooded lots below it",
  {"city": "Murrells Inlet", "sublocation": "Murrells Inlet Census designated place, Georgetown County"}),
]

def save(src, box, name):
  im = Image.open(src).convert("RGB").crop(box)
  w, h = im.size
  big = im.resize((1200, round(1200 * h / w)), Image.LANCZOS)
  for f, i in ((name + ".webp", big), (name + "-1200w.webp", big), (name + "-600w.webp", im.resize((600, round(600 * h / w)), Image.LANCZOS))):
    i.save(os.path.join(WEB, "chapter3realty", B, f), "WEBP", quality=82, method=6)
  return big.size

for key, name, box, title, what, cap, alt, place in NAIP:
  w, h = save(os.path.join(DL, key + ".jpg"), box, name)
  q = REQ[key]
  keep.append({"slug": "invest-where-to-buy", "file": B + name + ".webp",
   "variants": {"600": B + name + "-600w.webp", "1200": B + name + "-1200w.webp"}, "width": w, "height": h,
   "title": title, "what": what, "caption": cap, "alt": alt, "place": place,
   "source": "https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer",
   "source_name": "The National Map (USGS)", "author": "USDA Farm Service Agency, NAIP", "author_type": "Organization",
   "license": "Public domain", "license_url": "https://www.fsa.usda.gov/help/policies-and-links/",
   "provenance": f"U.S. government aerial photo: USDA National Agriculture Imagery Program (NAIP), South Carolina 2023, natural color, 60 cm. Exported by Chapter3 from the USGS National Map NAIP image service (exportImage, Web Mercator, cubic resampling, mosaic locked to Year=2023) on 2026-11-03, a 1,000 by 750 m window centred on {q['lat']} N, {-q['lon']} W; the exact request is in source_request.",
   "license_note": "Same source and terms as the Murrells Inlet and Little River NAIP records of this batch: The National Map offers \"free downloads of public domain, NAIP compressed orthoimagery\"; the USDA FSA policy page says public domain information \"may be freely distributed or copied, but use of appropriate byline/photo/image credits is requested.\"",
   "terms_urls": ["https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer", "https://www.fsa.usda.gov/help/policies-and-links/"],
   "taken": "2023", "display_credit": "U.S. government aerial photo, 2023",
   "credit": "Photo: USDA Farm Service Agency, NAIP, public domain, via The National Map (USGS).",
   "digital_source_type": "digitalCapture",
   "subject_check": f"Looked at full size (2000 x 1500) by the fixer on 2026-11-03. Window chosen as the densest block of house parcels inside this page's {place['sublocation']} outline (Horry County GIS layer 24 or Georgetown County parcels, read 2026-11-02); at least six of nine test points of the window fall inside the outline. No label is drawn; the caption names no subdivision, street or business.",
   "source_request": q["request"]})

w, h = save(os.path.join(DL, "conway-orig.jpg"), (0, 0, 1920, 1440), "conway-riverwalk-and-warehouses")
keep.append({"slug": "invest-where-to-buy", "file": B + "conway-riverwalk-and-warehouses.webp",
 "variants": {"600": B + "conway-riverwalk-and-warehouses-600w.webp", "1200": B + "conway-riverwalk-and-warehouses-1200w.webp"}, "width": w, "height": h,
 "title": "Waccamaw River Warehouse Historic District, June 2010",
 "what": "A wooden boardwalk with a black metal rail runs past old wooden warehouses with tin roofs and a white building with a screened porch, under sycamore trees, in Conway's Waccamaw River Warehouse Historic District. A highway bridge shows through the trees at the upper left. One person walks far down the boardwalk, too small to recognise.",
 "caption": "The riverwalk boardwalk past old wooden warehouses in downtown Conway.",
 "alt": "A wooden boardwalk with a black rail running past old wooden warehouses and a building with a screened porch, under tall sycamore trees, in Conway",
 "place": {"city": "Conway", "sublocation": "Waccamaw River Warehouse Historic District, downtown Conway"},
 "source": "https://commons.wikimedia.org/wiki/File:Waccamaw_River_Warehouse_Historic_District_Jun_10.JPG",
 "commons_page": "https://commons.wikimedia.org/wiki/File:Waccamaw_River_Warehouse_Historic_District_Jun_10.JPG",
 "source_name": "Wikimedia Commons", "author": "Pubdog", "author_type": "Person",
 "license": "Public domain", "license_url": "https://commons.wikimedia.org/wiki/Template:PD-self",
 "license_note": "Commons file page and API (extmetadata, read 2026-11-03): License 'pd', LicenseShortName 'Public domain', Credit 'Own work', Artist User:Pubdog, category PD-self. Checked by the batch verifier (VERIFY.md, photo candidates: 'Public domain, released by its author (Pubdog, own work, 2010). Usable.').",
 "provenance": "Commons 1920 px thumbnail of the 2592 x 1944 original, downloaded 2026-11-03 (md5 60efbaa4154a4f5e73e555d56aa85962). DateTimeOriginal 2010-06-20; GPS 33.833333 N, 79.045 W (Commons page).",
 "terms_urls": ["https://commons.wikimedia.org/wiki/File:Waccamaw_River_Warehouse_Historic_District_Jun_10.JPG", "https://commons.wikimedia.org/wiki/Template:PD-self"],
 "taken": "2010-06-20", "display_credit": "Photo: Pubdog, 2010",
 "credit": "Photo: Pubdog, public domain, via Wikimedia Commons.",
 "digital_source_type": "digitalCapture",
 "subject_check": "Looked at full size (1920 x 1440) by the fixer on 2026-11-03. The caption does not say the photo shows one of the zoning districts in ledger row 7 (VERIFY.md): the historic district and the Waccamaw Riverfront zoning district are not the same thing."})
json.dump({"photos": keep}, open(os.path.join(HERE, "photos.json"), "w"), indent=1)
print(len(keep))
