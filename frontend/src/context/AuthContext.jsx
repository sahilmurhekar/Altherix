// ============ src/context/AuthContext.jsx ============
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';
  const API_URL = `${SERVER_URL}/api/auth`;

  // Verify token on app load
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    console.log('[AuthContext] useEffect: storedToken exists:', !!storedToken);
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      console.log('[AuthContext] No stored token, setting loading false');
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    console.log('[AuthContext] verifyToken called with token:', tokenToVerify ? 'present' : 'null');
    try {
      console.log('[AuthContext] Making verify request to:', `${API_URL}/verify`);
      const res = await fetch(`${API_URL}/verify`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      console.log('[AuthContext] verifyToken response status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('[AuthContext] verifyToken success, user:', data.user);
        axios.defaults.headers.common['Authorization'] = `Bearer ${tokenToVerify}`;
        setUser(data.user);
        setToken(tokenToVerify);
        console.log('[AuthContext] User and token set successfully');
      } else {
        const errorText = await res.text();
        console.log('[AuthContext] verifyToken failed, status:', res.status, 'response:', errorText);
        localStorage.removeItem('token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('[AuthContext] Token verification failed:', err);
      localStorage.removeItem('token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('[AuthContext] login called with email:', email);
    setLoading(true);
    setError(null);
    try {
      console.log('[AuthContext] Making login request to:', `${API_URL}/login`);
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      console.log('[AuthContext] Login response status:', res.status);
      const data = await res.json();
      console.log('[AuthContext] Login response data:', data);
      if (res.ok) {
        console.log('[AuthContext] Login successful, storing token:', data.token ? 'present' : 'missing');
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);
        console.log('[AuthContext] User set to:', data.user);
        return data.user;
      } else {
        console.log('[AuthContext] Login failed with message:', data.message);
        setError(data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      console.error('[AuthContext] Login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerPatient = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/register-patient`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);
        return data.user;
      } else {
        setError(data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerDoctor = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/register-doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setToken(data.token);
        setUser(data.user);
        return data.user;
      } else {
        setError(data.message);
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        registerPatient,
        registerDoctor,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
