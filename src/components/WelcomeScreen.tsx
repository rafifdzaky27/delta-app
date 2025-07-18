import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MapPin, ArrowRight, Timer } from 'lucide-react';
import heroImage from '@/assets/hero-commute.jpg';

interface WelcomeScreenProps {
  onComplete: () => void;
}

export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const [step, setStep] = useState(1);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-12">
        <div className="w-full max-w-sm mx-auto text-center space-y-8">
          
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="DELTA Commute Tracking" 
                  className="w-full h-48 object-cover rounded-2xl shadow-card"
                />
                <div className="absolute inset-0 bg-gradient-primary opacity-10 rounded-2xl"></div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground">
                  Welcome to <span className="text-primary">DELTA</span>
                </h1>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Track your daily commute and discover your personal patterns. 
                  No racing, just rhythm.
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in space-y-8">
              <div className="bg-gradient-card p-8 rounded-2xl shadow-card">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Set Your Route
                </h2>
                <p className="text-muted-foreground">
                  We'll learn your daily commute by watching your first ride. 
                  Just head to work as usual tomorrow.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span>Automatic route detection</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span>Privacy-first tracking</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary-light flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                  </div>
                  <span>Personal insights only</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-8">
              <div className="bg-gradient-card p-8 rounded-2xl shadow-card">
                <Timer className="w-12 h-12 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Track Your Delta
                </h2>
                <p className="text-muted-foreground">
                  See how today compares to yesterday, your average, and your best times. 
                  Understand your commute patterns.
                </p>
              </div>
              
              <Card className="p-6 bg-gradient-card shadow-card">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-success">-2:30</div>
                  <div className="text-sm text-muted-foreground">vs yesterday</div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="p-6 pb-8">
        <div className="max-w-sm mx-auto space-y-4">
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'bg-primary w-6' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <Button 
            onClick={handleNext}
            className="w-full h-12 text-base font-medium"
            size="lg"
          >
            {step === 3 ? 'Start Tracking' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {step > 1 && (
            <Button 
              variant="ghost" 
              onClick={() => setStep(step - 1)}
              className="w-full"
            >
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}