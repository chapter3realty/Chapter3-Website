# Writes photos.json: the licence records for /invest/where-to-buy/'s five USGS photos.
# Frames from the USGS 2011 baseline coastal oblique survey (doi 10.5066/F7N877XX), read out of the
# release's zip files by HTTP range request on 2026-11-02. Each was looked at full size by the writer.
import json, sys, os
B = "images/2026-11-a/invest-where-to-buy/"
Z = "https://coastal.er.usgs.gov/data-release/doi-F7N877XX/data/"
P = [
 ("north-myrtle-beach-towers-and-houses-2011", "2011_0824_180624d.jpg", "11CCH03_0824_180500.zip", -78.686753, 33.807613, 3412421, "8ee55a01d90cffac9347ec5d9b442fa7", 150,
  "Condo towers and beach houses on one block in North Myrtle Beach, USGS oblique aerial photo, August 24, 2011",
  "The oceanfront in the City of North Myrtle Beach seen from a plane over the ocean: a tan condo tower of about twelve stories and a taller grey glass tower stand on the same stretch as a three-story white condo building, a grey house and rows of raised houses on the streets behind, under oak trees. Dunes with boardwalks and the beach are in front. People on the beach are specks; no sign, plate or name is readable.",
  "Condo towers and beach houses on the same oceanfront block in North Myrtle Beach, seen from a plane in 2011.",
  "Two condo towers, a low condo building and raised beach houses side by side behind the dunes in North Myrtle Beach, seen from over the ocean",
  {"city": "North Myrtle Beach", "sublocation": "Oceanfront in the City of North Myrtle Beach (Horry County tax district 550)"},
  "-78.6905 33.8085 to -78.6845 33.8125: 154 parcels, all tax district 550 (City of North Myrtle Beach)"),
 ("surfside-beach-pier-and-houses-2011", "2011_0824_175655d.jpg", "11CCH03_0824_175500.zip", -78.968485, 33.600147, 3466285, "585a2937b2965ba2c3e901527bc737f6", 150,
  "The Surfside Beach pier and rows of raised beach houses, USGS oblique aerial photo, August 24, 2011",
  "The oceanfront of the Town of Surfside Beach seen from a plane over the ocean: the wooden fishing pier runs out from the beach in the middle, with a parking lot and a mid-rise building to its left and close rows of raised two- and three-story beach houses to its right. Streets of houses and trees fill the background. People on the beach are specks; no sign, plate or name is readable.",
  "The pier and rows of raised beach houses in Surfside Beach, seen from a plane in 2011.",
  "The Surfside Beach fishing pier with a parking lot on one side and rows of raised beach houses on the other, seen from over the ocean",
  {"city": "Surfside Beach", "sublocation": "The pier and the oceanfront of the Town of Surfside Beach (Horry County tax district 660)"},
  "-78.9745 33.6030 to -78.9690 33.6075: 258 parcels, all tax district 660 (Town of Surfside Beach)"),
 ("garden-city-pier-and-beach-road-2011", "2011_0824_175549d.jpg", "11CCH03_0824_175500.zip", -78.993193, 33.573597, 3209629, "c95d28f6e26614005b0ebf2fcb776d40", 0,
  "The Garden City pier, condo buildings and houses on the strip between the ocean and the marsh, USGS oblique aerial photo, August 24, 2011",
  "Garden City Beach seen from a plane over the ocean: the end of the pier at the left edge, the beach road running back to a causeway over the salt marsh, shops and parking lots beside it, several mid-rise condo buildings and raised houses along the beach, and the marsh and creeks behind. People are specks; no sign, plate or name is readable.",
  "Condo buildings and houses on the strip between the ocean and the marsh at Garden City, seen from a plane in 2011.",
  "Garden City Beach from over the ocean: the pier, shops along the beach road, mid-rise condo buildings and raised houses, with the salt marsh behind",
  {"city": "Garden City", "sublocation": "Garden City Beach by the pier (Horry County tax district 610, Murrells Inlet - Garden City fire district)"},
  "-79.0000 33.5760 to -78.9940 33.5800: 366 parcels with a district, all tax district 610"),
 ("litchfield-beach-houses-and-condos-2011", "2011_0824_175124d.jpg", "11CCH03_0824_175000.zip", -79.097920, 33.458527, 3272257, "f065ddfb94d4713672958d50213418d0", 200,
  "Beach houses and low condo buildings at Litchfield Beach, with docks across the marsh, USGS oblique aerial photo, August 24, 2011",
  "Litchfield Beach in Georgetown County seen from a plane over the ocean: raised beach houses on the left, a group of two- and three-story condo buildings around a pool and lawns in the middle and right, the dunes and beach in front, and long wooden docks running back across the salt marsh to a creek. People are specks; no sign, plate or name is readable.",
  "Beach houses and low condo buildings at Litchfield Beach, with docks across the marsh, seen from a plane in 2011.",
  "Raised beach houses and low condo buildings around a pool at Litchfield Beach, with long docks crossing the marsh behind, seen from over the ocean",
  {"city": "Pawleys Island", "sublocation": "Litchfield Beach, unincorporated Georgetown County, ZIP code 29585"},
  "Georgetown County parcels (GCGIS_Export layer 2), -79.1060 33.4600 to -79.0990 33.4660: 129 parcels; legal descriptions name Litchfield Beach and Inlet Point; ZIP 29585"),
 ("myrtle-beach-oceanfront-towers-2011", "2011_0824_180234d.jpg", "11CCH03_0824_180000.zip", -78.814373, 33.736513, 3439546, "add930b17cced8106f402f7ce7e11e2c", 150,
  "Oceanfront towers in Myrtle Beach, USGS oblique aerial photo, August 24, 2011",
  "The oceanfront in the City of Myrtle Beach seen from a plane over the ocean: three large towers of about twelve to fifteen stories with pools in front, a smaller building beside them, and streets of houses and low buildings under trees behind. The beach is crowded with umbrellas. People are specks; no sign, plate or name is readable.",
  "Oceanfront towers in Myrtle Beach, seen from a plane in 2011.",
  "Three large oceanfront towers with pools in front of them in Myrtle Beach, and streets of houses behind, seen from over the ocean",
  {"city": "Myrtle Beach", "sublocation": "Oceanfront in the City of Myrtle Beach, north of the city center (Horry County tax district 880)"},
  "-78.8200 33.7390 to -78.8130 33.7440: 1,943 parcels with a district, all tax district 880 (City of Myrtle Beach)"),
]
used = "174830, 175156, 175537, 175948, 180052, 180133, 180143, 180150, 180158, 180608 and 181208"
out = []
for (name, frame, z, lon, lat, size, md5, y, title, what, cap, alt, place, where) in P:
  r = {"slug": "invest-where-to-buy", "file": B + name + ".webp",
   "variants": {"600": B + name + "-600w.webp", "1200": B + name + "-1200w.webp"}, "width": 1200, "height": 675,
   "title": title, "what": what, "caption": cap, "alt": alt, "place": place,
   "source": "https://doi.org/10.5066/F7N877XX", "source_name": "U.S. Geological Survey", "author": "U.S. Geological Survey",
   "author_type": "Organization", "license": "Public domain", "license_url": "https://www.usa.gov/publicdomain/label/1.0/",
   "credit": "Photo: U.S. Geological Survey, public domain. Credit not required; give it anyway.", "display_credit": "Photo: USGS",
   "provenance": f"U.S. government photo: USGS baseline coastal oblique aerial survey 11CCH03 (Ponte Vedra, Florida, to the South Carolina/North Carolina border), flown 2011-08-24, photographer Karen L.M. Morgan (USGS). Frame {frame} from {Z}{z}; aircraft position {lat} N, {-lon} W (11CCH03-Photolocations.csv; the position of the plane, not of the buildings). Read from the zip by HTTP range request on 2026-11-02; {size:,} bytes, md5 {md5}. Data release: Morgan, K.L.M., 2017, https://doi.org/10.5066/F7N877XX. Not a frame used on any other page (others use {used}).",
   "license_note": "USGS metadata, Use_Constraints: 'Public domain data from the U.S. Government are freely redistributable with proper metadata and source attribution. Please recognize the U.S. Geological Survey as the originator of the dataset.'",
   "subject_check": f"Looked at full size (3008 x 1960) by the writer on 2026-11-02. Parcels landward of the plane's position, queried 2026-11-02: {where}. The caption names no building and says only what the frame shows and the year.",
   "annotation_sources": {"where": "https://www.horrycounty.org/parcelapp/rest/services/HorryCountyGISApp/MapServer/24 ; https://gis1.georgetowncountysc.org/portal/rest/services/GCGIS_Export/FeatureServer/2 (read 2026-11-02)"},
   "terms_urls": ["https://doi.org/10.5066/F7N877XX", "https://coastal.er.usgs.gov/data-release/doi-F7N877XX/data/11CCH03-Metadata.txt"],
   "taken": "2011-08-24", "original_size": "3008x1960", "digital_source_type": "digitalCapture",
   "changes": "Chapter3 Realty cropped and resized the photo",
   "crop_note": f"Cut as one 2708 x 1523 band (x 150 to 2858, y {y} to {y+1523} of the frame), then resized."}
  if name.startswith("north-myrtle"):
    r["crops"] = {k: {"path": B + name + "-" + k + ".webp", "width": 1200, "height": h} for k, h in (("1x1", 1200), ("4x3", 900), ("16x9", 675))}
  out.append(r)
json.dump({"photos": out}, open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "photos.json"), "w"), indent=1)
print(len(out))
