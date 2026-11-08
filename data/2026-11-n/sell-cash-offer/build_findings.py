"""Everything the page's charts and tables read, from this folder's outputs. No typed numbers except the labeled example inputs.
Run: python3 -I build_findings.py <thisdir>  -> findings.json"""
import json, os, sys, math
D = sys.argv[1]
cb = json.load(open(os.path.join(D, "cash-buyers.json")))
cs = json.load(open(os.path.join(D, "cash-share.json")))
lc = json.load(open(os.path.join(D, "listing-counts.json")))
flip = cb["company_resold"]["31_to_365_days_houses_from_person_seller"]
ratio = flip["median_buy_as_pct_of_sell"] / 100                                # same group as the price below
def deed_fee(price): return round(math.ceil(price / 500) * 1.85, 2)          # SC Code 12-24-10(A): $1.85 per $500 or fraction
fixed = flip["median_sell"]                                                   # the middle resale price of a fixed-up house (our count)
offer = round(fixed * ratio / 1000) * 1000                                     # what companies here paid, as a share, rounded to $1,000
worked = {"fixed_up_price": fixed, "company_paid_share": ratio, "cash_offer": offer, "gap": fixed - offer,
          "deed_fee_cash": deed_fee(offer), "deed_fee_fixed": deed_fee(fixed), "per_1pct_fees_fixed": round(fixed / 100),
          "note": "Example on our county count: the middle fixed-up resale price ($260,000) and the middle share companies paid of their resale price. "
                  "Repairs and fees are the reader's own inputs; the page shows each 1 percent of fees, never a set rate."}
types = ["house", "townhouse", "condo", "manufactured"]
cash_only = {t: {"listed": lc["rows"][t]["all"]["total"], "cash_only": lc["rows"][t]["cash_only"]["total"],
                 "median_asking_cash_only": lc["rows"][t]["cash_only"]["median_asking"]} for t in types}
res = {
  "chart_company_share_by_band_houses": [{"band": x["band"], "pct": x["pct_company"], "n": x["sales"]} for x in cb["by_band_houses_resale"]],
  "company_share": {"resales": cb["all_resales"], "houses": cb["houses_resale"], "condos": cb["condos_resale"], "by_place": cb["by_place_resale_min150"]},
  "company_buyers": cb["company_buyers"], "instant_offer_company_buyers": cb["instant_offer_company_buyers_resale"],
  "chart_bought_vs_resold": {"held_31_365_houses_from_people": flip, "held_31_365_all": cb["company_resold"]["31_to_365_days"],
                             "within_30_days": cb["company_resold"]["within_30_days"]},
  "vs_neighbors_houses": cb["vs_neighbors"]["house_company_buyer"],
  "no_mortgage": {"resales": cs["resales"], "houses_by_band": cs["resale_houses_by_band"], "by_buyer_kind_floor": cs["no_mortgage_resales_by_buyer_kind_floor"]},
  "cash_only_listings": {"pulled": lc["pulled"], "by_type": cash_only, "filter_list": lc["filter_list"]},
  "worked": worked,
}
json.dump(res, open(os.path.join(D, "findings.json"), "w"), indent=1)
print(json.dumps(res["worked"], indent=1)); print(json.dumps(res["cash_only_listings"]["by_type"]))
