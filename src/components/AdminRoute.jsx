import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-muted)', fontFamily: 'sans-serif' }}>
        Verifying permissions...
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ maxWidth: '500px', margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
        <div className="card" style={{ borderColor: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.08)', color: 'var(--text-main)', padding: '2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '1rem', backgroundColor: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <ShieldAlert size={26} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
            Administrator privileges are required to view this page. If you are an administrator, please log in with your admin account.
          </p>
          <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
