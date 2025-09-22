import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Navigation } from '@/components/layout/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Dumbbell, Target, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NextSession {
  id: string;
  programme_name: string;
  semaine_number: number;
  seance_name: string;
  seance_date: string;
  exercise_count: number;
}

export const ClientDashboard = () => {
  const { user } = useAuth();
  const [nextSession, setNextSession] = useState<NextSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextSession = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('client_next_seance_view')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Erreur lors du chargement de la prochaine séance:', error);
      } else {
        setNextSession(data);
      }
      setLoading(false);
    };

    fetchNextSession();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Mon Espace Client</h1>
          <p className="text-muted-foreground">Bienvenue dans votre espace de coaching personnel</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Prochaine séance */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-2 shadow-medium rounded-2xl">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-2xl">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Prochaine Séance
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Votre entraînement à venir
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {nextSession ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-1">
                        {nextSession.seance_name}
                      </h3>
                      <p className="text-muted-foreground">
                        Programme: {nextSession.programme_name} • Semaine {nextSession.semaine_number}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Dumbbell className="h-4 w-4" />
                        {nextSession.exercise_count} exercices
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(nextSession.seance_date).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                    <Link to={`/client/session/${nextSession.id}`}>
                      <Button className="w-full bg-gradient-to-r from-primary to-primary/90 rounded-xl">
                        Commencer la séance
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune séance programmée</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <div className="space-y-4">
              <Card className="shadow-soft rounded-2xl hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold text-primary">Feedback</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Partagez vos ressentis sur la dernière séance
                  </p>
                  <Link to="/client/feedback">
                    <Button variant="secondary" className="w-full rounded-xl">
                      Donner feedback
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-soft rounded-2xl hover:shadow-medium transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-success" />
                    <h3 className="font-semibold text-primary">Bien-être</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enregistrez votre état de forme du jour
                  </p>
                  <Link to="/client/wellness">
                    <Button variant="secondary" className="w-full rounded-xl">
                      Saisir données
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Historique et progression */}
            <Card className="col-span-1 md:col-span-2 lg:col-span-3 shadow-medium rounded-2xl">
              <CardHeader>
                <CardTitle className="text-primary">Ma Progression</CardTitle>
                <CardDescription>
                  Suivez votre évolution et vos performances
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link to="/client/history">
                    <Button variant="outline" className="w-full h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-colors">
                      <div className="text-center">
                        <Calendar className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <p className="font-medium">Historique</p>
                      </div>
                    </Button>
                  </Link>
                  
                  <Button variant="outline" className="w-full h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-colors">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
                      <p className="font-medium">Statistiques</p>
                    </div>
                  </Button>
                  
                  <Button variant="outline" className="w-full h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-colors">
                    <div className="text-center">
                      <Target className="h-6 w-6 mx-auto mb-2 text-warning" />
                      <p className="font-medium">Objectifs</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};