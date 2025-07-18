import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useRoutes } from '@/hooks/useRoutes';
import { useTripTracking } from '@/hooks/useTripTracking';

interface RouteSetupProps {
  onComplete: () => void;
}

export function RouteSetup({ onComplete }: RouteSetupProps) {
  const [routeName, setRouteName] = useState('Home to Office');
  const [step, setStep] = useState<'name' | 'location' | 'permission' | 'complete'>('name');
  const [error, setError] = useState<string | null>(null);
  
  const { createRouteFromCurrentLocation, isCreatingRoute } = useRoutes();
  const { startAutoDetection, hasPermission } = useTripTracking();

  const handleCreateRoute = async () => {
    if (!routeName.trim()) {
      setError('Please enter a route name');
      return;
    }

    setError(null);
    setStep('location');

    try {
      const route = await createRouteFromCurrentLocation(routeName);
      
      if (route) {
        setStep('permission');
      } else {
        setError('Failed to create route. Please check location permissions.');
        setStep('name');
      }
    } catch (error) {
      setError('Failed to create route. Please try again.');
      setStep('name');
    }
  };

  const handleRequestPermission = async () => {
    try {
      const granted = await startAutoDetection();
      
      if (granted) {
        setStep('complete');
        // Auto-complete after 2 seconds
        setTimeout(() => {
          onComplete();
        }, 2000);
      } else {
        setError('Location permission is required for automatic tracking');
      }
    } catch (error) {
      setError('Failed to request location permission');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'name':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MapPin className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">
                Name Your Route
              </h2>
              <p className="text-muted-foreground">
                What should we call your daily commute?
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="routeName">Route Name</Label>
                <Input
                  id="routeName"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g., Home to Office"
                  className="mt-1"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                onClick={handleCreateRoute}
                disabled={isCreatingRoute || !routeName.trim()}
                className="w-full"
              >
                {isCreatingRoute ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Route...
                  </>
                ) : (
                  'Create Route'
                )}
              </Button>
            </div>
          </div>
        );

      case 'location':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <h2 className="text-2xl font-semibold text-foreground">
                Getting Your Location
              </h2>
              <p className="text-muted-foreground">
                We're setting up your route using your current location...
              </p>
            </div>
          </div>
        );

      case 'permission':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <MapPin className="w-12 h-12 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">
                Enable Auto-Tracking
              </h2>
              <p className="text-muted-foreground">
                Allow DELTA to automatically detect when you start your commute
              </p>
            </div>

            <Card className="p-4 bg-gradient-card">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-muted-foreground">Automatic trip detection</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-muted-foreground">Background location tracking</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span className="text-muted-foreground">Data stays on your device</span>
                </div>
              </div>
            </Card>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              onClick={handleRequestPermission}
              className="w-full"
            >
              Enable Auto-Tracking
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-success mx-auto" />
              <h2 className="text-2xl font-semibold text-foreground">
                All Set!
              </h2>
              <p className="text-muted-foreground">
                DELTA is now ready to track your commute automatically
              </p>
            </div>

            <Card className="p-4 bg-gradient-success">
              <div className="text-center">
                <div className="text-sm text-success-foreground font-medium">
                  Route: {routeName}
                </div>
                <div className="text-xs text-success-foreground/80 mt-1">
                  Auto-tracking enabled
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12">
        <div className="w-full max-w-sm mx-auto">
          {renderStep()}
        </div>
      </div>

      {step === 'complete' && (
        <div className="p-6 pb-8">
          <div className="max-w-sm mx-auto">
            <Button 
              onClick={onComplete}
              className="w-full"
            >
              Start Using DELTA
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
