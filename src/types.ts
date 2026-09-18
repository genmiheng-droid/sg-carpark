export type VehicleType = 'car' | 'motorcycle' | 'heavy';

export type AgencyType = 'HDB' | 'URA' | 'LTA' | 'Commercial' | 'Mall';

export interface ParkingRate {
  weekdayRate: string;
  saturdayRate: string;
  sundayRate: string;
  gracePeriod: string;
  nightCap?: string;
  per30MinRate?: number;
}

export interface Carpark {
  id: string;
  carparkNumber: string; // e.g., "ACB", "PL42", "MBS01"
  name: string;
  address: string;
  area: string; // e.g., "Orchard", "Marina Bay", "Jurong East", "Tampines", "CBD", "Bugis", "Bishan"
  coordinates: {
    lat: number;
    lng: number;
  };
  agency: AgencyType;
  vehicleType: VehicleType;
  availableLots: number;
  occupancyRate?: number; // Optional legacy indicator
  heightLimit?: string; // e.g., "2.0m", "4.0m"
  hasEps: boolean; // Electronic Parking System
  hasEvCharging?: boolean;
  rateInfo: ParkingRate;
  lastUpdated: string;
  distanceMeters?: number; // calculated relative to active search location
  rank?: number; // 1 to 5 for nearest lots retrieval
  isTop5Result?: boolean;
}

export type LocationCategory =
  | 'Landmark'
  | 'Shopping'
  | 'Business'
  | 'Residential'
  | 'Transit'
  | 'Road'
  | 'Building';

export interface SearchLocation {
  id: string;
  name: string;
  area: string;
  category: LocationCategory;
  coordinates: {
    lat: number;
    lng: number;
  };
  road?: string;
  displayName?: string;
  postal?: string;
  source?: 'onemap' | 'local' | 'osm' | 'gps';
}

export interface OneMapRouteResult {
  status: number;
  statusMessage?: string;
  routeType: 'walk' | 'drive' | 'cycle' | 'pt';
  totalTimeSeconds: number;
  totalDistanceMeters: number;
  decodedPoints: [number, number][];
}

export interface OneMapTokenStatus {
  configured: boolean;
  hasEnvToken: boolean;
  hasEnvCredentials: boolean;
  isCached: boolean;
  cachedEmail?: string | null;
  expiresAt?: string | null;
  tokenPreview?: string | null;
}

export interface FilterState {
  searchQuery: string;
  vehicleType: VehicleType;
  agency: AgencyType | 'ALL';
  availabilityStatus: 'ALL' | 'AVAILABLE_ONLY' | 'HIGH_ONLY'; // High = >50
  maxDistanceKm: number;
  sortBy: 'distance' | 'availability' | 'price' | 'name';
  showEvOnly: boolean;
}

export type ActiveTab = 'map' | 'list' | 'saved' | 'guide' | 'api';
