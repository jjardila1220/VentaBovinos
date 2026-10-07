import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/database.ts';
import { authService, AUTH_CHANGE_EVENT } from '../services/authService.ts';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isVendor: boolean;
  isClient: boolean;
  canAccessAdmin: boolean;
  login: (email: string, pass: string) => void;
  register: (data: { name: string; email: string; phone: string; password: string }) => void;
  logout: () => void;
  quickLoginAs: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser());
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange);
    };
  }, []);

  const login = (email: string, pass: string) => {
    const logged = authService.login(email, pass);
    setUser(logged);
  };

  const register = (data: { name: string; email: string; phone: string; password: string }) => {
    const registered = authService.register(data);
    setUser(registered);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const quickLoginAs = (role: UserRole) => {
    if (role === 'Administrador') {
      login('admin@ganadocarnes.com', 'admin123');
    } else if (role === 'Vendedor') {
      login('vendedor@ganadocarnes.com', 'vendedor123');
    } else {
      login('cliente@ganadocarnes.com', 'cliente123');
    }
  };

  const isAdmin = user?.role === 'Administrador';
  const isVendor = user?.role === 'Vendedor';
  const isClient = user?.role === 'Cliente';
  const canAccessAdmin = isAdmin || isVendor;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isVendor,
        isClient,
        canAccessAdmin,
        login,
        register,
        logout,
        quickLoginAs
      }}
    >
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
