import json,urllib.request,urllib.parse,time,statistics
B="https://chapter3realty.com/homes/api/map?"
def g(p):
    for _ in range(4):
        try:
            j=json.load(urllib.request.urlopen(urllib.request.Request(B+urllib.parse.urlencode(p),headers={"User-Agent":"Mozilla/5.0 (research; chapter3realty.com)"}),timeout=60)); time.sleep(2.2); return j
        except Exception as e: print('err',e); time.sleep(20)
def tot(p): return g(dict(p,limit=1))['total']
out={}
TOWNS={"myrtle_beach_city":{"city":"Myrtle Beach","has":"inside_city_limits"},"north_myrtle_beach":{"city":"North Myrtle Beach"},"surfside_beach":{"city":"Surfside Beach"},"garden_city":{"has":"area_garden_city"},"murrells_inlet":{"city":"Murrells Inlet"},"pawleys_island":{"city":"Pawleys Island"},"little_river":{"city":"Little River"},"conway":{"city":"Conway"}}
def wh(p,x): q=dict(p); q['has']=','.join(v for v in [p.get('has'),x] if v); return q
out['towns']={}
for n,p in TOWNS.items():
    r={}
    for t in ['condo','house']:
        q=dict(p,type=t); r[t]=[tot(q),tot(wh(q,'str_allowed'))]
    out['towns'][n]=r; print(n,r,flush=True)
EX={"nmb":({"type":"condo","city":"North Myrtle Beach","has":"oceanfront_building,str_allowed"},[1050,1100]),
    "surfside":({"type":"condo","city":"Surfside Beach","has":"str_allowed"},[350,400]),
    "gc":({"type":"condo","has":"area_garden_city,str_allowed"},[550,600])}
out['ex']={}
for n,(p,band) in EX.items():
    lo=g(dict(p,beds=2)); hi=tot(dict(p,beds=3))
    two=[x for x in lo['pins'] if x['beds']==2]
    pr=sorted(int(x['price'].strip('$').replace(',','')) for x in two)
    r={'n':lo['total']-hi,'pins2':len(two),'median':statistics.median(pr),'p25':pr[len(pr)//4],'p75':pr[3*len(pr)//4]}
    for s in [0]+band:
        r['le'+str(s)]=tot(dict(p,beds=2,hoaMax=s))-tot(dict(p,beds=3,hoaMax=s))
    r['towns_of_pins']=sorted(set(x['addr'].split(',')[-3].strip() for x in two))
    out['ex'][n]=r; print(n,r,flush=True)
EX2={"mb":{"type":"condo","city":"Myrtle Beach","has":"oceanfront_building,inside_city_limits,str_allowed"},**{k:v[0] for k,v in EX.items()}}
out['incl']={}
for n,p in EX2.items():
    r={}
    for f in ["hoa_includes_electric","hoa_includes_insurance","hoa_includes_internet","vacation_rental_program","furnished"]:
        r[f]=tot(dict(wh(p,f),beds=2))-tot(dict(wh(p,f),beds=3))
    out['incl'][n]=r; print(n,r,flush=True)
json.dump(out,open('requery.json','w'),indent=1)
