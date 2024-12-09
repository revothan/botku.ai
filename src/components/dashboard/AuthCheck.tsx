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
        if (isMounted) onAuthCheckingChange(true);
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Auth error:", error);
          throw error;
        }
        
        if (!user) {
          console.log("No user found, redirecting to login");
          navigate("/login");
          return;
        }
        
        console.log("User authenticated:", user.id);
        if (isMounted) onAuthChecked(user.id);
      } catch (error: any) {
        console.error("Error during auth check:", error);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        console.log("Auth check complete");
        if (isMounted) onAuthCheckingChange(false);
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate, toast, onAuthChecked, onAuthCheckingChange]);

  return null;
};

export default AuthCheck;