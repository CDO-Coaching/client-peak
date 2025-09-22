import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Dumbbell } from 'lucide-react';

export const Navigation = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-card shadow-soft border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-primary">CoachPro</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-primary"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};