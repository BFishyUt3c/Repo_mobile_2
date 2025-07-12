import { apiClient } from '../config/apiClient';
import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/api/chats`;

export interface Chat {
  id: number;
  user1: {
    id: number;
    firstName: string;
    lastName: string;
  };
  user2: {
    id: number;
    firstName: string;
    lastName: string;
  };
  product: {
    productId: number;
    productName: string;
  };
  createdAt: string;
  lastMessage?: {
    content: string;
    sentAt: string;
    senderId: number;
  };
}

export interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    firstName: string;
    lastName: string;
  };
  sentAt: string;
  status: "SENT" | "DELIVERED" | "READ";
}

export interface ChatInfo {
  chatId: number;
  otherUser: {
    id: number;
    firstName: string;
    lastName: string;
  };
  product: {
    productId: number;
    productName: string;
  };
}

export const chatService = {
  // Obtener todos los chats del usuario
  getMyChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get(`${BASE_URL}/my-chats`);
    return response.data;
  },

  // Obtener mensajes de un chat específico
  getChatMessages: async (chatId: number): Promise<Message[]> => {
    const response = await apiClient.get(`${BASE_URL}/${chatId}/messages`);
    return response.data;
  },

  // Enviar un mensaje
  sendMessage: async (chatId: number, content: string): Promise<Message> => {
    const response = await apiClient.post(`${BASE_URL}/${chatId}/messages`, {
      content
    });
    return response.data;
  },

  // Iniciar un nuevo chat
  startChat: async (otherUserId: number, productId: number): Promise<Chat> => {
    console.log('[startChat] Payload:', { otherUserId, productId });
    try {
      const response = await apiClient.post(`${BASE_URL}/start`, {
        otherUserId,
        productId
      });
      console.log('[startChat] Response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('[startChat] Error:', error, error?.response?.data);
      throw error;
    }
  },

  // Obtener información de un chat
  getChatInfo: async (chatId: number): Promise<ChatInfo> => {
    const response = await apiClient.get(`${BASE_URL}/${chatId}/info`);
    return response.data;
  },

  // Marcar mensajes como leídos
  markAsRead: async (chatId: number): Promise<void> => {
    await apiClient.put(`${BASE_URL}/${chatId}/read`);
  },

  // Obtener chats por producto
  getChatsByProduct: async (productId: number): Promise<Chat[]> => {
    const response = await apiClient.get(`${BASE_URL}/product/${productId}`);
    return response.data;
  },

  // Eliminar un chat
  deleteChat: async (chatId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${chatId}`);
  },

  // Buscar chats
  searchChats: async (searchTerm: string): Promise<Chat[]> => {
    const response = await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Obtener estadísticas de chat
  getChatStatistics: async (): Promise<{
    totalChats: number;
    unreadMessages: number;
    activeChats: number;
  }> => {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data;
  },
}; 