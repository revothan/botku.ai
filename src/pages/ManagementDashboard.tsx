import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SideNav } from "@/components/SideNav";
import DomainSection from "@/components/dashboard/DomainSection";
import SettingsSection from "@/components/dashboard/SettingsSection";
import PhonePreview from "@/components/dashboard/PhonePreview";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { UserType } from "@/types/chatbot";

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

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
        setUserId(user.id);
        setIsAuthChecking(false);
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
  }, [navigate, toast]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      navigate("/");
    } catch (error: any) {
      console.error("Error during logout:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const { data: settings, isLoading } = useQuery({
    queryKey: ["chatbot-settings", userId],
    queryFn: async () => {
      if (!userId) {
        console.log("No userId available for fetching settings");
        return null;
      }

      console.log("Fetching settings for user:", userId);

      try {
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
            user_type: existingSettings.user_type as UserType | undefined,
            answers: existingSettings.answers ? {
              business: (existingSettings.answers as any)?.business || [],
              creator: (existingSettings.answers as any)?.creator || [],
              other: (existingSettings.answers as any)?.other || []
            } : {
              business: [],
              creator: [],
              other: []
            },
            buttons: Array.isArray(existingSettings.buttons) 
              ? existingSettings.buttons.map((button: any) => ({
                  id: button.id || crypto.randomUUID(),
                  label: button.label || '',
                  url: button.url || ''
                }))
              : []
          };
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
        return {
          ...newSettings,
          answers: {
            business: [],
            creator: [],
            other: []
          },
          buttons: []
        };
      } catch (error) {
        console.error("Error in settings query:", error);
        toast({
          title: "Error",
          description: "Failed to load chatbot settings. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: !!userId && !isAuthChecking,
    retry: 2,
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#fcf5eb] to-white">
        <SideNav onSignOut={handleLogout} />
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
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
                  <div className="lg:sticky lg:top-8">
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
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManagementDashboard;