/**
 * GET /api/lastsale?pin=<11-digit PIN>&book=<deed book>&page=<deed page> : the parcel's last recorded deed, read from
 * the Horry County Register of Deeds' public index (AcclaimWeb) by the book and page the county's parcel layer gives
 * for the parcel (owner, 2026-11-14: "last sold for", "whatever we can do for free it should be part of that search").
 * For the property lookup on /buyers/property-records/.
 *
 * Returns { ok, found, date, type, price, deed } where date is the record date (YYYY-MM-DD), type is the index's
 * document type, price is the deed's consideration in whole dollars or null when the index lists none, and deed is
 * true when the document is a deed. Never a name: the index row's party names are never read. A row counts only
 * when its parcel number is the PIN asked for, so a book and page shared with other papers cannot give a wrong parcel.
 * Three page loads at AcclaimWeb (a session, the terms step, the book and page search) and one grid read; the
 * answer is kept 24 hours at the edge.
 */
const SITE = "https://acclaimweb.horrycounty.org/AcclaimWeb/";
const UA = "Mozilla/5.0 (compatible; Chapter3RealtyLookup/1.0; +https://chapter3realty.com/buyers/property-records/)";

/** The grid's rows for one book and page: the one paper filed under this PIN. Fields are read by name; no party name is. */
export function parseGrid(text, book, page, pin) {
  let d;
  try { d = JSON.parse(text); } catch { return null; }
  if (!d || !Array.isArray(d.Data)) return null;
  const want = `${+book}/${+page}`;
  const rows = d.Data.filter((r) => r && String(r.BookPage).replace(/\b0+(?=\d)/g, "") === want && String(r.ParcelNumber || "").trim() === pin);
  if (!rows.length) return { found: false };
  const r = rows.find((x) => /^DEED/i.test(x.DocTypeDescription || "")) || rows[0];
  const ymd = /^(\d{4})\/(\d\d)\/(\d\d)/.exec(String(r.RecordDate || ""));
  const c = typeof r.Consideration === "number" ? r.Consideration : parseFloat(String(r.Consideration || "").replace(/[$,]/g, ""));
  return {
    found: true,
    date: ymd ? `${ymd[1]}-${ymd[2]}-${ymd[3]}` : "",
    type: String(r.DocTypeDescription || "").trim().toLowerCase(),
    deed: /^DEED/i.test(r.DocTypeDescription || ""),
    price: c > 0 ? Math.round(c) : null,
  };
}

const json = (b, status, cc) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": cc } });

/* One request that keeps the session cookie by hand, as functions/api/tax.js does. */
async function call(url, jar, init) {
  const r = await fetch(url, { ...init, headers: { "user-agent": UA, ...(init && init.headers), ...(jar.v ? { cookie: jar.v } : {}) }, redirect: "manual", signal: AbortSignal.timeout(9000) });
  const set = (r.headers.get("set-cookie") || "").split(/,(?=\s*[A-Za-z0-9_.-]+=)/).map((c) => c.split(";")[0].trim()).filter(Boolean);
  if (set.length) jar.v = [...new Map([...jar.v.split("; ").filter(Boolean), ...set].map((c) => [c.split("=")[0], c])).values()].join("; ");
  return r;
}
const form = (o) => ({ method: "POST", body: new URLSearchParams(o).toString(), headers: { "content-type": "application/x-www-form-urlencoded" } });

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pin = url.searchParams.get("pin") || "", book = url.searchParams.get("book") || "", page = url.searchParams.get("page") || "";
  if (context.request.method !== "GET") return json({ ok: false }, 405, "no-store");
  if (!/^\d{11}$/.test(pin) || !/^\d{1,5}$/.test(book) || !/^\d{1,5}$/.test(page)) return json({ ok: false, error: "query" }, 400, "no-store");
  const cache = caches.default, key = new Request(`https://chapter3realty.com/api/lastsale?pin=${pin}&book=${+book}&page=${+page}`);
  const hit = await cache.match(key);
  if (hit) return hit;
  try {
    const jar = { v: "" };
    await call(SITE, jar);
    await call(SITE + "search/Disclaimer", jar, form({ Disclaimer: "true" }));
    const s = await call(SITE + "search/SearchTypeBookPage?Length=6", jar, form({ BookNumber: String(+book), PageNumber: String(+page), BookTypesDisplay: "All", BookTypes: "All" }));
    if (!s.ok) return json({ ok: false, error: "source" }, 502, "no-store");
    const g = await call(SITE + "search/GridResults?Length=6", jar, form({ page: "1", size: "100", orderBy: "", groupBy: "", filter: "" }));
    if (!g.ok) return json({ ok: false, error: "source" }, 502, "no-store");
    const row = parseGrid(await g.text(), book, page, pin);
    if (!row) return json({ ok: false, error: "source" }, 502, "no-store");
    const res = json({ ok: true, ...row }, 200, "public, max-age=86400");
    context.waitUntil(cache.put(key, res.clone()));
    return res;
  } catch {
    return json({ ok: false, error: "source" }, 502, "no-store");
  }
}
