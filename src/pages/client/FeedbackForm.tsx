import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/components/layout/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Target, TrendingUp } from 'lucide-react';

interface RecentSession {
  id: string;
  seance_name: string;
  programme_name: string;
  date: string;
}

export const FeedbackForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [rpe, setRpe] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecentSessions = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('seances')
        .select(`
          id,
          nom,
          date,
          semaines(
            programmes(
              nom
            )
          )
        `)
        .order('date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erreur lors du chargement des séances:', error);
      } else {
        const formattedSessions = data?.map(session => ({
          id: session.id,
          seance_name: session.nom,
          programme_name: (session.semaines as any)?.programmes?.nom || 'Programme',
          date: session.date,
        })) || [];
        
        setRecentSessions(formattedSessions);
      }
    };

    fetchRecentSessions();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedSession) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('feedbacks')
        .insert({
          seance_id: selectedSession,
          user_id: user.id,
          exercise_name: exerciseName,
          weight: weight ? parseFloat(weight) : null,
          reps: reps ? parseInt(reps) : null,
          rpe: rpe ? parseInt(rpe) : null,
          comments,
        });

      if (error) throw error;

      toast({
        title: 'Feedback enregistré',
        description: 'Votre retour a été enregistré avec succès.',
      });

      navigate('/client');
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-medium rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <MessageSquare className="h-6 w-6" />
              Feedback de Séance
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              Partagez vos ressentis et performances
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sélection de la séance */}
              <div className="space-y-2">
                <Label htmlFor="session">Séance *</Label>
                <Select value={selectedSession} onValueChange={setSelectedSession} required>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Choisir une séance récente" />
                  </SelectTrigger>
                  <SelectContent>
                    {recentSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.seance_name} - {session.programme_name}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({new Date(session.date).toLocaleDateString('fr-FR')})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nom de l'exercice */}
              <div className="space-y-2">
                <Label htmlFor="exercise">Exercice *</Label>
                <Input
                  id="exercise"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Ex: Développé couché"
                  className="rounded-xl"
                  required
                />
              </div>

              {/* Métriques de performance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Poids (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0"
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reps">Répétitions</Label>
                  <Input
                    id="reps"
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    placeholder="0"
                    className="rounded-xl"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="rpe">RPE (1-10)</Label>
                  <Select value={rpe} onValueChange={setRpe}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="RPE" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num <= 3 ? '(Facile)' : num <= 6 ? '(Modéré)' : num <= 8 ? '(Difficile)' : '(Très dur)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Commentaires */}
              <div className="space-y-2">
                <Label htmlFor="comments">Commentaires</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Comment vous êtes-vous senti pendant cette séance ? Avez-vous des remarques particulières ?"
                  className="rounded-xl min-h-[100px]"
                />
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/client')}
                  className="flex-1 rounded-xl"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || !selectedSession || !exerciseName}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/90 rounded-xl"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer Feedback'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Conseils RPE */}
        <Card className="mt-6 shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-primary" />
              Échelle RPE (Rate of Perceived Exertion)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-primary mb-2">1-3: Facile</div>
                <p className="text-muted-foreground">Effort minimal, vous pourriez continuer longtemps</p>
              </div>
              <div>
                <div className="font-medium text-warning mb-2">4-6: Modéré</div>
                <p className="text-muted-foreground">Effort soutenu mais gérable</p>
              </div>
              <div>
                <div className="font-medium text-destructive mb-2">7-8: Difficile</div>
                <p className="text-muted-foreground">Effort intense, 2-3 reps en réserve</p>
              </div>
              <div>
                <div className="font-medium text-destructive mb-2">9-10: Très dur</div>
                <p className="text-muted-foreground">Effort maximal ou quasi-maximal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};