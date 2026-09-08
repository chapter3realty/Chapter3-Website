// Extract Grand Strand rows from Zillow ZORI/ZHVI CSVs. Run: node extract-zillow.js
const fs=require('fs'),path=require('path');
const D=__dirname;
function parseCSV(text){const rows=[];let i=0,field='',row=[],q=false;for(;i<text.length;i++){const c=text[i];if(q){if(c==='"'){if(text[i+1]==='"'){field+='"';i++;}else q=false;}else field+=c;}else{if(c==='"')q=true;else if(c===','){row.push(field);field='';}else if(c==='\n'){row.push(field);rows.push(row);row=[];field='';}else if(c==='\r'){}else field+=c;}}if(field||row.length){row.push(field);rows.push(row);}return rows;}
function load(f){const t=fs.readFileSync(path.join(D,f),'utf8');const rows=parseCSV(t);const h=rows[0];return {h,rows:rows.slice(1).filter(r=>r.length>5)};}
const zips=['29566','29582','29572','29577','29579','29588','29575','29576','29585','29526','29527','29568'];
const cities=['Little River','North Myrtle Beach','Myrtle Beach','Surfside Beach','Garden City','Murrells Inlet','Pawleys Island','Conway','Longs','Carolina Forest','Socastee','Litchfield Beach'];
function lastIdx(h,r){for(let i=h.length-1;i>=0;i--){if(r[i]!==''&&r[i]!==undefined)return i;}return -1;}
function pick(h,r,label){const li=lastIdx(h,r);const latest=h[li];const v=parseFloat(r[li]);const i12=li-12;const v12=parseFloat(r[i12]);const i36=li-36,i60=li-60,i120=li-120;const out={label,latestDate:latest,latest:v,date12:h[i12],v12,yoy:(v/v12-1)*100};out.v36=parseFloat(r[i36]);out.d36=h[i36];out.v60=parseFloat(r[i60]);out.d60=h[i60];out.v120=parseFloat(r[i120]);out.d120=h[i120];return out;}
const out={};
// ZIP files
for(const [key,f] of [['zip_zori','Zip_zori_uc_sfrcondomfr_sm_month.csv'],['zip_zhvi','Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv']]){
  const {h,rows}=load(f);const ci=h.indexOf('RegionName');
  const sel=rows.filter(r=>zips.includes(r[ci]));
  out[key]={file:f,lastColumn:h[h.length-1],rows:sel.map(r=>{const p=pick(h,r,r[ci]);p.city=r[h.indexOf('City')];p.county=r[h.indexOf('CountyName')];p.metro=r[h.indexOf('Metro')];p.state=r[h.indexOf('State')];return p;})};
  // write CSV of full rows
  const csv=[h.join(',')].concat(sel.map(r=>r.join(','))).join('\n');fs.writeFileSync(path.join(D,`grand-strand-${key}-rows.csv`),csv);
}
for(const [key,f] of [['city_zori','City_zori_uc_sfrcondomfr_sm_month.csv'],['city_zhvi','City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv']]){
  const {h,rows}=load(f);const ci=h.indexOf('RegionName'),si=h.indexOf('State');
  const sel=rows.filter(r=>r[si]==='SC'&&cities.includes(r[ci]));
  out[key]={file:f,lastColumn:h[h.length-1],rows:sel.map(r=>{const p=pick(h,r,r[ci]);p.county=r[h.indexOf('CountyName')];p.metro=r[h.indexOf('Metro')];return p;})};
  const csv=[h.join(',')].concat(sel.map(r=>r.join(','))).join('\n');fs.writeFileSync(path.join(D,`grand-strand-${key}-rows.csv`),csv);
}
{
  const f='Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv';const {h,rows}=load(f);const ci=h.indexOf('RegionName');
  const sel=rows.filter(r=>/Myrtle Beach/i.test(r[ci])||r[ci]==='United States');
  out.metro_zhvi={file:f,lastColumn:h[h.length-1],rows:sel.map(r=>pick(h,r,r[ci]))};
  const csv=[h.join(',')].concat(sel.map(r=>r.join(','))).join('\n');fs.writeFileSync(path.join(D,'grand-strand-metro_zhvi-rows.csv'),csv);
}
fs.writeFileSync(path.join(D,'zillow-extract-summary.json'),JSON.stringify(out,null,1));
for(const k of Object.keys(out)){console.log('=== '+k+' ('+out[k].file+') last column '+out[k].lastColumn);for(const p of out[k].rows){console.log([p.label,p.city||'',p.county||'',p.metro||'',p.latestDate,p.latest.toFixed(0),p.date12,isNaN(p.v12)?'':p.v12.toFixed(0),isNaN(p.yoy)?'':p.yoy.toFixed(2)+'%','3y:'+(isNaN(p.v36)?'':p.v36.toFixed(0)),'5y:'+(isNaN(p.v60)?'':p.v60.toFixed(0)),'10y:'+(isNaN(p.v120)?'':p.v120.toFixed(0))].join(' | '));}}
