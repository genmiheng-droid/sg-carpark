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
  totalLots: number;
  availableLots: number;
  occupancyRate: number; // 0 to 100%
  heightLimit?: string; // e.g., "2.0m", "4.0m"
  hasEps: boolean; // Electronic Parking System
  hasEvCharging?: boolean;
  rateInfo: ParkingRate;
  lastUpdated: string;
  distanceMeters?: number; // calculated relative to active search location
}

export interface SearchLocation {
  id: string;
  name: string;
  area: string;
  category: 'Landmark' | 'Shopping' | 'Business' | 'Residential' | 'Transit';
  coordinates: {
    lat: number;
    lng: number;
  };
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
