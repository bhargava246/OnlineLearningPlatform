import { useEffect, useRef, useState, useCallback } from 'react';
import { queryClient } from '@/lib/queryClient';

export interface WebSocketMessage {
  type: string;
  data: any;
  dealerId?: string;
  userId?: string;
}

interface UseWebSocketOptions {
  dealerId?: string;
  userId?: string;
  onMessage?: (message: WebSocketMessage) => void;
}

export function useWebSocket({ dealerId, userId, onMessage }: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log('Connecting to WebSocket:', wsUrl);
      setConnectionStatus('connecting');
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;

        // Register the client with dealer/user ID
        if (dealerId || userId) {
          wsRef.current?.send(JSON.stringify({
            type: 'register',
            dealerId,
            userId
          }));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          console.log('WebSocket message received:', message);

          // Handle real-time updates
          switch (message.type) {
            case 'CAR_ADDED':
            case 'CAR_UPDATED':
              // Invalidate car-related queries
              queryClient.invalidateQueries({ queryKey: ['/api/cars'] });
              queryClient.invalidateQueries({ queryKey: ['/api/cars/featured'] });
              if (message.dealerId) {
                queryClient.invalidateQueries({ queryKey: ['/api/dealers', message.dealerId, 'cars'] });
              }
              break;
            case 'REVIEW_ADDED':
              // Invalidate review queries
              queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
              if (message.dealerId) {
                queryClient.invalidateQueries({ queryKey: ['/api/reviews/dealer', message.dealerId] });
              }
              break;
            case 'DEALER_UPDATED':
              // Invalidate dealer queries
              queryClient.invalidateQueries({ queryKey: ['/api/dealers'] });
              if (message.data?._id) {
                queryClient.invalidateQueries({ queryKey: ['/api/dealers', message.data._id] });
              }
              break;
          }

          // Call custom onMessage handler if provided
          onMessage?.(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        setConnectionStatus('disconnected');

        // Attempt reconnection with exponential backoff
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`Attempting to reconnect in ${delay}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        } else {
          console.log('Max reconnection attempts reached');
          setConnectionStatus('error');
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setConnectionStatus('error');
    }
  }, [dealerId, userId, onMessage]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    
    wsRef.current = null;
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected. Cannot send message:', message);
    return false;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect
  };
}