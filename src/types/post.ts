export interface PostRequestDto {
  title: string;
  content: string;
  imageUrl?: string;
  wanted: 'DONATION' | 'EXCHANGE';
  location?: string;
}

export interface PostResponseDto {
  postId: number;
  username: string;
  title: string;
  content: string;
  imageUrl?: string;
  wanted: 'DONATION' | 'EXCHANGE';
  location?: string;
  publishedAt: string;
  likesCount: number;
  hasLiked: boolean;
} 