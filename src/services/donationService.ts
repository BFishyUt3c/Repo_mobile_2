import { apiClient } from '../config/apiClient';
import { 
  DonationResponseDto, 
  DonationSummaryDto, 
  DonationRequestDto, 
  DonationUpdateDto,
  DonationStatisticsDto 
} from '../types/donation';

const BASE_URL = 'http://192.168.0.11:8081/api/donations';

export const donationService = {
  // Crear una nueva donación
  createDonation: async (donationRequest: DonationRequestDto): Promise<DonationResponseDto> => {
    const response = await apiClient.post(`${BASE_URL}`, donationRequest);
    return response.data;
  },

  // Obtener todas las donaciones disponibles
  getAllAvailableDonations: async (): Promise<DonationSummaryDto[]> => {
    const response = await apiClient.get(`${BASE_URL}`);
    return response.data;
  },

  // Obtener donaciones del usuario
  getUserDonations: async (): Promise<DonationSummaryDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/user`);
    return response.data;
  },

  // Obtener donación por ID
  getDonationById: async (id: number): Promise<DonationResponseDto> => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Solicitar una donación
  requestDonation: async (donationId: number): Promise<DonationResponseDto> => {
    const response = await apiClient.post(`${BASE_URL}/${donationId}/request`);
    return response.data;
  },

  // Actualizar estado de donación
  updateDonationStatus: async (
    donationId: number, 
    updateDto: DonationUpdateDto
  ): Promise<DonationResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${donationId}`, updateDto);
    return response.data;
  },

  // Obtener estadísticas de donaciones del usuario
  getUserDonationStatistics: async (): Promise<DonationStatisticsDto> => {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data;
  },
}; 