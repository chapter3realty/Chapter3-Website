// Usage (server on :8123 from chapter3realty/):
//   NODE_PATH=$(npm root -g) node tools/verify-idx-modal.js
// Every control in the listings pop-up must be reachable by scrolling the panel,
// at every width. The sticky footer used to cover all 28 of them on a phone.
const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  let fails = 0;
  for (const [w, hgt] of [[320, 720], [390, 844], [414, 896], [768, 1024], [1280, 900], [1440, 800]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: hgt }, hasTouch: w < 500, isMobile: w < 500 });
    const p = await ctx.newPage();
    const errs = [];
    p.on("pageerror", e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com|googletagmanager|google-analytics/, r => r.abort());
    await p.goto("http://127.0.0.1:8123/", { waitUntil: "load" });
    await p.evaluate(() => window.openIdx());
    await p.waitForTimeout(200);
    const res = await p.evaluate(async () => {
      const panel = document.querySelector(".idx-panel");
      const ctls = [...document.querySelectorAll("#idxModal select, #idxModal .idx-pill, #idxModal input, #idxModal button.btn")];
      const seen = new Set();
      const step = Math.max(80, Math.round(panel.clientHeight / 3));
      for (let top = 0; top <= panel.scrollHeight; top += step) {
        panel.scrollTop = top;
        await new Promise(r => requestAnimationFrame(r));
        ctls.forEach((c, i) => {
          const b = c.getBoundingClientRect();
          if (b.width < 4 || b.height < 4) return;
          if (b.top < 0 || b.bottom > window.innerHeight) return;
          const hit = document.elementFromPoint(Math.round(b.left + b.width / 2), Math.round(b.top + b.height / 2));
          if (hit === c || c.contains(hit) || c.contains(hit && hit.parentElement)) seen.add(i);
        });
      }
      panel.scrollTop = 0;
      const missed = ctls.map((c, i) => seen.has(i) ? null : (c.id || c.className || c.tagName) + ":" + (c.textContent || c.value || "").trim().slice(0, 14)).filter(Boolean);
      const foot = getComputedStyle(document.querySelector(".idx-foot"));
      return { total: ctls.length, reached: seen.size, missed, footPos: foot.position,
        scrollable: panel.scrollHeight > panel.clientHeight + 2, panelH: panel.clientHeight, scrollH: panel.scrollHeight };
    });
    const ok = res.reached === res.total && res.footPos === "static";
    if (!ok) fails++;
    console.log(`${ok ? "ok  " : "FAIL"} ${String(w).padStart(4)}x${hgt}  ${res.reached}/${res.total} controls reachable, footer ${res.footPos}, panel ${res.panelH} of ${res.scrollH}${res.missed.length ? "  MISSED: " + res.missed.join(", ") : ""}`);
    if (errs.length) { fails++; console.log("     page errors: " + errs.join(" | ")); }
    await ctx.close();
  }
  // the close button and the backdrop must still dismiss it
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const p = await ctx.newPage();
  await p.route(/fonts\.(googleapis|gstatic)\.com|googletagmanager|google-analytics/, r => r.abort());
  await p.goto("http://127.0.0.1:8123/", { waitUntil: "load" });
  await p.evaluate(() => window.openIdx());
  await p.click(".idx-close");
  const closed = await p.evaluate(() => !document.getElementById("idxModal").classList.contains("open") && document.body.style.overflow === "");
  console.log((closed ? "ok  " : "FAIL") + " close button dismisses it and frees the page scroll");
  if (!closed) fails++;
  await ctx.close();
  await b.close();
  console.log(fails ? "FAILS=" + fails : "ALL CHECKS PASS");
  process.exit(fails ? 1 : 0);
})();
