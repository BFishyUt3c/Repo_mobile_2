import { CommunityResponseDto } from './community';

// Tipado de rutas principales y stacks
export type RootStackParamList = {
  Home: undefined;
  Products: undefined;
  ProductList: undefined;
  ProductDetail: { productId: number };
  CreateEditProduct: { productId?: number };
  Exchanges: undefined;
  ExchangeList: undefined;
  ExchangeDetail: { exchangeId: number };
  CreateExchange: { productId?: number };
  Communities: undefined;
  CommunityList: undefined;
  CommunityDetail: { communityId: number };
  CreateEditCommunity: { community?: CommunityResponseDto };
  Chat: undefined;
  ChatList: undefined;
  ChatDetail: { chatId?: number; userId?: number };
  Profile: undefined;
  ProfileMain: undefined;
  EditProfile: undefined;
  Donations: undefined;
  Wishlist: undefined;
  WishlistDetail: { wishlistId: number };
  CreateEditWishlist: { wishlist?: any };
  Posts: undefined;
  CreatePost: undefined;
  Settings: undefined;
  Statistics: undefined;
  Login: undefined;
  Register: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 