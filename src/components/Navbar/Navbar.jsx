import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, BookOpen, Activity, Sparkles, Terminal, Menu, X } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const navItems = [
    { path: '/', label: 'Home', icon: Code2 },
    { path: '/problems', label: 'Problems', icon: BookOpen },
    { path: '/progress', label: 'Learning Coach', icon: Sparkles },
    { path: '/status', label: 'System Health', icon: Activity }
  ];

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

        <button 
          className="navbar-burger" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

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
                className={`nav-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

