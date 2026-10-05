import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function withHomePath(loggedUser) {
  if (!loggedUser) return loggedUser;
  if (loggedUser.homePath) return loggedUser;
  loggedUser.homePath = loggedUser.role === 'SUPER_ADMIN' ? '/management/superadmin'
    : loggedUser.role === 'RESTAURANT_ADMIN' || loggedUser.role === 'RESTAURANT_STAFF' ? '/management/admin'
    : '/discover';
  return loggedUser;
}

function persistUser(loggedUser) {
  if (loggedUser) {
    localStorage.setItem('dine_bennett_user', JSON.stringify(loggedUser));
  } else {
    localStorage.removeItem('dine_bennett_user');
  }
  localStorage.removeItem('dine_bennett_token');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dine_bennett_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function validateSession() {
      try {
        const res = await api.auth.getMe();
        if (res.success && res.data) {
          const loggedUser = withHomePath(res.data);
          persistUser(loggedUser);
          setUser(loggedUser);
        } else {
          persistUser(null);
          setUser(null);
        }
      } catch {
        persistUser(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    validateSession();
  }, []);

  useEffect(() => {
    persistUser(user);
  }, [user]);

  const sendOtp = async (email) => {
    setLoading(true);
    try {
      const res = await api.auth.sendOtp(email);
      setLoading(false);
      return res;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const applySession = (res, fallbackError) => {
    if (res.success && res.data?.user) {
      const loggedUser = withHomePath(res.data.user);
      persistUser(loggedUser);
      setUser(loggedUser);
      return loggedUser;
    }
    throw new Error(res.error || fallbackError);
  };

  const verifyOtp = async (email, otp, name) => {
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(email, otp, name);
      const loggedUser = applySession(res, 'OTP verification failed');
      setLoading(false);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const login = async (email, password) => {
    if (!password) {
      throw new Error('Password is required');
    }
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      const loggedUser = applySession(res, 'Invalid credentials');
      setLoading(false);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const googleLogin = async (data) => {
    setLoading(true);
    try {
      const res = await api.auth.googleLogin(data);
      const loggedUser = applySession(res, 'Google login failed');
      setLoading(false);
      return loggedUser;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await api.auth.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: 'STUDENT',
        department: userData.department
      });
      if (!res.success) {
        throw new Error(res.error || 'Registration failed');
      }
      setLoading(false);
      return res.data?.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.auth.logout();
    } catch {
      // cookie clear is best-effort
    }
    persistUser(null);
    setUser(null);
  }, []);

  const setVerified = (status = true) => {
    if (user) {
      const updated = { ...user, verified: status };
      setUser(updated);
    }
  };

  const value = {
    user,
    setUser,
    setVerified,
    isAuthenticated: !!user,
    loading,
    login,
    googleLogin,
    sendOtp,
    verifyOtp,
    signup,
    logout,
    switchRole: async () => {
      throw new Error('Role impersonation is disabled');
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
