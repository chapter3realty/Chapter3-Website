/**
 * Maintenance mode for chapter3realty.com.
 *
 * OFF by default. Deploying this file changes nothing. It only activates when
 * the environment variable MAINTENANCE is set to "1" in the Cloudflare Pages
 * dashboard, which means you turn it on and off without a redeploy.
 *
 * WHY 503 AND NOT A NORMAL PAGE
 *
 * The damaging way to do maintenance is to serve a maintenance page with a
 * normal 200 status. Google then indexes that page's content for every URL on
 * the site, sees 69 identical thin pages, and can drop them from the index. A
 * 302 to /maintenance/ is also wrong: it reads as mass redirection.
 *
 * 503 means "temporarily unavailable, come back later". Google keeps the URLs
 * in the index and retries. Retry-After tells it when. This is the documented,
 * supported way to take a site down without losing rankings.
 *
 * Everything must 503, including the sitemap. Do NOT also block with
 * robots.txt: if Googlebot cannot fetch the page it never sees the 503, and a
 * robots.txt that 503s pauses crawling of the whole site.
 *
 * KEEP IT SHORT. A few days is fine. Past roughly two weeks Google starts
 * treating a persistent 503 as a real error and URLs begin dropping out.
 *
 * BYPASS: set MAINTENANCE_BYPASS to a secret word and visit
 * https://chapter3realty.com/?preview=<word> once. A cookie is set and you see
 * the real site while everyone else sees the notice. Crawlers never get it.
 */

/* =======================================================================
 *  TURN MAINTENANCE ON AND OFF HERE. Change this one word, then deploy.
 *
 *    true   site shows the notice and returns 503
 *    false  site is live as normal
 *
 *  Cloudflare Pages needs a deploy for a dashboard environment variable to
 *  take effect anyway, so flipping this line is strictly simpler than the
 *  dashboard and there is nothing to forget to switch back.
 * ======================================================================= */
const MAINTENANCE_ON = true;

const RETRY_AFTER_SECONDS = 60 * 60 * 24 * 2; // 2 days; raise if the work runs long
const BYPASS_COOKIE = "c3_bypass";

// Anyone who knows this can still view the live site while it is down:
// https://chapter3realty.com/?preview=<word>
const BYPASS_WORD = "letmein";

export async function onRequest(context) {
  const { request, env, next } = context;

  // env var still works, so the dashboard remains an option if you prefer it
  if (!MAINTENANCE_ON && env.MAINTENANCE !== "1") return next();

  const url = new URL(request.url);
  const secret = env.MAINTENANCE_BYPASS || BYPASS_WORD;

  // Grant a bypass cookie, then send you back to the same path without the query.
  if (secret && url.searchParams.get("preview") === secret) {
    url.searchParams.delete("preview");
    return new Response(null, {
      status: 302,
      headers: {
        Location: url.pathname + url.search,
        "Set-Cookie": `${BYPASS_COOKIE}=${secret}; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`,
      },
    });
  }
  if (secret && (request.headers.get("Cookie") || "").includes(`${BYPASS_COOKIE}=${secret}`)) {
    return next();
  }

  // Let Cloudflare keep serving the key file so IndexNow stays verifiable.
  if (/^\/[0-9a-fA-F]{8,128}\.txt$/.test(url.pathname)) return next();

  return new Response(PAGE, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": String(RETRY_AFTER_SECONDS),
      // never let a CDN or browser cache a 503 as if it were the real page
      "Cache-Control": "no-store, max-age=0, must-revalidate",
    },
  });
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Chapter3 Realty</title>
<meta name="robots" content="noindex">
<style>
  :root{--navy:#10233c;--ivory:#f4efe8;--brass:#b08d57;--muted:#5b6472}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:var(--navy);color:var(--ivory);padding:2rem;
       font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.7}
  .box{max-width:32rem;text-align:center}
  .mark{font-size:1.7rem;letter-spacing:.02em;margin-bottom:2.25rem;font-weight:500}
  .mark span{color:var(--brass)}
  h1{font-size:1.9rem;font-weight:400;margin:0 0 1rem;line-height:1.3}
  p{color:#c9d2de;margin:0 0 2rem;font-size:1.05rem}
  /* boxed, not an underlined link. A phone number sitting in body text reads as
     prose and gets skipped; the owner flagged that twice on the main site. */
  .cta{display:inline-block;padding:.9rem 1.9rem;border:1px solid var(--brass);border-radius:4px;
       color:var(--brass);font-weight:600;text-decoration:none;font-size:1.15rem;letter-spacing:.01em}
</style>
</head>
<body>
  <div class="box">
    <div class="mark">Chapter<span>3</span></div>
    <h1>We are updating our website.</h1>
    <p>We will return shortly. You can call or text us any time.</p>
    <a class="cta" href="tel:+18543332135">854.333.2135</a>
  </div>
</body>
</html>`;
