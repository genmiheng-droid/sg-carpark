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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

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
 * Primary Engine: Singapore OneMap Government Elastic Search
 * Fallback: OpenStreetMap Nominatim
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

    // 1. PRIMARY: Query Singapore OneMap Elastic Search
    const onemapToken =
      (typeof req.headers['authorization'] === 'string'
        ? req.headers['authorization'].replace(/^Bearer\s+/i, '').trim()
        : '') || process.env.ONEMAP_TOKEN;

    const onemapHeaders: Record<string, string> = { Accept: 'application/json' };
    if (onemapToken) {
      onemapHeaders['Authorization'] = onemapToken;
    }

    try {
      const onemapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(
        cleanQuery
      )}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const onemapRes = await fetch(onemapUrl, {
        headers: onemapHeaders,
        signal: controller.signal,
      }).finally(() => clearTimeout(timeout));

      if (onemapRes.ok) {
        const onemapData = await onemapRes.json();
        if (Array.isArray(onemapData.results) && onemapData.results.length > 0) {
          const results = onemapData.results.map((item: any) => {
            const lat = parseFloat(item.LATITUDE);
            const lng = parseFloat(item.LONGITUDE);
            const building = item.BUILDING && item.BUILDING !== 'NIL' ? item.BUILDING : '';
            const road = item.ROAD_NAME && item.ROAD_NAME !== 'NIL' ? item.ROAD_NAME : '';
            const postal = item.POSTAL && item.POSTAL !== 'NIL' ? `Singapore ${item.POSTAL}` : '';
            const searchVal = item.SEARCHVAL || building || road;

            let category: 'Road' | 'Building' | 'Landmark' | 'Transit' = 'Building';
            const upperSearch = searchVal.toUpperCase();
            if (upperSearch.includes('MRT') || upperSearch.includes('LRT') || upperSearch.includes('STATION')) {
              category = 'Transit';
            } else if (!building && road) {
              category = 'Road';
            } else if (item.BLK_NO || building) {
              category = 'Building';
            } else {
              category = 'Landmark';
            }

            return {
              id: `onemap-${item.POSTAL || ''}-${lat.toFixed(4)}-${lng.toFixed(4)}`,
              name: searchVal,
              displayName: item.ADDRESS || `${building ? building + ', ' : ''}${road}`,
              area: postal || 'Singapore',
              category,
              road: road || undefined,
              postal: item.POSTAL !== 'NIL' ? item.POSTAL : undefined,
              coordinates: {
                lat,
                lng,
              },
              source: 'onemap',
            };
          });

          geocodeCache.set(cacheKey, results);
          return sendJson(res, 200, {
            source: 'onemap',
            query: cleanQuery,
            results,
          });
        }
      }
    } catch (onemapErr) {
      console.warn('OneMap search warning, falling back to OSM:', onemapErr);
    }

    // 2. FALLBACK: OpenStreetMap Nominatim
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
            source: 'osm',
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
