import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const setupSubscription = async () => {
    if (!sessionId) {
      console.log('No session ID available, skipping subscription setup');
      return null;
    }

    console.log('Setting up subscription for session:', sessionId);
    
    return supabase
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
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        } else if (status === 'CLOSED' && retryCount < MAX_RETRIES) {
          console.log('Subscription closed, attempting to reconnect...');
          setRetryCount(prev => prev + 1);
          setupSubscription();
        } else if (status === 'CLOSED') {
          console.error('Max retry attempts reached for subscription');
          toast.error('Failed to maintain real-time connection. Please refresh the page.');
        }
      });
  };

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
        toast.error('Failed to load messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
    const subscription = setupSubscription();

    return () => {
      console.log('Cleaning up subscription');
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [sessionId, retryCount]);

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  return (
    <ChatSessionContext.Provider value={{ messages, addMessage, isLoading }}>
      {children}
    </ChatSessionContext.Provider>
  );
};