# Homepage redesign tests

Browser measurements for the redesign. Run with Playwright's Chromium. `states.js`, `after.js`,
`sample.js`, `cardcontrast.js`, `cameras.js`, `twcheck.js` and `twmotion.js` exit 1 when a check fails.

    export NODE_PATH=$(npm root -g)
    node check.js  http://localhost:8124/            # every width: sideways scroll, H1, hidden text, contrast, errors
    node check.js  http://localhost:8124/ --reduced  # same, reduced motion
    node states.js http://localhost:8124/            # behaviour checks: map loading gates, reviews, fold, fonts, CLS, the hero map
    node after.js  http://localhost:8124/            # once the map lands: the turn, how it waits and stops, the drag, the town cards, scroll moments
    node sample.js http://localhost:8124/            # the sample report is what the analyzer's own code returns for that house
    node cardcontrast.js http://localhost:8124/ 1440x900 390x844   # the town cards' text over the map, from pixels, every town
    node perf.js   http://localhost:8124/ mobile     # throttled LCP, CLS, blocking time
    node mediacontrast.js http://localhost:8124/ 1440x900     # the hero's words over the map, from pixels, through the flight
    node shot.js   http://localhost:8124/ 1440 900 out '0,#reviews'

The hero map (a tilted basemap with CSS-placed labels) has its own tools. They share `twlib.js`:

    node twcheck.js  http://localhost:8124/ 1440x900 390x844   # label collisions over the turn (13 headings, --h0 to --h1), and label-to-map error
    GROW=0.045 node twcheck.js http://localhost:8124/          # the same with labels 4.5% wider, as Firefox draws them
    SPACING=1 node twcheck.js http://localhost:8124/ 1100x900  # with the WCAG 1.4.12 text spacing (labels then widen too)
    CSS='...' node twcheck.js http://localhost:8124/ 1100x900  # try a placement before writing it into src/head.html
    node cameras.js  http://localhost:8124/                    # the page's cameras match data/cameras.json
    node twmotion.js http://localhost:8124/ 1440 900           # labels stay on their towns during the flight and the turn; only the turn moves after it
    node twperf.js   http://localhost:8124/ 390 844 4          # main-thread cost while the map moves (4x CPU slowdown)
    node twsearch.js '<json>'                                  # searches cameras and label sides for a range of widths
    python3 gencams.py                                         # writes the chosen cameras into src/head.html and data/cameras.json
    node zoomframes.js http://localhost:8124/ 1440x900 out/d   # the flight in from the eastern United States, frozen at set moments
    node flightfps.js  http://localhost:8124/ 390 844 4 3      # frame intervals across the flight (4x CPU slowdown, 3x screen)

`twsearch.js` is how the per-width cameras, label sides and water-name spots in
`src/head.html` were chosen, and `gencams.py` holds the chosen table and writes it
into `src/head.html` and `data/cameras.json` (which `map/build_basemap.py` places
the road shields for). The map rests at `hc - drift` (`--h0`) and, once it has
landed, turns to `hc + drift` (`--h1`) and back; the search keeps every label clear
over that whole range, at `steps` headings (`"drift":9,"steps":13` for the 18-degree
turn), and `"tilts":[-4,0,4]` checks tilts too (none of the bands passed with tilt,
which is why the drag only turns the map).
The words over the map are an obstacle: beside the map on a wide screen (`"col":true`
treats them as a column the stage's full height, since they are centred and move with the
screen's height), above it on a narrow one, where `"ma"` sets the map's height under them.
A wide-screen band is searched at the shortest screen it serves (649px tall is the hero's
560px minimum). Example for the phone range:

    node twsearch.js '{"url":"http://localhost:8124/","widths":[360,390,430,699],"vh":844,"ma":520,"drift":9,"steps":13,"grid":{"P":[900],"pw":[1000,1100,1200],"t0":[46,50],"hc":[-40,-36,-32],"cx":[10,20,30,40],"cb":[330,360,390]},"order":["myrtle-beach","carolina-forest","conway","north-myrtle-beach","little-river","surfside-beach","garden-city","murrells-inlet","pawleys-island"],"prefs":["up","r","l","ur","ul","up2"],"grow":0.045}'

and for the wide screens from 1100 to 1399px on a short screen:

    node twsearch.js '{"url":"http://localhost:8124/","widths":[1100,1160,1280,1366,1399],"vh":649,"col":true,"drift":9,"steps":13,"grid":{"P":[1200],"pw":[1400,1500,1600],"t0":[54],"hc":[-22,-18,-14,-10],"cx":[220,240,260],"cb":[300,330,360]},"order":[...],"prefs":["r","l","up","ur","ul","up2"],"grow":0.045}'

`water-cands.json` holds candidate spots for the three water names on the
Intracoastal Waterway and Waccamaw centre lines and on open ocean, from the
basemap's own geometry. If `data/strand-plane.json` moves a shield, rerun
`twcheck.js` with `GROW=0.045` at every width, and search again where it fails.
The site's reduced-motion rule (app.css) gives every element a .01ms
transition, so these tools switch transitions off before reading positions.

Serve the page first: copy `design/homepage-v2/index.html` into a scratch copy of
`chapter3realty/` as `index.html`, copy `media/hero/` and `media/map/` beside it, and run
`python3 -m http.server 8124` in that folder. The live homepage on another port
is the baseline.
