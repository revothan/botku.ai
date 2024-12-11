import { useEffect } from 'react';

export const usePostMessage = (onMessage: (message: any) => void) => {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Get the current origin
      const currentOrigin = window.location.origin;
      
      // Create an array of allowed origins
      const allowedOrigins = [
        currentOrigin,
        'http://localhost:5173',
        'http://localhost:3000'
      ];
      
      // Check if the event origin is allowed
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