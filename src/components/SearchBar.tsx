import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  X,
  Navigation,
  RefreshCw,
  Car,
  Bike,
  Filter,
  Compass,
  Building2,
  Milestone,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { SearchLocation, FilterState, Carpark, LocationCategory } from '../types';
import {
  searchLocalSingaporeLocations,
  resolveSingaporeLocation,
} from '../data/singaporeRoads';

interface SearchBarProps {
  activeLocation: SearchLocation;
  carparks: Carpark[];
  onSelectLocation: (loc: SearchLocation) => void;
  filterState: FilterState;
  onUpdateFilter: (updates: Partial<FilterState>) => void;
  onUseCurrentLocation: () => void;
  onRefreshAvailability: () => void;
  isRefreshing: boolean;
  onOpenFilterDrawer: () => void;
  retrievalMode?: 'top5' | 'all';
  onToggleRetrievalMode?: (mode: 'top5' | 'all') => void;
  top5Count?: number;
}

const QUICK_ROADS_AND_BUILDINGS = [
  { name: 'Shenton Way', type: 'Road' },
  { name: 'Robinson Road', type: 'Road' },
  { name: 'Victoria Street', type: 'Road' },
  { name: 'Bras Basah Road', type: 'Road' },
  { name: 'Scotts Road', type: 'Road' },
  { name: 'AMK Ave 3', type: 'Road' },
  { name: 'Jurong Gateway', type: 'Road' },
  { name: 'Tampines Ave 4', type: 'Road' },
  { name: 'ION Orchard', type: 'Building' },
  { name: 'Suntec City', type: 'Building' },
];

