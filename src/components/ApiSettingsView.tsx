import React, { useState } from 'react';
import { Key, Globe, Shield, CheckCircle2, AlertCircle, Copy, Check, Terminal, ExternalLink, Activity, Server, RefreshCw } from 'lucide-react';

interface ApiSettingsViewProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  isLiveApiEnabled: boolean;
  onToggleLiveApi: (enabled: boolean) => void;
}

export const ApiSettingsView: React.FC<ApiSettingsViewProps> = ({
  apiKey,
  onSaveApiKey,
  isLiveApiEnabled,
  onToggleLiveApi,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Live testing state
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);
  const [isTestingCarparks, setIsTestingCarparks] = useState(false);
  const [carparkResult, setCarparkResult] = useState<any>(null);

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

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

  const testCarparkEndpoint = async () => {
    setIsTestingCarparks(true);
    setCarparkResult(null);
    try {
      const headers: Record<string, string> = {};
      if (inputKey.trim()) {
        headers['AccountKey'] = inputKey.trim();
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

  const sampleSnippet = `// /api/carparkavailability.ts (Serverless Function Handler)
// Fetches real-time carpark lots across HDB, LTA, and URA
export default async function handler(req, res) {
  const accountKey = req.headers['accountkey'] || process.env.LTA_ACCOUNT_KEY;
  if (!accountKey) {
    return res.status(401).json({ error: "Missing LTA AccountKey" });
  }

  const response = await fetch(
    'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    {
      headers: {
        'AccountKey': accountKey,
        'accept': 'application/json'
      }
    }
  );
  const data = await response.json();
  return res.status(200).json(data);
}`;

  const curlSnippet = `# Call serverless endpoints from terminal or backend:
curl -H "AccountKey: <YOUR_LTA_KEY>" /api/carparkavailability
curl /api/health`;

  return (
    <div id="api-settings-view" className="w-full max-w-3xl mx-auto pb-24 animate-fadeIn">
      {/* View Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <span>Serverless API Connection (LTA DataMall)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Serverless endpoints configured at project root level <code className="text-emerald-400 font-mono">/api</code>.
        </p>
      </div>

      {/* Endpoints Directory Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
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
                <span className="text-[10px] text-slate-500">(/api/health.ts)</span>
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
            <div className={`p-3 rounded-xl border text-xs font-mono ${healthResult.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">Status: {healthResult.status}</span>
                <button type="button" onClick={() => setHealthResult(null)} className="text-[10px] underline text-slate-400">Clear</button>
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
                <span className="text-[10px] text-slate-500">(/api/carparkavailability.ts)</span>
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
            <div className={`p-3 rounded-xl border text-xs font-mono ${carparkResult.ok ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold">Status: {carparkResult.status} {carparkResult.ok ? 'OK' : '(Expected without key or if key invalid)'}</span>
                <button type="button" onClick={() => setCarparkResult(null)} className="text-[10px] underline text-slate-400">Clear</button>
              </div>
              <pre className="overflow-x-auto text-[11px] leading-tight">
                {JSON.stringify(carparkResult.data || carparkResult.error, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Mode Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5">
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
                ? 'App will query /api/carparkavailability using your configured AccountKey on refresh.'
                : 'App uses high-fidelity baseline data with real coordinates and rate structures across Orchard, CBD, and heartlands.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => onToggleLiveApi(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                !isLiveApiEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demo Data
            </button>
            <button
              type="button"
              onClick={() => onToggleLiveApi(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isLiveApiEnabled
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Live API
            </button>
          </div>
        </div>
      </div>

      {/* API Key Configuration Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>LTA DataMall AccountKey Configuration</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          No keys are hardcoded in source. You can supply your key either as an environment variable (<code className="text-emerald-400 font-mono">LTA_ACCOUNT_KEY</code> in <code className="text-slate-300 font-mono">.env</code>), or paste it below to transmit securely via the <code className="text-emerald-400 font-mono">AccountKey</code> header.
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
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Paste your LTA DataMall AccountKey here..."
                className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Key</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
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

      {/* Code Snippets */}
      <div className="grid grid-cols-1 gap-4">
        {/* TypeScript Serverless Snippet */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">/api/carparkavailability.ts Blueprint</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(sampleSnippet);
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
            {sampleSnippet}
          </pre>
        </div>

        {/* cURL Snippet */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">CLI / cURL Usage</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(curlSnippet);
                setCopiedCurl(true);
                setTimeout(() => setCopiedCurl(false), 2000);
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCurl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
            {curlSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};

