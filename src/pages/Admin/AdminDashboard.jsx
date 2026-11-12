import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Users, Code2, CheckCircle2, TrendingUp, BarChart3, AlertCircle, ArrowRight } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/admin/overview');
        if (res.data && res.data.overview) {
          setData(res.data.overview);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load administrative overview.');
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading platform analytics...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '1rem' }}>
        <div className="card" style={{ borderColor: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={22} />
          <span>{error || 'Failed to load platform analytics'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Platform Overview</h1>
          <p className="admin-subtitle">Administrator analytics and learner activity metrics</p>
        </div>
        <Link to="/admin/students" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} />
          <span>Manage Students</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Top Stats Metrics Grid */}
      <div className="admin-stats-grid">
        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>
            <Users size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Total Registered Students</span>
            <div className="admin-stat-value">{data.totalStudents}</div>
            <span className="admin-stat-sub">{data.activeStudents} active learners</span>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Solved Submissions</span>
            <div className="admin-stat-value">{data.solvedSubmissions}</div>
            <span className="admin-stat-sub">Out of {data.totalSubmissions} total submissions</span>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
            <TrendingUp size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Platform Success Rate</span>
            <div className="admin-stat-value">{data.overallSuccessRate}%</div>
            <span className="admin-stat-sub">Overall submission accuracy</span>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Code2 size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Available Problems</span>
            <div className="admin-stat-value">{data.totalProblems}</div>
            <span className="admin-stat-sub">Coding challenges in database</span>
          </div>
        </div>
      </div>

      {/* Top Attempted Problems */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} style={{ color: 'var(--accent-indigo)' }} />
          <span>Most Attempted Challenges</span>
        </h2>

        {data.topAttemptedProblems && data.topAttemptedProblems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.topAttemptedProblems.map((prob, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>{prob.title}</span>
                </div>
                <span className="badge badge-topic" style={{ fontSize: '0.8rem' }}>
                  {prob.attempts} submission{prob.attempts !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
            No problem submissions recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
