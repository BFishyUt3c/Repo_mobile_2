export interface RecentActivityDto {
  type: string; // "donation", "exchange", "community", "user_joined"
  userInitial: string;
  userName: string;
  action: string;
  itemName: string;
  createdAt: string; // ISO date string
  timeAgo: string;
}
