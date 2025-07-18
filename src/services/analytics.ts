import { Trip, Route } from '@/types';
import { storageService } from './storage';
import { formatDuration, getDayName, calculateDelta } from '@/lib/utils';

export interface TripAnalytics {
  totalTrips: number;
  averageDuration: number;
  bestTime: number;
  worstTime: number;
  totalDistance: number;
  averageSpeed: number;
  consistency: number; // 0-100 score
}

export interface WeeklyPattern {
  dayOfWeek: number;
  dayName: string;
  averageDuration: number;
  tripCount: number;
  averageDeparture: string;
  consistency: number;
}

export interface TimePattern {
  hour: number;
  averageDuration: number;
  tripCount: number;
  efficiency: number; // compared to overall average
}

export interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  changePercent: number;
  description: string;
  recommendation?: string;
}

export interface OptimalTiming {
  bestDepartureTime: string;
  worstDepartureTime: string;
  timeSavings: number; // in milliseconds
  confidence: number; // 0-100
}

export class AnalyticsService {
  
  // Get comprehensive trip analytics
  static getTripAnalytics(routeId?: string): TripAnalytics {
    let trips = storageService.getAllTrips();
    
    if (routeId) {
      trips = trips.filter(trip => trip.routeId === routeId);
    }

    if (trips.length === 0) {
      return {
        totalTrips: 0,
        averageDuration: 0,
        bestTime: 0,
        worstTime: 0,
        totalDistance: 0,
        averageSpeed: 0,
        consistency: 0
      };
    }

    const durations = trips.map(trip => trip.duration);
    const distances = trips.map(trip => trip.distance || 0);
    const speeds = trips.map(trip => trip.averageSpeed || 0).filter(s => s > 0);

    const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
    const bestTime = Math.min(...durations);
    const worstTime = Math.max(...durations);
    
    // Calculate consistency (lower standard deviation = higher consistency)
    const variance = durations.reduce((sum, d) => sum + Math.pow(d - averageDuration, 2), 0) / durations.length;
    const standardDeviation = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (standardDeviation / averageDuration * 100));

