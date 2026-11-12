"""USDA NAIP aerial of the Cherry Grove channels (public domain, U.S. government work), from the USGS National Map image service.
Image of 2023-04-10 (tile m_3307812_nw_17_060_20230410, read with the service's identify call at -78.6175, 33.839).
Run: python3 -I naip_channels.py <out.jpg>. The builder adds labels from coordinates (the channels, the boat ramp, the beach) before use."""
import sys, urllib.request
U = ("https://imagery.nationalmap.gov/arcgis/rest/services/USGSNAIPImagery/ImageServer/exportImage?"
     "bbox=-78.6265,33.8340,-78.6085,33.8445&bboxSR=4326&imageSR=3857&size=1400,1000&format=jpg&f=image")
open(sys.argv[1], "wb").write(urllib.request.urlopen(U, timeout=240).read())
