import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal({
        message: 'You are not registered or logged in. Please log in or create an account to access this feature.',
        redirectPath: window.location.pathname
      });
    }
  }, [user, loading, openAuthModal]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        Verifying session...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Login Required</h2>
        <p>You are not registered or logged in. Please log in or create an account to access this feature.</p>
      </div>
    );
  }

  return children;
}
