export enum Category {
  ELECTRONICS = 'ELECTRONICS',
  CLOTHING = 'CLOTHING',
  BOOKS = 'BOOKS',
  HOME = 'HOME',
  SPORTS = 'SPORTS',
  TOYS = 'TOYS',
  OTHER = 'OTHER'
}

export enum Condition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR'
}

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  DONATED = 'DONATED'
}

export interface ProductResponseDto {
  productId: number;
  ownerName: string;
  productName: string;
  description: string;
  imageUrl: string;
  category: Category;
  condition: Condition;
  availableForExchange: boolean;
  exchangePreferences: string;
  estimatedValue: number;
  createdAt: string;
  status: ProductStatus;
  userId: number;
  belongsToCurrentUser: boolean;
  inWishList: boolean;
} 