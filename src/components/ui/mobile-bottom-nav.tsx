import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Heart, 
  Users,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isCoach = user?.email?.includes('coach') || user?.email?.includes('admin');

  const clientNavItems = [
    { 
      label: 'Dashboard', 
      icon: Home, 
      path: '/client'
    },
    { 
      label: 'Historique', 
      icon: Calendar, 
      path: '/client/history'
    },
    { 
      label: 'Stats', 
      icon: TrendingUp, 
      path: '/client/statistics'
    },
    { 
      label: 'Objectifs', 
      icon: Target, 
      path: '/client/goals'
    },
    { 
      label: 'Bien-être', 
      icon: Heart, 
      path: '/client/wellness'
    },
  ];

  const coachNavItems = [
    { 
      label: 'Dashboard', 
      icon: Home, 
      path: '/coach'
    },
    { 
      label: 'Clients', 
      icon: Users, 
      path: '/coach/clients'
    },
    { 
      label: 'Planning', 
      icon: Calendar, 
      path: '/coach/schedule'
    },
    { 
      label: 'Analyses', 
      icon: BarChart3, 
      path: '/coach/analytics'
    },
    { 
      label: 'Valid.', 
      icon: CheckCircle, 
      path: '/coach/validations'
    },
  ];

  const navItems = isCoach ? coachNavItems : clientNavItems;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border/40">
      <div className="grid grid-cols-5 gap-1 px-2 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 touch-manipulation
                ${isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
              <span className="text-xs font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for phones with home indicator */}
      <div className="h-[env(safe-area-inset-bottom)] bg-background/95"></div>
    </div>
  );
};