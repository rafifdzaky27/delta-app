// Core data types for DELTA app

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface RoutePoint extends Location {
  speed?: number;
  heading?: number;
}

export interface RouteSector {
  id: string;
  name: string;
  startPoint: Location;
  endPoint: Location;
  order: number;
}

export interface Route {
  id: string;
  name: string;
  startLocation: Location;
  endLocation: Location;
  sectors: RouteSector[];
  createdAt: number;
  isActive: boolean;
}

export interface TripSectorTime {
  sectorId: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
}

export interface Trip {
  id: string;
  routeId: string;
  startTime: number;
  endTime: number;
  duration: number; // in milliseconds
  startLocation: Location;
  endLocation: Location;
  routePoints: RoutePoint[];
  sectorTimes: TripSectorTime[];
  distance?: number; // in meters
  averageSpeed?: number; // in km/h
  createdAt: number;
}

export interface TripComparison {
  vsYesterday?: number; // difference in milliseconds
  vsWeeklyAverage?: number;
  vsPersonalBest?: number;
  vsUsualDeparture?: number;
}

export interface UserPreferences {
  homeLocation?: Location;
  workLocation?: Location;
  trackingEnabled: boolean;
  notificationsEnabled: boolean;
  autoDetectionSensitivity: 'low' | 'medium' | 'high';
  workingHours: {
    start: string; // HH:MM format
    end: string;
  };
  workingDays: number[]; // 0-6, Sunday = 0
}

export type TripStatus = 'idle' | 'detecting' | 'tracking' | 'completed';

export type DeltaType = 'faster' | 'slower' | 'same';

export interface DeltaComparison {
  value: number; // in milliseconds
  type: DeltaType;
  formatted: string; // "+2:30" or "-1:15"
}
