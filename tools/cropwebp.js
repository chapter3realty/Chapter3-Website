// explicit crop: in out sx sy side size quality
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [,, inp, out, sxA, syA, sideA, sizeA, qA] = process.argv;
  const sx = +sxA, sy = +syA, side = +sideA, size = +sizeA || 330, q = +qA || 0.86;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage();
  const data = 'data:image/jpeg;base64,' + fs.readFileSync(inp).toString('base64');
  const r = await p.evaluate(({ src, sx, sy, side, size, q }) => new Promise(res => {
    const i = new Image();
    i.onload = () => { const c = document.createElement('canvas'); c.width = size; c.height = size; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(i, sx, sy, side, side, 0, 0, size, size); res({ url: c.toDataURL('image/webp', q), png: c.toDataURL('image/png') }); };
    i.onerror = () => res({ err: true }); i.src = src;
  }), { src: data, sx, sy, side, size, q });
  fs.writeFileSync(out, Buffer.from(r.url.split(',')[1], 'base64'));
  fs.writeFileSync(out.replace(/\.webp$/, '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
  console.log(out, fs.statSync(out).size, 'bytes');
  await b.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
