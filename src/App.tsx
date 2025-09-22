import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AuthForm } from "@/components/auth/AuthForm";
import { ClientDashboard } from "@/pages/client/ClientDashboard";
import { MobileClientDashboard } from "@/pages/client/MobileClientDashboard";
import { SessionView } from "@/pages/client/SessionView";
import { FeedbackForm } from "@/pages/client/FeedbackForm";
import { WellnessForm } from "@/pages/client/WellnessForm";
import { History } from "@/pages/client/History";
import { Statistics } from "@/pages/client/Statistics";
import { Goals } from "@/pages/client/Goals";
import { CoachDashboard } from "@/pages/coach/CoachDashboard";
import { ClientProfile } from "@/pages/coach/ClientProfile";
import { ClientManagement } from "@/pages/coach/ClientManagement";
import { Schedule } from "@/pages/coach/Schedule";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedApp = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
      />
    );
  }

  // Pour cette démo, on considère que tous les utilisateurs sont des clients
  // Dans un vrai système, vous auriez un champ role dans votre table users
  const isCoach = user.email?.includes('coach') || user.email?.includes('admin');

  return (
    <Routes>
      {isCoach ? (
        <>
          <Route path="/" element={<Navigate to="/coach" replace />} />
          <Route path="/coach" element={<CoachDashboard />} />
          <Route path="/coach/client/:clientId" element={<ClientProfile />} />
          <Route path="/coach/clients" element={<ClientManagement />} />
          <Route path="/coach/schedule" element={<Schedule />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Navigate to="/client" replace />} />
          <Route path="/client" element={<MobileClientDashboard />} />
          <Route path="/client/session/:sessionId" element={<SessionView />} />
          <Route path="/client/feedback" element={<FeedbackForm />} />
          <Route path="/client/wellness" element={<WellnessForm />} />
          <Route path="/client/history" element={<History />} />
          <Route path="/client/statistics" element={<Statistics />} />
          <Route path="/client/goals" element={<Goals />} />
        </>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthenticatedApp />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
