import React from 'react';
import { Lightbulb, Sparkles, AlertCircle } from 'lucide-react';
import './HintSection.css';

const LEVEL_LABELS = {
  1: 'Level 1 — Conceptual',
  2: 'Level 2 — Approach',
  3: 'Level 3 — Code Structure',
  4: 'Level 4 — Debugging'
};

export default function HintSection({ onRequestHint, loading, error, currentNextLevel }) {
  const level = Math.min(Math.max(currentNextLevel || 1, 1), 4);
  const isLevel4 = level === 4;

  return (
    <div className="hint-section-card">
      <div className="hint-section-header">
        <div className="hint-section-title">
          <Lightbulb size={20} style={{ color: 'var(--accent-amber)' }} />
          <span>Adaptive Hint Agent</span>
        </div>
        <span className="hint-level-badge">
          {isLevel4 ? 'Level 4: Debugging' : `Next: Level ${level}`}
        </span>
      </div>

      <div className="hint-description">
        {isLevel4 ? (
          <p>
            You are currently at <strong>Level 4 — Debugging</strong>.
            Hints analyze your code and test results to identify errors without revealing the full solution.
          </p>
        ) : (
          <p>
            You are currently requesting <strong>{LEVEL_LABELS[level] || 'Level 1'}</strong>.
            Hints provide progressive guidance without spoiling the solution.
          </p>
        )}
      </div>

      {error && (
        <div className="hint-error-message">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={onRequestHint}
        disabled={loading}
        className="btn-hint"
      >
        <Sparkles size={16} className={loading ? 'animate-spin' : ''} />
        <span>
          {loading 
            ? 'Generating hint...' 
            : `Get Hint (${LEVEL_LABELS[level] || 'Level 1'})`
          }
        </span>
      </button>
    </div>
  );
}
