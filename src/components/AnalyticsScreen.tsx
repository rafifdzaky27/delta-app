import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Calendar,
  Clock,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { storageService } from '@/services/storage';

interface AnalyticsScreenProps {
  onBack: () => void;
}

export function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const [selectedRoute, setSelectedRoute] = useState<string | undefined>(undefined);
  const routes = storageService.getAllRoutes();
  const activeRoute = storageService.getActiveRoute();

  return (
    <div className="min-h-screen bg-gradient-surface pb-20 md:pb-6">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          </div>
        </div>

        {/* Route Selector */}
        {routes.length > 1 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant={selectedRoute === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedRoute(undefined)}
            >
              All Routes
            </Button>
            {routes.map((route) => (
              <Button
                key={route.id}
                variant={selectedRoute === route.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedRoute(route.id)}
              >
                {route.name}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      <div className="px-6">
        <AnalyticsDashboard routeId={selectedRoute || activeRoute?.id} />
      </div>
    </div>
  );
}
