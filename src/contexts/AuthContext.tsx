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

  // Nueva función para validar el token con el backend
  const validateToken = async (tokenToValidate: string) => {
    try {
      const res = await apiClient.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const load = async () => {
      const savedToken = await AsyncStorage.getItem('token');
      const savedUser = await AsyncStorage.getItem('user');
      if (savedToken && savedUser) {
        // Validar el token con el backend
        const isValid = await validateToken(savedToken);
        if (isValid) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          // Token inválido, forzar logout
          setToken(null);
          setUser(null);
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
        }
      } else {
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
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/signin', { email, password, role: 'USER' });
      const data = response.data;
      setToken(data.token);
      setUser(data.user);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      setLoading(false);
      return true;
    } catch (e) {
      setLoading(false);
      return false;
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/signup', data);
      const resp = response.data;
      setToken(resp.token);
      setUser(resp.user);
      await AsyncStorage.setItem('token', resp.token);
      await AsyncStorage.setItem('user', JSON.stringify(resp.user));
      setLoading(false);
      return true;
    } catch (e) {
      setLoading(false);
      return false;
    }
  };

  const logout = async () => {
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
