import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Target, Plus, Calendar, Trophy, TrendingUp, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'strength' | 'endurance' | 'weight' | 'general';
  targetValue: number;
  currentValue: number;
  unit: string;
  targetDate: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

const goalCategories = {
  strength: { label: 'Force', icon: Trophy, color: 'text-amber-600' },
  endurance: { label: 'Endurance', icon: TrendingUp, color: 'text-blue-600' },
  weight: { label: 'Poids', icon: Target, color: 'text-green-600' },
  general: { label: 'Général', icon: CheckCircle, color: 'text-purple-600' },
};

export const Goals = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'general' as Goal['category'],
    targetValue: 0,
    currentValue: 0,
    unit: '',
    targetDate: '',
  });

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les objectifs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const goalData = {
        ...formData,
        user_id: user?.id,
        target_value: formData.targetValue,
        current_value: formData.currentValue,
        target_date: formData.targetDate,
      };

      if (editingGoal) {
        const { error } = await supabase
          .from('user_goals')
          .update(goalData)
          .eq('id', editingGoal.id);

        if (error) throw error;
        
        toast({
          title: 'Objectif modifié',
          description: 'Votre objectif a été mis à jour avec succès',
        });
      } else {
        const { error } = await supabase
          .from('user_goals')
          .insert([goalData]);

        if (error) throw error;
        
        toast({
          title: 'Objectif créé',
          description: 'Votre nouvel objectif a été créé avec succès',
        });
      }

      setDialogOpen(false);
      setEditingGoal(null);
      setFormData({
        title: '',
        description: '',
        category: 'general',
        targetValue: 0,
        currentValue: 0,
        unit: '',
        targetDate: '',
      });
      fetchGoals();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder l\'objectif',
        variant: 'destructive',
      });
    }
  };

  const updateGoalProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;
      
      setGoals(goals.map(goal => 
        goal.id === goalId ? { ...goal, currentValue: newValue } : goal
      ));
      
      toast({
        title: 'Progression mise à jour',
        description: 'Votre progression a été enregistrée',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour la progression',
        variant: 'destructive',
      });
    }
  };

  const deleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;
      
      setGoals(goals.filter(goal => goal.id !== goalId));
      
      toast({
        title: 'Objectif supprimé',
        description: 'L\'objectif a été supprimé avec succès',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer l\'objectif',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      targetDate: format(new Date(goal.targetDate), 'yyyy-MM-dd'),
    });
    setDialogOpen(true);
  };

  const getProgress = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  const getStatusBadge = (goal: Goal) => {
    if (goal.status === 'completed' || goal.currentValue >= goal.targetValue) {
      return <Badge className="bg-success/20 text-success">Atteint</Badge>;
    }
    
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    
    if (targetDate < today) {
      return <Badge variant="destructive">Expiré</Badge>;
    }
    
    return <Badge variant="outline">En cours</Badge>;
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
          <Card className="shadow-elegant border-0 bg-background/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Target className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Mes Objectifs</CardTitle>
                    <CardDescription>
                      Définissez et suivez vos objectifs de fitness
                    </CardDescription>
                  </div>
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvel objectif
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingGoal ? 'Modifier l\'objectif' : 'Créer un objectif'}
                      </DialogTitle>
                      <DialogDescription>
                        Définissez un objectif mesurable pour votre progression
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Titre</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Soulever 100kg au développé couché"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Décrivez votre objectif..."
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Catégorie</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value: Goal['category']) => 
                              setFormData({ ...formData, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(goalCategories).map(([key, { label }]) => (
                                <SelectItem key={key} value={key}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="unit">Unité</Label>
                          <Input
                            id="unit"
                            value={formData.unit}
                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            placeholder="kg, km, min..."
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currentValue">Valeur actuelle</Label>
                          <Input
                            id="currentValue"
                            type="number"
                            value={formData.currentValue}
                            onChange={(e) => setFormData({ ...formData, currentValue: Number(e.target.value) })}
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="targetValue">Objectif</Label>
                          <Input
                            id="targetValue"
                            type="number"
                            value={formData.targetValue}
                            onChange={(e) => setFormData({ ...formData, targetValue: Number(e.target.value) })}
                            min="0"
                            step="0.1"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="targetDate">Date limite</Label>
                        <Input
                          id="targetDate"
                          type="date"
                          value={formData.targetDate}
                          onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          {editingGoal ? 'Modifier' : 'Créer'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setDialogOpen(false);
                            setEditingGoal(null);
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
          </Card>

          {/* Goals List */}
          <div className="space-y-6">
            {goals.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Vous n'avez pas encore défini d'objectifs
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Créez votre premier objectif pour commencer à suivre votre progression
                  </p>
                </CardContent>
              </Card>
            ) : (
              goals.map((goal) => {
                const CategoryIcon = goalCategories[goal.category].icon;
                const progress = getProgress(goal);
                
                return (
                  <Card key={goal.id} className="shadow-medium">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <CategoryIcon className={`h-6 w-6 ${goalCategories[goal.category].color}`} />
                          <div>
                            <h3 className="font-semibold text-lg">{goal.title}</h3>
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(goal)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(goal)}
                          >
                            Modifier
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteGoal(goal.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">
                              Progression: {goal.currentValue} / {goal.targetValue} {goal.unit}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(progress)}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Échéance: {format(new Date(goal.targetDate), 'dd MMMM yyyy', { locale: fr })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={goal.currentValue}
                              onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))}
                              className="w-20 h-8"
                              step="0.1"
                              min="0"
                            />
                            <span>{goal.unit}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};