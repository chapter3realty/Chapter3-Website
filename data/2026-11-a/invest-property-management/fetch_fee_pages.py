"""Save the published fee pages of property managers that serve Horry County, as HTML and as plain text.
Run: python3 -I fetch_fee_pages.py <datadir> . Writes raw/fees/<id>.html, raw/fees/<id>.txt and raw/fees/index.json."""
import json, sys, time, re, html, urllib.request
D = sys.argv[1]
PAGES = json.load(open(D + "/fee-pages.json"))
idx = []
for p in PAGES:
    req = urllib.request.Request(p["url"], headers={"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"})
    try:
        r = urllib.request.urlopen(req, timeout=60); b = r.read().decode("utf-8", "replace"); code = r.status
    except Exception as e:
        b = ""; code = str(e)[:80]
    open(f"{D}/raw/fees/{p['id']}.html", "w").write(b)
    t = re.sub(r"(?is)<(script|style|noscript|svg).*?</\1>", " ", b)
    t = re.sub(r"(?i)<br\s*/?>|</(p|li|tr|h\d|div|td|th)>", "\n", t)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    t = "\n".join(re.sub(r"[ \t\xa0]+", " ", l).strip() for l in t.splitlines() if l.strip())
    open(f"{D}/raw/fees/{p['id']}.txt", "w").write(t)
    idx.append({"id": p["id"], "url": p["url"], "status": code, "chars": len(t), "read": time.strftime("%Y-%m-%d")})
    print(p["id"], code, len(t))
json.dump(idx, open(D + "/raw/fees/index.json", "w"), indent=1)
