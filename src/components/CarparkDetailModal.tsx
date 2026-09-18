import React from 'react';
import { Carpark } from '../types';
import { getAvailabilityColor, formatDistance } from '../data/singaporeCarparks';
import {
  X,
  MapPin,
  Clock,
  Zap,
  ShieldCheck,
  ExternalLink,
  Bookmark,
  DollarSign,
  AlertCircle,
  Calendar,
  Layers,
  Code,
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (cp: Carpark) => void;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  isSaved,
  onClose,
  onToggleSave,
}) => {
  if (!carpark) return null;

  const color = getAvailabilityColor(carpark.availableLots, carpark.occupancyRate);
  const occupiedLots = Math.max(0, carpark.totalLots - carpark.availableLots);
  const occupancyPercentage = Math.min(
    100,
    Math.round((occupiedLots / carpark.totalLots) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        id="carpark-detail-modal"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 text-slate-100 relative"
      >
        {/* Close Button */}
        <button
          id="btn-close-detail-modal"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Agency and Code */}
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
            {carpark.agency}
          </span>
          <span className="font-mono text-xs text-slate-400">
            Code: {carpark.carparkNumber}
          </span>
          {carpark.distanceMeters !== undefined && (
            <span className="text-xs font-semibold text-cyan-400">
              &bull; {formatDistance(carpark.distanceMeters)} away
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white pr-8">{carpark.name}</h2>

        {/* Address */}
        <div className="flex items-start gap-1.5 text-xs text-slate-400 mt-1 mb-5">
          <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <span>{carpark.address}</span>
        </div>

        {/* Real-Time Availability Hero Meter */}
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-xs font-medium text-slate-400">Real-Time Availability</div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-white">{carpark.availableLots}</span>
                <span className="text-sm font-semibold text-slate-400">
                  / {carpark.totalLots} total lots
                </span>
              </div>
            </div>

            <div className={`px-3 py-1.5 rounded-xl text-center font-bold text-xs ${color.badgeBg}`}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color.dotColor} animate-pulse`} />
                <span>{color.label}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mb-2">
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

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{occupiedLots} Occupied</span>
            <span>Updated {carpark.lastUpdated}</span>
          </div>
        </div>

        {/* Rates & Parking Tariffs */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Parking Rates &amp; Charges</span>
          </h4>

          <div className="bg-slate-800/40 rounded-xl border border-slate-800 divide-y divide-slate-800/80 text-xs">
            <div className="p-3 flex items-start justify-between gap-3">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Monday – Friday
              </span>
              <span className="text-slate-200 font-semibold text-right max-w-[65%]">
                {carpark.rateInfo.weekdayRate}
              </span>
            </div>

            <div className="p-3 flex items-start justify-between gap-3">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Saturday
              </span>
              <span className="text-slate-200 font-semibold text-right max-w-[65%]">
                {carpark.rateInfo.saturdayRate}
              </span>
            </div>

            <div className="p-3 flex items-start justify-between gap-3">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Sunday &amp; Public Holidays
              </span>
              <span className="text-slate-200 font-semibold text-right max-w-[65%]">
                {carpark.rateInfo.sundayRate}
              </span>
            </div>

            {carpark.rateInfo.nightCap && (
              <div className="p-3 flex items-start justify-between gap-3">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Night Parking
                </span>
                <span className="text-emerald-400 font-semibold text-right max-w-[65%]">
                  {carpark.rateInfo.nightCap}
                </span>
              </div>
            )}

            <div className="p-3 flex items-start justify-between gap-3 bg-slate-900/50">
              <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
                Grace Period
              </span>
              <span className="text-cyan-400 font-bold">
                {carpark.rateInfo.gracePeriod}
              </span>
            </div>
          </div>
        </div>

        {/* Facility Information & Limits */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Gantry &amp; Amenities</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Height Limit</div>
              <div className="font-bold text-slate-200 mt-0.5">
                {carpark.heightLimit || 'Standard 2.1m'}
              </div>
            </div>

            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Payment System</div>
              <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {carpark.hasEps ? 'EPS (In-Vehicle Unit)' : 'Manual Coupon'}
              </div>
            </div>

            <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <div className="text-slate-400 text-[11px]">EV Charging</div>
              <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                {carpark.hasEvCharging ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>SP / Shell Recharge</span>
                  </>
                ) : (
                  <span className="text-slate-400">None</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* API Mapping Preview for User */}
        <div className="mb-6 p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-mono text-cyan-400">
              <Code className="w-3.5 h-3.5" />
              LTA DataMall Schema
            </span>
            <span className="text-slate-400 font-mono">CarParkAvailabilityv2</span>
          </div>
          <pre className="text-[10px] font-mono text-slate-300 bg-slate-900/90 p-2 rounded border border-slate-800 overflow-x-auto">
{JSON.stringify(
  {
    CarParkID: carpark.carparkNumber,
    Area: carpark.area,
    Development: carpark.name,
    Location: `${carpark.coordinates.lat} ${carpark.coordinates.lng}`,
    AvailableLots: carpark.availableLots,
    LotType: carpark.vehicleType === 'car' ? 'C' : 'M',
    Agency: carpark.agency,
  },
  null,
  2
)}
          </pre>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleSave(carpark)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400' : ''}`} />
            <span>{isSaved ? 'Saved in Bookmarks' : 'Save Carpark'}</span>
          </button>

          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>Start Navigation</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
