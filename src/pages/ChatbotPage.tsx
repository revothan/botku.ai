import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LoadingState, ErrorState, NotFoundState } from "@/components/chatbot/ChatbotStates";
import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";
import type { Message, ButtonConfig, ChatbotSettings } from "@/types/chatbot";

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["chatbot-settings", customDomain],
    queryFn: async () => {
      if (!customDomain) {
        console.error("No domain provided");
        throw new Error("No domain provided");
      }

      console.log("Fetching chatbot settings for domain:", customDomain);
      
      // First try to find by custom_domain
      const { data: profileByDomain, error: domainError } = await supabase
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
            buttons
          )
        `)
        .eq('custom_domain', customDomain)
        .single();

      if (!domainError && profileByDomain?.chatbot_settings) {
        console.log("Found profile by custom domain:", profileByDomain);
        return transformSettings(profileByDomain.chatbot_settings);
      }

      // If not found by custom_domain, try username
      const { data: profileByUsername, error: usernameError } = await supabase
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
            buttons
          )
        `)
        .eq('username', customDomain)
        .single();

      if (usernameError) {
        console.error("Error fetching profile:", usernameError);
        return null;
      }

      if (!profileByUsername?.chatbot_settings) {
        console.log("No chatbot settings found for profile:", profileByUsername);
        return null;
      }

      console.log("Found profile by username:", profileByUsername);
      return transformSettings(profileByUsername.chatbot_settings);
    },
  });

  const transformSettings = (rawSettings: any): ChatbotSettings => {
    return {
      ...rawSettings,
      buttons: Array.isArray(rawSettings.buttons) 
        ? rawSettings.buttons.map((button: any) => ({
            id: button.id || crypto.randomUUID(),
            label: button.label || '',
            url: button.url || ''
          }))
        : []
    };
  };

  const sendMessage = async (message: string) => {
    if (!settings?.assistant_id) {
      toast({
        title: "Error",
        description: "Chatbot not configured properly",
        variant: "destructive",
      });
      return;
    }

    try {
      setMessages(prev => [...prev, { role: "user", content: message }]);

      const response = await supabase.functions.invoke<AssistantResponse>('chat-with-assistant', {
        body: JSON.stringify({
          message,
          assistantId: settings.assistant_id
        })
      });

      if (response.error) throw response.error;

      if (response.data?.response?.text?.value) {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: response.data.response.text.value 
        }]);
        setInputMessage("");
      } else {
        console.error("Unexpected response format:", response);
        toast({
          title: "Error",
          description: "Received an invalid response from the chatbot",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message || "An error occurred while loading the chatbot"} />;
  }

  if (!settings) {
    return <NotFoundState />;
  }

  return (
    <ChatbotInterface
      settings={settings}
      messages={messages}
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      handleSubmit={handleSubmit}
      messagesEndRef={messagesEndRef}
    />
  );
};

export default ChatbotPage;