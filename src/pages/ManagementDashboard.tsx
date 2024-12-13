import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SideNav } from "@/components/SideNav";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { Outlet } from "react-router-dom";
import DashboardContent from "@/components/dashboard/DashboardContent";
import type { ChatbotSettings } from "@/types/chatbot";

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const session = useAuthRedirect();
  const userId = session?.user?.id;

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
          const defaultAnswers = { business: [], creator: [], other: [] };
          
          let parsedAnswers = defaultAnswers;
          if (existingSettings.answers) {
            try {
              const answersObj = typeof existingSettings.answers === 'string' 
                ? JSON.parse(existingSettings.answers) 
                : existingSettings.answers;
                
              parsedAnswers = {
                business: Array.isArray(answersObj.business) ? answersObj.business : [],
                creator: Array.isArray(answersObj.creator) ? answersObj.creator : [],
                other: Array.isArray(answersObj.other) ? answersObj.other : []
              };
            } catch (e) {
              console.error("Error parsing answers:", e);
            }
          }

          return {
            ...existingSettings,
            answers: parsedAnswers,
            buttons: Array.isArray(existingSettings.buttons) 
              ? existingSettings.buttons.map((button: any) => ({
                  id: button.id || crypto.randomUUID(),
                  label: button.label || '',
                  url: button.url || ''
                }))
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
        return {
          ...newSettings,
          answers: {
            business: [],
            creator: [],
            other: []
          },
          buttons: []
        } as ChatbotSettings;
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
    enabled: !!userId,
    retry: 2,
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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

  if (!userId) {
    return null;
  }

  const isDashboardRoot = location.pathname === "/dashboard";

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-gradient-to-b from-[#fcf5eb] to-white">
        <SideNav onSignOut={handleLogout} />
        <main className="flex-1 overflow-auto">
          {isDashboardRoot ? (
            <DashboardContent 
              userId={userId}
              settings={settings}
              isLoading={isLoading}
            />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ManagementDashboard;