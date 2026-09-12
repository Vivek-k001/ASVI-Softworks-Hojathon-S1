import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('pmna_token'));
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setBusiness(res.data.business || null);
      }
    } catch (err) {
      console.warn('Session expired or not logged in', err.response?.data?.message);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('pmna_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setBusiness(res.data.business || null);
      return res.data;
    }
  };

  const registerCustomer = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data.success) {
      localStorage.setItem('pmna_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
  };

  const registerBusiness = async (data) => {
    const res = await api.post('/auth/business/register', data);
    if (res.data.success) {
      localStorage.setItem('pmna_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setBusiness(res.data.business || null);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('pmna_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
  };

  const refreshUser = () => {
    if (token) fetchCurrentUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        token,
        loading,
        login,
        registerCustomer,
        registerBusiness,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isBusiness: user?.role === 'business',
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
