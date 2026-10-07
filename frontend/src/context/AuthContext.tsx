import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string; organization?: string; role?: string }) => Promise<void>;
  logout: () => void;
  switchDemoRole: (role: 'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('energytwin_token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.error('Session expired or invalid token', err);
          localStorage.removeItem('energytwin_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    localStorage.setItem('energytwin_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const signup = async (data: any) => {
    const res = await api.signup(data);
    localStorage.setItem('energytwin_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('energytwin_token');
    setToken(null);
    setUser(null);
  };

  const switchDemoRole = async (role: 'super_admin' | 'facility_manager' | 'energy_manager' | 'tenant') => {
    const roleCredentials: Record<string, { email: string; pass: string }> = {
      super_admin: { email: 'admin@energytwin.com', pass: 'admin123' },
      facility_manager: { email: 'facility@energytwin.com', pass: 'facility123' },
      energy_manager: { email: 'energy@energytwin.com', pass: 'energy123' },
      tenant: { email: 'tenant@apextech.com', pass: 'tenant123' },
    };

    const cred = roleCredentials[role];
    if (cred) {
      await login(cred.email, cred.pass);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
