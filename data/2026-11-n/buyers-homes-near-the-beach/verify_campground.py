"""Verifier check (batch 2026-11-n): the CRM map API's type=house includes homes on leased sites in two campgrounds
(Ocean Lakes Family Campground, 6001 S Kings Hwy, and Apache, 9700 Kings Rd). The county codes those lots as
campground land (118, 119, 122), so they fail the ledger's own house rule (row 1). This drops them and reruns
analyze.py and analyze_walks.py unchanged.
Run: RAW=<scratch> SALES=<...> python3 -I verify_campground.py <datadir>
-> <datadir>/findings-no-campground.json, <datadir>/walk-findings-no-campground.json (aggregates only)."""
import json, os, re, sys, shutil, subprocess, tempfile
RAW = os.environ["RAW"]; D = os.path.abspath(sys.argv[1]); HERE = os.path.dirname(os.path.abspath(__file__))
CAMP = re.compile(r"^\s*(6001\s*-|6001\b.*Kings H|9700\s+Kings R)", re.I)
L = json.load(open(os.path.join(RAW, "pins.json")))
drop = {m for m, x in L["pins"].items() if CAMP.match(x.get("addr") or "")}
L["pins"] = {m: x for m, x in L["pins"].items() if m not in drop}
for k, v in L["sets"].items(): v["mls"] = [m for m in v["mls"] if m not in drop]
raw2 = tempfile.mkdtemp(); d2 = tempfile.mkdtemp()
for f in os.listdir(RAW):
    if f != "pins.json" and os.path.isfile(os.path.join(RAW, f)): os.symlink(os.path.join(RAW, f), os.path.join(raw2, f))
json.dump(L, open(os.path.join(raw2, "pins.json"), "w"))
shutil.copy(os.path.join(D, "coast.geojson"), d2); shutil.copytree(os.path.join(D, "raw"), os.path.join(d2, "raw"))
env = dict(os.environ, RAW=raw2)
env.setdefault("SALES", os.path.join(D, "../../2026-10-d/sell-out-of-state-buyers/out-of-state-buyers.json"))
subprocess.run([sys.executable, "-I", os.path.join(HERE, "analyze.py"), d2], env=env, check=True, stdout=subprocess.DEVNULL)
subprocess.run([sys.executable, "-I", os.path.join(HERE, "analyze_walks.py"), d2], env=env, check=True, stdout=subprocess.DEVNULL)
f = json.load(open(os.path.join(d2, "findings.json"))); f["verifier_note"] = "Campground homes dropped: %d pins (6001 S Kings Hwy, 9700 Kings Rd)" % len(drop)
json.dump(f, open(os.path.join(D, "findings-no-campground.json"), "w"), indent=1)
w = json.load(open(os.path.join(d2, "walk-findings.json"))); w["verifier_note"] = f["verifier_note"]
json.dump(w, open(os.path.join(D, "walk-findings-no-campground.json"), "w"), indent=1)
print(f["verifier_note"])
