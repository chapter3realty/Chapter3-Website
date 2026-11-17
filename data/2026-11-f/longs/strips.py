"""Checks each strip search the page uses against the live site: /homes/api/strip?<q> must answer ok with total >= 3. Usage: python3 -I strips.py > strips.json"""
import json,urllib.request,urllib.parse,time,sys
L=[l.strip() for l in open(sys.argv[1]) if l.strip() and not l.startswith("#")]
out=[]
for q in L:
    for i in range(6):
        try:
            r=json.load(urllib.request.urlopen(urllib.request.Request("https://chapter3realty.com/homes/api/strip?"+urllib.parse.quote(q,safe="=&"),headers={"User-Agent":"Mozilla/5.0"}),timeout=60))
            if r.get("ok") is False: raise Exception(r)
            break
        except Exception: time.sleep(4); r={"ok":False,"total":None}
    out.append({"q":q,"ok":r.get("ok"),"total":r.get("total"),"link":r.get("link"),"note":r.get("note"),"cards":r.get("html","").count('class="hx-c"')})
    time.sleep(.4)
json.dump(out,open(sys.argv[2],"w"),indent=1)
for o in out: print(o["total"],o["cards"],o["q"],o.get("note") or "")
