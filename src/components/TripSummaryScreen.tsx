import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  MapPin,
  Timer,
  Calendar,
  Route,
  Share
} from 'lucide-react';

interface TripData {
  date: string;
  totalTime: string;
  delta: string;
  deltaType: 'faster' | 'slower' | 'same';
  startTime: string;
  endTime: string;
  distance: string;
  sectors: Array<{
    name: string;
    time: string;
    delta: string;
    deltaType: 'faster' | 'slower' | 'same';
    distance: string;
  }>;
  comparison: {
    vsYesterday: string;
    vsAverage: string;
    vsBest: string;
  };
}

interface TripSummaryScreenProps {
  onBack: () => void;
}

export function TripSummaryScreen({ onBack }: TripSummaryScreenProps) {
  const tripData: TripData = {
    date: "Today, Dec 18",
    totalTime: "23:12",
    delta: "+3:11",
    deltaType: "slower",
    startTime: "08:07",
    endTime: "08:30",
    distance: "12.4 km",
    sectors: [
      { 
        name: "Home to Pasupati Bridge", 
        time: "8:30", 
        delta: "+0:41", 
        deltaType: "slower",
        distance: "4.2 km"
      },
      { 
        name: "Pasupati to Cihampelas", 
        time: "12:15", 
        delta: "-0:33", 
        deltaType: "faster",
        distance: "5.8 km"
      },
      { 
        name: "Cihampelas to Office", 
        time: "2:27", 
        delta: "+3:03", 
        deltaType: "slower",
        distance: "2.4 km"
      }
    ],
    comparison: {
      vsYesterday: "+3:11",
      vsAverage: "+1:47",
      vsBest: "+4:27"
    }
  };

  const getDeltaColor = (type: 'faster' | 'slower' | 'same') => {
    switch (type) {
      case 'faster': return 'text-success bg-success-light';
      case 'slower': return 'text-warning bg-warning-light';
      default: return 'text-muted-foreground bg-muted';
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
      <div className="flex items-center justify-between p-6 pb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Trip Summary</h1>
        <Button variant="ghost" size="sm">
          <Share className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-6 space-y-6">
        {/* Trip Overview */}
        <Card className="p-6 bg-gradient-card shadow-card">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-muted-foreground">{tripData.date}</h2>
              <div className="text-5xl font-bold text-foreground">{tripData.totalTime}</div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getDeltaColor(tripData.deltaType)}`}>
                {getDeltaIcon(tripData.deltaType)}
                <span>{tripData.delta} vs usual</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <Clock className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">Started</div>
                <div className="font-semibold text-foreground">{tripData.startTime}</div>
              </div>
              <div className="text-center">
                <Route className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">Distance</div>
                <div className="font-semibold text-foreground">{tripData.distance}</div>
              </div>
              <div className="text-center">
                <MapPin className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                <div className="text-sm text-muted-foreground">Arrived</div>
                <div className="font-semibold text-foreground">{tripData.endTime}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Comparison Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center bg-background shadow-soft">
            <div className="text-xs text-muted-foreground mb-1">vs Yesterday</div>
            <div className="font-semibold text-warning">{tripData.comparison.vsYesterday}</div>
          </Card>
          <Card className="p-4 text-center bg-background shadow-soft">
            <div className="text-xs text-muted-foreground mb-1">vs Average</div>
            <div className="font-semibold text-warning">{tripData.comparison.vsAverage}</div>
          </Card>
          <Card className="p-4 text-center bg-background shadow-soft">
            <div className="text-xs text-muted-foreground mb-1">vs Best</div>
            <div className="font-semibold text-warning">{tripData.comparison.vsBest}</div>
          </Card>
        </div>

        {/* Sector Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Route Breakdown</h3>
          
          {tripData.sectors.map((sector, index) => (
            <Card key={index} className="p-4 bg-background shadow-soft animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center">
                      <span className="font-semibold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{sector.name}</div>
                      <div className="text-sm text-muted-foreground">{sector.distance}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-foreground">{sector.time}</div>
                    <div className={`flex items-center gap-1 justify-end ${getDeltaColor(sector.deltaType)}`}>
                      {getDeltaIcon(sector.deltaType)}
                      <span className="text-sm font-medium">{sector.delta}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      sector.deltaType === 'faster' ? 'bg-success' : 
                      sector.deltaType === 'slower' ? 'bg-warning' : 'bg-primary'
                    }`}
                    style={{ 
                      width: `${Math.min(100, (parseInt(sector.time.split(':')[0]) * 60 + parseInt(sector.time.split(':')[1])) / 20 * 100)}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Insights */}
        <Card className="p-6 bg-accent border-none shadow-soft">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
              <Timer className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Insight</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your Cihampelas to Office segment was significantly slower today (+3:03). 
                This usually indicates heavier traffic around the city center during your commute time.
              </p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 pb-8">
          <Button variant="soft" className="w-full h-12">
            <Calendar className="w-4 h-4 mr-2" />
            View Weekly Trends
          </Button>
          <Button variant="outline" className="w-full h-12">
            <Route className="w-4 h-4 mr-2" />
            Adjust Route Sectors
          </Button>
        </div>
      </div>
    </div>
  );
}