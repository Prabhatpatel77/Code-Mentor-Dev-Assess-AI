import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, BookOpen, Activity, Sparkles, Terminal } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();

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

        <nav className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
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
