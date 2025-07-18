import { Button } from '@/components/ui/button';
import { 
  Home, 
  History, 
  TrendingUp, 
  Settings,
  BarChart3
} from 'lucide-react';

interface NavbarProps {
  currentScreen: 'welcome' | 'home' | 'trip' | 'history' | 'settings' | 'analytics';
  onNavigate: (screen: 'home' | 'trip' | 'history' | 'settings' | 'analytics') => void;
}

export function Navbar({ currentScreen, onNavigate }: NavbarProps) {
  if (currentScreen === 'welcome') return null;

  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ] as const;

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background/95 backdrop-blur-xl border-t border-border/50 px-6 py-3 z-50">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(item.id)}
              className={`
                relative flex flex-col items-center gap-1 p-3 h-auto w-16 rounded-2xl transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-primary text-primary-foreground shadow-floating scale-110' 
                  : 'hover:bg-gradient-card hover:scale-105'
                }
              `}
            >
              <div className="flex items-center justify-center w-5 h-5">
                <item.icon className={`
                  w-5 h-5 transition-all duration-300
                  ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
                `} />
              </div>
              
              <span className={`
                text-xs font-medium transition-all duration-300
                ${isActive ? 'text-primary-foreground' : 'text-muted-foreground'}
              `}>
                {item.label}
              </span>

              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-primary rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
