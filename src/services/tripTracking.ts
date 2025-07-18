import { Trip, Route, RoutePoint, Location, TripStatus, TripSectorTime } from '@/types';
import { geolocationService, GeolocationService } from './geolocation';
import { storageService } from './storage';
import { generateId, formatDuration } from '@/lib/utils';
import { config } from '@/lib/config';

export class TripTrackingService {
  private status: TripStatus = 'idle';
  private currentTrip: Partial<Trip> | null = null;
  private routePoints: RoutePoint[] = [];
  private lastLocation: RoutePoint | null = null;
  private tripStartTime: number | null = null;
  private callbacks: {
    onTripStart?: (trip: Partial<Trip>) => void;
    onTripUpdate?: (trip: Partial<Trip>) => void;
    onTripComplete?: (trip: Trip) => void;
    onStatusChange?: (status: TripStatus) => void;
  } = {};

  // Configuration from environment
  private readonly GEOFENCE_RADIUS = config.tracking.geofenceRadius;
  private readonly MIN_SPEED_THRESHOLD = config.tracking.minSpeedThreshold;
  private readonly IDLE_TIMEOUT = config.tracking.idleTimeout;
  private readonly MIN_TRIP_DURATION = config.tracking.minTripDuration;

  constructor() {
    this.loadCurrentTrip();
    
    if (config.features.debugMode) {
      console.log('🚗 TripTrackingService initialized with config:', {
        geofenceRadius: this.GEOFENCE_RADIUS,
        minSpeedThreshold: this.MIN_SPEED_THRESHOLD,
        idleTimeout: this.IDLE_TIMEOUT,
        minTripDuration: this.MIN_TRIP_DURATION
      });
    }
  }

  setCallbacks(callbacks: {
    onTripStart?: (trip: Partial<Trip>) => void;
    onTripUpdate?: (trip: Partial<Trip>) => void;
    onTripComplete?: (trip: Trip) => void;
    onStatusChange?: (status: TripStatus) => void;
  }): void {
    this.callbacks = callbacks;
  }

