import React from 'react';
import { Carpark } from '../types';
import { getAvailabilityColor, formatDistance } from '../data/singaporeCarparks';
import {
  MapPin,
  Bookmark,
  Navigation,
  Clock,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark;
  isSelected: boolean;
  isSaved: boolean;
  onSelect: (cp: Carpark) => void;
  onToggleSave: (cp: Carpark) => void;
  onOpenDetails: (cp: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  isSelected,
  isSaved,
  onSelect,
  onToggleSave,
  onOpenDetails,
}) => {
  const color = getAvailabilityColor(carpark.availableLots, carpark.occupancyRate);
  const occupancyPercentage = Math.min(
    100,
    Math.round(((carpark.totalLots - carpark.availableLots) / carpark.totalLots) * 100)
  );

  return (
    <div
      id={`carpark-card-${carpark.id}`}
      className={`group relative bg-slate-900/90 border rounded-2xl p-4 transition-all duration-200 hover:shadow-xl hover:shadow-black/50 ${
        isSelected
          ? 'border-emerald-500/80 ring-2 ring-emerald-500/30 bg-slate-900'
          : 'border-slate-800/80 hover:border-slate-700/90'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Tag Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-800 text-slate-300 border border-slate-700/60">
              {carpark.agency}
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {carpark.carparkNumber}
            </span>

            {carpark.distanceMeters !== undefined && (
              <span className="flex items-center gap-0.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                <Navigation className="w-3 h-3 rotate-45" />
                {formatDistance(carpark.distanceMeters)}
              </span>
            )}
          </div>

          {/* Carpark Title */}
          <h3
            onClick={() => onSelect(carpark)}
            className="text-base font-bold text-slate-100 group-hover:text-white cursor-pointer transition-colors line-clamp-1"
            title={carpark.name}
          >
            {carpark.name}
          </h3>

          {/* Address */}
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            <span>{carpark.address}</span>
          </div>
        </div>

        {/* Real-Time Available Lots Counter Box */}
        <div className="flex flex-col items-end flex-shrink-0">
          <div className={`px-3 py-1.5 rounded-xl text-center shadow-md ${color.badgeBg}`}>
            <div className="text-xl font-black leading-tight tracking-tight">
              {carpark.availableLots}
            </div>
            <div className="text-[9px] font-bold uppercase tracking-wider">
              {color.label}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-medium">
            of {carpark.totalLots} total lots
          </div>
        </div>
      </div>

      {/* Lot Capacity Visual Progress Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
          <span>Occupancy</span>
          <span className="font-semibold text-slate-300">{occupancyPercentage}% occupied</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              occupancyPercentage >= 90
                ? 'bg-rose-500'
                : occupancyPercentage >= 70
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${occupancyPercentage}%` }}
          />
        </div>
      </div>

      {/* Rates & Features Row */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">
            {carpark.rateInfo.per30MinRate !== undefined
              ? `$${carpark.rateInfo.per30MinRate.toFixed(2)} / 30 mins`
              : 'Standard Rate'}
          </span>
          <span className="text-slate-400 text-[11px]">
            &bull; Grace: {carpark.rateInfo.gracePeriod}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          {carpark.hasEvCharging && (
            <span className="flex items-center gap-0.5 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
              <Zap className="w-3 h-3" /> EV
            </span>
          )}
          {carpark.heightLimit && (
            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
              {carpark.heightLimit}
            </span>
          )}
          {carpark.hasEps && (
            <span className="flex items-center gap-0.5 text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              <ShieldCheck className="w-3 h-3 text-cyan-400" /> EPS
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {/* Bookmark Button */}
          <button
            id={`btn-save-${carpark.id}`}
            type="button"
            onClick={() => onToggleSave(carpark)}
            className={`p-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Carpark'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {/* View on Map */}
          <button
            id={`btn-map-${carpark.id}`}
            type="button"
            onClick={() => onSelect(carpark)}
            className="p-1.5 rounded-lg bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:text-slate-200 hover:bg-slate-800 text-xs font-medium transition-colors flex items-center gap-1"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Map</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Details Modal Trigger */}
          <button
            id={`btn-details-${carpark.id}`}
            type="button"
            onClick={() => onOpenDetails(carpark)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Rates &amp; Info</span>
          </button>

          {/* External Google Maps Route */}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 flex items-center gap-1"
            title="Navigate with Google Maps"
          >
            <span>Go</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
