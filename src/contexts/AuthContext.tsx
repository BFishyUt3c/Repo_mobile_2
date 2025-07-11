import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/apiClient';

interface AuthContextProps {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para validar el token con el backend
  const validateToken = async (tokenToValidate: string) => {
    try {
      console.log('🔍 Validando token...');
      const res = await apiClient.get('/auth/me');
      console.log('✅ Token válido:', res.data);
      return true;
    } catch (error: any) {
      console.log('❌ Token inválido:', error.message);
      return false;
    }
  };

  useEffect(() => {
    const load = async () => {
      console.log('🔄 Cargando estado de autenticación...');
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');
      
      if (savedToken && savedUser) {
        console.log('📱 Token encontrado en almacenamiento');
        // Validar el token con el backend
        const isValid = await validateToken(savedToken);
        if (isValid) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          console.log('✅ Usuario autenticado desde almacenamiento');
        } else {
          // Token inválido, forzar logout
          console.log('❌ Token inválido, limpiando datos');
          setToken(null);
          setUser(null);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      } else {
        console.log('📱 No hay token guardado');
        setToken(null);
        setUser(null);
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      }
      setLoading(false);
    };
    load();
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 Intentando login con:', email);
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/signin', { 
        email, 
        password, 
        role: 'USER' 
      });
      
      console.log('✅ Login exitoso:', response.data);
      const data = response.data;
      
      setToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      
      setLoading(false);
      return true;
    } catch (error: any) {
      console.log('❌ Error en login:', error);
      console.log('❌ Error response:', error.response?.data);
      console.log('❌ Error status:', error.response?.status);
      console.log('❌ Error message:', error.message);
      
      setLoading(false);
      return false;
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    console.log('📝 Intentando registro con:', data.email);
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/signup', data);
      console.log('✅ Registro exitoso:', response.data);
      
      const resp = response.data;
      setToken(resp.token);
      setUser(resp.user);
      await AsyncStorage.setItem('token', resp.token);
      await AsyncStorage.setItem('user', JSON.stringify(resp.user));
      
      setLoading(false);
      return true;
    } catch (error: any) {
      console.log('❌ Error en registro:', error);
      console.log('❌ Error response:', error.response?.data);
      console.log('❌ Error status:', error.response?.status);
      console.log('❌ Error message:', error.message);
      
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
    console.log('🚪 Cerrando sesión...');
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
