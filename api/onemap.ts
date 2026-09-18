import type { IncomingMessage, ServerResponse } from 'http';

interface ExtendedRequest extends IncomingMessage {
  query?: Record<string, string>;
  url?: string;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface ExtendedResponse extends ServerResponse {
  status?: (statusCode: number) => ExtendedResponse;
  json?: (data: unknown) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

// In-memory token cache (tokens last 3 days)
interface TokenCache {
  token: string | null;
  expiryTimestamp: number; // ms
  email?: string;
}

const tokenState: TokenCache = {
  token: null,
  expiryTimestamp: 0,
};

function sendJson(res: ExtendedResponse, statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-onemap-token, onemap-token');

  for (const [k, v] of Object.entries(extraHeaders)) {
    res.setHeader(k, v);
  }

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode);
    res.json(data);
    return;
  }

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    ...extraHeaders,
  });
  res.end(JSON.stringify(data));
}

// Helper to read JSON request body
async function readJsonBody(req: ExtendedRequest): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

// Polyline decoder for routing geometry
function decodePolyline(encoded: string): [number, number][] {
  if (!encoded || typeof encoded !== 'string') return [];
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  try {
    while (index < len) {
      let b: number;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20 && index < len);
      const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20 && index < len);
      const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }
  } catch {
    // ignore decode error
  }
  return points;
}

/**
 * Resolves active OneMap token:
 * 1. Explicit Authorization / header from request
 * 2. In-memory cached token (if not expired)
 * 3. Static ONEMAP_TOKEN from process.env
 * 4. Auto-mint via ONEMAP_EMAIL & ONEMAP_PASSWORD if configured
 */
async function getEffectiveToken(req: ExtendedRequest): Promise<string | null> {
  const reqHeader =
    req.headers['authorization'] ||
    req.headers['x-onemap-token'] ||
    req.headers['onemap-token'];

  if (typeof reqHeader === 'string' && reqHeader.trim()) {
    return reqHeader.replace(/^Bearer\s+/i, '').trim();
  }

  // Check valid in-memory cache
  const now = Date.now();
  if (tokenState.token && tokenState.expiryTimestamp > now + 60_000) {
    return tokenState.token;
  }

  // Check static env token
  if (process.env.ONEMAP_TOKEN && process.env.ONEMAP_TOKEN.trim()) {
    return process.env.ONEMAP_TOKEN.trim();
  }

  // Try auto-minting if email and password exist in environment
  const email = process.env.ONEMAP_EMAIL?.trim();
  const password = process.env.ONEMAP_PASSWORD?.trim();

  if (email && password) {
    try {
      const mintRes = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (mintRes.ok) {
        const json = await mintRes.json();
        const token = json.access_token || json.token;
        if (token) {
          tokenState.token = token;
          // OneMap tokens last 3 days (259200 seconds)
          tokenState.expiryTimestamp = now + 3 * 24 * 60 * 60 * 1000 - 300_000;
          tokenState.email = email;
          return token;
        }
      }
    } catch (err) {
      console.warn('OneMap auto-mint failed:', err);
    }
  }

  return null;
}

/**
 * Serverless OneMap API Proxy Handler
 * Supports:
 * - POST /api/onemap/token (mint token using email & password or set token)
 * - GET  /api/onemap/token (check token status)
 * - GET  /api/onemap/search?q=...
 * - GET  /api/onemap/revgeocode?location=1.3,103.8&buffer=40
 * - GET  /api/onemap/route?start=1.32,103.84&end=1.326,103.85&routeType=walk|drive
 */
