import { apiClient } from '../config/apiClient';
import { CommunityResponseDto, CommunitySummaryDto } from '../types/community';
import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/api/communities`;

export const communityService = {
  // Obtener todas las comunidades
  getAllCommunities: async (): Promise<CommunityResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}`);
    return response.data;
  },

  // Obtener comunidades del usuario
  getUserCommunities: async (): Promise<CommunityResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/user`);
    return response.data;
  },

  // Obtener comunidad por ID
  getCommunityById: async (communityId: number): Promise<CommunityResponseDto> => {
    const response = await apiClient.get(`${BASE_URL}/${communityId}`);
    return response.data;
  },

  // Crear nueva comunidad
  createCommunity: async (communityData: any): Promise<CommunityResponseDto> => {
    const response = await apiClient.post(`${BASE_URL}`, communityData);
    return response.data;
  },

  // Actualizar comunidad
  updateCommunity: async (communityId: number, communityData: any): Promise<CommunityResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${communityId}`, communityData);
    return response.data;
  },

  // Eliminar comunidad
  deleteCommunity: async (communityId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${communityId}`);
  },

  // Unirse a una comunidad
  joinCommunity: async (communityId: number): Promise<void> => {
    await apiClient.post(`${BASE_URL}/${communityId}/join`);
  },

  // Salir de una comunidad
  leaveCommunity: async (communityId: number): Promise<void> => {
    await apiClient.post(`${BASE_URL}/${communityId}/leave`);
  },

  // Verificar membresía
  checkMembership: async (communityId: number): Promise<boolean> => {
    const response = await apiClient.get(`${BASE_URL}/${communityId}/membership`);
    return response.data;
  },

  // Buscar comunidades
  searchCommunities: async (params: {
    name?: string;
    location?: string;
    minMembers?: number;
    maxMembers?: number;
  }): Promise<CommunityResponseDto[]> => {
    const queryParams = new URLSearchParams();
    if (params.name) queryParams.append('name', params.name);
    if (params.location) queryParams.append('location', params.location);
    if (params.minMembers) queryParams.append('minMembers', params.minMembers.toString());
    if (params.maxMembers) queryParams.append('maxMembers', params.maxMembers.toString());

    const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
    return response.data;
  },

  // Obtener comunidades populares
  getPopularCommunities: async (limit: number = 10): Promise<CommunityResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/popular?limit=${limit}`);
    return response.data;
  },

  // Obtener comunidades recientes
  getRecentCommunities: async (limit: number = 10): Promise<CommunityResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/recent?limit=${limit}`);
    return response.data;
  },

  // Obtener miembros de una comunidad
  getCommunityMembers: async (communityId: number): Promise<any[]> => {
    const response = await apiClient.get(`${BASE_URL}/${communityId}/members`);
    return response.data;
  },

  // Solicitar membresía (para comunidades privadas)
  requestMembership: async (communityId: number, message?: string): Promise<any> => {
    const response = await apiClient.post(`${BASE_URL}/${communityId}/request-membership`, {
      message
    });
    return response.data;
  },

  // Obtener solicitudes de membresía pendientes
  getPendingMembershipRequests: async (): Promise<any[]> => {
    const response = await apiClient.get(`${BASE_URL}/membership-requests/pending`);
    return response.data;
  },

  // Responder a solicitud de membresía
  respondToMembershipRequest: async (
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
}; 