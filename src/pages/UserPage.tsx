import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const UserPage = () => {
  const { username } = useParams();

  const { data: profile, isLoading, error } = useQuery({
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
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="w-24 h-24 rounded-full mx-auto object-cover"
            />
          )}
          <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
          {profile.bio && <p className="text-gray-600">{profile.bio}</p>}
          {profile.custom_domain && (
            <a
              href={`https://${profile.custom_domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {profile.custom_domain}
            </a>
          )}
        </motion.div>

        <div className="space-y-4">
          {profile.links?.map((link: any, index: number) => (
            <motion.a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="block w-full p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 text-center"
            >
              {link.icon && <span className="mr-2">{link.icon}</span>}
              {link.title}
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserPage;