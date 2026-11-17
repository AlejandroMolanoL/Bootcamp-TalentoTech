'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  globalError: string | null;
  globalSuccess: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  clearAlerts: () => void;
  setError: (msg: string | null) => void;
  setSuccess: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);
  const router = useRouter();

  const clearAlerts = () => {
    setGlobalError(null);
    setGlobalSuccess(null);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Validar token con el backend
        fetchApi('/auth/profile')
          .then((profile) => {
            setUser(profile);
            localStorage.setItem('user', JSON.stringify(profile));
          })
          .catch(() => {
            logout();
          })
          .finally(() => setLoading(false));
      } catch (e) {
        logout();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      clearAlerts();
      try {
        const data = await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });

        setToken(data.accessToken);
        setUser(data.user);
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        setGlobalSuccess(data.message || 'Bienvenido de nuevo');
        return { success: true };
      } catch (err: any) {
        const errorMsg = err.message || 'Error al iniciar sesión';
        setGlobalError(errorMsg);
        return { success: false, error: errorMsg };
      }
    };

      const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        clearAlerts();
        try {
          const data = await fetchApi('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password }),
          });

          setToken(data.accessToken);
          setUser(data.user);
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          setGlobalSuccess(data.message || 'Registro completado con éxito');
          return { success: true };
        } catch (err: any) {
          const errorMsg = err.message || 'Error al registrar usuario';
          setGlobalError(errorMsg);
          return { success: false, error: errorMsg };
        }
      };

      const logout = async () => {
        try {
          if (token) {
            await fetchApi('/auth/logout', { method: 'POST' }).catch(() => { });
          }
        } finally {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          clearAlerts();
          router.push('/login');
        }
      };

      return (
        <AuthContext.Provider
          value={{
            user,
            token,
            loading,
            globalError,
            globalSuccess,
            login,
            register,
            logout,
            clearAlerts,
            setError: setGlobalError,
            setSuccess: setGlobalSuccess,
          }}
        >
          {children}
        </AuthContext.Provider>
      );
    }

    export function useAuth() {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
      }
      return context;
    }
