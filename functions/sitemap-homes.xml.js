/**
 * /sitemap-homes.xml : the listing search's pages for search engines (contract §5).
 * The search page and every "homes in <place>" page; single listings only when
 * IDX_INDEX_LISTINGS=1 (from the CRM's sitemap feed, fetched at most once an hour).
 */
import { crm, idxOn } from "../idx-lib/crm.js";
import { PLACES } from "../idx-lib/places.js";
import { listingPath } from "../idx-lib/render.js";

const SITE = "https://chapter3realty.com";
const x = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

export async function onRequest(context) {
  const { env, request } = context;
  if (!idxOn(env, request).on || idxOn(env, request).preview) return new Response("Not found", { status: 404 });
  const urls = [`<url><loc>${SITE}/homes/</loc></url>`, ...Object.keys(PLACES).map((s) => `<url><loc>${SITE}/homes/near/${s}/</loc></url>`)];
  if (env.IDX_INDEX_LISTINGS === "1") {
    const r = await crm(env, request, "/api/idx/sitemap", { anonymous: true, cacheSeconds: 3600, timeoutMs: 25000 } /* the CRM may take several seconds; only crawlers wait here */);
    if (r.status === 200 && r.json && r.json.ok) {
      for (const l of Array.isArray(r.json.listings) ? r.json.listings : []) {
        if (!l || typeof l.mlsNumber !== "string" || !/^[A-Za-z0-9]{3,20}$/.test(l.mlsNumber)) continue;
        const mod = /^\d{4}-\d{2}-\d{2}$/.test(l.updatedOn || "") ? `<lastmod>${l.updatedOn}</lastmod>` : "";
        urls.push(`<url><loc>${x(SITE + listingPath(l))}</loc>${mod}</url>`);
      }
    }
  }
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`,
    { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
