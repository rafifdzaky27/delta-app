import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  ArrowRight,
  MapPin,
  Timer,
  Activity
} from 'lucide-react';

interface CommuteData {
  todayTime: string;
  delta: string;
  deltaType: 'faster' | 'slower' | 'same';
  departureTime: string;
  usualDeparture: string;
  sectors: Array<{
    name: string;
    time: string;
    delta: string;
    deltaType: 'faster' | 'slower' | 'same';
  }>;
  weeklyAverage: string;
  bestTime: string;
}

interface HomeScreenProps {
  onViewHistory: () => void;
  onViewTrip: () => void;
}

export function HomeScreen({ onViewHistory, onViewTrip }: HomeScreenProps) {
  const [commuteData] = useState<CommuteData>({
    todayTime: "23:12",
    delta: "+3:11",
    deltaType: "slower",
    departureTime: "08:07",
    usualDeparture: "07:55",
    sectors: [
      { name: "Home to Pasupati", time: "8:30", delta: "+0:41", deltaType: "slower" },
      { name: "Pasupati to Cihampelas", time: "12:15", delta: "-0:33", deltaType: "faster" },
      { name: "Cihampelas to Office", time: "2:27", delta: "+3:03", deltaType: "slower" }
    ],
    weeklyAverage: "20:01",
    bestTime: "18:45"
  });

  const getDeltaColor = (type: 'faster' | 'slower' | 'same') => {
    switch (type) {
      case 'faster': return 'text-success';
      case 'slower': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getDeltaIcon = (type: 'faster' | 'slower' | 'same') => {
    switch (type) {
      case 'faster': return <TrendingDown className="w-4 h-4" />;
      case 'slower': return <TrendingUp className="w-4 h-4" />;
      default: return <Timer className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Good morning</h1>
            <p className="text-muted-foreground">Here's your commute update</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onViewHistory}>
            <Calendar className="w-4 h-4" />
          </Button>
        </div>

        {/* Today's Summary Card */}
        <Card className="p-6 bg-gradient-card shadow-card animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-medium text-foreground">Today's Commute</span>
            </div>
            <span className="text-sm text-muted-foreground">Just now</span>
          </div>

          <div className="space-y-4">
            {/* Main Time Display */}
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-foreground mb-2">
                {commuteData.todayTime}
              </div>
              <div className={`flex items-center justify-center gap-1 text-lg font-medium ${getDeltaColor(commuteData.deltaType)}`}>
                {getDeltaIcon(commuteData.deltaType)}
                <span>{commuteData.delta} vs usual</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">You left</div>
                <div className="font-semibold text-foreground">{commuteData.departureTime}</div>
                <div className="text-xs text-muted-foreground">
                  (usual: {commuteData.usualDeparture})
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-1">Best time</div>
                <div className="font-semibold text-foreground">{commuteData.bestTime}</div>
                <div className="text-xs text-success">Personal record</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <Button 
          onClick={onViewTrip}
          variant="soft"
          className="w-full mt-4 h-12"
        >
          View detailed breakdown
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Sectors Preview */}
      <div className="px-6 pb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Route Sectors</h2>
        <div className="space-y-3">
          {commuteData.sectors.map((sector, index) => (
            <Card key={index} className="p-4 bg-background shadow-soft animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground text-sm">{sector.name}</div>
                    <div className="text-xs text-muted-foreground">{sector.time}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 ${getDeltaColor(sector.deltaType)}`}>
                  {getDeltaIcon(sector.deltaType)}
                  <span className="text-sm font-medium">{sector.delta}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="px-6 pb-8">
        <Card className="p-6 bg-background shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">This Week</h3>
            <Button variant="ghost" size="sm" onClick={onViewHistory}>
              View all
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Average</div>
              <div className="text-lg font-semibold text-foreground">{commuteData.weeklyAverage}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Best</div>
              <div className="text-lg font-semibold text-success">{commuteData.bestTime}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-1">Rides</div>
              <div className="text-lg font-semibold text-foreground">4</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}