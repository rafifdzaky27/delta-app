import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DeltaComparison, DeltaType, Trip } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format duration from milliseconds to readable string
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Format time from timestamp to HH:MM
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Format date from timestamp
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

// Calculate delta comparison
export function calculateDelta(
  currentDuration: number,
  comparisonDuration: number
): DeltaComparison {
  const difference = currentDuration - comparisonDuration;
  const absDifference = Math.abs(difference);
  
  let type: DeltaType;
  if (absDifference < 30000) { // Less than 30 seconds difference
    type = 'same';
  } else if (difference < 0) {
    type = 'faster';
  } else {
    type = 'slower';
  }
  
  const sign = difference >= 0 ? '+' : '-';
  const formatted = `${sign}${formatDuration(absDifference)}`;
  
  return {
    value: difference,
    type,
    formatted
  };
}

// Get trips for analysis
export function getTripsForComparison(
  trips: Trip[],
  currentTrip: Trip,
  routeId: string
): {
  yesterday?: Trip;
  weeklyAverage?: number;
  personalBest?: Trip;
} {
  const routeTrips = trips.filter(trip => trip.routeId === routeId);
  const currentDate = new Date(currentTrip.startTime);
  
  // Find yesterday's trip
  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayTrip = routeTrips.find(trip => {
    const tripDate = new Date(trip.startTime);
    return tripDate.toDateString() === yesterday.toDateString();
  });
  
  // Calculate weekly average (last 7 days, excluding today)
  const weekAgo = new Date(currentDate);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weeklyTrips = routeTrips.filter(trip => {
    const tripDate = new Date(trip.startTime);
    return tripDate >= weekAgo && tripDate < currentDate;
  });
  
  const weeklyAverage = weeklyTrips.length > 0
    ? weeklyTrips.reduce((sum, trip) => sum + trip.duration, 0) / weeklyTrips.length
    : undefined;
  
  // Find personal best (shortest duration)
  const personalBest = routeTrips.reduce((best, trip) => {
    if (!best || trip.duration < best.duration) {
      return trip;
    }
    return best;
  }, null as Trip | null);
  
  return {
    yesterday: yesterdayTrip,
    weeklyAverage,
    personalBest: personalBest || undefined
  };
}

// Calculate average departure time
export function calculateAverageDeparture(trips: Trip[]): string {
  if (trips.length === 0) return '08:00';
  
  const totalMinutes = trips.reduce((sum, trip) => {
    const date = new Date(trip.startTime);
    return sum + (date.getHours() * 60 + date.getMinutes());
  }, 0);
  
  const avgMinutes = Math.round(totalMinutes / trips.length);
  const hours = Math.floor(avgMinutes / 60);
  const minutes = avgMinutes % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Get day of week name
export function getDayName(timestamp: number): string {
  const date = new Date(timestamp);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[date.getDay()];
}

// Check if two locations are approximately the same
export function locationsAreEqual(
  loc1: { latitude: number; longitude: number },
  loc2: { latitude: number; longitude: number },
  toleranceMeters: number = 100
): boolean {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (loc1.latitude * Math.PI) / 180;
  const φ2 = (loc2.latitude * Math.PI) / 180;
  const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180;
  const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;
  return distance <= toleranceMeters;
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
