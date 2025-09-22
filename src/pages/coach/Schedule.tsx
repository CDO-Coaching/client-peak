import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, Plus, ArrowLeft, Filter } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ScheduledSession {
  id: string;
  seance_name: string;
  client_email: string;
  client_name: string | null;
  seance_date: string;
  status: 'scheduled' | 'started' | 'completed' | 'cancelled';
  programme_name: string;
  semaine_number: number;
}

const statusConfig = {
  scheduled: { label: 'Programmée', className: 'bg-blue-100 text-blue-800' },
  started: { label: 'En cours', className: 'bg-yellow-100 text-yellow-800' },
  completed: { label: 'Terminée', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Annulée', className: 'bg-red-100 text-red-800' },
};

export const Schedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    if (user) {
      fetchSchedule();
    }
  }, [user, currentWeek]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coach_schedule_view')
        .select('*')
        .eq('coach_id', user?.id)
        .gte('seance_date', weekStart.toISOString())
        .lte('seance_date', weekEnd.toISOString())
        .order('seance_date');

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger le planning',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getSessionsForDay = (day: Date) => {
    return sessions.filter(session => 
      isSameDay(new Date(session.seance_date), day) &&
      (filterStatus === 'all' || session.status === filterStatus)
    );
  };

  const goToPreviousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
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
        <div className="max-w-7xl mx-auto">
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
                    <CalendarIcon className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">Planning des Séances</CardTitle>
                      <CardDescription>
                        Gérez et suivez le planning de vos clients
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <Button className="rounded-xl">
                  <Plus className="h-4 w-4 mr-2" />
                  Programmer une séance
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Week Navigation */}
          <Card className="shadow-medium mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPreviousWeek}
                      className="rounded-xl"
                    >
                      ←
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToCurrentWeek}
                      className="rounded-xl"
                    >
                      Aujourd'hui
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNextWeek}
                      className="rounded-xl"
                    >
                      →
                    </Button>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg">
                      {format(weekStart, 'dd MMM', { locale: fr })} - {format(weekEnd, 'dd MMM yyyy', { locale: fr })}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="all">Toutes</option>
                    <option value="scheduled">Programmées</option>
                    <option value="started">En cours</option>
                    <option value="completed">Terminées</option>
                    <option value="cancelled">Annulées</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const daySessions = getSessionsForDay(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <Card key={day.toISOString()} className={`shadow-medium ${isToday ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="text-center">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {format(day, 'EEEE', { locale: fr })}
                      </CardTitle>
                      <p className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                        {format(day, 'd')}
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {daySessions.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Aucune séance</p>
                      </div>
                    ) : (
                      daySessions.map((session) => (
                        <div 
                          key={session.id} 
                          className="p-3 rounded-lg border hover:bg-accent transition-colors cursor-pointer"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{session.seance_name}</p>
                              <Badge 
                                variant="outline" 
                                className={statusConfig[session.status].className}
                              >
                                {statusConfig[session.status].label}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{session.client_name || session.client_email}</span>
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(session.seance_date), 'HH:mm')}</span>
                              </div>
                              
                              <div className="text-xs">
                                {session.programme_name} - S{session.semaine_number}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="shadow-medium mt-8">
            <CardHeader>
              <CardTitle>Résumé de la semaine</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {sessions.filter(s => filterStatus === 'all' || s.status === filterStatus).length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {filterStatus === 'all' ? 'Total séances' : statusConfig[filterStatus as keyof typeof statusConfig]?.label}
                  </p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-success">
                    {sessions.filter(s => s.status === 'completed').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Terminées</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-warning">
                    {sessions.filter(s => s.status === 'started').length}
                  </p>
                  <p className="text-sm text-muted-foreground">En cours</p>
                </div>
                
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {sessions.filter(s => s.status === 'scheduled').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Programmées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};