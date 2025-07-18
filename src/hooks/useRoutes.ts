import { useState, useEffect, useCallback } from 'react';
import { Route, Location, RouteSector } from '@/types';
import { storageService } from '@/services/storage';
import { geolocationService } from '@/services/geolocation';
import { generateId } from '@/lib/utils';

export interface UseRoutesReturn {
  // State
  routes: Route[];
  activeRoute: Route | null;
  isCreatingRoute: boolean;
  
  // Actions
  createRoute: (name: string, startLocation: Location, endLocation: Location) => Promise<Route>;
  createRouteFromCurrentLocation: (name: string) => Promise<Route | null>;
  setActiveRoute: (routeId: string) => void;
  deleteRoute: (routeId: string) => void;
  addSectorToRoute: (routeId: string, sector: Omit<RouteSector, 'id'>) => void;
  updateRoute: (route: Route) => void;
  
  // Utilities
  getCurrentLocation: () => Promise<Location | null>;
}

export function useRoutes(): UseRoutesReturn {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [activeRoute, setActiveRouteState] = useState<Route | null>(null);
  const [isCreatingRoute, setIsCreatingRoute] = useState(false);

  // Load routes on mount
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = useCallback(() => {
    const allRoutes = storageService.getAllRoutes();
    setRoutes(allRoutes);
    
    const active = storageService.getActiveRoute();
    setActiveRouteState(active);
  }, []);

  const createRoute = useCallback(async (
    name: string, 
    startLocation: Location, 
    endLocation: Location
  ): Promise<Route> => {
    setIsCreatingRoute(true);
    
    try {
      const newRoute: Route = {
        id: generateId(),
        name,
        startLocation,
        endLocation,
        sectors: [],
        createdAt: Date.now(),
        isActive: routes.length === 0 // Make first route active by default
      };

      storageService.saveRoute(newRoute);
      
      if (newRoute.isActive) {
        storageService.setActiveRoute(newRoute.id);
      }
      
      loadRoutes();
      return newRoute;
    } finally {
      setIsCreatingRoute(false);
    }
  }, [routes.length]);

  const createRouteFromCurrentLocation = useCallback(async (name: string): Promise<Route | null> => {
    setIsCreatingRoute(true);
    
    try {
      const currentLocation = await geolocationService.getCurrentPosition();
      
      // For now, we'll create a route with the same start and end location
      // In a real implementation, you'd want to let the user set the end location
      const route = await createRoute(name, currentLocation, currentLocation);
      return route;
    } catch (error) {
      console.error('Failed to create route from current location:', error);
      return null;
    } finally {
      setIsCreatingRoute(false);
    }
  }, [createRoute]);

  const setActiveRoute = useCallback((routeId: string) => {
    storageService.setActiveRoute(routeId);
    loadRoutes();
  }, [loadRoutes]);

  const deleteRoute = useCallback((routeId: string) => {
    storageService.deleteRoute(routeId);
    loadRoutes();
  }, [loadRoutes]);

  const addSectorToRoute = useCallback((routeId: string, sectorData: Omit<RouteSector, 'id'>) => {
    const route = routes.find(r => r.id === routeId);
    if (!route) return;

    const newSector: RouteSector = {
      ...sectorData,
      id: generateId()
    };

    const updatedRoute: Route = {
      ...route,
      sectors: [...route.sectors, newSector].sort((a, b) => a.order - b.order)
    };

    storageService.saveRoute(updatedRoute);
    loadRoutes();
  }, [routes, loadRoutes]);

  const updateRoute = useCallback((updatedRoute: Route) => {
    storageService.saveRoute(updatedRoute);
    loadRoutes();
  }, [loadRoutes]);

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    try {
      return await geolocationService.getCurrentPosition();
    } catch (error) {
      console.error('Failed to get current location:', error);
      return null;
    }
  }, []);

  return {
    // State
    routes,
    activeRoute,
    isCreatingRoute,
    
    // Actions
    createRoute,
    createRouteFromCurrentLocation,
    setActiveRoute,
    deleteRoute,
    addSectorToRoute,
    updateRoute,
    
    // Utilities
    getCurrentLocation
  };
}