export const SearchBar: React.FC<SearchBarProps> = ({
  activeLocation,
  carparks,
  onSelectLocation,
  filterState,
  onUpdateFilter,
  onUseCurrentLocation,
  onRefreshAvailability,
  isRefreshing,
  onOpenFilterDrawer,
  retrievalMode = 'top5',
  onToggleRetrievalMode,
  top5Count = 5,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(activeLocation.name);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchLocation[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Synchronize internal query with active location when it changes
  useEffect(() => {
    setQuery(activeLocation.name);
  }, [activeLocation]);

  // Compute live auto-suggestions when typing
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }

    const localMatches = searchLocalSingaporeLocations(trimmed, carparks);
    setSuggestions(localMatches);

    // If query has length >= 3 and few local matches, asynchronously check geocode API
    let isMounted = true;
    if (trimmed.length >= 3 && localMatches.length < 3) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
          if (res.ok && isMounted) {
            const data = await res.json();
            if (Array.isArray(data.results) && data.results.length > 0) {
              setSuggestions((prev) => {
                const existingNames = new Set(prev.map((p) => p.name.toLowerCase()));
                const newItems: SearchLocation[] = [];
                for (const item of data.results) {
                  if (!existingNames.has(item.name.toLowerCase())) {
                    newItems.push({
                      id: item.id || `geo-${Date.now()}-${Math.random()}`,
                      name: item.name,
                      area: item.area || 'Singapore',
                      category: item.category || 'Road',
                      coordinates: item.coordinates,
                      road: item.road,
                      displayName: item.displayName,
                    });
                  }
                }
                return [...prev, ...newItems].slice(0, 8);
              });
            }
          }
        } catch {
          // Geocode fetch fail ignore
        }
      }, 350);

      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [query, carparks]);

  // Click outside to close suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: SearchLocation) => {
    setQuery(loc.name);
    setSearchError(null);
    onSelectLocation(loc);
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSearchError(null);
    setIsOpen(true);
  };

  // Submit Search (Enter key or Search button)
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const trimmed = query.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      const resolved = await resolveSingaporeLocation(trimmed, carparks);
      if (resolved) {
        handleSelect(resolved);
      } else {
        setSearchError(
          `Location "${trimmed}" not found. Try entering a Singapore road name (e.g. Shenton Way, Robinson Road) or building name.`
        );
        setIsOpen(true);
      }
    } catch {
      setSearchError('Error resolving location. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const getCategoryBadge = (category: LocationCategory) => {
    switch (category) {
      case 'Road':
        return {
          label: 'Road',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          icon: Milestone,
        };
      case 'Building':
        return {
          label: 'Building',
          bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
          icon: Building2,
        };
      case 'Shopping':
        return {
          label: 'Shopping',
          bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
          icon: Building2,
        };
      case 'Transit':
        return {
          label: 'Transit / MRT',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          icon: Compass,
        };
      default:
        return {
          label: category,
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          icon: MapPin,
        };
    }
  };

  return (
    <div className="relative w-full z-30" ref={dropdownRef}>
      {/* Search Input Bar with Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-xl shadow-black/40 p-2 sm:p-2.5 transition-all"
      >
        <div className="flex items-center gap-2">
          {/* Search Icon / Indicator */}
          <div className="pl-2.5 text-emerald-400 flex-shrink-0">
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          {/* Text Input for Road or Building Name */}
          <input
            id="singapore-carpark-search-input"
            type="text"
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm sm:text-base font-medium focus:outline-none px-1"
            placeholder="Enter road name or building (e.g. Shenton Way, Robinson Rd, ION, Suntec)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchError(null);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
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

          {/* Dedicated "Find 5 Nearest" / Search Action Button */}
          <button
            id="btn-submit-search-location"
            type="submit"
            disabled={isSearching || !query.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex-shrink-0"
            title="Retrieve 5 nearest car parks with >5 available lots"
          >
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            )}
            <span className="hidden sm:inline">Find 5 Nearest</span>
            <span className="sm:hidden">Search</span>
          </button>

          {/* GPS Current Location button */}
          <button
            id="btn-gps-current-location"
            type="button"
            onClick={onUseCurrentLocation}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
            title="Use current location"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Near Me</span>
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

        {/* Quick Filter & Retrieval Mode Strip */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800/60 overflow-x-auto no-scrollbar text-xs">
          {/* Top 5 Retrieval Mode Active Badge / Switch */}
          {onToggleRetrievalMode && (
            <button
              id="filter-retrieval-mode-toggle"
              type="button"
              onClick={() =>
                onToggleRetrievalMode(retrievalMode === 'top5' ? 'all' : 'top5')
              }
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                retrievalMode === 'top5'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/60'
              }`}
              title="Toggle between 5 nearest lots (>5 lots) and all nearby carparks"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>5 Nearest (&gt;5 lots)</span>
              {retrievalMode === 'top5' && (
                <span className="ml-1 px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[10px] font-black rounded-full">
                  {top5Count}
                </span>
              )}
            </button>
          )}

          {/* Vehicle Type Toggle */}
          <button
            id="filter-car-toggle"
            type="button"
            onClick={() => onUpdateFilter({ vehicleType: 'car' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              filterState.vehicleType === 'car'
                ? 'bg-slate-700 text-white border border-slate-600 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
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
                ? 'bg-slate-700 text-white border border-slate-600 font-semibold'
                : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Bikes</span>
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5 flex-shrink-0" />

          {/* Agency Filter Chips */}
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

        {/* Quick Road / Building Shortcuts Strip */}
        <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-slate-800/40 overflow-x-auto no-scrollbar text-[11px] text-slate-400">
          <span className="flex-shrink-0 text-slate-400 font-medium">Quick Roads:</span>
          {QUICK_ROADS_AND_BUILDINGS.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setQuery(item.name);
                const match = searchLocalSingaporeLocations(item.name, carparks)[0];
                if (match) {
                  handleSelect(match);
                } else {
                  handleSubmit();
                }
              }}
              className="px-2 py-0.5 rounded-md bg-slate-800/40 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-800 hover:border-emerald-500/30 whitespace-nowrap transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      </form>

      {/* Auto-suggest dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden max-h-80 overflow-y-auto z-50">
          {searchError && (
            <div className="p-3 bg-rose-500/10 border-b border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
              <span className="font-bold">Notice:</span>
              <span>{searchError}</span>
            </div>
          )}

          <div className="p-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Singapore Roads, Buildings &amp; Landmarks</span>
            </span>
            <span className="text-slate-400">
              {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches'}
            </span>
          </div>

          {suggestions.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm font-medium text-slate-300">
                Search &ldquo;{query}&rdquo;
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Press <strong>Enter</strong> or click <strong>&quot;Find 5 Nearest&quot;</strong> to resolve this road or building across Singapore.
              </p>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                Find 5 Nearest Lots with &gt;5 available
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {suggestions.map((loc) => {
                const badge = getCategoryBadge(loc.category);
                const IconComponent = badge.icon;
                return (
                  <button
                    key={loc.id}
                    id={`loc-option-${loc.id}`}
                    type="button"
                    onClick={() => handleSelect(loc)}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 transition-colors flex-shrink-0">
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-200 group-hover:text-white truncate">
                          {loc.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">
                          {loc.road || loc.area}
                          {loc.road && loc.area && ` • ${loc.area}`}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md whitespace-nowrap flex-shrink-0 ${badge.bg}`}
                    >
                      {badge.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Tip Footer */}
          <div className="bg-slate-950/80 p-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Retrieves the 5 nearest car parks with &gt;5 available lots</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
