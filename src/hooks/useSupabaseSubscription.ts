import { useCallback, useRef, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;

export const useSupabaseSubscription = (sessionId: string | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleReconnection = useCallback(() => {
    if (!sessionId) return;

    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
    console.log(`Attempting reconnection in ${delay}ms (attempt ${retryCount + 1})`);

    setTimeout(() => {
      setRetryCount(prev => prev + 1);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      setupSubscription(sessionId);
    }, delay);
  }, [sessionId, retryCount]);

  const setupSubscription = useCallback((sid: string) => {
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
        }
      )
      .subscribe(status => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
          setRetryCount(0);
        } else if (status === 'CLOSED') {
          console.log('Subscription closed, attempting to reconnect...');
          handleReconnection();
        }
      });

    channelRef.current = channel;
    return channel;
  }, [handleReconnection]);

  const reconnect = useCallback(() => {
    if (!sessionId) return;
    
    setRetryCount(0);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }
    setupSubscription(sessionId);
    toast.success('Attempting to reconnect...');
  }, [sessionId, setupSubscription]);

  return {
    channelRef,
    setupSubscription,
    reconnect
  };
};