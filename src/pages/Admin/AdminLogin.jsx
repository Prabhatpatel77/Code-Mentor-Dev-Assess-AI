import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import '../Login/Login.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your administrator email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Authenticate
      const resData = await login({ email, password });
      
      if (resData && resData.user) {
        if (resData.user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          setError('This account does not have administrator access.');
        }
      } else {
        setError('Failed to authenticate administrator account.');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('This account does not have administrator access.');
      } else {
        setError(err.response?.data?.message || 'Invalid admin credentials. Please verify your email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ borderColor: 'var(--accent-indigo)' }}>
        <div className="auth-card-header">
          <div className="auth-card-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
            <ShieldCheck size={26} />
          </div>
          <h1 className="auth-card-title">Admin Portal</h1>
          <p className="auth-card-subtitle">Platform Administrator Sign In</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="admin-email">Admin Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                id="admin-email"
                type="email"
                placeholder="admin@codementor.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" style={{ backgroundColor: 'var(--accent-indigo)' }} disabled={loading}>
            <span>{loading ? 'Authenticating Admin...' : 'Sign In to Admin Portal'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Protected Administrator Control Center. Unauthorized access attempts are audited.
          </p>
        </div>
      </div>
    </div>
  );
}
