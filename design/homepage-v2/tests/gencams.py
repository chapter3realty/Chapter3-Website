# The hero map's camera table: writes each width band's camera, label sides, water-name spots and hidden road shields into
# src/head.html (between the label-sides comment and the motion comment, and the base camera rule) and data/cameras.json.
#   python3 design/homepage-v2/tests/gencams.py
# Each band came from tests/twsearch.js: hc is the middle of the turn and drift half its range, so the map rests at
# hc - drift (--h0) and turns to hc + drift (--h1) and back; the search kept every label clear over the whole range.
# Then run tests/cameras.js (page and file agree), tests/twcheck.js with GROW=0.045, and tests/states.js and after.js.
import json, os, re, sys
HP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SIDES = {"up": [0.5, 1, 0, -28, 28], "r": [0, 0.5, 12, 0, 0], "l": [1, 0.5, -12, 0, 0], "ur": [0, 1, -14, -28, 28], "ul": [1, 1, 14, -28, 28], "up2": [0.5, 1, 0, -60, 60]}
TOWNS = ["pawleys-island", "murrells-inlet", "garden-city", "surfside-beach", "myrtle-beach", "carolina-forest", "conway", "north-myrtle-beach", "little-river"]
WKEY = {"Intracoastal Waterway": "icw", "Waccamaw River": "wac", "Atlantic Ocean": "sea"}
D = dict(font=13.5, fog=90, layout="beside")
T = dict(font=13.5, fog=50, layout="above")
PH = dict(font=12, fog=40, layout="above")
CAMS = [
 dict(D, name='desktop, short screen', media='(min-width:1100px)', base=True, vws=[1100, 1160, 1280, 1366, 1399], vh=649, P=1200, pw=1500, tilt=54, hc=-22, drift=9, cx=240, cb=375,
      sides={"myrtle-beach": "r", "carolina-forest": "up", "conway": "up", "north-myrtle-beach": "r", "little-river": "r", "surfside-beach": "r", "garden-city": "l", "murrells-inlet": "r", "pawleys-island": "r"},
      water={"Intracoastal Waterway": None, "Waccamaw River": [0.3791, 0.4537, -83.3], "Atlantic Ocean": [0.5843, 0.5632, -48.3]}, shields=[]),
 dict(D, name='desktop, tall screen', media='(min-width:1100px) and (min-height:800px)', vws=[1100, 1160, 1280, 1366, 1399], vh=800, P=1200, pw=1650, tilt=54, hc=-16, drift=9, cx=300, cb=440,
      sides={"myrtle-beach": "r", "carolina-forest": "up", "conway": "l", "north-myrtle-beach": "ul", "little-river": "ul", "surfside-beach": "r", "garden-city": "l", "murrells-inlet": "r", "pawleys-island": "r"},
      water={"Intracoastal Waterway": None, "Waccamaw River": [0.3774, 0.463, -76.5], "Atlantic Ocean": [0.5641, 0.5424, -48.3]}, shields=[]),
 dict(D, name='wide desktop, short screen', media='(min-width:1400px)', vws=[1400, 1440, 1536, 1680, 1920], vh=649, P=1200, pw=1450, tilt=50, hc=0, drift=9, cx=340, cb=360,
      sides={"myrtle-beach": "r", "carolina-forest": "ur", "conway": "l", "north-myrtle-beach": "r", "little-river": "up", "surfside-beach": "r", "garden-city": "ul", "murrells-inlet": "l", "pawleys-island": "r"},
      water={"Intracoastal Waterway": None, "Waccamaw River": None, "Atlantic Ocean": [0.5843, 0.5632, -48.3]}, shields=[]),
 dict(D, name='wide desktop, tall screen', media='(min-width:1400px) and (min-height:800px)', vws=[1400, 1440, 1536, 1680, 1920], vh=800, P=1200, pw=1800, tilt=54, hc=-8, drift=9, cx=400, cb=460,
      sides={"myrtle-beach": "r", "carolina-forest": "up", "conway": "l", "north-myrtle-beach": "ul", "little-river": "ul", "surfside-beach": "r", "garden-city": "l", "murrells-inlet": "r", "pawleys-island": "r"},
      water={"Intracoastal Waterway": [0.4089, 0.4756, -14.1], "Waccamaw River": [0.3502, 0.5056, -64.6], "Atlantic Ocean": [0.5843, 0.5632, -48.3]}, shields=[]),
 dict(T, name='tablet', media='(max-width:1099px)', vws=[900, 1000, 1099], vh=900, P=1100, pw=1450, tilt=50, hc=0, drift=9, cx=80, cb=340, ma=560,
      sides={"myrtle-beach": "r", "carolina-forest": "ur", "conway": "up", "north-myrtle-beach": "r", "little-river": "up", "surfside-beach": "r", "garden-city": "ul", "murrells-inlet": "l", "pawleys-island": "r"},
      water={"Intracoastal Waterway": None, "Waccamaw River": [0.3683, 0.4185, 82.3], "Atlantic Ocean": [0.5843, 0.5632, -48.3]}, shields=[]),
 dict(T, name='small tablet', media='(max-width:899px)', vws=[700, 768, 820, 899], vh=1000, P=1100, pw=1350, tilt=50, hc=0, drift=9, cx=0, cb=325, ma=520,
      sides={"myrtle-beach": "up2", "carolina-forest": "r", "conway": "up", "north-myrtle-beach": "r", "little-river": "up", "surfside-beach": "r", "garden-city": "ul", "murrells-inlet": "l", "pawleys-island": "r"},
      water={"Intracoastal Waterway": None, "Waccamaw River": [0.3705, 0.4056, 89.7], "Atlantic Ocean": [0.5843, 0.5632, -48.3]}, shields=["31"]),
 dict(PH, name='phone', media='(max-width:699px)', vws=[360, 390, 430, 699], vh=844, P=900, pw=1200, tilt=48, hc=-39, drift=9, cx=30, cb=350, ma=520,
      sides={"myrtle-beach": "r", "carolina-forest": "up", "conway": "ur", "north-myrtle-beach": "l", "little-river": "l", "surfside-beach": "up", "garden-city": "l", "murrells-inlet": "r", "pawleys-island": "l"},
      water={"Intracoastal Waterway": None, "Waccamaw River": [0.3834, 0.4407, 85.4], "Atlantic Ocean": [0.6247, 0.4169, -48.3]}, shields=[]),
 dict(PH, name='small phone', media='(max-width:359px)', vws=[320, 340, 359], vh=700, P=900, pw=1050, tilt=46, hc=-41, drift=9, cx=20, cb=320, ma=520,
      sides={"myrtle-beach": "r", "carolina-forest": "ur", "conway": "ur", "north-myrtle-beach": "up2", "little-river": "l", "surfside-beach": "up", "garden-city": "l", "murrells-inlet": "l", "pawleys-island": "l"},
      water={"Intracoastal Waterway": None, "Waccamaw River": None, "Atlantic Ocean": [0.4793, 0.6055, -48.3]}, shields=["17"]),
]
def g(v):
    t = '%g' % v
    return t.replace('0.', '.', 1) if t.startswith(('0.', '-0.')) else t
