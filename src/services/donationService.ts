import { apiClient } from '../config/apiClient';
import { 
  DonationResponseDto, 
  DonationSummaryDto, 
  DonationRequestDto, 
  DonationUpdateDto,
  DonationStatisticsDto 
} from '../types/donation';
import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/api/donations`;

export const donationService = {
  // Obtener todas las donaciones
  getAllDonations: async (): Promise<DonationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}`);
    return response.data;
  },

  // Obtener donaciones del usuario
  getUserDonations: async (): Promise<DonationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/user`);
    return response.data;
  },

  // Obtener donación por ID
  getDonationById: async (donationId: number): Promise<DonationResponseDto> => {
    const response = await apiClient.get(`${BASE_URL}/${donationId}`);
    return response.data;
  },

  // Crear nueva donación
  createDonation: async (donationData: DonationRequestDto): Promise<DonationResponseDto> => {
    const response = await apiClient.post(`${BASE_URL}`, donationData);
    return response.data;
  },

  // Actualizar donación
  updateDonation: async (donationId: number, updateData: DonationUpdateDto): Promise<DonationResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${donationId}`, updateData);
    return response.data;
  },

  // Eliminar donación
  deleteDonation: async (donationId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${donationId}`);
  },

  // Solicitar donación
  requestDonation: async (donationId: number, message?: string): Promise<any> => {
    const response = await apiClient.post(`${BASE_URL}/${donationId}/request`, {
      message
    });
    return response.data;
  },

  // Aceptar solicitud de donación
  acceptDonationRequest: async (donationId: number, requestId: number): Promise<any> => {
    const response = await apiClient.put(`${BASE_URL}/${donationId}/requests/${requestId}/accept`);
    return response.data;
  },

  // Rechazar solicitud de donación
  rejectDonationRequest: async (donationId: number, requestId: number, reason?: string): Promise<any> => {
    const response = await apiClient.put(`${BASE_URL}/${donationId}/requests/${requestId}/reject`, {
      reason
    });
    return response.data;
  },

  // Obtener solicitudes de donación
  getDonationRequests: async (donationId: number): Promise<any[]> => {
    const response = await apiClient.get(`${BASE_URL}/${donationId}/requests`);
    return response.data;
  },

  // Obtener estadísticas de donaciones del usuario
  getUserDonationStatistics: async (): Promise<DonationStatisticsDto> => {
    const response = await apiClient.get(`${BASE_URL}/statistics/user`);
    return response.data;
  },

  // Obtener estadísticas generales de donaciones
  getGeneralDonationStatistics: async (): Promise<DonationStatisticsDto> => {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data;
  },

  // Buscar donaciones
  searchDonations: async (params: {
    category?: string;
    location?: string;
    status?: string;
    search?: string;
  }): Promise<DonationResponseDto[]> => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.location) queryParams.append('location', params.location);
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);

    const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
    return response.data;
  },

  // Obtener donaciones por categoría
  getDonationsByCategory: async (category: string): Promise<DonationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/category/${category}`);
    return response.data;
  },

  // Obtener donaciones por ubicación
  getDonationsByLocation: async (location: string): Promise<DonationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/location/${encodeURIComponent(location)}`);
    return response.data;
  },

  // Obtener donaciones recientes
  getRecentDonations: async (limit: number = 10): Promise<DonationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/recent?limit=${limit}`);
    return response.data;
  },

  // Marcar donación como completada
  completeDonation: async (donationId: number, receiverNote?: string): Promise<DonationResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${donationId}/complete`, {
      receiverNote
    });
    return response.data;
  },

  // Cancelar donación
  cancelDonation: async (donationId: number, reason?: string): Promise<DonationResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${donationId}/cancel`, {
      reason
    });
    return response.data;
  },

  // Obtener donaciones disponibles para el usuario
  getAvailableDonations: async (): Promise<DonationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/available`);
    return response.data;
  },

  // Obtener historial de donaciones del usuario
  getUserDonationHistory: async (): Promise<DonationResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/user/history`);
    return response.data;
  },
}; 