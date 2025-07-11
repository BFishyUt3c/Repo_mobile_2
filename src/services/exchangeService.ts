import { apiClient } from '../config/apiClient';
import { ExchangeResponse, ExchangeRequest, ExchangeStatistics } from '../types/exchange';
import { ProductResponseDto } from '../types/product';
import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/api/exchanges`;

export const exchangeService = {
  // Solicitar un intercambio
  requestExchange: async (exchangeRequest: ExchangeRequest): Promise<ExchangeResponse> => {
    const response = await apiClient.post(`${BASE_URL}/request`, exchangeRequest);
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

  // Obtener todos los intercambios del usuario
  getUserExchanges: async (): Promise<ExchangeResponse[]> => {
    const response = await apiClient.get(`${BASE_URL}/user`);
    return response.data;
  },

  // Obtener intercambio por ID
  getExchangeById: async (exchangeId: number): Promise<ExchangeResponse> => {
    const response = await apiClient.get(`${BASE_URL}/${exchangeId}`);
    return response.data;
  },

  // Obtener productos disponibles para intercambio
  getAvailableProducts: async (
    category?: string, 
    search?: string
  ): Promise<ProductResponseDto[]> => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);

    const response = await apiClient.get(`${BASE_URL}/available-products?${params}`);
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

  // Verificar si un producto puede ser intercambiado
  canProductBeExchanged: (product: ProductResponseDto): boolean => {
    return product.availableForExchange && product.status === 'AVAILABLE';
  },

  // Buscar intercambios
  searchExchanges: async (searchTerm: string): Promise<ExchangeResponse[]> => {
    const response = await apiClient.get(`${BASE_URL}/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Obtener intercambios por estado
  getExchangesByStatus: async (status: string): Promise<ExchangeResponse[]> => {
    const response = await apiClient.get(`${BASE_URL}/status/${status}`);
    return response.data;
  },
}; 