import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Carpark, SearchLocation } from '../types';
import { getAvailabilityColor, formatDistance } from '../data/singaporeCarparks';
import { Layers, Navigation, ZoomIn, ZoomOut, Compass, ExternalLink } from 'lucide-react';

interface MapViewProps {
  carparks: Carpark[];
  activeLocation: SearchLocation;
  selectedCarpark: Carpark | null;
  onSelectCarpark: (cp: Carpark) => void;
  onOpenDetails: (cp: Carpark) => void;
}

type TileStyle = 'dark' | 'voyager' | 'osm';

const TILE_CONFIGS: Record<TileStyle, { url: string; attribution: string; name: string }> = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    name: 'Dark Night',
  },
  voyager: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
    name: 'Light Map',
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    name: 'Street Standard',
  },
};

export const MapView: React.FC<MapViewProps> = ({
  carparks,
  activeLocation,
  selectedCarpark,
  onSelectCarpark,
  onOpenDetails,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const searchLocationLayerRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [tileStyle, setTileStyle] = useState<TileStyle>('dark');
  const [showTileMenu, setShowTileMenu] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialMap = L.map(mapContainerRef.current, {
      center: [activeLocation.coordinates.lat, activeLocation.coordinates.lng],
      zoom: 15,
      zoomControl: false,
    });

    const initialTile = L.tileLayer(TILE_CONFIGS[tileStyle].url, {
      attribution: TILE_CONFIGS[tileStyle].attribution,
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(initialMap);

    tileLayerRef.current = initialTile;

    // Layer groups for markers
    searchLocationLayerRef.current = L.layerGroup().addTo(initialMap);
    markersLayerRef.current = L.layerGroup().addTo(initialMap);

    mapInstanceRef.current = initialMap;

    return () => {
      initialMap.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Tile Style changes
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.setUrl(TILE_CONFIGS[tileStyle].url);
  }, [tileStyle]);

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
          <div class="absolute w-8 h-8 rounded-full bg-cyan-400/20 animate-ping"></div>
          <div class="relative w-7 h-7 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-white">
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
      `<strong>Searched Area:</strong> ${activeLocation.name}`,
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

    // Pan map to new location
    map.flyTo([lat, lng], 15, { animate: true, duration: 1 });
  }, [activeLocation]);

  // Update Carpark Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    carparks.forEach((cp) => {
      const color = getAvailabilityColor(cp.availableLots, cp.occupancyRate);
      const isSelected = selectedCarpark?.id === cp.id;

      const markerHtml = `
        <div class="carpark-map-badge cursor-pointer transform transition-all hover:scale-110 ${
          isSelected ? 'scale-125 z-50' : 'z-10'
        }">
          <div class="px-2.5 py-1 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-1.5 backdrop-blur-md ${
            isSelected
              ? 'ring-4 ring-cyan-400/80 ring-offset-2 ring-offset-slate-900 border-white text-white shadow-2xl scale-110'
              : 'border-slate-700/80 shadow-black/60'
          }" style="background-color: ${isSelected ? '#0f172a' : '#0f172aee'}; border-color: ${color.pinColor};">
            <span class="w-2 h-2 rounded-full ${isSelected ? 'animate-pulse' : ''}" style="background-color: ${color.pinColor};"></span>
            <span class="font-extrabold" style="color: ${color.pinColor};">${cp.availableLots}</span>
            <span class="text-[10px] text-slate-400 font-medium">lots</span>
          </div>
          <div class="w-2 h-2 rotate-45 mx-auto -mt-1 border-r border-b" style="background-color: #0f172a; border-color: ${color.pinColor};"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `custom-carpark-pin ${isSelected ? 'is-selected' : ''}`,
        html: markerHtml,
        iconSize: [68, 36],
        iconAnchor: [34, 34],
      });

      const marker = L.marker([cp.coordinates.lat, cp.coordinates.lng], {
        icon: customIcon,
      });

      // Marker click handler
      marker.on('click', () => {
        onSelectCarpark(cp);
      });

      markersLayer.addLayer(marker);
    });
  }, [carparks, selectedCarpark, onSelectCarpark]);

  // Pan when selectedCarpark changes externally
  useEffect(() => {
    if (selectedCarpark && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(
        [selectedCarpark.coordinates.lat, selectedCarpark.coordinates.lng],
        16,
        { animate: true, duration: 0.8 }
      );
    }
  }, [selectedCarpark]);

  // Map Controls
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.flyTo(
      [activeLocation.coordinates.lat, activeLocation.coordinates.lng],
      15,
      { animate: true }
    );
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
    <div className="relative w-full h-full min-h-[400px] flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      {/* Map Container */}
      <div id="sg-carpark-leaflet-map" ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Map Controls */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
        {/* Recenter Button */}
        <button
          id="btn-map-recenter"
          type="button"
          onClick={handleRecenter}
          className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition-all"
          title="Recenter on searched area"
        >
          <Navigation className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Zoom In & Out */}
        <div className="flex flex-col bg-slate-900/90 border border-slate-700/80 rounded-xl shadow-lg backdrop-blur-md overflow-hidden">
          <button
            id="btn-map-zoom-in"
            type="button"
            onClick={handleZoomIn}
            className="p-2.5 text-slate-200 hover:text-white hover:bg-slate-800 border-b border-slate-800 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="btn-map-zoom-out"
            type="button"
            onClick={handleZoomOut}
            className="p-2.5 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Tile Style Layer Toggle */}
        <div className="relative">
          <button
            id="btn-map-style-toggle"
            type="button"
            onClick={() => setShowTileMenu(!showTileMenu)}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-slate-200 hover:text-white shadow-lg backdrop-blur-md transition-all"
            title="Switch Map Theme"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
          </button>

          {showTileMenu && (
            <div className="absolute right-0 top-full mt-2 w-36 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl p-1 z-30 flex flex-col gap-1 text-xs">
              {(Object.keys(TILE_CONFIGS) as TileStyle[]).map((styleKey) => (
                <button
                  key={styleKey}
                  type="button"
                  onClick={() => {
                    setTileStyle(styleKey);
                    setShowTileMenu(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                    tileStyle === styleKey
                      ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {TILE_CONFIGS[styleKey].name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend overlay */}
      <div className="absolute left-3 top-3 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] backdrop-blur-md shadow-md">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-slate-300 font-medium">&gt;30 lots</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-300 font-medium">6-30 lots</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span className="text-slate-300 font-medium">&le;5 / Full</span>
        </div>
      </div>

      {/* Selected Carpark Preview Card Overlay */}
      {selectedCarpark && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:w-96 z-20">
          <div className="bg-slate-900/95 border border-slate-700/90 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {selectedCarpark.agency}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedCarpark.carparkNumber}
                  </span>
                  {selectedCarpark.distanceMeters !== undefined && (
                    <span className="text-xs font-semibold text-cyan-400">
                      &bull; {formatDistance(selectedCarpark.distanceMeters)} away
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">
                  {selectedCarpark.name}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                  {selectedCarpark.address}
                </p>
              </div>

              {/* Lot availability badge */}
              {(() => {
                const color = getAvailabilityColor(
                  selectedCarpark.availableLots,
                  selectedCarpark.occupancyRate
                );
                return (
                  <div className={`px-2.5 py-1 rounded-xl text-center flex-shrink-0 ${color.badgeBg}`}>
                    <div className="text-base font-extrabold leading-none">
                      {selectedCarpark.availableLots}
                    </div>
                    <div className="text-[9px] uppercase font-bold mt-0.5">Available</div>
                  </div>
                );
              })()}
            </div>

            {/* Quick Rates & Action row */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-slate-100">
                  {selectedCarpark.rateInfo.per30MinRate
                    ? `$${selectedCarpark.rateInfo.per30MinRate.toFixed(2)}/30m`
                    : 'Standard Rate'}
                </span>
                <span className="text-slate-400 text-[11px] ml-1.5">
                  (Grace: {selectedCarpark.rateInfo.gracePeriod})
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenDetails(selectedCarpark)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors"
                >
                  View Details
                </button>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCarpark.coordinates.lat},${selectedCarpark.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Open Google Maps Navigation"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
