import { apiClient } from '../config/apiClient';
import { PostRequestDto, PostResponseDto } from '../types/post';

export const postService = {
  getAllPosts: async (): Promise<PostResponseDto[]> => {
    const response = await apiClient.get('/api/posts');
    return response.data;
  },
  createPost: async (post: PostRequestDto): Promise<PostResponseDto> => {
    const response = await apiClient.post('/api/posts', post);
    return response.data;
  },
  getPostById: async (postId: number): Promise<PostResponseDto> => {
    const response = await apiClient.get(`/api/posts/${postId}`);
    return response.data;
  },
  likePost: async (postId: number): Promise<PostResponseDto> => {
    const response = await apiClient.post(`/api/posts/${postId}/like`);
    return response.data;
  },
  unlikePost: async (postId: number): Promise<PostResponseDto> => {
    const response = await apiClient.post(`/api/posts/${postId}/unlike`);
    return response.data;
  },
}; 