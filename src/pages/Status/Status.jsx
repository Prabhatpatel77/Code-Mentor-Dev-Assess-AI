import React from 'react';
import HealthStatusCard from '../../components/HealthStatusCard/HealthStatusCard';
import { Activity, Terminal } from 'lucide-react';
import './Status.css';

export default function Status() {
  return (
    <div className="status-container">
      {/* Header */}
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity size={24} style={{ color: 'var(--accent-emerald)' }} />
          <span>System Health & Architecture Status</span>
        </h1>
        <p className="text-muted text-sm mt-1">
          Real-time inspection of micro-service endpoints, database connection state, and AI Service integration.
        </p>
      </div>

      {/* Status Card */}
      <HealthStatusCard />

      {/* Architecture Topology Details */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Terminal size={20} style={{ color: 'var(--accent-indigo)' }} />
          <span>Service Communication Topology</span>
        </h2>

        <div className="topology-grid">
          <div className="topology-box">
            <span style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}>1. Frontend → Express Backend</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              React SPA interacts with Express backend at <code className="text-main">/api/problems</code>, <code className="text-main">/api/submissions</code>, and <code className="text-main">/api/ai</code>.
            </p>
          </div>

          <div className="topology-box">
            <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>2. Express Backend → Python AI Service</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              Express dispatches HTTP POST payloads to Python FastAPI on port <code className="text-main">8000</code> (<code className="text-main">/api/supervisor/process</code>).
            </p>
          </div>

          <div className="topology-box">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>3. Python FastAPI → LangGraph StateGraph</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              FastAPI passes state to LangGraph Supervisor router, which invokes Hint, Review, and Coach Agents.
            </p>
          </div>

          <div className="topology-box">
            <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>4. Backend → MongoDB</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              Mongoose models save problem definitions, user code submissions, and learner progress metrics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
