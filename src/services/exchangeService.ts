import { apiClient } from '../config/apiClient';
import { ExchangeResponse, ExchangeRequest, ExchangeStatistics } from '../types/exchange';
import { ProductResponseDto } from '../types/product';

const BASE_URL = 'http://192.168.0.11:8081/api/exchanges';

export const exchangeService = {
  // Solicitar un intercambio
  requestExchange: async (exchangeRequest: ExchangeRequest): Promise<ExchangeResponse> => {
    const response = await apiClient.post(`${BASE_URL}`, exchangeRequest);
    return response.data;
  },

  // Aceptar un intercambio
  acceptExchange: async (exchangeId: number): Promise<ExchangeResponse> => {
    const response = await apiClient.put(`${BASE_URL}/${exchangeId}/accept`);
    return response.data;
  },

  // Rechazar un intercambio
  rejectExchange: async (exchangeId: number): Promise<ExchangeResponse> => {
    const response = await apiClient.put(`${BASE_URL}/${exchangeId}/reject`);
    return response.data;
  },

  // Completar un intercambio
  completeExchange: async (exchangeId: number): Promise<ExchangeResponse> => {
    const response = await apiClient.put(`${BASE_URL}/${exchangeId}/complete`);
    return response.data;
  },

  // Cancelar un intercambio
  cancelExchange: async (exchangeId: number): Promise<ExchangeResponse> => {
    const response = await apiClient.put(`${BASE_URL}/${exchangeId}/cancel`);
    return response.data;
  },

  // Obtener intercambios solicitados por el usuario
  getRequestedExchanges: async (): Promise<ExchangeResponse[]> => {
    const response = await apiClient.get(`${BASE_URL}/requested`);
    return response.data;
  },

  // Obtener intercambios proporcionados por el usuario
  getProvidedExchanges: async (): Promise<ExchangeResponse[]> => {
    const response = await apiClient.get(`${BASE_URL}/provided`);
    return response.data;
  },

  // Obtener productos disponibles para intercambio
  getAvailableProductsForExchange: async (
    category?: string, 
    search?: string
  ): Promise<ProductResponseDto[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    
    const response = await apiClient.get(`${BASE_URL}/available-products?${params.toString()}`);
    return response.data;
  },

  // Obtener productos del usuario para intercambio
  getMyProductsForExchange: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/my-products`);
    return response.data;
  },

  // Obtener estadísticas de intercambios
  getExchangeStatistics: async (): Promise<ExchangeStatistics> => {
    const response = await apiClient.get(`${BASE_URL}/statistics`);
    return response.data;
  },
}; 