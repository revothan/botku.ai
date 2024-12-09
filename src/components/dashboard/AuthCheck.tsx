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
    const checkAuth = async () => {
      try {
        console.log("Checking authentication...");
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
        onAuthChecked(user.id);
        onAuthCheckingChange(false);
      } catch (error) {
        console.error("Error during auth check:", error);
        toast({
          title: "Authentication Error",
          description: "Please try logging in again",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate, toast, onAuthChecked, onAuthCheckingChange]);

  return null;
};

export default AuthCheck;