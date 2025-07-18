import { useState, useEffect, useCallback } from 'react';
import { Trip, TripStatus, Route } from '@/types';
import { tripTrackingService } from '@/services/tripTracking';
import { storageService } from '@/services/storage';

export interface UseTripTrackingReturn {
  // State
  currentTrip: Partial<Trip> | null;
  tripStatus: TripStatus;
  isTracking: boolean;
  hasPermission: boolean;
  
  // Actions
  startAutoDetection: () => Promise<boolean>;
  stopAutoDetection: () => void;
  forceStartTrip: () => boolean;
  forceEndTrip: () => boolean;
  
  // Data
  recentTrips: Trip[];
  activeRoute: Route | null;
  
  // Callbacks
  onTripStart?: (trip: Partial<Trip>) => void;
  onTripUpdate?: (trip: Partial<Trip>) => void;
  onTripComplete?: (trip: Trip) => void;
}

export function useTripTracking(): UseTripTrackingReturn {
  const [currentTrip, setCurrentTrip] = useState<Partial<Trip> | null>(null);
  const [tripStatus, setTripStatus] = useState<TripStatus>('idle');
  const [hasPermission, setHasPermission] = useState(false);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [activeRoute, setActiveRoute] = useState<Route | null>(null);

  // Initialize tracking service callbacks
  useEffect(() => {
    tripTrackingService.setCallbacks({
      onTripStart: (trip) => {
        setCurrentTrip(trip);
        console.log('Trip started:', trip);
      },
      onTripUpdate: (trip) => {
        setCurrentTrip(trip);
      },
      onTripComplete: (trip) => {
        setCurrentTrip(null);
        setRecentTrips(prev => [trip, ...prev.slice(0, 9)]); // Keep last 10 trips
        console.log('Trip completed:', trip);
      },
      onStatusChange: (status) => {
        setTripStatus(status);
      }
    });

    // Load initial state
    setCurrentTrip(tripTrackingService.getCurrentTrip());
    setTripStatus(tripTrackingService.getTripStatus());
    loadInitialData();
  }, []);

  const loadInitialData = useCallback(() => {
    // Load recent trips
    const trips = storageService.getAllTrips().slice(0, 10);
    setRecentTrips(trips);
    
    // Load active route
    const route = storageService.getActiveRoute();
    setActiveRoute(route);
  }, []);

  const startAutoDetection = useCallback(async (): Promise<boolean> => {
    try {
      const success = await tripTrackingService.startAutoDetection();
      setHasPermission(success);
      return success;
    } catch (error) {
      console.error('Failed to start auto detection:', error);
      setHasPermission(false);
      return false;
    }
  }, []);

  const stopAutoDetection = useCallback(() => {
    tripTrackingService.stopAutoDetection();
  }, []);

  const forceStartTrip = useCallback((): boolean => {
    return tripTrackingService.forceStartTrip();
  }, []);

  const forceEndTrip = useCallback((): boolean => {
    return tripTrackingService.forceEndTrip();
  }, []);

  const isTracking = tripStatus === 'tracking' || tripStatus === 'detecting';

  return {
    // State
    currentTrip,
    tripStatus,
    isTracking,
    hasPermission,
    
    // Actions
    startAutoDetection,
    stopAutoDetection,
    forceStartTrip,
    forceEndTrip,
    
    // Data
    recentTrips,
    activeRoute
  };
}
