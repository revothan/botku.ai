import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { SessionContextProvider, useSession } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import UserPage from "./pages/UserPage";
import ManagementDashboard from "./pages/ManagementDashboard";
import ChatbotPage from "./pages/ChatbotPage";
import Pricing from "./pages/Pricing";
import ProductManagement from "./pages/ProductManagement";
import ChatMonitoring from "./pages/ChatMonitoring";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const session = useSession();
    const { toast } = useToast();
    const navigate = useNavigate();
    
    useEffect(() => {
      let mounted = true;
      
      const checkSession = async () => {
        try {
          const { data: { session: currentSession }, error } = await supabase.auth.getSession();
          
          if (!mounted) return;
          
          if (error) {
            console.error("Session error:", error);
            await supabase.auth.signOut();
            toast({
              title: "Session Error",
              description: "Please log in again to continue",
              variant: "destructive",
            });
            navigate('/login');
            return;
          }
          
          if (!currentSession) {
            console.log("No active session found");
            navigate('/login');
            return;
          }

          // Check if the session is about to expire (within 5 minutes)
          const expiresAt = currentSession.expires_at;
          const now = Math.floor(Date.now() / 1000);
          const fiveMinutes = 5 * 60;
          
          if (expiresAt && (expiresAt - now) < fiveMinutes) {
            console.log("Session about to expire, attempting refresh");
            const { data: { session: refreshedSession }, error: refreshError } = 
              await supabase.auth.refreshSession();
            
            if (mounted && (refreshError || !refreshedSession)) {
              console.error("Failed to refresh session:", refreshError);
              await supabase.auth.signOut();
              toast({
                title: "Session Expired",
                description: "Please log in again to continue",
                variant: "destructive",
              });
              navigate('/login');
            }
          }
        } catch (error: any) {
          if (!mounted) return;
          
          console.error("Auth check error:", error);
          await supabase.auth.signOut();
          toast({
            title: "Authentication Error",
            description: error.message || "Please try logging in again",
            variant: "destructive",
          });
          navigate('/login');
        }
      };

      // Initial session check
      checkSession();

      // Set up periodic session checks
      const intervalId = setInterval(checkSession, 60000);

      // Set up auth state change listener
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event);
        
        if (event === 'TOKEN_REFRESHED') {
          console.log("Token refreshed successfully");
        } else if (event === 'SIGNED_OUT' || !session) {
          queryClient.clear();
          navigate('/login');
        }
      });

      // Cleanup function
      return () => {
        mounted = false;
        clearInterval(intervalId);
        subscription.unsubscribe();
      };
    }, [toast, navigate]);

    // Only redirect if we're certain there's no session
    if (session === null) {
      return <Navigate to="/login" replace />;
    }
    
    // Show children while we're checking the session
    return <>{children}</>;
  };

  const HomeRoute = () => {
    const session = useSession();
    
    if (session) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return <Landing />;
  };

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <ManagementDashboard />
          </ProtectedRoute>
        }
      >
        <Route path="products" element={<ProductManagement />} />
        <Route path="chats" element={<ChatMonitoring />} />
      </Route>
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/u/:username" element={<UserPage />} />
      <Route path="/:customDomain/*" element={<ChatbotPage />} />
    </Routes>
  );
};

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider 
          supabaseClient={supabase}
          initialSession={null}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </SessionContextProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;