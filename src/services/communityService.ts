import { apiClient } from '../config/apiClient';
import { CommunityResponseDto, CommunitySummaryDto, CommunitySearchDto } from '../types/community';

const BASE_URL = 'http://192.168.0.11:8081/api/communities';

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
  getCommunityById: async (id: number): Promise<CommunityResponseDto> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Buscar comunidades
  searchCommunities: async (searchDto: CommunitySearchDto): Promise<CommunityResponseDto[]> => {
    const params = new URLSearchParams();
    if (searchDto.name) params.append('name', searchDto.name);
    if (searchDto.location) params.append('location', searchDto.location);
    if (searchDto.minMembers) params.append('minMembers', searchDto.minMembers.toString());
    if (searchDto.maxMembers) params.append('maxMembers', searchDto.maxMembers.toString());
    
    const response = await apiClient.get(`${BASE_URL}/search?${params.toString()}`);
    return response.data;
  },

  // Obtener comunidades populares
  getPopularCommunities: async (limit: number = 10): Promise<CommunitySummaryDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/popular?limit=${limit}`);
    return response.data;
  },

  // Obtener comunidades recientes
  getRecentCommunities: async (limit: number = 10): Promise<CommunitySummaryDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/recent?limit=${limit}`);
    return response.data;
  },

  // Unirse a una comunidad
  joinCommunity: async (communityId: number): Promise<CommunityResponseDto> => {
    const response = await apiClient.post(`${BASE_URL}/${communityId}/join`);
    return response.data;
  },

  // Abandonar una comunidad
  leaveCommunity: async (communityId: number): Promise<CommunityResponseDto> => {
    const response = await apiClient.post(`${BASE_URL}/${communityId}/leave`);
    return response.data;
  },

  // Verificar membresía
  checkMembership: async (communityId: number): Promise<boolean> => {
    const response = await apiClient.get(`${BASE_URL}/${communityId}/membership/check`);
    return response.data;
  },

  // Obtener estadísticas de la comunidad
  getCommunityStats: async (communityId: number): Promise<any> => {
    const response = await apiClient.get(`${BASE_URL}/${communityId}/stats`);
    return response.data;
  },
}; 