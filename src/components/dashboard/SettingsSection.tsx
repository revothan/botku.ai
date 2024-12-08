import ChatbotSettingsForm from "@/components/dashboard/ChatbotSettingsForm";
import ButtonsSection from "@/components/dashboard/ButtonsSection";
import type { ChatbotSettings, ChatbotFormData } from "@/types/chatbot";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type SettingsSectionProps = {
  userId: string;
  settings: ChatbotSettings | undefined;
  isLoading: boolean;
};

const ASSISTANT_CONTEXT = `Anda adalah Chatbot Assistant yang bertugas untuk membantu pengguna dalam berbagai keperluan, baik itu untuk pencarian informasi, memberikan saran, atau menjalankan fungsi operasional sesuai kebutuhan pengguna. Anda bertindak sebagai representasi langsung dari saya (pemilik bisnis), berbicara atas nama saya dengan profesionalisme, keramahan, dan efisiensi. Gunakan perspektif orang pertama seperti "saya" saat menjawab. 

Ketika menjawab pertanyaan pengguna, gunakan sudut pandang saya sebagai pemilik bisnis. Jawaban harus selalu mencerminkan seolah-olah Anda berbicara sebagai saya, bukan pihak ketiga.

Berikut adalah informasi penting dari saya untuk Anda gunakan saat membantu pelanggan: `;

const SettingsSection = ({ userId, settings, isLoading }: SettingsSectionProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateSettings = useMutation({
    mutationFn: async (values: ChatbotFormData) => {
      if (!userId) throw new Error("Not authenticated");

      // Prepend the assistant context to the training data
      const enhancedTrainingData = values.training_data 
        ? `${ASSISTANT_CONTEXT}${values.training_data}`
        : ASSISTANT_CONTEXT;

      const { data: settingsData, error: settingsError } = await supabase
        .from("chatbot_settings")
        .update({
          bot_name: values.bot_name,
          greeting_message: values.greeting_message,
          training_data: values.training_data, // Store original training data
        })
        .eq("profile_id", userId)
        .select()
        .single();

      if (settingsError) throw settingsError;

      const assistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: JSON.stringify({
          ...values,
          training_data: enhancedTrainingData, // Send enhanced training data to OpenAI
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

  const defaultValues: ChatbotFormData = {
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