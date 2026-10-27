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
  const isMaxReached = currentNextLevel > 4;

  return (
    <div className="hint-section-card">
      <div className="hint-section-header">
        <div className="hint-section-title">
          <Lightbulb size={20} style={{ color: 'var(--accent-amber)' }} />
          <span>Adaptive Hint Agent</span>
        </div>
        <span className="hint-level-badge">
          {isMaxReached ? 'Max Level Reached' : `Next: Level ${currentNextLevel}`}
        </span>
      </div>

      <div className="hint-description">
        {isMaxReached ? (
          <p>You have received all available hint levels (1 to 4) for this problem.</p>
        ) : (
          <p>
            You are currently requesting <strong>{LEVEL_LABELS[currentNextLevel] || 'Level 1'}</strong>.
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
        disabled={loading || isMaxReached}
        className="btn-hint"
      >
        <Sparkles size={16} className={loading ? 'animate-spin' : ''} />
        <span>
          {loading 
            ? 'Generating hint...' 
            : isMaxReached 
            ? 'All Hints Unlocked' 
            : `Get Hint (${LEVEL_LABELS[currentNextLevel] || 'Level 1'})`
          }
        </span>
      </button>
    </div>
  );
}
