import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Session } from '@supabase/supabase-js';
import { Bot, MessageSquare, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for email confirmation success
    const params = new URLSearchParams(window.location.search);
    const confirmationSuccess = location.hash.includes('#access_token') || params.get('confirmed') === 'true';
    
    if (confirmationSuccess) {
      console.log("Email confirmation successful");
      toast({
        title: "Email Confirmed",
        description: "Your email has been confirmed successfully. Redirecting to dashboard...",
      });
      // Short delay to ensure the toast is shown before redirect
      setTimeout(() => navigate('/dashboard'), 1500);
    }

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
      } else if (_event === 'PASSWORD_RECOVERY') {
        console.log("Password recovery email sent");
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for the password reset link",
        });
      } else if (_event === 'USER_UPDATED') {
        console.log("User updated successfully");
        toast({
          title: "Success",
          description: "Your password has been updated successfully",
        });
      }
    });

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, [navigate, toast, location]);

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
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8 text-left"
          >
            <h1 className="text-4xl font-bold text-[#075e54]">
              Welcome to Menyapa
            </h1>
            <p className="text-lg text-gray-600">
              Join thousands of businesses leveraging AI to enhance their customer experience
            </p>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary/10"
              >
                <Bot className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">AI-Powered Assistant</h3>
                  <p className="text-sm text-gray-600">24/7 customer support with intelligent responses</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary/10"
              >
                <MessageSquare className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Smart Conversations</h3>
                  <p className="text-sm text-gray-600">Natural language processing for better understanding</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start gap-3 p-4 rounded-lg bg-white/50 backdrop-blur-sm border border-primary/10"
              >
                <Zap className="w-6 h-6 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-800">Instant Setup</h3>
                  <p className="text-sm text-gray-600">Get started in minutes with our easy setup process</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right side - Auth form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-secondary/5 rounded-full blur-xl" />
            
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-primary/10">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-[#075e54] mb-2">MENYAPA</h2>
                <p className="text-sm text-gray-600">Sign in to your account or create a new one</p>
              </div>
              
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
                  className: {
                    container: 'auth-container',
                    button: 'auth-button',
                    input: 'auth-input',
                  },
                }}
                theme="light"
                providers={[]}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Index;