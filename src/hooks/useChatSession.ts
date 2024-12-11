import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from '@supabase/auth-helpers-react';

const SESSION_STORAGE_KEY = 'chat_session_data';
const SESSION_EXPIRY_TIME = 60 * 60 * 1000; // 1 hour in milliseconds

type StoredSessionData = {
  sessionId: string;
  timestamp: number;
};

export const useChatSession = (profileId: string | undefined) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId] = useState(() => uuidv4());
  const { toast } = useToast();
  const session = useSession();

  const isSessionValid = (storedData: StoredSessionData): boolean => {
    const currentTime = Date.now();
    return currentTime - storedData.timestamp < SESSION_EXPIRY_TIME;
  };

  const storeSessionData = (sessionId: string) => {
    const sessionData: StoredSessionData = {
      sessionId,
      timestamp: Date.now(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  };

  const getStoredSessionData = (): StoredSessionData | null => {
    const storedData = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedData) return null;
    
    try {
      return JSON.parse(storedData);
    } catch (error) {
      console.error('Error parsing stored session data:', error);
      return null;
    }
  };

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
      storeSessionData(chatSession.id);
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

  const checkExistingSession = async (sessionId: string) => {
    try {
      const { data: session, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (error || !session) {
        console.log("Existing session not found or error:", error);
        return false;
      }

      if (session.status !== 'active') {
        console.log("Session exists but is not active");
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error checking existing session:", error);
      return false;
    }
  };

  // Initialize session from storage or create new one
  useEffect(() => {
    const initializeSession = async () => {
      if (sessionId) return; // Session already initialized

      const storedData = getStoredSessionData();
      
      if (storedData && isSessionValid(storedData)) {
        console.log("Found stored session:", storedData.sessionId);
        const isValid = await checkExistingSession(storedData.sessionId);
        
        if (isValid) {
          console.log("Stored session is valid, reusing it");
          setSessionId(storedData.sessionId);
          return;
        }
      }

      // If we get here, we need a new session
      if (profileId) {
        console.log("Creating new session");
        const newSessionId = await createChatSession();
        if (newSessionId) {
          setSessionId(newSessionId);
        }
      }
    };

    initializeSession();
  }, [profileId]);

  return {
    sessionId,
    setSessionId,
    visitorId,
    createChatSession
  };
};