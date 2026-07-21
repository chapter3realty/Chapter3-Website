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

// Address suggestions come from Photon (OpenStreetMap, free, no key), hard-limited
// to a Grand Strand bounding box. Without the box it returns Georgia and Maryland
// streets for Horry County queries. Photon sends no CORS header, which is the other
// reason this is proxied here rather than called from the browser.
const PHOTON = 'https://photon.komoot.io/api/';
const GRAND_STRAND_BBOX = '-79.6,33.05,-78.4,34.15'; // Horry + Georgetown counties

// Normalizing the address is what makes "same house, same numbers" work. Without
// it, "1201 N. Ocean Blvd" and "1201 n ocean blvd" would be two cache entries.
function normalizeAddress(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[.,#]/g, ' ')
    .replace(/\b(north|n)\b/g, 'n')
    .replace(/\b(south|s)\b/g, 's')
    .replace(/\b(east|e)\b/g, 'e')
    .replace(/\b(west|w)\b/g, 'w')
    .replace(/\b(street|st)\b/g, 'st')
    .replace(/\b(avenue|ave)\b/g, 'ave')
    .replace(/\b(boulevard|blvd)\b/g, 'blvd')
    .replace(/\b(drive|dr)\b/g, 'dr')
    .replace(/\b(road|rd)\b/g, 'rd')
    .replace(/\b(lane|ln)\b/g, 'ln')
    .replace(/\b(court|ct)\b/g, 'ct')
    .replace(/\b(circle|cir)\b/g, 'cir')
    .replace(/\b(highway|hwy)\b/g, 'hwy')
    .replace(/\b(unit|apt|suite|ste)\b/g, 'unit')
    .replace(/\s+/g, ' ')
    .trim();
}

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

/* --------------------------------------------------------------- suggest */

function photonLabel(p) {
  const line1 = [p.housenumber, p.street || p.name].filter(Boolean).join(' ');
  return {
    street: line1,
    city: p.city || p.district || p.county || '',
    state: p.state || '',
    zip: p.postcode || '',
    label: [line1, p.city || p.district, p.state, p.postcode].filter(Boolean).join(', '),
  };
}

async function handleSuggest(incoming, env, origin) {
  const q = String(incoming.q || '').trim();
  if (q.length < 3) return json({ suggestions: [] }, 200, origin);

  const key = `${CACHE_VERSION}:sug:` + (await sha256Hex(normalizeAddress(q)));
  if (env.ANALYSIS_CACHE) {
    const hit = await env.ANALYSIS_CACHE.get(key);
    if (hit) return new Response(hit, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-C3-Cache': 'hit', ...corsHeaders(origin) },
    });
  }

  const suggestions = [];

  // Both sources are queried in PARALLEL and merged, rather than using Census
  // only when Photon comes back empty. OpenStreetMap has good street coverage
  // but misses many individual Grand Strand homes; the Census TIGER database has
  // near-complete US address coverage but needs a fairly complete address. Asking
  // both and merging is what gets the whole service area to autocomplete instead
  // of just the streets OSM happens to know.
  const photonReq = (async () => {
    try {
      const url = `${PHOTON}?q=${encodeURIComponent(q)}&limit=8&lang=en&bbox=${GRAND_STRAND_BBOX}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'chapter3realty.com analyzer' } });
      const data = await res.json();
      return (data.features || [])
        .map((f) => {
          const out = photonLabel(f.properties || {});
          out.lat = f.geometry?.coordinates?.[1] ?? null;
          out.lng = f.geometry?.coordinates?.[0] ?? null;
          return out;
        })
        .filter((s) => s.street && s.lat != null);
    } catch (e) { return []; }
  })();

  const censusReq = (async () => {
    if (!/\d/.test(q)) return []; // needs a street number to match anything
    try {
      const res = await fetch(CENSUS_GEOCODER + encodeURIComponent(q));
      const data = await res.json();
      return (data?.result?.addressMatches || []).slice(0, 4).map((m) => {
        const parts = String(m.matchedAddress || '').split(',').map((x) => x.trim());
        return {
          street: parts[0] || m.matchedAddress,
          city: parts[1] || '',
          state: parts[2] || '',
          zip: parts[3] || '',
          label: m.matchedAddress,
          lat: m.coordinates?.y ?? null,
          lng: m.coordinates?.x ?? null,
        };
      }).filter((s) => s.street && s.lat != null);
    } catch (e) { return []; }
  })();

  const [fromPhoton, fromCensus] = await Promise.all([photonReq, censusReq]);

  // Photon first (better labels and it respects the bounding box), then any
  // Census match the same street is not already covering.
  const seen = new Set();
  for (const s of fromPhoton.concat(fromCensus)) {
    const k = normalizeAddress(s.street + ' ' + (s.zip || s.city || ''));
    if (seen.has(k)) continue;
    seen.add(k);
    suggestions.push(s);
  }

  const body = JSON.stringify({ suggestions: suggestions.slice(0, 6) });
  if (env.ANALYSIS_CACHE && suggestions.length) {
    // Shorter TTL than property data: suggestions are cheap to refetch and
    // OSM coverage improves over time.
    await env.ANALYSIS_CACHE.put(key, body, { expirationTtl: 60 * 60 * 24 * 30 });
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

/* ---------------------------------------------------------------- parcel */

// Horry County publishes its assessor file on the same ArcGIS server the permit
// lookup already uses. It is anonymous and CORS-open. This replaces the model's
// GUESSED market value and property tax with the county's actual record.
// It does NOT carry beds, baths, square footage or year built - those stay
// AI-estimated because no county source exists for them.
const HC_GEOCODER = 'https://www.horrycounty.org/gisweb/rest/services/Locators/Composite_Locator/GeocodeServer/findAddressCandidates';
const HC_PARCELS = 'https://www.horrycounty.org/gisweb/rest/services/Public/Parcels/MapServer/1/query';
const HC_FIELDS = 'TMS,MarketProp,MarketLand,MarketImprv,TaxableProp,AssessedProp,LandUseCode,TaxDistrict,Acreage,SaleDate,LegalDescr,CONDOLABEL';

// Horry County millage, expressed as a rate against ASSESSED value. Refresh each
// autumn when the county publishes the new rates (they are a PDF, not on the GIS
// server, so this cannot be looked up live).
const HC_MILLAGE = 0.1367;
const HC_MILLAGE_YEAR = '2025-2026';

async function hcJson(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  return res.json();
}

async function handleParcel(incoming, env, origin) {
  const address = String(incoming.address || '').trim();
  if (!address) return deny(400, 'Missing address.', origin);

  const key = `${CACHE_VERSION}:parcel:` + (await sha256Hex(normalizeAddress(address)));
  if (env.ANALYSIS_CACHE) {
    const hit = await env.ANALYSIS_CACHE.get(key);
    if (hit) return new Response(hit, {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-C3-Cache': 'hit', ...corsHeaders(origin) },
    });
  }

  let out = { found: false };
  try {
    // The county's own geocoder resolves its own addresses better than a national
    // one, and needs no key. Its coordinates also land inside the parcel polygon,
    // where a generic geocoder often lands in the road right-of-way instead.
    const g = await hcJson(`${HC_GEOCODER}?SingleLine=${encodeURIComponent(address)}&outFields=*&outSR=4326&f=json`);
    const cand = (g.candidates || [])[0];
    if (cand && cand.location) {
      const { x: lng, y: lat } = cand.location;
      const base = `${HC_PARCELS}?geometry=${lng},${lat}&geometryType=esriGeometryPoint&inSR=4326` +
                   `&spatialRel=esriSpatialRelIntersects&outFields=${HC_FIELDS}&returnGeometry=false&where=1%3D1&f=json`;
      let p = await hcJson(base);
      // A point on road frontage falls outside every polygon. Retry with a small
      // buffer and take the nearest match.
      if (!(p.features || []).length) {
        p = await hcJson(base + '&distance=100&units=esriSRUnit_Foot');
      }
      const feats = p.features || [];
      if (feats.length) {
        const a = feats[0].attributes || {};
        const taxable = Number(a.TaxableProp) || 0;
        const assessed = Number(a.AssessedProp) || 0;
        // Ratio is assessed over TAXABLE, not market. After a sale South Carolina's
        // ATI exemption caps taxable at 75% of market, so dividing by market gives
        // noise instead of a clean 4% or 6%.
        const ratio = taxable > 0 ? assessed / taxable : null;
        const isOwnerOccupied = ratio != null && Math.abs(ratio - 0.04) < 0.005;
        const investorAssessed = taxable > 0 ? taxable * 0.06 : null;
        out = {
          found: true,
          tms: a.TMS || null,
          marketValue: Number(a.MarketProp) || null,
          landValue: Number(a.MarketLand) || null,
          improvementValue: Number(a.MarketImprv) || null,
          taxableValue: taxable || null,
          assessedValue: assessed || null,
          assessmentRatio: ratio,
          currentlyOwnerOccupied: isOwnerOccupied,
          taxDistrict: a.TaxDistrict || null,
          landUseCode: a.LandUseCode || null,
          acreage: Number(a.Acreage) || null,
          legalDescription: a.LegalDescr || null,
          isCondo: !!a.CONDOLABEL,
          unitsAtThisPoint: feats.length, // a condo tower returns every stacked unit
          // 1900-01-01 in epoch ms is the county's "no recorded sale" sentinel.
          lastSaleDate: (a.SaleDate && a.SaleDate > -2208988800000) ? a.SaleDate : null,
          currentAnnualTax: assessed > 0 ? Math.round(assessed * HC_MILLAGE) : null,
          investorAnnualTax: investorAssessed ? Math.round(investorAssessed * HC_MILLAGE) : null,
          millage: HC_MILLAGE,
          millageYear: HC_MILLAGE_YEAR,
          source: 'Horry County Assessor, via county GIS',
          matchedAddress: cand.address || null,
        };
      }
    }
  } catch (e) {
    return json({ found: false, error: 'county records unavailable' }, 200, origin, { 'X-C3-Cache': 'error' });
  }

  const body = JSON.stringify(out);
  if (env.ANALYSIS_CACHE && out.found) {
    // Assessments change once a year, so this is safe to hold, and it keeps the
    // county's server out of the request path for repeat lookups.
    await env.ANALYSIS_CACHE.put(key, body, { expirationTtl: 60 * 60 * 24 * 120 });
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

  // THIS IS WHAT MAKES "SAME HOUSE, SAME NUMBERS" WORK.
  // When the client supplies cache_key -- the normalized address plus only the
  // property characteristics that legitimately change the answer (beds, baths,
  // sqft, fixer condition) -- we key on that instead of the whole request body.
  // Financing terms deliberately do NOT belong in the key: down payment, rate,
  // term and price are recomputed in the browser by recalcLtr(), so letting them
  // fragment the cache would hand two people different property facts for the
  // same house purely because one typed 20% down and the other typed 25%.
  // The client names the slot, so verify it is actually talking about the
  // property it claims. Without this check a console user could store invented
  // numbers under a real address and have them served to everyone afterwards.
  let scope = 'body:' + payload;
  if (typeof incoming.cache_key === 'string' && incoming.cache_key.trim()) {
    const claimed = normalizeAddress(incoming.cache_key);
    const prompt = normalizeAddress(JSON.stringify(body.messages));
    // The street number and name must appear in the prompt the model receives.
    const stem = claimed.split('|').filter(Boolean).slice(1).join(' ').split(' ').slice(0, 3).join(' ');
    if (stem && prompt.indexOf(stem) !== -1) scope = 'addr:' + claimed;
  }
  const key = `${CACHE_VERSION}:msg:` + (await sha256Hex(scope));

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

  // Only complete, successful answers are stored. A 200 is not enough: a reply
  // cut off at the token ceiling, or declined by a safety classifier, still
  // arrives as 200 and would otherwise become the permanent answer for that
  // address for a year, with no way to clear it except purging every address.
  let cacheable = upstream.ok;
  if (cacheable) {
    try {
      const parsed = JSON.parse(text);
      const stop = parsed && parsed.stop_reason;
      if (stop === 'max_tokens' || stop === 'refusal') cacheable = false;
      const blocks = (parsed && parsed.content) || [];
      const textOut = blocks.filter((b) => b.type === 'text').map((b) => b.text).join('');
      // The analyzer needs parseable JSON back. If it will not parse, storing it
      // would hand every later visitor the same instant failure.
      const a = textOut.indexOf('{'), z = textOut.lastIndexOf('}');
      if (a < 0 || z <= a) cacheable = false;
      else JSON.parse(textOut.slice(a, z + 1));
    } catch (e) {
      cacheable = false;
    }
  }
  if (env.ANALYSIS_CACHE && cacheable) {
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

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return deny(413, 'Request too large.', origin);

    let incoming;
    try {
      incoming = JSON.parse(raw);
    } catch (e) {
      return deny(400, 'Invalid JSON.', origin);
    }

    const path = new URL(request.url).pathname;

    // Autocomplete fires on almost every keystroke, so it must not draw on the
    // same budget as an analysis. Typing one address carefully used to be enough
    // to get "Too many requests" on the Analyze button, and a shared office IP
    // made it far worse. Only the expensive route is limited.
    if (path === '/geocode') return handleGeocode(incoming, env, origin);
    if (path === '/suggest') return handleSuggest(incoming, env, origin);
    if (path === '/parcel') return handleParcel(incoming, env, origin);

    if (env.RATE_LIMITER) {
      const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return deny(429, 'Too many requests. Please wait a moment.', origin);
    }
    return handleAnalysis(incoming, env, origin);
  },
};
