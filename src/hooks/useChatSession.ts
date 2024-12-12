import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from '@supabase/auth-helpers-react';

export const useChatSession = (profileId: string | undefined) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId] = useState(() => uuidv4());
  const { toast } = useToast();
  const session = useSession();

  const createChatSession = async () => {
    if (!profileId) {
      console.error("No profile ID available");
      return null;
    }

    try {
      console.log("Creating chat session for profile:", profileId);
      const { data: chatSession, error } = await supabase
        .from("chat_sessions")
        .insert({
          profile_id: profileId,
          visitor_id: session?.user?.id || visitorId,
          visitor_ip: null,
          user_agent: navigator.userAgent,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating chat session:", error);
        toast({
          title: "Error",
          description: "Failed to create chat session. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      console.log("Chat session created successfully:", chatSession);
      return chatSession.id;
    } catch (error: any) {
      console.error("Failed to create chat session:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create chat session",
        variant: "destructive",
      });
      return null;
    }
  };

  // Automatically create a session when the component mounts
  useEffect(() => {
    if (!sessionId && profileId) {
      createChatSession().then((newSessionId) => {
        if (newSessionId) {
          setSessionId(newSessionId);
        }
      });
    }
  }, [profileId]);

  return {
    sessionId,
    setSessionId,
    visitorId,
    createChatSession
  };
};