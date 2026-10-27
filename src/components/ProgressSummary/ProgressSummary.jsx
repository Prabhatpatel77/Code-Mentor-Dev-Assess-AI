import React from 'react';
import { Target, CheckCircle2, Lightbulb, Percent } from 'lucide-react';
import './ProgressSummary.css';

export default function ProgressSummary({ progress }) {
  if (!progress) return null;

  const { attempted = 0, solved = 0, accuracy = 0, averageHints = 0 } = progress;

  return (
    <div className="progress-summary-grid">
      <div className="progress-stat-card">
        <div className="progress-stat-header">
          <span>Problems Attempted</span>
          <Target size={18} style={{ color: 'var(--accent-indigo)' }} />
        </div>
        <div className="progress-stat-value">
          {attempted}
        </div>
        <span className="progress-stat-sub">Total unique challenges tried</span>
      </div>

      <div className="progress-stat-card">
        <div className="progress-stat-header">
          <span>Problems Solved</span>
          <CheckCircle2 size={18} style={{ color: 'var(--accent-emerald)' }} />
        </div>
        <div className="progress-stat-value" style={{ color: 'var(--accent-emerald)' }}>
          {solved}
        </div>
        <span className="progress-stat-sub">Accepted solutions</span>
      </div>

      <div className="progress-stat-card">
        <div className="progress-stat-header">
          <span>Overall Accuracy</span>
          <Percent size={18} style={{ color: 'var(--accent-purple)' }} />
        </div>
        <div className="progress-stat-value" style={{ color: '#c084fc' }}>
          {accuracy}%
        </div>
        <span className="progress-stat-sub">Solved / Attempted ratio</span>
      </div>

      <div className="progress-stat-card">
        <div className="progress-stat-header">
          <span>Hint Dependency</span>
          <Lightbulb size={18} style={{ color: 'var(--accent-amber)' }} />
        </div>
        <div className="progress-stat-value" style={{ color: 'var(--accent-amber)' }}>
          {averageHints}
        </div>
        <span className="progress-stat-sub">Average hints per problem</span>
      </div>
    </div>
  );
}
