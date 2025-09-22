import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onToggleMode: () => void;
}

export const AuthForm = ({ mode, onToggleMode }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = mode === 'signin' 
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } else if (mode === 'signup') {
      toast({
        title: 'Inscription réussie',
        description: 'Veuillez vérifier votre email pour confirmer votre compte.',
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            {mode === 'signin' ? 'Connexion' : 'Inscription'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Connectez-vous à votre espace coaching'
              : 'Créez votre compte coaching'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary font-semibold"
              disabled={loading}
            >
              {loading ? 'Chargement...' : (mode === 'signin' ? 'Se connecter' : "S'inscrire")}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button 
              variant="ghost" 
              onClick={onToggleMode}
              className="text-muted-foreground hover:text-primary"
            >
              {mode === 'signin' 
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};