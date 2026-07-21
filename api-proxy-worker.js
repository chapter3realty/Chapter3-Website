/**
 * Chapter3 Realty API proxy - hardened + cached.
 *
 * Replaces the code at api-proxy.chapter3realty.workers.dev.
 *
 * WHY CACHING MATTERS (the main reason for this version):
 *   The analyzer's property value, rent, taxes, insurance and maintenance all
 *   come back from an AI model, which returns slightly different numbers every
 *   run. Two people analyzing the same address saw two different answers, and
 *   so did the same person running it twice. That is disqualifying for a tool
 *   you want lenders to use.
 *
 *   Every response is now stored in Cloudflare KV, keyed by a SHA-256 hash of
 *   the exact request. Identical request in, identical response out, for every
 *   visitor, permanently. The first person to analyze an address pays for the
 *   API call; everyone after that gets the stored answer for free.
 *
 *   To deliberately refresh all stored numbers, bump CACHE_VERSION below.
 *
 * ALSO IN THIS VERSION:
 *   - Locked to chapter3realty.com. It used to answer any website, so anyone
 *     reading the site's public JavaScript could use it as a free Anthropic
 *     proxy billed to your account.
 *   - The browser can no longer choose the model or the API path.
 *   - max_tokens and request body size are capped.
 *   - Per-IP rate limit.
 *   - /geocode endpoint using the free US Census geocoder, replacing the
 *     Google Maps call whose billing is disabled. That dead call is why the
 *     nearby-permits feature has never run for a single visitor.
 *
 * CLOUDFLARE SETUP (dashboard -> Workers & Pages -> api-proxy -> Settings):
 *   1. Variables and Secrets: secret ANTHROPIC_API_KEY  (already exists)
 *   2. Bindings -> KV namespace: create "c3-analysis-cache", bind as ANALYSIS_CACHE
 *   3. Bindings -> Rate limiting: name it RATE_LIMITER  (optional; see below)
 */

const ALLOWED_ORIGINS = [
  'https://chapter3realty.com',
  'https://www.chapter3realty.com',
  'http://localhost:4321', // local dev; remove if unwanted
];

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-4-5';
const MAX_TOKENS_CAP = 2000;
const MAX_BODY_BYTES = 24 * 1024;

// Bump this string to invalidate every stored answer at once.
const CACHE_VERSION = 'v1';
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 365; // 1 year

const CENSUS_GEOCODER =
  'https://geocoding.geo.census.gov/geocoder/locations/onelineaddress' +
  '?benchmark=Public_AR_Current&format=json&address=';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(obj, status, origin, extra) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? corsHeaders(origin) : {}),
      ...(extra || {}),
    },
  });
}

function deny(status, message, origin) {
  return json({ error: { message } }, status, origin);
}

async function sha256Hex(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---------------------------------------------------------------- geocode */

async function handleGeocode(incoming, env, origin) {
  const address = String(incoming.address || '').trim();
  if (!address) return deny(400, 'Missing address.', origin);

  const key = `${CACHE_VERSION}:geo:` + (await sha256Hex(address.toLowerCase().replace(/\s+/g, ' ')));

  if (env.ANALYSIS_CACHE) {
    const hit = await env.ANALYSIS_CACHE.get(key);
    if (hit) return new Response(hit, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-C3-Cache': 'hit', ...corsHeaders(origin) },
    });
  }

  let out = { lat: null, lng: null };
  try {
    const res = await fetch(CENSUS_GEOCODER + encodeURIComponent(address));
    const data = await res.json();
    const match = data?.result?.addressMatches?.[0];
    if (match?.coordinates) {
      out = { lat: match.coordinates.y, lng: match.coordinates.x };
    }
  } catch (e) {
    return json({ lat: null, lng: null, error: 'geocoder unavailable' }, 200, origin, {
      'X-C3-Cache': 'error',
    });
  }

  const body = JSON.stringify(out);
  // Only cache successful lookups, so a transient miss is not stored for a year.
  if (env.ANALYSIS_CACHE && out.lat != null) {
    await env.ANALYSIS_CACHE.put(key, body, { expirationTtl: CACHE_TTL_SECONDS });
  }
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-C3-Cache': env.ANALYSIS_CACHE ? 'miss' : 'disabled',
      ...corsHeaders(origin),
    },
  });
}

/* ------------------------------------------------------------- anthropic */

async function handleAnalysis(incoming, env, origin) {
  if (!Array.isArray(incoming.messages) || incoming.messages.length === 0) {
    return deny(400, 'Missing messages.', origin);
  }

  // Rebuild from scratch. Nothing the browser sent is forwarded except the
  // conversation itself, so a caller cannot swap the model, raise the token
  // ceiling, or point this at a different API path.
  const body = {
    model: MODEL,
    max_tokens: Math.min(Number(incoming.max_tokens) || 1200, MAX_TOKENS_CAP),
    messages: incoming.messages,
  };
  if (typeof incoming.system === 'string') body.system = incoming.system;

  const payload = JSON.stringify(body);
  const key = `${CACHE_VERSION}:msg:` + (await sha256Hex(payload));

  if (env.ANALYSIS_CACHE) {
    const hit = await env.ANALYSIS_CACHE.get(key);
    if (hit) {
      return new Response(hit, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-C3-Cache': 'hit', ...corsHeaders(origin) },
      });
    }
  }

  let upstream;
  try {
    upstream = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: payload,
    });
  } catch (e) {
    return deny(502, 'Upstream request failed.', origin);
  }

  const text = await upstream.text();

  // Only successful answers are stored, so an outage or rate-limit response
  // never becomes the permanent answer for an address.
  if (env.ANALYSIS_CACHE && upstream.ok) {
    await env.ANALYSIS_CACHE.put(key, text, { expirationTtl: CACHE_TTL_SECONDS });
  }

  return new Response(text, {
    status: upstream.status,
    headers: {
      'Content-Type': 'application/json',
      'X-C3-Cache': env.ANALYSIS_CACHE ? 'miss' : 'disabled',
      ...corsHeaders(origin),
    },
  });
}

/* ----------------------------------------------------------------- entry */

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const allowed = ALLOWED_ORIGINS.includes(origin);

    if (request.method === 'OPTIONS') {
      if (!allowed) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (!allowed) return deny(403, 'Origin not allowed.', null);
    if (request.method !== 'POST') return deny(405, 'Method not allowed.', origin);

    // Rate limit misses only would be ideal, but the limiter runs before we
    // know. The limit is set high enough that cached traffic is unaffected.
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

    const path = new URL(request.url).pathname;
    if (path === '/geocode') return handleGeocode(incoming, env, origin);
    return handleAnalysis(incoming, env, origin);
  },
};
