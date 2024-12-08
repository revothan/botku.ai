import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DomainSection from "@/components/dashboard/DomainSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import PhonePreview from "@/components/dashboard/PhonePreview";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { ButtonConfig, ChatbotSettings } from "@/types/chatbot";

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate("/login");
        return;
      }
      setUserId(user.id);
      setIsAuthChecking(false);
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const { data: settings, isLoading } = useQuery({
    queryKey: ["chatbot-settings"],
    queryFn: async () => {
      console.log("Fetching chatbot settings...");
      
      if (!userId) {
        throw new Error("Not authenticated");
      }

      const { data: existingSettings, error: fetchError } = await supabase
        .from("chatbot_settings")
        .select()
        .eq("profile_id", userId)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching settings:", fetchError);
        throw fetchError;
      }

      if (existingSettings) {
        console.log("Existing settings found:", existingSettings);
        return {
          ...existingSettings,
          buttons: Array.isArray(existingSettings.buttons) 
            ? existingSettings.buttons 
            : []
        } as ChatbotSettings;
      }

      console.log("No existing settings found, creating default settings...");

      const { data: newSettings, error: insertError } = await supabase
        .from("chatbot_settings")
        .insert({
          profile_id: userId,
          bot_name: "My ChatBot",
          greeting_message: "Hello! How can I help you today?",
          training_data: "",
          buttons: []
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating settings:", insertError);
        throw insertError;
      }

      console.log("Default settings created:", newSettings);
      return newSettings as ChatbotSettings;
    },
    enabled: !!userId,
  });

  if (isAuthChecking || (isLoading && !settings)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf5eb]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Logout Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Domain Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-secondary">Share Your Chatbot</h2>
          <DomainSection userId={userId} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Settings Column */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <h1 className="text-2xl font-bold mb-6 text-secondary">Chatbot Settings</h1>
              <SettingsSection
                userId={userId}
                settings={settings}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-5">
            <div>
              <h2 className="text-2xl font-bold mb-6 text-secondary">Preview</h2>
              <PhonePreview
                botName={settings?.bot_name || ""}
                greetingMessage={settings?.greeting_message || ""}
                buttons={settings?.buttons || []}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;