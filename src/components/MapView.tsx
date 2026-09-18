import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Carpark, SearchLocation, OneMapRouteResult } from '../types';
import { getAvailabilityColor, formatDistance } from '../data/singaporeCarparks';
import {
  Layers,
  Navigation,
  ZoomIn,
  ZoomOut,
  Compass,
  ExternalLink,
  Sparkles,
  Footprints,
  Car,
  AlertCircle,
  X,
  Loader2,
  Key,
  Check,
} from 'lucide-react';

interface MapViewProps {
  carparks: Carpark[];
  activeLocation: SearchLocation;
  selectedCarpark: Carpark | null;
  onSelectCarpark: (cp: Carpark) => void;
  onOpenDetails: (cp: Carpark) => void;
  retrievalMode?: 'top5' | 'all';
  onOpenApiSettings?: () => void;
}

type TileStyle = 'onemap-night' | 'onemap-default' | 'onemap-grey' | 'onemap-original' | 'osm';

const TILE_CONFIGS: Record<TileStyle, { url: string; attribution: string; name: string; maxZoom: number; minZoom: number }> = {
  'onemap-night': {
    url: 'https://www.onemap.gov.sg/maps/tiles/Night/{z}/{x}/{y}.png',
    attribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority',
    name: 'OneMap Night (SLA)',
    maxZoom: 19,
    minZoom: 11,
  },
  'onemap-default': {
    url: 'https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png',
    attribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority',
    name: 'OneMap Colour (Default)',
    maxZoom: 19,
    minZoom: 11,
  },
  'onemap-grey': {
    url: 'https://www.onemap.gov.sg/maps/tiles/Grey/{z}/{x}/{y}.png',
    attribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority',
    name: 'OneMap Grey',
    maxZoom: 19,
    minZoom: 11,
  },
  'onemap-original': {
    url: 'https://www.onemap.gov.sg/maps/tiles/Original/{z}/{x}/{y}.png',
    attribution: '<a href="https://www.onemap.gov.sg/" target="_blank" rel="noopener noreferrer">OneMap</a> &copy; Singapore Land Authority',
    name: 'OneMap Original',
    maxZoom: 19,
    minZoom: 11,
  },
  osm: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    name: 'OpenStreetMap',
    maxZoom: 19,
    minZoom: 10,
  },
};

