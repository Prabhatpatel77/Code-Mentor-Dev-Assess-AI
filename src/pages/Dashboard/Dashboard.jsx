import React, { useState, useEffect } from 'react';
import { requestCoachRecommendations } from '../../services/api';
import { Sparkles, Trophy, Lightbulb, Target, BarChart2, Bot } from 'lucide-react';
import './Dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);

  const progressData = {
    attemptedCount: 3,
    solvedCount: 2,
    hintsUsedTotal: 4,
    topicPerformance: [
      { topic: 'Arrays', attempted: 2, solved: 1, accuracy: 50 },
      { topic: 'Strings', attempted: 1, solved: 1, accuracy: 100 },
      { topic: 'HashMap', attempted: 0, solved: 0, accuracy: 0 },
      { topic: 'Two Pointers', attempted: 0, solved: 0, accuracy: 0 }
    ]
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await requestCoachRecommendations(progressData);
      setRecommendations(res.data?.response || res.data?.learner_progress || 'Coach recommendations requested.');
    } catch (err) {
      setRecommendations(`Coach error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="card" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={24} style={{ color: 'var(--accent-purple)' }} />
            <span>Learning Coach Dashboard</span>
          </h1>
          <p className="text-muted text-sm mt-1">
            Personalized progress analytics and rule-based learning recommendations.
          </p>
        </div>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="btn-primary"
          style={{ backgroundColor: 'var(--accent-purple)' }}
        >
          <Bot size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Coach Advice</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid-3">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-mono" style={{ fontWeight: 600, textTransform: 'uppercase' }}>Attempted / Solved</span>
            <Trophy size={20} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {progressData.solvedCount} <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>/ {progressData.attemptedCount} Solved</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-mono" style={{ fontWeight: 600, textTransform: 'uppercase' }}>Hints Requested</span>
            <Lightbulb size={20} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {progressData.hintsUsedTotal} <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>Hints</span>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div className="flex justify-between items-center text-muted">
            <span className="text-xs font-mono" style={{ fontWeight: 600, textTransform: 'uppercase' }}>Overall Accuracy</span>
            <Target size={20} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
            {Math.round((progressData.solvedCount / progressData.attemptedCount) * 100)}%
          </div>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <BarChart2 size={20} style={{ color: 'var(--accent-indigo)' }} />
          <span>Topic Performance Breakdown</span>
        </h2>

        <div className="topic-perf-grid">
          {progressData.topicPerformance.map((tp) => (
            <div key={tp.topic} className="topic-perf-card">
              <div className="flex justify-between items-center text-sm">
                <span style={{ fontWeight: 600 }}>{tp.topic}</span>
                <span className="text-xs font-mono text-muted">{tp.solved} / {tp.attempted} solved</span>
              </div>
              <div className="topic-progress-bar-bg">
                <div
                  className="topic-progress-bar-fill"
                  style={{ width: `${tp.accuracy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Coach Recommendation Box */}
      <div className="card" style={{ borderColor: 'rgba(168, 85, 247, 0.4)' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
          <div style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex' }}>
            <Bot size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Learning Coach Recommendation</h2>
            <p className="text-muted text-xs">Rule-based assessment feedback based on topic accuracy</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '0.75rem', padding: '1rem', fontSize: '0.9rem', fontFamily: 'monospace', color: '#e9d5ff', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {recommendations ? (
            typeof recommendations === 'string' ? recommendations : JSON.stringify(recommendations, null, 2)
          ) : (
            'Rule-based recommendation engine active: Low performance in Arrays detected → Recommend focusing on Array & Two-Pointer practice.'
          )}
        </div>
      </div>
    </div>
  );
}