    return {
      totalTrips: trips.length,
      averageDuration,
      bestTime,
      worstTime,
      totalDistance: distances.reduce((sum, d) => sum + d, 0),
      averageSpeed: speeds.length > 0 ? speeds.reduce((sum, s) => sum + s, 0) / speeds.length : 0,
      consistency: Math.round(consistency)
    };
  }

  // Analyze weekly patterns
  static getWeeklyPatterns(routeId?: string): WeeklyPattern[] {
    let trips = storageService.getAllTrips();
    
    if (routeId) {
      trips = trips.filter(trip => trip.routeId === routeId);
    }

    const patterns: WeeklyPattern[] = [];
    
    for (let day = 0; day < 7; day++) {
      const dayTrips = trips.filter(trip => {
        const tripDate = new Date(trip.startTime);
        return tripDate.getDay() === day;
      });

      if (dayTrips.length === 0) {
        patterns.push({
          dayOfWeek: day,
          dayName: getDayName(new Date(2024, 0, day + 1).getTime()), // Get day name
          averageDuration: 0,
          tripCount: 0,
          averageDeparture: '08:00',
          consistency: 0
        });
        continue;
      }

      const durations = dayTrips.map(trip => trip.duration);
      const averageDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      
      // Calculate average departure time
      const departureTimes = dayTrips.map(trip => {
        const date = new Date(trip.startTime);
        return date.getHours() * 60 + date.getMinutes();
      });
      const avgDepartureMinutes = departureTimes.reduce((sum, t) => sum + t, 0) / departureTimes.length;
      const avgHours = Math.floor(avgDepartureMinutes / 60);
      const avgMinutes = Math.round(avgDepartureMinutes % 60);
      
      // Calculate consistency for this day
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - averageDuration, 2), 0) / durations.length;
      const standardDeviation = Math.sqrt(variance);
      const consistency = Math.max(0, 100 - (standardDeviation / averageDuration * 100));

      patterns.push({
        dayOfWeek: day,
        dayName: getDayName(new Date(2024, 0, day + 1).getTime()),
        averageDuration,
        tripCount: dayTrips.length,
        averageDeparture: `${avgHours.toString().padStart(2, '0')}:${avgMinutes.toString().padStart(2, '0')}`,
        consistency: Math.round(consistency)
      });
    }

    return patterns;
  }

  // Analyze time-of-day patterns
  static getTimePatterns(routeId?: string): TimePattern[] {
    let trips = storageService.getAllTrips();
    
    if (routeId) {
      trips = trips.filter(trip => trip.routeId === routeId);
    }

    const patterns: TimePattern[] = [];
    const overallAverage = trips.length > 0 
      ? trips.reduce((sum, trip) => sum + trip.duration, 0) / trips.length 
      : 0;

    for (let hour = 6; hour <= 10; hour++) { // Focus on morning commute hours
      const hourTrips = trips.filter(trip => {
        const tripDate = new Date(trip.startTime);
        return tripDate.getHours() === hour;
      });

      if (hourTrips.length === 0) {
        patterns.push({
          hour,
          averageDuration: 0,
          tripCount: 0,
          efficiency: 0
        });
        continue;
      }

      const averageDuration = hourTrips.reduce((sum, trip) => sum + trip.duration, 0) / hourTrips.length;
      const efficiency = overallAverage > 0 ? ((overallAverage - averageDuration) / overallAverage) * 100 : 0;

      patterns.push({
        hour,
        averageDuration,
        tripCount: hourTrips.length,
        efficiency: Math.round(efficiency)
      });
    }

    return patterns;
  }

  // Analyze trends over time
  static getTrendAnalysis(routeId?: string, days: number = 30): TrendAnalysis {
    let trips = storageService.getAllTrips();
    
    if (routeId) {
      trips = trips.filter(trip => trip.routeId === routeId);
    }

    const cutoffDate = Date.now() - (days * 24 * 60 * 60 * 1000);
    const recentTrips = trips.filter(trip => trip.startTime >= cutoffDate);

    if (recentTrips.length < 4) {
      return {
        direction: 'stable',
        changePercent: 0,
        description: 'Not enough data for trend analysis',
        recommendation: 'Complete more trips to see trends'
      };
    }

    // Split into first half and second half
    const midpoint = Math.floor(recentTrips.length / 2);
    const firstHalf = recentTrips.slice(0, midpoint);
    const secondHalf = recentTrips.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, trip) => sum + trip.duration, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, trip) => sum + trip.duration, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;
    const absChange = Math.abs(changePercent);

    let direction: 'improving' | 'declining' | 'stable';
    let description: string;
    let recommendation: string | undefined;

    if (absChange < 5) {
      direction = 'stable';
      description = 'Your commute times are consistent';
      recommendation = 'Try leaving at different times to find optimization opportunities';
    } else if (changePercent < 0) {
      direction = 'improving';
      description = `Your commute times are improving by ${absChange.toFixed(1)}%`;
      recommendation = 'Keep up the good work! Your route optimization is paying off';
    } else {
      direction = 'declining';
      description = `Your commute times are increasing by ${absChange.toFixed(1)}%`;
      recommendation = 'Consider adjusting your departure time or exploring alternative routes';
    }

    return {
      direction,
      changePercent: Math.round(changePercent * 10) / 10,
      description,
      recommendation
    };
  }

  // Find optimal departure times
  static getOptimalTiming(routeId?: string): OptimalTiming {
    const timePatterns = this.getTimePatterns(routeId);
    const validPatterns = timePatterns.filter(p => p.tripCount > 0);

    if (validPatterns.length < 2) {
      return {
        bestDepartureTime: '08:00',
        worstDepartureTime: '08:00',
        timeSavings: 0,
        confidence: 0
      };
    }

    const bestPattern = validPatterns.reduce((best, current) => 
      current.averageDuration < best.averageDuration ? current : best
    );

    const worstPattern = validPatterns.reduce((worst, current) => 
      current.averageDuration > worst.averageDuration ? current : worst
    );

    const timeSavings = worstPattern.averageDuration - bestPattern.averageDuration;
    const totalTrips = validPatterns.reduce((sum, p) => sum + p.tripCount, 0);
    const confidence = Math.min(100, (totalTrips / 10) * 100); // Higher confidence with more data

    return {
      bestDepartureTime: `${bestPattern.hour.toString().padStart(2, '0')}:00`,
      worstDepartureTime: `${worstPattern.hour.toString().padStart(2, '0')}:00`,
      timeSavings,
      confidence: Math.round(confidence)
    };
  }

  // Get insights and recommendations
  static getInsights(routeId?: string): string[] {
    const analytics = this.getTripAnalytics(routeId);
    const weeklyPatterns = this.getWeeklyPatterns(routeId);
    const trends = this.getTrendAnalysis(routeId);
    const timing = this.getOptimalTiming(routeId);
    
    const insights: string[] = [];

    // Consistency insights
    if (analytics.consistency > 80) {
      insights.push('🎯 Your commute times are very consistent');
    } else if (analytics.consistency < 50) {
      insights.push('⚠️ Your commute times vary significantly - look for patterns');
    }

    // Weekly pattern insights
    const bestDay = weeklyPatterns.reduce((best, day) => 
      day.tripCount > 0 && day.averageDuration < best.averageDuration ? day : best
    );
    const worstDay = weeklyPatterns.reduce((worst, day) => 
      day.tripCount > 0 && day.averageDuration > worst.averageDuration ? day : worst
    );

    if (bestDay.dayName !== worstDay.dayName) {
      const timeDiff = worstDay.averageDuration - bestDay.averageDuration;
      insights.push(`📅 ${bestDay.dayName}s are your fastest (${formatDuration(timeDiff)} faster than ${worstDay.dayName}s)`);
    }

    // Timing insights
    if (timing.confidence > 50 && timing.timeSavings > 60000) { // More than 1 minute savings
      insights.push(`⏰ Leaving at ${timing.bestDepartureTime} could save you ${formatDuration(timing.timeSavings)}`);
    }

    // Trend insights
    if (trends.recommendation) {
      insights.push(`📈 ${trends.description}`);
    }

    return insights.slice(0, 4); // Limit to 4 insights
  }
}

export const analyticsService = AnalyticsService;
