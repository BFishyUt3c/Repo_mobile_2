import { User } from '../types/User';
import { DonationSummaryDto } from '../types/DonationSummaryDto';

const API_URL = 'http://192.168.0.11:8081'; // Ajusta el puerto y endpoint según tu backend

export async function getUserProfile(userId: number, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/user/${userId}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Error al obtener el perfil de usuario');
  }
  return response.json();
}

export async function getUserDonations(token: string): Promise<DonationSummaryDto[]> {
  const response = await fetch(`${API_URL}/api/donations/user`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error('Error al obtener las donaciones del usuario');
  }
  return response.json();
}