def cam_vars(c):
    v = f"--P:{c['P']};--pw:{c['pw']};--t0:{c['tilt']}deg;--h0:{c['hc']-c['drift']}deg;--h1:{c['hc']+c['drift']}deg;--cx:{c['cx']};--cb:{c['cb']}"
    if 'ma' in c: v += f";--ma:{c['ma']}px"
    return v
def side_rules(c):
    groups = {}
    for t in TOWNS: groups.setdefault(c['sides'].get(t, 'up'), []).append(t)
    out = []
    for name in ["up", "r", "l", "ur", "ul", "up2"]:
        if name not in groups: continue
        ax, ay, ox, oy, st = SIDES[name]
        sel = ','.join(f'[data-town={t}]' for t in groups[name])
        out.append(f".tw-pin:is({sel}){{--ax:{g(ax)};--ay:{g(ay)};--ox:{g(ox)};--oy:{g(oy)};--stem:{g(st)}}}")
    return ''.join(out)
def water_rules(c, shown_before):
    out = []
    for label, key in WKEY.items():
        w = c['water'][label]
        if w is None: out.append(f".tw-deco .wl.{key}{{display:none}}")
        else: out.append(f".tw-deco .wl.{key}{{{'display:inline;' if key in shown_before else ''}--px:{g(w[0])};--py:{g(w[1])};--a:{g(w[2])}deg}}")
    return ''.join(out)
