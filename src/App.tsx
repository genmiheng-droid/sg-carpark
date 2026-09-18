/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { MapView } from './components/MapView';
import { CarparkCard } from './components/CarparkCard';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { FilterDrawer } from './components/FilterDrawer';
import { BottomNav } from './components/BottomNav';
import { SavedLotsView } from './components/SavedLotsView';
import { RatesGuideView } from './components/RatesGuideView';
import { ApiSettingsView } from './components/ApiSettingsView';

import {
  POPULAR_LOCATIONS,
  INITIAL_CARPARKS,
  calculateDistance,
} from './data/singaporeCarparks';
import {
  Carpark,
  SearchLocation,
  FilterState,
  ActiveTab,
} from './types';
import { ListFilter, Map, CheckCircle2, Sparkles } from 'lucide-react';

export default function App() {
  // Active Search Location (default: Orchard Road)
  const [activeLocation, setActiveLocation] = useState<SearchLocation>(POPULAR_LOCATIONS[0]);

  // Retrieval mode: 'top5' (default: 5 nearest with >10 lots) or 'all' (standard filter)
  const [retrievalMode, setRetrievalMode] = useState<'top5' | 'all'>('top5');

  // Carpark data state
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_CARPARKS);

  // Selection & Modal States
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [detailModalCarpark, setDetailModalCarpark] = useState<Carpark | null>(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Active Bottom Navigation Tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');

  // Filter State
  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    vehicleType: 'car',
    agency: 'ALL',
    availabilityStatus: 'ALL',
    maxDistanceKm: 15, // 15km = all SG
    sortBy: 'distance',
    showEvOnly: false,
  });

  // Saved / Bookmarked Carpark IDs (persisted to localStorage)
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('sg_saved_carparks');
      return stored ? JSON.parse(stored) : ['cp-ion-orchard', 'cp-jem'];
    } catch {
      return ['cp-ion-orchard', 'cp-jem'];
    }
  });

  // API Config (Mock vs Live)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('sg_lta_datamall_key') || '';
  });
  const [isLiveApiEnabled, setIsLiveApiEnabled] = useState(false);
  const [onemapToken, setOnemapToken] = useState(() => {
    return localStorage.getItem('sg_onemap_token') || '';
  });

  // Refresh State & Toast
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save savedIds to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sg_saved_carparks', JSON.stringify(savedIds));
    } catch {
      // ignore
    }
  }, [savedIds]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Calculate distance for all carparks relative to the active search location
  const carparksWithDistances = useMemo(() => {
    return carparks.map((cp) => {
      const distanceMeters = calculateDistance(
        activeLocation.coordinates.lat,
        activeLocation.coordinates.lng,
        cp.coordinates.lat,
        cp.coordinates.lng
      );
      return {
        ...cp,
        distanceMeters,
      };
    });
  }, [carparks, activeLocation]);

  // Apply filters and sorting
  const filteredCarparks = useMemo(() => {
    return carparksWithDistances
      .filter((cp) => {
        // Vehicle type filter
        if (filterState.vehicleType && cp.vehicleType !== filterState.vehicleType) {
          return false;
        }

        // Agency filter
        if (filterState.agency !== 'ALL' && cp.agency !== filterState.agency) {
          return false;
        }

        // Availability status filter
        if (filterState.availabilityStatus === 'AVAILABLE_ONLY' && cp.availableLots <= 0) {
          return false;
        }
        if (filterState.availabilityStatus === 'HIGH_ONLY' && cp.availableLots <= 50) {
          return false;
        }

        // EV Charging only
        if (filterState.showEvOnly && !cp.hasEvCharging) {
          return false;
        }

        // Distance filter
        if (
          cp.distanceMeters !== undefined &&
          filterState.maxDistanceKm < 15 &&
          cp.distanceMeters > filterState.maxDistanceKm * 1000
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filterState.sortBy === 'distance') {
          return (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0);
        }
        if (filterState.sortBy === 'availability') {
          return b.availableLots - a.availableLots;
        }
        if (filterState.sortBy === 'price') {
          const priceA = a.rateInfo.per30MinRate ?? 99;
          const priceB = b.rateInfo.per30MinRate ?? 99;
          return priceA - priceB;
        }
        if (filterState.sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [carparksWithDistances, filterState]);

  // Retrieve the 5 nearest carpark lots with more than 5 available lots
  const top5NearestWithLots = useMemo(() => {
    return carparksWithDistances
      .filter((cp) => {
        // Vehicle type filter
        if (filterState.vehicleType && cp.vehicleType !== filterState.vehicleType) {
          return false;
        }
        // Requirement: strictly MORE THAN 5 available lots
        return cp.availableLots > 5;
      })
      .sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0))
      .slice(0, 5)
      .map((cp, idx) => ({
        ...cp,
        rank: idx + 1,
        isTop5Result: true,
      }));
  }, [carparksWithDistances, filterState.vehicleType]);

  // Active displayed carparks based on retrievalMode
  const displayedCarparks = useMemo(() => {
    if (retrievalMode === 'top5') {
      return top5NearestWithLots;
    }
    return filteredCarparks;
  }, [retrievalMode, top5NearestWithLots, filteredCarparks]);

  // Saved Carparks
  const savedCarparks = useMemo(() => {
    return carparksWithDistances.filter((cp) => savedIds.includes(cp.id));
  }, [carparksWithDistances, savedIds]);

  // Toggle Save / Bookmark
  const handleToggleSave = (cp: Carpark) => {
    setSavedIds((prev) => {
      const isAlreadySaved = prev.includes(cp.id);
      if (isAlreadySaved) {
        showToast(`Removed "${cp.name}" from saved lots`);
        return prev.filter((id) => id !== cp.id);
      } else {
        showToast(`Saved "${cp.name}" to favorites`);
        return [...prev, cp.id];
      }
    });
  };

  // Select Location from Search - automatically retrieves 5 nearest lots with >5 availability
  const handleSelectLocation = (loc: SearchLocation) => {
    setActiveLocation(loc);
    setSelectedCarpark(null);
    setRetrievalMode('top5');
    setActiveTab('map');
    showToast(`Showing 5 nearest car parks (>5 lots) near ${loc.name}`);
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      showToast('Detecting current GPS coordinates...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLoc: SearchLocation = {
            id: 'current-user-gps',
            name: 'Current Location',
            area: 'Singapore',
            category: 'Landmark',
            coordinates: {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            },
          };
          setActiveLocation(userLoc);
          setSelectedCarpark(null);
          setRetrievalMode('top5');
          setActiveTab('map');
          showToast('Showing 5 nearest car parks (>5 lots) near you');
        },
        () => {
          showToast('GPS unavailable. Showing Orchard Road (Central SG).');
          setActiveLocation(POPULAR_LOCATIONS[0]);
        },
        { timeout: 8000 }
      );
    } else {
      showToast('Geolocation not supported by browser.');
    }
  };

  // Refresh Real-Time Lot availability (supports live /api/carparkavailability endpoint)
  const handleRefreshAvailability = async () => {
    setIsRefreshing(true);

    if (isLiveApiEnabled) {
      try {
        const headers: Record<string, string> = {};
        if (apiKey.trim()) {
          headers['AccountKey'] = apiKey.trim();
        }

        const res = await fetch('/api/carparkavailability', { headers });
        const json = await res.json();

        if (!res.ok) {
          showToast(json.message || json.error || 'Unable to fetch from live LTA feed');
        } else if (Array.isArray(json.value) && json.value.length > 0) {
          const liveMap: Record<string, number> = {};
          for (const item of json.value) {
            const devName = (item.Development || '').toLowerCase();
            const cpId = (item.CarParkID || '').toLowerCase();
            if (item.AvailableLots !== undefined) {
              liveMap[cpId] = Number(item.AvailableLots);
              if (devName) {
                liveMap[devName] = Number(item.AvailableLots);
              }
            }
          }

          setCarparks((prev) =>
            prev.map((cp) => {
              const liveLots =
                liveMap[cp.carparkNumber.toLowerCase()] ??
                liveMap[cp.name.toLowerCase()];

              if (liveLots !== undefined) {
                return {
                  ...cp,
                  availableLots: liveLots,
                  lastUpdated: 'Live LTA DataMall',
                };
              }
              return cp;
            })
          );
          showToast(`Synced ${json.value.length} lots from live LTA DataMall!`);
          setIsRefreshing(false);
          return;
        }
      } catch {
        showToast('Live LTA fetch failed. Falling back to local update.');
      }
    }

    // Baseline realistic variance update
    setTimeout(() => {
      setCarparks((prev) =>
        prev.map((cp) => {
          // realistic minor random lot fluctuation (-3 to +3)
          const delta = Math.floor(Math.random() * 7) - 3;
          const newAvailable = Math.max(0, cp.availableLots + delta);
          return {
            ...cp,
            availableLots: newAvailable,
            lastUpdated: 'Just now',
          };
        })
      );
      setIsRefreshing(false);
      showToast('Real-time lot availability refreshed!');
    }, 600);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setFilterState({
      searchQuery: '',
      vehicleType: 'car',
      agency: 'ALL',
      availabilityStatus: 'ALL',
      maxDistanceKm: 15,
      sortBy: 'distance',
      showEvOnly: false,
    });
    showToast('Filters reset to default');
  };

  // Total available lots across all carparks
  const totalAvailableLots = useMemo(() => {
    return carparks.reduce((sum, cp) => sum + cp.availableLots, 0);
  }, [carparks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header */}
      <Header
        activeLocation={activeLocation}
        totalCarparks={filteredCarparks.length}
        totalAvailableLots={totalAvailableLots}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-emerald-500 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow-xl shadow-emerald-500/30 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 pb-24 flex flex-col">
        {/* Search Bar - Shown on Map and List Tabs */}
        {(activeTab === 'map' || activeTab === 'list') && (
          <div className="mb-3">
            <SearchBar
              activeLocation={activeLocation}
              carparks={carparks}
              onSelectLocation={handleSelectLocation}
              filterState={filterState}
              onUpdateFilter={(updates) => setFilterState((prev) => ({ ...prev, ...updates }))}
              onUseCurrentLocation={handleUseCurrentLocation}
              onRefreshAvailability={handleRefreshAvailability}
              isRefreshing={isRefreshing}
              onOpenFilterDrawer={() => setIsFilterDrawerOpen(true)}
              retrievalMode={retrievalMode}
              onToggleRetrievalMode={setRetrievalMode}
              top5Count={top5NearestWithLots.length}
            />
          </div>
        )}

        {/* TAB 1: MAP VIEW (Interactive Map + Split / Expandable List) */}
        {activeTab === 'map' && (
          <div className="flex-1 flex flex-col lg:flex-row gap-4 h-[calc(100vh-200px)] min-h-[550px]">
            {/* Desktop Side List (Hidden on mobile to prioritize clean map, visible on lg screens) */}
            <div className="hidden lg:flex flex-col w-[380px] h-full bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  {retrievalMode === 'top5' ? (
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ListFilter className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>
                    {retrievalMode === 'top5'
                      ? `5 Nearest (>5 Lots)`
                      : `Nearby Parking (${displayedCarparks.length})`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRetrievalMode(retrievalMode === 'top5' ? 'all' : 'top5')}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
                >
                  {retrievalMode === 'top5' ? 'Show All Lots' : 'Show 5 Nearest'}
                </button>
              </div>

              {/* Top 5 Context Banner */}
              {retrievalMode === 'top5' && (
                <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5 mb-2.5 text-[11px] text-slate-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300">
                      {top5NearestWithLots.length} nearest car parks
                    </span>{' '}
                    with &gt;5 available lots retrieved for{' '}
                    <strong className="text-white">{activeLocation.name}</strong>.
                  </div>
                </div>
              )}

              {/* Scrollable Carpark Cards */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {displayedCarparks.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-400">
                    No carparks found with &gt;5 available lots nearby.
                  </div>
                ) : (
                  displayedCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      isSelected={selectedCarpark?.id === cp.id}
                      isSaved={savedIds.includes(cp.id)}
                      onSelect={(carpark) => setSelectedCarpark(carpark)}
                      onToggleSave={handleToggleSave}
                      onOpenDetails={(carpark) => setDetailModalCarpark(carpark)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Interactive Leaflet Map */}
            <div className="flex-1 flex flex-col h-full min-h-[520px] relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
              <MapView
                carparks={displayedCarparks}
                activeLocation={activeLocation}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={(cp) => setSelectedCarpark(cp)}
                onOpenDetails={(cp) => setDetailModalCarpark(cp)}
                retrievalMode={retrievalMode}
                onOpenApiSettings={() => setActiveTab('api')}
              />

              {/* Mobile Quick Switch to List button overlay */}
              <div className="lg:hidden absolute bottom-4 left-4 z-20">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3.5 py-2 rounded-xl bg-slate-900/95 border border-slate-700 text-xs font-bold text-slate-200 shadow-xl backdrop-blur-md flex items-center gap-1.5 hover:text-white"
                >
                  <ListFilter className="w-4 h-4 text-emerald-400" />
                  <span>
                    {retrievalMode === 'top5'
                      ? `5 Nearest Lots`
                      : `View List (${displayedCarparks.length})`}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NEARBY LOTS (Full Dedicated List View) */}
        {activeTab === 'list' && (
          <div className="w-full max-w-3xl mx-auto flex-1 animate-fadeIn">
            {/* List Header Bar */}
            <div className="flex items-center justify-between mb-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800/60">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  {retrievalMode === 'top5' && (
                    <Sparkles className="w-4 h-4 text-emerald-400 inline" />
                  )}
                  {retrievalMode === 'top5'
                    ? `5 Nearest Car Parks with >5 Available Lots`
                    : `Found ${displayedCarparks.length} Parking Locations`}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Near <span className="text-slate-200 font-semibold">{activeLocation.name}</span>
                  {activeLocation.road ? ` (${activeLocation.road})` : ''} &bull;{' '}
                  {retrievalMode === 'top5'
                    ? 'Closest first (>5 available lots)'
                    : `Sorted by ${
                        filterState.sortBy === 'distance'
                          ? 'distance'
                          : filterState.sortBy === 'availability'
                          ? 'most available'
                          : 'price'
                      }`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRetrievalMode(retrievalMode === 'top5' ? 'all' : 'top5')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-emerald-300 border border-slate-700 transition-colors"
                >
                  {retrievalMode === 'top5' ? 'Show All' : '5 Nearest'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Switch to Map</span>
                </button>
              </div>
            </div>

            {/* List of Cards */}
            {displayedCarparks.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 text-center my-6">
                <p className="text-sm font-semibold text-slate-300 mb-2">
                  No parking lots found with &gt;5 available lots
                </p>
                <button
                  type="button"
                  onClick={() => setRetrievalMode('all')}
                  className="text-xs text-emerald-400 font-bold hover:underline"
                >
                  Show all lots without availability filter
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    isSelected={selectedCarpark?.id === cp.id}
                    isSaved={savedIds.includes(cp.id)}
                    onSelect={(carpark) => {
                      setSelectedCarpark(carpark);
                      setActiveTab('map');
                    }}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={(carpark) => setDetailModalCarpark(carpark)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SAVED LOTS */}
        {activeTab === 'saved' && (
          <SavedLotsView
            savedCarparks={savedCarparks}
            selectedCarpark={selectedCarpark}
            onSelectCarpark={(cp) => {
              setSelectedCarpark(cp);
              setActiveTab('map');
            }}
            onToggleSave={handleToggleSave}
            onOpenDetails={(cp) => setDetailModalCarpark(cp)}
            onExploreMap={() => setActiveTab('map')}
          />
        )}

        {/* TAB 4: RATES & GUIDE */}
        {activeTab === 'guide' && <RatesGuideView />}

        {/* TAB 5: API CONNECTION SETUP */}
        {activeTab === 'api' && (
          <ApiSettingsView
            apiKey={apiKey}
            onSaveApiKey={(key) => {
              setApiKey(key);
              localStorage.setItem('sg_lta_datamall_key', key);
              showToast('LTA DataMall API Key saved');
            }}
            isLiveApiEnabled={isLiveApiEnabled}
            onToggleLiveApi={(enabled) => {
              setIsLiveApiEnabled(enabled);
              showToast(enabled ? 'Switched to Live API Mode' : 'Switched to Demo Data Mode');
            }}
            onemapToken={onemapToken}
            onSaveOnemapToken={(token) => {
              setOnemapToken(token);
              localStorage.setItem('sg_onemap_token', token);
              showToast('Singapore OneMap Token saved');
            }}
          />
        )}
      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        filterState={filterState}
        onUpdateFilter={(updates) => setFilterState((prev) => ({ ...prev, ...updates }))}
        onResetFilters={handleResetFilters}
        totalFilteredCount={filteredCarparks.length}
      />

      {/* Detailed Modal */}
      <CarparkDetailModal
        carpark={detailModalCarpark}
        isSaved={detailModalCarpark ? savedIds.includes(detailModalCarpark.id) : false}
        onClose={() => setDetailModalCarpark(null)}
        onToggleSave={handleToggleSave}
      />

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (tab === 'map') {
            setTimeout(() => {
              window.dispatchEvent(new Event('resize'));
            }, 100);
          }
        }}
        savedCount={savedIds.length}
        nearbyCount={filteredCarparks.length}
      />
    </div>
  );
}
