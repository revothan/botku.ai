import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Message, ChatbotSettings } from "@/types/chatbot";

type AssistantResponse = {
  response: {
    type: string;
    text: {
      value: string;
      annotations: any[];
    };
  };
};

export const useChatLogic = (settings: ChatbotSettings, sessionId: string | null, setSessionId: (id: string) => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (message: string, role: "user" | "assistant" | "owner") => {
    if (!settings?.assistant_id && role !== "owner") {
      toast("Error: Chatbot not configured properly");
      return;
    }

    try {
      setIsLoading(true);

      // Insert message
      const { error: messageError } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role,
          content: message
        });

      if (messageError) throw messageError;

      // Only send to AI if it's a user message and not an owner message
      if (role === "user") {
        const response = await supabase.functions.invoke<AssistantResponse>('chat-with-assistant', {
          body: JSON.stringify({
            message,
            assistantId: settings.assistant_id
          })
        });

        if (response.error) throw response.error;

        if (response.data?.response?.text?.value) {
          const assistantMessage = response.data.response.text.value;
          
          const { error: assistantError } = await supabase
            .from("chat_messages")
            .insert({
              session_id: sessionId,
              role: "assistant",
              content: assistantMessage
            });

          if (assistantError) throw assistantError;
        }
      }

      return true;
    } catch (error: any) {
      console.error("Chat error:", error);
      toast("Error: " + (error.message || "Failed to send message"));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    sendMessage
  };
};