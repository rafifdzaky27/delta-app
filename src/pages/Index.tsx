import { useState } from 'react';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { HomeScreen } from '@/components/HomeScreen';
import { TripSummaryScreen } from '@/components/TripSummaryScreen';
import { HistoryScreen } from '@/components/HistoryScreen';

type Screen = 'welcome' | 'home' | 'trip' | 'history';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');

  const handleCompleteWelcome = () => {
    setCurrentScreen('home');
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

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onComplete={handleCompleteWelcome} />;
      case 'home':
        return <HomeScreen onViewHistory={handleViewHistory} onViewTrip={handleViewTrip} />;
      case 'trip':
        return <TripSummaryScreen onBack={handleBackToHome} />;
      case 'history':
        return <HistoryScreen onBack={handleBackToHome} onSelectTrip={handleSelectTrip} />;
      default:
        return <HomeScreen onViewHistory={handleViewHistory} onViewTrip={handleViewTrip} />;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background min-h-screen">
      {renderScreen()}
    </div>
  );
};

export default Index;
