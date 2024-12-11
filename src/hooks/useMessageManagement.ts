import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Message } from '@/types/chatbot';

export const useMessageManagement = (sessionId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  return {
    messages,
    isLoading,
    loadMessages,
    addMessage
  };
};