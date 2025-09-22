import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Calendar, MessageSquare, Heart, Target, TrendingUp, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { ResponsiveLayout } from '@/components/layout/ResponsiveLayout';

interface NextSession {
  id: string;
  programme_name: string;
  semaine_number: number;
  seance_name: string;
  seance_date: string;
  exercise_count: number;
}

export const MobileClientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [nextSession, setNextSession] = useState<NextSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextSession = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('client_next_seance_view')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        setNextSession(data);
      } catch (error: any) {
        console.error('Error fetching next session:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNextSession();
  }, [user]);

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Tableau de bord</h1>
          <p className="text-muted-foreground">Bienvenue dans votre espace d'entraînement</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Prochaine séance */}
            <Card className="shadow-elegant border-0 bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">Prochaine Séance</CardTitle>
                    <CardDescription>Votre prochaine session d'entraînement</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {nextSession ? (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">{nextSession.seance_name}</h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p>{nextSession.programme_name} - Semaine {nextSession.semaine_number}</p>
                        <p>{nextSession.exercise_count} exercices programmés</p>
                        <p className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(nextSession.seance_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <Link to={`/client/session/${nextSession.id}`} className="block">
                      <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-xl shadow-md touch-manipulation">
                        <Play className="h-5 w-5 mr-2" />
                        Commencer la séance
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Aucune séance programmée pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="shadow-medium hover:shadow-lg transition-all duration-300 group touch-manipulation">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Feedback</h3>
                      <p className="text-sm text-muted-foreground">Commentaires sur vos séances</p>
                    </div>
                  </div>
                  <Link to="/client/feedback" className="block">
                    <Button className="w-full rounded-xl touch-manipulation min-h-[48px]" variant="outline">
                      Donner un feedback
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-medium hover:shadow-lg transition-all duration-300 group touch-manipulation">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center group-hover:bg-success/20 transition-colors">
                      <Heart className="h-6 w-6 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Bien-être</h3>
                      <p className="text-sm text-muted-foreground">Suivi quotidien</p>
                    </div>
                  </div>
                  <Link to="/client/wellness" className="block">
                    <Button className="w-full rounded-xl touch-manipulation min-h-[48px]" variant="outline">
                      Logger bien-être
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Ma progression */}
            <Card className="shadow-elegant border-0 bg-background/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-xl">Ma Progression</CardTitle>
                    <CardDescription>Suivez votre évolution et vos objectifs</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link to="/client/history" className="block">
                    <Button 
                      variant="outline" 
                      className="w-full h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-all duration-200 touch-manipulation"
                    >
                      <div className="text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Historique</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/client/statistics" className="block">
                    <Button 
                      variant="outline" 
                      className="w-full h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-all duration-200 touch-manipulation"
                    >
                      <div className="text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
                        <p className="font-medium">Statistiques</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Link to="/client/goals" className="block sm:col-span-1 col-span-1">
                    <Button 
                      variant="outline" 
                      className="w-full h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-all duration-200 touch-manipulation"
                    >
                      <div className="text-center">
                        <Target className="h-6 w-6 mx-auto mb-2 text-warning" />
                        <p className="font-medium">Objectifs</p>
                      </div>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </ResponsiveLayout>
  );
};