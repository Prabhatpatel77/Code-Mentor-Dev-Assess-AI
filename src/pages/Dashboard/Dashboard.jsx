import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCoachProgress, getCoachTopics, getCoachRecommendation } from '../../services/coachService';
import ProgressSummary from '../../components/ProgressSummary/ProgressSummary';
import TopicPerformance from '../../components/TopicPerformance/TopicPerformance';
import RecommendationCard from '../../components/RecommendationCard/RecommendationCard';
import { Sparkles, RefreshCw, AlertCircle, Code2, ArrowRight } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const [topics, setTopics] = useState([]);
  const [recommendation, setRecommendation] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [progRes, topicsRes, recRes] = await Promise.all([
        getCoachProgress(),
        getCoachTopics(),
        getCoachRecommendation()
      ]);

      if (progRes && progRes.success) {
        setProgress(progRes.progress);
      }
      if (topicsRes && topicsRes.success) {
        setTopics(topicsRes.topics || []);
      }
      if (recRes && recRes.success) {
        setRecommendation(recRes.recommendation);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError('Unable to load your learning progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="card dashboard-header-card">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={24} style={{ color: 'var(--accent-purple)' }} />
            <span>Learning Coach Dashboard</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Deterministic progress analytics and rule-based learning recommendations.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="btn-secondary"
          style={{ padding: '0.45rem 0.85rem' }}
          title="Refresh Progress"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="dashboard-error-card">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="card dashboard-loading-card">
          Loading your progress...
        </div>
      ) : progress && progress.attempted === 0 ? (
        /* Empty state for new learner */
        <div className="card dashboard-empty-card">
          <div className="dashboard-empty-icon">
            <Code2 size={36} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
              No learning data yet.
            </h2>
            <p className="text-muted text-sm mt-1" style={{ maxWidth: '450px' }}>
              Solve your first problem to start tracking performance metrics, topic accuracy, and personalized AI coaching advice.
            </p>
          </div>
          <Link to="/problems" className="btn-primary" style={{ marginTop: '0.5rem' }}>
            <span>Explore Coding Challenges</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        /* Active Dashboard */
        <>
          <ProgressSummary progress={progress} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            <TopicPerformance topics={topics} />
            <RecommendationCard recommendation={recommendation} />
          </div>
        </>
      )}
    </div>
  );
}
