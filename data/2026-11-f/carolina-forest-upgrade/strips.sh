#!/bin/bash
H="has=area_carolina_forest&type=house"
while IFS= read -r q; do
 r=$(curl -s "https://chapter3realty.com/homes/api/strip?$(python3 -c "import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1],safe='=&'))" "$q")")
 echo "$r" | python3 -c "import sys,json,re;d=json.load(sys.stdin);print(d.get('ok'),d.get('total'),len(re.findall('class=\"hx-c\"',d.get('html',''))),sys.argv[1])" "$q"
done <<EOF
$H&domMax=14
$H
$H&subdivision=Waterbridge
$H&subdivision=Plantation Lakes
$H&subdivision=Berkshire Forest-Carolina Forest
$H&subdivision=Carolina Forest - Avalon
$H&subdivision=The Parks of Carolina Forest
$H&subdivision=Indigo Bay
$H&subdivision=The Bluffs On The Waterway
$H&subdivision=Carolina Forest - The Farm
$H&has=new_construction
has=area_carolina_forest&type=condo&max=400000
has=area_carolina_forest&type=townhouse
$H&has=pool
EOF
