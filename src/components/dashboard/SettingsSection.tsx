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

      console.log("Starting settings update with values:", values);

      // Format training data based on user type and answers
      let formattedTrainingData = '';
      if (values.user_type && values.answers) {
        const answers = values.answers[values.user_type];
        const questions = values.user_type === 'business' 
          ? ["Nama bisnis:", "Deskripsi produk/jasa:", "Target pelanggan:", "Pertanyaan umum:", "Tambahan:"]
          : values.user_type === 'creator'
          ? ["Jenis konten utama:", "Audiens utama:", "Pertanyaan umum pengikut:", "Tambahan:"]
          : ["Tujuan utama AI:", "Topik/fokus utama:", "Gaya komunikasi:", "Tambahan:"];

        formattedTrainingData = questions
          .map((q, i) => `${q} ${answers[i] || ''}`)
          .filter(text => text.trim())
          .join('\n\n');
      }

      // Prepend the assistant context to the training data
      const enhancedTrainingData = formattedTrainingData 
        ? `${ASSISTANT_CONTEXT}\n\n${formattedTrainingData}`
        : ASSISTANT_CONTEXT;

      console.log("Enhanced training data:", enhancedTrainingData);

      // First update the settings in the database
      const { data: settingsData, error: settingsError } = await supabase
        .from("chatbot_settings")
        .update({
          bot_name: values.bot_name,
          greeting_message: values.greeting_message,
          training_data: formattedTrainingData, // Store original training data
          user_type: values.user_type,
          answers: values.answers
        })
        .eq("profile_id", userId)
        .select()
        .single();

      if (settingsError) {
        console.error("Error updating settings:", settingsError);
        throw settingsError;
      }

      console.log("Settings updated successfully:", settingsData);

      // Then update or create the OpenAI assistant
      console.log("Updating OpenAI assistant...");
      const assistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: JSON.stringify({
          bot_name: values.bot_name,
          training_data: enhancedTrainingData,
          assistant_id: settings?.assistant_id
        })
      });

      if (assistantResponse.error) {
        console.error("Error updating assistant:", assistantResponse.error);
        throw new Error(assistantResponse.error.message);
      }

      console.log("Assistant updated successfully:", assistantResponse.data);

      // If this is a new assistant, update the assistant_id in the settings
      if (!settings?.assistant_id) {
        const { error: updateError } = await supabase
          .from("chatbot_settings")
          .update({ assistant_id: assistantResponse.data.assistant.id })
          .eq("profile_id", userId);

        if (updateError) {
          console.error("Error updating assistant_id:", updateError);
          throw updateError;
        }
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
    onError: (error: Error) => {
      console.error("Mutation error:", error);
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
    user_type: settings?.user_type as "business" | "creator" | "other" | undefined,
    answers: settings?.answers || {
      business: Array(5).fill(""),
      creator: Array(5).fill(""),
      other: Array(4).fill("")
    }
  };

  return (
    <div className="space-y-8">
      <ChatbotSettingsForm
        defaultValues={defaultValues}
        onSubmit={updateSettings.mutate}
        isSubmitting={updateSettings.isPending}
        hasExistingBot={!!settings?.assistant_id}
        profileId={userId}
      />
      <ButtonsSection 
        profileId={userId}
        initialButtons={(settings?.buttons || [])}
      />
    </div>
  );
};

export default SettingsSection;