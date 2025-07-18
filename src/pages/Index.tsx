import { useState, useEffect } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { TripSummaryScreen } from '@/components/TripSummaryScreen';
import { HistoryScreen } from '@/components/HistoryScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { Navbar } from '@/components/Navbar';
import { storageService } from '@/services/storage';

type Screen = 'welcome' | 'home' | 'trip' | 'history' | 'settings';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Check if user has completed onboarding
  useEffect(() => {
    const hasActiveRoute = storageService.getActiveRoute();
    const hasCompletedOnboarding = localStorage.getItem('delta_onboarding_completed');
    
    if (hasActiveRoute || hasCompletedOnboarding) {
      setIsFirstTime(false);
      setCurrentScreen('home');
    }
  }, []);

  const handleCompleteWelcome = () => {
    localStorage.setItem('delta_onboarding_completed', 'true');
    setIsFirstTime(false);
    setCurrentScreen('home');
  };

  const handleNavigate = (screen: 'home' | 'trip' | 'history' | 'settings') => {
    setCurrentScreen(screen);
  };

  const handleViewHistory = () => {
    setCurrentScreen('history');
  };

  const handleViewTrip = () => {
    setCurrentScreen('trip');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleSelectTrip = (tripId: string) => {
    // In a real app, you'd load the specific trip data
    setCurrentScreen('trip');
  };

  // Show welcome screen for first-time users
  if (isFirstTime) {
    return <WelcomeScreen onComplete={handleCompleteWelcome} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onViewHistory={handleViewHistory} onViewTrip={handleViewTrip} />;
      case 'trip':
        return <TripSummaryScreen onBack={handleBackToHome} />;
      case 'history':
        return <HistoryScreen onBack={handleBackToHome} onSelectTrip={handleSelectTrip} />;
      case 'settings':
        return <SettingsScreen onBack={handleBackToHome} />;
      default:
        return <HomeScreen onViewHistory={handleViewHistory} onViewTrip={handleViewTrip} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen relative">
      {/* Main Content */}
      <div className="pb-20">
        {renderScreen()}
      </div>
      
      {/* Floating Bottom Navbar */}
      <Navbar 
        currentScreen={currentScreen} 
        onNavigate={handleNavigate} 
      />
    </div>
  );
};

export default Index;
