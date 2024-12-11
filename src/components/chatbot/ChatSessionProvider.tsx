import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Message } from "@/types/chatbot";
import type { RealtimeChannel } from '@supabase/supabase-js';

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

const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const HEARTBEAT_INTERVAL = 30000;

export const ChatSessionProvider: React.FC<Props> = ({ sessionId, children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const heartbeatIntervalRef = useRef<number>();

  const setupSubscription = useCallback((sid: string): RealtimeChannel => {
    console.log('Setting up subscription for session:', sid);
    
    const channel = supabase
      .channel(`chat_messages_${sid}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${sid}`
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
          setRetryCount(0); // Reset retry count on successful connection
        } else if (status === 'CLOSED') {
          console.log('Subscription closed, attempting to reconnect...');
          handleReconnection();
        }
      });

    return channel;
  }, []);

  const handleReconnection = useCallback(() => {
    if (!sessionId) return;

    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
    console.log(`Attempting reconnection in ${delay}ms (attempt ${retryCount + 1})`);

    setTimeout(() => {
      setRetryCount(prev => prev + 1);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      channelRef.current = setupSubscription(sessionId);
    }, delay);
  }, [sessionId, retryCount, setupSubscription]);

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = window.setInterval(() => {
      if (channelRef.current) {
        channelRef.current
          .send({
            type: 'broadcast',
            event: 'heartbeat',
            payload: { timestamp: new Date().toISOString() }
          })
          .catch(error => {
            console.error('Heartbeat failed:', error);
            handleReconnection();
          });
      }
    }, HEARTBEAT_INTERVAL);
  }, [handleReconnection]);

  const loadMessages = useCallback(async () => {
    if (!sessionId) return;

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
    } catch (error: any) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Initialize subscription and heartbeat
  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    loadMessages();
    channelRef.current = setupSubscription(sessionId);
    startHeartbeat();

    return () => {
      console.log('Cleaning up subscription and heartbeat');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [sessionId, setupSubscription, startHeartbeat, loadMessages]);

  const reconnect = useCallback(() => {
    if (!sessionId) return;
    
    setRetryCount(0);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    channelRef.current = setupSubscription(sessionId);
    startHeartbeat();
    toast.success('Attempting to reconnect...');
  }, [sessionId, setupSubscription, startHeartbeat]);

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return (
    <ChatSessionContext.Provider value={{ messages, addMessage, isLoading, reconnect }}>
      {children}
    </ChatSessionContext.Provider>
  );
};