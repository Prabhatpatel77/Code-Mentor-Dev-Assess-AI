import React from 'react';
import { Target, CheckCircle2, XCircle, Percent, Lightbulb, FileCode2, Eye } from 'lucide-react';
import './ProgressSummary.css';

export default function ProgressSummary({ progress }) {
  if (!progress) return null;

  const { 
    attempted = 0, 
    solved = 0, 
    failed = 0, 
    accuracy = 0, 
    totalSubmissions = 0,
    hintsUsed = 0,
    hintsByLevel = { level1: 0, level2: 0, level3: 0, level4: 0 },
    solutionReveals = 0,
    averageHints = 0
  } = progress;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
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
          <span className="progress-stat-sub">{failed > 0 ? `${failed} pending / failed` : 'All attempted solved'}</span>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-header">
            <span>Solving Accuracy</span>
            <Percent size={18} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div className="progress-stat-value" style={{ color: '#c084fc' }}>
            {accuracy}%
          </div>
          <span className="progress-stat-sub">{totalSubmissions} total code runs</span>
        </div>

        <div className="progress-stat-card">
          <div className="progress-stat-header">
            <span>Hints & Solution Reveals</span>
            <Lightbulb size={18} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div className="progress-stat-value" style={{ color: 'var(--accent-amber)' }}>
            {hintsUsed}
          </div>
          <span className="progress-stat-sub">{solutionReveals} complete solution reveals</span>
        </div>
      </div>

      {/* Detail breakdown bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileCode2 size={16} style={{ color: 'var(--accent-indigo)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Submissions:</span>
            <strong style={{ color: 'var(--text-main)' }}>{totalSubmissions} runs</strong>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Hint Progression:</span>
            <span className="badge" style={{ backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--accent-indigo)' }}>L1: {hintsByLevel.level1}</span>
            <span className="badge" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: 'var(--accent-purple)' }}>L2: {hintsByLevel.level2}</span>
            <span className="badge" style={{ backgroundColor: 'rgba(234, 179, 8, 0.15)', color: 'var(--accent-amber)' }}>L3: {hintsByLevel.level3}</span>
            <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)' }}>L4: {hintsByLevel.level4}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Eye size={16} style={{ color: 'var(--accent-amber)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Full Solutions:</span>
            <strong style={{ color: 'var(--accent-amber)' }}>{solutionReveals} revealed</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
