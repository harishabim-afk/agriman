import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('agroharvest_token'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and verify existing session
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('agroharvest_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
      } catch (err) {
        console.warn('Session verification failed, clearing token:', err);
        localStorage.removeItem('agroharvest_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const data = await api.login({ email, password });
      localStorage.setItem('agroharvest_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setAuthError(err.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData) => {
    setAuthError(null);
    try {
      const data = await api.register(userData);
      localStorage.setItem('agroharvest_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
      throw err;
    }
  };

  const quickLogin = async (targetRole) => {
    const credentials = {
      buyer: { email: 'buyer@agroharvest.com', password: 'Buyer@123' },
      seller: { email: 'seller@agroharvest.com', password: 'Seller@123' },
      admin: { email: 'admin@agroharvest.com', password: 'Admin@123' },
    };

    const cred = credentials[targetRole];
    if (cred) {
      return login(cred.email, cred.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('agroharvest_token');
    setToken(null);
    setUser(null);
    setAuthError(null);
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || 'guest',
        isAuthenticated: !!user,
        loading,
        authError,
        login,
        register,
        quickLogin,
        logout,
        updateUser,
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
