// Build a self-contained preview of one page for the Artifact viewer.
// 2026-09-05: keeps every <style> block from the page head (the homepage carousel,
// chooser cards, search modal and dropdown nav live there; dropping them produced a
// preview the owner mistook for the page) and inlines local images as data URIs.
const fs=require("fs"),path=require("path");
const ROOT="/home/user/Chapter3-Website/chapter3realty";
const [rel,out,srcFile]=process.argv.slice(2);
let s=fs.readFileSync(srcFile||path.join(ROOT,rel.replace(/^\//,""),"index.html"),"utf-8");
const title=(s.match(/<title>([\s\S]*?)<\/title>/)||[,"Preview"])[1];
const headSrc=(s.match(/<head[^>]*>([\s\S]*?)<\/head>/)||[,""])[1];
const headStyles=[...headSrc.matchAll(/<style\b[^>]*>[\s\S]*?<\/style>/g)].map(m=>m[0]).join("\n");
let body=(s.match(/<body[^>]*>([\s\S]*?)<\/body>/)||[,s])[1];
// drop analytics and external loaders; inline our own bundles
body=body.replace(/<script[^>]*googletagmanager[^>]*>[\s\S]*?<\/script>/g,"").replace(/<script>[^<]*gtag\([\s\S]*?<\/script>/g,"");
body=body.replace(/<script src="\/assets\/([^"]+\.js)"[^>]*><\/script>/g,(m,f)=>{const p=path.join(ROOT,"assets",f);return fs.existsSync(p)?"<script>"+fs.readFileSync(p,"utf-8").replace(/AIza[0-9A-Za-z_-]{20,}/g,"YOUR_GOOGLE_MAPS_KEY").replace(/<\/script>/g,"<\\/script>")+"</script>":"";});
body=body.replace(/AIza[0-9A-Za-z_-]{20,}/g,"YOUR_GOOGLE_MAPS_KEY");
// local images as data URIs (webp, jpg, png, svg); video left alone
const MIME={webp:"image/webp",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",svg:"image/svg+xml",gif:"image/gif"};
let inlined=0;
body=body.replace(/\b(src|poster)="(\/[^"]+\.(webp|jpe?g|png|svg|gif))"/g,(m,attr,u,ext)=>{const p=path.join(ROOT,u.replace(/^\//,""));if(!fs.existsSync(p))return m;inlined++;return `${attr}="data:${MIME[ext.toLowerCase()]};base64,${fs.readFileSync(p).toString("base64")}"`;});
const css=fs.readdirSync(path.join(ROOT,"assets")).filter(f=>f.endsWith(".css")).map(f=>fs.readFileSync(path.join(ROOT,"assets",f),"utf-8")).join("\n");
const head=`<title>${title.replace(/\s*\|.*$/,"")}</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=DM+Sans:wght@300;400;500;600;700&display=swap">
<style>${css.replace(/url\((['"]?)\/assets\/[^)]+\)/g,"url()")}
#c3toast{position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#0b1f33;color:#f4efe8;padding:.7rem 1rem;border-radius:8px;font:14px/1.4 system-ui;z-index:99999;display:none;max-width:90vw}
</style>
${headStyles}
<script>
window.c3SendForm=function(){var t=document.getElementById('c3toast');t.textContent='Preview only: forms do not send from here.';t.style.display='block';setTimeout(function(){t.style.display='none'},2600);return false;};
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';if(/^(#|javascript:|tel:|mailto:)/.test(h))return;e.preventDefault();var t=document.getElementById('c3toast');t.textContent='Preview only: '+h+' opens on the live site.';t.style.display='block';setTimeout(function(){t.style.display='none'},2600);},true);
document.addEventListener('DOMContentLoaded',function(){try{localStorage.c3PopDone=1}catch(x){}});
</script>`;
const wantStyles=(headSrc.match(/<style\b/g)||[]).length;
if((headStyles.match(/<style\b/g)||[]).length!==wantStyles) throw new Error('preview dropped head style blocks: '+wantStyles+' in the page');
fs.writeFileSync(out,head+"\n"+body+'\n<div id="c3toast"></div>\n');
console.log(out,Math.round(fs.statSync(out).size/1024)+"KB","head styles:",(headStyles.match(/<style/g)||[]).length,"images inlined:",inlined);
