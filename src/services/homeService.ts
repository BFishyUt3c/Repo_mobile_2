import { DashboardStatsDto } from '../types/DashboardStatsDto';
import { RecentActivityDto } from '../types/RecentActivityDto';

const API_URL = 'http://192.168.0.11:8081/api/dashboard';

export async function getDashboardStats(): Promise<DashboardStatsDto> {
  const res = await fetch(`${API_URL}/stats`);
  if (!res.ok) throw new Error('Error al obtener estadísticas globales');
  return res.json();
}

export async function getRecentActivity(limit = 10): Promise<RecentActivityDto[]> {
  const res = await fetch(`${API_URL}/activity/recent?limit=${limit}`);
  if (!res.ok) throw new Error('Error al obtener actividad reciente');
  return res.json();
}
