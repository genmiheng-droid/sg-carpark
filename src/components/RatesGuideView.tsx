import React from 'react';
import { BookOpen, DollarSign, Clock, ShieldCheck, HelpCircle, ExternalLink } from 'lucide-react';

export const RatesGuideView: React.FC = () => {
  return (
    <div id="singapore-rates-guide-view" className="w-full max-w-3xl mx-auto pb-24 animate-fadeIn">
      {/* View Header */}
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span>Singapore Parking Guide &amp; Tariffs</span>
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Essential rules, grace periods, HDB vs URA rates, and night caps
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="space-y-4">
        {/* HDB Standard Rates */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              HDB &amp; URA
            </span>
            <h3 className="text-sm font-bold text-white">Public Carpark Standard Rates</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-1">Outside Central Area</div>
              <div className="text-base font-extrabold text-emerald-400 mb-0.5">$0.60 / 30 mins</div>
              <div className="text-[11px] text-slate-400">7:00 AM – 10:30 PM (Per-minute charging via EPS)</div>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <div className="text-slate-400 font-semibold mb-1">Central Area (CBD, Orchard, Bugis, Chinatown)</div>
              <div className="text-base font-extrabold text-cyan-400 mb-0.5">$1.20 / 30 mins</div>
              <div className="text-[11px] text-slate-400">7:00 AM – 5:00 PM (Mondays to Saturdays), $0.60 thereafter</div>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
            <span>
              <strong>Night Parking Scheme:</strong> Capped at <strong>$5.00 max</strong> per night (10:30 PM – 7:00 AM)
            </span>
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0 ml-2" />
          </div>
        </div>

        {/* Grace Periods Guide */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Drop-offs &amp; Pick-ups
            </span>
            <h3 className="text-sm font-bold text-white">Grace Period Breakdown</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-medium">HDB &amp; URA EPS Electronic Gantries</span>
              <span className="font-bold text-cyan-400">15 Minutes (Grace Period)</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-medium">Shopping Malls (ION, Takashimaya, VivoCity, JEM)</span>
              <span className="font-bold text-slate-200">Usually 10 Minutes</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-950/50 rounded-xl border border-slate-800">
              <span className="text-slate-300 font-medium">Changi Airport &amp; Jewel Car Parks</span>
              <span className="font-bold text-emerald-400">10 Minutes (General), 15 Mins (Selected)</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            *Note: Exceeding the grace period by even 1 minute subjects your vehicle to parking charges calculated from entry time.
          </p>
        </div>

        {/* Free Parking Sunday / Public Holidays */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Free Parking Scheme (FPS)
            </span>
            <h3 className="text-sm font-bold text-white">Sundays &amp; Public Holidays</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            Most residential HDB carparks offer free parking on Sundays and gazetted Public Holidays between <strong>7:30 AM and 10:30 PM</strong>. Look out for the orange &quot;Free Parking on Sundays&quot; signboards at the gantry entrance.
          </p>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
            Commercial lots, loading bays, and red reserved season lots remain strictly restricted 24/7.
          </div>
        </div>

        {/* Official Resources Link */}
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Official Singapore Parking Services</div>
              <div className="text-[11px] text-slate-400">Powered by LTA DataMall, URA, and HDB Singapore</div>
            </div>
          </div>
          <a
            href="https://www.lta.gov.sg/content/ltagov/en/getting_around/driving_in_singapore.html"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
