// Computes the long-term and short-term return tables and writes submarkets.json.
// Every input is labelled with its source in returns-facts.md. Run: node compute-returns.js
const fs=require('fs'),path=require('path');const D=__dirname;
const Z=require('./zillow-extract-summary.json');
const STR=JSON.parse(fs.readFileSync(path.join(D,'..','..','..','data','str-market.json'),'utf8'));
const zipRow=(k,z)=>Z[k].rows.find(r=>r.label===z);
const cityRow=(k,c)=>Z[k].rows.find(r=>r.label===c);
// AirROI peak/low month occupancy re-opened 2026-09-08 (see facts file section 1)
const airMonths={'myrtle-beach':{peak:['June',48.8],low:['January',23.5]},'murrells-inlet':{peak:['June',null],low:['January',null]},'surfside-beach':{peak:['June',null],low:['December',null]},'garden-city':{peak:['June',48.9],low:['January',27.6]},'north-myrtle-beach':{peak:['June',42.1],low:['January',24.3]},'pawleys-island':{peak:['June',46.3],low:['January',24.5]},'conway':{peak:['June',47.6],low:['January',28.0]},'little-river':{peak:['June',41.5],low:['January',25.3]}};
// page "illustrative" 12-month occupancy series (unsourced on the page; extracted 2026-09-08)
const pageOcc={'myrtle-beach':[19,22,39,52,69,84,90,85,63,51,29,21],'north-myrtle-beach':[23,29,42,59,66,81,88,79,61,56,33,23],'surfside-beach':[18,23,37,52,67,85,91,83,59,47,27,21],'garden-city':[17,20,33,48,68,84,90,82,58,42,24,16],'murrells-inlet':[30,32,41,52,63,74,79,75,60,53,37,31],'pawleys-island':[27,30,42,55,62,74,80,72,58,54,38,30],'little-river':[24,28,38,50,58,68,78,74,54,53,36,28],'conway':[34,35,40,44,48,52,54,53,46,44,38,34],'carolina-forest':null};
const subs=[
 {slug:'little-river',name:'Little River',zip:'29566',city:'Little River',mills:201.0,millsSrc:'Horry calculator: Unincorporated Horry (Carolina Forest, Socastee, Little River)',fmr3:1823,fmrArea:'Horry County (Myrtle Beach-North Myrtle Beach-Conway, SC HUD Metro FMR Area)',extraFee:0,pageMedian:'Redfin median near $292,000 (3 months ending May 2026); Zillow home-value index near $321,000',pageMedianSrc:'https://www.redfin.com/city/23919/SC/Little-River/housing-market (linked on page); Zillow not linked'},
 {slug:'north-myrtle-beach',name:'North Myrtle Beach',zip:'29582',city:'North Myrtle Beach',mills:216.2,millsSrc:'Horry calculator: North Myrtle Beach',fmr3:1823,fmrArea:'Horry County',extraFee:0,pageMedian:'$399,000 to $415,000 (early 2026, per Redfin and Zillow); 2BR condo median about $268,000; SF median well into the $600,000s',pageMedianSrc:'no Redfin or Zillow link on the page'},
 {slug:'myrtle-beach',name:'Myrtle Beach',zip:'29577',city:'Myrtle Beach',mills:254.6,millsSrc:'Horry calculator: City of Myrtle Beach (254.6 incl. 83.4 city)',fmr3:1823,fmrArea:'Horry County',extraFee:0,pageMedian:'Zillow city home-value index near $315,000 (early 2026, down about 3% YoY); SF $330,000s to high $380,000s; ZIPs about $275,000 (29577) to about $354,000 (29579)',pageMedianSrc:'no Zillow link on the page'},
 {slug:'carolina-forest',name:'Carolina Forest',zip:'29579',city:null,mills:201.0,millsSrc:'Horry calculator: Unincorporated Horry (Carolina Forest, Socastee, Little River)',fmr3:1823,fmrArea:'Horry County',extraFee:0,pageMedian:'Redfin median sale $418,000 (mid-2026, +7.7% YoY); SC Realtors ZIP 29579 SF median $464,710 (Dec 2025); condos near $215,500',pageMedianSrc:'no Redfin or SC Realtors link on the page; sources block lists Census Reporter, HCS, SCAC, SCDOI, FEMA'},
 {slug:'surfside-beach',name:'Surfside Beach',zip:'29575',city:'Surfside Beach',mills:214.2,millsSrc:'Horry calculator: Surfside Beach',fmr3:1823,fmrArea:'Horry County',extraFee:0,pageMedian:'Redfin around $530,000 (early 2026, blended); typical home-value index $347,000 to $360,000; detached SF into the $800,000s',pageMedianSrc:'no Redfin or Zillow link on the page'},
 {slug:'garden-city',name:'Garden City',zip:'29576',city:null,mills:207.3,millsSrc:'Horry calculator: Murrells Inlet / Garden City',fmr3:1823,fmrArea:'Horry County (Horry portion; Georgetown portion would use Georgetown County FMR $1,380)',extraFee:0,pageMedian:'Oceanfront/ocean-view condos low $200,000s to about $400,000; raised beach houses $600,000s past $1 million; Horry County oceanfront/resort condos about $238,825 median (early 2026)',pageMedianSrc:'no price source linked on the page'},
 {slug:'murrells-inlet',name:'Murrells Inlet',zip:'29576',city:'Murrells Inlet',mills:207.3,millsSrc:'Horry calculator: Murrells Inlet / Garden City (Horry side). Georgetown side District 41 = 248.8 mills at 6%',fmr3:1823,fmrArea:'Horry County (Georgetown portion: $1,380)',extraFee:0,pageMedian:'mid $330,000s to about $445,000 depending on source; Redfin near $360,000 (early 2026)',pageMedianSrc:'https://www.redfin.com/city/24397/SC/Murrells-Inlet/housing-market (linked on page)'},
 {slug:'pawleys-island',name:'Pawleys Island',zip:'29585',city:'Pawleys Island',mills:233.9,millsSrc:'Georgetown County calculator: District 4 East of Waccamaw River/Pawleys Island, 6% branch (.2339); Tax Information page example says 233.5',fmr3:1380,fmrArea:'Georgetown County, SC (non-metro FMR area)',extraFee:96,pageMedian:'Zillow home-value index near $514,000 (mid-2026, +5% YoY); median list mid $500,000s',pageMedianSrc:'https://www.zillow.com/home-values/35932/pawleys-island-sc/ (linked on page)'},
 {slug:'conway',name:'Conway',zip:'29526',city:'Conway',mills:269.3,millsSrc:'Horry calculator: Conway',fmr3:1823,fmrArea:'Horry County',extraFee:0,pageMedian:'Redfin median near $280,000 (3 months ending May 2026, -4.5% YoY); other trackers $300,000 to $320,000',pageMedianSrc:'https://www.redfin.com/city/4264/SC/Conway/housing-market (linked on page)'},
];
// Assumptions (labelled in the facts file)
const A={vacMaintBase:0.25,vacMaintLean:0.10,mgmtBase:0.10,mgmtLean:0.0,insLow:1700,insHigh:4400,insMid:3050,hoa:0,strExpLow:0.45,strExpHigh:0.65};
function ltr(price,rentMonthly,mills,extraFee,opts){const gross=rentMonthly*12;const vm=gross*opts.vm;const mg=gross*opts.mg;const tax=price*0.06*mills/1000+extraFee;const ins=opts.ins;const hoa=A.hoa;const noi=gross-vm-mg-tax-ins-hoa;return {gross,vm,mg,tax,ins,hoa,noi,cap:noi/price*100};}
const out=[];const md=[];
md.push('| Submarket | ZIP | ZHVI Jul 2026 | Rent used | Gross/yr | Vac+maint | Mgmt | Tax (6%) | Insurance | NOI base | Cap base | NOI lean | Cap lean |');
md.push('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
const md2=[];md2.push('| Submarket | Rent used | Max PITIA/mo at 1.00 | at 1.10 | at 1.25 | NOI base /mo | Max debt service/mo at NOI-based 1.20 |');md2.push('|---|---|---|---|---|---|---|');
const md3=[];md3.push('| Submarket | ZHVI Jul 2026 | AirROI avg revenue | NOI at 45% exp | Cap | NOI at 65% exp | Cap | Median listing x12 | Cap at 45% / 65% |');md3.push('|---|---|---|---|---|---|---|---|---|');
const f=n=>'$'+Math.round(n).toLocaleString('en-US');const p=n=>n.toFixed(2)+'%';
for(const s of subs){
  const zr=zipRow('zip_zori',s.zip),zh=zipRow('zip_zhvi',s.zip);
  const cr=s.city?cityRow('city_zori',s.city):null,ch=s.city?cityRow('city_zhvi',s.city):null;
  const price=zh.latest;
  const rents=[['FMR 3BR FY2027 '+f(s.fmr3),s.fmr3],['ZIP ZORI Jul 2026 '+f(zr.latest),zr.latest]];
  const rows={};
  for(const [lab,rent] of rents){
    const base=ltr(price,rent,s.mills,s.extraFee,{vm:A.vacMaintBase,mg:A.mgmtBase,ins:A.insMid});
    const lean=ltr(price,rent,s.mills,s.extraFee,{vm:A.vacMaintLean,mg:A.mgmtLean,ins:A.insLow});
    rows[lab]={base,lean};
    md.push(`| ${s.name} | ${s.zip} | ${f(price)} | ${lab} | ${f(base.gross)} | ${f(base.vm)} | ${f(base.mg)} | ${f(base.tax)} | ${f(base.ins)} | ${f(base.noi)} | ${p(base.cap)} | ${f(lean.noi)} | ${p(lean.cap)} |`);
    md2.push(`| ${s.name} | ${lab} | ${f(rent/1.0)} | ${f(rent/1.10)} | ${f(rent/1.25)} | ${f(base.noi/12)} | ${f(base.noi/12/1.20)} |`);
  }
  const strm=STR.markets.find(m=>m.slug===s.slug);
  let strOut=null;
  if(strm){const rev=strm.revenue,med=strm.median*12;const n45=rev*(1-A.strExpLow),n65=rev*(1-A.strExpHigh);strOut={avgRevenue:rev,medianListingAnnual:med,noi45:n45,noi65:n65,cap45:n45/price*100,cap65:n65/price*100,medCap45:med*(1-A.strExpLow)/price*100,medCap65:med*(1-A.strExpHigh)/price*100};
    md3.push(`| ${s.name} | ${f(price)} | ${f(rev)} | ${f(n45)} | ${p(strOut.cap45)} | ${f(n65)} | ${p(strOut.cap65)} | ${f(med)} | ${p(strOut.medCap45)} / ${p(strOut.medCap65)} |`);}
  else md3.push(`| ${s.name} | ${f(price)} | no AirROI market (404) | | | | | | |`);
  out.push({slug:s.slug,name:s.name,zip:s.zip,zip_note:s.slug==='garden-city'||s.slug==='murrells-inlet'?'29576 covers both Murrells Inlet and Garden City Beach; Zillow labels it City=Murrells Inlet, County=Horry':undefined,
    ltr_rent_zip:Math.round(zr.latest),ltr_rent_zip_yoy_pct:(zr.yoy==null||isNaN(zr.yoy))?null:+zr.yoy.toFixed(2),ltr_rent_zip_prior:(zr.v12==null||isNaN(zr.v12))?null:Math.round(zr.v12),ltr_rent_date:zr.latestDate,
    ltr_rent_city:cr?Math.round(cr.latest):null,ltr_rent_city_yoy_pct:(cr&&cr.yoy!=null&&!isNaN(cr.yoy))?+cr.yoy.toFixed(2):null,
    ltr_rent_fmr_3br_fy2027:s.fmr3,ltr_rent_fmr_area:s.fmrArea,
    zhvi:Math.round(price),zhvi_yoy:+zh.yoy.toFixed(2),zhvi_prior_year:Math.round(zh.v12),zhvi_date:zh.latestDate,zhvi_3y:Math.round(zh.v36),zhvi_5y:Math.round(zh.v60),zhvi_10y:Math.round(zh.v120),
    zhvi_city:ch?Math.round(ch.latest):null,zhvi_city_yoy:ch?+ch.yoy.toFixed(2):null,
    median_price:Math.round(price),median_price_basis:'Zillow ZHVI, ZIP '+s.zip+', all homes mid-tier smoothed seasonally adjusted, '+zh.latestDate,
    page_stated_medians:s.pageMedian,page_stated_medians_source:s.pageMedianSrc,
    str_occupancy:pageOcc[s.slug],str_occupancy_note:pageOcc[s.slug]?'12 monthly values as printed on the submarket page, labelled "illustrative" there and unsourced; the page prints each value twice (chart and table), 24 in all. Not AirROI data.':'Page states no STR market; AirROI 404',
    str_annual_occupancy_airroi_pct:strm?strm.occupancy:null,str_peak_low_month_occupancy_airroi:strm?airMonths[s.slug]:null,
    str_adr_airroi:strm?strm.adr:null,str_avg_annual_revenue_airroi:strm?strm.revenue:null,str_monthly_revenue_median:strm?strm.median:null,str_monthly_revenue_top10:strm?strm.top10:null,str_revenue_yoy_pct:strm?strm.yoy:null,str_active_listings:strm?strm.listings:null,str_data_through:'2026-08-08 (AirROI, August 2025 to July 2026)',
    property_tax_mills_6pct:s.mills,property_tax_mills_source:s.millsSrc,property_tax_extra_fees:s.extraFee,
    ltr_math:rows,str_math:strOut,
    sources:{zillow_zip_zori:'https://files.zillowstatic.com/research/public_csvs/zori/Zip_zori_uc_sfrcondomfr_sm_month.csv',zillow_zip_zhvi:'https://files.zillowstatic.com/research/public_csvs/zhvi/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv',zillow_city_zori:'https://files.zillowstatic.com/research/public_csvs/zori/City_zori_uc_sfrcondomfr_sm_month.csv',zillow_city_zhvi:'https://files.zillowstatic.com/research/public_csvs/zhvi/City_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv',hud_fmr_fy2027:'https://www.huduser.gov/portal/datasets/fmr/fmr2027/FY27_FMRs.xlsx',airroi:strm?strm.sourceUrl:null,horry_tax_calculator:'https://chapter3realty.com/buyers/property-taxes/ (Horry County certified 2025 millage embedded in the calculator)',georgetown_tax_calculator:s.slug==='pawleys-island'?'https://gtcountysc.gov/385/Property-Tax-Calculator':undefined,landlord_insurance:'https://chapter3realty.com/invest/landlord-insurance/',fannie_mae_75pct:'https://selling-guide.fanniemae.com/sel/b3-3.8-02/rental-income-subject-property',submarket_page:'https://chapter3realty.com/submarkets/'+s.slug+'/'}
  });
}
const meta={generated:'2026-09-08',assumptions:A,metro_zhvi:Z.metro_zhvi.rows,notes:'See returns-facts.md sections 5 and 6 for every label and source.'};
fs.writeFileSync(path.join(D,'submarkets.json'),JSON.stringify({meta,submarkets:out},null,1));
fs.writeFileSync(path.join(D,'returns-tables.md'),'## LTR\n'+md.join('\n')+'\n\n## PITIA ceilings\n'+md2.join('\n')+'\n\n## STR\n'+md3.join('\n')+'\n');
console.log(md.join('\n'));console.log();console.log(md2.join('\n'));console.log();console.log(md3.join('\n'));