  private setStatus(newStatus: TripStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.callbacks.onStatusChange?.(newStatus);
      
      if (config.features.debugMode) {
        console.log(`🔄 Trip status changed: ${this.status} → ${newStatus}`);
      }
    }
  }

  private loadCurrentTrip(): void {
    const savedTrip = storageService.getCurrentTrip();
    if (savedTrip && savedTrip.startTime) {
      this.currentTrip = savedTrip;
      this.routePoints = savedTrip.routePoints || [];
      this.tripStartTime = savedTrip.startTime;
      this.setStatus('tracking');
      
      if (config.features.debugMode) {
        console.log('📱 Loaded existing trip from storage:', savedTrip);
      }
    }
  }

  async startAutoDetection(): Promise<boolean> {
    const hasPermission = await geolocationService.requestPermission();
    if (!hasPermission) {
      console.error('Geolocation permission required for auto-detection');
      return false;
    }

    this.setStatus('detecting');

    const success = geolocationService.startTracking({
      onLocationUpdate: (location) => this.handleLocationUpdate(location),
      onError: (error) => this.handleLocationError(error)
    });

    if (config.features.debugMode && success) {
      console.log('🎯 Auto-detection started successfully');
    }

    return success;
  }

  stopAutoDetection(): void {
    geolocationService.stopTracking();
    this.setStatus('idle');
    
    if (config.features.debugMode) {
      console.log('⏹️ Auto-detection stopped');
    }
  }

  private handleLocationUpdate(location: RoutePoint): void {
    const activeRoute = storageService.getActiveRoute();
    if (!activeRoute) {
      if (config.features.debugMode) {
        console.warn('⚠️ No active route configured');
      }
      return;
    }

    switch (this.status) {
      case 'detecting':
        this.checkForTripStart(location, activeRoute);
        break;
      case 'tracking':
        this.updateCurrentTrip(location, activeRoute);
        break;
    }

    this.lastLocation = location;
  }

  private checkForTripStart(location: RoutePoint, route: Route): void {
    // Check if we're near the start location and moving
    const isNearStart = GeolocationService.isWithinRadius(
      location,
      route.startLocation,
      this.GEOFENCE_RADIUS
    );

    const isMoving = this.isMovingSignificantly(location);
    const isWorkingTime = this.isWithinWorkingHours();

    if (config.features.debugMode) {
      console.log('🔍 Checking trip start conditions:', {
        isNearStart,
        isMoving,
        isWorkingTime,
        distance: GeolocationService.calculateDistance(location, route.startLocation)
      });
    }

    if (isNearStart && isMoving && isWorkingTime) {
      this.startTrip(location, route);
    }
  }

  private startTrip(startLocation: RoutePoint, route: Route): void {
    this.tripStartTime = Date.now();
    this.routePoints = [startLocation];
    
    this.currentTrip = {
      id: generateId(),
      routeId: route.id,
      startTime: this.tripStartTime,
      startLocation: startLocation,
      routePoints: this.routePoints,
      sectorTimes: [],
      createdAt: Date.now()
    };

    // Save to storage for persistence
    storageService.saveCurrentTrip(this.currentTrip);
    
    this.setStatus('tracking');
    this.callbacks.onTripStart?.(this.currentTrip);
    
    if (config.features.debugMode) {
      console.log('🚀 Trip started:', this.currentTrip);
    }
  }

  private updateCurrentTrip(location: RoutePoint, route: Route): void {
    if (!this.currentTrip || !this.tripStartTime) return;

    this.routePoints.push(location);
    
    // Update current trip data
    this.currentTrip.routePoints = this.routePoints;
    this.currentTrip.duration = Date.now() - this.tripStartTime;
    
    // Calculate distance
    if (this.routePoints.length > 1) {
      this.currentTrip.distance = this.calculateTotalDistance();
    }

    // Update sector times
    this.currentTrip.sectorTimes = this.calculateSectorTimes(route);

    // Check if trip should end
    const isNearEnd = GeolocationService.isWithinRadius(
      location,
      route.endLocation,
      this.GEOFENCE_RADIUS
    );

    const hasBeenIdle = this.hasBeenIdleForTooLong(location);

    if (config.features.debugMode && (isNearEnd || hasBeenIdle)) {
      console.log('🏁 Trip end conditions met:', { isNearEnd, hasBeenIdle });
    }

    if (isNearEnd || hasBeenIdle) {
      this.completeTrip(location);
    } else {
      // Save progress
      storageService.saveCurrentTrip(this.currentTrip);
      this.callbacks.onTripUpdate?.(this.currentTrip);
    }
  }

  private completeTrip(endLocation: RoutePoint): void {
    if (!this.currentTrip || !this.tripStartTime) return;

    const endTime = Date.now();
    const duration = endTime - this.tripStartTime;

    // Only save trips that meet minimum duration
    if (duration < this.MIN_TRIP_DURATION) {
      if (config.features.debugMode) {
        console.log('⏱️ Trip too short, discarding:', formatDuration(duration));
      }
      this.resetCurrentTrip();
      return;
    }

    const completedTrip: Trip = {
      ...this.currentTrip,
      endTime,
      endLocation,
      duration,
      distance: this.calculateTotalDistance(),
      averageSpeed: this.calculateAverageSpeed(),
      routePoints: this.routePoints
    } as Trip;

    // Save completed trip
    storageService.saveTrip(completedTrip);
    storageService.clearCurrentTrip();

    this.callbacks.onTripComplete?.(completedTrip);
    this.resetCurrentTrip();
    
    if (config.features.debugMode) {
      console.log('✅ Trip completed:', {
        duration: formatDuration(completedTrip.duration),
        distance: `${(completedTrip.distance! / 1000).toFixed(2)} km`,
        averageSpeed: `${completedTrip.averageSpeed?.toFixed(1)} km/h`
      });
    }
  }

  private resetCurrentTrip(): void {
    this.currentTrip = null;
    this.routePoints = [];
    this.tripStartTime = null;
    this.setStatus('detecting');
  }

  private isMovingSignificantly(currentLocation: RoutePoint): boolean {
    if (!this.lastLocation) return false;

    const speed = GeolocationService.calculateSpeed(this.lastLocation, currentLocation);
    return speed > this.MIN_SPEED_THRESHOLD;
  }

  private isWithinWorkingHours(): boolean {
    const preferences = storageService.getUserPreferences();
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Check if today is a working day
    if (!preferences.workingDays.includes(currentDay)) {
      return false;
    }

    // Parse working hours
    const [startHour, startMin] = preferences.workingHours.start.split(':').map(Number);
    const [endHour, endMin] = preferences.workingHours.end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Allow 2 hours before and after working hours
    const bufferMinutes = 120;
    
    return currentTime >= (startTime - bufferMinutes) && 
           currentTime <= (endTime + bufferMinutes);
  }

  private hasBeenIdleForTooLong(currentLocation: RoutePoint): boolean {
    if (this.routePoints.length < 2) return false;

    const recentPoints = this.routePoints.slice(-5); // Last 5 points
    const now = Date.now();

    // Check if we've been in roughly the same location for too long
    const isStationary = recentPoints.every(point => {
      const distance = GeolocationService.calculateDistance(point, currentLocation);
      return distance < 50; // Within 50 meters
    });

    const oldestRecentPoint = recentPoints[0];
    const timeSinceMovement = now - oldestRecentPoint.timestamp;

    return isStationary && timeSinceMovement > this.IDLE_TIMEOUT;
  }

  private calculateTotalDistance(): number {
    if (this.routePoints.length < 2) return 0;

    let totalDistance = 0;
    for (let i = 1; i < this.routePoints.length; i++) {
      totalDistance += GeolocationService.calculateDistance(
        this.routePoints[i - 1],
        this.routePoints[i]
      );
    }

    return totalDistance;
  }

  private calculateAverageSpeed(): number {
    if (!this.currentTrip?.duration || !this.currentTrip?.distance) return 0;

    const durationHours = this.currentTrip.duration / (1000 * 60 * 60);
    const distanceKm = this.currentTrip.distance / 1000;

    return distanceKm / durationHours;
  }

  private calculateSectorTimes(route: Route): TripSectorTime[] {
    const sectorTimes: TripSectorTime[] = [];
    
    for (const sector of route.sectors) {
      const startTime = this.findTimeAtLocation(sector.startPoint);
      const endTime = this.findTimeAtLocation(sector.endPoint);
      
      if (startTime && endTime) {
        sectorTimes.push({
          sectorId: sector.id,
          startTime,
          endTime,
          duration: endTime - startTime
        });
      }
    }

    return sectorTimes;
  }

  private findTimeAtLocation(targetLocation: Location): number | null {
    const PROXIMITY_THRESHOLD = 100; // meters

    for (const point of this.routePoints) {
      const distance = GeolocationService.calculateDistance(point, targetLocation);
      if (distance <= PROXIMITY_THRESHOLD) {
        return point.timestamp;
      }
    }

    return null;
  }

  private handleLocationError(error: GeolocationPositionError): void {
    console.error('Location tracking error:', error);
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.error('Location permission denied');
        break;
      case error.POSITION_UNAVAILABLE:
        console.error('Location information unavailable');
        break;
      case error.TIMEOUT:
        console.error('Location request timeout');
        break;
    }
  }

  // Public methods for manual control
  getCurrentTrip(): Partial<Trip> | null {
    return this.currentTrip;
  }

  getTripStatus(): TripStatus {
    return this.status;
  }

  forceStartTrip(): boolean {
    if (this.status !== 'detecting' || !this.lastLocation) {
      return false;
    }

    const activeRoute = storageService.getActiveRoute();
    if (!activeRoute) {
      return false;
    }

    this.startTrip(this.lastLocation, activeRoute);
    return true;
  }

  forceEndTrip(): boolean {
    if (this.status !== 'tracking' || !this.lastLocation) {
      return false;
    }

    this.completeTrip(this.lastLocation);
    return true;
  }
}

export const tripTrackingService = new TripTrackingService();