css = []
hidden = set()
shid = set()      # routes whose shields an earlier band hides: a band that shows them says so, as its media can overlap
for c in CAMS:
    body = ''
    if not c.get('base'): body += f"#page-home #home.cine{{{cam_vars(c)}}}"
    body += side_rules(c) + water_rules(c, hidden)
    hidden = {WKEY[l] for l, w in c['water'].items() if w is None}
    for r in ["17", "501", "31", "22"]:
        if r in c['shields']: body += f'.tw-deco .sh[data-r="{r}"]{{display:none}}'
        elif r in shid: body += f'.tw-deco .sh[data-r="{r}"]{{display:inline}}'
    shid |= set(c['shields'])
    css.append(f"@media {c['media']}{{{body}}}")
p = HP + '/src/head.html'; s = open(p).read()
a = s.index('/* label sides and water names per width')
b = s.index('/* motion: the camera flies in')
head = s[a:s.index('*/', a) + 2]
s = s[:a] + head + '\n' + '\n'.join(css) + '\n' + s[b:]
base = CAMS[0]
s, n = re.subn(r"#page-home #home\.cine\{--hw:\.864979;--tx:\.49;--ty:\.45;[^}]*\}", "#page-home #home.cine{--hw:.864979;--tx:.49;--ty:.45;" + cam_vars(base) + ";--fog:90px}", s)
assert n == 1, n
open(p, 'w').write(s)
# data/cameras.json
note = ("The hero map camera for each width band, as src/head.html sets it (#home, style c3-home-map): P perspective, pw plane width, "
        "tilt, heads (the map rests at the first; the search kept the labels clear over the whole range, the middle halfway), cx px right of the stage's middle, cb px above the stage's bottom, "
        "ma the map's height under the words on a narrow screen, fog, font (label px), layout (the words beside the map or above it), "
        "sides: a town's label corner at its pin, [ax, ay, ox, oy, stem] as the CSS custom properties, or a name from sideNames; a town not listed uses 'up'. "
        "vws and vh: the screen sizes tests/twsearch.js searched and tests/cameras.js checks (vh is the shortest screen the band's camera was searched for). "
        "map/build_basemap.py places the road shields for these views; tests/cameras.js loads the page at each listed width and fails when the page and this file disagree. Edit both together.")
out = {"note": note, "sideNames": SIDES, "cameras": []}
for c in CAMS:
    o = {k: c[k] for k in ["name", "media", "vws", "vh", "P", "pw", "tilt"]}
    o["heads"] = [c['hc'] - c['drift'], c['hc'], c['hc'] + c['drift']]
    for k in ["cx", "cb"]: o[k] = c[k]
    if 'ma' in c: o['ma'] = c['ma']
    for k in ["fog", "font", "layout"]: o[k] = c[k]
    o["sides"] = {t: v for t, v in c['sides'].items() if v != 'up'}
    o["water"] = {WKEY[l]: w for l, w in c['water'].items()}
    o["hiddenShields"] = c['shields']
    out["cameras"].append(o)
lines = ['{', ' "note": ' + json.dumps(note) + ',', ' "sideNames": {' + ', '.join('"%s": %s' % (k, json.dumps(v)) for k, v in SIDES.items()) + '},', ' "cameras": [']
for i, o in enumerate(out["cameras"]):
    head = {k: o[k] for k in ["name", "media", "vws", "vh"]}
    cam = {k: o[k] for k in ["P", "pw", "tilt", "heads", "cx", "cb"] + (["ma"] if "ma" in o else []) + ["fog", "font", "layout"]}
    lines.append('  {' + json.dumps(head)[1:-1] + ',')
    lines.append('   ' + json.dumps(cam)[1:-1] + ',')
    lines.append('   "sides": ' + json.dumps(o["sides"]) + ',')
    lines.append('   "water": ' + json.dumps(o["water"]) + ', "hiddenShields": ' + json.dumps(o["hiddenShields"]) + '}' + (',' if i < len(out["cameras"]) - 1 else ''))
lines += [' ]', '}']
txt = '\n'.join(lines)
assert json.loads(txt) == json.loads(json.dumps(out))
open(HP + '/data/cameras.json', 'w').write(txt + '\n')
print('wrote src/head.html and data/cameras.json:', len(CAMS), 'bands')
