import { useState, useRef, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useChatSession } from "@/hooks/useChatSession";
import { useChatMessages } from "@/hooks/useChatMessages";
import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";
import type { ChatbotSettings, AssistantResponse } from "@/types/chatbot";

type ChatContainerProps = {
  settings: ChatbotSettings;
};

export const ChatContainer = ({ settings }: ChatContainerProps) => {
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize visitor session
  useEffect(() => {
    const initializeVisitorSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // Create anonymous session for tracking
          const { data: { user }, error } = await supabase.auth.signUp({
            email: `visitor_${Date.now()}@temp.com`,
            password: crypto.randomUUID(),
          });
          
          if (error) {
            console.error("Error creating visitor session:", error);
          } else {
            console.log("Anonymous visitor session created:", user);
          }
        }
      } catch (error) {
        console.error("Error initializing visitor session:", error);
      }
    };

    initializeVisitorSession();
  }, []);

  const { sessionId, setSessionId, createChatSession } = useChatSession(settings?.profile_id);
  const { messages, setMessages, insertMessage } = useChatMessages(sessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      if (!sessionId) {
        const newSessionId = await createChatSession();
        if (!newSessionId) {
          throw new Error("Failed to create chat session");
        }
        setSessionId(newSessionId);
      }

      const userMessageSuccess = await insertMessage(message, "user");
      if (!userMessageSuccess) {
        throw new Error("Failed to send message");
      }

      setInputMessage("");

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