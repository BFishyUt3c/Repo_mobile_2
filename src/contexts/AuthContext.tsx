import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextProps {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
}

const API_URL = 'http://192.168.0.11:8081';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Nueva función para validar el token con el backend
  const validateToken = async (tokenToValidate: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/validate`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${tokenToValidate}` }
      });
      if (!res.ok) throw new Error('Token inválido');
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
      const res = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'USER' })
      });
      if (!res.ok) throw new Error('Credenciales incorrectas');
      const data = await res.json();
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
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('No se pudo registrar');
      const resp = await res.json();
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
