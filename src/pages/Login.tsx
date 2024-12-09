import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Session } from '@supabase/supabase-js';

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("Initial session check:", { session, error });
      if (error) {
        console.error("Session check error:", error);
        toast({
          title: "Error",
          description: "Failed to check authentication status",
          variant: "destructive",
        });
        return;
      }
      
      if (session) {
        console.log("Valid session found, redirecting to dashboard");
        setSession(session);
        navigate('/dashboard');
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", { event: _event, session });
      
      if (_event === 'SIGNED_IN') {
        console.log("User signed in, redirecting to dashboard");
        setSession(session);
        navigate('/dashboard');
      } else if (_event === 'SIGNED_OUT') {
        console.log("User signed out");
        setSession(null);
      } else if (_event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed successfully");
        setSession(session);
      }
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white">
        <div className="container mx-auto px-4 py-16">
          <nav className="flex justify-between items-center mb-16">
            <h1 className="text-2xl font-bold tracking-tight text-secondary">MENYAPA</h1>
            <div className="space-x-4">
              <Button
                variant="ghost"
                className="text-gray-600 hover:text-gray-900"
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.signOut();
                    if (error) throw error;
                    navigate("/");
                  } catch (error: any) {
                    console.error("Error signing out:", error);
                    toast({
                      title: "Error",
                      description: "Failed to sign out",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Sign Out
              </Button>
            </div>
          </nav>

          <main className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Redirecting to dashboard...
              </span>
            </motion.div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold tracking-tight text-center mb-8 text-secondary">MENYAPA</h1>
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-sm border border-primary/10">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#25d366',
                      brandAccent: '#128c7e',
                    },
                  },
                },
              }}
              theme="light"
              providers={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;