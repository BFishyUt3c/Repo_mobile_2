import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import { getUserProfile } from '../services/userService';
import { useAuth } from '../hooks/useAuth';

interface UserContextProps {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: (userId: number) => Promise<void>;
}

export const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { token, user: authUser } = useAuth();

  const refreshUser = async (userId: number) => {
    if (!token) {
      setError('No hay token de autenticación');
      return;
    }
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

  useEffect(() => {
    if (token && authUser && authUser.id) {
      refreshUser(authUser.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authUser?.id]);

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
