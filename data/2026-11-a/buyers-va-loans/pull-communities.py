"""Condos for sale today in the condo communities on the VA's list (fix round 1, 2026-11-02).
For each distinct community name on the VA condo report (raw/va-condos-HORRY-approved-true.json), asks the
CRM's public map API for condos for sale whose MLS subdivision matches the name (type=condo&subdivision=...).
Aggregate only: the count, the price range and the bedroom range per community, and the middle point of the
listings (for the Census place lookup). No address is kept. Also counts 2 to 4 unit homes (type=multi).
Run: python3 -I pull-communities.py <datadir>. Writes raw/communities-for-sale.json and raw/multi-counts.json.
The match is by name, so build-findings is not trusted with it: the fixer read every matched community's
listing addresses against the VA record's street before a community went on the page (communities-checked.json)."""
import json, sys, time, re, statistics, urllib.request, urllib.parse, datetime
d = sys.argv[1] if len(sys.argv) > 1 else "."
BASE = "https://chapter3realty.com/homes/api/map?"
def get(params):
    url = BASE + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    for i in range(3):
        try:
            return json.load(urllib.request.urlopen(req, timeout=60))
        except Exception:
            time.sleep(2)
    return None
DROP = r"\b(HPR|HOA|INC|COA|POA|CONDOMINIUMS?|CONDOMIMIUMS|CONDOS?|HORIZONTAL( REGIME)?|HORIZONT|REGIME I|PROPERTY OWNERS|HOMEOWNERS( ASSOCI?A?T?I?O?N?)?|ASSOCIA?T?I?O?N?|ASSOC|LLC|PH II(-E)?)\b"
def clean(n):
    n = re.sub(r"[.,]", " ", n.upper())
    n = re.sub(DROP, " ", n)
    return re.sub(r"\s+", " ", n).strip()
recs = json.load(open(f"{d}/raw/va-condos-HORRY-approved-true.json"))
names = {}
for r in recs:
    c = clean(r["firstLineName"])
    if c: names.setdefault(c, []).append({"city": r["city"], "street": r["secondLineName"], "status": r["dispositionCode"]})
out = []
for c, rs in sorted(names.items()):
    j = get({"type": "condo", "subdivision": c.lower()})
    if not j: out.append({"name": c, "err": True}); continue
    pins = j.get("pins") or []
    prices = [int(re.sub(r"\D", "", p["price"])) for p in pins if re.sub(r"\D", "", p.get("price") or "")]
    beds = [p["beds"] for p in pins if isinstance(p.get("beds"), (int, float))]
    jv = get({"type": "condo", "subdivision": c.lower(), "has": "va_accepted"})
    out.append({"name": c, "va_records": rs, "params": j.get("params"), "total": j.get("total"),
                "va_marked": (jv or {}).get("total"),
                "price_min": min(prices) if prices else None, "price_max": max(prices) if prices else None,
                "beds_min": min(beds) if beds else None, "beds_max": max(beds) if beds else None,
                "lat": statistics.median([p["lat"] for p in pins]) if pins else None,
                "lng": statistics.median([p["lng"] for p in pins]) if pins else None,
                "refreshedAt": (j.get("meta") or {}).get("refreshedAt")})
    print(c, j.get("total"), flush=True)
    time.sleep(.3)
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "rows": out}, open(f"{d}/raw/communities-for-sale.json", "w"), indent=1)
m = {k: (get(p) or {}).get("total") for k, p in {"multi": {"type": "multi"}, "multi+va": {"type": "multi", "has": "va_accepted"}}.items()}
json.dump({"pulled": datetime.datetime.now(datetime.timezone.utc).isoformat(), "params": {"multi": "type=multi", "multi+va": "type=multi&has=va_accepted"}, "totals": m}, open(f"{d}/raw/multi-counts.json", "w"), indent=1)
