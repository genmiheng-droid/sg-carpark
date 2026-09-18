import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Activity,
  Server,
  RefreshCw,
  Compass,
  Navigation,
  MapPin,
  Sparkles,
  Lock,
} from 'lucide-react';
import { OneMapTokenStatus } from '../types';

interface ApiSettingsViewProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  isLiveApiEnabled: boolean;
  onToggleLiveApi: (enabled: boolean) => void;
  onemapToken?: string;
  onSaveOnemapToken?: (token: string) => void;
}

export const ApiSettingsView: React.FC<ApiSettingsViewProps> = ({
  apiKey,
  onSaveApiKey,
  isLiveApiEnabled,
  onToggleLiveApi,
  onemapToken = '',
  onSaveOnemapToken,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'onemap' | 'lta'>('onemap');

  // LTA DataMall States
  const [inputLtaKey, setInputLtaKey] = useState(apiKey);
  const [ltaSavedSuccess, setLtaSavedSuccess] = useState(false);
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);
  const [isTestingCarparks, setIsTestingCarparks] = useState(false);
  const [carparkResult, setCarparkResult] = useState<any>(null);

  // OneMap States
  const [onemapStatus, setOnemapStatus] = useState<OneMapTokenStatus | null>(null);
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [inputDirectToken, setInputDirectToken] = useState(onemapToken);
  const [isMintingToken, setIsMintingToken] = useState(false);
  const [mintMessage, setMintMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // OneMap Testing States
  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const [searchTestResult, setSearchTestResult] = useState<any>(null);
  const [isTestingRevGeocode, setIsTestingRevGeocode] = useState(false);
  const [revGeocodeResult, setRevGeocodeResult] = useState<any>(null);
  const [isTestingRouting, setIsTestingRouting] = useState(false);
  const [routingResult, setRoutingResult] = useState<any>(null);

  // Snippets
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedOnemapCurl, setCopiedOnemapCurl] = useState(false);

  // Check OneMap token status on mount
  const refreshOnemapStatus = async () => {
    try {
      const res = await fetch('/api/onemap/token');
      if (res.ok) {
        const data = await res.json();
        setOnemapStatus(data);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshOnemapStatus();
  }, []);

  // Handle saving LTA Key
  const handleSaveLta = () => {
    onSaveApiKey(inputLtaKey.trim());
    setLtaSavedSuccess(true);
    setTimeout(() => setLtaSavedSuccess(false), 3000);
  };

  // Handle Minting OneMap Token (POST https://www.onemap.gov.sg/api/auth/post/getToken)
  const handleMintOnemapToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail.trim() || !inputPassword.trim()) {
      setMintMessage({ ok: false, text: 'Please enter both your OneMap email and password.' });
      return;
    }

    setIsMintingToken(true);
    setMintMessage(null);

    try {
      const res = await fetch('/api/onemap/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inputEmail.trim(),
          password: inputPassword.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.ok) {
        setMintMessage({
          ok: true,
          text: `Success! Minted 3-day token. Valid until ${new Date(data.expiresAt).toLocaleDateString()} ${new Date(data.expiresAt).toLocaleTimeString()}`,
        });
        if (data.token && onSaveOnemapToken) {
          onSaveOnemapToken(data.token);
          setInputDirectToken(data.token);
        }
        await refreshOnemapStatus();
      } else {
        const errorMsg = data.error || data.details?.error || 'Failed to mint token. Ensure password meets complexity requirements.';
        setMintMessage({ ok: false, text: errorMsg });
      }
    } catch (err: any) {
      setMintMessage({ ok: false, text: err.message || 'Network error minting token' });
    } finally {
      setIsMintingToken(false);
    }
  };

  // Handle Direct OneMap Token Save
  const handleSaveDirectToken = async () => {
    const trimmed = inputDirectToken.trim();
    if (!trimmed) return;

    try {
      const res = await fetch('/api/onemap/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: trimmed }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        if (onSaveOnemapToken) {
          onSaveOnemapToken(trimmed);
        }
        setMintMessage({ ok: true, text: 'Direct OneMap token saved to server memory!' });
        await refreshOnemapStatus();
        setTimeout(() => setMintMessage(null), 3000);
      }
    } catch (err: any) {
      setMintMessage({ ok: false, text: err.message });
    }
  };

  // Test OneMap Search
  const testOnemapSearch = async () => {
    setIsTestingSearch(true);
    setSearchTestResult(null);
    try {
      const res = await fetch('/api/onemap/search?q=raffles%20place');
      const data = await res.json();
      setSearchTestResult({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setSearchTestResult({ status: 500, ok: false, error: err.message });
    } finally {
      setIsTestingSearch(false);
    }
  };

  // Test OneMap Reverse Geocode
  const testOnemapRevGeocode = async () => {
    setIsTestingRevGeocode(true);
    setRevGeocodeResult(null);
    try {
      const res = await fetch('/api/onemap/revgeocode?location=1.3,103.8&buffer=40');
      const data = await res.json();
      setRevGeocodeResult({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setRevGeocodeResult({ status: 500, ok: false, error: err.message });
    } finally {
      setIsTestingRevGeocode(false);
    }
  };

  // Test OneMap Routing
  const testOnemapRouting = async () => {
    setIsTestingRouting(true);
    setRoutingResult(null);
    try {
      const res = await fetch(
        '/api/onemap/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk'
      );
      const data = await res.json();
      setRoutingResult({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setRoutingResult({ status: 500, ok: false, error: err.message });
    } finally {
      setIsTestingRouting(false);
    }
  };

  // Test Health Endpoint
  const testHealthEndpoint = async () => {
    setIsTestingHealth(true);
    setHealthResult(null);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthResult({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setHealthResult({ status: 500, ok: false, error: err.message });
    } finally {
      setIsTestingHealth(false);
    }
  };

  // Test Carpark Endpoint
  const testCarparkEndpoint = async () => {
    setIsTestingCarparks(true);
    setCarparkResult(null);
    try {
      const headers: Record<string, string> = {};
      if (inputLtaKey.trim()) {
        headers['AccountKey'] = inputLtaKey.trim();
      }
      const res = await fetch('/api/carparkavailability', { headers });
      const data = await res.json();
      setCarparkResult({ status: res.status, ok: res.ok, data });
    } catch (err: any) {
      setCarparkResult({ status: 500, ok: false, error: err.message });
    } finally {
      setIsTestingCarparks(false);
    }
  };

  const onemapCurlSnippet = `# 1. Mint a token (POST, JSON body; lasts 3 days):
curl -X POST "https://www.onemap.gov.sg/api/auth/post/getToken" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"your@email.com","password":"YourPassword123!"}'

# 2. Search (answers without token, or with token):
curl "https://www.onemap.gov.sg/api/common/elastic/search?searchVal=raffles%20place&returnGeom=Y&getAddrDetails=Y&pageNum=1"

# 3. Reverse Geocode (token required):
curl -H "Authorization: <ONEMAP_TOKEN>" \\
  "https://www.onemap.gov.sg/api/public/revgeocode?location=1.3,103.8&buffer=40&addressType=All"

# 4. Routing (token required):
curl -H "Authorization: <ONEMAP_TOKEN>" \\
  "https://www.onemap.gov.sg/api/public/routingsvc/route?start=1.320981,103.844150&end=1.326762,103.8559&routeType=walk"`;

  const ltaSampleSnippet = `// /api/carparkavailability.ts (Serverless Function Handler)
// Fetches real-time carpark lots across HDB, LTA, and URA
export default async function handler(req, res) {
  const accountKey = req.headers['accountkey'] || process.env.LTA_ACCOUNT_KEY;
  const response = await fetch(
    'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    {
      headers: {
        'AccountKey': accountKey || '',
        'accept': 'application/json'
      }
    }
  );
  const data = await response.json();
  return res.status(200).json(data);
}`;

  return (
    <div id="api-settings-view" className="w-full max-w-4xl mx-auto pb-24 animate-fadeIn">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <span>Singapore Government APIs Gateway</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Native serverless proxies configured for <strong>Singapore Land Authority (OneMap)</strong> and <strong>Land Transport Authority (LTA DataMall)</strong>.
        </p>
      </div>

      {/* Sub-Tabs: OneMap vs LTA */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('onemap')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'onemap'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4 text-cyan-400" />
          <span>Singapore OneMap API (SLA)</span>
          {onemapStatus?.configured && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('lta')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'lta'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>LTA DataMall API (Car Parks)</span>
          {isLiveApiEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* ========================================================= */}
      {/* ONEMAP SLA TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'onemap' && (
        <div className="space-y-5">
          {/* Status Badge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      onemapStatus?.configured ? 'bg-emerald-400' : 'bg-amber-400'
                    } animate-pulse`}
                  />
                  <span className="text-sm font-bold text-white">
                    OneMap Token Status:{' '}
                    {onemapStatus?.configured
                      ? 'Authenticated (Token Active)'
                      : 'Unauthenticated (Search works, Token needed for Routing & RevGeocode)'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {onemapStatus?.configured ? (
                    <>
                      Token preview: <code className="text-cyan-400 font-mono">{onemapStatus.tokenPreview}</code>
                      {onemapStatus.expiresAt && (
                        <span> &bull; Expires: {new Date(onemapStatus.expiresAt).toLocaleString()}</span>
                      )}
                    </>
                  ) : (
                    'Mint a 3-day token below with your OneMap account credentials or paste an existing token.'
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={refreshOnemapStatus}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh Status</span>
              </button>
            </div>
          </div>

          {/* Mint 3-Day Token Form */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Mint 3-Day OneMap Token</h3>
              </div>
              <a
                href="https://www.onemap.gov.sg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <span>Free OneMap Account</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Mint a token directly via <code className="text-cyan-400 font-mono">POST /api/auth/post/getToken</code> with your registered email and password.
              Once minted, the token automatically lasts <strong>3 days (72 hours)</strong> and unlocks government routing and reverse geocoding.
            </p>

            <form onSubmit={handleMintOnemapToken} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    OneMap Account Email
                  </label>
                  <input
                    id="input-onemap-email"
                    type="email"
                    value={inputEmail}
                    onChange={(e) => setInputEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    OneMap Password
                  </label>
                  <input
                    id="input-onemap-password"
                    type="password"
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    placeholder="Enter OneMap password"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  id="btn-mint-onemap-token"
                  type="submit"
                  disabled={isMintingToken}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isMintingToken ? 'Minting 3-Day Token...' : 'Mint 3-Day Token'}</span>
                </button>

                <span className="text-[11px] text-slate-500">
                  Password must include 3 of 4: lowercase, uppercase, number, symbol.
                </span>
              </div>

              {mintMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    mintMessage.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {mintMessage.ok ? (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{mintMessage.text}</span>
                </div>
              )}
            </form>

            {/* Direct Token Option */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Or Paste Existing ONEMAP_TOKEN
              </label>
              <div className="flex gap-2">
                <input
                  id="input-direct-onemap-token"
                  type="password"
                  value={inputDirectToken}
                  onChange={(e) => setInputDirectToken(e.target.value)}
                  placeholder="Paste raw OneMap token (Header: Authorization: <ONEMAP_TOKEN>)"
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleSaveDirectToken}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Token</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Endpoint Testers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Live OneMap API Testers</span>
            </h3>

            <div className="space-y-3">
              {/* 1. Search */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">GET</span>
                    <span className="text-xs font-mono font-bold text-white">/api/onemap/search?q=raffles place</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Searches Singapore building, road, and postal database. Answers without a token.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={testOnemapSearch}
                  disabled={isTestingSearch}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingSearch ? 'animate-spin' : ''}`} />
                  <span>{isTestingSearch ? 'Testing...' : 'Test Search'}</span>
                </button>
              </div>

              {searchTestResult && (
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono">
                  <div className="flex items-center justify-between mb-1 text-slate-400">
                    <span className="font-bold text-emerald-400">Results: {searchTestResult.data?.found || 0} found</span>
                    <button type="button" onClick={() => setSearchTestResult(null)} className="text-[10px] underline">Clear</button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] max-h-48 text-slate-300">
                    {JSON.stringify(searchTestResult.data, null, 2)}
                  </pre>
                </div>
              )}

              {/* 2. Reverse Geocode */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">GET</span>
                    <span className="text-xs font-mono font-bold text-white">/api/onemap/revgeocode?location=1.3,103.8&amp;buffer=40</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Converts GPS coordinates into Singapore street address. <span className="text-amber-400 font-semibold">Requires token</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={testOnemapRevGeocode}
                  disabled={isTestingRevGeocode}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingRevGeocode ? 'animate-spin' : ''}`} />
                  <span>{isTestingRevGeocode ? 'Testing...' : 'Test RevGeocode'}</span>
                </button>
              </div>

              {revGeocodeResult && (
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono">
                  <div className="flex items-center justify-between mb-1 text-slate-400">
                    <span className={`font-bold ${revGeocodeResult.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Status: {revGeocodeResult.status} {revGeocodeResult.ok ? 'OK' : '(Needs Token)'}
                    </span>
                    <button type="button" onClick={() => setRevGeocodeResult(null)} className="text-[10px] underline">Clear</button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] max-h-48 text-slate-300">
                    {JSON.stringify(revGeocodeResult.data || revGeocodeResult.error, null, 2)}
                  </pre>
                </div>
              )}

              {/* 3. Routing */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-mono text-[10px] font-bold">GET</span>
                    <span className="text-xs font-mono font-bold text-white">/api/onemap/route?start=1.3209,103.8441&amp;end=1.3267,103.8559&amp;routeType=walk</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Calculates pedestrian/vehicle paths and auto-decodes polyline geometry. <span className="text-amber-400 font-semibold">Requires token</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={testOnemapRouting}
                  disabled={isTestingRouting}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingRouting ? 'animate-spin' : ''}`} />
                  <span>{isTestingRouting ? 'Testing...' : 'Test Routing'}</span>
                </button>
              </div>

              {routingResult && (
                <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-mono">
                  <div className="flex items-center justify-between mb-1 text-slate-400">
                    <span className={`font-bold ${routingResult.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                      Status: {routingResult.status} {routingResult.ok ? `OK (${routingResult.data?.decoded_points?.length || 0} waypoints)` : '(Needs Token)'}
                    </span>
                    <button type="button" onClick={() => setRoutingResult(null)} className="text-[10px] underline">Clear</button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] max-h-48 text-slate-300">
                    {JSON.stringify(routingResult.data || routingResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* cURL Snippet */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">OneMap API Official Specifications</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(onemapCurlSnippet);
                  setCopiedOnemapCurl(true);
                  setTimeout(() => setCopiedOnemapCurl(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
              >
                {copiedOnemapCurl ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOnemapCurl ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
              {onemapCurlSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* LTA DATAMALL TAB */}
      {/* ========================================================= */}
      {activeSubTab === 'lta' && (
        <div className="space-y-5">
          {/* Endpoints Directory Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Configured Serverless Endpoints
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </div>

            <div className="space-y-2">
              {/* Endpoint 1 */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono text-[10px] font-bold">GET</span>
                    <span className="text-xs font-mono font-bold text-white">/api/health</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Health probe &amp; LTA key detection check.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={testHealthEndpoint}
                  disabled={isTestingHealth}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingHealth ? 'animate-spin' : ''}`} />
                  <span>{isTestingHealth ? 'Testing...' : 'Test Health'}</span>
                </button>
              </div>

              {healthResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono ${
                    healthResult.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">Status: {healthResult.status}</span>
                    <button type="button" onClick={() => setHealthResult(null)} className="text-[10px] underline text-slate-400">
                      Clear
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] leading-tight">
                    {JSON.stringify(healthResult.data || healthResult.error, null, 2)}
                  </pre>
                </div>
              )}

              {/* Endpoint 2 */}
              <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">GET</span>
                    <span className="text-xs font-mono font-bold text-white">/api/carparkavailability</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pulls real-time lots across HDB, LTA &amp; URA via <code className="text-emerald-400 font-mono">AccountKey</code> header.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={testCarparkEndpoint}
                  disabled={isTestingCarparks}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-all flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <RefreshCw className={`w-3 h-3 ${isTestingCarparks ? 'animate-spin' : ''}`} />
                  <span>{isTestingCarparks ? 'Testing...' : 'Test Endpoint'}</span>
                </button>
              </div>

              {carparkResult && (
                <div
                  className={`p-3 rounded-xl border text-xs font-mono ${
                    carparkResult.ok
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold">
                      Status: {carparkResult.status} {carparkResult.ok ? 'OK' : '(Expected without key)'}
                    </span>
                    <button type="button" onClick={() => setCarparkResult(null)} className="text-[10px] underline text-slate-400">
                      Clear
                    </button>
                  </div>
                  <pre className="overflow-x-auto text-[11px] leading-tight">
                    {JSON.stringify(carparkResult.data || carparkResult.error, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Mode Status Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${isLiveApiEnabled ? 'bg-emerald-400' : 'bg-cyan-400'} animate-pulse`} />
                  <span className="text-sm font-bold text-white">
                    Frontend Polling Mode: {isLiveApiEnabled ? 'Live LTA Proxy' : 'Curated Singapore Dataset'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {isLiveApiEnabled
                    ? 'App actively queries /api/carparkavailability for real-time lots.'
                    : 'App utilizes offline curated lot dataset across CBD, Marina Bay, Orchard, and Singapore town centres.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onToggleLiveApi(!isLiveApiEnabled)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                  isLiveApiEnabled
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                }`}
              >
                <span>{isLiveApiEnabled ? 'Switch to Curated Mode' : 'Enable Live Proxy'}</span>
              </button>
            </div>
          </div>

          {/* Key Configuration Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">LTA DataMall API Key (AccountKey)</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Supply your key as an environment variable (<code className="text-emerald-400 font-mono">LTA_ACCOUNT_KEY</code> in <code className="text-slate-300 font-mono">.env</code>), or paste it below to transmit securely via the <code className="text-emerald-400 font-mono">AccountKey</code> header.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  AccountKey Header Value
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-lta-api-key"
                    type="password"
                    value={inputLtaKey}
                    onChange={(e) => setInputLtaKey(e.target.value)}
                    placeholder="Paste your LTA DataMall AccountKey here..."
                    className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleSaveLta}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Key</span>
                  </button>
                </div>
              </div>

              {ltaSavedSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Key saved! Use the &quot;Test Endpoint&quot; button above to verify upstream connection.</span>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2">
                <span>Free Singapore LTA DataMall registration</span>
                <a
                  href="https://datamall.lta.gov.sg/content/datamall/en.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Get Free AccountKey</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Blueprint Code */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">/api/carparkavailability.ts Handler</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(ltaSampleSnippet);
                  setCopiedSnippet(true);
                  setTimeout(() => setCopiedSnippet(false), 2000);
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
              {ltaSampleSnippet}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
