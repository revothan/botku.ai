import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import type { ButtonConfig } from "@/types/chatbot";

type Message = {
  role: "assistant" | "user";
  content: string;
};

type AssistantResponse = {
  response: {
    type: string;
    text: {
      value: string;
      annotations: any[];
    };
  };
};

const ChatbotPage = () => {
  const { customDomain } = useParams<{ customDomain: string }>();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["chatbot-settings", customDomain],
    queryFn: async () => {
      if (!customDomain) {
        console.error("No domain provided");
        throw new Error("No domain provided");
      }

      console.log("Fetching chatbot settings for domain:", customDomain);
      
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, custom_domain")
        .eq("custom_domain", customDomain)
        .limit(1);

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }

      if (!profiles || profiles.length === 0) {
        console.error("No profile found for domain:", customDomain);
        throw new Error(`No chatbot found for domain: ${customDomain}`);
      }

      const profile = profiles[0];
      console.log("Found profile:", profile);

      const { data: chatbotSettings, error: settingsError } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("profile_id", profile.id)
        .limit(1);

      if (settingsError) {
        console.error("Error fetching chatbot settings:", settingsError);
        throw settingsError;
      }

      if (!chatbotSettings || chatbotSettings.length === 0) {
        console.error("No chatbot settings found for profile:", profile.id);
        throw new Error("Chatbot not configured for this domain");
      }

      console.log("Chatbot settings found:", chatbotSettings[0]);
      return chatbotSettings[0];
    },
    enabled: !!customDomain,
  });

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!settings?.assistant_id) {
        throw new Error("Chatbot not configured properly");
      }

      const response = await supabase.functions.invoke<AssistantResponse>('chat-with-assistant', {
        body: JSON.stringify({
          message,
          assistantId: settings.assistant_id
        })
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      console.log("Received response from assistant:", response.data);
      return response.data;
    },
    onSuccess: (response) => {
      if (response?.response?.text?.value) {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: response.response.text.value }
        ]);
        setInputMessage("");
      } else {
        console.error("Unexpected response format:", response);
        toast({
          title: "Error",
          description: "Received an invalid response from the chatbot",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setMessages(prev => [...prev, { role: "user", content: inputMessage }]);
    sendMessage.mutate(inputMessage);
  };

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
            <div className="h-[400px] overflow-y-auto py-4 space-y-4">
              <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                <p className="text-sm">{settings.greeting_message}</p>
              </div>

              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`${
                    message.role === "assistant"
                      ? "bg-primary/10 rounded-lg p-3 max-w-[80%]"
                      : "bg-primary/5 rounded-lg p-3 max-w-[80%] ml-auto"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                </div>
              ))}

              {sendMessage.isPending && (
                <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-100" />
                    <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce delay-200" />
                  </div>
                </div>
              )}

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
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={sendMessage.isPending}
                />
                <Button 
                  type="submit" 
                  size="icon"
                  disabled={sendMessage.isPending || !inputMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;