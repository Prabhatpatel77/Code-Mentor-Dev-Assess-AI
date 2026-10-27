import React from 'react';
import './HintHistory.css';

const LEVEL_NAMES = {
  1: 'Level 1 — Conceptual',
  2: 'Level 2 — Approach',
  3: 'Level 3 — Code Structure',
  4: 'Level 4 — Debugging'
};

export default function HintHistory({ hints = [] }) {
  if (!hints || hints.length === 0) return null;

  return (
    <div className="hint-history-container">
      <div className="hint-history-title">Hint History</div>
      <div className="hint-history-list">
        {hints.map((item, index) => (
          <div key={index} className="hint-history-card">
            <div className="hint-history-level-tag">
              {LEVEL_NAMES[item.level] || `Level ${item.level}`}
            </div>
            <div className="hint-history-content">
              {item.hint}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
