import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, BookOpen, Activity, Sparkles, Terminal, Menu, X, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout, requireAuth } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: Code2, public: true },
    { path: '/problems', label: 'Problems', icon: BookOpen, public: true },
    { path: '/progress', label: 'Learning Coach', icon: Sparkles, protected: true },
    { path: '/status', label: 'System Health', icon: Activity, public: true }
  ];

  const handleNavClick = (e, item) => {
    if (item.protected && !user) {
      e.preventDefault();
      requireAuth(() => {}, item.path, 'You must be logged in to view your personalized Learning Coach & Dashboard.');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <Terminal size={22} />
          </div>
          <div>
            <span className="brand-title">CodeMentorAI</span>
            <span className="brand-subtitle">ASSESSMENT PLATFORM</span>
          </div>
        </Link>

        <div className="navbar-right-controls">
          <button
            onClick={toggleTheme}
            className="btn-theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button 
            className="navbar-burger" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <nav id="mobile-menu" className={`navbar-nav ${isMenuOpen ? 'open' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path)) || 
              (item.path === '/progress' && location.pathname === '/dashboard');
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={(e) => handleNavClick(e, item)}
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="navbar-auth-section">
            {user ? (
              <div className="navbar-user-menu">
                <span className="user-badge" title={user.email}>
                  <User size={14} />
                  <span>{user.name || user.email}</span>
                </span>
                <button onClick={logout} className="btn-logout" title="Log Out">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="navbar-guest-actions">
                <Link to="/login" className="nav-link nav-link-login">
                  <LogIn size={15} />
                  <span>Log In</span>
                </Link>
                <Link to="/register" className="btn-nav-register">
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
