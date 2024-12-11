import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef } from "react";
import { LoadingState, ErrorState, NotFoundState } from "@/components/chatbot/ChatbotStates";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatMessages } from "@/components/chatbot/ChatMessages";
import { useChatSession, ChatSessionProvider } from "@/components/chatbot/ChatSessionProvider";
import { useChatLogic } from "@/hooks/useChatLogic";
import { usePostMessage } from "@/hooks/usePostMessage";
import type { ChatbotSettings } from "@/types/chatbot";

const transformSettings = (rawSettings: any): ChatbotSettings => ({
  ...rawSettings,
  buttons: Array.isArray(rawSettings.buttons) 
    ? rawSettings.buttons.map((button: any) => ({
        id: button.id || crypto.randomUUID(),
        label: button.label || '',
        url: button.url || ''
      }))
    : []
});

const ChatbotContent = () => {
  const { customDomain } = useParams<{ customDomain: string }>();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading: messagesLoading } = useChatSession();

  const { data: settings, isLoading: settingsLoading, error } = useQuery({
    queryKey: ["chatbot-settings", customDomain],
    queryFn: async () => {
      if (!customDomain) throw new Error("No domain provided");
      
      console.log("Fetching settings for domain:", customDomain);
      
      const { data: profileByDomain, error: domainError } = await supabase
        .from("profiles")
        .select(`
          id,
          chatbot_settings (*)
        `)
        .eq('custom_domain', customDomain)
        .single();

      if (!domainError && profileByDomain?.chatbot_settings) {
        console.log("Found settings by domain:", profileByDomain.chatbot_settings);
        return transformSettings(profileByDomain.chatbot_settings);
      }

      const { data: profileByUsername, error: usernameError } = await supabase
        .from("profiles")
        .select(`
          id,
          chatbot_settings (*)
        `)
        .eq('username', customDomain)
        .single();

      if (usernameError) throw usernameError;
      if (!profileByUsername?.chatbot_settings) return null;

      console.log("Found settings by username:", profileByUsername.chatbot_settings);
      return transformSettings(profileByUsername.chatbot_settings);
    },
  });

  usePostMessage((message) => {
    console.log('Received postMessage:', message);
    // Handle any postMessage events here
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    console.log('Handling message submission:', inputMessage);
    setInputMessage("");
  };

  if (settingsLoading || messagesLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!settings) return <NotFoundState />;

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#fcf5eb] to-white p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-lg h-full">
        <div className="border-none shadow-lg bg-white/80 backdrop-blur-sm h-full rounded-lg">
          <div className="p-4 h-full flex flex-col">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold text-secondary">{settings.bot_name}</h3>
            </div>
            
            <ChatMessages
              messages={messages}
              buttons={settings.buttons || []}
              isLoading={messagesLoading}
              messagesEndRef={messagesEndRef}
              greeting={settings.greeting_message}
            />

            <div className="border-t pt-4">
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSubmit={handleSubmit}
                isLoading={messagesLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatbotPage = () => {
  const [sessionId] = useState(() => crypto.randomUUID());

  return (
    <ChatSessionProvider sessionId={sessionId}>
      <ChatbotContent />
    </ChatSessionProvider>
  );
};

export default ChatbotPage;