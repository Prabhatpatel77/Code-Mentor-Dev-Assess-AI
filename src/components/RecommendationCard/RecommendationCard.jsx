import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Tag, ShieldAlert } from 'lucide-react';
import './RecommendationCard.css';

export default function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  const { topic = 'Arrays', difficulty = 'Easy', reason = '', explanation = '' } = recommendation;

  const diffClass = difficulty.includes('Easy') 
    ? 'badge-easy' 
    : difficulty.includes('Medium') 
    ? 'badge-medium' 
    : 'badge-hard';

  return (
    <div className="recommendation-card">
      <div className="recommendation-card-header">
        <div className="recommendation-icon-box">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="recommendation-title">Learning Coach Recommendation</h3>
          <span className="text-xs text-muted font-mono">Personalized Next Step</span>
        </div>
      </div>

      <div className="recommendation-target-box">
        <div className="recommendation-meta-row">
          <span className="text-sm font-mono" style={{ fontWeight: 600 }}>Target Topic:</span>
          <span className="badge badge-topic">
            <Tag size={12} style={{ color: 'var(--accent-indigo)' }} />
            {topic}
          </span>
          <span className="text-sm font-mono" style={{ fontWeight: 600 }}>Target Difficulty:</span>
          <span className={`badge ${diffClass}`}>
            {difficulty}
          </span>
        </div>

        <p className="recommendation-reason">
          <strong>Why this recommendation:</strong> {reason}
        </p>

        {explanation && explanation !== reason && (
          <div className="recommendation-explanation">
            {explanation}
          </div>
        )}
      </div>

      <div className="recommendation-action-row">
        <Link
          to={`/problems?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty.split('/')[0])}`}
          className="btn-primary"
          style={{ backgroundColor: 'var(--accent-purple)' }}
        >
          <span>Practice {topic} Problems</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
