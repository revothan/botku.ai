import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthCheckProps = {
  onAuthChecked: (userId: string | null) => void;
  onAuthCheckingChange: (isChecking: boolean) => void;
};

const AuthCheck = ({ onAuthChecked, onAuthCheckingChange }: AuthCheckProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        console.log("Starting auth check...");
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth error:", error);
          throw error;
        }
        
        if (!user) {
          console.log("No user found, redirecting to login");
          if (isMounted) {
            onAuthChecked(null);
            navigate("/login");
          }
          return;
        }
        
        console.log("User authenticated:", user.id);
        if (isMounted) {
          onAuthChecked(user.id);
        }
      } catch (error: any) {
        console.error("Error during auth check:", error);
        if (isMounted) {
          toast({
            title: "Authentication Error",
            description: "Please try logging in again",
            variant: "destructive",
          });
          navigate("/login");
        }
      } finally {
        if (isMounted) {
          onAuthCheckingChange(false);
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      if (isMounted) {
        if (session?.user) {
          onAuthChecked(session.user.id);
        } else {
          onAuthChecked(null);
          navigate("/login");
        }
        onAuthCheckingChange(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast, onAuthChecked, onAuthCheckingChange]);

  return null;
};

export default AuthCheck;