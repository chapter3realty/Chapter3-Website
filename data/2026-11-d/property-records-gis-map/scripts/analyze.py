# How close is the drawn parcel shape to the acreage the county lists? Built from raw/parcels-area-acreage.json.
import json, sys, collections, statistics
rows = json.load(open(sys.argv[1]))
out = {'rows': len(rows)}
out['pin_patterns'] = collections.Counter(r['pin_pat'] for r in rows).most_common(5)
out['tms_patterns'] = collections.Counter(r['tms_pat'] for r in rows).most_common(5)
out['condo_label_rows'] = sum(r['condo'] for r in rows)
out['acres_null_or_zero'] = sum(1 for r in rows if not r['acres'])
out['by_type'] = collections.Counter(r['type'] for r in rows).most_common()
# comparable set: listed acreage > 0, a drawn shape, not a condo-labelled unit, one lot
comp = [r for r in rows if r['acres'] and r['acres'] > 0 and r['area_sqft'] and r['area_sqft'] > 0 and not r['condo']]
out['comparable'] = len(comp)
ratios = []
for r in comp:
    drawn = r['area_sqft'] / 43560.0
    ratios.append((drawn - r['acres']) / r['acres'])
def share(pred, xs): return round(100.0 * sum(1 for x in xs if pred(x)) / len(xs), 1)
out['within_2pct'] = share(lambda x: abs(x) <= 0.02, ratios)
out['within_5pct'] = share(lambda x: abs(x) <= 0.05, ratios)
out['within_10pct'] = share(lambda x: abs(x) <= 0.10, ratios)
out['off_10pct_or_more'] = share(lambda x: abs(x) > 0.10, ratios)
out['off_25pct_or_more'] = share(lambda x: abs(x) > 0.25, ratios)
out['drawn_bigger_share'] = share(lambda x: x > 0, ratios)
out['median_abs_pct'] = round(100 * statistics.median(abs(x) for x in ratios), 2)
# bands by listed acreage
bands = [(0, 0.25, 'under 1/4 acre'), (0.25, 0.5, '1/4 to 1/2 acre'), (0.5, 1, '1/2 to 1 acre'), (1, 5, '1 to 5 acres'), (5, 1e9, '5 acres or more')]
out['bands'] = []
for lo, hi, name in bands:
    xs = [((r['area_sqft'] / 43560.0) - r['acres']) / r['acres'] for r in comp if lo <= r['acres'] < hi]
    if xs:
        out['bands'].append({'band': name, 'n': len(xs), 'within_5pct': share(lambda x: abs(x) <= 0.05, xs),
                             'off_10pct_or_more': share(lambda x: abs(x) > 0.10, xs),
                             'median_abs_pct': round(100 * statistics.median(abs(x) for x in xs), 2)})
# size of all parcels with listed acreage
ac = [r['acres'] for r in rows if r['acres'] and r['acres'] > 0]
out['acres_listed_n'] = len(ac)
out['acres_median'] = round(statistics.median(ac), 3)
out['share_under_quarter_acre'] = share(lambda a: a < 0.25, ac)
out['share_1_acre_plus'] = share(lambda a: a >= 1, ac)
out['share_10_acre_plus'] = share(lambda a: a >= 10, ac)
json.dump(out, open(sys.argv[2], 'w'), indent=1)
print(json.dumps(out, indent=1))