export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-onemap-token, onemap-token');
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    const pathname = parsedUrl.pathname.replace(/\/$/, '');
    const query = req.query || Object.fromEntries(parsedUrl.searchParams.entries());

    // Determine sub-action either from path or from ?action=
    let action = query.action;
    if (!action) {
      if (pathname.endsWith('/token')) action = 'token';
      else if (pathname.endsWith('/search')) action = 'search';
      else if (pathname.endsWith('/revgeocode')) action = 'revgeocode';
      else if (pathname.endsWith('/route')) action = 'route';
    }

    // ============================================================
    // 1. TOKEN MANAGEMENT & MINTING
    // ============================================================
    if (action === 'token') {
      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        const email = (body.email || '').trim();
        const password = (body.password || '').trim();
        const directToken = (body.token || '').trim();

        if (directToken) {
          tokenState.token = directToken;
          tokenState.expiryTimestamp = Date.now() + 3 * 24 * 60 * 60 * 1000;
          return sendJson(res, 200, {
            ok: true,
            message: 'OneMap token saved successfully',
            tokenPreview: directToken.slice(0, 10) + '...',
            expiresAt: new Date(tokenState.expiryTimestamp).toISOString(),
          });
        }

        if (!email || !password) {
          return sendJson(res, 400, {
            error: 'Missing email or password',
            message: 'Provide {"email": "...", "password": "..."} to mint a 3-day token.',
          });
        }

        // Call OneMap getToken
        const tokenRes = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const tokenJson = await tokenRes.json();

        if (!tokenRes.ok || tokenJson.error) {
          return sendJson(res, tokenRes.status || 400, {
            ok: false,
            error: tokenJson.error || 'Failed to mint OneMap token',
            details: tokenJson,
          });
        }

        const access_token = tokenJson.access_token || tokenJson.token;
        if (access_token) {
          tokenState.token = access_token;
          tokenState.expiryTimestamp = Date.now() + 3 * 24 * 60 * 60 * 1000 - 300_000;
          tokenState.email = email;

          return sendJson(res, 200, {
            ok: true,
            message: 'Token minted successfully from OneMap (lasts 3 days)',
            token: access_token,
            expiry_timestamp: tokenJson.expiry_timestamp,
            expiresAt: new Date(tokenState.expiryTimestamp).toISOString(),
          });
        }

        return sendJson(res, 400, {
          ok: false,
          error: 'Unexpected response from OneMap getToken',
          details: tokenJson,
        });
      }

      // GET /api/onemap/token -> check status
      const effectiveToken = await getEffectiveToken(req);
      const isConfigured = Boolean(effectiveToken);

      return sendJson(res, 200, {
        configured: isConfigured,
        hasEnvToken: Boolean(process.env.ONEMAP_TOKEN),
        hasEnvCredentials: Boolean(process.env.ONEMAP_EMAIL && process.env.ONEMAP_PASSWORD),
        isCached: Boolean(tokenState.token),
        cachedEmail: tokenState.email || null,
        expiresAt: tokenState.expiryTimestamp ? new Date(tokenState.expiryTimestamp).toISOString() : null,
        tokenPreview: effectiveToken ? effectiveToken.slice(0, 8) + '...' : null,
      });
    }

    // ============================================================
    // 2. SEARCH ENDPOINT
    // ============================================================
    if (action === 'search') {
      const searchVal = query.q || query.searchVal || query.query || '';
      const pageNum = query.pageNum || query.page || '1';

      if (!searchVal.trim()) {
        return sendJson(res, 400, { error: 'Missing searchVal or query "q"' });
      }

      const token = await getEffectiveToken(req);
      const headers: Record<string, string> = {
        Accept: 'application/json',
      };
      if (token) {
        headers['Authorization'] = token;
      }

      const oneMapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
        searchVal.trim()
      )}&returnGeom=Y&getAddrDetails=Y&pageNum=${pageNum}`;

      const upstreamRes = await fetch(oneMapUrl, { headers });
      const data = await upstreamRes.json();

      return sendJson(res, 200, {
        source: 'onemap',
        authenticated: Boolean(token),
        found: data.found ?? 0,
        totalNumPages: data.totalNumPages ?? 1,
        pageNum: parseInt(pageNum, 10),
        warning: data.error ?? null,
        results: data.results ?? [],
      });
    }

    // ============================================================
    // 3. REVERSE GEOCODE
    // ============================================================
    if (action === 'revgeocode') {
      let location = query.location || '';
      if (!location && query.lat && query.lng) {
        location = `${query.lat},${query.lng}`;
      }

      if (!location) {
        return sendJson(res, 400, {
          error: 'Missing location parameter',
          example: '/api/onemap/revgeocode?location=1.3,103.8&buffer=40',
        });
      }

      const buffer = query.buffer || '40';
      const addressType = query.addressType || 'All';
      const token = await getEffectiveToken(req);

      if (!token) {
        return sendJson(res, 401, {
          error: 'Authentication token required for OneMap reverse geocode',
          help: 'Mint a token via POST /api/onemap/token or configure ONEMAP_TOKEN / ONEMAP_EMAIL & ONEMAP_PASSWORD in environment.',
        });
      }

      const revUrl = `https://www.onemap.gov.sg/api/public/revgeocode?location=${encodeURIComponent(
        location
      )}&buffer=${buffer}&addressType=${addressType}`;

      const upstreamRes = await fetch(revUrl, {
        headers: {
          Authorization: token,
          Accept: 'application/json',
        },
      });

      const data = await upstreamRes.json();
      return sendJson(res, upstreamRes.status, data);
    }

    // ============================================================
    // 4. ROUTING SERVICE
    // ============================================================
    if (action === 'route') {
      const start = query.start || '';
      const end = query.end || '';
      const routeType = query.routeType || 'walk'; // walk, drive, cycle, pt

      if (!start || !end) {
        return sendJson(res, 400, {
          error: 'Missing start or end coordinates',
          example: '/api/onemap/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk',
        });
      }

      const token = await getEffectiveToken(req);

      if (!token) {
        return sendJson(res, 401, {
          error: 'Authentication token required for OneMap routing',
          help: 'Mint a token via POST /api/onemap/token or configure ONEMAP_TOKEN in environment.',
        });
      }

      const routeUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${encodeURIComponent(
        start
      )}&end=${encodeURIComponent(end)}&routeType=${encodeURIComponent(routeType)}`;

      const upstreamRes = await fetch(routeUrl, {
        headers: {
          Authorization: token,
          Accept: 'application/json',
        },
      });

      const data = await upstreamRes.json();

      if (!upstreamRes.ok || data.status !== 0) {
        return sendJson(res, upstreamRes.status || 400, data);
      }

      // Pre-decode route_geometry for frontend convenience
      const encodedGeometry = data.route_geometry;
      const decodedPoints = encodedGeometry ? decodePolyline(encodedGeometry) : [];

      return sendJson(res, 200, {
        status: data.status,
        status_message: data.status_message,
        routeType,
        total_time: data.route_summary?.total_time ?? 0,
        total_distance: data.route_summary?.total_distance ?? 0,
        decoded_points: decodedPoints,
        raw_summary: data.route_summary,
        route_geometry: encodedGeometry,
      });
    }

    // Default overview
    return sendJson(res, 200, {
      service: 'Singapore OneMap API Gateway',
      endpoints: {
        token: '/api/onemap/token (GET status, POST mint or set)',
        search: '/api/onemap/search?q=raffles%20place',
        revgeocode: '/api/onemap/revgeocode?location=1.3,103.8&buffer=40',
        route: '/api/onemap/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk',
      },
    });
  } catch (error: any) {
    return sendJson(res, 500, {
      error: 'OneMap API Internal Error',
      message: error?.message || String(error),
    });
  }
}
