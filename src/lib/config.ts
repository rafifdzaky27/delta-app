// Configuration management for DELTA app

export const config = {
  // App Information
  app: {
    name: import.meta.env.VITE_APP_NAME || 'DELTA',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },

  // Geolocation Settings
  geolocation: {
    timeout: Number(import.meta.env.VITE_GEOLOCATION_TIMEOUT) || 10000,
    maximumAge: Number(import.meta.env.VITE_GEOLOCATION_MAX_AGE) || 60000,
    enableHighAccuracy: import.meta.env.VITE_GEOLOCATION_HIGH_ACCURACY === 'true',
  },

  // Trip Tracking Configuration
  tracking: {
    minTripDuration: Number(import.meta.env.VITE_TRIP_MIN_DURATION) || 120000, // 2 minutes
    geofenceRadius: Number(import.meta.env.VITE_GEOFENCE_RADIUS) || 100, // meters
    idleTimeout: Number(import.meta.env.VITE_IDLE_TIMEOUT) || 300000, // 5 minutes
    minSpeedThreshold: Number(import.meta.env.VITE_MIN_SPEED_THRESHOLD) || 5, // km/h
  },

  // Storage Configuration
  storage: {
    prefix: import.meta.env.VITE_STORAGE_PREFIX || 'delta_',
    maxStoredTrips: Number(import.meta.env.VITE_MAX_STORED_TRIPS) || 100,
  },

  // Feature Flags
  features: {
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    mockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
    notifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false', // default true
  },

  // API Configuration (for future use)
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },

  // Map Services (for future use)
  maps: {
    mapboxToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
    googleMapsKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },

  // Development helpers
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;

// Type-safe environment variable access
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  if (value === undefined && defaultValue === undefined) {
    console.warn(`Environment variable ${key} is not defined`);
  }
  return value || defaultValue || '';
}

// Validation function to check required environment variables
export function validateConfig(): boolean {
  const requiredVars: string[] = [
    // Add any required environment variables here
  ];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    return false;
  }

  return true;
}

// Debug function to log current configuration (development only)
export function logConfig(): void {
  if (config.features.debugMode && config.isDevelopment) {
    console.group('🔧 DELTA Configuration');
    console.log('App:', config.app);
    console.log('Geolocation:', config.geolocation);
    console.log('Tracking:', config.tracking);
    console.log('Storage:', config.storage);
    console.log('Features:', config.features);
    console.groupEnd();
  }
}
