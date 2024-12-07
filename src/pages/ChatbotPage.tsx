import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";
import type { ButtonConfig } from "@/types/chatbot";

const ChatbotPage = () => {
  const { customDomain } = useParams<{ customDomain: string }>();

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["chatbot-settings", customDomain],
    queryFn: async () => {
      if (!customDomain) {
        throw new Error("No domain provided");
      }

      console.log("Fetching chatbot settings for domain:", customDomain);
      
      // First get the profile by custom domain
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("custom_domain", customDomain);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profiles || profiles.length === 0) {
        throw new Error("Profile not found");
      }

      const profile = profiles[0];

      // Then get the chatbot settings for that profile
      const { data: chatbotSettings, error: settingsError } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("profile_id", profile.id)
        .single();

      if (settingsError) {
        console.error("Error fetching chatbot settings:", settingsError);
        throw settingsError;
      }

      return chatbotSettings;
    },
    enabled: !!customDomain,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {error?.message || "Chatbot not found or not configured"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const buttons = (settings.buttons || []) as ButtonConfig[];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="max-w-lg mx-auto">
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold">{settings.bot_name}</h3>
            </div>
            <div className="h-[400px] overflow-y-auto py-4">
              <div className="bg-primary/10 rounded-lg p-3 max-w-[80%] mb-4">
                <p className="text-sm">{settings.greeting_message}</p>
              </div>
              {buttons.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {buttons.map((button) => (
                    <a
                      key={button.id}
                      href={button.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm hover:bg-primary/30 transition-colors"
                    >
                      {button.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button size="icon">
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;