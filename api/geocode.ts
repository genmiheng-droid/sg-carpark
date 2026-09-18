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

function sendJson(res: ExtendedResponse, statusCode: number, data: unknown) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode);
    res.json(data);
    return;
  }

  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

// In-memory geocode cache
const geocodeCache = new Map<string, any[]>();

/**
 * Serverless Singapore Geocoding Endpoint
 * GET /api/geocode?q=...
 */
export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, HEAD');
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const parsedUrl = new URL(req.url || '', 'http://localhost');
    const queryParam = parsedUrl.searchParams.get('q') || parsedUrl.searchParams.get('query') || '';
    const cleanQuery = queryParam.trim();

    if (!cleanQuery) {
      return sendJson(res, 400, { error: 'Missing query parameter "q"' });
    }

    const cacheKey = cleanQuery.toLowerCase();
    if (geocodeCache.has(cacheKey)) {
      return sendJson(res, 200, {
        source: 'cache',
        query: cleanQuery,
        results: geocodeCache.get(cacheKey),
      });
    }

    // Expand common Singapore abbreviations for Nominatim
    let searchTerms = cleanQuery
      .replace(/\bave\b/gi, 'Avenue')
      .replace(/\brd\b/gi, 'Road')
      .replace(/\bst\b/gi, 'Street')
      .replace(/\bdr\b/gi, 'Drive')
      .replace(/\bjln\b/gi, 'Jalan')
      .replace(/\blor\b/gi, 'Lorong')
      .replace(/\bbt\b/gi, 'Bukit')
      .replace(/\bcres\b/gi, 'Crescent')
      .replace(/\bcl\b/gi, 'Close')
      .replace(/\bpl\b/gi, 'Place');

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      searchTerms + ', Singapore'
    )}&countrycodes=sg&format=json&addressdetails=1&limit=6`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const osmResponse = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SingaporeCarparkApp/1.0 (sg.carpark.applet)',
        Accept: 'application/json',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    if (!osmResponse.ok) {
      return sendJson(res, 200, { source: 'empty', query: cleanQuery, results: [] });
    }

    const items = await osmResponse.json();
    const results = Array.isArray(items)
      ? items.map((item: any) => {
          const addr = item.address || {};
          const road = addr.road || addr.pedestrian || addr.footway || '';
          const building = addr.building || addr.amenity || addr.shop || addr.commercial || '';
          const suburb = addr.suburb || addr.neighbourhood || addr.city_district || 'Singapore';

          let category: 'Road' | 'Building' | 'Landmark' | 'Transit' = 'Landmark';
          if (item.class === 'highway' || item.type === 'primary' || item.type === 'residential' || road) {
            category = 'Road';
          }
          if (building || item.class === 'building' || item.class === 'shop' || item.class === 'amenity') {
            category = 'Building';
          }
          if (item.class === 'railway' || item.type === 'subway') {
            category = 'Transit';
          }

          return {
            id: `osm-${item.place_id || Math.random().toString(36).slice(2)}`,
            name: item.name || cleanQuery,
            displayName: item.display_name,
            area: suburb,
            category,
            road: road || undefined,
            coordinates: {
              lat: parseFloat(item.lat),
              lng: parseFloat(item.lon),
            },
          };
        })
      : [];

    geocodeCache.set(cacheKey, results);

    return sendJson(res, 200, {
      source: 'osm',
      query: cleanQuery,
      results,
    });
  } catch (error: any) {
    return sendJson(res, 200, {
      source: 'fallback',
      query: req.url,
      results: [],
      error: error.message,
    });
  }
}
