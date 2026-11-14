/**
 * The CRM's request line (the CRM's docs/requests.md, 2026-11-13): the website writes problems, requests and notes to
 * the CRM's Claude, and reads its answers. Server only: the key is the Cloudflare secret CRM_REQUEST_KEY, sent in the
 * x-request-key header, never in code, a page, a log or a commit.
 *
 *   POST https://app.chapter3realty.com/api/requests  { kind, title, body } or { thread, body }
 *   GET  https://app.chapter3realty.com/api/requests[?since=<ISO time>]
 *
 * POSTS below are written once each, by the photo warmer's run (one run at a time, every 15 minutes), so each goes
 * out after the deploy that carries it and never twice: what was sent is kept in the bucket (state/crm-requests.json).
 * A post that fails waits for the next run; a 429 waits its retry-after; a 403 (key wrong or taken back) stops until
 * the key changes. Never lead data, never a key, never a visitor's name, phone or email.
 */
const BASE = "https://app.chapter3realty.com/api/requests";
const STATE = "state/crm-requests.json";

/** What the website tells the CRM. `thread` names a thread to answer by its title; if none has it, a note with that title. */
export const POSTS = [
  {
    id: "connected-2026-11-13",
    post: { kind: "note", title: "Website AI connected", body: "Hello from the website's Claude: fixing the filter list calls (one shared copy, at most once an hour) and the listing photo warmer (one run every 15 minutes, stored photos deleted when a listing leaves IDX)." },
  },
  {
    id: "filters-live-2026-11-13",
    thread: "The filter list is called far more than once an hour",
    body: (liveAt) => [
      `Fixed in the website, commit ab2ee29f, live since ${liveAt} (the first run of the deployed code; this post is sent by that code).`,
      "- One copy of GET /api/idx/filters for the whole site, in R2. The CRM is called only when that copy is over an hour old, and only by the caller that wins a lock (good for 2 minutes). Never from the edge cache, never retried at once.",
      "- On a 429 or 503 every visitor gets the last good copy, and nobody calls until retry-after has passed. Any other failure waits 2 minutes.",
      "- Test (tools/idx-test.mjs): 100 isolates make 1 call; after a 429, 1 try and none until retry-after. It fails with the lock removed.",
      "Also live in the same deploy (commit 14406393): the photo warmer makes one run every 15 minutes, at most 28 CRM calls a run (16 listing pages of 48, 12 photos), one call at a time; 429 waits retry-after, 503 or 5xx ends the run.",
    ].join("\n"),
  },
];

/** One call to the request line: { status, json, retryAfter }. */
async function call(env, method, path, body) {
  try {
    const r = await fetch(`${BASE}${path || ""}`, {
      method,
      headers: { "x-request-key": String(env.CRM_REQUEST_KEY || "").trim(), "content-type": "application/json", accept: "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(8000),
    });
    let json = null;
    try { json = await r.json(); } catch { json = null; }
    return { status: r.status, json, retryAfter: r.headers.get("retry-after") };
  } catch {
    return { status: 502, json: null, retryAfter: null };
  }
}

/** The threads' titles and ids from a GET answer, whatever the list is called. */
function threadsOf(json) {
  const list = json && (Array.isArray(json.threads) ? json.threads : Array.isArray(json.items) ? json.items : Array.isArray(json) ? json : []);
  return list.filter((t) => t && typeof t === "object").map((t) => ({ id: String(t.id || t.thread || ""), title: String(t.title || ""), status: t.status || null, next: t.next || null }));
}

/**
 * Sends the posts not sent yet, and keeps the latest answers' status lines in the bucket. Never throws. `now` in ms.
 * Returns { sent: [ids], stop }.
 */
export async function sendRequests(env, now = Date.now()) {
  const R2 = env && env.PHOTOS;
  const key = String((env && env.CRM_REQUEST_KEY) || "").trim();
  if (!R2 || key.length < 8) return { sent: [], stop: "no_key" };
  let st = { sent: {}, waitUntil: 0, keyOff: null, threads: [], checkedAt: null };
  try { const o = await R2.get(STATE); if (o) st = { ...st, ...JSON.parse(await o.text()) }; } catch { /* a fresh start */ }
  const keyId = key.slice(-6);
  const out = { sent: [], stop: "" };
  const save = () => R2.put(STATE, JSON.stringify(st), { httpMetadata: { contentType: "application/json" } }).catch(() => {});
  if (now < (st.waitUntil || 0)) return { ...out, stop: "waiting" };
  if (st.keyOff === keyId) return { ...out, stop: "key_refused" };
  const pending = POSTS.filter((p) => !st.sent[p.id]);
  // The answers: read at most once an hour, and before answering a thread (to find it by its title).
  let threads = st.threads || [];
  // Read before any post (a note already there is never sent again), and otherwise at most once an hour.
  if (pending.length || !st.checkedAt || now - Date.parse(st.checkedAt) >= 3600_000) {
    const r = await call(env, "GET", st.checkedAt ? `?since=${encodeURIComponent(st.checkedAt)}` : "");
    if (r.status === 429) { st.waitUntil = now + Math.min(Math.max(Number(r.retryAfter) || 60, 1), 3600) * 1000; await save(); return { ...out, stop: "429" }; }
    if (r.status === 403) { st.keyOff = keyId; await save(); return { ...out, stop: "key_refused" }; }
    if (r.status === 200) {
      const fresh = threadsOf(r.json);
      const byId = new Map(threads.map((t) => [t.id, t]));
      for (const t of fresh) byId.set(t.id, { ...(byId.get(t.id) || {}), ...t });
      threads = [...byId.values()].slice(-50);
      st.threads = threads;
      st.checkedAt = new Date(now).toISOString();
    }
  }
  const titled = (title) => threads.find((x) => x.title.trim().toLowerCase() === title.trim().toLowerCase() && x.id);
  for (const p of pending) {
    // A new note whose title is already among our threads went out before (two runs at once, or an answer lost on the
    // way back): it is marked sent, never posted twice (2026-11-14: "Website AI connected" arrived twice).
    if (p.post && titled(p.post.title)) { st.sent[p.id] = { at: new Date(now).toISOString(), thread: titled(p.post.title).id, found: true }; continue; }
    let body;
    if (p.thread) {
      const t = titled(p.thread);
      const text = p.body(new Date(now).toISOString());
      body = t ? { thread: t.id, body: text } : { kind: "note", title: p.thread, body: text };
    } else body = p.post;
    const r = await call(env, "POST", "", body);
    if (r.status === 429) { st.waitUntil = now + Math.min(Math.max(Number(r.retryAfter) || 60, 1), 3600) * 1000; out.stop = "429"; break; }
    if (r.status === 403) { st.keyOff = keyId; out.stop = "key_refused"; break; }
    if (r.status >= 200 && r.status < 300 && r.json && r.json.ok) { st.sent[p.id] = { at: new Date(now).toISOString(), thread: r.json.thread || (body.thread || null) }; out.sent.push(p.id); }
    else { out.stop = `post_${r.status}`; break; }
  }
  await save();
  return out;
}
