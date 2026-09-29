# Homepage redesign tests

Browser measurements for the redesign. Run with Playwright's Chromium:

    export NODE_PATH=$(npm root -g)
    node check.js  http://localhost:8124/            # every width: sideways scroll, H1, hidden text, contrast, errors
    node check.js  http://localhost:8124/ --reduced  # same, reduced motion
    node states.js http://localhost:8124/            # 144 behaviour checks: video gates, reviews, fold, fonts, CLS, the towns map
    node perf.js   http://localhost:8124/ mobile     # throttled LCP, CLS, blocking time
    node holes.js  http://localhost:8124/ 768 1024   # transparent pixels at the film edge while it scales
    node mediacontrast.js http://localhost:8124/ 1440 '.tl'   # contrast from pixels
    node shot.js   http://localhost:8124/ 1440 900 out '0,#towns'

The towns map (a tilted basemap with CSS-placed labels) has its own tools. They share `twlib.js`:

    node twcheck.js  http://localhost:8124/ 1440x900 390x844   # label collisions over the whole turn, and label-to-map error
    GROW=0.045 node twcheck.js http://localhost:8124/          # the same with labels 4.5% wider, as Firefox draws them
    node twmotion.js http://localhost:8124/ 1440 900           # labels stay on their towns during the flight and the turn
    node twperf.js   http://localhost:8124/ 390 844 4          # main-thread cost while the map moves (4x CPU slowdown)
    node twsearch.js '<json>'                                  # searches cameras and label sides for a range of widths

`twsearch.js` is how the per-width cameras, label sides and water-name spots in
`src/head.html` were chosen. Example for the phone range:

    node twsearch.js '{"url":"http://localhost:8124/","sh":640,"widths":[360,390,430,699],"grid":{"P":[900],"pw":[1100,1200,1300],"t0":[46,50],"hc":[-34,-30,-26],"cx":[10,20,40],"cy":[0.44,0.5]},"drift":2,"order":["myrtle-beach","carolina-forest","conway","north-myrtle-beach","little-river","surfside-beach","garden-city","murrells-inlet","pawleys-island"],"prefs":["up","r","l","ur","ul","up2"],"grow":0.045}'

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
