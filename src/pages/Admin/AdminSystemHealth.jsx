import React, { useState, useEffect } from 'react';
import HealthStatusCard from '../../components/HealthStatusCard/HealthStatusCard';
import { Activity, Terminal, Server, ShieldCheck, Database, Cpu, RefreshCw } from 'lucide-react';
import '../Status/Status.css';

export default function AdminSystemHealth() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/system/health', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
    } catch (err) {
      console.error('Failed to fetch admin system health', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminHealth();
  }, []);

  return (
    <div className="status-container" style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity size={24} style={{ color: 'var(--accent-emerald)' }} />
            <span>Admin System Health & Architecture</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Real-time inspection of micro-service endpoints, database connectivity state, and AI Service integration.
          </p>
        </div>
        <button 
          onClick={fetchAdminHealth}
          className="btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Primary Health Status */}
      <HealthStatusCard />

      {/* Administrative System Details */}
      {healthData && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-indigo)', marginBottom: '0.5rem' }}>
              <Server size={20} />
              <h3 style={{ fontWeight: 600 }}>Backend Server</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: <strong style={{ color: 'var(--accent-emerald)' }}>{healthData.expressStatus || 'Operational'}</strong></p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Uptime: <strong>{healthData.uptime ? `${Math.floor(healthData.uptime / 60)} min` : 'N/A'}</strong></p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-purple)', marginBottom: '0.5rem' }}>
              <Cpu size={20} />
              <h3 style={{ fontWeight: 600 }}>Python AI Service</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status: <strong style={{ color: healthData.aiServiceStatus === 'online' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>{healthData.aiServiceStatus || 'Healthy'}</strong></p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Model: <strong>Gemini 2.5 Flash</strong></p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', marginBottom: '0.5rem' }}>
              <Database size={20} />
              <h3 style={{ fontWeight: 600 }}>Persistence Layer</h3>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Database: <strong style={{ color: 'var(--accent-emerald)' }}>{healthData.dbState || 'Connected'}</strong></p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Storage Engine: <strong>MongoDB / Mongoose</strong></p>
          </div>
        </div>
      )}

      {/* Architecture Topology Details */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Terminal size={20} style={{ color: 'var(--accent-indigo)' }} />
          <span>System Topology & Request Lifecycle</span>
        </h2>

        <div className="topology-grid">
          <div className="topology-box">
            <span style={{ color: 'var(--accent-indigo)', fontWeight: 'bold' }}>1. Client SPA → Express Backend</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              React SPA dispatches authenticated requests to Express endpoints (<code className="text-main">/api/problems</code>, <code className="text-main">/api/submissions</code>, <code className="text-main">/api/admin</code>).
            </p>
          </div>

          <div className="topology-box">
            <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>2. Express Backend → AI Agent Service</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              Express proxies LLM requests to Python FastAPI microservice running Gemini agent workflows.
            </p>
          </div>

          <div className="topology-box">
            <span style={{ color: 'var(--accent-emerald)', fontWeight: 'bold' }}>3. Multi-Agent Hint & Solution Pipeline</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              Hint Agent provides progressive guidance; Solution Generator delivers verified JavaScript solutions.
            </p>
          </div>

          <div className="topology-box">
            <span style={{ color: 'var(--accent-amber)', fontWeight: 'bold' }}>4. Database & RBAC Layer</span>
            <p className="text-muted" style={{ fontSize: '0.8rem', fontFamily: 'sans-serif', lineHeight: 1.5 }}>
              User profiles, JWT session state, code execution results, and hint telemetry are persisted with MongoDB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
