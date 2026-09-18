import React, { useState } from 'react';
import { Key, Globe, Shield, CheckCircle2, AlertCircle, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'ready'>('idle');

  const handleSave = () => {
    onSaveApiKey(inputKey);
    setTestStatus('ready');
  };

  const sampleSnippet = `// Singapore LTA DataMall Carpark Availability v2 Fetcher
export async function fetchSingaporeCarparks(accountKey: string) {
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
  // Returns: { odata.metadata: "...", value: [{ CarParkID, Area, Development, Location, AvailableLots, LotType, Agency }] }
  return data.value;
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="api-settings-view" className="w-full max-w-3xl mx-auto pb-24 animate-fadeIn">
      {/* View Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Key className="w-5 h-5 text-emerald-400" />
          <span>API Connection &amp; Integration Setup</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Currently running in Frontend Mode. Plug in your Singapore LTA DataMall key when ready.
        </p>
      </div>

      {/* Mode Status Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-white">Current Mode: Frontend Prototype</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Active with high-fidelity Singapore carpark dataset across Orchard, CBD, Marina Bay, Tampines, and Jurong.
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
          <span>LTA DataMall AccountKey</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          When you receive your free API key from the Land Transport Authority (LTA) DataMall portal, paste your <code className="text-emerald-400 font-mono">AccountKey</code> below to activate live polling.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              AccountKey Header
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

          {testStatus === 'ready' && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Key saved locally! Ready for direct proxy connection.</span>
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

      {/* Code Snippet & Schema */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Integration Code Blueprint</h3>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Snippet'}</span>
          </button>
        </div>

        <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3.5 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
          {sampleSnippet}
        </pre>
      </div>
    </div>
  );
};
