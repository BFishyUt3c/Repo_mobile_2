import { CommunityDto } from './CommunityDto';
import { WishListSummaryDto } from './WishListSummaryDto';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  description: string;
  joinedAt: string;
  points: number;
  level: string;
  itemsDonated: number;
  itemsExchanged: number;
  role: string;
  communities: CommunityDto[];
  wishLists: WishListSummaryDto[];
  totalProductsCount: number;
  totalPostsCount: number;
}
