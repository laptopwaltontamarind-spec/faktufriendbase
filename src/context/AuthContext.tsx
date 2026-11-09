import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, PaymentSubmission } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isPremium: boolean;
  isSimple: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mt_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token invalid or expired
        localStorage.removeItem('mt_token');
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('mt_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error connecting to server' };
    }
  };

  const adminLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Admin login failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('mt_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error connecting to server' };
    }
  };

  const register = async (name: string, email: string, phone: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: pass })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('mt_token', data.token);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during registration' };
    }
  };

  const logout = () => {
    localStorage.removeItem('mt_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  const updateProfile = async (data: { name?: string; phone?: string; currentPassword?: string; newPassword?: string }) => {
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, error: resData.error || 'Update failed' };
      }
      setUser(resData.user);
      return { success: true };
    } catch {
      return { success: false, error: 'Network error during profile update' };
    }
  };

  const isAdmin = user?.role === 'admin';
  const isPremium = user?.role === 'premium' || isAdmin;
  const isSimple = !user || user.role === 'simple';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isPremium,
        isSimple,
        loading,
        login,
        adminLogin,
        register,
        logout,
        refreshUser,
        updateProfile
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
