import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X } from 'lucide-react';
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, title, message, redirectPath }) {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login', { state: { from: redirectPath } });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register', { state: { from: redirectPath } });
  };

  return (
    <div className="auth-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close dialog">
          <X size={20} />
        </button>

        <div className="auth-modal-header">
          <div className="auth-modal-icon-wrapper">
            <Lock size={22} className="auth-modal-icon" />
          </div>
          <h2 className="auth-modal-title">{title || 'Login Required'}</h2>
        </div>

        <p className="auth-modal-message">
          {message || 'You are not registered or logged in. Please log in or create an account to access this feature.'}
        </p>

        <div className="auth-modal-actions">
          <button className="btn-auth-primary" onClick={handleLogin}>
            <LogIn size={16} />
            <span>Login</span>
          </button>
          <button className="btn-auth-secondary" onClick={handleRegister}>
            <UserPlus size={16} />
            <span>Register</span>
          </button>
          <button className="btn-auth-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
