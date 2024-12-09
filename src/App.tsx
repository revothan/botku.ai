import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const session = useSession();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        console.log("Session check:", { currentSession, error });
        
        if (error) {
          console.error("Session error:", error);
          throw error;
        }
        
        if (!currentSession) {
          console.log("No active session found");
          toast({
            title: "Session expired",
            description: "Please log in again to continue",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Auth check error:", error);
        toast({
          title: "Authentication Error",
          description: error.message || "Please try logging in again",
          variant: "destructive",
        });
      }
    };

    checkSession();
  }, [toast]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  console.log("App rendering, initializing Supabase session");
  
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider 
        supabaseClient={supabase}
        initialSession={null}
      >
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
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
              </Route>
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/u/:username" element={<UserPage />} />
              <Route path="/:customDomain/*" element={<ChatbotPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </SessionContextProvider>
    </QueryClientProvider>
  );
};

export default App;