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

// In-memory cache to prevent exceeding LTA rate limits (DataMall updates every 1 minute)
interface CacheEntry {
  timestamp: number;
  data: unknown;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30_000; // 30 seconds

function sendJson(res: ExtendedResponse, statusCode: number, data: unknown, extraHeaders: Record<string, string> = {}) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey, x-account-key, Authorization');

  for (const [key, value] of Object.entries(extraHeaders)) {
    res.setHeader(key, value);
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

/**
 * Serverless Carpark Availability Endpoint
 * Pulls data from Singapore LTA DataMall CarParkAvailabilityv2
 * Target: https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
 * Header: AccountKey: <LTA_ACCOUNT_KEY>
 */
export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey, x-account-key, Authorization');
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    // Parse URL & Query params
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    const query = req.query || Object.fromEntries(parsedUrl.searchParams.entries());

    // 1. Resolve AccountKey: Request Header > Query Param > Environment Variable
    const rawHeaderKey =
      req.headers['accountkey'] ||
      req.headers['account-key'] ||
      req.headers['x-account-key'];

    const authHeader = typeof req.headers['authorization'] === 'string'
      ? req.headers['authorization'].replace(/^Bearer\s+/i, '').trim()
      : undefined;

    const headerKey = Array.isArray(rawHeaderKey) ? rawHeaderKey[0] : rawHeaderKey;
    const queryKey = query.accountKey || query.accountkey;
    const envKey = process.env.LTA_ACCOUNT_KEY || process.env.ACCOUNT_KEY || process.env.VITE_LTA_ACCOUNT_KEY;

    const accountKey = (headerKey || authHeader || queryKey || envKey || '').trim();

    if (!accountKey) {
      return sendJson(res, 401, {
        error: 'Missing LTA AccountKey',
        message:
          "Please configure the 'LTA_ACCOUNT_KEY' environment variable, or pass an 'AccountKey' header with your request.",
        help: 'Register for a free Singapore LTA DataMall account key at https://datamall.lta.gov.sg/content/datamall/en.html',
        targetEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
      });
    }

    const skipParam = query.skip || query.$skip || '0';
    const fetchAll = query.all === 'true' || query.fetchAll === 'true';

    // 2. Check cache
    const cacheKey = `${accountKey.slice(0, 6)}_${skipParam}_${fetchAll}`;
    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp) < CACHE_TTL_MS) {
      return sendJson(res, 200, cached.data, {
        'X-Cache': 'HIT',
        'X-Cache-Age-Seconds': Math.round((now - cached.timestamp) / 1000).toString(),
      });
    }

    // 3. Fetch from LTA DataMall
    const ltaBaseUrl = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

    if (fetchAll) {
      // Paginates through 500-record batches up to 10 pages (Singapore has ~2,200 carparks)
      const allCarparks: unknown[] = [];
      let currentSkip = 0;
      let hasMore = true;
      let metadata = '';
      const maxPages = 10;
      let page = 0;

      while (hasMore && page < maxPages) {
        const url = `${ltaBaseUrl}?$skip=${currentSkip}`;
        const response = await fetch(url, {
          headers: {
            AccountKey: accountKey,
            accept: 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return sendJson(res, response.status, {
            error: 'LTA DataMall API error',
            status: response.status,
            statusText: response.statusText,
            details: errorText,
          });
        }

        const json = await response.json();
        metadata = json['odata.metadata'] || metadata;
        const items = json.value || [];
        allCarparks.push(...items);

        if (items.length < 500) {
          hasMore = false;
        } else {
          currentSkip += 500;
          page += 1;
        }
      }

      const resultPayload = {
        'odata.metadata': metadata,
        totalFetched: allCarparks.length,
        timestamp: new Date().toISOString(),
        value: allCarparks,
      };

      cache.set(cacheKey, { timestamp: now, data: resultPayload });
      return sendJson(res, 200, resultPayload, { 'X-Cache': 'MISS' });
    }

    // Single page fetch
    const fetchUrl = Number(skipParam) > 0
      ? `${ltaBaseUrl}?$skip=${skipParam}`
      : ltaBaseUrl;

    const upstreamResponse = await fetch(fetchUrl, {
      headers: {
        AccountKey: accountKey,
        accept: 'application/json',
      },
    });

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      return sendJson(res, upstreamResponse.status, {
        error: 'LTA DataMall API error',
        status: upstreamResponse.status,
        statusText: upstreamResponse.statusText,
        details: errorText,
      });
    }

    const payload = await upstreamResponse.json();
    cache.set(cacheKey, { timestamp: now, data: payload });

    return sendJson(res, 200, payload, { 'X-Cache': 'MISS' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return sendJson(res, 500, {
      error: 'Internal Server Error',
      message,
    });
  }
}
