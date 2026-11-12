import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Award, CheckCircle2, Lightbulb, AlertCircle, History, FileCode } from 'lucide-react';
import './AdminDashboard.css';

export default function StudentDetailReport() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadReport() {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/admin/students/${id}/progress`);
        if (res.data && res.data.report) {
          setData(res.data.report);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load individual student report.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading learner progress report...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ maxWidth: '800px', margin: '3rem auto', padding: '1rem' }}>
        <div className="card" style={{ borderColor: 'var(--accent-rose)', backgroundColor: 'rgba(244, 63, 94, 0.1)', color: '#fda4af', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertCircle size={22} />
          <span>{error || 'Student report not found'}</span>
        </div>
        <Link to="/admin/students" className="btn-secondary">
          <ArrowLeft size={16} /> Back to Student Roster
        </Link>
      </div>
    );
  }

  const { student, metrics, recentSubmissions } = data;

  return (
    <div className="admin-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/admin/students" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Student Management</span>
        </Link>
      </div>

      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>{student.name}</h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{student.email} • Registered {new Date(student.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        <span className="badge badge-topic" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}>
          Student Account
        </span>
      </div>

      {/* Metrics Row */}
      <div className="admin-stats-grid">
        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Solved Problems</span>
            <div className="admin-stat-value">{metrics.solved}</div>
            <span className="admin-stat-sub">Out of {metrics.attempted} attempted</span>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>
            <Award size={22} />
          </div>
          <div>
            <span className="admin-stat-label">Solving Accuracy</span>
            <div className="admin-stat-value">{metrics.accuracy}%</div>
            <span className="admin-stat-sub">{metrics.totalSubmissions} total submission attempts</span>
          </div>
        </div>

        <div className="card admin-stat-card">
          <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
            <Lightbulb size={22} />
          </div>
          <div>
            <span className="admin-stat-label">AI Hints Requested</span>
            <div className="admin-stat-value">{metrics.totalHints}</div>
            <span className="admin-stat-sub">{metrics.totalReveals} solution reveals</span>
          </div>
        </div>
      </div>

      {/* Recent Submissions */}
      <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={20} style={{ color: 'var(--accent-indigo)' }} />
          <span>Recent Submissions History</span>
        </h2>

        {recentSubmissions && recentSubmissions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentSubmissions.map((sub, idx) => (
              <div key={idx} style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-input)', borderRadius: '0.5rem', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileCode size={18} style={{ color: 'var(--accent-indigo)' }} />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)' }}>Problem #{sub.problemId}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(sub.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.passedTests}/{sub.totalTests} Tests Passed</span>
                  <span className={`badge ${sub.status === 'Accepted' ? 'badge-easy' : 'badge-hard'}`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic', padding: '1rem 0' }}>
            No submission attempts recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
