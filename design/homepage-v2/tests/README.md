# Homepage redesign tests

Browser measurements for the redesign. Run with Playwright's Chromium:

    export NODE_PATH=$(npm root -g)
    node check.js  http://localhost:8124/            # every width: sideways scroll, H1, hidden text, contrast, errors
    node check.js  http://localhost:8124/ --reduced  # same, reduced motion
    node states.js http://localhost:8124/            # 81 behaviour checks: video gates, reviews, fold, fonts, labels, CLS
    node perf.js   http://localhost:8124/ mobile     # throttled LCP, CLS, blocking time
    node holes.js  http://localhost:8124/ 768 1024   # transparent pixels at the film edge while it scales
    node mediacontrast.js http://localhost:8124/ 1440 '.tl'   # contrast from pixels
    node shot.js   http://localhost:8124/ 1440 900 out '0,#towns'

Serve the page first: copy `design/homepage-v2/index.html` into a scratch copy of
`chapter3realty/` as `index.html`, copy `media/hero/` beside it, and run
`python3 -m http.server 8124` in that folder. The live homepage on another port
is the baseline.
