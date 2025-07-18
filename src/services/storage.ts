import { Trip, Route, UserPreferences } from '@/types';

const STORAGE_KEYS = {
  TRIPS: 'delta_trips',
  ROUTES: 'delta_routes',
  USER_PREFERENCES: 'delta_user_preferences',
  CURRENT_TRIP: 'delta_current_trip'
} as const;

export class StorageService {
  // Generic storage methods
  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to save ${key} to localStorage:`, error);
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Failed to load ${key} from localStorage:`, error);
      return null;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove ${key} from localStorage:`, error);
    }
  }

  // Trip management
  saveTrip(trip: Trip): void {
    const trips = this.getAllTrips();
    const existingIndex = trips.findIndex(t => t.id === trip.id);
    
    if (existingIndex >= 0) {
      trips[existingIndex] = trip;
    } else {
      trips.push(trip);
    }
    
    // Sort trips by start time (newest first)
    trips.sort((a, b) => b.startTime - a.startTime);
    
    this.setItem(STORAGE_KEYS.TRIPS, trips);
  }

  getAllTrips(): Trip[] {
    return this.getItem<Trip[]>(STORAGE_KEYS.TRIPS) || [];
  }

  getTripById(id: string): Trip | null {
    const trips = this.getAllTrips();
    return trips.find(trip => trip.id === id) || null;
  }

  getTripsForRoute(routeId: string): Trip[] {
    const trips = this.getAllTrips();
    return trips.filter(trip => trip.routeId === routeId);
  }

  getTripsInDateRange(startDate: Date, endDate: Date): Trip[] {
    const trips = this.getAllTrips();
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    
    return trips.filter(trip => 
      trip.startTime >= startTime && trip.startTime <= endTime
    );
  }

  deleteTrip(id: string): void {
    const trips = this.getAllTrips();
    const filteredTrips = trips.filter(trip => trip.id !== id);
    this.setItem(STORAGE_KEYS.TRIPS, filteredTrips);
  }

  // Route management
  saveRoute(route: Route): void {
    const routes = this.getAllRoutes();
    const existingIndex = routes.findIndex(r => r.id === route.id);
    
    if (existingIndex >= 0) {
      routes[existingIndex] = route;
    } else {
      routes.push(route);
    }
    
    this.setItem(STORAGE_KEYS.ROUTES, routes);
  }

  getAllRoutes(): Route[] {
    return this.getItem<Route[]>(STORAGE_KEYS.ROUTES) || [];
  }

  getActiveRoute(): Route | null {
    const routes = this.getAllRoutes();
    return routes.find(route => route.isActive) || null;
  }

  getRouteById(id: string): Route | null {
    const routes = this.getAllRoutes();
    return routes.find(route => route.id === id) || null;
  }

  setActiveRoute(routeId: string): void {
    const routes = this.getAllRoutes();
    
    // Deactivate all routes first
    routes.forEach(route => {
      route.isActive = false;
    });
    
    // Activate the selected route
    const targetRoute = routes.find(route => route.id === routeId);
    if (targetRoute) {
      targetRoute.isActive = true;
    }
    
    this.setItem(STORAGE_KEYS.ROUTES, routes);
  }

  deleteRoute(id: string): void {
    const routes = this.getAllRoutes();
    const filteredRoutes = routes.filter(route => route.id !== id);
    this.setItem(STORAGE_KEYS.ROUTES, filteredRoutes);
    
    // Also delete all trips for this route
    const trips = this.getAllTrips();
    const filteredTrips = trips.filter(trip => trip.routeId !== id);
    this.setItem(STORAGE_KEYS.TRIPS, filteredTrips);
  }

  // User preferences
  saveUserPreferences(preferences: UserPreferences): void {
    this.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  getUserPreferences(): UserPreferences {
    return this.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES) || {
      trackingEnabled: true,
      notificationsEnabled: true,
      autoDetectionSensitivity: 'medium',
      workingHours: {
        start: '08:00',
        end: '17:00'
      },
      workingDays: [1, 2, 3, 4, 5] // Monday to Friday
    };
  }

  // Current trip (for ongoing tracking)
  saveCurrentTrip(trip: Partial<Trip>): void {
    this.setItem(STORAGE_KEYS.CURRENT_TRIP, trip);
  }

  getCurrentTrip(): Partial<Trip> | null {
    return this.getItem<Partial<Trip>>(STORAGE_KEYS.CURRENT_TRIP);
  }

  clearCurrentTrip(): void {
    this.removeItem(STORAGE_KEYS.CURRENT_TRIP);
  }

  // Analytics and statistics
  getTripStats(routeId?: string): {
    totalTrips: number;
    averageDuration: number;
    bestTime: number;
    worstTime: number;
    totalDistance: number;
  } {
    let trips = this.getAllTrips();
    
    if (routeId) {
      trips = trips.filter(trip => trip.routeId === routeId);
    }

    if (trips.length === 0) {
      return {
        totalTrips: 0,
        averageDuration: 0,
        bestTime: 0,
        worstTime: 0,
        totalDistance: 0
      };
    }

    const durations = trips.map(trip => trip.duration);
    const distances = trips.map(trip => trip.distance || 0);

    return {
      totalTrips: trips.length,
      averageDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      bestTime: Math.min(...durations),
      worstTime: Math.max(...durations),
      totalDistance: distances.reduce((sum, d) => sum + d, 0)
    };
  }

  // Data export/import
  exportData(): string {
    const data = {
      trips: this.getAllTrips(),
      routes: this.getAllRoutes(),
      preferences: this.getUserPreferences(),
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  }

  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.trips) {
        this.setItem(STORAGE_KEYS.TRIPS, data.trips);
      }
      
      if (data.routes) {
        this.setItem(STORAGE_KEYS.ROUTES, data.routes);
      }
      
      if (data.preferences) {
        this.setItem(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      this.removeItem(key);
    });
  }
}

export const storageService = new StorageService();
