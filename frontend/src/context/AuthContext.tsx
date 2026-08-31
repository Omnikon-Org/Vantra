import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; name?: string; tenantName?: string }) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('vantra_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('vantra_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('vantra_token');
      if (savedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.user);
          localStorage.setItem('vantra_user', JSON.stringify(res.user));
        } catch {
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('vantra_token', res.token);
    localStorage.setItem('vantra_user', JSON.stringify(res.user));
  };

  const register = async (data: { email: string; password: string; name?: string; tenantName?: string }) => {
    const res = await authApi.register(data);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('vantra_token', res.token);
    localStorage.setItem('vantra_user', JSON.stringify(res.user));
  };

  const loginWithToken = async (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('vantra_token', newToken);
    try {
      const res = await authApi.getMe();
      setUser(res.user);
      localStorage.setItem('vantra_user', JSON.stringify(res.user));
    } catch (err) {
      logout();
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vantra_token');
    localStorage.removeItem('vantra_user');
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      setUser(res.user);
      localStorage.setItem('vantra_user', JSON.stringify(res.user));
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        register,
        loginWithToken,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
