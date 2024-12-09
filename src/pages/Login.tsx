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
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session);
      setSession(session);
      if (session) {
        navigate('/dashboard');
      }
    }).catch(error => {
      console.error("Error checking session:", error);
      toast({
        title: "Error",
        description: "Failed to check authentication status",
        variant: "destructive",
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", session);
      setSession(session);
      if (session) {
        navigate('/dashboard');
      }
    });

    return () => subscription.unsubscribe();
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
                  const { error } = await supabase.auth.signOut();
                  if (error) {
                    console.error("Error signing out:", error);
                    toast({
                      title: "Error",
                      description: "Failed to sign out",
                      variant: "destructive",
                    });
                  }
                  navigate("/");
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