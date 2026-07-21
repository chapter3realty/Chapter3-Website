/**
 * Chapter3 Realty API proxy - hardened.
 *
 * Replaces the current api-proxy.chapter3realty.workers.dev code.
 *
 * What changed and why:
 *   1. Only chapter3realty.com can call it. It used to answer any website
 *      (Access-Control-Allow-Origin: *), so anyone who read the site's
 *      JavaScript could use this Worker as a free Anthropic proxy on your card.
 *   2. The caller can no longer choose the API path or the model. Those are
 *      fixed here. It used to accept x-api-path and x-api-name from the browser.
 *   3. max_tokens is capped, so nobody can run up a huge bill in one call.
 *   4. Per-IP rate limit.
 *   5. Request body size limit.
 *
 * Setup in the Cloudflare dashboard:
 *   Settings -> Variables -> add a SECRET named ANTHROPIC_API_KEY
 *   Settings -> Bindings -> add a Rate limiting binding named RATE_LIMITER
 *     (or delete the rate-limit block below if you would rather skip it)
 */

const ALLOWED_ORIGINS = [
  'https://chapter3realty.com',
  'https://www.chapter3realty.com',
  'http://localhost:4321', // local dev; remove if you do not want it
];

// Fixed server-side. The browser cannot change these.
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS_CAP = 2000;
const MAX_BODY_BYTES = 24 * 1024;

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function deny(status, message, origin) {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? corsHeaders(origin) : {}),
    },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === 'OPTIONS') {
      // Do not advertise access to origins we will not serve.
      if (!allowed) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (!allowed) return deny(403, 'Origin not allowed.', null);
    if (request.method !== 'POST') return deny(405, 'Method not allowed.', origin);

    // Per-IP rate limit. Delete this block if you did not add the binding.
    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return deny(429, 'Too many requests. Please wait a moment.', origin);
    }

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return deny(413, 'Request too large.', origin);

    let incoming;
    try {
      incoming = JSON.parse(raw);
    } catch (e) {
      return deny(400, 'Invalid JSON.', origin);
    }

    if (!Array.isArray(incoming.messages) || incoming.messages.length === 0) {
      return deny(400, 'Missing messages.', origin);
    }

    // Rebuild the request from scratch. Nothing the browser sent is forwarded
    // except the messages and system prompt, so a caller cannot swap the model,
    // raise the token ceiling, or redirect this to a different API path.
    const body = {
      model: MODEL,
      max_tokens: Math.min(Number(incoming.max_tokens) || 1200, MAX_TOKENS_CAP),
      messages: incoming.messages,
    };
    if (typeof incoming.system === 'string') body.system = incoming.system;

    let upstream;
    try {
      upstream = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      return deny(502, 'Upstream request failed.', origin);
    }

    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  },
};
