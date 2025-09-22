import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Navigation } from '@/components/layout/Navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Heart, Moon, Zap, AlertTriangle, MessageCircle } from 'lucide-react';

export const WellnessForm = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [sleep, setSleep] = useState([7]);
  const [fatigue, setFatigue] = useState([5]);
  const [stress, setStress] = useState([5]);
  const [soreness, setSoreness] = useState([3]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('wellness_logs')
        .insert({
          user_id: user.id,
          sleep_hours: sleep[0],
          fatigue_level: fatigue[0],
          stress_level: stress[0],
          soreness_level: soreness[0],
          notes,
          logged_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: 'Données enregistrées',
        description: 'Vos données de bien-être ont été enregistrées avec succès.',
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

  const getScaleColor = (value: number, reverse: boolean = false) => {
    if (reverse) {
      if (value <= 3) return 'text-success';
      if (value <= 6) return 'text-warning';
      return 'text-destructive';
    } else {
      if (value <= 3) return 'text-destructive';
      if (value <= 6) return 'text-warning';
      return 'text-success';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary">
      <Navigation />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-medium rounded-2xl">
          <CardHeader className="bg-gradient-to-r from-success to-success/80 text-success-foreground rounded-t-2xl">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Heart className="h-6 w-6" />
              Suivi Bien-être
            </CardTitle>
            <CardDescription className="text-success-foreground/80">
              Enregistrez votre état de forme du jour
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Sommeil */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Moon className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Heures de sommeil</Label>
                </div>
                <div className="px-3">
                  <Slider
                    value={sleep}
                    onValueChange={setSleep}
                    max={12}
                    min={0}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>0h</span>
                    <span className="font-medium text-primary">{sleep[0]}h</span>
                    <span>12h</span>
                  </div>
                </div>
              </div>

              {/* Niveau de fatigue */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Niveau de fatigue</Label>
                </div>
                <div className="px-3">
                  <Slider
                    value={fatigue}
                    onValueChange={setFatigue}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>1 (Très reposé)</span>
                    <span className={`font-medium ${getScaleColor(fatigue[0], true)}`}>{fatigue[0]}/10</span>
                    <span>10 (Épuisé)</span>
                  </div>
                </div>
              </div>

              {/* Niveau de stress */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Niveau de stress</Label>
                </div>
                <div className="px-3">
                  <Slider
                    value={stress}
                    onValueChange={setStress}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>1 (Très calme)</span>
                    <span className={`font-medium ${getScaleColor(stress[0], true)}`}>{stress[0]}/10</span>
                    <span>10 (Très stressé)</span>
                  </div>
                </div>
              </div>

              {/* Courbatures */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Courbatures</Label>
                </div>
                <div className="px-3">
                  <Slider
                    value={soreness}
                    onValueChange={setSoreness}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-2">
                    <span>1 (Aucune)</span>
                    <span className={`font-medium ${getScaleColor(soreness[0], true)}`}>{soreness[0]}/10</span>
                    <span>10 (Très douloureuses)</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <Label className="text-lg font-medium">Notes personnelles</Label>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Comment vous sentez-vous aujourd'hui ? Y a-t-il quelque chose de particulier à signaler ?"
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
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-success to-success/90 rounded-xl"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Conseils */}
        <Card className="mt-6 shadow-soft rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg text-primary">💡 Conseils</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p><strong>Sommeil:</strong> 7-9h sont recommandées pour une récupération optimale</p>
            <p><strong>Fatigue:</strong> Un niveau élevé peut indiquer un besoin de récupération</p>
            <p><strong>Stress:</strong> Des techniques de relaxation peuvent aider à le réduire</p>
            <p><strong>Courbatures:</strong> Normales après l'entraînement, mais attention si persistantes</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};