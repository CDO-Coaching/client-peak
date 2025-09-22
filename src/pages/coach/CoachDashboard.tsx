import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/layout/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Users, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientOverview {
  id: string;
  email: string;
  programme_name: string;
  current_week: number;
  next_session_date: string;
  completion_rate: number;
}

export const CoachDashboard = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClients: 0,
    activeSessions: 0,
    completedSessions: 0,
  });

  useEffect(() => {
    const fetchClientsData = async () => {
      if (!user) return;

      try {
        // Récupérer la vue dashboard coach
        const { data: dashboardData, error: dashboardError } = await supabase
          .from('coach_dashboard_view')
          .select('*')
          .eq('coach_id', user.id);

        if (dashboardError) throw dashboardError;

        setClients(dashboardData || []);

        // Calculer les statistiques
        const totalClients = dashboardData?.length || 0;
        const activeSessions = dashboardData?.filter(client => 
          new Date(client.next_session_date) >= new Date()
        ).length || 0;
        
        setStats({
          totalClients,
          activeSessions,
          completedSessions: totalClients - activeSessions,
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientsData();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Espace Coach</h1>
          <p className="text-muted-foreground">Gérez vos clients et suivez leur progression</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="shadow-soft rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                      <p className="text-3xl font-bold text-primary">{stats.totalClients}</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Séances Actives</p>
                      <p className="text-3xl font-bold text-warning">{stats.activeSessions}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-warning" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-soft rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Séances Terminées</p>
                      <p className="text-3xl font-bold text-success">{stats.completedSessions}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-success" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Liste des clients */}
            <Card className="shadow-medium rounded-2xl">
              <CardHeader>
                <CardTitle className="text-primary">Mes Clients</CardTitle>
                <CardDescription>
                  Aperçu de l'activité de vos clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                {clients.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">Aucun client pour le moment</p>
                    <p className="text-sm">Les clients apparaîtront ici une fois qu'ils auront rejoint vos programmes</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {clients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/50 transition-colors">
                        <div className="flex-1">
                          <h3 className="font-medium text-primary mb-1">{client.email}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Programme: {client.programme_name}
                          </p>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="rounded-full">
                              Semaine {client.current_week}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Prochaine séance: {new Date(client.next_session_date).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-primary">
                              {client.completion_rate}%
                            </div>
                            <div className="text-xs text-muted-foreground">Complétude</div>
                          </div>
                          
                          <Link to={`/coach/client/${client.id}`}>
                            <Button variant="outline" size="sm" className="rounded-xl">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Voir profil
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions rapides */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-colors">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Gérer Clients</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-colors">
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2 text-warning" />
                  <p className="font-medium">Planifier</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-colors">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-success" />
                  <p className="font-medium">Analyses</p>
                </div>
              </Button>
              
              <Button variant="outline" className="h-20 rounded-xl border-2 hover:border-primary hover:bg-accent transition-colors">
                <div className="text-center">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Validations</p>
                </div>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};