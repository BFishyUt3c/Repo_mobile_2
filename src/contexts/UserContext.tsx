import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import { getUserProfile } from '../services/userService';
import { useAuth } from './AuthContext';

interface UserContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: (userId: number) => Promise<void>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const refreshUser = async (userId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile(userId, token);
      setUser(data);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Puedes cargar el usuario automáticamente aquí si tienes el ID
  // useEffect(() => {
  //   refreshUser(1); // Cambia el ID según corresponda
  // }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser debe usarse dentro de UserProvider');
  return context;
};
