import React from 'react';
import { BarChart2 } from 'lucide-react';
import './TopicPerformance.css';

export default function TopicPerformance({ topics = [] }) {
  if (!topics || topics.length === 0) return null;

  return (
    <div className="topic-performance-card">
      <div className="topic-performance-title">
        <BarChart2 size={18} style={{ color: 'var(--accent-indigo)' }} />
        <span>Topic Performance Breakdown</span>
      </div>

      <div className="topic-list-grid">
        {topics.map((t) => {
          const acc = t.accuracy || 0;
          let barClass = 'bar-indigo';
          if (t.attempted === 0) {
            barClass = 'bar-indigo';
          } else if (acc >= 80) {
            barClass = 'bar-green';
          } else if (acc >= 50) {
            barClass = 'bar-amber';
          } else {
            barClass = 'bar-red';
          }

          return (
            <div key={t.topic} className="topic-row">
              <div className="topic-row-header">
                <span className="topic-name">{t.topic}</span>
                <span className="topic-stats">
                  {t.attempted > 0 ? (
                    <span>
                      {t.solved} / {t.attempted} solved &bull; <strong>{acc}%</strong>
                    </span>
                  ) : (
                    <span>Not attempted yet</span>
                  )}
                </span>
              </div>

              <div className="topic-progress-track">
                <div
                  className={`topic-progress-bar ${barClass}`}
                  style={{ width: `${t.attempted > 0 ? Math.max(acc, 4) : 0}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
