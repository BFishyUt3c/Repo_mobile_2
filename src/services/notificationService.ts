import { apiClient } from '../config/apiClient';
import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/api/notifications`;

export enum NotificationType {
  SYSTEM = "SYSTEM",
  DONATION = "DONATION",
  EXCHANGE = "EXCHANGE",
  PRODUCT = "PRODUCT",
  COMMUNITY = "COMMUNITY",
  COMMUNITY_REQUEST = "COMMUNITY_REQUEST",
  MESSAGE = "MESSAGE",
  WISHLIST = "WISHLIST",
  ACHIEVEMENT = "ACHIEVEMENT",
  GENERAL = "GENERAL",
}

export interface NotificationResponseDto {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  type: NotificationType;
  userId: number;
  referenceId?: number;
  actionUrl?: string;
}

export interface NotificationCountDto {
  total: number;
  unread: number;
}

export interface NotificationFilters {
  type?: NotificationType;
  days?: number;
  onlyUnread?: boolean;
}

export interface PaginatedNotifications {
  content: NotificationResponseDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export const notificationService = {
  // Obtener todas las notificaciones paginadas
  getAllNotifications: async (
    page = 0,
    size = 20
  ): Promise<PaginatedNotifications> => {
    const response = await apiClient.get(`${BASE_URL}?page=${page}&size=${size}`);
    return response.data;
  },

  // Obtener notificaciones no leídas
  getUnreadNotifications: async (): Promise<NotificationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/unread`);
    return response.data;
  },

  // Obtener conteo de notificaciones
  getNotificationCount: async (): Promise<NotificationCountDto> => {
    const response = await apiClient.get(`${BASE_URL}/count`);
    return response.data;
  },

  // Obtener notificaciones por tipo
  getNotificationsByType: async (
    type: NotificationType
  ): Promise<NotificationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/type/${type}`);
    return response.data;
  },

  // Obtener notificaciones recientes
  getRecentNotifications: async (days = 7): Promise<NotificationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/recent?days=${days}`);
    return response.data;
  },

  // Marcar notificación como leída
  markAsRead: async (notificationId: number): Promise<NotificationResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${notificationId}/read`);
    return response.data;
  },

  // Marcar todas las notificaciones como leídas
  markAllAsRead: async (): Promise<void> => {
    await apiClient.put(`${BASE_URL}/mark-all-read`);
  },

  // Eliminar una notificación
  deleteNotification: async (notificationId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${notificationId}`);
  },

  // Eliminar todas las notificaciones
  deleteAllNotifications: async (): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/all`);
  },

  // Manejar solicitud de membresía desde notificación
  handleMembershipRequest: async (
    requestId: number,
    approved: boolean,
    responseMessage?: string
  ): Promise<any> => {
    const response = await apiClient.put(`/api/membership-requests/${requestId}/respond`, {
      approved,
      responseMessage
    });
    return response.data;
  },

  // Responder a solicitud de membresía
  respondToMembershipRequest: async (
    requestId: number,
    approved: boolean,
    responseMessage?: string
  ): Promise<void> => {
    await apiClient.put(`/api/membership-requests/${requestId}/respond`, {
      approved,
      responseMessage
    });
  },

  // Obtener solicitudes de membresía pendientes
  getPendingMembershipRequests: async (): Promise<any[]> => {
    const response = await apiClient.get(`/api/membership-requests/pending`);
    return response.data;
  },

  // Obtener icono de notificación por tipo
  getNotificationIcon: (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SYSTEM:
        return '⚙️';
      case NotificationType.DONATION:
        return '🎁';
      case NotificationType.EXCHANGE:
        return '🔄';
      case NotificationType.PRODUCT:
        return '📦';
      case NotificationType.COMMUNITY:
        return '👥';
      case NotificationType.COMMUNITY_REQUEST:
        return '📝';
      case NotificationType.MESSAGE:
        return '💬';
      case NotificationType.WISHLIST:
        return '📋';
      case NotificationType.ACHIEVEMENT:
        return '🏆';
      case NotificationType.GENERAL:
        return '📢';
      default:
        return '📌';
    }
  },

  // Obtener color de notificación por tipo
  getNotificationColor: (type: NotificationType): string => {
    switch (type) {
      case NotificationType.SYSTEM:
        return '#9C27B0';
      case NotificationType.DONATION:
        return '#FF9800';
      case NotificationType.EXCHANGE:
        return '#4CAF50';
      case NotificationType.PRODUCT:
        return '#2196F3';
      case NotificationType.COMMUNITY:
        return '#9C27B0';
      case NotificationType.COMMUNITY_REQUEST:
        return '#FF5722';
      case NotificationType.MESSAGE:
        return '#00BCD4';
      case NotificationType.WISHLIST:
        return '#E91E63';
      case NotificationType.ACHIEVEMENT:
        return '#FFC107';
      case NotificationType.GENERAL:
        return '#607D8B';
      default:
        return '#9E9E9E';
    }
  },

  // Formatear fecha de notificación
  formatDate: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora mismo';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} h`;
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  },
}; 