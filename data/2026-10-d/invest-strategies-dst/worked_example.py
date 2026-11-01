"""The worked example for /invest/strategies/dst/. It reuses the constructed example on /sell/capital-gains/
(same sale, same basis, same depreciation) so the site shows one set of numbers.
Rates: IRS Topic 409 (25% maximum on unrecaptured section 1250 gain; 15% long-term rate for most),
IRS Topic 559 (3.8% NIIT above $200,000 single / $250,000 joint MAGI), S.C. Code 12-6-1150 (44% deduction),
SCDOR on H.4216 (5.21% rate on income of $30,000 and above, 2026).
DST sales commission: the median share of the money raised in 144 SEC Form D filings (formd_dst_summary.json).
Run: python3 -I worked_example.py > worked_example.json
"""
import json, os
here = os.path.dirname(os.path.abspath(__file__))
fd = json.load(open(os.path.join(here, 'formd_dst_summary.json')))
sale, bought, dep, cost_rate = 400000, 250000, 60000, 0.06
realized = sale - sale * cost_rate
basis = bought - dep
gain = realized - basis
recapture = dep * 0.25
ltcg = (gain - dep) * 0.15
federal = recapture + ltcg
sc = gain * (1 - 0.44) * 0.0521
niit_max = gain * 0.038
comm = round(fd['commission_plus_finders_share']['median'], 3)
out = dict(sale=sale, bought=bought, depreciation=dep, selling_costs=sale * cost_rate, amount_realized=realized,
           adjusted_basis=basis, gain=gain, federal_recapture_at_25=recapture, federal_ltcg_at_15=ltcg,
           federal_total=federal, sc_tax=round(sc, 2), tax_before_niit=round(federal + sc, 2), niit_if_over_threshold=round(niit_max, 2),
           tax_with_niit=round(federal + sc + niit_max, 2), cash_after_tax_before_niit=round(realized - federal - sc, 2),
           dst_commission_share_median=comm, dst_commission_on_realized=round(realized * comm, 2),
           commission_as_share_of_tax_before_niit=round(realized * comm / (federal + sc), 3))
print(json.dumps(out, indent=1))
