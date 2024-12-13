import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ChatbotSettings } from "@/types/chatbot";

const transformSettings = (rawSettings: any): ChatbotSettings => {
  return {
    ...rawSettings,
    buttons: Array.isArray(rawSettings.buttons) 
      ? rawSettings.buttons.map((button: any) => ({
          id: button.id || crypto.randomUUID(),
          label: button.label || '',
          url: button.url || ''
        }))
      : [],
    avatar_url: rawSettings.avatar_url || null
  };
};

export const useChatbotSettings = (identifier: string | undefined) => {
  return useQuery({
    queryKey: ["chatbot-settings", identifier],
    queryFn: async () => {
      if (!identifier) {
        console.error("No identifier provided");
        return null;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
          id,
          chatbot_settings (
            id,
            profile_id,
            bot_name,
            greeting_message,
            training_data,
            created_at,
            updated_at,
            assistant_id,
            buttons,
            avatar_url,
            user_type,
            answers
          )
        `)
        .or(`username.eq.${identifier},custom_domain.eq.${identifier}`)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      if (!profile?.chatbot_settings) {
        console.log("No chatbot settings found for profile:", profile);
        return null;
      }

      return transformSettings(profile.chatbot_settings);
    },
    staleTime: 1000 * 60, // Cache for 1 minute
    retry: 1
  });
};