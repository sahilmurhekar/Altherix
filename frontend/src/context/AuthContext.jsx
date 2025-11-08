// ============ src/context/AuthContext.jsx ============
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000/api/auth';

  // Verify token on app load
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const res = await fetch(`${API_URL}/verify`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(tokenToVerify);
      } else {
        sessionStorage.removeItem('token');
      }
    } catch (err) {
      console.error('Token verification failed:', err);
      sessionStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem('token', data.token);
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
        sessionStorage.setItem('token', data.token);
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
        sessionStorage.setItem('token', data.token);
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
    sessionStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, error, login, registerPatient, registerDoctor, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
