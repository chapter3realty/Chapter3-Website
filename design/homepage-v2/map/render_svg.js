// Rasterize an SVG with Playwright Chromium, once per requested size.
//   NODE_PATH=$(npm root -g) node render_svg.js svg in.svg out.png width height [out2.png width2 height2 ...]
// The SVG has a viewBox and preserveAspectRatio="none", so it fills each viewport exactly.
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const [cmd, svg, ...rest] = process.argv.slice(2);
  if (cmd !== "svg" || !svg || rest.length % 3) throw new Error("usage: render_svg.js svg in.svg out.png w h [...]");
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium",
    args: ["--force-color-profile=srgb", "--disable-gpu"],
  });
  try {
    for (let i = 0; i < rest.length; i += 3) {
      const out = rest[i], width = +rest[i + 1], height = +rest[i + 2];
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      await page.goto("file://" + path.resolve(svg), { waitUntil: "load", timeout: 180000 });
      await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height }, timeout: 180000 });
      await page.close();
      console.log("  rendered", path.basename(out), width + "x" + height);
    }
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
