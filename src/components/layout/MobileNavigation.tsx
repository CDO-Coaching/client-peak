import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Home, 
  Calendar, 
  Activity, 
  Heart, 
  MessageSquare, 
  TrendingUp, 
  Target, 
  Users,
  User,
  LogOut,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const MobileNavigation = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const isCoach = user?.email?.includes('coach') || user?.email?.includes('admin');

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const clientMenuItems = [
    { 
      label: 'Dashboard', 
      icon: Home, 
      path: '/client',
      description: 'Vue d\'ensemble'
    },
    { 
      label: 'Historique', 
      icon: Calendar, 
      path: '/client/history',
      description: 'Séances passées'
    },
    { 
      label: 'Statistiques', 
      icon: TrendingUp, 
      path: '/client/statistics',
      description: 'Progression'
    },
    { 
      label: 'Objectifs', 
      icon: Target, 
      path: '/client/goals',
      description: 'Mes objectifs'
    },
    { 
      label: 'Feedback', 
      icon: MessageSquare, 
      path: '/client/feedback',
      description: 'Retour séance'
    },
    { 
      label: 'Bien-être', 
      icon: Heart, 
      path: '/client/wellness',
      description: 'Suivi quotidien'
    },
  ];

  const coachMenuItems = [
    { 
      label: 'Dashboard', 
      icon: Home, 
      path: '/coach',
      description: 'Vue d\'ensemble'
    },
    { 
      label: 'Clients', 
      icon: Users, 
      path: '/coach/clients',
      description: 'Gestion clients'
    },
    { 
      label: 'Planning', 
      icon: Calendar, 
      path: '/coach/schedule',
      description: 'Séances programmées'
    },
    { 
      label: 'Analyses', 
      icon: BarChart3, 
      path: '/coach/analytics',
      description: 'Statistiques'
    },
    { 
      label: 'Validations', 
      icon: CheckCircle, 
      path: '/coach/validations',
      description: 'À valider'
    },
  ];

  const menuItems = isCoach ? coachMenuItems : clientMenuItems;

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {user?.email}
                  </p>
                  <Badge variant="outline" className="mt-1">
                    {isCoach ? 'Coach' : 'Client'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-2 px-4">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-md' 
                          : 'hover:bg-accent hover:text-accent-foreground'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-5 w-5" />
                Se déconnecter
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};