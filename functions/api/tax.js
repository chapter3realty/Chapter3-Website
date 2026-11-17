/**
 * GET /api/tax?pin=<11-digit Horry County PIN> : a parcel's real estate tax bills, read from the Horry County
 * Treasurer's public payment site (owner, 2026-11-14: "can we show tax amounts"; "whatever we can do for free
 * it should be part of that search"). For the property lookup on /buyers/property-records/.
 *
 * Returns { ok, bills: [{ year, status, paid, amount }], last: { year, appraisal, land, building, ratio,
 * assessed, countyTax, cityTax, fees, residential, homestead, other, total, acres } }. Never the owner's
 * name or address: the parser reads only the fields named here, by their element ids.
 * One parcel costs the Treasurer's site two page loads; the answer is kept 12 hours at the edge.
 */
const SITE = "https://horrycountytreasurer.qpaybill.com/Taxes/";
const UA = "Mozilla/5.0 (compatible; Chapter3RealtyLookup/1.0; +https://chapter3realty.com/buyers/property-records/)";
const num = (s) => { const v = String(s || "").replace(/[$,\s]/g, ""); return /^-?\d*\.?\d+$/.test(v) ? +v : null; };
const cell = (s) => s.replace(/<[^>]+>/g, "").replace(/&nbsp;|&amp;/g, " ").trim();

/** The list page: one row per bill, newest first. Real estate rows only. */
export function parseBills(html) {
  const out = [];
  for (const m of String(html).matchAll(/<tr class="gv(?:alt)?row">([\s\S]*?)<\/tr>/g)) {
    const c = [...m[1].matchAll(/<td>([\s\S]*?)<\/td>/g)].map((x) => cell(x[1]));
    if (c.length < 9 || c[5] !== "RealEstate" || !/^\d{4}$/.test(c[2])) continue;
    const link = /TaxesDetailsType4\.aspx\?receiptNo=(\d+)&amp;recID=(\d+)/.exec(m[1]);
    out.push({ year: +c[2], status: /^paid$/i.test(c[6]) ? "paid" : /^unpaid$/i.test(c[6]) ? "unpaid" : c[6].toLowerCase(), paid: /^\d\d\/\d\d\/\d\d$/.test(c[7]) ? c[7] : "", amount: num(c[8]), detail: link ? `TaxesDetailsType4.aspx?receiptNo=${link[1]}&recID=${link[2]}` : "" });
  }
  return out.sort((a, b) => b.year - a.year);
}

/** One bill's detail page: the county's value, the ratio and the parts of the bill, by element id only. */
export function parseDetail(html) {
  const s = String(html), id = (k) => { const m = new RegExp(`id="ctl00_MainContent_${k}"[^>]*>([^<]*)<`).exec(s); return m ? m[1].trim() : ""; };
  const parts = [...s.matchAll(/id="ctl00_MainContent_PanelAppraisal(\d+)"[\s\S]*?<td>\s*(\d+)%\s*<\/td>[\s\S]*?id="ctl00_MainContent_lblLand\1"[^>]*>([^<]*)<[\s\S]*?id="ctl00_MainContent_lblBuilding\1"[^>]*>([^<]*)</g)]
    .map((m) => ({ ratio: +m[2], land: num(m[3]), building: num(m[4]) })).filter((p) => p.land !== null || p.building !== null);
  const d = {
    year: num(id("lblTaxYr")), appraisal: num(id("lblMarketVal")), assessed: num(id("lblAssmt")), acres: num(id("lblAcres")),
    countyTax: num(id("lblCountyTax")), cityTax: num(id("lblCityTax")), fees: num(id("lblFees")), residential: num(id("lblResidential")),
    homestead: num(id("lblHomestead")), other: num(id("lblOther")), total: num(id("lblTotalTaxes")),
    ratio: parts.length === 1 ? parts[0].ratio : parts.length ? parts.map((p) => p.ratio).join("/") : null,
    land: parts.reduce((t, p) => t + (p.land || 0), 0) || null, building: parts.reduce((t, p) => t + (p.building || 0), 0) || null,
  };
  return d.year && d.total !== null ? d : null;
}

const json = (b, status, cc) => new Response(JSON.stringify(b), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": cc } });

/* The Treasurer's site answers a search with a 302 and keeps the search in its session cookie, so each hop
   carries the cookie by hand (a plain redirect would drop it and show an empty table). */
async function load(url, cookie) {
  let jar = cookie || "", at = url;
  for (let hop = 0; hop < 4; hop++) {
    const r = await fetch(at, { headers: { "user-agent": UA, ...(jar ? { cookie: jar } : {}) }, redirect: "manual", signal: AbortSignal.timeout(9000) });
    const set = (r.headers.get("set-cookie") || "").split(/,(?=\s*[A-Za-z0-9_.-]+=)/).map((c) => c.split(";")[0].trim()).filter(Boolean);
    if (set.length) jar = [...new Map([...jar.split("; ").filter(Boolean), ...set].map((c) => [c.split("=")[0], c])).values()].join("; ");
    const loc = r.headers.get("location");
    if (r.status >= 300 && r.status < 400 && loc) { at = new URL(loc, at).toString(); continue; }
    return { ok: r.ok, html: r.ok ? await r.text() : "", cookie: jar };
  }
  return { ok: false, html: "", cookie: jar };
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pin = url.searchParams.get("pin") || "";
  if (context.request.method !== "GET") return json({ ok: false }, 405, "no-store");
  if (!/^\d{11}$/.test(pin)) return json({ ok: false, error: "pin" }, 400, "no-store");
  const cache = caches.default, key = new Request(`https://chapter3realty.com/api/tax?pin=${pin}`);
  const hit = await cache.match(key);
  if (hit) return hit;
  try {
    const list = await load(`${SITE}TaxesDefaultType4.aspx?PIN=${pin}`);
    if (!list.ok) return json({ ok: false, error: "source" }, 502, "no-store");
    const bills = parseBills(list.html).slice(0, 6);
    let last = null;
    const done = bills.find((b) => b.detail);
    if (done) { const d = await load(SITE + done.detail, list.cookie); if (d.ok) last = parseDetail(d.html); }
    const res = json({ ok: true, bills: bills.map(({ detail, ...b }) => b), last }, 200, "public, max-age=43200");
    context.waitUntil(cache.put(key, res.clone()));
    return res;
  } catch {
    return json({ ok: false, error: "source" }, 502, "no-store");
  }
}
