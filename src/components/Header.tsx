import React, { useState, useEffect } from 'react';
import { Car, Clock, MapPin, Radio } from 'lucide-react';
import { SearchLocation } from '../types';

interface HeaderProps {
  activeLocation: SearchLocation;
  totalCarparks: number;
  totalAvailableLots: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeLocation,
  totalCarparks,
  totalAvailableLots,
}) => {
  const [sgTime, setSgTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format time in Singapore Timezone
      const formatter = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setSgTime(formatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-slate-950 font-black">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-white leading-none">
                SG Carpark
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>Singapore &bull; {activeLocation.name}</span>
            </div>
          </div>
        </div>

        {/* Live Singapore Clock & Stats Pill */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs border-r border-slate-800 pr-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium">Available Lots</div>
              <div className="font-extrabold text-emerald-400">{totalAvailableLots.toLocaleString()} Lots</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-medium">Car Parks</div>
              <div className="font-extrabold text-slate-200">{totalCarparks} Locations</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            <span className="font-medium">{sgTime || 'SGT'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
