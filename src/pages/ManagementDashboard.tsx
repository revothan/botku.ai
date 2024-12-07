import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Smartphone } from "lucide-react";

type ChatbotSettings = {
  bot_name: string;
  greeting_message: string;
  training_data: string;
};

const ManagementDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ChatbotSettings>({
    defaultValues: {
      bot_name: "",
      greeting_message: "",
      training_data: "",
    },
  });

  // Fetch or create chatbot settings
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

  // Update settings mutation with OpenAI Assistant creation
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

      // Then, create OpenAI Assistant
      const assistantResponse = await supabase.functions.invoke('create-openai-assistant', {
        body: JSON.stringify(values)
      });

      if (assistantResponse.error) {
        throw new Error(assistantResponse.error.message);
      }

      return { settings: settingsData, assistant: assistantResponse.data };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["chatbot-settings"] });
      toast({
        title: "Settings saved",
        description: "Your chatbot settings and OpenAI Assistant have been created successfully.",
      });
      console.log("OpenAI Assistant created:", result.assistant);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      form.reset({
        bot_name: settings.bot_name,
        greeting_message: settings.greeting_message,
        training_data: settings.training_data || "",
      });
    }
  }, [settings, form]);

  const onSubmit = (values: ChatbotSettings) => {
    updateSettings.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  // ... keep existing code (the JSX for the form and phone preview)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Form */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Chatbot Settings</h1>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="bot_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chatbot Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your chatbot's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="greeting_message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Greeting Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the greeting message for your visitors"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="training_data"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Training Data</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter information to train your AI chatbot"
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={updateSettings.isPending}
                  className="w-full"
                >
                  {updateSettings.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Form>
          </div>

          {/* Phone Preview */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">Preview</h2>
            <div className="relative mx-auto w-[300px] h-[600px] rounded-[3rem] border-8 border-gray-900 overflow-hidden">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-6 bg-gray-900 rounded-b-2xl"></div>
              <div className="h-full bg-gray-100 p-4">
                <div className="bg-white h-full rounded-2xl shadow-sm p-4 flex flex-col">
                  <div className="text-center border-b pb-4">
                    <h3 className="font-bold">{form.watch("bot_name") || "My ChatBot"}</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto py-4">
                    <div className="bg-primary/10 rounded-lg p-3 max-w-[80%] mb-4">
                      <p className="text-sm">
                        {form.watch("greeting_message") || "Hello! How can I help you today?"}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type your message..."
                        className="flex-1"
                        disabled
                      />
                      <Button size="icon" disabled>
                        <Smartphone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementDashboard;