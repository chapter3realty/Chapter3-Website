# Grand Strand basemap

`build_basemap.py` draws the dark map that fills the homepage hero, in the colours of Google Maps' current dark road map. The image carries no text, because the page draws every label, pin and road shield as HTML on top of it.

Sources: U.S. Census Bureau TIGER/Line 2024 (counties, places, roads and their names, area and linear water, area landmarks), the U.S. Census Bureau 2025 Gazetteer (the nine town points), and USGS PAD-US 4.1 protected areas. TIGER/Line is free to use on the condition that the Census Bureau is credited as the source; the line "Map data: U.S. Census Bureau, USGS" on the map does that, so it stays whenever the map is shown. PAD-US is public domain.

To rebuild, run `python3 design/homepage-v2/map/build_basemap.py` with pyshp, shapely and numpy installed, Node with Playwright (`NODE_PATH=$(npm root -g)`) and its Chromium, and an ffmpeg with libaom-av1 and libwebp on PATH. Overrides: `FFMPEG` (the ffmpeg binary), `CHROMIUM` (a Chromium binary instead of Playwright's own), `STRAND_MAPDATA` or `--work DIR` (the download folder; the default is `strand-mapdata` in the system temp folder). It writes `media/map/strand-dark-*.avif`, `media/map/strand-dark-*.webp` and `data/strand-plane.json`.

The road shields are placed for the cameras in `data/cameras.json`. That file must match the page: `node design/homepage-v2/tests/cameras.js <url>` fails when it does not. After a rebuild, run `tests/twcheck.js` with `GROW=0.045` and `tests/states.js`.

## The zoom from the eastern United States

`build_zoom.py` draws the three maps the camera flies down through before it lands on the basemap (the flight starts on the eastern half of the country map, tilted a little): the United States (`zoom-us`), the Southeast (`zoom-se`) and the Carolina coast (`zoom-coast`), in the same palette, in Web Mercator, with no text, each written at 3200 and 1600 px as AVIF and WebP, plus `data/strand-zoom.json` with each map's extent. Sources: Census cartographic boundary states (1:5,000,000 and 1:500,000) and 2020 urban areas, TIGER/Line counties, area water and primary and secondary roads, PAD-US parks and refuges, and Natural Earth (public domain) for Canada, Mexico, the Great Lakes, lakes and rivers. The coast map's land is built the way the basemap's is, TIGER counties less TIGER area water, so the coastline matches where the two meet. Run it the same way as `build_basemap.py` (same overrides); it reuses a level it already built unless `--force` is given. The page places each map with the basemap's camera: the maps are Mercator and the basemap is an equirectangular plane, and they agree at the camera target's latitude, to within a pixel over the basemap.

