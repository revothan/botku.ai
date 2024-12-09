import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";

export const useAuthRedirect = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        console.log("Auth check result:", { user, error });
        
        if (error) {
          console.error("Auth error:", error);
          throw error;
        }
        
        if (!user) {
          console.log("No user found, redirecting to login");
          navigate("/login");
        }
      } catch (error: any) {
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
  }, [navigate, supabase.auth, toast, session]);

  return session;
};