import { apiClient } from '../config/apiClient';
import { ProductResponseDto, Category, Condition, ProductStatus } from '../types/product';
import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/api/products`;

export const productService = {
  // Obtener todos los productos
  getAllProducts: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}`);
    return response.data;
  },

  // Obtener productos del usuario
  getUserProducts: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/user`);
    return response.data;
  },

  // Obtener producto por ID
  getProductById: async (productId: number): Promise<ProductResponseDto> => {
    const response = await apiClient.get(`${BASE_URL}/${productId}`);
    return response.data;
  },

  // Crear nuevo producto
  createProduct: async (productData: {
    productName: string;
    description: string;
    category: Category;
    condition: Condition;
    estimatedValue: number;
    availableForExchange: boolean;
    exchangePreferences?: string;
    imageUrl?: string;
  }): Promise<ProductResponseDto> => {
    const response = await apiClient.post(`${BASE_URL}`, productData);
    return response.data;
  },

  // Actualizar producto
  updateProduct: async (productId: number, productData: {
    productName?: string;
    description?: string;
    category?: Category;
    condition?: Condition;
    estimatedValue?: number;
    availableForExchange?: boolean;
    exchangePreferences?: string;
    imageUrl?: string;
  }): Promise<ProductResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${productId}`, productData);
    return response.data;
  },

  // Eliminar producto
  deleteProduct: async (productId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${productId}`);
  },

  // Buscar productos
  searchProducts: async (params: {
    search?: string;
    category?: Category;
    condition?: Condition;
    minValue?: number;
    maxValue?: number;
    availableForExchange?: boolean;
  }): Promise<ProductResponseDto[]> => {
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.condition) queryParams.append('condition', params.condition);
    if (params.minValue) queryParams.append('minValue', params.minValue.toString());
    if (params.maxValue) queryParams.append('maxValue', params.maxValue.toString());
    if (params.availableForExchange !== undefined) {
      queryParams.append('availableForExchange', params.availableForExchange.toString());
    }

    const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
    return response.data;
  },

  // Obtener productos por categoría
  getProductsByCategory: async (category: Category): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/category/${category}`);
    return response.data;
  },

  // Obtener productos por condición
  getProductsByCondition: async (condition: Condition): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/condition/${condition}`);
    return response.data;
  },

  // Obtener productos disponibles para intercambio
  getAvailableForExchange: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/available-for-exchange`);
    return response.data;
  },

  // Obtener productos recientes
  getRecentProducts: async (limit: number = 10): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/recent?limit=${limit}`);
    return response.data;
  },

  // Obtener productos populares
  getPopularProducts: async (limit: number = 10): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/popular?limit=${limit}`);
    return response.data;
  },

  // Cambiar estado de producto
  updateProductStatus: async (productId: number, status: ProductStatus): Promise<ProductResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${productId}/status`, { status });
    return response.data;
  },

  // Toggle disponibilidad para intercambio
  toggleExchangeAvailability: async (productId: number): Promise<ProductResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${productId}/toggle-exchange`);
    return response.data;
  },

  // Agregar producto a wishlist
  addToWishlist: async (productId: number): Promise<void> => {
    await apiClient.post(`${BASE_URL}/${productId}/wishlist`);
  },

  // Remover producto de wishlist
  removeFromWishlist: async (productId: number): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${productId}/wishlist`);
  },

  // Obtener productos en wishlist del usuario
  getUserWishlist: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/wishlist`);
    return response.data;
  },

  // Obtener estadísticas de productos del usuario
  getUserProductStatistics: async (): Promise<{
    totalProducts: number;
    availableProducts: number;
    exchangedProducts: number;
    donatedProducts: number;
    averageValue: number;
  }> => {
    const response = await apiClient.get(`${BASE_URL}/statistics/user`);
    return response.data;
  },

  // Obtener productos similares
  getSimilarProducts: async (productId: number, limit: number = 5): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/${productId}/similar?limit=${limit}`);
    return response.data;
  },

  // Obtener productos por rango de precio
  getProductsByPriceRange: async (minPrice: number, maxPrice: number): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/price-range?min=${minPrice}&max=${maxPrice}`);
    return response.data;
  },

  // Obtener productos por ubicación
  getProductsByLocation: async (location: string): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/location/${encodeURIComponent(location)}`);
    return response.data;
  },

  // Marcar producto como reservado
  reserveProduct: async (productId: number): Promise<ProductResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${productId}/reserve`);
    return response.data;
  },

  // Liberar producto reservado
  releaseProduct: async (productId: number): Promise<ProductResponseDto> => {
    const response = await apiClient.put(`${BASE_URL}/${productId}/release`);
    return response.data;
  },

  // Obtener productos con descuento
  getDiscountedProducts: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/discounted`);
    return response.data;
  },

  // Obtener productos destacados
  getFeaturedProducts: async (): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`${BASE_URL}/featured`);
    return response.data;
  },
}; 