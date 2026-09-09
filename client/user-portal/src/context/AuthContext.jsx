import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';


const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dine_bennett_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Sync token & user session with database on initial load
  useEffect(() => {
    async function validateSession() {
      const token = localStorage.getItem('dine_bennett_token');
      if (token && !user) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('dine_bennett_user', JSON.stringify(res.data));
          }
        } catch {
          // Token expired or invalid
          localStorage.removeItem('dine_bennett_token');
          localStorage.removeItem('dine_bennett_user');
          setUser(null);
        }
      }
    }
    validateSession();
  }, []);

  // Sync user state with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('dine_bennett_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('dine_bennett_user');
      localStorage.removeItem('dine_bennett_token');
    }
  }, [user]);

  // Send 6-digit institutional OTP
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

  // Verify institutional OTP & directly log in as verified user
  const verifyOtp = async (email, otp, name) => {
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(email, otp, name);
      if (res.success && res.data) {
        const loggedUser = res.data.user;
        const token = res.data.token;
        if (!loggedUser.homePath) {
          loggedUser.homePath = loggedUser.role === 'SUPER_ADMIN' ? '/management/superadmin'
            : loggedUser.role === 'RESTAURANT_ADMIN' ? '/management/admin'
            : loggedUser.role === 'RESTAURANT_STAFF' ? '/management/staff'
            : '/dashboard';
        }
        localStorage.setItem('dine_bennett_token', token);
        localStorage.setItem('dine_bennett_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return loggedUser;
      }
      throw new Error(res.error || 'OTP verification failed');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Login action against backend API with RBAC token issuance
  const login = async (email, password = 'password123') => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      if (res.success && res.data) {
        const loggedUser = res.data.user;
        const token = res.data.token;
        if (!loggedUser.homePath) {
          loggedUser.homePath = loggedUser.role === 'SUPER_ADMIN' ? '/management/superadmin'
            : loggedUser.role === 'RESTAURANT_ADMIN' ? '/management/admin'
            : loggedUser.role === 'RESTAURANT_STAFF' ? '/management/staff'
            : '/dashboard';
        }
        localStorage.setItem('dine_bennett_token', token);
        localStorage.setItem('dine_bennett_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
        setLoading(false);
        return loggedUser;
      }
      throw new Error(res.error || 'Invalid credentials');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Sign up action with backend database persistence
  const signup = async (userData) => {
    setLoading(true);
    try {
      const res = await api.auth.register({
        name: userData.name,
        email: userData.email,
        password: userData.password || 'password123',
        role: userData.role || 'STUDENT',
        department: userData.department || 'Bennett University'
      });

      if (res.success && res.data) {
        const newUser = res.data.user;
        if (!newUser.homePath) {
          newUser.homePath = newUser.role === 'SUPER_ADMIN' ? '/management/superadmin'
            : newUser.role === 'RESTAURANT_ADMIN' ? '/management/admin'
            : newUser.role === 'RESTAURANT_STAFF' ? '/management/staff'
            : '/dashboard';
        }
        localStorage.setItem('dine_bennett_token', res.data.token);
        localStorage.setItem('dine_bennett_user', JSON.stringify(newUser));
        setUser(newUser);
        setLoading(false);
        return newUser;
      }
      throw new Error(res.error || 'Registration failed');
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Switch role directly with real database accounts
  const switchRole = async (roleKey) => {
    try {
      const res = await api.auth.switchRole(roleKey);
      if (res.success && res.data) {
        const switchedUser = res.data.user;
        if (!switchedUser.homePath) {
          switchedUser.homePath = switchedUser.role === 'SUPER_ADMIN' ? '/management/superadmin'
            : switchedUser.role === 'RESTAURANT_ADMIN' ? '/management/admin'
            : switchedUser.role === 'RESTAURANT_STAFF' ? '/management/staff'
            : '/dashboard';
        }
        localStorage.setItem('dine_bennett_token', res.data.token);
        localStorage.setItem('dine_bennett_user', JSON.stringify(switchedUser));
        setUser(switchedUser);
        return switchedUser;
      }
      throw new Error(res.error || `No account found for role ${roleKey}`);
    } catch (err) {
      console.error('switchRole error:', err.message);
      throw err;
    }
  };

  // Logout action
  const logout = () => {
    setUser(null);
    localStorage.removeItem('dine_bennett_user');
    localStorage.removeItem('dine_bennett_token');
  };

  const setVerified = (status = true) => {
    if (user) {
      const updated = { ...user, verified: status };
      setUser(updated);
      localStorage.setItem('dine_bennett_user', JSON.stringify(updated));
    }
  };

  const value = {
    user,
    setUser,
    setVerified,
    isAuthenticated: !!user,
    loading,
    login,
    sendOtp,
    verifyOtp,
    signup,
    logout,
    switchRole
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
