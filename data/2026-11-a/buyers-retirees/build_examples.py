"""Worked examples for /buyers/retirees/, built from rules in the ledger (no typed results).
1) Yearly property tax on one $400,000 house in unincorporated Horry County, tax district 100 (2026 certified levy):
   legal residence (4%) under 65, legal residence with the 65+ homestead exemption, and second home or rental (6%).
2) 2026 South Carolina income tax for three retired households (Act 110 of 2026, SCDOR IL 26-20, S.C. Code 12-6-1170, 12-6-1171,
   12-6-50(4); IRC 86 for the federally taxable share of Social Security, which sets federal AGI and so the SCIAD phase-out).
Run: python3 -I build_examples.py <datadir>. Writes examples.json."""
import sys, json, os, math
D = sys.argv[1]
# ---- property tax, 2026 levy (raw/tax-levy-2026.pdf): county 52.1, school debt 10.0, school operating 109.1,
# county fire 20.2, fire apparatus 1.5, waste management 8.1. District 100 total = 201.0 (matches the 2025 district 100 bill, 201).
COUNTY, SCHOOL_DEBT, SCHOOL_OP, FIRE, FIRE_APP, WASTE = 52.1, 10.0, 109.1, 20.2, 1.5, 8.1
ALL = COUNTY + SCHOOL_DEBT + SCHOOL_OP + FIRE + FIRE_APP + WASTE
RES = ALL - SCHOOL_OP                      # 12-37-220(B)(47): legal residence exempt from school operating millage
STORM = 89.40                              # unincorporated stormwater fee, 1 ERU, on the tax bill (myrtle-trace ledger row 73)
def tax(value, ratio, mills, exempt=0): return round((value - exempt) * ratio * mills / 1000, 2)
V = 400000
prop = {"home_value": V, "district": "100 (unincorporated Horry County, county fire district)", "mills_all": round(ALL, 1), "mills_legal_residence": round(RES, 1),
        "legal_residence_under_65": tax(V, 0.04, RES), "legal_residence_65_homestead": tax(V, 0.04, RES, 50000),
        "second_home_or_rental": tax(V, 0.06, ALL), "stormwater_fee": STORM}
prop["homestead_saves"] = round(prop["legal_residence_under_65"] - prop["legal_residence_65_homestead"], 2)
prop["second_home_vs_65_ratio"] = round(prop["second_home_or_rental"] / prop["legal_residence_65_homestead"], 2)
# ---- income tax, tax year 2026
def taxable_ss(ss, other, joint):
    base, adj = (32000, 44000) if joint else (25000, 34000)
    prov = other + ss / 2
    if prov <= base: return 0.0
    if prov <= adj: return min(ss / 2, (prov - base) / 2)
    return min(0.85 * ss, 0.85 * (prov - adj) + min(ss / 2, (adj - base) / 2))
def sciad(agi, joint):
    full, start, span = (30000, 80000, 110000) if joint else (15000, 40000, 55000)
    if agi <= start: return full
    frac = (agi - start) / span
    if frac >= 1: return 0
    red = math.floor(full * frac / 10) * 10      # reduction rounded down to the next lowest $10
    return full - red
def sc_tax(ti):
    if ti <= 0: return 0.0
    return round(ti * 0.0199, 2) if ti < 30000 else round(ti * 0.0521 - 966, 2)
def household(name, joint, people, ss):
    """people: list of dicts {age, retirement (non-military qualified plan or public pension), military}"""
    other = sum(p.get("retirement", 0) + p.get("military", 0) + p.get("wages", 0) for p in people)
    tss = taxable_ss(ss, other, joint); agi = other + tss
    sc = agi - tss                                         # 12-6-50(4): Social Security is not South Carolina income
    lines = {"federal_agi": round(agi), "social_security": ss, "federally_taxable_ss": round(tss), "sc_income_before_deductions": round(sc)}
    ded_ret = ded_age = ded_mil = 0
    for p in people:
        mil = p.get("military", 0); ded_mil += mil
        r = min(p.get("retirement", 0), 10000 if p["age"] >= 65 else 3000); ded_ret += r
        if p["age"] >= 65: ded_age += max(0, 15000 - r - mil)  # 12-6-1170(B), (C): reduced by own retirement and military deductions
    s = sciad(agi, joint)
    ti = max(0, sc - ded_ret - ded_age - ded_mil - s)
    lines.update({"retirement_deduction": ded_ret, "age_65_deduction": ded_age, "military_deduction": ded_mil, "sciad": s,
                  "sc_taxable_income": round(ti), "sc_income_tax_2026": sc_tax(ti)})
    return {"name": name, "joint": joint, "people": people, **lines}
ex = [household("Married, both 66: Social Security and one private pension", True, [{"age": 66, "retirement": 30000}, {"age": 66}], 40000),
      household("Single, 67: a New York public pension and Social Security", False, [{"age": 67, "retirement": 50000}], 24000),
      household("Married, 60 and 58: military retirement pay", True, [{"age": 60, "military": 36000}, {"age": 58}], 0)]
json.dump({"property_tax": prop, "income_tax_2026": ex}, open(os.path.join(D, "examples.json"), "w"), indent=1)
print(json.dumps({"property_tax": prop, "income_tax_2026": ex}, indent=1))
