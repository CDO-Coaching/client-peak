import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Trophy, Calendar, Activity, Target, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Statistics {
  totalSessions: number;
  completedSessions: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  averageSessionDuration: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
}

interface ProgressData {
  date: string;
  sessions: number;
  duration: number;
  exercises: number;
}

interface ExerciseStats {
  exerciseName: string;
  totalSets: number;
  totalReps: number;
  frequency: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const Statistics = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [exerciseStats, setExerciseStats] = useState<ExerciseStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStatistics();
    }
  }, [user]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch general statistics
      const { data: statsData, error: statsError } = await supabase
        .from('user_statistics_view')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      // Fetch progress data for charts
      const { data: progressData, error: progressError } = await supabase
        .from('progress_chart_view')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: true })
        .limit(30);

      if (progressError) throw progressError;

      // Fetch exercise statistics
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('exercise_statistics_view')
        .select('*')
        .eq('user_id', user?.id)
        .order('frequency', { ascending: false })
        .limit(10);

      if (exerciseError) throw exerciseError;

      setStats(statsData || {
        totalSessions: 0,
        completedSessions: 0,
        totalExercises: 0,
        totalSets: 0,
        totalReps: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        currentStreak: 0,
        longestStreak: 0,
      });
      setProgressData(progressData || []);
      setExerciseStats(exerciseData || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les statistiques',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

  const pieData = exerciseStats.slice(0, 5).map((exercise, index) => ({
    name: exercise.exerciseName,
    value: exercise.frequency,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-elegant border-0 bg-background/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Statistiques & Progression</CardTitle>
                  <CardDescription>
                    Analysez vos performances et suivez votre évolution
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Séances totales</p>
                    <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-success">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Taux de réussite</p>
                    <p className="text-2xl font-bold">{Math.round(stats?.completionRate || 0)}%</p>
                  </div>
                  <Trophy className="h-8 w-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Série actuelle</p>
                    <p className="text-2xl font-bold">{stats?.currentStreak || 0}</p>
                  </div>
                  <Zap className="h-8 w-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total répétitions</p>
                    <p className="text-2xl font-bold">{stats?.totalReps?.toLocaleString() || 0}</p>
                  </div>
                  <Target className="h-8 w-8 text-accent" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="progress" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="progress">Progression</TabsTrigger>
              <TabsTrigger value="exercises">Exercices</TabsTrigger>
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            </TabsList>

            <TabsContent value="progress" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution des séances (30 derniers jours)</CardTitle>
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
                          dataKey="sessions" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={2}
                          name="Séances"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Durée moyenne des séances</CardTitle>
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
                          dataKey="duration" 
                          fill="hsl(var(--primary))" 
                          name="Durée (min)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Exercices les plus pratiqués</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top exercices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {exerciseStats.slice(0, 8).map((exercise, index) => (
                        <div key={exercise.exerciseName} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="w-8 h-8 p-0 flex items-center justify-center">
                              {index + 1}
                            </Badge>
                            <div>
                              <p className="font-medium">{exercise.exerciseName}</p>
                              <p className="text-sm text-muted-foreground">
                                {exercise.totalSets} séries • {exercise.totalReps} reps
                              </p>
                            </div>
                          </div>
                          <Badge>{exercise.frequency} fois</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé de l'activité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">Exercices différents pratiqués</span>
                      <Badge variant="secondary">{stats?.totalExercises || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">Total des séries</span>
                      <Badge variant="secondary">{stats?.totalSets || 0}</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">Durée moyenne par séance</span>
                      <Badge variant="secondary">{Math.round(stats?.averageSessionDuration || 0)} min</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                      <span className="font-medium">Record de série consécutive</span>
                      <Badge variant="secondary">{stats?.longestStreak || 0} jours</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Progression mensuelle</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={progressData.slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar 
                            dataKey="exercises" 
                            fill="hsl(var(--accent))" 
                            name="Exercices"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};