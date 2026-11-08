"""Group the Google suggestions in raw/google-suggestions.txt by what the reader wants. Run: python3 -I count_suggestions.py .
Out-of-area suggestions (other states and countries) and unrelated ones (partition screens, business buyouts) are dropped.
Groups overlap: one suggestion can count in two groups."""
import json, re, sys, os
d = sys.argv[1]
sug = set()
for line in open(os.path.join(d, "raw/google-suggestions.txt")):
    line = line.strip()
    if line.startswith("=="): continue
    try: sug.update(json.loads(line)[1])
    except Exception: pass
drop = r"\b(uk|texas|ontario|canada|scotland|scottish|california|florida|georgia|illinois|tennessee|wisconsin|pa|mn|kentucky|south africa|nova scotia|austin|chicago|alpharetta|md|partition scre|partition sch|partition screw|business|death|north carolina|nc )"
sug = sorted(s for s in sug if not re.search(drop, s + " "))
G = {"buyout_equity_refinance_mortgage": r"buy ?out|buyout|calculat|equity|refinanc|quit ?claim|quick claim|remove (spouse|ex|partner|wife|husband)|removing",
     "sign_refuse_force": r"without my|consent|permission|signature|refuses|won.?t|wont|force|court order|both (owners|spouses)|agree to sell",
     "tax_before_after": r"capital gain|before or after|report sale|before divorce|after divorce",
     "who_gets_marital_property": r"who gets|who keeps|who has to leave|50.?50|marital property|equitable|community property|inheritance|property division|property laws|determines|judge decide",
     "value_appraisal": r"apprais|valuation|value",
     "lawyer_court_records": r"lawyer|attorney|court|mediator|records|docket|papers|decree|judges|roster|forms|portal|phone|address"}
out = {"kept_suggestions": len(sug), "groups": {}}
for k, p in G.items():
    m = [s for s in sug if re.search(p, s)]
    out["groups"][k] = {"n": len(m), "suggestions": m}
json.dump(out, open(os.path.join(d, "suggestion-groups.json"), "w"), indent=1)
print({k: v["n"] for k, v in out["groups"].items()}, out["kept_suggestions"])
