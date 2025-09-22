import { useState, useEffect } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, Search, Mail, Calendar, Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';

interface Client {
  id: string;
  email: string;
  profile: {
    full_name: string | null;
    phone: string | null;
  } | null;
  programme_name: string | null;
  current_week: number | null;
  completion_rate: number;
  total_sessions: number;
  completed_sessions: number;
  last_session_date: string | null;
  status: 'active' | 'inactive' | 'paused';
}

interface Programme {
  id: string;
  name: string;
  description: string | null;
  duration_weeks: number;
}

export const ClientManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [newClientForm, setNewClientForm] = useState({
    email: '',
    fullName: '',
    phone: '',
    programmeId: '',
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('coach_clients_view')
        .select('*')
        .eq('coach_id', user?.id)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      // Fetch programmes
      const { data: programmesData, error: programmesError } = await supabase
        .from('programmes')
        .select('*')
        .eq('coach_id', user?.id)
        .order('name');

      if (programmesError) throw programmesError;

      setClients(clientsData || []);
      setProgrammes(programmesData || []);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // First, create or invite the user
      const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
        newClientForm.email,
        {
          data: {
            full_name: newClientForm.fullName,
            phone: newClientForm.phone,
            role: 'client'
          }
        }
      );

      if (authError) throw authError;

      // Then assign to coach and programme
      if (authData.user && newClientForm.programmeId) {
        const { error: assignError } = await supabase
          .from('user_programmes')
          .insert({
            user_id: authData.user.id,
            programme_id: newClientForm.programmeId,
            assigned_by: user?.id,
            start_date: new Date().toISOString(),
          });

        if (assignError) throw assignError;
      }

      toast({
        title: 'Client ajouté',
        description: 'Le client a été invité et assigné au programme',
      });

      setDialogOpen(false);
      setNewClientForm({ email: '', fullName: '', phone: '', programmeId: '' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'ajouter le client',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success/20 text-success">Actif</Badge>;
      case 'paused':
        return <Badge variant="secondary">En pause</Badge>;
      default:
        return <Badge variant="outline">Inactif</Badge>;
    }
  };

  const filteredClients = clients.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.programme_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    <Users className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="text-2xl">Gestion des Clients</CardTitle>
                      <CardDescription>
                        Gérez vos clients et leurs programmes d'entraînement
                      </CardDescription>
                    </div>
                  </div>
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-xl">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un client
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Ajouter un nouveau client</DialogTitle>
                      <DialogDescription>
                        Invitez un nouveau client et assignez-lui un programme
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddClient} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClientForm.email}
                          onChange={(e) => setNewClientForm({ ...newClientForm, email: e.target.value })}
                          placeholder="client@example.com"
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nom complet</Label>
                        <Input
                          id="fullName"
                          value={newClientForm.fullName}
                          onChange={(e) => setNewClientForm({ ...newClientForm, fullName: e.target.value })}
                          placeholder="Jean Dupont"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={newClientForm.phone}
                          onChange={(e) => setNewClientForm({ ...newClientForm, phone: e.target.value })}
                          placeholder="06 12 34 56 78"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="programme">Programme</Label>
                        <Select
                          value={newClientForm.programmeId}
                          onValueChange={(value) => setNewClientForm({ ...newClientForm, programmeId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un programme" />
                          </SelectTrigger>
                          <SelectContent>
                            {programmes.map((programme) => (
                              <SelectItem key={programme.id} value={programme.id}>
                                {programme.name} ({programme.duration_weeks} semaines)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="flex-1">
                          Ajouter
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setDialogOpen(false)}
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

          {/* Search and Filters */}
          <Card className="shadow-medium mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 rounded-xl"
                  />
                </div>
                <Badge variant="outline">{filteredClients.length} client(s)</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Clients List */}
          <div className="space-y-4">
            {filteredClients.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? 'Aucun client trouvé' : 'Vous n\'avez pas encore de clients'}
                  </p>
                  {!searchTerm && (
                    <p className="text-sm text-muted-foreground">
                      Commencez par ajouter votre premier client
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredClients.map((client) => (
                <Card key={client.id} className="shadow-medium hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {client.profile?.full_name || client.email}
                          </h3>
                          {getStatusBadge(client.status)}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{client.email}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            <span>
                              {client.programme_name || 'Aucun programme'} 
                              {client.current_week && ` - S${client.current_week}`}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>{Math.round(client.completion_rate)}% de réussite</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-sm">
                          <div>
                            <span className="font-medium text-primary">{client.completed_sessions}</span>
                            <span className="text-muted-foreground">/{client.total_sessions} séances</span>
                          </div>
                          {client.last_session_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Dernière: {new Date(client.last_session_date).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link to={`/coach/client/${client.id}`}>
                          <Button variant="outline" size="sm" className="rounded-xl">
                            Voir le profil
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};