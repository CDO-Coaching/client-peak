import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/layout/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Dumbbell, Play, Clock, RotateCcw, FileText } from 'lucide-react';

interface Exercise {
  id: string;
  exercise_name: string;
  muscle_group: string;
  video_url?: string;
  sets: number;
  reps: string;
  tempo?: string;
  rest_time?: string;
  notes?: string;
}

interface SessionData {
  id: string;
  seance_name: string;
  programme_name: string;
  semaine_number: number;
  exercises: Exercise[];
}

export const SessionView = () => {
  const { sessionId } = useParams();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!sessionId || !user) return;

      try {
        // Récupérer les données de la séance
        const { data: sessionInfo, error: sessionError } = await supabase
          .from('seances')
          .select(`
            id,
            nom,
            semaines(
              numero,
              programmes(
                nom,
                user_id
              )
            )
          `)
          .eq('id', sessionId)
          .single();

        if (sessionError) throw sessionError;

        // Vérifier que l'utilisateur a accès à cette séance
        const semaine = sessionInfo.semaines as any;
        const programme = semaine?.programmes as any;
        if (programme?.user_id !== user.id) {
          throw new Error('Accès non autorisé');
        }

        // Récupérer les exercices de la séance
        const { data: exercises, error: exercisesError } = await supabase
          .from('exercices')
          .select(`
            id,
            sets,
            reps,
            tempo,
            rest_time,
            notes,
            exercise_library(
              exercise_name,
              muscle_group,
              video_url
            )
          `)
          .eq('seance_id', sessionId);

        if (exercisesError) throw exercisesError;

        const formattedSession: SessionData = {
          id: sessionInfo.id,
          seance_name: sessionInfo.nom,
          programme_name: programme?.nom || 'Programme',
          semaine_number: semaine?.numero || 1,
          exercises: exercises?.map(ex => {
            const exerciseLib = ex.exercise_library as any;
            return {
              id: ex.id,
              exercise_name: exerciseLib?.exercise_name || 'Exercice',
              muscle_group: exerciseLib?.muscle_group || 'Général',
              video_url: exerciseLib?.video_url,
              sets: ex.sets,
              reps: ex.reps,
              tempo: ex.tempo,
              rest_time: ex.rest_time,
              notes: ex.notes,
            };
          }) || []
        };

        setSessionData(formattedSession);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [sessionId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
        <Navigation />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return <Navigate to="/client" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête de séance */}
        <Card className="mb-6 shadow-medium rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-2xl">
            <CardTitle className="text-2xl">{sessionData.seance_name}</CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {sessionData.programme_name} • Semaine {sessionData.semaine_number}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-primary" />
                <span className="font-medium">{sessionData.exercises.length} exercices</span>
              </div>
              <Button className="bg-gradient-to-r from-success to-success/90 rounded-xl">
                <Play className="h-4 w-4 mr-2" />
                Démarrer l'entraînement
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Liste des exercices */}
        <div className="space-y-4">
          {sessionData.exercises.map((exercise, index) => (
            <Card key={exercise.id} className="shadow-soft rounded-2xl hover:shadow-medium transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-primary mb-1">
                      {index + 1}. {exercise.exercise_name}
                    </CardTitle>
                    <Badge variant="secondary" className="rounded-full">
                      {exercise.muscle_group}
                    </Badge>
                  </div>
                  {exercise.video_url && (
                    <Button variant="outline" size="sm" className="rounded-xl">
                      <Play className="h-4 w-4 mr-1" />
                      Vidéo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-accent/50 rounded-xl p-3 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Séries</div>
                    <div className="font-semibold text-primary">{exercise.sets}</div>
                  </div>
                  <div className="bg-accent/50 rounded-xl p-3 text-center">
                    <div className="text-sm text-muted-foreground mb-1">Répétitions</div>
                    <div className="font-semibold text-primary">{exercise.reps}</div>
                  </div>
                  {exercise.tempo && (
                    <div className="bg-accent/50 rounded-xl p-3 text-center">
                      <div className="text-sm text-muted-foreground mb-1">Tempo</div>
                      <div className="font-semibold text-primary">{exercise.tempo}</div>
                    </div>
                  )}
                  {exercise.rest_time && (
                    <div className="bg-accent/50 rounded-xl p-3 text-center">
                      <div className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        Repos
                      </div>
                      <div className="font-semibold text-primary">{exercise.rest_time}</div>
                    </div>
                  )}
                </div>
                
                {exercise.notes && (
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Notes</span>
                    </div>
                    <p className="text-sm text-foreground">{exercise.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Boutons d'action */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Button variant="outline" className="flex-1 rounded-xl">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reprendre plus tard
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-primary to-primary/90 rounded-xl">
            Terminer la séance
          </Button>
        </div>
      </div>
    </div>
  );
};