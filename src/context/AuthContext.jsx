import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import AuthModal from '../components/AuthModal/AuthModal';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth modal state
  const [authModalState, setAuthModalState] = useState({
    isOpen: false,
    title: 'Login Required',
    message: 'You are not registered or logged in. Please log in or create an account to access this feature.',
    redirectPath: ''
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const res = await axios.post('/api/auth/login', credentials);
    if (res.data && res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await axios.post('/api/auth/register', userData);
    if (res.data && res.data.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {}
    setUser(null);
  };

  const openAuthModal = ({ title, message, redirectPath } = {}) => {
    setAuthModalState({
      isOpen: true,
      title: title || 'Login Required',
      message: message || 'You are not registered or logged in. Please log in or create an account to access this feature.',
      redirectPath: redirectPath || window.location.pathname
    });
  };

  const closeAuthModal = () => {
    setAuthModalState(prev => ({ ...prev, isOpen: false }));
  };

  const requireAuth = (action, redirectPath, customMessage) => {
    if (user) {
      if (typeof action === 'function') action();
      return true;
    } else {
      openAuthModal({
        message: customMessage || 'You are not registered or logged in. Please log in or create an account to access this feature.',
        redirectPath: redirectPath || window.location.pathname
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      requireAuth,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
      <AuthModal
        isOpen={authModalState.isOpen}
        onClose={closeAuthModal}
        title={authModalState.title}
        message={authModalState.message}
        redirectPath={authModalState.redirectPath}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
