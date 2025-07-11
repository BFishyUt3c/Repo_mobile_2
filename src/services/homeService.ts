import { apiClient } from '../config/apiClient';
import { DashboardStatsDto } from '../types/DashboardStatsDto';
import { RecentActivityDto } from '../types/RecentActivityDto';
import Constants from 'expo-constants';

const BASE_URL = `${Constants.expoConfig?.extra?.API_URL}/api/dashboard`;

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  const response = await apiClient.get(`${BASE_URL}/stats`);
  return response.data;
}

export async function getRecentActivity(limit = 10): Promise<RecentActivityDto[]> {
  const response = await apiClient.get(`${BASE_URL}/activity/recent?limit=${limit}`);
  return response.data;
}
