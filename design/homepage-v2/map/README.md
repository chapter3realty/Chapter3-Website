# Grand Strand basemap

`build_basemap.py` draws the dark map behind the homepage section "Where on the Grand Strand are you looking?" in the colours of Google Maps' current dark road map. The image carries no text, because the page draws every label, pin and road shield as HTML on top of it.

Sources: U.S. Census Bureau TIGER/Line 2024 (counties, places, roads and their names, area and linear water, area landmarks), the U.S. Census Bureau 2025 Gazetteer (the nine town points), and USGS PAD-US 4.1 protected areas. TIGER/Line is free to use on the condition that the Census Bureau is credited as the source; the line "Map data: U.S. Census Bureau, USGS" on the map does that, so it stays whenever the map is shown. PAD-US is public domain.

To rebuild, run `python3 design/homepage-v2/map/build_basemap.py` with pyshp, shapely and numpy installed, Node with Playwright (`NODE_PATH=$(npm root -g)`) and its Chromium, and an ffmpeg with libaom-av1 and libwebp on PATH. Overrides: `FFMPEG` (the ffmpeg binary), `CHROMIUM` (a Chromium binary instead of Playwright's own), `STRAND_MAPDATA` or `--work DIR` (the download folder; the default is `strand-mapdata` in the system temp folder). It writes `media/map/strand-dark-*.avif`, `media/map/strand-dark-*.webp` and `data/strand-plane.json`.

The road shields are placed for the cameras in `data/cameras.json`. That file must match the page: `node design/homepage-v2/tests/cameras.js <url>` fails when it does not. After a rebuild, run `tests/twcheck.js` with `GROW=0.045` and `tests/states.js`.
