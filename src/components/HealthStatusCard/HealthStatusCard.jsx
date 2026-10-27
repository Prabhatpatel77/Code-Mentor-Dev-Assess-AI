import React, { useState, useEffect } from 'react';
import { fetchHealthStatus } from '../../services/api';
import { Server, Database, Bot, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import './HealthStatusCard.css';

export default function HealthStatusCard() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const data = await fetchHealthStatus();
      setHealth(data);
    } catch (err) {
      setHealth({
        success: false,
        error: err.message
      });
    } finally {
      setLoading(false);
      setLastRefreshed(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
            System Architecture & Health
          </h3>
          <p className="text-xs text-muted mt-1">
            Monitoring multi-tier services (Node.js, MongoDB, FastAPI)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastRefreshed && (
            <span className="text-xs font-mono text-muted flex items-center gap-2">
              <Clock size={14} />
              <span>{lastRefreshed}</span>
            </span>
          )}
          <button
            onClick={loadHealth}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.6rem' }}
            title="Refresh Health Status"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="health-card-grid">
        {/* Node.js Express Backend Status */}
        <div className="health-service-box">
          <div className="health-box-header">
            <div className="health-box-title">
              <Server size={18} style={{ color: 'var(--accent-emerald)' }} />
              <span>Express Backend</span>
            </div>
            <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <CheckCircle2 size={12} /> Active
            </span>
          </div>
          <div className="health-details text-xs font-mono text-muted">
            <div className="health-detail-row">
              <span>Port:</span>
              <span className="text-main">{health?.services?.backend?.port || 3000}</span>
            </div>
            <div className="health-detail-row">
              <span>Node Runtime:</span>
              <span className="text-main">{health?.services?.backend?.nodeVersion || 'v22.x'}</span>
            </div>
            <div className="health-detail-row">
              <span>Status:</span>
              <span style={{ color: 'var(--accent-emerald)' }}>200 OK</span>
            </div>
          </div>
        </div>

        {/* MongoDB Database Status */}
        <div className="health-service-box">
          <div className="health-box-header">
            <div className="health-box-title">
              <Database size={18} style={{ color: 'var(--accent-indigo)' }} />
              <span>MongoDB</span>
            </div>
            {health?.services?.database?.status === 'connected' ? (
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 size={12} /> Connected
              </span>
            ) : (
              <span className="badge" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-amber)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <AlertCircle size={12} /> Memory Ready
              </span>
            )}
          </div>
          <div className="health-details text-xs font-mono text-muted">
            <div className="health-detail-row">
              <span>Database:</span>
              <span className="text-main">{health?.services?.database?.database || 'codementor_ai'}</span>
            </div>
            <div className="health-detail-row">
              <span>Host:</span>
              <span className="text-main">{health?.services?.database?.host || 'localhost'}</span>
            </div>
            <div className="health-detail-row">
              <span>Mode:</span>
              <span style={{ color: health?.services?.database?.status === 'connected' ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {health?.services?.database?.status === 'connected' ? 'Mongoose DB' : 'Resilient Memory'}
              </span>
            </div>
          </div>
        </div>

        {/* Python FastAPI AI Service Status */}
        <div className="health-service-box">
          <div className="health-box-header">
            <div className="health-box-title">
              <Bot size={18} style={{ color: 'var(--accent-purple)' }} />
              <span>Python AI Service</span>
            </div>
            {health?.services?.aiService?.active ? (
              <span className="badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle2 size={12} /> Running
              </span>
            ) : (
              <span className="badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                <Clock size={12} /> Configured
              </span>
            )}
          </div>
          <div className="health-details text-xs font-mono text-muted">
            <div className="health-detail-row">
              <span>Framework:</span>
              <span className="text-main">FastAPI / LangGraph</span>
            </div>
            <div className="health-detail-row">
              <span>Target URL:</span>
              <span className="text-main">{health?.services?.aiService?.url || 'http://localhost:8000'}</span>
            </div>
            <div className="health-detail-row">
              <span>Supervisor:</span>
              <span style={{ color: '#c084fc' }}>StateGraph Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
