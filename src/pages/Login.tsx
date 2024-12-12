import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Session } from '@supabase/supabase-js';
import { Button } from "@/components/ui/button";
import { FeaturesSection } from "@/components/auth/FeaturesSection";
import { AuthForm } from "@/components/auth/AuthForm";

const Login = () => {
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
            <div className="space-y-6">
              <span className="px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Redirecting to dashboard...
              </span>
            </div>
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
          {/* On mobile, auth form appears first */}
          <div className="md:order-2 md:col-span-1">
            <AuthForm />
          </div>
          
          {/* Features section appears second on mobile */}
          <div className="md:order-1 md:col-span-1">
            <FeaturesSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;