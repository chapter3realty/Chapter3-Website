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

const RETRY_AFTER_SECONDS = 60 * 60 * 24 * 2; // 2 days; raise if the work runs long
const BYPASS_COOKIE = "c3_bypass";

export async function onRequest(context) {
  const { request, env, next } = context;

  if (env.MAINTENANCE !== "1") return next();

  const url = new URL(request.url);
  const secret = env.MAINTENANCE_BYPASS;

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
<title>Chapter3 Realty is back shortly</title>
<meta name="robots" content="noindex">
<style>
  :root{--navy:#10233c;--ivory:#f4efe8;--brass:#b08d57;--muted:#5b6472}
  *{box-sizing:border-box}
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       background:var(--navy);color:var(--ivory);padding:2rem;
       font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.7}
  .box{max-width:34rem;text-align:center}
  .mark{font-size:1.6rem;letter-spacing:.02em;margin-bottom:2rem;font-weight:500}
  .mark span{color:var(--brass)}
  h1{font-size:1.8rem;font-weight:400;margin:0 0 1rem;line-height:1.3}
  p{color:#c9d2de;margin:0 0 1rem}
  a{color:var(--brass);font-weight:600;text-decoration:none}
  .cta{display:inline-block;margin-top:1.5rem;padding:.85rem 1.6rem;border:1px solid var(--brass);
       border-radius:4px;color:var(--brass);font-weight:600}
</style>
</head>
<body>
  <div class="box">
    <div class="mark">Chapter<span>3</span></div>
    <h1>We are updating the site.</h1>
    <p>It will be back in a day or two. Nothing is wrong and your information is safe.</p>
    <p>If you need us now, call or text and we will pick up.</p>
    <a class="cta" href="tel:+18543332135">854.333.2135</a>
  </div>
</body>
</html>`;
