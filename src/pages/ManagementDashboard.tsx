import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ChatbotSettingsForm from "@/components/dashboard/ChatbotSettingsForm";
import PhonePreview from "@/components/dashboard/PhonePreview";

type ButtonConfig = {
  id: string;
  label: string;
  url: string;
};

type ChatbotSettings = {
  bot_name: string;
  greeting_message: string;
  training_data: string;
  buttons: ButtonConfig[];
};

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["chatbot-settings"],
    queryFn: async () => {
      console.log("Fetching chatbot settings...");
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error fetching user:", userError);
        throw userError;
      }
      if (!user) {
        console.error("No user found");
        throw new Error("Not authenticated");
      }

      console.log("User found:", user.id);

      const { data: existingSettings, error: fetchError } = await supabase
        .from("chatbot_settings")
        .select()
        .eq("profile_id", user.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching settings:", fetchError);
        throw fetchError;
      }

      if (existingSettings) {
        console.log("Existing settings found:", existingSettings);
        return existingSettings;
      }

      console.log("No existing settings found, creating default settings...");

      const { data: newSettings, error: insertError } = await supabase
        .from("chatbot_settings")
        .insert({
          profile_id: user.id,
          bot_name: "My ChatBot",
          greeting_message: "Hello! How can I help you today?",
          training_data: "",
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating settings:", insertError);
        throw insertError;
      }

      console.log("Default settings created:", newSettings);
      return newSettings;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (values: ChatbotSettings) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // First, update Supabase settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("chatbot_settings")
        .update(values)
        .eq("profile_id", user.id)
        .select()
        .single();

      if (settingsError) throw settingsError;

      // Then, update or create OpenAI Assistant
      const assistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: JSON.stringify({
          ...values,
          assistant_id: settings?.assistant_id
        })
      });

      if (assistantResponse.error) {
        throw new Error(assistantResponse.error.message);
      }

      // Update assistant_id in database if it's a new assistant
      if (!settings?.assistant_id) {
        await supabase
          .from("chatbot_settings")
          .update({ assistant_id: assistantResponse.data.assistant.id })
          .eq("profile_id", user.id);
      }

      return { settings: settingsData, assistant: assistantResponse.data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });
      toast({
        title: settings?.assistant_id ? "Settings updated" : "Chatbot created",
        description: settings?.assistant_id 
          ? "Your chatbot settings have been updated successfully."
          : "Your chatbot has been created successfully.",
      });
      console.log("OpenAI Assistant operation successful:", result.assistant);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  const defaultValues = {
    bot_name: settings?.bot_name || "",
    greeting_message: settings?.greeting_message || "",
    training_data: settings?.training_data || "",
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Chatbot Settings</h1>
            <ChatbotSettingsForm
              defaultValues={defaultValues}
              onSubmit={updateSettings.mutate}
              isSubmitting={updateSettings.isPending}
              hasExistingBot={!!settings?.assistant_id}
            />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">Preview</h2>
            <PhonePreview
              botName={settings?.bot_name}
              greetingMessage={settings?.greeting_message}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;
