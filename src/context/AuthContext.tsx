import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index.ts';
import { 
  firebaseRegisterUser, 
  firebaseLoginUser, 
  firebaseAdminLogin 
} from '../lib/firebaseService.ts';

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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mt_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
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
        localStorage.setItem('mt_user', JSON.stringify(data.user));
      }
    } catch {
      // In static site mode, maintain persistent local session
      console.log('Static site mode active: maintaining client session');
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
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('mt_token', data.token);
        localStorage.setItem('mt_user', JSON.stringify(data.user));
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 || res.status === 401) {
        return { success: false, error: data.error || 'Invalid email or password' };
      }
    } catch {
      // Fallback to Firebase directly on Static Site
    }

    // Direct Firebase Cloud fallback
    const fbRes = await firebaseLoginUser(email, pass);
    if (fbRes.success && fbRes.user) {
      const clientToken = 'fb_tok_' + Date.now();
      setUser(fbRes.user);
      setToken(clientToken);
      localStorage.setItem('mt_token', clientToken);
      localStorage.setItem('mt_user', JSON.stringify(fbRes.user));
      return { success: true };
    }
    return { success: false, error: fbRes.error || 'Login failed' };
  };

  const adminLogin = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('mt_token', data.token);
        localStorage.setItem('mt_user', JSON.stringify(data.user));
        return { success: true };
      }
    } catch {
      // Fallback to Firebase direct on Static Site
    }

    const fbRes = await firebaseAdminLogin(email, pass);
    if (fbRes.success && fbRes.user) {
      const clientToken = 'fb_admin_' + Date.now();
      setUser(fbRes.user);
      setToken(clientToken);
      localStorage.setItem('mt_token', clientToken);
      localStorage.setItem('mt_user', JSON.stringify(fbRes.user));
      return { success: true };
    }
    return { success: false, error: fbRes.error || 'Invalid admin credentials.' };
  };

  const register = async (name: string, email: string, phone: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('mt_token', data.token);
        localStorage.setItem('mt_user', JSON.stringify(data.user));
        return { success: true };
      }
      const data = await res.json().catch(() => ({}));
      if (res.status === 400) {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch {
      // Fallback to Firebase directly on Static Site
    }

    // Direct Firebase Cloud registration
    const fbRes = await firebaseRegisterUser(name, email, phone, pass);
    if (fbRes.success && fbRes.user) {
      const clientToken = 'fb_tok_' + Date.now();
      setUser(fbRes.user);
      setToken(clientToken);
      localStorage.setItem('mt_token', clientToken);
      localStorage.setItem('mt_user', JSON.stringify(fbRes.user));
      return { success: true };
    }
    return { success: false, error: fbRes.error || 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('mt_token');
    localStorage.removeItem('mt_user');
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
      localStorage.setItem('mt_user', JSON.stringify(resData.user));
      return { success: true };
    } catch {
      if (user) {
        const updated = { ...user, name: data.name || user.name, phone: data.phone || user.phone };
        setUser(updated);
        localStorage.setItem('mt_user', JSON.stringify(updated));
        return { success: true };
      }
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
