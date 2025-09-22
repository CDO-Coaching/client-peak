import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  User, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Heart,
  ArrowLeft,
  Mail,
  Phone,
  Clock,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ClientDetails {
  id: string;
  email: string;
  profile: {
    full_name: string | null;
    phone: string | null;
    date_of_birth: string | null;
    height: number | null;
    weight: number | null;
  } | null;
  programme_name: string | null;
  current_week: number | null;
  next_session_date: string | null;
  completion_rate: number;
  total_sessions: number;
  completed_sessions: number;
  current_streak: number;
}

interface SessionHistory {
  id: string;
  seance_name: string;
  seance_date: string;
  completed_at: string | null;
  status: string;
  duration_minutes: number | null;
}

interface WellnessData {
  date: string;
  sleep_hours: number;
  fatigue_level: number;
  stress_level: number;
  soreness_level: number;
  notes: string | null;
}

interface ProgressChart {
  date: string;
  sessions: number;
  completion_rate: number;
}

export const ClientProfile = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [clientDetails, setClientDetails] = useState<ClientDetails | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [progressData, setProgressData] = useState<ProgressChart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && clientId) {
      fetchClientData();
    }
  }, [user, clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from('coach_client_details_view')
        .select('*')
        .eq('coach_id', user?.id)
        .eq('client_id', clientId)
        .single();

      if (clientError) throw clientError;

      // Fetch session history
      const { data: historyData, error: historyError } = await supabase
        .from('client_session_history_view')
        .select('*')
        .eq('user_id', clientId)
        .order('seance_date', { ascending: false })
        .limit(20);

      if (historyError) throw historyError;

      // Fetch wellness data
      const { data: wellnessData, error: wellnessError } = await supabase
        .from('wellness_logs')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(30);

      if (wellnessError) throw wellnessError;

      // Fetch progress chart data
      const { data: progressData, error: progressError } = await supabase
        .from('client_progress_chart_view')
        .select('*')
        .eq('user_id', clientId)
        .order('date', { ascending: true })
        .limit(30);

      if (progressError) throw progressError;

      setClientDetails(clientData);
      setSessionHistory(historyData || []);
      setWellnessData(wellnessData || []);
      setProgressData(progressData || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données du client',
        variant: 'destructive',
      });
      navigate('/coach');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/20 text-success">Terminée</Badge>;
      case 'started':
        return <Badge variant="secondary">En cours</Badge>;
      default:
        return <Badge variant="outline">Programmée</Badge>;
    }
  };

  const getWellnessColor = (value: number, reverse: boolean = false) => {
    if (reverse) {
      if (value <= 3) return 'text-success';
      if (value <= 7) return 'text-warning';
      return 'text-destructive';
    } else {
      if (value >= 7) return 'text-success';
      if (value >= 4) return 'text-warning';
      return 'text-destructive';
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

  if (!clientDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Client non trouvé</p>
            <Button onClick={() => navigate('/coach')} className="mt-4">
              Retour au dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <Card className="shadow-elegant border-0 bg-background/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/coach')}
                    className="rounded-xl"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                  </Button>
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">
                        {clientDetails.profile?.full_name || clientDetails.email}
                      </CardTitle>
                      <CardDescription>
                        Programme: {clientDetails.programme_name || 'Non assigné'} 
                        {clientDetails.current_week && ` - Semaine ${clientDetails.current_week}`}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
                    <p className="text-2xl font-bold">{Math.round(clientDetails.completion_rate)}%</p>
                  </div>
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Séances terminées</p>
                    <p className="text-2xl font-bold">{clientDetails.completed_sessions}</p>
                  </div>
                  <Target className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Série actuelle</p>
                    <p className="text-2xl font-bold">{clientDetails.current_streak}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total séances</p>
                    <p className="text-2xl font-bold">{clientDetails.total_sessions}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="sessions">Séances</TabsTrigger>
              <TabsTrigger value="wellness">Bien-être</TabsTrigger>
              <TabsTrigger value="progress">Progression</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{clientDetails.email}</span>
                    </div>
                    {clientDetails.profile?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{clientDetails.profile.phone}</span>
                      </div>
                    )}
                    {clientDetails.profile?.date_of_birth && (
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {format(new Date(clientDetails.profile.date_of_birth), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    )}
                    {clientDetails.profile?.height && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taille:</span>
                        <span>{clientDetails.profile.height} cm</span>
                      </div>
                    )}
                    {clientDetails.profile?.weight && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Poids:</span>
                        <span>{clientDetails.profile.weight} kg</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Next Session */}
                <Card>
                  <CardHeader>
                    <CardTitle>Prochaine séance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {clientDetails.next_session_date ? (
                      <div className="text-center py-6">
                        <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
                        <p className="font-semibold text-lg">
                          {format(new Date(clientDetails.next_session_date), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        <p className="text-muted-foreground">
                          {format(new Date(clientDetails.next_session_date), 'HH:mm', { locale: fr })}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucune séance programmée</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des séances</CardTitle>
                  <CardDescription>
                    Les 20 dernières séances du client
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sessionHistory.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucune séance trouvée</p>
                      </div>
                    ) : (
                      sessionHistory.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex-1">
                            <h4 className="font-semibold">{session.seance_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(session.seance_date), 'dd MMMM yyyy', { locale: fr })}
                            </p>
                            {session.completed_at && (
                              <p className="text-xs text-muted-foreground">
                                Terminée le {format(new Date(session.completed_at), 'dd/MM à HH:mm', { locale: fr })}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {session.duration_minutes && (
                              <Badge variant="outline">
                                {session.duration_minutes} min
                              </Badge>
                            )}
                            {getStatusBadge(session.status)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wellness" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Données bien-être</CardTitle>
                  <CardDescription>
                    Suivi du sommeil, fatigue, stress et courbatures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {wellnessData.length === 0 ? (
                      <div className="text-center py-8">
                        <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Aucune donnée bien-être disponible</p>
                      </div>
                    ) : (
                      wellnessData.slice(0, 10).map((entry, index) => (
                        <div key={index} className="p-4 rounded-lg border">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold">
                              {format(new Date(entry.date), 'dd MMMM yyyy', { locale: fr })}
                            </h4>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Sommeil:</span>
                              <span className={`ml-2 font-medium ${getWellnessColor(entry.sleep_hours)}`}>
                                {entry.sleep_hours}h
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Fatigue:</span>
                              <span className={`ml-2 font-medium ${getWellnessColor(entry.fatigue_level, true)}`}>
                                {entry.fatigue_level}/10
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Stress:</span>
                              <span className={`ml-2 font-medium ${getWellnessColor(entry.stress_level, true)}`}>
                                {entry.stress_level}/10
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Courbatures:</span>
                              <span className={`ml-2 font-medium ${getWellnessColor(entry.soreness_level, true)}`}>
                                {entry.soreness_level}/10
                              </span>
                            </div>
                          </div>
                          {entry.notes && (
                            <div className="mt-3 text-sm">
                              <span className="text-muted-foreground">Notes:</span>
                              <p className="mt-1 text-muted-foreground">{entry.notes}</p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution de la progression</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="completion_rate" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Taux de réussite (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Séances par période</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="sessions" 
                          fill="hsl(var(--primary))" 
                          name="Séances"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};