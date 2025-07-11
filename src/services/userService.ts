import { apiClient } from '../config/apiClient';
import { User } from '../types/User';
import { DonationSummaryDto } from '../types/DonationSummaryDto';

export async function getUserProfile(userId: number, token: string): Promise<User> {
  const response = await apiClient.get(`/user/${userId}/profile`);
  return response.data;
}

export async function getUserDonations(token: string): Promise<DonationSummaryDto[]> {
  const response = await apiClient.get(`/api/donations/user`);
  return response.data;
}

export async function updateProfile(
  data: { firstName: string; lastName: string; address: string; description: string; avatarUrl?: string },
  token: string
): Promise<User> {
  const response = await apiClient.put(`/user/me/profile`, data);
  return response.data;
}
