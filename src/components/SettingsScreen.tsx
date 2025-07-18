import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  MapPin, 
  Bell, 
  Download, 
  Trash2, 
  Info,
  Clock,
  Zap
} from 'lucide-react';
import { storageService } from '@/services/storage';
import { useTripTracking } from '@/hooks/useTripTracking';
import { useRoutes } from '@/hooks/useRoutes';
import { config } from '@/lib/config';

interface SettingsScreenProps {
  onBack: () => void;
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [preferences, setPreferences] = useState(storageService.getUserPreferences());
  const { tripStatus, stopAutoDetection, startAutoDetection } = useTripTracking();
  const { routes, activeRoute } = useRoutes();

  const handlePreferenceChange = (key: keyof typeof preferences, value: any) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    storageService.saveUserPreferences(updated);
  };

  const handleWorkingHoursChange = (field: 'start' | 'end', value: string) => {
    const updated = {
      ...preferences,
      workingHours: {
        ...preferences.workingHours,
        [field]: value
      }
    };
    setPreferences(updated);
    storageService.saveUserPreferences(updated);
  };

  const handleExportData = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `delta-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      storageService.clearAllData();
      window.location.reload();
    }
  };

  const toggleTracking = async () => {
    if (tripStatus === 'idle') {
      await startAutoDetection();
    } else {
      stopAutoDetection();
    }
  };

  const stats = storageService.getTripStats();

  return (
    <div className="min-h-screen bg-gradient-surface pb-20 md:pb-6">
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* App Status */}
        <Card className="p-6 bg-gradient-card shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Tracking Status</h2>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              tripStatus === 'tracking' ? 'bg-success text-success-foreground' :
              tripStatus === 'detecting' ? 'bg-warning text-warning-foreground' :
              'bg-muted text-muted-foreground'
            }`}>
              {tripStatus === 'tracking' ? 'Active Trip' :
               tripStatus === 'detecting' ? 'Detecting' : 'Idle'}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tracking-enabled">Auto-tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically detect and track your commute
                </p>
              </div>
              <Switch
                id="tracking-enabled"
                checked={preferences.trackingEnabled && tripStatus !== 'idle'}
                onCheckedChange={toggleTracking}
              />
            </div>

            {activeRoute && (
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Active Route: {activeRoute.name}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6 bg-background shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Trip notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when trips start and complete
              </p>
            </div>
            <Switch
              id="notifications"
              checked={preferences.notificationsEnabled}
              onCheckedChange={(checked) => handlePreferenceChange('notificationsEnabled', checked)}
            />
          </div>
        </Card>

        {/* Working Hours */}
        <Card className="p-6 bg-background shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Working Hours</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={preferences.workingHours.start}
                  onChange={(e) => handleWorkingHoursChange('start', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={preferences.workingHours.end}
                  onChange={(e) => handleWorkingHoursChange('end', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <div>
              <Label>Detection Sensitivity</Label>
              <div className="mt-2 space-y-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sensitivity"
                      value={level}
                      checked={preferences.autoDetectionSensitivity === level}
                      onChange={() => handlePreferenceChange('autoDetectionSensitivity', level)}
                      className="text-primary"
                    />
                    <span className="text-sm capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Card className="p-6 bg-background shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Statistics</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">{stats.totalTrips}</div>
              <div className="text-sm text-muted-foreground">Total Trips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(stats.totalDistance / 1000)}km
              </div>
              <div className="text-sm text-muted-foreground">Total Distance</div>
            </div>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 bg-background shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            
            <Button
              onClick={handleClearData}
              variant="destructive"
              className="w-full justify-start gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* App Info */}
        <Card className="p-6 bg-background shadow-soft">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">{config.app.name}</h3>
            <p className="text-sm text-muted-foreground">Version {config.app.version}</p>
            <p className="text-xs text-muted-foreground">
              Personal commute tracker for urban mobility
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
