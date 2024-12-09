import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { UserType, ChatbotSettings } from "@/types/chatbot";

export const useSettingsQuery = (userId: string | null, isAuthChecking: boolean) => {
  const { toast } = useToast();

  return useQuery({
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
          const userType = existingSettings.user_type as UserType | undefined;
          
          return {
            ...existingSettings,
            user_type: userType,
            answers: existingSettings.answers ? {
              business: ((existingSettings.answers as any)?.business || []) as string[],
              creator: ((existingSettings.answers as any)?.creator || []) as string[],
              other: ((existingSettings.answers as any)?.other || []) as string[]
            } : {
              business: [] as string[],
              creator: [] as string[],
              other: [] as string[]
            },
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
          user_type: undefined as UserType | undefined,
          answers: {
            business: [] as string[],
            creator: [] as string[],
            other: [] as string[]
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
    enabled: !!userId && !isAuthChecking,
    retry: 2,
  });
};