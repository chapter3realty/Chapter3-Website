/**
 * "Homes near X" at the bottom of the website's own pages (CRM Ticket 404).
 *
 * The CRM's place catalog (src/lib/idx/places-catalog.ts) lists, per place,
 * the website paths whose bottom shows its block. For a page on that list,
 * this adds up to 3 places, 4 homes each, before </main>: rendered here at the
 * edge, so search engines see the links. Each card names its listing firm and
 * the MLS (CCMLS 16.14, 16.16), and the block ends with the disclaimer
 * (16.17). Only while the listing search is on (IDX_LIVE, idx-lib/crm.js),
 * and only from cached public answers: a blog page never waits on a registered
 * read and never carries visitor data.
 */
import { card, esc } from "./render.js";
import { crm, idxOn } from "./crm.js";

const MAX_PLACES = 3;
const CARDS = 4;

const BLOCK_STYLE = `<style>.hx-near{max-width:1180px;margin:0 auto;padding:2rem 1.25rem 2.5rem;color:var(--navy)}.hx-near h2{font-family:var(--serif);font-size:1.4rem;margin:1.4rem 0 .8rem}.hx-near .hx-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1rem}.hx-near .hx-card{background:#fff;border:1px solid var(--rule);border-radius:12px;overflow:hidden}.hx-near .hx-card-link{color:inherit;text-decoration:none;display:block}.hx-near .hx-photo{position:relative;aspect-ratio:4/3;background:var(--ivory-2)}.hx-near .hx-photo img{width:100%;height:100%;object-fit:cover;display:block}.hx-near .hx-nophoto{display:flex;align-items:center;justify-content:center;height:100%;color:var(--muted);font-size:.85rem}.hx-near .hx-status,.hx-near .hx-miles{position:absolute;top:.6rem;background:rgba(28,32,40,.82);color:#f4efe8;font-size:.72rem;padding:.2rem .55rem;border-radius:999px}.hx-near .hx-status{left:.6rem}.hx-near .hx-miles{right:.6rem}.hx-near .hx-card-body{padding:.8rem .9rem 1rem}.hx-near .hx-card-body p{margin:0 0 .3rem;font-size:.85rem;line-height:1.4}.hx-near .hx-price{font-size:1.1rem!important;font-weight:600}.hx-near .hx-addr{color:var(--muted)}.hx-near .hx-more{margin:.8rem 0 0;font-size:.9rem}.hx-near .hx-more a{color:var(--navy)}.hx-near .hx-fine{margin-top:1.2rem;font-size:.75rem;color:var(--muted);line-height:1.5}.hx-near .hx-fine a{color:var(--navy)}</style>`;

function normPath(p) {
  return `/${p.replace(/^\/+|\/+$/g, "")}/`.replace(/^\/\/$/, "/");
}

/** The response with the blocks added, or the response untouched. Never throws. */
export async function withNearBlocks(context, response) {
  try {
    const { request, env } = context;
    if (request.method !== "GET") return response;
    if (response.status !== 200) return response;
    if (!(response.headers.get("content-type") || "").includes("text/html")) return response;
    const url = new URL(request.url);
    if (url.pathname.startsWith("/homes") || url.pathname.startsWith("/homes-shell")) return response;
    if (!idxOn(env, request).on) return response;

    const list = await crm(env, request, "/api/idx/places", { anonymous: true });
    if (!list.json || !list.json.ok) return response;
    const path = normPath(url.pathname);
    const places = list.json.places.filter((p) => (p.pages || []).includes(path)).slice(0, MAX_PLACES);
    if (!places.length) return response;

    const blocks = [];
    let meta = null;
    for (const p of places) {
      const r = await crm(env, request, `/api/idx/places/${p.slug}`, { anonymous: true });
      if (!r.json || !r.json.ok || !r.json.listings.length) continue;
      meta = r.json.meta;
      const n = r.json.listings.length;
      const title = p.kind === "condo_building" ? `${p.name} condos for sale` : `Homes for sale near ${p.name}`;
      blocks.push(
        `<h2>${esc(title)}</h2><div class="hx-grid">${r.json.listings
          .slice(0, CARDS)
          .map((l) => card(l, { miles: l.miles }))
          .join("")}</div><p class="hx-more"><a href="/homes/near/${esc(p.slug)}/">See all ${esc(String(n))} ${n === 1 ? "home" : "homes"} ${p.kind === "condo_building" ? "at" : "near"} ${esc(p.name)}</a></p>`,
      );
    }
    if (!blocks.length || !meta) return response;
    const html = `${BLOCK_STYLE}<section class="hx-near" aria-label="Homes for sale nearby">${blocks.join("")}<p class="hx-fine">Source: ${esc(meta.source)}. ${esc(meta.disclaimer)} <a href="/homes/terms/">Listing search terms</a>.</p></section>`;
    const out = new HTMLRewriter().on("main", { element: (el) => el.append(html, { html: true }) }).transform(response);
    const headers = new Headers(out.headers);
    // The page now carries listing data refreshed every 10 minutes.
    headers.set("cache-control", "public, max-age=300");
    return new Response(out.body, { status: out.status, headers });
  } catch {
    return response;
  }
}
