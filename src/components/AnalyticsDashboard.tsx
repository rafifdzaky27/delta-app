import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock, 
  Calendar,
  BarChart3,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { analyticsService } from '@/services/analytics';
import { storageService } from '@/services/storage';
import { formatDuration } from '@/lib/utils';

interface AnalyticsDashboardProps {
  routeId?: string;
}

export function AnalyticsDashboard({ routeId }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState(analyticsService.getTripAnalytics(routeId));
  const [weeklyPatterns, setWeeklyPatterns] = useState(analyticsService.getWeeklyPatterns(routeId));
  const [trends, setTrends] = useState(analyticsService.getTrendAnalysis(routeId));
  const [timing, setTiming] = useState(analyticsService.getOptimalTiming(routeId));
  const [insights, setInsights] = useState(analyticsService.getInsights(routeId));
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'insights'>('overview');

  useEffect(() => {
    // Refresh analytics when routeId changes
    setAnalytics(analyticsService.getTripAnalytics(routeId));
    setWeeklyPatterns(analyticsService.getWeeklyPatterns(routeId));
    setTrends(analyticsService.getTrendAnalysis(routeId));
    setTiming(analyticsService.getOptimalTiming(routeId));
    setInsights(analyticsService.getInsights(routeId));
  }, [routeId]);

  const getTrendIcon = () => {
    switch (trends.direction) {
      case 'improving': return <TrendingDown className="w-4 h-4 text-success" />;
      case 'declining': return <TrendingUp className="w-4 h-4 text-warning" />;
      default: return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trends.direction) {
      case 'improving': return 'text-success';
      case 'declining': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatDuration(analytics.averageDuration)}
            </div>
            <div className="text-sm text-muted-foreground">Average Time</div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gradient-card">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {formatDuration(analytics.bestTime)}
            </div>
            <div className="text-sm text-muted-foreground">Personal Best</div>
          </div>
        </Card>
      </div>

      {/* Consistency Score */}
      <Card className="p-4 bg-background shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Consistency Score</h3>
          <span className="text-2xl font-bold text-primary">{analytics.consistency}%</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${analytics.consistency}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {analytics.consistency > 80 ? 'Very consistent' : 
           analytics.consistency > 60 ? 'Moderately consistent' : 'Highly variable'}
        </p>
      </Card>

      {/* Trend Analysis */}
      <Card className="p-4 bg-background shadow-soft">
        <div className="flex items-center gap-2 mb-2">
          {getTrendIcon()}
          <h3 className="font-semibold text-foreground">30-Day Trend</h3>
        </div>
        <p className={`text-sm ${getTrendColor()}`}>{trends.description}</p>
        {trends.recommendation && (
          <p className="text-xs text-muted-foreground mt-2">
            💡 {trends.recommendation}
          </p>
        )}
      </Card>

      {/* Optimal Timing */}
      {timing.confidence > 30 && (
        <Card className="p-4 bg-gradient-success">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-success-foreground" />
            <h3 className="font-semibold text-success-foreground">Optimal Timing</h3>
          </div>
          <p className="text-sm text-success-foreground">
            Leave at {timing.bestDepartureTime} to save {formatDuration(timing.timeSavings)}
          </p>
          <div className="text-xs text-success-foreground/80 mt-1">
            {timing.confidence}% confidence based on your data
          </div>
        </Card>
      )}
    </div>
  );

  const renderPatterns = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Weekly Patterns
      </h3>
      
      {weeklyPatterns.map((pattern) => (
        <Card key={pattern.dayOfWeek} className="p-4 bg-background shadow-soft">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">{pattern.dayName}</div>
              <div className="text-sm text-muted-foreground">
                {pattern.tripCount} trips • Avg departure: {pattern.averageDeparture}
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-foreground">
                {pattern.tripCount > 0 ? formatDuration(pattern.averageDuration) : 'No data'}
              </div>
              {pattern.tripCount > 0 && (
                <div className="text-xs text-muted-foreground">
                  {pattern.consistency}% consistent
                </div>
              )}
            </div>
          </div>
          
          {pattern.tripCount > 0 && (
            <div className="mt-2">
              <div className="w-full bg-muted rounded-full h-1">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, (pattern.averageDuration / analytics.averageDuration) * 100)}%` 
                  }}
                />
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground flex items-center gap-2">
        <Lightbulb className="w-4 h-4" />
        Personal Insights
      </h3>
      
      {insights.length > 0 ? (
        insights.map((insight, index) => (
          <Card key={index} className="p-4 bg-gradient-card">
            <p className="text-sm text-foreground">{insight}</p>
          </Card>
        ))
      ) : (
        <Card className="p-6 bg-background shadow-soft text-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            Complete more trips to unlock personalized insights
          </p>
        </Card>
      )}

      {/* Action Items */}
      {timing.confidence > 50 && (
        <Card className="p-4 bg-gradient-primary">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-primary-foreground">Action Recommended</h4>
              <p className="text-sm text-primary-foreground/90">
                Try leaving at {timing.bestDepartureTime} tomorrow
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-primary-foreground" />
          </div>
        </Card>
      )}
    </div>
  );

  if (analytics.totalTrips === 0) {
    return (
      <Card className="p-8 bg-background shadow-soft text-center">
        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">No Analytics Yet</h3>
        <p className="text-muted-foreground">
          Complete a few trips to see your personal analytics and insights
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex bg-muted rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'patterns', label: 'Patterns', icon: Calendar },
          { id: 'insights', label: 'Insights', icon: Lightbulb },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex-1 gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'patterns' && renderPatterns()}
        {activeTab === 'insights' && renderInsights()}
      </div>
    </div>
  );
}
