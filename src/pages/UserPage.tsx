import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [customDomain, setCustomDomain] = useState("");

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

        if (data?.custom_domain) {
          setCustomDomain(data.custom_domain);
        }

        return data;
      } catch (err) {
        console.error("Error in query:", err);
        throw err;
      }
    },
  });

  const updateDomainMutation = useMutation({
    mutationFn: async (newDomain: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ custom_domain: newDomain })
        .eq("id", profile?.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", username] });
      toast({
        title: "Domain updated successfully!",
        description: `Your custom domain is now botku.ai/${customDomain}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating domain",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDomainUpdate = () => {
    if (!customDomain) {
      toast({
        title: "Please enter a domain",
        description: "The domain cannot be empty",
        variant: "destructive",
      });
      return;
    }
    updateDomainMutation.mutate(customDomain);
  };

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
          
          <div className="flex flex-col items-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">botku.ai/</span>
              <Input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="yourdomain"
                className="max-w-[200px]"
              />
            </div>
            <Button 
              onClick={handleDomainUpdate}
              disabled={updateDomainMutation.isPending}
            >
              {updateDomainMutation.isPending ? "Updating..." : "Update Domain"}
            </Button>
          </div>

          {profile.custom_domain && (
            <a
              href={`https://botku.ai/${profile.custom_domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block mt-2"
            >
              botku.ai/{profile.custom_domain}
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