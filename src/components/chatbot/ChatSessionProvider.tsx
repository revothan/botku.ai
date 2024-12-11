import React, { createContext, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseSubscription } from '@/hooks/useSupabaseSubscription';
import { useMessageManagement } from '@/hooks/useMessageManagement';
import type { Message } from '@/types/chatbot';

interface ChatSessionContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  isLoading: boolean;
  reconnect: () => void;
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(undefined);

export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  if (!context) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  return context;
};

interface Props {
  sessionId: string | null;
  children: React.ReactNode;
}

export const ChatSessionProvider: React.FC<Props> = ({ sessionId, children }) => {
  const { messages, isLoading, loadMessages, addMessage } = useMessageManagement(sessionId);
  const { channelRef, setupSubscription, reconnect } = useSupabaseSubscription(sessionId);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    loadMessages();
    setupSubscription(sessionId);

    return () => {
      console.log('Cleaning up subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [sessionId, loadMessages, setupSubscription, channelRef]);

  return (
    <ChatSessionContext.Provider value={{ messages, addMessage, isLoading, reconnect }}>
      {children}
    </ChatSessionContext.Provider>
  );
};