import AsyncStorage from '@react-native-async-storage/async-storage';

// Función utilitaria para decodificar JWT sin dependencias externas
export const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

// Función para obtener el ID del usuario actual desde el token
export const getCurrentUserIdFromToken = async (): Promise<number | null> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const payload = decodeJWT(token);
    if (!payload) return null;

    // El ID del usuario puede estar en diferentes campos dependiendo de cómo esté configurado el JWT
    return payload.sub || payload.userId || payload.id || null;
  } catch (error) {
    console.error("Error getting user ID from token:", error);
    return null;
  }
};

// Función para obtener todos los datos del usuario desde el token
export const getCurrentUserFromToken = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const payload = decodeJWT(token);
    return payload;
  } catch (error) {
    console.error("Error getting user from token:", error);
    return null;
  }
};

// Función para verificar si el token es válido (no expirado)
export const isTokenValid = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return false;

    const payload = decodeJWT(token);
    if (!payload) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp > currentTime;
  } catch (error) {
    console.error("Error checking token validity:", error);
    return false;
  }
}; 