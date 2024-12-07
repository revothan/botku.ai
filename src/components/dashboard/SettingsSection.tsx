import ChatbotSettingsForm from "@/components/dashboard/ChatbotSettingsForm";
import ButtonsSection from "@/components/dashboard/ButtonsSection";
import type { ChatbotSettings } from "@/types/chatbot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type SettingsSectionProps = {
  userId: string;
  settings: ChatbotSettings | undefined;
  isLoading: boolean;
};

const SettingsSection = ({ userId, settings, isLoading }: SettingsSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateSettings = useMutation({
    mutationFn: async (values: Omit<ChatbotSettings, 'buttons'>) => {
      if (!userId) throw new Error("Not authenticated");

      const { data: settingsData, error: settingsError } = await supabase
        .from("chatbot_settings")
        .update({
          bot_name: values.bot_name,
          greeting_message: values.greeting_message,
          training_data: values.training_data,
        })
        .eq("profile_id", userId)
        .select()
        .single();

      if (settingsError) throw settingsError;

      const assistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: JSON.stringify({
          ...values,
          assistant_id: settings?.assistant_id
        })
      });

      if (assistantResponse.error) {
        throw new Error(assistantResponse.error.message);
      }

      if (!settings?.assistant_id) {
        await supabase
          .from("chatbot_settings")
          .update({ assistant_id: assistantResponse.data.assistant.id })
          .eq("profile_id", userId);
      }

      return { 
        settings: settingsData,
        assistant: assistantResponse.data 
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });
      toast({
        title: settings?.assistant_id ? "Settings updated" : "Chatbot created",
        description: settings?.assistant_id 
          ? "Your chatbot settings have been updated successfully."
          : "Your chatbot has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4"></div>
        <div className="h-[200px] bg-muted rounded"></div>
      </div>
    );
  }

  const defaultValues = {
    bot_name: settings?.bot_name || "",
    greeting_message: settings?.greeting_message || "",
    training_data: settings?.training_data || "",
  };

  return (
    <div className="space-y-8">
      <ChatbotSettingsForm
        defaultValues={defaultValues}
        onSubmit={updateSettings.mutate}
        isSubmitting={updateSettings.isPending}
        hasExistingBot={!!settings?.assistant_id}
      />
      <ButtonsSection 
        profileId={userId}
        initialButtons={(settings?.buttons || [])}
      />
    </div>
  );
};

export default SettingsSection;