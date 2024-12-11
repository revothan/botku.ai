import { useCallback, useRef, useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 30000;
const MAX_RETRY_ATTEMPTS = 5;

export const useSupabaseSubscription = (sessionId: string | null) => {
  const [retryCount, setRetryCount] = useState(0);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const timeoutRef = useRef<number>();

  const handleReconnection = useCallback(() => {
    if (!sessionId || retryCount >= MAX_RETRY_ATTEMPTS) {
      console.error('Max retry attempts reached or no session ID');
      toast.error('Failed to maintain connection. Please refresh the page.');
      return;
    }

    const delay = Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryCount), MAX_RETRY_DELAY);
    console.log(`Attempting reconnection in ${delay}ms (attempt ${retryCount + 1})`);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setRetryCount(prev => prev + 1);
      if (channelRef.current) {
        console.log('Removing existing channel before reconnection');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setupSubscription(sessionId);
    }, delay);
  }, [sessionId, retryCount]);

  const setupSubscription = useCallback((sid: string) => {
    if (channelRef.current) {
      console.warn('Subscription already exists, cleaning up first');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

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
      .on('system', { event: 'error' }, (error) => {
        console.error('Subscription error:', error);
        toast.error('Connection error occurred');
      })
      .subscribe(status => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
          setRetryCount(0);
          // Start heartbeat
          startHeartbeat(channel);
        } else if (status === 'CLOSED') {
          console.log('Subscription closed, attempting to reconnect...');
          handleReconnection();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Channel error occurred');
          toast.error('Connection error occurred');
          handleReconnection();
        }
      });

    channelRef.current = channel;
    return channel;
  }, [handleReconnection]);

  const startHeartbeat = (channel: RealtimeChannel) => {
    const heartbeatInterval = setInterval(() => {
      if (channel.state === 'closed') {
        clearInterval(heartbeatInterval);
        return;
      }

      channel.send({
        type: 'broadcast',
        event: 'heartbeat',
        payload: { timestamp: Date.now() }
      }).catch(error => {
        console.error('Heartbeat failed:', error);
        clearInterval(heartbeatInterval);
        handleReconnection();
      });
    }, 30000); // Send heartbeat every 30 seconds

    // Store interval ID for cleanup
    return heartbeatInterval;
  };

  const reconnect = useCallback(() => {
    if (!sessionId) return;
    
    console.log('Manual reconnection requested');
    setRetryCount(0);
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setupSubscription(sessionId);
    toast.success('Attempting to reconnect...');
  }, [sessionId, setupSubscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up subscription');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, []);

  return {
    channelRef,
    setupSubscription,
    reconnect
  };
};