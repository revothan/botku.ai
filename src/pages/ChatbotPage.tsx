import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { LoadingState, ErrorState, NotFoundState } from "@/components/chatbot/ChatbotStates";
import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useSession } from '@supabase/auth-helpers-react';
import type { ChatbotSettings } from "@/types/chatbot";

type AssistantResponse = {
  response: {
    type: string;
    text: {
      value: string;
      annotations: any[];
    };
  };
};

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

const ChatbotPage = () => {
  const { customDomain } = useParams<{ customDomain: string }>();
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const session = useSession();

  const { data: settings, isLoading: settingsLoading, error } = useQuery({
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

  const { sessionId, setSessionId, createChatSession } = useChatSession(settings?.profile_id);
  const { messages, setMessages, insertMessage } = useChatMessages(sessionId);

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
      setIsLoading(true);

      // Create a chat session if one doesn't exist
      if (!sessionId) {
        const newSessionId = await createChatSession();
        if (!newSessionId) {
          throw new Error("Failed to create chat session");
        }
        setSessionId(newSessionId);
      }

      // Insert user message
      const userMessageSuccess = await insertMessage(message, "user");
      if (!userMessageSuccess) {
        throw new Error("Failed to send message");
      }

      setInputMessage("");

      // Check if the last message was from the owner
      const lastMessage = messages[messages.length - 1];
      const isAiDisabled = lastMessage?.role === "owner";

      // Only send to AI if it's not disabled
      if (!isAiDisabled) {
        const response = await supabase.functions.invoke<AssistantResponse>('chat-with-assistant', {
          body: JSON.stringify({
            message,
            assistantId: settings.assistant_id
          })
        });

        if (response.error) throw response.error;

        if (response.data?.response?.text?.value) {
          const assistantMessage = response.data.response.text.value;
          
          const assistantMessageSuccess = await insertMessage(assistantMessage, "assistant");
          if (!assistantMessageSuccess) {
            throw new Error("Failed to save assistant response");
          }
        } else {
          console.error("Unexpected response format:", response);
          toast({
            title: "Error",
            description: "Received an invalid response from the chatbot",
            variant: "destructive",
          });
        }
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
  };

  if (settingsLoading) {
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
      isLoading={isLoading}
    />
  );
};

export default ChatbotPage;