import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", username],
    queryFn: async () => {
      console.log("Fetching profile for username:", username);
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select(`
            *,
            links (*)
          `)
          .eq("username", username)
          .maybeSingle();

        console.log("Query response:", { data, error });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        if (data?.custom_domain) {
          navigate(`/bot/${data.custom_domain}`);
          return null;
        }

        return data;
      } catch (err) {
        console.error("Error in query:", err);
        throw err;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Profile not found</h1>
        <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Redirecting to chatbot...</h1>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
    </div>
  );
};

export default UserPage;