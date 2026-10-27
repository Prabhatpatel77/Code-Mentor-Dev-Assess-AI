import React from 'react';
import { Link } from 'react-router-dom';
import HealthStatusCard from '../../components/HealthStatusCard/HealthStatusCard';
import { Code2, Sparkles, ShieldCheck, Terminal, ArrowRight, Lightbulb, BarChart3 } from 'lucide-react';
import './Home.css';

export default function Home() {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.2)', marginBottom: '1rem', padding: '0.4rem 0.8rem' }}>
          <Sparkles size={14} />
          <span>AI Coding Assessment Platform</span>
        </div>
        
        <h1 className="hero-title">
          Master Algorithms with <br />
          <span className="hero-gradient-text">
            Adaptive AI Guidance & Reviews
          </span>
        </h1>

        <p className="hero-description">
          Write JavaScript code, run test cases, request progressive adaptive hints, and receive automated code reviews and learning coaching tailored to your progress.
        </p>

        <div className="hero-actions">
          <Link to="/problems" className="btn-primary">
            <Code2 size={18} />
            <span>Explore Coding Problems</span>
            <ArrowRight size={16} />
          </Link>
          <Link to="/status" className="btn-secondary">
            <Terminal size={18} />
            <span>System Architecture Status</span>
          </Link>
        </div>
      </div>

      {/* Core Capabilities */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lightbulb size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>4-Level Adaptive Hints</h3>
          <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
            Progressive guidance from Conceptual → Approach → Code Structure → Debugging without spoiling solutions early.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Automated Code Review</h3>
          <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
            Evaluates correctness, code quality & style, execution performance, and common security concerns.
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart3 size={20} />
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Learning Coach</h3>
          <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
            Tracks problems solved, topic performance, and provides rule-based recommendations for growth.
          </p>
        </div>
      </div>

      {/* System Health Overview */}
      <HealthStatusCard />
    </div>
  );
}
