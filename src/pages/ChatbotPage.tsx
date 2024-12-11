import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingState, ErrorState, NotFoundState } from "@/components/chatbot/ChatbotStates";
import { ChatInput } from "@/components/chatbot/ChatInput";
import { ChatMessages } from "@/components/chatbot/ChatMessages";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { useChatLogic } from "@/hooks/useChatLogic";
import type { ChatbotSettings, Message } from "@/types/chatbot";

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

const ChatbotPage = () => {
  const { customDomain } = useParams<{ customDomain: string }>();
  const [inputMessage, setInputMessage] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: settings, isLoading: settingsLoading, error } = useQuery({
    queryKey: ["chatbot-settings", customDomain],
    queryFn: async () => {
      if (!customDomain) throw new Error("No domain provided");
      
      const { data: profileByDomain, error: domainError } = await supabase
        .from("profiles")
        .select(`
          id,
          chatbot_settings (*)
        `)
        .eq('custom_domain', customDomain)
        .single();

      if (!domainError && profileByDomain?.chatbot_settings) {
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

      return transformSettings(profileByUsername.chatbot_settings);
    },
  });

  const { sessionId, setSessionId, createChatSession } = useChatSession(settings?.profile_id);
  const { messages, setMessages } = useChatMessages(sessionId);
  const { isLoading, sendMessage } = useChatLogic(settings!, sessionId, setSessionId);

  // Subscribe to real-time updates for messages
  useEffect(() => {
    if (!sessionId) return;

    console.log('Subscribing to chat messages for session:', sessionId);
    const channel = supabase
      .channel('chat_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          console.log('Real-time message update:', payload);
          const newMessage = {
            role: payload.new.role,
            content: payload.new.content
          } as Message;
          setLocalMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Update local messages when messages prop changes
  useEffect(() => {
    setLocalMessages(messages);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    if (!sessionId) {
      const newSessionId = await createChatSession();
      if (!newSessionId) return;
      setSessionId(newSessionId);
    }

    const success = await sendMessage(inputMessage, "user");
    if (success) setInputMessage("");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  if (settingsLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!settings) return <NotFoundState />;

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-[#fcf5eb] to-white p-4 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-lg h-full">
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="text-center border-b pb-4">
              <h3 className="font-bold text-secondary">{settings.bot_name}</h3>
            </div>
            
            <ChatMessages
              messages={localMessages}
              buttons={settings.buttons || []}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              greeting={settings.greeting_message}
            />

            <div className="border-t pt-4">
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatbotPage;