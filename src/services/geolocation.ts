import { Location, RoutePoint } from '@/types';
import { config } from '@/lib/config';

export class GeolocationService {
  private watchId: number | null = null;
  private isTracking = false;
  private callbacks: {
    onLocationUpdate?: (location: RoutePoint) => void;
    onError?: (error: GeolocationPositionError) => void;
  } = {};

  constructor() {
    this.checkSupport();
  }

  private checkSupport(): boolean {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser');
      return false;
    }
    return true;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const position = await this.getCurrentPosition();
      return !!position;
    } catch (error) {
      console.error('Geolocation permission denied:', error);
      return false;
    }
  }

  getCurrentPosition(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(location);
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: config.geolocation.enableHighAccuracy,
          timeout: config.geolocation.timeout,
          maximumAge: config.geolocation.maximumAge
        }
      );
    });
  }

  startTracking(callbacks: {
    onLocationUpdate: (location: RoutePoint) => void;
    onError?: (error: GeolocationPositionError) => void;
  }): boolean {
    if (!navigator.geolocation || this.isTracking) {
      return false;
    }

    this.callbacks = callbacks;
    this.isTracking = true;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const routePoint: RoutePoint = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
          timestamp: Date.now()
        };

        this.callbacks.onLocationUpdate?.(routePoint);
      },
      (error) => {
        console.error('Geolocation error:', error);
        this.callbacks.onError?.(error);
      },
      {
        enableHighAccuracy: config.geolocation.enableHighAccuracy,
        timeout: 5000, // Shorter timeout for continuous tracking
        maximumAge: 1000 // 1 second for real-time tracking
      }
    );

    return true;
  }

  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
    this.callbacks = {};
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  // Calculate distance between two points using Haversine formula
  static calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Check if a point is within a certain radius of a target location
  static isWithinRadius(
    currentLocation: Location,
    targetLocation: Location,
    radiusMeters: number = config.tracking.geofenceRadius
  ): boolean {
    const distance = this.calculateDistance(currentLocation, targetLocation);
    return distance <= radiusMeters;
  }

  // Calculate speed between two points
  static calculateSpeed(point1: RoutePoint, point2: RoutePoint): number {
    const distance = this.calculateDistance(point1, point2);
    const timeDiff = (point2.timestamp - point1.timestamp) / 1000; // seconds
    
    if (timeDiff === 0) return 0;
    
    const speedMps = distance / timeDiff; // meters per second
    return speedMps * 3.6; // convert to km/h
  }
}

export const geolocationService = new GeolocationService();
