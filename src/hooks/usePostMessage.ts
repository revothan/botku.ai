import { useEffect } from 'react';

export const usePostMessage = (onMessage: (message: any) => void) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      const allowedOrigins = [
        window.location.origin,
        process.env.VITE_APP_URL,
      ].filter(Boolean);
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn(`Rejected message from unauthorized origin: ${event.origin}`);
        return;
      }

      try {
        onMessage(event.data);
      } catch (error) {
        console.error('Error handling postMessage:', error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onMessage]);
};