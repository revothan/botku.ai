import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ChatMessage } from "@/components/chatbot/ChatMessage";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatButtons } from "@/components/chatbot/ChatButtons";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Message, ButtonConfig } from "@/types/chatbot";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Scroll whenever messages update

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

      if (profileError) throw profileError;
      if (!profiles?.length) throw new Error(`No chatbot found for domain: ${customDomain}`);

      const { data: chatbotSettings, error: settingsError } = await supabase
        .from("chatbot_settings")
        .select("*")
        .eq("profile_id", profiles[0].id)
        .limit(1);

      if (settingsError) throw settingsError;
      if (!chatbotSettings?.length) throw new Error("Chatbot not configured for this domain");

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

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: (response) => {
      if (response?.response?.text?.value) {
        setMessages(prev => [...prev, { role: "assistant", content: response.response.text.value }]);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf5eb] to-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#fcf5eb] to-white">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm">
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
    <div className="min-h-screen bg-gradient-to-b from-[#fcf5eb] to-white p-4">
      <div className="max-w-lg mx-auto">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold text-secondary">{settings.bot_name}</h3>
            </div>
            <ScrollArea className="h-[400px] py-4">
              <div className="space-y-4">
                <div className="bg-primary/10 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm">{settings.greeting_message}</p>
                </div>

                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
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

                <ChatButtons buttons={buttons} />
                <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
              </div>
            </ScrollArea>
            <div className="border-t pt-4">
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSubmit={handleSubmit}
                isLoading={sendMessage.isPending}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;
