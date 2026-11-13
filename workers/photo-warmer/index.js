/**
 * photo-warmer (2026-11-13): asks the site to run the listing-photo warmer once every 15 minutes, one request, and logs
 * the answer. All the work, its limits and the MLS licence rules are on the site (idx-lib/photo.js). This Worker
 * replaced one that called /homes/api/warm 18 times every minute (about 85 CRM calls a minute, 2026-11-12).
 *
 * Secret: WARM_KEY, the same value as the site's WARM_KEY (Cloudflare Pages, project chapter3realty).
 *   npx wrangler secret put WARM_KEY --config workers/photo-warmer/wrangler.json
 */
export default {
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runOnce(env));
  },
  // Visiting the Worker's own address does nothing: it is not a way to start a run.
  async fetch() {
    return new Response("Not found", { status: 404 });
  },
};

async function runOnce(env) {
  const key = String(env.WARM_KEY || "").trim();
  if (key.length < 20) { console.error("photo-warmer: no WARM_KEY secret; nothing was asked"); return; }
  try {
    const r = await fetch("https://chapter3realty.com/homes/api/warm", { headers: { "x-warm-key": key }, signal: AbortSignal.timeout(14 * 60_000) });
    const text = await r.text();
    if (r.status !== 200) console.error(`photo-warmer: ${r.status} ${text.slice(0, 300)}`);
    else console.log(`photo-warmer: ${text.slice(0, 1500)}`);
  } catch (e) {
    console.error(`photo-warmer: ${String((e && e.message) || e).slice(0, 300)}`);
  }
}
