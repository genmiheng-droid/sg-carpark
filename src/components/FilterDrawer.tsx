import React from 'react';
import { FilterState, AgencyType, VehicleType } from '../types';
import { X, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalFilteredCount: number;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filterState,
  onUpdateFilter,
  onResetFilters,
  totalFilteredCount,
}) => {
  if (!isOpen) return null;

  const AGENCIES: (AgencyType | 'ALL')[] = ['ALL', 'HDB', 'URA', 'LTA', 'Mall', 'Commercial'];
  const VEHICLE_TYPES: { id: VehicleType; label: string }[] = [
    { id: 'car', label: 'Car (C)' },
    { id: 'motorcycle', label: 'Motorcycle (M)' },
    { id: 'heavy', label: 'Heavy Vehicle (H)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        id="filter-drawer-panel"
        className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto"
      >
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">Filter &amp; Sort Lots</h3>
            </div>
            <button
              id="btn-close-filter-drawer"
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sort By Options */}
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Sort By
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'distance', label: 'Nearest Distance' },
                { id: 'availability', label: 'Most Available Lots' },
                { id: 'price', label: 'Lowest Parking Rate' },
                { id: 'name', label: 'Carpark Name' },
              ].map((sortOption) => (
                <button
                  key={sortOption.id}
                  type="button"
                  onClick={() => onUpdateFilter({ sortBy: sortOption.id as any })}
                  className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                    filterState.sortBy === sortOption.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {sortOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Vehicle Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_TYPES.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => onUpdateFilter({ vehicleType: v.id })}
                  className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                    filterState.vehicleType === v.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agency Provider */}
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Carpark Operator / Agency
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AGENCIES.map((agency) => (
                <button
                  key={agency}
                  type="button"
                  onClick={() => onUpdateFilter({ agency })}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    filterState.agency === agency
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                      : 'bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {agency === 'ALL' ? 'All Operators' : agency}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Status */}
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Lot Availability Threshold
            </label>
            <div className="space-y-1.5">
              {[
                { id: 'ALL', label: 'Show All Lots (including full)' },
                { id: 'AVAILABLE_ONLY', label: 'Available Lots Only (>0 lots)' },
                { id: 'HIGH_ONLY', label: 'High Availability (>50 lots vacant)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateFilter({ availabilityStatus: opt.id as any })}
                  className={`w-full p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    filterState.availabilityStatus === opt.id
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold'
                      : 'bg-slate-800/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{opt.label}</span>
                  {filterState.availabilityStatus === opt.id && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Max Distance Radius */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Max Distance Radius
              </label>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {filterState.maxDistanceKm >= 15 ? 'Unlimited' : `${filterState.maxDistanceKm} km`}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={filterState.maxDistanceKm}
              onChange={(e) => onUpdateFilter({ maxDistanceKm: Number(e.target.value) })}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1 km</span>
              <span>5 km</span>
              <span>10 km</span>
              <span>All SG</span>
            </div>
          </div>

          {/* EV Charging Only Toggle */}
          <div className="mt-5 p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">EV Charging Stations Only</div>
              <div className="text-[11px] text-slate-400">Filter carparks equipped with electric vehicle chargers</div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateFilter({ showEvOnly: !filterState.showEvOnly })}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                filterState.showEvOnly ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  filterState.showEvOnly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 mt-6 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 text-center"
          >
            Show {totalFilteredCount} Car Parks
          </button>
        </div>
      </div>
    </div>
  );
};
