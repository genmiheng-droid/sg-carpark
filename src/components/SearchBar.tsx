import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, X, Navigation, RefreshCw, Car, Bike, Filter, Compass } from 'lucide-react';
import { POPULAR_LOCATIONS } from '../data/singaporeCarparks';
import { SearchLocation, FilterState } from '../types';

interface SearchBarProps {
  activeLocation: SearchLocation;
  onSelectLocation: (loc: SearchLocation) => void;
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  onUseCurrentLocation: () => void;
  onRefreshAvailability: () => void;
  isRefreshing: boolean;
  onOpenFilterDrawer: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  activeLocation,
  onSelectLocation,
  filterState,
  onUpdateFilter,
  onUseCurrentLocation,
  onRefreshAvailability,
  isRefreshing,
  onOpenFilterDrawer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(activeLocation.name);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal query with active location when it changes externally
  useEffect(() => {
    setQuery(activeLocation.name);
  }, [activeLocation]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(query.toLowerCase()) ||
    loc.area.toLowerCase().includes(query.toLowerCase()) ||
    loc.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (loc: SearchLocation) => {
    setQuery(loc.name);
    onSelectLocation(loc);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setIsOpen(true);
  };

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      {/* Search Input Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl shadow-black/40 p-2 sm:p-2.5 transition-all">
        <div className="flex items-center gap-2">
          {/* Search Icon / Indicator */}
          <div className="pl-2.5 text-emerald-400 flex-shrink-0">
            <Search className="w-5 h-5" />
          </div>

          {/* Text Input */}
          <input
            id="singapore-carpark-search-input"
            type="text"
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none px-1"
            placeholder="Search Singapore location (e.g. Orchard, MBS, Jurong)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />

          {/* Clear button if text entered */}
          {query && (
            <button
              id="btn-clear-search"
              type="button"
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* GPS Current Location button */}
          <button
            id="btn-gps-current-location"
            type="button"
            onClick={onUseCurrentLocation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            title="Use current location"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Near Me</span>
          </button>

          {/* Refresh Real-Time Lots button */}
          <button
            id="btn-refresh-lots"
            type="button"
            onClick={onRefreshAvailability}
            disabled={isRefreshing}
            className={`p-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-800/50 text-slate-300 hover:text-white transition-all ${
              isRefreshing ? 'animate-spin text-emerald-400' : ''
            }`}
            title="Refresh Real-Time Lot Availability"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Filter Pill Chips */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar text-xs">
          {/* Vehicle Type Toggle */}
          <button
            id="filter-car-toggle"
            type="button"
            onClick={() => onUpdateFilter({ vehicleType: 'car' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterState.vehicleType === 'car'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Cars</span>
          </button>

          <button
            id="filter-motorcycle-toggle"
            type="button"
            onClick={() => onUpdateFilter({ vehicleType: 'motorcycle' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterState.vehicleType === 'motorcycle'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Bikes</span>
          </button>

          {/* Agency Filter Chips */}
          <div className="h-4 w-px bg-slate-800 mx-1 flex-shrink-0" />

          {(['ALL', 'HDB', 'URA', 'Mall'] as const).map((agency) => (
            <button
              key={agency}
              id={`filter-agency-${agency.toLowerCase()}`}
              type="button"
              onClick={() => onUpdateFilter({ agency })}
              className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-all ${
                filterState.agency === agency
                  ? 'bg-slate-700 text-white border border-slate-600'
                  : 'bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {agency === 'ALL' ? 'All Providers' : agency}
            </button>
          ))}

          {/* Available lots only chip */}
          <button
            id="filter-lots-available-only"
            type="button"
            onClick={() =>
              onUpdateFilter({
                availabilityStatus:
                  filterState.availabilityStatus === 'AVAILABLE_ONLY' ? 'ALL' : 'AVAILABLE_ONLY',
              })
            }
            className={`px-2.5 py-1 rounded-lg whitespace-nowrap font-medium transition-all ${
              filterState.availabilityStatus === 'AVAILABLE_ONLY'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-800/50 text-slate-400 hover:text-slate-200'
            }`}
          >
            Has Lots (&gt;0)
          </button>

          {/* Advanced Filter button */}
          <button
            id="btn-open-advanced-filters"
            type="button"
            onClick={onOpenFilterDrawer}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/80 hover:border-slate-600 transition-colors flex-shrink-0"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Auto-suggest dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden max-h-72 overflow-y-auto z-50">
          <div className="p-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Singapore Hotspots &amp; Locations</span>
            <span className="text-slate-400">{filteredLocations.length} results</span>
          </div>

          {filteredLocations.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-400">
              No matching Singapore location found. Try &quot;Orchard&quot;, &quot;MBS&quot;, or &quot;Jurong&quot;.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {filteredLocations.map((loc) => (
                <button
                  key={loc.id}
                  id={`loc-option-${loc.id}`}
                  type="button"
                  onClick={() => handleSelect(loc)}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-800/70 flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 transition-colors">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-200 group-hover:text-white">
                        {loc.name}
                      </div>
                      <div className="text-xs text-slate-400">{loc.area} &bull; {loc.category}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                    {loc.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div className="bg-slate-950/70 p-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              Tip: Click any carpark on map or list to navigate
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
