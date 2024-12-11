import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import type { Message } from "@/types/chatbot";

interface ChatSessionContextType {
  messages: Message[];
  addMessage: (message: Message) => void;
  isLoading: boolean;
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      console.log('No session ID available, skipping message load');
      setIsLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        console.log('Loading messages for session:', sessionId);
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
          console.log('No messages found for session');
          setMessages([]);
          return;
        }

        const validMessages = data
          .map(msg => {
            if (!['user', 'assistant', 'owner'].includes(msg.role)) {
              console.warn(`Invalid role encountered: ${msg.role}`);
              return null;
            }
            return {
              role: msg.role as Message['role'],
              content: msg.content
            };
          })
          .filter((msg): msg is Message => msg !== null);

        console.log('Setting messages:', validMessages);
        setMessages(validMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`chat_messages_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload: any) => {
          console.log('Real-time message received:', payload);
          if (!['user', 'assistant', 'owner'].includes(payload.new.role)) {
            console.warn(`Invalid role in payload: ${payload.new.role}`);
            return;
          }

          const newMessage: Message = {
            role: payload.new.role as Message['role'],
            content: payload.new.content
          };

          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe(status => {
        console.log('Subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <ChatSessionContext.Provider value={{ messages, addMessage, isLoading }}>
      {children}
    </ChatSessionContext.Provider>
  );
};