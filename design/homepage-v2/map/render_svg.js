// Rasterize an SVG with Playwright Chromium, once per requested size, or decode images the way the browser does.
//   NODE_PATH=$(npm root -g) node render_svg.js svg in.svg out.png width height [out2.png width2 height2 ...]
//   NODE_PATH=$(npm root -g) node render_svg.js decode in.avif out.png [in2.webp out2.png ...]
// The SVG has a viewBox and preserveAspectRatio="none", so it fills each viewport exactly.
// "decode" draws each image on an sRGB canvas in Chromium and saves the pixels as a PNG, so the build can
// check its anchors against what a browser shows, not only against ffmpeg's decoder.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const TYPES = { ".avif": "image/avif", ".webp": "image/webp", ".png": "image/png" };

(async () => {
  const [cmd, first, ...rest] = process.argv.slice(2);
  const args = [first, ...rest];
  if (!["svg", "decode"].includes(cmd) || !first) throw new Error("usage: render_svg.js svg in.svg out.png w h [...] | decode in out.png [...]");
  if (cmd === "svg" && rest.length % 3) throw new Error("usage: render_svg.js svg in.svg out.png w h [...]");
  if (cmd === "decode" && args.length % 2) throw new Error("usage: render_svg.js decode in out.png [...]");
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM || "/opt/pw-browsers/chromium",
    args: ["--force-color-profile=srgb", "--disable-gpu"],
  });
  try {
    if (cmd === "svg") {
      for (let i = 0; i < rest.length; i += 3) {
        const out = rest[i], width = +rest[i + 1], height = +rest[i + 2];
        const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
        await page.goto("file://" + path.resolve(first), { waitUntil: "load", timeout: 180000 });
        await page.screenshot({ path: out, clip: { x: 0, y: 0, width, height }, timeout: 180000 });
        await page.close();
        console.log("  rendered", path.basename(out), width + "x" + height);
      }
    } else {
      const page = await browser.newPage();
      for (let i = 0; i < args.length; i += 2) {
        const src = args[i], out = args[i + 1];
        const url = "data:" + TYPES[path.extname(src)] + ";base64," + fs.readFileSync(src).toString("base64");
        const png = await page.evaluate(async (url) => {
          const img = new Image();
          img.src = url;
          await img.decode();
          const c = document.createElement("canvas");
          c.width = img.naturalWidth;
          c.height = img.naturalHeight;
          c.getContext("2d", { colorSpace: "srgb" }).drawImage(img, 0, 0);
          return c.toDataURL("image/png").split(",")[1];
        }, url);
        fs.writeFileSync(out, Buffer.from(png, "base64"));
        console.log("  decoded", path.basename(src), "in Chromium");
      }
    }
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
