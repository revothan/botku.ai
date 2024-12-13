import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import type { Message } from "@/types/chatbot";

export const useChatMessages = (sessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const insertMessage = async (content: string, role: "user" | "assistant") => {
    if (!sessionId) {
      console.error("No session ID available");
      return false;
    }

    try {
      const { error } = await supabase
        .from("chat_messages")
        .insert({
          session_id: sessionId,
          role,
          content
        });

      if (error) {
        console.error("Error inserting message:", error);
        throw error;
      }

      const timestamp = new Date().toISOString();
      const id = crypto.randomUUID();
      
      setMessages(prev => [...prev, {
        id,
        content,
        sender: role,
        timestamp,
        role
      }]);
      
      return true;
    } catch (error: any) {
      console.error("Failed to insert message:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    messages,
    setMessages,
    insertMessage
  };
};