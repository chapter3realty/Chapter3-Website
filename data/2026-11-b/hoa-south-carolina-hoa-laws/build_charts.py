"""Chart rows for /hoa/south-carolina-hoa-laws/, from scdca-outcomes.json. Usage: python3 -I build_charts.py <dir>"""
import sys, json, os
d = sys.argv[1]
s = json.load(open(os.path.join(d, "scdca-outcomes.json")))
h = s["all_years"]["horry"]; n = h["complaints"]
st = h["status"]
out = {"title": "How the state closed 416 Horry County HOA complaints, 2022 to 2025",
       "source": s["source"], "n": n,
       "rows": [
        {"label": "The HOA answered every point (the state's 'adequate business response')", "count": st.get("Satisfied - Adequate Business Response", 0)},
        {"label": "Facts in dispute, left undecided", "count": st.get("Undetermined", 0)},
        {"label": "The HOA never answered", "count": st.get("Unsatisfied", 0)},
        {"label": "Still open when the report was made", "count": st.get("Pending", 0)},
        {"label": "The owner said they were satisfied", "count": st.get("Satisfied - Consumer Satisfied", 0)},
        {"label": "Closed: the owner did not send what the state asked for", "count": st.get("Abandoned", 0)}],
       "median_days_to_close": h["median_days_to_close"], "n_with_days": h["n_with_days"]}
for r in out["rows"]: r["pct"] = round(100 * r["count"] / n, 1)
json.dump(out, open(os.path.join(d, "chart-complaint-outcomes.json"), "w"), indent=1)
ch = h["change"]; en = h["enforce"]
want = {"title": "What Horry County HOA complaints said should change in the HOA's papers, and who should enforce them, 2022 to 2025 (416 complaints; a complaint could name more than one)",
        "source": s["source"], "n": n,
        "change_the_rules": [{"label": k, "count": ch.get(k, 0), "pct": round(100 * ch.get(k, 0) / n, 1), "sibling": sib}
            for k, sib in [("Open meetings and notice", None), ("Rules for viewing and copying records", "/hoa/documents/"),
                           ("Forbid liens and foreclosure", "/hoa/liens-and-foreclosure/"), ("Set or change developer turnover", "/hoa/developer-control-turnover/")]],
        "who_should_enforce": [{"label": k, "count": en.get(k, 0), "pct": round(100 * en.get(k, 0) / n, 1)}
            for k in ["State agency oversight", "Dispute resolution within the HOA", "HOA ombudsman", "Magistrate's court enforcement"]]}
json.dump(want, open(os.path.join(d, "chart-what-owners-want.json"), "w"), indent=1)
print(json.dumps(out, indent=1)); print(json.dumps(want, indent=1))
