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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, AccountKey, accountkey, x-account-key, Authorization');

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

/**
 * Serverless Health Endpoint
 * GET /api/health
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

  const hasLtaKey = Boolean(
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    process.env.VITE_LTA_ACCOUNT_KEY
  );

  return sendJson(res, 200, {
    status: 'ok',
    service: 'Singapore Carpark Availability API',
    timestamp: new Date().toISOString(),
    ltaKeyConfigured: hasLtaKey,
    endpoints: {
      health: '/api/health',
      carparkAvailability: '/api/carparkavailability',
    },
    documentation: 'https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html',
  });
}