export const MapView: React.FC<MapViewProps> = ({
  carparks,
  activeLocation,
  selectedCarpark,
  onSelectCarpark,
  onOpenDetails,
  retrievalMode,
  onOpenApiSettings,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const searchLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [tileStyle, setTileStyle] = useState<TileStyle>('onemap-night');
  const [showTileMenu, setShowTileMenu] = useState(false);
  const [showCarparksOverlay, setShowCarparksOverlay] = useState(true);

  // OneMap Route States
  const [activeRoute, setActiveRoute] = useState<OneMapRouteResult | null>(null);
  const [isFetchingRoute, setIsFetchingRoute] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [currentRouteType, setCurrentRouteType] = useState<'walk' | 'drive'>('walk');

  // Clear route when carpark selection changes
  useEffect(() => {
    setActiveRoute(null);
    setRouteError(null);
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
  }, [selectedCarpark?.id, activeLocation.coordinates.lat, activeLocation.coordinates.lng]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const container = mapContainerRef.current as any;
    if (container._leaflet_id) {
      delete container._leaflet_id;
    }

    const initialMap = L.map(mapContainerRef.current, {
      center: [activeLocation.coordinates.lat, activeLocation.coordinates.lng],
      zoom: 15,
      minZoom: 11,
      maxZoom: 19,
      zoomControl: false,
      fadeAnimation: true,
      trackResize: true,
    });

    const currentConfig = TILE_CONFIGS[tileStyle];
    const initialTile = L.tileLayer(currentConfig.url, {
      attribution: currentConfig.attribution,
      maxZoom: currentConfig.maxZoom,
      minZoom: currentConfig.minZoom,
      detectRetina: false,
    }).addTo(initialMap);

    tileLayerRef.current = initialTile;

    // Layer groups
    searchLocationLayerRef.current = L.layerGroup().addTo(initialMap);
    markersLayerRef.current = L.layerGroup().addTo(initialMap);
    routeLayerRef.current = L.layerGroup().addTo(initialMap);

    mapInstanceRef.current = initialMap;

    const forceResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    forceResize();
    const t1 = setTimeout(forceResize, 100);
    const t2 = setTimeout(forceResize, 350);
    const t3 = setTimeout(forceResize, 800);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        forceResize();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      initialMap.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    const currentConfig = TILE_CONFIGS[tileStyle];
    const newTile = L.tileLayer(currentConfig.url, {
      attribution: currentConfig.attribution,
      maxZoom: currentConfig.maxZoom,
      minZoom: currentConfig.minZoom,
      detectRetina: false,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTile;
  }, [tileStyle]);

  // Fit View to Searched Location + Car Parks
  const fitViewToLocations = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { lat, lng } = activeLocation.coordinates;
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return;
    }

    if (carparks.length > 0) {
      const validPoints: [number, number][] = [
        [lat, lng],
        ...carparks
          .filter((cp) => cp?.coordinates && typeof cp.coordinates.lat === 'number' && typeof cp.coordinates.lng === 'number')
          .map((cp) => [cp.coordinates.lat, cp.coordinates.lng] as [number, number]),
      ];

      const bounds = L.latLngBounds(validPoints);
      if (bounds.isValid()) {
        try {
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 16,
            animate: true,
          });
          return;
        } catch (err) {
          console.warn('fitBounds fallback:', err);
        }
      }
    }

    map.setView([lat, lng], 15);
  }, [activeLocation, carparks]);

  // Update Search Location Marker & Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    const searchLayer = searchLocationLayerRef.current;
    if (!map || !searchLayer) return;

    searchLayer.clearLayers();

    const { lat, lng } = activeLocation.coordinates;

    // Custom Search Center Marker
    const searchIcon = L.divIcon({
      className: 'search-location-pin',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-cyan-400/25 animate-ping"></div>
          <div class="relative w-7 h-7 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    const searchMarker = L.marker([lat, lng], { icon: searchIcon }).bindTooltip(
      `<strong>Searched Location:</strong> ${activeLocation.name}`,
      { direction: 'top', offset: [0, -12], className: 'custom-tooltip' }
    );
    searchLayer.addLayer(searchMarker);

    // Subtle radius indicator circle (800m)
    const radiusCircle = L.circle([lat, lng], {
      radius: 800,
      color: '#06b6d4',
      weight: 1,
      opacity: 0.5,
      fillColor: '#06b6d4',
      fillOpacity: 0.05,
      dashArray: '4, 6',
    });
    searchLayer.addLayer(radiusCircle);

    const timer = setTimeout(() => {
      fitViewToLocations();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeLocation, carparks, fitViewToLocations]);

  // Update Carpark Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    if (!showCarparksOverlay) return;

    carparks.forEach((cp) => {
      const color = getAvailabilityColor(cp.availableLots, cp.occupancyRate);
      const isSelected = selectedCarpark?.id === cp.id;

      const rankHtml = cp.rank !== undefined
        ? `<span class="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px] leading-tight shadow-sm">#${cp.rank}</span>`
        : '';

      const markerHtml = `
        <div class="carpark-map-badge cursor-pointer transform transition-all hover:scale-110 ${
          isSelected ? 'scale-125 z-50' : 'z-10'
        }">
          <div class="px-2.5 py-1.5 rounded-xl shadow-xl border text-xs font-bold flex items-center gap-1.5 backdrop-blur-md ${
            isSelected
              ? 'ring-4 ring-cyan-400/80 ring-offset-2 ring-offset-slate-900 border-white text-white shadow-2xl scale-110'
              : 'border-slate-700/80 shadow-black/70'
          }" style="background-color: ${isSelected ? '#090d16' : '#0f172aee'}; border-color: ${color.pinColor};">
            ${rankHtml}
            <span class="w-2 h-2 rounded-full ${isSelected ? 'animate-pulse' : ''}" style="background-color: ${color.pinColor};"></span>
            <div class="flex items-baseline gap-0.5">
              <span class="font-extrabold text-xs" style="color: ${color.pinColor};">${cp.availableLots}</span>
              <span class="text-[10px] text-slate-300 font-medium">lots</span>
            </div>
          </div>
          <div class="w-2.5 h-2.5 rotate-45 mx-auto -mt-1.5 border-r border-b" style="background-color: #0f172a; border-color: ${color.pinColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `custom-carpark-pin ${isSelected ? 'is-selected' : ''}`,
        html: markerHtml,
        iconSize: [80, 38],
        iconAnchor: [40, 36],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
      });

      marker.bindTooltip(
        `<strong>${cp.rank ? `#${cp.rank} ` : ''}${cp.name}</strong><br/><span style="color: ${color.pinColor}; font-weight: bold;">${cp.availableLots} available lots</span> &bull; ${formatDistance(cp.distanceMeters ?? 0)}`,
        { direction: 'top', offset: [0, -20] }
      );

      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      markersLayer.addLayer(marker);
    });
  }, [carparks, selectedCarpark, onSelectCarpark, showCarparksOverlay]);

  // Pan when selectedCarpark changes externally
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current && !activeRoute) {
      mapInstanceRef.current.flyTo(
        [selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng],
        16,
        { animate: true, duration: 0.8 }
      );
    }
  }, [selectedCarpark, activeRoute]);

  // Request Route from OneMap API
  const handleFetchRoute = async (type: 'walk' | 'drive') => {
    if (!selectedCarpark || !mapInstanceRef.current) return;

    setIsFetchingRoute(true);
    setRouteError(null);
    setCurrentRouteType(type);

    const start = `${activeLocation.coordinates.lat},${activeLocation.coordinates.lng}`;
    const end = `${selectedCarpark.coordinates.lat},${selectedCarpark.coordinates.lng}`;

    try {
      const res = await fetch(`/api/onemap/route?start=${start}&end=${end}&routeType=${type}`);
      const data = await res.json();

      if (res.status === 401 || data.error?.includes('Authentication token')) {
        setRouteError(
          'OneMap Routing requires an authenticated token (lasts 3 days). Mint your token in API Settings.'
        );
        return;
      }

      if (!res.ok || data.status !== 0) {
        setRouteError(data.status_message || data.error || 'Failed to calculate route via OneMap.');
        return;
      }

      const routeData: OneMapRouteResult = {
        status: data.status,
        statusMessage: data.status_message,
        routeType: type,
        totalTimeSeconds: data.total_time,
        totalDistanceMeters: data.total_distance,
        decodedPoints: data.decoded_points || [],
      };

      setActiveRoute(routeData);

      // Render polyline on map
      if (routeLayerRef.current && routeData.decodedPoints.length > 0) {
        routeLayerRef.current.clearLayers();

        // Background glow line
        const glowLine = L.polyline(routeData.decodedPoints, {
          color: type === 'walk' ? '#10b981' : '#06b6d4',
          weight: 7,
          opacity: 0.35,
        });
        routeLayerRef.current.addLayer(glowLine);

        // Foreground precise line
        const mainLine = L.polyline(routeData.decodedPoints, {
          color: type === 'walk' ? '#34d399' : '#22d3ee',
          weight: 4,
          opacity: 0.95,
          dashArray: type === 'walk' ? '8, 8' : undefined,
        });
        routeLayerRef.current.addLayer(mainLine);

        // Fit bounds to route
        const routeBounds = mainLine.getBounds();
        if (routeBounds.isValid()) {
          mapInstanceRef.current.fitBounds(routeBounds, {
            padding: [60, 60],
            maxZoom: 17,
            animate: true,
          });
        }
      }
    } catch (err: any) {
      setRouteError(err.message || 'Network error fetching OneMap route.');
    } finally {
      setIsFetchingRoute(false);
    }
  };

  const clearRoute = () => {
    setActiveRoute(null);
    setRouteError(null);
    if (routeLayerRef.current) {
      routeLayerRef.current.clearLayers();
    }
    fitViewToLocations();
  };

  // Map Controls
  const handleRecenter = () => {
    fitViewToLocations();
  };

  const handleZoomIn = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.zoomOut();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      {/* Map Container */}
      <div
        id="sg-carpark-leaflet-map"
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ width: '100%', height: '100%', minHeight: '500px' }}
      />

      {/* Floating Map Controls */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
        {/* Recenter Button */}
        <button
          id="btn-map-recenter"
          type="button"
          onClick={handleRecenter}
          className="p-2.5 bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition-all cursor-pointer"
          title="Recenter on searched area"
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-md overflow-hidden">
          <button
            id="btn-map-zoom-in"
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 text-slate-200 hover:text-white hover:bg-slate-800 border-b border-slate-800 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-map-zoom-out"
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Carpark Lots Overlay Quick Toggle */}
        <button
          id="btn-toggle-carparks-overlay"
          type="button"
          onClick={() => setShowCarparksOverlay(!showCarparksOverlay)}
          className={`p-2.5 rounded-xl border shadow-lg backdrop-blur-md transition-all cursor-pointer ${
            showCarparksOverlay
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30'
              : 'bg-slate-900/95 border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={showCarparksOverlay ? 'Hide Carpark Lots Overlay' : 'Show Carpark Lots Overlay'}
        >
          <Car className="w-4 h-4" />
        </button>

        {/* Tile Style Layer Toggle */}
        <div className="relative">
          <button
            id="btn-map-style-toggle"
            type="button"
            onClick={() => setShowTileMenu(!showTileMenu)}
            className="p-2.5 bg-slate-900/95 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition-all cursor-pointer"
            title="Switch OneMap Theme"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
          </button>

          {showTileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-30 flex flex-col gap-1 text-xs backdrop-blur-md">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 flex items-center justify-between">
                <span>🇸🇬 Singapore OneMap</span>
                <span className="text-emerald-400 font-bold">SLA</span>
              </div>
              {(['onemap-night', 'onemap-default', 'onemap-grey', 'onemap-original'] as TileStyle[]).map((styleKey) => (
                <button
                  key={styleKey}
                  type="button"
                  onClick={() => {
                    setTileStyle(styleKey);
                    setShowTileMenu(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-left font-medium transition-colors flex items-center justify-between cursor-pointer ${
                    tileStyle === styleKey
                      ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span>{TILE_CONFIGS[styleKey].name}</span>
                  {tileStyle === styleKey && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                </button>
              ))}

              <div className="px-2 pt-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 mt-1">
                Global Fallback
              </div>
              <button
                type="button"
                onClick={() => {
                  setTileStyle('osm');
                  setShowTileMenu(false);
                }}
                className={`px-2.5 py-1.5 rounded-xl text-left font-medium transition-colors flex items-center justify-between cursor-pointer ${
                  tileStyle === 'osm'
                    ? 'bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{TILE_CONFIGS['osm'].name}</span>
                {tileStyle === 'osm' && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Legend & OneMap status overlay */}
      <div className="absolute left-3 top-3 z-20 hidden md:flex items-center gap-3 px-3.5 py-2 bg-slate-900/90 border border-slate-800 rounded-2xl text-[11px] backdrop-blur-md shadow-xl">
        {/* OneMap SLA badge */}
        <div className="flex items-center gap-1.5 pr-2.5 border-r border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-bold tracking-tight">🇸🇬 OneMap</span>
          <span className="text-slate-400 text-[10px] font-medium">(SLA)</span>
        </div>

        {/* Quick Style Switcher */}
        <button
          type="button"
          onClick={() => setTileStyle(tileStyle === 'onemap-night' ? 'onemap-default' : 'onemap-night')}
          className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
          title="Quick switch between OneMap Night and Colour"
        >
          {tileStyle === 'onemap-night' ? '🌙 Night' : '☀️ Colour'}
        </button>

        {/* Overlay toggle */}
        <button
          type="button"
          onClick={() => setShowCarparksOverlay(!showCarparksOverlay)}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
            showCarparksOverlay
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400 line-through'
          }`}
          title="Toggle Carpark Lots overlay"
        >
          Lots Overlay {showCarparksOverlay ? 'ON' : 'OFF'}
        </button>

        {/* Availability color dots */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800/80">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 font-medium">&gt;30</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-slate-300 font-medium">6–30</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span className="text-slate-300 font-medium">&le;5</span>
          </div>
        </div>
      </div>

      {/* 5 Nearest Quick Selector Bar at top */}
      {retrievalMode === 'top5' && carparks.length > 0 && (
        <div className="absolute top-3 left-3 sm:left-1/2 sm:-translate-x-1/2 z-20 max-w-[calc(100%-80px)] sm:max-w-2xl">
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl backdrop-blur-md flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <div className="px-2 py-1 text-[11px] font-bold text-emerald-400 whitespace-nowrap flex items-center gap-1 border-r border-slate-800 pr-2">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden xs:inline">5 Nearest (&gt;5 lots)</span>
              <span className="xs:hidden">Top 5</span>
            </div>
            <div className="flex items-center gap-1">
              {carparks.slice(0, 5).map((cp) => {
                const isSel = selectedCarpark?.id === cp.id;
                const color = getAvailabilityColor(cp.availableLots, cp.occupancyRate);
                return (
                  <button
                    key={cp.id}
                    type="button"
                    onClick={() => onSelectCarpark(cp)}
                    className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                      isSel
                        ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md scale-105'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700/50'
                    }`}
                    title={`${cp.name} - ${cp.availableLots} available lots (${formatDistance(cp.distanceMeters ?? 0)})`}
                  >
                    <span
                      className={`px-1 py-0.2 rounded text-[10px] font-black ${
                        isSel ? 'bg-slate-950 text-emerald-400' : 'bg-slate-700 text-emerald-300'
                      }`}
                    >
                      #{cp.rank ?? 1}
                    </span>
                    <span className="font-medium max-w-[70px] truncate hidden lg:inline">{cp.name}</span>
                    <span
                      className={`font-bold ${isSel ? 'text-slate-950' : ''}`}
                      style={!isSel ? { color: color.pinColor } : undefined}
                    >
                      {cp.availableLots} lots
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Live Route Bar Banner (When Route is Plotted) */}
      {activeRoute && (
        <div className="absolute top-14 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:w-auto z-20">
          <div className="bg-slate-900/95 border border-emerald-500/50 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                {activeRoute.routeType === 'walk' ? (
                  <Footprints className="w-4 h-4" />
                ) : (
                  <Car className="w-4 h-4" />
                )}
              </span>
              <div>
                <span className="font-bold text-white">
                  OneMap {activeRoute.routeType === 'walk' ? 'Walking' : 'Driving'} Route:
                </span>{' '}
                <span className="text-emerald-400 font-extrabold">
                  {Math.max(1, Math.round(activeRoute.totalTimeSeconds / 60))} mins
                </span>{' '}
                &bull;{' '}
                <span className="text-cyan-300 font-semibold">
                  {formatDistance(activeRoute.totalDistanceMeters)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleFetchRoute(activeRoute.routeType === 'walk' ? 'drive' : 'walk')
                }
                disabled={isFetchingRoute}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 transition-colors"
              >
                Switch to {activeRoute.routeType === 'walk' ? 'Drive' : 'Walk'}
              </button>
              <button
                type="button"
                onClick={clearRoute}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Clear route"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Carpark Preview Card Overlay */}
      {selectedCarpark && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-20">
          <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {selectedCarpark.rank && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-400 text-slate-950 font-black text-[10px]">
                      #{selectedCarpark.rank} Nearest
                    </span>
                  )}
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {selectedCarpark.agency} &bull; {selectedCarpark.area}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{selectedCarpark.name}</h4>
                <p className="text-xs text-slate-400 truncate mt-0.5">{selectedCarpark.address}</p>
              </div>

              <button
                type="button"
                onClick={() => onSelectCarpark(null as any)}
                className="text-slate-400 hover:text-white text-xs p-1"
                title="Dismiss preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
              <div className="bg-slate-800/60 rounded-xl p-1.5">
                <div className="text-[10px] text-slate-400">Available</div>
                <div className="text-sm font-extrabold text-emerald-400">
                  {selectedCarpark.availableLots}
                </div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-1.5">
                <div className="text-[10px] text-slate-400">Total Lots</div>
                <div className="text-sm font-bold text-slate-200">
                  {selectedCarpark.totalLots}
                </div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-1.5">
                <div className="text-[10px] text-slate-400">Est. Distance</div>
                <div className="text-sm font-bold text-cyan-400">
                  {formatDistance(selectedCarpark.distanceMeters ?? 0)}
                </div>
              </div>
            </div>

            {/* OneMap Routing Action Bar */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-cyan-400" />
                  OneMap Routing
                </span>
                <span className="text-[10px] text-slate-500">Government SLA API</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleFetchRoute('walk')}
                  disabled={isFetchingRoute}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    activeRoute?.routeType === 'walk'
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isFetchingRoute && currentRouteType === 'walk' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Footprints className="w-3.5 h-3.5" />
                  )}
                  <span>Walk Route</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFetchRoute('drive')}
                  disabled={isFetchingRoute}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                    activeRoute?.routeType === 'drive'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  {isFetchingRoute && currentRouteType === 'drive' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Car className="w-3.5 h-3.5" />
                  )}
                  <span>Drive Route</span>
                </button>
              </div>

              {/* Route Error / Token Helper */}
              {routeError && (
                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-300 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>{routeError}</span>
                    {onOpenApiSettings && (
                      <button
                        type="button"
                        onClick={onOpenApiSettings}
                        className="block mt-1 font-bold underline text-amber-400 hover:text-amber-300"
                      >
                        Open API Settings to mint 3-day token &rarr;
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-300 font-medium truncate">
                Rate: <span className="text-emerald-400 font-semibold">{selectedCarpark.rateInfo.weekdayRate.split(',')[0]}</span>
              </div>
              <button
                type="button"
                onClick={() => onOpenDetails(selectedCarpark)}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer shadow-sm"
              >
                <span>Full Details</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
