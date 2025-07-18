import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Calendar, 
  Filter,
  TrendingUp, 
  TrendingDown,
  Clock,
  Activity,
  BarChart3
} from 'lucide-react';

interface TripRecord {
  id: string;
  date: string;
  day: string;
  time: string;
  delta: string;
  deltaType: 'faster' | 'slower' | 'same';
  departureTime: string;
}

interface HistoryScreenProps {
  onBack: () => void;
  onSelectTrip: (tripId: string) => void;
}

export function HistoryScreen({ onBack, onSelectTrip }: HistoryScreenProps) {
  const [viewMode, setViewMode] = useState<'list' | 'week'>('list');
  
  const trips: TripRecord[] = [
    { id: '1', date: 'Dec 18', day: 'Today', time: '23:12', delta: '+3:11', deltaType: 'slower', departureTime: '08:07' },
    { id: '2', date: 'Dec 17', day: 'Yesterday', time: '20:01', delta: '+0:16', deltaType: 'slower', departureTime: '07:55' },
    { id: '3', date: 'Dec 16', day: 'Monday', time: '18:45', delta: '-1:20', deltaType: 'faster', departureTime: '07:48' },
    { id: '4', date: 'Dec 15', day: 'Sunday', time: '22:30', delta: '+2:45', deltaType: 'slower', departureTime: '08:15' },
    { id: '5', date: 'Dec 14', day: 'Saturday', time: '19:15', delta: '-0:50', deltaType: 'faster', departureTime: '07:52' },
    { id: '6', date: 'Dec 13', day: 'Friday', time: '21:05', delta: '+1:20', deltaType: 'slower', departureTime: '08:00' },
    { id: '7', date: 'Dec 12', day: 'Thursday', time: '19:55', delta: '+0:10', deltaType: 'slower', departureTime: '07:58' },
  ];

  const weeklyStats = {
    totalRides: 7,
    averageTime: '20:23',
    bestTime: '18:45',
    worstTime: '23:12',
    averageDeparture: '07:58'
  };

  const getDeltaColor = (type: 'faster' | 'slower' | 'same') => {
    switch (type) {
      case 'faster': return 'text-success';
      case 'slower': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getDeltaIcon = (type: 'faster' | 'slower' | 'same') => {
    switch (type) {
      case 'faster': return <TrendingDown className="w-3 h-3" />;
      case 'slower': return <TrendingUp className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Commute History</h1>
        <Button variant="ghost" size="sm">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {/* View Toggle */}
      <div className="px-6 mb-6">
        <div className="flex bg-muted rounded-xl p-1">
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex-1 h-8"
          >
            <Activity className="w-3 h-3 mr-1" />
            Trips
          </Button>
          <Button
            variant={viewMode === 'week' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('week')}
            className="flex-1 h-8"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            Weekly
          </Button>
        </div>
      </div>

      {viewMode === 'week' ? (
        /* Weekly Overview */
        <div className="px-6 space-y-6">
          <Card className="p-6 bg-gradient-card shadow-card">
            <h3 className="font-semibold text-foreground mb-4">This Week's Overview</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{weeklyStats.totalRides}</div>
                <div className="text-sm text-muted-foreground">Total rides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">{weeklyStats.averageTime}</div>
                <div className="text-sm text-muted-foreground">Average time</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Best time</span>
                <span className="font-medium text-success">{weeklyStats.bestTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Longest time</span>
                <span className="font-medium text-warning">{weeklyStats.worstTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Avg departure</span>
                <span className="font-medium text-foreground">{weeklyStats.averageDeparture}</span>
              </div>
            </div>
          </Card>

          {/* Day of Week Analysis */}
          <Card className="p-6 bg-background shadow-soft">
            <h4 className="font-medium text-foreground mb-4">Daily Patterns</h4>
            <div className="space-y-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => {
                const dayTrip = trips.find(t => t.day === day);
                return (
                  <div key={day} className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground w-20">{day}</span>
                    {dayTrip ? (
                      <>
                        <div className="flex-1 mx-4">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                dayTrip.deltaType === 'faster' ? 'bg-success' : 
                                dayTrip.deltaType === 'slower' ? 'bg-warning' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(100, (parseInt(dayTrip.time.split(':')[0]) * 60 + parseInt(dayTrip.time.split(':')[1])) / 25 * 100)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-foreground w-16 text-right">{dayTrip.time}</span>
                      </>
                    ) : (
                      <>
                        <div className="flex-1 mx-4">
                          <div className="h-2 bg-muted rounded-full" />
                        </div>
                        <span className="text-sm text-muted-foreground w-16 text-right">No ride</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        /* Trip List */
        <div className="px-6 space-y-3">
          {trips.map((trip, index) => (
            <Card 
              key={trip.id} 
              className="p-4 bg-background shadow-soft hover:shadow-card transition-all duration-200 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onSelectTrip(trip.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">{trip.time}</div>
                    <div className={`flex items-center gap-1 text-xs ${getDeltaColor(trip.deltaType)}`}>
                      {getDeltaIcon(trip.deltaType)}
                      <span>{trip.delta}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-foreground">{trip.day}</div>
                    <div className="text-sm text-muted-foreground">{trip.date}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Departed</div>
                  <div className="font-medium text-foreground">{trip.departureTime}</div>
                </div>
              </div>
            </Card>
          ))}

          {/* Load More */}
          <Button variant="outline" className="w-full mt-6 h-12">
            <Calendar className="w-4 h-4 mr-2" />
            Load Previous Week
          </Button>
        </div>
      )}

      <div className="h-8" /> {/* Bottom spacing */}
    </div>
  );
}