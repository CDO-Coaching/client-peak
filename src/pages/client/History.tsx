import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Target, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SessionHistory {
  id: string;
  seance_name: string;
  programme_name: string;
  semaine_number: number;
  seance_date: string;
  completed_at: string | null;
  status: 'completed' | 'started' | 'scheduled';
  exercise_count: number;
  total_sets: number;
  total_reps: number;
  duration_minutes: number | null;
}

export const History = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'started'>('all');

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('session_history_view')
        .select('*')
        .eq('user_id', user?.id)
        .order('seance_date', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'historique',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-success/20 text-success">Terminée</Badge>;
      case 'started':
        return <Badge variant="secondary" className="bg-warning/20 text-warning">En cours</Badge>;
      default:
        return <Badge variant="outline">Programmée</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Target className="h-4 w-4 text-success" />;
      case 'started':
        return <Activity className="h-4 w-4 text-warning" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-elegant border-0 bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Historique des Séances</CardTitle>
                  <CardDescription>
                    Consultez l'historique de vos entraînements et votre progression
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Filtres */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className="rounded-xl"
                >
                  Toutes ({sessions.length})
                </Button>
                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                  className="rounded-xl"
                >
                  Terminées ({sessions.filter(s => s.status === 'completed').length})
                </Button>
                <Button
                  variant={filter === 'started' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('started')}
                  className="rounded-xl"
                >
                  En cours ({sessions.filter(s => s.status === 'started').length})
                </Button>
              </div>

              {/* Liste des séances */}
              <div className="space-y-4">
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {filter === 'all' 
                        ? 'Aucune séance trouvée dans votre historique'
                        : `Aucune séance ${filter === 'completed' ? 'terminée' : 'en cours'} trouvée`
                      }
                    </p>
                  </div>
                ) : (
                  filteredSessions.map((session) => (
                    <Card key={session.id} className="border-l-4 border-l-primary/30 hover:border-l-primary transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(session.status)}
                              <h3 className="font-semibold text-lg">{session.seance_name}</h3>
                              {getStatusBadge(session.status)}
                            </div>
                            
                            <div className="space-y-2 text-sm text-muted-foreground">
                              <p className="flex items-center gap-2">
                                <span className="font-medium">Programme:</span>
                                {session.programme_name} - Semaine {session.semaine_number}
                              </p>
                              <p className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Programmée: {format(new Date(session.seance_date), 'dd MMMM yyyy', { locale: fr })}</span>
                              </p>
                              {session.completed_at && (
                                <p className="flex items-center gap-2">
                                  <Target className="h-4 w-4" />
                                  <span>Terminée: {format(new Date(session.completed_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}</span>
                                </p>
                              )}
                            </div>

                            <div className="flex gap-6 mt-4 text-sm">
                              <div className="flex items-center gap-1">
                                <Activity className="h-4 w-4 text-primary" />
                                <span>{session.exercise_count} exercices</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-primary" />
                                <span>{session.total_sets} séries</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-bold">∑</span>
                                <span>{session.total_reps} répétitions</span>
                              </div>
                              {session.duration_minutes && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-primary" />
                                  <span>{session.duration_minutes} min</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};