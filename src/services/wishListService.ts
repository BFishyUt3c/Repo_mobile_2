import { apiClient } from '../config/apiClient';
import { WishListSummaryDto } from '../types/WishListSummaryDto';
import { ProductResponseDto } from '../types/product';

export const wishListService = {
  getUserWishLists: async (): Promise<WishListSummaryDto[]> => {
    const response = await apiClient.get('/api/wishlists');
    return response.data;
  },
  getWishList: async (wishlistId: number): Promise<any> => {
    const response = await apiClient.get(`/api/wishlists/${wishlistId}`);
    return response.data;
  },
  createWishList: async (data: any): Promise<WishListSummaryDto> => {
    const response = await apiClient.post('/api/wishlists', data);
    return response.data;
  },
  updateWishList: async (wishlistId: number, data: any): Promise<WishListSummaryDto> => {
    const response = await apiClient.put(`/api/wishlists/${wishlistId}`, data);
    return response.data;
  },
  deleteWishList: async (wishlistId: number): Promise<void> => {
    await apiClient.delete(`/api/wishlists/${wishlistId}`);
  },
  addToWishList: async (wishlistId: number, productId: number): Promise<any> => {
    const response = await apiClient.post(`/api/wishlists/${wishlistId}/add`, { productId });
    return response.data;
  },
  removeFromWishList: async (wishlistId: number, productId: number): Promise<any> => {
    const response = await apiClient.post(`/api/wishlists/${wishlistId}/remove`, { productId });
    return response.data;
  },
  getMatchingProducts: async (wishlistId: number): Promise<ProductResponseDto[]> => {
    const response = await apiClient.get(`/api/wishlists/${wishlistId}/matching-products`);
    return response.data;
  },
}; 