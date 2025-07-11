import AsyncStorage from '@react-native-async-storage/async-storage';

// Utilidad para extraer información del token JWT
export const tokenUtils = {
  // Obtener el user ID del token actual
  getCurrentUserId: async (): Promise<number | null> => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return null;
      }

      // Decodificar el payload del JWT
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      // Diferentes formas en que puede estar el user ID en el token
      return (
        payload.userId || payload.sub || payload.id || payload.user_id || null
      );
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  },

  // Verificar si el token es válido (no expirado)
  isTokenValid: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return false;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Obtener toda la información del token
  getTokenPayload: async (): Promise<any | null> => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        return null;
      }

      return JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      return null;
    }
  },

  // Guardar token
  saveToken: async (token: string): Promise<void> => {
    try {
      await AsyncStorage.setItem("token", token);
    } catch (error) {
      console.error("Error saving token:", error);
    }
  },

  // Eliminar token
  removeToken: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem("token");
    } catch (error) {
      console.error("Error removing token:", error);
    }
  },

  // Obtener token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  },
}; 