import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Client, IMessage } from '@stomp/stompjs';
import Constants from 'expo-constants';

interface WebSocketContextProps {
  client: Client | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
  sendMessage: (destination: string, body: any) => void;
}

export const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const { token } = useAuth();

  const connect = () => {
    if (clientRef.current && clientRef.current.active) return;
    const wsUrl = Constants.manifest.extra.WS_URL;
    const stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      debug: (str) => console.log('[STOMP]', str),
      onConnect: () => {
        setIsConnected(true);
        console.log('STOMP conectado');
        // Ejemplo de suscripción a un canal público
        stompClient.subscribe('/topic/public', (message: IMessage) => {
          console.log('Mensaje recibido:', message.body);
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
        console.log('STOMP desconectado');
      },
      onStompError: (frame) => {
        setIsConnected(false);
        console.error('STOMP error:', frame.headers['message'], frame.body);
      },
    });
    stompClient.activate();
    clientRef.current = stompClient;
    setClient(stompClient);
  };

  const disconnect = () => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setClient(null);
      setIsConnected(false);
    }
  };

  const sendMessage = (destination: string, body: any) => {
    if (clientRef.current && isConnected) {
      clientRef.current.publish({ destination, body: JSON.stringify(body) });
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ client, isConnected, connect, disconnect, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}; 